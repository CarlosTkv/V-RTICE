import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft,
  Sparkles, 
  PieChart, 
  Scale, 
  TrendingUp, 
  FileText, 
  Building2, 
  Award, 
  Lock, 
  CheckCircle2, 
  Layers, 
  Calculator,
  Globe,
  Zap,
  Check,
  Play,
  ArrowUpRight,
  Video,
  Cpu,
  BarChart3,
  Percent,
  Key,
  QrCode,
  FileCheck,
  Receipt,
  Download,
  Send,
  HelpCircle
} from 'lucide-react';
import { AuthUser } from '../types';
import { LoginPage } from './LoginPage';
import { BrandLogo, BrandModuleKey, BRAND_MODULE_CONFIGS } from './BrandLogo';
import { BrandConvergenceSplash } from './BrandConvergenceSplash';
import { CosmicPrismaBackground } from './CosmicPrismaBackground';
import { ConnectedEcosystemShowcase } from './ConnectedEcosystemShowcase';
import { ParticleField } from './ParticleField';
import { ModuleIcon } from './ModuleIcon';
import { PLATFORM_PLANS } from '../data/adminBillingData';

import bgImage from '../assets/images/corporate_tech_office_bg_1789415696102.jpg';

interface LandingWelcomePortalProps {
  onLogin: (user: AuthUser) => void;
  forceInitialSplash?: boolean;
}

