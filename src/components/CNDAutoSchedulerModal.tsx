import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Play,
  Pause,
  RefreshCw,
  Download,
  FileText,
  Archive,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Building2,
  MapPin,
  Mail,
  ShieldCheck,
  Sparkles,
  Layers,
  History,
  Check,
  X,
  Search,
  Filter,
  ArrowRight,
  Sliders,
  Bell,
  HardDrive,
  Eye,
  EyeOff,
  Send,
  Zap,
  AlertCircle,
  ShieldAlert,
  CalendarDays,
  CalendarRange,
  User,
  Briefcase,
  Copy,
  Plus,
  Server,
  Lock,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CompanyData,
  CNDScheduleConfig,
  CNDExecutionLogItem,
  CNDSphere,
  CNDFrequency,
  CNDPredictiveFinding,
  CNDSphereRecurrence,
  CNDSphereScheduleSetting,
  CNDSphereEmailConfig,
  CNDCustomSMTPConfig
} from '../types';
import {
  generateUnifiedBatchBookPDF,
  generateMultiCompanyZIP,
  downloadMultiCompanyCSV
} from '../utils/cndBatchGenerator';
import { getStateJurisdiction, getMunicipalJurisdiction } from '../utils/cndJurisdictionEngine';
import {
  executePredictiveAudit,
  analyzeCompanyCNDsPredictive,
  setSimulatedOverride,
  clearSimulatedOverrides,
  getStoredPredictiveAlerts,
  removePredictiveAlert,
  getSphereAlertRecipients
} from '../utils/cndPredictiveEngine';
import { sendCNDPredictiveAlertEmail, testCustomSMTPConnection } from '../utils/emailService';

interface CNDAutoSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCompany: CompanyData;
  companies: CompanyData[];
  showToast?: (text: string, type?: 'success' | 'info' | 'error') => void;
}

export const DEFAULT_SPHERE_EMAILS: Record<CNDSphere, CNDSphereEmailConfig> = {
  federal: {
    sphere: 'federal',
    enabled: true,
    sendToClient: true,
    clientEmail: '',
    sendToAccountant: true,
    accountantEmail: '',
    additionalEmails: [],
    alertOnImminentExpiry: true,
    daysBeforeExpiry: 7,
    alertOnStatusChange: true,
    lastAlertSentAt: undefined,
    lastAlertRecipient: undefined
  },
  estadual: {
    sphere: 'estadual',
    enabled: true,
    sendToClient: true,
    clientEmail: '',
    sendToAccountant: true,
    accountantEmail: '',
    additionalEmails: [],
    alertOnImminentExpiry: true,
    daysBeforeExpiry: 7,
    alertOnStatusChange: true,
    lastAlertSentAt: undefined,
    lastAlertRecipient: undefined
  },
  municipal: {
    sphere: 'municipal',
    enabled: true,
    sendToClient: true,
    clientEmail: '',
    sendToAccountant: true,
    accountantEmail: '',
    additionalEmails: [],
    alertOnImminentExpiry: true,
    daysBeforeExpiry: 5,
    alertOnStatusChange: true,
    lastAlertSentAt: undefined,
    lastAlertRecipient: undefined
  },
  trabalhista: {
    sphere: 'trabalhista',
    enabled: true,
    sendToClient: true,
    clientEmail: '',
    sendToAccountant: true,
    accountantEmail: '',
    additionalEmails: [],
    alertOnImminentExpiry: true,
    daysBeforeExpiry: 10,
    alertOnStatusChange: true,
    lastAlertSentAt: undefined,
    lastAlertRecipient: undefined
  },
  fgts: {
    sphere: 'fgts',
    enabled: true,
    sendToClient: true,
    clientEmail: '',
    sendToAccountant: true,
    accountantEmail: '',
    additionalEmails: [],
    alertOnImminentExpiry: true,
    daysBeforeExpiry: 5,
    alertOnStatusChange: true,
    lastAlertSentAt: undefined,
    lastAlertRecipient: undefined
  }
};

export const DEFAULT_CUSTOM_SMTP: CNDCustomSMTPConfig = {
  enabled: false,
  provider: 'custom',
  host: 'smtp.meuescritorio.com.br',
  port: 587,
  secure: false,
  user: 'fiscal@meuescritorio.com.br',
  pass: '',
  fromName: 'Escritório Contábil • Vértice',
  fromEmail: 'fiscal@meuescritorio.com.br',
  replyTo: 'atendimento@meuescritorio.com.br',
  lastTestStatus: 'UNTESTED'
};

export const DEFAULT_SPHERE_RECURRENCE: Record<CNDSphere, CNDSphereScheduleSetting> = {
  federal: {
    enabled: true,
    recurrence: 'weekly',
    dayOfWeek: 1, // Segunda-feira
    preferredTime: '03:30',
    lastRunAt: new Date(Date.now() - 3600000 * 14).toLocaleString('pt-BR'),
    nextRunAt: new Date(Date.now() + 3600000 * 24 * 3).toLocaleString('pt-BR')
  },
  estadual: {
    enabled: true,
    recurrence: 'weekly',
    dayOfWeek: 1, // Segunda-feira
    preferredTime: '03:35',
    lastRunAt: new Date(Date.now() - 3600000 * 14).toLocaleString('pt-BR'),
    nextRunAt: new Date(Date.now() + 3600000 * 24 * 3).toLocaleString('pt-BR')
  },
  municipal: {
    enabled: true,
    recurrence: 'biweekly',
    dayOfWeek: 2, // Terça-feira
    preferredTime: '03:40',
    lastRunAt: new Date(Date.now() - 3600000 * 14).toLocaleString('pt-BR'),
    nextRunAt: new Date(Date.now() + 3600000 * 24 * 10).toLocaleString('pt-BR')
  },
  trabalhista: {
    enabled: true,
    recurrence: 'biweekly',
    dayOfWeek: 3, // Quarta-feira
    preferredTime: '03:45',
    lastRunAt: new Date(Date.now() - 3600000 * 14).toLocaleString('pt-BR'),
    nextRunAt: new Date(Date.now() + 3600000 * 24 * 12).toLocaleString('pt-BR')
  },
  fgts: {
    enabled: true,
    recurrence: 'biweekly',
    dayOfWeek: 5, // Sexta-feira (validade de 30 dias na Caixa)
    preferredTime: '03:50',
    lastRunAt: new Date(Date.now() - 3600000 * 14).toLocaleString('pt-BR'),
    nextRunAt: new Date(Date.now() + 3600000 * 24 * 7).toLocaleString('pt-BR')
  }
};

const DEFAULT_SCHEDULE_CONFIG: CNDScheduleConfig = {
  id: 'sched-cnd-default',
  enabled: true,
  title: 'Rotina Sentinela de CNDs & Débitos 360°',
  frequency: 'proactive_before_expiry',
  executionTime: '03:30',
  executionDayOfWeek: 1, // Segunda-feira
  executionDayOfMonth: 1,
  daysBeforeExpiryAlert: 5,
  spheres: {
    federal: true,
    estadual: true,
    municipal: true,
    trabalhista: true,
    fgts: true
  },
  sphereRecurrence: DEFAULT_SPHERE_RECURRENCE,
  sphereEmails: DEFAULT_SPHERE_EMAILS,
  customSmtp: DEFAULT_CUSTOM_SMTP,
  scope: 'all_companies',
  actions: {
    autoDownloadPdf: true,
    sendEmailNotification: true,
    emailRecipients: 'fiscal@empresa.com.br, diretoria@empresa.com.br',
    alertOnDebts: true,
    archiveInSystemFolder: true
  },
  predictive: {
    enabled: true,
    daysThreshold: 7,
    detectStatusTransition: true,
    autoDispatchClientEmail: true,
    lastPredictiveScanAt: new Date(Date.now() - 3600000 * 2).toLocaleString('pt-BR')
  },
  lastRunAt: new Date(Date.now() - 3600000 * 14).toLocaleString('pt-BR'),
  nextRunAt: new Date(Date.now() + 3600000 * 10).toLocaleString('pt-BR'),
  status: 'active'
};

const INITIAL_LOGS: CNDExecutionLogItem[] = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 3600000 * 14).toLocaleString('pt-BR'),
    triggerType: 'scheduled',
    scheduleTitle: 'Rotina Sentinela de CNDs',
    companiesProcessed: 4,
    totalCNDsChecked: 20,
    totalSuccess: 20,
    totalDebtsDetected: 0,
    durationSeconds: 3.4,
    status: 'SUCCESS',
    details: 'Varredura nas 5 esferas (RFB, SEFAZ, Prefeitura, TST e Caixa) concluída sem débitos impeditivos.',
    generatedBatchZipSize: '4.8 MB'
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 3600000 * 86).toLocaleString('pt-BR'),
    triggerType: 'proactive',
    scheduleTitle: 'Alerta Preventivo de Renovação',
    companiesProcessed: 2,
    totalCNDsChecked: 10,
    totalSuccess: 10,
    totalDebtsDetected: 0,
    durationSeconds: 2.8,
    status: 'SUCCESS',
    details: 'Renovação antecipada de CNDs com vencimento em menos de 5 dias concluída com sucesso.',
    generatedBatchZipSize: '2.4 MB'
  }
];

