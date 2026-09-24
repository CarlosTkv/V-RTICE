export type SimplesAnexo = 'I' | 'II' | 'III' | 'IV' | 'V';

export type TaxRegime = 'simples' | 'lucro_presumido' | 'lucro_real';

export type TransportType = 'intermunicipal_cargas' | 'intermunicipal_passageiros' | 'municipal';

export type ICMSTreatment = 
  | 'tributado_integral' 
  | 'st_substituicao' 
  | 'isencao_total' 
  | 'reducao_base' 
  | 'por_fora_sublimite'
  | 'nao_aplicavel';

export type ISSTreatment = 
  | 'tributado_integral' 
  | 'retido_tomador' 
  | 'isencao_total' 
  | 'reducao_base' 
  | 'por_fora_sublimite' 
  | 'nao_aplicavel';

export type PisCofinsTreatment = 
  | 'tributado_integral' 
  | 'monofasico_segregado' 
  | 'aliquota_zero';

export interface EconetReportData {
  companyName: string;
  year: string;
  period: string;
  anexoSegmento: string;
  uf: string;
  municipio: string;
  faixa: string;
  rbt12: string;
  clientProfile: string;
  pjsales: string;
  inputsPurchase: string;
  expectedRevenue: string;
  ncms: string[];
  regimeRegularIbsCbs: string;
  regimeRegularCredit: string;
  regimeRegularAccumulatedCredit: string;
  regimeRegularNetCost: string;
  pgdasIbsCbs: string;
  pgdasNetCost: string;
  monthlyData: {
    month: string;
    regimeRegular: string;
    pgdas: string;
    economy: string;
  }[];
}

export interface CFOPItem {
  id: string;
  code: string; // Ex: '5.102', '5.405', '5.101', '5.933'
  description: string;
  percentage: number; // % do faturamento mensal
  amount?: number; // Valor em R$
  anexo: SimplesAnexo;
  icmsTreatment: ICMSTreatment;
  icmsReductionPercent?: number; // Ex: 33.33% se redução
  issTreatment: ISSTreatment;
  issReductionPercent?: number;
  pisCofinsTreatment: PisCofinsTreatment;
}

export interface PartnerOtherCompany {
  id: string;
  name: string;
  cnpj?: string;
  revenue12m: number;
  participationPercent: number;
  isManager: boolean;
  regime: TaxRegime;
  cnae?: string;
  cnaeDescription?: string;
  uf?: string;
  city?: string;
  status?: string;
  capitalSocial?: number;
  simplesOptant?: boolean;
  meiOptant?: boolean;
  partnerRole?: string;
  source?: 'api' | 'manual' | 'pgdas';
}

export interface Partner {
  id: string;
  name: string;
  cpf?: string;
  participationPercent: number; // % nesta empresa
  isManager: boolean; // É administrador nesta empresa?
  roleInCurrentCompany?: string;
  otherCompanies: PartnerOtherCompany[];
}

export interface CompanyAddress {
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  cep?: string;
  formatted?: string;
  // Aliases for English/Portuguese compatibility
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

export interface CompanyRFBValidation {
  validatedAt: string;
  situacaoCadastral: string;
  dataSituacaoCadastral?: string;
  razaoSocialOficial?: string;
  nomeFantasia?: string;
  opcaoSimples?: boolean | null;
  dataOpcaoSimples?: string | null;
  opcaoMei?: boolean | null;
  capitalSocial?: number;
  porte?: string;
  naturezaJuridica?: string;
  address?: CompanyAddress;
  cnaeFiscal?: string;
  cnaeFiscalDescricao?: string;
  cnaesSecundarios?: Array<{ codigo: string; descricao: string }>;
  status: 'valid' | 'warning' | 'error' | 'not_checked';
  messages?: string[];
}

export type EcacRevenueClassification =
  | 'normal'                      // Tributação normal (sem substituição e sem retenção)
  | 'icms_st'                     // Com substituição tributária de ICMS
  | 'transporte_subcontratado'   // Subcontratação de transporte (Convênio ICMS 25/90)
  | 'iss_retido'                  // Prestação de serviços com retenção de ISS pelo tomador
  | 'iss_st'                      // Prestação de serviços com substituição tributária de ISS
  | 'exterior_servico'           // Prestação de serviços para o exterior (Exportação)
  | 'exterior_mercadoria'        // Venda de mercadorias para o exterior (Exportação)
  | 'pis_cofins_monofasico'      // Com tributação monofásica de PIS/COFINS
  | 'icms_isencao_estadual'       // Com isenção de ICMS concedida pelo Estado (ex: PR até R$ 360k)
  | 'icms_reducao_estadual'       // Com redução de ICMS concedida pelo Estado (ex: PR acima de R$ 360k)
  | 'iss_isencao_municipal'       // Com isenção de ISS concedida pelo Município
  | 'personalizado';              // Segregação personalizada com percentuais mistos

export interface ParanaCalculationDetails {
  scenario: 1 | 2 | 3; // 1 = RBT12 <= 360k (Isenção Total), 2 = RBT12 > 360k até 3,6M (Redução Parcial), 3 = Acima de 3,6M (Sublimite Excedido)
  anexoUsed: SimplesAnexo;
  tabelaNome: 'Tabela I - Comércio e Transporte' | 'Tabela II - Indústria';
  aliqNominalFederal: number; // % (ex: 10.70)
  deducaoFederal: number; // R$ (ex: 22500)
  reparticaoIcmsFederal: number; // % (ex: 33.50)
  aliqEfetivaFederalGeral: number; // % (ex: 8.45)
  aliqEfetivaFederalIcms: number; // % (ex: 2.83075)
  aliqNominalPR: number; // % (ex: 3.5845)
  deducaoPR: number; // R$ (ex: 14351.40)
  aliqEfetivaPR: number; // % (ex: 2.14936)
  reductionPercent: number; // % exato para digitar no PGDAS-D (ex: 24.07)
  pgdasInstructions: string;
  legalBasis: string;
}

export interface StateSimplesIcmsBenefit {
  uf: string;
  stateName: string;
  hasBenefit: boolean;
  legalBasis: string;
  rbt12: number;
  isExempt: boolean; // true se até R$ 360k no PR/RS
  reductionPercent: number; // ex: 100% se <= 360k, ou % dinâmico Decreto 8.660/2018
  bracketDescription: string;
  appliedBracket?: string; // ex: 'Faixa 1', 'Faixa 2', 'Faixa 3', 'Faixa 4', 'Faixa 5'
  benefitType: 'isencao_total' | 'reducao_progressiva' | 'padrao_federal' | 'sublimite_excedido';
  monthlySavingsEstimated: number;
  annualSavingsEstimated: number;
  notes: string;
  paranaDetails?: ParanaCalculationDetails;
}

export type RevenueSituationType =
  | 'normal'                      // Tributação normal (sem retenção, sem substituição, sem isenção)
  | 'iss_retido'                  // Com Retenção de ISS na fonte pelo Tomador (deduz ISS)
  | 'icms_st'                     // Com Substituição Tributária de ICMS / ISS (deduz ICMS/ISS)
  | 'isencao_reducao'             // Com Isenção ou Redução de Base Estadual/Municipal (deduz ICMS/ISS)
  | 'pis_cofins_monofasico'       // Com Tributação Monofásica de PIS/COFINS (deduz PIS/COFINS)
  | 'transporte_subcontratado';   // Subcontratação de Transporte - Convênio 25/90 (deduz ICMS)

export interface ActivitySituationSplit {
  id: string;
  situation: RevenueSituationType;
  label: string;
  active: boolean;
  percent: number; // % da receita interna desta atividade
  amount: number; // R$ da receita interna desta atividade
  description?: string;
}

export interface AnexoRevenueItem {
  id?: string;
  anexo: SimplesAnexo;
  activityKey?: string; // ex: 'anexo_1', 'anexo_2', 'anexo_3_geral', 'anexo_3_transporte_cargas', 'anexo_3_transporte_passageiros', 'anexo_3_transporte_municipal', 'anexo_4', 'anexo_5'
  activityTitle?: string;
  isTransport?: boolean;
  transportType?: TransportType;
  active: boolean;
  monthlyRevenueInternal: number; // Receita no Mercado Interno (R$)
  monthlyRevenueExport: number; // Receita no Mercado Externo / Exportação (R$)
  description?: string;
  ecacClassification?: EcacRevenueClassification; // Classificação e-CAC / PGDAS-D oficial
  ecacOptionCode?: string; // Código da opção exata do e-CAC (ex: 'servicos_nao_sujeitos_fator_r_anexo3_sem_ret_proprio')
  ecacGroup?: string; // Grupo da opção no e-CAC
  subjectToFatorR?: boolean; // Se false, NUNCA vai para o Anexo V (permanece no Anexo III). Se true, submete-se ao Fator R (>=28% Anexo III, <28% Anexo V)
  // Multiplas situações simultâneas na mesma atividade (ex: parte com retenção, parte com isenção, parte com substituição)
  activeSituations?: RevenueSituationType[];
  situationSplits?: ActivitySituationSplit[];
  // Parcela com ST ou Monofásico / Isenção / Retenção
  stPercent?: number; // % com ICMS ST / Substituição (ou Frete ST)
  monofasicoPercent?: number; // % com PIS/COFINS Monofásico
  issRetidoPercent?: number; // % com ISS retido na fonte
  isencaoPercent?: number; // % com Isenção estadual/municipal
  subcontratacaoPercent?: number; // % com ICMS Frete Subcontratado (isenção de recolhimento pelo subcontratado)
}

export interface RegimeComparisonDetail {
  regime: 'simples_padrao' | 'simples_hibrido' | 'lucro_presumido' | 'lucro_real';
  name: string;
  shortName: string;
  description: string;
  monthlyTaxTotal: number;
  annualTaxTotal: number;
  effectiveRatePercent: number; // % sobre a receita bruta
  regimeName?: string;
  monthlyTax?: number;
  effectiveRate?: number;
  creditTransferRate?: number;
  annualNetProfit?: number;
  
