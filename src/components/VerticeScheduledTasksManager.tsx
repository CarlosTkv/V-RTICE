import React, { useState } from 'react';
import { 
  Clock, 
  Calendar, 
  Play, 
  Pause, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Server, 
  Database, 
  Layers, 
  Settings, 
  ShieldCheck, 
  Building2, 
  FileText, 
  ExternalLink,
  Zap,
  Check,
  Edit2,
  Trash2,
  Bell
} from 'lucide-react';
import { CompanyData } from '../types';

export interface CentralizerTask {
  id: string;
  name: string;
  serviceType: 'SEFAZ_NFE' | 'ABRASF_NFSE' | 'SEFAZ_CTE' | 'SEFAZ_NFCE';
  description: string;
  endpoint: string;
  intervalType: 'horario' | 'diario' | 'semanal' | 'tempo_real';
  intervalValue: string; // '1h', '6h', '03:00', 'Segunda 06:00', '30s'
  status: 'ativo' | 'pausado' | 'executando' | 'erro';
  lastRun: string;
  nextRun: string;
  ultNSU: string;
  maxNSU: string;
  docsFetchedLastRun: number;
  successRate: number;
  autoDanfeGenerate: boolean;
  autoManifest: boolean;
}

interface VerticeScheduledTasksManagerProps {
  currentCompany: CompanyData;
  showToast: (text: string, type?: 'success' | 'info' | 'error') => void;
  onTriggerSyncNow?: (serviceId: string) => void;
}

