export type RamoDireito = 
  | 'empresarial' 
  | 'administrativo' 
  | 'tributario' 
  | 'civil' 
  | 'penal'
  | 'nfse_reforma';

export interface DireitoItem {
  id: string;
  title: string;
  ramo: RamoDireito;
  ramoLabel: string;
  subtopico: string;
  dispositivoLegal: string;
  doutrinaReferencia: string;
  jurisprudenciaTese: {
    tribunal: 'STF' | 'STJ' | 'CARF' | 'TRF' | 'TCU';
    numeroTemaOuSumula: string;
    enunciado: string;
    impactoEmpresarial: string;
  };
  analiseCriticaDoutrinaria: string;
  parecerJuridicoComentado: string;
  teseDefensivaOuRecuperacao?: {
    tese: string;
    fundamentacao: string;
    raciocinioDefensivo: string;
  };
  tags: string[];
  linkConhecimentoId?: string;
}

export const DIREITO_RAMOS: { id: RamoDireito; label: string; icon: string; color: string }[] = [
  { id: 'nfse_reforma', label: 'NFS-e & Reforma Tributária', icon: 'Sparkles', color: 'border-emerald-500 text-emerald-400 bg-emerald-950/40' },
  { id: 'tributario', label: 'Direito Tributário', icon: 'Scale', color: 'border-amber-500 text-amber-400 bg-amber-950/40' },
  { id: 'empresarial', label: 'Direito Empresarial', icon: 'Building2', color: 'border-blue-500 text-blue-400 bg-blue-950/40' },
  { id: 'administrativo', label: 'Direito Administrativo', icon: 'Landmark', color: 'border-purple-500 text-purple-400 bg-purple-950/40' },
  { id: 'civil', label: 'Direito Civil Empresarial', icon: 'FileText', color: 'border-cyan-500 text-cyan-400 bg-cyan-950/40' },
  { id: 'penal', label: 'Direito Penal Empresarial', icon: 'ShieldAlert', color: 'border-red-500 text-red-400 bg-red-950/40' },
];

import { DIREITO_EMPRESARIAL } from './direito/empresarial';
import { DIREITO_ADMINISTRATIVO } from './direito/administrativo';
import { DIREITO_TRIBUTARIO } from './direito/tributario';
import { DIREITO_CIVIL } from './direito/civil';
import { DIREITO_PENAL } from './direito/penal';
import { DIREITO_NFSE_REFORMA } from './direito/nfse_reforma';

export const DIREITO_BASE: DireitoItem[] = [
  ...DIREITO_NFSE_REFORMA,
  ...DIREITO_TRIBUTARIO,
  ...DIREITO_EMPRESARIAL,
  ...DIREITO_ADMINISTRATIVO,
  ...DIREITO_CIVIL,
  ...DIREITO_PENAL
];

