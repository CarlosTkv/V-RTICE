import React from 'react';
import { 
  ShieldCheck, 
  Percent, 
  Tags, 
  Zap, 
  Search, 
  BarChart3, 
  Receipt, 
  Building2, 
  Award, 
  Scale, 
  TrendingUp,
  Sparkles,
  FileText,
  Wallet,
  Calendar,
  CalendarCheck,
  BookOpen,
  Layers,
  Gavel
} from 'lucide-react';

export type BrandModuleKey = 
  | 'master' 
  | 'simples' 
  | 'monofasico' 
  | 'reforma' 
  | 'consultas' 
  | 'bpo' 
  | 'nfse' 
  | 'societario' 
  | 'parceiros' 
  | 'parecer'
  | 'agenda'
  | 'conhecimentos'
  | 'teses'
  | 'legalizacao'
  | 'auditoria'
  | 'tax'
  | 'contratos';

export interface ModuleBrandConfig {
  id: BrandModuleKey;
  name: string;
  code: string;
  subtitle: string;
  badgeLabel: string;
  topGradient: [string, string];
  rightGradient: [string, string];
  bottomRightGradient: [string, string];
  bottomLeftGradient: [string, string];
  leftGradient: [string, string];
  glowColor: string;
  textColor: string;
  accentBg: string;
  borderAccent: string;
  IconComponent: React.ComponentType<{ className?: string }>;
}

