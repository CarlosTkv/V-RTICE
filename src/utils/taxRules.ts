import { 
  CompanyData, 
  CalculationResult, 
  SimplesAnexo, 
  TaxBreakdown, 
  RegimeComparisonDetail, 
  AnexoRevenueItem,
  SublimitExclusionDetails,
  TransportTaxAnalysis,
  TransportType,
  StateIcmsTransportInfo,
  RouteFreightIcmsCalculation,
  EcacRevenueClassification,
  StateSimplesIcmsBenefit,
  ParanaCalculationDetails,
  PayrollCppAudit,
  SupplierTaxComposition,
  SupplierCreditAuditResult
} from '../types';

export const FEDERAL_LIMIT = 4800000; // R$ 4,8 Milhões Mercado Interno (LC 123/2006 Art. 3º II)
export const EXPORT_ADDITIONAL_LIMIT = 4800000; // R$ 4,8 Milhões Limite Adicional Exportação (LC 123/2006 Art. 3º § 14)
export const CRITICAL_EXCLUSION_THRESHOLD = 5760000; // 4.8M * 1.20 (20% excesso para exclusão imediata)
export const STATE_SUBLIMIT = 3600000; // R$ 3,6 Milhões Sublimite ICMS/ISS (Art. 13-A)
export const SUBLIMIT_CRITICAL_THRESHOLD = 4320000; // 3.6M * 1.20 (20% excesso do sublimite para exclusão no mês subsequente)
export const FATOR_R_THRESHOLD = 0.28; // 28% da folha sobre faturamento (Art. 18 § 5º-J)

export interface StateIcmsDefinition {
  name: string;
  region: 'Sul' | 'Sudeste' | 'Centro-Oeste' | 'Nordeste' | 'Norte';
  standardIcmsRate: number;
  fcpRate: number;
  defaultIssRate: number;
  subcontractLegalBasis: string;
  subcontractTreatment: string;
  hasPresumedCreditConv106: boolean;
  notes: string;
}

export const BRAZILIAN_STATES_ICMS: Record<string, StateIcmsDefinition> = {
  AC: { 
    name: 'Acre', 
    region: 'Norte',
    standardIcmsRate: 19.0, 
    fcpRate: 0, 
    defaultIssRate: 3.0,
    subcontractLegalBasis: 'Decreto Estadual nº 008/1998 e Convênio ICMS 25/90',
    subcontractTreatment: 'Transportadora subcontratada dispensada de ICMS (recolhido pela contratante principal no CT-e).',
    hasPresumedCreditConv106: true,
    notes: 'Origem no Norte aplica alíquota interestadual de 12% para qualquer destino nacional.'
  },
  AL: { 
    name: 'Alagoas', 
    region: 'Nordeste',
    standardIcmsRate: 19.0, 
    fcpRate: 1.0, 
    defaultIssRate: 3.5,
    subcontractLegalBasis: 'Decreto Estadual nº 35.245/1991 e Convênio ICMS 25/90',
    subcontractTreatment: 'Dispensa da subcontratada na prestação iniciada em AL.',
    hasPresumedCreditConv106: true,
    notes: 'Origem no Nordeste aplica 12% em todas as saídas interestaduais.'
  },
  AM: { 
    name: 'Amazonas', 
    region: 'Norte',
    standardIcmsRate: 20.0, 
    fcpRate: 0, 
    defaultIssRate: 3.5,
    subcontractLegalBasis: 'Regulamento do ICMS/AM (Decreto nº 20.686/1999) e Convênio ICMS 25/90',
    subcontractTreatment: 'Responsabilidade atribuída à transportadora contratante.',
    hasPresumedCreditConv106: true,
    notes: 'Tratamento específico para Zona Franca de Manaus (ZFM) e incentivos da SUFRAMA.'
  },
  AP: { 
    name: 'Amapá', 
    region: 'Norte',
    standardIcmsRate: 18.0, 
    fcpRate: 0, 
    defaultIssRate: 3.0,
    subcontractLegalBasis: 'Decreto Estadual nº 2.269/1998 e Convênio ICMS 25/90',
    subcontractTreatment: 'Dispensada a subcontratada quando acobertada pelo CT-e original.',
    hasPresumedCreditConv106: true,
    notes: 'Alíquota interestadual de 12% para todos os estados de destino.'
  },
  BA: { 
    name: 'Bahia', 
    region: 'Nordeste',
    standardIcmsRate: 20.5, 
    fcpRate: 0, 
    defaultIssRate: 4.0,
    subcontractLegalBasis: 'RICMS/BA (Decreto nº 13.780/2012) e Convênio ICMS 25/90',
    subcontractTreatment: 'Subcontratação com dispensa expressa do imposto para o executor efetivo.',
    hasPresumedCreditConv106: true,
    notes: 'Alíquota padrão elevada para 20.5%. Com crédito presumido de 20% (Conv. 106/96), carga interna cai para 16,40%.'
  },
  CE: { 
    name: 'Ceará', 
    region: 'Nordeste',
    standardIcmsRate: 20.0, 
    fcpRate: 0, 
    defaultIssRate: 3.5,
    subcontractLegalBasis: 'RICMS/CE (Decreto nº 33.327/2019) e Convênio ICMS 25/90',
    subcontractTreatment: 'Subcontratada desonerada; recolhimento centralizado pelo emissor inicial.',
    hasPresumedCreditConv106: true,
    notes: 'Origem CE aplica 12% em qualquer rota interestadual.'
  },
  DF: { 
    name: 'Distrito Federal', 
    region: 'Centro-Oeste',
    standardIcmsRate: 20.0, 
    fcpRate: 0, 
    defaultIssRate: 3.5,
    subcontractLegalBasis: 'Decreto Distrital nº 18.955/1997 e Convênio ICMS 25/90',
    subcontractTreatment: 'Imposto do transporte subcontratado devido pela contratante.',
    hasPresumedCreditConv106: true,
    notes: 'No DF há tributação cumulativa ou mista em virtude de competência estadual e municipal unificada.'
  },
  ES: { 
    name: 'Espírito Santo', 
    region: 'Sudeste',
    standardIcmsRate: 17.0, 
    fcpRate: 0, 
    defaultIssRate: 3.0,
    subcontractLegalBasis: 'RICMS/ES (Decreto nº 1.090-R/2002) e Convênio ICMS 25/90',
    subcontractTreatment: 'Dispensa da prestadora subcontratada com registro de CT-e de subcontratação.',
    hasPresumedCreditConv106: true,
    notes: 'Exceção geográfica: ES pertence à Região Sudeste, porém para fins de ICMS interestadual originário recebe tratamento equivalente (12% em saídas interestaduais).'
  },
  GO: { 
    name: 'Goiás', 
    region: 'Centro-Oeste',
    standardIcmsRate: 19.0, 
    fcpRate: 0, 
    defaultIssRate: 3.5,
    subcontractLegalBasis: 'RCTE/GO (Decreto nº 4.852/1997) e Convênio ICMS 25/90',
    subcontractTreatment: 'Subcontratado dispensado; CT-e emitido com CFOP 5.360/6.360.',
    hasPresumedCreditConv106: true,
    notes: 'Forte polo de transporte de grãos e agronegócio com benefícios em saídas interestaduais.'
  },
  MA: { 
    name: 'Maranhão', 
    region: 'Nordeste',
    standardIcmsRate: 22.0, 
    fcpRate: 0, 
    defaultIssRate: 3.5,
    subcontractLegalBasis: 'RICMS/MA (Decreto nº 19.714/2003) e Convênio ICMS 25/90',
    subcontractTreatment: 'Dispensa da subcontratada com tributação unificada na transportadora contratante.',
    hasPresumedCreditConv106: true,
    notes: 'Alíquota interna de 22% (a mais alta do país). Carga interna efetiva com crédito presumido: 17,60%.'
  },
  MG: { 
    name: 'Minas Gerais', 
    region: 'Sudeste',
    standardIcmsRate: 18.0, 
    fcpRate: 0, 
    defaultIssRate: 3.5,
    subcontractLegalBasis: 'Art. 42 da Parte Geral do RICMS/MG (Decreto nº 48.589/2023) e Convênio ICMS 25/90',
    subcontractTreatment: 'Transportadora subcontratada fica dispensada da emissão de CT-e e do recolhimento do ICMS, desde que a contratante acoberte a prestação.',
    hasPresumedCreditConv106: true,
    notes: 'Origem MG: 7% para Norte/Nordeste/Centro-Oeste/ES; 12% para Sul e Sudeste. Crédito presumido de 20% previsto no Anexo IV do RICMS/MG.'
  },
  MS: { 
    name: 'Mato Grosso do Sul', 
    region: 'Centro-Oeste',
    standardIcmsRate: 17.0, 
    fcpRate: 0, 
    defaultIssRate: 3.0,
    subcontractLegalBasis: 'RICMS/MS (Decreto nº 9.203/1998) e Convênio ICMS 25/90',
    subcontractTreatment: 'Subcontratada isenta/dispensada de recolhimento autônomo.',
    hasPresumedCreditConv106: true,
    notes: '12% em todas as saídas interestaduais para qualquer estado.'
  },
  MT: { 
    name: 'Mato Grosso', 
    region: 'Centro-Oeste',
    standardIcmsRate: 17.0, 
    fcpRate: 0, 
    defaultIssRate: 3.0,
    subcontractLegalBasis: 'RICMS/MT (Decreto nº 2.212/2014) e Convênio ICMS 25/90',
    subcontractTreatment: 'Dispensa da subcontratada; tributação pelo tomador/contratante inicial.',
    hasPresumedCreditConv106: true,
    notes: 'Corredor de escoamento agropecuário com alíquota interestadual originária de 12%.'
  },
  PA: { 
    name: 'Pará', 
    region: 'Norte',
    standardIcmsRate: 19.0, 
    fcpRate: 0, 
    defaultIssRate: 3.5,
    subcontractLegalBasis: 'RICMS/PA (Decreto nº 4.676/2001) e Convênio ICMS 25/90',
    subcontractTreatment: 'Subcontratada desonerada de ICMS próprio.',
    hasPresumedCreditConv106: true,
    notes: 'Alíquota interestadual de 12% para qualquer destino.'
  },
  PB: { 
    name: 'Paraíba', 
    region: 'Nordeste',
    standardIcmsRate: 20.0, 
    fcpRate: 0, 
    defaultIssRate: 3.0,
    subcontractLegalBasis: 'RICMS/PB (Decreto nº 18.930/1997) e Convênio ICMS 25/90',
    subcontractTreatment: 'Dispensa da transportadora que executa a subcontratação.',
    hasPresumedCreditConv106: true,
    notes: '12% em fretes interestaduais.'
  },
  PE: { 
    name: 'Pernambuco', 
    region: 'Nordeste',
    standardIcmsRate: 20.5, 
    fcpRate: 0, 
    defaultIssRate: 4.0,
    subcontractLegalBasis: 'RICMS/PE (Decreto nº 44.650/2017) e Convênio ICMS 25/90',
    subcontractTreatment: 'Subcontratação com diferimento/dispensa do imposto à subcontratada.',
    hasPresumedCreditConv106: true,
    notes: 'Alíquota padrão de 20.5%. Carga efetiva com benefício de 20%: 16,40%.'
  },
  PI: { 
    name: 'Piauí', 
    region: 'Nordeste',
    standardIcmsRate: 21.0, 
    fcpRate: 0, 
    defaultIssRate: 3.5,
    subcontractLegalBasis: 'RICMS/PI (Decreto nº 13.500/2008) e Convênio ICMS 25/90',
    subcontractTreatment: 'Dispensa de cobrança na empresa subcontratada.',
    hasPresumedCreditConv106: true,
    notes: 'Alíquota interna de 21%. Alíquota interestadual de 12%.'
  },
  PR: { 
    name: 'Paraná', 
    region: 'Sudeste', // Para fins de ICMS interestadual
    standardIcmsRate: 19.5, 
    fcpRate: 0, 
    defaultIssRate: 3.5,
    subcontractLegalBasis: 'Art. 331 do RICMS/PR (Decreto nº 7.871/2017) e Convênio ICMS 25/90',
    subcontractTreatment: 'Na subcontratação de serviço de transporte, fica a subcontratada dispensada da emissão de conhecimento de transporte e pagamento de ICMS.',
    hasPresumedCreditConv106: true,
    notes: 'Origem PR: 7% para Norte/Nordeste/Centro-Oeste/ES; 12% para Sul e Sudeste. Crédito presumido de 20% no Anexo VII do RICMS/PR.'
  },
  RJ: { 
    name: 'Rio de Janeiro', 
    region: 'Sudeste',
    standardIcmsRate: 20.0, 
    fcpRate: 2.0, 
    defaultIssRate: 4.0,
    subcontractLegalBasis: 'Livro IX do RICMS/RJ (Decreto nº 27.427/2000) e Convênio ICMS 25/90',
    subcontractTreatment: 'Responsabilidade atribuída à contratante do serviço.',
    hasPresumedCreditConv106: true,
    notes: 'Alíquota de 20% + 2% do Fundo Estadual de Combate à Pobreza (FECP) = 22% total. Origem RJ aplica 7% para N/NE/CO/ES e 12% para S/SE.'
  },
  RN: { 
    name: 'Rio Grande do Norte', 
    region: 'Nordeste',
    standardIcmsRate: 20.0, 
    fcpRate: 0, 
    defaultIssRate: 3.5,
    subcontractLegalBasis: 'RICMS/RN (Decreto nº 13.640/1997) e Convênio ICMS 25/90',
    subcontractTreatment: 'Dispensa da subcontratada com tributação na transportadora principal.',
    hasPresumedCreditConv106: true,
    notes: 'Alíquota interestadual originária de 12%.'
  },
  RO: { 
    name: 'Rondônia', 
    region: 'Norte',
    standardIcmsRate: 19.5, 
    fcpRate: 0, 
    defaultIssRate: 3.0,
    subcontractLegalBasis: 'RICMS/RO (Decreto nº 22.721/2018) e Convênio ICMS 25/90',
    subcontractTreatment: 'Subcontratação com exoneração tributária da subcontratada.',
    hasPresumedCreditConv106: true,
    notes: 'Alíquota interestadual originária de 12%.'
  },
  RR: { 
    name: 'Roraima', 
    region: 'Norte',
    standardIcmsRate: 20.0, 
    fcpRate: 0, 
    defaultIssRate: 3.0,
    subcontractLegalBasis: 'RICMS/RR (Decreto nº 4.335-E/2001) e Convênio ICMS 25/90',
    subcontractTreatment: 'Dispensa da transportadora contratada para a etapa final.',
    hasPresumedCreditConv106: true,
    notes: 'Alíquota interestadual originária de 12%.'
  },
  RS: { 
    name: 'Rio Grande do Sul', 
    region: 'Sul',
    standardIcmsRate: 17.0, 
    fcpRate: 0, 
    defaultIssRate: 3.5,
    subcontractLegalBasis: 'Livro II, Art. 12 do RICMS/RS (Decreto nº 37.699/1997) e Convênio ICMS 25/90',
    subcontractTreatment: 'Fica dispensada a emissão de CT-e pela transportadora subcontratada, sendo o imposto devido pela transportadora contratante.',
    hasPresumedCreditConv106: true,
    notes: 'Alíquota interna padrão de 17%. Origem RS aplica 7% para N/NE/CO/ES e 12% para S/SE.'
  },
  SC: { 
    name: 'Santa Catarina', 
    region: 'Sul',
    standardIcmsRate: 17.0, 
    fcpRate: 0, 
    defaultIssRate: 3.0,
    subcontractLegalBasis: 'Art. 61 do Anexo 6 do RICMS/SC (Decreto nº 2.870/2001) e Convênio ICMS 25/90',
    subcontractTreatment: 'Subcontratada dispensada de emissão e recolhimento; acobertamento pelo CT-e original.',
    hasPresumedCreditConv106: true,
    notes: 'Alíquota interna de 17%. Origem SC aplica 7% para N/NE/CO/ES e 12% para S/SE. Crédito presumido de 20% do ICMS no frete.'
  },
  SE: { 
    name: 'Sergipe', 
    region: 'Nordeste',
    standardIcmsRate: 19.0, 
    fcpRate: 0, 
    defaultIssRate: 3.5,
    subcontractLegalBasis: 'RICMS/SE (Decreto nº 21.400/2002) e Convênio ICMS 25/90',
    subcontractTreatment: 'Subcontratação com recolhimento atribuído ao emissor do CT-e primário.',
    hasPresumedCreditConv106: true,
    notes: 'Alíquota interestadual originária de 12%.'
  },
  SP: { 
    name: 'São Paulo', 
    region: 'Sudeste',
    standardIcmsRate: 18.0, 
    fcpRate: 0, 
    defaultIssRate: 3.5,
    subcontractLegalBasis: 'Art. 314 do RICMS/SP (Decreto nº 45.490/2000) e Convênio ICMS 25/90',
    subcontractTreatment: 'Na subcontratação de serviço de transporte, fica a subcontratada dispensada da emissão do CT-e e do recolhimento de ICMS. O imposto é integralmente apurado e recolhido pela transportadora contratante inicial.',
    hasPresumedCreditConv106: true,
    notes: 'Origem SP: 7% para destinos Norte/Nordeste/Centro-Oeste/ES; 12% para destinos Sul e Sudeste. Crédito presumido de 20% do ICMS no Art. 11 do Anexo III do RICMS/SP reduz a alíquota interna de 18% para 14,40% líquidos.'
  },
  TO: { 
    name: 'Tocantins', 
    region: 'Norte',
    standardIcmsRate: 20.0, 
    fcpRate: 0, 
    defaultIssRate: 3.0,
    subcontractLegalBasis: 'RICMS/TO (Decreto nº 2.912/2006) e Convênio ICMS 25/90',
    subcontractTreatment: 'Dispensa da subcontratada com tributação na contratante.',
    hasPresumedCreditConv106: true,
    notes: 'Corredor Norte-Sul com alíquota interestadual originária de 12%.'
  },
};

export function getStandardIcmsRateForUF(uf?: string): number {
  if (!uf) return 18.0;
  const upper = uf.toUpperCase().trim();
  return BRAZILIAN_STATES_ICMS[upper]?.standardIcmsRate || 18.0;
}

export function getStandardIssRateForCity(uf?: string, _city?: string): number {
  if (!uf) return 3.5;
  const upper = uf.toUpperCase().trim();
  return BRAZILIAN_STATES_ICMS[upper]?.defaultIssRate || 3.5;
}

/**
 * Retorna a alíquota interestadual de frete rodoviário de cargas/passageiros conforme a Resolução do Senado Federal 22/1989
 */
export function getInterstateFreightIcmsRate(originUf: string, destinationUf: string): number {
  const orig = originUf?.toUpperCase().trim() || 'SP';
  const dest = destinationUf?.toUpperCase().trim() || 'SP';
  
  if (orig === dest) {
    return getStandardIcmsRateForUF(orig);
  }
  
  // Região Sul e Sudeste (exceto Espírito Santo)
  const southSoutheast = ['SP', 'MG', 'RJ', 'PR', 'SC', 'RS'];
  
  // Se origem no Sul/Sudeste (exceto ES)
  if (southSoutheast.includes(orig)) {
    // Para Sul e Sudeste (exceto ES) = 12%
    if (southSoutheast.includes(dest)) {
      return 12.0;
    }
    // Para Norte, Nordeste, Centro-Oeste e ES = 7%
    return 7.0;
  }
  
  // Se origem em qualquer estado do Norte, Nordeste, Centro-Oeste e Espírito Santo = 12% para qualquer destino nacional
  return 12.0;
}

/**
 * Retorna o dossiê fiscal de ICMS no transporte para a UF selecionada
 */
export function getStateIcmsTransportInfo(uf?: string): StateIcmsTransportInfo {
  const stateKey = (uf || 'SP').toUpperCase().trim();
  const stateDef = BRAZILIAN_STATES_ICMS[stateKey] || BRAZILIAN_STATES_ICMS['SP'];
  
  const isSouthSoutheast = ['SP', 'MG', 'RJ', 'PR', 'SC', 'RS'].includes(stateKey);
  const rateToNNeCO = isSouthSoutheast ? 7.0 : 12.0;
  const rateToSSe = 12.0;

  return {
    uf: stateKey,
    stateName: stateDef.name,
    region: stateDef.region,
    standardInternalRate: stateDef.standardIcmsRate,
    fcpRate: stateDef.fcpRate,
    effectiveInternalRateWithConv106: +(stateDef.standardIcmsRate * 0.80).toFixed(2),
    interstateRateToNorthNortheastCenterWestES: rateToNNeCO,
    effectiveInterstateRate7WithConv106: +(rateToNNeCO * 0.80).toFixed(2),
    interstateRateToSouthSoutheast: rateToSSe,
    effectiveInterstateRate12WithConv106: +(rateToSSe * 0.80).toFixed(2),
    subcontractLegalBasis: stateDef.subcontractLegalBasis,
    subcontractTreatment: stateDef.subcontractTreatment,
    hasPresumedCreditConv106: stateDef.hasPresumedCreditConv106,
    sublimitAmount: STATE_SUBLIMIT,
    notes: stateDef.notes,
  };
}

/**
 * Simula a tributação de um frete por rota (Origem -> Destino) e compara Simples vs Regime Normal com Crédito Presumido
 */
