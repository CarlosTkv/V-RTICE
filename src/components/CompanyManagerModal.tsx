import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  Trash2, 
  Plus, 
  Check, 
  AlertTriangle, 
  X, 
  Sparkles,
  Building,
  Upload,
  Lock,
  Search,
  Edit2,
  Users,
  CheckCircle2,
  FileSpreadsheet,
  FileCheck,
  CheckCircle,
  Briefcase,
  Layers,
  RefreshCw,
  Globe,
  Award,
  UserCheck,
  UserPlus,
  Sliders,
  ChevronRight,
  ChevronDown,
  CheckSquare,
  Square,
  MinusSquare,
  LockKeyhole,
  CreditCard,
  Receipt,
  DollarSign,
  Calendar,
  ShieldAlert,
  ArrowUpRight,
  Wallet,
  BookOpen,
  Mail,
  Shield,
  Filter,
  CheckCheck,
  Ban,
  Activity,
  Zap,
  ExternalLink,
  HelpCircle
} from 'lucide-react';
import { CompanyData, Partner, AuthUser, AppActiveTab } from '../types';
import { CertificateUploadField } from './CertificateUploadField';
import { AuthService, UserAccount } from '../utils/authService';
import { apiFetch } from '../utils/apiClient';
import { getUserAllowedModules, isDeveloperUser } from '../utils/permissionRules';

interface CompanyManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: CompanyData[];
  activeCompanyIndex: number;
  onSelectCompany: (index: number) => void;
  onCreateCompany: (company: CompanyData) => void;
  onUpdateCompany?: (company: CompanyData, index?: number) => void;
  onBatchCreateCompanies?: (companies: CompanyData[]) => void;
  onDeleteCompany: (index: number) => void;
  onOpenPDFUpload?: () => void;
  onClearCompanyData?: () => void;
  currentUser?: AuthUser;
}

export type VerticalNavTab = 
  | 'empresas' 
  | 'usuarios' 
  | 'certificados' 
  | 'acessos_perfis' 
  | 'financeiro' 
  | 'importacao_lote';

// Nível 3: Aba interna
export interface InternalTabDef {
  id: string;
  name: string;
  description: string;
}

// Nível 2: Submódulo
export interface SubmoduleDef {
  id: string;
  name: string;
  description: string;
  tabKey?: AppActiveTab;
  tabs: InternalTabDef[];
}

// Nível 1: Módulo Principal
export interface ModuleTreeDef {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  badgeBg: string;
  planKey: keyof ReturnType<typeof getUserAllowedModules>;
  submodules: SubmoduleDef[];
}

