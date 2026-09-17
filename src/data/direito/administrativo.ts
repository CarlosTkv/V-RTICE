import { DireitoItem } from '../direitoData';

export const DIREITO_ADMINISTRATIVO: DireitoItem[] = [
  {
    id: 'dir-adm-01',
    title: 'Processo Administrativo Fiscal (PAF): Impugnação de Auto de Infração, Suspensão de Exigibilidade e CARF',
    ramo: 'administrativo',
    ramoLabel: 'Direito Administrativo',
    subtopico: 'Contencioso Administrativo & Defesa Tributária',
    dispositivoLegal: 'Decreto nº 70.235/1972, Art. 151, III do CTN e Portaria MF nº 1.634/2023',
    doutrinaReferencia: 'Marçal Justen Filho, James Marins ("Direito Processual Tributário Brasileiro"), Maria Sylvia Zanella Di Pietro, Celso Antônio Bandeira de Mello',
    jurisprudenciaTese: {
      tribunal: 'STF',
      numeroTemaOuSumula: 'Súmula Vinculante 28 STF e Súmula Vinculante 21 STF',
      enunciado: 'É inconstitucional a exigência de depósito ou arrolamento prévio de dinheiro ou bens para o seguimento de recurso administrativo. A impugnação e o recurso voluntário tempestivos no PAF suspendem a exigibilidade do crédito tributário sem qualquer garantia.',
      impactoEmpresarial: 'Garante o direito constitucional de ampla defesa e contraditório sem desembolso financeiro nem bloqueio de caixa até o julgamento definitivo pela CSRF/CARF.'
    },
    analiseCriticaDoutrinaria: `O PAF constitui a instância de autocontrole de legalidade dos atos de lançamento da Administração Fazendária:
1. Efeitos da Impugnação Administrativa Tempestiva (Prazo de 30 dias - Decreto 70.235/72):
- Suspensão Automática da Exigibilidade (Art. 151, III do CTN): Impede a inscrição do débito em Dívida Ativa, o ajuizamento de execução fiscal, a inclusão no Cadin/Serasa e garante a emissão da CPEN (Art. 206 do CTN);
- Devolutividade Plena: O órgão julgador deve reexaminar toda a matéria fática, documental e jurídica, inclusive realizando perícias contábeis e diligências fiscais.
2. Estrutura do Contencioso Administrativo Federal:
- 1ª Instância: Delegacias de Julgamento da Receita Federal do Brasil (DRJ);
- 2ª Instância: Conselho Administrativo de Recursos Fiscais (CARF) - Composição paritária com conselheiros representantes da Fazenda Nacional e dos Contribuintes;
- Instância Especial: Câmara Superior de Recursos Fiscais (CSRF) - Uniformização de divergências entre turmas ordinárias.
3. Fim do Voto de Qualidade Pró-Fisco / Retomada Regulamentada pela Lei 14.689/2023:
- Nos empates pró-fisco resolvidos pelo voto de qualidade do presidente de turma, a lei estabeleceu a exclusão de todas as multas e o cancelamento da representação fiscal para fins penais.`,
    parecerJuridicoComentado: `Esgotar a via administrativa antes de recorrer ao Judiciário é estratégica fundamental para as empresas, pois permite o debate técnico de teses contábeis e fiscais com julgadores altamente especializados sem o risco de pagamento de custas judiciais ou honorários sucumbenciais de até 20%.`,
    teseDefensivaOuRecuperacao: {
      tese: 'Nulidade do Auto de Infração por Cerceamento de Defesa e Falta de Motivação',
      fundamentacao: 'Art. 59 do Decreto nº 70.235/1972 c/c Art. 142 do CTN',
      raciocinioDefensivo: 'Arguição preliminar de nulidade do lançamento demonstrando que o auditor fiscal arbitrou receitas sem intimar previamente o contribuinte para prestar esclarecimentos ou apresentar livros fiscais.'
    },
    tags: ['PAF', 'Decreto 70235/72', 'CARF', 'Suspensão de Exigibilidade', 'Art 151 CTN', 'Súmula Vinculante 21'],
    linkConhecimentoId: 'con-trib-fed-03'
  },
  {
    id: 'dir-adm-02',
    title: 'Nova Lei de Licitações (Lei nº 14.133/2021): Habilitação Fiscal, Jurídica e Qualificação Econômico-Financeira',
    ramo: 'administrativo',
    ramoLabel: 'Direito Administrativo',
    subtopico: 'Contratações Públicas & Conformidade Licitatória',
    dispositivoLegal: 'Arts. 62 a 70 da Lei nº 14.133/2021 (Nova Lei de Licitações e Contratos Administrativos)',
    doutrinaReferencia: 'Marçal Justen Filho ("Comentários à Lei de Licitações e Contratações Administrativas"), Joel de Menezes Niebuhr, Hely Lopes Meirelles',
    jurisprudenciaTese: {
      tribunal: 'TCU',
      numeroTemaOuSumula: 'Acórdão TCU 1.214/2013-Plenário e Súmula 289 TCU',
      enunciado: 'A exigência de índices econômico-financeiros (Liquidez Geral, Liquidez Corrente e Solvência Geral) e de patrimônio líquido mínimo em editais de licitação deve ser estritamente proporcional ao objeto, sendo vedada a imposição de requisitos excessivos que restrinjam a competitividade do certame.',
      impactoEmpresarial: 'Impede que editais direcionados desclassifiquem empresas saudáveis com base em critérios contábeis abusivos ou desvinculados do valor real do contrato.'
    },
    analiseCriticaDoutrinaria: `A Lei 14.133/21 consolidou os requisitos formais de qualificação:
1. Habilitação Fiscal, Social e Trabalhista (Art. 68):
- Inscrição no CNPJ e no cadastro de contribuintes estadual ou municipal;
- Regularidade perante a Fazenda Federal, Estadual e Municipal do domicílio ou sede do licitante;
- Regularidade relativa à Seguridade Social (INSS) e ao FGTS;
- Certidão Negativa de Débitos Trabalhistas (CNDT) perante a Justiça do Trabalho (Lei 12.440/11);
- Cumprimento do disposto no inciso XXXIII do Art. 7º da CF/88 (proibição de trabalho infantil).
2. Qualificação Econômico-Financeira (Art. 69):
- Apresentação de Balanço Patrimonial e DRE dos últimos 2 exercícios sociais devidamente registrados na Junta Comercial (ou transmitidos via ECD);
- Índices de Liquidez (ILG, ILC, ISG) superiores a 1,0; caso os índices sejam inferiores, admite-se a exigência alternativa de Capital Social Mínimo ou Patrimônio Líquido de até 10% do valor estimado da contratação;
- Certidão Negativa de Falência expedida pelo distribuidor da sede da pessoa jurídica.
3. Possibilidade de Participação de Empresas em Recuperação Judicial:
- A jurisprudência pacífica do STJ e TCU admite a participação de empresas em recuperação judicial, desde que apresentem certidão de acolhimento do plano pelo juízo competente e laudo de viabilidade econômico-financeira.`,
    parecerJuridicoComentado: `As empresas licitantes devem manter seu balanço societário rigorosamente alinhado aos padrões da ECD no SPED, pois a Lei 14.133/21 prioriza a verificação automática de dados em registros públicos eletrônicos (Portal Nacional de Contratações Públicas - PNCP).`,
    teseDefensivaOuRecuperacao: {
      tese: 'Impugnação de Edital por Exigências de Habilitação Restritivas e Desproporcionais',
      fundamentacao: 'Art. 69 c/c Art. 9º, I da Lei nº 14.133/2021',
      raciocinioDefensivo: 'Protocolar impugnação tempestiva ao edital demonstrando que a fixação de índices de liquidez desmedidos ou garantia financeira exorbitante viola o princípio da ampla competitividade.'
    },
    tags: ['Lei 14133/21', 'Licitações', 'Habilitação Fiscal', 'CNDT', 'Qualificação Econômica', 'PNCP', 'TCU'],
    linkConhecimentoId: 'con-soc-03'
  },
  {
    id: 'dir-adm-03',
    title: 'Tratamento Favorecido a MEs e EPPs em Licitações Públicas (Arts. 42 a 49 da LC 123/06 e Nova Lei 14.133/21)',
    ramo: 'administrativo',
    ramoLabel: 'Direito Administrativo',
    subtopico: 'Estatuto da Micro e Pequena Empresa & Compras Governamentais',
    dispositivoLegal: 'Arts. 42 a 49 da Lei Complementar nº 123/2006 e Art. 4º da Lei nº 14.133/2021',
    doutrinaReferencia: 'Maria Sylvia Zanella Di Pietro, Marçal Justen Filho, Jessé Torres Pereira Junior',
    jurisprudenciaTese: {
      tribunal: 'TCU',
      numeroTemaOuSumula: 'Acórdão TCU 2.622/2013-Plenário',
      enunciado: 'O benefício do prazo de regularização fiscal e trabalhista tardia (5 dias úteis, prorrogáveis por mais 5) assegurado às MEs e EPPs pelo Art. 43 da LC 123/06 é direito subjetivo líquido e certo da empresa vencedora, não podendo o pregoeiro inabilitá-la de plano.',
      impactoEmpresarial: 'Garante que pequenas empresas com certidões vencidas possam disputar o certame, ofertar o melhor lance e só então sanar a pendência tributária para homologação do contrato.'
    },
    analiseCriticaDoutrinaria: `O estatuto das MEs e EPPs estabelece privilégios concorrenciais compulsórios nas compras governamentais:
1. Comprovação Tardia de Regularidade Fiscal e Trabalhista (Art. 43 da LC 123/06):
- A ME ou EPP deve apresentar todas as certidões exigidas, mesmo que com restrição fiscal ou débito pendente;
- Sagrando-se vencedora do certame, o pregoeiro concede o prazo de 5 (cinco) dias úteis, prorrogável por igual período a critério da Administração, para regularização das pendências fiscais/trabalhistas e emissão das CNDs/CPENs definitivas.
2. Critério de Desempate Ficto (Art. 44 da LC 123/06):
- Na modalidade pregão/concorrência eletrônica, considera-se empate quando as propostas apresentadas por MEs ou EPPs forem até 5% superiores (ou até 10% em outras modalidades presenciais) à proposta mais bem classificada de grande empresa;
- A ME/EPP mais bem classificada tem a prerrogativa legal de cobrir o lance da concorrente (ofertando lance inferior), sagrando-se vencedora imediata da licitação.
3. Exclusividade e Cotas Reservadas (Art. 48 da LC 123/06):
- Licitações exclusivas para MEs/EPPs em itens ou lotes com valor estimado de até R$ 80.000,00;
- Reserva de cota de até 25% do objeto para MEs/EPPs na contratação de bens de natureza divisível.`,
    parecerJuridicoComentado: `O gozo desses privilégios pressupõe a efetiva observância do limite de receita bruta anual de até R$ 4,8 milhões e ausência de impedimentos do Art. 3º, § 4º da LC 123/06 (ex: sócio PJ ou participação societária que supere o faturamento global), sob pena de enquadramento em fraude à licitação (Art. 337-L do Código Penal).`,
    teseDefensivaOuRecuperacao: {
      tese: 'Concessão Compulsória do Prazo de Regularização Fiscal Tardia',
      fundamentacao: 'Art. 43, § 1º da Lei Complementar nº 123/2006',
      raciocinioDefensivo: 'Impetrar Mandado de Segurança com pedido liminar contra ato de pregoeiro que inabilitar a ME/EPP vencedora sem conceder os 5 dias úteis legais para regularização das certidões fiscais.'
    },
    tags: ['LC 123/06', 'Empate Ficto', 'Regularização Tardia', 'Licitação Exclusiva', 'Direito das MEs', 'Art 43 LC 123'],
    linkConhecimentoId: 'con-trib-fed-01'
  },
  {
    id: 'dir-adm-04',
    title: 'Ilegalidade da Retenção de Pagamentos pelo Poder Público por Irregularidade Fiscal Superveniente',
    ramo: 'administrativo',
    ramoLabel: 'Direito Administrativo',
    subtopico: 'Execução de Contratos Administrativos & Vedação ao Enriquecimento Sem Causa',
    dispositivoLegal: 'Art. 37, XXI da CF/88, Arts. 92, XVI e 137 da Lei nº 14.133/2021 e Art. 884 do Código Civil',
    doutrinaReferencia: 'Marçal Justen Filho, Celso Antônio Bandeira de Mello, Hely Lopes Meirelles, Odete Medauar',
    jurisprudenciaTese: {
      tribunal: 'STJ',
      numeroTemaOuSumula: 'Tema Repetitivo e Jurisprudência Consolidada da 1ª Seção do STJ (REsp 1.834.707/DF e REsp 1.313.659/RS)',
      enunciado: 'É manifestamente ilegal a retenção do pagamento devido à empresa contratada em virtude da ausência ou perda superveniente da regularidade fiscal (CNDs/FGTS), tendo em vista que o serviço foi efetivamente prestado ou a mercadoria entregue, sob pena de caracterizar enriquecimento ilícito da Administração Pública.',
      impactoEmpresarial: 'Garante o recebimento imediato das faturas e notas fiscais emitidas contra o Poder Público, proibindo o calote administrativo sob pretexto de certidões fiscais vencidas.'
    },
    analiseCriticaDoutrinaria: `A jurisprudência dos Tribunais Superiores e da Corte de Contas é uníssona em repudiar a retenção de pagamentos:
1. Natureza do Contrato e Vedação ao Enriquecimento Sem Causa (Art. 884 do Código Civil):
- Uma vez executado o objeto licitado (prestado o serviço, construída a obra ou entregue o material) e atestada a medição pela fiscalização, surge para a Administração o dever jurídico incondicional de pagar o preço pactuado;
- A retenção do numerário equivale a confisco ou apropriação indevida do trabalho de outrem, violando os princípios da boa-fé, da moralidade administrativa e da legalidade.
2. Meios Legítimos à Disposição do Poder Público:
- Caso a contratada perca a CND durante a execução contratual, a Administração pode instaurar Processo Administrativo para aplicação de penalidade contratual (advertência/multa) ou até rescindir o contrato para o futuro (Art. 137 da Lei 14.133/21);
- O Poder Público NÃO pode se valer de autotutela coercitiva para reter o dinheiro da fatura já liquidada;
- A cobrança de eventuais tributos devidos pela empresa deve ser promovida pela Procuradoria Fazendária competente através dos meios legais de execução fiscal e não por retenção administrativa privada.`,
    parecerJuridicoComentado: `Empresas fornecedoras do Estado que sofrerem bloqueio ou retenção de pagamento de faturas por certidão negativa vencida devem notificar formalmente o gestor do contrato em 48h e, persistindo a recusa, impetrar Mandado de Segurança cumulado com pedido de liminar para liberação imediata da ordem bancária.`,
    teseDefensivaOuRecuperacao: {
      tese: 'Liberação Imediata de Pagamento por Serviço Executado e Vedação ao Enriquecimento Ilícito',
      fundamentacao: 'Jurisprudência Vinculante do STJ (REsp 1.834.707) c/c Art. 884 do CC',
      raciocinioDefensivo: 'Demonstrar nos autos a nota fiscal devidamente atestada pelo fiscal do contrato, comprovando que a retenção é sanção atípica e ilegal não autorizada pelo ordenamento jurídico.'
    },
    tags: ['Retenção Ilegal', 'Direito Administrativo', 'STJ', 'TCU', 'Enriquecimento Ilícito', 'Fatura Pública', 'Art 884 CC'],
    linkConhecimentoId: 'con-soc-03'
  },
  {
    id: 'dir-adm-05',
    title: 'Processo Administrativo Sancionador (PAS), Dosimetria das Penas e Declaração de Inidoneidade na Lei 14.133/21',
    ramo: 'administrativo',
    ramoLabel: 'Direito Administrativo',
    subtopico: 'Poder Punitivo Estatal & Sanções Administrativas',
    dispositivoLegal: 'Arts. 155 a 163 da Lei nº 14.133/2021 e Lei nº 9.784/1999 (Processo Administrativo Federal)',
    doutrinaReferencia: 'Marçal Justen Filho, Floriano de Azevedo Marques Neto, Alice Gonzalez Borges',
    jurisprudenciaTese: {
      tribunal: 'STJ',
      numeroTemaOuSumula: 'Súmula 333 STJ e REsp 1.732.148/DF',
      enunciado: 'A declaração de inidoneidade para licitar ou contratar com a Administração Pública produz efeitos ex nunc e abrange todos os órgãos e entes federativos (União, Estados, DF e Municípios), exigindo para sua aplicação a instauração de prévio processo administrativo com contraditório substancial e competência exclusiva do Ministro de Estado ou Secretário de Governo.',
      impactoEmpresarial: 'Garante o controle judicial sobre o rigor desmedido de sanções administrativas, exigindo estrita proporcionalidade entre a infração contratual e a penalidade imposta.'
    },
    analiseCriticaDoutrinaria: `O regime sancionatório da Lei 14.133/21 estabelece gradação taxativa das sanções:
1. Rol de Sanções Administrativas (Art. 156):
- Advertência: Para inexecução parcial leve sem dano relevante à Administração;
- Multa Compensatória ou Moratória: Calculada na forma do edital ou contrato (vedada a fixação de percentual abusivo);
- Impedimento de Licitar e Contratar (Art. 156, III): Prazo de até 3 (três) anos, com efeitos restritos ao ente federativo sancionador;
- Declaração de Inidoneidade (Art. 156, IV): Sanção mais gravosa do direito administrativo, com prazo de 3 (três) a 6 (seis) anos, impedindo a empresa de contratar com QUALQUER ente público do país.
2. Requisitos de Validade do Processo Sancionador (Art. 158):
- Instauração por Comissão Processante composta por 2 ou mais servidores estáveis;
- Intimação pessoal da empresa com descrição pormenorizada dos fatos imputados;
- Prazo de 15 (quinze) dias úteis para apresentação de defesa prévia escrita e especificação de provas periciais/testemunhais;
- Obrigatoriedade de parecer jurídico conclusivo do órgão de assessoramento antes da decisão final da autoridade superior.`,
    parecerJuridicoComentado: `Na defesa corporativa em sede de PAS, é indispensável construir a prova de excludentes de responsabilidade contratual, tais como caso fortuito, força maior, fato da administração (atrasos na liberação do local da obra/ordem de serviço) ou quebra do equilíbrio econômico-financeiro por inflação imprevisível de insumos.`,
    teseDefensivaOuRecuperacao: {
      tese: 'Desproporcionalidade da Sanção e Excludente por Fato da Administração',
      fundamentacao: 'Art. 156, § 1º da Lei nº 14.133/2021 c/c Art. 393 do Código Civil',
      raciocinioDefensivo: 'Comprovar que o atraso no cronograma da obra decorreu de demora do órgão público na aprovação dos projetos executivos ou emissão de licenças ambientais, descaracterizando a culpa do contratado.'
    },
    tags: ['PAS', 'Sanções Administrativas', 'Declaração de Inidoneidade', 'Lei 14133/21', 'Dosimetria', 'Cerceamento de Defesa'],
    linkConhecimentoId: 'con-soc-05'
  },
  {
    id: 'dir-adm-06',
    title: 'Desconsideração da Personalidade Jurídica no Direito Administrativo (Art. 160 da Lei 14.133/21 & TCU)',
    ramo: 'administrativo',
    ramoLabel: 'Direito Administrativo',
    subtopico: 'Extensão de Sanções e Fraude a Licitações',
    dispositivoLegal: 'Art. 160 da Lei nº 14.133/2021 e Art. 14 da Lei nº 12.846/2013 (Lei Anticorrupção)',
    doutrinaReferencia: 'Marçal Justen Filho, Rafael Oliveira, Irene Nohara',
    jurisprudenciaTese: {
      tribunal: 'TCU',
      numeroTemaOuSumula: 'Acórdão 2.843/2019-TCU-Plenário',
      enunciado: 'A desconsideração da personalidade jurídica no âmbito administrativo para estender sanções de inidoneidade aos sócios ou empresas do mesmo grupo econômico exige o contraditório prévio em processo administrativo específico, vedada a aplicação de penalidade automática.',
      impactoEmpresarial: 'Protege sócios e outras empresas saudáveis do grupo contra contaminação por sanções de inidoneidade sem o devido processo legal.'
    },
    analiseCriticaDoutrinaria: `A Lei 14.133/21 regulamentou a desconsideração no âmbito licitatório:
1. Requisitos Legais (Art. 160): A personalidade jurídica poderá ser desconsiderada sempre que utilizada com abuso de direito para facilitar, encobrir ou dissimular a prática dos atos ilícitos previstos nesta Lei ou para provocar confusão patrimonial;
2. Consequências da Desconsideração: Extensão de todos os efeitos das sanções aplicadas à pessoa jurídica aos seus administradores e sócios com poderes de administração, a pessoa jurídica sucessora ou a empresa do mesmo ramo com os mesmos sócios.`,
    parecerJuridicoComentado: `Defesas administrativas contra o estendimento de inidoneidade devem enfatizar a ausência de confusão patrimonial e demonstrar que a nova sociedade possui objeto social e capital social autônomos.`,
    teseDefensivaOuRecuperacao: {
      tese: 'Nulidade da Extensão Automatizada de Inidoneidade sem Contraditório Prévio aos Sócios',
      fundamentacao: 'Art. 160, Parágrafo Único da Lei 14.133/21 c/c Art. 5º, LIV e LV da CF/88',
      raciocinioDefensivo: 'Apresentar recurso alegando a inaplicabilidade de sanção a terceiro sem notificação individualizada em processo administrativo próprio.'
    },
    tags: ['Desconsideração Administrativa', 'Lei 14133/21', 'TCU', 'Lei Anticorrupção', 'Sanções Societárias'],
    linkConhecimentoId: 'con-soc-01'
  },
  {
    id: 'dir-adm-07',
    title: 'Arbitragem, Mediação e Acordos de Leniência na Administração Pública (Arts. 151 a 154 da Lei 14.133/21)',
    ramo: 'administrativo',
    ramoLabel: 'Direito Administrativo',
    subtopico: 'Meios Alternativos de Resolução de Controvérsias e Compliance Público',
    dispositivoLegal: 'Arts. 151 a 154 da Lei nº 14.133/2021 e Lei nº 13.140/2015 (Lei de Mediação)',
    doutrinaReferencia: 'Gustavo Binenbojm, Alexandre Santos de Aragão, Cesar Pereira',
    jurisprudenciaTese: {
      tribunal: 'STJ',
      numeroTemaOuSumula: 'REsp 1.348.658/NO',
      enunciado: 'É plenamente legítima a cláusula compromissória de arbitragem em contratos administrativos para dirimir litígios sobre direitos patrimoniais disponíveis (equilíbrio econômico, reajuste de preços e aplicação de multas).',
      impactoEmpresarial: 'Agilidade e especialização técnica na solução de conflitos bilionários de infraestrutura e contratos de concessão pública.'
    },
    analiseCriticaDoutrinaria: `A consensualidade na Administração Pública contemporânea:
1. Resolução Alternativa de Disputas (ADR): A nova lei permite o uso de conciliação, mediação, comitês de resolução de disputas (Dispute Boards) e arbitragem;
2. Dispute Boards: Painéis técnicos neutros acompanham a execução de obras de grande porte e decidem controvérsias operacionais em tempo real, sem paralisar o empreendimento.`,
    parecerJuridicoComentado: `Cláusulas de Dispute Board e Arbitragem devem ser formalmente requeridas pelas empresas contratadas por ocasião da assinatura do termo contratual com o Estado.`,
    teseDefensivaOuRecuperacao: {
      tese: 'Instauração de Dispute Board para Solução de Desequilíbrio em Obra Pública',
      fundamentacao: 'Art. 151 da Lei nº 14.133/2021',
      raciocinioDefensivo: 'Submeter o pleito de reequilíbrio econômico ao comitê de prevenção de disputas previamente cadastrado no contrato administrativo.'
    },
    tags: ['Arbitragem', 'Contratos Administrativos', 'Dispute Board', 'Mediação', 'Lei 14133/21'],
    linkConhecimentoId: 'con-soc-03'
  },
  {
    id: 'dir-adm-08',
    title: 'Improbidade Administrativa e a Exigência de Dolo Específico (Lei 14.230/21 & Tema 1.199 STF)',
    ramo: 'administrativo',
    ramoLabel: 'Direito Administrativo',
    subtopico: 'Lei de Improbidade Administrativa Reformada & Proteção aos Contratantes',
    dispositivoLegal: 'Lei nº 8.429/1992 (com redação dada pela Lei nº 14.230/2021)',
    doutrinaReferencia: 'Waldo Fazzio Júnior, Emerson Garcia, Rogério Pacheco Alves',
    jurisprudenciaTese: {
      tribunal: 'STF',
      numeroTemaOuSumula: 'Tema 1.199 STF (ARE 843.989/PR)',
      enunciado: 'A revogação da modalidade culposa do ato de improbidade administrativa promovida pela Lei 14.230/21 aplica-se retroativamente aos atos praticados na vigência do texto anterior sem condenação transitada em julgado, sendo indispensável a demonstração de dolo específico.',
      impactoEmpresarial: 'Extinção de ações de improbidade promovidas contra empresários que contrataram com o Poder Público de boa-fé, mas sofreram acusações por meras irregularidades formais.'
    },
    analiseCriticaDoutrinaria: `A reforma da LIA (Lei 14.230/21) reestruturou o direito sancionatório de improbidade:
1. Eliminação da Improbidade Culposa: Nenhum ato praticado com mera negligência, imprudência ou imperícia configura improbidade;
2. Exigência de Dolo Específico: Vontade livre e consciente de alcançar o resultado ilícito tipificado nos Arts. 9º, 10 e 11 da LIA;
3. Prescrição Intercorrente (Art. 23, § 5º): Prescreve a pretensão punitiva em 4 (quatro) anos contados da propositura da ação ou interrupção procedimental.`,
    parecerJuridicoComentado: `Empresas processadas sob a vigência antiga por supostos atos culposos devem requerer a extinção imediata do processo com resolução do mérito perante o Poder Judiciário.`,
    teseDefensivaOuRecuperacao: {
      tese: 'Extinção de Ação de Improbidade por Ausência de Dolo Específico e Aplicação Retroativa',
      fundamentacao: 'Tema 1.199 STF c/c Lei nº 14.230/2021',
      raciocinioDefensivo: 'Apresentar contestação/recurso postulando o julgamento improcedente da demanda diante do afastamento legal da culpa genérica.'
    },
    tags: ['Improbidade Administrativa', 'Lei 14230/21', 'Tema 1199 STF', 'Dolo Específico', 'Retroatividade'],
    linkConhecimentoId: 'con-soc-04'
  }
];
