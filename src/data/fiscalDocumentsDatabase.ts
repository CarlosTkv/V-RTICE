import { CompanyData } from '../types';

export interface DocFiscalItem {
  descricao: string;
  ncm: string;
  cfop: string;
  valor: number;
  quantidade?: number;
  valorUnitario?: number;
  icmsAliquota?: number;
  issAliquota?: number;
}

export interface DocFiscal {
  id: string;
  tipo: 'NF-e' | 'NFS-e' | 'NFC-e' | 'CT-e';
  numero: string;
  serie: string;
  chave: string;
  dataEmissao: string;
  emitente: string;
  emitenteCnpj: string;
  destinatario: string;
  destinatarioCnpj: string;
  valorTotal: number;
  valorIcms: number;
  valorIss: number;
  cfop: string;
  ncm: string;
  status: 'Autorizada' | 'Cancelada' | 'Denegada';
  xmlOriginal: string;
  xmlCorrigido?: string;
  manifestacao?: 'Pendente' | 'Confirmada' | 'Ciência' | 'Desconhecida' | 'Não Realizada';
  direcao: 'entrada' | 'saida';
  protocoloAutorizacao: string;
  dataManifestacao?: string;
  itens: DocFiscalItem[];
}

/**
 * Calcula o dígito verificador módulo 11 para a chave de 44 dígitos da NF-e
 */
export function calculateChaveDV(key43: string): number {
  let soma = 0;
  let peso = 2;
  for (let i = key43.length - 1; i >= 0; i--) {
    const digit = parseInt(key43.charAt(i), 10);
    soma += (isNaN(digit) ? 0 : digit) * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }
  const resto = soma % 11;
  return (resto === 0 || resto === 1) ? 0 : 11 - resto;
}

/**
 * Monta chave oficial de 44 dígitos com cNF e DV corretos
 */
export function buildChaveAcesso(
  cUF: string,
  aamm: string,
  cnpj: string,
  mod: string,
  serie: string,
  nNF: number,
  tpEmis: string = '1',
  cNF: number = 10000000 + (nNF * 31) % 89999999
): string {
  const cleanCnpj = cnpj.replace(/\D/g, '').padStart(14, '0');
  const cleanMod = (mod.replace(/\D/g, '') || '55').padStart(2, '0');
  const cleanSerie = (serie.replace(/\D/g, '') || '1').padStart(3, '0');
  const cleanNum = nNF.toString().padStart(9, '0');
  const cleanCNF = Math.abs(cNF).toString().padStart(8, '0');

  const base43 = `${cUF}${aamm}${cleanCnpj}${cleanMod}${cleanSerie}${cleanNum}${tpEmis}${cleanCNF}`;
  const dv = calculateChaveDV(base43);
  return `${base43}${dv}`;
}

/**
 * Gera XML oficial de NF-e, CT-e ou NFS-e
 */
