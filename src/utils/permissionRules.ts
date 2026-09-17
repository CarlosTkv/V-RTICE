import { AuthUser, AppActiveTab, PlanAllowedModules, PlatformPlan } from '../types';

export const DEFAULT_PLAN_MODULES: Record<PlatformPlan, PlanAllowedModules> = {
  starter: {
    dashboard: true,
    auditoria_digital: true,
    planejamento_tributario: false,
    financeiro_gerencial: false,
    consultoria_fiscal: false,
    legal_societario: false,
    agenda_fiscal: true,
    emissao_nfse: true,
    pgdas_import: true,
    ai_auditor: false,
    regimes: true,
    fator_r: true,
    socios: true,
    projecao: false,
    cfop: false,
    reforma: false,
    ncm_consulta: false,
    servicos_consulta: false,
    societario: false,
    bpo: false,
    consultas: true,
    conhecimentos: true,
    direito: false,
    reforma_tributaria: false
  },
  pro: {
    dashboard: true,
    auditoria_digital: true,
    planejamento_tributario: true,
    financeiro_gerencial: false,
    consultoria_fiscal: true,
    legal_societario: false,
    agenda_fiscal: true,
    emissao_nfse: true,
    pgdas_import: true,
    ai_auditor: true,
    regimes: true,
    fator_r: true,
    socios: true,
    projecao: true,
    cfop: true,
    reforma: true,
    ncm_consulta: true,
    servicos_consulta: true,
    societario: false,
    bpo: false,
    consultas: true,
    conhecimentos: true,
    direito: false,
    reforma_tributaria: true
  },
  enterprise: {
    dashboard: true,
    auditoria_digital: true,
    planejamento_tributario: true,
    financeiro_gerencial: true,
    consultoria_fiscal: true,
    legal_societario: true,
    agenda_fiscal: true,
    emissao_nfse: true,
    pgdas_import: true,
    ai_auditor: true,
    regimes: true,
    fator_r: true,
    socios: true,
    projecao: true,
    cfop: true,
    reforma: true,
    ncm_consulta: true,
    servicos_consulta: true,
    societario: true,
    bpo: true,
    consultas: true,
    conhecimentos: true,
    direito: true,
    reforma_tributaria: true
  },
  master: {
    dashboard: true,
    auditoria_digital: true,
    planejamento_tributario: true,
    financeiro_gerencial: true,
    consultoria_fiscal: true,
    legal_societario: true,
    agenda_fiscal: true,
    emissao_nfse: true,
    pgdas_import: true,
    ai_auditor: true,
    partner_portal: true,
    regimes: true,
    fator_r: true,
    socios: true,
    projecao: true,
    cfop: true,
    reforma: true,
    ncm_consulta: true,
    servicos_consulta: true,
    societario: true,
    bpo: true,
    consultas: true,
    conhecimentos: true,
    direito: true,
    reforma_tributaria: true
  },
  custom_master: {
    dashboard: true,
    auditoria_digital: true,
    planejamento_tributario: true,
    financeiro_gerencial: true,
    consultoria_fiscal: true,
    legal_societario: true,
    agenda_fiscal: true,
    emissao_nfse: true,
    pgdas_import: true,
    ai_auditor: true,
    partner_portal: true,
    regimes: true,
    fator_r: true,
    socios: true,
    projecao: true,
    cfop: true,
    reforma: true,
    ncm_consulta: true,
    servicos_consulta: true,
    societario: true,
    bpo: true,
    consultas: true,
    conhecimentos: true,
    direito: true,
    reforma_tributaria: true
  },
  parceiro_isento: {
    dashboard: true,
    auditoria_digital: true,
    planejamento_tributario: true,
    financeiro_gerencial: true,
    consultoria_fiscal: true,
    legal_societario: true,
    agenda_fiscal: true,
    emissao_nfse: true,
    pgdas_import: true,
    ai_auditor: true,
    partner_portal: true,
    regimes: true,
    fator_r: true,
    socios: true,
    projecao: true,
    cfop: true,
    reforma: true,
    ncm_consulta: true,
    servicos_consulta: true,
    societario: true,
    bpo: true,
    consultas: true,
    conhecimentos: true,
    direito: true,
    reforma_tributaria: true
  },
};

/**
 * Normaliza o ID do plano
 */
export function normalizePlanId(planId?: string): PlatformPlan {
  if (!planId) return 'pro';
  const clean = planId.toLowerCase().trim();
  if (clean.includes('parceiro')) return 'parceiro_isento';
  if (clean.includes('starter')) return 'starter';
  if (clean.includes('pro')) return 'pro';
  if (clean.includes('enterprise')) return 'enterprise';
  if (clean.includes('master')) return 'master';
  if (clean.includes('custom') || clean.includes('personalizado')) return 'custom_master';
  return 'pro';
}

/**
 * Verifica se o usuário é Desenvolvedor (acesso irrestrito e exclusivo à gestão de faturas e faturamento)
 */