export const LandingWelcomePortal: React.FC<LandingWelcomePortalProps> = ({ 
  onLogin,
  forceInitialSplash = false
}) => {
  const [showInitialSplash, setShowInitialSplash] = useState<boolean>(() => {
    if (forceInitialSplash) return true;
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('vertice_intro_splash_seen') !== 'true';
    }
    return true;
  });
  const [viewState, setViewState] = useState<'landing' | 'login'>('landing');

  // Trigger cosmic pre-screen animation whenever returning from login to landing
  const handleBackToLanding = () => {
    setShowInitialSplash(true);
    setViewState('landing');
  };
  const [activeModuleIndex, setActiveModuleIndex] = useState<number>(0);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);
  const [mockRevenue, setMockRevenue] = useState<number>(180000);
  const [isLoadingBento, setIsLoadingBento] = useState<boolean>(true);
  
  // Interactive Live NFS-e Simulator State on Landing Page
  const [simValorServico, setSimValorServico] = useState<number>(4500);
  const [simClienteNome, setSimClienteNome] = useState<string>('Tecnologia Avançada LTDA');
  const [simCertificadoStatus, setSimCertificadoStatus] = useState<string>('Certificado e-CNPJ A1 Ativo (Validade: 2027)');
  const [simPlanPeriod, setSimPlanPeriod] = useState<'monthly' | 'annual'>('annual');
  const [showCertInfoModal, setShowCertInfoModal] = useState<boolean>(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoadingBento(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const modulesDetailed: Array<{
    id: string;
    brandModuleKey: BrandModuleKey;
    suite: string;
    code: string;
    title: string;
    subtitle: string;
    slogan: string;
    sublogoText: string;
    color: string;
    badgeColor: string;
    imageUrl: string;
    description: string;
    videoUrl: string;
    highlights: string[];
  }> = [
    // 1. SUITE CORE (FLAGSHIP)
    {
      id: 'mod_nexus',
      brandModuleKey: 'nfse',
      suite: 'SUITE CORE (FLAGSHIP)',
      code: 'SUITE CORE • EMISSOR FISCAL NACIONAL',
      title: 'Vértice Emissor Fiscal',
      subtitle: 'Emissão Nacional NFS-e & ADN Gov.br',
      slogan: 'Centraliza a emissão e transmissão automatizada de NFS-e diretamente para a base nacional (ADN Gov.br).',
      sublogoText: 'VÉRTICE // EMISSOR FISCAL NACIONAL',
      color: 'from-rose-500 to-teal-500',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1200&auto=format&fit=crop',
      description: 'Emissão e transmissão automatizada de NFS-e ao ADN Gov.br com canal seguro mTLS, Split Payment via PIX dinâmico e disparo de lotes.',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-financial-data-42998-large.video.mp4',
      highlights: [
        'Transmissão mTLS com Certificado A1 (.pfx)',
        'Split Payment PIX com QR Code Dinâmico',
        'Emissão em Lote & Disparo Direto (PDF/XML)'
      ]
    },

    // 2. SUITE ENGENHARIA FISCAL & CONTÁBIL
    {
      id: 'mod_horizon',
      brandModuleKey: 'simples',
      suite: 'SUITE ENGENHARIA FISCAL & CONTÁBIL',
      code: 'ENGENHARIA FISCAL • FATOR R',
      title: 'Vértice Fator R & Anexos',
      subtitle: 'Gestão Estratégica do Fator R & Pró-Labore',
      slogan: 'Monitora a relação folha/pró-labore e RBT12 nos últimos 12 meses, promovendo a transição legal do Anexo V (15,5%) para o Anexo III (6%).',
      sublogoText: 'VÉRTICE // FATOR R & SIMPLES',
      color: 'from-blue-500 to-cyan-500',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop',
      description: 'Auditoria contínua da relação folha/RBT12, transição segura entre Anexos V e III do Simples Nacional e cálculo do pró-labore ideal.',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-financial-data-42998-large.video.mp4',
      highlights: [
        'Auditoria RBT12 & Simples Nacional',
        'Otimização Pró-Labore Anexo III vs V',
        'Segregação QSA & Mapeamento Patronal (INSS/CPP)'
      ]
    },
    {
      id: 'mod_matrix',
      brandModuleKey: 'consultas',
      suite: 'SUITE ENGENHARIA FISCAL & CONTÁBIL',
      code: 'ENGENHARIA FISCAL • REGIMES',
      title: 'Vértice Comparador Tributário',
      subtitle: 'Simulador Comparativo de Regimes 4 em 1',
      slogan: 'Confronta em tempo real a carga tributária entre Simples Nacional, Lucro Presumido, Lucro Real e MEI.',
      sublogoText: 'VÉRTICE // COMPARADOR DE REGIMES',
      color: 'from-cyan-500 to-emerald-500',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200&auto=format&fit=crop',
      description: 'Simulação e confronto em tempo real entre Simples Nacional, Lucro Presumido, Real e MEI com deduções de ST e monofásicos.',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-stock-market-data-screen-41586-large.video.mp4',
      highlights: [
        'Confronto Simultâneo 4 Regimes Tributários',
        'Segregação por Anexos (I a V)',
        'Abatimento Monofásico & Alertas de Faixa'
      ]
    },
    {
      id: 'mod_catalog',
      brandModuleKey: 'monofasico',
      suite: 'SUITE ENGENHARIA FISCAL & CONTÁBIL',
      code: 'ENGENHARIA FISCAL • PRODUTOS',
      title: 'Vértice Classificação & Monofásico',
      subtitle: 'Inteligência Fiscal de Produtos & NCM',
      slogan: 'Classifica mercadorias e serviços mapeando tributações concentradas e regimes de substituição tributária.',
      sublogoText: 'VÉRTICE // CLASSIFICAÇÃO FISCAL & ST',
      color: 'from-teal-500 to-cyan-500',
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
      imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&auto=format&fit=crop',
      description: 'Classificação inteligente de NCM/NBS, segregação de PIS/COFINS Monofásico e dossiê de ICMS no transporte rodoviário em 27 UFs.',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-working-on-a-financial-graph-41585-large.video.mp4',
      highlights: [
        'Varredura PIS/COFINS Monofásico & CEST',
        'Parametrização CFOP, NCM e NBS',
        'Dossiê ICMS Transporte Cargas 27 UFs'
      ]
    },
    {
      id: 'mod_control',
      brandModuleKey: 'bpo',
      suite: 'SUITE ENGENHARIA FISCAL & CONTÁBIL',
      code: 'ENGENHARIA FISCAL • BPO FINANCEIRO',
      title: 'Vértice Gestão Financeira',
      subtitle: 'Painel Financeiro, BPO & Lucros Isentos',
      slogan: 'Centraliza o controle de contas a pagar, conciliação bancária automática e agendamento de títulos.',
      sublogoText: 'VÉRTICE // GESTÃO FINANCEIRA & BPO',
      color: 'from-amber-500 to-emerald-500',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=1200&auto=format&fit=crop',
      description: 'BPO financeiro com conciliação bancária automática, proporção ideal de lucros isentos e testes de estresse de fluxo de caixa.',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-stock-market-data-screen-41586-large.video.mp4',
      highlights: [
        'Contas a Pagar & Conciliação Automática',
        'Proporção Pró-Labore vs Lucros Isentos',
        'Stress Test & Resistência de Fluxo de Caixa'
      ]
    },

    // 3. SUITE COMPLIANCE, REFORMA & DIREITO
    {
      id: 'mod_vision',
      brandModuleKey: 'reforma',
      suite: 'SUITE COMPLIANCE, REFORMA & DIREITO',
      code: 'COMPLIANCE & DIREITO • REFORMA',
      title: 'Vértice Reforma Tributária',
      subtitle: 'Simulador do IVA Dual (IBS & CBS)',
      slogan: 'Projeta os impactos da transição para o modelo de IVA Dual (IBS + CBS + Imposto Seletivo) entre 2026 e 2033.',
      sublogoText: 'VÉRTICE // REFORMA TRIBUTÁRIA DUAL',
      color: 'from-emerald-500 to-indigo-500',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
      description: 'Simulação do IVA Dual (IBS/CBS e Seletivo 2026-2033), créditos amplos B2B e dimensionamento do Split Payment.',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-working-on-a-financial-graph-41585-large.video.mp4',
      highlights: [
        'Projeção Temporal IBS/CBS 2026-2033',
        'Análise de Créditos B2B & Não-Cumulatividade',
        'Simulador de Transição Split Payment'
      ]
    },
    {
      id: 'mod_shield',
      brandModuleKey: 'societario',
      suite: 'SUITE COMPLIANCE, REFORMA & DIREITO',
      code: 'COMPLIANCE & DIREITO • BLINDAGEM',
      title: 'Vértice Blindagem Societária',
      subtitle: 'Blindagem Societária & Sublimites',
      slogan: 'Fiscaliza riscos que podem gerar a exclusão do Simples Nacional, monitorando sublimites estaduais.',
      sublogoText: 'VÉRTICE // BLINDAGEM SOCIETÁRIA',
      color: 'from-cyan-500 to-blue-500',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop',
      description: 'Monitor de sublimites estaduais (R$ 3,6M), cruzamento de participações societárias e prevenção de desenquadramento.',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-financial-data-42998-large.video.mp4',
      highlights: [
        'Monitor de Sublimites Nacionais (R$ 3.6M)',
        'Auditoria de Participação Societária (>10%)',
        'Matriz de Riscos de Desenquadramento'
      ]
    },
    {
      id: 'mod_agenda',
      brandModuleKey: 'agenda',
      suite: 'SUITE COMPLIANCE, REFORMA & DIREITO',
      code: 'COMPLIANCE & DIREITO • CALENDÁRIO FISCAL',
      title: 'Vértice Agenda Fiscal',
      subtitle: 'Obrigações, DCTF, DAS, DARF & Vencimentos',
      slogan: 'Controle em tempo real de todas as obrigações acessórias federais, estaduais e municipais com alertas proativos.',
      sublogoText: 'VÉRTICE // AGENDA FISCAL & PRAZOS',
      color: 'from-pink-500 to-rose-500',
      badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
      imageUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=1200&auto=format&fit=crop',
      description: 'Controle em tempo real de prazos e obrigações (DCTFWeb, PGDAS-D, EFD-Reinf, SPED) com cálculo de juros e multas.',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-data-analysis-graphs-and-charts-42997-large.video.mp4',
      highlights: [
        'Calendário de Obrigações Acessórias',
        'Alertas de Vencimento de Guias (DAS/DARF/GPS)',
        'Sincronização eSocial & DCTFWeb'
      ]
    },
    {
      id: 'mod_certus',
      brandModuleKey: 'parecer',
      suite: 'SUITE COMPLIANCE, REFORMA & DIREITO',
      code: 'COMPLIANCE & DIREITO • LAUDOS CPC',
      title: 'Vértice Laudos & Perícias',
      subtitle: 'Laudos Periciais & Pareceres Art. 473 CPC',
      slogan: 'Automatiza a elaboração de pareceres contábeis e laudos periciais fundamentados no Art. 473 do CPC.',
      sublogoText: 'VÉRTICE // LAUDOS & PERÍCIAS CPC',
      color: 'from-indigo-500 to-purple-500',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=1200&auto=format&fit=crop',
      description: 'Elaboração automatizada de laudos periciais e pareceres contábeis pelo Art. 473 do CPC com autenticação por QR Code.',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-data-analysis-graphs-and-charts-42997-large.video.mp4',
      highlights: [
        'Parecer Pericial Art. 473 CPC',
        'Validador de Laudos QR Code ICP',
        'Exportação de Relatórios Oficiais PDF'
      ]
    },
    {
      id: 'mod_juris',
      brandModuleKey: 'teses',
      suite: 'SUITE COMPLIANCE, REFORMA & DIREITO',
      code: 'COMPLIANCE & DIREITO • TESES JURÍDICAS',
      title: 'Vértice Teses Tributárias',
      subtitle: 'Teses Tributárias & Defesas CARF',
      slogan: 'Repositório avançado focado nas Teses do Século e em entendimentos firmados em Repercussão Geral.',
      sublogoText: 'VÉRTICE // TESES & JURISPRUDÊNCIA',
      color: 'from-purple-600 to-indigo-600',
      badgeColor: 'bg-purple-600/20 text-purple-300 border-purple-600/40',
      imageUrl: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?q=80&w=1200&auto=format&fit=crop',
      description: 'Repositório estratégico de Teses do Século, jurisprudência atualizada do CARF e manual de responsabilidade civil do contador.',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-working-on-a-financial-graph-41585-large.video.mp4',
      highlights: [
        'Teses do Século & Repercussão Geral',
        'Jurisprudência Atualizada do CARF',
        'Responsabilidade Civil Contábil Art. 1.177'
      ]
    },

    // 4. SUITE INTEGRAÇÃO, CONHECIMENTO & EXPANSÃO
    {
      id: 'mod_express',
      brandModuleKey: 'legalizacao',
      suite: 'SUITE INTEGRAÇÃO, CONHECIMENTO & EXPANSÃO',
      code: 'INTEGRAÇÃO & EXPANSÃO • LEGALIZAÇÃO',
      title: 'Vértice Legalização & Juntas',
      subtitle: 'Legalização Societária & 27 Juntas Comerciais',
      slogan: 'Guia operacional interconectado com os sistemas e taxas de registro das 27 Juntas Comerciais do Brasil.',
      sublogoText: 'VÉRTICE // LEGALIZAÇÃO 27 JUNTAS',
      color: 'from-purple-500 to-amber-500',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop',
      description: 'Integração com 27 Juntas Comerciais, gerador de atos societários (DREI 81/20) e viabilidade urbana na REDESIM.',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-financial-data-42998-large.video.mp4',
      highlights: [
        'Guia Operacional 27 Juntas Comerciais',
        'Gerador de Contratos DREI 81/20 (LTDA/SLU)',
        'Consulta de Viabilidade REDESIM Integrada'
      ]
    },
    {
      id: 'mod_lexicon',
      brandModuleKey: 'conhecimentos',
      suite: 'SUITE INTEGRAÇÃO, CONHECIMENTO & EXPANSÃO',
      code: 'INTEGRAÇÃO & EXPANSÃO • CONHECIMENTO',
      title: 'Vértice Acervo Normativo',
      subtitle: 'Acervo Normativo da Receita Federal & SPED',
      slogan: 'Enciclopédia digital contendo instruções normativas da Receita Federal, manuais técnicos do eSocial/SPED.',
      sublogoText: 'VÉRTICE // ACERVO NORMATIVO RFB',
      color: 'from-blue-600 to-indigo-600',
      badgeColor: 'bg-blue-600/20 text-blue-200 border-blue-600/40',
      imageUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=1200&auto=format&fit=crop',
      description: 'Acervo dinâmico de Instruções Normativas da RFB, manuais SPED/eSocial e soluções de consulta oficiais da Cosit/CGSN.',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-data-analysis-graphs-and-charts-42997-large.video.mp4',
      highlights: [
        'Normas Oficiais RFB e PGDAS-D',
        'Guias Contábeis CFC & DREI (NBC TG PME)',
        'Soluções de Consulta Cosit/CGSN'
      ]
    },
    {
      id: 'mod_alliance',
      brandModuleKey: 'parceiros',
      suite: 'SUITE INTEGRAÇÃO, CONHECIMENTO & EXPANSÃO',
      code: 'INTEGRAÇÃO & EXPANSÃO • EXPANSÃO',
      title: 'Vértice Rede de Parceiros',
      subtitle: 'Portal de Parcerias & Comissões Mensais PIX',
      slogan: 'Plataforma de crescimento integrada que gera links de divulgação rastreáveis e cupons de desconto customizados.',
      sublogoText: 'VÉRTICE // REDE DE PARCEIROS',
      color: 'from-amber-500 to-orange-500',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      imageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1200&auto=format&fit=crop',
      description: 'Gestão de links comissionados, rastreamento de conversões e repasse mensal automatizado de comissões via PIX.',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-stock-market-data-screen-41586-large.video.mp4',
      highlights: [
        'Comissionamento Recorrente via PIX',
        'Links Rastreáveis & Cupons Customizados',
        'Kit de Divulgação & Marca Co-Branded'
      ]
    },

    // 5. SUITE INTELIGÊNCIA ARTIFICIAL (ADVANCED)
    {
      id: 'mod_neural',
      brandModuleKey: 'auditoria',
      suite: 'SUITE INTELIGÊNCIA ARTIFICIAL (ADVANCED)',
      code: 'IA ADVANCED • MOTOR PREDITIVO',
      title: 'Vértice Auditoria Inteligente',
      subtitle: 'Auditoria Fiscal Preditiva com Inteligência Artificial',
      slogan: 'Motor generativo e preditivo que realiza leitura inteligente de extratos e documentos via OCR.',
      sublogoText: 'VÉRTICE // AUDITORIA INTELIGENTE IA',
      color: 'from-purple-600 to-pink-600',
      badgeColor: 'bg-purple-600/20 text-purple-300 border-purple-600/40',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
      description: 'Motor generativo e preditivo que realiza leitura inteligente de extratos e documentos via OCR. Identifica inconformidades de alíquotas na raiz estrutural e sugere matrizes de correções embasadas legalmente na legislação federal para elisão fiscal.',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-financial-data-42998-large.video.mp4',
      highlights: [
        'OCR & Leitura Inteligente de Extratos PDF',
        'Ponto Causal de Erros (PGT)',
        'Matriz de Recomendações Corretivas com IA'
      ]
    }
  ];

  const activeMod = modulesDetailed[activeModuleIndex];

  // Calculated values for Live NFS-e Simulator
  const issValor = simValorServico * 0.05;
  const ibsValor = simValorServico * 0.088; // Reforma EC 132/23
  const cbsValor = simValorServico * 0.009; // Reforma EC 132/23
  const totalTributosSim = issValor + ibsValor + cbsValor;
  const valorLiquidoSim = simValorServico - totalTributosSim;

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 font-sans flex flex-col selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      
      {/* Full-Screen Convergence Splash Screen on Initial Load */}
      <AnimatePresence>
        {showInitialSplash && (
          <BrandConvergenceSplash 
            mode="intro" 
            onComplete={() => {
              setShowInitialSplash(false);
              if (typeof window !== 'undefined') {
                sessionStorage.setItem('vertice_intro_splash_seen', 'true');
              }
            }} 
          />
        )}
      </AnimatePresence>

      {/* Full Animated Cosmic Prisma Background (Exact Style of Pre-Screen) */}
      <CosmicPrismaBackground />

      {viewState === 'landing' ? (
        <div className="flex-1 flex flex-col justify-between relative z-10">
          
          {/* Top Navbar */}
          <motion.header 
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="px-6 sm:px-12 py-5 border-b border-slate-800/80 bg-[#0B0F19]/85 backdrop-blur-xl flex items-center justify-between sticky top-0 z-50 shadow-2xl"
          >
            <BrandLogo variant="navbar" size="md" />

            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewState('login')}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:opacity-95 text-white text-xs sm:text-sm font-extrabold transition flex items-center gap-2 shadow-lg shadow-emerald-900/40 cursor-pointer transform hover:scale-105"
              >
                <Lock className="w-4 h-4" />
                <span>Acessar o Sistema</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.header>

          {/* Main Hero Section */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-20 space-y-24">
            
            <div className="text-center max-w-5xl mx-auto space-y-8">
              
              {/* 3-LAYER EPIC CASCADE MATCHING BRANDING */}
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.3,
                      delayChildren: 0.2
                    }
                  }
                }}
                className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#0F172A]/90 to-[#0B0F19]/95 backdrop-blur-2xl border border-slate-700/85 shadow-2xl space-y-8 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Layer 1: Official Logo */}
                <motion.div
                  variants={{
                    hidden: { scale: 0.8, opacity: 0, y: 20 },
                    visible: { scale: 1, opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
                  }}
                  className="flex justify-center"
                >
                  <BrandLogo variant="icon" size="xl" className="scale-125 transform hover:scale-135 transition duration-500 drop-shadow-[0_0_25px_rgba(16,185,129,0.5)]" />
                </motion.div>

                {/* Layer 2: VÉRTICE AUDITOR & EMISSOR */}
                <motion.div
                  variants={{
                    hidden: { y: 25, opacity: 0 },
                    visible: { y: 0, opacity: 1, transition: { duration: 0.7, ease: 'easeOut' } }
                  }}
                >
                  <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08]">
                    <span className="text-white">VÉRTICE</span>{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400">EMISSOR & AUDITOR</span>
                  </h1>
                </motion.div>

                {/* Layer 3: PLATAFORMA INTEGRADA DE ALTA PERFORMANCE */}
                <motion.div
                  variants={{
                    hidden: { y: 25, opacity: 0 },
                    visible: { y: 0, opacity: 1, transition: { duration: 0.7, ease: 'easeOut' } }
                  }}
                  className="flex flex-wrap items-center justify-center gap-3"
                >
                  <div className="px-5 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs sm:text-sm font-bold font-mono tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    SOLUÇÃO FLAGSHIP • EMISSÃO NACIONAL GOV.BR
                  </div>
                  <div className="px-5 py-2 rounded-xl bg-blue-950/80 border border-blue-500/50 text-blue-300 text-xs sm:text-sm font-bold font-mono tracking-wider flex items-center gap-2">
                    <Scale className="w-4 h-4 text-blue-400" />
                    PILAR DE PERFORMANCE • AUDITORIA & REGIMES 360º
                  </div>
                </motion.div>

              </motion.div>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-3xl mx-auto font-medium"
              >
                O ecossistema definitivo para contadores, empresas e escritórios. Emita <strong>NFS-e Nacional Gov.br</strong> com precisão cirúrgica, vincule seu Certificado Digital A1, simule o Split Payment da Reforma Tributária (EC 132/23) e audite os 4 Regimes Tributários.
              </motion.p>

              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 1.1 }}
                className="flex flex-wrap items-center justify-center gap-4 pt-2"
              >
                <button
                  onClick={() => setViewState('login')}
                  className="px-9 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:opacity-95 text-white font-extrabold text-sm sm:text-base shadow-2xl shadow-emerald-900/60 flex items-center gap-3 transition transform hover:scale-105 cursor-pointer border border-emerald-400/30"
                >
                  <Zap className="w-5 h-5 text-amber-300" />
                  <span>Acessar o Emissor & Auditoria</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setIsVideoModalOpen(true)}
                  className="px-7 py-4 rounded-2xl bg-[#0F172A]/80 hover:bg-slate-800 text-slate-200 font-bold text-sm sm:text-base border border-slate-700 shadow-xl flex items-center gap-2.5 transition cursor-pointer backdrop-blur-md"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <span>Assistir Demonstração Ao Vivo</span>
                </button>
              </motion.div>

            </div>

            {/* LIVE SIMULATOR OF EMISSÃO DE NFS-E NACIONAL GOV.BR */}
            <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#0B0F19] via-[#0F172A] to-slate-900 border border-emerald-500/40 shadow-2xl relative overflow-hidden space-y-8">
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider border border-emerald-500/30">
                      SIMULADOR AO VIVO NA PÁGINA
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-400 text-[10px] font-mono border border-blue-800">
                      SCHEMA XSD v1.01-2026
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">Experimente o Emissor Nacional de NFS-e (Portal Gov.br)</h2>
                  <p className="text-xs sm:text-sm text-slate-300">
                    Altere os valores e veja a geração automática do DPS, Chave de Acesso de 50 dígitos, Split Payment e e-mail.
                  </p>
                </div>

                <button
                  onClick={() => setViewState('login')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <span>Emitir Nota Real no Sistema</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Inputs de Controle */}
                <div className="lg:col-span-5 space-y-5 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                        <span>Valor Bruto do Serviço (R$)</span>
                        <span className="text-emerald-400 font-mono text-sm font-extrabold">R$ {simValorServico.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </label>
                      <input 
                        type="range" 
                        min="500" 
                        max="50000" 
                        step="500"
                        value={simValorServico} 
                        onChange={(e) => setSimValorServico(Number(e.target.value))}
                        className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Tomador do Serviço (Cliente)</label>
                      <input 
                        type="text" 
                        value={simClienteNome} 
                        onChange={(e) => setSimClienteNome(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:border-emerald-500 outline-none"
                      />
                    </div>

                    <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                        <span className="flex items-center gap-1.5">
                          <Key className="w-4 h-4 text-emerald-400" />
                          Vínculo de Certificado Digital A1
                        </span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40 font-mono">OK</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-normal">
                        Assinatura digital automática e validação de permissão de emissão junto ao ADN da Receita Federal.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                      <span>ISS (5,00%):</span>
                      <span className="text-slate-200">R$ {issValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                      <span>IBS Dual (EC 132/23 - 8,80%):</span>
                      <span className="text-emerald-400 font-bold">R$ {ibsValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                      <span>CBS Federal (EC 132/23 - 0,90%):</span>
                      <span className="text-teal-400 font-bold">R$ {cbsValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold text-white pt-2 border-t border-slate-800">
                      <span>Valor Líquido a Receber:</span>
                      <span className="text-emerald-400 font-mono text-base font-extrabold">R$ {valorLiquidoSim.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                {/* Renderização Visual do Espelho do DPS / NFS-e */}
                <div className="lg:col-span-7 bg-[#060913] p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-6 shadow-inner">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-emerald-400" />
                        <span className="font-bold text-white text-sm">Espelho da NFS-e Nacional • DPS nº 0008492</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/40">
                        TRANSMITIDO // TRANSMISSÃO 200 OK
                      </span>
                    </div>

                    <div className="space-y-2 font-mono text-[11px] bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-300 space-y-2">
                      <div className="text-slate-400 text-[10px]">CHAVE DE ACESSO NACIONAL (50 DÍGITOS):</div>
                      <div className="text-emerald-400 font-bold break-all select-all">
                        3526094589212000013456001000000849210984120394
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2 text-[11px]">
                        <div>Prestador: <strong className="text-white">Vieira Consultoria ME</strong></div>
                        <div>Tomador: <strong className="text-white">{simClienteNome}</strong></div>
                      </div>
                    </div>

                    {/* Split Payment QR Code Simulation */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-emerald-950/40 border border-emerald-500/30 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                          <QrCode className="w-4 h-4 text-emerald-400" />
                          <span>Split Payment PIX Integrado</span>
                        </div>
                        <p className="text-[11px] text-slate-300">
                          Separação automática do tributo direto à conta da Receita / Prefeitura na liquidação.
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-white p-1 rounded border border-slate-300 flex items-center justify-center shrink-0">
                        <QrCode className="w-10 h-10 text-slate-900" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 text-slate-400">
                      <span className="flex items-center gap-1"><FileCheck className="w-4 h-4 text-emerald-400" /> XML v1.01</span>
                      <span className="flex items-center gap-1"><Download className="w-4 h-4 text-blue-400" /> DANFSE PDF</span>
                      <span className="flex items-center gap-1"><Send className="w-4 h-4 text-purple-400" /> E-mail Direto</span>
                    </div>
                    <button
                      onClick={() => setViewState('login')}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-extrabold text-xs transition cursor-pointer shadow-md"
                    >
                      Acessar Sistema
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Destaques e Inteligência • Bento Grid Section */}
            <div className="space-y-12">
              <div className="text-center space-y-3 max-w-3xl mx-auto">
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold">Destaques e Inteligência</span>
                <h2 className="text-3xl sm:text-4xl font-black text-white">Os 2 Pilares do Ecossistema Fiscal Vértice</h2>
                <p className="text-sm text-slate-400">Emissão de NFS-e e Auditoria Tributária reunidos na mesma plataforma inteligente</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {/* Pilar 1: Emissor NFS-e Nacional */}
                <motion.div 
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="p-8 rounded-3xl bg-gradient-to-br from-[#0B0F19] via-[#0F172A] to-rose-950/30 backdrop-blur-xl border border-rose-500/50 hover:border-rose-400 shadow-2xl relative overflow-hidden group flex flex-col justify-between space-y-6"
                  style={{
                    boxShadow: '0 0 35px rgba(244, 63, 94, 0.15)'
                  }}
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/15 rounded-full blur-3xl group-hover:bg-rose-500/30 transition duration-500 pointer-events-none" />
                  
                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <BrandLogo module="nfse" variant="badge" size="md" />
                      <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider font-bold bg-rose-950/80 px-2.5 py-1 rounded-full border border-rose-500/40">
                        FLAGSHIP EMISSÃO
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-white">Emissor NFS-e Nacional Gov.br (ADN/CGSN)</h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      Emissão direta de Notas Fiscais de Serviço com assinatura digital por Certificado A1 (.pfx), consulta e cancelamento, geração do DANFSE simplificado e Split Payment PIX da Reforma Tributária.
                    </p>
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                        <Check className="w-4 h-4 text-rose-400" />
                        <span>Transmissão em lote e e-mail direto ao tomador</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                        <Check className="w-4 h-4 text-rose-400" />
                        <span>Conformidade total com a Reforma Tributária EC 132/23</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 relative z-10 flex items-center justify-between border-t border-slate-800">
                    <span className="text-xs font-mono text-rose-400 font-bold">XSD Schema v1.01 Active</span>
                    <button 
                      onClick={() => setViewState('login')}
                      className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 group-hover:translate-x-1 transition cursor-pointer"
                    >
                      Abrir Emissor <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>

                {/* Pilar 2: Auditoria Tributária 4 em 1 */}
                <motion.div 
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="p-8 rounded-3xl bg-gradient-to-br from-[#0B0F19] via-[#0F172A] to-blue-950/30 backdrop-blur-xl border border-blue-500/50 hover:border-blue-400 shadow-2xl relative overflow-hidden group flex flex-col justify-between space-y-6"
                  style={{
                    boxShadow: '0 0 35px rgba(59, 130, 246, 0.15)'
                  }}
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl group-hover:bg-blue-500/30 transition duration-500 pointer-events-none" />
                  
                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <BrandLogo module="master" variant="badge" size="md" />
                      <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider font-bold bg-blue-950/80 px-2.5 py-1 rounded-full border border-blue-500/40">
                        AUDITORIA 360º
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-white">Auditoria Tributária & Regimes 4 em 1</h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      Comparativo simultâneo de Simples Nacional, Lucro Presumido, Lucro Real e MEI. Auditoria preditiva de Fator R (≥ 28%), monitoramento de sócios e emissão de Laudos Periciais CPC em PDF com assinatura CRC.
                    </p>
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                        <Check className="w-4 h-4 text-blue-400" />
                        <span>Dimensionamento perfeito do Pró-Labore para o Anexo III</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                        <Check className="w-4 h-4 text-blue-400" />
                        <span>Laudo pericial com gráficos em alta resolução</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 relative z-10 flex items-center justify-between border-t border-slate-800">
                    <span className="text-xs font-mono text-blue-400 font-bold">Art. 473 CPC Compliant</span>
                    <button 
                      onClick={() => setViewState('login')}
                      className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 group-hover:translate-x-1 transition cursor-pointer"
                    >
                      Abrir Auditoria <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* SEÇÃO DE PLANOS DE VENDA & REORGANIZAÇÃO COMERCIAL */}
            <div className="space-y-12 pt-8">
              <div className="text-center space-y-3 max-w-3xl mx-auto">
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold">Planos & Investimento</span>
                <h2 className="text-3xl sm:text-4xl font-black text-white">Escolha o Plano Ideal para a Sua Empresa ou Escritório</h2>
                <p className="text-sm text-slate-400">Transparência total sem taxas ocultas. Cancele ou altere a qualquer momento.</p>

                {/* Periodicity Switch */}
                <div className="flex items-center justify-center gap-3 pt-4">
                  <span className={`text-xs font-bold ${simPlanPeriod === 'monthly' ? 'text-white' : 'text-slate-400'}`}>Mensal</span>
                  <button
                    onClick={() => setSimPlanPeriod(simPlanPeriod === 'monthly' ? 'annual' : 'monthly')}
                    className="w-14 h-7 rounded-full bg-slate-800 border border-slate-700 p-1 flex items-center cursor-pointer transition"
                  >
                    <div className={`w-5 h-5 rounded-full bg-emerald-500 shadow-md transform transition-transform ${simPlanPeriod === 'annual' ? 'translate-x-7 bg-emerald-400' : 'translate-x-0'}`} />
                  </button>
                  <span className={`text-xs font-bold flex items-center gap-1.5 ${simPlanPeriod === 'annual' ? 'text-emerald-400' : 'text-slate-400'}`}>
                    Anual
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/40">
                      Até 20% OFF
                    </span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto items-stretch">
                {PLATFORM_PLANS.map((plan) => {
                  const priceShow = simPlanPeriod === 'annual' ? (plan.priceAnnual / 12) : plan.priceMonthly;
                  
                  return (
                    <motion.div
                      key={plan.id}
                      whileHover={{ scale: 1.02, y: -4 }}
                      transition={{ duration: 0.3 }}
                      className={`p-6 rounded-3xl bg-gradient-to-b from-[#0F172A] to-[#0B0F19] border flex flex-col justify-between space-y-6 relative overflow-hidden shadow-xl ${
                        plan.popular 
                          ? 'border-emerald-500 shadow-emerald-950/50 ring-2 ring-emerald-500/30' 
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {plan.badge && (
                        <div className="absolute top-4 right-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                            plan.popular 
                              ? 'bg-emerald-500 text-slate-950 border border-emerald-400' 
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}>
                            {plan.badge}
                          </span>
                        </div>
                      )}

                      <div className="space-y-4">
                        <div className="space-y-1">
                          <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                          <p className="text-xs text-slate-400 min-h-[36px]">{plan.description}</p>
                        </div>

                        <div className="space-y-1 pt-2 border-t border-slate-800">
                          <div className="flex items-baseline gap-1">
                            <span className="text-xs text-slate-400">R$</span>
                            <span className="text-3xl font-black text-white font-mono">{priceShow.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</span>
                            <span className="text-xs text-slate-400">/mês</span>
                          </div>
                          {simPlanPeriod === 'annual' && (
                            <p className="text-[10px] font-mono text-emerald-400 font-bold">
                              Faturado anualmente (R$ {plan.priceAnnual.toLocaleString('pt-BR')})
                            </p>
                          )}
                        </div>

                        <div className="space-y-2 pt-4 border-t border-slate-800">
                          {plan.features.map((feat, fIdx) => (
                            <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-300">
                              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span className="leading-tight">{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => setViewState('login')}
                        className={`w-full py-3 rounded-xl font-bold text-xs transition cursor-pointer shadow-lg flex items-center justify-center gap-2 mt-4 ${
                          plan.popular 
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        }`}
                      >
                        <span>Contratar {plan.name}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Modules with Sublogos & Video/Image Transitions */}
            <div className="space-y-12 pt-8">
              <div className="text-center space-y-3 max-w-3xl mx-auto">
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold">ECOSSISTEMA VÉRTICE DE INTELIGÊNCIA FISCAL</span>
                <h2 className="text-3xl sm:text-5xl font-black text-white">Módulos de Alta Performance</h2>
                <p className="text-sm sm:text-base text-slate-300">
                  Conheça o detalhamento técnico, motores analíticos e as soluções especializadas do ecossistema.
                </p>
              </div>

              {/* Module Selector Tabs with Brand Logos & Palettes */}
              <div className="space-y-2 max-w-6xl mx-auto">
                {/* Row 1: First 6 Modules */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {modulesDetailed.slice(0, 6).map((mod, mIdx) => {
                    const isSel = mIdx === activeModuleIndex;
                    const modConfig = BRAND_MODULE_CONFIGS[mod.brandModuleKey] || BRAND_MODULE_CONFIGS.master;
                    return (
                      <button
                        key={mod.id}
                        onClick={() => setActiveModuleIndex(mIdx)}
                        style={
                          isSel
                            ? {
                                background: `linear-gradient(135deg, ${modConfig.topGradient[0]}, ${modConfig.rightGradient[0]})`,
                                borderColor: modConfig.topGradient[0],
                                boxShadow: `0 0 22px ${modConfig.glowColor}`
                              }
                            : undefined
                        }
                        className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                          isSel
                            ? 'text-white scale-102 shadow-xl ring-1 ring-white/30 z-10'
                            : 'bg-[#0B101D]/90 text-slate-300 hover:text-white hover:bg-slate-800/80 border-slate-800/80'
                        }`}
                      >
                        <div className="scale-75 origin-center shrink-0">
                          <BrandLogo 
                            variant="icon" 
                            module={mod.brandModuleKey} 
                            size="sm" 
                            showModuleIcon={true} 
                          />
                        </div>
                        <span className="truncate">{mod.title.replace('Vértice ', '')}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Row 2: Next 6 Modules */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {modulesDetailed.slice(6, 12).map((mod, mIdxOffset) => {
                    const mIdx = mIdxOffset + 6;
                    const isSel = mIdx === activeModuleIndex;
                    const modConfig = BRAND_MODULE_CONFIGS[mod.brandModuleKey] || BRAND_MODULE_CONFIGS.master;
                    return (
                      <button
                        key={mod.id}
                        onClick={() => setActiveModuleIndex(mIdx)}
                        style={
                          isSel
                            ? {
                                background: `linear-gradient(135deg, ${modConfig.topGradient[0]}, ${modConfig.rightGradient[0]})`,
                                borderColor: modConfig.topGradient[0],
                                boxShadow: `0 0 22px ${modConfig.glowColor}`
                              }
                            : undefined
                        }
                        className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                          isSel
                            ? 'text-white scale-102 shadow-xl ring-1 ring-white/30 z-10'
                            : 'bg-[#0B101D]/90 text-slate-300 hover:text-white hover:bg-slate-800/80 border-slate-800/80'
                        }`}
                      >
                        <div className="scale-75 origin-center shrink-0">
                          <BrandLogo 
                            variant="icon" 
                            module={mod.brandModuleKey} 
                            size="sm" 
                            showModuleIcon={true} 
                          />
                        </div>
                        <span className="truncate">{mod.title.replace('Vértice ', '')}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Row 3: Remaining 2 Modules Centered */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-0.5">
                  {modulesDetailed.slice(12, 14).map((mod, mIdxOffset) => {
                    const mIdx = mIdxOffset + 12;
                    const isSel = mIdx === activeModuleIndex;
                    const modConfig = BRAND_MODULE_CONFIGS[mod.brandModuleKey] || BRAND_MODULE_CONFIGS.master;
                    return (
                      <button
                        key={mod.id}
                        onClick={() => setActiveModuleIndex(mIdx)}
                        style={
                          isSel
                            ? {
                                background: `linear-gradient(135deg, ${modConfig.topGradient[0]}, ${modConfig.rightGradient[0]})`,
                                borderColor: modConfig.topGradient[0],
                                boxShadow: `0 0 22px ${modConfig.glowColor}`
                              }
                            : undefined
                        }
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border min-w-[200px] ${
                          isSel
                            ? 'text-white scale-102 shadow-xl ring-1 ring-white/30 z-10'
                            : 'bg-[#0B101D]/90 text-slate-300 hover:text-white hover:bg-slate-800/80 border-slate-800/80'
                        }`}
                      >
                        <div className="scale-75 origin-center shrink-0">
                          <BrandLogo 
                            variant="icon" 
                            module={mod.brandModuleKey} 
                            size="sm" 
                            showModuleIcon={true} 
                          />
                        </div>
                        <span className="truncate">{mod.title.replace('Vértice ', '')}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Module Showcase with Dynamic Brand Identity */}
              {(() => {
                const activeConfig = BRAND_MODULE_CONFIGS[activeMod.brandModuleKey] || BRAND_MODULE_CONFIGS.master;
                return (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeMod.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      style={{
                        boxShadow: `0 0 45px ${activeConfig.glowColor}`,
                        borderColor: activeConfig.topGradient[0] + '55'
                      }}
                      className="max-w-6xl mx-auto rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0B0F19] backdrop-blur-xl border p-6 sm:p-10 shadow-2xl relative overflow-hidden"
                    >
                      <div 
                        className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20"
                        style={{ backgroundColor: activeConfig.topGradient[0] }}
                      />

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        
                        <div className="lg:col-span-7 space-y-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3 flex-wrap">
                              <BrandLogo 
                                module={activeMod.brandModuleKey} 
                                variant="badge" 
                                size="md" 
                              />
                              <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold border uppercase tracking-wider ${activeMod.badgeColor}`}>
                                {activeMod.code}
                              </span>
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-black text-white">{activeMod.title}</h3>
                            <p 
                              style={{ color: activeConfig.topGradient[0] }} 
                              className="text-sm sm:text-base font-semibold"
                            >
                              {activeMod.subtitle}
                            </p>
                          </div>

                          <div className="pt-2">
                            <button
                              onClick={() => setViewState('login')}
                              style={{
                                background: `linear-gradient(135deg, ${activeConfig.topGradient[0]}, ${activeConfig.rightGradient[0]})`,
                                boxShadow: `0 0 25px ${activeConfig.glowColor}`
                              }}
                              className="px-6 py-3.5 rounded-xl hover:opacity-95 text-white font-extrabold text-xs transition cursor-pointer flex items-center gap-2 shadow-xl"
                            >
                              <span>Acessar {activeMod.title}</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="lg:col-span-5">
                          <div className="rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl relative aspect-[4/3] bg-slate-950 group flex items-center justify-center">
                            <img 
                              src={activeMod.imageUrl} 
                              alt={activeMod.title}
                              className="w-full h-full object-cover filter brightness-75 group-hover:scale-110 transition duration-700"
                            />
                            
                            {/* Translucent Brand Logo Watermark on top of image */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="opacity-30 scale-150 filter drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                                <BrandLogo 
                                  variant="icon" 
                                  module={activeMod.brandModuleKey} 
                                  size="xl" 
                                  showModuleIcon={true}
                                />
                              </div>
                            </div>

                            <div 
                              className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" 
                            />
                            
                            <div className="absolute bottom-4 left-4 right-4 space-y-1 z-10">
                              <span 
                                style={{
                                  backgroundColor: activeConfig.topGradient[0] + '25',
                                  borderColor: activeConfig.topGradient[0] + '60',
                                  color: activeConfig.topGradient[0]
                                }}
                                className="text-[10px] font-mono font-bold px-2.5 py-1 rounded border block w-fit"
                              >
                                {activeConfig.badgeLabel}
                              </span>
                              <h4 className="text-xs font-bold text-white line-clamp-1">{activeMod.title}</h4>
                            </div>
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  </AnimatePresence>
                );
              })()}

            </div>

            {/* Interactive ROI Calculator */}
            <div className="max-w-4xl mx-auto p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] border border-slate-700 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                    <Calculator className="w-4 h-4 text-emerald-400" />
                    <span>Simulador de Economia Tributária</span>
                  </div>
                  <h3 className="text-2xl font-extrabold text-white">Quanto você economiza por mês no Fator R?</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Arraste o cursor para simular o faturamento mensal médio de empresas do Anexo V do Simples Nacional.
                  </p>

                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-300 font-bold">Faturamento Mensal:</span>
                      <span className="text-emerald-400 font-extrabold text-sm">R$ {mockRevenue.toLocaleString('pt-BR')}</span>
                    </div>
                    <input
                      type="range"
                      min="40000"
                      max="500000"
                      step="10000"
                      value={mockRevenue}
                      onChange={(e) => setMockRevenue(Number(e.target.value))}
                      className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-[#0B0F19] border border-slate-800 text-center space-y-4 shadow-inner flex flex-col justify-center">
                  <span className="text-xs uppercase font-mono text-slate-400 tracking-wider">Economia Anual Estimada (Anexo III vs V)</span>
                  <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">
                    R$ {(mockRevenue * 12 * 0.095).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Calculado com base no enquadramento no Anexo III mediante Fator R ≥ 28%.
                  </p>
                  <button
                    onClick={() => setViewState('login')}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                  >
                    <span>Executar Auditoria no Sistema</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* PAINEL FINAL DE LOGOS DO ECOSSISTEMA CONECTADO VÉRTICE */}
            <div className="mt-14 pt-10 border-t border-slate-800/80">
              <ConnectedEcosystemShowcase />
            </div>

          </main>

          {/* Footer Aprimorado com Logo do Sistema no Canto Esquerdo */}
          <footer className="border-t border-slate-800/80 bg-[#070B14] py-8 sm:py-10 px-6 sm:px-12 relative z-10">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
              
              {/* Canto Esquerdo: Logo do Sistema & Identidade */}
              <div className="flex items-center gap-4 text-left">
                <BrandLogo variant="navbar" size="md" />
              </div>

              {/* Canto Direito / Central: Informações de Domínio, Contato e Conformidade */}
              <div className="flex flex-col items-center md:items-end text-center md:text-right space-y-1.5 text-xs text-slate-400 font-medium">
                <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 text-slate-300">
                  <span>Domínio Oficial: <a href="https://verticeanalises.com.br" target="_blank" rel="noreferrer" className="text-emerald-400 hover:text-emerald-300 font-mono font-semibold underline">verticeanalises.com.br</a></span>
                  <span className="text-slate-600 hidden sm:inline">•</span>
                  <span>Atendimento: <a href="mailto:contato@verticeanalises.com.br" className="text-blue-400 hover:text-blue-300 font-mono underline">contato@verticeanalises.com.br</a></span>
                </div>
                <p className="text-[11px] text-slate-500 max-w-xl">
                  © 2026 Vértice Auditor Fiscal & Emissor NFS-e Nacional • Todos os direitos reservados. Em conformidade com LC 123/06, EC 132/23 e Resoluções CGSN/ABRASF.
                </p>
              </div>

            </div>
          </footer>

        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex-1 flex flex-col items-center justify-center p-4 relative z-10"
        >
          <div className="mb-4">
            <button
              onClick={handleBackToLanding}
              className="text-xs text-slate-300 hover:text-white transition flex items-center gap-2 cursor-pointer bg-slate-900/90 hover:bg-slate-800 px-4 py-2 rounded-xl border border-slate-700/80 shadow-lg font-semibold"
            >
              <ArrowLeft className="w-4 h-4 text-blue-400" />
              <span>Voltar para a Página Inicial</span>
            </button>
          </div>
          <LoginPage onLogin={onLogin} onBackToLanding={handleBackToLanding} />
        </motion.div>
      )}

      {/* MODAL ESCLARECEDOR SOBRE CERTIFICADO DIGITAL A1 */}
      {showCertInfoModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#0F172A] border border-emerald-500/40 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0B0F19]">
              <div className="flex items-center gap-2.5">
                <Key className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-white text-sm">Esclarecimento Oficial: Certificado Digital para NFS-e</span>
              </div>
              <button
                onClick={() => setShowCertInfoModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-5 text-xs text-slate-300 leading-relaxed">
              <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-2">
                <h4 className="font-bold text-amber-300 text-sm flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  Afinal, é necessário vincular o Certificado Digital?
                </h4>
                <p>
                  <strong className="text-white">SIM, para emissão OFICIAL com validade jurídica!</strong> De acordo com as normas da Receita Federal e do Comitê Gestor do Simples Nacional (CGSN), a comunicação segura com o <strong>Portal Nacional da NFS-e (Ambiente Nacional de Dados - ADN)</strong> exige a transmissão com certificado digital ICP-Brasil e-CNPJ A1 (.pfx / .p12).
                </p>
              </div>

              <div className="space-y-3">
                <h5 className="font-bold text-white text-xs uppercase tracking-wider font-mono text-emerald-400">
                  Como funciona no Sistema Vértice:
                </h5>
                <ul className="space-y-2.5 list-disc pl-4">
                  <li>
                    <strong className="text-white">1. Vínculo Simplificado do Arquivo .PFX:</strong> Você sobe o arquivo do seu Certificado A1 ou da procuração do escritório contábil diretamente no painel. A chave é criptografada com algoritmo AES-256.
                  </li>
                  <li>
                    <strong className="text-white">2. Modo de Homologação / Simulação Gratuito:</strong> Não tem o certificado agora? O sistema oferece o modo de testes onde você pode simular a emissão de notas, cálculo de IBS/CBS e Split Payment sem precisar subir o certificado de imediato!
                  </li>
                  <li>
                    <strong className="text-white">3. Disparo de Avisos de Vencimento:</strong> O sistema avisa com 30 dias de antecedência quando seu certificado A1 estiver próximo de vencer para evitar interrupções nas vendas.
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  onClick={() => setShowCertInfoModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
                >
                  Entendi
                </button>
                <button
                  onClick={() => {
                    setShowCertInfoModal(false);
                    setViewState('login');
                  }}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg cursor-pointer flex items-center gap-2"
                >
                  <span>Experimentar o Emissor</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Demo Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#0F172A] border border-slate-700 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0B0F19]">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-white text-sm">Vértice Auditor Fiscal & Emissor NFS-e Nacional • Demonstração</span>
              </div>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕ Fechar
              </button>
            </div>
            <div className="p-8 text-center space-y-6 aspect-video flex flex-col items-center justify-center bg-slate-950 relative overflow-hidden">
              <video 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="absolute inset-0 w-full h-full object-cover opacity-30"
                src="https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-financial-data-42998-large.video.mp4"
              />
              <div className="relative z-10 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-600/30 text-emerald-400 flex items-center justify-center mx-auto animate-pulse">
                  <Play className="w-8 h-8 fill-current ml-1" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white">Cockpit Fiscal & Emissão Nacional em Execução</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Apresentação executiva demonstrando a velocidade da transmissão de NFS-e, split payment e a auditoria automatizada do Fator R.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsVideoModalOpen(false);
                    setViewState('login');
                  }}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shadow-lg"
                >
                  Experimentar o Sistema Agora
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
