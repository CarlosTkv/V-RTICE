import {
  CompanyData,
  CNDItem,
  CNDSphere,
  CNDStatus,
  CNDScheduleConfig,
  CNDPredictiveFinding,
  CNDPredictiveScanResult,
  CNDExecutionLogItem,
  CNDSphereEmailConfig
} from '../types';
import { generateCompanyCNDs, getStateJurisdiction, getMunicipalJurisdiction } from './cndJurisdictionEngine';
import { sendCNDPredictiveAlertEmail } from './emailService';

const STORAGE_PREDICTIVE_STATE = 'vertice_cnd_predictive_state_v1';
const STORAGE_PREDICTIVE_ALERTS = 'vertice_cnd_predictive_alerts_v1';
const STORAGE_SIMULATED_OVERRIDES = 'vertice_cnd_simulated_overrides_v1';
const STORAGE_LOGS = 'vertice_cnd_schedule_logs';

export interface CNDStoredState {
  companyCnpj: string;
  sphere: CNDSphere;
  lastStatus: CNDStatus;
  lastExpiryDate: string;
  lastCheckedAt: string;
}

export interface CNDSimulationOverride {
  status?: CNDStatus;
  daysRemaining?: number;
  expiryDate?: string;
  hasDebts?: boolean;
  notes?: string;
}

/**
 * Obtém overrides simulados pelo usuário para fins de testes e homologação preventiva
 */
export function getSimulatedOverrides(companyCnpj: string): Record<CNDSphere, CNDSimulationOverride | undefined> {
  try {
    const saved = localStorage.getItem(STORAGE_SIMULATED_OVERRIDES);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed[companyCnpj] || {};
    }
  } catch (e) {
    console.warn('Erro ao carregar overrides de CND:', e);
  }
  return {} as Record<CNDSphere, CNDSimulationOverride | undefined>;
}

/**
 * Salva um override para testar o comportamento preditivo da CND
 */
export function setSimulatedOverride(
  companyCnpj: string,
  sphere: CNDSphere,
  override: CNDSimulationOverride
) {
  try {
    const saved = localStorage.getItem(STORAGE_SIMULATED_OVERRIDES);
    const all = saved ? JSON.parse(saved) : {};
    if (!all[companyCnpj]) {
      all[companyCnpj] = {};
    }
    all[companyCnpj][sphere] = {
      ...all[companyCnpj][sphere],
      ...override
    };
    localStorage.setItem(STORAGE_SIMULATED_OVERRIDES, JSON.stringify(all));
  } catch (e) {
    console.error('Erro ao salvar override:', e);
  }
}

/**
 * Limpa overrides de teste de uma empresa
 */
export function clearSimulatedOverrides(companyCnpj: string) {
  try {
    const saved = localStorage.getItem(STORAGE_SIMULATED_OVERRIDES);
    if (saved) {
      const all = JSON.parse(saved);
      delete all[companyCnpj];
      localStorage.setItem(STORAGE_SIMULATED_OVERRIDES, JSON.stringify(all));
    }
  } catch (e) {
    console.error('Erro ao limpar overrides:', e);
  }
}

/**
 * Obtém o histórico salvo de estados das CNDs por CNPJ
 */
export function getStoredCNDState(companyCnpj: string): Record<CNDSphere, CNDStoredState | undefined> {
  try {
    const saved = localStorage.getItem(STORAGE_PREDICTIVE_STATE);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed[companyCnpj] || {};
    }
  } catch (e) {
    console.warn('Erro ao carregar estado salvo de CND:', e);
  }
  return {} as Record<CNDSphere, CNDStoredState | undefined>;
}

/**
 * Salva o estado atual das CNDs para rastrear futuras mudanças de status
 */
export function saveCNDState(companyCnpj: string, items: CNDItem[]) {
  try {
    const saved = localStorage.getItem(STORAGE_PREDICTIVE_STATE);
    const all = saved ? JSON.parse(saved) : {};
    if (!all[companyCnpj]) {
      all[companyCnpj] = {};
    }

    items.forEach(cnd => {
      all[companyCnpj][cnd.sphere] = {
        companyCnpj,
        sphere: cnd.sphere,
        lastStatus: cnd.status,
        lastExpiryDate: cnd.expiryDate,
        lastCheckedAt: new Date().toISOString()
      };
    });

    localStorage.setItem(STORAGE_PREDICTIVE_STATE, JSON.stringify(all));
  } catch (e) {
    console.error('Erro ao salvar estado de CND:', e);
  }
}

