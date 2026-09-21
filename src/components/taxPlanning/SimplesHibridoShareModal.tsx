import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  Globe,
  ExternalLink,
  MessageSquare,
  Mail,
  QrCode,
  Lock,
  Unlock,
  ShieldCheck,
  UserCheck,
  Building2,
  Sparkles,
  Sliders,
  Eye,
  Key,
  Calendar,
  X,
  Send,
  Printer,
  FileText
} from 'lucide-react';
import { CompanyData } from '../../types';
import { formatCurrencyBRL } from '../../utils/taxRules';
import { SimplesHibridoResult } from '../../utils/simplesHibridoEngine';

interface SimplesHibridoShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyData;
  result: SimplesHibridoResult;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onOpenClientMode?: () => void;
}

export const SimplesHibridoShareModal: React.FC<SimplesHibridoShareModalProps> = ({
  isOpen,
  onClose,
  company,
  result,
  showToast,
  onOpenClientMode,
}) => {
  const [activeTab, setActiveTab] = useState<'link' | 'whatsapp' | 'email' | 'qrcode' | 'user'>('link');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isInteractive, setIsInteractive] = useState<boolean>(true);
  const [usePinCode, setUsePinCode] = useState<boolean>(false);
  const [pinCode, setPinCode] = useState<string>('2026');
  const [validityDays, setValidityDays] = useState<string>('30');
  
  // User Creation State
  const [clientUserName, setClientUserName] = useState<string>(company.name || 'Diretoria Executiva');
  const [clientUserEmail, setClientUserEmail] = useState<string>('');
  const [clientUserPassword, setClientUserPassword] = useState<string>('Simples@2026');
  const [userCreatedSuccess, setUserCreatedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  // Base URL
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://verticefiscal.app';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  
  // URL Params for Client Direct Access
  const queryParams = new URLSearchParams();
  queryParams.set('module', 'simples_hibrido');
  queryParams.set('view', 'cliente_simples_hibrido');
  if (company.cnpj) queryParams.set('cnpj', company.cnpj);
  if (company.name) queryParams.set('company', company.name);
  if (!isInteractive) queryParams.set('readonly', '1');
  if (usePinCode && pinCode) queryParams.set('pin', pinCode);

  const clientShareUrl = `${origin}${pathname}?${queryParams.toString()}`;

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    showToast(`${keyName} copiado para a área de transferência!`, 'success');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const cheaperRegimeLabel = result.cenarioA_Financeiro.cheaperRegime === 'tradicional'
    ? 'Simples Tradicional'
    : 'Simples Híbrido';

  const savingsText = result.cenarioA_Financeiro.annualDelta > 0
    ? `Diferença anual estimada: ${formatCurrencyBRL(result.cenarioA_Financeiro.annualDelta)} em favor do ${cheaperRegimeLabel}`
    : `Alíquotas equivalentes entre os modelos`;

  // Pre-formatted WhatsApp Message
  const whatsappMessage = `*LAUDO TÉCNICO PERICIAL - REFORMA TRIBUTÁRIA (EC 132/23)*
🏢 *Empresa:* ${company.name || 'Empresa em Auditoria'}
📄 *CNPJ:* ${company.cnpj || 'Sob Consulta'}
📊 *Diagnóstico Comparativo:* Simples Tradicional vs. Simples Híbrido (IBS/CBS)

📌 *Resultado Preliminar:*
• Regime Recomendado pelo Caixa: *${cheaperRegimeLabel}*
• ${savingsText}
• Alíquota Efetiva Tradicional: *${result.cenarioA_Financeiro.tradicionalEffectiveRate.toFixed(2)}%*
• Alíquota Efetiva Híbrido: *${result.cenarioA_Financeiro.hibridoEffectiveRate.toFixed(2)}%*
• Crédito ao Comprador B2B: *${result.cenarioB_Comercial.hibridoB2bCreditRate.toFixed(1)}% (no Híbrido)* vs *${result.cenarioB_Comercial.tradicionalB2bCreditRate.toFixed(1)}% (no Tradicional)*

🔗 *Acesse seu Simulador e Parecer Exclusivo:*
${clientShareUrl}${usePinCode ? `\n🔑 *Código PIN de Acesso:* ${pinCode}` : ''}

_Elaborado por Vértice Auditor Fiscal - Consultoria Pericial de Inteligência Tributária_`;

  const whatsappShareLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMessage)}`;

  // Pre-formatted Email
  const emailSubject = `Parecer Tributário e Acesso ao Simulador Simples Híbrido - ${company.name}`;
  const emailBody = `Prezado(a) Diretor(a) / Gestor(a),