export const BRAND_MODULE_CONFIGS: Record<BrandModuleKey, ModuleBrandConfig> = {
  master: {
    id: 'master',
    name: 'VÉRTICE AUDITOR FISCAL',
    code: 'VÉRTICE // PAINEL FISCAL CONSOLIDADO',
    subtitle: 'Auditoria Tributária, Planejamento & Conformidade',
    badgeLabel: 'PLATAFORMA INTEGRADA',
    topGradient: ['#38BDF8', '#0284C7'],
    rightGradient: ['#34D399', '#059669'],
    bottomRightGradient: ['#FBBF24', '#D97706'],
    bottomLeftGradient: ['#2563EB', '#1E40AF'],
    leftGradient: ['#334155', '#0F172A'],
    glowColor: 'rgba(56, 189, 248, 0.5)',
    textColor: 'from-blue-400 via-cyan-300 to-emerald-400',
    accentBg: 'bg-blue-500/10',
    borderAccent: 'border-blue-500/30',
    IconComponent: ShieldCheck
  },
  simples: {
    id: 'simples',
    name: 'VÉRTICE FATOR R & ANEXOS',
    code: 'VÉRTICE // SIMPLES NACIONAL & FATOR R',
    subtitle: 'Gestão Estratégica do Fator R (≥ 28%) & Anexos III e V',
    badgeLabel: 'FATOR R & ANEXOS',
    topGradient: ['#34D399', '#059669'],
    rightGradient: ['#10B981', '#047857'],
    bottomRightGradient: ['#A7F3D0', '#059669'],
    bottomLeftGradient: ['#0284C7', '#0369A1'],
    leftGradient: ['#1E293B', '#064E3B'],
    glowColor: 'rgba(16, 185, 129, 0.55)',
    textColor: 'from-emerald-400 via-teal-300 to-emerald-500',
    accentBg: 'bg-emerald-500/10',
    borderAccent: 'border-emerald-500/30',
    IconComponent: Percent
  },
  monofasico: {
    id: 'monofasico',
    name: 'VÉRTICE CLASSIFICAÇÃO & MONOFÁSICO',
    code: 'VÉRTICE // SEGREGAÇÃO FISCAL & ICMS-ST',
    subtitle: 'Segregação PIS/COFINS Monofásico & Substituição Tributária',
    badgeLabel: 'SEGREGAÇÃO DE RECEITAS',
    topGradient: ['#FBBF24', '#D97706'],
    rightGradient: ['#F97316', '#C2410C'],
    bottomRightGradient: ['#FDE047', '#CA8A04'],
    bottomLeftGradient: ['#EA580C', '#9A3412'],
    leftGradient: ['#334155', '#78350F'],
    glowColor: 'rgba(245, 158, 11, 0.55)',
    textColor: 'from-amber-400 via-orange-400 to-amber-500',
    accentBg: 'bg-amber-500/10',
    borderAccent: 'border-amber-500/30',
    IconComponent: Tags
  },
  reforma: {
    id: 'reforma',
    name: 'VÉRTICE REFORMA TRIBUTÁRIA',
    code: 'VÉRTICE // REFORMA TRIBUTÁRIA EC 132/23',
    subtitle: 'Simulador do IVA Dual (IBS, CBS e Imposto Seletivo)',
    badgeLabel: 'IVA DUAL & REFORMA',
    topGradient: ['#818CF8', '#4F46E5'],
    rightGradient: ['#A855F7', '#7E22CE'],
    bottomRightGradient: ['#C084FC', '#9333EA'],
    bottomLeftGradient: ['#3B82F6', '#1D4ED8'],
    leftGradient: ['#1E1B4B', '#312E81'],
    glowColor: 'rgba(139, 92, 246, 0.55)',
    textColor: 'from-indigo-400 via-purple-300 to-violet-400',
    accentBg: 'bg-purple-500/10',
    borderAccent: 'border-purple-500/30',
    IconComponent: Zap
  },
  consultas: {
    id: 'consultas',
    name: 'VÉRTICE CONSULTA FISCAL',
    code: 'VÉRTICE // CONSULTAS DE NCM & CÓDIGOS IBGE',
    subtitle: 'Inteligência Fiscal de Alíquotas, Produtos e Serviços',
    badgeLabel: 'CONSULTA FISCAL NCM',
    topGradient: ['#38BDF8', '#0284C7'],
    rightGradient: ['#60A5FA', '#2563EB'],
    bottomRightGradient: ['#93C5FD', '#1D4ED8'],
    bottomLeftGradient: ['#0284C7', '#075985'],
    leftGradient: ['#0F172A', '#0C4A6E'],
    glowColor: 'rgba(2, 132, 199, 0.55)',
    textColor: 'from-sky-400 via-blue-300 to-cyan-400',
    accentBg: 'bg-sky-500/10',
    borderAccent: 'border-sky-500/30',
    IconComponent: Search
  },
  bpo: {
    id: 'bpo',
    name: 'VÉRTICE GESTÃO FINANCEIRA',
    code: 'VÉRTICE // GESTÃO FINANCEIRA & BPO',
    subtitle: 'Painel Financeiro, Fluxo de Caixa & Distribuição de Lucros',
    badgeLabel: 'GESTÃO FINANCEIRA',
    topGradient: ['#34D399', '#059669'],
    rightGradient: ['#2DD4BF', '#0D9488'],
    bottomRightGradient: ['#FBBF24', '#D97706'],
    bottomLeftGradient: ['#059669', '#047857'],
    leftGradient: ['#111827', '#064E3B'],
    glowColor: 'rgba(45, 212, 191, 0.55)',
    textColor: 'from-teal-400 via-emerald-300 to-teal-500',
    accentBg: 'bg-teal-500/10',
    borderAccent: 'border-teal-500/30',
    IconComponent: BarChart3
  },
  nfse: {
    id: 'nfse',
    name: 'VÉRTICE EMISSOR FISCAL',
    code: 'VÉRTICE // EMISSOR NACIONAL NFS-E',
    subtitle: 'Emissão de Notas Fiscais Eletrônicas com Certificado A1',
    badgeLabel: 'EMISSOR FISCAL NFS-E',
    topGradient: ['#FB7185', '#E11D48'],
    rightGradient: ['#F43F5E', '#BE123C'],
    bottomRightGradient: ['#FBBF24', '#D97706'],
    bottomLeftGradient: ['#E11D48', '#9F1239'],
    leftGradient: ['#1F1924', '#881337'],
    glowColor: 'rgba(225, 29, 72, 0.55)',
    textColor: 'from-rose-400 via-pink-300 to-red-400',
    accentBg: 'bg-rose-500/10',
    borderAccent: 'border-rose-500/30',
    IconComponent: Receipt
  },
  societario: {
    id: 'societario',
    name: 'VÉRTICE BLINDAGEM SOCIETÁRIA',
    code: 'VÉRTICE // GESTÃO SOCIETÁRIA & JUNTAS',
    subtitle: 'Estruturação Societária, Contratos & REDESIM 27 UFs',
    badgeLabel: 'GESTÃO SOCIETÁRIA',
    topGradient: ['#22D3EE', '#0891B2'],
    rightGradient: ['#38BDF8', '#0284C7'],
    bottomRightGradient: ['#818CF8', '#4F46E5'],
    bottomLeftGradient: ['#0284C7', '#1E3A8A'],
    leftGradient: ['#0F172A', '#164E63'],
    glowColor: 'rgba(8, 145, 178, 0.55)',
    textColor: 'from-cyan-400 via-blue-300 to-cyan-500',
    accentBg: 'bg-cyan-500/10',
    borderAccent: 'border-cyan-500/30',
    IconComponent: Building2
  },
  parceiros: {
    id: 'parceiros',
    name: 'VÉRTICE REDE DE PARCEIROS',
    code: 'VÉRTICE // PROGRAMA DE PARCEIROS',
    subtitle: 'Isenção de Mensalidade & Comissões Mensais em PIX',
    badgeLabel: 'PORTAL DO PARCEIRO',
    topGradient: ['#FDE047', '#EAB308'],
    rightGradient: ['#FBBF24', '#D97706'],
    bottomRightGradient: ['#F59E0B', '#B45309'],
    bottomLeftGradient: ['#10B981', '#047857'],
    leftGradient: ['#1E293B', '#713F12'],
    glowColor: 'rgba(234, 179, 8, 0.6)',
    textColor: 'from-yellow-300 via-amber-400 to-amber-500',
    accentBg: 'bg-yellow-500/10',
    borderAccent: 'border-yellow-500/30',
    IconComponent: Award
  },
  parecer: {
    id: 'parecer',
    name: 'VÉRTICE LAUDOS & PERÍCIAS',
    code: 'VÉRTICE // LAUDOS PERICIAIS ART. 473 CPC',
    subtitle: 'Emissão de Pareceres e Laudos Periciais com Assinatura Digital',
    badgeLabel: 'LAUDOS PERICIAIS CPC',
    topGradient: ['#94A3B8', '#475569'],
    rightGradient: ['#38BDF8', '#0284C7'],
    bottomRightGradient: ['#FBBF24', '#D97706'],
    bottomLeftGradient: ['#1E293B', '#0F172A'],
    leftGradient: ['#1E1B4B', '#312E81'],
    glowColor: 'rgba(148, 163, 184, 0.5)',
    textColor: 'from-slate-200 via-blue-300 to-amber-300',
    accentBg: 'bg-slate-500/10',
    borderAccent: 'border-slate-500/30',
    IconComponent: Scale
  },
  agenda: {
    id: 'agenda',
    name: 'VÉRTICE AGENDA FISCAL',
    code: 'VÉRTICE // AGENDA FISCAL & OBRIGAÇÕES',
    subtitle: 'Controle de Prazos, DCTF, DAS, DARF e Obrigações Fiscais',
    badgeLabel: 'AGENDA & OBRIGAÇÕES',
    topGradient: ['#FB7185', '#E11D48'],
    rightGradient: ['#F43F5E', '#BE123C'],
    bottomRightGradient: ['#FDA4AF', '#FB7185'],
    bottomLeftGradient: ['#9F1239', '#881337'],
    leftGradient: ['#1E293B', '#4C0519'],
    glowColor: 'rgba(244, 63, 94, 0.55)',
    textColor: 'from-rose-400 via-pink-300 to-rose-500',
    accentBg: 'bg-rose-500/10',
    borderAccent: 'border-rose-500/30',
    IconComponent: CalendarCheck
  },
  conhecimentos: {
    id: 'conhecimentos',
    name: 'VÉRTICE ACERVO NORMATIVO',
    code: 'VÉRTICE // ACERVO NORMATIVO RFB & CFC',
    subtitle: 'Base Legal Completa, Instruções Normativas, eSocial & SPED',
    badgeLabel: 'ACERVO NORMATIVO',
    topGradient: ['#818CF8', '#4F46E5'],
    rightGradient: ['#6366F1', '#4338CA'],
    bottomRightGradient: ['#A5B4FC', '#6366F1'],
    bottomLeftGradient: ['#3730A3', '#312E81'],
    leftGradient: ['#0F172A', '#1E1B4B'],
    glowColor: 'rgba(99, 102, 241, 0.55)',
    textColor: 'from-indigo-400 via-purple-300 to-indigo-500',
    accentBg: 'bg-indigo-500/10',
    borderAccent: 'border-indigo-500/30',
    IconComponent: BookOpen
  },
  teses: {
    id: 'teses',
    name: 'VÉRTICE TESES TRIBUTÁRIAS',
    code: 'VÉRTICE // TESES & JURISPRUDÊNCIA',
    subtitle: 'Teses Tributárias, Jurisprudência CARF & STF',
    badgeLabel: 'ACERVO NORMATIVO',
    topGradient: ['#818CF8', '#4F46E5'],
    rightGradient: ['#6366F1', '#4338CA'],
    bottomRightGradient: ['#A5B4FC', '#6366F1'],
    bottomLeftGradient: ['#3730A3', '#312E81'],
    leftGradient: ['#0F172A', '#1E1B4B'],
    glowColor: 'rgba(99, 102, 241, 0.6)',
    textColor: 'from-indigo-400 via-purple-300 to-indigo-500',
    accentBg: 'bg-indigo-500/10',
    borderAccent: 'border-indigo-500/30',
    IconComponent: Gavel
  },
  legalizacao: {
    id: 'legalizacao',
    name: 'VÉRTICE LEGALIZAÇÃO & JUNTAS',
    code: 'VÉRTICE // LEGALIZAÇÃO & REDESIM 27 UFS',
    subtitle: 'Legalização Societária & 27 Juntas Comerciais',
    badgeLabel: 'GESTÃO SOCIETÁRIA',
    topGradient: ['#22D3EE', '#0891B2'],
    rightGradient: ['#06B6D4', '#0EA5E9'],
    bottomRightGradient: ['#38BDF8', '#0284C7'],
    bottomLeftGradient: ['#0284C7', '#1E3A8A'],
    leftGradient: ['#0F172A', '#164E63'],
    glowColor: 'rgba(6, 182, 212, 0.6)',
    textColor: 'from-cyan-400 via-teal-300 to-cyan-500',
    accentBg: 'bg-cyan-500/10',
    borderAccent: 'border-cyan-500/30',
    IconComponent: Building2
  },
  auditoria: {
    id: 'auditoria',
    name: 'VÉRTICE AUDITORIA INTELIGENTE',
    code: 'VÉRTICE // AUDITORIA INTELIGENTE IA',
    subtitle: 'Auditoria Fiscal Preditiva com Inteligência Artificial',
    badgeLabel: 'PLATAFORMA INTEGRADA',
    topGradient: ['#2DD4BF', '#14B8A6'],
    rightGradient: ['#38BDF8', '#0284C7'],
    bottomRightGradient: ['#10B981', '#059669'],
    bottomLeftGradient: ['#06B6D4', '#0891B2'],
    leftGradient: ['#0F172A', '#064E3B'],
    glowColor: 'rgba(45, 212, 191, 0.6)',
    textColor: 'from-teal-400 via-cyan-300 to-emerald-400',
    accentBg: 'bg-teal-500/10',
    borderAccent: 'border-teal-500/30',
    IconComponent: ShieldCheck
  },
  tax: {
    id: 'tax',
    name: 'VÉRTICE PLANEJAMENTO TRIBUTÁRIO',
    code: 'VÉRTICE // SIMULADOR 4 REGIMES',
    subtitle: 'Simulação Comparativa Simples, Presumido, Real e Arbitrado',
    badgeLabel: 'PLANEJAMENTO TRIBUTÁRIO',
    topGradient: ['#60A5FA', '#2563EB'],
    rightGradient: ['#3B82F6', '#1D4ED8'],
    bottomRightGradient: ['#93C5FD', '#1D4ED8'],
    bottomLeftGradient: ['#1E40AF', '#172554'],
    leftGradient: ['#0F172A', '#1E3A8A'],
    glowColor: 'rgba(59, 130, 246, 0.55)',
    textColor: 'from-blue-400 via-sky-300 to-blue-500',
    accentBg: 'bg-blue-500/10',
    borderAccent: 'border-blue-500/30',
    IconComponent: Scale
  },
  contratos: {
    id: 'contratos',
    name: 'VÉRTICE CONTRATOS & JURÍDICO',
    code: 'VÉRTICE // INSTRUMENTOS CONTRATUAIS',
    subtitle: 'Contratos de Prestação de Serviços, CDC & Fidelidade',
    badgeLabel: 'CONTRATOS & JURÍDICO',
    topGradient: ['#FB923C', '#EA580C'],
    rightGradient: ['#F97316', '#C2410C'],
    bottomRightGradient: ['#FDBA74', '#EA580C'],
    bottomLeftGradient: ['#C2410C', '#7C2D12'],
    leftGradient: ['#1F1924', '#7C2D12'],
    glowColor: 'rgba(249, 115, 22, 0.55)',
    textColor: 'from-orange-400 via-amber-300 to-orange-500',
    accentBg: 'bg-orange-500/10',
    borderAccent: 'border-orange-500/30',
    IconComponent: Scale
  }
};

