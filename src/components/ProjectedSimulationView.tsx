import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Scale, 
  Printer, 
  Sparkles, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Layers, 
  BarChart3,
  Percent,
  Compass,
  ArrowRight,
  ShieldCheck,
  Building2,
  Sliders,
  Download,
  Play
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid, 
  LineChart, 
  Line,
  AreaChart,
  Area
} from 'recharts';
import { CompanyData, CalculationResult, SimplesAnexo } from '../types';
import { 
  formatCurrencyBRL, 
  formatPercentBR, 
  calculateAnexoEffectiveRate, 
  FEDERAL_LIMIT, 
  STATE_SUBLIMIT 
} from '../utils/taxRules';
import { ReportViewerModal } from './ReportViewerModal';
import { ModuleTutorialModal } from './ModuleTutorialModal';
import { BrandLogo } from './BrandLogo';

interface ProjectedSimulationViewProps {
  company: CompanyData;
  calculation: CalculationResult;
  onChangeCompany: (updated: CompanyData) => void;
  onNavigateToTab?: (tab: 'dashboard' | 'regimes' | 'projecao' | 'historico' | 'cfop' | 'socios' | 'fator_r' | 'reforma' | 'parecer') => void;
}

interface MonthlyProjectionRow {
  monthIndex: number;
  monthName: string;
  calendarMonth: string;
  projectedRevenue: number;
  projectedExportRevenue: number;
  projectedTotalRevenue: number;
  rollingRbt12: number;
  anexo: SimplesAnexo;
  bracketNum: number;
  nominalRate: number;
  deduction: number;
  effectiveRate: number;
  simplesTaxDue: number;
  presumedTaxDue: number;
  realTaxDue: number;
  bestRegimeMonth: 'simples' | 'presumido' | 'real';
  savingsMonthVsSimples: number;
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const ProjectedSimulationView: React.FC<ProjectedSimulationViewProps> = ({
  company,
  calculation,
  onChangeCompany,
  onNavigateToTab,
}) => {
  const currentMonthNum = new Date().getMonth(); // 0 a 11
  const currentYear = new Date().getFullYear();

  // Parâmetros da Projeção
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);
  const [startMonthIndex, setStartMonthIndex] = useState<number>(currentMonthNum);
  const [annualGrowthRate, setAnnualGrowthRate] = useState<number>(company.projectionGrowthPercent || 10);
  const [overrideMonthlyRevenue, setOverrideMonthlyRevenue] = useState<number>(company.monthlyRevenue || (company.rbt12 ? company.rbt12 / 12 : 100000));
  const [seasonalityTrend, setSeasonalityTrend] = useState<'linear' | 'growing' | 'q4_boost'>('growing');

