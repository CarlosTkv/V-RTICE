import { StructuringModelItem } from './types';

export const ESPECIAIS_MODELS: StructuringModelItem[] = [
  {
    id: 'doacao_gravames_usufruto',
    title: 'Doação de Quotas com Reserva de Usufruto & Gravames (Art. 1.911 CC)',
    category: 'especiais',
    categoryName: 'Sucessão & Especiais',
    badge: 'SUCESSÃO EM VIDA',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    description: 'Doação pura de quotas societárias aos herdeiros com adiantamento da legítima, gravadas com as 4 cláusulas pétreas restritivas (inalienabilidade, incomunicabilidade, impenhorabilidade e reversão por premoriência) e usufruto vitalício integral de voto e dividendos.',
    legalFramework: 'Arts. 544, 547, 1.390 a 1.411, 1.668, I e 1.911 do Código Civil Brasileiro.',
    jurisprudence: 'STJ REsp 1.758.123/SP (plena validade das cláusulas restritivas em doações societárias, operando a blindagem imediata perante credores dos donatários).',
    keyFeatures: ['Adiantamento de Legítima com Dispensa de Colação Futura', 'Usufruto Vitalício de Voto e Dividendos para o Patriarca', 'Incomunicabilidade Total perante Genros e Noras', 'Reversão Automática em Caso de Falecimento Pretérito do Filho'],
    riskLevel: 'Máxima Blindagem',
    targetProfile: 'Patriarcas e matriarcas com patrimônio societário relevante que pretendem transferir a nua-propriedade mantendo o leme dos negócios.',
    defaultClauses: {
      inalienabilidade: true,
      impenhorabilidade: true,
      incomunicabilidade: true,
      usufruto: true,
      reversao: true,
      autonomiaPatrimonial: true,
      valuationMethod: 'balanco_determinacao',
    },
    generateFullDraft: ({ socioPF, herdeiros, ativos, nomeEmpresarial, cidade, ufEmpresa, dateFormatted, clauses }) => {
      let d = `INSTRUMENTO PARTICULAR DE DOAÇÃO DE QUOTAS SOCIAIS COM RESERVA DE USUFRUTO E GRAVAMES RESTRITIVOS\n`;
      d += `SOCIEDADE: ${(nomeEmpresarial || 'HOLDING E PARTICIPAÇÕES').toUpperCase()} LTDA\n\n`;
      d += `DOADOR INSTITUIDOR: ${socioPF.toUpperCase()}, brasileiro, casado, empresário, CPF ***.***.***-**;\n`;
      d += `DONATÁRIOS HERDEIROS: ${herdeiros.toUpperCase()};\n`;
      d += `QUOTAS DOADAS OBJETO DESTE ATO: ${ativos.toUpperCase()}\n\n`;
      d += `CLÁUSULA PRIMEIRA - DA DOAÇÃO EM ADIANTAMENTO DE LEGÍTIMA (ART. 544 DO CÓDIGO CIVIL):\n`;
      d += `O Doador transfere gratuitamente aos Donatários, em adiantamento de suas legítimas hereditárias, as quotas sociais de sua titularidade, que aceitam a doação com formal agradecimento e submissão aos gravames desta escritura.\n\n`;
      if (clauses.usufruto) {
        d += `CLÁUSULA SEGUNDA - DA RESERVA DE USUFRUTO VITALÍCIO (ARTS. 1.390 A 1.411 DO CC):\n`;
        d += `O Doador reserva para si o usufruto vitalício, sucessivo e exclusivo sobre a totalidade das quotas doadas, conservando de forma privativa e irretratável: I - O direito de voto irrestrito em assembleias e deliberações sociais; II - A titularidade sobre 100% dos dividendos, lucros acumulados e juros sobre capital próprio (JCP).\n\n`;
      }
      if (clauses.inalienabilidade || clauses.impenhorabilidade || clauses.incomunicabilidade) {
        d += `CLÁUSULA TERCEIRA - DOS GRAVAMES RESTRITIVOS ABSOLUTOS (ART. 1.911 DO CÓDIGO CIVIL):\n`;
        d += `As quotas doadas são gravadas em caráter perpétuo com as cláusulas restritivas de INALIENABILIDADE, IMPENHORABILIDADE e INCOMUNICABILIDADE, não respondendo por dívidas futuras dos donatários e não se comunicando em hipótese alguma com seus cônjuges ou companheiros (Art. 1.668, I do CC).\n\n`;
      }
      if (clauses.reversao) {
        d += `CLÁUSULA QUARTA - DA CLÁUSULA DE REVERSÃO POR PREMORIÊNCIA (ART. 547 DO CÓDIGO CIVIL):\n`;
        d += `Se qualquer Donatário vier a falecer antes do Doador, as respectivas quotas sociais reverterão de pleno direito à titularidade privativa do Doador, sem passar pelo inventário do herdeiro pré-morto.\n\n`;
      }
      d += `Comarca de ${cidade}/${ufEmpresa}, ${dateFormatted}.\n\n`;
      d += `_____________________________________________________\n${socioPF.toUpperCase()} (Doador Usufrutuário)\n`;
      return d;
    }
  },

  {
    id: 'cessao_direitos_hereditarios',
    title: 'Cessão de Direitos Hereditários & Meação Societária (Art. 1.793 CC)',
    category: 'especiais',
    categoryName: 'Sucessão & Especiais',
    badge: 'SUCESSÃO & INVENTÁRIO',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    description: 'Instrumento de transferência de quinhão hereditário ou meação decorrente de inventário ou partilha, transferindo a titularidade de quotas societárias do espólio para um co-herdeiro ou sócio remanescente antes da conclusão do inventário.',
    legalFramework: 'Arts. 1.793 a 1.795 do Código Civil Brasileiro; Arts. 610 a 673 do CPC.',
    jurisprudence: 'STJ REsp 1.808.767/RJ (eficácia de cessão de quinhão hereditário formalizada mediante escritura pública ou termo nos autos).',
    keyFeatures: ['Transferência de Participação sem Esperar Fim do Inventário', 'Direito de Preferência Assegurado aos Co-Herdeiros', 'Regularização Imediata da Gestão da Empresa', 'Quitação Hereditária Específica'],
    riskLevel: 'Foco Sucessório',
    targetProfile: 'Herdeiros e inventariantes que necessitam transferir as quotas do falecido para o filho que já opera a empresa.',
    defaultClauses: {
      valuationMethod: 'balanco_determinacao',
    },
    generateFullDraft: ({ socioPF, herdeiros, nomeEmpresarial, cidade, ufEmpresa, dateFormatted }) => {
      let d = `INSTRUMENTO DE CESSÃO E TRANSFERÊNCIA DE DIREITOS HEREDITÁRIOS SOBRE QUOTAS SOCIAIS\n`;
      d += `COM FUNDAMENTO NO ARTIGO 1.793 DO CÓDIGO CIVIL BRASILEIRO\n\n`;
      d += `CEDENTE (HERDEIRO / CÔNJUGE MEEIRO): ${socioPF.toUpperCase()}\n`;
      d += `CESSIONÁRIO (HERDEIRO ADQUIRENTE / CO-HERDEIRO): ${herdeiros.toUpperCase()}\n`;
      d += `SOCIEDADE OBJETO DA PARTICIPAÇÃO: ${(nomeEmpresarial || 'EMPRESA FAMILIAR').toUpperCase()} LTDA\n\n`;
      d += `1. DO OBJETO DA CESSÃO HEREDITÁRIA:\n`;
      d += `O Cedente cede e transfere ao Cessionário a totalidade de seus direitos hereditários incidentes sobre as quotas sociais da Sociedade retro qualificada, pertencentes ao acervo deixado pelo autor da herança nos autos do processo de inventário em curso.\n\n`;
      d += `2. DO VALOR DA CESSÃO E QUITAÇÃO:\n`;
      d += `A presente cessão é outorgada pelo valor pactuado e devidamente quitado, comprometendo-se os demais herdeiros que renunciaram à preferência do Artigo 1.794 do CC a ratificar a partilha respectiva.\n\n`;
      d += `Comarca de ${cidade}/${ufEmpresa}, ${dateFormatted}.\n`;
      return d;
    }
  },

  {
    id: 'cessao_onerosa_quotas',
    title: 'Cessão e Transferência Onerosa de Quotas com Preferência',
    category: 'especiais',
    categoryName: 'Sucessão & Especiais',
    badge: 'TRANSFERÊNCIA ORDINÁRIA',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    description: 'Alteração contratual típica e indispensável de cessão de quotas entre sócios ou para terceiro, com atestado de desinteresse dos outros quotistas, alteração do quadro social na Junta Comercial e quitação financeira mútua.',
    legalFramework: 'Arts. 1.003 e 1.057 do Código Civil Brasileiro; IN DREI nº 81/2020.',
    jurisprudence: 'STJ REsp 1.537.996/SP (responsabilidade do sócio cedente por obrigações sociais pelo prazo de 2 anos após o registro da cessão na Junta).',
    keyFeatures: ['Cumprimento do Direito de Preferência Contratual', 'Prazo de Responsabilidade Solidária de 2 Anos (Art. 1.003 CC)', 'Quitação Financeira e Regularização Cadastral', 'Minuta Pronta para Registro na Junta Comercial'],
    riskLevel: 'Estratégico',
    targetProfile: 'Qualquer sociedade que esteja admitindo um novo investidor ou efetuando redistribuição amigável de quotas entre sócios.',
    defaultClauses: {
      prefRoute: true,
      valuationMethod: 'balanco_determinacao',
    },
    generateFullDraft: ({ socioPF, herdeiros, ativos, nomeEmpresarial, cidade, ufEmpresa, dateFormatted }) => {
      let d = `INSTRUMENTO PARTICULAR DE ALTERAÇÃO CONTRATUAL - CESSÃO E TRANSFERÊNCIA ONEROSA DE QUOTAS\n`;
      d += `SOCIEDADE: ${(nomeEmpresarial || 'COMÉRCIO E SERVIÇOS').toUpperCase()} LTDA\n`;
      d += `SÓCIO CEDENTE: ${socioPF.toUpperCase()}\n`;
      d += `CESSIONÁRIO ADQUIRENTE: ${herdeiros.toUpperCase()}\n`;
      d += `QUOTAS OBJETO DA TRANSAÇÃO: ${ativos.toUpperCase()}\n\n`;
      d += `CLÁUSULA PRIMEIRA - DA CESSÃO E TRANSFERÊNCIA DE QUOTAS:\n`;
      d += `O Cedente, legítimo titular das quotas sociais acima descritas, inteiramente subscritas e integralizadas, cede e transfere as mesmas ao Cessionário, pelo preço certo e ajustado, dando plena e irrevogável quitação do valor recebido.\n\n`;
      d += `CLÁUSULA SEGUNDA - DA RESPONSABILIDADE SUBSIDIÁRIA BIENAL (ART. 1.003 DO CÓDIGO CIVIL):\n`;
      d += `As partes registram que, nos termos do parágrafo único do Artigo 1.003 do Código Civil, o Cedente responde solidariamente com o Cessionário perante a sociedade e terceiros pelas obrigações que tinha como sócio até o período de 2 (dois) anos após a averbação desta alteração na Junta Comercial.\n\n`;
      d += `Comarca de ${cidade}/${ufEmpresa}, ${dateFormatted}.\n`;
      return d;
    }
  },

  {
    id: 'sociedade_conta_participacao',
    title: 'Constituição de Sociedade em Conta de Participação (SCP)',
    category: 'especiais',
    categoryName: 'Sucessão & Especiais',
    badge: 'INVESTIDOR ANÔNIMO / SCP',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    description: 'Veículo societário desprovido de personalidade jurídica para captação de recursos com investidores que desejam permanecer anônimos perante terceiros (Sócios Participantes/Ocultos), operando sob a responsabilidade exclusiva do Sócio Ostensivo.',
    legalFramework: 'Arts. 991 a 996 do Código Civil Brasileiro; Instrução Normativa RFB nº 2.119/2022 (CNPJ de SCP).',
    jurisprudence: 'STJ REsp 1.865.044/SP (o sócio participante responde apenas perante o sócio ostensivo e nunca perante credores da atividade).',
    keyFeatures: ['Anonimato Garantido aos Sócios Investidores perante Terceiros', 'Sócio Ostensivo Responde Exclusivamente pelas Obrigações', 'Não Sujeita a Registro em Junta Comercial (Art. 992 CC)', 'Distribuição Isenta de Lucros aos Investidores'],
    riskLevel: 'Estratégico',
    targetProfile: 'Lançamento de empreendimentos imobiliários, incorporações, produções agrícolas ou fundos privados de investimento.',
    defaultClauses: {
      autonomiaPatrimonial: true,
      valuationMethod: 'balanco_determinacao',
    },
    generateFullDraft: ({ socioPF, herdeiros, ativos, nomeEmpresarial, cidade, ufEmpresa, dateFormatted }) => {
      let d = `CONTRATO SOCIAL DE CONSTITUIÇÃO DE SOCIEDADE EM CONTA DE PARTICIPAÇÃO (SCP)\n`;
      d += `COM BASE NOS ARTIGOS 991 A 996 DO CÓDIGO CIVIL BRASILEIRO\n\n`;
      d += `SÓCIO OSTENSIVO (EMPREENDEDOR): ${(nomeEmpresarial || 'INCORPORADORA GESTORA').toUpperCase()} LTDA (Rep: ${socioPF.toUpperCase()})\n`;
      d += `SÓCIOS PARTICIPANTES / OCULTOS (INVESTIDORES): ${herdeiros.toUpperCase()}\n`;
      d += `EMPREENDIMENTO OBJETO DA CONTA DE PARTICIPAÇÃO: ${ativos.toUpperCase()}\n\n`;
      d += `1. DO OBJETO E DA ESTRUTURA SOCIETÁRIA (ART. 991 DO CC):\n`;
      d += `A presente Sociedade em Conta de Participação tem por objeto exclusivo a captação de recursos e a realização do empreendimento supra qualificado. A atividade constitutiva é exercida unicamente pelo Sócio Ostensivo, em seu nome individual e sob sua exclusiva responsabilidade perante terceiros.\n\n`;
      d += `2. DO ANONIMATO E DA IRRESPONSABILIDADE DOS SÓCIOS PARTICIPANTES:\n`;
      d += `Os Sócios Participantes respondem somente perante o Sócio Ostensivo nos limites do capital investido, não mantendo qualquer vínculo jurídico com credores, fornecedores, fisco ou funcionários da SCP (Art. 991, parágrafo único do CC).\n\n`;
      d += `3. DA PRESTAÇÃO DE CONTAS E DIVISÃO DE RESULTADOS:\n`;
      d += `O Sócio Ostensivo apresentará balancetes trimestrais e relatório de progresso do empreendimento, promovendo a distribuição dos lucros líquidos aos investidores com isenção de imposto de renda nos termos da legislação federal.\n\n`;
      d += `Comarca de ${cidade}/${ufEmpresa}, ${dateFormatted}.\n`;
      return d;
    }
  },

  {
    id: 'pacto_deadlock_texas',
    title: 'Pacto Parassocial Anti-Impasse (Deadlock: Texas Shootout)',
    category: 'especiais',
    categoryName: 'Sucessão & Especiais',
    badge: 'MECANISMO ANTI-IMPASSE',
    badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
    description: 'Cláusula e instrumento parassocial para dissolver situações de empate societário de 50%/50% (deadlock) sem necessidade de dissolução litigiosa na Justiça, regulando o procedimento de Shotgun / Texas Shootout / Russian Roulette.',
    legalFramework: 'Art. 118 da Lei nº 6.404/1976; Arts. 421 e 1.053 do Código Civil.',
    jurisprudence: 'STJ REsp 1.860.103/SP (plena validade e cogência de cláusulas de shotgun/deadlock pactuadas em acordo parassocial).',
    keyFeatures: ['Mecanismo de Desempate Forçado (Shotgun / Texas Shootout)', 'Fixação de Preço Justo e Imediato pela Parte Ofertante', 'Prazo Fatal de 30 Dias para Comprar ou Vender', 'Eliminação de Ações Judiciais Litigiosas de Dissolução'],
    riskLevel: 'Alta Complexidade',
    targetProfile: 'Empresas divididas 50% a 50% entre dois sócios fundadores onde desentendimentos podem paralisar o faturamento.',
    defaultClauses: {
      deadlock: true,
      callOption: true,
      valuationMethod: 'balanco_determinacao',
    },
    generateFullDraft: ({ socioPF, herdeiros, nomeEmpresarial, cidade, ufEmpresa, dateFormatted }) => {
      let d = `ACORDO PARASSOCIAL DE RESOLUÇÃO DE IMPASSES SOCIETÁRIOS (CLÁUSULA DE SHOTGUN / TEXAS SHOOTOUT)\n`;
      d += `SOCIEDADE: ${(nomeEmpresarial || 'HOLDING EMPREENDEDORA').toUpperCase()} LTDA\n`;
      d += `SÓCIO TITULAR DO BLOCO A (50%): ${socioPF.toUpperCase()}\n`;
      d += `SÓCIO TITULAR DO BLOCO B (50%): ${herdeiros.toUpperCase()}\n\n`;
      d += `1. DA CARACTERIZAÇÃO DO IMPASSE INSANÁVEL (DEADLOCK):\n`;
      d += `Considera-se caracterizado o Deadlock quando, em duas reuniões consecutivas de sócios, ocorrer empate impeditivo quanto a matérias essenciais (aprovação de contas, plano de negócios ou eleição da diretoria), sem acordo amigável em 30 dias.\n\n`;
      d += `2. DO PROCEDIMENTO DO TEXAS SHOOTOUT / SHOTGUN:\n`;
      d += `a) O Sócio Notificante expedirá notificação formal indicando o preço em dinheiro pelo qual avalia cada quota da Sociedade;\n`;
      d += `b) O Sócio Notificado terá o prazo improrrogável de 20 (vinte) dias para escolher entre: (i) Vender a totalidade de suas quotas ao Notificante pelo preço estipulado; ou (ii) Comprar a totalidade das quotas do Notificante pelo mesmíssimo preço por quota;\n`;
      d += `c) O silêncio do Notificado configurará aceitação tácita e obrigatória para vender suas quotas ao Notificante.\n\n`;
      d += `Comarca de ${cidade}/${ufEmpresa}, ${dateFormatted}.\n`;
      return d;
    }
  }
];