Disponibilizamos o acesso exclusivo ao módulo pericial de simulação do Simples Tradicional vs. Simples Híbrido (Reforma Tributária - Emenda Constitucional 132/2023) personalizado para ${company.name}.

RESUMO DO DIAGNÓSTICO:
- Modelo Mais Vantajoso em Caixa: ${cheaperRegimeLabel}
- ${savingsText}
- Alíquota Efetiva Tradicional: ${result.cenarioA_Financeiro.tradicionalEffectiveRate.toFixed(2)}%
- Alíquota Efetiva Híbrida: ${result.cenarioA_Financeiro.hibridoEffectiveRate.toFixed(2)}%
- Repasse de Crédito ao Cliente PJ: ${result.cenarioB_Comercial.hibridoB2bCreditRate.toFixed(1)}% (Híbrido) vs ${result.cenarioB_Comercial.tradicionalB2bCreditRate.toFixed(1)}% (Tradicional)

Para acessar o painel interativo, visualizar os gráficos de sensibilidade e emitir o Parecer Pericial Oficial em PDF, acesse o link abaixo:

${clientShareUrl}
${usePinCode ? `Código PIN de Acesso: ${pinCode}\n` : ''}

Permanecemos à disposição para reuniões de alinhamento e apresentação do plano tributário.

