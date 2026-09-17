import React, { useState } from 'react';
import { 
  Zap, 
  TrendingUp, 
  DollarSign, 
  HelpCircle, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Calculator,
  FileText,
  Play,
  RefreshCw,
  Sliders,
  ChevronRight,
  Info,
  Percent,
  PieChart as PieChartIcon,
  BarChart3,
  Activity
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer, 
  CartesianGrid, 
  Cell,
  AreaChart,
  Area,
  ReferenceLine,
  PieChart,
  Pie
} from 'recharts';
import { CompanyData, CalculationResult } from '../types';
import { formatCurrencyBRL, formatPercentBR, FATOR_R_THRESHOLD } from '../utils/taxRules';
import { HelpTooltip } from './HelpTooltip';
import { ReportViewerModal } from './ReportViewerModal';
import { ModuleTutorialModal } from './ModuleTutorialModal';
import { BrandLogo } from './BrandLogo';

interface FatorRCalculatorProps {
  company: CompanyData;
  onChangeCompany: (updated: CompanyData) => void;
  calculation: CalculationResult;
}

export const FatorRCalculator: React.FC<FatorRCalculatorProps> = ({
  company,
  onChangeCompany,
  calculation,
}) => {
  const [simulatedMonthlyPayrollAdd, setSimulatedMonthlyPayrollAdd] = useState<number>(0);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  const currentRbt12 = Math.max(1, company.rbt12);
  const currentPayroll12 = company.payroll12m || 0;
  const currentFatorR = (currentPayroll12 / currentRbt12) * 100;

  // Statutory requirement is strictly 28.00% (LC 123/06 Art. 18 § 5º-J)
  const requiredPayroll12 = Math.ceil(currentRbt12 * 0.28);
  const deficitPayroll12 = requiredPayroll12 - currentPayroll12; // missing payroll to hit 28%
  const monthlyAddNeeded = deficitPayroll12 > 0 ? Math.ceil(deficitPayroll12 / 12) : 0;

  // CPP (INSS Patronal) da Guia DAS / Encargos da Folha
  const [cppMonthly, setCppMonthly] = useState<number>(
    company.cppEncargos ? Math.round(company.cppEncargos / 12) : Math.round((currentPayroll12 || 1) * 0.11 / 12)
  );

  // Simulated calculations with additional payroll projection
  const simPayroll12 = currentPayroll12 + (simulatedMonthlyPayrollAdd * 12);
  const simFatorR = (simPayroll12 / currentRbt12) * 100;
  const simIsAnexo3 = simFatorR >= 28.0;

  // Detailed Tax Calculations (Anexo V vs Anexo III)
  // Anexo V effective rate (approx 18.0% average on middle brackets)
  // Anexo III effective rate (approx 10.5% average on middle brackets)
  const anexo5EstRate = 0.18;
  const anexo3EstRate = 0.105;
  const annualSimplesTaxAnexo5 = currentRbt12 * anexo5EstRate;
  const annualSimplesTaxAnexo3 = currentRbt12 * anexo3EstRate;
  const annualGrossTaxSavings = Math.max(0, annualSimplesTaxAnexo5 - annualSimplesTaxAnexo3);

  // Friction cost on PF for additional pro-labore (INSS 11% + IRRF average ~ 18% total cost)
  const annualProLaborePFRetentions = (simulatedMonthlyPayrollAdd * 12) * 0.18;
  const netAnnualFinancialBenefit = annualGrossTaxSavings - annualProLaborePFRetentions;

  // 1. Chart Data: Comparativo Custo Tributário Anual DAS
  const barChartData = [
    { name: 'Anexo V (Sem Fator R)', impostoAnual: Math.round(annualSimplesTaxAnexo5), fill: '#f43f5e' },
    { name: 'Anexo III (Com Fator R)', impostoAnual: Math.round(annualSimplesTaxAnexo3), fill: '#10b981' },
    { name: 'Economia Líquida Real', impostoAnual: Math.round(netAnnualFinancialBenefit > 0 ? netAnnualFinancialBenefit : annualGrossTaxSavings), fill: '#3b82f6' }
  ];

  // 2. Chart Data: Trajetória do Fator R % nos 12 meses
  const areaChartData = Array.from({ length: 12 }, (_, i) => {
    const month = `M${i + 1}`;
    const progressFactor = (i + 1) / 12;
    const accumPayrollSimulated = (currentPayroll12 * (1 - progressFactor)) + (simPayroll12 * progressFactor);
    const fatorRProgressivo = Math.min(100, (accumPayrollSimulated / currentRbt12) * 100);
    return {
      month,
      fatorRProjetado: Number(fatorRProgressivo.toFixed(2)),
      fatorRSemAjuste: Number(currentFatorR.toFixed(2)),
      corte: 28.0
    };
  });

  // 3. Chart Data: Repartição dos Tributos na Guia DAS Anexo III (com CPP Patronal 2,75%)
  const pieChartData = [
    { name: 'CPP Patronal (Embutido)', value: 43.50, color: '#10b981' },
    { name: 'ISS Municipal', value: 22.00, color: '#a855f7' },
    { name: 'COFINS Federal', value: 14.26, color: '#3b82f6' },
    { name: 'PIS / PASEP', value: 12.74, color: '#0284c7' },
    { name: 'IRPJ (Imposto de Renda)', value: 4.00, color: '#f59e0b' },
    { name: 'CSLL (Lucro Líquido)', value: 3.50, color: '#f43f5e' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      
      {/* Header Banner - Executive Clean Layout */}
      <div className="bg-[#0F172A] p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-xl space-y-5">
        
        {/* TOP ROW: BRAND LOGO & ENQUADRAMENTO KPI BADGES */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <BrandLogo variant="hero" module="simples" />

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Status do Enquadramento */}
            <div className={`px-3.5 py-2 rounded-xl border flex items-center space-x-2.5 ${
              currentFatorR >= 28 
                ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300' 
                : 'bg-amber-950/60 border-amber-800/80 text-amber-300'
            }`}>
              <div className={`w-2.5 h-2.5 rounded-full ${currentFatorR >= 28 ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-pulse'}`} />
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Enquadramento Tributário</div>
                <div className="text-xs font-bold text-white">
                  {currentFatorR >= 28 ? 'Anexo III (Alíquota Inicial 6,00%)' : 'Anexo V (Alíquota Inicial 15,50%)'}
                </div>
              </div>
            </div>

            {/* KPI Metric Box */}
            <div className="px-4 py-2 bg-[#0B0F19] rounded-xl border border-slate-800 flex items-center space-x-3">
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fator R (FS12/RBT12):</span>
                <span className={`text-xl font-black font-mono ${
                  currentFatorR >= 28 ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {currentFatorR.toFixed(2)}%
                </span>
              </div>
              <span className="text-[9px] text-slate-500 font-mono border-l border-slate-800 pl-2.5">
                Meta: ≥ 28.00%
              </span>
            </div>
          </div>
        </div>

        {/* TITLE & DESCRIPTION */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Engenharia Tributária: Fator R (LC 123/06 Art. 18 § 5º-J)
            </span>
            <HelpTooltip
              title="O Mecanismo do Fator R"
              content="O Fator R é a divisão da Folha de Salários dos últimos 12 meses (incluindo pró-labore com INSS) pela RBT12. Atividades intelectuais (como software, advocacia, consultoria, clínicas) enquadradas no Anexo V pagam 15,5% a 30,5%. Ao atingir Fator R ≥ 28%, são tributadas pelo Anexo III, com alíquota inicial de apenas 6%."
            />
          </div>
          <p className="text-slate-300 text-xs sm:text-sm max-w-4xl leading-relaxed">
            Empresas de serviços intelectuais, TI, medicina, engenharia e consultoria podem migrar do oneroso <b>Anexo V (alíquota inicial de 15,50%)</b> para o econômico <b>Anexo III (alíquota inicial de 6,00%)</b> caso a folha de salários e pró-labore represente pelo menos <b>28% da receita bruta (RBT12)</b> nos últimos 12 meses.
          </p>
        </div>

        {/* SUB-BAR / TOOLBAR WITH ACTIONS & PROGRESS BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-3 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-blue-600/20 transition cursor-pointer"
              title="Gerar e Visualizar Parecer Técnico Oficial do Fator R"
            >
              <FileText className="w-4 h-4 text-blue-100" />
              <span>Parecer Fator R 360°</span>
            </button>

            <button
              onClick={() => setIsTutorialOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/70 text-indigo-300 border border-indigo-800/70 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Play className="w-4 h-4 text-indigo-400" />
              <span>Como Funciona</span>
            </button>
          </div>

          {/* Fator R Progress Bar */}
          <div className="w-full md:w-80 space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>0%</span>
              <span className="text-amber-400 font-bold uppercase tracking-wider">Linha de Corte: 28%</span>
              <span>50%+</span>
            </div>
            <div className="relative w-full h-2.5 bg-[#0B0F19] rounded-full overflow-hidden border border-slate-800">
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
                style={{ left: '28%' }}
                title="Linha de corte de 28%"
              />
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  currentFatorR >= 28 ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(100, (currentFatorR / 50) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* FULL-WIDTH SECTION 1: PARÂMETROS DE FOLHA & CONTROLES */}
      <div className="bg-[#0F172A] p-6 sm:p-7 rounded-2xl border border-slate-800 space-y-6 shadow-xl w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-0.5">Diagnóstico & Calibração de Folha</p>
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Calculator className="w-5 h-5 text-blue-400" />
              <span>Parâmetros de Folha & Simulador Pró-Labore</span>
            </h3>
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 bg-[#0B0F19] px-3.5 py-2 rounded-xl border border-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Enquadramento Legal: <b>LC 123/06 Art. 18 § 5º-J</b></span>
          </div>
        </div>

        {/* 4-COLUMN HORIZONTAL GRID FOR METRICS & INPUTS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Receita Bruta Acumulada */}
          <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              1. Receita Bruta Acumulada (RBT12):
            </span>
            <div className="text-lg font-bold font-mono text-blue-400">
              {formatCurrencyBRL(currentRbt12)}
            </div>
            <span className="text-[10px] text-slate-500 block">Base de cálculo dos últimos 12 meses</span>
          </div>

          {/* Card 2: Folha Atual 12 Meses (FS12) */}
          <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800 space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              2. Folha Atual 12 Meses (FS12):
            </label>
            <div className="space-y-1.5">
              <input
                type="number"
                value={company.payroll12m}
                onChange={(e) => onChangeCompany({ ...company, payroll12m: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#090D16] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono font-bold focus:border-blue-500 focus:outline-none"
                placeholder="0,00"
              />
              <div className="text-[11px] font-mono font-bold text-emerald-400">
                Formatado: {formatCurrencyBRL(currentPayroll12)}
              </div>
            </div>
          </div>

          {/* Card 3: Folha Anual Necessária (28,00%) */}
          <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              3. Folha Anual Necessária (28,00%):
            </span>
            <div className="text-lg font-bold font-mono text-white">
              {formatCurrencyBRL(requiredPayroll12)}
            </div>
            <span className="text-[10px] text-amber-400 font-bold block">
              Equivale exatamente a 28,00% da RBT12
            </span>
          </div>

          {/* Card 4: Déficit ou Saldo Positivo Anual */}
          <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              4. Déficit / Ajuste Anual:
            </span>
            <div className={`text-lg font-bold font-mono ${deficitPayroll12 > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {deficitPayroll12 > 0 ? `+${formatCurrencyBRL(deficitPayroll12)}` : 'Meta já atingida'}
            </div>
            <span className="text-[10px] text-slate-400 block">
              {deficitPayroll12 > 0 ? 'Faltante para enquadrar no Anexo III' : 'Superávit positivo acima de 28%'}
            </span>
          </div>

        </div>

        {/* PROJEÇÃO PRÓ-LABORE & CPP PATRONAL (GUIA DAS / FOLHA) */}
        <div className="pt-4 border-t border-slate-800 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Projeção Pró-labore Mensal Necessária */}
            <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800 space-y-1.5 font-mono">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Projeção Pró-labore Mensal Necessária:
              </span>
              <div className="text-base font-bold text-blue-400">
                {monthlyAddNeeded > 0 ? `+${formatCurrencyBRL(monthlyAddNeeded)}/mês` : 'R$ 0,00 (Sem acréscimo necessário)'}
              </div>
              <p className="text-[10px] text-slate-500 font-sans">
                Acréscimo mensal no pró-labore dos sócios para atingir 28% em 12 meses.
              </p>
            </div>

            {/* Campo CPP (INSS Patronal) da Guia DAS / Encargos */}
            <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800 space-y-1.5 font-mono">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                CPP (INSS Patronal) Mensal (DAS / Folha):
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={cppMonthly}
                  onChange={(e) => setCppMonthly(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#090D16] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono font-bold focus:border-blue-500 focus:outline-none"
                  placeholder="0,00"
                />
              </div>
              <div className="text-[10px] text-indigo-300">
                Total CPP Anual Projetado: <b>{formatCurrencyBRL(cppMonthly * 12)}</b>
              </div>
            </div>

            {/* Ações Inteligentes para Projeção */}
            <div className="flex flex-col justify-center space-y-2">
              <button
                type="button"
                onClick={() => setSimulatedMonthlyPayrollAdd(monthlyAddNeeded)}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-md shadow-blue-600/20 flex items-center justify-center space-x-2"
              >
                <Sliders className="w-4 h-4" />
                <span>Projetar Adicional Complementar (+{formatCurrencyBRL(monthlyAddNeeded)}/mês)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const finalPayroll12 = Math.ceil(requiredPayroll12);
                  const finalMonthlyPayroll = Math.ceil(finalPayroll12 / 12);
                  onChangeCompany({
                    ...company,
                    payroll12m: finalPayroll12,
                    monthlyPayroll: finalMonthlyPayroll
                  });
                  setSimulatedMonthlyPayrollAdd(0);
                }}
                className="w-full py-2 px-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-800/80 transition cursor-pointer flex items-center justify-center space-x-2"
              >
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Gravar na Folha Real da Empresa</span>
              </button>
            </div>

          </div>

          {/* SLIDER DE AJUSTE MANUAL COMPLEMENTAR */}
          <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Simulador de Ajuste Adicional Complementar:
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-blue-400">
                Acréscimo Adicional: +{formatCurrencyBRL(simulatedMonthlyPayrollAdd)}/mês (+{formatCurrencyBRL(simulatedMonthlyPayrollAdd * 12)}/ano)
              </span>
            </div>

            <input
              type="range"
              min="0"
              max={Math.max(50000, monthlyAddNeeded * 3)}
              step="250"
              value={simulatedMonthlyPayrollAdd}
              onChange={(e) => setSimulatedMonthlyPayrollAdd(parseFloat(e.target.value) || 0)}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 border border-slate-700"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>R$ 0,00</span>
              <span>Projeção Complementar: {formatCurrencyBRL(simulatedMonthlyPayrollAdd)}</span>
              <span>R$ {Math.max(50000, monthlyAddNeeded * 3).toLocaleString('pt-BR')}</span>
            </div>
          </div>

        </div>
      </div>

      {/* FULL-WIDTH SECTION 2: ANÁLISE DE RESULTADOS, CLASSIFICAÇÃO E ARGUMENTAÇÃO FISCAL */}
      <div className="space-y-6 w-full">
        
        {/* PAINEL 1: STATUS DA CLASSIFICAÇÃO E FUNDAMENTAÇÃO JURÍDICA */}
        <div className={`p-6 rounded-2xl border shadow-xl ${
          simIsAnexo3 
            ? 'bg-emerald-950/30 border-emerald-800/80 border-l-4 border-l-emerald-500 text-emerald-300' 
            : 'bg-amber-950/30 border-amber-800/80 border-l-4 border-l-amber-500 text-amber-300'
        }`}>
          <div className="flex items-start space-x-4">
            {simIsAnexo3 ? (
              <CheckCircle className="w-7 h-7 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-7 h-7 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-2 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">
                    {simIsAnexo3 ? 'Classificação Regulamentar Otimizada' : 'Classificação Atual em Anexo Oneroso'}
                  </p>
                  <h4 className="text-lg font-bold text-white">
                    {simIsAnexo3 
                      ? 'Enquadramento Otimizado: ANEXO III (Economia Tributária Consolidada)' 
                      : 'Enquadramento Atual: ANEXO V (Carga Tributária Penalizadora)'}
                  </h4>
                </div>
                <div className="text-right font-mono text-xs">
                  <span className="text-slate-400">Fator R Projetado: </span>
                  <span className={`text-base font-bold ${simIsAnexo3 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {simFatorR.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
                <p>
                  <b>Fundamentação Jurídica (Lei Complementar nº 123/2006, Art. 18, § 5º-J):</b> As atividades de prestação de serviços intelectuais, tecnológicos, médicos e de engenharia enquadradas na regra do Fator R são tributadas pelo <b>Anexo V (alíquota inicial de 15,50%)</b> quando a razão entre a folha de salários dos últimos 12 meses (FS12) e a receita bruta acumulada (RBT12) for inferior a 28,00%.
                </p>
                <p>
                  {simIsAnexo3
                    ? `Com a folha projetada em ${formatCurrencyBRL(simPayroll12)} (representando ${simFatorR.toFixed(2)}% da RBT12), a empresa atinge a marca legal de 28,00% e adquire o direito incondicional de migrar para o ANEXO III (alíquota inicial de 6,00%), gerando redução expressiva de custo no DAS.`
                    : `Atualmente, a empresa possui folha acumulada de ${formatCurrencyBRL(currentPayroll12)} (${currentFatorR.toFixed(2)}% da RBT12). Para alcançar o enquadramento no Anexo III, é necessário um complemento acumulado em folha/pró-labore de ${formatCurrencyBRL(deficitPayroll12)} (${formatCurrencyBRL(monthlyAddNeeded)}/mês).`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* PAINEL 2: QUADRO COMPARATIVO DETALHADO E ARGUMENTATIVO (ANEXO V VS ANEXO III COM CPP) */}
        <div className="bg-[#0F172A] p-6 rounded-2xl border border-slate-800 space-y-5 shadow-xl w-full">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-0.5">Análise Comparativa Argumentativa</p>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Cenários de Tributação no Simples Nacional & Impacto da CPP Patronal</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Cenário sem Fator R (Anexo V) */}
            <div className="bg-[#0B0F19] p-5 rounded-xl border border-rose-900/30 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                  Cenário Sem Fator R (Anexo V - Desfavorável)
                </span>
                <span className="px-2.5 py-1 bg-rose-950/60 border border-rose-800/60 text-rose-300 rounded-lg text-[10px] font-bold font-mono">
                  Alíquota Inicial: 15.50%
                </span>
              </div>

              <div className="text-2xl font-black font-mono text-rose-400">
                ~ {formatCurrencyBRL(annualSimplesTaxAnexo5)} <span className="text-xs text-slate-400 font-sans font-normal">/ano</span>
              </div>

              <ul className="text-xs text-slate-300 space-y-2 leading-relaxed font-sans">
                <li className="flex items-start space-x-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span><b>Sem Otimização:</b> A empresa recolhe no DAS a alíquota cheia do Anexo V (entre 15,50% e 30,50%), penalizando o faturamento sem gerar ganho previdenciário aos sócios.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span><b>CPP embutida no DAS:</b> A Contribuição Patronal Previdenciária (CPP) está inclusa na alíquota do Anexo V, porém a custo tributário significativamente elevado.</span>
                </li>
              </ul>
            </div>

            {/* Cenário com Fator R (Anexo III) */}
            <div className="bg-[#0B0F19] p-5 rounded-xl border border-emerald-900/40 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Cenário Com Fator R (Anexo III - Otimizado)
                </span>
                <span className="px-2.5 py-1 bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 rounded-lg text-[10px] font-bold font-mono">
                  Alíquota Inicial: 6.00%
                </span>
              </div>

              <div className="text-2xl font-black font-mono text-emerald-400">
                ~ {formatCurrencyBRL(annualSimplesTaxAnexo3)} <span className="text-xs text-slate-400 font-sans font-normal">/ano</span>
              </div>

              <ul className="text-xs text-slate-300 space-y-2 leading-relaxed font-sans">
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><b>Otimização Máxima:</b> Alíquota efetiva reduzida para a faixa de 6,00% a 10,50%, gerando alívio imediato no caixa mensal da empresa.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><b>Partilha da Guia DAS no Anexo III:</b> A alíquota do Anexo III já contempla <b>2,75% de CPP Patronal embutido no DAS</b>, além de IRPJ (0,35%), CSLL (0,21%), PIS (0,95%) e COFINS (1,74%), garantindo quitação tributária plena sem bitributação.</span>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* PAINEL 3: QUADRO EXECUTIVO DE ECONOMIA TRIBUTÁRIA E GANHO PATRIMONIAL LÍQUIDO REAL */}
        <div className="bg-[#0F172A] p-6 rounded-2xl border border-blue-500/30 space-y-5 shadow-xl w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Demonstrativo de Ganho Real ao Empresário</p>
              <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <span>Balanço de Economia Tributária vs. Retenção na Pessoa Física</span>
              </h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Economia Bruta no DAS:</span>
              <span className="text-xl font-black font-mono text-emerald-400">
                {formatCurrencyBRL(annualGrossTaxSavings)} /ano
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase block">1. Economia Bruta CNPJ (DAS):</span>
              <div className="text-base font-bold text-emerald-400">+{formatCurrencyBRL(annualGrossTaxSavings)}/ano</div>
              <p className="text-[10px] text-slate-500 font-sans">Redução no recolhimento do Simples Nacional ao migrar do Anexo V para o III.</p>
            </div>

            <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase block">2. Custo de Retenção PF (INSS/IRRF):</span>
              <div className="text-base font-bold text-amber-400">-{formatCurrencyBRL(annualProLaborePFRetentions)}/ano</div>
              <p className="text-[10px] text-slate-500 font-sans">Encargos de INSS (11%) e IRPF incidente sobre o pró-labore complementar.</p>
            </div>

            <div className="bg-[#0B0F19] p-4 rounded-xl border border-emerald-500/30 space-y-1">
              <span className="text-[10px] text-emerald-400 font-bold uppercase block">3. Ganho Patrimonial Líquido Real:</span>
              <div className="text-lg font-black text-emerald-400">+{formatCurrencyBRL(netAnnualFinancialBenefit)}/ano</div>
              <p className="text-[10px] text-emerald-300 font-sans">Lucro líquido mantido no patrimônio dos sócios após todas as retenções tributárias.</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-[#0B0F19] p-4 rounded-xl border border-slate-800">
            <b>Nota Técnica da Auditoria:</b> O reajuste planejado do pró-labore não é um custo desperdiçado, pois o valor retido a título de INSS contribui diretamente para a aposentadoria e CND dos sócios na Pessoa Física. Além disso, a economia gerada no CNPJ (Simples Nacional) supera amplamente o custo de retenção da PF, garantindo um ganho patrimonial líquido real irrefutável para a empresa.
          </p>
        </div>

        {/* MÓDULO VISUAL: GRÁFICOS ANALÍTICOS E SIMULAÇÃO DE CURVAS DO FATOR R */}
        <div className="bg-[#0F172A] p-6 rounded-2xl border border-slate-800 space-y-6 shadow-xl w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Painel de Inteligência Gráfica</p>
              <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <span>Modelagem Visual de Desempenho Tributário & Repartição do Fator R</span>
              </h3>
            </div>
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Modelagem dinâmica ativa</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* GRÁFICO 1: COMPARATIVO DE CUSTO TRIBUTÁRIO ANUAL */}
            <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                  <BarChart3 className="w-4 h-4 text-rose-400" />
                  <span>Custo Tributário DAS Anual (R$)</span>
                </span>
                <p className="text-[10px] text-slate-400 mt-1 font-sans">
                  Comparação direta entre recolhimento no Anexo V, Anexo III e Ganho Líquido.
                </p>
              </div>

              <div className="h-56 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={{ stroke: '#334155' }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={{ stroke: '#334155' }} tickFormatter={(val) => `R$ ${(val/1000).toFixed(0)}k`} />
                    <RechartsTooltip 
                      formatter={(val: number) => [formatCurrencyBRL(val), 'Valor Anual']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                    />
                    <Bar dataKey="impostoAnual" radius={[6, 6, 0, 0]}>
                      {barChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* GRÁFICO 2: TRAJETÓRIA DO FATOR R VS CORTE LEGAL DE 28% */}
            <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Evolução do Fator R (%) nos 12 Meses</span>
                </span>
                <p className="text-[10px] text-slate-400 mt-1 font-sans">
                  Curva de convergência mensal ao teto regulamentar de 28,00%.
                </p>
              </div>

              <div className="h-56 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={areaChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorFatorR" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={{ stroke: '#334155' }} />
                    <YAxis domain={[0, 40]} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={{ stroke: '#334155' }} tickFormatter={(val) => `${val}%`} />
                    <RechartsTooltip 
                      formatter={(val: number) => [`${val.toFixed(2)}%`, 'Fator R']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                    />
                    <ReferenceLine y={28} label={{ value: 'Linha de Corte 28%', fill: '#f59e0b', fontSize: 10, position: 'top' }} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={2} />
                    <Area type="monotone" dataKey="fatorRProjetado" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorFatorR)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* GRÁFICO 3: REPARTIÇÃO DA GUIA DAS NO ANEXO III (CPP 2.75%) */}
            <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                  <PieChartIcon className="w-4 h-4 text-purple-400" />
                  <span>Repartição dos Tributos no Anexo III</span>
                </span>
                <p className="text-[10px] text-slate-400 mt-1 font-sans">
                  Destaque para a <b>CPP Patronal (43,50% do DAS)</b> recolhida sem bitributação.
                </p>
              </div>

              <div className="h-56 w-full flex items-center justify-center pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`pie-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(val: number) => [`${val.toFixed(2)}% da Guia DAS`, 'Participação']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Mini Legenda Executiva */}
              <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-300 font-sans pt-1 border-t border-slate-800">
                {pieChartData.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-1.5 truncate">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                    <span className="truncate">{item.name}: <b>{item.value}%</b></span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Parecer Fator R Modal */}
      <ReportViewerModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reportType="fator_r"
        company={company}
        calculation={calculation}
      />

      {/* TUTORIAL MODAL */}
      <ModuleTutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        moduleName="Engenharia do Fator R"
        description="Aprenda a aplicar o Fator R de forma legal de acordo com a Lei Complementar 123/06 para reduzir o imposto do Anexo V (15,5%) para o Anexo III (6%) com o pró-labore ideal."
      />
    </div>
  );
};

