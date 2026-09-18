// =====================================================================================
// BASE DE DADOS NACIONAL DE CNAEs (Classificação Nacional de Atividades Econômicas)
// Módulo Fiscal, Societário e Consulta de Serviços Vértice Contábil
// Conformidade: LC 123/2006 (Simples Nacional), Resoluções CGSN, LC 116/2003 (ISS),
// Lei da Liberdade Econômica (Lei 13.874/2019) e Instruções Normativas DREI/RFB.
// =====================================================================================

export type SimplesStatusType = 
  | 'permitido'          // Permitido sem restrições
  | 'impeditivo'         // Impeditivo ao Simples Nacional (Art. 17 LC 123/06)
  | 'fator_r'            // Permitido sujeito ao Fator R (Anexo III se Folha >= 28%, senão Anexo V)
  | 'anexo_iv'           // Permitido no Anexo IV (INSS Patronal por fora / CPP não incluída)
  | 'concomitante';      // Permitido com segregação de receitas concomitantes

export type SectorType = 
  | 'servicos' 
  | 'comercio' 
  | 'industria' 
  | 'construcao' 
  | 'transporte' 
  | 'tecnologia'
  | 'saude' 
  | 'juridico_consultoria' 
  | 'imobiliario' 
  | 'financeiro' 
  | 'educacao' 
  | 'alimentacao' 
  | 'agro';

export interface CnaeRecord {
  code: string;                      // Código formatado (ex: '6201-5/01')
  codeRaw: string;                   // Código sem máscara (ex: '6201501')
  description: string;               // Denominação oficial da subclasse CNAE
  sector: SectorType;                // Setor econômico
  sectorLabel: string;               // Rótulo amigável do setor
  
  // Enquadramento no Simples Nacional
  simplesStatus: SimplesStatusType;
  simplesStatusLabel: string;
  isImpeditivo: boolean;             // true se for vedado/impeditivo ao Simples
  anexo: 'I' | 'II' | 'III' | 'IV' | 'V' | 'IMPEDITIVO' | 'III_OU_V';
  anexoDescription: string;
  subjectToFatorR: boolean;          // Sujeito ao Art. 18, § 5º-J da LC 123/06
  initialAliquot: number;            // Alíquota inicial nominal da 1ª faixa (%)
  
  // Justificativa / Fundamento Legal de Impedimento ou Enquadramento
  legalBasis: string;
  impedimentoMotivo?: string;        // Se impeditivo, o motivo formal (ex: Art. 17, X da LC 123/06)
  
  // Correlação Municipal e Tributária (LC 116/2003 / ISS / ICMS)
  itemLC116?: string;                // Item da Lista de Serviços LC 116 (ex: '1.01')
  issStandardRate?: number;          // Alíquota média de ISS praticada pelos municípios (%)
  issLocationRule?: 'prestador' | 'tomador_local';
  tributacaoIcms?: boolean;          // Sujeito ao ICMS (Comércio/Indústria/Frete)
  tributacaoIss?: boolean;           // Sujeito ao ISS (Serviços)
  
  // Regime MEI (Microempreendedor Individual)
  meiAllowed: boolean;
  meiOccupation?: string;            // Ocupação autorizada no Anexo XI da Res. CGSN 140/2018
  
  // Licenciamento e Classificação de Risco (Lei 13.874/2019 - Liberdade Econômica)
  grauRiscoSanitario: 'baixo' | 'medio' | 'alto' | 'dispensado';
  grauRiscoBombeiros: 'baixo' | 'medio' | 'alto';
  grauRiscoAmbiental: 'baixo' | 'medio' | 'alto' | 'dispensado';
  alvaraDispensado: boolean;         // Dispensa de alvará de funcionamento imediato (Risco Nível I)
  
  // Lucro Presumido (Percentuais de Presunção de Lucro)
  presuncaoIRPJ: number;             // % de presunção IRPJ (8%, 16%, 32%)
  presuncaoCSLL: number;             // % de presunção CSLL (12%, 32%)
  
  // Sinônimos e Termos de Busca Inteligente
  keywords: string[];
}

