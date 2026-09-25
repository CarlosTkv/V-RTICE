import React, { useState } from 'react';
import { 
  Activity, 
  CheckCircle2, 
  AlertOctagon, 
  Clock, 
  Zap, 
  FileCode2, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  Play, 
  Sparkles, 
  ShieldCheck,
  FileCheck,
  FileX,
  FileWarning
} from 'lucide-react';

export interface IngestionLogItem {
  id: string;
  fileName: string;
  fileSizeKb: number;
  modelo: 'NF-e 55' | 'NFS-e ADN' | 'CT-e 57' | 'NFC-e 65' | 'Desconhecido';
  status: 'success' | 'error' | 'warning';
  numeroNota?: string;
  chaveAcesso?: string;
  detalhe: string;
  duracaoMs: number;
  timestamp: string;
}

interface VerticeProcessingQueuePanelProps {
  logs?: IngestionLogItem[];
  onClearLogs?: () => void;
  onSimulateIngestion?: (count: number) => void;
  onRetryFailed?: () => void;
  isProcessing?: boolean;
}

export const VerticeProcessingQueuePanel: React.FC<VerticeProcessingQueuePanelProps> = ({
  logs = [],
  onClearLogs,
  onSimulateIngestion,
  onRetryFailed,
  isProcessing = false
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'error'>('all');

  // Cálculos consolidados da fila de processamento
  const totalProcessed = logs.length;
  const successCount = logs.filter(l => l.status === 'success').length;
  const errorCount = logs.filter(l => l.status === 'error').length;
  const warningCount = logs.filter(l => l.status === 'warning').length;
  const successRate = totalProcessed > 0 ? ((successCount / totalProcessed) * 100).toFixed(1) : '100.0';
  const avgDurationMs = totalProcessed > 0 
    ? Math.round(logs.reduce((acc, l) => acc + l.duracaoMs, 0) / totalProcessed) 
    : 32;

  const filteredLogs = logs.filter(l => {
    if (filterStatus === 'all') return true;
    return l.status === filterStatus;
  });

  return (
    <div className="bg-[#0F172A] border border-slate-800/90 rounded-2xl shadow-xl overflow-hidden transition-all">
      
      {/* Header Bar */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Activity className={`w-5 h-5 ${isProcessing ? 'animate-spin text-amber-400' : 'text-emerald-400'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                Fila de Processamento & Ingestão XML (Streaming Queue)
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                isProcessing 
                  ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400 animate-pulse' 
                  : errorCount > 0 
                  ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400' 
                  : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              }`}>
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Processando Streaming
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3 h-3" />
                    Fila Pronta & Saudável
                  </>
                )}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Monitoramento em tempo real do parser de documentos fiscais, streaming de lotes ZIP e detecção de falhas sintáticas.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          {onSimulateIngestion && (
            <button
              onClick={() => onSimulateIngestion(25)}
              disabled={isProcessing}
              className="px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/60 text-emerald-300 hover:text-emerald-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Executar teste de benchmark da fila com lote de XMLs"
            >
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              <span>Simular Lote (25 XMLs)</span>
            </button>
          )}

          {errorCount > 0 && onRetryFailed && (
            <button
              onClick={onRetryFailed}
              className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 hover:text-rose-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="Tentar reprocessar os arquivos que apresentaram falha"
            >
              <RefreshCw className="w-3.5 h-3.5 text-rose-400" />
              <span>Reprocessar Falhas ({errorCount})</span>
            </button>
          )}

          {onClearLogs && (
            <button
              onClick={onClearLogs}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition cursor-pointer"
              title="Limpar logs da fila"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition cursor-pointer"
            title={isExpanded ? 'Recolher painel' : 'Expandir painel'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/20">
        
        {/* Card 1: Sucesso */}
        <div className="p-3.5 bg-[#0B0F19] border border-emerald-500/20 rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              Parseados c/ Sucesso
            </span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[9px]">
              {successRate}%
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            {successCount} <span className="text-xs font-normal text-slate-400">/ {totalProcessed} docs</span>
          </div>
          <div className="text-[10px] text-slate-500">Validados contra XSD SEFAZ</div>
        </div>

        {/* Card 2: Falhas / Erros */}
        <div className={`p-3.5 bg-[#0B0F19] border rounded-xl space-y-1 ${
          errorCount > 0 ? 'border-rose-500/40 bg-rose-950/10' : 'border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileX className="w-3.5 h-3.5 text-rose-400" />
              Erros de Ingestão
            </span>
            {errorCount > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold text-[9px] animate-pulse">
                Atenção
              </span>
            )}
          </div>
          <div className={`text-xl sm:text-2xl font-black ${errorCount > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
            {errorCount} <span className="text-xs font-normal text-slate-500">falhas</span>
          </div>
          <div className="text-[10px] text-slate-500">XMLs truncados ou inválidos</div>
        </div>

        {/* Card 3: Velocidade / Latência Média */}
        <div className="p-3.5 bg-[#0B0F19] border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Latência do Parser
            </span>
            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold text-[9px]">
              Fast-XML
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-300">
            ~{avgDurationMs}ms <span className="text-xs font-normal text-slate-400">/ arquivo</span>
          </div>
          <div className="text-[10px] text-slate-500">Processamento em memória</div>
        </div>

        {/* Card 4: Fila em Memória / Buffer */}
        <div className="p-3.5 bg-[#0B0F19] border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              Estado do Buffer
            </span>
            <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 font-bold text-[9px]">
              Streaming
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-blue-300">
            {isProcessing ? '1 ativo' : '0 pendentes'}
          </div>
          <div className="text-[10px] text-slate-500">Sem gargalo de I/O</div>
        </div>

      </div>

      {/* Collapsible Log Stream Table */}
      {isExpanded && (
        <div className="p-4 sm:p-5 border-t border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-emerald-400" />
              Histórico Recente de Ingestão de Arquivos ({filteredLogs.length})
            </div>
            
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                  filterStatus === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                Todos ({logs.length})
              </button>
              <button
                onClick={() => setFilterStatus('success')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                  filterStatus === 'success' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-emerald-400 hover:bg-slate-800'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                Sucesso ({successCount})
              </button>
              <button
                onClick={() => setFilterStatus('error')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                  filterStatus === 'error' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-rose-400 hover:bg-slate-800'
                }`}
              >
                <AlertOctagon className="w-3 h-3" />
                Erros ({errorCount})
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-[#0B0F19]/80 max-h-64 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 sticky top-0 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-2.5">Horário</th>
                  <th className="p-2.5">Arquivo / Origem</th>
                  <th className="p-2.5">Modelo</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Detalhes / Diagnóstico</th>
                  <th className="p-2.5 text-right">Tempo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-500 text-xs">
                      Nenhum registro de ingestão encontrado no filtro atual.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map(item => (
                    <tr key={item.id} className="hover:bg-slate-900/50 transition">
                      <td className="p-2.5 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {item.timestamp}
                      </td>
                      <td className="p-2.5">
                        <div className="font-bold text-slate-200 truncate max-w-[200px] flex items-center gap-1.5">
                          <FileCode2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          {item.fileName}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {item.fileSizeKb} KB {item.numeroNota && `• Nota nº ${item.numeroNota}`}
                        </div>
                      </td>
                      <td className="p-2.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                          {item.modelo}
                        </span>
                      </td>
                      <td className="p-2.5 whitespace-nowrap">
                        {item.status === 'success' ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3" />
                            Parseado OK
                          </span>
                        ) : item.status === 'error' ? (
                          <span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-bold flex items-center gap-1 w-fit">
                            <AlertOctagon className="w-3 h-3" />
                            Falha no XML
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold flex items-center gap-1 w-fit">
                            <FileWarning className="w-3 h-3" />
                            Aviso XSD
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-slate-300 text-[11px]">
                        <div className="truncate max-w-[280px]" title={item.detalhe}>
                          {item.detalhe}
                        </div>
                        {item.chaveAcesso && (
                          <div className="text-[9px] font-mono text-slate-500 truncate max-w-[280px]">
                            Chave: {item.chaveAcesso}
                          </div>
                        )}
                      </td>
                      <td className="p-2.5 text-right font-mono text-[10px] text-slate-400 whitespace-nowrap">
                        {item.duracaoMs}ms
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
