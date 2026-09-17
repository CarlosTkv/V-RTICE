import { DireitoItem } from '../direitoData';

export const DIREITO_TRIBUTARIO: DireitoItem[] = [
  {
    id: 'dir-trib-01',
    title: 'Responsabilidade Tributária do Sócio-Gerente e Redirecionamento da Execução Fiscal (Art. 135, III do CTN & Temas 962/981 STJ)',
    ramo: 'tributario',
    ramoLabel: 'Direito Tributário',
    subtopico: 'Responsabilidade Tributária & Incidente de Desconsideração da Personalidade Jurídica (IDPJ)',
    dispositivoLegal: 'Art. 135, III do Código Tributário Nacional (CTN) e Lei nº 6.830/1980 (LEF)',
    doutrinaReferencia: 'Hugo de Brito Machado ("Curso de Direito Tributário"), Luciano Amaro ("Direito Tributário Brasileiro"), Kiyoshi Harada',
    jurisprudenciaTese: {
      tribunal: 'STJ',
      numeroTemaOuSumula: 'Tema 962 STJ e Tema 981 STJ (Primeira Seção)',
      enunciado: 'O redirecionamento da execução fiscal para o sócio-gerente somente é cabível se demonstrado que ele exercia a administração da sociedade no momento da dissolução irregular e/ou no momento da ocorrência do fato gerador do tributo inadimplido, acompanhado de ato praticado com excesso de poderes ou infração à lei/estatuto.',
      impactoEmpresarial: 'Protege ex-sócios e administradores que se retiraram formalmente da empresa antes de eventual encerramento irregular das atividades, vedando a penhora automática e irrestrita de bens pessoais.'
    },
    analiseCriticaDoutrinaria: `O Art. 135, III do CTN não consagra hipótese de responsabilidade objetiva por simples inadimplemento tributário. Conforme pacificado na Súmula 430 do STJ, o mero não recolhimento de tributo declarado pela pessoa jurídica não configura, por si só, infração de lei apta a ensejar a responsabilidade pessoal dos administradores.
Para que ocorra a responsabilização pessoal dos gestores, exige-se a configuração de:
1. Atos praticados com excesso de poderes, infração de lei ou do contrato social/estatuto; OU
2. Dissolução Irregular da Sociedade (Súmula 435 do STJ): Presume-se dissolvida irregularmente a empresa que deixa de funcionar no seu domicílio fiscal sem comunicação aos órgãos competentes (Junta Comercial e Receita Federal), legitimando o redirecionamento contra o sócio com poderes de gerência na data da dissolução fática.`,
    parecerJuridicoComentado: `Em caso de execução fiscal com pedido de redirecionamento contra o sócio, a defesa deve ser promovida mediante Exceção de Pré-Executividade (quando houver prova documental pré-constituída de ausência de poderes de gerência ou encerramento formal da empresa) ou Embargos à Execução com garantia do juízo via Seguro-Garantia Bancário.`,
    teseDefensivaOuRecuperacao: {
      tese: 'Ilegitimidade Passiva do Sócio por Inexistência de Poderes de Administração à Época da Dissolução',
      fundamentacao: 'Tema 981 do STJ c/c Súmula 430 do STJ e Art. 135, III do CTN',
      raciocinioDefensivo: 'Apresentar a alteração contratual devidamente averbada na Junta Comercial demonstrando a renúncia ou cessão de quotas do administrador em período anterior à certidão do Oficial de Justiça que constatou o encerramento do estabelecimento.'
    },
    tags: ['Responsabilidade Tributária', 'Art 135 CTN', 'Tema 962 STJ', 'Tema 981 STJ', 'Súmula 435 STJ', 'Execução Fiscal'],
    linkConhecimentoId: 'con-trib-fed-01'
  },
  {
    id: 'dir-trib-02',
    title: 'A "Tese do Século" (Tema 69 do STF) e as Teses Filhotes: Exclusão do ICMS, ISS e CPRB da Base de PIS/COFINS',
    ramo: 'tributario',
    ramoLabel: 'Direito Tributário',
    subtopico: 'Recuperação Tributária & Conceito Constitucional de Receita Bruta / Faturamento',
    dispositivoLegal: 'Art. 195, I, "b" da CF/88, Lei nº 9.718/1998, Leis nº 10.637/2002 e 10.833/2003 e Parecer SEI nº 7698/2021/ME',
    doutrinaReferencia: 'Roque Antonio Carrazza ("ICMS"), Paulo de Barros Carvalho ("Curso de Direito Tributário"), Humberto Ávila',
    jurisprudenciaTese: {
      tribunal: 'STF',
      numeroTemaOuSumula: 'Tema 69 STF (RE 574.706/PR) e Tema 118 STF (ISS no PIS/COFINS)',
      enunciado: 'O ICMS destacado na nota fiscal não integra a base de cálculo das contribuições ao PIS e à COFINS, pois não constitui receita bruta ou faturamento do contribuinte, mas mero ingresso transitório repassado aos cofres estaduais.',
      impactoEmpresarial: 'Direito à repetição de indébito e compensação dos últimos 5 anos de recolhimentos indevidos via Per/Dcomp Web e redução imediata e perene da carga tributária mensal de todas as empresas do Lucro Real e Presumido.'
    },
    analiseCriticaDoutrinaria: `O julgamento histórico do RE 574.706 fixou o conceito constitucional de faturamento como a receita própria proveniente da atividade empresarial que ingressa em definitivo no patrimônio da entidade (incorporação patrimonial positiva). Tributos estaduais e municipais representam meros trânsitos de caixa.
Desdobramentos e Modulação dos Efeitos:
1. ICMS Destacado: O STF fixou expressamente nos embargos declaratórios que o valor a ser excluído da base de cálculo do PIS/COFINS é o ICMS DESTACADO nas notas fiscais de venda e não o ICMS recolhido/pago;
2. Modulação Temporal: A decisão produz efeitos a partir de 15/03/2017, ressalvadas as ações judiciais ajuizadas até essa data;
3. Teses Filhotes Consolidadas:
- Exclusão do ISS da base de cálculo do PIS e da COFINS (Tema 118 do STF);
- Exclusão do ICMS da base da CPRB (Desoneração da Folha - Tema 1.048 do STJ);
- Exclusão do PIS e da COFINS de suas próprias bases de cálculo (cálculo por dentro).`,
    parecerJuridicoComentado: `As empresas que ainda apuram PIS/COFINS sobre a receita bruta total devem realizar a segregação contábil e fiscal no Bloco C e M da EFD-Contribuições, retificando as obrigações acessórias dos últimos 60 meses para habilitar créditos fiscais milionários via sistema eletrônico de compensação da Receita Federal.`,
    teseDefensivaOuRecuperacao: {
      tese: 'Habilitação de Crédito Decorrente de Decisão Judicial Transitada em Julgado (Tema 69 STF)',
      fundamentacao: 'Tema 69 do STF c/c Arts. 100 a 106 da IN RFB nº 2.055/2021',
      raciocinioDefensivo: 'Apresentar o cálculo de liquidação expurgando o ICMS destacado de todas as NF-e emitidas nos últimos 5 anos e transmitir o Pedido Eletrônico de Habilitação de Crédito pelo e-CAC.'
    },
    tags: ['Tema 69 STF', 'Tese do Século', 'Exclusão do ICMS', 'PIS/COFINS', 'Repetição de Indébito', 'Per/Dcomp'],
    linkConhecimentoId: 'con-fisc-02'
  },
  {
    id: 'dir-trib-03',
    title: 'Decadência, Prescrição Tributária e Prescrição Intercorrente na Execução Fiscal (Arts. 150, 173, 174 CTN e Tema 566 STJ)',
    ramo: 'tributario',
    ramoLabel: 'Direito Tributário',
    subtopico: 'Extinção do Crédito Tributário & Prazos Extintivos Fazendários',
    dispositivoLegal: 'Arts. 150, § 4º, 156, V, 173 e 174 do CTN e Art. 40 da Lei nº 6.830/1980 (LEF)',
    doutrinaReferencia: 'Leandro Paulsen ("Direito Tributário Completo"), Eurico Marcos Diniz de Santi ("Decadência e Prescrição no Direito Tributário"), Eduardo Sabbag',
    jurisprudenciaTese: {
      tribunal: 'STJ',
      numeroTemaOuSumula: 'Tema 566 STJ (REsp 1.340.553/RS) e Súmula 409 STJ',
      enunciado: 'Na execução fiscal, não localizados bens penhoráveis, suspende-se o processo por 1 (um) ano. Findo esse prazo, inicia-se automaticamente a contagem da Prescrição Intercorrente qüinqüenal (5 anos), independentemente de intimação da Fazenda Pública, acarretando a extinção definitiva da dívida.',
      impactoEmpresarial: 'Permite a extinção e o cancelamento de execuções fiscais antigas e arquivadas que tramitam há mais de 6 anos sem localização de patrimônio, limpando o passivo da empresa.'
    },
    analiseCriticaDoutrinaria: `O ordenamento tributário estabelece prazos fatais para a atuação do Fisco em homenagem à segurança jurídica:
1. Decadência (Perda do Direito de Lançar o Tributo):
- Lançamento por Homologação com Pagamento Parcial (Art. 150, § 4º do CTN): 5 anos contados da ocorrência do fato gerador;
- Ausência de Pagamento ou Lançamento de Ofício por Dolo/Fraude (Art. 173, I do CTN): 5 anos contados do primeiro dia do exercício seguinte àquele em que o lançamento poderia ter sido efetuado;
2. Prescrição Ordinária (Perda do Direito de Cobrar Judicialmente):
- 5 anos contados da data da constituição definitiva do crédito tributário (Art. 174 do CTN). Nos tributos sujeitos a autolançamento (DCTF, PGDAS, GFIP), a declaração constitui o crédito (Súmula 436 STJ), iniciando a prescrição na data de entrega ou no vencimento (o que for posterior);
3. Prescrição Intercorrente na Execução Fiscal (Art. 40 da LEF e Tema 566 do STJ):
- Decorrido o prazo de 1 ano de suspensão + 5 anos de arquivamento (total 6 anos) sem penhora efetiva de bens, o juiz DEVE decretar a prescrição intercorrente e extinguir o processo, inclusive de ofício.`,
    parecerJuridicoComentado: `A arguição de prescrição intercorrente pode ser feita a qualquer momento por simples petição ou Exceção de Pré-Executividade, com base no Tema 566 do STJ, liberando penhoras no Sisbajud e cancelando a inscrição na Dívida Ativa.`,
    teseDefensivaOuRecuperacao: {
      tese: 'Decreto de Prescrição Intercorrente com Extinção da Execução Fiscal',
      fundamentacao: 'Tema 566 do STJ c/c Art. 40, § 4º da Lei nº 6.830/1980 e Art. 156, V do CTN',
      raciocinioDefensivo: 'Demonstrar na linha do tempo processual o transcurso do lapso temporal superior a 6 anos desde o primeiro despacho de não localização de bens sem que o Fisco tenha indicado patrimônio penhorável útil.'
    },
    tags: ['Prescrição Intercorrente', 'Decadência', 'Tema 566 STJ', 'Art 40 LEF', 'Súmula 436 STJ', 'Extinção do Crédito'],
    linkConhecimentoId: 'con-soc-03'
  },
  {
    id: 'dir-trib-04',
    title: 'Defesas na Execução Fiscal: Exceção de Pré-Executividade (Súmula 393 STJ), Embargos à Execução e Ação Anulatória',
    ramo: 'tributario',
    ramoLabel: 'Direito Tributário',
    subtopico: 'Direito Processual Tributário & Garantias do Juízo',
    dispositivoLegal: 'Art. 16 da Lei nº 6.830/1980, Art. 803 do CPC/2015 e Súmula 393 do STJ',
    doutrinaReferencia: 'Hugo de Brito Machado Segundo, Leonardo José Carneiro da Cunha, Fredie Didier Jr.',
    jurisprudenciaTese: {
      tribunal: 'STJ',
      numeroTemaOuSumula: 'Súmula 393 STJ e Tema 1.050 STJ',
      enunciado: 'A exceção de pré-executividade é admissível na execução fiscal relativamente às matérias conhecíveis de ofício que não demandem dilação probatória, tais como decadência, prescrição, ilegitimidade passiva e nulidade da CDA, sem necessidade de garantia do juízo.',
      impactoEmpresarial: 'Permite anular cobranças fiscais ilegais sem ter que desembolsar depósitos em dinheiro ou penhorar o estoque/maquinário da empresa.'
    },
    analiseCriticaDoutrinaria: `O devedor tributário dispõe de três vias processuais fundamentais de defesa:
1. Exceção de Pré-Executividade (EPE - Súmula 393 do STJ):
- Incidente processual nos próprios autos da Execução Fiscal;
- Vantagens: NÃO exige garantia do juízo (sem penhora prévia) e NÃO paga custas judiciais;
- Requisito estrito: Prova documental pré-constituída (vedada dilação pericial complexa);
- Cabível para: Prescrição, decadência, quitação comprovada, imunidade/isenção comprovada e nulidade formal da Certidão de Dívida Ativa (CDA);
2. Embargos à Execução Fiscal (Art. 16 da LEF):
- Ação autônoma de cognição plena que exige a garantia integral da execução (Depósito em dinheiro, Fiança Bancária, Seguro-Garantia ou penhora de bens suficientes);
- Admite qualquer tipo de prova (perícia contábil, testemunhas);
3. Ação Anulatória de Débito Fiscal (Art. 38 da LEF):
- Ação distribuída no juízo cível/federal antes ou concomitantemente à execução;
- Para suspender a exigibilidade do débito e obter CND, exige depósito judicial integral em dinheiro (Art. 151, II do CTN) ou tutela de urgência/liminar com apresentação de seguro-garantia.`,
    parecerJuridicoComentado: `A utilização de Seguro-Garantia Judicial (admitida expressamente pelo Art. 9º, II da LEF e Portaria PGFN 164/2014) revolucionou a defesa tributária corporativa, pois garante a execução para fins de interposição de embargos sem comprometer o fluxo de caixa imediato da empresa.`,
    teseDefensivaOuRecuperacao: {
      tese: 'Nulidade da Certidão de Dívida Ativa (CDA) por Falta de Requisitos Legais Essenciais',
      fundamentacao: 'Art. 202 do CTN c/c Art. 2º, § 5º da Lei nº 6.830/1980 e Súmula 393 do STJ',
      raciocinioDefensivo: 'Apresentar Exceção de Pré-Executividade demonstrando que a CDA não discriminou a forma de cálculo dos juros de mora ou fundamentou erroneamente o enquadramento legal, cerceando o direito de defesa.'
    },
    tags: ['Exceção de Pré-Executividade', 'Súmula 393 STJ', 'Embargos à Execução', 'Seguro-Garantia', 'Nulidade CDA', 'LEF'],
    linkConhecimentoId: 'con-trib-fed-04'
  },
  {
    id: 'dir-trib-05',
    title: 'Princípio do Não Confisco e Limitação de Multas Fiscais ao Teto Constitucional de 100% (Tema 863 STF)',
    ramo: 'tributario',
    ramoLabel: 'Direito Tributário',
    subtopico: 'Garantias Constitucionais & Dosimetria de Penalidades Fiscais',
    dispositivoLegal: 'Art. 150, IV da Constituição Federal de 1988 e Art. 44 da Lei nº 9.430/1996',
    doutrinaReferencia: 'Roque Antonio Carrazza, Misabel Abreu Machado Derzi, Heleno Taveira Tôrres',
    jurisprudenciaTese: {
      tribunal: 'STF',
      numeroTemaOuSumula: 'Tema 863 STF (RE 736.090/SC) e Tema 1.195 STF',
      enunciado: 'É inconstitucional a fixação de multa tributária punitiva em montante superior a 100% (cem por cento) do valor do tributo devido, por violação direta ao princípio do não confisco (Art. 150, IV da CF/88). Para multas moratórias, o teto máximo aceito é de 20%.',
      impactoEmpresarial: 'Redução imediata em sede judicial de autos de infração que cobram multas abusivas de 150%, 200% ou 300% do imposto, expurgando o excesso cobrado pelas Fazendas estaduais e federal.'
    },
    analiseCriticaDoutrinaria: `O Princípio do Não Confisco é garantia fundamental do contribuinte contra o excesso punitivo do Estado:
1. Distinção entre Multas Tributárias:
- Multa Moratória (pelo simples atraso no pagamento): Destina-se a desestimular o pagamento impontual. O STF pacificou que não pode ultrapassar o teto razoável de 20% do valor do tributo;
- Multa Punitiva ou de Ofício (aplicada em autos de infração decorrentes de fiscalização): O STF fixou no Tema 863 que a multa punitiva não pode ultrapassar 100% do valor do tributo devido, mesmo em casos de sonegação, fraude ou conluio;
2. Inconstitucionalidade da Multa Isolada de 50% por Não Homologação de Compensação (Tema 736 do STF / ADI 4.905):
- O STF declarou inconstitucional o Art. 74, § 17 da Lei 9.430/96, que impunha multa isolada de 50% pelo mero indeferimento de pedidos de compensação em Per/Dcomp apresentados de boa-fé.`,
    parecerJuridicoComentado: `Qualquer Auto de Infração estadual ou federal que veicule multa punitiva superior a 100% (muito comum em autuações de ICMS e IPI) deve ser objeto de impugnação imediata com base no Tema 863 do STF para redução forçada do valor principal exigido.`,
    teseDefensivaOuRecuperacao: {
      tese: 'Adequação da Multa Punitiva ao Teto Máximo Constitucional de 100%',
      fundamentacao: 'Tema 863 do STF (RE 736.090) c/c Art. 150, IV da Constituição Federal',
      raciocinioDefensivo: 'Requerer a nulidade parcial do auto de infração com recálculo do crédito tributário para extirpar todo o excesso de penalidade pecuniária que ultrapasse 100% do tributo lançado.'
    },
    tags: ['Não Confisco', 'Tema 863 STF', 'Multa Punitiva', 'Teto de 100%', 'Art 150 IV CF', 'ADI 4905'],
    linkConhecimentoId: 'con-fisc-05'
  },
  {
    id: 'dir-trib-06',
    title: 'Exclusão do PIS/COFINS e ISS sobre Subvenções para Investimento e CUSTEIO (Tema 1.182 STJ)',
    ramo: 'tributario',
    ramoLabel: 'Direito Tributário',
    subtopico: 'Incentivos Fiscais Regionais & Art. 30 da Lei nº 12.973/2014',
    dispositivoLegal: 'Art. 30 da Lei nº 12.973/2014 e Lei Complementar nº 160/2017',
    doutrinaReferencia: 'Tácio Lacerda Gama, Marco Aurélio Greco, Heleno Taveira Tôrres',
    jurisprudenciaTese: {
      tribunal: 'STJ',
      numeroTemaOuSumula: 'Tema 1.182 STJ (Primeira Seção)',
      enunciado: 'É impossível a exclusão dos benefícios fiscais de ICMS (redução de base de cálculo, isenção e diferimento) da base de cálculo do IRPJ e da CSLL sem a comprovação dos requisitos do Art. 30 da Lei 12.973/2014 (constituição de reserva de lucros), salvo para o crédito presumido de ICMS (EREsp 1.517.492/PR).',
      impactoEmpresarial: 'Orienta a correta contabilização de incentivos de ICMS concedidos por estados para evitar autuações federais de IRPJ/CSLL.'
    },
    analiseCriticaDoutrinaria: `O STJ pacificou a distinção entre crédito presumido de ICMS e demais benefícios fiscais:
1. Crédito Presumido de ICMS: Pode ser excluído do IRPJ/CSLL independentemente de requisitos do Art. 30 da Lei 12.973/14, por violação ao pacto federativo (EREsp 1.517.492/PR);
2. Isenção, Redução de Base e Diferimento: Exigem o cumprimento da destinação dos valores para a Reserva de Incentivos Fiscais no patrimônio líquido, vedada a distribuição a sócios.`,
    parecerJuridicoComentado: `Revisa-se a apuração de lucros da empresa para constituir formalmente a Reserva de Incentivos Fiscais em balanço, impedindo a tributação pelo Fisco Federal.`,
    teseDefensivaOuRecuperacao: {
      tese: 'Exclusão do Crédito Presumido de ICMS do IRPJ e CSLL sem Exigência de Reserva',
      fundamentacao: 'EREsp 1.517.492/PR c/c Tema 1.182 STJ',
      raciocinioDefensivo: 'Apresentar impugnação ao auto de infração demonstrando que a parcela expurgada decorre exclusivamente de créditos presumidos estaduais.'
    },
    tags: ['Tema 1182 STJ', 'Subvenções para Investimento', 'Crédito Presumido ICMS', 'IRPJ CSLL', 'Art 30 Lei 12973'],
    linkConhecimentoId: 'con-trib-fed-01'
  },
  {
    id: 'dir-trib-07',
    title: 'Não Incidência de Contribuição Previdenciária (INSS Patronal) sobre Verbas Indenizatórias (Tema 1.163 STF)',
    ramo: 'tributario',
    ramoLabel: 'Direito Tributário',
    subtopico: 'Tributação da Folha de Pagamento & Conceito de Remuneração',
    dispositivoLegal: 'Art. 22, I e Art. 28, § 9º da Lei nº 8.212/1991 e Art. 195, I, "a" da CF/88',
    doutrinaReferencia: 'Wladimir Novaes Martinez, Arnaldo Süssekind, Carlos Alberto Pereira das Neves',
    jurisprudenciaTese: {
      tribunal: 'STF',
      numeroTemaOuSumula: 'Tema 1.163 STF e Tema 482 STJ',
      enunciado: 'É inconstitucional a incidência de contribuição previdenciária patronal sobre os valores pagos pelo empregador a título de terço constitucional de férias gozadas, primeiros 15 dias de auxílio-doença/acidente e aviso prévio indenizado, por possuírem nítida natureza indenizatória.',
      impactoEmpresarial: 'Recuperação tributária de até 20% sobre a folha de pagamento de verbas indenatórias pagas nos últimos 5 anos.'
    },
    analiseCriticaDoutrinaria: `A base de cálculo da contribuição previdenciária patronal compreende exclusivamente as verbas de caráter remuneratório destinadas a retribuir o trabalho.
Verbas Indenizatórias Excluídas da Incidência:
1. Terço Constitucional de Férias Gozadas;
2. Primeiros 15 Dias de Afastamento por Auxílio-Doença ou Acidente;
3. Aviso Prévio Indenizado;
4. Salário-Maternidade (Tema 72 do STF).`,
    parecerJuridicoComentado: `Retifica-se a GFIP/eSocial/DCTFWeb dos últimos 60 meses para compensar os valores recolhidos indevidamente no e-CAC via Per/Dcomp Web.`,
    teseDefensivaOuRecuperacao: {
      tese: 'Repetição de Indébito da Contribuição Previdenciária sobre Verbas Indenizatórias',
      fundamentacao: 'Tema 1.163 STF c/c Art. 195, I, "a" da CF/88',
      raciocinioDefensivo: 'Apresentar os resumos das folhas de pagamento ajustadas e pedir a restituição/compensação com contribuições futuras de INSS.'
    },
    tags: ['INSS Patronal', 'Tema 1163 STF', 'Terço de Férias', 'Auxílio-Doença', 'Aviso Prévio Indenizado'],
    linkConhecimentoId: 'con-fisc-02'
  },
  {
    id: 'dir-trib-08',
    title: 'Planejamento Tributário Legítimo vs. Simulação Fiscamente Abusiva (Art. 116, Parágrafo Único do CTN & CARF)',
    ramo: 'tributario',
    ramoLabel: 'Direito Tributário',
    subtopico: 'Elisão Fiscal, Propósito Negocial e Limites da Fiscalização',
    dispositivoLegal: 'Art. 116, Parágrafo Único do CTN (com redação da LC 104/2001) e Art. 149 do CTN',
    doutrinaReferencia: 'Marco Aurélio Greco ("Planejamento Tributário"), Heleno Taveira Tôrres, Alberto Xavier',
    jurisprudenciaTese: {
      tribunal: 'CARF',
      numeroTemaOuSumula: 'ADI 2.446 STF e Súmula CARF nº 149',
      enunciado: 'É lícita a estruturação de negócios jurídicos que resulte na menor carga tributária possível (elisão fiscal), desde que munida de efetivo propósito negocial e ausentes a simulação, fraude ou dolo específico.',
      impactoEmpresarial: 'Garantia de validade para operações de reorganização societária (incorporações, cisões e holdings patrimoniais) planejadas com antecedência.'
    },
    analiseCriticaDoutrinaria: `A distinção entre elisão e evasão fiscal é pilar da segurança jurídica corporativa:
1. Elisão Fiscal (Lícita): Adopção de alternativas jurídicas legais antes da ocorrência do fato gerador para evitar ou mitigar a incidência tributária;
2. Evasão Fiscal (Ilícita): Ocultação, fraude ou simulação praticadas após a ocorrência do fato gerador;
3. Critério do Propósito Negocial (Business Purpose): A operação deve demonstrar motivações operacionais, econômicas ou de governança reais, e não a mera criação de véu jurídico para suprimir impostos.`,
    parecerJuridicoComentado: `Todas as operações de reestruturação empresarial e reorganização de grupos econômicos devem ser respaldadas por dossiê técnico de propósito negocial demonstrando ganhos operacionais e de gestão.`,
    teseDefensivaOuRecuperacao: {
      tese: 'Validade da Elisão Fiscal com Demarcação de Propósito Negocial Efetivo',
      fundamentacao: 'ADI 2.446 STF c/c Art. 116, Parágrafo Único do CTN',
      raciocinioDefensivo: 'Demonstrar no recurso administrativo ao CARF que a operação societária gerou ganhos de sinergia e redução de custos operacionais autênticos.'
    },
    tags: ['Planejamento Tributário', 'Elisão Fiscal', 'Propósito Negocial', 'Art 116 CTN', 'CARF', 'ADI 2446'],
    linkConhecimentoId: 'con-soc-02'
  }
];