export const CNAE_DATABASE: CnaeRecord[] = [
  // =====================================================================================
  // 1. TECNOLOGIA DA INFORMAÇÃO, SOFTWARE & DADOS
  // =====================================================================================
  {
    code: '6201-5/01',
    codeRaw: '6201501',
    description: 'Desenvolvimento de programas de computador sob encomenda',
    sector: 'tecnologia',
    sectorLabel: 'Tecnologia & Software',
    simplesStatus: 'fator_r',
    simplesStatusLabel: 'Permitido (Fator R: Anexo III ou V)',
    isImpeditivo: false,
    anexo: 'III_OU_V',
    anexoDescription: 'Anexo III (6,00%) se Folha/Receita >= 28%, senão Anexo V (15,50%)',
    subjectToFatorR: true,
    initialAliquot: 6.0,
    legalBasis: 'Art. 18, § 5º-J da LC 123/2006',
    itemLC116: '1.01',
    issStandardRate: 2.5,
    issLocationRule: 'prestador',
    tributacaoIcms: false,
    tributacaoIss: true,
    meiAllowed: false,
    grauRiscoSanitario: 'dispensado',
    grauRiscoBombeiros: 'baixo',
    grauRiscoAmbiental: 'dispensado',
    alvaraDispensado: true,
    presuncaoIRPJ: 32,
    presuncaoCSLL: 32,
    keywords: ['software', 'programação', 'dev', 'app', 'aplicativo', 'sistema', 'código', 'desenvolvedor', 'saas']
  },
  {
    code: '6201-5/02',
    codeRaw: '6201502',
    description: 'Web design e criação de páginas para a internet',
    sector: 'tecnologia',
    sectorLabel: 'Tecnologia & Internet',
    simplesStatus: 'permitido',
    simplesStatusLabel: 'Permitido (Anexo III Direto)',
    isImpeditivo: false,
    anexo: 'III',
    anexoDescription: 'Anexo III (Alíquota a partir de 6,00%)',
    subjectToFatorR: false,
    initialAliquot: 6.0,
    legalBasis: 'Art. 18, § 5º-B da LC 123/2006 (Solução de Consulta COSIT 108/2021)',
    itemLC116: '1.02',
    issStandardRate: 2.0,
    issLocationRule: 'prestador',
    tributacaoIcms: false,
    tributacaoIss: true,
    meiAllowed: false,
    grauRiscoSanitario: 'dispensado',
    grauRiscoBombeiros: 'baixo',
    grauRiscoAmbiental: 'dispensado',
    alvaraDispensado: true,
    presuncaoIRPJ: 32,
    presuncaoCSLL: 32,
    keywords: ['webdesign', 'sites', 'landing page', 'ui/ux', 'design de interfaces', 'front-end']
  },
  {
    code: '6202-3/00',
    codeRaw: '6202300',
    description: 'Desenvolvimento e licenciamento de programas de computador customizáveis',
    sector: 'tecnologia',
    sectorLabel: 'Tecnologia & Software',
    simplesStatus: 'fator_r',
    simplesStatusLabel: 'Permitido (Fator R: Anexo III ou V)',
    isImpeditivo: false,
    anexo: 'III_OU_V',
    anexoDescription: 'Anexo III (6,00%) se Fator R >= 28%, senão Anexo V (15,50%)',
    subjectToFatorR: true,
    initialAliquot: 6.0,
    legalBasis: 'Art. 18, § 5º-J da LC 123/2006',
    itemLC116: '1.05',
    issStandardRate: 2.5,
    issLocationRule: 'prestador',
    tributacaoIcms: false,
    tributacaoIss: true,
    meiAllowed: false,
    grauRiscoSanitario: 'dispensado',
    grauRiscoBombeiros: 'baixo',
    grauRiscoAmbiental: 'dispensado',
    alvaraDispensado: true,
    presuncaoIRPJ: 32,
    presuncaoCSLL: 32,
    keywords: ['licenciamento de software', 'software customizável', 'erp', 'crm', 'venda de licenças']
  },
  {
    code: '6203-1/00',
    codeRaw: '6203100',
    description: 'Desenvolvimento e licenciamento de programas de computador não-customizáveis (Software de Prateleira)',
    sector: 'tecnologia',
    sectorLabel: 'Tecnologia & Software',
    simplesStatus: 'fator_r',
    simplesStatusLabel: 'Permitido (Fator R: Anexo III ou V)',
    isImpeditivo: false,
    anexo: 'III_OU_V',
    anexoDescription: 'Anexo III (6,00%) se Fator R >= 28%, senão Anexo V (15,50%)',
    subjectToFatorR: true,
    initialAliquot: 6.0,
    legalBasis: 'Art. 18, § 5º-J da LC 123/2006 / STF ADIs 1945 e 5659 (ISS)',
    itemLC116: '1.05',
    issStandardRate: 2.0,
    issLocationRule: 'prestador',
    tributacaoIcms: false,
    tributacaoIss: true,
    meiAllowed: false,
    grauRiscoSanitario: 'dispensado',
    grauRiscoBombeiros: 'baixo',
    grauRiscoAmbiental: 'dispensado',
    alvaraDispensado: true,
    presuncaoIRPJ: 32,
    presuncaoCSLL: 32,
    keywords: ['software de prateleira', 'download de software', 'licença standard', 'saas padrão']
  },
  {
    code: '6204-0/00',
    codeRaw: '6204000',
    description: 'Consultoria em tecnologia da informação (TI, arquitetura de sistemas e segurança cibernética)',
    sector: 'tecnologia',
    sectorLabel: 'Consultoria em TI',
    simplesStatus: 'fator_r',
    simplesStatusLabel: 'Permitido (Fator R: Anexo III ou V)',
    isImpeditivo: false,
    anexo: 'III_OU_V',
    anexoDescription: 'Anexo III (6,00%) se Fator R >= 28%, senão Anexo V (15,50%)',
    subjectToFatorR: true,
    initialAliquot: 6.0,
    legalBasis: 'Art. 18, § 5º-J da LC 123/2006',
    itemLC116: '1.06',
    issStandardRate: 3.0,
    issLocationRule: 'prestador',
    tributacaoIcms: false,
    tributacaoIss: true,
    meiAllowed: false,
    grauRiscoSanitario: 'dispensado',
    grauRiscoBombeiros: 'baixo',
    grauRiscoAmbiental: 'dispensado',
    alvaraDispensado: true,
    presuncaoIRPJ: 32,
    presuncaoCSLL: 32,
    keywords: ['consultoria ti', 'cybersecurity', 'segurança da informação', 'arquiteto de ti', 'cloud consulting']
  },
  {
    code: '6209-1/00',
    codeRaw: '6209100',
    description: 'Suporte técnico, manutenção e outros serviços em tecnologia da informação',
    sector: 'tecnologia',
    sectorLabel: 'Suporte em TI',
    simplesStatus: 'permitido',
    simplesStatusLabel: 'Permitido (Anexo III Direto)',
    isImpeditivo: false,
    anexo: 'III',
    anexoDescription: 'Anexo III (Alíquota a partir de 6,00%)',
    subjectToFatorR: false,
    initialAliquot: 6.0,
    legalBasis: 'Art. 18, § 5º-B da LC 123/2006',
    itemLC116: '1.07',
    issStandardRate: 2.5,
    issLocationRule: 'prestador',
    tributacaoIcms: false,
    tributacaoIss: true,
    meiAllowed: true,
    meiOccupation: 'Técnico de Manutenção de Computador Independente',
    grauRiscoSanitario: 'dispensado',
    grauRiscoBombeiros: 'baixo',
    grauRiscoAmbiental: 'dispensado',
    alvaraDispensado: true,
    presuncaoIRPJ: 32,
    presuncaoCSLL: 32,
    keywords: ['suporte ti', 'helpdesk', 'manutenção de computadores', 'redes', 'instalação de sistemas']
  },
  {
    code: '6311-9/00',
    codeRaw: '6311900',
    description: 'Tratamento de dados, provedores de serviços de aplicação e serviços de hospedagem na internet',
    sector: 'tecnologia',
    sectorLabel: 'Hospedagem & Nuvem',
    simplesStatus: 'permitido',
    simplesStatusLabel: 'Permitido (Anexo III Direto)',
    isImpeditivo: false,
    anexo: 'III',
    anexoDescription: 'Anexo III (Alíquota a partir de 6,00%)',
    subjectToFatorR: false,
    initialAliquot: 6.0,
    legalBasis: 'Art. 18, § 5º-B da LC 123/2006',
    itemLC116: '1.03',
    issStandardRate: 2.0,
    issLocationRule: 'prestador',
    tributacaoIcms: false,
    tributacaoIss: true,
    meiAllowed: false,
    grauRiscoSanitario: 'dispensado',
    grauRiscoBombeiros: 'baixo',
    grauRiscoAmbiental: 'dispensado',
    alvaraDispensado: true,
    presuncaoIRPJ: 32,
    presuncaoCSLL: 32,
    keywords: ['datacenter', 'cloud hosting', 'hospedagem de sites', 'servidor', 'processamento de dados']
  },
  {
    code: '6319-4/00',
    codeRaw: '6319400',
    description: 'Portais, provedores de conteúdo e outros serviços de informação na internet',
    sector: 'tecnologia',
    sectorLabel: 'Portais & Mídia Digital',
    simplesStatus: 'permitido',
    simplesStatusLabel: 'Permitido (Anexo III Direto)',
    isImpeditivo: false,
    anexo: 'III',
    anexoDescription: 'Anexo III (Alíquota a partir de 6,00%)',
    subjectToFatorR: false,
    initialAliquot: 6.0,
    legalBasis: 'Art. 18, § 5º-B da LC 123/2006',
    itemLC116: '1.08',
    issStandardRate: 2.5,
    issLocationRule: 'prestador',
    tributacaoIcms: false,
    tributacaoIss: true,
    meiAllowed: false,
    grauRiscoSanitario: 'dispensado',
    grauRiscoBombeiros: 'baixo',
    grauRiscoAmbiental: 'dispensado',
    alvaraDispensado: true,
    presuncaoIRPJ: 32,
    presuncaoCSLL: 32,
    keywords: ['portal de notícias', 'blog monetizado', 'provedor de conteúdo', 'marketplace de informação']
  },

  // =====================================================================================
  // 2. COMÉRCIO VAREJISTA E ATACADISTA (ANEXO I)
  // =====================================================================================
  {
    code: '4711-3/02',
    codeRaw: '4711302',
    description: 'Comércio varejista de mercadorias em geral, com predominância de produtos alimentícios - minimercados, mercearias e armazéns',
    sector: 'comercio',
    sectorLabel: 'Comércio Varejista',
    simplesStatus: 'permitido',
    simplesStatusLabel: 'Permitido (Anexo I - Comércio)',
    isImpeditivo: false,
    anexo: 'I',
    anexoDescription: 'Anexo I (Alíquota inicial de 4,00%)',
    subjectToFatorR: false,
    initialAliquot: 4.0,
    legalBasis: 'Art. 18, § 4º, I da LC 123/2006',
    tributacaoIcms: true,
    tributacaoIss: false,
    meiAllowed: true,
    meiOccupation: 'Comerciante de Produtos Alimentícios Independente',
    grauRiscoSanitario: 'medio',
    grauRiscoBombeiros: 'medio',
    grauRiscoAmbiental: 'baixo',
    alvaraDispensado: false,
    presuncaoIRPJ: 8,
    presuncaoCSLL: 12,
    keywords: ['minimercado', 'mercado', 'mercearia', 'armazém', 'venda de alimentos', 'varejo']
  },
  {
    code: '4751-2/01',
    codeRaw: '4751201',
    description: 'Comércio varejista especializado de equipamentos e suprimentos de informática',
    sector: 'comercio',
    sectorLabel: 'Comércio Varejista',
    simplesStatus: 'permitido',
    simplesStatusLabel: 'Permitido (Anexo I - Comércio)',
    isImpeditivo: false,
    anexo: 'I',
    anexoDescription: 'Anexo I (Alíquota inicial de 4,00%)',
    subjectToFatorR: false,
    initialAliquot: 4.0,
    legalBasis: 'Art. 18, § 4º, I da LC 123/2006',
    tributacaoIcms: true,
    tributacaoIss: false,
    meiAllowed: true,
    meiOccupation: 'Comerciante de Artigos de Informática Independente',
    grauRiscoSanitario: 'dispensado',
    grauRiscoBombeiros: 'baixo',
    grauRiscoAmbiental: 'dispensado',
    alvaraDispensado: true,
    presuncaoIRPJ: 8,
    presuncaoCSLL: 12,
    keywords: ['loja de informática', 'venda de computadores', 'hardware', 'periféricos', 'suprimentos']
  },
  {
    code: '4781-0/00',
    codeRaw: '4781000',
    description: 'Comércio varejista de artigos do vestuário e acessórios',
    sector: 'comercio',
    sectorLabel: 'Comércio Varejista',
    simplesStatus: 'permitido',
    simplesStatusLabel: 'Permitido (Anexo I - Comércio)',
    isImpeditivo: false,
    anexo: 'I',
    anexoDescription: 'Anexo I (Alíquota inicial de 4,00%)',
    subjectToFatorR: false,
    initialAliquot: 4.0,
    legalBasis: 'Art. 18, § 4º, I da LC 123/2006',
    tributacaoIcms: true,
    tributacaoIss: false,
    meiAllowed: true,
    meiOccupation: 'Comerciante de Artigos do Vestuário e Acessórios Independente',
    grauRiscoSanitario: 'dispensado',
    grauRiscoBombeiros: 'baixo',
    grauRiscoAmbiental: 'dispensado',
    alvaraDispensado: true,
    presuncaoIRPJ: 8,
    presuncaoCSLL: 12,
    keywords: ['loja de roupas', 'vestuário', 'moda', 'boutique', 'acessórios', 'e-commerce de roupas']
  },
  {
    code: '4789-0/99',
    codeRaw: '4789099',
    description: 'Comércio varejista de outros produtos não especificados anteriormente (E-commerce / Lojas Gerais)',
    sector: 'comercio',
    sectorLabel: 'Comércio Varejista / E-commerce',
    simplesStatus: 'permitido',
    simplesStatusLabel: 'Permitido (Anexo I - Comércio)',
    isImpeditivo: false,
    anexo: 'I',
    anexoDescription: 'Anexo I (Alíquota inicial de 4,00%)',
    subjectToFatorR: false,
    initialAliquot: 4.0,
    legalBasis: 'Art. 18, § 4º, I da LC 123/2006',
    tributacaoIcms: true,
    tributacaoIss: false,
    meiAllowed: true,
    meiOccupation: 'Comerciante de Variedades Independente',
    grauRiscoSanitario: 'baixo',
    grauRiscoBombeiros: 'baixo',
    grauRiscoAmbiental: 'baixo',
    alvaraDispensado: true,
    presuncaoIRPJ: 8,
    presuncaoCSLL: 12,
    keywords: ['e-commerce', 'loja virtual', 'dropshipping nacional', 'mercado livre', 'shopee', 'varejo geral']
  },
  {
    code: '4649-4/08',
    codeRaw: '4649408',
    description: 'Comércio atacadista de produtos de higiene, limpeza e conservação domiciliar',
    sector: 'comercio',
    sectorLabel: 'Comércio Atacadista',
    simplesStatus: 'permitido',
    simplesStatusLabel: 'Permitido (Anexo I - Comércio)',
    isImpeditivo: false,
    anexo: 'I',
    anexoDescription: 'Anexo I (Alíquota inicial de 4,00%)',
    subjectToFatorR: false,
    initialAliquot: 4.0,
    legalBasis: 'Art. 18, § 4º, I da LC 123/2006',
    tributacaoIcms: true,
    tributacaoIss: false,
    meiAllowed: false,
    grauRiscoSanitario: 'medio',
    grauRiscoBombeiros: 'medio',
    grauRiscoAmbiental: 'medio',
    alvaraDispensado: false,
    presuncaoIRPJ: 8,
    presuncaoCSLL: 12,
    keywords: ['distribuidora', 'atacado', 'produtos de limpeza', 'higiene', 'revenda b2b']
  },

  // =====================================================================================
  // 3. ATIVIDADES IMPEDITIVAS AO SIMPLES NACIONAL (ART. 17 DA LC 123/2006)
  // =====================================================================================
  {
    code: '6420-5/00',
    codeRaw: '6420500',
    description: 'Bancos comerciais e instituições de intermediação financeira',
    sector: 'financeiro',
    sectorLabel: 'Setor Financeiro & Bancário',
    simplesStatus: 'impeditivo',
    simplesStatusLabel: 'IMPEDITIVO AO SIMPLES NACIONAL',
    isImpeditivo: true,
    anexo: 'IMPEDITIVO',
    anexoDescription: 'Vedado por Lei (Art. 17, I da LC 123/2006 - Instituições Financeiras)',
    subjectToFatorR: false,
    initialAliquot: 0,
    legalBasis: 'Art. 17, inciso I da LC 123/2006',
    impedimentoMotivo: 'VEDAÇÃO EXPRESSA: Empresas que prestem serviços de intermediação financeira, câmbio, bancos ou fundos de investimento não podem optar pelo Simples Nacional.',
    tributacaoIcms: false,
    tributacaoIss: true,
    meiAllowed: false,
    grauRiscoSanitario: 'dispensado',
    grauRiscoBombeiros: 'medio',
    grauRiscoAmbiental: 'dispensado',
    alvaraDispensado: false,
    presuncaoIRPJ: 32,
    presuncaoCSLL: 32,
    keywords: ['banco', 'financeira', 'empréstimo bancário', 'fintech de crédito direto', 'instituição financeira']
  },
  {
    code: '6491-3/00',
    codeRaw: '6491300',
    description: 'Sociedades de fomento mercantil (Factoring)',
    sector: 'financeiro',
    sectorLabel: 'Factoring & Crédito',
    simplesStatus: 'impeditivo',
    simplesStatusLabel: 'IMPEDITIVO AO SIMPLES NACIONAL',
    isImpeditivo: true,
    anexo: 'IMPEDITIVO',
    anexoDescription: 'Vedado por Lei (Art. 17, III da LC 123/2006 - Factoring / Fomento Mercantil)',
    subjectToFatorR: false,
    initialAliquot: 0,
    legalBasis: 'Art. 17, inciso III da LC 123/2006',
    impedimentoMotivo: 'VEDAÇÃO EXPRESSA: Sociedades de fomento mercantil (factoring), securitização de créditos e antecipação de recebíveis são expressamente proibidas de aderir ao Simples.',
    tributacaoIcms: false,
    tributacaoIss: true,
    meiAllowed: false,
    grauRiscoSanitario: 'dispensado',
    grauRiscoBombeiros: 'baixo',
    grauRiscoAmbiental: 'dispensado',
    alvaraDispensado: true,
    presuncaoIRPJ: 32,
    presuncaoCSLL: 32,
    keywords: ['factoring', 'fomento mercantil', 'compra de duplicatas', 'antecipação de recebíveis', 'securitizadora']
  },
  {
    code: '6810-2/02',
    codeRaw: '6810202',
    description: 'Aluguel de imóveis próprios (Holding Imobiliária Pura / Locação Patrimonial)',
    sector: 'imobiliario',
    sectorLabel: 'Imobiliário & Holdings',
    simplesStatus: 'impeditivo',
    simplesStatusLabel: 'IMPEDITIVO AO SIMPLES NACIONAL',
    isImpeditivo: true,
    anexo: 'IMPEDITIVO',
    anexoDescription: 'Vedado por Lei (Art. 17, XV da LC 123/2006 - Locação de Imóveis Próprios)',
    subjectToFatorR: false,
    initialAliquot: 0,
    legalBasis: 'Art. 17, inciso XV da LC 123/2006',
    impedimentoMotivo: 'VEDAÇÃO EXPRESSA: A atividade de locação de imóveis próprios não é permitida no Simples Nacional. Deve tributar no Lucro Presumido (tributação federal efetiva de 11,33% + Adicional IRPJ).',
    tributacaoIcms: false,
    tributacaoIss: false,
    meiAllowed: false,
    grauRiscoSanitario: 'dispensado',
    grauRiscoBombeiros: 'baixo',
    grauRiscoAmbiental: 'dispensado',
    alvaraDispensado: true,
    presuncaoIRPJ: 32,
    presuncaoCSLL: 32,
    keywords: ['holding imobiliária', 'aluguel de imóveis próprios', 'locação de imóveis', 'patrimônio imobiliário']
  },
  {
    code: '6810-2/01',
    codeRaw: '6810201',
    description: 'Compra e venda de imóveis próprios e loteamento',
    sector: 'imobiliario',
    sectorLabel: 'Imobiliário & Loteamentos',
    simplesStatus: 'impeditivo',
    simplesStatusLabel: 'IMPEDITIVO AO SIMPLES NACIONAL',
    isImpeditivo: true,
    anexo: 'IMPEDITIVO',
    anexoDescription: 'Vedado por Lei (Art. 17, XV da LC 123/2006 - Loteamento e Incorporação Imobiliária)',
    subjectToFatorR: false,
    initialAliquot: 0,
    legalBasis: 'Art. 17, inciso XV da LC 123/2006',
    impedimentoMotivo: 'VEDAÇÃO EXPRESSA: Compra, venda, loteamento e incorporação de imóveis próprios não podem optar pelo Simples.',
    tributacaoIcms: false,
    tributacaoIss: false,
    meiAllowed: false,
    grauRiscoSanitario: 'dispensado',
    grauRiscoBombeiros: 'baixo',
    grauRiscoAmbiental: 'medio',
    alvaraDispensado: false,
    presuncaoIRPJ: 8,
    presuncaoCSLL: 12,
    keywords: ['incorporação imobiliária', 'compra e venda de imóveis', 'loteadora', 'spe imobiliária']
  },
  {
    code: '7820-5/00',
    codeRaw: '7820500',
    description: 'Locação de mão-de-obra temporária',
    sector: 'servicos',
    sectorLabel: 'Recursos Humanos',
    simplesStatus: 'impeditivo',
    simplesStatusLabel: 'IMPEDITIVO AO SIMPLES NACIONAL',
    isImpeditivo: true,
    anexo: 'IMPEDITIVO',
    anexoDescription: 'Vedado por Lei (Art. 17, XII da LC 123/2006 - Cessão ou Locação de Mão de Obra)',
    subjectToFatorR: false,
    initialAliquot: 0,
    legalBasis: 'Art. 17, inciso XII da LC 123/2006 (Lei nº 6.019/1974)',
    impedimentoMotivo: 'VEDAÇÃO EXPRESSA: Cessão ou locação de mão de obra temporária é expressamente vedada no Simples Nacional (salvo as exceções do Anexo IV: construção, limpeza e vigilância).',
    tributacaoIcms: false,
    tributacaoIss: true,
    meiAllowed: false,
    grauRiscoSanitario: 'dispensado',
    grauRiscoBombeiros: 'baixo',
    grauRiscoAmbiental: 'dispensado',
    alvaraDispensado: true,
    presuncaoIRPJ: 32,
    presuncaoCSLL: 32,
    keywords: ['mão de obra temporária', 'trabalho temporário', 'agência de empregos temporários', 'cessão de pessoal']
  },
  {
    code: '1113-5/02',
    codeRaw: '1113502',
    description: 'Fabricação de cervejas e chopes sem registro artesanal / Produção industrial em larga escala',
    sector: 'industria',
    sectorLabel: 'Indústria de Bebidas',
    simplesStatus: 'concomitante',
    simplesStatusLabel: 'Permitido EXCLUSIVAMENTE para Microcervejarias Artesanais',
    isImpeditivo: false,
    anexo: 'II',
    anexoDescription: 'Anexo II (Permitido apenas se registrada como microcervejaria artesanal nos termos da LC 155/2016)',
    subjectToFatorR: false,
    initialAliquot: 4.5,
    legalBasis: 'Art. 17, § 5º-A da LC 123/2006 (Alterado pela LC 155/2016)',
    tributacaoIcms: true,
    tributacaoIss: false,
    meiAllowed: false,
    grauRiscoSanitario: 'alto',
    grauRiscoBombeiros: 'alto',
    grauRiscoAmbiental: 'medio',
    alvaraDispensado: false,
    presuncaoIRPJ: 8,
    presuncaoCSLL: 12,
    keywords: ['cervejaria artesanal', 'fabricação de cerveja', 'chope', 'microcervejaria']
  },

  // =====================================================================================
  // 4. SERVIÇOS PROFISSIONAIS REGULAMENTADOS & ANEXO IV (ADVOCACIA, ENGENHARIA, OBRAS)
  // =====================================================================================
  {
    code: '6911-7/01',
    codeRaw: '6911701',
    description: 'Serviços advocatícios e assessoria jurídica (Sociedades de Advogados / Unipessoal)',
    sector: 'juridico_consultoria',
    sectorLabel: 'Advocacia & Direito',
    simplesStatus: 'anexo_iv',
    simplesStatusLabel: 'Permitido (Anexo IV Exclusivo)',
    isImpeditivo: false,
    anexo: 'IV',
    anexoDescription: 'Anexo IV (4,50% inicial) + INSS Patronal de 20% recolhido na folha',
    subjectToFatorR: false,
    initialAliquot: 4.5,
    legalBasis: 'Art. 18, § 5º-C da LC 123/2006 (Incluído pela LC 147/2014)',
    itemLC116: '17.14',
    issStandardRate: 2.0,
    issLocationRule: 'prestador',
    tributacaoIcms: false,
    tributacaoIss: true,
    meiAllowed: false,
    grauRiscoSanitario: 'dispensado',
    grauRiscoBombeiros: 'baixo',
    grauRiscoAmbiental: 'dispensado',
    alvaraDispensado: true,
    presuncaoIRPJ: 32,
    presuncaoCSLL: 32,
    keywords: ['advocacia', 'sociedade de advogados', 'advogado', 'oab', 'parecer jurídico', 'processos judiciais']
  },
  {
    code: '6920-6/01',
    codeRaw: '6920601',
    description: 'Atividades de contabilidade, escrituração contábil e auditoria',
    sector: 'juridico_consultoria',
    sectorLabel: 'Contabilidade & Consultoria',
    simplesStatus: 'permitido',
    simplesStatusLabel: 'Permitido (Anexo III Direto)',
    isImpeditivo: false,
    anexo: 'III',
    anexoDescription: 'Anexo III (Alíquota a partir de 6,00% - Sem Fator R)',
    subjectToFatorR: false,
    initialAliquot: 6.0,
    legalBasis: 'Art. 18, § 5º-B, XIV da LC 123/2006',
    itemLC116: '17.19',
    issStandardRate: 2.0,
    issLocationRule: 'prestador',
    tributacaoIcms: false,
    tributacaoIss: true,
    meiAllowed: true,
    meiOccupation: 'Contador/Técnico Contábil (Revogado para MEI pela Res. CGSN 150/2019)',
    grauRiscoSanitario: 'dispensado',
    grauRiscoBombeiros: 'baixo',
    grauRiscoAmbiental: 'dispensado',
    alvaraDispensado: true,
    presuncaoIRPJ: 32,
    presuncaoCSLL: 32,
    keywords: ['contabilidade', 'contador', 'auditoria contábil', 'crc', 'escrituração', 'bpo financeiro']
  },
  {
    code: '7112-0/00',
    codeRaw: '7112000',
    description: 'Serviços de engenharia, projetos técnicos e consultoria em engenharia civil/elétrica/mecânica',
    sector: 'juridico_consultoria',
    sectorLabel: 'Engenharia & Arquitetura',
    simplesStatus: 'fator_r',
    simplesStatusLabel: 'Permitido (Fator R: Anexo III ou V)',
    isImpeditivo: false,
    anexo: 'III_OU_V',
    anexoDescription: 'Anexo III (6,00%) se Folha/Receita >= 28%, senão Anexo V (15,50%)',
    subjectToFatorR: true,
    initialAliquot: 6.0,
    legalBasis: 'Art. 18, § 5º-J da LC 123/2006 (Fator R)',
    itemLC116: '7.01',
    issStandardRate: 3.0,
    issLocationRule: 'prestador',
    tributacaoIcms: false,
    tributacaoIss: true,
    meiAllowed: false,
    grauRiscoSanitario: 'dispensado',
    grauRiscoBombeiros: 'baixo',
    grauRiscoAmbiental: 'dispensado',
    alvaraDispensado: true,
    presuncaoIRPJ: 32,
    presuncaoCSLL: 32,
    keywords: ['engenharia', 'engenheiro', 'laudo técnico', 'art/crea', 'projetos estruturais', 'perícia de engenharia']
  },
  {
    code: '7111-7/00',
    codeRaw: '7111700',
    description: 'Serviços de arquitetura e urbanismo',
    sector: 'juridico_consultoria',
    sectorLabel: 'Engenharia & Arquitetura',
    simplesStatus: 'fator_r',
    simplesStatusLabel: 'Permitido (Fator R: Anexo III ou V)',
    isImpeditivo: false,
    anexo: 'III_OU_V',
    anexoDescription: 'Anexo III (6,00%) se Fator R >= 28%, senão Anexo V (15,50%)',
    subjectToFatorR: true,
    initialAliquot: 6.0,
    legalBasis: 'Art. 18, § 5º-J da LC 123/2006',
    itemLC116: '7.03',
    issStandardRate: 2.5,
    issLocationRule: 'prestador',
    tributacaoIcms: false,
    tributacaoIss: true,
    meiAllowed: false,
    grauRiscoSanitario: 'dispensado',
    grauRiscoBombeiros: 'baixo',
    grauRiscoAmbiental: 'dispensado',
    alvaraDispensado: true,
    presuncaoIRPJ: 32,
    presuncaoCSLL: 32,
    keywords: ['arquitetura', 'arquiteto', 'urbanismo', 'cau', 'projeto arquitetônico', 'interiores']
  },
  {
    code: '4120-4/00',
    codeRaw: '4120400',
    description: 'Construção de edifícios e obras de alvenaria',
    sector: 'construcao',
    sectorLabel: 'Construção Civil & Obras',
    simplesStatus: 'anexo_iv',
    simplesStatusLabel: 'Permitido (Anexo IV - Obras & Construção)',
    isImpeditivo: false,
    anexo: 'IV',
    anexoDescription: 'Anexo IV (4,50% inicial) + Retenção INSS 11% / CPP por fora',
    subjectToFatorR: false,
    initialAliquot: 4.5,
    legalBasis: 'Art. 18, § 5º-C da LC 123/2006',
    itemLC116: '7.02',
    issStandardRate: 3.0,
    issLocationRule: 'tomador_local',
    tributacaoIcms: false,
    tributacaoIss: true,
    meiAllowed: true,
    meiOccupation: 'Pedreiro / Construtor de Alvenaria Independente',
    grauRiscoSanitario: 'baixo',
    grauRiscoBombeiros: 'medio',
    grauRiscoAmbiental: 'medio',
    alvaraDispensado: false,
    presuncaoIRPJ: 8,
    presuncaoCSLL: 12,
    keywords: ['construção', 'obra', 'edifícios', 'empreiteira', 'reforma predial', 'construção civil']
  },
  {
    code: '4321-5/00',
    codeRaw: '4321500',
    description: 'Instalação e manutenção elétrica',
    sector: 'construcao',
    sectorLabel: 'Instalações & Manutenção',
    simplesStatus: 'anexo_iv',
    simplesStatusLabel: 'Permitido (Anexo IV)',
    isImpeditivo: false,
    anexo: 'IV',
    anexoDescription: 'Anexo IV (Alíquota a partir de 4,50%)',
    subjectToFatorR: false,
    initialAliquot: 4.5,
    legalBasis: 'Art. 18, § 5º-C da LC 123/2006',
    itemLC116: '7.02',
    issStandardRate: 2.5,
    issLocationRule: 'tomador_local',
    tributacaoIcms: false,
    tributacaoIss: true,
    meiAllowed: true,
    meiOccupation: 'Eletricista Independente',
    grauRiscoSanitario: 'dispensado',
    grauRiscoBombeiros: 'medio',
    grauRiscoAmbiental: 'baixo',
    alvaraDispensado: false,
    presuncaoIRPJ: 32,
    presuncaoCSLL: 32,
    keywords: ['eletricista', 'instalação elétrica', 'quadro de força', 'fiação', 'manutenção elétrica']
  },
  {
    code: '8121-4/00',
    codeRaw: '8121400',
    description: 'Limpeza em prédios e em domicílios',
    sector: 'servicos',
    sectorLabel: 'Serviços de Limpeza & Conservação',
    simplesStatus: 'anexo_iv',
    simplesStatusLabel: 'Permitido (Anexo IV - Retenção de INSS)',
    isImpeditivo: false,
    anexo: 'IV',
    anexoDescription: 'Anexo IV (4,50% inicial) + Retenção Previdenciária de 11%',
    subjectToFatorR: false,
    initialAliquot: 4.5,
    legalBasis: 'Art. 18, § 5º-C da LC 123/2006',
    itemLC116: '7.10',
    issStandardRate: 3.0,
    issLocationRule: 'tomador_local',
    tributacaoIcms: false,
    tributacaoIss: true,
    meiAllowed: true,
    meiOccupation: 'Diarista / Faxineiro(a) Independente',
    grauRiscoSanitario: 'baixo',
    grauRiscoBombeiros: 'baixo',
    grauRiscoAmbiental: 'baixo',
    alvaraDispensado: true,
    presuncaoIRPJ: 32,
    presuncaoCSLL: 32,
    keywords: ['limpeza', 'conservação predial', 'faxina', 'facilities', 'higienização']
  },

  // =====================================================================================
  // 5. SAÚDE, MEDICINA, ODONTOLOGIA & CLÍNICAS
  // =====================================================================================
  {
    code: '8630-5/03',
    codeRaw: '8630503',
    description: 'Atividade médica ambulatorial restrita a consultas (Clínicas Médicas e Consultórios)',
    sector: 'saude',
    sectorLabel: 'Saúde & Medicina',
    simplesStatus: 'fator_r',
    simplesStatusLabel: 'Permitido (Fator R: Anexo III ou V)',
    isImpeditivo: false,
    anexo: 'III_OU_V',
    anexoDescription: 'Anexo III (6,00%) se Fator R >= 28%, senão Anexo V (15,50%)',
    subjectToFatorR: true,
    initialAliquot: 6.0,
    legalBasis: 'Art. 18, § 5º-J da LC 123/2006 (Fator R)',
    itemLC116: '4.01',
    issStandardRate: 2.0,
    issLocationRule: 'prestador',
    tributacaoIcms: false,
    tributacaoIss: true,
    meiAllowed: false,
    grauRiscoSanitario: 'alto',
    grauRiscoBombeiros: 'medio',
    grauRiscoAmbiental: 'medio',
    alvaraDispensado: false,
    presuncaoIRPJ: 32,
    presuncaoCSLL: 32,
    keywords: ['médico', 'consulta médica', 'clínica médica', 'crm', 'telemedicina', 'especialista']
  },
  {
    code: '8630-5/04',
    codeRaw: '8630504',
    description: 'Atividade odontológica (Clínicas e Consultórios Dentários)',
    sector: 'saude',
    sectorLabel: 'Saúde & Odontologia',
    simplesStatus: 'fator_r',
    simplesStatusLabel: 'Permitido (Fator R: Anexo III ou V)',
    isImpeditivo: false,
    anexo: 'III_OU_V',
    anexoDescription: 'Anexo III (6,00%) se Fator R >= 28%, senão Anexo V (15,50%)',
    subjectToFatorR: true,
    initialAliquot: 6.0,
    legalBasis: 'Art. 18, § 5º-J da LC 123/2006',
    itemLC116: '4.02',
    issStandardRate: 2.0,
    issLocationRule: 'prestador',
    tributacaoIcms: false,
    tributacaoIss: true,
    meiAllowed: false,
    grauRiscoSanitario: 'alto',
    grauRiscoBombeiros: 'medio',
    grauRiscoAmbiental: 'medio',
    alvaraDispensado: false,
    presuncaoIRPJ: 32,
    presuncaoCSLL: 32,
    keywords: ['dentista', 'odontologia', 'consultório dentário', 'cro', 'ortodontia', 'implante']
  },
  {
    code: '8650-0/04',
    codeRaw: '8650004',
    description: 'Atividades de fisioterapia',
    sector: 'saude',
    sectorLabel: 'Saúde & Fisioterapia',
    simplesStatus: 'fator_r',
    simplesStatusLabel: 'Permitido (Fator R: Anexo III ou V)',
    isImpeditivo: false,
    anexo: 'III_OU_V',
    anexoDescription: 'Anexo III (6,00%) se Fator R >= 28%, senão Anexo V (15,50%)',
    subjectToFatorR: true,
    initialAliquot: 6.0,
    legalBasis: 'Art. 18, § 5º-J da LC 123/2006',
    itemLC116: '4.08',
    issStandardRate: 2.5,
    issLocationRule: 'prestador',
    tributacaoIcms: false,
    tributacaoIss: true,
    meiAllowed: false,
    grauRiscoSanitario: 'medio',
    grauRiscoBombeiros: 'baixo',
    grauRiscoAmbiental: 'baixo',
    alvaraDispensado: false,
    presuncaoIRPJ: 32,
    presuncaoCSLL: 32,
    keywords: ['fisioterapia', 'fisioterapeuta', 'reabilitação', 'pilates clínico', 'crefito']
  },
  {
    code: '8650-0/03',
    codeRaw: '8650003',
    description: 'Atividades de psicologia e psicanálise',
    sector: 'saude',
    sectorLabel: 'Saúde & Psicologia',
    simplesStatus: 'fator_r',
    simplesStatusLabel: 'Permitido (Fator R: Anexo III ou V)',
    isImpeditivo: false,
    anexo: 'III_OU_V',
    anexoDescription: 'Anexo III (6,00%) se Fator R >= 28%, senão Anexo V (15,50%)',
    subjectToFatorR: true,
    initialAliquot: 6.0,
    legalBasis: 'Art. 18, § 5º-J da LC 123/2006',
    itemLC116: '4.16',
    issStandardRate: 2.0,
    issLocationRule: 'prestador',
    tributacaoIcms: false,
    tributacaoIss: true,
    meiAllowed: false,
    grauRiscoSanitario: 'baixo',
    grauRiscoBombeiros: 'baixo',
    grauRiscoAmbiental: 'dispensado',
    alvaraDispensado: true,
    presuncaoIRPJ: 32,
    presuncaoCSLL: 32,
    keywords: ['psicólogo', 'psicologia', 'terapia', 'psicanálise', 'crp', 'saúde mental']
  },

  // =====================================================================================
  // 6. GESTÃO, CONSULTORIA, MARKETING & PUBLICIDADE
  // =====================================================================================
  {
    code: '7020-4/00',
    codeRaw: '7020400',
    description: 'Atividades de consultoria em gestão empresarial, exceto consultoria técnica específica',
    sector: 'juridico_consultoria',
    sectorLabel: 'Consultoria Empresarial',
    simplesStatus: 'fator_r',
    simplesStatusLabel: 'Permitido (Fator R: Anexo III ou V)',
    isImpeditivo: false,
    anexo: 'III_OU_V',
    anexoDescription: 'Anexo III (6,00%) se Fator R >= 28%, senão Anexo V (15,50%)',
    subjectToFatorR: true,
    initialAliquot: 6.0,
    legalBasis: 'Art. 18, § 5º-J da LC 123/2006 (Fator R)',
    itemLC116: '17.01',
    issStandardRate: 3.0,
    issLocationRule: 'prestador',
    tributacaoIcms: false,
    tributacaoIss: true,
    meiAllowed: false,
    grauRiscoSanitario: 'dispensado',
    grauRiscoBombeiros: 'baixo',
    grauRiscoAmbiental: 'dispensado',
    alvaraDispensado: true,
    presuncaoIRPJ: 32,
    presuncaoCSLL: 32,
    keywords: ['consultoria empresarial', 'gestão estratégica', 'advisor', 'reestruturação', 'planejamento']
  },
  {
    code: '7311-4/00',
    codeRaw: '7311400',
    description: 'Agências de publicidade e propaganda',
    sector: 'juridico_consultoria',
    sectorLabel: 'Marketing & Publicidade',
    simplesStatus: 'fator_r',
    simplesStatusLabel: 'Permitido (Fator R: Anexo III ou V)',
    isImpeditivo: false,
    anexo: 'III_OU_V',
    anexoDescription: 'Anexo III (6,00%) se Fator R >= 28%, senão Anexo V (15,50%)',
    subjectToFatorR: true,
    initialAliquot: 6.0,
    legalBasis: 'Art. 18, § 5º-J da LC 123/2006',
    itemLC116: '17.06',
    issStandardRate: 2.5,
    issLocationRule: 'prestador',
    tributacaoIcms: false,
    tributacaoIss: true,
    meiAllowed: false,
    grauRiscoSanitario: 'dispensado',
    grauRiscoBombeiros: 'baixo',
    grauRiscoAmbiental: 'dispensado',
    alvaraDispensado: true,
    presuncaoIRPJ: 32,
    presuncaoCSLL: 32,
    keywords: ['agência de publicidade', 'campanhas', 'marketing digital', 'anúncios', 'tráfego pago']
  },
  {
    code: '7319-0/02',
    codeRaw: '7319002',
    description: 'Promoção de vendas e publicidade no local de venda',
    sector: 'servicos',
    sectorLabel: 'Promoção Comercial',
    simplesStatus: 'permitido',
    simplesStatusLabel: 'Permitido (Anexo III Direto)',
    isImpeditivo: false,
    anexo: 'III',
    anexoDescription: 'Anexo III (Alíquota a partir de 6,00%)',
    subjectToFatorR: false,
    initialAliquot: 6.0,
    legalBasis: 'Art. 18, § 5º-B da LC 123/2006 (Solução COSIT 145/2019)',
    itemLC116: '17.06',
    issStandardRate: 2.0,
    issLocationRule: 'prestador',
    tributacaoIcms: false,
    tributacaoIss: true,
    meiAllowed: true,
    meiOccupation: 'Promotor(a) de Vendas Independente',
    grauRiscoSanitario: 'dispensado',
    grauRiscoBombeiros: 'baixo',
    grauRiscoAmbiental: 'dispensado',
    alvaraDispensado: true,
    presuncaoIRPJ: 32,
    presuncaoCSLL: 32,
    keywords: ['promoção de vendas', 'promotor', 'demonstração de produtos', 'trade marketing']
  },
  {
    code: '7490-1/04',
    codeRaw: '7490104',
    description: 'Atividades de intermediação e agenciamento de serviços e negócios em geral, exceto imobiliários',
    sector: 'servicos',
    sectorLabel: 'Intermediação & Agenciamento',
    simplesStatus: 'fator_r',
    simplesStatusLabel: 'Permitido (Fator R: Anexo III ou V)',
    isImpeditivo: false,
    anexo: 'III_OU_V',
    anexoDescription: 'Anexo III (6,00%) se Fator R >= 28%, senão Anexo V (15,50%)',
    subjectToFatorR: true,
    initialAliquot: 6.0,
    legalBasis: 'Art. 18, § 5º-J da LC 123/2006',
    itemLC116: '10.05',
    issStandardRate: 3.0,
    issLocationRule: 'prestador',
    tributacaoIcms: false,
    tributacaoIss: true,
    meiAllowed: false,
    grauRiscoSanitario: 'dispensado',
    grauRiscoBombeiros: 'baixo',
    grauRiscoAmbiental: 'dispensado',
    alvaraDispensado: true,
    presuncaoIRPJ: 32,
    presuncaoCSLL: 32,
    keywords: ['intermediação de negócios', 'agenciamento', 'comissões', 'afiliados', 'plataforma de intermediação']
  },

  // =====================================================================================
  // 7. TRANSPORTE & LOGÍSTICA
  // =====================================================================================
  {
    code: '4930-2/02',
    codeRaw: '4930202',
    description: 'Transporte rodoviário de carga, exceto produtos perigosos e mudanças, intermunicipal, interestadual e internacional',
    sector: 'transporte',
    sectorLabel: 'Transporte de Cargas (ICMS)',
    simplesStatus: 'permitido',
    simplesStatusLabel: 'Permitido (Anexo III ou Anexo I c/ Segregação ICMS)',
    isImpeditivo: false,
    anexo: 'III',
    anexoDescription: 'Anexo III com repartição de ICMS / Subcontratação Convênio 25/90',
    subjectToFatorR: false,
    initialAliquot: 6.0,
    legalBasis: 'Art. 18, § 5º-E e § 5º-F da LC 123/2006 (Convênio ICMS 25/90)',
    tributacaoIcms: true,
    tributacaoIss: false,
    meiAllowed: true,
    meiOccupation: 'Caminhoneiro(a) / Transportador Autônomo de Carga (MEI Caminhoneiro)',
    grauRiscoSanitario: 'baixo',
    grauRiscoBombeiros: 'medio',
    grauRiscoAmbiental: 'medio',
    alvaraDispensado: false,
    presuncaoIRPJ: 8,
    presuncaoCSLL: 12,
    keywords: ['transportadora', 'frete', 'transporte interestadual', 'cte', 'caminhão', 'logística de carga']
  },
  {
    code: '4930-2/01',
    codeRaw: '4930201',
    description: 'Transporte rodoviário de carga municipal (Entregas locais / Motofrete)',
    sector: 'transporte',
    sectorLabel: 'Transporte Municipal (ISS)',
    simplesStatus: 'permitido',
    simplesStatusLabel: 'Permitido (Anexo III - ISS Municipal)',
    isImpeditivo: false,
    anexo: 'III',
    anexoDescription: 'Anexo III (Alíquota a partir de 6,00% com parcela de ISS)',
    subjectToFatorR: false,
    initialAliquot: 6.0,
    legalBasis: 'Art. 18, § 5º-B da LC 123/2006',
    itemLC116: '16.01',
    issStandardRate: 3.0,
    issLocationRule: 'prestador',
    tributacaoIcms: false,
    tributacaoIss: true,
    meiAllowed: true,
    meiOccupation: 'Motoboy / Entregador Independente',
    grauRiscoSanitario: 'dispensado',
    grauRiscoBombeiros: 'baixo',
    grauRiscoAmbiental: 'baixo',
    alvaraDispensado: true,
    presuncaoIRPJ: 32,
    presuncaoCSLL: 32,
    keywords: ['motoboy', 'entrega rápida', 'frete municipal', 'carreto', 'delivery']
  },

  // =====================================================================================
  // 8. ALIMENTAÇÃO, BARES & RESTAURANTES
  // =====================================================================================
  {
    code: '5611-2/01',
    codeRaw: '5611201',
    description: 'Restaurantes e similares (Serviço completo de alimentação)',
    sector: 'alimentacao',
    sectorLabel: 'Restaurantes & Gastronomia',
    simplesStatus: 'permitido',
    simplesStatusLabel: 'Permitido (Anexo I - Comércio com ICMS ST e Monofásicos)',
    isImpeditivo: false,
    anexo: 'I',
    anexoDescription: 'Anexo I (Alíquota inicial de 4,00% - Bebidas com PIS/COFINS Monofásico)',
    subjectToFatorR: false,
    initialAliquot: 4.0,
    legalBasis: 'Art. 18, § 4º, I da LC 123/2006',
    tributacaoIcms: true,
    tributacaoIss: false,
    meiAllowed: true,
    meiOccupation: 'Proprietário(a) de Restaurante / Lanchonete Independente',
    grauRiscoSanitario: 'alto',
    grauRiscoBombeiros: 'alto',
    grauRiscoAmbiental: 'medio',
    alvaraDispensado: false,
    presuncaoIRPJ: 8,
    presuncaoCSLL: 12,
    keywords: ['restaurante', 'almoço', 'jantar', 'buffet', 'gastronomia', 'bar e restaurante']
  },
  {
    code: '5611-2/03',
    codeRaw: '5611203',
    description: 'Lanchonetes, casas de chá, de sucos e similares',
    sector: 'alimentacao',
    sectorLabel: 'Lanchonetes & Fast Food',
    simplesStatus: 'permitido',
    simplesStatusLabel: 'Permitido (Anexo I)',
    isImpeditivo: false,
    anexo: 'I',
    anexoDescription: 'Anexo I (Alíquota inicial de 4,00%)',
    subjectToFatorR: false,
    initialAliquot: 4.0,
    legalBasis: 'Art. 18, § 4º, I da LC 123/2006',
    tributacaoIcms: true,
    tributacaoIss: false,
    meiAllowed: true,
    meiOccupation: 'Lanchoneiro(a) Independente',
    grauRiscoSanitario: 'alto',
    grauRiscoBombeiros: 'medio',
    grauRiscoAmbiental: 'baixo',
    alvaraDispensado: false,
    presuncaoIRPJ: 8,
    presuncaoCSLL: 12,
    keywords: ['lanchonete', 'hamburgueria', 'pastelaria', 'sucos', 'cafeteria', 'fast food']
  },

  // =====================================================================================
  // 9. EDUCAÇÃO, CURSOS & TREINAMENTOS
  // =====================================================================================
  {
    code: '8599-6/04',
    codeRaw: '8599604',
    description: 'Treinamento em desenvolvimento profissional e gerencial (Cursos Livres, Workshops e Mentorias)',
    sector: 'educacao',
    sectorLabel: 'Educação & Treinamentos',
    simplesStatus: 'permitido',
    simplesStatusLabel: 'Permitido (Anexo III Direto)',
    isImpeditivo: false,
    anexo: 'III',
    anexoDescription: 'Anexo III (Alíquota a partir de 6,00% - Sem Fator R)',
    subjectToFatorR: false,
    initialAliquot: 6.0,
    legalBasis: 'Art. 18, § 5º-B da LC 123/2006 (Solução COSIT 175/2018)',
    itemLC116: '8.02',
    issStandardRate: 2.0,
    issLocationRule: 'prestador',
    tributacaoIcms: false,
    tributacaoIss: true,
    meiAllowed: true,
    meiOccupation: 'Instrutor(a) de Cursos Livres Independente',
    grauRiscoSanitario: 'dispensado',
    grauRiscoBombeiros: 'baixo',
    grauRiscoAmbiental: 'dispensado',
    alvaraDispensado: true,
    presuncaoIRPJ: 32,
    presuncaoCSLL: 32,
    keywords: ['cursos online', 'infoproduto', 'treinamento corporativo', 'mentoria', 'workshop', 'hotmart', 'kiwify']
  },
  {
    code: '8599-6/03',
    codeRaw: '8599603',
    description: 'Treinamento em informática e desenvolvimento de softwares',
    sector: 'educacao',
    sectorLabel: 'Educação em TI',
    simplesStatus: 'permitido',
    simplesStatusLabel: 'Permitido (Anexo III Direto)',
    isImpeditivo: false,
    anexo: 'III',
    anexoDescription: 'Anexo III (Alíquota a partir de 6,00%)',
    subjectToFatorR: false,
    initialAliquot: 6.0,
    legalBasis: 'Art. 18, § 5º-B da LC 123/2006',
    itemLC116: '8.02',
    issStandardRate: 2.0,
    issLocationRule: 'prestador',
    tributacaoIcms: false,
    tributacaoIss: true,
    meiAllowed: true,
    meiOccupation: 'Instrutor(a) de Informática Independente',
    grauRiscoSanitario: 'dispensado',
    grauRiscoBombeiros: 'baixo',
    grauRiscoAmbiental: 'dispensado',
    alvaraDispensado: true,
    presuncaoIRPJ: 32,
    presuncaoCSLL: 32,
    keywords: ['curso de programação', 'escola de código', 'bootcamp', 'curso de informática']
  },

  // =====================================================================================
  // 10. IMOBILIÁRIO (CORRETAGEM & ADMINISTRAÇÃO)
  // =====================================================================================
  {
    code: '6821-8/01',
    codeRaw: '6821801',
    description: 'Corretagem na compra e venda e avaliação de imóveis (Imobiliárias e Corretores de Imóveis)',
    sector: 'imobiliario',
    sectorLabel: 'Corretagem Imobiliária',
    simplesStatus: 'permitido',
    simplesStatusLabel: 'Permitido (Anexo III Direto)',
    isImpeditivo: false,
    anexo: 'III',
    anexoDescription: 'Anexo III (Alíquota a partir de 6,00% - Sem Fator R pela LC 147/2014)',
    subjectToFatorR: false,
    initialAliquot: 6.0,
    legalBasis: 'Art. 18, § 5º-B da LC 123/2006 (Incluído pela LC 147/2014)',
    itemLC116: '10.05',
    issStandardRate: 2.5,
    issLocationRule: 'prestador',
    tributacaoIcms: false,
    tributacaoIss: true,
    meiAllowed: false,
    grauRiscoSanitario: 'dispensado',
    grauRiscoBombeiros: 'baixo',
    grauRiscoAmbiental: 'dispensado',
    alvaraDispensado: true,
    presuncaoIRPJ: 32,
    presuncaoCSLL: 32,
    keywords: ['corretor de imóveis', 'imobiliária', 'creci', 'comissão de venda', 'avaliação imobiliária']
  },
  {
    code: '6821-8/02',
    codeRaw: '6821802',
    description: 'Corretagem no aluguel de imóveis e administração de imóveis para terceiros',
    sector: 'imobiliario',
    sectorLabel: 'Administração de Imóveis',
    simplesStatus: 'permitido',
    simplesStatusLabel: 'Permitido (Anexo III Direto)',
    isImpeditivo: false,
    anexo: 'III',
    anexoDescription: 'Anexo III (Alíquota a partir de 6,00%)',
    subjectToFatorR: false,
    initialAliquot: 6.0,
    legalBasis: 'Art. 18, § 5º-B da LC 123/2006',
    itemLC116: '10.05',
    issStandardRate: 2.5,
    issLocationRule: 'prestador',
    tributacaoIcms: false,
    tributacaoIss: true,
    meiAllowed: false,
    grauRiscoSanitario: 'dispensado',
    grauRiscoBombeiros: 'baixo',
    grauRiscoAmbiental: 'dispensado',
    alvaraDispensado: true,
    presuncaoIRPJ: 32,
    presuncaoCSLL: 32,
    keywords: ['administradora de aluguel', 'gestão de locação', 'taxa de administração', 'creci aluguel']
  },

  // =====================================================================================
  // 11. BELEZA, ESTÉTICA & SERVIÇOS PESSOAIS
  // =====================================================================================
  {
    code: '9602-5/01',
    codeRaw: '9602501',
    description: 'Cabeleireiros, manicure e pedicure (Salão Parceiro / Lei 13.352/2016)',
    sector: 'servicos',
    sectorLabel: 'Beleza & Estética',
    simplesStatus: 'permitido',
    simplesStatusLabel: 'Permitido (Anexo III - Dedução de Repasse Salão-Parceiro)',
    isImpeditivo: false,
    anexo: 'III',
    anexoDescription: 'Anexo III (Alíquota a partir de 6,00% com dedução legal da cota-parte de profissionais parceiros)',
    subjectToFatorR: false,
    initialAliquot: 6.0,
    legalBasis: 'Art. 13, § 1º-A da LC 123/2006 e Lei nº 13.352/2016 (Salão-Parceiro)',
    itemLC116: '6.01',
    issStandardRate: 2.0,
    issLocationRule: 'prestador',
    tributacaoIcms: false,
    tributacaoIss: true,
    meiAllowed: true,
    meiOccupation: 'Cabeleireiro(a) / Manicure Independente',
    grauRiscoSanitario: 'baixo',
    grauRiscoBombeiros: 'baixo',
    grauRiscoAmbiental: 'dispensado',
    alvaraDispensado: true,
    presuncaoIRPJ: 32,
    presuncaoCSLL: 32,
    keywords: ['salão de beleza', 'cabeleireiro', 'manicure', 'barbearia', 'salão parceiro', 'estética']
  },
  {
    code: '9602-5/02',
    codeRaw: '9602502',
    description: 'Atividades de estética e outros serviços de cuidados com a beleza',
    sector: 'servicos',
    sectorLabel: 'Beleza & Estética',
    simplesStatus: 'permitido',
    simplesStatusLabel: 'Permitido (Anexo III Direto)',
    isImpeditivo: false,
    anexo: 'III',
    anexoDescription: 'Anexo III (Alíquota a partir de 6,00%)',
    subjectToFatorR: false,
    initialAliquot: 6.0,
    legalBasis: 'Art. 18, § 5º-B da LC 123/2006',
    itemLC116: '6.02',
    issStandardRate: 2.5,
    issLocationRule: 'prestador',
    tributacaoIcms: false,
    tributacaoIss: true,
    meiAllowed: true,
    meiOccupation: 'Esteticista Independente',
    grauRiscoSanitario: 'medio',
    grauRiscoBombeiros: 'baixo',
    grauRiscoAmbiental: 'baixo',
    alvaraDispensado: false,
    presuncaoIRPJ: 32,
    presuncaoCSLL: 32,
    keywords: ['clínica de estética', 'harmonização', 'limpeza de pele', 'depilação', 'massagem estética']
  },

  // =====================================================================================
  // 12. LOCAÇÃO DE BENS MÓVEIS & EQUIPAMENTOS (SEM ISS)
  // =====================================================================================
  {
    code: '7711-0/00',
    codeRaw: '7711000',
    description: 'Locação de automóveis sem condutor (Rent a Car)',
    sector: 'servicos',
    sectorLabel: 'Locação de Veículos',
    simplesStatus: 'permitido',
    simplesStatusLabel: 'Permitido (Anexo III SEM ISS - Súmula Vinculante 31 STF)',
    isImpeditivo: false,
    anexo: 'III',
    anexoDescription: 'Anexo III com dedução integral da parcela de ISS (Súmula Vinculante 31 STF)',
    subjectToFatorR: false,
    initialAliquot: 6.0,
    legalBasis: 'Art. 18, § 5º-B da LC 123/2006 / Súmula Vinculante nº 31 do STF (Não incidência de ISS)',
    tributacaoIcms: false,
    tributacaoIss: false,
    meiAllowed: false,
    grauRiscoSanitario: 'dispensado',
    grauRiscoBombeiros: 'baixo',
    grauRiscoAmbiental: 'dispensado',
    alvaraDispensado: true,
    presuncaoIRPJ: 32,
    presuncaoCSLL: 32,
    keywords: ['locadora de veículos', 'aluguel de carros', 'rent a car', 'frotas', 'locação de automóveis']
  },
  {
    code: '7739-0/99',
    codeRaw: '7739099',
    description: 'Aluguel de outras máquinas e equipamentos comerciais e industriais não especificados anteriormente, sem operador',
    sector: 'servicos',
    sectorLabel: 'Locação de Equipamentos',
    simplesStatus: 'permitido',
    simplesStatusLabel: 'Permitido (Anexo III SEM ISS - Súmula Vinculante 31)',
    isImpeditivo: false,
    anexo: 'III',
    anexoDescription: 'Anexo III (Sem incidência de ISS na locação pura de bens móveis)',
    subjectToFatorR: false,
    initialAliquot: 6.0,
    legalBasis: 'Súmula Vinculante 31 do STF e Art. 18, § 5º-B da LC 123/2006',
    tributacaoIcms: false,
    tributacaoIss: false,
    meiAllowed: true,
    meiOccupation: 'Locador(a) de Outras Máquinas e Equipamentos Comerciais e Industriais',
    grauRiscoSanitario: 'dispensado',
    grauRiscoBombeiros: 'baixo',
    grauRiscoAmbiental: 'baixo',
    alvaraDispensado: true,
    presuncaoIRPJ: 32,
    presuncaoCSLL: 32,
    keywords: ['locação de gerador', 'locação de equipamentos', 'aluguel de máquinas', 'equipamentos industriais']
  }
];

