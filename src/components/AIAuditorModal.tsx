import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Copy, 
  Check, 
  FileText, 
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  Scale,
  Building2,
  RefreshCw,
  Trash2,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Search,
  Briefcase,
  Zap,
  DollarSign,
  Tag
} from 'lucide-react';
import { CompanyData, CalculationResult } from '../types';
import { apiFetch } from '../utils/apiClient';

interface AIAuditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyData;
  calculation: CalculationResult;
  onOpenKnowledgeBase?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export const AIAuditorModal: React.FC<AIAuditorModalProps> = ({
  isOpen,
  onClose,
  company,
  calculation,
  onOpenKnowledgeBase,
}) => {
  const [activeTab, setActiveTab] = useState<'opinion' | 'chat'>('opinion');
  const [opinion, setOpinion] = useState<string | null>(null);
  const [isGeneratingOpinion, setIsGeneratingOpinion] = useState(false);
  const [copied, setCopied] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  useEffect(() => {
    if (isOpen && !opinion) {
      handleGenerateOpinion();
    }
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: `Olá! Sou o **Robô Auditor & Consultor Fiscal VÉRTICE IA**.\n\nAuditei os parâmetros fiscais de **${company.name}**:\n\n• **RBT12:** ${formatCurrency(company.rbt12)}\n• **RBA (Ano):** ${formatCurrency(company.rba || company.rbt12)}\n• **Enquadramento Atual:** Simples Nacional (Anexo ${company.anexo})\n• **Fator R:** ${calculation.fatorR.toFixed(2)}% (${calculation.fatorR >= 28 ? '✅ Apto ao Anexo III (6%)' : '⚠️ Enquadrado no Anexo V (15.5%)'})\n• **Sublimite Estadual (R$ 3,6M):** ${calculation.exceedsSublimit ? '🚨 Ultrapassado (ICMS/ISS no regime normal)' : '✅ Regular (dentro do DAS)'}\n• **Quadro Societário (Art. 3º § 4º):** ${calculation.hasPartnerIrregularity ? '⚠️ Risco de soma com coligadas detectado' : '✅ Conforme'}\n\nVocê pode me fazer qualquer pergunta sobre NCMs, CFOPs, Serviços da LC 116, Fator R, DRE Fiscal, Reforma Tributária (IBS/CBS) ou selecionar uma consulta rápida abaixo:`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [isOpen, company.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleGenerateOpinion = async (forceRefresh = false) => {
    const cacheKey = `sna_ai_opinion_cache_${company.id || 'comp'}_${Math.round(company.rbt12)}`;
    if (!forceRefresh) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setOpinion(cached);
        return;
      }
    }

    setIsGeneratingOpinion(true);
    try {
      const res = await apiFetch('/api/tax-audit/opinion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, calculation }),
      });
      const data = await res.json();
      if (data.opinion) {
        setOpinion(data.opinion);
        localStorage.setItem(cacheKey, data.opinion);
      }
    } catch (err) {
      console.error('Falha ao gerar parecer:', err);
    } finally {
      setIsGeneratingOpinion(false);
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputValue.trim();
    if (!textToSend || isSendingMessage) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInputValue('');
    setIsSendingMessage(true);

    try {
      const res = await apiFetch('/api/tax-audit/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          context: { company, calculation },
        }),
      });
      const data = await res.json();
      const aiReply: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || 'Desculpe, ocorreu uma instabilidade na resposta.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, aiReply]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: 'Não consegui processar sua consulta no momento. Por favor, tente novamente.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleCopyOpinion = () => {
    if (opinion) {
      navigator.clipboard.writeText(opinion);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const quickQuestions = [
    { label: '🛡️ Blindar Art. 3º § 4º (Sócios)', q: 'Como evitar autuação pelo Art. 3º § 4º da LC 123/06 para esta empresa?' },
    { label: '⚡ Otimização do Fator R (Pró-Labore)', q: 'Qual o valor exato de pró-labore mensal para atingir 28% no Fator R?' },
    { label: '⚖️ Redirecionamento da Execução (Tema 962 STJ)', q: 'Como aplicar o Tema 962 do STJ e Súmula 430 para proteger o patrimônio pessoal dos sócios?' },
    { label: '🏢 Desconsideração da PJ (Art. 50 CC)', q: 'Quais os requisitos do Art. 50 do Código Civil (Lei 13.874/19) para impedir confusão patrimonial?' },
    { label: '📚 Normas CFC e Fechamento Contábil', q: 'Quais as diretrizes da NBC TG 1000 do CFC para balanço patrimonial e distribuição de lucros?' },
    { label: '🏷️ Segregação ICMS-ST e CFOP 5.405', q: 'Como segregar CFOP 5.405 e ICMS-ST no PGDAS-D para não pagar imposto em dobro?' },
    { label: '💊 PIS/COFINS Monofásicos & PER/DCOMP', q: 'Como funciona a restituição em 60 dias de PIS e COFINS monofásicos via PER/DCOMP?' },
    { label: '🏛️ Retenções na NFS-e (IRRF/CSRF/INSS)', q: 'Quando reter IRRF 1.5%, CSRF 4.65% e INSS 11% em notas de serviços da LC 116?' },
    { label: '🏛️ Reforma Tributária B2B & Simples Híbrido', q: 'Qual o impacto da Reforma Tributária (IBS/CBS) nas vendas B2B e o que é Simples Híbrido?' },
    { label: '📊 Simples vs Presumido vs Real', q: 'Vale a pena para esta empresa migrar para Lucro Presumido ou Lucro Real?' },
    { label: '🚨 Sublimite Estadual R$ 3,6M', q: 'Quais as obrigações acessórias de SPED Fiscal ao ultrapassar o sublimite estadual de R$ 3,6M?' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-fadeIn font-sans">
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl max-w-5xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden relative text-slate-100">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-[#0B0F19]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                  MOTOR FISCAL ATUALIZADO • PADRÃO PERICIAL RFB
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/60 uppercase tracking-wider font-bold hidden sm:inline">
                  IA Tributária & Doutrina
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
                Auditor Tributário IA & Consultor Fiscal Pericial
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {onOpenKnowledgeBase && (
              <button
                onClick={onOpenKnowledgeBase}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-slate-700 transition cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Base Legal</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-2 rounded-xl hover:bg-slate-800 transition cursor-pointer"
              title="Fechar Auditor IA"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Company Active Snapshot Strip */}
        <div className="px-5 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between  text-xs font-mono gap-4 scrollbar-none">
          <div className="flex items-center space-x-2 shrink-0">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-bold text-slate-200 truncate max-w-[200px]">{company.name}</span>
            <span className="text-[10px] text-slate-400">({company.uf || 'SP'})</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px] shrink-0">
            <div>
              <span className="text-slate-400">RBT12: </span>
              <span className="font-bold text-slate-200">{formatCurrency(company.rbt12)}</span>
            </div>
            <div>
              <span className="text-slate-400">Anexo: </span>
              <span className="font-bold text-blue-400">{company.anexo}</span>
            </div>
            <div>
              <span className="text-slate-400">Fator R: </span>
              <span className={`font-bold ${calculation.fatorR >= 28 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {calculation.fatorR.toFixed(1)}%
              </span>
            </div>
            <div>
              <span className="text-slate-400">Sublimite R$ 3,6M: </span>
              <span className={`font-bold ${calculation.exceedsSublimit ? 'text-rose-400' : 'text-emerald-400'}`}>
                {calculation.exceedsSublimit ? 'Ultrapassado' : 'OK'}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap border-b border-slate-800 bg-[#0B0F19] px-5 py-2 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('opinion')}
            className={`px-3.5 py-1.5 rounded-xl transition flex items-center space-x-2 text-xs font-bold uppercase tracking-wider cursor-pointer ${
              activeTab === 'opinion'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Parecer Completo de Auditoria</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3.5 py-1.5 rounded-xl transition flex items-center space-x-2 text-xs font-bold uppercase tracking-wider cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Consultor Interativo (Tire Dúvidas)</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0B0F19]">
          
          {activeTab === 'opinion' ? (
            <div className="space-y-4">
              {isGeneratingOpinion ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-3">
                  <Loader2 className="w-9 h-9 text-blue-400 animate-spin" />
                  <p className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                    Processando auditoria fiscal com o motor tributário 100% atualizado...
                  </p>
                  <p className="text-[11px] text-slate-400 text-center max-w-md">
                    Avaliando cruzamento de receitas (RBT12 e RBA), riscos societários do Art. 3º § 4º, Fator R e transição da Reforma Tributária (EC 132/23).
                  </p>
                </div>
              ) : opinion ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      Laudo Pericial Emitido para: <span className="text-slate-200 font-bold">{company.name}</span>
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleCopyOpinion}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer shadow-xs"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copiado!' : 'Copiar Laudo'}</span>
                      </button>
                      <button
                        onClick={() => handleGenerateOpinion()}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Recalcular Parecer</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-900/90 p-5 sm:p-7 rounded-2xl border border-slate-800 text-slate-200 text-xs leading-relaxed whitespace-pre-wrap font-sans shadow-xs">
                    {opinion}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="h-full flex flex-col space-y-3">
              
              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[calc(90vh-320px)] custom-scrollbar">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start space-x-2.5 ${
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.sender === 'ai' && (
                      <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-1">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed whitespace-pre-wrap ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-tr-none shadow-xs'
                          : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none shadow-xs'
                      }`}
                    >
                      {msg.text}
                      <span className={`block text-[9px] mt-1.5 font-mono ${msg.sender === 'user' ? 'text-blue-200' : 'text-slate-500'}`}>
                        {msg.timestamp}
                      </span>
                    </div>
                    {msg.sender === 'user' && (
                      <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-1">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}
                {isSendingMessage && (
                  <div className="flex items-center space-x-2 text-xs text-slate-400 pl-9 py-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span className="text-[11px]">Consultando motor fiscal e doutrina tributária...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Questions Chips */}
              <div className="pt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Consultas Rápidas Especializadas (Clique para Perguntar):
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scrollbar">
                  {quickQuestions.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(item.q)}
                      className="text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-slate-100 px-2.5 py-1 rounded-lg border border-slate-800 hover:border-slate-700 transition text-left cursor-pointer shadow-xs"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Input Box */}
              <div className="flex items-center space-x-2 pt-2 border-t border-slate-800">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Pergunte qualquer dúvida sobre Simples, NCM, CFOP, Serviços LC 116, Fator R, DRE ou Reforma..."
                  className="flex-1 bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none placeholder-slate-500 transition"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isSendingMessage}
                  className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl transition shadow-xs cursor-pointer"
                  title="Enviar pergunta ao Auditor IA"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
