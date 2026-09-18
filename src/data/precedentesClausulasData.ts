// =====================================================================================
// BASE DE DADOS DE PRECEDENTES, CLÁUSULAS BLINDADAS & VADE MECUM SOCIETÁRIO 360°
// Padronizado com STF, STJ, CARF, DREI, CC/02, CPC/15, LC 123/06, LLE 13.874/19
// =====================================================================================

export type ComplexityLevel = 'basica' | 'intermediaria' | 'avancada' | 'ultra_holding';
export type SpecialtySector = 'tecnologia_saas' | 'holding_familiar' | 'comercio_industria' | 'servicos_medicos' | 'ecommerce' | 'reestruturacao_ma';

export interface ShieldedClauseItem {
  id: string;
  title: string;
  category: 'sucessao_haveres' | 'governança_quorum' | 'blindagem_art50' | 'conflitos_deadlock' | 'tributario_itbi' | 'concorrencia_nda' | 'eficacia_executiva' | 'familia_regime';
  complexity: ComplexityLevel;
  specialty: SpecialtySector[];
  legalBasis: string;
  courtJurisprudence: string;
  summary: string;
  fullClauseText: string;
  auditScore: number;
  auditNotes: string;
  tags: string[];
}

export interface ContractPrecedentModel {
  id: string;
  title: string;
  complexity: ComplexityLevel;
  complexityLabel: string;
  specialty: SpecialtySector;
  specialtyLabel: string;
  description: string;
  targetAudience: string;
  legalFramework: string;
  keyProtections: string[];
  recommendedClauses: string[];
  suggestedRedesimEvents: string[];
  sampleStructureSummary: string;
}

export interface VadeMecumArticle {
  id: string;
  lawCode: 'CC' | 'CPC' | 'LC123' | 'LLE' | 'LSA' | 'DREI' | 'STJ' | 'STF';
  lawName: string;
  articleReference: string;
  topic: string;
  heading: string;
  legalText: string;
  practicalCommentary: string;
  jurisprudentialImpact: string;
  correlatedKeywords: string[];
}

