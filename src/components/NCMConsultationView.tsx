import React, { useState, useMemo } from 'react';
import {
  Search,
  Tag,
  Filter,
  Layers,
  ArrowRightLeft,
  DollarSign,
  ShieldCheck,
  AlertTriangle,
  FileSpreadsheet,
  Printer,
  Sparkles,
  Info,
  CheckCircle2,
  HelpCircle,
  TrendingDown,
  Building2,
  Scale,
  Percent,
  Calculator,
  ChevronRight,
  Zap,
  ArrowUpRight,
  FileText,
  Star,
  MapPin,
  Globe,
  Receipt,
  Download,
  Copy,
  Check,
  BookOpen
} from 'lucide-react';
import { NCMTaxData, CompanyData, CalculationResult } from '../types';
import { NCM_DATABASE, getOrGenerateNCMData, NCM_CHAPTERS, NCM_SECTIONS } from '../data/ncmDatabase';
import { searchIntelligentNCMs } from '../utils/ncmSearchEngine';
import { calculateDynamicIcms, autoCorrectNCMForOperation } from '../utils/icmsEngine';
import { HelpTooltip } from './HelpTooltip';
import { formatCurrencyBRL, formatPercentBR } from '../utils/taxRules';
import { BrandLogo } from './BrandLogo';

interface NCMConsultationViewProps {
  currentCompany?: CompanyData;
  calculation?: CalculationResult;
  onNavigateToCFOP?: () => void;
  onNavigateToRegimes?: () => void;
}

const BRAZIL_UFS = [
  'SP', 'RJ', 'MG', 'PR', 'SC', 'RS', 'BA', 'PE', 'CE', 'GO',
  'DF', 'AM', 'PA', 'ES', 'MT', 'MS', 'AL', 'AP', 'MA', 'PB',
  'PI', 'RN', 'RO', 'RR', 'SE', 'TO', 'Exterior'
];

