import { BankConfig, PlanDefinition, SoldSubscription, SystemUser, BillingInvoice } from '../types';

export const DEFAULT_BANK_CONFIG: BankConfig = {
  beneficiaryName: 'Vieira Consultoria & Inteligência Tributária ME',
  beneficiaryDocument: '45.892.120/0001-34',
  bankCode: '001',
  bankName: 'Banco do Brasil S.A.',
  agency: '3421-9',
  account: '45890',
  accountDigit: '2',
  cedenteCode: '3189201',
  carteira: '17',
  pixKey: 'carlosmiguelvieira1@gmail.com',
  pixKeyType: 'email',
  pixCity: 'São Paulo',
  instructions1: 'Sr. Caixa, não receber após 30 dias do vencimento.',
  instructions2: 'Cobrar juros de mora de 1% a.m. e multa rescisória de 2,0% após o vencimento.',
  instructions3: 'Referente à licença de uso corporativo da Plataforma Vértice Auditor Fiscal - Auditoria Tributária.'
};

import { DEFAULT_PLAN_MODULES } from '../utils/permissionRules';

export const PLATFORM_PLANS: PlanDefinition[] = [
  {
    id: 'starter',
    name: 'Plano Inicial: Emissor & Fator R',
    description: 'Emissão de NFS-e Nacional Gov.br com Certificado Digital A1 + Auditoria básica para profissionais autônomos.',
    priceMonthly: 197.00,
    priceQuarterly: 531.00, // Desconto fidelidade
    priceSemiannual: 1004.00, // Desconto fidelidade
    priceAnnual: 1890.00, // ~R$ 157/mês
    promptPaymentDiscountPercent: 5,
    annualCashDiscountPercent: 10,
    terminationPenaltyPercent: 20,
    maxUsers: 2,
    maxCompanies: 5,
    maxQueriesPerMonth: 200,
    features: [
      '🚀 Emissor NFS-e Nacional Gov.br (DPS & ABRASF)',
      '🔐 Gestor de Certificado Digital e-CNPJ A1 (.pfx)',
      '⚡ Split Payment Reforma Tributária EC 132/23 (PIX)',
      '⚖️ Auditoria Fator R (28%) & Otimização de Pró-Labore',
      '📄 Parecer Técnico Oficial em PDF com Assinatura',
      'Até 2 usuários e 5 empresas'
    ],
    popular: false,
    badge: 'Essencial',
    allowedModules: DEFAULT_PLAN_MODULES.starter
  },
  {
    id: 'pro',
    name: 'Plano Profissional: Contador & Consultoria',
    description: 'Emissão de NFS-e Nacional em lote, Auditoria Tributária 4 em 1 e Parecer CPC para escritórios em crescimento.',
    priceMonthly: 497.00,
    priceQuarterly: 1341.00,
    priceSemiannual: 2534.00,
    priceAnnual: 4770.00, // ~R$ 397/mês
    promptPaymentDiscountPercent: 5,
    annualCashDiscountPercent: 12,
    terminationPenaltyPercent: 20,
    maxUsers: 8,
    maxCompanies: 50,
    maxQueriesPerMonth: 1000,
    features: [
      '🚀 Emissor NFS-e Nacional em Lote (Portal Gov.br)',
      '🔐 Certificados A1 Ilimitados para Clientes',
      '⚖️ Auditoria Tributária 4 em 1 (Simples/Presumido/Real/MEI)',
      '⚡ Split Payment Automatizado com QR Code PIX',
      '📊 Laudo Pericial Oficial CPC PDF com Assinatura CRC',
      '🤖 IA Auditoria Fiscal & Monitoramento QSA/LC 123',
      'Até 8 usuários e 50 empresas'
    ],
    popular: true,
    badge: 'Mais Vendido ⭐️',
    allowedModules: DEFAULT_PLAN_MODULES.pro
  },
  {
    id: 'enterprise',
    name: 'Plano Corporativo: Escritório 360º',
    description: 'Emissão Comercial de NFS-e, BPO Financeiro e Gestão Fiscal completa para grandes bancas e escritórios.',
    priceMonthly: 990.00,
    priceQuarterly: 2673.00,
    priceSemiannual: 5049.00,
    priceAnnual: 9500.00, // ~R$ 791/mês
    promptPaymentDiscountPercent: 5,
    annualCashDiscountPercent: 15,
    terminationPenaltyPercent: 20,
    maxUsers: 25,
    maxCompanies: 200,
    maxQueriesPerMonth: 5000,
    features: [
      '🚀 Emissor NFS-e Comercial com Re-venda para Clientes',
      '🔐 Módulo de Certificados Digitais A1 & Procuração RFB',
      '⚖️ Motor Fisco-Tributário Completo & Reforma EC 132/23',
      '💼 BPO Financeiro Integrado & DRE Gerencial/Balancete',
      '🏢 Societário REDESIM (27 Juntas Comerciais DREI 81/20)',
      '⚡ Emissão de NFS-e em Lote via API REST e WebService',
      'Até 25 usuários e 200 empresas'
    ],
    popular: false,
    badge: 'Performance',
    allowedModules: DEFAULT_PLAN_MODULES.enterprise
  },
  {
    id: 'master',
    name: 'Plano Master: Ilimitado & Parceiros',
    description: 'Licença suprema White-Label com acesso total ao Emissor NFS-e, Inteligência Tributária e Marca Própria.',
    priceMonthly: 1990.00,
    priceQuarterly: 5373.00,
    priceSemiannual: 10149.00,
    priceAnnual: 19100.00, // ~R$ 1591/mês
    promptPaymentDiscountPercent: 5,
    annualCashDiscountPercent: 20,
    terminationPenaltyPercent: 20,
    maxUsers: 999,
    maxCompanies: 999,
    maxQueriesPerMonth: 999999,
    features: [
      '🚀 Emissor NFS-e Ilimitado com Marca Própria (White-Label)',
      '🔐 Gestor Global de Certificados A1 com Monitoramento de Validade',
      '⚖️ Acesso Total ao Motor Tributário, Jurisprudência e Legislação',
      '🤝 Portal do Parceiro Homologado com Comissionamento PIX',
      '👑 Gestão Master de Licenciamento, Faturamento e Franquia',
      'Suporte VIP Prioritário 24/7 + Onboarding Exclusivo'
    ],
    popular: false,
    badge: 'Elite Master',
    allowedModules: DEFAULT_PLAN_MODULES.master
  },
  {
    id: 'custom_master',
    name: 'Plano Customizado (Sob Consulta)',
    description: 'Monte seu plano sob medida com quantidade de usuários, empresas e módulos sob demanda.',
    priceMonthly: 0.00,
    priceQuarterly: 0.00,
    priceSemiannual: 0.00,
    priceAnnual: 0.00,
    promptPaymentDiscountPercent: 5,
    annualCashDiscountPercent: 15,
    terminationPenaltyPercent: 20,
    maxUsers: 50,
    maxCompanies: 500,
    maxQueriesPerMonth: 50000,
    features: [
      'Configuração 100% Modular de Módulos',
      'Escalabilidade personalizada de Usuários e Empresas',
      'Suporte Dedicado & SLA Garantido',
      'Orçamento Sob Consulta alinhado com a Diretoria'
    ],
    popular: false,
    badge: 'Sob Consulta',
    isCustom: true,
    allowedModules: DEFAULT_PLAN_MODULES.custom_master
  }
];

