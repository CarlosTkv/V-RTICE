import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Scale, 
  TrendingUp, 
  DollarSign, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Sparkles, 
  Layers, 
  FileSpreadsheet, 
  Globe2, 
  FileText, 
  AlertTriangle,
  ArrowRight,
  Calculator,
  Percent,
  RefreshCw,
  PieChart,
  BarChart3,
  BookOpen,
  MapPin,
  Truck,
  Info,
  ArrowRightLeft,
  Search,
  Compass,
  ShieldCheck,
  History,
  BookmarkPlus,
  CheckSquare,
  Square,
  ListPlus,
  Tag,
  Plus,
  Trash2,
  Users,
  X,
  Play
} from 'lucide-react';
import { CompanyData, CalculationResult, SimplesAnexo, AnexoRevenueItem, RegimeComparisonDetail, TransportType, EcacRevenueClassification, StateSimplesIcmsBenefit, SavedSimulation, RevenueSituationType } from '../types';
import { 
  formatCurrencyBRL, 
  formatPercentBR, 
  FEDERAL_LIMIT, 
  STATE_SUBLIMIT, 
  EXPORT_ADDITIONAL_LIMIT,
  BRAZILIAN_STATES_ICMS,
  getStandardIcmsRateForUF,
  getStandardIssRateForCity,
  DEFAULT_ANEXO_ACTIVITIES,
  getStateIcmsTransportInfo,
  getInterstateFreightIcmsRate,
  calculateRouteFreightIcms,
  ECAC_CLASSIFICATIONS,
  PARANA_ICMS_SIMPLES_BRACKETS,
  getStateSimplesIcmsBenefit,
  calculateAnexoEffectiveRate,
  ANEXO_TABLES
} from '../utils/taxRules';
import { ActivitySituationsManager } from './ActivitySituationsManager';
import { ProjectedSimulationModal } from './ProjectedSimulationModal';
import { SimulationHistoryModal } from './SimulationHistoryModal';
import { ReportViewerModal, ReportType } from './ReportViewerModal';
import { RegimeDecisionExplanationModal } from './RegimeDecisionExplanationModal';
import { ECAC_ACTIVITY_CATALOG, EcacActivityOption } from '../utils/ecacCatalog';

import { ModuleTutorialModal } from './ModuleTutorialModal';
import { BrandLogo } from './BrandLogo';

interface TaxRegimeAnalyzerViewProps {
  company: CompanyData;
  onChangeCompany: (updated: CompanyData) => void;
  calculation: CalculationResult;
  onNavigateToTab?: (tab: 'dashboard' | 'regimes' | 'projecao' | 'historico' | 'cfop' | 'socios' | 'fator_r' | 'reforma' | 'parecer') => void;
}

