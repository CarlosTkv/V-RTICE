import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, ExternalLink, Copy, X, Send, Eye, ShieldCheck, Clock, RefreshCw } from 'lucide-react';
import { AuthService, SentEmailNotification } from '../utils/authService';

interface EmailDispatchNotifierModalProps {
  showToast?: (msg: string) => void;
}

export const EmailDispatchNotifierModal: React.FC<EmailDispatchNotifierModalProps> = ({ showToast }) => {
  const [activeDispatch, setActiveDispatch] = useState<SentEmailNotification & { mailtoUrl?: string; bodyText?: string } | null>(null);
  const [isSentHistoryOpen, setIsSentHistoryOpen] = useState(false);
  const [sentEmails, setSentEmails] = useState<SentEmailNotification[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    // Carrega e-mails enviados
    setSentEmails(AuthService.getSentEmails());

    const handleDispatched = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const item = customEvent.detail;
        setActiveDispatch(item);
        setSentEmails(AuthService.getSentEmails());
      }
    };

    window.addEventListener('vertice_email_dispatched', handleDispatched);
    return () => {
      window.removeEventListener('vertice_email_dispatched', handleDispatched);
    };
  }, []);

  const handleOpenMailto = (item: SentEmailNotification & { mailtoUrl?: string; bodyText?: string }) => {
    const dispatchInfo = AuthService.triggerDirectEmailDispatch(item, false);
    window.open(dispatchInfo.mailtoUrl, '_blank');
    if (showToast) {
      showToast(`Cliente de e-mail aberto para envio direto a ${item.toEmail}`);
    }
  };

  const handleCopyLinkOrCode = (item: SentEmailNotification) => {
    const val = item.otpCode || item.linkUrl || item.subject;
    navigator.clipboard.writeText(val);
    setCopiedId(item.id);
    if (showToast) {
      showToast(`Copiado para a área de transferência: ${val.substring(0, 30)}...`);
    }
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      {/* Toast flutuante de confirmação de e-mail disparado */}
      {activeDispatch && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md w-full bg-slate-900 border border-emerald-500/50 rounded-2xl shadow-2xl p-4 text-white animate-in slide-in-from-bottom-5 duration-300 backdrop-blur-md">
          <div className="flex items-start justify-between gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Mail className="w-5 h-5 animate-bounce" />
            </div>

            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono text-[10px] font-bold inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  E-MAIL DISPARADO AO CLIENTE
                </span>
              </div>

              <h4 className="text-xs font-bold text-white line-clamp-1">{activeDispatch.subject}</h4>
              
              <div className="text-[11px] text-slate-300">
                Enviado exclusivamente para: <strong className="text-emerald-300 font-mono">{activeDispatch.toEmail}</strong>
              </div>

              {(activeDispatch.otpCode || activeDispatch.linkUrl) && (
                <div className="mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-300 break-all">
                  {activeDispatch.otpCode ? `Código OTP: ${activeDispatch.otpCode}` : `Link: ${activeDispatch.linkUrl}`}
                </div>
              )}

              <div className="pt-2 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleOpenMailto(activeDispatch)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition shadow-xs flex items-center space-x-1 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Abrir no Leitor de E-mail</span>
                </button>

                <button
                  onClick={() => handleCopyLinkOrCode(activeDispatch)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-[11px] transition flex items-center space-x-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedId === activeDispatch.id ? 'Copiado!' : 'Copiar Dados'}</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => setActiveDispatch(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Botão Fixo de Acesso ao Histórico de E-mails Disparados no Rodapé/Header */}
      <button
        onClick={() => {
          setSentEmails(AuthService.getSentEmails());
          setIsSentHistoryOpen(true);
        }}
        className="fixed bottom-5 left-5 z-40 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-emerald-500 text-slate-200 text-xs font-semibold shadow-xl transition flex items-center space-x-2 backdrop-blur-md cursor-pointer group"
        title="Ver Central de E-mails Disparados aos Clientes"
      >
        <div className="relative">
          <Mail className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
          {sentEmails.length > 0 && (
            <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          )}
        </div>
        <span>Central de E-mails ({sentEmails.length})</span>
      </button>

      {/* Modal Completo de Histórico de E-mails Transacionais Enviados ao Cliente */}
      {isSentHistoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200">
            {/* Header do Modal */}
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Central de E-mails Disparados aos Clientes
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-800">
                      DISPARO DIRETO
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Todos os e-mails (NFS-e, Recuperação de Senha, 2FA, Faturas) são enviados exclusivamente para o e-mail do cliente.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsSentHistoryOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lista de E-mails */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {sentEmails.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <Mail className="w-12 h-12 text-slate-600 mx-auto" />
                  <p className="text-sm text-slate-400">Nenhum e-mail transacional foi disparado ainda nesta sessão.</p>
                </div>
              ) : (
                sentEmails.map((email) => (
                  <div key={email.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 hover:border-slate-700 transition">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono font-bold uppercase">
                          {email.type.replace('_', ' ')}
                        </span>
                        <span className="text-xs font-bold text-white font-mono">{email.toEmail}</span>
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{new Date(email.createdAt).toLocaleString('pt-BR')}</span>
                      </div>
                    </div>

                    <h4 className="text-xs font-semibold text-slate-200">{email.subject}</h4>

                    {(email.otpCode || email.linkUrl) && (
                      <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-400 break-all">
                        {email.otpCode ? `Código OTP / 2FA: ${email.otpCode}` : `Link de Acesso: ${email.linkUrl}`}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-slate-500">Destinatário: <strong className="text-slate-300">{email.toName}</strong></span>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleCopyLinkOrCode(email)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition flex items-center space-x-1 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copiedId === email.id ? 'Copiado' : 'Copiar'}</span>
                        </button>

                        <button
                          onClick={() => handleOpenMailto(email)}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center space-x-1 cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>Disparar E-mail ao Cliente</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Autenticação via Gateway SMTP Transacional Direct
              </span>
              <button
                onClick={() => {
                  AuthService.clearSentEmails();
                  setSentEmails([]);
                }}
                className="text-slate-400 hover:text-red-400 transition cursor-pointer"
              >
                Limpar Histórico
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