  // Construção mês a mês até o final do ano-calendário (Dezembro)
  const projectionMonths: MonthlyProjectionRow[] = useMemo(() => {
    const rows: MonthlyProjectionRow[] = [];
    const baseRev = overrideMonthlyRevenue || 1;
    const baseExport = company.exportMonthlyRevenue || 0;
    const currentRbt12 = company.rbt12 || (baseRev * 12);
    const effectiveAnexo = company.anexo || 'III';

    // Relações médias de Lucro Presumido e Lucro Real para comparação mensal proporcional
    const presumedAnnual = calculation.regimesComparison?.find(r => r.regime === 'lucro_presumido')?.annualTaxTotal || (currentRbt12 * 0.1333);
    const realAnnual = calculation.regimesComparison?.find(r => r.regime === 'lucro_real')?.annualTaxTotal || (currentRbt12 * 0.15);
    const presumedRateEffective = currentRbt12 > 0 ? (presumedAnnual / currentRbt12) : 0.1333;
    const realRateEffective = currentRbt12 > 0 ? (realAnnual / currentRbt12) : 0.15;

    // Fator R
    const isFatorR = company.subjectToFatorR || effectiveAnexo === 'V' || company.anexoRevenues?.some(a => a.active && a.subjectToFatorR);
    const payrollMonthly = company.monthlyPayroll || (company.payroll12m ? company.payroll12m / 12 : baseRev * 0.28);

    let rollingRbt12Accumulator = currentRbt12;
    const monthsRemaining = 12 - startMonthIndex;

    for (let i = startMonthIndex; i < 12; i++) {
      const stepIndex = i - startMonthIndex;
      
      // Cálculo do multiplicador de sazonalidade e crescimento
      let factor = 1;
      if (seasonalityTrend === 'growing') {
        factor = 1 + ((annualGrowthRate / 100) * (stepIndex / 12));
      } else if (seasonalityTrend === 'q4_boost') {
        const isQ4 = i >= 9; // Out, Nov, Dez
        factor = 1 + ((annualGrowthRate / 100) * (stepIndex / 12)) * (isQ4 ? 1.35 : 0.95);
      } else {
        factor = 1; // Linear constante
      }

      const projectedRev = Math.round(baseRev * factor * 100) / 100;
      const projectedExport = Math.round(baseExport * factor * 100) / 100;
      const totalRev = projectedRev + projectedExport;

      // Atualiza o RBT12 móvel dos últimos 12 meses
      // Substitui 1/12 da base passada pelo novo faturamento projetado
      const oldMonthEstimated = currentRbt12 / 12;
      rollingRbt12Accumulator = Math.max(0, rollingRbt12Accumulator - oldMonthEstimated + totalRev);

      // Determinação do Anexo com base no Fator R
      let anexoUsed = effectiveAnexo;
      if (isFatorR) {
        const rollingPayroll12 = payrollMonthly * 12;
        const fatorRVal = rollingRbt12Accumulator > 0 ? (rollingPayroll12 / rollingRbt12Accumulator) : 0;
        if (fatorRVal >= 0.28) {
          anexoUsed = 'III';
        } else {
          anexoUsed = 'V';
        }
      }

      // Alíquota efetiva do Simples pelo RBT12 móvel
      const anexoCalc = calculateAnexoEffectiveRate(anexoUsed, rollingRbt12Accumulator);
      const effectiveRate = anexoCalc.effectiveRate;
      const bracketLimit = anexoCalc.bracket.limit;
      const bracketNum = bracketLimit <= 180000 ? 1 :
        bracketLimit <= 360000 ? 2 :
        bracketLimit <= 720000 ? 3 :
        bracketLimit <= 1800000 ? 4 :
        bracketLimit <= 3600000 ? 5 : 6;

      const simplesTaxDue = Math.round(totalRev * effectiveRate * 100) / 100;
      const presumedTaxDue = Math.round(totalRev * presumedRateEffective * 100) / 100;
      const realTaxDue = Math.round(totalRev * realRateEffective * 100) / 100;

      // Melhor regime do mês
      let bestRegimeMonth: 'simples' | 'presumido' | 'real' = 'simples';
      let lowestTax = simplesTaxDue;

      if (presumedTaxDue < lowestTax) {
        lowestTax = presumedTaxDue;
        bestRegimeMonth = 'presumido';
      }
      if (realTaxDue < lowestTax) {
        lowestTax = realTaxDue;
        bestRegimeMonth = 'real';
      }

      const savingsMonthVsSimples = Math.round((simplesTaxDue - lowestTax) * 100) / 100;

      rows.push({
        monthIndex: i,
        monthName: MONTH_NAMES[i],
        calendarMonth: `${MONTH_NAMES[i].slice(0, 3)}/${currentYear}`,
        projectedRevenue: projectedRev,
        projectedExportRevenue: projectedExport,
        projectedTotalRevenue: totalRev,
        rollingRbt12: Math.round(rollingRbt12Accumulator),
        anexo: anexoUsed,
        bracketNum,
        nominalRate: anexoCalc.bracket.nominalRate,
        deduction: anexoCalc.bracket.deduction,
        effectiveRate,
        simplesTaxDue,
        presumedTaxDue,
        realTaxDue,
        bestRegimeMonth,
        savingsMonthVsSimples,
      });
    }

    return rows;
  }, [
    startMonthIndex, 
    annualGrowthRate, 
    overrideMonthlyRevenue, 
    seasonalityTrend, 
    company, 
    calculation, 
    currentYear
  ]);

