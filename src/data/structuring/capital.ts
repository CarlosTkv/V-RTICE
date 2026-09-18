import { StructuringModelItem } from './types';

export const CAPITAL_MODELS: StructuringModelItem[] = [
  {
    id: 'aumento_capital_imoveis',
    title: 'Aumento de Capital com Conferência de Imóveis (Tema 796 STF)',
    category: 'capital',
    categoryName: 'Capital Social & Títulos',
    badge: 'ITBI & TEMA 796 STF',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    description: 'Integralização de imóveis no capital social pelo valor da declaração de IRPF (Art. 23 da Lei 9.249/95), estruturado sem ágio ou reserva para assegurar a imunidade incondicionada de ITBI do Art. 156, § 2º, I da CF/88.',
    legalFramework: 'Art. 156, § 2º, I da CF/88; Art. 23 da Lei nº 9.249/1995; Arts. 997 e 1.055 do Código Civil.',
    jurisprudence: 'STF Tema 796 de Repercussão Geral (A imunidade em relação ao ITBI não alcança o valor dos bens que exceder o limite do capital social a ser integralizado).',
    keyFeatures: ['Subscrição e Integralização no Mesmo Ato', 'Imunidade Constitucional de ITBI Segura', 'Valor Histórico do IRPF sem Ganho de Capital', 'Dispensa de Escritura Pública (Art. 64 da Lei 8.934/94)'],
    riskLevel: 'Tributário',
    targetProfile: 'Empresários e famílias que desejam transferir imóveis residenciais ou comerciais da pessoa física para a PJ sem custos tributários.',
    defaultClauses: {
      imunidadeITBI: true,
      autonomiaPatrimonial: true,
      valuationMethod: 'valor_patrimonial_contabil',
    },
    generateFullDraft: ({ socioPF, herdeiros, ativos, nomeEmpresarial, cidade, ufEmpresa, dateFormatted, clauses }) => {
      let d = `ALTERAÇÃO DO CONTRATO SOCIAL - AUMENTO DE CAPITAL COM CONFERÊNCIA DE BENS IMÓVEIS\n`;
      d += `SOCIEDADE: ${(nomeEmpresarial || 'IMOBILIÁRIA E PARTICIPAÇÕES').toUpperCase()} LTDA\n`;
      d += `SÓCIO CONFERENTE: ${socioPF.toUpperCase()}\n`;
      d += `DEMAIS SÓCIOS ANUENTES: ${herdeiros.toUpperCase()}\n`;
      d += `IMÓVEIS CONFERIDOS: ${ativos.toUpperCase()}\n\n`;
      d += `CLÁUSULA PRIMEIRA - DO AUMENTO DO CAPITAL SOCIAL:\n`;
      d += `O capital social da sociedade é aumentado nesta data mediante a emissão de novas quotas sociais, subscritas e integralizadas com a conferência dos bens imóveis acima descritos, matriculados no Cartório de Registro de Imóveis competente.\n\n`;
      if (clauses.imunidadeITBI) {
        d += `CLÁUSULA SEGUNDA - DA IMUNIDADE DE ITBI E OBSERVÂNCIA AO TEMA 796 DO STF:\n`;
        d += `A totalidade do valor dos imóveis conferidos é estritamente destinada à subscrição do capital social, pelo valor exato constante da Declaração de IRPF do conferente, não havendo criação de ágio, prêmio ou reserva de capital. Desta forma, a operação é imune à incidência do ITBI nos termos do Art. 156, § 2º, I da Constituição Federal e tese fixada pelo STF no Tema 796.\n\n`;
      }
      d += `CLÁUSULA TERCEIRA - DA EFICÁCIA DE ESCRITURA PÚBLICA (ART. 64 DA LEI Nº 8.934/1994):\n`;
      d += `A presente alteração contratual, devidamente arquivada e registrada na Junta Comercial, constitui documento hábil para a transferência de propriedade e averbação imobiliária perante o Cartório de Registro de Imóveis, dispensando escritura pública notarial.\n\n`;
      d += `Comarca de ${cidade}/${ufEmpresa}, ${dateFormatted}.\n`;
      return d;
    }
  },

  {
    id: 'aumento_capital_moeda',
    title: 'Aumento de Capital em Moeda Corrente & Direito de Preferência',
    category: 'capital',
    categoryName: 'Capital Social & Títulos',
    badge: 'APORTE DE CAIXA',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    description: 'Aporte de novos recursos financeiros na sociedade com emissão de novas quotas, concessão do prazo de 30 dias para exercício do direito de preferência dos sócios e regras para tratamento de sobras e diluição.',
    legalFramework: 'Arts. 1.081 a 1.084 do Código Civil Brasileiro; Instrução Normativa DREI nº 81/2020.',
    jurisprudence: 'STJ REsp 1.782.981/SP (respeito estrito ao prazo de preferência para evitar nulidade da diluição de minoritários).',
    keyFeatures: ['Prazo Legal de 30 Dias para Preferência (Art. 1.081 CC)', 'Regras de Alocação de Quotas Remanescentes (Sobras)', 'Integralização Imediata em Moeda Corrente Bancária', 'Proteção contra Diluição Arbitrária de Minoritários'],
    riskLevel: 'Estratégico',
    targetProfile: 'Sociedades que necessitam de injeção de capital de giro ou recursos para expansão fabril/comercial.',
    defaultClauses: {
      prefRoute: true,
      valuationMethod: 'balanco_determinacao',
    },
    generateFullDraft: ({ socioPF, herdeiros, nomeEmpresarial, cidade, ufEmpresa, dateFormatted }) => {
      let d = `ALTERAÇÃO CONTRATUAL DE DELIBERAÇÃO DE AUMENTO DE CAPITAL SOCIAL EM MOEDA CORRENTE\n`;
      d += `SOCIEDADE: ${(nomeEmpresarial || 'EMPRESA INDUSTRIAL').toUpperCase()} LTDA\n`;
      d += `SÓCIO SUBSCRITOR: ${socioPF.toUpperCase()}\n`;
      d += `DEMAIS QUOTISTAS: ${herdeiros.toUpperCase()}\n\n`;
      d += `1. DA PROPOSTA DE AUMENTO DO CAPITAL SOCIAL:\n`;
      d += `Delibera-se o aumento do capital social para reforço do capital de giro da empresa, com abertura do prazo de 30 (trinta) dias para que os sócios exerçam seu direito de preferência proporcional à participação societária preexistente (Art. 1.081, § 1º do Código Civil).\n\n`;
      d += `2. DA INTEGRALIZAÇÃO EM MOEDA CORRENTE:\n`;
      d += `As quotas subscritas serão integralizadas em moeda corrente nacional mediante transferência bancária em favor da sociedade, passando o capital social a ser devidamente consolidado.\n\n`;
      d += `Comarca de ${cidade}/${ufEmpresa}, ${dateFormatted}.\n`;
      return d;
    }
  },

  {
    id: 'aumento_capitalizacao_lucros',
    title: 'Aumento de Capital por Capitalização de Lucros e Reservas',
    category: 'capital',
    categoryName: 'Capital Social & Títulos',
    badge: 'BONIFICAÇÃO DE QUOTAS',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    description: 'Transformação contábil de reservas de lucros retidos ou saldos acumulados de exercícios anteriores em capital social formal da empresa, com distribuição proporcional de novas quotas (bonificação) isentas de IRPF.',
    legalFramework: 'Art. 1.081 do Código Civil; Art. 10 da Lei nº 9.249/1995; Instrução Normativa RFB nº 1.700/2017.',
    jurisprudence: 'Súmula 583 do STF e isenção tributária federal expressa na capitalização de lucros.',
    keyFeatures: ['Fortalecimento do Balanço Patrimonial e Rating de Crédito', 'Isenção Integral de Imposto de Renda (IRPF/IRPJ)', 'Emissão de Novas Quotas Proporcionais (Bonificação)', 'Sem Saída de Caixa da Sociedade'],
    riskLevel: 'Estratégico',
    targetProfile: 'Empresas consolidadas com altos lucros acumulados que desejam robustecer o capital social para licitações e limites bancários.',
    defaultClauses: {
      autonomiaPatrimonial: true,
      valuationMethod: 'valor_patrimonial_contabil',
    },
    generateFullDraft: ({ socioPF, herdeiros, nomeEmpresarial, cidade, ufEmpresa, dateFormatted }) => {
      let d = `ALTERAÇÃO CONTRATUAL DE AUMENTO DE CAPITAL POR CAPITALIZAÇÃO DE RESERVAS DE LUCROS\n`;
      d += `SOCIEDADE: ${(nomeEmpresarial || 'COMERCIAL IMPORTADORA').toUpperCase()} LTDA\n`;
      d += `SÓCIOS BENEFICIÁRIOS: ${socioPF.toUpperCase()} e ${herdeiros.toUpperCase()}\n\n`;
      d += `1. DA CAPITALIZAÇÃO DE LUCROS ACUMULADOS:\n`;
      d += `Os sócios aprovam por unanimidade a transferência de saldo da conta de 'Reservas de Lucros Acumulados' para a conta de 'Capital Social', fortalecendo a estrutura patrimonial da empresa com base no balanço patrimonial devidamente encerrado e auditado.\n\n`;
      d += `2. DA DISTRIBUIÇÃO DAS QUOTAS BONIFICADAS E ISENÇÃO DE IRPF:\n`;
      d += `Em decorrência da incorporação contábil, são emitidas novas quotas distribuídas proporcionalmente entre os atuais sócios a título de bonificação, operação isenta de tributação pelo IRPF nos termos do Artigo 10 da Lei nº 9.249/1995.\n\n`;
      d += `Comarca de ${cidade}/${ufEmpresa}, ${dateFormatted}.\n`;
      return d;
    }
  },

  {
    id: 'reducao_capital_excessivo',
    title: 'Redução de Capital por Ser Excessivo (Art. 1.082, II CC)',
    category: 'capital',
    categoryName: 'Capital Social & Títulos',
    badge: 'RESTITUIÇÃO AOS SÓCIOS',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    description: 'Devolução de capital aos sócios em dinheiro ou ativos quando o capital se tornou desproporcional ou excessivo ao objeto social, com publicação de edital e prazo decadencial de 90 dias para impugnação de credores.',
    legalFramework: 'Arts. 1.082, II, 1.083 e 1.084 do Código Civil Brasileiro; IN DREI 81/2020.',
    jurisprudence: 'STJ REsp 1.637.284/RJ (observância obrigatória do prazo de 90 dias de oposição de credores para a eficácia da redução).',
    keyFeatures: ['Restituição de Caixa ou Imóveis aos Sócios', 'Publicação Obrigatória em Diário Oficial / Jornais', 'Prazo de 90 Dias de Oposição dos Credores Quirografários', 'Eficácia Jurídica Registrada na Junta Comercial'],
    riskLevel: 'Alta Complexidade',
    targetProfile: 'Sociedades que desinvestiram, venderam filiais ou acumularam capital ocioso e desejam descapitalizar legalmente.',
    defaultClauses: {
      autonomiaPatrimonial: true,
      valuationMethod: 'balanco_determinacao',
    },
    generateFullDraft: ({ socioPF, herdeiros, nomeEmpresarial, cidade, ufEmpresa, dateFormatted }) => {
      let d = `ATA DE REUNIÃO DE SÓCIOS - REDUÇÃO DO CAPITAL SOCIAL POR SER EXCESSIVO AO OBJETO\n`;
      d += `SOCIEDADE: ${(nomeEmpresarial || 'CORPORAÇÃO COMERCIAL').toUpperCase()} LTDA\n`;
      d += `SÓCIOS PRESENTES: ${socioPF.toUpperCase()} e ${herdeiros.toUpperCase()}\n\n`;
      d += `1. DA REDUÇÃO POR SER EXCESSIVO AO OBJETO SOCIAL (ART. 1.082, II DO CÓDIGO CIVIL):\n`;
      d += `Considerando o desinvestimento estratégico nas atividades industriais e a redução do porte operacional, os sócios deliberam reduzir o capital social com restituição proporcional de recursos aos sócios.\n\n`;
      d += `2. DA PUBLICAÇÃO E DO PRAZO DE OPOSIÇÃO DE CREDORES (ART. 1.084 DO CÓDIGO CIVIL):\n`;
      d += `A redução somente se tornará eficaz após a publicação desta ata em órgão oficial e jornal de grande circulação e o decurso do prazo de 90 (noventa) dias sem impugnação expressa de qualquer credor quirografário quieto.\n\n`;
      d += `Comarca de ${cidade}/${ufEmpresa}, ${dateFormatted}.\n`;
      return d;
    }
  },

  {
    id: 'emissao_debentures',
    title: 'Emissão Privada de Debêntures Simples / Participativas',
    category: 'capital',
    categoryName: 'Capital Social & Títulos',
    badge: 'TÍTULO DE CRÉDITO & CAPTAÇÃO',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    description: 'Escritura de emissão de debêntures para captação de dívida corporativa estruturada, definindo remuneração (CDI + spread ou IPCA), garantias reais/fidejussórias, covenants financeiros e condições de resgate antecipado.',
    legalFramework: 'Arts. 52 a 74 da Lei nº 6.404/1976; Lei nº 14.195/2021 (simplificações de emissão de debêntures).',
    jurisprudence: 'CVM e STJ (validade de garantias flutuantes e reais vinculadas a debêntures em recuperação ou falência).',
    keyFeatures: ['Captação de Longo Prazo sem Diluição Societária', 'Garantia Fidejussória ou Real (Alienação Fiduciária/Penhor)', 'Covenants Financeiros Auditados (Dívida Líquida / EBITDA)', 'Remuneração Atrelada ao CDI ou IPCA'],
    riskLevel: 'Alta Complexidade',
    targetProfile: 'Sociedades Anônimas de capital fechado que precisam financiar novos projetos ou refinanciar passivos caros no mercado.',
    defaultClauses: {
      autonomiaPatrimonial: true,
      valuationMethod: 'fluxo_caixa_descontado',
    },
    generateFullDraft: ({ socioPF, herdeiros, nomeEmpresarial, cidade, ufEmpresa, dateFormatted }) => {
      let d = `ESCRITURA PARTICULAR DA 1ª EMISSÃO DE DEBÊNTURES SIMPLES COM GARANTIA REAL\n`;
      d += `EMISSORA: ${(nomeEmpresarial || 'COMPANHIA EMISSORA').toUpperCase()} S/A (Rep: ${socioPF.toUpperCase()})\n`;
      d += `DEBENTURISTAS / INVESTIDORES: ${herdeiros.toUpperCase()}\n\n`;
      d += `1. DO VALOR E DAS CARACTERÍSTICAS DA EMISSÃO:\n`;
      d += `A Emissora emite debêntures simples, não conversíveis em ações, com valor nominal unitário de R$ 10.000,00, prazo de vencimento de 60 meses e remuneração indexada à taxa CDI acrescida de spread de 2,50% ao ano.\n\n`;
      d += `2. DAS GARANTIAS E COVENANTS FINANCEIROS:\n`;
      d += `A emissão conta com garantia real de alienação fiduciária sobre recebíveis de cartão e imóveis, obrigando-se a Emissora a manter o índice Dívida Líquida / EBITDA inferior a 2,5x sob pena de vencimento antecipado.\n\n`;
      d += `Comarca de ${cidade}/${ufEmpresa}, ${dateFormatted}.\n`;
      return d;
    }
  }
];