  // Detalhamento dos tributos
  taxes: {
    irpj: number;
    csll: number;
    pis: number;
    cofins: number;
    cppEncargos: number; // CPP sobre folha ou embutida
    icms: number;
    iss: number;
    ibsCbs?: number; // Parcela de IBS/CBS na Reforma
    icmsIssOutside?: number; // ICMS/ISS por fora do Simples por sublimite
  };

  // DRE Fiscal Estimada
  dre: {
    grossRevenue: number;
    taxDeductions: number;
    netRevenue: number;
    costOfGoodsOrServices: number; // CPV / Custos
    payrollAndCharges: number; // Folha + Encargos
    operationalExpenses: number; // Despesas Administrativas/Operacionais
    taxOnProfit: number; // IRPJ + CSLL
    netProfitFinal: number; // Lucro Líquido Final aos Sócios
    netProfitMarginPercent: number;
  };

  // Análise Estratégica
  advantages: string[];
  disadvantages: string[];
  b2bCreditRatePercent: number; // % de crédito repassado ao cliente B2B
  b2bCompetitivenessRank: 'pessima' | 'media' | 'alta' | 'maxima';
  complianceComplexity: 'baixa' | 'moderada' | 'alta' | 'muito_alta';
  legalRiskLevel: 'baixo' | 'moderado' | 'alto';
  recommendationScore: number; // 0 a 100
  isRecommended: boolean;
  recommendationReason: string;
}

export interface CompanyData {
  id?: string; // ID único para controle multi-empresa
  name: string;
  cnpj: string;
  cnae: string;
  cnaeDescription: string;
  uf: string;
  state?: string; // Alias para UF
  city?: string; // Município / Cidade da empresa
  regimeTributario?: 'simples_nacional' | 'lucro_presumido' | 'lucro_real' | 'mei'; // Regime tributário da empresa
  taxRegime?: TaxRegime; // Alias para regimeTributario
  atividadeEmpresa?: 'servicos' | 'comercio' | 'industria' | 'misto'; // Atividade principal da empresa
  customIcmsRate?: number; // Alíquota de ICMS interna da UF personalizada (%)
  customIssRate?: number; // Alíquota de ISS municipal personalizada (%) (ex: 2.0% a 5.0%)
  isTransportService?: boolean; // Se a empresa é prestadora de serviços de transportes
  transportType?: 'municipal' | 'intermunicipal_cargas' | 'intermunicipal_passageiros'; // Tipo de transporte
  anexo: SimplesAnexo;
  anexoRevenues?: AnexoRevenueItem[]; // Discriminação de receita por anexo e mercado (interno vs exterior)
  rbt12: number; // Receita Bruta dos últimos 12 meses (RBT12)
  rba: number; // Receita Bruta Acumulada no ano-calendário corrente (RBA)
  rbaa?: number; // Receita Bruta Acumulada no ano-calendário anterior (RBAA)
  monthlyRevenue: number; // Faturamento total do mês atual
  exportMonthlyRevenue?: number; // Faturamento de exportação / mercado exterior no mês
  payroll12m: number; // Folha de salários acumulada dos últimos 12 meses (inclui pró-labore e encargos)
  monthlyPayroll: number; // Folha do mês atual (soma de funcionários CLT + pró-labore)
  hasEmployeesPayroll?: boolean; // Se a empresa possui ou não Folha de Pagamento com Funcionários (CLT)
  employeesPayrollMonthly?: number; // Valor mensal da folha de funcionários CLT
  hasProLabore?: boolean; // Se a empresa possui ou não Pró-labore para os sócios/administradores
  proLaboreMonthly?: number; // Pró-labore mensal dos sócios (se aplicável)
  ratRatePercent?: number; // Alíquota RAT/FAP de INSS (1%, 2% ou 3% - padrão 3%)
  terceirosRatePercent?: number; // Alíquota de Outras Entidades / Terceiros (Sistema S - padrão 5.8%)
  cppEncargos?: number; // CPP (INSS Patronal) sobre folha ou embutida no DAS
  inputCostsPercent?: number; // % de Compras de Insumos / Mercadorias / CPV sobre a receita mensal
  simplesSupplierPercent?: number; // % de compras originárias de fornecedores optantes do Simples Nacional
  fixedCostsMonthly?: number; // Despesas fixas mensais (aluguel, sistemas, contabilidade)
  financialExpensesMonthly?: number; // Despesas financeiras / bancárias mensais
  inputCostsMonthly?: number; // Custo de insumos / CPV em valor absoluto mensal
  supplierComposition?: SupplierTaxComposition; // Composição de Fornecedores por Regime e tipo de despesa
  operationalExpensesMonthly?: number; // Despesas operacionais em valor absoluto mensal
  operationalExpensesPercent?: number; // % de Despesas operacionais sobre a receita mensal
  b2bSalesPercent: number; // % de vendas para Pessoas Jurídicas (B2B)
  partners: Partner[];
  cfopItems?: CFOPItem[]; // Lista de CFOPs informados e segregados
  address?: CompanyAddress; // Endereço oficial validado na Receita Federal
  situacaoCadastral?: string; // Situação cadastral na RFB (ex: ATIVA)
  rfbValidation?: CompanyRFBValidation; // Registro de validação perante a RFB
  projectionGrowthPercent: number; // Projeção de crescimento anual %
  estimatedNetProfitMargin: number; // Margem de lucro líquido estimada % (ex: 15%)
  targetIvaRate: number; // Alíquota estimada da Reforma Tributária IBS+CBS (padrão 26.5%)
  applyStateIcmsReduction?: boolean; // Se a tabela de redução/isenção de ICMS estadual (ex: PR Decreto 8.660/18) está ativa (padrão true)
  isStartOfActivity?: boolean; // Empresa em início de atividade (menos de 13 meses)
  activityStartMonths?: number; // Número de meses de atividade se empresa nova
  subjectToFatorR?: boolean; // Se a empresa é optante por atividade com Fator R (se false ou undefined no Anexo III, não joga para o Anexo V)
  simulationHistory?: SavedSimulation[]; // Histórico de pareceres e simulações arquivadas
  keepSimulationHistory?: boolean; // [ ] Manter em Histórico (quando marcado, arquiva automaticamente as simulações e alterações)
  financialStatements?: FinancialStatement[]; // Histórico de Balancetes/DREs importados para comparação
  createdAt?: string;
  updatedAt?: string;
  searchNotesConfig?: {
    emitidas: { nfe: boolean; cte: boolean; nfse: boolean };
    recebidas: { nfe: boolean; cte: boolean; nfse: boolean };
  };
  nfceIntegration?: {
    ativo: boolean;
    emissor: string;
    apiKey: string;
    apiSecret?: string;
    endpointUrl?: string;
  };
  nfseCredentials?: {
    usarCredenciaisNaoCertificado: boolean;
    usuario?: string;
    senha?: string;
    provedor?: string;
  };
  centralizadorConfig?: {
    nfeCte: string;
    nfse: string;
  };
  certUploaded?: boolean;
  pfxFileName?: string;
  certPassword?: string;
  pfxBase64?: string;
  certExpiryDate?: string;
  lastSyncNSU?: string;
  cndComplianceSummary?: {
    overallStatus: 'REGULAR_TOTAL' | 'REGULAR_COM_RESSALVA' | 'IRREGULAR_BLOQUEANTE';
    lastCheckedAt: string;
    federalStatus: 'NEGATIVA' | 'POSITIVA_COM_EFEITO_NEGATIVA' | 'POSITIVA';
    estadualStatus: 'NEGATIVA' | 'POSITIVA_COM_EFEITO_NEGATIVA' | 'POSITIVA';
    municipalStatus: 'NEGATIVA' | 'POSITIVA_COM_EFEITO_NEGATIVA' | 'POSITIVA';
    trabalhistaStatus: 'NEGATIVA' | 'POSITIVA_COM_EFEITO_NEGATIVA' | 'POSITIVA';
    fgtsStatus: 'NEGATIVA' | 'POSITIVA_COM_EFEITO_NEGATIVA' | 'POSITIVA';
    totalDebtsValue: number;
  };
}

export type CNDSphere = 'federal' | 'estadual' | 'municipal' | 'trabalhista' | 'fgts';
export type CNDStatus = 'NEGATIVA' | 'POSITIVA_COM_EFEITO_NEGATIVA' | 'POSITIVA' | 'EXPIRADA' | 'EM_PROCESSAMENTO' | 'NAO_CONSULTADA';

export interface CNDItem {
  id: string;
  sphere: CNDSphere;
  title: string;
  organ: string;
  jurisdictionName: string;
  targetStateOrCity: string;
  status: CNDStatus;
  controlCode: string;
  issueDate: string;
  expiryDate: string;
  daysRemaining: number;
  isExpired: boolean;
  officialValidationUrl: string;
  authMethod: string;
  legalBase: string;
  hasDebts: boolean;
  debtsCount: number;
  notes?: string;
}

export interface CompanyDebtItem {
  id: string;
  sphere: CNDSphere;
  organ: string;
  tributo: string;
  inscriptionOrProcess: string;
  competence: string;
  originalValue: number;
  fineAndInterest: number;
  totalDebt: number;
  status: 'EM_COBRANCA' | 'PARCELADO_EM_DIA' | 'INSCRITO_DIVIDA_ATIVA' | 'EXECUCAO_FISCAL';
  isSuspended: boolean;
  suspensionReason?: string;
  actionRequired: string;
  negotiationLink?: string;
}

export interface CNDComplianceReport {
  companyCnpj: string;
  companyName: string;
  companyUf: string;
  companyCity: string;
  generatedAt: string;
  overallScore: number;
  overallStatus: 'REGULAR_TOTAL' | 'REGULAR_COM_RESSALVA' | 'IRREGULAR_BLOQUEANTE';
  certDigitalUsed: boolean;
  certDigitalName?: string;
  items: CNDItem[];
  debts: CompanyDebtItem[];
  totalDebtAmount: number;
  totalSuspendedAmount: number;
}

export type CNDFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'proactive_before_expiry';

export interface CNDScheduleConfig {
  id: string;
  enabled: boolean;
  title: string;
  frequency: CNDFrequency;
  executionTime: string; // "03:00"
  executionDayOfWeek?: number; // 1 = Monday
  executionDayOfMonth?: number; // 1 to 28
  daysBeforeExpiryAlert?: number; // e.g., 5 days
  spheres: {
    federal: boolean;
    estadual: boolean;
    municipal: boolean;
    trabalhista: boolean;
    fgts: boolean;
  };
  scope: 'all_companies' | 'active_company_only' | 'selected_companies';
  selectedCompanyIds?: string[];
  actions: {
    autoDownloadPdf: boolean;
    sendEmailNotification: boolean;
    emailRecipients: string;
    alertOnDebts: boolean;
    archiveInSystemFolder: boolean;
  };
  lastRunAt?: string;
  nextRunAt?: string;
  status: 'active' | 'paused' | 'running' | 'error';
}

export interface CNDExecutionLogItem {
  id: string;
  timestamp: string;
  triggerType: 'scheduled' | 'manual' | 'proactive';
  scheduleTitle: string;
  companiesProcessed: number;
  totalCNDsChecked: number;
  totalSuccess: number;
  totalDebtsDetected: number;
  durationSeconds: number;
  status: 'SUCCESS' | 'WARNING' | 'ERROR';
  details: string;
  generatedBatchZipSize?: string;
}

export interface SavedSimulation {
  id: string;
  timestamp: string; // ISO ou formatado DD/MM/AAAA HH:mm
  date?: string;
  title: string;
  scenarioNotes?: string;
  keepInHistory?: boolean;
  rbt12: number;
  monthlyRevenue: number;
  exportRevenue?: number;
  payroll12m: number;
  monthlyPayroll: number;
  fatorRPercent: number;
  fatorRStatus: string;
  effectiveAnexo: SimplesAnexo;
  effectiveRatePercent: number;
  simplesTaxMonthly: number;
  simplesTaxAnnual: number;
  presumedTaxMonthly: number;
  presumedTaxAnnual: number;
  realTaxMonthly: number;
  realTaxAnnual: number;
  bestRegime: 'simples' | 'presumido' | 'real';
  annualSavings: number;
  anexoRevenuesSnapshot: AnexoRevenueItem[];
  companyDataSnapshot?: Partial<CompanyData>;
}

export interface TaxBreakdown {
  irpj: number;
  csll: number;
  cofins: number;
  pis: number;
  cpp: number;
  icms: number;
  iss: number;
  icmsSegregadoST?: number; // ICMS abatido no DAS por ser Substituição Tributária
  icmsSegregadoIsencao?: number; // ICMS abatido por Isenção Estadual
  icmsReducaoEstadual?: number; // ICMS reduzido por benefício estadual (ex: Paraná Lei 15.342/06)
  issSegregadoRetido?: number; // ISS abatido por Retenção na Fonte
  issSegregadoIsencao?: number; // ISS abatido por Isenção Municipal
  icmsPorForaSublimite?: number; // ICMS recolhido por fora no regime normal estadual
  issPorForaSublimite?: number; // ISS recolhido por fora no regime municipal
  pisCofinsMonofasico?: number; // PIS/COFINS abatido do DAS
}

export interface SublimitExclusionDetails {
  isExceeded: boolean;
  sublimitAmount: number;
  excessAmount: number;
  excessPercent: number;
  effectiveDateRule: 'proximo_ano' | 'mes_subsequente' | 'dentro_limite';
  effectiveDateText: string;
  effectiveExclusionDateRule?: 'next_calendar_year' | 'immediate_next_month' | 'none';
  effectiveRbt12?: number;
  