export const NCMConsultationView: React.FC<NCMConsultationViewProps> = ({
  currentCompany,
  calculation,
  onNavigateToCFOP,
  onNavigateToRegimes,
}) => {
  // Buscador e Filtros Principais
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<string>('todos');
  const [selectedChapter, setSelectedChapter] = useState<string>('todos');
  const [taxFilter, setTaxFilter] = useState<'todos' | 'monofasico' | 'icms_st' | 'aliquota_zero' | 'zfm' | 'imposto_seletivo' | 'favoritos'>('todos');
  const [selectedNCM, setSelectedNCM] = useState<NCMTaxData>(NCM_DATABASE[0]);

  // Filtro Avançado do Cenário da Operação
  const [regimeOrigem, setRegimeOrigem] = useState<'simples' | 'lucro_presumido' | 'lucro_real'>('simples');
  const [regimeDestino, setRegimeDestino] = useState<'simples' | 'lucro_presumido' | 'lucro_real' | 'consumidor_final' | 'orgao_publico'>('simples');
  const [ufOrigem, setUfOrigem] = useState<string>(currentCompany?.uf || 'SP');
  const [ufDestino, setUfDestino] = useState<string>('PR');
  const [tipoOperacao, setTipoOperacao] = useState<'nacional_interna' | 'nacional_interestadual' | 'importacao' | 'exportacao'>('nacional_interna');
  const [cstClassificacaoFilter, setCstClassificacaoFilter] = useState<string>('todos');

  // Abas de Detalhamento do NCM
  const [activeDetailTab, setActiveDetailTab] = useState<'geral' | 'tributacao_completa' | 'guias_darf' | 'cfop' | 'reforma' | 'simulador'>('tributacao_completa');
  
  // Copiado Estado
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Favoritos
  const [favoriteNCMs, setFavoriteNCMs] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('vertice_favorite_ncms');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = (ncmCode: string) => {
    setFavoriteNCMs(prev => {
      const newFavs = prev.includes(ncmCode) 
        ? prev.filter(c => c !== ncmCode) 
        : [...prev, ncmCode];
      localStorage.setItem('vertice_favorite_ncms', JSON.stringify(newFavs));
      return newFavs;
    });
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };
  
  // Simulador de Carga
  const [simulatedRevenue, setSimulatedRevenue] = useState<number>(50000);

  // Segmentos
  const segments = useMemo(() => {
    const list = Array.from(new Set(NCM_DATABASE.map(item => item.segment)));
    return ['todos', ...list];
  }, []);

  // Atualiza automaticamente o Tipo de Operação baseado em UF Origem/Destino
  const handleUfChange = (type: 'origem' | 'destino', val: string) => {
    if (type === 'origem') {
      setUfOrigem(val);
      if (val === 'Exterior' || ufDestino === 'Exterior') {
        setTipoOperacao(val === 'Exterior' ? 'importacao' : 'exportacao');
      } else if (val === ufDestino) {
        setTipoOperacao('nacional_interna');
      } else {
        setTipoOperacao('nacional_interestadual');
      }
    } else {
      setUfDestino(val);
      if (val === 'Exterior' || ufOrigem === 'Exterior') {
        setTipoOperacao(val === 'Exterior' ? 'exportacao' : 'importacao');
      } else if (ufOrigem === val) {
        setTipoOperacao('nacional_interna');
      } else {
        setTipoOperacao('nacional_interestadual');
      }
    }
  };

  // Filtragem Inteligente dos NCMs por Código e por Descrição (Insensível a Acentuação + Fuzzy TIPI)
  const filteredNCMs = useMemo(() => {
    return searchIntelligentNCMs({
      searchTerm,
      selectedSegment,
      selectedChapter,
      taxFilter,
      cstFilter: cstClassificacaoFilter,
      favoriteNCMs,
    });
  }, [searchTerm, selectedSegment, selectedChapter, taxFilter, cstClassificacaoFilter, favoriteNCMs]);

  // Motor de Correção Automática de ICMS (Interna & Interestadual 2026/2027)
  const icmsEngineResult = useMemo(() => {
    return calculateDynamicIcms({
      originUF: ufOrigem,
      destinationUF: ufDestino,
      tipoOperacao,
      isImportedProduct: (selectedNCM.cstClassificacaoEspecial as string) === 'importado_fci',
    });
  }, [ufOrigem, ufDestino, tipoOperacao, selectedNCM.cstClassificacaoEspecial]);

  // NCM com Alíquota Interna de ICMS, DIFAL e MVAs Corrigidas pelo Motor para a UF Destino
  const activeSelectedNCM = useMemo(() => {
    return autoCorrectNCMForOperation({
      ncmData: selectedNCM,
      originUF: ufOrigem,
      destinationUF: ufDestino,
      tipoOperacao,
      isImportedProduct: (selectedNCM.cstClassificacaoEspecial as string) === 'importado_fci',
    });
  }, [selectedNCM, ufOrigem, ufDestino, tipoOperacao]);

  const interestadualRate = icmsEngineResult.interstateRate;

  // CFOP Relevante do Cenário Atual
  const activeCFOP = useMemo(() => {
    const matrix = activeSelectedNCM.cfopMatrix;
    if (tipoOperacao === 'importacao') return matrix.importacaoDirect || '3.102';
    if (tipoOperacao === 'exportacao') return matrix.exportacaoDirect || '7.102';
    
    if (tipoOperacao === 'nacional_interna') {
      return activeSelectedNCM.icmsST ? matrix.vendaInternaRevenda : matrix.vendaInternaRevenda;
    } else {
      return activeSelectedNCM.icmsST ? matrix.vendaInterestadualRevenda : matrix.vendaInterestadualRevenda;
    }
  }, [tipoOperacao, activeSelectedNCM]);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* PAINEL CABEÇALHO */}
      <div className="bg-[#0F172A] p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <BrandLogo variant="badge" module="consultas" />
            <div className="flex items-center space-x-3 mb-2">
              <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <Search className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <span>TODOS OS NCM'S ATIVOS — Consulta Tributária Completa</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                    Banco Atualizado 2026/2027
                  </span>
                </h1>
                <p className="text-xs text-slate-400">
                  Classificação fiscal inteligente de NCMs com ICMS, DIFAL, ICMS-ST, PIS/COFINS, IRPJ, CSLL, IRRF, IPI, DAS, CFOPs, cBenef e Reforma Tributária.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={onNavigateToCFOP}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700 flex items-center space-x-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-400" />
              <span>Módulo CFOPs</span>
            </button>
            <button
              onClick={onNavigateToRegimes}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <Scale className="w-4 h-4" />
              <span>Analista de Regimes</span>
            </button>
          </div>
        </div>

        {/* CAMPO DE BUSCA PRINCIPAL E SELETOR DE CAPÍTULO TIPI */}
        <div className="mt-6 space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digite o código NCM (ex: 2202.10.00 ou 8528.52.00), descrição, CEST..."
                className="w-full pl-12 pr-12 py-3.5 bg-[#0B0F19] text-slate-100 rounded-xl border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm placeholder:text-slate-500 transition font-mono shadow-inner"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded bg-slate-800"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Seletor de Capítulo da Tabela TIPI/NCM (Capítulos 01 a 97 - IBGE/CONCLA / Receita Federal) */}
            <div className="w-full md:w-80 shrink-0">
              <select
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
                className="w-full py-3.5 px-3 bg-[#0B0F19] text-slate-200 rounded-xl border border-slate-700 focus:border-blue-500 text-xs font-mono"
              >
                <option value="todos">Todos os 96 Capítulos NCM/TIPI (01 a 97 - IBGE/CONCLA)</option>
                {NCM_CHAPTERS.map(chap => (
                  <option key={chap.code} value={chap.code}>
                    Cap. {chap.code} - {chap.name.length > 45 ? chap.name.slice(0, 45) + '...' : chap.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 bg-blue-950/40 border border-blue-900/40 px-3 py-1.5 rounded-lg">
            <span className="flex items-center space-x-1.5 text-blue-300">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span><strong>Consulta Universal NCM:</strong> Digite <strong>QUALQUER NCM</strong> de 8 dígitos para consultar alíquotas TIPI, ST e PIS/COFINS em tempo real.</span>
            </span>
            <span className="hidden sm:inline font-mono text-slate-500">Siscomex / TIPI / SPED</span>
          </div>
        </div>

        {/* BARRA DE FILTROS RÁPIDOS */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider flex items-center space-x-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-blue-400" />
            <span>Filtros Rápido:</span>
          </span>

          {[
            { id: 'todos', label: 'Todos os NCMs' },
            { id: 'monofasico', label: 'PIS/COFINS Monofásico' },
            { id: 'icms_st', label: 'ICMS-ST Ativo' },
            { id: 'aliquota_zero', label: 'Alíquota Zero / Isento' },
            { id: 'zfm', label: 'Zona Franca de Manaus (ZFM)' },
            { id: 'imposto_seletivo', label: 'Imposto Seletivo (Reforma)' },
            { id: 'favoritos', label: `Meus Favoritos (${favoriteNCMs.length})` },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setTaxFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                taxFilter === f.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* PAINEL DE SIMULAÇÃO DO CENÁRIO DA OPERAÇÃO (ORIGEM x DESTINO x REGIME) */}
      <div className="bg-[#0F172A] p-5 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
              Parâmetros da Operação Comercial (Filtro por Origem, Destino e Regimes)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Operação Definida: <strong className="text-blue-400">{tipoOperacao.replace('_', ' ').toUpperCase()}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Regime Origem */}
          <div className="space-y-1">
            <label className="text-slate-400 font-semibold block">Regime Empresa Origem:</label>
            <select
              value={regimeOrigem}
              onChange={(e) => setRegimeOrigem(e.target.value as any)}
              className="w-full bg-[#0B0F19] text-slate-200 p-2 rounded-lg border border-slate-700 focus:border-blue-500 font-mono"
            >
              <option value="simples">Simples Nacional</option>
              <option value="lucro_presumido">Lucro Presumido</option>
              <option value="lucro_real">Lucro Real</option>
            </select>
          </div>

          {/* Regime Destino */}
          <div className="space-y-1">
            <label className="text-slate-400 font-semibold block">Regime Empresa Destino:</label>
            <select
              value={regimeDestino}
              onChange={(e) => setRegimeDestino(e.target.value as any)}
              className="w-full bg-[#0B0F19] text-slate-200 p-2 rounded-lg border border-slate-700 focus:border-blue-500 font-mono"
            >
              <option value="simples">Simples Nacional</option>
              <option value="lucro_presumido">Lucro Presumido</option>
              <option value="lucro_real">Lucro Real</option>
              <option value="consumidor_final">Consumidor Final (Não Contribuinte)</option>
              <option value="orgao_publico">Órgão Público</option>
            </select>
          </div>

          {/* UF Origem */}
          <div className="space-y-1">
            <label className="text-slate-400 font-semibold block">UF Origem:</label>
            <select
              value={ufOrigem}
              onChange={(e) => handleUfChange('origem', e.target.value)}
              className="w-full bg-[#0B0F19] text-slate-200 p-2 rounded-lg border border-slate-700 focus:border-blue-500 font-mono"
            >
              {BRAZIL_UFS.map(uf => (
                <option key={`origem-${uf}`} value={uf}>{uf === 'Exterior' ? 'Exterior (Importação)' : uf}</option>
              ))}
            </select>
          </div>

          {/* UF Destino */}
          <div className="space-y-1">
            <label className="text-slate-400 font-semibold block">UF Destino:</label>
            <select
              value={ufDestino}
              onChange={(e) => handleUfChange('destino', e.target.value)}
              className="w-full bg-[#0B0F19] text-slate-200 p-2 rounded-lg border border-slate-700 focus:border-blue-500 font-mono"
            >
              {BRAZIL_UFS.map(uf => (
                <option key={`destino-${uf}`} value={uf}>{uf === 'Exterior' ? 'Exterior (Exportação)' : uf}</option>
              ))}
            </select>
          </div>

          {/* Classificação Especial CST */}
          <div className="space-y-1">
            <label className="text-slate-400 font-semibold block">Classificação de CST:</label>
            <select
              value={cstClassificacaoFilter}
              onChange={(e) => setCstClassificacaoFilter(e.target.value)}
              className="w-full bg-[#0B0F19] text-slate-200 p-2 rounded-lg border border-slate-700 focus:border-blue-500 font-mono"
            >
              <option value="todos">Todas as Classificações</option>
              <option value="regra_geral">Regra Geral (Tributado Integral)</option>
              <option value="monofasico_atacado_varejo">Monofásico (Atacado x Varejo)</option>
              <option value="aliquota_zero">Alíquota Zero (10% Nominal)</option>
              <option value="zona_franca_manaus">Zona Franca de Manaus (ZFM)</option>
              <option value="aliquotas_reduziveis">Demais Alíquotas Reduzíveis</option>
            </select>
          </div>
        </div>
      </div>

      {/* GRADE DIVIDIDA: LISTA DE NCMS (ESQUERDA) x DETALHAMENTO COMPLETO (DIREITA) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUNA ESQUERDA: LISTAGEM DE NCMS (4/12) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-1">
            <span>Resultados Encontrados: <strong className="text-white">{filteredNCMs.length}</strong></span>
            {selectedSegment !== 'todos' && (
              <button
                onClick={() => setSelectedSegment('todos')}
                className="text-blue-400 hover:underline"
              >
                Limpar Segmento
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-[780px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredNCMs.length === 0 ? (
              <div className="p-8 text-center bg-[#0F172A] rounded-2xl border border-slate-800 text-slate-400 space-y-2">
                <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
                <p className="text-sm font-semibold">Nenhum NCM encontrado com estes filtros.</p>
                <p className="text-xs text-slate-500">Tente buscar por código de 8 dígitos ou palavras-chave gerais.</p>
              </div>
            ) : (
              filteredNCMs.map(item => {
                const isSelected = selectedNCM.ncm === item.ncm;
                const isFav = favoriteNCMs.includes(item.ncm);

                return (
                  <div
                    key={item.ncm}
                    onClick={() => setSelectedNCM(item)}
                    className={`p-4 rounded-xl border transition cursor-pointer relative ${
                      isSelected
                        ? 'bg-blue-950/60 border-blue-500 shadow-md ring-1 ring-blue-500/50'
                        : 'bg-[#0F172A] hover:bg-slate-800/80 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-mono font-bold text-blue-300 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800">
                            {item.ncm}
                          </span>
                          {item.cest && (
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                              CEST {item.cest}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-200 line-clamp-2 font-medium">
                          {item.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(item.ncm);
                        }}
                        className={`p-1.5 rounded-lg transition ${
                          isFav ? 'text-amber-400 bg-amber-950/50' : 'text-slate-600 hover:text-slate-300'
                        }`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400 truncate max-w-[150px]">{item.segment}</span>
                      <div className="flex items-center space-x-1.5">
                        {item.pisCofinsNature === 'monofasico' && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                            MONOFÁSICO
                          </span>
                        )}
                        {item.icmsST && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold">
                            ICMS ST
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COLUNA DIREITA: PAINEL DE DETALHAMENTO FISCAL DO NCM SELECIONADO (8/12) */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* CABEÇALHO DO NCM ATIVO SELECIONADO */}
          <div className="bg-[#0F172A] p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <h2 className="text-2xl font-black font-mono text-blue-400 tracking-tight">
                    NCM {selectedNCM.ncm}
                  </h2>
                  {selectedNCM.cest && (
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono font-bold border border-slate-700">
                      CEST: {selectedNCM.cest}
                    </span>
                  )}
                  <button
                    onClick={() => handleCopy(selectedNCM.ncm, 'ncm')}
                    className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg text-xs transition"
                  >
                    {copiedText === 'ncm' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <p className="text-sm font-semibold text-slate-100">
                  {selectedNCM.description}
                </p>
                <span className="text-xs text-slate-400 mt-1 block">
                  {selectedNCM.capitulo} • Segmento: <strong className="text-slate-200">{selectedNCM.segment}</strong>
                </span>
              </div>

              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-blue-950 text-blue-300 border border-blue-800">
                  {selectedNCM.cstClassificacaoEspecial?.replace(/_/g, ' ').toUpperCase() || 'REGRA GERAL'}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  IPI TIPI: <strong className="text-amber-400">{selectedNCM.ipiRate}%</strong>
                </span>
              </div>
            </div>

            {/* ABAS DO DETALHAMENTO FISCAL */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2 text-xs font-semibold">
              {[
                { id: 'tributacao_completa', label: 'Tributação Completa (ICMS, DIFAL, ST, PIS, COFINS, IRPJ, CSLL, IRRF, IPI)' },
                { id: 'guias_darf', label: 'Códigos DARF & Guia ICMS' },
                { id: 'cfop', label: 'CFOPs Enquadradas' },
                { id: 'reforma', label: 'Reforma Tributária (IBS/CBS)' },
                { id: 'simulador', label: 'Simulador de Carga em R$' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveDetailTab(tab.id as any)}
                  className={`px-3.5 py-2 rounded-xl transition cursor-pointer ${
                    activeDetailTab === tab.id
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* CONTEÚDO DA ABA 1: TRIBUTAÇÃO COMPLETA */}
            {activeDetailTab === 'tributacao_completa' && (
              <div className="space-y-6 pt-2">
                
                {/* QUADRO 1: PIS & COFINS (MONOFÁSICO / ALÍQUOTA ZERO / TRIBUTADO) */}
                <div className="bg-[#0B0F19] p-5 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-2">
                      <Receipt className="w-4 h-4 text-blue-400" />
                      <span>PIS & COFINS — Classificação CST e Alíquotas por Regime</span>
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      selectedNCM.pisCofinsNature === 'monofasico' 
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : selectedNCM.pisCofinsNature === 'aliquota_zero'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-blue-950 text-blue-300 border border-blue-800'
                    }`}>
                      {selectedNCM.pisCofinsNature.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div className="bg-[#0F172A] p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">CST Entrada / Saída:</span>
                      <span className="text-slate-100 font-bold">CST {selectedNCM.cstPisCofinsEntrada} / CST {selectedNCM.cstPisCofinsSaida}</span>
                    </div>

                    <div className="bg-[#0F172A] p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Lucro Presumido:</span>
                      <span className="text-blue-400 font-bold">PIS {selectedNCM.pisRatePresumed}% | COFINS {selectedNCM.cofinsRatePresumed}%</span>
                    </div>

                    <div className="bg-[#0F172A] p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Lucro Real:</span>
                      <span className="text-indigo-400 font-bold">PIS {selectedNCM.pisRateReal}% | COFINS {selectedNCM.cofinsRateReal}%</span>
                    </div>

                    <div className="bg-[#0F172A] p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Simples Nacional:</span>
                      <span className="text-emerald-400 font-bold">
                        {selectedNCM.simplesSegregation.segregatePisCofinsMonofasico ? 'DEDUZIDO DO DAS' : 'Tributado no DAS'}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                    <strong className="text-slate-200">Base Legal PIS/COFINS:</strong> {selectedNCM.pisCofinsLegalBase}
                  </div>
                </div>

                {/* QUADRO 2: ICMS, DIFAL, BENEFÍCIO FISCAL (cBenef) E SUBST. TRIBUTÁRIA (ICMS-ST) */}
                <div className="bg-[#0B0F19] p-5 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-2 gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-2">
                      <Building2 className="w-4 h-4 text-emerald-400" />
                      <span>ICMS, DIFAL, Benefício Fiscal (cBenef) & Substituição Tributária (ICMS-ST)</span>
                    </h3>
                    <span className="text-xs font-mono text-slate-400">
                      UF Origem: <strong className="text-emerald-400">{ufOrigem}</strong> → Destino: <strong className="text-emerald-400">{ufDestino}</strong>
                    </span>
                  </div>

                  {/* BANNER INFORMATIVO DO MOTOR AUTOMÁTICO DE ICMS */}
                  <div className="flex items-center space-x-2 text-[11px] bg-emerald-950/40 border border-emerald-800/60 p-2.5 rounded-lg text-emerald-300 font-mono">
                    <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      <strong>Motor de Correção Automática de ICMS:</strong> Alíquota interna de <strong>{ufDestino}</strong> fixada em <strong>{activeSelectedNCM.icmsInternalRate}%</strong> | Interestadual em <strong>{interestadualRate}%</strong> | DIFAL recalculado em <strong>{activeSelectedNCM.difalRate}%</strong>.
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div className="bg-[#0F172A] p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Alíquota Interna ({ufDestino}):</span>
                      <span className="text-slate-100 font-bold">{activeSelectedNCM.icmsInternalRate}%</span>
                    </div>

                    <div className="bg-[#0F172A] p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Alíquota Interestadual:</span>
                      <span className="text-blue-400 font-bold">{interestadualRate}%</span>
                    </div>

                    <div className="bg-[#0F172A] p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">DIFAL Calculado:</span>
                      <span className="text-amber-400 font-bold">{activeSelectedNCM.difalRate}%</span>
                    </div>

                    <div className="bg-[#0F172A] p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Código cBenef (UF):</span>
                      <span className="text-emerald-400 font-bold">{activeSelectedNCM.cBenef || 'Não aplicável'}</span>
                    </div>
                  </div>

                  {/* SUBST. TRIBUTÁRIA DETALHADA */}
                  {activeSelectedNCM.icmsST && (
                    <div className="p-3 bg-indigo-950/30 border border-indigo-800/60 rounded-lg space-y-2 text-xs">
                      <div className="flex items-center justify-between text-indigo-200 font-bold">
                        <span>Regras de Substituição Tributária (ICMS-ST)</span>
                        <span className="font-mono text-[11px]">CST {activeSelectedNCM.cstCsosnSt?.cst || '60'} / CSOSN {activeSelectedNCM.cstCsosnSt?.csosn || '500'}</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
                        <div className="bg-[#0F172A] p-2 rounded border border-slate-800">
                          <span className="text-slate-400 block text-[10px]">MVA Original:</span>
                          <span className="text-indigo-300 font-bold">{activeSelectedNCM.mvaOriginal || 0}%</span>
                        </div>
                        <div className="bg-[#0F172A] p-2 rounded border border-slate-800">
                          <span className="text-slate-400 block text-[10px]">MVA Ajustada (4% Inter):</span>
                          <span className="text-indigo-300 font-bold">{activeSelectedNCM.mvaAjustada4 || 0}%</span>
                        </div>
                        <div className="bg-[#0F172A] p-2 rounded border border-slate-800">
                          <span className="text-slate-400 block text-[10px]">MVA Ajustada (12% Inter):</span>
                          <span className="text-indigo-300 font-bold">{activeSelectedNCM.mvaAjustada12 || 0}%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                    <strong className="text-slate-200">Base Legal ICMS/ST:</strong> {activeSelectedNCM.icmsLegalBase}
                  </div>
                </div>

                {/* QUADRO 3: IRPJ, CSLL, IRRF RETENÇÕES & IPI */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* IRPJ & CSLL */}
                  <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-1.5">
                      <Calculator className="w-4 h-4 text-indigo-400" />
                      <span>IRPJ & CSLL (Presunção / Lucro Real)</span>
                    </h4>
                    <div className="space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between p-2 bg-[#0F172A] rounded border border-slate-800">
                        <span className="text-slate-400">Base Presunção IRPJ:</span>
                        <span className="text-slate-100 font-bold">{selectedNCM.irpjPresumptionRate || 8.0}%</span>
                      </div>
                      <div className="flex justify-between p-2 bg-[#0F172A] rounded border border-slate-800">
                        <span className="text-slate-400">Base Presunção CSLL:</span>
                        <span className="text-slate-100 font-bold">{selectedNCM.csllPresumptionRate || 12.0}%</span>
                      </div>
                      <div className="flex justify-between p-2 bg-[#0F172A] rounded border border-slate-800">
                        <span className="text-slate-400">IRRF Fonte / Retenções:</span>
                        <span className="text-amber-400 font-bold">{selectedNCM.irrfRate || 0.0}%</span>
                      </div>
                    </div>
                  </div>

                  {/* IPI TIPI */}
                  <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-1.5">
                      <Tag className="w-4 h-4 text-amber-400" />
                      <span>IPI — Imposto sobre Produtos Industrializados</span>
                    </h4>
                    <div className="space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between p-2 bg-[#0F172A] rounded border border-slate-800">
                        <span className="text-slate-400">Alíquota TIPI:</span>
                        <span className="text-amber-300 font-bold">{selectedNCM.ipiRate}%</span>
                      </div>
                      <div className="flex justify-between p-2 bg-[#0F172A] rounded border border-slate-800">
                        <span className="text-slate-400">CST IPI:</span>
                        <span className="text-slate-100 font-bold">CST {selectedNCM.ipiCst || '50'}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-[#0F172A] rounded border border-slate-800">
                        <span className="text-slate-400">Código Enquadramento (cEnq):</span>
                        <span className="text-slate-100 font-bold">{selectedNCM.ipiCEnq || '999'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PARECER TÉCNICO PERICIAL */}
                <div className="p-4 bg-blue-950/30 border-l-4 border-blue-500 rounded-r-xl text-xs text-blue-200 space-y-1 border border-blue-900/30">
                  <strong className="block text-blue-300 font-bold uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span>Recomendação Prática de Auditoria Fiscal</span>
                  </strong>
                  <p className="leading-relaxed">{selectedNCM.practicalAdvice}</p>
                </div>
              </div>
            )}

            {/* CONTEÚDO DA ABA 2: CÓDIGOS DARF & GUIAS DE RECOLHIMENTO */}
            {activeDetailTab === 'guias_darf' && (
              <div className="space-y-4 pt-2">
                <div className="p-4 bg-[#0B0F19] rounded-xl border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-2">
                    <Printer className="w-4 h-4 text-blue-400" />
                    <span>Matriz Oficial de Códigos de Arrecadação (DARF & Guia ICMS)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Utilize estes códigos para emissão de DARF na Receita Federal e Guias de ICMS (DARE / DAE / GNRE) nos sistemas estaduais.
                  </p>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="bg-[#0F172A] border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                          <th className="py-2.5 px-3">Tributo</th>
                          <th className="py-2.5 px-3">Código de Arrecadação / DARF</th>
                          <th className="py-2.5 px-3">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        <tr>
                          <td className="py-2.5 px-3 text-slate-300 font-bold">PIS (Receita Federal)</td>
                          <td className="py-2.5 px-3 text-blue-300">{selectedNCM.darfCodes?.pis || '8109 (PIS Faturamento Normal)'}</td>
                          <td className="py-2.5 px-3">
                            <button
                              onClick={() => handleCopy(selectedNCM.darfCodes?.pis || '8109', 'darf_pis')}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] flex items-center space-x-1"
                            >
                              {copiedText === 'darf_pis' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>Copiar</span>
                            </button>
                          </td>
                        </tr>

                        <tr>
                          <td className="py-2.5 px-3 text-slate-300 font-bold">COFINS (Receita Federal)</td>
                          <td className="py-2.5 px-3 text-blue-300">{selectedNCM.darfCodes?.cofins || '2172 (COFINS Faturamento Normal)'}</td>
                          <td className="py-2.5 px-3">
                            <button
                              onClick={() => handleCopy(selectedNCM.darfCodes?.cofins || '2172', 'darf_cofins')}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] flex items-center space-x-1"
                            >
                              {copiedText === 'darf_cofins' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>Copiar</span>
                            </button>
                          </td>
                        </tr>

                        <tr>
                          <td className="py-2.5 px-3 text-slate-300 font-bold">IRPJ (Lucro Presumido)</td>
                          <td className="py-2.5 px-3 text-indigo-300">{selectedNCM.darfCodes?.irpjPresumed || '2089 (IRPJ Presumido)'}</td>
                          <td className="py-2.5 px-3">
                            <button
                              onClick={() => handleCopy(selectedNCM.darfCodes?.irpjPresumed || '2089', 'darf_irpj')}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] flex items-center space-x-1"
                            >
                              {copiedText === 'darf_irpj' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>Copiar</span>
                            </button>
                          </td>
                        </tr>

                        <tr>
                          <td className="py-2.5 px-3 text-slate-300 font-bold">CSLL (Lucro Presumido)</td>
                          <td className="py-2.5 px-3 text-indigo-300">{selectedNCM.darfCodes?.csllPresumed || '2372 (CSLL Presumido)'}</td>
                          <td className="py-2.5 px-3">
                            <button
                              onClick={() => handleCopy(selectedNCM.darfCodes?.csllPresumed || '2372', 'darf_csll')}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] flex items-center space-x-1"
                            >
                              {copiedText === 'darf_csll' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>Copiar</span>
                            </button>
                          </td>
                        </tr>

                        <tr>
                          <td className="py-2.5 px-3 text-slate-300 font-bold">Guia de ICMS / DARE / GNRE</td>
                          <td className="py-2.5 px-3 text-emerald-300">{selectedNCM.icmsGuideCode || '10008-0 (ICMS ST GNRE / DARE)'}</td>
                          <td className="py-2.5 px-3">
                            <button
                              onClick={() => handleCopy(selectedNCM.icmsGuideCode || '10008-0', 'guia_icms')}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] flex items-center space-x-1"
                            >
                              {copiedText === 'guia_icms' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>Copiar</span>
                            </button>
                          </td>
                        </tr>

                        <tr>
                          <td className="py-2.5 px-3 text-slate-300 font-bold">IPI (Indústria / TIPI)</td>
                          <td className="py-2.5 px-3 text-amber-300">{selectedNCM.darfCodes?.ipi || '5123 (IPI Outros)'}</td>
                          <td className="py-2.5 px-3">
                            <button
                              onClick={() => handleCopy(selectedNCM.darfCodes?.ipi || '5123', 'darf_ipi')}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] flex items-center space-x-1"
                            >
                              {copiedText === 'darf_ipi' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>Copiar</span>
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* CONTEÚDO DA ABA 3: CFOPS ENQUADRADAS */}
            {activeDetailTab === 'cfop' && (
              <div className="space-y-4 pt-2">
                <div className="p-4 bg-[#0B0F19] rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-2">
                      <FileSpreadsheet className="w-4 h-4 text-blue-400" />
                      <span>Matriz Completa de CFOPs para a Operação</span>
                    </h3>
                    <span className="text-xs font-mono text-blue-400 font-bold">
                      CFOP Recomendada Atual: {activeCFOP}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-3 bg-[#0F172A] rounded-lg border border-slate-800 space-y-1">
                      <span className="text-slate-400 text-[10px] block">Venda Interna (Revenda):</span>
                      <span className="text-slate-100 font-bold text-sm">{selectedNCM.cfopMatrix.vendaInternaRevenda}</span>
                      <p className="text-[11px] text-slate-400">
                        {selectedNCM.icmsST ? 'Venda de mercadoria adquirida de terceiros com ST' : 'Venda de mercadoria adquirida de terceiros'}
                      </p>
                    </div>

                    <div className="p-3 bg-[#0F172A] rounded-lg border border-slate-800 space-y-1">
                      <span className="text-slate-400 text-[10px] block">Venda Interestadual (Revenda):</span>
                      <span className="text-slate-100 font-bold text-sm">{selectedNCM.cfopMatrix.vendaInterestadualRevenda}</span>
                      <p className="text-[11px] text-slate-400">
                        {selectedNCM.icmsST ? 'Venda interestadual com retenção de ST' : 'Venda interestadual normal'}
                      </p>
                    </div>

                    <div className="p-3 bg-[#0F172A] rounded-lg border border-slate-800 space-y-1">
                      <span className="text-slate-400 text-[10px] block">Venda Interna (Indústria):</span>
                      <span className="text-indigo-300 font-bold text-sm">{selectedNCM.cfopMatrix.vendaInternaIndustria}</span>
                      <p className="text-[11px] text-slate-400">Venda de produto fabricado no estabelecimento</p>
                    </div>

                    <div className="p-3 bg-[#0F172A] rounded-lg border border-slate-800 space-y-1">
                      <span className="text-slate-400 text-[10px] block">Compra para Comercialização:</span>
                      <span className="text-emerald-300 font-bold text-sm">{selectedNCM.cfopMatrix.compraRevendaInterna} / {selectedNCM.cfopMatrix.compraRevendaInterestadual}</span>
                      <p className="text-[11px] text-slate-400">Entrada de mercadorias para revenda</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CONTEÚDO DA ABA 4: REFORMA TRIBUTÁRIA */}
            {activeDetailTab === 'reforma' && (
              <div className="space-y-4 pt-2">
                <div className="p-5 bg-[#0B0F19] rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>Impacto da Reforma Tributária Dual (EC 132/2023 & PLP 68/2024)</span>
                    </h3>
                    <span className="text-xs font-mono text-amber-400 font-bold">
                      Transição 2026-2033
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedNCM.reformaTributaria.notes}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                    <div className="p-3 bg-[#0F172A] rounded-lg border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">CBS Estimada (Federal):</span>
                      <span className="text-blue-400 font-bold text-base">{selectedNCM.reformaTributaria.estimatedRateCBS}%</span>
                    </div>

                    <div className="p-3 bg-[#0F172A] rounded-lg border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">IBS Estimado (Estadual/Municipal):</span>
                      <span className="text-indigo-400 font-bold text-base">{selectedNCM.reformaTributaria.estimatedRateIBS}%</span>
                    </div>

                    <div className="p-3 bg-[#0F172A] rounded-lg border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Imposto Seletivo (IS):</span>
                      <span className={`font-bold text-base ${selectedNCM.reformaTributaria.hasImpostoSeletivo ? 'text-rose-400' : 'text-slate-500'}`}>
                        {selectedNCM.reformaTributaria.hasImpostoSeletivo ? `+${selectedNCM.reformaTributaria.impostoSeletivoRate}%` : 'Não Incide'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CONTEÚDO DA ABA 5: SIMULADOR DE CARGA EM R$ */}
            {activeDetailTab === 'simulador' && (
              <div className="space-y-4 pt-2">
                <div className="p-5 bg-[#0B0F19] rounded-xl border border-slate-800 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-2">
                    <Calculator className="w-4 h-4 text-emerald-400" />
                    <span>Simulador de Carga Tributária por NCM (R$)</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Faturamento Mensal Estimado para este NCM (R$):</label>
                      <input
                        type="number"
                        value={simulatedRevenue}
                        onChange={(e) => setSimulatedRevenue(Number(e.target.value))}
                        className="w-full bg-[#0F172A] text-slate-100 p-2.5 rounded-lg border border-slate-700 font-mono text-sm"
                      />
                    </div>

                    <div className="p-3 bg-[#0F172A] rounded-lg border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 block">Economia Estimada no Simples (Segregação Monofásica/ST):</span>
                      <span className="text-emerald-400 font-bold text-lg font-mono">
                        {formatCurrencyBRL(simulatedRevenue * 0.052 * (selectedNCM.simplesSegregation.segregatePisCofinsMonofasico || selectedNCM.simplesSegregation.segregateIcmsST ? 1 : 0))}
                      </span>
                      <span className="text-[10px] text-slate-400 block">/mês de economia tributária</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NCMConsultationView;