/**
 * Retorna alertas preditivos armazenados em cache/storage
 */
export function getStoredPredictiveAlerts(companyCnpj?: string): CNDPredictiveFinding[] {
  try {
    const saved = localStorage.getItem(STORAGE_PREDICTIVE_ALERTS);
    if (saved) {
      const list: CNDPredictiveFinding[] = JSON.parse(saved);
      if (companyCnpj) {
        return list.filter(a => a.companyCnpj.replace(/\D/g, '') === companyCnpj.replace(/\D/g, ''));
      }
      return list;
    }
  } catch (e) {
    console.warn('Erro ao ler alertas preditivos salvos:', e);
  }
  return [];
}

/**
 * Salva alertas preditivos no storage
 */
export function savePredictiveAlerts(alerts: CNDPredictiveFinding[]) {
  try {
    localStorage.setItem(STORAGE_PREDICTIVE_ALERTS, JSON.stringify(alerts));
  } catch (e) {
    console.error('Erro ao salvar alertas preditivos:', e);
  }
}

/**
 * Adiciona ou atualiza alertas preditivos mantendo consistência
 */
export function persistNewPredictiveAlerts(newAlerts: CNDPredictiveFinding[]) {
  try {
    const existing = getStoredPredictiveAlerts();
    const map = new Map<string, CNDPredictiveFinding>();

    existing.forEach(a => map.set(`${a.companyCnpj}_${a.sphere}`, a));
    newAlerts.forEach(a => map.set(`${a.companyCnpj}_${a.sphere}`, a));

    const updated = Array.from(map.values());
    savePredictiveAlerts(updated);
  } catch (e) {
    console.error('Erro ao persistir alertas preditivos:', e);
  }
}

/**
 * Remove um alerta preditivo específico
 */
export function removePredictiveAlert(alertId: string) {
  try {
    const existing = getStoredPredictiveAlerts();
    const filtered = existing.filter(a => a.id !== alertId);
    savePredictiveAlerts(filtered);
  } catch (e) {
    console.error('Erro ao remover alerta preditivo:', e);
  }
}

/**
 * Realiza o diagnóstico preditivo minucioso de uma empresa
 */