export function calculateRouteFreightIcms(params: {
  originUF: string;
  destinationUF: string;
  freightValue: number;
  isSubcontracted?: boolean;
  isExempt?: boolean;
  simplesEffectiveIcmsRate?: number;
}): RouteFreightIcmsCalculation {
  const { originUF, destinationUF, freightValue, isSubcontracted = false, isExempt = false, simplesEffectiveIcmsRate = 3.5 } = params;
  
  const isInternal = originUF.toUpperCase().trim() === destinationUF.toUpperCase().trim();
  const appliedRate = isInternal 
    ? getStandardIcmsRateForUF(originUF) 
    : getInterstateFreightIcmsRate(originUF, destinationUF);

  let grossDebit = 0;
  let creditPresumed = 0;
  let netPayable = 0;
  let legalBasis = '';

  if (isSubcontracted) {
    grossDebit = 0;
    creditPresumed = 0;
    netPayable = 0;
    legalBasis = `Convênio ICMS 25/90 e ${BRAZILIAN_STATES_ICMS[originUF.toUpperCase()]?.subcontractLegalBasis || 'Legislação Estadual'} (dispensa da subcontratada)`;
  } else if (isExempt) {
    grossDebit = 0;
    creditPresumed = 0;
    netPayable = 0;
    legalBasis = 'Isenção Estadual / Não incidência na UF (LC 123/06 Art. 18 § 4º-A)';
  } else {
    grossDebit = +(freightValue * (appliedRate / 100)).toFixed(2);
    // Convênio ICMS 106/96: 20% sobre o débito do imposto
    creditPresumed = +(grossDebit * 0.20).toFixed(2);
    netPayable = +(grossDebit - creditPresumed).toFixed(2);
    legalBasis = `Resolução SF 22/89 (${appliedRate}%) c/c Convênio ICMS 106/96 (Crédito Presumido de 20%)`;
  }

  const effectiveTaxRatePercent = freightValue > 0 ? +((netPayable / freightValue) * 100).toFixed(2) : 0;
  
  // Comparação com Simples Nacional no DAS
  const inDasIcmsAmount = isSubcontracted || isExempt ? 0 : +(freightValue * (simplesEffectiveIcmsRate / 100)).toFixed(2);
  const savingsVsNormalRegime = Math.max(0, netPayable - inDasIcmsAmount);

  return {
    originUF,
    destinationUF,
    freightValue,
    isInternal,
    isSubcontracted,
    isExempt,
    appliedIcmsRate: appliedRate,
    grossIcmsDebit: grossDebit,
    presumedCreditRate: 20,
    presumedCreditAmount: creditPresumed,
    netIcmsPayable: netPayable,
    effectiveTaxRatePercent,
    legalBasis,
    simplesComparison: {
      inDasIcmsRateEstimated: simplesEffectiveIcmsRate,
      inDasIcmsAmount,
      savingsVsNormalRegime,
    }
  };
}

export interface EcacClassificationDetail {
  code: EcacRevenueClassification;
  label: string;
  ecacCategory: string; // ex: "PGDAS-D > Prestação de Serviços"
  description: string;
  legalBasis: string;
  deductedTaxes: string[];
  applicableAnexos?: SimplesAnexo[];
  defaultStPercent?: number;
  defaultMonofasicoPercent?: number;
  defaultIssRetidoPercent?: number;
  defaultIsencaoPercent?: number;
  defaultSubcontratacaoPercent?: number;
}

export const ECAC_CLASSIFICATIONS: EcacClassificationDetail[] = [
  {
    code: 'normal',
    label: 'Tributação Normal (Sem Substituição e Sem Retenção)',
    ecacCategory: 'PGDAS-D > Tributação Padrão',
    description: 'Receita tributada integralmente no Simples Nacional com todos os tributos federais, estaduais e municipais na guia DAS.',
    legalBasis: 'LC 123/2006, Art. 18',
    deductedTaxes: [],
    applicableAnexos: ['I', 'II', 'III', 'IV', 'V'],
  },
  {
    code: 'icms_st',
    label: 'Com Substituição Tributária (ST) de ICMS',
    ecacCategory: 'PGDAS-D > Mercadorias com ST de ICMS',
    description: 'Operações com mercadorias cujo ICMS foi recolhido anteriormente por substituição tributária. Deduz 100% da parcela de ICMS da alíquota do DAS.',
    legalBasis: 'LC 123/2006, Art. 18, § 4º-A, I; CF/88 Art. 150, § 7º',
    deductedTaxes: ['ICMS (100%)'],
    applicableAnexos: ['I', 'II'],
    defaultStPercent: 100,
  },
  {
    code: 'transporte_subcontratado',
    label: 'Subcontratação de Transporte (Convênio ICMS 25/90)',
    ecacCategory: 'PGDAS-D > Transporte com ICMS Dispensado/ST',
    description: 'Frete executado como transportadora subcontratada. O ICMS é de responsabilidade da contratante inicial. A subcontratada deduz 100% da parcela de ICMS no PGDAS-D.',
    legalBasis: 'Convênio ICMS 25/90; LC 123/2006, Art. 18, § 4º-A',
    deductedTaxes: ['ICMS Frete (100%)'],
    applicableAnexos: ['III'],
    defaultSubcontratacaoPercent: 100,
  },
  {
    code: 'iss_retido',
    label: 'Com Retenção de ISS pelo Tomador',
    ecacCategory: 'PGDAS-D > Serviços com Retenção na Fonte de ISS',
    description: 'Prestação de serviços em que o tomador retém o ISS na fonte conforme Art. 3º da LC 116/2003 e Art. 21, § 4º da LC 123/2006. Deduz 100% da parcela de ISS da guia DAS.',
    legalBasis: 'LC 116/2003, Art. 3º; LC 123/2006, Art. 21, § 4º',
    deductedTaxes: ['ISS (100%)'],
    applicableAnexos: ['III', 'IV', 'V'],
    defaultIssRetidoPercent: 100,
  },
  {
    code: 'iss_st',
    label: 'Com Substituição Tributária de ISS',
    ecacCategory: 'PGDAS-D > Serviços com ISS por Substituição Tributária',
    description: 'Serviços sujeitos à substituição tributária por legislação municipal (Art. 6º da LC 116/2003). A parcela de ISS é deduzida da guia DAS.',
    legalBasis: 'LC 116/2003, Art. 6º; LC 123/2006, Art. 18, § 4º-A',
    deductedTaxes: ['ISS (100%)'],
    applicableAnexos: ['III', 'IV', 'V'],
    defaultIssRetidoPercent: 100,
  },
  {
    code: 'exterior_servico',
    label: 'Prestação de Serviços para o Exterior (Exportação de Serviços)',
    ecacCategory: 'PGDAS-D > Exportação de Serviços',
    description: 'Serviços prestados a pessoa física ou jurídica residente no exterior cujo resultado ocorra fora do país. Imunidade de PIS, COFINS e ISS. Recolhe apenas IRPJ, CSLL e CPP na guia DAS.',
    legalBasis: 'LC 123/2006, Art. 18, § 4º-A; LC 116/2003, Art. 2º, I; CF/88 Art. 149, § 2º, I',
    deductedTaxes: ['PIS (100%)', 'COFINS (100%)', 'ISS (100%)'],
    applicableAnexos: ['III', 'IV', 'V'],
  },
  {
    code: 'exterior_mercadoria',
    label: 'Venda de Mercadorias para o Exterior (Exportação Comercial)',
    ecacCategory: 'PGDAS-D > Exportação de Mercadorias',
    description: 'Exportação direta ou indireta de mercadorias. Imunidade de PIS, COFINS, ICMS e IPI. Recolhe apenas IRPJ, CSLL e CPP na guia DAS.',
    legalBasis: 'CF/88 Art. 149 § 2º I e Art. 155 § 2º X "a"; LC 123/2006 Art. 18 § 4º-A',
    deductedTaxes: ['PIS (100%)', 'COFINS (100%)', 'ICMS (100%)', 'IPI (100%)'],
    applicableAnexos: ['I', 'II'],
  },
  {
    code: 'pis_cofins_monofasico',
    label: 'Com Tributação Monofásica de PIS e COFINS',
    ecacCategory: 'PGDAS-D > Mercadorias com PIS/COFINS Monofásico',
    description: 'Revenda de produtos sujeitos à incidência monofásica (autopeças, cosméticos, farmacêuticos, bebidas, combustíveis). Deduz 100% de PIS e COFINS no DAS.',
    legalBasis: 'Lei nº 10.147/2000; LC 123/2006, Art. 18, § 4º-A, I',
    deductedTaxes: ['PIS (100%)', 'COFINS (100%)'],
    applicableAnexos: ['I'],
    defaultMonofasicoPercent: 100,
  },
  {
    code: 'icms_isencao_estadual',
    label: 'Com Isenção de ICMS concedida pelo Estado (ex: PR até R$ 360k)',
    ecacCategory: 'PGDAS-D > Isenção de ICMS da Legislação Estadual',
    description: 'Operações com isenção estadual no Simples Nacional (ex: Paraná até R$ 360k conforme Lei Estadual nº 15.342/2006, RS até R$ 360k). Deduz 100% da parcela de ICMS da guia DAS.',
    legalBasis: 'LC 123/2006, Art. 19; Lei Estadual nº 15.342/2006 (PR)',
    deductedTaxes: ['ICMS (100%)'],
    applicableAnexos: ['I', 'II', 'III'],
    defaultIsencaoPercent: 100,
  },
  {
    code: 'icms_reducao_estadual',
    label: 'Com Redução de ICMS concedida pelo Estado (ex: PR acima de R$ 360k)',
    ecacCategory: 'PGDAS-D > Redução de Base / Benefício de ICMS Estadual',
    description: 'Operações com percentual de redução sobre a parcela de ICMS do Simples (ex: Paraná de 62,5% a 20% conforme faixas da Lei Estadual nº 15.342/2006).',
    legalBasis: 'LC 123/2006, Art. 19; Lei Estadual nº 15.342/2006 (PR)',
    deductedTaxes: ['ICMS (Percentual da Lei Estadual)'],
    applicableAnexos: ['I', 'II', 'III'],
  },
  {
    code: 'iss_isencao_municipal',
    label: 'Com Isenção de ISS concedida pelo Município',
    ecacCategory: 'PGDAS-D > Isenção de ISS da Legislação Municipal',
    description: 'Serviços com isenção de ISS estabelecida pelo município da empresa. Deduz 100% da parcela de ISS da guia DAS.',
    legalBasis: 'LC 123/2006, Art. 20; Legislação Tributária Municipal',
    deductedTaxes: ['ISS (100%)'],
    applicableAnexos: ['III', 'IV', 'V'],
    defaultIsencaoPercent: 100,
  },
  {
    code: 'personalizado',
    label: 'Personalizado (Percentuais Mistos de ST, Retenção e Benefícios)',
    ecacCategory: 'PGDAS-D > Segregação Personalizada Mista',
    description: 'Configuração manual e granular de percentuais de substituição tributária, retenção, monofásico e isenções.',
    legalBasis: 'LC 123/2006, Art. 18, § 4º-A',
    deductedTaxes: ['Conforme percentuais informados'],
    applicableAnexos: ['I', 'II', 'III', 'IV', 'V'],
  },
];

export interface Bracket {
  limit: number;
  nominalRate: number; // Decimal (ex: 0.04)
  deduction: number;
  percentBreakdown: TaxBreakdown; // Repartição dos tributos no anexo
}

export const ANEXO_TABLES: Record<SimplesAnexo, Bracket[]> = {
  I: [
    { limit: 180000, nominalRate: 0.04, deduction: 0, percentBreakdown: { irpj: 0.055, csll: 0.035, cofins: 0.1274, pis: 0.0276, cpp: 0.415, icms: 0.34, iss: 0 } },
    { limit: 360000, nominalRate: 0.073, deduction: 5940, percentBreakdown: { irpj: 0.055, csll: 0.035, cofins: 0.1274, pis: 0.0276, cpp: 0.415, icms: 0.34, iss: 0 } },
    { limit: 720000, nominalRate: 0.095, deduction: 13860, percentBreakdown: { irpj: 0.055, csll: 0.035, cofins: 0.1274, pis: 0.0276, cpp: 0.42, icms: 0.335, iss: 0 } },
    { limit: 1800000, nominalRate: 0.107, deduction: 22500, percentBreakdown: { irpj: 0.055, csll: 0.035, cofins: 0.1274, pis: 0.0276, cpp: 0.42, icms: 0.335, iss: 0 } },
    { limit: 3600000, nominalRate: 0.143, deduction: 87300, percentBreakdown: { irpj: 0.055, csll: 0.035, cofins: 0.1274, pis: 0.0276, cpp: 0.42, icms: 0.335, iss: 0 } },
    { limit: 4800000, nominalRate: 0.19, deduction: 378000, percentBreakdown: { irpj: 0.135, csll: 0.10, cofins: 0.2827, pis: 0.0613, cpp: 0.421, icms: 0, iss: 0 } },
  ],
  II: [
    { limit: 180000, nominalRate: 0.045, deduction: 0, percentBreakdown: { irpj: 0.055, csll: 0.035, cofins: 0.1151, pis: 0.0249, cpp: 0.375, icms: 0.32, iss: 0 } },
    { limit: 360000, nominalRate: 0.078, deduction: 5940, percentBreakdown: { irpj: 0.055, csll: 0.035, cofins: 0.1151, pis: 0.0249, cpp: 0.375, icms: 0.32, iss: 0 } },
    { limit: 720000, nominalRate: 0.10, deduction: 13860, percentBreakdown: { irpj: 0.055, csll: 0.035, cofins: 0.1151, pis: 0.0249, cpp: 0.375, icms: 0.32, iss: 0 } },
    { limit: 1800000, nominalRate: 0.112, deduction: 22500, percentBreakdown: { irpj: 0.055, csll: 0.035, cofins: 0.1151, pis: 0.0249, cpp: 0.375, icms: 0.32, iss: 0 } },
    { limit: 3600000, nominalRate: 0.147, deduction: 85500, percentBreakdown: { irpj: 0.055, csll: 0.035, cofins: 0.1151, pis: 0.0249, cpp: 0.375, icms: 0.32, iss: 0 } },
    { limit: 4800000, nominalRate: 0.30, deduction: 720000, percentBreakdown: { irpj: 0.085, csll: 0.075, cofins: 0.2096, pis: 0.0454, cpp: 0.585, icms: 0, iss: 0 } },
  ],
  III: [
    { limit: 180000, nominalRate: 0.06, deduction: 0, percentBreakdown: { irpj: 0.04, csll: 0.035, cofins: 0.1282, pis: 0.0278, cpp: 0.434, icms: 0, iss: 0.335 } },
    { limit: 360000, nominalRate: 0.112, deduction: 9360, percentBreakdown: { irpj: 0.04, csll: 0.035, cofins: 0.1405, pis: 0.0305, cpp: 0.434, icms: 0, iss: 0.32 } },
    { limit: 720000, nominalRate: 0.135, deduction: 17640, percentBreakdown: { irpj: 0.04, csll: 0.035, cofins: 0.1364, pis: 0.0296, cpp: 0.434, icms: 0, iss: 0.325 } },
    { limit: 1800000, nominalRate: 0.16, deduction: 35640, percentBreakdown: { irpj: 0.04, csll: 0.035, cofins: 0.1364, pis: 0.0296, cpp: 0.434, icms: 0, iss: 0.325 } },
    { limit: 3600000, nominalRate: 0.21, deduction: 125640, percentBreakdown: { irpj: 0.04, csll: 0.035, cofins: 0.1282, pis: 0.0278, cpp: 0.434, icms: 0, iss: 0.335 } },
    { limit: 4800000, nominalRate: 0.33, deduction: 648000, percentBreakdown: { irpj: 0.35, csll: 0.15, cofins: 0.1603, pis: 0.0347, cpp: 0.305, icms: 0, iss: 0 } },
  ],
  IV: [
    { limit: 180000, nominalRate: 0.045, deduction: 0, percentBreakdown: { irpj: 0.188, csll: 0.152, cofins: 0.1767, pis: 0.0383, cpp: 0, icms: 0, iss: 0.445 } },
    { limit: 360000, nominalRate: 0.09, deduction: 8100, percentBreakdown: { irpj: 0.198, csll: 0.152, cofins: 0.2055, pis: 0.0445, cpp: 0, icms: 0, iss: 0.40 } },
    { limit: 720000, nominalRate: 0.102, deduction: 12420, percentBreakdown: { irpj: 0.208, csll: 0.152, cofins: 0.1973, pis: 0.0427, cpp: 0, icms: 0, iss: 0.40 } },
    { limit: 1800000, nominalRate: 0.14, deduction: 39780, percentBreakdown: { irpj: 0.178, csll: 0.192, cofins: 0.189, pis: 0.041, cpp: 0, icms: 0, iss: 0.40 } },
    { limit: 3600000, nominalRate: 0.22, deduction: 183780, percentBreakdown: { irpj: 0.188, csll: 0.212, cofins: 0.1603, pis: 0.0347, cpp: 0, icms: 0, iss: 0.405 } },
    { limit: 4800000, nominalRate: 0.33, deduction: 828000, percentBreakdown: { irpj: 0.535, csll: 0.215, cofins: 0.2055, pis: 0.0445, cpp: 0, icms: 0, iss: 0 } },
  ],
  V: [
    { limit: 180000, nominalRate: 0.155, deduction: 0, percentBreakdown: { irpj: 0.25, csll: 0.15, cofins: 0.141, pis: 0.0305, cpp: 0.2885, icms: 0, iss: 0.14 } },
    { limit: 360000, nominalRate: 0.18, deduction: 4500, percentBreakdown: { irpj: 0.23, csll: 0.15, cofins: 0.141, pis: 0.0305, cpp: 0.2785, icms: 0, iss: 0.17 } },
    { limit: 720000, nominalRate: 0.195, deduction: 9900, percentBreakdown: { irpj: 0.24, csll: 0.15, cofins: 0.1492, pis: 0.0323, cpp: 0.2385, icms: 0, iss: 0.19 } },
    { limit: 1800000, nominalRate: 0.205, deduction: 17100, percentBreakdown: { irpj: 0.21, csll: 0.15, cofins: 0.1574, pis: 0.0341, cpp: 0.2385, icms: 0, iss: 0.21 } },
    { limit: 3600000, nominalRate: 0.23, deduction: 62100, percentBreakdown: { irpj: 0.23, csll: 0.125, cofins: 0.141, pis: 0.0305, cpp: 0.2385, icms: 0, iss: 0.235 } },
    { limit: 4800000, nominalRate: 0.305, deduction: 540000, percentBreakdown: { irpj: 0.35, csll: 0.155, cofins: 0.1644, pis: 0.0356, cpp: 0.295, icms: 0, iss: 0 } },
  ],
};

export interface ParanaIcmsBracket {
  faixa: string;
  rbt12Min: number;
  rbt12Max: number;
  limit: number;
  aliqNominalTabI: number; // % (Comércio / Transporte / Comunicação)
  deducaoTabI: number; // R$
  aliqNominalTabII: number; // % (Indústria)
  deducaoTabII: number; // R$
  label: string;
  rule: string;
  reductionPercentRef?: number; // Para faixas isentas (100%)
}

/**
 * Tabelas I e II do Anexo XI do RICMS/PR (Decreto Estadual nº 8.660/2018 e Lei nº 15.342/2006)
 * Tabela I: Comércio, Transporte de Cargas e Passageiros Intermunicipal/Interestadual e Comunicação
 * Tabela II: Indústria (Fabricação Própria)
 */
export const PARANA_ICMS_SIMPLES_BRACKETS: ParanaIcmsBracket[] = [
  {
    faixa: 'Faixa 1',
    rbt12Min: 0,
    rbt12Max: 180000,
    limit: 180000,
    aliqNominalTabI: 0,
    deducaoTabI: 0,
    aliqNominalTabII: 0,
    deducaoTabII: 0,
    label: '1ª Faixa (até R$ 180.000,00)',
    rule: 'Isenção Total (100% de desconto no PGDAS-D)',
    reductionPercentRef: 100,
  },
  {
    faixa: 'Faixa 2',
    rbt12Min: 180000.01,
    rbt12Max: 360000,
    limit: 360000,
    aliqNominalTabI: 0,
    deducaoTabI: 0,
    aliqNominalTabII: 0,
    deducaoTabII: 0,
    label: '2ª Faixa (R$ 180.000,01 a R$ 360.000,00)',
    rule: 'Isenção Total (100% de desconto no PGDAS-D)',
    reductionPercentRef: 100,
  },
  {
    faixa: 'Faixa 3',
    rbt12Min: 360000.01,
    rbt12Max: 720000,
    limit: 720000,
    aliqNominalTabI: 3.1825,
    deducaoTabI: 11457.00,
    aliqNominalTabII: 3.1825,
    deducaoTabII: 11520.00,
    label: '3ª Faixa (R$ 360.000,01 a R$ 720.000,00)',
    rule: 'Redução Dinâmica: (1 - (Alíq. PR / Alíq. Federal)) * 100',
  },
  {
    faixa: 'Faixa 4',
    rbt12Min: 720000.01,
    rbt12Max: 1800000,
    limit: 1800000,
    aliqNominalTabI: 3.5845,
    deducaoTabI: 14351.40,
    aliqNominalTabII: 3.5845,
    deducaoTabII: 14284.80,
    label: '4ª Faixa (R$ 720.000,01 a R$ 1.800.000,00)',
    rule: 'Redução Dinâmica: (1 - (Alíq. PR / Alíq. Federal)) * 100',
  },
  {
    faixa: 'Faixa 5',
    rbt12Min: 1800000.01,
    rbt12Max: 3600000,
    limit: 3600000,
    aliqNominalTabI: 4.7905,
    deducaoTabI: 36059.40,
    aliqNominalTabII: 4.7905,
    deducaoTabII: 34444.80,
    label: '5ª Faixa (R$ 1.800.000,01 a R$ 3.600.000,00)',
    rule: 'Redução Dinâmica: (1 - (Alíq. PR / Alíq. Federal)) * 100',
  },
];