export const SYSTEM_MODULES_TREE: ModuleTreeDef[] = [
  {
    id: 'auditoria_digital',
    name: 'Auditoria Digital & Cruzamentos Fiscais',
    description: 'Auditoria analítica de faturamento, PGDAS, DEFIS, cruzamentos e risco societário.',
    icon: Layers,
    color: 'text-rose-400',
    badgeBg: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
    planKey: 'auditoria_digital',
    submodules: [
      {
        id: 'sub_aud_dashboard',
        name: 'Dashboard Fiscal & Indicadores Estratégicos',
        description: 'Painel geral de faturamento acumulado e termômetro tributário.',
        tabKey: 'dashboard',
        tabs: [
          { id: 'tab_aud_dash_faturamento', name: 'Faturamento Consolidado (RBT12 vs RBA)', description: 'Acompanhamento do acumulado de 12 meses.' },
          { id: 'tab_aud_dash_sublimites', name: 'Termômetro de Sublimite Estadual (R$ 3,6M)', description: 'Alerta de exclusão de ICMS/ISS.' },
          { id: 'tab_aud_dash_aliquotas', name: 'Histórico de Alíquotas Efetivas & DAS', description: 'Evolução mensal da carga apurada.' }
        ]
      },
      {
        id: 'sub_aud_pgdas',
        name: 'Importação & Cruzamento PGDAS-D / DEFIS',
        description: 'Processamento de extratos da Receita Federal e conciliação de receitas.',
        tabKey: 'pgdas_import',
        tabs: [
          { id: 'tab_aud_pgdas_upload', name: 'Upload & Leitura de Extratos PGDAS/DEFIS', description: 'Importação de PDFs e XMLs.' },
          { id: 'tab_aud_pgdas_cruzamento', name: 'Cruzamento Declarado vs Faturado (NF-e)', description: 'Auditoria de divergência de bases.' },
          { id: 'tab_aud_pgdas_monofasicos', name: 'Segregação de Monofásicos & ST', description: 'Validação de deduções tributárias.' }
        ]
      },
      {
        id: 'sub_aud_fator_r',
        name: 'Análise & Gestão do Fator R',
        description: 'Cálculo de folha/receita (28%) para alternância entre Anexo III e V.',
        tabKey: 'fator_r',
        tabs: [
          { id: 'tab_aud_fator_simulador', name: 'Simulador de Enquadramento (Anexo III vs V)', description: 'Cálculo do percentual de folha.' },
          { id: 'tab_aud_fator_prolabore', name: 'Planejamento de Pró-labore & Salários', description: 'Definição de valor ideal de pró-labore.' },
          { id: 'tab_aud_fator_economia', name: 'Relatório de Economia Tributária Anual', description: 'Projeção de economia obtida no Anexo III.' }
        ]
      },
      {
        id: 'sub_aud_socios',
        name: 'Auditoria de Sócios & Risco Societário (LC 123/06)',
        description: 'Monitoramento de limite global de receitas em empresas com sócios em comum.',
        tabKey: 'socios',
        tabs: [
          { id: 'tab_aud_socios_qsa', name: 'Mapeamento de Sócios & CNPJs Vinculados', description: 'Cruzamento societário por CPF.' },
          { id: 'tab_aud_socios_soma', name: 'Cálculo de Soma de Faturamento do Grupo', description: 'Verificação do teto de R$ 4,8M global.' },
          { id: 'tab_aud_socios_risco', name: 'Alertas de Risco de Desenquadramento', description: 'Diagnóstico preventivo de infrações do Art. 3º.' }
        ]
      }
    ]
  },
  {
    id: 'planejamento_tributario',
    name: 'Planejamento Tributário & Regimes',
    description: 'Benchmarking de regimes tributários, Simples Híbrido da Reforma e pareceres.',
    icon: Sparkles,
    color: 'text-amber-400',
    badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    planKey: 'planejamento_tributario',
    submodules: [
      {
        id: 'sub_plan_regimes',
        name: 'Comparativo Simultâneo de Regimes',
        description: 'Simulação comparativa entre Simples Nacional, Lucro Presumido e Lucro Real.',
        tabKey: 'regimes',
        tabs: [
          { id: 'tab_plan_reg_comparativo', name: 'Matriz Comparativa de Carga Tributária', description: 'Cálculo de carga anual de impostos.' },
          { id: 'tab_plan_reg_detalhamento', name: 'Detalhamento por Tributo (IRPJ, CSLL, PIS, COFINS, CPP)', description: 'Abertura de todos os tributos.' },
          { id: 'tab_plan_reg_graficos', name: 'Gráficos de Ponto de Equilíbrio & Margem', description: 'Curva de transição de regime.' }
        ]
      },
      {
        id: 'sub_plan_simples_hibrido',
        name: 'Simulador do Simples Híbrido (EC 132/23)',
        description: 'Módulo da Reforma Tributária com simulação de alíquotas IBS/CBS e créditos B2B.',
        tabKey: 'simples_hibrido',
        tabs: [
          { id: 'tab_plan_hib_aliquotas', name: 'Simulador de Alíquotas IBS e CBS (2026-2033)', description: 'Cálculo de alíquota híbrida e segregação.' },
          { id: 'tab_plan_hib_creditos', name: 'Matriz de Créditos Tributários na Cadeia B2B', description: 'Vantagem na venda para clientes PJ.' },
          { id: 'tab_plan_hib_competitividade', name: 'Impacto de Preço vs Grandes Empresas', description: 'Comparativo de competitividade de mercado.' },
          { id: 'tab_plan_hib_parecer', name: 'Laudo & Parecer Executivo do Simples Híbrido', description: 'Parecer sobre recolhimento por fora do DAS.' }
        ]
      },
      {
        id: 'sub_plan_projecao',
        name: 'Projeções de Crescimento & Faturamento',
        description: 'Simulação de cenários de expansão e ponto de ruptura de sublimites.',
        tabKey: 'projecao',
        tabs: [
          { id: 'tab_plan_proj_cenarios', name: 'Simulação de Metas de Faturamento', description: 'Projeção com diferentes taxas de crescimento.' },
          { id: 'tab_plan_proj_ruptura', name: 'Ponto de Ruptura de Sublimites & Faixas', description: 'Alerta de estouro de alíquotas.' }
        ]
      },
      {
        id: 'sub_plan_parecer',
        name: 'Pareceres Técnicos & Enquadramento Econet',
        description: 'Geração de relatórios executivos e tabelas de enquadramento.',
        tabKey: 'parecer',
        tabs: [
          { id: 'tab_plan_par_emissao', name: 'Gerador de Parecer Tributário com Assinatura', description: 'Laudo formal conclusivo.' },
          { id: 'tab_plan_par_econet', name: 'Relatório Econet / Enquadramento de Anexos', description: 'Tabelas oficiais de alíquotas.' },
          { id: 'tab_plan_par_exportacao', name: 'Exportação para PDF / Impressão / Envio', description: 'Download e compartilhamento do parecer.' }
        ]
      }
    ]
  },
  {
    id: 'vertice_documentos',
    name: 'Vértice Documentos (SEFAZ DFe / mTLS)',
    description: 'Captura em tempo real de NF-e, NFS-e e CT-e na Receita Federal via mTLS com certificado A1.',
    icon: Globe,
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    planKey: 'auditoria_digital',
    submodules: [
      {
        id: 'sub_dfe_busca',
        name: 'Busca Direta na SEFAZ Nacional',
        description: 'Comunicação oficial mTLS com os WebServices da Receita Federal.',
        tabKey: 'vertice_documentos',
        tabs: [
          { id: 'tab_dfe_busca_tempo_real', name: 'Consulta em Tempo Real de NF-e / NFS-e / CT-e', description: 'Varredura direta no barramento SEFAZ.' },
          { id: 'tab_dfe_busca_chave', name: 'Busca por Chave de Acesso (44 dígitos)', description: 'Consulta pontual de documentos.' },
          { id: 'tab_dfe_busca_nsu', name: 'Controle de NSU & Lotes de Sincronização', description: 'Sequenciamento de notas baixadas.' }
        ]
      },
      {
        id: 'sub_dfe_repositorio',
        name: 'Repositório & Gestão de XMLs e DANFEs',
        description: 'Armazenamento em nuvem, leitura de tags e impressão de DANFE.',
        tabKey: 'vertice_documentos',
        tabs: [
          { id: 'tab_dfe_rep_armazenamento', name: 'Download de XMLs em Lote (.ZIP)', description: 'Pacotes completos de arquivos XML.' },
          { id: 'tab_dfe_rep_danfe', name: 'Visualizador & Impressão de DANFE / DACTE', description: 'Geração de PDF do documento fiscal.' },
          { id: 'tab_dfe_rep_filtros', name: 'Filtros Avançados por Emitente, CFOP e Data', description: 'Pesquisa refinada de notas.' }
        ]
      },
      {
        id: 'sub_dfe_manifestacao',
        name: 'Manifestação do Destinatário',
        description: 'Envio de eventos fiscais governamentais de confirmação ou ciência.',
        tabKey: 'vertice_documentos',
        tabs: [
          { id: 'tab_dfe_manif_ciencia', name: 'Ciência da Emissão de NF-e', description: 'Registro de ciência na SEFAZ.' },
          { id: 'tab_dfe_manif_confirmacao', name: 'Confirmação da Operação / Desconhecimento', description: 'Validação jurídica da entrada.' }
        ]
      },
      {
        id: 'sub_dfe_divergencias',
        name: 'Relatório de Divergência Fiscal',
        description: 'Auditoria de valores calculados vs destacados no XML.',
        tabKey: 'vertice_documentos',
        tabs: [
          { id: 'tab_dfe_div_st_difal', name: 'Divergências de DIFAL & Substituição Tributária (ST)', description: 'Auditoria de cálculos tributários.' },
          { id: 'tab_dfe_div_edicao', name: 'Edição Rápida & Correção de Valores', description: 'Ajuste de valores destacados.' }
        ]
      },
      {
        id: 'sub_dfe_robo',
        name: 'Tarefas Agendadas & Robô de Captura Automática',
        description: 'Automação noturna e agendamentos de busca por centralizador.',
        tabKey: 'vertice_documentos',
        tabs: [
          { id: 'tab_dfe_robo_intervalos', name: 'Configuração de Intervalos (Diário / Semanal)', description: 'Horários automáticos de busca.' },
          { id: 'tab_dfe_robo_logs', name: 'Logs & Status de Execução do Robô', description: 'Histórico de sincronizações.' }
        ]
      }
    ]
  },
  {
    id: 'consultoria_fiscal',
    name: 'Consultoria Fiscal & Técnica',
    description: 'Banco de dados tributário de NCM, alíquotas estaduais, MVA, CFOP e códigos de serviços.',
    icon: Search,
    color: 'text-cyan-400',
    badgeBg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300',
    planKey: 'consultoria_fiscal',
    submodules: [
      {
        id: 'sub_cons_ncm',
        name: 'Classificação Fiscal de Mercadorias (NCM)',
        description: 'Pesquisa avançada de alíquotas de ICMS e Substituição Tributária.',
        tabKey: 'ncm_consulta',
        tabs: [
          { id: 'tab_cons_ncm_aliquotas', name: 'Consulta NCM & Alíquotas por Estado (Origem/Destino)', description: 'Tabela de ICMS interestadual.' },
          { id: 'tab_cons_ncm_mva_st', name: 'Cálculo de MVA Ajustada & ST', description: 'Fórmula de Substituição Tributária por UF.' },
          { id: 'tab_cons_ncm_difal', name: 'Regras de DIFAL & Isenções Regionais', description: 'Alíquotas para não contribuintes.' }
        ]
      },
      {
        id: 'sub_cons_cfop',
        name: 'Operações Fiscais (CFOP) & Monofásicos',
        description: 'Consulta de CFOPs e produtos com tributação monofásica de PIS/COFINS.',
        tabKey: 'cfop',
        tabs: [
          { id: 'tab_cons_cfop_consulta', name: 'Consulta de CFOP de Entrada & Saída', description: 'Enquadramento de operações.' },
          { id: 'tab_cons_cfop_monofasicos', name: 'Tabela de Monofásicos (Alíquota Zero)', description: 'Catálogo com alíquota concentrada.' }
        ]
      },
      {
        id: 'sub_cons_servicos',
        name: 'Lista de Serviços Municipais (LC 116/03)',
        description: 'Classificação de códigos de serviços e alíquotas de ISS por município.',
        tabKey: 'servicos_consulta',
        tabs: [
          { id: 'tab_cons_serv_codigos', name: 'Classificação de Serviços & Alíquotas de ISS', description: 'Tabela da LC 116/03 (2% a 5%).' },
          { id: 'tab_cons_serv_retencao', name: 'Regras de Retenção de ISS pelo Tomador', description: 'Responsabilidade tributária.' }
        ]
      }
    ]
  },
  {
    id: 'emissao_nfse',
    name: 'Emissão de NFS-e Nacional',
    description: 'Emissão e gestão de Notas Fiscais de Serviço Eletrônicas pelo Padrão Nacional.',
    icon: FileCheck,
    color: 'text-indigo-400',
    badgeBg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300',
    planKey: 'emissao_nfse',
    submodules: [
      {
        id: 'sub_nfse_emissao',
        name: 'Emissor de NFS-e (Padrão Nacional)',
        description: 'Geração e transmissão de Declaração de Prestação de Serviços (DPS).',
        tabKey: 'emissao_nfse',
        tabs: [
          { id: 'tab_nfse_emi_dps', name: 'Emissão de DPS & Transmissão Nacional', description: 'Preenchimento e envio de NFS-e.' },
          { id: 'tab_nfse_emi_retencoes', name: 'Cálculo Automático de Tributos & Retenções', description: 'Apuração de ISS, IRRF, PIS, COFINS.' }
        ]
      },
      {
        id: 'sub_nfse_gestao',
        name: 'Gestão de Notas Emitidas & Cancelamento',
        description: 'Histórico de notas, cancelamento e reemissão de documentos.',
        tabKey: 'emissao_nfse',
        tabs: [
          { id: 'tab_nfse_ges_historico', name: 'Histórico de NFS-e & Impressão de DANFSE', description: 'Visualização e download de notas.' },
          { id: 'tab_nfse_ges_cancelamento', name: 'Cancelamento & Substituição de Notas', description: 'Transmissão de pedidos de cancelamento.' }
        ]
      },
      {
        id: 'sub_nfse_cadastros',
        name: 'Cadastros de Apoio à Emissão',
        description: 'Cadastro de tomadores de serviço e serviços recorrentes.',
        tabKey: 'emissao_nfse',
        tabs: [
          { id: 'tab_nfse_cad_tomadores', name: 'Catálogo de Tomadores de Serviço', description: 'Cadastro de clientes tomadores.' },
          { id: 'tab_nfse_cad_tabela', name: 'Tabela de Serviços & Preços Recorrentes', description: 'Itens padronizados de prestação.' }
        ]
      }
    ]
  },
  {
    id: 'financeiro_bpo',
    name: 'Central Financeira & Gestão Comercial',
    description: 'Gestão comercial unificada, faturamento, contratos de clientes, boletos/PIX, central de notas emitidas e DRE.',
    icon: FileSpreadsheet,
    color: 'text-teal-400',
    badgeBg: 'bg-teal-500/10 border-teal-500/30 text-teal-300',
    planKey: 'financeiro_gerencial',
    submodules: [
      {
        id: 'sub_fin_dashboard',
        name: 'Visão Geral Financeira & KPIs',
        description: 'Painel executivo com total de clientes ativos, inadimplência, MRR e projeções.',
        tabKey: 'financeiro',
        tabs: [
          { id: 'tab_fin_dash_kpis', name: 'Indicadores Executivos (MRR, Inadimplência, Ticket Médio)', description: 'Métricas vitais de faturamento.' },
          { id: 'tab_fin_dash_regua', name: 'Régua de Cobrança & Ações Preventivas', description: 'Alertas de inadimplência e notificações.' }
        ]
      },
      {
        id: 'sub_fin_contratos',
        name: 'Gestão de Clientes & Contratos Unificados',
        description: 'Controle de contratos de honorários, vigências, reajustes por índice e minutas PDF.',
        tabKey: 'contratos',
        tabs: [
          { id: 'tab_fin_con_lista', name: 'Base de Contratos & Clientes Ativos', description: 'Controle de vigências e periodicidades.' },
          { id: 'tab_fin_con_reajuste', name: 'Reajuste Automático por Índice (IPCA/IGP-M)', description: 'Atualização contratual anual de honorários.' },
          { id: 'tab_fin_con_minuta', name: 'Emissão & Download de Minuta Contratual em PDF', description: 'Geração de contratos com assinatura.' }
        ]
      },
      {
        id: 'sub_fin_faturamento',
        name: 'Faturamento, Cobranças, Boletos & PIX',
        description: 'Central de faturas emitidas com boletos bancários, QR Code PIX e conciliação.',
        tabKey: 'gestao_planos',
        tabs: [
          { id: 'tab_fin_fat_faturas', name: 'Central de Faturas & Cobranças Emitidas', description: 'Status de pagamentos, liquidados e pendentes.' },
          { id: 'tab_fin_fat_boletos', name: 'Emissor de Boletos Bancários com Linha Digitável', description: 'Boletos com código de barras e instruções.' },
          { id: 'tab_fin_fat_pix', name: 'PIX Copia e Cola & QR Code Dinâmico', description: 'Recebimentos instantâneos.' },
          { id: 'tab_fin_fat_baixa', name: 'Baixa Manual & Conciliação Bancária', description: 'Registro de recebimentos.' }
        ]
      },
      {
        id: 'sub_fin_nfse_honorarios',
        name: 'Central de Notas Emitidas (Honorários & Serviços)',
        description: 'Gerenciamento das NFS-e emitidas pelo escritório para seus tomadores.',
        tabKey: 'financeiro',
        tabs: [
          { id: 'tab_fin_nfs_historico', name: 'Histórico de Notas Emitidas & DANFSE PDF', description: 'Consulta oficial no padrão nacional ADN.' },
          { id: 'tab_fin_nfs_emissao', name: 'Emissão Rápida a partir de Fatura/Contrato', description: 'Geração direta com retenções municipais/federais.' }
        ]
      },
      {
        id: 'sub_bpo_dre',
        name: 'DRE Gerencial & Fluxo de Caixa',
        description: 'Demonstrativo de Resultados com análise de margem líquida, EBITDA e fluxo projetado.',
        tabKey: 'balancete_dre',
        tabs: [
          { id: 'tab_bpo_dre_estrutura', name: 'DRE Gerencial Estruturada', description: 'Receita bruta, deduções, folha e custos.' },
          { id: 'tab_bpo_flu_projecao', name: 'Fluxo de Caixa Projetado & Tesouraria', description: 'Entradas vs Saídas para 30 dias.' }
        ]
      },
      {
        id: 'sub_fin_config',
        name: 'Configurações do Setor Financeiro',
        description: 'Parametrização da conta bancária cedente, chave PIX, multas e juros de mora.',
        tabKey: 'financeiro',
        tabs: [
          { id: 'tab_fin_cfg_bancarios', name: 'Dados Bancários do Cedente & Código de Carteira', description: 'Conta corrente e agência oficial.' },
          { id: 'tab_fin_cfg_pix', name: 'Configuração de Chave PIX Oficial', description: 'Chave e titularidade.' },
          { id: 'tab_fin_cfg_juros', name: 'Taxas de Juros de Mora, Multa & Descontos', description: 'Regras de cobrança automática.' }
        ]
      }
    ]
  },
  {
    id: 'legal_societario',
    name: 'Legal & Societário',
    description: 'Quadro de Sócios e Administradores (QSA), minutas de contratos e atas societárias.',
    icon: Briefcase,
    color: 'text-purple-400',
    badgeBg: 'bg-purple-500/10 border-purple-500/30 text-purple-300',
    planKey: 'legal_societario',
    submodules: [
      {
        id: 'sub_legal_qsa',
        name: 'Quadro de Sócios e Administradores (QSA)',
        description: 'Estrutura societária sincronizada com a Receita Federal.',
        tabKey: 'societario',
        tabs: [
          { id: 'tab_legal_qsa_oficial', name: 'Quadro Societário Oficial Sincronizado RFB', description: 'Sócios, participações e administração.' },
          { id: 'tab_legal_qsa_historico', name: 'Histórico de Alterações de Capital Social', description: 'Evolução de cotas e alterações contratuais.' }
        ]
      },
      {
        id: 'sub_legal_atos',
        name: 'Atos, Contratos & Atas Societárias',
        description: 'Modelos e minutas de documentos contratuais.',
        tabKey: 'societario',
        tabs: [
          { id: 'tab_legal_atos_minutas', name: 'Minutas de Contratos Sociais & Alterações', description: 'Geração de minutas contratuais.' },
          { id: 'tab_legal_atos_atas', name: 'Geração de Atas de Reunião & Pareceres', description: 'Documentos formais de assembleias.' }
        ]
      }
    ]
  },
  {
    id: 'agenda_fiscal',
    name: 'Agenda Fiscal & Obrigações',
    description: 'Calendário de vencimento de tributos e checklist de obrigações acessórias.',
    icon: CheckCircle,
    color: 'text-rose-400',
    badgeBg: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
    planKey: 'agenda_fiscal',
    submodules: [
      {
        id: 'sub_agenda_tributos',
        name: 'Calendário de Vencimento de Impostos',
        description: 'Datas de recolhimento de tributos com notificações automáticas.',
        tabKey: 'agenda_fiscal',
        tabs: [
          { id: 'tab_age_trib_federais', name: 'Tributos Federais (DAS, IRPJ, CSLL, PIS, COFINS, INSS)', description: 'Prazos da Receita Federal.' },
          { id: 'tab_age_trib_estaduais', name: 'Tributos Estaduais & Municipais (ICMS, ISS, Taxas)', description: 'Prazos da SEFAZ e Prefeituras.' }
        ]
      },
      {
        id: 'sub_agenda_obrigacoes',
        name: 'Obrigações Acessórias & Declarações',
        description: 'Controle de entrega de arquivos fiscais e declarações periódicas.',
        tabKey: 'agenda_fiscal',
        tabs: [
          { id: 'tab_age_obri_checklist', name: 'Checklist de Entregas (SPED, DCTFWeb, EFD, DEFIS)', description: 'Controle de envio de arquivos fiscais.' },
          { id: 'tab_age_obri_alertas', name: 'Alertas de Vencimento & Notificações por E-mail', description: 'Avisos preventivos para o cliente.' }
        ]
      }
    ]
  },
  {
    id: 'portal_parceiro',
    name: 'Portal do Parceiro Homologado',
    description: 'Painel de indicações, comissionamento e rede de parceiros homologados Vértice.',
    icon: Award,
    color: 'text-cyan-400',
    badgeBg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300',
    planKey: 'partner_portal',
    submodules: [
      {
        id: 'sub_parceiro_rede',
        name: 'Painel de Indicações & Rede de Afiliados',
        description: 'Acompanhamento de clientes indicados e status de conversão.',
        tabKey: 'portal_parceiro',
        tabs: [
          { id: 'tab_parc_rede_clientes', name: 'Clientes Indicados & Status de Ativação', description: 'Lista de empresas vinculadas ao parceiro.' },
          { id: 'tab_parc_rede_links', name: 'Links de Afiliado & Materiais de Divulgação', description: 'Códigos de indicação e banners.' }
        ]
      },
      {
        id: 'sub_parceiro_comissoes',
        name: 'Comissionamento & Repasses Financeiros',
        description: 'Gestão de comissões acumuladas e histórico de pagamentos.',
        tabKey: 'portal_parceiro',
        tabs: [
          { id: 'tab_parc_com_extrato', name: 'Extrato de Comissões & Repasses PIX', description: 'Valores a receber por plano vendido.' },
          { id: 'tab_parc_com_historico', name: 'Comprovantes & Histórico Financeiro', description: 'Registro de repasses efetuados.' }
        ]
      }
    ]
  },
  {
    id: 'conhecimentos_direito',
    name: 'Base de Conhecimento & Legislação',
    description: 'Biblioteca tributária, acórdãos do CARF, leis complementares e pareceres jurídicos.',
    icon: BookOpen,
    color: 'text-amber-400',
    badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    planKey: 'legal_guide',
    submodules: [
      {
        id: 'sub_conh_legislacao',
        name: 'Legislação & Normativos Tributários',
        description: 'Repositório indexado da LC 123/06, EC 132/23 e decretos estaduais.',
        tabKey: 'conhecimentos',
        tabs: [
          { id: 'tab_conh_leg_lc123', name: 'Estatuto da Micro e Pequena Empresa (LC 123/06)', description: 'Artigos, anexos e regras especiais.' },
          { id: 'tab_conh_leg_reforma', name: 'Emenda Constitucional 132/23 (Reforma Tributária)', description: 'Regras de transição IBS/CBS.' }
        ]
      },
      {
        id: 'sub_conh_jurisprudencia',
        name: 'Jurisprudência & Soluções de Consulta COSIT',
        description: 'Decisões do CARF e pareceres normativos da Receita Federal.',
        tabKey: 'direito',
        tabs: [
          { id: 'tab_conh_jur_cosit', name: 'Soluções de Consulta COSIT / DISIT', description: 'Entendimentos oficiais da RFB.' },
          { id: 'tab_conh_jur_carf', name: 'Súmulas e Acórdãos Relevantes do CARF', description: 'Precedentes administrativos fiscais.' }
        ]
      }
    ]
  },
  {
    id: 'contratos_webmail',
    name: 'Contratos & Comunicação Integrada',
    description: 'Gestão de contratos de prestação de serviços contábeis e webmail de clientes.',
    icon: Mail,
    color: 'text-blue-400',
    badgeBg: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
    planKey: 'dashboard',
    submodules: [
      {
        id: 'sub_cont_honorarios',
        name: 'Contratos de Honorários & Propostas',
        description: 'Minutas de contratos de prestação de serviços e reajustes.',
        tabKey: 'contratos',
        tabs: [
          { id: 'tab_cont_hon_minutas', name: 'Modelos de Contratos de Honorários', description: 'Cláusulas de responsabilidade técnica.' },
          { id: 'tab_cont_hon_reajustes', name: 'Índices de Reajuste Anual (IPCA/IGP-M)', description: 'Simulação de reajustes de mensalidade.' }
        ]
      },
      {
        id: 'sub_cont_comunicacao',
        name: 'Comunicação & Webmail Profissional',
        description: 'Envio de comunicados, avisos de DAS e notificações por e-mail.',
        tabKey: 'webmail_umbler',
        tabs: [
          { id: 'tab_cont_com_webmail', name: 'Caixa de Entrada & Webmail Corporativo', description: 'Integração de correio eletrônico.' },
          { id: 'tab_cont_com_templates', name: 'Modelos de Notificações de Vencimento', description: 'Templates pré-formatados de avisos.' }
        ]
      }
    ]
  }
];

