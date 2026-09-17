export type ConhecimentoAssunto = 
  | 'tributario' 
  | 'contabil' 
  | 'fiscal' 
  | 'societario' 
  | 'trabalhista' 
  | 'comex'
  | 'reforma_tributaria';

export type ConhecimentoSubdivisao = 
  | 'federal' 
  | 'estadual' 
  | 'municipal' 
  | 'trabalhista' 
  | 'pessoa_fisica';

export interface ConhecimentoItem {
  id: string;
  title: string;
  assunto: ConhecimentoAssunto;
  assuntoLabel: string;
  subdivisao: ConhecimentoSubdivisao;
  subdivisaoLabel: string;
  normaOficial: string;
  orgaoEmissor: string;
  resumoTecnico: string;
  conteudoDetalhador: string;
  fundamentacaoLegal: string[];
  exemploPratico: {
    cenario: string;
    aplicacao: string;
    conclusao: string;
  };
  tags: string[];
  linkDireitoId?: string;
}

export const CONHECIMENTO_ASSUNTOS: { id: ConhecimentoAssunto; label: string; icon: string }[] = [
  { id: 'tributario', label: 'Tributário & Regimes', icon: 'Calculator' },
  { id: 'contabil', label: 'Contábil & NBC', icon: 'BookOpen' },
  { id: 'fiscal', label: 'Fiscal & SPED', icon: 'FileText' },
  { id: 'societario', label: 'Societario & Juntas', icon: 'Building' },
  { id: 'trabalhista', label: 'Trabalhista & eSocial', icon: 'Users' },
  { id: 'comex', label: 'Comércio Exterior & Siscomex', icon: 'Globe' },
];

export const CONHECIMENTO_SUBDIVISOES: { id: ConhecimentoSubdivisao; label: string; badgeColor: string }[] = [
  { id: 'federal', label: 'Federal (RFB / PGFN / IPI / PGDAS)', badgeColor: 'bg-blue-950 text-blue-300 border-blue-800' },
  { id: 'estadual', label: 'Estadual (SEFAZ 27 UFs / ICMS / ST / DIFAL)', badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800' },
  { id: 'municipal', label: 'Municipal (ISSQN / LC 116 / Retenções)', badgeColor: 'bg-amber-950 text-amber-300 border-amber-800' },
  { id: 'trabalhista', label: 'Trabalhista/Previdenciário (CLT / eSocial / INSS)', badgeColor: 'bg-purple-950 text-purple-300 border-purple-800' },
  { id: 'pessoa_fisica', label: 'Pessoa Física (IRPF / Carnê-Leão / Dividendos)', badgeColor: 'bg-rose-950 text-rose-300 border-rose-800' },
];

import { CONHECIMENTOS_TRIBUTARIO } from './conhecimentos/tributario';
import { CONHECIMENTOS_CONTABIL } from './conhecimentos/contabil';
import { CONHECIMENTOS_FISCAL } from './conhecimentos/fiscal';
import { CONHECIMENTOS_SOCIETARIO } from './conhecimentos/societario';
import { CONHECIMENTOS_TRABALHISTA } from './conhecimentos/trabalhista';
import { CONHECIMENTOS_COMEX } from './conhecimentos/comex';

export const CONHECIMENTOS_BASE: ConhecimentoItem[] = [
  ...CONHECIMENTOS_TRIBUTARIO,
  ...CONHECIMENTOS_CONTABIL,
  ...CONHECIMENTOS_FISCAL,
  ...CONHECIMENTOS_SOCIETARIO,
  ...CONHECIMENTOS_TRABALHISTA,
  ...CONHECIMENTOS_COMEX
];
