/**
 * Vértice Auditor Fiscal - Advanced XML & Document Parser Engine
 * Suporta NF-e (Mod 55), CT-e (Mod 57), NFS-e (Padrão Nacional ADN & ABRASF) e NFC-e (Mod 65)
 */

export interface ParsedFiscalItem {
  itemNumero: number;
  codigoProduto: string;
  descricao: string;
  ncm: string;
  cest?: string;
  cfop: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  // Tributos
  origem: string;
  cstIcms?: string;
  csosn?: string;
  baseCalculoIcms: number;
  aliquotaIcms: number;
  valorIcms: number;
  baseCalculoIcmsSt?: number;
  aliquotaIcmsSt?: number;
  valorIcmsSt?: number;
  mvaSt?: number;
  // PIS / COFINS
  cstPis?: string;
  aliquotaPis?: number;
  valorPis?: number;
  cstCofins?: string;
  aliquotaCofins?: number;
  valorCofins?: number;
  // ISS (para NFS-e)
  aliquotaIss?: number;
  valorIss?: number;
  isMonofasico?: boolean;
  isSubstituicaoTributaria?: boolean;
}

export interface ParsedFiscalDocument {
  id: string;
  tipo: 'NF-e' | 'NFS-e' | 'CT-e' | 'NFC-e';
  modelo: '55' | '57' | '65' | 'NFS-e';
  numero: string;
  serie: string;
  chave: string;
  dataEmissao: string;
  naturezaOperacao: string;
  direcao: 'entrada' | 'saida';
  
  // Emitente
  emitente: string;
  emitenteCnpj: string;
  emitenteUf: string;
  emitenteMunicipio?: string;
  emitenteIe?: string;
  emitenteCrt?: string; // 1 = Simples Nacional, 3 = Regime Normal

  // Destinatário / Tomador
  destinatario: string;
  destinatarioCnpj: string;
  destinatarioUf: string;
  destinatarioMunicipio?: string;
  destinatarioIe?: string;

  // Valores Totais
  valorTotal: number;
  valorProdutos?: number;
  valorServicos?: number;
  valorFrete?: number;
  valorDesconto?: number;
  valorIcms: number;
  valorIcmsSt?: number;
  valorIss: number;
  valorIpi?: number;
  valorPis: number;
  valorCofins: number;

  // Classificação
  cfopPrincipal: string;
  ncmPrincipal: string;
  status: 'Autorizada' | 'Cancelada' | 'Denegada';
  manifestacao: 'Pendente' | 'Confirmada' | 'Ciência' | 'Desconhecida' | 'Não Realizada';
  protocoloAutorizacao?: string;
  digestValue?: string;
  
  // Itens Detalhados
  itens: ParsedFiscalItem[];
  xmlOriginal: string;
  xmlCorrigido?: string;
  
  // Alertas e Auditoria Instantânea
  alertasAuditoria: Array<{
    tipo: 'erro_critico' | 'oportunidade_credito' | 'reforma_tributaria' | 'divergencia_cadastro';
    titulo: string;
    descricao: string;
    impactoFinanceiro?: number;
    sugestaoCorrecao?: string;
  }>;
}

/**
 * Identifica se um NCM é tipicamente monofásico de PIS/COFINS
 */
export function isNcmMonofasico(ncm: string): boolean {
  if (!ncm) return false;
  const clean = ncm.replace(/\D/g, '');
  const prefixosMonofasicos = [
    '2202', // Refrigerantes e águas
    '2203', // Cervejas
    '3003', '3004', // Medicamentos
    '3303', '3304', '3305', '3307', // Cosméticos e perfumaria
    '4011', '4012', '4013', // Pneus e câmaras
    '8708', // Autopeças
    '1006', // Arroz beneficiado (regimes especiais)
    '2710', '2711' // Combustíveis e lubrificantes
  ];
  return prefixosMonofasicos.some(p => clean.startsWith(p));
}

/**
 * Parser de XML Fiscal com suporte a NF-e, CT-e, NFS-e e NFC-e
 */
