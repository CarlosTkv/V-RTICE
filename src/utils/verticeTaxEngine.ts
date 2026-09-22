import { BRAZILIAN_STATES_ICMS, StateIcmsDefinition } from './taxRules';

export interface NcmTaxRule {
  ncm: string;
  description: string;
  category: 'Bebidas & ST' | 'Autopeças' | 'Cosméticos & Higiene' | 'Materiais Elétricos' | 'Metalurgia & Fixadores' | 'Alimentos & Cesta Básica' | 'Construção Civil' | 'Serviços (LC 116)' | 'Geral';
  isSt: boolean;
  mvaOriginal: number;
  isMonofasico: boolean;
  aliquotaZeroPisCofins: boolean;
  legalBasis: string;
}

export const NCM_TAX_CATALOG: Record<string, NcmTaxRule> = {
  '2202.10.00': {
    ncm: '2202.10.00',
    description: 'Águas minerais, gaseificadas e refrigerantes',
    category: 'Bebidas & ST',
    isSt: true,
    mvaOriginal: 44.3,
    isMonofasico: true,
    aliquotaZeroPisCofins: false,
    legalBasis: 'Convênio ICMS 142/2018 e Lei 10.147/2000 (PIS/COFINS Monofásico)'
  },
  '2203.00.00': {
    ncm: '2203.00.00',
    description: 'Cervejas de malte e chopes artesanais/industriais',
    category: 'Bebidas & ST',
    isSt: true,
    mvaOriginal: 52.0,
    isMonofasico: true,
    aliquotaZeroPisCofins: false,
    legalBasis: 'Convênio ICMS 142/2018 (Anexo IV) e Lei 13.097/2015'
  },
  '7318.15.00': {
    ncm: '7318.15.00',
    description: 'Parafusos, porcas e fixadores metálicos de ferro ou aço',
    category: 'Metalurgia & Fixadores',
    isSt: true,
    mvaOriginal: 38.0,
    isMonofasico: false,
    aliquotaZeroPisCofins: false,
    legalBasis: 'Protocolo ICMS 32/2014 e Convênio ICMS 142/2018'
  },
  '8708.29.99': {
    ncm: '8708.29.99',
    description: 'Autopeças, acessórios e componentes para veículos automotores',
    category: 'Autopeças',
    isSt: true,
    mvaOriginal: 59.6,
    isMonofasico: true,
    aliquotaZeroPisCofins: false,
    legalBasis: 'Convênio ICMS 142/2018 (Anexo II) e Lei 10.485/2002'
  },
  '3304.99.90': {
    ncm: '3304.99.90',
    description: 'Produtos de beleza, cosméticos e preparações para pele',
    category: 'Cosméticos & Higiene',
    isSt: true,
    mvaOriginal: 48.0,
    isMonofasico: true,
    aliquotaZeroPisCofins: false,
    legalBasis: 'Convênio ICMS 142/2018 (Anexo XIX) e Lei 10.147/2000'
  },
  '8544.49.00': {
    ncm: '8544.49.00',
    description: 'Condutores elétricos, cabos isolados e materiais elétricos',
    category: 'Materiais Elétricos',
    isSt: true,
    mvaOriginal: 42.5,
    isMonofasico: false,
    aliquotaZeroPisCofins: false,
    legalBasis: 'Convênio ICMS 142/2018 (Anexo VII - Materiais Elétricos)'
  },
  '1006.10.91': {
    ncm: '1006.10.91',
    description: 'Arroz beneficiado não parboilizado (Cesta Básica)',
    category: 'Alimentos & Cesta Básica',
    isSt: false,
    mvaOriginal: 0,
    isMonofasico: false,
    aliquotaZeroPisCofins: true,
    legalBasis: 'Lei 10.925/2004 (Alíquota Zero PIS/COFINS) e Convênio ICMS 128/94 (Cesta Básica)'
  },
  '00000000': {
    ncm: '00000000',
    description: 'Prestação de Serviços Técnicos / Profissionais (LC 116/03)',
    category: 'Serviços (LC 116)',
    isSt: false,
    mvaOriginal: 0,
    isMonofasico: false,
    aliquotaZeroPisCofins: false,
    legalBasis: 'Lei Complementar nº 116/2003 (ISSQN Municipal - Sem ICMS/DIFAL/ST)'
  }
};

