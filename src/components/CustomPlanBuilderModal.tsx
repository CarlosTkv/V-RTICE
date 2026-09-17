import React, { useState, useMemo } from 'react';
import {
  X,
  Sparkles,
  Crown,
  Users,
  Building2,
  Calendar,
  CheckCircle2,
  Percent,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  DollarSign,
  HelpCircle,
  Clock
} from 'lucide-react';
import { PlanAllowedModules, PlanPeriodicity, SoldSubscription } from '../types';
import { 
  MODULAR_PRICING_CATALOG, 
  EXTRA_USER_MONTHLY_PRICE, 
  EXTRA_COMPANY_MONTHLY_PRICE, 
  calculateCustomPlanPricing 
} from '../utils/customPlanCalculator';
import { DEFAULT_PLAN_MODULES } from '../utils/permissionRules';

interface CustomPlanBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePlan: (config: {
    planName: string;
    usersCount: number;
    companiesCount: number;
    selectedModules: PlanAllowedModules;
    periodicity: PlanPeriodicity;
    preferredDueDay: number;
    pricePaid: number;
    originalPrice: number;
    discountAppliedPercent: number;
    loyaltyMonths: number;
    terminationFinePercent: number;
    proRataAmount: number;
    isProRataApplied: boolean;
    firstInvoiceDueDate: string;
  }) => void;
  initialValues?: {
    usersCount?: number;
    companiesCount?: number;
    selectedModules?: PlanAllowedModules;
    periodicity?: PlanPeriodicity;
    preferredDueDay?: number;
  };
  isClientSelfService?: boolean;
}

