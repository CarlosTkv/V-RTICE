import React, { useState } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  DollarSign, 
  Percent, 
  Layers, 
  ArrowRight, 
  Sliders, 
  RotateCcw, 
  Target, 
  Users, 
  Building, 
  CheckCircle2, 
  HelpCircle,
  Zap,
  Scale,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { CompanyData, CalculationResult } from '../../types';
import { formatCurrencyBRL, FEDERAL_LIMIT, STATE_SUBLIMIT } from '../../utils/taxRules';

interface CockpitExecutiveSummaryProps {
  company: CompanyData;
  calculation: CalculationResult;
  timeHorizon: 'annual' | 'monthly';
  onChangeTimeHorizon: (val: 'annual' | 'monthly') => void;
  onNavigateToTab: (tab: string) => void;
  onChangeCompany?: (updated: CompanyData) => void;
}

export const CockpitExecutiveSummary: React.FC<CockpitExecutiveSummaryProps> = ({
  company,
  calculation,
  timeHorizon,
  onChangeTimeHorizon,
  onNavigateToTab,
  onChangeCompany
}) => {
  const [whatIfPercent, setWhatIfPercent] = useState<number>(0);
  const [isWhatIfExpanded, setIsWhatIfExpanded] = useState<boolean>(false);

  const divisor = timeHorizon === 'monthly' ? 12 : 1;

  // Real calculations
  const rbt12 = company.rbt12 || 0;
  const currentFatorR = calculation.fatorR || 0;
  const partnerSum = (company.partners || []).reduce((acc, p) => {
    const isMainPartner = p.participationPercent > 10 || p.isManager;
    if (!isMainPartner) return acc;
    return acc + (p.otherCompanies || []).reduce((sum, o) => {
      const triggers = (p.participationPercent > 10 && o.participationPercent > 10) || (p.isManager && o.isManager);
      return triggers ? sum + (o.revenue12m || 0) : sum;
    }, 0);
  }, 0);

  const consolidatedRevenue = rbt12 + partnerSum;
  const federalCapUsagePct = (consolidatedRevenue / FEDERAL_LIMIT) * 100;
  const sublimitUsagePct = (rbt12 / STATE_SUBLIMIT) * 100;

  // What-If Dynamic Projections
  const simulatedRbt12 = Math.max(1, rbt12 * (1 + whatIfPercent / 100));
  const simulatedConsolidated = Math.max(1, consolidatedRevenue * (1 + whatIfPercent / 100));
  
  // Approximate simulated tax rate based on linear/bracket adjustment
  const currentEffRate = calculation.effectiveRate || 10;
  // Simples rate generally increases logarithmically with revenue
  const simulatedEffRate = Math.min(33, Math.max(4, currentEffRate * Math.pow(simulatedRbt12 / Math.max(1, rbt12), 0.35)));
  const simulatedAnnualTax = (simulatedRbt12 * (simulatedEffRate / 100));
  const simulatedMonthlyTax = simulatedAnnualTax / 12;

  const simExceedsSublimit = simulatedRbt12 > STATE_SUBLIMIT;
  const simExceedsFederal = simulatedConsolidated > FEDERAL_LIMIT;

  // Best regime comparison
  const regimes = [
    {
      id: 'simples',
      name: 'Simples Nacional',
      tag: currentFatorR >= 28 ? 'Anexo III (Fator R Ativo)' : 'Anexo V / Padrão',
      annualTax: calculation.effectiveTaxAnnual,
      monthlyTax: calculation.effectiveTaxAnnual / 12,
      effectiveRate: calculation.effectiveRate,
      color: 'blue',
      isWinner: calculation.bestRegimeRecommendation.toLowerCase().includes('simples') && !calculation.exceedsFederalLimit
    },
    {
      id: 'hibrido',
      name: 'Simples Híbrido (Sublimite)',
      tag: 'ICMS/ISS no Regime Geral',
      annualTax: calculation.simplesHibridoAnnualTax,
      monthlyTax: calculation.simplesHibridoAnnualTax / 12,
      effectiveRate: calculation.simplesHibridoEffectiveRate,
      color: 'sky',
      isWinner: false
    },
    {
      id: 'presumido',
      name: 'Lucro Presumido',
      tag: 'PIS/COFINS Cumulativo + IRPJ/CSLL',
      annualTax: calculation.lucroPresumidoAnnualTax,
      monthlyTax: calculation.lucroPresumidoAnnualTax / 12,
      effectiveRate: calculation.lucroPresumidoEffectiveRate,
      color: 'indigo',
      isWinner: calculation.bestRegimeRecommendation.toLowerCase().includes('presumido')
    },
    {
      id: 'real',
      name: 'Lucro Real',
      tag: 'Margem Efetiva Apurada',
      annualTax: calculation.lucroRealAnnualTax,
      monthlyTax: calculation.lucroRealAnnualTax / 12,
      effectiveRate: calculation.lucroRealEffectiveRate,
      color: 'emerald',
      isWinner: calculation.bestRegimeRecommendation.toLowerCase().includes('real')
    }
  ];

  const winner = regimes.find(r => r.isWinner) || regimes[0];
  const currentRegimeTax = calculation.effectiveTaxAnnual;
  const bestRegimeTax = winner.annualTax;
  const annualSavings = Math.max(0, currentRegimeTax - bestRegimeTax);
  const monthlySavings = annualSavings / 12;

  return (
    <div className="space-y-4 w-full">
      {/* 1. HERO DECISION & STRATEGY BANNER (SÍNTESE EXECUTIVA DE DECISÃO) */}
      <div className="bg-gradient-to-br from-[#0F172A] via-[#131E38] to-[#0A0E1A] p-6 rounded-2xl border border-blue-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Instant Diagnosis */}
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Diagnóstico Estratégico 360°
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 text-xs font-mono border border-slate-700">
                {company.name} ({company.uf || 'SP'})
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                {annualSavings > 0 ? (
                  <>
                    Economia Projetada de <span className="text-emerald-400 font-mono">+{formatCurrencyBRL(annualSavings)}/ano</span> com o Regime Ideal
                  </>
                ) : (
                  <>
                    Sua empresa está enquadrada no <span className="text-blue-400">Regime Mais Econômico</span> ({winner.name})
                  </>
                )}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
                Recomendação Pericial: <b>{calculation.bestRegimeRecommendation}</b>. Carga tributária efetiva de <b>{winner.effectiveRate.toFixed(2)}%</b> sobre a receita bruta acumulada de {formatCurrencyBRL(rbt12)}.
              </p>
            </div>
          </div>

          {/* Right: Key Decision CTA & Values */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="bg-[#0B0F19]/90 p-4 rounded-xl border border-slate-800 text-center sm:text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {timeHorizon === 'monthly' ? 'Custo Tributário Mensal (DAS)' : 'Custo Tributário Anual'}
              </span>
              <span className="text-xl sm:text-2xl font-black text-white font-mono block mt-0.5">
                {formatCurrencyBRL(winner.annualTax / divisor)}
              </span>
              <span className="text-[10px] font-mono text-emerald-400 block">
                Alíquota Efetiva: {winner.effectiveRate.toFixed(2)}%
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => onNavigateToTab('parecer')}
                className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold tracking-wider uppercase transition shadow-lg shadow-blue-600/20 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Laudo Técnico Completo</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsWhatIfExpanded(!isWhatIfExpanded)}
                className="px-4 py-2 rounded-xl bg-indigo-950/70 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/60 text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                <span>{isWhatIfExpanded ? 'Fechar Simulador What-If' : 'Simular Oscilação de Receita'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* EXPANDABLE WHAT-IF SIMULATOR SLIDER */}
        {isWhatIfExpanded && (
          <div className="mt-6 pt-5 border-t border-slate-800/80 animate-fadeIn space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 bg-indigo-500/20 rounded-lg text-indigo-400">
                  <Sliders className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Simulador de Variação de Faturamento ("E se a Receita Mudar?")
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
                  whatIfPercent > 0 
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/30' 
                    : whatIfPercent < 0 
                    ? 'bg-rose-950 text-rose-300 border-rose-500/30' 
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  {whatIfPercent > 0 ? `+${whatIfPercent}% de Receita` : whatIfPercent < 0 ? `${whatIfPercent}% de Receita` : 'Receita Base Cadastrada'}
                </span>
                {whatIfPercent !== 0 && (
                  <button
                    type="button"
                    onClick={() => setWhatIfPercent(0)}
                    className="text-[10px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 border border-slate-700 transition flex items-center space-x-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Resetar</span>
                  </button>
                )}
              </div>
            </div>

            {/* Slider */}
            <div className="space-y-2">
              <input
                type="range"
                min="-30"
                max="50"
                step="5"
                value={whatIfPercent}
                onChange={(e) => setWhatIfPercent(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 border border-slate-700"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>-30% (Retração)</span>
                <span>-15%</span>
                <span className="text-indigo-400 font-bold">0% (Atual)</span>
                <span>+25%</span>
                <span>+50% (Expansão)</span>
              </div>
            </div>

            {/* Simulated Results Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              <div className="bg-[#0B0F19] p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">RBT12 Projetada:</span>
                <span className="text-sm font-bold font-mono text-white block mt-0.5">
                  {formatCurrencyBRL(simulatedRbt12)}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {formatCurrencyBRL(simulatedRbt12 / 12)}/mês
                </span>
              </div>

              <div className="bg-[#0B0F19] p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Alíquota Efetiva Est.:</span>
                <span className="text-sm font-bold font-mono text-indigo-400 block mt-0.5">
                  {simulatedEffRate.toFixed(2)}%
                </span>
                <span className="text-[10px] text-slate-500">
                  {simulatedEffRate > currentEffRate ? `▲ +${(simulatedEffRate - currentEffRate).toFixed(2)}% p.p.` : `▼ ${(simulatedEffRate - currentEffRate).toFixed(2)}% p.p.`}
                </span>
              </div>

              <div className="bg-[#0B0F19] p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">DAS Projetado ({timeHorizon === 'monthly' ? 'Mensal' : 'Anual'}):</span>
                <span className="text-sm font-bold font-mono text-emerald-400 block mt-0.5">
                  {formatCurrencyBRL(timeHorizon === 'monthly' ? simulatedMonthlyTax : simulatedAnnualTax)}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Total Anual: {formatCurrencyBRL(simulatedAnnualTax)}
                </span>
              </div>

              <div className="bg-[#0B0F19] p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status dos Limites:</span>
                <div className="mt-1 flex flex-col gap-1">
                  {simExceedsFederal ? (
                    <span className="text-[10px] font-bold text-rose-400 flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3 text-rose-400" />
                      <span>Excede Teto R$ 4,8M</span>
                    </span>
                  ) : simExceedsSublimit ? (
                    <span className="text-[10px] font-bold text-amber-400 flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      <span>Excede Sublimite R$ 3,6M</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>100% Dentro dos Tetos</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. SEMÁFORO DOS 4 PILARES DE CONFORMIDADE FISCAL (4 CARDS VISUAIS INTERATIVOS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Pilar 1: Teto Federal (R$ 4,8M) */}
        <div 
          onClick={() => onNavigateToTab('societario')}
          className="bg-[#0F172A] p-4 rounded-xl border border-slate-800 hover:border-blue-500/50 hover:bg-[#131C31] transition-all cursor-pointer space-y-2 group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">1. Teto Federal (R$ 4,8M)</span>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
              federalCapUsagePct > 100 
                ? 'bg-rose-950 text-rose-300 border border-rose-500/40' 
                : federalCapUsagePct > 80 
                ? 'bg-amber-950 text-amber-300 border border-amber-500/40' 
                : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
            }`}>
              {federalCapUsagePct.toFixed(1)}% Usado
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-base font-bold font-mono text-white">
              {formatCurrencyBRL(consolidatedRevenue)}
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${federalCapUsagePct > 100 ? 'bg-rose-500' : federalCapUsagePct > 80 ? 'bg-amber-500' : 'bg-blue-500'}`}
                style={{ width: `${Math.min(100, federalCapUsagePct)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
            <span>Margem: {formatCurrencyBRL(Math.max(0, FEDERAL_LIMIT - consolidatedRevenue))}</span>
            <span className="text-blue-400 group-hover:underline flex items-center">
              Ver Teia <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Pilar 2: Sublimite Estadual (R$ 3,6M) */}
        <div 
          onClick={() => onNavigateToTab('planejamento')}
          className="bg-[#0F172A] p-4 rounded-xl border border-slate-800 hover:border-blue-500/50 hover:bg-[#131C31] transition-all cursor-pointer space-y-2 group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">2. Sublimite Estadual ({company.uf || 'SP'})</span>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
              sublimitUsagePct > 100 
                ? 'bg-amber-950 text-amber-300 border border-amber-500/40' 
                : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
            }`}>
              {sublimitUsagePct.toFixed(1)}% Usado
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-base font-bold font-mono text-white">
              {formatCurrencyBRL(rbt12)}
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${sublimitUsagePct > 100 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(100, sublimitUsagePct)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
            <span>{sublimitUsagePct > 100 ? 'ICMS/ISS no Regime Geral' : 'ICMS/ISS no DAS'}</span>
            <span className="text-blue-400 group-hover:underline flex items-center">
              Detalhes <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Pilar 3: Auditoria do Fator R (28%) */}
        <div 
          onClick={() => onNavigateToTab('fator_r')}
          className="bg-[#0F172A] p-4 rounded-xl border border-slate-800 hover:border-blue-500/50 hover:bg-[#131C31] transition-all cursor-pointer space-y-2 group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">3. Fator R (FS12 / RBT12)</span>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
              currentFatorR >= 28 
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' 
                : 'bg-amber-950 text-amber-300 border border-amber-500/40'
            }`}>
              {currentFatorR >= 28 ? 'Anexo III (6%)' : 'Anexo V (15,5%)'}
            </span>
          </div>

          <div className="space-y-1">
            <div className={`text-base font-bold font-mono ${currentFatorR >= 28 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {currentFatorR.toFixed(2)}% <span className="text-xs text-slate-400 font-sans font-normal">(Meta: ≥ 28%)</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
              <div 
                className={`h-full rounded-full ${currentFatorR >= 28 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                style={{ width: `${Math.min(100, (currentFatorR / 40) * 100)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
            <span>{currentFatorR >= 28 ? 'Enquadramento Otimizado' : 'Ajustar Pró-Labore'}</span>
            <span className="text-blue-400 group-hover:underline flex items-center">
              Calibrar <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Pilar 4: Cruzamento Societário (LC 123 Art. 3º § 4º) */}
        <div 
          onClick={() => onNavigateToTab('societario')}
          className="bg-[#0F172A] p-4 rounded-xl border border-slate-800 hover:border-blue-500/50 hover:bg-[#131C31] transition-all cursor-pointer space-y-2 group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">4. Teia de Sócios & Coligadas</span>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-500/30">
              {(company.partners || []).length} Sócios
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-base font-bold font-mono text-white">
              {partnerSum > 0 ? `+${formatCurrencyBRL(partnerSum)} somado` : 'Sem soma de coligadas'}
            </div>
            <div className="text-[10px] text-slate-400">
              {partnerSum > 0 ? 'Art. 3º § 4º LC 123/06 em vigor' : 'Participações isoladas ou ≤ 10%'}
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
            <span>Simular Contrato</span>
            <span className="text-blue-400 group-hover:underline flex items-center">
              Abrir Mapa <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
            </span>
          </div>
        </div>

      </div>

      {/* 3. MATRIZ COMPARATIVA DE REGIMES TRIBUTÁRIOS (CARDS LADO A LADO 360°) */}
      <div className="bg-[#0F172A] p-5 rounded-2xl border border-slate-800 space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Matriz Comparativa dos 4 Regimes Tributários
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Valores projetados em {timeHorizon === 'monthly' ? 'Custo Mensal Estimado (Guia DAS / DARF)' : 'Custo Anual Consolidado'}
              </p>
            </div>
          </div>

          <div className="flex items-center bg-[#0B0F19] p-0.5 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => onChangeTimeHorizon('annual')}
              className={`px-3 py-1.5 rounded-lg transition ${
                timeHorizon === 'annual' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Visão Anual
            </button>
            <button
              type="button"
              onClick={() => onChangeTimeHorizon('monthly')}
              className={`px-3 py-1.5 rounded-lg transition ${
                timeHorizon === 'monthly' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Visão Mensal
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {regimes.map((regime) => {
            const isSelectedWinner = regime.isWinner;
            const diffVsWinner = regime.annualTax - winner.annualTax;

            return (
              <div
                key={regime.id}
                className={`p-4 rounded-xl border transition-all relative flex flex-col justify-between space-y-3 ${
                  isSelectedWinner 
                    ? 'bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/30 shadow-lg' 
                    : 'bg-[#0B0F19] border-slate-800 hover:border-slate-700'
                }`}
              >
                {isSelectedWinner && (
                  <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 text-[9px] font-black uppercase tracking-wider shadow-md">
                    ✓ Melhor Opção
                  </span>
                )}

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {regime.name}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-300">
                      {regime.effectiveRate.toFixed(2)}% ef.
                    </span>
                  </div>
                  <div className="text-base sm:text-lg font-bold font-mono text-white">
                    {formatCurrencyBRL(regime.annualTax / divisor)}
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    {regime.tag}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                  {isSelectedWinner ? (
                    <span className="text-emerald-400 font-bold font-mono">
                      Cenário Mais Econômico
                    </span>
                  ) : diffVsWinner > 0 ? (
                    <span className="text-amber-400 font-mono">
                      +{formatCurrencyBRL(diffVsWinner / divisor)} mais caro
                    </span>
                  ) : (
                    <span className="text-slate-400">Equivalente</span>
                  )}

                  <button
                    type="button"
                    onClick={() => onNavigateToTab(regime.id === 'simples' ? 'simples_nacional' : 'planejamento')}
                    className="text-blue-400 hover:text-blue-300 font-bold transition flex items-center"
                  >
                    Simular <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
