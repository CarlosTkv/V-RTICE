import React, { useState, useMemo } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  DollarSign,
  TrendingUp,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  Plus,
  FileText,
  Building2,
  RefreshCw,
  Send,
  Download,
  Printer,
  ChevronRight,
  Info,
  Layers,
  Activity,
  BarChart3,
  PieChart as PieIcon,
  HelpCircle,
  Sparkles,
  ShieldCheck,
  Check,
  X,
  ExternalLink,
  Percent
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { CompanyData, CalculationResult } from '../types';
import { BrandLogo } from './BrandLogo';
import { FinancialReportExportModal } from './FinancialReportExportModal';

interface BPOFinanceiroViewProps {
  company: CompanyData;
  calculation: CalculationResult;
}

export interface PayableItem {
  id: string;
  description: string;
  supplier: string;
  cnpjSupplier?: string;
  category: 'fornecedores' | 'folha_salarios' | 'pro_labore' | 'impostos_das' | 'aluguel_infra' | 'softwares_ti' | 'servicos_terceiros' | 'outros';
  amount: number;
  dueDate: string; // YYYY-MM-DD
  status: 'pendente' | 'agendado' | 'pago' | 'atrasado';
  paymentMethod: 'pix' | 'boleto' | 'ted' | 'debito_automatico';
  barcodeOrPixKey?: string;
  paidAt?: string;
  notes?: string;
}

export interface ReceivableItem {
  id: string;
  clientName: string;
  cnpjClient?: string;
  invoiceNumber?: string;
  contractRef?: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  status: 'pendente' | 'recebido' | 'atrasado' | 'em_cobranca';
  paymentMethod: 'boleto' | 'pix' | 'cartao_credito' | 'deposito';
  collectionStage: 'lembrete_amigavel' | 'vencendo_hoje' | 'primeiro_aviso' | 'notificacao_formal' | 'juridico' | 'nenhuma';
  lastReminderSentAt?: string;
  receivedAt?: string;
}

export interface BankStatementRow {
  id: string;
  date: string;
  description: string;
  amount: number; // positive = credit, negative = debit
  type: 'credito' | 'debito';
  bankName: string;
  reconciled: boolean;
  matchedId?: string;
}

