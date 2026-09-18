import { StructuringModelItem, STRUCTURING_CATEGORIES } from './structuring/types';
import { HOLDINGS_MODELS } from './structuring/holdings';
import { GOVERNANCA_MODELS } from './structuring/governanca';
import { REORGANIZACAO_MODELS } from './structuring/reorganizacao';
import { TRANSFORMACAO_MODELS } from './structuring/transformacao';
import { CAPITAL_MODELS } from './structuring/capital';
import { DISSOLUCAO_MODELS } from './structuring/dissolucao';
import { BLINDAGEM_MODELS } from './structuring/blindagem';
import { ESPECIAIS_MODELS } from './structuring/especiais';

export type { StructuringModelItem, StructuringDraftContext, StructuringCategoryKey } from './structuring/types';

export const STRUCTURING_MODELS_DATA: StructuringModelItem[] = [
  ...HOLDINGS_MODELS,
  ...GOVERNANCA_MODELS,
  ...REORGANIZACAO_MODELS,
  ...TRANSFORMACAO_MODELS,
  ...CAPITAL_MODELS,
  ...DISSOLUCAO_MODELS,
  ...BLINDAGEM_MODELS,
  ...ESPECIAIS_MODELS,
];

export const STRUCTURING_CATEGORIES_WITH_COUNTS = [
  { id: 'all', name: `Todos os ${STRUCTURING_MODELS_DATA.length} Procedimentos Societários`, count: STRUCTURING_MODELS_DATA.length },
  { id: 'holdings', name: '🏛️ Holdings & Planejamento Sucessório', count: HOLDINGS_MODELS.length },
  { id: 'governanca', name: '⚖️ Governança, Acordos & Founders', count: GOVERNANCA_MODELS.length },
  { id: 'reorganizacao', name: '🔄 Reorganização Societária, Fusões & M&A', count: REORGANIZACAO_MODELS.length },
  { id: 'transformacao', name: '🏢 Transformação, Conversão & Tipos', count: TRANSFORMACAO_MODELS.length },
  { id: 'capital', name: '💰 Capital Social, Aumentos & Títulos', count: CAPITAL_MODELS.length },
  { id: 'dissolucao', name: '🚪 Saída de Sócios, Haveres & Dissolução', count: DISSOLUCAO_MODELS.length },
  { id: 'blindagem', name: '🛡️ Blindagem Patrimonial, Riscos & Compliance', count: BLINDAGEM_MODELS.length },
  { id: 'especiais', name: '📜 Sucessão, Doação & Instrumentos Especiais', count: ESPECIAIS_MODELS.length },
] as const;

export { STRUCTURING_CATEGORIES };