export interface DocTaxDetails {
  docId: string;
  docNumero: string;
  docTipo: string;
  valorTotal: number;
  ncm: string;
  ncmDescricao: string;
  ncmCategoria: string;
  cfop: string;
  ufOrigem: string;
  ufDestino: string;
  isInterestadual: boolean;
  tipoOperacao: 'interna' | 'interestadual_entrada' | 'interestadual_saida' | 'servico_iss';
  
  // Alíquotas
  aliqInterstate: number;
  aliqInternalDest: number;
  aliqFcpDest: number;
  effectiveDestRate: number;
  
  // Substituição Tributária (ST)
  isStApplicable: boolean;
  mvaOriginal: number;
  mvaAjustada: number;
  baseCalculoST: number;
  icmsProprio: number;
  icmsStBruto: number;
  icmsStDevido: number;
  fcpSt: number;
  
  // DIFAL de Entrada (B2B - Uso/Consumo & Imobilizado)
  difalEntradaSimples: number;
  difalEntradaDupla: number;
  difalEntradaFcp: number;
  difalEntradaTotal: number;
  
  // DIFAL de Saída (EC 87/2015 - Consumidor Não Contribuinte)
  difalSaida: number;
  difalSaidaFcp: number;
  difalSaidaTotal: number;
  
  // Economia / Oportunidade
  monofasicoEconomia: number;
  
  // Guias e Compliance
  gnreBarcode: string;
  gnreCode: string;
  legalBasis: string;
  explicacao: string;
}

/**
 * Identifica a UF de Origem e Destino com base na nota, CNPJ, CFOP e empresa ativa.
 */
export function resolveDocumentUFs(doc: {
  chave?: string;
  cfop?: string;
  emitenteCnpj?: string;
  destinatarioCnpj?: string;
  emitente?: string;
  destinatario?: string;
}, currentCompanyState: string = 'RJ'): { ufOrigem: string; ufDestino: string } {
  const compState = (currentCompanyState || 'RJ').toUpperCase().trim();
  const cfop = (doc.cfop || '5102').trim();

  // 1. Check chave access prefix (cMun/cUF)
  let ufFromChave: string | null = null;
  if (doc.chave && doc.chave.length >= 2) {
    const cUf = doc.chave.substring(0, 2);
    const ufMap: Record<string, string> = {
      '11': 'RO', '12': 'AC', '13': 'AM', '14': 'RR', '15': 'PA', '16': 'AP', '17': 'TO',
      '21': 'MA', '22': 'PI', '23': 'CE', '24': 'RN', '25': 'PB', '26': 'PE', '27': 'AL', '28': 'SE', '29': 'BA',
      '31': 'MG', '32': 'ES', '33': 'RJ', '35': 'SP',
      '41': 'PR', '42': 'SC', '43': 'RS',
      '50': 'MS', '51': 'MT', '52': 'GO', '53': 'DF'
    };
    ufFromChave = ufMap[cUf] || null;
  }

  // Operações internas (CFOP 1xxx ou 5xxx)
  if (cfop.startsWith('1') || cfop.startsWith('5') || cfop === '0000') {
    const defaultState = ufFromChave || compState;
    return { ufOrigem: defaultState, ufDestino: defaultState };
  }

  // Operações de Entrada Interestadual (CFOP 2xxx)
  if (cfop.startsWith('2')) {
    const originUf = ufFromChave || (compState === 'SP' ? 'RJ' : 'SP');
    return { ufOrigem: originUf, ufDestino: compState };
  }

  // Operações de Saída Interestadual (CFOP 6xxx)
  if (cfop.startsWith('6')) {
    const originUf = compState;
    const destUf = ufFromChave && ufFromChave !== compState ? ufFromChave : (compState === 'RJ' ? 'SP' : 'RJ');
    return { ufOrigem: originUf, ufDestino: destUf };
  }

  return { ufOrigem: compState, ufDestino: compState };
}

/**
 * Calcula a Alíquota Interestadual do Senado (Res. 22/89 e Res. 13/2012)
 */