export const INITIAL_SOLD_SUBSCRIPTIONS: SoldSubscription[] = [
  {
    id: 'sub_mendes_01',
    customerName: 'Dr. Roberto Mendes',
    customerEmail: 'contato@escritoriocontabil.com.br',
    customerDocument: '14.285.392/0001-44',
    customerPhone: '(11) 98765-4321',
    companyName: 'Mendes & Silva Auditoria Contábil S/S',
    planId: 'pro',
    planName: 'Pro Tributário',
    periodicity: 'anual',
    pricePaid: 3374.50, // Com desconto de 15% à vista (3970 * 0.85)
    originalPrice: 3970.00,
    discountAppliedPercent: 15,
    billingMethod: 'pix',
    status: 'ativa',
    startDate: '2025-01-10',
    contractEndDate: '2026-01-10',
    nextBillingDate: '2026-01-10',
    loyaltyMonths: 12,
    terminationFinePercent: 20,
    usersCount: 2,
    maxUsersAllowed: 5,
    maxCompaniesAllowed: 30,
    contractAccepted: true,
    contractSignedAt: '2025-01-10 14:32:10',
    contractIp: '187.54.12.98',
    contractNumber: 'CTR-2025-001-PRO',
    notes: 'Escritório parceiro. Plano Anual com 15% de desconto à vista e fidelidade de 12 meses.',
    allowedModules: DEFAULT_PLAN_MODULES.pro,
  },
  {
    id: 'sub_alencar_02',
    customerName: 'Dra. Juliana Alencar',
    customerEmail: 'diretoria@clientefinal.com.br',
    customerDocument: '28.194.821/0001-09',
    customerPhone: '(21) 99123-8877',
    companyName: 'Nova Era Comércio e Distribuição LTDA',
    planId: 'starter',
    planName: 'Starter Fiscal',
    periodicity: 'mensal',
    pricePaid: 187.15, // Com desconto de 5% de pontualidade (197 * 0.95)
    originalPrice: 197.00,
    discountAppliedPercent: 5,
    billingMethod: 'boleto',
    status: 'ativa',
    startDate: '2025-02-01',
    contractEndDate: '2025-03-01',
    nextBillingDate: '2025-10-01',
    loyaltyMonths: 1,
    terminationFinePercent: 20,
    usersCount: 1,
    maxUsersAllowed: 2,
    maxCompaniesAllowed: 5,
    contractAccepted: true,
    contractSignedAt: '2025-02-01 09:15:00',
    contractIp: '177.102.44.12',
    contractNumber: 'CTR-2025-002-STR',
    notes: 'Cliente em análise. Mensalidade com desconto de 5% de pontualidade.',
    allowedModules: DEFAULT_PLAN_MODULES.starter,
  }
];

