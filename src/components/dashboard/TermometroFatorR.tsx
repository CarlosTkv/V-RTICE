import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Percent, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Sliders, 
  RotateCcw, 
  ShieldCheck, 
  Info, 
  Check, 
  Calculator, 
  FileText,
  ChevronDown,
  ChevronUp,
  Zap,
  DollarSign
} from 'lucide-react';
import { CompanyData, CalculationResult } from '../../types';
import { formatCurrencyBRL } from '../../utils/taxRules';
import { HelpTooltip } from '../HelpTooltip';

interface TermometroFatorRProps {
  company: CompanyData;
  onChangeCompany: (company: CompanyData) => void;
  calculation: CalculationResult;
  onNavigateToTab?: (tab: any) => void;
  showToast?: (msg: string) => void;
}

export const TermometroFatorR: React.FC<TermometroFatorRProps> = ({
  company,
  onChangeCompany,
  calculation,
  onNavigateToTab,
  showToast
}) => {
  const currentRbt12 = Math.max(1, company.rbt12 || 0);
  const currentPayroll12 = company.payroll12m || 0;
  const currentFatorR = (currentPayroll12 / currentRbt12) * 100;

  // Additional monthly pro-labore / payroll simulator state
  const [simulatedMonthlyAdd, setSimulatedMonthlyAdd] = useState<number>(0);
  const [isLegalDetailsOpen, setIsLegalDetailsOpen] = useState<boolean>(false);
  const [justApplied, setJustApplied] = useState<boolean>(false);

  // Exact target values for 28.0%
  const target28Payroll12 = Math.ceil(currentRbt12 * 0.28);
  const gapTo28 = Math.max(0, target28Payroll12 - currentPayroll12);
  const monthlyGapTo28 = gapTo28 > 0 ? Math.ceil(gapTo28 / 12) : 0;

  // Safe preset targets
  const target285Payroll12 = Math.ceil(currentRbt12 * 0.285);
  const gapTo285 = Math.max(0, target285Payroll12 - currentPayroll12);
  const monthlyGapTo285 = gapTo285 > 0 ? Math.ceil(gapTo285 / 12) : 0;

  const target30Payroll12 = Math.ceil(currentRbt12 * 0.30);
  const gapTo30 = Math.max(0, target30Payroll12 - currentPayroll12);
  const monthlyGapTo30 = gapTo30 > 0 ? Math.ceil(gapTo30 / 12) : 0;

  // Simulated metrics
  const simPayroll12 = Math.max(0, currentPayroll12 + (simulatedMonthlyAdd * 12));
  const simFatorR = (simPayroll12 / currentRbt12) * 100;
  const isCurrentlyAnexo3 = currentFatorR >= 28.0;
  const isSimulatedAnexo3 = simFatorR >= 28.0;

  // Tax calculations (Estimated effective rates for Anexo V vs Anexo III based on RBT12 bracket)
  // Anexo V starts at 15.5%, typical effective rate 15.5% - 21%
  // Anexo III starts at 6.0%, typical effective rate 6.0% - 13.5%
  const bracketMultiplier = currentRbt12 > 1800000 ? 1.25 : currentRbt12 > 720000 ? 1.15 : 1.0;
  const estRateAnexo5 = Math.min(0.24, 0.165 * bracketMultiplier);
  const estRateAnexo3 = Math.min(0.16, 0.085 * bracketMultiplier);

  const annualTaxAnexo5 = currentRbt12 * estRateAnexo5;
  const annualTaxAnexo3 = currentRbt12 * estRateAnexo3;
  const grossTaxSavingsAnnual = Math.max(0, annualTaxAnexo5 - annualTaxAnexo3);

  // Pro-labore retention cost estimation (INSS PF 11% + IRRF average ~ 16% total retention cost)
  const simulatedAdditionalAnnualPayroll = Math.max(0, simulatedMonthlyAdd * 12);
  const annualPFRetentions = simulatedAdditionalAnnualPayroll * 0.20;
  const netFinancialBenefitAnnual = isSimulatedAnexo3 
    ? (isCurrentlyAnexo3 ? 0 : grossTaxSavingsAnnual) - annualPFRetentions
    : 0;

  // Thermometer percentage position for scale 0% to 50%
  const maxScale = 50;
  const clampPercent = (val: number) => Math.min(100, Math.max(0, (val / maxScale) * 100));
  const currentMarkerPosition = clampPercent(currentFatorR);
  const simulatedMarkerPosition = clampPercent(simFatorR);
  const targetMarkerPosition = clampPercent(28.0);

  // Determine thermometer status zone
  const getFatorRZone = (rate: number) => {
    if (rate < 20) return { zone: 'critico', color: 'rose', label: 'Crítico (< 20%) - Anexo V' };
    if (rate < 28) return { zone: 'alerta', color: 'amber', label: 'Proximidade (20% - 27.9%) - Alerta Anexo V' };
    if (rate <= 35) return { zone: 'otimo', color: 'emerald', label: 'Zona Ótima (28% - 35%) - Anexo III' };
    return { zone: 'superavit', color: 'blue', label: 'Superavitário (> 35%) - Custo Elevado' };
  };

  const currentZone = getFatorRZone(currentFatorR);
  const isNearThreshold = currentFatorR >= 22 && currentFatorR < 28;
  const isNarrowMargin = currentFatorR >= 28 && currentFatorR < 29.5;

  // Preset handlers
  const handleSetPreset = (monthlyVal: number) => {
    setSimulatedMonthlyAdd(monthlyVal);
  };

  const handleApplyToCompany = () => {
    onChangeCompany({
      ...company,
      payroll12m: simPayroll12
    });
    setJustApplied(true);
    if (showToast) {
      showToast(`Folha de pagamento atualizada para ${formatCurrencyBRL(simPayroll12)} (Fator R: ${simFatorR.toFixed(1)}%)!`);
    }
    setTimeout(() => setJustApplied(false), 3500);
  };

  return (
    <div className="bg-[#0f172a]/95 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl backdrop-blur-md relative overflow-hidden">
      {/* Decorative gradient highlight */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-600/5 via-indigo-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header with Title & Live Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 text-amber-400">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base md:text-lg font-bold text-white tracking-tight">
                  Termômetro de Fator R & Planejamento de Anexo
                </h3>
                <HelpTooltip
                  title="Termômetro de Fator R (LC 123/2006)"
                  content="O Fator R é a razão matemática entre a Folha de Salários acumulada dos últimos 12 meses (incluindo pró-labore e encargos) e a Receita Bruta Acumulada (RBT12). Quando a relação atinge ou supera 28%, atividades de serviços intelectuais migram do oneroso Anexo V (a partir de 15,5%) para o vantajoso Anexo III (a partir de 6,0%)."
                  law="Art. 18, §§ 5º-J e 5º-M da LC 123/2006"
                />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Relação em tempo real Folha / Faturamento (FS12 / RBT12) com auditoria preditiva de enquadramento
              </p>
            </div>
          </div>
        </div>

        {/* Current Annex Status Badge */}
        <div className="flex items-center space-x-3">
          <div className={`px-3.5 py-2 rounded-xl border text-right transition-all ${
            isCurrentlyAnexo3 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
              : isNearThreshold
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 ring-1 ring-amber-400/30'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Regime Vigente
            </div>
            <div className="text-sm font-bold flex items-center space-x-1.5 justify-end">
              <span>{isCurrentlyAnexo3 ? 'Anexo III (Alíquota ~6%)' : 'Anexo V (Alíquota ~15.5%)'}</span>
              {isCurrentlyAnexo3 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              )}
            </div>
          </div>

          {onNavigateToTab && (
            <button
              onClick={() => onNavigateToTab('fator_r')}
              className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
              title="Ir para o módulo de cálculo avançado de Fator R"
            >
              <span>Auditoria Completa</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
            </button>
          )}
        </div>
      </div>

      {/* Proactive Context Alert Banner */}
      <div className="mt-4">
        {isNearThreshold && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }} 
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border-l-4 border-amber-500 rounded-r-xl border border-amber-500/30 flex items-start space-x-3 shadow-md"
          >
            <div className="p-1 rounded-lg bg-amber-500/20 text-amber-400 mt-0.5 shrink-0 animate-pulse">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="flex-1 text-xs">
              <div className="font-bold text-amber-300 flex items-center space-x-2">
                <span>OPORTUNIDADE CRÍTICA DE ECONOMIA: FATOR R A {currentFatorR.toFixed(1)}% (QUASE 28%)</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.2 rounded font-mono">
                  Faltam apenas {(28 - currentFatorR).toFixed(1)}%
                </span>
              </div>
              <p className="text-slate-300 mt-1 leading-relaxed">
                A empresa está a apenas <strong className="text-amber-200">{formatCurrencyBRL(monthlyGapTo28)}/mês</strong> em Pró-labore ({formatCurrencyBRL(gapTo28)} no acumulado de 12 meses) de migrar do <strong>Anexo V (15,5%)</strong> para o <strong>Anexo III (6,0%)</strong>. Essa transição gera uma economia bruta estimada em <strong className="text-emerald-400">{formatCurrencyBRL(grossTaxSavingsAnnual)}/ano</strong> na guia do DAS!
              </p>
            </div>
          </motion.div>
        )}

        {isNarrowMargin && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }} 
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 bg-gradient-to-r from-blue-500/15 to-transparent border-l-4 border-blue-500 rounded-r-xl border border-blue-500/30 flex items-start space-x-3 shadow-md"
          >
            <div className="p-1 rounded-lg bg-blue-500/20 text-blue-400 mt-0.5 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div className="flex-1 text-xs">
              <div className="font-bold text-blue-300">
                ALERTA PREVENTIVO: MARGEM ESTREITA NO ANEXO III ({currentFatorR.toFixed(1)}%)
              </div>
              <p className="text-slate-300 mt-1 leading-relaxed">
                A empresa está enquadrada no Anexo III, porém a folga sobre os 28% é de apenas <strong className="text-blue-200">{(currentFatorR - 28).toFixed(2)}%</strong>. Um eventual aumento no faturamento do próximo mês sem incremento proporcional na folha de pró-labore poderá rebaixar a empresa ao Anexo V. Recomenda-se manter uma margem mínima de 28,5% a 29%.
              </p>
            </div>
          </motion.div>
        )}

        {currentFatorR < 20 && (
          <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl flex items-start space-x-3">
            <div className="p-1 rounded-lg bg-rose-500/10 text-rose-400 mt-0.5 shrink-0">
              <Info className="w-4 h-4" />
            </div>
            <div className="flex-1 text-xs">
              <div className="font-bold text-rose-300">
                ENQUADRAMENTO NO ANEXO V ({currentFatorR.toFixed(1)}%) — TRIBUTAÇÃO MAJORADA
              </div>
              <p className="text-slate-400 mt-1 leading-relaxed">
                A folha atual ({formatCurrencyBRL(currentPayroll12)}) representa menos de 20% da receita anual ({formatCurrencyBRL(currentRbt12)}). Simule no painel abaixo o pró-labore necessário para planejar a migração tributária e otimizar custos.
              </p>
            </div>
          </div>
        )}

        {currentFatorR >= 29.5 && currentFatorR <= 35 && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start space-x-3">
            <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="flex-1 text-xs">
              <div className="font-bold text-emerald-300">
                ENQUADRAMENTO EFICIENTE NO ANEXO III ({currentFatorR.toFixed(1)}%)
              </div>
              <p className="text-emerald-400/90 mt-1 leading-relaxed">
                Excelente enquadramento! A folha supera a marca de 28% com margem de segurança confortável de {(currentFatorR - 28).toFixed(1)}%, assegurando a menor alíquota do Simples Nacional.
              </p>
            </div>
          </div>
        )}

        {currentFatorR > 35 && (
          <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start space-x-3">
            <div className="p-1 rounded-lg bg-blue-500/20 text-blue-400 mt-0.5 shrink-0">
              <Info className="w-4 h-4" />
            </div>
            <div className="flex-1 text-xs">
              <div className="font-bold text-blue-300">
                FATOR R SUPERAVITÁRIO ({currentFatorR.toFixed(1)}%) — OPORTUNIDADE DE ECONOMIA PREVIDENCIÁRIA
              </div>
              <p className="text-slate-300 mt-1 leading-relaxed">
                A folha de pagamento excede a meta legal em {(currentFatorR - 28).toFixed(1)}%. Há margem para redução de pró-labore sem perder o benefício do Anexo III, economizando INSS e IRPF.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Thermometer Visual Gauge */}
      <div className="mt-6 pt-2">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
          <span>0%</span>
          <span className="hidden sm:inline">14% (Média de Serviços)</span>
          <span className="text-amber-400 font-bold flex items-center space-x-1">
            <span>20% Alerta</span>
          </span>
          <span className="text-emerald-400 font-bold flex items-center space-x-1">
            <span>⭐ Meta Legal 28.0%</span>
          </span>
          <span className="hidden sm:inline">35% Seguro</span>
          <span>50%+</span>
        </div>

        {/* The Gauge Track Container */}
        <div className="relative h-10 w-full bg-slate-900 rounded-xl p-1 border border-slate-700/80 shadow-inner">
          {/* Background Gradient Zones */}
          <div className="relative w-full h-full rounded-lg overflow-hidden flex">
            {/* Zone 1: Red 0 to 20% (40% of 50 scale) */}
            <div 
              style={{ width: `${(20 / maxScale) * 100}%` }} 
              className="h-full bg-gradient-to-r from-rose-900/60 to-rose-700/50 border-r border-rose-500/30 flex items-center justify-center text-[10px] text-rose-300 font-semibold tracking-wider uppercase px-1 overflow-hidden"
              title="Zona Crítica: Tributa no Anexo V"
            >
              <span className="truncate">Anexo V (&lt;20%)</span>
            </div>

            {/* Zone 2: Amber 20 to 28% (16% of 50 scale) */}
            <div 
              style={{ width: `${(8 / maxScale) * 100}%` }} 
              className="h-full bg-gradient-to-r from-amber-600/50 to-amber-500/50 border-r-2 border-dashed border-emerald-400 flex items-center justify-center text-[10px] text-amber-200 font-semibold tracking-wider uppercase px-1 overflow-hidden"
              title="Zona de Alerta e Oportunidade (20% a 27.9%)"
            >
              <span className="truncate">Quase Lá</span>
            </div>

            {/* Zone 3: Green 28 to 35% (14% of 50 scale) */}
            <div 
              style={{ width: `${(7 / maxScale) * 100}%` }} 
              className="h-full bg-gradient-to-r from-emerald-600/60 to-emerald-500/50 border-r border-emerald-500/30 flex items-center justify-center text-[10px] text-emerald-200 font-semibold tracking-wider uppercase px-1 overflow-hidden"
              title="Zona Ótima: Enquadrado no Anexo III"
            >
              <span className="truncate">Anexo III (Ótimo)</span>
            </div>

            {/* Zone 4: Blue 35 to 50%+ (30% of 50 scale) */}
            <div 
              style={{ width: `${(15 / maxScale) * 100}%` }} 
              className="h-full bg-gradient-to-r from-blue-700/40 to-indigo-700/40 flex items-center justify-center text-[10px] text-blue-300 font-semibold tracking-wider uppercase px-1 overflow-hidden"
              title="Zona Superavitária (> 35%)"
            >
              <span className="truncate">Margem Alta</span>
            </div>
          </div>

          {/* 28.0% Critical Line Marker */}
          <div 
            style={{ left: `${targetMarkerPosition}%` }}
            className="absolute top-0 bottom-0 w-0.5 bg-emerald-400 z-10 shadow-[0_0_10px_#10b981]"
          >
            {/* Top Anchor Tag */}
            <div className="absolute -top-6 -translate-x-1/2 bg-emerald-500 text-slate-950 font-extrabold text-[10px] px-1.5 py-0.5 rounded shadow whitespace-nowrap flex items-center space-x-1">
              <span>28%</span>
            </div>
          </div>

          {/* Current Position Pin / Needle */}
          <motion.div 
            style={{ left: `${currentMarkerPosition}%` }}
            animate={{ left: `${currentMarkerPosition}%` }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 pointer-events-none"
          >
            <div className={`px-2 py-0.5 rounded-full text-xs font-bold font-mono text-white shadow-xl flex items-center space-x-1 border ring-2 ${
              isCurrentlyAnexo3 
                ? 'bg-emerald-600 border-emerald-300 ring-emerald-500/50' 
                : isNearThreshold
                ? 'bg-amber-600 border-amber-300 ring-amber-500/50'
                : 'bg-rose-600 border-rose-300 ring-rose-500/50'
            }`}>
              <span className="text-[10px]">Atual:</span>
              <span>{currentFatorR.toFixed(1)}%</span>
            </div>
            {/* Down arrow marker */}
            <div className={`w-2 h-2 mx-auto rotate-45 -mt-1 ${
              isCurrentlyAnexo3 ? 'bg-emerald-600' : isNearThreshold ? 'bg-amber-600' : 'bg-rose-600'
            }`} />
          </motion.div>

          {/* Simulated Ghost Pin (if what-if differs from 0) */}
          {simulatedMonthlyAdd !== 0 && (
            <motion.div 
              style={{ left: `${simulatedMarkerPosition}%` }}
              animate={{ left: `${simulatedMarkerPosition}%` }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-30 pointer-events-none"
            >
              <div className={`px-2 py-0.5 rounded-full text-xs font-bold font-mono text-white shadow-2xl flex items-center space-x-1 border ring-2 animate-bounce ${
                isSimulatedAnexo3 
                  ? 'bg-emerald-500 border-emerald-200 ring-emerald-400' 
                  : 'bg-amber-500 border-amber-200 ring-amber-400'
              }`}>
                <span className="text-[10px]">Simulado:</span>
                <span>{simFatorR.toFixed(1)}%</span>
              </div>
              <div className={`w-2 h-2 mx-auto rotate-45 -mt-1 ${
                isSimulatedAnexo3 ? 'bg-emerald-500' : 'bg-amber-500'
              }`} />
            </motion.div>
          )}
        </div>

        {/* Legend beneath the track */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-3 text-xs text-slate-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              <span>Anexo V (&lt; 20%)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span>Proximidade / Alerta (20% - 27.9%)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>Anexo III (&ge; 28%)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
              <span>Superavitário (&gt; 35%)</span>
            </div>
          </div>

          <div className="font-mono text-slate-300">
            Folha 12M: <strong className="text-white">{formatCurrencyBRL(currentPayroll12)}</strong> / RBT12: <strong className="text-white">{formatCurrencyBRL(currentRbt12)}</strong>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Fator R Apurado
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1">
            {currentFatorR.toFixed(2)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Meta Legal: 28.00%
          </div>
        </div>

        <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Déficit para Anexo III
          </div>
          <div className={`text-xl font-bold font-mono mt-1 ${
            gapTo28 > 0 ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {gapTo28 > 0 ? formatCurrencyBRL(gapTo28) : 'Meta Superada!'}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {gapTo28 > 0 ? `${formatCurrencyBRL(monthlyGapTo28)} / mês` : 'Folha atende LC 123/06'}
          </div>
        </div>

        <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Economia Bruta no DAS
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
            {formatCurrencyBRL(grossTaxSavingsAnnual)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Anexo V vs. Anexo III (Ano)
          </div>
        </div>

        <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Economia Líquida Anual
          </div>
          <div className="text-xl font-bold font-mono text-indigo-300 mt-1">
            {isCurrentlyAnexo3 
              ? formatCurrencyBRL(grossTaxSavingsAnnual) 
              : simulatedMonthlyAdd > 0 && isSimulatedAnexo3
              ? formatCurrencyBRL(Math.max(0, netFinancialBenefitAnnual))
              : formatCurrencyBRL(grossTaxSavingsAnnual - (monthlyGapTo28 * 12 * 0.20))}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Descontado INSS/IRRF PF
          </div>
        </div>
      </div>

      {/* Interactive Planning Simulator Section */}
      <div className="mt-6 pt-5 border-t border-slate-800/80 bg-[#0B0F19]/60 rounded-xl p-4 md:p-5 border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-blue-400" />
            <h4 className="text-sm font-bold text-white tracking-tight">
              Simulador Dinâmico de Transição de Anexo (What-If)
            </h4>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 text-[11px] mr-1">Metas Rápidas:</span>
            <button
              onClick={() => handleSetPreset(monthlyGapTo28)}
              disabled={gapTo28 === 0}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer border ${
                simulatedMonthlyAdd === monthlyGapTo28 && gapTo28 > 0
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
            >
              Bater 28.0% ({formatCurrencyBRL(monthlyGapTo28)}/mês)
            </button>

            <button
              onClick={() => handleSetPreset(monthlyGapTo285)}
              disabled={gapTo285 === 0}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer border ${
                simulatedMonthlyAdd === monthlyGapTo285 && gapTo285 > 0
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
            >
              Margem Segura 28.5%
            </button>

            <button
              onClick={() => handleSetPreset(monthlyGapTo30)}
              disabled={gapTo30 === 0}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer border ${
                simulatedMonthlyAdd === monthlyGapTo30 && gapTo30 > 0
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
            >
              Zona Robusta 30.0%
            </button>

            {simulatedMonthlyAdd !== 0 && (
              <button
                onClick={() => setSimulatedMonthlyAdd(0)}
                className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition cursor-pointer flex items-center space-x-1"
                title="Resetar simulação para valores reais cadastrados"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Interactive Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="fator-r-slider" className="text-slate-300 font-medium flex items-center space-x-1.5">
              <span>Ajuste Mensal no Pró-labore / Folha:</span>
              <span className="font-mono font-bold text-blue-400 text-sm">
                {simulatedMonthlyAdd >= 0 ? `+${formatCurrencyBRL(simulatedMonthlyAdd)}` : formatCurrencyBRL(simulatedMonthlyAdd)} / mês
              </span>
            </label>
            <div className="text-slate-400 font-mono">
              Impacto Anual: <strong className="text-white">+{formatCurrencyBRL(simulatedMonthlyAdd * 12)}</strong>
            </div>
          </div>

          <input
            id="fator-r-slider"
            type="range"
            min={-Math.min(15000, currentPayroll12 / 12)}
            max={Math.max(40000, monthlyGapTo28 * 2.5)}
            step={250}
            value={simulatedMonthlyAdd}
            onChange={(e) => setSimulatedMonthlyAdd(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />

          <div className="flex justify-between text-[11px] text-slate-500 font-mono">
            <span>Redução</span>
            <span>R$ 0 (Atual)</span>
            <span>+R$ 10.000</span>
            <span>+R$ 20.000</span>
            <span>+R$ 30.000+</span>
          </div>
        </div>

        {/* Comparison Result Box */}
        {simulatedMonthlyAdd !== 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase">
                Novo Fator R Simulado
              </div>
              <div className="text-2xl font-bold font-mono mt-1 flex items-center space-x-2">
                <span className={isSimulatedAnexo3 ? 'text-emerald-400' : 'text-amber-400'}>
                  {simFatorR.toFixed(2)}%
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  isSimulatedAnexo3 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {isSimulatedAnexo3 ? 'Migra para Anexo III' : 'Permanece Anexo V'}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Folha anual ajustada: {formatCurrencyBRL(simPayroll12)}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase">
                Variação no Caixa Tributário
              </div>
              <div className="text-lg font-bold font-mono text-white mt-1">
                {isSimulatedAnexo3 && !isCurrentlyAnexo3 ? (
                  <span className="text-emerald-400">-{formatCurrencyBRL(grossTaxSavingsAnnual)} no DAS</span>
                ) : isCurrentlyAnexo3 && !isSimulatedAnexo3 ? (
                  <span className="text-rose-400">+{formatCurrencyBRL(annualTaxAnexo5 - annualTaxAnexo3)} no DAS</span>
                ) : (
                  <span className="text-slate-300">Sem alteração de anexo</span>
                )}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Custo retenção PF estimado: ~{formatCurrencyBRL(annualPFRetentions)}/ano
              </div>
            </div>

            <div className="flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase">
                  Saldo Líquido no Bolso
                </div>
                <div className="text-xl font-bold font-mono text-emerald-300 mt-1">
                  {netFinancialBenefitAnnual > 0 
                    ? `+${formatCurrencyBRL(netFinancialBenefitAnnual)} / ano`
                    : 'R$ 0,00'}
                </div>
              </div>

              <div className="mt-3 flex items-center space-x-2">
                <button
                  onClick={handleApplyToCompany}
                  className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-lg shadow-emerald-900/30"
                >
                  {justApplied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-200" />
                      <span>Aplicado com Sucesso!</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Efetivar Pró-labore na Empresa</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Accordion: Fundamentação Legal e Regras do Fator R */}
      <div className="mt-4 pt-2">
        <button
          onClick={() => setIsLegalDetailsOpen(!isLegalDetailsOpen)}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 text-xs text-slate-400 hover:text-slate-300 transition cursor-pointer border border-slate-800"
        >
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-slate-300">
              Fundamentação Legal & Metodologia de Cálculo (LC nº 123/2006, art. 18, §§ 5º-J e 5º-M)
            </span>
          </div>
          {isLegalDetailsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <AnimatePresence>
          {isLegalDetailsOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-slate-900/40 rounded-b-xl border-x border-b border-slate-800 text-xs text-slate-300 space-y-2.5 leading-relaxed">
                <p>
                  <strong>Fórmula Legal:</strong> <code>Fator R = Folha de Salários 12M (FS12) ÷ Receita Bruta 12M (RBT12)</code>.
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-400 ml-1">
                  <li>
                    <strong>Composição da Folha (FS12):</strong> Salários de empregados, pró-labore dos sócios, 13º salário, aviso prévio indenizado e a respectiva contribuição patronal previdenciária (CPP) recolhida no período.
                  </li>
                  <li>
                    <strong>Condição de Enquadramento:</strong> Se <code>FS12 ÷ RBT12 &ge; 0,28 (28,00%)</code>, a atividade será tributada pelo <strong>Anexo III</strong> (alíquota inicial de 6,00%). Se inferior a 28%, a tributação se dá pelo <strong>Anexo V</strong> (alíquota inicial de 15,50%).
                  </li>
                  <li>
                    <strong>Atividades Típicas do Fator R:</strong> Desenvolvimento de software e programação, arquitetura e engenharia, consultoria empresarial, medicina e odontologia, psicologia, fisioterapia, perícias e auditorias, representação comercial, entre outras constantes do § 5º-I do art. 18 da LC 123/06.
                  </li>
                  <li>
                    <strong>Período de Apuração:</strong> A cada mês a proporção é recalculada sobre os 12 meses anteriores. Oscilações no faturamento mensal sem recomposição da folha podem desenquadrar a empresa de forma retroativa ao mês corrente.
                  </li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