  // Guia DAS Federal (sem ICMS e sem ISS)
  dasFederalMonthly: number;
  dasFederalAnnual: number;
  dasFederalEffectiveRate: number;
  monthlyFederalDASTax?: number;
  effectiveSimplesRateWithoutIcmsIss?: number;
  
  // ICMS Estadual Recolhido por Fora (Regime Normal Débito e Crédito)
  icmsOutsideMonthly: number;
  icmsOutsideAnnual: number;
  icmsStateRate: number;
  icmsGrossDebitMonthly: number;
  icmsInputCreditMonthly: number;
  monthlyOutsideICMS?: number;
  
  // ISS Municipal Recolhido por Fora
  issOutsideMonthly: number;
  issOutsideAnnual: number;
  issCityRate: number;
  monthlyOutsideISS?: number;
  
  // Totais Combinados (DAS Federal + ICMS fora + ISS fora)
  totalCombinedMonthly: number;
  totalCombinedAnnual: number;
  totalCombinedEffectiveRate: number;
  additionalMonthlyCostVsDAS: number;
  monthlyTotalTaxWithSublimitExclusion?: number;
  annualTotalTaxWithSublimitExclusion?: number;
  effectiveGlobalRateWithSublimitExclusion?: number;
  monthlyAdditionalCostVsSimples?: number;
  annualAdditionalCostVsSimples?: number;
  
