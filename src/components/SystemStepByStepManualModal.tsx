import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Printer, 
  X, 
  ArrowRight, 
  ChevronRight, 
  ChevronLeft, 
  Layers, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  Crown, 
  FileText, 
  Building2, 
  Scale, 
  TrendingUp, 
  Percent, 
  Tags, 
  Receipt, 
  Wallet, 
  Award, 
  Info, 
  ExternalLink,
  Filter,
  Check,
  Zap,
  HelpCircle
} from 'lucide-react';
import { AppActiveTab } from '../types';
import { 
  SYSTEM_TRAINING_MANUAL_DATA, 
  ManualModule, 
  ManualSubmodule, 
  ManualFieldDetail 
} from '../data/systemTrainingManualData';

interface SystemStepByStepManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: AppActiveTab) => void;
  isMasterUser?: boolean;
}

export const SystemStepByStepManualModal: React.FC<SystemStepByStepManualModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
  isMasterUser = false
}) => {
  const [activeModuleIndex, setActiveModuleIndex] = useState<number>(0);
  const [activeSubmoduleId, setActiveSubmoduleId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'fields' | 'legal'>('all');
  const [isPrintMode, setIsPrintMode] = useState<boolean>(false);

  // Filtrar módulos para exibição (usuário comum não vê gestão master a menos que seja master)
  const availableModules = useMemo(() => {
    return SYSTEM_TRAINING_MANUAL_DATA.filter(m => !m.isMasterOnly || isMasterUser);
  }, [isMasterUser]);

  const currentModule = availableModules[activeModuleIndex] || availableModules[0];

  // Manter o submódulo ativo sincronizado com o módulo atual
  const activeSubmodule = useMemo(() => {
    if (!currentModule || !currentModule.submodules.length) return null;
    const found = currentModule.submodules.find(s => s.id === activeSubmoduleId);
    return found || currentModule.submodules[0];
  }, [currentModule, activeSubmoduleId]);

  // Busca global em todos os módulos e campos
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.toLowerCase().trim();

    const results: {
      module: ManualModule;
      submodule: ManualSubmodule;
      field: ManualFieldDetail;
    }[] = [];

    availableModules.forEach(mod => {
      mod.submodules.forEach(sub => {
        sub.fields.forEach(field => {
          const matchName = field.fieldName.toLowerCase().includes(query);
          const matchPurpose = field.technicalPurpose.toLowerCase().includes(query);
          const matchImpact = field.systemImpact.toLowerCase().includes(query);
          const matchLegal = field.legalBase?.toLowerCase().includes(query) || false;
          const matchReflects = field.reflectsIn.some(r => r.toLowerCase().includes(query));

          if (matchName || matchPurpose || matchImpact || matchLegal || matchReflects) {
            results.push({
              module: mod,
              submodule: sub,
              field
            });
          }
        });
      });
    });

    return results;
  }, [searchQuery, availableModules]);

  if (!isOpen) return null;

  const getModuleIcon = (iconName: string) => {
    switch (iconName) {
      case 'Percent': return Percent;
      case 'Scale': return Scale;
      case 'TrendingUp': return TrendingUp;
      case 'Building2': return Building2;
      case 'Tags': return Tags;
      case 'Receipt': return Receipt;
      case 'Wallet': return Wallet;
      case 'FileText': return FileText;
      case 'BookOpen': return BookOpen;
      case 'Award': return Award;
      case 'Crown': return Crown;
      default: return BookOpen;
    }
  };

  const CurrentIcon = getModuleIcon(currentModule.iconName);

  // Manipulador de impressão amigável
  const handlePrint = () => {
    setIsPrintMode(true);
    setTimeout(() => {
      window.print();
      setIsPrintMode(false);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto font-sans">
      <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl sm:rounded-3xl w-full max-w-6xl text-slate-100 shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col animate-in fade-in duration-200">
        
        {/* =========================================================================
            CABEÇALHO SUPERIOR EXECUTIVO
           ========================================================================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between px-5 sm:px-7 py-4 border-b border-slate-800 bg-[#070A12] shrink-0 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Manual Mestre de Treinamento, Implantação & Operação 360°
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                  Oficial VÉRTICE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Guia ponto a ponto: finalidade de cada campo, base legal, impacto no sistema e locais de reflexo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            {/* Campo de Busca Global */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="Buscar campo, impacto, artigo ou reflexo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 w-56 sm:w-72 transition"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Botão de Impressão */}
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Imprimir / Exportar Apostila de Treinamento"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Fechar Modal */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* =========================================================================
            RESULTADOS DA BUSCA GLOBAL (SE ATIVA)
           ========================================================================= */}
        {searchResults !== null ? (
          <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-bold text-slate-200">
                  Resultados da busca por: <span className="text-blue-400 font-mono">"{searchQuery}"</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs bg-slate-800 text-slate-400 font-semibold">
                  {searchResults.length} {searchResults.length === 1 ? 'campo encontrado' : 'campos encontrados'}
                </span>
              </div>
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-blue-400 hover:underline cursor-pointer"
              >
                Limpar busca e voltar à navegação modular
              </button>
            </div>

            {searchResults.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <HelpCircle className="w-10 h-10 text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-300">Nenhum campo encontrado com esse termo</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Tente buscar por termos como "Fator R", "Art. 50", "DBE", "Holding", "Split Payment", "Pró-Labore", "RPA" ou "Lucro Presumido".
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5">
                {searchResults.map((item, idx) => (
                  <FieldCard key={idx} field={item.field} moduleName={item.module.title} submoduleName={item.submodule.title} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* =========================================================================
                BARRA DE NAVEGAÇÃO DOS 11 MÓDULOS (SCROLL HORIZONTAL ELEGANTE)
               ========================================================================= */}
            <div className="flex overflow-x-auto border-b border-slate-800 bg-[#070A12] px-4 sm:px-6 pt-2 gap-1.5 shrink-0 scrollbar-thin scrollbar-thumb-slate-800">
              {availableModules.map((mod, idx) => {
                const ModIcon = getModuleIcon(mod.iconName);
                const isActive = idx === activeModuleIndex;
                return (
                  <button
                    key={mod.id}
                    onClick={() => {
                      setActiveModuleIndex(idx);
                      if (mod.submodules.length > 0) {
                        setActiveSubmoduleId(mod.submodules[0].id);
                      }
                    }}
                    className={`pb-2.5 px-3.5 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-2 shrink-0 ${
                      isActive
                        ? mod.isMasterOnly 
                          ? 'border-amber-500 text-amber-300 bg-amber-500/10 rounded-t-xl shadow-xs' 
                          : 'border-blue-500 text-blue-300 bg-blue-500/10 rounded-t-xl shadow-xs'
                        : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    <ModIcon className={`w-3.5 h-3.5 ${isActive ? (mod.isMasterOnly ? 'text-amber-400' : 'text-blue-400') : 'text-slate-500'}`} />
                    <span className="whitespace-nowrap">{mod.moduleCode}</span>
                    {mod.isMasterOnly && (
                      <span className="px-1.5 py-0.2 rounded text-[8px] bg-amber-500/20 text-amber-300 font-black tracking-wider uppercase border border-amber-500/30">
                        MASTER
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* =========================================================================
                CORPO DO MANUAL: MÓDULO & SUBMÓDULOS SELECIONADOS
               ========================================================================= */}
            <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
              
              {/* Card Hero do Módulo */}
              <div className={`p-4 sm:p-5 rounded-2xl border ${currentModule.isMasterOnly ? 'bg-amber-950/20 border-amber-800/40' : 'bg-slate-900/60 border-slate-800'} flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm`}>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-2xl ${currentModule.isMasterOnly ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-blue-600/20 text-blue-400 border border-blue-500/30'} shrink-0 shadow-inner`}>
                    <CurrentIcon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black border uppercase tracking-wider ${currentModule.isMasterOnly ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-blue-500/20 text-blue-300 border-blue-500/30'}`}>
                        {currentModule.moduleCode}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        Módulo {currentModule.number} de {availableModules.length.toString().padStart(2, '0')}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white">{currentModule.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">{currentModule.subtitle}</p>
                    <p className="text-[11px] text-slate-400 pt-1 leading-relaxed border-t border-slate-800/60 mt-1.5">
                      {currentModule.overview}
                    </p>
                  </div>
                </div>

                {onNavigateToTab && (
                  <button
                    onClick={() => {
                      onNavigateToTab(currentModule.targetTab);
                      onClose();
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 shadow-md cursor-pointer self-start md:self-auto ${
                      currentModule.isMasterOnly 
                        ? 'bg-amber-600 hover:bg-amber-500 text-white' 
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    <span>{currentModule.buttonLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Seletor de Submódulos em Abas Secundárias */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-blue-400" />
                    <span>Selecione a Etapa / Submódulo Operacional:</span>
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {currentModule.submodules.length} {currentModule.submodules.length === 1 ? 'submódulo' : 'submódulos'} mapeados
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {currentModule.submodules.map((sub) => {
                    const isSubActive = activeSubmodule?.id === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => setActiveSubmoduleId(sub.id)}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-1.5 ${
                          isSubActive
                            ? 'bg-blue-950/40 border-blue-500/60 text-blue-100 shadow-sm ring-1 ring-blue-500/30'
                            : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800/80 text-blue-300 border border-slate-700">
                            {sub.submoduleCode}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {sub.fields.length} {sub.fields.length === 1 ? 'campo' : 'campos'}
                          </span>
                        </div>
                        <span className="font-bold text-xs text-white line-clamp-1">{sub.title}</span>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{sub.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* =========================================================================
                  DETALHAMENTO PONTO A PONTO DOS CAMPOS DO SUBMÓDULO ATIVO
                 ========================================================================= */}
              {activeSubmodule && (
                <div className="space-y-4 pt-2 border-t border-slate-800/80">
                  <div className="p-4 rounded-2xl bg-[#070A12] border border-slate-800 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {activeSubmodule.submoduleCode}
                      </span>
                      <h4 className="text-sm font-bold text-white">{activeSubmodule.title}</h4>
                    </div>
                    <p className="text-xs text-slate-300">{activeSubmodule.description}</p>
                    <div className="pt-2 flex items-start gap-2 text-[11px] text-slate-400 border-t border-slate-800/60">
                      <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span><strong>Fluxo de Operação:</strong> {activeSubmodule.primaryWorkflow}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Dicionário de Campos, Finalidade, Impacto & Onde Reflete ({activeSubmodule.fields.length}):</span>
                      </h5>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {activeSubmodule.fields.map((field, fIdx) => (
                        <FieldCard key={fIdx} field={field} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* =========================================================================
                RODAPÉ DE NAVEGAÇÃO ENTRE MÓDULOS
               ========================================================================= */}
            <div className="px-6 py-3.5 border-t border-slate-800 bg-[#070A12] flex items-center justify-between shrink-0">
              <button
                type="button"
                disabled={activeModuleIndex === 0}
                onClick={() => {
                  const newIdx = Math.max(0, activeModuleIndex - 1);
                  setActiveModuleIndex(newIdx);
                  if (availableModules[newIdx].submodules.length > 0) {
                    setActiveSubmoduleId(availableModules[newIdx].submodules[0].id);
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Módulo Anterior</span>
              </button>

              <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <span>{currentModule.moduleCode}:</span>
                <span className="text-slate-200 font-semibold truncate max-w-xs">{currentModule.title}</span>
              </div>

              <button
                type="button"
                disabled={activeModuleIndex === availableModules.length - 1}
                onClick={() => {
                  const newIdx = Math.min(availableModules.length - 1, activeModuleIndex + 1);
                  setActiveModuleIndex(newIdx);
                  if (availableModules[newIdx].submodules.length > 0) {
                    setActiveSubmoduleId(availableModules[newIdx].submodules[0].id);
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Próximo Módulo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

// =========================================================================
// COMPONENTE CARD DE CAMPO INDIVIDUAL (FIELD CARD)
// =========================================================================
interface FieldCardProps {
  field: ManualFieldDetail;
  moduleName?: string;
  submoduleName?: string;
}

const FieldCard: React.FC<FieldCardProps> = ({ field, moduleName, submoduleName }) => {
  return (
    <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3 hover:border-slate-700 transition shadow-xs">
      
      {/* Topo: Nome, Tipo e Variável */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-2.5">
        <div className="space-y-0.5">
          {moduleName && submoduleName && (
            <div className="text-[10px] text-blue-400 font-mono flex items-center gap-1">
              <span>{moduleName}</span>
              <span>•</span>
              <span>{submoduleName}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <h6 className="text-xs sm:text-sm font-black text-white">{field.fieldName}</h6>
            {field.fieldCode && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                {field.fieldCode}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            {field.inputType}
          </span>
          {field.acceptedValues && (
            <span className="text-[10px] text-slate-400 font-mono hidden md:inline truncate max-w-xs">
              Valores: {field.acceptedValues}
            </span>
          )}
        </div>
      </div>

      {/* Grid: Finalidade e Regra Legal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Info className="w-3 h-3 text-blue-400" />
            O que faz / Finalidade Técnica:
          </span>
          <p className="text-slate-200 leading-relaxed text-[11px] sm:text-xs">
            {field.technicalPurpose}
          </p>
        </div>

        {field.legalBase && (
          <div className="space-y-1 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Base Legal & Normativa:
            </span>
            <p className="text-slate-300 font-mono text-[10px] sm:text-[11px] leading-relaxed">
              {field.legalBase}
            </p>
          </div>
        )}
      </div>

      {/* Seção Crítica: IMPACTO NO SISTEMA & AONDE REFLETE */}
      <div className="pt-2 border-t border-slate-800/60 space-y-2">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Impacto no Sistema:
          </span>
          <p className="text-slate-300 text-[11px] sm:text-xs leading-relaxed bg-amber-950/10 border border-amber-500/20 p-2.5 rounded-xl">
            {field.systemImpact}
          </p>
        </div>

        {/* Badges de Onde Reflete */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Aonde Reflete:
          </span>
          {field.reflectsIn.map((item, rIdx) => (
            <span 
              key={rIdx} 
              className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20 flex items-center gap-1"
            >
              <Check className="w-3 h-3 text-blue-400" />
              <span>{item}</span>
            </span>
          ))}
        </div>

        {field.operationalTip && (
          <div className="text-[10px] text-slate-400 italic pt-1 flex items-center gap-1">
            <span>💡 Dica de Operação: {field.operationalTip}</span>
          </div>
        )}
      </div>

    </div>
  );
};
