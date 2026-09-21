import { PlanAllowedModules, PlanPeriodicity, SoldSubscription } from '../types';

export interface ModularItemPricing {
  id: keyof PlanAllowedModules | 'core_platform';
  label: string;
  description: string;
  category: 'core' | 'tributario' | 'gestao' | 'ia_avancada';
  monthlyPrice: number;
}

export const MODULAR_PRICING_CATALOG: ModularItemPricing[] = [
  {
    id: 'core_platform',
    label: 'Núcleo Base da Plataforma',
    description: 'Diagnóstico Executivo, Simples Nacional (Anexos I a V), Gestão Básica e 1 CNPJ + 1 Usuário',
    category: 'core',
    monthlyPrice: 99.00,
  },
  {
    id: 'ai_auditor',
    label: 'Auditor Fiscal com IA Gemini',
    description: 'Auditoria pericial automatizada, detecção de riscos fiscais e pareceres inteligentes 24/7',
    category: 'ia_avancada',
    monthlyPrice: 80.00,
  },
  {
    id: 'reforma',
    label: 'Simulador Reforma Tributária (EC 132/23)',
    description: 'Projeção de IBS, CBS, Split Payment, transição 2026/2033 e impacto na competitividade B2B',
    category: 'tributario',
    monthlyPrice: 60.00,
  },
  {
    id: 'simples_hibrido',
    label: 'Simples Híbrido (EC 132/23)',
    description: 'Simulador do Simples Nacional Híbrido com recolhimento de IBS/CBS fora do DAS (Opção do Art. 146-A)',
    category: 'tributario',
    monthlyPrice: 60.00,
  },
  {
    id: 'financeiro',
    label: 'Painel Financeiro & DRE Gerencial',
    description: 'DRE fiscal analítica, margens de lucro líquido, custos operacionais e fluxo de caixa contábil',
    category: 'gestao',
    monthlyPrice: 50.00,
  },
  {
    id: 'cfop',
    label: 'Segregação CFOP & Monofásicos',
    description: 'Desoneração de PIS/COFINS monofásico, ICMS ST e segregação item a item no PGDAS-D',
    category: 'tributario',
    monthlyPrice: 45.00,
  },
  {
    id: 'pgdas_import',
    label: 'Importador PGDAS-D e Extrato e-CAC',
    description: 'Leitura de PDFs oficiais, conciliação e preenchimento automático das receitas segregadas',
    category: 'gestao',
    monthlyPrice: 40.00,
  },
  {
    id: 'fator_r',
    label: 'Calculadora Fator R & Pró-labore',
    description: 'Planejamento de folha de pagamento para enquadramento no Anexo III vs Anexo V (LC 123/06)',
    category: 'tributario',
    monthlyPrice: 35.00,
  },
  {
    id: 'socios',
    label: 'Gestão Societária & Múltiplos Sócios',
    description: 'Monitoramento do teto global de R$ 4,8 milhões para sócios com participação em outras empresas',
    category: 'gestao',
    monthlyPrice: 30.00,
  },
  {
    id: 'projecao',
    label: 'Projeções de Cenários & Crescimento',
    description: 'Simulação de faturamento futuro, impactos de inflação e sublimite estadual de ICMS/ISS',
    category: 'gestao',
    monthlyPrice: 45.00,
  },
  {
    id: 'bpo',
    label: 'BPO Financeiro Integrado',
    description: 'Controle de contas a pagar, receber, conciliação bancária e orçamentos operacionais',
    category: 'gestao',
    monthlyPrice: 45.00,
  },
  {
    id: 'consultas',
    label: 'Consultas NCM & Código de Serviços',
    description: 'Consulta rápida de alíquotas de ICMS, ISS e regras tributárias por NCM e NBS municipal',
    category: 'tributario',
    monthlyPrice: 30.00,
  },
  {
    id: 'emissao_nfse',
    label: 'Módulo de Emissão de NFS-e Nacional (Gov.br)',
    description: 'Emissão oficial de Notas Fiscais de Serviços Eletrônicas para clientes terceiros, controle de tomadores, DANFSE PDF e transmissão síncrona ADN',
    category: 'gestao',
    monthlyPrice: 85.00,
  },
  {
    id: 'societario',
    label: 'Módulo Societário & Gerador de Contratos',
    description: 'Guia de Abertura/Alteração/Encerramento nas 27 Juntas Comerciais (DREI IN 81/20) e Minutas Personalizadas de Contratos e Distratos',
    category: 'gestao',
    monthlyPrice: 65.00,
  },
  {
    id: 'conhecimentos',
    label: 'Módulo de Conhecimentos Técnicos & Práticos',
    description: 'Base de conhecimento normativo oficial dividida por Assuntos (Tributário, Contábil, Fiscal, Societário, Trabalhista, Comex) e Esferas (Federal, Estadual 27 UFs, Municipal, Trabalhista, PF)',
    category: 'tributario',
    monthlyPrice: 45.00,
  },
  {
    id: 'direito',
    label: 'Módulo de Direito Empresarial & Jurídico Avançado',
    description: 'Doutrina comentada, Pareceres Jurídicos e Jurisprudência em Teses do STF, STJ, CARF e TCs (Tributário, Empresarial, Administrativo, Civil e Penal)',
    category: 'ia_avancada',
    monthlyPrice: 75.00,
  },
];

