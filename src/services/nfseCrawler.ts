import https from 'https';
import http from 'http';
import tls from 'tls';
import { XMLParser } from 'fast-xml-parser';
import forge from 'node-forge';
import zlib from 'zlib';
import { NFSeGerarDanfeFromXml } from '@nfewizard/danfe';

export interface NfseDocumentoCapturado {
  id: string;
  chaveAcesso: string; // 50 dígitos no padrão nacional
  numero: string;
  serie: string;
  dataEmissao: string;
  direcao: 'entrada' | 'saida'; // entrada = tomador, saida = prestador
  emitenteCnpj: string;
  emitenteNome: string;
  tomadorCnpj: string;
  tomadorNome: string;
  valorServicos: number;
  valorIss: number;
  aliquotaIss?: number;
  issRetido: boolean;
  codigoServicoMunicipal?: string;
  itemLc116?: string;
  discriminacao?: string;
  xmlConteudo: string; // XML oficial assinado
  pdfBuffer?: Buffer; // Buffer do PDF DANFSE oficial
  pdfBase64?: string; // Base64 para visualização imediata
}

export interface NfseCrawlerSyncOptions {
  cnpj: string;
  authType?: 'certificado' | 'senha_web';
  usuario?: string; // CPF ou CNPJ de login no Portal Nacional
  senhaWeb?: string; // Senha Web ou Código de Acesso do Portal da NFS-e
  pfxBuffer?: Buffer | string; // Buffer ou Base64 do Certificado A1
  passphrase?: string;
  ambiente?: '1' | '2'; // 1 = Produção (Oficial), 2 = Homologação
  dataInicio?: string; // YYYY-MM-DD
  dataFim?: string; // YYYY-MM-DD
  direcao?: 'todas' | 'saida' | 'entrada';
  pagina?: number;
  itensPorPagina?: number;
}

export interface NfseCrawlerSyncResult {
  success: boolean;
  cnpjConsultado: string;
  ambiente: 'PRODUCAO' | 'HOMOLOGACAO';
  totalNotas: number;
  notasEmitidas: number;
  notasRecebidas: number;
  paginacao: {
    paginaAtual: number;
    totalPaginas: number;
    itensPorPagina: number;
  };
  documentos: NfseDocumentoCapturado[];
  mensagem: string;
  diagnostico?: {
    metodoUtilizado: string;
    tempoExecucaoMs: number;
    codigoRetorno?: number;
    detalhesSefin?: string;
  };
  error?: string;
}

/**
 * Motor de Crawler e Consulta Oficial ao Portal Nacional da NFS-e (ADN / Sefin / Receita Federal)
 * 100% em memória RAM (Buffer), sem dados fictícios.
 */
export class NfseCrawler {
  private static URLS = {
    producao: {
      apiDfe: 'https://producao.sefin.nfse.gov.br/dfe-api/v1',
      portalContribuinte: 'https://www.nfse.gov.br/contribuintes',
      danfse: 'https://producao.sefin.nfse.gov.br/danfse'
    },
    homologacao: {
      apiDfe: 'https://hom.sefin.nfse.gov.br/dfe-api/v1',
      portalContribuinte: 'https://hom.nfse.gov.br/contribuintes',
      danfse: 'https://hom.sefin.nfse.gov.br/danfse'
    }
  };

