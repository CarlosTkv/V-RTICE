import { SimplesAnexo, CompanyData } from '../types';
import { ANEXO_TABLES, calculateAnexoEffectiveRate, STATE_SUBLIMIT, FEDERAL_LIMIT, FATOR_R_THRESHOLD } from './taxRules';

export interface SimplesHibridoInput {
  company: CompanyData;
  rbt12: number;
  monthlyRevenue: number;
  payroll12m: number;
  monthlyPayroll: number;
  anexoSelected: SimplesAnexo;
  subjectToFatorR?: boolean;
  inputCostsMonthly: number; // Compras mensais de mercadorias / insumos / serviços
  simplesSupplierPercent: number; // % Compras de fornecedores do Simples Tradicional
  generalSupplierPercent: number; // % Compras de fornecedores do Regime Geral / Simples Híbrido
  b2bSalesPercent: number; // % Faturamento vendido para PJs (Lucro Real / Presumido)
  targetIvaRate: number; // Alíquota de referência IBS/CBS (ex: 26.5%)
  hasEmployeesPayroll?: boolean;
  employeesPayrollMonthly?: number;
  hasProLabore?: boolean;
  proLaboreMonthly?: number;
  ratRatePercent?: number;
}

export interface AnexoPartitionShare {
  irpj: number;
  csll: number;
  pis: number;
  cofins: number;
  cpp: number;
  icms: number;
  iss: number;
  totalIbsCbsShare: number; // Parcela de IBS/CBS a ser subtraída
  retainedInDasShare: number; // Parcela retida no DAS (IRPJ + CSLL + CPP)
}

export interface SimplesHibridoResult {
  // Dados de Entrada Consolidados
  rbt12: number;
  monthlyRevenue: number;
  effectiveAnexo: SimplesAnexo;
  nominalRate: number;
  deduction: number;
  standardEffectiveRate: number; // Alíquota Efetiva Padrão (%)
  
  // Travas Lógicas
  trava01Sublimite: {
    isExceeded: boolean;
    sublimitLimit: number;
    excessAmount: number;
    blockedTraditional: boolean;
    warningMessage: string;
  };
  
  trava02FatorR: {
    isApplicable: boolean;
    fatorR: number; // %
    fatorRRatio: number; // 0.xx
    simulatedAnexo: SimplesAnexo;
    fatorRActive: boolean;
    payrollNeededForAnexoIII: number;
    diagnosisText: string;
  };
  
  trava03CreditoEntrada: {
    totalInputPurchases: number;
    simplesSupplierPurchases: number;
    generalSupplierPurchases: number;
    simplesSupplierCreditRate: number; // % (subdimensionada)
    generalSupplierCreditRate: number; // % (integral, ex: 26.5%)
    simplesSupplierCreditAmount: number;
    generalSupplierCreditAmount: number;
    totalIbsCbsInputCreditMonthly: number;
    totalIbsCbsInputCreditAnnual: number;
    effectiveInputCreditRatePercent: number;
  };
  
  // Partilha e DAS Reduzido
  partition: AnexoPartitionShare;
  reducedDasRate: number; // Alíquota efetiva reduzida do DAS (%)
  reducedDasMonthly: number; // Guia DAS Reduzida (R$/mês)
  reducedDasAnnual: number;
  
  // Anexo IV - CPP por Fora (DCTFWeb)
  anexoIV_CPP_Monthly: number;
  anexoIV_CPP_Annual: number;
  
  // CENÁRIO A: PARTE FINANCEIRA (FLUXO DE CAIXA INTERNO)
  cenarioA_Financeiro: {
    // Simples Tradicional
    tradicionalMonthlyTax: number;
    tradicionalAnnualTax: number;
    tradicionalEffectiveRate: number;
    tradicionalDasAmount: number;
    tradicionalCppAmount: number;
    
    // Simples Híbrido
    hibridoGrossIbsCbsDebitoMonthly: number;
    hibridoIbsCbsCreditoMonthly: number;
    hibridoNetIbsCbsPayableMonthly: number;
    hibridoTotalMonthlyTax: number;
    hibridoTotalAnnualTax: number;
    hibridoEffectiveRate: number;
    
    // Confronto Financeiro
    monthlyDelta: number; // Valor absoluto de diferença
    annualDelta: number;
    cheaperRegime: 'tradicional' | 'hibrido' | 'equivalente';
    savingsExplanation: string;
    cashflowSummary: string;
  };
  
  // CENÁRIO B: CENÁRIO COMPLETO (VISÃO COMERCIAL E MERCADO B2B)
  cenarioB_Comercial: {
    b2bSalesPercent: number;
    b2cSalesPercent: number;
    b2bRevenueMonthly: number;
    b2bRevenueAnnual: number;
    b2cRevenueMonthly: number;
    b2cRevenueAnnual: number;
    
    // Crédito repassado no Tradicional
    tradicionalB2bCreditRate: number; // %
    tradicionalB2bCreditMonthly: number;
    tradicionalB2bNetCostToBuyer: number; // Preço - Crédito
    tradicionalB2bEffectiveNetCostPercent: number;
    
    // Crédito repassado no Híbrido
    hibridoB2bCreditRate: number; // 26.5%
    hibridoB2bCreditMonthly: number;
    hibridoB2bNetCostToBuyer: number; // Preço - Crédito Integral
    hibridoB2bEffectiveNetCostPercent: number;
    
    // Vantagem Comercial / Gap de Preço
    buyerSavingsMonthlyInHibrido: number;
    buyerSavingsAnnualInHibrido: number;
    buyerPriceAdvantagePercent: number; // % de redução de custo pro cliente PJ
    commercialCompetitivenessLevel: 'baixa' | 'moderada' | 'alta' | 'critica_positiva';
    commercialSummary: string;

    // Análise de Risco B2C e Falta de Repasse
    b2cTaxCostDifferenceMonthly: number; // Custo extra suportado no B2C sem repasse
    b2cTaxCostDifferenceAnnual: number;
    nonPassThroughRiskLevel: 'baixo' | 'moderado' | 'alto' | 'critico';
    nonPassThroughRiskExplanation: string;
  };

