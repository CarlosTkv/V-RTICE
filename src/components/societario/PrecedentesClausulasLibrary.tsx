import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Check, 
  Copy, 
  PlusCircle, 
  ShieldCheck, 
  Scale, 
  Sparkles, 
  Award, 
  ChevronRight, 
  FileText, 
  Layers, 
  Briefcase, 
  ExternalLink,
  Info
} from 'lucide-react';
import { 
  SHIELDED_CLAUSES_CATALOG, 
  CONTRACT_PRECEDENTS_MODELS, 
  ShieldedClauseItem, 
  ContractPrecedentModel, 
  ComplexityLevel, 
  SpecialtySector 
} from '../../data/precedentesClausulasData';

interface PrecedentesClausulasLibraryProps {
  onInsertClause: (clause: ShieldedClauseItem) => void;
  onApplyModel: (model: ContractPrecedentModel) => void;
}

export const PrecedentesClausulasLibrary: React.FC<PrecedentesClausulasLibraryProps> = ({
  onInsertClause,
  onApplyModel
}) => {
  const [activeView, setActiveView] = useState<'clausulas' | 'modelos'>('clausulas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [complexityFilter, setComplexityFilter] = useState<string>('all');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');
  const [copiedClauseId, setCopiedClauseId] = useState<string | null>(null);
  const [expandedClauseId, setExpandedClauseId] = useState<string | null>(null);

  const handleCopyClause = (clause: ShieldedClauseItem) => {
    navigator.clipboard.writeText(clause.fullClauseText);
    setCopiedClauseId(clause.id);
    setTimeout(() => setCopiedClauseId(null), 2500);
  };

  // Filtragem de Cláusulas
  const filteredClauses = useMemo(() => {
    return SHIELDED_CLAUSES_CATALOG.filter(clause => {
      const matchComp = complexityFilter === 'all' || clause.complexity === complexityFilter;
      const matchSpec = specialtyFilter === 'all' || clause.specialty.includes(specialtyFilter as SpecialtySector);
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q ||
        clause.title.toLowerCase().includes(q) ||
        clause.legalBasis.toLowerCase().includes(q) ||
        clause.courtJurisprudence.toLowerCase().includes(q) ||
        clause.summary.toLowerCase().includes(q) ||
        clause.tags.some(t => t.toLowerCase().includes(q));
      return matchComp && matchSpec && matchSearch;
    });
  }, [complexityFilter, specialtyFilter, searchQuery]);

  // Filtragem de Modelos
  const filteredModels = useMemo(() => {
    return CONTRACT_PRECEDENTS_MODELS.filter(mod => {
      const matchComp = complexityFilter === 'all' || mod.complexity === complexityFilter;
      const matchSpec = specialtyFilter === 'all' || mod.specialty === specialtyFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q ||
        mod.title.toLowerCase().includes(q) ||
        mod.description.toLowerCase().includes(q) ||
        mod.legalFramework.toLowerCase().includes(q) ||
        mod.targetAudience.toLowerCase().includes(q) ||
        mod.keyProtections.some(p => p.toLowerCase().includes(q));
      return matchComp && matchSpec && matchSearch;
    });
  }, [complexityFilter, specialtyFilter, searchQuery]);

  const complexityOptions: { value: string; label: string; badgeColor: string }[] = [
    { value: 'all', label: 'Todas Complexidades', badgeColor: 'bg-slate-800 text-slate-300' },
    { value: 'basica', label: 'Básica / Simples', badgeColor: 'bg-emerald-950 text-emerald-400' },
    { value: 'intermediaria', label: 'Intermediária / Regulatória', badgeColor: 'bg-blue-950 text-blue-400' },
    { value: 'avancada', label: 'Avançada / Governança', badgeColor: 'bg-indigo-950 text-indigo-400' },
    { value: 'ultra_holding', label: 'Ultra-Blindada / Holding', badgeColor: 'bg-purple-950 text-purple-400' },
  ];

  const specialtyOptions: { value: string; label: string }[] = [
    { value: 'all', label: 'Todos os Setores' },
    { value: 'tecnologia_saas', label: 'Tecnologia & SaaS' },
    { value: 'holding_familiar', label: 'Holding Familiar & Sucessão' },
    { value: 'comercio_industria', label: 'Comércio & Indústria' },
    { value: 'servicos_medicos', label: 'Serviços Médicos & Saúde' },
    { value: 'ecommerce', label: 'E-commerce & Logística' },
    { value: 'reestruturacao_ma', label: 'Reestruturação & M&A' },
  ];

  return (
    <div className="space-y-5">
      {/* Header com Descrição e Alternância de Abas */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-100">
                Biblioteca Avançada de Precedentes & Cláusulas Blindadas
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Modelos estruturados e acervo de cláusulas validadas conforme jurisprudência vinculante do STF, STJ e Instruções Normativas DREI. Insira diretamente na minuta com 1 clique.
            </p>
          </div>

          <div className="flex p-1 bg-slate-950 border border-slate-800 rounded-xl">
            <button
              onClick={() => setActiveView('clausulas')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeView === 'clausulas'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Cláusulas Blindadas ({SHIELDED_CLAUSES_CATALOG.length})
            </button>
            <button
              onClick={() => setActiveView('modelos')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeView === 'modelos'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Modelos por Complexidade ({CONTRACT_PRECEDENTS_MODELS.length})
            </button>
          </div>
        </div>

        {/* Barra de Busca e Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mt-4 pt-4 border-t border-slate-800">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por termo, artigo de lei, precedente STJ/STF ou palavra-chave..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={complexityFilter}
              onChange={(e) => setComplexityFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              {complexityOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              {specialtyOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* ABA 1: ACERVO DE CLÁUSULAS BLINDADAS AUDITADAS */}
      {/* ------------------------------------------------------------- */}
      {activeView === 'clausulas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Exibindo {filteredClauses.length} cláusula(s) auditadas com selo forense</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <Award className="w-3.5 h-3.5" />
              100% Auditadas e Compatíveis com DREI
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredClauses.map((clause) => {
              const isExpanded = expandedClauseId === clause.id;
              const isCopied = copiedClauseId === clause.id;

              return (
                <div 
                  key={clause.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 transition rounded-2xl p-5 shadow-sm space-y-4"
                >
                  {/* Topo do Card */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-100">{clause.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 font-semibold">
                          Score {clause.auditScore}%
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                          {clause.complexity.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                        <span className="flex items-center gap-1 text-slate-300">
                          <Scale className="w-3.5 h-3.5 text-indigo-400" />
                          {clause.legalBasis}
                        </span>
                        <span className="flex items-center gap-1 text-amber-300 font-medium">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          {clause.courtJurisprudence}
                        </span>
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex items-center gap-2 self-start">
                      <button
                        onClick={() => handleCopyClause(clause)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                          isCopied 
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-700' 
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                        title="Copiar texto da cláusula para área de transferência"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? 'Copiada!' : 'Copiar'}</span>
                      </button>

                      <button
                        onClick={() => onInsertClause(clause)}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow flex items-center gap-1.5 transition"
                        title="Inserir esta cláusula diretamente no editor de contrato"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Inserir no Contrato</span>
                      </button>
                    </div>
                  </div>

                  {/* Resumo da Finalidade Prática */}
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                    <p>{clause.summary}</p>
                  </div>

                  {/* Botão de Expansão para Ver a Redação Completa */}
                  <div className="pt-1">
                    <button
                      onClick={() => setExpandedClauseId(isExpanded ? null : clause.id)}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
                    >
                      <span>{isExpanded ? 'Recolher Redação Contratual' : 'Ver Redação Forense Completa da Cláusula'}</span>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>

                    {isExpanded && (
                      <div className="mt-3 p-4 rounded-xl bg-slate-950 border border-indigo-900/40 text-xs text-slate-200 font-mono leading-relaxed whitespace-pre-wrap selection:bg-indigo-900">
                        {clause.fullClauseText}
                      </div>
                    )}
                  </div>

                  {/* Tags e Notas de Auditoria */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-[11px]">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {clause.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-slate-500 italic">
                      Nota de Auditoria: {clause.auditNotes}
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredClauses.length === 0 && (
              <div className="p-10 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
                Nenhuma cláusula encontrada para os filtros selecionados. Tente ajustar os termos de pesquisa.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* ABA 2: MODELOS DE CONTRATOS POR COMPLEXIDADE & ESPECIALIDADE */}
      {/* ------------------------------------------------------------- */}
      {activeView === 'modelos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Exibindo {filteredModels.length} modelo(s) estruturados por arquitetura</span>
            <span className="text-slate-400">Compatível com os fluxos REDESIM</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredModels.map((mod) => (
              <div 
                key={mod.id}
                className="bg-slate-900 border border-slate-800 hover:border-indigo-800/60 transition rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold">
                      {mod.complexityLabel}
                    </span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                      {mod.specialtyLabel}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-100 leading-snug">
                    {mod.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {mod.description}
                  </p>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-2">
                    <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                      <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Público-Alvo & Perfil:</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{mod.targetAudience}</p>

                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-[11px] font-semibold text-slate-300">Proteções Estruturais Inclusas:</span>
                      <ul className="mt-1 space-y-1">
                        {mod.keyProtections.map((prot, i) => (
                          <li key={i} className="text-[10px] text-slate-400 flex items-start gap-1.5">
                            <span className="text-emerald-400 font-bold">✓</span>
                            <span>{prot}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-400">Fundamentação:</span> {mod.legalFramework}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="text-[10px] text-slate-500">
                    {mod.recommendedClauses.length} Cláusulas Auditadas
                  </div>

                  <button
                    onClick={() => onApplyModel(mod)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow flex items-center gap-1.5 transition"
                  >
                    <span>Carregar no Gerador</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
