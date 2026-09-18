import React, { useState, useMemo } from 'react';
import { 
  Scale, 
  Search, 
  Copy, 
  Check, 
  BookMarked, 
  Sparkles, 
  FileText, 
  HelpCircle,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Gavel
} from 'lucide-react';
import { VADE_MECUM_DATABASE, VadeMecumArticle } from '../../data/precedentesClausulasData';

interface MiniVadeMecumContextualProps {
  currentContractText?: string;
  onInsertLegalCitation?: (citation: string) => void;
}

export const MiniVadeMecumContextual: React.FC<MiniVadeMecumContextualProps> = ({
  currentContractText = '',
  onInsertLegalCitation
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [codeFilter, setCodeFilter] = useState<string>('all');
  const [copiedArticleId, setCopiedArticleId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Análise em tempo real do contrato para destacar artigos correlatos
  const detectedContextArticles = useMemo(() => {
    if (!currentContractText || currentContractText.length < 50) {
      return [];
    }
    const lower = currentContractText.toLowerCase();
    return VADE_MECUM_DATABASE.filter(art => {
      return art.correlatedKeywords.some(keyword => lower.includes(keyword.toLowerCase()));
    });
  }, [currentContractText]);

  // Lista filtrada geral
  const filteredArticles = useMemo(() => {
    return VADE_MECUM_DATABASE.filter(art => {
      const matchCode = codeFilter === 'all' || art.lawCode === codeFilter;
      const q = searchTerm.toLowerCase().trim();
      const matchSearch = !q ||
        art.articleReference.toLowerCase().includes(q) ||
        art.topic.toLowerCase().includes(q) ||
        art.heading.toLowerCase().includes(q) ||
        art.legalText.toLowerCase().includes(q) ||
        art.practicalCommentary.toLowerCase().includes(q) ||
        art.jurisprudentialImpact.toLowerCase().includes(q) ||
        art.correlatedKeywords.some(k => k.toLowerCase().includes(q));
      return matchCode && matchSearch;
    });
  }, [codeFilter, searchTerm]);

  const handleCopyText = (art: VadeMecumArticle) => {
    const textToCopy = `[FUNDAMENTAÇÃO LEGAL: ${art.lawName} - ${art.articleReference}]\n"${art.legalText}"\n(Aplicação: ${art.practicalCommentary})`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedArticleId(art.id);
    setTimeout(() => setCopiedArticleId(null), 2500);
  };

  const lawBadges: { value: string; label: string }[] = [
    { value: 'all', label: 'Todos os Códigos' },
    { value: 'CC', label: 'Código Civil (CC)' },
    { value: 'CPC', label: 'Processo Civil (CPC)' },
    { value: 'LC123', label: 'LC 123/06 (Simples)' },
    { value: 'STF', label: 'STF / Repercussão Geral' },
    { value: 'STJ', label: 'STJ / Repetitivos' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Topo do Mini-Vade Mecum */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Gavel className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">
              Mini-Vade Mecum & Camada de Inteligência Jurídica
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Doutrina, artigos de lei e jurisprudência vinculante sugeridos em tempo real para o contrato em edição.
          </p>
        </div>

        {detectedContextArticles.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-800/80 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>{detectedContextArticles.length} Artigo(s) Detectados no Texto</span>
          </div>
        )}
      </div>

      {/* Sugestões Contextuais Detectadas */}
      {detectedContextArticles.length > 0 && (
        <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/50 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
            <BookMarked className="w-3.5 h-3.5" />
            <span>Artigos Correlatos Identificados na Redação Atual:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {detectedContextArticles.map(art => (
              <button
                key={`detected-${art.id}`}
                onClick={() => {
                  setSearchTerm(art.articleReference);
                  setExpandedId(art.id);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-indigo-700/60 hover:border-indigo-500 text-slate-200 text-xs flex items-center gap-1.5 transition"
              >
                <span className="font-bold text-indigo-400">{art.lawCode} {art.articleReference}:</span>
                <span className="truncate max-w-[200px] text-slate-300">{art.topic}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Barra de Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por artigo (ex: 1.028, 977, 50, 784), tema ou palavra..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={codeFilter}
            onChange={(e) => setCodeFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            {lawBadges.map(b => (
              <option key={b.value} value={b.value}>{b.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de Artigos */}
      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
        {filteredArticles.map((art) => {
          const isExpanded = expandedId === art.id;
          const isCopied = copiedArticleId === art.id;

          return (
            <div 
              key={art.id}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition space-y-2.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/80">
                      {art.lawCode} {art.articleReference}
                    </span>
                    <span className="text-xs font-bold text-slate-200">
                      {art.topic}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {art.heading}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 self-start">
                  <button
                    onClick={() => handleCopyText(art)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition ${
                      isCopied 
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' 
                        : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
                    }`}
                    title="Copiar fundamentação legal"
                  >
                    {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{isCopied ? 'Copiado' : 'Copiar'}</span>
                  </button>

                  {onInsertLegalCitation && (
                    <button
                      onClick={() => onInsertLegalCitation(`(Fundamento: ${art.lawName} - ${art.articleReference})`)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-[11px] font-semibold transition"
                      title="Inserir citação no contrato"
                    >
                      Inserir Citação
                    </button>
                  )}
                </div>
              </div>

              {/* Texto da Lei */}
              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-200 font-mono italic leading-relaxed">
                "{art.legalText}"
              </div>

              {/* Comentário Prático e Impacto Jurisprudencial */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] pt-1">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                  <span className="font-bold text-slate-300 block mb-0.5">🎯 Aplicação Prática:</span>
                  <p className="text-slate-400 leading-snug">{art.practicalCommentary}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                  <span className="font-bold text-amber-300 block mb-0.5">⚖️ Impacto Jurisprudencial (STJ/STF/DREI):</span>
                  <p className="text-slate-400 leading-snug">{art.jurisprudentialImpact}</p>
                </div>
              </div>
            </div>
          );
        })}

        {filteredArticles.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-950/60 rounded-xl border border-slate-800">
            Nenhum artigo encontrado no Vade Mecum para a busca informada.
          </div>
        )}
      </div>
    </div>
  );
};