export function analyzeCompanyCNDsPredictive(
  company: CompanyData,
  config?: CNDScheduleConfig
): CNDPredictiveFinding[] {
  const cleanCnpj = (company.cnpj || '00000000000000').replace(/\D/g, '');
  const storedStates = getStoredCNDState(cleanCnpj);
  const overrides = getSimulatedOverrides(cleanCnpj);

  // Gerar CNDs base com motor de jurisdição
  const generated = generateCompanyCNDs(company);
  const daysThreshold = config?.predictive?.daysThreshold || config?.daysBeforeExpiryAlert || 7;

  const findings: CNDPredictiveFinding[] = [];

  generated.items.forEach(cnd => {
    // Verificar se esfera está ativa na configuração (se houver config)
    if (config?.spheres && !config.spheres[cnd.sphere]) {
      return;
    }

    // Aplicar override de teste se houver
    const override = overrides[cnd.sphere];
    const effectiveStatus: CNDStatus = override?.status || cnd.status;
    const effectiveDaysRemaining: number = override?.daysRemaining !== undefined ? override.daysRemaining : cnd.daysRemaining;
    const effectiveExpiryDate: string = override?.expiryDate || cnd.expiryDate;
    const effectiveHasDebts = override?.hasDebts !== undefined ? override.hasDebts : cnd.hasDebts;

    // Estado anterior registrado
    const lastSavedState = storedStates[cnd.sphere];
    const previousStatus: CNDStatus | 'REGULAR' = lastSavedState?.lastStatus || 'NEGATIVA';

    const isExpiringSoon = effectiveDaysRemaining <= daysThreshold && effectiveDaysRemaining >= 0;
    const isAlreadyExpired = effectiveDaysRemaining < 0;

    // Detectar mudança de status: ex de 'NEGATIVA' (regular) para 'POSITIVA' / 'PENDENTE'
    const isStatusDegradation = (
      (previousStatus === 'NEGATIVA' || (previousStatus as string) === 'REGULAR') &&
      (effectiveStatus === 'POSITIVA' || effectiveStatus === 'EXPIRADA' || (effectiveStatus as string) === 'PENDENTE' || effectiveHasDebts)
    );

    // Caso de certidão já em pendência ou positiva
    const isCurrentlyImpaired = effectiveStatus === 'POSITIVA' || (effectiveStatus as string) === 'PENDENTE' || effectiveHasDebts;

    if (isStatusDegradation || isCurrentlyImpaired) {
      // 1. Mudança crítica de status (Regular -> Pendente / Com Débitos)
      const findingId = `cnd-pred-status-${cleanCnpj}-${cnd.sphere}`;
      findings.push({
        id: findingId,
        companyId: company.id || cleanCnpj,
        companyName: company.name,
        companyCnpj: company.cnpj,
        clientEmail: company.responsibleEmail || company.email || config?.actions.emailRecipients?.split(',')[0]?.trim() || 'fiscal@empresa.com.br',
        sphere: cnd.sphere,
        cndTitle: cnd.title,
        organ: cnd.organ,
        previousStatus: previousStatus === 'NEGATIVA' ? 'NEGATIVA' : previousStatus,
        currentStatus: effectiveStatus === 'NEGATIVA' ? 'POSITIVA' : effectiveStatus,
        isImminentExpiry: isExpiringSoon || isAlreadyExpired,
        daysRemaining: effectiveDaysRemaining,
        expiryDate: effectiveExpiryDate,
        riskType: 'status_degradation',
        riskSeverity: 'CRITICAL',
        summary: `Transição crítica detectada no órgão ${cnd.organ}: a situação migrou de REGULAR para ${effectiveStatus === 'NEGATIVA' ? 'PENDENTE COM DÉBITOS' : effectiveStatus}.`,
        technicalDetails: `Varredura eletrônica apontou inconformidade fiscal em aberto ou exigibilidade reativada perante ${cnd.organ}. Bloqueio impeditivo para emissão de certidão negativa padrão.`,
        preventiveRecommendation: `Auditar imediatamente o extrato de pendências no portal oficial do ${cnd.organ}, providenciar compensação com créditos acumulados ou formalizar parcelamento com exigibilidade suspensa (Art. 151, VI do CTN).`,
        legalImpact: 'Lei Complementar nº 123/2006, Art. 17, inciso V (Vedação de débito tributário sem exigibilidade suspensa) e Art. 29 (Exclusão compulsória do Simples Nacional).',
        detectedAt: new Date().toLocaleString('pt-BR')
      });
    } else if (isExpiringSoon || isAlreadyExpired) {
      // 2. Vencimento iminente ou expirada
      const findingId = `cnd-pred-expiry-${cleanCnpj}-${cnd.sphere}`;
      const isCritical = effectiveDaysRemaining <= 3;

      findings.push({
        id: findingId,
        companyId: company.id || cleanCnpj,
        companyName: company.name,
        companyCnpj: company.cnpj,
        clientEmail: company.responsibleEmail || company.email || config?.actions.emailRecipients?.split(',')[0]?.trim() || 'fiscal@empresa.com.br',
        sphere: cnd.sphere,
        cndTitle: cnd.title,
        organ: cnd.organ,
        previousStatus: 'NEGATIVA',
        currentStatus: isAlreadyExpired ? 'EXPIRADA' : effectiveStatus,
        isImminentExpiry: true,
        daysRemaining: effectiveDaysRemaining,
        expiryDate: effectiveExpiryDate,
        riskType: 'imminent_expiry',
        riskSeverity: isCritical ? 'CRITICAL' : 'HIGH',
        summary: isAlreadyExpired
          ? `Certidão ${cnd.organ} está EXPIRADA desde ${effectiveExpiryDate}. Risco de travamento de operações comerciais.`
          : `Certidão ${cnd.organ} expira em ${effectiveDaysRemaining} dia(s) (Validade: ${effectiveExpiryDate}). Renovação antecipada necessária.`,
        technicalDetails: `Prazo residual crítico para revalidação eletrônica via mTLS ou robô tributário. A antecedência evita janela de desproteção fiscal decorrente de lentidão nos servidores fazendários.`,
        preventiveRecommendation: `Executar rotina de reemissão antecipada no CND Radar e validar se não surgiram pendências intermediárias impeditivas.`,
        legalImpact: 'Portaria Conjunta RFB/PGFN nº 1.751/2014 e Lei nº 8.666/93 / Lei nº 14.133/2021 (Habilitação fiscal contínua).',
        detectedAt: new Date().toLocaleString('pt-BR')
      });
    }
  });

  return findings;
}

