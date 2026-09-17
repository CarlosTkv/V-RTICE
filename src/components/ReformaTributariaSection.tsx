import React, { useState } from 'react';
import { 
  Building2, 
  ShieldAlert, 
  HelpCircle, 
  ArrowRight, 
  TrendingDown, 
  Layers, 
  CheckCircle2, 
  AlertTriangle,
  Calendar,
  Sparkles,
  Percent,
  Truck,
  Activity,
  Briefcase,
  Wheat,
  Landmark,
  Clock,
  Zap,
  Info,
  FileText,
  Play
} from 'lucide-react';
import { CompanyData, CalculationResult } from '../types';
import { formatCurrencyBRL, formatPercentBR } from '../utils/taxRules';
import { ReportViewerModal } from './ReportViewerModal';
import { ModuleTutorialModal } from './ModuleTutorialModal';
import { BrandLogo } from './BrandLogo';

interface ReformaTributariaSectionProps {
  company: CompanyData;
  onChangeCompany: (updated: CompanyData) => void;
  calculation: CalculationResult;
}

type TransitionYear = 2026 | 2027 | 2028 | 2029 | 2030 | 2031 | 2032 | 2033;
type SectorType = 'geral' | 'transporte' | 'saude_educacao' | 'profissionais_regulamentados' | 'agro';

interface YearConfig {
  year: TransitionYear;
  label: string;
  phase: string;
  cbsRate: number;
  ibsRate: number;
  residualPisCofinsPercent: number; // 100 = full, 0 = extinct
  residualIcmsIssPercent: number; // 100 = full, 0 = extinct
  description: string;
  splitPaymentActive: boolean;
}

const TRANSITION_YEARS: YearConfig[] = [
  {
    year: 2026,
    label: '2026 - Fase Teste',
    phase: 'Homologação e Teste',
    cbsRate: 0.9,
    ibsRate: 0.1,
    residualPisCofinsPercent: 100,
    residualIcmsIssPercent: 100,
    description: 'Alíquotas de teste (CBS 0,9% + IBS 0,1% = 1,0%). O valor recolhido é 100% compensável com PIS e COFINS devidos. Empresas não sofrem aumento de carga líquida.',
    splitPaymentActive: false,
  },
  {
    year: 2027,
    label: '2027 - CBS Plena',
    phase: 'Vigência Federal',
    cbsRate: 8.8,
    ibsRate: 0.1,
    residualPisCofinsPercent: 0,
    residualIcmsIssPercent: 100,
    description: 'Extinção definitiva de PIS e COFINS. Entrada em vigor da CBS federal plena (~8,8%) com não-cumulatividade plena. IPI reduzido a zero (exceto Zona Franca de Manaus).',
    splitPaymentActive: true,
  },
  {
    year: 2028,
    label: '2028 - Conformidade',
    phase: 'Consolidação Federal',
    cbsRate: 8.8,
    ibsRate: 0.1,
    residualPisCofinsPercent: 0,
    residualIcmsIssPercent: 100,
    description: 'CBS plenamente operacional com Split Payment automatizado no sistema bancário. Início dos testes de repasse do IBS para estados e municípios.',
    splitPaymentActive: true,
  },
  {
    year: 2029,
    label: '2029 - Início IBS',
    phase: 'Transição Estados 1/10',
    cbsRate: 8.8,
    ibsRate: 1.77,
    residualPisCofinsPercent: 0,
    residualIcmsIssPercent: 90,
    description: 'Início da transição estadual/municipal. O IBS assume 10% da sua alíquota final, enquanto ICMS e ISS são reduzidos para 90% das alíquotas vigentes.',
    splitPaymentActive: true,
  },
  {
    year: 2030,
    label: '2030 - Transição IBS 2/10',
    phase: 'Transição Estados 2/10',
    cbsRate: 8.8,
    ibsRate: 3.54,
    residualPisCofinsPercent: 0,
    residualIcmsIssPercent: 80,
    description: 'IBS assume 20% da alíquota final. ICMS e ISS reduzidos a 80%. Comitê Gestor do IBS inicia arrecadação e partilha federativa centralizada.',
    splitPaymentActive: true,
  },
  {
    year: 2031,
    label: '2031 - Transição IBS 3/10',
    phase: 'Transição Estados 3/10',
    cbsRate: 8.8,
    ibsRate: 5.31,
    residualPisCofinsPercent: 0,
    residualIcmsIssPercent: 70,
    description: 'IBS assume 30% da alíquota final. ICMS e ISS reduzidos a 70%. Início do encerramento gradual de incentivos e benefícios fiscais de ICMS.',
    splitPaymentActive: true,
  },
  {
    year: 2032,
    label: '2032 - Transição IBS 4/10',
    phase: 'Transição Estados 4/10',
    cbsRate: 8.8,
    ibsRate: 7.08,
    residualPisCofinsPercent: 0,
    residualIcmsIssPercent: 60,
    description: 'IBS assume 40% da alíquota final. ICMS e ISS reduzidos a 60%. Último ano de convivência com os tributos sobre consumo legados.',
    splitPaymentActive: true,
  },
  {
    year: 2033,
    label: '2033 - Vigência Plena',
    phase: 'Modelo Definitivo',
    cbsRate: 8.8,
    ibsRate: 17.7,
    residualPisCofinsPercent: 0,
    residualIcmsIssPercent: 0,
    description: 'Extinção completa e definitiva do ICMS e do ISS. O Brasil opera exclusivamente sob o IVA Dual (CBS 8,8% + IBS 17,7% = 26,50% padrão).',
    splitPaymentActive: true,
  },
];

