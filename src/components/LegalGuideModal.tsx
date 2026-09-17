import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  X, 
  Search, 
  Scale, 
  Copy, 
  Check, 
  Sparkles, 
  ShieldCheck,
  Calculator,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  AlertCircle
} from 'lucide-react';
import { TAX_KNOWLEDGE_BASE, TAX_KNOWLEDGE_CATEGORIES } from '../data/taxKnowledgeBase';

interface LegalGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAskAI?: (topic: string) => void;
}

export const LegalGuideModal: React.FC<LegalGuideModalProps> = ({
  isOpen,
  onClose,
  onAskAI,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedArticleId, setSelectedArticleId] = useState<string>(TAX_KNOWLEDGE_BASE[0].id);
  const [copied, setCopied] = useState(false);
  const [savedArticles, setSavedArticles] = useState<string[]>([]);

  const filteredArticles = useMemo(() => {
    return TAX_KNOWLEDGE_BASE.filter((article) => {
      const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCategory;

      const matchesSearch = 
        article.title.toLowerCase().includes(query) ||
        article.summary.toLowerCase().includes(query) ||
        article.lawReference.toLowerCase().includes(query) ||
        article.tags.some(t => t.toLowerCase().includes(query)) ||
        article.content.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const activeArticle = useMemo(() => {
    return TAX_KNOWLEDGE_BASE.find(a => a.id === selectedArticleId) || filteredArticles[0] || TAX_KNOWLEDGE_BASE[0];
  }, [selectedArticleId, filteredArticles]);

  if (!isOpen) return null;

  const handleCopyArticle = () => {
    if (!activeArticle) return;
    const textToCopy = `=== ${activeArticle.title} ===\nBase Legal: ${activeArticle.lawReference}\n\n${activeArticle.summary}\n\n${activeArticle.content}\n\nPrecedente RFB: ${activeArticle.rfbPrecedent || 'N/A'}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSaveArticle = (id: string) => {
    setSavedArticles(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl max-w-6xl w-full h-[92vh] flex flex-col shadow-2xl overflow-hidden relative text-slate-100">
        
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-[#0B0F19] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-950/60 rounded-xl border border-amber-800/60 text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60">
                  ENCICLOPÉDIA TRIBUTÁRIA • DOUTRINA FISCAL VÉRTICE
                </span>
                <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
                  Vigência 2025-2027 (LC 123 + LC 116 + EC 132)
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
                Base de Conhecimento & Doutrina Tributária Aplicada
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-2 rounded-xl hover:bg-slate-800 transition-colors"
            title="Fechar Enciclopédia"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-4 border-b border-slate-800 bg-[#0F172A] space-y-3">
          {/* Live Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquise por tema, artigo da lei, CFOP, Fator R, NCM, ICMS-ST, LC 116, Sublimite, Reforma..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0B0F19] border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Horizontal Category Chips with clean flex-wrap */}
          <div className="flex flex-wrap items-center gap-1.5 pb-1 text-xs">
            {TAX_KNOWLEDGE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg transition  text-xs font-semibold ${
                  selectedCategory === cat.id
                    ? 'bg-amber-600 text-white font-bold shadow-xs'
                    : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Split View Content: Left List & Right Detail */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden bg-[#0B0F19]">
          
          {/* Article List Column */}
          <div className="md:col-span-5 lg:col-span-4 border-r border-slate-800 overflow-y-auto p-3 space-y-2 max-h-[calc(92vh-180px)]">
            <div className="text-[11px] font-bold text-slate-400 px-2 py-1 flex justify-between items-center uppercase tracking-wider">
              <span>Artigos Localizados ({filteredArticles.length})</span>
              {savedArticles.length > 0 && (
                <span className="text-amber-400 text-[10px]">★ {savedArticles.length} salvos</span>
              )}
            </div>

            {filteredArticles.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
                <p>Nenhum artigo encontrado para os critérios pesquisados.</p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                  className="text-amber-400 hover:underline text-[11px] font-semibold"
                >
                  Redefinir filtros
                </button>
              </div>
            ) : (
              filteredArticles.map((art) => {
                const isSelected = art.id === activeArticle?.id;
                const isSaved = savedArticles.includes(art.id);
                return (
                  <div
                    key={art.id}
                    onClick={() => setSelectedArticleId(art.id)}
                    className={`p-3 rounded-xl cursor-pointer transition-all border text-left ${
                      isSelected
                        ? 'bg-slate-900 border-amber-500/80 shadow-xs ring-1 ring-amber-500/30'
                        : 'bg-[#0F172A] border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800/60">
                        {art.categoryLabel}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaveArticle(art.id);
                        }}
                        className="text-slate-400 hover:text-amber-400 transition"
                      >
                        {isSaved ? (
                          <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <Bookmark className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <h4 className={`text-xs font-bold mt-1.5 line-clamp-2 ${isSelected ? 'text-amber-200' : 'text-slate-200'}`}>
                      {art.title}
                    </h4>

                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {art.summary}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-mono">
                      <span className="truncate max-w-[170px]">{art.lawReference.split(';')[0]}</span>
                      <ChevronRight className={`w-3 h-3 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Article Detail Reader Column */}
          <div className="md:col-span-7 lg:col-span-8 overflow-y-auto p-5 sm:p-7 space-y-6 max-h-[calc(92vh-180px)] bg-[#0F172A]">
            {activeArticle ? (
              <div className="space-y-6 animate-fadeIn">
                
                {/* Header Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60">
                      {activeArticle.categoryLabel}
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-100 tracking-tight">
                      {activeArticle.title}
                    </h2>
                    <div className="text-xs text-blue-400 font-mono flex items-center gap-1.5 pt-0.5">
                      <Scale className="w-3.5 h-3.5" />
                      <span>{activeArticle.lawReference}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleCopyArticle}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-800 transition flex items-center space-x-1.5"
                      title="Copiar texto para área de transferência"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>

                    {onAskAI && (
                      <button
                        onClick={() => {
                          onAskAI(activeArticle.title);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
                        title="Abrir consulta interativa no Auditor IA"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                        <span>Consultar Auditor IA</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Ementa / Resumo Técnico */}
                <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200/90 leading-relaxed border-l-4 border-l-amber-500">
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest block mb-1">
                    Ementa & Sumário Normativo:
                  </span>
                  {activeArticle.summary}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {activeArticle.tags.map((tag, idx) => (
                    <span 
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 text-[10px] font-mono border border-slate-800"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Full Article Content */}
                <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                  <div className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-2">
                    Doutrina Aplicada & Procedimentos Práticos
                  </div>
                  <div className="whitespace-pre-line space-y-3 font-sans text-slate-300 leading-relaxed">
                    {activeArticle.content}
                  </div>
                </div>

                {/* Practical Example Box if exists */}
                {activeArticle.practicalExample && (
                  <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/60 space-y-2 text-xs">
                    <div className="flex items-center space-x-2 text-blue-300 font-bold uppercase tracking-wider text-[10px]">
                      <Calculator className="w-4 h-4 text-blue-400" />
                      <span>Exemplo Prático de Aplicação & Cálculo Numérico</span>
                    </div>
                    <div className="text-slate-300 text-[11px] space-y-1.5">
                      <p><strong className="text-slate-100">Cenário:</strong> {activeArticle.practicalExample.scenario}</p>
                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[10px] text-emerald-400 whitespace-pre-line">
                        {activeArticle.practicalExample.calculation}
                      </div>
                      <p className="text-amber-300 font-semibold pt-1">
                        <strong>Resultado Fiscal:</strong> {activeArticle.practicalExample.result}
                      </p>
                    </div>
                  </div>
                )}

                {/* Precedent / COSIT Box if exists */}
                {activeArticle.rfbPrecedent && (
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1 text-slate-300">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Precedente Vinculante RFB / Jurisprudência:
                    </span>
                    <p className="text-[11px] font-mono text-blue-400">{activeArticle.rfbPrecedent}</p>
                  </div>
                )}

                {/* Key Takeaways */}
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 space-y-2">
                  <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Diretrizes de Segurança & Auditoria Fiscal:</span>
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {activeArticle.keyTakeaways.map((takeaway, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            ) : (
              <div className="p-8 text-center text-slate-500">
                Selecione um artigo na lista lateral para visualizar a íntegra.
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#0B0F19] flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 font-mono gap-2">
          <span>Vértice Auditor Fiscal • Enciclopédia de Inteligência Fiscal Atualizada 2025/2026</span>
          <div className="flex items-center space-x-3">
            <span className="text-slate-300">Total: {TAX_KNOWLEDGE_BASE.length} Doutrinas Completas</span>
            <span>•</span>
            <span className="text-amber-400 font-bold">100% Conforme Normas RFB</span>
          </div>
        </div>

      </div>
    </div>
  );
};
