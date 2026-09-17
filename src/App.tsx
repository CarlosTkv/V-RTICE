import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { ReactLenis } from 'lenis/react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { FinancialDashboardView } from './components/FinancialDashboardView';
import { AdminPlansBillingView } from './components/AdminPlansBillingView';
import { TaxRegimeAnalyzerView } from './components/TaxRegimeAnalyzerView';
import { ProjectedSimulationView } from './components/ProjectedSimulationView';
import { SimulationHistoryView } from './components/SimulationHistoryView';
import { CFOPTaxSegregationView } from './components/CFOPTaxSegregationView';
import { PartnersManager } from './components/PartnersManager';
import { FatorRCalculator } from './components/FatorRCalculator';
import { ReformaTributariaSection } from './components/ReformaTributariaSection';
import { TechnicalReport } from './components/TechnicalReport';
import { NCMConsultationView } from './components/NCMConsultationView';
import { ServiceCodeConsultationView } from './components/ServiceCodeConsultationView';
import { SocietarioView } from './components/SocietarioView';
import { ServiceContractsModule } from './components/ServiceContractsModule';
import { BPOFinanceiroView } from './components/BPOFinanceiroView';
import { ConhecimentosView } from './components/ConhecimentosView';
import { AgendaFiscalView } from './components/AgendaFiscalView';
import { DireitoView } from './components/DireitoView';
import { PartnerPortalView } from './components/PartnerPortalView';
import { PDFUploadModal } from './components/PDFUploadModal';
import { LegalGuideModal } from './components/LegalGuideModal';
import { AIAuditorModal } from './components/AIAuditorModal';
import { SystemTourModal } from './components/SystemTourModal';
import { SystemStepByStepManualModal } from './components/SystemStepByStepManualModal';
import { TaxNewsAndNotificationCenter } from './components/TaxNewsAndNotificationCenter';
import { PublishShareModal } from './components/PublishShareModal';
import { AuthModal } from './components/AuthModal';
import { CompanyManagerModal } from './components/CompanyManagerModal';
import { PrivacyLGPDModal } from './components/PrivacyLGPDModal';
import { PartnerPortalModal } from './components/PartnerPortalModal';
import { DocumentValidatorModal } from './components/DocumentValidatorModal';
import { LoginPage } from './components/LoginPage';
import { LandingWelcomePortal } from './components/LandingWelcomePortal';
import { CommercialNfseModule } from './components/CommercialNfseModule';
import { FinancialStatementsView } from './components/FinancialStatementsView';
import { NCMServiceLookupView } from './components/NCMServiceLookupView';
// Remove import
import { PRESET_COMPANIES } from './data/presets';
import { CompanyData, AuthUser, AppViewMode, AppActiveTab } from './types';
import { calculateTaxAudit } from './utils/taxRules';
import { AuthService, DEFAULT_PRESET_ACCOUNTS } from './utils/authService';
import { canUserAccessTab } from './utils/permissionRules';
import { Lock } from 'lucide-react';
import { CosmicPrismaBackground } from './components/CosmicPrismaBackground';
import bgImage from './assets/images/corporate_tech_office_bg_1789415696102.jpg';