export const TaxRegimeAnalyzerView: React.FC<TaxRegimeAnalyzerViewProps> = ({
  company,
  onChangeCompany,
  calculation,
  onNavigateToTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'comparativo' | 'anexos' | 'vantagens' | 'dre' | 'impactos' | 'sublimite' | 'beneficio_icms' | 'auditoria_cpp'>('comparativo');
  const [showAdvancedDeductions, setShowAdvancedDeductions] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  // ICMS Transporte por Estado e Simulador de Rotas
  const [selectedTransportUf, setSelectedTransportUf] = useState<string>(company.uf || 'SP');
  const [destinationUf, setDestinationUf] = useState<string>(company.uf === 'RJ' ? 'SP' : 'RJ');
  const [routeFreightAmount, setRouteFreightAmount] = useState<number>(50000);
  const [routeIsSubcontracted, setRouteIsSubcontracted] = useState<boolean>(false);
  const [routeIsExempt, setRouteIsExempt] = useState<boolean>(false);
  const [transportUfSearch, setTransportUfSearch] = useState<string>('');
  const [transportRegionFilter, setTransportRegionFilter] = useState<string>('todos');
  const [transportViewMode, setTransportViewMode] = useState<'simulador' | 'dossie' | 'tabela'>('simulador');

  // Simulação Projetada Mês a Mês & Histórico de Pareceres
  const [isProjectedModalOpen, setIsProjectedModalOpen] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isDecisionExplanationModalOpen, setIsDecisionExplanationModalOpen] = useState<boolean>(false);
  const [reportModalType, setReportModalType] = useState<ReportType>('regimes');
  const [keepInHistory, setKeepInHistory] = useState<boolean>(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // Seletor de Atividades do Catálogo Oficial e-CAC / PGDAS-D
  const [isEcacPickerOpen, setIsEcacPickerOpen] = useState<boolean>(false);
  const [ecacSearchQuery, setEcacSearchQuery] = useState<string>('');
  const [ecacSelectedGroup, setEcacSelectedGroup] = useState<string>('todos');

  // Grupos únicos do catálogo e-CAC
  const ecacGroups = useMemo(() => {
    const groups = new Set<string>();
    ECAC_ACTIVITY_CATALOG.forEach(opt => groups.add(opt.group));
    return ['todos', ...Array.from(groups)];
  }, []);

  // Opções filtradas do catálogo e-CAC
  const filteredEcacOptions = useMemo(() => {
    return ECAC_ACTIVITY_CATALOG.filter(opt => {
      const matchGroup = ecacSelectedGroup === 'todos' || opt.group === ecacSelectedGroup;
      const matchQuery = !ecacSearchQuery || 
        opt.label.toLowerCase().includes(ecacSearchQuery.toLowerCase()) ||
        opt.group.toLowerCase().includes(ecacSearchQuery.toLowerCase()) ||
        opt.anexo.toLowerCase().includes(ecacSearchQuery.toLowerCase()) ||
        opt.legalBasis.toLowerCase().includes(ecacSearchQuery.toLowerCase());
      return matchGroup && matchQuery;
    });
  }, [ecacSelectedGroup, ecacSearchQuery]);

  // Função para salvar parecer/simulação no histórico
  const handleSaveSimulation = (customTitle?: string) => {
    const newSim: SavedSimulation = {
      id: `sim-${Date.now()}`,
      timestamp: new Date().toLocaleString('pt-BR'),
      title: customTitle || `Parecer ${company.name || 'Empresa'} - Anexo ${company.anexo} (${new Date().toLocaleDateString('pt-BR')})`,
      scenarioNotes: `RBT12: ${formatCurrencyBRL(company.rbt12)}, Faturamento: ${formatCurrencyBRL(company.monthlyRevenue)}, Folha: ${formatCurrencyBRL(company.payroll12m)}. Regime Recomendado: ${calculation.bestRegime.name}.`,
      keepInHistory: true,
      rbt12: company.rbt12 || 0,
      monthlyRevenue: company.monthlyRevenue || 0,
      exportRevenue: company.exportMonthlyRevenue || 0,
      payroll12m: company.payroll12m || 0,
      monthlyPayroll: company.monthlyPayroll || 0,
      fatorRPercent: calculation.fatorR,
      fatorRStatus: calculation.fatorRStatus,
      effectiveAnexo: calculation.anexoCalculations?.[0]?.anexo || company.anexo || 'III',
      effectiveRatePercent: calculation.effectiveRate,
      simplesTaxMonthly: calculation.effectiveTaxMonthly,
      simplesTaxAnnual: calculation.effectiveTaxAnnual,
      presumedTaxMonthly: calculation.regimesComparison?.find(r => r.regime === 'lucro_presumido')?.monthlyTaxTotal || 0,
      presumedTaxAnnual: calculation.regimesComparison?.find(r => r.regime === 'lucro_presumido')?.annualTaxTotal || 0,
      realTaxMonthly: calculation.regimesComparison?.find(r => r.regime === 'lucro_real')?.monthlyTaxTotal || 0,
      realTaxAnnual: calculation.regimesComparison?.find(r => r.regime === 'lucro_real')?.annualTaxTotal || 0,
      bestRegime: calculation.bestRegime.regime.includes('simples') ? 'simples' : calculation.bestRegime.regime.includes('presumido') ? 'presumido' : 'real',
      annualSavings: Math.max(0, (calculation.regimesComparison?.find(r => r.regime === 'lucro_presumido')?.annualTaxTotal || 0) - calculation.effectiveTaxAnnual),
      anexoRevenuesSnapshot: company.anexoRevenues ? JSON.parse(JSON.stringify(company.anexoRevenues)) : [],
      companyDataSnapshot: { ...company },
    };

    const currentHistory = company.simulationHistory || [];
    const updatedHistory = [newSim, ...currentHistory];

    onChangeCompany({
      ...company,
      simulationHistory: updatedHistory,
    });

    setSaveSuccessNotice('Parecer e simulação arquivados com sucesso no histórico!');
    setTimeout(() => setSaveSuccessNotice(null), 4000);
  };

  // Restaurar simulação do histórico
  const handleRestoreSimulation = (sim: SavedSimulation) => {
    onChangeCompany({
      ...company,
      rbt12: sim.rbt12,
      monthlyRevenue: sim.monthlyRevenue,
      exportMonthlyRevenue: sim.exportRevenue,
      payroll12m: sim.payroll12m,
      monthlyPayroll: sim.monthlyPayroll,
      anexo: sim.effectiveAnexo,
      anexoRevenues: sim.anexoRevenuesSnapshot && sim.anexoRevenuesSnapshot.length > 0 ? sim.anexoRevenuesSnapshot : company.anexoRevenues,
    });

    setSaveSuccessNotice(`Simulação "${sim.title}" restaurada para a empresa ativa.`);
    setTimeout(() => setSaveSuccessNotice(null), 4000);
  };

  // Excluir simulação do histórico
  const handleDeleteSimulation = (simId: string) => {
    const currentHistory = company.simulationHistory || [];
    const updatedHistory = currentHistory.filter(s => s.id !== simId);
    onChangeCompany({
      ...company,
      simulationHistory: updatedHistory,
    });
  };

  // Adicionar ou ativar atividade pelo catálogo oficial e-CAC
  const handleSelectEcacOption = (opt: EcacActivityOption) => {
    const existingList = company.anexoRevenues || [];
    const existingIndex = existingList.findIndex(a => a.ecacOptionCode === opt.code || a.activityKey === opt.code);

    const isMonofasico = opt.code.includes('monofasico') || opt.description.toLowerCase().includes('monofásica');
    const activeSituations: RevenueSituationType[] = [];
    if (opt.hasST) activeSituations.push('icms_st');
    if (isMonofasico) activeSituations.push('pis_cofins_monofasico');
    if (opt.hasIssRetido) activeSituations.push('iss_retido');
    if (opt.isTransport && (opt.transportType === 'intermunicipal_cargas' || opt.description.toLowerCase().includes('subcontrat'))) {
      activeSituations.push('transporte_subcontratado');
    }
    if (activeSituations.length === 0) activeSituations.push('normal');

    const newItem: AnexoRevenueItem = {
      id: `ecac-${opt.code}-${Date.now()}`,
      activityKey: opt.code,
      activityTitle: `${opt.group} - ${opt.label}`,
      anexo: opt.anexo,
      active: true,
      subjectToFatorR: opt.subjectToFatorR,
      ecacOptionCode: opt.code,
      ecacGroup: opt.group,
      monthlyRevenueInternal: opt.isExport ? 0 : (existingIndex >= 0 ? (existingList[existingIndex].monthlyRevenueInternal || 0) : (company.monthlyRevenue || 0)),
      monthlyRevenueExport: opt.isExport ? (existingIndex >= 0 ? (existingList[existingIndex].monthlyRevenueExport || 0) : (company.monthlyRevenue || 0)) : 0,
      description: `${opt.description} (Base legal: ${opt.legalBasis})`,
      isTransport: opt.isTransport,
      transportType: opt.transportType,
      activeSituations,
      stPercent: opt.hasST ? 100 : 0,
      monofasicoPercent: isMonofasico ? 100 : 0,
      issRetidoPercent: opt.hasIssRetido ? 100 : 0,
      ecacClassification: opt.hasIssRetido ? 'iss_retido' : opt.hasST ? 'icms_st' : opt.isExport ? (opt.anexo === 'I' || opt.anexo === 'II' ? 'exterior_mercadoria' : 'exterior_servico') : 'normal',
    };

    let updatedList: AnexoRevenueItem[];
    if (existingIndex >= 0) {
      updatedList = existingList.map((item, idx) => idx === existingIndex ? newItem : item);
    } else {
      updatedList = [...existingList, newItem];
    }

    onChangeCompany({
      ...company,
      anexoRevenues: updatedList,
      subjectToFatorR: opt.subjectToFatorR ? true : company.subjectToFatorR,
    });

    setIsEcacPickerOpen(false);
    setSaveSuccessNotice(`Opção e-CAC "${opt.label.slice(0, 45)}..." ativada com sucesso!`);
    setTimeout(() => setSaveSuccessNotice(null), 4000);
  };

  // Lista dos 27 estados para seletores e tabela
  const statesList = useMemo(() => {
    return Object.entries(BRAZILIAN_STATES_ICMS).map(([uf, def]) => {
      const isSouthSoutheast = ['SP', 'MG', 'RJ', 'PR', 'SC', 'RS'].includes(uf);
      const rateToNNeCO = isSouthSoutheast ? 7.0 : 12.0;
      const rateToSSe = 12.0;
      return {
        uf,
        name: def.name,
        region: def.region,
        standardRate: def.standardIcmsRate,
        presumedCreditRateNet: +(def.standardIcmsRate * 0.8).toFixed(2),
        interstateSouthSoutheast: rateToSSe,
        interstateNorthNortheastCenterEast: rateToNNeCO,
        subcontratacaoRule: def.subcontractTreatment,
        notes: def.notes,
      };
    });
  }, []);

  // Cálculos do estado selecionado e simulação de rota
  const stateIcmsInfo = getStateIcmsTransportInfo(selectedTransportUf);
  const simulatedRouteCalculation = calculateRouteFreightIcms({
    originUF: selectedTransportUf,
    destinationUF: destinationUf,
    freightValue: routeFreightAmount,
    isSubcontracted: routeIsSubcontracted,
    isExempt: routeIsExempt,
    simplesEffectiveIcmsRate: calculation.effectiveRate ? +(calculation.effectiveRate * 0.335).toFixed(2) : 3.5,
  });

  const isInterstate = !simulatedRouteCalculation.isInternal;
  const routeOperationType = simulatedRouteCalculation.isSubcontracted
    ? 'Subcontratação (Conv. 25/90)'
    : simulatedRouteCalculation.isExempt
    ? 'Isenção Estadual'
    : isInterstate
    ? 'Interestadual (Res. SF 22/89)'
    : 'Intermunicipal Interno';
  const routeComparativeNote = simulatedRouteCalculation.simplesComparison.savingsVsNormalRegime >= 0
    ? `No Simples Nacional (Anexo III de Transporte), a tributação unificada no DAS resulta em economia estimada de ICMS em relação à apuração de débito e crédito no Regime Normal (mesmo com o crédito presumido de 20% do Convênio 106/96).`
    : `Atenção: A depender da faixa de receita bruta do Simples Nacional ou margem operacional, o Regime Normal com crédito outorgado de 20% pode apresentar carga de ICMS mais vantajosa para esta operação.`;

  // Lista de Atividades e Anexos: usa diretamente as atividades reais/importadas da empresa
  const currentAnexoRevenues: AnexoRevenueItem[] = useMemo(() => {
    if (company.anexoRevenues && company.anexoRevenues.length > 0) {
      return company.anexoRevenues;
    }

    // Se a empresa ainda não tiver nenhuma atividade gravada, gera a atividade padrão correspondente
    const targetAnexo = company.anexo || 'I';
    const isTransport = !!company.isTransportService;
    const transType = company.transportType || 'intermunicipal_cargas';

    const defaultMeta = DEFAULT_ANEXO_ACTIVITIES.find(meta => 
      isTransport 
        ? (meta.isTransport && meta.transportType === transType)
        : (meta.anexo === targetAnexo && !meta.isTransport)
    ) || DEFAULT_ANEXO_ACTIVITIES[0];

    return [{
      id: defaultMeta.key,
      activityKey: defaultMeta.key,
      activityTitle: defaultMeta.title,
      anexo: defaultMeta.anexo,
      active: true,
      monthlyRevenueInternal: company.monthlyRevenue || 0,
      monthlyRevenueExport: company.exportMonthlyRevenue || 0,
      description: defaultMeta.defaultDesc,
      isTransport: defaultMeta.isTransport,
      transportType: defaultMeta.transportType,
      activeSituations: ['normal'],
      stPercent: 0,
      subcontratacaoPercent: 0,
      monofasicoPercent: 0,
      issRetidoPercent: 0,
      isencaoPercent: 0,
    }];
  }, [company.anexoRevenues, company.anexo, company.isTransportService, company.transportType, company.monthlyRevenue, company.exportMonthlyRevenue]);

  const handleToggleActivity = (activityKey: string) => {
    const updated = currentAnexoRevenues.map(item => {
      if (item.activityKey === activityKey) {
        return { ...item, active: !item.active };
      }
      return item;
    });

    const activeTransport = updated.find(u => u.active && u.isTransport);
    const hasActiveTransport = !!activeTransport;
    const detectedTransportType = activeTransport?.transportType;

    // Recalculate monthly total from active anexos
    const totalMonth = updated
      .filter(u => u.active)
      .reduce((acc, curr) => acc + (curr.monthlyRevenueInternal || 0) + (curr.monthlyRevenueExport || 0), 0);

    const totalExport = updated
      .filter(u => u.active)
      .reduce((acc, curr) => acc + (curr.monthlyRevenueExport || 0), 0);

    onChangeCompany({
      ...company,
      anexoRevenues: updated,
      isTransportService: hasActiveTransport,
      transportType: detectedTransportType || company.transportType,
      monthlyRevenue: totalMonth > 0 ? totalMonth : company.monthlyRevenue,
      exportMonthlyRevenue: totalExport,
    });
  };

  const handleUpdateActivityRevenue = (activityKey: string, field: keyof AnexoRevenueItem, value: any) => {
    const updated = currentAnexoRevenues.map(item => {
      if (item.activityKey === activityKey) {
        return { ...item, [field]: value };
      }
      return item;
    });

    const activeTransport = updated.find(u => u.active && u.isTransport);
    const hasActiveTransport = !!activeTransport;
    const detectedTransportType = activeTransport?.transportType;

    const totalMonth = updated
      .filter(u => u.active)
      .reduce((acc, curr) => acc + (curr.monthlyRevenueInternal || 0) + (curr.monthlyRevenueExport || 0), 0);

    const totalExport = updated
      .filter(u => u.active)
      .reduce((acc, curr) => acc + (curr.monthlyRevenueExport || 0), 0);

    onChangeCompany({
      ...company,
      anexoRevenues: updated,
      isTransportService: hasActiveTransport,
      transportType: detectedTransportType || company.transportType,
      monthlyRevenue: totalMonth,
      exportMonthlyRevenue: totalExport,
    });
  };

  const handleUpdateEcacClassification = (activityKey: string, ecacCode: EcacRevenueClassification) => {
    const updated = currentAnexoRevenues.map(item => {
      if (item.activityKey === activityKey) {
        const updatedItem: AnexoRevenueItem = { 
          ...item, 
          ecacClassification: ecacCode,
        };

        if (ecacCode === 'icms_st') {
          updatedItem.stPercent = 100;
        } else if (ecacCode === 'transporte_subcontratado') {
          updatedItem.subcontratacaoPercent = 100;
        } else if (ecacCode === 'iss_retido' || ecacCode === 'iss_st') {
          updatedItem.issRetidoPercent = 100;
        } else if (ecacCode === 'pis_cofins_monofasico') {
          updatedItem.monofasicoPercent = 100;
        } else if (ecacCode === 'icms_isencao_estadual' || ecacCode === 'iss_isencao_municipal') {
          updatedItem.isencaoPercent = 100;
        } else if (ecacCode === 'exterior_servico' || ecacCode === 'exterior_mercadoria') {
          if ((updatedItem.monthlyRevenueInternal || 0) > 0 && (updatedItem.monthlyRevenueExport || 0) === 0) {
            updatedItem.monthlyRevenueExport = updatedItem.monthlyRevenueInternal;
            updatedItem.monthlyRevenueInternal = 0;
          }
        } else if (ecacCode === 'normal') {
          updatedItem.stPercent = 0;
          updatedItem.subcontratacaoPercent = 0;
          updatedItem.issRetidoPercent = 0;
          updatedItem.monofasicoPercent = 0;
          updatedItem.isencaoPercent = 0;
        }
        return updatedItem;
      }
      return item;
    });

    const activeTransport = updated.find(u => u.active && u.isTransport);
    const hasActiveTransport = !!activeTransport;
    const detectedTransportType = activeTransport?.transportType;

    const totalMonth = updated
      .filter(u => u.active)
      .reduce((acc, curr) => acc + (curr.monthlyRevenueInternal || 0) + (curr.monthlyRevenueExport || 0), 0);

    const totalExport = updated
      .filter(u => u.active)
      .reduce((acc, curr) => acc + (curr.monthlyRevenueExport || 0), 0);

    onChangeCompany({
      ...company,
      anexoRevenues: updated,
      isTransportService: hasActiveTransport,
      transportType: detectedTransportType || company.transportType,
      monthlyRevenue: totalMonth,
      exportMonthlyRevenue: totalExport,
    });
  };

  const handleUpdateFullActivityItem = (activityKey: string, updatedItem: AnexoRevenueItem) => {
    const updated = currentAnexoRevenues.map(item => {
      if (item.activityKey === activityKey) {
        return updatedItem;
      }
      return item;
    });

    const activeTransport = updated.find(u => u.active && u.isTransport);
    const hasActiveTransport = !!activeTransport;
    const detectedTransportType = activeTransport?.transportType;

    const totalMonth = updated
      .filter(u => u.active)
      .reduce((acc, curr) => acc + (curr.monthlyRevenueInternal || 0) + (curr.monthlyRevenueExport || 0), 0);

    const totalExport = updated
      .filter(u => u.active)
      .reduce((acc, curr) => acc + (curr.monthlyRevenueExport || 0), 0);

    onChangeCompany({
      ...company,
      anexoRevenues: updated,
      isTransportService: hasActiveTransport,
      transportType: detectedTransportType || company.transportType,
      monthlyRevenue: totalMonth,
      exportMonthlyRevenue: totalExport,
    });
  };

  const handleRemoveActivity = (activityKey: string) => {
    const updated = currentAnexoRevenues.filter(a => a.activityKey !== activityKey);
    const totalMonth = updated
      .filter(u => u.active)
      .reduce((acc, curr) => acc + (curr.monthlyRevenueInternal || 0) + (curr.monthlyRevenueExport || 0), 0);
    const totalExport = updated
      .filter(u => u.active)
      .reduce((acc, curr) => acc + (curr.monthlyRevenueExport || 0), 0);
    const activeTransport = updated.find(u => u.active && u.isTransport);

    onChangeCompany({
      ...company,
      anexoRevenues: updated,
      isTransportService: !!activeTransport,
      transportType: activeTransport?.transportType || company.transportType,
      monthlyRevenue: totalMonth > 0 ? totalMonth : company.monthlyRevenue,
      exportMonthlyRevenue: totalExport,
    });
  };

  const handleAddStandardActivity = (metaKey: string) => {
    const meta = DEFAULT_ANEXO_ACTIVITIES.find(m => m.key === metaKey);
    if (!meta) return;
    const newKey = `${meta.key}_${Date.now()}`;
    const newItem: AnexoRevenueItem = {
      id: newKey,
      activityKey: newKey,
      activityTitle: meta.title,
      anexo: meta.anexo,
      active: true,
      monthlyRevenueInternal: 0,
      monthlyRevenueExport: 0,
      description: meta.defaultDesc,
      isTransport: meta.isTransport,
      transportType: meta.transportType,
      activeSituations: ['normal'],
      stPercent: 0,
      subcontratacaoPercent: 0,
      monofasicoPercent: 0,
      issRetidoPercent: 0,
      isencaoPercent: 0,
    };
    const updated = [...currentAnexoRevenues, newItem];
    onChangeCompany({
      ...company,
      anexoRevenues: updated,
    });
  };

  const activeAnexosCount = currentAnexoRevenues.filter(a => a.active).length;

  return (
    <div className="space-y-6">

      {/* Notificação Temporária de Ação Realizada */}
      {saveSuccessNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessNotice}</span>
          </div>
          <button onClick={() => setSaveSuccessNotice(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Barra de Ações Rápidas: Simulação Projetada & Histórico de Pareceres */}
      <div className="bg-[#0F172A] p-3.5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-3">
          <BrandLogo variant="badge" module="tax" />
          {/* Checkbox Manter em Histórico */}
          <label 
            className="flex items-center space-x-2 cursor-pointer select-none bg-[#0B0F19] hover:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-800 transition"
            title="Quando marcado, as simulações e pareceres gerados para esta empresa são mantidos no histórico permanente."
          >
            <input
              type="checkbox"
              checked={keepInHistory}
              onChange={(e) => {
                const checked = e.target.checked;
                setKeepInHistory(checked);
                if (checked) {
                  handleSaveSimulation();
                }
              }}
              className="rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-purple-500 w-4 h-4"
            />
            <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <span>Manter em Histórico</span>
              {keepInHistory && <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>}
            </span>
          </label>

          {/* Botão de arquivar agora */}
          <button
            onClick={() => handleSaveSimulation()}
            className="px-3 py-1.5 bg-[#0B0F19] hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold flex items-center space-x-1.5 border border-slate-800 transition cursor-pointer"
            title="Arquivar snapshot deste parecer no histórico da empresa"
          >
            <BookmarkPlus className="w-3.5 h-3.5 text-purple-400" />
            <span>Arquivar Parecer</span>
          </button>

          {/* Botão para ver pareceres arquivados */}
          <button
            onClick={() => setIsHistoryModalOpen(true)}
            className="px-3 py-1.5 bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 rounded-lg text-xs font-semibold flex items-center space-x-1.5 border border-purple-800/80 transition cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-purple-400" />
            <span>Pareceres Arquivados ({company.simulationHistory?.length || 0})</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {/* Botão Relatório dos 4 Regimes */}
          <button
            onClick={() => {
              setReportModalType('regimes');
              setIsReportModalOpen(true);
            }}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center space-x-2 shadow-xs transition-all cursor-pointer"
            title="Gerar e Visualizar Relatório Oficial dos 4 Regimes em PDF / Impressão"
          >
            <FileText className="w-3.5 h-3.5 text-blue-100" />
            <span>Relatório dos 4 Regimes</span>
          </button>

          {/* Botão Simulação Projetada até o final do ano */}
          <button
            onClick={() => setIsProjectedModalOpen(true)}
            className="px-3.5 py-1.5 bg-[#0B0F19] hover:bg-slate-800 text-slate-300 hover:text-slate-100 rounded-lg text-xs font-bold flex items-center space-x-2 border border-slate-800 transition-all cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
            <span>Simulação Projetada (Ano)</span>
          </button>
          
          <button
            onClick={() => setIsTutorialOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/70 text-indigo-300 border border-indigo-800/70 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
          >
            <Play className="w-3.5 h-3.5 text-indigo-400" />
            <span>Como Funciona</span>
          </button>
        </div>
      </div>
      
      {/* Top Banner: Veredito do Planejamento Tributário */}
      <div className={`p-5 rounded-2xl border transition shadow-xs ${
        calculation.bestRegime.regime === 'simples_padrao'
          ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-100'
          : calculation.bestRegime.regime === 'simples_hibrido'
          ? 'bg-blue-950/20 border-blue-500/30 text-slate-100'
          : calculation.bestRegime.regime === 'lucro_presumido'
          ? 'bg-amber-950/20 border-amber-500/30 text-slate-100'
          : 'bg-purple-950/20 border-purple-500/30 text-slate-100'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 border ${
              calculation.bestRegime.regime === 'simples_padrao'
                ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400'
                : calculation.bestRegime.regime === 'simples_hibrido'
                ? 'bg-blue-950/60 border-blue-800/60 text-blue-400'
                : calculation.bestRegime.regime === 'lucro_presumido'
                ? 'bg-amber-950/60 border-amber-800/60 text-amber-400'
                : 'bg-purple-950/60 border-purple-800/60 text-purple-400'
            }`}>
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 font-bold border border-slate-700 text-blue-400">
                  Diagnóstico Fiscal Recomendado
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Score de Precisão: <strong className="text-slate-100">{calculation.bestRegime.recommendationScore}/100</strong>
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-100 mt-1">
                Melhor Enquadramento: <span className="underline decoration-2 decoration-blue-500 text-white">{calculation.bestRegime.name}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                {calculation.bestRegime.recommendationReason}
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDecisionExplanationModalOpen(true)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition border border-slate-700 cursor-pointer shadow-xs"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Por que o regime recomendado pode diferir do maior Lucro Líquido na DRE? Entenda</span>
                  <ArrowRight className="w-3 h-3 ml-0.5 text-slate-400" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 shadow-xs">
            <div className="text-right">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Carga Anual no Melhor Regime</span>
              <span className="text-lg font-mono font-bold text-emerald-400">
                {formatCurrencyBRL(calculation.bestRegime.annualTaxTotal)}
              </span>
              <span className="text-[11px] font-mono text-slate-400 block">
                Alíquota Efetiva: {formatPercentBR(calculation.bestRegime.effectiveRatePercent)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Diálogo Técnico de Sinergia: ANEXO - FAIXA DE RECEITA - ALÍQUOTA */}
      {(() => {
        const currentAnexo = company.anexo || 'III';
        const currentRbt12 = company.rbt12 || 0;
        const anexoDetails = calculateAnexoEffectiveRate(currentAnexo, currentRbt12);
        const bracketNum = anexoDetails.bracket.limit <= 180000 ? 1 :
          anexoDetails.bracket.limit <= 360000 ? 2 :
          anexoDetails.bracket.limit <= 720000 ? 3 :
          anexoDetails.bracket.limit <= 1800000 ? 4 :
          anexoDetails.bracket.limit <= 3600000 ? 5 : 6;
        
        const isFatorR = company.subjectToFatorR || currentAnexo === 'V' || company.anexoRevenues?.some(a => a.active && a.subjectToFatorR);
        const fatorRVal = currentRbt12 > 0 ? ((company.payroll12m || 0) / currentRbt12) * 100 : 0;
        const fatorROk = fatorRVal >= 28;

        return (
          <div className="bg-[#0F172A] p-4 rounded-xl border border-slate-800 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-blue-950/60 rounded-lg text-blue-400 border border-blue-800/60">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                    Sincronização Perfeita: ANEXO ⇄ FAIXA DE RECEITA ⇄ ALÍQUOTA (LC 123/2006)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Determinação transparente da alíquota básica, dedução oficial e alíquota efetiva apurada
                  </p>
                </div>
              </div>

              {/* Seletor rápido de anexo direto */}
              <div className="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
                {(['I', 'II', 'III', 'IV', 'V'] as SimplesAnexo[]).map(ax => (
                  <button
                    key={ax}
                    type="button"
                    onClick={() => onChangeCompany({ ...company, anexo: ax })}
                    className={`px-2.5 py-1 text-xs font-bold rounded transition cursor-pointer ${
                      currentAnexo === ax 
                        ? 'bg-blue-600 text-white shadow-xs' 
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                    }`}
                  >
                    Anexo {ax}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-3 text-xs font-mono">
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Anexo Selecionado</span>
                <strong className="text-sm text-blue-400">Anexo {currentAnexo}</strong>
                <span className="text-[10px] text-slate-400 block font-sans truncate">
                  {currentAnexo === 'I' ? 'Comércio' : currentAnexo === 'II' ? 'Indústria' : currentAnexo === 'III' ? 'Serviços/Transportes' : currentAnexo === 'IV' ? 'Construção/Vigilância' : 'Serviços Fator R'}
                </span>
              </div>

              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Faixa de Receita</span>
                <strong className="text-sm text-slate-200">Faixa {bracketNum} de 6</strong>
                <span className="text-[10px] text-slate-400 block font-sans">
                  Até {formatCurrencyBRL(anexoDetails.bracket.limit)}
                </span>
              </div>

              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Alíquota Básica / Nominal</span>
                <strong className="text-sm text-amber-400">{(anexoDetails.bracket.nominalRate * 100).toFixed(2)}%</strong>
                <span className="text-[10px] text-slate-400 block font-sans">Tabela Oficial LC 123</span>
              </div>

              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Parcela a Deduzir</span>
                <strong className="text-sm text-slate-300">{formatCurrencyBRL(anexoDetails.bracket.deduction)}</strong>
                <span className="text-[10px] text-slate-400 block font-sans">Dedução da Faixa</span>
              </div>

              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Alíquota Efetiva do Anexo</span>
                <strong className="text-sm text-emerald-400">{(anexoDetails.effectiveRate * 100).toFixed(2)}%</strong>
                <span className="text-[10px] text-slate-400 block font-sans">((RBT12×Nom)-Ded)/RBT12</span>
              </div>

              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Comportamento Fator R</span>
                {isFatorR ? (
                  <>
                    <strong className={`text-sm ${fatorROk ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {fatorRVal.toFixed(1)}% {fatorROk ? '(≥ 28%)' : '(< 28%)'}
                    </strong>
                    <span className="text-[10px] font-sans block text-slate-400">
                      {fatorROk ? 'Enquadra no Anexo III' : 'Recai no Anexo V'}
                    </span>
                  </>
                ) : (
                  <>
                    <strong className="text-sm text-slate-500">Não Sujeito</strong>
                    <span className="text-[10px] font-sans block text-slate-400">Alíquota pura Anexo {currentAnexo}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Regras de Faturamento e Parâmetros Tributários */}
      <div className="bg-[#0F172A] p-5 rounded-xl border border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
              1. Base de Faturamento & Regras da LC 123/2006 (RBT12, RBA, RBAA, Mercado Interno vs Exterior)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {activeAnexosCount} Anexo(s) Ativo(s)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-sans">
          
          {/* RBT12 */}
          <div className="bg-[#0B0F19] p-3 rounded-lg border border-slate-800">
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              RBT12 (Últimos 12 Meses)
            </label>
            <div className="relative">
              <span className="absolute left-2.5 top-2 text-slate-400 font-mono">R$</span>
              <input
                type="number"
                value={company.rbt12 || ''}
                onChange={(e) => onChangeCompany({ ...company, rbt12: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-900 border border-slate-700 rounded pl-9 pr-2 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            {company.rba > 0 && company.rbt12 === company.rba && (
              <span className="text-[10px] text-emerald-400 font-medium mt-1 block">
                ✓ Vinculado ao RBA (toda empresa com RBA possui RBT12)
              </span>
            )}
            {company.rba > 0 && (!company.rbt12 || company.rbt12 === 0) && (
              <button
                type="button"
                onClick={() => onChangeCompany({ ...company, rbt12: company.rba })}
                className="text-[10px] text-amber-400 hover:text-amber-300 underline mt-1 block cursor-pointer"
              >
                Sincronizar RBT12 com RBA ({formatCurrencyBRL(company.rba)})
              </button>
            )}
            <span className="text-[10px] text-slate-400 mt-1 block">
              Base da alíquota efetiva de cada anexo (LC 123/06)
            </span>
          </div>

          {/* RBA (Ano-calendário corrente) */}
          <div className="bg-[#0B0F19] p-3 rounded-lg border border-slate-800">
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              RBA (Acumulado no Ano Corrente)
            </label>
            <div className="relative">
              <span className="absolute left-2.5 top-2 text-slate-400 font-mono">R$</span>
              <input
                type="number"
                value={company.rba || ''}
                onChange={(e) => {
                  const newRba = parseFloat(e.target.value) || 0;
                  const shouldSyncRbt12 = (!company.rbt12 || company.rbt12 === 0 || company.rbt12 === company.rba);
                  onChangeCompany({
                    ...company,
                    rba: newRba,
                    ...(shouldSyncRbt12 && newRba > 0 ? { rbt12: newRba } : {})
                  });
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded pl-9 pr-2 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Controle de Sublimite (R$ 3,6M) e Teto (R$ 4,8M)
            </span>
          </div>

          {/* RBAA (Ano-calendário anterior) */}
          <div className="bg-[#0B0F19] p-3 rounded-lg border border-slate-800">
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              RBAA (Ano-Calendário Anterior)
            </label>
            <div className="relative">
              <span className="absolute left-2.5 top-2 text-slate-400 font-mono">R$</span>
              <input
                type="number"
                value={company.rbaa || ''}
                onChange={(e) => onChangeCompany({ ...company, rbaa: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-900 border border-slate-700 rounded pl-9 pr-2 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Enquadramento no início do exercício
            </span>
          </div>
        </div>

        {/* ESTRUTURA DE FOLHA DE PAGAMENTO, PRÓ-LABORE & ENCARGOS CPP PATRONAL */}
        <div className="bg-[#0B0F19] p-4 sm:p-5 rounded-2xl border border-indigo-800/60 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-indigo-950/60 border border-indigo-800/60 text-indigo-400 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center space-x-2">
                  <span>Folha de Pagamento, Pró-Labore & Encargos Patronais (CPP)</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/80">
                    Impacto Direto no CPP & Fator R
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Diferenciação legal entre Folha de Funcionários CLT (28,8% no Presumido/Real) e Pró-Labore de Sócios (20,0% fixo - Lei 8.212/91 Art. 22). No Simples, 100% incluso no DAS.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveSubTab('auditoria_cpp');
                setTimeout(() => {
                  const el = document.getElementById('subtabs-nav-header');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 50);
              }}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-xs transition self-start sm:self-center shrink-0 cursor-pointer"
            >
              <span>Ver Dossiê CPP Completo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Bloco 1: Funcionários (CLT) */}
            <div className={`p-4 rounded-xl border transition ${
              (company.hasEmployeesPayroll !== false && (company.employeesPayrollMonthly ?? company.monthlyPayroll ?? 0) > 0)
                ? 'bg-[#0F172A] border-blue-600/60'
                : 'bg-[#0F172A]/60 border-slate-800'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Folha de Funcionários (CLT)</span>
                </div>
                {/* Toggle Sim/Não */}
                <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      const currentPro = (company.hasProLabore !== false ? (company.proLaboreMonthly || 0) : 0);
                      const defaultEmployees = company.employeesPayrollMonthly || (company.monthlyPayroll ? Math.max(0, company.monthlyPayroll - currentPro) : 10000);
                      const totalM = defaultEmployees + currentPro;
                      onChangeCompany({
                        ...company,
                        hasEmployeesPayroll: true,
                        employeesPayrollMonthly: defaultEmployees,
                        monthlyPayroll: totalM,
                        payroll12m: totalM * 12,
                      });
                    }}
                    className={`px-3 py-1 rounded font-bold transition text-[11px] cursor-pointer ${
                      company.hasEmployeesPayroll !== false
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Possui CLT (Sim)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const currentPro = (company.hasProLabore !== false ? (company.proLaboreMonthly || 0) : 0);
                      onChangeCompany({
                        ...company,
                        hasEmployeesPayroll: false,
                        employeesPayrollMonthly: 0,
                        monthlyPayroll: currentPro,
                        payroll12m: currentPro * 12,
                      });
                    }}
                    className={`px-3 py-1 rounded font-bold transition text-[11px] cursor-pointer ${
                      company.hasEmployeesPayroll === false
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Não Possui
                  </button>
                </div>
              </div>

              {company.hasEmployeesPayroll !== false ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">
                        Salários Mensais dos Empregados
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-2 text-slate-400 font-mono">R$</span>
                        <input
                          type="number"
                          value={company.employeesPayrollMonthly !== undefined ? company.employeesPayrollMonthly : (company.monthlyPayroll || '')}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            const currentPro = (company.hasProLabore !== false ? (company.proLaboreMonthly || 0) : 0);
                            const totalM = val + currentPro;
                            onChangeCompany({
                              ...company,
                              hasEmployeesPayroll: true,
                              employeesPayrollMonthly: val,
                              monthlyPayroll: totalM,
                              payroll12m: totalM * 12,
                            });
                          }}
                          className="w-full bg-slate-900 border border-blue-500/60 rounded pl-9 pr-2 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-400 font-bold"
                          placeholder="0.00"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                        Anual: {formatCurrencyBRL(((company.employeesPayrollMonthly !== undefined ? company.employeesPayrollMonthly : (company.monthlyPayroll || 0)) * 12))}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-medium text-slate-400 mb-1">
                          RAT / FAP (%)
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          min="1"
                          max="3"
                          value={company.ratRatePercent !== undefined ? company.ratRatePercent : 3.0}
                          onChange={(e) => onChangeCompany({ ...company, ratRatePercent: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                          placeholder="3.0"
                        />
                        <span className="text-[9px] text-slate-400 mt-0.5 block">Padrão: 3%</span>
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-slate-400 mb-1">
                          Terceiros / S (%)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="5.8"
                          value={company.terceirosRatePercent !== undefined ? company.terceirosRatePercent : 5.8}
                          onChange={(e) => onChangeCompany({ ...company, terceirosRatePercent: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                          placeholder="5.8"
                        />
                        <span className="text-[9px] text-slate-400 mt-0.5 block">Sistema S: 5.8%</span>
                      </div>
                    </div>
                  </div>

                  {/* Detalhe de Encargo CLT */}
                  <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 text-[11px] font-mono space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Carga Patronal no Presumido/Real:</span>
                      <strong className="text-rose-400">
                        20% + {(company.ratRatePercent !== undefined ? company.ratRatePercent : 3.0)}% + {(company.terceirosRatePercent !== undefined ? company.terceirosRatePercent : 5.8)}% = {((20 + (company.ratRatePercent !== undefined ? company.ratRatePercent : 3.0) + (company.terceirosRatePercent !== undefined ? company.terceirosRatePercent : 5.8))).toFixed(1)}%
                      </strong>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[10px]">
                      <span>Custo Patronal CLT Mensal no Presumido:</span>
                      <span className="text-rose-400 font-bold">
                        {formatCurrencyBRL(((company.employeesPayrollMonthly !== undefined ? company.employeesPayrollMonthly : (company.monthlyPayroll || 0)) * ((20 + (company.ratRatePercent !== undefined ? company.ratRatePercent : 3.0) + (company.terceirosRatePercent !== undefined ? company.terceirosRatePercent : 5.8)) / 100)))}/mês
                      </span>
                    </div>
                    <div className="text-[10px] text-emerald-400 flex items-center space-x-1 pt-1 border-t border-slate-800">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>No Simples Nacional (Anexos I, II, III e V): 100% DISPENSADO / INCLUSO NO DAS!</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-900/50 rounded-lg border border-dashed border-slate-800 text-center space-y-1">
                  <span className="text-xs text-slate-300 block">A empresa declarou <strong>NÃO possuir funcionários CLT registrados</strong>.</span>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Custo patronal de 28,8% (INSS + RAT + Sistema S) = R$ 0,00.
                  </p>
                </div>
              )}
            </div>

            {/* Bloco 2: Pró-Labore de Sócios */}
            <div className={`p-4 rounded-xl border transition ${
              (company.hasProLabore && (company.proLaboreMonthly || 0) > 0)
                ? 'bg-[#0F172A] border-purple-600/60'
                : 'bg-[#0F172A]/60 border-slate-800'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Retirada de Pró-Labore (Sócios)</span>
                </div>
                {/* Toggle Sim/Não */}
                <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      const currentEmp = (company.hasEmployeesPayroll !== false ? (company.employeesPayrollMonthly ?? company.monthlyPayroll ?? 0) : 0);
                      const defaultPro = company.proLaboreMonthly || 5000;
                      const totalM = currentEmp + defaultPro;
                      onChangeCompany({
                        ...company,
                        hasProLabore: true,
                        proLaboreMonthly: defaultPro,
                        monthlyPayroll: totalM,
                        payroll12m: totalM * 12,
                      });
                    }}
                    className={`px-3 py-1 rounded font-bold transition text-[11px] cursor-pointer ${
                      company.hasProLabore
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Possui Pró-Labore (Sim)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const currentEmp = (company.hasEmployeesPayroll !== false ? (company.employeesPayrollMonthly ?? company.monthlyPayroll ?? 0) : 0);
                      onChangeCompany({
                        ...company,
                        hasProLabore: false,
                        proLaboreMonthly: 0,
                        monthlyPayroll: currentEmp,
                        payroll12m: currentEmp * 12,
                      });
                    }}
                    className={`px-3 py-1 rounded font-bold transition text-[11px] cursor-pointer ${
                      !company.hasProLabore
                        ? 'bg-slate-700 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Não Possui
                  </button>
                </div>
              </div>

              {company.hasProLabore ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      Retirada Mensal Total de Pró-Labore dos Sócios
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-slate-400 font-mono">R$</span>
                      <input
                        type="number"
                        value={company.proLaboreMonthly || ''}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          const currentEmp = (company.hasEmployeesPayroll !== false ? (company.employeesPayrollMonthly ?? company.monthlyPayroll ?? 0) : 0);
                          const totalM = currentEmp + val;
                          onChangeCompany({
                            ...company,
                            hasProLabore: true,
                            proLaboreMonthly: val,
                            monthlyPayroll: totalM,
                            payroll12m: totalM * 12,
                          });
                        }}
                        className="w-full bg-slate-900 border border-purple-500/60 rounded pl-9 pr-2 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-purple-400 font-bold"
                        placeholder="0.00"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                      Anual: {formatCurrencyBRL((company.proLaboreMonthly || 0) * 12)} | Base legal: Art. 22, III da Lei 8.212/91
                    </span>
                  </div>

                  {/* Detalhe de Encargo Pró-Labore */}
                  <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 text-[11px] font-mono space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">CPP Patronal no Presumido/Real:</span>
                      <strong className="text-purple-400">20,00% Fixo (Isento de Terceiros e RAT)</strong>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[10px]">
                      <span>Custo CPP Patronal Pró-Labore no Presumido:</span>
                      <span className="text-purple-400 font-bold">
                        {formatCurrencyBRL((company.proLaboreMonthly || 0) * 0.20)}/mês
                      </span>
                    </div>
                    <div className="text-[10px] text-emerald-400 flex items-center space-x-1 pt-1 border-t border-slate-800">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>Conta integralmente para o FATOR R (≥ 28%) e CPP é 100% inclusa no DAS!</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-900/50 rounded-lg border border-dashed border-slate-800 text-center space-y-1">
                  <span className="text-xs text-slate-300 block">Sem retirada formal de pró-labore cadastrada.</span>
                  <p className="text-[10px] text-amber-400 font-mono">
                    ⚠️ Atenção: Se a atividade for sujeita ao Fator R, a ausência de pró-labore forçará tributação no Anexo V (15,5% a 30,5%).
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Barra de Síntese Previdenciária & Fator R */}
          <div className="p-3.5 bg-[#0F172A] rounded-xl border border-indigo-800/60 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center space-x-3">
              <div>
                <span className="text-slate-400 text-[10px] block uppercase">Folha Mensal Total:</span>
                <strong className="text-slate-100 text-sm">
                  {formatCurrencyBRL(calculation.payrollCppAudit?.totalPayrollMonthly || ((company.employeesPayrollMonthly || 0) + (company.proLaboreMonthly || 0)))}
                </strong>
              </div>
              <div className="border-l border-slate-800 pl-3">
                <span className="text-slate-400 text-[10px] block uppercase">Folha 12 Meses:</span>
                <strong className="text-slate-200">
                  {formatCurrencyBRL(calculation.payrollCppAudit?.totalPayrollAnnual || (((company.employeesPayrollMonthly || 0) + (company.proLaboreMonthly || 0)) * 12))}
                </strong>
              </div>
              <div className="border-l border-slate-800 pl-3">
                <span className="text-slate-400 text-[10px] block uppercase">Fator R Atual:</span>
                <span className={`px-2 py-0.5 rounded font-bold ${
                  calculation.fatorR >= 28
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                    : 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                }`}>
                  {formatPercentBR(calculation.fatorR)} {calculation.fatorR >= 28 ? '✓ (Anexo III)' : '⚠️ (Anexo V)'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <span className="text-slate-400 text-[10px] block uppercase">CPP Patronal no Lucro Presumido:</span>
                <strong className="text-rose-400">
                  {formatCurrencyBRL(calculation.payrollCppAudit?.presumedCppTotalAnnual || 0)}/ano
                </strong>
                <span className="text-[10px] text-slate-400 block">
                  ({formatCurrencyBRL(calculation.payrollCppAudit?.presumedCppTotalMonthly || 0)}/mês)
                </span>
              </div>
              <div className="border-l border-slate-800 pl-3 text-right">
                <span className="text-slate-400 text-[10px] block uppercase">Economia CPP no Simples:</span>
                <strong className="text-emerald-400 text-sm">
                  +{formatCurrencyBRL(calculation.payrollCppAudit?.cppDeltaPresumidoVsSimplesAnnual || 0)}/ano
                </strong>
                <span className="text-[9px] text-emerald-400 block">Incluso no DAS (exceto Anexo IV)</span>
              </div>
            </div>
          </div>

          {/* Diagnóstico Estratégico CPP da Auditoria */}
          {calculation.payrollCppAudit?.cppStrategicDiagnosis && (
            <div className="p-3 bg-indigo-950/50 border border-indigo-800/60 rounded-xl text-xs text-indigo-200 flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Diagnóstico de Auditoria Previdenciária:</strong> {calculation.payrollCppAudit.cppStrategicDiagnosis}
              </p>
            </div>
          )}
        </div>

        {/* Linha secundária de parâmetros de custos e B2B */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          
          {/* Localização Fiscal (UF & Cidade) */}
          <div className="bg-[#0F172A] p-3.5 rounded-xl border border-slate-800 shadow-xs">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-medium text-slate-300 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>UF & Município</span>
              </label>
              <span className="text-[10px] text-blue-400 font-mono">ICMS / ISS</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={company.uf || 'SP'}
                onChange={(e) => {
                  const newUf = e.target.value;
                  const stdIcms = getStandardIcmsRateForUF(newUf);
                  const stdIss = getStandardIssRateForCity(newUf, company.city);
                  onChangeCompany({ 
                    ...company, 
                    uf: newUf,
                    customIcmsRate: stdIcms,
                    customIssRate: stdIss
                  });
                }}
                className="bg-[#0B0F19] border border-slate-800 rounded px-2 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
              >
                {Object.keys(BRAZILIAN_STATES_ICMS).map((ufCode) => (
                  <option key={ufCode} value={ufCode} className="bg-slate-900 text-slate-100">
                    {ufCode} - {BRAZILIAN_STATES_ICMS[ufCode].name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={company.city || ''}
                onChange={(e) => onChangeCompany({ ...company, city: e.target.value })}
                className="bg-[#0B0F19] border border-slate-800 rounded px-2 py-1.5 text-xs font-sans text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                placeholder="Cidade"
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block font-mono">
              ICMS Padrão: <strong className="text-slate-200">{getStandardIcmsRateForUF(company.uf)}%</strong> | ISS: <strong className="text-slate-200">{getStandardIssRateForCity(company.uf, company.city)}%</strong>
            </span>
          </div>

          {/* Compras de Insumos / Mercadorias (% apenas) */}
          <div className="bg-[#0F172A] p-3.5 rounded-xl border border-slate-800 shadow-xs">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-medium text-slate-300">
                Compras de Insumos / Mercadorias (%)
              </label>
              <span className="text-[10px] text-blue-400 font-mono">
                {formatCurrencyBRL((company.monthlyRevenue || 0) * ((company.inputCostsPercent !== undefined ? company.inputCostsPercent : 40) / 100))}/mês
              </span>
            </div>
            <div className="relative">
              <span className="absolute right-2.5 top-2 text-slate-400 font-mono">%</span>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={company.inputCostsPercent !== undefined ? company.inputCostsPercent : 40}
                onChange={(e) => onChangeCompany({ 
                  ...company, 
                  inputCostsPercent: parseFloat(e.target.value) || 0,
                  inputCostsMonthly: (company.monthlyRevenue || 0) * ((parseFloat(e.target.value) || 0) / 100)
                })}
                className="w-full bg-[#0B0F19] border border-slate-800 rounded px-2 pr-7 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                placeholder="40"
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Base de créditos para Lucro Real, IBS/CBS e ICMS por fora
            </span>
          </div>

          {/* Despesas Operacionais / Administrativas (% apenas) */}
          <div className="bg-[#0F172A] p-3.5 rounded-xl border border-slate-800 shadow-xs">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-medium text-slate-300">
                Despesas Operacionais & Fixas (%)
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {formatCurrencyBRL((company.monthlyRevenue || 0) * ((company.operationalExpensesPercent !== undefined ? company.operationalExpensesPercent : 15) / 100))}/mês
              </span>
            </div>
            <div className="relative">
              <span className="absolute right-2.5 top-2 text-slate-400 font-mono">%</span>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={company.operationalExpensesPercent !== undefined ? company.operationalExpensesPercent : 15}
                onChange={(e) => onChangeCompany({ 
                  ...company, 
                  operationalExpensesPercent: parseFloat(e.target.value) || 0,
                  operationalExpensesMonthly: (company.monthlyRevenue || 0) * ((parseFloat(e.target.value) || 0) / 100)
                })}
                className="w-full bg-[#0B0F19] border border-slate-800 rounded px-2 pr-7 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                placeholder="15"
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Dedução do Lucro Real na DRE e apuração IRPJ/CSLL
            </span>
          </div>

          {/* Vendas B2B (% para PJ) */}
          <div className="bg-[#0F172A] p-3.5 rounded-xl border border-slate-800 shadow-xs">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-medium text-slate-300">
                % Vendas para Pessoas Jurídicas (B2B)
              </label>
              <span className="text-[10px] text-emerald-400 font-mono">{company.b2bSalesPercent || 50}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={company.b2bSalesPercent || 50}
              onChange={(e) => onChangeCompany({ ...company, b2bSalesPercent: parseInt(e.target.value) })}
              className="w-full accent-blue-500 mt-2"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Mede a competitividade do repasse de crédito na Reforma IBS/CBS
            </span>
          </div>

        </div>

        {/* Setor de Transportes: Identificação e Tratamento Fiscal Especial */}
        <div className={`p-4 rounded-xl border transition ${
          company.isTransportService 
            ? 'bg-blue-950/30 border-blue-800/80 shadow-xs' 
            : 'bg-[#0B0F19] border-slate-800 shadow-xs'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="isTransportServiceCheckbox"
                checked={company.isTransportService || false}
                onChange={(e) => {
                  const isTransport = e.target.checked;
                  onChangeCompany({
                    ...company,
                    isTransportService: isTransport,
                    transportType: isTransport ? (company.transportType || 'intermunicipal_cargas') : undefined
                  });
                }}
                className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-blue-500 cursor-pointer"
              />
              <div>
                <label htmlFor="isTransportServiceCheckbox" className="text-sm font-bold text-slate-100 cursor-pointer hover:text-blue-400 flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-blue-400" />
                  <span>A empresa atua com prestação de Serviços de Transporte?</span>
                  {company.isTransportService && (
                    <span className="text-[10px] font-mono uppercase bg-blue-950/80 text-blue-300 border border-blue-800 px-2 py-0.5 rounded font-bold">
                      Regras Tributárias Especiais Ativadas
                    </span>
                  )}
                </label>
                <p className="text-xs text-slate-400 mt-0.5">
                  Serviços de transportes possuem regras diferenciadas na LC 123/06 (recolhimento de ICMS no lugar de ISS no Anexo III) e no Lucro Presumido (presunção reduzida de 8% para cargas e 16% para passageiros conforme Lei 9.249/95).
                </p>
              </div>
            </div>

            {company.isTransportService && (
              <div className="shrink-0">
                <select
                  value={company.transportType || 'intermunicipal_cargas'}
                  onChange={(e) => onChangeCompany({ ...company, transportType: e.target.value as TransportType })}
                  className="bg-[#0F172A] border border-blue-700/80 rounded px-3 py-1.5 text-xs font-sans text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="intermunicipal_cargas" className="bg-slate-900 text-slate-100">Intermunicipal / Interestadual de Cargas (ICMS estadual / 8% Presumido)</option>
                  <option value="intermunicipal_passageiros" className="bg-slate-900 text-slate-100">Intermunicipal / Interestadual de Passageiros (ICMS estadual / 16% Presumido)</option>
                  <option value="municipal" className="bg-slate-900 text-slate-100">Municipal / Coleta Urbana (ISS municipal / 32% Presumido)</option>
                </select>
              </div>
            )}
          </div>

          {company.isTransportService && calculation.transportAnalysis && (
            <div className="mt-3 pt-3 border-t border-blue-900/50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
              <div className="bg-[#0F172A] p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Enquadramento Legal:</span>
                <span className="text-slate-100 font-bold">{calculation.transportAnalysis.transportLabel}</span>
              </div>
              <div className="bg-[#0F172A] p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Competência Tributária:</span>
                <span className={`font-bold ${calculation.transportAnalysis.taxJurisdiction === 'estadual_icms' ? 'text-blue-400' : 'text-emerald-400'}`}>
                  {calculation.transportAnalysis.taxJurisdiction === 'estadual_icms' ? 'Estadual (ICMS / CT-e / MDF-e)' : 'Municipal (ISS / NFS-e)'}
                </span>
              </div>
              <div className="bg-[#0F172A] p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Presunção Lucro Presumido:</span>
                <span className="text-amber-400 font-bold">
                  IRPJ: {calculation.transportAnalysis.lucroPresumidoIRPJRate}% | CSLL: {calculation.transportAnalysis.lucroPresumidoCSLLRate}%
                </span>
              </div>
              <div className="bg-[#0F172A] p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Simples Nacional:</span>
                <span className="text-slate-300 text-[11px]">{calculation.transportAnalysis.anexoSimplesUsed}</span>
              </div>
            </div>
          )}

          {/* Identificação de Regra Estadual de ICMS no Simples Nacional (ex: Paraná Lei 15.342/2006) */}
          <div className="mt-4 p-4 rounded-xl border bg-[#0F172A] border-slate-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-blue-950/80 text-blue-400 border border-blue-800/80 shrink-0 mt-0.5">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-100 font-sans">
                      Identificação da Regra de ICMS Estadual do Simples Nacional ({company.uf || 'PR'})
                    </h4>
                    {company.uf === 'PR' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
                        Lei Estadual nº 15.342/2006 (PR) Ativa
                      </span>
                    ) : company.uf === 'RS' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
                        Lei Estadual nº 13.036/2008 (RS) Ativa
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        Regra Geral da LC 123/2006
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {company.uf === 'PR' ? (
                      <span>
                        O Estado do Paraná instituiu tratamento favorecido com base no <strong className="text-white">Art. 19 da LC 123/2006</strong>: 
                        receita bruta acumulada (RBT12) de até <strong className="text-emerald-300">R$ 360.000,00 tem 100% de isenção de ICMS</strong>; 
                        acima de <strong className="text-emerald-300">R$ 360.000,00 até R$ 3.600.000,00 tem redução progressiva de 62,50% a 20,00%</strong>.
                      </span>
                    ) : company.uf === 'RS' ? (
                      <span>
                        O Rio Grande do Sul estabelece isenção integral de ICMS para RBT12 de até <strong className="text-emerald-300">R$ 360.000,00</strong> e 
                        faixas de redução escalonadas até o sublimite estadual de R$ 3,6 milhões (Lei nº 13.036/2008).
                      </span>
                    ) : (
                      <span>
                        No estado de <strong className="text-white">{BRAZILIAN_STATES_ICMS[company.uf || 'SP']?.name || company.uf}</strong> aplica-se a alíquota 
                        nominal do Anexo sem benefício de redução estadual do ICMS. O sublimite estadual para recolhimento no DAS é de <strong className="text-white">R$ 3.600.000,00</strong>.
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {/* Switch da Tabela de ICMS Ativa */}
                <div className="flex items-center space-x-2 bg-[#0B0F19] px-3 py-1.5 rounded-lg border border-slate-800 shadow-2xs">
                  <label className="flex items-center space-x-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      id="applyStateIcmsReductionToggle"
                      checked={company.applyStateIcmsReduction !== false}
                      onChange={(e) => onChangeCompany({
                        ...company,
                        applyStateIcmsReduction: e.target.checked
                      })}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-200">
                      Tabela de ICMS
                    </span>
                  </label>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    company.applyStateIcmsReduction !== false
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {company.applyStateIcmsReduction !== false ? 'ATIVA ✓' : 'DESATIVADA'}
                  </span>
                </div>

                {company.uf !== 'PR' && (
                  <button
                    type="button"
                    onClick={() => onChangeCompany({ ...company, uf: 'PR', applyStateIcmsReduction: true })}
                    className="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/80 text-emerald-300 text-xs font-semibold transition cursor-pointer"
                  >
                    Simular no Paraná
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setActiveSubTab('beneficio_icms');
                    setTimeout(() => {
                      const el = document.getElementById('subtabs-nav-header');
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 50);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
                >
                  <span>Ver Tabela Completa</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Diagnostic Indicator for Company */}
            {calculation.stateSimplesIcmsBenefit?.hasBenefit && (
              <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="bg-[#0B0F19] p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">RBT12 da Empresa:</span>
                  <span className="text-slate-100 font-bold">{formatCurrencyBRL(calculation.standaloneRbt12)}</span>
                </div>
                <div className="bg-[#0B0F19] p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Faixa Estadual Aplicada:</span>
                  <span className="text-blue-400 font-bold">{calculation.stateSimplesIcmsBenefit.appliedBracket}</span>
                </div>
                <div className="bg-[#0B0F19] p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Redução no ICMS:</span>
                  <span className="text-emerald-400 font-bold">
                    {calculation.stateSimplesIcmsBenefit.reductionPercent}% {calculation.stateSimplesIcmsBenefit.isExempt ? '(ISENTO)' : 'DE DESCONTO'}
                  </span>
                </div>
                <div className="bg-[#0B0F19] p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Economia Estimada no DAS:</span>
                  <span className="text-emerald-400 font-bold">
                    {formatCurrencyBRL(calculation.stateSimplesIcmsBenefit.monthlySavingsEstimated)}/mês
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Discriminação de Receitas por Múltiplos Anexos Marcados (Anexos I, II, III, IV, V e Mercado Externo) */}
      <div className="bg-[#0F172A] p-5 rounded-2xl border border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100 flex items-center space-x-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <span>2. Segregação de Receitas por Anexos Marcados (Mercado Interno vs Exportação)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Marque os anexos em que a empresa opera ou adicione diretamente as opções oficiais do catálogo e-CAC / PGDAS-D.
            </p>
          </div>
          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <button
              onClick={() => setIsEcacPickerOpen(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
            >
              <ListPlus className="w-4 h-4" />
              <span>+ Opções Oficiais e-CAC</span>
            </button>
            <button
              onClick={() => setShowAdvancedDeductions(!showAdvancedDeductions)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#0B0F19] hover:bg-slate-800 text-slate-300 border border-slate-800 transition cursor-pointer"
            >
              {showAdvancedDeductions ? '▲ Ocultar Deduções' : '▼ Deduções (ST / Monofásico / ISS)'}
            </button>
          </div>
        </div>

        {/* Lista Unificada e Dinâmica de Atividades e Anexos da Empresa (e-CAC / PGDAS-D) */}
        {currentAnexoRevenues.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-[#0B0F19] border border-dashed border-slate-800 space-y-3">
            <Layers className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">Nenhuma atividade tributária configurada</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Importe o PDF original do PGDAS-D ou selecione as atividades diretamente no catálogo oficial do e-CAC.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => setIsEcacPickerOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-xs transition cursor-pointer"
              >
                + Abrir Catálogo Oficial e-CAC
              </button>
              <button
                type="button"
                onClick={() => handleAddStandardActivity('anexo_1')}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition cursor-pointer"
              >
                + Adicionar Comércio (Anexo I)
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {currentAnexoRevenues.map((anexoData, idx) => {
              const anexoCalc = calculation.anexoCalculations?.find(c => 
                c.activityKey === anexoData.activityKey || (c.anexo === anexoData.anexo && !c.activityKey)
              );

              return (
                <div 
                  key={anexoData.activityKey || anexoData.id || `act-${idx}`}
                  className={`p-4 rounded-xl border transition ${
                    anexoData.active 
                      ? 'bg-[#0B0F19] border-blue-800/80 shadow-2xs' 
                      : 'bg-[#0B0F19]/50 border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Toggle, Título & Badges Oficiais */}
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id={`check-act-${anexoData.activityKey}`}
                        checked={anexoData.active}
                        onChange={() => handleToggleActivity(anexoData.activityKey)}
                        className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-blue-500 cursor-pointer"
                      />
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <label 
                            htmlFor={`check-act-${anexoData.activityKey}`} 
                            className="text-sm font-bold text-slate-100 cursor-pointer hover:text-blue-400 flex items-center space-x-1.5"
                          >
                            {anexoData.isTransport && (
                              <Truck className="w-4 h-4 text-blue-400 shrink-0 inline mr-1" />
                            )}
                            <span>{anexoData.activityTitle || anexoData.description || `Atividade Anexo ${anexoData.anexo}`}</span>
                          </label>

                          <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                            anexoData.isTransport
                              ? 'bg-blue-950/80 text-blue-300 border border-blue-800'
                              : anexoData.anexo === 'I'
                              ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                              : anexoData.anexo === 'II'
                              ? 'bg-orange-950/80 text-orange-300 border border-orange-800'
                              : anexoData.anexo === 'III'
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                              : anexoData.anexo === 'IV'
                              ? 'bg-purple-950/80 text-purple-300 border border-purple-800'
                              : 'bg-indigo-950/80 text-indigo-300 border border-indigo-800'
                          }`}>
                            Anexo {anexoData.anexo}
                          </span>

                          {anexoData.subjectToFatorR && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800 font-mono">
                              Sujeito ao Fator R
                            </span>
                          )}

                          {anexoData.stPercent > 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800 font-mono">
                              ICMS ST ({anexoData.stPercent}%)
                            </span>
                          )}

                          {anexoData.issRetidoPercent > 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800 font-mono">
                              ISS Retido ({anexoData.issRetidoPercent}%)
                            </span>
                          )}

                          {anexoData.monofasicoPercent > 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-mono">
                              Monofásico ({anexoData.monofasicoPercent}%)
                            </span>
                          )}

                          {anexoData.ecacOptionCode && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
                              Cód: {anexoData.ecacOptionCode}
                            </span>
                          )}
                        </div>

                        {anexoData.description && anexoData.description !== anexoData.activityTitle && (
                          <p className="text-xs text-slate-400 mt-1 max-w-2xl">{anexoData.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Entradas de Receita e Valores Apurados quando ativa */}
                    {anexoData.active && (
                      <div className="flex flex-wrap items-center gap-3 shrink-0">
                        {/* Mercado Interno */}
                        <div className="bg-[#0F172A] p-2.5 rounded-lg min-w-[150px] border border-slate-800">
                          <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                            Mercado Interno (R$)
                          </label>
                          <input
                            type="number"
                            value={anexoData.monthlyRevenueInternal || ''}
                            onChange={(e) => handleUpdateActivityRevenue(anexoData.activityKey, 'monthlyRevenueInternal', parseFloat(e.target.value) || 0)}
                            className="w-full bg-[#0B0F19] border border-slate-800 rounded px-2.5 py-1 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                            placeholder="0,00"
                          />
                        </div>

                        {/* Exportação */}
                        <div className="bg-[#0F172A] p-2.5 rounded-lg min-w-[150px] border border-emerald-800/80">
                          <label className="block text-[10px] font-mono uppercase text-emerald-400 mb-1 flex items-center space-x-1">
                            <Globe2 className="w-3 h-3" />
                            <span>Exportação (R$)</span>
                          </label>
                          <input
                            type="number"
                            value={anexoData.monthlyRevenueExport || ''}
                            onChange={(e) => handleUpdateActivityRevenue(anexoData.activityKey, 'monthlyRevenueExport', parseFloat(e.target.value) || 0)}
                            className="w-full bg-[#0B0F19] border border-emerald-800/80 rounded px-2.5 py-1 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                            placeholder="0,00"
                          />
                        </div>

                        {/* DAS Apurado */}
                        {anexoCalc && (
                          <div className="bg-[#0F172A] p-2.5 rounded-lg min-w-[130px] border border-slate-800 flex flex-col justify-between">
                            <span className="text-[10px] font-mono uppercase text-slate-400">DAS Apurado</span>
                            <div className="mt-1">
                              <span className="text-sm font-mono font-bold text-blue-400 block">
                                {formatCurrencyBRL(anexoCalc.taxDue || 0)}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                Alíq: {formatPercentBR(anexoCalc.effectiveRate || 0)}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Botão Remover Atividade */}
                        <button
                          type="button"
                          onClick={() => handleRemoveActivity(anexoData.activityKey)}
                          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
                          title="Remover esta atividade"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Gestão de Situações Especiais (ST, Retenção, Monofásico, Subcontratação, etc.) */}
                  {anexoData.active && (
                    <div className="mt-3 pt-3 border-t border-slate-800">
                      <ActivitySituationsManager
                        item={anexoData}
                        anexo={anexoData.anexo}
                        effectiveSimplesRate={anexoCalc?.effectiveRate || calculation.effectiveRate || 0.065}
                        isTransport={anexoData.isTransport}
                        onChangeItem={(updatedItem) => handleUpdateFullActivityItem(anexoData.activityKey, updatedItem)}
                      />
                    </div>
                  )}

                  {/* Painel de Percentuais Detalhados (se ativado pelo usuário) */}
                  {anexoData.active && showAdvancedDeductions && (
                    <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#0F172A] p-3 rounded-lg border border-slate-800">
                      <div>
                        <label className="block text-[10px] text-slate-300 mb-1">% com ICMS ST</label>
                        <input
                          type="number"
                          max="100"
                          min="0"
                          value={anexoData.stPercent || ''}
                          onChange={(e) => handleUpdateActivityRevenue(anexoData.activityKey, 'stPercent', parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#0B0F19] border border-slate-800 rounded px-2 py-1 text-xs font-mono text-slate-100"
                          placeholder="0%"
                        />
                      </div>

                      {anexoData.anexo === 'I' && (
                        <div>
                          <label className="block text-[10px] text-slate-300 mb-1">% PIS/COFINS Monofásico</label>
                          <input
                            type="number"
                            max="100"
                            min="0"
                            value={anexoData.monofasicoPercent || ''}
                            onChange={(e) => handleUpdateActivityRevenue(anexoData.activityKey, 'monofasicoPercent', parseFloat(e.target.value) || 0)}
                            className="w-full bg-[#0B0F19] border border-slate-800 rounded px-2 py-1 text-xs font-mono text-slate-100"
                            placeholder="0%"
                          />
                        </div>
                      )}

                      {(anexoData.anexo === 'III' || anexoData.anexo === 'IV' || anexoData.anexo === 'V') && !anexoData.isTransport && (
                        <div>
                          <label className="block text-[10px] text-slate-300 mb-1">% ISS Retido na Fonte</label>
                          <input
                            type="number"
                            max="100"
                            min="0"
                            value={anexoData.issRetidoPercent || ''}
                            onChange={(e) => handleUpdateActivityRevenue(anexoData.activityKey, 'issRetidoPercent', parseFloat(e.target.value) || 0)}
                            className="w-full bg-[#0B0F19] border border-slate-800 rounded px-2 py-1 text-xs font-mono text-slate-100"
                            placeholder="0%"
                          />
                        </div>
                      )}

                      {anexoData.isTransport && (
                        <div>
                          <label className="block text-[10px] text-slate-300 mb-1">% Frete Subcontratado</label>
                          <input
                            type="number"
                            max="100"
                            min="0"
                            value={anexoData.subcontratacaoPercent || ''}
                            onChange={(e) => handleUpdateActivityRevenue(anexoData.activityKey, 'subcontratacaoPercent', parseFloat(e.target.value) || 0)}
                            className="w-full bg-[#0B0F19] border border-slate-800 rounded px-2 py-1 text-xs font-mono text-slate-100"
                            placeholder="0%"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-[10px] text-slate-300 mb-1">% Isenção / Redução</label>
                        <input
                          type="number"
                          max="100"
                          min="0"
                          value={anexoData.isencaoPercent || ''}
                          onChange={(e) => handleUpdateActivityRevenue(anexoData.activityKey, 'isencaoPercent', parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#0B0F19] border border-slate-800 rounded px-2 py-1 text-xs font-mono text-slate-100"
                          placeholder="0%"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Barra de Adição Rápida de Atividades */}
        <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-slate-800">
          <span className="text-xs text-slate-400 font-semibold flex items-center space-x-1.5 mr-1">
            <Plus className="w-3.5 h-3.5 text-blue-400" />
            <span>Adicionar Atividade:</span>
          </span>
          <button
            type="button"
            onClick={() => setIsEcacPickerOpen(true)}
            className="px-2.5 py-1 bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-800 rounded-lg text-xs font-semibold flex items-center space-x-1 transition cursor-pointer"
          >
            <ListPlus className="w-3.5 h-3.5" />
            <span>Catálogo Oficial e-CAC / PGDAS-D</span>
          </button>
          <button
            type="button"
            onClick={() => handleAddStandardActivity('anexo_1')}
            className="px-2.5 py-1 bg-[#0B0F19] hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs transition cursor-pointer"
          >
            + Comércio (Anexo I)
          </button>
          <button
            type="button"
            onClick={() => handleAddStandardActivity('anexo_2')}
            className="px-2.5 py-1 bg-[#0B0F19] hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs transition cursor-pointer"
          >
            + Indústria (Anexo II)
          </button>
          <button
            type="button"
            onClick={() => handleAddStandardActivity('anexo_3')}
            className="px-2.5 py-1 bg-[#0B0F19] hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs transition cursor-pointer"
          >
            + Serviços em Geral (Anexo III)
          </button>
          <button
            type="button"
            onClick={() => handleAddStandardActivity('anexo_4')}
            className="px-2.5 py-1 bg-[#0B0F19] hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs transition cursor-pointer"
          >
            + Advocacia/Limpeza (Anexo IV)
          </button>
          <button
            type="button"
            onClick={() => handleAddStandardActivity('anexo_5')}
            className="px-2.5 py-1 bg-[#0B0F19] hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs transition cursor-pointer"
          >
            + Fator R (Anexo V)
          </button>
          <button
            type="button"
            onClick={() => handleAddStandardActivity('anexo_3_transporte_cargas')}
            className="px-2.5 py-1 bg-[#0B0F19] hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs transition cursor-pointer"
          >
            + Frete de Cargas (Anexo III)
          </button>
        </div>

        {/* Resumo Consolidado de Receita */}
        <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-400">Receita Total Apurada no Mês:</span>{' '}
            <strong className="text-slate-100 text-sm">
              {formatCurrencyBRL((calculation.monthlyInternalRevenue || 0) + (calculation.monthlyExportRevenue || 0))}
            </strong>
          </div>
          <div>
            <span className="text-slate-400">Mercado Interno:</span>{' '}
            <strong className="text-blue-400">{formatCurrencyBRL(calculation.monthlyInternalRevenue || 0)}</strong>
          </div>
          <div>
            <span className="text-slate-400">Mercado Exterior (Exportação):</span>{' '}
            <strong className="text-emerald-400">{formatCurrencyBRL(calculation.monthlyExportRevenue || 0)}</strong>
          </div>
          <div>
            <span className="text-slate-400">Limite Adicional de Exportação Disponível:</span>{' '}
            <strong className="text-emerald-400">{formatCurrencyBRL(calculation.exportLimitAvailable || EXPORT_ADDITIONAL_LIMIT)}</strong>
          </div>
        </div>
      </div>

      {/* ALERTA CRÍTICO: SUBLIMITE ESTADUAL EXCEDIDO (R$ 3.600.000,00) */}
      {calculation.exceedsSublimit && calculation.sublimitExclusionDetails && (
        <div className="bg-amber-950/40 border border-amber-800/80 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-800/60 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-amber-900/60 rounded-lg text-amber-400 border border-amber-700/80">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider">
                  Aviso Obrigatório de Excesso de Sublimite Estadual (LC 123/06 Art. 13-A e 19)
                </h3>
                <p className="text-xs text-slate-300">
                  A receita da empresa ({formatCurrencyBRL(calculation.sublimitExclusionDetails.effectiveRbt12)}) ultrapassou o sublimite de {formatCurrencyBRL(STATE_SUBLIMIT)}. <strong className="text-amber-200">O ICMS e o ISS foram compulsoriamente excluídos do DAS</strong>.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveSubTab('sublimite')}
              className="px-3 py-1.5 bg-amber-600 text-white font-bold text-xs rounded-lg hover:bg-amber-500 transition flex items-center space-x-1 self-start sm:self-center shrink-0 cursor-pointer"
            >
              <span>Ver Memória Completa do Sublimite</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-[#0F172A] p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Excesso sobre Sublimite:</span>
              <span className="text-amber-400 font-bold text-sm">{formatCurrencyBRL(calculation.sublimitExclusionDetails.excessAmount)}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">({formatPercentBR(calculation.sublimitExclusionDetails.excessPercent)} acima do teto)</span>
            </div>
            <div className="bg-[#0F172A] p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Efeito Temporal / Vigência:</span>
              <span className="text-slate-100 font-bold text-[11px]">
                {calculation.sublimitExclusionDetails.effectiveExclusionDateRule === 'immediate_next_month'
                  ? 'Exclusão no Mês Subsequente'
                  : 'Exclusão a partir de 1º de Janeiro'}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {calculation.sublimitExclusionDetails.effectiveExclusionDateRule === 'immediate_next_month' ? 'Excesso superior a 20%' : 'Excesso até 20%'}
              </span>
            </div>
            <div className="bg-[#0F172A] p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">ICMS / ISS "Por Fora":</span>
              <span className="text-rose-400 font-bold text-sm">
                {formatCurrencyBRL(calculation.sublimitExclusionDetails.monthlyOutsideICMS + calculation.sublimitExclusionDetails.monthlyOutsideISS)}/mês
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Recolhimento em guia estadual/municipal</span>
            </div>
            <div className="bg-[#0F172A] p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Custo Adicional Mensal:</span>
              <span className="text-rose-400 font-bold text-sm">
                +{formatCurrencyBRL(calculation.sublimitExclusionDetails.monthlyAdditionalCostVsSimples)}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                +{formatCurrencyBRL(calculation.sublimitExclusionDetails.annualAdditionalCostVsSimples)}/ano
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navegação de Abas Secundárias do Analista Tributário - Grid Horizontal 8 Colunas */}
      <div id="subtabs-nav-header" className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2 border-b border-slate-800 pb-3 text-xs font-semibold w-full">
        <button
          onClick={() => setActiveSubTab('comparativo')}
          className={`px-3 py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer text-center ${
            activeSubTab === 'comparativo'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-950/40 border border-blue-400/40'
              : 'bg-slate-900/80 text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Scale className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">1. Comparativo 4 Regimes</span>
        </button>

        <button
          onClick={() => setActiveSubTab('auditoria_cpp')}
          className={`px-3 py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer text-center ${
            activeSubTab === 'auditoria_cpp'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/40 border border-indigo-400/40'
              : 'bg-slate-900/80 text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">2. Auditoria CPP</span>
          <span className="px-1 py-0.2 rounded text-[8px] bg-indigo-950/80 text-indigo-300 border border-indigo-800 font-bold font-mono">
            {calculation.payrollCppAudit?.hasEmployees ? '28,8%' : '20%'}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('anexos')}
          className={`px-3 py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer text-center ${
            activeSubTab === 'anexos'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-950/40 border border-blue-400/40'
              : 'bg-slate-900/80 text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">3. Anexos ({activeAnexosCount})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('sublimite')}
          className={`px-3 py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer text-center ${
            activeSubTab === 'sublimite'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-950/40 border border-amber-400/40'
              : calculation.exceedsSublimit
              ? 'text-amber-300 bg-amber-950/60 border border-amber-800'
              : 'bg-slate-900/80 text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">4. Sublimite ICMS/ISS</span>
          {calculation.exceedsSublimit && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('vantagens')}
          className={`px-3 py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer text-center ${
            activeSubTab === 'vantagens'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-950/40 border border-blue-400/40'
              : 'bg-slate-900/80 text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">5. Matriz Vantagens</span>
        </button>

        <button
          onClick={() => setActiveSubTab('dre')}
          className={`px-3 py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer text-center ${
            activeSubTab === 'dre'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-950/40 border border-blue-400/40'
              : 'bg-slate-900/80 text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">6. DRE Fiscal</span>
        </button>

        <button
          onClick={() => setActiveSubTab('impactos')}
          className={`px-3 py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer text-center ${
            activeSubTab === 'impactos'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-950/40 border border-blue-400/40'
              : 'bg-slate-900/80 text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">7. Impactos & B2B</span>
        </button>

        <button
          onClick={() => setActiveSubTab('beneficio_icms')}
          className={`px-3 py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer text-center ${
            activeSubTab === 'beneficio_icms'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-950/40 border border-blue-400/40'
              : calculation.stateSimplesIcmsBenefit?.hasBenefit
              ? 'text-emerald-300 bg-emerald-950/60 border border-emerald-800'
              : 'bg-slate-900/80 text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">8. ICMS Estadual</span>
          {calculation.stateSimplesIcmsBenefit?.hasBenefit && (
            <span className="px-1 py-0.2 rounded text-[8px] bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-bold font-mono">
              {calculation.stateSimplesIcmsBenefit.reductionPercent}%
            </span>
          )}
        </button>
      </div>

      {/* SUB-ABA 1: COMPARATIVO DOS 4 REGIMES */}
      {activeSubTab === 'comparativo' && (
        <div className="space-y-6">
          
          {/* Tabela Comparativa dos 4 Regimes */}
          <div className="bg-[#0F172A] rounded-xl border border-slate-800 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100 flex items-center space-x-2">
                <Scale className="w-5 h-5 text-blue-400" />
                <span>Quadro Comparativo de Carga Tributária Anual & Alíquotas Efetivas</span>
              </h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    setReportModalType('regimes');
                    setIsReportModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Gerar Relatório dos Regimes</span>
                </button>
                <span className="text-xs text-slate-400 font-mono hidden md:inline">
                  RIR/2018 e LC 123/2006
                </span>
              </div>
            </div>

            <div className="">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-[#0B0F19] border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">Regime Tributário</th>
                    <th className="py-3 px-3 text-right">Imposto Mensal</th>
                    <th className="py-3 px-3 text-right">Imposto Anual</th>
                    <th className="py-3 px-3 text-right">Alíquota Efetiva</th>
                    <th className="py-3 px-3 text-center">Crédito B2B</th>
                    <th className="py-3 px-3 text-center">Complexidade</th>
                    <th className="py-3 px-4 text-center">Recomendação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {calculation.regimesComparison.map((item) => (
                    <tr 
                      key={item.regime}
                      className={`transition ${
                        item.isRecommended 
                          ? 'bg-blue-950/40 hover:bg-blue-950/60' 
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          {item.isRecommended && (
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                          )}
                          <div>
                            <span className="font-bold text-slate-100 font-sans text-xs block">
                              {item.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-sans line-clamp-1">
                              {item.description}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-slate-200">
                        {formatCurrencyBRL(item.monthlyTaxTotal)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-extrabold text-slate-100 text-sm">
                        {formatCurrencyBRL(item.annualTaxTotal)}
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
                      <td className="py-3.5 px-3 text-center capitalize text-slate-300">
                        {item.complianceComplexity.replace('_', ' ')}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {item.isRecommended ? (
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cards Detalhados dos Tributos por Regime */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {calculation.regimesComparison.map((item) => (
              <div 
                key={item.regime}
                className={`p-4 rounded-xl border flex flex-col justify-between ${
                  item.isRecommended 
                    ? 'bg-[#0F172A] border-emerald-500/80 ring-1 ring-emerald-500/30 shadow-xs' 
                    : 'bg-[#0F172A] border-slate-800 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold font-sans text-slate-100">
                      {item.shortName}
                    </span>
                    {item.isRecommended && (
                      <span className="text-[10px] font-mono uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-bold">
                        Mais Vantajoso
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 py-2 border-y border-slate-800 text-[11px] font-mono text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">IRPJ:</span>
                      <span>{formatCurrencyBRL(item.taxes.irpj)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">CSLL:</span>
                      <span>{formatCurrencyBRL(item.taxes.csll)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">PIS / COFINS:</span>
                      <span>{formatCurrencyBRL(item.taxes.pis + item.taxes.cofins)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">CPP / Encargos Folha:</span>
                      <span>{formatCurrencyBRL(item.taxes.cppEncargos)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">ICMS / ISS:</span>
                      <span>{formatCurrencyBRL(item.taxes.icms + item.taxes.iss)}</span>
                    </div>
                    {item.taxes.ibsCbs !== undefined && item.taxes.ibsCbs > 0 && (
                      <div className="flex justify-between text-blue-400 font-bold">
                        <span>IBS + CBS (Reforma):</span>
                        <span>{formatCurrencyBRL(item.taxes.ibsCbs)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 mt-2 flex items-baseline justify-between border-t border-slate-800">
                  <span className="text-[10px] uppercase font-mono text-slate-400">Total Mensal</span>
                  <span className="text-sm font-mono font-bold text-slate-100">
                    {formatCurrencyBRL(item.monthlyTaxTotal)}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* SUB-ABA: MEMÓRIA DOS ANEXOS E ATIVIDADES DE TRANSPORTE */}
      {activeSubTab === 'anexos' && (
        <div className="space-y-6">
          <div className="bg-[#0F172A] rounded-xl border border-slate-800 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#0B0F19]">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100 flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-blue-400" />
                  <span>Quadro Discriminado de Receitas e Tributos por Anexo / Atividade</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Segregação analítica com diferenciação de competência (ICMS Estadual vs ISS Municipal) e presunção no Lucro Presumido
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {activeAnexosCount} {activeAnexosCount === 1 ? 'atividade ativa' : 'atividades ativas'}
              </span>
            </div>

            <div className="">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">Atividade & Anexo</th>
                    <th className="py-3 px-3">Competência</th>
                    <th className="py-3 px-3 text-right">Receita Interna</th>
                    <th className="py-3 px-3 text-right">Exportação</th>
                    <th className="py-3 px-3 text-right">Alíq. Efetiva</th>
                    <th className="py-3 px-3 text-right">DAS Mensal</th>
                    <th className="py-3 px-3 text-right">DAS Anual</th>
                    <th className="py-3 px-3 text-center">Presunção LP</th>
                    <th className="py-3 px-4">Base Legal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {currentAnexoRevenues.filter(a => a.active).length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400 font-sans">
                        Nenhuma atividade marcada como ativa. Marque pelo menos um Anexo ou Atividade na Seção 2 acima.
                      </td>
                    </tr>
                  ) : (
                    currentAnexoRevenues.filter(a => a.active).map(act => {
                      const meta = DEFAULT_ANEXO_ACTIVITIES.find(m => m.key === act.activityKey) || DEFAULT_ANEXO_ACTIVITIES.find(m => m.anexo === act.anexo);
                      const calc = calculation.anexoCalculations?.find(c => 
                        (c.activityKey && c.activityKey === act.activityKey) || 
                        (!c.activityKey && c.anexo === act.anexo)
                      );

                      const taxDueMonth = calc?.taxDue || 0;
                      const effRate = calc?.effectiveRate || 0;

                      return (
                        <tr key={act.activityKey || act.anexo} className="hover:bg-slate-900/60 transition">
                          <td className="py-3.5 px-4 font-sans">
                            <div className="flex items-center space-x-2">
                              {act.isTransport && (
                                <Truck className="w-4 h-4 text-blue-400 shrink-0" />
                              )}
                              <div>
                                <span className="font-bold text-slate-100 block">{act.activityTitle || meta?.title || `Anexo ${act.anexo}`}</span>
                                <span className="text-[10px] text-slate-400">{meta?.badge}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              (calc?.taxJurisdiction === 'estadual_icms' || meta?.taxJurisdiction === 'estadual_icms')
                                ? 'bg-blue-950/60 text-blue-300 border border-blue-800/60'
                                : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                            }`}>
                              {(calc?.taxJurisdiction === 'estadual_icms' || meta?.taxJurisdiction === 'estadual_icms') ? 'ICMS (Estado)' : 'ISS (Município)'}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-right font-bold text-slate-200">
                            {formatCurrencyBRL(act.monthlyRevenueInternal || 0)}
                          </td>
                          <td className="py-3.5 px-3 text-right text-emerald-400 font-bold">
                            {formatCurrencyBRL(act.monthlyRevenueExport || 0)}
                          </td>
                          <td className="py-3.5 px-3 text-right font-bold text-blue-400">
                            {formatPercentBR(effRate)}
                          </td>
                          <td className="py-3.5 px-3 text-right font-bold text-slate-100">
                            {formatCurrencyBRL(taxDueMonth)}
                          </td>
                          <td className="py-3.5 px-3 text-right font-bold text-slate-100">
                            {formatCurrencyBRL(taxDueMonth * 12)}
                          </td>
                          <td className="py-3.5 px-3 text-center text-amber-400 font-bold text-[11px]">
                            {meta ? `IRPJ ${Math.round((meta.presumedProfitRateIRPJ || 0) * 100)}% | CSLL ${Math.round((meta.presumedProfitRateCSLL || 0) * 100)}%` : '-'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 text-[10px]">
                            {meta?.legalBasis || '-'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cards com destaques regulatórios e de segregação */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            <div className="bg-[#0F172A] p-4 rounded-xl border border-slate-800 shadow-xs space-y-2">
              <span className="text-[10px] uppercase text-slate-400 block font-bold">Total Receita do Mês</span>
              <span className="text-xl font-bold text-slate-100 block">
                {formatCurrencyBRL((calculation.monthlyInternalRevenue || 0) + (calculation.monthlyExportRevenue || 0))}
              </span>
              <span className="text-[10px] text-slate-400 block">
                Interno: {formatCurrencyBRL(calculation.monthlyInternalRevenue || 0)} | Exportação: {formatCurrencyBRL(calculation.monthlyExportRevenue || 0)}
              </span>
            </div>

            <div className="bg-[#0F172A] p-4 rounded-xl border border-blue-900/60 shadow-xs space-y-2">
              <span className="text-[10px] uppercase text-blue-400 block font-bold">DAS Mensal Consolidado</span>
              <span className="text-xl font-bold text-blue-400 block">
                {formatCurrencyBRL(calculation.effectiveTaxMonthly)}
              </span>
              <span className="text-[10px] text-slate-400 block">
                Alíquota Efetiva Média: {formatPercentBR(calculation.effectiveRate)}
              </span>
            </div>

            <div className="bg-[#0F172A] p-4 rounded-xl border border-amber-900/60 shadow-xs space-y-2">
              <span className="text-[10px] uppercase text-amber-400 block font-bold">Lucro Presumido Anual</span>
              <span className="text-xl font-bold text-amber-400 block">
                {formatCurrencyBRL(calculation.lucroPresumidoAnnualTax)}
              </span>
              <span className="text-[10px] text-slate-400 block">
                Alíquota Efetiva LP: {formatPercentBR(calculation.lucroPresumidoEffectiveRate)} (8%/16%/32% por atividade)
              </span>
            </div>

            <div className="bg-[#0F172A] p-4 rounded-xl border border-emerald-900/60 shadow-xs space-y-2">
              <span className="text-[10px] uppercase text-emerald-400 block font-bold flex items-center space-x-1">
                <Truck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                <span>ICMS Transporte ({company.uf || 'SP'})</span>
              </span>
              <span className="text-xl font-bold text-emerald-400 block">
                {stateIcmsInfo.standardInternalRate}% <span className="text-xs text-slate-400 font-normal">({stateIcmsInfo.effectiveInternalRateWithConv106}% c/ benefício)</span>
              </span>
              <span className="text-[10px] text-slate-400 block">
                Conv. 106/96 (-20% crédito) | SF 22/89 (7%/12%)
              </span>
            </div>
          </div>

          {/* MÓDULO ESPECIALIZADO: TRIBUTAÇÃO DE ICMS NO TRANSPORTE CONFORME O ESTADO & SIMULADOR DE ROTAS */}
          <div className="bg-[#0F172A] rounded-xl border border-slate-800 overflow-hidden shadow-xs space-y-0">
            {/* Header do Módulo */}
            <div className="p-4 bg-[#0B0F19] border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-blue-950/80 text-blue-400 border border-blue-800">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center space-x-2">
                      <span>Tributação de ICMS no Transporte conforme o Estado</span>
                      <span className="text-[10px] bg-blue-950/80 text-blue-300 px-2 py-0.5 rounded font-mono border border-blue-800">
                        Dossiê Fiscal & Rotas
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Tratamento tributário de fretes intermunicipais e interestaduais (LC 123/06 Art. 18 § 5º-E, Convênio ICMS 25/90, Convênio ICMS 106/96 e Resolução SF 22/89)
                    </p>
                  </div>
                </div>
              </div>

              {/* Botões de Navegação do Sub-Painel de Transporte */}
              <div className="flex items-center space-x-1.5 bg-[#0F172A] p-1 rounded-lg border border-slate-800 shadow-2xs shrink-0 self-start md:self-auto">
                <button
                  onClick={() => setTransportViewMode('simulador')}
                  className={`px-3 py-1.5 rounded text-xs font-semibold transition flex items-center space-x-1.5 ${
                    transportViewMode === 'simulador'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Simulador de Rota</span>
                </button>
                <button
                  onClick={() => setTransportViewMode('dossie')}
                  className={`px-3 py-1.5 rounded text-xs font-semibold transition flex items-center space-x-1.5 ${
                    transportViewMode === 'dossie'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Dossiê da UF ({selectedTransportUf})</span>
                </button>
                <button
                  onClick={() => setTransportViewMode('tabela')}
                  className={`px-3 py-1.5 rounded text-xs font-semibold transition flex items-center space-x-1.5 ${
                    transportViewMode === 'tabela'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Tabela dos 27 Estados</span>
                </button>
              </div>
            </div>

            {/* SELETOR RÁPIDO DE ESTADO (UF) */}
            <div className="px-4 py-3 bg-[#0B0F19] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-slate-400 font-mono text-[11px] uppercase flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span>Estado de Origem do Frete (Início da Prestação):</span>
                </span>
                <select
                  value={selectedTransportUf}
                  onChange={(e) => setSelectedTransportUf(e.target.value)}
                  className="bg-[#0F172A] border border-blue-800 rounded px-2.5 py-1 text-xs font-bold font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  {statesList.map((st) => (
                    <option key={st.uf} value={st.uf} className="bg-[#0F172A] text-slate-100">
                      {st.uf} - {st.name} ({st.standardRate}%) {st.uf === (company.uf || 'SP') ? '★ [UF da Empresa]' : ''}
                    </option>
                  ))}
                </select>
                {selectedTransportUf === (company.uf || 'SP') && (
                  <span className="text-[10px] bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded font-mono border border-emerald-800">
                    Sede da Empresa
                  </span>
                )}
              </div>

              {/* Badges de Destaque da UF selecionada */}
              <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                <span className="px-2 py-0.5 rounded bg-[#0F172A] text-slate-300 border border-slate-800 shadow-2xs">
                  Região: <strong className="text-slate-100">{stateIcmsInfo.region}</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-[#0F172A] text-blue-400 border border-blue-900 shadow-2xs">
                  Alíquota Interna: <strong className="text-blue-300">{stateIcmsInfo.standardInternalRate}%</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-[#0F172A] text-emerald-400 border border-emerald-900 shadow-2xs">
                  Líquida c/ Conv. 106/96: <strong className="text-emerald-300">{stateIcmsInfo.effectiveInternalRateWithConv106}%</strong>
                </span>
              </div>
            </div>

            {/* CONTEÚDO DA SUB-ABA 1: SIMULADOR INTERATIVO DE ROTA & COMPARATIVO */}
            {transportViewMode === 'simulador' && (
              <div className="p-5 space-y-5">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  
                  {/* Controles de Configuração da Rota (Coluna Esquerda - 5 cols) */}
                  <div className="lg:col-span-5 bg-[#0B0F19] p-4 rounded-xl border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center space-x-1.5">
                        <Compass className="w-4 h-4 text-blue-400" />
                        <span>Parametrização da Operação de Transporte</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">CT-e / MDF-e</span>
                    </div>

                    {/* Origem e Destino com Inversão de Rota */}
                    <div className="grid grid-cols-5 gap-2 items-center">
                      <div className="col-span-2">
                        <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">
                          UF Origem (Início)
                        </label>
                        <select
                          value={selectedTransportUf}
                          onChange={(e) => setSelectedTransportUf(e.target.value)}
                          className="w-full bg-[#0F172A] border border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono font-bold text-slate-100 focus:outline-none focus:border-blue-500"
                        >
                          {statesList.map((st) => (
                            <option key={st.uf} value={st.uf} className="bg-[#0F172A] text-slate-100">
                              {st.uf} - {st.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-1 flex justify-center pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            const prevOrig = selectedTransportUf;
                            setSelectedTransportUf(destinationUf);
                            setDestinationUf(prevOrig);
                          }}
                          className="p-1.5 rounded-lg bg-[#0F172A] hover:bg-slate-800 border border-slate-800 text-blue-400 transition"
                          title="Inverter Origem e Destino"
                        >
                          <ArrowRightLeft className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="col-span-2">
                        <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">
                          UF Destino (Término)
                        </label>
                        <select
                          value={destinationUf}
                          onChange={(e) => setDestinationUf(e.target.value)}
                          className="w-full bg-[#0F172A] border border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono font-bold text-slate-100 focus:outline-none focus:border-blue-500"
                        >
                          {statesList.map((st) => (
                            <option key={st.uf} value={st.uf} className="bg-[#0F172A] text-slate-100">
                              {st.uf} - {st.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Valor do Frete */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-mono uppercase text-slate-400">
                          Valor Bruto da Prestação de Frete (R$)
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const activeTransportRevenue = currentAnexoRevenues.find(a => a.active && a.isTransport)?.monthlyRevenueInternal;
                            if (activeTransportRevenue && activeTransportRevenue > 0) {
                              setRouteFreightAmount(activeTransportRevenue);
                            }
                          }}
                          className="text-[9px] text-blue-400 hover:underline font-mono"
                        >
                          Puxar da Receita de Transporte Informada
                        </button>
                      </div>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1.5 text-slate-500 font-mono text-xs">R$</span>
                        <input
                          type="number"
                          value={routeFreightAmount || ''}
                          onChange={(e) => setRouteFreightAmount(parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#0F172A] border border-slate-800 rounded pl-8 pr-3 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                          placeholder="50000.00"
                        />
                      </div>
                    </div>

                    {/* Toggles de Enquadramento Fiscal do Frete */}
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">
                        Enquadramento Operacional do Frete:
                      </span>

                      {/* Subcontratação */}
                      <label className="flex items-start space-x-2 cursor-pointer bg-[#0F172A] p-2.5 rounded-lg border border-slate-800 hover:border-blue-700 transition">
                        <input
                          type="checkbox"
                          checked={routeIsSubcontracted}
                          onChange={(e) => {
                            setRouteIsSubcontracted(e.target.checked);
                            if (e.target.checked) setRouteIsExempt(false);
                          }}
                          className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-100 block">
                            Frete Subcontratado (Convênio ICMS 25/90)
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            A empresa atua como subcontratada. O ICMS é de responsabilidade da transportadora contratante principal. No Simples, a parcela de ICMS é deduzida integralmente do DAS.
                          </span>
                        </div>
                      </label>

                      {/* Isenção Estadual */}
                      <label className="flex items-start space-x-2 cursor-pointer bg-[#0F172A] p-2.5 rounded-lg border border-slate-800 hover:border-blue-700 transition">
                        <input
                          type="checkbox"
                          checked={routeIsExempt}
                          onChange={(e) => {
                            setRouteIsExempt(e.target.checked);
                            if (e.target.checked) setRouteIsSubcontracted(false);
                          }}
                          className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-100 block">
                            Frete Isento / Não Tributado de ICMS
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            Transporte de produtos com isenção estadual específica (ex: hortifrutigranjeiros) ou vinculados à exportação direta.
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Resultados da Rota & Comparativo Tributário (Coluna Direita - 7 cols) */}
                  <div className="lg:col-span-7 space-y-4">
                    
                    {/* Visualizador da Rota */}
                    <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5 mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="px-2.5 py-1 rounded bg-blue-600 text-white font-mono font-bold text-xs">
                            {simulatedRouteCalculation.originUF}
                          </span>
                          <ArrowRight className="w-4 h-4 text-slate-400" />
                          <span className="px-2.5 py-1 rounded bg-[#0F172A] text-slate-200 border border-slate-800 font-mono font-bold text-xs">
                            {simulatedRouteCalculation.destinationUF}
                          </span>
                          <span className="text-xs font-bold text-slate-100 ml-2">
                            {isInterstate ? 'Frete Interestadual' : 'Frete Intermunicipal (Interno)'}
                          </span>
                        </div>

                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          simulatedRouteCalculation.isSubcontracted
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                            : simulatedRouteCalculation.isExempt
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                            : 'bg-blue-950/80 text-blue-300 border border-blue-800'
                        }`}>
                          {routeOperationType}
                        </span>
                      </div>

                      {/* Grade de Indicadores de ICMS */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono mb-3">
                        <div className="bg-[#0F172A] p-2.5 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Alíquota ICMS:</span>
                          <span className="text-sm font-bold text-blue-400">{simulatedRouteCalculation.appliedIcmsRate}%</span>
                          <span className="text-[9px] text-slate-500 block mt-0.5">
                            {isInterstate ? 'Res. SF 22/89' : 'Alíq. Interna'}
                          </span>
                        </div>

                        <div className="bg-[#0F172A] p-2.5 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Débito Bruto:</span>
                          <span className="text-sm font-bold text-slate-100">
                            {formatCurrencyBRL(simulatedRouteCalculation.grossIcmsDebit)}
                          </span>
                          <span className="text-[9px] text-slate-500 block mt-0.5">
                            {simulatedRouteCalculation.appliedIcmsRate}% s/ Frete
                          </span>
                        </div>

                        <div className="bg-[#0F172A] p-2.5 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Crédito Presumido (20%):</span>
                          <span className="text-sm font-bold text-emerald-400">
                            - {formatCurrencyBRL(simulatedRouteCalculation.presumedCreditAmount)}
                          </span>
                          <span className="text-[9px] text-slate-500 block mt-0.5">
                            Convênio 106/96
                          </span>
                        </div>

                        <div className="bg-[#0F172A] p-2.5 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">ICMS Líquido Normal:</span>
                          <span className="text-sm font-bold text-slate-100">
                            {formatCurrencyBRL(simulatedRouteCalculation.netIcmsPayable)}
                          </span>
                          <span className="text-[9px] text-emerald-400 block mt-0.5">
                            Efetivo: {simulatedRouteCalculation.effectiveTaxRatePercent}%
                          </span>
                        </div>
                      </div>

                      {/* Comparativo com o Simples Nacional */}
                      <div className="bg-[#0F172A] p-3.5 rounded-lg border border-blue-900/60 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="text-xs font-bold text-slate-100 flex items-center space-x-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span>Comparativo: Regime Normal (ICMS) vs. Simples Nacional (Anexo III)</span>
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            Estimativa DAS Frete: {formatCurrencyBRL(simulatedRouteCalculation.simplesComparison.inDasIcmsAmount)}
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pt-1 border-t border-slate-800 font-mono text-xs">
                          <div>
                            <span className="text-slate-400 text-[11px]">Economia no ICMS do Frete: </span>
                            <strong className={simulatedRouteCalculation.simplesComparison.savingsVsNormalRegime >= 0 ? 'text-emerald-400 text-sm' : 'text-amber-400 text-sm'}>
                              {formatCurrencyBRL(Math.abs(simulatedRouteCalculation.simplesComparison.savingsVsNormalRegime))}
                            </strong>
                            <span className="text-[10px] text-slate-400 ml-1">
                              {simulatedRouteCalculation.simplesComparison.savingsVsNormalRegime >= 0 ? 'a favor do Simples' : 'a favor do Regime Normal'}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            Base: R$ {formatCurrencyBRL(simulatedRouteCalculation.freightValue)} de frete faturado
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-300 bg-[#0B0F19] p-2.5 rounded border border-slate-800">
                          {routeComparativeNote}
                        </p>
                      </div>

                      {/* Fundamentação Legal da Rota */}
                      <div className="mt-3 pt-2 text-[10px] text-slate-400 font-mono flex items-start space-x-1.5">
                        <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                        <span>
                          <strong>Fundamentação Legal:</strong> {simulatedRouteCalculation.legalBasis}
                        </span>
                      </div>
                    </div>

                  </div>

                </div>
              </div>
            )}

            {/* CONTEÚDO DA SUB-ABA 2: DOSSIÊ FISCAL DA UF SELECIONADA */}
            {transportViewMode === 'dossie' && (
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  
                  {/* Card 1: Alíquotas do Estado */}
                  <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800 shadow-xs space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-bold text-slate-100 uppercase flex items-center space-x-1.5">
                        <MapPin className="w-4 h-4 text-blue-400" />
                        <span>Alíquotas de ICMS ({stateIcmsInfo.uf})</span>
                      </span>
                      <span className="text-[10px] text-slate-400">{stateIcmsInfo.region}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                        <span className="text-slate-400">Alíquota Interna Padrão:</span>
                        <strong className="text-blue-400 text-sm">{stateIcmsInfo.standardInternalRate}%</strong>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                        <span className="text-slate-400">FCP (Fundo de Combate à Pobreza):</span>
                        <span className="text-slate-300">{stateIcmsInfo.fcpRate > 0 ? `${stateIcmsInfo.fcpRate}%` : 'Não se aplica a fretes'}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                        <span className="text-slate-400">Crédito Presumido (Conv. 106/96):</span>
                        <span className="text-emerald-400 font-bold">20% de Redução</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-slate-400">Alíquota Líquida Interna Efetiva:</span>
                        <strong className="text-emerald-400 text-sm">{stateIcmsInfo.effectiveInternalRateWithConv106}%</strong>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Alíquotas Interestaduais (Res. SF 22/89) */}
                  <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800 shadow-xs space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-bold text-slate-100 uppercase flex items-center space-x-1.5">
                        <ArrowRight className="w-4 h-4 text-amber-400" />
                        <span>Saídas Interestaduais (SF 22/89)</span>
                      </span>
                      <span className="text-[10px] text-slate-400">Origem {stateIcmsInfo.uf}</span>
                    </div>

                    <div className="space-y-2.5">
                      <div className="bg-[#0F172A] p-2.5 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Destino Sul e Sudeste (exceto ES):</span>
                        <div className="flex items-baseline justify-between mt-0.5">
                          <strong className="text-amber-400 text-sm">{stateIcmsInfo.interstateRateToSouthSoutheast}%</strong>
                          <span className="text-[10px] text-slate-400">
                            ({stateIcmsInfo.effectiveInterstateRate12WithConv106}% c/ Conv. 106/96)
                          </span>
                        </div>
                      </div>

                      <div className="bg-[#0F172A] p-2.5 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Destino Norte, Nordeste, Centro-Oeste e ES:</span>
                        <div className="flex items-baseline justify-between mt-0.5">
                          <strong className="text-amber-400 text-sm">{stateIcmsInfo.interstateRateToNorthNortheastCenterWestES}%</strong>
                          <span className="text-[10px] text-slate-400">
                            ({stateIcmsInfo.effectiveInterstateRate7WithConv106}% c/ Conv. 106/96)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Subcontratação (Convênio ICMS 25/90) */}
                  <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800 shadow-xs space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-bold text-slate-100 uppercase flex items-center space-x-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Regra de Subcontratação</span>
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">Convênio 25/90</span>
                    </div>

                    <div className="space-y-2">
                      <div className="text-[11px] text-slate-300 bg-[#0F172A] p-2.5 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 block mb-1">Legislação do RICMS Estadual:</span>
                        <strong className="text-slate-100 block">{stateIcmsInfo.subcontractTreatment}</strong>
                        <span className="text-[9px] text-slate-400 block mt-1">{stateIcmsInfo.subcontractLegalBasis}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        A transportadora contratada que subcontrata outra transportadora responde integralmente pelo imposto. A subcontratada fica dispensada da emissão de CT-e de cobrança tributada e, no Simples Nacional, <strong>deduz 100% da parcela de ICMS no PGDAS-D</strong>.
                      </p>
                    </div>
                  </div>

                </div>

                {/* Notas Específicas do Estado */}
                <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800 shadow-xs text-xs">
                  <span className="text-slate-300 font-mono text-[11px] uppercase block font-bold mb-1">
                    Observações & Particularidades da Legislação Estadual de {stateIcmsInfo.stateName} ({stateIcmsInfo.uf}):
                  </span>
                  <p className="text-slate-400 leading-relaxed font-sans">
                    {stateIcmsInfo.notes}
                  </p>
                </div>
              </div>
            )}

            {/* CONTEÚDO DA SUB-ABA 3: TABELA DOS 27 ESTADOS BRASILEIROS */}
            {transportViewMode === 'tabela' && (
              <div className="p-5 space-y-4">
                {/* Filtros e Busca */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={transportUfSearch}
                      onChange={(e) => setTransportUfSearch(e.target.value)}
                      placeholder="Buscar por UF ou Estado..."
                      className="w-full bg-[#0F172A] border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-xs"
                    />
                  </div>

                  <div className="flex items-center space-x-1  w-full sm:w-auto text-xs">
                    {['todos', 'Sudeste', 'Sul', 'Centro-Oeste', 'Nordeste', 'Norte'].map((reg) => (
                      <button
                        key={reg}
                        onClick={() => setTransportRegionFilter(reg)}
                        className={`px-2.5 py-1 rounded-lg transition  text-[11px] ${
                          transportRegionFilter === reg
                            ? 'bg-blue-600 text-white font-bold shadow-xs'
                            : 'bg-[#0F172A] text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-slate-800'
                        }`}
                      >
                        {reg === 'todos' ? 'Todas as Regiões' : reg}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tabela dos 27 Estados */}
                <div className=" rounded-xl border border-slate-800 shadow-xs">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="bg-[#0B0F19] border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                        <th className="py-3 px-3">UF</th>
                        <th className="py-3 px-3">Estado</th>
                        <th className="py-3 px-3">Região</th>
                        <th className="py-3 px-3 text-right">Alíquota Interna</th>
                        <th className="py-3 px-3 text-right">Líquida (Conv. 106/96)</th>
                        <th className="py-3 px-3 text-right">Interestadual (S/SE)</th>
                        <th className="py-3 px-3 text-right">Interestadual (N/NE/CO/ES)</th>
                        <th className="py-3 px-3">Subcontratação (RICMS)</th>
                        <th className="py-3 px-3 text-center">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 bg-[#0F172A]">
                      {statesList
                        .filter(st => {
                          const matchesSearch = st.uf.toLowerCase().includes(transportUfSearch.toLowerCase()) || 
                                                st.name.toLowerCase().includes(transportUfSearch.toLowerCase());
                          const matchesRegion = transportRegionFilter === 'todos' || st.region === transportRegionFilter;
                          return matchesSearch && matchesRegion;
                        })
                        .map(st => {
                          const isCurrentCompanyUf = st.uf === (company.uf || 'SP');
                          const isSelected = st.uf === selectedTransportUf;

                          return (
                            <tr 
                              key={st.uf} 
                              className={`transition ${
                                isSelected 
                                  ? 'bg-blue-950/40 border-l-2 border-blue-500' 
                                  : 'hover:bg-slate-800/50'
                              }`}
                            >
                              <td className="py-2.5 px-3">
                                <span className={`px-2 py-0.5 rounded font-bold ${
                                  isCurrentCompanyUf 
                                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800' 
                                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                                }`}>
                                  {st.uf}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-sans font-medium text-slate-200">
                                {st.name}
                                {isCurrentCompanyUf && (
                                  <span className="text-[10px] text-emerald-400 ml-1.5 font-mono font-bold">(Sede)</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-slate-400">{st.region}</td>
                              <td className="py-2.5 px-3 text-right font-bold text-blue-400">
                                {st.standardRate}%
                              </td>
                              <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                                {st.presumedCreditRateNet}%
                              </td>
                              <td className="py-2.5 px-3 text-right text-slate-300">
                                {st.interstateSouthSoutheast}%
                              </td>
                              <td className="py-2.5 px-3 text-right text-slate-300">
                                {st.interstateNorthNortheastCenterEast}%
                              </td>
                              <td className="py-2.5 px-3 text-[10px] text-slate-400 max-w-xs truncate" title={st.subcontratacaoRule}>
                                {st.subcontratacaoRule}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <button
                                  onClick={() => {
                                    setSelectedTransportUf(st.uf);
                                    setTransportViewMode('simulador');
                                  }}
                                  className="px-2 py-1 rounded bg-blue-950/80 hover:bg-blue-600 text-blue-400 hover:text-white text-[10px] font-bold transition border border-blue-800 hover:border-blue-600 cursor-pointer"
                                >
                                  Simular Rota
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-ABA: AUDITORIA ESPECIAL DE CPP & FOLHA DE PAGAMENTO */}
      {activeSubTab === 'auditoria_cpp' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Header e Parecer Previdenciário */}
          <div className="bg-[#0F172A] p-5 sm:p-6 rounded-2xl border border-indigo-900/40 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-indigo-950/60 border border-indigo-800/60 text-indigo-400 rounded-xl">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/60">
                      Auditoria Previdenciária Patronal (CPP)
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">Lei 8.212/91 & LC 123/06</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100 tracking-tight mt-0.5">
                    Impacto Previdenciário da Folha de Empregados vs Pró-Labore nos Regimes Tributários
                  </h3>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setReportModalType('regimes');
                    setIsReportModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Imprimir Dossiê CPP</span>
                </button>
              </div>
            </div>

            {/* Diagnóstico Estratégico em Destaque */}
            <div className="p-4 bg-indigo-950/30 border-l-4 border-indigo-500 rounded-r-xl text-xs text-indigo-200 space-y-2 border border-indigo-900/30 border-l-indigo-500">
              <strong className="block text-indigo-300 font-bold uppercase tracking-wider text-[11px] flex items-center space-x-2">
                <Info className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Parecer Técnico do Auditor Previdenciário</span>
              </strong>
              <p className="leading-relaxed text-indigo-200/90">
                {calculation.payrollCppAudit?.cppStrategicDiagnosis || 'Estrutura de folha configurada para auditoria patronal.'}
              </p>
            </div>

            {/* Grid dos 4 Indicadores Estratégicos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1 font-mono text-xs">
              
              {/* 1. Empregados CLT */}
              <div className="p-4 bg-[#0B0F19] rounded-xl border border-slate-800 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-blue-400 block font-sans">
                  Folha Empregados (CLT)
                </span>
                <strong className="text-lg text-slate-100 block">
                  {formatCurrencyBRL(calculation.payrollCppAudit?.employeesPayrollMonthly || 0)}/mês
                </strong>
                <span className="text-[11px] text-slate-400 block">
                  Anual: {formatCurrencyBRL(calculation.payrollCppAudit?.employeesPayrollAnnual || 0)}
                </span>
                <div className="pt-2 border-t border-slate-800 text-[10px] space-y-0.5">
                  <div className="flex justify-between text-slate-400">
                    <span>INSS Patronal:</span>
                    <span className="text-slate-200 font-bold">20,0%</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>RAT / FAP:</span>
                    <span className="text-slate-200 font-bold">{((calculation.payrollCppAudit?.ratRate || 0.03) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Outras Entidades (S):</span>
                    <span className="text-slate-200 font-bold">{((calculation.payrollCppAudit?.terceirosRate || 0.058) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-rose-400 font-bold pt-1 border-t border-slate-800">
                    <span>Total Presumido/Real:</span>
                    <span>{(((0.20 + (calculation.payrollCppAudit?.ratRate || 0.03) + (calculation.payrollCppAudit?.terceirosRate || 0.058))) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* 2. Pró-Labore Sócios */}
              <div className="p-4 bg-[#0B0F19] rounded-xl border border-slate-800 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-purple-400 block font-sans">
                  Pró-Labore de Sócios
                </span>
                <strong className="text-lg text-slate-100 block">
                  {formatCurrencyBRL(calculation.payrollCppAudit?.proLaboreMonthly || 0)}/mês
                </strong>
                <span className="text-[11px] text-slate-400 block">
                  Anual: {formatCurrencyBRL(calculation.payrollCppAudit?.proLaboreAnnual || 0)}
                </span>
                <div className="pt-2 border-t border-slate-800 text-[10px] space-y-0.5">
                  <div className="flex justify-between text-slate-400">
                    <span>CPP Patronal:</span>
                    <span className="text-purple-400 font-bold">20,00% Fixo</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>RAT / FAP:</span>
                    <span className="text-emerald-400 font-semibold">ISENTO (R$ 0)</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Sistema S:</span>
                    <span className="text-emerald-400 font-semibold">ISENTO (R$ 0)</span>
                  </div>
                  <div className="text-[9px] text-slate-500 pt-1 border-t border-slate-800">
                    Base legal: Art. 22, III da Lei 8.212/91
                  </div>
                </div>
              </div>

              {/* 3. Fator R & Enquadramento Simples */}
              <div className="p-4 bg-[#0B0F19] rounded-xl border border-slate-800 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-amber-400 block font-sans">
                  Fator R (Folha 12m / RBT12)
                </span>
                <strong className={`text-lg block ${calculation.fatorR >= 28 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {formatPercentBR(calculation.fatorR)}
                </strong>
                <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold uppercase inline-block border ${
                  calculation.fatorR >= 28
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                    : 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                }`}>
                  {calculation.fatorR >= 28 ? 'Enquadrado no Anexo III (6,0%)' : 'Enquadrado no Anexo V (15,5%)'}
                </span>
                <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                  {calculation.fatorR < 28 && calculation.fatorRAdditionalPayrollNeeded && calculation.fatorRAdditionalPayrollNeeded > 0 ? (
                    <span className="text-amber-300 font-medium">
                      Necessário +{formatCurrencyBRL(calculation.fatorRAdditionalPayrollNeeded)} em pró-labore/ano para atingir 28%.
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-medium">
                      ✓ Fator R plenamente atendido com a estrutura atual de folha.
                    </span>
                  )}
                </div>
              </div>

              {/* 4. Economia Patronal Líquida no Simples */}
              <div className="p-4 bg-emerald-950/20 rounded-xl border border-emerald-800/40 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-emerald-300 block font-sans">
                  Economia Patronal Simples
                </span>
                <strong className="text-xl text-emerald-400 block">
                  +{formatCurrencyBRL(calculation.payrollCppAudit?.cppDeltaPresumidoVsSimplesAnnual || 0)}/ano
                </strong>
                <span className="text-[11px] text-emerald-400/80 block">
                  +{formatCurrencyBRL((calculation.payrollCppAudit?.cppDeltaPresumidoVsSimplesAnnual || 0) / 12)}/mês
                </span>
                <div className="pt-2 border-t border-emerald-800/40 text-[10px] text-slate-400 font-sans">
                  Encargos patronais de 28,8% (CLT) e 20% (pró-labore) inteiramente dispensados do recolhimento externo pelo DAS.
                </div>
              </div>

            </div>

          </div>

          {/* Quadro Comparativo de Tratamento da CPP nos 4 Regimes */}
          <div className="bg-[#0F172A] rounded-2xl border border-slate-800 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center space-x-2">
                  <Scale className="w-4 h-4 text-indigo-400" />
                  <span>Matriz Comparativa de Tratamento da CPP entre os Regimes</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Demonstração exata de como a presença ou ausência de folha/pró-labore desbalanceia a competitividade fiscal de cada regime
                </p>
              </div>
            </div>

            <div className="">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-[#0B0F19] border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">Regime Tributário</th>
                    <th className="py-3 px-3">Base Legal CPP</th>
                    <th className="py-3 px-3 text-center">Patronal CLT</th>
                    <th className="py-3 px-3 text-center">Patronal Pró-Labore</th>
                    <th className="py-3 px-3">Forma de Recolhimento</th>
                    <th className="py-3 px-3 text-right">Custo Mensal</th>
                    <th className="py-3 px-3 text-right">Custo Anual</th>
                    <th className="py-3 px-4">Impacto no Planejamento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-[#0F172A]">
                  
                  {/* Simples Padrão */}
                  <tr className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-sans font-bold text-slate-100 flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      <span>Simples Nacional (Anexos I, II, III e V)</span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-400">LC 123/06 Art. 13, VI</td>
                    <td className="py-3.5 px-3 text-center text-emerald-400 font-bold">0,00% (Incluso)</td>
                    <td className="py-3.5 px-3 text-center text-emerald-400 font-bold">0,00% (Incluso)</td>
                    <td className="py-3.5 px-3 text-slate-400 font-sans">100% embutida no DAS único</td>
                    <td className="py-3.5 px-3 text-right font-bold text-emerald-400">R$ 0,00 por fora</td>
                    <td className="py-3.5 px-3 text-right font-bold text-emerald-400">R$ 0,00 por fora</td>
                    <td className="py-3.5 px-4 text-[11px] text-emerald-300 font-sans">
                      Máxima economia previdenciária. Quanto maior a folha, mais vantajoso se torna o Simples frente ao Lucro Presumido.
                    </td>
                  </tr>

                  {/* Simples Anexo IV */}
                  <tr className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-sans font-bold text-slate-100 flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                      <span>Simples Nacional (Anexo IV - Exceção)</span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-400">LC 123/06 Art. 18, § 5º-C</td>
                    <td className="py-3.5 px-3 text-center text-rose-400 font-bold">20,0% + RAT</td>
                    <td className="py-3.5 px-3 text-center text-purple-400 font-bold">20,0% Fixo</td>
                    <td className="py-3.5 px-3 text-slate-400 font-sans">GPS / DCTFWeb fora do DAS</td>
                    <td className="py-3.5 px-3 text-right font-bold text-rose-400">
                      {formatCurrencyBRL((calculation.payrollCppAudit?.employeesPayrollMonthly || 0) * (0.20 + (calculation.payrollCppAudit?.ratRate || 0.03)) + (calculation.payrollCppAudit?.proLaboreMonthly || 0) * 0.20)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-rose-400">
                      {formatCurrencyBRL(((calculation.payrollCppAudit?.employeesPayrollMonthly || 0) * (0.20 + (calculation.payrollCppAudit?.ratRate || 0.03)) + (calculation.payrollCppAudit?.proLaboreMonthly || 0) * 0.20) * 12)}
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-400 font-sans">
                      No Anexo IV (advocacia, vigilância, limpeza, construção), a CPP NÃO está inclusa no DAS, perdendo essa vantagem frente ao Presumido.
                    </td>
                  </tr>

                  {/* Lucro Presumido */}
                  <tr className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-sans font-bold text-slate-100 flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>Lucro Presumido</span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-400">Lei 8.212/91 Art. 22</td>
                    <td className="py-3.5 px-3 text-center text-rose-400 font-bold">28,80%</td>
                    <td className="py-3.5 px-3 text-center text-purple-400 font-bold">20,00%</td>
                    <td className="py-3.5 px-3 text-slate-400 font-sans">DARF Previdenciário (DCTFWeb)</td>
                    <td className="py-3.5 px-3 text-right font-bold text-rose-400">
                      {formatCurrencyBRL(calculation.payrollCppAudit?.presumedCppTotalMonthly || 0)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-rose-400">
                      {formatCurrencyBRL(calculation.payrollCppAudit?.presumedCppTotalAnnual || 0)}
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-rose-300 font-sans">
                      Pesada sobrecarga previdenciária. Se a empresa possuir folha expressiva, o custo patronal de 28,8% inviabiliza o Lucro Presumido.
                    </td>
                  </tr>

                  {/* Lucro Real */}
                  <tr className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-sans font-bold text-slate-100 flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      <span>Lucro Real</span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-400">RIR/2018 & Lei 8.212/91</td>
                    <td className="py-3.5 px-3 text-center text-rose-400 font-bold">28,80%</td>
                    <td className="py-3.5 px-3 text-center text-purple-400 font-bold">20,00%</td>
                    <td className="py-3.5 px-3 text-slate-400 font-sans">DARF Previdenciário (DCTFWeb)</td>
                    <td className="py-3.5 px-3 text-right font-bold text-slate-300">
                      {formatCurrencyBRL(calculation.payrollCppAudit?.realCppTotalMonthly || 0)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-slate-300">
                      {formatCurrencyBRL(calculation.payrollCppAudit?.realCppTotalAnnual || 0)}
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-blue-300 font-sans">
                      Apesar do encargo de 28,8%, a folha e os encargos patronais são 100% dedutíveis no LALUR, gerando crédito fiscal de 34% (IRPJ/CSLL).
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>

            {/* Dica Prática de Otimização Contábil */}
            <div className="p-4 bg-amber-950/20 border-t border-slate-800 text-xs text-slate-300 flex items-start space-x-3">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Orientações de Planejamento Previdenciário:</strong> Para empresas de serviços de tecnologia, consultoria, engenharia ou saúde (sujeitas ao Fator R), a distribuição estratégica de <strong>Pró-labore de sócios com remuneração até atingir o Fator R de 28%</strong> permite recolher o Simples pelo <strong>Anexo III (alíquota inicial de 6%)</strong> em vez do <strong>Anexo V (alíquota de 15,5%)</strong>, gerando economia fiscal que supera em muito o encargo de INSS da pessoa física.
              </p>
            </div>

          </div>

        </div>
      )}
      {activeSubTab === 'vantagens' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {calculation.regimesComparison.map((item) => (
            <div 
              key={item.regime}
              className="bg-[#0F172A] p-5 rounded-xl border border-slate-800 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div>
                    <h4 className="text-base font-bold text-slate-100 font-sans">{item.name}</h4>
                    <span className="text-xs text-slate-400 font-mono">
                      Carga Efetiva: {formatPercentBR(item.effectiveRatePercent)} // {formatCurrencyBRL(item.annualTaxTotal)}/ano
                    </span>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase font-mono border ${
                    item.isRecommended ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800' : 'bg-slate-800/80 text-slate-400 border-slate-700'
                  }`}>
                    Score: {item.recommendationScore}
                  </span>
                </div>

                {/* Vantagens */}
                <div className="space-y-2 mb-4">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Vantagens & Pontos Fortes</span>
                  </span>
                  <ul className="space-y-1.5">
                    {item.advantages.map((adv, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start space-x-2 bg-emerald-950/20 p-2 rounded-lg border border-emerald-900/40">
                        <span className="text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
                        <span>{adv}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Desvantagens */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <XCircle className="w-4 h-4" />
                    <span>Desvantagens & Riscos</span>
                  </span>
                  <ul className="space-y-1.5">
                    {item.disadvantages.map((dis, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start space-x-2 bg-rose-950/20 p-2 rounded-lg border border-rose-900/40">
                        <span className="text-rose-400 font-bold shrink-0 mt-0.5">•</span>
                        <span>{dis}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Footer info */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Risco Fiscal: <strong className="text-slate-200 capitalize">{item.legalRiskLevel}</strong></span>
                <span>Obrigações Acessórias: <strong className="text-slate-200 capitalize">{item.complianceComplexity.replace('_', ' ')}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUB-ABA 3: DRE FISCAL PROJETADA */}
      {activeSubTab === 'dre' && (
        <div className="bg-[#0F172A] rounded-xl border border-slate-800 overflow-hidden shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100 flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-400" />
                <span>Demonstrativo do Resultado do Exercício (DRE Fiscal Projetada)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Projeção anual de receitas, tributos, custos de insumos, folha e sobra líquida disponível aos sócios.
              </p>
            </div>
            <button
              onClick={() => {
                setReportModalType('regimes');
                setIsReportModalOpen(true);
              }}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-xs transition self-start sm:self-auto cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Gerar Relatório DRE & Regimes</span>
            </button>
          </div>

          <div className="">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-[#0B0F19] border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Linha da DRE Fiscal</th>
                  {calculation.regimesComparison.map(r => (
                    <th key={r.regime} className="py-3 px-3 text-right">
                      {r.shortName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr>
                  <td className="py-2.5 px-4 font-bold text-slate-100 font-sans">(+) Receita Bruta Anual</td>
                  {calculation.regimesComparison.map(r => (
                    <td key={r.regime} className="py-2.5 px-3 text-right font-bold text-slate-100">
                      {formatCurrencyBRL(r.dre.grossRevenue)}
                    </td>
                  ))}
                </tr>
                <tr className="text-rose-400">
                  <td className="py-2.5 px-4 font-sans">(-) Tributos & Deduções Fiscais</td>
                  {calculation.regimesComparison.map(r => (
                    <td key={r.regime} className="py-2.5 px-3 text-right font-bold">
                      - {formatCurrencyBRL(r.dre.taxDeductions)}
                    </td>
                  ))}
                </tr>
                <tr className="bg-blue-950/30 font-bold">
                  <td className="py-2.5 px-4 text-blue-300 font-sans">(=) Receita Líquida</td>
                  {calculation.regimesComparison.map(r => (
                    <td key={r.regime} className="py-2.5 px-3 text-right text-blue-300">
                      {formatCurrencyBRL(r.dre.netRevenue)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-sans">(-) Custos de Insumos / Mercadorias / CPV</td>
                  {calculation.regimesComparison.map(r => (
                    <td key={r.regime} className="py-2.5 px-3 text-right">
                      - {formatCurrencyBRL(r.dre.costOfGoodsOrServices)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-sans">(-) Folha de Pagamento & Encargos</td>
                  {calculation.regimesComparison.map(r => (
                    <td key={r.regime} className="py-2.5 px-3 text-right">
                      - {formatCurrencyBRL(r.dre.payrollAndCharges)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-sans">(-) Despesas Administrativas / Operacionais</td>
                  {calculation.regimesComparison.map(r => (
                    <td key={r.regime} className="py-2.5 px-3 text-right">
                      - {formatCurrencyBRL(r.dre.operationalExpenses)}
                    </td>
                  ))}
                </tr>
                <tr className="bg-emerald-950/30 border-t-2 border-emerald-700/60 text-emerald-300 font-extrabold text-sm">
                  <td className="py-3 px-4 font-sans">(=) LUCRO LÍQUIDO FINAL DISPONÍVEL</td>
                  {calculation.regimesComparison.map(r => (
                    <td key={r.regime} className="py-3 px-3 text-right">
                      {formatCurrencyBRL(r.dre.netProfitFinal)}
                      <span className="block text-[10px] font-normal text-emerald-400">
                        Margem: {formatPercentBR(r.dre.netProfitMarginPercent)}
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Nota Técnica de Auditoria sobre Divergência de Lucro Líquido */}
          <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-800/40 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start space-x-3">
                <div className="p-2.5 rounded-xl bg-amber-950/60 text-amber-400 border border-amber-800/60 shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 font-bold border border-amber-800/60">
                      Nota Técnica de Auditoria
                    </span>
                    <span className="text-xs text-slate-400 font-mono">DRE Contábil vs. Decisão Estratégica Real</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100">
                    Por que o Simples pode apresentar maior Lucro Líquido nesta DRE, mas outro regime ser o recomendado?
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-4xl">
                    O Lucro Líquido contábil isolado de uma DRE interna parte da premissa estática de que a empresa manterá o mesmo faturamento independente do regime tributário. Na realidade comercial e fiscal:
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDecisionExplanationModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs shrink-0 flex items-center space-x-1.5 cursor-pointer self-start lg:self-center"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Ver Metodologia Completa</span>
              </button>
            </div>

            {/* 4 Motivos Fundamentais em Detalhe */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1 text-xs">
              <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 shadow-2xs space-y-2">
                <div className="flex items-center space-x-2 text-blue-400 font-bold">
                  <span className="w-5 h-5 rounded-full bg-blue-950/60 text-blue-400 border border-blue-800/60 flex items-center justify-center text-[10px]">1</span>
                  <span>Competitividade Comercial & Créditos PJ (Vendas B2B)</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  <strong>No Simples Nacional:</strong> A empresa gera crédito irrisório aos clientes PJ (entre 1,5% e 4,5% de ICMS/ISS). No regime não-cumulativo, os clientes deixam de se creditar de 9,25% de PIS/COFINS e perderão 26,5% de IBS/CBS na Reforma Tributária (EC 132/23). Clientes corporativos passam a exigir descontos equivalentes no preço ou compram de concorrentes do regime normal, erodindo a margem teórica da DRE.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 shadow-2xs space-y-2">
                <div className="flex items-center space-x-2 text-amber-400 font-bold">
                  <span className="w-5 h-5 rounded-full bg-amber-950/60 text-amber-400 border border-amber-800/60 flex items-center justify-center text-[10px]">2</span>
                  <span>Efeito do Sublimite Estadual (R$ 3,6M) & Risco de Desenquadramento</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Ultrapassando R$ 3,6M (LC 123/06, arts. 13-A e 19), o ICMS/ISS é expulso do DAS. A empresa cai no <em>&quot;pior dos dois mundos&quot;</em>: paga federais nas faixas mais altas do Simples, apura ICMS/ISS no regime normal (débito/crédito com SPED) e fica a um passo da exclusão retroativa ao teto de R$ 4,8M. Nessas faixas, o Presumido ou Real traz muito mais segurança jurídica.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 shadow-2xs space-y-2">
                <div className="flex items-center space-x-2 text-purple-400 font-bold">
                  <span className="w-5 h-5 rounded-full bg-purple-950/60 text-purple-400 border border-purple-800/60 flex items-center justify-center text-[10px]">3</span>
                  <span>Impacto da Folha de Pagamento e Encargos Patronais (CPP 28,8%)</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  No Simples (Anexos I, II, III e V), a CPP está inclusa na guia DAS. No Lucro Presumido e Real há incidência de 28,8% de INSS patronal sobre folha e pró-labore. Isso eleva as despesas na DRE contábil, mas o algoritmo pondera se essa folha compensa os demais créditos fiscais e a margem de lucro real da atividade.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 shadow-2xs space-y-2">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                  <span className="w-5 h-5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 flex items-center justify-center text-[10px]">4</span>
                  <span>Como Funciona o &quot;Score de Recomendação&quot; (0 a 100)</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  A recomendação calcula nota ponderada em 3 pilares: <strong>1. Eficiência Econômica (40%)</strong>: imposto nominal x efetivo e custos; <strong>2. Segurança Jurídica (30%)</strong>: riscos de sublimite e sócios (art. 3º, § 4º LC 123/06); <strong>3. Alinhamento com a Reforma (30%)</strong>: percentual de vendas B2B vs B2C e perda frente ao IBS/CBS.
                </p>
              </div>
            </div>

            {/* Resumo Prático para Tomada de Decisão */}
            <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-slate-100 font-bold block flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Resumo Prático para sua Tomada de Decisão:</span>
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed max-w-3xl">
                  Se a empresa vende predominantemente para o <strong>consumidor final (B2C)</strong> e está com folha alta abaixo de R$ 3,6M, o Simples é a melhor opção real. Se vende para <strong>empresas (B2B)</strong> ou fatura perto/acima de R$ 3,6M, o lucro superior na folha do Simples é uma ilusão contábil que mascara perda de competitividade e risco de autuação.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDecisionExplanationModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 border border-blue-800/60 font-bold text-xs shrink-0 cursor-pointer transition flex items-center space-x-1.5"
              >
                <span>Dossiê & Simulação B2B</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-ABA 5: AUDITORIA DO SUBLIMITE & ICMS/ISS FORA DO DAS */}
      {activeSubTab === 'sublimite' && (
        <div className="space-y-6">
          
          {/* Header Card do Sublimite */}
          <div className="bg-[#0F172A] p-6 rounded-xl border border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-amber-950/60 text-amber-400 border border-amber-800/60 rounded-xl">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100 uppercase tracking-wider">
                    Auditoria & Regras do Sublimite Estadual (LC 123/2006 Art. 13-A e 19)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Tratamento tributário quando a empresa atinge a faixa de transição entre R$ 3.600.000,00 e R$ 4.800.000,00.
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-mono text-slate-400 block">Sublimite Nacional Vigente</span>
                <span className="text-lg font-mono font-bold text-amber-400">{formatCurrencyBRL(STATE_SUBLIMIT)}</span>
              </div>
            </div>

            {/* Diagnostic Alert Box */}
            <div className={`p-4 rounded-xl border ${
              calculation.exceedsSublimit 
                ? 'bg-amber-950/30 border-amber-800/60 text-amber-200' 
                : 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
            }`}>
              <div className="flex items-start space-x-3">
                {calculation.exceedsSublimit ? (
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="text-sm font-bold">
                    {calculation.exceedsSublimit 
                      ? 'SUBLIMITE ESTADUAL ULTRAPASSADO: ICMS e ISS Expurgados do Simples Nacional' 
                      : 'EMPRESA DENTRO DO SUBLIMITE: ICMS e ISS Recolhidos Integralmente no DAS'}
                  </h4>
                  <p className="text-xs mt-1 text-slate-300">
                    {calculation.sublimitTaxSegregationNote}
                  </p>
                </div>
              </div>
            </div>

            {/* Cards de Métricas do Sublimite */}
            {calculation.sublimitExclusionDetails && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">RBT12 / RBA da Empresa</span>
                  <span className="text-xl font-mono font-bold text-slate-100 mt-1 block">
                    {formatCurrencyBRL(calculation.sublimitExclusionDetails.effectiveRbt12)}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Sublimite Estadual: {formatCurrencyBRL(STATE_SUBLIMIT)}
                  </span>
                </div>

                <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Excesso sobre o Sublimite</span>
                  <span className={`text-xl font-mono font-bold mt-1 block ${
                    calculation.sublimitExclusionDetails.isExceeded ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {calculation.sublimitExclusionDetails.isExceeded 
                      ? `+${formatCurrencyBRL(calculation.sublimitExclusionDetails.excessAmount)}`
                      : 'R$ 0,00'}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {calculation.sublimitExclusionDetails.isExceeded 
                      ? `${formatPercentBR(calculation.sublimitExclusionDetails.excessPercent)} acima do teto estadual`
                      : 'Margem disponível: ' + formatCurrencyBRL(STATE_SUBLIMIT - calculation.sublimitExclusionDetails.effectiveRbt12)}
                  </span>
                </div>

                <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Regra de Vigência da Exclusão</span>
                  <span className="text-sm font-bold text-blue-400 mt-1 block">
                    {calculation.sublimitExclusionDetails.effectiveExclusionDateRule === 'immediate_next_month'
                      ? 'Mês Subsequente ao Excesso'
                      : calculation.sublimitExclusionDetails.effectiveExclusionDateRule === 'next_calendar_year'
                      ? '1º de Janeiro do Próximo Ano'
                      : 'Não Aplicável (Regular)'}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {calculation.sublimitExclusionDetails.excessPercent > 20
                      ? 'Excesso > 20% do sublimite (> R$ 4,32M)'
                      : 'Excesso até 20% (Art. 19 e 31 LC 123/06)'}
                  </span>
                </div>

                <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Impacto Financeiro Adicional</span>
                  <span className="text-xl font-mono font-bold text-rose-400 mt-1 block">
                    +{formatCurrencyBRL(calculation.sublimitExclusionDetails.monthlyAdditionalCostVsSimples)}/mês
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    +{formatCurrencyBRL(calculation.sublimitExclusionDetails.annualAdditionalCostVsSimples)} ao ano
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Memória Detalhada da Segregação de Guias */}
          {calculation.sublimitExclusionDetails && calculation.sublimitExclusionDetails.isExceeded && (
            <div className="bg-[#0F172A] p-6 rounded-xl border border-slate-800 shadow-xs space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-100 flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-400" />
                <span>Memória de Cálculo da Nova Estrutura de Recolhimento (Guias Separadas)</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                
                {/* Guia DAS Federal */}
                <div className="bg-[#0B0F19] p-4 rounded-xl border border-blue-900/40 space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="font-bold text-blue-400 uppercase text-[11px]">1. Guia DAS Federal</span>
                    <span className="text-[9px] bg-blue-950/60 text-blue-300 px-2 py-0.5 rounded font-bold border border-blue-800/60">PGDAS-D</span>
                  </div>
                  <p className="text-[11px] font-sans text-slate-300">
                    Contém apenas tributos da União: <strong>IRPJ, CSLL, PIS, COFINS e CPP</strong> (com alíquota expurgada de ICMS/ISS conforme Resolução CGSN 140/2018).
                  </p>
                  <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Alíquota Federal Efetiva:</span>
                      <span className="text-slate-100 font-bold">{formatPercentBR(calculation.sublimitExclusionDetails.effectiveSimplesRateWithoutIcmsIss)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Valor Mensal do DAS Federal:</span>
                      <span className="text-blue-400 font-bold">{formatCurrencyBRL(calculation.sublimitExclusionDetails.monthlyFederalDASTax)}</span>
                    </div>
                  </div>
                </div>

                {/* Guia ICMS Estadual */}
                <div className="bg-[#0B0F19] p-4 rounded-xl border border-emerald-900/40 space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="font-bold text-emerald-400 uppercase text-[11px]">2. ICMS Normal (Estado - {company.uf || 'SP'})</span>
                    <span className="text-[9px] bg-emerald-950/60 text-emerald-300 px-2 py-0.5 rounded font-bold border border-emerald-800/60">DARE / GNRE</span>
                  </div>
                  <p className="text-[11px] font-sans text-slate-300">
                    Apuração em débito e crédito no regime normal do Estado ({company.uf || 'SP'}). Permite abatimento dos créditos de ICMS das compras de insumos/mercadorias ({company.inputCostsPercent || 40}% da receita).
                  </p>
                  <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Alíquota ICMS UF ({company.uf || 'SP'}):</span>
                      <span className="text-slate-100 font-bold">{getStandardIcmsRateForUF(company.uf)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">ICMS Líquido Mensal a Pagar:</span>
                      <span className="text-emerald-400 font-bold">{formatCurrencyBRL(calculation.sublimitExclusionDetails.monthlyOutsideICMS)}</span>
                    </div>
                  </div>
                </div>

                {/* Guia ISS Municipal */}
                <div className="bg-[#0B0F19] p-4 rounded-xl border border-cyan-900/40 space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="font-bold text-cyan-400 uppercase text-[11px]">3. ISS Municipal (Prefeitura)</span>
                    <span className="text-[9px] bg-cyan-950/60 text-cyan-300 px-2 py-0.5 rounded font-bold border border-cyan-800/60">DAM / DUAM</span>
                  </div>
                  <p className="text-[11px] font-sans text-slate-300">
                    Recolhimento direto para a Prefeitura de {company.city || 'local da empresa'} via guia municipal, aplicando a alíquota da legislação municipal (LC 116/2003).
                  </p>
                  <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Alíquota ISS do Município:</span>
                      <span className="text-slate-100 font-bold">{getStandardIssRateForCity(company.uf, company.city)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">ISS Mensal Fora do DAS:</span>
                      <span className="text-cyan-400 font-bold">{formatCurrencyBRL(calculation.sublimitExclusionDetails.monthlyOutsideISS)}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Total Consolidado */}
              <div className="p-4 bg-[#0B0F19] rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
                <div>
                  <span className="text-slate-400 block">Total Mensal Combinado (DAS Federal + ICMS + ISS por fora):</span>
                  <strong className="text-lg text-slate-100">
                    {formatCurrencyBRL(calculation.sublimitExclusionDetails.monthlyTotalTaxWithSublimitExclusion)}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Alíquota Efetiva Global:</span>
                  <strong className="text-lg text-amber-400">
                    {formatPercentBR(calculation.sublimitExclusionDetails.effectiveGlobalRateWithSublimitExclusion)}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Custo Total Anual com Sublimite:</span>
                  <strong className="text-lg text-rose-400">
                    {formatCurrencyBRL(calculation.sublimitExclusionDetails.annualTotalTaxWithSublimitExclusion)}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* Obrigações Acessórias Decorrentes da Ultrapassagem do Sublimite */}
          {calculation.sublimitExclusionDetails && (
            <div className="bg-[#0F172A] p-6 rounded-xl border border-slate-800 shadow-xs space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-100 flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <span>Obrigações Acessórias e Exigências Legais Decorrentes da Exclusão do Sublimite</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {calculation.sublimitExclusionDetails.ancillaryObligationsGenerated.map((obrigacao, index) => (
                  <div key={index} className="p-3 bg-[#0B0F19] border border-slate-800 rounded-lg text-xs text-slate-300 flex items-start space-x-2.5">
                    <span className="p-1 bg-amber-950/60 text-amber-400 border border-amber-800/60 rounded shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                    <span>{obrigacao}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* SUB-ABA 4: RELATÓRIO DE IMPACTOS */}
      {activeSubTab === 'impactos' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Economia Tributária */}
            <div className="bg-[#0F172A] p-5 rounded-xl border border-slate-800 shadow-xs">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Impacto Financeiro Anual</span>
              <span className="text-2xl font-mono font-bold text-emerald-400 block">
                {formatCurrencyBRL(
                  Math.max(
                    0,
                    calculation.regimesComparison.find(r => r.regime === 'simples_padrao')!.annualTaxTotal -
                    calculation.bestRegime.annualTaxTotal
                  )
                )}
              </span>
              <p className="text-xs text-slate-400 mt-2">
                Economia anual máxima caso a empresa adote a estratégia do regime <strong className="text-slate-200">{calculation.bestRegime.name}</strong>.
              </p>
            </div>

            {/* Impacto Comercial B2B */}
            <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 shadow-xs">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Impacto de Créditos B2B</span>
              <span className="text-2xl font-mono font-bold text-blue-400 block">
                {formatPercentBR(calculation.bestRegime.b2bCreditRatePercent)}
              </span>
              <p className="text-xs text-slate-400 mt-2">
                Alíquota de crédito de IBS/CBS repassada aos clientes PJ na Reforma Tributária, garantindo competitividade comercial.
              </p>
            </div>

            {/* Sublimite & Teto Federal */}
            <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 shadow-xs">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Status de Conformidade</span>
              <span className={`text-base font-bold font-sans block ${
                calculation.exceedsFederalLimit ? 'text-rose-400' : calculation.exceedsSublimit ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {calculation.exceedsFederalLimit 
                  ? 'Excesso de Teto Federal (R$ 4,8M)' 
                  : calculation.exceedsSublimit 
                  ? 'Sublimite ICMS/ISS Ultrapassado' 
                  : 'Totalmente Regular no Simples'}
              </span>
              <p className="text-xs text-slate-400 mt-2">
                {calculation.sublimitTaxSegregationNote}
              </p>
            </div>

          </div>

          {/* Relatório Técnico de Ações Recomendadas */}
          <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 shadow-xs space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              <span>Roteiro de Implementação Fiscal & Decisões Estratégicas</span>
            </h4>
            <div className="space-y-3 text-xs text-slate-300 font-sans">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-start space-x-3">
                <span className="px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/60 font-mono font-bold">1</span>
                <div>
                  <strong className="text-slate-100">Opção pelo Regime Fiscal Anual:</strong> A opção pelo regime de tributação (Simples Nacional, Lucro Presumido ou Lucro Real) é irretratável para todo o ano-calendário (art. 16 da LC 123/06 e art. 13 da Lei 9.718/98), devendo ser formalizada até o último dia útil de janeiro ou no início das atividades.
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-start space-x-3">
                <span className="px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/60 font-mono font-bold">2</span>
                <div>
                  <strong className="text-slate-100">Segregação Mensal no PGDAS-D:</strong> Declarar rigorosamente as receitas discriminadas por cada Anexo (I, II, III, IV, V), aplicando os abatimentos de Substituição Tributária (ICMS ST), PIS/COFINS Monofásico e imunidade de exportação para evitar bitributação indevida.
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-start space-x-3">
                <span className="px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/60 font-mono font-bold">3</span>
                <div>
                  <strong className="text-slate-100">Acompanhamento do Fator R:</strong> Para atividades intelectuais e de tecnologia dos Anexos III e V, auditar mensalmente a razão Folha de Pagamento / RBT12. Manter o Fator R igual ou superior a 28,00% garante a redução da alíquota inicial de 15,50% (Anexo V) para 6,00% (Anexo III).
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-ABA 5: REGRAS ESTADUAIS DE ICMS NO SIMPLES NACIONAL (PR / RS / BENEFÍCIOS) */}
      {activeSubTab === 'beneficio_icms' && (
        <div className="space-y-6">
          
          {/* Header & Fundamento Legal */}
          <div className="bg-[#0F172A] p-5 rounded-xl border border-[#1E293B] shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#1E293B] pb-4">
              <div className="flex items-start space-x-3">
                <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30 shrink-0 mt-0.5">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-white font-sans">
                      Regras de ICMS Estadual no Simples Nacional (Isenções e Reduções)
                    </h3>
                    <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      LC 123/2006 Art. 19
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-3xl">
                    Com base no Artigo 19 da Lei Complementar Federal nº 123/2006, os Estados possuem autonomia para conceder 
                    <strong> isenção ou redução progressiva da alíquota de ICMS</strong> no Simples Nacional em função de faixas de faturamento (RBT12).
                  </p>
                </div>
              </div>

              {/* Botões de Simulação Rápida de Sede */}
              <div className="flex flex-wrap items-center gap-2 bg-[#0A0C10] p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-400 block w-full mb-0.5">Alterar UF da Sede:</span>
                {['PR', 'RS', 'SP', 'SC', 'MG', 'RJ'].map((ufBtn) => (
                  <button
                    key={ufBtn}
                    type="button"
                    onClick={() => onChangeCompany({ ...company, uf: ufBtn })}
                    className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition ${
                      company.uf === ufBtn
                        ? 'bg-blue-600 text-white shadow'
                        : 'bg-[#1E293B] text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {ufBtn}
                  </button>
                ))}
              </div>
            </div>

            {/* Diagnóstico da Empresa Atual */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 text-xs font-mono">
              <div className="bg-[#0A0C10] p-3 rounded-lg border border-[#1E293B]">
                <span className="text-[10px] uppercase text-slate-400 block">Sede Atual da Empresa</span>
                <span className="text-base font-bold text-white mt-1 block flex items-center space-x-1.5">
                  <MapPin className="w-4 h-4 text-blue-400 inline" />
                  <span>{company.uf || 'PR'} - {BRAZILIAN_STATES_ICMS[company.uf || 'PR']?.name || 'Paraná'}</span>
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {company.uf === 'PR' ? 'Lei nº 15.342/2006' : company.uf === 'RS' ? 'Lei nº 13.036/2008' : 'Regra Padrão Federal'}
                </span>
              </div>

              <div className="bg-[#0A0C10] p-3 rounded-lg border border-[#1E293B]">
                <span className="text-[10px] uppercase text-slate-400 block">RBT12 Acumulada</span>
                <span className="text-base font-bold text-white mt-1 block">
                  {formatCurrencyBRL(calculation.standaloneRbt12)}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {calculation.standaloneRbt12 <= 360000 
                    ? 'Faixa 1 (Isenção Total no PR)' 
                    : calculation.standaloneRbt12 <= STATE_SUBLIMIT 
                    ? 'Dentro do Sublimite (Redução no PR)' 
                    : 'Sublimite Excedido'}
                </span>
              </div>

              <div className="bg-[#0A0C10] p-3 rounded-lg border border-[#1E293B]">
                <span className="text-[10px] uppercase text-slate-400 block">Benefício de Redução no ICMS</span>
                <span className={`text-base font-bold mt-1 block ${
                  calculation.stateSimplesIcmsBenefit?.hasBenefit ? 'text-emerald-400' : 'text-slate-400'
                }`}>
                  {calculation.stateSimplesIcmsBenefit?.hasBenefit 
                    ? `${calculation.stateSimplesIcmsBenefit.reductionPercent}% ${calculation.stateSimplesIcmsBenefit.isExempt ? '(ISENÇÃO 100%)' : 'DE REDUÇÃO'}` 
                    : '0% (Sem redução estadual)'}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {calculation.stateSimplesIcmsBenefit?.appliedBracket || 'Sem enquadramento de benefício'}
                </span>
              </div>

              <div className="bg-[#0A0C10] p-3 rounded-lg border border-[#1E293B]">
                <span className="text-[10px] uppercase text-slate-400 block">Economia Estimada no DAS</span>
                <span className="text-base font-bold text-emerald-400 mt-1 block">
                  {formatCurrencyBRL(calculation.stateSimplesIcmsBenefit?.monthlySavingsEstimated || 0)}/mês
                </span>
                <span className="text-[10px] text-emerald-400/80 mt-0.5 block">
                  {formatCurrencyBRL(calculation.stateSimplesIcmsBenefit?.annualSavingsEstimated || 0)}/ano
                </span>
              </div>
            </div>
          </div>

          {/* Dossiê Oficial do Paraná (Decreto Estadual nº 8.660/2018 e RICMS/PR Anexo XI) */}
          <div className="bg-[#0F172A] p-5 rounded-xl border border-[#1E293B] shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E293B] pb-3">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Dossiê da Redução do ICMS no Paraná (Decreto nº 8.660/2018 e RICMS/PR)</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Regras do Anexo XI do RICMS/PR c/c Lei Estadual nº 15.342/2006 aplicadas diretamente na apuração mensal do PGDAS-D.
                </p>
              </div>
              <span className="px-3 py-1 rounded bg-blue-500/20 text-blue-300 text-xs font-mono font-bold self-start sm:self-center">
                Decreto 8.660/18 • Anexo XI RICMS/PR
              </span>
            </div>

            {/* Os 3 Cenários Oficiais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
              <div className={`p-4 rounded-lg border space-y-2 ${
                calculation.standaloneRbt12 <= 360000 
                  ? 'bg-emerald-950/30 border-emerald-500/50' 
                  : 'bg-[#0A0C10] border-slate-800'
              }`}>
                <span className="text-emerald-400 font-bold text-sm flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Cenário 1: Até R$ 360.000,00</span>
                </span>
                <p>
                  <strong>Isenção Total (100% de desconto)</strong> da parcela de ICMS estadual no DAS para microempresas com RBT12 até R$ 360 mil.
                </p>
                <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/20 text-[11px] font-mono text-emerald-300">
                  PGDAS-D: Marcar &quot;Isenção/Redução de ICMS&quot; e digitar <strong>100%</strong>.
                </div>
              </div>

              <div className={`p-4 rounded-lg border space-y-2 ${
                calculation.standaloneRbt12 > 360000 && calculation.standaloneRbt12 <= STATE_SUBLIMIT
                  ? 'bg-blue-950/30 border-blue-500/50' 
                  : 'bg-[#0A0C10] border-slate-800'
              }`}>
                <span className="text-blue-400 font-bold text-sm flex items-center space-x-1.5">
                  <Percent className="w-4 h-4" />
                  <span>Cenário 2: R$ 360k a R$ 3,6M</span>
                </span>
                <p>
                  <strong>Redução Progressiva Calculada</strong> confrontando a Alíquota Efetiva da LC 123/06 com a Tabela própria do Paraná (Anexo XI).
                </p>
                <div className="p-2 rounded bg-blue-950/40 border border-blue-500/20 text-[11px] font-mono text-blue-300">
                  Fórmula: (1 - (Alíq. PR / Alíq. Fed)) × 100
                </div>
              </div>

              <div className={`p-4 rounded-lg border space-y-2 ${
                calculation.standaloneRbt12 > STATE_SUBLIMIT
                  ? 'bg-amber-950/30 border-amber-500/50' 
                  : 'bg-[#0A0C10] border-slate-800'
              }`}>
                <span className="text-amber-400 font-bold text-sm flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Cenário 3: Acima de R$ 3,6M</span>
                </span>
                <p>
                  <strong>Sublimite Estadual Excedido</strong>. O ICMS não pode ser recolhido pelo Simples no DAS, sendo exigido por fora na SEFA/PR.
                </p>
                <div className="p-2 rounded bg-amber-950/40 border border-amber-500/20 text-[11px] font-mono text-amber-300">
                  Regime Normal (Débito x Crédito) + EFD SPED
                </div>
              </div>
            </div>

            {/* Painel do Cálculo Dinâmico para o PGDAS-D */}
            {calculation.stateSimplesIcmsBenefit?.paranaDetails && (
              <div className="p-4 rounded-xl bg-[#0A0C10] border border-blue-500/30 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <div className="flex items-center space-x-2">
                    <Calculator className="w-5 h-5 text-blue-400" />
                    <h5 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                      Memória de Cálculo da Redução para o PGDAS-D (Empresa Atual)
                    </h5>
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-500/20 text-blue-300">
                    {calculation.stateSimplesIcmsBenefit.paranaDetails.tabelaNome}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                  {/* Passo 1: Alíquota Federal */}
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1.5">
                    <span className="text-slate-400 text-[11px] font-sans block font-bold">1. Alíquota Federal (LC 123/06)</span>
                    <div className="flex justify-between text-slate-300">
                      <span>Alíquota Nominal:</span>
                      <strong className="text-white">{calculation.stateSimplesIcmsBenefit.paranaDetails.aliqNominalFederal.toFixed(2)}%</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Parcela a Deduzir:</span>
                      <strong className="text-white">{formatCurrencyBRL(calculation.stateSimplesIcmsBenefit.paranaDetails.deducaoFederal)}</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Repartição ICMS:</span>
                      <strong className="text-white">{calculation.stateSimplesIcmsBenefit.paranaDetails.reparticaoIcmsFederal.toFixed(2)}%</strong>
                    </div>
                    <div className="flex justify-between text-blue-300 pt-1 border-t border-slate-800">
                      <span>Alíq. Efetiva Federal ICMS:</span>
                      <strong className="text-blue-400">{calculation.stateSimplesIcmsBenefit.paranaDetails.aliqEfetivaFederalIcms.toFixed(4)}%</strong>
                    </div>
                  </div>

                  {/* Passo 2: Alíquota Estadual PR */}
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1.5">
                    <span className="text-slate-400 text-[11px] font-sans block font-bold">2. Alíquota Estadual (Anexo XI RICMS/PR)</span>
                    <div className="flex justify-between text-slate-300">
                      <span>Alíquota Nominal PR:</span>
                      <strong className="text-white">{calculation.stateSimplesIcmsBenefit.paranaDetails.aliqNominalPR.toFixed(4)}%</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Parcela a Deduzir PR:</span>
                      <strong className="text-white">{formatCurrencyBRL(calculation.stateSimplesIcmsBenefit.paranaDetails.deducaoPR)}</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>RBT12 Utilizado:</span>
                      <strong className="text-white">{formatCurrencyBRL(calculation.standaloneRbt12)}</strong>
                    </div>
                    <div className="flex justify-between text-emerald-300 pt-1 border-t border-slate-800">
                      <span>Alíq. Efetiva Estadual PR:</span>
                      <strong className="text-emerald-400">{calculation.stateSimplesIcmsBenefit.paranaDetails.aliqEfetivaPR.toFixed(4)}%</strong>
                    </div>
                  </div>

                  {/* Passo 3: Resultado no PGDAS-D */}
                  <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-500/30 space-y-1.5 flex flex-col justify-between">
                    <div>
                      <span className="text-blue-300 text-[11px] font-sans block font-bold">3. % Redução no PGDAS-D</span>
                      <div className="text-2xl font-bold text-emerald-400 mt-1">
                        {calculation.stateSimplesIcmsBenefit.paranaDetails.reductionPercent.toFixed(2)}%
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Fórmula: (1 - ({calculation.stateSimplesIcmsBenefit.paranaDetails.aliqEfetivaPR.toFixed(4)}% ÷ {calculation.stateSimplesIcmsBenefit.paranaDetails.aliqEfetivaFederalIcms.toFixed(4)}%)) × 100
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-300 pt-1 border-t border-blue-500/20">
                      Economia Estimada: <strong className="text-emerald-400">{formatCurrencyBRL(calculation.stateSimplesIcmsBenefit.annualSavingsEstimated)}/ano</strong>
                    </div>
                  </div>
                </div>

                {/* Instruções PGDAS-D */}
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs flex items-start space-x-2.5">
                  <FileText className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Como Preencher no Sistema PGDAS-D:</span>
                    <p className="text-slate-300 mt-0.5">
                      {calculation.stateSimplesIcmsBenefit.paranaDetails.pgdasInstructions}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tabela Completa Oficial das Faixas do Paraná */}
            <div className="mt-4 pt-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 font-mono flex items-center space-x-1.5">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span>Tabelas I e II do Anexo XI do RICMS/PR (Decreto nº 8.660/2018)</span>
              </h5>

              <div className=" rounded-lg border border-slate-800">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="bg-[#0A0C10] border-b border-slate-800 text-slate-400 text-[11px]">
                      <th className="py-2.5 px-3">Faixa</th>
                      <th className="py-2.5 px-3">Receita Bruta (RBT12)</th>
                      <th className="py-2.5 px-3">Tabela I (Comércio/Transp.)</th>
                      <th className="py-2.5 px-3">Tabela II (Indústria)</th>
                      <th className="py-2.5 px-3 text-center">% Redução PGDAS-D</th>
                      <th className="py-2.5 px-3 text-right">Status para a Empresa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {PARANA_ICMS_SIMPLES_BRACKETS.map((bracket) => {
                      const isCurrentBracket = calculation.standaloneRbt12 >= bracket.rbt12Min && calculation.standaloneRbt12 <= bracket.rbt12Max;
                      const isExempt = bracket.reductionPercentRef === 100;
                      return (
                        <tr 
                          key={bracket.faixa}
                          className={`transition ${
                            isCurrentBracket 
                              ? 'bg-blue-900/30 font-bold text-white border-l-4 border-l-blue-500' 
                              : 'hover:bg-slate-800/20'
                          }`}
                        >
                          <td className="py-2.5 px-3 font-sans">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                              isCurrentBracket ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
                            }`}>
                              {bracket.faixa}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            {formatCurrencyBRL(bracket.rbt12Min)} até {formatCurrencyBRL(bracket.rbt12Max)}
                          </td>
                          <td className="py-2.5 px-3 text-[11px]">
                            {isExempt ? (
                              <span className="text-emerald-400 font-bold">Alíq. 0% (Isento)</span>
                            ) : (
                              <span>Alíq: {bracket.aliqNominalTabI}% | Ded: {formatCurrencyBRL(bracket.deducaoTabI)}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-[11px]">
                            {isExempt ? (
                              <span className="text-emerald-400 font-bold">Alíq. 0% (Isento)</span>
                            ) : (
                              <span>Alíq: {bracket.aliqNominalTabII}% | Ded: {formatCurrencyBRL(bracket.deducaoTabII)}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {isExempt ? (
                              <span className="px-2 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                100% (Isenção Total)
                              </span>
                            ) : isCurrentBracket ? (
                              <span className="px-2 py-0.5 rounded font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                {calculation.stateSimplesIcmsBenefit?.reductionPercent.toFixed(2)}% (Calculado)
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">
                                Dinâmica Decreto 8.660
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {isCurrentBracket ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white animate-pulse">
                                ★ SUA FAIXA ATUAL
                              </span>
                            ) : (
                              <span className="text-slate-500 text-[10px]">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    <tr className={calculation.standaloneRbt12 > STATE_SUBLIMIT ? 'bg-amber-950/40 text-amber-200 font-bold border-l-4 border-l-amber-500' : ''}>
                      <td className="py-2.5 px-3 font-sans">
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-amber-500/20 text-amber-400">
                          Sublimite
                        </span>
                      </td>
                      <td className="py-2.5 px-3">Acima de {formatCurrencyBRL(STATE_SUBLIMIT)} até {formatCurrencyBRL(FEDERAL_LIMIT)}</td>
                      <td colSpan={2} className="py-2.5 px-3 text-slate-300 font-sans text-[11px]">
                        ICMS expurgado do DAS. Recolhimento direto na SEFA/PR em conta gráfica normal (débito x crédito com EFD).
                      </td>
                      <td className="py-2.5 px-3 text-center text-amber-400 font-bold">0% (Por Fora)</td>
                      <td className="py-2.5 px-3 text-right">
                        {calculation.standaloneRbt12 > STATE_SUBLIMIT ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-600 text-white">
                            ★ SUA SITUAÇÃO (SUBLIMITE)
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[10px]">—</span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Comparativo Interestadual: Impacto no Simples Nacional */}
          <div className="bg-[#0F172A] p-5 rounded-xl border border-[#1E293B] shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E293B] pb-3">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-2">
                  <ArrowRightLeft className="w-5 h-5 text-blue-400" />
                  <span>Comparativo Interestadual: O Benefício do Paraná vs Outros Estados</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Veja quanto a empresa paga de ICMS no Simples Nacional em diferentes estados com o mesmo faturamento.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              {/* Paraná */}
              <div className={`p-4 rounded-xl border ${
                company.uf === 'PR' ? 'bg-blue-950/40 border-blue-500' : 'bg-[#0A0C10] border-slate-800'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white text-sm font-sans flex items-center space-x-1.5">
                    <span>🏛️ Paraná (PR)</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-bold">
                    Dec. 8.660/18
                  </span>
                </div>
                <div className="space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tratamento ICMS:</span>
                    <strong className="text-emerald-400">
                      {calculation.standaloneRbt12 <= 360000 
                        ? '100% Isento' 
                        : calculation.standaloneRbt12 > STATE_SUBLIMIT
                          ? '0% (Fora do Simples)'
                          : `${(calculation.stateSimplesIcmsBenefit?.reductionPercent || 0).toFixed(2)}% Redução`}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Economia no DAS:</span>
                    <strong className="text-emerald-400">
                      {formatCurrencyBRL(
                        company.uf === 'PR' 
                          ? (calculation.stateSimplesIcmsBenefit?.annualSavingsEstimated || 0)
                          : (getStateSimplesIcmsBenefit('PR', calculation.standaloneRbt12, (calculation.breakdown.icms || 0) + (calculation.breakdown.icmsReducaoEstadual || 0) + (calculation.breakdown.icmsSegregadoIsencao || 0)).annualSavingsEstimated)
                      )}/ano
                    </strong>
                  </div>
                </div>
                {company.uf !== 'PR' && (
                  <button
                    type="button"
                    onClick={() => onChangeCompany({ ...company, uf: 'PR' })}
                    className="mt-3 w-full py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                  >
                    Simular no Paraná
                  </button>
                )}
              </div>

              {/* São Paulo */}
              <div className={`p-4 rounded-xl border ${
                company.uf === 'SP' ? 'bg-blue-950/40 border-blue-500' : 'bg-[#0A0C10] border-slate-800'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white text-sm font-sans flex items-center space-x-1.5">
                    <span>🏙️ São Paulo (SP)</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">
                    Regra Geral Federal
                  </span>
                </div>
                <div className="space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tratamento ICMS:</span>
                    <strong className="text-amber-400">Integral (Sem Redução)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Desconto Estadual:</span>
                    <strong className="text-slate-400">R$ 0,00</strong>
                  </div>
                </div>
                {company.uf !== 'SP' && (
                  <button
                    type="button"
                    onClick={() => onChangeCompany({ ...company, uf: 'SP' })}
                    className="mt-3 w-full py-1.5 rounded bg-[#1E293B] hover:bg-slate-700 text-white font-bold text-xs transition"
                  >
                    Simular em São Paulo
                  </button>
                )}
              </div>

              {/* Rio Grande do Sul */}
              <div className={`p-4 rounded-xl border ${
                company.uf === 'RS' ? 'bg-blue-950/40 border-blue-500' : 'bg-[#0A0C10] border-slate-800'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white text-sm font-sans flex items-center space-x-1.5">
                    <span>🌾 Rio Grande do Sul (RS)</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-bold">
                    Lei 13.036/2008
                  </span>
                </div>
                <div className="space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tratamento ICMS:</span>
                    <strong className="text-emerald-400">
                      {calculation.standaloneRbt12 <= 360000 ? '100% Isento' : 'Redução Gradual'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Benefício Regional:</span>
                    <strong className="text-emerald-400">Ativo</strong>
                  </div>
                </div>
                {company.uf !== 'RS' && (
                  <button
                    type="button"
                    onClick={() => onChangeCompany({ ...company, uf: 'RS' })}
                    className="mt-3 w-full py-1.5 rounded bg-[#1E293B] hover:bg-slate-700 text-white font-bold text-xs transition"
                  >
                    Simular no RS
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Guia Prático de Preenchimento no e-CAC / PGDAS-D */}
          <div className="bg-[#0F172A] p-5 rounded-xl border border-[#1E293B] shadow-md space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              <span>Instruções para Emissão no PGDAS-D / Portal e-CAC</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
              <div className="p-3 bg-[#0A0C10] border border-[#1E293B] rounded-lg space-y-1">
                <span className="text-blue-400 font-bold font-mono">Passo 1</span>
                <p className="font-sans">
                  No portal <strong>e-CAC &gt; Simples Nacional &gt; PGDAS-D e DEFIS</strong>, inicie a apuração do período informando a receita bruta mensal auferida no mercado interno e externo.
                </p>
              </div>
              <div className="p-3 bg-[#0A0C10] border border-[#1E293B] rounded-lg space-y-1">
                <span className="text-blue-400 font-bold font-mono">Passo 2</span>
                <p className="font-sans">
                  Na tela de segregação de receitas do Anexo (I, II ou III Transporte), selecione a opção oficial de ICMS: <strong>"Com redução concedida pelo Estado"</strong> ou <strong>"Com isenção concedida pelo Estado"</strong> (conforme a faixa de faturamento).
                </p>
              </div>
              <div className="p-3 bg-[#0A0C10] border border-[#1E293B] rounded-lg space-y-1">
                <span className="text-blue-400 font-bold font-mono">Passo 3</span>
                <p className="font-sans">
                  O aplicativo PGDAS-D efetuará a conferência do domicílio fiscal paranaense e aplicará a redução calculada automaticamente no extrato do DAS gerado para pagamento.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Modal de Simulação Projetada Mês a Mês */}
      <ProjectedSimulationModal
        isOpen={isProjectedModalOpen}
        onClose={() => setIsProjectedModalOpen(false)}
        company={company}
        calculation={calculation}
      />

      {/* Modal de Histórico de Simulações e Pareceres Arquivados */}
      <SimulationHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        company={company}
        onRestoreSimulation={handleRestoreSimulation}
        onDeleteSimulation={handleDeleteSimulation}
      />

      {/* Modal Seletor de Opções do Catálogo Oficial e-CAC / PGDAS-D */}
      {isEcacPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn font-sans">
          <div className="bg-[#0B0F17] border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-200 my-auto">
            
            {/* Header do Seletor e-CAC */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#070A0F]">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
                  <ListPlus className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest px-2 py-0.5 bg-blue-500/10 rounded border border-blue-500/20">
                      Catálogo Oficial PGDAS-D / e-CAC
                    </span>
                    <span className="text-xs text-slate-500">LC 123/2006</span>
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Selecionar Opção de Atividade do e-CAC
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setIsEcacPickerOpen(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filtros e Busca */}
            <div className="p-4 border-b border-slate-800 bg-[#090D14] space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={ecacSearchQuery}
                  onChange={(e) => setEcacSearchQuery(e.target.value)}
                  placeholder="Pesquisar por descrição, anexo, substituição tributária, fator r..."
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              {/* Filtro por Grupos do e-CAC */}
              <div className="flex items-center space-x-1.5  pb-1 text-xs">
                {ecacGroups.map(grp => (
                  <button
                    key={grp}
                    type="button"
                    onClick={() => setEcacSelectedGroup(grp)}
                    className={`px-2.5 py-1 rounded-lg font-medium  transition ${
                      ecacSelectedGroup === grp 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                        : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {grp === 'todos' ? 'Todos os Grupos' : grp}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista de Opções do e-CAC */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {filteredEcacOptions.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  Nenhuma opção oficial encontrada para o termo pesquisado.
                </div>
              ) : (
                filteredEcacOptions.map((opt) => (
                  <div
                    key={opt.code}
                    className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">
                          Anexo {opt.anexo}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/60">
                          {opt.code}
                        </span>
                        {opt.subjectToFatorR && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded">
                            Sujeito ao Fator R
                          </span>
                        )}
                        {opt.hasST && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">
                            Com ST / Monofásico
                          </span>
                        )}
                        {opt.hasIssRetido && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                            ISS Retido na Fonte
                          </span>
                        )}
                        {opt.isExport && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded">
                            Exterior
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-white leading-snug">
                        {opt.group} - {opt.label}
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {opt.description}
                      </p>
                      <span className="text-[10px] text-slate-500 font-mono block">
                        Base Legal: {opt.legalBasis}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectEcacOption(opt)}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shrink-0 shadow-lg shadow-blue-600/20 transition flex items-center space-x-1.5 self-start sm:self-center"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Selecionar</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer do Seletor */}
            <div className="p-3 border-t border-slate-800 flex items-center justify-between bg-[#070A0F] text-xs text-slate-500">
              <span>{filteredEcacOptions.length} opções disponíveis no catálogo oficial</span>
              <button
                onClick={() => setIsEcacPickerOpen(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal de Relatório e Parecer Oficial */}
      <ReportViewerModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reportType={reportModalType}
        company={company}
        calculation={calculation}
        onNavigateToParecerMaster={() => {
          setIsReportModalOpen(false);
          if (onNavigateToTab) onNavigateToTab('parecer');
        }}
      />

      {/* Modal Explicativo de Decisão de Regime (Lucro Líquido vs Recomendação) */}
      <RegimeDecisionExplanationModal
        isOpen={isDecisionExplanationModalOpen}
        onClose={() => setIsDecisionExplanationModalOpen(false)}
        company={company}
        calculation={calculation}
        onNavigateToTab={onNavigateToTab}
      />

      {/* TUTORIAL MODAL */}
      <ModuleTutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        moduleName="Regimes & Tributos (4 em 1)"
        description="Analise simultaneamente a carga tributária do Simples Nacional, Lucro Presumido e Lucro Real (além de MEI, se aplicável). Ative particularidades como ICMS-ST, Monofásico e isenções."
      />

    </div>
  );
};

export default TaxRegimeAnalyzerView;