export const EXTRA_USER_MONTHLY_PRICE = 35.00;
export const EXTRA_COMPANY_MONTHLY_PRICE = 20.00;

export interface CustomPlanCalculationInput {
  usersCount: number; // Mínimo 1
  companiesCount: number; // Mínimo 1
  selectedModules: PlanAllowedModules;
  periodicity: PlanPeriodicity;
  applyPromptPaymentDiscount?: boolean; // 5% pontualidade
  applyAnnualCashDiscount?: boolean; // 15% à vista anual
  startDay?: number; // Dia de início
  preferredDueDay?: number; // 5, 10, 15, 20, 25
}

export interface CustomPlanCalculationResult {
  basePlatformPrice: number;
  usersCount: number;
  extraUsersCount: number;
  extraUsersTotalMonthly: number;
  companiesCount: number;
  extraCompaniesCount: number;
  extraCompaniesTotalMonthly: number;
  modulesSelectedCount: number;
  modulesTotalMonthly: number;
  modulesDetails: Array<{ id: string; label: string; price: number }>;
  
  // Total Mensal Base
  monthlyBaseTotal: number;
  
  // Período e Descontos
  periodicity: PlanPeriodicity;
  monthsInPeriod: number;
  grossPeriodTotal: number;
  fidelityMonths: number;
  
  // Descontos de Ciclo
  periodDiscountPercent: number; // 0% mensal, 5% trimestral, 10% semestral, 15% anual
  periodDiscountAmount: number;
  
  // Descontos Especiais Opcionais
  promptDiscountPercent: number;
  promptDiscountAmount: number;
  annualCashDiscountPercent: number;
  annualCashDiscountAmount: number;
  
  // Valor Final do Ciclo
  finalPricePaid: number;
  effectiveMonthlyCost: number;
  
  // Detalhamento de Pro-rata
  proRata: ProRataCalculation;
}

export interface ProRataCalculation {
  isProRataApplied: boolean;
  daysInMonth: number;
  daysRemainingInFirstCycle: number;
  dailyRate: number;
  proRataAmount: number;
  firstInvoiceDueDate: string;
  firstInvoiceAmount: number;
  explanation: string;
}

/**
 * Calcula a precificação proporcional e customizada sob medida de um plano
 */