  // Totais consolidados do período projetado
  const projectionTotals = useMemo(() => {
    let totalRevenue = 0;
    let totalSimples = 0;
    let totalPresumed = 0;
    let totalReal = 0;
    let totalSavingsVsSimples = 0;

    projectionMonths.forEach(m => {
      totalRevenue += m.projectedTotalRevenue;
      totalSimples += m.simplesTaxDue;
      totalPresumed += m.presumedTaxDue;
      totalReal += m.realTaxDue;
      if (m.savingsMonthVsSimples > 0) {
        totalSavingsVsSimples += m.savingsMonthVsSimples;
      }
    });

    const averageMonthlyRevenue = projectionMonths.length > 0 ? totalRevenue / projectionMonths.length : 0;
    const finalProjectedRbt12 = projectionMonths.length > 0 ? projectionMonths[projectionMonths.length - 1].rollingRbt12 : company.rbt12;
    const finalBracket = projectionMonths.length > 0 ? projectionMonths[projectionMonths.length - 1].bracketNum : 1;

    let overallBestRegime: 'simples' | 'presumido' | 'real' = 'simples';
    let lowestTaxTotal = totalSimples;
    if (totalPresumed < lowestTaxTotal) {
      lowestTaxTotal = totalPresumed;
      overallBestRegime = 'presumido';
    }
    if (totalReal < lowestTaxTotal) {
      lowestTaxTotal = totalReal;
      overallBestRegime = 'real';
    }

    const maxPeriodSavings = Math.max(0, totalSimples - lowestTaxTotal);

    return {
      totalRevenue,
      totalSimples,
      totalPresumed,
      totalReal,
      averageMonthlyRevenue,
      finalProjectedRbt12,
      finalBracket,
      overallBestRegime,
      maxPeriodSavings,
      monthsCount: projectionMonths.length,
    };
  }, [projectionMonths, company.rbt12]);

  // Dados para o gráfico Recharts
  const chartData = useMemo(() => {
    return projectionMonths.map(m => ({
      name: m.calendarMonth,
      Receita: m.projectedTotalRevenue,
      Simples: m.simplesTaxDue,
      Presumido: m.presumedTaxDue,
      Real: m.realTaxDue,
      AlíquotaSimples: parseFloat((m.effectiveRate * 100).toFixed(2)),
    }));
  }, [projectionMonths]);

  // Linhas formatadas para o modal de emissão e exportação oficial do relatório
  const modalProjectionRows = useMemo(() => {
    return projectionMonths.map(m => ({
      monthName: m.calendarMonth,
      monthIndex: m.monthIndex,
      monthlyRevenue: m.projectedTotalRevenue,
      rbt12: m.rollingRbt12,
      simplesEffectiveRate: m.effectiveRate * 100,
      simplesBracket: m.bracketNum,
      simplesTaxMonthly: m.simplesTaxDue,
      lucroPresumidoTaxMonthly: m.presumedTaxDue,
      lucroRealTaxMonthly: m.realTaxDue,
      bestRegime: m.bestRegimeMonth === 'simples' ? 'Simples Nacional' : m.bestRegimeMonth === 'presumido' ? 'Lucro Presumido' : 'Lucro Real',
      monthlySavings: m.savingsMonthVsSimples,
    }));
  }, [projectionMonths]);