// -------------------------------------------------------------------------------------
// FUNÇÃO UTILITÁRIA DE BUSCA INTELIGENTE DE CNAES
// -------------------------------------------------------------------------------------
export function searchCnaeDatabase(
  query: string, 
  filter: 'all' | 'permitidos' | 'impeditivos' | 'fator_r' | 'anexo_iv' | 'mei' | 'servicos' | 'comercio' = 'all'
): CnaeRecord[] {
  const cleanQuery = query.toLowerCase().trim().replace(/[.\-/]/g, '');
  
  return CNAE_DATABASE.filter(item => {
    // Filtro de status/categoria
    if (filter === 'permitidos' && item.isImpeditivo) return false;
    if (filter === 'impeditivos' && !item.isImpeditivo) return false;
    if (filter === 'fator_r' && !item.subjectToFatorR) return false;
    if (filter === 'anexo_iv' && item.anexo !== 'IV') return false;
    if (filter === 'mei' && !item.meiAllowed) return false;
    if (filter === 'servicos' && item.sector !== 'servicos' && item.sector !== 'tecnologia' && item.sector !== 'juridico_consultoria' && item.sector !== 'saude' && item.sector !== 'educacao') return false;
    if (filter === 'comercio' && item.sector !== 'comercio') return false;

    if (!cleanQuery) return true;

    const matchCode = item.codeRaw.includes(cleanQuery) || item.code.toLowerCase().includes(query.toLowerCase());
    const matchDesc = item.description.toLowerCase().includes(query.toLowerCase());
    const matchLegal = item.legalBasis.toLowerCase().includes(query.toLowerCase());
    const matchLC116 = item.itemLC116?.toLowerCase().includes(query.toLowerCase()) || false;
    const matchKeywords = item.keywords.some(k => k.toLowerCase().includes(query.toLowerCase()));

    return matchCode || matchDesc || matchLegal || matchLC116 || matchKeywords;
  });
}