  // Novas Obrigações Acessórias Obrigatórias
  ancillaryObligations: Array<{
    name: string;
    frequency: string;
    organ: 'SEFAZ' | 'Prefeitura' | 'RFB';
    description: string;
  }>;
  ancillaryObligationsGenerated?: string[];
}

export interface StateIcmsTransportInfo {
  uf: string;
  stateName: string;
  region: 'Sul' | 'Sudeste' | 'Centro-Oeste' | 'Nordeste' | 'Norte';
  standardInternalRate: number; // ex: 18.0
  fcpRate: number; // Fundo de Combate à Pobreza (%)
  effectiveInternalRateWithConv106: number; // ex: 18% * 0.8 = 14.4%
  interstateRateToNorthNortheastCenterWestES: number; // 7.0 ou 12.0
  effectiveInterstateRate7WithConv106: number; // 7.0% * 0.8 = 5.6%
  interstateRateToSouthSoutheast: number; // 12.0
  effectiveInterstateRate12WithConv106: number; // 12.0% * 0.8 = 9.6%
  subcontractLegalBasis: string; // ex: Art. 314 RICMS/SP e Convênio ICMS 25/90
  subcontractTreatment: string;
  hasPresumedCreditConv106: boolean;
  sublimitAmount: number; // R$ 3.600.000,00
  notes: string;
}

export interface RouteFreightIcmsCalculation {
  originUF: string;
  destinationUF: string;
  freightValue: number;
  isInternal: boolean;
  isSubcontracted: boolean;
  isExempt: boolean;
  appliedIcmsRate: number;
  grossIcmsDebit: number;
  presumedCreditRate: number; // 20%
  presumedCreditAmount: number;
  netIcmsPayable: number;
  effectiveTaxRatePercent: number;
  legalBasis: string;
  simplesComparison: {
    inDasIcmsRateEstimated: number;
    inDasIcmsAmount: number;
    savingsVsNormalRegime: number;
  };
}

export interface TransportTaxAnalysis {
  isTransport: boolean;
  transportType: 'municipal' | 'intermunicipal_cargas' | 'intermunicipal_passageiros';
  transportLabel: string;
  taxJurisdiction: 'municipal_iss' | 'estadual_icms';
  lucroPresumidoIRPJRate: number;
  lucroPresumidoCSLLRate: number;
  anexoSimplesUsed: string;
  legalBasis: string;
  legalBasisNote?: string;
  specialTaxRules: string[];
}

export interface CalculationResult {
  consolidatedRevenue: number; // RBT12 + faturamentos agregados por regras de sócios
  standaloneRbt12: number;
  effectiveRate: number; // Alíquota efetiva do Simples Nacional (%)
  nominalRate: number;
  deduction: number;
  effectiveTaxMonthly: number; // Valor do DAS do mês líquido
  rawTaxMonthlyBeforeSegregation: number; // Valor do DAS bruto antes de deduções de ST/Isenções
  segregatedDeductionsMonthly: number; // Total de deduções por ST, Isenções e Retenções
  effectiveTaxAnnual: number; // Valor do DAS anual projetado
  breakdown: TaxBreakdown;
  
  // Sublimite Estadual (R$ 3.600.000,00) & Exclusão de ICMS/ISS da Guia DAS
  exceedsSublimit: boolean;
  sublimitExcessAmount: number;
  sublimitTaxSegregationNote: string;
  icmsIssOutsideSimplesTotal: number;
  sublimitExclusionDetails: SublimitExclusionDetails;
  
  // Setor de Transporte & ICMS Estadual
  transportAnalysis?: TransportTaxAnalysis;
  stateIcmsTransportInfo?: StateIcmsTransportInfo;
  stateSimplesIcmsBenefit?: StateSimplesIcmsBenefit;
  
  // Teto Federal (R$ 4.800.000,00)
  exceedsFederalLimit: boolean;
  federalExcessAmount: number;
  federalExcessPercent: number;
  exclusionType: 'none' | 'next_year' | 'immediate_next_month'; // Até 20% = próximo ano; >20% = mês subsequente
  
  // Fator R
  fatorR: number; // Folha12m / RBT12
  isFatorREligible: boolean; // Aplicável a Anexos III / V
  fatorRStatus: 'fator_r_active_anexo_3' | 'fator_r_inactive_anexo_5' | 'not_applicable';
  fatorRAdditionalPayrollNeeded: number; // Quanto precisaria aumentar na folha para atingir 28%
  
  // Societal Risk (Art. 3º § 4º LC 123/06)
  hasPartnerIrregularity: boolean;
  partnerRiskDetails: {
    partnerName: string;
    ruleBroken: string;
    summedRevenue: number;
    excessAmount: number;
    riskSeverity: 'low' | 'medium' | 'high' | 'critical';
  }[];

  // Benchmarking Comparativo Completo
  regimesComparison: RegimeComparisonDetail[];
  bestRegime: RegimeComparisonDetail;
  lucroPresumidoAnnualTax: number;
  lucroPresumidoEffectiveRate: number;
  lucroRealAnnualTax: number;
  lucroRealEffectiveRate: number;
  simplesHibridoAnnualTax: number;
  simplesHibridoEffectiveRate: number;

  // Mercado Interno vs Mercado Externo (Exportação)
  monthlyInternalRevenue: number;
  monthlyExportRevenue: number;
  exportLimitAvailable: number; // Limite adicional de R$ 4,8M para exportação
  isExportImmunityApplied: boolean;

  // Análise de Anexos Ativos
  activeAnexosList: SimplesAnexo[];
  anexoCalculations: Array<{
    anexo: SimplesAnexo;
    activityKey?: string;
    activityTitle?: string;
    isTransport?: boolean;
    transportType?: TransportType;
    taxJurisdiction?: 'estadual_icms' | 'municipal_iss';
    internalRevenue: number;
    exportRevenue: number;
    totalRevenue: number;
    effectiveRate: number;
    nominalRate: number;
    taxDue: number;
  }>;

  // Reforma Tributária (IBS/CBS)
  reformaSimplesCreditTransferRate: number; // Alíquota de crédito repassada ao cliente PJ no Simples
  reformaRegularCreditTransferRate: number; // Alíquota de crédito repassada ao cliente no Lucro Presumido/Real (26.5%)
  b2bClientDisadvantageAnnual: number; // Desvantagem monetária para clientes B2B que compram do Simples
  bestRegimeRecommendation: string;

  // Auditoria Detalhada de Folha, Pró-Labore e Impacto no CPP
  payrollCppAudit?: PayrollCppAudit;