  return (
    <div className="space-y-6 text-slate-200">

      {/* Top Banner da Projeção */}
      <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <BrandLogo variant="badge" />
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30 shrink-0 mt-0.5">
              <TrendingUp className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                  Planejamento Previsional
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Ano-Calendário {currentYear} • {projectionTotals.monthsCount} Meses Projetados
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-white mt-1.5 flex items-center space-x-2">
                <span>Simulação Projetada Mês a Mês</span>
                <span className="text-slate-400 font-normal text-sm">({company.name})</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                Acompanhe a curva de evolução da receita bruta, a progressão das faixas da LC 123/2006 e a comparação tributária direta entre Simples Nacional, Lucro Presumido e Lucro Real até o fechamento do exercício fiscal.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => setIsTutorialOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/70 text-indigo-300 border border-indigo-800/70 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Play className="w-3.5 h-3.5 text-indigo-400" />
              <span>Como Funciona</span>
            </button>

            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-md transition cursor-pointer"
              title="Gerar e Visualizar Relatório Oficial com opções de impressão e PDF"
            >
              <FileText className="w-4 h-4" />
              <span>Gerar Relatório / Parecer PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Painel de Parâmetros da Simulação */}
      <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Parâmetros da Curva de Projeção
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            RBT12 Inicial: {formatCurrencyBRL(company.rbt12)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Mês Inicial da Projeção */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1.5">
              Mês Inicial da Projeção
            </label>
            <select
              value={startMonthIndex}
              onChange={(e) => setStartMonthIndex(parseInt(e.target.value))}
              className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={name} value={idx}>
                  {name} ({12 - idx} meses até o fim do ano)
                </option>
              ))}
            </select>
          </div>

          {/* Faturamento Base Mensal */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1.5">
              Receita Mensal de Referência (R$)
            </label>
            <input
              type="number"
              value={overrideMonthlyRevenue}
              onChange={(e) => setOverrideMonthlyRevenue(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Taxa de Crescimento Anual Estimada */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1.5">
              Crescimento Projetado (%)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={annualGrowthRate}
                onChange={(e) => setAnnualGrowthRate(parseFloat(e.target.value) || 0)}
                className="w-20 bg-[#0B0F19] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-blue-500"
              />
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={annualGrowthRate}
                onChange={(e) => setAnnualGrowthRate(parseFloat(e.target.value))}
                className="flex-1 accent-blue-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Tendência de Sazonalidade */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1.5">
              Modelo Sazonal
            </label>
            <select
              value={seasonalityTrend}
              onChange={(e) => setSeasonalityTrend(e.target.value as any)}
              className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="growing">Crescimento Gradual Contínuo</option>
              <option value="q4_boost">Pico Sazonal de Fim de Ano (Q4 Boost)</option>
              <option value="linear">Linear Estável (Sem Variação)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cards de Resumo Executivo da Projeção */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 shadow-md">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">
            Receita Bruta Total Projetada
          </span>
          <strong className="text-xl font-mono text-white mt-1 block">
            {formatCurrencyBRL(projectionTotals.totalRevenue)}
          </strong>
          <span className="text-[11px] text-slate-400 font-sans mt-0.5 block">
            Média de {formatCurrencyBRL(projectionTotals.averageMonthlyRevenue)}/mês
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 shadow-md">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">
            RBT12 Estimado no Final do Ano
          </span>
          <strong className="text-xl font-mono text-blue-400 mt-1 block">
            {formatCurrencyBRL(projectionTotals.finalProjectedRbt12)}
          </strong>
          <span className="text-[11px] text-slate-400 font-sans mt-0.5 block">
            Faixa Final Estimada: <strong className="text-slate-200">Faixa {projectionTotals.finalBracket} de 6</strong>
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 shadow-md">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">
            Impostos Totais no Simples
          </span>
          <strong className="text-xl font-mono text-amber-400 mt-1 block">
            {formatCurrencyBRL(projectionTotals.totalSimples)}
          </strong>
          <span className="text-[11px] text-slate-400 font-sans mt-0.5 block">
            Alíquota Média: {formatPercentBR(projectionTotals.totalRevenue > 0 ? (projectionTotals.totalSimples / projectionTotals.totalRevenue) * 100 : 0)}
          </span>
        </div>

        <div className={`p-4 rounded-xl border shadow-md ${
          projectionTotals.overallBestRegime === 'simples'
            ? 'bg-emerald-950/40 border-emerald-800/80'
            : 'bg-blue-950/40 border-blue-800/80'
        }`}>
          <span className="text-[10px] uppercase font-mono text-slate-400 block">
            Regime Previsional Mais Econômico
          </span>
          <strong className="text-xl font-mono text-emerald-400 mt-1 block capitalize">
            {projectionTotals.overallBestRegime === 'simples' ? 'Simples Nacional' : projectionTotals.overallBestRegime === 'presumido' ? 'Lucro Presumido' : 'Lucro Real'}
          </strong>
          <span className="text-[11px] text-emerald-300 font-sans mt-0.5 block font-medium">
            Economia Projetada: {formatCurrencyBRL(projectionTotals.maxPeriodSavings)}
          </span>
        </div>
      </div>

      {/* Gráfico de Evolução Comparativa dos Regimes */}
      <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Trajetória Comparativa Mensal: Simples vs Presumido vs Real
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Curva com tributos em R$</span>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis 
                stroke="#94A3B8" 
                fontSize={11} 
                tickLine={false}
                tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`} 
              />
              <Tooltip 
                formatter={(value: any) => formatCurrencyBRL(Number(value))}
                contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#F8FAFC', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="Simples" fill="#3B82F6" name="DAS Simples Nacional" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Presumido" fill="#F59E0B" name="Lucro Presumido" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Real" fill="#8B5CF6" name="Lucro Real" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabela Detalhada Mês a Mês do Ano-Calendário */}
      <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Demonstrativo Mês a Mês até o Encerramento do Exercício</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Discriminação de receitas, RBT12 acumulado móvel, alíquota apurada pela fórmula e guias devidas.
            </p>
          </div>
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center space-x-1.5 shadow-md transition self-start sm:self-auto cursor-pointer"
            title="Visualizar e exportar relatório detalhado em tela cheia, PDF ou CSV"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Gerar / Exportar Relatório</span>
          </button>
        </div>

        <div className="">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-[#0B0F19] font-sans text-[11px]">
                <th className="py-2.5 px-3">Mês/Ano</th>
                <th className="py-2.5 px-3">Receita Projetada</th>
                <th className="py-2.5 px-3">RBT12 Móvel</th>
                <th className="py-2.5 px-3">Faixa & Anexo</th>
                <th className="py-2.5 px-3 text-right">Alíq. Efetiva</th>
                <th className="py-2.5 px-3 text-right">DAS Simples</th>
                <th className="py-2.5 px-3 text-right">Lucro Presumido</th>
                <th className="py-2.5 px-3 text-right">Lucro Real</th>
                <th className="py-2.5 px-3 text-center">Melhor Regime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {projectionMonths.map((row) => {
                const isSimplesBest = row.bestRegimeMonth === 'simples';
                const isSublimitExceeded = row.rollingRbt12 > STATE_SUBLIMIT;

                return (
                  <tr 
                    key={row.monthIndex} 
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-bold text-white font-sans">
                      {row.calendarMonth}
                    </td>

                    <td className="py-2.5 px-3 text-slate-200">
                      {formatCurrencyBRL(row.projectedTotalRevenue)}
                    </td>

                    <td className="py-2.5 px-3">
                      <span className={isSublimitExceeded ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                        {formatCurrencyBRL(row.rollingRbt12)}
                      </span>
                      {isSublimitExceeded && (
                        <span className="text-[9px] block text-rose-400 font-sans font-semibold">Acima Sublimite 3.6M</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 font-sans">
                      <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-500/30 mr-1.5">
                        Anexo {row.anexo}
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        Faixa {row.bracketNum}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                      {(row.effectiveRate * 100).toFixed(2)}%
                    </td>

                    <td className="py-2.5 px-3 text-right font-bold text-blue-400">
                      {formatCurrencyBRL(row.simplesTaxDue)}
                    </td>

                    <td className="py-2.5 px-3 text-right text-amber-400">
                      {formatCurrencyBRL(row.presumedTaxDue)}
                    </td>

                    <td className="py-2.5 px-3 text-right text-purple-400">
                      {formatCurrencyBRL(row.realTaxDue)}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-sans ${
                        row.bestRegimeMonth === 'simples'
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                          : row.bestRegimeMonth === 'presumido'
                          ? 'bg-amber-950/60 text-amber-300 border border-amber-800'
                          : 'bg-purple-950/60 text-purple-300 border border-purple-800'
                      }`}>
                        {row.bestRegimeMonth.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Linha de Totais */}
            <tfoot>
              <tr className="bg-[#0B0F19] border-t-2 border-slate-700 font-bold">
                <td className="py-3 px-3 text-white font-sans">TOTAL DO PERÍODO</td>
                <td className="py-3 px-3 text-white">{formatCurrencyBRL(projectionTotals.totalRevenue)}</td>
                <td className="py-3 px-3 text-slate-300">RBT12 Final: {formatCurrencyBRL(projectionTotals.finalProjectedRbt12)}</td>
                <td className="py-3 px-3 text-slate-300 font-sans">Faixa {projectionTotals.finalBracket} de 6</td>
                <td className="py-3 px-3 text-right text-slate-500 font-sans">-</td>
                <td className="py-3 px-3 text-right text-blue-400">{formatCurrencyBRL(projectionTotals.totalSimples)}</td>
                <td className="py-3 px-3 text-right text-amber-400">{formatCurrencyBRL(projectionTotals.totalPresumed)}</td>
                <td className="py-3 px-3 text-right text-purple-400">{formatCurrencyBRL(projectionTotals.totalReal)}</td>
                <td className="py-3 px-3 text-center text-emerald-400 font-sans uppercase">
                  {projectionTotals.overallBestRegime}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Parecer Previsional e Orientações Técnicas */}
      <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-md space-y-3">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Parecer de Planejamento Previsional
          </h3>
        </div>

        <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
          <p>
            Com base no ritmo de faturamento projetado de <strong className="text-white">{formatCurrencyBRL(projectionTotals.averageMonthlyRevenue)}/mês</strong> e na curva estimada de crescimento anual de <strong className="text-blue-400">{annualGrowthRate}%</strong>, a empresa deve encerrar o exercício com RBT12 aproximado de <strong className="text-white">{formatCurrencyBRL(projectionTotals.finalProjectedRbt12)}</strong>.
          </p>
          <p>
            {projectionTotals.finalProjectedRbt12 > STATE_SUBLIMIT ? (
              <span className="text-amber-400 block">
                ⚠️ <strong>Atenção de Sublimite Estadual:</strong> No decorrer da projeção, a empresa ultrapassa o sublimite de R$ 3.600.000,00 da LC 123/2006. Isso exigirá o recolhimento do ICMS ou ISS pelo regime normal estadual/municipal no ano subsequente (ou mês subsequente se ultrapassar em mais de 20%).
              </span>
            ) : (
              <span className="text-emerald-400 block">
                ✓ <strong>Enquadramento Saudável:</strong> O faturamento acumulado permanece dentro do sublimite estadual de R$ 3,6 milhões, garantindo recolhimento unificado de todos os tributos federais e estaduais/municipais na guia DAS única.
              </span>
            )}
          </p>
          <p>
            O regime mais vantajoso no acumulado do período é o <strong className="text-emerald-400">{projectionTotals.overallBestRegime === 'simples' ? 'Simples Nacional' : projectionTotals.overallBestRegime === 'presumido' ? 'Lucro Presumido' : 'Lucro Real'}</strong>, gerando uma estimativa de carga tributária de <strong className="text-white">{formatCurrencyBRL(projectionTotals.overallBestRegime === 'simples' ? projectionTotals.totalSimples : projectionTotals.overallBestRegime === 'presumido' ? projectionTotals.totalPresumed : projectionTotals.totalReal)}</strong> frente aos outros regimes.
          </p>
        </div>
      </div>

      {/* Modal de Relatório e Parecer Previsional da Projeção */}
      <ReportViewerModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reportType="projecao"
        company={company}
        calculation={calculation}
        projectionRows={modalProjectionRows}
        onNavigateToParecerMaster={() => {
          setIsReportModalOpen(false);
          if (onNavigateToTab) onNavigateToTab('parecer');
        }}
      />

      {/* TUTORIAL MODAL */}
      <ModuleTutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        moduleName="Simulação Projetada Mês a Mês"
        description="Acompanhe a curva de evolução da receita bruta da empresa, projeção de crescimento e sazonalidade para prever o comportamento tributário ao longo do ano fiscal."
      />

    </div>
  );
};