export const CustomPlanBuilderModal: React.FC<CustomPlanBuilderModalProps> = ({
  isOpen,
  onClose,
  onSavePlan,
  initialValues,
  isClientSelfService = false,
}) => {
  const [usersCount, setUsersCount] = useState<number>(initialValues?.usersCount || 3);
  const [companiesCount, setCompaniesCount] = useState<number>(initialValues?.companiesCount || 10);
  const [periodicity, setPeriodicity] = useState<PlanPeriodicity>(initialValues?.periodicity || 'mensal');
  const [preferredDueDay, setPreferredDueDay] = useState<number>(initialValues?.preferredDueDay || 10);
  
  const [selectedModules, setSelectedModules] = useState<PlanAllowedModules>(() => {
    return initialValues?.selectedModules || {
      ...DEFAULT_PLAN_MODULES.starter,
      ai_auditor: true,
      reforma: true,
      financeiro: true,
      cfop: true,
    };
  });

  const [applyPromptDiscount, setApplyPromptDiscount] = useState(true);
  const [applyAnnualCashDiscount, setApplyAnnualCashDiscount] = useState(false);
  const [customPlanName, setCustomPlanName] = useState('Plano Sob Medida Personalizado');

  // Cálculo Dinâmico Proporcional em Tempo Real
  const pricingResult = useMemo(() => {
    return calculateCustomPlanPricing({
      usersCount,
      companiesCount,
      selectedModules,
      periodicity,
      applyPromptPaymentDiscount: applyPromptDiscount,
      applyAnnualCashDiscount: periodicity === 'anual' ? applyAnnualCashDiscount : false,
      preferredDueDay,
    });
  }, [usersCount, companiesCount, selectedModules, periodicity, applyPromptDiscount, applyAnnualCashDiscount, preferredDueDay]);

  if (!isOpen) return null;

  const handleToggleModule = (moduleId: keyof PlanAllowedModules) => {
    setSelectedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const handleSelectAllModules = () => {
    const allActive: PlanAllowedModules = {
      dashboard: true,
      regimes: true,
      financeiro: true,
      cfop: true,
      fator_r: true,
      socios: true,
      projecao: true,
      reforma: true,
      parecer: true,
      historico: true,
      bpo: true,
      consultas: true,
      societario: true,
      conhecimentos: true,
      direito: true,
      ai_auditor: true,
      pgdas_import: true,
      agenda_fiscal: true,
      balancete_dre: true,
      consultas_fiscais: true,
      auditoria_digital: true,
      planejamento_tributario: true,
      financeiro_gerencial: true,
      consultoria_fiscal: true,
      legal_societario: true,
      emissao_nfse: true
    };
    setSelectedModules(allActive);
  };

  const handleClearOptionalModules = () => {
    setSelectedModules({
      dashboard: true,
      regimes: true,
      financeiro: false,
      cfop: false,
      fator_r: false,
      socios: false,
      projecao: false,
      reforma: false,
      parecer: true,
      historico: false,
      bpo: false,
      consultas: false,
      societario: false,
      ai_auditor: false,
      pgdas_import: false,
      agenda_fiscal: true,
      balancete_dre: false,
      consultas_fiscais: false,
      auditoria_digital: true,
      planejamento_tributario: false,
      financeiro_gerencial: false,
      consultoria_fiscal: false,
      legal_societario: false
    });
  };

  const handleConfirm = () => {
    const totalDiscountPercent = pricingResult.periodDiscountPercent + 
      (applyPromptDiscount ? 5 : 0) + 
      (periodicity === 'anual' && applyAnnualCashDiscount ? 15 : 0);

    onSavePlan({
      planName: customPlanName.trim() || 'Plano Sob Medida',
      usersCount: pricingResult.usersCount,
      companiesCount: pricingResult.companiesCount,
      selectedModules,
      periodicity,
      preferredDueDay,
      pricePaid: pricingResult.finalPricePaid,
      originalPrice: pricingResult.grossPeriodTotal,
      discountAppliedPercent: totalDiscountPercent,
      loyaltyMonths: pricingResult.fidelityMonths,
      terminationFinePercent: 20,
      proRataAmount: pricingResult.proRata.proRataAmount,
      isProRataApplied: pricingResult.proRata.isProRataApplied,
      firstInvoiceDueDate: pricingResult.proRata.firstInvoiceDueDate,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto font-sans">
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl w-full max-w-4xl text-slate-100 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0B0F19] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Simulador de Plano Sob Medida & Pro-rata
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                  Preços Proporcionais
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Monte sua assinatura sob demanda escolhendo módulos, acessos, CNPJs e dia de vencimento com cálculo proporcional
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Nome do Plano Personalizado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#0B0F19] p-4 rounded-xl border border-slate-800">
            <div>
              <label className="text-slate-300 font-bold block mb-1.5">Nome do Plano / Identificação</label>
              <input
                type="text"
                value={customPlanName}
                onChange={e => setCustomPlanName(e.target.value)}
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white font-semibold text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                placeholder="Ex: Plano Customizado Mendes Consultoria"
              />
            </div>
            
            {/* Escolha do Dia de Vencimento com Pro-rata */}
            <div>
              <label className="text-slate-300 font-bold block mb-1.5 flex items-center justify-between">
                <span>Dia de Vencimento Preferido</span>
                <span className="text-[10px] text-amber-400 font-mono">Regra Pro-rata</span>
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[5, 10, 15, 20, 25].map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setPreferredDueDay(day)}
                    className={`py-2 rounded-lg font-bold text-center border transition cursor-pointer text-xs ${
                      preferredDueDay === day
                        ? 'bg-amber-600 text-white border-amber-400 shadow-sm'
                        : 'bg-[#0F172A] text-slate-400 border-slate-700 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    Dia {day.toString().padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Capacidade: Usuários e Empresas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Usuários */}
            <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-200">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>Acessos Simultâneos (Usuários)</span>
                </div>
                <span className="text-base font-mono font-bold text-blue-400">
                  {usersCount} {usersCount === 1 ? 'usuário' : 'usuários'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                1 usuário incluído no núcleo base. Adicionais por <strong>R$ {EXTRA_USER_MONTHLY_PRICE.toFixed(2)}/mês cada</strong>.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={usersCount}
                  onChange={e => setUsersCount(parseInt(e.target.value) || 1)}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setUsersCount(Math.max(1, usersCount - 1))}
                    className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center border border-slate-700"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-mono font-bold">{usersCount}</span>
                  <button
                    type="button"
                    onClick={() => setUsersCount(usersCount + 1)}
                    className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center border border-slate-700"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                {usersCount > 1 
                  ? `Subtotal usuários: 1 grátis + ${usersCount - 1} extras = + R$ ${((usersCount - 1) * EXTRA_USER_MONTHLY_PRICE).toFixed(2)}/mês`
                  : '1 usuário incluso no plano base'}
              </div>
            </div>

            {/* Empresas */}
            <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-200">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span>Empresas Cadastradas (CNPJs)</span>
                </div>
                <span className="text-base font-mono font-bold text-emerald-400">
                  {companiesCount} {companiesCount === 1 ? 'CNPJ' : 'CNPJs'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                1 CNPJ incluído no núcleo base. Adicionais por <strong>R$ {EXTRA_COMPANY_MONTHLY_PRICE.toFixed(2)}/mês cada</strong>.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="range"
                  min="1"
                  max="150"
                  value={companiesCount}
                  onChange={e => setCompaniesCount(parseInt(e.target.value) || 1)}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setCompaniesCount(Math.max(1, companiesCount - 5))}
                    className="px-2 h-7 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center border border-slate-700 text-[11px]"
                  >
                    -5
                  </button>
                  <span className="w-10 text-center font-mono font-bold">{companiesCount}</span>
                  <button
                    type="button"
                    onClick={() => setCompaniesCount(companiesCount + 5)}
                    className="px-2 h-7 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center border border-slate-700 text-[11px]"
                  >
                    +5
                  </button>
                </div>
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                {companiesCount > 1 
                  ? `Subtotal empresas: 1 grátis + ${companiesCount - 1} extras = + R$ ${((companiesCount - 1) * EXTRA_COMPANY_MONTHLY_PRICE).toFixed(2)}/mês`
                  : '1 empresa inclusa no plano base'}
              </div>
            </div>
          </div>

          {/* Módulos com Precificação Proporcional */}
          <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2 font-bold text-slate-200 text-sm">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>Composição Modular // Seleção Individual de Ferramentas</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Cada módulo possui valor proporcional transparente somado à mensalidade base (R$ 99,00/mês)
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleSelectAllModules}
                  className="px-2.5 py-1 rounded bg-blue-950/50 hover:bg-blue-900/60 text-blue-300 border border-blue-800/60 text-[11px] font-bold cursor-pointer transition"
                >
                  Marcar Todos
                </button>
                <button
                  type="button"
                  onClick={handleClearOptionalModules}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-bold cursor-pointer transition"
                >
                  Apenas Essenciais
                </button>
              </div>
            </div>

            {/* Grid dos Módulos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
              {MODULAR_PRICING_CATALOG.filter(m => m.id !== 'core_platform').map(mod => {
                const isSelected = Boolean(selectedModules[mod.id as keyof PlanAllowedModules]);
                return (
                  <div
                    key={mod.id}
                    onClick={() => handleToggleModule(mod.id as keyof PlanAllowedModules)}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'bg-blue-950/20 border-blue-500/50 text-white shadow-xs'
                        : 'bg-[#0F172A]/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // Handled by container onClick
                      className="mt-1 rounded accent-blue-500 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`font-bold text-xs ${isSelected ? 'text-blue-300' : 'text-slate-300'}`}>
                          {mod.label}
                        </span>
                        <span className={`font-mono font-bold text-[11px] shrink-0 px-2 py-0.5 rounded ${
                          isSelected ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-slate-800 text-slate-400'
                        }`}>
                          + R$ {mod.monthlyPrice.toFixed(2)}/mês
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 leading-snug line-clamp-2">
                        {mod.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Periodicidade & Descontos de Ciclo */}
          <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-200 text-sm">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Ciclo de Cobrança & Descontos de Fidelidade</span>
              </div>
              <span className="text-[11px] text-slate-400">
                Planos acima de 1 mês possuem fidelidade e descontos progressivos
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'mensal', label: 'Mensal', discount: '0%', months: 1, desc: 'Sem fidelidade' },
                { id: 'trimestral', label: 'Trimestral', discount: '5% OFF', months: 3, desc: 'Fidelidade 3 meses' },
                { id: 'semestral', label: 'Semestral', discount: '10% OFF', months: 6, desc: 'Fidelidade 6 meses' },
                { id: 'anual', label: 'Anual', discount: '15% OFF', months: 12, desc: 'Fidelidade 12 meses' },
              ].map(tier => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setPeriodicity(tier.id as PlanPeriodicity)}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    periodicity === tier.id
                      ? 'bg-emerald-950/30 border-emerald-500/60 ring-1 ring-emerald-500/50'
                      : 'bg-[#0F172A] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{tier.label}</span>
                    {tier.discount !== '0%' && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {tier.discount}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">
                    {tier.months} {tier.months === 1 ? 'mês' : 'meses'} • {tier.desc}
                  </div>
                </button>
              ))}
            </div>

            {/* Descontos Adicionais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <label className="flex items-center gap-2.5 p-3 rounded-lg bg-[#0F172A] border border-slate-800 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyPromptDiscount}
                  onChange={e => setApplyPromptDiscount(e.target.checked)}
                  className="rounded accent-emerald-500"
                />
                <div>
                  <span className="font-bold text-xs text-white block">Desconto de Pontualidade (5%)</span>
                  <span className="text-[11px] text-slate-400">Abatimento aplicado para pagamento rigoroso até o vencimento</span>
                </div>
              </label>

              {periodicity === 'anual' ? (
                <label className="flex items-center gap-2.5 p-3 rounded-lg bg-[#0F172A] border border-slate-800 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyAnnualCashDiscount}
                    onChange={e => setApplyAnnualCashDiscount(e.target.checked)}
                    className="rounded accent-emerald-500"
                  />
                  <div>
                    <span className="font-bold text-xs text-white block">Desconto Anual à Vista (15%)</span>
                    <span className="text-[11px] text-slate-400">Abatimento de 15% para liquidação integral à vista</span>
                  </div>
                </label>
              ) : (
                <div className="p-3 rounded-lg bg-[#0F172A]/50 border border-slate-800/60 text-slate-500 text-[11px] flex items-center gap-2">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>Desconto de 15% à vista disponível na seleção do plano anual.</span>
                </div>
              )}
            </div>
          </div>

          {/* Card Resumo do Pro-rata & Faturamento */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/30 to-indigo-950/20 border border-blue-800/40 space-y-4">
            <div className="flex items-center justify-between border-b border-blue-800/30 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-slate-100 text-sm">Resumo da Precificação Sob Medida</span>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 font-bold border border-blue-500/20">
                Transparência CDC Art. 52
              </span>
            </div>

            {/* Breakdown Visual */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
              <div className="p-3 bg-[#0B0F19] rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-0.5">Mensalidade Base</span>
                <span className="text-sm font-mono font-bold text-white">
                  R$ {pricingResult.monthlyBaseTotal.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Base + {pricingResult.extraUsersCount} users + {pricingResult.extraCompaniesCount} CNPJs + {pricingResult.modulesSelectedCount} mods
                </span>
              </div>

              <div className="p-3 bg-[#0B0F19] rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-0.5">Desconto do Ciclo</span>
                <span className="text-sm font-mono font-bold text-emerald-400">
                  {pricingResult.periodDiscountPercent}% OFF
                </span>
                <span className="text-[10px] text-emerald-400/80 block mt-0.5 font-mono">
                  - R$ {pricingResult.periodDiscountAmount.toFixed(2)}
                </span>
              </div>

              <div className="p-3 bg-[#0B0F19] rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-0.5">Valor do Ciclo Integral</span>
                <span className="text-sm font-mono font-bold text-amber-300">
                  R$ {pricingResult.finalPricePaid.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  ({pricingResult.monthsInPeriod}x de R$ {pricingResult.effectiveMonthlyCost.toFixed(2)})
                </span>
              </div>

              <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-800/60">
                <span className="text-emerald-300 font-bold block mb-0.5">1ª Fatura (Pro-rata)</span>
                <span className="text-base font-mono font-bold text-emerald-400">
                  R$ {pricingResult.proRata.firstInvoiceAmount.toFixed(2)}
                </span>
                <span className="text-[10px] text-emerald-300/80 block mt-0.5">
                  Venc: {pricingResult.proRata.firstInvoiceDueDate.split('-').reverse().join('/')}
                </span>
              </div>
            </div>

            {/* Explicação Didática do Pro-rata */}
            {pricingResult.proRata.isProRataApplied && (
              <div className="p-3 rounded-xl bg-[#0B0F19] border border-amber-500/30 text-slate-300 text-[11px] flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-300 block">
                    Cálculo Proporcional de Entrada (Pro-rata Ativo):
                  </span>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">
                    {pricingResult.proRata.explanation} Nos ciclos subsequentes, o valor regular de R$ {pricingResult.finalPricePaid.toFixed(2)} será cobrado normalmente a cada {pricingResult.periodicity}.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#0B0F19] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Multa compensatória de 20% sobre parcelas vincendas em caso de rescisão antecipada.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isClientSelfService ? 'Confirmar & Alterar Meu Plano' : 'Salvar Plano Sob Medida'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
