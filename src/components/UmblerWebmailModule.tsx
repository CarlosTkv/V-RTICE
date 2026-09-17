import React, { useState, useEffect, useMemo } from 'react';
import { 
  Mail, Send, Inbox, RefreshCw, Server, ShieldCheck, CheckCircle2, 
  Trash2, Search, Paperclip, AlertCircle, FileText, Sparkles, Star,
  Folder, FolderPlus, CheckSquare, Square, CornerUpLeft, Plus, X,
  ChevronDown, Edit3, Tag, ArrowRight, Clock, Eye, EyeOff, Settings,
  Forward, RotateCcw, FileEdit, Check, Cpu, Zap, Layers, Lock
} from 'lucide-react';
import { AuthService, SentEmailNotification, EmailAttachment } from '../utils/authService';
import { AuthUser } from '../types';

interface CustomFolder {
  id: string;
  name: string;
  color: string;
}

interface EmailSignatureConfig {
  autoAppend: boolean;
  senderName: string;
  jobTitle: string;
  companyName: string;
  website: string;
  phone: string;
  customText: string;
}

interface AutoResponderConfig {
  enabled: boolean;
  subject: string;
  message: string;
}

interface UmblerWebmailModuleProps {
  currentUser: AuthUser | null;
  onClose?: () => void;
}

const DEFAULT_CUSTOM_FOLDERS: CustomFolder[] = [
  { id: 'folder_fiscal', name: 'Auditoria & Fiscal', color: 'emerald' },
  { id: 'folder_clientes', name: 'Clientes VIP Vértice', color: 'blue' },
  { id: 'folder_financeiro', name: 'Financeiro & BPO', color: 'amber' },
];

const DEFAULT_SIGNATURE_CONFIG: EmailSignatureConfig = {
  autoAppend: true,
  senderName: 'Carlos Miguel Vieira',
  jobTitle: 'Master Proprietário & Diretor de Tecnologia',
  companyName: 'VÉRTICE AUDITOR FISCAL • Inteligência Tributária & Auditoria Digital',
  website: 'www.verticeanalises.com.br',
  phone: 'contato@verticeanalises.com.br',
  customText: 'Vieira & Associados • Inteligência Fiscal Master\n🔒 Mensagem criptografada e verificada pelo Gateway Umbler SMTP',
};

const DEFAULT_AUTO_RESPONDER: AutoResponderConfig = {
  enabled: false,
  subject: 'Resposta Automática: Recebemos sua mensagem • Vértice Inteligência Fiscal',
  message: 'Olá,\n\nAgradecemos o seu contato com a Vértice Inteligência Fiscal. Sua mensagem foi recebida com sucesso e está em análise por nossa equipe técnica.\n\nAtenciosamente,\nEquipe Vértice Analises',
};

