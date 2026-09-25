/**
 * Worker de Processamento em Background da Fila de Consulta SEFAZ & ADN Nacional
 */

export interface QueueJobStatus {
  running: boolean;
  intervalMs: number;
  totalExecutions: number;
  lastRunTimestamp?: string;
  nextRunTimestamp?: string;
  lastProcessedCount: number;
  lastErrorsCount: number;
  activeCompaniesCount: number;
}

let isWorkerActive = false;
let workerTimer: NodeJS.Timeout | null = null;
let totalExecutionsCount = 0;
let lastRunTime: string | undefined;
let nextRunTime: string | undefined;
let lastProcessed: number = 0;
let lastErrors: number = 0;
const WORKER_INTERVAL_MS = 60 * 1000; // 1 minuto padrão para verificação da fila

/**
 * Executa uma rodada de processamento na fila da SEFAZ
 */
export async function executeQueueCycle(): Promise<{ processed: number; errors: number }> {
  lastRunTime = new Date().toISOString();
  totalExecutionsCount++;
  
  // Simulação de ciclo de varredura e consumo de NSUs pendentes
  // Em produção com PostgreSQL, faria: SELECT * FROM fila_consulta_sefaz WHERE proxima_consulta <= NOW() AND status_fila = 'AGUARDANDO'
  const mockProcessed = Math.floor(Math.random() * 3) + 1;
  const mockErrors = 0;

  lastProcessed = mockProcessed;
  lastErrors = mockErrors;

  const nextDate = new Date(Date.now() + WORKER_INTERVAL_MS);
  nextRunTime = nextDate.toISOString();

  console.log(`[SEFAZ WORKER] Ciclo #${totalExecutionsCount} concluído. Documentos processados: ${mockProcessed}, Erros: ${mockErrors}. Próximo ciclo em: ${nextRunTime}`);

  return { processed: mockProcessed, errors: mockErrors };
}

/**
 * Inicia o worker em background
 */
export function startQueueWorker(intervalMs: number = WORKER_INTERVAL_MS) {
  if (isWorkerActive) return;

  isWorkerActive = true;
  console.log(`[SEFAZ WORKER] Worker de consulta contínua iniciado. Intervalo: ${intervalMs / 1000}s`);

  // Executa o primeiro ciclo imediatamente
  executeQueueCycle().catch(console.error);

  // Agenda os próximos ciclos
  workerTimer = setInterval(() => {
    executeQueueCycle().catch(console.error);
  }, intervalMs);
}

/**
 * Para o worker em background
 */
export function stopQueueWorker() {
  if (workerTimer) {
    clearInterval(workerTimer);
    workerTimer = null;
  }
  isWorkerActive = false;
  console.log('[SEFAZ WORKER] Worker de consulta contínua pausado.');
}

/**
 * Retorna o status operacional do Worker
 */
export function getWorkerStatus(): QueueJobStatus {
  return {
    running: isWorkerActive,
    intervalMs: WORKER_INTERVAL_MS,
    totalExecutions: totalExecutionsCount,
    lastRunTimestamp: lastRunTime,
    nextRunTimestamp: nextRunTime,
    lastProcessedCount: lastProcessed,
    lastErrorsCount: lastErrors,
    activeCompaniesCount: 1
  };
}
