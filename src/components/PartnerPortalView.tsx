import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Percent, 
  DollarSign, 
  Copy, 
  Check, 
  Share2, 
  TrendingUp, 
  ShieldCheck, 
  Sparkles, 
  Sliders, 
  HelpCircle, 
  Save, 
  Building2, 
  Calendar, 
  Layers, 
  ArrowRight, 
  Lock,
  Crown,
  Users,
  ExternalLink,
  CheckCircle2,
  FileText,
  Mail,
  MessageSquare,
  QrCode,
  Download,
  AlertCircle,
  Briefcase,
  Zap,
  Globe,
  Wallet
} from 'lucide-react';
import { 
  PartnerCommissionService, 
  PartnerReferralConfig, 
  PartnerReferredClient, 
  calculatePartnerCommission,
  calculateAutomaticBaseCommissionRate,
  STANDARD_PLAN_COMMISSIONS,
  MAX_PARTNER_COMMISSION_RATE
} from '../utils/partnerCommissionService';
import { AuthService } from '../utils/authService';
import { AuthUser, AppActiveTab } from '../types';
import { BrandLogo } from './BrandLogo';

interface PartnerPortalViewProps {
  currentUser: AuthUser | null;
  onUpdateCurrentUser?: (updated: Partial<AuthUser>) => void;
  onNavigateToTab?: (tab: AppActiveTab) => void;
  onClose?: () => void;
  isFullModulePage?: boolean;
}