export default function App() {
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.add('dark');
    root.classList.remove('light');
  }, []);

  // Multi-company database state
  const [companies, setCompanies] = useState<CompanyData[]>(() => {
    const saved = localStorage.getItem('sna_companies_base');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Clean legacy placeholder mock data
          const cleaned = parsed.map((comp: CompanyData) => {
            const isOldMockCompany = 
              comp.name?.includes('ALPHA TECH') || 
              comp.name?.includes('ALFA TECH') ||
              comp.name?.includes('BETA DISTRIBUIDORA') ||
              comp.name?.includes('GAMMA ENGENHARIA');

            if (isOldMockCompany) {
              return {
                ...comp,
                partners: [],
              };
            }

            const cleanPartners = (comp.partners || []).filter((p) => {
              const nameLower = (p.name || '').toLowerCase();
              return !(
                nameLower.includes('sócio titular') ||
                nameLower.includes('roberto mendonça') ||
                nameLower.includes('carla mendonça') ||
                nameLower.includes('eduardo silveira') ||
                nameLower.includes('demonstrativo')
              );
            }).map((p) => ({
              ...p,
              otherCompanies: (p.otherCompanies || []).filter((o) => {
                const oNameLower = (o.name || '').toLowerCase();
                return !(
                  oNameLower.includes('nova empresa vinculada') ||
                  oNameLower.includes('beta distribuidora') ||
                  oNameLower.includes('gamma')
                );
              }),
            }));

            return {
              ...comp,
              partners: cleanPartners,
            };
          });

          return cleaned;
        }
      } catch (e) {
        console.error('Error loading saved companies', e);
      }
    }
    return PRESET_COMPANIES;
  });

  const [activeCompanyIndex, setActiveCompanyIndex] = useState<number>(0);

  // Active Company safe reference
  const currentCompany = companies[activeCompanyIndex] || companies[0] || PRESET_COMPANIES[0];

  // 4 Distinct System Views: 'master' | 'escritorio' | 'cliente_relatorio' | 'empresa'
  const [viewMode, setViewMode] = useState<AppViewMode>(() => {
    const savedMode = localStorage.getItem('sna_app_view_mode') as AppViewMode;
    if (savedMode && ['master', 'escritorio', 'cliente_relatorio', 'parceiro', 'empresa'].includes(savedMode)) {
      return savedMode;
    }
    return 'master';
  });

  // Auth and user state with MASTER VIP privileges
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    if (localStorage.getItem('sna_auth_logged_out') === 'true') {
      return null;
    }
    const savedUser = localStorage.getItem('sna_auth_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && (parsed.email === 'carlosmiguelvieira1@gmail.com' || parsed.role === 'master')) {
          return {
            ...parsed,
            role: 'master',
            plan: 'master_ilimitado',
            isMaster: true,
            viewMode: parsed.viewMode || 'master',
            maxQueriesPerMonth: 999999,
            planStatus: 'active',
            permissions: ['all', 'unlimited_queries', 'ai_auditor_master', 'export_reports', 'tax_reform_projections'],
          };
        }
        if (parsed && parsed.id) return parsed;
      } catch (e) {}
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<AppActiveTab>('dashboard');

  // Toast notification state
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Modals state
  const [isPDFUploadOpen, setIsPDFUploadOpen] = useState(false);
  const [isLegalGuideOpen, setIsLegalGuideOpen] = useState(false);
  const [isAIAuditorOpen, setIsAIAuditorOpen] = useState(false);
  const [isSystemTourOpen, setIsSystemTourOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isPublishShareOpen, setIsPublishShareOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCompanyManagerOpen, setIsCompanyManagerOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isPartnerPortalOpen, setIsPartnerPortalOpen] = useState(false);
  const [isDocumentValidatorOpen, setIsDocumentValidatorOpen] = useState(false);

  // Auto-open AuthModal if hash contains set-password or reset-password action
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.includes('action=set-password') || hash.includes('action=reset-password')) {
        setIsAuthModalOpen(true);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Safe sanitized current company
  const safeCurrentCompany: CompanyData = useMemo(() => {
    const base = currentCompany || PRESET_COMPANIES[0];
    return {
      ...base,
      name: base.name || 'Empresa em Auditoria',
      cnpj: base.cnpj || 'Sem dados disponíveis',
      cnae: base.cnae || 'Sem dados disponíveis',
      cnaeDescription: base.cnaeDescription || 'Sem dados disponíveis',
      uf: base.uf || 'SP',
      anexo: base.anexo || 'I',
      rbt12: (typeof base.rbt12 === 'number' && base.rbt12 > 0)
        ? base.rbt12
        : (typeof base.rba === 'number' && base.rba > 0
            ? base.rba
            : (base.rbt12 || 0)),
      rba: typeof base.rba === 'number' ? base.rba : (base.rbt12 || 0),
      monthlyRevenue: typeof base.monthlyRevenue === 'number' ? base.monthlyRevenue : ((base.rbt12 || 0) / 12),
      payroll12m: typeof base.payroll12m === 'number' ? base.payroll12m : 0,
      monthlyPayroll: typeof base.monthlyPayroll === 'number' ? base.monthlyPayroll : ((base.payroll12m || 0) / 12),
      partners: Array.isArray(base.partners) ? base.partners : [],
      cfopItems: Array.isArray(base.cfopItems) ? base.cfopItems : [],
      address: base.address,
      situacaoCadastral: base.situacaoCadastral || (base.rfbValidation?.situacaoCadastral),
      rfbValidation: base.rfbValidation,
    };
  }, [currentCompany]);

  // Real-time recalculated tax audit metrics (LC 123/06 & CFOP segregation engine)
  const calculation = useMemo(() => {
    return calculateTaxAudit(safeCurrentCompany);
  }, [safeCurrentCompany]);

  // Persist companies state to local storage
  const saveCompanies = (updated: CompanyData[]) => {
    setCompanies(updated);
    try {
      localStorage.setItem('sna_companies_base', JSON.stringify(updated));
    } catch (e) {
      console.error('Error persisting companies', e);
    }
  };

  const handleUpdateCurrentCompany = (updated: CompanyData) => {
    const newCompanies = [...companies];
    newCompanies[activeCompanyIndex] = updated;
    saveCompanies(newCompanies);
    showToast('Configurações da empresa salvas com sucesso!', 'success');
  };

  const handleSelectPreset = (preset: CompanyData) => {
    const idx = companies.findIndex(c => c.name === preset.name);
    if (idx >= 0) {
      setActiveCompanyIndex(idx);
    } else {
      const newCompanies = [...companies, preset];
      saveCompanies(newCompanies);
      setActiveCompanyIndex(newCompanies.length - 1);
    }
    showToast(`Empresa "${preset.name}" selecionada com sucesso!`, 'info');
  };

  const handleCreateCompany = (newComp: CompanyData) => {
    const newCompanies = [...companies, newComp];
    saveCompanies(newCompanies);
    setActiveCompanyIndex(newCompanies.length - 1);
    showToast('Nova empresa cadastrada com sucesso!', 'success');
  };

  const handleDeleteCompany = (indexToDelete: number) => {
    if (companies.length <= 1) return;
    const newCompanies = companies.filter((_, idx) => idx !== indexToDelete);
    saveCompanies(newCompanies);
    if (activeCompanyIndex >= newCompanies.length) {
      setActiveCompanyIndex(Math.max(0, newCompanies.length - 1));
    } else if (activeCompanyIndex === indexToDelete) {
      setActiveCompanyIndex(0);
    }
    showToast('Empresa removida da base com sucesso.', 'info');
  };

  const handleApplyExtractedData = (extracted: Partial<CompanyData>) => {
    // Determine if current company is the initial placeholder or already another registered company
    const isPlaceholder = safeCurrentCompany.name === 'Sem dados disponíveis' && (!safeCurrentCompany.cnpj || safeCurrentCompany.cnpj === 'Sem dados disponíveis');
    const isSameCnpj = !isPlaceholder && Boolean(extracted.cnpj && safeCurrentCompany.cnpj === extracted.cnpj);

    const baseCleanCompany: CompanyData = {
      id: isSameCnpj ? safeCurrentCompany.id : `comp-${Date.now()}`,
      name: extracted.name || 'Empresa Importada',
      cnpj: extracted.cnpj || 'Sem dados disponíveis',
      cnae: extracted.cnae || 'Sem dados disponíveis',
      cnaeDescription: extracted.cnaeDescription || 'Sem dados disponíveis',
      uf: extracted.uf || 'SP',
      city: extracted.city || extracted.address?.municipio,
      customIcmsRate: undefined,
      customIssRate: undefined,
      isTransportService: extracted.isTransportService ?? false,
      transportType: extracted.transportType,
      anexo: extracted.anexo || 'III',
      anexoRevenues: extracted.anexoRevenues,
      rbt12: (typeof extracted.rbt12 === 'number' && extracted.rbt12 > 0)
        ? extracted.rbt12
        : (typeof extracted.rba === 'number' && extracted.rba > 0
            ? extracted.rba
            : (typeof extracted.monthlyRevenue === 'number' && extracted.monthlyRevenue > 0 ? extracted.monthlyRevenue * 12 : (extracted.rbt12 ?? 0))),
      rba: extracted.rba ?? 0,
      rbaa: extracted.rbaa ?? 0,
      monthlyRevenue: extracted.monthlyRevenue ?? 0,
      exportMonthlyRevenue: extracted.exportMonthlyRevenue ?? 0,
      payroll12m: extracted.payroll12m ?? 0,
      monthlyPayroll: extracted.monthlyPayroll ?? 0,
      inputCostsPercent: 0,
      inputCostsMonthly: 0,
      operationalExpensesPercent: 0,
      operationalExpensesMonthly: 0,
      b2bSalesPercent: extracted.b2bSalesPercent ?? 0,
      partners: extracted.partners ?? [],
      cfopItems: [],
      address: extracted.address,
      situacaoCadastral: extracted.situacaoCadastral,
      rfbValidation: extracted.rfbValidation,
      projectionGrowthPercent: extracted.projectionGrowthPercent ?? 0,
      estimatedNetProfitMargin: extracted.estimatedNetProfitMargin ?? 0,
      targetIvaRate: extracted.targetIvaRate ?? 26.5,
      applyStateIcmsReduction: extracted.applyStateIcmsReduction ?? false,
      isStartOfActivity: extracted.isStartOfActivity ?? false,
      activityStartMonths: extracted.activityStartMonths,
      subjectToFatorR: extracted.subjectToFatorR ?? false,
      simulationHistory: isSameCnpj 
        ? [...(safeCurrentCompany.simulationHistory || []), ...(extracted.simulationHistory || [])] 
        : (extracted.simulationHistory || []),
      keepSimulationHistory: extracted.keepSimulationHistory ?? true,
      createdAt: isSameCnpj ? safeCurrentCompany.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isPlaceholder || isSameCnpj) {
      handleUpdateCurrentCompany(baseCleanCompany);
    } else {
      // Add as a new distinct company in the multi-company catalog
      const newCompanies = [...companies, baseCleanCompany];
      saveCompanies(newCompanies);
      setActiveCompanyIndex(newCompanies.length - 1);
    }
  };

  const handlePrintReport = () => {
    setActiveTab('parecer');
    setTimeout(() => {
      window.print();
    }, 400);
  };

  const handleResetToDefault = () => {
    saveCompanies(PRESET_COMPANIES);
    setActiveCompanyIndex(0);
  };

  const handleSelectViewMode = (newMode: AppViewMode) => {
    setViewMode(newMode);
    try {
      localStorage.setItem('sna_app_view_mode', newMode);
    } catch (e) {}

    setAuthUser(prev => {
      const updated: AuthUser = {
        ...prev!,
        viewMode: newMode,
      };
      try {
        localStorage.setItem('sna_auth_user', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (newMode === 'cliente_relatorio') {
      setActiveTab('parecer');
    } else if (newMode === 'empresa') {
      setActiveTab('agenda_fiscal');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    localStorage.setItem('sna_auth_logged_out', 'true');
    try {
      sessionStorage.removeItem('vertice_intro_splash_seen');
    } catch {}
    setAuthUser(null);
    setIsAuthModalOpen(false);
  };

  const handleSaveAuthUser = (user: AuthUser) => {
    localStorage.removeItem('sna_auth_logged_out');
    const targetMode: AppViewMode = user.viewMode || (user.role === 'master' ? 'master' : user.role === 'cliente_relatorio' ? 'cliente_relatorio' : 'escritorio');
    const completeUser: AuthUser = {
      ...user,
      viewMode: targetMode,
    };
    setAuthUser(completeUser);
    setViewMode(targetMode);
    try {
      localStorage.setItem('sna_auth_user', JSON.stringify(completeUser));
      localStorage.setItem('sna_app_view_mode', targetMode);
    } catch (e) {}

    if (targetMode === 'cliente_relatorio') {
      setActiveTab('parecer');
    } else if (targetMode === 'escritorio' && activeTab === 'gestao_planos') {
      setActiveTab('dashboard');
    }
  };

  // Centralized Module Registry with Role-Based Access Filtering
  const renderActiveModule = () => {
    const { allowed, reason } = canUserAccessTab(authUser, activeTab);

    if (!allowed && !authUser?.isMaster) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 space-y-6 bg-[#0F172A] border border-slate-800 rounded-3xl shadow-2xl">
          <div className="p-5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <Lock className="w-12 h-12" />
          </div>
          <div className="space-y-2 max-w-md">
            <h2 className="text-2xl font-bold text-white">Módulo Bloqueado</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              {reason || 'Seu perfil de acesso atual não possui permissão para visualizar este módulo técnico.'}
            </p>
          </div>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition shadow-lg"
          >
            Voltar ao Dashboard
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            company={safeCurrentCompany}
            onChangeCompany={handleUpdateCurrentCompany}
            calculation={calculation}
            onNavigateToTab={setActiveTab}
            onOpenManual={() => setIsManualOpen(true)}
            onOpenPDFUpload={() => setIsPDFUploadOpen(true)}
            isMaster={authUser?.role === 'master' || authUser?.isMaster || authUser?.email === 'carlosmiguelvieira1@gmail.com'}
            viewMode={viewMode}
            showToast={showToast}
          />
        );

      case 'financeiro':
        return (
          <FinancialDashboardView
            company={safeCurrentCompany}
            onChangeCompany={handleUpdateCurrentCompany}
            calculation={calculation}
            onNavigateToTab={setActiveTab}
          />
        );

      case 'financeiro_gerencial':
      case 'balancete_dre':
        return (
          <FinancialStatementsView
            currentCompany={safeCurrentCompany}
            onUpdateCompany={handleUpdateCurrentCompany}
          />
        );

      case 'gestao_planos':
        return <AdminPlansBillingView currentUser={authUser!} />;

      case 'emissao_nfse':
      case 'nfse':
        return (
          <CommercialNfseModule
            currentCompany={safeCurrentCompany}
            authUser={authUser}
            viewMode={viewMode}
            showToast={showToast}
          />
        );

      case 'contratos':
        return (
          <ServiceContractsModule 
            currentCompany={safeCurrentCompany}
            currentUser={authUser!}
          />
        );

      case 'bpo':
      case 'bpo_financeiro':
        return (
          <BPOFinanceiroView
            company={safeCurrentCompany}
            calculation={calculation}
          />
        );

      case 'regimes':
        return (
          <TaxRegimeAnalyzerView
            company={safeCurrentCompany}
            onChangeCompany={handleUpdateCurrentCompany}
            calculation={calculation}
            onNavigateToTab={setActiveTab}
          />
        );

      case 'projecao':
        return (
          <ProjectedSimulationView
            company={safeCurrentCompany}
            onChangeCompany={handleUpdateCurrentCompany}
            calculation={calculation}
            onNavigateToTab={setActiveTab}
          />
        );

      case 'historico':
        return (
          <SimulationHistoryView
            company={safeCurrentCompany}
            companies={companies}
            calculation={calculation}
            onChangeCompany={handleUpdateCurrentCompany}
            onNavigateToTab={setActiveTab}
          />
        );

      case 'cfop':
        return (
          <CFOPTaxSegregationView
            company={safeCurrentCompany}
            onChangeCompany={handleUpdateCurrentCompany}
            calculation={calculation}
          />
        );

      case 'socios':
        return (
          <PartnersManager
            company={safeCurrentCompany}
            onChangeCompany={handleUpdateCurrentCompany}
            calculation={calculation}
          />
        );

      case 'fator_r':
        return (
          <FatorRCalculator
            company={safeCurrentCompany}
            onChangeCompany={handleUpdateCurrentCompany}
            calculation={calculation}
          />
        );

      case 'reforma':
        return (
          <ReformaTributariaSection
            company={safeCurrentCompany}
            onChangeCompany={handleUpdateCurrentCompany}
            calculation={calculation}
          />
        );

      case 'parecer':
        return (
          <TechnicalReport
            company={safeCurrentCompany}
            calculation={calculation}
            onPrint={handlePrintReport}
            onBack={() => setActiveTab('dashboard')}
          />
        );

      case 'ncm_consulta':
        return (
          <NCMConsultationView
            currentCompany={safeCurrentCompany}
            calculation={calculation}
            onNavigateToCFOP={() => setActiveTab('cfop')}
            onNavigateToRegimes={() => setActiveTab('regimes')}
          />
        );

      case 'servicos_consulta':
        return (
          <ServiceCodeConsultationView
            currentCompany={safeCurrentCompany}
            calculation={calculation}
            onNavigateToFatorR={() => setActiveTab('fator_r')}
            onNavigateToRegimes={() => setActiveTab('regimes')}
          />
        );

      case 'societario':
        return (
          <SocietarioView
            currentCompany={safeCurrentCompany}
            onUpdateCompany={handleUpdateCurrentCompany}
          />
        );

      case 'conhecimentos':
        return (
          <ConhecimentosView
            currentCompany={safeCurrentCompany}
            onNavigateToDireito={() => setActiveTab('direito')}
          />
        );

      case 'direito':
        return (
          <DireitoView
            currentCompany={safeCurrentCompany}
            onNavigateToConhecimentos={() => setActiveTab('conhecimentos')}
          />
        );

      case 'portal_parceiro':
      case 'parceiros':
        return (
          <PartnerPortalView
            currentUser={authUser!}
            onUpdateCurrentUser={(updated) => setAuthUser(prev => prev ? ({ ...prev, ...updated }) : null)}
            onNavigateToTab={(tab: any) => setActiveTab(tab)}
            onClose={() => setActiveTab('dashboard')}
            isFullModulePage={true}
          />
        );

      case 'agenda_fiscal':
        return (
          <AgendaFiscalView
            currentCompany={safeCurrentCompany}
          />
        );

      case 'consultas_fiscais':
        return (
          <NCMServiceLookupView
            currentCompany={safeCurrentCompany}
            calculation={calculation}
          />
        );

      default:
        return (
          <DashboardView
            company={safeCurrentCompany}
            onChangeCompany={handleUpdateCurrentCompany}
            calculation={calculation}
            onNavigateToTab={setActiveTab}
            onOpenManual={() => setIsManualOpen(true)}
            onOpenPDFUpload={() => setIsPDFUploadOpen(true)}
            isMaster={authUser?.role === 'master' || authUser?.isMaster}
            viewMode={viewMode}
            showToast={showToast}
          />
        );
    }
  };

  if (!authUser) {
    return (
      <ReactLenis root>
        <ErrorBoundary>
          <LandingWelcomePortal
            forceInitialSplash={true}
            onLogin={(user) => {
              handleSaveAuthUser(user);
            }}
          />
        </ErrorBoundary>
      </ReactLenis>
    );
  }

  return (
    <ReactLenis root>
      <ErrorBoundary>
        <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white font-sans relative">
        
        {/* Animated Cosmic Prisma Ambient Background (Similar to Pre-Screen) */}
        <CosmicPrismaBackground />

        {/* Navigation Header */}
        <div className="relative z-10 flex flex-col flex-1">
          <Navbar
          currentCompany={safeCurrentCompany}
          companies={companies}
          onSelectPreset={handleSelectPreset}
          onOpenPDFUpload={() => setIsPDFUploadOpen(true)}
          onPrintReport={handlePrintReport}
          onOpenAIAuditor={() => setIsAIAuditorOpen(true)}
          onResetToDefault={handleResetToDefault}
          calculation={calculation}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenLegalGuide={() => setIsLegalGuideOpen(true)}
          onOpenSystemTour={() => setIsSystemTourOpen(true)}
          onOpenManual={() => setIsManualOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenPublishShare={() => setIsPublishShareOpen(true)}
          onOpenCompanyManager={() => setIsCompanyManagerOpen(true)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenDocumentValidator={() => setIsDocumentValidatorOpen(true)}
          authUser={authUser}
          viewMode={viewMode}
          onSelectViewMode={handleSelectViewMode}
          onLogout={handleLogout}
          onOpenPartnerPortal={() => setIsPartnerPortalOpen(true)}
        />

        {/* Main App Container */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderActiveModule()}
            </motion.div>
          </main>

        {/* Footer (Hidden when printing) Comfortable Dark theme */}
        <footer className="no-print border-t border-slate-800/80 bg-[#0B0F19] py-4 text-xs font-mono text-slate-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="font-semibold text-slate-300">VÉRTICE AUDITOR FISCAL // Inteligência Tributária & Auditoria Pericial</span>
            <div className="flex items-center space-x-3 text-slate-400">
              <span className="text-emerald-400 font-semibold">LC 123/6006</span>
              <span>•</span>
              <span className="text-amber-400 font-semibold">CFOP Segregação ST/ISS</span>
              <span>•</span>
              <span className="text-blue-400 font-semibold">EC 132/6023 (IBS/CBS)</span>
            </div>
            <span className="text-slate-500">Status: Conforme & Homologado</span>
          </div>
        </footer>

        {/* Modals */}
        <PDFUploadModal
          isOpen={isPDFUploadOpen}
          onClose={() => setIsPDFUploadOpen(false)}
          onApplyExtractedData={handleApplyExtractedData}
        />

        <LegalGuideModal
          isOpen={isLegalGuideOpen}
          onClose={() => setIsLegalGuideOpen(false)}
        />

        <AIAuditorModal
          isOpen={isAIAuditorOpen}
          onClose={() => setIsAIAuditorOpen(false)}
          company={safeCurrentCompany}
          calculation={calculation}
        />

        <SystemTourModal
          isOpen={isSystemTourOpen}
          onClose={() => setIsSystemTourOpen(false)}
        />

        <SystemStepByStepManualModal
          isOpen={isManualOpen}
          onClose={() => setIsManualOpen(false)}
          onNavigateToTab={(tab) => {
            setActiveTab(tab);
            setIsManualOpen(false);
          }}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          currentUser={authUser}
          onLogin={handleSaveAuthUser}
          onLogout={handleLogout}
          onUpgradePlan={(newPlan) => {
            handleSaveAuthUser({
              ...authUser,
              plan: newPlan,
              planStatus: 'active',
            });
          }}
          onOpenPartnerPortal={() => {
            setIsAuthModalOpen(false);
            setIsPartnerPortalOpen(true);
          }}
        />

        <PartnerPortalModal
          isOpen={isPartnerPortalOpen}
          onClose={() => setIsPartnerPortalOpen(false)}
          currentUser={authUser}
          onUpdateCurrentUser={(updated) => {
            handleSaveAuthUser({
              ...authUser,
              ...updated
            });
          }}
        />

        <CompanyManagerModal
          isOpen={isCompanyManagerOpen}
          onClose={() => setIsCompanyManagerOpen(false)}
          companies={companies}
          activeCompanyIndex={activeCompanyIndex}
          onSelectCompany={setActiveCompanyIndex}
          onCreateCompany={handleCreateCompany}
          onDeleteCompany={handleDeleteCompany}
          onOpenPDFUpload={() => {
            setIsCompanyManagerOpen(false);
            setIsPDFUploadOpen(true);
          }}
        />

        <PrivacyLGPDModal
          isOpen={isPrivacyModalOpen}
          onClose={() => setIsPrivacyModalOpen(false)}
        />

        <TaxNewsAndNotificationCenter
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          showToast={showToast}
        />

        <PublishShareModal
          isOpen={isPublishShareOpen}
          onClose={() => setIsPublishShareOpen(false)}
          showToast={showToast}
        />

        <DocumentValidatorModal
          isOpen={isDocumentValidatorOpen}
          onClose={() => setIsDocumentValidatorOpen(false)}
          currentCompany={safeCurrentCompany}
        />

        {/* Removed EmailDispatchNotifierModal */}

        {/* Professional Footer Bar */}
        <div className="mt-auto py-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 px-4">
          <div>
            <span>© 2026 Vértice Auditor Fiscal - Auditoria Tributária • Sistema Inteligente de Planejamento Tributário & Reforma Dual</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDocumentValidatorOpen(true)}
              className="hover:text-emerald-400 text-emerald-400/90 transition cursor-pointer flex items-center gap-1.5 font-semibold"
              title="Auditar autenticidade jurídica de laudos periciais emitidos"
            >
              🛡️ Validador de Laudos (ICP-Brasil)
            </button>
            <span>•</span>
            <button
              onClick={() => setIsPublishShareOpen(true)}
              className="hover:text-emerald-400 transition cursor-pointer flex items-center gap-1.5 font-semibold text-slate-400"
            >
              🌐 Link & Publicação
            </button>
            <span>•</span>
            <button
              onClick={() => setIsPrivacyModalOpen(true)}
              className="hover:text-blue-400 transition cursor-pointer flex items-center gap-1.5"
            >
              🔒 Privacidade, LGPD & Termos
            </button>
            <span>•</span>
            <span className="text-emerald-400 font-mono">Status: LGPD Compliant</span>
          </div>
        </div>

        {/* Toast Notification Container (Bottom Right) */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] border border-blue-500/50 shadow-2xl rounded-xl px-4 py-3 flex items-center gap-3 text-slate-100 animate-in slide-in-from-bottom-5 duration-200">
            <div className={`w-2.5 h-2.5 rounded-full ${toast.type === 'error' ? 'bg-red-500' : toast.type === 'info' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
            <span className="text-xs font-semibold">{toast.text}</span>
          </div>
        )}
        </div>
      </div>
    </ErrorBoundary>
    </ReactLenis>
  );
}