/**
 * Calcula dinamicamente o Percentual de Redução de ICMS no Paraná para o PGDAS-D
 * Conforme Decreto Estadual nº 8.660/2018 e Anexo XI do RICMS/PR (Tabelas I e II c/c Lei Estadual nº 15.342/2006)
 *
 * Cenário 1 (RBT12 até R$ 360.000,00): Isenção Total (100% no PGDAS-D)
 * Cenário 2 (RBT12 de R$ 360.000,01 a R$ 3.600.000,00):
 *   % Redução = (1 - (Alíquota Efetiva do ICMS/PR / Alíquota Efetiva do ICMS pela LC 123)) * 100
 * Cenário 3 (RBT12 acima de R$ 3.600.000,00): Sublimite Estadual Excedido (ICMS por fora na SEFA/PR)
 */
export function calculateParanaSimplesIcmsReduction(
  rbt12: number,
  anexo: SimplesAnexo = 'I',
  isTransport: boolean = false
): ParanaCalculationDetails {
  const isAnexoII = anexo === 'II';
  const effectiveFederalAnexo: SimplesAnexo = isAnexoII ? 'II' : (isTransport ? 'III' : 'I');
  const tabelaNome: 'Tabela I - Comércio e Transporte' | 'Tabela II - Indústria' = isAnexoII 
    ? 'Tabela II - Indústria' 
    : 'Tabela I - Comércio e Transporte';

  // Cenário 1: RBT12 até R$ 360.000,00 (Isenção Total)
  if (rbt12 <= 360000) {
    const isFaixa1 = rbt12 <= 180000;
    const federalNominal = isAnexoII ? (isFaixa1 ? 4.5 : 7.8) : (isFaixa1 ? 4.0 : 7.3);
    const federalDed = isFaixa1 ? 0 : 5940;
    const federalIcmsRepart = isAnexoII ? 32.0 : 34.0;
    const federalAliqGeral = rbt12 > 0 ? ((rbt12 * (federalNominal / 100)) - federalDed) / rbt12 : (federalNominal / 100);
    const federalAliqIcms = federalAliqGeral * (federalIcmsRepart / 100);

    return {
      scenario: 1,
      anexoUsed: effectiveFederalAnexo,
      tabelaNome,
      aliqNominalFederal: federalNominal,
      deducaoFederal: federalDed,
      reparticaoIcmsFederal: federalIcmsRepart,
      aliqEfetivaFederalGeral: federalAliqGeral * 100,
      aliqEfetivaFederalIcms: federalAliqIcms * 100,
      aliqNominalPR: 0,
      deducaoPR: 0,
      aliqEfetivaPR: 0,
      reductionPercent: 100,
      pgdasInstructions: 'No PGDAS-D, selecione a opção de que a receita possui "Isenção/Redução de ICMS" e informe 100% no campo de redução. O sistema zerará a parcela de ICMS na apuração do DAS.',
      legalBasis: 'Decreto Estadual nº 8.660/2018 e RICMS/PR (Anexo XI, Art. 2º c/c Lei Estadual nº 15.342/2006, Art. 2º, I)',
    };
  }

  // Cenário 3: Sublimite Estadual Excedido (> R$ 3.600.000,00)
  if (rbt12 > STATE_SUBLIMIT) {
    return {
      scenario: 3,
      anexoUsed: effectiveFederalAnexo,
      tabelaNome,
      aliqNominalFederal: 0,
      deducaoFederal: 0,
      reparticaoIcmsFederal: 0,
      aliqEfetivaFederalGeral: 0,
      aliqEfetivaFederalIcms: 0,
      aliqNominalPR: 0,
      deducaoPR: 0,
      aliqEfetivaPR: 0,
      reductionPercent: 0,
      pgdasInstructions: 'Sublimite estadual de R$ 3.600.000,00 ultrapassado. O ICMS não pode ser recolhido pelo Simples no DAS, devendo ser apurado no regime normal de débito e crédito diretamente na SEFA/PR com entrega de EFD/SPED.',
      legalBasis: 'LC 123/2006, Art. 19 e 20; RICMS/PR',
    };
  }

  // Cenário 2: RBT12 de R$ 360.000,01 a R$ 3.600.000,00 (Redução Parcial)
  // 1. Alíquota Efetiva Federal (LC 123/2006)
  const federalBrackets = ANEXO_TABLES[effectiveFederalAnexo] || ANEXO_TABLES['I'];
  let federalBracket = federalBrackets[federalBrackets.length - 1];
  for (const b of federalBrackets) {
    if (rbt12 <= b.limit) {
      federalBracket = b;
      break;
    }
  }

  const aliqNomFed = federalBracket.nominalRate;
  const dedFed = federalBracket.deduction;
  const aliqEfFedGeral = ((rbt12 * aliqNomFed) - dedFed) / rbt12;
  
  // Repartição de ICMS
  let reparticaoIcms = federalBracket.percentBreakdown.icms || 0;
  if (effectiveFederalAnexo === 'III' && isTransport) {
    reparticaoIcms = federalBracket.percentBreakdown.iss || 0.335;
  }
  const aliqEfFedIcms = aliqEfFedGeral * reparticaoIcms;

  // 2. Alíquota Efetiva Estadual (Tabela I ou II do Anexo XI do RICMS/PR)
  let aliqNomPR = 0;
  let dedPR = 0;

  if (rbt12 <= 720000) {
    // 3ª Faixa
    aliqNomPR = 0.031825;
    dedPR = isAnexoII ? 11520.00 : 11457.00;
  } else if (rbt12 <= 1800000) {
    // 4ª Faixa
    aliqNomPR = 0.035845;
    dedPR = isAnexoII ? 14284.80 : 14351.40;
  } else {
    // 5ª Faixa (até 3.600.000,00)
    aliqNomPR = 0.047905;
    dedPR = isAnexoII ? 34444.80 : 36059.40;
  }

  const aliqEfPR = ((rbt12 * aliqNomPR) - dedPR) / rbt12;

  // 3. Fórmula do Percentual de Redução:
  // % Redução = (1 - (AliqEfetivaPR / AliqEfetivaFederalICMS)) * 100
  let reductionPercent = 0;
  if (aliqEfFedIcms > 0) {
    reductionPercent = (1 - (aliqEfPR / aliqEfFedIcms)) * 100;
  }
  reductionPercent = Math.max(0, Math.min(100, reductionPercent));

  return {
    scenario: 2,
    anexoUsed: effectiveFederalAnexo,
    tabelaNome,
    aliqNominalFederal: aliqNomFed * 100,
    deducaoFederal: dedFed,
    reparticaoIcmsFederal: reparticaoIcms * 100,
    aliqEfetivaFederalGeral: aliqEfFedGeral * 100,
    aliqEfetivaFederalIcms: aliqEfFedIcms * 100,
    aliqNominalPR: aliqNomPR * 100,
    deducaoPR: dedPR,
    aliqEfetivaPR: aliqEfPR * 100,
    reductionPercent: Number(reductionPercent.toFixed(2)),
    pgdasInstructions: `No PGDAS-D, marque o campo de redução de ICMS e digite ${reductionPercent.toFixed(2)}%. O próprio sistema do governo reduzirá o valor do imposto estadual de forma automática.`,
    legalBasis: 'Decreto Estadual nº 8.660/2018 e RICMS/PR (Anexo XI, Tabelas I e II c/c Lei Estadual nº 15.342/2006)',
  };
}

/**
 * Retorna as regras específicas de ICMS estadual aplicáveis ao Simples Nacional (ex: Paraná Lei 15.342/06, RS Lei 13.036/08)
 */
export function getStateSimplesIcmsBenefit(
  uf?: string, 
  rbt12: number = 0, 
  monthlyInternalIcmsTaxRaw: number = 0,
  anexo: SimplesAnexo = 'I',
  isTransport: boolean = false
): StateSimplesIcmsBenefit {
  const stateUf = (uf || 'SP').toUpperCase().trim();
  const stateName = BRAZILIAN_STATES_ICMS[stateUf]?.name || stateUf;

  if (stateUf === 'PR') {
    const prDetails = calculateParanaSimplesIcmsReduction(rbt12, anexo, isTransport);

    if (prDetails.scenario === 1) {
      const monthlySavings = monthlyInternalIcmsTaxRaw;
      const bracketName = rbt12 <= 180000 ? 'Faixa 1' : 'Faixa 2';
      return {
        uf: 'PR',
        stateName: 'Paraná',
        hasBenefit: true,
        legalBasis: prDetails.legalBasis,
        rbt12,
        isExempt: true,
        reductionPercent: 100,
        appliedBracket: bracketName,
        bracketDescription: `${bracketName} (até R$ 360.000,00): ISENÇÃO TOTAL de ICMS (100% de abatimento no PGDAS-D)`,
        benefitType: 'isencao_total',
        monthlySavingsEstimated: monthlySavings,
        annualSavingsEstimated: monthlySavings * 12,
        notes: 'No Paraná, empresas com receita bruta acumulada até R$ 360 mil possuem ISENÇÃO TOTAL do ICMS estadual no Simples Nacional (Decreto Estadual nº 8.660/2018 e RICMS/PR Anexo XI). No preenchimento do PGDAS-D, selecione "Isenção/Redução de ICMS" com percentual de 100%.',
        paranaDetails: prDetails,
      };
    } else if (prDetails.scenario === 2) {
      const reductionPercent = prDetails.reductionPercent;
      const monthlySavings = monthlyInternalIcmsTaxRaw * (reductionPercent / 100);
      const bracketName = rbt12 <= 720000 ? 'Faixa 3' : rbt12 <= 1800000 ? 'Faixa 4' : 'Faixa 5';
      return {
        uf: 'PR',
        stateName: 'Paraná',
        hasBenefit: true,
        legalBasis: prDetails.legalBasis,
        rbt12,
        isExempt: false,
        reductionPercent,
        appliedBracket: bracketName,
        bracketDescription: `${bracketName}: Redução calculada de ${reductionPercent.toFixed(2)}% no ICMS do Simples (Alíq. PR: ${prDetails.aliqEfetivaPR.toFixed(2)}% vs Federal: ${prDetails.aliqEfetivaFederalIcms.toFixed(2)}%)`,
        benefitType: 'reducao_progressiva',
        monthlySavingsEstimated: monthlySavings,
        annualSavingsEstimated: monthlySavings * 12,
        notes: `No Paraná, empresas com RBT12 entre R$ 360k e R$ 3,6M calculam a redução pela regra do Decreto nº 8.660/2018 e Anexo XI do RICMS/PR: % Redução = (1 - (Alíq. PR / Alíq. Fed)) * 100 = ${reductionPercent.toFixed(2)}%. No PGDAS-D, informe ${reductionPercent.toFixed(2)}% no campo de redução de ICMS.`,
        paranaDetails: prDetails,
      };
    } else {
      return {
        uf: 'PR',
        stateName: 'Paraná',
        hasBenefit: false,
        legalBasis: 'LC 123/2006 Art. 19 c/c Sublimite Estadual do Paraná (R$ 3,6M)',
        rbt12,
        isExempt: false,
        reductionPercent: 0,
        appliedBracket: 'Sublimite Excedido',
        bracketDescription: 'Acima de R$ 3.600.000,00: Sublimite Estadual Excedido (ICMS fora do Simples)',
        benefitType: 'sublimite_excedido',
        monthlySavingsEstimated: 0,
        annualSavingsEstimated: 0,
        notes: 'Receita acumulada acima de R$ 3,6M no Paraná. O ICMS é recolhido fora do Simples, no regime ordinário de débito e crédito da SEFAZ/PR com entrega de EFD/SPED.',
        paranaDetails: prDetails,
      };
    }
  }

  if (stateUf === 'RS') {
    // Rio Grande do Sul: Lei Estadual nº 13.036/2008
    if (rbt12 <= 360000) {
      const monthlySavings = monthlyInternalIcmsTaxRaw;
      return {
        uf: 'RS',
        stateName: 'Rio Grande do Sul',
        hasBenefit: true,
        legalBasis: 'Lei Estadual nº 13.036/2008 e RICMS/RS',
        rbt12,
        isExempt: true,
        reductionPercent: 100,
        appliedBracket: 'Faixa 1',
        bracketDescription: 'Faixa 1 (até R$ 360.000,00): Isenção de 100% de ICMS no Simples (RS)',
        benefitType: 'isencao_total',
        monthlySavingsEstimated: monthlySavings,
        annualSavingsEstimated: monthlySavings * 12,
        notes: 'No Rio Grande do Sul, empresas com faturamento anual de até R$ 360.000,00 gozam de isenção de 100% na parcela de ICMS no Simples (Lei 13.036/2008).',
      };
    } else if (rbt12 <= 720000) {
      return {
        uf: 'RS',
        stateName: 'Rio Grande do Sul',
        hasBenefit: true,
        legalBasis: 'Lei Estadual nº 13.036/2008',
        rbt12,
        isExempt: false,
        reductionPercent: 50.0,
        appliedBracket: 'Faixa 2',
        bracketDescription: 'Faixa 2 (R$ 360k a R$ 720k): Redução de 50% no ICMS do Simples (RS)',
        benefitType: 'reducao_progressiva',
        monthlySavingsEstimated: monthlyInternalIcmsTaxRaw * 0.5,
        annualSavingsEstimated: monthlyInternalIcmsTaxRaw * 0.5 * 12,
        notes: 'Redução de 50% sobre a parcela estadual de ICMS no Rio Grande do Sul.',
      };
    } else if (rbt12 <= 1440000) {
      return {
        uf: 'RS',
        stateName: 'Rio Grande do Sul',
        hasBenefit: true,
        legalBasis: 'Lei Estadual nº 13.036/2008',
        rbt12,
        isExempt: false,
        reductionPercent: 35.0,
        bracketDescription: 'Faixa 3 (R$ 720k a R$ 1,44M): Redução de 35% no ICMS do Simples (RS)',
        benefitType: 'reducao_progressiva',
        monthlySavingsEstimated: monthlyInternalIcmsTaxRaw * 0.35,
        annualSavingsEstimated: monthlyInternalIcmsTaxRaw * 0.35 * 12,
        notes: 'Redução de 35% sobre a parcela estadual de ICMS no Rio Grande do Sul.',
      };
    } else if (rbt12 <= 2160000) {
      return {
        uf: 'RS',
        stateName: 'Rio Grande do Sul',
        hasBenefit: true,
        legalBasis: 'Lei Estadual nº 13.036/2008',
        rbt12,
        isExempt: false,
        reductionPercent: 20.0,
        bracketDescription: 'Faixa 4 (R$ 1,44M a R$ 2,16M): Redução de 20% no ICMS do Simples (RS)',
        benefitType: 'reducao_progressiva',
        monthlySavingsEstimated: monthlyInternalIcmsTaxRaw * 0.20,
        annualSavingsEstimated: monthlyInternalIcmsTaxRaw * 0.20 * 12,
        notes: 'Redução de 20% sobre a parcela estadual de ICMS no Rio Grande do Sul.',
      };
    } else if (rbt12 <= 3600000) {
      return {
        uf: 'RS',
        stateName: 'Rio Grande do Sul',
        hasBenefit: true,
        legalBasis: 'Lei Estadual nº 13.036/2008',
        rbt12,
        isExempt: false,
        reductionPercent: 10.0,
        bracketDescription: 'Faixa 5 (R$ 2,16M a R$ 3,6M): Redução de 10% no ICMS do Simples (RS)',
        benefitType: 'reducao_progressiva',
        monthlySavingsEstimated: monthlyInternalIcmsTaxRaw * 0.10,
        annualSavingsEstimated: monthlyInternalIcmsTaxRaw * 0.10 * 12,
        notes: 'Redução de 10% sobre a parcela estadual de ICMS no Rio Grande do Sul até o sublimite.',
      };
    }
  }

  if (stateUf === 'RJ' && rbt12 <= 120000) {
    return {
      uf: 'RJ',
      stateName: 'Rio de Janeiro',
      hasBenefit: true,
      legalBasis: 'Lei Estadual nº 5.147/2007 (RJ)',
      rbt12,
      isExempt: true,
      reductionPercent: 100,
      bracketDescription: 'ME até R$ 120.000,00: Isenção de ICMS no Simples (RJ)',
      benefitType: 'isencao_total',
      monthlySavingsEstimated: monthlyInternalIcmsTaxRaw,
      annualSavingsEstimated: monthlyInternalIcmsTaxRaw * 12,
      notes: 'No Rio de Janeiro, microempresas com receita bruta até R$ 120.000,00 gozam de isenção de ICMS no Simples.',
    };
  }

  if (stateUf === 'MG' && rbt12 <= 180000) {
    return {
      uf: 'MG',
      stateName: 'Minas Gerais',
      hasBenefit: true,
      legalBasis: 'Lei Estadual nº 20.824/2013 e RICMS/MG',
      rbt12,
      isExempt: true,
      reductionPercent: 100,
      bracketDescription: '1ª Faixa (até R$ 180.000,00): Isenção setorial de ICMS (MG)',
      benefitType: 'isencao_total',
      monthlySavingsEstimated: monthlyInternalIcmsTaxRaw,
      annualSavingsEstimated: monthlyInternalIcmsTaxRaw * 12,
      notes: 'Minas Gerais concede isenção da parcela de ICMS na 1ª faixa para operações contempladas.',
    };
  }

  const exceedsSub = rbt12 > STATE_SUBLIMIT;
  return {
    uf: stateUf,
    stateName,
    hasBenefit: false,
    legalBasis: exceedsSub ? 'LC 123/2006 Art. 19 (Sublimite Estadual)' : 'Tabela Federal Padrão da LC 123/2006',
    rbt12,
    isExempt: false,
    reductionPercent: 0,
    bracketDescription: exceedsSub 
      ? `Sublimite Estadual de R$ 3,6M Excedido em ${stateUf} (ICMS por fora no Regime Normal)`
      : `Alíquota Federal Integral da LC 123/2006 (Sublimite de R$ 3.600.000,00 em ${stateUf})`,
    benefitType: exceedsSub ? 'sublimite_excedido' : 'padrao_federal',
    monthlySavingsEstimated: 0,
    annualSavingsEstimated: 0,
    notes: exceedsSub 
      ? `Em ${stateUf}, o ICMS é apurado fora do Simples pelo regime de débito e crédito estadual acima de R$ 3,6M.`
      : `Em ${stateUf}, aplica-se a partilha federal padrão da LC 123/2006 sem tabela geral de redução de faixa.`,
  };
}

export interface AnexoActivityDefinition {
  key: string;
  anexo: SimplesAnexo;
  title: string;
  badge: string;
  defaultDesc: string;
  isTransport?: boolean;
  transportType?: TransportType;
  taxJurisdiction: 'estadual_icms' | 'municipal_iss';
  hasST: boolean;
  hasISS: boolean;
  hasFatorR?: boolean;
  presumedProfitRateIRPJ: number;
  presumedProfitRateCSLL: number;
  legalBasis: string;
}