  // Auditoria Detalhada de Fornecedores e Tomada de Créditos (IBS, CBS, ICMS e PIS/COFINS)
  supplierCreditAudit?: SupplierCreditAuditResult;
}

export interface PayrollCppAudit {
  hasEmployees: boolean;
  hasProLabore: boolean;
  employeesPayrollMonthly: number;
  employeesPayrollAnnual: number;
  proLaboreMonthly: number;
  proLaboreAnnual: number;
  totalPayrollMonthly: number;
  totalPayrollAnnual: number;
  ratRate: number;
  terceirosRate: number;
  simplesCppTreatment: string;
  simplesCppMonthly: number;
  simplesCppAnnual: number;
  simplesCppIsInsideDAS: boolean;
  presumedCppEmployeesMonthly: number;
  presumedCppProLaboreMonthly: number;
  presumedCppTotalMonthly: number;
  presumedCppTotalAnnual: number;
  realCppEmployeesMonthly: number;
  realCppProLaboreMonthly: number;
  realCppTotalMonthly: number;
  realCppTotalAnnual: number;
  cppDeltaPresumidoVsSimplesAnnual: number;
  cppStrategicDiagnosis: string;
}

export interface SupplierTaxComposition {
  goodsExpensePercent: number; // % Mercadorias e Insumos físicos (gera crédito ICMS + CBS/IBS + PIS/COFINS)
  servicesExpensePercent: number; // % Prestadores de Serviços tomados (gera crédito CBS/IBS + PIS/COFINS, NÃO gera ICMS)
  simplesConventionalSupplierPercent: number; // % Fornecedores do Simples Convencional (crédito restrito de IBS/CBS e ICMS)
  simplesHibridoSupplierPercent: number; // % Fornecedores do Simples Híbrido (crédito integral IBS/CBS 26.5%)
  regimeNormalSupplierPercent: number; // % Fornecedores do Regime Normal (Lucro Presumido/Real - crédito integral de ICMS, PIS/COFINS e IBS/CBS)
  averageSimplesIcmsTransferRate: number; // Alíquota média de ICMS do Simples na NF-e (ex: 2.8%)
  averageSimplesIbsCbsTransferRate: number; // Alíquota média de IBS/CBS do Simples no DAS (ex: 3.5%)
}

export interface SupplierCreditAuditResult {
  totalCostsMonthly: number;
  goodsCostsMonthly: number;
  servicesCostsMonthly: number;
  // Créditos de ICMS
  icmsRateNormal: number;
  icmsCreditGoodsNormalMonthly: number;
  icmsCreditGoodsSimplesMonthly: number;
  icmsCreditTotalMonthly: number;
  icmsCreditTotalAnnual: number;
  effectiveIcmsCreditRate: number;
  // Créditos de CBS e IBS (Reforma Tributária)
  ivaRateTarget: number;
  effectiveIbsCbsCreditRatePercent: number;
  cbsCreditTotalMonthly: number;
  ibsCreditTotalMonthly: number;
  ibsCbsCreditTotalMonthly: number;
  ibsCbsCreditTotalAnnual: number;
  // Créditos de PIS e COFINS (Lucro Real)
  pisCreditMonthly: number;
  cofinsCreditMonthly: number;
  pisCofinsCreditTotalMonthly: number;
  pisCofinsCreditTotalAnnual: number;
  // Diagnóstico e Vantagens comparativas
  suppliersRiskAnalysis: string[];
  regimeCreditAdvantages: {
    simplesHibridoImpact: string;
    lucroRealImpact: string;
    lucroPresumidoImpact: string;
    simplesPadraoImpact: string;
  };
}

export type AppViewMode = 
  | 'desenvolvedor' 
  | 'master' 
  | 'escritorio' 
  | 'auditor' 
  | 'analista' 
  | 'empresa' 
  | 'parceiro' 
  | 'cliente_relatorio'
  | 'cliente_simples_hibrido';

export type AuthSecurityMode = 'password_only' | 'password_and_email_otp' | 'digital_certificate';

export interface DigitalCertificateInfo {
  id: string;
  type: 'e-CNPJ A1' | 'e-CNPJ A3' | 'e-CPF A1' | 'e-CPF A3';
  subjectName: string;
  subjectCommonName?: string;
  documentNumber: string; // CNPJ ou CPF
  issuer: string; // AC SERPRO RFB v5, Certisign, Soluti, Valid ICP-Brasil
  serialNumber: string;
  validFrom: string;
  validUntil: string;
  thumbprintSha256: string;
  status: 'valido' | 'expirado' | 'revogado';
  installedLocation?: 'dispositivo' | 'token_nuvem' | 'cartao_a3' | 'arquivo_a1';
}

export interface PlanActivationRequest {
  id: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  companyName: string;
  documentNumber: string; // CNPJ ou CPF
  planId: string;
  planName: string;
  periodicity: PlanPeriodicity;
  monthlyPrice: number;
  totalPriceCalculated: number;
  referralCode?: string;
  partnerDiscountPercent?: number;
  requestedAt: string;
  createdAt?: string;
  status: 'pendente_aprovacao_master' | 'pendente_aprovacao' | 'aprovado' | 'ativado' | 'rejeitado';
  reviewedAt?: string;
  reviewedBy?: string;
  activationToken?: string;
  activationExpiresAt?: string;
  notes?: string;
  registeredUserId?: string;
}

export interface AdminRegistrationData {
  name: string;
  cpf: string;
  email: string;
  companyName: string;
  cnpj: string;
  professionalEmail: string;
  phone: string;
  address: CompanyAddress;
  password: string;
  securityMode?: AuthSecurityMode;
}

export type UserRole = 
  | 'desenvolvedor' 
  | 'master' 
  | 'escritorio' 
  | 'auditor' 
  | 'analista' 
  | 'empresa' 
  | 'administrador' 
  | 'auditor_fiscal' 
  | 'contador_senior' 
  | 'socio_empresa' 
  | 'cliente_relatorio' 
  | 'cliente_simples_hibrido'
  | 'assistente_fiscal' 
  | 'cliente_leitor' 
  | 'parceiro_negocios' 
  | 'cliente_empresa' 
  | 'operador';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyName?: string;
  cpf?: string;
  cnpj?: string;
  phone?: string;
  professionalEmail?: string;
  address?: CompanyAddress;
  isAdmin?: boolean;
  isDeveloper?: boolean; // Usuário Desenvolvedor com superpoderes absolutos (Carlos Miguel)
  canAccessPlatformBilling?: boolean; // Liberação de acesso ao módulo exclusivo de faturamento e faturas da plataforma
  canVerifyClients?: boolean; // Liberação de verificação e aprovação de clientes da plataforma
  parentAdminId?: string;
  plan: 'master_ilimitado' | 'enterprise_ilimitado' | 'pro_tributario' | 'starter_contabil' | 'free_trial' | 'consumo_relatorios' | 'personalizado_master' | 'parceiro_isento' | string;
  planStatus: 'active' | 'trial' | 'expired';
  expiresAt: string;
  queriesUsedThisMonth: number;
  maxQueriesPerMonth: number;
  isMaster?: boolean;
  permissions?: string[];
  viewMode?: AppViewMode;
  allowedModules?: PlanAllowedModules;
  allowedSubmodules?: Record<string, boolean>;
  maxCompaniesAllowed?: number;
  maxUsersAllowed?: number;
  isPartnerActive?: boolean;
  partnerStatus?: 'ativo' | 'inativo' | 'pendente';
  partnerCommissionRate?: number;
  partnerReferralCode?: string;
  partnerDiscountPercent?: number;
  partnerPixKey?: string;
  partnerPixKeyType?: 'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria';
  partnerBankName?: string;
  partnerActivatedByMaster?: boolean;
  partnerActivatedAt?: string;
  authSecurityMode?: AuthSecurityMode;
  twoFactorEnabled?: boolean;
  digitalCertificate?: DigitalCertificateInfo;
  mustChangePassword?: boolean;
  crcNumber?: string;
  oabNumber?: string;
  technicalRoleTitle?: string;
}

// Periodicidades Segregadas de Planos
export type PlanPeriodicity = 'mensal' | 'trimestral' | 'semestral' | 'anual';

// Planos Disponíveis na Plataforma
export interface PlanDefinition {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceQuarterly?: number; // Trimestral (3 meses com fidelidade)
  priceSemiannual?: number; // Semestral (6 meses com fidelidade)
  priceAnnual: number; // Anual (12 meses com fidelidade)
  promptPaymentDiscountPercent?: number; // Ex: 5% para pagamento até o vencimento
  annualCashDiscountPercent?: number; // Ex: 15% para pagamento à vista no plano anual
  terminationPenaltyPercent?: number; // Ex: 20% multa de rescisão antecipada sobre parcelas vincendas
  maxUsers: number;
  maxCompanies: number;
  maxQueriesPerMonth: number;
  features: string[];
  popular?: boolean;
  badge?: string;
  isCustom?: boolean;
  allowedModules?: PlanAllowedModules;
}

// Assinante / Plano Vendido com Contrato Robusto e Fidelidade
export interface SoldSubscription {
  id: string;
  customerName: string;
  customerEmail: string;
  customerDocument: string; // CPF ou CNPJ
  customerPhone: string;
  companyName: string;
  planId: string;
  planName: string;
  periodicity: PlanPeriodicity;
  pricePaid: number;
  originalPrice?: number;
  discountAppliedPercent?: number;
  billingMethod: 'boleto' | 'pix' | 'cartao' | 'isento';
  status: 'ativa' | 'pendente_pagamento' | 'atrasada' | 'cancelada';
  startDate: string; // Data de Início de Validade
  contractEndDate?: string; // Data de Término da Vigência / Fidelidade
  nextBillingDate: string;
  lastPaymentDate?: string;
  loyaltyMonths?: number; // 1, 3, 6, 12 meses
  terminationFinePercent?: number; // Multa de rescisão antecipada (padrão 20%)
  usersCount: number;
  maxUsersAllowed: number;
  maxCompaniesAllowed?: number;
  notes?: string;
  allowedModules?: PlanAllowedModules;
  // Aceite e Registro Legal do Contrato
  contractAccepted?: boolean;
  contractSignedAt?: string;
  contractIp?: string;
  contractNumber?: string;
  // Regras de Proporcionalidade & Vencimento Selecionado
  preferredDueDay?: number; // 5, 10, 15, 20, 25
  firstInvoiceDueDate?: string;
  isProRataApplied?: boolean;
  proRataDays?: number;
  proRataAmount?: number;
  customModularConfig?: {
    extraUsers: number;
    extraCompanies: number;
    activeModules: string[];
    baseMonthlyTotal?: number;
  };
  cancellationSettlement?: {
    cancelDate: string;
    finalBalance: number;
    penaltyFineAmount: number;
    proRataUsedAmount: number;
    refundAmount: number;
    summary: string;
  };
}

