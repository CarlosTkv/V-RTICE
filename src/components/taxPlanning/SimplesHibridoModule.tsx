import React, { useState, useMemo, useEffect } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  TrendingUp,
  Scale,
  Building2,
  Users,
  Percent,
  Copy,
  Printer,
  FileText,
  AlertTriangle,
  ArrowRight,
  Info,
  DollarSign,
  Briefcase,
  Layers,
  Sparkles,
  ShoppingBag,
  Sliders,
  Award,
  BarChart2,
  BarChart3,
  PieChart as PieChartIcon,
  Download,
  Activity,
  ArrowUpRight,
  Check,
  Share2,
  BookOpen,
  Save,
  Database,
  Calculator,
  Compass,
  TrendingDown,
  Lock,
  Unlock,
  ChevronRight,
  ArrowDownRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
} from 'recharts';
import { CompanyData, SimplesAnexo, CalculationResult } from '../../types';
import {
  calculateSimplesHibridoComparison,
  SimplesHibridoInput,
  SimplesHibridoResult,
} from '../../utils/simplesHibridoEngine';
import { SimplesHibridoReportModal, SimplesHibridoReportMode } from './SimplesHibridoReportModal';
import { SimplesHibridoShareModal } from './SimplesHibridoShareModal';
import { SimplesHibridoManualModal } from './SimplesHibridoManualModal';

interface SimplesHibridoModuleProps {
  company: CompanyData;
  onChangeCompany?: (updated: CompanyData) => void;
  calculation?: CalculationResult;
  onNavigateToTab?: (tab: any) => void;
  onOpenClientMode?: () => void;
}

