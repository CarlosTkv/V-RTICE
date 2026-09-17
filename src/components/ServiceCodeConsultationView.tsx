import React, { useState, useMemo } from 'react';
import {
  Search,
  FileText,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Printer,
  Sparkles,
  HelpCircle,
  TrendingDown,
  Building2,
  Scale,
  Percent,
  Calculator,
  ChevronRight,
  Zap,
  Users,
  Briefcase,
  ShieldCheck,
  DollarSign,
  ArrowRightLeft,
  ArrowUpRight,
  Star,
  Globe,
  MapPin,
  Building,
  Receipt,
  FileCode2
} from 'lucide-react';
import { ServiceCodeTaxData, CompanyData, CalculationResult } from '../types';
import { SERVICE_CODE_DATABASE } from '../data/serviceCodeDatabase';
import { calculateServiceRetentionsAndTaxes, searchIntelligentServices, ServiceSimulationParams } from '../utils/serviceTaxEngine';

interface ServiceCodeConsultationViewProps {
  currentCompany?: CompanyData;
  calculation?: CalculationResult;
  onNavigateToFatorR?: () => void;
  onNavigateToRegimes?: () => void;
}

const BRAZIL_UFS = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 
  'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO', 'EX'
];

export const ServiceCodeConsultationView: React.FC<ServiceCodeConsultationViewProps> = ({
  currentCompany,
  calculation,
  onNavigateToFatorR,
  onNavigateToRegimes,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('todos');
  const [serviceFilter, setServiceFilter] = useState<'todos' | 'fator_r' | 'anexo_iv' | 'retencao_fonte' | 'local_prestacao' | 'reducao_reforma' | 'favoritos'>('todos');
  const [selectedService, setSelectedService] = useState<ServiceCodeTaxData>(SERVICE_CODE_DATABASE[0]);
  const [activeTab, setActiveTab] = useState<'iss' | 'simples' | 'retencoes' | 'presumido' | 'reforma' | 'simulador_nfse'>('simulador_nfse');

  // Favoritos
  const [favoriteServices, setFavoriteServices] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('vertice_favorite_services');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = (itemLC116: string) => {
    setFavoriteServices(prev => {
      const newFavs = prev.includes(itemLC116) 
        ? prev.filter(c => c !== itemLC116) 
        : [...prev, itemLC116];
      localStorage.setItem('vertice_favorite_services', JSON.stringify(newFavs));
      return newFavs;
    });
  };

  // Estados Avançados de Simulação de Serviços (CTN, CNAE, Locais e Regimes)
  const [simulatedGrossNfse, setSimulatedGrossNfse] = useState<number>(10000);
  const [operationType, setOperationType] = useState<'interno' | 'exportacao'>('interno');
  
  // Prestador
  const [prestadorUf, setPrestadorUf] = useState<string>('SP');
  const [prestadorCity, setPrestadorCity] = useState<string>('São Paulo');
  const [prestadorRegime, setPrestadorRegime] = useState<'simples' | 'lucro_presumido' | 'lucro_real' | 'mei'>('simples');
  
  // Tomador
  const [tomadorUf, setTomadorUf] = useState<string>('RJ');
  const [tomadorCity, setTomadorCity] = useState<string>('Rio de Janeiro');
  const [tomadorRegime, setTomadorRegime] = useState<'pj_privada' | 'orgao_publico_federal' | 'orgao_publico_estadual_municipal' | 'pf' | 'exterior'>('pj_privada');
  
  // Local da Prestação
  const [localExecucaoType, setLocalExecucaoType] = useState<'estabelecimento_prestador' | 'local_tomador_execucao'>('estabelecimento_prestador');
  const [localUf, setLocalUf] = useState<string>('RJ');
  const [localCity, setLocalCity] = useState<string>('Rio de Janeiro');
  
  // Outros
  const [customIssRate, setCustomIssRate] = useState<number>(3.0);
  const [hasCessaoMaoObra, setHasCessaoMaoObra] = useState<boolean>(false);

  // Lista única de grupos de serviços da LC 116
  const groups = useMemo(() => {
    const list = Array.from(new Set(SERVICE_CODE_DATABASE.map(item => item.groupName)));
    return ['todos', ...list];
  }, []);

  // Filtragem Inteligente
  const filteredServices = useMemo(() => {
    return searchIntelligentServices({
      searchTerm,
      selectedGroup,
      serviceFilter,
      favoriteServices
    });
  }, [searchTerm, selectedGroup, serviceFilter, favoriteServices]);

  // Motor de Cálculo Completo de Impostos e Retenções
  const serviceCalculation = useMemo(() => {
    const params: ServiceSimulationParams = {
      grossAmount: simulatedGrossNfse,
      operationType,
      prestadorUf,
      prestadorCity,
      prestadorRegime,
      tomadorUf,
      tomadorCity,
      tomadorRegime,
      localExecucaoType,
      localUf,
      localCity,
      customIssRate,
      hasCessaoMaoObra
    };
    return calculateServiceRetentionsAndTaxes(selectedService, params);
  }, [
    selectedService,
    simulatedGrossNfse,
    operationType,
    prestadorUf,
    prestadorCity,
    prestadorRegime,
    tomadorUf,
    tomadorCity,
    tomadorRegime,
    localExecucaoType,
    localUf,
    localCity,
    customIssRate,
    hasCessaoMaoObra
  ]);

  // Exportar CSV
  const handleExportCSV = () => {
    const headers = [
      'Item LC 116',
      'Código CTN',
      'Código NBS',
      'Descrição',
      'Grupo',
      'CNAEs Correlatos',
      'Local de Incidência ISS',
      'Anexo Simples Nacional',
      'Sujeito ao Fator R',
      'IRRF %',
      'CSRF %',
      'INSS %',
      'Lucro Presumido %',
      'Reforma IBS/CBS %'
    ];

    const rows = filteredServices.map(item => [
      `"${item.itemLC116}"`,
      `"${item.ctnCode || 'N/A'}"`,
      `"${item.nbsCode || 'N/A'}"`,
      `"${item.description.replace(/"/g, '""')}"`,
      `"${item.groupName}"`,
      `"${item.cnaeCorrelates.join('; ')}"`,
      `"${item.issIncidenceRule === 'local_prestacao' ? 'Local da Prestação' : 'Estabelecimento Prestador'}"`,
      `"${item.simplesNacional.defaultAnexo}"`,
      `"${item.simplesNacional.subjectToFatorR ? 'SIM' : 'NÃO'}"`,
      `"${item.federalWithholdings.irrfRate}%"`,
      `"${item.federalWithholdings.csrfRate}%"`,
      `"${item.federalWithholdings.inssWithholdingRate}%"`,
      `"${item.lucroPresumido.irpjPresumptionRate}%"`,
      `"${item.reformaTributaria.cbsIbsRate}%"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `base_servicos_ctn_lc116_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn" id="service-consultation-module">
      
      {/* CABEÇALHO DO MÓDULO */}
      <div className="bg-[#0B0F19] p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2.5">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-bold text-slate-100 tracking-tight">
                    Consulta & Inteligência de Serviços (CTN, CNAE, NBS & LC 116)
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                    CTN • LC 116 • NBS • Retenções & Códigos DARF
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Pesquise por Código de Tributação Nacional (CTN), CNAE, Item da LC 116 ou Recomendação de NBS. Simule ISS retido, retenções federais (IRRF, CSRF, INSS, Órgãos Públicos), isenção em exportação e códigos de recolhimento do DARF.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer shadow-xs"
              title="Exportar base de serviços LC 116 para CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Exportar CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer shadow-xs"
              title="Imprimir ficha técnica do serviço"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span>Imprimir Ficha</span>
            </button>
          </div>
        </div>

        {/* BARRA DE PESQUISA & FILTROS */}
        <div className="mt-6 space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquise por CTN (ex: 01.01.01), CNAE (ex: 6201-5), NBS (ex: 1.0101), Item LC 116 (ex: 1.01, 7.02) ou Palavra-Chave..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200 px-1.5 py-0.5 rounded bg-slate-800"
                >
                  Limpar
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] text-slate-400 font-semibold">Grupo:</span>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="bg-transparent text-xs text-slate-200 font-bold focus:outline-none cursor-pointer max-w-[200px] truncate"
                >
                  <option value="todos" className="bg-slate-900 text-slate-200">Todos os Grupos LC 116 ({groups.length - 1})</option>
                  {groups.filter(g => g !== 'todos').map(grp => (
                    <option key={grp} value={grp} className="bg-slate-900 text-slate-200">{grp}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* CHIPS DE FILTRO DE SERVIÇOS */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1">
            <span className="text-[11px] font-bold text-slate-400 mr-1">Filtro Fiscal:</span>

            <button
              onClick={() => setServiceFilter('todos')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer text-xs ${
                serviceFilter === 'todos'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
              }`}
            >
              Todos ({SERVICE_CODE_DATABASE.length})
            </button>

            <button
              onClick={() => setServiceFilter('favoritos')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer text-xs flex items-center space-x-1 ${
                serviceFilter === 'favoritos'
                  ? 'bg-yellow-600 text-white shadow-xs'
                  : 'bg-slate-800/80 text-yellow-500 hover:bg-slate-700 border border-slate-700/60'
              }`}
            >
              <Star className={`w-3 h-3 ${serviceFilter === 'favoritos' ? 'text-white fill-current' : 'text-yellow-500'}`} />
              <span>Favoritos ({favoriteServices.length})</span>
            </button>

            <button
              onClick={() => setServiceFilter('fator_r')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer text-xs flex items-center space-x-1 ${
                serviceFilter === 'fator_r'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-800/80 text-amber-300 hover:bg-slate-700 border border-slate-700/60'
              }`}
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>⚡ Sujeito ao Fator R (Anexo III vs V)</span>
            </button>

            <button
              onClick={() => setServiceFilter('anexo_iv')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer text-xs flex items-center space-x-1 ${
                serviceFilter === 'anexo_iv'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-800/80 text-rose-300 hover:bg-slate-700 border border-slate-700/60'
              }`}
            >
              <Building2 className="w-3 h-3 text-rose-400" />
              <span>Anexo IV (CPP 20% Fora)</span>
            </button>

            <button
              onClick={() => setServiceFilter('retencao_fonte')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer text-xs flex items-center space-x-1 ${
                serviceFilter === 'retencao_fonte'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-800/80 text-blue-300 hover:bg-slate-700 border border-slate-700/60'
              }`}
            >
              <DollarSign className="w-3 h-3 text-blue-400" />
              <span>Com Retenção na Fonte (IRRF/CSRF/INSS)</span>
            </button>

            <button
              onClick={() => setServiceFilter('local_prestacao')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer text-xs flex items-center space-x-1 ${
                serviceFilter === 'local_prestacao'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-800/80 text-emerald-300 hover:bg-slate-700 border border-slate-700/60'
              }`}
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>ISS Devido no Local da Obra/Prestação</span>
            </button>
          </div>
        </div>
      </div>

      {/* GRID PRINCIPAL: LISTAGEM DE SERVIÇOS + DETALHES TÉCNICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUNA ESQUERDA: LISTA DE SERVIÇOS (5 COLUNAS) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-300">
              Serviços Encontrados ({filteredServices.length})
            </span>
            <span className="text-[11px] text-slate-500">
              Clique para analisar
            </span>
          </div>

          <div className="space-y-2 max-h-[750px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
            {filteredServices.length === 0 ? (
              <div className="bg-[#0B0F19] p-8 text-center rounded-2xl border border-slate-800 text-slate-400 space-y-2">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                <p className="text-xs font-semibold">Nenhum código de serviço encontrado para o termo pesquisado.</p>
                <p className="text-[11px] text-slate-500">Tente buscar pelo código CTN, CNAE, NBS ou descrição genérica.</p>
              </div>
            ) : (
              filteredServices.map((item) => {
                const isSelected = selectedService.itemLC116 === item.itemLC116;
                const isFav = favoriteServices.includes(item.itemLC116);

                return (
                  <div
                    key={item.itemLC116}
                    onClick={() => setSelectedService(item)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer relative group ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500/80 shadow-md ring-1 ring-indigo-500/40'
                        : 'bg-[#0B0F19] border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            LC 116 • {item.itemLC116}
                          </span>
                          {item.ctnCode && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                              CTN {item.ctnCode}
                            </span>
                          )}
                          {item.simplesNacional.subjectToFatorR && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              ⚡ Fator R
                            </span>
                          )}
                        </div>
                        <h3 className="text-xs font-bold text-slate-100 line-clamp-2 leading-snug pt-0.5">
                          {item.description}
                        </h3>
                        {item.nbsCode && (
                          <div className="text-[10px] font-mono text-slate-400">
                            NBS Recomendada: <strong className="text-indigo-300">{item.nbsCode}</strong>
                          </div>
                        )}
                        <div className="text-[10px] text-slate-500 flex items-center space-x-1 pt-1">
                          <span>CNAEs:</span>
                          <span className="text-slate-300 font-mono">{item.cnaeCorrelates.slice(0, 2).join(', ')}{item.cnaeCorrelates.length > 2 ? '...' : ''}</span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(item.itemLC116);
                        }}
                        className="text-slate-600 hover:text-yellow-400 transition p-1"
                        title={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                      >
                        <Star className={`w-4 h-4 ${isFav ? 'text-yellow-400 fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COLUNA DIREITA: DETALHES TÉCNICOS & MÓDULO DE CÁLCULO (7 COLUNAS) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="bg-[#0B0F19] p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            
            {/* CABEÇALHO DO SERVIÇO */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-3.5">
              <div>
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className="text-lg font-mono font-black text-indigo-400 bg-indigo-950/80 px-2.5 py-1 rounded-lg border border-indigo-700/60">
                    LC 116 • Item {selectedService.itemLC116}
                  </span>
                  {selectedService.ctnCode && (
                    <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/60">
                      CTN {selectedService.ctnCode}
                    </span>
                  )}
                  {selectedService.nbsCode && (
                    <span className="text-xs font-mono font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      NBS {selectedService.nbsCode}
                    </span>
                  )}
                </div>
                <h2 className="text-sm font-bold text-slate-100 mt-2 leading-snug">
                  {selectedService.description}
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Grupo: <strong className="text-slate-300">{selectedService.groupName}</strong> • CNAEs: <span className="text-indigo-300 font-mono">{selectedService.cnaeCorrelates.join(', ')}</span>
                </p>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs shrink-0">
                <span className="text-[10px] uppercase font-bold text-slate-400">Simples Nacional</span>
                <span className="font-extrabold text-indigo-300">
                  {selectedService.simplesNacional.subjectToFatorR ? 'Anexo III vs V (Fator R)' : `Anexo ${selectedService.simplesNacional.defaultAnexo}`}
                </span>
              </div>
            </div>

            {/* NAVEGAÇÃO DE ABAS */}
            <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-800 pb-2 text-xs">
              <button
                onClick={() => setActiveTab('simulador_nfse')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === 'simulador_nfse'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 border border-emerald-800/40'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Simulador Completo de Retenções & DARF</span>
              </button>

              <button
                onClick={() => setActiveTab('iss')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === 'iss'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>1. ISS & Local da Obra</span>
              </button>

              <button
                onClick={() => setActiveTab('retencoes')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === 'retencoes'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5 text-blue-400" />
                <span>2. Retenções Federais</span>
              </button>

              <button
                onClick={() => setActiveTab('simples')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === 'simples'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>3. Simples & Fator R</span>
              </button>

              <button
                onClick={() => setActiveTab('presumido')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === 'presumido'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>4. Presumido / Real</span>
              </button>

              <button
                onClick={() => setActiveTab('reforma')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === 'reforma'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>5. Reforma (IBS/CBS)</span>
              </button>
            </div>

            {/* CONTEÚDO DA ABA SIMULADOR COMPLETO */}
            {activeTab === 'simulador_nfse' && (
              <div className="space-y-4 text-xs">
                
                {/* PAINEL DE CONFIGURAÇÃO DA OPERAÇÃO */}
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                      <Calculator className="w-4 h-4" />
                      <span>Parâmetros de Pesquisa & Operação Fiscal da Serviço:</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setOperationType('interno')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                          operationType === 'interno' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        🇧🇷 Serviço Interno
                      </button>
                      <button
                        onClick={() => setOperationType('exportacao')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                          operationType === 'exportacao' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        🌐 Exportação de Serviços
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    
                    {/* VALOR BRUTO */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300 block">Valor Bruto da Nota Fiscal (R$):</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">R$</span>
                        <input
                          type="number"
                          value={simulatedGrossNfse}
                          onChange={(e) => setSimulatedGrossNfse(Math.max(0, Number(e.target.value)))}
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    {/* REGIME DO PRESTADOR */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300 block">Regime Tributário do Prestador:</label>
                      <select
                        value={prestadorRegime}
                        onChange={(e) => setPrestadorRegime(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="simples">Simples Nacional (Dispensa IRRF/CSRF)</option>
                        <option value="lucro_presumido">Lucro Presumido (Retenção Plena)</option>
                        <option value="lucro_real">Lucro Real (Retenção Plena)</option>
                        <option value="mei">MEI (Isento na Fonte)</option>
                      </select>
                    </div>

                    {/* PERFIL DO TOMADOR */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300 block">Perfil / Regime do Tomador (Cliente):</label>
                      <select
                        value={tomadorRegime}
                        onChange={(e) => setTomadorRegime(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="pj_privada">Empresa Privada (PJ)</option>
                        <option value="orgao_publico_federal">Órgão Público Federal (IN 1.234/12)</option>
                        <option value="orgao_publico_estadual_municipal">Órgão Público Estadual/Municipal</option>
                        <option value="pf">Pessoa Física (Sem Retenções)</option>
                        <option value="exterior">Cliente no Exterior (Exportação)</option>
                      </select>
                    </div>

                  </div>

                  {/* LOCAIS DO PRESTADOR, TOMADOR E EXECUÇÃO */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
                    
                    {/* CIDADE E UF PRESTADOR */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-indigo-300 block">Prestador (Sede da Empresa):</label>
                      <div className="flex space-x-1.5">
                        <select
                          value={prestadorUf}
                          onChange={(e) => setPrestadorUf(e.target.value)}
                          className="w-20 px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs font-bold"
                        >
                          {BRAZIL_UFS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                        </select>
                        <input
                          type="text"
                          value={prestadorCity}
                          onChange={(e) => setPrestadorCity(e.target.value)}
                          placeholder="Cidade do Prestador"
                          className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs"
                        />
                      </div>
                    </div>

                    {/* CIDADE E UF TOMADOR */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-blue-300 block">Tomador (Sede do Cliente):</label>
                      <div className="flex space-x-1.5">
                        <select
                          value={tomadorUf}
                          onChange={(e) => setTomadorUf(e.target.value)}
                          className="w-20 px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs font-bold"
                        >
                          {BRAZIL_UFS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                        </select>
                        <input
                          type="text"
                          value={tomadorCity}
                          onChange={(e) => setTomadorCity(e.target.value)}
                          placeholder="Cidade do Tomador"
                          className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs"
                        />
                      </div>
                    </div>

                    {/* LOCAL DA PRESTAÇÃO */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-emerald-300 block">Local de Execução do Serviço:</label>
                      <div className="flex space-x-1.5">
                        <select
                          value={localExecucaoType}
                          onChange={(e) => setLocalExecucaoType(e.target.value as any)}
                          className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-[11px] font-bold"
                        >
                          <option value="estabelecimento_prestador">Estabelecimento Prestador ({prestadorCity})</option>
                          <option value="local_tomador_execucao">Local do Tomador / Obra / Execução</option>
                        </select>
                      </div>
                    </div>

                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
                    <div className="flex items-center space-x-2">
                      <label className="text-[11px] text-slate-300 font-semibold">Alíquota ISS Municipal (%):</label>
                      <input
                        type="number"
                        step="0.5"
                        min="2"
                        max="5"
                        value={customIssRate}
                        onChange={(e) => setCustomIssRate(Number(e.target.value))}
                        className="w-20 px-2 py-1 rounded bg-slate-950 border border-slate-700 text-emerald-400 font-mono font-bold text-xs"
                      />
                    </div>

                    <label className="flex items-center space-x-2 text-[11px] text-slate-300 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasCessaoMaoObra}
                        onChange={(e) => setHasCessaoMaoObra(e.target.checked)}
                        className="rounded bg-slate-950 border-slate-700 text-emerald-600 focus:ring-0 cursor-pointer"
                      />
                      <span>Cessão de mão de obra exclusiva / Empreitada (Gera retenção 11% INSS)</span>
                    </label>
                  </div>
                </div>

                {/* ALERTA DE CPOM / RISCO DE BITRIBUTAÇÃO */}
                {serviceCalculation.iss.cpomRiskNotice && (
                  <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/80 text-amber-200 space-y-1">
                    <div className="flex items-center space-x-2 font-bold text-amber-400">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Alerta CPOM / CEPOM Municipal:</span>
                    </div>
                    <p className="text-xs leading-relaxed">
                      {serviceCalculation.iss.cpomRiskNotice}
                    </p>
                  </div>
                )}

                {/* PAINEL DE DISCRIMINAÇÃO DA NOTA FISCAL & RETENÇÕES FEDERAIS */}
                <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center space-x-2">
                      <Receipt className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-slate-200">Demonstrativo de Retenções na Fonte e Códigos DARF:</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-indigo-300">
                      Alíquota Efetiva Retida: {serviceCalculation.effectiveWithholdingRate.toFixed(2)}%
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-200 font-bold">Valor Bruto do Serviço (NFS-e):</span>
                      <span className="font-mono font-bold text-slate-100 text-sm">
                        R$ {serviceCalculation.grossAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* CARDS INDIVIDUAIS DE CADA IMPOSTO E SEU CÓDIGO DARF */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      
                      {/* CARD ISSQN MUNICIPAL */}
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                          <span className="font-bold text-emerald-400 text-xs">ISSQN Municipal ({serviceCalculation.iss.rate}%)</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            serviceCalculation.iss.isWithheld ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}>
                            {serviceCalculation.iss.isWithheld ? 'RETIDO NA FONTE' : 'SEM RETENÇÃO'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-300 flex justify-between">
                          <span>Local do Devido:</span>
                          <strong className="text-slate-100">{serviceCalculation.iss.incidenceLocation}</strong>
                        </div>
                        <div className="text-[11px] text-slate-300 flex justify-between">
                          <span>Recolhimento:</span>
                          <strong className="text-indigo-300">{serviceCalculation.iss.collectorName}</strong>
                        </div>
                        <div className="text-[11px] text-slate-400 leading-snug pt-1 border-t border-slate-800/80">
                          {serviceCalculation.iss.reason}
                        </div>
                      </div>

                      {/* CARD IRRF COM DARF */}
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                          <span className="font-bold text-rose-400 text-xs">IRRF ({serviceCalculation.irrf.rate}%)</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                            DARF {serviceCalculation.irrf.darfCode}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-300 flex justify-between">
                          <span>Valor Retido:</span>
                          <strong className="font-mono text-rose-400">R$ {serviceCalculation.irrf.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                        </div>
                        <div className="text-[10px] text-slate-400 leading-snug pt-1 border-t border-slate-800/80">
                          {serviceCalculation.irrf.reason}
                        </div>
                      </div>

                      {/* CARD CSRF (PIS/COFINS/CSLL 4.65%) COM DARF */}
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                          <span className="font-bold text-blue-400 text-xs">CSRF / PCC (4,65%)</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                            DARF {serviceCalculation.csrf.darfCode}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-300 flex justify-between">
                          <span>Composição (PIS/COFINS/CSLL):</span>
                          <span className="font-mono text-slate-400 text-[10px]">0,65% + 3,0% + 1,0%</span>
                        </div>
                        <div className="text-[11px] text-slate-300 flex justify-between">
                          <span>Valor Retido:</span>
                          <strong className="font-mono text-rose-400">R$ {serviceCalculation.csrf.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                        </div>
                        <div className="text-[10px] text-slate-400 leading-snug pt-1 border-t border-slate-800/80">
                          {serviceCalculation.csrf.reason}
                        </div>
                      </div>

                      {/* CARD INSS COM CÓDIGO GPS/DCTFWEB */}
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                          <span className="font-bold text-purple-400 text-xs">INSS Retenção ({serviceCalculation.inss.rate}%)</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
                            Cód. {serviceCalculation.inss.recolhimentoCode} / DCTFWeb
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-300 flex justify-between">
                          <span>Valor Retido:</span>
                          <strong className="font-mono text-rose-400">R$ {serviceCalculation.inss.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                        </div>
                        <div className="text-[10px] text-slate-400 leading-snug pt-1 border-t border-slate-800/80">
                          {serviceCalculation.inss.reason}
                        </div>
                      </div>

                    </div>

                    {/* DEMONSTRATIVO ÓRGÃOS PÚBLICOS QUANDO APLICÁVEL */}
                    {serviceCalculation.orgaosPublicos && (
                      <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-900/60 text-xs space-y-1">
                        <div className="flex justify-between items-center font-bold text-indigo-300">
                          <span>Retenção Unificada de Órgãos Públicos Federais (IN 1.234/12):</span>
                          <span className="font-mono bg-indigo-900 px-2 py-0.5 rounded text-indigo-200">
                            DARF {serviceCalculation.orgaosPublicos.darfCode} ({serviceCalculation.orgaosPublicos.totalRate}%)
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {serviceCalculation.orgaosPublicos.reason}
                        </p>
                      </div>
                    )}

                    {/* VALOR LÍQUIDO FINAL A SER RECEBIDO NA CONTA */}
                    <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-lg">
                      <div>
                        <span className="text-xs font-bold text-emerald-300 block">(=) VALOR LÍQUIDO A SER RECEBIDO NA CONTA BANCÁRIA:</span>
                        <span className="text-[10px] text-emerald-400">
                          Desconto total das retenções na fonte: <strong className="font-mono">R$ {serviceCalculation.totalWithheld.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                        </span>
                      </div>
                      <span className="font-mono font-black text-2xl text-emerald-300 shrink-0">
                        R$ {serviceCalculation.netAmountReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                  </div>
                </div>

              </div>
            )}

            {/* ABA 1: ISSQN MUNICIPAL */}
            {activeTab === 'iss' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                    <span className="font-bold text-indigo-300 block border-b border-slate-800 pb-1">
                      Local de Incidência do ISS (Art. 3º LC 116/03):
                    </span>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      {selectedService.issRuleExplanation}
                    </p>
                  </div>

                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                    <span className="font-bold text-indigo-300 block border-b border-slate-800 pb-1">
                      Alíquotas Permitidas por Lei:
                    </span>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between text-slate-300">
                        <span>Alíquota Mínima Constitucional:</span>
                        <span className="font-bold font-mono text-emerald-400">{selectedService.issMinRate}%</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Alíquota Máxima Constitucional:</span>
                        <span className="font-bold font-mono text-rose-400">{selectedService.issMaxRate}%</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Alíquota Típica Praticada:</span>
                        <span className="font-bold font-mono text-blue-400">{selectedService.issStandardRate}%</span>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="bg-blue-950/30 p-4 rounded-xl border border-blue-900/60 space-y-2">
                  <div className="flex items-center space-x-2 text-blue-300 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Regras de Retenção Municipal pelo Tomador & CPOM:</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-xs">
                    {selectedService.issWithholdingRule}
                  </p>
                </div>

                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400">Orientação Prática para Emissão da NFS-e:</span>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    {selectedService.practicalAdvice}
                  </p>
                </div>
              </div>
            )}

            {/* ABA 2: RETENÇÕES FEDERAIS */}
            {activeTab === 'retencoes' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* IRRF */}
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span className="font-bold text-rose-300">IRRF (Art. 714 RIR/18)</span>
                      <span className="font-mono font-bold text-rose-400">{selectedService.federalWithholdings.irrfRate}%</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {selectedService.federalWithholdings.irrfLegalBase}
                    </p>
                    <div className="pt-1.5 border-t border-slate-800 text-[10px] text-emerald-300 font-semibold">
                      {selectedService.federalWithholdings.irrfDispensaSimples ? '✅ Dispensado para Simples Nacional (IN 765/07)' : 'Tributação Normal'}
                    </div>
                    <div className="text-[10px] font-mono text-indigo-300">
                      DARF Recomendado: {selectedService.darfCodes?.irrf || '1708'}
                    </div>
                  </div>

                  {/* CSRF 4.65% */}
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span className="font-bold text-indigo-300">CSRF / PCC (4.65%)</span>
                      <span className="font-mono font-bold text-indigo-400">{selectedService.federalWithholdings.csrfRate}%</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {selectedService.federalWithholdings.csrfLegalBase}
                    </p>
                    <div className="pt-1.5 border-t border-slate-800 text-[10px] text-emerald-300 font-semibold">
                      {selectedService.federalWithholdings.csrfDispensaSimples ? '✅ Dispensado para Simples Nacional (Lei 10.833/03)' : 'Tributação Normal'}
                    </div>
                    <div className="text-[10px] font-mono text-indigo-300">
                      DARF Recomendado: {selectedService.darfCodes?.csrf || '5952'}
                    </div>
                  </div>

                  {/* INSS RETENÇÃO 11% */}
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span className="font-bold text-purple-300">INSS Retenção</span>
                      <span className="font-mono font-bold text-purple-400">{selectedService.federalWithholdings.inssWithholdingRate}%</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {selectedService.federalWithholdings.inssLegalBase}
                    </p>
                    <div className="pt-1.5 border-t border-slate-800 text-[10px] font-semibold">
                      {selectedService.federalWithholdings.inssAppliesToSimples ? (
                        <span className="text-rose-400">⚠️ Aplica-se inclusive ao Simples Anexo IV</span>
                      ) : (
                        <span className="text-slate-400">Não aplicável salvo cessão de mão de obra</span>
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-purple-300">
                      Recolhimento: DCTFWeb / Cód {selectedService.darfCodes?.inssGps || '6190'}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ABA 3: SIMPLES NACIONAL & FATOR R */}
            {activeTab === 'simples' && (
              <div className="space-y-4 text-xs">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-indigo-300">Enquadramento no Simples Nacional (LC 123/2006)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-bold">
                      {selectedService.simplesNacional.subjectToFatorR ? 'Sujeito ao Fator R' : `Anexo ${selectedService.simplesNacional.defaultAnexo}`}
                    </span>
                  </div>

                  <p className="text-slate-300 leading-relaxed text-xs">
                    {selectedService.simplesNacional.guidance}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Contribuição Previdenciária Patronal (CPP):</span>
                      <span className={`text-xs font-bold block ${selectedService.simplesNacional.cppInsideDAS ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {selectedService.simplesNacional.cppInsideDAS ? '✅ INCLUSA NO DAS (Sem 20% patronal)' : '⚠️ FORA DO DAS (20% CPP + RAT recolhido na DCTFWeb)'}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Faixa Inicial de Alíquota:</span>
                      <span className="text-xs font-bold text-blue-300 block">
                        {selectedService.simplesNacional.subjectToFatorR
                          ? '6,00% (Anexo III com Fator R ≥ 28%) vs 15,50% (Anexo V)'
                          : selectedService.simplesNacional.defaultAnexo === 'IV'
                          ? '4,50% no DAS (+ 20% patronal na DCTFWeb)'
                          : '6,00% no DAS (Anexo III puro)'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ABA 4: LUCRO PRESUMIDO & REAL */}
            {activeTab === 'presumido' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-bold text-blue-300">Lucro Presumido</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-bold">
                        Presunção {selectedService.lucroPresumido.irpjPresumptionRate}%
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between text-slate-300">
                        <span>Base de Presunção IRPJ (Lei 9.249/95):</span>
                        <span className="font-bold font-mono">{selectedService.lucroPresumido.irpjPresumptionRate}%</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Base de Presunção CSLL:</span>
                        <span className="font-bold font-mono">{selectedService.lucroPresumido.csllPresumptionRate}%</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>PIS Cumulativo:</span>
                        <span className="font-bold font-mono">{selectedService.lucroPresumido.pisRate}%</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>COFINS Cumulativo:</span>
                        <span className="font-bold font-mono">{selectedService.lucroPresumido.cofinsRate}%</span>
                      </div>
                      <div className="flex justify-between text-slate-300 font-bold text-blue-300 pt-1 border-t border-slate-800">
                        <span>Carga Federal Estimada:</span>
                        <span className="font-mono">~{selectedService.lucroPresumido.totalEffectiveTaxApprox}% + ISS</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 pt-1">
                      {selectedService.lucroPresumido.notes}
                    </p>
                  </div>

                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-bold text-purple-300">Lucro Real</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-bold">
                        Não Cumulativo
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between text-slate-300">
                        <span>PIS Não Cumulativo:</span>
                        <span className="font-bold font-mono">1.65%</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>COFINS Não Cumulativo:</span>
                        <span className="font-bold font-mono">7.60%</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>IRPJ e CSLL:</span>
                        <span className="font-bold font-mono">15% + 10% adicional + 9% CSLL</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                      Serviços de informática e desenvolvimento de software podem usufruir de regime cumulativo de PIS/COFINS (0,65% e 3%) mesmo no Lucro Real conforme Art. 10, XIII da Lei nº 10.833/2003.
                    </p>
                  </div>

                </div>
              </div>
            )}

            {/* ABA 5: REFORMA TRIBUTÁRIA (IBS/CBS) */}
            {activeTab === 'reforma' && (
              <div className="space-y-4 text-xs">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span className="font-bold text-slate-200">Impacto da Reforma Tributária (EC 132/2023)</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-bold">
                      Unificação ISS + PIS/COFINS
                    </span>
                  </div>

                  <p className="text-slate-300 leading-relaxed text-xs">
                    {selectedService.reformaTributaria.notes}
                  </p>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-slate-300 block">Alíquota Estimada Conjunta IBS + CBS:</span>
                      <span className="text-[10px] text-slate-500">Substitui integralmente PIS, COFINS e ISS Municipal</span>
                    </div>
                    <span className="text-lg font-mono font-black text-purple-300">
                      {selectedService.reformaTributaria.cbsIbsRate}%
                    </span>
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
