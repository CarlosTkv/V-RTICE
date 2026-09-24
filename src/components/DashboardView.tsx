import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Building, 
  Sparkles,
  ShieldAlert,
  ArrowUpRight,
  BookOpen,
  HelpCircle,
  FileCheck2,
  PieChart,
  Tag,
  Scale,
  Percent,
  Layers,
  BarChart3,
  Lock,
  ShieldCheck,
  Crown,
  Upload,
  FileText,
  GripVertical,
  Sliders,
  RotateCcw,
  LayoutGrid,
  Play,
  Calendar,
  ChevronRight,
  Clock,
  Zap,
  CheckCircle,
  Eye,
  Activity,
  Trash2
} from 'lucide-react';
import { CompanyData, CalculationResult, AppViewMode, DashboardWidgetConfig, DashboardWidgetId, ObrigacaoFiscal } from '../types';
import { OBRIGACOES_DATABASE } from './AgendaFiscalView';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell, 
  CartesianGrid 
} from 'recharts';
import { 
  formatCurrencyBRL, 
  STATE_SUBLIMIT, 
  FEDERAL_LIMIT, 
  CRITICAL_EXCLUSION_THRESHOLD 
} from '../utils/taxRules';
import { ConsolidatedCNDReportsModal } from './ConsolidatedCNDReportsModal';
import { HelpTooltip } from './HelpTooltip';
import { ModuleIcon } from './ModuleIcon';
import { BrandLogo, BrandModuleKey, BRAND_MODULE_CONFIGS } from './BrandLogo';
import { 
  loadSavedWidgetConfigs, 
  saveWidgetConfigs, 
  resetWidgetConfigs 
} from '../utils/widgetStorage';
import { DashboardWidgetCustomizerModal } from './DashboardWidgetCustomizerModal';
import { ModuleTutorialModal } from './ModuleTutorialModal';
import { GlobalCapCapacityBar } from './societario/GlobalCapCapacityBar';
import { CockpitExecutiveSummary } from './dashboard/CockpitExecutiveSummary';

