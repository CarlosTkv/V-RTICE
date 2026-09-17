import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  FileText, 
  Building, 
  Users, 
  Globe, 
  Calculator, 
  Scale, 
  CheckCircle2, 
  ArrowRight, 
  Bookmark, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Award,
  BookMarked,
  Copy,
  Check,
  Sparkles
} from 'lucide-react';
import { 
  CONHECIMENTOS_BASE, 
  CONHECIMENTO_ASSUNTOS, 
  CONHECIMENTO_SUBDIVISOES, 
  ConhecimentoAssunto, 
  ConhecimentoSubdivisao, 
  ConhecimentoItem 
} from '../data/conhecimentosData';
import { AppActiveTab, CompanyData } from '../types';

interface ConhecimentosViewProps {
  currentCompany?: CompanyData;
  onNavigateToTab?: (tab: AppActiveTab) => void;
  onNavigateToDireito?: (direitoId?: string) => void;
}

export const ConhecimentosView: React.FC<ConhecimentosViewProps> = ({
  currentCompany,
  onNavigateToTab,
  onNavigateToDireito
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssunto, setSelectedAssunto] = useState<ConhecimentoAssunto | 'all'>('all');
  const [selectedSubdivisao, setSelectedSubdivisao] = useState<ConhecimentoSubdivisao | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>('con-trib-fed-01');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    return CONHECIMENTOS_BASE.filter(item => {
      const matchAssunto = selectedAssunto === 'all' || item.assunto === selectedAssunto;
      const matchSubdivisao = selectedSubdivisao === 'all' || item.subdivisao === selectedSubdivisao;
      
      const term = searchTerm.toLowerCase().trim();
      const matchSearch = !term || 
        item.title.toLowerCase().includes(term) ||
        item.normaOficial.toLowerCase().includes(term) ||
        item.resumoTecnico.toLowerCase().includes(term) ||
        item.conteudoDetalhador.toLowerCase().includes(term) ||
        item.tags.some(t => t.toLowerCase().includes(term));

      return matchAssunto && matchSubdivisao && matchSearch;
    });
  }, [selectedAssunto, selectedSubdivisao, searchTerm]);

  const handleCopyLegalBase = (item: ConhecimentoItem) => {
    const text = `DOCUMENTO OFICIAL: ${item.title}\nNORMA: ${item.normaOficial} (${item.orgaoEmissor})\nFUNDAMENTAÇÃO:\n${item.fundamentacaoLegal.map(f => `- ${f}`).join('\n')}\n\nRESUMO TÉCNICO:\n${item.resumoTecnico}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const renderIcon = (assunto: ConhecimentoAssunto) => {
    switch (assunto) {
      case 'tributario': return <Calculator className="w-4 h-4 text-emerald-400" />;
      case 'contabil': return <BookOpen className="w-4 h-4 text-blue-400" />;
      case 'fiscal': return <FileText className="w-4 h-4 text-purple-400" />;
      case 'societario': return <Building className="w-4 h-4 text-amber-400" />;
      case 'trabalhista': return <Users className="w-4 h-4 text-rose-400" />;
      case 'comex': return <Globe className="w-4 h-4 text-cyan-400" />;
      case 'reforma_tributaria': return <Sparkles className="w-4 h-4 text-amber-400" />;
      default: return <BookMarked className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/50 p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold tracking-wide uppercase">
              <Award className="w-3.5 h-3.5" />
              <span>Conhecimentos Técnicos & Práticos Oficiais</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Módulo de Conhecimentos por Assunto e Esfera Legislativa
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Base de conhecimento prático-normativa fundamentada estritamente em leis complementares, instruções normativas da RFB, decretos, regulamentos do ICMS/ISSQN, eSocial, IRPF e Siscomex.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              onClick={() => onNavigateToTab && onNavigateToTab('direito')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs transition flex items-center space-x-2 shadow-lg cursor-pointer"
            >
              <Scale className="w-4 h-4" />
              <span>Ver Módulo de Direito Jurídico</span>
            </button>
          </div>
        </div>
      </div>

      {/* Control Panel: Search & Filters */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar por assunto, norma (ex: LC 123, IN 2110), palavras-chave..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Subdivisao Filter */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
            <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="text-xs text-slate-400 font-semibold flex-shrink-0">Esfera:</span>
            <button
              onClick={() => setSelectedSubdivisao('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex-shrink-0 cursor-pointer ${
                selectedSubdivisao === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Todas
            </button>
            {CONHECIMENTO_SUBDIVISOES.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubdivisao(sub.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex-shrink-0 border cursor-pointer ${
                  selectedSubdivisao === sub.id
                    ? 'bg-indigo-600 text-white border-indigo-400'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {sub.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Assunto Category Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pt-2 border-t border-slate-800">
          <button
            onClick={() => setSelectedAssunto('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 flex-shrink-0 cursor-pointer ${
              selectedAssunto === 'all'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Todos os Assuntos ({CONHECIMENTOS_BASE.length})</span>
          </button>

          {CONHECIMENTO_ASSUNTOS.map((ass) => {
            const count = CONHECIMENTOS_BASE.filter(i => i.assunto === ass.id).length;
            const isSelected = selectedAssunto === ass.id;
            return (
              <button
                key={ass.id}
                onClick={() => setSelectedAssunto(ass.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 flex-shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800'
                }`}
              >
                {renderIcon(ass.id)}
                <span>{ass.label}</span>
                <span className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-indigo-950 text-indigo-200' : 'bg-slate-900 text-slate-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Item List */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-slate-300 font-bold text-sm">Nenhum tópico encontrado</h3>
            <p className="text-slate-500 text-xs">Tente alterar o termo de busca ou os filtros de assunto e esfera.</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isExpanded = expandedId === item.id;
            const subdivInfo = CONHECIMENTO_SUBDIVISOES.find(s => s.id === item.subdivisao);

            return (
              <div
                key={item.id}
                className={`bg-slate-900/90 border rounded-2xl transition duration-200 overflow-hidden shadow-lg ${
                  isExpanded ? 'border-indigo-500/70 ring-1 ring-indigo-500/40' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Card Header Summary */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="p-5 sm:p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 select-none"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800 flex items-center space-x-1">
                        {renderIcon(item.assunto)}
                        <span>{item.assuntoLabel}</span>
                      </span>

                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${subdivInfo?.badgeColor}`}>
                        {subdivInfo?.label}
                      </span>

                      <span className="text-[11px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {item.orgaoEmissor}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-slate-100 group-hover:text-indigo-300 transition flex items-center space-x-2">
                      <span>{item.title}</span>
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {item.resumoTecnico}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 self-end md:self-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyLegalBase(item);
                      }}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs flex items-center space-x-1 border border-slate-700"
                      title="Copiar Fundamentação Legal"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-[11px] text-emerald-400 font-bold">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-[11px] hidden sm:inline">Copiar</span>
                        </>
                      )}
                    </button>

                    <div className="p-2 rounded-lg bg-slate-800/80 text-slate-300">
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-indigo-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Card Details */}
                {isExpanded && (
                  <div className="px-5 pb-6 sm:px-6 pt-2 border-t border-slate-800 space-y-6 bg-[#0B0F19]">
                    {/* Norma Oficial Header */}
                    <div className="p-3.5 bg-indigo-950/40 border border-indigo-800/60 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                        <span className="text-slate-200 font-bold">Norma Oficial Regulamentadora:</span>
                        <span className="text-indigo-300 font-mono">{item.normaOficial}</span>
                      </div>
                    </div>

                    {/* Detalhamento Técnico */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-400" />
                        <span>Detalhamento Técnico & Diretrizes Operacionais</span>
                      </h4>
                      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                        {item.conteudoDetalhador}
                      </div>
                    </div>

                    {/* Fundamentação Legal */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>Dispositivos Legais & Fundamentação</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {item.fundamentacaoLegal.map((fund, idx) => (
                          <div key={idx} className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 flex items-start space-x-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span>{fund}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Exemplo Prático de Aplicação */}
                    {item.exemploPratico && (
                      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                        <h4 className="text-amber-400 font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                          <span>Estudo de Caso Prático & Aplicação Monetária</span>
                        </h4>

                        <div className="space-y-2 text-xs">
                          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                            <strong className="text-slate-200 block mb-0.5">Cenário Concreto:</strong>
                            <span className="text-slate-400">{item.exemploPratico.cenario}</span>
                          </div>
                          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                            <strong className="text-slate-200 block mb-0.5">Aplicação Normativa & Cálculo:</strong>
                            <span className="text-slate-400">{item.exemploPratico.aplicacao}</span>
                          </div>
                          <div className="p-2.5 bg-amber-950/40 border border-amber-800/60 rounded-lg">
                            <strong className="text-amber-300 block mb-0.5">Resultado / Diagnóstico:</strong>
                            <span className="text-amber-200 font-medium">{item.exemploPratico.conclusao}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tags & Correlação de Direito */}
                    <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {item.tags.map((tag, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-[10px] font-mono">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {item.linkDireitoId && (
                        <button
                          onClick={() => {
                            if (onNavigateToDireito) {
                              onNavigateToDireito(item.linkDireitoId);
                            } else if (onNavigateToTab) {
                              onNavigateToTab('direito');
                            }
                          }}
                          className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs transition flex items-center space-x-2 cursor-pointer"
                        >
                          <Scale className="w-3.5 h-3.5 text-amber-400" />
                          <span>Ver Tese Jurídica no Módulo de Direito</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