// -------------------------------------------------------------------------------------
// 1. ACERVO DE CLÁUSULAS BLINDADAS AUDITADAS
// -------------------------------------------------------------------------------------
export const SHIELDED_CLAUSES_CATALOG: ShieldedClauseItem[] = [
  {
    id: 'cl-stj-1056',
    title: 'Apuração de Haveres por Balanço de Determinação a Valor de Mercado',
    category: 'sucessao_haveres',
    complexity: 'ultra_holding',
    specialty: ['holding_familiar', 'tecnologia_saas', 'servicos_medicos', 'comercio_industria', 'reestruturacao_ma'],
    legalBasis: 'Código Civil, Art. 1.028 e Art. 1.031; CPC, Arts. 599 a 609',
    courtJurisprudence: 'STJ - Tema Repetitivo 1.056 e REsp 1.877.331/SP (Min. Relator p/ Acórdão)',
    summary: 'Fixa a liquidação das quotas do sócio falecido, retirante ou excluído com base em Balanço de Determinação a valor real/mercado dos ativos tangíveis e intangíveis, proibindo o valor contábil raso e parcelando o pagamento em 24 meses com carência para não descapitalizar a sociedade.',
    fullClauseText: `CLÁUSULA DE APURAÇÃO DE HAVERES POR BALANÇO DE DETERMINAÇÃO: Em caso de falecimento, interdição, retirada voluntária, exclusão de sócio ou dissolução parcial da sociedade, a apuração do valor patrimonial das quotas sociais será realizada estritamente por meio de BALANÇO DE DETERMINAÇÃO, levantado na data do evento resolutivo (dies a quo), consoante jurisprudência vinculante fixada pelo Superior Tribunal de Justiça (STJ - Tema Repetitivo 1.056 e REsp 1.877.331/SP) e arts. 1.028 e 1.031 do Código Civil.
Parágrafo Primeiro: O Balanço de Determinação considerará o valor real de mercado de todos os bens do ativo imobilizado, direitos, estoques, posições contratuais, bem como os intangíveis e a metodologia de fluxo de caixa quando aplicável, deduzindo-se a totalidade das obrigações e passivos contingentes.
Parágrafo Segundo: Os herdeiros, sucessores ou o sócio desligado não ingressarão na sociedade, sendo os seus haveres liquidados pela sociedade em 24 (vinte e quatro) parcelas mensais, iguais e sucessivas, com carência inicial de 90 (noventa) dias, corrigidas monetariamente pelo IPCA/IBGE, acrescidas de juros de 0,5% (meio por cento) ao mês, preservando-se a higidez do capital de giro social.`,
    auditScore: 100,
    auditNotes: 'Conformidade plena com os precedentes da 2ª Seção do STJ. Evita ações judiciais de dissolução parcial contenciosa e bloqueios bancários cautelares.',
    tags: ['Balanço de Determinação', 'Tema 1056 STJ', 'Falecimento', 'Haveres', 'Art. 1.028 CC']
  },
  {
    id: 'cl-art50-lle',
    title: 'Blindagem Patrimonial e Barreira contra Desconsideração da Personalidade Jurídica',
    category: 'blindagem_art50',
    complexity: 'avancada',
    specialty: ['holding_familiar', 'comercio_industria', 'tecnologia_saas', 'ecommerce', 'servicos_medicos'],
    legalBasis: 'Código Civil, Art. 49-A e Art. 50 (redação da Lei nº 13.874/2019 - Lei da Liberdade Econômica)',
    courtJurisprudence: 'STJ - EREsp 1.306.553/SC e Jurisprudência em Teses Ed. 138/STJ',
    summary: 'Consagra a autonomia patrimonial estrita da pessoa jurídica, definindo que o patrimônio dos sócios não responde por dívidas da sociedade salvo prova inequívoca de fraude com dolo ou confusão patrimonial qualificada nos estritos termos do Art. 50 do Código Civil reformado.',
    fullClauseText: `CLÁUSULA DE AUTONOMIA PATRIMONIAL E SEGURANÇA SOCIETÁRIA (LEI 13.874/2019): A sociedade possui personalidade jurídica e patrimônio absolutamente autônomos e distintos da pessoa física de seus sócios, nos termos do art. 49-A e art. 50 do Código Civil Brasileiro, com as alterações da Lei da Liberdade Econômica.
Parágrafo Primeiro: O patrimônio particular dos sócios e dos administradores não responderá, em hipótese alguma, pelas obrigações civis, comerciais, tributárias ou operacionais da sociedade, salvo se configurado e judicialmente comprovado o desvio de finalidade caracterizado pelo dolo de fraudar credores ou a confusão patrimonial contínua e reiterada, nos estritos parâmetros dos §§ 1º e 2º do art. 50 do Código Civil.
Parágrafo Segundo: Fica expressamente vedada a utilização de contas bancárias da sociedade para satisfação de despesas estritamente particulares dos sócios, bem como a caução de ativos societários em favor de obrigações pessoais sem a expressa anuência unânime de todos os sócios.`,
    auditScore: 98,
    auditNotes: 'Bloqueia pedidos genéricos de desconsideração inversa ou direta em execuções fiscais e cíveis infundadas.',
    tags: ['Artigo 50 CC', 'Liberdade Econômica', 'Autonomia Patrimonial', 'Desconsideração da PJ']
  },
  {
    id: 'cl-shotgun-deadlock',
    title: 'Cláusula de Desbloqueio de Impasse Societário (Texas Shoot-Out / Buy-or-Sell / Shotgun)',
    category: 'conflitos_deadlock',
    complexity: 'avancada',
    specialty: ['tecnologia_saas', 'reestruturacao_ma', 'holding_familiar', 'comercio_industria'],
    legalBasis: 'Código Civil, Art. 421 e 421-A (Princípio da Intervenção Mínima na Governança Privada)',
    courtJurisprudence: 'TJSP - Apelação Cível nº 1009842-32.2018.8.26.0100 (Validade Plena do Mecanismo de Shotgun)',
    summary: 'Mecanismo de resolução rápida para impasse societário 50/50% ou de bloqueio deliberativo: qualquer sócio pode ofertar comprar as quotas do outro por preço certo unitário, cabendo ao sócio notificado o direito exclusivo de aceitar vender suas cotas ou, alternativamente, comprar as cotas do ofertante exatamente pelo mesmo valor unitário.',
    fullClauseText: `CLÁUSULA DE RESOLUÇÃO DE IMPASSE SOCIETÁRIO (SHOTGUN / TEXAS SHOOT-OUT): Havendo impasse deliberativo continuado por mais de 30 (trinta) dias que paralise a administração ordinária ou deliberações estratégicas da sociedade, qualquer sócio ("Sócio Ofertante") poderá notificar formalmente o outro sócio ("Sócio Notificado") deflagrando o procedimento irretratável de Desempate Societário.
Parágrafo Primeiro: A Notificação de Shotgun deverá indicar: (a) o valor em moeda corrente nacional atribuído a cada quota social; e (b) as condições e prazos de pagamento.
Parágrafo Segundo: Recebida a notificação, o Sócio Notificado terá o prazo improrrogável de 30 (trinta) dias corridos para optar entre: (i) VENDER a integralidade de suas quotas ao Sócio Ofertante pelo preço e condições fixados na notificação; ou (ii) COMPRAR a totalidade das quotas pertencentes ao Sócio Ofertante pelo exato mesmo preço unitário e condições propostas.
Parágrafo Terceiro: O silêncio do Sócio Notificado ao término do prazo de 30 dias implicará em anuência tácita e irrevogável para a VENDA de suas quotas ao Sócio Ofertante.`,
    auditScore: 96,
    auditNotes: 'Padrão ouro em governança de startups e sociedades limitadas paritárias (50/50) para evitar dissolução judicial traumática.',
    tags: ['Shotgun', 'Deadlock', 'Impasse', 'Buy or Sell', 'Art. 421-A CC']
  },
  {
    id: 'cl-itbi-tema796',
    title: 'Imunidade Constitucional de ITBI na Integralização com Bens Imóveis',
    category: 'tributario_itbi',
    complexity: 'ultra_holding',
    specialty: ['holding_familiar', 'reestruturacao_ma', 'comercio_industria'],
    legalBasis: 'Constituição Federal de 1988, Art. 156, § 2º, I; Código Tributário Nacional, Art. 36 e 37',
    courtJurisprudence: 'STF - Tema com Repercussão Geral 796 (RE 796.376/SC, Rel. Min. Alexandre de Moraes)',
    summary: 'Fundamenta a conferência de bens imóveis ao capital social da empresa com plena imunidade de ITBI sobre o valor das quotas integralizadas, delimitando com precisão a incidência fiscal apenas sobre eventual ágio/reserva de capital que exceda o valor nominal subscrito.',
    fullClauseText: `CLÁUSULA DE INTEGRALIZAÇÃO DE CAPITAL COM BENS IMÓVEIS E IMUNIDADE CONSTITUCIONAL DE ITBI (TEMA 796 STF): O capital social da sociedade é aumentado mediante a conferência de bens imóveis pelos sócios subscritores, expressamente discriminados no Anexo Imobiliário deste instrumento, com expressa menção a matrículas, cartórios de registro imobiliário competentes e valores de conferência.
Parágrafo Primeiro: A referida integralização goza da IMUNIDADE CONSTITUCIONAL de Imposto sobre Transmissão de Bens Imóveis (ITBI), assegurada pelo art. 156, § 2º, inciso I da Constituição da República de 1988 e art. 36 do Código Tributário Nacional, bem como pela tese vinculante fixada pelo Plenário do Supremo Tribunal Federal no TEMA 796 DE REPERCUSSÃO GERAL (RE 796.376/SC).
Parágrafo Segundo: A sociedade declara expressamente que sua atividade preponderante não é a compra e venda de bens imóveis, locação de bens imóveis ou arrendamento mercantil nos termos do art. 37 do CTN, conferindo a este Contrato Social eficácia de TÍTULO HÁBIL de transferência de domínio junto aos Oficiais de Registro de Imóveis (Lei nº 8.934/94, art. 64).`,
    auditScore: 99,
    auditNotes: 'Documento essencial para apresentação em Cartórios de Registro de Imóveis (RGI) e Secretarias Municipais de Fazenda.',
    tags: ['ITBI', 'Tema 796 STF', 'Holding Imobiliária', 'Art. 156 CF', 'Integralização com Imóveis']
  },
  {
    id: 'cl-nao-concorrencia-1147',
    title: 'Não Concorrência, Proteção de Segredos de Negócio e Confidencialidade Pós-Desligamento (NDA)',
    category: 'concorrencia_nda',
    complexity: 'intermediaria',
    specialty: ['tecnologia_saas', 'comercio_industria', 'ecommerce', 'servicos_medicos', 'reestruturacao_ma'],
    legalBasis: 'Código Civil, Art. 1.147; Lei da Propriedade Industrial nº 9.279/1996, Art. 195 (Concorrência Desleal)',
    courtJurisprudence: 'STJ - REsp 1.803.111/SP e REsp 1.203.109/MG (Requisitos de Validade: Limite Temporal, Espacial e Material)',
    summary: 'Proíbe o sócio que se retira, é excluído ou cede suas quotas de exercer atividade concorrente, aliciar colaboradores ou desviar clientes da sociedade pelo prazo legal e convencional de 2 (dois) a 5 (cinco) anos, fixando cláusula penal compensatória com eficácia de título executivo.',
    fullClauseText: `CLÁUSULA DE NÃO CONCORRÊNCIA, PROTEÇÃO DE CLIENTELA E CONFIDENCIALIDADE: Durante a vigência de sua condição de sócio e pelo prazo de 2 (dois) anos contados da averbação de sua retirada, exclusão ou cessão total de quotas na Junta Comercial competente, o sócio retirante fica expressamente proibido de fazer concorrência direta ou indireta à sociedade, nos termos do art. 1.147 do Código Civil.
Parágrafo Primeiro: A vedação compreende: (a) abrir, constituir ou participar de sociedade com atividade idêntica ou análoga; (b) prestar consultoria a empresas concorrentes; (c) aliciar, contratar ou incentivar o desligamento de colaboradores e fornecedores da sociedade; (d) contatar ativamente a base de clientes constituída durante a sociedade.
Parágrafo Segundo: A infração a qualquer dos dispositivos desta cláusula sujeitará o infrator ao pagamento de CLÁUSULA PENAL não compensatória correspondente a 10 (dez) vezes o valor de seu pró-labore ou 20% sobre o faturamento médio mensal da sociedade, sem prejuízo da apuração de perdas e danos e concessão de tutela de urgência inibitória (CPC, art. 300).`,
    auditScore: 97,
    auditNotes: 'Redação rigorosamente calibrada com limite territorial e temporal para não incorrer em nulidade por violação à livre iniciativa.',
    tags: ['Não Concorrência', 'Art. 1.147 CC', 'Segredo Comercial', 'NDA', 'Cláusula Penal']
  },
  {
    id: 'cl-quorum-lei14451',
    title: 'Quóruns Modernizados de Deliberação e Eleição de Administrador (Lei nº 14.451/2022)',
    category: 'governança_quorum',
    complexity: 'intermediaria',
    specialty: ['comercio_industria', 'tecnologia_saas', 'holding_familiar', 'ecommerce'],
    legalBasis: 'Código Civil, Arts. 1.061, 1.071 e 1.076 (com as alterações obrigatórias da Lei Federal nº 14.451/2022)',
    courtJurisprudence: 'DREI - Ofício Circular SEI nº 3.421/2022 e Enunciados JUCESP',
    summary: 'Atualiza todos os quóruns de deliberação societária para os novos limites da Lei 14.451/2022 (maioria simples para alteração contratual, destituição de sócio administrador e designação de administradores não sócios quando o capital estiver totalmente integralizado).',
    fullClauseText: `CLÁUSULA DE DELIBERAÇÕES SOCIAIS E QUÓRUNS QUALIFICADOS (LEI 14.451/2022): As deliberações dos sócios serão tomadas em conformidade com as regras e quóruns estabelecidos nos arts. 1.061, 1.071 e 1.076 do Código Civil, com a redação conferida pela Lei Federal nº 14.451/2022.
Parágrafo Primeiro: Dependem da aprovação de sócios que representem mais da metade do capital social (MAIORIA ABSOLUTA / 50% + 1 cota): (a) a alteração do contrato social; (b) a incorporação, fusão, cisão ou dissolução da sociedade; (c) a designação de administradores não sócios, estando o capital totalmente integralizado; (d) a destituição de sócio administrador designado no contrato.
Parágrafo Segundo: As convocações de reuniões ou assembleias dispensam as formalidades de publicação prévia quando comparecerem todos os sócios ou quando todos se declararem por escrito formalmente cientes do local, data e ordem do dia.`,
    auditScore: 100,
    auditNotes: 'Evita exigências e pendências cadastrais imediatas nas Juntas Comerciais por utilização de quóruns revogados (antigos 3/4 e 2/3).',
    tags: ['Lei 14.451/2022', 'Quórum Maioria Simples', 'DREI 81/2020', 'Administração']
  },
  {
    id: 'cl-gravames-1911',
    title: 'Cláusula de Inalienabilidade, Incomunicabilidade e Impenhorabilidade de Quotas',
    category: 'sucessao_haveres',
    complexity: 'ultra_holding',
    specialty: ['holding_familiar', 'reestruturacao_ma'],
    legalBasis: 'Código Civil, Art. 1.911 e Art. 1.668; CPC, Art. 833, I',
    courtJurisprudence: 'STJ - REsp 1.442.238/SP e REsp 1.641.549/RJ (Proteção Patrimonial de Quotas em Doação com Reserva de Usufruto)',
    summary: 'Gravames sucessórios que blindam as quotas sociais doadas aos herdeiros com reserva de usufruto vitalício, impedindo que credores dos donatários penhorem as quotas ou que cônjuges em divórcio pleiteiem meação societária.',
    fullClauseText: `CLÁUSULA DE GRAVAMES SUCESSÓRIOS E PROTEÇÃO PATRIMONIAL (ART. 1.911 CC): As quotas sociais transmitidas por doação com reserva de usufruto vitalício aos herdeiros ficam gravadas em caráter perpétuo e irrevogável com as cláusulas restritivas de INALIENABILIDADE, INCOMUNICABILIDADE e IMPENHORABILIDADE, nos termos do art. 1.911 do Código Civil Brasileiro.
Parágrafo Primeiro: Em decorrência da cláusula de INCOMUNICABILIDADE, as quotas sociais e os respectivos direitos patrimoniais e políticos jamais se comunicarão aos cônjuges ou companheiros dos donatários, qualquer que seja o regime de bens adotado no casamento ou na união estável.
Parágrafo Segundo: Em virtude da cláusula de IMPENHORABILIDADE, as referidas quotas não responderão por dívidas pretéritas, presentes ou futuras contraídas pelos donatários, sendo ineficaz qualquer penhora, arresto ou constrição judicial oriunda de obrigações pessoais estranhas aos negócios da própria sociedade.`,
    auditScore: 99,
    auditNotes: 'Pilar central de qualquer holding familiar e planejamento sucessório estruturado.',
    tags: ['Holding Familiar', 'Art. 1.911 CC', 'Inalienabilidade', 'Incomunicabilidade', 'Impenhorabilidade']
  },
  {
    id: 'cl-cpc-784-assinatura',
    title: 'Eficácia de Título Executivo Extrajudicial e Assinatura Eletrônica Avançada',
    category: 'eficacia_executiva',
    complexity: 'basica',
    specialty: ['tecnologia_saas', 'comercio_industria', 'ecommerce', 'holding_familiar', 'servicos_medicos', 'reestruturacao_ma'],
    legalBasis: 'Código de Processo Civil, Art. 784, inciso III e § 4º (inserido pela Lei nº 14.620/2023); MP 2.200-2/2001',
    courtJurisprudence: 'STJ - REsp 1.495.920/DF (Validade Executiva de Contratos Eletrônicos)',
    summary: 'Atribui ao instrumento societário e seus anexos a força expressa de Título Executivo Extrajudicial para cobrança direta de integralização, multas e aportes, dispensando a assinatura de 2 testemunhas quando firmado por certificados eletrônicos nos termos do Art. 784, § 4º do CPC.',
    fullClauseText: `CLÁUSULA DE EFICÁCIA DE TÍTULO EXECUTIVO E ASSINATURA ELETRÔNICA (ART. 784, § 4º CPC): Os sócios convencionam expressamente que o presente Contrato Social e todas as obrigações patrimoniais dele decorrentes possuem força de TÍTULO EXECUTIVO EXTRAJUDICIAL, nos exatos termos do art. 784, inciso III do Código de Processo Civil.
Parágrafo Único: As partes declaram plenamente válida e eficaz a assinatura deste instrumento por meio de certificado digital emitido no âmbito da Infraestrutura de Chaves Públicas Brasileira (ICP-Brasil) ou por meio de assinatura eletrônica qualificada/avançada na plataforma Gov.br, hipótese em que se DISPENSA expressamente a aposição de assinaturas de testemunhas instrumentárias, nos termos do art. 784, § 4º do Código de Processo Civil (Lei nº 14.620/2023).`,
    auditScore: 100,
    auditNotes: 'Agiliza o trâmite perante as Juntas Comerciais digitais (REDESIM/VRE/JUCESP) e viabiliza execução direta no Poder Judiciário.',
    tags: ['Art. 784 CPC', 'Título Executivo', 'Assinatura Digital', 'Gov.br', 'ICP-Brasil']
  }
];