export const DEFAULT_ANEXO_ACTIVITIES: AnexoActivityDefinition[] = [
  {
    key: 'anexo_1',
    anexo: 'I',
    title: 'Anexo I - Comércio (Revenda de Mercadorias)',
    badge: 'Comércio / ICMS',
    defaultDesc: 'Revenda de mercadorias no mercado interno e exterior (Art. 18 § 4º, I)',
    taxJurisdiction: 'estadual_icms',
    hasST: true,
    hasISS: false,
    presumedProfitRateIRPJ: 0.08,
    presumedProfitRateCSLL: 0.12,
    legalBasis: 'LC 123/2006 Art. 18 § 4º, I; Lei 9.249/1995 Art. 15',
  },
  {
    key: 'anexo_2',
    anexo: 'II',
    title: 'Anexo II - Indústria (Fabricação Própria)',
    badge: 'Indústria / ICMS+IPI',
    defaultDesc: 'Venda de produtos industrializados pelo próprio estabelecimento (Art. 18 § 4º, II)',
    taxJurisdiction: 'estadual_icms',
    hasST: true,
    hasISS: false,
    presumedProfitRateIRPJ: 0.08,
    presumedProfitRateCSLL: 0.12,
    legalBasis: 'LC 123/2006 Art. 18 § 4º, II; Lei 9.249/1995 Art. 15',
  },
  {
    key: 'anexo_3_transporte_cargas',
    anexo: 'III',
    title: 'Anexo III (Transporte) - Cargas Intermunicipal/Interestadual (ICMS Normal no DAS)',
    badge: 'CT-e / ICMS no DAS (8% Presumido)',
    defaultDesc: 'Prestação própria com ICMS recolhido no DAS substituindo o ISS (LC 123/06 Art. 18 § 5º-E). Presunção no Lucro Presumido: 8% IRPJ / 12% CSLL.',
    isTransport: true,
    transportType: 'intermunicipal_cargas',
    taxJurisdiction: 'estadual_icms',
    hasST: true,
    hasISS: false,
    presumedProfitRateIRPJ: 0.08,
    presumedProfitRateCSLL: 0.12,
    legalBasis: 'LC 123/2006 Art. 18 § 5º-E; Lei nº 9.249/1995 Art. 15 e Art. 20',
  },
  {
    key: 'anexo_3_transporte_cargas_st',
    anexo: 'III',
    title: 'Anexo III (Transporte) - Cargas Subcontratadas / ICMS ST (ICMS Deduzido no DAS)',
    badge: 'Subcontratação / ICMS Deduzido (8% Presumido)',
    defaultDesc: 'Frete executado como transportadora subcontratada (Convênio ICMS 25/90 c/c LC 123/06 Art. 18 § 4º-A). Parcela de ICMS da alíquota do DAS é 100% deduzida.',
    isTransport: true,
    transportType: 'intermunicipal_cargas',
    taxJurisdiction: 'estadual_icms',
    hasST: true,
    hasISS: false,
    presumedProfitRateIRPJ: 0.08,
    presumedProfitRateCSLL: 0.12,
    legalBasis: 'Convênio ICMS 25/90; LC 123/2006 Art. 18 § 4º-A; Lei 9.249/95 Art. 15',
  },
  {
    key: 'anexo_3_transporte_cargas_isento',
    anexo: 'III',
    title: 'Anexo III (Transporte) - Cargas Isentas / Não Tributadas de ICMS Estadual',
    badge: 'Isenção ICMS Estadual / Sem ICMS no DAS (8% Presumido)',
    defaultDesc: 'Transporte de produtos hortifrutigranjeiros, operações vinculadas à exportação ou benefícios fiscais estaduais da UF. Parcela de ICMS deduzida no DAS.',
    isTransport: true,
    transportType: 'intermunicipal_cargas',
    taxJurisdiction: 'estadual_icms',
    hasST: true,
    hasISS: false,
    presumedProfitRateIRPJ: 0.08,
    presumedProfitRateCSLL: 0.12,
    legalBasis: 'CF/88 Art. 155 § 2º X; LC 123/2006 Art. 18 § 4º-A; Lei 9.249/95',
  },
  {
    key: 'anexo_3_transporte_passageiros',
    anexo: 'III',
    title: 'Anexo III (Transporte) - Passageiros Intermunicipal/Interestadual (ICMS no DAS)',
    badge: 'BP-e / ICMS no DAS (16% Presumido)',
    defaultDesc: 'Transporte de passageiros entre municípios/estados com ICMS no DAS (LC 123/06 Art. 18 § 5º-F). Presunção no Lucro Presumido: 16% IRPJ / 12% CSLL.',
    isTransport: true,
    transportType: 'intermunicipal_passageiros',
    taxJurisdiction: 'estadual_icms',
    hasST: true,
    hasISS: false,
    presumedProfitRateIRPJ: 0.16,
    presumedProfitRateCSLL: 0.12,
    legalBasis: 'LC 123/2006 Art. 18 § 5º-F; Lei nº 9.249/1995 Art. 15 § 1º, III, "a"',
  },
  {
    key: 'anexo_3_transporte_municipal',
    anexo: 'III',
    title: 'Anexo III (Transporte) - Transporte Municipal / Coleta Urbana (ISS Municipal)',
    badge: 'NFS-e / ISS Municipal (32% Presumido)',
    defaultDesc: 'Transporte com início e término no mesmo município: tributado com ISSQN municipal (LC 116/03 Subitem 16.01). Presunção no LP: 32%.',
    isTransport: true,
    transportType: 'municipal',
    taxJurisdiction: 'municipal_iss',
    hasST: false,
    hasISS: true,
    presumedProfitRateIRPJ: 0.32,
    presumedProfitRateCSLL: 0.32,
    legalBasis: 'LC 116/2003 Subitem 16.01; LC 123/2006 Art. 18 § 5º-D',
  },
  {
    key: 'anexo_3_geral',
    anexo: 'III',
    title: 'Anexo III - Serviços em Geral (Locação, Reparos, Manutenção, Saúde)',
    badge: 'Serviços Gerais / ISS Municipal (32% Presumido)',
    defaultDesc: 'Serviços operacionais comuns com incidência de ISSQN ou serviços intelectuais enquadrados via Fator R >= 28%',
    taxJurisdiction: 'municipal_iss',
    hasST: false,
    hasISS: true,
    hasFatorR: true,
    presumedProfitRateIRPJ: 0.32,
    presumedProfitRateCSLL: 0.32,
    legalBasis: 'LC 123/2006 Art. 18 § 5º-B / § 5º-J; LC 116/2003',
  },
  {
    key: 'anexo_4',
    anexo: 'IV',
    title: 'Anexo IV - Serviços Específicos (Advocacia, Obras, Limpeza, Vigilância)',
    badge: 'Serviços / CPP Patronal por Fora',
    defaultDesc: 'Serviços com CPP patronal (20% + RAT + Terceiros) recolhida na GPS/DCTFWeb (Art. 18 § 5º-C)',
    taxJurisdiction: 'municipal_iss',
    hasST: false,
    hasISS: true,
    presumedProfitRateIRPJ: 0.32,
    presumedProfitRateCSLL: 0.32,
    legalBasis: 'LC 123/2006 Art. 18 § 5º-C; Lei nº 8.212/1991',
  },
  {
    key: 'anexo_5',
    anexo: 'V',
    title: 'Anexo V - Serviços Intelectuais / Fator R < 28% (Tecnologia, Engenharia, Consultoria)',
    badge: 'Serviços Intelectuais',
    defaultDesc: 'Tecnologia da informação, perícia, auditoria e engenharia quando Fator R < 28%',
    taxJurisdiction: 'municipal_iss',
    hasST: false,
    hasISS: true,
    hasFatorR: true,
    presumedProfitRateIRPJ: 0.32,
    presumedProfitRateCSLL: 0.32,
    legalBasis: 'LC 123/2006 Art. 18 § 5º-I e § 5º-J',
  },
];

/**
 * Helper to calculate effective rate for a specific Simples anexo and RBT12
 */
export function calculateAnexoEffectiveRate(anexo: SimplesAnexo, rbt12: number): {
  nominalRate: number;
  deduction: number;
  effectiveRate: number;
  bracket: Bracket;
} {
  const brackets = ANEXO_TABLES[anexo] || ANEXO_TABLES['I'];
  const firstBracket = brackets[0];
  if (rbt12 <= 0) {
    return {
      nominalRate: firstBracket.nominalRate,
      deduction: 0,
      effectiveRate: firstBracket.nominalRate,
      bracket: firstBracket,
    };
  }

  let activeBracket = brackets[brackets.length - 1];
  for (const b of brackets) {
    if (rbt12 <= b.limit) {
      activeBracket = b;
      break;
    }
  }

  const nominalRate = activeBracket.nominalRate;
  const deduction = activeBracket.deduction;
  let effectiveRate = ((rbt12 * nominalRate) - deduction) / rbt12;
  effectiveRate = Math.max(firstBracket.nominalRate, effectiveRate);

  return {
    nominalRate,
    deduction,
    effectiveRate,
    bracket: activeBracket,
  };
}

/**
 * Auditoria Pericial de Fornecedores, Prestadores de Serviço e Tomada de Créditos
 * Pondera as aquisições da empresa de acordo com a natureza do custo (mercadorias vs serviços)
 * e os regimes tributários dos fornecedores (Simples Convencional, Simples Híbrido, Regime Normal).
 * Calcula com rigor os créditos de ICMS, CBS (8,8%), IBS (17,7%) e PIS/COFINS (9,25%).
 */
export function calculateSupplierCreditAudit(
  company: CompanyData,
  monthlyRevenueTotal: number
): SupplierCreditAuditResult {
  const totalCostsMonthly = company.inputCostsMonthly !== undefined && company.inputCostsMonthly > 0
    ? company.inputCostsMonthly
    : monthlyRevenueTotal * ((company.inputCostsPercent !== undefined ? company.inputCostsPercent : 40) / 100);

  // Composição padrão inteligente se não configurada
  const isServiceActivity = company.atividadeEmpresa === 'servicos' || company.anexo === 'III' || company.anexo === 'IV' || company.anexo === 'V';
  const isComercioActivity = company.atividadeEmpresa === 'comercio' || company.anexo === 'I';
  const isIndustriaActivity = company.atividadeEmpresa === 'industria' || company.anexo === 'II';

  const defaultGoodsPercent = isServiceActivity ? 20 : isComercioActivity ? 85 : isIndustriaActivity ? 75 : 60;
  const defaultServicesPercent = 100 - defaultGoodsPercent;

  const composition: SupplierTaxComposition = {
    goodsExpensePercent: company.supplierComposition?.goodsExpensePercent ?? defaultGoodsPercent,
    servicesExpensePercent: company.supplierComposition?.servicesExpensePercent ?? defaultServicesPercent,
    simplesConventionalSupplierPercent: company.supplierComposition?.simplesConventionalSupplierPercent ?? 35,
    simplesHibridoSupplierPercent: company.supplierComposition?.simplesHibridoSupplierPercent ?? 15,
    regimeNormalSupplierPercent: company.supplierComposition?.regimeNormalSupplierPercent ?? 50,
    averageSimplesIcmsTransferRate: company.supplierComposition?.averageSimplesIcmsTransferRate ?? 2.8,
    averageSimplesIbsCbsTransferRate: company.supplierComposition?.averageSimplesIbsCbsTransferRate ?? 3.5,
  };

  // Normalização de percentuais para fechar em 100%
  const totalSupplierRegimePercents = composition.simplesConventionalSupplierPercent + composition.simplesHibridoSupplierPercent + composition.regimeNormalSupplierPercent;
  const normFactor = totalSupplierRegimePercents > 0 ? 100 / totalSupplierRegimePercents : 1;
  const normSimplesConv = (composition.simplesConventionalSupplierPercent * normFactor) / 100;
  const normSimplesHibrido = (composition.simplesHibridoSupplierPercent * normFactor) / 100;
  const normRegimeNormal = (composition.regimeNormalSupplierPercent * normFactor) / 100;

  const totalExpenseNaturePercents = composition.goodsExpensePercent + composition.servicesExpensePercent;
  const natureFactor = totalExpenseNaturePercents > 0 ? 100 / totalExpenseNaturePercents : 1;
  const normGoodsPercent = (composition.goodsExpensePercent * natureFactor) / 100;
  const normServicesPercent = (composition.servicesExpensePercent * natureFactor) / 100;

  const goodsCostsMonthly = totalCostsMonthly * normGoodsPercent;
  const servicesCostsMonthly = totalCostsMonthly * normServicesPercent;

  // 1. CRÉDITO DE ICMS
  // Mercadorias: fornecedor normal repassa ICMS padrão da UF. Fornecedor Simples repassa alíquota informada no DAS (art. 23 LC 123/06).
  // Serviços: prestador de serviço (ISS) NÃO gera crédito de ICMS.
  const ufIcmsRate = (company.customIcmsRate !== undefined ? company.customIcmsRate : getStandardIcmsRateForUF(company.uf)) / 100;
  const icmsCreditGoodsNormalMonthly = goodsCostsMonthly * normRegimeNormal * ufIcmsRate;
  const icmsCreditGoodsSimplesMonthly = goodsCostsMonthly * (normSimplesConv + normSimplesHibrido) * (composition.averageSimplesIcmsTransferRate / 100);
  const icmsCreditTotalMonthly = icmsCreditGoodsNormalMonthly + icmsCreditGoodsSimplesMonthly;
  const icmsCreditTotalAnnual = icmsCreditTotalMonthly * 12;
  const effectiveIcmsCreditRate = goodsCostsMonthly > 0 ? (icmsCreditTotalMonthly / goodsCostsMonthly) * 100 : 0;

  // 2. CRÉDITOS DE CBS E IBS (REFORMA TRIBUTÁRIA - EC 132/2023 & PLP 68/2024 / LC 214/2025)
  // Princípio da Não-Cumulatividade Ampla: tanto mercadorias quanto prestadores de serviço geram crédito!
  const ivaRateTarget = (company.targetIvaRate || 26.5) / 100;
  const cbsRateShare = 8.8 / 26.5; // ~33.2% do IVA é CBS federal
  const ibsRateShare = 17.7 / 26.5; // ~66.8% do IVA é IBS estadual/municipal

  // Regime do Fornecedor:
  // - Fornecedor Regime Normal: Crédito integral (26,5%)
  // - Fornecedor Simples Híbrido: Crédito integral (26,5%) pois apura IBS/CBS por fora no regime normal!
  // - Fornecedor Simples Convencional: Crédito restrito apenas ao valor recolhido no DAS (~3,5%)
  const effectiveIbsCbsCreditRate = (normRegimeNormal * ivaRateTarget) +
    (normSimplesHibrido * ivaRateTarget) +
    (normSimplesConv * (composition.averageSimplesIbsCbsTransferRate / 100));

  const ibsCbsCreditTotalMonthly = totalCostsMonthly * effectiveIbsCbsCreditRate;
  const ibsCbsCreditTotalAnnual = ibsCbsCreditTotalMonthly * 12;
  const cbsCreditTotalMonthly = ibsCbsCreditTotalMonthly * cbsRateShare;
  const ibsCreditTotalMonthly = ibsCbsCreditTotalMonthly * ibsRateShare;
  const effectiveIbsCbsCreditRatePercent = effectiveIbsCbsCreditRate * 100;

  // 3. CRÉDITOS DE PIS E COFINS (LUCRO REAL)
  // Insumos elegíveis adquiridos de pessoas jurídicas no regime regular: 9,25% (1,65% PIS + 7,60% COFINS)
  // Compras de fornecedores do Simples: vedado pelo Fisco (Lei 10.833/03 art. 3º § 2º)
  const pisCofinsCreditTotalMonthly = totalCostsMonthly * normRegimeNormal * 0.0925;
  const pisCreditMonthly = pisCofinsCreditTotalMonthly * (1.65 / 9.25);
  const cofinsCreditMonthly = pisCofinsCreditTotalMonthly * (7.60 / 9.25);
  const pisCofinsCreditTotalAnnual = pisCofinsCreditTotalMonthly * 12;

  // 4. ANÁLISE DE RISCO E ESTRATÉGIA DE FORNECEDORES
  const suppliersRiskAnalysis: string[] = [];
  if (normSimplesConv > 0.4) {
    suppliersRiskAnalysis.push(
      `Alta dependência de fornecedores do Simples Convencional (${(normSimplesConv * 100).toFixed(0)}%): gera expressiva perda de créditos na Reforma Tributária (apenas ${composition.averageSimplesIbsCbsTransferRate}% de crédito vs 26,50% padrão).`
    );
  }
  if (normGoodsPercent > 0.5 && normRegimeNormal > 0.4) {
    suppliersRiskAnalysis.push(
      `Forte geração de créditos de ICMS (${formatCurrencyBRL(icmsCreditTotalMonthly)}/mês): favorece operações comerciais e industriais no Lucro Real ou no abatimento do ICMS próprio.`
    );
  }
  if (normServicesPercent > 0.6) {
    suppliersRiskAnalysis.push(
      `Predomínio de despesas com serviços (${(normServicesPercent * 100).toFixed(0)}%): não gera crédito de ICMS, mas gera crédito integral de CBS/IBS na Reforma Tributária e de PIS/COFINS se contratados de PJs no Lucro Real.`
    );
  }

  const regimeCreditAdvantages = {
    simplesHibridoImpact: `Apropria ${formatCurrencyBRL(ibsCbsCreditTotalAnnual)}/ano de créditos de IBS e CBS sobre fornecedores para abater o imposto sobre o valor agregado apurado no regime geral.`,
    lucroRealImpact: `Abate ${formatCurrencyBRL(pisCofinsCreditTotalAnnual)}/ano em PIS/COFINS e ${formatCurrencyBRL(icmsCreditTotalAnnual)}/ano em ICMS sobre mercadorias, reduzindo a carga fiscal líquida.`,
    lucroPresumidoImpact: `Abate ${formatCurrencyBRL(icmsCreditTotalAnnual)}/ano de ICMS sobre mercadorias vendidas, mas não possui direito a créditos sobre PIS, COFINS e ISS.`,
    simplesPadraoImpact: `Não apropria créditos sobre insumos no DAS, gerando custo oculto de fornecedores com repasse de crédito reduzido aos clientes B2B.`,
  };

  return {
    totalCostsMonthly,
    goodsCostsMonthly,
    servicesCostsMonthly,
    icmsRateNormal: ufIcmsRate * 100,
    icmsCreditGoodsNormalMonthly,
    icmsCreditGoodsSimplesMonthly,
    icmsCreditTotalMonthly,
    icmsCreditTotalAnnual,
    effectiveIcmsCreditRate,
    ivaRateTarget: ivaRateTarget * 100,
    effectiveIbsCbsCreditRatePercent,
    cbsCreditTotalMonthly,
    ibsCreditTotalMonthly,
    ibsCbsCreditTotalMonthly,
    ibsCbsCreditTotalAnnual,
    pisCreditMonthly,
    cofinsCreditMonthly,
    pisCofinsCreditTotalMonthly,
    pisCofinsCreditTotalAnnual,
    suppliersRiskAnalysis,
    regimeCreditAdvantages,
  };
}

/**
 * Calculates complete tax metrics, partner risks, Fator R, multi-anexo segregation,
 * and comprehensive comparative regime analysis
 */
