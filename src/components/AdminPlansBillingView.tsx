import React, { useState, useEffect, useMemo } from 'react';
import {
  Crown,
  Users,
  DollarSign,
  CreditCard,
  Building2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Plus,
  Filter,
  ArrowUpRight,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Settings,
  Barcode,
  QrCode,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Eye,
  FileText,
  Sparkles,
  TrendingUp,
  Percent,
  Check,
  Save,
  RotateCcw,
  Smartphone,
  Mail,
  Phone,
  UserCheck,
  UserX,
  Layers,
  ChevronRight,
  Award,
  Copy,
  ExternalLink,
  Handshake,
  RefreshCw,
  Key
} from 'lucide-react';
import { NfseNacionalModal } from './NfseNacionalModal';
import { AdminIntegrationDashboard } from './AdminIntegrationDashboard';
import { NFSEServiceModule } from './NFSEServiceModule';
import { 
  SoldSubscription, 
  SystemUser, 
  BankConfig, 
  BillingInvoice, 
  PlanDefinition,
  PlatformPlan, 
  AuthUser,
  SystemUserPermission,
  PlanAllowedModules,
  PlanPeriodicity,
  PlanActivationRequest
} from '../types';
import { 
  DEFAULT_BANK_CONFIG, 
  PLATFORM_PLANS, 
  INITIAL_SOLD_SUBSCRIPTIONS, 
  INITIAL_SYSTEM_USERS, 
  INITIAL_INVOICES,
  generatePixCopiaECola,
  generateBoletoLinhaDigitavel
} from '../data/adminBillingData';
import { AuthService } from '../utils/authService';
import { DEFAULT_PLAN_MODULES } from '../utils/permissionRules';
import { BoletoPixModal } from './BoletoPixModal';
import { ContractViewerModal } from './ContractViewerModal';
import { SystemOrganogramPresentation } from './SystemOrganogramPresentation';
import { CustomPlanBuilderModal } from './CustomPlanBuilderModal';
import { CancellationSettlementModal } from './CancellationSettlementModal';
import { AdminCertificatesTab } from './AdminCertificatesTab';
import { sendWelcomeEmail } from '../utils/emailService';
import { calculateProRataSubscription, CancellationSettlementResult } from '../utils/customPlanCalculator';

interface AdminPlansBillingViewProps {
  currentUser: AuthUser;
}