export function calculateCustomPlanPricing(input: CustomPlanCalculationInput): CustomPlanCalculationResult {
  const users = Math.max(1, input.usersCount || 1);
  const companies = Math.max(1, input.companiesCount || 1);
  
  // 1. Núcleo base da plataforma (inclui 1 user e 1 company)
  const basePlatformPrice = 99.00;
  
  // 2. Usuários adicionais
  const extraUsersCount = Math.max(0, users - 1);
  const extraUsersTotalMonthly = extraUsersCount * EXTRA_USER_MONTHLY_PRICE;
  
  // 3. Empresas adicionais
  const extraCompaniesCount = Math.max(0, companies - 1);
  const extraCompaniesTotalMonthly = extraCompaniesCount * EXTRA_COMPANY_MONTHLY_PRICE;
  
  // 4. Módulos adicionais ativados
  const modulesDetails: Array<{ id: string; label: string; price: number }> = [];
  let modulesTotalMonthly = 0;
  
  MODULAR_PRICING_CATALOG.forEach(mod => {
    if (mod.id === 'core_platform') return;
    const isModuleActive = Boolean(input.selectedModules[mod.id as keyof PlanAllowedModules]);
    if (isModuleActive) {
      modulesDetails.push({
        id: mod.id,
        label: mod.label,
        price: mod.monthlyPrice,
      });
      modulesTotalMonthly += mod.monthlyPrice;
    }
  });
  
  // Total Mensal Base
  const monthlyBaseTotal = Math.round((basePlatformPrice + extraUsersTotalMonthly + extraCompaniesTotalMonthly + modulesTotalMonthly) * 100) / 100;
  
  // 5. Periodicidade e Fidelidade
  let monthsInPeriod = 1;
  let periodDiscountPercent = 0;
  let fidelityMonths = 1;
  
  switch (input.periodicity) {
    case 'trimestral':
      monthsInPeriod = 3;
      periodDiscountPercent = 5;
      fidelityMonths = 3;
      break;
    case 'semestral':
      monthsInPeriod = 6;
      periodDiscountPercent = 10;
      fidelityMonths = 6;
      break;
    case 'anual':
      monthsInPeriod = 12;
      periodDiscountPercent = 15;
      fidelityMonths = 12;
      break;
    case 'mensal':
    default:
      monthsInPeriod = 1;
      periodDiscountPercent = 0;
      fidelityMonths = 1;
      break;
  }
  
  const grossPeriodTotal = Math.round((monthlyBaseTotal * monthsInPeriod) * 100) / 100;
  const periodDiscountAmount = Math.round((grossPeriodTotal * (periodDiscountPercent / 100)) * 100) / 100;
  let subtotal = grossPeriodTotal - periodDiscountAmount;
  
  // Descontos adicionais opcionais
  let promptDiscountPercent = 0;
  let promptDiscountAmount = 0;
  if (input.applyPromptPaymentDiscount) {
    promptDiscountPercent = 5;
    promptDiscountAmount = Math.round((subtotal * 0.05) * 100) / 100;
    subtotal -= promptDiscountAmount;
  }
  
  let annualCashDiscountPercent = 0;
  let annualCashDiscountAmount = 0;
  if (input.periodicity === 'anual' && input.applyAnnualCashDiscount) {
    annualCashDiscountPercent = 15;
    annualCashDiscountAmount = Math.round((subtotal * 0.15) * 100) / 100;
    subtotal -= annualCashDiscountAmount;
  }
  
  const finalPricePaid = Math.max(1, Math.round(subtotal * 100) / 100);
  const effectiveMonthlyCost = Math.round((finalPricePaid / monthsInPeriod) * 100) / 100;
  
  // 6. Pro-rata para contratação fora do início do mês
  const proRata = calculateProRataSubscription({
    monthlyPrice: monthlyBaseTotal,
    periodicity: input.periodicity,
    finalCyclePrice: finalPricePaid,
    preferredDueDay: input.preferredDueDay || 10,
  });
  
  return {
    basePlatformPrice,
    usersCount: users,
    extraUsersCount,
    extraUsersTotalMonthly,
    companiesCount: companies,
    extraCompaniesCount,
    extraCompaniesTotalMonthly,
    modulesSelectedCount: modulesDetails.length,
    modulesTotalMonthly,
    modulesDetails,
    monthlyBaseTotal,
    periodicity: input.periodicity,
    monthsInPeriod,
    grossPeriodTotal,
    fidelityMonths,
    periodDiscountPercent,
    periodDiscountAmount,
    promptDiscountPercent,
    promptDiscountAmount,
    annualCashDiscountPercent,
    annualCashDiscountAmount,
    finalPricePaid,
    effectiveMonthlyCost,
    proRata,
  };
}

