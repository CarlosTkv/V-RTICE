import { DashboardWidgetConfig, DashboardWidgetId } from '../types';

export const DEFAULT_DASHBOARD_WIDGETS: DashboardWidgetConfig[] = [
  { id: 'kpi_rbt12', title: 'Faturamento RBT12', category: 'kpi', visible: true, order: 0 },
  { id: 'kpi_fator_r', title: 'Status Fator R (28%)', category: 'kpi', visible: true, order: 1 },
  { id: 'kpi_aliquota', title: 'Alíquota Efetiva DAS', category: 'kpi', visible: true, order: 2 },
  { id: 'kpi_economia', title: 'Economia Tributária Apurada', category: 'kpi', visible: true, order: 3 },
  { id: 'central_relatorios', title: 'Central de Relatórios & Laudos Periciais', category: 'tool', visible: true, order: 4 },
  { id: 'trilha_auditoria', title: 'Trilha Didática de Auditoria', category: 'tool', visible: true, order: 5 },
  { id: 'obrigacoes_status', title: 'Resumo de Obrigações (Mês)', category: 'tool', visible: true, order: 6 },
  { id: 'agenda_resumo', title: 'Próximos Vencimentos', category: 'tool', visible: true, order: 7 },
  { id: 'pgdas_import', title: 'Automação PGDAS-D / e-CAC', category: 'tool', visible: true, order: 8 },
  { id: 'checklist_lc123', title: 'Checklist Requisitos LC 123/06', category: 'tool', visible: true, order: 9 },
  { id: 'parametros_fiscais', title: 'Parâmetros Fiscais da Empresa', category: 'tool', visible: true, order: 10 },
  { id: 'chart_trajectory', title: 'Trajetória RBT12 vs. Sublimite', category: 'chart', visible: true, order: 11 },
  { id: 'chart_regimes', title: 'Carga Tributária por Regime', category: 'chart', visible: true, order: 12 },
  { id: 'chart_economia', title: 'Projeção de Economia Tributária', category: 'chart', visible: true, order: 13 },
];

const STORAGE_KEY = 'vertice_fiscal_dashboard_widgets_v2';

export function loadSavedWidgetConfigs(): DashboardWidgetConfig[] {
  if (typeof window === 'undefined') return DEFAULT_DASHBOARD_WIDGETS;
  
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_DASHBOARD_WIDGETS;
    
    const parsed: DashboardWidgetConfig[] = JSON.parse(saved);
    
    // Ensure all default widgets exist in case new ones were introduced
    const existingIds = new Set(parsed.map(w => w.id));
    const missing = DEFAULT_DASHBOARD_WIDGETS.filter(w => !existingIds.has(w.id));
    
    const merged = [...parsed, ...missing].map((item, index) => ({
      ...item,
      order: typeof item.order === 'number' ? item.order : index
    }));

    return merged.sort((a, b) => a.order - b.order);
  } catch (error) {
    console.warn('Erro ao carregar preferência de widgets:', error);
    return DEFAULT_DASHBOARD_WIDGETS;
  }
}

export function saveWidgetConfigs(configs: DashboardWidgetConfig[]): void {
  if (typeof window === 'undefined') return;
  try {
    const ordered = configs.map((c, idx) => ({ ...c, order: idx }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ordered));
  } catch (error) {
    console.warn('Erro ao salvar preferência de widgets:', error);
  }
}

export function resetWidgetConfigs(): DashboardWidgetConfig[] {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  }
  return DEFAULT_DASHBOARD_WIDGETS;
}
