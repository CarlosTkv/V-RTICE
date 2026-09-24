import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  Server, 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  X, 
  Sliders, 
  Send,
  Building2,
  Check
} from 'lucide-react';
import { CNDScheduleConfig, CNDCustomSMTPConfig } from '../types';
import { testCustomSMTPConnection } from '../utils/emailService';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const DEFAULT_SMTP_CONFIG: CNDCustomSMTPConfig = {
  enabled: false,
  provider: 'custom',
  host: 'smtp.meuescritorio.com.br',
  port: 587,
  secure: false,
  user: 'fiscal@meuescritorio.com.br',
  pass: '',
  fromName: 'Escritório Contábil & Auditoria',
  fromEmail: 'fiscal@meuescritorio.com.br',
  replyTo: 'atendimento@meuescritorio.com.br',
  lastTestStatus: 'UNTESTED'
};

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  showToast = () => {}
}) => {
  if (!isOpen) return null;

  // Carregar configuração atual do localStorage (compatível com CNDScheduleConfig)
  const [config, setConfig] = useState<CNDScheduleConfig>(() => {
    try {
      const saved = localStorage.getItem('vertice_cnd_schedule_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          customSmtp: {
            ...DEFAULT_SMTP_CONFIG,
            ...(parsed.customSmtp || {})
          }
        };
      }
    } catch (e) {
      console.error('Error loading SMTP config', e);
    }
    const defaultSch: CNDScheduleConfig = {
      id: 'default_sched',
      enabled: true,
      title: 'Rotina de Notificações e CNDs',
      frequency: 'daily',
      executionTime: '03:00',
      spheres: { federal: true, estadual: true, municipal: true, trabalhista: true, fgts: true },
      scope: 'all_companies',
      actions: {
        sendEmailNotification: true,
        emailRecipients: 'contador@escritorio.com.br',
        downloadPdfs: true,
        notifyDashboard: true
      },
      customSmtp: DEFAULT_SMTP_CONFIG
    };
    return defaultSch;
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [testEmail, setTestEmail] = useState('contador@escritorio.com.br');
  const [smtpTestResult, setSmtpTestResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);

  const handleUpdateSmtp = (updates: Partial<CNDCustomSMTPConfig>) => {
    setConfig(prev => ({
      ...prev,
      customSmtp: {
        ...(prev.customSmtp || DEFAULT_SMTP_CONFIG),
        ...updates
      }
    }));
  };

  const handleApplyPreset = (providerKey: 'custom' | 'gmail' | 'outlook' | 'umbler' | 'locaweb' | 'hostinger') => {
    let host = 'smtp.meuescritorio.com.br';
    let port = 587;
    let secure = false;

    if (providerKey === 'gmail') {
      host = 'smtp.gmail.com';
      port = 587;
      secure = false;
    } else if (providerKey === 'outlook') {
      host = 'smtp.office365.com';
      port = 587;
      secure = false;
    } else if (providerKey === 'umbler') {
      host = 'smtp.umbler.com';
      port = 587;
      secure = false;
    } else if (providerKey === 'locaweb') {
      host = 'email-ssl.com.br';
      port = 465;
      secure = true;
    } else if (providerKey === 'hostinger') {
      host = 'smtp.hostinger.com';
      port = 465;
      secure = true;
    }

    handleUpdateSmtp({
      provider: providerKey,
      host,
      port,
      secure
    });
    showToast(`Preset ${providerKey.toUpperCase()} aplicado com sucesso!`, 'success');
  };

  const handleTestConnection = async () => {
    if (!config.customSmtp) return;
    setIsTestingSmtp(true);
    setSmtpTestResult(null);

    try {
      const result = await testCustomSMTPConnection(config.customSmtp, testEmail);
      setSmtpTestResult(result);
      if (result.success) {
        showToast('Conexão SMTP validada com sucesso!', 'success');
        handleUpdateSmtp({ lastTestStatus: 'SUCCESS', lastTestedAt: new Date().toLocaleString('pt-BR') });
      } else {
        showToast('Falha na conexão SMTP. Verifique as credenciais.', 'error');
        handleUpdateSmtp({ lastTestStatus: 'ERROR', lastTestedAt: new Date().toLocaleString('pt-BR'), lastTestError: result.message });
      }
    } catch (err: any) {
      setSmtpTestResult({
        success: false,
        message: err?.message || 'Erro inesperado ao testar conexão SMTP.'
      });
      showToast('Erro ao testar conexão SMTP.', 'error');
    } finally {
      setIsTestingSmtp(false);
    }
  };

  const handleSave = () => {
    try {
      localStorage.setItem('vertice_cnd_schedule_config', JSON.stringify(config));
      showToast('Configurações de Notificações & SMTP salvas com sucesso!', 'success');
      onClose();
    } catch (e) {
      showToast('Erro ao salvar configurações.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-[#0b0f19] border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Configurações de Notificações &amp; Servidor SMTP Próprio</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  White-Label Corporativo
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure seu servidor de e-mail corporativo para envio de alertas de vencimento de CNDs com a identidade da sua contabilidade
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Master Switch Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Ativar Servidor SMTP Próprio do Escritório</h4>
                <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
                  Quando ativo, todas as notificações de vencimento de CNDs e relatórios preditivos disparados pelo sistema sairão diretamente do e-mail corporativo do seu escritório, em vez do remetente padrão Vértice.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={config.customSmtp?.enabled ?? false}
                onChange={(e) => handleUpdateSmtp({ enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Quick Presets */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              ⚡ Provedores &amp; Presets Rápidos de 1 Clique
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {[
                { key: 'gmail', name: 'Google / Gmail', host: 'smtp.gmail.com', port: '587 (TLS)' },
                { key: 'outlook', name: 'Microsoft 365', host: 'smtp.office365.com', port: '587 (TLS)' },
                { key: 'umbler', name: 'Umbler', host: 'smtp.umbler.com', port: '587 (TLS)' },
                { key: 'locaweb', name: 'Locaweb', host: 'email-ssl.com.br', port: '465 (SSL)' },
                { key: 'hostinger', name: 'Hostinger', host: 'smtp.hostinger.com', port: '465 (SSL)' },
                { key: 'custom', name: 'Personalizado', host: 'Configurável', port: 'Custom' }
              ].map(p => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => handleApplyPreset(p.key as any)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    config.customSmtp?.provider === p.key
                      ? 'bg-indigo-600/20 border-indigo-500/50 text-white shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-bold block">{p.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5 truncate">{p.host}</span>
                  <span className="text-[9px] text-indigo-400 font-mono block mt-1">{p.port}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SMTP Configuration Form */}
          <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Server className="w-4 h-4 text-indigo-400" />
                  Parâmetros de Conexão SMTP
                </h4>
                <p className="text-xs text-slate-400">
                  Informe o Host, Porta, Autenticação, Usuário e Senha do seu servidor de e-mail corporativo
                </p>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                SSL / TLS Seguro
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Host */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-300 block">
                  Host do Servidor SMTP (Endereço)
                </label>
                <input
                  type="text"
                  value={config.customSmtp?.host || ''}
                  onChange={(e) => handleUpdateSmtp({ host: e.target.value })}
                  placeholder="ex: smtp.office365.com ou smtp.gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none font-mono placeholder:text-slate-600"
                />
              </div>

              {/* Porta */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  Porta SMTP
                </label>
                <select
                  value={config.customSmtp?.port || 587}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    handleUpdateSmtp({
                      port: val,
                      secure: val === 465
                    });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none font-mono"
                >
                  <option value="587">587 (STARTTLS / Padrão)</option>
                  <option value="465">465 (SSL Direto)</option>
                  <option value="25">25 (Padrão Sem Criptografia)</option>
                  <option value="2525">2525 (Alternativa)</option>
                </select>
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Usuário */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  Usuário / E-mail de Autenticação SMTP
                </label>
                <input
                  type="email"
                  value={config.customSmtp?.user || ''}
                  onChange={(e) => handleUpdateSmtp({ user: e.target.value, fromEmail: e.target.value })}
                  placeholder="fiscal@meuescritorio.com.br"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none font-mono placeholder:text-slate-600"
                />
              </div>

              {/* Senha */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Senha ou Token de Aplicativo (App Password)</span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showPassword ? 'Ocultar' : 'Mostrar'}</span>
                  </button>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={config.customSmtp?.pass || ''}
                    onChange={(e) => handleUpdateSmtp({ pass: e.target.value })}
                    placeholder="••••••••••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none font-mono placeholder:text-slate-600 pr-10"
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
                  onChange={(e) => handleUpdateSmtp({ fromName: e.target.value })}
                  placeholder="Escritório Modelo Contabilidade"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none placeholder:text-slate-600"
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
                  onChange={(e) => handleUpdateSmtp({ fromEmail: e.target.value })}
                  placeholder="fiscal@meuescritorio.com.br"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none font-mono placeholder:text-slate-600"
                />
              </div>

              {/* Reply-To */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  E-mail para Resposta (Reply-To)
                </label>
                <input
                  type="email"
                  value={config.customSmtp?.replyTo || ''}
                  onChange={(e) => handleUpdateSmtp({ replyTo: e.target.value })}
                  placeholder="atendimento@meuescritorio.com.br"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none font-mono placeholder:text-slate-600"
                />
              </div>

            </div>
          </div>

          {/* Test Connection Section */}
          <div className="p-6 rounded-2xl bg-slate-950/80 border border-indigo-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  Validação &amp; Teste de Conexão SMTP
                </h4>
                <p className="text-xs text-slate-400">
                  Envie uma mensagem de teste para verificar se o seu servidor aceita as credenciais informadas
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="E-mail para teste"
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 font-mono w-52"
                />
                <button
                  type="button"
                  disabled={isTestingSmtp}
                  onClick={handleTestConnection}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingSmtp ? 'animate-spin' : ''}`} />
                  {isTestingSmtp ? 'Testando...' : 'Testar Conexão SMTP'}
                </button>
              </div>
            </div>

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

        {/* Footer */}
        <div className="p-4 px-6 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Building2 className="w-4 h-4 text-indigo-400" />
            <span>As notificações de CNDs serão disparadas pelo e-mail do seu escritório.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold transition shadow-lg shadow-emerald-600/20 cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Salvar Configurações
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