export function calculateTaxAudit(company: CompanyData): CalculationResult {
  const standaloneRbt12 = company.rbt12 || (company.monthlyRevenue ? company.monthlyRevenue * 12 : 0);
  const monthlyRevenueTotal = company.monthlyRevenue || (standaloneRbt12 > 0 ? standaloneRbt12 / 12 : 0);

  // Determinação precisa e desacoplada de Folha de Funcionários (CLT) e Pró-labore dos Sócios
  const hasEmployees = company.hasEmployeesPayroll !== undefined
    ? company.hasEmployeesPayroll
    : (company.employeesPayrollMonthly !== undefined ? company.employeesPayrollMonthly > 0 : (company.monthlyPayroll !== undefined ? company.monthlyPayroll > 0 : true));

  const hasProLabore = company.hasProLabore !== undefined
    ? company.hasProLabore
    : (company.proLaboreMonthly !== undefined ? company.proLaboreMonthly > 0 : false);

  let employeesMonthly = 0;
  let proLaboreMonthly = 0;

  if (company.employeesPayrollMonthly !== undefined || company.proLaboreMonthly !== undefined) {
    employeesMonthly = hasEmployees ? Math.max(0, company.employeesPayrollMonthly ?? 0) : 0;
    proLaboreMonthly = hasProLabore ? Math.max(0, company.proLaboreMonthly ?? 0) : 0;
  } else {
    // Compatibilidade com cadastros legados baseados em monthlyPayroll único
    const basePayroll = company.monthlyPayroll || (company.payroll12m ? company.payroll12m / 12 : 0);
    if (hasEmployees && hasProLabore) {
      proLaboreMonthly = Math.min(basePayroll, Math.max(1412, basePayroll * 0.3));
      employeesMonthly = Math.max(0, basePayroll - proLaboreMonthly);
    } else if (hasEmployees) {
      employeesMonthly = basePayroll;
      proLaboreMonthly = 0;
    } else if (hasProLabore) {
      proLaboreMonthly = basePayroll;
      employeesMonthly = 0;
    } else {
      employeesMonthly = 0;
      proLaboreMonthly = 0;
    }
  }

  const effectiveMonthlyPayroll = employeesMonthly + proLaboreMonthly;
  const effectivePayroll12m = (company.payroll12m && !company.employeesPayrollMonthly && !company.proLaboreMonthly)
    ? (hasEmployees || hasProLabore ? company.payroll12m : 0)
    : (effectiveMonthlyPayroll * 12);

  const monthlyPayroll = effectiveMonthlyPayroll;
  const payroll12m = effectivePayroll12m;

  // Percentage-based inputs for Costs and Expenses
  const inputCostsPercent = company.inputCostsPercent !== undefined ? company.inputCostsPercent : 40;
  const operationalExpensesPercent = company.operationalExpensesPercent !== undefined ? company.operationalExpensesPercent : 15;
  const inputCostsMonthly = monthlyRevenueTotal * (inputCostsPercent / 100);
  const operationalExpensesMonthly = monthlyRevenueTotal * (operationalExpensesPercent / 100);

  // 1. Partner Risk Aggregation (Art. 3º § 4º LC 123/2006)
  let partnerAddedRevenue = 0;
  const partnerRiskDetails: CalculationResult['partnerRiskDetails'] = [];

  (company.partners || []).forEach((partner) => {
    (partner.otherCompanies || []).forEach((other) => {
      let shouldSum = false;
      let reason = '';

      if (partner.participationPercent > 10 && other.participationPercent > 10 && other.regime === 'simples') {
        shouldSum = true;
        reason = `Art. 3º § 4º, IV: Sócio "${partner.name || 'Sócio'}" detém >10% nesta (${partner.participationPercent || 0}%) e >10% em "${other.name || 'Outra Empresa'}" (${other.participationPercent || 0}%), ambas no Simples.`;
      } else if (partner.isManager && (other.participationPercent || 0) > 10) {
        shouldSum = true;
        reason = `Art. 3º § 4º, III: Sócio "${partner.name || 'Sócio'}" é Administrador nesta empresa e detém >10% no capital de "${other.name || 'Outra Empresa'}".`;
      } else if (partner.isManager && other.isManager) {
        shouldSum = true;
        reason = `Art. 3º § 4º, V: Sócio "${partner.name || 'Sócio'}" exerce administração conjunta em ambas as empresas.`;
      }

      if (shouldSum) {
        partnerAddedRevenue += other.revenue12m || 0;
        const totalSum = standaloneRbt12 + (other.revenue12m || 0);
        const excess = Math.max(0, totalSum - FEDERAL_LIMIT);
        
        partnerRiskDetails.push({
          partnerName: partner.name || 'Sócio',
          ruleBroken: reason,
          summedRevenue: totalSum,
          excessAmount: excess,
          riskSeverity: excess > (FEDERAL_LIMIT * 0.2) ? 'critical' : excess > 0 ? 'high' : 'medium',
        });
      }
    });
  });

  const consolidatedRevenue = standaloneRbt12 + partnerAddedRevenue;

  // 2. Fator R Verification (Folha / RBT12)
  const fatorR = standaloneRbt12 > 0 ? (payroll12m / standaloneRbt12) : 0;
  let effectiveAnexo = company.anexo || 'I';
  let isFatorREligible = false;
  let fatorRStatus: CalculationResult['fatorRStatus'] = 'not_applicable';

  // Verifica se a empresa ou alguma de suas atividades ativas é expressamente sujeita ao Fator R
  const hasSubjectToFatorRActivity = company.anexoRevenues?.some(a => a.active && a.subjectToFatorR === true);
  const isExplicitlySubjectToFatorR = company.subjectToFatorR === true || hasSubjectToFatorRActivity || company.anexo === 'V';

  if (isExplicitlySubjectToFatorR && (company.anexo === 'III' || company.anexo === 'V' || hasSubjectToFatorRActivity)) {
    isFatorREligible = true;
    if (fatorR >= FATOR_R_THRESHOLD) {
      effectiveAnexo = 'III';
      fatorRStatus = 'fator_r_active_anexo_3';
    } else {
      effectiveAnexo = 'V';
      fatorRStatus = 'fator_r_inactive_anexo_5';
    }
  } else {
    // Anexo III Puro (não sujeito ao Fator R, ex: manutenção, academias, contabilidade, transporte, locação)
    effectiveAnexo = company.anexo || 'I';
    isFatorREligible = false;
    fatorRStatus = 'not_applicable';
  }

  const targetPayroll28 = standaloneRbt12 * FATOR_R_THRESHOLD;
  const fatorRAdditionalPayrollNeeded = Math.max(0, targetPayroll28 - payroll12m);

  // 3. Multi-Anexo & Internal vs Export Revenue Discrimination
  // Extração automática e dinâmica de percentuais de segregação a partir dos CFOPs padrão ou customizados
  const effectiveCFOPs = (company.cfopItems && company.cfopItems.length > 0)
    ? company.cfopItems
    : getDefaultCFOPsForAnexo(effectiveAnexo, company.isTransportService);

  let cfopStPercent = 0;
  let cfopMonofasicoPercent = 0;
  let cfopIssRetidoPercent = 0;
  let cfopIsencaoPercent = 0;

  effectiveCFOPs.forEach(cfop => {
    const pct = Number(cfop.percentage) || 0;
    if (cfop.icmsTreatment === 'st_substituicao') {
      cfopStPercent += pct;
    } else if (cfop.icmsTreatment === 'isencao_total') {
      cfopIsencaoPercent += pct;
    }

    if (cfop.issTreatment === 'retido_tomador') {
      cfopIssRetidoPercent += pct;
    } else if (cfop.issTreatment === 'isencao_total') {
      cfopIsencaoPercent += pct;
    }

    if (cfop.pisCofinsTreatment === 'monofasico_segregado') {
      cfopMonofasicoPercent += pct;
    }
  });

  const autoStPercent = Math.min(100, cfopStPercent);
  const autoMonofasicoPercent = Math.min(100, cfopMonofasicoPercent);
  const autoIssRetidoPercent = Math.min(100, cfopIssRetidoPercent);
  const autoIsencaoPercent = Math.min(100, cfopIsencaoPercent);

  const rawAnexoList: AnexoRevenueItem[] = company.anexoRevenues && company.anexoRevenues.length > 0
    ? company.anexoRevenues
    : [
        {
          id: 'default_1',
          anexo: effectiveAnexo,
          activityKey: company.isTransportService 
            ? (company.transportType === 'intermunicipal_cargas' ? 'anexo_3_transporte_cargas' : company.transportType === 'intermunicipal_passageiros' ? 'anexo_3_transporte_passageiros' : 'anexo_3_transporte_municipal')
            : `anexo_${effectiveAnexo.toLowerCase()}`,
          activityTitle: company.isTransportService
            ? (company.transportType === 'intermunicipal_cargas' ? 'Anexo III (Transporte) - Transporte Intermunicipal/Interestadual de Cargas' : company.transportType === 'intermunicipal_passageiros' ? 'Anexo III (Transporte) - Transporte Intermunicipal/Interestadual de Passageiros' : 'Anexo III (Transporte) - Transporte Municipal')
            : `Atividade Principal (${effectiveAnexo})`,
          isTransport: company.isTransportService,
          transportType: company.transportType,
          active: true,
          monthlyRevenueInternal: Math.max(0, monthlyRevenueTotal - (company.exportMonthlyRevenue || 0)),
          monthlyRevenueExport: company.exportMonthlyRevenue || 0,
          description: `Atividade Principal (${effectiveAnexo})`,
          stPercent: autoStPercent,
          monofasicoPercent: autoMonofasicoPercent,
          issRetidoPercent: autoIssRetidoPercent,
          isencaoPercent: autoIsencaoPercent,
        },
      ];

  const activeAnexos = rawAnexoList.filter(a => a.active);
  const activeAnexosList = activeAnexos.map(a => a.anexo);

  let totalInternalRevenue = 0;
  let totalExportRevenue = 0;
  let calculatedEffectiveTaxMonthly = 0;
  let calculatedRawTaxMonthly = 0;
  let totalSegregatedDeductions = 0;

  const aggregateBreakdown: TaxBreakdown = {
    irpj: 0,
    csll: 0,
    cofins: 0,
    pis: 0,
    cpp: 0,
    icms: 0,
    iss: 0,
    icmsSegregadoST: 0,
    icmsSegregadoIsencao: 0,
    issSegregadoRetido: 0,
    issSegregadoIsencao: 0,
    icmsPorForaSublimite: 0,
    issPorForaSublimite: 0,
    pisCofinsMonofasico: 0,
  };

  const anexoCalculations: CalculationResult['anexoCalculations'] = [];

  // Check Sublimit (R$ 3.600.000,00)
  const exceedsSublimit = standaloneRbt12 > STATE_SUBLIMIT || consolidatedRevenue > STATE_SUBLIMIT;
  const sublimitExcessAmount = Math.max(0, consolidatedRevenue - STATE_SUBLIMIT);
  const sublimitTaxSegregationNote = exceedsSublimit
    ? `Empresa ultrapassou o Sublimite de R$ 3,6M (${((consolidatedRevenue/STATE_SUBLIMIT - 1)*100).toFixed(1)}% acima). ICMS e ISS devem ser recolhidos POR FORA do Simples, no regime normal estadual/municipal com entrega de EFD/SPED.`
    : 'Dentro do sublimite estadual de R$ 3.600.000,00. ICMS e ISS recolhidos unificadamente no DAS.';

  let hasAnyActiveTransport = company.isTransportService || false;
  let detectedTransportType: TransportType | undefined = company.transportType;

  // Benefício de ICMS Estadual do Simples Nacional (ex: Paraná Decreto 8.660/2018 e Lei 15.342/06 ou RS Lei 13.036/08)
  const isTransportOperation = (company.isTransportService || false) && (company.transportType !== 'municipal');
  const isStateReductionEnabled = company.applyStateIcmsReduction !== false; // Padrão: TABELA ATIVA (true)
  const stateSimplesBenefit: StateSimplesIcmsBenefit = getStateSimplesIcmsBenefit(
    company.uf || 'PR', 
    standaloneRbt12, 
    0,
    effectiveAnexo,
    isTransportOperation
  );
  let totalStateIcmsReductionAmount = 0;

  // Process each active Anexo revenue
  activeAnexos.forEach((item) => {
    let itemAnexo = item.anexo;
    const isInterTransport = item.isTransport === true ||
      item.activityKey === 'anexo_3_transporte_cargas' || 
      item.activityKey === 'anexo_3_transporte_cargas_st' ||
      item.activityKey === 'anexo_3_transporte_cargas_isento' ||
      item.activityKey === 'anexo_3_transporte_passageiros' ||
      item.transportType === 'intermunicipal_cargas' || 
      item.transportType === 'intermunicipal_passageiros';

    const isMunicipalTransport = item.activityKey === 'anexo_3_transporte_municipal' || item.transportType === 'municipal';
    const isTransportActivity = isInterTransport || isMunicipalTransport || item.isTransport;

    if (isTransportActivity) {
      hasAnyActiveTransport = true;
      if (isInterTransport) {
        detectedTransportType = item.transportType || (item.activityKey === 'anexo_3_transporte_passageiros' ? 'intermunicipal_passageiros' : 'intermunicipal_cargas');
      } else if (isMunicipalTransport) {
        detectedTransportType = 'municipal';
      }
    }

    const itemSubjectToFatorR = !isTransportActivity && (
      item.subjectToFatorR === true ||
      (item.subjectToFatorR === undefined && company.subjectToFatorR === true) ||
      item.anexo === 'V' ||
      item.activityKey === 'anexo_5'
    );

    if ((itemAnexo === 'III' || itemAnexo === 'V') && itemSubjectToFatorR) {
      itemAnexo = fatorR >= FATOR_R_THRESHOLD ? 'III' : 'V';
    } else if (item.anexo === 'III') {
      itemAnexo = 'III'; // Garante permanência estrita no Anexo III
    }

    const { nominalRate, deduction, effectiveRate, bracket } = calculateAnexoEffectiveRate(itemAnexo, standaloneRbt12);

    let revInternal = item.monthlyRevenueInternal || 0;
    let revExport = item.monthlyRevenueExport || 0;

    // Se o usuário selecionou e-CAC para exportação, move receita para export se estiver em internal
    if (item.ecacClassification === 'exterior_servico' || item.ecacClassification === 'exterior_mercadoria') {
      if (revInternal > 0 && revExport === 0) {
        revExport = revInternal;
        revInternal = 0;
      }
    }

    const revTotalItem = revInternal + revExport;
    totalInternalRevenue += revInternal;
    totalExportRevenue += revExport;

    // Configurações e-CAC oficiais de dedução
    let effectiveStPercent = item.stPercent || 0;
    let effectiveMonofasicoPercent = item.monofasicoPercent || 0;
    let effectiveIssRetidoPercent = item.issRetidoPercent || 0;
    let effectiveIsencaoPercent = item.isencaoPercent || 0;
    let effectiveSubcontratacao = item.subcontratacaoPercent || 0;

    // Suporte a Múltiplas Situações Fiscais Simultâneas e Desdobramentos da Mesma Atividade
    if (item.situationSplits && item.situationSplits.length > 0) {
      const totalRev = revInternal > 0 ? revInternal : 1;
      
      const stSplit = item.situationSplits.find(s => s.active && s.situation === 'icms_st');
      if (stSplit) {
        effectiveStPercent = stSplit.percent !== undefined 
          ? stSplit.percent 
          : (stSplit.amount ? Math.min(100, (stSplit.amount / totalRev) * 100) : 0);
      } else {
        effectiveStPercent = 0;
      }

      const issSplit = item.situationSplits.find(s => s.active && s.situation === 'iss_retido');
      if (issSplit) {
        effectiveIssRetidoPercent = issSplit.percent !== undefined
          ? issSplit.percent
          : (issSplit.amount ? Math.min(100, (issSplit.amount / totalRev) * 100) : 0);
      } else {
        effectiveIssRetidoPercent = 0;
      }

      const isencaoSplit = item.situationSplits.find(s => s.active && s.situation === 'isencao_reducao');
      if (isencaoSplit) {
        effectiveIsencaoPercent = isencaoSplit.percent !== undefined
          ? isencaoSplit.percent
          : (isencaoSplit.amount ? Math.min(100, (isencaoSplit.amount / totalRev) * 100) : 0);
      } else {
        effectiveIsencaoPercent = 0;
      }

      const monofasicoSplit = item.situationSplits.find(s => s.active && s.situation === 'pis_cofins_monofasico');
      if (monofasicoSplit) {
        effectiveMonofasicoPercent = monofasicoSplit.percent !== undefined
          ? monofasicoSplit.percent
          : (monofasicoSplit.amount ? Math.min(100, (monofasicoSplit.amount / totalRev) * 100) : 0);
      } else {
        effectiveMonofasicoPercent = 0;
      }

      const subSplit = item.situationSplits.find(s => s.active && s.situation === 'transporte_subcontratado');
      if (subSplit) {
        effectiveSubcontratacao = subSplit.percent !== undefined
          ? subSplit.percent
          : (subSplit.amount ? Math.min(100, (subSplit.amount / totalRev) * 100) : 0);
      } else {
        effectiveSubcontratacao = 0;
      }
    } else if (item.activeSituations && item.activeSituations.length > 0) {
      // Quando o usuário marca múltiplas situações via checkbox
      if (item.activeSituations.includes('icms_st')) {
        effectiveStPercent = item.stPercent !== undefined ? item.stPercent : 100;
      } else {
        effectiveStPercent = 0;
      }

      if (item.activeSituations.includes('iss_retido')) {
        effectiveIssRetidoPercent = item.issRetidoPercent !== undefined ? item.issRetidoPercent : 100;
      } else {
        effectiveIssRetidoPercent = 0;
      }

      if (item.activeSituations.includes('isencao_reducao')) {
        effectiveIsencaoPercent = item.isencaoPercent !== undefined ? item.isencaoPercent : 100;
      } else {
        effectiveIsencaoPercent = 0;
      }

      if (item.activeSituations.includes('pis_cofins_monofasico')) {
        effectiveMonofasicoPercent = item.monofasicoPercent !== undefined ? item.monofasicoPercent : 100;
      } else {
        effectiveMonofasicoPercent = 0;
      }

      if (item.activeSituations.includes('transporte_subcontratado')) {
        effectiveSubcontratacao = item.subcontratacaoPercent !== undefined ? item.subcontratacaoPercent : 100;
      } else {
        effectiveSubcontratacao = 0;
      }
    } else if (item.ecacClassification) {
      if (item.ecacClassification === 'icms_st') {
        effectiveStPercent = item.stPercent ?? 100;
      } else if (item.ecacClassification === 'transporte_subcontratado') {
        effectiveSubcontratacao = item.subcontratacaoPercent ?? 100;
      } else if (item.ecacClassification === 'iss_retido' || item.ecacClassification === 'iss_st') {
        effectiveIssRetidoPercent = item.issRetidoPercent ?? 100;
      } else if (item.ecacClassification === 'pis_cofins_monofasico') {
        effectiveMonofasicoPercent = item.monofasicoPercent ?? 100;
      } else if (item.ecacClassification === 'icms_isencao_estadual' || item.ecacClassification === 'iss_isencao_municipal') {
        effectiveIsencaoPercent = item.isencaoPercent ?? 100;
      } else if (item.ecacClassification === 'normal') {
        effectiveStPercent = 0;
        effectiveMonofasicoPercent = 0;
        effectiveIssRetidoPercent = 0;
        effectiveIsencaoPercent = 0;
        effectiveSubcontratacao = 0;
      }
    } else {
      // Fallback para activities pré-definidas
      if (item.activityKey === 'anexo_3_transporte_cargas_st') {
        effectiveSubcontratacao = item.subcontratacaoPercent !== undefined ? item.subcontratacaoPercent : 100;
      }
      if (item.activityKey === 'anexo_3_transporte_cargas_isento') {
        effectiveIsencaoPercent = item.isencaoPercent !== undefined ? item.isencaoPercent : 100;
      }
    }

    // Cálculo exato por imposto conforme LC 123/2006
    let itemIrpj = 0;
    let itemCsll = 0;
    let itemCofins = 0;
    let itemPis = 0;
    let itemCpp = 0;
    let itemIcms = 0;
    let itemIss = 0;
    let stateIcmsReduction = 0;

    let stDeduction = 0;
    let isencaoDeduction = 0;
    let issRetidoDeduction = 0;
    let monofasicoDeduction = 0;
    let icmsOutside = 0;
    let issOutside = 0;

    if (isInterTransport) {
      // REGRA ESPECIAL LC 123/06 Art. 18 § 5º-E:
      // Serviços de comunicação e de transporte interestadual e intermunicipal são tributados na forma do Anexo III,
      // deduzida a parcela correspondente ao ISS e acrescida a parcela correspondente ao ICMS prevista no Anexo I.
      
      // 1. Tributos federais pelo Anexo III
      itemIrpj = revInternal * effectiveRate * (bracket.percentBreakdown.irpj || 0.04);
      itemCsll = revInternal * effectiveRate * (bracket.percentBreakdown.csll || 0.035);
      itemCofins = revInternal * effectiveRate * (bracket.percentBreakdown.cofins || 0.1282);
      itemPis = revInternal * effectiveRate * (bracket.percentBreakdown.pis || 0.0278);
      itemCpp = revInternal * effectiveRate * (bracket.percentBreakdown.cpp || 0.434);
      itemIss = 0; // Não incide ISS em transporte intermunicipal/interestadual

      // 2. Parcela de ICMS prevista no Anexo I
      const { effectiveRate: effRateAnexoI, bracket: brkAnexoI } = calculateAnexoEffectiveRate('I', standaloneRbt12);
      const federalIcmsRate = effRateAnexoI * (brkAnexoI.percentBreakdown.icms || 0.335);
      const rawIcmsPortion = revInternal * federalIcmsRate;

      // Deduções e ST de transporte
      const totalStAndSub = Math.min(100, effectiveStPercent + effectiveSubcontratacao);
      stDeduction = rawIcmsPortion * (totalStAndSub / 100);
      isencaoDeduction = rawIcmsPortion * (Math.min(100, effectiveIsencaoPercent) / 100);

      // Sublimite (> R$ 3.6M)
      if (exceedsSublimit) {
        icmsOutside = Math.max(0, rawIcmsPortion - stDeduction - isencaoDeduction);
        itemIcms = 0;
      } else {
        const taxableIcms = Math.max(0, rawIcmsPortion - stDeduction - isencaoDeduction);
        
        // Benefício Estadual de ICMS (ex: Paraná Decreto 8.660/18 - Tabela I do Anexo XI)
        if (isStateReductionEnabled && stateSimplesBenefit.hasBenefit) {
          if (stateSimplesBenefit.isExempt) {
            // Isenção Total (100% até 360k)
            stateIcmsReduction = taxableIcms;
            itemIcms = 0;
          } else {
            // Redução progressiva da Tabela I do PR ou percentual estadual
            if (stateSimplesBenefit.paranaDetails?.aliqEfetivaPR !== undefined && stateSimplesBenefit.paranaDetails.aliqEfetivaPR > 0) {
              const aliqEfPR = stateSimplesBenefit.paranaDetails.aliqEfetivaPR / 100;
              itemIcms = Math.min(taxableIcms, revInternal * aliqEfPR);
              stateIcmsReduction = Math.max(0, taxableIcms - itemIcms);
            } else {
              const redRatio = Math.min(100, stateSimplesBenefit.reductionPercent) / 100;
              stateIcmsReduction = taxableIcms * redRatio;
              itemIcms = Math.max(0, taxableIcms - stateIcmsReduction);
            }
          }
          totalStateIcmsReductionAmount += stateIcmsReduction;
        } else {
          itemIcms = taxableIcms;
        }
      }
    } else {
      // DEMAIS ATIVIDADES (Comércio, Indústria, Serviços Gerais, Transporte Municipal)
      const rawInternalTax = revInternal * effectiveRate;
      const pb = bracket.percentBreakdown;

      const rawIrpj = rawInternalTax * (pb.irpj || 0);
      const rawCsll = rawInternalTax * (pb.csll || 0);
      const rawCofins = rawInternalTax * (pb.cofins || 0);
      const rawPis = rawInternalTax * (pb.pis || 0);
      const rawCpp = rawInternalTax * (pb.cpp || 0);
      const rawIcms = rawInternalTax * (pb.icms || 0);
      const rawIss = rawInternalTax * (pb.iss || 0);

      // Deduções
      const totalSt = Math.min(100, effectiveStPercent + effectiveSubcontratacao);
      stDeduction = rawIcms * (totalSt / 100);
      isencaoDeduction = (rawIcms + rawIss) * (Math.min(100, effectiveIsencaoPercent) / 100);
      issRetidoDeduction = rawIss * (Math.min(100, effectiveIssRetidoPercent) / 100);
      monofasicoDeduction = (rawPis + rawCofins) * (Math.min(100, effectiveMonofasicoPercent) / 100);

      if (exceedsSublimit) {
        icmsOutside = Math.max(0, rawIcms - stDeduction);
        issOutside = Math.max(0, rawIss - issRetidoDeduction);
      }

      // Benefício Estadual de ICMS (ex: Paraná Lei 15.342/06 para comércio/indústria)
      const hasIcms = itemAnexo === 'I' || itemAnexo === 'II';
      if (hasIcms && !exceedsSublimit && isStateReductionEnabled && stateSimplesBenefit.hasBenefit) {
        const taxableIcms = Math.max(0, rawIcms - stDeduction - (isencaoDeduction > 0 && rawIcms > 0 ? isencaoDeduction : 0));
        if (stateSimplesBenefit.isExempt) {
          stateIcmsReduction = taxableIcms;
        } else if (stateSimplesBenefit.paranaDetails?.aliqEfetivaPR !== undefined && stateSimplesBenefit.paranaDetails.aliqEfetivaPR > 0) {
          const aliqEfPR = stateSimplesBenefit.paranaDetails.aliqEfetivaPR / 100;
          const targetIcms = revInternal * aliqEfPR;
          stateIcmsReduction = Math.max(0, taxableIcms - targetIcms);
        } else {
          stateIcmsReduction = taxableIcms * (stateSimplesBenefit.reductionPercent / 100);
        }
        totalStateIcmsReductionAmount += stateIcmsReduction;
      }

      itemIrpj = rawIrpj;
      itemCsll = rawCsll;
      itemCpp = rawCpp;
      itemCofins = Math.max(0, rawCofins - (monofasicoDeduction * 0.8));
      itemPis = Math.max(0, rawPis - (monofasicoDeduction * 0.2));
      itemIcms = Math.max(0, rawIcms - (stDeduction + isencaoDeduction + icmsOutside + stateIcmsReduction));
      itemIss = Math.max(0, rawIss - (issRetidoDeduction + issOutside));
    }

    const netInternalTax = itemIrpj + itemCsll + itemCofins + itemPis + itemCpp + itemIcms + itemIss;

    // 2. Export Market Tax (Imunidade de PIS, COFINS, ICMS, ISS - Art. 18 § 4º-A da LC 123/06)
    const exportTaxableRate = effectiveRate * ((bracket.percentBreakdown.irpj || 0) + (bracket.percentBreakdown.csll || 0) + (bracket.percentBreakdown.cpp || 0));
    const netExportTax = revExport * exportTaxableRate;
    const exportIrpj = revExport * effectiveRate * (bracket.percentBreakdown.irpj || 0);
    const exportCsll = revExport * effectiveRate * (bracket.percentBreakdown.csll || 0);
    const exportCpp = revExport * effectiveRate * (bracket.percentBreakdown.cpp || 0);

    const itemTotalTax = netInternalTax + netExportTax;

    calculatedRawTaxMonthly += (revTotalItem * effectiveRate);
    calculatedEffectiveTaxMonthly += itemTotalTax;
    totalSegregatedDeductions += (stDeduction + isencaoDeduction + issRetidoDeduction + monofasicoDeduction + icmsOutside + issOutside + stateIcmsReduction);

    // Accumulate Breakdown
    aggregateBreakdown.irpj += itemIrpj + exportIrpj;
    aggregateBreakdown.csll += itemCsll + exportCsll;
    aggregateBreakdown.cpp += itemCpp + exportCpp;
    aggregateBreakdown.cofins += itemCofins;
    aggregateBreakdown.pis += itemPis;
    aggregateBreakdown.icms += itemIcms;
    aggregateBreakdown.iss += itemIss;

    aggregateBreakdown.icmsSegregadoST = (aggregateBreakdown.icmsSegregadoST || 0) + stDeduction;
    aggregateBreakdown.icmsSegregadoIsencao = (aggregateBreakdown.icmsSegregadoIsencao || 0) + isencaoDeduction;
    aggregateBreakdown.icmsReducaoEstadual = (aggregateBreakdown.icmsReducaoEstadual || 0) + stateIcmsReduction;
    aggregateBreakdown.issSegregadoRetido = (aggregateBreakdown.issSegregadoRetido || 0) + issRetidoDeduction;
    aggregateBreakdown.pisCofinsMonofasico = (aggregateBreakdown.pisCofinsMonofasico || 0) + monofasicoDeduction;
    aggregateBreakdown.icmsPorForaSublimite = (aggregateBreakdown.icmsPorForaSublimite || 0) + icmsOutside;
    aggregateBreakdown.issPorForaSublimite = (aggregateBreakdown.issPorForaSublimite || 0) + issOutside;

    const activityMeta = DEFAULT_ANEXO_ACTIVITIES.find(a => a.key === item.activityKey);
    const finalActivityTitle = item.activityTitle || activityMeta?.title || item.description || `Anexo ${itemAnexo}`;

    anexoCalculations.push({
      anexo: itemAnexo,
      activityKey: item.activityKey,
      activityTitle: finalActivityTitle,
      isTransport: isTransportActivity,
      transportType: isInterTransport ? (item.transportType || (item.activityKey === 'anexo_3_transporte_passageiros' ? 'intermunicipal_passageiros' : 'intermunicipal_cargas')) : isMunicipalTransport ? 'municipal' : undefined,
      taxJurisdiction: isInterTransport || itemAnexo === 'I' || itemAnexo === 'II' ? 'estadual_icms' : 'municipal_iss',
      internalRevenue: revInternal,
      exportRevenue: revExport,
      totalRevenue: revTotalItem,
      effectiveRate: (itemTotalTax / (revTotalItem || 1)) * 100,
      nominalRate: nominalRate * 100,
      taxDue: itemTotalTax,
    });
  });

  // Atualiza economias geradas pelo benefício de ICMS estadual
  stateSimplesBenefit.monthlySavingsEstimated = totalStateIcmsReductionAmount;
  stateSimplesBenefit.annualSavingsEstimated = totalStateIcmsReductionAmount * 12;

  const totalRevenueMonth = totalInternalRevenue + totalExportRevenue || monthlyRevenueTotal;
  const effectiveRateGlobalPercent = totalRevenueMonth > 0 ? (calculatedEffectiveTaxMonthly / totalRevenueMonth) * 100 : 0;
  const effectiveTaxAnnual = calculatedEffectiveTaxMonthly * 12;

  // Federal Limits & Exclusions
  const exceedsFederalLimit = consolidatedRevenue > FEDERAL_LIMIT;
  const federalExcessAmount = Math.max(0, consolidatedRevenue - FEDERAL_LIMIT);
  const federalExcessPercent = (federalExcessAmount / FEDERAL_LIMIT) * 100;
  const exportLimitAvailable = Math.max(0, EXPORT_ADDITIONAL_LIMIT - (totalExportRevenue * 12));

  let exclusionType: CalculationResult['exclusionType'] = 'none';
  if (exceedsFederalLimit) {
    if (consolidatedRevenue > CRITICAL_EXCLUSION_THRESHOLD) {
      exclusionType = 'immediate_next_month';
    } else {
      exclusionType = 'next_year';
    }
  }

  // 4. Transportation Sector Analysis
  let transportAnalysis: TransportTaxAnalysis | undefined = undefined;
  if (company.isTransportService || hasAnyActiveTransport) {
    const tType = company.transportType || detectedTransportType || 'intermunicipal_cargas';
    if (tType === 'intermunicipal_cargas') {
      transportAnalysis = {
        isTransport: true,
        transportType: 'intermunicipal_cargas',
        transportLabel: 'Transporte Intermunicipal / Interestadual de Cargas',
        taxJurisdiction: 'estadual_icms',
        lucroPresumidoIRPJRate: 8,
        lucroPresumidoCSLLRate: 12,
        anexoSimplesUsed: 'Anexo III (deduz ISS e insere alíquota de ICMS conforme LC 123/06 Art. 18 § 5º-E)',
        legalBasis: 'LC 123/2006 Art. 18 § 5º-E; Lei nº 9.249/1995 Art. 15 e Art. 20',
        legalBasisNote: 'LC 123/2006 Art. 18 § 5º-E; Lei nº 9.249/1995 Art. 15 e Art. 20',
        specialTaxRules: [
          'No Simples Nacional: Tributado pelas alíquotas do Anexo III, porém a parcela destinada ao ISS é desconsiderada e substituída pelo ICMS correspondente.',
          'No Lucro Presumido: Presunção de Lucro favorecida de apenas 8% para IRPJ e 12% para CSLL (em vez de 32% dos serviços comuns).',
          'No ICMS Regime Normal: Tributação pelo débito de saídas com apropriação de créditos sobre combustíveis, lubrificantes, pneus e manutenção da frota.',
          'Documento Fiscal Obrigatório: Emissão de Conhecimento de Transporte Eletrônico (CT-e) e Manifesto Eletrônico de Documentos Fiscais (MDF-e).'
        ],
      };
    } else if (tType === 'intermunicipal_passageiros') {
      transportAnalysis = {
        isTransport: true,
        transportType: 'intermunicipal_passageiros',
        transportLabel: 'Transporte Intermunicipal / Interestadual de Passageiros',
        taxJurisdiction: 'estadual_icms',
        lucroPresumidoIRPJRate: 16,
        lucroPresumidoCSLLRate: 12,
        anexoSimplesUsed: 'Anexo III (com ICMS no lugar de ISS conforme LC 123/06 Art. 18 § 5º-F)',
        legalBasis: 'LC 123/2006 Art. 18 § 5º-F; Lei nº 9.249/1995 Art. 15 § 1º, III, "a"',
        legalBasisNote: 'LC 123/2006 Art. 18 § 5º-F; Lei nº 9.249/1995 Art. 15 § 1º, III, "a"',
        specialTaxRules: [
          'No Simples Nacional: Alíquota base do Anexo III deduzindo parcela de ISS e recolhendo ICMS.',
          'No Lucro Presumido: Presunção de 16% para o IRPJ e 12% para a CSLL.',
          'Fato Gerador Estadual: Sujeito ao ICMS estadual com emissão de Bilhete de Passagem Eletrônico (BP-e) ou CT-e OS.',
          'Créditos admitidos na escrita fiscal estadual para combustíveis e manutenção de veículos licenciados.'
        ],
      };
    } else {
      transportAnalysis = {
        isTransport: true,
        transportType: 'municipal',
        transportLabel: 'Transporte Municipal (Intramunicipal / Coleta Urbana)',
        taxJurisdiction: 'municipal_iss',
        lucroPresumidoIRPJRate: 32,
        lucroPresumidoCSLLRate: 32,
        anexoSimplesUsed: 'Anexo III (com ISS municipal integral)',
        legalBasis: 'LC 116/2003 Subitem 16.01; LC 123/2006 Art. 18 § 5º-D; Lei 9.249/95 Art. 15',
        legalBasisNote: 'LC 116/2003 Subitem 16.01; LC 123/2006 Art. 18 § 5º-D; Lei 9.249/95 Art. 15',
        specialTaxRules: [
          'Tributação Municipal: Operações com início e término no mesmo município são fato gerador exclusivo do ISSQN (não incide ICMS).',
          'No Simples Nacional: Tributado diretamente pelo Anexo III integral com a repartição de ISS.',
          'No Lucro Presumido: Alíquota de presunção de 32% sobre IRPJ e 32% sobre CSLL como serviço municipal padrão.',
          'Documento Fiscal: Emissão de NFS-e Municipal padrão ABRASF.'
        ],
      };
    }
  }

  // 5. Detailed Sublimit ICMS/ISS Exclusion Computation
  const sublimitExcessPercent = STATE_SUBLIMIT > 0 ? (sublimitExcessAmount / STATE_SUBLIMIT) * 100 : 0;

  const icmsStateRate = company.customIcmsRate !== undefined ? company.customIcmsRate : getStandardIcmsRateForUF(company.uf);
  const issCityRate = company.customIssRate !== undefined ? company.customIssRate : getStandardIssRateForCity(company.uf, company.city);
  
  const isIcmsTaxedActivity = effectiveAnexo === 'I' || effectiveAnexo === 'II' || (company.isTransportService && company.transportType !== 'municipal');
  const isIssTaxedActivity = (effectiveAnexo === 'III' || effectiveAnexo === 'IV' || effectiveAnexo === 'V') && (!company.isTransportService || company.transportType === 'municipal');

  const icmsRevenueBase = isIcmsTaxedActivity ? totalInternalRevenue : 0;
  const icmsGrossDebitMonthly = icmsRevenueBase * (icmsStateRate / 100);
  const icmsInputCreditMonthly = isIcmsTaxedActivity ? (inputCostsMonthly * (icmsStateRate / 100)) : 0;
  const icmsOutsideMonthly = exceedsSublimit && isIcmsTaxedActivity ? Math.max(0, icmsGrossDebitMonthly - icmsInputCreditMonthly) : 0;
  const icmsOutsideAnnual = icmsOutsideMonthly * 12;

  const issRevenueBase = isIssTaxedActivity ? totalInternalRevenue : 0;
  const issOutsideMonthly = exceedsSublimit && isIssTaxedActivity ? (issRevenueBase * (issCityRate / 100)) : 0;
  const issOutsideAnnual = issOutsideMonthly * 12;

  const dasFederalMonthly = (aggregateBreakdown.irpj + aggregateBreakdown.csll + aggregateBreakdown.pis + aggregateBreakdown.cofins + aggregateBreakdown.cpp);
  const dasFederalAnnual = dasFederalMonthly * 12;
  const dasFederalEffectiveRate = totalRevenueMonth > 0 ? (dasFederalMonthly / totalRevenueMonth) * 100 : 0;

  const totalCombinedMonthly = exceedsSublimit ? (dasFederalMonthly + icmsOutsideMonthly + issOutsideMonthly) : calculatedEffectiveTaxMonthly;
  const totalCombinedAnnual = totalCombinedMonthly * 12;
  const totalCombinedEffectiveRate = totalRevenueMonth > 0 ? (totalCombinedMonthly / totalRevenueMonth) * 100 : 0;
  const additionalMonthlyCostVsDAS = Math.max(0, totalCombinedMonthly - calculatedEffectiveTaxMonthly);

  let sublimitEffectiveDateRule: SublimitExclusionDetails['effectiveDateRule'] = 'dentro_limite';
  let sublimitEffectiveDateText = 'Dentro do sublimite de R$ 3.600.000,00. ICMS e ISS são apurados e recolhidos unificadamente na guia DAS.';
  let effectiveExclusionDateRule: 'next_calendar_year' | 'immediate_next_month' | 'none' = 'none';

  if (exceedsSublimit) {
    if (consolidatedRevenue > SUBLIMIT_CRITICAL_THRESHOLD) {
      sublimitEffectiveDateRule = 'mes_subsequente';
      effectiveExclusionDateRule = 'immediate_next_month';
      sublimitEffectiveDateText = `Excesso de ${sublimitExcessPercent.toFixed(1)}% (> 20% do sublimite). O ICMS e ISS passam a ser recolhidos obrigatoriamente por fora já no MÊS SUBSEQUENTE ao excesso (Art. 20 § 1º da LC 123/2006).`;
    } else {
      sublimitEffectiveDateRule = 'proximo_ano';
      effectiveExclusionDateRule = 'next_calendar_year';
      sublimitEffectiveDateText = `Excesso de ${sublimitExcessPercent.toFixed(1)}% (até 20% do sublimite). O ICMS e ISS passam a ser recolhidos por fora a partir de 1º DE JANEIRO do próximo ano-calendário (Art. 20 § 1º da LC 123/2006).`;
    }
  }

  const sublimitAncillaryObligations: SublimitExclusionDetails['ancillaryObligations'] = [
    {
      name: 'SPED Fiscal (EFD ICMS/IPI)',
      frequency: 'Mensal',
      organ: 'SEFAZ',
      description: 'Escrituração Fiscal Digital obrigatória de todas as notas fiscais de entrada, saída, apuração de ICMS e inventário.'
    },
    {
      name: 'GIA / DeSTDA',
      frequency: 'Mensal',
      organ: 'SEFAZ',
      description: 'Guia de Informação e Apuração do ICMS e Declaração de Substituição Tributária e Diferencial de Alíquota.'
    },
    {
      name: 'Emissão NF-e no Regime Normal (CRT 2)',
      frequency: 'Operação a Operação',
      organ: 'SEFAZ',
      description: 'Emissão de documentos fiscais com Código de Regime Tributário CRT 2 (Simples com excesso de sublimite), destacando alíquota normal de ICMS.'
    },
    {
      name: 'NFS-e Municipal e DMS',
      frequency: 'Mensal',
      organ: 'Prefeitura',
      description: 'Emissão de notas fiscais com retenção e guia própria de ISS (DAM/DAMSP) no portal municipal.'
    },
    {
      name: 'PGDAS-D Federal',
      frequency: 'Mensal',
      organ: 'RFB',
      description: 'Geração mensal da guia DAS contendo estritamente os tributos federais (IRPJ, CSLL, PIS, COFINS e CPP).'
    },
  ];

  const sublimitExclusionDetails: SublimitExclusionDetails = {
    isExceeded: exceedsSublimit,
    sublimitAmount: STATE_SUBLIMIT,
    excessAmount: sublimitExcessAmount,
    excessPercent: sublimitExcessPercent,
    effectiveDateRule: sublimitEffectiveDateRule,
    effectiveDateText: sublimitEffectiveDateText,
    effectiveExclusionDateRule,
    effectiveRbt12: consolidatedRevenue,
    dasFederalMonthly,
    dasFederalAnnual,
    dasFederalEffectiveRate,
    monthlyFederalDASTax: dasFederalMonthly,
    effectiveSimplesRateWithoutIcmsIss: dasFederalEffectiveRate,
    icmsOutsideMonthly,
    icmsOutsideAnnual,
    icmsStateRate,
    icmsGrossDebitMonthly,
    icmsInputCreditMonthly,
    monthlyOutsideICMS: icmsOutsideMonthly,
    issOutsideMonthly,
    issOutsideAnnual,
    issCityRate,
    monthlyOutsideISS: issOutsideMonthly,
    totalCombinedMonthly,
    totalCombinedAnnual,
    totalCombinedEffectiveRate,
    additionalMonthlyCostVsDAS,
    monthlyTotalTaxWithSublimitExclusion: totalCombinedMonthly,
    annualTotalTaxWithSublimitExclusion: totalCombinedAnnual,
    effectiveGlobalRateWithSublimitExclusion: totalCombinedEffectiveRate,
    monthlyAdditionalCostVsSimples: additionalMonthlyCostVsDAS,
    annualAdditionalCostVsSimples: additionalMonthlyCostVsDAS * 12,
    ancillaryObligations: sublimitAncillaryObligations,
    ancillaryObligationsGenerated: sublimitAncillaryObligations.map(o => `${o.name} (${o.frequency} - ${o.organ}): ${o.description}`),
  };

  // 6. Auditoria de Custos com Fornecedores e Tomada de Créditos (IBS, CBS, ICMS e PIS/COFINS)
  const supplierCreditAudit = calculateSupplierCreditAudit(company, totalRevenueMonth);

  // 7. Detailed 4-Regimes Benchmarking Engine
  const regimesComparison = calculateRegimeComparisonDetails({
    company,
    standaloneRbt12,
    monthlyRevenueTotal: totalRevenueMonth,
    totalInternalRevenue,
    totalExportRevenue,
    monthlyPayroll,
    payroll12m,
    employeesMonthly,
    proLaboreMonthly,
    hasEmployees,
    hasProLabore,
    inputCostsMonthly,
    operationalExpensesMonthly,
    simplesEffectiveTaxMonthly: calculatedEffectiveTaxMonthly,
    simplesEffectiveRate: effectiveRateGlobalPercent,
    simplesBreakdown: aggregateBreakdown,
    effectiveAnexo,
    exceedsSublimit,
    exceedsFederalLimit,
    sublimitExclusionDetails,
    supplierCreditAudit,
  });

  // Identify Best Regime by Recommendation Score
  const bestRegime = [...regimesComparison].sort((a, b) => b.recommendationScore - a.recommendationScore)[0];

  const lucroPresumidoItem = regimesComparison.find(r => r.regime === 'lucro_presumido')!;
  const lucroRealItem = regimesComparison.find(r => r.regime === 'lucro_real')!;
  const simplesHibridoItem = regimesComparison.find(r => r.regime === 'simples_hibrido')!;

  // Reforma Tributária (IBS/CBS) B2B metrics
  const standardIvaRate = (company.targetIvaRate || 26.5) / 100;
  const reformaSimplesCreditTransferRate = Math.min(0.045, (effectiveRateGlobalPercent / 100) * 0.25);
  const reformaRegularCreditTransferRate = standardIvaRate;
  const b2bRevenueAnnual = (totalRevenueMonth * 12) * ((company.b2bSalesPercent || 50) / 100);
  const creditLossPercent = Math.max(0, reformaRegularCreditTransferRate - reformaSimplesCreditTransferRate);
  const b2bClientDisadvantageAnnual = b2bRevenueAnnual * creditLossPercent;

  // Auditoria Detalhada de Encargos Previdenciários Patronais (CPP)
  const ratRate = (company.ratRatePercent !== undefined ? company.ratRatePercent : 3.0) / 100;
  const terceirosRate = (company.terceirosRatePercent !== undefined ? company.terceirosRatePercent : 5.8) / 100;

  const presumedCppEmployeesMonthly = hasEmployees ? employeesMonthly * (0.20 + ratRate + terceirosRate) : 0;
  const presumedCppProLaboreMonthly = hasProLabore ? proLaboreMonthly * 0.20 : 0;
  const presumedCppTotalMonthly = presumedCppEmployeesMonthly + presumedCppProLaboreMonthly;
  const presumedCppTotalAnnual = presumedCppTotalMonthly * 12;

  const realCppEmployeesMonthly = presumedCppEmployeesMonthly;
  const realCppProLaboreMonthly = presumedCppProLaboreMonthly;
  const realCppTotalMonthly = presumedCppTotalMonthly;
  const realCppTotalAnnual = presumedCppTotalAnnual;

  const simplesCppMonthly = effectiveAnexo === 'IV'
    ? ((hasEmployees ? employeesMonthly * (0.20 + ratRate) : 0) + (hasProLabore ? proLaboreMonthly * 0.20 : 0))
    : aggregateBreakdown.cpp;
  const simplesCppAnnual = simplesCppMonthly * 12;
  const simplesCppIsInsideDAS = effectiveAnexo !== 'IV';

  const cppDeltaPresumidoVsSimplesAnnual = simplesCppIsInsideDAS
    ? presumedCppTotalAnnual
    : Math.max(0, presumedCppTotalAnnual - simplesCppAnnual);

  const formatBRL = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  let cppStrategicDiagnosis = '';
  if (!hasEmployees && !hasProLabore) {
    cppStrategicDiagnosis = 'A empresa declarou NÃO possuir folha de pagamento de funcionários (CLT) nem retirada formal de pró-labore. No Lucro Presumido e Lucro Real, o encargo patronal previdenciário (CPP) é R$ 0,00, tornando esses regimes altamente competitivos para empresas sem funcionários. No entanto, no Simples Nacional para atividades do Fator R, a ausência de folha força o enquadramento no Anexo V (alíquota inicial de 15,50% em vez de 6,00%).';
  } else if (!hasEmployees && hasProLabore) {
    cppStrategicDiagnosis = `A empresa opera exclusivamente com retirada de Pró-labore de sócios (${formatBRL(proLaboreMonthly)}/mês), sem funcionários CLT. No Lucro Presumido, a CPP patronal é de 20,00% sobre o pró-labore (${formatBRL(presumedCppProLaboreMonthly)}/mês), com isenção legal de RAT e Sistema S (Art. 22, III da Lei 8.212/91). No Simples Nacional (exceto Anexo IV), a CPP patronal de 20% é dispensada e absorvida no DAS, permitindo atingir o Fator R ≥ 28% e tributar no Anexo III.`;
  } else if (hasEmployees && !hasProLabore) {
    cppStrategicDiagnosis = `A empresa possui Folha de Empregados CLT (${formatBRL(employeesMonthly)}/mês) sem retirada de pró-labore. No Lucro Presumido e Real, a carga patronal totaliza 28,80% (${formatBRL(presumedCppEmployeesMonthly)}/mês, composta por 20% CPP, 3% RAT e 5,8% Terceiros). No Simples Nacional (Anexos I, II, III e V), toda essa carga previdenciária está inclusa no DAS, propiciando expressiva economia patronal de ${formatBRL(presumedCppTotalAnnual)}/ano frente ao regime presumido.`;
  } else {
    cppStrategicDiagnosis = `A empresa opera com estrutura mista: Funcionários CLT (${formatBRL(employeesMonthly)}/mês) e Pró-labore de sócios (${formatBRL(proLaboreMonthly)}/mês). No Lucro Presumido/Real incide 28,80% sobre os empregados e 20,00% sobre pró-labore, totalizando ${formatBRL(presumedCppTotalMonthly)}/mês (${formatBRL(presumedCppTotalAnnual)}/ano) de encargos patronais. No Simples Nacional (exceto Anexo IV), a inclusão da CPP no DAS gera economia patronal líquida de ${formatBRL(cppDeltaPresumidoVsSimplesAnnual)}/ano.`;
  }

  const payrollCppAudit: PayrollCppAudit = {
    hasEmployees,
    hasProLabore,
    employeesPayrollMonthly: employeesMonthly,
    employeesPayrollAnnual: employeesMonthly * 12,
    proLaboreMonthly,
    proLaboreAnnual: proLaboreMonthly * 12,
    totalPayrollMonthly: effectiveMonthlyPayroll,
    totalPayrollAnnual: effectivePayroll12m,
    ratRate,
    terceirosRate,
    simplesCppTreatment: effectiveAnexo === 'IV' ? 'Anexo IV - Recolhimento em GPS/DCTFWeb (20% + RAT)' : 'Inclusa no DAS (Dispensa de 20% Patronal e Terceiros)',
    simplesCppMonthly,
    simplesCppAnnual,
    simplesCppIsInsideDAS,
    presumedCppEmployeesMonthly,
    presumedCppProLaboreMonthly,
    presumedCppTotalMonthly,
    presumedCppTotalAnnual,
    realCppEmployeesMonthly,
    realCppProLaboreMonthly,
    realCppTotalMonthly,
    realCppTotalAnnual,
    cppDeltaPresumidoVsSimplesAnnual,
    cppStrategicDiagnosis,
  };

  const primaryAnexoCalc = calculateAnexoEffectiveRate(effectiveAnexo, standaloneRbt12);

  return {
    consolidatedRevenue,
    standaloneRbt12,
    effectiveRate: effectiveRateGlobalPercent,
    nominalRate: primaryAnexoCalc.nominalRate * 100,
    deduction: primaryAnexoCalc.deduction,
    effectiveTaxMonthly: calculatedEffectiveTaxMonthly,
    rawTaxMonthlyBeforeSegregation: calculatedRawTaxMonthly,
    segregatedDeductionsMonthly: totalSegregatedDeductions,
    effectiveTaxAnnual,
    breakdown: aggregateBreakdown,
    exceedsSublimit,
    sublimitExcessAmount,
    sublimitTaxSegregationNote,
    icmsIssOutsideSimplesTotal: (aggregateBreakdown.icmsPorForaSublimite || 0) + (aggregateBreakdown.issPorForaSublimite || 0),
    sublimitExclusionDetails,
    transportAnalysis,
    stateIcmsTransportInfo: getStateIcmsTransportInfo(company.uf || 'SP'),
    stateSimplesIcmsBenefit: stateSimplesBenefit,
    exceedsFederalLimit,
    federalExcessAmount,
    federalExcessPercent,
    exclusionType,
    fatorR: fatorR * 100,
    isFatorREligible,
    fatorRStatus,
    fatorRAdditionalPayrollNeeded,
    hasPartnerIrregularity: partnerRiskDetails.length > 0,
    partnerRiskDetails,
    
    // Regimes Comparison
    regimesComparison,
    bestRegime,
    lucroPresumidoAnnualTax: lucroPresumidoItem.annualTaxTotal,
    lucroPresumidoEffectiveRate: lucroPresumidoItem.effectiveRatePercent,
    lucroRealAnnualTax: lucroRealItem.annualTaxTotal,
    lucroRealEffectiveRate: lucroRealItem.effectiveRatePercent,
    simplesHibridoAnnualTax: simplesHibridoItem.annualTaxTotal,
    simplesHibridoEffectiveRate: simplesHibridoItem.effectiveRatePercent,

    // Internal vs Export
    monthlyInternalRevenue: totalInternalRevenue,
    monthlyExportRevenue: totalExportRevenue,
    exportLimitAvailable,
    isExportImmunityApplied: totalExportRevenue > 0,

    // Active Anexos
    activeAnexosList,
    anexoCalculations,

    // Reforma IBS/CBS
    reformaSimplesCreditTransferRate: reformaSimplesCreditTransferRate * 100,
    reformaRegularCreditTransferRate: reformaRegularCreditTransferRate * 100,
    b2bClientDisadvantageAnnual,
    bestRegimeRecommendation: bestRegime.recommendationReason,

    // Auditoria Detalhada de Folha, Pró-Labore e CPP Patronal
    payrollCppAudit,

    // Auditoria Detalhada de Fornecedores e Tomada de Créditos (IBS, CBS, ICMS e PIS/COFINS)
    supplierCreditAudit,
  };
}