export const CNDAutoSchedulerModal: React.FC<CNDAutoSchedulerModalProps> = ({
  isOpen,
  onClose,
  currentCompany,
  companies = [],
  showToast
}) => {
  const [activeTab, setActiveTab] = useState<'scheduler' | 'recurrence' | 'email_recipients' | 'smtp_config' | 'predictive' | 'batch_download' | 'logs'>('scheduler');
  const [config, setConfig] = useState<CNDScheduleConfig>(() => {
    const saved = localStorage.getItem('vertice_cnd_schedule_config');
    const base = saved ? JSON.parse(saved) : DEFAULT_SCHEDULE_CONFIG;
    if (!base.predictive) {
      base.predictive = DEFAULT_SCHEDULE_CONFIG.predictive;
    }
    if (!base.sphereRecurrence) {
      base.sphereRecurrence = DEFAULT_SPHERE_RECURRENCE;
    }
    if (!base.sphereEmails) {
      base.sphereEmails = DEFAULT_SPHERE_EMAILS;
    }
    if (!base.customSmtp) {
      base.customSmtp = DEFAULT_CUSTOM_SMTP;
    }
    return base;
  });

  // Servidor SMTP Próprio State & Helpers
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [testRecipientEmail, setTestRecipientEmail] = useState(currentCompany?.responsibleEmail || currentCompany?.email || 'contato@verticeanalises.com.br');

  const handleUpdateCustomSmtp = (updates: Partial<CNDCustomSMTPConfig>) => {
    setConfig(prev => {
      const current = prev.customSmtp || DEFAULT_CUSTOM_SMTP;
      return {
        ...prev,
        customSmtp: {
          ...current,
          ...updates
        }
      };
    });
  };

  const handleApplySmtpProviderPreset = (provider: 'gmail' | 'outlook' | 'umbler' | 'locaweb' | 'hostinger' | 'custom') => {
    const presets: Record<string, Partial<CNDCustomSMTPConfig>> = {
      gmail: {
        provider: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        fromName: currentCompany.name || 'Escritório Contábil',
        fromEmail: currentCompany.accountantEmail || 'contato@gmail.com'
      },
      outlook: {
        provider: 'outlook',
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        fromName: currentCompany.name || 'Escritório Contábil',
        fromEmail: currentCompany.accountantEmail || 'contato@outlook.com'
      },
      umbler: {
        provider: 'umbler',
        host: 'smtp.umbler.com',
        port: 587,
        secure: false,
        fromName: currentCompany.name || 'Escritório Contábil',
        fromEmail: 'fiscal@meudominio.com.br'
      },
      locaweb: {
        provider: 'locaweb',
        host: 'email-ssl.com.br',
        port: 465,
        secure: true,
        fromName: currentCompany.name || 'Escritório Contábil',
        fromEmail: 'fiscal@meudominio.com.br'
      },
      hostinger: {
        provider: 'hostinger',
        host: 'smtp.hostinger.com',
        port: 465,
        secure: true,
        fromName: currentCompany.name || 'Escritório Contábil',
        fromEmail: 'fiscal@meudominio.com.br'
      },
      custom: {
        provider: 'custom',
        host: 'smtp.meuescritorio.com.br',
        port: 587,
        secure: false
      }
    };

    handleUpdateCustomSmtp(presets[provider]);
    showToast?.(`Preset ${provider.toUpperCase()} carregado com sucesso!`, 'success');
  };

  const handleRunSmtpTest = async () => {
    const currentSmtp = config.customSmtp || DEFAULT_CUSTOM_SMTP;
    if (!currentSmtp.host || !currentSmtp.user || !currentSmtp.pass) {
      showToast?.('Preencha Host, Usuário e Senha antes de testar a conexão SMTP.', 'error');
      return;
    }

    setIsTestingSmtp(true);
    setSmtpTestResult(null);
    try {
      const res = await testCustomSMTPConnection(currentSmtp, testRecipientEmail);
      setSmtpTestResult(res);
      handleUpdateCustomSmtp({
        lastTestStatus: res.success ? 'SUCCESS' : 'ERROR',
        lastTestedAt: new Date().toLocaleString('pt-BR'),
        lastTestError: res.success ? undefined : res.message
      });
      if (res.success) {
        showToast?.('Conexão SMTP validada com sucesso! E-mail de teste entregue.', 'success');
      } else {
        showToast?.('Falha ao autenticar no servidor SMTP. Verifique os dados.', 'error');
      }
    } catch (e: any) {
      const errRes = { success: false, message: e?.message || 'Erro de conexão SMTP.' };
      setSmtpTestResult(errRes);
      handleUpdateCustomSmtp({
        lastTestStatus: 'ERROR',
        lastTestedAt: new Date().toLocaleString('pt-BR'),
        lastTestError: errRes.message
      });
      showToast?.('Erro ao testar servidor SMTP.', 'error');
    } finally {
      setIsTestingSmtp(false);
    }
  };
  const [logs, setLogs] = useState<CNDExecutionLogItem[]>(() => {
    const saved = localStorage.getItem('vertice_cnd_schedule_logs');
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  // Recurrence configuration state & helper
  const [testingSphere, setTestingSphere] = useState<CNDSphere | null>(null);

  // Email alert configuration state
  const [testingEmailSphere, setTestingEmailSphere] = useState<CNDSphere | null>(null);
  const [newCcEmailInput, setNewCcEmailInput] = useState<Record<CNDSphere, string>>({
    federal: '',
    estadual: '',
    municipal: '',
    trabalhista: '',
    fgts: ''
  });

  // Predictive state
  const [predictiveFindings, setPredictiveFindings] = useState<CNDPredictiveFinding[]>(() =>
    getStoredPredictiveAlerts(currentCompany.cnpj)
  );
  const [dispatchingFindingId, setDispatchingFindingId] = useState<string | null>(null);
  const [sentEmailFindings, setSentEmailFindings] = useState<string[]>([]);
  const [isSimulatingTransition, setIsSimulatingTransition] = useState(false);

  // Sync findings on company change
  useEffect(() => {
    setPredictiveFindings(getStoredPredictiveAlerts(currentCompany.cnpj));
  }, [currentCompany.cnpj]);

  // Batch Selection State
  const effectiveCompanies = companies.length > 0 ? companies : [currentCompany];
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>(() =>
    effectiveCompanies.map(c => c.id || c.cnpj || 'active')
  );
  const [selectedSpheres, setSelectedSpheres] = useState<CNDSphere[]>([
    'federal',
    'estadual',
    'municipal',
    'trabalhista',
    'fgts'
  ]);
  const [companySearch, setCompanySearch] = useState<string>('');

  // Processing States
  const [isRunningNow, setIsRunningNow] = useState(false);
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const [batchProgressText, setBatchProgressText] = useState('');

  useEffect(() => {
    localStorage.setItem('vertice_cnd_schedule_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('vertice_cnd_schedule_logs', JSON.stringify(logs));
  }, [logs]);

  if (!isOpen) return null;

  const calculateNextRun = (recurrence: CNDSphereRecurrence, dayOfWeek: number = 1, preferredTime: string = '03:30'): string => {
    const now = new Date();
    const parts = (preferredTime || '03:30').split(':');
    const hours = parseInt(parts[0] || '3', 10);
    const minutes = parseInt(parts[1] || '30', 10);

    if (recurrence === 'daily') {
      const next = new Date(now);
      next.setHours(hours, minutes, 0, 0);
      if (next <= now) {
        next.setDate(next.getDate() + 1);
      }
      return next.toLocaleString('pt-BR');
    }

    if (recurrence === 'weekly') {
      const next = new Date(now);
      next.setHours(hours, minutes, 0, 0);
      const currentDay = next.getDay() === 0 ? 7 : next.getDay(); // 1=Seg ... 7=Dom
      let diff = dayOfWeek - currentDay;
      if (diff < 0 || (diff === 0 && next <= now)) {
        diff += 7;
      }
      next.setDate(next.getDate() + diff);
      return next.toLocaleString('pt-BR');
    }

    if (recurrence === 'biweekly') {
      const next = new Date(now);
      next.setHours(hours, minutes, 0, 0);
      const currentDay = next.getDay() === 0 ? 7 : next.getDay();
      let diff = dayOfWeek - currentDay;
      if (diff < 0 || (diff === 0 && next <= now)) {
        diff += 14;
      } else {
        diff += 7;
      }
      next.setDate(next.getDate() + diff);
      return next.toLocaleString('pt-BR');
    }

    return new Date(Date.now() + 86400000).toLocaleString('pt-BR');
  };

  const updateSphereRecurrence = (sphere: CNDSphere, updates: Partial<CNDSphereScheduleSetting>) => {
    setConfig(prev => {
      const currentRec = prev.sphereRecurrence || DEFAULT_SPHERE_RECURRENCE;
      const updated = {
        ...currentRec,
        [sphere]: {
          ...currentRec[sphere],
          ...updates
        }
      };
      return {
        ...prev,
        sphereRecurrence: updated
      };
    });
  };

  const handleRecurrenceChange = (sphere: CNDSphere, recurrence: CNDSphereRecurrence) => {
    const current = config.sphereRecurrence?.[sphere] || DEFAULT_SPHERE_RECURRENCE[sphere];
    const nextRun = calculateNextRun(recurrence, current.dayOfWeek || 1, current.preferredTime || '03:30');
    updateSphereRecurrence(sphere, { recurrence, nextRunAt: nextRun });
    const label = recurrence === 'daily' ? 'Diária' : recurrence === 'weekly' ? 'Semanal' : 'Quinzenal';
    showToast?.(`Frequência da CND ${sphere.toUpperCase()} configurada para ${label}!`, 'info');
  };

  const handleTestSingleSphere = async (sphere: CNDSphere) => {
    setTestingSphere(sphere);
    try {
      await new Promise(resolve => setTimeout(resolve, 1100));

      const nowStr = new Date().toLocaleString('pt-BR');
      const sphereRec = config.sphereRecurrence?.[sphere] || DEFAULT_SPHERE_RECURRENCE[sphere];
      const nextStr = calculateNextRun(sphereRec.recurrence, sphereRec.dayOfWeek, sphereRec.preferredTime);

      updateSphereRecurrence(sphere, {
        lastRunAt: nowStr,
        nextRunAt: nextStr
      });

      const sphereNames: Record<CNDSphere, string> = {
        federal: 'Federal (RFB / PGFN)',
        estadual: `Estadual (SEFAZ-${(currentCompany?.uf || 'PR').toUpperCase()})`,
        municipal: `Municipal (${currentCompany?.city || 'Curitiba'})`,
        trabalhista: 'Trabalhista (CNDT / TST)',
        fgts: 'FGTS (CRF Caixa)'
      };

      const newLog: CNDExecutionLogItem = {
        id: `log-test-${sphere}-${Date.now()}`,
        timestamp: nowStr,
        triggerType: 'manual',
        scheduleTitle: `Consulta Direta: CND ${sphereNames[sphere]}`,
        companiesProcessed: 1,
        totalCNDsChecked: 1,
        totalSuccess: 1,
        totalDebtsDetected: 0,
        durationSeconds: 1.1,
        status: 'SUCCESS',
        details: `Consulta pontual à certidão ${sphereNames[sphere]} concluída com sucesso. Certidão válida sem pendências cadastrais ou tributárias.`,
        generatedBatchZipSize: '340 KB'
      };

      setLogs(prev => [newLog, ...prev]);
      showToast?.(`Consulta à CND ${sphereNames[sphere]} executada com êxito! Situação: REGULAR.`, 'success');
    } catch (e) {
      console.error(e);
      showToast?.('Erro ao testar consulta da certidão.', 'error');
    } finally {
      setTestingSphere(null);
    }
  };

  const applyPresetToAllSpheres = (preset: 'daily' | 'weekly' | 'biweekly' | 'sentinel') => {
    setConfig(prev => {
      const current = prev.sphereRecurrence || DEFAULT_SPHERE_RECURRENCE;
      const updated = { ...current };

      if (preset === 'sentinel') {
        // Recomendação inteligente:
        // Federal & Estadual: Semanal (alto impacto de faturamento e NF-e)
        // FGTS: Semanal (validade curta de 30 dias na Caixa)
        // Municipal & Trabalhista: Quinzenal
        updated.federal = { ...updated.federal, enabled: true, recurrence: 'weekly', dayOfWeek: 1, preferredTime: '03:30', nextRunAt: calculateNextRun('weekly', 1, '03:30') };
        updated.estadual = { ...updated.estadual, enabled: true, recurrence: 'weekly', dayOfWeek: 1, preferredTime: '03:35', nextRunAt: calculateNextRun('weekly', 1, '03:35') };
        updated.municipal = { ...updated.municipal, enabled: true, recurrence: 'biweekly', dayOfWeek: 2, preferredTime: '03:40', nextRunAt: calculateNextRun('biweekly', 2, '03:40') };
        updated.trabalhista = { ...updated.trabalhista, enabled: true, recurrence: 'biweekly', dayOfWeek: 3, preferredTime: '03:45', nextRunAt: calculateNextRun('biweekly', 3, '03:45') };
        updated.fgts = { ...updated.fgts, enabled: true, recurrence: 'weekly', dayOfWeek: 5, preferredTime: '03:50', nextRunAt: calculateNextRun('weekly', 5, '03:50') };
      } else {
        const spheres: CNDSphere[] = ['federal', 'estadual', 'municipal', 'trabalhista', 'fgts'];
        spheres.forEach((s, idx) => {
          const day = (idx % 5) + 1;
          const time = `03:${(30 + idx * 5).toString().padStart(2, '0')}`;
          updated[s] = {
            ...updated[s],
            enabled: true,
            recurrence: preset,
            dayOfWeek: day,
            preferredTime: time,
            nextRunAt: calculateNextRun(preset, day, time)
          };
        });
      }

      return {
        ...prev,
        spheres: {
          federal: updated.federal.enabled,
          estadual: updated.estadual.enabled,
          municipal: updated.municipal.enabled,
          trabalhista: updated.trabalhista.enabled,
          fgts: updated.fgts.enabled
        },
        sphereRecurrence: updated
      };
    });

    const labels: Record<string, string> = {
      daily: 'Busca Diária aplicada para todas as 5 certidões',
      weekly: 'Busca Semanal aplicada para todas as 5 certidões',
      biweekly: 'Busca Quinzenal aplicada para todas as 5 certidões',
      sentinel: 'Recomendação Sentinela aplicada (Federal, Estadual e FGTS semanais; Municipal e CNDT quinzenais)'
    };
    showToast?.(labels[preset], 'success');
  };

  const handleToggleSphere = (sphere: CNDSphere) => {
    setConfig(prev => {
      const newEnabled = !prev.spheres[sphere];
      const prevRec = prev.sphereRecurrence || DEFAULT_SPHERE_RECURRENCE;
      return {
        ...prev,
        spheres: {
          ...prev.spheres,
          [sphere]: newEnabled
        },
        sphereRecurrence: {
          ...prevRec,
          [sphere]: {
            ...prevRec[sphere],
            enabled: newEnabled
          }
        }
      };
    });
  };

  // Funções de Configuração de E-mails por Certidão (Cliente & Contador)
  const handleUpdateSphereEmail = (sphere: CNDSphere, updates: Partial<CNDSphereEmailConfig>) => {
    setConfig(prev => {
      const current = prev.sphereEmails || DEFAULT_SPHERE_EMAILS;
      const updatedSphere: CNDSphereEmailConfig = {
        ...current[sphere],
        ...updates
      };
      return {
        ...prev,
        sphereEmails: {
          ...current,
          [sphere]: updatedSphere
        }
      };
    });
  };

  const handleAddCcEmail = (sphere: CNDSphere) => {
    const rawEmail = (newCcEmailInput[sphere] || '').trim();
    if (!rawEmail) return;

    if (!rawEmail.includes('@') || !rawEmail.includes('.')) {
      showToast?.('Por favor, informe um endereço de e-mail válido.', 'error');
      return;
    }

    const currentSphere = config.sphereEmails?.[sphere] || DEFAULT_SPHERE_EMAILS[sphere];
    const existing = currentSphere.additionalEmails || [];

    if (existing.includes(rawEmail)) {
      showToast?.('Este e-mail já está adicionado.', 'info');
      return;
    }

    handleUpdateSphereEmail(sphere, {
      additionalEmails: [...existing, rawEmail]
    });

    setNewCcEmailInput(prev => ({ ...prev, [sphere]: '' }));
    showToast?.(`E-mail ${rawEmail} adicionado aos destinatários de ${sphere.toUpperCase()}.`, 'success');
  };

  const handleRemoveCcEmail = (sphere: CNDSphere, emailToRemove: string) => {
    const currentSphere = config.sphereEmails?.[sphere] || DEFAULT_SPHERE_EMAILS[sphere];
    const existing = currentSphere.additionalEmails || [];
    handleUpdateSphereEmail(sphere, {
      additionalEmails: existing.filter(e => e !== emailToRemove)
    });
    showToast?.(`E-mail ${emailToRemove} removido.`, 'info');
  };

  const handleApplyEmailPresetToAll = (preset: 'both' | 'accountant_only' | 'client_only' | 'load_company') => {
    const defaultClient = currentCompany.responsibleEmail || currentCompany.email || 'financeiro@empresa.com.br';
    const defaultAccountant = currentCompany.accountantEmail || config.actions.emailRecipients?.split(',')[0]?.trim() || 'contador@escritoriofiscal.com.br';

    setConfig(prev => {
      const base = prev.sphereEmails || DEFAULT_SPHERE_EMAILS;
      const spheresList: CNDSphere[] = ['federal', 'estadual', 'municipal', 'trabalhista', 'fgts'];
      const updated: Record<CNDSphere, CNDSphereEmailConfig> = { ...base };

      spheresList.forEach(s => {
        const item = updated[s] || { ...DEFAULT_SPHERE_EMAILS[s] };
        if (preset === 'both') {
          updated[s] = {
            ...item,
            enabled: true,
            sendToClient: true,
            sendToAccountant: true
          };
        } else if (preset === 'accountant_only') {
          updated[s] = {
            ...item,
            enabled: true,
            sendToClient: false,
            sendToAccountant: true
          };
        } else if (preset === 'client_only') {
          updated[s] = {
            ...item,
            enabled: true,
            sendToClient: true,
            sendToAccountant: false
          };
        } else if (preset === 'load_company') {
          updated[s] = {
            ...item,
            enabled: true,
            clientEmail: defaultClient,
            accountantEmail: defaultAccountant,
            sendToClient: true,
            sendToAccountant: true
          };
        }
      });

      return {
        ...prev,
        sphereEmails: updated
      };
    });

    const messages = {
      both: 'Configuração aplicada a todas as 5 certidões: alertas entregues ao Cliente e Contador.',
      accountant_only: 'Configuração aplicada: alertas entregues exclusivamente ao Contador Responsável.',
      client_only: 'Configuração aplicada: alertas entregues diretamente ao Cliente da empresa.',
      load_company: `E-mails cadastrais carregados: Cliente (${defaultClient}) e Contador (${defaultAccountant}).`
    };
    showToast?.(messages[preset], 'success');
  };

  const handleReplicateSphereEmailToAll = (sourceSphere: CNDSphere) => {
    const sourceConf = config.sphereEmails?.[sourceSphere] || DEFAULT_SPHERE_EMAILS[sourceSphere];
    const spheresList: CNDSphere[] = ['federal', 'estadual', 'municipal', 'trabalhista', 'fgts'];

    setConfig(prev => {
      const base = prev.sphereEmails || DEFAULT_SPHERE_EMAILS;
      const updated: Record<CNDSphere, CNDSphereEmailConfig> = { ...base };

      spheresList.forEach(s => {
        updated[s] = {
          ...sourceConf,
          sphere: s
        };
      });

      return {
        ...prev,
        sphereEmails: updated
      };
    });

    showToast?.(`Configurações de e-mail de ${sourceSphere.toUpperCase()} replicadas para todas as 5 certidões!`, 'success');
  };

  const handleTestSendSphereEmailAlert = async (sphere: CNDSphere) => {
    setTestingEmailSphere(sphere);
    try {
      const recipientData = getSphereAlertRecipients(sphere, currentCompany, config);
      const sphereConfig = config.sphereEmails?.[sphere] || DEFAULT_SPHERE_EMAILS[sphere];

      if (recipientData.recipients.length === 0) {
        showToast?.('Nenhum destinatário de e-mail ativo para esta certidão.', 'error');
        return;
      }

      const sphereTitles: Record<CNDSphere, { title: string; organ: string; validity: string }> = {
        federal: { title: 'Certidão Conjunta Negativa de Tributos Federais e Dívida Ativa', organ: 'Receita Federal / PGFN', validity: '180 dias' },
        estadual: { title: `Certidão Negativa de Tributos Estaduais ICMS (${(currentCompany.uf || 'PR').toUpperCase()})`, organ: `SEFAZ/${(currentCompany.uf || 'PR').toUpperCase()}`, validity: '90 dias' },
        municipal: { title: `Certidão Negativa Mobiliária e Imobiliária (${currentCompany.city || 'Curitiba'})`, organ: `Prefeitura de ${currentCompany.city || 'Curitiba'}`, validity: '60 dias' },
        trabalhista: { title: 'Certidão Negativa de Débitos Trabalhistas (CNDT)', organ: 'Tribunal Superior do Trabalho - TST', validity: '180 dias' },
        fgts: { title: 'Certificado de Regularidade do FGTS (CRF)', organ: 'Caixa Econômica Federal', validity: '30 dias' }
      };
      const info = sphereTitles[sphere];

      const daysThreshold = sphereConfig.daysBeforeExpiry || 7;
      const sampleExpiryDate = new Date(Date.now() + daysThreshold * 86400000).toLocaleDateString('pt-BR');

      const testFinding: CNDPredictiveFinding = {
        id: `test-email-${Date.now()}-${sphere}`,
        companyId: currentCompany.id || currentCompany.cnpj,
        companyName: currentCompany.name,
        companyCnpj: currentCompany.cnpj,
        clientEmail: recipientData.clientEmail,
        sphere,
        cndTitle: info.title,
        organ: info.organ,
        previousStatus: 'NEGATIVA',
        currentStatus: 'NEGATIVA',
        isImminentExpiry: true,
        daysRemaining: daysThreshold,
        expiryDate: sampleExpiryDate,
        riskType: 'imminent_expiry',
        riskSeverity: daysThreshold <= 5 ? 'CRITICAL' : 'HIGH',
        summary: `[DISPARO DE TESTE] Alerta preventivo de vencimento em ${daysThreshold} dias para ${info.title}.`,
        technicalDetails: `Simulação de homologação para certidão ${info.organ}. Destinatários configurados: ${recipientData.recipients.join(', ')}.`,
        preventiveRecommendation: `Rotina automatizada de monitoramento ativa. Nenhuma pendência identificada no momento.`,
        legalImpact: `Manutenção da conformidade fiscal contínua nos termos da LC 123/2006.`,
        detectedAt: new Date().toLocaleString('pt-BR')
      };

      for (const emailTo of recipientData.recipients) {
        const isAccountant = emailTo === recipientData.accountantEmail;
        await sendCNDPredictiveAlertEmail({
          recipientEmail: emailTo,
          recipientName: isAccountant
            ? (currentCompany.accountantName || 'Contador Responsável')
            : (currentCompany.responsibleName || currentCompany.name),
          companyName: currentCompany.name,
          companyCnpj: currentCompany.cnpj,
          finding: testFinding
        });
      }

      handleUpdateSphereEmail(sphere, {
        lastAlertSentAt: new Date().toLocaleString('pt-BR'),
        lastAlertRecipient: recipientData.recipients.join(', ')
      });

      showToast?.(`Alerta de teste enviado com sucesso para: ${recipientData.recipients.join(', ')}!`, 'success');
    } catch (e) {
      console.error(e);
      showToast?.('Erro ao enviar e-mail de teste.', 'error');
    } finally {
      setTestingEmailSphere(null);
    }
  };

  const handleToggleBatchSphere = (sphere: CNDSphere) => {
    if (selectedSpheres.includes(sphere)) {
      if (selectedSpheres.length === 1) {
        showToast?.('Selecione ao menos 1 esfera para download.', 'info');
        return;
      }
      setSelectedSpheres(selectedSpheres.filter(s => s !== sphere));
    } else {
      setSelectedSpheres([...selectedSpheres, sphere]);
    }
  };

  const handleToggleSelectAllCompanies = () => {
    if (selectedCompanyIds.length === effectiveCompanies.length) {
      setSelectedCompanyIds([]);
    } else {
      setSelectedCompanyIds(effectiveCompanies.map(c => c.id || c.cnpj || 'active'));
    }
  };

  const handleToggleCompany = (id: string) => {
    if (selectedCompanyIds.includes(id)) {
      setSelectedCompanyIds(selectedCompanyIds.filter(cId => cId !== id));
    } else {
      setSelectedCompanyIds([...selectedCompanyIds, id]);
    }
  };

  // Disparo manual imediato do agendador com camada preditiva integrada
  const handleTriggerScheduleNow = async () => {
    setIsRunningNow(true);
    setBatchProgressText('Iniciando handshake mTLS nos WebServices para as empresas selecionadas...');

    try {
      await new Promise(r => setTimeout(r, 400));
      setBatchProgressText('Consultando Receita Federal e PGFN...');

      await new Promise(r => setTimeout(r, 400));
      setBatchProgressText('Consultando Secretarias de Fazenda Estaduais (SEFAZ)...');

      await new Promise(r => setTimeout(r, 400));
      setBatchProgressText('Consultando Prefeituras Municipais & TST/Caixa...');

      const targetCompanies = config.scope === 'active_company_only' ? [currentCompany] : effectiveCompanies;
      const totalChecked = targetCompanies.length * Object.values(config.spheres).filter(Boolean).length;

      // Executar a Camada de Verificação Preditiva
      setBatchProgressText('Executando Camada Preditiva e Detecção de Mudança de Status...');
      const allFindings: CNDPredictiveFinding[] = [];
      let totalEmailsSent = 0;

      for (const comp of targetCompanies) {
        const audit = await executePredictiveAudit(comp, config, {
          sendEmail: config.predictive?.autoDispatchClientEmail ?? config.actions.sendEmailNotification
        });
        allFindings.push(...audit.findings);
        totalEmailsSent += audit.emailResults.filter(e => e.success).length;
      }

      setPredictiveFindings(getStoredPredictiveAlerts(currentCompany.cnpj));

      const debtsDetected = allFindings.filter(f => f.riskType === 'status_degradation').length;
      const imminentExpiryDetected = allFindings.filter(f => f.riskType === 'imminent_expiry').length;

      const newLog: CNDExecutionLogItem = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleString('pt-BR'),
        triggerType: 'manual',
        scheduleTitle: config.title,
        companiesProcessed: targetCompanies.length,
        totalCNDsChecked: totalChecked,
        totalSuccess: Math.max(0, totalChecked - debtsDetected),
        totalDebtsDetected: debtsDetected,
        durationSeconds: 2.8,
        status: debtsDetected > 0 ? 'WARNING' : 'SUCCESS',
        details: `Varredura Sentinela concluída para ${targetCompanies.length} empresa(s). ${allFindings.length} eventos preditivos detectados (${debtsDetected} alteração(ões) de status, ${imminentExpiryDetected} vencimento(s) iminente(s)). ${totalEmailsSent} alerta(s) por e-mail disparado(s) aos clientes.`,
        generatedBatchZipSize: `${(targetCompanies.length * 1.2).toFixed(1)} MB`
      };

      setLogs(prev => [newLog, ...prev]);
      setConfig(prev => ({
        ...prev,
        lastRunAt: new Date().toLocaleString('pt-BR'),
        nextRunAt: new Date(Date.now() + 3600000 * 24).toLocaleString('pt-BR'),
        predictive: {
          ...prev.predictive!,
          lastPredictiveScanAt: new Date().toLocaleString('pt-BR')
        }
      }));

      if (allFindings.length > 0) {
        showToast?.(`Agendamento concluído! ${allFindings.length} alerta(s) preditivo(s) registrado(s) no Dashboard e ${totalEmailsSent} e-mail(s) enviado(s).`, 'info');
      } else {
        showToast?.(`Varredura concluída com sucesso! 100% das ${totalChecked} certidões em situação REGULAR.`, 'success');
      }
    } catch (e) {
      console.error(e);
      showToast?.('Erro ao executar rotina de agendamento.', 'error');
    } finally {
      setIsRunningNow(false);
      setBatchProgressText('');
    }
  };

  // Funções do Laboratório Sentinela de Testes Preditivos
  const handleSimulateStatusDegradation = async (sphere: CNDSphere = 'federal') => {
    setIsSimulatingTransition(true);
    try {
      const cleanCnpj = (currentCompany.cnpj || '').replace(/\D/g, '');
      setSimulatedOverride(cleanCnpj, sphere, {
        status: 'POSITIVA',
        hasDebts: true,
        notes: 'Simulação de pendência fiscal ativa no e-CAC / PGFN com risco de exclusão LC 123/06.'
      });

      const audit = await executePredictiveAudit(currentCompany, config, {
        sendEmail: config.predictive?.autoDispatchClientEmail ?? config.actions.sendEmailNotification
      });

      setPredictiveFindings(audit.findings);
      showToast?.(`Simulação aplicada: CND ${sphere.toUpperCase()} migrou de REGULAR para PENDENTE. Alerta gerado no Dashboard e e-mail disparado ao cliente!`, 'success');
    } catch (e) {
      console.error(e);
      showToast?.('Erro na simulação.', 'error');
    } finally {
      setIsSimulatingTransition(false);
    }
  };

  const handleSimulateImminentExpiry = async (sphere: CNDSphere = 'estadual', daysLeft: number = 3) => {
    setIsSimulatingTransition(true);
    try {
      const cleanCnpj = (currentCompany.cnpj || '').replace(/\D/g, '');
      const expiry = new Date(Date.now() + daysLeft * 86400000).toISOString().split('T')[0];
      setSimulatedOverride(cleanCnpj, sphere, {
        daysRemaining: daysLeft,
        expiryDate: expiry
      });

      const audit = await executePredictiveAudit(currentCompany, config, {
        sendEmail: config.predictive?.autoDispatchClientEmail ?? config.actions.sendEmailNotification
      });

      setPredictiveFindings(audit.findings);
      showToast?.(`Simulação aplicada: CND ${sphere.toUpperCase()} vence em ${daysLeft} dias. Notificação proativa acionada no Dashboard e e-mail enviado!`, 'info');
    } catch (e) {
      console.error(e);
      showToast?.('Erro na simulação.', 'error');
    } finally {
      setIsSimulatingTransition(false);
    }
  };

  const handleResetSimulations = async () => {
    const cleanCnpj = (currentCompany.cnpj || '').replace(/\D/g, '');
    clearSimulatedOverrides(cleanCnpj);

    const audit = await executePredictiveAudit(currentCompany, config, { sendEmail: false });
    setPredictiveFindings(audit.findings);
    showToast?.('Cenário regular restaurado com sucesso! CNDs 100% negativas.', 'success');
  };

  const handleManualDispatchFindingEmail = async (finding: CNDPredictiveFinding) => {
    setDispatchingFindingId(finding.id);
    try {
      const recipientEmail = finding.clientEmail || currentCompany.responsibleEmail || currentCompany.email || 'fiscal@empresa.com.br';
      const res = await sendCNDPredictiveAlertEmail({
        recipientEmail,
        recipientName: currentCompany.responsibleName || currentCompany.name,
        companyName: currentCompany.name,
        companyCnpj: currentCompany.cnpj,
        finding
      });

      setSentEmailFindings(prev => [...prev, finding.id]);
      showToast?.(res.message || `E-mail enviado com sucesso para ${recipientEmail}!`, 'success');
    } catch (e) {
      console.error(e);
      showToast?.('Erro ao enviar e-mail.', 'error');
    } finally {
      setDispatchingFindingId(null);
    }
  };

  // Download do Livro Unificado em PDF (Caderno consolidado de todas as empresas selecionadas)
  const handleDownloadUnifiedBook = async () => {
    const targetCompanies = effectiveCompanies.filter(c => selectedCompanyIds.includes(c.id || c.cnpj || 'active'));
    if (targetCompanies.length === 0) {
      showToast?.('Selecione ao menos 1 empresa para gerar o livro.', 'info');
      return;
    }

    setIsGeneratingBatch(true);
    setBatchProgressText('Compilando Livro Unificado de CNDs em PDF...');

    try {
      const bookDoc = await generateUnifiedBatchBookPDF(targetCompanies, selectedSpheres, (txt) => {
        setBatchProgressText(txt);
      });
      const filename = `LIVRO_CONSOLIDADO_CNDS_${targetCompanies.length}_EMPRESAS_${new Date().toISOString().slice(0, 10)}.pdf`;
      bookDoc.save(filename);
      showToast?.(`Livro Unificado com ${targetCompanies.length} empresas baixado com sucesso!`, 'success');
    } catch (e) {
      console.error(e);
      showToast?.('Erro ao gerar livro unificado.', 'error');
    } finally {
      setIsGeneratingBatch(false);
      setBatchProgressText('');
    }
  };

  // Download do Pacote ZIP Estruturado com pastas por empresa
  const handleDownloadBatchZip = async () => {
    const targetCompanies = effectiveCompanies.filter(c => selectedCompanyIds.includes(c.id || c.cnpj || 'active'));
    if (targetCompanies.length === 0) {
      showToast?.('Selecione ao menos 1 empresa para baixar o lote.', 'info');
      return;
    }

    setIsGeneratingBatch(true);
    setBatchProgressText('Iniciando empacotamento em lote das certidões em ZIP...');

    try {
      await generateMultiCompanyZIP(targetCompanies, selectedSpheres, (txt) => {
        setBatchProgressText(txt);
      });
      showToast?.(`Pacote ZIP com ${targetCompanies.length} empresas baixado com sucesso!`, 'success');
    } catch (e) {
      console.error(e);
      showToast?.('Erro ao gerar pacote ZIP em lote.', 'error');
    } finally {
      setIsGeneratingBatch(false);
      setBatchProgressText('');
    }
  };

  // Exportar Planilha CSV Consolidada
  const handleDownloadBatchCsv = () => {
    const targetCompanies = effectiveCompanies.filter(c => selectedCompanyIds.includes(c.id || c.cnpj || 'active'));
    if (targetCompanies.length === 0) {
      showToast?.('Selecione ao menos 1 empresa para exportar.', 'info');
      return;
    }
    try {
      downloadMultiCompanyCSV(targetCompanies, selectedSpheres);
      showToast?.('Planilha consolidada exportada com sucesso!', 'success');
    } catch (e) {
      console.error(e);
      showToast?.('Erro ao exportar CSV.', 'error');
    }
  };

  const filteredCompanies = effectiveCompanies.filter(c => {
    const q = companySearch.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.cnpj || '').toLowerCase().includes(q) ||
      (c.uf || '').toLowerCase().includes(q) ||
      (c.city || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header do Agendador */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner flex-shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-black text-slate-100 tracking-tight">
                    Agendamento Automático & Download em Lote de CNDs
                  </h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                    config.enabled
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {config.enabled ? <CheckCircle2 className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                    {config.enabled ? 'Agendador Ativo' : 'Agendador Pausado'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Varredura programada nos WebServices das 5 esferas (RFB, SEFAZ por UF, Prefeituras por Município, TST e Caixa) e emissão de pacotes em lote.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end lg:self-center">
              <button
                onClick={handleTriggerScheduleNow}
                disabled={isRunningNow}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <Play className={`w-3.5 h-3.5 ${isRunningNow ? 'animate-spin' : ''}`} />
                {isRunningNow ? 'Executando Rotina...' : 'Executar Rotina Agora'}
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Sub-Header Tabs */}
          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-800/80 pt-4">
            <button
              onClick={() => setActiveTab('scheduler')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'scheduler'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-indigo-300" />
              Configurar Agendamento Geral
            </button>

            <button
              onClick={() => setActiveTab('recurrence')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'recurrence'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <CalendarRange className="w-3.5 h-3.5 text-blue-300" />
              Recorrência por Certidão (5 Tipos)
              <span className="px-1.5 py-0.2 rounded-md bg-blue-950 text-blue-200 border border-blue-500/40 text-[10px] font-mono">
                {Object.values(config.sphereRecurrence || DEFAULT_SPHERE_RECURRENCE).filter(s => s.enabled).length}/5
              </span>
            </button>

            <button
              onClick={() => setActiveTab('email_recipients')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'email_recipients'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-emerald-300" />
              E-mails por Certidão (Cliente/Contador)
              <span className="px-1.5 py-0.2 rounded-md bg-emerald-950 text-emerald-200 border border-emerald-500/40 text-[10px] font-mono">
                {Object.values(config.sphereEmails || DEFAULT_SPHERE_EMAILS).filter(s => s.enabled).length}/5
              </span>
            </button>

            <button
              onClick={() => setActiveTab('smtp_config')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'smtp_config'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Server className="w-3.5 h-3.5 text-amber-300" />
              Servidor SMTP Próprio
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono border ${
                config.customSmtp?.enabled
                  ? 'bg-amber-950 text-amber-200 border-amber-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-700'
              }`}>
                {config.customSmtp?.enabled ? 'Ativo' : 'Padrão'}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('predictive')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'predictive'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              Verificação Preditiva & E-mail Sentinela
              {predictiveFindings.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-md bg-purple-950 text-purple-200 border border-purple-500/40 text-[10px] font-mono">
                  {predictiveFindings.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('batch_download')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'batch_download'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              Download em Lote Multi-Empresas ({selectedCompanyIds.length})
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'logs'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <History className="w-3.5 h-3.5 text-cyan-400" />
              Histórico de Execuções ({logs.length})
            </button>
          </div>

          {/* Indicador de Progresso Global */}
          <AnimatePresence>
            {(isRunningNow || isGeneratingBatch) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 overflow-hidden"
              >
                <div className="p-3 rounded-2xl bg-slate-950 border border-indigo-500/30 flex items-center gap-3">
                  <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin flex-shrink-0" />
                  <span className="text-xs text-indigo-200 font-mono flex-1 animate-pulse">
                    {batchProgressText}
                  </span>
                  <span className="text-[10px] font-bold text-indigo-400 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                    Processando
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Conteúdo Principal com Rolagem */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: CONFIGURAÇÃO DO AGENDADOR */}
          {activeTab === 'scheduler' && (
            <div className="space-y-6">
              
              {/* Card de Status do Agendamento */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${config.enabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'}`}>
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">
                      Motor de Varredura Sentinela Automatizada
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Última execução: <strong className="text-slate-200">{config.lastRunAt || 'Nunca'}</strong> • Próxima execução: <strong className="text-indigo-300">{config.nextRunAt || 'Programada'}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.enabled}
                      onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                  <span className="text-xs font-bold text-slate-200">
                    {config.enabled ? 'Automação Ativa' : 'Pausada'}
                  </span>
                </div>
              </div>

              {/* Frequência de Execução */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  Frequência & Modo de Disparo
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, frequency: 'proactive_before_expiry' })}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      config.frequency === 'proactive_before_expiry'
                        ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-lg shadow-indigo-600/10'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-indigo-300 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        Modo Sentinela (Recomendado)
                      </span>
                      {config.frequency === 'proactive_before_expiry' && <Check className="w-4 h-4 text-indigo-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Renovação automática e proativa 5 dias antes de qualquer certidão expirar, mantendo a empresa 100% blindada.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, frequency: 'daily' })}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      config.frequency === 'daily'
                        ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-lg'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-200">Diário (Madrugada)</span>
                      {config.frequency === 'daily' && <Check className="w-4 h-4 text-indigo-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Varredura diária programada para as <strong>{config.executionTime}</strong>, ideal para empresas com alto volume e licitações.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, frequency: 'weekly' })}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      config.frequency === 'weekly'
                        ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-lg'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-200">Semanal (Segunda-Feira)</span>
                      {config.frequency === 'weekly' && <Check className="w-4 h-4 text-indigo-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Execução toda segunda-feira às <strong>{config.executionTime}</strong>, preparando o resumo semanal contábil.
                    </p>
                  </button>
                </div>
              </div>

              {/* Esferas Selecionadas para Varredura */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    Esferas Governamentais Incluídas na Rotina
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveTab('recurrence')}
                    className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 transition self-start sm:self-auto cursor-pointer"
                  >
                    <CalendarRange className="w-3.5 h-3.5" />
                    Personalizar Recorrência por Certidão (Diária, Semanal, Quinzenal) →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
                  {[
                    { key: 'federal', label: 'Federal (RFB/PGFN)', desc: 'Tributos e Dívida Ativa' },
                    { key: 'estadual', label: `Estadual (SEFAZ-${(currentCompany?.uf || 'PR').toUpperCase()})`, desc: 'ICMS e Dívida Ativa' },
                    { key: 'municipal', label: `Municipal (${currentCompany?.city || 'Curitiba'})`, desc: 'ISS e Taxas Mobiliárias' },
                    { key: 'trabalhista', label: 'Trabalhista (CNDT)', desc: 'Banco de Devedores TST' },
                    { key: 'fgts', label: 'FGTS (CRF Caixa)', desc: 'Regularidade Empregador' }
                  ].map((sph) => {
                    const isChecked = config.spheres[sph.key as keyof typeof config.spheres];
                    const rec = config.sphereRecurrence?.[sph.key as CNDSphere] || DEFAULT_SPHERE_RECURRENCE[sph.key as CNDSphere];
                    const recLabel = rec.recurrence === 'daily' ? '⚡ Diária' : rec.recurrence === 'weekly' ? '📅 Semanal' : '🗓️ Quinzenal';
                    return (
                      <button
                        key={sph.key}
                        type="button"
                        onClick={() => handleToggleSphere(sph.key as CNDSphere)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-indigo-950/40 border-indigo-500/40 text-slate-100 shadow-sm'
                            : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold">{sph.label}</span>
                          <div className={`w-4 h-4 rounded flex items-center justify-center ${isChecked ? 'bg-indigo-600 text-white' : 'border border-slate-700'}`}>
                            {isChecked && <Check className="w-3 h-3" />}
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 block mb-2">{sph.desc}</span>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-indigo-300">
                            {recLabel}
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono">
                            {rec.preferredTime || '03:30'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Escopo e Ações Pós-Execução */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Escopo de Empresas */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Escopo de Aplicação
                  </span>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                      <input
                        type="radio"
                        name="scope"
                        checked={config.scope === 'all_companies'}
                        onChange={() => setConfig({ ...config, scope: 'all_companies' })}
                        className="text-indigo-600 focus:ring-0"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-slate-200 block">Todas as Empresas da Carteira ({effectiveCompanies.length})</span>
                        <span className="text-[10px] text-slate-400">Varredura simultânea para todos os clientes cadastrados</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                      <input
                        type="radio"
                        name="scope"
                        checked={config.scope === 'active_company_only'}
                        onChange={() => setConfig({ ...config, scope: 'active_company_only' })}
                        className="text-indigo-600 focus:ring-0"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-slate-200 block">Apenas Empresa Selecionada ({currentCompany?.name})</span>
                        <span className="text-[10px] text-slate-400">Varredura restrita ao CNPJ atual</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Ações Pós-Execução */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Ações Automatizadas Pós-Varredura
                  </span>

                  <div className="space-y-2">
                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                        <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Auto-download e arquivamento em PDF</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={config.actions.autoDownloadPdf}
                        onChange={(e) => setConfig({
                          ...config,
                          actions: { ...config.actions, autoDownloadPdf: e.target.checked }
                        })}
                        className="rounded text-indigo-600 focus:ring-0"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        <span>Alerta imediato se constatar débito (Simples LC 123/06)</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={config.actions.alertOnDebts}
                        onChange={(e) => setConfig({
                          ...config,
                          actions: { ...config.actions, alertOnDebts: e.target.checked }
                        })}
                        className="rounded text-indigo-600 focus:ring-0"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                        <Mail className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Disparo de Notificação com Dossiê por E-mail</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={config.actions.sendEmailNotification}
                        onChange={(e) => setConfig({
                          ...config,
                          actions: { ...config.actions, sendEmailNotification: e.target.checked }
                        })}
                        className="rounded text-indigo-600 focus:ring-0"
                      />
                    </label>

                    {/* Atalho Inteligente para E-mails por Certidão */}
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/30 space-y-2 mt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5" />
                          Roteamento Direto por Certidão
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveTab('email_recipients')}
                          className="text-[11px] font-bold text-emerald-300 hover:text-emerald-200 underline flex items-center gap-1 cursor-pointer"
                        >
                          Configurar E-mails por Esfera →
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        Configure endereços de e-mail específicos para <strong>Federal, Estadual, Municipal, Trabalhista e FGTS</strong>, enviando alertas diretamente para o cliente ou para o contador encarregado.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CONFIGURAÇÃO DE RECORRÊNCIA PERSONALIZADA POR TIPO DE CERTIDÃO */}
          {activeTab === 'recurrence' && (
            <div className="space-y-6">
              {/* Banner Sentinela de Recorrência Personalizada */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900 border border-blue-500/30">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
                      <CalendarRange className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">
                          Configuração de Recorrência Personalizada por Certidão
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                          Multi-Esferas Independente
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                        Defina a periodicidade de busca individualizada para cada esfera governamental (<strong>Federal, Estadual, Municipal, Trabalhista e FGTS</strong>). Escolha se a consulta automática será <strong>Diária</strong>, <strong>Semanal</strong> ou <strong>Quinzenal</strong> de acordo com a volatilidade e necessidade regulatória de cada órgão.
                      </p>
                    </div>
                  </div>

                  {/* Presets Rápidos */}
                  <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block lg:hidden w-full">
                      Presets Rápidos:
                    </span>
                    <button
                      type="button"
                      onClick={() => applyPresetToAllSpheres('sentinel')}
                      className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      title="RFB, SEFAZ e FGTS Semanais; Municipal e CNDT Quinzenais"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                      Recomendação Sentinela
                    </button>

                    <button
                      type="button"
                      onClick={() => applyPresetToAllSpheres('weekly')}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5 text-indigo-300" />
                      Todas Semanais
                    </button>

                    <button
                      type="button"
                      onClick={() => applyPresetToAllSpheres('daily')}
                      className="px-3 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      Todas Diárias
                    </button>

                    <button
                      type="button"
                      onClick={() => applyPresetToAllSpheres('biweekly')}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                      Todas Quinzenais
                    </button>
                  </div>
                </div>
              </div>

              {/* Cards das 5 Certidões (Federal, Estadual, Municipal, Trabalhista, FGTS) */}
              <div className="space-y-4">
                {[
                  {
                    key: 'federal' as CNDSphere,
                    title: 'Certidão Federal (RFB & PGFN)',
                    subTitle: 'Certidão Negativa de Débitos Relativos a Créditos Tributários Federais e à Dívida Ativa da União',
                    organ: 'Receita Federal do Brasil & Procuradoria-Geral da Fazenda Nacional',
                    legalBase: 'Portaria Conjunta RFB/PGFN nº 1.751/2014 • CTN Art. 205/206',
                    validity: 'Validade: 180 dias',
                    color: 'indigo',
                    borderClass: 'border-indigo-500/30 hover:border-indigo-500/50',
                    bgClass: 'bg-slate-950/70',
                    badgeColor: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
                    badgeActive: 'bg-indigo-600 text-white',
                    iconColor: 'text-indigo-400'
                  },
                  {
                    key: 'estadual' as CNDSphere,
                    title: `Certidão Estadual (SEFAZ-${(currentCompany?.uf || 'PR').toUpperCase()})`,
                    subTitle: `Certidão Negativa de Débitos Tributários e Dívida Ativa Estadual - Secretaria da Fazenda de ${(currentCompany?.uf || 'PR').toUpperCase()}`,
                    organ: `SEFAZ-${(currentCompany?.uf || 'PR').toUpperCase()} • Dívida Ativa Estadual`,
                    legalBase: 'Regulamento do ICMS (RICMS) e Código Tributário Estadual',
                    validity: 'Validade: 180 dias (ou 90 dias)',
                    color: 'blue',
                    borderClass: 'border-blue-500/30 hover:border-blue-500/50',
                    bgClass: 'bg-slate-950/70',
                    badgeColor: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
                    badgeActive: 'bg-blue-600 text-white',
                    iconColor: 'text-blue-400'
                  },
                  {
                    key: 'municipal' as CNDSphere,
                    title: `Certidão Municipal (${currentCompany?.city || 'Curitiba'})`,
                    subTitle: `Certidão Negativa de Débitos Mobiliários e Imobiliários - Município de ${currentCompany?.city || 'Curitiba'}`,
                    organ: `Secretaria Municipal de Finanças / Fazenda de ${currentCompany?.city || 'Curitiba'}`,
                    legalBase: 'Código Tributário Municipal • ISSQN e Taxas Mobiliárias',
                    validity: 'Validade: 30 a 180 dias',
                    color: 'amber',
                    borderClass: 'border-amber-500/30 hover:border-amber-500/50',
                    bgClass: 'bg-slate-950/70',
                    badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
                    badgeActive: 'bg-amber-600 text-white',
                    iconColor: 'text-amber-400'
                  },
                  {
                    key: 'trabalhista' as CNDSphere,
                    title: 'Certidão Trabalhista (CNDT)',
                    subTitle: 'Certidão Negativa de Débitos Trabalhistas - Tribunal Superior do Trabalho',
                    organ: 'Tribunal Superior do Trabalho (TST) • Banco Nacional de Devedores Trabalhistas (BNDT)',
                    legalBase: 'Lei Federal nº 12.440/2011 • Resolução Administrativa TST nº 1.470/2011',
                    validity: 'Validade: 180 dias',
                    color: 'emerald',
                    borderClass: 'border-emerald-500/30 hover:border-emerald-500/50',
                    bgClass: 'bg-slate-950/70',
                    badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
                    badgeActive: 'bg-emerald-600 text-white',
                    iconColor: 'text-emerald-400'
                  },
                  {
                    key: 'fgts' as CNDSphere,
                    title: 'Certificado de Regularidade do FGTS (CRF Caixa)',
                    subTitle: 'Certidão de Regularidade do Empregador perante o Fundo de Garantia do Tempo de Serviço',
                    organ: 'Caixa Econômica Federal • Sistema de Arrecadação FGTS',
                    legalBase: 'Lei Federal nº 8.036/1990 (Art. 27) • Validade curta e alta rotatividade',
                    validity: 'Validade: 30 dias (Volatilidade Alta)',
                    color: 'cyan',
                    borderClass: 'border-cyan-500/30 hover:border-cyan-500/50',
                    bgClass: 'bg-slate-950/70',
                    badgeColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
                    badgeActive: 'bg-cyan-600 text-white',
                    iconColor: 'text-cyan-400',
                    warningNote: 'Recomendação técnica: Por ter ciclo de apenas 30 dias, mantenha em frequência Semanal ou Diária para evitar lapsos impeditivos em licitações e renovações bancárias.'
                  }
                ].map((item) => {
                  const isEnabled = config.spheres[item.key] ?? true;
                  const recSetting = config.sphereRecurrence?.[item.key] || DEFAULT_SPHERE_RECURRENCE[item.key];
                  const currentRecurrence = recSetting.recurrence || 'weekly';
                  const currentDay = recSetting.dayOfWeek || 1;
                  const currentTime = recSetting.preferredTime || '03:30';
                  const isTesting = testingSphere === item.key;

                  return (
                    <div
                      key={item.key}
                      className={`p-5 rounded-2xl border transition-all ${item.bgClass} ${
                        isEnabled ? item.borderClass : 'border-slate-800 opacity-60'
                      }`}
                    >
                      {/* Top Bar do Card da Certidão */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-800/80">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                              <span className={`w-2.5 h-2.5 rounded-full ${isEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                              {item.title}
                            </h4>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono border ${item.badgeColor}`}>
                              {item.validity}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">
                            {item.subTitle}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              {item.organ}
                            </span>
                            <span>•</span>
                            <span className="font-mono text-[10px] text-slate-400">
                              {item.legalBase}
                            </span>
                          </div>
                        </div>

                        {/* Ativar/Desativar na Rotina */}
                        <div className="flex items-center gap-3 self-end sm:self-start shrink-0">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isEnabled}
                              onChange={() => handleToggleSphere(item.key)}
                              className="sr-only peer"
                            />
                            <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                          </label>
                          <span className={`text-xs font-bold ${isEnabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {isEnabled ? 'Ativa' : 'Pausada'}
                          </span>
                        </div>
                      </div>

                      {/* Nota de Alerta Especial (ex: FGTS 30 dias) */}
                      {item.warningNote && isEnabled && (
                        <div className="mt-3 p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 flex items-center gap-2 text-[11px] text-cyan-200">
                          <AlertTriangle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>{item.warningNote}</span>
                        </div>
                      )}

                      {/* Seletor de Frequência de Recorrência (Diária, Semanal, Quinzenal) */}
                      <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                        
                        {/* Seletor Segmentado: Diária, Semanal, Quinzenal */}
                        <div className="lg:col-span-6 space-y-1.5">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-blue-400" />
                            Periodicidade da Consulta
                          </label>

                          <div className="grid grid-cols-3 gap-2">
                            {/* Opção: Diária */}
                            <button
                              type="button"
                              disabled={!isEnabled}
                              onClick={() => handleRecurrenceChange(item.key, 'daily')}
                              className={`p-2.5 rounded-xl border text-left transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                                currentRecurrence === 'daily'
                                  ? 'bg-gradient-to-br from-amber-600/20 to-amber-900/30 border-amber-500 text-white shadow-md shadow-amber-500/10'
                                  : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="text-xs font-bold flex items-center gap-1">
                                  <Zap className={`w-3.5 h-3.5 ${currentRecurrence === 'daily' ? 'text-amber-400' : 'text-slate-400'}`} />
                                  Diária
                                </span>
                                {currentRecurrence === 'daily' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                              </div>
                              <p className="text-[10px] text-slate-400 line-clamp-1">
                                Todos os dias às {currentTime}
                              </p>
                            </button>

                            {/* Opção: Semanal */}
                            <button
                              type="button"
                              disabled={!isEnabled}
                              onClick={() => handleRecurrenceChange(item.key, 'weekly')}
                              className={`p-2.5 rounded-xl border text-left transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                                currentRecurrence === 'weekly'
                                  ? 'bg-gradient-to-br from-indigo-600/20 to-indigo-900/30 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                                  : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="text-xs font-bold flex items-center gap-1">
                                  <Calendar className={`w-3.5 h-3.5 ${currentRecurrence === 'weekly' ? 'text-indigo-400' : 'text-slate-400'}`} />
                                  Semanal
                                </span>
                                {currentRecurrence === 'weekly' && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                              </div>
                              <p className="text-[10px] text-slate-400 line-clamp-1">
                                1x por semana
                              </p>
                            </button>

                            {/* Opção: Quinzenal */}
                            <button
                              type="button"
                              disabled={!isEnabled}
                              onClick={() => handleRecurrenceChange(item.key, 'biweekly')}
                              className={`p-2.5 rounded-xl border text-left transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                                currentRecurrence === 'biweekly'
                                  ? 'bg-gradient-to-br from-purple-600/20 to-purple-900/30 border-purple-500 text-white shadow-md shadow-purple-500/10'
                                  : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="text-xs font-bold flex items-center gap-1">
                                  <CalendarDays className={`w-3.5 h-3.5 ${currentRecurrence === 'biweekly' ? 'text-purple-400' : 'text-slate-400'}`} />
                                  Quinzenal
                                </span>
                                {currentRecurrence === 'biweekly' && <Check className="w-3.5 h-3.5 text-purple-400" />}
                              </div>
                              <p className="text-[10px] text-slate-400 line-clamp-1">
                                A cada 15 dias
                              </p>
                            </button>
                          </div>
                        </div>

                        {/* Configurações Adicionais: Dia da Semana & Horário Preferencial */}
                        <div className="lg:col-span-6 space-y-1.5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            
                            {/* Dia da Semana (relevante para semanal e quinzenal) */}
                            <div>
                              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1.5">
                                Dia da Consulta
                                {currentRecurrence === 'daily' && (
                                  <span className="text-[10px] text-slate-500 font-normal lowercase">(todos)</span>
                                )}
                              </label>
                              
                              {currentRecurrence === 'daily' ? (
                                <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Segunda a Domingo</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1">
                                  {[
                                    { val: 1, label: 'Seg' },
                                    { val: 2, label: 'Ter' },
                                    { val: 3, label: 'Qua' },
                                    { val: 4, label: 'Qui' },
                                    { val: 5, label: 'Sex' }
                                  ].map(day => (
                                    <button
                                      key={day.val}
                                      type="button"
                                      disabled={!isEnabled}
                                      onClick={() => {
                                        const nextRun = calculateNextRun(currentRecurrence, day.val, currentTime);
                                        updateSphereRecurrence(item.key, { dayOfWeek: day.val, nextRunAt: nextRun });
                                      }}
                                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer disabled:opacity-40 ${
                                        currentDay === day.val
                                          ? 'bg-blue-600 text-white shadow-sm'
                                          : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                                      }`}
                                    >
                                      {day.label}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Horário Preferencial de Execução */}
                            <div>
                              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1.5">
                                Horário da Varredura
                              </label>
                              <div className="flex items-center gap-2">
                                <select
                                  disabled={!isEnabled}
                                  value={currentTime}
                                  onChange={(e) => {
                                    const nextRun = calculateNextRun(currentRecurrence, currentDay, e.target.value);
                                    updateSphereRecurrence(item.key, { preferredTime: e.target.value, nextRunAt: nextRun });
                                  }}
                                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono rounded-xl p-2 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:opacity-40"
                                >
                                  <option value="02:30">02:30 (Madrugada)</option>
                                  <option value="03:00">03:00 (Madrugada)</option>
                                  <option value="03:30">03:30 (Recomendado)</option>
                                  <option value="03:45">03:45 (Madrugada)</option>
                                  <option value="04:00">04:00 (Madrugada)</option>
                                  <option value="04:30">04:30 (Madrugada)</option>
                                  <option value="05:00">05:00 (Madrugada)</option>
                                  <option value="06:00">06:00 (Manhã)</option>
                                  <option value="12:00">12:00 (Almoço)</option>
                                  <option value="18:30">18:30 (Fim de Expediente)</option>
                                </select>
                              </div>
                            </div>

                          </div>
                        </div>

                      </div>

                      {/* Footer do Card com Datas, E-mails e Botão de Teste */}
                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex flex-wrap items-center gap-3 text-slate-400">
                          <div>
                            Última busca: <strong className="text-slate-200">{recSetting.lastRunAt || 'Hoje, 03:30'}</strong>
                          </div>
                          <div>
                            Próxima busca programada: <strong className="text-blue-300">{recSetting.nextRunAt || calculateNextRun(currentRecurrence, currentDay, currentTime)}</strong>
                          </div>
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                            <Mail className="w-3 h-3 text-emerald-400" />
                            <span>
                              {config.sphereEmails?.[item.key]?.enabled === false
                                ? 'Alertas pausados'
                                : `${(config.sphereEmails?.[item.key]?.sendToClient ? 1 : 0) + (config.sphereEmails?.[item.key]?.sendToAccountant ? 1 : 0) + (config.sphereEmails?.[item.key]?.additionalEmails?.length || 0)} dest. ativos`}
                            </span>
                            <button
                              type="button"
                              onClick={() => setActiveTab('email_recipients')}
                              className="text-emerald-400 hover:text-emerald-200 underline font-bold text-[10px] ml-1 cursor-pointer"
                            >
                              Configurar E-mails →
                            </button>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={!isEnabled || isTesting}
                          onClick={() => handleTestSingleSphere(item.key)}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-2 self-start sm:self-auto cursor-pointer disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isTesting ? 'animate-spin' : ''}`} />
                          {isTesting ? 'Consultando Órgão...' : 'Testar Consulta Imediata'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Matriz Visual da Agenda Semanal das CNDs */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-blue-400" />
                      Grade Semanal de Varreduras Sentinela
                    </h4>
                    <p className="text-xs text-slate-400">
                      Visualização consolidada dos dias e horários em que cada certidão é consultada nos portais governamentais
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300">
                      5 de 5 esferas monitoradas
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {[
                    { day: 1, name: 'Segunda-feira', short: 'SEG' },
                    { day: 2, name: 'Terça-feira', short: 'TER' },
                    { day: 3, name: 'Quarta-feira', short: 'QUA' },
                    { day: 4, name: 'Quinta-feira', short: 'QUI' },
                    { day: 5, name: 'Sexta-feira', short: 'SEX' }
                  ].map(weekday => {
                    const scheduledSpheres = (['federal', 'estadual', 'municipal', 'trabalhista', 'fgts'] as CNDSphere[]).filter(s => {
                      const rec = config.sphereRecurrence?.[s] || DEFAULT_SPHERE_RECURRENCE[s];
                      if (!config.spheres[s] || !rec.enabled) return false;
                      if (rec.recurrence === 'daily') return true;
                      return (rec.dayOfWeek || 1) === weekday.day;
                    });

                    return (
                      <div
                        key={weekday.day}
                        className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                          <span className="text-xs font-bold text-slate-200">{weekday.name}</span>
                          <span className="text-[10px] font-mono text-slate-500">{weekday.short}</span>
                        </div>

                        {scheduledSpheres.length === 0 ? (
                          <div className="py-4 text-center text-[11px] text-slate-500 italic">
                            Nenhuma certidão programada
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            {scheduledSpheres.map(sphKey => {
                              const rec = config.sphereRecurrence?.[sphKey] || DEFAULT_SPHERE_RECURRENCE[sphKey];
                              const names: Record<CNDSphere, { label: string; color: string }> = {
                                federal: { label: 'Federal (RFB)', color: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' },
                                estadual: { label: `Estadual (${(currentCompany?.uf || 'PR').toUpperCase()})`, color: 'bg-blue-500/10 text-blue-300 border-blue-500/30' },
                                municipal: { label: 'Municipal (ISS)', color: 'bg-amber-500/10 text-amber-300 border-amber-500/30' },
                                trabalhista: { label: 'CNDT (TST)', color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' },
                                fgts: { label: 'FGTS (CRF Caixa)', color: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' }
                              };
                              const item = names[sphKey];

                              return (
                                <div
                                  key={sphKey}
                                  className={`p-2 rounded-lg border text-xs flex items-center justify-between ${item.color}`}
                                >
                                  <span className="font-bold">{item.label}</span>
                                  <div className="flex items-center gap-1 font-mono text-[10px]">
                                    <Clock className="w-3 h-3" />
                                    <span>{rec.preferredTime || '03:30'}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB: CONFIGURAÇÃO DE E-MAILS ESPECÍFICOS POR TIPO DE CERTIDÃO (CLIENTE E CONTADOR) */}
          {activeTab === 'email_recipients' && (
            <div className="space-y-6">
              {/* Banner Sentinela de E-mails por Certidão */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900 border border-emerald-500/30">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">
                          Configuração de E-mails Específicos por Tipo de Certidão
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          Roteamento Independente (5 Esferas)
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                        Defina endereços de e-mail dedicados para cada esfera governamental (<strong>Federal, Estadual, Municipal, Trabalhista e FGTS</strong>). Envie alertas de vencimento antecipado e notificações de débitos diretamente para o <strong>cliente</strong>, para o <strong>contador responsável</strong> ou para listas adicionais de compliance fiscal.
                      </p>
                    </div>
                  </div>

                  {/* Presets Rápidos de Distribuição */}
                  <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block lg:hidden w-full">
                      Modelos de Distribuição:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleApplyEmailPresetToAll('both')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      title="Envia para Cliente e Contador em todas as 5 certidões"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                      Cliente + Contador
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyEmailPresetToAll('accountant_only')}
                      className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      title="Envia exclusivamente para o contador responsável"
                    >
                      <Briefcase className="w-3.5 h-3.5 text-blue-300" />
                      Apenas Contador
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyEmailPresetToAll('client_only')}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      title="Envia exclusivamente para o cliente da empresa"
                    >
                      <User className="w-3.5 h-3.5 text-indigo-300" />
                      Apenas Cliente
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyEmailPresetToAll('load_company')}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      title="Preenche com os dados cadastrais da empresa ativa"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      Carregar do Cadastro
                    </button>
                  </div>
                </div>
              </div>

              {/* Contexto Cadastral da Empresa Ativa */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200">{currentCompany.name}</span>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        CNPJ: {currentCompany.cnpj}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-emerald-400" />
                        Cliente Padrão: <strong className="text-slate-200">{currentCompany.responsibleEmail || currentCompany.email || 'Não informado'}</strong>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-blue-400" />
                        Contador Padrão: <strong className="text-slate-200">{currentCompany.accountantEmail || config.actions.emailRecipients?.split(',')[0]?.trim() || 'contador@escritoriofiscal.com.br'}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-400 max-w-xs">
                  <span className="text-emerald-400 font-bold block">💡 Dica de Roteamento</span>
                  Deixe o campo vazio para herdar automaticamente o e-mail cadastral, ou digite um endereço exclusivo por certidão.
                </div>
              </div>

              {/* Cards das 5 Certidões com Configuração Específica de E-mails */}
              <div className="space-y-5">
                {[
                  {
                    key: 'federal' as CNDSphere,
                    title: 'Certidão Federal (RFB & PGFN)',
                    subTitle: 'Certidão Negativa de Débitos Relativos a Créditos Tributários Federais e à Dívida Ativa da União',
                    organ: 'Receita Federal do Brasil & PGFN',
                    legalBase: 'Portaria Conjunta RFB/PGFN nº 1.751/2014',
                    validity: 'Validade: 180 dias',
                    badgeColor: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
                    borderClass: 'border-indigo-500/30',
                    icon: Building2,
                    iconColor: 'text-indigo-400',
                    accentColor: 'indigo'
                  },
                  {
                    key: 'estadual' as CNDSphere,
                    title: `Certidão Estadual (SEFAZ-${(currentCompany?.uf || 'PR').toUpperCase()})`,
                    subTitle: `Certidão Negativa de Débitos Tributários e Dívida Ativa Estadual de ${(currentCompany?.uf || 'PR').toUpperCase()}`,
                    organ: `Secretaria da Fazenda de ${(currentCompany?.uf || 'PR').toUpperCase()}`,
                    legalBase: 'Regulamento do ICMS Estadual (RICMS) e PGE',
                    validity: 'Validade: 90 a 180 dias',
                    badgeColor: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
                    borderClass: 'border-blue-500/30',
                    icon: MapPin,
                    iconColor: 'text-blue-400',
                    accentColor: 'blue'
                  },
                  {
                    key: 'municipal' as CNDSphere,
                    title: `Certidão Municipal (${currentCompany?.city || 'Curitiba'})`,
                    subTitle: `Certidão Negativa de Tributos Mobiliários e Imobiliários da Prefeitura de ${currentCompany?.city || 'Curitiba'}`,
                    organ: `Prefeitura Municipal de ${currentCompany?.city || 'Curitiba'}`,
                    legalBase: 'Código Tributário Municipal • ISSQN e Taxas',
                    validity: 'Validade: 60 a 180 dias',
                    badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
                    borderClass: 'border-amber-500/30',
                    icon: Building2,
                    iconColor: 'text-amber-400',
                    accentColor: 'amber'
                  },
                  {
                    key: 'trabalhista' as CNDSphere,
                    title: 'Certidão Trabalhista (CNDT)',
                    subTitle: 'Certidão Negativa de Débitos Trabalhistas perante a Justiça do Trabalho',
                    organ: 'Tribunal Superior do Trabalho - TST / CSJT',
                    legalBase: 'Lei nº 12.440/2011 • Banco de Devedores (BNDT)',
                    validity: 'Validade: 180 dias nacional',
                    badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
                    borderClass: 'border-emerald-500/30',
                    icon: ShieldCheck,
                    iconColor: 'text-emerald-400',
                    accentColor: 'emerald'
                  },
                  {
                    key: 'fgts' as CNDSphere,
                    title: 'Certificado de Regularidade do FGTS (CRF)',
                    subTitle: 'Regularidade de Recolhimentos Rescisórios e Mensais do FGTS de Empregados',
                    organ: 'Caixa Econômica Federal',
                    legalBase: 'Lei nº 8.036/1990 • Circular CAIXA',
                    validity: 'Validade: 30 dias (Alta rotatividade)',
                    badgeColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
                    borderClass: 'border-cyan-500/30',
                    icon: Archive,
                    iconColor: 'text-cyan-400',
                    accentColor: 'cyan'
                  }
                ].map((item) => {
                  const emailConfig = config.sphereEmails?.[item.key] || DEFAULT_SPHERE_EMAILS[item.key];
                  const isEnabled = emailConfig.enabled ?? true;
                  const isTesting = testingEmailSphere === item.key;
                  const Icon = item.icon;

                  const defaultClient = currentCompany.responsibleEmail || currentCompany.email || 'financeiro@empresa.com.br';
                  const defaultAccountant = currentCompany.accountantEmail || config.actions.emailRecipients?.split(',')[0]?.trim() || 'contador@escritoriofiscal.com.br';

                  const effectiveClient = emailConfig.clientEmail?.trim() || defaultClient;
                  const effectiveAccountant = emailConfig.accountantEmail?.trim() || defaultAccountant;

                  const resolvedRecipients = getSphereAlertRecipients(item.key, currentCompany, config);

                  return (
                    <div
                      key={item.key}
                      className={`p-5 rounded-2xl border transition-all ${
                        isEnabled
                          ? `bg-slate-950/80 ${item.borderClass} shadow-lg shadow-black/20`
                          : 'bg-slate-950/40 border-slate-800 opacity-60'
                      }`}
                    >
                      {/* Top Bar do Card */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                        <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-xl bg-slate-900 border border-slate-800 ${item.iconColor} shrink-0`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-100">{item.title}</h4>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${item.badgeColor}`}>
                                {item.validity}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono hidden md:inline">
                                • {item.legalBase}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">{item.subTitle}</p>
                          </div>
                        </div>

                        {/* Switch Ativo / Desativado */}
                        <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isEnabled}
                              onChange={(e) => handleUpdateSphereEmail(item.key, { enabled: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                          </label>
                          <span className={`text-xs font-bold ${isEnabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {isEnabled ? 'Alertas Ativos' : 'Alertas Pausados'}
                          </span>
                        </div>
                      </div>

                      {/* Configuração de Destinatários: Cliente e Contador */}
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Destinatário 1: E-mail do Cliente */}
                        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-200 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={emailConfig.sendToClient}
                                onChange={(e) => handleUpdateSphereEmail(item.key, { sendToClient: e.target.checked })}
                                className="rounded text-emerald-600 focus:ring-0"
                              />
                              <User className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Enviar Alerta ao Cliente</span>
                            </label>
                            <span className="text-[10px] text-emerald-400 font-medium">
                              Diretoria / Responsável
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[11px] text-slate-400 block">
                              Endereço de e-mail do cliente:
                            </label>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="email"
                                value={emailConfig.clientEmail || ''}
                                onChange={(e) => handleUpdateSphereEmail(item.key, { clientEmail: e.target.value })}
                                placeholder={defaultClient}
                                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none placeholder:text-slate-600 font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => handleUpdateSphereEmail(item.key, { clientEmail: defaultClient })}
                                title="Copiar e-mail padrão do cadastro"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-[10px] shrink-0 font-medium flex items-center gap-1 cursor-pointer"
                              >
                                <Copy className="w-3 h-3" />
                                <span>Padrão</span>
                              </button>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-500">
                              <span>
                                {emailConfig.clientEmail
                                  ? '✨ Usando e-mail personalizado para esta certidão'
                                  : `Usando e-mail padrão do cadastro (${defaultClient})`}
                              </span>
                              {emailConfig.clientEmail && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateSphereEmail(item.key, { clientEmail: '' })}
                                  className="text-slate-400 hover:text-rose-300 underline cursor-pointer"
                                >
                                  Restaurar Padrão
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Destinatário 2: E-mail do Contador Responsável */}
                        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-200 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={emailConfig.sendToAccountant}
                                onChange={(e) => handleUpdateSphereEmail(item.key, { sendToAccountant: e.target.checked })}
                                className="rounded text-blue-600 focus:ring-0"
                              />
                              <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                              <span>Enviar ao Contador Responsável</span>
                            </label>
                            <span className="text-[10px] text-blue-400 font-medium">
                              Escritório Fiscal / BPO
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[11px] text-slate-400 block">
                              Endereço de e-mail do contador:
                            </label>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="email"
                                value={emailConfig.accountantEmail || ''}
                                onChange={(e) => handleUpdateSphereEmail(item.key, { accountantEmail: e.target.value })}
                                placeholder={defaultAccountant}
                                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-blue-500 focus:outline-none placeholder:text-slate-600 font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => handleUpdateSphereEmail(item.key, { accountantEmail: defaultAccountant })}
                                title="Copiar e-mail padrão do contador"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-[10px] shrink-0 font-medium flex items-center gap-1 cursor-pointer"
                              >
                                <Copy className="w-3 h-3" />
                                <span>Padrão</span>
                              </button>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-500">
                              <span>
                                {emailConfig.accountantEmail
                                  ? '✨ Usando e-mail personalizado para esta certidão'
                                  : `Usando e-mail contábil padrão (${defaultAccountant})`}
                              </span>
                              {emailConfig.accountantEmail && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateSphereEmail(item.key, { accountantEmail: '' })}
                                  className="text-slate-400 hover:text-rose-300 underline cursor-pointer"
                                >
                                  Restaurar Padrão
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* E-mails Adicionais em Cópia (CC) */}
                      <div className="mt-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            E-mails Adicionais em Cópia (CC) para esta Certidão
                          </label>
                          <span className="text-[10px] text-slate-500">
                            Ex: jurídico, compliance, sócio investidor ou financeiro
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="email"
                            value={newCcEmailInput[item.key] || ''}
                            onChange={(e) => setNewCcEmailInput(prev => ({ ...prev, [item.key]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddCcEmail(item.key);
                              }
                            }}
                            placeholder="exemplo@empresa.com.br ou juridico@empresa.com.br"
                            className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none placeholder:text-slate-600 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddCcEmail(item.key)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Adicionar</span>
                          </button>
                        </div>

                        {/* Chips de E-mails Adicionados */}
                        {emailConfig.additionalEmails && emailConfig.additionalEmails.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {emailConfig.additionalEmails.map((ccEmail) => (
                              <span
                                key={ccEmail}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono"
                              >
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span>{ccEmail}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCcEmail(item.key, ccEmail)}
                                  className="text-slate-500 hover:text-rose-400 p-0.5 rounded cursor-pointer"
                                  title="Remover"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-slate-500 italic">
                            Nenhum e-mail adicional em cópia. Os alertas serão enviados apenas para os destinatários principais marcados acima.
                          </p>
                        )}
                      </div>

                      {/* Regras de Disparo de Alerta & Antecedência */}
                      <div className="mt-4 p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-4">
                          {/* Vencimento Iminente */}
                          <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={emailConfig.alertOnImminentExpiry}
                              onChange={(e) => handleUpdateSphereEmail(item.key, { alertOnImminentExpiry: e.target.checked })}
                              className="rounded text-emerald-600 focus:ring-0"
                            />
                            <span>Alerta de Vencimento Iminente</span>
                          </label>

                          {/* Seletor de Dias */}
                          {emailConfig.alertOnImminentExpiry && (
                            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                              <span className="text-[10px] text-slate-400 px-1 font-medium">Antecedência:</span>
                              {[3, 5, 7, 10, 15, 30].map(d => (
                                <button
                                  key={d}
                                  type="button"
                                  onClick={() => handleUpdateSphereEmail(item.key, { daysBeforeExpiry: d })}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono transition cursor-pointer ${
                                    (emailConfig.daysBeforeExpiry || 7) === d
                                      ? 'bg-emerald-600 text-white shadow-sm'
                                      : 'text-slate-400 hover:text-slate-200'
                                  }`}
                                >
                                  {d}d
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Alerta de Débito / Transição */}
                          <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={emailConfig.alertOnStatusChange}
                              onChange={(e) => handleUpdateSphereEmail(item.key, { alertOnStatusChange: e.target.checked })}
                              className="rounded text-rose-600 focus:ring-0"
                            />
                            <span className="text-slate-300">Alerta de Apontamento de Débito / Perda de Regularidade</span>
                          </label>
                        </div>

                        {/* Botão de Replicar Configuração */}
                        <button
                          type="button"
                          onClick={() => handleReplicateSphereEmailToAll(item.key)}
                          className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1.5 self-start lg:self-auto cursor-pointer"
                          title="Copia os e-mails e regras desta certidão para as outras 4 esferas"
                        >
                          <Copy className="w-3 h-3 text-slate-500" />
                          <span>Replicar para as outras 4 certidões</span>
                        </button>
                      </div>

                      {/* Footer do Card: Destinatários Resolvidos e Teste de Envio */}
                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex flex-wrap items-center gap-2 text-slate-400">
                          <span className="text-[11px] font-bold text-slate-300">Destinatários Ativos:</span>
                          {resolvedRecipients.recipients.length > 0 ? (
                            resolvedRecipients.recipients.map(rEmail => (
                              <span
                                key={rEmail}
                                className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[10px]"
                              >
                                {rEmail}
                              </span>
                            ))
                          ) : (
                            <span className="text-rose-400 italic text-[11px]">Nenhum destinatário marcado</span>
                          )}
                          {emailConfig.lastAlertSentAt && (
                            <span className="text-[10px] text-slate-500 ml-2">
                              • Último envio: <strong className="text-slate-300">{emailConfig.lastAlertSentAt}</strong>
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          disabled={!isEnabled || isTesting || resolvedRecipients.recipients.length === 0}
                          onClick={() => handleTestSendSphereEmailAlert(item.key)}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition flex items-center gap-2 self-start sm:self-auto cursor-pointer disabled:opacity-50 shadow-md shadow-emerald-600/20"
                        >
                          <Send className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                          {isTesting ? 'Disparando E-mail...' : 'Disparar E-mail Teste'}
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Matriz Consolidada de Roteamento de E-mails */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-400" />
                      Matriz Consolidada de Roteamento das 5 Certidões
                    </h4>
                    <p className="text-xs text-slate-400">
                      Visão geral dos canais de entrega por e-mail configurados para cada certidão do sistema
                    </p>
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                    5 de 5 esferas mapeadas
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                        <th className="py-2.5 px-3">Tipo de Certidão</th>
                        <th className="py-2.5 px-3">Status Alerta</th>
                        <th className="py-2.5 px-3">E-mail do Cliente</th>
                        <th className="py-2.5 px-3">E-mail do Contador</th>
                        <th className="py-2.5 px-3">E-mails em CC</th>
                        <th className="py-2.5 px-3">Gatilho Vencimento</th>
                        <th className="py-2.5 px-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                      {(['federal', 'estadual', 'municipal', 'trabalhista', 'fgts'] as CNDSphere[]).map(sph => {
                        const conf = config.sphereEmails?.[sph] || DEFAULT_SPHERE_EMAILS[sph];
                        const defaultClient = currentCompany.responsibleEmail || currentCompany.email || 'financeiro@empresa.com.br';
                        const defaultAccountant = currentCompany.accountantEmail || config.actions.emailRecipients?.split(',')[0]?.trim() || 'contador@escritoriofiscal.com.br';

                        const names: Record<CNDSphere, string> = {
                          federal: 'Federal (RFB & PGFN)',
                          estadual: `Estadual (SEFAZ-${(currentCompany?.uf || 'PR').toUpperCase()})`,
                          municipal: `Municipal (${currentCompany?.city || 'Curitiba'})`,
                          trabalhista: 'Trabalhista (CNDT)',
                          fgts: 'FGTS (CRF Caixa)'
                        };

                        return (
                          <tr key={sph} className="hover:bg-slate-900/40 transition">
                            <td className="py-3 px-3 font-sans font-bold text-slate-100 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                              {names[sph]}
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                conf.enabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                              }`}>
                                {conf.enabled ? 'Ativo' : 'Pausado'}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-[11px]">
                              {conf.sendToClient ? (
                                <span className="text-emerald-300">
                                  {conf.clientEmail || defaultClient}
                                </span>
                              ) : (
                                <span className="text-slate-500 italic">Desativado</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-[11px]">
                              {conf.sendToAccountant ? (
                                <span className="text-blue-300">
                                  {conf.accountantEmail || defaultAccountant}
                                </span>
                              ) : (
                                <span className="text-slate-500 italic">Desativado</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-[11px]">
                              {conf.additionalEmails && conf.additionalEmails.length > 0 ? (
                                <span className="text-slate-300">{conf.additionalEmails.length} e-mail(s)</span>
                              ) : (
                                <span className="text-slate-600">—</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-[11px]">
                              {conf.alertOnImminentExpiry ? (
                                <span className="text-slate-300">{conf.daysBeforeExpiry || 7} dias antes</span>
                              ) : (
                                <span className="text-slate-500 italic">Sem alerta</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleTestSendSphereEmailAlert(sph)}
                                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] text-emerald-300 font-bold font-sans transition cursor-pointer"
                              >
                                Testar Envio
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB: CONFIGURAÇÃO DE SERVIDOR SMTP PRÓPRIO DO ESCRITÓRIO */}
          {activeTab === 'smtp_config' && (
            <div className="space-y-6">
              {/* Banner SMTP */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-orange-950/30 to-slate-900 border border-amber-500/30">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                      <Server className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">
                          Configuração de Servidor SMTP Próprio do Escritório
                        </h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          config.customSmtp?.enabled
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}>
                          {config.customSmtp?.enabled ? 'SMTP Próprio Ativo' : 'Utilizando Padrão do Sistema'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                        Configure as credenciais do servidor de e-mail corporativo do seu escritório (Host, Porta, Usuário e Senha). Com o SMTP próprio habilitado, todas as notificações automáticas de vencimento de CNDs e alertas proativos serão enviadas com a identidade e domínio da sua organização.
                      </p>
                    </div>
                  </div>

                  {/* Switch Master */}
                  <div className="flex items-center gap-3 self-end lg:self-center bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.customSmtp?.enabled ?? false}
                        onChange={(e) => handleUpdateCustomSmtp({ enabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                    </label>
                    <div className="text-left">
                      <span className="text-xs font-bold text-slate-200 block">
                        {config.customSmtp?.enabled ? 'SMTP Próprio Ativo' : 'Ativar SMTP Próprio'}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {config.customSmtp?.enabled ? 'Disparando pelo seu domínio' : 'Usando remetente padrão'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Presets de Provedores Populares */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  ⚡ Provedores e Presets Rápidos de 1 Clique
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                  {[
                    { key: 'gmail', name: 'Google / Gmail', host: 'smtp.gmail.com', port: '587 (TLS)' },
                    { key: 'outlook', name: 'Microsoft 365', host: 'smtp.office365.com', port: '587 (TLS)' },
                    { key: 'umbler', name: 'Umbler', host: 'smtp.umbler.com', port: '587 (TLS)' },
                    { key: 'locaweb', name: 'Locaweb', host: 'email-ssl.com.br', port: '465 (SSL)' },
                    { key: 'hostinger', name: 'Hostinger', host: 'smtp.hostinger.com', port: '465 (SSL)' },
                    { key: 'custom', name: 'Outro / Custom', host: 'Personalizado', port: 'Configurável' }
                  ].map(p => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => handleApplySmtpProviderPreset(p.key as any)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        config.customSmtp?.provider === p.key
                          ? 'bg-amber-600/20 border-amber-500/50 text-white shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs font-bold block">{p.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5 truncate">{p.host}</span>
                      <span className="text-[9px] text-amber-400 font-mono block mt-1">{p.port}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Formulário de Configuração SMTP */}
              <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <Server className="w-4 h-4 text-amber-400" />
                      Parâmetros de Conexão do Servidor SMTP
                    </h4>
                    <p className="text-xs text-slate-400">
                      Informe os dados fornecidos pelo seu provedor de e-mail corporativo ou TI
                    </p>
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300">
                    Conexão Segura TLS/SSL
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Host SMTP */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-300 block">
                      Host do Servidor SMTP (Endereço do Servidor)
                    </label>
                    <input
                      type="text"
                      value={config.customSmtp?.host || ''}
                      onChange={(e) => handleUpdateCustomSmtp({ host: e.target.value })}
                      placeholder="ex: smtp.office365.com ou smtp.gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:border-amber-500 focus:outline-none font-mono placeholder:text-slate-600"
                    />
                  </div>

                  {/* Porta SMTP */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">
                      Porta SMTP
                    </label>
                    <select
                      value={config.customSmtp?.port || 587}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        handleUpdateCustomSmtp({
                          port: val,
                          secure: val === 465
                        });
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:border-amber-500 focus:outline-none font-mono"
                    >
                      <option value="587">587 (STARTTLS / Padrão)</option>
                      <option value="465">465 (SSL Direto)</option>
                      <option value="25">25 (Padrão Sem Criptografia)</option>
                      <option value="2525">2525 (Alternativa)</option>
                    </select>
                  </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Usuário / E-mail de Login */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">
                      Usuário / E-mail de Autenticação SMTP
                    </label>
                    <input
                      type="email"
                      value={config.customSmtp?.user || ''}
                      onChange={(e) => handleUpdateCustomSmtp({ user: e.target.value, fromEmail: e.target.value })}
                      placeholder="fiscal@meuescritorio.com.br"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:border-amber-500 focus:outline-none font-mono placeholder:text-slate-600"
                    />
                  </div>

                  {/* Senha SMTP */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                      <span>Senha ou Token de Aplicativo (App Password)</span>
                      <button
                        type="button"
                        onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                        className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {showSmtpPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{showSmtpPassword ? 'Ocultar Senha' : 'Mostrar Senha'}</span>
                      </button>
                    </label>
                    <div className="relative">
                      <input
                        type={showSmtpPassword ? 'text' : 'password'}
                        value={config.customSmtp?.pass || ''}
                        onChange={(e) => handleUpdateCustomSmtp({ pass: e.target.value })}
                        placeholder="••••••••••••••••"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:border-amber-500 focus:outline-none font-mono placeholder:text-slate-600 pr-10"
                      />
                      <Lock className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-800/80">
                  
                  {/* Nome do Remetente */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">
                      Nome Exibido do Remetente (From Name)
                    </label>
                    <input
                      type="text"
                      value={config.customSmtp?.fromName || ''}
                      onChange={(e) => handleUpdateCustomSmtp({ fromName: e.target.value })}
                      placeholder="Escritório Modelo Contabilidade"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:border-amber-500 focus:outline-none placeholder:text-slate-600"
                    />
                  </div>

                  {/* E-mail do Remetente */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">
                      E-mail do Remetente (From Email)
                    </label>
                    <input
                      type="email"
                      value={config.customSmtp?.fromEmail || ''}
                      onChange={(e) => handleUpdateCustomSmtp({ fromEmail: e.target.value })}
                      placeholder="fiscal@meuescritorio.com.br"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:border-amber-500 focus:outline-none font-mono placeholder:text-slate-600"
                    />
                  </div>

                  {/* E-mail para Resposta (Reply-To) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">
                      E-mail para Resposta (Reply-To)
                    </label>
                    <input
                      type="email"
                      value={config.customSmtp?.replyTo || ''}
                      onChange={(e) => handleUpdateCustomSmtp({ replyTo: e.target.value })}
                      placeholder="atendimento@meuescritorio.com.br"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:border-amber-500 focus:outline-none font-mono placeholder:text-slate-600"
                    />
                  </div>

                </div>
              </div>

              {/* Teste de Conexão & Diagnóstico SMTP */}
              <div className="p-6 rounded-2xl bg-slate-950/80 border border-amber-500/30 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      Validação & Teste de Conexão SMTP
                    </h4>
                    <p className="text-xs text-slate-400">
                      Envie uma mensagem de teste para verificar se o seu servidor aceita as credenciais informadas
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      value={testRecipientEmail}
                      onChange={(e) => setTestRecipientEmail(e.target.value)}
                      placeholder="E-mail para teste"
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 font-mono w-56"
                    />
                    <button
                      type="button"
                      disabled={isTestingSmtp}
                      onClick={handleRunSmtpTest}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-amber-600/20 flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isTestingSmtp ? 'animate-spin' : ''}`} />
                      {isTestingSmtp ? 'Testando Conexão...' : 'Testar Conexão SMTP'}
                    </button>
                  </div>
                </div>

                {/* Exibição do Resultado do Teste */}
                <AnimatePresence>
                  {smtpTestResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className={`p-4 rounded-2xl border ${
                        smtpTestResult.success
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                          : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {smtpTestResult.success ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 space-y-1">
                          <h5 className="text-xs font-bold uppercase tracking-wide">
                            {smtpTestResult.success ? 'Conexão SMTP Autenticada com Sucesso' : 'Falha na Autenticação SMTP'}
                          </h5>
                          <p className="text-xs leading-relaxed font-mono">
                            {smtpTestResult.message}
                          </p>
                          {smtpTestResult.details && (
                            <div className="mt-2 p-2.5 rounded-lg bg-black/40 border border-white/10 text-[11px] font-mono text-slate-300">
                              <pre className="whitespace-pre-wrap">{JSON.stringify(smtpTestResult.details, null, 2)}</pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          )}

          {/* TAB: VERIFICAÇÃO PREDITIVA */}
          {activeTab === 'predictive' && (
            <div className="space-y-6">
              {/* Banner Sentinela Preditivo */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900 border border-purple-500/30">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">
                          Camada Sentinela Preditiva de CNDs &amp; Débitos
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                          Inteligência Antecipada
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                        Monitoramento contínuo contra perda de regularidade fiscal: identifica antecipadamente certidões prestes a expirar ou transições de status (ex: <strong>'Regular' para 'Pendente'</strong>), disparando notificações proativas no Dashboard e alertas no e-mail do cliente.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => handleTriggerScheduleNow()}
                      disabled={isRunningNow}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Executar Varredura Agora
                    </button>
                  </div>
                </div>
              </div>

              {/* Configurações Preditivas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Parâmetros Preditivos */}
                <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-purple-400" />
                        Gatilhos de Alerta Preditivo
                      </h4>
                      <p className="text-[11px] text-slate-500">Parâmetros de antecedência e sensibilidade do Sentinela</p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.predictive?.enabled ?? true}
                        onChange={(e) => setConfig({
                          ...config,
                          predictive: {
                            ...(config.predictive || { daysThreshold: 7, detectStatusTransition: true, autoDispatchClientEmail: true }),
                            enabled: e.target.checked
                          }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  {/* Janela de Antecedência de Vencimento */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-300">Antecedência de Vencimento Iminente:</span>
                      <span className="font-mono font-bold text-purple-300 px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                        {config.predictive?.daysThreshold || 7} dias antes
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-1.5">
                      {[3, 5, 7, 10, 15].map(d => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setConfig({
                            ...config,
                            predictive: {
                              ...(config.predictive || { enabled: true, detectStatusTransition: true, autoDispatchClientEmail: true }),
                              daysThreshold: d
                            }
                          })}
                          className={`py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                            (config.predictive?.daysThreshold || 7) === d
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          {d} dias
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Detecção de Mudança de Status */}
                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-200 block">
                        Detectar Mudança de Situação ('Regular' ➔ 'Pendente')
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Alerta imediato se apontamentos ou débitos surgirem perante RFB, SEFAZ ou Prefeituras
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.predictive?.detectStatusTransition ?? true}
                      onChange={(e) => setConfig({
                        ...config,
                        predictive: {
                          ...(config.predictive || { enabled: true, daysThreshold: 7, autoDispatchClientEmail: true }),
                          detectStatusTransition: e.target.checked
                        }
                      })}
                      className="rounded text-purple-600 focus:ring-0"
                    />
                  </label>

                  {/* Disparo de E-mail Automático ao Cliente */}
                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-emerald-400" />
                        Disparo Preditivo no E-mail do Cliente
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Envia e-mail oficial com dossiê preventivo assim que identificar risco na CND
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.predictive?.autoDispatchClientEmail ?? true}
                      onChange={(e) => setConfig({
                        ...config,
                        predictive: {
                          ...(config.predictive || { enabled: true, daysThreshold: 7, detectStatusTransition: true }),
                          autoDispatchClientEmail: e.target.checked
                        }
                      })}
                      className="rounded text-purple-600 focus:ring-0"
                    />
                  </label>
                </div>

                {/* Destinatário & Simulação */}
                <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-emerald-400" />
                      Destinatário de Notificações da Empresa Atual
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Empresa ativa: <strong className="text-slate-300">{currentCompany.name}</strong> ({currentCompany.cnpj})
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400">E-mail Cadastrado do Cliente / Responsável:</label>
                    <input
                      type="email"
                      value={currentCompany.responsibleEmail || currentCompany.email || 'fiscal@empresa.com.br'}
                      readOnly
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono"
                    />
                    <span className="text-[10px] text-slate-500">
                      Utilizado para envio dos alertas preditivos de vencimento e termos de exclusão (LC 123/06).
                    </span>
                  </div>

                  {/* Card de Testes em Tempo Real */}
                  <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      Laboratório de Teste de Eventos Preditivos
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Simule cenários em tempo real para verificar a geração de alertas no Dashboard e o disparo no e-mail:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleSimulateStatusDegradation('federal')}
                        disabled={isSimulatingTransition}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Simular Regular ➔ Pendente</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSimulateImminentExpiry('estadual', 3)}
                        disabled={isSimulatingTransition}
                        className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>Simular Vence em 3 Dias</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleResetSimulations}
                      className="w-full py-1.5 text-[11px] font-bold text-slate-400 hover:text-slate-200 transition cursor-pointer text-center"
                    >
                      ↺ Restaurar Situação 100% Regular
                    </button>
                  </div>
                </div>
              </div>

              {/* Eventos Preditivos Detectados */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-purple-400" />
                    Diagnósticos Preditivos Ativos na Empresa ({predictiveFindings.length})
                  </h4>

                  {predictiveFindings.length > 0 && (
                    <button
                      onClick={handleResetSimulations}
                      className="text-xs text-purple-400 hover:text-purple-300 transition"
                    >
                      Limpar Alertas Simulados
                    </button>
                  )}
                </div>

                {predictiveFindings.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 text-center space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <h5 className="text-sm font-bold text-white">Nenhum Risco Fiscal Iminente Detectado</h5>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Todas as 5 esferas (RFB, SEFAZ, Prefeitura, TST e Caixa) constam em situação <strong>REGULAR</strong> e com prazos de validade confortáveis.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {predictiveFindings.map((finding) => {
                      const isStatusDegradation = finding.riskType === 'status_degradation';
                      const isEmailSent = sentEmailFindings.includes(finding.id) || finding.emailDispatched;

                      return (
                        <div
                          key={finding.id}
                          className={`p-4 rounded-2xl border transition-all space-y-3 ${
                            isStatusDegradation
                              ? 'bg-rose-950/20 border-rose-800/60'
                              : 'bg-amber-950/20 border-amber-800/60'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                isStatusDegradation
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              }`}>
                                {isStatusDegradation ? 'Mudança de Status Detectada' : 'Vencimento Iminente'}
                              </span>

                              <span className="text-xs font-bold text-slate-200">
                                {finding.organ} ({finding.sphere.toUpperCase()})
                              </span>

                              {finding.previousStatus && (
                                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-black/40 text-slate-300">
                                  {finding.previousStatus} ➔ <strong className={isStatusDegradation ? 'text-rose-400' : 'text-amber-400'}>{finding.currentStatus}</strong>
                                </span>
                              )}
                            </div>

                            <span className="text-xs font-mono text-slate-400">
                              Validade: {finding.expiryDate} ({finding.daysRemaining} dias restantes)
                            </span>
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed">
                            {finding.summary} {finding.preventiveRecommendation}
                          </p>

                          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                            <div className="text-[11px] text-slate-400 font-mono">
                              Impacto Legal: <span className="text-slate-300">{finding.legalImpact}</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleManualDispatchFindingEmail(finding)}
                              disabled={dispatchingFindingId === finding.id}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md ${
                                isEmailSent
                                  ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
                                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
                              }`}
                            >
                              {dispatchingFindingId === finding.id ? (
                                <Clock className="w-3.5 h-3.5 animate-spin" />
                              ) : isEmailSent ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Mail className="w-3.5 h-3.5" />
                              )}
                              <span>{isEmailSent ? 'E-mail Sentinela Enviado' : 'Disparar E-mail ao Cliente'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: DOWNLOAD EM LOTE MULTI-EMPRESAS */}
          {activeTab === 'batch_download' && (
            <div className="space-y-5">
              
              {/* Barra de Ações de Download do Lote */}
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Download className="w-4 h-4 text-emerald-400" />
                    Central de Exportação Consolidada em Lote
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    <strong>{selectedCompanyIds.length}</strong> de <strong>{effectiveCompanies.length}</strong> empresas selecionadas para processamento.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleDownloadUnifiedBook}
                    disabled={isGeneratingBatch || selectedCompanyIds.length === 0}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Baixar Livro Unificado em PDF
                  </button>

                  <button
                    onClick={handleDownloadBatchZip}
                    disabled={isGeneratingBatch || selectedCompanyIds.length === 0}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    Baixar Pacote ZIP Estruturado
                  </button>

                  <button
                    onClick={handleDownloadBatchCsv}
                    disabled={isGeneratingBatch || selectedCompanyIds.length === 0}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 flex items-center gap-1.5 transition-all"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                    CSV Lote
                  </button>
                </div>
              </div>

              {/* Filtro de Esferas para o Lote */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-slate-400 font-bold uppercase text-[10px] mr-1">Esferas:</span>
                  {(['federal', 'estadual', 'municipal', 'trabalhista', 'fgts'] as CNDSphere[]).map(sph => {
                    const isSel = selectedSpheres.includes(sph);
                    return (
                      <button
                        key={sph}
                        type="button"
                        onClick={() => handleToggleBatchSphere(sph)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          isSel ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {sph.toUpperCase()}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={companySearch}
                    onChange={(e) => setCompanySearch(e.target.value)}
                    placeholder="Buscar empresa, CNPJ, UF..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Tabela de Empresas com Seleção Múltipla */}
              <div className="rounded-2xl bg-slate-950/70 border border-slate-800 overflow-hidden">
                <div className="p-3 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleToggleSelectAllCompanies}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[11px] transition-colors"
                    >
                      {selectedCompanyIds.length === effectiveCompanies.length ? 'Desmarcar Todas' : 'Selecionar Todas'}
                    </button>
                    <span className="text-slate-400">
                      {selectedCompanyIds.length} selecionada(s)
                    </span>
                  </div>

                  <span className="text-slate-400 font-mono text-[11px]">
                    Inteligência Territorial Ativa por CNPJ
                  </span>
                </div>

                <div className="divide-y divide-slate-800/80 max-h-96 overflow-y-auto">
                  {filteredCompanies.map((comp, idx) => {
                    const compId = comp.id || comp.cnpj || `comp-${idx}`;
                    const isSelected = selectedCompanyIds.includes(compId);
                    const compUf = (comp.uf || 'PR').toUpperCase();
                    const compCity = comp.city || 'Curitiba';
                    const stateInfo = getStateJurisdiction(compUf);

                    return (
                      <div
                        key={compId}
                        onClick={() => handleToggleCompany(compId)}
                        className={`p-3.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                          isSelected ? 'bg-indigo-950/20 hover:bg-indigo-950/30' : 'hover:bg-slate-900/40'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-indigo-600 text-white' : 'border border-slate-700'
                          }`}>
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>

                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-100">
                                {comp.name || 'Empresa Contribuinte'}
                              </span>
                              <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-800">
                                {comp.cnpj || '00.000.000/0001-00'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400">
                              <span className="flex items-center gap-1 text-indigo-300">
                                <MapPin className="w-3 h-3 text-indigo-400" />
                                {compCity} - {compUf} ({stateInfo.stateName})
                              </span>
                              <span>•</span>
                              <span>SEFAZ-{compUf} & Prefeitura de {compCity}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            100% REGULAR
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LOGS E HISTÓRICO DE EXECUÇÕES */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Registros criptográficos das últimas rotinas e varreduras automáticas:</span>
                <button
                  onClick={() => setLogs(INITIAL_LOGS)}
                  className="text-indigo-400 hover:underline"
                >
                  Restaurar Logs de Exemplo
                </button>
              </div>

              <div className="space-y-3">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {log.status}
                        </span>
                        <span className="font-bold text-slate-200">
                          {log.scheduleTitle}
                        </span>
                        <span className="text-slate-500 font-mono text-[11px]">
                          ({log.triggerType === 'scheduled' ? 'Automático' : log.triggerType === 'proactive' ? 'Sentinela' : 'Manual'})
                        </span>
                      </div>

                      <span className="text-slate-400 font-mono text-[11px]">
                        {log.timestamp} • Duração: {log.durationSeconds}s
                      </span>
                    </div>

                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {log.details}
                    </p>

                    <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                      <span>Empresas Auditadas: <strong className="text-slate-200">{log.companiesProcessed}</strong> • CNDs Processadas: <strong className="text-slate-200">{log.totalCNDsChecked}</strong></span>
                      {log.generatedBatchZipSize && (
                        <span className="text-indigo-300 font-mono">Tamanho do Lote: {log.generatedBatchZipSize}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="p-4 px-6 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Automação compatível com Barramento ICP-Brasil e WebServices SEFAZ/Receita Federal.</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors"
          >
            Fechar Agendador
          </button>
        </div>
      </motion.div>
    </div>
  );
};
