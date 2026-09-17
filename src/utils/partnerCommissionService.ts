/**
 * Vértice Auditor Fiscal - Auditoria Tributária
 * Serviço de Gestão do Programa Oficial de Parceiros de Negócios
 * 
 * Regras do Programa:
 * 1. O Programa de Parceiros é ativado EXCLUSIVAMENTE pelo Usuário Master para cada usuário cadastrado.
 * 2. Quando ativo pelo Master, o Parceiro possui isenção ou plano homologado e gera Código de Indicação exclusivo.
 * 3. O Parceiro / Master define o "Desconto Concedido" (ex: 0% a 25%) para clientes que aderirem pelo código.
 * 4. O Desconto Concedido ao cliente é ABATIDO diretamente da Comissão do Parceiro:
 *    Comissão Líquida (%) = Comissão Base do Plano (%) - Desconto Concedido (%)
 * 5. Tabela de Comissões Base:
 *    - Starter Fiscal (R$ 197,00/mês): 20%
 *    - Pro Tributário (R$ 397,00/mês): 25%
 *    - Escritório Enterprise (R$ 890,00/mês): 30%
 *    - Master VIP Ilimitado (R$ 1.490,00/mês - Plano Mais Caro): 35% (LIMITE MÁXIMO ESTIPULADO)
 * 6. Planos Customizados:
 *    - O % de comissão se ajusta de forma AUTOMÁTICA e proporcional ao valor contratado (20% a 35%).
 * 7. Sem dados fictícios: os clientes e comissões são contabilizados a partir de assinaturas reais do sistema.
 */

import { AuthUser, SystemUser } from '../types';

export interface PartnerPlanCommissionRule {
  planId: string;
  planName: string;
  monthlyPrice: number;
  standardPriceMonthly?: number;
  baseCommissionRate: number; // Ex: 20, 25, 30, 35
  isTopTier?: boolean;
}

export interface PartnerCommissionCalculation {
  planId: string;
  planName: string;
  originalPrice: number;
  discountPercent: number; // Desconto dado ao cliente
  discountValue: number;
  finalClientPrice: number; // Preço pago pelo cliente
  clientPriceWithDiscount?: number;
  baseCommissionRate: number; // % base da tabela ou automático
  netCommissionRate: number; // baseCommissionRate - discountPercent
  monthlyCommissionValue: number; // Valor em R$ recebido pelo parceiro
  annualCommissionValue: number;
}

