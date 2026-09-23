import React from 'react';
import { 
  Building2, 
  FileText, 
  Sparkles, 
  Upload, 
  Printer, 
  RotateCcw,
  Scale, 
  HelpCircle, 
  BookOpen, 
  Crown, 
  Gavel, 
  Tag, 
  TrendingUp, 
  Archive, 
  Coins, 
  Eye, 
  Lock,
  ChevronRight,
  PieChart,
  Users,
  ShieldCheck,
  CheckCircle2,
  LogOut,
  Search,
  Briefcase,
  Wallet,
  Bell,
  Mail,
  Share2,
  Award,
  Percent,
  Calendar,
  CalendarCheck,
  Layers,
  Activity,
  Calculator,
  Shield,
  FileCode,
  Tags,
  Receipt,
  Zap,
  BarChart3,
  Server
} from 'lucide-react';
import { CompanyData, CalculationResult, AuthUser, AppViewMode, AppActiveTab } from '../types';
import { BrandLogo, updateDynamicFavicon, BrandModuleKey } from './BrandLogo';
import { ModuleIcon } from './ModuleIcon';
import { canUserAccessTab } from '../utils/permissionRules';

interface NavbarProps {
  currentCompany: CompanyData;
  companies: CompanyData[];
  onSelectPreset: (company: CompanyData) => void;
  onOpenPDFUpload: () => void;
  onPrintReport: () => void;
  onOpenAIAuditor: () => void;
  onResetToDefault: () => void;
  calculation: CalculationResult;
  activeTab: AppActiveTab;
  setActiveTab: (tab: AppActiveTab) => void;
  onOpenLegalGuide: () => void;
  onOpenSystemTour: () => void;
  onOpenManual?: () => void;
  onOpenNotifications?: () => void;
  onOpenPublishShare?: () => void;
  onOpenCompanyManager: () => void;
  onOpenAuthModal: () => void;
  onOpenDocumentValidator?: () => void;
  authUser: AuthUser;
  viewMode: AppViewMode;
  onSelectViewMode: (mode: AppViewMode) => void;
  onLogout?: () => void;
  onOpenPartnerPortal?: () => void;
}

type NavModuleId = 
  | 'auditoria_digital' 
  | 'planejamento_tributario' 
  | 'financeiro_gerencial' 
  | 'consultoria_fiscal' 
  | 'legal_societario' 
  | 'conhecimentos' 
  | 'agenda_fiscal' 
  | 'emissao_nfse'
  | 'portal_parceiro' 
  | 'gestao_master'
  | 'vertice_documentos';

