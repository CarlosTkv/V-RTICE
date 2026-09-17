/**
 * Vértice Auditor Fiscal - Automatic Tax Rule Sync & Notification Engine
 * Garante que os motores de cálculo e a base legal estejam 100% sincronizados
 * com a legislação brasileira atualizada (LC 123/2006, EC 132/2023, PLP 68/2024, CGSN).
 */

import { taxCrawlerEngine, TaxNewsItem, INITIAL_CRAWLED_NOTICES } from './taxCrawlerEngine';

export type { TaxNewsItem };
export { INITIAL_CRAWLED_NOTICES } from './taxCrawlerEngine';

export interface SyncStatus {
  lastSyncTime: string;
  engineVersion: string;
  status: 'sincronizado' | 'atualizando' | 'verificando';
  activeRulesVersion: string;
  pendingAlertsCount: number;
}

export const INITIAL_TAX_NEWS: TaxNewsItem[] = INITIAL_CRAWLED_NOTICES;

export function getSyncStatus(): SyncStatus {
  const engineState = taxCrawlerEngine.getEngineState();
  return {
    lastSyncTime: engineState.lastGlobalScan,
    engineVersion: 'v4.8.2-2026',
    status: engineState.isScanning ? 'verificando' : 'sincronizado',
    activeRulesVersion: 'LC 123/06 + EC 132/23 + PLP 68/24 + ADN NFS-e',
    pendingAlertsCount: taxCrawlerEngine.getUnreadCount(),
  };
}

export async function performAutomaticTaxSync(): Promise<{ success: boolean; message: string; news: TaxNewsItem[] }> {
  const result = await taxCrawlerEngine.executeFullCrawlerSweep();
  return {
    success: result.success,
    message: result.message,
    news: taxCrawlerEngine.getNews(),
  };
}