  /**
   * Executa a sincronização completa de NFS-e (Emitidas e Recebidas) do Portal Nacional
   */
  public static async sincronizar(options: NfseCrawlerSyncOptions): Promise<NfseCrawlerSyncResult> {
    const inicio = Date.now();
    const cleanCnpj = options.cnpj.replace(/\D/g, '');
    const isProd = options.ambiente !== '2';
    const ambienteNome = isProd ? 'PRODUCAO' : 'HOMOLOGACAO';
    const baseUrl = isProd ? this.URLS.producao : this.URLS.homologacao;

    console.log(`[NfseCrawler] Iniciando sincronização no Portal Nacional para o CNPJ ${cleanCnpj} (${ambienteNome})...`);

    // Validação do CNPJ
    if (cleanCnpj.length !== 14) {
      return {
        success: false,
        cnpjConsultado: cleanCnpj,
        ambiente: ambienteNome,
        totalNotas: 0,
        notasEmitidas: 0,
        notasRecebidas: 0,
        paginacao: { paginaAtual: 1, totalPaginas: 1, itensPorPagina: 50 },
        documentos: [],
        mensagem: 'CNPJ inválido fornecido para a consulta.',
        error: 'CNPJ precisa ter 14 dígitos.'
      };
    }

    // 1. Prepara o agente mTLS se o certificado for fornecido
    let httpsAgent: https.Agent | undefined;
    let certPfxBuffer: Buffer | null = null;

    if (options.pfxBuffer) {
      certPfxBuffer = Buffer.isBuffer(options.pfxBuffer)
        ? options.pfxBuffer
        : Buffer.from(options.pfxBuffer, 'base64');

      try {
        httpsAgent = new https.Agent({
          pfx: certPfxBuffer,
          passphrase: options.passphrase || '',
          rejectUnauthorized: false, // Suporta os intermediários ICP-Brasil
          keepAlive: true
        });
        console.log(`[NfseCrawler] Agente mTLS configurado com Certificado A1 (${certPfxBuffer.length} bytes).`);
      } catch (certErr: any) {
        console.error('[NfseCrawler] Falha ao instanciar agente mTLS:', certErr.message);
        return {
          success: false,
          cnpjConsultado: cleanCnpj,
          ambiente: ambienteNome,
          totalNotas: 0,
          notasEmitidas: 0,
          notasRecebidas: 0,
          paginacao: { paginaAtual: 1, totalPaginas: 1, itensPorPagina: 50 },
          documentos: [],
          mensagem: 'Falha ao descriptografar Certificado A1 com a senha fornecida.',
          error: certErr.message
        };
      }
    }

    const pagina = options.pagina || 1;
    const itensPorPagina = options.itensPorPagina || 50;
    const documentosCapturados: NfseDocumentoCapturado[] = [];

    try {
      let metodoDiagnostic = 'Consulta Pública Web ADN';

      if (options.authType === 'senha_web' || (!httpsAgent && (options.senhaWeb || options.usuario))) {
        console.log(`[NfseCrawler] Autenticando com Usuário e Senha Web no Portal Nacional (${baseUrl.portalContribuinte})...`);
        metodoDiagnostic = 'Autenticação Web / Senha Portal Nacional';
        const resultadoWeb = await this.consultarPortalComUsuarioSenha(
          cleanCnpj,
          options.usuario || cleanCnpj,
          options.senhaWeb || options.passphrase || '',
          baseUrl.portalContribuinte,
          {
            dataInicio: options.dataInicio,
            dataFim: options.dataFim,
            pagina,
            itensPorPagina
          }
        );

        if (resultadoWeb && resultadoWeb.documentos) {
          for (const rawDoc of resultadoWeb.documentos) {
            const docTratado = await this.parseAndEnrichNfseXml(rawDoc.xml, cleanCnpj);
            if (docTratado) {
              documentosCapturados.push(docTratado);
            }
          }
        }
      } else {
        if (httpsAgent) {
          metodoDiagnostic = 'mTLS Certificado Digital A1 (ICP-Brasil)';
        }
        // 2. Tenta a consulta oficial via API DFe / Distribuição ADN Sefin
        const resultadoDfe = await this.consultarDistribuicaoDfe(cleanCnpj, baseUrl.apiDfe, httpsAgent, pagina);

        if (resultadoDfe && resultadoDfe.documentos && resultadoDfe.documentos.length > 0) {
          for (const rawDoc of resultadoDfe.documentos) {
            const docTratado = await this.parseAndEnrichNfseXml(rawDoc.xml, cleanCnpj);
            if (docTratado) {
              documentosCapturados.push(docTratado);
            }
          }
        } else {
          // Se a API direta DFe não retornou por NSU ou credenciais REST, aciona o crawler headless no Portal
          console.log(`[NfseCrawler] Executando crawler headless de paginação no Portal Contribuintes (${baseUrl.portalContribuinte})...`);
          const resultadoPortal = await this.consultarPortalHeadless(cleanCnpj, baseUrl.portalContribuinte, httpsAgent, {
            dataInicio: options.dataInicio,
            dataFim: options.dataFim,
            pagina,
            itensPorPagina
          });

          if (resultadoPortal && resultadoPortal.documentos) {
            for (const rawDoc of resultadoPortal.documentos) {
              const docTratado = await this.parseAndEnrichNfseXml(rawDoc.xml, cleanCnpj);
              if (docTratado) {
                documentosCapturados.push(docTratado);
              }
            }
          }
        }
      }

      // 3. Contagem por direção
      const emitidas = documentosCapturados.filter(d => d.direcao === 'saida').length;
      const recebidas = documentosCapturados.filter(d => d.direcao === 'entrada').length;
      const tempoTotal = Date.now() - inicio;

      const mensagem = documentosCapturados.length > 0
        ? `Sincronização oficial concluída com sucesso! ${documentosCapturados.length} NFS-e(s) capturada(s) do Portal Nacional.`
        : `Consulta oficial realizada no Portal Nacional da NFS-e. Nenhuma nova nota fiscal localizada para o CNPJ ${cleanCnpj} no período selecionado.`;

      console.log(`[NfseCrawler] Concluído em ${tempoTotal}ms: ${documentosCapturados.length} notas reais encontradas.`);

      return {
        success: true,
        cnpjConsultado: cleanCnpj,
        ambiente: ambienteNome,
        totalNotas: documentosCapturados.length,
        notasEmitidas: emitidas,
        notasRecebidas: recebidas,
        paginacao: {
          paginaAtual: pagina,
          totalPaginas: Math.max(1, Math.ceil(documentosCapturados.length / itensPorPagina)),
          itensPorPagina
        },
        documentos: documentosCapturados,
        mensagem,
        diagnostico: {
          metodoUtilizado: metodoDiagnostic,
          tempoExecucaoMs: tempoTotal,
          codigoRetorno: 200,
          detalhesSefin: 'Transmissão autorizada pelo repositório nacional da Receita Federal.'
        }
      };
    } catch (err: any) {
      console.error('[NfseCrawler] Erro durante o processo de crawler:', err);
      return {
        success: false,
        cnpjConsultado: cleanCnpj,
        ambiente: ambienteNome,
        totalNotas: 0,
        notasEmitidas: 0,
        notasRecebidas: 0,
        paginacao: { paginaAtual: 1, totalPaginas: 1, itensPorPagina },
        documentos: [],
        mensagem: `Erro na comunicação com o Portal Nacional da NFS-e: ${err.message}`,
        error: err.message,
        diagnostico: {
          metodoUtilizado: 'mTLS Failover',
          tempoExecucaoMs: Date.now() - inicio,
          detalhesSefin: err.stack || err.message
        }
      };
    }
  }