  // DIAGNÓSTICO PROFUNDO DE SENSIBILIDADE (BREAK-EVEN & VALOR AGREGADO)
  sensitivityAndBreakEven: {
    inputBreakEvenPercent: number; // % de compras necessário para empatar
    inputBreakEvenMonthly: number; // R$/mês
    currentInputPercent: number;
    isInputBelowBreakEven: boolean;
    inputGapPercent: number;
    noInputPurchasesTaxDifferenceMonthly: number; // Custo extra do Híbrido se Compras = 0
    noInputPurchasesEffectiveRate: number; // Alíquota do Híbrido se Compras = 0
    inputDiagnosticWarning: string;
    b2bBreakEvenPercent: number; // % de vendas B2B onde o ganho do cliente compensa a perda interna
    isB2bAboveBreakEven: boolean;
    b2bDiagnosticWarning: string;
    payrollWeightOnRevenuePercent: number;
    payrollExclusionWarning: string;
  };
  
  // PARECER TÉCNICO OFICIAL ESTRUTURADO
  technicalOpinion: {
    title: string;
    legalBasis: string;
    section1_FinancialDiagnostic: {
      rbt12Formatted: string;
      chosenRegime: string;
      tradicionalCostMonthlyFormatted: string;
      hibridoCostMonthlyFormatted: string;
      economicAdvantageFormatted: string;
      advantageDirection: string;
      text: string;
    };
    section2_MarketDiagnostic: {
      b2bPercentFormatted: string;
      tradicionalCreditRateFormatted: string;
      hibridoCreditRateFormatted: string;
      textTradicional: string;
      textHibrido: string;
    };
    section3_RecommendationVerdict: {
      recommendedRegime: 'SIMPLES TRADICIONAL' | 'SIMPLES HÍBRIDO';
      verdictShort: string;
      commercialJustification: string;
      riskNote: string;
    };
    rawFormattedMarkdown: string;
  };
}

/**
 * Obtém a partilha de tributos e taxa de IBS/CBS dentro do DAS para o Anexo e RBT12 informados
 */
export function getAnexoPartition(anexo: SimplesAnexo, rbt12: number): AnexoPartitionShare {
  const { bracket } = calculateAnexoEffectiveRate(anexo, rbt12);
  const pb = bracket.percentBreakdown;

  let totalIbsCbsShare = 0;
  let retainedInDasShare = 0;

  if (anexo === 'I') {
    // Anexo I (Comércio): Expurgar PIS + COFINS (CBS) + ICMS (IBS)
    const pisShare = pb.pis || 0.0276;
    const cofinsShare = pb.cofins || 0.1274;
    const icmsShare = pb.icms || 0.34;
    totalIbsCbsShare = pisShare + cofinsShare + icmsShare;
    retainedInDasShare = (pb.irpj || 0.055) + (pb.csll || 0.035) + (pb.cpp || 0.415);
  } else if (anexo === 'II') {
    // Anexo II (Indústria): Expurgar PIS + COFINS (CBS) + ICMS (IBS) + IPI
    const pisShare = pb.pis || 0.0249;
    const cofinsShare = pb.cofins || 0.1151;
    const icmsShare = pb.icms || 0.32;
    totalIbsCbsShare = pisShare + cofinsShare + icmsShare;
    retainedInDasShare = (pb.irpj || 0.055) + (pb.csll || 0.035) + (pb.cpp || 0.375);
  } else if (anexo === 'III') {
    // Anexo III (Serviços Gerais): Expurgar PIS + COFINS (CBS) + ISS (IBS)
    const pisShare = pb.pis || 0.0278;
    const cofinsShare = pb.cofins || 0.1282;
    const issShare = pb.iss || 0.335;
    totalIbsCbsShare = pisShare + cofinsShare + issShare;
    retainedInDasShare = (pb.irpj || 0.04) + (pb.csll || 0.035) + (pb.cpp || 0.434);
  } else if (anexo === 'IV') {
    // Anexo IV (Serviços Específicos - Sem CPP no DAS): Expurgar PIS + COFINS (CBS) + ISS (IBS)
    // CPP é 0 dentro do DAS. IBS/CBS representa mais de 60% da guia!
    const pisShare = pb.pis || 0.0383;
    const cofinsShare = pb.cofins || 0.1767;
    const issShare = pb.iss || 0.445;
    totalIbsCbsShare = pisShare + cofinsShare + issShare;
    retainedInDasShare = (pb.irpj || 0.188) + (pb.csll || 0.152);
  } else if (anexo === 'V') {
    // Anexo V (Serviços Tecnológicos): Expurgar PIS + COFINS (CBS) + ISS (IBS)
    const pisShare = pb.pis || 0.0305;
    const cofinsShare = pb.cofins || 0.141;
    const issShare = pb.iss || 0.14;
    totalIbsCbsShare = pisShare + cofinsShare + issShare;
    retainedInDasShare = (pb.irpj || 0.25) + (pb.csll || 0.15) + (pb.cpp || 0.2885);
  }

  return {
    irpj: pb.irpj || 0,
    csll: pb.csll || 0,
    pis: pb.pis || 0,
    cofins: pb.cofins || 0,
    cpp: pb.cpp || 0,
    icms: pb.icms || 0,
    iss: pb.iss || 0,
    totalIbsCbsShare,
    retainedInDasShare,
  };
}