export interface PartnerReferralConfig {
  partnerId: string;
  partnerName: string;
  partnerEmail: string;
  referralCode: string;
  discountPercent: number; // Desconto concedido ao cliente indicado (0 a 25)
  baseCommissionRate?: number;
  pixKey: string;
  pixKeyType: 'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria';
  bankName: string;
  isPartnerActive: boolean;
  activatedByMaster?: boolean;
  activatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerReferredClient {
  id: string;
  referralCode: string;
  clientName: string;
  clientEmail: string;
  clientCnpj?: string;
  planId: string;
  planName: string;
  monthlyPriceOriginal: number;
  discountPercent: number;
  monthlyPriceFinal: number;
  monthlyPricePaid?: number;
  baseCommissionRate: number;
  netCommissionRate: number;
  monthlyCommissionValue: number;
  status: 'ativo' | 'trial' | 'cancelado';
  joinedDate: string;
  joinedAt?: string;
}

// Tabela oficial de comissões para planos padrão
export const STANDARD_PLAN_COMMISSIONS: PartnerPlanCommissionRule[] = [
  {
    planId: 'starter',
    planName: 'Starter Fiscal',
    monthlyPrice: 197.00,
    standardPriceMonthly: 197.00,
    baseCommissionRate: 20.0, // 20%
  },
  {
    planId: 'pro',
    planName: 'Pro Tributário',
    monthlyPrice: 397.00,
    standardPriceMonthly: 397.00,
    baseCommissionRate: 25.0, // 25%
  },
  {
    planId: 'enterprise',
    planName: 'Escritório Enterprise',
    monthlyPrice: 890.00,
    standardPriceMonthly: 890.00,
    baseCommissionRate: 30.0, // 30%
  },
  {
    planId: 'master',
    planName: 'Master VIP Ilimitado',
    monthlyPrice: 1490.00,
    standardPriceMonthly: 1490.00,
    baseCommissionRate: 35.0, // 35% - LIMITE MÁXIMO NO PLANO MAIS CARO
    isTopTier: true,
  }
];

export const MAX_PARTNER_COMMISSION_RATE = 35.0; // Teto estrito
export const MIN_PARTNER_COMMISSION_RATE = 20.0; // Piso inicial para planos de entrada

/**
 * Calcula automaticamente o percentual de comissão base para qualquer plano,
 * inclusive PLANOS CUSTOMIZADOS de qualquer valor mensal.
 */
export function calculateAutomaticBaseCommissionRate(monthlyPrice: number): number {
  if (monthlyPrice <= 0) return 0;
  if (monthlyPrice <= 197.00) return 20.0;
  if (monthlyPrice >= 1490.00) return MAX_PARTNER_COMMISSION_RATE; // 35.0%

  const minPrice = 197.00;
  const maxPrice = 1490.00;
  const ratio = (monthlyPrice - minPrice) / (maxPrice - minPrice);
  const calculatedRate = MIN_PARTNER_COMMISSION_RATE + ratio * (MAX_PARTNER_COMMISSION_RATE - MIN_PARTNER_COMMISSION_RATE);

  return Number(Math.min(MAX_PARTNER_COMMISSION_RATE, Math.max(MIN_PARTNER_COMMISSION_RATE, calculatedRate)).toFixed(1));
}

/**
 * Obtém a comissão base para um determinado plano (padrão ou customizado)
 */
export function getPlanBaseCommissionRate(planId: string, monthlyPrice?: number): number {
  const cleanId = (planId || '').toLowerCase();
  const standard = STANDARD_PLAN_COMMISSIONS.find(p => p.planId === cleanId);
  if (standard) {
    return standard.baseCommissionRate;
  }
  return calculateAutomaticBaseCommissionRate(monthlyPrice || 490.00);
}

/**
 * Calcula a comissão líquida do parceiro com abatimento do desconto concedido ao cliente
 */
export function calculatePartnerCommission(
  planId: string,
  planName: string,
  originalPrice: number,
  discountPercentGiven: number
): PartnerCommissionCalculation {
  const baseRate = getPlanBaseCommissionRate(planId, originalPrice);
  const safeDiscount = Math.max(0, Math.min(discountPercentGiven, baseRate));
  const netCommissionRate = Number(Math.max(0, baseRate - safeDiscount).toFixed(1));

  const discountValue = Number((originalPrice * (safeDiscount / 100)).toFixed(2));
  const finalClientPrice = Number((originalPrice - discountValue).toFixed(2));

  const monthlyCommissionValue = Number((finalClientPrice * (netCommissionRate / 100)).toFixed(2));
  const annualCommissionValue = Number((monthlyCommissionValue * 12).toFixed(2));

  return {
    planId,
    planName,
    originalPrice,
    discountPercent: safeDiscount,
    discountValue,
    finalClientPrice,
    clientPriceWithDiscount: finalClientPrice,
    baseCommissionRate: baseRate,
    netCommissionRate,
    monthlyCommissionValue,
    annualCommissionValue
  };
}

const PARTNER_CONFIGS_MAP_KEY = 'vertice_fiscal_partner_configs_map_v2';
const PARTNER_REFERRED_CLIENTS_KEY = 'vertice_fiscal_partner_clients_v2';

export class PartnerCommissionService {
  static calculateAutomaticBaseCommissionRate(monthlyPrice: number): number {
    return calculateAutomaticBaseCommissionRate(monthlyPrice);
  }

  static calculatePartnerCommission(planId: string, planName: string, originalPrice: number, discountPercentGiven: number) {
    return calculatePartnerCommission(planId, planName, originalPrice, discountPercentGiven);
  }

