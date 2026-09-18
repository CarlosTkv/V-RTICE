import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  FileText, 
  Sparkles, 
  Info, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Filter,
  Check,
  Zap,
  Flame,
  FileSpreadsheet,
  Building2,
  Scale
} from 'lucide-react';
import { 
  CNAE_DATABASE, 
  CnaeRecord, 
  searchCnaeDatabase, 
  analyzeCnaeSimplesEligibility 
} from '../../data/cnaeDatabase';

export interface SecondaryCnaeItem {
  code: string;
  description: string;
  record?: CnaeRecord;
}

interface DynamicActivityCnaeSelectorProps {
  primaryCnaeCode: string;
  primaryCnaeDesc: string;
  secondaryCnaes: SecondaryCnaeItem[];
  onChangePrimaryCnae: (code: string, desc: string) => void;
  onAddSecondaryCnae: (cnae: CnaeRecord) => void;
  onRemoveSecondaryCnae: (code: string) => void;
  onSetAsPrimary: (cnae: SecondaryCnaeItem) => void;
  onGenerateObjetoSocialClause?: (clauseText: string) => void;
}

export const DynamicActivityCnaeSelector: React.FC<DynamicActivityCnaeSelectorProps> = ({
  primaryCnaeCode,
  primaryCnaeDesc,
  secondaryCnaes,
  onChangePrimaryCnae,
  onAddSecondaryCnae,
  onRemoveSecondaryCnae,
  onSetAsPrimary,
  onGenerateObjetoSocialClause
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sectorFilter, setSectorFilter] = useState<'all' | 'permitidos' | 'impeditivos' | 'fator_r' | 'anexo_iv' | 'mei' | 'servicos' | 'comercio'>('all');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [selectedPreviewCnae, setSelectedPreviewCnae] = useState<CnaeRecord | null>(null);

  // Encontra o registro completo do CNAE Primário
  const primaryRecord = useMemo(() => {
    const clean = primaryCnaeCode.trim().replace(/[.\-/]/g, '');
    return CNAE_DATABASE.find(c => c.codeRaw === clean || c.code === primaryCnaeCode) || null;
  }, [primaryCnaeCode]);

  // Lista de resultados filtrados da busca
  const searchResults = useMemo(() => {
    return searchCnaeDatabase(searchTerm, sectorFilter);
  }, [searchTerm, sectorFilter]);

  // Análise global de enquadramento ao Simples Nacional
  const simplesAnalysis = useMemo(() => {
    return analyzeCnaeSimplesEligibility(
      primaryCnaeCode, 
      secondaryCnaes.map(s => s.code)
    );
  }, [primaryCnaeCode, secondaryCnaes]);

  // Geração automática do texto do Objeto Social contratual com formatação DREI
  const handleSyncObjetoSocial = () => {
    let text = `CLÁUSULA SEGUNDA - DO OBJETO SOCIAL\n\nA Sociedade tem por objeto social principal e preponderante a exploração da seguinte atividade econômica:\n`;
    text += `a) ATIVIDADE PRINCIPAL (CNAE ${primaryCnaeCode}): ${primaryCnaeDesc.toUpperCase()}.\n\n`;

    if (secondaryCnaes.length > 0) {
      text += `A Sociedade poderá ainda exercer as seguintes atividades econômicas secundárias correlatas:\n`;
      secondaryCnaes.forEach((sec, idx) => {
        const letter = String.fromCharCode(98 + idx); // 'b', 'c', 'd'...
        text += `${letter}) ATIVIDADE SECUNDÁRIA (CNAE ${sec.code}): ${sec.description.toUpperCase()};\n`;
      });
      text += `\n`;
    }

    text += `PARÁGRAFO ÚNICO: A Sociedade poderá participar de outras sociedades como sócia, acionista ou quotista, bem como constituir filiais em qualquer parte do território nacional, mediante regular deliberação dos sócios e arquivamento perante a Junta Comercial competente.`;

    if (onGenerateObjetoSocialClause) {
      onGenerateObjetoSocialClause(text);
    }
  };

  const isCnaeAlreadyAdded = (code: string) => {
    const clean = code.trim().replace(/[.\-/]/g, '');
    const cleanPrimary = primaryCnaeCode.trim().replace(/[.\-/]/g, '');
    if (clean === cleanPrimary) return true;
    return secondaryCnaes.some(s => s.code.trim().replace(/[.\-/]/g, '') === clean);
  };

  return (
    <div className="space-y-4">
      {/* CABEÇALHO DO GERENCIADOR DE ATIVIDADES */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Atividades Econômicas & Objeto Social (CNAE)
            </h4>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Classificação completa com verificação de impedimento ao Simples Nacional, Fator R, Anexos e LC 116.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSyncObjetoSocial}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Gerar Cláusula de Objeto Social</span>
          </button>
        </div>
      </div>

      {/* DIAGNÓSTICO DE ENQUADRAMENTO NO SIMPLES NACIONAL */}
      <div className={`p-4 rounded-xl border transition-all ${
        !simplesAnalysis.isEligible 
          ? 'bg-rose-950/40 border-rose-600/60 shadow-lg shadow-rose-950/20' 
          : simplesAnalysis.fatorRCnaes.length > 0 
            ? 'bg-amber-950/30 border-amber-600/50' 
            : 'bg-emerald-950/30 border-emerald-600/40'
      }`}>
        <div className="flex items-start gap-3">
          {!simplesAnalysis.isEligible ? (
            <div className="p-2 rounded-lg bg-rose-600 text-white shrink-0">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
          ) : simplesAnalysis.fatorRCnaes.length > 0 ? (
            <div className="p-2 rounded-lg bg-amber-500 text-slate-900 shrink-0">
              <Flame className="w-5 h-5" />
            </div>
          ) : (
            <div className="p-2 rounded-lg bg-emerald-600 text-white shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
          )}

          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className={`text-xs font-black uppercase tracking-wider ${
                !simplesAnalysis.isEligible 
                  ? 'text-rose-400' 
                  : simplesAnalysis.fatorRCnaes.length > 0 
                    ? 'text-amber-400' 
                    : 'text-emerald-400'
              }`}>
                {!simplesAnalysis.isEligible 
                  ? '⚠️ CNPJ IMPEDIDO DE OPTAR PELO SIMPLES NACIONAL (ART. 17 LC 123/06)' 
                  : simplesAnalysis.fatorRCnaes.length > 0 
                    ? '⚡ SIMPLES NACIONAL PERMITIDO COM ATENÇÃO AO FATOR R' 
                    : '✅ 100% COMPATÍVEL COM O SIMPLES NACIONAL'}
              </span>

              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700 text-slate-300">
                Total: 1 Principal + {secondaryCnaes.length} Secundárias
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {simplesAnalysis.recommendation}
            </p>

            {simplesAnalysis.warnings.length > 0 && (
              <div className="space-y-1 pt-1.5">
                {simplesAnalysis.warnings.map((warn, i) => (
                  <div key={i} className="text-[11px] font-medium text-amber-200/90 flex items-start gap-1.5 bg-black/30 p-2 rounded-lg border border-amber-500/20">
                    <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{warn}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 1. ATIVIDADE PRINCIPAL (CNAE PRIMÁRIO) */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider">
              Atividade Principal (Primária)
            </span>
            <span className="text-xs font-mono font-bold text-blue-300">
              {primaryCnaeCode || 'Não selecionado'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsSearchOpen(true);
            }}
            className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
          >
            <Search className="w-3 h-3" />
            <span>Pesquisar outro CNAE</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">CÓDIGO CNAE:</label>
            <input
              type="text"
              value={primaryCnaeCode}
              onChange={(e) => onChangePrimaryCnae(e.target.value, primaryCnaeDesc)}
              placeholder="Ex: 6201-5/01"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="sm:col-span-3">
            <label className="text-[10px] font-bold text-slate-400 block mb-1">DESCRIÇÃO DA ATIVIDADE PRINCIPAL:</label>
            <input
              type="text"
              value={primaryCnaeDesc}
              onChange={(e) => onChangePrimaryCnae(primaryCnaeCode, e.target.value)}
              placeholder="Descrição formal da atividade"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* DETALHES TRIBUTÁRIOS DO CNAE PRIMÁRIO */}
        {primaryRecord && (
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-2 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                primaryRecord.isImpeditivo
                  ? 'bg-rose-500 text-white'
                  : primaryRecord.subjectToFatorR
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {primaryRecord.simplesStatusLabel}
              </span>

              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">
                Anexo: {primaryRecord.anexo} ({primaryRecord.initialAliquot}% inicial)
              </span>

              {primaryRecord.itemLC116 && (
                <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] font-bold">
                  Item LC 116: {primaryRecord.itemLC116} (ISS {primaryRecord.issStandardRate}%)
                </span>
              )}

              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                primaryRecord.alvaraDispensado 
                  ? 'bg-teal-950 text-teal-300 border border-teal-800' 
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {primaryRecord.alvaraDispensado ? 'Alvará Dispensado (Risco I)' : 'Alvará Exigido'}
              </span>
            </div>

            <p className="text-[11px] text-slate-400">
              <strong className="text-slate-300">Base Legal:</strong> {primaryRecord.legalBasis}
            </p>

            {primaryRecord.impedimentoMotivo && (
              <div className="p-2 rounded bg-rose-950/50 border border-rose-700/50 text-[11px] text-rose-300">
                <strong>Motivo do Impedimento:</strong> {primaryRecord.impedimentoMotivo}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. ATIVIDADES SECUNDÁRIAS (CNAES SECUNDÁRIOS) */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-purple-600 text-white text-[10px] font-black uppercase tracking-wider">
              Atividades Secundárias ({secondaryCnaes.length})
            </span>
            <span className="text-xs text-slate-400">
              Atividades econômicas complementares que a empresa exercerá
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar CNAE Secundário</span>
          </button>
        </div>

        {secondaryCnaes.length === 0 ? (
          <div className="p-6 rounded-xl border border-dashed border-slate-800 text-center space-y-2 bg-slate-950/40">
            <FileSpreadsheet className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">
              Nenhuma atividade secundária adicionada. Adicione múltiplos CNAEs para expandir o objeto social.
            </p>
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Explorar Catálogo Completo de CNAEs</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {secondaryCnaes.map((sec, idx) => {
              const clean = sec.code.trim().replace(/[.\-/]/g, '');
              const rec = sec.record || CNAE_DATABASE.find(c => c.codeRaw === clean || c.code === sec.code);

              return (
                <div 
                  key={sec.code + idx} 
                  className={`p-3 rounded-xl border transition-all ${
                    rec?.isImpeditivo 
                      ? 'bg-rose-950/30 border-rose-700/60' 
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-black text-xs text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800">
                          {sec.code}
                        </span>

                        {rec && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            rec.isImpeditivo 
                              ? 'bg-rose-600 text-white' 
                              : rec.subjectToFatorR 
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {rec.simplesStatusLabel}
                          </span>
                        )}

                        {rec?.anexo && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            Anexo {rec.anexo}
                          </span>
                        )}

                        {rec?.itemLC116 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300">
                            LC 116: {rec.itemLC116}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-white font-medium">
                        {sec.description}
                      </p>

                      {rec?.impedimentoMotivo && (
                        <p className="text-[11px] text-rose-300 bg-rose-950/40 p-1.5 rounded border border-rose-800/40 mt-1">
                          ⚠️ {rec.impedimentoMotivo}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => onSetAsPrimary(sec)}
                        title="Tornar este CNAE a Atividade Principal"
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-300 text-[11px] font-bold transition cursor-pointer"
                      >
                        Definir como Principal
                      </button>

                      <button
                        type="button"
                        onClick={() => onRemoveSecondaryCnae(sec.code)}
                        title="Remover Atividade"
                        className="p-1.5 rounded bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. MODAL DE BUSCA AVANÇADA DE CNAES COM FILTROS */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* CABEÇALHO DO MODAL */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Catálogo Nacional de CNAEs & Enquadramento Simples Nacional
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Consulte impedimentos (Art. 17 LC 123/06), Fator R, Anexos I a V e itens da LC 116 para serviços
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Fechar ✕
              </button>
            </div>

            {/* BARRA DE PESQUISA & FILTROS */}
            <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-900/90">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Pesquise por código (ex: 6201, 6911, 4711), nome da atividade, software, holding, restaurante..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  autoFocus
                />
              </div>

              {/* FILTROS RÁPIDOS */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="text-slate-400 font-bold mr-1 flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Filtrar:
                </span>
                {[
                  { id: 'all', label: 'Todos os CNAEs' },
                  { id: 'permitidos', label: '✅ Permitidos Simples' },
                  { id: 'impeditivos', label: '⛔ Impeditivos do Simples' },
                  { id: 'fator_r', label: '⚡ Fator R (Anexo III/V)' },
                  { id: 'anexo_iv', label: '🏛️ Anexo IV (Obras/Advocacia)' },
                  { id: 'mei', label: '💼 Permitidos no MEI' },
                  { id: 'servicos', label: '💻 Serviços & TI' },
                  { id: 'comercio', label: '🛒 Comércio Varejista/Atacado' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSectorFilter(f.id as any)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                      sectorFilter === f.id
                        ? 'bg-blue-600 text-white shadow'
                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* LISTAGEM DE RESULTADOS */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-slate-950/60">
              <div className="text-[11px] text-slate-400 flex items-center justify-between pb-1">
                <span>Exibindo {searchResults.length} atividade(s) encontrada(s)</span>
                <span className="text-slate-500">Clique para adicionar como atividade secundária ou definir como primária</span>
              </div>

              {searchResults.length === 0 ? (
                <div className="p-8 text-center text-slate-500 space-y-2">
                  <AlertTriangle className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="text-xs">Nenhum CNAE encontrado para os termos digitados.</p>
                </div>
              ) : (
                searchResults.map((cnae) => {
                  const alreadyAdded = isCnaeAlreadyAdded(cnae.code);
                  const isCurrentPrimary = primaryCnaeCode.trim().replace(/[.\-/]/g, '') === cnae.codeRaw;

                  return (
                    <div
                      key={cnae.code}
                      className={`p-3.5 rounded-xl border transition-all ${
                        cnae.isImpeditivo
                          ? 'bg-rose-950/20 border-rose-800/40 hover:border-rose-600'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono font-black text-xs text-blue-300 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                              {cnae.code}
                            </span>

                            <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                              cnae.isImpeditivo
                                ? 'bg-rose-600 text-white'
                                : cnae.subjectToFatorR
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            }`}>
                              {cnae.simplesStatusLabel}
                            </span>

                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                              Anexo {cnae.anexo} ({cnae.initialAliquot}% inicial)
                            </span>

                            {cnae.itemLC116 && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-900">
                                LC 116: {cnae.itemLC116} (ISS {cnae.issStandardRate}%)
                              </span>
                            )}

                            {cnae.meiAllowed ? (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
                                MEI Permitido
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800/60 text-slate-500">
                                MEI Vedado
                              </span>
                            )}
                          </div>

                          <h5 className="text-xs font-bold text-white">
                            {cnae.description}
                          </h5>

                          <p className="text-[11px] text-slate-400">
                            <span className="text-slate-500 font-bold">Base Legal:</span> {cnae.legalBasis}
                          </p>

                          {cnae.impedimentoMotivo && (
                            <p className="text-[11px] text-rose-300 bg-rose-950/50 p-2 rounded-lg border border-rose-700/50 font-medium">
                              ⛔ <strong>Impedimento do Simples:</strong> {cnae.impedimentoMotivo}
                            </p>
                          )}
                        </div>

                        {/* AÇÕES DE ADIÇÃO */}
                        <div className="flex sm:flex-col items-center gap-1.5 shrink-0">
                          {isCurrentPrimary ? (
                            <span className="px-3 py-1 rounded-lg bg-blue-600/30 border border-blue-500 text-blue-300 text-xs font-bold">
                              Atividade Principal Atual
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                onChangePrimaryCnae(cnae.code, cnae.description);
                                setIsSearchOpen(false);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center gap-1 transition cursor-pointer w-full justify-center"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Definir como Principal</span>
                            </button>
                          )}

                          {!isCurrentPrimary && (
                            alreadyAdded ? (
                              <button
                                type="button"
                                onClick={() => onRemoveSecondaryCnae(cnae.code)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-rose-300 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer w-full justify-center"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remover Secundária</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => onAddSecondaryCnae(cnae)}
                                className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold flex items-center gap-1 transition cursor-pointer w-full justify-center"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Adicionar Secundária</span>
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* RODAPÉ DO MODAL */}
            <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
              <span>Classificação Nacional de Atividades Econômicas — Versão RFB / CGSN 2026</span>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
              >
                Concluir Seleção
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
