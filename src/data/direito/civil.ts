import { DireitoItem } from '../direitoData';

export const DIREITO_CIVIL: DireitoItem[] = [
  {
    id: 'dir-civ-01',
    title: 'Teoria Geral dos Contratos Empresariais: Boa-fé Objetiva, Deveres Anexos e Art. 421-A do Código Civil',
    ramo: 'civil',
    ramoLabel: 'Direito Civil Empresarial',
    subtopico: 'Direito Contratual Corporativo & Autonomia Privada',
    dispositivoLegal: 'Arts. 113, 421, 421-A e 422 do Código Civil (com alterações da Lei nº 13.874/2019)',
    doutrinaReferencia: 'Judith Martins-Costa ("A Boa-Fé no Direito Privado"), Caio Mário da Silva Pereira, Nelson Nery Junior',
    jurisprudenciaTese: {
      tribunal: 'STJ',
      numeroTemaOuSumula: 'REsp 1.839.814/SP e Enunciados da Jornada de Direito Comercial do CJF',
      enunciado: 'Nos contratos empresariais paritários e simétricos celebrados entre agentes de mercado, presume-se a paridade e a estipulação livre de riscos pelas partes, sendo excepcional e restrita a intervenção judicial para revisão de cláusulas pactuadas.',
      impactoEmpresarial: 'Conferência de máxima segurança jurídica aos contratos B2B, blindando cláusulas de limitação de responsabilidade, renúncia e penalidades livremente negociadas.'
    },
    analiseCriticaDoutrinaria: `O direito contratual empresarial rege-se pelo princípio da simetria e da intervenção mínima:
1. Os Três Postulados do Art. 421-A do Código Civil (Lei de Liberdade Econômica):
- Presunção de Paridade e Simetria entre as partes empresárias contratantes;
- Respeito à Alocação de Riscos pactuada: o juiz não pode redistribuir perdas financeiras assumidas expressamente no contrato;
- Revisão Contratual Excepcional e Limitada: Somente cabível em situações extraordinárias e imprevisíveis.
2. A Boa-Fé Objetiva e os Deveres Anexos ou Laterais de Conduta (Art. 422 do CC):
- Dever de Proteção e Cuidado: Evitar causar danos à integridade e ao patrimônio da outra parte;
- Dever de Informação e Transparência: Divulgação leal de fatos que influenciem o negócio;
- Dever de Lealdade e Cooperação: Atuar para que a outra parte atinja os fins econômicos legítimos do contrato.
3. Figuras Parcelares da Boa-Fé:
- Nemo Potest Venire Contra Factum Proprium (Proibição de comportamento contraditório);
- Supressio e Surrectio (Perda de um direito não exercido por longo tempo e nascimento de uma posição jurídica correlata);
- Tu Quoque (Vedação de exigir da outra parte o cumprimento de norma que você próprio descumpriu).`,
    parecerJuridicoComentado: `Na elaboração de minutas de contratos mercantis (fornecimento, representação, prestação de serviços, M&A), é fundamental detalhar cláusulas de matriz de riscos, limites máximos de indenização (cap de responsabilidade) e eleição de câmara arbitral para dirimir litígios complexos.`,
    teseDefensivaOuRecuperacao: {
      tese: 'Prevalência da Autonomia da Vontade e da Alocação de Riscos em Contrato B2B',
      fundamentacao: 'Art. 421-A, II do Código Civil',
      raciocinioDefensivo: 'Apresentar contestação refutando pedido de anulação de cláusula limitativa de indenização com fundamento na presunção de simetria e conhecimento técnico dos contratantes.'
    },
    tags: ['Contratos Empresariais', 'Art 421-A CC', 'Boa-fé Objetiva', 'Venire Contra Factum Proprium', 'Matriz de Riscos', 'B2B'],
    linkConhecimentoId: 'con-cont-01'
  },
  {
    id: 'dir-civ-02',
    title: 'Locação Comercial, Proteção ao Ponto Empresarial e Requisitos da Ação Renovatória (Lei nº 8.245/1991)',
    ramo: 'civil',
    ramoLabel: 'Direito Civil Empresarial',
    subtopico: 'Direito Imobiliário Corporativo & Fundo de Comércio',
    dispositivoLegal: 'Arts. 51, 52 e 71 da Lei nº 8.245/1991 (Lei do Inquilinato)',
    doutrinaReferencia: 'Sylvio Capanema de Souza ("Da Locação do Imóvel Urbano"), Fabio Ulhoa Coelho, Francisco Carlos Rocha de Barros',
    jurisprudenciaTese: {
      tribunal: 'STJ',
      numeroTemaOuSumula: 'Súmula 482 STJ e REsp 1.827.136/SP',
      enunciado: 'O prazo decadencial para ajuizamento da ação renovatória de locação empresarial é de 1 (um) ano a 6 (seis) meses antes do término do contrato em vigor, sendo improrrogável e insuscetível de suspensão ou interrupção.',
      impactoEmpresarial: 'Proteção compulsória do ponto comercial e do aviamento da empresa contra a retomada imotivada pelo proprietário do imóvel locado.'
    },
    analiseCriticaDoutrinaria: `A Lei de Locações protege o fundo de comércio criado pelo empresário locatário mediante o direito à renovação compulsória:
1. Requisitos Cumulativos da Ação Renovatória (Art. 51 da Lei 8.245/91):
- Contrato celebrado por escrito e com prazo determinado;
- Prazo mínimo do contrato a renovar de 5 (cinco) anos, admitida a soma de contratos escritos ininterruptos (acessio temporis);
- Exploração do mesmo ramo de comércio ou serviço pelo prazo mínimo e ininterrupto de 3 (três) anos no imóvel;
- Tempestividade da Ação: Distribuição no prazo fatal entre 1 ano e 6 meses antes do vencimento do contrato.
2. Exceções de Retomada pelo Locador (Art. 52):
- Realização de obras determinadas pelo Poder Público ou que aumentem substancialmente o valor do imóvel;
- Uso próprio ou transferência de comércio de cônjuge, ascendente ou descendente (vedado para o mesmo ramo do inquilino).
3. Indenização pela Perda do Ponto Comercial (Art. 52, § 3º):
- O locatário terá direito à indenização por perdas e danos e lucros cessantes se a renovação não se concretizar em razão de proposta de terceiro em melhores condições ou se o locador não der ao imóvel a destinação alegada no prazo de 3 meses.`,
    parecerJuridicoComentado: `O controle dos prazos contratuais de locação de galpões industriais, lojas de shopping e filiais deve ser rigorosamente automatizado no departamento jurídico, pois a perda do prazo de 6 meses extingue irremediavelmente o direito à renovação compulsória, sujeitando a empresa a despeito por denúncia vazia.`,
    teseDefensivaOuRecuperacao: {
      tese: 'Preenchimento Integral dos Requisitos do Art. 51 e Fixação do Aluguel de Mercado',
      fundamentacao: 'Art. 51 c/c Art. 71 da Lei nº 8.245/1991',
      raciocinioDefensivo: 'Apresentar certidões de cumprimento de todas as obrigações locatícias (IPTU, seguro de incêndio, comprovantes de quitação de aluguel e indicação de fiador idôneo) e laudo pericial imobiliário de valor locativo justo.'
    },
    tags: ['Locação Comercial', 'Ação Renovatória', 'Ponto Comercial', 'Lei 8245/91', 'Fundo de Comércio', 'Prazo Decadencial'],
    linkConhecimentoId: 'con-soc-01'
  },
  {
    id: 'dir-civ-03',
    title: 'Marco Legal das Garantias (Lei nº 14.711/2023) e Execução Extrajudicial da Alienação Fiduciária',
    ramo: 'civil',
    ramoLabel: 'Direito Civil Empresarial',
    subtopico: 'Direito das Garantias Reais & Crédito Imobiliário e Mobiliário',
    dispositivoLegal: 'Lei nº 14.711/2023, Lei nº 9.514/1997 e Decreto-Lei nº 911/1969',
    doutrinaReferencia: 'Melhim Namem Chalhub ("Alienação Fiduciária: Negócio Fiduciário"), Flávio Tartuce, Cristiano Chaves de Farias',
    jurisprudenciaTese: {
      tribunal: 'STF',
      numeroTemaOuSumula: 'Tema 982 STF (RE 860.631/SP)',
      enunciado: 'É constitucional o procedimento de execução extrajudicial da alienação fiduciária de bem imóvel nos termos da Lei nº 9.514/1997, não configurando violação ao devido processo legal, ao acesso à justiça ou ao contraditório.',
      impactoEmpresarial: 'Velocidade extrema na recuperação de garantias e redução expressiva do spread bancário em financiamentos corporativos lastreados em bens fiduciários.'
    },
    analiseCriticaDoutrinaria: `O Marco Legal das Garantias (Lei 14.711/23) reformulou o sistema de crédito e garantias no Brasil:
1. Desjudicialização da Execução de Garantias:
- Consolidação da propriedade fiduciária de imóveis diretamente nos Cartórios de Registro de Imóveis após notificação do devedor e decurso do prazo de purgação da mora de 15 dias;
- Extensão do procedimento extrajudicial para hipotecas e bens móveis nos Cartórios de Títulos e Documentos e Tabelionatos de Notas;
2. Recarregamento de Garantia e Garantia Compartilhada (Múltiplas Operações de Crédito):
- O mesmo imóvel dado em alienação fiduciária pode garantir novas operações de crédito contratadas com o mesmo credor fiduciário até o limite do valor de avaliação do bem;
- Instituição da Garantia Fiduciária Subsequente (em favor de múltiplos credores distintos com preferência temporal);
3. Agente de Garantias:
- Criação da figura do Agente de Garantias, pessoa física ou jurídica encarregada de registrar, administrar e excutir extrajudicialmente as garantias em favor de sindicatos de credores e debenturistas.`,
    parecerJuridicoComentado: `Na tomada de crédito bancário com garantia de alienação fiduciária, a empresa devedora deve atentar para as cláusulas de avaliação do imóvel para os 1º e 2º leilões extrajudiciais, a fim de evitar a arrematação do bem patrimonial por valor vil (inferior a 50% da avaliação).`,
    teseDefensivaOuRecuperacao: {
      tese: 'Nulidade do Leilão Extrajudicial por Falta de Intimação Pessoal sobre as Datas dos Leilões',
      fundamentacao: 'Art. 27, § 2º-A da Lei nº 9.514/1997 c/c Jurisprudência do STJ',
      raciocinioDefensivo: 'Ajuizar Ação Anulatória com pedido liminar comprovando que o credor fiduciário não notificou pessoalmente o devedor fiduciante acerca das datas, horários e locais dos leilões públicos, impedindo o exercício do direito de preferência.'
    },
    tags: ['Marco das Garantias', 'Alienação Fiduciária', 'Lei 14711/23', 'Tema 982 STF', 'Leilão Extrajudicial', 'Agente de Garantias'],
    linkConhecimentoId: 'con-soc-03'
  },
  {
    id: 'dir-civ-04',
    title: 'Responsabilidade Civil Empresarial: Lucros Cessantes, Perda de uma Chance e Duty to Mitigate the Loss',
    ramo: 'civil',
    ramoLabel: 'Direito Civil Empresarial',
    subtopico: 'Obrigações & Liquidação de Danos Patrimoniais',
    dispositivoLegal: 'Arts. 186, 389, 402 a 404 e 927 do Código Civil',
    doutrinaReferencia: 'Sergio Cavalieri Filho ("Programa de Responsabilidade Civil"), Gisela Sampaio da Cruz, Gustavo Tepedino, Fernando Noronha',
    jurisprudenciaTese: {
      tribunal: 'STJ',
      numeroTemaOuSumula: 'REsp 1.201.672/MS e Enunciado 169 da III Jornada de Direito Civil',
      enunciado: 'O princípio da boa-fé objetiva impõe ao credor o dever de mitigar o próprio prejuízo (Duty to Mitigate the Loss), devendo adotar medidas razoáveis para evitar o agravamento do dano causado pelo inadimplemento da outra parte, sob pena de redução proporcional da indenização.',
      impactoEmpresarial: 'Impede que empresas lesadas fiquem inertes aguardando o acúmulo astronômico de multas e prejuízos para cobrar da parte inadimplente.'
    },
    analiseCriticaDoutrinaria: `A reparação de danos em relações corporativas envolve conceitos técnicos rigorosos:
1. Dano Emergente vs. Lucros Cessantes (Art. 402 do Código Civil):
- Dano Emergente: O que a empresa efetivamente perdeu (despesas imediatas de reparo, substituição de insumos defeituosos, multas suportadas);
- Lucros Cessantes: O que a empresa razoavelmente deixou de lucrar em razão direta do evento lesivo (margem de contribuição de vendas frustradas, interrupção de linha de produção); exige prova contábil de frustração de ganho real e não mera expectativa hipotética.
2. Teoria da Perda de uma Chance (Perte d’une chance):
- Aplica-se quando a conduta ilícita de outrem retira da vítima a oportunidade real, séria e provável de obter uma vantagem econômica ou evitar um prejuízo;
- A indenização não corresponde ao valor integral da vantagem perdida, mas ao valor econômico da própria chance probabilística frustrada.
3. Duty to Mitigate the Loss (Dever de Mitigar o Próprio Dano):
- Se o credor for negligente e deixar o dano crescer desnecessariamente quando poderia ter contratado fornecedor substituto no mercado, o juiz reduzirá a indenização na proporção da omissão da vítima.`,
    parecerJuridicoComentado: `Em litígios indenizatórios entre empresas, a quantificação dos lucros cessantes exige perícia econômico-financeira fundamentada no histórico de DREs e fluxo de caixa da empresa, expurgando custos variáveis que não foram incorridos durante a paralisação.`,
    teseDefensivaOuRecuperacao: {
      tese: 'Limitação da Indenização por Violação ao Dever de Mitigar o Dano e Lucros Cessantes Hipotéticos',
      fundamentacao: 'Art. 402 e Art. 403 do Código Civil c/c Enunciado 169 da Jornada de Direito Civil',
      raciocinioDefensivo: 'Demonstrar na perícia contábil que a parte autora não tomou medidas disponíveis no mercado para substituir o produto e pleiteia lucros cessantes desprovidos de lastro probatório concreto.'
    },
    tags: ['Responsabilidade Civil', 'Lucros Cessantes', 'Duty to Mitigate', 'Perda de uma Chance', 'Dano Emergente', 'Art 402 CC'],
    linkConhecimentoId: 'con-cont-04'
  },
  {
    id: 'dir-civ-05',
    title: 'Exceção do Contrato Não Cumprido (Exceptio Non Adimpleti Contractus) e Teoria da Imprevisão (Arts. 476 a 480 CC)',
    ramo: 'civil',
    ramoLabel: 'Direito Civil Empresarial',
    subtopico: 'Inadimplemento das Obrigações & Resolução Contratual',
    dispositivoLegal: 'Arts. 476, 477, 478, 479 e 480 do Código Civil',
    doutrinaReferencia: 'Caio Mário da Silva Pereira, Pontes de Miranda, Maria Helena Diniz, Silvio de Salvo Venosa',
    jurisprudenciaTese: {
      tribunal: 'STJ',
      numeroTemaOuSumula: 'REsp 1.730.089/SP e Enunciado 366 da IV Jornada de Direito Civil',
      enunciado: 'Nos contratos bilaterais e sinalagmáticos, nenhum dos contratantes, antes de cumprida a sua obrigação, pode exigir o implemento da do outro. A alegação de exceção do contrato não cumprido exige proporcionalidade entre o descumprimento imputado e a prestação recusada.',
      impactoEmpresarial: 'Legitima a suspensão do pagamento de faturas ou paralisação de fornecimento quando a outra parte violar cláusulas essenciais do contrato.'
    },
    analiseCriticaDoutrinaria: `O equilíbrio sinalagmático dos negócios jurídicos tutela a reciprocidade das prestações:
1. Exceção do Contrato Não Cumprido (Art. 476 do Código Civil):
- Mecanismo de defesa substancial que permite a uma das partes suspender a sua prestação enquanto a contraparte não cumprir aquilo a que se obrigou;
- Exceptio Non Rite Adimpleti Contractus: Aplicável no caso de cumprimento imperfeito ou defeituoso da obrigação; exige proporcionalidade (um inadimplemento ínfimo não justifica a retenção total do pagamento).
2. Cláusula Rebus Sic Stantibus e Teoria da Imprevisão (Art. 478 do Código Civil):
- Nos contratos de execução continuada ou diferida, se a prestação de uma das partes se tornar excessivamente onerosa, com extrema vantagem para a outra, em virtude de acontecimentos extraordinários e imprevisíveis, poderá o devedor pedir a resolução ou revisão do contrato;
- Requisitos rigorosos:
  a) Evento superveniente imprevisível e extraordinário (ex: guerras que fecham rotas globais, pandemias com lockdowns sanitários);
  b) Onerosidade excessiva que quebre a base objetiva do negócio;
  c) Ausência de mora anterior da parte prejudicada.`,
    parecerJuridicoComentado: `Antes de suspender o pagamento de um fornecedor ou rescindir um contrato por onerosidade excessiva, a empresa deve notificá-lo formalmente por via extrajudicial constituindo-o em mora e propondo a renegociação amigável dos termos econômicos.`,
    teseDefensivaOuRecuperacao: {
      tese: 'Arguição Legítima de Exceptio Non Adimpleti Contractus',
      fundamentacao: 'Art. 476 do Código Civil',
      raciocinioDefensivo: 'Apresentar relatórios técnicos comprovando que o maquinário entregue apresentava vícios graves de funcionamento, tornando legítima a retenção da última parcela do preço até a completa assistência técnica corretiva.'
    },
    tags: ['Exceptio Non Adimpleti Contractus', 'Teoria da Imprevisão', 'Art 476 CC', 'Art 478 CC', 'Rebus Sic Stantibus', 'Sinalagma'],
    linkConhecimentoId: 'con-cont-01'
  },
  {
    id: 'dir-civ-06',
    title: 'Contratos Eletrônicos, Validade da Assinatura Digital e Título Executivo (Lei 14.063/20 & Art. 784, § 4º CPC)',
    ramo: 'civil',
    ramoLabel: 'Direito Civil Empresarial',
    subtopico: 'Contratos Digitais & Executividade da Assinatura Eletrônica',
    dispositivoLegal: 'Lei nº 14.063/2020, Art. 784, § 4º do CPC/15 (Lei 14.620/23) e MP nº 2.200-2/2001',
    doutrinaReferencia: 'Tarcísio Teixeira, Patrícia Peck Pinheiro, Ronaldo Lemos',
    jurisprudenciaTese: {
      tribunal: 'STJ',
      numeroTemaOuSumula: 'REsp 1.495.920/DF e REsp 1.954.918/SP',
      enunciado: 'É válida a assinatura eletrônica avançada ou qualificada (ICP-Brasil ou plataformas com aceite das partes) em contratos particulares, dispensando a testemunha presencial para fins de constituição de título executivo extrajudicial (Art. 784, § 4º do CPC).',
      impactoEmpresarial: 'Agilidade total na formalização de contratos de prestação de serviços e fornecimento via Docusign, Clicksign e Gov.br sem risco de nulidade processual.'
    },
    analiseCriticaDoutrinaria: `A regulamentação dos atos jurídicos no ambiente digital:
1. Modalidades de Assinatura Eletrônica (Lei 14.063/20):
- Simples: Identificação por login/senha ou e-mail;
- Avançada: Associada ao signatário de forma unívoca com dados sob seu controle exclusivo (ex: validação por token OTP/SMS/Biometria facial);
- Qualificada: Certificado digital ICP-Brasil (e-CPF/e-CNPJ A1 ou A3), com presunção legal absoluta de veracidade (Art. 10 da MP 2.200-2/01).
2. Título Executivo Extrajudicial no CPC (Art. 784, § 4º):
- O contrato assinado eletronicamente por provedores de assinatura não necessita da assinatura de 2 (duas) testemunhas presenciais para ser executado diretamente em juízo.`,
    parecerJuridicoComentado: `As empresas devem padronizar o uso de plataformas de assinatura digital reconhecidas e armazenar os arquivos originais em formato PDF/A acompanhados dos respectivos relatórios de auditoria e hashes SHA-256.`,
    teseDefensivaOuRecuperacao: {
      tese: 'Reconhecimento da Força Executiva do Contrato com Assinatura Digital sem Testemunhas',
      fundamentacao: 'Art. 784, § 4º do CPC/2015 c/c Lei nº 14.063/2020',
      raciocinioDefensivo: 'Apresentar a petição de execução instruída com o contrato em PDF assinado digitalmente e o log de auditoria da certificadora.'
    },
    tags: ['Contratos Digitais', 'Assinatura Eletrônica', 'ICP-Brasil', 'Art 784 CPC', 'DocuSign', 'Validade Jurídica'],
    linkConhecimentoId: 'con-cont-01'
  },
  {
    id: 'dir-civ-07',
    title: 'Cláusula Penal, Multa Compensatória e Redução Judicial do Excesso (Art. 413 do Código Civil)',
    ramo: 'civil',
    ramoLabel: 'Direito Civil Empresarial',
    subtopico: 'Dosimetria Contratual & Limitação da Pena Pecuniária',
    dispositivoLegal: 'Arts. 408 a 416 do Código Civil',
    doutrinaReferencia: 'Judith Martins-Costa, Gustavo Tepedino, Caio Mário da Silva Pereira',
    jurisprudenciaTese: {
      tribunal: 'STJ',
      numeroTemaOuSumula: 'Súmula 356 STJ e REsp 1.898.171/SP',
      enunciado: 'A redução da cláusula penal nos contratos bilaterais é dever do juiz (norma de ordem pública - Art. 413 CC) se a obrigação principal tiver sido cumprida em parte, ou se o montante da penalidade for manifestamente excessivo, tendo em vista a natureza e a finalidade do negócio.',
      impactoEmpresarial: 'Protege a empresa contratante contra multas rescisórias abusivas que extrapolam o valor total do próprio contrato.'
    },
    analiseCriticaDoutrinaria: `Função social e limites da cláusula penal:
1. Modalidades de Cláusula Penal:
- Moratória (Art. 411 CC): Incide pelo atraso no cumprimento da obrigação (cumulável com a execução da prestação principal);
- Compensatória (Art. 410 CC): Estipulada para a hipótese de inadimplemento total ou resolução do contrato (pré-fixação de perdas e danos);
2. Redução Equitativa Obrigatória (Art. 413 CC):
- O teto máximo da cláusula penal é o valor da obrigação principal (Art. 412 CC);
- O juiz DEVE readequar o valor da multa quando houver adimplemento substancial (execução de 70% ou 80% do objeto contratado).`,
    parecerJuridicoComentado: `Na elaboração de contratos comerciais de longa duração, é recomendável graduar a multa de rescisão de forma regressiva proporcional ao tempo decorrido do contrato.`,
    teseDefensivaOuRecuperacao: {
      tese: 'Redução Equitativa de Multa Rescisória por Cumprimento Parcial do Contrato',
      fundamentacao: 'Art. 413 do Código Civil',
      raciocinioDefensivo: 'Apresentar os comprovantes das medições mensais quitadas para reduzir a multa de 30% para 5% do saldo remanescente.'
    },
    tags: ['Cláusula Penal', 'Multa Contratual', 'Art 413 CC', 'Redução Equitativa', 'Adimplemento Parcial'],
    linkConhecimentoId: 'con-cont-02'
  },
  {
    id: 'dir-civ-08',
    title: 'NULIDADE DE CLÁUSULA DE ELEIÇÃO DE FORO ABUSIVA E HIPOSSUFICIÊNCIA DA EMPRESA (Art. 63, § 3º CPC)',
    ramo: 'civil',
    ramoLabel: 'Direito Civil Empresarial',
    subtopico: 'Competência Jurisdicional & Proteção do Contratante Hipossuficiente',
    dispositivoLegal: 'Art. 63, § 3º do CPC/2015 e Art. 51, I do CDC',
    doutrinaReferencia: 'Humberto Theodoro Júnior, Fredie Didier Jr., Nelson Nery Jr.',
    jurisprudenciaTese: {
      tribunal: 'STJ',
      numeroTemaOuSumula: 'Súmula 335 STF e REsp 1.675.012/SP',
      enunciado: 'A cláusula de eleição de foro inserida em contrato de adesão comercial é nula de pleno direito quando inviabilizar o acesso à justiça e a ampla defesa da parte comprovadamente hipossuficiente.',
      impactoEmpresarial: 'Possibilita que pequenas empresas e MEIs processem grandes corporações no foro do seu próprio domicílio.'
    },
    analiseCriticaDoutrinaria: `Validade e eficácia da eleição de foro:
1. Regra Geral (Art. 63 do CPC): As partes podem modificar a competência em razão do valor e do território, elegendo o foro onde serão dirimidas as ações;
2. Declaração de Ineficácia pelo Juiz (Art. 63, § 3º CPC): Antes da citação, o juiz que constatar a abusividade da cláusula de eleição de foro em contrato de adesão declarará a sua ineficácia e remeterá os autos ao foro do domicílio do réu.`,
    parecerJuridicoComentado: `Ao responder a processos judiciais propostos em capitais distantes com base em fóruns elegidos em contratos padrão, a defesa deve arguir em preliminar de contestação a ineficácia da eleição por obstáculo à defesa.`,
    teseDefensivaOuRecuperacao: {
      tese: 'Declaração de Ineficácia de Foro de Eleição Abusivo em Contrato de Adesão',
      fundamentacao: 'Art. 63, § 3º do CPC/2015',
      raciocinioDefensivo: 'Demonstrar no processo que a obrigatoriedade de litigar em foro distante inviabiliza o comparecimento de testemunhas e encarece desproporcionalmente a defesa.'
    },
    tags: ['Eleição de Foro', 'Art 63 CPC', 'Contrato de Adesão', 'Hipossuficiência Empresarial', 'Acesso à Justiça'],
    linkConhecimentoId: 'con-cont-03'
  }
];