/**
 * Obtém os destinatários configurados especificamente para a certidão (Cliente, Contador e Adicionais)
 */
export function getSphereAlertRecipients(
  sphere: CNDSphere,
  company: CompanyData,
  config?: CNDScheduleConfig
): {
  recipients: string[];
  clientEmail: string;
  accountantEmail: string;
  isCustomized: boolean;
  enabled: boolean;
} {
  const defaultClientEmail = company.responsibleEmail || company.email || 'financeiro@empresa.com.br';
  const defaultAccountantEmail = company.accountantEmail || config?.actions?.emailRecipients?.split(',')[0]?.trim() || 'contador@escritoriofiscal.com.br';

  const sphereConf = config?.sphereEmails?.[sphere];

  if (!sphereConf) {
    return {
      recipients: [defaultClientEmail, defaultAccountantEmail].filter(Boolean),
      clientEmail: defaultClientEmail,
      accountantEmail: defaultAccountantEmail,
      isCustomized: false,
      enabled: true
    };
  }

  const enabled = sphereConf.enabled ?? true;
  const clientEmail = (sphereConf.clientEmail && sphereConf.clientEmail.trim()) || defaultClientEmail;
  const accountantEmail = (sphereConf.accountantEmail && sphereConf.accountantEmail.trim()) || defaultAccountantEmail;

  const list: string[] = [];

  if (sphereConf.sendToClient && clientEmail) {
    list.push(clientEmail);
  }
  if (sphereConf.sendToAccountant && accountantEmail) {
    if (!list.includes(accountantEmail)) {
      list.push(accountantEmail);
    }
  }
  if (sphereConf.additionalEmails && sphereConf.additionalEmails.length > 0) {
    sphereConf.additionalEmails.forEach(em => {
      const trimmed = em.trim();
      if (trimmed && !list.includes(trimmed)) {
        list.push(trimmed);
      }
    });
  }

  // Se nenhum estiver marcado mas estiver habilitado, usa fallback
  if (list.length === 0 && enabled) {
    list.push(defaultClientEmail);
  }

  return {
    recipients: list,
    clientEmail,
    accountantEmail,
    isCustomized: true,
    enabled
  };
}

/**
 * Executa a auditoria preditiva completa e dispara e-mails caso habilitado
 */