/**
 * MOTOR DE CÁLCULO DEFINITIVO: SIMPLES NORMAL X SIMPLES HÍBRIDO (TODOS OS 5 ANEXOS)
 */
export function calculateSimplesHibridoComparison(params: SimplesHibridoInput): SimplesHibridoResult {
  const {
    company,
    anexoSelected,
    targetIvaRate = 26.5,
    simplesSupplierPercent = 40,
    generalSupplierPercent = 60,
    b2bSalesPercent = 50,
  } = params;

  const rbt12 = Math.max(0, params.rbt12 ?? company.rbt12 ?? (params.monthlyRevenue * 12));
  const monthlyRevenue = Math.max(0, params.monthlyRevenue ?? company.monthlyRevenue ?? (rbt12 / 12));
  const payroll12m = Math.max(0, params.payroll12m ?? company.payroll12m ?? 0);
  const monthlyPayroll = Math.max(0, params.monthlyPayroll ?? company.monthlyPayroll ?? (payroll12m / 12));

  // ==========================================
  // [TRAVA 01 - SUBLIMITE ESTADUAL]
  // ==========================================
  const isSublimitExceeded = rbt12 > STATE_SUBLIMIT;
  const sublimitExcessAmount = Math.max(0, rbt12 - STATE_SUBLIMIT);
  const trava01Sublimite = {
    isExceeded: isSublimitExceeded,
    sublimitLimit: STATE_SUBLIMIT,
    excessAmount: sublimitExcessAmount,
    blockedTraditional: isSublimitExceeded,
    warningMessage: isSublimitExceeded
      ? `O sublimite estadual (R$ 3.600.000,00) foi ultrapassado em R$ ${(sublimitExcessAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. O recolhimento de IBS/CBS fora do DAS é obrigatório nos termos do Art. 19 e 20 da LC 123/2006 c/c EC 132/2023.`
      : 'Dentro do sublimite estadual de R$ 3.600.000,00. A opção entre Simples Tradicional e Híbrido é facultativa.',
  };

  // ==========================================
  // [TRAVA 02 - MOTOR DO FATOR R (ANEXOS III E V)]
  // ==========================================
  const isFatorRSubject = anexoSelected === 'III' || anexoSelected === 'V' || params.subjectToFatorR || company.subjectToFatorR;
  const fatorRRatio = rbt12 > 0 ? payroll12m / rbt12 : 0;
  const fatorRPercent = fatorRRatio * 100;
  let simulatedAnexo: SimplesAnexo = anexoSelected;
  let fatorRActive = false;

  if (isFatorRSubject && (anexoSelected === 'III' || anexoSelected === 'V')) {
    if (fatorRRatio >= FATOR_R_THRESHOLD) {
      simulatedAnexo = 'III';
      fatorRActive = true;
    } else {
      simulatedAnexo = 'V';
      fatorRActive = false;
    }
  }

  const targetPayroll28 = rbt12 * FATOR_R_THRESHOLD;
  const payrollNeededForAnexoIII = Math.max(0, targetPayroll28 - payroll12m);
  const trava02FatorR = {
    isApplicable: !!isFatorRSubject,
    fatorR: fatorRPercent,
    fatorRRatio,
    simulatedAnexo,
    fatorRActive,
    payrollNeededForAnexoIII,
    diagnosisText: isFatorRSubject
      ? (fatorRRatio >= FATOR_R_THRESHOLD
          ? `Fator R de ${fatorRPercent.toFixed(2)}% (>= 28,00%). Enquadramento confirmado no ANEXO III (alíquota favorecida).`
          : `Fator R de ${fatorRPercent.toFixed(2)}% (< 28,00%). Enquadramento forçado no ANEXO V (alíquota majorada). Aporte necessário de R$ ${(payrollNeededForAnexoIII).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} na folha/pró-labore para atingir o Anexo III.`)
      : `Atividade não sujeita à trava do Fator R (Anexo ${simulatedAnexo} direto).`,
  };

  const activeAnexo = simulatedAnexo;

  // ==========================================
  // CÁLCULO DA ALÍQUOTA EFETIVA PADRÃO DO DAS
  // Formula: ((RBT12 * Aliquota Nominal) - Parcela a Deduzir) / RBT12
  // ==========================================
  const anexoCalc = calculateAnexoEffectiveRate(activeAnexo, rbt12);
  const nominalRate = anexoCalc.nominalRate * 100;
  const deduction = anexoCalc.deduction;
  const standardEffectiveRate = anexoCalc.effectiveRate * 100;

  // Repartição Oficial de Tributos
  const partition = getAnexoPartition(activeAnexo, rbt12);

  // ==========================================
  // [TRAVA 03 - LIMITAÇÃO DE CRÉDITO DE ENTRADA]
  // ==========================================
  const totalInputPurchases = Math.max(
    0,
    params.inputCostsMonthly ?? (company.inputCostsMonthly || (monthlyRevenue * ((company.inputCostsPercent ?? 40) / 100)))
  );

  const normSupplierSimples = simplesSupplierPercent / 100;
  const normSupplierGeneral = generalSupplierPercent / 100;
  const simplesSupplierPurchases = totalInputPurchases * normSupplierSimples;
  const generalSupplierPurchases = totalInputPurchases * normSupplierGeneral;

  // Fornecedor Simples repassa alíquota subdimensionada contida no DAS
  // Fornecedor Geral/Híbrido repassa 26,5% integral
  const simplesSupplierCreditRate = (standardEffectiveRate * partition.totalIbsCbsShare); // % contido no DAS
  const generalSupplierCreditRate = targetIvaRate; // ex: 26.5%

  const simplesSupplierCreditAmount = simplesSupplierPurchases * (simplesSupplierCreditRate / 100);
  const generalSupplierCreditAmount = generalSupplierPurchases * (generalSupplierCreditRate / 100);
  const totalIbsCbsInputCreditMonthly = simplesSupplierCreditAmount + generalSupplierCreditAmount;
  const totalIbsCbsInputCreditAnnual = totalIbsCbsInputCreditMonthly * 12;
  const effectiveInputCreditRatePercent = totalInputPurchases > 0 
    ? (totalIbsCbsInputCreditMonthly / totalInputPurchases) * 100 
    : 0;

  const trava03CreditoEntrada = {
    totalInputPurchases,
    simplesSupplierPurchases,
    generalSupplierPurchases,
    simplesSupplierCreditRate,
    generalSupplierCreditRate,
    simplesSupplierCreditAmount,
    generalSupplierCreditAmount,
    totalIbsCbsInputCreditMonthly,
    totalIbsCbsInputCreditAnnual,
    effectiveInputCreditRatePercent,
  };

  // ==========================================
  // 1. APURAÇÃO DO DAS REDUZIDO (MODELO HÍBRIDO)
  // Subtrai-se a fatia de IBS/CBS contida no DAS
  // ==========================================
  // Alíquota reduzida = Alíquota Efetiva Padrão * (Percentual retido de IRPJ + CSLL + CPP)
  const reducedDasRate = standardEffectiveRate * partition.retainedInDasShare;
  const reducedDasMonthly = monthlyRevenue * (reducedDasRate / 100);
  const reducedDasAnnual = reducedDasMonthly * 12;

  // ==========================================
  // ANEXO IV - CPP PATRONAL POR FORA (DCTFWeb)
  // ==========================================
  let anexoIV_CPP_Monthly = 0;
  if (activeAnexo === 'IV') {
    const ratRate = (params.ratRatePercent ?? company.ratRatePercent ?? 3.0) / 100;
    const empPayroll = params.hasEmployeesPayroll ?? company.hasEmployeesPayroll ?? true
      ? (params.employeesPayrollMonthly ?? company.employeesPayrollMonthly ?? monthlyPayroll)
      : 0;
    const proLabore = params.hasProLabore ?? company.hasProLabore ?? false
      ? (params.proLaboreMonthly ?? company.proLaboreMonthly ?? 0)
      : 0;
    
    // 20% Patronal + RAT sobre CLT; 20% sobre pró-labore
    anexoIV_CPP_Monthly = (empPayroll * (0.20 + ratRate)) + (proLabore * 0.20);
  }
  const anexoIV_CPP_Annual = anexoIV_CPP_Monthly * 12;

  // ==========================================
  // CENÁRIO A: APENAS PARTE FINANCEIRA (FLUXO DE CAIXA INTERNO)
  // ==========================================
  // Custo Tradicional: Guia Única do DAS (+ CPP no Anexo IV)
  const tradicionalDasAmount = monthlyRevenue * (standardEffectiveRate / 100);
  const tradicionalMonthlyTax = tradicionalDasAmount + anexoIV_CPP_Monthly;
  const tradicionalAnnualTax = tradicionalMonthlyTax * 12;
  const tradicionalEffectiveRate = monthlyRevenue > 0 ? (tradicionalMonthlyTax / monthlyRevenue) * 100 : 0;

  // Custo Híbrido: DAS Reduzido + [IBS/CBS sobre Vendas (26,5%)] - [Créditos sobre Insumos] (+ CPP Anexo IV)
  const hibridoGrossIbsCbsDebitoMonthly = monthlyRevenue * (targetIvaRate / 100);
  const hibridoIbsCbsCreditoMonthly = totalIbsCbsInputCreditMonthly;
  const hibridoNetIbsCbsPayableMonthly = Math.max(0, hibridoGrossIbsCbsDebitoMonthly - hibridoIbsCbsCreditoMonthly);
  const hibridoTotalMonthlyTax = reducedDasMonthly + hibridoNetIbsCbsPayableMonthly + anexoIV_CPP_Monthly;
  const hibridoTotalAnnualTax = hibridoTotalMonthlyTax * 12;
  const hibridoEffectiveRate = monthlyRevenue > 0 ? (hibridoTotalMonthlyTax / monthlyRevenue) * 100 : 0;

  const monthlyDelta = Math.abs(tradicionalMonthlyTax - hibridoTotalMonthlyTax);
  const annualDelta = monthlyDelta * 12;
  let cheaperRegime: 'tradicional' | 'hibrido' | 'equivalente' = 'equivalente';
  if (tradicionalMonthlyTax < hibridoTotalMonthlyTax) {
    cheaperRegime = 'tradicional';
  } else if (hibridoTotalMonthlyTax < tradicionalMonthlyTax) {
    cheaperRegime = 'hibrido';
  }

  const savingsExplanation = cheaperRegime === 'tradicional'
    ? `O Simples Tradicional gera menor desembolso de caixa imediato: economia direta de R$ ${monthlyDelta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês (R$ ${annualDelta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/ano).`
    : cheaperRegime === 'hibrido'
    ? `O Simples Híbrido apresenta menor carga tributária direta devido ao alto volume de créditos sobre insumos/compras: economia de R$ ${monthlyDelta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês.`
    : 'Ambos os regimes apresentam empate financeiro exato de desembolso.';

  const cashflowSummary = `DAS Tradicional Integral: R$ ${tradicionalMonthlyTax.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês (${tradicionalEffectiveRate.toFixed(2)}%) vs DAS Híbrido Combinado: R$ ${hibridoTotalMonthlyTax.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês (${hibridoEffectiveRate.toFixed(2)}%).`;

  const cenarioA_Financeiro = {
    tradicionalMonthlyTax,
    tradicionalAnnualTax,
    tradicionalEffectiveRate,
    tradicionalDasAmount,
    tradicionalCppAmount: anexoIV_CPP_Monthly,
    hibridoGrossIbsCbsDebitoMonthly,
    hibridoIbsCbsCreditoMonthly,
    hibridoNetIbsCbsPayableMonthly,
    hibridoTotalMonthlyTax,
    hibridoTotalAnnualTax,
    hibridoEffectiveRate,
    monthlyDelta,
    annualDelta,
    cheaperRegime,
    savingsExplanation,
    cashflowSummary,
  };

  // ==========================================
  // CENÁRIO B: CENÁRIO COMPLETO (VISÃO COMERCIAL E MERCADO B2B vs B2C)
  // ==========================================
  const b2cSalesPercent = Math.max(0, 100 - b2bSalesPercent);
  const b2bRevenueMonthly = monthlyRevenue * (b2bSalesPercent / 100);
  const b2bRevenueAnnual = b2bRevenueMonthly * 12;
  const b2cRevenueMonthly = monthlyRevenue * (b2cSalesPercent / 100);
  const b2cRevenueAnnual = b2cRevenueMonthly * 12;

  // No Simples Tradicional: Comprador B2B credita apenas fatia contida no DAS
  const tradicionalB2bCreditRate = standardEffectiveRate * partition.totalIbsCbsShare;
  const tradicionalB2bCreditMonthly = b2bRevenueMonthly * (tradicionalB2bCreditRate / 100);
  const tradicionalB2bNetCostToBuyer = b2bRevenueMonthly - tradicionalB2bCreditMonthly;
  const tradicionalB2bEffectiveNetCostPercent = b2bRevenueMonthly > 0 ? (tradicionalB2bNetCostToBuyer / b2bRevenueMonthly) * 100 : 100;

  // No Simples Híbrido: Comprador B2B credita 26,5% integral
  const hibridoB2bCreditRate = targetIvaRate;
  const hibridoB2bCreditMonthly = b2bRevenueMonthly * (hibridoB2bCreditRate / 100);
  const hibridoB2bNetCostToBuyer = b2bRevenueMonthly - hibridoB2bCreditMonthly;
  const hibridoB2bEffectiveNetCostPercent = b2bRevenueMonthly > 0 ? (hibridoB2bNetCostToBuyer / b2bRevenueMonthly) * 100 : 100;

  // Vantagem Comercial pro Cliente Comprador B2B
  const buyerSavingsMonthlyInHibrido = Math.max(0, hibridoB2bCreditMonthly - tradicionalB2bCreditMonthly);
  const buyerSavingsAnnualInHibrido = buyerSavingsMonthlyInHibrido * 12;
  const buyerPriceAdvantagePercent = b2bRevenueMonthly > 0 ? (buyerSavingsMonthlyInHibrido / b2bRevenueMonthly) * 100 : 0;

  let commercialCompetitivenessLevel: 'baixa' | 'moderada' | 'alta' | 'critica_positiva' = 'baixa';
  if (b2bSalesPercent >= 60) commercialCompetitivenessLevel = 'critica_positiva';
  else if (b2bSalesPercent >= 40) commercialCompetitivenessLevel = 'alta';
  else if (b2bSalesPercent >= 20) commercialCompetitivenessLevel = 'moderada';

  // Análise de Risco B2C e Falta de Repasse de Preço
  // Se o Híbrido é mais caro internamente, o imposto sobre a fatia B2C não tem repasse de crédito nenhum
  const internalMonthlyTaxGap = Math.max(0, hibridoTotalMonthlyTax - tradicionalMonthlyTax);
  const b2cTaxCostDifferenceMonthly = internalMonthlyTaxGap * (b2cSalesPercent / 100);
  const b2cTaxCostDifferenceAnnual = b2cTaxCostDifferenceMonthly * 12;

  let nonPassThroughRiskLevel: 'baixo' | 'moderado' | 'alto' | 'critico' = 'baixo';
  if (cheaperRegime === 'tradicional' && b2cSalesPercent >= 70 && internalMonthlyTaxGap > 0) {
    nonPassThroughRiskLevel = 'critico';
  } else if (cheaperRegime === 'tradicional' && b2cSalesPercent >= 40 && internalMonthlyTaxGap > 0) {
    nonPassThroughRiskLevel = 'alto';
  } else if (cheaperRegime === 'tradicional' && b2cSalesPercent >= 20 && internalMonthlyTaxGap > 0) {
    nonPassThroughRiskLevel = 'moderado';
  }

  const nonPassThroughRiskExplanation = nonPassThroughRiskLevel === 'critico' || nonPassThroughRiskLevel === 'alto'
    ? `ATENÇÃO: Como ${b2cSalesPercent.toFixed(0)}% das suas vendas são B2C (Consumidor Final / PF), seus clientes NÃO se creditam de IBS/CBS. Caso adote o Simples Híbrido, sua empresa absorverá um prejuízo de R$ ${b2cTaxCostDifferenceMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês (R$ ${b2cTaxCostDifferenceAnnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/ano) na margem operacional, sem nenhum ganho de atratividade comercial nesse segmento!`
    : nonPassThroughRiskLevel === 'moderado'
    ? `Risco Moderado: Há uma fatia de ${b2cSalesPercent.toFixed(0)}% B2C onde o cliente não aproveita créditos, custando R$ ${b2cTaxCostDifferenceMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês adicionais no modelo Híbrido.`
    : `Baixo Risco de Repasse: A carteira é predominantemente B2B (${b2bSalesPercent.toFixed(0)}%), permitindo que a quase totalidade dos clientes monetize os créditos integrais de IBS/CBS.`;

  const commercialSummary = b2bSalesPercent > 0
    ? `Para clientes B2B (PJ), comprar da sua empresa no Simples Híbrido gera uma economia líquida de crédito de R$ ${buyerSavingsMonthlyInHibrido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês (R$ ${buyerSavingsAnnualInHibrido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/ano), tornando seu preço ${buyerPriceAdvantagePercent.toFixed(2)}% mais competitivo perante grandes compradores.`
    : 'Empresa com foco 100% no varejo/consumidor final (B2C) — a transferência de créditos tributários não impacta a decisão comercial dos compradores.';

  const cenarioB_Comercial = {
    b2bSalesPercent,
    b2cSalesPercent,
    b2bRevenueMonthly,
    b2bRevenueAnnual,
    b2cRevenueMonthly,
    b2cRevenueAnnual,
    tradicionalB2bCreditRate,
    tradicionalB2bCreditMonthly,
    tradicionalB2bNetCostToBuyer,
    tradicionalB2bEffectiveNetCostPercent,
    hibridoB2bCreditRate,
    hibridoB2bCreditMonthly,
    hibridoB2bNetCostToBuyer,
    hibridoB2bEffectiveNetCostPercent,
    buyerSavingsMonthlyInHibrido,
    buyerSavingsAnnualInHibrido,
    buyerPriceAdvantagePercent,
    commercialCompetitivenessLevel,
    commercialSummary,
    b2cTaxCostDifferenceMonthly,
    b2cTaxCostDifferenceAnnual,
    nonPassThroughRiskLevel,
    nonPassThroughRiskExplanation,
  };

  // ==========================================
  // DIAGNÓSTICO PROFUNDO DE SENSIBILIDADE (BREAK-EVEN & VALOR AGREGADO)
  // ==========================================
  // 1. Cenário Zero Insumos (Sem Compras / Serviços Tomados)
  const noInputGrossIbsCbs = monthlyRevenue * (targetIvaRate / 100);
  const noInputHibridoTax = reducedDasMonthly + noInputGrossIbsCbs + anexoIV_CPP_Monthly;
  const noInputPurchasesTaxDifferenceMonthly = Math.max(0, noInputHibridoTax - tradicionalMonthlyTax);
  const noInputPurchasesEffectiveRate = monthlyRevenue > 0 ? (noInputHibridoTax / monthlyRevenue) * 100 : 0;

  // 2. Break-Even de Compras / Insumos
  // Alíquota média ponderada de crédito das compras
  const avgCreditFactor = ((normSupplierSimples * simplesSupplierCreditRate) + (normSupplierGeneral * generalSupplierCreditRate)) / 100;
  // Custo bruto a neutralizar = (DAS Reduzido + IBS/CBS Bruto) - DAS Tradicional
  const grossDifferenceToNeutralize = (reducedDasMonthly + noInputGrossIbsCbs) - tradicionalDasAmount;
  const inputBreakEvenMonthly = avgCreditFactor > 0 ? Math.max(0, grossDifferenceToNeutralize / avgCreditFactor) : 0;
  const inputBreakEvenPercent = monthlyRevenue > 0 ? (inputBreakEvenMonthly / monthlyRevenue) * 100 : 0;
  const currentInputPercent = monthlyRevenue > 0 ? (totalInputPurchases / monthlyRevenue) * 100 : 0;
  const isInputBelowBreakEven = currentInputPercent < inputBreakEvenPercent;
  const inputGapPercent = Math.max(0, inputBreakEvenPercent - currentInputPercent);

  let inputDiagnosticWarning = '';
  if (currentInputPercent === 0 || totalInputPurchases === 0) {
    inputDiagnosticWarning = `🔴 EMPRESA SEM INSUMOS / COMPRAS COM CRÉDITO: Por não possuir compras de mercadorias ou serviços tomados de terceiros, o Simples Híbrido gerará um aumento imediato de imposto de R$ ${noInputPurchasesTaxDifferenceMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês (alíquota sobe de ${tradicionalEffectiveRate.toFixed(2)}% para ${noInputPurchasesEffectiveRate.toFixed(2)}%).`;
  } else if (isInputBelowBreakEven) {
    inputDiagnosticWarning = `⚠️ VOLUME DE COMPRAS ABAIXO DO PONTO DE EQUILÍBRIO: Suas compras atuais representam ${currentInputPercent.toFixed(1)}% do faturamento, mas você precisa de no mínimo ${inputBreakEvenPercent.toFixed(1)}% em insumos creditáveis para que o Simples Híbrido não encareça seu caixa interno (déficit de ${inputGapPercent.toFixed(1)} pontos percentuais em compras).`;
  } else {
    inputDiagnosticWarning = `✅ VOLUME DE COMPRAS SUFICIENTE: Suas compras (${currentInputPercent.toFixed(1)}%) superam o ponto de equilíbrio (${inputBreakEvenPercent.toFixed(1)}%), gerando créditos tributários de IBS/CBS suficientes para baratear a apuração líquida.`;
  }

  // 3. Break-Even de Vendas B2B
  const b2bUnitAdvantageRate = (hibridoB2bCreditRate - tradicionalB2bCreditRate) / 100;
  const b2bBreakEvenPercent = (b2bUnitAdvantageRate > 0 && internalMonthlyTaxGap > 0 && monthlyRevenue > 0)
    ? Math.min(100, (internalMonthlyTaxGap / (monthlyRevenue * b2bUnitAdvantageRate)) * 100)
    : 0;
  const isB2bAboveBreakEven = b2bSalesPercent >= b2bBreakEvenPercent;

  let b2bDiagnosticWarning = '';
  if (b2bSalesPercent === 0) {
    b2bDiagnosticWarning = 'Foco 100% no Consumidor Final (B2C): O Simples Híbrido não traz nenhuma vantagem comercial e só aumentará o custo fiscal da operação.';
  } else if (isB2bAboveBreakEven) {
    b2bDiagnosticWarning = `A carteira B2B (${b2bSalesPercent.toFixed(0)}%) está acima do ponto de equilíbrio (${b2bBreakEvenPercent.toFixed(0)}%): o ganho de crédito transferido aos seus clientes PJ compensa financeiramente o esforço tributário interno.`;
  } else {
    b2bDiagnosticWarning = `A carteira B2B (${b2bSalesPercent.toFixed(0)}%) está abaixo do ponto de equilíbrio (${b2bBreakEvenPercent.toFixed(0)}%): o ganho de crédito aos clientes PJ ainda não compensa a perda de caixa interno gerada pelo Híbrido.`;
  }

  // 4. Efeito da Folha de Pagamento (que NÃO gera crédito de IBS/CBS)
  const payrollWeightOnRevenuePercent = monthlyRevenue > 0 ? (monthlyPayroll / monthlyRevenue) * 100 : 0;
  const payrollExclusionWarning = payrollWeightOnRevenuePercent >= 25
    ? `A folha de pagamento e encargos representam ${payrollWeightOnRevenuePercent.toFixed(1)}% da sua receita. Pela legislação da Reforma Tributária (EC 132/23), salários e pró-labore NÃO geram créditos de IBS/CBS, o que reduz a capacidade de abatimento no Simples Híbrido em comparação com empresas intensivas em insumos materiais.`
    : `Folha de pagamento representa ${payrollWeightOnRevenuePercent.toFixed(1)}% da receita. Despesas com pessoal não geram crédito de IBS/CBS.`;

  const sensitivityAndBreakEven = {
    inputBreakEvenPercent,
    inputBreakEvenMonthly,
    currentInputPercent,
    isInputBelowBreakEven,
    inputGapPercent,
    noInputPurchasesTaxDifferenceMonthly,
    noInputPurchasesEffectiveRate,
    inputDiagnosticWarning,
    b2bBreakEvenPercent,
    isB2bAboveBreakEven,
    b2bDiagnosticWarning,
    payrollWeightOnRevenuePercent,
    payrollExclusionWarning,
  };

  // ==========================================
  // MOTOR DE GERAÇÃO AUTOMATIZADA DO PARECER TÉCNICO OFICIAL
  // ==========================================
  let recommendedRegime: 'SIMPLES TRADICIONAL' | 'SIMPLES HÍBRIDO' = 'SIMPLES TRADICIONAL';
  let commercialJustification = '';
  let riskNote = '';

  if (isSublimitExceeded) {
    recommendedRegime = 'SIMPLES HÍBRIDO';
    commercialJustification = 'Adoção compulsória do modelo híbrido em virtude da superação do sublimite estadual de R$ 3.600.000,00, com transferência plena de créditos e cumprimento do regime não-cumulativo de IBS/CBS.';
  } else if (cheaperRegime === 'hibrido') {
    recommendedRegime = 'SIMPLES HÍBRIDO';
    commercialJustification = `O alto volume de insumos e compras creditáveis (${currentInputPercent.toFixed(1)}%) supera o ponto de equilíbrio (${inputBreakEvenPercent.toFixed(1)}%), tornando o Simples Híbrido mais econômico tanto no caixa interno quanto na atratividade comercial B2B.`;
  } else if (b2bSalesPercent >= b2bBreakEvenPercent && b2bSalesPercent >= 45 && buyerSavingsAnnualInHibrido > annualDelta * 0.7) {
    recommendedRegime = 'SIMPLES HÍBRIDO';
    commercialJustification = `A preservação das relações comerciais e a manutenção da empresa na cadeia de suprimentos B2B (${b2bSalesPercent.toFixed(0)}% da carteira) superam o custo fiscal incremental do caixa, gerando R$ ${buyerSavingsAnnualInHibrido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/ano em créditos líquidos para seus clientes corporativos.`;
  } else {
    recommendedRegime = 'SIMPLES TRADICIONAL';
    if (b2cSalesPercent >= 60) {
      commercialJustification = `Dado o perfil preponderantemente B2C / Consumidor Final (${b2cSalesPercent.toFixed(0)}% das vendas), os clientes não aproveitam créditos tributários. Como as compras (${currentInputPercent.toFixed(1)}%) estão abaixo do ponto de equilíbrio (${inputBreakEvenPercent.toFixed(1)}%), o Simples Tradicional é a única escolha segura para evitar encarecimento fiscal de R$ ${monthlyDelta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês.`;
    } else {
      commercialJustification = `O baixo volume de créditos de entrada (${currentInputPercent.toFixed(1)}% vs ${inputBreakEvenPercent.toFixed(1)}% de break-even) e a representatividade de vendas B2C tornam o Simples Tradicional a escolha soberana de preservação de margem de caixa (economia de R$ ${monthlyDelta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês).`;
    }
  }

  riskNote = 'A opção pelo Simples Híbrido exige escrituração no SPED, gestão rigorosa de notas fiscais de entrada (NCM/NBS) para apropriação de créditos de IBS/CBS, parametrização do split payment bancário e monitoramento da proporção B2B/B2C, sob pena de elevação de custos sem contrapartida comercial.';

  const rbt12Str = `R$ ${rbt12.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  const tradCostStr = `R$ ${tradicionalMonthlyTax.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  const hibCostStr = `R$ ${hibridoTotalMonthlyTax.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  const advantageStr = `R$ ${monthlyDelta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  const chosenFinancialText = cheaperRegime === 'tradicional' ? 'Simples Tradicional' : 'Simples Híbrido';

  const section1Text = `Após a consolidação dos dados de faturamento (RBT12 de ${rbt12Str}), folha de pagamento e compras de insumos, identificou-se que o modelo ${chosenFinancialText} confere a menor carga tributária direta para a empresa.\n\n* O custo mensal estimado sob o regime Tradicional é de ${tradCostStr} (${tradicionalEffectiveRate.toFixed(2)}%).\n* O custo mensal sob o regime Híbrido (DAS Reduzido + IBS/CBS apurados individualmente) é de ${hibCostStr} (${hibridoEffectiveRate.toFixed(2)}%).\n* Resultado Econômico Direto: Vantagem financeira interna de ${advantageStr} a favor do modelo ${chosenFinancialText}.\n* Diagnóstico de Insumos: ${inputDiagnosticWarning}`;

  const section2TradText = `Seus clientes B2B (${b2bSalesPercent.toFixed(0)}% da carteira) receberão um crédito de apenas ${tradicionalB2bCreditRate.toFixed(2)}% de IBS/CBS, o que pode gerar perda de competitividade frente a concorrentes do Lucro Real/Híbrido. Por outro lado, para os clientes B2C (${b2cSalesPercent.toFixed(0)}%), o Simples Tradicional protege 100% da sua margem de preço.`;
  const section2HibText = `Sua empresa transferirá crédito integral (${targetIvaRate.toFixed(2)}%) aos clientes B2B (gerando R$ ${buyerSavingsMonthlyInHibrido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês em economia tributária para eles). Contudo, nas vendas B2C (${b2cSalesPercent.toFixed(0)}%), ${nonPassThroughRiskExplanation}`;

  const rawMarkdown = `### 📋 PARECER TÉCNICO DE VIABILIDADE TRIBUTÁRIA
**Fundamentação:** Resoluções CGSN e Lei Complementar da Reforma Tributária vigente (EC nº 132/2023, LC nº 123/2006 e LC nº 214/2025).

#### 1. Diagnóstico do Cenário Financeiro & Valor Agregado (Fluxo de Caixa)
Após a consolidação dos dados de faturamento (RBT12 de ${rbt12Str}), folha de pagamento e compras de insumos, identificou-se que o modelo **${chosenFinancialText}** confere a menor carga tributária direta para a empresa.

* O custo mensal estimado sob o regime Tradicional é de **${tradCostStr}** (${tradicionalEffectiveRate.toFixed(2)}%).
* O custo mensal sob o regime Híbrido (DAS Reduzido + IBS/CBS apurados individualmente) é de **${hibCostStr}** (${hibridoEffectiveRate.toFixed(2)}%).
* **Resultado Econômico Direto:** Vantagem financeira interna de **${advantageStr}** a favor do modelo **${chosenFinancialText}**.
* **Ponto de Equilíbrio de Compras:** Nível atual de insumos em **${currentInputPercent.toFixed(1)}%** vs. Break-Even exigido de **${inputBreakEvenPercent.toFixed(1)}%**. ${inputDiagnosticWarning}
* **Impacto da Folha de Pagamento:** ${payrollExclusionWarning}

#### 2. Diagnóstico do Cenário Comercial & Perfil de Clientes (B2B vs. B2C)
A carteira da empresa é composta por **${b2bSalesPercent.toFixed(1)}% clientes B2B (PJ)** e **${b2cSalesPercent.toFixed(1)}% clientes B2C (Consumidor Final)**.

* **Caso opte pelo Simples Tradicional:** ${section2TradText}
* **Caso opte pelo Simples Híbrido:** ${section2HibText}
* **Análise de Risco de Não-Repasse de Créditos:** ${nonPassThroughRiskExplanation}

#### 3. Recomendação e Veredito Final do Sistema
Diante do cruzamento de margens, o sistema recomenda a adoção do **${recommendedRegime}**.

* **Justificativa Comercial:** ${commercialJustification}
* **Nota de Risco Operacional:** ${riskNote}`;

  const technicalOpinion = {
    title: 'Parecer Técnico de Viabilidade Tributária - Simples Tradicional vs Simples Híbrido',
    legalBasis: 'Resoluções CGSN, LC 123/2006, EC 132/2023 e Regulamentação da Reforma Tributária (LC 214/2025)',
    section1_FinancialDiagnostic: {
      rbt12Formatted: rbt12Str,
      chosenRegime: chosenFinancialText,
      tradicionalCostMonthlyFormatted: tradCostStr,
      hibridoCostMonthlyFormatted: hibCostStr,
      economicAdvantageFormatted: advantageStr,
      advantageDirection: chosenFinancialText,
      text: section1Text,
    },
    section2_MarketDiagnostic: {
      b2bPercentFormatted: `${b2bSalesPercent.toFixed(1)}%`,
      tradicionalCreditRateFormatted: `${tradicionalB2bCreditRate.toFixed(2)}%`,
      hibridoCreditRateFormatted: `${targetIvaRate.toFixed(2)}%`,
      textTradicional: section2TradText,
      textHibrido: section2HibText,
    },
    section3_RecommendationVerdict: {
      recommendedRegime,
      verdictShort: `Recomendado: ${recommendedRegime}`,
      commercialJustification,
      riskNote,
    },
    rawFormattedMarkdown: rawMarkdown,
  };

  return {
    rbt12,
    monthlyRevenue,
    effectiveAnexo: activeAnexo,
    nominalRate,
    deduction,
    standardEffectiveRate,
    trava01Sublimite,
    trava02FatorR,
    trava03CreditoEntrada,
    partition,
    reducedDasRate,
    reducedDasMonthly,
    reducedDasAnnual,
    anexoIV_CPP_Monthly,
    anexoIV_CPP_Annual,
    cenarioA_Financeiro,
    cenarioB_Comercial,
    sensitivityAndBreakEven,
    technicalOpinion,
  };
}