// Usuário do Sistema e Matriz de Permissões
export interface SystemUserPermission {
  canSimulateRegimes: boolean;
  canExportReports: boolean;
  canAccessAIAuditor: boolean;
  canEditCompanyData: boolean;
  canManageUsers: boolean;
  canViewFinancials: boolean;
  canAccessTaxReform: boolean;
  canAccessCFOP: boolean;
  canAccessSocios?: boolean;
  canAccessProjections?: boolean;
  canAccessFatorR?: boolean;
  canAccessPGDASImport?: boolean;
  canAccessBPO?: boolean;
  canAccessPlatformBilling?: boolean; // Módulo de faturamento da plataforma (exclusivo Desenvolvedor / liberados)
  canVerifyClients?: boolean; // Verificação e aprovação de clientes (exclusivo Desenvolvedor / liberados)
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'ativo' | 'bloqueado' | 'pendente_ativacao';
  isDeveloper?: boolean;
  canAccessPlatformBilling?: boolean;
  canVerifyClients?: boolean;
  companyName?: string;
  subscriptionId?: string;
  department?: string;
  createdAt: string;
  lastAccess?: string;
  permissions: SystemUserPermission;
  isPartnerActive?: boolean;
  partnerStatus?: 'ativo' | 'inativo' | 'pendente';
  partnerCommissionRate?: number;
  partnerReferralCode?: string;
  partnerDiscountPercent?: number;
  partnerPixKey?: string;
  partnerPixKeyType?: 'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria';
  partnerBankName?: string;
  partnerActivatedByMaster?: boolean;
  partnerActivatedAt?: string;
}

// Dados Bancários do Titular da Plataforma (para gerar Boletos e PIX)
export interface BankConfig {
  beneficiaryName: string;
  beneficiaryDocument: string;
  bankCode: string;
  bankName: string;
  agency: string;
  account: string;
  accountDigit: string;
  cedenteCode: string;
  carteira: string;
  pixKey: string;
  pixKeyType: 'cnpj' | 'cpf' | 'email' | 'telefone' | 'aleatoria';
  pixCity: string;
  instructions1: string;
  instructions2: string;
  instructions3: string;
}

// Fatura e Cobrança Emitida com Boleto e QR Code PIX
export interface BillingInvoice {
  id: string;
  subscriptionId: string;
  customerName: string;
  customerDocument: string;
  customerEmail: string;
  planName: string;
  amount: number;
  originalAmount?: number;
  discountAmount?: number;
  discountReason?: string;
  dueDate: string;
  issueDate: string;
  paymentMethod: 'boleto' | 'pix' | 'cartao' | 'isento';
  periodicity?: PlanPeriodicity;
  status: 'pago' | 'pendente' | 'vencido' | 'cancelado' | 'isento';
  paidAt?: string;
  linhaDigitavel: string;
  nossoNumero: string;
  codigoBarras: string;
  pixCopiaECola: string;
  txId: string;
  installments?: number;
  cardLast4?: string;
  cardBrand?: string;
  nfseNumero?: string;
  nfseChaveAcesso?: string;
}

// Nota Fiscal de Serviço Eletrônica - Padrão Nacional (ADN / Receita Federal / EC 132/23 Reforma Tributária)
export interface NfseNacionalData {
  numeroNfse: string;
  serie: string;
  chaveAcesso50: string;
  codigoVerificacao: string;
  dataEmissao: string;
  competencia: string;
  status: 'emitida' | 'cancelada' | 'processando';
  codigoTributacaoNacional: string;
  descricaoServico: string;
  valorServico: number;
  aliquotaIss: number;
  valorIss: number;
  issRetido: boolean;
  baseCalculo: number;
  descontoIncondicionado?: number;
  descontoCondicionado?: number;
  deducoesBaseCalculo?: number;
  retencoesFederais?: {
    pis: number;
    cofins: number;
    inss: number;
    irrf: number;
    csll: number;
    totalRetencoes: number;
  };
  valorLiquido: number;
  servico?: {
    codigoTributacaoNacional: string;
    codigoNbs?: string;
    itemLc116?: string;
    codigoServicoMunicipal?: string;
    localPrestacaoServico?: string;
    municipioIncidenciaIbge?: string;
    exigibilidadeIss?: string;
  };
  reformaTributaria?: {
    isReformaApplicable: boolean;
    aliquotaIbs: number;
    valorIbs: number;
    aliquotaCbs: number;
    valorCbs: number;
    totalIbsCbs: number;
    regimeEspecifico: string;
    splitPaymentActive: boolean;
    splitPaymentPixKey?: string;
    splitPaymentValorRetido?: number;
    splitPaymentValorLiquidoPrestador?: number;
  };
  prestador: {
    cnpj: string;
    razaoSocial: string;
    nomeFantasia?: string;
    inscricaoMunicipal?: string;
    inscricaoEstadual?: string;
    regimeEspecialTributacao?: string;
    optanteSimplesNacional?: boolean;
    incentivadorCultural?: boolean;
    endereco: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cep?: string;
    codigoIbgeMunicipio?: string;
    municipio: string;
    uf: string;
    telefone?: string;
    email?: string;
  };
  tomador: {
    tipoDocumento?: 'cnpj' | 'cpf' | 'nif_exterior';
    cpfCnpj: string;
    razaoSocial: string;
    inscricaoMunicipal?: string;
    email: string;
    telefone?: string;
    endereco?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cep?: string;
    codigoIbgeMunicipio?: string;
    municipio?: string;
    uf?: string;
  };
  linkDanfsePdf?: string;
  linkXmlNacional?: string;
}

export interface TaxAuditOpinion {
  title: string;
  date: string;
  statusBadge: {
    label: string;
    color: string;
    description: string;
  };
  executiveSummary: string;
  diagnosticoReceita: string;
  diagnosticoSocietario: string;
  diagnosticoFatorR: string;
  diagnosticoReformaTributaria: string;
  roadmapAcao: {
    phase: string;
    timeframe: string;
    title: string;
    description: string;
    actions: string[];
  }[];
  scenariosComparison: {
    cenarioA_Simples: { title: string; points: string[]; annualCost: number };
    cenarioB_Presumido: { title: string; points: string[]; annualCost: number };
    cenarioC_Reestruturacao: { title: string; points: string[]; annualCost: number };
  };
  legalReferences: { article: string; text: string; relevance: string }[];
}

export interface ObrigacaoFiscal {
  id: string;
  sigla: string;
  nome: string;
  esfera: 'Federal' | 'Estadual' | 'Municipal';
  setor: 'Fiscal' | 'Contábil' | 'Societário' | 'Departamento Pessoal' | 'Financeiro';
  diaEntregaSugerido: string;
  descricao: string;
  destinatario: string;
  penalidade: string;
  legislacaoBase: string;
  recorrencia: 'Mensal' | 'Trimestral' | 'Anual' | 'Eventual';
  alertaVencimentoDias?: number;
  status?: 'Pendente' | 'Entregue' | 'Atrasado';
}

// Estruturas Financeiras para Balancete e DRE
export interface FinancialAccountEntry {
  code: string;
  name: string;
  balanceInitial: number;
  debit: number;
  credit: number;
  balanceFinal: number;
  type: 'debit' | 'credit';
  category: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
}

export interface FinancialStatement {
  id: string;
  companyId: string;
  periodLabel: string; // Nome dado pelo usuário (ex: "Bimestre 1", "Semestre 2024", "Ano 2023")
  periodDate: string; // Data de referência para ordenação (YYYY-MM-DD)
  type: 'balancete' | 'dre';
  entries: FinancialAccountEntry[];
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  updatedAt: string;
}

export interface FinancialComparison {
  periodA: string;
  periodB: string;
  variations: {
    revenue: number; // Variação %
    expenses: number;
    profit: number;
    categoryVariations: Array<{
      category: string;
      diffPercent: number;
      diffAmount: number;
    }>;
  };
}

export type AppActiveTab = 
  | 'dashboard' 
  | 'auditoria_digital'
  | 'planejamento_tributario'
  | 'simples_hibrido'
  | 'financeiro_gerencial'
  | 'consultoria_fiscal'
  | 'legal_societario'
  | 'agenda_fiscal'
  | 'emissao_nfse'
  | 'nfse'
  | 'bpo_financeiro'
  | 'bpo'
  | 'conhecimentos' 
  | 'gestao_planos'
  | 'contratos'
  | 'parceiros'
  | 'portal_parceiro'
  | 'webmail_umbler'
  | 'econet_report'
  | 'vertice_documentos'
  // Sub-abas (usadas para navegação interna ou permissões específicas)
  | 'regimes' 
  | 'financeiro' 
  | 'balancete_dre'
  | 'projecao' 
  | 'historico' 
  | 'cfop' 
  | 'socios' 
  | 'fator_r' 
  | 'reforma' 
  | 'parecer'
  | 'ncm_consulta'
  | 'servicos_consulta'
  | 'societario'
  | 'consultas_fiscais'
  | 'consultas'
  | 'pgdas_import'
  | 'direito';

