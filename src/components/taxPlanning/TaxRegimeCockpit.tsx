import React, { useState, useMemo } from 'react';
import { 
  Scale, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign, 
  Layers, 
  Percent, 
  Sliders, 
  BarChart3, 
  FileSpreadsheet, 
  LayoutGrid, 
  HelpCircle, 
  ShieldCheck, 
  ArrowRight, 
  RefreshCw, 
  FileText,
  RotateCcw,
  Save,
  Zap,
  Info,
  Building2,
  Users
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  Legend, 
  CartesianGrid, 
  Cell 
} from 'recharts';
import { CompanyData, CalculationResult, RegimeComparisonDetail, SimplesAnexo } from '../../types';
import { formatCurrencyBRL, formatPercentBR, calculateTaxAudit, STATE_SUBLIMIT, FEDERAL_LIMIT } from '../../utils/taxRules';

interface TaxRegimeCockpitProps {
  company: CompanyData;
  calculation: CalculationResult;
  onChangeCompany: (updated: CompanyData) => void;
  onOpenReportModal?: () => void;
  onOpenDecisionModal?: () => void;
  onNavigateSubTab?: (subTab: 'comparativo' | 'simples_hibrido' | 'anexos' | 'vantagens' | 'dre' | 'impactos' | 'sublimite' | 'beneficio_icms' | 'auditoria_cpp') => void;
}