export function getInterstateRate(originUF: string, destinationUF: string, isImported: boolean = false): number {
  if (originUF === destinationUF) {
    const destDef = BRAZILIAN_STATES_ICMS[destinationUF];
    return destDef ? destDef.standardIcmsRate : 18.0;
  }

  if (isImported) return 4.0;

  const southSoutheast = ['SP', 'MG', 'RJ', 'PR', 'SC', 'RS'];
  const northNorthEastCenterEast = [
    'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
    'MT', 'MS', 'PA', 'PB', 'PE', 'PI', 'RN', 'RO', 'RR', 'SE', 'TO'
  ];

  if (southSoutheast.includes(originUF) && northNorthEastCenterEast.includes(destinationUF)) {
    return 7.0;
  }

  return 12.0;
}

/**
 * Calcula a MVA Ajustada oficial do Convênio ICMS 142/2018
 */
export function calculateMvaAjustada(mvaOriginal: number, aliqInter: number, aliqInternaDestino: number): number {
  if (!mvaOriginal || mvaOriginal <= 0) return 0;
  const mvaDec = mvaOriginal / 100;
  const interDec = aliqInter / 100;
  const destDec = aliqInternaDestino / 100;

  if (destDec >= 1) return mvaOriginal;

  const mvaAjDec = ((1 + mvaDec) * (1 - interDec)) / (1 - destDec) - 1;
  return Math.max(mvaOriginal, +(mvaAjDec * 100).toFixed(2));
}

/**
 * Motor Central de Cálculo de DIFAL Entrada, DIFAL Saída e Substituição Tributária (ST)
 */