export const Navbar: React.FC<NavbarProps> = ({
  currentCompany,
  companies,
  onSelectPreset,
  onOpenPDFUpload,
  onPrintReport,
  onOpenAIAuditor,
  onResetToDefault,
  calculation,
  activeTab,
  setActiveTab,
  onOpenLegalGuide,
  onOpenSystemTour,
  onOpenManual,
  onOpenNotifications,
  onOpenPublishShare,
  onOpenCompanyManager,
  onOpenAuthModal,
  onOpenDocumentValidator,
  authUser,
  viewMode,
  onSelectViewMode,
  onLogout,
  onOpenPartnerPortal,
}) => {
  const isMasterUser = authUser?.role === 'master' || authUser?.isMaster || authUser?.email === 'contato@verticeanalises.com.br' || authUser?.email === 'carlosmiguelvieira1@gmail.com';
  const isEmpresa = viewMode === 'empresa' || authUser?.role === 'cliente_empresa';
  const isEscritorio = viewMode === 'escritorio' || authUser?.role === 'escritorio' || authUser?.role === 'contador_senior';

  // Identifica o módulo ativo com base na aba
  const activeModule: NavModuleId = React.useMemo(() => {
    if (['vertice_documentos'].includes(activeTab)) return 'vertice_documentos';
    if (['dashboard', 'auditoria_digital', 'fator_r', 'socios'].includes(activeTab)) return 'auditoria_digital';
    if (['planejamento_tributario', 'regimes', 'reforma', 'projecao', 'parecer', 'historico', 'simples_hibrido', 'econet_report'].includes(activeTab)) return 'planejamento_tributario';
    if (['financeiro_gerencial', 'financeiro', 'balancete_dre', 'bpo', 'bpo_financeiro'].includes(activeTab)) return 'financeiro_gerencial';
    if (['consultoria_fiscal', 'ncm_consulta', 'servicos_consulta', 'cfop'].includes(activeTab)) return 'consultoria_fiscal';
    if (['legal_societario', 'societario', 'direito'].includes(activeTab)) return 'legal_societario';
    if (['conhecimentos'].includes(activeTab)) return 'conhecimentos';
    if (['agenda_fiscal'].includes(activeTab)) return 'agenda_fiscal';
    if (['emissao_nfse', 'nfse'].includes(activeTab)) return 'emissao_nfse';
    if (['portal_parceiro', 'parceiros'].includes(activeTab)) return 'portal_parceiro';
    if (['gestao_planos', 'contratos'].includes(activeTab)) return 'gestao_master';
    return 'auditoria_digital';
  }, [activeTab]);

  React.useEffect(() => {
    let brandKey: BrandModuleKey = 'master';
    if (activeTab === 'fator_r') brandKey = 'simples';
    else if (activeTab === 'cfop') brandKey = 'monofasico';
    else if (activeTab === 'reforma') brandKey = 'reforma';
    else if (activeTab === 'ncm_consulta' || activeTab === 'servicos_consulta') brandKey = 'consultas';
    else if (activeTab === 'financeiro' || activeTab === 'bpo' || activeTab === 'bpo_financeiro') brandKey = 'bpo';
    else if (activeTab === 'emissao_nfse' || activeTab === 'nfse') brandKey = 'nfse';
    else if (activeTab === 'societario' || activeTab === 'socios') brandKey = 'societario';
    else if (activeTab === 'portal_parceiro' || activeTab === 'parceiros') brandKey = 'parceiros';
    else if (activeTab === 'parecer') brandKey = 'parecer';
    else if (activeTab === 'agenda_fiscal') brandKey = 'agenda';
    else if (activeTab === 'conhecimentos') brandKey = 'conhecimentos';

    updateDynamicFavicon(brandKey);
  }, [activeTab]);

  const handleSelectModule = (moduleId: NavModuleId) => {
    const { allowed } = canUserAccessTab(authUser, moduleId as any);
    if (!allowed && !isMasterUser) return;

    switch (moduleId) {
      case 'auditoria_digital': setActiveTab('dashboard'); break;
      case 'planejamento_tributario': setActiveTab('regimes'); break;
      case 'financeiro_gerencial': setActiveTab('financeiro'); break;
      case 'consultoria_fiscal': setActiveTab('ncm_consulta'); break;
      case 'legal_societario': setActiveTab('societario'); break;
      case 'conhecimentos': setActiveTab('conhecimentos'); break;
      case 'agenda_fiscal': setActiveTab('agenda_fiscal'); break;
      case 'emissao_nfse': setActiveTab('emissao_nfse'); break;
      case 'portal_parceiro': setActiveTab('portal_parceiro'); break;
      case 'gestao_master': setActiveTab('gestao_planos'); break;
      case 'vertice_documentos': setActiveTab('vertice_documentos'); break;
    }
  };

  const NavButton = ({ 
    id, 
    label, 
    icon: Icon, 
    color, 
    pattern, 
    subLabel 
  }: { 
    id: NavModuleId, 
    label: string, 
    icon: any, 
    color: string, 
    pattern?: any, 
    subLabel?: string 
  }) => {
    const { allowed } = canUserAccessTab(authUser, id as any);
    const isActive = activeModule === id;
    
    if (!allowed && !isMasterUser) return null;

    const colorConfig: Record<string, { activeText: string, activeBg: string, activeBorder: string, glow: string }> = {
      blue: { activeText: 'text-blue-400', activeBg: 'bg-blue-950/40', activeBorder: 'border-blue-500/70 shadow-[0_0_14px_rgba(59,130,246,0.25)]', glow: 'shadow-blue-500/20' },
      emerald: { activeText: 'text-emerald-400', activeBg: 'bg-emerald-950/40', activeBorder: 'border-emerald-500/70 shadow-[0_0_14px_rgba(16,185,129,0.25)]', glow: 'shadow-emerald-500/20' },
      amber: { activeText: 'text-amber-400', activeBg: 'bg-amber-950/40', activeBorder: 'border-amber-500/70 shadow-[0_0_14px_rgba(245,158,11,0.25)]', glow: 'shadow-amber-500/20' },
      indigo: { activeText: 'text-indigo-400', activeBg: 'bg-indigo-950/40', activeBorder: 'border-indigo-500/70 shadow-[0_0_14px_rgba(99,102,241,0.25)]', glow: 'shadow-indigo-500/20' },
      cyan: { activeText: 'text-cyan-400', activeBg: 'bg-cyan-950/40', activeBorder: 'border-cyan-500/70 shadow-[0_0_14px_rgba(6,182,212,0.25)]', glow: 'shadow-cyan-500/20' },
      teal: { activeText: 'text-teal-400', activeBg: 'bg-teal-950/40', activeBorder: 'border-teal-500/70 shadow-[0_0_14px_rgba(20,184,166,0.25)]', glow: 'shadow-teal-500/20' },
      rose: { activeText: 'text-rose-400', activeBg: 'bg-rose-950/40', activeBorder: 'border-rose-500/70 shadow-[0_0_14px_rgba(244,63,94,0.25)]', glow: 'shadow-rose-500/20' },
      slate: { activeText: 'text-slate-100', activeBg: 'bg-slate-800/60', activeBorder: 'border-slate-400/70 shadow-[0_0_14px_rgba(148,163,184,0.25)]', glow: 'shadow-slate-500/20' },
    };

    const cfg = colorConfig[color] || colorConfig.blue;
    const pat = pattern || (color as any) || 'default';

    return (
      <button
        onClick={() => handleSelectModule(id)}
        className={`w-full px-2.5 py-1.5 rounded-xl text-left transition-all duration-200 flex items-center space-x-2 border cursor-pointer group select-none min-w-0 ${
          isActive 
            ? `${cfg.activeBg} ${cfg.activeText} ${cfg.activeBorder} ring-1 ring-white/10` 
            : 'text-slate-300 hover:text-white bg-[#0B0F19]/90 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/80'
        }`}
      >
        <div className="shrink-0 transition-transform duration-200 group-hover:scale-105">
          <ModuleIcon icon={Icon} pattern={pat} size="sm" />
        </div>
        <div className="min-w-0 flex-1 leading-none py-0.5">
          <div className="text-[10px] sm:text-[10.5px] font-black uppercase tracking-tight truncate">
            {label}
          </div>
          {subLabel && (
            <div className={`text-[8px] font-semibold mt-1 truncate ${
              isActive ? 'text-slate-300/90' : 'text-slate-500 group-hover:text-slate-400'
            }`}>
              {subLabel}
            </div>
          )}
        </div>
      </button>
    );
  };

  const activeBrandModule = React.useMemo(() => {
    if (['vertice_documentos'].includes(activeTab)) return 'nfse';
    if (['dashboard', 'auditoria_digital'].includes(activeTab)) return 'master';
    if (['fator_r', 'planejamento_tributario', 'regimes'].includes(activeTab)) return 'simples';
    if (['reforma'].includes(activeTab)) return 'reforma';
    if (['cfop'].includes(activeTab)) return 'monofasico';
    if (['ncm_consulta', 'servicos_consulta'].includes(activeTab)) return 'consultas';
    if (['financeiro_gerencial', 'financeiro', 'balancete_dre', 'bpo', 'bpo_financeiro'].includes(activeTab)) return 'bpo';
    if (['emissao_nfse', 'nfse'].includes(activeTab)) return 'nfse';
    if (['societario', 'legal_societario', 'socios'].includes(activeTab)) return 'societario';
    if (['portal_parceiro', 'parceiros'].includes(activeTab)) return 'parceiros';
    if (['parecer', 'direito'].includes(activeTab)) return 'parecer';
    if (['agenda_fiscal'].includes(activeTab)) return 'agenda';
    if (['conhecimentos'].includes(activeTab)) return 'conhecimentos';
    return 'master';
  }, [activeTab]);

  return (
    <header className="no-print border-b border-slate-800/80 bg-[#0B0F19]/95 backdrop-blur-md sticky top-0 z-50 shadow-2xl transition-colors">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6">
        
        {/* Top bar: Brand and User Profile */}
        <div className="flex items-center justify-between h-14 border-b border-slate-800/60">
          <div className="flex items-center space-x-4">
            <BrandLogo variant="navbar" module={activeBrandModule} />
            <div className="hidden lg:flex h-4 w-[1px] bg-slate-800" />
            <div className="hidden lg:flex items-center space-x-2 px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-800 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Conectado à RFB</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Quick Actions */}
            <div className="hidden md:flex items-center space-x-2 pr-4 border-r border-slate-800">
               {onOpenDocumentValidator && (
                 <button
                   onClick={onOpenDocumentValidator}
                   className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 transition text-[10px] font-bold cursor-pointer"
                   title="Validador Público de Autenticidade e QR Code de Laudos"
                 >
                   <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                   <span className="hidden xl:inline">Validador Oficial</span>
                 </button>
               )}
               {isMasterUser && (
                 <button
                   onClick={() => setActiveTab && setActiveTab('webmail_umbler')}
                   className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/70 hover:bg-cyan-900/70 text-cyan-300 border border-cyan-800/70 transition text-[10px] font-bold cursor-pointer"
                   title="Central de E-mails Umbler (contato@verticeanalises.com.br)"
                 >
                   <Mail className="w-3.5 h-3.5 text-cyan-400" />
                   <span className="hidden xl:inline">E-mail Umbler</span>
                 </button>
               )}
               {isMasterUser && (
                 <button
                   onClick={() => setActiveTab && setActiveTab('gestao_planos')}
                   className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-purple-950/70 hover:bg-purple-900/70 text-purple-300 border border-purple-800/70 transition text-[10px] font-bold cursor-pointer"
                   title="Mapa Global de APIs e Integrações Governamentais (Exclusivo Master/Dev)"
                 >
                   <Server className="w-3.5 h-3.5 text-purple-400" />
                   <span className="hidden xl:inline">Mapa de APIs & Robôs</span>
                 </button>
               )}
               {isMasterUser && (
                 <button
                   onClick={() => setActiveTab && setActiveTab('vertice_documentos')}
                   className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-rose-950/70 hover:bg-rose-900/70 text-rose-300 border border-rose-800/70 transition text-[10px] font-bold cursor-pointer"
                   title="Vértice Documentos: Busca, Correção e Download de XMLs (Exclusivo Dev)"
                 >
                   <FileCode className="w-3.5 h-3.5 text-rose-400" />
                   <span className="hidden xl:inline">Vértice Documentos (Dev)</span>
                 </button>
               )}
               <button onClick={onOpenNotifications} className="p-2 text-slate-500 hover:text-amber-400 transition relative">
                 <Bell className="w-4 h-4" />
                 <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full border border-[#0B0F19]" />
               </button>
               {onOpenManual && (
                 <button 
                   onClick={onOpenManual} 
                   className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-blue-950/70 hover:bg-blue-900/70 text-blue-300 border border-blue-800/70 transition text-[10px] font-bold cursor-pointer"
                   title="Manual Completo de Treinamento, Implantação e Operação 360°"
                 >
                   <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                   <span className="hidden xl:inline">Manual 360°</span>
                 </button>
               )}
               <button onClick={onOpenSystemTour} className="p-2 text-slate-500 hover:text-blue-400 transition">
                 <HelpCircle className="w-4 h-4" />
               </button>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex flex-col items-end text-right">
                <span className="text-[10px] font-black text-slate-100 uppercase tracking-tight truncate max-w-[120px]">{authUser?.name}</span>
                <span className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 ${isMasterUser ? 'text-amber-400' : 'text-slate-500'}`}>
                  {isMasterUser ? 'Proprietário Master' : isEmpresa ? 'Perfil Empresa' : 'Escritório Contábil'}
                </span>
              </div>
              {onLogout && (
                <button onClick={onLogout} className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition group">
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action bar: Company and Quick Tools */}
        <div className="flex items-center justify-between py-2 border-b border-slate-800/40">
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenCompanyManager}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition group"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition" />
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-tight font-mono">{currentCompany?.name}</span>
              <ChevronRight className="w-3 h-3 text-slate-600" />
            </button>

            {!isEmpresa && (
              <button
                onClick={onOpenPDFUpload}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-blue-600/10 border border-blue-500/30 text-blue-400 hover:bg-blue-600 hover:text-white transition font-bold text-[10px] uppercase"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Importar PGDAS-D</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button onClick={onOpenAIAuditor} className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-600 hover:text-white transition font-bold text-[10px] uppercase cursor-pointer">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auditor Inteligente</span>
            </button>
            
            {isMasterUser && (
              <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                <button onClick={() => onSelectViewMode('master')} className={`px-2 py-1 rounded-md text-[8px] font-black uppercase transition ${viewMode === 'master' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Master</button>
                <button onClick={() => onSelectViewMode('escritorio')} className={`px-2 py-1 rounded-md text-[8px] font-black uppercase transition ${viewMode === 'escritorio' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Escritório</button>
                <button onClick={() => onSelectViewMode('empresa')} className={`px-2 py-1 rounded-md text-[8px] font-black uppercase transition ${viewMode === 'empresa' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Empresa</button>
              </div>
            )}
          </div>
        </div>

        {/* Modules navigation in 2 clear lines (100% visible on client's screen) */}
        <nav className="py-2.5 space-y-1.5">
          {!isEmpresa ? (
            <div className="space-y-1.5 w-full">
              {/* Linha 1: 5 Módulos Principais do Sistema (Fator R, Planejamento, Blindagem Societária, Emissor NFS-e, Financeiro) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5 w-full">
                <NavButton 
                  id="auditoria_digital" 
                  label="Fator R & Auditoria" 
                  icon={Percent} 
                  color="emerald" 
                  pattern="emerald" 
                  subLabel="Anexos III/V • RBT12" 
                />
                <NavButton 
                  id="planejamento_tributario" 
                  label="Planejamento Tributário" 
                  icon={Calculator} 
                  color="blue" 
                  pattern="blue" 
                  subLabel="Simulador 4 em 1 • Reforma" 
                />
                <NavButton 
                  id="legal_societario" 
                  label="Blindagem Societária" 
                  icon={Building2} 
                  color="cyan" 
                  pattern="cyan" 
                  subLabel="Expert 360° • Holdings • Auditor IA" 
                />
                <NavButton 
                  id="emissao_nfse" 
                  label="Emissor Fiscal NFS-e" 
                  icon={Receipt} 
                  color="rose" 
                  pattern="rose" 
                  subLabel="Gov.br Nacional • A1" 
                />
                <NavButton 
                  id="financeiro_gerencial" 
                  label="Central Financeira & Contratos" 
                  icon={Wallet} 
                  color="teal" 
                  pattern="teal" 
                  subLabel="Faturamento • Boletos/PIX • DRE" 
                />
              </div>

              {/* Linha 2: 5 Módulos Consultivos, Normativos & Estratégicos */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5 w-full">
                <NavButton 
                  id="consultoria_fiscal" 
                  label="Classificação & Monofásico" 
                  icon={Tags} 
                  color="amber" 
                  pattern="amber" 
                  subLabel="NCM • PIS/COFINS • ST" 
                />
                <NavButton 
                  id="agenda_fiscal" 
                  label="Agenda Fiscal" 
                  icon={CalendarCheck} 
                  color="rose" 
                  pattern="rose" 
                  subLabel="Obrigações & Prazos" 
                />
                <NavButton 
                  id="conhecimentos" 
                  label="Acervo Normativo" 
                  icon={BookOpen} 
                  color="indigo" 
                  pattern="indigo" 
                  subLabel="Instruções RFB • CFC" 
                />
                <NavButton 
                  id="portal_parceiro" 
                  label="Rede de Parceiros" 
                  icon={Award} 
                  color="amber" 
                  pattern="amber" 
                  subLabel="Comissões Recorrentes PIX" 
                />
                <NavButton 
                  id="gestao_master" 
                  label="Gestão da Plataforma" 
                  icon={Crown} 
                  color="slate" 
                  pattern="slate" 
                  subLabel="Planos Master & Licenças" 
                />
                {isMasterUser && (
                  <NavButton 
                    id="vertice_documentos" 
                    label="Vértice Documentos" 
                    icon={FileCode} 
                    color="rose" 
                    pattern="rose" 
                    subLabel="Busca, Correção & XML (Dev)" 
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5 w-full">
              <NavButton 
                id="emissao_nfse" 
                label="Emissor Fiscal NFS-e" 
                icon={Receipt} 
                color="rose" 
                pattern="rose" 
                subLabel="Notas para Clientes" 
              />
              <NavButton 
                id="agenda_fiscal" 
                label="Minha Agenda Fiscal" 
                icon={CalendarCheck} 
                color="rose" 
                pattern="rose" 
                subLabel="Prazos & Vencimentos" 
              />
              <NavButton 
                id="financeiro_gerencial" 
                label="Finanças & Resultado" 
                icon={Wallet} 
                color="teal" 
                pattern="teal" 
                subLabel="DRE • Lucro Isento" 
              />
              <NavButton 
                id="consultoria_fiscal" 
                label="Classificação & Consultas" 
                icon={Tags} 
                color="amber" 
                pattern="amber" 
                subLabel="NCM • Alíquotas" 
              />
              <NavButton 
                id="auditoria_digital" 
                label="Diagnóstico Fator R" 
                icon={Percent} 
                color="emerald" 
                pattern="emerald" 
                subLabel="Folha • Simples Nacional" 
              />
            </div>
          )}
        </nav>

        {/* Sub-tabs bar with specialized module color matrix */}
        <div className="flex flex-wrap items-center gap-1.5 py-2 border-t border-slate-800/60">
          <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-2.5 py-1 border-r border-slate-800 shrink-0 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
            <span>Ferramentas:</span>
          </div>
          
          {activeModule === 'emissao_nfse' && (
            <>
              <SubTabButton 
                active={activeTab === 'emissao_nfse'} 
                onClick={() => setActiveTab('emissao_nfse')} 
                label="Módulo Comercial NFS-e Gov.br" 
                icon={Receipt} 
                color="rose" 
              />
            </>
          )}
          
          {activeModule === 'auditoria_digital' && (
            <>
              <SubTabButton 
                active={activeTab === 'dashboard'} 
                onClick={() => setActiveTab('dashboard')} 
                label="Cockpit Gerencial" 
                icon={Activity} 
                color="emerald" 
              />
              <SubTabButton 
                active={activeTab === 'fator_r'} 
                onClick={() => setActiveTab('fator_r')} 
                label="Auditoria Fator R" 
                icon={Percent} 
                color="emerald" 
              />
              <SubTabButton 
                active={activeTab === 'socios'} 
                onClick={() => setActiveTab('socios')} 
                label="Quadro de Sócios" 
                icon={Users} 
                color="teal" 
              />
            </>
          )}

          {activeModule === 'planejamento_tributario' && (
            <>
              <SubTabButton 
                active={activeTab === 'regimes'} 
                onClick={() => setActiveTab('regimes')} 
                label="Simulador de Regimes" 
                icon={Calculator} 
                color="blue" 
              />
              <SubTabButton 
                active={activeTab === 'simples_hibrido'} 
                onClick={() => setActiveTab('simples_hibrido')} 
                label="Simples Híbrido (EC 132/23)" 
                icon={Scale} 
                color="indigo" 
              />
              <SubTabButton 
                active={activeTab === 'reforma'} 
                onClick={() => setActiveTab('reforma')} 
                label="Reforma Tributária" 
                icon={Zap} 
                color="purple" 
              />
              <SubTabButton 
                active={activeTab === 'projecao'} 
                onClick={() => setActiveTab('projecao')} 
                label="Projeção Fiscal" 
                icon={TrendingUp} 
                color="cyan" 
              />
              <SubTabButton 
                active={activeTab === 'parecer'} 
                onClick={() => setActiveTab('parecer')} 
                label="Parecer Técnico" 
                icon={Scale} 
                color="slate" 
              />
              <SubTabButton 
                active={activeTab === 'historico'} 
                onClick={() => setActiveTab('historico')} 
                label="Histórico" 
                icon={Archive} 
                color="blue" 
              />
              <SubTabButton 
                active={activeTab === 'econet_report'} 
                onClick={() => setActiveTab('econet_report')} 
                label="Leitor Econet / Ecosim" 
                icon={FileText} 
                color="emerald" 
              />
            </>
          )}

          {activeModule === 'financeiro_gerencial' && (
            <>
              <SubTabButton 
                active={activeTab === 'financeiro'} 
                onClick={() => setActiveTab('financeiro')} 
                label="DRE Gerencial" 
                icon={BarChart3} 
                color="teal" 
              />
              <SubTabButton 
                active={activeTab === 'balancete_dre'} 
                onClick={() => setActiveTab('balancete_dre')} 
                label="Balancete Analítico" 
                icon={PieChart} 
                color="teal" 
              />
              <SubTabButton 
                active={activeTab === 'bpo_financeiro'} 
                onClick={() => setActiveTab('bpo_financeiro')} 
                label="Gestão BPO" 
                icon={Coins} 
                color="emerald" 
              />
            </>
          )}

          {activeModule === 'consultoria_fiscal' && (
            <>
              <SubTabButton 
                active={activeTab === 'ncm_consulta'} 
                onClick={() => setActiveTab('ncm_consulta')} 
                label="Consulta NCM" 
                icon={Search} 
                color="amber" 
              />
              <SubTabButton 
                active={activeTab === 'servicos_consulta'} 
                onClick={() => setActiveTab('servicos_consulta')} 
                label="Códigos de Serviço" 
                icon={Tag} 
                color="amber" 
              />
              <SubTabButton 
                active={activeTab === 'cfop'} 
                onClick={() => setActiveTab('cfop')} 
                label="Segregação CFOP & Monofásico" 
                icon={Layers} 
                color="amber" 
              />
            </>
          )}

          {activeModule === 'legal_societario' && (
            <>
              <SubTabButton 
                active={activeTab === 'societario'} 
                onClick={() => setActiveTab('societario')} 
                label="Contratos & Minutas" 
                icon={Building2} 
                color="cyan" 
              />
              <SubTabButton 
                active={activeTab === 'direito'} 
                onClick={() => setActiveTab('direito')} 
                label="Doutrina & Teses" 
                icon={Gavel} 
                color="cyan" 
              />
            </>
          )}

          {activeModule === 'agenda_fiscal' && (
            <>
              <SubTabButton 
                active={activeTab === 'agenda_fiscal'} 
                onClick={() => setActiveTab('agenda_fiscal')} 
                label="Calendário de Obrigações & Vencimentos" 
                icon={CalendarCheck} 
                color="rose" 
              />
            </>
          )}

          {activeModule === 'conhecimentos' && (
            <>
              <SubTabButton 
                active={activeTab === 'conhecimentos'} 
                onClick={() => setActiveTab('conhecimentos')} 
                label="Normas RFB, SPED & eSocial" 
                icon={BookOpen} 
                color="indigo" 
              />
            </>
          )}

          {activeModule === 'portal_parceiro' && (
            <>
              <SubTabButton 
                active={activeTab === 'portal_parceiro'} 
                onClick={() => setActiveTab('portal_parceiro')} 
                label="Extrato de Comissões & Indicações PIX" 
                icon={Award} 
                color="yellow" 
              />
            </>
          )}

          {activeModule === 'gestao_master' && (
            <>
              <SubTabButton 
                active={activeTab === 'gestao_planos'} 
                onClick={() => setActiveTab('gestao_planos')} 
                label="Planos & Valores" 
                icon={Crown} 
                color="amber" 
              />
              <SubTabButton 
                active={activeTab === 'contratos'} 
                onClick={() => setActiveTab('contratos')} 
                label="Contratos de Clientes" 
                icon={FileText} 
                color="blue" 
              />
              <SubTabButton 
                active={activeTab === 'parceiros'} 
                onClick={() => setActiveTab('parceiros')} 
                label="Gestão de Parceiros" 
                icon={Users} 
                color="indigo" 
              />
            </>
          )}
        </div>
      </div>
    </header>
  );
};

const SubTabButton = ({ 
  active, 
  onClick, 
  label, 
  icon: Icon,
  color = 'blue'
}: { 
  active: boolean; 
  onClick: () => void; 
  label: string; 
  icon?: any;
  color?: 'emerald' | 'blue' | 'purple' | 'teal' | 'amber' | 'cyan' | 'rose' | 'indigo' | 'yellow' | 'slate';
}) => {
  const colorMap: Record<string, { active: string; inactive: string; dot: string; iconActive: string; iconInactive: string }> = {
    emerald: {
      active: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.25)] ring-1 ring-emerald-500/30',
      inactive: 'text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/20 border-slate-800 hover:border-emerald-800/40',
      dot: 'bg-emerald-400',
      iconActive: 'text-emerald-400',
      iconInactive: 'text-emerald-500/70'
    },
    blue: {
      active: 'bg-blue-950/80 text-blue-300 border-blue-500/60 shadow-[0_0_12px_rgba(59,130,246,0.25)] ring-1 ring-blue-500/30',
      inactive: 'text-slate-400 hover:text-blue-300 hover:bg-blue-950/20 border-slate-800 hover:border-blue-800/40',
      dot: 'bg-blue-400',
      iconActive: 'text-blue-400',
      iconInactive: 'text-blue-500/70'
    },
    purple: {
      active: 'bg-purple-950/80 text-purple-300 border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.25)] ring-1 ring-purple-500/30',
      inactive: 'text-slate-400 hover:text-purple-300 hover:bg-purple-950/20 border-slate-800 hover:border-purple-800/40',
      dot: 'bg-purple-400',
      iconActive: 'text-purple-400',
      iconInactive: 'text-purple-500/70'
    },
    teal: {
      active: 'bg-teal-950/80 text-teal-300 border-teal-500/60 shadow-[0_0_12px_rgba(20,184,166,0.25)] ring-1 ring-teal-500/30',
      inactive: 'text-slate-400 hover:text-teal-300 hover:bg-teal-950/20 border-slate-800 hover:border-teal-800/40',
      dot: 'bg-teal-400',
      iconActive: 'text-teal-400',
      iconInactive: 'text-teal-500/70'
    },
    amber: {
      active: 'bg-amber-950/80 text-amber-300 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/30',
      inactive: 'text-slate-400 hover:text-amber-300 hover:bg-amber-950/20 border-slate-800 hover:border-amber-800/40',
      dot: 'bg-amber-400',
      iconActive: 'text-amber-400',
      iconInactive: 'text-amber-500/70'
    },
    cyan: {
      active: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.25)] ring-1 ring-cyan-500/30',
      inactive: 'text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/20 border-slate-800 hover:border-cyan-800/40',
      dot: 'bg-cyan-400',
      iconActive: 'text-cyan-400',
      iconInactive: 'text-cyan-500/70'
    },
    rose: {
      active: 'bg-rose-950/80 text-rose-300 border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.25)] ring-1 ring-rose-500/30',
      inactive: 'text-slate-400 hover:text-rose-300 hover:bg-rose-950/20 border-slate-800 hover:border-rose-800/40',
      dot: 'bg-rose-400',
      iconActive: 'text-rose-400',
      iconInactive: 'text-rose-500/70'
    },
    indigo: {
      active: 'bg-indigo-950/80 text-indigo-300 border-indigo-500/60 shadow-[0_0_12px_rgba(99,102,241,0.25)] ring-1 ring-indigo-500/30',
      inactive: 'text-slate-400 hover:text-indigo-300 hover:bg-indigo-950/20 border-slate-800 hover:border-indigo-800/40',
      dot: 'bg-indigo-400',
      iconActive: 'text-indigo-400',
      iconInactive: 'text-indigo-500/70'
    },
    yellow: {
      active: 'bg-amber-950/90 text-yellow-300 border-yellow-500/60 shadow-[0_0_12px_rgba(234,179,8,0.25)] ring-1 ring-yellow-500/30',
      inactive: 'text-slate-400 hover:text-yellow-300 hover:bg-amber-950/20 border-slate-800 hover:border-yellow-800/40',
      dot: 'bg-yellow-400',
      iconActive: 'text-yellow-400',
      iconInactive: 'text-yellow-500/70'
    },
    slate: {
      active: 'bg-slate-800 text-slate-100 border-slate-500 shadow-[0_0_12px_rgba(148,163,184,0.2)] ring-1 ring-white/10',
      inactive: 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border-slate-800 hover:border-slate-700',
      dot: 'bg-slate-400',
      iconActive: 'text-slate-300',
      iconInactive: 'text-slate-500'
    }
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all duration-150 flex items-center space-x-1.5 border cursor-pointer shrink-0 ${
        active ? scheme.active : scheme.inactive
      }`}
    >
      {Icon && <Icon className={`w-3.5 h-3.5 shrink-0 transition-colors ${active ? scheme.iconActive : scheme.iconInactive}`} />}
      <span>{label}</span>
      {active && <span className={`w-1.5 h-1.5 rounded-full ${scheme.dot} animate-pulse`} />}
    </button>
  );
};
