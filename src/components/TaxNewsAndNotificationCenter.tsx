import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Sparkles, 
  ShieldCheck, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  X, 
  FileText,
  TrendingUp,
  Scale,
  Check,
  Bot,
  Globe,
  Radio,
  Terminal,
  Plus,
  Trash2,
  Power,
  Search,
  Activity,
  ArrowUpRight,
  Zap,
  Calculator,
  Percent,
  Sliders,
  Layers,
  ChevronRight,
  Copy,
  Share2
} from 'lucide-react';
import { 
  taxCrawlerEngine, 
  TaxNewsItem, 
  CrawlerBotSource, 
  CrawlerLogEntry,
  copyTaxNewsToClipboard 
} from '../utils/taxCrawlerEngine';
import { getSyncStatus } from '../utils/taxAutoSync';
import { dynamicTaxRulesEngine, DynamicTaxRuleParameter } from '../utils/dynamicTaxRulesEngine';
import { TaxImpactRuleModal } from './TaxImpactRuleModal';

interface TaxNewsAndNotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string) => void;
}

export const TaxNewsAndNotificationCenter: React.FC<TaxNewsAndNotificationCenterProps> = ({
  isOpen,
  onClose,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'notificacoes' | 'regras' | 'robos' | 'logs'>('notificacoes');
  const [newsList, setNewsList] = useState<TaxNewsItem[]>(taxCrawlerEngine.getNews());
  const [sources, setSources] = useState<CrawlerBotSource[]>(taxCrawlerEngine.getSources());
  const [logs, setLogs] = useState<CrawlerLogEntry[]>(taxCrawlerEngine.getLogs());
  const [dynamicRules, setDynamicRules] = useState<DynamicTaxRuleParameter[]>(dynamicTaxRulesEngine.getAllRules());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<{ currentBot: string; percent: number; statusText: string } | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedNewsId, setCopiedNewsId] = useState<string | null>(null);

  // Modal de Detalhes de Impacto e Fórmulas
  const [selectedNewsForModal, setSelectedNewsForModal] = useState<TaxNewsItem | null>(null);

  // Formulário de Nova Fonte
  const [isAddingSource, setIsAddingSource] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [newSourceCategory, setNewSourceCategory] = useState<CrawlerBotSource['category']>('Custom');
  const [newSourceDesc, setNewSourceDesc] = useState('');

  const syncStatus = getSyncStatus();

  const handleCopyNews = async (item: TaxNewsItem) => {
    const success = await copyTaxNewsToClipboard(item);
    if (success) {
      setCopiedNewsId(item.id);
      showToast(`Notícia copiada! O link oficial já está incluso no assunto.`);
      setTimeout(() => {
        setCopiedNewsId(prev => (prev === item.id ? null : prev));
      }, 3000);
    } else {
      showToast('Não foi possível copiar para a área de transferência.');
    }
  };

  useEffect(() => {
    if (isOpen) {
      setNewsList(taxCrawlerEngine.getNews());
      setSources(taxCrawlerEngine.getSources());
      setLogs(taxCrawlerEngine.getLogs());
      setDynamicRules(dynamicTaxRulesEngine.getAllRules());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRunSync = async () => {
    setIsSyncing(true);
    setSyncProgress({ currentBot: 'Inicializando robôs...', percent: 5, statusText: 'Conectando ao barramento de varredura...' });
    
    const result = await taxCrawlerEngine.executeFullCrawlerSweep((progress) => {
      setSyncProgress(progress);
    });

    setIsSyncing(false);
    setSyncProgress(null);
    setNewsList(taxCrawlerEngine.getNews());
    setSources([...taxCrawlerEngine.getSources()]);
    setLogs([...taxCrawlerEngine.getLogs()]);
    setDynamicRules(dynamicTaxRulesEngine.getAllRules());

    if (result.success) {
      showToast(result.message);
    }
  };

  const handleApplyAllRulesGlobal = () => {
    const res = dynamicTaxRulesEngine.applyAllRulesToEntirePlatform();
    setDynamicRules([...dynamicTaxRulesEngine.getAllRules()]);
    showToast(res.message);
  };

  const handleApplySingleRule = (ruleId: string) => {
    const res = dynamicTaxRulesEngine.applyRule(ruleId);
    setDynamicRules([...dynamicTaxRulesEngine.getAllRules()]);
    showToast(res.message);
  };

  const handleMarkAsRead = (id: string) => {
    taxCrawlerEngine.markAsRead(id);
    setNewsList([...taxCrawlerEngine.getNews()]);
    showToast('Notificação marcada como lida.');
  };

  const handleMarkAllAsRead = () => {
    taxCrawlerEngine.markAllAsRead();
    setNewsList([...taxCrawlerEngine.getNews()]);
    showToast('Todas as notificações foram marcadas como lidas.');
  };

  const handleToggleSource = (id: string) => {
    taxCrawlerEngine.toggleSourceEnabled(id);
    setSources([...taxCrawlerEngine.getSources()]);
    showToast('Status do robô atualizado.');
  };

  const handleCreateSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceName.trim() || !newSourceUrl.trim()) {
      showToast('Preencha o nome e a URL da fonte oficial.');
      return;
    }

    taxCrawlerEngine.addCustomSource({
      name: newSourceName.trim(),
      url: newSourceUrl.trim(),
      targetEndpoint: newSourceUrl.trim(),
      category: newSourceCategory,
      feedType: 'GOV_PORTAL',
      checkIntervalMinutes: 30,
      enabled: true,
      description: newSourceDesc.trim() || 'Fonte governamental personalizada para rastreamento de atos fiscais.',
    });

    setSources([...taxCrawlerEngine.getSources()]);
    setLogs([...taxCrawlerEngine.getLogs()]);
    setIsAddingSource(false);
    setNewSourceName('');
    setNewSourceUrl('');
    setNewSourceDesc('');
    showToast(`Robô vinculado à fonte ${newSourceName} com sucesso!`);
  };

  const handleRemoveSource = (id: string, name: string) => {
    taxCrawlerEngine.removeSource(id);
    setSources([...taxCrawlerEngine.getSources()]);
    showToast(`Robô da fonte ${name} removido.`);
  };

  const filteredNews = newsList.filter(item => {
    const matchesCategory = activeCategory === 'todos' || item.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.source.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const unreadCount = newsList.filter(n => !n.read).length;
  const activeBotsCount = sources.filter(s => s.enabled).length;

  return (
    <>
      <div data-lenis-prevent className="fixed inset-0 z-50 w-screen h-screen bg-[#070B14] flex flex-col overflow-hidden animate-fade-in">
        <div data-lenis-prevent className="relative w-full h-full bg-[#0B101D] border border-slate-800 flex flex-col overflow-hidden min-h-0">
          
          {/* Header Principal */}
          <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#080C16]">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <span>Central de Notificações & Robôs de Varredura</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono border border-emerald-500/30">
                    {activeBotsCount} Robôs Ativos
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Rastreamento contínuo no DOU, RFB, CGSN, CONFAZ, ADN NFS-e e Jurisprudência do STJ
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleApplyAllRulesGlobal}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-md hover:scale-105"
                title="Aplicar Todas as Novas Fórmulas e Regras em Toda a Plataforma"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Atualizar Plataforma</span>
              </button>

              <button
                onClick={handleRunSync}
                disabled={isSyncing}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 shadow-md hover:scale-105"
                title="Executar Varredura Geral em Todos os Sites e Robôs Vinculados"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Varrendo...' : 'Varredura Geral'}</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Banner Prominente de Atualização Global de Fórmulas e Entendimentos */}
          <div className="shrink-0 px-6 py-2.5 bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-slate-950 border-b border-blue-800/40 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2 text-slate-200">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>
                <strong className="text-white">Motores Tributários Vértice: </strong>
                Regras e Fórmulas da LC 123/06, EC 132/23, PLP 68/24 e Tema 1.125 STJ sincronizadas.
              </span>
            </div>
            <button
              onClick={handleApplyAllRulesGlobal}
              className="px-3 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/50 text-cyan-300 hover:text-white text-[11px] font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              <Calculator className="w-3.5 h-3.5 text-cyan-400" />
              <span>Recalibrar Fórmulas da Plataforma</span>
            </button>
          </div>

          {/* Barra de Progresso da Varredura ao Vivo */}
          {isSyncing && syncProgress && (
            <div className="shrink-0 px-6 py-2.5 bg-blue-950/40 border-b border-blue-800/60 flex flex-col space-y-1.5 animate-fadeIn">
              <div className="flex items-center justify-between text-xs text-blue-300">
                <span className="font-semibold flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 animate-bounce text-cyan-400" />
                  {syncProgress.statusText}
                </span>
                <span className="font-mono text-cyan-400 font-bold">{syncProgress.percent}%</span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${syncProgress.percent}%` }}
                />
              </div>
            </div>
          )}

          {/* Abas de Navegação */}
          <div className="shrink-0 px-6 py-2 bg-[#090E1A] border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveTab('notificacoes')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'notificacoes'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Notificações & Atos ({newsList.length})</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-mono">
                    {unreadCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('regras')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'regras'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Fórmulas & Alíquotas Recalibradas ({dynamicRules.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('robos')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'robos'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Sites & Robôs Vinculados ({sources.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('logs')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'logs'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Terminal de Logs</span>
              </button>
            </div>

            <div className="hidden lg:flex items-center space-x-3 text-slate-400 text-[11px] whitespace-nowrap">
              <span>Última Varredura: <strong className="text-slate-200">{syncStatus.lastSyncTime}</strong></span>
            </div>
          </div>

          {/* CONTEÚDO DA ABA NOTIFICAÇÕES */}
          {activeTab === 'notificacoes' && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Filtros e Busca */}
              <div className="shrink-0 px-6 py-3 bg-[#0B101D] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { id: 'todos', label: 'Todas' },
                    { id: 'legislacao', label: 'DOU / Legislação' },
                    { id: 'simplesnacional', label: 'Simples Nacional' },
                    { id: 'reformatributaria', label: 'Reforma Tributária' },
                    { id: 'stj', label: 'STJ Jurisprudência' },
                    { id: 'nfse', label: 'NFS-e ADN' },
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                        activeCategory === cat.id
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar ato ou norma..."
                      className="pl-8 pr-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-blue-500 w-44"
                    />
                  </div>

                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-blue-400 hover:text-blue-300 underline cursor-pointer whitespace-nowrap"
                    >
                      Marcar todas lidas ({unreadCount})
                    </button>
                  )}
                </div>
              </div>

              {/* Lista de Notificações Capturadas em Grid Horizontal com Rolagem por Scroll do Mouse */}
              <div 
                data-lenis-prevent
                tabIndex={0}
                onWheel={(e) => {
                  e.currentTarget.scrollTop += e.deltaY;
                }}
                className="flex-1 min-h-0 overflow-y-auto p-6 custom-scrollbar overscroll-contain focus:outline-hidden"
              >
                {filteredNews.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 space-y-3">
                    <Bot className="w-10 h-10 mx-auto text-slate-600" />
                    <p className="text-sm">Nenhuma notificação encontrada com os filtros atuais.</p>
                    <button
                      onClick={handleRunSync}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition inline-flex items-center gap-2"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Disparar Varredura nos Sites Agora</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 pb-14">
                    {filteredNews.map(item => (
                    <div 
                      key={item.id}
                      className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                        item.read 
                          ? 'bg-[#080C16]/60 border-slate-800/80 text-slate-300' 
                          : 'bg-[#0E1629] border-blue-900/60 text-white shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            item.impactLevel === 'Crítico' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                            item.impactLevel === 'Médio' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                            'bg-slate-800 text-slate-300'
                          }`}>
                            Impacto {item.impactLevel}
                          </span>
                          <span className="text-xs font-mono text-slate-400">{item.date}</span>
                          {item.officialDocNumber && (
                            <span className="text-xs font-mono text-cyan-400 font-semibold bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/50">
                              {item.officialDocNumber}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center flex-wrap gap-2">
                          {/* Botão de Copiar Notícia com Link Direto no Assunto */}
                          <button
                            onClick={() => handleCopyNews(item)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center space-x-1.5 border cursor-pointer ${
                              copiedNewsId === item.id
                                ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                                : 'bg-indigo-950/70 hover:bg-indigo-600 text-indigo-200 hover:text-white border-indigo-700/60'
                            }`}
                            title="Copiar Notícia Completa com Link Oficial no Assunto"
                          >
                            {copiedNewsId === item.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-white" />
                                <span>Copiado com Link!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-indigo-300" />
                                <span>Copiar c/ Link</span>
                              </>
                            )}
                          </button>

                          {/* Botão de Resumo Visual & Fórmulas */}
                          <button
                            onClick={() => setSelectedNewsForModal(item)}
                            className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white text-[11px] font-bold transition flex items-center space-x-1 border border-blue-500/40 cursor-pointer"
                            title="Ver Síntese Visual de Fórmulas e Alíquotas Alteradas"
                          >
                            <Sparkles className="w-3 h-3 text-cyan-300" />
                            <span>Resumo de Impacto & Fórmulas</span>
                          </button>

                          {item.sourceUrl && (
                            <a
                              href={item.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-medium transition flex items-center space-x-1 border border-slate-800"
                              title="Abrir Fonte Oficial no Navegador"
                            >
                              <span>Ver no Portal</span>
                              <ArrowUpRight className="w-3 h-3 text-cyan-400" />
                            </a>
                          )}

                          {!item.read && (
                            <button
                              onClick={() => handleMarkAsRead(item.id)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition flex items-center space-x-1 cursor-pointer"
                              title="Marcar como lida"
                            >
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>Marcar lida</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="mb-2">
                        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                          {!item.read && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0"></span>}
                          {item.sourceUrl ? (
                            <a 
                              href={item.sourceUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="hover:text-cyan-300 transition inline-flex items-center gap-1.5 group"
                              title="Clique para acessar a publicação oficial na íntegra"
                            >
                              <span className="group-hover:underline">{item.title}</span>
                              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 shrink-0" />
                            </a>
                          ) : (
                            <span>{item.title}</span>
                          )}
                        </h3>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed mb-3">
                        {item.summary}
                      </p>

                      {/* Mini Card de Fórmula e Impacto Rápido */}
                      {item.visualSummary && (
                        <div className="mb-3 p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                          <div className="flex items-center gap-2 text-cyan-300 font-semibold">
                            <Scale className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span><strong>Fórmula Recalibrada: </strong><code className="text-emerald-300 font-mono text-[10.5px]">{item.visualSummary.beforeVsAfter.formulaAfter}</code></span>
                          </div>
                          <button
                            onClick={() => setSelectedNewsForModal(item)}
                            className="text-blue-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <span>Detalhar Fórmulas</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                        <div className="flex items-center flex-wrap gap-2">
                          <span>Fonte: <strong className="text-slate-200">{item.source}</strong></span>
                          {item.applicableModules && item.applicableModules.length > 0 && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              • Aplica-se a: {item.applicableModules.join(', ')}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleCopyNews(item)}
                            className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer font-medium"
                            title="Copiar notícia com link oficial no assunto"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedNewsId === item.id ? 'Copiado!' : 'Copiar c/ Link'}</span>
                          </button>
                          <div className="flex items-center space-x-1 text-emerald-400 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Auditado pelos Motores Vértice</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

          {/* CONTEÚDO DA ABA FÓRMULAS & ALÍQUOTAS RECALIBRADAS */}
          {activeTab === 'regras' && (
            <div data-lenis-prevent className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6 custom-scrollbar overscroll-contain">
              
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900 border border-blue-900/50">
                <div className="space-y-1 max-w-xl">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-cyan-400" />
                    <span>Quadro de Parâmetros, Alíquotas e Fórmulas Vivas da Plataforma</span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Todas as fórmulas abaixo foram calibradas com base nos atos oficiais do DOU, Resoluções do CGSN, Instruções da Receita Federal e Decisões Vinculantes do STJ.
                  </p>
                </div>

                <button
                  onClick={handleApplyAllRulesGlobal}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg hover:scale-105"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Forçar Aplicação em Todos os Módulos</span>
                </button>
              </div>

              {/* Lista Detalhada de Regras e Fórmulas */}
              <div className="space-y-4">
                {dynamicRules.map(rule => (
                  <div
                    key={rule.id}
                    className="p-5 rounded-xl bg-[#090E1A] border border-slate-800 hover:border-slate-700 transition space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800/60 uppercase">
                            {rule.category}
                          </span>
                          <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-950/40 px-2 py-0.5 rounded">
                            {rule.code}
                          </span>
                          <span className="text-xs font-mono text-slate-400">
                            Atualizado em: {rule.lastUpdated}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white">{rule.name}</h4>
                        <p className="text-xs text-slate-400">
                          Base Legal: <strong className="text-slate-300">{rule.legalSource}</strong> ({rule.officialDoc})
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Aplicada nos Motores</span>
                        </span>
                        <button
                          onClick={() => handleApplySingleRule(rule.id)}
                          className="px-3 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white text-xs font-bold transition border border-blue-500/40 cursor-pointer"
                          title="Reaplicar esta fórmula aos cálculos da empresa ativa"
                        >
                          Reaplicar
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {rule.impactDescription}
                    </p>

                    {/* Comparativo de Fórmulas Antes / Depois */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-950 font-mono text-[11px] text-rose-300">
                        <div className="text-[9px] text-rose-400/80 font-sans uppercase font-bold mb-1">Antes da Atualização:</div>
                        <div className="mb-1 text-slate-400 text-[10.5px] font-sans">{rule.oldValueText}</div>
                        <code>{rule.calculationFormulaBefore}</code>
                      </div>

                      <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-950 font-mono text-[11px] text-emerald-300">
                        <div className="text-[9px] text-emerald-400 font-sans uppercase font-bold mb-1">Depois (Fórmula Ativa no Vértice):</div>
                        <div className="mb-1 text-slate-200 text-[10.5px] font-sans font-medium">{rule.newValueText}</div>
                        <code>{rule.calculationFormulaAfter}</code>
                      </div>
                    </div>

                    {/* Módulos Afetados */}
                    <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Módulos Recalibrados:</span>
                        <div className="flex flex-wrap gap-1">
                          {rule.affectedModules.map((m, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-slate-900 rounded text-slate-300 text-[10px] font-semibold border border-slate-800">
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          )}

          {/* CONTEÚDO DA ABA SITES & ROBÔS VINCULADOS */}
          {activeTab === 'robos' && (
            <div data-lenis-prevent className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6 custom-scrollbar overscroll-contain">
              
              {/* Cabeçalho da Aba com Ação de Adicionar Fonte */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-blue-950/20 border border-blue-900/40">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Bot className="w-4 h-4 text-cyan-400" />
                    <span>Gerenciador de Portais Governamentais & Crawlers</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Os robôs executam varreduras a cada 15-30 minutos para identificar novas normas tributárias, resoluções e convênios.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddingSource(!isAddingSource)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Vincular Novo Portal / URL</span>
                </button>
              </div>

              {/* Formulário de Adicionar Nova Fonte */}
              {isAddingSource && (
                <form onSubmit={handleCreateSource} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Cadastrar Nova URL para Varredura</h4>
                    <button 
                      type="button" 
                      onClick={() => setIsAddingSource(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Nome do Portal / Órgão</label>
                      <input 
                        type="text"
                        value={newSourceName}
                        onChange={(e) => setNewSourceName(e.target.value)}
                        placeholder="Ex: SEFAZ SP - Portarias CAT"
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Categoria Tributária</label>
                      <select
                        value={newSourceCategory}
                        onChange={(e) => setNewSourceCategory(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-blue-500"
                      >
                        <option value="DOU">Diário Oficial (DOU / DOE)</option>
                        <option value="RFB">Receita Federal (RFB)</option>
                        <option value="SimplesNacional">Simples Nacional / CGSN</option>
                        <option value="ReformaTributaria">Reforma Tributária (IVA Dual)</option>
                        <option value="CONFAZ">CONFAZ / ICMS</option>
                        <option value="NFSe">Portal NFS-e</option>
                        <option value="STJ">STJ / Tribunais</option>
                        <option value="Custom">Outra Fonte Personalizada</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">URL Completa do Portal ou Feed de Notícias</label>
                      <input 
                        type="url"
                        value={newSourceUrl}
                        onChange={(e) => setNewSourceUrl(e.target.value)}
                        placeholder="https://exemplo.gov.br/noticias-fiscais"
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-blue-500"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Instruções de Rastreamento (Opcional)</label>
                      <input 
                        type="text"
                        value={newSourceDesc}
                        onChange={(e) => setNewSourceDesc(e.target.value)}
                        placeholder="Ex: Monitorar alterações de alíquota e comunicados de substituição tributária."
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingSource(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer"
                    >
                      Salvar e Ativar Robô
                    </button>
                  </div>
                </form>
              )}

              {/* Grid de Robôs Conectados */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sources.map(source => (
                  <div
                    key={source.id}
                    className={`p-4 rounded-xl border transition flex flex-col justify-between space-y-3 ${
                      source.enabled 
                        ? 'bg-[#090E1A] border-slate-800 hover:border-slate-700' 
                        : 'bg-slate-950/50 border-slate-900 opacity-60'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${
                            source.status === 'scanning' ? 'bg-cyan-400 animate-ping' :
                            source.enabled ? 'bg-emerald-500' : 'bg-slate-600'
                          }`} />
                          <h4 className="text-xs font-bold text-white">{source.name}</h4>
                        </div>

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleToggleSource(source.id)}
                            className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                              source.enabled 
                                ? 'text-emerald-400 hover:bg-emerald-950/50' 
                                : 'text-slate-500 hover:bg-slate-800'
                            }`}
                            title={source.enabled ? 'Desativar Robô' : 'Ativar Robô'}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                          {source.category === 'Custom' && (
                            <button
                              onClick={() => handleRemoveSource(source.id, source.name)}
                              className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/50 text-xs transition cursor-pointer"
                              title="Remover Fonte"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        {source.description}
                      </p>

                      <div className="text-[10px] font-mono text-cyan-400 truncate flex items-center gap-1">
                        <Globe className="w-3 h-3 shrink-0" />
                        <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {source.url}
                        </a>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>Intervalo: <strong>{source.checkIntervalMinutes} min</strong></span>
                      <span>Latência: <strong className="text-emerald-400">{source.latencyMs}ms</strong></span>
                      <span>Atos: <strong className="text-white">{source.totalArticlesFound}</strong></span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* CONTEÚDO DA ABA LOGS DE EXECUÇÃO */}
          {activeTab === 'logs' && (
            <div className="flex-1 flex flex-col p-6 overflow-hidden min-h-0">
              <div className="shrink-0 flex items-center justify-between mb-3 text-xs text-slate-400">
                <span className="font-mono flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  Terminal do Rastreador Fiscal (Live Crawler Logs)
                </span>
                <span>{logs.length} eventos registrados</span>
              </div>

              <div data-lenis-prevent className="flex-1 min-h-0 bg-slate-950 rounded-xl p-4 font-mono text-[11px] overflow-y-auto border border-slate-800 space-y-2 custom-scrollbar overscroll-contain">
                {logs.map(log => (
                  <div key={log.id} className="flex items-start space-x-3 border-b border-slate-900/80 pb-1.5">
                    <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                    <span className={`px-1.5 rounded text-[9px] font-bold uppercase shrink-0 ${
                      log.level === 'success' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50' :
                      log.level === 'warn' ? 'bg-amber-950 text-amber-400' :
                      log.level === 'error' ? 'bg-rose-950 text-rose-400' :
                      'bg-blue-950 text-blue-400'
                    }`}>
                      {log.level}
                    </span>
                    <span className="text-cyan-300 font-bold shrink-0">{log.sourceName}:</span>
                    <span className="text-slate-300 flex-1">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="shrink-0 px-6 py-3 bg-[#080C16] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Motores Vértice sincronizados com LC 123/06, EC 132/23 e ADN da NFS-e.</span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition cursor-pointer"
            >
              Fechar Central
            </button>
          </div>

        </div>
      </div>

      {/* Modal Rico de Síntese Visual de Impacto & Fórmulas */}
      <TaxImpactRuleModal
        item={selectedNewsForModal}
        isOpen={!!selectedNewsForModal}
        onClose={() => setSelectedNewsForModal(null)}
        showToast={showToast}
        onApplySuccess={() => {
          setDynamicRules([...dynamicTaxRulesEngine.getAllRules()]);
        }}
      />
    </>
  );
};