  /**
   * Recupera a configuração de parceiro de um usuário específico (ou cria padrão baseada nos dados do usuário)
   */
  static getPartnerConfig(user?: AuthUser | SystemUser | null): PartnerReferralConfig {
    const userEmail = (user?.email || '').trim().toLowerCase();
    const userName = user?.name || 'Parceiro Consultor';
    const isMaster = userEmail === 'contato@verticeanalises.com.br' || userEmail === 'carlosmiguelvieira1@gmail.com' || (user as AuthUser)?.isMaster || user?.role === 'master';
    const isPartnerActive = isMaster || Boolean(user?.isPartnerActive || user?.role === 'parceiro_negocios');

    const defaultCode = user?.partnerReferralCode || `VERTICE-${userName.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 8) || 'PARTNER'}`;
    const defaultDiscount = user?.partnerDiscountPercent ?? 10;
    const defaultPixKey = user?.partnerPixKey || userEmail || '';
    const defaultPixKeyType = user?.partnerPixKeyType || 'email';
    const defaultBankName = user?.partnerBankName || 'Banco do Brasil S.A.';

    try {
      const storedMap = localStorage.getItem(PARTNER_CONFIGS_MAP_KEY);
      if (storedMap) {
        const map = JSON.parse(storedMap);
        if (userEmail && map[userEmail]) {
          return {
            ...map[userEmail],
            isPartnerActive: isMaster ? true : (user?.isPartnerActive ?? map[userEmail].isPartnerActive ?? false)
          };
        }
      }
    } catch {}

    return {
      partnerId: user?.id || `partner_${Date.now()}`,
      partnerName: userName,
      partnerEmail: userEmail,
      referralCode: defaultCode,
      discountPercent: defaultDiscount,
      baseCommissionRate: user?.partnerCommissionRate || 25,
      pixKey: defaultPixKey,
      pixKeyType: defaultPixKeyType,
      bankName: defaultBankName,
      isPartnerActive,
      activatedByMaster: isMaster ? true : Boolean(user?.partnerActivatedByMaster),
      activatedAt: user?.partnerActivatedAt || new Date().toISOString(),
      createdAt: (user && 'createdAt' in user ? (user as any).createdAt : undefined) || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Salva a configuração atualizada do parceiro
   */
  static savePartnerConfig(config: PartnerReferralConfig): void {
    try {
      config.updatedAt = new Date().toISOString();
      const storedMap = localStorage.getItem(PARTNER_CONFIGS_MAP_KEY);
      const map = storedMap ? JSON.parse(storedMap) : {};
      const key = (config.partnerEmail || '').trim().toLowerCase();
      if (key) {
        map[key] = config;
        localStorage.setItem(PARTNER_CONFIGS_MAP_KEY, JSON.stringify(map));
      }
    } catch (e) {
      console.error('Erro ao salvar configuração do parceiro:', e);
    }
  }

  /**
   * Gera um código de indicação limpo e formatado
   */
  static generateCode(prefix?: string): string {
    const cleanPrefix = (prefix || 'VERTICE')
      .replace(/[^A-Za-z0-9]/g, '')
      .toUpperCase()
      .slice(0, 10);
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${cleanPrefix}-${randomSuffix}`;
  }

  /**
   * Lista todos os clientes indicados por um código de parceiro a partir de assinaturas reais
   */
  static getReferredClients(referralCode?: string): PartnerReferredClient[] {
    const cleanCode = (referralCode || '').trim().toUpperCase();
    const result: PartnerReferredClient[] = [];

    // 1. Verificar registros manuais persistidos
    try {
      const stored = localStorage.getItem(PARTNER_REFERRED_CLIENTS_KEY);
      if (stored) {
        const list: PartnerReferredClient[] = JSON.parse(stored);
        if (Array.isArray(list)) {
          list.forEach(c => {
            if (!cleanCode || c.referralCode?.toUpperCase() === cleanCode) {
              result.push(c);
            }
          });
        }
      }
    } catch {}

    // 2. Extrair das assinaturas reais do sistema vinculadas ao código de indicação
    try {
      const subsJson = localStorage.getItem('sna_admin_subscriptions') || localStorage.getItem('vertice_admin_subscriptions');
      if (subsJson) {
        const subs = JSON.parse(subsJson);
        if (Array.isArray(subs)) {
          subs.forEach((sub: any) => {
            if (sub && sub.referralCode && (!cleanCode || sub.referralCode.toUpperCase() === cleanCode)) {
              const alreadyIn = result.some(r => r.id === sub.id || r.clientEmail === sub.customerEmail);
              if (!alreadyIn) {
                const origPrice = sub.originalPrice || sub.pricePaid || 397;
                const discPct = sub.discountAppliedPercent || 10;
                const finalPrice = sub.pricePaid || Math.round(origPrice * (1 - discPct / 100));
                const baseRate = this.calculateAutomaticBaseCommissionRate(origPrice);
                const netRate = Math.max(0, baseRate - discPct);
                const commission = Math.round((finalPrice * (netRate / 100)) * 100) / 100;

                result.push({
                  id: sub.id,
                  referralCode: sub.referralCode,
                  clientName: sub.customerName || sub.companyName || 'Cliente Indicado',
                  clientEmail: sub.customerEmail || 'cliente@indicado.com',
                  clientCnpj: sub.customerDocument,
                  planId: sub.planId || 'pro',
                  planName: sub.planName || 'Pro Tributário',
                  monthlyPriceOriginal: origPrice,
                  discountPercent: discPct,
                  monthlyPriceFinal: finalPrice,
                  baseCommissionRate: baseRate,
                  netCommissionRate: netRate,
                  monthlyCommissionValue: commission,
                  status: sub.status === 'ativa' ? 'ativo' : 'cancelado',
                  joinedDate: sub.startDate || new Date().toISOString().split('T')[0]
                });
              }
            }
          });
        }
      }
    } catch {}

    return result;
  }

  /**
   * Valida se um código de indicação pertence a um parceiro ativo credenciado pelo Master
   */
  static validateReferralCode(code: string): {
    valid: boolean;
    discountPercent: number;
    partnerName: string;
    partner?: { id: string; name: string; email: string };
    message?: string;
  } {
    if (!code || !code.trim()) {
      return { valid: false, discountPercent: 0, partnerName: '' };
    }

    const cleanCode = code.trim().toUpperCase();

    // 1. Procurar nas configurações de parceiros salvas
    try {
      const storedMap = localStorage.getItem(PARTNER_CONFIGS_MAP_KEY);
      if (storedMap) {
        const map = JSON.parse(storedMap);
        for (const email of Object.keys(map)) {
          const cfg = map[email];
          if (cfg && cfg.referralCode?.toUpperCase() === cleanCode && cfg.isPartnerActive) {
            return {
              valid: true,
              discountPercent: cfg.discountPercent || 10,
              partnerName: cfg.partnerName || 'Parceiro Oficial Vértice Auditor Fiscal',
              partner: {
                id: cfg.partnerId,
                name: cfg.partnerName,
                email: cfg.partnerEmail
              },
              message: `Código de Parceiro Válido! Você recebeu ${cfg.discountPercent}% de desconto concedido por ${cfg.partnerName}.`
            };
          }
        }
      }
    } catch {}

    // 2. Procurar nos usuários cadastrados no sistema que tenham o programa de parceiros ativo
    try {
      const usersJson = localStorage.getItem('sna_admin_users') || localStorage.getItem('vertice_registered_accounts_v2');
      if (usersJson) {
        const users = JSON.parse(usersJson);
        if (Array.isArray(users)) {
          for (const u of users) {
            const userCode = (u.partnerReferralCode || '').trim().toUpperCase();
            const isActive = u.isPartnerActive || u.role === 'master' || u.role === 'parceiro_negocios';
            if (userCode && userCode === cleanCode && isActive) {
              const discount = u.partnerDiscountPercent ?? 10;
              return {
                valid: true,
                discountPercent: discount,
                partnerName: u.name || 'Parceiro Homologado',
                partner: {
                  id: u.id,
                  name: u.name,
                  email: u.email
                },
                message: `Código de Parceiro Ativo! Você recebeu ${discount}% de desconto na mensalidade.`
              };
            }
          }
        }
      }
    } catch {}

    return {
      valid: false,
      discountPercent: 0,
      partnerName: '',
      message: 'Código de indicação não localizado ou parceiro não ativado pelo Master.'
    };
  }

  static validateCode(code: string) {
    return this.validateReferralCode(code);
  }

  /**
   * Adiciona um novo cliente indicado à carteira do parceiro
   */
  static registerReferredClient(data: {
    partnerId?: string;
    partnerName?: string;
    referralCode?: string;
    clientName: string;
    clientEmail: string;
    clientCnpj?: string;
    planId: string;
    planName: string;
    originalPlanPrice?: number;
    monthlyPriceOriginal?: number;
    discountPercentGiven?: number;
    discountPercent?: number;
    billingPeriodicity?: string;
    status?: 'ativo' | 'trial' | 'cancelado';
    paymentStatus?: string;
  }): PartnerReferredClient {
    const list = this.getReferredClients();
    const origPrice = data.monthlyPriceOriginal || data.originalPlanPrice || 397;
    const discPct = data.discountPercentGiven ?? data.discountPercent ?? 10;
    const finalPrice = Math.round(origPrice * (1 - discPct / 100));
    
    const baseRate = this.calculateAutomaticBaseCommissionRate(origPrice);
    const netRate = Math.max(0, baseRate - discPct);
    const monthlyCommission = Math.round((finalPrice * (netRate / 100)) * 100) / 100;

    const newClient: PartnerReferredClient = {
      id: `cli_ref_${Date.now()}`,
      referralCode: data.referralCode || 'VERTICE-REF',
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      clientCnpj: data.clientCnpj || '00.000.000/0001-00',
      planId: data.planId,
      planName: data.planName,
      monthlyPriceOriginal: origPrice,
      discountPercent: discPct,
      monthlyPriceFinal: finalPrice,
      baseCommissionRate: baseRate,
      netCommissionRate: netRate,
      monthlyCommissionValue: monthlyCommission,
      status: data.status || 'ativo',
      joinedDate: new Date().toISOString().split('T')[0]
    };

    list.unshift(newClient);
    try {
      localStorage.setItem(PARTNER_REFERRED_CLIENTS_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Erro ao registrar cliente indicado:', e);
    }

    return newClient;
  }

  /**
   * Resumo financeiro real da carteira
   */
  static getFinancialSummary(referralCode?: string) {
    const clients = this.getReferredClients(referralCode);
    const activeClients = clients.filter(c => c.status === 'ativo');

    const monthlyTotalCommission = activeClients.reduce((acc, c) => acc + c.monthlyCommissionValue, 0);
    const annualTotalCommission = monthlyTotalCommission * 12;
    const totalClientsReferred = clients.length;
    const totalActiveClients = activeClients.length;

    return {
      totalClientsReferred,
      totalActiveClients,
      monthlyTotalCommission,
      annualTotalCommission,
      clients
    };
  }
}
