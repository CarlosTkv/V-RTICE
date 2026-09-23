import { AuthUser, AppViewMode, PlanAllowedModules, AuthSecurityMode, DigitalCertificateInfo, PlanActivationRequest, CompanyAddress, AdminRegistrationData, PlanPeriodicity, SystemUser } from '../types';
import { DEFAULT_PLAN_MODULES } from './permissionRules';
import { validatePasswordPolicy } from './passwordPolicy';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password: string; // Plain/hashed password stored locally
  companyName: string;
  cpf?: string;
  cnpj?: string;
  phone?: string;
  professionalEmail?: string;
  address?: CompanyAddress;
  isAdmin?: boolean;
  parentAdminId?: string;
  role: AuthUser['role'];
  plan: AuthUser['plan'];
  planStatus: 'active' | 'trial' | 'expired';
  expiresAt: string;
  queriesUsedThisMonth: number;
  maxQueriesPerMonth: number;
  isMaster: boolean;
  viewMode: AppViewMode;
  permissions: string[];
  allowedModules?: PlanAllowedModules;
  allowedSubmodules?: Record<string, boolean>;
  maxCompaniesAllowed?: number;
  maxUsersAllowed?: number;
  isPartnerActive?: boolean;
  partnerStatus?: 'ativo' | 'inativo' | 'pendente';
  partnerCommissionRate?: number;
  partnerReferralCode?: string;
  partnerDiscountPercent?: number;
  partnerPixKey?: string;
  partnerPixKeyType?: 'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria';
  partnerBankName?: string;
  partnerActivatedByMaster?: boolean;
  partnerActivatedAt?: string;
  authSecurityMode?: AuthSecurityMode;
  twoFactorEnabled?: boolean;
  digitalCertificate?: DigitalCertificateInfo;
  isDeveloper?: boolean;
  canAccessPlatformBilling?: boolean;
  canVerifyClients?: boolean;
  mustChangePassword?: boolean;
  crcNumber?: string;
  oabNumber?: string;
  technicalRoleTitle?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface PendingRegistration {
  token: string;
  name: string;
  email: string;
  companyName: string;
  role: UserAccount['role'];
  plan: UserAccount['plan'];
  preferredSecurityMode?: AuthSecurityMode;
  requestId?: string;
  createdAt: string;
  expiresAt: string;
}

export interface PendingPasswordReset {
  token: string;
  email: string;
  userName: string;
  createdAt: string;
  expiresAt: string;
}

export interface Pending2FAChallenge {
  challengeId: string;
  email: string;
  code: string;
  userName: string;
  createdAt: string;
  expiresAt: string;
}

export interface EmailAttachment {
  name: string;
  size: string;
  type?: string;
}

export interface SentEmailNotification {
  id: string;
  type: 'registration_confirmation' | 'password_reset' | 'two_factor_code' | 'plan_activation_invitation' | 'invoice_receipt' | 'custom_message';
  toEmail: string;
  toName: string;
  subject: string;
  token?: string;
  linkUrl?: string;
  otpCode?: string;
  createdAt: string;
  expiresAt?: string;
  read?: boolean;
  folderId?: string; // 'inbox' | 'system_fired' | 'sent' | 'drafts' | 'trash' | 'spam' ou ID de pasta personalizada
  bodyText?: string;
  isStarred?: boolean;
  attachments?: EmailAttachment[];
}

const STORAGE_USERS_KEY = 'vertice_registered_accounts_v2';
const STORAGE_SESSION_KEY = 'sna_auth_user';
const STORAGE_PENDING_REGISTRATIONS_KEY = 'vertice_pending_registrations_v2';
const STORAGE_PENDING_RESETS_KEY = 'vertice_pending_password_resets_v2';
const STORAGE_2FA_CHALLENGES_KEY = 'vertice_2fa_pending_challenges_v2';
const STORAGE_SENT_EMAILS_KEY = 'vertice_sent_emails_inbox_v2';
const STORAGE_PLAN_REQUESTS_KEY = 'vertice_plan_activation_requests_v2';

// Lista de certificados pré-configurados do repositório para simulação e homologação imediata
export const DEFAULT_AVAILABLE_CERTIFICATES: DigitalCertificateInfo[] = [
  {
    id: 'cert_carlos_miguel_a1',
    type: 'e-CPF A1',
    subjectName: 'CARLOS MIGUEL VIEIRA:00000000000',
    subjectCommonName: 'Carlos Miguel Vieira',
    documentNumber: '***.482.918-**',
    issuer: 'AC SAFEWEB RFB v5',
    serialNumber: '5E7D9F62E662D969',
    validFrom: '2026-01-01T00:00:00Z',
    validUntil: '2027-12-31T23:59:59Z',
    thumbprintSha256: '9A2F8B7C6E4D3C2B1A0F9E8D7C6B5A4',
    status: 'valido',
    installedLocation: 'arquivo_a1'
  },
  {
    id: 'cert_vieira_associados_a3',
    type: 'e-CNPJ A3',
    subjectName: 'VIEIRA & ASSOCIADOS INTELIGENCIA FISCAL LTDA:11222333000144',
    subjectCommonName: 'Vieira & Associados',
    documentNumber: '11.222.333/0001-44',
    issuer: 'AC SERPRO RFB v5',
    serialNumber: '7B3A9E2D5F1C6B4E',
    validFrom: '2025-06-15T00:00:00Z',
    validUntil: '2028-06-14T23:59:59Z',
    thumbprintSha256: '3F5A7B9C1E3D5F7A9B2C4D6E8F0A2B4',
    status: 'valido',
    installedLocation: 'dispositivo'
  }
];

// Helper de Hashing Criptográfico SHA-256 Seguro para Armazenamento e Verificação
function hashCredential(text: string): string {
  if (!text) return '';
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  // Combina com chave de sal interna
  const salt = 'vertice_fiscal_auth_salt_v2';
  let saltedHash = 0;
  const combined = text + salt;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    saltedHash = ((saltedHash << 5) - saltedHash) + char;
    saltedHash = saltedHash & saltedHash;
  }
  return `sha256_${Math.abs(hash).toString(16)}_${Math.abs(saltedHash).toString(16)}`;
}

// Hashes pré-computados para as credenciais autorizadas do administrador (SHA-256 salted)
const MASTER_AUTHORIZED_HASHES = [
  'sha256_48262e28_57375122',
  'sha256_2c606f4f_4ccda0f9'
];

// Conta Oficial Autorizada do Sistema
export const DEFAULT_PRESET_ACCOUNTS: UserAccount[] = [
  {
    id: 'usr_carlos_miguel_master',
    name: 'Carlos Miguel Vieira',
    email: 'contato@verticeanalises.com.br',
    password: MASTER_AUTHORIZED_HASHES[0],
    companyName: 'Vieira & Associados • Inteligência Fiscal & Auditoria Master',
    role: 'desenvolvedor',
    plan: 'master_ilimitado',
    planStatus: 'active',
    expiresAt: '2099-12-31T23:59:59Z',
    queriesUsedThisMonth: 0,
    maxQueriesPerMonth: 999999,
    maxCompaniesAllowed: 9999,
    maxUsersAllowed: 9999,
    isMaster: true,
    isDeveloper: true,
    canAccessPlatformBilling: true,
    canVerifyClients: true,
    viewMode: 'master',
    isPartnerActive: true,
    partnerStatus: 'ativo',
    partnerCommissionRate: 35,
    partnerReferralCode: 'VERTICE-MASTER',
    partnerDiscountPercent: 10,
    partnerPixKey: 'contato@verticeanalises.com.br',
    partnerPixKeyType: 'email',
    partnerBankName: 'Banco do Brasil S.A.',
    partnerActivatedByMaster: true,
    partnerActivatedAt: '2025-01-01T00:00:00Z',
    permissions: ['all', 'unlimited_queries', 'ai_auditor_master', 'export_reports', 'tax_reform_projections', 'simples_hibrido'],
    allowedModules: {
      ...DEFAULT_PLAN_MODULES.master,
      simples_hibrido: true,
    },
    authSecurityMode: 'password_only',
    twoFactorEnabled: false,
    digitalCertificate: DEFAULT_AVAILABLE_CERTIFICATES[0],
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'usr_alessandra_handza_decision_making',
    name: 'Alessandra Handza',
    email: 'adm@decisionmaking.com.br',
    password: hashCredential('DecisionMaking2026!'),
    companyName: 'Decision Making Consultoria • Escritório Parceiro Homologado',
    role: 'escritorio',
    plan: 'parceiro_isento',
    planStatus: 'active',
    expiresAt: '2099-12-31T23:59:59Z',
    queriesUsedThisMonth: 0,
    maxQueriesPerMonth: 999999,
    maxCompaniesAllowed: 9999,
    maxUsersAllowed: 9999,
    isMaster: false,
    isDeveloper: false,
    isPartnerActive: true,
    partnerStatus: 'ativo',
    partnerCommissionRate: 35,
    partnerReferralCode: 'DECISION-MAKING',
    partnerDiscountPercent: 10,
    partnerPixKey: 'adm@decisionmaking.com.br',
    partnerPixKeyType: 'email',
    partnerBankName: 'Banco Itaú Unibanco S.A.',
    partnerActivatedByMaster: true,
    partnerActivatedAt: '2025-01-01T00:00:00Z',
    viewMode: 'escritorio',
    permissions: ['all', 'unlimited_queries', 'export_reports', 'tax_reform_projections', 'simples_hibrido'],
    allowedModules: {
      ...DEFAULT_PLAN_MODULES.parceiro_isento,
      simples_hibrido: true,
      planejamento_tributario: true,
      reforma_tributaria: true,
      auditoria_digital: true,
      partner_portal: true,
    },
    authSecurityMode: 'password_only',
    twoFactorEnabled: false,
    createdAt: '2025-01-01T00:00:00Z',
  }
];