export const TaxRegimeCockpit: React.FC<TaxRegimeCockpitProps> = ({
  company,
  calculation,
  onChangeCompany,
  onOpenReportModal,
  onOpenDecisionModal,
  onNavigateSubTab,
}) => {
  // Estado de Período: Anual (12 Meses) vs Mensal
  const [timeHorizon, setTimeHorizon] = useState<'anual' | 'mensal'>('anual');
  
  // Estado de Visualização: Cards 360°, Gráficos Recharts ou Tabela Detalhada
  const [viewMode, setViewMode] = useState<'cards' | 'grafico' | 'tabela'>('cards');

  // Modo Simulador "What-If" Interativo
  const [isWhatIfOpen, setIsWhatIfOpen] = useState<boolean>(false);
  const [simRevenueDeltaPercent, setSimRevenueDeltaPercent] = useState<number>(0);
  const [simPayrollDeltaPercent, setSimPayrollDeltaPercent] = useState<number>(0);
  const [simInputCostPercent, setSimInputCostPercent] = useState<number>(company.inputCostsPercent ?? 40);
  const [simB2bPercent, setSimB2bPercent] = useState<number>(company.b2bSalesPercent ?? 50);

  // Fator de escala temporal
  const timeMultiplier = timeHorizon === 'anual' ? 1 : 1 / 12;

  // Cálculo Dinâmico do Cenário "What-If"
  const simulatedCalculation = useMemo(() => {
    if (simRevenueDeltaPercent === 0 && simPayrollDeltaPercent === 0 && 
        simInputCostPercent === (company.inputCostsPercent ?? 40) && 
        simB2bPercent === (company.b2bSalesPercent ?? 50)) {
      return calculation;
    }

    const baseRevenue = company.monthlyRevenue || (company.rbt12 ? company.rbt12 / 12 : 100000);
    const simulatedMonthlyRevenue = Math.max(0, baseRevenue * (1 + simRevenueDeltaPercent / 100));
    const simulatedRbt12 = Math.max(0, (company.rbt12 || (baseRevenue * 12)) * (1 + simRevenueDeltaPercent / 100));

    const basePayroll = company.monthlyPayroll || (company.payroll12m ? company.payroll12m / 12 : 15000);
    const simulatedMonthlyPayroll = Math.max(0, basePayroll * (1 + simPayrollDeltaPercent / 100));
    const simulatedPayroll12m = Math.max(0, (company.payroll12m || (basePayroll * 12)) * (1 + simPayrollDeltaPercent / 100));

    const simCompany: CompanyData = {
      ...company,
      monthlyRevenue: simulatedMonthlyRevenue,
      rbt12: simulatedRbt12,
      rba: simulatedRbt12,
      monthlyPayroll: simulatedMonthlyPayroll,
      payroll12m: simulatedPayroll12m,
      inputCostsPercent: simInputCostPercent,
      inputCostsMonthly: simulatedMonthlyRevenue * (simInputCostPercent / 100),
      b2bSalesPercent: simB2bPercent,
    };

    return calculateTaxAudit(simCompany);
  }, [company, calculation, simRevenueDeltaPercent, simPayrollDeltaPercent, simInputCostPercent, simB2bPercent]);

  // Ranking ordenado do menor imposto para o maior
  const sortedRegimes = useMemo(() => {
    return [...simulatedCalculation.regimesComparison].sort((a, b) => a.annualTaxTotal - b.annualTaxTotal);
  }, [simulatedCalculation.regimesComparison]);

  const bestRegime = sortedRegimes[0];
  const secondBestRegime = sortedRegimes[1] || bestRegime;
  const worstRegime = sortedRegimes[sortedRegimes.length - 1] || bestRegime;

  // Economias apuradas
  const annualSavingsVsSecond = Math.max(0, secondBestRegime.annualTaxTotal - bestRegime.annualTaxTotal);
  const annualSavingsVsWorst = Math.max(0, worstRegime.annualTaxTotal - bestRegime.annualTaxTotal);

  const displaySavingsVsSecond = annualSavingsVsSecond * timeMultiplier;
  const displaySavingsVsWorst = annualSavingsVsWorst * timeMultiplier;

  // Dados para Gráfico de Barras Recharts
  const chartData = useMemo(() => {
    return simulatedCalculation.regimesComparison.map(r => ({
      name: r.shortName,
      fullName: r.name,
      regimeKey: r.regime,
      total: timeHorizon === 'anual' ? r.annualTaxTotal : r.monthlyTaxTotal,
      irpjCsll: timeHorizon === 'anual' ? (r.taxes.irpj + r.taxes.csll) * 12 : (r.taxes.irpj + r.taxes.csll),
      pisCofins: timeHorizon === 'anual' ? (r.taxes.pis + r.taxes.cofins) * 12 : (r.taxes.pis + r.taxes.cofins),
      cpp: timeHorizon === 'anual' ? (r.taxes.cppEncargos * 12) : r.taxes.cppEncargos,
      icmsIss: timeHorizon === 'anual' ? ((r.taxes.icms + r.taxes.iss) * 12) : (r.taxes.icms + r.taxes.iss),
      effectiveRate: r.effectiveRatePercent,
      isRecommended: r.isRecommended,
    }));
  }, [simulatedCalculation.regimesComparison, timeHorizon]);

  // Aplicar alterações do What-If ao cadastro da empresa
  const handleApplyWhatIfToCompany = () => {
    const baseRevenue = company.monthlyRevenue || (company.rbt12 ? company.rbt12 / 12 : 100000);
    const updatedRevenue = Math.max(0, baseRevenue * (1 + simRevenueDeltaPercent / 100));
    const updatedRbt12 = Math.max(0, (company.rbt12 || (baseRevenue * 12)) * (1 + simRevenueDeltaPercent / 100));

    const basePayroll = company.monthlyPayroll || (company.payroll12m ? company.payroll12m / 12 : 15000);
    const updatedPayroll = Math.max(0, basePayroll * (1 + simPayrollDeltaPercent / 100));
    const updatedPayroll12m = Math.max(0, (company.payroll12m || (basePayroll * 12)) * (1 + simPayrollDeltaPercent / 100));

    onChangeCompany({
      ...company,
      monthlyRevenue: updatedRevenue,
      rbt12: updatedRbt12,
      rba: updatedRbt12,
      monthlyPayroll: updatedPayroll,
      payroll12m: updatedPayroll12m,
      inputCostsPercent: simInputCostPercent,
      inputCostsMonthly: updatedRevenue * (simInputCostPercent / 100),
      b2bSalesPercent: simB2bPercent,
    });

    // Resetar deltas
    setSimRevenueDeltaPercent(0);
    setSimPayrollDeltaPercent(0);
  };

  const handleResetWhatIf = () => {
    setSimRevenueDeltaPercent(0);
    setSimPayrollDeltaPercent(0);
    setSimInputCostPercent(company.inputCostsPercent ?? 40);
    setSimB2bPercent(company.b2bSalesPercent ?? 50);
  };

  const isSimulatedModified = simRevenueDeltaPercent !== 0 || simPayrollDeltaPercent !== 0 || 
    simInputCostPercent !== (company.inputCostsPercent ?? 40) || 
    simB2bPercent !== (company.b2bSalesPercent ?? 50);

  return (
    <div className="space-y-6">
      
      {/* 1. COCKPIT EXECUTIVO SUPERIOR: VEREDITO & CONTROLES GERAIS */}
      <div className="bg-[#0F172A] rounded-2xl border border-slate-800 p-5 lg:p-6 shadow-xs relative overflow-hidden">
        
        {/* Glow de fundo indicando regime vencedor */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-start space-x-3.5">
            <div className="p-3 bg-linear-to-br from-amber-500/20 to-blue-500/20 border border-amber-500/30 rounded-2xl text-amber-400 shrink-0 mt-0.5 shadow-xs">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-950/80 text-blue-300 font-bold border border-blue-800/80">
                  Parecer Tributário 360°
                </span>
                <span className="text-xs text-slate-400 font-mono flex items-center space-x-1">
                  <span>Score de Precisão:</span>
                  <strong className="text-emerald-400 font-bold">{bestRegime.recommendationScore}/100</strong>
                </span>
                {isSimulatedModified && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800 animate-pulse font-bold">
                    Simulação Ativa (What-If)
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-100 mt-1 flex flex-wrap items-center gap-2">
                <span>Regime Mais Econômico:</span>
                <span className="text-emerald-400 underline decoration-emerald-500/40 decoration-2 underline-offset-4">
                  {bestRegime.name}
                </span>
              </h2>

              <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                {bestRegime.recommendationReason || simulatedCalculation.bestRegime.recommendationReason}
              </p>
            </div>
          </div>

          {/* Switchers e Ações no Topo */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start lg:self-center">
            
            {/* Switcher Anual vs Mensal */}
            <div className="bg-[#0B0F19] p-1 rounded-xl border border-slate-800 flex items-center">
              <button
                type="button"
                onClick={() => setTimeHorizon('anual')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  timeHorizon === 'anual'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Visão Anual
              </button>
              <button
                type="button"
                onClick={() => setTimeHorizon('mensal')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  timeHorizon === 'mensal'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Visão Mensal
              </button>
            </div>

            {/* Botão Simulador What-If */}
            <button
              type="button"
              onClick={() => setIsWhatIfOpen(!isWhatIfOpen)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 border transition cursor-pointer ${
                isWhatIfOpen || isSimulatedModified
                  ? 'bg-amber-600/20 text-amber-300 border-amber-500/60 shadow-xs'
                  : 'bg-[#0B0F19] hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulador What-If</span>
              {isSimulatedModified && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </button>

            {/* Botão Relatório Executivo */}
            {onOpenReportModal && (
              <button
                type="button"
                onClick={onOpenReportModal}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Gerar Parecer</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Indicadores Rápidos do Cockpit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5">
          
          {/* Card 1: Carga Tributária no Melhor Regime */}
          <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Carga {timeHorizon === 'anual' ? 'Anual' : 'Mensal'} no Vencedor
            </span>
            <div className="mt-1">
              <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400 block">
                {formatCurrencyBRL(timeHorizon === 'anual' ? bestRegime.annualTaxTotal : bestRegime.monthlyTaxTotal)}
              </span>
              <span className="text-xs text-slate-400 font-mono mt-0.5 block">
                Alíquota Efetiva: <strong className="text-slate-200">{formatPercentBR(bestRegime.effectiveRatePercent)}</strong>
              </span>
            </div>
          </div>

          {/* Card 2: Economia vs 2º Colocado */}
          <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Economia vs 2º Melhor Regime
            </span>
            <div className="mt-1">
              <span className="text-xl sm:text-2xl font-black font-mono text-blue-400 block">
                {displaySavingsVsSecond > 0 ? `+${formatCurrencyBRL(displaySavingsVsSecond)}` : 'R$ 0,00'}
              </span>
              <span className="text-xs text-slate-400 font-mono mt-0.5 block">
                Em relação a: <strong className="text-slate-300">{secondBestRegime.shortName}</strong>
              </span>
            </div>
          </div>

          {/* Card 3: Economia Máxima vs Pior Cenário */}
          <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Economia vs Pior Opção ({worstRegime.shortName})
            </span>
            <div className="mt-1">
              <span className="text-xl sm:text-2xl font-black font-mono text-amber-400 block">
                {displaySavingsVsWorst > 0 ? `+${formatCurrencyBRL(displaySavingsVsWorst)}` : 'R$ 0,00'}
              </span>
              <span className="text-xs text-slate-400 font-mono mt-0.5 block">
                Evita desperdício tributário de até <strong className="text-amber-300">{formatPercentBR(worstRegime.effectiveRatePercent - bestRegime.effectiveRatePercent)}</strong>
              </span>
            </div>
          </div>

          {/* Card 4: Fator R & Sublimite Status */}
          <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Fator R & Teto Estadual
            </span>
            <div className="mt-1 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Fator R Atual:</span>
                <span className={`font-mono font-bold ${
                  (simulatedCalculation.fatorR || 0) >= 28 ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {formatPercentBR(simulatedCalculation.fatorR || 0)} ({(simulatedCalculation.fatorR || 0) >= 28 ? 'Anexo III' : 'Anexo V'})
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Sublimite R$ 3,6M:</span>
                <span className={`font-mono font-bold ${
                  simulatedCalculation.exceedsSublimit ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {simulatedCalculation.exceedsSublimit ? 'Excedido' : 'Regular'}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal/Accordion de Explicação de Decisão */}
        {onOpenDecisionModal && (
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onOpenDecisionModal}
              className="text-xs text-slate-400 hover:text-blue-400 flex items-center space-x-1.5 font-medium transition cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Por que o regime recomendado pode diferir do maior Lucro Líquido contábil? Clique para ver a memória pericial</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </button>
          </div>
        )}

      </div>

      {/* 2. PAINEL DE SIMULAÇÃO "WHAT-IF" DINÂMICO (QUANDO ABERTO) */}
      {isWhatIfOpen && (
        <div className="bg-[#0F172A] p-5 rounded-2xl border border-amber-500/40 shadow-xs space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-amber-950/60 rounded-xl text-amber-400 border border-amber-800/60">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                  Simulador de Sensibilidade "What-If" (Em Tempo Real)
                </h3>
                <p className="text-xs text-slate-400">
                  Teste variações de faturamento, folha, insumos e vendas B2B para prever o ponto de virada de regime
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleResetWhatIf}
                disabled={!isSimulatedModified}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 border transition cursor-pointer ${
                  isSimulatedModified 
                    ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700' 
                    : 'opacity-40 cursor-not-allowed bg-slate-900 text-slate-500 border-slate-800'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Padrão</span>
              </button>

              <button
                type="button"
                onClick={handleApplyWhatIfToCompany}
                disabled={!isSimulatedModified}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 shadow-xs transition cursor-pointer ${
                  isSimulatedModified
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500'
                }`}
              >
                <Save className="w-3.5 h-3.5" />
                <span>Gravar Dados na Empresa</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Slider 1: Variação de Faturamento */}
            <div className="bg-[#0B0F19] p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-300">Variação de Receita</span>
                <span className={`font-mono font-bold ${
                  simRevenueDeltaPercent > 0 ? 'text-emerald-400' : simRevenueDeltaPercent < 0 ? 'text-rose-400' : 'text-slate-400'
                }`}>
                  {simRevenueDeltaPercent > 0 ? `+${simRevenueDeltaPercent}%` : `${simRevenueDeltaPercent}%`}
                </span>
              </div>
              <input
                type="range"
                min="-50"
                max="100"
                step="5"
                value={simRevenueDeltaPercent}
                onChange={(e) => setSimRevenueDeltaPercent(parseInt(e.target.value))}
                className="w-full accent-blue-500 mt-2"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>-50%</span>
                <span>Base ({formatCurrencyBRL(company.monthlyRevenue || 0)})</span>
                <span>+100%</span>
              </div>
            </div>

            {/* Slider 2: Variação de Folha */}
            <div className="bg-[#0B0F19] p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-300">Variação da Folha</span>
                <span className={`font-mono font-bold ${
                  simPayrollDeltaPercent > 0 ? 'text-emerald-400' : simPayrollDeltaPercent < 0 ? 'text-rose-400' : 'text-slate-400'
                }`}>
                  {simPayrollDeltaPercent > 0 ? `+${simPayrollDeltaPercent}%` : `${simPayrollDeltaPercent}%`}
                </span>
              </div>
              <input
                type="range"
                min="-50"
                max="100"
                step="5"
                value={simPayrollDeltaPercent}
                onChange={(e) => setSimPayrollDeltaPercent(parseInt(e.target.value))}
                className="w-full accent-purple-500 mt-2"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>-50%</span>
                <span>Base ({formatCurrencyBRL(company.monthlyPayroll || 0)})</span>
                <span>+100%</span>
              </div>
            </div>

            {/* Slider 3: Insumos / CMV % */}
            <div className="bg-[#0B0F19] p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-300">Compras / Insumos (%)</span>
                <span className="font-mono font-bold text-blue-400">{simInputCostPercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                step="5"
                value={simInputCostPercent}
                onChange={(e) => setSimInputCostPercent(parseInt(e.target.value))}
                className="w-full accent-blue-500 mt-2"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>0% (Serviços)</span>
                <span>40% (Média)</span>
                <span>80% (Comércio)</span>
              </div>
            </div>

            {/* Slider 4: Vendas B2B % */}
            <div className="bg-[#0B0F19] p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-300">Vendas para PJ (B2B)</span>
                <span className="font-mono font-bold text-emerald-400">{simB2bPercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={simB2bPercent}
                onChange={(e) => setSimB2bPercent(parseInt(e.target.value))}
                className="w-full accent-emerald-500 mt-2"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>0% (Varejo B2C)</span>
                <span>50%</span>
                <span>100% (Indústria PJ)</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* BANNER CTA: NOVO SIMULADOR SIMPLES HÍBRIDO DA REFORMA TRIBUTÁRIA */}
      <div className="bg-gradient-to-r from-indigo-950/70 via-slate-900 to-indigo-950/70 border border-indigo-500/40 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-start sm:items-center space-x-3.5">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 shrink-0">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white">
                Simulador Simples Nacional Tradicional x Simples Híbrido
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/40">
                EC 132/23
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
              Simule a segregação do DAS Reduzido (IRPJ, CSLL e CPP) vs. recolhimento não-cumulativo do IBS/CBS por fora nos 5 anexos, com análise de impacto financeiro e retenção B2B.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigateSubTab?.('simples_hibrido')}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-md shrink-0 cursor-pointer self-start md:self-auto"
        >
          <span>Abrir Simulador Híbrido</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 3. SELETOR DE MODO DE VISUALIZAÇÃO DO COMPARATIVO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0F172A] p-3.5 rounded-xl border border-slate-800">
        <div className="flex items-center space-x-2">
          <Scale className="w-5 h-5 text-blue-400" />
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-100">
            Comparativo Pericial dos 4 Regimes Tributários
          </h3>
        </div>

        {/* Botoes de Modo: Cards 360° | Graficos Recharts | Tabela Pericial */}
        <div className="flex items-center space-x-1.5 bg-[#0B0F19] p-1 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Cards 360°</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('grafico')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer ${
              viewMode === 'grafico'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Gráficos</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('tabela')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer ${
              viewMode === 'tabela'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Tabela Analítica</span>
          </button>
        </div>
      </div>

      {/* MODO 1: CARDS 360° */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sortedRegimes.map((item, idx) => {
            const isWinner = item.regime === bestRegime.regime;
            const taxTotal = timeHorizon === 'anual' ? item.annualTaxTotal : item.monthlyTaxTotal;
            const diffVsBest = taxTotal - (timeHorizon === 'anual' ? bestRegime.annualTaxTotal : bestRegime.monthlyTaxTotal);

            return (
              <div 
                key={item.regime}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden ${
                  isWinner 
                    ? 'bg-linear-to-b from-[#0F172A] to-emerald-950/20 border-emerald-500/80 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-950/20' 
                    : 'bg-[#0F172A] border-slate-800 hover:border-slate-700 shadow-xs'
                }`}
              >
                {/* Ribbon Vencedor */}
                {isWinner && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-emerald-600 text-white text-[9px] font-mono font-black uppercase px-3 py-1 rounded-bl-xl shadow-xs flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Mais Econômico</span>
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 font-bold border border-slate-800 text-slate-400">
                      #{idx + 1}
                    </span>
                    <h4 className="text-sm font-black text-slate-100 font-sans">
                      {item.name}
                    </h4>
                  </div>
                  
                  <p className="text-[11px] text-slate-400 line-clamp-2 min-h-[32px]">
                    {item.description}
                  </p>

                  {/* Valor Principal em Destaque */}
                  <div className="mt-4 p-3 bg-[#0B0F19] rounded-xl border border-slate-800/80">
                    <span className="text-[10px] uppercase font-mono text-slate-400 block">
                      Total {timeHorizon === 'anual' ? 'Anual' : 'Mensal'} Estimado
                    </span>
                    <span className={`text-xl font-black font-mono block mt-0.5 ${
                      isWinner ? 'text-emerald-400' : 'text-slate-100'
                    }`}>
                      {formatCurrencyBRL(taxTotal)}
                    </span>
                    <div className="flex items-center justify-between text-[11px] font-mono mt-1 pt-1 border-t border-slate-800">
                      <span className="text-slate-400">Alíquota Efetiva:</span>
                      <strong className={isWinner ? 'text-emerald-400' : 'text-blue-400'}>
                        {formatPercentBR(item.effectiveRatePercent)}
                      </strong>
                    </div>
                  </div>

                  {/* Decomposição Tributária Mini */}
                  <div className="space-y-1.5 py-3 border-y border-slate-800/80 text-[11px] font-mono text-slate-300 mt-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">IRPJ / CSLL:</span>
                      <span>{formatCurrencyBRL((item.taxes.irpj + item.taxes.csll) * (timeHorizon === 'anual' ? 12 : 1))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">PIS / COFINS:</span>
                      <span>{formatCurrencyBRL((item.taxes.pis + item.taxes.cofins) * (timeHorizon === 'anual' ? 12 : 1))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">CPP Patronal / Folha:</span>
                      <span className={item.taxes.cppEncargos === 0 ? 'text-emerald-400 font-bold' : ''}>
                        {item.taxes.cppEncargos === 0 ? 'Incluso no DAS' : formatCurrencyBRL(item.taxes.cppEncargos * (timeHorizon === 'anual' ? 12 : 1))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">ICMS / ISS:</span>
                      <span>{formatCurrencyBRL((item.taxes.icms + item.taxes.iss) * (timeHorizon === 'anual' ? 12 : 1))}</span>
                    </div>
                    {item.taxes.ibsCbs !== undefined && item.taxes.ibsCbs > 0 && (
                      <div className="flex justify-between text-blue-400 font-bold">
                        <span>IBS + CBS (Reforma):</span>
                        <span>{formatCurrencyBRL(item.taxes.ibsCbs * (timeHorizon === 'anual' ? 12 : 1))}</span>
                      </div>
                    )}
                  </div>

                  {/* Informações Estratégicas: Crédito B2B & Complexidade */}
                  <div className="mt-3 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Crédito B2B Repassado:</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        item.b2bCreditRatePercent >= 20 
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800' 
                          : 'bg-amber-950/80 text-amber-300 border border-amber-800'
                      }`}>
                        {formatPercentBR(item.b2bCreditRatePercent)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Complexidade Acessória:</span>
                      <span className="text-slate-300 capitalize font-medium">
                        {item.complianceComplexity.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer do Card com Comparativo vs Campeão */}
                <div className="mt-4 pt-3 border-t border-slate-800">
                  {isWinner ? (
                    <div className="text-center p-2 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs font-bold">
                      ✓ Melhor Escolha Tributária
                    </div>
                  ) : (
                    <div className="text-center p-2 rounded-lg bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs font-mono font-bold">
                      +{formatCurrencyBRL(diffVsBest)} {timeHorizon === 'anual' ? '/ano' : '/mês'}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* MODO 2: GRÁFICOS RECHARTS */}
      {viewMode === 'grafico' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Gráfico 1: Comparativo de Carga Total */}
          <div className="bg-[#0F172A] p-5 rounded-2xl border border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span>Carga Tributária Total ({timeHorizon === 'anual' ? 'Anual' : 'Mensal'})</span>
              </h4>
              <span className="text-[11px] text-slate-400 font-mono">Valores em R$</span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={11}
                    tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`} 
                  />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                    formatter={(value: any) => [formatCurrencyBRL(Number(value) || 0), 'Imposto']}
                    labelFormatter={(label) => `Regime: ${label}`}
                  />
                  <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.isRecommended ? '#10b981' : '#3b82f6'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex items-center justify-center space-x-6 text-xs font-mono pt-2 border-t border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded bg-emerald-500" />
                <span className="text-slate-300">Recomendado (Menor Custo)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded bg-blue-500" />
                <span className="text-slate-400">Demais Regimes</span>
              </div>
            </div>
          </div>

          {/* Gráfico 2: Decomposição por Grupo de Tributos */}
          <div className="bg-[#0F172A] p-5 rounded-2xl border border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center space-x-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>Decomposição Tributária por Categoria</span>
              </h4>
              <span className="text-[11px] text-slate-400 font-mono">Empilhamento</span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={11}
                    tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`} 
                  />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                    formatter={(value: any) => [formatCurrencyBRL(Number(value) || 0)]}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  />
                  <Bar dataKey="irpjCsll" name="IRPJ/CSLL" stackId="a" fill="#6366f1" />
                  <Bar dataKey="pisCofins" name="PIS/COFINS" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="cpp" name="CPP Patronal" stackId="a" fill="#ec4899" />
                  <Bar dataKey="icmsIss" name="ICMS/ISS" stackId="a" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="text-[11px] text-slate-400 text-center pt-2 border-t border-slate-800">
              Permite identificar com clareza a origem dos custos tributários em cada enquadramento.
            </div>
          </div>

        </div>
      )}

      {/* MODO 3: TABELA ANALÍTICA */}
      {viewMode === 'tabela' && (
        <div className="bg-[#0F172A] rounded-2xl border border-slate-800 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0B0F19]">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-100 flex items-center space-x-2">
              <FileSpreadsheet className="w-4 h-4 text-blue-400" />
              <span>Matriz Detalhada Tributo a Tributo</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Valores expressos na base {timeHorizon === 'anual' ? 'ANUAL (12 meses)' : 'MENSAL'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Regime</th>
                  <th className="py-3 px-3 text-right">IRPJ</th>
                  <th className="py-3 px-3 text-right">CSLL</th>
                  <th className="py-3 px-3 text-right">PIS/COFINS</th>
                  <th className="py-3 px-3 text-right">CPP Folha</th>
                  <th className="py-3 px-3 text-right">ICMS/ISS</th>
                  <th className="py-3 px-3 text-right">Total {timeHorizon === 'anual' ? 'Anual' : 'Mensal'}</th>
                  <th className="py-3 px-3 text-right">Alíq. Efetiva</th>
                  <th className="py-3 px-3 text-center">Crédito B2B</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sortedRegimes.map((item) => {
                  const isWinner = item.regime === bestRegime.regime;
                  const mul = timeHorizon === 'anual' ? 12 : 1;

                  return (
                    <tr 
                      key={item.regime}
                      className={`transition ${
                        isWinner ? 'bg-emerald-950/20 hover:bg-emerald-950/30' : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          {isWinner && (
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                          )}
                          <div>
                            <span className="font-bold text-slate-100 font-sans text-xs block">
                              {item.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-sans">
                              {item.complianceComplexity.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-right text-slate-300">
                        {formatCurrencyBRL(item.taxes.irpj * mul)}
                      </td>
                      <td className="py-3.5 px-3 text-right text-slate-300">
                        {formatCurrencyBRL(item.taxes.csll * mul)}
                      </td>
                      <td className="py-3.5 px-3 text-right text-slate-300">
                        {formatCurrencyBRL((item.taxes.pis + item.taxes.cofins) * mul)}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        {item.taxes.cppEncargos === 0 ? (
                          <span className="text-emerald-400 text-[10px] font-bold">Incluso no DAS</span>
                        ) : (
                          <span className="text-slate-300">{formatCurrencyBRL(item.taxes.cppEncargos * mul)}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right text-slate-300">
                        {formatCurrencyBRL((item.taxes.icms + item.taxes.iss) * mul)}
                      </td>
                      <td className={`py-3.5 px-3 text-right font-black text-sm ${
                        isWinner ? 'text-emerald-400' : 'text-slate-100'
                      }`}>
                        {formatCurrencyBRL(timeHorizon === 'anual' ? item.annualTaxTotal : item.monthlyTaxTotal)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-blue-400">
                        {formatPercentBR(item.effectiveRatePercent)}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.b2bCreditRatePercent >= 20 
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800' 
                            : 'bg-amber-950/80 text-amber-300 border border-amber-800'
                        }`}>
                          {formatPercentBR(item.b2bCreditRatePercent)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isWinner ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-bold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Vencedor</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px] font-mono">
                            Score: {item.recommendationScore}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. ATALHOS RÁPIDOS PARA AS DEMAIS ABAS DO PLANEJAMENTO */}
      {onNavigateSubTab && (
        <div className="bg-[#0F172A] p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-slate-300">
            <Info className="w-4 h-4 text-blue-400" />
            <span>Explore as análises periciais complementares deste planejamento:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigateSubTab('auditoria_cpp')}
              className="px-2.5 py-1.5 bg-[#0B0F19] hover:bg-slate-800 text-indigo-300 border border-indigo-900/60 rounded-lg font-semibold transition cursor-pointer"
            >
              Auditoria CPP Folha
            </button>
            <button
              type="button"
              onClick={() => onNavigateSubTab('sublimite')}
              className="px-2.5 py-1.5 bg-[#0B0F19] hover:bg-slate-800 text-amber-300 border border-amber-900/60 rounded-lg font-semibold transition cursor-pointer"
            >
              Sublimite R$ 3,6M
            </button>
            <button
              type="button"
              onClick={() => onNavigateSubTab('dre')}
              className="px-2.5 py-1.5 bg-[#0B0F19] hover:bg-slate-800 text-blue-300 border border-blue-900/60 rounded-lg font-semibold transition cursor-pointer"
            >
              DRE Comparativa
            </button>
            <button
              type="button"
              onClick={() => onNavigateSubTab('beneficio_icms')}
              className="px-2.5 py-1.5 bg-[#0B0F19] hover:bg-slate-800 text-emerald-300 border border-emerald-900/60 rounded-lg font-semibold transition cursor-pointer"
            >
              Benefício ICMS PR/SC
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