/**
 * Detailed 4-Regimes Calculation: Simples Padrão, Simples Híbrido, Lucro Presumido, Lucro Real
 */
function calculateRegimeComparisonDetails(params: {
  company: CompanyData;
  standaloneRbt12: number;
  monthlyRevenueTotal: number;
  totalInternalRevenue: number;
  totalExportRevenue: number;
  monthlyPayroll: number;
  payroll12m: number;
  employeesMonthly?: number;
  proLaboreMonthly?: number;
  hasEmployees?: boolean;
  hasProLabore?: boolean;
  inputCostsMonthly: number;
  operationalExpensesMonthly: number;
  simplesEffectiveTaxMonthly: number;
  simplesEffectiveRate: number;
  simplesBreakdown: TaxBreakdown;
  effectiveAnexo: SimplesAnexo;
  exceedsSublimit: boolean;
  exceedsFederalLimit: boolean;
  sublimitExclusionDetails: SublimitExclusionDetails;
  supplierCreditAudit: SupplierCreditAuditResult;
}): RegimeComparisonDetail[] {
  const {
    company,
    monthlyRevenueTotal,
    totalInternalRevenue,
    totalExportRevenue,
    monthlyPayroll,
    inputCostsMonthly,
    operationalExpensesMonthly,
    simplesEffectiveTaxMonthly,
    simplesEffectiveRate,
    simplesBreakdown,
    effectiveAnexo,
    exceedsSublimit,
    exceedsFederalLimit,
    sublimitExclusionDetails,
    supplierCreditAudit,
  } = params;

  const isTransport = company.isTransportService;
  const isService = (effectiveAnexo === 'III' || effectiveAnexo === 'IV' || effectiveAnexo === 'V') && (!isTransport || company.transportType === 'municipal');
  const isIndustry = effectiveAnexo === 'II';
  const isCommerce = effectiveAnexo === 'I';
  const targetIvaRate = (company.targetIvaRate || 26.5) / 100;
  const b2bPercent = (company.b2bSalesPercent || 50) / 100;

  // Determinação precisa de alíquotas e bases previdenciárias patronais (CPP / RAT / Terceiros)
  const ratRate = (company.ratRatePercent !== undefined ? company.ratRatePercent : 3.0) / 100;
  const terceirosRate = (company.terceirosRatePercent !== undefined ? company.terceirosRatePercent : 5.8) / 100;

  const hasEmp = params.hasEmployees !== undefined ? params.hasEmployees : (company.hasEmployeesPayroll ?? true);
  const hasPro = params.hasProLabore !== undefined ? params.hasProLabore : (company.hasProLabore ?? false);
  const empMonthly = params.employeesMonthly !== undefined 
    ? params.employeesMonthly 
    : (hasEmp ? (company.employeesPayrollMonthly ?? monthlyPayroll) : 0);
  const proMonthly = params.proLaboreMonthly !== undefined 
    ? params.proLaboreMonthly 
    : (hasPro ? (company.proLaboreMonthly ?? 0) : 0);

  // No Lucro Presumido e Lucro Real:
  // - Sobre Folha de Empregados CLT: 20% (Patronal) + RAT (1% a 3%) + Terceiros (5,8%) = 28,8%
  // - Sobre Pró-Labore de Sócios: 20% (Patronal) apenas (Art. 22, III da Lei 8.212/91 - isento de RAT e Sistema S)
  const cppPresumidoEmployees = hasEmp ? empMonthly * (0.20 + ratRate + terceirosRate) : 0;
  const cppPresumidoProLabore = hasPro ? proMonthly * 0.20 : 0;
  const cppPresumidoMes = cppPresumidoEmployees + cppPresumidoProLabore;

  // No Lucro Real: mesma base patronal
  const cppRealEmployees = cppPresumidoEmployees;
  const cppRealProLabore = cppPresumidoProLabore;
  const cppRealMes = cppPresumidoMes;

  // No Simples Nacional:
  // - Anexos I, II, III e V: CPP inclusa no DAS (dispensa de 20% patronal e terceiros)
  // - Anexo IV: CPP recolhida fora do DAS via GPS/DCTFWeb (20% + RAT sobre CLT; 20% sobre pró-labore)
  const simplesAnexoIV_CPP = effectiveAnexo === 'IV'
    ? ((hasEmp ? empMonthly * (0.20 + ratRate) : 0) + (hasPro ? proMonthly * 0.20 : 0))
    : 0;

  // ==========================================
  // 1. SIMPLES NACIONAL PADRÃO
  // ==========================================
  const simplesTotalTaxMonthly = exceedsSublimit 
    ? (sublimitExclusionDetails.totalCombinedMonthly + simplesAnexoIV_CPP)
    : (simplesEffectiveTaxMonthly + simplesAnexoIV_CPP);
  const simplesTotalTaxAnnual = simplesTotalTaxMonthly * 12;
  const simplesEffectiveRateAdjusted = monthlyRevenueTotal > 0 ? (simplesTotalTaxMonthly / monthlyRevenueTotal) * 100 : 0;

  const simplesDRE = {
    grossRevenue: monthlyRevenueTotal * 12,
    taxDeductions: simplesTotalTaxAnnual,
    netRevenue: (monthlyRevenueTotal * 12) - simplesTotalTaxAnnual,
    costOfGoodsOrServices: inputCostsMonthly * 12,
    payrollAndCharges: (monthlyPayroll * 12) + (simplesAnexoIV_CPP * 12),
    operationalExpenses: operationalExpensesMonthly * 12,
    taxOnProfit: 0, // No Simples, IRPJ/CSLL estão embutidos nas deduções
    netProfitFinal: Math.max(
      0,
      (monthlyRevenueTotal * 12) - simplesTotalTaxAnnual - (inputCostsMonthly * 12) - (monthlyPayroll * 12) - (operationalExpensesMonthly * 12)
    ),
    netProfitMarginPercent: 0,
  };
  simplesDRE.netProfitMarginPercent = simplesDRE.grossRevenue > 0 ? (simplesDRE.netProfitFinal / simplesDRE.grossRevenue) * 100 : 0;

  const simplesAdvantages = [
    'Arrecadação unificada em guia única mensal (DAS).',
    'Dispensa de contribuição previdenciária patronal (CPP 20% + terceiros 5,8%) sobre folha para Anexos I, II, III e V.',
    'Obrigações acessórias simplificadas (PGDAS-D e DEFIS sem necessidade de SPED Contábil/ECD obrigatório).',
    'Menor burocracia trabalhista e fiscal para micro e pequenas empresas.',
  ];

  const simplesDisadvantages = [
    exceedsSublimit ? `ATENÇÃO: Sublimite estadual de R$ 3,6M ultrapassado — ICMS/ISS recolhidos por fora no regime normal (${formatCurrencyBRL(sublimitExclusionDetails.icmsOutsideMonthly + sublimitExclusionDetails.issOutsideMonthly)}/mês adicional).` : 'Teto federal de R$ 4,8M impõe risco de desenquadramento e exclusão.',
    `Geração de créditos ínfimos para clientes B2B (apenas ~${Math.min(4.5, simplesEffectiveRate * 0.25).toFixed(2)}%), gerando perda de competitividade frente à Reforma Tributária.`,
    'Tributação sobre o faturamento bruto independente de apurar lucro ou prejuízo operacional.',
  ];

  // ==========================================
  // 2. SIMPLES NACIONAL HÍBRIDO (REFORMA IBS/CBS)
  // ==========================================
  // No Simples Híbrido:
  // - IRPJ, CSLL e CPP são recolhidos pelo Simples (alíquota correspondente dentro do DAS)
  // - IBS e CBS são recolhidos no regime geral (não-cumulativo) de 26,5% com tomada de crédito sobre fornecedores
  const simplesDASWithoutConsumption = (simplesBreakdown.irpj + simplesBreakdown.csll + simplesBreakdown.cpp);
  const ibsCbsDebito = totalInternalRevenue * targetIvaRate;
  // Crédito apurado na auditoria pericial ponderando fornecedores do Simples Convencional, Simples Híbrido e Regime Normal
  const ibsCbsCredito = supplierCreditAudit.ibsCbsCreditTotalMonthly;
  const ibsCbsLiquido = Math.max(0, ibsCbsDebito - ibsCbsCredito);
  const hibridoMonthlyTax = simplesDASWithoutConsumption + ibsCbsLiquido + simplesAnexoIV_CPP;
  const hibridoAnnualTax = hibridoMonthlyTax * 12;
  const hibridoEffectiveRate = monthlyRevenueTotal > 0 ? (hibridoMonthlyTax / monthlyRevenueTotal) * 100 : 0;

  const hibridoDRE = {
    grossRevenue: monthlyRevenueTotal * 12,
    taxDeductions: hibridoAnnualTax,
    netRevenue: (monthlyRevenueTotal * 12) - hibridoAnnualTax,
    costOfGoodsOrServices: inputCostsMonthly * 12,
    payrollAndCharges: (monthlyPayroll * 12) + (simplesAnexoIV_CPP * 12),
    operationalExpenses: operationalExpensesMonthly * 12,
    taxOnProfit: 0,
    netProfitFinal: Math.max(
      0,
      (monthlyRevenueTotal * 12) - hibridoAnnualTax - (inputCostsMonthly * 12) - (monthlyPayroll * 12) - (operationalExpensesMonthly * 12)
    ),
    netProfitMarginPercent: 0,
  };
  hibridoDRE.netProfitMarginPercent = hibridoDRE.grossRevenue > 0 ? (hibridoDRE.netProfitFinal / hibridoDRE.grossRevenue) * 100 : 0;

  const hibridoAdvantages = [
    'Transfere 100% de crédito de IBS/CBS (26,50%) aos clientes B2B, eliminando a barreira comercial com grandes empresas.',
    'Mantém os benefícios de recolhimento simplificado de IRPJ, CSLL e CPP pelo Simples Nacional.',
    'Direito à apropriação integral de créditos de IBS/CBS sobre insumos, mercadorias, fretes, energia e serviços contratados.',
  ];

  const hibridoDisadvantages = [
    'Aumento da carga tributária nominal sobre operações com alto valor agregado ou baixa aquisição de insumos (especialmente serviços).',
    'Exigência de cumprimento de obrigações acessórias do IBS e CBS no regime regular (SPED e split payment).',
  ];

  // ==========================================
  // 3. LUCRO PRESUMIDO
  // ==========================================
  // Presunção discriminada por atividade:
  // - Transporte Cargas Intermunicipal: 8% IRPJ, 12% CSLL
  // - Transporte Passageiros Intermunicipal: 16% IRPJ, 12% CSLL
  // - Serviços em Geral / Transporte Municipal: 32% IRPJ, 32% CSLL
  // - Comércio / Indústria: 8% IRPJ, 12% CSLL
  let basePresumidaIRPJ_mes = 0;
  let basePresumidaCSLL_mes = 0;
  let revenueSubjectToIcms = 0;
  let revenueSubjectToIss = 0;

  const rawAnexos = company.anexoRevenues && company.anexoRevenues.length > 0 
    ? company.anexoRevenues.filter(a => a.active) 
    : [];

  if (rawAnexos.length > 0) {
    rawAnexos.forEach((item) => {
      const revItem = (item.monthlyRevenueInternal || 0) + (item.monthlyRevenueExport || 0);
      const revInternal = item.monthlyRevenueInternal || 0;
      
      const actDef = DEFAULT_ANEXO_ACTIVITIES.find(a => a.key === item.activityKey);
      let irpjRate = actDef?.presumedProfitRateIRPJ ?? 0.08;
      let csllRate = actDef?.presumedProfitRateCSLL ?? 0.12;

      if (item.isTransport || item.transportType || item.activityKey?.includes('transporte')) {
        const tType = item.transportType || (item.activityKey === 'anexo_3_transporte_passageiros' ? 'intermunicipal_passageiros' : item.activityKey === 'anexo_3_transporte_municipal' ? 'municipal' : 'intermunicipal_cargas');
        if (tType === 'intermunicipal_cargas') {
          irpjRate = 0.08;
          csllRate = 0.12;
          revenueSubjectToIcms += revInternal;
        } else if (tType === 'intermunicipal_passageiros') {
          irpjRate = 0.16;
          csllRate = 0.12;
          revenueSubjectToIcms += revInternal;
        } else {
          irpjRate = 0.32;
          csllRate = 0.32;
          revenueSubjectToIss += revInternal;
        }
      } else if (item.anexo === 'I' || item.anexo === 'II') {
        irpjRate = 0.08;
        csllRate = 0.12;
        revenueSubjectToIcms += revInternal;
      } else {
        irpjRate = 0.32;
        csllRate = 0.32;
        revenueSubjectToIss += revInternal;
      }

      basePresumidaIRPJ_mes += (revItem * irpjRate);
      basePresumidaCSLL_mes += (revItem * csllRate);
    });
  } else {
    let irpjPresumptionRate = 0.08;
    let csllPresumptionRate = 0.12;

    if (isTransport) {
      if (company.transportType === 'intermunicipal_cargas') {
        irpjPresumptionRate = 0.08;
        csllPresumptionRate = 0.12;
        revenueSubjectToIcms = totalInternalRevenue;
      } else if (company.transportType === 'intermunicipal_passageiros') {
        irpjPresumptionRate = 0.16;
        csllPresumptionRate = 0.12;
        revenueSubjectToIcms = totalInternalRevenue;
      } else {
        irpjPresumptionRate = 0.32;
        csllPresumptionRate = 0.32;
        revenueSubjectToIss = totalInternalRevenue;
      }
    } else if (isService) {
      irpjPresumptionRate = 0.32;
      csllPresumptionRate = 0.32;
      revenueSubjectToIss = totalInternalRevenue;
    } else {
      revenueSubjectToIcms = totalInternalRevenue;
    }

    basePresumidaIRPJ_mes = (totalInternalRevenue + totalExportRevenue) * irpjPresumptionRate;
    basePresumidaCSLL_mes = (totalInternalRevenue + totalExportRevenue) * csllPresumptionRate;
  }

  // IRPJ: 15% + 10% adicional sobre excedente de R$ 20.000/mês (R$ 60.000/trimestre)
  const irpjBase15 = basePresumidaIRPJ_mes * 0.15;
  const irpjAdicional10 = Math.max(0, basePresumidaIRPJ_mes - 20000) * 0.10;
  const irpjPresumidoMes = irpjBase15 + irpjAdicional10;

  // CSLL: 9% sobre a base presumida
  const csllPresumidoMes = basePresumidaCSLL_mes * 0.09;

  // PIS (0,65%) e COFINS (3,00%) cumulativos sobre mercado interno (Exportação = 0%)
  const pisPresumidoMes = totalInternalRevenue * 0.0065;
  const cofinsPresumidoMes = totalInternalRevenue * 0.0300;

  // ICMS estadual estimado ou ISS municipal
  const ufIcmsRate = (company.customIcmsRate !== undefined ? company.customIcmsRate : getStandardIcmsRateForUF(company.uf)) / 100;
  const cityIssRate = (company.customIssRate !== undefined ? company.customIssRate : getStandardIssRateForCity(company.uf, company.city)) / 100;

  // Crédito de ICMS calculado pela auditoria pericial (apenas sobre mercadorias, ponderando fornecedores do Simples e Regime Normal)
  const icmsPresumidoMes = Math.max(0, (revenueSubjectToIcms * ufIcmsRate) - supplierCreditAudit.icmsCreditTotalMonthly);
  const issPresumidoMes = revenueSubjectToIss * cityIssRate;

  const lucroPresumidoMonthlyTax = irpjPresumidoMes + csllPresumidoMes + pisPresumidoMes + cofinsPresumidoMes + cppPresumidoMes + icmsPresumidoMes + issPresumidoMes;
  const lucroPresumidoAnnualTax = lucroPresumidoMonthlyTax * 12;
  const lucroPresumidoEffectiveRate = monthlyRevenueTotal > 0 ? (lucroPresumidoMonthlyTax / monthlyRevenueTotal) * 100 : 0;

  const presumidoDRE = {
    grossRevenue: monthlyRevenueTotal * 12,
    taxDeductions: (pisPresumidoMes + cofinsPresumidoMes + icmsPresumidoMes + issPresumidoMes) * 12,
    netRevenue: (monthlyRevenueTotal * 12) - ((pisPresumidoMes + cofinsPresumidoMes + icmsPresumidoMes + issPresumidoMes) * 12),
    costOfGoodsOrServices: inputCostsMonthly * 12,
    payrollAndCharges: (monthlyPayroll * 12) + (cppPresumidoMes * 12),
    operationalExpenses: operationalExpensesMonthly * 12,
    taxOnProfit: (irpjPresumidoMes + csllPresumidoMes) * 12,
    netProfitFinal: Math.max(
      0,
      (monthlyRevenueTotal * 12) - lucroPresumidoAnnualTax - (inputCostsMonthly * 12) - (monthlyPayroll * 12) - (operationalExpensesMonthly * 12)
    ),
    netProfitMarginPercent: 0,
  };
  presumidoDRE.netProfitMarginPercent = presumidoDRE.grossRevenue > 0 ? (presumidoDRE.netProfitFinal / presumidoDRE.grossRevenue) * 100 : 0;

  const presumidoAdvantages = [
    isTransport && company.transportType === 'intermunicipal_cargas'
      ? 'Presunção favorecida de apenas 8% para IRPJ e 12% para CSLL em transporte intermunicipal de cargas (Lei 9.249/95).'
      : 'Altamente vantajoso se a margem de lucro real da empresa for expressivamente superior à presunção legal (ex: margem real > 32% em serviços ou > 8% em comércio).',
    'PIS (0,65%) e COFINS (3,00%) em regime cumulativo com alíquotas nominais baixas.',
    'Isenção total de PIS, COFINS, ICMS e IPI sobre receitas de exportação.',
    'Sem limite de faturamento de R$ 4,8M (limite anual de até R$ 78.000.000,00).',
  ];

  const presumidoDisadvantages = [
    'Elevada contribuição patronal sobre a folha de pagamento (20% CPP + RAT + terceiros = 28,8%).',
    'Vedada a apropriação de créditos de PIS e COFINS sobre compras e custos operacionais.',
    'Tributação fixa de IRPJ e CSLL mesmo se a empresa passar por meses de prejuízo real.',
    'Exigência de entrega de SPED Contábil (ECD), ECF, EFD-Contribuições e DCTF.',
  ];

  // ==========================================
  // 4. LUCRO REAL
  // ==========================================
  // Apuração real:
  // Lucro Real Mensal = Receita Bruta - Custos Insumos - Folha - Encargos CPP - Despesas Operacionais
  const realOperatingCosts = inputCostsMonthly + (monthlyPayroll + cppRealMes) + operationalExpensesMonthly;
  const lucroRealFiscalMes = Math.max(0, monthlyRevenueTotal - realOperatingCosts);

  // IRPJ: 15% + 10% adicional sobre excedente de R$ 20.000/mês
  const irpjRealMes = lucroRealFiscalMes > 0
    ? (lucroRealFiscalMes * 0.15) + (Math.max(0, lucroRealFiscalMes - 20000) * 0.10)
    : 0;

  // CSLL: 9% sobre lucro real
  const csllRealMes = lucroRealFiscalMes > 0 ? (lucroRealFiscalMes * 0.09) : 0;

  // PIS (1,65%) e COFINS (7,60%) Não-Cumulativos (9,25% total)
  // Débito sobre receita interna - Crédito sobre insumos/serviços de fornecedores elegíveis
  const debitoPisCofinsReal = totalInternalRevenue * 0.0925;
  const creditoPisCofinsReal = supplierCreditAudit.pisCofinsCreditTotalMonthly;
  const pisCofinsLiquidoReal = Math.max(0, debitoPisCofinsReal - creditoPisCofinsReal);
  const pisRealMes = pisCofinsLiquidoReal * (1.65 / 9.25);
  const cofinsRealMes = pisCofinsLiquidoReal * (7.60 / 9.25);

  // ICMS / ISS no regime normal com créditos calculados pela auditoria de fornecedores
  const icmsRealMes = Math.max(0, (revenueSubjectToIcms * ufIcmsRate) - supplierCreditAudit.icmsCreditTotalMonthly);
  const issRealMes = revenueSubjectToIss * cityIssRate;

  const lucroRealMonthlyTax = irpjRealMes + csllRealMes + pisRealMes + cofinsRealMes + cppRealMes + icmsRealMes + issRealMes;
  const lucroRealAnnualTax = lucroRealMonthlyTax * 12;
  const lucroRealEffectiveRate = monthlyRevenueTotal > 0 ? (lucroRealMonthlyTax / monthlyRevenueTotal) * 100 : 0;

  const realDRE = {
    grossRevenue: monthlyRevenueTotal * 12,
    taxDeductions: (pisRealMes + cofinsRealMes + icmsRealMes + issRealMes) * 12,
    netRevenue: (monthlyRevenueTotal * 12) - ((pisRealMes + cofinsRealMes + icmsRealMes + issRealMes) * 12),
    costOfGoodsOrServices: inputCostsMonthly * 12,
    payrollAndCharges: (monthlyPayroll * 12) + (cppRealMes * 12),
    operationalExpenses: operationalExpensesMonthly * 12,
    taxOnProfit: (irpjRealMes + csllRealMes) * 12,
    netProfitFinal: Math.max(
      0,
      (monthlyRevenueTotal * 12) - lucroRealAnnualTax - (inputCostsMonthly * 12) - (monthlyPayroll * 12) - (operationalExpensesMonthly * 12)
    ),
    netProfitMarginPercent: 0,
  };
  realDRE.netProfitMarginPercent = realDRE.grossRevenue > 0 ? (realDRE.netProfitFinal / realDRE.grossRevenue) * 100 : 0;

  const realAdvantages = [
    'Justiça fiscal absoluta: se a empresa tiver margem de lucro baixa (< 5% a 8%) ou prejuízo, não há incidência de IRPJ e CSLL.',
    'Compensação de prejuízos fiscais acumulados de períodos anteriores em até 30% do lucro real.',
    'Direito a créditos integrais de PIS (1,65%) e COFINS (7,60%) sobre insumos, mercadorias, combustíveis, aluguéis de galpões, fretes e energia elétrica.',
    'Geração integral de créditos fiscais aos clientes B2B adquirentes.',
  ];

  const realDisadvantages = [
    'Máxima complexidade contábil e documental do sistema tributário brasileiro (LALUR/LACS eletrônico, SPED ECD, ECF, EFD).',
    'Alíquota nominal de PIS/COFINS de 9,25% (oneroso para empresas de serviços cuja maior despesa é folha salarial, que não gera crédito de PIS/COFINS).',
    'Encargos previdenciários patronais de 28,8% sobre folha de pagamento.',
    'Rigor e risco de autuação fiscal por glosa de créditos ou despesas consideradas indedutíveis pelo fisco.',
  ];

  // ==========================================
  // RECOMMENDATION SCORING & AUDIT VERDICT
  // ==========================================
  // Criteria:
  // 1. Economic efficiency (lowest tax + highest net profit)
  // 2. Legal compliance (exclusion risks, sublimit)
  // 3. Commercial competitiveness (B2B credit transfer)
  
  let simplesScore = 80;
  let hibridoScore = 70;
  let presumidoScore = 65;
  let realScore = 60;

  // Penalize Simples if exceeds federal limit or critical risk
  if (exceedsFederalLimit) {
    simplesScore = 15;
    hibridoScore = 20;
    presumidoScore += 25;
    realScore += 20;
  }

  // If high B2B sales (> 60%), favor regimes that generate credit
  if (b2bPercent >= 0.6) {
    simplesScore -= 20;
    hibridoScore += 20;
    presumidoScore += 10;
    realScore += 15;
  }

  // Cost comparison adjustments
  const minTax = Math.min(simplesTotalTaxAnnual, hibridoAnnualTax, lucroPresumidoAnnualTax, lucroRealAnnualTax);
  if (simplesTotalTaxAnnual === minTax && !exceedsFederalLimit) simplesScore += 25;
  if (hibridoAnnualTax === minTax && !exceedsFederalLimit) hibridoScore += 25;
  if (lucroPresumidoAnnualTax === minTax) presumidoScore += 25;
  if (lucroRealAnnualTax === minTax) realScore += 25;

  // Service with low inputs penalty for Real
  if (isService && inputCostsMonthly < (monthlyRevenueTotal * 0.2)) {
    realScore -= 15;
  }

  // Low margin company advantage for Real
  const estimatedProfitMargin = (company.estimatedNetProfitMargin || 15);
  if (estimatedProfitMargin <= 6) {
    realScore += 30;
    presumidoScore -= 20;
  }

  // Normalize scores to 0-100
  simplesScore = Math.max(5, Math.min(99, simplesScore));
  hibridoScore = Math.max(5, Math.min(99, hibridoScore));
  presumidoScore = Math.max(5, Math.min(99, presumidoScore));
  realScore = Math.max(5, Math.min(99, realScore));

  const maxScore = Math.max(simplesScore, hibridoScore, presumidoScore, realScore);

  const formatReason = (name: string, diffVsSimples: number) => {
    if (exceedsFederalLimit) {
      return `Desenquadramento mandatório do Simples por faturamento superior a R$ 4,8M. ${name} é a opção mais indicada legal e economicamente.`;
    }
    if (diffVsSimples > 0) {
      return `Economia tributária anual de ${formatCurrencyBRL(diffVsSimples)} em relação ao Simples Nacional, com melhor retorno líquido.`;
    }
    if (b2bPercent >= 0.7) {
      return `Excelente alinhamento comercial com a Reforma Tributária (IBS/CBS), garantindo repasse de créditos aos clientes PJ.`;
    }
    return `Menor carga tributária efetiva consolidada (${(simplesEffectiveRateAdjusted).toFixed(2)}%) e máxima simplificação operacional.`;
  };

  return [
    {
      regime: 'simples_padrao',
      name: 'Simples Nacional Padrão',
      shortName: 'Simples Padrão',
      description: 'Regime unificado pelo DAS (LC 123/2006). Indicado para empresas com foco no consumidor final (B2C) ou faturamento dentro das primeiras faixas.',
      monthlyTaxTotal: simplesTotalTaxMonthly,
      annualTaxTotal: simplesTotalTaxAnnual,
      effectiveRatePercent: simplesEffectiveRateAdjusted,
      taxes: {
        irpj: simplesBreakdown.irpj,
        csll: simplesBreakdown.csll,
        pis: simplesBreakdown.pis,
        cofins: simplesBreakdown.cofins,
        cppEncargos: simplesBreakdown.cpp + simplesAnexoIV_CPP,
        icms: simplesBreakdown.icms,
        iss: simplesBreakdown.iss,
        icmsIssOutside: (simplesBreakdown.icmsPorForaSublimite || 0) + (simplesBreakdown.issPorForaSublimite || 0),
      },
      dre: simplesDRE,
      advantages: simplesAdvantages,
      disadvantages: simplesDisadvantages,
      b2bCreditRatePercent: Math.min(4.5, simplesEffectiveRate * 0.25),
      b2bCompetitivenessRank: b2bPercent > 0.5 ? 'pessima' : 'media',
      complianceComplexity: 'baixa',
      legalRiskLevel: exceedsFederalLimit ? 'alto' : 'baixo',
      recommendationScore: simplesScore,
      isRecommended: simplesScore === maxScore,
      recommendationReason: formatReason('Simples Nacional Padrão', 0),
    },
    {
      regime: 'simples_hibrido',
      name: 'Simples Nacional Híbrido (Reforma Tributária)',
      shortName: 'Simples Híbrido',
      description: 'Opção da EC 132/2023 & LC 214/2025: IRPJ/CSLL/CPP pelo Simples e IBS/CBS pelo regime regular não-cumulativo para gerar créditos integrais.',
      monthlyTaxTotal: hibridoMonthlyTax,
      annualTaxTotal: hibridoAnnualTax,
      effectiveRatePercent: hibridoEffectiveRate,
      taxes: {
        irpj: simplesBreakdown.irpj,
        csll: simplesBreakdown.csll,
        pis: 0,
        cofins: 0,
        cppEncargos: simplesBreakdown.cpp + simplesAnexoIV_CPP,
        icms: 0,
        iss: 0,
        ibsCbs: ibsCbsLiquido,
      },
      dre: hibridoDRE,
      advantages: hibridoAdvantages,
      disadvantages: hibridoDisadvantages,
      b2bCreditRatePercent: targetIvaRate * 100,
      b2bCompetitivenessRank: 'maxima',
      complianceComplexity: 'moderada',
      legalRiskLevel: 'baixo',
      recommendationScore: hibridoScore,
      isRecommended: hibridoScore === maxScore,
      recommendationReason: formatReason('Simples Híbrido', simplesTotalTaxAnnual - hibridoAnnualTax),
    },
    {
      regime: 'lucro_presumido',
      name: 'Lucro Presumido',
      shortName: 'Lucro Presumido',
      description: 'Base de lucro pré-fixada pela Receita Federal (8% a 32%). Ideal para empresas com margens reais elevadas e baixo custo de folha.',
      monthlyTaxTotal: lucroPresumidoMonthlyTax,
      annualTaxTotal: lucroPresumidoAnnualTax,
      effectiveRatePercent: lucroPresumidoEffectiveRate,
      taxes: {
        irpj: irpjPresumidoMes,
        csll: csllPresumidoMes,
        pis: pisPresumidoMes,
        cofins: cofinsPresumidoMes,
        cppEncargos: cppPresumidoMes,
        icms: icmsPresumidoMes,
        iss: issPresumidoMes,
      },
      dre: presumidoDRE,
      advantages: presumidoAdvantages,
      disadvantages: presumidoDisadvantages,
      b2bCreditRatePercent: targetIvaRate * 100,
      b2bCompetitivenessRank: 'alta',
      complianceComplexity: 'alta',
      legalRiskLevel: 'moderado',
      recommendationScore: presumidoScore,
      isRecommended: presumidoScore === maxScore,
      recommendationReason: formatReason('Lucro Presumido', simplesTotalTaxAnnual - lucroPresumidoAnnualTax),
    },
    {
      regime: 'lucro_real',
      name: 'Lucro Real',
      shortName: 'Lucro Real',
      description: 'Tributação sobre o resultado líquido contábil apurado no LALUR/LACS. Obrigatório para instituições financeiras e ideal para margens reduzidas.',
      monthlyTaxTotal: lucroRealMonthlyTax,
      annualTaxTotal: lucroRealAnnualTax,
      effectiveRatePercent: lucroRealEffectiveRate,
      taxes: {
        irpj: irpjRealMes,
        csll: csllRealMes,
        pis: pisRealMes,
        cofins: cofinsRealMes,
        cppEncargos: cppRealMes,
        icms: icmsRealMes,
        iss: issRealMes,
      },
      dre: realDRE,
      advantages: realAdvantages,
      disadvantages: realDisadvantages,
      b2bCreditRatePercent: targetIvaRate * 100,
      b2bCompetitivenessRank: 'maxima',
      complianceComplexity: 'muito_alta',
      legalRiskLevel: 'moderado',
      recommendationScore: realScore,
      isRecommended: realScore === maxScore,
      recommendationReason: formatReason('Lucro Real', simplesTotalTaxAnnual - lucroRealAnnualTax),
    },
  ];
}