export interface ProRataInput {
  monthlyPrice: number;
  periodicity: PlanPeriodicity;
  finalCyclePrice: number;
  startDate?: string | Date;
  preferredDueDay: number; // 5, 10, 15, 20, 25
}

/**
 * Calcula o Pro-rata exato de contratação com base na data atual e dia de vencimento escolhido
 */
export function calculateProRataSubscription(params: ProRataInput): ProRataCalculation {
  const now = params.startDate ? new Date(params.startDate) : new Date();
  const currentDay = now.getDate();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-11
  
  // Quantidade de dias no mês atual
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  const preferredDueDay = params.preferredDueDay || 10;
  
  // Determina a primeira data de vencimento
  let firstDueDate: Date;
  let daysUntilDue: number;
  
  if (currentDay === 1) {
    // Começou exatamente no dia 1: ciclo cheio, sem pro-rata fracionado
    firstDueDate = new Date(currentYear, currentMonth, preferredDueDay);
    if (preferredDueDay <= currentDay) {
      firstDueDate = new Date(currentYear, currentMonth + 1, preferredDueDay);
    }
    
    return {
      isProRataApplied: false,
      daysInMonth,
      daysRemainingInFirstCycle: daysInMonth,
      dailyRate: Math.round((params.monthlyPrice / daysInMonth) * 100) / 100,
      proRataAmount: params.monthlyPrice,
      firstInvoiceDueDate: formatDateISO(firstDueDate),
      firstInvoiceAmount: params.finalCyclePrice,
      explanation: 'Contratação no primeiro dia do mês. Fatura com valor integral do plano.',
    };
  }
  
  // Contratação no meio do mês
  // Exemplo: Hoje é dia 14. Vencimento preferido: Dia 10 do próximo mês (ou dia 25 deste mês)
  if (preferredDueDay > currentDay) {
    // Vencimento ainda neste mês
    firstDueDate = new Date(currentYear, currentMonth, preferredDueDay);
    daysUntilDue = preferredDueDay - currentDay;
  } else {
    // Vencimento no próximo mês
    firstDueDate = new Date(currentYear, currentMonth + 1, preferredDueDay);
    const daysRestantesMesAtual = daysInMonth - currentDay;
    daysUntilDue = daysRestantesMesAtual + preferredDueDay;
  }
  
  const dailyRate = Math.round((params.monthlyPrice / 30) * 100) / 100;
  const proRataAmount = Math.round((dailyRate * daysUntilDue) * 100) / 100;
  
  let firstInvoiceAmount = proRataAmount;
  if (params.periodicity !== 'mensal') {
    // Para planos trimestrais/anuais, pode cobrar a proporção + o ciclo ou a proporção na 1ª fatura
    firstInvoiceAmount = proRataAmount;
  }
  
  return {
    isProRataApplied: true,
    daysInMonth,
    daysRemainingInFirstCycle: daysUntilDue,
    dailyRate,
    proRataAmount,
    firstInvoiceDueDate: formatDateISO(firstDueDate),
    firstInvoiceAmount,
    explanation: `Contratação proporcional para ${daysUntilDue} dias (de ${formatDateBR(now)} até o vencimento em ${formatDateBR(firstDueDate)} no dia ${preferredDueDay}). Taxa diária de R$ ${dailyRate.toFixed(2)}.`,
  };
}

export interface CancellationSettlementResult {
  subscriptionId: string;
  customerName: string;
  planName: string;
  periodicity: PlanPeriodicity;
  startDate: string;
  cancelDate: string;
  
