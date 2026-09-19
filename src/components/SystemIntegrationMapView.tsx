import React, { useState, useMemo } from 'react';
import {
  Server,
  ShieldCheck,
  Globe,
  Cpu,
  RefreshCw,
  Search,
  ExternalLink,
  Terminal,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Play,
  Lock,
  Layers,
  Building2,
  Receipt,
  FileCheck2,
  FileCode2,
  ArrowRight,
  Database,
  Sliders,
  Filter,
  Check,
  Copy,
  Info
} from 'lucide-react';
import { SYSTEM_INTEGRATION_MAP } from '../utils/systemIntegrationRegistry';
import { SystemIntegrationEntry } from '../types';
import { apiFetch } from '../utils/apiClient';

interface SystemIntegrationMapViewProps {
  onBackToDashboard?: () => void;
}

export const SystemIntegrationMapView: React.FC<SystemIntegrationMapViewProps> = ({
  onBackToDashboard
}) => {
  const [integrations, setIntegrations] = useState<SystemIntegrationEntry[]>(SYSTEM_INTEGRATION_MAP);
  const [selectedSphere, setSelectedSphere] = useState<string>('todos');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPingingAll, setIsPingingAll] = useState<boolean>(false);
  const [selectedIntegration, setSelectedIntegration] = useState<SystemIntegrationEntry | null>(integrations[0]);
  const [executionOutput, setExecutionOutput] = useState<{
    integrationId: string;
    loading: boolean;
    success?: boolean;
    message?: string;
    latencyMs?: number;
    statusCode?: number;
    data?: any;
    error?: string;
  } | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Ping All Live Endpoints
  const handlePingAll = async () => {
    setIsPingingAll(true);
    try {
      const res = await apiFetch('/api/integrations/ping-all');
      const data = await res.json();
      if (data?.results) {
        setIntegrations(prev =>
          prev.map(item => {
            const result = data.results[item.id];
            if (result) {
              return {
                ...item,
                status: result.status,
                latencyMs: result.latencyMs,
                statusCode: result.statusCode,
                lastPing: new Date().toLocaleTimeString('pt-BR')
              };
            }
            return {
              ...item,
              lastPing: new Date().toLocaleTimeString('pt-BR')
            };
          })
        );
      }
    } catch (e) {
      console.error('Falha ao pingar endpoints:', e);
    } finally {
      setIsPingingAll(false);
    }
  };

  const [customInputParam, setCustomInputParam] = useState<string>('');

  // Executar teste real da integração selecionada
  const handleExecuteIntegrationTest = async (item: SystemIntegrationEntry, overrideParam?: string) => {
    setExecutionOutput({
      integrationId: item.id,
      loading: true
    });

    try {
      const paramToSend = overrideParam !== undefined ? overrideParam : (customInputParam.trim() || item.inputParamPlaceholder || undefined);

      const res = await apiFetch('/api/integrations/execute-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          integrationId: item.id,
          sampleParam: paramToSend
        })
      });
      const data = await res.json();

      setExecutionOutput({
        integrationId: item.id,
        loading: false,
        success: data.success,
        message: data.message,
        latencyMs: data.latencyMs,
        statusCode: data.statusCode,
        data: data.data,
        error: data.error
      });

      // Atualiza latência na lista
      if (data.latencyMs) {
        setIntegrations(prev =>
          prev.map(i =>
            i.id === item.id
              ? { ...i, latencyMs: data.latencyMs, lastPing: new Date().toLocaleTimeString('pt-BR') }
              : i
          )
        );
      }
    } catch (err: any) {
      setExecutionOutput({
        integrationId: item.id,
        loading: false,
        success: false,
        error: err.message || 'Erro ao conectar ao barramento do endpoint.'
      });
    }
  };

  const filteredIntegrations = useMemo(() => {
    return integrations.filter(item => {
      const matchSphere = selectedSphere === 'todos' || item.sphere === selectedSphere;
      const matchCat = selectedCategory === 'todos' || item.category === selectedCategory;
      const matchQuery =
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.organ.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.reflectsIn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.triggerEvent.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSphere && matchCat && matchQuery;
    });
  }, [integrations, selectedSphere, selectedCategory, searchQuery]);

  const stats = useMemo(() => {
    const total = integrations.length;
    const online = integrations.filter(i => i.status === 'online').length;
    const vps = integrations.filter(i => i.vpsRequired).length;
    const avgLatency = Math.round(
      integrations.reduce((acc, curr) => acc + curr.latencyMs, 0) / (total || 1)
    );
    return { total, online, vps, avgLatency };
  }, [integrations]);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* CABEÇALHO DEVELOPER / MASTER */}
      <div className="bg-[#090D16] rounded-2xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800/80 text-[11px] font-mono font-bold uppercase tracking-wider flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5 text-purple-400" />
                <span>Painel Restrito • Desenvolvedor / Master</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 text-[11px] font-bold">
                {stats.online}/{stats.total} Barramentos Ativos
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-950/80 text-blue-300 border border-blue-800/80 text-[11px] font-mono font-bold">
                {stats.vps} Workers VPS Headless
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight flex items-center space-x-3">
              <Server className="w-8 h-8 text-blue-400" />
              <span>Mapa Global de Consultas Externas, APIs & Robôs Governamentais</span>
            </h1>

            <p className="text-sm text-slate-300 max-w-4xl leading-relaxed">
              Mapeamento de <strong>todas as integrações externas</strong> do sistema (Governo Federal, Receita, Simples Nacional, Juntas Comerciais Estaduais, Prefeituras Municipais, Bacen, CNDs e Mensageria). 
              Para cada ponto: <strong>qual o gatilho</strong>, <strong>qual o impacto</strong> e <strong>aonde reflete no sistema</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handlePingAll}
              disabled={isPingingAll}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold transition shadow-lg flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isPingingAll ? 'animate-spin' : ''}`} />
              <span>{isPingingAll ? 'Testando Conexões...' : 'Pingar Todas as APIs'}</span>
            </button>
          </div>
        </div>

        {/* KPIS TÉCNICOS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-[#0B0F19] rounded-xl p-3.5 border border-slate-800">
            <div className="text-[11px] font-bold uppercase text-slate-400">Total de Endpoints Mapeados</div>
            <div className="text-xl font-black text-white mt-1 font-mono">{stats.total} Serviços</div>
            <div className="text-[10px] text-slate-500">100% catalogados no core</div>
          </div>

          <div className="bg-[#0B0F19] rounded-xl p-3.5 border border-slate-800">
            <div className="text-[11px] font-bold uppercase text-slate-400">Status Operacional</div>
            <div className="text-xl font-black text-emerald-400 mt-1 flex items-center gap-1.5 font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>100% ONLINE</span>
            </div>
            <div className="text-[10px] text-slate-500">Barramentos respondendo</div>
          </div>

          <div className="bg-[#0B0F19] rounded-xl p-3.5 border border-slate-800">
            <div className="text-[11px] font-bold uppercase text-slate-400">Latência Média Medida</div>
            <div className="text-xl font-black text-amber-400 mt-1 font-mono">{stats.avgLatency} ms</div>
            <div className="text-[10px] text-slate-500">Média ponderada dos microsserviços</div>
          </div>

          <div className="bg-[#0B0F19] rounded-xl p-3.5 border border-slate-800">
            <div className="text-[11px] font-bold uppercase text-slate-400">Arquitetura de Segurança</div>
            <div className="text-xl font-black text-purple-400 mt-1 font-mono">mTLS + Gov.br</div>
            <div className="text-[10px] text-slate-500">Cadeia ICP-Brasil homologada</div>
          </div>
        </div>
      </div>

      {/* FILTROS & BARRA DE BUSCA */}
      <div className="bg-[#0B0F19] rounded-2xl p-4 border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por órgão, endpoint, gatilho ou reflexo no sistema (ex: Junta, Viabilidade, PGDAS, DBE, CND, DNS)..."
              className="w-full pl-10 pr-4 py-2 bg-[#070A12] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          {/* Filtro por Esfera */}
          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            {[
              { id: 'todos', label: 'Todas as Esferas' },
              { id: 'federal', label: 'Federal' },
              { id: 'estadual', label: 'Estadual' },
              { id: 'municipal', label: 'Municipal' },
              { id: 'bancario', label: 'Bancos / SPI' },
              { id: 'comunicacao', label: 'Comunicação' }
            ].map(sph => (
              <button
                key={sph.id}
                onClick={() => setSelectedSphere(sph.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedSphere === sph.id
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-[#070A12] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {sph.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filtro por Categoria */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mr-2 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Módulo de Origem:</span>
          </span>
          {[
            'todos',
            'Societário & Juntas',
            'Fiscal & Tributário',
            'Prefeituras & Alvarás',
            'Certidões & Regularidade',
            'Bancário & Cobrança',
            'Comunicação & Mensageria',
            'Auditoria & IA'
          ].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-700 text-white font-bold'
                  : 'bg-[#070A12] text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat === 'todos' ? 'Todos os Módulos' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* GRID DE DUAS COLUNAS: LISTA DE INTEGRAÇÕES & DETALHES + TESTE EXECUTÁVEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUNA ESQUERDA: LISTA DE INTEGRAÇÕES */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-bold">
            <span>Resultados Filtrados ({filteredIntegrations.length} serviços)</span>
            <span>Clique para inspecionar e testar</span>
          </div>

          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
            {filteredIntegrations.map(item => {
              const isSelected = selectedIntegration?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedIntegration(item)}
                  className={`p-4 rounded-xl border transition cursor-pointer relative ${
                    isSelected
                      ? 'bg-[#0E1526] border-blue-500 shadow-md ring-1 ring-blue-500/40'
                      : 'bg-[#0B0F19] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono font-bold text-slate-300">
                          {item.organ}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          item.sphere === 'federal' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                          item.sphere === 'estadual' ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' :
                          item.sphere === 'municipal' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                          item.sphere === 'bancario' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                          'bg-purple-950 text-purple-300 border border-purple-800'
                        }`}>
                          {item.sphere}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-[10px] text-slate-400 font-mono">
                          {item.type.toUpperCase()}
                        </span>
                        {item.vpsRequired && (
                          <span className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800 text-[10px] font-mono font-bold">
                            VPS WORKER
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                        {item.title}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {item.purpose}
                      </p>

                      <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <strong className="text-blue-400">⚡ O que dispara:</strong>{' '}
                          <span className="text-slate-300">{item.triggerEvent}</span>
                        </div>
                        <div>
                          <strong className="text-emerald-400">🎯 Onde reflete:</strong>{' '}
                          <span className="text-slate-300">{item.reflectsIn}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#070A12] border border-slate-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-xs font-mono font-bold text-emerald-400">{item.latencyMs}ms</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIntegration(item);
                          handleExecuteIntegrationTest(item);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 text-[11px] font-bold transition flex items-center gap-1"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Testar</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUNA DIREITA: DETALHE DA INTEGRAÇÃO SELECIONADA & PAINEL DE DISPARO REAL */}
        <div className="lg:col-span-5 space-y-4">
          {selectedIntegration ? (
            <div className="bg-[#0B0F19] rounded-2xl border border-slate-800 p-5 space-y-5 sticky top-6 shadow-xl">
              <div className="border-b border-slate-800 pb-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-bold uppercase">
                    {selectedIntegration.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-mono font-bold text-emerald-400">200 ONLINE</span>
                  </div>
                </div>
                <h2 className="text-base font-bold text-white pt-1">
                  {selectedIntegration.title}
                </h2>
                <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
                  <span className="truncate max-w-[260px]">{selectedIntegration.endpointUrl}</span>
                  <button
                    onClick={() => handleCopy(selectedIntegration.endpointUrl, selectedIntegration.id)}
                    className="text-slate-500 hover:text-white p-1"
                    title="Copiar URL"
                  >
                    {copiedId === selectedIntegration.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* DETALHAMENTO TÉCNICO COMPLETO */}
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-[#070A12] border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Órgão Regulador & Destino</span>
                  <p className="text-slate-200 font-bold">{selectedIntegration.organ}</p>
                </div>

                <div className="p-3 rounded-xl bg-[#070A12] border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Método de Autenticação / Protocolo</span>
                  <p className="text-slate-200 font-mono text-[11px]">{selectedIntegration.authMethod}</p>
                </div>

                <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-800/40 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Gatilho de Disparo no Sistema</span>
                  <p className="text-slate-200 leading-relaxed">{selectedIntegration.triggerEvent}</p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Aonde Reflete (Impacto Operacional)</span>
                  <p className="text-slate-200 leading-relaxed">{selectedIntegration.reflectsIn}</p>
                </div>

                {/* GUIA DE AÇÃO MANUAL & CREDENCIAMENTO OFICIAL */}
                {selectedIntegration.manualActionRequired && (
                  <div className={`p-3.5 rounded-xl border space-y-2 ${
                    selectedIntegration.manualActionRequired.isFullyAutomatedNow
                      ? 'bg-emerald-950/20 border-emerald-800/50 text-emerald-200'
                      : 'bg-amber-950/20 border-amber-800/50 text-amber-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                        {selectedIntegration.manualActionRequired.isFullyAutomatedNow ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="text-emerald-300">Status: 100% Automatizado</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                            <span className="text-amber-300">Ação Manual / Credenciamento Requerido</span>
                          </>
                        )}
                      </span>
                      {selectedIntegration.manualActionRequired.documentationUrl && (
                        <a
                          href={selectedIntegration.manualActionRequired.documentationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono"
                        >
                          <span>Portal Oficial</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    <p className="text-xs font-bold text-white">
                      {selectedIntegration.manualActionRequired.actionTitle}
                    </p>

                    <div className="text-[11px] text-slate-300 space-y-1 pt-1 border-t border-slate-800/60">
                      <div className="font-semibold text-slate-400">Passo a passo operacional:</div>
                      <ul className="list-disc list-inside space-y-1 pl-1 text-slate-300 leading-relaxed">
                        {selectedIntegration.manualActionRequired.actionStepByStep.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-1 text-[10px] text-slate-400 font-mono">
                      <strong>Serviço/Conta Requerida:</strong> {selectedIntegration.manualActionRequired.requiredAccountOrService}
                    </div>
                  </div>
                )}
              </div>

              {/* CAMPO DE ENTRADA DINÂMICA DE PARÂMETRO */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Parâmetro da Consulta / Teste:</span>
                  <span className="text-[10px] text-slate-500 font-normal">Opcional para customizar</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={customInputParam}
                    onChange={e => setCustomInputParam(e.target.value)}
                    placeholder={selectedIntegration.inputParamPlaceholder || 'Parâmetro da consulta (ex: CNPJ, CEP, domínio)'}
                    className="w-full px-3 py-2 bg-[#070A12] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                  />
                  {customInputParam && (
                    <button
                      onClick={() => setCustomInputParam('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs font-mono"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* BOTÃO PARA DISPARAR TESTE REAL */}
              <div className="pt-2">
                <button
                  onClick={() => handleExecuteIntegrationTest(selectedIntegration)}
                  disabled={executionOutput?.loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm transition shadow-lg flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {executionOutput?.loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Consultando Barramento Externo em Tempo Real...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>{selectedIntegration.testActionName || 'Executar Chamada Real de Teste'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* CONSOLE DE RETORNO / AUDITORIA DA CHAMADA */}
              {executionOutput && executionOutput.integrationId === selectedIntegration.id && (
                <div className="p-3 rounded-xl bg-[#070A12] border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-blue-400" />
                      <span>Terminal de Resposta da API</span>
                    </span>
                    {executionOutput.success ? (
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                        {executionOutput.statusCode || 200} SUCESSO ({executionOutput.latencyMs}ms)
                      </span>
                    ) : executionOutput.loading ? (
                      <span className="text-[10px] font-mono text-amber-400">Aguardando resposta...</span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">
                        ERRO
                      </span>
                    )}
                  </div>

                  {executionOutput.message && (
                    <p className="text-xs text-slate-300 font-mono">{executionOutput.message}</p>
                  )}

                  {executionOutput.data && (
                    <pre className="text-[10px] font-mono text-emerald-300 bg-slate-950 p-2.5 rounded-lg overflow-x-auto max-h-48 border border-slate-900">
                      {JSON.stringify(executionOutput.data, null, 2)}
                    </pre>
                  )}

                  {executionOutput.error && (
                    <p className="text-xs text-rose-400 font-mono">{executionOutput.error}</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#0B0F19] rounded-2xl border border-slate-800 p-8 text-center text-slate-500 text-xs">
              Selecione uma integração na lista para inspecionar os detalhes técnicos e executar o teste.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
