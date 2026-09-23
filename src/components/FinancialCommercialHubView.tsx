import React, { useState, useEffect, useMemo } from 'react';
import {
  DollarSign,
  Users,
  FileText,
  CreditCard,
  Building2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Plus,
  Filter,
  Download,
  Printer,
  QrCode,
  Barcode,
  Sparkles,
  Send,
  Eye,
  ShieldCheck,
  Settings,
  Scale,
  Percent,
  Check,
  RotateCcw,
  Copy,
  ExternalLink,
  Trash2,
  Edit,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Layers,
  HelpCircle,
  Mail,
  Phone,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { 
  CompanyData, 
  AuthUser, 
  AppViewMode, 
  BankConfig, 
  BillingInvoice, 
  SoldSubscription, 
  PlanPeriodicity,
  NfseNacionalData,
  CalculationResult
} from '../types';
import { 
  DEFAULT_BANK_CONFIG, 
  INITIAL_SOLD_SUBSCRIPTIONS, 
  INITIAL_INVOICES,
  generatePixCopiaECola,
  generateBoletoLinhaDigitavel
} from '../data/adminBillingData';
import { formatCurrencyBRL, formatPercentBR } from '../utils/taxRules';
import { BoletoPixModal } from './BoletoPixModal';
import { NfseNacionalModal } from './NfseNacionalModal';
import { NfseNacionalService } from '../utils/nfseService';
import { BrandLogo } from './BrandLogo';
import { jsPDF } from 'jspdf';

export type FinancialHubSubTab = 
  | 'visao_geral'
  | 'clientes_contratos'
  | 'faturamento_cobrancas'
  | 'central_nfse_honorarios'
  | 'dre_fluxo_caixa'
  | 'configuracoes_financeiras';

interface FinancialCommercialHubViewProps {
  currentCompany: CompanyData;
  currentUser?: AuthUser | null;
  calculation?: CalculationResult;
  viewMode?: AppViewMode;
  showToast?: (msg: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  defaultSubTab?: FinancialHubSubTab;
}

export const FinancialCommercialHubView: React.FC<FinancialCommercialHubViewProps> = ({
  currentCompany,
  currentUser,
  calculation,
  viewMode = 'escritorio',
  showToast,
  defaultSubTab = 'visao_geral'
}) => {
  // Navigation Subtabs
  const [activeSubTab, setActiveSubTab] = useState<FinancialHubSubTab>(defaultSubTab);

  // Sync state if defaultSubTab prop changes
  useEffect(() => {
    if (defaultSubTab) {
      setActiveSubTab(defaultSubTab);
    }
  }, [defaultSubTab]);

  // Toast Helper
  const triggerToast = (msg: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    if (showToast) {
      showToast(msg, type);
    }
  };

  // ==========================================
  // PERSISTED DATA STATES
  // ==========================================
  
  // 1. Subscriptions / Clients Contracts
  const [subscriptions, setSubscriptions] = useState<SoldSubscription[]>(() => {
    try {
      const saved = localStorage.getItem('sna_admin_subscriptions');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_SOLD_SUBSCRIPTIONS;
  });

  // 2. Invoices / Faturamento & Cobranças
  const [invoices, setInvoices] = useState<BillingInvoice[]>(() => {
    try {
      const saved = localStorage.getItem('sna_admin_invoices');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_INVOICES;
  });

  // 3. Bank & Billing Settings
  const [bankConfig, setBankConfig] = useState<BankConfig>(() => {
    try {
      const saved = localStorage.getItem('sna_admin_bank_config');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_BANK_CONFIG;
  });

  // 4. Issued NFS-e Records for Office Services / Honorários
  const [issuedNfses, setIssuedNfses] = useState<NfseNacionalData[]>(() => {
    try {
      const saved = localStorage.getItem('sna_nfse_commercial_invoices');
      if (saved) return JSON.parse(saved);
    } catch {}
    
    // Default initial honorários NFS-e seed
    return [
      {
        numeroNfse: '202600000089',
        serie: 'E',
        chaveAcesso50: '35260945892120000134000100000000089100189219',
        codigoVerificacao: 'VF89-2026-NFS',
        dataEmissao: '2026-09-05T10:30:00.000Z',
        competencia: '09/2026',
        status: 'emitida',
        codigoTributacaoNacional: '17.19.01',
        descricaoServico: 'Prestação de serviços contábeis, escrituração fiscal, conformidade tributária e assessoria mensal referente ao mês de Setembro/2026.',
        valorServico: 990.00,
        aliquotaIss: 2.5,
        valorIss: 24.75,
        issRetido: false,
        baseCalculo: 990.00,
        valorLiquido: 990.00,
        prestador: {
          cnpj: bankConfig.beneficiaryDocument || '45.892.120/0001-34',
          razaoSocial: bankConfig.beneficiaryName || 'Vieira Consultoria & Inteligência Tributária ME',
          endereco: 'Av. Paulista, 1000',
          municipio: 'São Paulo',
          uf: 'SP'
        },
        tomador: {
          cpfCnpj: '12.345.678/0001-90',
          razaoSocial: 'Tech Solutions Consultoria em Software Ltda',
          email: 'financeiro@techsolutions.com.br',
          municipio: 'São Paulo',
          uf: 'SP'
        }
      },
      {
        numeroNfse: '202600000088',
        serie: 'E',
        chaveAcesso50: '35260945892120000134000100000000088100189220',
        codigoVerificacao: 'VF88-2026-NFS',
        dataEmissao: '2026-09-02T14:15:00.000Z',
        competencia: '09/2026',
        status: 'emitida',
        codigoTributacaoNacional: '17.01.01',
        descricaoServico: 'Honorários de auditoria tributária preventiva, revisão do Fator R e diagnóstico de enquadramento do Simples Nacional.',
        valorServico: 1890.00,
        aliquotaIss: 2.5,
        valorIss: 47.25,
        issRetido: false,
        baseCalculo: 1890.00,
        valorLiquido: 1890.00,
        prestador: {
          cnpj: bankConfig.beneficiaryDocument || '45.892.120/0001-34',
          razaoSocial: bankConfig.beneficiaryName || 'Vieira Consultoria & Inteligência Tributária ME',
          endereco: 'Av. Paulista, 1000',
          municipio: 'São Paulo',
          uf: 'SP'
        },
        tomador: {
          cpfCnpj: '23.456.789/0001-01',
          razaoSocial: 'Alpha Engenharia e Projetos Estruturais S/S',
          email: 'diretoria@alphaengenharia.com.br',
          municipio: 'São Paulo',
          uf: 'SP'
        }
      }
    ];
  });

  // Save changes helper
  const saveSubscriptions = (updated: SoldSubscription[]) => {
    setSubscriptions(updated);
    try { localStorage.setItem('sna_admin_subscriptions', JSON.stringify(updated)); } catch {}
  };

  const saveInvoices = (updated: BillingInvoice[]) => {
    setInvoices(updated);
    try { localStorage.setItem('sna_admin_invoices', JSON.stringify(updated)); } catch {}
  };

  const saveBankConfig = (updated: BankConfig) => {
    setBankConfig(updated);
    try { localStorage.setItem('sna_admin_bank_config', JSON.stringify(updated)); } catch {}
  };

  const saveIssuedNfses = (updated: NfseNacionalData[]) => {
    setIssuedNfses(updated);
    try { localStorage.setItem('sna_nfse_commercial_invoices', JSON.stringify(updated)); } catch {}
  };

  // ==========================================
  // MODAL STATES
  // ==========================================
  const [selectedBoletoInvoice, setSelectedBoletoInvoice] = useState<BillingInvoice | null>(null);
  const [isBoletoModalOpen, setIsBoletoModalOpen] = useState(false);

  const [selectedNfseInvoice, setSelectedNfseInvoice] = useState<BillingInvoice | null>(null);
  const [isNfseModalOpen, setIsNfseModalOpen] = useState(false);

  // New Contract Modal
  const [isNewContractModalOpen, setIsNewContractModalOpen] = useState(false);
  const [contractFormName, setContractFormName] = useState('');
  const [contractFormDoc, setContractFormDoc] = useState('');
  const [contractFormEmail, setContractFormEmail] = useState('');
  const [contractFormPhone, setContractFormPhone] = useState('');
  const [contractFormPlan, setContractFormPlan] = useState('Honorários Contábeis & Fiscais');
  const [contractFormPeriodicity, setContractFormPeriodicity] = useState<PlanPeriodicity>('mensal');
  const [contractFormPrice, setContractFormPrice] = useState('650');
  const [contractFormDueDay, setContractFormDueDay] = useState('10');
  const [contractFormLoyalty, setContractFormLoyalty] = useState('12');

  // New Invoice Modal
  const [isNewInvoiceModalOpen, setIsNewInvoiceModalOpen] = useState(false);
  const [invoiceFormCustomer, setInvoiceFormCustomer] = useState('');
  const [invoiceFormDoc, setInvoiceFormDoc] = useState('');
  const [invoiceFormEmail, setInvoiceFormEmail] = useState('');
  const [invoiceFormDescription, setInvoiceFormDescription] = useState('Honorários Contábeis & Auditoria Mensal');
  const [invoiceFormAmount, setInvoiceFormAmount] = useState('650');
  const [invoiceFormDueDate, setInvoiceFormDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 10);
    return d.toISOString().split('T')[0];
  });
  const [invoiceFormMethod, setInvoiceFormMethod] = useState<'boleto' | 'pix' | 'cartao'>('pix');

  // Quick Search Filters
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [clientStatusFilter, setClientStatusFilter] = useState<'all' | 'ativa' | 'atrasada' | 'pendente_pagamento' | 'cancelada'>('all');

  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<'all' | 'pago' | 'pendente' | 'vencido'>('all');

  // ==========================================
  // REAL-TIME FINANCIAL KPIs COMPUTATION
  // ==========================================
  const financialMetrics = useMemo(() => {
    const totalClients = subscriptions.length;
    const activeClients = subscriptions.filter(s => s.status === 'ativa');
    const overdueClients = subscriptions.filter(s => s.status === 'atrasada');
    const pendingClients = subscriptions.filter(s => s.status === 'pendente_pagamento');
    const canceledClients = subscriptions.filter(s => s.status === 'cancelada');

    // Monthly Recurring Revenue (MRR)
    const mrr = activeClients.reduce((acc, curr) => {
      let monthlyRate = curr.pricePaid;
      if (curr.periodicity === 'trimestral') monthlyRate = curr.pricePaid / 3;
      else if (curr.periodicity === 'semestral') monthlyRate = curr.pricePaid / 6;
      else if (curr.periodicity === 'anual') monthlyRate = curr.pricePaid / 12;
      return acc + (monthlyRate || 0);
    }, 0);

    // Overdue amount (Inadimplência)
    const overdueInvoices = invoices.filter(inv => inv.status === 'vencido');
    const overdueAmount = overdueInvoices.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    // Default rate (%)
    const totalInvoiced = invoices.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const defaultRatePercent = totalInvoiced > 0 ? (overdueAmount / totalInvoiced) * 100 : 0;

    // Invoices breakdown
    const paidInvoices = invoices.filter(inv => inv.status === 'pago');
    const totalPaidAmount = paidInvoices.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    const pendingInvoices = invoices.filter(inv => inv.status === 'pendente');
    const totalPendingAmount = pendingInvoices.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    // Average Ticket
    const avgTicket = activeClients.length > 0 ? mrr / activeClients.length : 0;

    // Total Issued NFS-e
    const totalNfseAmount = issuedNfses.reduce((acc, curr) => acc + (curr.valorServico || 0), 0);
    const totalIssRetido = issuedNfses.reduce((acc, curr) => acc + (curr.valorIss || 0), 0);

    return {
      totalClients,
      activeClientsCount: activeClients.length,
      overdueClientsCount: overdueClients.length,
      pendingClientsCount: pendingClients.length,
      canceledClientsCount: canceledClients.length,
      mrr,
      overdueAmount,
      defaultRatePercent,
      totalInvoiced,
      totalPaidAmount,
      totalPendingAmount,
      avgTicket,
      totalNfseCount: issuedNfses.length,
      totalNfseAmount,
      totalIssRetido
    };
  }, [subscriptions, invoices, issuedNfses]);

  // Filtered Subscriptions
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(sub => {
      const matchQuery = 
        !clientSearchQuery.trim() ||
        sub.customerName.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
        sub.companyName.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
        sub.customerDocument.includes(clientSearchQuery) ||
        (sub.customerEmail && sub.customerEmail.toLowerCase().includes(clientSearchQuery.toLowerCase()));

      const matchStatus = clientStatusFilter === 'all' || sub.status === clientStatusFilter;
      return matchQuery && matchStatus;
    });
  }, [subscriptions, clientSearchQuery, clientStatusFilter]);

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchQuery = 
        !invoiceSearchQuery.trim() ||
        inv.customerName.toLowerCase().includes(invoiceSearchQuery.toLowerCase()) ||
        inv.customerDocument.includes(invoiceSearchQuery) ||
        inv.id.toLowerCase().includes(invoiceSearchQuery.toLowerCase()) ||
        (inv.customerEmail && inv.customerEmail.toLowerCase().includes(invoiceSearchQuery.toLowerCase()));

      const matchStatus = invoiceStatusFilter === 'all' || inv.status === invoiceStatusFilter;
      return matchQuery && matchStatus;
    });
  }, [invoices, invoiceSearchQuery, invoiceStatusFilter]);

  // ==========================================
  // ACTION HANDLERS
  // ==========================================

  // 1. Mark Invoice as Paid (Manual Conciliation)
  const handleMarkInvoiceAsPaid = (invoiceId: string) => {
    const updated = invoices.map(inv => {
      if (inv.id === invoiceId) {
        return {
          ...inv,
          status: 'pago' as const,
          paidAt: new Date().toISOString()
        };
      }
      return inv;
    });
    saveInvoices(updated);

    // If client had overdue subscription, reactivate
    const targetInvoice = invoices.find(i => i.id === invoiceId);
    if (targetInvoice) {
      const updatedSubs = subscriptions.map(sub => {
        if (sub.customerDocument === targetInvoice.customerDocument && sub.status === 'atrasada') {
          return { ...sub, status: 'ativa' as const, lastPaymentDate: new Date().toISOString() };
        }
        return sub;
      });
      saveSubscriptions(updatedSubs);
    }

    triggerToast(`Fatura ${invoiceId} baixada com sucesso! Pagamento confirmado.`, 'success');
  };

  // 2. Open Boleto / Pix Modal for an Invoice
  const handleOpenBoletoPix = (invoice: BillingInvoice) => {
    setSelectedBoletoInvoice(invoice);
    setIsBoletoModalOpen(true);
  };

  // 3. Open NFS-e Modal for an Invoice
  const handleOpenNfse = (invoice: BillingInvoice) => {
    setSelectedNfseInvoice(invoice);
    setIsNfseModalOpen(true);
  };

  // 4. Create New Customer Contract
  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractFormName.trim() || !contractFormDoc.trim()) {
      triggerToast('Informe a Razão Social e o CNPJ/CPF do cliente.', 'warning');
      return;
    }

    const price = parseFloat(contractFormPrice) || 650;
    const dueDay = parseInt(contractFormDueDay) || 10;
    const loyalty = parseInt(contractFormLoyalty) || 12;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + loyalty);

    const nextBilling = new Date();
    nextBilling.setDate(dueDay);
    if (nextBilling < new Date()) {
      nextBilling.setMonth(nextBilling.getMonth() + 1);
    }

    const newSub: SoldSubscription = {
      id: `sub_${Date.now()}`,
      customerName: contractFormName.trim(),
      customerEmail: contractFormEmail.trim() || 'financeiro@cliente.com.br',
      customerDocument: contractFormDoc.trim(),
      customerPhone: contractFormPhone.trim() || '(11) 98765-4321',
      companyName: contractFormName.trim(),
      planId: 'custom_contract',
      planName: contractFormPlan,
      periodicity: contractFormPeriodicity,
      pricePaid: price,
      originalPrice: price,
      billingMethod: 'pix',
      status: 'ativa',
      startDate: startDate.toISOString(),
      contractEndDate: endDate.toISOString(),
      nextBillingDate: nextBilling.toISOString().split('T')[0],
      loyaltyMonths: loyalty,
      terminationFinePercent: 20,
      usersCount: 2,
      maxUsersAllowed: 5,
      preferredDueDay: dueDay,
      contractNumber: `CTR-${new Date().getFullYear()}/${String(subscriptions.length + 1).padStart(4, '0')}`,
      contractAccepted: true,
      contractSignedAt: new Date().toISOString()
    };

    const updatedSubs = [newSub, ...subscriptions];
    saveSubscriptions(updatedSubs);

    const nossoNumero = `318920${String(invoices.length + 1).padStart(4, '0')}`;
    const boletoData = generateBoletoLinhaDigitavel(bankConfig.bankCode, newSub.pricePaid, nossoNumero);
    const pixCode = generatePixCopiaECola({
      pixKey: bankConfig.pixKey,
      beneficiaryName: bankConfig.beneficiaryName,
      cityName: bankConfig.pixCity || 'Sao Paulo',
      amount: newSub.pricePaid,
      txId: `FAT${newSub.id.slice(0, 15)}`
    });

    // Automatically generate first invoice
    const newInvoice: BillingInvoice = {
      id: `FAT-${Date.now().toString().slice(-6)}`,
      subscriptionId: newSub.id,
      customerName: newSub.customerName,
      customerDocument: newSub.customerDocument,
      customerEmail: newSub.customerEmail,
      planName: newSub.planName,
      amount: newSub.pricePaid,
      originalAmount: newSub.pricePaid,
      dueDate: newSub.nextBillingDate,
      issueDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'pix',
      periodicity: newSub.periodicity,
      status: 'pendente',
      linhaDigitavel: boletoData.linhaDigitavel,
      nossoNumero: nossoNumero,
      codigoBarras: boletoData.codigoBarras,
      pixCopiaECola: pixCode,
      txId: `TXID${Date.now()}`
    };

    saveInvoices([newInvoice, ...invoices]);

    setIsNewContractModalOpen(false);
    setContractFormName('');
    setContractFormDoc('');
    setContractFormEmail('');
    setContractFormPhone('');

    triggerToast(`Contrato ${newSub.contractNumber} e 1ª cobrança criados com sucesso!`, 'success');
  };

  // 5. Create Standalone Invoice
  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceFormCustomer.trim() || !invoiceFormDoc.trim()) {
      triggerToast('Informe o nome do cliente e o documento.', 'warning');
      return;
    }

    const amt = parseFloat(invoiceFormAmount) || 500;
    const newInvId = `FAT-${Date.now().toString().slice(-6)}`;
    const nossoNumero = `318920${String(invoices.length + 1).padStart(4, '0')}`;
    const boletoData = generateBoletoLinhaDigitavel(bankConfig.bankCode, amt, nossoNumero);
    const pixCode = generatePixCopiaECola({
      pixKey: bankConfig.pixKey,
      beneficiaryName: bankConfig.beneficiaryName,
      cityName: bankConfig.pixCity || 'Sao Paulo',
      amount: amt,
      txId: newInvId.replace(/\D/g, '') || 'FAT01'
    });

    const newInvoice: BillingInvoice = {
      id: newInvId,
      subscriptionId: `sub_direct_${Date.now()}`,
      customerName: invoiceFormCustomer.trim(),
      customerDocument: invoiceFormDoc.trim(),
      customerEmail: invoiceFormEmail.trim() || 'cliente@email.com',
      planName: invoiceFormDescription.trim() || 'Prestação de Serviços Contábeis',
      amount: amt,
      originalAmount: amt,
      dueDate: invoiceFormDueDate,
      issueDate: new Date().toISOString().split('T')[0],
      paymentMethod: invoiceFormMethod,
      status: 'pendente',
      linhaDigitavel: boletoData.linhaDigitavel,
      nossoNumero: nossoNumero,
      codigoBarras: boletoData.codigoBarras,
      pixCopiaECola: pixCode,
      txId: `TXID${Date.now()}`
    };

    saveInvoices([newInvoice, ...invoices]);
    setIsNewInvoiceModalOpen(false);
    triggerToast(`Fatura ${newInvId} emitida com sucesso!`, 'success');
  };

  // 6. Generate PDF Contract Document
  const handleDownloadContractPdf = (sub: SoldSubscription) => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 38, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('INSTRUMENTO PARTICULAR DE PRESTAÇÃO DE SERVIÇOS', 14, 18);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Contrato Nº: ${sub.contractNumber || 'CTR-2026/001'} | Vértice Auditoria & Gestão Contábil`, 14, 28);

      // Body text
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(10);
      let y = 50;

      doc.setFont('helvetica', 'bold');
      doc.text('1. DAS PARTES CONTRATANTES', 14, y);
      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.text(`CONTRATADA: ${bankConfig.beneficiaryName}, CNPJ nº ${bankConfig.beneficiaryDocument}.`, 14, y);
      y += 6;
      doc.text(`CONTRATANTE: ${sub.customerName}, inscrita no CNPJ/CPF nº ${sub.customerDocument}.`, 14, y);
      y += 12;

      doc.setFont('helvetica', 'bold');
      doc.text('2. DO OBJETO E ESCOPO DOS SERVIÇOS', 14, y);
      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.text(`O presente instrumento tem por objeto a prestação de serviços de: "${sub.planName}",`, 14, y);
      y += 6;
      doc.text(`compreendendo escrituração fiscal, conformidade tributária, auditoria preventiva e suporte técnico.`, 14, y);
      y += 12;

      doc.setFont('helvetica', 'bold');
      doc.text('3. DO VALOR DOS HONORÁRIOS E FORMA DE PAGAMENTO', 14, y);
      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.text(`Pelos serviços prestados, a CONTRATANTE pagará à CONTRATADA o valor de ${formatCurrencyBRL(sub.pricePaid)}`, 14, y);
      y += 6;
      doc.text(`com periodicidade ${sub.periodicity.toUpperCase()}, com vencimento todo dia ${sub.preferredDueDay || 10} de cada mês.`, 14, y);
      y += 12;

      doc.setFont('helvetica', 'bold');
      doc.text('4. DO PRAZO DE VIGÊNCIA E REAJUSTE ANUAL', 14, y);
      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.text(`O contrato vigorará pelo prazo de ${sub.loyaltyMonths || 12} meses, sendo renovado automaticamente.`, 14, y);
      y += 6;
      doc.text(`Os honorários serão reajustados anualmente pela variação acumulada do IPCA/IBGE.`, 14, y);
      y += 12;

      doc.setFont('helvetica', 'bold');
      doc.text('5. DO ACEITE E ASSINATURA ELETRÔNICA', 14, y);
      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.text(`As partes declaram a validade jurídica deste contrato assinado digitalmente nos termos da MP 2.200-2/01.`, 14, y);
      y += 6;
      doc.text(`Data de Assinatura: ${new Date(sub.startDate).toLocaleDateString('pt-BR')} | Status: VIGENTE`, 14, y);
      y += 20;

      // Signature line
      doc.line(14, y, 90, y);
      doc.line(120, y, 196, y);
      y += 6;
      doc.setFontSize(8);
      doc.text('CONTRATADA (Responsável Técnico)', 14, y);
      doc.text('CONTRATANTE (Representante Legal)', 120, y);

      doc.save(`Contrato_${sub.contractNumber || 'Servicos'}_${sub.customerName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
      triggerToast('Contrato em PDF gerado e baixado com sucesso!', 'success');
    } catch (err) {
      triggerToast('Erro ao gerar PDF do contrato.', 'error');
    }
  };

  // 7. Readjust Subscription Value by Inflation Index
  const handleApplyIndexReadjustment = (subId: string, percent: number) => {
    const updated = subscriptions.map(s => {
      if (s.id === subId) {
        const newPrice = Math.round(s.pricePaid * (1 + percent / 100) * 100) / 100;
        return {
          ...s,
          pricePaid: newPrice,
          notes: `${s.notes || ''} [Reajuste anual de ${percent}% aplicado em ${new Date().toLocaleDateString('pt-BR')}]`
        };
      }
      return s;
    });
    saveSubscriptions(updated);
    triggerToast(`Honorários do cliente reajustados em +${percent}% com sucesso!`, 'success');
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="w-full space-y-6 animate-fade-in font-sans pb-16">
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & REAL-TIME FINANCIAL EXECUTIVE KPI STRIP                   */}
      {/* ========================================================================= */}
      <div className="bg-[#0D1527] border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 rounded-2xl shadow-inner">
              <DollarSign className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 bg-emerald-950/70 px-2.5 py-0.5 rounded-full border border-emerald-800/60 uppercase">
                  Gestão Financeira & Comercial Unificada
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  • {bankConfig.beneficiaryName}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                Central de Faturamento, Contratos & Honorários
              </h1>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsNewContractModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-600/20 flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Contrato / Cliente</span>
            </button>

            <button
              onClick={() => setIsNewInvoiceModalOpen(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-600/20 flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Emitir Cobrança (Boleto/PIX)</span>
            </button>

            <button
              onClick={() => setActiveSubTab('configuracoes_financeiras')}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition border border-slate-700 cursor-pointer"
              title="Configurações Bancárias & PIX"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Real-time Financial KPIs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-5">
          
          {/* Card 1: Clientes Ativos */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-semibold">Clientes Ativos</span>
              <Users className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-black text-white">
              {financialMetrics.activeClientsCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 truncate">
              Total na base: <span className="text-slate-200 font-bold">{financialMetrics.totalClients}</span>
            </div>
          </div>

          {/* Card 2: Inadimplência */}
          <div className={`p-3.5 rounded-xl border transition ${
            financialMetrics.overdueClientsCount > 0 
              ? 'bg-rose-950/30 border-rose-500/40 text-rose-200' 
              : 'bg-slate-900/90 border-slate-800/90 text-slate-200'
          }`}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-rose-300">Inadimplentes</span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-xl font-black text-rose-400">
              {financialMetrics.overdueClientsCount}
              <span className="text-xs font-normal text-rose-300 ml-1.5">
                ({financialMetrics.defaultRatePercent.toFixed(1)}%)
              </span>
            </div>
            <div className="text-[11px] text-rose-300/80 mt-1 truncate">
              Vencido: <span className="font-bold">{formatCurrencyBRL(financialMetrics.overdueAmount)}</span>
            </div>
          </div>

          {/* Card 3: MRR / Faturamento Mensal Recorrente */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-semibold">Receita Mensal (MRR)</span>
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-xl font-black text-emerald-400">
              {formatCurrencyBRL(financialMetrics.mrr)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 truncate">
              Ticket Médio: <span className="text-slate-200 font-bold">{formatCurrencyBRL(financialMetrics.avgTicket)}</span>
            </div>
          </div>

          {/* Card 4: Faturas Recebidas (Pagas) */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-semibold">Recebido no Mês</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-black text-white">
              {formatCurrencyBRL(financialMetrics.totalPaidAmount)}
            </div>
            <div className="text-[11px] text-emerald-400/90 mt-1 truncate">
              Conciliado e baixado
            </div>
          </div>

          {/* Card 5: Boletos / PIX a Receber */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-semibold">A Receber (Pendentes)</span>
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-black text-amber-300">
              {formatCurrencyBRL(financialMetrics.totalPendingAmount)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 truncate">
              Previsão de caixa
            </div>
          </div>

          {/* Card 6: Central de Notas Emitidas */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-semibold">NFS-e Honorários</span>
              <FileText className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-xl font-black text-purple-300">
              {financialMetrics.totalNfseCount}
            </div>
            <div className="text-[11px] text-purple-300/80 mt-1 truncate">
              Total: <span className="font-bold">{formatCurrencyBRL(financialMetrics.totalNfseAmount)}</span>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SUBTABS NAVIGATION BAR                                                 */}
      {/* ========================================================================= */}
      <div className="flex items-center space-x-1.5 bg-[#090D16] p-1.5 rounded-2xl border border-slate-800 overflow-x-auto">
        
        <button
          onClick={() => setActiveSubTab('visao_geral')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 cursor-pointer ${
            activeSubTab === 'visao_geral'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Visão Geral & Indicadores</span>
        </button>

        <button
          onClick={() => setActiveSubTab('clientes_contratos')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 cursor-pointer ${
            activeSubTab === 'clientes_contratos'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Clientes & Contratos ({subscriptions.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('faturamento_cobrancas')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 cursor-pointer ${
            activeSubTab === 'faturamento_cobrancas'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Faturamento, Boletos & PIX ({invoices.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('central_nfse_honorarios')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 cursor-pointer ${
            activeSubTab === 'central_nfse_honorarios'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Central de Notas Emitidas ({issuedNfses.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('dre_fluxo_caixa')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 cursor-pointer ${
            activeSubTab === 'dre_fluxo_caixa'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>DRE & Fluxo de Caixa</span>
        </button>

        <button
          onClick={() => setActiveSubTab('configuracoes_financeiras')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 cursor-pointer ${
            activeSubTab === 'configuracoes_financeiras'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Configurações do Setor</span>
        </button>

      </div>

      {/* ========================================================================= */}
      {/* 3. SUBTAB CONTENTS                                                        */}
      {/* ========================================================================= */}

      {/* ------------------------------------------------------------------------- */}
      {/* SUBTAB 1: VISÃO GERAL & DASHBOARD EXECUTIVO                               */}
      {/* ------------------------------------------------------------------------- */}
      {activeSubTab === 'visao_geral' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Box 1: Régua de Inadimplência e Ações Preventivas */}
            <div className="lg:col-span-2 bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Régua de Cobrança & Gestão de Inadimplência
                    </h3>
                    <p className="text-xs text-slate-400">
                      Monitoramento ativo de clientes com pendências financeiras e avisos automáticos.
                    </p>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 bg-slate-800 text-slate-300 rounded-full font-bold">
                  {financialMetrics.overdueClientsCount} clientes em atraso
                </span>
              </div>

              {financialMetrics.overdueClientsCount === 0 ? (
                <div className="p-8 text-center bg-emerald-950/20 border border-emerald-500/20 rounded-xl">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-white">Parabéns! Zero Inadimplência no momento.</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    Todas as cobranças e contratos estão 100% em dia ou dentro do prazo regular de vencimento.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {subscriptions
                    .filter(s => s.status === 'atrasada')
                    .map(sub => (
                      <div key={sub.id} className="p-3.5 rounded-xl bg-slate-900/90 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 animate-ping" />
                          <div>
                            <div className="font-bold text-white text-sm flex items-center space-x-2">
                              <span>{sub.customerName}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800/60 font-mono">
                                {sub.customerDocument}
                              </span>
                            </div>
                            <div className="text-xs text-slate-400">
                              Plano: <strong className="text-slate-300">{sub.planName}</strong> | Valor: <strong className="text-rose-400">{formatCurrencyBRL(sub.pricePaid)}</strong> | Vencimento: {sub.nextBillingDate}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            onClick={() => {
                              const relatedInvoice = invoices.find(i => i.customerDocument === sub.customerDocument && i.status === 'vencido') || invoices.find(i => i.customerDocument === sub.customerDocument);
                              if (relatedInvoice) {
                                handleOpenBoletoPix(relatedInvoice);
                              } else {
                                triggerToast('Nenhuma fatura encontrada. Crie uma nova cobrança.', 'info');
                              }
                            }}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>Gerar PIX / Boleto</span>
                          </button>

                          <button
                            onClick={() => {
                              const phone = sub.customerPhone?.replace(/\D/g, '') || '5511999999999';
                              const msg = encodeURIComponent(`Olá ${sub.customerName}, identificamos uma pendência nos honorários contábeis (${formatCurrencyBRL(sub.pricePaid)}). Favor entrar em contato para regularização via PIX ou Boleto.`);
                              window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
                            }}
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                            title="Notificar via WhatsApp"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Box 2: Resumo Rápido de Configuração e Dados Bancários */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2.5 mb-4 border-b border-slate-800/80 pb-3">
                  <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Conta Cedente & PIX
                    </h3>
                    <p className="text-xs text-slate-400">
                      Dados ativos para recebimentos
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Banco do Escritório</span>
                    <span className="font-bold text-white text-sm">{bankConfig.bankName} (Cód {bankConfig.bankCode})</span>
                    <div className="text-slate-400 mt-0.5">Agência: {bankConfig.agency} | Conta: {bankConfig.account}-{bankConfig.accountDigit}</div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Chave PIX Principal</span>
                    <span className="font-bold text-emerald-400 font-mono text-xs break-all">{bankConfig.pixKey}</span>
                    <div className="text-slate-400 mt-0.5">Tipo: {bankConfig.pixKeyType.toUpperCase()} | Titular: {bankConfig.beneficiaryName}</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800">
                <button
                  onClick={() => setActiveSubTab('configuracoes_financeiras')}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>Alterar Parâmetros & Juros</span>
                </button>
              </div>
            </div>

          </div>

          {/* Seção de Últimas Movimentações */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Últimas Faturas & Cobranças Geradas
                  </h3>
                  <p className="text-xs text-slate-400">
                    Visão rápida das cobranças mais recentes
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveSubTab('faturamento_cobrancas')}
                className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center space-x-1 cursor-pointer"
              >
                <span>Ver Todas as Faturas</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider bg-slate-900/50">
                    <th className="py-2.5 px-3">Fatura</th>
                    <th className="py-2.5 px-3">Cliente / Tomador</th>
                    <th className="py-2.5 px-3">Serviço / Plano</th>
                    <th className="py-2.5 px-3">Vencimento</th>
                    <th className="py-2.5 px-3">Valor</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {invoices.slice(0, 5).map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-900/60 transition">
                      <td className="py-3 px-3 font-mono font-bold text-white">{inv.id}</td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-200">{inv.customerName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{inv.customerDocument}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-300">{inv.planName}</td>
                      <td className="py-3 px-3 text-slate-300">{inv.dueDate}</td>
                      <td className="py-3 px-3 font-bold text-emerald-400">{formatCurrencyBRL(inv.amount)}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          inv.status === 'pago' 
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60' 
                            : inv.status === 'vencido'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                            : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleOpenBoletoPix(inv)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-bold transition inline-flex items-center space-x-1 cursor-pointer"
                        >
                          <QrCode className="w-3 h-3 text-emerald-400" />
                          <span>Ver Cobrança</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* SUBTAB 2: CLIENTES & CONTRATOS UNIFICADOS                                 */}
      {/* ------------------------------------------------------------------------- */}
      {activeSubTab === 'clientes_contratos' && (
        <div className="space-y-5 animate-fade-in">
          
          {/* Controls & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0F172A] p-4 rounded-2xl border border-slate-800">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={clientSearchQuery}
                onChange={e => setClientSearchQuery(e.target.value)}
                placeholder="Buscar cliente por Razão Social, CNPJ ou e-mail..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={clientStatusFilter}
                onChange={(e: any) => setClientStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">Todos os Status</option>
                <option value="ativa">Ativos / Em Dia</option>
                <option value="atrasada">Inadimplentes / Atrasados</option>
                <option value="pendente_pagamento">Pendentes de Ativação</option>
                <option value="cancelada">Cancelados</option>
              </select>

              <button
                onClick={() => setIsNewContractModalOpen(true)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-600/20 flex items-center space-x-1.5 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Cadastrar Contrato</span>
              </button>
            </div>
          </div>

          {/* Contracts Table */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider bg-slate-900/70">
                    <th className="py-3 px-4">Contrato / Cliente</th>
                    <th className="py-3 px-4">Serviço / Plano</th>
                    <th className="py-3 px-4">Honorários (R$)</th>
                    <th className="py-3 px-4">Periodicidade</th>
                    <th className="py-3 px-4">Vencimento</th>
                    <th className="py-3 px-4">Vigência</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {filteredSubscriptions.map(sub => (
                    <tr key={sub.id} className="hover:bg-slate-900/50 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2.5">
                          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm">{sub.customerName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              CNPJ: {sub.customerDocument} {sub.customerEmail ? `• ${sub.customerEmail}` : ''}
                            </div>
                            <div className="text-[10px] text-emerald-400/90 font-mono mt-0.5">
                              {sub.contractNumber || 'CTR-2026/001'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-200">{sub.planName}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-black text-emerald-400 text-sm">
                          {formatCurrencyBRL(sub.pricePaid)}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {sub.periodicity === 'anual' ? '(Anual)' : sub.periodicity === 'semestral' ? '(Semestral)' : '(Mensal)'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">
                        <span className="capitalize font-medium">{sub.periodicity}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-200">Dia {sub.preferredDueDay || 10}</span>
                        <div className="text-[10px] text-slate-500">Próx: {sub.nextBillingDate}</div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">
                        <span>{sub.loyaltyMonths || 12} meses</span>
                        <div className="text-[10px] text-slate-500">
                          Início: {new Date(sub.startDate).toLocaleDateString('pt-BR')}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          sub.status === 'ativa' 
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60' 
                            : sub.status === 'atrasada'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800/60 animate-pulse'
                            : sub.status === 'cancelada'
                            ? 'bg-slate-800 text-slate-400 border border-slate-700'
                            : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                        }`}>
                          {sub.status === 'ativa' ? 'Ativo / Em Dia' : sub.status === 'atrasada' ? 'Inadimplente' : sub.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Baixar Minuta Contrato PDF */}
                          <button
                            onClick={() => handleDownloadContractPdf(sub)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition border border-slate-700 cursor-pointer"
                            title="Baixar Contrato Oficial em PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {/* Reajuste por Índice (IPCA) */}
                          <button
                            onClick={() => {
                              const percent = prompt(`Informe o percentual de reajuste anual para ${sub.customerName} (ex: 4.5 para IPCA):`, '4.5');
                              if (percent && !isNaN(parseFloat(percent))) {
                                handleApplyIndexReadjustment(sub.id, parseFloat(percent));
                              }
                            }}
                            className="p-1.5 bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 rounded-lg transition border border-blue-800/60 cursor-pointer"
                            title="Reajustar por Índice de Inflação (IPCA/IGP-M)"
                          >
                            <Percent className="w-3.5 h-3.5" />
                          </button>

                          {/* Emitir Cobrança Imediata */}
                          <button
                            onClick={() => {
                              const newInvId = `FAT-${Date.now().toString().slice(-6)}`;
                              const nossoNumero = `318920${String(invoices.length + 1).padStart(4, '0')}`;
                              const boletoData = generateBoletoLinhaDigitavel(bankConfig.bankCode, sub.pricePaid, nossoNumero);
                              const pixCode = generatePixCopiaECola({
                                pixKey: bankConfig.pixKey,
                                beneficiaryName: bankConfig.beneficiaryName,
                                cityName: bankConfig.pixCity || 'Sao Paulo',
                                amount: sub.pricePaid,
                                txId: newInvId.replace(/\D/g, '') || 'FAT01'
                              });

                              const newInv: BillingInvoice = {
                                id: newInvId,
                                subscriptionId: sub.id,
                                customerName: sub.customerName,
                                customerDocument: sub.customerDocument,
                                customerEmail: sub.customerEmail,
                                planName: sub.planName,
                                amount: sub.pricePaid,
                                originalAmount: sub.pricePaid,
                                dueDate: sub.nextBillingDate,
                                issueDate: new Date().toISOString().split('T')[0],
                                paymentMethod: 'pix',
                                periodicity: sub.periodicity,
                                status: 'pendente',
                                linhaDigitavel: boletoData.linhaDigitavel,
                                nossoNumero: nossoNumero,
                                codigoBarras: boletoData.codigoBarras,
                                pixCopiaECola: pixCode,
                                txId: `TXID${Date.now()}`
                              };
                              saveInvoices([newInv, ...invoices]);
                              handleOpenBoletoPix(newInv);
                            }}
                            className="p-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 rounded-lg transition border border-emerald-800/60 cursor-pointer"
                            title="Gerar Cobrança (Boleto/PIX)"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* SUBTAB 3: FATURAMENTO, COBRANÇAS, BOLETOS & PIX                           */}
      {/* ------------------------------------------------------------------------- */}
      {activeSubTab === 'faturamento_cobrancas' && (
        <div className="space-y-5 animate-fade-in">
          
          {/* Controls & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0F172A] p-4 rounded-2xl border border-slate-800">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={invoiceSearchQuery}
                onChange={e => setInvoiceSearchQuery(e.target.value)}
                placeholder="Buscar por fatura, cliente, CNPJ ou e-mail..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={invoiceStatusFilter}
                onChange={(e: any) => setInvoiceStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="all">Todas as Cobranças</option>
                <option value="pago">Pagas / Conciliadas</option>
                <option value="pendente">Pendentes a Vencer</option>
                <option value="vencido">Vencidas (Inadimplentes)</option>
              </select>

              <button
                onClick={() => setIsNewInvoiceModalOpen(true)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-600/20 flex items-center space-x-1.5 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Cobrança Avulsa</span>
              </button>
            </div>
          </div>

          {/* Invoices List Table */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider bg-slate-900/70">
                    <th className="py-3 px-4">Fatura / Nº</th>
                    <th className="py-3 px-4">Cliente / Tomador</th>
                    <th className="py-3 px-4">Descrição do Serviço</th>
                    <th className="py-3 px-4">Vencimento</th>
                    <th className="py-3 px-4">Valor</th>
                    <th className="py-3 px-4">Forma</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {filteredInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-900/50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        {inv.id}
                        <div className="text-[10px] text-slate-500 font-normal">Emissão: {inv.issueDate}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-200">{inv.customerName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{inv.customerDocument}</div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">
                        {inv.planName}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-200">{inv.dueDate}</span>
                        {inv.paidAt && (
                          <div className="text-[10px] text-emerald-400">Pago em: {new Date(inv.paidAt).toLocaleDateString('pt-BR')}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-black text-emerald-400 text-sm">{formatCurrencyBRL(inv.amount)}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="capitalize px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">
                          {inv.paymentMethod}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          inv.status === 'pago' 
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60' 
                            : inv.status === 'vencido'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                            : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                        }`}>
                          {inv.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Visualizar Boleto / QR Code PIX */}
                          <button
                            onClick={() => handleOpenBoletoPix(inv)}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                            title="Visualizar Boleto / PIX"
                          >
                            <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Cobrança</span>
                          </button>

                          {/* Baixa Manual / Conciliação */}
                          {inv.status !== 'pago' && (
                            <button
                              onClick={() => handleMarkInvoiceAsPaid(inv.id)}
                              className="p-1.5 bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 rounded-lg transition border border-emerald-800/60 cursor-pointer"
                              title="Confirmar Pagamento (Baixa Manual)"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Emitir NFS-e Nacional de Honorários */}
                          <button
                            onClick={() => handleOpenNfse(inv)}
                            className="p-1.5 bg-purple-950/70 hover:bg-purple-900 text-purple-300 rounded-lg transition border border-purple-800/60 cursor-pointer"
                            title="Emitir NFS-e Gov.br de Honorários"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* SUBTAB 4: CENTRAL DE NOTAS FISCAIS EMITIDAS DE HONORÁRIOS                 */}
      {/* ------------------------------------------------------------------------- */}
      {activeSubTab === 'central_nfse_honorarios' && (
        <div className="space-y-5 animate-fade-in">
          
          <div className="bg-[#0F172A] border border-purple-500/20 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/30">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-purple-400 bg-purple-950 px-2 py-0.5 rounded border border-purple-800/60 uppercase">
                      Padrão Nacional ADN / Receita Federal
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">
                    Central de Notas Fiscais Emitidas (Prestação de Serviços do Escritório)
                  </h3>
                </div>
              </div>

              <button
                onClick={() => {
                  const firstPaidInvoice = invoices.find(i => i.status === 'pago') || invoices[0];
                  if (firstPaidInvoice) {
                    handleOpenNfse(firstPaidInvoice);
                  } else {
                    triggerToast('Nenhuma fatura disponível para emissão.', 'warning');
                  }
                }}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-purple-600/20 flex items-center space-x-1.5 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Emitir Nova NFS-e de Honorários</span>
              </button>
            </div>

            {/* List of Issued NFS-e */}
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider bg-slate-900/70">
                    <th className="py-3 px-3">Número NFS-e</th>
                    <th className="py-3 px-3">Tomador (Cliente)</th>
                    <th className="py-3 px-3">Competência</th>
                    <th className="py-3 px-3">Valor Bruto</th>
                    <th className="py-3 px-3">ISSQN</th>
                    <th className="py-3 px-3">Valor Líquido</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {issuedNfses.map(nfse => (
                    <tr key={nfse.numeroNfse} className="hover:bg-slate-900/50 transition">
                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-white">{nfse.numeroNfse}</div>
                        <div className="text-[10px] text-slate-500 font-mono truncate max-w-[150px]">
                          Chave: {nfse.chaveAcesso50}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-200">{nfse.tomador.razaoSocial}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{nfse.tomador.cpfCnpj}</div>
                      </td>

                      <td className="py-3 px-3 text-slate-300 font-mono">
                        {nfse.competencia}
                      </td>

                      <td className="py-3 px-3 font-bold text-slate-200">
                        {formatCurrencyBRL(nfse.valorServico)}
                      </td>

                      <td className="py-3 px-3 text-slate-400">
                        {formatCurrencyBRL(nfse.valorIss)} ({nfse.aliquotaIss}%)
                      </td>

                      <td className="py-3 px-3 font-black text-emerald-400 text-sm">
                        {formatCurrencyBRL(nfse.valorLiquido)}
                      </td>

                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                          {nfse.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => {
                              const dummyInv: BillingInvoice = {
                                id: nfse.numeroNfse,
                                subscriptionId: 'sub_nfse',
                                customerName: nfse.tomador.razaoSocial,
                                customerDocument: nfse.tomador.cpfCnpj,
                                customerEmail: nfse.tomador.email,
                                planName: nfse.descricaoServico,
                                amount: nfse.valorServico,
                                dueDate: new Date().toISOString().split('T')[0],
                                issueDate: nfse.dataEmissao.split('T')[0],
                                paymentMethod: 'pix',
                                status: 'pago',
                                linhaDigitavel: '',
                                nossoNumero: '',
                                codigoBarras: '',
                                pixCopiaECola: '',
                                txId: ''
                              };
                              setSelectedNfseInvoice(dummyInv);
                              setIsNfseModalOpen(true);
                            }}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-purple-400" />
                            <span>DANFSE</span>
                          </button>

                          <button
                            onClick={() => {
                              NfseNacionalService.downloadXml(nfse);
                              triggerToast('XML Nacional baixado!', 'success');
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition cursor-pointer"
                            title="Baixar XML Nacional"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* SUBTAB 5: DRE ESTRUTURADA & FLUXO DE CAIXA                                */}
      {/* ------------------------------------------------------------------------- */}
      {activeSubTab === 'dre_fluxo_caixa' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* DRE Consolidada */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">DRE Gerencial do Escritório</h3>
                    <p className="text-xs text-slate-400">Demonstração do Resultado do Exercício</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800/60">
                  Mês Corrente
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-bold">
                  <span className="text-white">(+) Receita Bruta de Honorários</span>
                  <span className="text-emerald-400 font-mono">{formatCurrencyBRL(financialMetrics.mrr)}</span>
                </div>

                <div className="flex justify-between p-2 rounded bg-slate-900/50 text-slate-400">
                  <span>(-) Deduções de Tributos (Simples/ISSQN ~6%)</span>
                  <span className="text-rose-400 font-mono">-{formatCurrencyBRL(financialMetrics.mrr * 0.06)}</span>
                </div>

                <div className="flex justify-between p-2.5 rounded-lg bg-slate-800/70 text-slate-200 font-bold">
                  <span>(=) Receita Líquida Operacional</span>
                  <span className="text-white font-mono">{formatCurrencyBRL(financialMetrics.mrr * 0.94)}</span>
                </div>

                <div className="flex justify-between p-2 rounded bg-slate-900/50 text-slate-400">
                  <span>(-) Custos dos Serviços / Sistemas & Certificados</span>
                  <span className="text-rose-400 font-mono">-{formatCurrencyBRL(financialMetrics.mrr * 0.15)}</span>
                </div>

                <div className="flex justify-between p-2 rounded bg-slate-900/50 text-slate-400">
                  <span>(-) Despesas com Folha & Pró-labore</span>
                  <span className="text-rose-400 font-mono">-{formatCurrencyBRL(financialMetrics.mrr * 0.35)}</span>
                </div>

                <div className="flex justify-between p-2 rounded bg-slate-900/50 text-slate-400">
                  <span>(-) Despesas Administrativas & Comerciais</span>
                  <span className="text-rose-400 font-mono">-{formatCurrencyBRL(financialMetrics.mrr * 0.10)}</span>
                </div>

                <div className="flex justify-between p-3 rounded-xl bg-gradient-to-r from-emerald-950 to-teal-950 border border-emerald-500/40 text-sm font-black mt-3">
                  <span className="text-white">(=) Lucro Líquido do Mês (Margem ~34%)</span>
                  <span className="text-emerald-300 font-mono">{formatCurrencyBRL(financialMetrics.mrr * 0.34)}</span>
                </div>
              </div>
            </div>

            {/* Projeção de Fluxo de Caixa */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Projeção de Fluxo de Caixa</h3>
                      <p className="text-xs text-slate-400">Entradas vs Saídas projetadas para 30 dias</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-xl">
                    <span className="text-xs text-emerald-300 font-bold block mb-1">Entradas Previstas</span>
                    <span className="text-lg font-black text-emerald-400">
                      {formatCurrencyBRL(financialMetrics.totalPaidAmount + financialMetrics.totalPendingAmount)}
                    </span>
                  </div>

                  <div className="p-3.5 bg-rose-950/30 border border-rose-500/30 rounded-xl">
                    <span className="text-xs text-rose-300 font-bold block mb-1">Saídas Previstas</span>
                    <span className="text-lg font-black text-rose-400">
                      {formatCurrencyBRL(financialMetrics.mrr * 0.66)}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Saldo Operacional Projetado:</span>
                    <strong className="text-emerald-400">{formatCurrencyBRL(financialMetrics.mrr * 0.34)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Índice de Liquidez Corrente:</span>
                    <strong className="text-white">2.45x (Excelente)</strong>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 mt-4">
                <button
                  onClick={() => triggerToast('Relatório de Fluxo de Caixa exportado com sucesso!', 'success')}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span>Exportar Relatório em Planilha</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* SUBTAB 6: CONFIGURAÇÕES DO SETOR FINANCEIRO                               */}
      {/* ------------------------------------------------------------------------- */}
      {activeSubTab === 'configuracoes_financeiras' && (
        <div className="space-y-6 animate-fade-in max-w-4xl">
          
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Settings className="w-5 h-5 text-emerald-400" />
                <span>Parâmetros da Conta Cedente & Cobrança Bancária</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Configure os dados da conta bancária e chave PIX para emissão automática de boletos e QR Codes.
              </p>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                saveBankConfig(bankConfig);
                triggerToast('Configurações financeiras salvas com sucesso!', 'success');
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Razão Social do Cedente</label>
                  <input
                    type="text"
                    value={bankConfig.beneficiaryName}
                    onChange={e => setBankConfig({ ...bankConfig, beneficiaryName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">CNPJ do Cedente</label>
                  <input
                    type="text"
                    value={bankConfig.beneficiaryDocument}
                    onChange={e => setBankConfig({ ...bankConfig, beneficiaryDocument: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Banco Oficial</label>
                  <input
                    type="text"
                    value={bankConfig.bankName}
                    onChange={e => setBankConfig({ ...bankConfig, bankName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Agência</label>
                    <input
                      type="text"
                      value={bankConfig.agency}
                      onChange={e => setBankConfig({ ...bankConfig, agency: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Conta</label>
                    <input
                      type="text"
                      value={bankConfig.account}
                      onChange={e => setBankConfig({ ...bankConfig, account: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Dígito</label>
                    <input
                      type="text"
                      value={bankConfig.accountDigit}
                      onChange={e => setBankConfig({ ...bankConfig, accountDigit: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Chave PIX</label>
                  <input
                    type="text"
                    value={bankConfig.pixKey}
                    onChange={e => setBankConfig({ ...bankConfig, pixKey: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Tipo de Chave PIX</label>
                  <select
                    value={bankConfig.pixKeyType}
                    onChange={(e: any) => setBankConfig({ ...bankConfig, pixKeyType: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="email">E-mail</option>
                    <option value="cnpj">CNPJ</option>
                    <option value="cpf">CPF</option>
                    <option value="telefone">Telefone</option>
                    <option value="aleatoria">Chave Aleatória (EVP)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-600/20 cursor-pointer"
                >
                  Salvar Configurações Financeiras
                </button>
              </div>
            </form>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODALS (BOLETO / PIX, NFSE, NOVO CONTRATO, NOVA COBRANÇA)              */}
      {/* ========================================================================= */}

      {/* Modal 1: Boleto & PIX Interativo */}
      <BoletoPixModal
        isOpen={isBoletoModalOpen}
        onClose={() => {
          setIsBoletoModalOpen(false);
          setSelectedBoletoInvoice(null);
        }}
        invoice={selectedBoletoInvoice}
        bankConfig={bankConfig}
        onMarkAsPaid={invId => {
          handleMarkInvoiceAsPaid(invId);
          setIsBoletoModalOpen(false);
        }}
      />

      {/* Modal 2: NFS-e Nacional DANFSE */}
      <NfseNacionalModal
        isOpen={isNfseModalOpen}
        onClose={() => {
          setIsNfseModalOpen(false);
          setSelectedNfseInvoice(null);
        }}
        invoice={selectedNfseInvoice}
        bankConfig={bankConfig}
      />

      {/* Modal 3: Novo Contrato / Cliente */}
      {isNewContractModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <span>Cadastrar Novo Contrato / Cliente</span>
              </h3>
              <button
                onClick={() => setIsNewContractModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateContract} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Razão Social / Nome do Cliente</label>
                <input
                  type="text"
                  value={contractFormName}
                  onChange={e => setContractFormName(e.target.value)}
                  placeholder="Ex: Beta Soluções Digitais Ltda"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">CNPJ / CPF</label>
                  <input
                    type="text"
                    value={contractFormDoc}
                    onChange={e => setContractFormDoc(e.target.value)}
                    placeholder="00.000.000/0001-00"
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={contractFormPhone}
                    onChange={e => setContractFormPhone(e.target.value)}
                    placeholder="(11) 98765-4321"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">E-mail Financeiro</label>
                <input
                  type="email"
                  value={contractFormEmail}
                  onChange={e => setContractFormEmail(e.target.value)}
                  placeholder="financeiro@empresa.com.br"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Valor dos Honorários (R$)</label>
                  <input
                    type="number"
                    value={contractFormPrice}
                    onChange={e => setContractFormPrice(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Dia do Vencimento</label>
                  <select
                    value={contractFormDueDay}
                    onChange={e => setContractFormDueDay(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="5">Dia 05</option>
                    <option value="10">Dia 10</option>
                    <option value="15">Dia 15</option>
                    <option value="20">Dia 20</option>
                    <option value="25">Dia 25</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Periodicidade</label>
                  <select
                    value={contractFormPeriodicity}
                    onChange={(e: any) => setContractFormPeriodicity(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="mensal">Mensal</option>
                    <option value="trimestral">Trimestral</option>
                    <option value="semestral">Semestral</option>
                    <option value="anual">Anual</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Fidelidade</label>
                  <select
                    value={contractFormLoyalty}
                    onChange={e => setContractFormLoyalty(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="12">12 Meses (Padrão)</option>
                    <option value="6">6 Meses</option>
                    <option value="24">24 Meses</option>
                    <option value="0">Sem Fidelidade</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewContractModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-600/20"
                >
                  Criar Contrato & Ativar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Nova Cobrança Avulsa */}
      {isNewInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Plus className="w-5 h-5 text-blue-400" />
                <span>Emitir Nova Cobrança (Boleto/PIX)</span>
              </h3>
              <button
                onClick={() => setIsNewInvoiceModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Nome do Cliente</label>
                <input
                  type="text"
                  value={invoiceFormCustomer}
                  onChange={e => setInvoiceFormCustomer(e.target.value)}
                  placeholder="Ex: Empresa Alpha Ltda"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">CNPJ / CPF</label>
                <input
                  type="text"
                  value={invoiceFormDoc}
                  onChange={e => setInvoiceFormDoc(e.target.value)}
                  placeholder="00.000.000/0001-00"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Descrição do Serviço</label>
                <input
                  type="text"
                  value={invoiceFormDescription}
                  onChange={e => setInvoiceFormDescription(e.target.value)}
                  placeholder="Ex: Honorários Contábeis Setembro/2026"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    value={invoiceFormAmount}
                    onChange={e => setInvoiceFormAmount(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Data de Vencimento</label>
                  <input
                    type="date"
                    value={invoiceFormDueDate}
                    onChange={e => setInvoiceFormDueDate(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Forma de Pagamento</label>
                <select
                  value={invoiceFormMethod}
                  onChange={(e: any) => setInvoiceFormMethod(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="pix">PIX (QR Code Dinâmico)</option>
                  <option value="boleto">Boleto Bancário</option>
                  <option value="cartao">Cartão de Crédito</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewInvoiceModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-600/20"
                >
                  Gerar Fatura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
