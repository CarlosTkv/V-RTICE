import { StructuringModelItem } from './types';

export const DISSOLUCAO_MODELS: StructuringModelItem[] = [
  {
    id: 'retirada_socio',
    title: 'Notificação e Exercício de Direito de Retirada (Art. 1.029 CC)',
    category: 'dissolucao',
    categoryName: 'Saída de Sócios & Dissolução',
    badge: 'DIREITO DE RETIRADA',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    description: 'Comunicação formal extrajudicial do sócio que decide deixar a sociedade por prazo indeterminado mediante prévia notificação com antecedência mínima de 60 (sessenta) dias, fixando a data-base para apuração de haveres.',
    legalFramework: 'Art. 1.029 do Código Civil Brasileiro; Art. 600 do Código de Processo Civil (CPC).',
    jurisprudence: 'STJ Tema Repetitivo 1.057 (A data de resolução da sociedade em relação ao sócio retirante coincide com o 60º dia após a notificação).',
    keyFeatures: ['Direito Potestativo Imotivado em Sociedades por Prazo Indeterminado', 'Aviso Prévio Obrigatório de 60 Dias (Art. 1.029 CC)', 'Fixação Precisa da Data-Base Contábil', 'Cessação da Responsabilidade por Obrigações Futuras'],
    riskLevel: 'Estratégico',
    targetProfile: 'Sócios minoritários ou dissidentes que decidem se desligar da empresa amigavelmente ou por discordância de gestão.',
    defaultClauses: {
      valuationMethod: 'balanco_determinacao',
    },
    generateFullDraft: ({ socioPF, herdeiros, nomeEmpresarial, cidade, ufEmpresa, dateFormatted }) => {
      let d = `NOTIFICAÇÃO EXTRAJUDICIAL DE EXERCÍCIO DO DIREITO DE RETIRADA / RECESSO SOCIETÁRIO\n`;
      d += `COM FUNDAMENTO NO ARTIGO 1.029 DO CÓDIGO CIVIL E TEMA 1.057 DO SUPERIOR TRIBUNAL DE JUSTIÇA\n\n`;
      d += `NOTIFICANTE (SÓCIO RETIRANTE): ${socioPF.toUpperCase()}\n`;
      d += `NOTIFICADA (SOCIEDADE): ${(nomeEmpresarial || 'EMPRESA COMERCIAL').toUpperCase()} LTDA (Aos cuidados de: ${herdeiros.toUpperCase()})\n\n`;
      d += `1. DO EXERCÍCIO POTESTATIVO DO DIREITO DE RETIRADA:\n`;
      d += `Por meio desta, o Notificante comunica formal e irrevogavelmente a sua retirada da Sociedade, com base no Artigo 1.029 do Código Civil, produzindo efeitos resolutivos ao término do prazo improrrogável de 60 (sessenta) dias contados do recebimento desta notificação.\n\n`;
      d += `2. DA DATA-BASE PARA APURAÇÃO DE HAVERES (ART. 600, IV DO CPC):\n`;
      d += `A data-base para o levantamento do Balanço Especial de Determinação corresponderá exatamente ao sexagésimo dia subsequente à recepção desta, momento em que cessará a responsabilidade do Notificante perante novas obrigações contraídas pela Sociedade.\n\n`;
      d += `3. DO PEDIDO DE APRESENTAÇÃO DE BALANÇO E CRONOGRAMA DE PAGAMENTO:\n`;
      d += `Requer-se a realização imediata do inventário patrimonial e contábil a valor de saída para formalização da liquidação de seus haveres na forma estipulada no Contrato Social.\n\n`;
      d += `Comarca de ${cidade}/${ufEmpresa}, ${dateFormatted}.\n\n`;
      d += `_____________________________________________________\n${socioPF.toUpperCase()} (Sócio Retirante)\n`;
      return d;
    }
  },

  {
    id: 'exclusao_justa_causa',
    title: 'Exclusão Extrajudicial de Sócio por Justa Causa (Art. 1.085 CC)',
    category: 'dissolucao',
    categoryName: 'Saída de Sócios & Dissolução',
    badge: 'FALTA GRAVE & EXCLUSÃO',
    badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
    description: 'Procedimento societário rigoroso de exclusão de sócio minoritário que comete falta grave pondo em risco a continuidade da empresa: convocação de assembleia específica com direito a ampla defesa e averbação na Junta Comercial.',
    legalFramework: 'Art. 1.085 e parágrafo único do Código Civil; Art. 5º, LV da Constituição Federal (Contraditório).',
    jurisprudence: 'STJ REsp 1.637.284/RJ (nulidade de exclusão extrajudicial sem convocação específica detalhando os fatos e sem prazo razoável de defesa).',
    keyFeatures: ['Exigência de Previsão Expressa no Contrato Social', 'Aprovação por Sócios Representantes de mais da Metade do Capital', 'Convocação Específica com Discriminação da Falta Grave', 'Garantia do Direito Constitucional de Ampla Defesa'],
    riskLevel: 'Alta Complexidade',
    targetProfile: 'Sociedades que enfrentam desvios graves de conduta, concorrência desleal ou atos criminosos cometidos por sócio minoritário.',
    defaultClauses: {
      valuationMethod: 'balanco_determinacao',
    },
    generateFullDraft: ({ socioPF, herdeiros, nomeEmpresarial, cidade, ufEmpresa, dateFormatted }) => {
      let d = `ATA DE REUNIÃO EXTRAORDINÁRIA DE SÓCIOS - EXCLUSÃO DE SÓCIO POR FALTA GRAVE (ART. 1.085 DO CC)\n`;
      d += `SOCIEDADE: ${(nomeEmpresarial || 'SOCIEDADE EMPRESÁRIA').toUpperCase()} LTDA\n`;
      d += `SÓCIOS MAJORITÁRIOS PRESENTES: ${socioPF.toUpperCase()}\n`;
      d += `SÓCIO NOTIFICADO EXCLUÍNDO: ${herdeiros.toUpperCase()}\n\n`;
      d += `1. DA CONVOCAÇÃO ESPECÍFICA E DO CONTRADITÓRIO:\n`;
      d += `Verifica-se a regularidade da notificação prévia expedida ao sócio com antecedência legal, facultando-lhe prazo de 10 dias para apresentação de defesa prévia escrita e sustentação oral perante o conclave de sócios.\n\n`;
      d += `2. DA CONFIGURAÇÃO DA FALTA GRAVE (JUSTA CAUSA):\n`;
      d += `Restou cabalmente demonstrado, mediante provas documentais anexas, que o sócio praticou ato de inegável gravidade ao constituir empresa concorrente e desviar clientela e faturamento da sociedade, quebrando de forma insanável o dever fiduciário de lealdade societária.\n\n`;
      d += `3. DA DELIBERAÇÃO DE EXCLUSÃO E APURAÇÃO DE HAVERES:\n`;
      d += `Os sócios titulares de mais de 75% do capital social aprovam a imediata exclusão do sócio, determinando a apuração de seus haveres por Balanço de Determinação, compensando-se eventuais perdas e danos causados à Sociedade.\n\n`;
      d += `Comarca de ${cidade}/${ufEmpresa}, ${dateFormatted}.\n`;
      return d;
    }
  },

  {
    id: 'apuracao_haveres_balanco',
    title: 'Apuração de Haveres por Balanço de Determinação (REsp 1.877.331/SP)',
    category: 'dissolucao',
    categoryName: 'Saída de Sócios & Dissolução',
    badge: 'STJ REsp 1.877.331/SP',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    description: 'Termo de apuração e liquidação de haveres do sócio retirante ou falecido em estrito cumprimento ao REsp 1.877.331/SP do STJ e Art. 1.031 do CC: apuração dos ativos tangíveis e intangíveis a valor de liquidação, excluindo fluxo de caixa descontado futuro.',
    legalFramework: 'Art. 1.031 do Código Civil; Arts. 600 a 609 do CPC; Acórdão do STJ no REsp 1.877.331/SP.',
    jurisprudence: 'STJ REsp 1.877.331/SP (Na dissolução parcial de sociedade limitada, a apuração de haveres deve adotar o balanço de determinação a valor patrimonial real, sendo vedado o fluxo de caixa descontado).',
    keyFeatures: ['Critério Legal Vinculante do Balanço de Determinação', 'Avaliação Pericial dos Ativos a Preço de Venda Real', 'Exclusão Expressa de Lucros Futuros (DCF/Goodwill especulativo)', 'Cronograma de Pagamento Parcelado em até 24 ou 36 meses'],
    riskLevel: 'Estratégico',
    targetProfile: 'Sociedades que precisam pagar sócios retirantes ou herdeiros sem sufocar o fluxo de caixa da empresa com valuations irreais.',
    defaultClauses: {
      valuationMethod: 'balanco_determinacao',
    },
    generateFullDraft: ({ socioPF, herdeiros, nomeEmpresarial, cidade, ufEmpresa, dateFormatted }) => {
      let d = `TERMO DE TRANSAÇÃO E APURAÇÃO DEFINITIVA DE HAVERES SOCIETÁRIOS\n`;
      d += `ESTRUTURADO EM CONFORMIDADE COM O RESP 1.877.331/SP DO SUPERIOR TRIBUNAL DE JUSTIÇA E ART. 1.031 DO CC\n\n`;
      d += `SOCIEDADE: ${(nomeEmpresarial || 'EMPRESA INDÚSTRIA').toUpperCase()} LTDA\n`;
      d += `SÓCIO RETIRANTE / EX-SÓCIO: ${socioPF.toUpperCase()}\n`;
      d += `SÓCIOS REMANESCENTES: ${herdeiros.toUpperCase()}\n\n`;
      d += `1. DO CRITÉRIO METODOLÓGICO DE AVALIAÇÃO:\n`;
      d += `A liquidação das quotas societárias dá-se obrigatoriamente através de BALANÇO DE DETERMINAÇÃO especial, que simula a realização de todos os ativos tangíveis e a quitação integral dos passivos na data da resolução, descartando qualquer cálculo por fluxo de caixa descontado, nos termos da jurisprudência do STJ.\n\n`;
      d += `2. DO VALOR LIQUIDADO E FORMA DE PAGAMENTO:\n`;
      d += `O montante líquido apurado no laudo pericial contábil de consenso será pago pela Sociedade em 24 (vinte e quatro) parcelas mensais e consecutivas, vencendo a primeira após carência de 90 dias, corrigidas monetariamente pelo IPCA.\n\n`;
      d += `3. DA QUITAÇÃO GERAL E IRRETRATÁVEL:\n`;
      d += `Com a assinatura deste termo e o cumprimento do cronograma, o sócio retirante confere plena, rasa, geral e irretratável quitação de todas as relações societárias passadas.\n\n`;
      d += `Comarca de ${cidade}/${ufEmpresa}, ${dateFormatted}.\n`;
      return d;
    }
  },

  {
    id: 'distrato_dissolucao_total',
    title: 'Distrato Social de Dissolução e Liquidação Total (Art. 1.033 CC)',
    category: 'dissolucao',
    categoryName: 'Saída de Sócios & Dissolução',
    badge: 'ENCERRAMENTO DE CNPJ',
    badgeColor: 'bg-slate-700/40 text-slate-300 border-slate-600',
    description: 'Instrumento particular de distrato social encerrando definitivamente as atividades da empresa: apuração de balanço de liquidação, partilha do saldo remanescente entre os sócios, nomeação do liquidante e baixa do CNPJ.',
    legalFramework: 'Arts. 1.033 a 1.035 e Arts. 1.102 a 1.112 do Código Civil; IN DREI 81/2020.',
    jurisprudence: 'Procedimento regular de baixa registral perante a Junta Comercial e extinção de deveres sociais.',
    keyFeatures: ['Encerramento Legal e Baixa Definitiva do CNPJ', 'Indicação do Guarda-Livros e Arquivos Fiscais por 5 Anos', 'Partilha de Ativos Finais entre os Sócios', 'Quitação Plena entre os Sócios e Perante a PJ'],
    riskLevel: 'Estratégico',
    targetProfile: 'Sócios que decidiram de comum acordo fechar a empresa sem deixar pendências cadastrais ou débitos não identificados.',
    defaultClauses: {
      valuationMethod: 'valor_patrimonial_contabil',
    },
    generateFullDraft: ({ socioPF, herdeiros, nomeEmpresarial, cidade, ufEmpresa, dateFormatted }) => {
      let d = `DISTRATO SOCIAL DE DISSOLUÇÃO TOTAL E LIQUIDAÇÃO DE SOCIEDADE LIMITADA\n`;
      d += `SOCIEDADE DISSOLVIDA: ${(nomeEmpresarial || 'COMÉRCIO ENCERRADO').toUpperCase()} LTDA\n`;
      d += `SÓCIOS LIQUIDANTES: ${socioPF.toUpperCase()} e ${herdeiros.toUpperCase()}\n\n`;
      d += `1. DA DISSOLUÇÃO POR CONSENSO UNÂNIME (ART. 1.033, II DO CÓDIGO CIVIL):\n`;
      d += `Os sócios declaram de pleno e comum acordo dissolvida a sociedade retro indicada, cessando todas as operações comerciais e ativas a partir desta data.\n\n`;
      d += `2. DO BALANÇO FINAL DE LIQUIDAÇÃO E PARTILHA DO ACERVO:\n`;
      d += `Realizados todos os haveres e pagos integralmente todos os credores sociais, o saldo líquido remanescente em caixa é partilhado entre os sócios na exata proporção de suas quotas de capital social.\n\n`;
      d += `3. DA GUARDA DOS LIVROS E DOCUMENTOS FISCAIS:\n`;
      d += `A guarda dos livros fiscais, comerciais e registros societários pelo prazo legal de 5 (cinco) anos fica sob a responsabilidade de ${socioPF.toUpperCase()}.\n\n`;
      d += `Comarca de ${cidade}/${ufEmpresa}, ${dateFormatted}.\n`;
      return d;
    }
  },

  {
    id: 'termo_transacao_conflito',
    title: 'Termo de Transação e Quitação Ampla de Conflito Societário',
    category: 'dissolucao',
    categoryName: 'Saída de Sócios & Dissolução',
    badge: 'PREVENÇÃO DE LITÍGIO',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    description: 'Acordo extrajudicial com eficácia de título executivo extrajudicial (Art. 784, IV do CPC) pondo fim a divergências entre sócios fundadores e investidores, estipulando renúncia mútua a ações judiciais, cláusula penal e confidencialidade estrita.',
    legalFramework: 'Arts. 840 a 850 do Código Civil; Art. 784, IV do Código de Processo Civil (CPC).',
    jurisprudence: 'STJ REsp 1.769.967/SP (validade de transação ampla e irretratável entre sócios impedindo posterior ação anulatória sem prova cabal de coação).',
    keyFeatures: ['Eficácia de Título Executivo Extrajudicial', 'Extinção de Processos Judiciais e Procedimentos Arbitrais', 'Cláusula Penal Indenizatória Severa por Violação', 'Confidencialidade Absoluta e Non-Disparagement (Não Degradação)'],
    riskLevel: 'Estratégico',
    targetProfile: 'Sócios em disputa societária acirrada que chegam a um acordo de cavalheiros para evitar anos de processo judicial desgastante.',
    defaultClauses: {
      nonCompete: true,
      valuationMethod: 'balanco_determinacao',
    },
    generateFullDraft: ({ socioPF, herdeiros, nomeEmpresarial, cidade, ufEmpresa, dateFormatted }) => {
      let d = `INSTRUMENTO PARTICULAR DE TRANSAÇÃO, COMPOSIÇÃO AMIGÁVEL E QUITAÇÃO RECÍPROCA\n`;
      d += `COM FORÇA DE TÍTULO EXECUTIVO EXTRAJUDICIAL (ART. 840 DO CÓDIGO CIVIL C/C ART. 784, IV DO CPC)\n\n`;
      d += `PRIMEIRO TRANSIGENTE: ${socioPF.toUpperCase()}\n`;
      d += `SEGUNDO TRANSIGENTE: ${herdeiros.toUpperCase()}\n`;
      d += `SOCIEDADE INTERVENIENTE: ${(nomeEmpresarial || 'CORPORAÇÃO EM CONFLITO').toUpperCase()} LTDA\n\n`;
      d += `1. DO OBJETO DA TRANSAÇÃO:\n`;
      d += `As Partes, visando extinguir em caráter definitivo quaisquer controvérsias existentes quanto à administração, contabilidade, faturamento e participação nos resultados da Sociedade, resolvem transigir mediante concessões mútuas.\n\n`;
      d += `2. DA EXTINÇÃO DE PROCESSOS E RENÚNCIA A PRETENSÕES:\n`;
      d += `As partes requerem a homologação judicial da extinção com resolução de mérito (Art. 487, III, 'b' do CPC) de todas as medidas judiciais pendentes, renunciando de forma definitiva ao direito sobre o qual se fundavam.\n\n`;
      d += `3. DA CLÁUSULA DE NÃO DIFAMAÇÃO (NON-DISPARAGEMENT) E CONFIDENCIALIDADE:\n`;
      d += `As partes obrigam-se a manter absoluto sigilo sobre os termos desta avença e a abster-se de tecer qualquer declaração ofensiva ou difamatória contra a honra, reputação ou imagem da contraparte perante clientes, fornecedores ou redes sociais, sob pena de multa não compensatória imediata.\n\n`;
      d += `Comarca de ${cidade}/${ufEmpresa}, ${dateFormatted}.\n`;
      return d;
    }
  }
];