export const SimplesHibridoModule: React.FC<SimplesHibridoModuleProps> = ({
  company,
  onChangeCompany,
  calculation,
  onNavigateToTab,
  onOpenClientMode,
}) => {
  // Estado interativo de simulação
  const [selectedAnexo, setSelectedAnexo] = useState<SimplesAnexo>(company.anexo || 'I');
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(
    company.monthlyRevenue || (company.rbt12 ? company.rbt12 / 12 : 100000)
  );
  const [rbt12Input, setRbt12Input] = useState<number>(
    company.rbt12 || (company.monthlyRevenue ? company.monthlyRevenue * 12 : 1200000)
  );
  const [payroll12mInput, setPayroll12mInput] = useState<number>(
    company.payroll12m || (company.monthlyPayroll ? company.monthlyPayroll * 12 : 360000)
  );
  const [inputCostsPercent, setInputCostsPercent] = useState<number>(
    company.inputCostsPercent ?? 35
  );
  const [simplesSupplierPercent, setSimplesSupplierPercent] = useState<number>(
    company.simplesSupplierPercent ?? 40
  );
  const [b2bSalesPercent, setB2bSalesPercent] = useState<number>(
    company.b2bSalesPercent ?? 60
  );
  const [targetIvaRate, setTargetIvaRate] = useState<number>(
    company.targetIvaRate ?? 26.5
  );
  const [isRbt12Locked, setIsRbt12Locked] = useState<boolean>(true);
  const [reportModeForModal, setReportModeForModal] = useState<SimplesHibridoReportMode>('parecer_unificado');
  const [activeTab, setActiveTab] = useState<'cockpit' | 'graficos' | 'cenarios' | 'partilha' | 'parecer'>('cockpit');
  const [chartSubTab, setChartSubTab] = useState<'regimes' | 'breakeven' | 'b2b_credit' | 'decomposicao' | 'carteira'>('regimes');
  const [chartHorizon, setChartHorizon] = useState<'anual' | 'mensal'>('anual');
  const [copiedToast, setCopiedToast] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<boolean>(false);
  const [isOfficialReportModalOpen, setIsOfficialReportModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);

  // Sincronização automática quando a empresa ativa for alterada no cabeçalho ou cadastrada
  useEffect(() => {
    setSelectedAnexo(company.anexo || 'I');
    const rev = company.monthlyRevenue || (company.rbt12 ? company.rbt12 / 12 : 100000);
    setMonthlyRevenue(rev);
    setRbt12Input(company.rbt12 || rev * 12);
    setPayroll12mInput(company.payroll12m || (company.monthlyPayroll ? company.monthlyPayroll * 12 : 360000));
    setInputCostsPercent(company.inputCostsPercent ?? 35);
    setSimplesSupplierPercent(company.simplesSupplierPercent ?? 40);
    setB2bSalesPercent(company.b2bSalesPercent ?? 60);
    setTargetIvaRate(company.targetIvaRate ?? 26.5);
  }, [
    company.id,
    company.cnpj,
    company.name,
    company.anexo,
    company.rbt12,
    company.monthlyRevenue,
    company.payroll12m,
    company.monthlyPayroll,
    company.inputCostsPercent,
    company.simplesSupplierPercent,
    company.b2bSalesPercent,
    company.targetIvaRate,
  ]);

  // Persistir premissas ajustadas diretamente no cadastro da empresa
  const handleSaveToCompanyRegistry = () => {
    if (onChangeCompany) {
      onChangeCompany({
        ...company,
        anexo: selectedAnexo,
        monthlyRevenue,
        rbt12: rbt12Input,
        rba: rbt12Input,
        payroll12m: payroll12mInput,
        monthlyPayroll: payroll12mInput / 12,
        inputCostsPercent,
        simplesSupplierPercent,
        b2bSalesPercent,
        targetIvaRate,
      });
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 3000);
    }
  };

  const handleMonthlyRevenueChange = (val: number) => {
    setMonthlyRevenue(val);
    if (isRbt12Locked) {
      setRbt12Input(val * 12);
    }
  };

  const handleOpenReportModal = (mode: SimplesHibridoReportMode = 'parecer_unificado') => {
    setReportModeForModal(mode);
    setIsOfficialReportModalOpen(true);
  };

  // Custo de insumos em R$ mensal
  const inputCostsMonthly = useMemo(() => {
    return monthlyRevenue * (inputCostsPercent / 100);
  }, [monthlyRevenue, inputCostsPercent]);

  // Executa o motor analítico do Simples Híbrido com as premissas atuais
  const comparisonResult: SimplesHibridoResult = useMemo(() => {
    const input: SimplesHibridoInput = {
      company,
      anexoSelected: selectedAnexo,
      rbt12: rbt12Input,
      monthlyRevenue,
      payroll12m: payroll12mInput,
      monthlyPayroll: payroll12mInput / 12,
      inputCostsMonthly,
      simplesSupplierPercent,
      generalSupplierPercent: 100 - simplesSupplierPercent,
      b2bSalesPercent,
      targetIvaRate,
    };
    return calculateSimplesHibridoComparison(input);
  }, [
    company,
    selectedAnexo,
    rbt12Input,
    monthlyRevenue,
    payroll12mInput,
    inputCostsMonthly,
    simplesSupplierPercent,
    b2bSalesPercent,
    targetIvaRate,
  ]);

  const {
    trava01Sublimite,
    trava02FatorR,
    trava03CreditoEntrada,
    partition,
    standardEffectiveRate,
    reducedDasRate,
    reducedDasMonthly,
    reducedDasAnnual,
    cenarioA_Financeiro,
    cenarioB_Comercial,
    sensitivityAndBreakEven,
    technicalOpinion,
    effectiveAnexo,
  } = comparisonResult;

  // Função para copiar parecer formatado
  const handleCopyOpinion = () => {
    navigator.clipboard.writeText(technicalOpinion.rawFormattedMarkdown);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 3000);
  };

  const formatBRL = (val: number) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // 1. DADOS DE GRÁFICO: Comparativo de 4 Regimes (Anual e Mensal)
  const isAnual = chartHorizon === 'anual';
  const multiplier = isAnual ? 1 : 1 / 12;

  const regimesComparisonChartData = useMemo(() => {
    return [
      {
        name: 'Simples Tradicional',
        shortName: 'Tradicional',
        valorTributo: isAnual ? cenarioA_Financeiro.tradicionalAnnualTax : cenarioA_Financeiro.tradicionalMonthlyTax,
        aliquotaEfetiva: cenarioA_Financeiro.tradicionalEffectiveRate,
        fill: '#10B981', // Emerald
      },
      {
        name: 'Simples Híbrido',
        shortName: 'Híbrido',
        valorTributo: isAnual ? cenarioA_Financeiro.hibridoTotalAnnualTax : cenarioA_Financeiro.hibridoTotalMonthlyTax,
        aliquotaEfetiva: cenarioA_Financeiro.hibridoEffectiveRate,
        fill: '#6366F1', // Indigo
      },
      {
        name: 'Lucro Presumido',
        shortName: 'Presumido',
        valorTributo: (calculation?.lucroPresumidoAnnualTax || (monthlyRevenue * 12 * 0.1633)) * multiplier,
        aliquotaEfetiva: calculation?.lucroPresumidoEffectiveRate || 16.33,
        fill: '#0284C7', // Sky
      },
      {
        name: 'Lucro Real',
        shortName: 'Real',
        valorTributo: (calculation?.lucroRealAnnualTax || (monthlyRevenue * 12 * 0.24)) * multiplier,
        aliquotaEfetiva: calculation?.lucroRealEffectiveRate || 24.0,
        fill: '#D97706', // Amber
      },
    ];
  }, [cenarioA_Financeiro, calculation, isAnual, multiplier, monthlyRevenue]);

  // 2. DADOS DE GRÁFICO: Curva de Break-Even de Insumos (0% a 70%)
  const breakEvenCurveData = useMemo(() => {
    const points: Array<{ inputPercent: number; inputLabel: string; hibridoRate: number; tradicionalRate: number; diff: number }> = [];
    const testPercents = [0, 10, 20, 30, 40, 50, 60, 70];
    
    const allPercents = Array.from(new Set([
      ...testPercents,
      Math.round(sensitivityAndBreakEven.currentInputPercent),
      Math.round(sensitivityAndBreakEven.inputBreakEvenPercent)
    ])).filter(p => p >= 0 && p <= 75).sort((a, b) => a - b);

    for (const p of allPercents) {
      const simInputMonthly = monthlyRevenue * (p / 100);
      const simCreditRate = ((simplesSupplierPercent / 100) * (trava03CreditoEntrada.simplesSupplierCreditRate / 100)) +
                            (((100 - simplesSupplierPercent) / 100) * (targetIvaRate / 100));
      const simCredit = simInputMonthly * simCreditRate;
      const simGrossIva = monthlyRevenue * (targetIvaRate / 100);
      const simNetIva = Math.max(0, simGrossIva - simCredit);
      const simTotalTax = reducedDasMonthly + simNetIva + (effectiveAnexo === 'IV' ? cenarioA_Financeiro.tradicionalCppAmount : 0);
      const simEffectiveRate = monthlyRevenue > 0 ? (simTotalTax / monthlyRevenue) * 100 : 0;

      points.push({
        inputPercent: p,
        inputLabel: `${p}%`,
        hibridoRate: Number(simEffectiveRate.toFixed(2)),
        tradicionalRate: Number(cenarioA_Financeiro.tradicionalEffectiveRate.toFixed(2)),
        diff: Number((simEffectiveRate - cenarioA_Financeiro.tradicionalEffectiveRate).toFixed(2)),
      });
    }

    return points;
  }, [
    monthlyRevenue,
    simplesSupplierPercent,
    targetIvaRate,
    reducedDasMonthly,
    effectiveAnexo,
    cenarioA_Financeiro,
    sensitivityAndBreakEven,
    trava03CreditoEntrada
  ]);

  // 3. DADOS DE GRÁFICO: Atratividade Comercial e Crédito Transferido B2B
  const b2bCreditComparisonData = useMemo(() => {
    return [
      {
        name: 'Venda de R$ 1.000',
        regime: 'Simples Tradicional',
        creditoComprador: Number((cenarioB_Comercial.tradicionalB2bCreditRate * 10).toFixed(1)),
        custoLiquidoComprador: Number(((100 - cenarioB_Comercial.tradicionalB2bCreditRate) * 10).toFixed(1)),
      },
      {
        name: 'Venda de R$ 1.000',
        regime: 'Simples Híbrido',
        creditoComprador: Number((cenarioB_Comercial.hibridoB2bCreditRate * 10).toFixed(1)),
        custoLiquidoComprador: Number(((100 - cenarioB_Comercial.hibridoB2bCreditRate) * 10).toFixed(1)),
      },
    ];
  }, [cenarioB_Comercial]);

  // 4. DADOS DE GRÁFICO: Decomposição da Guia & Composição do Simples Híbrido
  const hibridoTaxPieData = useMemo(() => {
    return [
      { name: 'DAS Reduzido (IRPJ/CSLL/CPP)', value: Math.round(reducedDasMonthly), color: '#3B82F6' },
      { name: 'IBS Líquido (Estadual/Municipal)', value: Math.round(cenarioA_Financeiro.hibridoNetIbsCbsPayableMonthly * (17.7 / 26.5)), color: '#6366F1' },
      { name: 'CBS Líquida (Federal)', value: Math.round(cenarioA_Financeiro.hibridoNetIbsCbsPayableMonthly * (8.8 / 26.5)), color: '#8B5CF6' },
      ...(effectiveAnexo === 'IV' ? [{ name: 'CPP DCTFWeb (Anexo IV)', value: Math.round(cenarioA_Financeiro.tradicionalCppAmount), color: '#F59E0B' }] : []),
    ].filter(d => d.value > 0);
  }, [reducedDasMonthly, cenarioA_Financeiro, effectiveAnexo]);

  // 5. DADOS DE GRÁFICO: Divisão da Carteira B2B vs B2C
  const b2bPortfolioPieData = useMemo(() => {
    return [
      { name: `B2B Corporativo (${cenarioB_Comercial.b2bSalesPercent.toFixed(0)}%)`, value: Math.round(cenarioB_Comercial.b2bRevenueMonthly), color: '#6366F1' },
      { name: `B2C Consumidor Final (${cenarioB_Comercial.b2cSalesPercent.toFixed(0)}%)`, value: Math.round(cenarioB_Comercial.b2cRevenueMonthly), color: '#F59E0B' },
    ];
  }, [cenarioB_Comercial]);

  // Mini Gráficos dos Cards de Confronto
  const chartDataFinancial = [
    {
      name: 'Simples Trad.',
      'Total Tributos': cenarioA_Financeiro.tradicionalMonthlyTax,
      fill: '#10b981',
    },
    {
      name: 'Simples Híbrido',
      'Total Tributos': cenarioA_Financeiro.hibridoTotalMonthlyTax,
      fill: '#6366f1',
    },
  ];

  const chartDataB2B = [
    {
      name: 'Tradicional',
      'Crédito Comprador': (1000 * (cenarioB_Comercial.tradicionalB2bCreditRate / 100)),
      'Custo Líquido': 1000 - (1000 * (cenarioB_Comercial.tradicionalB2bCreditRate / 100)),
    },
    {
      name: 'Híbrido (26,5%)',
      'Crédito Comprador': (1000 * (cenarioB_Comercial.hibridoB2bCreditRate / 100)),
      'Custo Líquido': 1000 - (1000 * (cenarioB_Comercial.hibridoB2bCreditRate / 100)),
    },
  ];

  return (
    <div id="simples-hibrido-module" className="space-y-6 w-full max-w-[1720px] mx-auto pb-16 px-1 sm:px-2">
      {/* =========================================================================
          HEADER PRINCIPAL COM IDENTIFICAÇÃO E AÇÕES RÁPIDAS
          ========================================================================= */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-800/40 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Reforma Tributária • EC 132/2023 & LC 214/2025
              </span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                Anexo {effectiveAnexo} • {company.name || 'Empresa em Análise'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <Scale className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-400" />
              Simples Nacional Tradicional x Simples Híbrido
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-4xl leading-relaxed">
              Cockpit pericial de segregação do <strong>DAS Reduzido (IRPJ, CSLL e CPP)</strong> versus apuração não-cumulativa do <strong>IBS e CBS por fora</strong>, com modelagem de fluxo de caixa e atratividade comercial B2B.
            </p>
          </div>

          {/* BOTÕES DE AÇÃO */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              type="button"
              onClick={() => setIsManualModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-indigo-300 border border-indigo-900/60 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
              title="Abre o Manual Operacional e Doutrinário específico deste módulo"
            >
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Manual</span>
            </button>
            <button
              type="button"
              onClick={handleSaveToCompanyRegistry}
              className="px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-emerald-300 border border-emerald-900/60 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
              title="Salva as premissas atuais no cadastro permanente da empresa"
            >
              {saveToast ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4 text-emerald-400" />}
              <span>{saveToast ? 'Salvo!' : 'Salvar no Cadastro'}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-md shadow-purple-950/40 cursor-pointer"
              title="Gera links de acesso direto, WhatsApp e credencial exclusiva para o cliente"
            >
              <Share2 className="w-4 h-4" />
              <span>Liberar Cliente</span>
            </button>
            <button
              type="button"
              onClick={handleCopyOpinion}
              className="px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition shadow-sm cursor-pointer"
              title="Copiar Parecer Técnico Formatado"
            >
              {copiedToast ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-indigo-400" />}
              <span>{copiedToast ? 'Copiado!' : 'Copiar'}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsOfficialReportModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold flex items-center gap-2 transition shadow-lg shadow-emerald-950/40 cursor-pointer"
              title="Abre o Parecer Técnico Pericial em padrão A4 pronto para impressão e download de PDF oficial"
            >
              <Printer className="w-4 h-4" />
              <span>Emitir Parecer Oficial A4</span>
            </button>
          </div>
        </div>

        {/* NAVEGAÇÃO POR ABAS DO MÓDULO */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-800/80 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('cockpit')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'cockpit'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Cockpit Interativo & Travas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('graficos')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'graficos'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-indigo-300" />
            Gráficos & Análises Visuais
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cenarios')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'cenarios'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Matriz de Cenários (Caixa vs B2B)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('partilha')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'partilha'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Decomposição do DAS ({effectiveAnexo})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('parecer')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'parecer'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            Parecer Técnico Estruturado
          </button>
        </div>
      </div>

      {/* =========================================================================
          HUD EXECUTIVO SUPERIOR: 4 PLACAS DE CONFRONTO EM TEMPO REAL
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* CARD 1: SIMPLES TRADICIONAL */}
        <div className="p-4 rounded-2xl border bg-slate-900/90 border-slate-800 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Simples Tradicional
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Guia Única DAS
              </span>
            </div>
            <div className="pt-2">
              <div className="text-2xl font-black font-mono text-emerald-400">
                {formatBRL(cenarioA_Financeiro.tradicionalMonthlyTax)}
                <span className="text-xs font-normal text-slate-400">/mês</span>
              </div>
              <div className="text-xs text-slate-300 font-medium mt-0.5">
                Alíquota Efetiva: <strong className="text-emerald-400 font-mono">{cenarioA_Financeiro.tradicionalEffectiveRate.toFixed(2)}%</strong>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between items-center mt-3">
            <span>Custo Anual:</span>
            <span className="font-mono font-bold text-white">{formatBRL(cenarioA_Financeiro.tradicionalAnnualTax)}</span>
          </div>
        </div>

        {/* CARD 2: SIMPLES HÍBRIDO CONSOLIDADO */}
        <div className="p-4 rounded-2xl border bg-slate-900/90 border-slate-800 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-indigo-400" />
                Simples Híbrido
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                DAS + IBS/CBS
              </span>
            </div>
            <div className="pt-2">
              <div className="text-2xl font-black font-mono text-indigo-300">
                {formatBRL(cenarioA_Financeiro.hibridoTotalMonthlyTax)}
                <span className="text-xs font-normal text-slate-400">/mês</span>
              </div>
              <div className="text-xs text-slate-300 font-medium mt-0.5">
                Alíquota Efetiva: <strong className="text-indigo-300 font-mono">{cenarioA_Financeiro.hibridoEffectiveRate.toFixed(2)}%</strong>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between items-center mt-3">
            <span>DAS Reduzido:</span>
            <span className="font-mono font-bold text-slate-200">{formatBRL(reducedDasMonthly)} ({reducedDasRate.toFixed(2)}%)</span>
          </div>
        </div>

        {/* CARD 3: DELTA DE CAIXA (ECONOMIA / CUSTO EXTRA) */}
        <div className={`p-4 rounded-2xl border shadow-lg relative overflow-hidden flex flex-col justify-between ${
          cenarioA_Financeiro.cheaperRegime === 'tradicional'
            ? 'bg-emerald-950/20 border-emerald-500/40'
            : 'bg-indigo-950/20 border-indigo-500/40'
        }`}>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                Impacto no Fluxo de Caixa
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                cenarioA_Financeiro.cheaperRegime === 'tradicional'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              }`}>
                {cenarioA_Financeiro.cheaperRegime === 'tradicional' ? 'Tradicional Vence' : 'Híbrido Vence'}
              </span>
            </div>
            <div className="pt-2">
              <div className="text-2xl font-black font-mono text-white">
                {formatBRL(cenarioA_Financeiro.monthlyDelta)}
                <span className="text-xs font-normal text-slate-300">/mês</span>
              </div>
              <div className="text-xs text-slate-300 font-medium mt-0.5">
                {cenarioA_Financeiro.cheaperRegime === 'tradicional'
                  ? 'Diferença favorável ao Simples Tradicional'
                  : 'Economia financeira direta no Híbrido'}
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between items-center mt-3">
            <span>Diferença Anual:</span>
            <span className="font-mono font-bold text-amber-300">{formatBRL(cenarioA_Financeiro.annualDelta)}/ano</span>
          </div>
        </div>

        {/* CARD 4: ATRATIVIDADE COMERCIAL B2B */}
        <div className="p-4 rounded-2xl border bg-slate-900/90 border-slate-800 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-indigo-400" />
                Mercado B2B ({b2bSalesPercent}%)
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Crédito Integral
              </span>
            </div>
            <div className="pt-2">
              <div className="text-2xl font-black font-mono text-indigo-400">
                +{targetIvaRate.toFixed(1)}%
                <span className="text-xs font-normal text-slate-400"> de crédito PJ</span>
              </div>
              <div className="text-xs text-slate-300 font-medium mt-0.5">
                Ganho Clientes PJ: <strong className="text-emerald-400 font-mono">+{formatBRL(cenarioB_Comercial.buyerSavingsMonthlyInHibrido)}/mês</strong>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between items-center mt-3">
            <span>Custo Líquido Comprador:</span>
            <span className="font-mono font-bold text-emerald-400">{cenarioB_Comercial.hibridoB2bEffectiveNetCostPercent.toFixed(1)}% do preço</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ABA PRINCIPAL: COCKPIT INTERATIVO & TRAVAS DECISÓRIAS
          ========================================================================= */}
      {activeTab === 'cockpit' && (
        <div className="space-y-6">
          {/* GRID PRINCIPAL: 12 COLUNAS WIDESCREEN */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* -------------------------------------------------------------
                COLUNA ESQUERDA (5 COLUNAS): PARÂMETROS, ANEXOS & CONTROLES
                ------------------------------------------------------------- */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-4">
              {/* PRESETS DE SIMULAÇÃO RÁPIDA */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    Perfis Rápidos de Simulação
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAnexo('I');
                      setB2bSalesPercent(20);
                      setInputCostsPercent(45);
                      setSimplesSupplierPercent(35);
                    }}
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-[11px] font-medium border border-slate-700/80 text-left transition cursor-pointer"
                  >
                    🛍️ Comércio Varejo
                    <div className="text-[9px] text-slate-400">Anexo I • 80% B2C</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAnexo('III');
                      setB2bSalesPercent(90);
                      setInputCostsPercent(10);
                      setSimplesSupplierPercent(20);
                    }}
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-[11px] font-medium border border-slate-700/80 text-left transition cursor-pointer"
                  >
                    💻 Tech & Serviços B2B
                    <div className="text-[9px] text-slate-400">Anexo III • 90% B2B</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAnexo('II');
                      setB2bSalesPercent(85);
                      setInputCostsPercent(60);
                      setSimplesSupplierPercent(15);
                    }}
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-[11px] font-medium border border-slate-700/80 text-left transition cursor-pointer"
                  >
                    🏭 Indústria Produtora
                    <div className="text-[9px] text-slate-400">Anexo II • 60% Insumos</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAnexo('V');
                      setB2bSalesPercent(75);
                      setInputCostsPercent(8);
                      setSimplesSupplierPercent(10);
                    }}
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-[11px] font-medium border border-slate-700/80 text-left transition cursor-pointer"
                  >
                    ⚖️ Intelectual / Anexo V
                    <div className="text-[9px] text-slate-400">Fator R • Pouco Insumo</div>
                  </button>
                </div>
              </div>

              {/* SELETOR DOS 5 ANEXOS */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-2.5">
                <label className="block text-xs font-bold text-white uppercase tracking-wider">
                  Enquadramento no Simples Nacional:
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { key: 'I', label: 'Anexo I - Comércio', desc: 'Comércio em geral • Expurga PIS/COFINS e ICMS' },
                    { key: 'II', label: 'Anexo II - Indústria', desc: 'Indústria • Expurga PIS/COFINS, ICMS e IPI' },
                    { key: 'III', label: 'Anexo III - Serviços', desc: 'Serviços gerais ou Fator R ≥ 28% • Expurga ISS' },
                    { key: 'IV', label: 'Anexo IV - Serviços Especiais', desc: 'Advocacia, Construção, Limpeza • CPP fora na DCTFWeb' },
                    { key: 'V', label: 'Anexo V - Intelectual & Tech', desc: 'Serviços Intelectuais • Sujeito à regra do Fator R' },
                  ].map((anx) => (
                    <button
                      key={anx.key}
                      onClick={() => setSelectedAnexo(anx.key as SimplesAnexo)}
                      className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                        selectedAnexo === anx.key
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                          : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-indigo-300 font-mono">[{anx.key}]</span>
                          <span className="text-xs font-bold text-white">{anx.label}</span>
                        </div>
                        <p className="text-[10px] text-slate-400">{anx.desc}</p>
                      </div>
                      {selectedAnexo === anx.key && (
                        <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 ml-2" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* SLIDERS E INPUTS INTERATIVOS EM VALORES REAIS (R$) */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                    Cockpit de Parâmetros em Valores Reais (R$)
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Sincronização em Tempo Real
                  </span>
                </div>

                {/* Faturamento Mensal (R$) */}
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-semibold text-slate-300">Faturamento Mensal (R$):</label>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-mono text-slate-400">R$</span>
                      <input
                        type="number"
                        min={0}
                        step={1000}
                        value={monthlyRevenue}
                        onChange={(e) => handleMonthlyRevenueChange(Math.max(0, Number(e.target.value)))}
                        className="w-32 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono font-bold text-emerald-400 text-right focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={10000}
                    max={500000}
                    step={5000}
                    value={monthlyRevenue}
                    onChange={(e) => handleMonthlyRevenueChange(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Faturamento Anualizado (12x):</span>
                    <span className="font-bold text-emerald-300">{formatBRL(monthlyRevenue * 12)}</span>
                  </div>
                </div>

                {/* RBT12 Acumulado (R$) & Trava de Vinculação */}
                <div className="space-y-2 p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <label className="text-xs font-semibold text-slate-300">RBT12 Acumulado (12 Meses):</label>
                      <button
                        type="button"
                        onClick={() => {
                          const nextLock = !isRbt12Locked;
                          setIsRbt12Locked(nextLock);
                          if (nextLock) {
                            setRbt12Input(monthlyRevenue * 12);
                          }
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                          isRbt12Locked
                            ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/50'
                            : 'bg-amber-600/30 text-amber-300 border border-amber-500/30 hover:bg-amber-600/50'
                        }`}
                        title={isRbt12Locked ? "Trava Ativa: RBT12 = 12x Faturamento Mensal. Clique para desacoplar e editar RBT12 manualmente em R$." : "Desacoplado: Digite qualquer valor real de RBT12 em R$. Clique para relancar ao Faturamento 12x."}
                      >
                        {isRbt12Locked ? '🔒 Vinculado (12x)' : '🔓 Customizado (R$)'}
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-mono text-slate-400">R$</span>
                      <input
                        type="number"
                        min={0}
                        step={10000}
                        value={rbt12Input}
                        disabled={isRbt12Locked}
                        onChange={(e) => setRbt12Input(Math.max(0, Number(e.target.value)))}
                        className={`w-32 px-2 py-1 bg-slate-900 border rounded text-xs font-mono font-bold text-right focus:outline-none ${
                          isRbt12Locked 
                            ? 'border-slate-800 text-indigo-300 opacity-80 cursor-not-allowed' 
                            : 'border-amber-500/60 text-amber-300 focus:border-amber-400'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Informações de Faixa do Anexo */}
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-700/80 text-[10.5px] text-slate-300 space-y-1 font-mono">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Faixa do Anexo {selectedAnexo}:</span>
                      <span className="font-bold text-indigo-300">Alíq. Nominal: {comparisonResult.nominalRate.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400">Parcela a Deduzir: {formatBRL(comparisonResult.deduction)}</span>
                      <span className="font-bold text-emerald-400">Alíq. Efetiva Padrão: {comparisonResult.standardEffectiveRate.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>

                {/* Folha de Pagamento 12m & Mensal (R$) */}
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-semibold text-slate-300">Folha + Pró-Labore (12m em R$):</label>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-mono text-slate-400">R$</span>
                      <input
                        type="number"
                        min={0}
                        step={5000}
                        value={payroll12mInput}
                        onChange={(e) => setPayroll12mInput(Math.max(0, Number(e.target.value)))}
                        className="w-32 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono font-bold text-indigo-300 text-right focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(100000, rbt12Input * 0.6)}
                    step={10000}
                    value={payroll12mInput}
                    onChange={(e) => setPayroll12mInput(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Folha Mensal: {formatBRL(payroll12mInput / 12)}/mês</span>
                    <span className={`font-bold ${trava02FatorR.fatorRActive ? 'text-emerald-400' : 'text-amber-400'}`}>
                      Fator R: {trava02FatorR.fatorR.toFixed(1)}% {trava02FatorR.fatorRActive ? '(Anexo III)' : '(Anexo V)'}
                    </span>
                  </div>
                </div>

                {/* Compras de Insumos Mensais em R$ e % */}
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-semibold text-slate-300">Compras de Insumos Mensais (R$):</label>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-mono text-slate-400">R$</span>
                      <input
                        type="number"
                        min={0}
                        step={1000}
                        value={Math.round(inputCostsMonthly)}
                        onChange={(e) => {
                          const r$Val = Math.max(0, Number(e.target.value));
                          if (monthlyRevenue > 0) {
                            setInputCostsPercent(Number(Math.min(95, (r$Val / monthlyRevenue) * 100).toFixed(2)));
                          }
                        }}
                        className="w-32 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono font-bold text-blue-400 text-right focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={85}
                    step={1}
                    value={inputCostsPercent}
                    onChange={(e) => setInputCostsPercent(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Equivalente em %: <strong className="text-blue-300">{inputCostsPercent.toFixed(1)}%</strong> da Receita</span>
                    <span>Crédito Entradas: <strong className="text-emerald-400">{formatBRL(trava03CreditoEntrada.totalIbsCbsInputCreditMonthly)}/mês</strong></span>
                  </div>
                </div>

                {/* Fornecedores do Simples vs Geral em R$ */}
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-semibold text-slate-300">Fornecedores no Simples (R$):</label>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-mono text-slate-400">R$</span>
                      <input
                        type="number"
                        min={0}
                        step={1000}
                        value={Math.round(trava03CreditoEntrada.simplesSupplierPurchases)}
                        onChange={(e) => {
                          const r$Val = Math.max(0, Number(e.target.value));
                          if (inputCostsMonthly > 0) {
                            setSimplesSupplierPercent(Number(Math.min(100, (r$Val / inputCostsMonthly) * 100).toFixed(0)));
                          }
                        }}
                        className="w-32 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono font-bold text-amber-400 text-right focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={simplesSupplierPercent}
                    onChange={(e) => setSimplesSupplierPercent(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Simples ({simplesSupplierPercent}%): <strong className="text-amber-300">{formatBRL(trava03CreditoEntrada.simplesSupplierPurchases)}</strong></span>
                    <span>Regime Geral ({100 - simplesSupplierPercent}%): <strong className="text-emerald-400">{formatBRL(trava03CreditoEntrada.generalSupplierPurchases)}</strong></span>
                  </div>
                </div>

                {/* Vendas B2B Corporativas em R$ */}
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-semibold text-slate-300">Vendas B2B Corporativas (R$):</label>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-mono text-slate-400">R$</span>
                      <input
                        type="number"
                        min={0}
                        step={1000}
                        value={Math.round(cenarioB_Comercial.b2bRevenueMonthly)}
                        onChange={(e) => {
                          const r$Val = Math.max(0, Number(e.target.value));
                          if (monthlyRevenue > 0) {
                            setB2bSalesPercent(Number(Math.min(100, (r$Val / monthlyRevenue) * 100).toFixed(0)));
                          }
                        }}
                        className="w-32 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono font-bold text-purple-400 text-right focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={b2bSalesPercent}
                    onChange={(e) => setB2bSalesPercent(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Vendas B2B ({b2bSalesPercent}%): <strong className="text-purple-300">{formatBRL(cenarioB_Comercial.b2bRevenueMonthly)}</strong></span>
                    <span>Vendas B2C ({100 - b2bSalesPercent}%): <strong className="text-slate-300">{formatBRL(monthlyRevenue - cenarioB_Comercial.b2bRevenueMonthly)}</strong></span>
                  </div>
                </div>

                {/* Alíquota IBS/CBS Referência */}
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">Alíquota IBS/CBS (IVA Dual):</label>
                    <span className="text-xs font-mono font-bold text-purple-400">{targetIvaRate.toFixed(1)}%</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={30}
                    step={0.5}
                    value={targetIvaRate}
                    onChange={(e) => setTargetIvaRate(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Repasse Integral B2B:</span>
                    <span className="font-bold text-purple-300">{targetIvaRate.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* -------------------------------------------------------------
                COLUNA DIREITA (7 COLUNAS): CONFRONTO, TRAVAS, DIAGNÓSTICOS & MEMÓRIA
                ------------------------------------------------------------- */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-5">
              
              {/* CARD DE VEREDITO ESTRATÉGICO PERICIAL */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-indigo-500/40 rounded-2xl p-5 shadow-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    <div>
                      <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                        Recomendação & Veredito Estratégico Pericial
                      </h2>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Base: LC 123/2006 • EC 132/2023 • LC 214/2025
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider self-start sm:self-auto shadow-sm ${
                    technicalOpinion.section3_RecommendationVerdict.verdictShort.includes('TRADICIONAL')
                      ? 'bg-emerald-600 text-white'
                      : technicalOpinion.section3_RecommendationVerdict.verdictShort.includes('HÍBRIDO')
                      ? 'bg-indigo-600 text-white'
                      : 'bg-amber-600 text-white'
                  }`}>
                    {technicalOpinion.section3_RecommendationVerdict.verdictShort}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                  <p>
                    <strong className="text-white">Justificativa Comercial: </strong>
                    {technicalOpinion.section3_RecommendationVerdict.commercialJustification}
                  </p>
                  <p className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                    <strong className="text-amber-400">Nota de Risco Operacional: </strong>
                    {technicalOpinion.section3_RecommendationVerdict.riskNote}
                  </p>
                </div>
              </div>

              {/* CONFRONTO DIRETO DOS 2 CENÁRIOS (LADO A LADO) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* CENÁRIO A: FLUXO DE CAIXA INTERNO */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                        Cenário A: Caixa Interno
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {cenarioA_Financeiro.cheaperRegime === 'tradicional' ? 'Vence no Caixa' : 'Híbrido Econômico'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60">
                        <span className="text-[10px] text-slate-400 block font-semibold">Tradicional (DAS):</span>
                        <div className="font-mono font-bold text-emerald-400 text-sm mt-0.5">
                          {formatBRL(cenarioA_Financeiro.tradicionalMonthlyTax)}
                        </div>
                        <span className="text-[10px] text-slate-300">{cenarioA_Financeiro.tradicionalEffectiveRate.toFixed(2)}% efetivo</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60">
                        <span className="text-[10px] text-slate-400 block font-semibold">Híbrido (DAS+IVA):</span>
                        <div className="font-mono font-bold text-indigo-300 text-sm mt-0.5">
                          {formatBRL(cenarioA_Financeiro.hibridoTotalMonthlyTax)}
                        </div>
                        <span className="text-[10px] text-slate-300">{cenarioA_Financeiro.hibridoEffectiveRate.toFixed(2)}% efetivo</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-snug">
                      {cenarioA_Financeiro.savingsExplanation}
                    </p>
                  </div>

                  <div className="h-28 w-full pt-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartDataFinancial} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                        <YAxis stroke="#94a3b8" fontSize={9} tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} formatter={(v: number) => formatBRL(v)} />
                        <Bar dataKey="Total Tributos" radius={[4, 4, 0, 0]}>
                          {chartDataFinancial.map((entry, idx) => (
                            <Cell key={`fc-${idx}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* CENÁRIO B: MERCADO B2B & CRÉDITO AO CLIENTE */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4 text-indigo-400" />
                        Cenário B: Mercado B2B
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Vence no B2B
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60">
                        <span className="text-[10px] text-slate-400 block font-semibold">Crédito Tradicional:</span>
                        <div className="font-mono font-bold text-amber-400 text-sm mt-0.5">
                          {cenarioB_Comercial.tradicionalB2bCreditRate.toFixed(2)}%
                        </div>
                        <span className="text-[10px] text-slate-300">{formatBRL(cenarioB_Comercial.tradicionalB2bCreditMonthly)}/mês</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60">
                        <span className="text-[10px] text-slate-400 block font-semibold">Crédito Híbrido:</span>
                        <div className="font-mono font-bold text-emerald-400 text-sm mt-0.5">
                          {cenarioB_Comercial.hibridoB2bCreditRate.toFixed(2)}%
                        </div>
                        <span className="text-[10px] text-slate-300">{formatBRL(cenarioB_Comercial.hibridoB2bCreditMonthly)}/mês</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-snug">
                      Clientes PJ economizam <strong>{formatBRL(cenarioB_Comercial.buyerSavingsMonthlyInHibrido)}/mês</strong> em créditos fiscais recuperados.
                    </p>
                  </div>

                  <div className="h-28 w-full pt-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartDataB2B} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                        <YAxis stroke="#94a3b8" fontSize={9} tickFormatter={(v) => `R$${v}`} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} formatter={(v: number) => formatBRL(v)} />
                        <Bar dataKey="Crédito Comprador" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Custo Líquido" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* AS 3 TRAVAS FISCAIS DECISÓRIAS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* TRAVA 01 */}
                <div className={`p-3.5 rounded-xl border transition ${
                  trava01Sublimite.isExceeded
                    ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                    : 'bg-slate-900/90 border-slate-800 text-slate-300'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <ShieldAlert className={`w-3.5 h-3.5 ${trava01Sublimite.isExceeded ? 'text-amber-400' : 'text-emerald-400'}`} />
                      Trava 01 • Sublimite
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      trava01Sublimite.isExceeded ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {trava01Sublimite.isExceeded ? 'EXCEDIDO' : '≤ R$ 3,6M'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-tight">
                    {trava01Sublimite.isExceeded
                      ? 'RBT12 > R$ 3,6M: ICMS/ISS recolhidos fora do DAS compulsoriamente.'
                      : 'RBT12 dentro do limite estadual. Opção híbrida facultativa.'}
                  </p>
                </div>

                {/* TRAVA 02 */}
                <div className={`p-3.5 rounded-xl border transition ${
                  trava02FatorR.isApplicable
                    ? trava02FatorR.fatorRActive
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                    : 'bg-slate-900/90 border-slate-800 text-slate-300'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      Trava 02 • Fator R
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 font-mono">
                      {trava02FatorR.fatorR.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-tight">
                    {trava02FatorR.isApplicable
                      ? (trava02FatorR.fatorRActive ? 'Fator R ≥ 28%: Tributado no Anexo III (alíquota menor).' : `Fator R < 28%: Tributado no Anexo V.`)
                      : `Atividade tributada pelo Anexo ${effectiveAnexo}.`}
                  </p>
                </div>

                {/* TRAVA 03 */}
                <div className="p-3.5 rounded-xl border bg-slate-900/90 border-slate-800 text-slate-300">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <ShoppingBag className="w-3.5 h-3.5 text-blue-400" />
                      Trava 03 • Insumos
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/20 text-blue-300 font-mono">
                      Média: {trava03CreditoEntrada.effectiveInputCreditRatePercent.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-tight">
                    Fornecedores Simples geram crédito restrito ({trava03CreditoEntrada.simplesSupplierCreditRate.toFixed(1)}%); Geral gera 26,5%.
                  </p>
                </div>
              </div>

              {/* MEMÓRIA DE CÁLCULO PASSO A PASSO EXPLICADA */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5 text-indigo-400" />
                    Memória de Cálculo Auditável & Fórmulas Reais
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">LC 123/2006</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="font-bold text-indigo-400 block text-[11px]">Passo 1: Alíquota Efetiva do Simples</span>
                    <p className="font-mono text-slate-300 text-[11px]">
                      [(RBT12 × AliqNominal) - Parcela] / RBT12 = <strong className="text-emerald-400">{standardEffectiveRate.toFixed(3)}%</strong>
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="font-bold text-indigo-400 block text-[11px]">Passo 2: DAS Reduzido no Híbrido</span>
                    <p className="font-mono text-slate-300 text-[11px]">
                      {standardEffectiveRate.toFixed(2)}% × (IRPJ+CSLL+CPP) = <strong className="text-indigo-300">{reducedDasRate.toFixed(3)}%</strong> ({formatBRL(reducedDasMonthly)}/mês)
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="font-bold text-indigo-400 block text-[11px]">Passo 3: Débito e Crédito de IBS/CBS</span>
                    <p className="font-mono text-slate-300 text-[11px]">
                      Débito: {formatBRL(cenarioA_Financeiro.hibridoGrossIbsCbsDebitoMonthly)} - Crédito: {formatBRL(cenarioA_Financeiro.hibridoIbsCbsCreditoMonthly)} = <strong className="text-white">{formatBRL(cenarioA_Financeiro.hibridoNetIbsCbsPayableMonthly)}/mês</strong>
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="font-bold text-indigo-400 block text-[11px]">Passo 4: Carga Total Híbrida</span>
                    <p className="font-mono text-slate-300 text-[11px]">
                      DAS Reduzido + IBS/CBS Líquido = <strong className="text-indigo-300">{formatBRL(cenarioA_Financeiro.hibridoTotalMonthlyTax)}/mês</strong> ({cenarioA_Financeiro.hibridoEffectiveRate.toFixed(2)}%)
                    </p>
                  </div>
                </div>
              </div>

              {/* CARD DE EMISSÃO DO RELATÓRIO DO COCKPIT */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-800/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    Relatório Especializado: Cockpit Interativo & Travas
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Gere o parecer pericial formatado contendo a análise completa das travas RBT12, Fator R, insumos e parâmetros em R$.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenReportModal('relatorio_cockpit')}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-2 transition shrink-0 shadow-lg shadow-indigo-950/50 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Emitir Relatório do Cockpit (PDF/A4)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ABA DE GRÁFICOS & ANÁLISES VISUAIS
          ========================================================================= */}
      {activeTab === 'graficos' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Painel Pericial de Análise Visual & Sensibilidade
                </h3>
                <p className="text-xs text-slate-400">
                  Modelagem gráfica de carga tributária, atratividade comercial B2B e curvas de equilíbrio
                </p>
              </div>
            </div>

            {/* Sub-Tabs dos Gráficos */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto">
              <button
                type="button"
                onClick={() => setChartSubTab('regimes')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  chartSubTab === 'regimes'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                4 Regimes
              </button>
              <button
                type="button"
                onClick={() => setChartSubTab('breakeven')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  chartSubTab === 'breakeven'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Curva Break-Even
              </button>
              <button
                type="button"
                onClick={() => setChartSubTab('b2b_credit')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  chartSubTab === 'b2b_credit'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Crédito B2B
              </button>
              <button
                type="button"
                onClick={() => setChartSubTab('decomposicao')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  chartSubTab === 'decomposicao'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Decomposição
              </button>
              <button
                type="button"
                onClick={() => setChartSubTab('carteira')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  chartSubTab === 'carteira'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                B2B vs B2C
              </button>
            </div>
          </div>

          {/* SUB-GRÁFICO 1: COMPARATIVO DOS 4 REGIMES */}
          {chartSubTab === 'regimes' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Comparativo de Carga Tributária: Simples Tradicional vs Híbrido vs Presumido vs Real
                  </h4>
                  <p className="text-xs text-slate-400">
                    Projeção com base no faturamento de {formatBRL(monthlyRevenue)}/mês ({formatBRL(rbt12Input)}/ano)
                  </p>
                </div>

                <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setChartHorizon('anual')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                      chartHorizon === 'anual' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Projeção Anual
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartHorizon('mensal')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                      chartHorizon === 'mensal' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Mensal
                  </button>
                </div>
              </div>

              <div className="h-72 w-full bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regimesComparisonChartData} margin={{ top: 15, right: 15, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                      formatter={(val: number) => [formatBRL(val), isAnual ? 'Tributo Anual' : 'Tributo Mensal']}
                    />
                    <Bar dataKey="valorTributo" radius={[6, 6, 0, 0]}>
                      {regimesComparisonChartData.map((entry, idx) => (
                        <Cell key={`regime-bar-${idx}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Grid com Métricas dos 4 Regimes */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {regimesComparisonChartData.map((regime, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border bg-slate-950/60 border-slate-800 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 block truncate">{regime.name}</span>
                    <div className="text-base font-bold font-mono text-white">
                      {formatBRL(regime.valorTributo)}
                      <span className="text-[10px] text-slate-400 font-normal">/{isAnual ? 'ano' : 'mês'}</span>
                    </div>
                    <div className="text-xs font-mono font-semibold" style={{ color: regime.fill }}>
                      Alíquota: {regime.aliquotaEfetiva.toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUB-GRÁFICO 2: CURVA DE BREAK-EVEN DE INSUMOS */}
          {chartSubTab === 'breakeven' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Curva de Sensibilidade: Alíquota Híbrida x Nível de Compras de Insumos</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                      Break-Even: {sensitivityAndBreakEven.inputBreakEvenPercent.toFixed(1)}%
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    O gráfico ilustra como a alíquota efetiva do Simples Híbrido cai conforme o volume de créditos de compras aumenta
                  </p>
                </div>
              </div>

              <div className="h-72 w-full bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={breakEvenCurveData} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="hibridoGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                    <XAxis dataKey="inputLabel" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${v}%`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                      formatter={(val: number, name: string) => [`${val}%`, name === 'hibridoRate' ? 'Alíquota Híbrido' : 'Alíquota Tradicional']}
                    />
                    <ReferenceLine
                      y={cenarioA_Financeiro.tradicionalEffectiveRate}
                      stroke="#10b981"
                      strokeDasharray="4 4"
                      label={{ value: `Tradicional (${cenarioA_Financeiro.tradicionalEffectiveRate.toFixed(1)}%)`, fill: '#10b981', fontSize: 11, position: 'top' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="hibridoRate"
                      name="Alíquota Simples Híbrido"
                      stroke="#6366f1"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#hibridoGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
                <strong className="text-white block mb-1">Interpretação do Ponto de Equilíbrio:</strong>
                Se a empresa mantiver compras de insumos acima de <strong className="text-indigo-400 font-mono">{sensitivityAndBreakEven.inputBreakEvenPercent.toFixed(1)}%</strong> do faturamento, o Simples Híbrido passa a gerar economia financeira direta em relação ao Simples Tradicional. Compras atuais: <strong className="text-emerald-400 font-mono">{sensitivityAndBreakEven.currentInputPercent.toFixed(1)}%</strong>.
              </div>
            </div>
          )}

          {/* SUB-GRÁFICO 3: CRÉDITO B2B TRANSFERIDO */}
          {chartSubTab === 'b2b_credit' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white">
                  Atratividade Comercial B2B: Crédito Gerado ao Comprador (Base R$ 1.000 de Venda)
                </h4>
                <p className="text-xs text-slate-400">
                  Simulação do impacto do crédito fiscal no preço final percebido pelo comprador pessoa jurídica
                </p>
              </div>

              <div className="h-72 w-full bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={b2bCreditComparisonData} margin={{ top: 15, right: 15, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                    <XAxis dataKey="regime" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `R$ ${v}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                      formatter={(val: number) => [formatBRL(val), 'Valor']}
                    />
                    <Legend />
                    <Bar dataKey="creditoComprador" name="Crédito Faturado ao Comprador" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="custoLiquidoComprador" name="Custo Líquido para o Comprador" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* SUB-GRÁFICO 4: DECOMPOSIÇÃO DO SIMPLES HÍBRIDO */}
          {chartSubTab === 'decomposicao' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white">
                  Decomposição Mensal do Simples Híbrido ({formatBRL(cenarioA_Financeiro.hibridoTotalMonthlyTax)})
                </h4>
                <p className="text-xs text-slate-400">
                  Distribuição entre o DAS Reduzido (Tributos Diretos) e o IBS/CBS Líquido Não-Cumulativo
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={hibridoTaxPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {hibridoTaxPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                        formatter={(val: number) => [formatBRL(val), 'Valor Mensal']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2.5">
                  {hibridoTaxPieData.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs font-semibold text-slate-300">{item.name}</span>
                      </div>
                      <span className="font-mono font-bold text-white text-xs">{formatBRL(item.value)}/mês</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SUB-GRÁFICO 5: CARTEIRA B2B vs B2C */}
          {chartSubTab === 'carteira' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white">
                  Distribuição da Carteira: B2B Corporativo ({cenarioB_Comercial.b2bSalesPercent.toFixed(0)}%) vs B2C Consumidor ({cenarioB_Comercial.b2cSalesPercent.toFixed(0)}%)
                </h4>
                <p className="text-xs text-slate-400">
                  Composição do faturamento mensal de {formatBRL(monthlyRevenue)}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={b2bPortfolioPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {b2bPortfolioPieData.map((entry, index) => (
                          <Cell key={`b2b-pie-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                        formatter={(val: number) => [formatBRL(val), 'Faturamento Mensal']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-indigo-400 font-semibold">🏢 Carteira B2B ({cenarioB_Comercial.b2bSalesPercent.toFixed(0)}%):</span>
                      <span className="font-mono font-bold text-white">{formatBRL(cenarioB_Comercial.b2bRevenueMonthly)}/mês</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Gera crédito total de {targetIvaRate.toFixed(1)}% para o cliente ({formatBRL(cenarioB_Comercial.hibridoB2bCreditMonthly)}/mês).</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-amber-400 font-semibold">🛍️ Carteira B2C ({cenarioB_Comercial.b2cSalesPercent.toFixed(0)}%):</span>
                      <span className="font-mono font-bold text-white">{formatBRL(cenarioB_Comercial.b2cRevenueMonthly)}/mês</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Consumidor não aproveita créditos. Prejuízo suportado pela empresa: <strong className="text-rose-400 font-mono">{formatBRL(cenarioB_Comercial.b2cTaxCostDifferenceMonthly)}/mês</strong>.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CARD DE EMISSÃO DO RELATÓRIO DE GRÁFICOS */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-800/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl pt-4">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-400" />
                Relatório Especializado: Gráficos & Ponto de Equilíbrio
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Emitir o relatório visual formatado com gráficos comparativos dos 4 regimes, break-even e repasse B2B.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenReportModal('relatorio_graficos')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-2 transition shrink-0 shadow-lg shadow-indigo-950/50 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Emitir Relatório Visual (PDF/A4)
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          ABA DE MATRIZ DE CENÁRIOS E SENSIBILIDADE
          ========================================================================= */}
      {activeTab === 'cenarios' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              Matriz de Sensibilidade & Análise de Estresse
            </h3>
            <p className="text-xs text-slate-400">
              Simulação de múltiplos cenários de faturamento e níveis de compras para tomada de decisão fundamentada
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border bg-slate-950/60 border-slate-800 space-y-2">
              <span className="text-xs font-bold text-indigo-400 uppercase">Cenário Mínimo (R$ 50k/mês)</span>
              <div className="text-lg font-bold font-mono text-white">{formatBRL(50000 * (standardEffectiveRate / 100))}/mês</div>
              <p className="text-[11px] text-slate-400">No Simples Tradicional na faixa inicial de faturamento.</p>
            </div>
            <div className="p-4 rounded-xl border bg-slate-950/60 border-slate-800 space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase">Cenário Atual ({formatBRL(monthlyRevenue)}/mês)</span>
              <div className="text-lg font-bold font-mono text-white">{formatBRL(cenarioA_Financeiro.tradicionalMonthlyTax)}/mês</div>
              <p className="text-[11px] text-slate-400">Alíquota Efetiva Tradicional: {cenarioA_Financeiro.tradicionalEffectiveRate.toFixed(2)}%.</p>
            </div>
            <div className="p-4 rounded-xl border bg-slate-950/60 border-slate-800 space-y-2">
              <span className="text-xs font-bold text-amber-400 uppercase">Cenário Máximo Sublimite (R$ 300k/mês)</span>
              <div className="text-lg font-bold font-mono text-white">{formatBRL(300000 * (standardEffectiveRate / 100))}/mês</div>
              <p className="text-[11px] text-slate-400">No limite de R$ 3,6M anual antes do recolhimento obrigatório por fora.</p>
            </div>
          </div>

          {/* CARD DE EMISSÃO DO RELATÓRIO DE CENÁRIOS */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-800/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                Relatório Especializado: Matriz de Cenários (Caixa vs BSB)
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Emitir o confronto detalhado do Cenário A (Fluxo de Caixa Direto) vs Cenário B (Competitividade no B2B).
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenReportModal('relatorio_cenarios')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-2 transition shrink-0 shadow-lg shadow-indigo-950/50 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Emitir Relatório de Cenários (PDF/A4)
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          ABA DE DECOMPOSIÇÃO DO DAS (LC 123/2006)
          ========================================================================= */}
      {activeTab === 'partilha' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in duration-200">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Tabela Oficial de Partilha e Expurgos do DAS • {effectiveAnexo}
            </h3>
            <p className="text-xs text-slate-400">
              Decomposição legal dos tributos retidos no DAS versus expurgados para apuração via IVA Dual (LC 123/2006 & LC 214/2025)
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-800 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Tributo</th>
                  <th className="py-2.5 px-3">Destino Legal</th>
                  <th className="py-2.5 px-3">Partilha no DAS (%)</th>
                  <th className="py-2.5 px-3">Alíquota Efetiva (%)</th>
                  <th className="py-2.5 px-3">Valor Mensal (R$)</th>
                  <th className="py-2.5 px-3">Status no Híbrido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-semibold text-white">IRPJ</td>
                  <td className="py-2.5 px-3 text-slate-400">Federal Direto</td>
                  <td className="py-2.5 px-3 font-mono">{(partition.irpj * 100).toFixed(2)}%</td>
                  <td className="py-2.5 px-3 font-mono text-emerald-400">
                    {((standardEffectiveRate * partition.irpj)).toFixed(3)}%
                  </td>
                  <td className="py-2.5 px-3 font-mono">
                    {formatBRL(monthlyRevenue * ((standardEffectiveRate * partition.irpj) / 100))}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold text-[10px]">
                      Retido no DAS
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-semibold text-white">CSLL</td>
                  <td className="py-2.5 px-3 text-slate-400">Federal Direto</td>
                  <td className="py-2.5 px-3 font-mono">{(partition.csll * 100).toFixed(2)}%</td>
                  <td className="py-2.5 px-3 font-mono text-emerald-400">
                    {((standardEffectiveRate * partition.csll)).toFixed(3)}%
                  </td>
                  <td className="py-2.5 px-3 font-mono">
                    {formatBRL(monthlyRevenue * ((standardEffectiveRate * partition.csll) / 100))}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold text-[10px]">
                      Retido no DAS
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-semibold text-white">CPP (Previdência)</td>
                  <td className="py-2.5 px-3 text-slate-400">INSS Patronal</td>
                  <td className="py-2.5 px-3 font-mono">{(partition.cpp * 100).toFixed(2)}%</td>
                  <td className="py-2.5 px-3 font-mono text-emerald-400">
                    {((standardEffectiveRate * partition.cpp)).toFixed(3)}%
                  </td>
                  <td className="py-2.5 px-3 font-mono">
                    {formatBRL(monthlyRevenue * ((standardEffectiveRate * partition.cpp) / 100))}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold text-[10px]">
                      {effectiveAnexo === 'IV' ? 'Fora na DCTFWeb' : 'Retido no DAS'}
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-800/30 bg-rose-950/10">
                  <td className="py-2.5 px-3 font-semibold text-rose-300">PIS + COFINS (CBS)</td>
                  <td className="py-2.5 px-3 text-slate-400">Federal IVA</td>
                  <td className="py-2.5 px-3 font-mono text-rose-300">
                    {((partition.pis + partition.cofins) * 100).toFixed(2)}%
                  </td>
                  <td className="py-2.5 px-3 font-mono text-rose-300">
                    {((standardEffectiveRate * (partition.pis + partition.cofins))).toFixed(3)}%
                  </td>
                  <td className="py-2.5 px-3 font-mono text-rose-300">
                    {formatBRL(monthlyRevenue * ((standardEffectiveRate * (partition.pis + partition.cofins)) / 100))}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold text-[10px]">
                      Expurgado (CBS 8,8%)
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-800/30 bg-rose-950/10">
                  <td className="py-2.5 px-3 font-semibold text-rose-300">
                    {effectiveAnexo === 'I' || effectiveAnexo === 'II' ? 'ICMS (IBS)' : 'ISS (IBS)'}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">
                    {effectiveAnexo === 'I' || effectiveAnexo === 'II' ? 'Estadual IVA' : 'Municipal IVA'}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-rose-300">
                    {((partition.icms || partition.iss) * 100).toFixed(2)}%
                  </td>
                  <td className="py-2.5 px-3 font-mono text-rose-300">
                    {((standardEffectiveRate * (partition.icms || partition.iss))).toFixed(3)}%
                  </td>
                  <td className="py-2.5 px-3 font-mono text-rose-300">
                    {formatBRL(monthlyRevenue * ((standardEffectiveRate * (partition.icms || partition.iss)) / 100))}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold text-[10px]">
                      Expurgado (IBS 17,7%)
                    </span>
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-800/80 font-bold text-white">
                <tr>
                  <td className="py-3 px-3">TOTAL / SOMA DAS</td>
                  <td className="py-3 px-3 text-indigo-300">DAS Tradicional vs Reduzido</td>
                  <td className="py-3 px-3 font-mono">100,00%</td>
                  <td className="py-3 px-3 font-mono text-emerald-400">{standardEffectiveRate.toFixed(3)}%</td>
                  <td className="py-3 px-3 font-mono">{formatBRL(monthlyRevenue * (standardEffectiveRate / 100))}</td>
                  <td className="py-3 px-3 text-indigo-300">
                    DAS Reduzido: {reducedDasRate.toFixed(3)}% ({formatBRL(reducedDasMonthly)})
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* CARD DE EMISSÃO DO RELATÓRIO DE PARTILHA */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-800/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-indigo-400" />
                Relatório Especializado: Decomposição do DAS & Partilha Tributária
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Emitir a discriminação legal completa de expurgos (PIS, COFINS, ICMS/ISS) e tributos mantidos no DAS.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenReportModal('relatorio_partilha')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-2 transition shrink-0 shadow-lg shadow-indigo-950/50 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Emitir Relatório de Partilha (PDF/A4)
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          ABA DE PARECER TÉCNICO ESTRUTURADO
          ========================================================================= */}
      {activeTab === 'parecer' && (
        <div className="bg-slate-900 border border-indigo-900/60 rounded-2xl p-6 shadow-2xl space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                Parecer Pericial Automatizado
              </span>
              <h3 className="text-lg font-bold text-white mt-1">
                {technicalOpinion.title}
              </h3>
              <p className="text-xs text-slate-400">{technicalOpinion.legalBasis}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyOpinion}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition self-start sm:self-auto cursor-pointer"
              >
                {copiedToast ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-indigo-400" />}
                {copiedToast ? 'Copiado!' : 'Copiar Texto Completo'}
              </button>
              <button
                type="button"
                onClick={() => handleOpenReportModal('parecer_unificado')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition self-start sm:self-auto shadow-md shadow-indigo-950/40 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Emitir Parecer Oficial em PDF (A4)
              </button>
            </div>
          </div>

          {/* 1. Diagnóstico Financeiro */}
          <div className="bg-slate-800/60 p-5 rounded-xl border border-slate-700/60 space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              1. Diagnóstico do Cenário Financeiro (Fluxo de Caixa)
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
              {technicalOpinion.section1_FinancialDiagnostic.text}
            </p>
          </div>

          {/* 2. Diagnóstico de Mercado B2B */}
          <div className="bg-slate-800/60 p-5 rounded-xl border border-slate-700/60 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-400" />
              2. Diagnóstico do Cenário Completo (Posicionamento de Mercado B2B)
            </h4>
            <p className="text-xs text-slate-300">
              Considerando que a carteira de receita da empresa é composta por{' '}
              <strong className="text-white">{technicalOpinion.section2_MarketDiagnostic.b2bPercentFormatted}</strong> de clientes corporativos (PJs no Lucro Real/Presumido), a tomada de decisão deve ponderar a retenção comercial:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200">
                <strong className="block text-amber-300 mb-1">Opção Simples Tradicional:</strong>
                {technicalOpinion.section2_MarketDiagnostic.textTradicional}
              </div>
              <div className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-500/30 text-xs text-indigo-200">
                <strong className="block text-indigo-300 mb-1">Opção Simples Híbrido:</strong>
                {technicalOpinion.section2_MarketDiagnostic.textHibrido}
              </div>
            </div>
          </div>

          {/* 3. Recomendação e Veredito Final */}
          <div className="bg-gradient-to-br from-indigo-950/80 to-slate-900 p-5 rounded-xl border border-indigo-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                3. Recomendação e Veredito Final do Sistema
              </h4>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/40">
                {technicalOpinion.section3_RecommendationVerdict.verdictShort}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-200">
              <p>
                <strong className="text-indigo-300">Justificativa Comercial: </strong>
                {technicalOpinion.section3_RecommendationVerdict.commercialJustification}
              </p>
              <p className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400">
                <strong className="text-amber-400">Nota de Risco Operacional: </strong>
                {technicalOpinion.section3_RecommendationVerdict.riskNote}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAIS INTEGRADOS
          ========================================================================= */}
      {/* MODAL OFICIAL DO PARECER TÉCNICO IMPRIMÍVEL EM PADRÃO A4 / PDF */}
      <SimplesHibridoReportModal
        isOpen={isOfficialReportModalOpen}
        onClose={() => setIsOfficialReportModalOpen(false)}
        company={company}
        calculation={calculation || ({} as any)}
        comparisonResult={comparisonResult}
        initialReportMode={reportModeForModal}
      />

      {/* MODAL DE LIBERAÇÃO DE ACESSO DO MÓDULO PARA O CLIENTE */}
      <SimplesHibridoShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        company={company}
        result={comparisonResult}
        showToast={(msg, type) => {
          setCopiedToast(true);
          setTimeout(() => setCopiedToast(false), 3000);
        }}
        onOpenClientMode={onOpenClientMode}
      />

      {/* MODAL DO MANUAL OPERACIONAL E DOUTRINÁRIO DO SIMPLES HÍBRIDO */}
      <SimplesHibridoManualModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        company={company}
      />
    </div>
  );
};