export const AdminPlansBillingView: React.FC<AdminPlansBillingViewProps> = ({
  currentUser
}) => {
  // VERIFICAÇÃO DE PERMISSÕES RBAC REFINADAS
  const isDeveloper = useMemo(() => {
    return (
      currentUser.role === 'desenvolvedor' ||
      currentUser.isDeveloper === true ||
      currentUser.email.toLowerCase() === 'carlosmiguelvieira1@gmail.com'
    );
  }, [currentUser]);

  const hasBillingAccess = useMemo(() => {
    return isDeveloper || currentUser.canAccessPlatformBilling === true;
  }, [isDeveloper, currentUser.canAccessPlatformBilling]);

  const hasClientVerificationAccess = useMemo(() => {
    return isDeveloper || currentUser.canVerifyClients === true;
  }, [isDeveloper, currentUser.canVerifyClients]);

  // SUB-ABAS DO PAINEL DO GESTOR
  const [activeSubTab, setActiveSubTab] = useState<'organograma' | 'solicitacoes' | 'metricas' | 'assinantes' | 'usuarios' | 'faturas' | 'banco' | 'planos' | 'integracao_governamental' | 'nfse' | 'certificados'>('solicitacoes');

  // ESTADO DE SOLICITAÇÕES DE ATIVAÇÃO DE PLANOS (NOTIFICAÇÃO MASTER)
  const [activationRequests, setActivationRequests] = useState<PlanActivationRequest[]>(() => {
    return AuthService.getPlanActivationRequests();
  });

  const refreshActivationRequests = () => {
    setActivationRequests(AuthService.getPlanActivationRequests());
  };

  useEffect(() => {
    const handleRequestChange = () => {
      refreshActivationRequests();
    };
    window.addEventListener('vertice_plan_request_created', handleRequestChange);
    window.addEventListener('vertice_plan_request_updated', handleRequestChange);
    return () => {
      window.removeEventListener('vertice_plan_request_created', handleRequestChange);
      window.removeEventListener('vertice_plan_request_updated', handleRequestChange);
    };
  }, []);

  const pendingRequestsCount = useMemo(() => {
    return activationRequests.filter(r => r.status === 'pendente_aprovacao' || r.status === 'pendente_aprovacao_master').length;
  }, [activationRequests]);

  // ESTADOS DE DADOS COM PERSISTÊNCIA EM LOCALSTORAGE E HIGIENIZAÇÃO RIGOROSA
  const [subscriptions, setSubscriptions] = useState<SoldSubscription[]>(() => {
    const saved = localStorage.getItem('sna_admin_subscriptions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filtrar qualquer resíduo de dados simulados/falsos antigos
          const cleaned = parsed.filter((sub: SoldSubscription) => {
            if (!sub || !sub.id) return false;
            const id = (sub.id || '').toLowerCase();
            const email = (sub.customerEmail || '').toLowerCase();
            const name = (sub.customerName || '').toLowerCase();
            const company = (sub.companyName || '').toLowerCase();
            const isLegacyMock = 
              id.startsWith('sub-00') ||
              email.includes('vasconcelos') ||
              email.includes('machadocontabil') ||
              email.includes('aliancacontabil') ||
              email.includes('nogueirapericias') ||
              email.includes('deltaauditores') ||
              name.includes('camila') ||
              name.includes('roberto silveira') ||
              name.includes('aliança') ||
              name.includes('marcelo pires') ||
              name.includes('delta') ||
              company.includes('vasconcelos') ||
              company.includes('aliança') ||
              company.includes('nogueira') ||
              company.includes('delta');
            return !isLegacyMock;
          });
          return cleaned;
        }
      } catch (e) {}
    }
    return INITIAL_SOLD_SUBSCRIPTIONS;
  });

  const [systemUsers, setSystemUsers] = useState<SystemUser[]>(() => {
    const saved = localStorage.getItem('sna_admin_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter((u: SystemUser) => {
            if (!u || !u.id) return false;
            const email = (u.email || '').toLowerCase();
            if (email === 'carlosmiguelvieira1@gmail.com') return true;
            const isLegacyMock = 
              u.id.startsWith('usr-00') ||
              email.includes('vasconcelos') ||
              email.includes('machadocontabil') ||
              email.includes('aliancacontabil') ||
              email.includes('deltaauditores');
            return !isLegacyMock;
          });
          const hasMaster = cleaned.some(u => u.email === 'carlosmiguelvieira1@gmail.com');
          if (!hasMaster) {
            return [...INITIAL_SYSTEM_USERS, ...cleaned];
          }
          return cleaned;
        }
      } catch (e) {}
    }
    return INITIAL_SYSTEM_USERS;
  });

  const [invoices, setInvoices] = useState<BillingInvoice[]>(() => {
    const saved = localStorage.getItem('sna_admin_invoices');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter((inv: BillingInvoice) => {
            if (!inv || !inv.id) return false;
            const id = (inv.id || '').toLowerCase();
            const email = (inv.customerEmail || '').toLowerCase();
            const isLegacyMock = 
              id.startsWith('fat-2026-090') ||
              email.includes('vasconcelos') ||
              email.includes('machadocontabil') ||
              email.includes('aliancacontabil') ||
              email.includes('nogueirapericias') ||
              email.includes('deltaauditores');
            return !isLegacyMock;
          });
          return cleaned;
        }
      } catch (e) {}
    }
    return INITIAL_INVOICES;
  });

  const [bankConfig, setBankConfig] = useState<BankConfig>(() => {
    const saved = localStorage.getItem('sna_admin_bank_config');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_BANK_CONFIG;
  });

  const [plans, setPlans] = useState<PlanDefinition[]>(() => {
    const saved = localStorage.getItem('sna_admin_plans');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return PLATFORM_PLANS;
  });

  // Salvar em localStorage quando houver mudanças
  useEffect(() => {
    localStorage.setItem('sna_admin_subscriptions', JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    localStorage.setItem('sna_admin_users', JSON.stringify(systemUsers));
  }, [systemUsers]);

  useEffect(() => {
    localStorage.setItem('sna_admin_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('sna_admin_bank_config', JSON.stringify(bankConfig));
  }, [bankConfig]);

  useEffect(() => {
    localStorage.setItem('sna_admin_plans', JSON.stringify(plans));
  }, [plans]);

  // ESTADOS DE FILTROS & MODAIS
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todas' | 'ativa' | 'pendente_pagamento' | 'atrasada' | 'cancelada'>('todas');
  
  // Modal de Boleto / PIX
  const [selectedInvoice, setSelectedInvoice] = useState<BillingInvoice | null>(null);
  const [isBoletoPixModalOpen, setIsBoletoPixModalOpen] = useState(false);

  // Modal de NFS-e Nacional
  const [selectedNfseInvoice, setSelectedNfseInvoice] = useState<BillingInvoice | null>(null);
  const [isNfseModalOpen, setIsNfseModalOpen] = useState(false);

  // Modal de Contrato Jurídico com CDC & Assinatura
  const [selectedContractSub, setSelectedContractSub] = useState<SoldSubscription | null>(null);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);

  // Modal de Nova Venda / Assinante
  const [isNewSubscriptionModalOpen, setIsNewSubscriptionModalOpen] = useState(false);
  const [newSubCustomerName, setNewSubCustomerName] = useState('');
  const [newSubEmail, setNewSubEmail] = useState('');
  const [newSubDocument, setNewSubDocument] = useState('');
  const [newSubPhone, setNewSubPhone] = useState('');
  const [newSubCompany, setNewSubCompany] = useState('');
  const [newSubPlanId, setNewSubPlanId] = useState('pro');
  const [newSubPeriodicity, setNewSubPeriodicity] = useState<PlanPeriodicity>('mensal');
  const [newSubPreferredDueDay, setNewSubPreferredDueDay] = useState<number>(10);
  const [newSubMethod, setNewSubMethod] = useState<'boleto' | 'pix' | 'cartao'>('pix');
  const [newSubApplyPromptDiscount, setNewSubApplyPromptDiscount] = useState(false);
  const [newSubApplyCashDiscount, setNewSubApplyCashDiscount] = useState(false);

  // Modais de Customização Sob Medida & Rescisão com Pro-rata e CDC
  const [isCustomPlanModalOpen, setIsCustomPlanModalOpen] = useState(false);
  const [customPlanSubTarget, setCustomPlanSubTarget] = useState<SoldSubscription | null>(null);
  const [isCancellationModalOpen, setIsCancellationModalOpen] = useState(false);
  const [cancellationSubTarget, setCancellationSubTarget] = useState<SoldSubscription | null>(null);

  // Modal de Novo Usuário / Edição de Permissões
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [userFormName, setUserFormName] = useState('');
  const [userFormEmail, setUserFormEmail] = useState('');
  const [userFormRole, setUserFormRole] = useState<SystemUser['role']>('contador_senior');
  const [userFormCompany, setUserFormCompany] = useState('');
  const [userFormDepartment, setUserFormDepartment] = useState('');
  // Campos do Programa de Parceiros (Exclusivo Master)
  const [userFormIsPartnerActive, setUserFormIsPartnerActive] = useState<boolean>(false);
  const [userFormPartnerReferralCode, setUserFormPartnerReferralCode] = useState<string>('');
  const [userFormPartnerCommissionRate, setUserFormPartnerCommissionRate] = useState<number>(20);
  const [userFormPartnerDiscountPercent, setUserFormPartnerDiscountPercent] = useState<number>(10);
  const [userFormPartnerPixKey, setUserFormPartnerPixKey] = useState<string>('');
  const [userFormPartnerPixKeyType, setUserFormPartnerPixKeyType] = useState<'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria'>('email');
  const [userFormPartnerBankName, setUserFormPartnerBankName] = useState<string>('Banco do Brasil S.A.');
  const [userFormPermissions, setUserFormPermissions] = useState<SystemUserPermission>({
    canSimulateRegimes: true,
    canExportReports: true,
    canAccessAIAuditor: true,
    canEditCompanyData: true,
    canManageUsers: false,
    canViewFinancials: false,
    canAccessTaxReform: true,
    canAccessCFOP: true
  });

  // Modal de Exclusão com Rigor de Clientes / Operadores
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    type: 'subscription' | 'user';
    id: string;
    title: string;
    name: string;
    detail: string;
  }>({
    isOpen: false,
    type: 'subscription',
    id: '',
    title: '',
    name: '',
    detail: ''
  });

  // Modal de Edição / Criação de Planos Customizados pelo Master
  const [isPlanEditModalOpen, setIsPlanEditModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanDefinition | null>(null);
  const [planFormName, setPlanFormName] = useState('');
  const [planFormBadge, setPlanFormBadge] = useState('');
  const [planFormDescription, setPlanFormDescription] = useState('');
  const [planFormPriceMonthly, setPlanFormPriceMonthly] = useState<number>(397);
  const [planFormPriceQuarterly, setPlanFormPriceQuarterly] = useState<number>(1130);
  const [planFormPriceSemiannual, setPlanFormPriceSemiannual] = useState<number>(2140);
  const [planFormPriceAnnual, setPlanFormPriceAnnual] = useState<number>(3970);
  const [planFormPromptDiscountPercent, setPlanFormPromptDiscountPercent] = useState<number>(5);
  const [planFormAnnualCashDiscountPercent, setPlanFormAnnualCashDiscountPercent] = useState<number>(15);
  const [planFormTerminationPenaltyPercent, setPlanFormTerminationPenaltyPercent] = useState<number>(20);
  const [planFormMaxUsers, setPlanFormMaxUsers] = useState<number>(5);
  const [planFormUnlimitedUsers, setPlanFormUnlimitedUsers] = useState<boolean>(false);
  const [planFormMaxCompanies, setPlanFormMaxCompanies] = useState<number>(30);
  const [planFormUnlimitedCompanies, setPlanFormUnlimitedCompanies] = useState<boolean>(false);
  const [planFormAllowedModules, setPlanFormAllowedModules] = useState<PlanAllowedModules>({
    dashboard: true,
    regimes: true,
    financeiro: false,
    cfop: true,
    fator_r: true,
    socios: true,
    projecao: true,
    reforma: true,
    parecer: true,
    historico: true,
    bpo: false,
    consultas: true,
    ai_auditor: true,
    pgdas_import: true,
    agenda_fiscal: true,
    balancete_dre: false,
    consultas_fiscais: true,
    auditoria_digital: true,
    planejamento_tributario: true,
    financeiro_gerencial: true,
    consultoria_fiscal: true,
    legal_societario: true
  });

  // Mensagens de feedback
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  // CÁLCULO DE MÉTRICAS GERAIS (MRR, ARR, USUÁRIOS)
  const metrics = useMemo(() => {
    const activeSubs = subscriptions.filter(s => s.status === 'ativa');
    const pendingSubs = subscriptions.filter(s => s.status === 'pendente_pagamento');
    const overdueSubs = subscriptions.filter(s => s.status === 'atrasada');

    // MRR: Soma do valor mensal de assinaturas ativas (se anual, divide por 12)
    const mrr = activeSubs.reduce((acc, sub) => {
      const monthlyVal = sub.periodicity === 'anual' ? (sub.pricePaid / 12) : sub.pricePaid;
      return acc + monthlyVal;
    }, 0);

    const arr = mrr * 12;

    const totalActiveUsers = systemUsers.filter(u => u.status === 'ativo').length;
    const totalLicensedSeats = subscriptions.reduce((acc, s) => acc + (s.maxUsersAllowed === 999 ? 50 : s.maxUsersAllowed), 0);

    const complianceRate = subscriptions.length > 0 
      ? (activeSubs.length / subscriptions.length) * 100 
      : 100;

    const overdueAmount = overdueSubs.reduce((acc, s) => acc + s.pricePaid, 0);

    const averageTicket = activeSubs.length > 0 ? (mrr / activeSubs.length) : 0;

    return {
      mrr,
      arr,
      totalActiveSubs: activeSubs.length,
      pendingCount: pendingSubs.length,
      overdueCount: overdueSubs.length,
      overdueAmount,
      totalActiveUsers,
      totalLicensedSeats,
      complianceRate,
      averageTicket
    };
  }, [subscriptions, systemUsers]);

  // FILTRAGEM DE ASSINANTES
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(sub => {
      const matchesSearch = 
        sub.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.customerDocument.includes(searchTerm) ||
        sub.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'todas' || sub.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [subscriptions, searchTerm, statusFilter]);

  // AÇÕES: ABRIR COBRANÇA PARA ASSINANTE COM QR CODE & BOLETO BASEADO NO PLANO ATIVO
  const handleOpenBillingForSub = (sub: SoldSubscription) => {
    // Buscar fatura mais recente ou gerar uma
    let inv = invoices.find(i => i.subscriptionId === sub.id && i.status !== 'cancelado');
    const today = new Date().toISOString().split('T')[0];
    const due = sub.nextBillingDate || today;
    const amount = sub.pricePaid;

    if (!inv) {
      // Cria nova fatura sob demanda com valor exato do plano ativo do cliente
      const nossoNum = `00000${Math.floor(10000 + Math.random() * 90000)}-${Math.floor(1 + Math.random() * 9)}`;
      const { linhaDigitavel, codigoBarras } = generateBoletoLinhaDigitavel(bankConfig.bankCode, amount, nossoNum);
      const txId = `FAT-${Date.now().toString().slice(-6)}`;
      const pixCopiaECola = generatePixCopiaECola({
        pixKey: bankConfig.pixKey,
        beneficiaryName: bankConfig.beneficiaryName,
        cityName: bankConfig.pixCity,
        amount,
        txId
      });

      inv = {
        id: `FAT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        subscriptionId: sub.id,
        customerName: sub.customerName,
        customerDocument: sub.customerDocument,
        customerEmail: sub.customerEmail,
        planName: sub.planName,
        amount,
        originalAmount: sub.originalPrice || sub.pricePaid,
        dueDate: due,
        issueDate: today,
        paymentMethod: sub.billingMethod === 'cartao' ? 'pix' : sub.billingMethod,
        status: sub.status === 'ativa' ? 'pago' : 'pendente',
        periodicity: sub.periodicity,
        linhaDigitavel,
        nossoNumero: nossoNum,
        codigoBarras,
        pixCopiaECola,
        txId
      };
      setInvoices(prev => [inv!, ...prev]);
    } else {
      // Garantir sincronização estrita do valor do QR Code e boleto com o valor do plano ativo do cliente
      const nossoNum = inv.nossoNumero || `00000${Math.floor(10000 + Math.random() * 90000)}-${Math.floor(1 + Math.random() * 9)}`;
      const { linhaDigitavel, codigoBarras } = generateBoletoLinhaDigitavel(bankConfig.bankCode, amount, nossoNum);
      const txId = inv.txId || `FAT-${Date.now().toString().slice(-6)}`;
      const pixCopiaECola = generatePixCopiaECola({
        pixKey: bankConfig.pixKey,
        beneficiaryName: bankConfig.beneficiaryName,
        cityName: bankConfig.pixCity,
        amount,
        txId
      });

      inv = {
        ...inv,
        amount,
        originalAmount: sub.originalPrice || inv.originalAmount || amount,
        periodicity: sub.periodicity,
        customerName: sub.customerName,
        customerDocument: sub.customerDocument,
        customerEmail: sub.customerEmail,
        planName: sub.planName,
        linhaDigitavel,
        codigoBarras,
        pixCopiaECola,
        paymentMethod: inv.paymentMethod || (sub.billingMethod === 'cartao' ? 'pix' : sub.billingMethod)
      };

      setInvoices(prev => prev.map(item => item.id === inv!.id ? inv! : item));
    }

    setSelectedInvoice(inv);
    setIsBoletoPixModalOpen(true);
  };

  // AÇÕES: ABRIR CONTRATO JURÍDICO PARA O ASSINANTE
  const handleOpenContractForSub = (sub: SoldSubscription) => {
    setSelectedContractSub(sub);
    setIsContractModalOpen(true);
  };

  // AÇÕES: REGISTRAR ACEITE ELETRÔNICO DO CONTRATO
  const handleConfirmContractAcceptance = (subId: string, ip: string) => {
    const nowStr = new Date().toLocaleString('pt-BR');
    setSubscriptions(prev => prev.map(s => {
      if (s.id === subId) {
        return {
          ...s,
          contractAccepted: true,
          contractSignedAt: nowStr,
          contractIp: ip
        };
      }
      return s;
    }));
    showToast('Aceite eletrônico do contrato registrado com validade jurídica.');
  };

  // AÇÃO: BAIXA MANUAL / CONFIRMAR PAGAMENTO DE FATURA
  const handleMarkInvoiceAsPaid = (invoiceId: string) => {
    const now = new Date().toLocaleString('pt-BR');
    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        return {
          ...inv,
          status: 'pago',
          paidAt: now
        };
      }
      return inv;
    }));

    // Se estiver associado a uma assinatura, ativa-a
    const inv = invoices.find(i => i.id === invoiceId);
    if (inv && inv.subscriptionId) {
      setSubscriptions(prev => prev.map(sub => {
        if (sub.id === inv.subscriptionId) {
          // Atualiza próximo vencimento para +30 dias
          const nextDate = new Date();
          nextDate.setDate(nextDate.getDate() + (sub.periodicity === 'anual' ? 365 : 30));
          return {
            ...sub,
            status: 'ativa',
            lastPaymentDate: now.split(' ')[0],
            nextBillingDate: nextDate.toISOString().split('T')[0]
          };
        }
        return sub;
      }));
    }

    showToast('Pagamento confirmado com sucesso! A assinatura do cliente foi liberada.');
  };

  // AÇÃO: ALTERAR STATUS DA ASSINATURA (BLOQUEAR/ATIVAR)
  const handleToggleSubStatus = (subId: string) => {
    setSubscriptions(prev => prev.map(sub => {
      if (sub.id === subId) {
        const newStatus = sub.status === 'ativa' ? 'atrasada' : 'ativa';
        return { ...sub, status: newStatus };
      }
      return sub;
    }));
    showToast('Status da assinatura atualizado com sucesso.');
  };

  // AÇÃO: CRIAR NOVA VENDA / ASSINANTE COM PLANO, PERIODICIDADE, PRO-RATA E CONTRATO
  const handleCreateSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubCustomerName || !newSubEmail) {
      alert('Preencha ao menos Nome e E-mail do cliente.');
      return;
    }

    const selectedPlan = plans.find(p => p.id === newSubPlanId) || plans[1];
    
    // Cálculo do valor base de acordo com a periodicidade
    let basePrice = selectedPlan.priceMonthly;
    if (newSubPeriodicity === 'trimestral') {
      basePrice = selectedPlan.priceQuarterly || (selectedPlan.priceMonthly * 3 * 0.95);
    } else if (newSubPeriodicity === 'semestral') {
      basePrice = selectedPlan.priceSemiannual || (selectedPlan.priceMonthly * 6 * 0.90);
    } else if (newSubPeriodicity === 'anual') {
      basePrice = selectedPlan.priceAnnual;
    }

    // Aplicação dos descontos pactuados
    let appliedDiscountPercent = 0;
    if (newSubPeriodicity === 'anual' && newSubApplyCashDiscount) {
      appliedDiscountPercent = selectedPlan.annualCashDiscountPercent || 15;
    } else if (newSubApplyPromptDiscount) {
      appliedDiscountPercent = selectedPlan.promptPaymentDiscountPercent || 5;
    }

    const fullCyclePrice = Math.round(basePrice * (1 - appliedDiscountPercent / 100) * 100) / 100;
    const subId = `sub-${Date.now().toString().slice(-4)}`;
    const today = new Date().toISOString().split('T')[0];
    
    // Fidelidade e prazos
    const loyaltyMonths = newSubPeriodicity === 'anual' ? 12 : newSubPeriodicity === 'semestral' ? 6 : newSubPeriodicity === 'trimestral' ? 3 : 1;
    const endContractObj = new Date(today + 'T12:00:00');
    endContractObj.setMonth(endContractObj.getMonth() + loyaltyMonths);
    const contractEndDate = endContractObj.toISOString().split('T')[0];

    // Cálculo Pro-rata se contratação não for no 1º dia do mês
    const proRataCalculation = calculateProRataSubscription({
      monthlyPrice: selectedPlan.priceMonthly,
      periodicity: newSubPeriodicity,
      finalCyclePrice: fullCyclePrice,
      startDate: today,
      preferredDueDay: newSubPreferredDueDay,
    });

    const firstInvoiceDueDate = proRataCalculation.firstInvoiceDueDate;
    const invoiceAmount = proRataCalculation.firstInvoiceAmount;
    const isProRataApplied = proRataCalculation.isProRataApplied;

    const contractNumber = `CTR-${today.slice(0, 4)}-${Date.now().toString().slice(-4)}-${selectedPlan.name.slice(0, 3).toUpperCase()}`;

    const newSub: SoldSubscription = {
      id: subId,
      customerName: newSubCustomerName,
      customerEmail: newSubEmail,
      customerDocument: newSubDocument || '00.000.000/0001-00',
      customerPhone: newSubPhone || '(11) 99999-9999',
      companyName: newSubCompany || newSubCustomerName,
      planId: selectedPlan.id,
      planName: selectedPlan.name,
      periodicity: newSubPeriodicity,
      preferredDueDay: newSubPreferredDueDay,
      pricePaid: fullCyclePrice,
      originalPrice: basePrice,
      discountAppliedPercent: appliedDiscountPercent,
      billingMethod: newSubMethod,
      status: 'pendente_pagamento',
      startDate: today,
      firstInvoiceDueDate,
      nextBillingDate: firstInvoiceDueDate,
      contractEndDate,
      loyaltyMonths,
      terminationFinePercent: selectedPlan.terminationPenaltyPercent || 20,
      contractAccepted: false,
      contractNumber,
      usersCount: 1,
      maxUsersAllowed: selectedPlan.maxUsers,
      maxCompaniesAllowed: selectedPlan.maxCompanies,
      isProRataApplied,
      proRataAmount: isProRataApplied ? invoiceAmount : undefined,
      notes: `Assinatura criada via Painel do Gestor. Vencimento: Dia ${newSubPreferredDueDay}. Fidelidade: ${loyaltyMonths}m. Pro-rata 1ª fatura: R$ ${invoiceAmount.toFixed(2)}.`
    };

    // Gerar fatura com Boleto e PIX para o novo cliente com o valor apurado (com pro-rata se aplicável)
    const nossoNum = `00000${Math.floor(10000 + Math.random() * 90000)}-${Math.floor(1 + Math.random() * 9)}`;
    const { linhaDigitavel, codigoBarras } = generateBoletoLinhaDigitavel(bankConfig.bankCode, invoiceAmount, nossoNum);
    const txId = `FAT-${Date.now().toString().slice(-6)}`;
    const pixCopiaECola = generatePixCopiaECola({
      pixKey: bankConfig.pixKey,
      beneficiaryName: bankConfig.beneficiaryName,
      cityName: bankConfig.pixCity,
      amount: invoiceAmount,
      txId
    });

    const newInvoice: BillingInvoice = {
      id: `FAT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      subscriptionId: subId,
      customerName: newSubCustomerName,
      customerDocument: newSubDocument || '00.000.000/0001-00',
      customerEmail: newSubEmail,
      planName: selectedPlan.name,
      amount: invoiceAmount,
      originalAmount: basePrice,
      periodicity: newSubPeriodicity,
      dueDate: firstInvoiceDueDate,
      issueDate: today,
      paymentMethod: newSubMethod,
      status: 'pendente',
      linhaDigitavel,
      nossoNumero: nossoNum,
      codigoBarras,
      pixCopiaECola,
      txId
    };

    // Criar também o usuário administrador do cliente
    const newSystemUser: SystemUser = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: newSubCustomerName,
      email: newSubEmail,
      role: 'contador_senior',
      status: 'ativo',
      companyName: newSubCompany || newSubCustomerName,
      subscriptionId: subId,
      department: 'Diretoria / Fiscal',
      createdAt: today,
      lastAccess: 'Pendente primeiro login',
      permissions: {
        canSimulateRegimes: true,
        canExportReports: true,
        canAccessAIAuditor: selectedPlan.id !== 'starter',
        canEditCompanyData: true,
        canManageUsers: false,
        canViewFinancials: selectedPlan.id === 'enterprise' || selectedPlan.id === 'master',
        canAccessTaxReform: true,
        canAccessCFOP: true
      }
    };

    setSubscriptions(prev => [newSub, ...prev]);
    setInvoices(prev => [newInvoice, ...prev]);
    setSystemUsers(prev => [newSystemUser, ...prev]);

    setIsNewSubscriptionModalOpen(false);
    // Limpar form
    setNewSubCustomerName('');
    setNewSubEmail('');
    setNewSubDocument('');
    setNewSubPhone('');
    setNewSubCompany('');

    showToast(`Venda registrada com sucesso! Fatura com Pro-rata e vencimento dia ${newSubPreferredDueDay} gerada.`);

    // Abrir fatura imediatamente para o gestor poder copiar o PIX ou Boleto
    setSelectedInvoice(newInvoice);
    setIsBoletoPixModalOpen(true);
  };

  // AÇÃO: APLICAR PLANO CUSTOMIZADO SOB MEDIDA (VIA MODAL)
  const handleSaveCustomPlanFromModal = (config: any) => {
    const today = new Date().toISOString().split('T')[0];
    
    if (customPlanSubTarget) {
      // Atualizar assinatura existente com novo plano customizado
      setSubscriptions(prev => prev.map(s => {
        if (s.id === customPlanSubTarget.id) {
          return {
            ...s,
            planId: 'custom_modular',
            planName: config.planName,
            periodicity: config.periodicity,
            preferredDueDay: config.preferredDueDay,
            pricePaid: config.pricePaid,
            originalPrice: config.originalPrice,
            discountAppliedPercent: config.discountAppliedPercent,
            maxUsersAllowed: config.usersCount,
            maxCompaniesAllowed: config.companiesCount,
            allowedModules: config.selectedModules,
            loyaltyMonths: config.loyaltyMonths,
            terminationFinePercent: config.terminationFinePercent,
            isProRataApplied: config.isProRataApplied,
            proRataAmount: config.proRataAmount,
            nextBillingDate: config.firstInvoiceDueDate || s.nextBillingDate,
            notes: `Plano customizado sob medida atualizado. Vencimento: dia ${config.preferredDueDay}.`
          };
        }
        return s;
      }));
      showToast(`Plano do assinante "${customPlanSubTarget.customerName}" atualizado sob medida.`);
    } else {
      // Criar nova assinatura customizada
      const subId = `sub-${Date.now().toString().slice(-4)}`;
      const newSub: SoldSubscription = {
        id: subId,
        customerName: newSubCustomerName || 'Novo Assinante Custom',
        customerEmail: newSubEmail || 'contato@assinante.com.br',
        customerDocument: newSubDocument || '00.000.000/0001-00',
        customerPhone: newSubPhone || '(11) 99999-9999',
        companyName: newSubCompany || 'Empresa Customizada',
        planId: 'custom_modular',
        planName: config.planName,
        periodicity: config.periodicity,
        preferredDueDay: config.preferredDueDay,
        pricePaid: config.pricePaid,
        originalPrice: config.originalPrice,
        discountAppliedPercent: config.discountAppliedPercent,
        billingMethod: newSubMethod,
        status: 'pendente_pagamento',
        startDate: today,
        nextBillingDate: config.firstInvoiceDueDate,
        firstInvoiceDueDate: config.firstInvoiceDueDate,
        loyaltyMonths: config.loyaltyMonths,
        terminationFinePercent: config.terminationFinePercent,
        usersCount: 1,
        maxUsersAllowed: config.usersCount,
        maxCompaniesAllowed: config.companiesCount,
        allowedModules: config.selectedModules,
        isProRataApplied: config.isProRataApplied,
        proRataAmount: config.proRataAmount,
        notes: `Plano customizado sob medida com pro-rata e vencimento dia ${config.preferredDueDay}.`
      };

      setSubscriptions(prev => [newSub, ...prev]);
      showToast(`Nova assinatura sob medida "${config.planName}" cadastrada com sucesso!`);
    }

    setIsCustomPlanModalOpen(false);
    setCustomPlanSubTarget(null);
  };

  // AÇÃO: CONFIRMAR RESCISÃO / CANCELAMENTO COM APURAÇÃO PRO-RATA & CDC
  const handleConfirmAdminCancellation = (settlement: CancellationSettlementResult) => {
    if (!cancellationSubTarget) return;

    setSubscriptions(prev => prev.map(s => {
      if (s.id === cancellationSubTarget.id) {
        return {
          ...s,
          status: 'cancelada',
          cancellationSettlement: {
            cancelDate: settlement.cancelDate,
            finalBalance: settlement.finalBalanceToPayOrRefund,
            penaltyFineAmount: settlement.penaltyFineAmount,
            proRataUsedAmount: settlement.amountUsedProRata,
            refundAmount: settlement.amountUnusedRefundable,
            summary: settlement.settlementSummary,
          }
        };
      }
      return s;
    }));

    showToast(`Rescisão do cliente "${cancellationSubTarget.customerName}" homologada com cálculo de Pro-rata e CDC.`);
    setIsCancellationModalOpen(false);
    setCancellationSubTarget(null);
  };

  // AÇÃO: APROVAR SOLICITAÇÃO DE ATIVAÇÃO DE PLANO DO CLIENTE
  const handleApprovePlanActivationRequest = (requestId: string) => {
    if (!hasClientVerificationAccess) {
      alert('Acesso restrito. Apenas o Desenvolvedor do sistema (Carlos Miguel) ou operadores autorizados pelo desenvolvedor têm permissão para verificar e aprovar clientes.');
      return;
    }

    const result = AuthService.approvePlanActivationRequest(requestId);
    if (result.success && result.request) {
      refreshActivationRequests();
      sendWelcomeEmail(result.request.requesterName, result.request.requesterEmail);
      showToast(`Solicitação do cliente "${result.request.requesterName}" aprovada! E-mail de boas-vindas enviado.`);
      
      // Auto-adicionar à lista de assinaturas do painel se ainda não estiver
      const existingSub = subscriptions.find(s => s.customerEmail.toLowerCase() === result.request!.requesterEmail.toLowerCase());
      if (!existingSub) {
        const today = new Date().toISOString().split('T')[0];
        const newSubId = `sub-${Date.now().toString().slice(-4)}`;
        const newSub: SoldSubscription = {
          id: newSubId,
          customerName: result.request.requesterName,
          customerEmail: result.request.requesterEmail,
          customerDocument: result.request.documentNumber || '00.000.000/0001-00',
          customerPhone: result.request.requesterPhone || '(11) 98765-4321',
          companyName: result.request.companyName,
          planId: result.request.planId as any,
          planName: result.request.planName,
          periodicity: result.request.periodicity,
          preferredDueDay: 10,
          pricePaid: result.request.totalPriceCalculated || result.request.monthlyPrice,
          originalPrice: result.request.monthlyPrice,
          discountAppliedPercent: result.request.referralCode ? 10 : 0,
          billingMethod: 'pix',
          status: 'pendente_pagamento',
          startDate: today,
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          usersCount: 1,
          maxUsersAllowed: 5,
          maxCompaniesAllowed: 10,
          allowedModules: DEFAULT_PLAN_MODULES[result.request.planId as keyof typeof DEFAULT_PLAN_MODULES] || DEFAULT_PLAN_MODULES.pro,
          notes: `Assinatura originada por solicitação de ativação aprovada. Cupom: ${result.request.referralCode || 'Nenhum'}`
        };
        setSubscriptions(prev => [newSub, ...prev]);
      }
    } else {
      alert(result.error || 'Não foi possível aprovar a solicitação.');
    }
  };

  // AÇÃO: REJEITAR SOLICITAÇÃO
  const handleRejectPlanActivationRequest = async (requestId: string) => {
    if (!hasClientVerificationAccess) {
      alert('Acesso restrito. Apenas o Desenvolvedor do sistema (Carlos Miguel) ou operadores autorizados pelo desenvolvedor têm permissão para verificar e rejeitar solicitações de clientes.');
      return;
    }

    const reqs = AuthService.getPlanActivationRequests();
    const updated = reqs.map(r => {
      if (r.id === requestId) {
        // Enviar e-mail de rejeição/atualização em background
        fetch('/api/send-rejection-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientName: r.requesterName,
            clientEmail: r.requesterEmail
          })
        }).catch(err => console.error('Erro ao enviar e-mail de rejeição:', err));

        return {
          ...r,
          status: 'rejeitado' as const,
          reviewedAt: new Date().toISOString(),
          reviewedBy: currentUser.name || 'Desenvolvedor'
        };
      }
      return r;
    });
    localStorage.setItem('vertice_plan_activation_requests_v2', JSON.stringify(updated));
    refreshActivationRequests();
    showToast('Solicitação rejeitada e aviso enviado por e-mail.');
  };

  // AÇÃO: ABRIR MODAL PARA NOVO OU EDITAR USUÁRIO
  const handleOpenUserModal = (user?: SystemUser) => {
    if (user) {
      setEditingUser(user);
      setUserFormName(user.name);
      setUserFormEmail(user.email);
      setUserFormRole(user.role);
      setUserFormCompany(user.companyName || '');
      setUserFormDepartment(user.department || '');
      setUserFormIsPartnerActive(user.isPartnerActive ?? (user.role === 'parceiro_negocios'));
      setUserFormPartnerReferralCode(user.partnerReferralCode || (user.name ? `VERTICE-${user.name.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 8)}` : 'VERTICE-PARCEIRO'));
      setUserFormPartnerCommissionRate(user.partnerCommissionRate ?? (user.role === 'master' || user.role === 'desenvolvedor' ? 35 : 20));
      setUserFormPartnerDiscountPercent(user.partnerDiscountPercent ?? 10);
      setUserFormPartnerPixKey(user.partnerPixKey || user.email);
      setUserFormPartnerPixKeyType(user.partnerPixKeyType || 'email');
      setUserFormPartnerBankName(user.partnerBankName || 'Banco do Brasil S.A.');
      setUserFormPermissions({
        ...user.permissions,
        canAccessPlatformBilling: user.canAccessPlatformBilling ?? user.permissions?.canAccessPlatformBilling ?? (user.role === 'desenvolvedor'),
        canVerifyClients: user.canVerifyClients ?? user.permissions?.canVerifyClients ?? (user.role === 'desenvolvedor'),
      });
    } else {
      setEditingUser(null);
      setUserFormName('');
      setUserFormEmail('');
      setUserFormRole('contador_senior');
      setUserFormCompany('Escritório Contábil Parceiro');
      setUserFormDepartment('Departamento Fiscal');
      setUserFormIsPartnerActive(false);
      setUserFormPartnerReferralCode('');
      setUserFormPartnerCommissionRate(20);
      setUserFormPartnerDiscountPercent(10);
      setUserFormPartnerPixKey('');
      setUserFormPartnerPixKeyType('email');
      setUserFormPartnerBankName('Banco do Brasil S.A.');
      setUserFormPermissions({
        canSimulateRegimes: true,
        canExportReports: true,
        canAccessAIAuditor: true,
        canEditCompanyData: true,
        canManageUsers: false,
        canViewFinancials: false,
        canAccessTaxReform: true,
        canAccessCFOP: true,
        canAccessPlatformBilling: false,
        canVerifyClients: false,
      });
    }
    setIsUserModalOpen(true);
  };

  // SALVAR USUÁRIO (CRIAÇÃO OU EDIÇÃO)
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormName || !userFormEmail) {
      alert('Preencha Nome e E-mail do usuário.');
      return;
    }

    const isPartnerActiveFinal = userFormIsPartnerActive || userFormRole === 'parceiro_negocios';
    const partnerCodeFinal = userFormPartnerReferralCode.trim() || `VERTICE-${userFormName.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 8) || 'PARCEIRO'}`;
    const isDevRole = userFormRole === 'desenvolvedor';
    const canBillingFinal = isDevRole || !!userFormPermissions.canAccessPlatformBilling;
    const canVerifyFinal = isDevRole || !!userFormPermissions.canVerifyClients;

    const finalPermissions: SystemUserPermission = {
      ...userFormPermissions,
      canAccessPlatformBilling: canBillingFinal,
      canVerifyClients: canVerifyFinal
    };

    if (editingUser) {
      setSystemUsers(prev => prev.map(u => {
        if (u.id === editingUser.id) {
          return {
            ...u,
            name: userFormName,
            email: userFormEmail,
            role: userFormRole,
            companyName: userFormCompany,
            department: userFormDepartment,
            permissions: finalPermissions,
            isDeveloper: isDevRole,
            canAccessPlatformBilling: canBillingFinal,
            canVerifyClients: canVerifyFinal,
            isPartnerActive: isPartnerActiveFinal,
            partnerStatus: isPartnerActiveFinal ? 'ativo' : 'inativo',
            partnerReferralCode: partnerCodeFinal,
            partnerCommissionRate: userFormPartnerCommissionRate,
            partnerDiscountPercent: userFormPartnerDiscountPercent,
            partnerPixKey: userFormPartnerPixKey || userFormEmail,
            partnerPixKeyType: userFormPartnerPixKeyType,
            partnerBankName: userFormPartnerBankName
          };
        }
        return u;
      }));

      // Sincronizar com AuthService para refletir no perfil e na sessão de login
      AuthService.updateUserAccountProfile(userFormEmail, {
        name: userFormName,
        role: userFormRole,
        companyName: userFormCompany,
        isDeveloper: isDevRole,
        canAccessPlatformBilling: canBillingFinal,
        canVerifyClients: canVerifyFinal
      });

      AuthService.updatePartnerProgram(userFormEmail, {
        isPartnerActive: isPartnerActiveFinal,
        partnerStatus: isPartnerActiveFinal ? 'ativo' : 'inativo',
        partnerReferralCode: partnerCodeFinal,
        partnerCommissionRate: userFormPartnerCommissionRate,
        partnerDiscountPercent: userFormPartnerDiscountPercent,
        partnerPixKey: userFormPartnerPixKey || userFormEmail,
        partnerPixKeyType: userFormPartnerPixKeyType,
        partnerBankName: userFormPartnerBankName
      });

      showToast(`Permissões e status do usuário "${userFormName}" atualizados com sucesso.`);
    } else {
      const newUser: SystemUser = {
        id: `usr-${Date.now().toString().slice(-4)}`,
        name: userFormName,
        email: userFormEmail,
        role: userFormRole,
        status: 'ativo',
        companyName: userFormCompany,
        department: userFormDepartment,
        createdAt: new Date().toISOString().split('T')[0],
        lastAccess: 'Nunca acessou',
        permissions: finalPermissions,
        isDeveloper: isDevRole,
        canAccessPlatformBilling: canBillingFinal,
        canVerifyClients: canVerifyFinal,
        isPartnerActive: isPartnerActiveFinal,
        partnerStatus: isPartnerActiveFinal ? 'ativo' : 'inativo',
        partnerReferralCode: partnerCodeFinal,
        partnerCommissionRate: userFormPartnerCommissionRate,
        partnerDiscountPercent: userFormPartnerDiscountPercent,
        partnerPixKey: userFormPartnerPixKey || userFormEmail,
        partnerPixKeyType: userFormPartnerPixKeyType,
        partnerBankName: userFormPartnerBankName
      };
      setSystemUsers(prev => [newUser, ...prev]);

      // Sincronizar com AuthService
      AuthService.updateUserAccountProfile(userFormEmail, {
        name: userFormName,
        role: userFormRole,
        companyName: userFormCompany,
        isDeveloper: isDevRole,
        canAccessPlatformBilling: canBillingFinal,
        canVerifyClients: canVerifyFinal
      });

      AuthService.updatePartnerProgram(userFormEmail, {
        isPartnerActive: isPartnerActiveFinal,
        partnerStatus: isPartnerActiveFinal ? 'ativo' : 'inativo',
        partnerReferralCode: partnerCodeFinal,
        partnerCommissionRate: userFormPartnerCommissionRate,
        partnerDiscountPercent: userFormPartnerDiscountPercent,
        partnerPixKey: userFormPartnerPixKey || userFormEmail,
        partnerPixKeyType: userFormPartnerPixKeyType,
        partnerBankName: userFormPartnerBankName
      });

      showToast(`Novo usuário "${userFormName}" cadastrado com perfil ${userFormRole.replace('_', ' ')}.`);
    }

    setIsUserModalOpen(false);
  };

  // ALTERAR STATUS DO USUÁRIO (ATIVAR/BLOQUEAR)
  const handleToggleUserStatus = (userId: string) => {
    setSystemUsers(prev => prev.map(u => {
      if (u.id === userId) {
        // Não permitir bloquear o próprio Master
        if (u.role === 'master' || u.email === 'carlosmiguelvieira1@gmail.com') {
          alert('O usuário Master Proprietário não pode ser bloqueado.');
          return u;
        }
        const newStatus = u.status === 'ativo' ? 'bloqueado' : 'ativo';
        return { ...u, status: newStatus };
      }
      return u;
    }));
    showToast('Status de acesso do usuário alterado.');
  };

  // EXCLUSÃO COM RIGOR DE CLIENTES / ASSINANTES
  const handleRequestDeleteSubscription = (sub: SoldSubscription) => {
    setDeleteConfirmModal({
      isOpen: true,
      type: 'subscription',
      id: sub.id,
      title: 'Excluir Cliente e Cancelar Assinatura',
      name: `${sub.customerName} (${sub.companyName})`,
      detail: `Ao excluir este cliente, o plano contratado (${sub.planName}) e todas as permissões de acesso e faturas associadas serão cancelados permanentemente com rigor.`
    });
  };

  // EXCLUSÃO COM RIGOR DE OPERADORES / USUÁRIOS
  const handleRequestDeleteUser = (user: SystemUser) => {
    if (user.role === 'master' || user.email === 'carlosmiguelvieira1@gmail.com') {
      alert('A conta Master de Carlos Miguel Vieira é protegida e não pode ser excluída.');
      return;
    }
    setDeleteConfirmModal({
      isOpen: true,
      type: 'user',
      id: user.id,
      title: 'Excluir Operador do Sistema',
      name: `${user.name} (${user.email})`,
      detail: `O login e todas as permissões deste operador serão imediatamente revogados do sistema.`
    });
  };

  // CONFIRMAÇÃO DA EXCLUSÃO
  const handleConfirmDelete = () => {
    if (deleteConfirmModal.type === 'subscription') {
      const sub = subscriptions.find(s => s.id === deleteConfirmModal.id);
      if (sub) {
        // 1. Remover de subscriptions
        setSubscriptions(prev => prev.filter(s => s.id !== sub.id));
        // 2. Remover da autenticação geral com rigor
        AuthService.deleteAccount(sub.customerEmail);
        AuthService.deleteAccount(sub.id);
        // 3. Remover usuário do sistema vinculado, se houver
        setSystemUsers(prev => prev.filter(u => 
          u.email.toLowerCase() !== sub.customerEmail.toLowerCase() && 
          u.subscriptionId !== sub.id
        ));
        showToast(`Cliente "${sub.customerName}" excluído com rigor.`);
      }
    } else if (deleteConfirmModal.type === 'user') {
      const user = systemUsers.find(u => u.id === deleteConfirmModal.id);
      if (user) {
        if (user.role === 'master' || user.email === 'carlosmiguelvieira1@gmail.com') {
          alert('A conta Master não pode ser removida.');
          return;
        }
        // 1. Remover de systemUsers
        setSystemUsers(prev => prev.filter(u => u.id !== user.id));
        // 2. Remover da autenticação
        AuthService.deleteAccount(user.id);
        AuthService.deleteAccount(user.email);
        showToast(`Operador "${user.name}" excluído com sucesso.`);
      }
    }

    setDeleteConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  // EDIÇÃO DE PLANO
  const handleOpenEditPlan = (plan: PlanDefinition) => {
    setEditingPlan(plan);
    setPlanFormName(plan.name);
    setPlanFormBadge(plan.badge || '');
    setPlanFormDescription(plan.description);
    setPlanFormPriceMonthly(plan.priceMonthly);
    setPlanFormPriceQuarterly(plan.priceQuarterly || Math.round(plan.priceMonthly * 3 * 0.95));
    setPlanFormPriceSemiannual(plan.priceSemiannual || Math.round(plan.priceMonthly * 6 * 0.90));
    setPlanFormPriceAnnual(plan.priceAnnual);
    setPlanFormPromptDiscountPercent(plan.promptPaymentDiscountPercent || 5);
    setPlanFormAnnualCashDiscountPercent(plan.annualCashDiscountPercent || 15);
    setPlanFormTerminationPenaltyPercent(plan.terminationPenaltyPercent || 20);
    setPlanFormMaxUsers(plan.maxUsers === 999 ? 10 : plan.maxUsers);
    setPlanFormUnlimitedUsers(plan.maxUsers === 999);
    setPlanFormMaxCompanies(plan.maxCompanies === 999 ? 50 : plan.maxCompanies);
    setPlanFormUnlimitedCompanies(plan.maxCompanies === 999);
    
    const mods = plan.allowedModules || DEFAULT_PLAN_MODULES[plan.id as PlatformPlan] || DEFAULT_PLAN_MODULES.pro;
    setPlanFormAllowedModules({ ...mods });
    setIsPlanEditModalOpen(true);
  };

  // NOVO PLANO CUSTOMIZADO
  const handleOpenCreateCustomPlan = () => {
    setEditingPlan(null);
    setPlanFormName('Plano Sob Medida');
    setPlanFormBadge('Personalizado ⚙️');
    setPlanFormDescription('Plano com quantidade de acessos, empresas e campos configurados sob medida.');
    setPlanFormPriceMonthly(490);
    setPlanFormPriceQuarterly(1390);
    setPlanFormPriceSemiannual(2640);
    setPlanFormPriceAnnual(4900);
    setPlanFormPromptDiscountPercent(5);
    setPlanFormAnnualCashDiscountPercent(15);
    setPlanFormTerminationPenaltyPercent(20);
    setPlanFormMaxUsers(8);
    setPlanFormUnlimitedUsers(false);
    setPlanFormMaxCompanies(40);
    setPlanFormUnlimitedCompanies(false);
    setPlanFormAllowedModules({
      dashboard: true,
      regimes: true,
      financeiro: false,
      cfop: true,
      fator_r: true,
      socios: true,
      projecao: true,
      reforma: true,
      parecer: true,
      historico: true,
      bpo: false,
      consultas: true,
      ai_auditor: true,
      pgdas_import: true,
      agenda_fiscal: true,
      balancete_dre: false,
      consultas_fiscais: true,
      auditoria_digital: true,
      planejamento_tributario: true,
      financeiro_gerencial: true,
      consultoria_fiscal: true,
      legal_societario: true
    });
    setIsPlanEditModalOpen(true);
  };

  // SALVAR EDIÇÃO / CRIAÇÃO DE PLANO
  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const finalMaxUsers = planFormUnlimitedUsers ? 999 : (Number(planFormMaxUsers) || 1);
    const finalMaxCompanies = planFormUnlimitedCompanies ? 999 : (Number(planFormMaxCompanies) || 1);

    if (editingPlan) {
      const updatedPlan: PlanDefinition = {
        ...editingPlan,
        name: planFormName,
        badge: planFormBadge,
        description: planFormDescription,
        priceMonthly: Number(planFormPriceMonthly) || 0,
        priceQuarterly: Number(planFormPriceQuarterly) || 0,
        priceSemiannual: Number(planFormPriceSemiannual) || 0,
        priceAnnual: Number(planFormPriceAnnual) || 0,
        promptPaymentDiscountPercent: Number(planFormPromptDiscountPercent) || 5,
        annualCashDiscountPercent: Number(planFormAnnualCashDiscountPercent) || 15,
        terminationPenaltyPercent: Number(planFormTerminationPenaltyPercent) || 20,
        maxUsers: finalMaxUsers,
        maxCompanies: finalMaxCompanies,
        allowedModules: planFormAllowedModules,
        features: [
          finalMaxUsers === 999 ? 'Acessos ilimitados' : `Até ${finalMaxUsers} acessos simultâneos`,
          finalMaxCompanies === 999 ? 'Empresas ilimitadas' : `Até ${finalMaxCompanies} empresas cadastradas`,
          planFormAllowedModules.ai_auditor ? 'Auditor Fiscal IA Gemini' : 'Sem IA',
          planFormAllowedModules.financeiro ? 'Painel Financeiro & DRE Gerencial' : 'Sem DRE',
          planFormAllowedModules.reforma ? 'Simulador Reforma Tributária' : 'Regimes Atuais',
          planFormAllowedModules.cfop ? 'Segregação CFOP e Monofásicos' : 'Cálculo Geral',
          planFormAllowedModules.pgdas_import ? 'Importação PGDAS-D e Extrato' : 'Sem importador PGDAS'
        ]
      };

      setPlans(prev => prev.map(p => p.id === editingPlan.id ? updatedPlan : p));
      showToast(`Plano "${updatedPlan.name}" atualizado com sucesso!`);
    } else {
      const newPlanId = `custom_${Date.now()}`;
      const newPlan: PlanDefinition = {
        id: newPlanId,
        name: planFormName,
        badge: planFormBadge || 'Personalizado',
        description: planFormDescription,
        priceMonthly: Number(planFormPriceMonthly) || 0,
        priceQuarterly: Number(planFormPriceQuarterly) || 0,
        priceSemiannual: Number(planFormPriceSemiannual) || 0,
        priceAnnual: Number(planFormPriceAnnual) || 0,
        promptPaymentDiscountPercent: Number(planFormPromptDiscountPercent) || 5,
        annualCashDiscountPercent: Number(planFormAnnualCashDiscountPercent) || 15,
        terminationPenaltyPercent: Number(planFormTerminationPenaltyPercent) || 20,
        maxUsers: finalMaxUsers,
        maxCompanies: finalMaxCompanies,
        maxQueriesPerMonth: 1000,
        isCustom: true,
        popular: false,
        allowedModules: planFormAllowedModules,
        features: [
          finalMaxUsers === 999 ? 'Acessos ilimitados' : `Até ${finalMaxUsers} acessos simultâneos`,
          finalMaxCompanies === 999 ? 'Empresas ilimitadas' : `Até ${finalMaxCompanies} empresas cadastradas`,
          'Módulos e campos selecionados pelo Master',
          planFormAllowedModules.ai_auditor ? 'Auditor Fiscal IA Gemini' : 'Sem IA',
          planFormAllowedModules.financeiro ? 'Painel Financeiro & DRE' : 'Sem painel financeiro'
        ]
      };
      setPlans(prev => [...prev, newPlan]);
      showToast(`Novo plano "${newPlan.name}" cadastrado.`);
    }

    setIsPlanEditModalOpen(false);
  };

  // RESTAURAR PLANOS PADRÃO
  const handleResetDefaultPlans = () => {
    if (confirm('Deseja restaurar os planos oficiais e valores padrão da plataforma?')) {
      setPlans(PLATFORM_PLANS);
      localStorage.setItem('sna_admin_plans', JSON.stringify(PLATFORM_PLANS));
      showToast('Planos da plataforma restaurados para os valores padrão.');
    }
  };

  // SALVAR DADOS BANCÁRIOS
  const handleSaveBankConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('sna_admin_bank_config', JSON.stringify(bankConfig));
    showToast('Dados bancários e parâmetros de PIX/Boleto salvos com sucesso!');
  };

  // RESETAR DADOS BANCÁRIOS PARA O PADRÃO
  const handleResetBankConfig = () => {
    if (confirm('Deseja restaurar as configurações bancárias padrão?')) {
      setBankConfig(DEFAULT_BANK_CONFIG);
      showToast('Configurações bancárias restauradas.');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* TOAST FEEDBACK NOTIFICATION */}
      {feedbackMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-3 border border-emerald-400/40 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{feedbackMessage}</span>
        </div>
      )}

      {/* CABEÇALHO DO PAINEL DO PROPRIETÁRIO */}
      <div className="bg-[#0F172A] rounded-2xl p-6 border border-slate-800 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-950/70 text-amber-300 border border-amber-800/80 text-[11px] font-bold uppercase tracking-wider flex items-center space-x-1">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Painel do Proprietário & Gestor SaaS</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-800/80 text-[11px] font-semibold">
                Assinaturas Ativas: {metrics.totalActiveSubs}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight flex items-center space-x-3">
              <span>Gestão de Planos Vendidos & Usuários</span>
            </h1>
            
            <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
              Controle centralizado de faturamento recorrente (MRR), emissão de <strong>Boleto Bancário</strong> e <strong>QR Code PIX</strong> oficial, parametrização de contas bancárias e matriz de permissões de operadores.
            </p>
          </div>

          {/* Ações Rápidas no Header */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsNewSubscriptionModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition shadow-xs flex items-center space-x-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Venda / Assinante</span>
            </button>

            <button
              onClick={() => handleOpenUserModal()}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold transition shadow-xs flex items-center space-x-2 cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Cadastrar Usuário</span>
            </button>
          </div>
        </div>

        {/* NAVEGAÇÃO INTERNA ENTRE ABAS DO PAINEL */}
        <div className="flex flex-wrap gap-2 pt-5 mt-6 border-t border-slate-800">
          <button
            onClick={() => setActiveSubTab('solicitacoes')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
              activeSubTab === 'solicitacoes'
                ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-400/50'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-blue-400" />
            <span>Solicitações de Ativação</span>
            {pendingRequestsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] animate-pulse">
                {pendingRequestsCount} novas
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('organograma')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
              activeSubTab === 'organograma'
                ? 'bg-amber-600 text-white shadow-xs ring-2 ring-amber-400/50'
                : 'bg-slate-900 text-amber-300 hover:bg-slate-800 border border-amber-500/30'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Organograma & Apresentação (Marketing/PDF)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('metricas')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-2 cursor-pointer ${
              activeSubTab === 'metricas'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Visão Geral & Métricas SaaS</span>
          </button>

          <button
            onClick={() => setActiveSubTab('assinantes')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-2 cursor-pointer ${
              activeSubTab === 'assinantes'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Planos Vendidos ({subscriptions.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('usuarios')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-2 cursor-pointer ${
              activeSubTab === 'usuarios'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Usuários & Permissões ({systemUsers.length})</span>
          </button>

          <button
            onClick={() => {
              if (!hasBillingAccess) {
                showToast('Acesso restrito ao Desenvolvedor (Carlos Miguel) para gestão de faturas da plataforma.');
                return;
              }
              setActiveSubTab('faturas');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-2 cursor-pointer ${
              activeSubTab === 'faturas'
                ? 'bg-purple-600 text-white shadow-xs'
                : !hasBillingAccess
                ? 'bg-slate-950 text-slate-500 border border-slate-900 opacity-60 cursor-not-allowed'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Barcode className="w-3.5 h-3.5" />
            <span>Faturas, Boletos & PIX ({invoices.length})</span>
            {!hasBillingAccess && <Lock className="w-3 h-3 text-amber-400" />}
          </button>

          <button
            onClick={() => {
              if (!hasBillingAccess) {
                showToast('Acesso restrito ao Desenvolvedor (Carlos Miguel) para gestão de contas bancárias da plataforma.');
                return;
              }
              setActiveSubTab('banco');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-2 cursor-pointer ${
              activeSubTab === 'banco'
                ? 'bg-teal-600 text-white shadow-xs'
                : !hasBillingAccess
                ? 'bg-slate-950 text-slate-500 border border-slate-900 opacity-60 cursor-not-allowed'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Vinculação Bancária & PIX</span>
            {!hasBillingAccess && <Lock className="w-3 h-3 text-amber-400" />}
          </button>

          <button
            onClick={() => setActiveSubTab('planos')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-2 cursor-pointer ${
              activeSubTab === 'planos'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tabela de Planos da Plataforma</span>
          </button>

          <button
            onClick={() => setActiveSubTab('integracao_governamental')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-2 cursor-pointer ${
              activeSubTab === 'integracao_governamental'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Status de Integração Governamental</span>
          </button>

          <button
            onClick={() => setActiveSubTab('nfse')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-2 cursor-pointer ${
              activeSubTab === 'nfse'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Módulo NFS-e Gov.br</span>
          </button>

          <button
            onClick={() => setActiveSubTab('certificados')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-2 cursor-pointer ${
              activeSubTab === 'certificados'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-blue-400" />
            <span>Certificados Digitais</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          SUB-ABA -1: SOLICITAÇÕES DE ATIVAÇÃO DE PLANO (MASTER PROPRIETÁRIO)
      ======================================================== */}
      {activeSubTab === 'solicitacoes' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header da Sub-Aba */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0F172A] border border-blue-500/40 rounded-2xl p-5 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold">
                  Central de Aprovações do Master
                </span>
                {pendingRequestsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black animate-pulse">
                    {pendingRequestsCount} aguardando liberação
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <span>Solicitações de Ativação de Novos Clientes</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                Quando um cliente seleciona um plano e solicita a ativação na tela pública, a notificação chega aqui. Ao clicar em <strong className="text-emerald-400">"Aceitar Solicitação"</strong>, o sistema emite automaticamente o e-mail oficial com o link de ativação para que o cliente complete o cadastro com perfil <strong className="text-white">Administrador</strong>.
              </p>
            </div>

            <button
              type="button"
              onClick={refreshActivationRequests}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Atualizar Lista</span>
            </button>
          </div>

          {/* Lista de Solicitações */}
          {activationRequests.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#0F172A] border border-slate-800 text-slate-400 space-y-3">
              <Mail className="w-10 h-10 text-slate-600 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-300">Nenhuma solicitação de plano no momento</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  As solicitações enviadas na tela de Login / Planos aparecerão instantaneamente nesta lista para análise e liberação.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {activationRequests.map((req) => {
                const isPending = req.status === 'pendente_aprovacao' || req.status === 'pendente_aprovacao_master';
                const isApproved = req.status === 'aprovado' || req.status === 'ativado';
                const isRejected = req.status === 'rejeitado';

                return (
                  <div
                    key={req.id}
                    className={`rounded-2xl p-5 border transition ${
                      isPending
                        ? 'bg-[#0F172A] border-amber-500/60 shadow-lg'
                        : isApproved
                        ? 'bg-[#0B0F19] border-emerald-500/40'
                        : 'bg-[#0B0F19] border-rose-500/30 opacity-75'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                      {/* Dados do Solicitante e Empresa */}
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isPending
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : isApproved
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          }`}>
                            {isPending ? '● Aguardando Aprovação do Master' : isApproved ? '✓ Aprovado / Link Emitido' : '✕ Rejeitado'}
                          </span>

                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300 font-bold">
                            Plano: {req.planName} ({req.periodicity.toUpperCase()})
                          </span>

                          <span className="text-[11px] text-slate-400 font-mono">
                            Recebido em: {new Date(req.createdAt || req.requestedAt || new Date().toISOString()).toLocaleString('pt-BR')}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs pt-1">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Titular Solicitante:</span>
                            <strong className="text-white">{req.requesterName}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">E-mail para Ativação:</span>
                            <span className="text-blue-300 font-mono">{req.requesterEmail}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Empresa / Escritório:</span>
                            <span className="text-slate-200">{req.companyName}</span>
                          </div>
                          {req.documentNumber && (
                            <div>
                              <span className="text-slate-400 block text-[10px]">CNPJ / CPF:</span>
                              <span className="text-slate-300 font-mono">{req.documentNumber}</span>
                            </div>
                          )}
                          {req.requesterPhone && (
                            <div>
                              <span className="text-slate-400 block text-[10px]">Telefone / WhatsApp:</span>
                              <span className="text-slate-300">{req.requesterPhone}</span>
                            </div>
                          )}
                          {req.referralCode && (
                            <div>
                              <span className="text-slate-400 block text-[10px]">Cupom / Código Parceiro:</span>
                              <span className="text-amber-300 font-mono font-bold">{req.referralCode}</span>
                            </div>
                          )}
                        </div>

                        {req.notes && (
                          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                            <strong>Observações do Cliente:</strong> {req.notes}
                          </div>
                        )}

                        {isApproved && req.activationToken && (
                          <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-[11px] text-emerald-300 flex items-center justify-between gap-2">
                            <span>
                              Token de Ativação emitido: <strong className="font-mono">{req.activationToken}</strong>
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/#action=complete-admin-registration&token=${req.activationToken}`);
                                showToast('Link de ativação copiado para a área de transferência!');
                              }}
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                            >
                              <Copy className="w-3 h-3" />
                              <span>Copiar Link de Ativação</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Botões de Ação do Master */}
                      <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
                        {isPending && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApprovePlanActivationRequest(req.id)}
                              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 transition cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4 text-white" />
                              <span>Aceitar Solicitação & Ativar</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRejectPlanActivationRequest(req.id)}
                              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/80 hover:text-rose-300 border border-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                            >
                              <UserX className="w-3.5 h-3.5" />
                              <span>Rejeitar</span>
                            </button>
                          </>
                        )}

                        {isApproved && (
                          <div className="text-right text-[11px] text-emerald-400 font-semibold space-y-1">
                            <div>Aprovado por: {req.reviewedBy || 'Master Proprietário'}</div>
                            <div className="text-slate-400 text-[10px] font-mono">
                              {req.reviewedAt ? new Date(req.reviewedAt).toLocaleString('pt-BR') : ''}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          SUB-ABA 0: ORGANOGRAMA & APRESENTAÇÃO COMERCIAL (MARKETING/PDF)
      ======================================================== */}
      {activeSubTab === 'organograma' && (
        <SystemOrganogramPresentation />
      )}

      {/* ========================================================
          SUB-ABA 1: VISÃO GERAL & MÉTRICAS SAAS
      ======================================================== */}
      {activeSubTab === 'metricas' && (
        <div className="space-y-6">
          
          {/* CARDS DE KPIS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: MRR */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                <span>Receita Recorrente Mensal (MRR)</span>
                <span className="p-1.5 rounded-lg bg-emerald-950/70 text-emerald-400 border border-emerald-800/80">
                  <DollarSign className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
                {metrics.mrr.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold mt-2 flex items-center space-x-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>ARR projetado: {metrics.arr.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/ano</span>
              </div>
            </div>

            {/* Card 2: Assinantes Ativos */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                <span>Assinantes Ativos</span>
                <span className="p-1.5 rounded-lg bg-blue-950/70 text-blue-400 border border-blue-800/80">
                  <CreditCard className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
                {metrics.totalActiveSubs} <span className="text-sm font-normal text-slate-400">/ {subscriptions.length} clientes</span>
              </div>
              <div className="text-[11px] text-blue-400 font-semibold mt-2 flex items-center space-x-1">
                <span>Taxa de Adimplência: {metrics.complianceRate.toFixed(1)}%</span>
              </div>
            </div>

            {/* Card 3: Usuários Licenciados */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                <span>Operadores / Usuários do Sistema</span>
                <span className="p-1.5 rounded-lg bg-purple-950/70 text-purple-400 border border-purple-800/80">
                  <Users className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
                {metrics.totalActiveUsers} <span className="text-sm font-normal text-slate-400">ativos</span>
              </div>
              <div className="text-[11px] text-purple-400 font-semibold mt-2">
                Capacidade instalada: {metrics.totalLicensedSeats} vagas licenciadas
              </div>
            </div>

            {/* Card 4: Ticket Médio */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                <span>Ticket Médio por Assinante</span>
                <span className="p-1.5 rounded-lg bg-amber-950/70 text-amber-400 border border-amber-800/80">
                  <Percent className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
                {metrics.averageTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                <span className="text-xs font-normal text-slate-400">/mês</span>
              </div>
              <div className="text-[11px] text-amber-400 font-semibold mt-2">
                {metrics.overdueCount > 0 ? (
                  <span className="text-rose-400 font-bold">{metrics.overdueCount} faturas em atraso ({metrics.overdueAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})</span>
                ) : (
                  <span className="text-emerald-400">Zero inadimplência detectada</span>
                )}
              </div>
            </div>

          </div>

          {/* PAINEL DE DISTRIBUIÇÃO DE PLANOS & DADOS BANCÁRIOS VINCULADOS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Coluna 1 e 2: Resumo dos Planos Vendidos */}
            <div className="lg:col-span-2 bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>Carteira de Assinantes por Plano</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Faturamento recorrente segregado por modalidade contratada
                  </p>
                </div>
                <button
                  onClick={() => setActiveSubTab('assinantes')}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 cursor-pointer"
                >
                  <span>Ver todos ({subscriptions.length})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3 pt-2">
                {plans.map(plan => {
                  const subsCount = subscriptions.filter(s => s.planId === plan.id).length;
                  const activeCount = subscriptions.filter(s => s.planId === plan.id && s.status === 'ativa').length;
                  const totalRev = subscriptions
                    .filter(s => s.planId === plan.id && s.status === 'ativa')
                    .reduce((sum, s) => sum + (s.periodicity === 'anual' ? s.pricePaid / 12 : s.pricePaid), 0);

                  return (
                    <div 
                      key={plan.id}
                      className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <strong className="text-sm text-slate-100 font-bold">{plan.name}</strong>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                            {plan.badge || 'Plano'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          Mensal: R$ {plan.priceMonthly.toFixed(2)} • Até {plan.maxUsers} usuários • {plan.maxCompanies} empresas
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-xs text-slate-400 block font-medium">
                          {activeCount} assinantes ativos ({subsCount} total)
                        </span>
                        <span className="text-sm font-bold text-emerald-400">
                          {totalRev.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/mês
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Coluna 3: Conta Bancária do Titular em Destaque */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-teal-400" />
                  <span>Conta Vinculada</span>
                </h3>
                <button
                  onClick={() => setActiveSubTab('banco')}
                  className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center space-x-1 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Configurar</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-bold block">Titular / Favorecido</span>
                  <strong className="text-slate-100 font-semibold text-xs block">{bankConfig.beneficiaryName}</strong>
                  <span className="text-slate-400 text-[11px]">CNPJ/CPF: {bankConfig.beneficiaryDocument}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-slate-400 uppercase text-[10px] font-bold block">Banco Emissor</span>
                    <strong className="text-slate-200 font-mono">{bankConfig.bankName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase text-[10px] font-bold block">Agência / Conta</span>
                    <strong className="text-slate-200 font-mono">{bankConfig.agency} / {bankConfig.account}-{bankConfig.accountDigit}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-400 uppercase text-[10px] font-bold block">Chave PIX Oficial</span>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-emerald-400 font-mono text-[11px] font-bold select-all truncate">
                      {bankConfig.pixKey}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 font-bold uppercase">
                      {bankConfig.pixKeyType}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-xs text-emerald-300 space-y-1">
                <div className="flex items-center space-x-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Emissão Automática Pronta</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Todas as faturas geradas utilizam essa conta para emissão dos boletos e do código PIX Copia e Cola.
                </p>
              </div>

              <button
                onClick={() => {
                  const firstSub = subscriptions[0];
                  if (firstSub) {
                    handleOpenBillingForSub(firstSub);
                  } else {
                    setIsNewSubscriptionModalOpen(true);
                  }
                }}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center justify-center space-x-2 cursor-pointer border border-slate-700"
              >
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span>{subscriptions.length > 0 ? 'Testar Emissão de Fatura / Boleto' : 'Cadastrar Venda & Emitir Boleto / PIX'}</span>
              </button>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================
          SUB-ABA 2: PLANOS VENDIDOS & ASSINANTES
      ======================================================== */}
      {activeSubTab === 'assinantes' && (
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
          
          {/* Barra de Filtros & Ações */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            {/* Campo de Busca */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por cliente, escritório, CNPJ ou e-mail..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Filtro por Status */}
            <div className="flex items-center space-x-2  pb-1 md:pb-0">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              {(['todas', 'ativa', 'pendente_pagamento', 'atrasada', 'cancelada'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold  transition cursor-pointer capitalize ${
                    statusFilter === status
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {status === 'todas' ? 'Todos' : status.replace('_', ' ')}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsNewSubscriptionModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition flex items-center space-x-2 shrink-0 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Venda</span>
            </button>
          </div>

          {/* Tabela de Assinantes */}
          {filteredSubscriptions.length === 0 ? (
            <div className="py-12 px-4 text-center rounded-xl border border-slate-800 bg-[#0B0F19]">
              <Building2 className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-200">Nenhum assinante cadastrado</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                A base de dados do gestor está limpa e sem informações fictícias. Registre seus clientes e escritórios parceiros para acompanhar assinaturas e cobranças.
              </p>
              <button
                onClick={() => setIsNewSubscriptionModalOpen(true)}
                className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center space-x-2 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar Primeiro Assinante</span>
              </button>
            </div>
          ) : (
            <div className=" rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0B0F19] text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Cliente / Empresa</th>
                    <th className="p-3.5">Plano Contratado</th>
                    <th className="p-3.5">Valor & Ciclo</th>
                    <th className="p-3.5">Contrato & CDC</th>
                    <th className="p-3.5">Operadores</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Próx. Cobrança</th>
                    <th className="p-3.5 text-right">Ações de Cobrança</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredSubscriptions.map(sub => {
                    const loyaltyMonths = sub.loyaltyMonths || (sub.periodicity === 'anual' ? 12 : sub.periodicity === 'semestral' ? 6 : sub.periodicity === 'trimestral' ? 3 : 1);
                    const contractEndDateFormatted = sub.contractEndDate ? new Date(sub.contractEndDate + 'T12:00:00').toLocaleDateString('pt-BR') : '';

                    return (
                      <tr key={sub.id} className="hover:bg-slate-800/50 transition">
                        
                        {/* Cliente / Empresa */}
                        <td className="p-3.5">
                          <div className="font-bold text-slate-100 text-xs">{sub.customerName}</div>
                          <div className="text-[11px] text-slate-400">{sub.companyName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{sub.customerDocument} • {sub.customerEmail}</div>
                        </td>

                        {/* Plano Contratado */}
                        <td className="p-3.5">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 font-semibold text-slate-200 text-xs inline-block">
                            {sub.planName}
                          </span>
                        </td>

                        {/* Valor & Ciclo */}
                        <td className="p-3.5">
                          <div className="font-bold text-emerald-400 text-xs">
                            {sub.pricePaid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </div>
                          <span className="text-[10px] text-slate-400 uppercase font-medium">
                            {sub.periodicity} ({sub.billingMethod.toUpperCase()})
                          </span>
                        </td>

                        {/* Contrato & CDC */}
                        <td className="p-3.5">
                          <div className="flex flex-col space-y-1">
                            <button
                              onClick={() => handleOpenContractForSub(sub)}
                              className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-blue-950/70 hover:bg-blue-900/80 text-blue-300 border border-blue-800/80 text-[11px] font-semibold transition cursor-pointer w-fit"
                              title="Visualizar e assinar contrato com artigos do CDC e multa rescisória"
                            >
                              <FileText className="w-3.5 h-3.5 text-blue-400" />
                              <span>{sub.contractAccepted ? 'Contrato Assinado' : 'Ver / Assinar Contrato'}</span>
                            </button>
                            <span className="text-[10px] text-slate-400">
                              {loyaltyMonths > 1 ? (
                                <span className="text-amber-400/90 font-medium">Fidelidade {loyaltyMonths}m ({contractEndDateFormatted})</span>
                              ) : (
                                <span>Mensal (sem fidelidade)</span>
                              )}
                            </span>
                          </div>
                        </td>

                        {/* Operadores */}
                        <td className="p-3.5">
                          <div className="flex items-center space-x-1.5 text-slate-300 font-medium">
                            <Users className="w-3.5 h-3.5 text-blue-400" />
                            <span>{sub.usersCount} / {sub.maxUsersAllowed === 999 ? '∞' : sub.maxUsersAllowed}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="p-3.5">
                          {sub.status === 'ativa' && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-800/80 text-[10px] font-bold uppercase">
                              Ativa
                            </span>
                          )}
                          {sub.status === 'pendente_pagamento' && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-950/70 text-amber-300 border border-amber-800/80 text-[10px] font-bold uppercase">
                              Pendente
                            </span>
                          )}
                          {sub.status === 'atrasada' && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-950/70 text-rose-300 border border-rose-800/80 text-[10px] font-bold uppercase">
                              Atrasada
                            </span>
                          )}
                          {sub.status === 'cancelada' && (
                            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold uppercase border border-slate-700">
                              Cancelada
                            </span>
                          )}
                        </td>

                        {/* Próx. Cobrança */}
                        <td className="p-3.5 text-slate-300">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{new Date(sub.nextBillingDate + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                          </div>
                        </td>

                        {/* Ações */}
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => {
                                setCustomPlanSubTarget(sub);
                                setIsCustomPlanModalOpen(true);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-700/80 text-xs font-semibold transition flex items-center space-x-1 cursor-pointer"
                              title="Alterar Plano Sob Medida (Módulos, Empresas, Usuários e Pro-rata)"
                            >
                              <Layers className="w-3.5 h-3.5 text-indigo-400" />
                              <span className="hidden xl:inline">Sob Medida</span>
                            </button>

                            <button
                              onClick={() => handleOpenBillingForSub(sub)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/80 text-xs font-semibold transition flex items-center space-x-1 cursor-pointer"
                              title="Gerar ou Ver Boleto e PIX baseado no plano ativo do cliente"
                            >
                              <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="hidden xl:inline">Boleto/PIX</span>
                            </button>

                            <button
                              onClick={() => {
                                setCancellationSubTarget(sub);
                                setIsCancellationModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-slate-900 hover:bg-amber-950/70 text-slate-400 hover:text-amber-400 border border-slate-700 hover:border-amber-700/80 transition cursor-pointer"
                              title="Rescisão / Cancelamento com Apuração Pro-rata & CDC (Art. 49)"
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleToggleSubStatus(sub.id)}
                              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition cursor-pointer"
                              title={sub.status === 'ativa' ? 'Bloquear Assinatura' : 'Reativar Assinatura'}
                            >
                              {sub.status === 'ativa' ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5 text-emerald-400" />}
                            </button>

                            <button
                              onClick={() => handleRequestDeleteSubscription(sub)}
                              className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-800/60 transition cursor-pointer"
                              title="Excluir Cliente Permanentemente (Perfil Master)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* ========================================================
          SUB-ABA 3: USUÁRIOS & PERMISSÕES DO SISTEMA
      ======================================================== */}
      {activeSubTab === 'usuarios' && (
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>Gestão de Operadores & Matriz de Permissões</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Controle quais recursos e módulos fiscais cada membro da equipe ou cliente pode acessar
              </p>
            </div>

            <button
              onClick={() => handleOpenUserModal()}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition flex items-center space-x-2 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Operador</span>
            </button>
          </div>

          {/* Tabela de Usuários */}
          <div className=" rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0B0F19] text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Nome & E-mail</th>
                  <th className="p-3.5">Cargo / Papel</th>
                  <th className="p-3.5">Empresa / Departamento</th>
                  <th className="p-3.5">Permissões Liberadas</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Último Acesso</th>
                  <th className="p-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {systemUsers.map(user => {
                  const permCount = Object.values(user.permissions).filter(Boolean).length;
                  const isMaster = user.role === 'master' || user.email === 'carlosmiguelvieira1@gmail.com';

                  return (
                    <tr key={user.id} className="hover:bg-slate-800/50 transition">
                      
                      {/* Nome e E-mail */}
                      <td className="p-3.5">
                        <div className="flex items-center space-x-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            isMaster 
                              ? 'bg-amber-950/80 text-amber-300 ring-2 ring-amber-500/50' 
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {user.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <strong className="text-slate-100 font-bold text-xs flex items-center space-x-1.5">
                              <span>{user.name}</span>
                              {isMaster && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                            </strong>
                            <span className="text-[11px] text-slate-400 block">{user.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Cargo / Papel */}
                      <td className="p-3.5">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1 ${
                            user.role === 'desenvolvedor' || user.isDeveloper || user.email === 'carlosmiguelvieira1@gmail.com'
                              ? 'bg-purple-950/90 text-purple-300 border border-purple-500/60 shadow-xs'
                              : user.role === 'master'
                              ? 'bg-amber-950/70 text-amber-300 border border-amber-800/80'
                              : user.role === 'escritorio'
                              ? 'bg-blue-950/70 text-blue-300 border border-blue-800/80'
                              : user.role === 'auditor' || user.role === 'auditor_fiscal'
                              ? 'bg-indigo-950/70 text-indigo-300 border border-indigo-800/80'
                              : user.role === 'analista' || user.role === 'assistente_fiscal'
                              ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-800/80'
                              : user.role === 'empresa' || user.role === 'cliente_empresa'
                              ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/80'
                              : user.role === 'parceiro_negocios' || user.isPartnerActive
                              ? 'bg-gradient-to-r from-amber-950/90 to-blue-950/90 text-amber-300 border border-amber-500/60 shadow-xs'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}>
                            {(user.role === 'desenvolvedor' || user.isDeveloper || user.email === 'carlosmiguelvieira1@gmail.com') && (
                              <Key className="w-3 h-3 text-purple-400 shrink-0" />
                            )}
                            {user.role === 'master' && (
                              <Crown className="w-3 h-3 text-amber-400 shrink-0" />
                            )}
                            {(user.role === 'parceiro_negocios' || user.isPartnerActive) && (
                              <Award className="w-3 h-3 text-amber-400 shrink-0" />
                            )}
                            {user.role === 'desenvolvedor' || user.isDeveloper || user.email === 'carlosmiguelvieira1@gmail.com'
                              ? 'Desenvolvedor Master'
                              : user.role === 'master'
                              ? 'Master Proprietário'
                              : user.role === 'escritorio'
                              ? 'Escritório Contábil'
                              : user.role === 'auditor'
                              ? 'Auditor Pericial'
                              : user.role === 'analista'
                              ? 'Analista Fiscal'
                              : user.role === 'empresa'
                              ? 'Empresa Cliente'
                              : user.role === 'parceiro_negocios' 
                              ? 'Parceiro de Negócios' 
                              : user.role.replace('_', ' ')}
                          </span>

                          <div className="flex flex-wrap gap-1">
                            {(user.canAccessPlatformBilling || user.role === 'desenvolvedor' || user.email === 'carlosmiguelvieira1@gmail.com') && (
                              <span className="text-[9px] font-mono text-purple-300 bg-purple-950/60 px-1.5 py-0.2 rounded border border-purple-800/40">
                                💳 Faturamento
                              </span>
                            )}
                            {(user.canVerifyClients || user.role === 'desenvolvedor' || user.email === 'carlosmiguelvieira1@gmail.com') && (
                              <span className="text-[9px] font-mono text-blue-300 bg-blue-950/60 px-1.5 py-0.2 rounded border border-blue-800/40">
                                ✓ Verificação
                              </span>
                            )}
                          </div>

                          {(user.isPartnerActive || user.role === 'parceiro_negocios') && (
                            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/40">
                              {user.partnerCommissionRate || 20}% Com. • {user.partnerReferralCode || 'VERTICE-PARCEIRO'}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Empresa / Depto */}
                      <td className="p-3.5">
                        <div className="text-slate-200 font-medium">{user.companyName || 'Matriz'}</div>
                        <span className="text-[11px] text-slate-400">{user.department || 'Operacional'}</span>
                      </td>

                      {/* Permissões */}
                      <td className="p-3.5">
                        <div className="flex items-center space-x-1.5">
                          <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 font-mono text-[10px] font-bold border border-slate-700">
                            {permCount} / 8 Módulos
                          </span>
                          {user.permissions.canAccessAIAuditor && (
                            <span className="text-[10px] text-purple-400 font-bold" title="Acesso ao Auditor IA Gemini">
                              • IA
                            </span>
                          )}
                          {user.permissions.canViewFinancials && (
                            <span className="text-[10px] text-emerald-400 font-bold" title="Acesso ao Painel Financeiro DRE">
                              • DRE
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        {user.status === 'ativo' ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-950/70 text-emerald-300 text-[10px] font-bold border border-emerald-800/80">
                            Ativo
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-rose-950/70 text-rose-300 text-[10px] font-bold border border-rose-800/80">
                            Bloqueado
                          </span>
                        )}
                      </td>

                      {/* Último Acesso */}
                      <td className="p-3.5 text-slate-400 text-[11px]">
                        {user.lastAccess || 'Nunca'}
                      </td>

                      {/* Ações */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenUserModal(user)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition cursor-pointer"
                            title="Editar Permissões"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {!isMaster && (
                            <>
                              <button
                                onClick={() => handleToggleUserStatus(user.id)}
                                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 transition cursor-pointer"
                                title={user.status === 'ativo' ? 'Bloquear Usuário' : 'Desbloquear Usuário'}
                              >
                                {user.status === 'ativo' ? (
                                  <Lock className="w-3.5 h-3.5 text-rose-400" />
                                ) : (
                                  <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                                )}
                              </button>

                              <button
                                onClick={() => handleRequestDeleteUser(user)}
                                className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-800/60 transition cursor-pointer"
                                title="Excluir Operador/Usuário (Perfil Master)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ========================================================
          SUB-ABA 4: FATURAS, BOLETOS & PIX EMITIDOS
      ======================================================== */}
      {activeSubTab === 'faturas' && (
        !hasBillingAccess ? (
          <div className="bg-[#0F172A] border border-amber-500/30 rounded-2xl p-8 text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30 shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                Acesso Exclusivo do Desenvolvedor
              </span>
              <h3 className="text-lg font-bold text-white mt-2">Módulo Restrito: Gestão de Faturas & Cobranças</h3>
              <p className="text-xs text-slate-400 max-w-lg mx-auto mt-1 leading-relaxed">
                A emissão de faturas, geração de boletos bancários, conciliação de pagamentos PIX e liquidação de contratos da plataforma são prerrogativas exclusivas do perfil <strong>Desenvolvedor (Carlos Miguel)</strong> ou de contas autorizadas diretamente por ele.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setActiveSubTab('solicitacoes')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition cursor-pointer border border-slate-700"
              >
                Retornar para Solicitações
              </button>
            </div>
          </div>
        ) : (
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <Barcode className="w-4 h-4 text-purple-400" />
                <span>Histórico de Cobranças Emitidas (Boletos e PIX)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Rastreamento de todas as faturas geradas pelo sistema com status e baixa bancária
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">Total Faturado:</span>
              <span className="text-sm font-bold text-emerald-400">
                {invoices.reduce((acc, i) => acc + (i.status === 'pago' ? i.amount : 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          </div>

          {/* Tabela de Faturas */}
          {invoices.length === 0 ? (
            <div className="py-12 px-4 text-center rounded-xl border border-slate-800 bg-[#0B0F19]">
              <Barcode className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-200">Nenhuma fatura ou boleto emitido ainda</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                Todas as cobranças geradas (Boletos com linha digitável e QR Code PIX com liquidação em nome de Carlos Miguel Vieira) ficarão arquivadas aqui com rastreamento completo e baixa em tempo real.
              </p>
            </div>
          ) : (
            <div className=" rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0B0F19] text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Fatura Nº</th>
                    <th className="p-3.5">Cliente / Sacado</th>
                    <th className="p-3.5">Plano</th>
                    <th className="p-3.5">Valor (R$)</th>
                    <th className="p-3.5">Vencimento</th>
                    <th className="p-3.5">Método</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {invoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-800/50 transition">
                      
                      <td className="p-3.5 font-mono font-bold text-slate-200">
                        {inv.id}
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-slate-100">{inv.customerName}</div>
                        <span className="text-[10px] text-slate-400 font-mono">{inv.customerDocument}</span>
                      </td>

                      <td className="p-3.5 text-slate-300">
                        {inv.planName}
                      </td>

                      <td className="p-3.5 font-bold text-emerald-400">
                        {inv.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>

                      <td className="p-3.5 text-slate-300">
                        {new Date(inv.dueDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </td>

                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 uppercase font-bold text-[10px] border border-slate-700">
                          {inv.paymentMethod}
                        </span>
                      </td>

                      <td className="p-3.5">
                        {inv.status === 'pago' && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-950/70 text-emerald-300 text-[10px] font-bold uppercase border border-emerald-800/80">
                            Pago
                          </span>
                        )}
                        {inv.status === 'pendente' && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-950/70 text-amber-300 text-[10px] font-bold uppercase border border-amber-800/80">
                            Pendente
                          </span>
                        )}
                        {inv.status === 'vencido' && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-950/70 text-rose-300 text-[10px] font-bold uppercase border border-rose-800/80">
                            Vencido
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-right flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedNfseInvoice(inv);
                            setIsNfseModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer border border-emerald-500/40"
                          title="Emitir ou visualizar NFS-e Nacional"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-400" />
                          <span>NFS-e</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setIsBoletoPixModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer border border-slate-700"
                        >
                          <Eye className="w-3.5 h-3.5 text-purple-400" />
                          <span>Boleto / PIX</span>
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
        )
      )}

      {/* ========================================================
          SUB-ABA 5: VINCULAÇÃO BANCÁRIA & PARÂMETROS DO PIX
      ======================================================== */}
      {activeSubTab === 'banco' && (
        !hasBillingAccess ? (
          <div className="bg-[#0F172A] border border-amber-500/30 rounded-2xl p-8 text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30 shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                Acesso Exclusivo do Desenvolvedor
              </span>
              <h3 className="text-lg font-bold text-white mt-2">Módulo Restrito: Parametrização Bancária</h3>
              <p className="text-xs text-slate-400 max-w-lg mx-auto mt-1 leading-relaxed">
                A configuração de contas correntes recebedoras, chave PIX e chaves de emissão de boletos da plataforma são de responsabilidade direta e exclusiva do perfil <strong>Desenvolvedor (Carlos Miguel)</strong>.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setActiveSubTab('solicitacoes')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition cursor-pointer border border-slate-700"
              >
                Retornar para Solicitações
              </button>
            </div>
          </div>
        ) : (
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-teal-400" />
                <span>Parametrização Bancária do Titular (Emissão de Boletos & PIX)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Defina os dados da sua empresa e conta bancária para recebimento dos pagamentos dos planos vendidos
              </p>
            </div>

            <button
              type="button"
              onClick={handleResetBankConfig}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1.5 cursor-pointer font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Padrão</span>
            </button>
          </div>

          <form onSubmit={handleSaveBankConfig} className="space-y-6">
            
            {/* Bloco 1: Dados do Titular */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                1. Identificação do Favorecido (Cedente)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Razão Social ou Nome do Titular *
                  </label>
                  <input
                    type="text"
                    required
                    value={bankConfig.beneficiaryName}
                    onChange={(e) => setBankConfig({ ...bankConfig, beneficiaryName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    CNPJ ou CPF do Beneficiário *
                  </label>
                  <input
                    type="text"
                    required
                    value={bankConfig.beneficiaryDocument}
                    onChange={(e) => setBankConfig({ ...bankConfig, beneficiaryDocument: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            </div>

            {/* Bloco 2: Dados Bancários para Boleto */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                2. Conta Bancária para Cobrança e Compensação
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Banco */}
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Banco Emissor
                  </label>
                  <select
                    value={bankConfig.bankCode}
                    onChange={(e) => {
                      const code = e.target.value;
                      let name = 'Banco do Brasil S.A.';
                      if (code === '341') name = 'Banco Itaú Unibanco S.A.';
                      if (code === '237') name = 'Banco Bradesco S.A.';
                      if (code === '033') name = 'Banco Santander Brasil S.A.';
                      if (code === '077') name = 'Banco Inter S.A.';
                      if (code === '260') name = 'Nu Pagamentos S.A. (Nubank)';
                      if (code === '403') name = 'Banco Cora S.A.';
                      if (code === '756') name = 'Bancoob / Sicoob';
                      setBankConfig({ ...bankConfig, bankCode: code, bankName: name });
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                  >
                    <option value="001">001 - Banco do Brasil S.A.</option>
                    <option value="341">341 - Banco Itaú Unibanco</option>
                    <option value="237">237 - Banco Bradesco</option>
                    <option value="033">033 - Banco Santander</option>
                    <option value="077">077 - Banco Inter</option>
                    <option value="260">260 - Nubank PJ</option>
                    <option value="403">403 - Banco Cora</option>
                    <option value="756">756 - Sicoob</option>
                  </select>
                </div>

                {/* Agência */}
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Agência com DV
                  </label>
                  <input
                    type="text"
                    value={bankConfig.agency}
                    onChange={(e) => setBankConfig({ ...bankConfig, agency: e.target.value })}
                    placeholder="Ex: 3421-9"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Conta e DV */}
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Conta Corrente / DV
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={bankConfig.account}
                      onChange={(e) => setBankConfig({ ...bankConfig, account: e.target.value })}
                      placeholder="Ex: 45890"
                      className="flex-1 p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                    />
                    <input
                      type="text"
                      value={bankConfig.accountDigit}
                      onChange={(e) => setBankConfig({ ...bankConfig, accountDigit: e.target.value })}
                      placeholder="DV"
                      className="w-12 p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 text-center focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                {/* Convênio / Carteira */}
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Convênio / Carteira
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={bankConfig.cedenteCode}
                      onChange={(e) => setBankConfig({ ...bankConfig, cedenteCode: e.target.value })}
                      placeholder="Convênio"
                      className="flex-1 p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                    />
                    <input
                      type="text"
                      value={bankConfig.carteira}
                      onChange={(e) => setBankConfig({ ...bankConfig, carteira: e.target.value })}
                      placeholder="Cart."
                      className="w-16 p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 text-center focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Bloco 3: Configuração do PIX Oficial */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                3. Chave PIX Oficial para Geração de QR Code e Copia e Cola
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Tipo de Chave PIX
                  </label>
                  <select
                    value={bankConfig.pixKeyType}
                    onChange={(e) => setBankConfig({ ...bankConfig, pixKeyType: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                  >
                    <option value="email">E-mail</option>
                    <option value="cnpj">CNPJ</option>
                    <option value="cpf">CPF</option>
                    <option value="telefone">Celular / Telefone</option>
                    <option value="aleatoria">Chave Aleatória (EVP)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Chave PIX Cadastrada no Banco *
                  </label>
                  <input
                    type="text"
                    required
                    value={bankConfig.pixKey}
                    onChange={(e) => setBankConfig({ ...bankConfig, pixKey: e.target.value })}
                    placeholder="carlosmiguelvieira1@gmail.com"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Cidade do Titular (Bacen)
                  </label>
                  <input
                    type="text"
                    value={bankConfig.pixCity}
                    onChange={(e) => setBankConfig({ ...bankConfig, pixCity: e.target.value })}
                    placeholder="São Paulo"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                  />
                </div>

              </div>
            </div>

            {/* Bloco 4: Instruções Impressas no Boleto */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                4. Instruções e Regras de Cobrança Impressas no Boleto
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Instrução 1 (Recebimento)
                  </label>
                  <input
                    type="text"
                    value={bankConfig.instructions1}
                    onChange={(e) => setBankConfig({ ...bankConfig, instructions1: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Instrução 2 (Multa e Juros)
                  </label>
                  <input
                    type="text"
                    value={bankConfig.instructions2}
                    onChange={(e) => setBankConfig({ ...bankConfig, instructions2: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Instrução 3 (Descrição da Licença)
                  </label>
                  <input
                    type="text"
                    value={bankConfig.instructions3}
                    onChange={(e) => setBankConfig({ ...bankConfig, instructions3: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            </div>

            {/* Botão de Salvar */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs sm:text-sm transition shadow-xs flex items-center space-x-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Configurações Bancárias</span>
              </button>
            </div>

          </form>

        </div>
        )
      )}

      {/* ========================================================
          SUB-ABA 6: TABELA DE PLANOS DA PLATAFORMA (EDITÁVEL PELO MASTER)
      ======================================================== */}
      {activeSubTab === 'planos' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-xs">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Gestão Master de Planos & Precificação</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Ajuste valores mensais/anuais, quantidade de acessos simultâneos, limites de empresas e matriz de módulos liberados
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleResetDefaultPlans}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold border border-slate-800 transition cursor-pointer flex items-center space-x-1.5"
                title="Restaurar a grade oficial de valores e limites padrão"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Padrões</span>
              </button>

              <button
                onClick={handleOpenCreateCustomPlan}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
                title="Criar um plano sob medida com acessos e módulos customizados"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo Plano Sob Medida</span>
              </button>

              <button
                onClick={() => setIsNewSubscriptionModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Vender para Cliente</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {plans.map(plan => {
              const mods = plan.allowedModules || DEFAULT_PLAN_MODULES[plan.id] || DEFAULT_PLAN_MODULES.pro;

              return (
                <div 
                  key={plan.id}
                  className={`bg-[#0F172A] rounded-2xl p-6 border shadow-xs flex flex-col justify-between relative overflow-hidden transition hover:border-slate-700 ${
                    plan.popular 
                      ? 'border-emerald-500/80 ring-2 ring-emerald-500/30' 
                      : plan.isCustom
                      ? 'border-indigo-500/60 ring-1 ring-indigo-500/20'
                      : 'border-slate-800'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-bl-xl shadow-xs">
                      Mais Vendido
                    </div>
                  )}

                  {plan.isCustom && !plan.popular && (
                    <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-bl-xl shadow-xs">
                      Sob Medida
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase text-slate-400 block">{plan.badge || 'Pacote'}</span>
                        <button
                          onClick={() => handleOpenEditPlan(plan)}
                          className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-blue-400 hover:text-blue-300 text-[11px] font-semibold flex items-center space-x-1 transition cursor-pointer"
                          title="Editar este plano (valores, acessos, módulos)"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Editar</span>
                        </button>
                      </div>
                      <h4 className="text-lg font-black text-slate-100 mt-1">{plan.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">{plan.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                      <div className="flex items-baseline space-x-1">
                        <span className="text-2xl font-black text-slate-100">
                          {plan.priceMonthly.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">/mês</span>
                      </div>
                      <span className="text-[11px] text-emerald-400 font-semibold block">
                        ou {plan.priceAnnual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/ano (com 2 meses grátis)
                      </span>
                    </div>

                    {/* Limites de Acesso e Empresas */}
                    <div className="p-3 rounded-xl bg-[#0B0F19] border border-slate-800 text-xs space-y-1.5 text-slate-300">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Limite de Acessos:</span>
                        <strong className="text-slate-100 font-bold">
                          {plan.maxUsers === 999 ? 'Ilimitados ∞' : `${plan.maxUsers} operadores`}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Limite de Empresas:</span>
                        <strong className="text-slate-100 font-bold">
                          {plan.maxCompanies === 999 ? 'Ilimitadas ∞' : `${plan.maxCompanies} CNPJs`}
                        </strong>
                      </div>
                    </div>

                    {/* Módulos Liberados neste Plano */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Módulos Liberados:</span>
                      <div className="flex flex-wrap gap-1 text-[10px]">
                        {mods.dashboard && <span className="px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/60">Dashboard</span>}
                        {mods.regimes && <span className="px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/60">Regimes</span>}
                        {mods.fator_r && <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">Fator R</span>}
                        {mods.pgdas_import && <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">PGDAS-D</span>}
                        {mods.cfop && <span className="px-1.5 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/60">CFOP Monofásico</span>}
                        {mods.reforma && <span className="px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/60">Reforma IBS/CBS</span>}
                        {mods.ai_auditor && <span className="px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/60 font-bold">✨ Auditor IA</span>}
                        {mods.financeiro && <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 font-bold">💼 DRE Gerencial</span>}
                        {mods.parecer && <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">Laudo PDF</span>}
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800/60">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Destaques:</span>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {plan.features.slice(0, 5).map((feat, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-5 mt-4 border-t border-slate-800 space-y-2">
                    <button
                      onClick={() => handleOpenEditPlan(plan)}
                      className="w-full py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                      <span>Configurar Acessos e Preço</span>
                    </button>

                    <button
                      onClick={() => {
                        setNewSubPlanId(plan.id);
                        setIsNewSubscriptionModalOpen(true);
                      }}
                      className={`w-full py-2.5 rounded-xl text-xs font-semibold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                        plan.popular
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                          : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}
                    >
                      <span>Vender este Plano</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-ABA: STATUS DE INTEGRAÇÃO GOVERNAMENTAL
      ======================================================== */}
      {activeSubTab === 'integracao_governamental' && (
        <AdminIntegrationDashboard />
      )}

      {/* ========================================================
          SUB-ABA: MÓDULO DE EMISSÃO DE NFS-E (GOV.BR PRODUÇÃO)
      ======================================================== */}
      {activeSubTab === 'nfse' && (
        <NFSEServiceModule
          invoices={invoices}
          bankConfig={bankConfig}
          showToast={showToast}
        />
      )}

      {activeSubTab === 'certificados' && (
        <AdminCertificatesTab />
      )}

      {/* ========================================================
          MODAL 1: NOVA VENDA / CADASTRO DE ASSINANTE
      ======================================================== */}
      {isNewSubscriptionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[#0F172A] border border-slate-800 w-full max-w-xl rounded-2xl shadow-xl overflow-hidden my-6">
            
            <div className="bg-[#0B0F19] px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Plus className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-slate-100">Cadastrar Nova Venda de Plano</h3>
              </div>
              <button
                onClick={() => setIsNewSubscriptionModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubscription} className="p-6 space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Nome do Cliente *</label>
                  <input
                    type="text"
                    required
                    value={newSubCustomerName}
                    onChange={(e) => setNewSubCustomerName(e.target.value)}
                    placeholder="Ex: Dra. Juliana Miranda"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">E-mail do Cliente *</label>
                  <input
                    type="email"
                    required
                    value={newSubEmail}
                    onChange={(e) => setNewSubEmail(e.target.value)}
                    placeholder="juliana@escritorio.com.br"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">CPF ou CNPJ</label>
                  <input
                    type="text"
                    value={newSubDocument}
                    onChange={(e) => setNewSubDocument(e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={newSubPhone}
                    onChange={(e) => setNewSubPhone(e.target.value)}
                    placeholder="(11) 98765-4321"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Nome do Escritório / Empresa</label>
                <input
                  type="text"
                  value={newSubCompany}
                  onChange={(e) => setNewSubCompany(e.target.value)}
                  placeholder="Ex: Miranda Advocacia e Consultoria Fiscal"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/60">
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-semibold text-indigo-200">Precisa de módulos e limites sob medida?</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsNewSubscriptionModalOpen(false);
                    setCustomPlanSubTarget(null);
                    setIsCustomPlanModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Configurar Plano Sob Medida</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Plano Escolhido</label>
                  <select
                    value={newSubPlanId}
                    onChange={(e) => setNewSubPlanId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    {plans.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Ciclo de Pagamento</label>
                  <select
                    value={newSubPeriodicity}
                    onChange={(e) => {
                      const val = e.target.value as PlanPeriodicity;
                      setNewSubPeriodicity(val);
                      if (val === 'mensal' && newSubMethod === 'cartao') {
                        setNewSubMethod('pix');
                      }
                      if (val !== 'anual') {
                        setNewSubApplyCashDiscount(false);
                      }
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="mensal">Mensal (Recorrente)</option>
                    <option value="trimestral">Trimestral (3 meses • fidelidade 3m)</option>
                    <option value="semestral">Semestral (6 meses • fidelidade 6m)</option>
                    <option value="anual">Anual (12 meses • fidelidade 12m)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Forma de Cobrança</label>
                  <select
                    value={newSubMethod}
                    onChange={(e) => setNewSubMethod(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="pix">QR Code PIX (Instantâneo)</option>
                    <option value="boleto">Boleto Bancário</option>
                    {newSubPeriodicity !== 'mensal' && (
                      <option value="cartao">Cartão de Crédito</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Dia de Vencimento Preferido do Cliente */}
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5 flex items-center justify-between">
                  <span>Dia de Vencimento Preferido da Mensalidade:</span>
                  <span className="text-[11px] text-emerald-400 font-bold">Dia {newSubPreferredDueDay} de cada mês</span>
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[5, 10, 15, 20, 25].map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setNewSubPreferredDueDay(day)}
                      className={`py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                        newSubPreferredDueDay === day
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-700'
                      }`}
                    >
                      Dia {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Opções de Desconto Contratual */}
              <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-2.5">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                  Descontos e Condições Comerciais:
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-white">
                    <input
                      type="checkbox"
                      checked={newSubApplyPromptDiscount}
                      onChange={(e) => {
                        setNewSubApplyPromptDiscount(e.target.checked);
                        if (e.target.checked) setNewSubApplyCashDiscount(false);
                      }}
                      className="rounded border-slate-700 text-emerald-600 focus:ring-0 bg-slate-900"
                    />
                    <span>Desconto de 5% de pontualidade (até vencimento)</span>
                  </label>

                  {newSubPeriodicity === 'anual' && (
                    <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={newSubApplyCashDiscount}
                        onChange={(e) => {
                          setNewSubApplyCashDiscount(e.target.checked);
                          if (e.target.checked) setNewSubApplyPromptDiscount(false);
                        }}
                        className="rounded border-slate-700 text-blue-600 focus:ring-0 bg-slate-900"
                      />
                      <span className="text-blue-400 font-semibold">Desconto de 15% no anual à vista</span>
                    </label>
                  )}
                </div>
              </div>

              {/* Resumo do Valor & Pro-rata & Cláusula de Fidelidade / CDC */}
              <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-2.5">
                {(() => {
                  const sel = plans.find(p => p.id === newSubPlanId) || plans[1];
                  const todayStr = new Date().toISOString().split('T')[0];
                  let disc = 0;
                  if (newSubPeriodicity === 'anual' && newSubApplyCashDiscount) disc = 15;
                  else if (newSubApplyPromptDiscount) disc = 5;

                  let baseCycle = sel.priceMonthly;
                  if (newSubPeriodicity === 'trimestral') baseCycle = sel.priceQuarterly || (sel.priceMonthly * 3 * 0.95);
                  else if (newSubPeriodicity === 'semestral') baseCycle = sel.priceSemiannual || (sel.priceMonthly * 6 * 0.90);
                  else if (newSubPeriodicity === 'anual') baseCycle = sel.priceAnnual;
                  const finalCyclePrice = baseCycle * (1 - disc / 100);

                  const proRataCalc = calculateProRataSubscription({
                    monthlyPrice: sel.priceMonthly,
                    periodicity: newSubPeriodicity,
                    finalCyclePrice,
                    startDate: todayStr,
                    preferredDueDay: newSubPreferredDueDay,
                  });

                  return (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase text-slate-400 font-bold block">1ª Fatura a Emitir</span>
                          <span className="text-lg font-bold text-emerald-400">
                            {proRataCalc.firstInvoiceAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] uppercase text-slate-400 font-bold block">Vencimento da 1ª Fatura</span>
                          <span className="text-xs font-semibold text-slate-200">
                            {new Date(proRataCalc.firstInvoiceDueDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>

                      {proRataCalc.isProRataApplied && (
                        <div className="p-2.5 rounded-lg bg-emerald-950/50 border border-emerald-800/60 text-xs text-emerald-300">
                          ⚡ <strong>Pro-rata ativo:</strong> {proRataCalc.daysRemainingInFirstCycle} dias proporcionais de uso (R$ {(sel.priceMonthly / 30).toFixed(2)}/dia). Faturas subsequentes: {finalCyclePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/{newSubPeriodicity}.
                        </div>
                      )}

                      <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 text-xs">
                        <span className="text-slate-400">Fidelidade Contratual:</span>
                        <span className="font-semibold text-amber-400">
                          {newSubPeriodicity === 'anual' ? '12 meses (até término)' :
                           newSubPeriodicity === 'semestral' ? '6 meses (até término)' :
                           newSubPeriodicity === 'trimestral' ? '3 meses (até término)' : 'Mensal (sem fidelidade)'}
                        </span>
                      </div>
                    </>
                  );
                })()}

                <p className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
                  ⚖️ Instrumento com proteção CDC (Art. 49 em 7 dias), fidelidade vinculante até o término para planos &gt; 1 mês e multa rescisória de 20% sobre parcelas vincendas.
                </p>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsNewSubscriptionModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow-xs cursor-pointer flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Cadastrar Venda & Gerar Cobrança</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: GESTÃO & PERMISSÕES DO USUÁRIO
      ======================================================== */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[#0F172A] border border-slate-800 w-full max-w-xl rounded-2xl shadow-xl overflow-hidden my-6">
            
            <div className="bg-[#0B0F19] px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Users className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-slate-100">
                  {editingUser ? `Editar Operador: ${editingUser.name}` : 'Cadastrar Novo Operador no Sistema'}
                </h3>
              </div>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={userFormName}
                    onChange={(e) => setUserFormName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">E-mail de Acesso *</label>
                  <input
                    type="email"
                    required
                    value={userFormEmail}
                    onChange={(e) => setUserFormEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Perfil / Cargo *</label>
                  <select
                    value={userFormRole}
                    onChange={(e) => {
                      const newRole = e.target.value as any;
                      setUserFormRole(newRole);
                      if (newRole === 'parceiro_negocios') {
                        setUserFormIsPartnerActive(true);
                        if (!userFormPartnerReferralCode) {
                          setUserFormPartnerReferralCode(userFormName ? `VERTICE-${userFormName.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 8)}` : 'VERTICE-PARCEIRO');
                        }
                      }
                      if (newRole === 'desenvolvedor') {
                        setUserFormPermissions(prev => ({
                          ...prev,
                          canAccessPlatformBilling: true,
                          canVerifyClients: true,
                          canManageUsers: true
                        }));
                      }
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-medium"
                  >
                    {isDeveloper && (
                      <option value="desenvolvedor">💻 Desenvolvedor (Acesso Total + Faturamento Exclusivo)</option>
                    )}
                    <option value="master">👑 Master Proprietário (Aquisição & Gestão Completa)</option>
                    <option value="escritorio">🏢 Escritório (Contabilidade & Auditoria)</option>
                    <option value="auditor">🔍 Auditor (Perícia Fiscal & Pareceres)</option>
                    <option value="analista">📊 Analista (Planejamento Tributário & Fórmulas)</option>
                    <option value="empresa">🏬 Empresa (Cliente Empresarial)</option>
                    <option value="parceiro_negocios">⭐ Parceiro de Negócios (Isenção 100% & Comissões)</option>
                    <option value="contador_senior">Contador Sênior</option>
                    <option value="auditor_fiscal">Auditor Fiscal</option>
                    <option value="assistente_fiscal">Assistente Fiscal</option>
                    <option value="cliente_leitor">Cliente (Visualizador)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Empresa</label>
                  <input
                    type="text"
                    value={userFormCompany}
                    onChange={(e) => setUserFormCompany(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Departamento</label>
                  <input
                    type="text"
                    value={userFormDepartment}
                    onChange={(e) => setUserFormDepartment(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* CARD DE CONFIGURAÇÃO DO PROGRAMA DE PARCEIROS DE NEGÓCIOS (EXCLUSIVO MASTER) */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-950/30 via-slate-900 to-blue-950/30 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        Programa de Parceiros de Negócios
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold uppercase">
                          Exclusivo Master
                        </span>
                      </span>
                      <p className="text-[11px] text-slate-400">
                        Libera isenção de mensalidade (R$ 0,00) e geração de comissões de até 35% via PIX.
                      </p>
                    </div>
                  </div>

                  <label className="flex items-center space-x-2 cursor-pointer bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-amber-500/60 transition">
                    <input
                      type="checkbox"
                      checked={userFormIsPartnerActive || userFormRole === 'parceiro_negocios'}
                      onChange={(e) => {
                        setUserFormIsPartnerActive(e.target.checked);
                        if (e.target.checked && !userFormPartnerReferralCode) {
                          setUserFormPartnerReferralCode(userFormName ? `VERTICE-${userFormName.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 8)}` : 'VERTICE-PARCEIRO');
                        }
                      }}
                      className="rounded border-slate-700 text-amber-500 focus:ring-0 bg-slate-800 w-4 h-4"
                    />
                    <span className="text-xs font-bold text-amber-300">
                      {(userFormIsPartnerActive || userFormRole === 'parceiro_negocios') ? '✓ Parceiro Homologado' : 'Ativar Parceiro'}
                    </span>
                  </label>
                </div>

                {(userFormIsPartnerActive || userFormRole === 'parceiro_negocios') && (
                  <div className="pt-2 border-t border-amber-500/20 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-bold text-slate-300">Código de Indicação *</label>
                          <button
                            type="button"
                            onClick={() => {
                              const base = userFormName ? userFormName.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 8) : 'PARCEIRO';
                              setUserFormPartnerReferralCode(`VERTICE-${base}${Math.floor(10 + Math.random() * 90)}`);
                            }}
                            className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold cursor-pointer underline"
                          >
                            Gerar Novo
                          </button>
                        </div>
                        <input
                          type="text"
                          required={userFormIsPartnerActive || userFormRole === 'parceiro_negocios'}
                          value={userFormPartnerReferralCode}
                          onChange={(e) => setUserFormPartnerReferralCode(e.target.value.toUpperCase())}
                          placeholder="Ex: VERTICE-LUCAS10"
                          className="w-full p-2 rounded-lg bg-slate-950 border border-amber-500/40 font-mono text-xs text-amber-300 uppercase focus:outline-none focus:border-amber-400 font-bold"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-bold text-slate-300">Taxa de Comissão (%)</label>
                          <span className="text-[11px] font-bold text-emerald-400">{userFormPartnerCommissionRate}%</span>
                        </div>
                        <select
                          value={userFormPartnerCommissionRate}
                          onChange={(e) => setUserFormPartnerCommissionRate(Number(e.target.value))}
                          className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                        >
                          <option value={20}>20% (Faixa 1: 1 a 5 clientes ativos)</option>
                          <option value={25}>25% (Faixa 2: 6 a 15 clientes ativos)</option>
                          <option value={30}>30% (Faixa 3: 16 a 30 clientes ativos)</option>
                          <option value={35}>35% (Faixa 4: 31+ clientes ativos - Master)</option>
                        </select>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-bold text-slate-300">Desconto p/ Clientes (%)</label>
                          <span className="text-[11px] font-bold text-blue-400">{userFormPartnerDiscountPercent}%</span>
                        </div>
                        <select
                          value={userFormPartnerDiscountPercent}
                          onChange={(e) => setUserFormPartnerDiscountPercent(Number(e.target.value))}
                          className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                        >
                          <option value={0}>0% (Sem desconto p/ indicado)</option>
                          <option value={5}>5% de desconto</option>
                          <option value={10}>10% de desconto (Recomendado)</option>
                          <option value={15}>15% de desconto</option>
                          <option value={20}>20% de desconto (Máximo)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">Tipo da Chave PIX</label>
                        <select
                          value={userFormPartnerPixKeyType}
                          onChange={(e) => setUserFormPartnerPixKeyType(e.target.value as any)}
                          className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                        >
                          <option value="email">E-mail</option>
                          <option value="cpf">CPF</option>
                          <option value="cnpj">CNPJ</option>
                          <option value="telefone">Telefone</option>
                          <option value="aleatoria">Chave Aleatória (EVP)</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">Chave PIX p/ Pagamento de Comissões</label>
                        <input
                          type="text"
                          value={userFormPartnerPixKey}
                          onChange={(e) => setUserFormPartnerPixKey(e.target.value)}
                          placeholder="Chave PIX cadastrada no banco"
                          className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 font-mono text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span><strong>Isenção 100% de Mensalidade Ativada:</strong> Plano R$ 0,00/mês &amp; Acesso Ilimitado aos Módulos Fiscais.</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Matriz de Permissões com Checkboxes */}
              <div className="space-y-2 pt-3 border-t border-slate-800">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Matriz de Permissões no Sistema:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-xl bg-[#0B0F19] border border-slate-800 text-xs">
                  
                  <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-slate-100">
                    <input
                      type="checkbox"
                      checked={userFormPermissions.canSimulateRegimes}
                      onChange={(e) => setUserFormPermissions({ ...userFormPermissions, canSimulateRegimes: e.target.checked })}
                      className="rounded border-slate-700 text-blue-600 focus:ring-0 bg-slate-900"
                    />
                    <span>Simular Regimes & Anexos I a V</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-slate-100">
                    <input
                      type="checkbox"
                      checked={userFormPermissions.canExportReports}
                      onChange={(e) => setUserFormPermissions({ ...userFormPermissions, canExportReports: e.target.checked })}
                      className="rounded border-slate-700 text-blue-600 focus:ring-0 bg-slate-900"
                    />
                    <span>Exportar Pareceres & Relatórios A4</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-slate-100">
                    <input
                      type="checkbox"
                      checked={userFormPermissions.canAccessAIAuditor}
                      onChange={(e) => setUserFormPermissions({ ...userFormPermissions, canAccessAIAuditor: e.target.checked })}
                      className="rounded border-slate-700 text-blue-600 focus:ring-0 bg-slate-900"
                    />
                    <span>Auditor Fiscal com IA Gemini</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-slate-100">
                    <input
                      type="checkbox"
                      checked={userFormPermissions.canEditCompanyData}
                      onChange={(e) => setUserFormPermissions({ ...userFormPermissions, canEditCompanyData: e.target.checked })}
                      className="rounded border-slate-700 text-blue-600 focus:ring-0 bg-slate-900"
                    />
                    <span>Editar Faturamento e Cadastro CNPJ</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-slate-100">
                    <input
                      type="checkbox"
                      checked={userFormPermissions.canViewFinancials}
                      onChange={(e) => setUserFormPermissions({ ...userFormPermissions, canViewFinancials: e.target.checked })}
                      className="rounded border-slate-700 text-blue-600 focus:ring-0 bg-slate-900"
                    />
                    <span>Painel Financeiro & DRE Gerencial</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-slate-100">
                    <input
                      type="checkbox"
                      checked={userFormPermissions.canAccessTaxReform}
                      onChange={(e) => setUserFormPermissions({ ...userFormPermissions, canAccessTaxReform: e.target.checked })}
                      className="rounded border-slate-700 text-blue-600 focus:ring-0 bg-slate-900"
                    />
                    <span>Módulo da Reforma Tributária (IBS/CBS)</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-slate-100">
                    <input
                      type="checkbox"
                      checked={userFormPermissions.canAccessCFOP}
                      onChange={(e) => setUserFormPermissions({ ...userFormPermissions, canAccessCFOP: e.target.checked })}
                      className="rounded border-slate-700 text-blue-600 focus:ring-0 bg-slate-900"
                    />
                    <span>Segregação de CFOP & Monofásicos</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-slate-100">
                    <input
                      type="checkbox"
                      checked={userFormPermissions.canManageUsers}
                      onChange={(e) => setUserFormPermissions({ ...userFormPermissions, canManageUsers: e.target.checked })}
                      className="rounded border-slate-700 text-blue-600 focus:ring-0 bg-slate-900"
                    />
                    <span className="text-amber-400 font-bold">Criar e Gerenciar Outros Usuários</span>
                  </label>

                </div>

                {/* Permissões Exclusivas do Desenvolvedor (Faturamento e Verificação de Clientes) */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-purple-500/30 space-y-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-purple-400" />
                      Módulos Críticos da Plataforma (Controle do Desenvolvedor)
                    </span>
                    {!isDeveloper && (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
                        Apenas Carlos Miguel (Dev) pode alterar
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    <label className={`flex items-center space-x-2 ${isDeveloper ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'} text-slate-300`}>
                      <input
                        type="checkbox"
                        disabled={!isDeveloper}
                        checked={userFormPermissions.canAccessPlatformBilling ?? (userFormRole === 'desenvolvedor')}
                        onChange={(e) => setUserFormPermissions({ ...userFormPermissions, canAccessPlatformBilling: e.target.checked })}
                        className="rounded border-purple-700 text-purple-600 focus:ring-0 bg-slate-950"
                      />
                      <span className="font-semibold text-purple-200">Geração de Faturas & Faturamento</span>
                    </label>

                    <label className={`flex items-center space-x-2 ${isDeveloper ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'} text-slate-300`}>
                      <input
                        type="checkbox"
                        disabled={!isDeveloper}
                        checked={userFormPermissions.canVerifyClients ?? (userFormRole === 'desenvolvedor')}
                        onChange={(e) => setUserFormPermissions({ ...userFormPermissions, canVerifyClients: e.target.checked })}
                        className="rounded border-purple-700 text-purple-600 focus:ring-0 bg-slate-950"
                      />
                      <span className="font-semibold text-purple-200">Verificação & Aprovação de Clientes</span>
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    O perfil <strong>Master</strong> gerencia a aquisição da solução completa e clientes, enquanto faturamento da plataforma e homologação de novos clientes permanecem exclusivos do perfil Desenvolvedor ou de quem ele delegar.
                  </p>
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition shadow-xs cursor-pointer flex items-center space-x-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Operador</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: VISUALIZADOR DE BOLETO BANCÁRIO & PIX
      ======================================================== */}
      <BoletoPixModal
        isOpen={isBoletoPixModalOpen}
        onClose={() => setIsBoletoPixModalOpen(false)}
        invoice={selectedInvoice}
        bankConfig={bankConfig}
        onMarkAsPaid={handleMarkInvoiceAsPaid}
      />

      {/* ========================================================
          MODAL 4: EDIÇÃO & CUSTOMIZAÇÃO DE PLANOS (MASTER)
      ======================================================== */}
      {isPlanEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[#0F172A] border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-6">
            
            <div className="bg-[#0B0F19] px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Settings className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    {editingPlan ? `Editar Parâmetros: ${editingPlan.name}` : 'Criar Novo Plano Sob Medida'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Defina preços, limites de acessos e empresas, e os campos/módulos liberados
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPlanEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="p-6 space-y-5">
              
              {/* Nome e Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Nome do Plano *</label>
                  <input
                    type="text"
                    required
                    value={planFormName}
                    onChange={(e) => setPlanFormName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    placeholder="Ex: Plano Escritório Premium"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Badge Comercial / Tag</label>
                  <input
                    type="text"
                    value={planFormBadge}
                    onChange={(e) => setPlanFormBadge(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    placeholder="Ex: Mais Popular 🔥 ou Exclusivo"
                  />
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Descrição Comercial</label>
                <input
                  type="text"
                  value={planFormDescription}
                  onChange={(e) => setPlanFormDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  placeholder="Ex: Ideal para médios escritórios contábeis e BPO fiscal avançado"
                />
              </div>

              {/* Preços por Periodicidade Segregada */}
              <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                    Preços Segregados por Periodicidade
                  </label>
                  <span className="text-[10px] text-slate-400">Opções com fidelidade até o término para planos &gt; 1 mês</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Mensal (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={planFormPriceMonthly}
                      onChange={(e) => setPlanFormPriceMonthly(parseFloat(e.target.value) || 0)}
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 font-bold focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-[9px] text-slate-400 mt-0.5 block">Sem fidelidade</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Trimestral (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={planFormPriceQuarterly}
                      onChange={(e) => setPlanFormPriceQuarterly(parseFloat(e.target.value) || 0)}
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 font-bold focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-[9px] text-amber-400/90 mt-0.5 block">Fidelidade 3m</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Semestral (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={planFormPriceSemiannual}
                      onChange={(e) => setPlanFormPriceSemiannual(parseFloat(e.target.value) || 0)}
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 font-bold focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-[9px] text-amber-400/90 mt-0.5 block">Fidelidade 6m</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Anual (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={planFormPriceAnnual}
                      onChange={(e) => setPlanFormPriceAnnual(parseFloat(e.target.value) || 0)}
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 font-bold focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-[9px] text-amber-400/90 mt-0.5 block">Fidelidade 12m</span>
                  </div>
                </div>
              </div>

              {/* Parâmetros Comerciais & Cláusulas Legais CDC */}
              <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-3">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Descontos e Cláusulas Contratuais (CDC & Código Civil)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-300 block mb-1">
                      Desconto Pontualidade (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={planFormPromptDiscountPercent}
                      onChange={(e) => setPlanFormPromptDiscountPercent(parseFloat(e.target.value) || 0)}
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 font-bold focus:outline-none focus:border-indigo-500"
                    />
                    <span className="text-[9px] text-slate-400 mt-0.5 block">Até vencimento (padrão 5%)</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-300 block mb-1">
                      Desconto Anual à Vista (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={planFormAnnualCashDiscountPercent}
                      onChange={(e) => setPlanFormAnnualCashDiscountPercent(parseFloat(e.target.value) || 0)}
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 font-bold focus:outline-none focus:border-indigo-500"
                    />
                    <span className="text-[9px] text-slate-400 mt-0.5 block">À vista anual (padrão 15%)</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-300 block mb-1">
                      Multa Rescisória (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={planFormTerminationPenaltyPercent}
                      onChange={(e) => setPlanFormTerminationPenaltyPercent(parseFloat(e.target.value) || 0)}
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-rose-300 font-bold focus:outline-none focus:border-rose-500"
                    />
                    <span className="text-[9px] text-slate-400 mt-0.5 block">Saldo vincendo (padrão 20%)</span>
                  </div>
                </div>
              </div>

              {/* Quantidade de Acessos & Empresas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Quantidade de Acessos */}
                <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-blue-400">Quantidade de Acessos</label>
                    <label className="flex items-center space-x-1.5 text-[11px] text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={planFormUnlimitedUsers}
                        onChange={(e) => setPlanFormUnlimitedUsers(e.target.checked)}
                        className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-900"
                      />
                      <span>Ilimitados (∞)</span>
                    </label>
                  </div>
                  {!planFormUnlimitedUsers ? (
                    <input
                      type="number"
                      min="1"
                      max="500"
                      value={planFormMaxUsers}
                      onChange={(e) => setPlanFormMaxUsers(parseInt(e.target.value) || 1)}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-emerald-400 font-bold text-center">
                      Operadores simultâneos ilimitados
                    </div>
                  )}
                  <span className="text-[10px] text-slate-400 block">Número de logins simultâneos permitidos</span>
                </div>

                {/* Quantidade de Empresas */}
                <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-blue-400">Quantidade de Empresas</label>
                    <label className="flex items-center space-x-1.5 text-[11px] text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={planFormUnlimitedCompanies}
                        onChange={(e) => setPlanFormUnlimitedCompanies(e.target.checked)}
                        className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-900"
                      />
                      <span>Ilimitadas (∞)</span>
                    </label>
                  </div>
                  {!planFormUnlimitedCompanies ? (
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={planFormMaxCompanies}
                      onChange={(e) => setPlanFormMaxCompanies(parseInt(e.target.value) || 1)}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-emerald-400 font-bold text-center">
                      CNPJs cadastrados ilimitados
                    </div>
                  )}
                  <span className="text-[10px] text-slate-400 block">Número de empresas simultâneas atendidas</span>
                </div>

              </div>

              {/* Matriz de Campos e Módulos com Rigor */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-200 block uppercase tracking-wider">
                    Campos e Módulos Liberados neste Plano
                  </label>
                  <span className="text-[11px] text-slate-400">
                    O sistema bloqueia rigorosamente as abas não marcadas
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-4 rounded-xl bg-[#0B0F19] border border-slate-800 text-xs">
                  
                  <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-slate-100">
                    <input
                      type="checkbox"
                      checked={planFormAllowedModules.dashboard}
                      onChange={(e) => setPlanFormAllowedModules({ ...planFormAllowedModules, dashboard: e.target.checked })}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-900"
                    />
                    <span>📊 Painel de Diagnóstico & Metas</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-slate-100">
                    <input
                      type="checkbox"
                      checked={planFormAllowedModules.auditoria_digital}
                      onChange={(e) => setPlanFormAllowedModules({ ...planFormAllowedModules, auditoria_digital: e.target.checked })}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-900"
                    />
                    <span>🔍 Módulo Auditoria Digital (Fator R & PGDAS)</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-slate-100">
                    <input
                      type="checkbox"
                      checked={planFormAllowedModules.planejamento_tributario}
                      onChange={(e) => setPlanFormAllowedModules({ ...planFormAllowedModules, planejamento_tributario: e.target.checked })}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-900"
                    />
                    <span>⚖️ Módulo Planejamento Tributário (Reforma & Regimes)</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-slate-100">
                    <input
                      type="checkbox"
                      checked={planFormAllowedModules.financeiro_gerencial}
                      onChange={(e) => setPlanFormAllowedModules({ ...planFormAllowedModules, financeiro_gerencial: e.target.checked })}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-900"
                    />
                    <span>💰 Módulo Financeiro Gerencial (DRE & Balancete)</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-slate-100">
                    <input
                      type="checkbox"
                      checked={planFormAllowedModules.consultoria_fiscal}
                      onChange={(e) => setPlanFormAllowedModules({ ...planFormAllowedModules, consultoria_fiscal: e.target.checked })}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-900"
                    />
                    <span>📑 Módulo Consultoria Fiscal (NCM & CFOP)</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-slate-100">
                    <input
                      type="checkbox"
                      checked={planFormAllowedModules.legal_societario}
                      onChange={(e) => setPlanFormAllowedModules({ ...planFormAllowedModules, legal_societario: e.target.checked })}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-900"
                    />
                    <span>🏢 Módulo Legal & Societário (Contratos)</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-slate-100">
                    <input
                      type="checkbox"
                      checked={planFormAllowedModules.ai_auditor}
                      onChange={(e) => setPlanFormAllowedModules({ ...planFormAllowedModules, ai_auditor: e.target.checked })}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-900"
                    />
                    <span>🤖 Auditor Fiscal Inteligente (Gemini IA)</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-slate-100">
                    <input
                      type="checkbox"
                      checked={planFormAllowedModules.agenda_fiscal}
                      onChange={(e) => setPlanFormAllowedModules({ ...planFormAllowedModules, agenda_fiscal: e.target.checked })}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-900"
                    />
                    <span>📅 Agenda de Obrigações & Vencimentos</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-slate-100">
                    <input
                      type="checkbox"
                      checked={planFormAllowedModules.partner_portal}
                      onChange={(e) => setPlanFormAllowedModules({ ...planFormAllowedModules, partner_portal: e.target.checked })}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-900"
                    />
                    <span className="text-emerald-400 font-bold">🤝 Portal do Parceiro Homologado</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-slate-100">
                    <input
                      type="checkbox"
                      checked={planFormAllowedModules.financeiro}
                      onChange={(e) => setPlanFormAllowedModules({ ...planFormAllowedModules, financeiro: e.target.checked })}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-900"
                    />
                    <span className="text-emerald-400 font-bold">💼 Painel Financeiro & DRE Gerencial</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-slate-100">
                    <input
                      type="checkbox"
                      checked={planFormAllowedModules.ai_auditor}
                      onChange={(e) => setPlanFormAllowedModules({ ...planFormAllowedModules, ai_auditor: e.target.checked })}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-900"
                    />
                    <span className="text-purple-400 font-bold">✨ Auditor Fiscal IA Gemini</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-slate-100">
                    <input
                      type="checkbox"
                      checked={planFormAllowedModules.parecer}
                      onChange={(e) => setPlanFormAllowedModules({ ...planFormAllowedModules, parecer: e.target.checked })}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-900"
                    />
                    <span>📋 Parecer Técnico & Laudo Pericial</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-slate-100">
                    <input
                      type="checkbox"
                      checked={planFormAllowedModules.historico}
                      onChange={(e) => setPlanFormAllowedModules({ ...planFormAllowedModules, historico: e.target.checked })}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-900"
                    />
                    <span>🗄️ Histórico de Auditorias Salvas</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-slate-100">
                    <input
                      type="checkbox"
                      checked={planFormAllowedModules.consultas}
                      onChange={(e) => setPlanFormAllowedModules({ ...planFormAllowedModules, consultas: e.target.checked })}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-900"
                    />
                    <span>🔍 Consultas Fiscais de NCM & CNAE</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-slate-100">
                    <input
                      type="checkbox"
                      checked={planFormAllowedModules.bpo}
                      onChange={(e) => setPlanFormAllowedModules({ ...planFormAllowedModules, bpo: e.target.checked })}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-900"
                    />
                    <span>📑 Rotinas de BPO e Gestão Contábil</span>
                  </label>

                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPlanEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-xs cursor-pointer flex items-center space-x-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Parâmetros do Plano</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 5: EXCLUSÃO COM RIGOR (CLIENTES / OPERADORES)
      ======================================================== */}
      {deleteConfirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-xs p-4">
          <div className="bg-[#0F172A] border border-rose-900/60 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            
            <div className="flex items-start space-x-3.5">
              <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800/80 text-rose-400 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-100">{deleteConfirmModal.title}</h3>
                <p className="text-xs text-rose-300/90 font-medium">Ação restrita ao perfil Master com rigor</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-100">{deleteConfirmModal.name}</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{deleteConfirmModal.detail}</p>
            </div>

            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900/50 text-[11px] text-rose-200">
              ⚠️ Esta operação revogará o login no sistema imediatamente e não poderá ser desfeita.
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center space-x-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir com Rigor</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 6: CONFIGURADOR DE PLANO SOB MEDIDA (PRO-RATA & MÓDULOS)
      ======================================================== */}
      {isCustomPlanModalOpen && (
        <CustomPlanBuilderModal
          isOpen={isCustomPlanModalOpen}
          onClose={() => {
            setIsCustomPlanModalOpen(false);
            setCustomPlanSubTarget(null);
          }}
          initialValues={{
            periodicity: customPlanSubTarget?.periodicity || 'mensal',
            preferredDueDay: customPlanSubTarget?.preferredDueDay || 10,
            usersCount: customPlanSubTarget?.maxUsersAllowed || 5,
            companiesCount: customPlanSubTarget?.maxCompaniesAllowed || 30,
            selectedModules: customPlanSubTarget?.allowedModules,
          }}
          onSavePlan={handleSaveCustomPlanFromModal}
        />
      )}

      {/* ========================================================
          MODAL 7: RESCISÃO & APURAÇÃO PRO-RATA COM CDC (ART. 49)
      ======================================================== */}
      {isCancellationModalOpen && cancellationSubTarget && (
        <CancellationSettlementModal
          isOpen={isCancellationModalOpen}
          onClose={() => {
            setIsCancellationModalOpen(false);
            setCancellationSubTarget(null);
          }}
          subscription={cancellationSubTarget}
          onConfirmCancellation={handleConfirmAdminCancellation}
        />
      )}

      {/* ========================================================
          MODAL 8: EMISSÃO DE NFS-E NACIONAL GOV.BR
      ======================================================== */}
      {isNfseModalOpen && selectedNfseInvoice && (
        <NfseNacionalModal
          isOpen={isNfseModalOpen}
          onClose={() => {
            setIsNfseModalOpen(false);
            setSelectedNfseInvoice(null);
          }}
          invoice={selectedNfseInvoice}
          bankConfig={bankConfig}
        />
      )}

    </div>
  );
};