Atenciosamente,
Equipe de Inteligência Tributária
Vértice Auditor Fiscal`;

  const mailtoLink = `mailto:${encodeURIComponent(clientUserEmail || '')}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  // Handle Create Client User
  const handleCreateClientAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientUserEmail) {
      showToast('Informe o e-mail do cliente para criar a conta.', 'error');
      return;
    }

    try {
      const savedUsersRaw = localStorage.getItem('sna_system_users_db');
      const savedUsers = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];

      const newUser = {
        id: `user-client-${Date.now()}`,
        name: clientUserName || 'Cliente Simples Híbrido',
        email: clientUserEmail.trim().toLowerCase(),
        password: clientUserPassword,
        role: 'cliente_simples_hibrido',
        companyName: company.name,
        cnpj: company.cnpj,
        status: 'ativo',
        createdAt: new Date().toISOString(),
        permissions: {
          canSimulateRegimes: true,
          canExportReports: true,
          canAccessAIAuditor: false,
          canEditCompanyData: isInteractive,
          canManageUsers: false,
          canViewFinancials: false,
          canAccessTaxReform: true,
          canAccessCFOP: false,
        },
      };

      const existingIndex = savedUsers.findIndex((u: any) => u.email === newUser.email);
      if (existingIndex >= 0) {
        savedUsers[existingIndex] = newUser;
      } else {
        savedUsers.push(newUser);
      }

      localStorage.setItem('sna_system_users_db', JSON.stringify(savedUsers));
      setUserCreatedSuccess(true);
      showToast(`Conta de acesso exclusivo criada para ${clientUserEmail}!`, 'success');
    } catch (err) {
      console.error('Error creating client user', err);
      showToast('Erro ao salvar credenciais do cliente.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#0F172A] border border-indigo-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0B0F19]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-600/30">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Liberar Acesso Exclusivo para o Cliente</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono border border-indigo-400/30">
                  Simples Híbrido (EC 132/23)
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Gere links diretos, envie por WhatsApp/E-mail ou crie credenciais restritas somente para este módulo.
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Company Summary Banner */}
        <div className="px-6 py-2.5 bg-indigo-950/40 border-b border-indigo-900/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-200">
            <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="font-bold text-white">{company.name}</span>
            <span className="text-slate-400 font-mono">({company.cnpj || 'CNPJ não informado'})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Recomendação Pericial:</span>
            <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
              result.cenarioA_Financeiro.cheaperRegime === 'tradicional'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
            }`}>
              {cheaperRegimeLabel}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-800/80 bg-[#0B0F19]/50 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('link')}
            className={`px-3.5 py-2 rounded-t-lg text-xs font-bold transition flex items-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === 'link'
                ? 'border-indigo-500 text-indigo-300 bg-indigo-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Link Direto (1-Clique)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('whatsapp')}
            className={`px-3.5 py-2 rounded-t-lg text-xs font-bold transition flex items-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === 'whatsapp'
                ? 'border-emerald-500 text-emerald-300 bg-emerald-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>WhatsApp Formatado</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('email')}
            className={`px-3.5 py-2 rounded-t-lg text-xs font-bold transition flex items-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === 'email'
                ? 'border-blue-500 text-blue-300 bg-blue-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-blue-400" />
            <span>E-mail Executivo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('qrcode')}
            className={`px-3.5 py-2 rounded-t-lg text-xs font-bold transition flex items-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === 'qrcode'
                ? 'border-amber-500 text-amber-300 bg-amber-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-amber-400" />
            <span>QR Code & iFrame</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('user')}
            className={`px-3.5 py-2 rounded-t-lg text-xs font-bold transition flex items-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === 'user'
                ? 'border-purple-500 text-purple-300 bg-purple-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>Criar Usuário de Acesso</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          
          {/* TAB 1: LINK DIRETO */}
          {activeTab === 'link' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-[#0B0F19] border border-indigo-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      URL de Acesso Direto do Cliente (Exclusivo Simples Híbrido)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                    Sem Menus Administrativos
                  </span>
                </div>

                <p className="text-xs text-slate-300">
                  Ao abrir este link, o cliente acessa instantaneamente o módulo do Simples Híbrido com a empresa <strong className="text-white">{company.name}</strong> pré-carregada, sem visualizar outros módulos, balancetes internos, contratos ou configurações contábeis.
                </p>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={clientShareUrl}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-indigo-300 outline-none select-all"
                  />
                  <button
                    onClick={() => copyToClipboard(clientShareUrl, 'Link Direto')}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shrink-0 shadow-sm"
                  >
                    {copiedKey === 'Link Direto' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Controles de Configuração da Liberação */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3.5">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  <span>Personalizar Regras de Acesso do Cliente</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Interatividade */}
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-start justify-between gap-3">
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        {isInteractive ? <Sliders className="w-3.5 h-3.5 text-emerald-400" /> : <Eye className="w-3.5 h-3.5 text-amber-400" />}
                        <span>Modo de Interação</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {isInteractive
                          ? 'Cliente pode simular faixas de receita, % compras e % B2B.'
                          : 'Modo Leitura: Parâmetros fixados pelo escritório.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsInteractive(!isInteractive)}
                      className={`px-3 py-1 rounded text-[11px] font-bold cursor-pointer transition ${
                        isInteractive
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {isInteractive ? 'Interativo' : 'Somente Leitura'}
                    </button>
                  </div>

                  {/* Proteção com PIN */}
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Código PIN / Senha</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={usePinCode}
                        onChange={(e) => setUsePinCode(e.target.checked)}
                        className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </div>
                    {usePinCode && (
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[10px] text-slate-400">PIN de 4 dígitos:</span>
                        <input
                          type="text"
                          maxLength={6}
                          value={pinCode}
                          onChange={(e) => setPinCode(e.target.value)}
                          className="w-24 bg-slate-900 border border-indigo-500/50 rounded px-2 py-1 text-xs text-center font-mono text-white font-bold"
                          placeholder="2026"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Botões de Ação Rápida */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Ambiente criptografado com isolamento de dados periciais.</span>
                </div>
                <div className="flex items-center gap-2.5">
                  {onOpenClientMode && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenClientMode();
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Testar Modo Cliente Agora</span>
                    </button>
                  )}
                  <a
                    href={clientShareUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Abrir em Nova Aba</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WHATSAPP */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#0B0F19] border border-emerald-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Mensagem Pronta para WhatsApp (Executiva & Pericial)
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">Formatada para Celular</span>
                </div>

                <div className="relative">
                  <textarea
                    readOnly
                    rows={8}
                    value={whatsappMessage}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-slate-200 outline-none resize-none leading-relaxed select-all"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    onClick={() => copyToClipboard(whatsappMessage, 'Texto do WhatsApp')}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedKey === 'Texto do WhatsApp' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Texto Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Texto</span>
                      </>
                    )}
                  </button>

                  <a
                    href={whatsappShareLink}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-md shadow-emerald-950/40 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar Diretamente no WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: E-MAIL */}
          {activeTab === 'email' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#0B0F19] border border-blue-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Modelo Formal de E-mail para Envio ao Cliente
                    </span>
                  </div>
                  <span className="text-[10px] text-blue-400 font-mono">Assunto & Corpo Prontos</span>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400">Assunto:</label>
                  <input
                    type="text"
                    readOnly
                    value={emailSubject}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-blue-300 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400">Corpo do E-mail:</label>
                  <textarea
                    readOnly
                    rows={8}
                    value={emailBody}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-slate-200 outline-none resize-none leading-relaxed select-all"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    onClick={() => copyToClipboard(emailBody, 'Corpo do E-mail')}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedKey === 'Corpo do E-mail' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>E-mail Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar E-mail</span>
                      </>
                    )}
                  </button>

                  <a
                    href={mailtoLink}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-md shadow-blue-950/40 cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Abrir no Aplicativo de E-mail</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: QR CODE & IFRAME */}
          {activeTab === 'qrcode' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* QR Code */}
              <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-3 text-center flex flex-col items-center justify-center">
                <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-amber-400" />
                  <span>Acesso por QR Code (Reuniões)</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Apresente este QR Code em reuniões presenciais ou online para o cliente abrir o simulador no celular:
                </p>
                
                {/* Visual QR Code Generator */}
                <div className="p-3 bg-white rounded-xl shadow-lg inline-block my-2">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(clientShareUrl)}`}
                    alt="QR Code de Acesso do Cliente"
                    className="w-40 h-40"
                    loading="lazy"
                  />
                </div>

                <span className="text-[10px] text-slate-500 font-mono break-all px-4">
                  {company.name}
                </span>
              </div>

              {/* iFrame Embed */}
              <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Incorporar no Portal do Escritório (iFrame)</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Código HTML para embutir este simulador no portal exclusivo do seu escritório contábil:
                </p>

                <textarea
                  readOnly
                  rows={4}
                  value={`<iframe src="${clientShareUrl}" width="100%" height="800px" frameborder="0" style="border-radius:16px; border:1px solid #312e81;"></iframe>`}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-[10px] font-mono text-slate-300 outline-none resize-none"
                />

                <button
                  onClick={() => copyToClipboard(`<iframe src="${clientShareUrl}" width="100%" height="800px" frameborder="0" style="border-radius:16px; border:1px solid #312e81;"></iframe>`, 'Código iFrame')}
                  className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Código HTML iFrame</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: CRIAR USUÁRIO DO CLIENTE */}
          {activeTab === 'user' && (
            <div className="space-y-4">
              <form onSubmit={handleCreateClientAccount} className="p-4 rounded-xl bg-[#0B0F19] border border-purple-900/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Cadastrar Login Exclusivo para o Cliente
                    </span>
                  </div>
                  <span className="text-[10px] text-purple-400 font-mono">Acesso com E-mail e Senha</span>
                </div>

                <p className="text-xs text-slate-300">
                  Crie uma credencial de acesso individual. Ao fazer login, o cliente entrará diretamente no módulo do Simples Híbrido com a empresa <strong className="text-white">{company.name}</strong> vinculada.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Nome do Contato / Decisor:</label>
                    <input
                      type="text"
                      required
                      value={clientUserName}
                      onChange={(e) => setClientUserName(e.target.value)}
                      placeholder="Ex: Carlos Vieira (Diretor)"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">E-mail de Acesso:</label>
                    <input
                      type="email"
                      required
                      value={clientUserEmail}
                      onChange={(e) => setClientUserEmail(e.target.value)}
                      placeholder="cliente@empresa.com.br"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Senha Inicial:</label>
                    <input
                      type="text"
                      required
                      value={clientUserPassword}
                      onChange={(e) => setClientUserPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Empresa Vinculada:</label>
                    <input
                      type="text"
                      readOnly
                      value={`${company.name} (${company.cnpj || 'Sem CNPJ'})`}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-400 outline-none"
                    />
                  </div>
                </div>

                {userCreatedSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2 animate-fade-in">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Usuário cadastrado com sucesso! As credenciais de acesso já estão ativas para login.</span>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md shadow-purple-950/40"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Salvar e Ativar Acesso do Cliente</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#0B0F19] border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">VÉRTICE AUDITOR FISCAL • Módulo Simples Híbrido EC 132/23</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition cursor-pointer shadow-xs"
          >
            Concluir
          </button>
        </div>

      </div>
    </div>
  );
};