export const BPOFinanceiroView: React.FC<BPOFinanceiroViewProps> = ({
  company,
  calculation
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'visao_geral' | 'contas_pagar' | 'contas_receber' | 'fluxo_caixa' | 'dfc' | 'conciliacao' | 'indicadores_ciclos'
  >('visao_geral');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');
  const [showNewPayableModal, setShowNewPayableModal] = useState(false);
  const [showNewReceivableModal, setShowNewReceivableModal] = useState(false);
  const [showPdfExportModal, setShowPdfExportModal] = useState(false);
  const [activeTooltipMetric, setActiveTooltipMetric] = useState<string | null>(null);

  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const formatPercent = (val: number) => `${val.toFixed(2).replace('.', ',')}%`;

  // Dynamic seed generator based on real company revenue
  const monthlyRevenue = company.monthlyRevenue > 0 ? company.monthlyRevenue : ((company.rbt12 || 1200000) / 12);
  const monthlyDas = calculation.effectiveTaxMonthly || (monthlyRevenue * 0.10);
  const payrollTotal = (company.payroll12m || 360000) / 12;

  // Payables initial state
  const [payables, setPayables] = useState<PayableItem[]>([
    {
      id: 'pag-001',
      description: 'Guia Mensal do Simples Nacional (DAS Oficial)',
      supplier: 'Receita Federal do Brasil / Simples Nacional',
      cnpjSupplier: '00.394.460/0058-87',
      category: 'impostos_das',
      amount: Math.round(monthlyDas),
      dueDate: '2026-09-20',
      status: 'pendente',
      paymentMethod: 'pix',
      barcodeOrPixKey: '858300000018-93820174260-20260920001-9'
    },
    {
      id: 'pag-002',
      description: 'Folha de Salários Colaboradores (CLT Líquida)',
      supplier: 'Quadro Funcional CLT',
      category: 'folha_salarios',
      amount: Math.round(payrollTotal * 0.7),
      dueDate: '2026-09-05',
      status: 'pago',
      paymentMethod: 'ted',
      paidAt: '2026-09-05'
    },
    {
      id: 'pag-003',
      description: 'Retirada Mensal de Pró-Labore dos Sócios Administradores',
      supplier: 'Quadro Societário',
      category: 'pro_labore',
      amount: Math.round(payrollTotal * 0.3),
      dueDate: '2026-09-05',
      status: 'pago',
      paymentMethod: 'pix',
      paidAt: '2026-09-05'
    },
    {
      id: 'pag-004',
      description: 'Fornecedor de Mercadorias / Insumos Principais',
      supplier: 'Distribuidora Central Brasil Ltda',
      cnpjSupplier: '12.345.678/0001-90',
      category: 'fornecedores',
      amount: Math.round(monthlyRevenue * 0.38),
      dueDate: '2026-09-18',
      status: 'pendente',
      paymentMethod: 'boleto',
      barcodeOrPixKey: '34191.79001 01043.510047 91020.150008 1 98450000380000'
    },
    {
      id: 'pag-005',
      description: 'Locação do Imóvel Comercial / Sede Operacional',
      supplier: 'Imobiliária e Empreendimentos Paulista',
      cnpjSupplier: '45.890.123/0001-11',
      category: 'aluguel_infra',
      amount: Math.round(monthlyRevenue * 0.05),
      dueDate: '2026-09-10',
      status: 'pago',
      paymentMethod: 'boleto',
      paidAt: '2026-09-09'
    },
    {
      id: 'pag-006',
      description: 'Licenciamento de Software ERP & Cloud Security',
      supplier: 'Tech Cloud Solutions Brasil',
      cnpjSupplier: '98.765.432/0001-55',
      category: 'softwares_ti',
      amount: 1850.00,
      dueDate: '2026-09-25',
      status: 'agendado',
      paymentMethod: 'pix',
      barcodeOrPixKey: 'financeiro@techcloud.com.br'
    }
  ]);

  // Receivables initial state
  const [receivables, setReceivables] = useState<ReceivableItem[]>([
    {
      id: 'rec-001',
      clientName: 'Indústrias Metalúrgicas do Sul S/A',
      cnpjClient: '11.222.333/0001-44',
      invoiceNumber: 'NF-e 004821',
      contractRef: 'CTR-2026/89',
      amount: Math.round(monthlyRevenue * 0.35),
      dueDate: '2026-09-15',
      status: 'recebido',
      paymentMethod: 'boleto',
      collectionStage: 'nenhuma',
      receivedAt: '2026-09-15'
    },
    {
      id: 'rec-002',
      clientName: 'Comércio e Logística Vanguarda Ltda',
      cnpjClient: '22.333.444/0001-55',
      invoiceNumber: 'NF-e 004822',
      contractRef: 'CTR-2026/90',
      amount: Math.round(monthlyRevenue * 0.28),
      dueDate: '2026-09-22',
      status: 'pendente',
      paymentMethod: 'pix',
      collectionStage: 'lembrete_amigavel',
      lastReminderSentAt: '2026-09-11 08:30'
    },
    {
      id: 'rec-003',
      clientName: 'Grupo Hospitalar e Diagnóstico Saúde',
      cnpjClient: '33.444.555/0001-66',
      invoiceNumber: 'NF-e 004823',
      contractRef: 'CTR-2026/91',
      amount: Math.round(monthlyRevenue * 0.22),
      dueDate: '2026-09-28',
      status: 'pendente',
      paymentMethod: 'boleto',
      collectionStage: 'nenhuma'
    },
    {
      id: 'rec-004',
      clientName: 'Construtora e Engenharia Horizonte',
      cnpjClient: '44.555.666/0001-77',
      invoiceNumber: 'NF-e 004780',
      contractRef: 'CTR-2026/75',
      amount: Math.round(monthlyRevenue * 0.15),
      dueDate: '2026-09-02',
      status: 'atrasado',
      paymentMethod: 'boleto',
      collectionStage: 'notificacao_formal',
      lastReminderSentAt: '2026-09-10 14:15'
    }
  ]);

  // Bank Statement for Conciliation
  const [bankStatement, setBankStatement] = useState<BankStatementRow[]>([
    {
      id: 'ext-01',
      date: '2026-09-02',
      description: 'TED RECEBIDA CLIENTES - NF 004750',
      amount: 14500.00,
      type: 'credito',
      bankName: 'Banco Itaú Unibanco (Conta 28491-0)',
      reconciled: true,
      matchedId: 'rec-000'
    },
    {
      id: 'ext-02',
      date: '2026-09-05',
      description: 'FOLHA PAGTO CLT VIA ARQUIVO CNAB240',
      amount: -Math.round(payrollTotal * 0.7),
      type: 'debito',
      bankName: 'Banco Itaú Unibanco (Conta 28491-0)',
      reconciled: true,
      matchedId: 'pag-002'
    },
    {
      id: 'ext-03',
      date: '2026-09-05',
      description: 'PIX TRANSF PRO-LABORE SOCIO 1',
      amount: -Math.round(payrollTotal * 0.3),
      type: 'debito',
      bankName: 'Banco Itaú Unibanco (Conta 28491-0)',
      reconciled: true,
      matchedId: 'pag-003'
    },
    {
      id: 'ext-04',
      date: '2026-09-09',
      description: 'PAGTO BOLETO ALUGUEL IMOBILIARIA',
      amount: -Math.round(monthlyRevenue * 0.05),
      type: 'debito',
      bankName: 'Banco Itaú Unibanco (Conta 28491-0)',
      reconciled: true,
      matchedId: 'pag-005'
    },
    {
      id: 'ext-05',
      date: '2026-09-11',
      description: 'LIQUIDACAO TITULO PIX NF 004821',
      amount: Math.round(monthlyRevenue * 0.35),
      type: 'credito',
      bankName: 'Banco Itaú Unibanco (Conta 28491-0)',
      reconciled: true,
      matchedId: 'rec-001'
    },
    {
      id: 'ext-06',
      date: '2026-09-11',
      description: 'TARIFA BANCARIA PACOTE EMPRESARIAL',
      amount: -125.00,
      type: 'debito',
      bankName: 'Banco Itaú Unibanco (Conta 28491-0)',
      reconciled: false
    }
  ]);

  // Calculations
  const totalPayables = payables.reduce((acc, p) => acc + p.amount, 0);
  const paidPayables = payables.filter(p => p.status === 'pago').reduce((acc, p) => acc + p.amount, 0);
  const pendingPayables = payables.filter(p => p.status === 'pendente' || p.status === 'agendado').reduce((acc, p) => acc + p.amount, 0);
  const overduePayables = payables.filter(p => p.status === 'atrasado').reduce((acc, p) => acc + p.amount, 0);

  const totalReceivables = receivables.reduce((acc, r) => acc + r.amount, 0);
  const receivedReceivables = receivables.filter(r => r.status === 'recebido').reduce((acc, r) => acc + r.amount, 0);
  const pendingReceivables = receivables.filter(r => r.status === 'pendente').reduce((acc, r) => acc + r.amount, 0);
  const overdueReceivables = receivables.filter(r => r.status === 'atrasado').reduce((acc, r) => acc + r.amount, 0);

  const currentBankBalance = 184500.00;
  const projectedEndingBalance = currentBankBalance + pendingReceivables - pendingPayables;
  const defaultRatePercent = totalReceivables > 0 ? (overdueReceivables / totalReceivables) * 100 : 0;

  // Working Capital & Liquidity Indicators (Pericial BPO Formulas)
  const currentAssets = currentBankBalance + pendingReceivables + (monthlyRevenue * 0.30); // Ativo Circulante
  const currentLiabilities = pendingPayables + overduePayables; // Passivo Circulante
  const quickAssets = currentBankBalance + pendingReceivables; // Ativo sem estoques

  const currentLiquidity = currentLiabilities > 0 ? currentAssets / currentLiabilities : 2.5; // Liquidez Corrente
  const quickLiquidity = currentLiabilities > 0 ? quickAssets / currentLiabilities : 1.8; // Liquidez Seca
  const immediateLiquidity = currentLiabilities > 0 ? currentBankBalance / currentLiabilities : 1.2; // Liquidez Imediata

  // Working Capital (CDG, NCG, ST)
  const workingCapital = currentAssets - currentLiabilities; // CDG
  const operationalNeeds = (pendingReceivables + (monthlyRevenue * 0.30)) - pendingPayables; // NCG
  const treasuryBalance = workingCapital - operationalNeeds; // Saldo de Tesouraria

  // Activity Cycles
  const pmr = 38; // Prazo Médio de Recebimento em dias
  const pmp = 28; // Prazo Médio de Pagamento em dias
  const pme = 18; // Prazo Médio de Estocagem em dias
  const operationalCycle = pme + pmr; // 56 dias
  const financialCycle = operationalCycle - pmp; // 28 dias (Ciclo de Caixa)

  // Chart: Daily Cash Flow Projection 30 Days
  const dailyCashFlowData = useMemo(() => {
    const data = [];
    let runningBalance = currentBankBalance;
    for (let day = 1; day <= 30; day++) {
      const inVal = day === 5 || day === 15 || day === 22 || day === 28 ? Math.round(monthlyRevenue * 0.25) : day % 3 === 0 ? Math.round(monthlyRevenue * 0.03) : 0;
      const outVal = day === 5 ? Math.round(payrollTotal) : day === 10 ? Math.round(monthlyRevenue * 0.05) : day === 20 ? Math.round(monthlyDas) : day === 18 ? Math.round(monthlyRevenue * 0.38) : day % 2 === 0 ? Math.round(monthlyRevenue * 0.01) : 0;
      runningBalance = runningBalance + inVal - outVal;

      data.push({
        day: `Dia ${day}`,
        entradas: inVal,
        saidas: outVal,
        saldoAcumulado: runningBalance
      });
    }
    return data;
  }, [currentBankBalance, monthlyRevenue, payrollTotal, monthlyDas]);

  // Actions
  const handleMarkPayablePaid = (id: string) => {
    setPayables(prev => prev.map(p => p.id === id ? { ...p, status: 'pago', paidAt: new Date().toISOString().split('T')[0] } : p));
  };

  const handleMarkReceivableReceived = (id: string) => {
    setReceivables(prev => prev.map(r => r.id === id ? { ...r, status: 'recebido', receivedAt: new Date().toISOString().split('T')[0] } : r));
  };

  const handleSendReminder = (id: string, stage: ReceivableItem['collectionStage']) => {
    setReceivables(prev => prev.map(r => r.id === id ? { ...r, collectionStage: stage, lastReminderSentAt: 'Agora mesmo' } : r));
  };

  const handleReconcileRow = (id: string) => {
    setBankStatement(prev => prev.map(r => r.id === id ? { ...r, reconciled: true } : r));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header do Módulo BPO Financeiro */}
      <div className="bg-gradient-to-r from-teal-950/90 via-[#0F172A] to-[#0F172A] border border-teal-500/40 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-start space-x-3.5">
            <BrandLogo variant="badge" module="bpo" />
            <div className="p-3 bg-teal-950/60 border border-teal-800/60 text-teal-400 rounded-xl shadow-xs shrink-0">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800/60 font-mono">
                  BPO Financeiro & Gestão de Tesouraria
                </span>
                <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                  {company.name || 'Empresa em Análise'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight mt-1">
                Painel de BPO Financeiro & Controladoria Contábil
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                Gestão integrada de Contas a Pagar, Contas a Receber com régua automatizada, Fluxo de Caixa Direto/Projetado, DFC Pericial, Conciliação Bancária com 1 clique e Indicadores de Liquidez & Ciclos Operacionais.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-start lg:self-center">
            <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center space-x-1 text-xs">
              <span className="text-[11px] text-slate-400 px-2 font-mono">Competência:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-[#0B0F19] text-slate-200 text-xs font-mono rounded-lg px-2.5 py-1 border border-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="2026-09">Setembro / 2026</option>
                <option value="2026-08">Agosto / 2026</option>
                <option value="2026-07">Julho / 2026</option>
                <option value="2026-10">Outubro / 2026 (Projetado)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setShowPdfExportModal(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-md shadow-emerald-600/20"
              title="Exportar Extrato Financeiro e Conciliação em PDF Oficial"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Extrato (PDF)</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition border border-slate-800 flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir Relatório</span>
            </button>
          </div>
        </div>

        {/* 4 Cards de Destaque Financeiro em Tempo Real */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5 font-mono">
          
          {/* Saldo em Banco Atual */}
          <div className="bg-[#0B0F19] border border-slate-800 p-4 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-sans font-bold uppercase text-slate-400">Saldo Disponível em Caixa</span>
              <span className="p-1 rounded-md bg-blue-950/60 text-blue-400 border border-blue-800/60">
                <Building2 className="w-3.5 h-3.5" />
              </span>
            </div>
            <strong className="text-xl font-bold text-slate-100 block">
              {formatBRL(currentBankBalance)}
            </strong>
            <span className="text-[11px] text-emerald-400 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>100% Conciliado e Disponível</span>
            </span>
          </div>

          {/* Contas a Receber no Período */}
          <div className="bg-[#0B0F19] border border-slate-800 p-4 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-sans font-bold uppercase text-slate-400">A Receber no Período</span>
              <span className="p-1 rounded-md bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                <ArrowDownRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <strong className="text-xl font-bold text-emerald-400 block">
              {formatBRL(pendingReceivables)}
            </strong>
            <span className="text-[11px] text-slate-400">
              Recebidos: <strong className="text-slate-200">{formatBRL(receivedReceivables)}</strong>
            </span>
          </div>

          {/* Contas a Pagar no Período */}
          <div className="bg-[#0B0F19] border border-slate-800 p-4 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-sans font-bold uppercase text-slate-400">A Pagar no Período</span>
              <span className="p-1 rounded-md bg-rose-950/60 text-rose-400 border border-rose-800/60">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <strong className="text-xl font-bold text-rose-400 block">
              {formatBRL(pendingPayables)}
            </strong>
            <span className="text-[11px] text-slate-400">
              Já Quitados: <strong className="text-slate-200">{formatBRL(paidPayables)}</strong>
            </span>
          </div>

          {/* Saldo Projetado ao Fim do Mês */}
          <div className="bg-[#0B0F19] border border-slate-800 p-4 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-sans font-bold uppercase text-slate-400">Projeção Final de Caixa</span>
              <span className="p-1 rounded-md bg-purple-950/60 text-purple-400 border border-purple-800/60">
                <TrendingUp className="w-3.5 h-3.5" />
              </span>
            </div>
            <strong className={`text-xl font-bold block ${projectedEndingBalance >= 0 ? 'text-purple-400' : 'text-rose-400'}`}>
              {formatBRL(projectedEndingBalance)}
            </strong>
            <span className="text-[11px] text-slate-400">
              Inadimplência: <strong className="text-amber-400">{formatPercent(defaultRatePercent)}</strong>
            </span>
          </div>

        </div>

        {/* Navegação entre Sub-Abas do BPO */}
        <div className="flex flex-wrap items-center space-x-1.5 pt-5 mt-5 border-t border-slate-800 text-xs">
          {[
            { id: 'visao_geral', label: '1. Visão Geral & Gráficos', icon: Activity },
            { id: 'contas_pagar', label: `2. Contas a Pagar (${payables.filter(p => p.status === 'pendente').length})`, icon: ArrowUpRight },
            { id: 'contas_receber', label: `3. Contas a Receber & Cobrança (${receivables.filter(r => r.status === 'pendente').length})`, icon: ArrowDownRight },
            { id: 'fluxo_caixa', label: '4. Fluxo de Caixa Projetado', icon: TrendingUp },
            { id: 'dfc', label: '5. DFC Pericial (Método Direto)', icon: FileText },
            { id: 'conciliacao', label: '6. Conciliação Bancária', icon: RefreshCw },
            { id: 'indicadores_ciclos', label: '7. Indicadores & Ciclos', icon: BarChart3 }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center space-x-2 text-[11px] cursor-pointer ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-950/40 border border-teal-400/40'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ABA 1: VISÃO GERAL & GRÁFICOS INTERATIVOS */}
      {activeSubTab === 'visao_geral' && (
        <div className="space-y-6">
          
          {/* Gráfico de Evolução do Fluxo de Caixa (Recharts) */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <span>Projeção Diária de Entradas, Saídas e Saldo de Tesouraria (30 Dias)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Monitoramento da liquidez diária para prevenção de saldo negativo e otimização de aplicações financeiras
                </p>
              </div>

              <div className="flex items-center space-x-3 text-xs font-mono">
                <span className="flex items-center space-x-1 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>Entradas</span>
                </span>
                <span className="flex items-center space-x-1 text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span>Saídas</span>
                </span>
                <span className="flex items-center space-x-1 text-blue-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <span>Saldo Acumulado</span>
                </span>
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyCashFlowData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#334155', borderRadius: '0.75rem', color: '#F8FAFC' }}
                    itemStyle={{ color: '#F8FAFC' }}
                    labelStyle={{ color: '#F8FAFC', fontWeight: 'bold' }}
                    formatter={(value: any) => [formatBRL(Number(value)), '']}
                  />
                  <Bar dataKey="entradas" fill="#10B981" radius={[4, 4, 0, 0]} barSize={8} name="Entradas (R$)" />
                  <Bar dataKey="saidas" fill="#F43F5E" radius={[4, 4, 0, 0]} barSize={8} name="Saídas (R$)" />
                  <Area type="monotone" dataKey="saldoAcumulado" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSaldo)" name="Saldo Acumulado (R$)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Grid de 3 Painéis Analíticos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* 1. Composição de Despesas Operacionais */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center space-x-2">
                <PieIcon className="w-4 h-4 text-purple-400" />
                <span>Principais Centros de Custo</span>
              </h4>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 bg-[#0B0F19] rounded-lg border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-300 font-sans">Fornecedores / Insumos:</span>
                  <strong className="text-slate-100">{formatBRL(monthlyRevenue * 0.38)}</strong>
                </div>
                <div className="p-2.5 bg-[#0B0F19] rounded-lg border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-300 font-sans">Folha CLT + Pró-Labore:</span>
                  <strong className="text-slate-100">{formatBRL(payrollTotal)}</strong>
                </div>
                <div className="p-2.5 bg-[#0B0F19] rounded-lg border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-300 font-sans">Impostos (Guia DAS):</span>
                  <strong className="text-slate-100">{formatBRL(monthlyDas)}</strong>
                </div>
                <div className="p-2.5 bg-[#0B0F19] rounded-lg border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-300 font-sans">Infraestrutura & TI:</span>
                  <strong className="text-slate-100">{formatBRL(monthlyRevenue * 0.06)}</strong>
                </div>
              </div>
            </div>

            {/* 2. Régua de Cobrança & Inadimplência */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center space-x-2">
                <Send className="w-4 h-4 text-emerald-400" />
                <span>Status da Régua de Cobrança</span>
              </h4>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/60 rounded-lg flex items-center justify-between">
                  <span className="text-emerald-300">Títulos em Dia (Sem atraso):</span>
                  <strong className="font-mono text-emerald-400 font-bold">{receivables.filter(r => r.status === 'pendente').length} títulos</strong>
                </div>
                <div className="p-2.5 bg-amber-950/40 border border-amber-800/60 rounded-lg flex items-center justify-between">
                  <span className="text-amber-300">Lembretes Automáticos Disparados:</span>
                  <strong className="font-mono text-amber-400 font-bold">2 clientes</strong>
                </div>
                <div className="p-2.5 bg-rose-950/40 border border-rose-800/60 rounded-lg flex items-center justify-between">
                  <span className="text-rose-300">Notificação Formal (Atrasados):</span>
                  <strong className="font-mono text-rose-400 font-bold">{receivables.filter(r => r.status === 'atrasado').length} título</strong>
                </div>
              </div>
            </div>

            {/* 3. Diagnóstico de Liquidez Imediata */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Saúde de Caixa & Segurança</span>
              </h4>
              <div className="p-3 bg-[#0B0F19] rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Índice de Liquidez Corrente:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">{currentLiquidity.toFixed(2)}x</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Dias de Caixa em Reserva:</span>
                  <span className="font-mono font-bold text-blue-400 text-sm">~45 dias</span>
                </div>
                <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                  ✓ Para cada R$ 1,00 de dívida a curto prazo, a empresa possui <strong className="text-emerald-400 font-mono">R$ {currentLiquidity.toFixed(2)}</strong> em ativos de alta liquidez.
                </p>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ABA 2: CONTAS A PAGAR */}
      {activeSubTab === 'contas_pagar' && (
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <ArrowUpRight className="w-5 h-5 text-rose-400" />
                <span>Módulo de Contas a Pagar & Agendamento de Títulos</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Controle rigoroso de fornecedores, encargos trabalhistas, impostos da guia DAS e boletos bancários
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  const desc = prompt('Descrição do título a pagar:');
                  const supp = prompt('Nome do fornecedor:');
                  const val = parseFloat(prompt('Valor em R$:') || '0');
                  const date = prompt('Data de vencimento (AAAA-MM-DD):') || '2026-09-30';
                  if (desc && val > 0) {
                    setPayables(prev => [
                      ...prev,
                      {
                        id: `pag-${Date.now()}`,
                        description: desc,
                        supplier: supp || 'Fornecedor Diversos',
                        category: 'outros',
                        amount: val,
                        dueDate: date,
                        status: 'pendente',
                        paymentMethod: 'pix'
                      }
                    ]);
                  }
                }}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Título a Pagar</span>
              </button>
            </div>
          </div>

          <div className=" rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-[#0B0F19] border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider font-sans">
                  <th className="py-3 px-3">Descrição / Obrigação</th>
                  <th className="py-3 px-3">Fornecedor / Favorecido</th>
                  <th className="py-3 px-3">Categoria</th>
                  <th className="py-3 px-3">Vencimento</th>
                  <th className="py-3 px-3 text-right">Valor (R$)</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-[#0F172A]">
                {payables.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/60 transition">
                    <td className="py-3 px-3 font-sans">
                      <strong className="text-slate-100 block">{item.description}</strong>
                      {item.barcodeOrPixKey && (
                        <span className="text-[10px] text-slate-500 font-mono block truncate max-w-xs" title={item.barcodeOrPixKey}>
                          {item.barcodeOrPixKey}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-sans text-slate-300">
                      {item.supplier}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-sans font-bold uppercase bg-slate-900 text-slate-300 border border-slate-800">
                        {item.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {item.dueDate.split('-').reverse().join('/')}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-100">
                      {formatBRL(item.amount)}
                    </td>
                    <td className="py-3 px-3 text-center font-sans">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        item.status === 'pago'
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                          : item.status === 'agendado'
                          ? 'bg-blue-950/80 text-blue-400 border border-blue-800/60'
                          : item.status === 'atrasado'
                          ? 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                          : 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-sans">
                      {item.status !== 'pago' ? (
                        <button
                          type="button"
                          onClick={() => handleMarkPayablePaid(item.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-lg transition shadow-xs cursor-pointer flex items-center space-x-1 mx-auto"
                        >
                          <Check className="w-3 h-3" />
                          <span>Baixar</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono">
                          Pago em {item.paidAt?.split('-').reverse().join('/')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 3: CONTAS A RECEBER & RÉGUA DE COBRANÇA */}
      {activeSubTab === 'contas_receber' && (
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <ArrowDownRight className="w-5 h-5 text-emerald-400" />
                <span>Contas a Receber & Régua Automatizada de Cobrança</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Acompanhamento de faturamento por cliente, prevenção de inadimplência e disparo de lembretes
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  const client = prompt('Nome do cliente:');
                  const nf = prompt('Número da NF-e / Contrato:');
                  const val = parseFloat(prompt('Valor em R$:') || '0');
                  const date = prompt('Data de vencimento (AAAA-MM-DD):') || '2026-09-30';
                  if (client && val > 0) {
                    setReceivables(prev => [
                      ...prev,
                      {
                        id: `rec-${Date.now()}`,
                        clientName: client,
                        invoiceNumber: nf || 'NF-e Avulsa',
                        amount: val,
                        dueDate: date,
                        status: 'pendente',
                        paymentMethod: 'boleto',
                        collectionStage: 'nenhuma'
                      }
                    ]);
                  }
                }}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Título a Receber</span>
              </button>
            </div>
          </div>

          <div className=" rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-[#0B0F19] border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider font-sans">
                  <th className="py-3 px-3">Cliente / Contratante</th>
                  <th className="py-3 px-3">Documento / NF</th>
                  <th className="py-3 px-3">Vencimento</th>
                  <th className="py-3 px-3 text-right">Valor (R$)</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Régua de Cobrança</th>
                  <th className="py-3 px-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-[#0F172A]">
                {receivables.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/60 transition">
                    <td className="py-3 px-3 font-sans">
                      <strong className="text-slate-100 block">{item.clientName}</strong>
                      {item.cnpjClient && (
                        <span className="text-[10px] text-slate-500 font-mono">{item.cnpjClient}</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {item.invoiceNumber || item.contractRef || 'S/N'}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {item.dueDate.split('-').reverse().join('/')}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-400">
                      {formatBRL(item.amount)}
                    </td>
                    <td className="py-3 px-3 text-center font-sans">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        item.status === 'recebido'
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                          : item.status === 'atrasado'
                          ? 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                          : 'bg-blue-950/80 text-blue-400 border border-blue-800/60'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-sans">
                      {item.status !== 'recebido' ? (
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            type="button"
                            onClick={() => handleSendReminder(item.id, 'lembrete_amigavel')}
                            className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-blue-400 border border-slate-700 text-[10px] font-bold transition"
                            title="Enviar lembrete amigável antes do vencimento"
                          >
                            Lembrete
                          </button>
                          {item.status === 'atrasado' && (
                            <button
                              type="button"
                              onClick={() => handleSendReminder(item.id, 'notificacao_formal')}
                              className="px-2 py-0.5 rounded bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 text-[10px] font-bold transition"
                              title="Disparar notificação de cobrança"
                            >
                              Notificar
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] text-emerald-400">Liquidado</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-sans">
                      {item.status !== 'recebido' ? (
                        <button
                          type="button"
                          onClick={() => handleMarkReceivableReceived(item.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-lg transition shadow-xs cursor-pointer"
                        >
                          Receber
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono">
                          Recebido em {item.receivedAt?.split('-').reverse().join('/')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 4: FLUXO DE CAIXA PROJETADO & DETALHAMENTO */}
      {activeSubTab === 'fluxo_caixa' && (
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <span>Fluxo de Caixa Operacional Projetado (Diário / Mensal)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Demonstrativo contábil de liquidez com entradas operacionais, desembolsos e saldo de encerramento
              </p>
            </div>
          </div>

          <div className=" rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-[#0B0F19] border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider font-sans">
                  <th className="py-3 px-3">Dia do Mês</th>
                  <th className="py-3 px-3 text-right text-emerald-400">Entradas Previstas</th>
                  <th className="py-3 px-3 text-right text-rose-400">Saídas Previstas</th>
                  <th className="py-3 px-3 text-right">Resultado Diário</th>
                  <th className="py-3 px-3 text-right text-blue-400">Saldo Final Acumulado</th>
                  <th className="py-3 px-3 text-center">Status de Liquidez</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-[#0F172A]">
                {dailyCashFlowData.slice(0, 15).map((row, idx) => {
                  const netDay = row.entradas - row.saidas;
                  return (
                    <tr key={idx} className="hover:bg-slate-900/60 transition">
                      <td className="py-2.5 px-3 font-sans text-slate-200">
                        {row.day} (Set/2026)
                      </td>
                      <td className="py-2.5 px-3 text-right text-emerald-400">
                        {row.entradas > 0 ? `+ ${formatBRL(row.entradas)}` : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right text-rose-400">
                        {row.saidas > 0 ? `- ${formatBRL(row.saidas)}` : '-'}
                      </td>
                      <td className={`py-2.5 px-3 text-right font-bold ${netDay >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {formatBRL(netDay)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-blue-300">
                        {formatBRL(row.saldoAcumulado)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          row.saldoAcumulado > 50000
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                            : 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                        }`}>
                          {row.saldoAcumulado > 50000 ? 'Superavitário' : 'Atenção ao Caixa'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 5: DFC PERICIAL (MÉTODO DIRETO) */}
      {activeSubTab === 'dfc' && (
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-purple-400" />
                <span>Demonstração dos Fluxos de Caixa (DFC Pericial - Método Direto)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Elaborada em estrita conformidade com as Normas Brasileiras de Contabilidade (NBC TG 03 / CPC 03)
              </p>
            </div>
          </div>

          <div className="p-4 bg-[#0B0F19] rounded-xl border border-slate-800 space-y-4 font-mono text-xs">
            
            {/* Bloco 1: Atividades Operacionais */}
            <div className="space-y-2">
              <h4 className="font-sans font-bold text-slate-200 text-xs uppercase tracking-wider text-blue-400 border-b border-slate-800 pb-1">
                1. Fluxo de Caixa das Atividades Operacionais
              </h4>
              <div className="space-y-1 pl-2">
                <div className="flex justify-between text-slate-300">
                  <span>(+) Recebimentos de Clientes por Vendas e Serviços:</span>
                  <span className="text-emerald-400 font-bold">+{formatBRL(monthlyRevenue)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>(-) Pagamentos a Fornecedores de Mercadorias e Insumos:</span>
                  <span className="text-rose-400">-{formatBRL(monthlyRevenue * 0.38)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>(-) Pagamentos de Salários, Pró-Labore e Encargos Previdenciários:</span>
                  <span className="text-rose-400">-{formatBRL(payrollTotal)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>(-) Pagamento de Tributos Federais e Estaduais (Guia DAS):</span>
                  <span className="text-rose-400">-{formatBRL(monthlyDas)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>(-) Outras Despesas Operacionais e Administrativas:</span>
                  <span className="text-rose-400">-{formatBRL(monthlyRevenue * 0.08)}</span>
                </div>
                <div className="flex justify-between text-slate-100 font-bold pt-1 border-t border-slate-800 bg-slate-900/60 p-2 rounded">
                  <span className="font-sans">(=) Caixa Líquido Gerado nas Atividades Operacionais:</span>
                  <span className="text-emerald-400 font-bold">
                    +{formatBRL(monthlyRevenue - (monthlyRevenue * 0.38) - payrollTotal - monthlyDas - (monthlyRevenue * 0.08))}
                  </span>
                </div>
              </div>
            </div>

            {/* Bloco 2: Atividades de Investimento */}
            <div className="space-y-2 pt-2">
              <h4 className="font-sans font-bold text-slate-200 text-xs uppercase tracking-wider text-purple-400 border-b border-slate-800 pb-1">
                2. Fluxo de Caixa das Atividades de Investimento
              </h4>
              <div className="space-y-1 pl-2">
                <div className="flex justify-between text-slate-300">
                  <span>(-) Aquisição de Ativos Imobilizados / Máquinas e Equipamentos:</span>
                  <span className="text-rose-400">-{formatBRL(monthlyRevenue * 0.02)}</span>
                </div>
                <div className="flex justify-between text-slate-100 font-bold pt-1 border-t border-slate-800 bg-slate-900/60 p-2 rounded">
                  <span className="font-sans">(=) Caixa Líquido Consumido nas Atividades de Investimento:</span>
                  <span className="text-rose-400 font-bold">-{formatBRL(monthlyRevenue * 0.02)}</span>
                </div>
              </div>
            </div>

            {/* Bloco 3: Atividades de Financiamento */}
            <div className="space-y-2 pt-2">
              <h4 className="font-sans font-bold text-slate-200 text-xs uppercase tracking-wider text-amber-400 border-b border-slate-800 pb-1">
                3. Fluxo de Caixa das Atividades de Financiamento
              </h4>
              <div className="space-y-1 pl-2">
                <div className="flex justify-between text-slate-300">
                  <span>(-) Distribuição Isenta de Lucros aos Sócios:</span>
                  <span className="text-rose-400">-{formatBRL(monthlyRevenue * 0.12)}</span>
                </div>
                <div className="flex justify-between text-slate-100 font-bold pt-1 border-t border-slate-800 bg-slate-900/60 p-2 rounded">
                  <span className="font-sans">(=) Caixa Líquido das Atividades de Financiamento:</span>
                  <span className="text-rose-400 font-bold">-{formatBRL(monthlyRevenue * 0.12)}</span>
                </div>
              </div>
            </div>

            {/* Resultado Final DFC */}
            <div className="p-3 bg-blue-950/40 border border-blue-800/60 rounded-xl flex justify-between items-center text-sm font-bold">
              <span className="text-blue-200 font-sans">AUMENTO LÍQUIDO DE CAIXA E EQUIVALENTES DE CAIXA:</span>
              <span className="text-emerald-400 font-mono">
                +{formatBRL((monthlyRevenue - (monthlyRevenue * 0.38) - payrollTotal - monthlyDas - (monthlyRevenue * 0.08)) - (monthlyRevenue * 0.02) - (monthlyRevenue * 0.12))}
              </span>
            </div>

          </div>
        </div>
      )}

      {/* ABA 6: CONCILIAÇÃO BANCÁRIA */}
      {activeSubTab === 'conciliacao' && (
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <RefreshCw className="w-5 h-5 text-emerald-400" />
                <span>Conciliação Bancária Automatizada (Extrato vs Lançamentos)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Batimento eletrônico de extratos bancários com 1 clique para garantia da integridade contábil
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  setBankStatement(prev => prev.map(r => ({ ...r, reconciled: true })));
                  alert('Todos os lançamentos do extrato foram conciliados com sucesso!');
                }}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Conciliar Tudo Automaticamente</span>
              </button>
            </div>
          </div>

          <div className=" rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-[#0B0F19] border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider font-sans">
                  <th className="py-3 px-3">Data</th>
                  <th className="py-3 px-3">Descrição no Extrato Bancário</th>
                  <th className="py-3 px-3">Instituição Financeira</th>
                  <th className="py-3 px-3 text-right">Valor (R$)</th>
                  <th className="py-3 px-3 text-center">Status Batimento</th>
                  <th className="py-3 px-3 text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-[#0F172A]">
                {bankStatement.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-900/60 transition">
                    <td className="py-3 px-3 text-slate-300">
                      {row.date.split('-').reverse().join('/')}
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <strong className="text-slate-100">{row.description}</strong>
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-sans">
                      {row.bankName}
                    </td>
                    <td className={`py-3 px-3 text-right font-bold ${row.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {row.amount >= 0 ? `+ ${formatBRL(row.amount)}` : `- ${formatBRL(Math.abs(row.amount))}`}
                    </td>
                    <td className="py-3 px-3 text-center font-sans">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        row.reconciled
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                          : 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                      }`}>
                        {row.reconciled ? 'Conciliado' : 'Pendente de Batimento'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-sans">
                      {!row.reconciled ? (
                        <button
                          type="button"
                          onClick={() => handleReconcileRow(row.id)}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded-lg transition cursor-pointer"
                        >
                          Conciliar
                        </button>
                      ) : (
                        <span className="text-slate-500 text-[10px]">✓ Batido</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 7: INDICADORES AVANÇADOS & CICLOS */}
      {activeSubTab === 'indicadores_ciclos' && (
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <span>Indicadores de Liquidez, Capital de Giro & Ciclos Operacionais</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Modelagem matemática de Necessidade de Capital de Giro (NCG), Saldo de Tesouraria e Ciclo de Caixa
              </p>
            </div>
          </div>

          {/* Grid dos Ciclos Financeiros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            
            {/* Prazos Médios */}
            <div className="p-4 bg-[#0B0F19] rounded-xl border border-slate-800 space-y-2">
              <span className="font-sans text-[11px] font-bold uppercase text-blue-400 block">
                Prazos Médios de Operação
              </span>
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-slate-300">
                  <span>PMR (Recebimento Clientes):</span>
                  <strong className="text-slate-100">{pmr} dias</strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>PME (Estocagem / Entrega):</span>
                  <strong className="text-slate-100">{pme} dias</strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>PMP (Pagamento Fornecedores):</span>
                  <strong className="text-slate-100">{pmp} dias</strong>
                </div>
              </div>
            </div>

            {/* Ciclo Operacional */}
            <div className="p-4 bg-[#0B0F19] rounded-xl border border-slate-800 space-y-2">
              <span className="font-sans text-[11px] font-bold uppercase text-purple-400 block">
                Ciclo Operacional (PME + PMR)
              </span>
              <strong className="text-2xl font-bold text-purple-400 block pt-1">
                {operationalCycle} dias
              </strong>
              <p className="text-[11px] text-slate-400 font-sans">
                Tempo total decorrido desde a compra do insumo até o recebimento financeiro da venda.
              </p>
            </div>

            {/* Ciclo Financeiro (Ciclo de Caixa) */}
            <div className="p-4 bg-[#0B0F19] rounded-xl border border-slate-800 space-y-2">
              <span className="font-sans text-[11px] font-bold uppercase text-emerald-400 block">
                Ciclo Financeiro / Caixa
              </span>
              <strong className="text-2xl font-bold text-emerald-400 block pt-1">
                {financialCycle} dias
              </strong>
              <p className="text-[11px] text-slate-400 font-sans">
                Período em que a empresa necessita financiar suas operações com capital de giro próprio.
              </p>
            </div>

          </div>

          {/* Working Capital Breakdown */}
          <div className="p-4 bg-[#0B0F19] rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
            <h4 className="font-sans font-bold text-slate-200 uppercase text-xs tracking-wider">
              Análise de Capital de Giro & Saldo de Tesouraria
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-sans block">Capital de Giro Líquido (CDG)</span>
                <strong className="text-base text-blue-400">{formatBRL(workingCapital)}</strong>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-sans block">Necessidade Capital de Giro (NCG)</span>
                <strong className="text-base text-amber-400">{formatBRL(operationalNeeds)}</strong>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-sans block">Saldo de Tesouraria (ST = CDG - NCG)</span>
                <strong className="text-base text-emerald-400">{formatBRL(treasuryBalance)}</strong>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 font-sans pt-1">
              ✓ <strong className="text-emerald-400">Estrutura Financeira Excelente:</strong> A empresa opera com Saldo de Tesouraria positivo (<strong className="text-slate-100">{formatBRL(treasuryBalance)}</strong>), não dependendo de empréstimos bancários ou antecipação cara de recebíveis.
            </p>
          </div>

        </div>
      )}

      {/* Modal de Exportação do Relatório de Extrato Financeiro & Faturamento em PDF */}
      <FinancialReportExportModal
        isOpen={showPdfExportModal}
        onClose={() => setShowPdfExportModal(false)}
        company={company}
        calculation={calculation}
        defaultReportType="extrato"
      />

    </div>
  );
};
