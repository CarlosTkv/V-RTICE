import { StructuringModelItem } from './types';

export const REORGANIZACAO_MODELS: StructuringModelItem[] = [
  {
    id: 'cisao_parcial',
    title: 'Cisão Parcial com Vertimento de Acervo Imobiliário',
    category: 'reorganizacao',
    categoryName: 'Reorganização & M&A',
    badge: 'OPERAÇÃO SOCIETÁRIA',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    description: 'Destacamento de parcela do patrimônio líquido (imóveis, marcas ou unidades de negócios) de uma sociedade operacional para verter em uma holding patrimonial nova ou existente, sem dissolução da sociedade cindida.',
    legalFramework: 'Art. 229 da Lei nº 6.404/1976 (LSA) e Arts. 1.113 a 1.122 do Código Civil.',
    jurisprudence: 'STJ REsp 1.838.256/SP (responsabilidade solidária em cisão parcial restrita às obrigações transferidas no laudo pericial contábil).',
    keyFeatures: ['Segregação Imediata de Riscos Operacionais', 'Laudo de Avaliação Contábil e Patrimonial por Perito', 'Aprovação Unânime ou por Quórum Qualificado', 'Não Incidência de ITBI na Transferência'],
    riskLevel: 'Alta Complexidade',
    targetProfile: 'Empresas operacionais antigas que acumularam imóveis de alto valor em seu balanço e desejam isolá-los do passivo fiscal/trabalhista.',
    defaultClauses: {
      autonomiaPatrimonial: true,
      imunidadeITBI: true,
      valuationMethod: 'valor_patrimonial_contabil',
    },
    generateFullDraft: ({ socioPF, herdeiros, ativos, nomeEmpresarial, cidade, ufEmpresa, dateFormatted }) => {
      let d = `PROTOCOLO E JUSTIFICAÇÃO DE CISÃO PARCIAL COM VERTIMENTO DE ACERVO LÍQUIDO IMOBILIÁRIO\n`;
      d += `SOCIEDADE CINDIDA: ${(nomeEmpresarial || 'OPERACIONAL COMÉRCIO E INDÚSTRIA').toUpperCase()} LTDA\n`;
      d += `SOCIEDADE RECEPTORA: HOLDING PATRIMONIAL LTDA\n`;
      d += `ADMINISTRADORES INTERVENIENTES: ${socioPF.toUpperCase()} e ${herdeiros.toUpperCase()}\n`;
      d += `ACERVO VERTIDO: ${ativos.toUpperCase()}\n\n`;
      d += `1. JUSTIFICATIVA ECONÔMICO-FINANCEIRA DA OPERAÇÃO:\n`;
      d += `A cisão parcial justifica-se pela necessidade estratégica de reorganizar as atividades do grupo econômico, segregando os bens imóveis e o patrimônio estático das atividades comerciais operacionais de risco, conferindo maior liquidez e eficiência operacional.\n\n`;
      d += `2. LAUDO PERICIAL DE AVALIAÇÃO DO ACERVO VERTIDO (ART. 229 DA LSA):\n`;
      d += `O acervo líquido a ser vertido na Receptora é apurado com base em Laudo Pericial de Avaliação elaborado por peritos contábeis independentes, na data-base do último balanço de cisão, sem gerar ganho tributável.\n\n`;
      d += `3. DA RESPONSABILIDADE PELAS OBRIGAÇÕES ANTERIORES:\n`;
      d += `A sociedade receptora responderá unicamente pelas obrigações expressamente estipuladas e vinculadas ao acervo imobiliário vertido, mantendo-se as obrigações operacionais e comerciais sob exclusiva responsabilidade da Sociedade Cindida.\n\n`;
      d += `Comarca de ${cidade}/${ufEmpresa}, ${dateFormatted}.\n`;
      return d;
    }
  },

  {
    id: 'incorporacao_agio',
    title: 'Incorporação de Sociedade com Aproveitamento de Ágio',
    category: 'reorganizacao',
    categoryName: 'Reorganização & M&A',
    badge: 'ÁGIO & EFICIÊNCIA FISCAL',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    description: 'Operação societária de incorporação pela qual uma empresa absorve o patrimônio de outra, extinguindo a incorporada e permitindo o aproveitamento fiscal do ágio por rentabilidade futura (Goodwill - Art. 227 LSA e Lei 12.973/14).',
    legalFramework: 'Art. 227 da Lei nº 6.404/1976; Arts. 1.116 a 1.118 do CC; Arts. 20 a 22 da Lei nº 12.973/2014.',
    jurisprudence: 'CARF Acórdão 1301-005.122 (validade de aproveitamento de ágio com propósito negocial autêntico e confusão societária real).',
    keyFeatures: ['Amortização Fiscal de Ágio (Goodwill) em até 5 Anos', 'Extinção de Custos Administrativos Duplicados', 'Laudo Pericial de Acervo Líquido a Valor Justo', 'Propósito Negocial Comprovado'],
    riskLevel: 'Alta Complexidade',
    targetProfile: 'Grupos em consolidação ou investidores que adquiriram empresas com ágio e desejam deduzir o valor no IRPJ/CSLL.',
    defaultClauses: {
      autonomiaPatrimonial: true,
      valuationMethod: 'fluxo_caixa_descontado',
    },
    generateFullDraft: ({ socioPF, herdeiros, nomeEmpresarial, cidade, ufEmpresa, dateFormatted }) => {
      let d = `INSTRUMENTO DE PROTOCOLO E JUSTIFICAÇÃO DE INCORPORAÇÃO SOCIETÁRIA (ART. 227 DA LEI 6.404/76)\n`;
      d += `SOCIEDADE INCORPORADORA: ${(nomeEmpresarial || 'CORPORAÇÃO INCORPORADORA').toUpperCase()} LTDA\n`;
      d += `SOCIEDADE INCORPORADA: EMPRESA ADQUIRIDA LTDA\n`;
      d += `ADMINISTRADORES: ${socioPF.toUpperCase()} e ${herdeiros.toUpperCase()}\n\n`;
      d += `1. DO PROPÓSITO NEGOCIAL DA INCORPORAÇÃO:\n`;
      d += `A presente operação decorre da aquisição prévia e visa unificar as estruturas fabris, comerciais e financeiras, eliminando custos redundantes e consolidando a liderança de mercado com sinergias corporativas reais.\n\n`;
      d += `2. DO LAUDO CONTÁBIL E EXTINÇÃO DA SOCIEDADE INCORPORADA:\n`;
      d += `A Incorporadora sucede a Incorporada a título universal em todos os seus direitos, contratos e obrigações, promovendo-se a extinção de pleno direito da Sociedade Incorporada na Junta Comercial respectiva.\n\n`;
      d += `Comarca de ${cidade}/${ufEmpresa}, ${dateFormatted}.\n`;
      return d;
    }
  },

  {
    id: 'fusao_sociedades',
    title: 'Fusão de Sociedades com Consolidação em Nova Sociedade',
    category: 'reorganizacao',
    categoryName: 'Reorganização & M&A',
    badge: 'CONSOLIDAÇÃO TOTAL',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    description: 'União de duas ou mais sociedades distintas que se extinguem simultaneamente para dar origem a uma nova sociedade empresária sucessora de todo o patrimônio e contratos anteriores (Art. 228 LSA e Art. 1.119 CC).',
    legalFramework: 'Art. 228 da Lei nº 6.404/1976; Arts. 1.119 a 1.121 do Código Civil Brasileiro.',
    jurisprudence: 'STJ REsp 1.259.043/SP (sucessão processual e contratual automática da sociedade resultante da fusão).',
    keyFeatures: ['Extinção Simultânea das Empresas Originais', 'Nascimento de Nova Entidade Jurídica Única', 'Subscrição do Novo Capital pelos Sócios Pretéritos', 'Economia de Escala e Poder de Mercado'],
    riskLevel: 'Alta Complexidade',
    targetProfile: 'Concorrentes ou parceiros que unem operações de igual porte para criar um player dominante no setor.',
    defaultClauses: {
      autonomiaPatrimonial: true,
      tagAlong: true,
      valuationMethod: 'balanco_determinacao',
    },
    generateFullDraft: ({ socioPF, herdeiros, nomeEmpresarial, cidade, ufEmpresa, dateFormatted }) => {
      let d = `INSTRUMENTO DE FUSÃO DE SOCIEDADES E CONSTITUIÇÃO DE NOVA SOCIEDADE (ART. 228 DA LSA)\n`;
      d += `SOCIEDADES FUSIONADAS:\n- SOCIEDADE ALFA LTDA (Representada por ${socioPF.toUpperCase()})\n- SOCIEDADE BETA LTDA (Representada por ${herdeiros.toUpperCase()})\n`;
      d += `NOVA SOCIEDADE RESULTANTE: ${(nomeEmpresarial || 'NOVA SOCIEDADE FUSIONADA').toUpperCase()} S/A\n\n`;
      d += `1. DA EXTINÇÃO DAS SOCIEDADES ANTERIORES E SUCESSÃO UNIVERSAL:\n`;
      d += `As Sociedades Alfa e Beta extinguem-se nesta data por ato de fusão, vertendo a totalidade de seus ativos, passivos, contratos comerciais e licenças na Nova Sociedade Resultante, que as sucede a título universal em todos os direitos e deveres.\n\n`;
      d += `2. DA DISTRIBUIÇÃO DO CAPITAL SOCIAL RESULTANTE:\n`;
      d += `Os sócios das sociedades extintas recebem quotas/ações da nova sociedade na exata proporção apurada no Laudo de Avaliação Patrimonial aprovado em assembleia geral conjunta.\n\n`;
      d += `Comarca de ${cidade}/${ufEmpresa}, ${dateFormatted}.\n`;
      return d;
    }
  },

  {
    id: 'incorporacao_acoes',
    title: 'Incorporação de Ações (Share Swap / Holding de Controle)',
    category: 'reorganizacao',
    categoryName: 'Reorganização & M&A',
    badge: 'SHARE SWAP & HOLDING',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    description: 'Operação societária pela qual uma companhia incorpora a totalidade das ações/quotas de outra sociedade, transformando-a em sua subsidiária integral, com entrega de novas ações aos acionistas da incorporada sem desembolso financeiro.',
    legalFramework: 'Art. 252 da Lei nº 6.404/1976; Art. 1.053 do Código Civil.',
    jurisprudence: 'CVM e Receita Federal (não incidência de ganho de capital na mera permuta de participações societárias ao custo contábil).',
    keyFeatures: ['Criação de Subsidiária Integral (Art. 252 LSA)', 'Permuta de Ações sem Desembolso de Caixa (Cashless)', 'Não Incidência de Ganho de Capital Imediato', 'Concentração de Controle na Holding do Topo'],
    riskLevel: 'Alta Complexidade',
    targetProfile: 'Grupos que pretendem estruturar uma holding do topo e manter as empresas operacionais existentes como subsidiárias integrais.',
    defaultClauses: {
      tagAlong: true,
      dragAlong: true,
      valuationMethod: 'balanco_determinacao',
    },
    generateFullDraft: ({ socioPF, herdeiros, nomeEmpresarial, cidade, ufEmpresa, dateFormatted }) => {
      let d = `PROTOCOLO E JUSTIFICAÇÃO DE INCORPORAÇÃO DE AÇÕES (ARTIGO 252 DA LEI Nº 6.404/1976)\n`;
      d += `SOCIEDADE INCORPORADORA DE AÇÕES: ${(nomeEmpresarial || 'HOLDING CONTROLADORA').toUpperCase()} S/A\n`;
      d += `SOCIEDADE CUJAS AÇÕES SÃO INCORPORADAS: OPERACIONAL SUBSIDIÁRIA S/A\n`;
      d += `ACIONISTAS: ${socioPF.toUpperCase()} e ${herdeiros.toUpperCase()}\n\n`;
      d += `1. DA MECÂNICA DA INCORPORAÇÃO DE AÇÕES:\n`;
      d += `A Incorporadora aprova o aumento de seu capital social para incorporar a totalidade das ações da Sociedade Incorporada, conferindo aos seus acionistas ações de emissão da Incorporadora, convertendo a Incorporada em Subsidiária Integral (Art. 252 da Lei 6.404/76).\n\n`;
      d += `2. DA RELAÇÃO DE SUBSTITUIÇÃO DAS AÇÕES:\n`;
      d += `A relação de troca foi estabelecida com base nos laudos contábeis periciais a valor de patrimônio líquido a preços de mercado, garantindo tratamento estritamente equitativo a todos os acionistas.\n\n`;
      d += `Comarca de ${cidade}/${ufEmpresa}, ${dateFormatted}.\n`;
      return d;
    }
  },

  {
    id: 'spa_escrow_earnout',
    title: 'Contrato de Compra e Venda de Quotas (SPA) com Escrow & Earn-Out',
    category: 'reorganizacao',
    categoryName: 'Reorganização & M&A',
    badge: 'M&A & TRANSAÇÃO',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    description: 'Contrato padrão de M&A com regras de fechamento (Closing), retenção em conta garantia (Escrow Account) para contingências pretéritas e parcela variável atrelada ao EBITDA futuro auditado (Earn-Out).',
    legalFramework: 'Arts. 481 a 504 e Art. 1.057 do Código Civil; Lei de Liberdade Econômica nº 13.874/2019.',
    jurisprudence: 'STJ REsp 1.634.058/SP (validade de retenção em conta escrow e critérios objetivos de apuração de earn-out).',
    keyFeatures: ['Declarações e Garantias Formais (Reps & Warranties)', 'Retenção em Conta Escrow de 15% por 36 meses', 'Parcela de Earn-Out Indexada a Metas Auditadas', 'Cláusula de Não-Concorrência Pós-Venda (Non-Compete)'],
    riskLevel: 'Alta Complexidade',
    targetProfile: 'Venda total ou parcial de empresas e transações de M&A com compradores estratégicos ou fundos de Private Equity.',
    defaultClauses: {
      escrowEarnout: true,
      nonCompete: true,
      valuationMethod: 'fluxo_caixa_descontado',
    },
    generateFullDraft: ({ socioPF, herdeiros, nomeEmpresarial, cidade, ufEmpresa, dateFormatted }) => {
      let d = `CONTRATO DE COMPRA E VENDA DE QUOTAS SOCIAIS (SHARE PURCHASE AGREEMENT - SPA)\n`;
      d += `SOCIEDADE ALVO: ${(nomeEmpresarial || 'TARGET PARTICIPAÇÕES').toUpperCase()} LTDA\n`;
      d += `VENDEDORES: ${socioPF.toUpperCase()}\n`;
      d += `COMPRADORES INVESTIDORES: ${herdeiros.toUpperCase()}\n\n`;
      d += `1. DO OBJETO E PREÇO DA TRANSAÇÃO:\n`;
      d += `Os Vendedores alienam aos Compradores a totalidade das quotas sociais pelo Preço Base de Fechamento ajustado pela Dívida Líquida e Capital de Giro na data do fechamento (Closing).\n\n`;
      d += `2. DA RETENÇÃO EM CONTA ESCROW DE GARANTIA (ESCROW ACCOUNT):\n`;
      d += `Fica retido o percentual de 15% do preço total de aquisição em conta de depósito bancário em garantia (Escrow), pelo prazo de 3 (três) anos, destinada a assegurar as indenizações de eventuais passivos fiscais, trabalhistas e ambientais de responsabilidade dos Vendedores.\n\n`;
      d += `3. DA PARCELA COMPLEMENTAR DE EARN-OUT:\n`;
      d += `Os Vendedores farão jus a pagamento adicional condicionado ao atingimento de EBITDA mínimo anual verificado por auditoria independente Big Four nos dois exercícios sociais subsequentes.\n\n`;
      d += `Comarca de ${cidade}/${ufEmpresa}, ${dateFormatted}.\n`;
      return d;
    }
  },

  {
    id: 'apa_trespasse',
    title: 'Contrato de Aquisição de Estabelecimento / Trespasse (APA)',
    category: 'reorganizacao',
    categoryName: 'Reorganização & M&A',
    badge: 'TRESPASSE COMERCIAL',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    description: 'Aquisição de complexo de bens e unidade produtiva (Asset Purchase Agreement / Trespasse) com observância do Art. 1.146 do Código Civil, notificação aos credores e cláusula expressa de não restabelecimento comercial.',
    legalFramework: 'Arts. 1.142 a 1.149 do Código Civil Brasileiro; Art. 133 do Código Tributário Nacional (CTN).',
    jurisprudence: 'STJ Súmula 435 e REsp 1.526.560/SP (responsabilidade do adquirente no trespasse e eficácia da publicação perante credores).',
    keyFeatures: ['Compra dos Ativos Físicos e Intangíveis sem o CNPJ', 'Notificação de Credores e Anuência Prévia ou Depósito', 'Cláusula de Não-Restabelecimento Concorrencial (Art. 1.147 CC)', 'Laudo Descritivo do Ponto Comercial e Equipamentos'],
    riskLevel: 'Alta Complexidade',
    targetProfile: 'Investidores que compram apenas o negócio operacional (fábrica, restaurante, loja) sem assumir os passivos fiscais do CNPJ antigo.',
    defaultClauses: {
      nonCompete: true,
      valuationMethod: 'balanco_determinacao',
    },
    generateFullDraft: ({ socioPF, herdeiros, ativos, nomeEmpresarial, cidade, ufEmpresa, dateFormatted }) => {
      let d = `CONTRATO DE TRESPASSE E AQUISIÇÃO DE ESTABELECIMENTO COMERCIAL (ASSET PURCHASE AGREEMENT - APA)\n`;
      d += `VENDEDORA DO ESTABELECIMENTO: ${(nomeEmpresarial || 'ESTABELECIMENTO ORIGINAL').toUpperCase()} LTDA (Rep: ${socioPF.toUpperCase()})\n`;
      d += `COMPRADORA ADQUIRENTE: NOVA GESTÃO EMPRESARIAL LTDA (Rep: ${herdeiros.toUpperCase()})\n`;
      d += `ESTABELECIMENTO E BENS ADQUIRIDOS: ${ativos.toUpperCase()}\n\n`;
      d += `1. DO OBJETO DO TRESPASSE:\n`;
      d += `A Vendedora aliena à Compradora o estabelecimento empresarial composto por instalações, estoque físico, maquinário, clientela, ponto comercial e fundo de comércio (goodwill), sem transferência do passivo tributário anterior, operando-se o arquivamento na Junta Comercial nos termos do Art. 1.144 do CC.\n\n`;
      d += `2. DA OBRIGAÇÃO DE NÃO RESTABELECIMENTO (ART. 1.147 DO CÓDIGO CIVIL):\n`;
      d += `A Vendedora e seus sócios obrigam-se a não fazer concorrência à Compradora nos próximos 5 (cinco) anos no raio territorial de 20 km, sob pena de multa não compensatória correspondente ao dobro do valor do trespasse.\n\n`;
      d += `Comarca de ${cidade}/${ufEmpresa}, ${dateFormatted}.\n`;
      return d;
    }
  }
];