export function getDefaultCFOPsForAnexo(anexo: SimplesAnexo, isTransport?: boolean): import('../types').CFOPItem[] {
  if (isTransport) {
    return [
      {
        id: 'cfop-tr-1',
        code: '5.353',
        description: 'Prestação de serviço de transporte a estabelecimento comercial (ICMS no DAS)',
        percentage: 70,
        anexo: 'III',
        icmsTreatment: 'tributado_integral',
        issTreatment: 'nao_aplicavel',
        pisCofinsTreatment: 'tributado_integral',
      },
      {
        id: 'cfop-tr-2',
        code: '5.360',
        description: 'Prestação de serviço de transporte com isenção ou subcontratação (Conv. 25/90)',
        percentage: 30,
        anexo: 'III',
        icmsTreatment: 'isencao_total',
        issTreatment: 'nao_aplicavel',
        pisCofinsTreatment: 'tributado_integral',
      },
    ];
  }

  if (anexo === 'I') {
    return [
      {
        id: 'cfop-def-1',
        code: '5.102',
        description: 'Venda de mercadoria adquirida de terceiros (Tributado Integralmente no DAS)',
        percentage: 60,
        anexo: 'I',
        icmsTreatment: 'tributado_integral',
        issTreatment: 'nao_aplicavel',
        pisCofinsTreatment: 'tributado_integral',
      },
      {
        id: 'cfop-def-2',
        code: '5.405',
        description: 'Venda de mercadoria com ICMS retido anteriormente por Substituição Tributária (ST)',
        percentage: 30,
        anexo: 'I',
        icmsTreatment: 'st_substituicao',
        issTreatment: 'nao_aplicavel',
        pisCofinsTreatment: 'monofasico_segregado',
      },
      {
        id: 'cfop-def-3',
        code: '5.102-ISEN',
        description: 'Venda com Isenção/Redução de ICMS Estadual (Cesta Básica / Benefício Fiscal)',
        percentage: 10,
        anexo: 'I',
        icmsTreatment: 'isencao_total',
        issTreatment: 'nao_aplicavel',
        pisCofinsTreatment: 'tributado_integral',
      },
    ];
  }

  if (anexo === 'II') {
    return [
      {
        id: 'cfop-ind-1',
        code: '5.101',
        description: 'Venda de produção própria industrial (ICMS e IPI integral no DAS)',
        percentage: 80,
        anexo: 'II',
        icmsTreatment: 'tributado_integral',
        issTreatment: 'nao_aplicavel',
        pisCofinsTreatment: 'tributado_integral',
      },
      {
        id: 'cfop-ind-2',
        code: '5.401',
        description: 'Venda de produção própria com ICMS ST retido na fonte',
        percentage: 20,
        anexo: 'II',
        icmsTreatment: 'st_substituicao',
        issTreatment: 'nao_aplicavel',
        pisCofinsTreatment: 'tributado_integral',
      },
    ];
  }

  if (anexo === 'IV') {
    return [
      {
        id: 'cfop-an4-1',
        code: '5.933',
        description: 'Prestação de serviços de construção civil / advocacia / vigilância (ISS no DAS)',
        percentage: 80,
        anexo: 'IV',
        icmsTreatment: 'nao_aplicavel',
        issTreatment: 'tributado_integral',
        pisCofinsTreatment: 'tributado_integral',
      },
      {
        id: 'cfop-an4-2',
        code: '5.933-RET',
        description: 'Prestação de serviços com ISS retido na fonte pelo tomador municipal',
        percentage: 20,
        anexo: 'IV',
        icmsTreatment: 'nao_aplicavel',
        issTreatment: 'retido_tomador',
        pisCofinsTreatment: 'tributado_integral',
      },
    ];
  }

  // Anexos III e V (Serviços em Geral / Fator R)
  return [
    {
      id: 'cfop-srv-1',
      code: '5.933',
      description: `Prestação de serviços no município tributada pelo ISS no DAS (${anexo})`,
      percentage: 85,
      anexo: anexo,
      icmsTreatment: 'nao_aplicavel',
      issTreatment: 'tributado_integral',
      pisCofinsTreatment: 'tributado_integral',
    },
    {
      id: 'cfop-srv-2',
      code: '5.933-RET',
      description: 'Prestação de serviços com ISS retido pelo tomador na fonte (Art. 3º LC 116/03)',
      percentage: 15,
      anexo: anexo,
      icmsTreatment: 'nao_aplicavel',
      issTreatment: 'retido_tomador',
      pisCofinsTreatment: 'tributado_integral',
    },
  ];
}

