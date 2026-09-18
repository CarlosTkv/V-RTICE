import { StructuringModelItem } from './types';

export const GOVERNANCA_MODELS: StructuringModelItem[] = [
  {
    id: 'acordo_socios',
    title: 'Acordo de Sócios Parassocial (LTDA)',
    category: 'governanca',
    categoryName: 'Governança & Founders',
    badge: 'PARASSOCIAL & CONTROLE',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    description: 'Pacto parassocial arquivado na sede da sociedade que vincula administradores e sócios: voto prévio em bloco, quóruns qualificados, restrição de entrada de terceiros, direito de preferência, tag along e regras de saída.',
    legalFramework: 'Art. 118 da Lei nº 6.404/1976 (aplicação supletiva); Arts. 997 e 1.053 do Código Civil; Enunciado 48 do CJF.',
    jurisprudence: 'STJ REsp 1.185.982/SP (eficácia vinculante do acordo parassocial e nulidade de votos proferidos com violação ao acordo).',
    keyFeatures: ['Direito de Preferência Absoluto', 'Tag-Along e Drag-Along', 'Voto Prévio Obrigatório em Reuniões Internas', 'Execução Específica das Obrigações'],
    riskLevel: 'Estratégico',
    targetProfile: 'Sociedades com dois ou mais sócios que buscam previsibilidade, prevenção de litígios e alinhamento de voto e dividendos.',
    defaultClauses: {
      prefRoute: true,
      tagAlong: true,
      dragAlong: true,
      deadlock: true,
      callOption: true,
      nonCompete: true,
      valuationMethod: 'balanco_determinacao',
    },
    generateFullDraft: ({ socioPF, herdeiros, nomeEmpresarial, cidade, ufEmpresa, dateFormatted, clauses }) => {
      let d = `ACORDO DE QUOTISTAS PARASSOCIAL VINCULANTE (ART. 118 DA LEI 6.404/76 C/C ART. 1.053 DO CÓDIGO CIVIL)\n`;
      d += `SOCIEDADE INTERVENIENTE: ${(nomeEmpresarial || 'SOCIEDADE EMPRESÁRIA').toUpperCase()} LTDA\n\n`;
      d += `SÓCIOS SIGNATÁRIOS:\n- ${socioPF.toUpperCase()} (Grupo Titular A)\n- ${herdeiros.toUpperCase()} (Grupo Titular B)\n\n`;
      d += `CLÁUSULA PRIMEIRA - DA VINCULAÇÃO SOCIETÁRIA E ARQUIVAMENTO:\n`;
      d += `O presente Acordo é celebrado em caráter irrevogável e irretratável e será imediatamente arquivado na sede da Sociedade, averbado no Livro de Registro e Controle de Quotas, vinculando de forma absoluta a Sociedade, seus administradores presentes e futuros e terceiros.\n\n`;
      
      if (clauses.prefRoute) {
        d += `CLÁUSULA SEGUNDA - DO DIREITO DE PREFERÊNCIA ABSOLUTO (ROFR):\n`;
        d += `Nenhum sócio poderá vender, ceder ou onerar suas quotas a terceiros sem antes ofertá-las formalmente, por escrito, aos demais sócios signatários, que terão prazo de 30 (trinta) dias para exercer o direito de preferência em igualdade de condições de preço e pagamento.\n\n`;
      }

      if (clauses.tagAlong) {
        d += `CLÁUSULA TERCEIRA - DO TAG-ALONG (DIREITO DE CO-VENDA CONJUNTA):\n`;
        d += `Em caso de alienação onerosa do controle societário a terceiro investidor, os sócios minoritários signatários têm o direito intransferível de exigir que suas quotas sejam incluídas na mesma transação, recebendo o mesmo preço por quota e idênticas condições de liquidação pagas ao controlador.\n\n`;
      }

      if (clauses.dragAlong) {
        d += `CLÁUSULA QUARTA - DO DRAG-ALONG (OBRIGAÇÃO DE CO-VENDA / ARRASTO):\n`;
        d += `Caso titulares de mais de 75% das quotas decidam alienar 100% da Sociedade para adquirente de boa-fé em proposta formal e auditada, poderão obrigar os demais sócios minoritários a venderem a totalidade de suas participações pelos mesmos termos e valores.\n\n`;
      }

      if (clauses.deadlock) {
        d += `CLÁUSULA QUINTA - RESOLUÇÃO DE IMPASSES (DEADLOCK - SHOTGUN / TEXAS SHOOTOUT):\n`;
        d += `Havendo empate ou dissidência insanável que paralise as atividades da empresa por mais de 45 dias, qualquer das partes poderá ofertar à outra a compra integral de suas quotas a determinado preço por quota; a parte receptora terá 20 dias para aceitar vender suas quotas por aquele valor ou comprar as quotas da parte ofertante pelo mesmíssimo preço.\n\n`;
      }

      if (clauses.nonCompete) {
        d += `CLÁUSULA SEXTA - NÃO CONCORRÊNCIA E NÃO ALICIAMENTO:\n`;
        d += `Os sócios obrigam-se, durante sua permanência na sociedade e pelo período de 3 (três) anos contados de sua retirada ou exclusão, a não exercer direta ou indiretamente atividade concorrente e a não aliciar clientes, fornecedores ou funcionários da Sociedade.\n\n`;
      }

      d += `CLÁUSULA SÉTIMA - DA EXECUÇÃO ESPECÍFICA (ART. 118, § 3º DA LEI 6.404/76):\n`;
      d += `O presidente de qualquer deliberação ou reunião de sócios não computará o voto proferido contra o estipulado neste Acordo, cabendo tutela de urgência e execução específica para cumprimento in natura.\n\n`;
      d += `Comarca de ${cidade}/${ufEmpresa}, ${dateFormatted}.\n`;
      return d;
    }
  },

  {
    id: 'acordo_acionistas',
    title: 'Acordo de Acionistas (S/A Fechada)',
    category: 'governanca',
    categoryName: 'Governança & Founders',
    badge: 'LEI DAS S/A - ART. 118',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    description: 'Instrumento avançado nos termos do Art. 118 da Lei 6.404/1976 regulando compra e venda de ações ordinárias/preferenciais, preferência para aquisição, exercício do direito a voto e do poder de controle com eficácia real perante a companhia.',
    legalFramework: 'Art. 118 da Lei nº 6.404/1976 (LSA); Arts. 497 e 536 do Código de Processo Civil.',
    jurisprudence: 'STJ REsp 1.391.802/SP (aplicação do Art. 118 da LSA e nulidade absoluta de deliberações em assembleia que contrariem o acordo).',
    keyFeatures: ['Eficácia Erga Omnes Registrada no Livro de Ações', 'Eleição Prévia de Conselheiros de Administração', 'Voto em Reunião Prévia Vinculante', 'Bloqueio de Transferência junto ao Escriturador'],
    riskLevel: 'Alta Complexidade',
    targetProfile: 'Sociedades Anônimas de capital fechado com múltiplos acionistas, fundos de Venture Capital/Private Equity ou sócios investidores.',
    defaultClauses: {
      prefRoute: true,
      tagAlong: true,
      dragAlong: true,
      deadlock: true,
      conselhoConsultivo: true,
      valuationMethod: 'balanco_determinacao',
    },
    generateFullDraft: ({ socioPF, herdeiros, nomeEmpresarial, cidade, ufEmpresa, dateFormatted }) => {
      let d = `ACORDO DE ACIONISTAS DA COMPANHIA (REGULADO PELO ART. 118 DA LEI Nº 6.404/1976)\n`;
      d += `COMPANHIA: ${(nomeEmpresarial || 'COMPANHIA S/A').toUpperCase()}\n`;
      d += `ACIONISTAS CONTROLADORES: ${socioPF.toUpperCase()}\n`;
      d += `ACIONISTAS MINORITÁRIOS / INVESTIDORES: ${herdeiros.toUpperCase()}\n\n`;
      d += `CLÁUSULA PRIMEIRA - DA AVERBAÇÃO NO LIVRO DE REGISTRO DE AÇÕES NOMINATIVAS:\n`;
      d += `Nos termos do caput e § 1º do Artigo 118 da Lei 6.404/76, este Acordo será averbado no Livro de Registro de Ações Nominativas da Companhia, devendo o Diretor-Presidente ou a instituição custodiante apor carimbo restritivo em todos os certificados de ações.\n\n`;
      d += `CLÁUSULA SEGUNDA - DA REUNIÃO PRÉVIA DE ALINHAMENTO DE VOTO:\n`;
      d += `Antes de qualquer Assembleia Geral Ordinária ou Extraordinária, ou reunião do Conselho de Administração, os Acionistas signatários reunir-se-ão previamente para definir o voto em bloco da maioria. O voto definido na reunião prévia será obrigatoriamente exercido pelo representante comum na Assembleia da Companhia.\n\n`;
      d += `CLÁUSULA TERCEIRA - DA COMPOSIÇÃO DO CONSELHO DE ADMINISTRAÇÃO E VETOS QUALIFICADOS:\n`;
      d += `A eleição dos membros do Conselho de Administração observará a proporção fixada neste pacto, sendo necessária aprovação unânime dos signatários para matérias de endividamento superior a 20% do patrimônio líquido, emissão de debêntures ou alienação de bens do ativo não circulante.\n\n`;
      d += `Comarca de ${cidade}/${ufEmpresa}, ${dateFormatted}.\n`;
      return d;
    }
  },

  {
    id: 'acordo_founders',
    title: 'Acordo de Founders & Reverse Vesting (Startups)',
    category: 'governanca',
    categoryName: 'Governança & Founders',
    badge: 'STARTUP & VENTURE',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    description: 'Estruturação inicial de governança para co-fundadores de startups: compromisso de dedicação integral (Full Time), cessão irreversível de propriedade intelectual (IP Assignment), Reverse Vesting e trava de Lock-Up para saídas precipitadas.',
    legalFramework: 'Lei Complementar nº 182/2021 (Marco Legal das Startups); Arts. 421 e 1.053 do Código Civil.',
    jurisprudence: 'Precedentes de Venture Capital e Direito Empresarial Inovador.',
    keyFeatures: ['Reverse Vesting de 48 meses com Cliff de 12 meses', 'Cessão Total de Direitos de Software e Código para a PJ', 'Lock-up de Quotas com Recompra Simbólica para Bad Leaver', 'Diferenciação Estrita de Good Leaver vs Bad Leaver'],
    riskLevel: 'Estratégico',
    targetProfile: 'Co-fundadores de startups em estágio pré-seed, seed ou bootstrap antes de receber investimento de anjos e aceleradoras.',
    defaultClauses: {
      vesting: true,
      nonCompete: true,
      callOption: true,
      deadlock: true,
      valuationMethod: 'balanco_determinacao',
    },
    generateFullDraft: ({ socioPF, herdeiros, nomeEmpresarial, cidade, ufEmpresa, dateFormatted }) => {
      let d = `ACORDO DE CO-FUNDADORES (FOUNDERS' AGREEMENT) COM REVERSE VESTING E CESSÃO DE IP\n`;
      d += `STARTUP: ${(nomeEmpresarial || 'TECH STARTUP').toUpperCase()} LTDA\n`;
      d += `FOUNDERS SIGNATÁRIOS:\n- Founder Técnico: ${socioPF.toUpperCase()}\n- Founder Negócios/Operações: ${herdeiros.toUpperCase()}\n\n`;
      d += `CLÁUSULA PRIMEIRA - DO REVERSE VESTING E CRONOGRAMA DE AQUISIÇÃO:\n`;
      d += `A totalidade das quotas detidas pelos Founders fica sujeita a Reverse Vesting pelo prazo de 48 (quarenta e oito) meses, com período de carência (Cliff) de 12 (doze) meses contados da fundação. Antes do Cliff, nenhuma quota é adquirida em definitivo.\n\n`;
      d += `CLÁUSULA SEGUNDA - DA RECOMPRA EM HIPÓTESE DE SAÍDA (BAD LEAVER VS GOOD LEAVER):\n`;
      d += `Em caso de saída justificada (Good Leaver), o Founder retém as quotas já vestidas e as não-vestidas são recompradas a valor patrimonial. Em caso de deslealdade, crime, abandono de projeto ou descumprimento do dever de dedicação exclusiva (Bad Leaver), a Sociedade terá a opção de recomprar 100% das quotas pelo valor nominal histórico de R$ 1,00.\n\n`;
      d += `CLÁUSULA TERCEIRA - DA CESSÃO IRREVOGÁVEL DE PROPRIEDADE INTELECTUAL:\n`;
      d += `Todo código-fonte, marca, patente, modelo de utilidade, algoritmo ou arquitetura desenvolvida pelos Founders pertence de pleno direito e com exclusividade à Sociedade, renunciando os signatários a qualquer direito moral incompatível ou royalty retroativo.\n\n`;
      d += `Comarca de ${cidade}/${ufEmpresa}, ${dateFormatted}.\n`;
      return d;
    }
  },

  {
    id: 'vesting_cliff',
    title: 'Contrato de Vesting com Cliff (Marco Legal LC 182/21)',
    category: 'governanca',
    categoryName: 'Governança & Founders',
    badge: 'MARCO LEGAL STARTUPS',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    description: 'Instrumento particular de outorga de opção de subscrição de participação societária gradual atrelada a metas operacionais e tempo de permanência de colaboradores-chave e executivos, com proteção contra encargos trabalhistas da CLT.',
    legalFramework: 'Arts. 2º e 4º da Lei Complementar nº 182/2021 (Marco Legal das Startups); Arts. 421 e 422 do CC.',
    jurisprudence: 'TRT e TST (validade do vesting como contrato de natureza estritamente mercantil e não salarial quando preenchidos os requisitos do Marco Legal).',
    keyFeatures: ['Período de Cliff de 12 Meses', 'Cronograma de Vesting Linear de 48 Meses', 'Aceleração de Vesting em Caso de Venda (Change of Control)', 'Proteção Trabalhista (Natureza Civil/Mercantil)'],
    riskLevel: 'Estratégico',
    targetProfile: 'Empresas em crescimento e startups que desejam engajar programadores seniores, diretores de produto e lideranças técnicas.',
    defaultClauses: {
      vesting: true,
      nonCompete: true,
      callOption: true,
      valuationMethod: 'balanco_determinacao',
    },
    generateFullDraft: ({ socioPF, herdeiros, nomeEmpresarial, cidade, ufEmpresa, dateFormatted }) => {
      let d = `CONTRATO DE VESTING DE PARTICIPAÇÃO SOCIETÁRIA (LEI COMPLEMENTAR Nº 182/2021)\n`;
      d += `OUTORGANTE: ${(nomeEmpresarial || 'EMPRESA INOVADORA').toUpperCase()} LTDA\n`;
      d += `ADMINISTRADOR: ${socioPF.toUpperCase()}\n`;
      d += `OUTORGADO BENEFICIÁRIO: ${herdeiros.toUpperCase()}\n\n`;
      d += `CLÁUSULA PRIMEIRA - DA OPÇÃO PROGRESSIVA E DO CLIFF:\n`;
      d += `A Outorgante concede ao Beneficiário a opção onerosa de aquisição de até 5,0% (cinco por cento) do capital social da sociedade, subordinada às seguintes condições cumulativas:\n`;
      d += `a) Carência (Cliff) ininterrupta de 12 (doze) meses contados da assinatura deste contrato, durante a qual nenhum percentual é adquirido;\n`;
      d += `b) Após o Cliff, aquisição linear à razão de 1/36 por mês trabalhado ao longo dos 36 meses subsequentes, até completar o prazo total de 48 meses.\n\n`;
      d += `CLÁUSULA SEGUNDA - DA NATUREZA JURÍDICA NÃO SALARIAL:\n`;
      d += `As partes declaram expressamente que este contrato possui natureza eminentemente mercantil, fundado na álea de investimento e na Lei Complementar nº 182/2021, não se confundindo com verba salarial, comissão ou gratificação contratual da CLT.\n\n`;
      d += `Comarca de ${cidade}/${ufEmpresa}, ${dateFormatted}.\n`;
      return d;
    }
  },

  {
    id: 'stock_option_plan',
    title: 'Plano de Stock Options (SOP) - Tema 1.226 STJ',
    category: 'governanca',
    categoryName: 'Governança & Founders',
    badge: 'STJ TEMA 1.226',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    description: 'Regulamento institucional de Stock Options estruturado em estrita conformidade com a tese fixada pelo Superior Tribunal de Justiça no Tema 1.226: comprovação de onerosidade, strike price e voluntariedade do outorgado, afastando IRPF na outorga e encargos do INSS.',
    legalFramework: 'Tema Repetitivo 1.226 do STJ (REsp 2.069.644/SP e REsp 2.074.564/SP); Lei nº 6.404/76 e Código Civil.',
    jurisprudence: 'STJ Tema 1.226 (Natureza jurídica mercantil do plano de stock options com incidência de IRPF sobre ganho de capital apenas na venda futura das ações).',
    keyFeatures: ['Conformidade Rigorosa com o Tema 1.226 do STJ', 'Preço de Exercício (Strike Price) com Risco Financeiro Real', 'Isenção de Contribuição Previdenciária Patronal (INSS 20%)', 'Retenção Estratégica de Executivos C-Level'],
    riskLevel: 'Estratégico',
    targetProfile: 'Médias e grandes empresas (LTDA ou S/A) que implantam programa de participação para diretores e conselheiros.',
    defaultClauses: {
      vesting: true,
      nonCompete: true,
      valuationMethod: 'balanco_determinacao',
    },
    generateFullDraft: ({ socioPF, herdeiros, nomeEmpresarial, cidade, ufEmpresa, dateFormatted }) => {
      let d = `REGULAMENTO GERAL DO PLANO DE OPÇÃO DE COMPRA DE PARTICIPAÇÃO SOCIETÁRIA (STOCK OPTION PLAN - SOP)\n`;
      d += `ESTRUTURADO EM CONFORMIDADE COM O TEMA REPETITIVO 1.226 DO SUPERIOR TRIBUNAL DE JUSTIÇA\n\n`;
      d += `EMPRESA OUTORGANTE: ${(nomeEmpresarial || 'CORPORAÇÃO BRASIL').toUpperCase()}\n`;
      d += `REPRESENTANTE LEGAL: ${socioPF.toUpperCase()}\n`;
      d += `BENEFICIÁRIO EXECUTIVO: ${herdeiros.toUpperCase()}\n\n`;
      d += `1. DA NATUREZA MERCANTIL E DA ONEROSIDADE (TEMA 1.226 STJ):\n`;
      d += `O plano caracteriza-se como contrato mercantil típico, dotado de voluntariedade e onerosidade, exigindo o efetivo desembolso financeiro pelo beneficiário para o exercício das opções (preço de exercício pré-determinado), inexistindo qualquer gratuidade ou subsídio salarial direto.\n\n`;
      d += `2. DO REGIME TRIBUTÁRIO APLICÁVEL:\n`;
      d += `Em virtude da natureza civil/comercial, não incide imposto sobre a renda no momento da outorga ou no momento do exercício das opções. O ganho auferido pelo beneficiário estará sujeito ao IRPF exclusivamente na futura alienação das participações a terceiros, sob a sistemática de ganho de capital.\n\n`;
      d += `Comarca de ${cidade}/${ufEmpresa}, ${dateFormatted}.\n`;
      return d;
    }
  },

  {
    id: 'mutuo_conversivel',
    title: 'Mútuo Conversível em Participação (SAFE / KISS)',
    category: 'governanca',
    categoryName: 'Governança & Founders',
    badge: 'INVESTIMENTO & SEED',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    description: 'Contrato de mútuo financeiro com cláusula de conversão opcional em quotas sociais da empresa por ocasião de futura rodada de investimento qualificada (Qualified Financing), com gatilhos de valuation cap e taxa de desconto (Discount Rate).',
    legalFramework: 'Arts. 586 a 592 do Código Civil; Lei Complementar nº 182/2021 (Marco Legal das Startups).',
    jurisprudence: 'STJ e CVM (Segurança jurídica do investidor anjo que não responde por dívidas da empresa antes da formal conversão).',
    keyFeatures: ['Isolamento Total do Investidor contra Riscos Trabalhistas/Fiscais', 'Conversão Automática em Próxima Rodada com Valuation Cap', 'Desconto Pré-Fixado para o Investidor Inicial (15% a 25%)', 'Dispensa de Alteração Imediata na Junta Comercial'],
    riskLevel: 'Estratégico',
    targetProfile: 'Investidores-anjo, grupos de seed capital e fundadores que precisam de caixa rápido sem negociar valuation antecipado.',
    defaultClauses: {
      autonomiaPatrimonial: true,
      tagAlong: true,
      valuationMethod: 'balanco_determinacao',
    },
    generateFullDraft: ({ socioPF, herdeiros, nomeEmpresarial, cidade, ufEmpresa, dateFormatted }) => {
      let d = `INSTRUMENTO PARTICULAR DE MÚTUO CONVERSÍVEL EM PARTICIPAÇÃO SOCIETÁRIA (SAFE)\n`;
      d += `SOCIEDADE MUTUÁRIA: ${(nomeEmpresarial || 'INNOVAÇÃO TECNOLÓGICA').toUpperCase()} LTDA\n`;
      d += `SÓCIO GESTOR: ${socioPF.toUpperCase()}\n`;
      d += `INVESTIDOR MUTUANTE: ${herdeiros.toUpperCase()}\n\n`;
      d += `CLÁUSULA PRIMEIRA - DO APORTE FINANCEIRO E DA CONVERSÃO:\n`;
      d += `O Investidor concede à Sociedade mútuo financeiro com a finalidade exclusiva de fomento e desenvolvimento de produtos, assistindo-lhe o direito potestativo de converter o crédito em quotas do capital social por ocasião de evento qualificado de liquidez ou nova rodada de captação.\n\n`;
      d += `CLÁUSULA SEGUNDA - DA ISENÇÃO DE RESPONSABILIDADE DO INVESTIDOR (LC 182/2021):\n`;
      d += `Enquanto não convertida a dívida em quotas sociais, o Investidor não é sócio da empresa, não possui direito a voto e não responde por qualquer dívida fiscal, trabalhista, civil ou falimentar da Mutuária, sob qualquer pretexto (Art. 61-A da LC 123/06 c/c LC 182/21).\n\n`;
      d += `Comarca de ${cidade}/${ufEmpresa}, ${dateFormatted}.\n`;
      return d;
    }
  },

  {
    id: 'protocolo_familiar',
    title: 'Protocolo Familiar & Conselho de Família',
    category: 'governanca',
    categoryName: 'Governança & Founders',
    badge: 'GOVERNANÇA & HERDEIROS',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    description: 'Código de governança e regramento moral e patrimonial entre gerações: estabelece critérios objetivos para contratação de herdeiros na empresa (formação mínima, idiomas, experiência de mercado externa), remuneração e mediação de conflitos.',
    legalFramework: 'Arts. 421 e 422 do Código Civil; Melhores Práticas do IBGC (Instituto Brasileiro de Governança Corporativa).',
    jurisprudence: 'Validade e eficácia de protocolos familiares como contratos atípicos vinculantes entre herdeiros signatários.',
    keyFeatures: ['Regras Claras para Emprego de Filhos e Cônjuges na Empresa', 'Criação do Conselho de Família com Reuniões Trimestrais', 'Cláusula de Mediação Prévia Obrigatória antes de Judiciário', 'Preservação da Harmonia e Perpetuidade dos Negócios'],
    riskLevel: 'Foco Sucessório',
    targetProfile: 'Empresas familiares a partir da 2ª geração (irmãos e primos) para evitar desavenças familiares no ambiente de negócios.',
    defaultClauses: {
      conselhoConsultivo: true,
      nonCompete: true,
      valuationMethod: 'balanco_determinacao',
    },
    generateFullDraft: ({ socioPF, herdeiros, nomeEmpresarial, cidade, ufEmpresa, dateFormatted }) => {
      let d = `PROTOCOLO FAMILIAR DE GOVERNANÇA CORPORATIVA E SUCESSÃO DA FAMÍLIA EMPRESÁRIA\n`;
      d += `EMPRESA CONTROLADA: ${(nomeEmpresarial || 'GRUPO EMPRESARIAL FAMILIAR').toUpperCase()}\n`;
      d += `PATRIARCA / LÍDER FAMILIAR: ${socioPF.toUpperCase()}\n`;
      d += `HERDEIROS E SUCESSORES SIGNATÁRIOS: ${herdeiros.toUpperCase()}\n\n`;
      d += `1. REQUISITOS PARA OCUPAÇÃO DE CARGOS EXECUTIVOS POR FAMILIARES:\n`;
      d += `Nenhum membro da família de 2ª ou 3ª geração poderá assumir função executiva na Sociedade sem: a) Diploma superior em instituição reconhecida; b) Fluência em 2º idioma; c) Comprovação de no mínimo 3 (três) anos de experiência profissional bem-sucedida em empresa terceira de grande porte não coligada.\n\n`;
      d += `2. DA INSTITUIÇÃO DO CONSELHO DE FAMÍLIA:\n`;
      d += `Fica instituído o Conselho de Família, órgão consultivo que se reunirá ordinariamente a cada trimestre para deliberar sobre filantropia, formação da próxima geração, patrimônio comum e mediação confidencial de desavenças, com total vedação de interferência na Diretoria Executiva profissional.\n\n`;
      d += `Comarca de ${cidade}/${ufEmpresa}, ${dateFormatted}.\n`;
      return d;
    }
  }
];