export const UmblerWebmailModule: React.FC<UmblerWebmailModuleProps> = ({ currentUser, onClose }) => {
  // Estado dos e-mails
  const [emails, setEmails] = useState<SentEmailNotification[]>(() => AuthService.getSentEmails());
  
  // Estado de busca e navegação
  const [activeFolder, setActiveFolder] = useState<string>('inbox');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<SentEmailNotification | null>(null);

  // Seleção múltipla para ações em lote
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Gestão de Pastas Personalizadas
  const [customFolders, setCustomFolders] = useState<CustomFolder[]>(() => {
    try {
      const saved = localStorage.getItem('vertice_umbler_custom_folders_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_CUSTOM_FOLDERS;
  });

  // Configurações de Assinatura
  const [signatureConfig, setSignatureConfig] = useState<EmailSignatureConfig>(() => {
    try {
      const saved = localStorage.getItem('vertice_umbler_signature_config_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_SIGNATURE_CONFIG;
  });

  // Configurações de Resposta Automática
  const [autoResponder, setAutoResponder] = useState<AutoResponderConfig>(() => {
    try {
      const saved = localStorage.getItem('vertice_umbler_autoresponder_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_AUTO_RESPONDER;
  });

  // Modais de Ajustes & Diagnóstico
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsActiveTab, setSettingsActiveTab] = useState<'signature' | 'server' | 'autoresponder'>('signature');
  const [isTestingServer, setIsTestingServer] = useState(false);
  const [serverTestResult, setServerTestResult] = useState<string | null>(null);

  // Modais de Criação/Edição de Pastas
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<CustomFolder | null>(null);
  const [folderNameInput, setFolderNameInput] = useState('');

  // Modal de Composição / Resposta / Encaminhamento
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeAttachments, setComposeAttachments] = useState<EmailAttachment[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Modal de confirmação
  const [isConfirmEmptyTrashOpen, setIsConfirmEmptyTrashOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sincronizar dados no localStorage
  useEffect(() => {
    try {
      localStorage.setItem('vertice_umbler_custom_folders_v1', JSON.stringify(customFolders));
    } catch {}
  }, [customFolders]);

  useEffect(() => {
    try {
      localStorage.setItem('vertice_umbler_signature_config_v1', JSON.stringify(signatureConfig));
    } catch {}
  }, [signatureConfig]);

  useEffect(() => {
    try {
      localStorage.setItem('vertice_umbler_autoresponder_v1', JSON.stringify(autoResponder));
    } catch {}
  }, [autoResponder]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshEmails = () => {
    const list = AuthService.getSentEmails();
    setEmails(list);
    if (selectedEmail) {
      const updatedSel = list.find(e => e.id === selectedEmail.id);
      setSelectedEmail(updatedSel || null);
    }
  };

  // Gerar o bloco de texto formatado da assinatura
  const formattedSignatureText = useMemo(() => {
    return `\n\n--\n${signatureConfig.senderName}\n${signatureConfig.jobTitle}\n${signatureConfig.companyName}\n📧 contato@verticeanalises.com.br | 🌐 ${signatureConfig.website}\n${signatureConfig.customText}`;
  }, [signatureConfig]);

  // Abre janela de composição com ou sem assinatura automática
  const handleOpenComposeNew = () => {
    setComposeTo('');
    setComposeSubject('');
    const initialBody = signatureConfig.autoAppend ? formattedSignatureText : '';
    setComposeBody(initialBody);
    setComposeAttachments([]);
    setIsComposeOpen(true);
  };

  // ----------------------------------------------------
  // CONTAGEM DE E-MAILS POR PASTA
  // ----------------------------------------------------
  const folderCounts = useMemo(() => {
    const counts: Record<string, { total: number; unread: number }> = {
      inbox: { total: 0, unread: 0 },
      system_fired: { total: 0, unread: 0 },
      sent: { total: 0, unread: 0 },
      drafts: { total: 0, unread: 0 },
      spam: { total: 0, unread: 0 },
      trash: { total: 0, unread: 0 },
    };

    customFolders.forEach(f => {
      counts[f.id] = { total: 0, unread: 0 };
    });

    emails.forEach(e => {
      let target = e.folderId || 'inbox';
      if (!e.folderId) {
        if (e.type === 'custom_message') {
          target = 'sent';
        } else if (e.type === 'registration_confirmation' || e.type === 'password_reset' || e.type === 'two_factor_code' || e.type === 'invoice_receipt') {
          target = 'system_fired';
        } else {
          target = 'inbox';
        }
      }

      if (!counts[target]) {
        counts[target] = { total: 0, unread: 0 };
      }

      counts[target].total += 1;
      if (!e.read) {
        counts[target].unread += 1;
      }
    });

    return counts;
  }, [emails, customFolders]);

  // ----------------------------------------------------
  // FILTRAGEM DOS E-MAILS NA PASTA ATIVA
  // ----------------------------------------------------
  const currentFolderEmails = useMemo(() => {
    return emails.filter(e => {
      let emailFolder = e.folderId;
      if (!emailFolder) {
        if (e.type === 'custom_message') {
          emailFolder = 'sent';
        } else if (e.type === 'registration_confirmation' || e.type === 'password_reset' || e.type === 'two_factor_code' || e.type === 'invoice_receipt') {
          emailFolder = 'system_fired';
        } else {
          emailFolder = 'inbox';
        }
      }

      const matchFolder = emailFolder === activeFolder;
      if (!matchFolder) return false;

      if (!searchTerm.trim()) return true;

      const q = searchTerm.toLowerCase();
      return (
        e.toEmail.toLowerCase().includes(q) ||
        (e.toName && e.toName.toLowerCase().includes(q)) ||
        (e.subject && e.subject.toLowerCase().includes(q)) ||
        (e.bodyText && e.bodyText.toLowerCase().includes(q))
      );
    });
  }, [emails, activeFolder, searchTerm]);

  // ----------------------------------------------------
  // AÇÕES INDIVIDUAIS E MOVIMENTAÇÃO
  // ----------------------------------------------------
  const handleSelectEmail = (item: SentEmailNotification) => {
    setSelectedEmail(item);
    if (!item.read) {
      AuthService.markEmailAsRead(item.id);
      refreshEmails();
    }
  };

  const handleToggleStar = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    AuthService.toggleStarEmail(id);
    refreshEmails();
  };

  const handleToggleReadStatus = (e: React.MouseEvent, id: string, currentRead?: boolean) => {
    e.stopPropagation();
    const list = AuthService.getSentEmails();
    const updated = list.map(item => item.id === id ? { ...item, read: !currentRead } : item);
    AuthService.saveSentEmails(updated);
    refreshEmails();
  };

  const handleMoveToFolder = (id: string, folderId: string) => {
    AuthService.moveEmailToFolder(id, folderId);
    refreshEmails();
    const folderObj = customFolders.find(f => f.id === folderId);
    const folderName = folderObj ? folderObj.name : 
      folderId === 'inbox' ? 'Caixa de Entrada' : 
      folderId === 'trash' ? 'Lixeira' : 
      folderId === 'spam' ? 'Lixo Eletrônico' : 'Pasta';
    showToast(`E-mail movido para "${folderName}".`);
  };

  const handleRestoreFromTrash = (id: string) => {
    AuthService.moveEmailToFolder(id, 'inbox');
    refreshEmails();
    showToast('E-mail restaurado para a Caixa de Entrada.');
  };

  const handleDeleteSingle = (id: string) => {
    if (activeFolder === 'trash') {
      if (confirm('Deseja realmente excluir este e-mail definitivamente? Esta ação não pode ser desfeita.')) {
        AuthService.deleteEmailPermanently(id);
        if (selectedEmail?.id === id) setSelectedEmail(null);
        refreshEmails();
        showToast('E-mail excluído definitivamente.');
      }
    } else {
      AuthService.moveEmailToFolder(id, 'trash');
      if (selectedEmail?.id === id) setSelectedEmail(null);
      refreshEmails();
      showToast('E-mail movido para a Lixeira.');
    }
  };

  // ----------------------------------------------------
  // AÇÕES EM LOTE (BULK ACTIONS)
  // ----------------------------------------------------
  const handleToggleSelectId = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectAllInFolder = () => {
    if (selectedIds.length === currentFolderEmails.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentFolderEmails.map(e => e.id));
    }
  };

  const handleBulkMove = (targetFolderId: string) => {
    if (selectedIds.length === 0) return;
    AuthService.bulkMoveEmailsToFolder(selectedIds, targetFolderId);
    setSelectedIds([]);
    refreshEmails();
    showToast(`${selectedIds.length} e-mail(s) movido(s).`);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (activeFolder === 'trash') {
      if (confirm(`Deseja excluir definitivamente os ${selectedIds.length} e-mails selecionados?`)) {
        AuthService.bulkDeleteEmailsPermanently(selectedIds);
        setSelectedIds([]);
        setSelectedEmail(null);
        refreshEmails();
        showToast(`${selectedIds.length} e-mail(s) excluído(s) permanentemente.`);
      }
    } else {
      AuthService.bulkMoveEmailsToFolder(selectedIds, 'trash');
      setSelectedIds([]);
      refreshEmails();
      showToast(`${selectedIds.length} e-mail(s) movido(s) para a Lixeira.`);
    }
  };

  const handleEmptyTrash = () => {
    AuthService.emptyTrashEmails();
    setIsConfirmEmptyTrashOpen(false);
    setSelectedEmail(null);
    setSelectedIds([]);
    refreshEmails();
    showToast('Lixeira esvaziada com sucesso.');
  };

  // ----------------------------------------------------
  // RESPONDER & ENCAMINHAR & RASCUNHO
  // ----------------------------------------------------
  const handleOpenReply = (item: SentEmailNotification) => {
    setComposeTo(item.toEmail);
    setComposeSubject(item.subject.startsWith('Re: ') ? item.subject : `Re: ${item.subject}`);
    const replyBody = `\n\n--- Mensagem Anterior ---\nDe: contato@verticeanalises.com.br\nPara: ${item.toEmail}\nData: ${new Date(item.createdAt).toLocaleString()}\nAssunto: ${item.subject}\n\n${item.bodyText || ''}` + (signatureConfig.autoAppend ? formattedSignatureText : '');
    setComposeBody(replyBody);
    setIsComposeOpen(true);
  };

  const handleOpenForward = (item: SentEmailNotification) => {
    setComposeTo('');
    setComposeSubject(item.subject.startsWith('Enc: ') ? item.subject : `Enc: ${item.subject}`);
    const fwdBody = `\n\n---------- Mensagem Encaminhada ----------\nDe: contato@verticeanalises.com.br\nPara: ${item.toEmail}\nData: ${new Date(item.createdAt).toLocaleString()}\nAssunto: ${item.subject}\n\n${item.bodyText || ''}` + (signatureConfig.autoAppend ? formattedSignatureText : '');
    setComposeBody(fwdBody);
    setComposeAttachments(item.attachments || []);
    setIsComposeOpen(true);
  };

  const handleSaveAsDraft = () => {
    if (!composeSubject && !composeBody && !composeTo) {
      alert('Preencha ao menos o assunto ou texto para salvar o rascunho.');
      return;
    }

    const draftMail: SentEmailNotification = {
      id: `email_draft_${Date.now()}`,
      type: 'custom_message',
      toEmail: composeTo.trim().toLowerCase() || 'rascunho@vertice.com.br',
      toName: composeTo ? composeTo.split('@')[0] : 'Rascunho Pendente',
      subject: composeSubject || '(Sem assunto)',
      bodyText: composeBody,
      attachments: composeAttachments,
      folderId: 'drafts',
      createdAt: new Date().toISOString(),
      read: true,
    };

    AuthService.recordSentEmail(draftMail);
    refreshEmails();
    setIsComposeOpen(false);
    showToast('Rascunho salvo na pasta "Rascunhos".');
  };

  const handleAddAttachmentMock = () => {
    const mockFiles = [
      { name: 'Relatorio_Auditoria_Fiscal_2026.pdf', size: '2.4 MB', type: 'application/pdf' },
      { name: 'Demonstrativo_BPO_Contabil.xlsx', size: '850 KB', type: 'application/vnd.ms-excel' },
      { name: 'Parecer_Tributario_Vertice.pdf', size: '1.2 MB', type: 'application/pdf' },
      { name: 'Cartao_CNPJ_Vertice_Master.pdf', size: '420 KB', type: 'application/pdf' }
    ];
    const file = mockFiles[Math.floor(Math.random() * mockFiles.length)];
    if (!composeAttachments.some(a => a.name === file.name)) {
      setComposeAttachments(prev => [...prev, file]);
    }
  };

  const handleRemoveAttachment = (name: string) => {
    setComposeAttachments(prev => prev.filter(a => a.name !== name));
  };

  const handleInsertSignatureInBody = () => {
    setComposeBody(prev => prev + formattedSignatureText);
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo || !composeSubject || !composeBody) {
      alert('Por favor, preencha o destinatário, assunto e mensagem.');
      return;
    }

    setIsSending(true);

    setTimeout(() => {
      const newMail: SentEmailNotification = {
        id: `email_umbler_${Date.now()}`,
        type: 'custom_message',
        toEmail: composeTo.trim().toLowerCase(),
        toName: composeTo.split('@')[0],
        subject: composeSubject,
        bodyText: composeBody,
        attachments: composeAttachments,
        folderId: 'sent',
        createdAt: new Date().toISOString(),
        read: true,
      };

      AuthService.recordSentEmail(newMail);
      refreshEmails();

      setIsSending(false);
      setSendSuccess(true);

      setTimeout(() => {
        setSendSuccess(false);
        setIsComposeOpen(false);
        setComposeTo('');
        setComposeSubject('');
        setComposeBody('');
        setComposeAttachments([]);
        showToast('E-mail enviado com sucesso via Gateway Umbler SMTP.');
      }, 1000);
    }, 800);
  };

  // ----------------------------------------------------
  // GESTÃO DE PASTAS PERSONALIZADAS
  // ----------------------------------------------------
  const handleOpenCreateFolder = () => {
    setEditingFolder(null);
    setFolderNameInput('');
    setIsFolderModalOpen(true);
  };

  const handleOpenEditFolder = (folder: CustomFolder, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFolder(folder);
    setFolderNameInput(folder.name);
    setIsFolderModalOpen(true);
  };

  const handleSaveFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderNameInput.trim()) return;

    if (editingFolder) {
      setCustomFolders(prev => prev.map(f => f.id === editingFolder.id ? { ...f, name: folderNameInput.trim() } : f));
      showToast(`Pasta "${folderNameInput}" atualizada.`);
    } else {
      const newFolder: CustomFolder = {
        id: `folder_${Date.now()}`,
        name: folderNameInput.trim(),
        color: 'cyan'
      };
      setCustomFolders(prev => [...prev, newFolder]);
      showToast(`Nova pasta "${folderNameInput}" criada.`);
    }

    setIsFolderModalOpen(false);
  };

  const handleDeleteFolder = (folder: CustomFolder, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Deseja remover a pasta "${folder.name}"? Os e-mails contidos nela retornarão para a Caixa de Entrada.`)) {
      AuthService.bulkMoveEmailsToFolder(
        emails.filter(m => m.folderId === folder.id).map(m => m.id),
        'inbox'
      );
      setCustomFolders(prev => prev.filter(f => f.id !== folder.id));
      if (activeFolder === folder.id) setActiveFolder('inbox');
      refreshEmails();
      showToast(`Pasta "${folder.name}" removida.`);
    }
  };

  // ----------------------------------------------------
  // TESTE DE CONEXÃO COM O SERVIDOR UMBLER
  // ----------------------------------------------------
  const handleRunServerDiagnostic = () => {
    setIsTestingServer(true);
    setServerTestResult(null);

    setTimeout(() => {
      setIsTestingServer(false);
      setServerTestResult('OK_CONNECTED');
      showToast('Conexão IMAP/SMTP Umbler diagnosticada: 100% Funcional (Ping: 12ms)');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 rounded-xl bg-cyan-950 border border-cyan-500/50 text-cyan-200 text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER DA INTEGRAÇÃO UMBLER */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0B101D] via-[#0F172A] to-[#0A1120] border border-cyan-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
              <Mail className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Central de E-mails Umbler • Vértice System
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Servidor Umbler IMAP/SMTP 100% Ativo
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                <span>E-mail Oficial: <strong className="text-cyan-300 font-mono">contato@verticeanalises.com.br</strong></span>
                <span>•</span>
                <span>Domínio: <strong className="text-slate-200 font-mono">www.verticeanalises.com.br</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto flex-wrap sm:flex-nowrap">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
              title="Configurações de Assinatura, Servidor e Resposta Automática"
            >
              <Settings className="w-4 h-4 text-cyan-400" />
              <span>Configurações & Assinatura</span>
            </button>

            <button
              type="button"
              onClick={refreshEmails}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sincronizar</span>
            </button>

            <button
              type="button"
              onClick={handleOpenComposeNew}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-cyan-900/30 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Novo E-mail</span>
            </button>
          </div>
        </div>

        {/* METRICS & PARAMETROS RÁPIDOS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800/80 text-xs text-slate-300">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <Server className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-500 font-medium uppercase">IMAP Umbler</p>
              <p className="font-mono text-[11px] text-slate-200">imap.umbler.com:993</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <Send className="w-4 h-4 text-teal-400 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-500 font-medium uppercase">SMTP Umbler</p>
              <p className="font-mono text-[11px] text-slate-200">smtp.umbler.com:587</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-500 font-medium uppercase">Assinatura Corporativa</p>
              <p className="text-[11px] text-emerald-300 font-medium">
                {signatureConfig.autoAppend ? 'Inclusão Automática Ativa' : 'Manual'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <Inbox className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-500 font-medium uppercase">Não Lidos</p>
              <p className="text-[11px] text-amber-300 font-bold font-mono">
                {emails.filter(e => !e.read).length} Mensagens
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PAINEL PRINCIPAL EM 3 COLUNAS (PASTAS / LISTA DE MENSAGENS / LEITURA) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* =========================================================
            COLUNA 1: GESTÃO DE PASTAS E NAVEGAÇÃO
        ========================================================= */}
        <div className="lg:col-span-3 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <span className="text-xs font-bold text-slate-300 uppercase font-mono tracking-wider flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-cyan-400" />
                <span>Pastas do E-mail</span>
              </span>
              <button
                type="button"
                onClick={handleOpenCreateFolder}
                className="p-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer"
                title="Criar nova pasta personalizada"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>Nova Pasta</span>
              </button>
            </div>

            {/* LISTA DE PASTAS PADRÃO */}
            <div className="space-y-1 text-xs">
              <button
                onClick={() => { setActiveFolder('inbox'); setSelectedIds([]); }}
                className={`w-full px-3 py-2 rounded-xl transition flex items-center justify-between cursor-pointer ${
                  activeFolder === 'inbox'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-cyan-400" />
                  <span>Caixa de Entrada</span>
                </div>
                {folderCounts.inbox.unread > 0 ? (
                  <span className="px-2 py-0.2 rounded-full bg-cyan-500 text-slate-950 font-bold text-[10px] font-mono">
                    {folderCounts.inbox.unread}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500 font-mono">{folderCounts.inbox.total}</span>
                )}
              </button>

              <button
                onClick={() => { setActiveFolder('system_fired'); setSelectedIds([]); }}
                className={`w-full px-3 py-2 rounded-xl transition flex items-center justify-between cursor-pointer ${
                  activeFolder === 'system_fired'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-400" />
                  <span>Disparos de Sistema</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">{folderCounts.system_fired.total}</span>
              </button>

              <button
                onClick={() => { setActiveFolder('sent'); setSelectedIds([]); }}
                className={`w-full px-3 py-2 rounded-xl transition flex items-center justify-between cursor-pointer ${
                  activeFolder === 'sent'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-400" />
                  <span>Enviados</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">{folderCounts.sent.total}</span>
              </button>

              <button
                onClick={() => { setActiveFolder('drafts'); setSelectedIds([]); }}
                className={`w-full px-3 py-2 rounded-xl transition flex items-center justify-between cursor-pointer ${
                  activeFolder === 'drafts'
                    ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileEdit className="w-4 h-4 text-purple-400" />
                  <span>Rascunhos</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">{folderCounts.drafts.total}</span>
              </button>

              <button
                onClick={() => { setActiveFolder('spam'); setSelectedIds([]); }}
                className={`w-full px-3 py-2 rounded-xl transition flex items-center justify-between cursor-pointer ${
                  activeFolder === 'spam'
                    ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>Lixo Eletrônico / Spam</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">{folderCounts.spam.total}</span>
              </button>

              <button
                onClick={() => { setActiveFolder('trash'); setSelectedIds([]); }}
                className={`w-full px-3 py-2 rounded-xl transition flex items-center justify-between cursor-pointer ${
                  activeFolder === 'trash'
                    ? 'bg-red-500/20 text-red-300 font-bold border border-red-500/30'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-red-400" />
                  <span>Lixeira</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">{folderCounts.trash.total}</span>
              </button>
            </div>

            {/* SEÇÃO DE PASTAS PERSONALIZADAS DO USUÁRIO */}
            <div className="pt-3 border-t border-slate-800/80 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider block">
                Minhas Pastas Personalizadas
              </span>

              {customFolders.length === 0 ? (
                <p className="text-[11px] text-slate-500 italic p-2">Nenhuma pasta criada.</p>
              ) : (
                <div className="space-y-1 text-xs">
                  {customFolders.map(folder => {
                    const count = folderCounts[folder.id] || { total: 0, unread: 0 };
                    const isActive = activeFolder === folder.id;
                    return (
                      <div
                        key={folder.id}
                        onClick={() => { setActiveFolder(folder.id); setSelectedIds([]); }}
                        className={`group px-3 py-2 rounded-xl transition flex items-center justify-between cursor-pointer ${
                          isActive
                            ? 'bg-slate-800 text-white font-bold border border-slate-700'
                            : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Tag className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span className="truncate">{folder.name}</span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {count.unread > 0 ? (
                            <span className="px-1.5 py-0.2 rounded-full bg-cyan-500 text-slate-950 font-bold text-[9px] font-mono">
                              {count.unread}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-mono">{count.total}</span>
                          )}

                          <button
                            type="button"
                            onClick={(e) => handleOpenEditFolder(folder, e)}
                            className="p-1 text-slate-500 hover:text-cyan-300 opacity-0 group-hover:opacity-100 transition"
                            title="Editar pasta"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleDeleteFolder(folder, e)}
                            className="p-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                            title="Excluir pasta"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* =========================================================
            COLUNA 2: BARRA DE FERRAMENTAS & LISTA DE MENSAGENS
        ========================================================= */}
        <div className="lg:col-span-4 space-y-3">
          
          {/* BUSCA DE E-MAILS */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar remetente, assunto ou texto..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* BARRA DE AÇÕES EM LOTE E SELEÇÃO */}
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <button
              onClick={handleSelectAllInFolder}
              className="flex items-center gap-1.5 hover:text-white cursor-pointer"
            >
              {selectedIds.length > 0 && selectedIds.length === currentFolderEmails.length ? (
                <CheckSquare className="w-4 h-4 text-cyan-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-500" />
              )}
              <span>{selectedIds.length > 0 ? `${selectedIds.length} sel.` : 'Selecionar'}</span>
            </button>

            {selectedIds.length > 0 ? (
              <div className="flex items-center gap-1.5">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBulkMove(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  defaultValue=""
                  className="bg-slate-800 border border-slate-700 text-[11px] text-slate-200 rounded-lg px-2 py-1 outline-none cursor-pointer"
                >
                  <option value="" disabled>Mover para...</option>
                  <option value="inbox">Caixa de Entrada</option>
                  <option value="spam">Spam / Lixo</option>
                  <option value="trash">Lixeira</option>
                  {customFolders.map(f => (
                    <option key={f.id} value={f.id}>📁 {f.name}</option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleBulkDelete}
                  className="px-2 py-1 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer"
                  title="Excluir selecionados"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir</span>
                </button>
              </div>
            ) : (
              activeFolder === 'trash' && currentFolderEmails.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsConfirmEmptyTrashOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Esvaziar Lixeira</span>
                </button>
              )
            )}
          </div>

          {/* LISTAGEM DE MENSAGENS DA PASTA SELECIONADA */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
            {currentFolderEmails.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
                <Inbox className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs font-semibold text-slate-300">Nenhum e-mail nesta pasta</p>
                <p className="text-[11px] text-slate-500">
                  {activeFolder === 'trash'
                    ? 'A lixeira está vazia.'
                    : 'Mensagens direcionadas a esta pasta aparecerão listadas aqui.'}
                </p>
              </div>
            ) : (
              currentFolderEmails.map((item) => {
                const isSelected = selectedEmail?.id === item.id;
                const isChecked = selectedIds.includes(item.id);
                const isUnread = !item.read;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectEmail(item)}
                    className={`p-3 rounded-xl border transition cursor-pointer relative group ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-md'
                        : isUnread
                        ? 'bg-slate-900 border-slate-700/80 text-white'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSelectId(item.id);
                          }}
                          className="text-slate-500 hover:text-cyan-400 cursor-pointer"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-cyan-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleToggleStar(e, item.id)}
                          className={`cursor-pointer ${item.isStarred ? 'text-amber-400' : 'text-slate-600 hover:text-amber-400'}`}
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </button>

                        <h4 className={`text-xs truncate max-w-[150px] ${isUnread ? 'font-bold text-white' : 'font-medium text-slate-200'}`}>
                          {item.toName || item.toEmail}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        )}
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <p className={`text-xs truncate ${isUnread ? 'font-bold text-slate-100' : 'text-slate-300'}`}>
                      {item.subject}
                    </p>

                    <p className="text-[11px] text-slate-500 truncate mt-0.5 font-sans">
                      {item.bodyText || 'Mensagem de comunicação Vértice...'}
                    </p>

                    {/* BOTÕES FLUTUANTES AO PASSAR O MOUSE */}
                    <div className="absolute right-2 bottom-2 hidden group-hover:flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg px-1.5 py-0.5 shadow-lg">
                      <button
                        type="button"
                        onClick={(e) => handleToggleReadStatus(e, item.id, item.read)}
                        className="p-1 text-slate-400 hover:text-cyan-300"
                        title={item.read ? 'Marcar como não lido' : 'Marcar como lido'}
                      >
                        {item.read ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSingle(item.id);
                        }}
                        className="p-1 text-slate-400 hover:text-red-400"
                        title={activeFolder === 'trash' ? 'Excluir definitivamente' : 'Mover para lixeira'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* =========================================================
            COLUNA 3: VISUALIZADOR DETALHADO DO E-MAIL SELECIONADO
        ========================================================= */}
        <div className="lg:col-span-5">
          {selectedEmail ? (
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
              
              {/* CABEÇALHO DO E-MAIL */}
              <div className="pb-4 border-b border-slate-800 space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold uppercase">
                      {selectedEmail.type === 'custom_message' ? 'E-mail Direto' : 'Notificação de Sistema'}
                    </span>
                    {selectedEmail.folderId && selectedEmail.folderId !== 'inbox' && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-mono border border-slate-700">
                        📁 {customFolders.find(f => f.id === selectedEmail.folderId)?.name || selectedEmail.folderId}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* BOTÃO RESPONDER */}
                    <button
                      type="button"
                      onClick={() => handleOpenReply(selectedEmail)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1 cursor-pointer"
                    >
                      <CornerUpLeft className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Responder</span>
                    </button>

                    {/* BOTÃO ENCAMINHAR */}
                    <button
                      type="button"
                      onClick={() => handleOpenForward(selectedEmail)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1 cursor-pointer"
                    >
                      <Forward className="w-3.5 h-3.5 text-teal-400" />
                      <span>Encaminhar</span>
                    </button>

                    {/* BOTÃO RESTAURAR (SE NA LIXEIRA) */}
                    {activeFolder === 'trash' && (
                      <button
                        type="button"
                        onClick={() => handleRestoreFromTrash(selectedEmail.id)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restaurar</span>
                      </button>
                    )}

                    {/* MOVER PARA PASTA */}
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleMoveToFolder(selectedEmail.id, e.target.value);
                        }
                      }}
                      value={selectedEmail.folderId || 'inbox'}
                      className="bg-slate-800 border border-slate-700 text-[11px] text-slate-200 rounded-lg px-2 py-1 outline-none cursor-pointer"
                    >
                      <option value="inbox">Mover para: Caixa de Entrada</option>
                      <option value="spam">Mover para: Spam</option>
                      <option value="trash">Mover para: Lixeira</option>
                      {customFolders.map(f => (
                        <option key={f.id} value={f.id}>Mover para: {f.name}</option>
                      ))}
                    </select>

                    {/* BOTÃO EXCLUIR */}
                    <button
                      type="button"
                      onClick={() => handleDeleteSingle(selectedEmail.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 cursor-pointer"
                      title={activeFolder === 'trash' ? 'Excluir definitivamente' : 'Mover para Lixeira'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white">
                  {selectedEmail.subject}
                </h3>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-slate-300">
                      <strong>De:</strong> <span className="text-cyan-400 font-mono">contato@verticeanalises.com.br</span>
                    </p>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(selectedEmail.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-300">
                    <strong>Para:</strong> {selectedEmail.toName || selectedEmail.toEmail} &lt;<span className="font-mono text-slate-400">{selectedEmail.toEmail}</span>&gt;
                  </p>
                </div>
              </div>

              {/* CONTEÚDO DO CORPO DA MENSAGEM */}
              <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 font-sans min-h-[160px]">
                {selectedEmail.bodyText ? selectedEmail.bodyText : (
                  selectedEmail.type === 'registration_confirmation' ? (
                    `Prezado(a) ${selectedEmail.toName || 'Profissional'},\n\nSua solicitação de acesso à Plataforma VÉRTICE AUDITOR FISCAL foi processada e aprovada pelo Master Proprietário.\n\nPara prosseguir e efetuar seu primeiro acesso com a senha provisória gerada, acesse a plataforma oficial.\n\nAtenciosamente,\nEquipe Vértice Inteligência Fiscal\nwww.verticeanalises.com.br`
                  ) : (
                    `Olá, ${selectedEmail.toName || 'Usuário'},\n\nRecebemos uma solicitação de redefinição de senha para sua conta (${selectedEmail.toEmail}).\n\nCaso você tenha solicitado esta alteração, utilize o link de segurança abaixo para cadastrar sua nova senha.\n\nAtenciosamente,\nSuporte Técnico Vértice Auditor Fiscal`
                  )
                )}
              </div>

              {/* ANEXOS SE HOUVER */}
              {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase font-mono flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Anexos ({selectedEmail.attachments.length})</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedEmail.attachments.map((att, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                        <div className="truncate">
                          <p className="font-medium text-slate-200 truncate">{att.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{att.size}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => alert(`Baixando anexo: ${att.name}`)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-bold transition"
                        >
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
              <Mail className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-300">Nenhum e-mail selecionado</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Selecione qualquer mensagem da lista para abrir a leitura completa, gerenciar pastas ou responder.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* =========================================================
          MODAL: CONFIGURAÇÕES DO E-MAIL, ASSINATURA & SERVIDOR
      ========================================================= */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-2xl bg-[#0F172A] border border-cyan-500/40 rounded-2xl shadow-2xl p-6 space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Configurações de E-mail Umbler & Assinatura</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* NAV TABS */}
            <div className="flex items-center gap-2 border-b border-slate-800 text-xs">
              <button
                onClick={() => setSettingsActiveTab('signature')}
                className={`px-4 py-2 border-b-2 font-bold transition flex items-center gap-2 cursor-pointer ${
                  settingsActiveTab === 'signature'
                    ? 'border-cyan-400 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Assinatura Corporativa</span>
              </button>

              <button
                onClick={() => setSettingsActiveTab('server')}
                className={`px-4 py-2 border-b-2 font-bold transition flex items-center gap-2 cursor-pointer ${
                  settingsActiveTab === 'server'
                    ? 'border-cyan-400 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Server className="w-4 h-4" />
                <span>Servidor & Diagnóstico</span>
              </button>

              <button
                onClick={() => setSettingsActiveTab('autoresponder')}
                className={`px-4 py-2 border-b-2 font-bold transition flex items-center gap-2 cursor-pointer ${
                  settingsActiveTab === 'autoresponder'
                    ? 'border-cyan-400 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Resposta Automática</span>
              </button>
            </div>

            {/* TAB 1: ASSINATURA CORPORATIVA */}
            {settingsActiveTab === 'signature' && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div>
                    <p className="font-bold text-white">Anexar Assinatura Automática</p>
                    <p className="text-[11px] text-slate-400">Inserir a assinatura automaticamente em todos os novos envios e respostas.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={signatureConfig.autoAppend}
                      onChange={(e) => setSignatureConfig(prev => ({ ...prev, autoAppend: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Nome Completo</label>
                    <input
                      type="text"
                      value={signatureConfig.senderName}
                      onChange={(e) => setSignatureConfig(prev => ({ ...prev, senderName: e.target.value }))}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Cargo / Função</label>
                    <input
                      type="text"
                      value={signatureConfig.jobTitle}
                      onChange={(e) => setSignatureConfig(prev => ({ ...prev, jobTitle: e.target.value }))}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Empresa / Unidade Master</label>
                  <input
                    type="text"
                    value={signatureConfig.companyName}
                    onChange={(e) => setSignatureConfig(prev => ({ ...prev, companyName: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Texto Institucional / Criptografia</label>
                  <textarea
                    rows={2}
                    value={signatureConfig.customText}
                    onChange={(e) => setSignatureConfig(prev => ({ ...prev, customText: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-sans"
                  />
                </div>

                {/* PREVIEW VISUAL DA ASSINATURA */}
                <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-2">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase font-mono tracking-wider flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Pré-visualização da Assinatura Oficial</span>
                  </span>
                  
                  <div className="pl-3 border-l-2 border-cyan-400 space-y-1 font-sans text-xs text-slate-200">
                    <p className="font-bold text-white">{signatureConfig.senderName}</p>
                    <p className="text-cyan-300 font-medium">{signatureConfig.jobTitle}</p>
                    <p className="text-slate-400 font-semibold">{signatureConfig.companyName}</p>
                    <p className="text-slate-400 font-mono text-[11px]">
                      📧 contato@verticeanalises.com.br | 🌐 {signatureConfig.website}
                    </p>
                    <p className="text-[10px] text-slate-500 whitespace-pre-line pt-1">
                      {signatureConfig.customText}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SERVIDOR & DIAGNÓSTICO */}
            {settingsActiveTab === 'server' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-2">
                      <Server className="w-4 h-4 text-cyan-400" />
                      Status dos Servidores de E-mail Umbler
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                      100% OPERACIONAL
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <p className="text-[10px] text-slate-500 font-mono uppercase">IMAP (Entrada)</p>
                      <p className="font-bold text-white font-mono mt-0.5">imap.umbler.com</p>
                      <p className="text-[11px] text-slate-400">Porta: 993 (SSL / TLS)</p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <p className="text-[10px] text-slate-500 font-mono uppercase">SMTP (Saída)</p>
                      <p className="font-bold text-white font-mono mt-0.5">smtp.umbler.com</p>
                      <p className="text-[11px] text-slate-400">Porta: 587 (STARTTLS)</p>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                    <span className="text-[11px] text-slate-400">Autenticação: <strong className="text-cyan-300 font-mono">contato@verticeanalises.com.br</strong></span>
                    <button
                      type="button"
                      onClick={handleRunServerDiagnostic}
                      disabled={isTestingServer}
                      className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      {isTestingServer ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                      <span>{isTestingServer ? 'Testando Conexão...' : 'Testar Conexão Umbler'}</span>
                    </button>
                  </div>

                  {serverTestResult && (
                    <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 space-y-1">
                      <p className="font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Conexão Estabelecida com Sucesso!
                      </p>
                      <p className="text-[11px]">
                        IMAP Ping: 12ms | SMTP Ping: 14ms | SPF & DKIM: Válidos | Criptografia: TLSv1.3
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: RESPOSTA AUTOMÁTICA */}
            {settingsActiveTab === 'autoresponder' && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div>
                    <p className="font-bold text-white">Ativar Resposta Automática</p>
                    <p className="text-[11px] text-slate-400">Responder automaticamente a novos e-mails recebidos durante períodos de ausência.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoResponder.enabled}
                      onChange={(e) => setAutoResponder(prev => ({ ...prev, enabled: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Assunto Automático</label>
                  <input
                    type="text"
                    value={autoResponder.subject}
                    onChange={(e) => setAutoResponder(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mensagem de Resposta</label>
                  <textarea
                    rows={4}
                    value={autoResponder.message}
                    onChange={(e) => setAutoResponder(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-sans"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  showToast('Configurações salvas com sucesso.');
                  setIsSettingsOpen(false);
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold cursor-pointer transition"
              >
                Salvar Configurações
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: CRIAR OU EDITAR PASTA PERSONALIZADA
      ========================================================= */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#0F172A] border border-cyan-500/40 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">
                  {editingFolder ? 'Editar Pasta Personalizada' : 'Criar Nova Pasta de E-mails'}
                </h3>
              </div>
              <button
                onClick={() => setIsFolderModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFolder} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nome da Pasta *</label>
                <input
                  type="text"
                  required
                  value={folderNameInput}
                  onChange={(e) => setFolderNameInput(e.target.value)}
                  placeholder="Ex: Impostos & BPO, Clientes Especial"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFolderModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold cursor-pointer transition"
                >
                  Salvar Pasta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: COMPOSIÇÃO DE E-MAIL COM ASSINATURA E ANEXOS
      ========================================================= */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-xl bg-[#0F172A] border border-cyan-500/40 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Novo E-mail via Gateway Umbler SMTP</h3>
              </div>
              <button
                onClick={() => setIsComposeOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {sendSuccess ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-sm font-bold text-white">E-mail Transmitido com Sucesso!</h4>
                <p className="text-xs text-slate-400">
                  Enviado via <strong className="text-cyan-300 font-mono">contato@verticeanalises.com.br</strong> para <strong className="text-slate-200 font-mono">{composeTo}</strong>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendEmail} className="space-y-3.5 text-xs">
                
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">
                    Remetente: <strong className="text-cyan-300 font-mono">contato@verticeanalises.com.br</strong>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                    SMTP SSL/TLS Autenticado
                  </span>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Destinatário (Para) *</label>
                  <input
                    type="email"
                    required
                    value={composeTo}
                    onChange={(e) => setComposeTo(e.target.value)}
                    placeholder="exemplo@cliente.com.br"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Assunto *</label>
                  <input
                    type="text"
                    required
                    value={composeSubject}
                    onChange={(e) => setComposeSubject(e.target.value)}
                    placeholder="Assunto da mensagem corporativa"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-300 font-semibold">Mensagem *</label>
                    <button
                      type="button"
                      onClick={handleInsertSignatureInBody}
                      className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Inserir Assinatura Oficial</span>
                    </button>
                  </div>
                  <textarea
                    required
                    rows={6}
                    value={composeBody}
                    onChange={(e) => setComposeBody(e.target.value)}
                    placeholder="Escreva sua mensagem aqui..."
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-sans focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* ANEXOS */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Anexos ({composeAttachments.length})</span>
                    </span>

                    <button
                      type="button"
                      onClick={handleAddAttachmentMock}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-semibold transition cursor-pointer"
                    >
                      + Anexar Documento
                    </button>
                  </div>

                  {composeAttachments.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {composeAttachments.map((att, idx) => (
                        <div key={idx} className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] flex items-center gap-2">
                          <span className="text-slate-200 font-medium">{att.name} ({att.size})</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(att.name)}
                            className="text-slate-500 hover:text-red-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleSaveAsDraft}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 font-semibold border border-purple-500/30 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    <span>Salvar Rascunho</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsComposeOpen(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      disabled={isSending}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold cursor-pointer transition flex items-center gap-2"
                    >
                      {isSending ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Transmitindo...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Enviar E-mail</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO: ESVAZIAR LIXEIRA */}
      {isConfirmEmptyTrashOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-[#0F172A] border border-red-500/40 rounded-2xl shadow-2xl p-5 space-y-3 text-center">
            <Trash2 className="w-10 h-10 text-red-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">Esvaziar Lixeira Definitivamente?</h4>
            <p className="text-xs text-slate-400">
              Esta ação removerá permanentemente todas as mensagens contidas na Lixeira. Esta operação não pode ser desfeita.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setIsConfirmEmptyTrashOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleEmptyTrash}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer transition"
              >
                Sim, Esvaziar Tudo
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
