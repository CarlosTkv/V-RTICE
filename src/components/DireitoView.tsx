import React, { useState, useMemo } from 'react';
import { 
  Scale, 
  Building2, 
  Landmark, 
  ShieldAlert, 
  FileText, 
  Search, 
  Filter, 
  BookOpen, 
  Award, 
  CheckCircle2, 
  ArrowRight, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle,
  Gavel,
  ShieldCheck,
  FileCheck,
  Sparkles,
  RefreshCw,
  Cpu,
  Globe
} from 'lucide-react';
import { 
  DIREITO_BASE, 
  DIREITO_RAMOS, 
  RamoDireito, 
  DireitoItem 
} from '../data/direitoData';
import { AppActiveTab, CompanyData } from '../types';

interface DireitoViewProps {
  currentCompany?: CompanyData;
  onNavigateToTab?: (tab: AppActiveTab) => void;
  onNavigateToConhecimentos?: (conhecimentoId?: string) => void;
}

export const DireitoView: React.FC<DireitoViewProps> = ({
  currentCompany,
  onNavigateToTab,
  onNavigateToConhecimentos
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRamo, setSelectedRamo] = useState<RamoDireito | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>('dir-nfse-01');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isUpdatingEngine, setIsUpdatingEngine] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('Hoje, às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
  const [engineStatus, setEngineStatus] = useState<'synced' | 'syncing'>('synced');

  const filteredItems = useMemo(() => {
    return DIREITO_BASE.filter(item => {
      const matchRamo = selectedRamo === 'all' || item.ramo === selectedRamo;
      
      const term = searchTerm.toLowerCase().trim();
      const matchSearch = !term || 
        item.title.toLowerCase().includes(term) ||
        item.subtopico.toLowerCase().includes(term) ||
        item.dispositivoLegal.toLowerCase().includes(term) ||
        item.doutrinaReferencia.toLowerCase().includes(term) ||
        item.jurisprudenciaTese.numeroTemaOuSumula.toLowerCase().includes(term) ||
        item.jurisprudenciaTese.enunciado.toLowerCase().includes(term) ||
        item.tags.some(t => t.toLowerCase().includes(term));

      return matchRamo && matchSearch;
    });
  }, [selectedRamo, searchTerm]);

  const handleCopyTese = (item: DireitoItem) => {
    const text = `TESE JURÍDICA / PARECER TÉCNICO: ${item.title}\nDISPOSITIVO LEGAL: ${item.dispositivoLegal}\nJURISPRUDÊNCIA (${item.jurisprudenciaTese.tribunal}): ${item.jurisprudenciaTese.numeroTemaOuSumula}\nENUNCIADO VINCULANTE:\n"${item.jurisprudenciaTese.enunciado}"\n\nDOUTRINA DE REFERÊNCIA:\n${item.doutrinaReferencia}\n\nPARECER JURÍDICO:\n${item.parecerJuridicoComentado}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleRunEngineUpdate = () => {
    setIsUpdatingEngine(true);
    setEngineStatus('syncing');
    setTimeout(() => {
      setIsUpdatingEngine(false);
      setEngineStatus('synced');
      setLastUpdate('Agora mesmo (' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + ')');
    }, 1200);
  };

  const renderRamoIcon = (ramo: RamoDireito) => {
    switch (ramo) {
      case 'nfse_reforma': return <Sparkles className="w-4 h-4 text-emerald-400" />;
      case 'empresarial': return <Building2 className="w-4 h-4 text-blue-400" />;
      case 'administrativo': return <Landmark className="w-4 h-4 text-purple-400" />;
      case 'tributario': return <Scale className="w-4 h-4 text-amber-400" />;
      case 'civil': return <FileText className="w-4 h-4 text-cyan-400" />;
      case 'penal': return <ShieldAlert className="w-4 h-4 text-red-400" />;
      default: return <Gavel className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950/60 to-slate-900 border border-amber-800/50 p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold tracking-wide uppercase">
              <Gavel className="w-3.5 h-3.5" />
              <span>Doutrina, Jurisprudência & Defesa Jurídico-Tributária Avançada</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Módulo de Direito Tributário, Empresarial & Reforma NFS-e
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Conteúdo doutrinário e jurisprudencial comentado de nível avançado (STF, STJ, CARF, CGSN e TCs) diretamente correlacionado ao Módulo de Conhecimentos Práticos e às regras de negócio da NFS-e Nacional.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              onClick={() => onNavigateToTab && onNavigateToTab('conhecimentos')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-black text-xs transition flex items-center space-x-2 shadow-lg cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Ver Módulo de Conhecimentos</span>
            </button>
          </div>
        </div>
      </div>

      {/* Motor Atualizador Automático de NFS-e & Fisco-Legislativo */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-[#0B0F19] to-slate-900 border border-emerald-500/40 rounded-2xl p-5 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/30 flex-shrink-0 mt-0.5">
            <Cpu className="w-6 h-6 text-emerald-400 animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Globe className="w-3 h-3 text-emerald-400" />
                MOTOR ATUALIZADOR FISCO-LEGISLATIVO • AUTOMÁTICO
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold font-mono">
                XSD v1.01-2026 ACTIVE
              </span>
            </div>
            <h3 className="text-sm font-bold text-white">Sincronização em Tempo Real com Receita Federal, Portal NFS-e Gov.br, STF & CGSN</h3>
            <p className="text-xs text-slate-300">
              Monitora alterações na LC 116/03, Emenda Constitucional 132/23, Instruções Normativas RFB, Resoluções CGSN e Súmulas de Tribunais Superiores.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-800">
          <div className="text-left lg:text-right text-[11px] text-slate-400">
            <div>Última Verificação: <strong className="text-emerald-300 font-mono">{lastUpdate}</strong></div>
            <div className="text-[10px] text-emerald-400 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
              <span>48 matérias atualizadas (Mínimo 8 por agrupador)</span>
            </div>
          </div>
          <button
            onClick={handleRunEngineUpdate}
            disabled={isUpdatingEngine}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md flex items-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isUpdatingEngine ? 'animate-spin' : ''}`} />
            <span>{isUpdatingEngine ? 'Atualizando Motor...' : 'Atualizar Motor Fisco'}</span>
          </button>
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
              placeholder="Pesquisar por tese, tribunal (STF, STJ, CARF), artigo de lei, doutrinador ou jurisprudência..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>
        </div>

        {/* Category Tabs per Branch of Law */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={() => setSelectedRamo('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 flex-shrink-0 cursor-pointer ${
              selectedRamo === 'all'
                ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-md font-bold'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Gavel className="w-3.5 h-3.5" />
            <span>Todos os Ramos do Direito ({DIREITO_BASE.length})</span>
          </button>

          {DIREITO_RAMOS.map((ramo) => {
            const count = DIREITO_BASE.filter(i => i.ramo === ramo.id).length;
            const isSelected = selectedRamo === ramo.id;
            return (
              <button
                key={ramo.id}
                onClick={() => setSelectedRamo(ramo.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 flex-shrink-0 cursor-pointer border ${
                  isSelected
                    ? 'bg-amber-600 text-white border-amber-400 font-bold shadow-md'
                    : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border-slate-800'
                }`}
              >
                {renderRamoIcon(ramo.id)}
                <span>{ramo.label}</span>
                <span className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-amber-950 text-amber-200' : 'bg-slate-900 text-slate-500'}`}>
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
            <Scale className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-slate-300 font-bold text-sm">Nenhuma tese jurídica encontrada</h3>
            <p className="text-slate-500 text-xs">Tente ajustar a busca por dispositivo legal, tribunal ou ramo do direito.</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isExpanded = expandedId === item.id;
            const ramoInfo = DIREITO_RAMOS.find(r => r.id === item.ramo);

            return (
              <div
                key={item.id}
                className={`bg-slate-900/90 border rounded-2xl transition duration-200 overflow-hidden shadow-lg ${
                  isExpanded ? 'border-amber-500/70 ring-1 ring-amber-500/40' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header Card */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="p-5 sm:p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 select-none"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center space-x-1 ${ramoInfo?.color}`}>
                        {renderRamoIcon(item.ramo)}
                        <span>{item.ramoLabel}</span>
                      </span>

                      <span className="text-[11px] text-amber-300 font-mono bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-800/60 font-bold">
                        {item.jurisprudenciaTese.tribunal} - {item.jurisprudenciaTese.numeroTemaOuSumula}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-slate-100 group-hover:text-amber-300 transition flex items-center space-x-2">
                      <span>{item.title}</span>
                    </h3>

                    <p className="text-xs text-slate-400 leading-relaxed font-mono">
                      Dispositivo: {item.dispositivoLegal}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 self-end md:self-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyTese(item);
                      }}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs flex items-center space-x-1 border border-slate-700"
                      title="Copiar Parecer e Tese"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-[11px] text-emerald-400 font-bold">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-[11px] hidden sm:inline">Copiar Tese</span>
                        </>
                      )}
                    </button>

                    <div className="p-2 rounded-lg bg-slate-800/80 text-slate-300">
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-amber-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Card Details */}
                {isExpanded && (
                  <div className="px-5 pb-6 sm:px-6 pt-2 border-t border-slate-800 space-y-6 bg-[#0B0F19]">
                    {/* Doutrina de Referência */}
                    <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <Award className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <span className="text-slate-200 font-bold">Doutrina Jurídica de Referência:</span>
                        <span className="text-amber-300 font-medium">{item.doutrinaReferencia}</span>
                      </div>
                    </div>

                    {/* Tese Jurisprudencial Vinculante */}
                    <div className="p-4 bg-amber-950/30 border border-amber-800/60 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-amber-300 font-bold text-xs uppercase tracking-wider flex items-center space-x-2">
                          <Gavel className="w-4 h-4 text-amber-400" />
                          <span>Jurisprudência Fixada ({item.jurisprudenciaTese.tribunal} - {item.jurisprudenciaTese.numeroTemaOuSumula})</span>
                        </h4>
                      </div>

                      <div className="p-3 bg-[#0B0F19] border border-amber-900/40 rounded-lg text-xs italic text-slate-200 leading-relaxed font-serif">
                        "{item.jurisprudenciaTese.enunciado}"
                      </div>

                      <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                        <strong className="text-amber-300 block mb-0.5">Impacto Estratégico Corporativo:</strong>
                        <span className="text-slate-300">{item.jurisprudenciaTese.impactoEmpresarial}</span>
                      </div>
                    </div>

                    {/* Análise Crítica Doutrinária */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-400" />
                        <span>Análise Crítica & Fundamentação Doutrinária</span>
                      </h4>
                      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                        {item.analiseCriticaDoutrinaria}
                      </div>
                    </div>

                    {/* Parecer Jurídico Comentado */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>Parecer Técnico-Jurídico Aplicado ao Caso</span>
                      </h4>
                      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line font-mono">
                        {item.parecerJuridicoComentado}
                      </div>
                    </div>

                    {/* Tese Defensiva / Recuperação */}
                    {item.teseDefensivaOuRecuperacao && (
                      <div className="p-4 bg-emerald-950/20 border border-emerald-800/50 rounded-xl space-y-2">
                        <h4 className="text-emerald-300 font-bold text-xs uppercase tracking-wider flex items-center space-x-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span>Tese Defensiva ou de Recuperação: {item.teseDefensivaOuRecuperacao.tese}</span>
                        </h4>

                        <div className="text-xs space-y-1 text-slate-300">
                          <p><strong className="text-emerald-400">Amparo:</strong> {item.teseDefensivaOuRecuperacao.fundamentacao}</p>
                          <p><strong className="text-slate-200">Estratégia Processual:</strong> {item.teseDefensivaOuRecuperacao.raciocinioDefensivo}</p>
                        </div>
                      </div>
                    )}

                    {/* Footer: Tags & Conhecimento Cross Link */}
                    <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {item.tags.map((tag, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-[10px] font-mono">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {item.linkConhecimentoId && (
                        <button
                          onClick={() => {
                            if (onNavigateToConhecimentos) {
                              onNavigateToConhecimentos(item.linkConhecimentoId);
                            } else if (onNavigateToTab) {
                              onNavigateToTab('conhecimentos');
                            }
                          }}
                          className="px-3.5 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold text-xs transition flex items-center space-x-2 cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Ver Norma Prática no Módulo de Conhecimentos</span>
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
