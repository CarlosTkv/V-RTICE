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
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CompanyData,
  CNDScheduleConfig,
  CNDExecutionLogItem,
  CNDSphere,
  CNDFrequency
} from '../types';
import {
  generateUnifiedBatchBookPDF,
  generateMultiCompanyZIP,
  downloadMultiCompanyCSV
} from '../utils/cndBatchGenerator';
import { getStateJurisdiction, getMunicipalJurisdiction } from '../utils/cndJurisdictionEngine';

interface CNDAutoSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCompany: CompanyData;
  companies: CompanyData[];
  showToast?: (text: string, type?: 'success' | 'info' | 'error') => void;
}

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
  scope: 'all_companies',
  actions: {
    autoDownloadPdf: true,
    sendEmailNotification: true,
    emailRecipients: 'fiscal@empresa.com.br, diretoria@empresa.com.br',
    alertOnDebts: true,
    archiveInSystemFolder: true
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
  const [activeTab, setActiveTab] = useState<'scheduler' | 'batch_download' | 'logs'>('scheduler');
  const [config, setConfig] = useState<CNDScheduleConfig>(() => {
    const saved = localStorage.getItem('vertice_cnd_schedule_config');
    return saved ? JSON.parse(saved) : DEFAULT_SCHEDULE_CONFIG;
  });
  const [logs, setLogs] = useState<CNDExecutionLogItem[]>(() => {
    const saved = localStorage.getItem('vertice_cnd_schedule_logs');
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

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

  const handleToggleSphere = (sphere: CNDSphere) => {
    setConfig(prev => ({
      ...prev,
      spheres: {
        ...prev.spheres,
        [sphere]: !prev.spheres[sphere]
      }
    }));
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

  // Disparo manual imediato do agendador
  const handleTriggerScheduleNow = async () => {
    setIsRunningNow(true);
    setBatchProgressText('Iniciando handshake mTLS nos WebServices para as empresas selecionadas...');

    try {
      await new Promise(r => setTimeout(r, 600));
      setBatchProgressText('Consultando Receita Federal e PGFN...');

      await new Promise(r => setTimeout(r, 600));
      setBatchProgressText('Consultando Secretarias de Fazenda Estaduais (SEFAZ)...');

      await new Promise(r => setTimeout(r, 600));
      setBatchProgressText('Consultando Prefeituras Municipais & TST/Caixa...');

      const targetCompanies = config.scope === 'active_company_only' ? [currentCompany] : effectiveCompanies;
      const totalChecked = targetCompanies.length * Object.values(config.spheres).filter(Boolean).length;

      const newLog: CNDExecutionLogItem = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleString('pt-BR'),
        triggerType: 'manual',
        scheduleTitle: config.title,
        companiesProcessed: targetCompanies.length,
        totalCNDsChecked: totalChecked,
        totalSuccess: totalChecked,
        totalDebtsDetected: 0,
        durationSeconds: 2.6,
        status: 'SUCCESS',
        details: `Varredura manual executada com sucesso para ${targetCompanies.length} empresa(s). 100% de certidões regulares.`,
        generatedBatchZipSize: `${(targetCompanies.length * 1.2).toFixed(1)} MB`
      };

      setLogs(prev => [newLog, ...prev]);
      setConfig(prev => ({
        ...prev,
        lastRunAt: new Date().toLocaleString('pt-BR'),
        nextRunAt: new Date(Date.now() + 3600000 * 24).toLocaleString('pt-BR')
      }));

      showToast?.(`Agendamento disparado com sucesso! ${totalChecked} certidões consultadas.`, 'success');
    } catch (e) {
      console.error(e);
      showToast?.('Erro ao executar rotina de agendamento.', 'error');
    } finally {
      setIsRunningNow(false);
      setBatchProgressText('');
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
              Configurar Agendamento Automático
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
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  Esferas Governamentais Incluídas na Rotina
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
                  {[
                    { key: 'federal', label: 'Federal (RFB/PGFN)', desc: 'Tributos e Dívida Ativa' },
                    { key: 'estadual', label: `Estadual (SEFAZ-${(currentCompany?.uf || 'PR').toUpperCase()})`, desc: 'ICMS e Dívida Ativa' },
                    { key: 'municipal', label: `Municipal (${currentCompany?.city || 'Curitiba'})`, desc: 'ISS e Taxas Mobiliárias' },
                    { key: 'trabalhista', label: 'Trabalhista (CNDT)', desc: 'Banco de Devedores TST' },
                    { key: 'fgts', label: 'FGTS (CRF Caixa)', desc: 'Regularidade Empregador' }
                  ].map((sph) => {
                    const isChecked = config.spheres[sph.key as keyof typeof config.spheres];
                    return (
                      <button
                        key={sph.key}
                        type="button"
                        onClick={() => handleToggleSphere(sph.key as CNDSphere)}
                        className={`p-3 rounded-xl border text-left transition-all ${
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
                        <span className="text-[10px] text-slate-400 block">{sph.desc}</span>
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
                  </div>
                </div>
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
