import React, { useState } from 'react';
import pptxgen from 'pptxgenjs';
import jsPDF from 'jspdf';
import {
  Crown,
  Layers,
  Calculator,
  PieChart,
  ShieldCheck,
  Bot,
  FileText,
  Printer,
  ChevronRight,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  Tag,
  Play,
  Maximize2,
  Minimize2,
  Download,
  FileSpreadsheet,
  Zap,
  Briefcase,
  DollarSign,
  TrendingUp,
  Presentation,
  Shield,
  BadgePercent,
  Cpu,
  Building,
  Check,
  Sliders,
  BookOpen,
  Gavel,
  FileCode,
  Wallet,
  Award
} from 'lucide-react';

export const SystemOrganogramPresentation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'organogram' | 'slides' | 'table' | 'roi'>('organogram');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    m_nexus: true,
    m_horizon: true,
    m_matrix: true,
    m_catalog: true,
    m_control: true,
    m_vision: true,
    m_shield: true,
    m_certus: true,
    m_juris: true,
    m_express: true,
    m_lexicon: true,
    m_alliance: true,
    m_neural: true
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreenSlide, setIsFullscreenSlide] = useState(false);
  const [showWatermark, setShowWatermark] = useState(true);
  const [watermarkText, setWatermarkText] = useState('VÉRTICE AUDITOR FISCAL - AUDITORIA TRIBUTÁRIA — PLATAFORMA MASTER (CONFIDENCIAL & MARCA REGISTRADA)');
  const [isExportingPPTX, setIsExportingPPTX] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // ESTADO DA CALCULADORA DE ROI DO MARKETING
  const [clientCount, setClientCount] = useState(15);
  const [avgTicket, setAvgTicket] = useState(2500);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const expandAll = () => {
    setExpandedNodes({
      m_nexus: true, m_horizon: true, m_matrix: true, m_catalog: true, m_control: true, m_vision: true, m_shield: true, m_certus: true, m_juris: true, m_express: true, m_lexicon: true, m_alliance: true, m_neural: true
    });
  };

  const collapseAll = () => {
    setExpandedNodes({
      m_nexus: false, m_horizon: false, m_matrix: false, m_catalog: false, m_control: false, m_vision: false, m_shield: false, m_certus: false, m_juris: false, m_express: false, m_lexicon: false, m_alliance: false, m_neural: false
    });
  };

  const handlePrint = () => {
    window.print();
  };

  // ESTRUTURA COMPLETA DOS 13 MÓDULOS E SUBMÓDULOS PARA ORGANOGRAMA, TABELA E SLIDES
  const systemModules = [
    // 1. SUITE CORE (FLAGSHIP)
    {
      id: 'm_nexus',
      code: 'SUITE CORE • EMISSOR NACIONAL',
      title: 'Vértice Emissor Fiscal',
      badge: 'Emissor Fiscal Nacional Gov.br',
      color: 'border-emerald-500/50 text-emerald-300 bg-emerald-950/40',
      accentBg: 'bg-emerald-500',
      icon: FileCode,
      description: 'Centraliza a emissão e transmissão automatizada de NFS-e diretamente para a base nacional (ADN Gov.br). Conta com canal criptografado via mTLS, Split Payment automatizado por PIX com QR Code Dinâmico e envio inteligente de lotes com PDF/XML aos tomadores.',
      features: [
        {
          name: 'VÉRTICE Submódulo Transmissão mTLS ADN Gov.br',
          desc: 'Conexão criptografada direta via web service nacional com suporte ao Certificado Digital A1 (.pfx).'
        },
        {
          name: 'VÉRTICE Submódulo Split Payment PIX com QR Code',
          desc: 'Retenção e liquidação imediata dos tributos devidos diretamente na transação com geração de QR Code Dinâmico.'
        },
        {
          name: 'VÉRTICE Submódulo Emissão em Lote & Disparo Directo',
          desc: 'Processamento de notas de serviços em lote com disparo automático de PDF/XML para os tomadores.'
        }
      ]
    },

    // 2. SUITE ENGENHARIA FISCAL & CONTÁBIL
    {
      id: 'm_horizon',
      code: 'ENGENHARIA FISCAL • FATOR R',
      title: 'Vértice Fator R & Anexos',
      badge: 'Gestão Estratégica do Fator R',
      color: 'border-blue-500/50 text-blue-300 bg-blue-950/30',
      accentBg: 'bg-blue-500',
      icon: Calculator,
      description: 'Monitora continuamente a relação entre folha/pró-labore e faturamento acumulado (RBT12) nos últimos 12 meses. Promove a transição legal do Anexo V (15,5%) para o Anexo III (6%), simulando o pró-labore ideal e mapeando a alíquota patronal (INSS/CPP) antes do fechamento.',
      features: [
        {
          name: 'VÉRTICE Submódulo Auditoria RBT12 & Simples Nacional',
          desc: 'Monitora Folha + Pró-Labore dos últimos 12 meses sobre RBT12 para atingir a alíquota reduzida do Anexo III.'
        },
        {
          name: 'VÉRTICE Submódulo Otimização Pró-Labore Anexo III vs V',
          desc: 'Determina o valor exato de pró-labore adicional necessário para desenquadrar do Anexo V e economizar tributos.'
        },
        {
          name: 'VÉRTICE Submódulo Segregação QSA & Mapeamento Patronal',
          desc: 'Mapeia a alíquota patronal (INSS/CPP) e o impacto total da folha no caixa da empresa antes do recolhimento.'
        }
      ]
    },
    {
      id: 'm_matrix',
      code: 'ENGENHARIA FISCAL • REGIMES',
      title: 'Vértice Comparador Tributário',
      badge: 'Simulador Comparativo de Regimes 4 em 1',
      color: 'border-cyan-500/50 text-cyan-300 bg-cyan-950/30',
      accentBg: 'bg-cyan-500',
      icon: PieChart,
      description: 'Confronta em tempo real a carga tributária entre Simples Nacional, Lucro Presumido, Lucro Real e MEI. Permite segregar receitas por múltiplos Anexos, deduz automaticamente PIS/COFINS Monofásico ou ICMS-ST e emite alertas preventivos de estouro de faixas.',
      features: [
        {
          name: 'VÉRTICE Submódulo Confronto Simultâneo 4 Regimes',
          desc: 'Cruza Simples Nacional vs. Lucro Presumido vs. Lucro Real vs. MEI com relatórios visuais de economia anual.'
        },
        {
          name: 'VÉRTICE Submódulo Segregação por Anexos (I a V)',
          desc: 'Permite segregar o faturamento por Anexos na mesma empresa com precisão matemática.'
        },
        {
          name: 'VÉRTICE Submódulo Abatimento Monofásico & Alertas de Faixa',
          desc: 'Abatimento automático de PIS/COFINS Monofásico, ICMS Substituição Tributária e alertas de estouro de faixa.'
        }
      ]
    },
    {
      id: 'm_catalog',
      code: 'ENGENHARIA FISCAL • PRODUTOS',
      title: 'Vértice Classificação & Monofásico',
      badge: 'Inteligência Fiscal de Produtos (NCM & ST)',
      color: 'border-teal-500/50 text-teal-300 bg-teal-950/30',
      accentBg: 'bg-teal-500',
      icon: Tag,
      description: 'Classifica mercadorias e serviços mapeando tributações concentradas e regimes de substituição tributária. Isola itens monofásicos para abatimento na guia principal e oferece um dossiê atualizado sobre as regras de ICMS no transporte rodoviário de cargas nas 27 UFs.',
      features: [
        {
          name: 'VÉRTICE Submódulo Varredura PIS/COFINS Monofásico & CEST',
          desc: 'Catálogo de códigos de produtos com tributação concentrada de PIS/COFINS e ICMS Substituição Tributária.'
        },
        {
          name: 'VÉRTICE Submódulo Parametrização CFOP, NCM e NBS',
          desc: 'Vinculação cirúrgica de operações fiscais para evitar tributação em duplicidade.'
        },
        {
          name: 'VÉRTICE Submódulo Dossiê ICMS Transporte Cargas 27 UFs',
          desc: 'Guia completo e atualizado de tributação do transporte rodoviário em todos os 27 estados do país.'
        }
      ]
    },
    {
      id: 'm_control',
      code: 'ENGENHARIA FISCAL • BPO FINANCEIRO',
      title: 'Vértice Gestão Financeira',
      badge: 'Painel Financeiro, BPO, DRE & DFC',
      color: 'border-amber-500/50 text-amber-300 bg-amber-950/30',
      accentBg: 'bg-amber-500',
      icon: Wallet,
      description: 'Centraliza o controle de contas a pagar, conciliação bancária automática e agendamento de títulos. Desenha a proporção tributária perfeita entre pró-labore e distribuição isenta de lucros, contando com testes de estresse para avaliar a resistência do fluxo de caixa.',
      features: [
        {
          name: 'VÉRTICE Submódulo Contas a Pagar & Conciliação Automática',
          desc: 'Agendamento de títulos, baixa automática e reconciliação bancária contínua.'
        },
        {
          name: 'VÉRTICE Submódulo Proporção Pró-Labore vs Lucros Isentos',
          desc: 'Desenha a proporção tributária perfeita entre pró-labore e distribuição isenta de dividendos.'
        },
        {
          name: 'VÉRTICE Submódulo Stress Test & Resistência de Fluxo de Caixa',
          desc: 'Simulação de cenários financeiros adversos e testes de resistência de liquidez do caixa.'
        }
      ]
    },

    // 3. SUITE COMPLIANCE, REFORMA & DIREITO
    {
      id: 'm_vision',
      code: 'COMPLIANCE & DIREITO • REFORMA',
      title: 'Vértice Reforma Tributária',
      badge: 'Simulador da Reforma Tributária (IVA Dual)',
      color: 'border-purple-500/50 text-purple-300 bg-purple-950/30',
      accentBg: 'bg-purple-500',
      icon: Sparkles,
      description: 'Projeta os impactos da transição para o modelo de IVA Dual (IBS + CBS + Imposto Seletivo) entre 2026 e 2033. Simula a dinâmica de não-cumulatividade ampla nas vendas B2B e calcula os impactos do Split Payment nas margens de lucro de serviços, comércio e indústria.',
      features: [
        {
          name: 'VÉRTICE Submódulo Projeção Temporal IBS/CBS 2026-2033',
          desc: 'Calcula o efeito da substituição progressiva do PIS, COFINS, IPI, ICMS e ISS pelos novos impostos.'
        },
        {
          name: 'VÉRTICE Submódulo Análise de Créditos B2B & Não-Cumulatividade',
          desc: 'Simula a trava de liquidez provocada pelo recolhimento na fonte (Split Payment) e a não-cumulatividade ampla.'
        },
        {
          name: 'VÉRTICE Submódulo Simulador de Transição Split Payment',
          desc: 'Projeta a variação percentual de custos para prestadores de serviço, comércio e indústria.'
        }
      ]
    },
    {
      id: 'm_shield',
      code: 'COMPLIANCE & DIREITO • BLINDAGEM',
      title: 'Vértice Blindagem Societária',
      badge: 'Blindagem Societária & Sublimites',
      color: 'border-amber-500/50 text-amber-300 bg-amber-950/30',
      accentBg: 'bg-amber-500',
      icon: ShieldCheck,
      description: 'Fiscaliza riscos que podem gerar a exclusão do Simples Nacional. Monitora faturamentos perante os sublimites estaduais/municipais (R$ 3,6 Mi) e cruza participações societárias globais de sócios com mais de 10% de presença em outros CNPJs.',
      features: [
        {
          name: 'VÉRTICE Submódulo Monitor de Sublimites Nacionais (R$ 3.6M)',
          desc: 'Acompanha RBT12 e RBT12A em relação ao sublimite estadual de ICMS/ISS para apuração fora do DAS.'
        },
        {
          name: 'VÉRTICE Submódulo Auditoria de Participação Societária (>10%)',
          desc: 'Soma o faturamento global de sócios com mais de 10% de participação em outras empresas.'
        },
        {
          name: 'VÉRTICE Submódulo Matriz de Riscos de Desenquadramento',
          desc: 'Gera alertas preventivos de desenquadramento automático para proteção da contabilidade.'
        }
      ]
    },
    {
      id: 'm_certus',
      code: 'COMPLIANCE & DIREITO • LAUDOS CPC',
      title: 'Vértice Laudos & Perícias',
      badge: 'Inteligência Pericial & Laudos Art. 473 CPC',
      color: 'border-indigo-500/50 text-indigo-300 bg-indigo-950/30',
      accentBg: 'bg-indigo-500',
      icon: FileText,
      description: 'Automatiza a elaboração de pareceres contábeis e laudos periciais fundamentados no Art. 473 do Código de Processo Civil. Oferece formatação técnica para tribunais e validação de autenticidade aberta para órgãos externos e bancos por meio de QR Code.',
      features: [
        {
          name: 'VÉRTICE Submódulo Parecer Pericial Art. 473 CPC',
          desc: 'Documento completo formalizado com fundamentação jurídica e gráficos de alta definição.'
        },
        {
          name: 'VÉRTICE Submódulo Validador de Laudos QR Code ICP',
          desc: 'Validação pública da autenticidade do parecer em portal seguro para bancos e justiça.'
        },
        {
          name: 'VÉRTICE Submódulo Exportação de Relatórios Oficiais PDF',
          desc: 'Exporta laudos e pareceres prontos para protocolo em formato PDF A4 com autenticação.'
        }
      ]
    },
    {
      id: 'm_juris',
      code: 'COMPLIANCE & DIREITO • TESES JURÍDICAS',
      title: 'Vértice Teses Tributárias',
      badge: 'Teses Tributárias, CARF & Resp. Contábil',
      color: 'border-purple-600/50 text-purple-300 bg-purple-950/30',
      accentBg: 'bg-purple-600',
      icon: Gavel,
      description: 'Repositório avançado focado nas Teses do Século e em entendimentos firmados em Repercussão Geral. Reúne acórdãos atualizados do CARF para dar suporte a defesas de autuações e apresenta o manual de limites de responsabilidade civil do contador (Art. 1.177).',
      features: [
        {
          name: 'VÉRTICE Submódulo Teses do Século & Repercussão Geral',
          desc: 'Análise aprofundada da exclusão do ICMS da base do PIS/COFINS e teses pacificadas do STF/STJ.'
        },
        {
          name: 'VÉRTICE Submódulo Jurisprudência Atualizada do CARF',
          desc: 'Acórdãos do Conselho Administrativo de Recursos Fiscais para fundamentação de defesas.'
        },
        {
          name: 'VÉRTICE Submódulo Responsabilidade Civil Contábil Art. 1.177',
          desc: 'Limites legais da responsabilidade do contabilista perante o Fisco e clientes.'
        }
      ]
    },

    // 4. SUITE INTEGRAÇÃO, CONHECIMENTO & EXPANSÃO
    {
      id: 'm_express',
      code: 'INTEGRAÇÃO & EXPANSÃO • LEGALIZAÇÃO',
      title: 'Vértice Legalização & Juntas',
      badge: 'Legalização REDESIM & 27 Juntas Comerciais',
      color: 'border-amber-500/50 text-amber-300 bg-amber-950/30',
      accentBg: 'bg-amber-500',
      icon: Building,
      description: 'Guia operacional interconectado com os sistemas e taxas de registro das 27 Juntas Comerciais do Brasil. Automatiza a geração de atos societários (Contratos Sociais, SLU, EI e Distratos) sob as normas do DREI IN 81/20 com consulta de viabilidade urbana na REDESIM.',
      features: [
        {
          name: 'VÉRTICE Submódulo Guia Operacional 27 Juntas Comerciais',
          desc: 'Orientação técnica de procedimentos, taxas e exigências de todas as 27 UFs do país.'
        },
        {
          name: 'VÉRTICE Submódulo Gerador de Contratos DREI 81/20 (LTDA/SLU)',
          desc: 'Geração de contratos sociais de LTDA, SLU, EI e Distratos com autopreenchimento dinâmico.'
        },
        {
          name: 'VÉRTICE Submódulo Consulta de Viabilidade REDESIM Integrada',
          desc: 'Verificação prévia de endereço, viabilidade urbana e nome empresarial em tempo real.'
        }
      ]
    },
    {
      id: 'm_lexicon',
      code: 'INTEGRAÇÃO & EXPANSÃO • CONHECIMENTO',
      title: 'Vértice Acervo Normativo',
      badge: 'Acervo Normativo RFB, eSocial, CFC & DREI',
      color: 'border-blue-600/50 text-blue-300 bg-blue-950/30',
      accentBg: 'bg-blue-600',
      icon: BookOpen,
      description: 'Enciclopédia digital e atualizada contendo instruções normativas da Receita Federal, manuais técnicos do eSocial/SPED, diretrizes do CFC (NBC TG PME) e soluções de consulta oficiais da Cosit/CGSN para dirimir ambiguidades fiscais.',
      features: [
        {
          name: 'VÉRTICE Submódulo Normas Oficiais RFB e PGDAS-D',
          desc: 'Divisão rigorosa com fundamentação em instruções normativas e resoluções.'
        },
        {
          name: 'VÉRTICE Submódulo Guias Contábeis CFC & DREI (NBC TG PME)',
          desc: 'Normas de contabilidade para PMEs e regras societárias atualizadas.'
        },
        {
          name: 'VÉRTICE Submódulo Soluções de Consulta Cosit/CGSN',
          desc: 'Respostas oficiais do Fisco para dúvidas tributárias frequentes.'
        }
      ]
    },
    {
      id: 'm_alliance',
      code: 'INTEGRAÇÃO & EXPANSÃO • EXPANSÃO',
      title: 'Vértice Rede de Parceiros',
      badge: 'Portal de Expansão, Afiliados & Comissionamento',
      color: 'border-amber-500/50 text-amber-300 bg-amber-950/30',
      accentBg: 'bg-amber-500',
      icon: Award,
      description: 'Plataforma de crescimento integrada que gera links de divulgação rastreáveis e cupons de desconto customizados. Realiza o controle, rastreio de conversões e repasse automatizado de comissões recorrentes via PIX para escritórios e parceiros credenciados.',
      features: [
        {
          name: 'VÉRTICE Submódulo Comissionamento Recorrente via PIX',
          desc: 'Repasse automático das comissões de indicações de clientes diretamente via PIX.'
        },
        {
          name: 'VÉRTICE Submódulo Links Rastreáveis & Cupons Customizados',
          desc: 'Criação de links personalizados para prospecção de escritórios parceiros.'
        },
        {
          name: 'VÉRTICE Submódulo Kit de Divulgação & Marca Co-Branded',
          desc: 'Materiais de vendas, apresentações e marca personalizada co-branded.'
        }
      ]
    },

    // 5. SUITE INTELIGÊNCIA ARTIFICIAL (ADVANCED)
    {
      id: 'm_neural',
      code: 'IA ADVANCED • MOTOR PREDITIVO',
      title: 'Vértice Auditoria Inteligente',
      badge: 'Auditoria Fiscal Preditiva com IA & Leitura Digital',
      color: 'border-purple-500/50 text-purple-300 bg-purple-950/30',
      accentBg: 'bg-purple-500',
      icon: Bot,
      description: 'Motor generativo e preditivo que realiza leitura inteligente de extratos e documentos via OCR. Identifica inconformidades de alíquotas na raiz estrutural e sugere matrizes de correções embasadas legalmente na legislação federal para elisão fiscal.',
      features: [
        {
          name: 'VÉRTICE Submódulo OCR & Leitura Inteligente de Extratos PDF',
          desc: 'Lê dados fiscais brutos em PDF, identifica inconsistências de alíquotas e aponta erros.'
        },
        {
          name: 'VÉRTICE Submódulo Ponto Causal de Erros (PGT)',
          desc: 'Identifica o ponto causador de divergências no Simples Nacional e sugere correções.'
        },
        {
          name: 'VÉRTICE Submódulo Matriz de Recomendações Corretivas com IA',
          desc: 'Recomendações práticas e embasamento jurídico imediato para o contador.'
        }
      ]
    }
  ];

  // SLIDES DE APRESENTAÇÃO COMERCIAL / PITCH DECK
  const presentationSlides = [
    {
      title: 'Vértice Auditor Fiscal - Auditoria Tributária — O Ecossistema Definitivo de Inteligência Fiscal',
      subtitle: 'Apresentação Institucional & Soluções Comerciais para Escritórios e Empresas',
      type: 'cover',
      highlight: 'Transformando a complexidade do sistema tributário brasileiro em economia real e honorários de alto valor.',
      points: [
        'Diagnóstico do Fator R e Folha de Pagamento em tempo real',
        'Comparativo do Lucro Real, Presumido, Simples e Arbitrado',
        'Simulador da Reforma Tributária (IBS / CBS / Imposto Seletivo)',
        'Auditoria Societária da LC 123/06 para eliminação de riscos',
        'Auditor de Inteligência Artificial para pareceres e leis',
        'Relatórios White-Label de alto impacto visual para reuniões com clientes'
      ]
    },
    {
      title: 'Módulo 1: Otimização do Fator R & Pró-Labore Estratégico',
      subtitle: 'Como reduzir a carga tributária do Simples Nacional de 15,5% para 6%',
      type: 'feature',
      badge: 'Estratégia de Alto Valor Comercial',
      description: 'Empresas de serviços no Anexo V pagam alíquotas iniciais de 15,5%. Com a gestão do Fator R do Vértice Auditor Fiscal - Auditoria Tributária, o sistema calcula o pró-labore exato para reenquadrar a empresa no Anexo III com alíquota inicial de apenas 6%.',
      metrics: [
        { label: 'Redução Média de Imposto', value: 'Até 61%' },
        { label: 'Alíquota Inicial Anexo III', value: '6,0%' },
        { label: 'Fator R Alvo', value: '28,0%' }
      ],
      deliverables: [
        'Cálculo preciso do Pró-labore necessário sem estourar encargos de INSS',
        'Projeção do RBT12 x GPD nos últimos 12 meses',
        'Análise da CPP Patronal para tomada de decisão preventiva'
      ]
    },
    {
      title: 'Módulo 2: Comparativo Quadri-Regime & Segregação de Receita',
      subtitle: 'Simule instantaneamente qual é o regime perfeito para seu cliente',
      type: 'feature',
      badge: 'Simulação Simultânea em Tempo Real',
      description: 'Substitua planilhas manuais propensas a erro por um simulador quadri-regime em tempo real. Avalie a migração entre Simples Nacional, Lucro Presumido, Lucro Real e Lucro Arbitrado instantaneamente.',
      metrics: [
        { label: 'Regimes Comparados', value: '4 Regimes' },
        { label: 'Segregação de Anexos', value: 'Anexos I a V' },
        { label: 'Tratamentos Especiais', value: 'ST / Monofásico / Isenção' }
      ],
      deliverables: [
        'Quadro comparativo de tributos federais, estaduais e municipais',
        'Demonstrativo de economia anual projetada por regime',
        'Isolamento de receitas sujeitas a PIS/COFINS Monofásico e ICMS-ST'
      ]
    },
    {
      title: 'Módulo 3: Reforma Tributária (EC 132/23 & LC 214/24)',
      subtitle: 'Prepare seus clientes para o novo IVA Dual (IBS + CBS)',
      type: 'feature',
      badge: 'Diferencial de Mercado Inédito',
      description: 'A Reforma Tributária alterará radicalmente os preços, margens e contratos no Brasil entre 2026 e 2033. O Vértice Auditor Fiscal - Auditoria Tributária simula os impactos do IBS, CBS, Imposto Seletivo e Split Payment.',
      metrics: [
        { label: 'Transição Gradual', value: '2026 - 2033' },
        { label: 'Impostos Unificados', value: '5 Tributos ➔ 2' },
        { label: 'Alíquota de Referência', value: '~26,5% a 28%' }
      ],
      deliverables: [
        'Análise do fluxo de caixa sob o efeito do Split Payment',
        'Impacto da Não-Cumulatividade Plena (Crédito Amplo)',
        'Estratégia de precificação e adaptação aos regimes favorecidos'
      ]
    },
    {
      title: 'Módulo 4 & 5: Auditoria Societária & Inteligência Artificial',
      subtitle: 'Segurança jurídica e pareceres gerados em segundos',
      type: 'feature',
      badge: 'Tecnologia de Ponta & Compliance',
      description: 'Evite a exclusão do Simples Nacional por cruzamento de dados de sócios comuns ou estouramento de sublimites estaduais. Utilize o Agente IA para analisar pareceres e fundamentações fiscais.',
      metrics: [
        { label: 'Limite Nacional', value: 'R$ 4,8 Milhões' },
        { label: 'Sublimite ICMS/ISS', value: 'R$ 3,6 Milhões' },
        { label: 'Agente IA', value: 'Disponível 24/7' }
      ],
      deliverables: [
        'Detecção automática de somatório de faturamento entre empresas de mesmos sócios',
        'Pareceres técnicos gerados com fundamentação da RFB e Legislação',
        'Relatórios White-Label com marca d’água e logo do escritório'
      ]
    },
    {
      title: 'Módulo 8: Gestão Master SaaS & Proposta Comercial',
      subtitle: 'Controle de Licenças, Receita Recorrente e Modelo de Negócio',
      type: 'feature',
      badge: 'Escala & Faturamento',
      description: 'O Módulo Master disponibiliza gestão completa do faturamento do software, emissão de faturas com PIX Copia e Cola e Boleto Bancário, além de gestão de usuários e permissões.',
      metrics: [
        { label: 'Modelos de Cobrança', value: 'Boleto & PIX' },
        { label: 'Controle de Acesso', value: 'Matriz Granular' },
        { label: 'Customização', value: '100% White-Label' }
      ],
      deliverables: [
        'Visão consolidada de MRR (Receita Recorrente Mensal) e ARR',
        'Acesso parametrizável para equipes contábeis e clientes finais',
        'Infraestrutura segura com backup de dados e conformidade com a LGPD'
      ]
    },
    {
      title: 'Módulo 9: Base de Conhecimentos Técnicos & Normativos Oficiais',
      subtitle: 'Estruturação por Assuntos (Tributário, Fiscal, Contábil, Societário, Trabalhista, Comex) e Esferas',
      type: 'feature',
      badge: 'Fontes Oficiais & Segurança Operacional',
      description: 'Acervo oficial com fundamentação legal completa (RFB, CONFAZ, CFC NBC, DREI, MTE, MDIC), com subdivisões em Esfera Federal, Estadual (27 UFs), Municipal, Trabalhista e Pessoa Física.',
      metrics: [
        { label: 'Esferas Normativas', value: '5 Esferas' },
        { label: 'UFs Cobertas', value: '27 Estados' },
        { label: 'Assuntos Técnicos', value: '6 Pilares' }
      ],
      deliverables: [
        'Guias operacionais de PGDAS-D, retenções federais e municipais, eSocial e Comércio Exterior',
        'Regulamentação das 27 Secretarias Estaduais de Fazenda (ICMS, DIFAL, ST)',
        'Checklist oficial de obrigações contábeis e fechamento segundo o CFC'
      ]
    },
    {
      title: 'Módulo 10: Direito Empresarial, Administrativo & Jurisprudência',
      subtitle: 'Doutrina comentada e teses vinculantes aplicáveis às empresas e contadores',
      type: 'feature',
      badge: 'Blindagem Jurídica & Doutrina Avançada',
      description: 'Análise aprofundada de teses do STF, STJ, CARF e Tribunais de Contas: Tema 962 STJ, Desconsideração da PJ (Art. 50 CC), Responsabilidade do Contador (Art. 1.177 CC), Licitações ME/EPP (Lei 14.133/21) e Direito Penal Tributário.',
      metrics: [
        { label: 'Ramos do Direito', value: '5 Ramos' },
        { label: 'Precedentes de Cortes', value: 'STF / STJ / CARF' },
        { label: 'Blindagem', value: 'Sócios & Contadores' }
      ],
      deliverables: [
        'Fundamentação jurídica robusta para impugnações, defesas administrativas e pareceres periciais',
        'Orientação técnica contra a responsabilização patrimonial indevida de sócios e administradores',
        'Total interligação prática com os conhecimentos tributários, societários e contratuais'
      ]
    },
    {
      title: 'Módulo 11: Portal do Parceiro de Negócios & Repasses Recorrentes',
      subtitle: 'Programa de comissões de até 35% e isenção 100% de mensalidade',
      type: 'feature',
      badge: 'Escala & Monetização Recorrente',
      description: 'Estrutura completa para consultores tributários, contadores e integradores ampliarem seus ganhos com links parametrizados, cupons de desconto aos clientes e liquidação de comissões via PIX.',
      metrics: [
        { label: 'Isenção de Mensalidade', value: '100% (R$ 0)' },
        { label: 'Comissão Recorrente', value: 'Até 35%' },
        { label: 'Liquidação', value: 'Instantânea via PIX' }
      ],
      deliverables: [
        'Código e link exclusivo com cupom de desconto embutido para empresas e escritórios',
        'Extrato detalhado de assinantes ativos e comissões provisionadas',
        'Kit de marketing com mensagens prontas e apresentação institucional'
      ]
    }
  ];

  // GERADOR DE POWERPOINT (.PPTX) NATIVO COM MARCA D'ÁGUA DO SISTEMA
  const handleDownloadPPTX = async () => {
    setIsExportingPPTX(true);
    try {
      const pptx = new pptxgen();
      pptx.layout = 'LAYOUT_16x9';
      pptx.title = 'Apresentacao Comercial - Vértice Auditor Fiscal - Auditoria Tributária';

      // 1. SLIDE DE CAPA
      const slideCover = pptx.addSlide();
      slideCover.background = { color: '0F172A' };

      // Marca D'água do Sistema no PowerPoint
      slideCover.addText(watermarkText, {
        x: 0.5,
        y: 7.0,
        w: 9.0,
        h: 0.3,
        fontSize: 8,
        color: '64748B',
        fontFace: 'Arial',
        bold: true
      });

      // Borda decorativa superior
      slideCover.addShape('rect', { x: 0, y: 0, w: '100%', h: 0.15, fill: { color: 'F59E0B' } });

      slideCover.addText('VÉRTICE AUDITOR FISCAL - AUDITORIA TRIBUTÁRIA', {
        x: 0.8, y: 1.0, w: 8.5, h: 0.5, fontSize: 16, color: 'F59E0B', bold: true, fontFace: 'Arial'
      });

      slideCover.addText('Ecossistema de Inteligência,\nPlanejamento & Auditoria Fiscal', {
        x: 0.8, y: 1.6, w: 8.5, h: 1.4, fontSize: 26, color: 'FFFFFF', bold: true, fontFace: 'Arial'
      });

      slideCover.addText('Apresentação Oficial do Sistema, Módulos Operacionais e Oportunidades Fiscais.', {
        x: 0.8, y: 3.2, w: 8.5, h: 0.8, fontSize: 13, color: '94A3B8', fontFace: 'Arial'
      });

      // Tabela de resumo dos 8 módulos na Capa do PowerPoint
      const moduleSummaryRows = systemModules.map(m => [
        { text: m.code, options: { bold: true, color: 'F59E0B', fontSize: 9 } },
        { text: m.title, options: { color: 'FFFFFF', fontSize: 9 } },
        { text: m.badge, options: { color: '38BDF8', fontSize: 9 } }
      ]);

      slideCover.addTable(
        [
          [
            { text: 'Módulo', options: { fill: { color: '1E293B' }, color: 'F59E0B', bold: true } },
            { text: 'Descrição Técnica', options: { fill: { color: '1E293B' }, color: 'FFFFFF', bold: true } },
            { text: 'Entregável Principal', options: { fill: { color: '1E293B' }, color: '38BDF8', bold: true } }
          ],
          ...moduleSummaryRows
        ],
        { x: 0.8, y: 4.1, w: 8.5, colW: [1.2, 4.3, 3.0], border: { pt: 0.5, color: '334155' } }
      );

      // 2. SLIDES DOS 8 MÓDULOS
      systemModules.forEach((m) => {
        const slide = pptx.addSlide();
        slide.background = { color: '0F172A' };

        // Marca d'água em cada slide
        slide.addText(watermarkText, {
          x: 0.5, y: 7.0, w: 9.0, h: 0.3, fontSize: 8, color: '475569', fontFace: 'Arial', bold: true
        });

        // Borda superior azul/âmbar
        slide.addShape('rect', { x: 0, y: 0, w: '100%', h: 0.1, fill: { color: '3B82F6' } });

        slide.addText(`${m.code} — ${m.title}`, {
          x: 0.6, y: 0.5, w: 8.8, h: 0.6, fontSize: 18, color: 'FFFFFF', bold: true, fontFace: 'Arial'
        });

        slide.addText(`PROPOSTA DE VALOR: ${m.badge.toUpperCase()}`, {
          x: 0.6, y: 1.1, w: 8.8, h: 0.3, fontSize: 10, color: 'F59E0B', bold: true, fontFace: 'Arial'
        });

        slide.addText(m.description, {
          x: 0.6, y: 1.4, w: 8.8, h: 0.7, fontSize: 11, color: 'CBD5E1', fontFace: 'Arial'
        });

        // Tabela de Recursos do Módulo
        const featureRows = m.features.map(f => [
          { text: f.name, options: { bold: true, color: '38BDF8', fontSize: 10 } },
          { text: f.desc, options: { color: 'E2E8F0', fontSize: 9.5 } }
        ]);

        slide.addTable(
          [
            [{ text: 'Funcionalidade / Algoritmo', options: { fill: { color: '1E293B' }, color: 'F59E0B', bold: true } }, { text: 'Impacto Prático & Benefício ao Cliente', options: { fill: { color: '1E293B' }, color: 'FFFFFF', bold: true } }],
            ...featureRows
          ],
          { x: 0.6, y: 2.2, w: 8.8, colW: [2.8, 6.0], border: { pt: 0.8, color: '334155' } }
        );
      });

      // 3. SLIDE FINAL DE CONCLUSÃO E CONTATO
      const slideEnd = pptx.addSlide();
      slideEnd.background = { color: '020617' };

      slideEnd.addText(watermarkText, {
        x: 0.5, y: 7.0, w: 9.0, h: 0.3, fontSize: 8, color: '475569', fontFace: 'Arial', bold: true
      });

      slideEnd.addText('VÉRTICE AUDITOR FISCAL - AUDITORIA TRIBUTÁRIA — PLATAFORMA DE INTELIGÊNCIA FISCAL', {
        x: 0.8, y: 2.0, w: 8.5, h: 0.6, fontSize: 22, color: 'FFFFFF', bold: true, fontFace: 'Arial', align: 'center'
      });

      slideEnd.addText('Potencialize seu escritório contábil e gere economia fiscal real com segurança jurídica.', {
        x: 0.8, y: 2.8, w: 8.5, h: 0.8, fontSize: 14, color: 'F59E0B', fontFace: 'Arial', align: 'center'
      });

      slideEnd.addText('Para contratação de licenças e parcerias:\ncontato@snataxadvisor.com.br | www.snataxadvisor.com.br', {
        x: 0.8, y: 4.2, w: 8.5, h: 1.0, fontSize: 12, color: '94A3B8', fontFace: 'Arial', align: 'center'
      });

      // Salva arquivo .pptx
      await pptx.writeFile({ fileName: 'Vertice_Fiscal_Auditoria_Tributaria_Apresentacao_Oficial.pptx' });
    } catch (err) {
      console.error('Erro ao gerar PowerPoint:', err);
      alert('Não foi possível gerar a apresentação em PowerPoint. Tente novamente.');
    } finally {
      setIsExportingPPTX(false);
    }
  };

  // GERADOR DE PDF COMPLETO VIA JSPDF
  const handleDownloadPDF = () => {
    setIsExportingPDF(true);
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Fundo escuro
      doc.setFillColor(15, 23, 42); // #0F172A
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      // Cabeçalho
      doc.setTextColor(245, 158, 11); // Amber
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('VÉRTICE AUDITOR FISCAL - AUDITORIA TRIBUTÁRIA — ORGANOGRAMA E PLANO DE MÓDULOS', 15, 18);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Relatório Técnico Consolidado de Funcionalidades & Apresentação Institucional', 15, 25);

      let yPos = 35;

      systemModules.forEach((m, idx) => {
        if (yPos > pageHeight - 40) {
          doc.addPage();
          doc.setFillColor(15, 23, 42);
          doc.rect(0, 0, pageWidth, pageHeight, 'F');
          yPos = 20;
        }

        // Card do Módulo
        doc.setFillColor(11, 15, 25);
        doc.setDrawColor(51, 65, 85);
        doc.roundedRect(15, yPos, pageWidth - 30, 18, 2, 2, 'FD');

        doc.setTextColor(245, 158, 11);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`${m.code}: ${m.title}`, 20, yPos + 7);

        doc.setTextColor(148, 163, 184);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(m.description.substring(0, 120) + '...', 20, yPos + 13);

        yPos += 22;
      });

      // Marca D'água no rodapé do PDF
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.text(watermarkText, 15, pageHeight - 8);

      doc.save('Vertice_Fiscal_Auditoria_Tributaria_Organogram_e_Modulos.pdf');
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      window.print(); // Fallback para impressão nativa caso jsPDF tenha limitações
    } finally {
      setIsExportingPDF(false);
    }
  };

  // CÁLCULOS DA CALCULADORA DE ROI DO MARKETING
  const monthlyRevenue = clientCount * avgTicket;
  const annualRevenue = monthlyRevenue * 12;

  return (
    <div className="space-y-6 animate-fadeIn pb-12 relative">
      
      {/* MARCA D'ÁGUA DO SISTEMA (SOBREPOSIÇÃO VISUAL EM TELA) */}
      {showWatermark && (
        <div className="fixed bottom-3 right-4 z-50 pointer-events-none opacity-40 hover:opacity-100 transition no-print bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center space-x-2 shadow-lg">
          <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{watermarkText}</span>
        </div>
      )}

      {/* CABEÇALHO NO-PRINT DA CENTRAL MARKETING/MASTER */}
      <div className="no-print bg-[#0F172A] rounded-2xl p-6 border border-slate-800 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-950/70 text-amber-300 border border-amber-800/80 text-[11px] font-bold uppercase tracking-wider flex items-center space-x-1">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Gestão Master & Marketing Comercial</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-950/70 text-blue-300 border border-blue-800/80 text-[11px] font-semibold">
                Organograma, Apresentação & Downloads
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight flex items-center space-x-3">
              <span>Organograma do Sistema & Apresentação Oficial</span>
            </h1>
            
            <p className="text-sm text-slate-400 max-w-4xl leading-relaxed">
              Conspecto geral completo de todos os <strong>10 módulos funcionais</strong> do Vértice Auditor Fiscal - Auditoria Tributária. Disponível para exportação direta em <strong>PowerPoint (.pptx)</strong> com marca d’água do sistema, impressão em <strong>PDF de alta resolução</strong> ou apresentação de slides para reuniões.
            </p>
          </div>

          {/* BOTÕES DE EXPORTAÇÃO E DOWNLOAD */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Download PowerPoint */}
            <button
              onClick={handleDownloadPPTX}
              disabled={isExportingPPTX}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold text-xs sm:text-sm transition shadow-md flex items-center space-x-2 cursor-pointer border border-amber-300/40 disabled:opacity-50"
              title="Baixar apresentação editável no formato PowerPoint (.pptx) com marca d'água oficial"
            >
              <Presentation className="w-4 h-4 text-white" />
              <span>{isExportingPPTX ? 'Gerando PPTX...' : 'Baixar PowerPoint (.PPTX)'}</span>
            </button>

            {/* Download PDF */}
            <button
              onClick={handleDownloadPDF}
              disabled={isExportingPDF}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs sm:text-sm font-semibold transition border border-slate-700 flex items-center space-x-2 cursor-pointer shadow-xs disabled:opacity-50"
              title="Baixar documento PDF oficial ou imprimir"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Baixar PDF</span>
            </button>

            {/* Impressão Direta */}
            <button
              onClick={handlePrint}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
              title="Imprimir folha A4"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* NAVEGAÇÃO DE SEÇÕES DA APRESENTAÇÃO */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-5 mt-6 border-t border-slate-800">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('organogram')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center space-x-2 cursor-pointer ${
                activeTab === 'organogram'
                  ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-400/50'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>1. Organograma Visual Interativo</span>
            </button>

            <button
              onClick={() => setActiveTab('slides')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center space-x-2 cursor-pointer ${
                activeTab === 'slides'
                  ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400/50'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Play className="w-4 h-4" />
              <span>2. Apresentação em Slides Comercial</span>
            </button>

            <button
              onClick={() => setActiveTab('table')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center space-x-2 cursor-pointer ${
                activeTab === 'table'
                  ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400/50'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>3. Matriz de Módulos & Recursos</span>
            </button>

            <button
              onClick={() => setActiveTab('roi')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center space-x-2 cursor-pointer ${
                activeTab === 'roi'
                  ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-400/50'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>4. Calculadora de Honorários & ROI</span>
            </button>
          </div>

          {/* TOGGLE DA MARCA D'ÁGUA DO SISTEMA */}
          <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <input
              type="checkbox"
              id="toggle-watermark"
              checked={showWatermark}
              onChange={(e) => setShowWatermark(e.target.checked)}
              className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
            />
            <label htmlFor="toggle-watermark" className="text-slate-300 font-medium cursor-pointer">
              Marca D'água
            </label>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ABA 1: ORGANOGRAMA VISUAL INTERATIVO (ÁRVORE DE MÓDULOS)
      ========================================================================= */}
      {activeTab === 'organogram' && (
        <div className="print-page space-y-8">
          
          {/* NÓ CENTRAL MASTER DO ORGANOGRAMA */}
          <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border-2 border-amber-500/60 rounded-3xl p-6 shadow-2xl text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            {showWatermark && (
              <div className="text-[10px] font-mono text-amber-400/60 uppercase tracking-widest mb-2 font-bold">
                {watermarkText}
              </div>
            )}

            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-widest border border-amber-500/40 mb-3">
              <Crown className="w-4 h-4 text-amber-400" />
              <span>NÚCLEO CENTRAL DA PLATAFORMA DE INTELIGÊNCIA FISCAL</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              VÉRTICE AUDITOR FISCAL — ECOSSISTEMA COMPLETO
            </h2>
            
            <p className="text-sm sm:text-base text-slate-300 max-w-3xl mx-auto mt-2 font-medium">
              Arquitetura modular integrada para diagnóstico de Fator R, planejamento tributário quadri-regime, simulação da Reforma Tributária (IBS/CBS), auditoria societária e inteligência artificial.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto mt-6 text-left border-t border-slate-800 pt-4">
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center">
                <span className="block text-xl font-bold text-amber-400">10 Módulos</span>
                <span className="text-[11px] text-slate-400">Especializados</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center">
                <span className="block text-xl font-bold text-blue-400">4 Regimes</span>
                <span className="text-[11px] text-slate-400">Simultâneos</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center">
                <span className="block text-xl font-bold text-purple-400">EC 132 / LC 214</span>
                <span className="text-[11px] text-slate-400">Reforma Tributária</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center">
                <span className="block text-xl font-bold text-emerald-400">White-Label</span>
                <span className="text-[11px] text-slate-400">Pareceres em PDF</span>
              </div>
            </div>
          </div>

          {/* CONTROLES DE EXPANSÃO RÁPIDA */}
          <div className="flex justify-between items-center no-print">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Ramificação dos Módulos do Sistema
            </span>
            <div className="flex space-x-2">
              <button
                onClick={expandAll}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
              >
                Expandir Todos
              </button>
              <button
                onClick={collapseAll}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
              >
                Recolher
              </button>
            </div>
          </div>

          {/* GRID DE MÓDULOS DO ORGANOGRAMA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {systemModules.map((module) => {
              const IconComp = module.icon;
              const isExpanded = expandedNodes[module.id];

              return (
                <div 
                  key={module.id} 
                  className={`bg-[#0F172A] border rounded-2xl p-5 shadow-lg transition-all duration-200 avoid-break relative ${module.color}`}
                >
                  {/* Marca D'água no Card */}
                  {showWatermark && (
                    <div className="absolute top-2 right-3 text-[9px] font-mono text-slate-600/40 uppercase tracking-tighter pointer-events-none">
                      VÉRTICE AUDITOR FISCAL
                    </div>
                  )}

                  {/* Cabeçalho do Card do Módulo */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <div className={`p-3 rounded-xl ${module.accentBg} text-white font-bold shrink-0 shadow-md`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800">
                          {module.code}
                        </span>
                        <h3 className="text-base font-bold text-slate-100 mt-1 leading-snug">
                          {module.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          {module.description}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleNode(module.id)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition cursor-pointer no-print shrink-0"
                      title={isExpanded ? 'Recolher detalhes' : 'Expandir detalhes'}
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Detalhes e Ramificações de Recursos */}
                  {(isExpanded || true) && (
                    <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                        Sub-recursos & Algoritmos Integrados:
                      </span>

                      <div className="grid grid-cols-1 gap-2.5">
                        {module.features.map((feat, idx) => (
                          <div 
                            key={idx}
                            className="bg-[#0B0F19] p-3 rounded-xl border border-slate-800/90 flex items-start space-x-3 hover:border-slate-700 transition"
                          >
                            <span className="p-1 rounded-full bg-slate-800 text-amber-400 mt-0.5 shrink-0">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </span>
                            <div>
                              <h4 className="text-xs font-bold text-slate-200">
                                {feat.name}
                              </h4>
                              <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                                {feat.desc}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* RODAPÉ DO ORGANOGRAMA PARA IMPRESSÃO */}
          <div className="print-page border-t-2 border-slate-800 pt-6 mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <div>
              <p className="font-bold text-slate-200">VÉRTICE AUDITOR FISCAL — PLATAFORMA DE INTELIGÊNCIA FISCAL</p>
              <p className="text-[11px]">Documentação Oficial do Organograma para Marketing, Treinamento e Comercial.</p>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-amber-400 font-bold">
                {watermarkText}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ABA 2: APRESENTAÇÃO EM SLIDES COMERCIAS PARA VENDAS (SLIDE DECK)
      ========================================================================= */}
      {activeTab === 'slides' && (
        <div className="space-y-6">
          
          {/* CONTROLES DO SLIDE DECK */}
          <div className="no-print bg-[#0F172A] border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold text-slate-300">
                Slide {currentSlide + 1} de {presentationSlides.length}
              </span>
              <div className="flex space-x-1">
                {presentationSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`w-3 h-3 rounded-full transition cursor-pointer ${
                      currentSlide === i ? 'bg-amber-400 scale-125' : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                disabled={currentSlide === 0}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
              >
                Anterior
              </button>

              <button
                onClick={() => setCurrentSlide(prev => Math.min(presentationSlides.length - 1, prev + 1))}
                disabled={currentSlide === presentationSlides.length - 1}
                className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                Próximo Slide
              </button>

              <button
                onClick={() => setIsFullscreenSlide(!isFullscreenSlide)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer flex items-center space-x-1"
                title="Modo Apresentação de Reunião em Tela Cheia"
              >
                {isFullscreenSlide ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                <span>{isFullscreenSlide ? 'Sair' : 'Tela Cheia'}</span>
              </button>
            </div>
          </div>

          {/* EXIBIÇÃO DO SLIDE ATUAL */}
          <div className={`print-page bg-gradient-to-br from-[#0F172A] via-[#0B0F19] to-[#020617] border-2 border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl min-h-[520px] flex flex-col justify-between relative overflow-hidden ${
            isFullscreenSlide ? 'fixed inset-0 z-50 rounded-none border-none p-12 overflow-y-auto' : ''
          }`}>
            
            {/* Efeitos Visuais do Slide */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* MARCA D'ÁGUA NO SLIDE */}
            {showWatermark && (
              <div className="absolute bottom-3 left-6 right-6 text-center text-[10px] font-mono text-slate-500/50 uppercase tracking-widest pointer-events-none font-bold border-t border-slate-800/40 pt-2">
                {watermarkText}
              </div>
            )}

            <div>
              {/* Badge do Slide */}
              <div className="flex items-center justify-between mb-6">
                <span className="px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold uppercase tracking-wider">
                  {presentationSlides[currentSlide].badge || 'Apresentação Comercial'}
                </span>

                <span className="text-xs font-mono text-slate-400">
                  SLIDE {currentSlide + 1} / {presentationSlides.length}
                </span>
              </div>

              {/* Título e Subtítulo */}
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {presentationSlides[currentSlide].title}
              </h2>
              
              <p className="text-base sm:text-lg text-amber-400/90 font-medium mt-2">
                {presentationSlides[currentSlide].subtitle}
              </p>

              {/* Descrição do Slide */}
              {presentationSlides[currentSlide].description && (
                <p className="text-sm sm:text-base text-slate-300 mt-4 leading-relaxed max-w-4xl bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                  {presentationSlides[currentSlide].description}
                </p>
              )}

              {/* Se for Capa */}
              {presentationSlides[currentSlide].type === 'cover' && (
                <div className="mt-8 space-y-4">
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm font-semibold">
                    ✨ {presentationSlides[currentSlide].highlight}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    {presentationSlides[currentSlide].points?.map((pt, idx) => (
                      <div key={idx} className="flex items-center space-x-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs text-slate-200 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Se for Slide de Feature */}
              {presentationSlides[currentSlide].type === 'feature' && (
                <div className="mt-8 space-y-6">
                  
                  {/* Métricas do Slide */}
                  {presentationSlides[currentSlide].metrics && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {presentationSlides[currentSlide].metrics.map((m, idx) => (
                        <div key={idx} className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl text-center">
                          <span className="block text-2xl font-extrabold text-amber-400">{m.value}</span>
                          <span className="text-xs text-slate-400 font-medium mt-1 block">{m.label}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Entregáveis */}
                  {presentationSlides[currentSlide].deliverables && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                        O que o cliente final / escritório ganha:
                      </span>
                      <div className="grid grid-cols-1 gap-2">
                        {presentationSlides[currentSlide].deliverables.map((d, idx) => (
                          <div key={idx} className="flex items-start space-x-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-300">
                            <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <span>{d}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Rodapé do Slide */}
            <div className="mt-12 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">VÉRTICE AUDITOR FISCAL — Solução de Inteligência & Planejamento Tributário</span>
              <span className="font-mono">www.snataxadvisor.com.br</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ABA 3: TABELA MATRIZ DE FUNCIONALIDADES & ENTREGÁVEIS
      ========================================================================= */}
      {activeTab === 'table' && (
        <div className="print-page bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 relative">
          
          {showWatermark && (
            <div className="text-[10px] font-mono text-slate-500 uppercase text-right tracking-widest font-bold">
              {watermarkText}
            </div>
          )}

          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              <span>Matriz Consolidada de Recursos & Módulos</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Tabela de especificações técnicas para propostas comerciais, escopo de projeto e comparativo de mercado.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-slate-300 border-b border-slate-800">
                  <th className="p-3 font-bold">Módulo</th>
                  <th className="p-3 font-bold">Recursos Principais</th>
                  <th className="p-3 font-bold">Entregável ao Cliente</th>
                  <th className="p-3 font-bold">Público-Alvo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {systemModules.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-900/40 transition avoid-break">
                    <td className="p-3 font-bold text-amber-400 whitespace-nowrap">
                      {m.code} - {m.title}
                    </td>
                    <td className="p-3 leading-relaxed">
                      <ul className="list-disc list-inside space-y-1 text-slate-300">
                        {m.features.map((f, i) => (
                          <li key={i}><strong>{f.name}:</strong> {f.desc}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-3 text-emerald-300 font-medium">
                      {m.badge}
                    </td>
                    <td className="p-3 text-slate-400 whitespace-nowrap">
                      Contadores & Diretores Fiscais
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          ABA 4: CALCULADORA DE HONORÁRIOS & ROI DO MARKETING (PITCH DE VENDAS)
      ========================================================================= */}
      {activeTab === 'roi' && (
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 text-[11px] font-bold uppercase">
                Pitch Comercial de Vendas
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-100 mt-2 flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span>Simulador de Honorários & Retorno de Investimento (ROI)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Ferramenta para a equipe de marketing e vendas demonstrar a rentabilidade da contratação do Vértice Auditor Fiscal - Auditoria Tributária para escritórios contábeis.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* PARÂMETROS DA SIMULAÇÃO */}
            <div className="space-y-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
              <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>Parâmetros de Precificação Consultiva</span>
              </h4>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                    <span>Quantidade de Clientes Atendidos com Planejamento:</span>
                    <span className="text-amber-400 font-bold">{clientCount} empresas</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={clientCount}
                    onChange={(e) => setClientCount(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                    <span>Honorário Médio do Planejamento Tributário (R$ / Projeto):</span>
                    <span className="text-emerald-400 font-bold">R$ {avgTicket.toLocaleString('pt-BR')}</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="20000"
                    step="500"
                    value={avgTicket}
                    onChange={(e) => setAvgTicket(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 leading-relaxed">
                💡 <strong>Argumento Comercial:</strong> Apresentando um único planejamento tributário por mês que economize R$ 10.000,00 para o cliente final, o escritório cobra facilmente R$ 2.500,00 a R$ 5.000,00 de honorários de sucesso.
              </div>
            </div>

            {/* RESULTADOS FINANCEIROS PROJETADOS */}
            <div className="space-y-4 bg-gradient-to-br from-slate-900 to-emerald-950/30 p-5 rounded-2xl border border-emerald-500/30">
              <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Projeção de Faturamento Adicional do Escritório</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 font-medium block">Faturamento Mensal Adicional</span>
                  <span className="text-2xl font-extrabold text-emerald-400 mt-1 block">
                    R$ {monthlyRevenue.toLocaleString('pt-BR')}
                  </span>
                </div>

                <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 font-medium block">Faturamento Anual Projetado</span>
                  <span className="text-2xl font-extrabold text-amber-400 mt-1 block">
                    R$ {annualRevenue.toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
                <div className="flex justify-between">
                  <span>Custo Estimado da Plataforma:</span>
                  <span className="font-bold text-slate-100">Incluso no Plano Master</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2 font-bold text-emerald-400 text-sm">
                  <span>Retorno Sobre o Investimento (ROI):</span>
                  <span>1.200%+ ao ano</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
