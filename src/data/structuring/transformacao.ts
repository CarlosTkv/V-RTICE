import { StructuringModelItem } from './types';

export const TRANSFORMACAO_MODELS: StructuringModelItem[] = [
  {
    id: 'transformacao_ltda_sa',
    title: 'Transformação Societária: LTDA para S/A Fechada',
    category: 'transformacao',
    categoryName: 'Transformação & Tipos',
    badge: 'MUDANÇA DE TIPO JURÍDICO',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    description: 'Conversão jurídica de Sociedade Limitada em Sociedade Anônima de capital fechado, sem dissolução ou liquidação, criando classes de ações ordinárias e preferenciais e habilitando captação com debêntures ou fundos.',
    legalFramework: 'Arts. 1.113 a 1.115 do Código Civil; Lei nº 6.404/1976 (Lei das S/A).',
    jurisprudence: 'DREI Instrução Normativa nº 81/2020 (rito e simplificação de transformação de sociedades).',
    keyFeatures: ['Continuidade da Personalidade Jurídica e do CNPJ', 'Criação de Ações com e sem Direito a Voto', 'Adesão à Lei 6.404/76 para Investidores Institucionais', 'Estatuto Social Moderno e Ágil'],
    riskLevel: 'Alta Complexidade',
    targetProfile: 'Empresas em expansão preparando-se para receber fundos de Private Equity, Venture Capital ou emitir debêntures.',
    defaultClauses: {
      autonomiaPatrimonial: true,
      tagAlong: true,
      dragAlong: true,
      conselhoConsultivo: true,
      valuationMethod: 'balanco_determinacao',
    },
    generateFullDraft: ({ socioPF, herdeiros, nomeEmpresarial, cidade, ufEmpresa, dateFormatted }) => {
      let d = `ATA DE ASSEMBLEIA GERAL EXTRAORDINÁRIA DE TRANSFORMAÇÃO DE SOCIEDADE LIMITADA EM SOCIEDADE ANÔNIMA FECHADA\n`;
      d += `SOCIEDADE ORIGINAL: ${(nomeEmpresarial || 'EMPRESA ORIGINAL').toUpperCase()} LTDA\n`;
      d += `NOVA DENOMINAÇÃO: ${(nomeEmpresarial || 'EMPRESA ORIGINAL').toUpperCase()} S/A\n`;
      d += `ACIONISTAS FUNDADORES: ${socioPF.toUpperCase()} e ${herdeiros.toUpperCase()}\n\n`;
      d += `1. DA TRANSFORMAÇÃO DO TIPO SOCIETÁRIO (ART. 1.113 DO CÓDIGO CIVIL):\n`;
      d += `Os sócios aprovam por unanimidade a transformação da sociedade do tipo Limitada para Sociedade Anônima de Capital Fechado, sem dissolução ou liquidação, mantendo-se inalterados o número de inscrição no CNPJ, os contratos vigentes e todos os direitos e obrigações da pessoa jurídica.\n\n`;
      d += `2. DA CONVERSÃO DAS QUOTAS EM AÇÕES:\n`;
      d += `As quotas sociais representativas do capital social são inteiramente convertidas em ações ordinárias nominativas, sem valor nominal, subscritas e integralizadas pelos acionistas na proporção exata de suas participações originais.\n\n`;
      d += `3. DA APROVAÇÃO DO NOVO ESTATUTO SOCIAL:\n`;
      d += `Fica aprovado por unanimidade o Estatuto Social da Companhia, regido pela Lei nº 6.404/1976, com estrutura de Diretoria Executiva e Conselho Consultivo.\n\n`;
      d += `Comarca de ${cidade}/${ufEmpresa}, ${dateFormatted}.\n`;
      return d;
    }
  },

  {
    id: 'transformacao_sa_ltda',
    title: 'Transformação Societária: S/A para LTDA',
    category: 'transformacao',
    categoryName: 'Transformação & Tipos',
    badge: 'SIMPLIFICAÇÃO & CUSTOS',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    description: 'Transformação de Sociedade Anônima Fechada em Sociedade Limitada (LTDA) com o objetivo de reduzir custos com publicações de balanços, simplificar deliberações societárias e dispensar formalidades da Lei 6.404/76.',
    legalFramework: 'Arts. 220 a 222 da Lei nº 6.404/1976; Arts. 1.113 a 1.115 do Código Civil; IN DREI 81/2020.',
    jurisprudence: 'Precedentes das Juntas Comerciais (DREI) assegurando a imunidade tributária da transformação.',
    keyFeatures: ['Eliminação de Publicações Obrigatórias em Diário Oficial', 'Redução Drástica de Custos de Governança', 'Preservação de Todas as Relações Contratuais e Bancárias', 'Elaboração de Contrato Social por Quotas'],
    riskLevel: 'Estratégico',
    targetProfile: 'Sociedades Anônimas familiares ou de pequeno e médio porte que não necessitam mais do formato de S/A e buscam enxugar custos.',
    defaultClauses: {
      autonomiaPatrimonial: true,
      valuationMethod: 'balanco_determinacao',
    },
    generateFullDraft: ({ socioPF, herdeiros, nomeEmpresarial, cidade, ufEmpresa, dateFormatted }) => {
      let d = `ATA DE ASSEMBLEIA GERAL EXTRAORDINÁRIA DE TRANSFORMAÇÃO DE S/A EM SOCIEDADE LIMITADA\n`;
      d += `COMPANHIA: ${(nomeEmpresarial || 'COMPANHIA S/A').toUpperCase()}\n`;
      d += `NOVA RAZÃO SOCIAL: ${(nomeEmpresarial || 'COMPANHIA').toUpperCase()} LTDA\n`;
      d += `SÓCIOS: ${socioPF.toUpperCase()} e ${herdeiros.toUpperCase()}\n\n`;
      d += `1. DA TRANSFORMAÇÃO EM SOCIEDADE LIMITADA:\n`;
      d += `Aprovada por unanimidade a transformação do tipo jurídico de Sociedade Anônima Fechada para Sociedade Limitada, nos termos do Artigo 220 da Lei 6.404/76, adaptando-se o contrato social às disposições do Código Civil.\n\n`;
      d += `2. DA CONVERSÃO DAS AÇÕES EM QUOTAS:\n`;
      d += `A totalidade das ações representativas do capital social é convertida em quotas no valor nominal de R$ 1,00 cada, atribuídas aos sócios na mesma proporção anteriormente detida.\n\n`;
      d += `Comarca de ${cidade}/${ufEmpresa}, ${dateFormatted}.\n`;
      return d;
    }
  },

  {
    id: 'transformacao_ei_ltda',
    title: 'Transformação de Empresário Individual / MEI em LTDA',
    category: 'transformacao',
    categoryName: 'Transformação & Tipos',
    badge: 'BLINDAGEM PESSOAL',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    description: 'Evolução da inscrição de Empresário Individual (EI) ou desenquadramento de MEI para Sociedade Limitada (LTDA) Unipessoal ou Pluripessoal, extinguindo a responsabilidade ilimitada da pessoa física sobre as dívidas do negócio.',
    legalFramework: 'Art. 1.052, parágrafo único e Art. 1.113 do Código Civil; Lei nº 13.874/2019 (SLU); IN DREI nº 81/2020.',
    jurisprudence: 'STJ Súmula 435 e jurisprudência pacífica sobre extinção da responsabilidade ilimitada a partir do registro da LTDA.',
    keyFeatures: ['Fim da Responsabilidade Ilimitada da Pessoa Física', 'Preservação Integral do Histórico do CNPJ e Inscrições', 'Opção por Sociedade Unipessoal (SLU) ou Entrada de Sócios', 'Facilidade de Acesso a Crédito e Licitações'],
    riskLevel: 'Máxima Blindagem',
    targetProfile: 'Profissionais autônomos, prestadores de serviço e comerciantes inscritos como EI ou MEI que cresceram e precisam de blindagem patrimonial.',
    defaultClauses: {
      autonomiaPatrimonial: true,
      valuationMethod: 'balanco_determinacao',
    },
    generateFullDraft: ({ socioPF, herdeiros, nomeEmpresarial, cidade, ufEmpresa, dateFormatted }) => {
      let d = `ATO DE TRANSFORMAÇÃO DE REGISTRO DE EMPRESÁRIO INDIVIDUAL EM SOCIEDADE LIMITADA\n`;
      d += `EMPRESÁRIO INDIVIDUAL: ${socioPF.toUpperCase()}\n`;
      d += `NOVA SOCIEDADE: ${(nomeEmpresarial || 'EMPRESA COMERCIAL').toUpperCase()} LTDA\n`;
      d += `SÓCIO INGRESSANTE (SE HOUVER): ${herdeiros.toUpperCase()}\n\n`;
      d += `1. DA TRANSFORMAÇÃO DO REGISTRO:\n`;
      d += `O titular do registro de Empresário Individual, com fundamento no Artigo 1.052 do Código Civil e na Instrução Normativa DREI nº 81/2020, decide transformar seu registro em Sociedade Limitada, adotando o princípio da separação patrimonial estrita.\n\n`;
      d += `2. DA LIMITAÇÃO DA RESPONSABILIDADE:\n`;
      d += `A responsabilidade dos sócios passa a ser estritamente restrita ao valor de suas quotas, respondendo todos solidariamente pela integralização do capital social, restando protegido o patrimônio pessoal do instituidor contra obrigações sociais futuras.\n\n`;
      d += `Comarca de ${cidade}/${ufEmpresa}, ${dateFormatted}.\n`;
      return d;
    }
  },

  {
    id: 'conversao_simples_empresaria',
    title: 'Conversão: Sociedade Simples (Cartório) em Empresária (Junta)',
    category: 'transformacao',
    categoryName: 'Transformação & Tipos',
    badge: 'JURISDIÇÃO & REGISTRO',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    description: 'Mudança de regime de Sociedade Simples registrada no Registro Civil de Pessoas Jurídicas (RCPJ) para Sociedade Empresária sujeita ao registro na Junta Comercial (JUCESP/JUCERJA etc.), com assunção do elemento de empresa.',
    legalFramework: 'Arts. 966, 982 e 1.113 a 1.115 do Código Civil Brasileiro; IN DREI nº 81/2020.',
    jurisprudence: 'Critério do Art. 966 CC (organização profissional para a produção ou circulação de bens ou de serviços).',
    keyFeatures: ['Migração de Registro Cartorial para a Junta Comercial', 'Acesso à Lei de Recuperação Judicial e Falências (Lei 11.101/05)', 'Reorganização do Modelo Operacional com Elemento de Empresa', 'Manutenção da Antiguidade do CNPJ'],
    riskLevel: 'Estratégico',
    targetProfile: 'Clínicas médicas, consultorias e escritórios que expandiram suas operações e necessitam de enquadramento empresarial pleno.',
    defaultClauses: {
      autonomiaPatrimonial: true,
      valuationMethod: 'balanco_determinacao',
    },
    generateFullDraft: ({ socioPF, herdeiros, nomeEmpresarial, cidade, ufEmpresa, dateFormatted }) => {
      let d = `ALTERAÇÃO CONTRATUAL DE MIGRAÇÃO E CONVERSÃO DE SOCIEDADE SIMPLES EM SOCIEDADE EMPRESÁRIA\n`;
      d += `SOCIEDADE: ${(nomeEmpresarial || 'CLÍNICA E SERVIÇOS').toUpperCase()} LTDA\n`;
      d += `SÓCIOS: ${socioPF.toUpperCase()} e ${herdeiros.toUpperCase()}\n\n`;
      d += `1. DA CONVERSÃO PARA O REGIME EMPRESÁRIO:\n`;
      d += `Os sócios resolvem por deliberação unânime alterar a natureza jurídica da sociedade de Sociedade Simples para Sociedade Empresária, tendo em vista a estruturação de atividade econômica organizada com múltiplos estabelecimentos, funcionários e maquinários (Art. 966 do CC).\n\n`;
      d += `2. DO CANCELAMENTO NO RCPJ E ARQUIVAMENTO NA JUNTA COMERCIAL:\n`;
      d += `Será requerida a averbação do cancelamento da inscrição no Cartório de Registro Civil de Pessoas Jurídicas para subsequente arquivamento e registro na Junta Comercial do Estado.\n\n`;
      d += `Comarca de ${cidade}/${ufEmpresa}, ${dateFormatted}.\n`;
      return d;
    }
  },

  {
    id: 'regularizacao_unipessoalidade',
    title: 'Regularização de Unipessoalidade & Entrada de Novo Sócio',
    category: 'transformacao',
    categoryName: 'Transformação & Tipos',
    badge: 'REGULARIZAÇÃO ART. 1.033',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    description: 'Instrumento de alteração contratual para regularizar a saída ou falecimento de sócio anterior, evitando a dissolução da sociedade pelo decurso do prazo legal de 180 dias do Art. 1.033, IV do Código Civil, admitindo novo sócio ou convertendo em SLU.',
    legalFramework: 'Art. 1.033, IV e Art. 1.052 do Código Civil; Lei nº 13.874/2019 (Liberdade Econômica).',
    jurisprudence: 'Aplicação da Lei da Liberdade Econômica permitindo a permanência como Sociedade Limitada Unipessoal indefinidamente.',
    keyFeatures: ['Cura do Vício de Unipessoalidade Plurilateral', 'Admissão de Novo Quotista ou Ratificação de SLU', 'Consolidação Completa do Contrato Social', 'Segurança Jurídica perante Bancos e Fornecedores'],
    riskLevel: 'Estratégico',
    targetProfile: 'Sociedades que perderam um sócio por morte, retirada ou exclusão e precisam regularizar o contrato social na Junta.',
    defaultClauses: {
      autonomiaPatrimonial: true,
      valuationMethod: 'balanco_determinacao',
    },
    generateFullDraft: ({ socioPF, herdeiros, nomeEmpresarial, cidade, ufEmpresa, dateFormatted }) => {
      let d = `ALTERAÇÃO CONTRATUAL DE REGULARIZAÇÃO SOCIETÁRIA E ADMISSÃO DE NOVO SÓCIO\n`;
      d += `SOCIEDADE: ${(nomeEmpresarial || 'EMPRESA COMERCIAL').toUpperCase()} LTDA\n`;
      d += `SÓCIO REMANESCENTE: ${socioPF.toUpperCase()}\n`;
      d += `NOVO SÓCIO ADMITIDO: ${herdeiros.toUpperCase()}\n\n`;
      d += `1. DA DECLARAÇÃO DE UNIPESSOALIDADE E ADMISSÃO DE QUOTISTA:\n`;
      d += `Tendo em vista a retirada do sócio anterior e com o objetivo de afastar a incidência do Artigo 1.033, IV do Código Civil, o sócio remanescente cede parte de suas quotas ao novo sócio que ora ingressa, recompondo a pluralidade de sócios da sociedade.\n\n`;
      d += `2. DA NOVA DISTRIBUIÇÃO DO CAPITAL SOCIAL E ADMINISTRAÇÃO:\n`;
      d += `O capital social permanece integralizado e passa a ser dividido entre os sócios na nova proporção estabelecida, ratificando-se os poderes de administração de ${socioPF.toUpperCase()}.\n\n`;
      d += `Comarca de ${cidade}/${ufEmpresa}, ${dateFormatted}.\n`;
      return d;
    }
  }
];