export const COMMON_CFOPS_CATALOG = [
  { code: '5.102', description: 'Venda de mercadoria de terceiros no estado', defaultIcms: 'tributado_integral', anexo: 'I' },
  { code: '5.405', description: 'Venda de mercadoria com ICMS ST anteriormente retido', defaultIcms: 'st_substituicao', anexo: 'I' },
  { code: '6.102', description: 'Venda de mercadoria de terceiros interestadual', defaultIcms: 'tributado_integral', anexo: 'I' },
  { code: '6.404', description: 'Venda interestadual com ICMS ST recolhido na operação', defaultIcms: 'st_substituicao', anexo: 'I' },
  { code: '5.101', description: 'Venda de produção própria do estabelecimento', defaultIcms: 'tributado_integral', anexo: 'II' },
  { code: '5.401', description: 'Venda de produção do estabelecimento com ICMS ST', defaultIcms: 'st_substituicao', anexo: 'II' },
  { code: '5.933', description: 'Prestação de serviços no município (ISS)', defaultIcms: 'isencao_total', defaultIss: 'tributado_integral', anexo: 'III' },
  { code: '6.933', description: 'Prestação de serviços para outro município (com retenção ISS)', defaultIcms: 'isencao_total', defaultIss: 'retido_tomador', anexo: 'III' },
  { code: '5.109', description: 'Venda de produção do estabelecimento para Zona Franca / ALC (Isenção)', defaultIcms: 'isencao_total', anexo: 'I' },
  { code: '5.902', description: 'Retorno de mercadoria utilizada na industrialização por encomenda', defaultIcms: 'isencao_total', anexo: 'II' },
];

export function formatCurrencyBRL(value: number): string {
  return (value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatPercentBR(value: number): string {
  return `${(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}
