export type StructuringCategoryKey = 
  | 'holdings'
  | 'governanca'
  | 'reorganizacao'
  | 'transformacao'
  | 'capital'
  | 'dissolucao'
  | 'blindagem'
  | 'especiais';

export interface StructuringDraftContext {
  socioPF: string;
  herdeiros: string;
  ativos: string;
  nomeEmpresarial: string;
  cidade: string;
  ufEmpresa: string;
  dateFormatted: string;
  clauses: {
    inalienabilidade: boolean;
    impenhorabilidade: boolean;
    incomunicabilidade: boolean;
    usufruto: boolean;
    reversao: boolean;
    prefRoute: boolean;
    tagAlong: boolean;
    dragAlong: boolean;
    deadlock: boolean;
    callOption: boolean;
    imunidadeITBI: boolean;
    autonomiaPatrimonial: boolean;
    nonCompete: boolean;
    vesting: boolean;
    conselhoConsultivo: boolean;
    escrowEarnout: boolean;
    valuationMethod: 'balanco_determinacao' | 'fluxo_caixa_descontado' | 'valor_patrimonial_contabil';
  };
}

export interface StructuringModelItem {
  id: string;
  title: string;
  category: StructuringCategoryKey;
  categoryName: string;
  badge: string;
  badgeColor: string;
  description: string;
  legalFramework: string;
  jurisprudence: string;
  keyFeatures: string[];
  riskLevel: 'Máxima Blindagem' | 'Alta Complexidade' | 'Estratégico' | 'Foco Sucessório' | 'Tributário';
  targetProfile: string;
  defaultClauses: {
    inalienabilidade?: boolean;
    impenhorabilidade?: boolean;
    incomunicabilidade?: boolean;
    usufruto?: boolean;
    reversao?: boolean;
    prefRoute?: boolean;
    tagAlong?: boolean;
    dragAlong?: boolean;
    deadlock?: boolean;
    callOption?: boolean;
    imunidadeITBI?: boolean;
    autonomiaPatrimonial?: boolean;
    nonCompete?: boolean;
    vesting?: boolean;
    conselhoConsultivo?: boolean;
    escrowEarnout?: boolean;
    valuationMethod?: 'balanco_determinacao' | 'fluxo_caixa_descontado' | 'valor_patrimonial_contabil';
  };
  generateFullDraft: (context: StructuringDraftContext) => string;
}

export const STRUCTURING_CATEGORIES = [
  { id: 'all', name: 'Todos os Procedimentos Societários & Corporativos' },
  { id: 'holdings', name: '🏛️ Holdings & Planejamento Sucessório' },
  { id: 'governanca', name: '⚖️ Governança, Acordos & Founders' },
  { id: 'reorganizacao', name: '🔄 Reorganização Societária, Fusões & M&A' },
  { id: 'transformacao', name: '🏢 Transformação, Conversão & Tipos' },
  { id: 'capital', name: '💰 Capital Social, Aumentos & Títulos' },
  { id: 'dissolucao', name: '🚪 Saída de Sócios, Haveres & Dissolução' },
  { id: 'blindagem', name: '🛡️ Blindagem Patrimonial, Riscos & Compliance' },
  { id: 'especiais', name: '📜 Sucessão, Doação & Instrumentos Especiais' },
] as const;