export interface PlanAllowedModules {
  dashboard?: boolean;
  auditoria_digital?: boolean;
  planejamento_tributario?: boolean;
  simples_hibrido?: boolean;
  financeiro_gerencial?: boolean;
  consultoria_fiscal?: boolean;
  legal_societario?: boolean;
  agenda_fiscal?: boolean;
  emissao_nfse?: boolean;
  nfse_module?: boolean;
  pgdas_import?: boolean;
  ai_auditor?: boolean;
  partner_portal?: boolean;
  partner_companies?: boolean;
  projected_simulation?: boolean;
  tax_calendar?: boolean;
  simulation_history?: boolean;
  legal_guide?: boolean;
  // Sub-módulos e Módulos específicos
  regimes?: boolean;
  financeiro?: boolean;
  balancete_dre?: boolean;
  projecao?: boolean;
  cfop?: boolean;
  cfop_segregation?: boolean;
  socios?: boolean;
  fator_r?: boolean;
  reforma?: boolean;
  econet_report?: boolean;
  ncm_consulta?: boolean;
  servicos_consulta?: boolean;
  societario?: boolean;
  bpo?: boolean;
  consultas?: boolean;
  conhecimentos?: boolean;
  direito?: boolean;
  reforma_tributaria?: boolean;
  parecer?: boolean;
  historico?: boolean;
  consultas_fiscais?: boolean;
}

export type PlatformPlan = 'starter' | 'pro' | 'enterprise' | 'master' | 'custom_master' | 'parceiro_isento';

// Estrutura de Inteligência e Tributação Completa de NCM
export interface NCMTaxData {
  ncm: string; // Ex: '2202.10.00'
  description: string;
  segment: string; // Ex: 'Bebidas Frias', 'Medicamentos', 'Autopeças', 'Alimentos Cesta Básica'
  capitulo: string; // Ex: 'Capítulo 22: Bebidas, Líquidos Alcoólicos e Vinagres'
  cest?: string; // Código Especificador da Substituição Tributária
  cstClassificacaoEspecial?: 'regra_geral' | 'monofasico_atacado_varejo' | 'aliquota_zero' | 'zona_franca_manaus' | 'aliquotas_reduziveis';
  
  // PIS / COFINS
  pisCofinsNature: 'monofasico' | 'aliquota_zero' | 'isento' | 'tributado_integral' | 'st';
  cstPisCofinsEntrada: string; // Ex: '70', '73', '50'
  cstPisCofinsSaida: string; // Ex: '04' (monofásico), '06' (alíquota zero), '01' (tributado)
  pisRatePresumed: number; // 0.65% ou 0%
  cofinsRatePresumed: number; // 3.0% ou 0%
  pisRateReal: number; // 1.65% ou 0%
  cofinsRateReal: number; // 7.6% ou 0%
  pisCofinsLegalBase: string; // Ex: 'Lei 10.147/2000, Art. 1º' ou 'Lei 10.925/2004'

  // ICMS & Substituição Tributária (ST) & DIFAL
  icmsST: boolean;
  icmsSTSegment?: string;
  mvaOriginal?: number; // % MVA Original (Ex: 40%)
  mvaAjustada4?: number; // % MVA Ajustada 4% Interestadual
  mvaAjustada12?: number; // % MVA Ajustada 12% Interestadual
  icmsInternalRate: number; // Alíquota Interna padrão (ex: 18%)
  difalRate?: number; // % Alíquota de Difal (ex: 6%, 12%)
  icmsBenefit?: 'reducao_base' | 'isencao' | 'nenhum';
  icmsBenefitDescription?: string;
  icmsLegalBase?: string; // Ex: 'Convênio ICMS 142/2018 e Art. 8º Lei Complementar 87/96'
  cBenef?: string; // Código de Benefício Fiscal conforme a UF (ex: PR800001, SP123456, RJ000001, ZFM999)
  icmsGuideCode?: string; // Código de Recolhimento da Guia de ICMS / GNRE / DARE (ex: 10008-0, 046-2, 110-3)

  // IRPJ & CSLL & IRRF Retenções
  irpjPresumptionRate?: number; // % Base de presunção IRPJ (8%, 16%, 32%)
  csllPresumptionRate?: number; // % Base de presunção CSLL (12%, 32%)
  irrfRate?: number; // % Alíquota IRRF Fonte (ex: 1.5%, 1.0%, 0%)

  // IPI
  ipiRate: number; // % Alíquota TIPI (ex: 0%, 5%, 15%)
  ipiCode?: string;
  ipiNT?: boolean; // Não tributado
  ipiCst?: string; // Ex: '50' (Tributada), '51' (Alíquota Zero), '52' (Isenta), '53' (Não Tributada)
  ipiCEnq?: string; // Código de Enquadramento IPI (ex: '999', '301', '101')

  // Códigos de Arrecadação / DARF Oficial
  darfCodes?: {
    pis: string; // Ex: '8109' (Normal) ou '6912' (Monofásico)
    cofins: string; // Ex: '2172' (Normal) ou '5856' (Monofásico)
    irpjPresumed: string; // Ex: '2089'
    csllPresumed: string; // Ex: '2372'
    irpjReal: string; // Ex: '5993'
    csllReal: string; // Ex: '2484'
    irrf: string; // Ex: '1708' ou '8045' ou '5952'
    ipi: string; // Ex: '5123' ou '1020'
  };

  // CST / CSOSN e Código de ST
  cstCsosnSt?: {
    cst: string; // Ex: '10', '30', '60', '70', '00'
    csosn: string; // Ex: '201', '202', '500', '102', '900'
    description: string;
  };

  // Simples Nacional & Segregação PGDAS-D (Art. 18, § 4º-A da LC 123/06)
  simplesSegregation: {
    segregateIcmsST: boolean;
    segregatePisCofinsMonofasico: boolean;
    anexo: SimplesAnexo;
    savingsExplanation: string;
  };

  // Matriz Completa de CFOPs Recomendadas
  cfopMatrix: {
    vendaInternaRevenda: string; // Ex: '5.405' (ST) ou '5.102' (Normal)
    vendaInterestadualRevenda: string; // Ex: '6.404' / '6.403' ou '6.102'
    vendaInternaIndustria: string; // Ex: '5.401' ou '5.101'
    vendaInterestadualIndustria: string; // Ex: '6.401' ou '6.101'
    compraRevendaInterna: string; // Ex: '1.403' ou '1.102'
    compraRevendaInterestadual: string; // Ex: '2.403' ou '2.102'
    devolucaoVendaInterna: string; // Ex: '1.411' ou '1.202'
    devolucaoVendaInterestadual: string; // Ex: '2.211' ou '2.202'
    transferenciaInterna: string; // Ex: '5.409' ou '5.152'
    transferenciaInterestadual: string; // Ex: '6.409' ou '6.152'
    importacaoDirect?: string; // Ex: '3.102' ou '3.101'
    exportacaoDirect?: string; // Ex: '7.102' ou '7.101'
  };

  // Reforma Tributária (EC 132/2023 & PLP 68/2024)
  reformaTributaria: {
    cbsIbsRegime: 'padrao' | 'cesta_basica_isenta' | 'reduzida_60' | 'imposto_seletivo' | 'diferenciado';
    estimatedRateCBS: number; // Ex: 8.8%
    estimatedRateIBS: number; // Ex: 17.7%
    hasImpostoSeletivo: boolean; // Imposto do Pecado
    impostoSeletivoRate?: number;
    cClassCBS_IBS?: string; // Código da Classificação CBS/IBS (PLP 68/2024 ex: '00001', '10002')
    notes: string;
  };

  practicalAdvice: string;
}

// Estrutura de Inteligência e Tributação de Códigos de Serviço (LC 116/2003, CTN & ISSQN)
export interface ServiceCodeTaxData {
  itemLC116: string; // Ex: '1.01', '7.02', '17.01', '4.01'
  ctnCode?: string; // Código de Tributação Nacional da NFS-e Padrão Nacional (Ex: '01.01.01.000', '07.02.01.000')
  description: string;
  groupName: string; // Ex: 'Serviços de Informática', 'Serviços de Saúde', 'Engenharia e Construção'
  cnaeCorrelates: string[];
  nbsCode?: string; // Nomenclatura Brasileira de Serviços (Ex: '1.0101.10.00')

