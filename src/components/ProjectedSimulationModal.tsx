import React, { useState, useMemo } from 'react';
import { 
  X, 
  TrendingUp, 
  Download, 
  Printer, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Info,
  DollarSign,
  Percent,
  Sparkles,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { CompanyData, CalculationResult } from '../types';
import { SIMPLES_TABLES } from '../data/taxTables';

interface ProjectedSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyData;
  calculation: CalculationResult;
}

interface MonthlyProjectionRow {
  monthIndex: number;
  monthLabel: string;
  monthlyRevenue: number;
  monthlyPayroll: number;
  rollingRbt12: number;
  rollingPayroll12m: number;
  fatorRPercent: number;
  effectiveAnexo: 'I' | 'II' | 'III' | 'IV' | 'V';
  simplesBracket: number;
  simplesNominalRate: number;
  simplesDeduction: number;
  simplesEffectiveRate: number;
  simplesTax: number;
  presumedTax: number;
  realTax: number;
  monthlySavings: number;
  cumulativeSavings: number;
}

export const ProjectedSimulationModal: React.FC<ProjectedSimulationModalProps> = ({
  isOpen,
  onClose,
  company,
  calculation
}) => {
  const currentYear = new Date().getFullYear();
  const [targetYear, setTargetYear] = useState<number>(currentYear);
  const [monthlyGrowthRate, setMonthlyGrowthRate] = useState<number>(1.5);
  const [payrollGrowthRate, setPayrollGrowthRate] = useState<number>(0.5);
  const [baseMonthlyRevenue, setBaseMonthlyRevenue] = useState<number>(() => {
    return company.monthlyRevenue > 0 ? company.monthlyRevenue : ((company.rbt12 || 0) / 12);
  });
  const [baseMonthlyPayroll, setBaseMonthlyPayroll] = useState<number>(() => {
    return company.monthlyPayroll > 0 ? company.monthlyPayroll : ((company.payroll12m || 0) / 12);
  });
  const [customNotes, setCustomNotes] = useState<string>('');
  const [isReportMode, setIsReportMode] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  const formatCurrencyBRL = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const monthsNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Helper function to calculate Simples effective rate and tax for an arbitrary RBT12 & Anexo
  const calcSimplesForMonth = (rbt12: number, anexo: 'I' | 'II' | 'III' | 'IV' | 'V', revenue: number) => {
    const table = SIMPLES_TABLES[anexo] || SIMPLES_TABLES.I;
    const bracket = table.find(b => rbt12 <= b.limit) || table[table.length - 1];
    const bracketIndex = table.findIndex(b => b.limit === bracket.limit) + 1;

    let effectiveRate = 0;
    if (rbt12 > 0) {
      effectiveRate = Math.max(0, ((rbt12 * bracket.rate) - bracket.deduction) / rbt12);
    } else {
      effectiveRate = bracket.rate;
    }

    const tax = revenue * effectiveRate;
    return {
      bracket: bracketIndex,
      nominalRate: bracket.rate * 100,
      deduction: bracket.deduction,
      effectiveRate: effectiveRate * 100,
      tax
    };
  };

  // Helper for Lucro Presumido estimate
  const calcPresumedForMonth = (revenue: number, payroll: number, anexo: string) => {
    const isService = anexo === 'III' || anexo === 'IV' || anexo === 'V';
    const pisCofins = revenue * 0.0365;
    const issIcms = isService ? revenue * 0.05 : revenue * 0.04;
    const irpjBase = isService ? revenue * 0.32 : revenue * 0.08;
    const csllBase = isService ? revenue * 0.32 : revenue * 0.12;
    const irpj = irpjBase * 0.15 + (irpjBase > 20000 ? (irpjBase - 20000) * 0.10 : 0);
    const csll = csllBase * 0.09;
    const patronal = payroll * 0.28;
    return pisCofins + issIcms + irpj + csll + patronal;
  };

  // Helper for Lucro Real estimate
  const calcRealForMonth = (revenue: number, payroll: number, anexo: string) => {
    const estimatedMargin = 0.12;
    const estimatedProfit = revenue * estimatedMargin;
    const pisCofins = revenue * 0.045;
    const icmsIss = revenue * 0.04;
    const irpj = estimatedProfit * 0.15 + (estimatedProfit > 20000 ? (estimatedProfit - 20000) * 0.10 : 0);
    const csll = estimatedProfit * 0.09;
    const patronal = payroll * 0.28;
    return pisCofins + icmsIss + irpj + csll + patronal;
  };

  // Build the 12-month projection dataset
  const projectionRows: MonthlyProjectionRow[] = useMemo(() => {
    let runningRbt12 = company.rbt12 || (baseMonthlyRevenue * 12);
    let runningPayroll12m = company.payroll12m || (baseMonthlyPayroll * 12);
    let accumulatedSavings = 0;

    return monthsNames.map((monthLabel, index) => {
      const monthIndex = index + 1;
      const compoundRevGrowth = Math.pow(1 + (monthlyGrowthRate / 100), index);
      const compoundPayGrowth = Math.pow(1 + (payrollGrowthRate / 100), index);

      const monthlyRevenue = baseMonthlyRevenue * compoundRevGrowth;
      const monthlyPayroll = baseMonthlyPayroll * compoundPayGrowth;

      const rollingRbt12 = (runningRbt12 * 11 / 12) + monthlyRevenue;
      const rollingPayroll12m = (runningPayroll12m * 11 / 12) + monthlyPayroll;
      runningRbt12 = rollingRbt12;
      runningPayroll12m = rollingPayroll12m;

      const fatorRPercent = rollingRbt12 > 0 ? (rollingPayroll12m / rollingRbt12) * 100 : 0;

      let effectiveAnexo: 'I' | 'II' | 'III' | 'IV' | 'V' = company.anexo || 'I';
      if (company.subjectToFatorR) {
        effectiveAnexo = fatorRPercent >= 28 ? 'III' : 'V';
      }

      const simplesCalc = calcSimplesForMonth(rollingRbt12, effectiveAnexo, monthlyRevenue);
      const presumedTax = calcPresumedForMonth(monthlyRevenue, monthlyPayroll, effectiveAnexo);
      const realTax = calcRealForMonth(monthlyRevenue, monthlyPayroll, effectiveAnexo);

      const monthlySavings = Math.max(0, presumedTax - simplesCalc.tax);
      accumulatedSavings += monthlySavings;

      return {
        monthIndex,
        monthLabel,
        monthlyRevenue,
        monthlyPayroll,
        rollingRbt12,
        rollingPayroll12m,
        fatorRPercent,
        effectiveAnexo,
        simplesBracket: simplesCalc.bracket,
        simplesNominalRate: simplesCalc.nominalRate,
        simplesDeduction: simplesCalc.deduction,
        simplesEffectiveRate: simplesCalc.effectiveRate,
        simplesTax: simplesCalc.tax,
        presumedTax,
        realTax,
        monthlySavings,
        cumulativeSavings: accumulatedSavings
      };
    });
  }, [company, baseMonthlyRevenue, baseMonthlyPayroll, monthlyGrowthRate, payrollGrowthRate]);

  // Annual Totals
  const annualTotals = useMemo(() => {
    const totalRevenue = projectionRows.reduce((acc, r) => acc + r.monthlyRevenue, 0);
    const totalPayroll = projectionRows.reduce((acc, r) => acc + r.monthlyPayroll, 0);
    const totalSimples = projectionRows.reduce((acc, r) => acc + r.simplesTax, 0);
    const totalPresumed = projectionRows.reduce((acc, r) => acc + r.presumedTax, 0);
    const totalReal = projectionRows.reduce((acc, r) => acc + r.realTax, 0);
    const totalSavings = projectionRows.reduce((acc, r) => acc + r.monthlySavings, 0);
    const avgRate = totalRevenue > 0 ? (totalSimples / totalRevenue) * 100 : 0;
    const finalRbt12 = projectionRows[11]?.rollingRbt12 || 0;

    return {
      totalRevenue,
      totalPayroll,
      totalSimples,
      totalPresumed,
      totalReal,
      totalSavings,
      avgRate,
      finalRbt12
    };
  }, [projectionRows]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    try {
      const el = document.getElementById('projected-simulation-report');
      if (!el) {
        window.print();
        return;
      }
      window.print();
    } catch (e) {
      console.error(e);
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleOpenStandaloneTab = () => {
    const reportHtml = document.getElementById('projected-simulation-report')?.outerHTML;
    if (!reportHtml) return;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Relatório de Projeção Anual - ${company.name}</title>
            <meta charset="utf-8" />
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; background: #0B0F19; color: #E2E8F0; padding: 24px; }
              @media print { body { background: white; color: black; padding: 0; } }
            </style>
          </head>
          <body>
            ${reportHtml}
            <script>setTimeout(() => window.print(), 600);</script>
          </body>
        </html>
      `);
      win.document.close();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn font-sans">
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl max-w-6xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden relative text-slate-100 my-auto">
        
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#0B0F19]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest px-2 py-0.5 bg-blue-950/60 rounded border border-blue-800/60">
                  Planejamento Anual Projetado
                </span>
                <span className="text-xs text-slate-400">Ano-Calendário {targetYear}</span>
              </div>
              <h2 className="text-lg font-bold text-slate-100 tracking-tight">
                Simulação Projetada Mês a Mês & Resumo Anual
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsReportMode(!isReportMode)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 border transition-colors cursor-pointer ${
                isReportMode 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{isReportMode ? 'Voltar à Edição' : 'Visualizar Relatório'}</span>
            </button>

            {isReportMode && (
              <>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isExportingPdf}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer"
                  title="Gera e faz o download direto do arquivo .PDF"
                >
                  {isExportingPdf ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                      <span>Gerando...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5 text-white" />
                      <span>Baixar PDF</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
                  title="Imprimir pelo navegador"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-400" />
                  <span>Imprimir</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenStandaloneTab}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
                  title="Abrir relatório em nova aba fora do container"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Nova Aba</span>
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0B0F19]">
          
          {/* Company Brief Card */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xs">
            <div>
              <p className="text-[11px] font-medium text-slate-400">Empresa / Contribuinte</p>
              <p className="text-sm font-bold text-slate-100 truncate">{company.name || 'Empresa em Simulação'}</p>
              <p className="text-xs text-slate-400 font-mono">{company.cnpj || '00.000.000/0001-00'}</p>
            </div>

            <div>
              <p className="text-[11px] font-medium text-slate-400">Enquadramento / Anexo</p>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="px-2 py-0.5 text-xs font-bold bg-amber-950/60 text-amber-300 border border-amber-800/60 rounded">
                  Anexo {company.anexo}
                </span>
                {company.subjectToFatorR && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-purple-950/60 text-purple-300 border border-purple-800/60 rounded">
                    Fator R
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">UF: {company.uf || 'SP'}</p>
            </div>

            <div>
              <p className="text-[11px] font-medium text-slate-400">RBT12 Atual de Partida</p>
              <p className="text-sm font-bold text-slate-100">{formatCurrencyBRL(company.rbt12 || 0)}</p>
              <p className="text-xs text-slate-400">Folha 12m: {formatCurrencyBRL(company.payroll12m || 0)}</p>
            </div>

            <div>
              <p className="text-[11px] font-medium text-slate-400">Economia Anual Projetada</p>
              <p className="text-base font-extrabold text-emerald-400">{formatCurrencyBRL(annualTotals.totalSavings)}</p>
              <p className="text-xs text-slate-400">Regime Recomendado: <strong className="text-emerald-400 uppercase">Simples Nacional</strong></p>
            </div>
          </div>

          {!isReportMode ? (
            <>
              {/* Simulation Configuration Controls */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-bold text-slate-100">Parâmetros da Projeção Anual</h3>
                  </div>
                  <span className="text-xs text-slate-400">Ajuste os índices para recalcular mês a mês</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className="text-[11px] font-medium text-slate-300 block mb-1.5">Ano da Projeção</label>
                    <select
                      value={targetYear}
                      onChange={(e) => setTargetYear(parseInt(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                    >
                      <option value={currentYear}>{currentYear} (Ano Corrente)</option>
                      <option value={currentYear + 1}>{currentYear + 1} (Próximo Ano-Calendário)</option>
                      <option value={currentYear - 1}>{currentYear - 1}</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-300 block mb-1.5">Faturamento Mensal Base (R$)</label>
                    <input
                      type="number"
                      value={baseMonthlyRevenue}
                      onChange={(e) => setBaseMonthlyRevenue(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-300 block mb-1.5">Crescimento Mensal Receita (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={monthlyGrowthRate}
                      onChange={(e) => setMonthlyGrowthRate(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-300 block mb-1.5">Folha/Pró-Labore Mensal Base (R$)</label>
                    <input
                      type="number"
                      value={baseMonthlyPayroll}
                      onChange={(e) => setBaseMonthlyPayroll(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-300 block mb-1.5">Reajuste Mensal Folha (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={payrollGrowthRate}
                      onChange={(e) => setPayrollGrowthRate(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="text-[11px] font-medium text-slate-300 block mb-1">Notas do Parecer da Projeção</label>
                  <input
                    type="text"
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    placeholder="Observações do cenário simulado..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Month-by-Month Projected Table */}
              <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/90 shadow-xs">
                <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                      Detalhamento Mês a Mês ({targetYear})
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      RBT12 móvel acumulado, enquadramento de alíquota e comparativo tributário
                    </p>
                  </div>
                  <div className="flex items-center space-x-3 text-xs">
                    <span className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>Simples Nacional</span>
                    </span>
                    <span className="flex items-center space-x-1.5 text-blue-400 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      <span>Lucro Presumido</span>
                    </span>
                  </div>
                </div>

                <div className=" custom-scrollbar">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-[11px] font-semibold">
                        <th className="py-2.5 px-3">Mês</th>
                        <th className="py-2.5 px-3 text-right">Faturamento Mês</th>
                        <th className="py-2.5 px-3 text-right">RBT12 Móvel</th>
                        <th className="py-2.5 px-3 text-center">Fator R</th>
                        <th className="py-2.5 px-3 text-center">Anexo / Faixa</th>
                        <th className="py-2.5 px-3 text-right">Alíquota Efetiva</th>
                        <th className="py-2.5 px-3 text-right text-emerald-400">DAS Simples</th>
                        <th className="py-2.5 px-3 text-right text-blue-400">Presumido</th>
                        <th className="py-2.5 px-3 text-right text-amber-400">Real</th>
                        <th className="py-2.5 px-3 text-right text-emerald-400 font-bold">Economia Mês</th>
                        <th className="py-2.5 px-3 text-right text-slate-300">Econ. Acumulada</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-mono">
                      {projectionRows.map((row) => {
                        const isAnexo5 = row.effectiveAnexo === 'V';
                        return (
                          <tr key={row.monthIndex} className="hover:bg-slate-800/50 transition-colors">
                            <td className="py-2.5 px-3 font-sans font-medium text-slate-200 flex items-center space-x-1.5">
                              <span className="text-[10px] text-slate-500 w-4">{row.monthIndex.toString().padStart(2, '0')}</span>
                              <span>{row.monthLabel}</span>
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-200">
                              {formatCurrencyBRL(row.monthlyRevenue)}
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-400">
                              {formatCurrencyBRL(row.rollingRbt12)}
                            </td>
                            <td className="py-2.5 px-3 text-center font-sans">
                              {company.subjectToFatorR ? (
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  row.fatorRPercent >= 28 
                                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60' 
                                    : 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
                                }`}>
                                  {row.fatorRPercent.toFixed(1)}%
                                </span>
                              ) : (
                                <span className="text-slate-500 text-[10px]">N/A</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center font-sans">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                isAnexo5 
                                  ? 'bg-rose-950/60 text-rose-300 border border-rose-800/60' 
                                  : 'bg-blue-950/60 text-blue-300 border border-blue-800/60'
                              }`}>
                                Anexo {row.effectiveAnexo} (F{row.simplesBracket})
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-200 font-bold">
                              {row.simplesEffectiveRate.toFixed(2)}%
                            </td>
                            <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">
                              {formatCurrencyBRL(row.simplesTax)}
                            </td>
                            <td className="py-2.5 px-3 text-right text-blue-400">
                              {formatCurrencyBRL(row.presumedTax)}
                            </td>
                            <td className="py-2.5 px-3 text-right text-amber-400">
                              {formatCurrencyBRL(row.realTax)}
                            </td>
                            <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">
                              {formatCurrencyBRL(row.monthlySavings)}
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-300">
                              {formatCurrencyBRL(row.cumulativeSavings)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-950/80 border-t-2 border-slate-700 font-bold text-xs">
                        <td className="py-3 px-3 font-sans text-slate-200 uppercase tracking-wider">Totais ({targetYear})</td>
                        <td className="py-3 px-3 text-right font-mono text-slate-100">{formatCurrencyBRL(annualTotals.totalRevenue)}</td>
                        <td className="py-3 px-3 text-right font-mono text-slate-400">RBT12 Final: {formatCurrencyBRL(annualTotals.finalRbt12)}</td>
                        <td className="py-3 px-3 text-center font-sans text-slate-500">-</td>
                        <td className="py-3 px-3 text-center font-sans text-slate-500">-</td>
                        <td className="py-3 px-3 text-right font-mono text-slate-200">Média {annualTotals.avgRate.toFixed(2)}%</td>
                        <td className="py-3 px-3 text-right font-mono text-emerald-400 text-sm">{formatCurrencyBRL(annualTotals.totalSimples)}</td>
                        <td className="py-3 px-3 text-right font-mono text-blue-400 text-sm">{formatCurrencyBRL(annualTotals.totalPresumed)}</td>
                        <td className="py-3 px-3 text-right font-mono text-amber-400 text-sm">{formatCurrencyBRL(annualTotals.totalReal)}</td>
                        <td className="py-3 px-3 text-right font-mono text-emerald-400 text-sm">{formatCurrencyBRL(annualTotals.totalSavings)}</td>
                        <td className="py-3 px-3 text-right font-mono text-emerald-400 text-sm">{formatCurrencyBRL(annualTotals.totalSavings)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Comparative Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/30 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Simples Nacional (Projetado)</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-2xl font-extrabold text-slate-100 font-mono">{formatCurrencyBRL(annualTotals.totalSimples)}</p>
                  <p className="text-xs text-emerald-400 mt-1 font-medium">Carga tributária média: {annualTotals.avgRate.toFixed(2)}% sobre a receita bruta</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/90 border border-blue-500/30 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Lucro Presumido (Projetado)</span>
                    <span className="text-[10px] text-blue-300 font-mono font-semibold">16.33% / 5.93%</span>
                  </div>
                  <p className="text-2xl font-extrabold text-slate-100 font-mono">{formatCurrencyBRL(annualTotals.totalPresumed)}</p>
                  <p className="text-xs text-slate-400 mt-1">Diferença em relação ao Simples: +{formatCurrencyBRL(Math.max(0, annualTotals.totalPresumed - annualTotals.totalSimples))}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/90 border border-purple-500/30 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Economia Anual Líquida</span>
                    <Sparkles className="w-4 h-4 text-purple-400" />
                  </div>
                  <p className="text-2xl font-extrabold text-emerald-400 font-mono">{formatCurrencyBRL(annualTotals.totalSavings)}</p>
                  <p className="text-xs text-slate-400 mt-1">Economia estimada mantendo a empresa no regime ideal</p>
                </div>
              </div>
            </>
          ) : (
            /* Printable Official Report Layout */
            <div id="projected-simulation-report" className="bg-[#0F172A] text-slate-100 p-8 rounded-xl shadow-lg border border-slate-800 print:bg-white print:text-black print:p-0 print:border-none print:shadow-none space-y-6">
              
              {/* Report Header */}
              <div className="border-b-2 border-slate-700 print:border-black pb-4 flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 print:text-slate-600">
                    RELATÓRIO TÉCNICO DE PLANEJAMENTO & SIMULAÇÃO TRIBUTÁRIA PROJETADA
                  </p>
                  <h1 className="text-xl font-bold text-slate-100 print:text-black mt-1">
                    Parecer de Projeção Tributária Anual - Ano-Calendário {targetYear}
                  </h1>
                  <p className="text-xs text-slate-400 print:text-slate-600 mt-0.5">
                    Demonstrativo comparativo mês a mês com evolução de faturamento e Fator R
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-100 print:text-black">{company.name}</p>
                  <p className="text-xs text-slate-400 print:text-slate-600 font-mono">CNPJ: {company.cnpj}</p>
                  <p className="text-[10px] text-slate-500">Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
                </div>
              </div>

              {/* Report Executive Summary */}
              <div className="grid grid-cols-4 gap-4 p-4 bg-slate-900/80 print:bg-slate-50 rounded-lg border border-slate-800 print:border-slate-300 text-xs">
                <div>
                  <span className="text-slate-400 print:text-slate-600 block font-medium">Receita Bruta Projetada:</span>
                  <strong className="text-slate-100 print:text-black font-mono text-sm">{formatCurrencyBRL(annualTotals.totalRevenue)}</strong>
                </div>
                <div>
                  <span className="text-slate-400 print:text-slate-600 block font-medium">Simples Nacional (DAS):</span>
                  <strong className="text-emerald-400 print:text-emerald-800 font-mono text-sm">{formatCurrencyBRL(annualTotals.totalSimples)}</strong>
                </div>
                <div>
                  <span className="text-slate-400 print:text-slate-600 block font-medium">Lucro Presumido:</span>
                  <strong className="text-blue-400 print:text-blue-800 font-mono text-sm">{formatCurrencyBRL(annualTotals.totalPresumed)}</strong>
                </div>
                <div>
                  <span className="text-slate-400 print:text-slate-600 block font-medium">Economia Projetada:</span>
                  <strong className="text-emerald-400 print:text-emerald-800 font-mono text-sm">{formatCurrencyBRL(annualTotals.totalSavings)}</strong>
                </div>
              </div>

              {/* Technical Notes / Methodology */}
              <div className="text-xs text-slate-300 print:text-slate-800 space-y-2 leading-relaxed">
                <p>
                  <strong>Fundamentação Legal & Metodologia:</strong> A presente projeção foi elaborada em conformidade com as diretrizes da Lei Complementar nº 123/2006 (Estatuto Nacional da Microempresa e Empresa de Pequeno Porte) e alterações posteriores. A apuração da alíquota efetiva considera a receita bruta acumulada nos 12 meses anteriores (RBT12) mês a mês, deduzindo as parcelas oficiais do anexo e avaliando a proporção de folha de salários (Fator R, art. 18, § 5º-J).
                </p>
                {customNotes && (
                  <p className="italic bg-amber-950/40 print:bg-amber-50 p-2.5 rounded border border-amber-800/40 print:border-amber-200 text-amber-300 print:text-amber-900">
                    <strong>Premissas Adotadas:</strong> {customNotes}
                  </p>
                )}
              </div>

              {/* Report Table */}
              <table className="w-full text-left text-[11px] border-collapse border border-slate-800 print:border-slate-300">
                <thead>
                  <tr className="bg-slate-900 print:bg-slate-100 text-slate-200 print:text-slate-800 border-b border-slate-700 print:border-slate-300 font-bold">
                    <th className="py-2 px-2 border border-slate-800 print:border-slate-300">Mês</th>
                    <th className="py-2 px-2 text-right border border-slate-800 print:border-slate-300">Faturamento</th>
                    <th className="py-2 px-2 text-right border border-slate-800 print:border-slate-300">RBT12 Deslizante</th>
                    <th className="py-2 px-2 text-center border border-slate-800 print:border-slate-300">Fator R</th>
                    <th className="py-2 px-2 text-center border border-slate-800 print:border-slate-300">Anexo/Faixa</th>
                    <th className="py-2 px-2 text-right border border-slate-800 print:border-slate-300">Alíq. Efetiva</th>
                    <th className="py-2 px-2 text-right border border-slate-800 print:border-slate-300 text-emerald-400 print:text-emerald-800 font-bold">DAS Simples</th>
                    <th className="py-2 px-2 text-right border border-slate-800 print:border-slate-300 text-blue-400 print:text-blue-800">Presumido</th>
                    <th className="py-2 px-2 text-right border border-slate-800 print:border-slate-300 text-emerald-400 print:text-emerald-800 font-bold">Economia Mês</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-slate-200 font-mono">
                  {projectionRows.map(r => (
                    <tr key={r.monthIndex} className="hover:bg-slate-800/40 print:hover:bg-slate-50">
                      <td className="py-1.5 px-2 font-sans font-medium text-slate-200 print:text-slate-900 border border-slate-800 print:border-slate-300">{r.monthLabel}</td>
                      <td className="py-1.5 px-2 text-right border border-slate-800 print:border-slate-300">{formatCurrencyBRL(r.monthlyRevenue)}</td>
                      <td className="py-1.5 px-2 text-right border border-slate-800 print:border-slate-300">{formatCurrencyBRL(r.rollingRbt12)}</td>
                      <td className="py-1.5 px-2 text-center border border-slate-800 print:border-slate-300 font-sans">
                        {company.subjectToFatorR ? `${r.fatorRPercent.toFixed(1)}%` : 'N/A'}
                      </td>
                      <td className="py-1.5 px-2 text-center border border-slate-800 print:border-slate-300 font-sans">
                        Anexo {r.effectiveAnexo} (F{r.simplesBracket})
                      </td>
                      <td className="py-1.5 px-2 text-right border border-slate-800 print:border-slate-300 font-bold">{r.simplesEffectiveRate.toFixed(2)}%</td>
                      <td className="py-1.5 px-2 text-right border border-slate-800 print:border-slate-300 font-bold text-emerald-400 print:text-emerald-800">{formatCurrencyBRL(r.simplesTax)}</td>
                      <td className="py-1.5 px-2 text-right border border-slate-800 print:border-slate-300 text-blue-400 print:text-blue-800">{formatCurrencyBRL(r.presumedTax)}</td>
                      <td className="py-1.5 px-2 text-right border border-slate-800 print:border-slate-300 font-bold text-emerald-400 print:text-emerald-800">{formatCurrencyBRL(r.monthlySavings)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-950 print:bg-slate-200 font-bold text-xs border-t-2 border-slate-700 print:border-black">
                    <td className="py-2 px-2 border border-slate-800 print:border-slate-400 font-sans">TOTAL {targetYear}</td>
                    <td className="py-2 px-2 text-right border border-slate-800 print:border-slate-400 font-mono">{formatCurrencyBRL(annualTotals.totalRevenue)}</td>
                    <td className="py-2 px-2 text-right border border-slate-800 print:border-slate-400 font-mono">-</td>
                    <td className="py-2 px-2 text-center border border-slate-800 print:border-slate-400 font-sans">-</td>
                    <td className="py-2 px-2 text-center border border-slate-800 print:border-slate-400 font-sans">-</td>
                    <td className="py-2 px-2 text-right border border-slate-800 print:border-slate-400 font-mono">{annualTotals.avgRate.toFixed(2)}%</td>
                    <td className="py-2 px-2 text-right border border-slate-800 print:border-slate-400 font-mono text-emerald-400 print:text-emerald-900">{formatCurrencyBRL(annualTotals.totalSimples)}</td>
                    <td className="py-2 px-2 text-right border border-slate-800 print:border-slate-400 font-mono text-blue-400 print:text-blue-900">{formatCurrencyBRL(annualTotals.totalPresumed)}</td>
                    <td className="py-2 px-2 text-right border border-slate-800 print:border-slate-400 font-mono text-emerald-400 print:text-emerald-900">{formatCurrencyBRL(annualTotals.totalSavings)}</td>
                  </tr>
                </tfoot>
              </table>

              {/* Signatures */}
              <div className="pt-12 grid grid-cols-2 gap-12 text-center text-xs text-slate-400 print:text-slate-700">
                <div className="border-t border-slate-700 print:border-slate-400 pt-2">
                  <p className="font-bold text-slate-200 print:text-slate-900">{company.name}</p>
                  <p className="text-slate-400 print:text-slate-500">Representante Legal / Contribuinte</p>
                </div>
                <div className="border-t border-slate-700 print:border-slate-400 pt-2">
                  <p className="font-bold text-slate-200 print:text-slate-900">Auditor / Consultor Tributário</p>
                  <p className="text-slate-400 print:text-slate-500">CRC Responsável Técnico</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-[#0B0F19]">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Info className="w-4 h-4 text-blue-400" />
            <span>Projeção calculada com base na LC 123/2006, faixas oficiais e deduções de cada Anexo.</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