export function isDeveloperUser(user: AuthUser | null): boolean {
  if (!user) return false;
  return (
    user.role === 'desenvolvedor' ||
    user.isDeveloper === true ||
    user.email.toLowerCase() === 'contato@verticeanalises.com.br' ||
    user.email.toLowerCase() === 'carlosmiguelvieira1@gmail.com'
  );
}

/**
 * Verifica se o usuário pode acessar o módulo de faturamento da plataforma (faturas, banco, assinaturas)
 */
export function canUserAccessPlatformBilling(user: AuthUser | null): boolean {
  if (!user) return false;
  if (isDeveloperUser(user)) return true;
  return user.canAccessPlatformBilling === true;
}

/**
 * Verifica se o usuário pode verificar e aprovar clientes
 */
export function canUserVerifyClients(user: AuthUser | null): boolean {
  if (!user) return false;
  if (isDeveloperUser(user)) return true;
  return user.canVerifyClients === true;
}

/**
 * Obtém os módulos permitidos para um usuário de acordo com o plano ou configurações customizadas
 */
export function getUserAllowedModules(user: AuthUser | null): PlanAllowedModules {
  if (!user) {
    return DEFAULT_PLAN_MODULES.starter;
  }

  // Desenvolvedor e Master têm acesso a todas as ferramentas técnicas
  if (isDeveloperUser(user) || user.isMaster || user.role === 'master') {
    return { ...DEFAULT_PLAN_MODULES.master };
  }

  // Parceiro de Negócios tem acesso completo e ao portal do parceiro
  if (user.role === 'parceiro_negocios' || user.plan === 'parceiro_isento' || user.isPartnerActive) {
    return { ...DEFAULT_PLAN_MODULES.parceiro_isento };
  }

  // Se o usuário possui módulos customizados definidos explicitamente pelo Master
  if (user.allowedModules) {
    return {
      ...DEFAULT_PLAN_MODULES.starter,
      ...user.allowedModules
    };
  }

  const planKey = normalizePlanId(user.plan);
  return DEFAULT_PLAN_MODULES[planKey] || DEFAULT_PLAN_MODULES.pro;
}

/**
 * Verifica se um usuário pode acessar uma determinada aba do sistema
 */