export interface BrandLogoProps {
  variant?: 'navbar' | 'hero' | 'report' | 'icon' | 'module' | 'badge' | 'watermark' | 'splash';
  module?: BrandModuleKey;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  showSubtitle?: boolean;
  showModuleIcon?: boolean;
  className?: string;
  animate?: boolean;
  watermarkOpacity?: number;
}

/**
 * Atualiza dinamicamente o Favicon da aba do navegador conforme o módulo ativo
 */
export function updateDynamicFavicon(module: BrandModuleKey = 'master') {
  if (typeof document === 'undefined') return;
  const config = BRAND_MODULE_CONFIGS[module] || BRAND_MODULE_CONFIGS.master;
  
  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <defs>
      <linearGradient id="t" x1="50%" y1="0%" x2="50%" y2="100%"><stop offset="0%" stop-color="${config.topGradient[0]}"/><stop offset="100%" stop-color="${config.topGradient[1]}"/></linearGradient>
      <linearGradient id="r" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${config.rightGradient[0]}"/><stop offset="100%" stop-color="${config.rightGradient[1]}"/></linearGradient>
      <linearGradient id="br" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${config.bottomRightGradient[0]}"/><stop offset="100%" stop-color="${config.bottomRightGradient[1]}"/></linearGradient>
      <linearGradient id="bl" x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="${config.bottomLeftGradient[0]}"/><stop offset="100%" stop-color="${config.bottomLeftGradient[1]}"/></linearGradient>
      <linearGradient id="l" x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="${config.leftGradient[0]}"/><stop offset="100%" stop-color="${config.leftGradient[1]}"/></linearGradient>
    </defs>
    <polygon points="50,4 90,27 50,50 10,27" fill="url(#t)"/>
    <polygon points="90,27 90,73 50,50" fill="url(#r)"/>
    <polygon points="90,73 50,96 50,50" fill="url(#br)"/>
    <polygon points="50,96 10,73 50,50" fill="url(#bl)"/>
    <polygon points="10,73 10,27 50,50" fill="url(#l)"/>
    <polygon points="50,4 90,27 90,73 50,96 10,73 10,27" fill="none" stroke="#FFFFFF" stroke-opacity="0.4" stroke-width="1.5"/>
    <path d="M 28,28 L 50,72 L 72,28" fill="none" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="50" cy="34" r="5" fill="#FBBF24"/>
  </svg>`;

  const encodedSvg = encodeURIComponent(svgString).replace(/'/g, "%27").replace(/"/g, "%22");
  const dataUrl = `data:image/svg+xml,${encodedSvg}`;

  let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.type = 'image/svg+xml';
  link.href = dataUrl;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'navbar',
  module = 'master',
  size = 'md',
  showSubtitle = true,
  showModuleIcon = true,
  className = '',
  animate = false,
  watermarkOpacity = 0.04
}) => {
  const config = BRAND_MODULE_CONFIGS[module] || BRAND_MODULE_CONFIGS.master;
  const ModuleIcon = config.IconComponent;

  // Render high-precision vector glyph of the 3D Isometric Hexagon Logo
  const renderGlyph = (iconPx: number = 36) => {
    const uid = `brand-${module}-${Math.random().toString(36).substring(2, 7)}`;

    return (
      <div className={`relative inline-flex items-center justify-center shrink-0 ${animate ? 'animate-pulse' : ''}`}>
        <svg
          width={iconPx}
          height={iconPx}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 transition-transform duration-300 transform group-hover:scale-105 filter drop-shadow-[0_2px_12px_rgba(0,0,0,0.3)]"
          style={{
            filter: `drop-shadow(0 0 12px ${config.glowColor})`
          }}
        >
          <defs>
            <linearGradient id={`${uid}-top`} x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor={config.topGradient[0]} />
              <stop offset="100%" stopColor={config.topGradient[1]} />
            </linearGradient>

            <linearGradient id={`${uid}-right`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={config.rightGradient[0]} />
              <stop offset="100%" stopColor={config.rightGradient[1]} />
            </linearGradient>

            <linearGradient id={`${uid}-bright`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={config.bottomRightGradient[0]} />
              <stop offset="100%" stopColor={config.bottomRightGradient[1]} />
            </linearGradient>

            <linearGradient id={`${uid}-bleft`} x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={config.bottomLeftGradient[0]} />
              <stop offset="100%" stopColor={config.bottomLeftGradient[1]} />
            </linearGradient>

            <linearGradient id={`${uid}-left`} x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={config.leftGradient[0]} />
              <stop offset="100%" stopColor={config.leftGradient[1]} />
            </linearGradient>

            <filter id={`${uid}-glow`} x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#FFFFFF" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* 3D Hexagon Polygonal Facets */}
          {/* Top Facet */}
          <polygon points="50,4 90,27 50,50 10,27" fill={`url(#${uid}-top)`} opacity="0.98" />
          
          {/* Right Facet */}
          <polygon points="90,27 90,73 50,50" fill={`url(#${uid}-right)`} opacity="0.95" />

          {/* Bottom Right Facet */}
          <polygon points="90,73 50,96 50,50" fill={`url(#${uid}-bright)`} opacity="0.95" />

          {/* Bottom Left Facet */}
          <polygon points="50,96 10,73 50,50" fill={`url(#${uid}-bleft)`} opacity="0.98" />

          {/* Left Facet */}
          <polygon points="10,73 10,27 50,50" fill={`url(#${uid}-left)`} opacity="0.98" />

          {/* Facet Seams */}
          <line x1="50" y1="4" x2="50" y2="50" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="1" />
          <line x1="90" y1="27" x2="50" y2="50" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="1" />
          <line x1="90" y1="73" x2="50" y2="50" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="1" />
          <line x1="50" y1="96" x2="50" y2="50" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="1" />
          <line x1="10" y1="73" x2="50" y2="50" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="1" />
          <line x1="10" y1="27" x2="50" y2="50" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="1" />

          {/* Outer Contour */}
          <polygon points="50,4 90,27 90,73 50,96 10,73 10,27" fill="none" stroke="#FFFFFF" strokeOpacity="0.4" strokeWidth="1.5" />

          {/* Prominent White 'V' overlay */}
          <path d="M 28,28 L 50,72 L 72,28" fill="none" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" filter={`url(#${uid}-glow)`} />

          {/* Center Nexus Golden Dot / Sun */}
          <circle cx="50" cy="34" r="5" fill="#FBBF24" />
        </svg>

        {/* Central Module Icon Overlay */}
        {showModuleIcon && module !== 'master' && (
          <div className="absolute top-[28%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center p-0.5 rounded-full bg-slate-950/80 text-amber-300 border border-amber-400/50 shadow-md">
            <ModuleIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          </div>
        )}
      </div>
    );
  };

  // Watermark Variant (Large, translucent, esmaecida background watermark)
  if (variant === 'watermark') {
    const px = size === 'sm' ? 120 : size === 'lg' ? 280 : size === 'xl' ? 380 : size === '2xl' ? 520 : 200;
    return (
      <div 
        className={`pointer-events-none select-none flex flex-col items-center justify-center ${className}`} 
        style={{ opacity: watermarkOpacity }}
      >
        {renderGlyph(px)}
        <div className="mt-4 text-center">
          <span className="font-extrabold tracking-widest text-slate-100 uppercase text-xs sm:text-sm font-sans block">
            {config.name}
          </span>
          <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 uppercase tracking-[0.25em]">
            AUDITORIA TRIBUTÁRIA • SISTEMA PERICIAL
          </span>
        </div>
      </div>
    );
  }

  // Icon Only
  if (variant === 'icon') {
    const px = size === 'sm' ? 28 : size === 'md' ? 38 : size === 'lg' ? 48 : size === 'xl' ? 64 : size === '2xl' ? 88 : 120;
    return <div className={`inline-flex items-center justify-center ${className}`}>{renderGlyph(px)}</div>;
  }

  // Module / Badge Variant (Pill badge used in header or module cards)
  if (variant === 'module' || variant === 'badge') {
    const glyphSize = size === 'sm' ? 22 : size === 'lg' ? 32 : 26;
    return (
      <div className={`inline-flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border ${config.borderAccent} shadow-lg backdrop-blur-md select-none ${className}`}>
        {renderGlyph(glyphSize)}
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center space-x-1.5">
            <span className="font-black tracking-tight text-white text-[12px] font-sans">
              {config.name}
            </span>
            <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded ${config.accentBg} text-slate-200 border ${config.borderAccent} font-bold uppercase tracking-wider hidden sm:inline-block`}>
              {config.badgeLabel}
            </span>
          </div>
          <span className="text-[9px] font-mono text-slate-400 tracking-wide mt-0.5">
            {config.subtitle}
          </span>
        </div>
      </div>
    );
  }

  // Report Variant (High Contrast Print Mode)
  if (variant === 'report') {
    return (
      <div className={`flex items-center space-x-3.5 ${className}`}>
        {renderGlyph(42)}
        <div className="flex flex-col">
          <div className="flex items-baseline space-x-1.5">
            <span className="font-black tracking-tight text-slate-950 text-xl font-sans">VÉRTICE</span>
            <span className="font-extrabold text-blue-800 text-xl tracking-wider">AUDITOR FISCAL</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-800 border border-amber-500/30 font-bold ml-1">
              PRO AUDIT
            </span>
          </div>
          {showSubtitle && (
            <p className="text-[9px] font-mono text-slate-700 uppercase tracking-[0.22em] font-bold mt-0.5">
              Inteligência Tributária & Auditoria Regulatória
            </p>
          )}
        </div>
      </div>
    );
  }

  // Hero Variant (Big Landing Header)
  if (variant === 'hero') {
    return (
      <div className={`flex items-center space-x-4 ${className}`}>
        {renderGlyph(size === 'xl' ? 68 : size === 'lg' ? 56 : 48)}
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <span className="text-2xl sm:text-4xl font-black tracking-tight text-white font-sans">
              VÉRTICE
            </span>
            <span className={`text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r ${config.textColor} tracking-tight`}>
              AUDITOR FISCAL
            </span>
          </div>
          {showSubtitle && (
            <p className="text-[10px] sm:text-[12px] font-mono font-semibold text-slate-300 uppercase tracking-[0.22em] mt-1">
              {config.subtitle}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Default 'navbar' variant
  const glyphSize = size === 'sm' ? 28 : size === 'lg' ? 42 : 36;

  return (
    <div className={`flex items-center space-x-3 cursor-pointer group select-none ${className}`}>
      {renderGlyph(glyphSize)}
      <div className="flex flex-col">
        <div className="flex items-baseline space-x-1.5">
          <span className="text-base sm:text-lg font-black tracking-tight text-white group-hover:text-blue-200 transition-colors font-sans">
            VÉRTICE
          </span>
          <span className={`text-base sm:text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${config.textColor} tracking-tight`}>
            {module === 'master' ? 'AUDITOR FISCAL' : config.name.replace('VÉRTICE ', '')}
          </span>
        </div>
        {showSubtitle && (
          <p className="text-[9px] font-mono text-slate-400 uppercase tracking-[0.18em] leading-tight hidden sm:block">
            {config.subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