export function parseFiscalXmlString(xmlContent: string, currentCompanyCnpj?: string): ParsedFiscalDocument {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

  // Identificação do Modelo / Tipo
  const isCte = xmlContent.includes('cteProc') || xmlContent.includes('<CTe') || xmlContent.includes('<infCte');
  const isNfse = xmlContent.includes('EnviarLoteRpsEnvio') || xmlContent.includes('<InfRps') || xmlContent.includes('<CompNfse') || xmlContent.includes('nfse.xsd') || xmlContent.includes('<DPS');
  const isNfce = xmlContent.includes('<tpAmb>') && (xmlContent.includes('<mod>65</mod>') || xmlContent.includes('mod="65"'));
  
  let tipo: 'NF-e' | 'NFS-e' | 'CT-e' | 'NFC-e' = 'NF-e';
  let modelo: '55' | '57' | '65' | 'NFS-e' = '55';

  if (isCte) {
    tipo = 'CT-e';
    modelo = '57';
  } else if (isNfse) {
    tipo = 'NFS-e';
    modelo = 'NFS-e';
  } else if (isNfce) {
    tipo = 'NFC-e';
    modelo = '65';
  }

  // Extração de Chave
  let chave = '';
  const chNFeMatch = xmlContent.match(/<chNFe>([^<]+)<\/chNFe>/) || xmlContent.match(/Id="NFe([^"]+)"/);
  const chCTeMatch = xmlContent.match(/<chCTe>([^<]+)<\/chCTe>/) || xmlContent.match(/Id="CTe([^"]+)"/);
  const chNFSeMatch = xmlContent.match(/<ChaveAcesso>([^<]+)<\/ChaveAcesso>/) || xmlContent.match(/<CodigoVerificacao>([^<]+)<\/CodigoVerificacao>/);

  if (chNFeMatch) chave = chNFeMatch[1];
  else if (chCTeMatch) chave = chCTeMatch[1];
  else if (chNFSeMatch) chave = chNFSeMatch[1];
  else chave = `332609${Math.floor(10000000000000 + Math.random() * 90000000000000)}550010000000011857391234`.slice(0, 44);

  // Extração de Número e Série
  const nNF = xmlDoc.getElementsByTagName('nNF')[0]?.textContent || 
              xmlDoc.getElementsByTagName('Numero')[0]?.textContent || 
              xmlDoc.getElementsByTagName('nCT')[0]?.textContent || 
              Math.floor(10000 + Math.random() * 90000).toString();

  const serie = xmlDoc.getElementsByTagName('serie')[0]?.textContent || 
                xmlDoc.getElementsByTagName('Serie')[0]?.textContent || '001';

  const dhEmi = xmlDoc.getElementsByTagName('dhEmi')[0]?.textContent || 
                xmlDoc.getElementsByTagName('dEmi')[0]?.textContent || 
                xmlDoc.getElementsByTagName('DataEmissao')[0]?.textContent || 
                new Date().toISOString();

  const natOp = xmlDoc.getElementsByTagName('natOp')[0]?.textContent || 'Venda de mercadoria ou prestacao de servico';

  // Emitente
  const emitNode = xmlDoc.getElementsByTagName('emit')[0] || xmlDoc.getElementsByTagName('Prestador')[0];
  const emitCnpjRaw = emitNode?.getElementsByTagName('CNPJ')[0]?.textContent || 
                      emitNode?.getElementsByTagName('CpfCnpj')[0]?.textContent || '00000000000191';
  const cleanEmitCnpj = emitCnpjRaw.replace(/\D/g, '');
  const emitCnpj = cleanEmitCnpj.length === 14 
    ? `${cleanEmitCnpj.slice(0,2)}.${cleanEmitCnpj.slice(2,5)}.${cleanEmitCnpj.slice(5,8)}/${cleanEmitCnpj.slice(8,12)}-${cleanEmitCnpj.slice(12,14)}`
    : cleanEmitCnpj;

  const emitNome = emitNode?.getElementsByTagName('xNome')[0]?.textContent || 
                   emitNode?.getElementsByTagName('RazaoSocial')[0]?.textContent || 'Fornecedor S/A';
  const emitUf = emitNode?.getElementsByTagName('UF')[0]?.textContent || 'SP';
  const emitMun = emitNode?.getElementsByTagName('xMun')[0]?.textContent || 'Sao Paulo';
  const emitIe = emitNode?.getElementsByTagName('IE')[0]?.textContent || '';
  const emitCrt = emitNode?.getElementsByTagName('CRT')[0]?.textContent || '1';

  // Destinatário
  const destNode = xmlDoc.getElementsByTagName('dest')[0] || xmlDoc.getElementsByTagName('Tomador')[0];
  const destCnpjRaw = destNode?.getElementsByTagName('CNPJ')[0]?.textContent || 
                      destNode?.getElementsByTagName('CPF')[0]?.textContent || 
                      destNode?.getElementsByTagName('CpfCnpj')[0]?.textContent || '00000000000191';
  const cleanDestCnpj = destCnpjRaw.replace(/\D/g, '');
  const destCnpj = cleanDestCnpj.length === 14 
    ? `${cleanDestCnpj.slice(0,2)}.${cleanDestCnpj.slice(2,5)}.${cleanDestCnpj.slice(5,8)}/${cleanDestCnpj.slice(8,12)}-${cleanDestCnpj.slice(12,14)}`
    : cleanDestCnpj;

  const destNome = destNode?.getElementsByTagName('xNome')[0]?.textContent || 
                   destNode?.getElementsByTagName('RazaoSocial')[0]?.textContent || 'Tomador / Adquirente';
  const destUf = destNode?.getElementsByTagName('UF')[0]?.textContent || 'RJ';
  const destMun = destNode?.getElementsByTagName('xMun')[0]?.textContent || 'Rio de Janeiro';
  const destIe = destNode?.getElementsByTagName('IE')[0]?.textContent || '';

  // Valores Totais
  const vNFNode = xmlDoc.getElementsByTagName('vNF')[0] || 
                  xmlDoc.getElementsByTagName('ValorServicos')[0] || 
                  xmlDoc.getElementsByTagName('vTPrest')[0];
  const valorTotal = vNFNode ? parseFloat(vNFNode.textContent || '0') : 0;

  const vICMSNode = xmlDoc.getElementsByTagName('vICMS')[0];
  const valorIcms = vICMSNode ? parseFloat(vICMSNode.textContent || '0') : 0;

  const vISSNode = xmlDoc.getElementsByTagName('ValorIss')[0] || xmlDoc.getElementsByTagName('vISS')[0];
  const valorIss = vISSNode ? parseFloat(vISSNode.textContent || '0') : 0;

  const vPISNode = xmlDoc.getElementsByTagName('vPIS')[0];
  const valorPis = vPISNode ? parseFloat(vPISNode.textContent || '0') : 0;

  const vCOFINSNode = xmlDoc.getElementsByTagName('vCOFINS')[0];
  const valorCofins = vCOFINSNode ? parseFloat(vCOFINSNode.textContent || '0') : 0;

  const protocolo = xmlDoc.getElementsByTagName('nProt')[0]?.textContent || `1332609${Math.floor(100000000 + Math.random() * 900000000)}`;

  // Itens
  const detNodes = xmlDoc.getElementsByTagName('det');
  const itens: ParsedFiscalItem[] = [];

  let cfopPrincipal = '5102';
  let ncmPrincipal = '00000000';

  if (detNodes.length > 0) {
    for (let i = 0; i < detNodes.length; i++) {
      const d = detNodes[i];
      const prodNode = d.getElementsByTagName('prod')[0];
      const impostoNode = d.getElementsByTagName('imposto')[0];

      const cProd = prodNode?.getElementsByTagName('cProd')[0]?.textContent || `PROD-${i + 1}`;
      const xProd = prodNode?.getElementsByTagName('xProd')[0]?.textContent || `Mercadoria / Item ${i + 1}`;
      const ncm = prodNode?.getElementsByTagName('NCM')[0]?.textContent || '00000000';
      const cfop = prodNode?.getElementsByTagName('CFOP')[0]?.textContent || '5102';
      const uCom = prodNode?.getElementsByTagName('uCom')[0]?.textContent || 'UN';
      const qCom = parseFloat(prodNode?.getElementsByTagName('qCom')[0]?.textContent || '1');
      const vUnCom = parseFloat(prodNode?.getElementsByTagName('vUnCom')[0]?.textContent || '0');
      const vProd = parseFloat(prodNode?.getElementsByTagName('vProd')[0]?.textContent || '0');

      const vBCIcms = parseFloat(impostoNode?.getElementsByTagName('vBC')[0]?.textContent || '0');
      const pIcms = parseFloat(impostoNode?.getElementsByTagName('pICMS')[0]?.textContent || '0');
      const vIcmsItem = parseFloat(impostoNode?.getElementsByTagName('vICMS')[0]?.textContent || '0');

      if (i === 0) {
        cfopPrincipal = cfop;
        ncmPrincipal = ncm;
      }

      itens.push({
        itemNumero: i + 1,
        codigoProduto: cProd,
        descricao: xProd,
        ncm: ncm,
        cfop: cfop,
        unidade: uCom,
        quantidade: qCom,
        valorUnitario: vUnCom,
        valorTotal: vProd || valorTotal,
        origem: '0',
        baseCalculoIcms: vBCIcms,
        aliquotaIcms: pIcms,
        valorIcms: vIcmsItem,
        baseCalculoIcmsSt: 0,
        aliquotaIcmsSt: 0,
        valorIcmsSt: 0,
        valorPis: 0,
        valorCofins: 0,
        isMonofasico: isNcmMonofasico(ncm),
        isSubstituicaoTributaria: cfop === '5405' || cfop === '6405' || cfop === '5403'
      });
    }
  } else {
    // NFS-e ou CT-e com item consolidado
    const discServico = xmlDoc.getElementsByTagName('Discriminacao')[0]?.textContent || natOp;
    itens.push({
      itemNumero: 1,
      codigoProduto: 'SERV-01',
      descricao: discServico,
      ncm: '00000000',
      cfop: tipo === 'CT-e' ? '5352' : '0000',
      unidade: 'UN',
      quantidade: 1,
      valorUnitario: valorTotal,
      valorTotal: valorTotal,
      origem: '0',
      baseCalculoIcms: valorIcms > 0 ? valorTotal : 0,
      aliquotaIcms: valorIcms > 0 ? Math.round((valorIcms / valorTotal) * 100) : 0,
      valorIcms: valorIcms,
      valorIss: valorIss,
      valorPis: valorPis,
      valorCofins: valorCofins,
      isMonofasico: false,
      isSubstituicaoTributaria: false
    });
  }

  // Direção (Entrada ou Saída em relação à empresa ativa)
  let direcao: 'entrada' | 'saida' = 'entrada';
  if (currentCompanyCnpj) {
    const cleanCurrent = currentCompanyCnpj.replace(/\D/g, '');
    if (cleanEmitCnpj === cleanCurrent) {
      direcao = 'saida';
    } else {
      direcao = 'entrada';
    }
  } else {
    // Padrão pelo CFOP
    direcao = (cfopPrincipal.startsWith('1') || cfopPrincipal.startsWith('2') || cfopPrincipal.startsWith('3')) ? 'entrada' : 'saida';
  }

  // Alertas de Auditoria Automática
  const alertasAuditoria: ParsedFiscalDocument['alertasAuditoria'] = [];

  // 1. Verificação de Divergência Interestadual com mesma UF
  if ((cfopPrincipal.startsWith('2') || cfopPrincipal.startsWith('6')) && emitUf === destUf && emitUf !== '') {
    alertasAuditoria.push({
      tipo: 'divergencia_cadastro',
      titulo: 'Inconsistência de CFOP Interestadual',
      descricao: `A nota fiscal está escriturada com CFOP interestadual (${cfopPrincipal}), porém emitente (${emitUf}) e destinatário (${destUf}) estão localizados na mesma unidade federativa.`,
      sugestaoCorrecao: `Alterar CFOP para o prefixo 5 (operação interna) para evitar autuação no SPED Fiscal e DIFAL indevido.`
    });
  }

  // 2. Oportunidade Monofásica PIS/COFINS
  const itensMonofasicos = itens.filter(it => it.isMonofasico);
  if (itensMonofasicos.length > 0) {
    const totalMono = itensMonofasicos.reduce((s, it) => s + it.valorTotal, 0);
    const economiaAproximada = totalMono * 0.0365; // ~3.65% economia típica no Simples / Lucro Presumido
    alertasAuditoria.push({
      tipo: 'oportunidade_credito',
      titulo: 'Oportunidade: Produtos Monofásicos Identificados',
      descricao: `${itensMonofasicos.length} item(ns) possuem NCM sujeito a PIS/COFINS Monofásico (ex: bebidas, medicamentos, cosméticos, autopeças).`,
      impactoFinanceiro: economiaAproximada,
      sugestaoCorrecao: `Segregar a receita desses itens no PGDAS-D ou apuração do Lucro Presumido para expurgar a incidência de PIS/COFINS na saída.`
    });
  }

  // 3. Substituição Tributária (ICMS-ST)
  if (cfopPrincipal === '5405' || cfopPrincipal === '6405') {
    alertasAuditoria.push({
      tipo: 'oportunidade_credito',
      titulo: 'ICMS Substituição Tributária (ST) Retido Anteriormente',
      descricao: `Operação com ICMS-ST recolhido na fonte. No Simples Nacional, autoriza a dedução da parcela de ICMS da alíquota do DAS.`,
      sugestaoCorrecao: `Informar a parcela da receita com Substituição Tributária no PGDAS-D para desonerar cerca de 34% do imposto da guia DAS.`
    });
  }

  // 4. Reforma Tributária (IBS / CBS 2026-2033)
  const ibsCbsProjetado = valorTotal * 0.265;
  alertasAuditoria.push({
    tipo: 'reforma_tributaria',
    titulo: 'Impacto da Reforma Tributária (EC 132/2023 & PLP 68/2024)',
    descricao: `Na transição para o IBS e CBS, esta operação gerará crédito financeiro pleno de 26,5% (R$ ${ibsCbsProjetado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}) para adquirentes tributados no regime regular.`,
    sugestaoCorrecao: `Consulte o módulo Simples Híbrido para avaliar se compensa recolher IBS/CBS por fora da guia do Simples para transferir 100% de crédito aos clientes PJ.`
  });

  return {
    id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    tipo,
    modelo,
    numero: nNF.padStart(9, '0'),
    serie: serie.padStart(3, '0'),
    chave,
    dataEmissao: dhEmi.substring(0, 10),
    naturezaOperacao: natOp,
    direcao,
    emitente: emitNome,
    emitenteCnpj: emitCnpj,
    emitenteUf: emitUf,
    emitenteMunicipio: emitMun,
    emitenteIe: emitIe,
    emitenteCrt: emitCrt,
    destinatario: destNome,
    destinatarioCnpj: destCnpj,
    destinatarioUf: destUf,
    destinatarioMunicipio: destMun,
    destinatarioIe: destIe,
    valorTotal,
    valorProdutos: valorTotal,
    valorServicos: tipo === 'NFS-e' ? valorTotal : 0,
    valorIcms,
    valorIss,
    valorPis,
    valorCofins,
    cfopPrincipal,
    ncmPrincipal,
    status: 'Autorizada',
    manifestacao: 'Confirmada',
    protocoloAutorizacao: protocolo,
    itens,
    xmlOriginal: xmlContent,
    alertasAuditoria
  };
}
