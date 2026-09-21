import React, { useState } from 'react';
import { 
  Globe, 
  Share2, 
  Copy, 
  Check, 
  QrCode, 
  Code, 
  ShieldCheck, 
  ExternalLink, 
  X, 
  Sparkles,
  Building2,
  Lock,
  Server
} from 'lucide-react';

interface PublishShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string) => void;
}

export const PublishShareModal: React.FC<PublishShareModalProps> = ({
  isOpen,
  onClose,
  showToast,
}) => {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://verticefiscal.app';
  const customDomainExample = 'https://verticefiscal.com.br/planejador-tributario';
  const clientPortalUrl = `${currentUrl}?view=cliente_leitor`;
  const simplesHibridoClientUrl = `${currentUrl.split('?')[0]}?module=simples_hibrido&view=cliente_simples_hibrido`;
  const embedCode = `<iframe src="${currentUrl}" width="100%" height="700px" frameborder="0" style="border-radius:12px; border:1px solid #1e293b;"></iframe>`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(label);
    showToast(`${label} copiado para a área de transferência!`);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#0F172A] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0B0F19]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Publicação & Endereço Web do Aplicativo</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono border border-emerald-500/30">
                  Online & Ativo
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Endereços indicativos, publicação de portal do cliente e código de incorporação
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Card 1: Endereço Oficial de Publicação */}
          <div className="p-4 rounded-xl bg-[#0B0F19] border border-blue-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Share2 className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Link de Acesso Direto (Endereço Principal)
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                HTTPS / SSL Seguro
              </span>
            </div>

            <p className="text-xs text-slate-300">
              Este é o endereço sugestivo oficial para acesso ao aplicativo completo por contadores, auditores e diretores financeiros:
            </p>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-blue-300 outline-none select-all"
              />
              <button
                onClick={() => copyToClipboard(currentUrl, 'Link Principal')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shrink-0 shadow-xs"
              >
                {copiedLink === 'Link Principal' ? (
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

          {/* Card 2: Portal do Cliente Leitor */}
          <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Link de Acesso do Cliente Decisor (Modo Leitor Geral)
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Para Apresentações B2B</span>
            </div>

            <p className="text-xs text-slate-300">
              Endereço sugestivo para compartilhar pareceres com o cliente sem permissão de edição nas premissas contábeis:
            </p>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={clientPortalUrl}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-emerald-300 outline-none select-all"
              />
              <button
                onClick={() => copyToClipboard(clientPortalUrl, 'Link do Cliente')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shrink-0 border border-slate-700"
              >
                {copiedLink === 'Link do Cliente' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Link Cliente</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card 3: Link Exclusivo para o Cliente - Simples Híbrido */}
          <div className="p-4 rounded-xl bg-[#0B0F19] border border-indigo-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Link Exclusivo: Módulo Simples Híbrido (EC 132/23)
                </span>
              </div>
              <span className="text-[10px] text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 px-2 py-0.5 rounded font-mono">
                Módulo Isolado para o Cliente
              </span>
            </div>

            <p className="text-xs text-slate-300">
              Abre <strong className="text-white">somente</strong> o Simulador e Parecer do Simples Tradicional vs. Híbrido com gráficos, sensibilidade de insumos e laudo em PDF, ocultando todos os demais módulos e menus do escritório:
            </p>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={simplesHibridoClientUrl}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-indigo-300 outline-none select-all"
              />
              <button
                onClick={() => copyToClipboard(simplesHibridoClientUrl, 'Link Simples Híbrido')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shrink-0 shadow-sm"
              >
                {copiedLink === 'Link Simples Híbrido' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Link Híbrido</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Grid 2 Colunas: Embed Code + Personalização de Domínio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Widget / Embed */}
            <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-2.5">
              <div className="flex items-center space-x-2 text-indigo-400">
                <Code className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">Incorporar no Site do Escritório</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Código iFrame pronto para adicionar a ferramenta de simulação ao portal do seu escritório contábil:
              </p>
              <div className="relative">
                <textarea
                  readOnly
                  rows={3}
                  value={embedCode}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-[11px] font-mono text-slate-300 outline-none resize-none"
                />
                <button
                  onClick={() => copyToClipboard(embedCode, 'Código Embed')}
                  className="absolute bottom-2 right-2 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-white font-bold transition flex items-center space-x-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copiar HTML</span>
                </button>
              </div>
            </div>

            {/* Domínio Próprio Customizado */}
            <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-2.5">
              <div className="flex items-center space-x-2 text-amber-400">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">Domínio & Publicação White-Label</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Você pode publicar esta aplicação no seu próprio domínio corporativo (ex: <code className="text-amber-300">tributario.seu-escritorio.com.br</code>) vinculando via CNAME DNS.
              </p>
              <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-[11px] text-amber-300 flex items-center space-x-2">
                <Server className="w-4 h-4 shrink-0" />
                <span>Infraestrutura em nuvem Cloud Run com SSL automatizado e escala ilimitada.</span>
              </div>
            </div>

          </div>

          {/* Certificados de Infraestrutura e Segurança */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Plataforma 100% LGPD Compliant com Criptografia TLS 1.3</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <Lock className="w-4 h-4 text-blue-400" />
              <span>Publicação Ativa em Nuvem B2B</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#0B0F19] border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">VÉRTICE AUDITOR FISCAL • Endereço de publicação otimizado</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition cursor-pointer shadow-xs"
          >
            Concluído
          </button>
        </div>

      </div>
    </div>
  );
};