const SECTORS: { key: SectorType; label: string; reductionPercent: number; description: string; icon: any }[] = [
  { 
    key: 'geral', 
    label: 'Padrão / Geral', 
    reductionPercent: 0, 
    description: 'Alíquota de referência integral de 26,5% sem reduções setoriais.',
    icon: Building2
  },
  { 
    key: 'transporte', 
    label: 'Transporte de Cargas & Logística', 
    reductionPercent: 0, 
    description: 'Alíquota padrão de 26,5% com direito a créditos amplos sobre diesel, Arla 32, pedágio, pneus, peças e frotas.',
    icon: Truck
  },
  { 
    key: 'saude_educacao', 
    label: 'Saúde & Educação (-60%)', 
    reductionPercent: 60, 
    description: 'Regime diferenciado com 60% de redução na alíquota padrão (alíquota efetiva de 10,60%).',
    icon: Activity
  },
  { 
    key: 'profissionais_regulamentados', 
    label: 'Profissionais Regulamentados (-30%)', 
    reductionPercent: 30, 
    description: 'Sociedades de advogados, contadores, engenheiros e médicos com 30% de redução (alíquota de 18,55%).',
    icon: Briefcase
  },
  { 
    key: 'agro', 
    label: 'Insumos Agropecuários (-60%)', 
    reductionPercent: 60, 
    description: 'Alimentos e insumos com redução de 60% ou isenção na cesta básica nacional.',
    icon: Wheat
  },
];