interface DashboardViewProps {
  company: CompanyData;
  onChangeCompany: (company: CompanyData) => void;
  calculation: CalculationResult;
  onNavigateToTab: (tab: any) => void;
  onOpenManual?: () => void;
  onOpenPDFUpload?: () => void;
  isMaster?: boolean;
  viewMode?: AppViewMode;
  showToast?: (msg: string) => void;
  onClearCompanyData?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  company,
  onChangeCompany,
  calculation,
  onNavigateToTab,
  onOpenManual,
  onOpenPDFUpload,
  isMaster = false,
  viewMode = 'master',
  showToast,
  onClearCompanyData,
}) => {
  const currentRbt12 = Math.max(1, company.rbt12);
  const consolidated = calculation.consolidatedRevenue;
  const growth = (company.projectionGrowthPercent || 15) / 100;
  const isClienteRelatorio = viewMode === 'cliente_relatorio';

  // Draggable Widget System State
  const [widgets, setWidgets] = useState<DashboardWidgetConfig[]>(() => loadSavedWidgetConfigs());
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [draggedWidgetId, setDraggedWidgetId] = useState<DashboardWidgetId | null>(null);
  const [dragOverWidgetId, setDragOverWidgetId] = useState<DashboardWidgetId | null>(null);

  // Time horizon toggle: 'annual' (Custo Anual) vs 'monthly' (Mensal / Guia DAS)
  const [timeHorizon, setTimeHorizon] = useState<'annual' | 'monthly'>('annual');
  // Dynamic What-If Slider Simulator (+/- % faturamento)
  const [whatIfPercent, setWhatIfPercent] = useState<number>(0);

  // Health Score Calculation 360 (0 to 100)
  const healthScore = useMemo(() => {
    let score = 100;
    // Penalize if exceeds limits
    if (calculation.exceedsFederalLimit) score -= 45;
    else if (calculation.exceedsSublimit) score -= 25;
    else if (company.rbt12 >= 3200000) score -= 10;

    // Fator R status
    if (calculation.fatorR < 28 && (company.anexo === 'V' || !company.anexo)) {
      score -= 15;
    }

    // Partner irregularity
    if (calculation.hasPartnerIrregularity) score -= 20;

    return Math.max(15, Math.min(100, score));
  }, [calculation, company]);

  // Modal de Relatórios Consolidados de CNDs
  const [showConsolidatedCndModal, setShowConsolidatedCndModal] = useState<boolean>(false);

  // Interactive Checklist State for LC 123/06
  const [manualChecklist, setManualChecklist] = useState<{ [key: string]: boolean }>(() => {
    try {
      const saved = localStorage.getItem('vertice_fiscal_checklist_lc123');
      return saved ? JSON.parse(saved) : {
        inscricao: true,
        defis: true,
        semDebitos: false,
        atividadePermitida: true
      };
    } catch {
      return {
        inscricao: true,
        defis: true,
        semDebitos: false,
        atividadePermitida: true
      };
    }
  });

  const toggleManualItem = (key: string) => {
    const updated = { ...manualChecklist, [key]: !manualChecklist[key] };
    setManualChecklist(updated);
    localStorage.setItem('vertice_fiscal_checklist_lc123', JSON.stringify(updated));
  };

  // Drag handlers for direct inline reordering
  const handleCardDragStart = (e: React.DragEvent, id: DashboardWidgetId) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedWidgetId(id);
  };

  const handleCardDragOver = (e: React.DragEvent, id: DashboardWidgetId) => {
    e.preventDefault();
    if (dragOverWidgetId !== id) {
      setDragOverWidgetId(id);
    }
  };

  const handleCardDrop = (e: React.DragEvent, dropTargetId: DashboardWidgetId) => {
    e.preventDefault();
    if (!draggedWidgetId || draggedWidgetId === dropTargetId) {
      setDraggedWidgetId(null);
      setDragOverWidgetId(null);
      return;
    }

    const fromIdx = widgets.findIndex(w => w.id === draggedWidgetId);
    const toIdx = widgets.findIndex(w => w.id === dropTargetId);

    if (fromIdx !== -1 && toIdx !== -1) {
      const updated = [...widgets];
      const [moved] = updated.splice(fromIdx, 1);
      updated.splice(toIdx, 0, moved);

      const reordered = updated.map((w, i) => ({ ...w, order: i }));
      setWidgets(reordered);
      saveWidgetConfigs(reordered);
      if (showToast) showToast('Posição do widget atualizada!');
    }

    setDraggedWidgetId(null);
    setDragOverWidgetId(null);
  };

  const handleSaveWidgets = (updatedWidgets: DashboardWidgetConfig[]) => {
    setWidgets(updatedWidgets);
    saveWidgetConfigs(updatedWidgets);
  };

  const handleResetWidgets = () => {
    const defaultConfigs = resetWidgetConfigs();
    setWidgets(defaultConfigs);
  };

  // Chart 1: 12-Month Projection trajectory
  const trajectoryData = [
    { month: 'Mês -6', revenue: currentRbt12 * 0.82, sublimit: STATE_SUBLIMIT, federalLimit: FEDERAL_LIMIT, criticalLimit: CRITICAL_EXCLUSION_THRESHOLD },
    { month: 'Mês -3', revenue: currentRbt12 * 0.91, sublimit: STATE_SUBLIMIT, federalLimit: FEDERAL_LIMIT, criticalLimit: CRITICAL_EXCLUSION_THRESHOLD },
    { month: 'Atual (RBT12)', revenue: currentRbt12, sublimit: STATE_SUBLIMIT, federalLimit: FEDERAL_LIMIT, criticalLimit: CRITICAL_EXCLUSION_THRESHOLD },
    { month: '+3 Meses', revenue: currentRbt12 * (1 + (growth * 0.25)), sublimit: STATE_SUBLIMIT, federalLimit: FEDERAL_LIMIT, criticalLimit: CRITICAL_EXCLUSION_THRESHOLD },
    { month: '+6 Meses', revenue: currentRbt12 * (1 + (growth * 0.50)), sublimit: STATE_SUBLIMIT, federalLimit: FEDERAL_LIMIT, criticalLimit: CRITICAL_EXCLUSION_THRESHOLD },
    { month: '+12 Meses (Proj)', revenue: currentRbt12 * (1 + growth), sublimit: STATE_SUBLIMIT, federalLimit: FEDERAL_LIMIT, criticalLimit: CRITICAL_EXCLUSION_THRESHOLD },
  ];

  // Chart 2: Regimes Comparison (4 Regimes) - Adaptable to Annual or Monthly
  const divisor = timeHorizon === 'monthly' ? 12 : 1;
  const regimeComparisonData = [
    { 
      name: 'Simples Padrão', 
      impostoAnual: Math.round(calculation.effectiveTaxAnnual / divisor), 
      aliquotaEfetiva: calculation.effectiveRate,
      fill: calculation.exceedsFederalLimit ? '#ef4444' : '#2563eb'
    },
    { 
      name: 'Simples Híbrido', 
      impostoAnual: Math.round(calculation.simplesHibridoAnnualTax / divisor), 
      aliquotaEfetiva: calculation.simplesHibridoEffectiveRate,
      fill: '#0284c7' 
    },
    { 
      name: 'Lucro Presumido', 
      impostoAnual: Math.round(calculation.lucroPresumidoAnnualTax / divisor), 
      aliquotaEfetiva: calculation.lucroPresumidoEffectiveRate,
      fill: '#6366f1' 
    },
    { 
      name: 'Lucro Real', 
      impostoAnual: Math.round(calculation.lucroRealAnnualTax / divisor), 
      aliquotaEfetiva: calculation.lucroRealEffectiveRate,
      fill: '#059669' 
    },
  ];

  // Chart 3: Economy Projection (Savings vs Worst Regime)
  const maxTax = Math.max(...regimeComparisonData.map(d => d.impostoAnual));
  const economyData = regimeComparisonData.map(d => ({
    name: d.name,
    economiaAnual: Math.max(0, maxTax - d.impostoAnual),
    fill: d.fill
  })).sort((a, b) => b.economiaAnual - a.economiaAnual);

  // Helper map for widget visibility
  const isWidgetVisible = (id: DashboardWidgetId) => {
    const w = widgets.find(item => item.id === id);
    return w ? w.visible : true;
  };

  // Helper to render smart insights based on the calculation object
  const renderSmartSuggestion = (kpiId: string) => {
    const rbt12 = company.rbt12 || 0;
    const fatorR = calculation.fatorR || 0;
    const payroll = company.payroll12m || 0;
    
    if (kpiId === 'kpi_fator_r') {
      if (fatorR >= 20 && fatorR < 28) {
        const neededPróLabore = (rbt12 * 0.28) - payroll;
        const monthlyIncrease = Math.max(0, neededPróLabore / 12);
        return (
          <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[10px] text-amber-300 leading-relaxed flex items-start space-x-1.5 shadow-sm">
            <span className="font-bold shrink-0">💡 SUGESTÃO IA:</span>
            <span>Próximo do limite de 28%! Um ajuste de {formatCurrencyBRL(monthlyIncrease)}/mês em Pró-labore migra a empresa do Anexo V para o Anexo III, reduzindo a carga fiscal em ~9.5%.</span>
          </div>
        );
      }
      if (fatorR > 35) {
        const excessPróLabore = payroll - (rbt12 * 0.28);
        const monthlyReduction = Math.max(0, excessPróLabore / 12);
        if (monthlyReduction > 100) {
          return (
            <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[10px] text-blue-300 leading-relaxed flex items-start space-x-1.5 shadow-sm">
              <span className="font-bold shrink-0">💡 OTIMIZAÇÃO IA:</span>
              <span>Fator R de {fatorR.toFixed(1)}% elevado. Você pode reduzir o Pró-labore em até {formatCurrencyBRL(monthlyReduction)}/mês, economizando encargos patronais/INSS sem perder o Anexo III.</span>
            </div>
          );
        }
      }
      if (fatorR < 20) {
        return (
          <div className="mt-2 p-2 bg-slate-800/80 border border-slate-700/60 rounded-xl text-[10px] text-slate-300 leading-relaxed flex items-start space-x-1.5 shadow-sm">
            <span className="font-bold shrink-0">💡 PLANEJAMENTO IA:</span>
            <span>Tributando no Anexo V (a partir de 15,50%). Planeje a retirada de Pró-labore para enquadrar a empresa no Anexo III (alíquota inicial de 6,00%).</span>
          </div>
        );
      }
    }

    if (kpiId === 'kpi_aliquota') {
      if (rbt12 >= 3000000 && rbt12 < 3600000) {
        return (
          <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[10px] text-amber-300 leading-relaxed flex items-start space-x-1.5 shadow-sm">
            <span className="font-bold shrink-0">⚠️ ALERTA IA:</span>
            <span>Faturamento de {formatCurrencyBRL(rbt12)} está próximo do sublimite de R$ 3.6M. Atente para a necessidade de recolhimento de ICMS/ISS fora do DAS.</span>
          </div>
        );
      }
      if (calculation.hasPartnerIrregularity) {
        return (
          <div className="mt-2 p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[10px] text-rose-300 leading-relaxed flex items-start space-x-1.5 shadow-sm">
            <span className="font-bold shrink-0">⚠️ RISCO SOCIETÁRIO:</span>
            <span>Regra de faturamento consolidado ativa! Certifique se as outras coligações dos sócios com mais de 10% não ultrapassam R$ 4,8M somados.</span>
          </div>
        );
      }
      if (calculation.effectiveRate > 12) {
        return (
          <div className="mt-2 p-2 bg-slate-800/80 border border-slate-700/60 rounded-xl text-[10px] text-slate-300 leading-relaxed flex items-start space-x-1.5 shadow-sm">
            <span className="font-bold shrink-0">💡 COMPARAÇÃO IA:</span>
            <span>Alíquota efetiva de {calculation.effectiveRate.toFixed(2)}% elevada. Considere auditar custos operacionais e comparar com Lucro Presumido para o próximo ano.</span>
          </div>
        );
      }
    }

    if (kpiId === 'kpi_economia') {
      const savings = calculation.lucroPresumidoAnnualTax - calculation.effectiveTaxAnnual;
      if (savings > 0) {
        return (
          <div className="mt-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] text-emerald-300 leading-relaxed flex items-start space-x-1.5 shadow-sm">
            <span className="font-bold shrink-0">✅ PERFORMANCE IA:</span>
            <span>O Simples Nacional com Anexo III garante economia anual de {formatCurrencyBRL(savings)} sobre o Lucro Presumido. Opção ótima!</span>
          </div>
        );
      } else {
        return (
          <div className="mt-2 p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[10px] text-rose-300 leading-relaxed flex items-start space-x-1.5 shadow-sm">
            <span className="font-bold shrink-0">⚠️ OPORTUNIDADE IA:</span>
            <span>A apuração aponta desvantagem no Simples. Avalie migração para o Lucro Presumido ou alteração do mix de serviços urgentemente.</span>
          </div>
        );
      }
    }

    if (kpiId === 'kpi_rbt12') {
      if (rbt12 > 4000000 && rbt12 <= 4800000) {
        return (
          <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[10px] text-amber-300 leading-relaxed flex items-start space-x-1.5 shadow-sm">
            <span className="font-bold shrink-0">⚠️ LIMITE FEDERAL:</span>
            <span>Faturamento anual próximo de R$ 4,8M. Risco iminente de exclusão se o limite for ultrapassado em mais de 20%.</span>
          </div>
        );
      }
    }

    return null;
  };

  // Helper to render individual KPI widgets
  const renderKpiWidget = (id: DashboardWidgetId) => {
    if (!isWidgetVisible(id)) return null;

    const isDragging = draggedWidgetId === id;
    const isDragOver = dragOverWidgetId === id && draggedWidgetId !== id;

    // Premium styling and neon-like gradients for an "instagrammable" luxury look
    const baseClasses = "backdrop-blur-md p-5 rounded-2xl border transition-all duration-300 shadow-md space-y-2 relative group hover:-translate-y-1 hover:shadow-xl";
    let kpiClasses = "";
    let delay = 0.05;

    if (id === 'kpi_rbt12') {
      delay = 0.05;
      kpiClasses = `${baseClasses} ${
        isDragging 
          ? 'opacity-30 border-blue-500 scale-[0.98]' 
          : isDragOver 
          ? 'border-blue-400 ring-2 ring-blue-500/50 bg-blue-950/20' 
          : 'bg-gradient-to-br from-blue-950/30 via-slate-900/60 to-slate-900/80 border-blue-500/15 hover:border-blue-500/40 hover:shadow-[0_0_25px_rgba(59,130,246,0.08)]'
      }`;
    } else if (id === 'kpi_fator_r') {
      delay = 0.1;
      const isFatorROk = calculation.fatorR >= 28;
      kpiClasses = `${baseClasses} ${
        isDragging 
          ? 'opacity-30 border-blue-500 scale-[0.98]' 
          : isDragOver 
          ? 'border-blue-400 ring-2 ring-blue-500/50 bg-blue-950/20' 
          : isFatorROk
            ? 'bg-gradient-to-br from-emerald-950/30 via-slate-900/60 to-slate-900/80 border-emerald-500/15 hover:border-emerald-500/40 hover:shadow-[0_0_25px_rgba(16,185,129,0.08)]'
            : 'bg-gradient-to-br from-amber-950/30 via-slate-900/60 to-slate-900/80 border-amber-500/15 hover:border-amber-500/40 hover:shadow-[0_0_25px_rgba(245,158,11,0.08)]'
      }`;
    } else if (id === 'kpi_aliquota') {
      delay = 0.15;
      kpiClasses = `${baseClasses} ${
        isDragging 
          ? 'opacity-30 border-blue-500 scale-[0.98]' 
          : isDragOver 
          ? 'border-blue-400 ring-2 ring-blue-500/50 bg-blue-950/20' 
          : 'bg-gradient-to-br from-indigo-950/30 via-slate-900/60 to-slate-900/80 border-indigo-500/15 hover:border-indigo-500/40 hover:shadow-[0_0_25px_rgba(99,102,241,0.08)]'
      }`;
    } else if (id === 'kpi_economia') {
      delay = 0.2;
      kpiClasses = `${baseClasses} ${
        isDragging 
          ? 'opacity-30 border-blue-500 scale-[0.98]' 
          : isDragOver 
          ? 'border-blue-400 ring-2 ring-blue-500/50 bg-blue-950/20' 
          : 'bg-gradient-to-br from-emerald-950/45 via-slate-900/60 to-emerald-950/20 border-emerald-500/30 hover:border-emerald-400/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.12)]'
      }`;
    }

    const dragHandleHeader = (
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex items-center space-x-1 bg-slate-900/90 border border-slate-700 px-1.5 py-0.5 rounded-md text-[10px] text-slate-400 cursor-grab active:cursor-grabbing">
        <GripVertical className="w-3 h-3 text-slate-400" />
        <span>Arrastar</span>
      </div>
    );

    switch (id) {
      case 'kpi_rbt12':
        return (
          <motion.div
            key={`${company.id}_${id}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay, ease: 'easeOut' }}
            draggable
            onDragStart={(e) => handleCardDragStart(e as any, id)}
            onDragOver={(e) => handleCardDragOver(e as any, id)}
            onDrop={(e) => handleCardDrop(e as any, id)}
            className={kpiClasses}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Faturamento RBT12</span>
                <HelpTooltip
                  title="Receita Bruta Acumulada (RBT12)"
                  content="Soma das receitas brutas auferidas nos 12 meses anteriores ao período de apuração. Base legal para enquadramento nas faixas dos Anexos I a V e para determinação da Alíquota Efetiva do DAS com dedução da parcela oficial."
                  law="Art. 18, § 1º da LC 123/2006"
                />
              </div>
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-white">
                {formatCurrencyBRL(currentRbt12)}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                <span>Média mensal: {formatCurrencyBRL(currentRbt12 / 12)}</span>
              </div>
            </div>
            {renderSmartSuggestion(id)}
          </motion.div>
        );

      case 'kpi_fator_r':
        return (
          <motion.div
            key={`${company.id}_${id}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay, ease: 'easeOut' }}
            draggable
            onDragStart={(e) => handleCardDragStart(e as any, id)}
            onDragOver={(e) => handleCardDragOver(e as any, id)}
            onDrop={(e) => handleCardDrop(e as any, id)}
            className={kpiClasses}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fator R Atual</span>
                <HelpTooltip
                  title="Fator R (Folha / Faturamento)"
                  content="Relação percentual entre a Folha de Salários 12M (FS12, incluindo pró-labore, salários e CPP) e a Receita Bruta 12M (RBT12). Se FS12 / RBT12 ≥ 28%, a empresa tributa pelo Anexo III (a partir de 6%); se < 28%, tributa pelo Anexo V (a partir de 15,5%)."
                  law="Art. 18, §§ 5º-J e 5º-M da LC 123/2006"
                />
              </div>
              <div className={`p-2 rounded-lg ${
                calculation.fatorR >= 28 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
              }`}>
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-white flex items-center space-x-2">
                <span>{calculation.fatorR.toFixed(1)}%</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  calculation.fatorR >= 28 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {calculation.fatorR >= 28 ? 'Anexo III (6%)' : 'Anexo V (15.5%)'}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {calculation.fatorR >= 28 
                  ? 'Meta atingida (≥ 28%)' 
                  : `Faltam ${formatCurrencyBRL(Math.max(0, (currentRbt12 * 0.28) - company.payroll12m))} em pró-labore`}
              </div>
            </div>
            {renderSmartSuggestion(id)}
          </motion.div>
        );

      case 'kpi_aliquota':
        return (
          <motion.div
            key={`${company.id}_${id}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay, ease: 'easeOut' }}
            draggable
            onDragStart={(e) => handleCardDragStart(e as any, id)}
            onDragOver={(e) => handleCardDragOver(e as any, id)}
            onDrop={(e) => handleCardDrop(e as any, id)}
            className={kpiClasses}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Alíquota Efetiva DAS</span>
                <HelpTooltip
                  title="Alíquota Efetiva do Simples Nacional"
                  content="Alíquota real aplicada sobre o faturamento, calculada pela fórmula oficial: [(RBT12 × Alíquota Nominal) - Parcela a Deduzir (PD)] ÷ RBT12. Consolida IRPJ, CSLL, PIS, COFINS, CPP e ICMS/ISS em documento único de arrecadação (DAS)."
                  law="Art. 18, § 1º da LC 123/2006"
                />
              </div>
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-white">
                {calculation.effectiveRate.toFixed(2)}%
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Imposto Anual: {formatCurrencyBRL(calculation.effectiveTaxAnnual)}
              </div>
            </div>
            {renderSmartSuggestion(id)}
          </motion.div>
        );

      case 'kpi_economia':
        return (
          <motion.div
            key={`${company.id}_${id}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay, ease: 'easeOut' }}
            draggable
            onDragStart={(e) => handleCardDragStart(e as any, id)}
            onDragOver={(e) => handleCardDragOver(e as any, id)}
            onDrop={(e) => handleCardDrop(e as any, id)}
            className={kpiClasses}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Economia Anual Apurada</span>
                <HelpTooltip
                  title="Economia Tributária Anualizada (Auditoria)"
                  content="Economia financeira líquida obtida pela opção tributária mais eficiente frente aos regimes alternativos (Lucro Presumido ou Real), auditando tributos s/ faturamento, IRPJ/CSLL s/ lucro e a incidência da cota patronal de 20% do INSS."
                  law="LC 123/2006 c/c Lei 9.249/95 e Lei 9.718/98"
                />
              </div>
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                {formatCurrencyBRL(Math.max(0, calculation.lucroPresumidoAnnualTax - calculation.effectiveTaxAnnual))}
              </div>
              <div className="text-xs text-emerald-400/90 font-semibold mt-1">
                vs. Lucro Presumido ({calculation.bestRegimeRecommendation.split('(')[0]})
              </div>
            </div>
            {renderSmartSuggestion(id)}
          </motion.div>
        );

      default:
        return null;
    }
  };

  // Main Section Modular Renderers
  const renderMainSection = (id: DashboardWidgetId) => {
    if (!isWidgetVisible(id)) return null;

    const isDragging = draggedWidgetId === id;
    const isDragOver = dragOverWidgetId === id && draggedWidgetId !== id;

    const wrapperClasses = `transition relative group ${
      isDragging ? 'opacity-30 border border-blue-500 rounded-2xl' : isDragOver ? 'ring-2 ring-blue-500/50 rounded-2xl' : ''
    }`;

    const sectionDelays: { [key: string]: number } = {
      trilha_auditoria: 0.1,
      agenda_resumo: 0.12,
      pgdas_import: 0.13,
      checklist_lc123: 0.16,
      parametros_fiscais: 0.19,
      chart_trajectory: 0.22,
      chart_regimes: 0.25,
      chart_economia: 0.28,
    };
    const delay = sectionDelays[id] || 0.2;

    const dragHandleBanner = (
      <div className="flex items-center justify-end mb-1">
        <div 
          draggable
          onDragStart={(e) => handleCardDragStart(e, id)}
          onDragOver={(e) => handleCardDragOver(e, id)}
          onDrop={(e) => handleCardDrop(e, id)}
          className="opacity-0 group-hover:opacity-100 transition flex items-center space-x-1.5 bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-lg text-xs text-slate-300 cursor-grab active:cursor-grabbing shadow-md"
        >
          <GripVertical className="w-3.5 h-3.5 text-amber-400" />
          <span>Arrastar Módulo</span>
        </div>
      </div>
    );

    switch (id) {
      case 'central_relatorios':
        const relatorios = [
          {
            id: 'parecer',
            title: 'Laudo Pericial 360° & Parecer Técnico',
            category: 'Perícia & Fundamentação',
            desc: 'Laudo técnico completo timbrado em PDF com assinatura pericial e fundamentação na LC 123/06.',
            icon: FileCheck2,
            badge: 'Laudo Oficial PDF',
            color: 'blue',
            tab: 'parecer' as const
          },
          {
            id: 'regimes',
            title: 'Comparativo dos 4 Regimes Tributários',
            category: 'Planejamento Tributário',
            desc: 'Simulação de Simples Convencional, Simples Híbrido, Presumido e Real, auditando CPP patronal (20%).',
            icon: Scale,
            badge: '4 Regimes',
            color: 'indigo',
            tab: 'regimes' as const
          },
          {
            id: 'fator_r',
            title: 'Auditoria de Fator R & Folha Salarial',
            category: 'Otimização Salarial',
            desc: 'Validação do RBT12, FS12 e enquadramento nos Anexos III ou V, simulando o pró-labore ideal (28%).',
            icon: PieChart,
            badge: 'Anexo III vs V',
            color: 'amber',
            tab: 'fator_r' as const
          },
          {
            id: 'cfop',
            title: 'Segregação Monofásica & CFOPs',
            category: 'Recuperação Fiscal',
            desc: 'Segregação de produtos com PIS/COFINS Monofásico e ICMS-ST para redução da guia do DAS.',
            icon: Tag,
            badge: 'Substituição Tributária',
            color: 'emerald',
            tab: 'cfop' as const
          },
          {
            id: 'reforma',
            title: 'Reforma Tributária Dual (IBS / CBS 2026)',
            category: 'Transição IVA 2026-2033',
            desc: 'Análise de não-cumulatividade, transferência de créditos de fornecedores e Simples Híbrido.',
            icon: Sparkles,
            badge: 'Dual IBS/CBS',
            color: 'purple',
            tab: 'reforma' as const
          },
          {
            id: 'financeiro',
            title: 'DRE Executivo & Diagnóstico Financeiro',
            category: 'Gestão Empresarial',
            desc: 'Demonstração do Resultado do Exercício com margem operacional, custos tributários e lucro líquido.',
            icon: ArrowUpRight,
            badge: 'DRE & Margem',
            color: 'teal',
            tab: 'financeiro' as const
          },
          {
            id: 'projecao',
            title: 'Projeção RBT12 vs. Sublimite Estadual',
            category: 'Monitoramento de Teto',
            desc: 'Acompanhamento da trajetória em relação ao sublimite de R$ 3,6M (ICMS/ISS) e R$ 4,8M (Federal).',
            icon: BarChart3,
            badge: 'Projeção 12M',
            color: 'sky',
            tab: 'projecao' as const
          },
          {
            id: 'socios',
            title: 'Matriz Societária & Coligações',
            category: 'Auditoria de Grupo',
            desc: 'Mapeamento de participações em outras empresas >10% para evitar exclusão por faturamento global.',
            icon: Building,
            badge: 'Risco Societário',
            color: 'rose',
            tab: 'socios' as const
          },
          {
            id: 'historico',
            title: 'Histórico de Apurações & Memórias',
            category: 'Log Auditável',
            desc: 'Histórico de simulações, memórias de cálculo anteriores e acompanhamento de auditorias salvas.',
            icon: RotateCcw,
            badge: 'Memória Auditável',
            color: 'cyan',
            tab: 'historico' as const
          },
        ];

        return (
          <motion.div
            key={`${company.id}_${id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: 'easeOut' }}
            className={wrapperClasses}
          >
            {dragHandleBanner}
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                      Painel Consolidado de Diagnósticos
                    </span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs font-semibold text-slate-400">9 Relatórios Específicos do Sistema</span>
                  </div>
                  <h2 className="text-lg font-bold text-white flex items-center space-x-2 mt-0.5">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <span>Central de Relatórios Fiscais & Laudos Periciais</span>
                  </h2>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 text-xs font-mono font-bold self-start sm:self-auto">
                  Acesso Direto
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatorios.map((rel) => {
                  const Icon = rel.icon;
                  return (
                    <div
                      key={rel.id}
                      onClick={() => onNavigateToTab(rel.tab)}
                      className="bg-[#0B0F19] hover:bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 rounded-xl p-4 transition-all duration-200 flex flex-col justify-between space-y-3 cursor-pointer group shadow-md"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {rel.category}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900 text-blue-300 border border-slate-700">
                            {rel.badge}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors flex items-center space-x-2">
                          <Icon className="w-4 h-4 text-blue-400 shrink-0" />
                          <span>{rel.title}</span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                          {rel.desc}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-blue-400 group-hover:text-blue-300">
                        <span>Acessar Relatório</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        );

      case 'agenda_resumo':
        const savedStatus = (() => {
          try {
            const saved = localStorage.getItem('vertice_agenda_status_v2');
            return saved ? JSON.parse(saved) : {};
          } catch {
            return {};
          }
        })();
        
        const companyStatus = savedStatus[company.cnpj || 'geral'] || {};
        const monthlyObligations = OBRIGACOES_DATABASE.filter(ob => ob.recorrencia === 'Mensal');
        const pendingCount = monthlyObligations.filter(ob => (companyStatus[ob.id] || 'Pendente') === 'Pendente').length;
        const deliveredCount = monthlyObligations.filter(ob => companyStatus[ob.id] === 'Entregue').length;

        return (
          <motion.div
            key={`${company.id}_${id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: 'easeOut' }}
            className={wrapperClasses}
          >
            {dragHandleBanner}
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group/agenda space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800/50 pb-4 relative z-10">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white uppercase tracking-tight">Obrigações do Mês Corrente</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Controle de Entregas Mensais</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-slate-300">
                    {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                <div className="bg-[#0B0F19] p-4 rounded-2xl border border-slate-800 flex flex-col items-center justify-center space-y-1">
                  <div className="text-2xl font-black text-amber-400">{pendingCount}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Obrigações Pendentes</div>
                </div>
                <div className="bg-[#0B0F19] p-4 rounded-2xl border border-slate-800 flex flex-col items-center justify-center space-y-1">
                  <div className="text-2xl font-black text-emerald-400">{deliveredCount}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Obrigações Concluídas</div>
                </div>
                <div className="bg-[#0B0F19] p-4 rounded-2xl border border-slate-800 flex flex-col items-center justify-center space-y-1">
                  <div className="text-2xl font-black text-blue-400">{monthlyObligations.length}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Total Recorrente</div>
                </div>
                <div className="bg-[#0B0F19] p-4 rounded-2xl border border-slate-800 flex flex-col items-center justify-center space-y-1">
                  <div className="text-2xl font-black text-indigo-400">100%</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Conformidade Legal</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 relative z-10">
                {monthlyObligations.slice(0, 6).map((ob) => {
                  const status = companyStatus[ob.id] || 'Pendente';
                  return (
                    <div key={ob.id} className="flex items-center justify-between p-3.5 rounded-xl bg-[#0B0F19] border border-slate-800/80 hover:border-slate-700 transition group/item">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                          status === 'Entregue' 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                            : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        }`}>
                          {status === 'Entregue' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-200 group-hover/item:text-white transition-colors">{ob.sigla}</div>
                          <div className="text-[10px] text-slate-500 font-medium">{ob.diaEntregaSugerido}</div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${
                        status === 'Entregue' 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {status.toUpperCase()}
                      </span>
                    </div>
                  );
                })}
              </div>

              <button 
                onClick={() => onNavigateToTab('regimes' as any)}
                className="w-full py-3 px-4 bg-[#0B0F19] border border-slate-800 hover:border-slate-700 hover:bg-slate-900 rounded-xl text-xs font-bold text-slate-300 flex items-center justify-center space-x-2 transition group/btn cursor-pointer"
              >
                <span>Ver Agenda Completa e Histórico de Obrigações</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        );
      
      case 'obrigacoes_status':
        const currentSavedStatus = (() => {
          try {
            const saved = localStorage.getItem('vertice_agenda_status_v2');
            return saved ? JSON.parse(saved) : {};
          } catch {
            return {};
          }
        })();
        
        const currentCompanyStatus = currentSavedStatus[company.cnpj || 'geral'] || {};
        const monthlyObs = OBRIGACOES_DATABASE.filter(ob => {
          const idLower = ob.id.toLowerCase();
          const regimeEmpresa = company.regimeTributario || 'simples_nacional';
          if (regimeEmpresa === 'simples_nacional' && (idLower.includes('ecd') || idLower.includes('ecf'))) return false;
          if ((regimeEmpresa === 'lucro_presumido' || regimeEmpresa === 'lucro_real') && (idLower.includes('pgdas') || idLower.includes('defis'))) return false;
          return ob.recorrencia === 'Mensal';
        });

        const totalObs = monthlyObs.length;
        const doneObs = monthlyObs.filter(ob => currentCompanyStatus[ob.id] === 'Entregue').length;
        const progressPercent = totalObs > 0 ? Math.round((doneObs / totalObs) * 100) : 0;

        return (
          <motion.div
            key={`${company.id}_${id}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay }}
            className={wrapperClasses}
          >
            {dragHandleBanner}
            <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <ShieldCheck className="w-24 h-24 text-white" />
              </div>

              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <FileCheck2 className="w-5 h-5 text-emerald-500" />
                    Status de Obrigações
                  </h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Competência: {new Date().toLocaleDateString('pt-BR', { month: 'long' }).toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-emerald-400">{progressPercent}%</div>
                  <div className="text-[9px] text-slate-500 font-bold uppercase">Concluído</div>
                </div>
              </div>

              <div className="w-full bg-slate-900 h-2.5 rounded-full mb-8 overflow-hidden border border-slate-800">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                />
              </div>

              <div className="grid grid-cols-1 gap-3">
                {monthlyObs.map((ob) => {
                  const status = currentCompanyStatus[ob.id] || 'Pendente';
                  const isDone = status === 'Entregue';
                  return (
                    <div key={ob.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800/60 hover:border-slate-700 transition-all">
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${isDone ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`} />
                        <div>
                          <div className="text-xs font-bold text-slate-200">{ob.sigla}</div>
                          <div className="text-[10px] text-slate-500">{ob.diaEntregaSugerido}</div>
                        </div>
                      </div>
                      <div className={`text-[10px] font-black px-3 py-1 rounded-full border ${
                        isDone 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-slate-900 text-slate-500 border-slate-800'
                      }`}>
                        {isDone ? 'CONCLUÍDO' : 'PENDENTE'}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button 
                onClick={() => onNavigateToTab('dashboard')} // Fallback or specific agenda tab if defined
                className="w-full mt-6 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
              >
                Ver Agenda Completa <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        );

      case 'trilha_auditoria':
        if (isClienteRelatorio) return null;
        return (
          <motion.div
            key={`${company.id}_${id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: 'easeOut' }}
            className={wrapperClasses}
          >
            {dragHandleBanner}
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                    Metodologia Didática Linear
                  </span>
                  <h2 className="text-base font-bold text-white mt-0.5">
                    Trilha de Auditoria & Planejamento Tributário em 4 Passos
                  </h2>
                </div>
                {onOpenManual && (
                  <button
                    onClick={onOpenManual}
                    className="text-xs font-semibold text-blue-300 hover:text-blue-200 flex items-center gap-1.5 bg-blue-950/60 px-3 py-1.5 rounded-lg border border-blue-800/60 transition self-start sm:self-auto cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                    <span>Ver Manual Completo</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 transition-all duration-300">
                {/* PASSO 1 */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-[#0B0F19] hover:bg-slate-900/80 border border-slate-800 rounded-xl p-4 transition flex flex-col justify-between space-y-3 shadow-md hover:shadow-blue-900/20"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-bold text-[11px] border border-blue-500/30">
                        Passo 1
                      </span>
                      <ModuleIcon icon={PieChart} pattern="blue" size="sm" />
                    </div>
                    <h3 className="text-xs font-bold text-white">Diagnóstico & Folha</h3>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Valide RBT12 ({formatCurrencyBRL(currentRbt12)}), Fator R ({((calculation.fatorR || 0)).toFixed(1)}%) e enquadramento nos Anexos III ou V.
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigateToTab('fator_r')}
                    className="w-full text-left text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center justify-between pt-2 border-t border-slate-800 cursor-pointer"
                  >
                    <span>Auditar Fator R</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </motion.div>

                {/* PASSO 2 */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-[#0B0F19] hover:bg-slate-900/80 border border-slate-800 rounded-xl p-4 transition flex flex-col justify-between space-y-3 shadow-md hover:shadow-cyan-900/20"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-[11px] border border-amber-500/30">
                        Passo 2
                      </span>
                      <ModuleIcon icon={Scale} pattern="cyan" size="sm" />
                    </div>
                    <h3 className="text-xs font-bold text-white">Comparador 4 Regimes</h3>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Simule Simples, Presumido, Real e Híbrido, auditando o impacto da CPP patronal (20% CLT).
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigateToTab('regimes')}
                    className="w-full text-left text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center justify-between pt-2 border-t border-slate-800 cursor-pointer"
                  >
                    <span>Analisar Regimes</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </motion.div>

                {/* PASSO 3 */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-[#0B0F19] hover:bg-slate-900/80 border border-slate-800 rounded-xl p-4 transition flex flex-col justify-between space-y-3 shadow-md hover:shadow-emerald-900/20"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-[11px] border border-emerald-500/30">
                        Passo 3
                      </span>
                      <ModuleIcon icon={Tag} pattern="emerald" size="sm" />
                    </div>
                    <h3 className="text-xs font-bold text-white">CFOPs & Segregação</h3>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Segregue receitas monofásicas e Substituição Tributária (ICMS/PIS/COFINS) para reduzir o DAS.
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigateToTab('cfop')}
                    className="w-full text-left text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center justify-between pt-2 border-t border-slate-800 cursor-pointer"
                  >
                    <span>Segregar CFOPs</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </motion.div>

                {/* PASSO 4 */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-[#0B0F19] hover:bg-slate-900/80 border border-slate-800 rounded-xl p-4 transition flex flex-col justify-between space-y-3 shadow-md hover:shadow-purple-900/20"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-bold text-[11px] border border-purple-500/30">
                        Passo 4
                      </span>
                      <ModuleIcon icon={FileText} pattern="purple" size="sm" />
                    </div>
                    <h3 className="text-xs font-bold text-white">Parecer Pericial 360°</h3>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Emita o laudo técnico completo timbrado em PDF com assinatura do perito e fundamentação na LC 123.
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigateToTab('parecer')}
                    className="w-full text-left text-[11px] font-semibold text-purple-400 hover:text-purple-300 flex items-center justify-between pt-2 border-t border-slate-800 cursor-pointer"
                  >
                    <span>Gerar Parecer</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        );

      case 'pgdas_import':
        if (isClienteRelatorio || !onOpenPDFUpload) return null;
        return (
          <motion.div
            key={`${company.id}_${id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: 'easeOut' }}
            className={wrapperClasses}
          >
            {dragHandleBanner}
            <div 
              id="pgdas-declaracao-import-card"
              className="bg-gradient-to-r from-blue-950/40 via-slate-900/90 to-indigo-950/40 border-2 border-dashed border-blue-500/40 hover:border-blue-400/80 rounded-2xl p-5 shadow-lg transition duration-200"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start space-x-3.5">
                  <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400 border border-blue-500/30 shrink-0 mt-0.5">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-wider border border-blue-500/30">
                        Automação Fiscal PGDAS-D / e-CAC
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold flex items-center gap-1 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" /> Sistema 100% Apto para Importação
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white mt-1.5 flex items-center gap-2">
                      <span>Campo de Importação da Declaração PGDAS-D</span>
                    </h3>

                    <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                      Carregue o extrato oficial em PDF gerado no PGDAS-D ou cole o texto do portal e-CAC da Receita Federal. O sistema extrai e preenche automaticamente: <strong>RBT12 ({formatCurrencyBRL(company.rbt12)})</strong>, <strong>RBA ({formatCurrencyBRL(company.rba)})</strong>, <strong>Folha 12m ({formatCurrencyBRL(company.payroll12m)})</strong>, <strong>Fator R ({((company.payroll12m / (company.rbt12 || 1)) * 100).toFixed(1)}%)</strong>, <strong>CNAE</strong>, <strong>Anexos I a V</strong> e <strong>Segregações de ICMS-ST / ISS Retido</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                  <button
                    id="btn-importar-pgdas-declaracao"
                    onClick={onOpenPDFUpload}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md flex items-center justify-center space-x-2 cursor-pointer border border-blue-400/40 hover:scale-[1.02]"
                    title="Abrir janela de importação de arquivo PDF ou texto do PGDAS-D"
                  >
                    <Upload className="w-4 h-4 text-white" />
                    <span>Importar Declaração PGDAS-D</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'checklist_lc123':
        return (
          <motion.div
            key={`${company.id}_${id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: 'easeOut' }}
            className={wrapperClasses}
          >
            {dragHandleBanner}
            <div className="bg-[#0F172A]/85 backdrop-blur-xl p-6 sm:p-7 rounded-2xl border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Requisitos de Permanência (LC 123/06)</h3>
                    <p className="text-[11px] text-slate-400">Validação sistêmica e checklist interativo de obrigações</p>
                  </div>
                </div>
              </div>

              {/* Seção 1: Indicadores Automáticos */}
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Métricas Sistêmicas</div>
                {[
                  {
                    label: 'RBT12 dentro do Teto Federal (R$ 4.8M)',
                    ok: !calculation.exceedsFederalLimit,
                    val: formatCurrencyBRL(currentRbt12)
                  },
                  {
                    label: 'RBT12 dentro do Sublimite Estadual (R$ 3.6M)',
                    ok: !calculation.exceedsSublimit,
                    val: formatCurrencyBRL(currentRbt12)
                  },
                  {
                    label: 'Regularidade de Sócios (Art. 3º § 4º LC 123/06)',
                    ok: !calculation.hasPartnerIrregularity,
                    val: calculation.hasPartnerIrregularity ? 'Risco' : 'Regular'
                  },
                  {
                    label: 'Otimização do Fator R (Anexos III / V)',
                    ok: company.anexo === 'III' || calculation.fatorR >= 28,
                    val: `${calculation.fatorR.toFixed(1)}%`
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[#0B0F19]/80 border border-slate-800/60 hover:border-slate-700/60 transition">
                    <div className="flex items-center space-x-3">
                      {item.ok ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      )}
                      <span className="text-[11px] sm:text-xs text-slate-300 font-semibold">{item.label}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 hidden sm:block">{item.val}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        item.ok ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {item.ok ? 'OK' : 'PENDÊNCIA'}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Seção 2: Checklist Operacional Interativo */}
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4 mb-1">Obrigações e Cadastros (Interativo)</div>
                {[
                  {
                    key: 'inscricao',
                    label: 'Inscrição Estadual ativa e homologada'
                  },
                  {
                    key: 'defis',
                    label: 'Declaração anual DEFIS transmitida'
                  },
                  {
                    key: 'semDebitos',
                    label: 'Ausência de débitos impeditivos / CND Federal'
                  },
                  {
                    key: 'atividadePermitida',
                    label: 'CNAEs permitidos Simples Nacional'
                  }
                ].map((item) => {
                  const isChecked = manualChecklist[item.key] || false;
                  return (
                    <div 
                      key={item.key} 
                      onClick={() => toggleManualItem(item.key)}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#0B0F19]/80 border border-slate-800/60 hover:border-indigo-500/30 transition cursor-pointer select-none group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition ${
                          isChecked ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-700 group-hover:border-indigo-500'
                        }`}>
                          {isChecked && <span className="text-[10px] font-extrabold">✓</span>}
                        </div>
                        <span className={`text-[11px] sm:text-xs font-semibold transition ${
                          isChecked ? 'text-slate-200' : 'text-slate-400 line-through decoration-slate-800'
                        }`}>{item.label}</span>
                      </div>
                      <div>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          isChecked ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {isChecked ? 'OK' : 'PENDÊNCIA'}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Seção 3: Atalho do Caderno Consolidado de CNDs */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Caderno com 5 CNDs em 1 único PDF Oficial</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowConsolidatedCndModal(true)}
                    className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Gerar Caderno Consolidado de CNDs (PDF)</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'parametros_fiscais':
        return (
          <motion.div
            key={`${company.id}_${id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: 'easeOut' }}
            className={wrapperClasses}
          >
            {dragHandleBanner}
            {isClienteRelatorio ? (
              /* ÁREA DO CLIENTE: PAINEL EXCLUSIVAMENTE CONSULTIVO E HOMOLOGADO */
              <div className="bg-[#0F172A] p-6 sm:p-7 rounded-2xl border border-emerald-900/60 space-y-5 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Ficha Cadastral Homologada</span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs font-semibold text-slate-400">Certificada pela Assessoria</span>
                    </div>
                    <h2 className="text-lg font-bold text-white flex items-center space-x-2 mt-0.5">
                      <Building className="w-5 h-5 text-emerald-400" />
                      <span>{company.name}</span>
                    </h2>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      CNPJ: {company.cnpj} • CNAE: {company.cnae} ({company.cnaeDescription})
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400 uppercase font-semibold">UF Domicílio:</span>
                    <span className="px-3 py-1 rounded-lg bg-[#0B0F19] border border-slate-700 text-xs font-mono font-bold text-slate-200">
                      {company.uf}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Receita Bruta 12M (RBT12)</span>
                      <HelpTooltip
                        title="Receita Bruta Acumulada 12M"
                        content="Receita bruta dos últimos 12 meses considerada para enquadramento na tabela progressiva e determinação da parcela a deduzir."
                        law="Art. 18, § 1º da LC 123/2006"
                        size="xs"
                      />
                    </div>
                    <div className="text-xl font-bold font-mono text-blue-400">{formatCurrencyBRL(currentRbt12)}</div>
                    <span className="text-[10px] text-slate-500 block">Base homologada no parecer</span>
                  </div>

                  <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Receita no Ano (RBA)</span>
                      <HelpTooltip
                        title="Receita Bruta do Ano (RBA)"
                        content="Receita auferida no ano-calendário em curso. Utilizada para verificar se a empresa ultrapassará o sublimite estadual de R$ 3,6M ou o teto federal de R$ 4,8M."
                        law="Art. 3º, II e Art. 19 da LC 123/2006"
                        size="xs"
                      />
                    </div>
                    <div className="text-xl font-bold font-mono text-white">{formatCurrencyBRL(company.rba || currentRbt12)}</div>
                    <span className="text-[10px] text-slate-500 block">Ano-calendário corrente</span>
                  </div>

                  <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Enquadramento Simples</span>
                      <HelpTooltip
                        title="Anexo de Enquadramento Tributário"
                        content="Tabela de alíquotas aplicável de acordo com as atividades exercidas pela empresa (CNAE). Anexo I (Comércio), II (Indústria), III e V (Serviços sujeitos ao Fator R) e IV (Serviços com CPP recolhida à parte)."
                        law="Art. 18, §§ 4º, 5º-B, 5º-C, 5º-D, 5º-I da LC 123/2006"
                        size="xs"
                      />
                    </div>
                    <div className="text-xl font-bold font-mono text-emerald-400">Anexo {company.anexo}</div>
                    <span className="text-[10px] text-slate-500 block">LC 123/2006 Progressiva</span>
                  </div>

                  <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Folha + Pró-Labore (FS12)</span>
                      <HelpTooltip
                        title="Massa Salarial 12 Meses (FS12)"
                        content="Total gasto nos 12 meses anteriores com salários, remuneração de sócios (pró-labore), 13º salário, férias e encargos trabalhistas/previdenciários para cômputo do Fator R."
                        law="Art. 18, § 5º-J da LC 123/2006"
                        size="xs"
                      />
                    </div>
                    <div className="text-xl font-bold font-mono text-amber-400">{formatCurrencyBRL(company.payroll12m)}</div>
                    <span className="text-[10px] text-slate-500 block">Fator R: {((company.payroll12m / currentRbt12) * 100).toFixed(1)}%</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-900/60 flex items-start space-x-3 text-xs text-emerald-200">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-emerald-300">
                      Área Estritamente Consultiva (Modo Determinado pelo Perfil Master)
                    </p>
                    <p className="text-xs text-emerald-200/80 mt-0.5 leading-relaxed">
                      Os parâmetros fiscais e dados societários foram certificados pelo responsável técnico para a emissão do laudo pericial. Para solicitar ajustes ou reavaliação de cenários, entre em contato com seu escritório contábil.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* VISÃO MASTER E ESCRITÓRIO: CONTROLES INTERATIVOS DIDÁTICOS */
              <div className="bg-[#0F172A] p-6 sm:p-7 rounded-2xl border border-slate-800 space-y-5 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Parâmetros Operacionais</span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs text-slate-400">Configuração de Faturamento e Alíquotas</span>
                    </div>
                    <h2 className="text-base font-bold text-white flex items-center space-x-2 mt-0.5">
                      <Building className="w-5 h-5 text-blue-400" />
                      <span>{company.name}</span>
                    </h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400 uppercase font-semibold">UF Domicílio:</span>
                    <select
                      value={company.uf}
                      onChange={(e) => onChangeCompany({ ...company, uf: e.target.value })}
                      className="bg-[#0B0F19] border border-slate-700 text-xs font-mono text-slate-200 rounded-lg px-3 py-1.5 focus:border-blue-500 focus:outline-none cursor-pointer"
                    >
                      {['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'PE', 'CE', 'GO', 'DF', 'AM', 'PA', 'ES', 'MT', 'MS'].map((uf) => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* RBT12 Input */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                      Receita Bruta 12 Meses (RBT12):
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={company.rbt12}
                        onChange={(e) => onChangeCompany({ ...company, rbt12: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-blue-400 font-mono font-bold focus:bg-slate-950 focus:border-blue-500 focus:outline-none"
                      />
                      <span className="absolute right-3 top-2 text-xs text-slate-500 font-mono">BRL</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Teto Federal: R$ 4.800.000,00</p>
                  </div>

                  {/* RBA Input */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                      Receita Acumulada no Ano (RBA):
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={company.rba}
                        onChange={(e) => {
                          const newRba = parseFloat(e.target.value) || 0;
                          const newRbt12 = company.rbt12 === 0 ? newRba : company.rbt12;
                          onChangeCompany({ ...company, rba: newRba, rbt12: newRbt12 });
                        }}
                        className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 font-mono font-bold focus:bg-slate-950 focus:border-blue-500 focus:outline-none"
                      />
                      <span className="absolute right-3 top-2 text-xs text-slate-500 font-mono">BRL</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Ano-calendário corrente</p>
                  </div>

                  {/* Anexo Selector */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                      Anexo Simples Nacional:
                    </label>
                    <select
                      value={company.anexo}
                      onChange={(e) => onChangeCompany({ ...company, anexo: e.target.value as any })}
                      className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 font-semibold focus:bg-slate-950 focus:border-blue-500 focus:outline-none cursor-pointer"
                    >
                      <option value="I">Anexo I (Comércio - 4% a 19%)</option>
                      <option value="II">Anexo II (Indústria - 4.5% a 30%)</option>
                      <option value="III">Anexo III (Serviços / Fator R - 6% a 33%)</option>
                      <option value="IV">Anexo IV (Obras/Advocacia - 4.5% a 33%)</option>
                      <option value="V">Anexo V (Serviços Intelectuais - 15.5% a 30.5%)</option>
                    </select>
                    <p className="text-[10px] text-slate-500 mt-1">LC 123/2006 Progressiva</p>
                  </div>

                  {/* Payroll 12m Input */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                      Folha + Pró-Labore 12M (FS12):
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={company.payroll12m}
                        onChange={(e) => onChangeCompany({ ...company, payroll12m: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 font-mono font-bold focus:bg-slate-950 focus:border-blue-500 focus:outline-none"
                      />
                      <span className="absolute right-3 top-2 text-xs text-slate-500 font-mono">BRL</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Fator R Atual: {(company.payroll12m / currentRbt12 * 100).toFixed(1)}%</p>
                  </div>
                </div>

                {/* Sliders de Projeção e Margem */}
                <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1.5 font-semibold">
                      <span className="text-[11px] uppercase tracking-wider">Projeção Crescimento:</span>
                      <span className="text-blue-400 font-bold font-mono">+{company.projectionGrowthPercent}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="5"
                      value={company.projectionGrowthPercent}
                      onChange={(e) => onChangeCompany({ ...company, projectionGrowthPercent: parseInt(e.target.value) || 0 })}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 mb-1.5 font-semibold">
                      <span className="text-[11px] uppercase tracking-wider">Margem Lucro Líquido:</span>
                      <span className="text-emerald-400 font-bold font-mono">{company.estimatedNetProfitMargin}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="40"
                      step="1"
                      value={company.estimatedNetProfitMargin}
                      onChange={(e) => onChangeCompany({ ...company, estimatedNetProfitMargin: parseInt(e.target.value) || 15 })}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 mb-1.5 font-semibold">
                      <span className="text-[11px] uppercase tracking-wider">Vendas B2B (PJ):</span>
                      <span className="text-blue-400 font-bold font-mono">{company.b2bSalesPercent}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={company.b2bSalesPercent}
                      onChange={(e) => onChangeCompany({ ...company, b2bSalesPercent: parseInt(e.target.value) || 0 })}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        );

      case 'chart_trajectory':
        return (
          <motion.div
            key={`${company.id}_${id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: 'easeOut' }}
            className={wrapperClasses}
          >
            {dragHandleBanner}
            <div className="bg-[#0F172A] p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Análise de Receita Bruta</p>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4 text-blue-400" />
                    <span>Trajetória RBT12 vs. Sublimite</span>
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-[#0B0F19] text-slate-400 border border-slate-800">
                  LC 123/06
                </span>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trajectoryData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis dataKey="month" stroke="#94A3B8" fontSize={10} tickLine={false} fontFamily="monospace" />
                    <YAxis 
                      stroke="#94A3B8" 
                      fontSize={10} 
                      tickFormatter={(val) => `R$ ${(val / 1000000).toFixed(1)}M`} 
                      tickLine={false}
                      domain={[0, 6500000]}
                    />
                    <Tooltip 
                      formatter={(val: any) => [formatCurrencyBRL(Number(val)), '']}
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#F8FAFC', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }}
                    />
                    <Area type="monotone" dataKey="revenue" name="Faturamento RBT12" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#revenueGrad)" />
                    <Area type="monotone" dataKey="sublimit" name="Sublimite ICMS/ISS (3.6M)" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 4" fill="none" />
                    <Area type="monotone" dataKey="federalLimit" name="Teto Federal (4.8M)" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="6 3" fill="none" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium pt-3 border-t border-slate-800">
                <span className="flex items-center space-x-1.5 text-blue-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" />
                  <span>Receita Empresa</span>
                </span>
                <span className="flex items-center space-x-1.5 text-amber-400">
                  <span className="w-2.5 h-0.5 bg-amber-400 inline-block" />
                  <span>Sublimite ICMS (R$ 3.6M)</span>
                </span>
                <span className="flex items-center space-x-1.5 text-rose-400">
                  <span className="w-2.5 h-0.5 bg-rose-500 inline-block" />
                  <span>Teto Federal (R$ 4.8M)</span>
                </span>
              </div>
            </div>
          </motion.div>
        );

      case 'chart_regimes':
        return (
          <motion.div
            key={`${company.id}_${id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: 'easeOut' }}
            className={wrapperClasses}
          >
            {dragHandleBanner}
            <div className="bg-[#0F172A] p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Benchmark Tributário</p>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-blue-400" />
                    <span>Carga Tributária {timeHorizon === 'monthly' ? 'Mensal (DAS)' : 'Anual'}</span>
                  </h3>
                </div>
                <button
                  onClick={() => onNavigateToTab('reforma')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center cursor-pointer"
                >
                  Reforma 2026/27 <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
                </button>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regimeComparisonData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                    <YAxis 
                      stroke="#94A3B8" 
                      fontSize={10} 
                      tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`} 
                      tickLine={false}
                    />
                    <Tooltip 
                      formatter={(val: any, name: any, item: any) => [
                        `${formatCurrencyBRL(Number(val))} (${item.payload.aliquotaEfetiva.toFixed(2)}% efetiva)`, 
                        timeHorizon === 'monthly' ? 'Imposto Mensal Estimado' : 'Imposto Anual'
                      ]}
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#F8FAFC', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }}
                    />
                    <Bar dataKey="impostoAnual" radius={[6, 6, 0, 0]}>
                      {regimeComparisonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-3 bg-[#0B0F19] rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Regime Mais Econômico:</span>
                <span className="font-bold text-emerald-400 font-mono text-xs">
                  {calculation.bestRegimeRecommendation.split('(')[0]}
                </span>
              </div>
            </div>
          </motion.div>
        );

      case 'chart_economia':
        return (
          <motion.div
            key={`${company.id}_${id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: 'easeOut' }}
            className={wrapperClasses}
          >
            {dragHandleBanner}
            <div className="bg-[#0F172A] p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Análise de Redução de Custos</p>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Projeção de Economia Tributária</span>
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {timeHorizon === 'monthly' ? 'Em R$ Mensais' : 'Em R$ Anuais'}
                </span>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={economyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
                    <XAxis 
                      type="number" 
                      stroke="#94A3B8" 
                      fontSize={10} 
                      tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`} 
                      tickLine={false}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      stroke="#94A3B8" 
                      fontSize={10} 
                      tickLine={false}
                      width={110}
                    />
                    <Tooltip 
                      formatter={(val: any) => [
                        formatCurrencyBRL(Number(val)), 
                        'Economia Anual Projetada'
                      ]}
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#F8FAFC', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }}
                    />
                    <Bar dataKey="economiaAnual" radius={[0, 6, 6, 0]}>
                      {economyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.economiaAnual > 0 ? '#10b981' : '#64748b'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-3 bg-[#0B0F19] rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Maior Economia (vs. Pior Cenário):</span>
                <span className="font-bold text-emerald-400 font-mono text-xs">
                  {formatCurrencyBRL(economyData[0].economiaAnual)}
                </span>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  // Filter KPI & Section Widgets based on sorted order
  const sortedWidgets = [...widgets].sort((a, b) => a.order - b.order);
  const kpiWidgetIds = sortedWidgets.filter(w => w.category === 'kpi').map(w => w.id);
  const mainSectionWidgetIds = sortedWidgets.filter(w => w.category !== 'kpi').map(w => w.id);

  return (
    <div className="space-y-6 animate-fadeIn text-slate-200">
      
      {/* COCKPIT EXECUTIVO WIDESCREEN - DUAS COLUNAS PARA APROVEITAMENTO DE ESPAÇO */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* BRAND HERO BANNER - MATCHING IMAGE 2 LAYOUT */}
        <div className="xl:col-span-2 bg-[#0F172A] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-md relative overflow-hidden flex flex-col justify-between space-y-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          
          {/* TOP ROW: LOGO & EMPRESA SELECTOR */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10 border-b border-slate-800/80 pb-4">
            <BrandLogo variant="hero" />
            
            <div className="flex items-center space-x-2 shrink-0">
              <div className="px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-slate-800 text-xs flex items-center space-x-2">
                <Building className="w-4 h-4 text-blue-400" />
                <span className="text-slate-400">Empresa: </span>
                <span className="text-white font-bold">{company.name}</span>
                <span className="text-blue-400 font-semibold font-mono">({company.uf || 'SP'})</span>
              </div>
            </div>
          </div>

          {/* TOOLBAR BELOW LOGO: FUNCTIONALITIES & OPTIONS CATEGORIZED */}
          <div className="flex flex-wrap items-center justify-between gap-3 relative z-10 pt-1">
            {/* Left: Direct Report & Diagnostic Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onNavigateToTab('parecer')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md flex items-center space-x-1.5 cursor-pointer"
              >
                <FileCheck2 className="w-4 h-4 text-blue-100" />
                <span>Laudo Pericial 360°</span>
              </button>

              {onOpenPDFUpload && !isClienteRelatorio && (
                <button
                  id="btn-hero-import-pgdas"
                  onClick={onOpenPDFUpload}
                  className="px-3.5 py-2 rounded-xl bg-blue-950/70 hover:bg-blue-900/80 text-blue-300 border border-blue-800/70 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
                  title="Importar declaração oficial PGDAS-D em PDF ou Texto do e-CAC"
                >
                  <Upload className="w-4 h-4 text-blue-400" />
                  <span>Importar PGDAS-D</span>
                </button>
              )}

              {onClearCompanyData && !isClienteRelatorio && (
                <button
                  onClick={onClearCompanyData}
                  className="px-3.5 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/70 text-rose-300 border border-rose-800/70 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
                  title="Zerar e limpar os dados da empresa atual para iniciar nova importação do zero"
                >
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span>Limpar Dados da Empresa</span>
                </button>
              )}

              {!isClienteRelatorio && (
                <button
                  onClick={() => onNavigateToTab('financeiro')}
                  className="px-3.5 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/70 text-emerald-300 border border-emerald-800/70 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
                >
                  <span>Painel Financeiro & DRE</span>
                  <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                </button>
              )}

              {/* TOGGLE ANUAL VS MENSAL */}
              <div className="flex items-center bg-[#0B0F19] p-0.5 rounded-xl border border-slate-800 text-xs font-bold">
                <button
                  onClick={() => setTimeHorizon('annual')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    timeHorizon === 'annual'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Exibir projeções em base Anual"
                >
                  Visão Anual
                </button>
                <button
                  onClick={() => setTimeHorizon('monthly')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    timeHorizon === 'monthly'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Exibir projeções em base Mensal (Guia DAS / Mês)"
                >
                  Visão Mensal
                </button>
              </div>
            </div>

            {/* Right: System Tools & Organization */}
            <div className="flex flex-wrap items-center gap-2">
              {onOpenManual && !isClienteRelatorio && (
                <button
                  onClick={onOpenManual}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs border border-slate-800"
                  title="Abrir o Manual Passo a Passo do Sistema"
                >
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <span>Manual Didático</span>
                </button>
              )}

              <button
                onClick={() => setIsTutorialOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/70 text-indigo-300 border border-indigo-800/70 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <Play className="w-4 h-4 text-indigo-400" />
                <span>Como Funciona</span>
              </button>

              <button
                onClick={() => setIsCustomizerOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
                title="Personalizar e Reordenar Widgets do Dashboard (Drag & Drop)"
              >
                <LayoutGrid className="w-4 h-4 text-blue-400" />
                <span>Organizar Dashboard</span>
              </button>

              {isMaster && viewMode === 'master' && (
                <button
                  onClick={() => onNavigateToTab('gestao_planos')}
                  className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
                  title="Acesso Privado do Proprietário Carlos Miguel"
                >
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>Área Master (Planos)</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* HEALTH COCKPIT PANEL & REAL-TIME COMPLIANCE INDEX DINÂMICO */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-md relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
          
          <div className="relative z-10 flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center space-x-2">
              <span className={`flex h-2 w-2 rounded-full ${healthScore >= 80 ? 'bg-emerald-500' : healthScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'} animate-pulse`} />
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Cockpit de Conformidade</h3>
            </div>
            <span className="text-[10px] bg-[#0B0F19] border border-slate-800 text-slate-400 px-2.5 py-1 rounded-lg font-mono">
              Tempo Real
            </span>
          </div>

          <div className="relative z-10 flex items-center justify-between gap-4 py-3">
            <div className="space-y-1">
              <div className="text-2xl font-black text-white tracking-tight flex items-baseline gap-1">
                {healthScore.toFixed(1)}<span className="text-xs text-slate-400">%</span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Índice de Saúde Fiscal</p>
              <p className={`text-[10px] flex items-center gap-1 font-mono ${
                healthScore >= 80 ? 'text-emerald-400' : healthScore >= 60 ? 'text-amber-400' : 'text-rose-400'
              }`}>
                <span className="font-bold">▲ {healthScore >= 80 ? 'Excelente' : healthScore >= 60 ? 'Atenção Requerida' : 'Risco de Exclusão'}</span>
                {healthScore >= 80 ? 'sem riscos graves' : 'ver pendências'}
              </p>
            </div>

            <div className="w-16 h-16 relative flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="#1e293b" strokeWidth="4" fill="transparent" />
                <circle 
                  cx="32" 
                  cy="32" 
                  r="28" 
                  stroke={healthScore >= 80 ? '#10b981' : healthScore >= 60 ? '#f59e0b' : '#ef4444'} 
                  strokeWidth="4" 
                  fill="transparent"
                  strokeDasharray={175.9} 
                  strokeDashoffset={175.9 * (1 - (healthScore / 100))} 
                  strokeLinecap="round" 
                />
              </svg>
              <span className="absolute text-[11px] font-mono font-bold text-white">{Math.round(healthScore)}%</span>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-2 text-[11px] border-t border-slate-800/80 pt-3">
            <div className="bg-[#0B0F19] p-2 rounded-xl border border-slate-800/60 flex flex-col justify-between">
              <span className="text-slate-500 font-bold uppercase text-[8px] tracking-wider">Simples Nacional</span>
              <span className="text-white font-bold flex items-center gap-1 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${calculation.exceedsFederalLimit ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                {calculation.exceedsFederalLimit ? 'Excedido' : 'Ativo'}
              </span>
            </div>
            <div className="bg-[#0B0F19] p-2 rounded-xl border border-slate-800/60 flex flex-col justify-between">
              <span className="text-slate-500 font-bold uppercase text-[8px] tracking-wider">Fator R do Mês</span>
              <span className="text-white font-bold flex items-center gap-1 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${(calculation.fatorR || 0) >= 28 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                {(calculation.fatorR || 0).toFixed(1)}% ({(calculation.fatorR || 0) >= 28 ? 'III' : 'V'})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* BANNER EXECUTIVO PARA VISÃO CLIENTE */}
      {isClienteRelatorio && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-emerald-950/40 border border-emerald-900/60 rounded-2xl p-6 shadow-md flex flex-col justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[11px] font-bold uppercase tracking-wide border border-emerald-500/30 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  Área do Cliente (Consultiva)
                </span>
                <span className="text-xs text-emerald-400">• Parecer Pericial Disponível</span>
              </div>
              <h2 className="text-xl font-bold text-white">
                Diagnóstico Tributário: {company.name}
              </h2>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                Consulte abaixo a síntese da apuração de economia tributária, indicadores do Fator R e acesse o Parecer Técnico completo para deliberação da diretoria.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigateToTab('parecer')}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition shadow-lg flex items-center space-x-2 cursor-pointer"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Ler Parecer Técnico 360°</span>
              </button>
            </div>
          </div>

          {/* RESUMO DE OBRIGAÇÕES INTEGRADO NO BANNER PARA EMPRESA */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group/agenda flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-tight">Obrigações do Mês</h3>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Controle de Compliance</p>
                </div>
              </div>
              <span className="px-2 py-1 rounded-md bg-slate-900 border border-slate-800 text-[9px] font-bold text-slate-400">
                {new Date().toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 relative z-10">
              <div className="bg-[#0B0F19] p-3 rounded-xl border border-slate-800 flex flex-col items-center justify-center">
                <div className="text-2xl font-black text-amber-400">
                  {(() => {
                    const saved = localStorage.getItem('vertice_agenda_status_v2');
                    const companyStatus = saved ? (JSON.parse(saved)[company.cnpj || 'geral'] || {}) : {};
                    return OBRIGACOES_DATABASE.filter(ob => ob.recorrencia === 'Mensal' && (companyStatus[ob.id] || 'Pendente') === 'Pendente').length;
                  })()}
                </div>
                <div className="text-[9px] font-bold text-slate-500 uppercase">Pendentes</div>
              </div>
              <div className="bg-[#0B0F19] p-3 rounded-xl border border-slate-800 flex flex-col items-center justify-center">
                <div className="text-2xl font-black text-emerald-400">
                  {(() => {
                    const saved = localStorage.getItem('vertice_agenda_status_v2');
                    const companyStatus = saved ? (JSON.parse(saved)[company.cnpj || 'geral'] || {}) : {};
                    return OBRIGACOES_DATABASE.filter(ob => ob.recorrencia === 'Mensal' && companyStatus[ob.id] === 'Entregue').length;
                  })()}
                </div>
                <div className="text-[9px] font-bold text-slate-500 uppercase">Concluídas</div>
              </div>
            </div>
            
            <button 
              onClick={() => onNavigateToTab('agenda_fiscal' as any)}
              className="w-full mt-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-[10px] font-bold text-slate-400 uppercase tracking-widest transition"
            >
              Ver Agenda Completa
            </button>
          </div>
        </div>
      )}

      {/* AVISOS DE LIMITES FEDERAIS E SUBLIMITES */}
      {calculation.exceedsFederalLimit ? (
        <div className="bg-rose-950/30 border border-rose-800/80 border-l-4 border-l-rose-500 rounded-2xl p-5 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 bg-rose-500/20 rounded-xl text-rose-400 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-0.5">Risco Crítico de Exclusão</p>
              <h3 className="text-base font-bold text-rose-200">
                Teto Federal do Simples Nacional Excedido ({formatCurrencyBRL(consolidated)})
              </h3>
              <p className="text-xs text-rose-300/80 mt-1 leading-relaxed">
                {calculation.exclusionType === 'immediate_next_month'
                  ? 'Excesso superior a 20% do limite (> R$ 5,76M). A exclusão do Simples Nacional é OBRIGATÓRIA já a partir do mês subsequente ao excesso (Art. 3º § 9º da LC 123/06).'
                  : 'Excesso de até 20% do limite (entre R$ 4,8M e R$ 5,76M). A exclusão surtirá efeitos a partir de 1º de janeiro do próximo ano-calendário.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToTab('parecer')}
            className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition uppercase tracking-wider shadow-md cursor-pointer"
          >
            Ver Plano de Ação
          </button>
        </div>
      ) : calculation.exceedsSublimit ? (
        <div className="bg-amber-950/30 border border-amber-800/80 border-l-4 border-l-amber-500 rounded-2xl p-5 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-400 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-0.5">Sublimite Estadual Ultrapassado</p>
              <h3 className="text-base font-bold text-amber-200">
                Alerta de Sublimite Estadual: ICMS/ISS recolhido fora do DAS
              </h3>
              <p className="text-xs text-amber-300/80 mt-1 leading-relaxed">
                Receita acumulada de {formatCurrencyBRL(consolidated)} ultrapassa o sublimite de R$ 3,6 milhões. O ICMS ou ISS passa a ser recolhido por fora no regime ordinário com obrigações acessórias do SPED Fiscal.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToTab('parecer')}
            className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition uppercase tracking-wider shadow-md cursor-pointer"
          >
            Ver Detalhes
          </button>
        </div>
      ) : null}

      {/* DASHBOARD HUB: FULL HORIZONTAL LAYOUT FOR MAXIMUM VISIBILITY (REQUEST 2º & 3º) */}
      <div className="space-y-6 w-full">
        {/* SÍNTESE EXECUTIVA DE DECISÃO & SIMULADOR WHAT-IF 360° */}
        <CockpitExecutiveSummary
          company={company}
          calculation={calculation}
          timeHorizon={timeHorizon}
          onChangeTimeHorizon={setTimeHorizon}
          onNavigateToTab={onNavigateToTab}
          onChangeCompany={onChangeCompany}
        />

        {/* BARRA CUMULATIVA DO TETO GLOBAL (TERMÔMETRO DOS R$ 4,8 MILHÕES) */}
        <GlobalCapCapacityBar company={company} calculation={calculation} />

        {/* KPI ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {kpiWidgetIds.map(id => renderKpiWidget(id))}
        </div>

        {/* FULL WIDTH STACKED MAIN SECTIONS */}
        <div className="space-y-6 w-full">
          {mainSectionWidgetIds.map(id => renderMainSection(id))}
        </div>
      </div>

      {/* MODAL DE PERSONALIZACAO DE LAYOUT (Mantido caso necessário para ajustes rápidos) */}
      <DashboardWidgetCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        widgets={widgets}
        onSaveWidgets={handleSaveWidgets}
        onResetWidgets={handleResetWidgets}
        showToast={showToast || ((msg) => alert(msg))}
      />

      {/* TUTORIAL MODAL */}
      <ModuleTutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        moduleName="Dashboard & Cockpit Tributário"
        description="Acompanhe o panorama fiscal da sua empresa com indicadores automatizados em tempo real, validando o teto do Simples Nacional, os riscos societários e as métricas do Fator R."
      />

      {/* MODAL DE RELATÓRIOS CONSOLIDADOS DE CNDS */}
      <ConsolidatedCNDReportsModal
        isOpen={showConsolidatedCndModal}
        onClose={() => setShowConsolidatedCndModal(false)}
        currentCompany={company}
        showToast={showToast}
        onNavigateToTab={onNavigateToTab}
      />

    </div>
  );
};