  // CDC Artigo 49 (Direito de Arrependimento em 7 dias)
  isWithinCdc7Days: boolean;
  
  // Ciclo Atual & Pro-rata de Uso
  daysInCurrentCycle: number;
  daysUsedInCurrentCycle: number;
  cyclePricePaid: number;
  dailyRate: number;
  amountUsedProRata: number;
  amountUnusedRefundable: number;
  
  // Fidelidade & Multa por Rescisão Antecipada (Art. 408-416 CC)
  hasActiveFidelity: boolean;
  fidelityTotalMonths: number;
  fidelityMonthsRemaining: number;
  remainingContractValue: number;
  penaltyFinePercent: number;
  penaltyFineAmount: number;
  
  // Balanço Final
  finalBalanceToPayOrRefund: number; // Se positivo: cliente deve pagar rescisão. Se negativo: cliente tem saldo a receber.
  typeOfSettlement: 'estorno_integral_cdc' | 'cliente_paga_rescisao' | 'credito_restituivel' | 'liquidado_sem_pendencia';
  settlementSummary: string;
  legalBasis: string[];
}

/**
 * Calcula o acerto financeiro e pro-rata de cancelamento/rescisão contratual
 */
export function calculateCancellationSettlement(
  subscription: SoldSubscription,
  cancelDateStr?: string
): CancellationSettlementResult {
  const cancelDate = cancelDateStr ? new Date(cancelDateStr) : new Date();
  const startDate = new Date(subscription.startDate || new Date());
  
  // Diferença em dias desde a contratação
  const diffTime = Math.abs(cancelDate.getTime() - startDate.getTime());
  const daysSinceStart = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // 1. Verificação CDC Artigo 49 (Arrependimento em 7 dias)
  const isWithinCdc7Days = daysSinceStart <= 7;
  
  if (isWithinCdc7Days) {
    return {
      subscriptionId: subscription.id,
      customerName: subscription.customerName,
      planName: subscription.planName,
      periodicity: subscription.periodicity,
      startDate: subscription.startDate,
      cancelDate: formatDateISO(cancelDate),
      isWithinCdc7Days: true,
      daysInCurrentCycle: 30,
      daysUsedInCurrentCycle: daysSinceStart,
      cyclePricePaid: subscription.pricePaid,
      dailyRate: Math.round((subscription.pricePaid / 30) * 100) / 100,
      amountUsedProRata: 0,
      amountUnusedRefundable: subscription.pricePaid,
      hasActiveFidelity: false,
      fidelityTotalMonths: subscription.loyaltyMonths || 1,
      fidelityMonthsRemaining: 0,
      remainingContractValue: 0,
      penaltyFinePercent: 0,
      penaltyFineAmount: 0,
      finalBalanceToPayOrRefund: -subscription.pricePaid, // Devolver 100%
      typeOfSettlement: 'estorno_integral_cdc',
      settlementSummary: 'Cancelamento realizado dentro do prazo legal de 7 dias (Art. 49 do CDC). Estorno integral de 100% sem qualquer incidência de multa ou retenção.',
      legalBasis: [
        'Artigo 49 da Lei nº 8.078/1990 (Código de Defesa do Consumidor - Direito de Arrependimento)',
        'Devolução integral e imediata dos valores pagos monetariamente atualizados',
      ],
    };
  }
  
  // 2. Cálculo Pro-rata de uso no ciclo vigente
  const daysInCurrentCycle = 30;
  // Dias usados no ciclo atual (módulo 30)
  const daysUsedInCurrentCycle = Math.max(1, (daysSinceStart % 30) || 30);
  const dailyRate = Math.round((subscription.pricePaid / (subscription.loyaltyMonths ? subscription.loyaltyMonths * 30 : 30)) * 100) / 100;
  const amountUsedProRata = Math.round((dailyRate * daysUsedInCurrentCycle) * 100) / 100;
  const amountUnusedRefundable = Math.max(0, Math.round((subscription.pricePaid - amountUsedProRata) * 100) / 100);
  
  // 3. Fidelidade & Multa por Rescisão Antecipada
  const fidelityTotalMonths = subscription.loyaltyMonths || 1;
  const hasActiveFidelity = fidelityTotalMonths > 1;
  
  let fidelityMonthsRemaining = 0;
  let remainingContractValue = 0;
  let penaltyFinePercent = subscription.terminationFinePercent || 20;
  let penaltyFineAmount = 0;
  
  if (hasActiveFidelity) {
    const contractEndDate = subscription.contractEndDate ? new Date(subscription.contractEndDate) : new Date(startDate.getTime() + fidelityTotalMonths * 30 * 24 * 60 * 60 * 1000);
    if (cancelDate < contractEndDate) {
      const remainingTime = contractEndDate.getTime() - cancelDate.getTime();
      const remainingDays = Math.ceil(remainingTime / (1000 * 60 * 60 * 24));
      fidelityMonthsRemaining = Math.max(1, Math.ceil(remainingDays / 30));
      
      const monthlyEquivalent = subscription.pricePaid / fidelityTotalMonths;
      remainingContractValue = Math.round((monthlyEquivalent * fidelityMonthsRemaining) * 100) / 100;
      penaltyFineAmount = Math.round((remainingContractValue * (penaltyFinePercent / 100)) * 100) / 100;
    }
  }
  
  // Balanço: Saldo a Pagar pelo cliente = Multa Rescisória - Saldo Não Usufruído já pago
  const netBalance = Math.round((penaltyFineAmount - amountUnusedRefundable) * 100) / 100;
  
  let typeOfSettlement: CancellationSettlementResult['typeOfSettlement'] = 'liquidado_sem_pendencia';
  let settlementSummary = '';
  
  if (netBalance > 0) {
    typeOfSettlement = 'cliente_paga_rescisao';
    settlementSummary = `Rescisão antecipada de plano com fidelidade. Incide multa compensatória de ${penaltyFinePercent}% sobre o saldo das parcelas vincendas (R$ ${remainingContractValue.toFixed(2)}), abatendo o crédito não utilizado. Saldo residual a liquidar: R$ ${netBalance.toFixed(2)}.`;
  } else if (netBalance < 0) {
    typeOfSettlement = 'credito_restituivel';
    settlementSummary = `Cancelamento com crédito em favor do cliente no valor de R$ ${Math.abs(netBalance).toFixed(2)}, após dedução do período proporcional usufruído e eventuais multas contratuais.`;
  } else {
    typeOfSettlement = 'liquidado_sem_pendencia';
    settlementSummary = 'Contrato liquidado e cancelado sem pendências ou saldos residuais entre as partes.';
  }
  
  return {
    subscriptionId: subscription.id,
    customerName: subscription.customerName,
    planName: subscription.planName,
    periodicity: subscription.periodicity,
    startDate: subscription.startDate,
    cancelDate: formatDateISO(cancelDate),
    isWithinCdc7Days: false,
    daysInCurrentCycle,
    daysUsedInCurrentCycle,
    cyclePricePaid: subscription.pricePaid,
    dailyRate,
    amountUsedProRata,
    amountUnusedRefundable,
    hasActiveFidelity,
    fidelityTotalMonths,
    fidelityMonthsRemaining,
    remainingContractValue,
    penaltyFinePercent,
    penaltyFineAmount,
    finalBalanceToPayOrRefund: netBalance,
    typeOfSettlement,
    settlementSummary,
    legalBasis: [
      'Artigo 6º, III e Artigo 52 da Lei nº 8.078/1990 (Código de Defesa do Consumidor)',
      'Artigos 408 a 416 do Código Civil Brasileiro (Cláusula Penal Compensatória)',
      `Cláusula 7ª do Contrato de Prestação de Serviços (Multa de ${penaltyFinePercent}% sobre parcelas vincendas)`,
    ],
  };
}

function formatDateISO(d: Date): string {
  return d.toISOString().split('T')[0];
}

function formatDateBR(d: Date): string {
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}