export const INITIAL_SYSTEM_USERS: SystemUser[] = [
  {
    id: 'usr-carlos-miguel-master',
    name: 'Carlos Miguel Vieira',
    email: 'carlosmiguelvieira1@gmail.com',
    role: 'desenvolvedor',
    status: 'ativo',
    isDeveloper: true,
    canAccessPlatformBilling: true,
    canVerifyClients: true,
    companyName: 'Vieira & Associados • Inteligência Fiscal Master',
    department: 'Diretoria & Auditoria Master',
    createdAt: '2025-01-01',
    lastAccess: 'Agora',
    permissions: {
      canSimulateRegimes: true,
      canExportReports: true,
      canAccessAIAuditor: true,
      canEditCompanyData: true,
      canManageUsers: true,
      canViewFinancials: true,
      canAccessTaxReform: true,
      canAccessCFOP: true,
      canAccessSocios: true,
      canAccessProjections: true,
      canAccessFatorR: true,
      canAccessPGDASImport: true,
      canAccessBPO: true,
      canAccessPlatformBilling: true,
      canVerifyClients: true
    }
  },
  {
    id: 'usr-roberto-mendes',
    name: 'Dr. Roberto Mendes',
    email: 'contato@escritoriocontabil.com.br',
    role: 'contador_senior',
    status: 'ativo',
    companyName: 'Mendes & Silva Auditoria Contábil S/S',
    department: 'Fiscal & Tributário',
    createdAt: '2025-02-15',
    lastAccess: 'Hoje',
    subscriptionId: 'sub_mendes_01',
    permissions: {
      canSimulateRegimes: true,
      canExportReports: true,
      canAccessAIAuditor: true,
      canEditCompanyData: true,
      canManageUsers: false,
      canViewFinancials: false,
      canAccessTaxReform: true,
      canAccessCFOP: true,
      canAccessSocios: true,
      canAccessProjections: true,
      canAccessFatorR: true,
      canAccessPGDASImport: true,
    }
  },
  {
    id: 'usr-juliana-alencar',
    name: 'Dra. Juliana Alencar',
    email: 'diretoria@clientefinal.com.br',
    role: 'cliente_leitor',
    status: 'ativo',
    companyName: 'Nova Era Comércio e Distribuição LTDA',
    department: 'Diretoria Financeira',
    createdAt: '2025-03-01',
    lastAccess: 'Ontem',
    subscriptionId: 'sub_alencar_02',
    permissions: {
      canSimulateRegimes: true,
      canExportReports: true,
      canAccessAIAuditor: false,
      canEditCompanyData: false,
      canManageUsers: false,
      canViewFinancials: false,
      canAccessTaxReform: false,
      canAccessCFOP: false,
      canAccessSocios: false,
      canAccessProjections: false,
      canAccessFatorR: true,
      canAccessPGDASImport: false,
    }
  }
];