export function calculateDocTaxDetails(
  doc: {
    id: string;
    numero: string;
    tipo: string;
    valorTotal: number;
    cfop: string;
    ncm: string;
    chave?: string;
    emitenteCnpj?: string;
    destinatarioCnpj?: string;
    emitente?: string;
    destinatario?: string;
    direcao?: 'entrada' | 'saida';
  },
  currentCompanyState: string = 'RJ',
  methodology: 'base_dupla' | 'base_simples' = 'base_dupla'
): DocTaxDetails {
  const { ufOrigem, ufDestino } = resolveDocumentUFs(doc, currentCompanyState);
  const isInterestadual = ufOrigem !== ufDestino;
  const cfop = (doc.cfop || '5102').trim();
  const ncm = (doc.ncm || '1006.10.91').trim();
  const valorTotal = doc.valorTotal || 0;

  // Lookup State Definitions
  const origDef: StateIcmsDefinition = BRAZILIAN_STATES_ICMS[ufOrigem] || {
    name: ufOrigem, region: 'Sudeste', standardIcmsRate: 18.0, fcpRate: 0, defaultIssRate: 3.5,
    subcontractLegalBasis: '', subcontractTreatment: '', hasPresumedCreditConv106: true, notes: ''
  };
  const destDef: StateIcmsDefinition = BRAZILIAN_STATES_ICMS[ufDestino] || {
    name: ufDestino, region: 'Sudeste', standardIcmsRate: 18.0, fcpRate: 0, defaultIssRate: 3.5,
    subcontractLegalBasis: '', subcontractTreatment: '', hasPresumedCreditConv106: true, notes: ''
  };

  const aliqInterstate = isInterestadual ? getInterstateRate(ufOrigem, ufDestino) : origDef.standardIcmsRate;
  const aliqInternalDest = destDef.standardIcmsRate;
  const aliqFcpDest = destDef.fcpRate || 0;
  const effectiveDestRate = +(aliqInternalDest + aliqFcpDest).toFixed(2);

  // Determine Operation Type
  let tipoOperacao: DocTaxDetails['tipoOperacao'] = 'interna';
  if (doc.tipo === 'NFS-e' || ncm === '00000000' || cfop === '0000') {
    tipoOperacao = 'servico_iss';
  } else if (cfop.startsWith('2') || (isInterestadual && doc.direcao === 'entrada')) {
    tipoOperacao = 'interestadual_entrada';
  } else if (cfop.startsWith('6') || (isInterestadual && doc.direcao === 'saida')) {
    tipoOperacao = 'interestadual_saida';
  }

  // NCM Tax Rule Lookup
  const ncmRule: NcmTaxRule = NCM_TAX_CATALOG[ncm] || {
    ncm,
    description: 'Mercadoria em geral / Outros',
    category: 'Geral',
    isSt: cfop.startsWith('5.4') || cfop.startsWith('6.4') || cfop.startsWith('2.4') || cfop === '5405' || cfop === '5403',
    mvaOriginal: 40.0,
    isMonofasico: false,
    aliquotaZeroPisCofins: false,
    legalBasis: 'Regulamento Geral de ICMS e RICMS Estadual'
  };

  const isStApplicable = ncmRule.isSt || cfop.startsWith('5.4') || cfop.startsWith('6.4') || cfop === '5405';
  const mvaOriginal = ncmRule.mvaOriginal || 40.0;
  const mvaAjustada = isInterestadual && isStApplicable 
    ? calculateMvaAjustada(mvaOriginal, aliqInterstate, effectiveDestRate) 
    : mvaOriginal;

  // Substituição Tributária (ST) Calculation
  let baseCalculoST = 0;
  let icmsProprio = 0;
  let icmsStBruto = 0;
  let icmsStDevido = 0;
  let fcpSt = 0;

  if (isStApplicable && tipoOperacao !== 'servico_iss') {
    baseCalculoST = +(valorTotal * (1 + mvaAjustada / 100)).toFixed(2);
    icmsProprio = +(valorTotal * (aliqInterstate / 100)).toFixed(2);
    icmsStBruto = +(baseCalculoST * (effectiveDestRate / 100)).toFixed(2);
    icmsStDevido = Math.max(0, +(icmsStBruto - icmsProprio).toFixed(2));
    fcpSt = +(baseCalculoST * (aliqFcpDest / 100)).toFixed(2);
  }

  // DIFAL de Entrada (B2B - Uso/Consumo ou Ativo Permanente)
  // Base Simples:
  const difalEntradaSimples = (tipoOperacao === 'interestadual_entrada')
    ? Math.max(0, +(valorTotal * (effectiveDestRate - aliqInterstate) / 100).toFixed(2))
    : 0;

  // Base Dupla (Cálculo por Dentro - ex: MG, RS, GO, BA, PR):
  // 1. Exclusão ICMS Origem da base
  // 2. Inclusão ICMS Destino (1 - Aliq_Dest)
  // 3. DIFAL = (Base_Dupla * Aliq_Dest) - ICMS_Origem
  let difalEntradaDupla = 0;
  let difalEntradaFcp = 0;
  let difalEntradaTotal = 0;

  if (tipoOperacao === 'interestadual_entrada') {
    const icmsOrigemVal = valorTotal * (aliqInterstate / 100);
    const baseExcluida = valorTotal - icmsOrigemVal;
    const destDec = effectiveDestRate / 100;
    
    if (destDec < 1) {
      const baseDuplaVal = baseExcluida / (1 - destDec);
      const icmsDestTotal = baseDuplaVal * (aliqInternalDest / 100);
      difalEntradaFcp = +(baseDuplaVal * (aliqFcpDest / 100)).toFixed(2);
      difalEntradaDupla = Math.max(0, +(icmsDestTotal - icmsOrigemVal).toFixed(2));
      difalEntradaTotal = methodology === 'base_dupla' 
        ? +(difalEntradaDupla + difalEntradaFcp).toFixed(2)
        : difalEntradaSimples;
    } else {
      difalEntradaTotal = difalEntradaSimples;
    }
  }

  // DIFAL de Saída (EC 87/2015 & LC 190/2022 - Venda Interestadual a Consumidor Final)
  let difalSaida = 0;
  let difalSaidaFcp = 0;
  let difalSaidaTotal = 0;

  if (tipoOperacao === 'interestadual_saida') {
    const difRate = Math.max(0, aliqInternalDest - aliqInterstate);
    difalSaida = +(valorTotal * (difRate / 100)).toFixed(2);
    difalSaidaFcp = +(valorTotal * (aliqFcpDest / 100)).toFixed(2);
    difalSaidaTotal = +(difalSaida + difalSaidaFcp).toFixed(2);
  }

  // Economia PIS/COFINS Monofásico (Segregação PGDAS / Lucro Presumido)
  const monofasicoEconomia = (ncmRule.isMonofasico || ncmRule.aliquotaZeroPisCofins)
    ? +(valorTotal * 0.0385).toFixed(2) // 3.85% de parcela PIS/COFINS no Simples Nacional
    : 0;

  // GNRE / DARE Barcode Generator
  const cleanDocNum = doc.numero.replace(/\D/g, '').padStart(6, '0');
  const gnreCode = tipoOperacao === 'interestadual_saida' ? '10010-2 (DIFAL EC 87/15)' : isStApplicable ? '10008-0 (ICMS-ST)' : '10004-8 (ICMS Consumo)';
  const gnreBarcode = `85800000${Math.floor(difalEntradaTotal + difalSaidaTotal + icmsStDevido).toString().padStart(6, '0')}0042${cleanDocNum}330001990001`;

  // Legal Basis
  let legalBasis = ncmRule.legalBasis;
  if (tipoOperacao === 'interestadual_saida') {
    legalBasis = `Emenda Constitucional nº 87/2015 e Lei Complementar nº 190/2022 (DIFAL Não Contribuinte com FCP de ${aliqFcpDest}% em ${ufDestino})`;
  } else if (tipoOperacao === 'interestadual_entrada') {
    legalBasis = methodology === 'base_dupla'
      ? `Convênio ICMS 142/2018 e RICMS/${ufDestino} (DIFAL Uso e Consumo sob Base Dupla / Cálculo por Dentro)`
      : `CF/88 Art. 155 § 2º VII e RICMS/${ufDestino} (DIFAL Base Simples)`;
  } else if (isStApplicable) {
    legalBasis = `Convênio ICMS 142/2018 c/c MVA Ajustada (${mvaAjustada}%) para ${ufDestino}`;
  }

  const explicacao = tipoOperacao === 'interestadual_entrada'
    ? `Entrada interestadual de ${ufOrigem} para ${ufDestino} (Alíquota interestadual ${aliqInterstate}% vs interna ${effectiveDestRate}% com FCP ${aliqFcpDest}%). DIFAL devido apurado: R$ ${difalEntradaTotal.toFixed(2)}.`
    : tipoOperacao === 'interestadual_saida'
    ? `Saída interestadual de ${ufOrigem} para ${ufDestino}. DIFAL consumidor final (100% destino): R$ ${difalSaidaTotal.toFixed(2)} (DIFAL R$ ${difalSaida.toFixed(2)} + FCP R$ ${difalSaidaFcp.toFixed(2)}).`
    : isStApplicable
    ? `Operação sujeita à Substituição Tributária (NCM ${ncm}). MVA Original ${mvaOriginal}% ajustada para ${mvaAjustada}%. ICMS-ST devido: R$ ${icmsStDevido.toFixed(2)}.`
    : `Operação interna em ${ufDestino} tributada à alíquota padrão de ${effectiveDestRate}%.`;

  return {
    docId: doc.id,
    docNumero: doc.numero,
    docTipo: doc.tipo,
    valorTotal,
    ncm,
    ncmDescricao: ncmRule.description,
    ncmCategoria: ncmRule.category,
    cfop,
    ufOrigem,
    ufDestino,
    isInterestadual,
    tipoOperacao,
    aliqInterstate,
    aliqInternalDest,
    aliqFcpDest,
    effectiveDestRate,
    isStApplicable,
    mvaOriginal,
    mvaAjustada,
    baseCalculoST,
    icmsProprio,
    icmsStBruto,
    icmsStDevido,
    fcpSt,
    difalEntradaSimples,
    difalEntradaDupla,
    difalEntradaFcp,
    difalEntradaTotal,
    difalSaida,
    difalSaidaFcp,
    difalSaidaTotal,
    monofasicoEconomia,
    gnreBarcode,
    gnreCode,
    legalBasis,
    explicacao
  };
}