  // ISSQN Municipal (LC 116/2003 & Código Tributário Municipal)
  issIncidenceRule: 'prestador' | 'local_prestacao'; // Art. 3º caput vs Art. 3º incisos I a XXV
  issRuleExplanation: string;
  issMinRate: number; // 2.0%
  issMaxRate: number; // 5.0%
  issStandardRate: number; // Ex: 3.0% ou 5.0%
  issWithholdingRule: string; // Regras de retenção na fonte pelo tomador municipal
  cpomRisk?: boolean; // Risco de dupla tributação / retenção por falta de CPOM/CEPOM em capitais

  // Códigos Oficiais de Recolhimento DARF e GPS
  darfCodes?: {
    csrf: string; // Ex: '5952' (PIS/COFINS/CSLL 4.65%)
    irrf: string; // Ex: '1708' (1.5%) ou '8045' ou '3208'
    inssGps: string; // Ex: '6190' / GPS '2631' (11% INSS Cessão Mão Obra)
    orgaosPublicos?: string; // Ex: '6147' / '8767' (IN RFB 1.234/2012)
  };

  // Regras para Exportação de Serviços
  exportTaxRules?: {
    isentISS: boolean; // Art. 2º, I da LC 116/2003 (Resultado no exterior)
    isentPisCofins: boolean; // Art. 149, § 2º, I da CF/88
    legalBasis: string;
  };

  // Simples Nacional (LC 123/2006)
  simplesNacional: {
    defaultAnexo: SimplesAnexo; // 'III', 'IV' ou 'V'
    subjectToFatorR: boolean;
    anexoWithFatorR?: 'III';
    anexoWithoutFatorR?: 'V';
    issDeductionInDAS: boolean;
    cppInsideDAS: boolean; // false para Anexo IV (20% CPP patronal recolhida por fora na DCTFWeb)
    guidance: string;
  };

  // Retenções Tributárias Federais na Fonte (Tomador PJ)
  federalWithholdings: {
    irrfRate: number; // Ex: 1.5% ou 1.0% ou 0%
    irrfLegalBase: string; // Art. 714 RIR/2018 ou Art. 649
    irrfDispensaSimples: boolean; // Dispensado se prestador for Simples Nacional (IN RFB 765/07)
    csrfRate: number; // 4.65% (PIS 0.65% + COFINS 3.0% + CSLL 1.0%)
    csrfLegalBase: string; // Art. 30 da Lei 10.833/2003
    csrfDispensaSimples: boolean; // Dispensado para Simples Nacional
    inssWithholdingRate: number; // 11% ou 3.5% (se desoneração da folha) ou 0%
    inssLegalBase: string; // Art. 31 da Lei 8.212/1991 e IN RFB 2.110/2022
    inssAppliesToSimples: boolean; // Aplica-se ao Simples quando enquadrado no Anexo IV ou com cessão de mão de obra
  };

  // Lucro Presumido e Lucro Real
  lucroPresumido: {
    irpjPresumptionRate: number; // 32% padrão, 16% transporte passageiros, 8% serviços hospitalares
    csllPresumptionRate: number; // 32% padrão, 12% hospitalares
    pisRate: number; // 0.65%
    cofinsRate: number; // 3.0%
    totalEffectiveTaxApprox: number; // Ex: 13.33% a 16.33%
    notes: string;
  };

  // Reforma Tributária (IBS/CBS - EC 132/2023)
  reformaTributaria: {
    treatment: 'padrao_26.5' | 'reduzida_60' | 'regime_profissoes_regulamentadas_30' | 'diferenciado';
    cbsIbsRate: number; // Ex: 26.5% ou 10.6% (com redução de 60%) ou 18.55% (redução 30%)
    notes: string;
  };

  practicalAdvice: string;
}

export type DashboardWidgetId = 
  | 'alertas_proativos'
  | 'kpi_rbt12'
  | 'kpi_fator_r'
  | 'kpi_aliquota'
  | 'kpi_economia'
  | 'central_relatorios'
  | 'trilha_auditoria'
  | 'chart_trajectory'
  | 'chart_regimes'
  | 'chart_economia'
  | 'parametros_fiscais'
  | 'pgdas_import'
  | 'checklist_lc123'
  | 'obrigacoes_status'
  | 'agenda_resumo';

export interface DashboardWidgetConfig {
  id: DashboardWidgetId;
  title: string;
  category: 'kpi' | 'chart' | 'tool' | 'banner';
  visible: boolean;
  order: number;
}

export interface GovApiHealthItem {
  id: string;
  name: string;
  serviceGroup: string;
  endpointUrl: string;
  status: 'online' | 'offline' | 'maintenance';
  statusCode: number;
  latencyMs: number;
  lastCheckedAt: string;
  environment: 'producao' | 'homologacao';
  description: string;
}

export type IntegrationSphere = 'federal' | 'estadual' | 'municipal' | 'bancario' | 'pericial' | 'comunicacao';
export type IntegrationType = 'rest' | 'soap' | 'mtls' | 'scraping_bot' | 'webhook' | 'smtp_imap' | 'ai_gemini';

export interface SystemIntegrationEntry {
  id: string;
  title: string;
  sphere: IntegrationSphere;
  organ: string;
  category: 'Societário & Juntas' | 'Fiscal & Tributário' | 'Prefeituras & Alvarás' | 'Certidões & Regularidade' | 'Bancário & Cobrança' | 'Comunicação & Mensageria' | 'Auditoria & IA';
  purpose: string;
  triggerEvent: string; // Qual evento ou preenchimento do sistema dispara essa busca
  reflectsIn: string; // Em qual módulo, tela, cálculo ou dossiê essa busca reflete
  endpointUrl: string;
  type: IntegrationType;
  authMethod: string;
  latencyMs: number;
  statusCode: number;
  status: 'online' | 'offline' | 'maintenance';
  lastPing?: string;
  isRealImplementationAvailable: boolean; // Se a consulta real/teste direto pode ser executada
  testActionName?: string; // Ex: 'Consultar CNPJ na Receita', 'Validar Simples', 'Testar DNS'
  inputParamPlaceholder?: string; // Ex: '04.921.832/0001-99', '80010-000', '12345678909'
  samplePayload?: Record<string, any>;
  vpsRequired?: boolean;
  manualActionRequired?: {
    isFullyAutomatedNow: boolean; // Se já opera 100% de forma pública/automática
    actionTitle: string; // Ex: 'Credenciamento Serpro / e-CNPJ A1 ICP-Brasil'
    actionStepByStep: string[]; // Passo a passo do que o usuário/proprietário precisa fazer manualmente
    requiredAccountOrService: string; // Ex: 'Portal Gov.br Empresa + Certificado Digital e-CNPJ A1'
    documentationUrl?: string;
  };
}

export type FilingStageStatus = 'pendente' | 'em_andamento' | 'aguardando_aprovacao' | 'deferido' | 'exigencia' | 'rejeitado';

export interface FilingOfficialDocument {
  id: string;
  title: string;
  type: 'viabilidade' | 'dbe' | 'fcn' | 'taxa_dare' | 'minuta_contrato' | 'certidao_registro' | 'cartao_cnpj';
  fileName: string;
  issuedAt: string;
  organ: string;
  status: 'valido' | 'pendente' | 'aprovado';
  protocolReference?: string;
  summary: string;
  fileSize?: string;
}

export interface FilingProcess {
  id: string;
  companyName: string;
  cnpj?: string;
  operationType: 'Abertura de Empresa' | 'Alteração de Matriz' | 'Transformação Societária' | 'Distrato Social';
  uf: string;
  municipio: string;
  protocolNumber: string; // Ex: PRP-2026/048192-1
  viabilityProtocol: string; // Ex: PRV-2026/001923
  dbeProtocol: string; // Ex: PR98124019
  fcnProtocol: string; // Ex: FCN-PR-89210
  currentStage: number; // 1 a 6
  status: 'aguardando_viabilidade' | 'viabilidade_deferida' | 'dbe_em_analise' | 'dbe_deferido' | 'aguardando_taxas' | 'taxas_pagas' | 'protocolado_junta' | 'em_exigencia' | 'deferido_registrado';
  createdAt: string;
  updatedAt: string;
  documents: FilingOfficialDocument[];
  feeDetails: {
    amount: number;
    barcode: string;
    pixPayload: string;
    paid: boolean;
    paidAt?: string;
  };
  logs: Array<{
    id: string;
    timestamp: string;
    stage: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  }>;
}