export const CompanyManagerModal: React.FC<CompanyManagerModalProps> = ({
  isOpen,
  onClose,
  companies,
  activeCompanyIndex,
  onSelectCompany,
  onCreateCompany,
  onUpdateCompany,
  onBatchCreateCompanies,
  onDeleteCompany,
  currentUser
}) => {
  // Navigation State (Padrão GClick com Abas Verticais)
  const [activeVerticalTab, setActiveVerticalTab] = useState<VerticalNavTab>('empresas');

  // Check if current user has Admin privileges for Billing section
  const isAdminOrDev = Boolean(
    currentUser?.isAdmin || 
    currentUser?.isMaster || 
    currentUser?.isDeveloper || 
    currentUser?.role === 'master' || 
    currentUser?.role === 'desenvolvedor' || 
    currentUser?.role === 'administrador' ||
    isDeveloperUser(currentUser || null)
  );

  // Form State (Empresa)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);

  const [formName, setFormName] = useState('');
  const [formCnpj, setFormCnpj] = useState('');
  const [formCnae, setFormCnae] = useState('6920-6/01');
  const [formCnaeDesc, setFormCnaeDesc] = useState('Atividades de contabilidade');
  const [formUf, setFormUf] = useState('SP');
  const [formAnexo, setFormAnexo] = useState<'I' | 'II' | 'III' | 'IV' | 'V'>('I');
  const [formRbt12, setFormRbt12] = useState('0');
  const [formPayroll12m, setFormPayroll12m] = useState('0');
  const [formRegimeTributario, setFormRegimeTributario] = useState<'simples_nacional' | 'lucro_presumido' | 'lucro_real' | 'mei'>('simples_nacional');
  const [formAtividadeEmpresa, setFormAtividadeEmpresa] = useState<'servicos' | 'comercio' | 'industria' | 'misto'>('servicos');
  const [formPartners, setFormPartners] = useState<Partner[]>([]);
  const [formCertUploaded, setFormCertUploaded] = useState(false);
  const [formPfxFileName, setFormPfxFileName] = useState('');
  const [formCertPassword, setFormCertPassword] = useState('');
  const [formPfxBase64, setFormPfxBase64] = useState('');
  const [isSearchingCnpj, setIsSearchingCnpj] = useState(false);
  const [cnpjFeedback, setCnpjFeedback] = useState<string | null>(null);

  // Search & Filters
  const [companySearchQuery, setCompanySearchQuery] = useState('');
  const [filterRegime, setFilterRegime] = useState<string>('all');
  const [filterCertStatus, setFilterCertStatus] = useState<string>('all');

  // Certificate Test Status
  const [certTestStatus, setCertTestStatus] = useState<Record<string, { testing: boolean; message: string; success?: boolean }>>({});

  // Users & Collaborators State
  const [usersList, setUsersList] = useState<UserAccount[]>(() => {
    try {
      return AuthService.getAccounts();
    } catch {
      return [];
    }
  });

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserCompany, setNewUserCompany] = useState<string>('');
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Permissions Tree Search & Expand State
  const [permSearchQuery, setPermSearchQuery] = useState('');
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    auditoria_digital: true,
    planejamento_tributario: true,
    vertice_documentos: true
  });

  // Batch Import
  const [batchRawCnpjs, setBatchRawCnpjs] = useState<string>('');
  const [batchProgress, setBatchProgress] = useState<{ active: boolean; current: number; total: number; step: string }>({
    active: false,
    current: 0,
    total: 0,
    step: ''
  });

  // Load users on open
  useEffect(() => {
    try {
      const accounts = AuthService.getAccounts();
      setUsersList(accounts);
      if (!selectedUserId && accounts.length > 0) {
        setSelectedUserId(accounts[0].id);
      }
    } catch {}
  }, [isOpen]);

  const currentActiveCompany = companies[activeCompanyIndex] || companies[0];
  const planAllowedModules = getUserAllowedModules(currentUser || null);
  const selectedUser = usersList.find(u => u.id === selectedUserId) || usersList[0] || null;

  // Toggle tree expander
  const toggleModuleExpand = (modId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [modId]: !prev[modId]
    }));
  };

  const handleExpandAll = (expand: boolean) => {
    const newState: Record<string, boolean> = {};
    SYSTEM_MODULES_TREE.forEach(m => {
      newState[m.id] = expand;
    });
    setExpandedModules(newState);
  };

  // Toggle Tab (Level 3)
  const handleToggleTab = (tabId: string) => {
    if (!selectedUser) return;
    const currentSubmodules = { ...(selectedUser.allowedSubmodules || {}) };
    const currentValue = currentSubmodules[tabId] !== false;
    const newValue = !currentValue;
    currentSubmodules[tabId] = newValue;

    const updated = usersList.map(u => u.id === selectedUser.id ? { ...u, allowedSubmodules: currentSubmodules } : u);
    AuthService.saveAccounts(updated);
    setUsersList(updated);
    setSaveToast(`Permissão atualizada para ${selectedUser.name}!`);
    setTimeout(() => setSaveToast(null), 2500);
  };

  // Toggle Submodule (Level 2)
  const handleToggleSubmodule = (sub: SubmoduleDef) => {
    if (!selectedUser) return;
    const currentSubmodules = { ...(selectedUser.allowedSubmodules || {}) };
    const allActive = sub.tabs.every(t => currentSubmodules[t.id] !== false) && currentSubmodules[sub.id] !== false;
    const targetState = !allActive;

    currentSubmodules[sub.id] = targetState;
    sub.tabs.forEach(t => {
      currentSubmodules[t.id] = targetState;
    });

    const updated = usersList.map(u => u.id === selectedUser.id ? { ...u, allowedSubmodules: currentSubmodules } : u);
    AuthService.saveAccounts(updated);
    setUsersList(updated);
    setSaveToast(`Submódulo "${sub.name}" ${targetState ? 'liberado' : 'bloqueado'}!`);
    setTimeout(() => setSaveToast(null), 2500);
  };

  // Toggle Module (Level 1)
  const handleToggleEntireModule = (mod: ModuleTreeDef) => {
    if (!selectedUser) return;
    const currentSubmodules = { ...(selectedUser.allowedSubmodules || {}) };
    let allActive = true;
    for (const sub of mod.submodules) {
      if (currentSubmodules[sub.id] === false) { allActive = false; break; }
      for (const tab of sub.tabs) {
        if (currentSubmodules[tab.id] === false) { allActive = false; break; }
      }
      if (!allActive) break;
    }

    const targetState = !allActive;
    currentSubmodules[mod.id] = targetState;
    mod.submodules.forEach(sub => {
      currentSubmodules[sub.id] = targetState;
      sub.tabs.forEach(tab => {
        currentSubmodules[tab.id] = targetState;
      });
    });

    const updated = usersList.map(u => u.id === selectedUser.id ? { ...u, allowedSubmodules: currentSubmodules } : u);
    AuthService.saveAccounts(updated);
    setUsersList(updated);
    setSaveToast(`Módulo "${mod.name}" ${targetState ? 'habilitado' : 'desabilitado'}!`);
    setTimeout(() => setSaveToast(null), 2500);
  };

  // Quick Preset Profiles
  const applyPresetProfile = (preset: 'auditor' | 'contador' | 'assistente' | 'bpo' | 'leitor' | 'todos') => {
    if (!selectedUser) return;
    const currentSubmodules: Record<string, boolean> = {};

    SYSTEM_MODULES_TREE.forEach(mod => {
      const inPlan = (planAllowedModules as any)[mod.planKey] !== false;
      let shouldEnableModule = false;

      if (preset === 'todos') {
        shouldEnableModule = inPlan;
      } else if (preset === 'auditor') {
        shouldEnableModule = inPlan && ['auditoria_digital', 'planejamento_tributario', 'vertice_documentos', 'consultoria_fiscal'].includes(mod.id);
      } else if (preset === 'contador') {
        shouldEnableModule = inPlan && ['auditoria_digital', 'planejamento_tributario', 'emissao_nfse', 'financeiro_bpo', 'legal_societario', 'agenda_fiscal'].includes(mod.id);
      } else if (preset === 'bpo') {
        shouldEnableModule = inPlan && ['financeiro_bpo', 'emissao_nfse', 'contratos_webmail'].includes(mod.id);
      } else if (preset === 'assistente') {
        shouldEnableModule = inPlan && ['vertice_documentos', 'emissao_nfse', 'agenda_fiscal', 'consultoria_fiscal'].includes(mod.id);
      } else if (preset === 'leitor') {
        shouldEnableModule = inPlan && ['auditoria_digital', 'planejamento_tributario', 'agenda_fiscal'].includes(mod.id);
      }

      currentSubmodules[mod.id] = shouldEnableModule;
      mod.submodules.forEach(sub => {
        currentSubmodules[sub.id] = shouldEnableModule;
        sub.tabs.forEach(tab => {
          currentSubmodules[tab.id] = shouldEnableModule;
        });
      });
    });

    const updated = usersList.map(u => u.id === selectedUser.id ? { ...u, allowedSubmodules: currentSubmodules } : u);
    AuthService.saveAccounts(updated);
    setUsersList(updated);
    setSaveToast(`Perfil "${preset.toUpperCase()}" aplicado com sucesso a ${selectedUser.name}!`);
    setTimeout(() => setSaveToast(null), 3000);
  };

  // Create User
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
      alert('Preencha os campos obrigatórios.');
      return;
    }
    const existing = AuthService.getAccounts();
    if (existing.some(a => a.email.toLowerCase() === newUserEmail.trim().toLowerCase())) {
      alert('Este e-mail já está cadastrado.');
      return;
    }

    const defaultSubmodules: Record<string, boolean> = {};
    SYSTEM_MODULES_TREE.forEach(mod => {
      const inPlan = (planAllowedModules as any)[mod.planKey] !== false;
      if (inPlan) {
        defaultSubmodules[mod.id] = true;
        mod.submodules.forEach(sub => {
          defaultSubmodules[sub.id] = true;
          sub.tabs.forEach(tab => {
            defaultSubmodules[tab.id] = true;
          });
        });
      }
    });

    const newAccount: UserAccount = {
      id: `usr_${Date.now()}`,
      name: newUserName.trim(),
      email: newUserEmail.trim().toLowerCase(),
      password: newUserPassword,
      companyName: newUserCompany.trim() || currentActiveCompany?.name || 'Vértice Contabilidade',
      role: 'escritorio',
      plan: currentUser?.plan || 'pro',
      planStatus: 'active',
      expiresAt: '2099-12-31T23:59:59Z',
      queriesUsedThisMonth: 0,
      maxQueriesPerMonth: 9999,
      isMaster: false,
      viewMode: 'escritorio',
      permissions: ['all', 'unlimited_queries'],
      allowedSubmodules: defaultSubmodules,
      createdAt: new Date().toISOString()
    };

    const updated = [...existing, newAccount];
    AuthService.saveAccounts(updated);
    setUsersList(updated);
    setSelectedUserId(newAccount.id);
    setIsNewUserModalOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('');
    setSaveToast(`Colaborador ${newUserName} cadastrado com sucesso!`);
    setTimeout(() => setSaveToast(null), 3000);
  };

  // Test SEFAZ Cert
  const handleTestSefazCert = async (comp: CompanyData) => {
    if (!comp.pfxBase64 || !comp.certPassword) {
      setCertTestStatus(prev => ({
        ...prev,
        [comp.id || comp.cnpj]: { testing: false, success: false, message: 'Certificado .pfx ou senha não configurados.' }
      }));
      return;
    }
    const compKey = comp.id || comp.cnpj;
    setCertTestStatus(prev => ({
      ...prev,
      [compKey]: { testing: true, message: 'Conectando ao WebService da SEFAZ Nacional via mTLS...' }
    }));

    try {
      const res = await apiFetch('/api/vertice/sync-real', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cnpj: comp.cnpj.replace(/\D/g, ''),
          pfxBase64: comp.pfxBase64,
          password: comp.certPassword,
          environment: '1',
          ultNSU: '000000000000000'
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCertTestStatus(prev => ({
          ...prev,
          [compKey]: {
            testing: false,
            success: true,
            message: `✅ mTLS Conectado! SEFAZ Nacional retornou cStat ${data.cStat || 137} (${data.xMotivo || 'Consulta realizada com sucesso'}).`
          }
        }));
      } else {
        setCertTestStatus(prev => ({
          ...prev,
          [compKey]: {
            testing: false,
            success: false,
            message: `⚠️ Resposta SEFAZ: ${data.error || data.xMotivo || 'Falha de comunicação mTLS'}`
          }
        }));
      }
    } catch (err: any) {
      setCertTestStatus(prev => ({
        ...prev,
        [compKey]: { testing: false, success: false, message: `Erro de conexão: ${err.message}` }
      }));
    }
  };

  // Filtered companies
  const filteredCompanies = companies.filter(comp => {
    const q = companySearchQuery.toLowerCase();
    const matchesQuery = 
      comp.name.toLowerCase().includes(q) ||
      comp.cnpj.replace(/\D/g, '').includes(q.replace(/\D/g, '')) ||
      comp.cnae?.toLowerCase().includes(q) ||
      comp.uf.toLowerCase().includes(q);

    const matchesRegime = filterRegime === 'all' || comp.regimeTributario === filterRegime;
    const matchesCert = 
      filterCertStatus === 'all' || 
      (filterCertStatus === 'with_cert' && comp.certUploaded) ||
      (filterCertStatus === 'without_cert' && !comp.certUploaded);

    return matchesQuery && matchesRegime && matchesCert;
  });

  // Open Edit Form
  const handleOpenEditForm = (comp: CompanyData, index: number) => {
    setEditingCompanyId(comp.id || `comp_${index}`);
    setEditingIndex(index);
    setFormName(comp.name || '');
    setFormCnpj(comp.cnpj || '');
    setFormCnae(comp.cnae || '6920-6/01');
    setFormCnaeDesc(comp.cnaeDescription || 'Atividades de contabilidade');
    setFormUf(comp.uf || 'SP');
    setFormAnexo(comp.anexo || 'I');
    setFormRbt12(String(comp.rbt12 || 0));
    setFormPayroll12m(String(comp.payroll12m || 0));
    setFormRegimeTributario(comp.regimeTributario || 'simples_nacional');
    setFormAtividadeEmpresa(comp.atividadeEmpresa || 'servicos');
    setFormPartners(comp.partners || []);
    setFormCertUploaded(!!comp.certUploaded);
    setFormPfxFileName(comp.pfxFileName || '');
    setFormCertPassword(comp.certPassword || '');
    setFormPfxBase64(comp.pfxBase64 || '');
    setCnpjFeedback(null);
    setIsFormOpen(true);
  };

  // Open Create Form
  const handleOpenCreateForm = () => {
    setEditingCompanyId(null);
    setEditingIndex(null);
    setFormName('');
    setFormCnpj('');
    setFormCnae('6920-6/01');
    setFormCnaeDesc('Atividades de contabilidade');
    setFormUf('SP');
    setFormAnexo('I');
    setFormRbt12('0');
    setFormPayroll12m('0');
    setFormRegimeTributario('simples_nacional');
    setFormAtividadeEmpresa('servicos');
    setFormPartners([]);
    setFormCertUploaded(false);
    setFormPfxFileName('');
    setFormCertPassword('');
    setFormPfxBase64('');
    setCnpjFeedback(null);
    setIsFormOpen(true);
  };

  // RFB CNPJ Lookup
  const handleLookupCnpj = async () => {
    const clean = formCnpj.replace(/\D/g, '');
    if (clean.length !== 14) {
      setCnpjFeedback('Digite um CNPJ válido com 14 dígitos.');
      return;
    }
    setIsSearchingCnpj(true);
    setCnpjFeedback(null);
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${clean}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data && data.razao_social) {
        setFormName(data.razao_social);
        if (data.uf) setFormUf(data.uf);
        if (data.cnae_fiscal) {
          setFormCnae(String(data.cnae_fiscal));
          setFormCnaeDesc(data.cnae_fiscal_descricao || '');
        }
        if (data.qsa && Array.isArray(data.qsa)) {
          setFormPartners(data.qsa.map((s: any, idx: number) => ({
            id: `p-${idx + 1}`,
            name: s.nome_socio || s.nome || 'Sócio',
            cpf: s.cnpj_cpf_do_socio || '',
            participationPercent: Math.round(100 / data.qsa.length),
            isManager: (s.qualificacao_socio || '').toLowerCase().includes('administrador'),
            roleInCurrentCompany: s.qualificacao_socio || 'Sócio',
            otherCompanies: []
          })));
        }
        setCnpjFeedback('✅ Dados cadastrais e QSA sincronizados com a Receita Federal!');
      }
    } catch {
      setCnpjFeedback('CNPJ não localizado automaticamente. Preencha os campos manualmente.');
    } finally {
      setIsSearchingCnpj(false);
    }
  };

  // Submit form
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Informe o Nome / Razão Social.');
      return;
    }
    const companyPayload: CompanyData = {
      id: editingCompanyId || `comp_${Date.now()}`,
      name: formName.trim(),
      cnpj: formCnpj.trim(),
      cnae: formCnae.trim(),
      cnaeDescription: formCnaeDesc.trim(),
      uf: formUf,
      anexo: formAnexo,
      rbt12: parseFloat(formRbt12) || 0,
      rba: parseFloat(formRbt12) || 0,
      monthlyRevenue: (parseFloat(formRbt12) || 0) / 12,
      payroll12m: parseFloat(formPayroll12m) || 0,
      monthlyPayroll: (parseFloat(formPayroll12m) || 0) / 12,
      regimeTributario: formRegimeTributario,
      atividadeEmpresa: formAtividadeEmpresa,
      b2bSalesPercent: 40,
      projectionGrowthPercent: 15,
      estimatedNetProfitMargin: 20,
      targetIvaRate: 26.5,
      partners: formPartners,
      certUploaded: formCertUploaded,
      pfxFileName: formPfxFileName,
      certPassword: formCertPassword,
      pfxBase64: formPfxBase64,
      createdAt: new Date().toISOString()
    };

    if (editingIndex !== null && editingIndex >= 0 && onUpdateCompany) {
      onUpdateCompany(companyPayload, editingIndex);
    } else {
      onCreateCompany(companyPayload);
    }
    setIsFormOpen(false);
  };

  // Filtered Modules Tree based on search
  const filteredModulesTree = useMemo(() => {
    if (!permSearchQuery.trim()) return SYSTEM_MODULES_TREE;
    const q = permSearchQuery.toLowerCase();

    return SYSTEM_MODULES_TREE.filter(mod => {
      const matchMod = mod.name.toLowerCase().includes(q) || mod.description.toLowerCase().includes(q);
      const matchSub = mod.submodules.some(s => 
        s.name.toLowerCase().includes(q) || 
        s.description.toLowerCase().includes(q) ||
        s.tabs.some(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
      );
      return matchMod || matchSub;
    });
  }, [permSearchQuery]);

  // Total tabs count calculation for stats
  const totalTabsCount = useMemo(() => {
    let count = 0;
    SYSTEM_MODULES_TREE.forEach(m => {
      m.submodules.forEach(s => {
        count += s.tabs.length;
      });
    });
    return count;
  }, []);

  const activeUserTabsCount = useMemo(() => {
    if (!selectedUser) return 0;
    const currentSub = selectedUser.allowedSubmodules || {};
    let count = 0;
    SYSTEM_MODULES_TREE.forEach(m => {
      m.submodules.forEach(s => {
        s.tabs.forEach(t => {
          if (currentSub[t.id] !== false) count++;
        });
      });
    });
    return count;
  }, [selectedUser, usersList]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-hidden">
      <div className="relative w-full max-w-7xl h-[92vh] max-h-[920px] bg-[#0A0E1A] border border-slate-800/90 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100 ring-1 ring-white/10">
        
        {/* TOP BAR: Proportional & Clean Header */}
        <header className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-[#0D1527] to-slate-900 border-b border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-rose-500/20 to-amber-500/20 border border-rose-500/30 text-rose-400 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  Central de Gestão & Configurações
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60 text-[10px] font-semibold tracking-wider uppercase">
                  Padrão GClick
                </span>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {companies.length} {companies.length === 1 ? 'empresa ativa' : 'empresas ativas'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Controle unificado de clientes, operadores, certificados mTLS, matriz de acessos e faturamento.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenCreateForm}
              className="px-3 py-1.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-semibold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Empresa</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* MAIN BODY: ERGONOMIC TWO-COLUMN LAYOUT */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* VERTICAL SIDEBAR MENU */}
          <aside className="w-60 sm:w-64 bg-[#070B14] border-r border-slate-800/80 flex flex-col justify-between shrink-0 p-2.5 overflow-y-auto">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider px-2.5 py-1 block">
                Navegação Principal
              </span>

              {/* 1. Empresas */}
              <button
                onClick={() => setActiveVerticalTab('empresas')}
                className={`w-full p-2.5 rounded-xl text-left transition flex items-center justify-between cursor-pointer ${
                  activeVerticalTab === 'empresas'
                    ? 'bg-rose-500/15 border border-rose-500/40 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${activeVerticalTab === 'empresas' ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    <Building className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold leading-tight">1. Cadastro de Empresas</h4>
                    <p className="text-[10px] text-slate-500">Dados, regime e sócios</p>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300">
                  {companies.length}
                </span>
              </button>

              {/* 2. Usuários & Operadores */}
              <button
                onClick={() => setActiveVerticalTab('usuarios')}
                className={`w-full p-2.5 rounded-xl text-left transition flex items-center justify-between cursor-pointer ${
                  activeVerticalTab === 'usuarios'
                    ? 'bg-blue-500/15 border border-blue-500/40 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${activeVerticalTab === 'usuarios' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold leading-tight">2. Usuários & Operadores</h4>
                    <p className="text-[10px] text-slate-500">Contas e vínculos</p>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold">
                  {usersList.length}
                </span>
              </button>

              {/* 3. Certificados Digitais A1 */}
              <button
                onClick={() => setActiveVerticalTab('certificados')}
                className={`w-full p-2.5 rounded-xl text-left transition flex items-center justify-between cursor-pointer ${
                  activeVerticalTab === 'certificados'
                    ? 'bg-emerald-500/15 border border-emerald-500/40 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${activeVerticalTab === 'certificados' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold leading-tight">3. Certificados A1 (mTLS)</h4>
                    <p className="text-[10px] text-slate-500">SEFAZ & Receita Federal</p>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  {companies.filter(c => c.certUploaded).length}
                </span>
              </button>

              {/* 4. Gerenciador de Acessos e Perfis */}
              <button
                onClick={() => setActiveVerticalTab('acessos_perfis')}
                className={`w-full p-2.5 rounded-xl text-left transition flex items-center justify-between cursor-pointer ${
                  activeVerticalTab === 'acessos_perfis'
                    ? 'bg-purple-500/15 border border-purple-500/40 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${activeVerticalTab === 'acessos_perfis' ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    <Sliders className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold leading-tight">4. Acessos & Perfis</h4>
                    <p className="text-[10px] text-slate-500">Árvore Completa (11 Módulos)</p>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[9px] font-bold uppercase">
                  Árvore
                </span>
              </button>

              {/* 5. Gestão Financeira & Cobranças (Exclusivo Administrador) */}
              <button
                onClick={() => {
                  if (isAdminOrDev) {
                    setActiveVerticalTab('financeiro');
                  } else {
                    alert('Acesso restrito: Apenas Administradores têm permissão para acessar a Gestão Financeira.');
                  }
                }}
                className={`w-full p-2.5 rounded-xl text-left transition flex items-center justify-between cursor-pointer ${
                  activeVerticalTab === 'financeiro'
                    ? 'bg-amber-500/15 border border-amber-500/40 text-white shadow-sm'
                    : isAdminOrDev
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                    : 'text-slate-600 opacity-60 border border-transparent cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${activeVerticalTab === 'financeiro' ? 'bg-amber-500 text-white' : 'bg-slate-800 text-amber-400'}`}>
                    <CreditCard className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <h4 className="text-xs font-semibold leading-tight">5. Gestão Financeira</h4>
                      <LockKeyhole className="w-3 h-3 text-amber-500/80" />
                    </div>
                    <p className="text-[10px] text-slate-500">Planos, faturas e assinaturas</p>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[9px] font-bold">
                  Admin
                </span>
              </button>

              {/* 6. Importação em Lote */}
              <button
                onClick={() => setActiveVerticalTab('importacao_lote')}
                className={`w-full p-2.5 rounded-xl text-left transition flex items-center justify-between cursor-pointer ${
                  activeVerticalTab === 'importacao_lote'
                    ? 'bg-teal-500/15 border border-teal-500/40 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${activeVerticalTab === 'importacao_lote' ? 'bg-teal-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    <Upload className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold leading-tight">6. Importação em Lote</h4>
                    <p className="text-[10px] text-slate-500">Cadastro de múltiplos CNPJs</p>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 text-[9px] font-bold">
                  Lote
                </span>
              </button>
            </div>

            {/* User Session Footer */}
            <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center font-bold text-white text-xs shrink-0">
                  {currentUser?.name?.charAt(0) || 'U'}
                </div>
                <div className="overflow-hidden flex-1">
                  <p className="text-xs font-semibold text-white truncate">{currentUser?.name || 'Administrador'}</p>
                  <p className="text-[10px] text-slate-400 truncate">{currentUser?.email || 'admin@vertice.com'}</p>
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT CONTENT PANEL */}
          <main className="flex-1 flex flex-col bg-[#0A0E1A] overflow-hidden">
            
            {/* TOAST FEEDBACK */}
            {saveToast && (
              <div className="mx-4 mt-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center gap-2 shadow-lg animate-fade-in shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{saveToast}</span>
              </div>
            )}

            {/* TAB 1: CADASTRO DE EMPRESAS */}
            {activeVerticalTab === 'empresas' && (
              <div className="flex-1 flex flex-col p-4 sm:p-5 overflow-y-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <Building className="w-4 h-4 text-rose-400" />
                      Carteira de Empresas Cadastradas
                    </h3>
                    <p className="text-xs text-slate-400">
                      Gerencie dados cadastrais, sócios, anexos e regime tributário de cada cliente.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleOpenCreateForm}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Adicionar Empresa
                    </button>
                  </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-3.5">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar por Razão Social, CNPJ ou CNAE..."
                      value={companySearchQuery}
                      onChange={e => setCompanySearchQuery(e.target.value)}
                      className="w-full pl-8.5 pr-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/60"
                    />
                  </div>

                  <select
                    value={filterRegime}
                    onChange={e => setFilterRegime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500/60"
                  >
                    <option value="all">Todos os Regimes Tributários</option>
                    <option value="simples_nacional">Simples Nacional</option>
                    <option value="lucro_presumido">Lucro Presumido</option>
                    <option value="lucro_real">Lucro Real</option>
                    <option value="mei">MEI</option>
                  </select>

                  <select
                    value={filterCertStatus}
                    onChange={e => setFilterCertStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500/60"
                  >
                    <option value="all">Status de Certificado A1</option>
                    <option value="with_cert">Com Certificado A1 Instalado</option>
                    <option value="without_cert">Sem Certificado A1</option>
                  </select>
                </div>

                {/* Companies List */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                  {filteredCompanies.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl p-6">
                      <Building className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                      <h4 className="text-sm font-semibold text-slate-300">Nenhuma empresa localizada</h4>
                      <p className="text-xs text-slate-500 mt-1">Refine seus filtros ou cadastre um novo cliente.</p>
                      <button
                        onClick={handleOpenCreateForm}
                        className="mt-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> Cadastrar Empresa
                      </button>
                    </div>
                  ) : (
                    filteredCompanies.map((comp, idx) => {
                      const isSelected = companies.findIndex(c => (c.id && comp.id && c.id === comp.id) || c.cnpj === comp.cnpj) === activeCompanyIndex;
                      const realIndex = companies.findIndex(c => (c.id && comp.id && c.id === comp.id) || c.cnpj === comp.cnpj);

                      return (
                        <div
                          key={comp.id || idx}
                          className={`p-3.5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-rose-500/10 border-rose-500/50 shadow-md ring-1 ring-rose-500/30'
                              : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2.5 rounded-xl shrink-0 ${isSelected ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                              <Building className="w-4 h-4" />
                            </div>
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-xs sm:text-sm font-bold text-white">{comp.name}</h4>
                                {isSelected && (
                                  <span className="px-1.5 py-0.5 rounded bg-rose-500 text-white text-[9px] font-bold uppercase">
                                    Ativa
                                  </span>
                                )}
                                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                                  {comp.cnpj}
                                </span>
                                <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px]">
                                  UF: {comp.uf}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400">
                                Regime: <span className="text-slate-200 capitalize font-medium">{comp.regimeTributario?.replace('_', ' ') || 'Simples Nacional'}</span>
                                {comp.anexo && ` • Anexo ${comp.anexo}`}
                                {comp.cnae && ` • CNAE ${comp.cnae}`}
                                {comp.partners && comp.partners.length > 0 && ` • ${comp.partners.length} sócio(s)`}
                              </p>
                              <div className="flex items-center gap-2 pt-1">
                                {comp.certUploaded ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                    <CheckCircle2 className="w-3 h-3" /> Certificado A1 Vinculado
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                    <AlertTriangle className="w-3 h-3" /> Sem Certificado A1
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                            {!isSelected && (
                              <button
                                onClick={() => onSelectCompany(realIndex)}
                                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition cursor-pointer"
                              >
                                Selecionar
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenEditForm(comp, realIndex)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition cursor-pointer"
                              title="Editar Empresa"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (companies.length <= 1) {
                                  alert('Você deve manter ao menos uma empresa cadastrada.');
                                  return;
                                }
                                if (confirm(`Deseja realmente remover a empresa "${comp.name}"?`)) {
                                  onDeleteCompany(realIndex);
                                }
                              }}
                              className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl transition cursor-pointer"
                              title="Excluir Empresa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: USUÁRIOS E OPERADORES */}
            {activeVerticalTab === 'usuarios' && (
              <div className="flex-1 flex flex-col p-4 sm:p-5 overflow-y-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      Operadores & Colaboradores do Escritório
                    </h3>
                    <p className="text-xs text-slate-400">
                      Cadastre contadores, auditores e assistentes fiscais com credenciais individuais.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsNewUserModalOpen(true)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Novo Operador
                  </button>
                </div>

                {/* Users List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 overflow-y-auto">
                  {usersList.map(user => {
                    const isCurrentUser = user.id === currentUser?.id || user.email === currentUser?.email;
                    const isSelectedForPerms = user.id === selectedUserId;

                    return (
                      <div
                        key={user.id}
                        className={`p-3.5 rounded-2xl border transition flex flex-col justify-between gap-3 ${
                          isSelectedForPerms
                            ? 'bg-blue-500/10 border-blue-500/40 ring-1 ring-blue-500/20'
                            : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="overflow-hidden flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-xs sm:text-sm font-bold text-white truncate">{user.name}</h4>
                              {isCurrentUser && (
                                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">
                                  Você
                                </span>
                              )}
                              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 text-[9px] uppercase font-semibold">
                                {user.role || 'escritorio'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">Empresa: {user.companyName || 'Todas as Empresas'}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px]">
                          <span className="text-slate-400">
                            Plano: <span className="text-slate-200 font-semibold uppercase">{user.plan || 'Pro'}</span>
                          </span>
                          <button
                            onClick={() => {
                              setSelectedUserId(user.id);
                              setActiveVerticalTab('acessos_perfis');
                            }}
                            className="px-2.5 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-lg font-medium text-[11px] flex items-center gap-1 cursor-pointer"
                          >
                            <Sliders className="w-3 h-3" />
                            Acessos da Árvore
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: CERTIFICADOS DIGITAIS A1 */}
            {activeVerticalTab === 'certificados' && (
              <div className="flex-1 flex flex-col p-4 sm:p-5 overflow-y-auto">
                <div className="pb-4 border-b border-slate-800">
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    Gestão de Certificados Digitais A1 (mTLS SEFAZ)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Certificados .pfx para comunicação mTLS direta com a SEFAZ Nacional e Receita Federal.
                  </p>
                </div>

                <div className="space-y-3 mt-4 overflow-y-auto">
                  {companies.map((comp, idx) => {
                    const test = certTestStatus[comp.id || comp.cnpj];

                    return (
                      <div
                        key={comp.id || idx}
                        className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col gap-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs sm:text-sm font-bold text-white">{comp.name}</h4>
                              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                                {comp.cnpj}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {comp.certUploaded ? (
                                <span className="text-emerald-400 font-medium">Arquivo: {comp.pfxFileName || 'certificado_a1.pfx'}</span>
                              ) : (
                                <span className="text-amber-400 font-medium">Nenhum certificado A1 configurado</span>
                              )}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            {comp.certUploaded && (
                              <button
                                onClick={() => handleTestSefazCert(comp)}
                                disabled={test?.testing}
                                className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                              >
                                <RefreshCw className={`w-3.5 h-3.5 ${test?.testing ? 'animate-spin' : ''}`} />
                                {test?.testing ? 'Testando mTLS...' : 'Testar Conexão SEFAZ'}
                              </button>
                            )}

                            <button
                              onClick={() => handleOpenEditForm(comp, idx)}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              {comp.certUploaded ? 'Substituir .PFX' : 'Fazer Upload .PFX'}
                            </button>
                          </div>
                        </div>

                        {/* Test Status Feedback */}
                        {test && (
                          <div className={`p-2.5 rounded-xl text-xs font-medium ${
                            test.testing
                              ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                              : test.success
                              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                          }`}>
                            {test.message}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 4: GERENCIADOR DE ACESSOS E PERFIS (ÁRVORE DE 11 MÓDULOS) */}
            {activeVerticalTab === 'acessos_perfis' && (
              <div className="flex-1 flex flex-col p-4 sm:p-5 overflow-hidden">
                
                {/* Header Controls */}
                <div className="pb-3 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shrink-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-purple-400" />
                        Matriz de Permissões Granulares
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                        11 Módulos • {totalTabsCount} Funcionalidades
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Configure individualmente o acesso por Módulo, Submódulo e Abas Internas para cada colaborador.
                    </p>
                  </div>

                  {/* Operator Selector */}
                  <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-1.5 rounded-xl">
                    <span className="text-[11px] text-slate-400 font-medium pl-1">Colaborador:</span>
                    <select
                      value={selectedUserId || ''}
                      onChange={e => setSelectedUserId(e.target.value)}
                      className="bg-slate-800 text-xs font-bold text-white rounded-lg px-2.5 py-1 border border-slate-700 focus:outline-none focus:border-purple-500"
                    >
                      {usersList.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role || 'Operador'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Operator Stats & Quick Presets Bar */}
                <div className="py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2.5 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="text-xs font-medium text-slate-300">
                      Liberação: <span className="font-bold text-purple-300">{activeUserTabsCount} de {totalTabsCount} abas</span> ({Math.round((activeUserTabsCount / totalTabsCount) * 100)}%)
                    </div>
                    <div className="w-28 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-rose-500 transition-all duration-300"
                        style={{ width: `${(activeUserTabsCount / totalTabsCount) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Quick Profile Presets */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Perfis Prontos:</span>
                    <button
                      onClick={() => applyPresetProfile('contador')}
                      className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium transition cursor-pointer"
                    >
                      Contador
                    </button>
                    <button
                      onClick={() => applyPresetProfile('auditor')}
                      className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium transition cursor-pointer"
                    >
                      Auditor Fiscal
                    </button>
                    <button
                      onClick={() => applyPresetProfile('bpo')}
                      className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium transition cursor-pointer"
                    >
                      BPO Financeiro
                    </button>
                    <button
                      onClick={() => applyPresetProfile('assistente')}
                      className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium transition cursor-pointer"
                    >
                      Assistente
                    </button>
                    <button
                      onClick={() => applyPresetProfile('todos')}
                      className="px-2 py-0.5 rounded-md bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold transition cursor-pointer"
                    >
                      Liberar Tudo
                    </button>
                  </div>
                </div>

                {/* Filter / Search Tree bar */}
                <div className="flex items-center justify-between gap-2 mb-3 shrink-0">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filtrar por nome de módulo, submódulo ou aba..."
                      value={permSearchQuery}
                      onChange={e => setPermSearchQuery(e.target.value)}
                      className="w-full pl-8.5 pr-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <button
                      onClick={() => handleExpandAll(true)}
                      className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-[11px] text-slate-300 transition cursor-pointer"
                    >
                      Expandir Tudo
                    </button>
                    <button
                      onClick={() => handleExpandAll(false)}
                      className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-[11px] text-slate-300 transition cursor-pointer"
                    >
                      Recolher Tudo
                    </button>
                  </div>
                </div>

                {/* Permissions Tree Container */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {filteredModulesTree.map((mod) => {
                    const isExpanded = expandedModules[mod.id] !== false;
                    const IconComponent = mod.icon;
                    const currentSub = selectedUser?.allowedSubmodules || {};

                    // Calculation of module state (all, some, none)
                    let totalModTabs = 0;
                    let activeModTabs = 0;
                    mod.submodules.forEach(sub => {
                      sub.tabs.forEach(tab => {
                        totalModTabs++;
                        if (currentSub[tab.id] !== false) activeModTabs++;
                      });
                    });

                    const isModuleAllActive = activeModTabs === totalModTabs && totalModTabs > 0;
                    const isModulePartiallyActive = activeModTabs > 0 && activeModTabs < totalModTabs;

                    return (
                      <div
                        key={mod.id}
                        className="rounded-2xl bg-slate-900/40 border border-slate-800/90 overflow-hidden transition-all shadow-sm"
                      >
                        {/* Level 1: Module Header */}
                        <div className="p-3 bg-gradient-to-r from-slate-900 via-[#0E1526] to-slate-900 flex items-center justify-between gap-3 border-b border-slate-800/80">
                          <div className="flex items-center gap-3 flex-1">
                            <button
                              onClick={() => toggleModuleExpand(mod.id)}
                              className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
                            >
                              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>

                            <div className={`p-1.5 rounded-lg bg-slate-800/80 ${mod.color}`}>
                              <IconComponent className="w-4 h-4" />
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-xs sm:text-sm font-bold text-white">{mod.name}</h4>
                                <span className={`px-2 py-0.2 rounded-full text-[9px] font-bold border ${mod.badgeBg}`}>
                                  {activeModTabs}/{totalModTabs} abas
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 hidden sm:block">{mod.description}</p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleToggleEntireModule(mod)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                              isModuleAllActive
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : isModulePartiallyActive
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                            }`}
                          >
                            {isModuleAllActive ? (
                              <CheckSquare className="w-3.5 h-3.5" />
                            ) : isModulePartiallyActive ? (
                              <MinusSquare className="w-3.5 h-3.5" />
                            ) : (
                              <Square className="w-3.5 h-3.5" />
                            )}
                            <span>{isModuleAllActive ? 'Módulo Liberado' : isModulePartiallyActive ? 'Parcial' : 'Bloqueado'}</span>
                          </button>
                        </div>

                        {/* Level 2 & 3: Submodules and Tabs */}
                        {isExpanded && (
                          <div className="p-3 space-y-3 bg-[#080C16]">
                            {mod.submodules.map((sub) => {
                              const allSubTabsActive = sub.tabs.every(t => currentSub[t.id] !== false);
                              const anySubTabActive = sub.tabs.some(t => currentSub[t.id] !== false);

                              return (
                                <div
                                  key={sub.id}
                                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2.5"
                                >
                                  {/* Submodule Header */}
                                  <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                                    <div>
                                      <h5 className="text-xs font-bold text-slate-200">{sub.name}</h5>
                                      <p className="text-[10px] text-slate-400">{sub.description}</p>
                                    </div>

                                    <button
                                      onClick={() => handleToggleSubmodule(sub)}
                                      className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 transition cursor-pointer ${
                                        allSubTabsActive
                                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                          : anySubTabActive
                                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                                      }`}
                                    >
                                      {allSubTabsActive ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                                      <span>{allSubTabsActive ? 'Submódulo Ativo' : 'Alternar Submódulo'}</span>
                                    </button>
                                  </div>

                                  {/* Level 3: Individual Tabs List */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                                    {sub.tabs.map((tab) => {
                                      const isTabActive = currentSub[tab.id] !== false;

                                      return (
                                        <div
                                          key={tab.id}
                                          onClick={() => handleToggleTab(tab.id)}
                                          className={`p-2 rounded-lg border transition cursor-pointer flex items-start gap-2 select-none ${
                                            isTabActive
                                              ? 'bg-purple-500/10 border-purple-500/40 text-white'
                                              : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700'
                                          }`}
                                        >
                                          <div className={`mt-0.5 ${isTabActive ? 'text-purple-400' : 'text-slate-600'}`}>
                                            {isTabActive ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                                          </div>
                                          <div className="overflow-hidden">
                                            <p className={`text-[11px] font-semibold leading-tight ${isTabActive ? 'text-slate-200' : 'text-slate-400'}`}>
                                              {tab.name}
                                            </p>
                                            <p className="text-[9px] text-slate-500 line-clamp-1">{tab.description}</p>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 5: GESTÃO FINANCEIRA (EXCLUSIVO ADMINISTRADOR) */}
            {activeVerticalTab === 'financeiro' && (
              <div className="flex-1 flex flex-col p-4 sm:p-5 overflow-y-auto">
                <div className="pb-4 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-amber-400" />
                      Gestão Financeira & Cobranças do Escritório
                    </h3>
                    <p className="text-xs text-slate-400">
                      Controle de assinatura, faturas, limites de consultas e renovações (Acesso Restrito ao Titular).
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    Área Exclusiva do Administrador
                  </span>
                </div>

                {/* Plan Highlights Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-slate-900/60 to-slate-900 border border-amber-500/30">
                    <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">Plano Atual</span>
                    <h4 className="text-lg font-black text-white mt-1">Vértice Master Ilimitado</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Empresas e consultas ilimitadas</p>
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ativo até 31/12/2099
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Mensalidade Contratada</span>
                    <h4 className="text-lg font-black text-white mt-1">R$ 590,00 <span className="text-xs font-normal text-slate-400">/mês</span></h4>
                    <p className="text-xs text-slate-400 mt-0.5">Próximo vencimento: 10/10/2026</p>
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-blue-400 font-medium">
                      <Wallet className="w-3.5 h-3.5" /> Forma: PIX Automático / Cartão
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Capacidade Contratada</span>
                    <h4 className="text-lg font-black text-white mt-1">Ilimitado</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Sem cobrança por empresa adicional</p>
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-purple-400 font-medium">
                      <Zap className="w-3.5 h-3.5" /> mTLS SEFAZ em Produção
                    </div>
                  </div>
                </div>

                {/* Invoices History */}
                <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-slate-400" />
                    Histórico de Cobranças & Recibos
                  </h4>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400">
                          <th className="pb-2 font-semibold">Competência</th>
                          <th className="pb-2 font-semibold">Descrição</th>
                          <th className="pb-2 font-semibold">Valor</th>
                          <th className="pb-2 font-semibold">Vencimento</th>
                          <th className="pb-2 font-semibold">Status</th>
                          <th className="pb-2 font-semibold text-right">Comprovante</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        <tr>
                          <td className="py-2.5 font-medium">09/2026</td>
                          <td className="py-2.5">Mensalidade Vértice Master</td>
                          <td className="py-2.5 font-semibold text-white">R$ 590,00</td>
                          <td className="py-2.5">10/09/2026</td>
                          <td className="py-2.5">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                              Liquidado
                            </span>
                          </td>
                          <td className="py-2.5 text-right">
                            <button className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 font-medium">
                              PDF <ExternalLink className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-medium">08/2026</td>
                          <td className="py-2.5">Mensalidade Vértice Master</td>
                          <td className="py-2.5 font-semibold text-white">R$ 590,00</td>
                          <td className="py-2.5">10/08/2026</td>
                          <td className="py-2.5">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                              Liquidado
                            </span>
                          </td>
                          <td className="py-2.5 text-right">
                            <button className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 font-medium">
                              PDF <ExternalLink className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: IMPORTAÇÃO EM LOTE */}
            {activeVerticalTab === 'importacao_lote' && (
              <div className="flex-1 flex flex-col p-4 sm:p-5 overflow-y-auto">
                <div className="pb-4 border-b border-slate-800">
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <Upload className="w-4 h-4 text-teal-400" />
                    Importação e Cadastro Acelerado em Lote
                  </h3>
                  <p className="text-xs text-slate-400">
                    Insira uma lista de CNPJs (um por linha) para cadastramento e sincronização automática com a Receita Federal.
                  </p>
                </div>

                <div className="space-y-4 mt-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Lista de CNPJs (1 por linha):
                    </label>
                    <textarea
                      rows={8}
                      placeholder="00.000.000/0001-00&#10;11.111.111/0001-11&#10;22.222.222/0001-22"
                      value={batchRawCnpjs}
                      onChange={e => setBatchRawCnpjs(e.target.value)}
                      className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <button
                    onClick={async () => {
                      const lines = batchRawCnpjs.split('\n').map(l => l.trim().replace(/\D/g, '')).filter(l => l.length === 14);
                      if (lines.length === 0) {
                        alert('Insira ao menos um CNPJ válido com 14 dígitos.');
                        return;
                      }

                      setBatchProgress({ active: true, current: 0, total: lines.length, step: 'Iniciando importação...' });

                      const createdList: CompanyData[] = [];

                      for (let i = 0; i < lines.length; i++) {
                        const cnpj = lines[i];
                        setBatchProgress({ active: true, current: i + 1, total: lines.length, step: `Consultando CNPJ ${cnpj} na Receita Federal...` });

                        let compName = `Empresa CNPJ ${cnpj}`;
                        let compUf = 'SP';
                        let compCnae = '6920-6/01';
                        let compCnaeDesc = 'Atividades de contabilidade';

                        try {
                          const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
                          if (res.ok) {
                            const data = await res.json();
                            if (data.razao_social) compName = data.razao_social;
                            if (data.uf) compUf = data.uf;
                            if (data.cnae_fiscal) compCnae = String(data.cnae_fiscal);
                            if (data.cnae_fiscal_descricao) compCnaeDesc = data.cnae_fiscal_descricao;
                          }
                        } catch {}

                        const newComp: CompanyData = {
                          id: `comp_${Date.now()}_${i}`,
                          name: compName,
                          cnpj: cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5"),
                          cnae: compCnae,
                          cnaeDescription: compCnaeDesc,
                          uf: compUf,
                          anexo: 'I',
                          rbt12: 0,
                          rba: 0,
                          monthlyRevenue: 0,
                          payroll12m: 0,
                          monthlyPayroll: 0,
                          regimeTributario: 'simples_nacional',
                          atividadeEmpresa: 'servicos',
                          b2bSalesPercent: 40,
                          projectionGrowthPercent: 15,
                          estimatedNetProfitMargin: 20,
                          targetIvaRate: 26.5,
                          partners: [],
                          certUploaded: false,
                          createdAt: new Date().toISOString()
                        };

                        createdList.push(newComp);
                      }

                      if (onBatchCreateCompanies) {
                        onBatchCreateCompanies(createdList);
                      } else {
                        createdList.forEach(c => onCreateCompany(c));
                      }

                      setBatchProgress({ active: false, current: lines.length, total: lines.length, step: 'Concluído!' });
                      setBatchRawCnpjs('');
                      setActiveVerticalTab('empresas');
                      alert(`${createdList.length} empresas importadas e cadastradas com sucesso!`);
                    }}
                    disabled={batchProgress.active}
                    className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition cursor-pointer shadow"
                  >
                    <Upload className="w-4 h-4" />
                    {batchProgress.active ? batchProgress.step : 'Processar & Cadastrar Lote de CNPJs'}
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* MODAL / FORM: CADASTRO / EDIÇÃO DE EMPRESA */}
        {isFormOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-2xl max-h-[90vh] bg-[#0C111E] border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
              <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building className="w-4 h-4 text-rose-400" />
                  {editingIndex !== null ? 'Editar Dados da Empresa' : 'Cadastrar Nova Empresa'}
                </h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitForm} className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
                {/* CNPJ with RFB Sync */}
                <div>
                  <label className="font-bold text-slate-300 block mb-1">CNPJ:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="00.000.000/0000-00"
                      value={formCnpj}
                      onChange={e => setFormCnpj(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-rose-500"
                    />
                    <button
                      type="button"
                      onClick={handleLookupCnpj}
                      disabled={isSearchingCnpj}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSearchingCnpj ? 'animate-spin' : ''}`} />
                      Consultar RFB
                    </button>
                  </div>
                  {cnpjFeedback && <p className="text-[11px] text-amber-400 mt-1">{cnpjFeedback}</p>}
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Razão Social / Nome:</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">UF:</label>
                    <input
                      type="text"
                      maxLength={2}
                      value={formUf}
                      onChange={e => setFormUf(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white uppercase focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Regime Tributário:</label>
                    <select
                      value={formRegimeTributario}
                      onChange={e => setFormRegimeTributario(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                    >
                      <option value="simples_nacional">Simples Nacional</option>
                      <option value="lucro_presumido">Lucro Presumido</option>
                      <option value="lucro_real">Lucro Real</option>
                      <option value="mei">MEI</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Anexo Principal do Simples:</label>
                    <select
                      value={formAnexo}
                      onChange={e => setFormAnexo(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                    >
                      <option value="I">Anexo I (Comércio)</option>
                      <option value="II">Anexo II (Indústria)</option>
                      <option value="III">Anexo III (Serviços / Fator R)</option>
                      <option value="IV">Anexo IV (Serviços Especiais)</option>
                      <option value="V">Anexo V (Serviços)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Faturamento RBT12 (R$):</label>
                    <input
                      type="number"
                      step="any"
                      value={formRbt12}
                      onChange={e => setFormRbt12(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                {/* Certificate Upload Field inside Form */}
                <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
                  <span className="font-bold text-slate-200 block text-xs">Certificado Digital A1 (.pfx / .p12)</span>
                  <CertificateUploadField
                    label="Selecionar Arquivo .PFX da Empresa"
                    onFileSelect={(file, password) => {
                      const reader = new FileReader();
                      reader.onload = () => {
                        const result = reader.result as string;
                        const base64 = result.includes(',') ? result.split(',')[1] : result;
                        setFormCertUploaded(true);
                        setFormPfxFileName(file.name);
                        setFormCertPassword(password);
                        setFormPfxBase64(base64);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  {formCertUploaded && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                      <div className="flex items-center gap-1.5 truncate">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="font-medium truncate">{formPfxFileName || 'certificado.pfx'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormCertUploaded(false);
                          setFormPfxFileName('');
                          setFormCertPassword('');
                          setFormPfxBase64('');
                        }}
                        className="text-slate-400 hover:text-rose-400 text-[11px] underline ml-2"
                      >
                        Remover
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition shadow"
                  >
                    Salvar Empresa
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: NOVO OPERADOR */}
        {isNewUserModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md bg-[#0C111E] border border-slate-700 rounded-2xl shadow-2xl p-4 text-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-blue-400" />
                  Cadastrar Novo Colaborador
                </h3>
                <button onClick={() => setIsNewUserModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-3 mt-3 text-xs">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Nome Completo:</label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={e => setNewUserName(e.target.value)}
                    placeholder="Ex: Ana Silva"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">E-mail Corporativo:</label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={e => setNewUserEmail(e.target.value)}
                    placeholder="ana@vertice.com"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Senha Provisória:</label>
                  <input
                    type="password"
                    required
                    value={newUserPassword}
                    onChange={e => setNewUserPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Empresa Padrão (Opcional):</label>
                  <input
                    type="text"
                    value={newUserCompany}
                    onChange={e => setNewUserCompany(e.target.value)}
                    placeholder="Deixe em branco para acesso a todas"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewUserModalOpen(false)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition shadow"
                  >
                    Cadastrar Operador
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