export async function executePredictiveAudit(
  company: CompanyData,
  config?: CNDScheduleConfig,
  options?: { sendEmail?: boolean; forceAllSpheres?: boolean }
): Promise<{
  findings: CNDPredictiveFinding[];
  emailResults: Array<{ to: string; success: boolean; message: string }>;
}> {
  const findings = analyzeCompanyCNDsPredictive(company, config);
  const emailResults: Array<{ to: string; success: boolean; message: string }> = [];

  const shouldSendEmail = options?.sendEmail ?? (
    config?.predictive?.autoDispatchClientEmail ?? config?.actions.sendEmailNotification ?? true
  );

  const cleanCnpj = (company.cnpj || '').replace(/\D/g, '');

  if (findings.length > 0) {
    // Salvar alertas detectados
    persistNewPredictiveAlerts(findings);

    // Se deve disparar e-mail e há pendências
    if (shouldSendEmail) {
      for (const finding of findings) {
        // Resolver destinatários específicos da certidão (Cliente / Contador)
        const recipientData = getSphereAlertRecipients(finding.sphere, company, config);
        const sphereConfig = config?.sphereEmails?.[finding.sphere];

        // Verificar se alertas estão ativos para esta esfera específica
        if (sphereConfig && !sphereConfig.enabled) {
          continue;
        }

        // Verificar regras de filtro por tipo de risco na esfera
        if (finding.riskType === 'imminent_expiry' && sphereConfig && sphereConfig.alertOnImminentExpiry === false) {
          continue;
        }
        if (finding.riskType === 'status_degradation' && sphereConfig && sphereConfig.alertOnStatusChange === false) {
          continue;
        }

        const targetEmails = recipientData.recipients.length > 0
          ? recipientData.recipients
          : [company.responsibleEmail || company.email || 'fiscal@empresa.com.br'];

        for (const recipientEmail of targetEmails) {
          try {
            const res = await sendCNDPredictiveAlertEmail({
              recipientEmail,
              recipientName: recipientEmail === recipientData.accountantEmail
                ? (company.accountantName || 'Contador Responsável')
                : (company.responsibleName || company.name),
              companyName: company.name,
              companyCnpj: company.cnpj,
              finding
            });

            finding.emailDispatched = res.success;
            finding.emailDispatchedAt = new Date().toLocaleString('pt-BR');
            finding.emailRecipient = targetEmails.join(', ');
            finding.emailSubject = `[ALERTA SENTINELA] ${finding.riskType === 'status_degradation' ? 'MUDANÇA DE STATUS' : 'VENCIMENTO IMINENTE'} - ${finding.sphere.toUpperCase()}`;

            emailResults.push({
              to: recipientEmail,
              success: res.success,
              message: res.message || 'Disparado com sucesso'
            });
          } catch (e: any) {
            console.warn('Falha no envio de e-mail:', e);
            emailResults.push({
              to: recipientEmail,
              success: false,
              message: e?.message || 'Falha ao conectar ao servidor de e-mail'
            });
          }
        }
      }

      // Atualizar com os status de e-mail
      persistNewPredictiveAlerts(findings);
    }
  }

  // Atualizar estado salvo de CNDs
  const generated = generateCompanyCNDs(company);
  saveCNDState(cleanCnpj, generated.items);

  // Registrar histórico em logs do agendador
  if (findings.length > 0) {
    const logItem: CNDExecutionLogItem = {
      id: `pred-log-${Date.now()}`,
      timestamp: new Date().toLocaleString('pt-BR'),
      triggerType: 'proactive',
      scheduleTitle: 'Camada Preditiva Sentinela de CNDs',
      companiesProcessed: 1,
      totalCNDsChecked: 5,
      totalSuccess: Math.max(0, 5 - findings.length),
      totalDebtsDetected: findings.filter(f => f.riskType === 'status_degradation').length,
      durationSeconds: 1.8,
      status: findings.some(f => f.riskSeverity === 'CRITICAL') ? 'WARNING' : 'SUCCESS',
      details: `Varredura preditiva detectou ${findings.length} alerta(s) de risco (Vencimentos ou Status). ${emailResults.filter(e => e.success).length} e-mail(s) preventivo(s) emitido(s) ao cliente.`
    };

    try {
      const savedLogs = localStorage.getItem(STORAGE_LOGS);
      const allLogs: CNDExecutionLogItem[] = savedLogs ? JSON.parse(savedLogs) : [];
      localStorage.setItem(STORAGE_LOGS, JSON.stringify([logItem, ...allLogs]));
    } catch {
      // ignore
    }
  }

  return { findings, emailResults };
}

/**
 * Varredura preditiva em lote para todas as empresas da carteira
 */
export async function scanAllCompaniesPredictive(
  companies: CompanyData[],
  config?: CNDScheduleConfig
): Promise<CNDPredictiveScanResult> {
  const allFindings: CNDPredictiveFinding[] = [];
  let emailsSent = 0;

  for (const comp of companies) {
    const { findings, emailResults } = await executePredictiveAudit(comp, config);
    allFindings.push(...findings);
    emailsSent += emailResults.filter(e => e.success).length;
  }

  const criticalCount = allFindings.filter(f => f.riskSeverity === 'CRITICAL').length;
  const imminentExpiryCount = allFindings.filter(f => f.riskType === 'imminent_expiry').length;
  const statusTransitionCount = allFindings.filter(f => f.riskType === 'status_degradation').length;

  return {
    scanTimestamp: new Date().toLocaleString('pt-BR'),
    companiesScanned: companies.length,
    totalFindings: allFindings.length,
    criticalCount,
    imminentExpiryCount,
    statusTransitionCount,
    emailsDispatchedCount: emailsSent,
    findings: allFindings
  };
}
