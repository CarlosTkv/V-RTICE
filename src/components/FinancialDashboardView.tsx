import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  PieChart as PieIcon, 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle,
  HelpCircle,
  Percent,
  Calculator,
  FileSpreadsheet,
  FileText,
  Printer,
  Sparkles,
  Sliders,
  Wallet,
  Coins,
  Receipt,
  Scale,
  Building2,
  Users,
  CheckCircle2,
  RefreshCw,
  Clock,
  ArrowRight,
  Download
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar, 
  Cell, 
  Legend,
  PieChart, 
  Pie,
  ComposedChart,
  Line
} from 'recharts';
import { CompanyData, CalculationResult } from '../types';
import { 
  formatCurrencyBRL, 
  formatPercentBR 
} from '../utils/taxRules';
import { exportTableToCSV } from '../utils/reportExporter';
import { ReportViewerModal } from './ReportViewerModal';
import { FinancialReportExportModal } from './FinancialReportExportModal';
import { HelpTooltip } from './HelpTooltip';

interface FinancialDashboardViewProps {
  company: CompanyData;
  onChangeCompany: (updated: CompanyData) => void;
  calculation: CalculationResult;
  onNavigateToTab?: (tab: any) => void;
}

export const FinancialDashboardView: React.FC<FinancialDashboardViewProps> = ({
  company,
  onChangeCompany,
  calculation,
  onNavigateToTab,
}) => {
  // Modal de Relatório Financeiro
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isPdfExportModalOpen, setIsPdfExportModalOpen] = useState(false);
  const [pdfReportType, setPdfReportType] = useState<'faturamento' | 'extrato' | 'consolidado'>('faturamento');

  // Sub-abas do Painel Financeiro
  const [activeSubTab, setActiveSubTab] = useState<'dre' | 'graficos' | 'breakeven' | 'prolabore' | 'stresstest' | 'fluxo_caixa'>('dre');

  // Parâmetros operacionais e financeiros locais (com valores default derivados da empresa)
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(company.monthlyRevenue || (company.rbt12 / 12) || 100000);
  const [inputCostsPercent, setInputCostsPercent] = useState<number>(
    company.inputCostsPercent ?? (company.anexo === 'I' || company.anexo === 'II' ? 50 : 20)
  );
  const [operationalExpensesPercent, setOperationalExpensesPercent] = useState<number>(
    company.operationalExpensesPercent ?? 15
  );
  const [proLaboreValue, setProLaboreValue] = useState<number>(
    company.proLaboreMonthly ?? Math.min(company.monthlyPayroll || 15000, 10000)
  );
  const [financialExpensesValue, setFinancialExpensesValue] = useState<number>(
    company.financialExpensesMonthly ?? Math.round(monthlyRevenue * 0.02)
  );

  // Variáveis para o Simulador de Stress Test (Sensibilidade)
  const [stressRevenueVar, setStressRevenueVar] = useState<number>(0); // % de variação (-30% a +50%)
  const [stressCostsVar, setStressCostsVar] = useState<number>(0); // % de variação (-20% a +30%)
  const [stressFixedVar, setStressFixedVar] = useState<number>(0); // % de variação (-20% a +30%)

  // Sincronizar caso mude a empresa externa
  React.useEffect(() => {
    setMonthlyRevenue(company.monthlyRevenue || (company.rbt12 / 12) || 100000);
    setInputCostsPercent(company.inputCostsPercent ?? (company.anexo === 'I' || company.anexo === 'II' ? 50 : 20));
    setOperationalExpensesPercent(company.operationalExpensesPercent ?? 15);
    setProLaboreValue(company.proLaboreMonthly ?? Math.min(company.monthlyPayroll || 15000, 10000));
    setFinancialExpensesValue(company.financialExpensesMonthly ?? Math.round((company.monthlyRevenue || 100000) * 0.02));
  }, [company]);

  // CÁLCULOS PRINCIPAIS DA DRE GERENCIAL
  const grossRevenue = monthlyRevenue;
  const taxRate = calculation.effectiveRate || 8.5;
  const taxOnSales = calculation.effectiveTaxMonthly || (grossRevenue * (taxRate / 100));
  const netRevenue = Math.max(0, grossRevenue - taxOnSales);

  // Custos Variáveis (CPV / Insumos / Mercadorias)
  const costOfGoods = (grossRevenue * (inputCostsPercent / 100));
  const grossProfit = netRevenue - costOfGoods;
  const grossMarginPercent = grossRevenue > 0 ? (grossProfit / grossRevenue) * 100 : 0;

  // Despesas Operacionais e com Pessoal
  const totalPayroll = company.monthlyPayroll || (grossRevenue * 0.25);
  const payrollEmployees = Math.max(0, totalPayroll - proLaboreValue);
  const operationalExpenses = (grossRevenue * (operationalExpensesPercent / 100));

  // EBITDA / LAJIDA
  const totalOperatingExpenses = payrollEmployees + proLaboreValue + operationalExpenses;
  const ebitda = grossProfit - totalOperatingExpenses;
  const ebitdaMarginPercent = grossRevenue > 0 ? (ebitda / grossRevenue) * 100 : 0;

  // Despesas Financeiras e Resultado Final
  const financialExpenses = financialExpensesValue;
  const profitBeforeTaxes = ebitda - financialExpenses;

  // IRPJ / CSLL (se for fora do Simples, mas no Simples já está embutido no DAS)
  const taxesOnProfit = calculation.bestRegime?.regime === 'lucro_real' || calculation.bestRegime?.regime === 'lucro_presumido'
    ? (calculation.bestRegime.taxes.irpj + calculation.bestRegime.taxes.csll) / 12
    : 0;

  const netProfit = profitBeforeTaxes - taxesOnProfit;
  const netMarginPercent = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

  // Valores Anualizados
  const annualGrossRevenue = grossRevenue * 12;
  const annualNetRevenue = netRevenue * 12;
  const annualGrossProfit = grossProfit * 12;
  const annualEbitda = ebitda * 12;
  const annualNetProfit = netProfit * 12;
  const annualTaxes = taxOnSales * 12;

  // PONTO DE EQUILÍBRIO (BREAK-EVEN POINT)
  const fixedCostsTotal = payrollEmployees + proLaboreValue + operationalExpenses + financialExpenses;
  const variableRate = grossRevenue > 0 ? (taxOnSales + costOfGoods) / grossRevenue : 0.6;
  const contributionMarginRatio = Math.max(0.05, 1 - variableRate);
  const breakEvenRevenue = contributionMarginRatio > 0 ? fixedCostsTotal / contributionMarginRatio : 0;
  const safetyMarginPercent = grossRevenue > 0 ? ((grossRevenue - breakEvenRevenue) / grossRevenue) * 100 : 0;
  const breakEvenDay = Math.min(30, Math.max(1, Math.round((breakEvenRevenue / (grossRevenue || 1)) * 30)));

  // CÁLCULO DE EFICIÊNCIA DE PRÓ-LABORE VS DISTRIBUIÇÃO DE LUCROS
  const targetWithdrawal = Math.max(5000, proLaboreValue || 10000);
  const inssTeto2026 = 908.86;
  const inssProLaboreA = Math.min(targetWithdrawal * 0.11, inssTeto2026);
  const baseIrpfA = Math.max(0, targetWithdrawal - inssProLaboreA - 564.80);
  const irpfProLaboreA = baseIrpfA > 0 ? baseIrpfA * 0.225 - 662.77 : 0;
  const totalTaxScenarioA = Math.max(0, inssProLaboreA + irpfProLaboreA);
  const netInPocketA = targetWithdrawal - totalTaxScenarioA;

  const minWage = 1518;
  const optimizedProLabore = Math.min(targetWithdrawal, minWage);
  const optimizedProfitDistribution = Math.max(0, targetWithdrawal - optimizedProLabore);
  const inssProLaboreB = optimizedProLabore * 0.11;
  const irpfProLaboreB = 0;
  const taxProfitDistributionB = 0;
  const totalTaxScenarioB = inssProLaboreB + irpfProLaboreB + taxProfitDistributionB;
  const netInPocketB = targetWithdrawal - totalTaxScenarioB;

  const monthlyPartnerSavings = Math.max(0, totalTaxScenarioA - totalTaxScenarioB);
  const annualPartnerSavings = monthlyPartnerSavings * 12;

  // DADOS PARA OS GRÁFICOS RECHARTS
  // 1. Gráfico de Cascata DRE
  const waterfallData = [
    { name: 'Receita Bruta', valor: grossRevenue, fill: '#3b82f6' },
    { name: '(-) Impostos', valor: -taxOnSales, fill: '#ef4444' },
    { name: '(-) Fornecedores', valor: -costOfGoods, fill: '#f97316' },
    { name: '(-) Pessoal/Folha', valor: -(payrollEmployees + proLaboreValue), fill: '#a855f7' },
    { name: '(-) Despesas Fixas', valor: -(operationalExpenses + financialExpenses), fill: '#eab308' },
    { name: '(=) Lucro Líquido', valor: netProfit, fill: netProfit >= 0 ? '#10b981' : '#dc2626' },
  ];

  // 2. Gráfico Donut de Composição das Saídas
  const expensesCompositionData = [
    { name: 'Impostos e Tributos', value: Math.round(taxOnSales), color: '#ef4444' },
    { name: 'Custos CPV / Insumos', value: Math.round(costOfGoods), color: '#f97316' },
    { name: 'Folha & Pessoal', value: Math.round(payrollEmployees), color: '#8b5cf6' },
    { name: 'Pró-Labore Sócios', value: Math.round(proLaboreValue), color: '#06b6d4' },
    { name: 'Despesas Operacionais', value: Math.round(operationalExpenses), color: '#eab308' },
    { name: 'Despesas Financeiras', value: Math.round(financialExpenses), color: '#64748b' },
    { name: 'Lucro Líquido Retido/Distribuído', value: Math.max(0, Math.round(netProfit)), color: '#10b981' },
  ].filter(i => i.value > 0);

  // 3. Projeção de 12 Meses Financeiros
  const financialTrajectory = useMemo(() => {
    const months = ['Mês 1', 'Mês 2', 'Mês 3', 'Mês 4', 'Mês 5', 'Mês 6', 'Mês 7', 'Mês 8', 'Mês 9', 'Mês 10', 'Mês 11', 'Mês 12'];
    const growthFactor = (company.projectionGrowthPercent || 15) / 100 / 12;
    
    return months.map((m, idx) => {
      const monthRev = grossRevenue * (1 + (growthFactor * idx));
      const monthTax = monthRev * (taxRate / 100);
      const monthCosts = monthRev * (inputCostsPercent / 100) + fixedCostsTotal;
      const monthProfit = monthRev - monthTax - monthCosts;
      return {
        month: m,
        receita: Math.round(monthRev),
        custosTotais: Math.round(monthCosts + monthTax),
        lucroLiquido: Math.round(monthProfit),
        pontoEquilibrio: Math.round(breakEvenRevenue),
      };
    });
  }, [grossRevenue, taxRate, inputCostsPercent, fixedCostsTotal, breakEvenRevenue, company.projectionGrowthPercent]);

  // 4. EVOLUÇÃO DA CARGA TRIBUTÁRIA MENSAL: CENÁRIO ATUAL VS PROJEÇÃO FATOR R (RECHARTS)
  const taxBurdenEvolutionData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const growthFactor = (company.projectionGrowthPercent || 15) / 100 / 12;

    // Tax rates calculation (Anexo III vs V for Fator R under LC 123/06)
    const anexoIIICalc = calculation.anexoCalculations?.find(a => a.anexo === 'III');
    const anexoVCalc = calculation.anexoCalculations?.find(a => a.anexo === 'V');
    const anexoIIIRate = anexoIIICalc?.effectiveRate || 6.0;
    const anexoVRate = anexoVCalc?.effectiveRate || 15.5;

    // Cenário Atual: sem otimização do Fator R (se < 28%, permanece no Anexo V ou alíquota nominal)
    const baselineRate = calculation.fatorR < 28 
      ? (calculation.effectiveRate || anexoVRate)
      : anexoVRate;

    // Cenário Otimizado: atingindo Fator R ≥ 28% no Anexo III
    const optimizedRate = calculation.fatorR >= 28 
      ? (calculation.effectiveRate || anexoIIIRate)
      : anexoIIIRate;

    return months.map((m, idx) => {
      const monthRev = grossRevenue * (1 + (growthFactor * idx));
      const impostoAtual = Math.round(monthRev * (baselineRate / 100));
      const impostoOtimizado = Math.round(monthRev * (optimizedRate / 100));
      const economiaMensal = Math.max(0, impostoAtual - impostoOtimizado);
      const cargaAtualPerc = Number(baselineRate.toFixed(2));
      const cargaOtimizadaPerc = Number(optimizedRate.toFixed(2));

      return {
        mes: m,
        receita: Math.round(monthRev),
        impostoAtual,
        impostoOtimizado,
        economiaMensal,
        cargaAtualPerc,
        cargaOtimizadaPerc,
      };
    });
  }, [grossRevenue, calculation, company.projectionGrowthPercent]);

  const annualFatorRSavings = useMemo(() => {
    return taxBurdenEvolutionData.reduce((acc, item) => acc + item.economiaMensal, 0);
  }, [taxBurdenEvolutionData]);

  // Projeção de Fluxo de Caixa Mensal (12 Meses)
  const cashFlowProjectionData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const growthFactor = (company.projectionGrowthPercent || 15) / 100 / 12;
    let initialBalance = grossRevenue * 0.5;

    return months.map((m, idx) => {
      const entrada = Math.round(grossRevenue * (1 + (growthFactor * idx)));
      const saidaTributos = Math.round(entrada * (taxRate / 100));
      const saidaCustos = Math.round(entrada * (inputCostsPercent / 100));
      const saidaFixas = Math.round(fixedCostsTotal);
      const saidaTotal = saidaTributos + saidaCustos + saidaFixas;
      const fluxoLiquido = entrada - saidaTotal;
      initialBalance += fluxoLiquido;

      return {
        month: m,
        entradas: entrada,
        saidas: saidaTotal,
        fluxoLiquido,
        saldoAcumulado: Math.round(initialBalance),
      };
    });
  }, [grossRevenue, taxRate, inputCostsPercent, fixedCostsTotal, company.projectionGrowthPercent]);

  // Gráfico de 'Burn Rate' Comparativo (Despesas Fixas vs Variáveis)
  const burnRateComparisonData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const growthFactor = (company.projectionGrowthPercent || 15) / 100 / 12;
    const caixaReservaInicial = 150000;

    return months.map((m, idx) => {
      const monthRev = grossRevenue * (1 + (growthFactor * idx));
      const despesasFixas = Math.round(fixedCostsTotal);
      const despesasVariaveis = Math.round((monthRev * (inputCostsPercent / 100)) + (monthRev * (taxRate / 100)));
      const totalBurnRate = despesasFixas + despesasVariaveis;
      const runwayMeses = totalBurnRate > 0 ? Number((caixaReservaInicial / totalBurnRate).toFixed(1)) : 12;

      return {
        month: m,
        despesasFixas,
        despesasVariaveis,
        totalBurnRate,
        runwayMeses,
      };
    });
  }, [grossRevenue, taxRate, inputCostsPercent, fixedCostsTotal, company.projectionGrowthPercent]);

  const taxBurdenCurrentRate = taxBurdenEvolutionData[0]?.cargaAtualPerc || 15.5;
  const taxBurdenOptimizedRate = taxBurdenEvolutionData[0]?.cargaOtimizadaPerc || 6.0;
  const taxBurdenReductionPerc = taxBurdenCurrentRate > 0 
    ? ((taxBurdenCurrentRate - taxBurdenOptimizedRate) / taxBurdenCurrentRate) * 100 
    : 0;

  // CÁLCULO DE STRESS TEST (SENSIBILIDADE)
  const stressRevenue = grossRevenue * (1 + (stressRevenueVar / 100));
  const stressTax = stressRevenue * (taxRate / 100);
  const stressNetRev = stressRevenue - stressTax;
  const stressInputCosts = stressRevenue * ((inputCostsPercent * (1 + (stressCostsVar / 100))) / 100);
  const stressFixed = fixedCostsTotal * (1 + (stressFixedVar / 100));
  const stressNetProfit = stressNetRev - stressInputCosts - stressFixed;
  const stressNetMargin = stressRevenue > 0 ? (stressNetProfit / stressRevenue) * 100 : 0;
  const stressProfitDiff = stressNetProfit - netProfit;

  // Exportar DRE para CSV
  const handleExportDREToCSV = () => {
    const dreRows = [
      { item: '1. RECEITA OPERACIONAL BRUTA', mensal: grossRevenue, anual: annualGrossRevenue, percentual: '100.00%' },
      { item: '  1.1 Vendas e Serviços Mercado Interno', mensal: company.monthlyRevenue || grossRevenue, anual: (company.monthlyRevenue || grossRevenue) * 12, percentual: `${(((company.monthlyRevenue || grossRevenue) / grossRevenue) * 100).toFixed(2)}%` },
      { item: '  1.2 Receitas de Exportação', mensal: company.exportMonthlyRevenue || 0, anual: (company.exportMonthlyRevenue || 0) * 12, percentual: `${(((company.exportMonthlyRevenue || 0) / grossRevenue) * 100).toFixed(2)}%` },
      { item: '2. (-) DEDUÇÕES E TRIBUTOS S/ VENDAS', mensal: -taxOnSales, anual: -annualTaxes, percentual: `-${((taxOnSales / grossRevenue) * 100).toFixed(2)}%` },
      { item: '  2.1 Guia DAS / Impostos Faturamento', mensal: -taxOnSales, anual: -annualTaxes, percentual: `-${((taxOnSales / grossRevenue) * 100).toFixed(2)}%` },
      { item: '3. (=) RECEITA OPERACIONAL LÍQUIDA', mensal: netRevenue, anual: annualNetRevenue, percentual: `${((netRevenue / grossRevenue) * 100).toFixed(2)}%` },
      { item: '4. (-) CUSTO DAS MERCADORIAS / SERVIÇOS (CPV)', mensal: -costOfGoods, anual: -costOfGoods * 12, percentual: `-${inputCostsPercent.toFixed(2)}%` },
      { item: '5. (=) LUCRO BRUTO', mensal: grossProfit, anual: annualGrossProfit, percentual: `${grossMarginPercent.toFixed(2)}%` },
      { item: '6. (-) DESPESAS OPERACIONAIS FIXAS', mensal: -totalOperatingExpenses, anual: -totalOperatingExpenses * 12, percentual: `-${((totalOperatingExpenses / grossRevenue) * 100).toFixed(2)}%` },
      { item: '  6.1 Folha de Pagamento CLT', mensal: -payrollEmployees, anual: -payrollEmployees * 12, percentual: `-${((payrollEmployees / grossRevenue) * 100).toFixed(2)}%` },
      { item: '  6.2 Pró-Labore dos Sócios', mensal: -proLaboreValue, anual: -proLaboreValue * 12, percentual: `-${((proLaboreValue / grossRevenue) * 100).toFixed(2)}%` },
      { item: '  6.3 Despesas Administrativas Gerais', mensal: -operationalExpenses, anual: -operationalExpenses * 12, percentual: `-${operationalExpensesPercent.toFixed(2)}%` },
      { item: '7. (=) RESULTADO OPERACIONAL (EBITDA)', mensal: ebitda, anual: annualEbitda, percentual: `${ebitdaMarginPercent.toFixed(2)}%` },
      { item: '8. (-) DESPESAS FINANCEIRAS LÍQUIDAS', mensal: -financialExpenses, anual: -financialExpenses * 12, percentual: `-${((financialExpenses / grossRevenue) * 100).toFixed(2)}%` },
      { item: '9. (-) IRPJ E CSLL SOBRE LUCRO', mensal: -taxesOnProfit, anual: -taxesOnProfit * 12, percentual: `-${((taxesOnProfit / grossRevenue) * 100).toFixed(2)}%` },
      { item: '10. (=) LUCRO LÍQUIDO DO EXERCÍCIO', mensal: netProfit, anual: annualNetProfit, percentual: `${netMarginPercent.toFixed(2)}%` },
      { item: '11. (=) DISTRIBUIÇÃO DE LUCROS ISENTA AOS SÓCIOS', mensal: Math.max(0, netProfit), anual: Math.max(0, annualNetProfit), percentual: `${Math.max(0, netMarginPercent).toFixed(2)}%` },
    ];

    exportTableToCSV(
      `DRE_Gerencial_${(company.name || 'empresa').replace(/\s+/g, '_')}`,
      ['Estrutura DRE Gerencial', 'Mensal (R$)', 'Anual Projetado (R$)', 'Análise Vertical (%)'],
      dreRows.map(r => [r.item, r.mensal.toFixed(2), r.anual.toFixed(2), r.percentual])
    );
  };

  // Salvar alterações de custos e despesas no estado da empresa
  const handleSaveFinancialParams = () => {
    onChangeCompany({
      ...company,
      monthlyRevenue,
      inputCostsPercent,
      operationalExpensesPercent,
      proLaboreMonthly: proLaboreValue,
      financialExpensesMonthly: financialExpensesValue,
      fixedCostsMonthly: fixedCostsTotal,
      estimatedNetProfitMargin: Math.round(netMarginPercent),
    });
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header do Painel Financeiro (Comfortable Dark Slate) */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          <div className="flex items-start space-x-3.5">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl shrink-0 mt-0.5">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Painel Financeiro & DRE Fiscal
                </h1>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                  Controladoria Executiva
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Demonstração de Resultados (DRE), Margens de Contribuição, Ponto de Equilíbrio (Break-Even) e Evolução da Carga Tributária com Fator R (LC 123/06).
              </p>
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setPdfReportType('faturamento');
                setIsPdfExportModalOpen(true);
              }}
              className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm shadow-indigo-600/20 transition cursor-pointer"
              title="Exportar Relatório Oficial de Faturamento (RBT12) e Extrato em PDF Padrão Vértice"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar em PDF</span>
            </button>

            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm shadow-blue-600/20 transition cursor-pointer"
              title="Gerar e Imprimir Relatório Executivo Financeiro A4"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Relatório Financeiro A4</span>
            </button>

            <button
              onClick={handleExportDREToCSV}
              className="px-3.5 py-2.5 bg-[#0B0F19] hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 border border-slate-700 transition cursor-pointer"
              title="Baixar planilha completa da DRE em CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exportar DRE (CSV)</span>
            </button>

            <button
              onClick={handleSaveFinancialParams}
              className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm shadow-emerald-600/20 transition cursor-pointer"
              title="Salvar alterações de parâmetros no cadastro da empresa"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Salvar Parâmetros</span>
            </button>
          </div>

        </div>

        {/* Diagnóstico de Saúde Financeira */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 font-medium">Empresa:</span>
            <span className="font-bold text-white">{company.name || 'Empresa em Auditoria'}</span>
            <span className="text-slate-500">({company.cnpj || 'Sem CNPJ'})</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Diagnóstico de Lucratividade:</span>
            <span className={`px-2.5 py-1 rounded-lg font-bold flex items-center space-x-1 border ${
              netMarginPercent >= 18
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : netMarginPercent >= 8
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                : netMarginPercent >= 3
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}>
              {netMarginPercent >= 18 ? '🟢 Rentabilidade Excelente & Caixa Seguro' :
               netMarginPercent >= 8 ? '🔵 Operação Estável & Saudável' :
               netMarginPercent >= 3 ? '🟡 Alerta de Margem Estreita' :
               '🔴 Risco de Déficit Operacional'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Fileira de KPIs Financeiros Estratégicos (Bento Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        
        {/* KPI 1: Receita Operacional Líquida */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-blue-500/40 transition shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Receita Líquida (ROL)
              </span>
              <HelpTooltip
                title="Receita Operacional Líquida"
                content="Receita Bruta subtraída dos tributos diretos incidentes sobre vendas (DAS ou PIS/COFINS/ISS). Representa a receita real disponível para cobrir custos e despesas."
                law="Art. 18 da LC 123/2006 e Pronunciamento Técnico CPC 30"
              />
            </div>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">
              {formatCurrencyBRL(netRevenue)}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 mt-1.5 font-mono">
              <span>Anual: {formatCurrencyBRL(annualNetRevenue)}</span>
              <span className="text-blue-400 font-semibold">{((netRevenue / grossRevenue) * 100).toFixed(1)}% da bruta</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Margem de Contribuição */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-amber-500/40 transition shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Margem Contribuição
              </span>
              <HelpTooltip
                title="Margem de Contribuição Unitária/Global"
                content="Percentual que sobra da receita após o pagamento dos tributos sobre vendas e custos de mercadorias/serviços (CPV), destinado a cobrir custos fixos e gerar lucro."
                law="Contabilidade de Custos e Gestão Estratégica"
              />
            </div>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
              {formatPercentBR(contributionMarginRatio * 100)}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 mt-1.5 font-mono">
              <span>R$ {formatCurrencyBRL(grossProfit)}/mês</span>
              <span className="text-amber-400 font-semibold">MC Geral</span>
            </div>
          </div>
        </div>

        {/* KPI 3: EBITDA (LAJIDA) */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-indigo-500/40 transition shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                EBITDA Operacional
              </span>
              <HelpTooltip
                title="Lucro Antes de Juros, Impostos, Depreciação e Amortização"
                content="Capacidade de geração de caixa operacional da empresa a partir exclusivamente de suas atividades centrais, antes de custos financeiros e tributos sobre o lucro."
                law="Instrução CVM 527/2012"
              />
            </div>
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl sm:text-3xl font-black font-mono ${ebitda >= 0 ? 'text-indigo-400' : 'text-rose-400'}`}>
              {formatCurrencyBRL(ebitda)}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 mt-1.5 font-mono">
              <span>Margem EBITDA:</span>
              <span className={`font-bold ${ebitdaMarginPercent >= 15 ? 'text-emerald-400' : 'text-indigo-400'}`}>
                {formatPercentBR(ebitdaMarginPercent)}
              </span>
            </div>
          </div>
        </div>

        {/* KPI 4: Lucro Líquido Real & Distribuição Isenta */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-emerald-500/40 transition shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Lucro Líquido Isento
              </span>
              <HelpTooltip
                title="Distribuição de Lucros Isenta de IRPF"
                content="Lucro final apurado pela escrituração contábil ou limite de presunção, distribuível aos sócios com 100% de isenção de Imposto de Renda Pessoa Física (IRPF)."
                law="Art. 10 da Lei 9.249/1995 e Art. 14 da LC 123/2006"
              />
            </div>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl sm:text-3xl font-black font-mono ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrencyBRL(netProfit)}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 mt-1.5 font-mono">
              <span>Margem Líquida:</span>
              <span className={`font-bold ${netMarginPercent >= 10 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {formatPercentBR(netMarginPercent)}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Navegação de Sub-Abas do Painel Financeiro */}
      <div className="flex flex-wrap border-b border-slate-800  space-x-2">
        <button
          onClick={() => setActiveSubTab('dre')}
          className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition flex items-center space-x-2 cursor-pointer  ${
            activeSubTab === 'dre'
              ? 'border-emerald-500 text-emerald-400 bg-[#0F172A]/80 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 rounded-t-xl'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Demonstração do Resultado (DRE)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('graficos')}
          className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition flex items-center space-x-2 cursor-pointer  ${
            activeSubTab === 'graficos'
              ? 'border-emerald-500 text-emerald-400 bg-[#0F172A]/80 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 rounded-t-xl'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Evolução Carga Tributária & Gráficos</span>
        </button>

        <button
          onClick={() => setActiveSubTab('breakeven')}
          className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition flex items-center space-x-2 cursor-pointer  ${
            activeSubTab === 'breakeven'
              ? 'border-emerald-500 text-emerald-400 bg-[#0F172A]/80 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 rounded-t-xl'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Ponto de Equilíbrio (Break-Even)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('prolabore')}
          className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition flex items-center space-x-2 cursor-pointer  ${
            activeSubTab === 'prolabore'
              ? 'border-emerald-500 text-emerald-400 bg-[#0F172A]/80 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 rounded-t-xl'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>Otimizador Pró-Labore vs Lucros</span>
        </button>

        <button
          onClick={() => setActiveSubTab('stresstest')}
          className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition flex items-center space-x-2 cursor-pointer  ${
            activeSubTab === 'stresstest'
              ? 'border-emerald-500 text-emerald-400 bg-[#0F172A]/80 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 rounded-t-xl'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Stress Test & Sensibilidade</span>
        </button>

        <button
          onClick={() => setActiveSubTab('fluxo_caixa')}
          className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition flex items-center space-x-2 cursor-pointer  ${
            activeSubTab === 'fluxo_caixa'
              ? 'border-emerald-500 text-emerald-400 bg-[#0F172A]/80 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 rounded-t-xl'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Fluxo de Caixa & Burn Rate</span>
        </button>
      </div>

      {/* SUB-ABA 1: DRE FISCAL & GERENCIAL COMPLETA */}
      {activeSubTab === 'dre' && (
        <div className="space-y-6">
          
          {/* Banner Resumo de Carga Tributária & Fator R */}
          <div className="bg-[#0F172A] border border-emerald-900/60 rounded-2xl p-5 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Auditoria do Fator R (LC 123/06): Projeção de Carga Tributária</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    {calculation.fatorR >= 28 ? 'Anexo III (Ativo)' : 'Oportunidade Fator R'}
                  </span>
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Carga tributária atual de <strong className="text-white font-mono">{taxBurdenCurrentRate.toFixed(2)}%</strong> comparada a <strong className="text-emerald-400 font-mono">{taxBurdenOptimizedRate.toFixed(2)}%</strong> no cenário otimizado. Economia anual estimada de <strong className="text-emerald-400 font-mono">{formatCurrencyBRL(annualFatorRSavings)}</strong>.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveSubTab('graficos')}
              className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition flex items-center space-x-1.5 shrink-0 cursor-pointer"
            >
              <span>Ver Gráfico Comparativo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Tabela da DRE */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden shadow-md">
            <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0B0F19]">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Calculator className="w-4 h-4 text-emerald-400" />
                  <span>Estrutura Padronizada da DRE Gerencial & Fiscal</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Valores mensais apurados e projeção anualizada conforme regime tributário
                </p>
              </div>
              <div className="text-xs font-mono text-slate-400">
                Regime: <strong className="text-emerald-400">{calculation.bestRegimeRecommendation.split('(')[0]}</strong>
              </div>
            </div>

            <div className="">
              <table className="w-full text-xs sm:text-sm font-mono text-left">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#0B0F19] text-slate-400 uppercase text-[11px] tracking-wider">
                    <th className="py-3 px-4 font-sans font-bold">Estrutura DRE</th>
                    <th className="py-3 px-4 text-right">Mensal (R$)</th>
                    <th className="py-3 px-4 text-right">Anual Projetado</th>
                    <th className="py-3 px-4 text-right">Análise Vertical (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  
                  {/* 1. RECEITA BRUTA */}
                  <tr className="bg-blue-950/20 font-bold text-blue-300">
                    <td className="py-3 px-4 font-sans flex items-center space-x-2">
                      <span>1. RECEITA OPERACIONAL BRUTA</span>
                    </td>
                    <td className="py-3 px-4 text-right">{formatCurrencyBRL(grossRevenue)}</td>
                    <td className="py-3 px-4 text-right">{formatCurrencyBRL(annualGrossRevenue)}</td>
                    <td className="py-3 px-4 text-right">100.00%</td>
                  </tr>

                  {/* 2. DEDUÇÕES / TRIBUTOS S/ VENDAS */}
                  <tr className="text-rose-400">
                    <td className="py-2.5 px-4 font-sans pl-8">2. (-) Tributos sobre Faturamento (DAS / Simples)</td>
                    <td className="py-2.5 px-4 text-right">-{formatCurrencyBRL(taxOnSales)}</td>
                    <td className="py-2.5 px-4 text-right">-{formatCurrencyBRL(annualTaxes)}</td>
                    <td className="py-2.5 px-4 text-right">-{((taxOnSales / grossRevenue) * 100).toFixed(2)}%</td>
                  </tr>

                  {/* 3. RECEITA OPERACIONAL LÍQUIDA */}
                  <tr className="bg-[#0B0F19] font-bold text-white border-t border-slate-800">
                    <td className="py-3 px-4 font-sans">3. (=) RECEITA OPERACIONAL LÍQUIDA (ROL)</td>
                    <td className="py-3 px-4 text-right">{formatCurrencyBRL(netRevenue)}</td>
                    <td className="py-3 px-4 text-right">{formatCurrencyBRL(annualNetRevenue)}</td>
                    <td className="py-3 px-4 text-right">{((netRevenue / grossRevenue) * 100).toFixed(2)}%</td>
                  </tr>

                  {/* 4. CUSTO CPV */}
                  <tr className="text-amber-400">
                    <td className="py-2.5 px-4 font-sans pl-8">4. (-) Custos das Mercadorias / Serviços / CPV</td>
                    <td className="py-2.5 px-4 text-right">-{formatCurrencyBRL(costOfGoods)}</td>
                    <td className="py-2.5 px-4 text-right">-{formatCurrencyBRL(costOfGoods * 12)}</td>
                    <td className="py-2.5 px-4 text-right">-{inputCostsPercent.toFixed(2)}%</td>
                  </tr>

                  {/* 5. LUCRO BRUTO */}
                  <tr className="bg-[#0B0F19] font-bold text-amber-300 border-t border-slate-800">
                    <td className="py-3 px-4 font-sans">5. (=) LUCRO BRUTO</td>
                    <td className="py-3 px-4 text-right">{formatCurrencyBRL(grossProfit)}</td>
                    <td className="py-3 px-4 text-right">{formatCurrencyBRL(annualGrossProfit)}</td>
                    <td className="py-3 px-4 text-right">{grossMarginPercent.toFixed(2)}%</td>
                  </tr>

                  {/* 6. DESPESAS OPERACIONAIS */}
                  <tr className="text-slate-300">
                    <td className="py-2.5 px-4 font-sans pl-8">6. (-) Despesas Operacionais Fixas & Administrativas</td>
                    <td className="py-2.5 px-4 text-right">-{formatCurrencyBRL(totalOperatingExpenses)}</td>
                    <td className="py-2.5 px-4 text-right">-{formatCurrencyBRL(totalOperatingExpenses * 12)}</td>
                    <td className="py-2.5 px-4 text-right">-{((totalOperatingExpenses / grossRevenue) * 100).toFixed(2)}%</td>
                  </tr>

                  <tr className="text-slate-400 text-xs">
                    <td className="py-1.5 px-4 font-sans pl-12">↳ Folha de Pagamento CLT (Equipe)</td>
                    <td className="py-1.5 px-4 text-right">-{formatCurrencyBRL(payrollEmployees)}</td>
                    <td className="py-1.5 px-4 text-right">-{formatCurrencyBRL(payrollEmployees * 12)}</td>
                    <td className="py-1.5 px-4 text-right">-{((payrollEmployees / grossRevenue) * 100).toFixed(2)}%</td>
                  </tr>

                  <tr className="text-slate-400 text-xs">
                    <td className="py-1.5 px-4 font-sans pl-12">↳ Pró-Labore Declarado dos Sócios</td>
                    <td className="py-1.5 px-4 text-right">-{formatCurrencyBRL(proLaboreValue)}</td>
                    <td className="py-1.5 px-4 text-right">-{formatCurrencyBRL(proLaboreValue * 12)}</td>
                    <td className="py-1.5 px-4 text-right">-{((proLaboreValue / grossRevenue) * 100).toFixed(2)}%</td>
                  </tr>

                  <tr className="text-slate-400 text-xs">
                    <td className="py-1.5 px-4 font-sans pl-12">↳ Despesas Administrativas & Comerciais</td>
                    <td className="py-1.5 px-4 text-right">-{formatCurrencyBRL(operationalExpenses)}</td>
                    <td className="py-1.5 px-4 text-right">-{formatCurrencyBRL(operationalExpenses * 12)}</td>
                    <td className="py-1.5 px-4 text-right">-{operationalExpensesPercent.toFixed(2)}%</td>
                  </tr>

                  {/* 7. EBITDA */}
                  <tr className="bg-[#0B0F19] font-bold text-indigo-300 border-t border-slate-800">
                    <td className="py-3 px-4 font-sans">7. (=) RESULTADO OPERACIONAL (EBITDA / LAJIDA)</td>
                    <td className="py-3 px-4 text-right">{formatCurrencyBRL(ebitda)}</td>
                    <td className="py-3 px-4 text-right">{formatCurrencyBRL(annualEbitda)}</td>
                    <td className="py-3 px-4 text-right">{ebitdaMarginPercent.toFixed(2)}%</td>
                  </tr>

                  {/* 8. DESPESAS FINANCEIRAS */}
                  <tr className="text-slate-400">
                    <td className="py-2.5 px-4 font-sans pl-8">8. (-) Despesas Financeiras Líquidas</td>
                    <td className="py-2.5 px-4 text-right">-{formatCurrencyBRL(financialExpenses)}</td>
                    <td className="py-2.5 px-4 text-right">-{formatCurrencyBRL(financialExpenses * 12)}</td>
                    <td className="py-2.5 px-4 text-right">-{((financialExpenses / grossRevenue) * 100).toFixed(2)}%</td>
                  </tr>

                  {/* 10. LUCRO LÍQUIDO */}
                  <tr className="bg-emerald-950/30 font-black text-emerald-400 border-t-2 border-emerald-500/50 text-sm">
                    <td className="py-3.5 px-4 font-sans flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>10. (=) LUCRO LÍQUIDO DO EXERCÍCIO</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">{formatCurrencyBRL(netProfit)}</td>
                    <td className="py-3.5 px-4 text-right">{formatCurrencyBRL(annualNetProfit)}</td>
                    <td className="py-3.5 px-4 text-right">{netMarginPercent.toFixed(2)}%</td>
                  </tr>

                  {/* 11. DISTRIBUIÇÃO ISENTA */}
                  <tr className="bg-[#0B0F19] text-xs font-mono text-emerald-400/90 border-t border-slate-800">
                    <td className="py-3 px-4 font-sans pl-8 font-semibold">↳ Potencial de Distribuição de Lucros Isentos (Lei 9.249/95)</td>
                    <td className="py-3 px-4 text-right font-bold">{formatCurrencyBRL(Math.max(0, netProfit))}</td>
                    <td className="py-3 px-4 text-right font-bold">{formatCurrencyBRL(Math.max(0, annualNetProfit))}</td>
                    <td className="py-3 px-4 text-right font-semibold">100% Isento PF</td>
                  </tr>

                </tbody>
              </table>
            </div>
          </div>

          {/* Ajuste de Parâmetros Financeiros */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-md">
            <div className="flex items-center space-x-2 mb-4 text-sm font-bold text-white">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Ajustar Parâmetros Financeiros da Empresa em Tempo Real</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Faturamento Mensal */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Faturamento Mensal (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-xs">R$</span>
                  <input
                    type="number"
                    value={monthlyRevenue}
                    onChange={(e) => setMonthlyRevenue(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              {/* % Custos Insumos / CPV */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Custos Insumos/CPV (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={inputCostsPercent}
                    onChange={(e) => setInputCostsPercent(Math.max(0, Math.min(95, Number(e.target.value))))}
                    className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400 font-mono text-xs">%</span>
                </div>
              </div>

              {/* % Despesas Operacionais Fixas */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Despesas Operacionais (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={operationalExpensesPercent}
                    onChange={(e) => setOperationalExpensesPercent(Math.max(0, Math.min(80, Number(e.target.value))))}
                    className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400 font-mono text-xs">%</span>
                </div>
              </div>

              {/* Pró-Labore dos Sócios */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Pró-Labore Sócios (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-xs">R$</span>
                  <input
                    type="number"
                    value={proLaboreValue}
                    onChange={(e) => setProLaboreValue(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* SUB-ABA 2: EVOLUÇÃO CARGA TRIBUTÁRIA & GRÁFICOS */}
      {activeSubTab === 'graficos' && (
        <div className="space-y-6">
          
          {/* DESTAQUE 1: RECHARTS - EVOLUÇÃO DA CARGA TRIBUTÁRIA (CENÁRIO ATUAL VS PROJEÇÃO FATOR R) */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-md space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>Engenharia Tributária LC 123/2006</span>
                  </span>
                  <HelpTooltip
                    title="Evolução da Carga Tributária com Fator R"
                    content="Compara a trajetória do valor mensal recolhido de tributos (DAS) entre o cenário sem otimização (Anexo V - a partir de 15,5%) e a projeção com Fator R atingindo a meta de 28% no Anexo III (a partir de 6%), considerando a curva de faturamento projetada para os próximos 12 meses."
                    law="Art. 18, §§ 5º-J e 5º-M da LC 123/2006"
                  />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                  Evolução da Carga Tributária Mensal: Cenário Atual vs. Projeção Fator R
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Comparação direta do desembolso mensal em impostos e economia líquida gerada pela migração de faixa
                </p>
              </div>

              <div className="flex items-center space-x-3 bg-[#0B0F19] border border-slate-800 p-2.5 rounded-xl text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Economia Anual Fator R</span>
                  <span className="text-base font-bold text-emerald-400">+{formatCurrencyBRL(annualFatorRSavings)}</span>
                </div>
                <div className="border-l border-slate-800 pl-3">
                  <span className="text-[10px] text-slate-400 uppercase block">Redução de Carga</span>
                  <span className="text-base font-bold text-blue-400">-{taxBurdenReductionPerc.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Gráfico Comparativo Recharts */}
            <div className="h-72 sm:h-84 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={taxBurdenEvolutionData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis 
                    dataKey="mes" 
                    stroke="#94A3B8" 
                    tick={{ fill: '#94A3B8', fontSize: 11 }} 
                  />
                  <YAxis 
                    stroke="#94A3B8" 
                    tick={{ fill: '#94A3B8', fontSize: 11 }}
                    tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(val: any, name: any) => [
                      formatCurrencyBRL(Number(val)),
                      name === 'impostoAtual' 
                        ? `Cenário Atual (${taxBurdenCurrentRate.toFixed(2)}%)` 
                        : name === 'impostoOtimizado' 
                        ? `Com Fator R (${taxBurdenOptimizedRate.toFixed(2)}%)` 
                        : 'Economia Líquida Gerada'
                    ]}
                    contentStyle={{ 
                      backgroundColor: '#0F172A', 
                      borderColor: '#334155', 
                      borderRadius: '0.75rem', 
                      fontSize: '12px', 
                      color: '#F8FAFC', 
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' 
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} 
                    formatter={(value) => {
                      if (value === 'impostoAtual') return <span className="text-rose-300 font-medium">Cenário Atual (Sem Fator R / Anexo V)</span>;
                      if (value === 'impostoOtimizado') return <span className="text-emerald-300 font-medium">Cenário Otimizado (Fator R ≥ 28% / Anexo III)</span>;
                      if (value === 'economiaMensal') return <span className="text-blue-300 font-medium">Economia Mensal Gerada</span>;
                      return <span className="text-slate-300">{value}</span>;
                    }}
                  />
                  <Bar 
                    dataKey="impostoAtual" 
                    name="impostoAtual" 
                    fill="#f43f5e" 
                    radius={[6, 6, 0, 0]} 
                    maxBarSize={36}
                  />
                  <Bar 
                    dataKey="impostoOtimizado" 
                    name="impostoOtimizado" 
                    fill="#10b981" 
                    radius={[6, 6, 0, 0]} 
                    maxBarSize={36}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="economiaMensal" 
                    name="economiaMensal" 
                    stroke="#38bdf8" 
                    strokeWidth={3} 
                    dot={{ fill: '#38bdf8', r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Cards de Métricas Comparativas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
              <div className="bg-[#0B0F19] p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Carga Tributária Atual</span>
                <div className="text-lg font-bold font-mono text-rose-400">{taxBurdenCurrentRate.toFixed(2)}%</div>
                <span className="text-[10px] text-slate-400 block font-medium">Tributação s/ Fator R ({formatCurrencyBRL(grossRevenue * (taxBurdenCurrentRate / 100))}/mês)</span>
              </div>

              <div className="bg-[#0B0F19] p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Carga com Fator R (Anexo III)</span>
                <div className="text-lg font-bold font-mono text-emerald-400">{taxBurdenOptimizedRate.toFixed(2)}%</div>
                <span className="text-[10px] text-slate-400 block font-medium">Meta Folha/Receita ≥ 28% ({formatCurrencyBRL(grossRevenue * (taxBurdenOptimizedRate / 100))}/mês)</span>
              </div>

              <div className="bg-[#0B0F19] p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Impacto no Lucro Líquido</span>
                <div className="text-lg font-bold font-mono text-blue-400">+{formatPercentBR(taxBurdenReductionPerc)}</div>
                <span className="text-[10px] text-slate-400 block font-medium">Aumento direto no caixa livre para os sócios</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Gráfico 2: Cascata DRE */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4 text-blue-400" />
                    <span>Cascata de Resultados (DRE Waterfall)</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">Visualização de onde vai cada centavo do faturamento</p>
                </div>
              </div>

              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={waterfallData} margin={{ top: 20, right: 20, left: -10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#94A3B8" 
                      tick={{ fill: '#94A3B8', fontSize: 10 }}
                      angle={-20}
                      textAnchor="end"
                      height={45}
                    />
                    <YAxis 
                      stroke="#94A3B8" 
                      tick={{ fill: '#94A3B8', fontSize: 10 }}
                      tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      formatter={(val: any) => [formatCurrencyBRL(Number(val)), 'Valor']}
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px', color: '#F8FAFC', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                    />
                    <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                      {waterfallData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico 3: Composição das Saídas (Donut) */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                    <PieIcon className="w-4 h-4 text-emerald-400" />
                    <span>Destino da Receita Bruta</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">Distribuição percentual de custos, tributos e margem</p>
                </div>
              </div>

              <div className="h-64 sm:h-72 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensesCompositionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={3}
                    >
                      {expensesCompositionData.map((entry, index) => (
                        <Cell key={`donut-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val: any) => [formatCurrencyBRL(Number(val)), 'Total']}
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px', color: '#F8FAFC', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} 
                      formatter={(value) => <span className="text-slate-300 font-medium">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Gráfico 4: Projeção 12 Meses de Curva de Caixa */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  <span>Projeção Financeira dos Próximos 12 Meses</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Receita Projetada vs Custos Totais vs Lucro Líquido Acumulado
                </p>
              </div>
            </div>

            <div className="h-72 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={financialTrajectory} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="month" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                  <YAxis 
                    stroke="#94A3B8" 
                    tick={{ fill: '#94A3B8', fontSize: 11 }}
                    tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(val: any) => [formatCurrencyBRL(Number(val)), '']}
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px', color: '#F8FAFC', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} formatter={(value) => <span className="text-slate-300 font-medium">{value}</span>} />
                  <Area type="monotone" dataKey="receita" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorReceita)" name="Receita Bruta" />
                  <Area type="monotone" dataKey="custosTotais" stroke="#e11d48" strokeWidth={2} fillOpacity={0} name="Custos Totais + Impostos" />
                  <Area type="monotone" dataKey="lucroLiquido" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#colorLucro)" name="Lucro Líquido" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* SUB-ABA 3: PONTO DE EQUILÍBRIO (BREAK-EVEN) */}
      {activeSubTab === 'breakeven' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Card Principal: Break-Even em R$ */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <Scale className="w-4 h-4" />
                  <span>Ponto de Equilíbrio Contábil (PEC)</span>
                </div>
                <div className="text-3xl font-black text-white font-mono mt-1">
                  {formatCurrencyBRL(breakEvenRevenue)}
                </div>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Faturamento mensal mínimo obrigatório para cobrir todos os custos fixos, folha de pagamento e tributos sobre vendas sem incorrer em prejuízo.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Custos Fixos Mensais:</span>
                  <span className="font-mono font-bold text-white">{formatCurrencyBRL(fixedCostsTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Margem de Contribuição:</span>
                  <span className="font-mono font-bold text-amber-400">{formatPercentBR(contributionMarginRatio * 100)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Faturamento Atual:</span>
                  <span className="font-mono font-bold text-emerald-400">{formatCurrencyBRL(grossRevenue)}</span>
                </div>
              </div>
            </div>

            {/* Card Margem de Segurança Operacional */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Margem de Segurança Operacional</span>
                </div>
                <div className={`text-3xl font-black font-mono mt-1 ${safetyMarginPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatPercentBR(safetyMarginPercent)}
                </div>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  O faturamento da sua empresa pode sofrer uma queda de até <strong className="text-white">{formatPercentBR(Math.max(0, safetyMarginPercent))}</strong> antes de entrar na zona de déficit operacional.
                </p>
              </div>

              {/* Barra de Progresso do Faturamento vs Break-Even */}
              <div className="mt-6 pt-4 border-t border-slate-800">
                <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-mono">
                  <span>Equilíbrio: {formatCurrencyBRL(breakEvenRevenue)}</span>
                  <span>Atual: {formatCurrencyBRL(grossRevenue)}</span>
                </div>
                <div className="w-full h-2.5 bg-[#0B0F19] rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      safetyMarginPercent >= 20 ? 'bg-emerald-500' : safetyMarginPercent >= 0 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(5, (grossRevenue / (breakEvenRevenue || 1)) * 50))}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Card Dia do Break-Even */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <Clock className="w-4 h-4" />
                  <span>Dia do Ponto de Equilíbrio</span>
                </div>
                <div className="text-3xl font-black text-purple-300 font-mono mt-1">
                  Dia {breakEvenDay} de cada mês
                </div>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Considerando vendas homogêneas, até o dia <strong className="text-white">{breakEvenDay}</strong> a empresa trabalha para cobrir custos e tributos. Do dia <strong className="text-emerald-400">{breakEvenDay + 1} em diante</strong>, a receita líquida vira lucro dos sócios!
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Status Operacional:</span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                  {breakEvenDay <= 20 ? 'Excelente (Dias 1-20)' : 'Atenção (Dias 21-30)'}
                </span>
              </div>
            </div>

          </div>

          {/* Tabela de Sensibilidade de Volumes de Vendas */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-md">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
              <Calculator className="w-4 h-4 text-blue-400" />
              <span>Simulação de Faturamentos Alternativos & Impacto no Lucro</span>
            </h4>

            <div className="">
              <table className="w-full text-xs font-mono text-left">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#0B0F19] text-slate-400 uppercase text-[11px]">
                    <th className="py-2.5 px-3">Cenário de Faturamento</th>
                    <th className="py-2.5 px-3 text-right">Receita Bruta</th>
                    <th className="py-2.5 px-3 text-right">Impostos s/ Venda</th>
                    <th className="py-2.5 px-3 text-right">Custos Variáveis</th>
                    <th className="py-2.5 px-3 text-right">Custos Fixos</th>
                    <th className="py-2.5 px-3 text-right">Lucro Líquido</th>
                    <th className="py-2.5 px-3 text-right">Margem Líquida</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {[-40, -20, -10, 0, 15, 30, 50].map((perc) => {
                    const simRev = grossRevenue * (1 + (perc / 100));
                    const simTax = simRev * (taxRate / 100);
                    const simCostVar = simRev * (inputCostsPercent / 100);
                    const simProfit = simRev - simTax - simCostVar - fixedCostsTotal;
                    const simMargin = simRev > 0 ? (simProfit / simRev) * 100 : 0;
                    const isCurrent = perc === 0;

                    return (
                      <tr 
                        key={perc}
                        className={`transition ${isCurrent ? 'bg-blue-950/40 font-bold text-white border-l-4 border-blue-500' : 'hover:bg-slate-800/40'}`}
                      >
                        <td className="py-2.5 px-3 flex items-center space-x-1.5 font-sans">
                          {isCurrent ? (
                            <span className="text-blue-400 font-bold">★ Cenário Atual (Base)</span>
                          ) : (
                            <span className={perc > 0 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                              {perc > 0 ? `+${perc}% de Vendas` : `${perc}% de Vendas`}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono">{formatCurrencyBRL(simRev)}</td>
                        <td className="py-2.5 px-3 text-right text-rose-400 font-mono">-{formatCurrencyBRL(simTax)}</td>
                        <td className="py-2.5 px-3 text-right text-amber-400 font-mono">-{formatCurrencyBRL(simCostVar)}</td>
                        <td className="py-2.5 px-3 text-right text-purple-400 font-mono">-{formatCurrencyBRL(fixedCostsTotal)}</td>
                        <td className={`py-2.5 px-3 text-right font-mono font-bold ${simProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {formatCurrencyBRL(simProfit)}
                        </td>
                        <td className={`py-2.5 px-3 text-right font-mono ${simMargin >= 10 ? 'text-emerald-400 font-bold' : simMargin >= 0 ? 'text-amber-400' : 'text-rose-400 font-bold'}`}>
                          {formatPercentBR(simMargin)}
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

      {/* SUB-ABA 4: PRÓ-LABORE VS LUCROS ISENTOS */}
      {activeSubTab === 'prolabore' && (
        <div className="space-y-6">
          
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-md">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Coins className="w-4 h-4" />
                  <span>Engenharia Tributária Societária</span>
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  Otimizador de Retiradas: Pró-Labore vs Distribuição de Lucros
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                  A legislação brasileira (Art. 10 da Lei 9.249/95 e LC 123/2006) concede isenção total de Imposto de Renda (IRPF) sobre a distribuição de lucros aos sócios. Retirar valores excessivos como Pró-Labore gera incidência de INSS (11%) e IRPF na tabela progressiva (até 27,5%).
                </p>
              </div>

              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center shrink-0">
                <span className="text-[11px] font-semibold text-emerald-400 uppercase block">Economia Anual aos Sócios</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">
                  +{formatCurrencyBRL(annualPartnerSavings)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Dinheiro a mais no bolso</span>
              </div>
            </div>

            {/* Comparativo de Cenários lado a lado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              
              {/* Cenário Ineficiente (Alto Pró-Labore) */}
              <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-900/60 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Cenário Tradicional / Ineficiente</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">Alta Tributação</span>
                </div>
                <h4 className="text-base font-bold text-white mt-2">100% Retirada em Pró-Labore</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Retirar todo o valor mensal de {formatCurrencyBRL(targetWithdrawal)} via Pró-Labore formal.
                </p>

                <div className="mt-4 space-y-2.5 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400 font-sans">Retirada Bruta:</span>
                    <span className="font-bold text-white">{formatCurrencyBRL(targetWithdrawal)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800 text-rose-400">
                    <span className="font-sans">(-) INSS Pessoa Física (11%):</span>
                    <span>-{formatCurrencyBRL(inssProLaboreA)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800 text-rose-400">
                    <span className="font-sans">(-) IRPF Tabela Progressiva (até 27,5%):</span>
                    <span>-{formatCurrencyBRL(irpfProLaboreA)}</span>
                  </div>
                  <div className="flex justify-between py-2 text-sm font-bold text-white bg-rose-950/40 px-2 rounded-lg">
                    <span className="font-sans">Líquido no Bolso do Sócio:</span>
                    <span>{formatCurrencyBRL(netInPocketA)}</span>
                  </div>
                  <div className="text-right text-[11px] text-rose-400 font-semibold">
                    Imposto Retido: {formatCurrencyBRL(totalTaxScenarioA)}/mês
                  </div>
                </div>
              </div>

              {/* Cenário Otimizado (Mínimo Pró-Labore + Lucro Isento) */}
              <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-900/60 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Cenário Vértice Auditor Fiscal Otimizado</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">Máxima Isenção</span>
                </div>
                <h4 className="text-base font-bold text-white mt-2">Pró-Labore Mínimo + Lucro Isento</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Pró-Labore de 1 salário mínimo ({formatCurrencyBRL(minWage)}) e o restante ({formatCurrencyBRL(optimizedProfitDistribution)}) em Distribuição de Lucros 100% Isenta.
                </p>

                <div className="mt-4 space-y-2.5 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400 font-sans">Retirada Bruta Total:</span>
                    <span className="font-bold text-white">{formatCurrencyBRL(targetWithdrawal)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                    <span className="font-sans">(-) INSS s/ Salário Mínimo (11%):</span>
                    <span className="text-rose-400 font-semibold">-{formatCurrencyBRL(inssProLaboreB)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800 text-emerald-400">
                    <span className="font-sans">(-) IRPF s/ Lucros Distribuídos:</span>
                    <span className="font-bold">R$ 0,00 (ISENTO)</span>
                  </div>
                  <div className="flex justify-between py-2 text-sm font-bold text-emerald-300 bg-emerald-950/40 px-2 rounded-lg">
                    <span className="font-sans">Líquido no Bolso do Sócio:</span>
                    <span>{formatCurrencyBRL(netInPocketB)}</span>
                  </div>
                  <div className="text-right text-[11px] text-emerald-400 font-bold">
                    Economia Mensal: +{formatCurrencyBRL(monthlyPartnerSavings)}
                  </div>
                </div>
              </div>

            </div>

            {/* Destaque Fator R */}
            {company.anexo === 'III' || company.anexo === 'V' ? (
              <div className="mt-6 p-4 rounded-xl bg-blue-950/30 border border-blue-900/60 flex items-start space-x-3 text-xs text-slate-300">
                <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-white">Vinculação Estratégica com o Fator R (Anexo III vs V)</h5>
                  <p className="text-slate-300 mt-1 leading-relaxed">
                    Como a sua empresa atua em serviços enquadráveis no Fator R, recomendamos fixar o Pró-Labore somado à folha CLT em exatamente <strong className="text-blue-400 font-bold">28% do RBT12</strong>. Isso garante a tributação reduzida pelo Anexo III (alíquota inicial de 6% contra 15,5% do Anexo V), distribuindo todo o excedente como lucros livres de IRPF!
                  </p>
                  {onNavigateToTab && (
                    <button
                      onClick={() => onNavigateToTab('fator_r')}
                      className="mt-2 text-blue-400 hover:text-blue-300 font-bold inline-flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Abrir Calculadora Específica do Fator R</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ) : null}

          </div>

        </div>
      )}

      {/* SUB-ABA 5: STRESS TEST & SENSIBILIDADE */}
      {activeSubTab === 'stresstest' && (
        <div className="space-y-6">
          
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-md">
            <div className="border-b border-slate-800 pb-4 mb-6">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Sliders className="w-4 h-4" />
                <span>Simulador de Resiliência Financeira</span>
              </span>
              <h3 className="text-lg font-bold text-white mt-1">
                Stress Test Financeiro & Choques de Mercado
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Simule como a lucratividade e o caixa da empresa reagem a variações bruscas de volume de vendas, inflação de fornecedores e aumentos de custos fixos.
              </p>
            </div>

            {/* Controles de Choques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              
              {/* Choque 1: Receita */}
              <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-300">Choque nas Vendas / Receita</label>
                  <span className={`text-xs font-mono font-bold ${stressRevenueVar >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {stressRevenueVar > 0 ? `+${stressRevenueVar}%` : `${stressRevenueVar}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="50"
                  step="5"
                  value={stressRevenueVar}
                  onChange={(e) => setStressRevenueVar(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>-30% (Crise)</span>
                  <span>0% (Atual)</span>
                  <span>+50% (Expansão)</span>
                </div>
              </div>

              {/* Choque 2: Custos de Insumos */}
              <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-300">Inflação de Insumos / CPV</label>
                  <span className={`text-xs font-mono font-bold ${stressCostsVar <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {stressCostsVar > 0 ? `+${stressCostsVar}%` : `${stressCostsVar}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-20"
                  max="30"
                  step="5"
                  value={stressCostsVar}
                  onChange={(e) => setStressCostsVar(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>-20% (Desconto)</span>
                  <span>0% (Atual)</span>
                  <span>+30% (Aumento)</span>
                </div>
              </div>

              {/* Choque 3: Custos Fixos */}
              <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-300">Aumento de Custos Fixos</label>
                  <span className={`text-xs font-mono font-bold ${stressFixedVar <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {stressFixedVar > 0 ? `+${stressFixedVar}%` : `${stressFixedVar}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-20"
                  max="30"
                  step="5"
                  value={stressFixedVar}
                  onChange={(e) => setStressFixedVar(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>-20% (Corte)</span>
                  <span>0% (Atual)</span>
                  <span>+30% (Expansão)</span>
                </div>
              </div>

            </div>

            {/* Painel de Resultados do Choque */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800">
                <span className="text-[11px] text-slate-400 font-semibold uppercase block">Nova Receita Bruta</span>
                <span className="text-lg font-black text-white font-mono mt-1 block">
                  {formatCurrencyBRL(stressRevenue)}
                </span>
                <span className={`text-[11px] font-mono ${stressRevenueVar >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {stressRevenueVar >= 0 ? `+${formatCurrencyBRL(stressRevenue - grossRevenue)}` : formatCurrencyBRL(stressRevenue - grossRevenue)}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800">
                <span className="text-[11px] text-slate-400 font-semibold uppercase block">Novo Lucro Líquido</span>
                <span className={`text-lg font-black font-mono mt-1 block ${stressNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatCurrencyBRL(stressNetProfit)}
                </span>
                <span className={`text-[11px] font-mono ${stressProfitDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {stressProfitDiff >= 0 ? `+${formatCurrencyBRL(stressProfitDiff)}` : formatCurrencyBRL(stressProfitDiff)} vs atual
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800">
                <span className="text-[11px] text-slate-400 font-semibold uppercase block">Nova Margem Líquida</span>
                <span className={`text-lg font-black font-mono mt-1 block ${stressNetMargin >= 10 ? 'text-emerald-400' : stressNetMargin >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {formatPercentBR(stressNetMargin)}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Anterior: {formatPercentBR(netMarginPercent)}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800">
                <span className="text-[11px] text-slate-400 font-semibold uppercase block">Variação Anual no Caixa</span>
                <span className={`text-lg font-black font-mono mt-1 block ${stressProfitDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {stressProfitDiff >= 0 ? `+${formatCurrencyBRL(stressProfitDiff * 12)}` : formatCurrencyBRL(stressProfitDiff * 12)}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Impacto em 12 meses
                </span>
              </div>

            </div>

            {/* Resumo Interpretativo */}
            <div className="mt-6 p-4 rounded-xl bg-[#0B0F19] border border-slate-800 text-xs text-slate-300">
              <span className="font-bold text-white block mb-1">Diagnóstico do Teste de Sensibilidade:</span>
              {stressNetProfit > 0 ? (
                <p>
                  A operação demonstra <strong className="text-emerald-400">alta resiliência financeira</strong>. Mesmo com o choque aplicado, a empresa mantém margem líquida positiva de <strong className="text-white">{formatPercentBR(stressNetMargin)}</strong>, gerando <strong className="text-emerald-400">{formatCurrencyBRL(stressNetProfit)}</strong> mensais para os sócios.
                </p>
              ) : (
                <p>
                  <strong className="text-rose-400">Alerta Crítico:</strong> Sob este cenário de estresse, a operação entra em déficit operacional de <strong className="text-rose-400">{formatCurrencyBRL(Math.abs(stressNetProfit))}</strong> por mês. Recomenda-se prévia renegociação de custos fixos ou criação de reserva de liquidez.
                </p>
              )}
            </div>

          </div>

        </div>
      )}

      {/* SUB-ABA: FLUXO DE CAIXA & BURN RATE */}
      {activeSubTab === 'fluxo_caixa' && (
        <div className="space-y-6">
          
          {/* Banner Explicativo Fluxo de Caixa & Burn Rate */}
          <div className="bg-[#0F172A] border border-blue-900/60 rounded-2xl p-5 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl shrink-0">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Projeção de Fluxo de Caixa Mensal & Burn Rate Corporativo</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                    Visão de Liquidez
                  </span>
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Monitore a geração líquida de caixa mês a mês e a velocidade de queima de recursos (<strong className="text-white">Burn Rate</strong>) discriminada entre despesas fixas (estruturais) e variáveis (operacionais e tributárias), calculando o <strong className="text-emerald-400">Runway</strong> de sustentabilidade da empresa.
                </p>
              </div>
            </div>
          </div>

          {/* Gráfico 1: Projeção de Fluxo de Caixa Mensal (Recharts ComposedChart) */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <span>Projeção de Fluxo de Caixa Mensal (12 Meses)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Entradas de receitas vs. Saídas totais e evolução do saldo acumulado de caixa
                </p>
              </div>
              <div className="flex items-center gap-2 bg-[#0B0F19] px-3 py-2 rounded-xl border border-slate-800 text-xs font-mono">
                <span className="text-slate-400">Saldo Final 12M:</span>
                <span className="font-bold text-emerald-400">
                  {formatCurrencyBRL(cashFlowProjectionData[cashFlowProjectionData.length - 1]?.saldoAcumulado || 0)}
                </span>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={cashFlowProjectionData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="month" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                  <YAxis stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 11 }} tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(val: any, name: any) => [
                      formatCurrencyBRL(Number(val)),
                      name === 'entradas' ? 'Entradas (Receitas)' : name === 'saidas' ? 'Saídas Totais' : name === 'fluxoLiquido' ? 'Fluxo Líquido Mensal' : 'Saldo Acumulado'
                    ]}
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px', color: '#F8FAFC', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} formatter={(val) => <span className="text-slate-300 font-medium">{val}</span>} />
                  <Bar dataKey="entradas" name="Entradas (Receitas)" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  <Bar dataKey="saidas" name="Saídas Totais" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  <Line type="monotone" dataKey="saldoAcumulado" name="Saldo Acumulado em Caixa" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico 2: Burn Rate Comparativo (Despesas Fixas vs Variáveis) */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-amber-400" />
                  <span>Gráfico de 'Burn Rate' Comparativo (Despesas Fixas vs. Variáveis)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Velocidade de consumo de caixa discriminada entre estrutura fixa e custos variáveis
                </p>
              </div>
              <div className="flex items-center gap-2 bg-[#0B0F19] px-3 py-2 rounded-xl border border-slate-800 text-xs font-mono">
                <span className="text-slate-400">Burn Rate Médio:</span>
                <span className="font-bold text-amber-400">
                  {formatCurrencyBRL(burnRateComparisonData.reduce((acc, i) => acc + i.totalBurnRate, 0) / 12)} / mês
                </span>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={burnRateComparisonData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="month" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                  <YAxis stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 11 }} tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(val: any, name: any) => [
                      formatCurrencyBRL(Number(val)),
                      name === 'despesasFixas' ? 'Despesas Fixas (Burn Fixo)' : 'Despesas Variáveis (Burn Variável)'
                    ]}
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px', color: '#F8FAFC', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} formatter={(val) => <span className="text-slate-300 font-medium">{val}</span>} />
                  <Bar dataKey="despesasFixas" name="Despesas Fixas (Burn Fixo)" fill="#8b5cf6" stackId="burn" radius={[0, 0, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="despesasVariaveis" name="Despesas Variáveis (Burn Variável)" fill="#f97316" stackId="burn" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Cards de Métricas de Burn Rate */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[11px] uppercase font-bold text-slate-400 block">Burn Rate Fixo Mensal</span>
                <div className="text-lg font-bold font-mono text-purple-400">
                  {formatCurrencyBRL(fixedCostsTotal)}
                </div>
                <span className="text-[10px] text-slate-400 block">Folha, Pró-Labore & Despesas Operacionais Fixas</span>
              </div>

              <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[11px] uppercase font-bold text-slate-400 block">Burn Rate Variável Médio</span>
                <div className="text-lg font-bold font-mono text-orange-400">
                  {formatCurrencyBRL((grossRevenue * (inputCostsPercent / 100)) + taxOnSales)}
                </div>
                <span className="text-[10px] text-slate-400 block">CPV, Insumos & Tributos s/ Faturamento</span>
              </div>

              <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[11px] uppercase font-bold text-slate-400 block">Runway Estimado (Reserva R$ 150k)</span>
                <div className="text-lg font-bold font-mono text-emerald-400">
                  {burnRateComparisonData[0]?.runwayMeses || 0} Meses
                </div>
                <span className="text-[10px] text-slate-400 block">Autonomia financeira sem novas entradas</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Modal de Emissão do Relatório Financeiro Oficial A4 */}
      <ReportViewerModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reportType="financeiro"
        company={company}
        calculation={calculation}
      />

      {/* Modal Especializado de Exportação em PDF de Faturamento e Extrato Financeiro */}
      <FinancialReportExportModal
        isOpen={isPdfExportModalOpen}
        onClose={() => setIsPdfExportModalOpen(false)}
        company={company}
        calculation={calculation}
        defaultReportType={pdfReportType}
      />

    </div>
  );
};