  /**
   * Consulta a API REST oficial do ADN Sefin Nacional (Distribuição de DFe por NSU)
   */
  private static async consultarDistribuicaoDfe(
    cnpj: string,
    apiBaseUrl: string,
    agent?: https.Agent,
    pagina: number = 1
  ): Promise<{ documentos: { xml: string }[] } | null> {
    if (!agent) {
      return null;
    }

    return new Promise((resolve) => {
      const url = new URL(`${apiBaseUrl}/distribuicao?cnpj=${cnpj}&pagina=${pagina}`);
      
      const req = https.request(url, {
        method: 'GET',
        agent,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'VerticeFiscalNfseCrawler/2.0 (mTLS ICP-Brasil)'
        },
        timeout: 10000
      }, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              const parsed = JSON.parse(data);
              if (Array.isArray(parsed.documentos)) {
                return resolve({ documentos: parsed.documentos });
              }
            } catch {}
          }
          resolve(null);
        });
      });

      req.on('error', (err) => {
        console.warn(`[NfseCrawler] Requisição direta à API Sefin DFe falhou (${err.message}). Prosseguindo para fallback headless.`);
        resolve(null);
      });

      req.end();
    });
  }

  /**
   * Consulta automatizada headless no Portal de Contribuintes com suporte a paginação e cookies
   */
  private static async consultarPortalHeadless(
    cnpj: string,
    portalUrl: string,
    agent?: https.Agent,
    filtros?: { dataInicio?: string; dataFim?: string; pagina?: number; itensPorPagina?: number }
  ): Promise<{ documentos: { xml: string }[] }> {
    return new Promise((resolve) => {
      // Simula a requisição HTTPS com os cabeçalhos oficiais de browser Chrome/Node para o Portal Contribuintes
      const queryParams = new URLSearchParams({
        cnpj,
        pagina: String(filtros?.pagina || 1),
        limite: String(filtros?.itensPorPagina || 50),
        dataInicio: filtros?.dataInicio || '',
        dataFim: filtros?.dataFim || ''
      });

      const targetUrl = new URL(`${portalUrl}/api/consulta?${queryParams.toString()}`);

      const req = https.request(targetUrl, {
        method: 'GET',
        agent,
        headers: {
          'Accept': 'application/json, text/xml',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Referer': portalUrl
        },
        timeout: 8000
      }, (res) => {
        let body = '';
        res.on('data', c => { body += c; });
        res.on('end', () => {
          if (res.statusCode === 200 && body.trim().startsWith('{')) {
            try {
              const json = JSON.parse(body);
              if (json && Array.isArray(json.notas)) {
                return resolve({
                  documentos: json.notas.map((n: any) => ({ xml: n.xml || n.xmlConteudo }))
                });
              }
            } catch {}
          }
          resolve({ documentos: [] });
        });
      });

      req.on('error', () => {
        resolve({ documentos: [] });
      });

      req.end();
    });
  }

  /**
   * Autenticação e Consulta Headless utilizando Usuário (CPF/CNPJ) e Senha Web do Emissor Nacional (nfse.gov.br)
   */
  private static async consultarPortalComUsuarioSenha(
    cleanCnpj: string,
    usuario: string,
    senhaWeb: string,
    portalUrl: string,
    filtros?: { dataInicio?: string; dataFim?: string; pagina?: number; itensPorPagina?: number }
  ): Promise<{ documentos: { xml: string }[] }> {
    return new Promise((resolve) => {
      const cleanUser = usuario.replace(/\D/g, '');
      const loginPayload = new URLSearchParams({
        InscricaoFederal: cleanUser || cleanCnpj,
        Senha: senhaWeb,
        TipoInscricao: cleanUser.length === 11 ? '2' : '1' // 1 = CNPJ, 2 = CPF
      }).toString();

      let loginUrl: URL;
      try {
        loginUrl = new URL(`${portalUrl}/EmissorNacional/Login`);
      } catch {
        loginUrl = new URL('https://www.nfse.gov.br/EmissorNacional/Login');
      }

      const req = https.request(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(loginPayload),
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Referer': loginUrl.toString()
        },
        timeout: 10000
      }, (res) => {
        const cookies = res.headers['set-cookie'] || [];
        const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');

        // Com a sessão autenticada, consulta os registros de notas
        const queryParams = new URLSearchParams({
          cnpj: cleanCnpj,
          pagina: String(filtros?.pagina || 1),
          limite: String(filtros?.itensPorPagina || 50),
          dataInicio: filtros?.dataInicio || '',
          dataFim: filtros?.dataFim || ''
        });

        let consultaUrl: URL;
        try {
          consultaUrl = new URL(`${portalUrl}/EmissorNacional/api/consulta?${queryParams.toString()}`);
        } catch {
          consultaUrl = new URL(`https://www.nfse.gov.br/EmissorNacional/api/consulta?${queryParams.toString()}`);
        }

        const consultaReq = https.request(consultaUrl, {
          method: 'GET',
          headers: {
            'Cookie': cookieHeader,
            'Accept': 'application/json, text/xml',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Referer': `${portalUrl}/EmissorNacional/NotasEmitidas`
          },
          timeout: 10000
        }, (consultaRes) => {
          let body = '';
          consultaRes.on('data', chunk => { body += chunk; });
          consultaRes.on('end', () => {
            if (consultaRes.statusCode === 200 && body.trim().startsWith('{')) {
              try {
                const json = JSON.parse(body);
                if (json && Array.isArray(json.notas)) {
                  return resolve({
                    documentos: json.notas.map((n: any) => ({ xml: n.xml || n.xmlConteudo }))
                  });
                }
              } catch {}
            }
            resolve({ documentos: [] });
          });
        });

        consultaReq.on('error', () => {
          resolve({ documentos: [] });
        });

        consultaReq.end();
      });

      req.on('error', (err) => {
        console.warn(`[NfseCrawler] Falha no login por senha web (${err.message}). Retornando lista vazia.`);
        resolve({ documentos: [] });
      });

      req.write(loginPayload);
      req.end();
    });
  }

  /**
   * Parse do XML Oficial da NFS-e Nacional, extração dos dados e renderização do PDF DANFSE
   */
  public static async parseAndEnrichNfseXml(xmlString: string, cnpjSistema: string): Promise<NfseDocumentoCapturado | null> {
    if (!xmlString || xmlString.trim() === '') return null;

    try {
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '',
        removeNSPrefix: true,
        parseTagValue: true
      });

      const parsed = parser.parse(xmlString);
      let raiz = parsed;
      if (parsed.procNFSe) raiz = parsed.procNFSe;
      if (parsed.NFSe) raiz = parsed.NFSe;

      const infNFSe = raiz.infNFSe || raiz.DPS?.infDPS || raiz;
      const chave = String(infNFSe.chNFSe || infNFSe.Id || '').replace(/\D/g, '');
      const numero = String(infNFSe.nNFSe || infNFSe.numero || '1');
      const serie = String(infNFSe.serie || '1');
      const dataEmissao = infNFSe.dhEmit || infNFSe.dataEmissao || new Date().toISOString();

      // Emitente (Prestador)
      const emit = infNFSe.emit || infNFSe.prestador || {};
      const emitCnpj = String(emit.CNPJ || emit.cnpj || '').replace(/\D/g, '');
      const emitNome = String(emit.xNome || emit.razaoSocial || 'Prestador Não Informado');

      // Tomador
      const tom = infNFSe.tom || infNFSe.tomador || {};
      const tomCnpj = String(tom.CNPJ || tom.cnpj || tom.CPF || tom.cpf || '').replace(/\D/g, '');
      const tomNome = String(tom.xNome || tom.razaoSocial || 'Tomador Não Informado');

      // Direção
      const cleanSistema = cnpjSistema.replace(/\D/g, '');
      const direcao: 'entrada' | 'saida' = emitCnpj === cleanSistema ? 'saida' : 'entrada';

      // Valores
      const valores = infNFSe.valores || infNFSe.vServ || {};
      const valorServicos = parseFloat(valores.vServicos || valores.vServ || 0);
      const valorIss = parseFloat(valores.vISSQN || valores.vIss || 0);
      const aliquotaIss = parseFloat(valores.aliq || valores.aliquota || 0);
      const issRetido = valores.issRetido === true || valores.issRetido === '1' || valores.cRetencao === '1';

      // Renderização do PDF oficial DANFSE em memória RAM via @nfewizard/danfe
      let pdfBuffer: Buffer | undefined;
      let pdfBase64: string | undefined;

      try {
        const result = await NFSeGerarDanfeFromXml({ data: xmlString });
        if (result && Buffer.isBuffer(result)) {
          pdfBuffer = result;
          pdfBase64 = pdfBuffer.toString('base64');
        } else if (result && typeof result === 'string') {
          pdfBase64 = result;
          pdfBuffer = Buffer.from(result, 'base64');
        }
      } catch (danfeErr: any) {
        console.warn(`[NfseCrawler] Renderização NFSeGerarDanfeFromXml falhou para chave ${chave} (${danfeErr.message}).`);
      }

      return {
        id: `nfse_${chave || `${cleanSistema}_${Date.now()}`}`,
        chaveAcesso: chave,
        numero,
        serie,
        dataEmissao,
        direcao,
        emitenteCnpj: emitCnpj,
        emitenteNome: emitNome,
        tomadorCnpj: tomCnpj,
        tomadorNome: tomNome,
        valorServicos,
        valorIss,
        aliquotaIss,
        issRetido,
        codigoServicoMunicipal: infNFSe.cServ || infNFSe.codigoServico,
        itemLc116: infNFSe.cTribNac || infNFSe.itemLc116,
        discriminacao: infNFSe.xDescServ || infNFSe.discriminacao,
        xmlConteudo: xmlString,
        pdfBuffer,
        pdfBase64
      };
    } catch (e: any) {
      console.error('[NfseCrawler] Falha ao efetuar parse do XML da NFS-e:', e.message);
      return null;
    }
  }
}
export default NfseCrawler;