// -------------------------------------------------------------------------------------
// 2. MODELOS DE CONTRATOS BASEADOS EM COMPLEXIDADE E ESPECIALIDADE
// -------------------------------------------------------------------------------------
export const CONTRACT_PRECEDENTS_MODELS: ContractPrecedentModel[] = [
  {
    id: 'mod-tech-vesting',
    title: 'Contrato Social de Startup & Tecnologia com Mútuo e Tag Along',
    complexity: 'avancada',
    complexityLabel: 'Avançada / Governança Corporativa',
    specialty: 'tecnologia_saas',
    specialtyLabel: 'Tecnologia, SaaS & Startups',
    description: 'Estruturado sob medida para empresas de tecnologia, software, inteligência artificial e plataformas digitais com atração de investidores anjo e pools de stock options/vesting.',
    targetAudience: 'Startups de tecnologia, desenvolvedoras de software, marketplaces digitais e fintechs.',
    legalFramework: 'Lei Complementar 182/2021 (Marco Legal das Startups), Lei 13.874/19 (LLE), Código Civil Arts. 1.052 a 1.087',
    keyProtections: [
      'Cláusula de Mútuo Conversível em Participação com Safe Note',
      'Direito de Tag Along 100% para sócios fundadores e minoritários',
      'Quóruns flexíveis para aumento de capital sem alteração burocrática',
      'Proteção rigorosa de propriedade intelectual e código-fonte'
    ],
    recommendedClauses: ['cl-stj-1056', 'cl-shotgun-deadlock', 'cl-nao-concorrencia-1147', 'cl-cpc-784-assinatura'],
    suggestedRedesimEvents: ['101', '211', '248', '249'],
    sampleStructureSummary: '1. Denominação & Objeto Tech -> 2. Capital & Investimento Anjo -> 3. Administração & Cláusula de Vesting -> 4. Deadlock Shotgun -> 5. Não Concorrência & NDA -> 6. Foro e Eficácia Executiva'
  },
  {
    id: 'mod-holding-imobiliaria',
    title: 'Contrato Social de Holding Patrimonial Familiar & Planejamento Sucessório',
    complexity: 'ultra_holding',
    complexityLabel: 'Ultra-Blindada / Holding & Sucessão',
    specialty: 'holding_familiar',
    specialtyLabel: 'Holding Familiar & Gestão Patrimonial',
    description: 'Minuta blindada de holding pura ou mista para centralização de patrimônio imobiliário, proteção contra riscos operacionais e sucessão em vida com reserva de usufruto.',
    targetAudience: 'Famílias empresárias, detentores de patrimônio imobiliário e estruturação de blindagem patrimonial.',
    legalFramework: 'Tema 796 STF (ITBI), Art. 1.911 CC (Gravames), Art. 1.028 CC c/c Tema 1.056 STJ (Balanço de Determinação)',
    keyProtections: [
      'Imunidade de ITBI garantida com menção expressa ao Tema 796 STF',
      'Cláusulas de Inalienabilidade, Incomunicabilidade e Impenhorabilidade',
      'Usufruto vitalício aos patriarcas com direitos políticos integrais',
      'Liquidação de haveres estritamente por Balanço de Determinação'
    ],
    recommendedClauses: ['cl-itbi-tema796', 'cl-gravames-1911', 'cl-stj-1056', 'cl-art50-lle'],
    suggestedRedesimEvents: ['101', '211', '248'],
    sampleStructureSummary: '1. Objeto Holding Pura/Mista -> 2. Integralização Imóveis c/ ITBI Tema 796 -> 3. Usufruto Vitalício & Poder de Voto -> 4. Cláusulas Restritivas Art. 1911 -> 5. Apuração Haveres STJ 1056'
  },
  {
    id: 'mod-servicos-medicos',
    title: 'Contrato Social de Sociedade Médica / Saúde Uniprofissional Regulamentada',
    complexity: 'intermediaria',
    complexityLabel: 'Intermediária / Regulatória',
    specialty: 'servicos_medicos',
    specialtyLabel: 'Serviços Médicos, Clínicas & Saúde',
    description: 'Minuta compatível com exigências do Conselho Regional de Medicina (CRM), Vigilância Sanitária e enquadramento tributário em Simples Nacional ou Lucro Presumido com equiparação hospitalar.',
    targetAudience: 'Clínicas médicas, odontológicas, laboratórios e sociedades uniprofissionais de saúde.',
    legalFramework: 'Código de Ética Médica, Resoluções CFM, Lei Complementar 123/2006 (Fator R), Arts. 997 a 1.038 CC',
    keyProtections: [
      'Responsabilidade técnica delimitada perante o conselho de classe',
      'Distribuição desproporcional de lucros atrelada à produtividade médica',
      'Exclusão extrajudicial de sócio por falta ética grave (Art. 1.085 CC)',
      'Não concorrência territorial com raio de atuação em clínicas'
    ],
    recommendedClauses: ['cl-nao-concorrencia-1147', 'cl-stj-1056', 'cl-art50-lle', 'cl-cpc-784-assinatura'],
    suggestedRedesimEvents: ['101', '210', '244'],
    sampleStructureSummary: '1. Objeto Médico & CRM -> 2. Capital & Cotas -> 3. Responsabilidade Técnica Médica -> 4. Distribuição Desproporcional Produtiva -> 5. Exclusão Ética -> 6. Resolução de Haveres'
  },
  {
    id: 'mod-comercio-distribuicao',
    title: 'Contrato Social de Indústria, Comércio e E-commerce Multicanal',
    complexity: 'intermediaria',
    complexityLabel: 'Intermediária / Operacional',
    specialty: 'comercio_industria',
    specialtyLabel: 'Comércio, Indústria & Logística',
    description: 'Contrato com foco em segurança das cadeias de suprimento, responsabilidade limitada dos sócios e agilidade para abertura e fechamento de filiais fiscais.',
    targetAudience: 'Indústrias, distribuidoras atacadistas, redes varejistas e operadores logísticos.',
    legalFramework: 'Lei 14.451/2022 (Quóruns Rápidos), Lei 13.874/2019, Código Civil Arts. 1.052 a 1.087',
    keyProtections: [
      'Quórum de maioria absoluta para abertura célere de filiais em outros estados',
      'Blindagem de bens pessoais dos administradores contra passivo trabalhista e fiscal',
      'Regras claras para aporte de capital de giro e integralização de estoque',
      'Direito de preferência e trava de cessão de cotas a terceiros'
    ],
    recommendedClauses: ['cl-quorum-lei14451', 'cl-art50-lle', 'cl-cpc-784-assinatura', 'cl-nao-concorrencia-1147'],
    suggestedRedesimEvents: ['101', '102', '211', '244'],
    sampleStructureSummary: '1. Denominação & Filiais -> 2. Capital Operacional -> 3. Gestão e Quóruns Lei 14.451 -> 4. Blindagem Patrimonial Art 50 -> 5. Preferência e Transferência de Cotas'
  },
  {
    id: 'mod-reestruturacao-transformacao',
    title: 'Instrumento de Transformação Societária e Consolidação DREI',
    complexity: 'avancada',
    complexityLabel: 'Avançada / Reorganização Societária',
    specialty: 'reestruturacao_ma',
    specialtyLabel: 'Reestruturação Societária, Fusão & Transformação',
    description: 'Instrumento completo de transformação de tipo jurídico (EI para LTDA, SLU para LTDA ou LTDA para S/A Fechada) com consolidação integral em conformidade com a IN DREI 81/2020.',
    targetAudience: 'Empresas em expansão, entrada de novos investidores e regularização de acervo.',
    legalFramework: 'Código Civil, Art. 1.113 a 1.115; IN DREI 81/2020 (Anexo V); Lei 6.404/76',
    keyProtections: [
      'Sucessão patrimonial integral sem solução de continuidade da personalidade',
      'Manutenção de todas as obrigações tributárias, trabalhistas e creditícias',
      'Consolidação contratual limpa e numerada exigida pelas Juntas Comerciais',
      'Cláusula de declaração de desimpedimento do Art. 1.011 do CC'
    ],
    recommendedClauses: ['cl-quorum-lei14451', 'cl-stj-1056', 'cl-art50-lle', 'cl-cpc-784-assinatura'],
    suggestedRedesimEvents: ['225', '210', '211', '248'],
    sampleStructureSummary: '1. Preâmbulo da Transformação -> 2. Da Justificativa & Acervo Líquido -> 3. Da Transição sem Dissolução -> 4. Do Novo Estatuto/Contrato Consolidado -> 5. Ratificação Geral'
  }
];