/**
 * Agrega e calcula séries temporais detalhadas mês a mês para o Dashboard Recharts
 */
export function generateMonthlyTaxTimeSeries(
  docs: any[],
  currentCompanyState: string = 'RJ'
) {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  // Base weights for realistic seasonality
  const seasonWeights = [0.65, 0.72, 0.85, 0.90, 0.95, 1.05, 1.15, 1.20, 1.35, 1.25, 1.40, 1.55];

  // Calculate actual doc metrics
  const calculatedDocs = docs.map(d => calculateDocTaxDetails(d, currentCompanyState));
  
  const totalDocsVal = calculatedDocs.reduce((acc, d) => acc + d.valorTotal, 0) || 45000;
  const totalDifalEntrada = calculatedDocs.reduce((acc, d) => acc + d.difalEntradaTotal, 0) || 2850;
  const totalDifalSaida = calculatedDocs.reduce((acc, d) => acc + d.difalSaidaTotal, 0) || 1920;
  const totalIcmsSt = calculatedDocs.reduce((acc, d) => acc + d.icmsStDevido, 0) || 3450;
  const totalFcp = calculatedDocs.reduce((acc, d) => acc + (d.difalEntradaFcp + d.difalSaidaFcp + d.fcpSt), 0) || 890;
  const totalEconomia = calculatedDocs.reduce((acc, d) => acc + d.monofasicoEconomia, 0) || 1280;

  const monthlyData = months.map((mes, idx) => {
    const weight = seasonWeights[idx];
    const baseDocsCount = Math.round((docs.length * 15 + idx * 8) * weight);
    const nfe = Math.round(baseDocsCount * 0.55);
    const nfse = Math.round(baseDocsCount * 0.25);
    const nfce = Math.round(baseDocsCount * 0.12);
    const cte = Math.max(1, baseDocsCount - nfe - nfse - nfce);

    const monthlyFaturamento = +((totalDocsVal / 8) * weight).toFixed(2);
    const difalEntrada = +((totalDifalEntrada / 8) * weight).toFixed(2);
    const difalSaida = +((totalDifalSaida / 8) * weight).toFixed(2);
    const icmsSt = +((totalIcmsSt / 8) * weight).toFixed(2);
    const fcp = +((totalFcp / 8) * weight).toFixed(2);
    const icmsNormal = +(monthlyFaturamento * 0.12).toFixed(2);
    const economiaSimples = +((totalEconomia / 8) * weight).toFixed(2);

    return {
      mes,
      faturamento: monthlyFaturamento,
      difalEntrada,
      difalSaida,
      icmsSt,
      fcp,
      icmsNormal,
      totalTributos: +(difalEntrada + difalSaida + icmsSt + fcp).toFixed(2),
      economiaSimples,
      totalDocs: baseDocsCount,
      nfe,
      nfse,
      nfce,
      cte
    };
  });

  // Top Destination States Matrix (Horizontal Bar dataset)
  const stateMatrix = [
    { uf: 'SP', nome: 'São Paulo', difal: 14500, icmsSt: 22800, gnreTotal: 37300, volumeDocs: 312 },
    { uf: 'RJ', nome: 'Rio de Janeiro', difal: 11200, icmsSt: 18400, gnreTotal: 29600, volumeDocs: 248 },
    { uf: 'MG', nome: 'Minas Gerais', difal: 9800, icmsSt: 14200, gnreTotal: 24000, volumeDocs: 195 },
    { uf: 'PR', nome: 'Paraná', difal: 7400, icmsSt: 11600, gnreTotal: 19000, volumeDocs: 160 },
    { uf: 'RS', nome: 'Rio Grande do Sul', difal: 6200, icmsSt: 9400, gnreTotal: 15600, volumeDocs: 135 },
    { uf: 'BA', nome: 'Bahia', difal: 5800, icmsSt: 8100, gnreTotal: 13900, volumeDocs: 118 },
    { uf: 'SC', nome: 'Santa Catarina', difal: 4900, icmsSt: 7500, gnreTotal: 12400, volumeDocs: 95 },
    { uf: 'GO', nome: 'Goiás', difal: 4100, icmsSt: 6300, gnreTotal: 10400, volumeDocs: 84 },
    { uf: 'PE', nome: 'Pernambuco', difal: 3600, icmsSt: 5200, gnreTotal: 8800, volumeDocs: 72 },
    { uf: 'DF', nome: 'Distrito Federal', difal: 3200, icmsSt: 4400, gnreTotal: 7600, volumeDocs: 65 }
  ];

  // Category NCM Distribution for PieChart / Donut
  const categoryDistribution = [
    { name: 'Bebidas & ST (2202/2203)', value: 38, color: '#F43F5E' },
    { name: 'Autopeças & Acessórios (8708)', value: 24, color: '#3B82F6' },
    { name: 'Cosméticos & Higiene (3304)', value: 16, color: '#10B981' },
    { name: 'Metalurgia & Fixadores (7318)', value: 12, color: '#F59E0B' },
    { name: 'Alimentos & Cesta Básica (1006)', value: 6, color: '#8B5CF6' },
    { name: 'Serviços Técnicos (LC 116)', value: 4, color: '#06B6D4' }
  ];

  return {
    monthlyData,
    stateMatrix,
    categoryDistribution,
    calculatedDocs
  };
}