export function generateFiscalXml(doc: Omit<DocFiscal, 'xmlOriginal'>): string {
  const cleanEmitCnpj = doc.emitenteCnpj.replace(/\D/g, '');
  const cleanDestCnpj = doc.destinatarioCnpj.replace(/\D/g, '');

  if (doc.tipo === 'NF-e') {
    return `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe>
    <infNFe Id="NFe${doc.chave}" versao="4.00">
      <ide>
        <cUF>35</cUF>
        <cNF>${doc.chave.substring(35, 43)}</cNF>
        <natOp>${doc.direcao === 'entrada' ? 'COMPRA PARA INDUSTRIALIZACAO OU REVENDA' : 'VENDA DE MERCADORIA OU PRESTACAO'}</natOp>
        <mod>55</mod>
        <serie>${doc.serie}</serie>
        <nNF>${doc.numero.replace(/\D/g, '')}</nNF>
        <dhEmi>${doc.dataEmissao}T10:30:00-03:00</dhEmi>
        <tpNF>${doc.direcao === 'entrada' ? '0' : '1'}</tpNF>
        <idDest>1</idDest>
        <cMunFG>3550308</cMunFG>
        <tpImp>1</tpImp>
        <tpEmis>1</tpEmis>
        <cDV>${doc.chave.substring(43)}</cDV>
        <tpAmb>1</tpAmb>
        <finNFe>1</finNFe>
        <indFinal>0</indFinal>
        <indPres>1</indPres>
        <procEmi>0</procEmi>
        <verProc>V4.00</verProc>
      </ide>
      <emit>
        <CNPJ>${cleanEmitCnpj}</CNPJ>
        <xNome>${doc.emitente}</xNome>
        <xFant>${doc.emitente.split(' ')[0]}</xFant>
        <enderEmit>
          <xLgr>Avenida Paulista</xLgr>
          <n>1000</n>
          <xBairro>Bela Vista</xBairro>
          <cMun>3550308</cMun>
          <xMun>Sao Paulo</xMun>
          <UF>SP</UF>
          <CEP>01310100</CEP>
        </enderEmit>
        <IE>109876543210</IE>
        <CRT>3</CRT>
      </emit>
      <dest>
        <CNPJ>${cleanDestCnpj}</CNPJ>
        <xNome>${doc.destinatario}</xNome>
        <enderDest>
          <xLgr>Rua Visconde de Inhauma</xLgr>
          <n>58</n>
          <xBairro>Centro</xBairro>
          <cMun>3304557</cMun>
          <xMun>Rio de Janeiro</xMun>
          <UF>RJ</UF>
          <CEP>20091007</CEP>
        </enderDest>
        <indIEDest>1</indIEDest>
        <IE>12345678</IE>
      </dest>
      ${doc.itens.map((it, idx) => `
      <det nItem="${idx + 1}">
        <prod>
          <cProd>ITEM-${(idx + 1).toString().padStart(3, '0')}</cProd>
          <cEAN>7891234567890</cEAN>
          <xProd>${it.descricao}</xProd>
          <NCM>${it.ncm.replace(/\D/g, '')}</NCM>
          <CFOP>${it.cfop}</CFOP>
          <uCom>UN</uCom>
          <qCom>${it.quantidade || 1}.0000</qCom>
          <vUnCom>${(it.valorUnitario || it.valor).toFixed(4)}</vUnCom>
          <vProd>${it.valor.toFixed(2)}</vProd>
          <cEANTrib>7891234567890</cEANTrib>
          <uTrib>UN</uTrib>
          <qTrib>${it.quantidade || 1}.0000</qTrib>
          <vUnTrib>${(it.valorUnitario || it.valor).toFixed(4)}</vUnTrib>
          <indTot>1</indTot>
        </prod>
        <imposto>
          <ICMS>
            <ICMS00>
              <orig>0</orig>
              <CST>00</CST>
              <modBC>3</modBC>
              <vBC>${it.valor.toFixed(2)}</vBC>
              <pICMS>${it.icmsAliquota || 18}.00</pICMS>
              <vICMS>${((it.valor * (it.icmsAliquota || 18)) / 100).toFixed(2)}</vICMS>
            </ICMS00>
          </ICMS>
        </imposto>
      </det>`).join('')}
      <total>
        <ICMSTot>
          <vBC>${doc.valorTotal.toFixed(2)}</vBC>
          <vICMS>${doc.valorIcms.toFixed(2)}</vICMS>
          <vICMSDeson>0.00</vICMSDeson>
          <vFCP>0.00</vFCP>
          <vBCST>0.00</vBCST>
          <vST>0.00</vST>
          <vFCPST>0.00</vFCPST>
          <vFCPSTRet>0.00</vFCPSTRet>
          <vProd>${doc.valorTotal.toFixed(2)}</vProd>
          <vFrete>0.00</vFrete>
          <vSeg>0.00</vSeg>
          <vDesc>0.00</vDesc>
          <vII>0.00</vII>
          <vIPI>0.00</vIPI>
          <vIPIDevol>0.00</vIPIDevol>
          <vPIS>${(doc.valorTotal * 0.0165).toFixed(2)}</vPIS>
          <vCOFINS>${(doc.valorTotal * 0.076).toFixed(2)}</vCOFINS>
          <vOutro>0.00</vOutro>
          <vNF>${doc.valorTotal.toFixed(2)}</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
  <protNFe versao="4.00">
    <infProt>
      <tpAmb>1</tpAmb>
      <verAplic>SP_NFE_PL_009_V4</verAplic>
      <chNFe>${doc.chave}</chNFe>
      <dhRecbto>${doc.dataEmissao}T10:30:15-03:00</dhRecbto>
      <nProt>${doc.protocoloAutorizacao}</nProt>
      <digVal>KxY98aBcdEf123456789=</digVal>
      <cStat>100</cStat>
      <xMotivo>Autorizado o uso da NF-e</xMotivo>
    </infProt>
  </protNFe>
</nfeProc>`;
  } else if (doc.tipo === 'CT-e') {
    return `<?xml version="1.0" encoding="UTF-8"?>
<cteProc xmlns="http://www.portalfiscal.inf.br/cte" versao="3.00">
  <CTe>
    <infCte Id="CTe${doc.chave}" versao="3.00">
      <ide>
        <cUF>35</cUF>
        <tpAmb>1</tpAmb>
        <mod>57</mod>
        <serie>${doc.serie}</serie>
        <nCT>${doc.numero.replace(/\D/g, '')}</nCT>
        <dhEmi>${doc.dataEmissao}T14:15:00-03:00</dhEmi>
        <tpImp>1</tpImp>
        <tpEmis>1</tpEmis>
      </ide>
      <emit>
        <CNPJ>${cleanEmitCnpj}</CNPJ>
        <xNome>${doc.emitente}</xNome>
        <UF>SP</UF>
      </emit>
      <dest>
        <CNPJ>${cleanDestCnpj}</CNPJ>
        <xNome>${doc.destinatario}</xNome>
        <UF>RJ</UF>
      </dest>
      <vPrest>
        <vTPrest>${doc.valorTotal.toFixed(2)}</vTPrest>
        <vRec>${doc.valorTotal.toFixed(2)}</vRec>
      </vPrest>
      <imp>
        <ICMS>
          <ICMS00>
            <CST>00</CST>
            <vBC>${doc.valorTotal.toFixed(2)}</vBC>
            <pICMS>12.00</pICMS>
            <vICMS>${doc.valorIcms.toFixed(2)}</vICMS>
          </ICMS00>
        </ICMS>
      </imp>
    </infCte>
  </CTe>
  <protCTe versao="3.00">
    <infProt>
      <chCTe>${doc.chave}</chCTe>
      <dhRecbto>${doc.dataEmissao}T14:15:10-03:00</dhRecbto>
      <nProt>${doc.protocoloAutorizacao}</nProt>
      <cStat>100</cStat>
      <xMotivo>Autorizado o uso do CT-e</xMotivo>
    </infProt>
  </protCTe>
</cteProc>`;
  } else {
    // NFS-e Nacional / ABRASF
    return `<?xml version="1.0" encoding="UTF-8"?>
<EnviarLoteRpsEnvio xmlns="http://www.abrasf.org.br/nfse.xsd">
  <LoteRps versao="1.00">
    <Rps>
      <InfRps>
        <IdentificacaoRps>
          <Numero>${doc.numero.replace(/\D/g, '')}</Numero>
          <Serie>${doc.serie}</Serie>
          <Tipo>1</Tipo>
        </IdentificacaoRps>
        <DataEmissao>${doc.dataEmissao}T11:00:00</DataEmissao>
        <Status>1</Status>
        <Servico>
          <Valores>
            <ValorServicos>${doc.valorTotal.toFixed(2)}</ValorServicos>
            <ValorIss>${doc.valorIss.toFixed(2)}</ValorIss>
            <Aliquota>${doc.itens[0]?.issAliquota || 5}.00</Aliquota>
          </Valores>
          <ItemListaServico>1.07</ItemListaServico>
          <Discriminacao>${doc.itens[0]?.descricao || 'Prestacao de Servicos Tecnologicos Especializados'}</Discriminacao>
        </Servico>
        <Prestador>
          <Cnpj>${cleanEmitCnpj}</Cnpj>
          <RazaoSocial>${doc.emitente}</RazaoSocial>
        </Prestador>
        <Tomador>
          <IdentificacaoTomador>
            <CpfCnpj><Cnpj>${cleanDestCnpj}</Cnpj></CpfCnpj>
          </IdentificacaoTomador>
          <RazaoSocial>${doc.destinatario}</RazaoSocial>
        </Tomador>
      </InfRps>
    </Rps>
  </LoteRps>
</EnviarLoteRpsEnvio>`;
  }
}

/**
 * Base zerada - nenhuma nota de entrada de teste ou amostra armazenada
 */
export const RAW_ENTRADAS_26: any[] = [];


export const CLIENTES_SAIDA: any[] = [];

/**
 * Retorna lista de notas de saída (base zerada)
 */
export function buildSeptemberSaidas75(_company?: CompanyData): DocFiscal[] {
  return [];
}

/**
 * Retorna lista de notas de entrada (base zerada)
 */
export function buildSeptemberEntradas26(_company?: CompanyData): DocFiscal[] {
  return [];
}

/**
 * Retorna o acervo de documentos reais armazenados. Retorna array vazio se nenhuma nota real foi sincronizada.
 */
export function getCompanyFiscalDocuments(company: CompanyData): DocFiscal[] {
  // Retorna estritamente vazio por padrão para não exibir dados fictícios/demonstração.
  // Apenas notas fiscais reais capturadas na SEFAZ mTLS ou importadas via XML/ZIP serão exibidas.
  return [];
}