// -------------------------------------------------------------------------------------
// 3. MINI-VADE MECUM CONTEXTUAL SOCIETÁRIO E FORENSE
// -------------------------------------------------------------------------------------
export const VADE_MECUM_DATABASE: VadeMecumArticle[] = [
  {
    id: 'vm-cc-977',
    lawCode: 'CC',
    lawName: 'Código Civil (Lei 10.406/2002)',
    articleReference: 'Art. 977',
    topic: 'Sociedade entre Cônjuges',
    heading: 'Possibilidade e Limites de Sociedade entre Marido e Mulher',
    legalText: 'Faculta-se aos cônjuges contratar sociedade, entre si ou com terceiros, desde que não tenham casado no regime da comunhão universal de bens, ou no da separação obrigatória.',
    practicalCommentary: 'Verificar rigorosamente a certidão de casamento dos sócios. Se casados em Comunhão Universal ou Separação Obrigatória, a Junta Comercial emitirá exigência obstativa imediata.',
    jurisprudentialImpact: 'DREI e Juntas Comerciais: Caso ocorra vedação, os cônjuges devem optar pela alteração judicial do regime de bens ou entrada via holding interposta.',
    correlatedKeywords: ['cônjuge', 'casamento', 'regime de bens', 'comunhão universal', 'separação obrigatória', 'sócios casados']
  },
  {
    id: 'vm-cc-978',
    lawCode: 'CC',
    lawName: 'Código Civil (Lei 10.406/2002)',
    articleReference: 'Art. 978',
    topic: 'Alienação de Imóveis sem Outorga Conjugal',
    heading: 'Desnecessidade de Vênia Conjugal pelo Empresário Individual/Sócio',
    legalText: 'O empresário casado pode, sem necessidade de outorga conjugal, qualquer que seja o regime de bens, alienar os imóveis que integrem o patrimônio da empresa ou gravá-los de ônus real.',
    practicalCommentary: 'Garante agilidade nos atos societários e de alienação patrimonial imobiliária pertencente ao acervo da empresa sem dependência de anuência de cônjuge.',
    jurisprudentialImpact: 'STJ e CNJ reconhecem a plena eficácia da disposição patrimonial da pessoa jurídica sem intervenção conjugal.',
    correlatedKeywords: ['vênia conjugal', 'outorga uxória', 'alienação de imóveis', 'patrimônio da empresa']
  },
  {
    id: 'vm-cc-1007',
    lawCode: 'CC',
    lawName: 'Código Civil (Lei 10.406/2002)',
    articleReference: 'Art. 1.007',
    topic: 'Distribuição de Lucros e Perdas',
    heading: 'Validade da Distribuição Desproporcional de Resultados',
    legalText: 'Salvo estipulação em contrário, o sócio participa dos lucros e das perdas, na proporção das respectivas quotas, mas só pode ser estipulada a exclusão de sócio da comunhão dos lucros ou da das perdas se a todos for assegurado um quinhão.',
    practicalCommentary: 'Permite remunerar sócios operacionais com lucros superiores à sua participação societária, desde que nenhum sócio seja leoninamente excluído (pacto leonino é nulo).',
    jurisprudentialImpact: 'Receita Federal / CARF (Solução de Consulta Cosit nº 25/2014): A distribuição desproporcional é 100% isenta de IRPF desde que prevista no Contrato Social.',
    correlatedKeywords: ['distribuição desproporcional', 'lucros e perdas', 'pacto leonino', 'isenção de irpf', 'pró-labore']
  },
  {
    id: 'vm-cc-1028',
    lawCode: 'CC',
    lawName: 'Código Civil (Lei 10.406/2002)',
    articleReference: 'Art. 1.028',
    topic: 'Falecimento de Sócio e Sucessão',
    heading: 'Regra de Continuidade e Liquidação das Quotas',
    legalText: 'No caso de morte de sócio, liquidar-se-á sua quota, salvo: I - se o contrato dispuser diferentemente; II - se os sócios remanescentes optarem pela dissolução da sociedade; III - se, por acordo com os herdeiros, regular-se a substituição do sócio falecido.',
    practicalCommentary: 'A regra geral é a NÃO entrada de herdeiros. O contrato deve detalhar expressamente como será feito o cálculo dos haveres (Balanço de Determinação) e o parcelamento.',
    jurisprudentialImpact: 'STJ Tema 1.056: O critério padrão para liquidação de quotas na ausência de cláusula expressa é o valor patrimonial a valor de mercado dos bens.',
    correlatedKeywords: ['morte de sócio', 'falecimento', 'herdeiros', 'apuração de haveres', 'dissolução parcial']
  },
  {
    id: 'vm-cc-1052',
    lawCode: 'CC',
    lawName: 'Código Civil (Lei 10.406/2002)',
    articleReference: 'Art. 1.052, § 1º e § 2º',
    topic: 'Sociedade Limitada Unipessoal (SLU)',
    heading: 'Constituição de Sociedade Limitada por 1 Única Pessoa',
    legalText: 'Na sociedade limitada, a responsabilidade de cada sócio é restrita ao valor de suas quotas, mas todos respondem solidariamente pela integralização do capital social. § 1º A sociedade limitada pode ser constituída por 1 (uma) ou mais pessoas. § 2º Se for unipessoal, aplicar-se-ão ao documento de constituição do sócio único, no que couber, as disposições sobre o contrato social.',
    practicalCommentary: 'Substituiu a extinta EIRELI sem exigir capital mínimo de 100 salários mínimos, conferindo responsabilidade limitada ao titular.',
    jurisprudentialImpact: 'DREI 81/2020: Minuta de SLU segue as mesmas regras de proteção e consolidação da LTDA plural.',
    correlatedKeywords: ['SLU', 'unipessoal', 'sociedade limitada', 'integralização', 'responsabilidade limitada']
  },
  {
    id: 'vm-cc-1057',
    lawCode: 'CC',
    lawName: 'Código Civil (Lei 10.406/2002)',
    articleReference: 'Art. 1.057',
    topic: 'Cessão e Transferência de Quotas',
    heading: 'Direito de Oposição e Preferência entre Sócios',
    legalText: 'Na omissão do contrato, o sócio pode ceder sua quota, total ou parcialmente, a quem seja sócio, independentemente de audiência dos outros, ou a estranho, se não houver oposição de titulares de mais de um quarto do capital social.',
    practicalCommentary: 'O contrato social moderno deve sempre prever o Direito de Preferência com prazo estrito (ex: 30 dias) e condições de preço antes de qualquer oferta a terceiros.',
    jurisprudentialImpact: 'Evita a entrada forçada de concorrentes ou pessoas estranhas com affectio societatis rompido.',
    correlatedKeywords: ['cessão de quotas', 'direito de preferência', 'oposição de sócios', 'transferência']
  },
  {
    id: 'vm-cc-1085',
    lawCode: 'CC',
    lawName: 'Código Civil (Lei 10.406/2002)',
    articleReference: 'Art. 1.085',
    topic: 'Exclusão Extrajudicial de Sócio',
    heading: 'Expulsão por Justa Causa e Descumprimento Grave',
    legalText: 'Ressalvado o disposto no art. 1.030, quando a maioria dos sócios, representativa de mais da metade do capital social, entender que um ou mais sócios estão pondo em risco a continuidade da empresa, em virtude de atos de inegável gravidade, poderá excluí-los da sociedade, mediante alteração do contrato social, desde que prevista neste a exclusão por justa causa.',
    practicalCommentary: 'ATENÇÃO CRÍTICA: A exclusão extrajudicial na Junta Comercial SÓ É VÁLIDA se estiver expressamente autorizada no texto do Contrato Social.',
    jurisprudentialImpact: 'STJ e DREI exigem reunião convocada com prazo de defesa prévia ao sócio excluído para evitar anulação judicial da alteração.',
    correlatedKeywords: ['exclusão extrajudicial', 'justa causa', 'falta grave', 'expulsão de sócio']
  },
  {
    id: 'vm-cpc-599',
    lawCode: 'CPC',
    lawName: 'Código de Processo Civil (Lei 13.105/2015)',
    articleReference: 'Arts. 599 a 609',
    topic: 'Ação de Dissolução Parcial de Sociedade',
    heading: 'Rito Processual e Critérios de Liquidação de Quotas',
    legalText: 'A ação de dissolução parcial de sociedade pode ter por objeto: I - a resolução da sociedade empresária contratual ou simples em relação a um sócio; II - a apuração dos haveres do sócio falecido, excluído ou que exerceu o direito de retirada.',
    practicalCommentary: 'O Art. 606 determina que a apuração de haveres definirá o valor patrimonial com base no balanço de determinação, respeitando o que estiver no contrato social.',
    jurisprudentialImpact: 'Se o Contrato Social contiver cláusula expressa e detalhada de apuração e prazo, o juiz é obrigado a seguir o contrato e não impor perícias genéricas.',
    correlatedKeywords: ['dissolução parcial', 'apuração de haveres cpc', 'art. 599 cpc', 'balanço de determinação cpc']
  },
  {
    id: 'vm-lc123-3',
    lawCode: 'LC123',
    lawName: 'Lei Complementar nº 123/2006 (Estatuto da Micro e Pequena Empresa)',
    articleReference: 'Art. 3º e 18',
    topic: 'Porte Empresarial e Simples Nacional',
    heading: 'Enquadramento de ME e EPP e Vedações ao Regime',
    legalText: 'Consideram-se microempresas (ME) a sociedade que aufira receita bruta igual ou inferior a R$ 360.000,00 e empresas de pequeno porte (EPP) aquela com receita entre R$ 360.000,01 e R$ 4.800.000,00.',
    practicalCommentary: 'Não pode ser ME/EPP ou aderir ao Simples Nacional sociedade de que participe outra pessoa jurídica ou cujo sócio more no exterior.',
    jurisprudentialImpact: 'Dispensas contratuais do Art. 70: MEs e EPPs são dispensadas da realização de reuniões solenes e publicação de balanços em Diário Oficial.',
    correlatedKeywords: ['ME', 'EPP', 'Simples Nacional', 'LC 123/2006', 'receita bruta', 'dispensa de publicação']
  },
  {
    id: 'vm-stf-796',
    lawCode: 'STF',
    lawName: 'Supremo Tribunal Federal',
    articleReference: 'Tema de Repercussão Geral 796',
    topic: 'Imunidade de ITBI em Integralização',
    heading: 'Alcance da Imunidade Tributária no Capital Social Subscrito',
    legalText: 'A imunidade em relação ao ITBI, prevista no inciso I do § 2º do art. 156 da CF/88, não alcança o valor dos bens que exceder o limite do capital social a ser integralizado.',
    practicalCommentary: 'A integralização de bens imóveis até o limite do valor do capital social subscrito é 100% imune de ITBI. Se houver reserva de ágio, apenas a diferença sofre incidência.',
    jurisprudentialImpact: 'Precedente vinculante para todos os municípios brasileiros e cartórios de registro de imóveis.',
    correlatedKeywords: ['Tema 796 STF', 'ITBI', 'imunidade tributária', 'holding imobiliária', 'capital subscrito']
  }
];