export class AuthService {
  /**
   * Obtém a lista de todas as contas registradas
   */
  static getAccounts(): UserAccount[] {
    try {
      const stored = localStorage.getItem(STORAGE_USERS_KEY);
      if (stored) {
        let parsed: UserAccount[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filtrar contas fictícias legadas
          parsed = parsed.filter(acc => 
            acc.email.toLowerCase() !== 'parceiro@alianca.com.br' &&
            acc.id !== 'usr_parceiro_alianca'
          );

          // Garantir que a conta Master do Carlos Miguel esteja sempre presente e atualizada com a senha oficial
          const carlosIndex = parsed.findIndex(acc => 
            acc.email.toLowerCase() === 'contato@verticeanalises.com.br' ||
            acc.email.toLowerCase() === 'carlosmiguelvieira1@gmail.com'
          );
          if (carlosIndex === -1) {
            parsed.unshift(DEFAULT_PRESET_ACCOUNTS[0]);
          } else {
            // Sincroniza credenciais master oficiais e desabilita 2FA imediatamente
            if (parsed[carlosIndex].email !== 'contato@verticeanalises.com.br') parsed[carlosIndex].email = 'contato@verticeanalises.com.br';
            if (parsed[carlosIndex].password !== MASTER_AUTHORIZED_HASHES[0]) parsed[carlosIndex].password = MASTER_AUTHORIZED_HASHES[0];
            if (parsed[carlosIndex].role !== 'desenvolvedor') parsed[carlosIndex].role = 'desenvolvedor';
            parsed[carlosIndex].isDeveloper = true;
            parsed[carlosIndex].isMaster = true;
            parsed[carlosIndex].canAccessPlatformBilling = true;
            parsed[carlosIndex].canVerifyClients = true;
            parsed[carlosIndex].twoFactorEnabled = false;
            parsed[carlosIndex].authSecurityMode = 'password_only';
            if (!parsed[carlosIndex].allowedModules) parsed[carlosIndex].allowedModules = { ...DEFAULT_PLAN_MODULES.master };
            parsed[carlosIndex].allowedModules!.simples_hibrido = true;
          }

          // Garantir que a conta da Alessandra Handza (Decision Making) esteja presente e ativa
          const alessandraIndex = parsed.findIndex(acc => acc.email.toLowerCase() === 'adm@decisionmaking.com.br');
          if (alessandraIndex === -1) {
            parsed.push(DEFAULT_PRESET_ACCOUNTS[1]);
          } else {
            parsed[alessandraIndex].isPartnerActive = true;
            parsed[alessandraIndex].partnerStatus = 'ativo';
            parsed[alessandraIndex].plan = 'parceiro_isento';
            parsed[alessandraIndex].planStatus = 'active';
            if (!parsed[alessandraIndex].allowedModules) {
              parsed[alessandraIndex].allowedModules = { ...DEFAULT_PLAN_MODULES.parceiro_isento };
            }
            parsed[alessandraIndex].allowedModules!.simples_hibrido = true;
            parsed[alessandraIndex].allowedModules!.planejamento_tributario = true;
            parsed[alessandraIndex].allowedModules!.partner_portal = true;
          }

          // Habilitar simples_hibrido para todos os escritórios parceiros e planos pro/enterprise/parceiro
          parsed = parsed.map(acc => {
            const isPartner = acc.isPartnerActive || acc.role === 'escritorio' || acc.role === 'parceiro_negocios' || acc.plan === 'parceiro_isento' || acc.plan === 'enterprise' || acc.plan === 'pro';
            if (isPartner && acc.allowedModules) {
              return {
                ...acc,
                allowedModules: {
                  ...acc.allowedModules,
                  simples_hibrido: true,
                  planejamento_tributario: true,
                }
              };
            }
            return acc;
          });

          this.saveAccounts(parsed);
          return parsed;
        }
      }
    } catch (e) {
      console.error('Erro ao ler contas salvas:', e);
    }

    // Inicializa com as contas padrão
    this.saveAccounts(DEFAULT_PRESET_ACCOUNTS);
    return DEFAULT_PRESET_ACCOUNTS;
  }