// -------------------------------------------------------------------------------------
// FUNÇÃO PARA DETECTAR SE UMA LISTA DE CNAES CONTÉM ATIVIDADE IMPEDITIVA
// -------------------------------------------------------------------------------------
export function analyzeCnaeSimplesEligibility(
  primaryCnaeCode: string, 
  secondaryCnaeCodes: string[] = []
): {
  isEligible: boolean;
  impeditivoCnaes: CnaeRecord[];
  fatorRCnaes: CnaeRecord[];
  anexoIVCnaes: CnaeRecord[];
  hasMixedTaxation: boolean;
  warnings: string[];
  recommendation: string;
} {
  const allCodes = [primaryCnaeCode, ...secondaryCnaeCodes].map(c => c.trim().replace(/[.\-/]/g, ''));
  const foundRecords = CNAE_DATABASE.filter(r => allCodes.includes(r.codeRaw) || allCodes.includes(r.code));
  
  const impeditivoCnaes = foundRecords.filter(r => r.isImpeditivo);
  const fatorRCnaes = foundRecords.filter(r => r.subjectToFatorR);
  const anexoIVCnaes = foundRecords.filter(r => r.anexo === 'IV');
  
  const isEligible = impeditivoCnaes.length === 0;
  const warnings: string[] = [];

  if (!isEligible) {
    warnings.push(
      `ALERTA GRAVE (Art. 17 LC 123/2006): O CNPJ contém ${impeditivoCnaes.length} CNAE(s) IMPEDITIVO(S) ao Simples Nacional (${impeditivoCnaes.map(c => `${c.code} - ${c.description}`).join('; ')}). A presença de 1 único CNAE vedado impede a opção de todo o CNPJ!`
    );
  }

  if (fatorRCnaes.length > 0) {
    warnings.push(
      `ATENÇÃO AO FATOR R: ${fatorRCnaes.length} atividade(s) sujeita(s) ao Fator R (Art. 18, § 5º-J). Para tributar no Anexo III (6%), a folha + pró-labore em 12 meses deve ser >= 28% da receita bruta.`
    );
  }

  if (anexoIVCnaes.length > 0) {
    warnings.push(
      `INSS PATRONAL FORA DO DAS: ${anexoIVCnaes.length} atividade(s) no Anexo IV. O INSS da cota patronal (20% + RAT + Terceiros) não está incluído no DAS do Simples e deve ser recolhido na DCTFWeb.`
    );
  }

  let recommendation = '';
  if (!isEligible) {
    recommendation = `Para permanecer no Simples Nacional, você deve remover as atividades impeditivas do Objeto Social da empresa ou constituir uma SCP / CNPJ secundário segregado. Alternativamente, a empresa deverá optar pelo Lucro Presumido ou Lucro Real.`;
  } else if (fatorRCnaes.length > 0) {
    recommendation = `Recomenda-se planejamento mensal de pró-labore via simulador Fator R para manter a proporção da folha acima de 28% e garantir a menor alíquota (Anexo III).`;
  } else {
    recommendation = `Todas as atividades selecionadas são 100% compatíveis com a opção pelo Simples Nacional.`;
  }

  return {
    isEligible,
    impeditivoCnaes,
    fatorRCnaes,
    anexoIVCnaes,
    hasMixedTaxation: (fatorRCnaes.length > 0 && anexoIVCnaes.length > 0) || foundRecords.some(r => r.anexo === 'I') && foundRecords.some(r => r.anexo === 'III'),
    warnings,
    recommendation
  };
}