export const PartnerPortalView: React.FC<PartnerPortalViewProps> = ({
  currentUser,
  onUpdateCurrentUser,
  onNavigateToTab,
  onClose,
  isFullModulePage
}) => {
  const isMaster = Boolean(
    currentUser?.isMaster || 
    currentUser?.role === 'master' || 
    currentUser?.email?.toLowerCase() === 'carlosmiguelvieira1@gmail.com'
  );

  const isPartnerActive = Boolean(
    isMaster || 
    currentUser?.isPartnerActive || 
    currentUser?.role === 'parceiro_negocios' ||
    currentUser?.allowedModules?.partner_portal
  );

  const [activeSubTab, setActiveSubTab] = useState<'indicacao' | 'tabela' | 'customizado' | 'carteira' | 'pix' | 'marketing' | 'contrato'>('indicacao');
  
  // Configurações do Parceiro
  const [partnerConfig, setPartnerConfig] = useState<PartnerReferralConfig>(() => 
    PartnerCommissionService.getPartnerConfig(currentUser)
  );

  const [inputReferralCode, setInputReferralCode] = useState(partnerConfig.referralCode);
  const [discountPercent, setDiscountPercent] = useState(partnerConfig.discountPercent);
  const [pixKey, setPixKey] = useState(partnerConfig.pixKey || currentUser?.email || '');
  const [pixKeyType, setPixKeyType] = useState(partnerConfig.pixKeyType || 'email');
  const [bankName, setBankName] = useState(partnerConfig.bankName || 'Banco do Brasil S.A.');

  // Simulador de Plano Customizado
  const [customPlanPrice, setCustomPlanPrice] = useState<number>(650.00);

  // Simulador de Carteira Recorrente
  const [simStarterCount, setSimStarterCount] = useState<number>(3);
  const [simProCount, setSimProCount] = useState<number>(5);
  const [simEnterpriseCount, setSimEnterpriseCount] = useState<number>(2);
  const [simMasterCount, setSimMasterCount] = useState<number>(1);

  // Estados de feedback visual
  const [isCopiedCode, setIsCopiedCode] = useState(false);
  const [isCopiedLink, setIsCopiedLink] = useState(false);
  const [copiedMarketingKey, setCopiedMarketingKey] = useState<string | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // Lista de clientes indicados reais
  const [referredClients, setReferredClients] = useState<PartnerReferredClient[]>(() => 
    PartnerCommissionService.getReferredClients(partnerConfig.referralCode)
  );

  useEffect(() => {
    if (currentUser) {
      const cfg = PartnerCommissionService.getPartnerConfig(currentUser);
      setPartnerConfig(cfg);
      setInputReferralCode(cfg.referralCode);
      setDiscountPercent(cfg.discountPercent);
      setPixKey(cfg.pixKey || currentUser?.email || '');
      setPixKeyType(cfg.pixKeyType || 'email');
      setBankName(cfg.bankName || 'Banco do Brasil S.A.');
      setReferredClients(PartnerCommissionService.getReferredClients(cfg.referralCode));
    }
  }, [currentUser]);

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://app.verticefiscal.com.br';
  const referralLink = `${originUrl}/register?ref=${encodeURIComponent(inputReferralCode)}&desc=${discountPercent}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inputReferralCode);
    setIsCopiedCode(true);
    setTimeout(() => setIsCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setIsCopiedLink(true);
    setTimeout(() => setIsCopiedLink(false), 2000);
  };

  const handleCopyMarketingText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMarketingKey(key);
    setTimeout(() => setCopiedMarketingKey(null), 2500);
  };

  const handleSaveConfig = () => {
    const updatedConfig: PartnerReferralConfig = {
      ...partnerConfig,
      partnerId: currentUser?.id || partnerConfig.partnerId || 'usr_current',
      partnerName: currentUser?.name || partnerConfig.partnerName,
      partnerEmail: (currentUser?.email || partnerConfig.partnerEmail || '').toLowerCase(),
      referralCode: inputReferralCode.trim().toUpperCase(),
      discountPercent: Number(discountPercent),
      pixKey: pixKey.trim(),
      pixKeyType: pixKeyType as any,
      bankName: bankName.trim(),
      updatedAt: new Date().toISOString()
    };

    PartnerCommissionService.savePartnerConfig(updatedConfig);
    setPartnerConfig(updatedConfig);

    if (currentUser?.id) {
      AuthService.updatePartnerProgram(currentUser.id, {
        partnerReferralCode: updatedConfig.referralCode,
        partnerDiscountPercent: updatedConfig.discountPercent,
        partnerPixKey: updatedConfig.pixKey,
        partnerPixKeyType: updatedConfig.pixKeyType,
        partnerBankName: updatedConfig.bankName,
      });
    }

    if (onUpdateCurrentUser) {
      onUpdateCurrentUser({
        partnerReferralCode: updatedConfig.referralCode,
        partnerDiscountPercent: updatedConfig.discountPercent,
        partnerPixKey: updatedConfig.pixKey,
        partnerPixKeyType: updatedConfig.pixKeyType,
        partnerBankName: updatedConfig.bankName,
      });
    }

    setSaveFeedback('Configurações do Programa de Parceiros salvas com sucesso!');
    setTimeout(() => setSaveFeedback(null), 3500);
  };

  // Cálculos do Simulador de Carteira Recorrente
  const monthlyRevenueTotal = 
    simStarterCount * 197.00 +
    simProCount * 397.00 +
    simEnterpriseCount * 890.00 +
    simMasterCount * 1490.00;

  const annualRevenueTotal = monthlyRevenueTotal * 12;

  const tierRate = calculateAutomaticBaseCommissionRate(monthlyRevenueTotal);
  const effectivePartnerRate = Math.min(
    MAX_PARTNER_COMMISSION_RATE, 
    Math.max(tierRate, partnerConfig.baseCommissionRate || 20)
  );

  const estimatedMonthlyCommission = (monthlyRevenueTotal * effectivePartnerRate) / 100;
  const estimatedAnnualCommission = estimatedMonthlyCommission * 12;

  // Cálculo da simulação de plano customizado
  const customPlanCommission = calculatePartnerCommission(
    'custom_plan',
    'Plano Customizado Sob Demanda',
    customPlanPrice, 
    partnerConfig.discountPercent
  );

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner do Módulo */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950/60 to-slate-900 border border-amber-500/40 p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start space-x-4">
            <BrandLogo variant="badge" module="parceiros" />
            <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold tracking-wide uppercase">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>MÓDULO OFICIAL • PROGRAMA DE PARCEIROS & CREDENCIAMENTO</span>
              <span className="bg-emerald-500/30 text-emerald-300 px-2 py-0.2 rounded text-[10px] font-mono font-bold">
                ISENÇÃO 100% (R$ 0,00)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              Portal do Parceiro de Negócios
              <span className="text-sm font-normal text-amber-400 bg-amber-950/80 px-3 py-1 rounded-lg border border-amber-800/60 font-mono">
                Até 35% de Comissão Recorrente
              </span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Como Parceiro Homologado da <strong>VÉRTICE AUDITOR FISCAL</strong>, você possui isenção vitalícia de 100% da mensalidade da plataforma e ganha comissões mensais automáticas em PIX por cada escritório contábil ou empresa indicada.
            </p>
          </div>
        </div>

          {/* Card Resumo do Parceiro */}
          <div className="bg-[#0B0F19]/90 border border-amber-500/30 p-4 rounded-xl shrink-0 min-w-[240px] space-y-2 shadow-lg">
            <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
              <span>Seu Status Atual</span>
              <span className="flex items-center space-x-1 text-emerald-400 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Ativo & Homologado</span>
              </span>
            </div>
            <div className="text-xs text-slate-300 space-y-1 font-mono">
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">Mensalidade:</span>
                <span className="text-emerald-400 font-bold">R$ 0,00 (Isento)</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">Comissão Base:</span>
                <span className="text-amber-300 font-bold">{effectivePartnerRate}% Recorrente</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Desconto Concedido:</span>
                <span className="text-blue-400 font-bold">{partnerConfig.discountPercent}% OFF</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mensagem de Feedback */}
        {saveFeedback && (
          <div className="mt-4 p-3 bg-emerald-950/80 border border-emerald-600 rounded-xl text-emerald-200 text-xs font-bold flex items-center space-x-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveFeedback}</span>
          </div>
        )}
      </div>

      {/* Navegação de Sub-Abas do Módulo */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          id="partner-tab-indicacao"
          onClick={() => setActiveSubTab('indicacao')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeSubTab === 'indicacao'
              ? 'bg-amber-600 text-white shadow-md ring-1 ring-amber-400'
              : 'text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60'
          }`}
        >
          <Percent className="w-4 h-4" />
          <span>1. Meu Código & Links de Indicação</span>
        </button>

        <button
          id="partner-tab-tabela"
          onClick={() => setActiveSubTab('tabela')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeSubTab === 'tabela'
              ? 'bg-amber-600 text-white shadow-md ring-1 ring-amber-400'
              : 'text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>2. Tabela Oficial de Comissões</span>
        </button>

        <button
          id="partner-tab-carteira"
          onClick={() => setActiveSubTab('carteira')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeSubTab === 'carteira'
              ? 'bg-amber-600 text-white shadow-md ring-1 ring-amber-400'
              : 'text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>3. Simulador de Carteira Recorrente</span>
        </button>

        <button
          id="partner-tab-customizado"
          onClick={() => setActiveSubTab('customizado')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeSubTab === 'customizado'
              ? 'bg-amber-600 text-white shadow-md ring-1 ring-amber-400'
              : 'text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>4. Simulador de Planos Customizados</span>
        </button>

        <button
          id="partner-tab-pix"
          onClick={() => setActiveSubTab('pix')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeSubTab === 'pix'
              ? 'bg-amber-600 text-white shadow-md ring-1 ring-amber-400'
              : 'text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>5. Chave PIX & Dados de Repasse</span>
        </button>

        <button
          id="partner-tab-marketing"
          onClick={() => setActiveSubTab('marketing')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeSubTab === 'marketing'
              ? 'bg-amber-600 text-white shadow-md ring-1 ring-amber-400'
              : 'text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>6. Kit de Divulgação & WhatsApp</span>
        </button>

        <button
          id="partner-tab-contrato"
          onClick={() => setActiveSubTab('contrato')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeSubTab === 'contrato'
              ? 'bg-amber-600 text-white shadow-md ring-1 ring-amber-400'
              : 'text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>7. Termo de Parceria & Segurança</span>
        </button>
      </div>

      {/* CONTEÚDO DA SUB-ABA 1: MEU CÓDIGO E LINKS DE INDICAÇÃO */}
      {activeSubTab === 'indicacao' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Box Principal de Configuração do Código */}
            <div className="lg:col-span-2 bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
              <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Percent className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Configurar Cupom & Link do Parceiro</h3>
                  <p className="text-xs text-slate-400">Defina o código de indicação que seus clientes usarão ao se cadastrar.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Código do Cupom de Indicação</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={inputReferralCode}
                      onChange={(e) => setInputReferralCode(e.target.value.toUpperCase())}
                      placeholder="EX: VERTICE-PARCEIRO"
                      className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-amber-300 uppercase tracking-wider focus:outline-none focus:border-amber-500 transition"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500">Seus clientes digitam este cupom para ganhar o desconto.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Desconto Concedido ao Cliente (%)</label>
                  <select
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-amber-500 transition cursor-pointer"
                  >
                    <option value={5}>5% de Desconto (Cliente economiza 5%)</option>
                    <option value={10}>10% de Desconto (Recomendado - Excelente conversão)</option>
                    <option value={15}>15% de Desconto (Atratividade Máxima)</option>
                    <option value={20}>20% de Desconto (Condição Especial de Lançamento)</option>
                  </select>
                  <span className="text-[11px] text-slate-500">O cliente recebe este desconto em todas as mensalidades.</span>
                </div>
              </div>

              {/* Bloco de Link Completo para Cópia com 1 Clique */}
              <div className="p-4 bg-[#0B0F19] border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                    <Share2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Link Direto de Cadastro com Cupom Pré-Aplicado</span>
                  </span>
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    {isCopiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopiedLink ? 'Copiado!' : 'Copiar Link'}</span>
                  </button>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 font-mono text-xs text-amber-300 break-all select-all">
                  {referralLink}
                </div>
              </div>

              {/* Botão Salvar Alterações */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400">
                  Faixa de comissão atual: <strong className="text-amber-400 font-bold">{effectivePartnerRate}%</strong> recorrente
                </span>
                <button
                  onClick={handleSaveConfig}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-black transition flex items-center space-x-2 cursor-pointer shadow-lg"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Parâmetros do Parceiro</span>
                </button>
              </div>
            </div>

            {/* Coluna Lateral: Destaques das Vantagens */}
            <div className="space-y-4">
              <div className="bg-[#0F172A] border border-amber-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Vantagens do Parceiro Homologado</span>
                </h4>
                <ul className="text-xs space-y-3 text-slate-300">
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>100% de Isenção (R$ 0,00):</strong> Não paga nenhuma mensalidade pelo uso da plataforma Vértice Auditor Fiscal.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Comissão Recorrente Mensal:</strong> Receba de 20% a 35% todos os meses enquanto o cliente mantiver a assinatura ativa.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Repasse Direto via PIX:</strong> Créditos depositados automaticamente na conta bancária cadastrada.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Dashboard de Transparência:</strong> Acompanhe cada empresa indicada, data de renovação e extrato de comissões.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-blue-950/40 to-slate-900 border border-blue-800/40 rounded-2xl p-4 text-xs text-blue-200 space-y-2">
                <div className="font-bold flex items-center space-x-1.5 text-blue-300">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span>Dica de Crescimento Rápido</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Ao apresentar relatórios periciais oficiais gerados pela plataforma para escritórios contábeis, demonstre o tempo economizado e compartilhe o seu cupom com 10% de desconto. A taxa média de fechamento é superior a 68%.
                </p>
              </div>
            </div>
          </div>

          {/* Tabela de Clientes Indicados Reais */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Carteira de Clientes Indicados & Comissões Ativas</h3>
                  <p className="text-xs text-slate-400">Relação de assinantes cadastrados utilizando o seu código de parceiro.</p>
                </div>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-800/60 font-bold self-start sm:self-center">
                Total de Indicados: {referredClients.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#0B0F19] text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Cliente / Escritório</th>
                    <th className="py-3 px-4">Plano Contratado</th>
                    <th className="py-3 px-4">Valor Pago (c/ Desconto)</th>
                    <th className="py-3 px-4">Sua Comissão ({effectivePartnerRate}%)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Data Início</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-sans">
                  {referredClients.map((client) => {
                    const clientMonthlyCommission = client.monthlyCommissionValue || ((client.monthlyPriceFinal || 0) * (client.netCommissionRate || effectivePartnerRate)) / 100;
                    return (
                      <tr key={client.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4">
                          <strong className="text-slate-100 block font-bold">{client.clientName}</strong>
                          <span className="text-[11px] text-slate-400 font-mono">{client.clientEmail}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-mono text-[11px] border border-blue-800">
                            {client.planName}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-200">
                          {formatCurrency(client.monthlyPriceFinal || client.monthlyPriceOriginal)}/mês
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                          +{formatCurrency(clientMonthlyCommission)}/mês
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            client.status === 'ativo' 
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}>
                            {client.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400">
                          {new Date(client.joinedDate || client.joinedAt || Date.now()).toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA SUB-ABA 2: TABELA OFICIAL DE COMISSÕES */}
      {activeSubTab === 'tabela' && (
        <div className="space-y-6">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Tabela de Comissionamento por Plano Padrão</h3>
                <p className="text-xs text-slate-400">
                  Veja quanto você recebe mensalmente por cada plano assinado através da sua indicação com {partnerConfig.discountPercent}% de desconto aplicado ao cliente.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {STANDARD_PLAN_COMMISSIONS.map((plan) => {
                const commissionCalc = calculatePartnerCommission(
                  plan.planId,
                  plan.planName,
                  plan.monthlyPrice, 
                  partnerConfig.discountPercent
                );

                return (
                  <div key={plan.planId} className="bg-[#0B0F19] border border-slate-800 hover:border-amber-500/50 rounded-xl p-5 space-y-4 transition flex flex-col justify-between shadow-lg">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{plan.planName}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                          {commissionCalc.netCommissionRate}% Comissão
                        </span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-slate-500 line-through block">
                          Tabela: {formatCurrency(plan.monthlyPrice)}/mês
                        </span>
                        <div className="text-lg font-black text-white font-mono">
                          {formatCurrency(commissionCalc.finalClientPrice)}
                          <span className="text-xs font-normal text-slate-400">/mês</span>
                        </div>
                        <span className="text-[11px] text-blue-400 font-bold block">
                          Cliente ganha {partnerConfig.discountPercent}% de Desconto
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg space-y-1">
                      <span className="text-[11px] text-emerald-300 uppercase tracking-wider font-bold block">
                        Seu Ganho Líquido Mensal:
                      </span>
                      <div className="text-xl font-black text-emerald-400 font-mono">
                        +{formatCurrency(commissionCalc.monthlyCommissionValue)}
                      </div>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        ou {formatCurrency(commissionCalc.annualCommissionValue)}/ano por cliente
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA SUB-ABA 3: SIMULADOR DE CARTEIRA RECORRENTE */}
      {activeSubTab === 'carteira' && (
        <div className="space-y-6">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Simulador de Faturamento & Carteira Recorrente</h3>
                <p className="text-xs text-slate-400">
                  Ajuste o número de assinantes na sua rede para projetar a sua renda passiva mensal e anual.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Controles dos Contadores de Clientes */}
              <div className="lg:col-span-2 space-y-4">
                <div className="p-4 bg-[#0B0F19] border border-slate-800 rounded-xl space-y-4">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Quantidade de Assinantes por Categoria de Plano
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-bold">Plano Starter (R$ 197/mês)</span>
                        <span className="text-amber-400 font-mono font-bold">{simStarterCount} clientes</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={50}
                        value={simStarterCount}
                        onChange={(e) => setSimStarterCount(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-bold">Plano Pro Escritório (R$ 397/mês)</span>
                        <span className="text-amber-400 font-mono font-bold">{simProCount} clientes</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={50}
                        value={simProCount}
                        onChange={(e) => setSimProCount(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-bold">Plano Enterprise (R$ 890/mês)</span>
                        <span className="text-amber-400 font-mono font-bold">{simEnterpriseCount} clientes</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={30}
                        value={simEnterpriseCount}
                        onChange={(e) => setSimEnterpriseCount(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-bold">Plano Master Ilimitado (R$ 1.490/mês)</span>
                        <span className="text-amber-400 font-mono font-bold">{simMasterCount} clientes</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={20}
                        value={simMasterCount}
                        onChange={(e) => setSimMasterCount(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Resumo da Escala de Comissão */}
                <div className="p-4 bg-[#0B0F19] border border-slate-800 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Faturamento Mensal Gerado pela Carteira:</span>
                    <strong className="text-white font-mono">{formatCurrency(monthlyRevenueTotal)}/mês</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Faixa de Comissão Automática Aplicada:</span>
                    <strong className="text-amber-400 font-mono font-bold">{effectivePartnerRate}%</strong>
                  </div>
                </div>
              </div>

              {/* Card de Resultado da Projeção */}
              <div className="bg-gradient-to-br from-amber-950/50 via-slate-900 to-[#0B0F19] border border-amber-500/40 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-2xl">
                <div className="space-y-3">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-widest flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Renda Recorrente do Parceiro</span>
                  </span>

                  <div className="space-y-1 pt-2">
                    <span className="text-xs text-slate-400 block">Comissão Mensal em Conta PIX:</span>
                    <div className="text-3xl font-black text-emerald-400 font-mono">
                      {formatCurrency(estimatedMonthlyCommission)}
                    </div>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-slate-800">
                    <span className="text-xs text-slate-400 block">Comissão Anual Acumulada:</span>
                    <div className="text-2xl font-black text-amber-300 font-mono">
                      {formatCurrency(estimatedAnnualCommission)}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/80 rounded-xl border border-amber-500/20 text-[11px] text-slate-300 space-y-1">
                  <div className="text-amber-400 font-bold flex items-center space-x-1">
                    <Lock className="w-3 h-3" />
                    <span>Garantia de Recorrência Contratual</span>
                  </div>
                  <p>
                    A comissão é creditada mensalmente durante todo o período em que os clientes indicados mantiverem a assinatura ativa.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA SUB-ABA 4: SIMULADOR DE PLANO CUSTOMIZADO */}
      {activeSubTab === 'customizado' && (
        <div className="space-y-6">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl max-w-3xl mx-auto">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Simulador de Propostas Personalizadas (Sob Medida)</h3>
                <p className="text-xs text-slate-400">
                  Calcule a comissão exata para contratos corporativos com valores customizados negociados para grandes escritórios.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Valor Mensal Negociado na Proposta (R$)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono font-bold text-xs">R$</span>
                  <input
                    type="number"
                    value={customPlanPrice}
                    onChange={(e) => setCustomPlanPrice(Math.max(50, Number(e.target.value)))}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0B0F19] border border-slate-700 rounded-xl text-sm font-mono font-bold text-white focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-[#0B0F19] border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[11px] text-slate-400 uppercase font-bold block">Preço Final do Cliente ({partnerConfig.discountPercent}% OFF)</span>
                  <div className="text-lg font-bold text-white font-mono">
                    {formatCurrency(customPlanCommission.finalClientPrice)}/mês
                  </div>
                </div>

                <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-xl space-y-1">
                  <span className="text-[11px] text-emerald-300 uppercase font-bold block">Sua Comissão Mensal ({customPlanCommission.netCommissionRate}%)</span>
                  <div className="text-lg font-bold text-emerald-400 font-mono">
                    +{formatCurrency(customPlanCommission.monthlyCommissionValue)}/mês
                  </div>
                </div>

                <div className="p-4 bg-amber-950/40 border border-amber-800/60 rounded-xl space-y-1">
                  <span className="text-[11px] text-amber-300 uppercase font-bold block">Comissão Anual Estimada</span>
                  <div className="text-lg font-bold text-amber-300 font-mono">
                    +{formatCurrency(customPlanCommission.annualCommissionValue)}/ano
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA SUB-ABA 5: CHAVE PIX & DADOS DE REPASSE */}
      {activeSubTab === 'pix' && (
        <div className="space-y-6">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl max-w-3xl mx-auto">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Dados Bancários para Repasse de Comissões</h3>
                <p className="text-xs text-slate-400">Cadastre a chave PIX onde você deseja receber as suas comissões.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Tipo da Chave PIX</label>
                  <select
                    value={pixKeyType}
                    onChange={(e) => setPixKeyType(e.target.value as any)}
                    className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-amber-500 transition cursor-pointer"
                  >
                    <option value="email">E-mail</option>
                    <option value="cpf">CPF</option>
                    <option value="cnpj">CNPJ</option>
                    <option value="telefone">Telefone (Celular)</option>
                    <option value="aleatoria">Chave Aleatória (EVP)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Chave PIX</label>
                  <input
                    type="text"
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                    placeholder="Informe sua chave PIX..."
                    className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Banco / Instituição Financeira</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Ex: Nubank, Banco do Brasil, Itaú, Bradesco, Inter..."
                  className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              <div className="p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-xs text-emerald-300 space-y-1">
                <strong className="block font-bold">Calendário de Repasses:</strong>
                <p className="text-slate-300">
                  Os repasses são processados mensalmente no 5º dia útil de cada mês diretamente na sua chave PIX cadastrada, com extrato e comprovante enviados por e-mail.
                </p>
              </div>

              <button
                onClick={handleSaveConfig}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-black transition flex items-center justify-center space-x-2 cursor-pointer shadow-lg"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Dados Bancários do Parceiro</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA SUB-ABA 6: KIT DE DIVULGAÇÃO & MARKETING */}
      {activeSubTab === 'marketing' && (
        <div className="space-y-6">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Kit Oficial de Divulgação do Parceiro</h3>
                <p className="text-xs text-slate-400">
                  Mensagens prontas, argumentos técnicos e e-mails validados para você enviar para contadores, diretores fiscais e empresários.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Modelo 1: WhatsApp para Contadores e Escritórios */}
              <div className="p-5 bg-[#0B0F19] border border-slate-800 rounded-xl space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Mensagem WhatsApp para Escritórios Contábeis</span>
                    </span>
                    <button
                      onClick={() => handleCopyMarketingText(
                        'wpp_contador',
                        `Olá, tudo bem? Quero compartilhar uma ferramenta de inteligência tributária que tem economizado muito tempo em planejamentos tributários e diagnósticos do Simples Nacional, Presumido e Reforma (IBS/CBS): o VÉRTICE AUDITOR FISCAL.\n\nConsegui uma condição especial com ${partnerConfig.discountPercent}% de desconto na mensalidade com o meu cupom exclusivo: ${inputReferralCode}\n\nVocê pode testar e se cadastrar diretamente por aqui: ${referralLink}`
                      )}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                    >
                      {copiedMarketingKey === 'wpp_contador' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedMarketingKey === 'wpp_contador' ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                    "Olá, tudo bem? Quero compartilhar uma ferramenta de inteligência tributária que tem economizado muito tempo em planejamentos tributários e diagnósticos do Simples Nacional, Presumido e Reforma (IBS/CBS): o VÉRTICE AUDITOR FISCAL.<br/><br/>
                    Consegui uma condição especial com <strong>{partnerConfig.discountPercent}% de desconto</strong> na assinatura com o meu cupom exclusivo: <strong className="text-amber-400">{inputReferralCode}</strong><br/><br/>
                    Acesse por aqui: <span className="text-blue-400 underline">{referralLink}</span>"
                  </p>
                </div>
              </div>

              {/* Modelo 2: E-mail Corporativo para Empresas e Empresários */}
              <div className="p-5 bg-[#0B0F19] border border-slate-800 rounded-xl space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center space-x-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      <span>E-mail Corporativo para Gestores & CFOs</span>
                    </span>
                    <button
                      onClick={() => handleCopyMarketingText(
                        'email_corp',
                        `Prezado(a),\n\nGostaria de recomendar a plataforma VÉRTICE AUDITOR FISCAL para auditoria e planejamento tributário da sua empresa. A plataforma audita segregação de ICMS-ST, PIS/COFINS monofásico, Fator R e os impactos da Reforma Tributária (IBS/CBS).\n\nComo parceiro homologado, disponibilizo nosso cupom com ${partnerConfig.discountPercent}% de desconto permanente: ${inputReferralCode}\n\nLink direto: ${referralLink}\n\nAtenciosamente,\nParceiro Vértice Auditor Fiscal`
                      )}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                    >
                      {copiedMarketingKey === 'email_corp' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedMarketingKey === 'email_corp' ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                    "Prezado(a), recomendo a plataforma <strong>VÉRTICE AUDITOR FISCAL</strong> para auditoria e planejamento tributário. Ela audita segregação de ICMS-ST, PIS monofásico e impactos da Reforma Tributária.<br/><br/>
                    Disponibilizo nosso cupom com <strong>{partnerConfig.discountPercent}% de desconto permanente</strong>: <strong className="text-amber-400">{inputReferralCode}</strong><br/><br/>
                    Link: <span className="text-blue-400 underline">{referralLink}</span>"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA SUB-ABA 7: TERMO DE PARCERIA & SEGURANÇA */}
      {activeSubTab === 'contrato' && (
        <div className="space-y-6">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl max-w-4xl mx-auto">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Termo de Parceria Comercial & Compromisso de Segurança</h3>
                <p className="text-xs text-slate-400">Regras de transparência, não-exclusividade, sigilo de dados (LGPD) e repasses.</p>
              </div>
            </div>

            <div className="p-5 bg-[#0B0F19] border border-slate-800 rounded-xl space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
              <div className="border-b border-slate-800 pb-3">
                <strong className="text-white block text-sm font-bold">1. Objeto da Parceria</strong>
                <p className="text-slate-400 mt-1">
                  O presente programa credencia o Parceiro a divulgar e intermediar a contratação das soluções de inteligência fiscal da plataforma VÉRTICE AUDITOR FISCAL, auferindo comissões recorrentes sobre as mensalidades efetivamente pagas pelos clientes indicados.
                </p>
              </div>

              <div className="border-b border-slate-800 pb-3">
                <strong className="text-white block text-sm font-bold">2. Isenção de Mensalidade do Parceiro (100% Free)</strong>
                <p className="text-slate-400 mt-1">
                  O Parceiro Homologado conta com isenção de 100% da mensalidade do sistema, mantendo acesso irrestrito a todas as funcionalidades de simulação e geração de laudos fiscais.
                </p>
              </div>

              <div className="border-b border-slate-800 pb-3">
                <strong className="text-white block text-sm font-bold">3. Regras de Comissionamento e Recorrência</strong>
                <p className="text-slate-400 mt-1">
                  As comissões variam de 20% a 35% do valor líquido mensal de cada plano ativo vinculado ao código do parceiro. O crédito é intransferível e pago pontualmente via PIX até o 5º dia útil de cada mês.
                </p>
              </div>

              <div>
                <strong className="text-white block text-sm font-bold">4. Segurança da Informação & LGPD</strong>
                <p className="text-slate-400 mt-1">
                  Em estrita conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), os dados fiscais e cadastrais das empresas indicadas pertencem exclusivamente ao respectivo escritório/cliente, sendo vedado qualquer compartilhamento indevido.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