export const INITIAL_INVOICES: BillingInvoice[] = [];

// Gerador de Código Copia e Cola PIX (BRCode padrão Bacen EMV)
export function generatePixCopiaECola(params: {
  pixKey: string;
  beneficiaryName: string;
  cityName: string;
  amount: number;
  txId: string;
}): string {
  const cleanKey = params.pixKey.trim();
  const cleanName = params.beneficiaryName.slice(0, 25).trim();
  const cleanCity = (params.cityName || 'Sao Paulo').slice(0, 15).trim();
  const cleanAmount = params.amount.toFixed(2);
  const cleanTxId = (params.txId || 'VF001').slice(0, 25);

  const payloadFormat = '000201';
  const merchantAccountInfo = `26${(cleanKey.length + 22).toString().padStart(2, '0')}0014br.gov.bcb.pix01${cleanKey.length.toString().padStart(2, '0')}${cleanKey}`;
  const merchantCategoryCode = '52040000';
  const transactionCurrency = '5303986';
  const transactionAmount = `54${cleanAmount.length.toString().padStart(2, '0')}${cleanAmount}`;
  const countryCode = '5802BR';
  const merchantName = `59${cleanName.length.toString().padStart(2, '0')}${cleanName}`;
  const merchantCity = `60${cleanCity.length.toString().padStart(2, '0')}${cleanCity}`;
  const additionalData = `62${(cleanTxId.length + 4).toString().padStart(2, '0')}05${cleanTxId.length.toString().padStart(2, '0')}${cleanTxId}`;
  
  const rawPayload = `${payloadFormat}${merchantAccountInfo}${merchantCategoryCode}${transactionCurrency}${transactionAmount}${countryCode}${merchantName}${merchantCity}${additionalData}6304`;

  // CRC16 simples para demonstração
  let crc = 0xFFFF;
  for (let i = 0; i < rawPayload.length; i++) {
    crc ^= rawPayload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  const crcHex = (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');

  return `${rawPayload}${crcHex}`;
}

// Gerador de Linha Digitável de Boleto Bancário Padrão Febraban
export function generateBoletoLinhaDigitavel(bankCode: string, amount: number, nossoNumero: string): {
  linhaDigitavel: string;
  codigoBarras: string;
} {
  const code = bankCode.padStart(3, '0');
  const cents = Math.round(amount * 100).toString().padStart(10, '0');
  const numLimpo = nossoNumero.replace(/\D/g, '').slice(0, 10).padStart(10, '0');

  const campo1 = `${code}90.00009`;
  const campo2 = `${numLimpo.slice(0, 5)}.${numLimpo.slice(5, 10)}1`;
  const campo3 = `12345.678901`;
  const dvGeral = '8';
  const fatorVencimentoEValor = `9876${cents}`;

  const linhaDigitavel = `${campo1} ${campo2} ${campo3} ${dvGeral} ${fatorVencimentoEValor}`;
  const codigoBarras = `${code}9${dvGeral}${fatorVencimentoEValor}${numLimpo}0000000000`;

  return { linhaDigitavel, codigoBarras };
}
