import { DireitoItem } from '../direitoData';

export const DIREITO_PENAL: DireitoItem[] = [
  {
    id: 'dir-pen-01',
    title: 'Crimes Contra a Ordem Tributária (Arts. 1º e 2º da Lei nº 8.137/1990) e a Súmula Vinculante nº 24 do STF',
    ramo: 'penal',
    ramoLabel: 'Direito Penal Empresarial',
    subtopico: 'Direito Penal Econômico & Criminal Compliance',
    dispositivoLegal: 'Arts. 1º e 2º da Lei nº 8.137/1990 e Art. 83 da Lei nº 9.430/1996',
    doutrinaReferencia: 'Cezar Roberto Bitencourt ("Direito Penal Econômico"), Pierpaolo Cruz Bottini, Heloisa Estellita, Juarez Cirino dos Santos',
    jurisprudenciaTese: {
      tribunal: 'STF',
      numeroTemaOuSumula: 'Súmula Vinculante nº 24 do STF',
      enunciado: 'Não se tipifica crime material contra a ordem tributária, previsto no art. 1º, incisos I a IV, da Lei nº 8.137/1990, antes do lançamento definitivo do tributo pela autoridade administrativa.',
      impactoEmpresarial: 'Tranca qualquer inquérito policial ou ação penal enquanto houver discussão pendente de recurso voluntário no CARF ou no PAF, blindando a liberdade dos sócios durante a fase administrativa.'
    },
    analiseCriticaDoutrinaria: `A Lei 8.137/90 divide os crimes tributários em duas categorias com regimes jurídicos distintos:
1. Crimes Materiais / de Resultado (Art. 1º da Lei 8.137/90 - Pena: 2 a 5 anos de reclusão):
- Condutas: Omitir informação/falsificar declarações fiscais, fraudar a fiscalização inserindo elementos inexatos em livros, falsificar notas fiscais ou utilizar documentos falsos com o resultado de SUPRIMIR ou REDUZIR tributo;
- Condição Objetiva de Punibilidade (SV 24 do STF): O crime só se consuma com o encerramento do processo administrativo e lançamento definitivo do crédito tributário. Se o CARF anular o auto de infração, o crime jamais existiu;
2. Crimes Formais / de Mera Conduta (Art. 2º da Lei 8.137/90 - Pena: 6 meses a 2 anos de detenção):
- Condutas: Deixar de fornecer nota fiscal quando obrigatório, fazer declaração falsa sobre rendas sem supressão consumada, ou deixar de recolher tributo descontado de terceiro no prazo legal (Art. 2º, II);
- Não se submetem à Súmula Vinculante 24 (consumam-se com a prática do ato).`,
    parecerJuridicoComentado: `Caso seja instaurado inquérito policial por suposto crime fiscal enquanto tramita impugnação no CARF ou DRJ, a defesa deve impetrar Habeas Corpus imediatamente perante o Tribunal competente para trancamento do procedimento criminal com base na Súmula Vinculante 24.`,
    teseDefensivaOuRecuperacao: {
      tese: 'Falta de Justa Causa para a Ação Penal por Ausência de Lançamento Definitivo',
      fundamentacao: 'Súmula Vinculante nº 24 do STF c/c Art. 395, III do Código de Processo Penal',
      raciocinioDefensivo: 'Apresentar certidão de tramitação de recurso administrativo pendente de julgamento perante o CARF para anular o recebimento da denúncia por ausência de condição de procedibilidade.'
    },
    tags: ['Crimes Tributários', 'Lei 8137/90', 'Súmula Vinculante 24', 'CARF', 'Habeas Corpus', 'Direito Penal Econômico'],
    linkConhecimentoId: 'con-fisc-05'
  },
  {
    id: 'dir-pen-02',
    title: 'Apropriação Indébita Previdenciária (Art. 168-A do Código Penal) e Inexigibilidade de Conduta Diversa',
    ramo: 'penal',
    ramoLabel: 'Direito Penal Empresarial',
    subtopico: 'Delitos Previdenciários & Causa Supralegal de Exclusão da Culpabilidade',
    dispositivoLegal: 'Art. 168-A do Código Penal (com redação da Lei nº 9.983/2000)',
    doutrinaReferencia: 'Guilherme de Souza Nucci, Rogério Sanches Cunha, Luiz Flávio Gomes, Damásio de Jesus',
    jurisprudenciaTese: {
      tribunal: 'STJ',
      numeroTemaOuSumula: 'Súmula 18 STJ e Jurisprudência Pacificada da 5ª e 6ª Turmas do STJ',
      enunciado: 'A grave crise econômico-financeira da pessoa jurídica, comprovada por perícia contábil que ateste a impossibilidade de manter o pagamento dos salários e o recolhimento das contribuições retidas, configura a causa supralegal de exclusão da culpabilidade por Inexigibilidade de Conduta Diversa.',
      impactoEmpresarial: 'Absolvição criminal do empresário que, em situação de iminente colapso e penhora de contas, priorizou pagar os salários dos funcionários em detrimento do repasse do INSS retido.'
    },
    analiseCriticaDoutrinaria: `O tipo penal do Art. 168-A do Código Penal pune a conduta de "deixar de repassar à previdência social as contribuições recolhidas dos contribuintes, no prazo e forma legal":
1. Elementos Típicos:
- Crime omissivo próprio: O não repasse dos valores descontados da remuneração dos empregados ou prestadores no prazo legal;
- Não exige o dolo específico de animus rem sibi habendi (apropriação pessoal do dinheiro para enriquecimento próprio do gestor), bastando o dolo genérico segundo a jurisprudência dominante;
2. A Tese da Inexigibilidade de Conduta Diversa (Estado de Necessidade Exculpante):
- A culpabilidade do administrador fica excluída quando demonstrado que a empresa enfrentava dificuldades financeiras intransponíveis, restando-lhe apenas o dilema moral e econômico de:
  a) Pagar a folha de salários para alimentação dos trabalhadores; OU
  b) Recolher a guia de INSS para os cofres públicos;
- Requisitos Probatórios Estritos: A mera alegação de crise não basta. Exige-se perícia contábil judicial que comprove protestos de títulos, devolução de cheques, saldo bancário zerado, execução de dívidas e inexistência de distribuição de lucros aos sócios durante o período.`,
    parecerJuridicoComentado: `Empresários que enfrentem crise financeira e atrasem o repasse de contribuições devem documentar minuciosamente o direcionamento integral dos recursos disponíveis para o pagamento prioritário da folha salarial líquida dos empregados, para formar a prova pericial de sua defesa penal.`,
    teseDefensivaOuRecuperacao: {
      tese: 'Absolvição Sumária por Inexigibilidade de Conduta Diversa',
      fundamentacao: 'Art. 386, VI do Código de Processo Penal c/c Jurisprudência do STJ',
      raciocinioDefensivo: 'Apresentar laudo pericial contábil demonstrando a paralisação do fluxo de caixa e ausência de saídas financeiras para os sócios, comprovando que todo o numerário foi consumido na manutenção dos postos de trabalho.'
    },
    tags: ['Art 168-A CP', 'Apropriação Indébita Previdenciária', 'Inexigibilidade de Conduta Diversa', 'Crise Financeira', 'Absolvição Criminal'],
    linkConhecimentoId: 'con-trab-02'
  },
  {
    id: 'dir-pen-03',
    title: 'Tipicidade no Não Recolhimento de ICMS Declarado Próprio (RHC 163.334/SC - STF) e o Dolo de Apropriação',
    ramo: 'penal',
    ramoLabel: 'Direito Penal Empresarial',
    subtopico: 'Direito Penal Tributário & Inadimplemento Fiscal vs. Crime',
    dispositivoLegal: 'Art. 2º, II da Lei nº 8.137/1990 e Art. 5º, LXVII da Constituição Federal',
    doutrinaReferencia: 'Pierpaolo Cruz Bottini, Luís Roberto Barroso, Juarez Cirino dos Santos, Miguel Reale Júnior',
    jurisprudenciaTese: {
      tribunal: 'STF',
      numeroTemaOuSumula: 'Tema 999 STF / RHC 163.334/SC (Plenário do STF)',
      enunciado: 'O não recolhimento de ICMS cobrado do adquirente e devidamente declarado pelo contribuinte configura crime do art. 2º, II da Lei 8.137/90 somente quando praticado de forma contumaz e com inequívoco dolo de apropriação.',
      impactoEmpresarial: 'Diferenciação jurídica vital: o mero inadimplente eventual ou de boa-fé em crise não pode ser criminalizado, sob pena de violação à proibição constitucional de prisão por dívida.'
    },
    analiseCriticaDoutrinaria: `O histórico julgamento do RHC 163.334 pelo Supremo Tribunal Federal fixou balizas rígidas para evitar a criminalização generalizada da atividade empresarial:
1. Requisitos Cumulativos para a Tipificação Penal do ICMS Próprio Declarado:
- Contumácia Delitiva: O contribuinte deve ser um devedor contumaz sistemático (que adota a falta de pagamento do imposto como modelo predatório de negócio para concorrer deslealmente);
- Inadimplemento Injustificado: Ausência de justificativa econômico-financeira plausível;
- Dolo Específico de Apropriação: Vontade consciente e deliberada de não recolher o valor cobrado do adquirente na operação;
2. Proteção ao Devedor Eventual e em Dificuldade Financeira:
- O empresário que declara formalmente suas vendas e guias na EFD-ICMS mas atrasa o recolhimento por problema momentâneo de liquidez comete mero ILÍCITO CIVIL-TRIBUTÁRIO (sujeito à execução fiscal e multas moratórias), mas NÃO comete crime algum.`,
    parecerJuridicoComentado: `Na resposta à acusação criminal em denúncias de ICMS declarado, a defesa deve demonstrar a ausência de dolo de apropriação através da correta escrituração fiscal (demonstrando que nada foi ocultado do Fisco) e a existência de esforços pretéritos de parcelamento da dívida.`,
    teseDefensivaOuRecuperacao: {
      tese: 'Atipicidade da Conduta por Inadimplemento Eventual e Ausência de Dolo Contumaz',
      fundamentacao: 'RHC 163.334/SC do STF c/c Art. 386, III do Código de Processo Penal',
      raciocinioDefensivo: 'Demonstrar nos autos que o réu declarou espontaneamente todo o ICMS nas guias do SPED e que o inadimplemento foi pontual em meses de queda abrupta de faturamento, inexistindo contumácia dolosa.'
    },
    tags: ['RHC 163334 STF', 'ICMS Declarado', 'Art 2º II Lei 8137', 'Devedor Contumaz', 'Prisão por Dívida', 'Atipicidade'],
    linkConhecimentoId: 'con-trib-est-01'
  },
  {
    id: 'dir-pen-04',
    title: 'Extinção da Punibilidade pelo Pagamento Integral e Suspensão da Pretensão Punitiva pelo Parcelamento (Art. 9º)',
    ramo: 'penal',
    ramoLabel: 'Direito Penal Empresarial',
    subtopico: 'Extinção da Punibilidade & Parcelamentos Especiais',
    dispositivoLegal: 'Art. 9º da Lei nº 10.684/2003, Art. 83 da Lei nº 9.430/1996 e Art. 68 da Lei nº 11.941/2009',
    doutrinaReferencia: 'Cezar Roberto Bitencourt, Rogério Greco, Paulo José da Costa Jr., Renato Brasileiro de Lima',
    jurisprudenciaTese: {
      tribunal: 'STJ',
      numeroTemaOuSumula: 'Súmula 555 STJ e Jurisprudência Vinculante do STF (HC 81.929/SP e AP 516/DF)',
      enunciado: 'O pagamento integral do débito tributário extingue a punibilidade dos crimes tipificados na Lei nº 8.137/1990 e no Art. 168-A do CP A QUALQUER TEMPO, mesmo após o trânsito em julgado da condenação penal. O parcelamento suspende o curso da prescrição e a pretensão punitiva estatal.',
      impactoEmpresarial: 'Garantia absoluta de que a quitação ou adesão a parcelamento fiscal (como Transação da PGFN ou Refis) blinda o réu contra qualquer pena privativa de liberdade.'
    },
    analiseCriticaDoutrinaria: `O legislador brasileiro privilegiou de forma inequívoca a arrecadação tributária em detrimento do encarceramento do empresário:
1. Pagamento Integral do Tributo (Art. 9º, § 2º da Lei 10.684/03):
- Extingue de pleno direito a punibilidade dos crimes contra a ordem tributária e previdenciários;
- Não há limite temporal: Pode ser realizado na fase policial, antes da denúncia, durante a instrução criminal, em grau de recurso ou até mesmo durante a execução penal da pena;
2. Parcelamento do Débito Tributário (Art. 9º, caput e § 1º da Lei 10.684/03):
- A inclusão do débito fiscal em qualquer modalidade de parcelamento formal (Ordinário, Transação PGFN, PERT, Refis) antes do trânsito em julgado SUSPENDE a pretensão punitiva do Estado e suspende a contagem do prazo de prescrição penal;
- Cumpridas todas as parcelas até a liquidação final, o juiz criminal deve declarar extinta a punibilidade e determinar o arquivamento definitivo da ação penal sem antecedentes criminais.`,
    parecerJuridicoComentado: `Sempre que uma empresa ou seus administradores forem notificados de Representação Fiscal para Fins Penais, a adesão tempestiva a programa de parcelamento ou transação tributária perante a PGFN/Receita Federal constitui o meio mais seguro e célere de paralisar imediatamente qualquer risco penal.`,
    teseDefensivaOuRecuperacao: {
      tese: 'Declaração de Extinção da Punibilidade por Quitação Integral do Crédito Tributário',
      fundamentacao: 'Art. 9º, § 2º da Lei nº 10.684/2003 c/c Art. 107, do Código Penal',
      raciocinioDefensivo: 'Juntar aos autos da ação penal a Certidão de Quitação expedida pela Procuradoria-Geral da Fazenda Nacional comprovando a liquidação integral do débito objeto da denúncia, requerendo a extinção imediata da punibilidade.'
    },
    tags: ['Extinção da Punibilidade', 'Art 9º Lei 10684/03', 'Parcelamento Tributário', 'Transação PGFN', 'Quitação do Débito', 'Refis'],
    linkConhecimentoId: 'con-soc-03'
  },
  {
    id: 'dir-pen-05',
    title: 'Fraude à Execução, Crime de Duplicata Simulada (Art. 172 CP) e Prevenção à Lavagem de Dinheiro (Lei 9.613/98)',
    ramo: 'penal',
    ramoLabel: 'Direito Penal Empresarial',
    subtopico: 'Fraudes Financeiras, Delitos Contra o Patrimônio & Compliance Antilavagem',
    dispositivoLegal: 'Art. 171, 172 e 179 do Código Penal e Lei nº 9.613/1998 (Lei de Lavagem de Dinheiro)',
    doutrinaReferencia: 'Pierpaolo Cruz Bottini, Sergio Fernando Moro ("Crime de Lavagem de Dinheiro"), Guilherme Nucci, René Ariel Dotti',
    jurisprudenciaTese: {
      tribunal: 'STJ',
      numeroTemaOuSumula: 'Súmula 375 STJ e Súmula 17 STJ',
      enunciado: 'O reconhecimento da fraude à execução e da má-fé na alienação de bens do devedor depende do registro prévio da penhora do bem alienado ou da prova inequívoca de má-fé do terceiro adquirente.',
      impactoEmpresarial: 'Proteção a negócios jurídicos e compra e venda de ativos corporativos contra anulações fraudulentas infundadas.'
    },
    analiseCriticaDoutrinaria: `O ecossistema penal tutela a boa-fé nas transações financeiras e patrimoniais da empresa:
1. Crime de Duplicata Simulada ou "Fria" (Art. 172 do Código Penal - Pena: 2 a 4 anos de reclusão):
- Emitir fatura, duplicata mercantil ou nota de serviço que não corresponda à mercadoria realmente vendida ou ao serviço efetivamente prestado;
- Crime formal que se consuma com a mera colocação da duplicata em circulação ou envio a desconto bancário em factorings ou fundos FIDCs, independentemente de prejuízo financeiro final;
2. Fraude à Execução Penal vs. Civil (Art. 179 do CP e Art. 792 do CPC):
- Art. 179 do CP: Alienar, desviar, destruir ou onerar bens depois de validamente citado em ação judicial, reduzindo-se intencionalmente à insolvência para frustrar a execução (exige processo em curso e citação válida);
3. Lei de Lavagem de Dinheiro (Lei 9.613/98 com alterações da Lei 12.683/12):
- Ocultar ou dissimular a natureza, origem, localização, disposição ou movimentação de bens ou valores provenientes, direta ou indiretamente, de qualquer infração penal (inclusive crimes tributários);
- Deveres de Compliance do Art. 9º: Empresas de factoring, auditoria, consultoria e imobiliárias são obrigadas a manter cadastro atualizado de clientes e comunicar transações suspeitas ao COAF.`,
    parecerJuridicoComentado: `Empresas devem instituir rigorosos controles internos de conciliação entre pedidos de compra, faturas fiscais eletrônicas e relatórios de entrega para assegurar que nenhum título de crédito seja emitido sem respectivo lastro material incontroverso.`,
    teseDefensivaOuRecuperacao: {
      tese: 'Atipicidade do Delito de Duplicata Simulada por Ausência de Dolo e Existência de Vício Comercial Sanável',
      fundamentacao: 'Art. 172 do Código Penal c/c Art. 386, III do Código de Processo Penal',
      raciocinioDefensivo: 'Apresentar a ordem de serviço e comunicação de cancelamento imediato de nota fiscal por desacordo comercial legítimo, demonstrando que a emissão da duplicata decorreu de erro administrativo e não de fraude dolosa.'
    },
    tags: ['Duplicata Simulada', 'Art 172 CP', 'Fraude à Execução', 'Lavagem de Dinheiro', 'Lei 9613/98', 'COAF', 'Compliance'],
    linkConhecimentoId: 'con-soc-05'
  },
  {
    id: 'dir-pen-06',
    title: 'Acordo de Não Persecução Penal (ANPP - Art. 28-A CPP) em Crimes Fiscais e Societários',
    ramo: 'penal',
    ramoLabel: 'Direito Penal Empresarial',
    subtopico: 'Justiça Consensual & Mitigação de Riscos Criminais',
    dispositivoLegal: 'Art. 28-A do Código de Processo Penal (incluído pela Lei nº 13.964/2019 - Pacote Anticrime)',
    doutrinaReferencia: 'Renato Brasileiro de Lima, Alexandre de Moraes da Rosa, Gustavo Badaró',
    jurisprudenciaTese: {
      tribunal: 'STF',
      numeroTemaOuSumula: 'Tema 1.161 STF (HC 191.464/SP) e Súmula Vinculante 56',
      enunciado: 'É cabível o Acordo de Não Persecução Penal (ANPP) nos crimes fiscais, ambientais e societários sem violência ou grave ameaça e com pena mínima inferior a 4 anos, estendendo-se aos processos em andamento antes do trânsito em julgado.',
      impactoEmpresarial: 'Possibilita o encerramento definitivo de investigações ou processos criminais fiscais mediante ressarcimento do dano e prestação de serviços.'
    },
    analiseCriticaDoutrinaria: `O ANPP transformou a estratégia de defesa penal corporativa:
1. Requisitos Cumulativos (Art. 28-A do CPP):
- Confissão formal e circunstanciada da infração penal;
- Crime praticado sem violência ou grave ameaça a pessoa;
- Pena mínima cominada inferior a 4 (quatro) anos;
- Medida necessária e suficiente para reprovação e prevenção do crime.
2. Condições Propostas pelo Ministério Público:
- Reparação do dano ou restituição da coisa à vítima (ou pagamento/parcelamento do tributo sonegado);
- Renúncia voluntária a bens e direitos indicados como proveito do crime;
- Prestação de serviços à comunidade ou pagamento de prestação pecuniária a entidade pública.`,
    parecerJuridicoComentado: `Caso a acusação penal não possa ser extinta pela atipicidade, a pactuação de ANPP junto ao Ministério Público previne os custos reputacionais de uma instrução penal longa e afasta qualquer condenação.`,
    teseDefensivaOuRecuperacao: {
      tese: 'Direito Subjetivo à Proposta de ANPP com Suspensão do Processo Penal',
      fundamentacao: 'Art. 28-A do CPP c/c Tema 1.161 do STF',
      raciocinioDefensivo: 'Requerer o sobrestamento da ação penal e a remessa dos autos ao Ministério Público para formalização dos termos do Acordo de Não Persecução Penal.'
    },
    tags: ['ANPP', 'Art 28-A CPP', 'Pacote Anticrime', 'Justiça Consensual', 'Crimes Fiscais'],
    linkConhecimentoId: 'con-soc-03'
  },
  {
    id: 'dir-pen-07',
    title: 'Crimes Contra o Sistema Financeiro Nacional (Lei 7.492/86) e Operações Sem Autorização do BACEN',
    ramo: 'penal',
    ramoLabel: 'Direito Penal Empresarial',
    subtopico: 'Delitos Financeiros & Ilícitos do Mercado de Capital',
    dispositivoLegal: 'Lei nº 7.492/1986 (Lei dos Crimes Colarinho Branco) e Lei nº 13.506/2017',
    doutrinaReferencia: 'Rodolfo Tigre Maia, Cezar Roberto Bitencourt, José Paulo Baltazar Júnior',
    jurisprudenciaTese: {
      tribunal: 'STJ',
      numeroTemaOuSumula: 'Súmula 122 STJ e Súmula 96 STJ',
      enunciado: 'Compete à Justiça Federal o processo e julgamento dos crimes contra o Sistema Financeiro Nacional (Lei 7.492/86) e dos crimes de lavagem de dinheiro quando praticados em detrimento de bens, serviços ou interesses da União ou de autarquias federais (BACEN/CVM).',
      impactoEmpresarial: 'Preservação da competência e rigor na fiscalização de fundos de investimento, fintechs e factorings.'
    },
    analiseCriticaDoutrinaria: `Tipos penais de maior relevância corporativa:
1. Gestão Temerária vs. Gestão Fraudulenta (Art. 4º da Lei 7.492/86):
- Gestão Fraudulenta (Pena: 3 a 12 anos): Prática de atos reiterados com ardil, engano ou falsidade na condução de instituição financeira ou equiparada;
- Gestão Temerária (Pena: 2 a 8 anos): Tomada de riscos desmedidos e contrários às normas de prudência do BACEN, expondo a risco os ativos de terceiros.
2. Operação Financeira Não Autorizada (Art. 16 da Lei 7.492/86):
- Fazer operar instituição financeira sem a devida autorização do Banco Central do Brasil ou da Comissão de Valores Mobiliários (CVM).`,
    parecerJuridicoComentado: `Empresas que atuam no mercado de crédito (ESC, SCD, SEP, Fundos FIDC) devem obter rigorosa autorização de funcionamento e manter governança compatível com as diretrizes do Banco Central.`,
    teseDefensivaOuRecuperacao: {
      tese: 'Descaracterização de Instituição Financeira em Factoring Comercial Regular',
      fundamentacao: 'Art. 16 da Lei nº 7.492/1986 c/c Art. 386, III do CPP',
      raciocinioDefensivo: 'Demonstrar nos autos que a empresa operava estritamente no segmento de fomento mercantil com recursos próprios, sem captação de poupança pública.'
    },
    tags: ['Crimes Financeiros', 'Lei 7492/86', 'Gestão Fraudulenta', 'BACEN', 'CVM', 'Justiça Federal'],
    linkConhecimentoId: 'con-soc-04'
  },
  {
    id: 'dir-pen-08',
    title: 'Crimes Ambientais Empresariais e Responsabilidade Penal da Pessoa Jurídica (Lei 9.605/98 & STF)',
    ramo: 'penal',
    ramoLabel: 'Direito Penal Empresarial',
    subtopico: 'Direito Penal Ambiental & Tutela de Licenças de Operação',
    dispositivoLegal: 'Art. 225, § 3º da CF/88 e Arts. 2º, 3º e 54 da Lei nº 9.605/1998',
    doutrinaReferencia: 'Édis Milaré, Paulo Affonso Leme Machado, Vladimir Passos de Freitas',
    jurisprudenciaTese: {
      tribunal: 'STF',
      numeroTemaOuSumula: 'REsp 560.900/RH (Afastamento da Teoria da Dupla Imputação no STF e STJ)',
      enunciado: 'É possível a responsabilização penal da pessoa jurídica por crimes ambientais INDEPENDENTEMENTE da concomitante responsabilização da pessoa física dos seus administradores ou prepostos (Superação da Teoria da Dupla Imputação).',
      impactoEmpresarial: 'A pessoa jurídica pode figurar sozinha no polo passivo da ação penal ambiental, sujeitando-se a penas de multa, interdição temporária de direitos e prestação de serviços à comunidade.'
    },
    analiseCriticaDoutrinaria: `Mecanismo de imputação criminal às empresas:
1. Requisitos do Art. 3º da Lei 9.605/98:
- A infração deve ser cometida por decisão do seu representante legal ou contratual, ou de seu órgão colegiado;
- A infração deve ser praticada no interesse ou benefício da sua entidade.
2. Penas Aplicáveis à Pessoa Jurídica (Art. 21 da Lei 9.605/98):
- Multa pecuniária;
- Penas Restritivas de Direitos: Suspensão parcial ou total de atividades, interdição temporária de estabelecimento e proibição de contratar com o Poder Público e dele obter subsídios por até 5 anos.`,
    parecerJuridicoComentado: `Empresas de industrialização e agronegócio devem implementar Sistema de Gestão Ambiental (SGA) com certificação ISO 14001 e auditoria periódica de renovação de licenças ambientais.`,
    teseDefensivaOuRecuperacao: {
      tese: 'Atipicidade da Conduta por Regularidade de Licença Ambiental e Ausência de Benefício',
      fundamentacao: 'Art. 3º c/c Art. 54 da Lei nº 9.605/1998',
      raciocinioDefensivo: 'Apresentar a Licença de Operação válida expedida pelo órgão ambiental competente comprovando que os efluentes atendiam aos parâmetros legais.'
    },
    tags: ['Crimes Ambientais', 'Lei 9605/98', 'Responsabilidade da PJ', 'Licença Ambiental', 'ISO 14001'],
    linkConhecimentoId: 'con-fisc-05'
  }
];