export const ReformaTributariaSection: React.FC<ReformaTributariaSectionProps> = ({
  company,
  onChangeCompany,
  calculation,
}) => {
  const [selectedYear, setSelectedYear] = useState<TransitionYear>(2027);
  const [selectedSector, setSelectedSector] = useState<SectorType>(
    company.isTransportService ? 'transporte' : 'geral'
  );
  const [b2bPercentage, setB2bPercentage] = useState(company.b2bSalesPercent || 70);
  const [targetIvaRate, setTargetIvaRate] = useState(company.targetIvaRate || 26.5);
  const [simulateSplitPayment, setSimulateSplitPayment] = useState(true);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  const currentYearConfig = TRANSITION_YEARS.find(y => y.year === selectedYear) || TRANSITION_YEARS[1];
  const sectorConfig = SECTORS.find(s => s.key === selectedSector) || SECTORS[0];

  const standaloneRbt12 = Math.max(1, company.rbt12);
  const monthlyRevenue = standaloneRbt12 / 12;
  const b2bRevenueAnnual = standaloneRbt12 * (b2bPercentage / 100);
  const b2bRevenueMonthly = monthlyRevenue * (b2bPercentage / 100);

  // Sector-adjusted standard IVA rate
  const sectorMultiplier = (100 - sectorConfig.reductionPercent) / 100;
  const effectiveIvaRateFull = targetIvaRate * sectorMultiplier;

  // Year-specific IVA rate (CBS + IBS)
  const currentYearIvaRate = (currentYearConfig.cbsRate + currentYearConfig.ibsRate) * sectorMultiplier;

  // Credit passed in Simples vs Regular
  const creditPassedSimplesRate = calculation.reformaSimplesCreditTransferRate || 2.8;
  const creditPassedRegularRate = selectedYear >= 2033 ? effectiveIvaRateFull : Math.max(creditPassedSimplesRate, currentYearIvaRate);

  const creditAmountInSimplesAnnual = b2bRevenueAnnual * (creditPassedSimplesRate / 100);
  const creditAmountInRegularAnnual = b2bRevenueAnnual * (creditPassedRegularRate / 100);
  const b2bClientDisadvantageAnnual = Math.max(0, creditAmountInRegularAnnual - creditAmountInSimplesAnnual);

  // Split payment retention calculation
  const splitPaymentRate = selectedYear >= 2027 ? (currentYearConfig.cbsRate + currentYearConfig.ibsRate) / 100 : 0;
  const splitRetainedMonthly = simulateSplitPayment ? monthlyRevenue * splitPaymentRate : 0;
  const netCashReceivedMonthly = monthlyRevenue - splitRetainedMonthly;

  const handleUpdateB2B = (val: number) => {
    setB2bPercentage(val);
    onChangeCompany({ ...company, b2bSalesPercent: val });
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="bg-[#0F172A] p-6 sm:p-7 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <BrandLogo variant="badge" module="reforma" />
              <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Auditoria & Projeção Regulatória</p>
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  Simulador Completo da Reforma Tributária
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20">
                    EC 132/2023 & PLP 68/2024
                  </span>
                </h2>
              </div>
            </div>
            <p className="text-slate-300 text-xs max-w-3xl leading-relaxed">
              O novo modelo de <b>IVA Dual (IBS estadual/municipal e CBS federal)</b> substitui PIS, COFINS, IPI, ICMS e ISS com o princípio da <b>não-cumulatividade plena</b>. Avalie o impacto na sua margem, no seu fluxo de caixa (Split Payment) e na competitividade da sua carteira B2B.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsTutorialOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/70 text-indigo-300 border border-indigo-800/70 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Play className="w-3.5 h-3.5 text-indigo-400" />
              <span>Como Funciona</span>
            </button>

            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-blue-600/20 transition cursor-pointer"
              title="Gerar e Visualizar Relatório Oficial de Impacto da Reforma Tributária"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Relatório Reforma</span>
            </button>

            <div className="flex items-center space-x-2 bg-[#0B0F19] px-4 py-2.5 rounded-xl border border-slate-800 text-xs">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span className="font-bold font-mono text-slate-300">2026 - 2033</span>
            </div>
          </div>
        </div>

        {/* Interactive Transition Roadmap */}
        <div className="mt-6 pt-6 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              Selecione o Ano de Simulação da Transição:
            </span>
            <span className="text-xs text-blue-400 font-mono font-bold">
              Ano selecionado: {selectedYear} ({currentYearConfig.phase})
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {TRANSITION_YEARS.map((item) => {
              const isSelected = item.year === selectedYear;
              return (
                <button
                  key={item.year}
                  type="button"
                  onClick={() => setSelectedYear(item.year)}
                  className={`p-3 rounded-xl border text-left transition relative flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/20 ring-2 ring-blue-400/40'
                      : 'bg-[#0B0F19] text-slate-400 border-slate-800 hover:border-slate-700 hover:bg-slate-850 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-sm font-mono">{item.year}</span>
                    {item.year === 2026 && <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${isSelected ? 'bg-white/20 text-white' : 'bg-amber-500/20 text-amber-300'}`}>Teste</span>}
                    {item.year === 2027 && <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${isSelected ? 'bg-white/20 text-white' : 'bg-emerald-500/20 text-emerald-300'}`}>CBS</span>}
                    {item.year === 2033 && <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${isSelected ? 'bg-white/20 text-white' : 'bg-purple-500/20 text-purple-300'}`}>100%</span>}
                  </div>
                  <div className="mt-2 text-[10px] leading-tight truncate font-medium">
                    {item.phase}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Year Detail Banner */}
          <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 mt-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{currentYearConfig.label}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                  {currentYearConfig.phase}
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">{currentYearConfig.description}</p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 text-xs font-mono">
              <div 
                className="bg-[#0F172A] px-3 py-2 rounded-lg border border-slate-800 text-center shadow-xs cursor-help group relative"
                title="CBS (Contribuição sobre Bens e Serviços): Tributo federal unificado que substitui o PIS, a COFINS e o IPI, operando sob o regime não-cumulativo."
              >
                <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
                  CBS Federal <Info className="w-3 h-3 text-blue-400 inline" />
                </div>
                <div className="font-bold text-blue-400 text-sm">{currentYearConfig.cbsRate.toFixed(2)}%</div>
              </div>
              <div 
                className="bg-[#0F172A] px-3 py-2 rounded-lg border border-slate-800 text-center shadow-xs cursor-help group relative"
                title="IBS (Imposto sobre Bens e Serviços): Tributo subnacional (estadual e municipal) que unifica o ICMS e o ISS, com incidência no destino e não-cumulatividade plena."
              >
                <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
                  IBS Est./Mun. <Info className="w-3 h-3 text-purple-400 inline" />
                </div>
                <div className="font-bold text-purple-400 text-sm">{currentYearConfig.ibsRate.toFixed(2)}%</div>
              </div>
              <div className="bg-[#0F172A] px-3 py-2 rounded-lg border border-slate-800 text-center shadow-xs">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">PIS/COFINS</div>
                <div className="font-bold text-amber-400 text-sm">
                  {currentYearConfig.residualPisCofinsPercent === 0 ? 'Extinto' : '100% Vigente'}
                </div>
              </div>
              <div className="bg-[#0F172A] px-3 py-2 rounded-lg border border-slate-800 text-center shadow-xs">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">ICMS/ISS</div>
                <div className="font-bold text-emerald-400 text-sm">
                  {currentYearConfig.residualIcmsIssPercent === 0 ? 'Extinto' : `${currentYearConfig.residualIcmsIssPercent}% Vigente`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sector Selection & B2B Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sliders & Parameters */}
        <div className="bg-[#0F172A] p-6 sm:p-7 rounded-2xl border border-slate-800 space-y-6 shadow-xl">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-0.5">Parâmetros & Setor</p>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Percent className="w-4 h-4 text-blue-400" />
              <span>Regime Especial & Vendas B2B</span>
            </h3>
          </div>

          {/* Sector Selector */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300 block">
              Setor da Empresa (PLP 68/2024):
            </label>
            <div className="space-y-1.5">
              {SECTORS.map((s) => {
                const Icon = s.icon;
                const active = s.key === selectedSector;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setSelectedSector(s.key)}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition cursor-pointer ${
                      active
                        ? 'bg-blue-500/10 border-blue-500/40 text-blue-200 ring-1 ring-blue-500/40'
                        : 'bg-[#0B0F19] border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-850 hover:text-slate-200'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${active ? 'text-blue-400' : 'text-slate-500'}`} />
                    <div className="min-w-0">
                      <div className="text-xs font-bold leading-tight flex items-center justify-between">
                        <span>{s.label}</span>
                        {s.reductionPercent > 0 && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                            -{s.reductionPercent}%
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight mt-0.5 truncate">{s.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-5 pt-3 border-t border-slate-800">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vendas para PJ (B2B):</span>
                <span className="text-blue-400 font-bold font-mono">{b2bPercentage}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={b2bPercentage}
                onChange={(e) => handleUpdateB2B(parseInt(e.target.value) || 0)}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 border border-slate-700"
              />
              <p className="text-[10px] text-slate-400 mt-1 font-mono">
                Faturamento B2B Anual: <b className="text-white">{formatCurrencyBRL(b2bRevenueAnnual)}</b>
              </p>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alíquota Padrão IVA de Referência:</span>
                <span className="text-indigo-400 font-bold font-mono">{targetIvaRate}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="30"
                step="0.5"
                value={targetIvaRate}
                onChange={(e) => {
                  const v = parseFloat(e.target.value) || 26.5;
                  setTargetIvaRate(v);
                  onChangeCompany({ ...company, targetIvaRate: v });
                }}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 border border-slate-700"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Alíquota efetiva do setor: <b className="text-indigo-400">{effectiveIvaRateFull.toFixed(2)}%</b> (Projeção Fazenda / PLP 68)
              </p>
            </div>

            <div className="p-4 bg-[#0B0F19] rounded-xl border border-slate-800 space-y-1.5 text-xs">
              <span className="font-bold text-[10px] text-slate-300 uppercase tracking-wider block">Faculdade da LC 123/2006 na Reforma:</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                A empresa no Simples Nacional poderá <b>optar por recolher IBS e CBS no regime regular não-cumulativo</b>, transferindo crédito pleno aos clientes e abatendo créditos sobre insumos, mantendo o IRPJ, CSLL e folha no Simples!
              </p>
            </div>
          </div>
        </div>

        {/* Economic Impact Comparison */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Visual Comparison */}
          <div className="bg-[#0F172A] p-6 sm:p-7 rounded-2xl border border-slate-800 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Competitividade Comercial B2B em {selectedYear}</p>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Volume de Crédito Tributário Repassado ao seu Cliente PJ
                </h3>
              </div>
              <span className="text-[10px] font-mono px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold self-start sm:self-auto">
                Base B2B Anual: {formatCurrencyBRL(b2bRevenueAnnual)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Option A: Purchasing from Simples */}
              <div className="bg-rose-950/20 border border-rose-800/60 p-5 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                    Cliente Comprando no Simples Nacional
                  </span>
                  <span className="text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded font-bold">
                    ~{creditPassedSimplesRate.toFixed(1)}% de crédito
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono text-white">
                  {formatCurrencyBRL(creditAmountInSimplesAnnual)} <span className="text-xs font-normal text-slate-400">/ano</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  O cliente PJ só consegue creditar a parcela ínfima correspondente aos tributos recolhidos no DAS.
                </p>
              </div>

              {/* Option B: Purchasing from Regular Regime */}
              <div className="bg-emerald-950/20 border border-emerald-800/60 p-5 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    Cliente Comprando de Concorrente (LP / LR / Híbrido)
                  </span>
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                    {creditPassedRegularRate.toFixed(1)}% crédito pleno
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono text-emerald-400">
                  {formatCurrencyBRL(creditAmountInRegularAnnual)} <span className="text-xs font-normal text-slate-400">/ano</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  O cliente PJ abate 100% do IVA incidente sobre o produto/serviço, gerando alívio imediato no caixa fiscal dele.
                </p>
              </div>

            </div>

            {/* Disadvantage Banner */}
            {b2bPercentage > 25 && (
              <div className="bg-amber-950/30 p-5 rounded-xl border border-amber-800/80 border-l-4 border-l-amber-500 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Desvantagem Tributária Anual do seu Cliente PJ:</span>
                  </span>
                  <p className="text-xs text-slate-300">
                    Seus clientes corporativos deixam de recuperar em créditos tributários ao comprar de você:
                  </p>
                </div>
                <div className="text-2xl font-bold font-mono text-rose-400 shrink-0">
                  - {formatCurrencyBRL(b2bClientDisadvantageAnnual)} /ano
                </div>
              </div>
            )}

            {/* SPLIT PAYMENT SIMULATOR */}
            <div className="bg-[#0B0F19] p-5 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span 
                    className="font-bold text-white text-xs uppercase tracking-wider cursor-help flex items-center gap-1.5"
                    title="Split Payment: Sistema tecnológico de retenção automática do IBS e da CBS no momento do pagamento eletrônico da venda (PIX, cartão ou boleto), garantindo o repasse imediato ao Fisco e desonerando o capital de giro."
                  >
                    Simulador de Split Payment Bancário ({selectedYear}) <Info className="w-3.5 h-3.5 text-amber-400 inline" />
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                  {currentYearConfig.splitPaymentActive ? 'Ativo em ' + selectedYear : 'Inativo em ' + selectedYear}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Na liquidação de cada boleto, cartão ou PIX, a instituição financeira reterá na fonte o percentual de CBS/IBS devido e repassará automaticamente ao Comitê Gestor e à Receita Federal:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 bg-[#0F172A] rounded-lg border border-slate-800 shadow-xs">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Faturamento Bruto Mensal:</span>
                  <span className="font-bold text-white text-sm">{formatCurrencyBRL(monthlyRevenue)}</span>
                </div>
                <div className="p-3 bg-[#0F172A] rounded-lg border border-amber-800/60 shadow-xs">
                  <span className="text-[10px] text-amber-400 block uppercase font-medium">Retenção Split Payment:</span>
                  <span className="font-bold text-amber-400 text-sm">- {formatCurrencyBRL(splitRetainedMonthly)}</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5 font-normal">({(splitPaymentRate * 100).toFixed(2)}% da NF-e)</span>
                </div>
                <div className="p-3 bg-[#0F172A] rounded-lg border border-emerald-800/60 shadow-xs">
                  <span className="text-[10px] text-emerald-400 block uppercase font-medium">Líquido na Conta Corrente:</span>
                  <span className="font-bold text-emerald-400 text-sm">{formatCurrencyBRL(netCashReceivedMonthly)}</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5 font-normal">(Disponibilidade imediata)</span>
                </div>
              </div>
            </div>

            {/* Strategic Recommendation */}
            <div className="bg-blue-950/30 p-4 rounded-xl border border-blue-800/60 text-xs text-slate-300 space-y-2 leading-relaxed">
              <h4 className="font-bold text-white flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span className="text-xs">Diagnóstico & Diretriz Estratégica do Vértice Auditor Fiscal:</span>
              </h4>
              <p className="text-slate-300 text-[11px]">
                {b2bPercentage >= 60 && standaloneRbt12 > 1800000
                  ? `Como ${b2bPercentage}% do seu faturamento provém de clientes PJ e seu RBT12 é de ${formatCurrencyBRL(standaloneRbt12)}, a manutenção do Simples Nacional com crédito restrito de ~${creditPassedSimplesRate.toFixed(1)}% causará erosão na sua carteira de clientes após 2027. Recomendamos planejar a Opção pelo Simples Híbrido (IBS/CBS no regime não-cumulativo pleno transferindo crédito total de ${effectiveIvaRateFull.toFixed(1)}%) ou migração coordenada para o Lucro Presumido/Real.`
                  : `Como seu faturamento possui forte componente para o consumidor final (B2C) ou encontra-se em faixas iniciais do Simples Nacional, a simplicidade do DAS unificado continua sendo a solução mais vantajosa para sua operação, já que pessoas físicas não tomam crédito de IBS/CBS.`}
              </p>
            </div>

          </div>

        </div>
      </div>

      {/* Relatório Reforma Tributária Modal */}
      <ReportViewerModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reportType="reforma"
        company={company}
        calculation={calculation}
      />

      {/* TUTORIAL MODAL */}
      <ModuleTutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        moduleName="Impactos da Reforma Tributária"
        description="Acompanhe a transição do IBS e CBS (IVA Dual) e faça simulações de fluxo de caixa com split payment e transferência de crédito B2B para sua empresa."
      />
    </div>
  );
};