export function canUserAccessTab(user: AuthUser | null, tab: AppActiveTab): { allowed: boolean; reason?: string } {
  if (!user) {
    return { allowed: false, reason: 'É necessário efetuar login para acessar os recursos.' };
  }

  const isDev = isDeveloperUser(user);
  const isMaster = isDev || user.isMaster || user.role === 'master';
  const role = user.role;
  const viewMode = user.viewMode;

  // 1. GESTÃO DE PLANOS, CONTRATOS E FATURAMENTO DA PLATAFORMA
  // Exclusivo do Desenvolvedor (Carlos Miguel) ou de quem ele explicitamente liberar!
  if (tab === 'gestao_planos' || tab === 'contratos') {
    if (canUserAccessPlatformBilling(user)) {
      return { allowed: true };
    }
    return { 
      allowed: false, 
      reason: 'O módulo de Gestão de Planos, Geração de Faturas e Faturamento da Plataforma é exclusivo do perfil Desenvolvedor (Carlos Miguel). Apenas usuários com liberação expressa têm permissão para faturamento.' 
    };
  }

  // Desenvolvedor tem acesso livre a todas as demais abas
  if (isDev) {
    return { allowed: true };
  }

  // 2. PERFIL AUDITOR: Focado em Auditoria Digital, Fator R, Sócios e Pareceres
  if (role === 'auditor' || viewMode === 'auditor' || role === 'auditor_fiscal') {
    const allowedAuditorTabs: AppActiveTab[] = [
      'dashboard',
      'auditoria_digital',
      'fator_r',
      'socios',
      'parecer',
      'consultoria_fiscal',
      'cfop',
      'ncm_consulta',
      'servicos_consulta',
      'agenda_fiscal',
      'balancete_dre',
      'consultas',
      'conhecimentos',
      'pgdas_import'
    ];
    if (allowedAuditorTabs.includes(tab)) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'Acesso restrito para o perfil Auditor. Este recurso pertence aos módulos de planejamento tributário ou gestão financeira.'
    };
  }

  // 3. PERFIL ANALISTA: Focado em Planejamento Tributário, Regimes e Consultas Fiscais
  if (role === 'analista' || viewMode === 'analista' || role === 'assistente_fiscal') {
    const allowedAnalystTabs: AppActiveTab[] = [
      'dashboard',
      'planejamento_tributario',
      'regimes',
      'reforma',
      'projecao',
      'parecer',
      'consultoria_fiscal',
      'cfop',
      'ncm_consulta',
      'servicos_consulta',
      'agenda_fiscal',
      'balancete_dre',
      'consultas',
      'conhecimentos',
      'pgdas_import'
    ];
    if (allowedAnalystTabs.includes(tab)) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'Acesso restrito para o perfil Analista Fiscal.'
    };
  }

  // 4. PERFIL EMPRESA: Acesso Simplificado (visão da própria empresa, notas fiscais, agenda e relatórios)
  const isEmpresa = viewMode === 'empresa' || role === 'empresa' || role === 'cliente_empresa';
  if (isEmpresa) {
    const allowedEmpresaTabs: AppActiveTab[] = [
      'dashboard', 
      'agenda_fiscal', 
      'consultoria_fiscal', 
      'ncm_consulta', 
      'servicos_consulta', 
      'financeiro_gerencial', 
      'balancete_dre',
      'parecer',
      'emissao_nfse',
      'nfse'
    ];
    
    if (allowedEmpresaTabs.includes(tab)) {
      return { allowed: true };
    }
    
    return { 
      allowed: false, 
      reason: 'Acesso restrito. Este módulo técnico é operado exclusivamente pelo seu Escritório Contábil ou Auditor para garantir a segurança jurídica dos cálculos.' 
    };
  }

  // 5. PERFIL ESCRITÓRIO: Acesso a todas as ferramentas operacionais de contabilidade e consultoria
  if (role === 'escritorio' || viewMode === 'escritorio' || role === 'contador_senior') {
    const blockedEscritorioTabs: AppActiveTab[] = [
      'gestao_planos',
      'contratos'
    ];
    
    if (blockedEscritorioTabs.includes(tab)) {
      return {
        allowed: false,
        reason: 'Módulo administrativo restrito ao Desenvolvedor do sistema.'
      };
    }
    return { allowed: true };
  }

  // Master tem acesso às demais abas técnicas
  if (isMaster) {
    return { allowed: true };
  }

  const allowedMods = getUserAllowedModules(user);

  switch (tab) {
    case 'dashboard':
      return { allowed: allowedMods.dashboard, reason: 'Dashboard bloqueado no seu plano atual.' };
    
    case 'auditoria_digital':
    case 'fator_r':
    case 'socios':
      return { allowed: allowedMods.auditoria_digital, reason: 'O Módulo de Auditoria Digital requer o plano Starter ou superior.' };
    
    case 'planejamento_tributario':
    case 'regimes':
    case 'reforma':
    case 'projecao':
    case 'parecer':
      return { allowed: allowedMods.planejamento_tributario, reason: 'O Planejamento Tributário Avançado requer o plano Pro ou superior.' };
    
    case 'financeiro_gerencial':
    case 'financeiro':
    case 'balancete_dre':
    case 'bpo':
    case 'bpo_financeiro':
      return { allowed: allowedMods.bpo, reason: 'O módulo de BPO Financeiro requer o plano Enterprise.' };
    
    case 'consultoria_fiscal':
    case 'ncm_consulta':
    case 'servicos_consulta':
    case 'cfop':
      return { allowed: allowedMods.consultoria_fiscal, reason: 'A Consultoria Fiscal Técnica requer o plano Pro ou superior.' };
    
    case 'legal_societario':
    case 'societario':
    case 'direito':
      return { allowed: allowedMods.legal_societario, reason: 'O módulo Legal & Societário requer o plano Enterprise.' };
    
    case 'agenda_fiscal':
      return { allowed: allowedMods.agenda_fiscal, reason: 'Agenda Fiscal bloqueada no plano.' };
    
    case 'emissao_nfse':
    case 'nfse':
      return { allowed: allowedMods.emissao_nfse ?? allowedMods.nfse_module ?? true, reason: 'O Módulo de Emissão de NFS-e Nacional requer liberação no plano.' };
    
    case 'portal_parceiro':
    case 'parceiros':
      if (isMaster || user.role === 'parceiro_negocios' || user.isPartnerActive || allowedMods.partner_portal) {
        return { allowed: true };
      }
      return { 
        allowed: false, 
        reason: 'O Portal do Parceiro é exclusivo para Parceiros Homologados.' 
      };
      
    default:
      return { allowed: true };
  }
}

/**
 * Retorna o limite máximo de empresas cadastradas permitido para o usuário
 */
export function getMaxCompaniesForUser(user: AuthUser | null): number {
  if (!user) return 1;
  if (user.isMaster || user.role === 'master' || user.email.toLowerCase() === 'contato@verticeanalises.com.br' || user.email.toLowerCase() === 'carlosmiguelvieira1@gmail.com') {
    return 9999;
  }
  if (user.maxCompaniesAllowed && user.maxCompaniesAllowed > 0) {
    return user.maxCompaniesAllowed;
  }
  const planKey = normalizePlanId(user.plan);
  if (planKey === 'starter') return 5;
  if (planKey === 'pro') return 30;
  if (planKey === 'enterprise') return 120;
  if (planKey === 'custom_master') return 50;
  return 10;
}