export const VerticeScheduledTasksManager: React.FC<VerticeScheduledTasksManagerProps> = ({
  currentCompany,
  showToast,
  onTriggerSyncNow
}) => {
  const [tasks, setTasks] = useState<CentralizerTask[]>([
    {
      id: 'task-nfe-sefaz',
      name: 'SEFAZ-AN • Distribuição DFe (NF-e Nacional)',
      serviceType: 'SEFAZ_NFE',
      description: 'Consulta do WebService NFeDistribuicaoDFe por NSU com download de XML completo de notas de entrada e eventos.',
      endpoint: 'https://www1.nfe.fazenda.gov.br/NFeDistribuicaoDFe/NFeDistribuicaoDFe.asmx',
      intervalType: 'horario',
      intervalValue: '1h',
      status: 'ativo',
      lastRun: 'Hoje às 12:00:00',
      nextRun: 'Hoje às 13:00:00',
      ultNSU: '000000000045892',
      maxNSU: '000000000045892',
      docsFetchedLastRun: 18,
      successRate: 100,
      autoDanfeGenerate: true,
      autoManifest: true
    },
    {
      id: 'task-nfse-abrasf',
      name: 'Centralizador Municipal • NFS-e (Serviços Tomados / ABRASF)',
      serviceType: 'ABRASF_NFSE',
      description: 'Varredura automática de Notas Fiscais de Serviços Tomados nas prefeituras conveniadas (PMSP, PCRJ, PBH, etc.).',
      endpoint: 'https://iss.rio.rj.gov.br/WSNFe2/LoteRps.asmx',
      intervalType: 'diario',
      intervalValue: '03:00',
      status: 'ativo',
      lastRun: 'Hoje às 03:00:00',
      nextRun: 'Amanhã às 03:00:00',
      ultNSU: '000000000012480',
      maxNSU: '000000000012480',
      docsFetchedLastRun: 7,
      successRate: 98.5,
      autoDanfeGenerate: true,
      autoManifest: false
    },
    {
      id: 'task-cte-antt',
      name: 'SEFAZ / ANTT • Conhecimento de Transporte (CT-e / DACTE)',
      serviceType: 'SEFAZ_CTE',
      description: 'Recepção e captura de Conhecimentos de Transporte Eletrônicos vinculados ao CNPJ da empresa como tomador ou destinatário.',
      endpoint: 'https://cte.fazenda.gov.br/CTeDistribuicaoDFe/CTeDistribuicaoDFe.asmx',
      intervalType: 'horario',
      intervalValue: '6h',
      status: 'ativo',
      lastRun: 'Hoje às 06:00:00',
      nextRun: 'Hoje às 18:00:00',
      ultNSU: '000000000008450',
      maxNSU: '000000000008450',
      docsFetchedLastRun: 4,
      successRate: 100,
      autoDanfeGenerate: true,
      autoManifest: true
    },
    {
      id: 'task-nfce-sat',
      name: 'SEFAZ Estadual • NFC-e Consumidor & Cupom Fiscal SAT',
      serviceType: 'SEFAZ_NFCE',
      description: 'Coleta de notas fiscais de consumidor eletrônicas emitidas e recebidas em ambiente de balcão e varejo.',
      endpoint: 'https://nfce.fazenda.rj.gov.br/ws/nfcedistribuicao.asmx',
      intervalType: 'semanal',
      intervalValue: 'Segunda 06:00',
      status: 'pausado',
      lastRun: 'Segunda-feira às 06:00',
      nextRun: 'Próxima Segunda às 06:00',
      ultNSU: '000000000003120',
      maxNSU: '000000000003120',
      docsFetchedLastRun: 0,
      successRate: 100,
      autoDanfeGenerate: false,
      autoManifest: false
    }
  ]);

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editIntervalType, setEditIntervalType] = useState<'horario' | 'diario' | 'semanal' | 'tempo_real'>('horario');
  const [editIntervalValue, setEditIntervalValue] = useState<string>('1h');
  const [isExecuting, setIsExecuting] = useState<string | null>(null);

  // Toggle status
  const handleToggleStatus = (id: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        const nextStatus = task.status === 'ativo' ? 'pausado' : 'ativo';
        showToast(`Centralizador "${task.name.split('•')[0].trim()}" ${nextStatus === 'ativo' ? 'ativado' : 'pausado'}!`, 'info');
        return { ...task, status: nextStatus };
      }
      return task;
    }));
  };

  // Trigger immediate execution
  const handleExecuteNow = (task: CentralizerTask) => {
    setIsExecuting(task.id);
    showToast(`Iniciando varredura em Produção no centralizador ${task.name.split('•')[0].trim()}...`, 'info');

    if (onTriggerSyncNow) {
      onTriggerSyncNow(task.id);
    }

    setTimeout(() => {
      setTasks(prev => prev.map(t => {
        if (t.id === task.id) {
          return {
            ...t,
            lastRun: `Hoje às ${new Date().toLocaleTimeString()}`
          };
        }
        return t;
      }));
      setIsExecuting(null);
    }, 1500);
  };

  // Open Edit Modal
  const handleOpenEdit = (task: CentralizerTask) => {
    setEditingTaskId(task.id);
    setEditIntervalType(task.intervalType);
    setEditIntervalValue(task.intervalValue);
  };

  // Save Edit
  const handleSaveEdit = () => {
    if (!editingTaskId) return;
    setTasks(prev => prev.map(t => {
      if (t.id === editingTaskId) {
        return {
          ...t,
          intervalType: editIntervalType,
          intervalValue: editIntervalValue
        };
      }
      return t;
    }));
    showToast('Frequência de agendamento atualizada!', 'success');
    setEditingTaskId(null);
  };

  return (
    <div className="space-y-6 w-full">
      
      {/* Top Header Card */}
      <div className="p-6 bg-[#0F172A] border border-slate-800 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-600/20 border border-rose-500/40 text-rose-400 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white uppercase tracking-wider">
                Gerenciador de Tarefas Agendadas & Centralizadores de Busca
              </h2>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-black border border-emerald-500/30">
                4 CENTRALIZADORES CONFIGURADOS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Automatize a captura de XMLs e geração de PDFs/DANFEs por horários, diário ou semanal com controle de NSU e manifestação.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              tasks.forEach(t => {
                if (t.status === 'ativo') handleExecuteNow(t);
              });
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-xs rounded-xl shadow-lg flex items-center gap-2 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Executar Todos os Centralizadores</span>
          </button>
        </div>
      </div>

      {/* Grid of Centralizer Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tasks.map((task) => {
          const isTaskExecuting = isExecuting === task.id;

          return (
            <div 
              key={task.id}
              className={`p-6 bg-[#0F172A] border-2 rounded-3xl space-y-4 shadow-xl flex flex-col justify-between transition ${
                task.status === 'ativo' ? 'border-slate-800 hover:border-slate-700' : 'border-slate-800/60 opacity-80'
              }`}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                        task.status === 'ativo' 
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      }`}>
                        {task.status.toUpperCase()}
                      </span>
                      <span className="text-[10px] font-mono text-cyan-400">
                        {task.intervalType === 'horario' ? `A cada ${task.intervalValue}` : 
                         task.intervalType === 'diario' ? `Diário às ${task.intervalValue}` : 
                         task.intervalType === 'semanal' ? `Semanal (${task.intervalValue})` : 'Tempo Real'}
                      </span>
                    </div>
                    <h3 className="text-sm font-black text-white">{task.name}</h3>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(task.id)}
                    className={`p-2 rounded-xl border transition cursor-pointer ${
                      task.status === 'ativo' 
                        ? 'bg-amber-950/40 border-amber-500/40 text-amber-400 hover:bg-amber-900/50' 
                        : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/50'
                    }`}
                    title={task.status === 'ativo' ? 'Pausar Tarefa' : 'Ativar Tarefa'}
                  >
                    {task.status === 'ativo' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  {task.description}
                </p>

                {/* Metrics Box */}
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 grid grid-cols-3 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block font-sans font-bold">Último NSU</span>
                    <span className="font-bold text-white truncate block">{task.ultNSU}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block font-sans font-bold">Última Coleta</span>
                    <span className="font-bold text-emerald-400">+{task.docsFetchedLastRun} XMLs</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block font-sans font-bold">Assertividade</span>
                    <span className="font-bold text-cyan-400">{task.successRate}%</span>
                  </div>
                </div>

                {/* Automation Badges */}
                <div className="flex items-center gap-2 pt-1">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 ${
                    task.autoDanfeGenerate ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30' : 'bg-slate-900 text-slate-500'
                  }`}>
                    <FileText className="w-3 h-3" />
                    <span>Auto-Geração DANFE/PDF</span>
                  </span>

                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 ${
                    task.autoManifest ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-500/30' : 'bg-slate-900 text-slate-500'
                  }`}>
                    <ShieldCheck className="w-3 h-3" />
                    <span>Auto-Ciência SEFAZ</span>
                  </span>
                </div>
              </div>

              {/* Action Deck */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="text-[10px] text-slate-500 font-mono">
                  Próxima execução: <strong className="text-slate-300">{task.nextRun}</strong>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(task)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Intervalo</span>
                  </button>

                  <button
                    onClick={() => handleExecuteNow(task)}
                    disabled={isTaskExecuting || task.status === 'pausado'}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow cursor-pointer ${
                      isTaskExecuting 
                        ? 'bg-slate-800 text-slate-500' 
                        : 'bg-rose-600 hover:bg-rose-500 text-white'
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTaskExecuting ? 'animate-spin' : ''}`} />
                    <span>{isTaskExecuting ? 'Sincronizando...' : 'Buscar Agora'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: EDITAR INTERVALO DO CENTRALIZADOR */}
      {editingTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0F172A] border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-rose-500" />
              Configurar Intervalo de Busca
            </h3>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Tipo de Agendamento</label>
                <select
                  value={editIntervalType}
                  onChange={(e) => setEditIntervalType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl p-2.5 font-bold focus:outline-none focus:border-rose-500"
                >
                  <option value="horario">De Hora em Hora (Intradiário)</option>
                  <option value="diario">Diário (Horário Fixo)</option>
                  <option value="semanal">Semanal (Dia da Semana Fixo)</option>
                  <option value="tempo_real">Em Tempo Real (30 segundos)</option>
                </select>
              </div>

              {editIntervalType === 'horario' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Intervalo entre buscas</label>
                  <select
                    value={editIntervalValue}
                    onChange={(e) => setEditIntervalValue(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl p-2.5 font-bold focus:outline-none focus:border-rose-500"
                  >
                    <option value="1h">A cada 1 hora</option>
                    <option value="2h">A cada 2 horas</option>
                    <option value="4h">A cada 4 horas</option>
                    <option value="6h">A cada 6 horas</option>
                    <option value="12h">A cada 12 horas</option>
                  </select>
                </div>
              )}

              {editIntervalType === 'diario' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Horário de Execução Diária</label>
                  <input
                    type="time"
                    value={editIntervalValue}
                    onChange={(e) => setEditIntervalValue(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl p-2.5 font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>
              )}

              {editIntervalType === 'semanal' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Dia e Horário</label>
                  <select
                    value={editIntervalValue}
                    onChange={(e) => setEditIntervalValue(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl p-2.5 font-bold focus:outline-none focus:border-rose-500"
                  >
                    <option value="Segunda 06:00">Toda Segunda-feira às 06:00</option>
                    <option value="Sexta 18:00">Toda Sexta-feira às 18:00</option>
                    <option value="Domingo 23:00">Todo Domingo às 23:00</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setEditingTaskId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black transition cursor-pointer"
              >
                Salvar Agendamento
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