// -------------------------------------------------------------------------------------
// 4. PRESETS DO MOTOR DE MODELAGEM INTELIGENTE REDESIM
// -------------------------------------------------------------------------------------
export interface RedesimPreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  targetMode: 'abertura' | 'alteracao' | 'transformacao' | 'acordo_socios' | 'mutuo_conversivel' | 'distrato';
  events: string[];
  suggestedNatureza: 'SLU' | 'LTDA' | 'SA' | 'EI' | 'SOCIEDADE_SIMPLES';
  defaultClausesToEnable: {
    consolidacaoDrei: boolean;
    apuracaoHaveresSTJ: boolean;
    autonomiaPatrimonialArt50: boolean;
    direitoPreferenciaTagAlong: boolean;
    deadlockShotgun: boolean;
    distribuicaoDesproporcional: boolean;
    arbitragemCamara: boolean;
    naoConcorrencia: boolean;
    imunidadeITBIImoveis: boolean;
    assinaturaDigitalICP: boolean;
    gravamesSucessivos: boolean;
    conselhoConsultivo: boolean;
  };
  sampleNotice: string;
}

export const REDESIM_SMART_PRESETS: RedesimPreset[] = [
  {
    id: 'preset-abertura-blindada',
    name: 'Constituição Originária com Blindagem Patrimonial 360°',
    badge: 'Abertura Matriz',
    description: 'Abertura oficial de sociedade limitada plural ou unipessoal, com inclusão de blindagem Art. 50 CC, quóruns Lei 14.451/22 e assinatura digital ICP-Brasil.',
    targetMode: 'abertura',
    events: ['101'],
    suggestedNatureza: 'LTDA',
    defaultClausesToEnable: {
      consolidacaoDrei: true,
      apuracaoHaveresSTJ: true,
      autonomiaPatrimonialArt50: true,
      direitoPreferenciaTagAlong: true,
      deadlockShotgun: false,
      distribuicaoDesproporcional: true,
      arbitragemCamara: false,
      naoConcorrencia: true,
      imunidadeITBIImoveis: false,
      assinaturaDigitalICP: true,
      gravamesSucessivos: false,
      conselhoConsultivo: false
    },
    sampleNotice: 'Pré-configura evento 101 da REDESIM, Viabilidade Municipal e Coletor DBE para constituição na Junta Comercial.'
  },
  {
    id: 'preset-entrada-saida-socios',
    name: 'Cessão de Quotas, Saída e Entrada Simultânea de Sócios',
    badge: 'Eventos 247 + 248',
    description: 'Alteração contratual completa com quitação mista dos sócios retirantes, admissão de novos integrantes, redistribuição do quadro societário e consolidação integral.',
    targetMode: 'alteracao',
    events: ['247', '248', '249'],
    suggestedNatureza: 'LTDA',
    defaultClausesToEnable: {
      consolidacaoDrei: true,
      apuracaoHaveresSTJ: true,
      autonomiaPatrimonialArt50: true,
      direitoPreferenciaTagAlong: true,
      deadlockShotgun: true,
      distribuicaoDesproporcional: true,
      arbitragemCamara: false,
      naoConcorrencia: true,
      imunidadeITBIImoveis: false,
      assinaturaDigitalICP: true,
      gravamesSucessivos: false,
      conselhoConsultivo: false
    },
    sampleNotice: 'Gera as cláusulas específicas de quitação recíproca dos cedentes e declarações desimpedimento dos adquirentes.'
  },
  {
    id: 'preset-aumento-capital-imoveis',
    name: 'Aumento de Capital com Imóveis & Imunidade ITBI (Tema 796 STF)',
    badge: 'Evento 211',
    description: 'Integralização de imóveis no capital social, com discriminação de matrículas, cartórios competentes e cláusula expressa de imunidade tributária perante a Fazenda.',
    targetMode: 'alteracao',
    events: ['211'],
    suggestedNatureza: 'LTDA',
    defaultClausesToEnable: {
      consolidacaoDrei: true,
      apuracaoHaveresSTJ: true,
      autonomiaPatrimonialArt50: true,
      direitoPreferenciaTagAlong: true,
      deadlockShotgun: false,
      distribuicaoDesproporcional: true,
      arbitragemCamara: false,
      naoConcorrencia: false,
      imunidadeITBIImoveis: true,
      assinaturaDigitalICP: true,
      gravamesSucessivos: true,
      conselhoConsultivo: false
    },
    sampleNotice: 'Serve como título hábil registral perante Cartórios de Registro de Imóveis (RGI).'
  },
  {
    id: 'preset-alteracao-cadastral-cnae',
    name: 'Alteração Completa de Objeto (CNAEs), Razão Social e Endereço',
    badge: 'Eventos 210 + 220 + 230 + 244',
    description: 'Reestruturação cadastral da empresa com atualização de razão social, nome fantasia, endereço sede e inclusão de novas atividades econômicas.',
    targetMode: 'alteracao',
    events: ['210', '220', '230', '244'],
    suggestedNatureza: 'LTDA',
    defaultClausesToEnable: {
      consolidacaoDrei: true,
      apuracaoHaveresSTJ: true,
      autonomiaPatrimonialArt50: true,
      direitoPreferenciaTagAlong: true,
      deadlockShotgun: false,
      distribuicaoDesproporcional: true,
      arbitragemCamara: false,
      naoConcorrencia: false,
      imunidadeITBIImoveis: false,
      assinaturaDigitalICP: true,
      gravamesSucessivos: false,
      conselhoConsultivo: false
    },
    sampleNotice: 'Exige Viabilidade prévia aprovada e DBE com eventos cadastrais integrados.'
  },
  {
    id: 'preset-transformacao-tipo',
    name: 'Transformação de Tipo Societário (EI / SLU para LTDA Plural)',
    badge: 'Evento 225',
    description: 'Instrumento trifásico de transformação do tipo jurídico nos termos do Art. 1.113 do Código Civil, sem interrupção das operações e com consolidação formal.',
    targetMode: 'transformacao',
    events: ['225', '210', '211', '248'],
    suggestedNatureza: 'LTDA',
    defaultClausesToEnable: {
      consolidacaoDrei: true,
      apuracaoHaveresSTJ: true,
      autonomiaPatrimonialArt50: true,
      direitoPreferenciaTagAlong: true,
      deadlockShotgun: true,
      distribuicaoDesproporcional: true,
      arbitragemCamara: false,
      naoConcorrencia: true,
      imunidadeITBIImoveis: false,
      assinaturaDigitalICP: true,
      gravamesSucessivos: false,
      conselhoConsultivo: false
    },
    sampleNotice: 'Garante o enquadramento perfeito na Junta Comercial com aprovação de acervo e estatuto unificado.'
  },
  {
    id: 'preset-distrato-dissolucao',
    name: 'Distrato Social & Encerramento Regular com Quitação',
    badge: 'Evento 517',
    description: 'Encerramento regular da sociedade com nomeação de liquidante, prestação de contas do acervo líquido, quitação mista e indicação de guarda de livros fiscais por 5 anos.',
    targetMode: 'distrato',
    events: ['517'],
    suggestedNatureza: 'LTDA',
    defaultClausesToEnable: {
      consolidacaoDrei: false,
      apuracaoHaveresSTJ: false,
      autonomiaPatrimonialArt50: true,
      direitoPreferenciaTagAlong: false,
      deadlockShotgun: false,
      distribuicaoDesproporcional: false,
      arbitragemCamara: false,
      naoConcorrencia: false,
      imunidadeITBIImoveis: false,
      assinaturaDigitalICP: true,
      gravamesSucessivos: false,
      conselhoConsultivo: false
    },
    sampleNotice: 'Baixa direta na Junta Comercial e cancelamento de CNPJ perante a Receita Federal.'
  }
];