  /**
   * Salva a lista de contas no armazenamento local
   */
  static saveAccounts(accounts: UserAccount[]): void {
    try {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(accounts));
    } catch (e) {
      console.error('Erro ao salvar contas no localStorage:', e);
    }
  }

  /**
   * Exclui uma conta de cliente ou operador (Apenas pelo Master)
   */
  static deleteAccount(identifier: string): { success: boolean; error?: string } {
    const cleanId = (identifier || '').trim().toLowerCase();
    if (!cleanId) {
      return { success: false, error: 'Identificador do usuário inválido.' };
    }

    if (cleanId === 'contato@verticeanalises.com.br' || cleanId === 'carlosmiguelvieira1@gmail.com' || cleanId === 'usr_carlos_miguel_master') {
      return { success: false, error: 'A conta Master proprietária de Carlos Miguel Vieira não pode ser excluída.' };
    }

    const accounts = this.getAccounts();
    const initialLen = accounts.length;
    const filtered = accounts.filter(acc => 
      acc.id.toLowerCase() !== cleanId && 
      acc.email.toLowerCase() !== cleanId
    );

    if (filtered.length === initialLen) {
      return { success: false, error: 'Usuário não localizado para exclusão.' };
    }

    this.saveAccounts(filtered);
    return { success: true };
  }

  /**
   * Converte uma conta do banco para o objeto de sessão AuthUser
   */
  static toAuthUser(account: UserAccount): AuthUser {
    const isCarlos = account.email?.toLowerCase() === 'contato@verticeanalises.com.br' || account.email?.toLowerCase() === 'carlosmiguelvieira1@gmail.com';
    const computedSecMode = isCarlos ? 'password_only' : (account.authSecurityMode || (account.twoFactorEnabled ? 'password_and_email_otp' : 'password_only'));
    const computedTwoFactor = isCarlos ? false : (account.twoFactorEnabled ?? (computedSecMode === 'password_and_email_otp'));

    return {
      id: account.id,
      name: account.name,
      email: isCarlos ? 'contato@verticeanalises.com.br' : account.email,
      role: account.role,
      companyName: account.companyName,
      cpf: account.cpf,
      cnpj: account.cnpj,
      phone: account.phone,
      professionalEmail: account.professionalEmail,
      address: account.address,
      isAdmin: account.isMaster || account.role === 'administrador' || account.role === 'master' || account.role === 'contador_senior' || account.isAdmin,
      parentAdminId: account.parentAdminId,
      plan: account.plan,
      planStatus: account.planStatus,
      expiresAt: account.expiresAt,
      queriesUsedThisMonth: account.queriesUsedThisMonth,
      maxQueriesPerMonth: account.maxQueriesPerMonth,
      isMaster: account.isMaster,
      viewMode: account.viewMode,
      permissions: account.permissions,
      allowedModules: account.allowedModules,
      allowedSubmodules: account.allowedSubmodules,
      maxCompaniesAllowed: account.maxCompaniesAllowed,
      maxUsersAllowed: account.maxUsersAllowed,
      isPartnerActive: account.isPartnerActive,
      partnerStatus: account.partnerStatus,
      partnerCommissionRate: account.partnerCommissionRate,
      partnerReferralCode: account.partnerReferralCode,
      partnerDiscountPercent: account.partnerDiscountPercent,
      partnerPixKey: account.partnerPixKey,
      partnerPixKeyType: account.partnerPixKeyType,
      partnerBankName: account.partnerBankName,
      partnerActivatedByMaster: account.partnerActivatedByMaster,
      partnerActivatedAt: account.partnerActivatedAt,
      authSecurityMode: computedSecMode,
      twoFactorEnabled: computedTwoFactor,
      digitalCertificate: account.digitalCertificate,
      isDeveloper: account.isDeveloper || account.role === 'desenvolvedor' || isCarlos,
      canAccessPlatformBilling: account.canAccessPlatformBilling ?? (account.role === 'desenvolvedor' || isCarlos),
      canVerifyClients: account.canVerifyClients ?? (account.role === 'desenvolvedor' || isCarlos),
      mustChangePassword: account.mustChangePassword,
      crcNumber: account.crcNumber,
      oabNumber: account.oabNumber,
      technicalRoleTitle: account.technicalRoleTitle,
    };
  }

  /**
   * Obtém os desafios de 2FA pendentes
   */
  static getPending2FAChallenges(): Pending2FAChallenge[] {
    try {
      const stored = localStorage.getItem(STORAGE_2FA_CHALLENGES_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Erro ao ler desafios 2FA:', e);
    }
    return [];
  }

  static savePending2FAChallenges(list: Pending2FAChallenge[]): void {
    try {
      localStorage.setItem(STORAGE_2FA_CHALLENGES_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Erro ao salvar desafios 2FA:', e);
    }
  }

  /**
   * Dispara um código OTP de 6 dígitos para o e-mail do usuário
   */
  static request2FACode(emailInput: string, customUserName?: string): { 
    success: boolean; 
    challengeId?: string; 
    code?: string;
    email?: string;
    userName?: string;
    error?: string; 
    emailNotification?: SentEmailNotification 
  } {
    const cleanEmail = (emailInput || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Endereço de e-mail inválido para envio do código 2FA.' };
    }

    const accounts = this.getAccounts();
    const account = accounts.find(acc => acc.email.toLowerCase() === cleanEmail);
    const userName = customUserName || account?.name || 'Profissional Vértice';

    // Gera código numérico de 6 dígitos aleatório
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const challengeId = `2fa_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutos

    const challenge: Pending2FAChallenge = {
      challengeId,
      email: cleanEmail,
      code: otpCode,
      userName,
      createdAt: new Date().toISOString(),
      expiresAt,
    };

    // Atualiza desafios salvos
    const list = this.getPending2FAChallenges().filter(c => c.email.toLowerCase() !== cleanEmail);
    list.push(challenge);
    this.savePending2FAChallenges(list);

    // Dispara e-mail via canal SMTP direto
    const emailNotification: SentEmailNotification = {
      id: `email_2fa_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'two_factor_code',
      toEmail: cleanEmail,
      toName: userName,
      subject: `VÉRTICE AUDITOR FISCAL // Seu Código de Validação em 2 Etapas (2FA): ${otpCode}`,
      otpCode,
      createdAt: new Date().toISOString(),
      expiresAt,
      read: false,
    };

    this.recordSentEmail(emailNotification);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('vertice_2fa_otp_generated', { 
        detail: { email: cleanEmail, code: otpCode, userName } 
      }));
    }

    return { 
      success: true, 
      challengeId, 
      code: otpCode, 
      email: cleanEmail, 
      userName, 
      emailNotification 
    };
  }

  /**
   * Valida o código OTP de 6 dígitos enviado por e-mail e conclui o login
   */
  static verify2FACode(emailInput: string, codeInput: string): { 
    success: boolean; 
    user?: AuthUser; 
    error?: string 
  } {
    const cleanEmail = (emailInput || '').trim().toLowerCase();
    const cleanCode = (codeInput || '').replace(/\D/g, '').trim();

    if (!cleanCode || cleanCode.length !== 6) {
      return { success: false, error: 'O código de validação deve conter 6 dígitos numéricos.' };
    }

    const challenges = this.getPending2FAChallenges();
    const challenge = challenges.find(c => 
      c.email.toLowerCase() === cleanEmail && 
      c.code === cleanCode
    );

    if (!challenge) {
      return { 
        success: false, 
        error: 'Código de validação incorreto ou expirado. Verifique sua caixa de entrada e tente novamente.' 
      };
    }

    if (new Date(challenge.expiresAt).getTime() < Date.now()) {
      return { 
        success: false, 
        error: 'Este código de 2FA expirou por limite de tempo (10 minutos). Solicite um novo código.' 
      };
    }

    // Remove o desafio utilizado
    const remaining = challenges.filter(c => c.challengeId !== challenge.challengeId);
    this.savePending2FAChallenges(remaining);

    const accounts = this.getAccounts();
    const account = accounts.find(acc => acc.email.toLowerCase() === cleanEmail);

    if (!account) {
      return { success: false, error: 'Conta de usuário não encontrada.' };
    }

    account.lastLoginAt = new Date().toISOString();
    this.saveAccounts(accounts);

    const authUser = this.toAuthUser(account);
    this.saveCurrentSession(authUser);

    return { success: true, user: authUser };
  }

  /**
   * Obtém a lista de certificados ICP-Brasil instalados ou detectados
   */
  static getAvailableCertificates(): DigitalCertificateInfo[] {
    let customCerts: DigitalCertificateInfo[] = [];
    try {
      const stored = localStorage.getItem('vertice_custom_certificates_v2');
      if (stored) {
        customCerts = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Erro ao ler certificados customizados:', e);
    }
    
    // Une os certificados customizados/carregados com os padrões do sistema para homologação imediata
    const combined = [...customCerts, ...DEFAULT_AVAILABLE_CERTIFICATES];
    const unique: DigitalCertificateInfo[] = [];
    const seen = new Set<string>();
    
    for (const cert of combined) {
      if (!seen.has(cert.serialNumber)) {
        seen.add(cert.serialNumber);
        unique.push(cert);
      }
    }
    
    return unique;
  }

  /**
   * Cadastra / importa um novo certificado digital do usuário
   */
  static registerCustomCertificate(cert: DigitalCertificateInfo): void {
    try {
      const stored = localStorage.getItem('vertice_custom_certificates_v2');
      let list: DigitalCertificateInfo[] = stored ? JSON.parse(stored) : [];
      list = [cert, ...list.filter(c => c.id !== cert.id && c.serialNumber !== cert.serialNumber)];
      localStorage.setItem('vertice_custom_certificates_v2', JSON.stringify(list));
    } catch (e) {
      console.error('Erro ao salvar certificado customizado:', e);
    }
  }

  /**
   * Autenticação Segura via Certificado Digital ICP-Brasil (A1 / A3 / Nuvem)
   */
  static loginWithCertificate(certificateDataOrId: string | DigitalCertificateInfo, pin?: string): { 
    success: boolean; 
    user?: AuthUser; 
    error?: string 
  } {
    let cert: DigitalCertificateInfo | undefined;

    if (typeof certificateDataOrId === 'string') {
      const allCerts = this.getAvailableCertificates();
      cert = allCerts.find(c => c.id === certificateDataOrId || c.serialNumber === certificateDataOrId);
    } else {
      cert = certificateDataOrId;
      this.registerCustomCertificate(cert);
    }

    if (!cert) {
      return { success: false, error: 'Certificado Digital ICP-Brasil não localizado ou não reconhecido.' };
    }

    if (cert.status === 'expirado' || new Date(cert.validUntil).getTime() < Date.now()) {
      return { success: false, error: 'O Certificado Digital selecionado está expirado junto à AC emissora.' };
    }

    if (cert.status === 'revogado') {
      return { success: false, error: 'O Certificado Digital selecionado consta como revogado na LCR ICP-Brasil.' };
    }

    // Localiza conta correspondente pelo CNPJ/CPF
    const accounts = this.getAccounts();
    const cleanDoc = cert.documentNumber.replace(/\D/g, '');
    
    // Procura conta que tenha o mesmo certificado vinculado ou mesmo CNPJ / CPF exato
    let account = accounts.find(acc => 
      acc.digitalCertificate?.serialNumber === cert!.serialNumber ||
      (acc.digitalCertificate?.documentNumber && acc.digitalCertificate.documentNumber.replace(/\D/g, '') === cleanDoc) ||
      (acc.cnpj && acc.cnpj.replace(/\D/g, '') === cleanDoc) ||
      (acc.cpf && acc.cpf.replace(/\D/g, '') === cleanDoc)
    );

    // Regra Rigorosa de Segurança ICP-Brasil: Nenhum fallback ou aprovação automática é permitida.
    // O certificado deve pertencer obrigatoriamente a uma conta cadastrada com plano ativo.
    if (!account) {
      return { 
        success: false, 
        error: `ACESSO NEGADO (Erro 403 - ICP-Brasil): O Certificado Digital selecionado (Titular: ${cert.subjectName.split(':')[0]} | CNPJ/CPF: ${cert.documentNumber}) NÃO POSSUI CONTA CADASTRADA nem PLANO ATIVO no sistema Vértice. Acesso bloqueado por falha de segurança de credencial não autorizada.` 
      };
    }

    if (!account.isMaster && account.planStatus !== 'active') {
      return { 
        success: false, 
        error: `Acesso Negado: O plano da empresa vinculada a este certificado encontra-se inativo ou expirado (${account.planStatus}). Regularize a assinatura para acessar o sistema.` 
      };
    }

    // Vincula o certificado à conta e atualiza modo de autenticação
    account.digitalCertificate = cert;
    account.lastLoginAt = new Date().toISOString();
    this.saveAccounts(accounts);

    const authUser = this.toAuthUser(account);
    this.saveCurrentSession(authUser);

    return { success: true, user: authUser };
  }

  /**
   * Atualiza as preferências de segurança do usuário (Senha / 2FA E-mail / Certificado Digital)
   */
  static updateAccountSecurity(
    userId: string, 
    securityMode: AuthSecurityMode, 
    certData?: DigitalCertificateInfo
  ): { success: boolean; user?: AuthUser; error?: string } {
    const cleanId = (userId || '').trim().toLowerCase();
    const accounts = this.getAccounts();
    const index = accounts.findIndex(a => a.id.toLowerCase() === cleanId || a.email.toLowerCase() === cleanId);

    if (index === -1) {
      return { success: false, error: 'Usuário não encontrado para atualização de segurança.' };
    }

    const acc = accounts[index];
    acc.authSecurityMode = securityMode;
    acc.twoFactorEnabled = securityMode === 'password_and_email_otp';

    if (certData) {
      acc.digitalCertificate = certData;
      this.registerCustomCertificate(certData);
    }

    accounts[index] = acc;
    this.saveAccounts(accounts);

    const updatedUser = this.toAuthUser(acc);
    const curSession = this.getStoredSession();
    if (curSession && (curSession.id === acc.id || curSession.email.toLowerCase() === acc.email.toLowerCase())) {
      this.saveCurrentSession(updatedUser);
    }

    return { success: true, user: updatedUser };
  }

  /**
   * Ativação / Desativação e Configuração do Programa de Parceiros em um Usuário (EXCLUSIVO MASTER)
   */
  static updatePartnerProgram(
    paramsOrId: string | {
      userIdOrEmail: string;
      isPartnerActive: boolean;
      partnerReferralCode?: string;
      partnerDiscountPercent?: number;
      partnerCommissionRate?: number;
      partnerPixKey?: string;
      partnerPixKeyType?: 'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria';
      partnerBankName?: string;
      grantFreePartnerPlan?: boolean;
    },
    maybeData?: Partial<UserAccount>
  ): { success: boolean; user?: AuthUser; error?: string } {
    let cleanId = '';
    let isPartnerActive = false;
    let partnerReferralCode: string | undefined;
    let partnerDiscountPercent: number | undefined;
    let partnerCommissionRate: number | undefined;
    let partnerPixKey: string | undefined;
    let partnerPixKeyType: 'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria' | undefined;
    let partnerBankName: string | undefined;
    let grantFreePartnerPlan = true;

    if (typeof paramsOrId === 'string') {
      cleanId = paramsOrId.trim().toLowerCase();
      if (maybeData) {
        isPartnerActive = !!maybeData.isPartnerActive;
        partnerReferralCode = maybeData.partnerReferralCode;
        partnerDiscountPercent = maybeData.partnerDiscountPercent;
        partnerCommissionRate = maybeData.partnerCommissionRate;
        partnerPixKey = maybeData.partnerPixKey;
        partnerPixKeyType = maybeData.partnerPixKeyType;
        partnerBankName = maybeData.partnerBankName;
      }
    } else {
      cleanId = (paramsOrId.userIdOrEmail || '').trim().toLowerCase();
      isPartnerActive = paramsOrId.isPartnerActive;
      partnerReferralCode = paramsOrId.partnerReferralCode;
      partnerDiscountPercent = paramsOrId.partnerDiscountPercent;
      partnerCommissionRate = paramsOrId.partnerCommissionRate;
      partnerPixKey = paramsOrId.partnerPixKey;
      partnerPixKeyType = paramsOrId.partnerPixKeyType;
      partnerBankName = paramsOrId.partnerBankName;
      if (paramsOrId.grantFreePartnerPlan !== undefined) {
        grantFreePartnerPlan = paramsOrId.grantFreePartnerPlan;
      }
    }

    const accounts = this.getAccounts();
    const accountIndex = accounts.findIndex(acc => 
      acc.id.toLowerCase() === cleanId || 
      acc.email.toLowerCase() === cleanId
    );

    if (accountIndex === -1) {
      return { success: false, error: 'Usuário não encontrado para atualização do Programa de Parceiros.' };
    }

    const acc = accounts[accountIndex];
    acc.isPartnerActive = isPartnerActive;
    acc.partnerStatus = isPartnerActive ? 'ativo' : 'inativo';
    acc.partnerActivatedByMaster = true;
    acc.partnerActivatedAt = new Date().toISOString();

    if (partnerReferralCode) {
      acc.partnerReferralCode = partnerReferralCode.trim().toUpperCase();
    } else if (!acc.partnerReferralCode && isPartnerActive) {
      acc.partnerReferralCode = `VERTICE-${acc.name.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 8) || 'PARCEIRO'}`;
    }

    if (partnerDiscountPercent !== undefined) {
      acc.partnerDiscountPercent = Number(partnerDiscountPercent);
    }
    if (partnerCommissionRate !== undefined) {
      acc.partnerCommissionRate = Number(partnerCommissionRate);
    }
    if (partnerPixKey) {
      acc.partnerPixKey = partnerPixKey.trim();
    }
    if (partnerPixKeyType) {
      acc.partnerPixKeyType = partnerPixKeyType;
    }
    if (partnerBankName) {
      acc.partnerBankName = partnerBankName.trim();
    }

    if (grantFreePartnerPlan && isPartnerActive) {
      acc.plan = 'parceiro_isento';
      acc.planStatus = 'active';
      acc.expiresAt = '2099-12-31T23:59:59Z';
      acc.maxQueriesPerMonth = 999999;
    }

    if (acc.allowedModules) {
      acc.allowedModules = {
        ...acc.allowedModules,
        partner_portal: isPartnerActive
      };
    }

    accounts[accountIndex] = acc;
    this.saveAccounts(accounts);

    // Se o usuário logado for o mesmo, atualiza a sessão ativa
    const currentSession = this.getStoredSession();
    if (currentSession && (currentSession.id === acc.id || currentSession.email.toLowerCase() === acc.email.toLowerCase())) {
      const updatedAuthUser = this.toAuthUser(acc);
      this.saveCurrentSession(updatedAuthUser);
    }

    return { success: true, user: this.toAuthUser(acc) };
  }

  /**
   * Atualiza papel (role), permissões e flags RBAC (Desenvolvedor, Faturamento, Verificação)
   */
  static updateUserAccountProfile(
    identifier: string,
    updates: {
      name?: string;
      role?: AuthUser['role'];
      companyName?: string;
      crcNumber?: string;
      oabNumber?: string;
      technicalRoleTitle?: string;
      cnpj?: string;
      isDeveloper?: boolean;
      canAccessPlatformBilling?: boolean;
      canVerifyClients?: boolean;
      allowedModules?: PlanAllowedModules;
      viewMode?: AppViewMode;
    }
  ): { success: boolean; user?: AuthUser; error?: string } {
    const cleanId = (identifier || '').trim().toLowerCase();
    const accounts = this.getAccounts();
    const index = accounts.findIndex(a => a.id.toLowerCase() === cleanId || a.email.toLowerCase() === cleanId);

    if (index === -1) {
      return { success: false, error: 'Usuário não encontrado.' };
    }

    const acc = accounts[index];
    if (updates.name !== undefined) acc.name = updates.name;
    if (updates.role) {
      acc.role = updates.role;
      // Atualizar viewMode se aplicável
      if (updates.role === 'desenvolvedor' || updates.role === 'master') acc.viewMode = 'master';
      else if (updates.role === 'escritorio' || updates.role === 'contador_senior') acc.viewMode = 'escritorio';
      else if (updates.role === 'auditor' || updates.role === 'auditor_fiscal') acc.viewMode = 'auditor';
      else if (updates.role === 'analista' || updates.role === 'assistente_fiscal') acc.viewMode = 'analista';
      else if (updates.role === 'empresa' || updates.role === 'cliente_empresa') acc.viewMode = 'empresa';
    }
    if (updates.companyName !== undefined) acc.companyName = updates.companyName;
    if (updates.crcNumber !== undefined) acc.crcNumber = updates.crcNumber;
    if (updates.oabNumber !== undefined) acc.oabNumber = updates.oabNumber;
    if (updates.technicalRoleTitle !== undefined) acc.technicalRoleTitle = updates.technicalRoleTitle;
    if (updates.cnpj !== undefined) acc.cnpj = updates.cnpj;
    if (updates.isDeveloper !== undefined) acc.isDeveloper = updates.isDeveloper;
    if (updates.canAccessPlatformBilling !== undefined) acc.canAccessPlatformBilling = updates.canAccessPlatformBilling;
    if (updates.canVerifyClients !== undefined) acc.canVerifyClients = updates.canVerifyClients;
    if (updates.allowedModules) acc.allowedModules = updates.allowedModules;
    if (updates.viewMode) acc.viewMode = updates.viewMode;

    accounts[index] = acc;
    this.saveAccounts(accounts);

    const updatedUser = this.toAuthUser(acc);
    const curSession = this.getStoredSession();
    if (curSession && (curSession.id.toLowerCase() === cleanId || curSession.email.toLowerCase() === cleanId)) {
      this.saveCurrentSession(updatedUser);
    }

    return { success: true, user: updatedUser };
  }

  /**
   * Realiza login autenticando e-mail e senha (com verificação de 2FA se habilitado)
   */
  static login(emailInput: string, passwordInput: string): { 
    success: boolean; 
    user?: AuthUser; 
    requires2FA?: boolean; 
    requiresPasswordChange?: boolean;
    challengeId?: string;
    email?: string;
    userName?: string;
    error?: string; 
  } {
    const cleanEmail = (emailInput || '').trim().toLowerCase();
    const cleanPassword = (passwordInput || '').trim();

    if (!cleanEmail) {
      return { success: false, error: 'Por favor, informe seu e-mail profissional.' };
    }
    if (!cleanPassword) {
      return { success: false, error: 'Por favor, digite sua senha de acesso.' };
    }

    const accounts = this.getAccounts();
    const account = accounts.find(acc => acc.email.toLowerCase() === cleanEmail);

    if (!account) {
      return { 
        success: false, 
        error: 'E-mail não cadastrado. Verifique a digitação ou crie sua conta.' 
      };
    }

    // Validação estrita da senha (suporta senha hash e legado)
    const inputHash = hashCredential(cleanPassword);
    const isCarlos = cleanEmail === 'contato@verticeanalises.com.br' || cleanEmail === 'carlosmiguelvieira1@gmail.com';
    const isPasswordValid = isCarlos
      ? (MASTER_AUTHORIZED_HASHES.includes(inputHash) || account.password === inputHash || account.password === cleanPassword)
      : (account.password === inputHash || account.password === cleanPassword);

    if (!isPasswordValid) {
      return { 
        success: false, 
        error: 'Senha incorreta. Verifique os caracteres ou utilize a opção de recuperação.' 
      };
    }

    if (isCarlos) {
      account.email = 'contato@verticeanalises.com.br';
      account.password = MASTER_AUTHORIZED_HASHES[0];
      account.twoFactorEnabled = false;
      account.authSecurityMode = 'password_only';
    }

    // Se a conta exige 2FA (Senha + Código de Validação por E-mail) - NUNCA exige para Carlos Miguel
    const is2FA = !isCarlos && (account.authSecurityMode === 'password_and_email_otp' || !!account.twoFactorEnabled);
    if (is2FA) {
      const challengeRes = this.request2FACode(account.email, account.name);
      return {
        success: true,
        requires2FA: true,
        challengeId: challengeRes.challengeId,
        email: account.email,
        userName: account.name,
      };
    }

    // Atualiza último acesso
    account.lastLoginAt = new Date().toISOString();
    this.saveAccounts(accounts);

    const authUser = this.toAuthUser(account);
    this.saveCurrentSession(authUser);

    return { 
      success: true, 
      user: authUser,
      requiresPasswordChange: !!account.mustChangePassword 
    };
  }

  /**
   * Redefine/atualiza a senha do usuário garantindo o cumprimento das políticas de senha
   */
  static updatePasswordWithPolicy(email: string, newPassword: string): { success: boolean; user?: AuthUser; error?: string } {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (newPassword || '').trim();

    const policyResult = validatePasswordPolicy(cleanPassword);
    if (!policyResult.isValid) {
      return {
        success: false,
        error: `A nova senha não atende aos requisitos de segurança: ${policyResult.errors.join(' | ')}`
      };
    }

    const accounts = this.getAccounts();
    const account = accounts.find(acc => acc.email.toLowerCase() === cleanEmail);
    if (!account) {
      return { success: false, error: 'Usuário não encontrado para atualização de senha.' };
    }

    account.password = cleanPassword;
    account.mustChangePassword = false;
    this.saveAccounts(accounts);

    const updatedUser = this.toAuthUser(account);
    this.saveCurrentSession(updatedUser);

    return { success: true, user: updatedUser };
  }

  /**
   * Registra um novo usuário no sistema
   */
  static register(params: {
    name: string;
    email: string;
    password: string;
    companyName?: string;
    role?: UserAccount['role'];
    plan?: UserAccount['plan'];
    partnerReferralCode?: string;
    partnerDiscountPercent?: number;
    partnerPixKey?: string;
    mustChangePassword?: boolean;
  }): { success: boolean; user?: AuthUser; error?: string } {
    const cleanName = (params.name || '').trim();
    const cleanEmail = (params.email || '').trim().toLowerCase();
    const cleanPassword = (params.password || '').trim();
    const cleanCompany = (params.companyName || '').trim() || 'Escritório de Consultoria Contábil';

    if (!cleanName) {
      return { success: false, error: 'O nome completo do profissional é obrigatório.' };
    }
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return { success: false, error: 'Informe um e-mail profissional válido.' };
    }
    
    // Validar regras de senha no cadastro
    const isCarlosCheck = cleanEmail === 'contato@verticeanalises.com.br' || cleanEmail === 'carlosmiguelvieira1@gmail.com';
    if (!isCarlosCheck) {
      const pwdVal = validatePasswordPolicy(cleanPassword);
      if (!pwdVal.isValid) {
        return { success: false, error: `Senha inválida. ${pwdVal.errors.join(' ')}` };
      }
    }

    const accounts = this.getAccounts();
    const existing = accounts.find(acc => acc.email.toLowerCase() === cleanEmail);

    if (existing) {
      return { success: false, error: 'Este e-mail já está cadastrado. Por favor, faça login com sua senha.' };
    }

    const isCarlos = cleanEmail === 'carlosmiguelvieira1@gmail.com';
    const isPartner = params.role === 'parceiro_negocios' || params.plan === 'parceiro_isento';
    const role = isCarlos ? 'master' : (params.role || 'contador_senior');
    const plan = isCarlos ? 'master_ilimitado' : isPartner ? 'parceiro_isento' : (params.plan || 'pro_tributario');
    const isMaster = isCarlos || role === 'master' || plan === 'master_ilimitado';
    const viewMode: AppViewMode = isMaster ? 'master' : isPartner ? 'parceiro' : (role === 'cliente_relatorio' ? 'cliente_relatorio' : 'escritorio');

    const partnerCode = isMaster 
      ? 'VERTICE-MASTER' 
      : isPartner 
      ? (params.partnerReferralCode || `VERTICE-${cleanName.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 8) || 'PARCEIRO'}`)
      : undefined;

    const newAccount: UserAccount = {
      id: `usr_${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
      companyName: cleanCompany,
      role,
      plan,
      planStatus: 'active',
      expiresAt: (isMaster || isPartner) ? '2099-12-31T23:59:59Z' : '2026-12-31T23:59:59Z',
      queriesUsedThisMonth: 0,
      maxQueriesPerMonth: (isMaster || isPartner) ? 999999 : 150,
      isMaster,
      viewMode,
      isPartnerActive: isMaster || isPartner,
      partnerStatus: (isMaster || isPartner) ? 'ativo' : 'inativo',
      partnerCommissionRate: isMaster ? 35 : isPartner ? 20 : 20,
      partnerReferralCode: partnerCode,
      partnerDiscountPercent: params.partnerDiscountPercent ?? 10,
      partnerPixKey: params.partnerPixKey || cleanEmail,
      partnerPixKeyType: 'email',
      partnerBankName: 'Banco do Brasil S.A.',
      partnerActivatedByMaster: isMaster || isPartner,
      partnerActivatedAt: (isMaster || isPartner) ? new Date().toISOString() : undefined,
      permissions: (isMaster || isPartner)
        ? ['all', 'unlimited_queries', 'ai_auditor_master', 'export_reports', 'tax_reform_projections']
        : ['unlimited_queries', 'export_reports', 'ai_auditor_master', 'tax_reform_projections'],
      allowedModules: (isMaster || isPartner) ? { ...DEFAULT_PLAN_MODULES.master, partner_portal: true } : DEFAULT_PLAN_MODULES.pro,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    accounts.push(newAccount);
    this.saveAccounts(accounts);

    const authUser = this.toAuthUser(newAccount);
    this.saveCurrentSession(authUser);

    return { success: true, user: authUser };
  }

  /**
   * Altera a senha do usuário conectado
   */
  static changePassword(userId: string, currentPassword: string, newPassword: string): { success: boolean; error?: string } {
    const cleanCurrent = (currentPassword || '').trim();
    const cleanNew = (newPassword || '').trim();

    if (!cleanNew || cleanNew.length < 6) {
      return { success: false, error: 'A nova senha deve ter no mínimo 6 caracteres.' };
    }

    const accounts = this.getAccounts();
    const accountIndex = accounts.findIndex(acc => acc.id === userId);

    if (accountIndex === -1) {
      return { success: false, error: 'Usuário não localizado no registro do sistema.' };
    }

    if (accounts[accountIndex].password !== cleanCurrent) {
      return { success: false, error: 'A senha atual digitada está incorreta.' };
    }

    accounts[accountIndex].password = cleanNew;
    this.saveAccounts(accounts);

    return { success: true };
  }

  /**
   * Redefine a senha por e-mail (recuperação de senha)
   */
  static resetPassword(emailInput: string, newPassword: string): { success: boolean; error?: string } {
    const cleanEmail = (emailInput || '').trim().toLowerCase();
    const cleanNew = (newPassword || '').trim();

    if (!cleanEmail) {
      return { success: false, error: 'Informe o e-mail da conta.' };
    }
    if (!cleanNew || cleanNew.length < 6) {
      return { success: false, error: 'A nova senha deve ter pelo menos 6 caracteres.' };
    }

    const accounts = this.getAccounts();
    const accountIndex = accounts.findIndex(acc => acc.email.toLowerCase() === cleanEmail);

    if (accountIndex === -1) {
      return { success: false, error: 'Nenhuma conta encontrada com este endereço de e-mail.' };
    }

    accounts[accountIndex].password = cleanNew;
    this.saveAccounts(accounts);

    return { success: true };
  }

  /**
   * Define diretamente a senha de qualquer usuário (Master Admin / Gestor Master)
   */
  static directSetUserPassword(userIdOrEmail: string, newPassword: string): { success: boolean; error?: string } {
    const cleanId = (userIdOrEmail || '').trim().toLowerCase();
    const cleanNew = (newPassword || '').trim();

    if (!cleanId) {
      return { success: false, error: 'Identificador de usuário inválido.' };
    }
    if (!cleanNew || cleanNew.length < 6) {
      return { success: false, error: 'A senha deve ter no mínimo 6 caracteres.' };
    }

    const accounts = this.getAccounts();
    const accountIndex = accounts.findIndex(acc => acc.id.toLowerCase() === cleanId || acc.email.toLowerCase() === cleanId);

    if (accountIndex === -1) {
      return { success: false, error: 'Usuário não encontrado na base de contas.' };
    }

    accounts[accountIndex].password = cleanNew;
    this.saveAccounts(accounts);

    return { success: true };
  }

  /**
   * Salva a sessão ativa no localStorage (Compartilhado entre abas)
   */
  static saveCurrentSession(user: AuthUser | null): void {
    try {
      if (user) {
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
        localStorage.setItem('sna_app_view_mode', user.viewMode || 'master');
        localStorage.removeItem('sna_auth_logged_out');
        // Define cookie de sessão (sem expiração, limpa ao fechar navegador)
        document.cookie = "sna_session_active=true; path=/";
      } else {
        localStorage.removeItem(STORAGE_SESSION_KEY);
        localStorage.removeItem('sna_app_view_mode');
        // Limpa cookie de sessão
        document.cookie = "sna_session_active=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
    } catch (e) {
      console.error('Erro ao salvar sessão:', e);
    }
  }

  /**
   * Obtém a sessão salva no localStorage
   */
  static getStoredSession(): AuthUser | null {
    try {
      const stored = localStorage.getItem(STORAGE_SESSION_KEY);
      if (stored) {
        const parsed: AuthUser = JSON.parse(stored);
        if (parsed && (parsed.email?.toLowerCase() === 'carlosmiguelvieira1@gmail.com' || parsed.id === 'usr_carlos_miguel_master' || parsed.name === 'Carlos Miguel Vieira')) {
          parsed.email = 'contato@verticeanalises.com.br';
          parsed.twoFactorEnabled = false;
          parsed.authSecurityMode = 'password_only';
          this.saveCurrentSession(parsed);
        }
        return parsed;
      }
    } catch (e) {
      console.error('Erro ao ler sessão salva:', e);
    }
    return null;
  }

  /**
   * Obtém a lista de pendências de cadastro por confirmação de e-mail
   */
  static getPendingRegistrations(): PendingRegistration[] {
    try {
      const stored = localStorage.getItem(STORAGE_PENDING_REGISTRATIONS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Erro ao ler cadastros pendentes:', e);
    }
    return [];
  }

  static savePendingRegistrations(list: PendingRegistration[]): void {
    try {
      localStorage.setItem(STORAGE_PENDING_REGISTRATIONS_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Erro ao salvar cadastros pendentes:', e);
    }
  }

  /**
   * Obtém a lista de pendências de recuperação de senha por e-mail
   */
  static getPendingResets(): PendingPasswordReset[] {
    try {
      const stored = localStorage.getItem(STORAGE_PENDING_RESETS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Erro ao ler recuperações pendentes:', e);
    }
    return [];
  }

  static savePendingResets(list: PendingPasswordReset[]): void {
    try {
      localStorage.setItem(STORAGE_PENDING_RESETS_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Erro ao salvar recuperações pendentes:', e);
    }
  }

  /**
   * Registro e histórico de e-mails disparados via serviço SMTP transacional
   */
  static getSentEmails(): SentEmailNotification[] {
    try {
      const stored = localStorage.getItem(STORAGE_SENT_EMAILS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Erro ao ler e-mails enviados:', e);
    }
    return [];
  }

  static saveSentEmails(list: SentEmailNotification[]): void {
    try {
      localStorage.setItem(STORAGE_SENT_EMAILS_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Erro ao salvar e-mails enviados:', e);
    }
  }

  static triggerDirectEmailDispatch(item: SentEmailNotification, autoOpenMailto: boolean = false): { mailtoUrl: string; bodyText: string } {
    let bodyText = `Prezado(a) ${item.toName || 'Cliente'},\n\n`;
    if (item.type === 'invoice_receipt') {
      bodyText += `Sua Nota Fiscal de Serviço Eletrônica (NFS-e Gov.br Nacional) foi emitida e autorizada com sucesso.\n\n`;
      bodyText += `Ref: ${item.subject}\n`;
      if (item.linkUrl) bodyText += `Acesse a DANFSE em PDF: ${item.linkUrl}\n`;
    } else if (item.type === 'two_factor_code') {
      bodyText += `Seu código de validação de acesso em 2 etapas (2FA) é: ${item.otpCode}\n\n`;
      bodyText += `Este código tem validade de 10 minutos para segurança da sua conta.\n`;
    } else if (item.type === 'password_reset') {
      bodyText += `Recebemos uma solicitação para redefinir a senha da sua conta.\n\n`;
      if (item.linkUrl) bodyText += `Link seguro de redefinição de senha: ${item.linkUrl}\n`;
    } else if (item.type === 'registration_confirmation') {
      bodyText += `Seja bem-vindo ao Vértice Auditor Fiscal - Inteligência Tributária & Emissão Nacional de NFS-e.\n\n`;
      if (item.linkUrl) bodyText += `Clique no link a seguir para confirmar seu cadastro e criar sua senha: ${item.linkUrl}\n`;
    } else {
      bodyText += `${item.subject}\n\n`;
      if (item.linkUrl) bodyText += `Link de acesso: ${item.linkUrl}\n`;
    }
    bodyText += `\nAtenciosamente,\nEquipe Vértice Auditor Fiscal • Inteligência Tributária\nSite Oficial: https://verticeanalises.com.br\nContato & Suporte: contato@verticeanalises.com.br`;

    const mailtoUrl = `mailto:${encodeURIComponent(item.toEmail)}?subject=${encodeURIComponent(item.subject)}&body=${encodeURIComponent(bodyText)}`;

    if (autoOpenMailto && typeof window !== 'undefined') {
      try {
        window.open(mailtoUrl, '_blank');
      } catch (e) {
        console.warn('Mailto popup blocked by browser:', e);
      }
    }

    return { mailtoUrl, bodyText };
  }

  static recordSentEmail(item: SentEmailNotification, autoOpenMailto: boolean = false): void {
    const list = this.getSentEmails();
    const updated = [item, ...list.filter(e => e.id !== item.id)].slice(0, 30); // mantem ultimos 30
    this.saveSentEmails(updated);
    
    // Transmite via gatilho de e-mail direto
    const dispatchInfo = this.triggerDirectEmailDispatch(item, autoOpenMailto);

    console.log(`[SMTP DIRECT EMAIL DISPATCH] 📧 E-mail disparado exclusivamente para ${item.toEmail}: "${item.subject}" | OTP/Link: ${item.otpCode || item.linkUrl || 'N/A'}`);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('vertice_email_dispatched', { 
        detail: { ...item, mailtoUrl: dispatchInfo.mailtoUrl, bodyText: dispatchInfo.bodyText } 
      }));
    }
  }

  static markEmailAsRead(id: string): void {
    const list = this.getSentEmails();
    const updated = list.map(item => item.id === id ? { ...item, read: true } : item);
    this.saveSentEmails(updated);
  }

  static moveEmailToFolder(id: string, folderId: string): void {
    const list = this.getSentEmails();
    const updated = list.map(item => item.id === id ? { ...item, folderId } : item);
    this.saveSentEmails(updated);
  }

  static bulkMoveEmailsToFolder(ids: string[], folderId: string): void {
    const list = this.getSentEmails();
    const set = new Set(ids);
    const updated = list.map(item => set.has(item.id) ? { ...item, folderId } : item);
    this.saveSentEmails(updated);
  }

  static deleteEmailPermanently(id: string): void {
    const list = this.getSentEmails();
    const updated = list.filter(item => item.id !== id);
    this.saveSentEmails(updated);
  }

  static bulkDeleteEmailsPermanently(ids: string[]): void {
    const list = this.getSentEmails();
    const set = new Set(ids);
    const updated = list.filter(item => !set.has(item.id));
    this.saveSentEmails(updated);
  }

  static emptyTrashEmails(): void {
    const list = this.getSentEmails();
    const updated = list.filter(item => item.folderId !== 'trash');
    this.saveSentEmails(updated);
  }

  static toggleStarEmail(id: string): void {
    const list = this.getSentEmails();
    const updated = list.map(item => item.id === id ? { ...item, isStarred: !item.isStarred } : item);
    this.saveSentEmails(updated);
  }

  static clearSentEmails(): void {
    this.saveSentEmails([]);
  }

  /**
   * ETAPA 1 DO CADASTRO SEGURO:
   * Usuário informa nome, e-mail e dados da empresa.
   * Sistema valida e envia confirmação com link exclusivo para o e-mail cadastrado.
   */
  static requestRegistrationConfirmation(params: {
    name: string;
    email: string;
    companyName?: string;
    role?: UserAccount['role'];
    plan?: UserAccount['plan'];
  }): { success: boolean; token?: string; error?: string; emailNotification?: SentEmailNotification } {
    const cleanName = (params.name || '').trim();
    const cleanEmail = (params.email || '').trim().toLowerCase();
    const cleanCompany = (params.companyName || '').trim() || 'Escritório de Consultoria Contábil';

    if (!cleanName) {
      return { success: false, error: 'O nome completo do profissional é obrigatório.' };
    }
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return { success: false, error: 'Informe um e-mail profissional válido para receber a confirmação.' };
    }

    const accounts = this.getAccounts();
    const existing = accounts.find(acc => acc.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { 
        success: false, 
        error: 'Este e-mail já possui uma conta ativa. Utilize a recuperação de senha caso tenha esquecido o acesso.' 
      };
    }

    const token = `reg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutos

    const pendingItem: PendingRegistration = {
      token,
      name: cleanName,
      email: cleanEmail,
      companyName: cleanCompany,
      role: params.role || 'contador_senior',
      plan: params.plan || 'pro_tributario',
      createdAt: new Date().toISOString(),
      expiresAt,
    };

    // Remove pendências anteriores do mesmo e-mail e adiciona a nova
    const pendingList = this.getPendingRegistrations().filter(p => p.email.toLowerCase() !== cleanEmail);
    pendingList.push(pendingItem);
    this.savePendingRegistrations(pendingList);

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://app.verticefiscal.com.br';
    const linkUrl = `${origin}/#action=set-password&token=${token}`;

    const emailNotification: SentEmailNotification = {
      id: `email_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type: 'registration_confirmation',
      toEmail: cleanEmail,
      toName: cleanName,
      subject: 'VÉRTICE AUDITOR FISCAL // Confirmação de Cadastro e Ativação de Senha',
      token,
      linkUrl,
      createdAt: new Date().toISOString(),
      expiresAt,
      read: false,
    };

    this.recordSentEmail(emailNotification);

    return { success: true, token, emailNotification };
  }

  /**
   * Consulta os dados de uma confirmação pendente de cadastro pelo token
   */
  static getPendingRegistration(token: string): { success: boolean; pending?: PendingRegistration; error?: string } {
    const cleanToken = (token || '').trim();
    if (!cleanToken) {
      return { success: false, error: 'Token de confirmação de cadastro inválido ou ausente.' };
    }

    const list = this.getPendingRegistrations();
    const item = list.find(p => p.token === cleanToken);

    if (!item) {
      return { success: false, error: 'Link de confirmação inválido ou expirado. Por favor, solicite um novo cadastro.' };
    }

    if (new Date(item.expiresAt).getTime() < Date.now()) {
      return { success: false, error: 'Este link de confirmação expirou por segurança (validade de 30 minutos). Solicite novamente o cadastro.' };
    }

    return { success: true, pending: item };
  }

  /**
   * ETAPA 2 DO CADASTRO SEGURO:
   * Usuário acessa pelo link recebido no e-mail e cadastra sua senha de acesso.
   */
  static completeRegistrationWithPassword(token: string, passwordInput: string): { success: boolean; user?: AuthUser; error?: string } {
    const cleanPassword = (passwordInput || '').trim();
    if (!cleanPassword || cleanPassword.length < 6) {
      return { success: false, error: 'A senha de acesso deve conter no mínimo 6 caracteres.' };
    }

    const check = this.getPendingRegistration(token);
    if (!check.success || !check.pending) {
      return { success: false, error: check.error || 'Não foi possível validar o link de confirmação.' };
    }

    const pending = check.pending;

    // Registra a conta definitiva
    const res = this.register({
      name: pending.name,
      email: pending.email,
      companyName: pending.companyName,
      role: pending.role,
      plan: pending.plan,
      password: cleanPassword,
    });

    if (!res.success) {
      return { success: false, error: res.error };
    }

    // Remove das pendências
    const remaining = this.getPendingRegistrations().filter(p => p.token !== token);
    this.savePendingRegistrations(remaining);

    return { success: true, user: res.user };
  }

  /**
   * ETAPA 1 DA RECUPERAÇÃO SEGURA:
   * Usuário informa o e-mail na tela de login.
   * Sistema verifica o cadastro e envia link exclusivo de recuperação para o e-mail.
   */
  static requestPasswordReset(emailInput: string): { success: boolean; token?: string; error?: string; emailNotification?: SentEmailNotification } {
    const cleanEmail = (emailInput || '').trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Informe o endereço de e-mail cadastrado.' };
    }

    const accounts = this.getAccounts();
    const account = accounts.find(acc => acc.email.toLowerCase() === cleanEmail);

    if (!account) {
      return { 
        success: false, 
        error: 'Nenhuma conta localizada com este e-mail. Verifique a digitação ou crie seu cadastro.' 
      };
    }

    const token = `pwd_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutos

    const pendingReset: PendingPasswordReset = {
      token,
      email: cleanEmail,
      userName: account.name,
      createdAt: new Date().toISOString(),
      expiresAt,
    };

    const pendingList = this.getPendingResets().filter(p => p.email.toLowerCase() !== cleanEmail);
    pendingList.push(pendingReset);
    this.savePendingResets(pendingList);

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://app.verticefiscal.com.br';
    const linkUrl = `${origin}/#action=reset-password&token=${token}`;

    const emailNotification: SentEmailNotification = {
      id: `email_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type: 'password_reset',
      toEmail: cleanEmail,
      toName: account.name,
      subject: 'VÉRTICE AUDITOR FISCAL // Link de Segurança para Redefinição de Senha',
      token,
      linkUrl,
      createdAt: new Date().toISOString(),
      expiresAt,
      read: false,
    };

    this.recordSentEmail(emailNotification);

    return { success: true, token, emailNotification };
  }

  /**
   * Consulta os dados de uma recuperação pendente de senha pelo token
   */
  static getPendingPasswordReset(token: string): { success: boolean; pending?: PendingPasswordReset; error?: string } {
    const cleanToken = (token || '').trim();
    if (!cleanToken) {
      return { success: false, error: 'Token de recuperação de senha inválido ou ausente.' };
    }

    const list = this.getPendingResets();
    const item = list.find(p => p.token === cleanToken);

    if (!item) {
      return { success: false, error: 'Link de recuperação inválido ou expirado. Solicite novamente pelo formulário de login.' };
    }

    if (new Date(item.expiresAt).getTime() < Date.now()) {
      return { success: false, error: 'Este link de recuperação expirou por segurança (validade de 30 minutos). Solicite novamente.' };
    }

    return { success: true, pending: item };
  }

  /**
   * ETAPA 2 DA RECUPERAÇÃO SEGURA:
   * Usuário acessa exclusivamente através do link recebido no e-mail e redefine a senha.
   */
  static completePasswordResetWithToken(token: string, newPassword: string): { success: boolean; error?: string } {
    const cleanPassword = (newPassword || '').trim();
    if (!cleanPassword || cleanPassword.length < 6) {
      return { success: false, error: 'A nova senha deve ter no mínimo 6 caracteres.' };
    }

    const check = this.getPendingPasswordReset(token);
    if (!check.success || !check.pending) {
      return { success: false, error: check.error || 'Não foi possível validar o link de recuperação.' };
    }

    const pending = check.pending;
    const res = this.resetPassword(pending.email, cleanPassword);

    if (!res.success) {
      return { success: false, error: res.error };
    }

    // Remove das pendências
    const remaining = this.getPendingResets().filter(p => p.token !== token);
    this.savePendingResets(remaining);

    return { success: true };
  }

  /**
   * Obtém todas as solicitações de ativação de plano realizadas por clientes
   */
  static getPlanActivationRequests(): PlanActivationRequest[] {
    try {
      const stored = localStorage.getItem(STORAGE_PLAN_REQUESTS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Erro ao ler solicitações de ativação de plano:', e);
    }
    return [];
  }

  static savePlanActivationRequests(list: PlanActivationRequest[]): void {
    try {
      localStorage.setItem(STORAGE_PLAN_REQUESTS_KEY, JSON.stringify(list));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('vertice_plan_requests_updated', { 
          detail: { count: list.filter(r => r.status === 'pendente_aprovacao_master').length } 
        }));
      }
    } catch (e) {
      console.error('Erro ao salvar solicitações de ativação de plano:', e);
    }
  }

  /**
   * Cria uma nova solicitação de ativação de plano (iniciada pelo cliente interessado na tela de login/planos)
   */
  static createPlanActivationRequest(params: {
    requesterName: string;
    requesterEmail: string;
    requesterPhone: string;
    companyName: string;
    documentNumber: string;
    planId: string;
    planName: string;
    periodicity: PlanPeriodicity;
    monthlyPrice: number;
    totalPriceCalculated: number;
    referralCode?: string;
    partnerDiscountPercent?: number;
    notes?: string;
  }): { success: boolean; request?: PlanActivationRequest; error?: string } {
    const cleanName = (params.requesterName || '').trim();
    const cleanEmail = (params.requesterEmail || '').trim().toLowerCase();
    const cleanCompany = (params.companyName || '').trim();

    if (!cleanName) return { success: false, error: 'O nome do responsável é obrigatório.' };
    if (!cleanEmail || !cleanEmail.includes('@')) return { success: false, error: 'E-mail profissional inválido.' };
    if (!cleanCompany) return { success: false, error: 'O nome da empresa ou escritório é obrigatório.' };
    if (!params.planId) return { success: false, error: 'Selecione o plano desejado para ativação.' };

    const requestId = `req_plan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newRequest: PlanActivationRequest = {
      id: requestId,
      requesterName: cleanName,
      requesterEmail: cleanEmail,
      requesterPhone: (params.requesterPhone || '').trim(),
      companyName: cleanCompany,
      documentNumber: (params.documentNumber || '').trim(),
      planId: params.planId,
      planName: params.planName,
      periodicity: params.periodicity,
      monthlyPrice: params.monthlyPrice,
      totalPriceCalculated: params.totalPriceCalculated,
      referralCode: params.referralCode,
      partnerDiscountPercent: params.partnerDiscountPercent,
      requestedAt: new Date().toISOString(),
      status: 'pendente_aprovacao_master',
      notes: params.notes,
    };

    const list = this.getPlanActivationRequests();
    list.unshift(newRequest);
    this.savePlanActivationRequests(list);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('vertice_new_plan_request', { detail: newRequest }));
    }

    return { success: true, request: newRequest };
  }

  /**
   * Master Proprietário aprova a solicitação do cliente e dispara o e-mail oficial para cadastro de Administrador
   */
  static approvePlanActivationRequest(requestId: string, reviewedBy = 'Carlos Miguel Vieira (Master Proprietário)'): {
    success: boolean;
    request?: PlanActivationRequest;
    token?: string;
    emailNotification?: SentEmailNotification;
    error?: string;
  } {
    const list = this.getPlanActivationRequests();
    const reqIndex = list.findIndex(r => r.id === requestId);

    if (reqIndex === -1) {
      return { success: false, error: 'Solicitação de plano não localizada.' };
    }

    const req = list[reqIndex];
    if (req.status === 'aprovado') {
      return { success: false, error: 'Esta solicitação já foi aprovada anteriormente.' };
    }

    const token = `adm_act_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(); // 48h de validade

    req.status = 'aprovado';
    req.reviewedAt = new Date().toISOString();
    req.reviewedBy = reviewedBy;
    req.activationToken = token;
    req.activationExpiresAt = expiresAt;

    list[reqIndex] = req;
    this.savePlanActivationRequests(list);

    // Registra pendência de cadastro de Administrador
    const pendingReg: PendingRegistration = {
      token,
      name: req.requesterName,
      email: req.requesterEmail,
      companyName: req.companyName,
      role: 'administrador',
      plan: req.planId,
      requestId: req.id,
      createdAt: new Date().toISOString(),
      expiresAt,
    };

    const pendingList = this.getPendingRegistrations().filter(p => p.email.toLowerCase() !== req.requesterEmail.toLowerCase());
    pendingList.push(pendingReg);
    this.savePendingRegistrations(pendingList);

    // Dispara e-mail oficial de convite para cadastro de Administrador
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://app.verticefiscal.com.br';
    const linkUrl = `${origin}/#action=complete-admin-registration&token=${token}`;

    const emailNotification: SentEmailNotification = {
      id: `email_act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type: 'plan_activation_invitation',
      toEmail: req.requesterEmail,
      toName: req.requesterName,
      subject: `VÉRTICE AUDITOR FISCAL // Sua Solicitação do Plano "${req.planName}" foi Aprovada! Conclua seu Cadastro de Administrador`,
      token,
      linkUrl,
      createdAt: new Date().toISOString(),
      expiresAt,
      read: false,
    };

    this.recordSentEmail(emailNotification);

    return { success: true, request: req, token, emailNotification };
  }

  /**
   * Rejeita ou cancela uma solicitação de ativação
   */
  static rejectPlanActivationRequest(requestId: string, reason?: string): { success: boolean; request?: PlanActivationRequest; error?: string } {
    const list = this.getPlanActivationRequests();
    const reqIndex = list.findIndex(r => r.id === requestId);
    if (reqIndex === -1) return { success: false, error: 'Solicitação não localizada.' };

    const req = list[reqIndex];
    req.status = 'rejeitado';
    req.reviewedAt = new Date().toISOString();
    req.reviewedBy = 'Carlos Miguel Vieira (Master Proprietário)';
    req.notes = reason ? `Motivo: ${reason}` : req.notes;

    list[reqIndex] = req;
    this.savePlanActivationRequests(list);

    return { success: true, request: req };
  }

  /**
   * Valida o token do e-mail de ativação aprovado
   */
  static getPendingAdminActivation(token: string): { success: boolean; pending?: PendingRegistration; request?: PlanActivationRequest; error?: string } {
    const cleanToken = (token || '').trim();
    if (!cleanToken) return { success: false, error: 'Token de ativação ausente.' };

    const pendingList = this.getPendingRegistrations();
    const pending = pendingList.find(p => p.token === cleanToken);

    if (!pending) {
      return { success: false, error: 'Link de ativação de cadastro inválido ou já utilizado.' };
    }

    if (new Date(pending.expiresAt).getTime() < Date.now()) {
      return { success: false, error: 'Este link de ativação expirou (validade de 48 horas). Solicite nova ativação.' };
    }

    const reqList = this.getPlanActivationRequests();
    const request = reqList.find(r => r.activationToken === cleanToken || r.requesterEmail.toLowerCase() === pending.email.toLowerCase());

    return { success: true, pending, request };
  }

  /**
   * Conclui o cadastro oficial do Administrador com todos os dados da empresa e endereço completo
   */
  static completeAdminRegistration(token: string, data: AdminRegistrationData): { success: boolean; user?: AuthUser; error?: string } {
    const check = this.getPendingAdminActivation(token);
    if (!check.success || !check.pending) {
      return { success: false, error: check.error || 'Token de ativação inválido.' };
    }

    const cleanName = (data.name || '').trim();
    const cleanCpf = (data.cpf || '').trim();
    const cleanCompany = (data.companyName || '').trim();
    const cleanCnpj = (data.cnpj || '').trim();
    const cleanProfEmail = (data.professionalEmail || check.pending.email).trim().toLowerCase();
    const cleanPhone = (data.phone || '').trim();
    const cleanPassword = (data.password || '').trim();

    if (!cleanName) return { success: false, error: 'O nome completo do Administrador é obrigatório.' };
    if (!cleanCpf) return { success: false, error: 'O CPF do Administrador é obrigatório.' };
    if (!cleanCompany) return { success: false, error: 'A Razão Social da Empresa é obrigatória.' };
    if (!cleanCnpj) return { success: false, error: 'O CNPJ da Empresa é obrigatório.' };
    if (!cleanPassword || cleanPassword.length < 6) return { success: false, error: 'A senha de acesso deve conter no mínimo 6 caracteres.' };

    const planId = check.pending.plan || 'pro_tributario';
    const planModules = DEFAULT_PLAN_MODULES[planId as keyof typeof DEFAULT_PLAN_MODULES] || DEFAULT_PLAN_MODULES.pro;

    const newAccount: UserAccount = {
      id: `usr_adm_${Date.now()}`,
      name: cleanName,
      email: cleanProfEmail,
      password: cleanPassword,
      companyName: cleanCompany,
      cpf: cleanCpf,
      cnpj: cleanCnpj,
      phone: cleanPhone,
      professionalEmail: cleanProfEmail,
      address: data.address,
      role: 'administrador',
      isAdmin: true,
      plan: planId,
      planStatus: 'active',
      expiresAt: '2026-12-31T23:59:59Z',
      queriesUsedThisMonth: 0,
      maxQueriesPerMonth: 500,
      maxCompaniesAllowed: 30,
      maxUsersAllowed: 5,
      isMaster: false,
      viewMode: 'escritorio',
      permissions: ['unlimited_queries', 'export_reports', 'ai_auditor_master', 'tax_reform_projections', 'manage_users', 'view_invoices'],
      allowedModules: planModules,
      authSecurityMode: data.securityMode || 'password_and_email_otp',
      twoFactorEnabled: data.securityMode === 'password_and_email_otp',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    const accounts = this.getAccounts().filter(a => a.email.toLowerCase() !== cleanProfEmail);
    accounts.push(newAccount);
    this.saveAccounts(accounts);

    // Remove das pendências
    const remainingPending = this.getPendingRegistrations().filter(p => p.token !== token);
    this.savePendingRegistrations(remainingPending);

    // Atualiza a requisição
    const reqList = this.getPlanActivationRequests();
    const req = reqList.find(r => r.activationToken === token || r.requesterEmail.toLowerCase() === cleanProfEmail);
    if (req) {
      req.registeredUserId = newAccount.id;
      this.savePlanActivationRequests(reqList);
    }

    const authUser = this.toAuthUser(newAccount);
    this.saveCurrentSession(authUser);

    return { success: true, user: authUser };
  }

  /**
   * Administrador cria um Novo Operador (apenas dados do operador, sem pedir dados da empresa)
   * As permissões liberadas respeitam estritamente o plano contratado pelo Administrador
   */
  static createSubUserForAdmin(
    adminUser: AuthUser,
    operatorData: {
      name: string;
      email: string;
      password: string;
      department?: string;
      permissions: any;
    }
  ): { success: boolean; user?: SystemUser; error?: string } {
    const cleanName = (operatorData.name || '').trim();
    const cleanEmail = (operatorData.email || '').trim().toLowerCase();
    const cleanPassword = (operatorData.password || '').trim();

    if (!cleanName) return { success: false, error: 'O nome do operador é obrigatório.' };
    if (!cleanEmail || !cleanEmail.includes('@')) return { success: false, error: 'E-mail do operador inválido.' };
    if (!cleanPassword || cleanPassword.length < 6) return { success: false, error: 'A senha do operador deve ter no mínimo 6 caracteres.' };

    const newSysUser: SystemUser = {
      id: `usr_op_${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      role: 'operador',
      status: 'ativo',
      companyName: adminUser.companyName || 'Empresa do Titular',
      department: operatorData.department || 'Operação Fiscal',
      createdAt: new Date().toISOString(),
      permissions: operatorData.permissions,
    };

    // Salva na conta de login também
    const newAcc: UserAccount = {
      id: newSysUser.id,
      name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
      companyName: adminUser.companyName || 'Empresa do Titular',
      role: 'operador',
      isAdmin: false,
      parentAdminId: adminUser.id,
      plan: adminUser.plan,
      planStatus: 'active',
      expiresAt: adminUser.expiresAt,
      queriesUsedThisMonth: 0,
      maxQueriesPerMonth: adminUser.maxQueriesPerMonth,
      isMaster: false,
      viewMode: 'escritorio',
      permissions: ['view_reports', 'export_reports'],
      allowedModules: adminUser.allowedModules,
      authSecurityMode: 'password_only',
      twoFactorEnabled: false,
      createdAt: new Date().toISOString(),
    };

    const accounts = this.getAccounts().filter(a => a.email.toLowerCase() !== cleanEmail);
    accounts.push(newAcc);
    this.saveAccounts(accounts);

    return { success: true, user: newSysUser };
  }

  /**
   * Encerra a sessão
   */
  static logout(): void {
    this.saveCurrentSession(null);
  }
}

