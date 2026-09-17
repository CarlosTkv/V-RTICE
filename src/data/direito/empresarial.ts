import { DireitoItem } from '../direitoData';

export const DIREITO_EMPRESARIAL: DireitoItem[] = [
  {
    id: 'dir-emp-01',
    title: 'Responsabilidade dos Administradores e a Business Judgment Rule (Arts. 1.011 a 1.016 CC e Lei 6.404/76)',
    ramo: 'empresarial',
    ramoLabel: 'Direito Empresarial',
    subtopico: 'Deveres Fiduciários & Governança Corporativa',
    dispositivoLegal: 'Arts. 1.011 a 1.016 do Código Civil e Arts. 153 a 159 da Lei nº 6.404/1976',
    doutrinaReferencia: 'Fabio Ulhoa Coelho ("Curso de Direito Comercial"), Modesto Carvalhosa ("Comentários à Lei de Sociedades Anônimas"), Nelson Eizirik',
    jurisprudenciaTese: {
      tribunal: 'STJ',
      numeroTemaOuSumula: 'REsp 1.741.079/SP',
      enunciado: 'A responsabilidade civil dos administradores de sociedades anônimas e limitadas é subjetiva e depende da comprovação inequívoca de culpa (imprudência/negligência), dolo ou violação da lei e do estatuto social.',
      impactoEmpresarial: 'Protege a tomada de decisão gerencial de boa-fé. O mero insucesso financeiro do empreendimento não gera responsabilidade pessoal do administrador perante terceiros ou acionistas.'
    },
    analiseCriticaDoutrinaria: `A doutrina societária contemporânea consagra os quatro deveres fiduciários fundamentais do administrador:
1. Dever de Diligência (Duty of Care - Art. 153 da LSA): Empregar no exercício de suas funções o cuidado e a prudência que todo homem ativo e probo costuma empregar na administração de seus próprios negócios;
2. Dever de Lealdade (Duty of Loyalty - Art. 155 da LSA): Abster-se de usar oportunidades comerciais da empresa em proveito próprio ou de terceiros;
3. Dever de Informar (Duty of Disclosure - Art. 157 da LSA): Prestar contas fidedignas e relatar fatos relevantes ao mercado e aos sócios;
4. Vedação ao Conflito de Interesses (Art. 156 da LSA): Impedimento de votar ou intervir em operações onde tenha interesse conflitante com a entidade.
A Business Judgment Rule estabelece uma presunção relativa de que a administração agiu de forma informada, de boa-fé e no melhor interesse da companhia, blindando decisões mercadológicas arrojadas contra revisão judicial pautada por viés retrospectivo (hindsight bias).`,
    parecerJuridicoComentado: `A responsabilidade pessoal dos administradores não decorre do resultado econômico negativo, mas da inobservância culposa ou dolosa dos deveres de diligência e lealdade. Recomenda-se a formalização de atas detalhadas de reuniões de diretoria e contratação de seguro D&O (Directors and Officers Liability Insurance) para resguardo do patrimônio pessoal dos executivos.`,
    teseDefensivaOuRecuperacao: {
      tese: 'Aplicação da Regra da Decisão Empresarial (Business Judgment Rule)',
      fundamentacao: 'Art. 153 da Lei 6.404/76 c/c Art. 1.011 do Código Civil',
      raciocinioDefensivo: 'Demonstrar que a decisão corporativa foi precedida de estudos técnicos de viabilidade, pareceres jurídicos e contábeis contemporâneos aos fatos, afastando a alegação de negligência ou dolo.'
    },
    tags: ['Direito Empresarial', 'Business Judgment Rule', 'Dever de Diligência', 'D&O', 'Governança Corporativa', 'Lei 6404'],
    linkConhecimentoId: 'con-soc-01'
  },
  {
    id: 'dir-emp-02',
    title: 'Desconsideração da Personalidade Jurídica: Art. 50 do Código Civil, Teoria Maior vs. Menor e Lei 13.874/19',
    ramo: 'empresarial',
    ramoLabel: 'Direito Empresarial',
    subtopico: 'Autonomia Patrimonial & Incidente de Desconsideração (IDPJ)',
    dispositivoLegal: 'Art. 50 do Código Civil (com redação da Lei nº 13.874/2019) e Arts. 133 a 137 do CPC/2015',
    doutrinaReferencia: 'Kalyan Garcia da Silva, Judith Martins-Costa, Carlos Roberto Gonçalves, Humberto Theodoro Júnior',
    jurisprudenciaTese: {
      tribunal: 'STJ',
      numeroTemaOuSumula: 'Tema 962 STJ e Súmula 435 STJ',
      enunciado: 'A desconsideração da personalidade jurídica no âmbito do direito civil e comercial exige a caracterização inequívoca de desvio de finalidade (dolo específico de fraudar) ou confusão patrimonial, sendo vedada sua decretação pela mera insolvência da sociedade.',
      impactoEmpresarial: 'Reafirmação categórica da autonomia patrimonial da PJ e segurança jurídica para investimentos societários contra penhoras indiscriminadas nas contas dos sócios.'
    },
    analiseCriticaDoutrinaria: `O ordenamento jurídico brasileiro adota dois regimes distintos para a superação da blindagem societária:
1. Teoria Maior da Desconsideração (Art. 50 do Código Civil - Regra Geral para Relações Civis, Comerciais e Tributárias):
- Exige comprovação estrita do ABUSO DA PERSONALIDADE JURÍDICA caracterizado por:
  a) Desvio de Finalidade: Utilização dolosa da pessoa jurídica com o propósito específico de lesar credores ou praticar atos ilícitos;
  b) Confusão Patrimonial: Cumprimento reiterado pela sociedade de obrigações pessoais do sócio/administrador ou vice-versa, e transferência de ativos sem contraprestação efetiva;
- A mera insuficiência de bens penhoráveis ou o encerramento irregular NÃO autorizam a desconsideração com base no Art. 50 do CC após a Lei de Liberdade Econômica.
2. Teoria Menor da Desconsideração (Art. 28, § 5º do CDC e Art. 4º da Lei 9.605/98):
- Aplicável exclusivamente a relações de consumo (CDC) e direito ambiental;
- Admite a desconsideração simplesmente quando a existência da pessoa jurídica representar obstáculo ao ressarcimento de prejuízos aos consumidores ou ao meio ambiente.`,
    parecerJuridicoComentado: `No âmbito das relações entre empresários (business-to-business), o juiz jamais pode aplicar a Teoria Menor. Qualquer tentativa de atingir o patrimônio pessoal dos sócios sem demonstração cabal de confusão financeira ou dolo em Incidente de Desconsideração (IDPJ com contraditório prévio) é manifestamente nula e passível de Agravo de Instrumento com efeito suspensivo.`,
    teseDefensivaOuRecuperacao: {
      tese: 'Descabimento da Desconsideração por Mera Insolvência Financeira',
      fundamentacao: 'Art. 50, §§ 1º e 2º do Código Civil c/c Art. 133 do CPC',
      raciocinioDefensivo: 'Apresentar a escrituração contábil idônea que comprove a segregação de contas entre sócio e empresa, demonstrando que a frustração da execução decorre de crise econômica setorial e não de desvio de finalidade.'
    },
    tags: ['Desconsideração da PJ', 'Art 50 CC', 'Teoria Maior', 'Teoria Menor', 'IDPJ', 'Liberdade Econômica'],
    linkConhecimentoId: 'con-soc-01'
  },
  {
    id: 'dir-emp-03',
    title: 'Recuperação Judicial, Stay Period de 180 Dias e Financiamento DIP (Lei nº 11.101/05 e Lei nº 14.112/20)',
    ramo: 'empresarial',
    ramoLabel: 'Direito Empresarial',
    subtopico: 'Crise da Empresa & Reestruturação Concursal',
    dispositivoLegal: 'Arts. 6º, 47 a 69-F da Lei nº 11.101/2005 (com redação da Lei nº 14.112/2020)',
    doutrinaReferencia: 'Manoel Justino Bezerra Filho ("Lei de Recuperação de Empresas e Falência"), Francisco Satiro de Souza Jr., Sheila Cerezetti',
    jurisprudenciaTese: {
      tribunal: 'STJ',
      numeroTemaOuSumula: 'Tema 1.051 STJ',
      enunciado: 'Estão submetidos aos efeitos da recuperação judicial os créditos decorrentes de fatos geradores anteriores ao pedido, ainda que ilíquidos ou vencidos posteriormente, sendo vedada a excussão individual de bens essenciais durante o stay period.',
      impactoEmpresarial: 'Assegura a suspensão de todas as execuções contra a devedora pelo prazo de 180 dias (prorrogável por igual período) para permitir a negociação do Plano de Recuperação Judicial.'
    },
    analiseCriticaDoutrinaria: `A reforma introduzida pela Lei 14.112/20 modernizou o regime de insolvência brasileiro:
1. Princípio da Preservação da Empresa (Art. 47): Viabilizar a superação da situação de crise econômico-financeira do devedor a fim de permitir a manutenção da fonte produtora, do emprego dos trabalhadores e do interesse dos credores;
2. Stay Period (Art. 6º, § 4º): Suspensão de todas as execuções civis e trabalhistas contra a devedora e proibição de atos de constrição em bens essenciais à atividade empresarial pelo juízo da recuperação;
3. Financiamento na Recuperação Judicial (DIP Financing - Arts. 69-A a 69-F):
- Permite que a empresa em recuperação tome empréstimos bancários concedendo garantias fiduciárias de ativos;
- Confere ao financiador privilégio extraconcursal de altíssima prioridade caso a empresa venha a falir posteriormente, incentivando a injeção de capital novo de giro;
4. Aprovação do Plano e Votação por Classes (Art. 41):
- Classe I (Trabalhistas), Classe II (Garantia Real), Classe III (Quirografários) e Classe IV (ME e EPP);
- Possibilidade de Cramdown (Art. 58, § 1º): Homologação judicial do plano mesmo sem aprovação em todas as classes, desde que atendidos os quóruns mínimos legais.`,
    parecerJuridicoComentado: `O processo de recuperação judicial é um poderoso instrumento de saneamento financeiro, mas exige rigorosa auditoria prévia, elaboração de Laudo de Viabilidade Econômica por perito independente e alinhamento com a classe trabalhadora e bancária para evitar a convolação em falência.`,
    teseDefensivaOuRecuperacao: {
      tese: 'Submissão de Créditos Concursais e Liberação de Travas Bancárias',
      fundamentacao: 'Art. 49 c/c Art. 6º, § 4º da Lei nº 11.101/2005',
      raciocinioDefensivo: 'Pleitear a liberação de recebíveis de cartão de crédito e travas bancárias desprovidas de cessão fiduciária perfeita e exigir a inclusão de todos os débitos pré-pedido na lista de credores do Administrador Judicial.'
    },
    tags: ['Recuperação Judicial', 'Stay Period', 'DIP Financing', 'Lei 11101/05', 'Lei 14112/20', 'Cramdown', 'Plano de Recuperação'],
    linkConhecimentoId: 'con-soc-03'
  },
  {
    id: 'dir-emp-04',
    title: 'Falência, Ineficácia Objetiva de Atos Praticados no Termo Legal e Classificação de Créditos (Art. 83)',
    ramo: 'empresarial',
    ramoLabel: 'Direito Empresarial',
    subtopico: 'Processo Falimentar & Arrecadação de Ativos',
    dispositivoLegal: 'Arts. 83, 84, 99 e 129 da Lei nº 11.101/2005',
    doutrinaReferencia: 'Waldo Fazzio Júnior, Sergio Campinho, Ecio Perin Junior, Marlon Tomazette',
    jurisprudenciaTese: {
      tribunal: 'STJ',
      numeroTemaOuSumula: 'Súmula 581 STJ e REsp 1.660.195/SP',
      enunciado: 'A decretação da falência acarreta a suspensão das ações individuais contra a sociedade falida e a fixação do termo legal de até 90 dias anteriores ao pedido, tornando ineficazes perante a massa falida atos fraudulentos de transferência patrimonial praticados nesse período.',
      impactoEmpresarial: 'Mecanismo de reconstituição do patrimônio da massa falida para assegurar o pagamento equânime aos credores respeitando a ordem legal de preferência.'
    },
    analiseCriticaDoutrinaria: `A liquidação falimentar orienta-se pela par condicio creditorum e pela arrecadação célere:
1. Ineficácia Objetiva no Termo Legal da Falência (Art. 129 da Lei 11.101/05):
- São ineficazes perante a massa falida, independentemente de prova de fraude (má-fé):
  I - O pagamento de dívidas não vencidas realizado dentro do termo legal;
  II - O pagamento de dívidas vencidas e exigíveis realizado por forma não prevista no contrato (ex: dação em pagamento de imóveis/veículos);
  III - A constituição de garantia real (hipoteca/penhor) para dívida contraída anteriormente sem garantia;
  IV - A prática de atos a título gratuito (doações) até 2 anos antes da falência.
2. Nova Ordem de Classificação dos Créditos Concursais (Art. 83):
  I - Créditos trabalhistas de natureza salarial até o limite de 150 salários-mínimos por trabalhador e decorrentes de acidente de trabalho;
  II - Créditos com garantia real até o limite do valor do bem gravado;
  III - Créditos tributários (independentemente da natureza e do tempo de constituição);
  IV - Créditos com privilégio especial;
  V - Créditos com privilégio geral;
  VI - Créditos quirografários;
  VII - Multas contratuais e penas pecuniárias (inclusive multas fiscais);
  VIII - Créditos subordinados.`,
    parecerJuridicoComentado: `Os administradores e contadores devem manter documentação minuciosa de todas as alienações de ativos anteriores à decretação de falência para afastar alegações de ineficácia ou tipificação de crime falimentar previsto nos Arts. 168 a 178 da Lei 11.101/05.`,
    teseDefensivaOuRecuperacao: {
      tese: 'Validade de Pagamento de Boa-Fé em Negócio Jurídico Comutativo',
      fundamentacao: 'Art. 130 da Lei 11.101/2005',
      raciocinioDefensivo: 'Comprovar que o negócio jurídico com a empresa foi oneroso, comutativo e sem conluio fraudulento (consilium fraudis), preservando os direitos de terceiros adquirentes de boa-fé.'
    },
    tags: ['Falência', 'Ordem de Credores Art 83', 'Termo Legal', 'Ineficácia Objetiva Art 129', 'Par Condicio Creditorum'],
    linkConhecimentoId: 'con-soc-04'
  },
  {
    id: 'dir-emp-05',
    title: 'Títulos de Crédito Empresariais: Duplicatas Eletrônicas, Cédulas de Crédito Bancário e Execução de Título Extrajudicial',
    ramo: 'empresarial',
    ramoLabel: 'Direito Empresarial',
    subtopico: 'Títulos de Crédito & Cobrança de Créditos Mercantis',
    dispositivoLegal: 'Lei nº 5.474/1968 (Lei das Duplicatas), Lei nº 13.775/2018 e Lei nº 10.931/2004 (CCB)',
    doutrinaReferencia: 'Fran Martins, Wille Duarte Silva, Gladston Mamede, Arnaldo Rizzardo',
    jurisprudenciaTese: {
      tribunal: 'STJ',
      numeroTemaOuSumula: 'Súmula 258 STJ e Súmula 387 STF',
      enunciado: 'A Cédula de Crédito Bancário (CCB) é título executivo extrajudicial representativo de operações de crédito de qualquer natureza, desde que acompanhada de demonstrativo claro de cálculo de juros e encargos, nos termos do Art. 28 da Lei 10.931/04.',
      impactoEmpresarial: 'Agilidade na cobrança e execução judicial direta de créditos e contratos de financiamento, sem necessidade de moroso processo de conhecimento.'
    },
    analiseCriticaDoutrinaria: `O direito cambial rege a circulação do crédito na economia:
1. Princípios Cambiários Fundamentais:
- Cartularidade (mitigada pela desmaterialização digital e duplicatas escriturais sob a Lei 13.775/18);
- Literalidade: Vale no título exatamente o que nele está escrito;
- Autonomia e Abstração: As obrigações cambiais são independentes entre si e desvinculam-se do negócio jurídico subjacente após a circulação por endosso a terceiro de boa-fé.
2. A Duplicata Mercantil e de Serviços:
- Título de crédito causal: Só pode ser emitido para documentar venda mercantil a prazo ou prestação de serviços efetiva com emissão de NF-e;
- Duplicata Simulada ou "Fria": Emissão sem lastro de entrega de mercadoria constitui CRIME do Art. 172 do Código Penal e nulidade do título executivo;
- Execução de Duplicata sem Aceite (Art. 15, II da Lei 5.474/68): Exige cumulativamente:
  a) Instrumento de protesto por falta de aceite; e
  b) Comprovante de entrega e recebimento das mercadorias (canhoto da NF-e assinado) ou comprovante da prestação do serviço.
3. Duplicatas Escriturais / Eletrônicas (Lei 13.775/18):
- Registro obrigatório em entidades registradoras autorizadas pelo Banco Central (Cerc, B3, Tag), impedindo a emissão de duplicatas em duplicidade para múltiplos bancos ou factorings.`,
    parecerJuridicoComentado: `Na gestão de recebíveis corporativos e operações de fomento mercantil (factoring/securitização), é mandatório o arquivamento digital permanente dos canhotos de entrega de mercadorias assinados e dos relatórios de aceite tácito para garantir a higidez executiva imediata dos créditos.`,
    teseDefensivaOuRecuperacao: {
      tese: 'Nulidade da Execução por Ausência de Título Causal e Comprovante de Entrega',
      fundamentacao: 'Art. 15 da Lei nº 5.474/1968 c/c Art. 803, I do CPC',
      raciocinioDefensivo: 'Opor Embargos à Execução demonstrando que o credor não juntou o comprovante de entrega da mercadoria ou que os serviços foram recusados motivadamente por vício de qualidade.'
    },
    tags: ['Títulos de Crédito', 'Duplicata Eletrônica', 'CCB', 'Lei 13775/18', 'Execução de Título', 'Art 172 CP'],
    linkConhecimentoId: 'con-soc-05'
  },
  {
    id: 'dir-emp-06',
    title: 'Acordo de Sócios e Validade de Cláusulas de Tag Along, Drag Along e Buy-Out (Art. 118 da Lei 6.404/76)',
    ramo: 'empresarial',
    ramoLabel: 'Direito Empresarial',
    subtopico: 'Governança Societária & Resolução de Conflitos Entre Sócios',
    dispositivoLegal: 'Art. 118 da Lei nº 6.404/1976 e Arts. 997 a 1.000 do Código Civil',
    doutrinaReferencia: 'Modesto Carvalhosa, Nelson Eizirik, Erasmo Valladão',
    jurisprudenciaTese: {
      tribunal: 'STJ',
      numeroTemaOuSumula: 'REsp 1.842.147/SP',
      enunciado: 'O acordo de sócios devidamente arquivado na sede da companhia ou averbado na Junta Comercial é vinculante perante a sociedade e terceiros, sendo nulos os votos proferidos em assembleia com violação às suas cláusulas.',
      impactoEmpresarial: 'Prevenção de impasses societários (deadlock) em startups e médias empresas via mecanismos objetivos de saída contratual.'
    },
    analiseCriticaDoutrinaria: `O acordo de sócios é o principal instrumento parabancário de governança:
1. Cláusula de Drag Along (Direito de Arrastamento): Garante aos sócios majoritários o direito de obrigar os minoritários a venderem suas participações societárias conjunta e proporcionalmente na hipótese de oferta de compra de 100% da empresa por terceiro;
2. Cláusula de Tag Along (Direito de Conjuntura): Assegura aos minoritários o direito de venderem suas participações nas mesmas condições de preço e prazo negociadas pelos majoritários;
3. Cláusula de Shotgun / Texas Shootout: Mecanismo de dissolução de impasse em que um sócio oferta o preço para compra da parte do outro, cabendo a este aceitar a venda ou comprar a fatia do ofertante pelo exato preço proposto.`,
    parecerJuridicoComentado: `Recomenda-se a elaboração de Acordo de Quotistas/Acionistas registrado perante o órgão competente contendo prazos claros de vesting, não concorrência (non-compete) e arbitragem societária.`,
    teseDefensivaOuRecuperacao: {
      tese: 'Execução Específica de Acordo de Sócios com Anulação de Voto Assemblear Contrária',
      fundamentacao: 'Art. 118, §§ 8º e 9º da Lei 6.404/76',
      raciocinioDefensivo: 'Requerer liminar para compelir o presidente da assembleia a desconsiderar o voto proferido em violação a acordo de acionistas averbado.'
    },
    tags: ['Acordo de Sócios', 'Tag Along', 'Drag Along', 'Art 118 LSA', 'Governança', 'Vesting'],
    linkConhecimentoId: 'con-soc-01'
  },
  {
    id: 'dir-emp-07',
    title: 'Apuração de Haveres e Exclusão Judiciária de Sócio por Falta Grave (Arts. 1.029 a 1.031 do CC & CPC/15)',
    ramo: 'empresarial',
    ramoLabel: 'Direito Empresarial',
    subtopico: 'Dissolução Parcial de Sociedade & Avaliação de Valuation Contábil',
    dispositivoLegal: 'Arts. 1.028 a 1.032 do Código Civil e Arts. 599 a 609 do CPC/2015',
    doutrinaReferencia: 'Fabio Ulhoa Coelho, Alfredo de Assis Gonçalves Neto, Marcelo von Adamek',
    jurisprudenciaTese: {
      tribunal: 'STJ',
      numeroTemaOuSumula: 'Tema 1.057 STJ e REsp 1.877.331/SP',
      enunciado: 'Na apuração de haveres decorrente de dissolução parcial de sociedade limitada, o valor das quotas deve ser apurado com base no balanço de determinação, considerando o valor patrimonial real dos ativos e passivos na data da resolução, sendo indevido o critério do valor patrimonial contábil simples.',
      impactoEmpresarial: 'Garantia de apuração justa do valor real da empresa no momento do desligamento do sócio, incluindo goodwill e fundo de comércio.'
    },
    analiseCriticaDoutrinaria: `Procedimento de Dissolução Parcial de Sociedade:
1. Hipóteses de Retirada do Sócio: Exercício do direito de recesso por alteração substancial do contrato social ou prazo indeterminado (Art. 1.029 CC);
2. Exclusão de Sócio por Falta Grave (Art. 1.030 CC): Exige judicialização ou alteração contratual prévia com justa causa fundamentada em assembleia especial;
3. Balanço de Determinação (Art. 606 do CPC): A avaliação do patrimônio líquido da sociedade deve ser efetuada com base no valor de mercado dos bens e intangíveis à data do desligamento.`,
    parecerJuridicoComentado: `Para mitigar litígios custosos de apuração de haveres, o contrato social deve estipular o critério de valuation (ex.: múltiplo do EBITDA ou Fluxo de Caixa Descontado) e o parcelamento do pagamento dos haveres em até 12 ou 24 parcelas.`,
    teseDefensivaOuRecuperacao: {
      tese: 'Fixação de Balanço de Determinação em Valor Real de Mercado com Goodwill',
      fundamentacao: 'Art. 606 do CPC/2015 c/c Art. 1.031 do Código Civil',
      raciocinioDefensivo: 'Requerer perícia contábil judicial avaliando os intangíveis e carteira de clientes ativas para apuração justa do valor da cota societária.'
    },
    tags: ['Apuração de Haveres', 'Dissolução Parcial', 'Balanço de Determinação', 'Art 606 CPC', 'Goodwill'],
    linkConhecimentoId: 'con-soc-02'
  },
  {
    id: 'dir-emp-08',
    title: 'Propriedade Intelectual, Marca Registrada e Proteção Contra Concorrência Desleal (Lei 9.279/96)',
    ramo: 'empresarial',
    ramoLabel: 'Direito Empresarial',
    subtopico: 'Ativos Intangíveis & Registro de Marca no INPI',
    dispositivoLegal: 'Arts. 122 a 132 e Arts. 195 a 209 da Lei nº 9.279/1996 (LPI)',
    doutrinaReferencia: 'Denis Borges Barbosa, Carlos Henrique de Carvalho, Luiz Fernando Ribeiro',
    jurisprudenciaTese: {
      tribunal: 'STJ',
      numeroTemaOuSumula: 'Súmula 142 STJ e REsp 1.790.359/SP',
      enunciado: 'O registro de marca concedido pelo INPI atribui ao titular a propriedade exclusiva no território nacional e o direito de zelar por sua integridade material, autorizando o pedido de busca e apreensão de produtos contrafeitos e indenização por lucros cessantes.',
      impactoEmpresarial: 'Proteção de marcas, softwares e patentes da empresa contra imitações, usurpação por ex-funcionários e desvio ilícito de clientela.'
    },
    analiseCriticaDoutrinaria: `A tutela dos ativos imateriais de propriedade industrial:
1. Princípio da Atributividade: A propriedade da marca adquire-se pelo registro validamente expedido pelo INPI (Art. 129 LPI);
2. Princípio da Especialidade: A proteção da marca restringe-se ao segmento mercantil objeto do registro (salvo marcas de Alto Renome - Art. 125);
3. Concorrência Desleal (Art. 195 LPI): Configura crime e ilícito civil o emprego de meios fraudulentos para desviar clientela alheia, uso não autorizado de segredos de negócio e confusão induzida no consumidor.`,
    parecerJuridicoComentado: `As empresas devem manter monitoramento ativo no INPI para oposição periódica a pedidos de marcas colidentes protocolados por terceiros e exigir termos de sigilo (NDA) e não concorrência dos executivos.`,
    teseDefensivaOuRecuperacao: {
      tese: 'Abstenção de Uso de Marca Mista Registrada com Indenização por Danos Morais e Materiais',
      fundamentacao: 'Art. 129 c/c Art. 209 da Lei nº 9.279/1996',
      raciocinioDefensivo: 'Ajuizar ação cominatória cumulada com perdas e danos comprovando o registro no INPI e o aproveitamento parasitário do nome comercial.'
    },
    tags: ['Propriedade Industrial', 'Marca INPI', 'Concorrência Desleal', 'Lei 9279/96', 'Lucros Cessantes'],
    linkConhecimentoId: 'con-soc-05'
  }
];
