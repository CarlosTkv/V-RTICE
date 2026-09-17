import { DireitoItem } from '../direitoData';

export const DIREITO_NFSE_REFORMA: DireitoItem[] = [
  {
    id: 'dir-nfse-01',
    title: 'Padrão Nacional da NFS-e (Lei Complementar 116/2003, Convênio ABRASF & Emissor Gov.br)',
    ramo: 'nfse_reforma',
    ramoLabel: 'NFS-e & Reforma Tributária',
    subtopico: 'Padronização Nacional de Documentos Fiscais de Serviço (CGNFS-e)',
    dispositivoLegal: 'Lei Complementar nº 116/2003, Resolução CGSN nº 169/2022 e Decreto nº 10.994/2022',
    doutrinaReferencia: 'Comitê Gestor da NFS-e Nacional, ABRASF (Associação Brasileira das Secretarias de Finanças das Capitais)',
    jurisprudenciaTese: {
      tribunal: 'STF',
      numeroTemaOuSumula: 'ADI 4.395 / Tema 1.024 STF',
      enunciado: 'A padronização nacional da Nota Fiscal de Serviço eletrônica (NFS-e) por meio do ADN (Ambiente Nacional de Dados) não viola a autonomia municipal de tributar o ISS, constituindo dever de cooperação federativa e simplificação das obrigações acessórias.',
      impactoEmpresarial: 'Obrigatoriedade universal de emissão pelo padrão nacional no Portal Gov.br para prestadores de serviços, reduzindo a burocracia de múltiplos portais municipais.'
    },
    analiseCriticaDoutrinaria: `A instituição do Padrão Nacional da NFS-e resolveu a histórica pulverização de mais de 5.500 legislações e portais municipais distintos. A Declaração de Prestação de Serviços (DPS) transmitida ao Ambiente Nacional de Dados (ADN) gera a NFS-e com chave de acesso única de 50 dígitos.
Principais Requisitos Fiscais:
1. Código de Tributação Nacional ABRASF (NBS - Nomenclatura Brasileira de Serviços);
2. Enquadramento no Item da Lista Anexa à LC 116/03;
3. Assinatura Digital mTLS com Certificado ICP-Brasil (e-CNPJ A1/A3);
4. Validação pelo Pacote de Schemas XSD v1.01-2026.`,
    parecerJuridicoComentado: `A adesão das empresas ao Emissor Nacional Gov.br garante validade jurídica plena perante todas as prefeituras brasileiras e previne autuações por descumprimento de obrigação acessória municipal.`,
    teseDefensivaOuRecuperacao: {
      tese: 'Invalidade de Sanções Municipais por Utilização do Emissor Nacional Gov.br',
      fundamentacao: 'Art. 156, III da CF/88 c/c Resolução CGSN nº 169/2022',
      raciocinioDefensivo: 'Demonstrar a regularidade da nota emitida no ADN Gov.br com a chave de 50 dígitos, elidindo a pretensão de autuação por parte de fiscais municipais.'
    },
    tags: ['NFS-e Nacional', 'Gov.br', 'LC 116/03', 'ABRASF', 'ADN', 'DPS'],
    linkConhecimentoId: 'con-fisc-01'
  },
  {
    id: 'dir-nfse-02',
    title: 'Reforma Tributária (EC 132/2023): Substituição do ISS e PIS/COFINS pelo IBS e CBS',
    ramo: 'nfse_reforma',
    ramoLabel: 'NFS-e & Reforma Tributária',
    subtopico: 'Dual IVA (Imposto sobre Bens e Serviços & Contribuição sobre Bens e Serviços)',
    dispositivoLegal: 'Art. 156-A e Art. 195, V da CF/88 (incluídos pela Emenda Constitucional nº 132/2023)',
    doutrinaReferencia: 'Eurico Marcos Diniz de Santi, Bernard Appy, Everardo Maciel, Sergio André Rocha',
    jurisprudenciaTese: {
      tribunal: 'STF',
      numeroTemaOuSumula: 'Emenda Constitucional 132/2023 (Reforma Tributária do Consumo)',
      enunciado: 'O Imposto sobre Bens e Serviços (IBS), de competência compartilhada de Estados e Municípios, e a Contribuição sobre Bens e Serviços (CBS), de competência da União, incidem sobre operações com bens materiais e imateriais, inclusive serviços e direitos, pelo princípio do destino.',
      impactoEmpresarial: 'Fim da cumulatividade no setor de serviços e garantia de aproveitamento integral de créditos fiscais nas etapas anteriores.'
    },
    analiseCriticaDoutrinaria: `A EC 132/2023 extingue o ISS e a PIS/COFINS, unificando a tributação do setor de serviços sob a égide do IVA Dual.
Pontos Cardeais da Reforma na NFS-e:
1. Tributação no Destino: O IBS/CBS pertence ao município/estado onde o serviço é efetivamente consumido;
2. Não Cumulatividade Plena: Todo o imposto recolhido na emissão da NFS-e gera crédito financeiro imediato para o comprador PJ;
3. Alíquota Padrão e Regimes Diferenciados: Serviços de saúde, educação e profissões regulamentadas possuem alíquotas reduzidas em 30% a 60%.`,
    parecerJuridicoComentado: `As empresas prestadoras de serviço devem readequar seus sistemas emissores para destacar os campos de IBS/CBS na NFS-e a partir do período de testes operacionais de 2026.`,
    teseDefensivaOuRecuperacao: {
      tese: 'Direito ao Crédito Financeiro Integral do IVA nas Aquisições de Serviços',
      fundamentacao: 'Art. 156-A, § 1º, VIII da CF/88 c/c EC 132/2023',
      raciocinioDefensivo: 'Exigir a dedução de créditos de IBS e CBS destacados nas notas fiscais de fornecedores de insumos de serviços.'
    },
    tags: ['Reforma Tributária', 'EC 132/23', 'IBS', 'CBS', 'IVA Dual', 'Princípio do Destino'],
    linkConhecimentoId: 'con-fisc-02'
  },
  {
    id: 'dir-nfse-03',
    title: 'Mecanismo de Split Payment Obrigatório nas Transações com NFS-e Nacional',
    ramo: 'nfse_reforma',
    ramoLabel: 'NFS-e & Reforma Tributária',
    subtopico: 'Retenção e Recolhimento Automatizado via Sistema Bancário (BACEN)',
    dispositivoLegal: 'Art. 156-A, § 5º, VI da CF/88 (EC 132/2023) e Regulamento do Comitê Gestor do IBS',
    doutrinaReferencia: 'Banco Central do Brasil, Receita Federal do Brasil, Comitê Gestor do IBS',
    jurisprudenciaTese: {
      tribunal: 'STF',
      numeroTemaOuSumula: 'Norma Constitucional Originária Reformada (EC 132/23)',
      enunciado: 'O recolhimento do IBS e da CBS incidente sobre a prestação de serviços poderá ser efetuado mediante retenção automática no ato do pagamento financeiro (Split Payment Smart), segregando o imposto diretamente para a conta do Tesouro.',
      impactoEmpresarial: 'Eliminação da inadimplência fiscal e do envio de guias mensais de recolhimento, liberando no caixa da empresa apenas o valor líquido descontado dos impostos.'
    },
    analiseCriticaDoutrinaria: `O Split Payment conecta a emissão da NFS-e no ADN Gov.br ao arranjo de pagamento (PIX, Boleto, Cartão de Crédito).
Como funciona a liquidação:
1. A NFS-e é emitida destacando os valores de IBS e CBS;
2. O QR Code PIX ou linha digitável do Boleto embute a chave da NFS-e;
3. Na liquidação bancária, o arranjo de pagamento destina o tributo ao Comitê Gestor e o saldo líquido à conta corrente do prestador.`,
    parecerJuridicoComentado: `O Split Payment reduz drasticamente os custos operacionais de compliance fiscal das empresas e impede autuações por falta de recolhimento de guia.`,
    teseDefensivaOuRecuperacao: {
      tese: 'Vedações a Retenções em Duplicidade no Split Payment Bancário',
      fundamentacao: 'Art. 156-A, § 5º, VI da CF/88',
      raciocinioDefensivo: 'Apresentar o comprovante da liquidação financeira com o comprovante de retenção na fonte pelo arranjo de pagamento para cancelar débitos no DARF/DARE.'
    },
    tags: ['Split Payment', 'BACEN', 'Recolhimento Automático', 'PIX Fiscal', 'Boleto Inteligente'],
    linkConhecimentoId: 'con-fisc-03'
  },
  {
    id: 'dir-nfse-04',
    title: 'Regime de Transição do ISS/PIS/COFINS para IBS/CBS (2026 a 2032)',
    ramo: 'nfse_reforma',
    ramoLabel: 'NFS-e & Reforma Tributária',
    subtopico: 'Cronograma de Transição Gradual das Alíquotas e Regras Fiscais',
    dispositivoLegal: 'Arts. 125 a 133 das Disposições Transitórias da EC nº 132/2023',
    doutrinaReferencia: 'Secretaria Extraordinária da Reforma Tributária (Ministério da Fazenda)',
    jurisprudenciaTese: {
      tribunal: 'STF',
      numeroTemaOuSumula: 'Regra Constitucional Transitória (EC 132/23)',
      enunciado: 'Durante o período de transição (2026-2032), a cobrança de PIS/COFINS e ISS coexistirá de forma proporcional e decrescente com a implantação do IBS e da CBS nas Notas Fiscais de Serviço.',
      impactoEmpresarial: 'Exige que os softwares de emissão de NFS-e mantenham cálculo simultâneo dos tributos antigos e novos no mesmo documento fiscal.'
    },
    analiseCriticaDoutrinaria: `Cronograma Oficial de Transição:
- 2026: Fase de Testes com alíquota de 0,9% para CBS e 0,1% para IBS (compensáveis com PIS/COFINS);
- 2027: Extinção do PIS/COFINS e vigência integral da CBS com alíquota de referência;
- 2029 a 2032: Redução gradual de 1/10 por ano do ISS e aumento proporcional do IBS;
- 2033: Extinção definitiva do ISS municipal e vigência exclusiva do IBS.`,
    parecerJuridicoComentado: `O acompanhamento atento do cronograma transitório evita duplicidade de recolhimento e garante o perfeito aproveitamento dos créditos acumulados do modelo antigo.`,
    teseDefensivaOuRecuperacao: {
      tese: 'Compensação dos Valores Recolhidos na Fase de Testes (2026) com PIS/COFINS Devido',
      fundamentacao: 'Art. 125 das ADCT c/c EC 132/2023',
      raciocinioDefensivo: 'Utilizar a CBS/IBS de teste (1,0%) recolhida na NFS-e para deduzir da guia mensal de PIS/COFINS apurada no Simples/Lucro Presumido.'
    },
    tags: ['Transição Tributária', '2026-2032', 'Extinção ISS', 'Entrada CBS', 'ADCT EC 132'],
    linkConhecimentoId: 'con-fisc-04'
  },
  {
    id: 'dir-nfse-05',
    title: 'Sigilo Fiscal, Proteção de Dados (LGPD) e Segurança no ADN Gov.br',
    ramo: 'nfse_reforma',
    ramoLabel: 'NFS-e & Reforma Tributária',
    subtopico: 'Privacidade de Dados e Compartilhamento de NFS-e entre Entes Federativos',
    dispositivoLegal: 'Art. 198 do CTN, Lei nº 13.709/2018 (LGPD) e Portaria Conjunta RFB/SGD nº 23/2022',
    doutrinaReferencia: 'ANPD (Autoridade Nacional de Proteção de Dados), Tarcísio Teixeira, Danilo Doneda',
    jurisprudenciaTese: {
      tribunal: 'STF',
      numeroTemaOuSumula: 'Tema 225 STF (RE 601.314) e ADI 6.649',
      enunciado: 'O compartilhamento de dados fiscais constantes de NFS-e entre fiscos municipais, estaduais e federais mediante ambiente seguro (ADN Gov.br) não viola o sigilo fiscal ou bancário, desde que resguardada a confidencialidade perante terceiros sem interesse legítimo.',
      impactoEmpresarial: 'Garantia de que os dados comerciais e de precificação de serviços contidos nas NFS-e sejam acessados exclusivamente por órgãos fiscais autorizados.'
    },
    analiseCriticaDoutrinaria: `A centralização dos dados de NFS-e no Portal Gov.br exige conformidade estrita com o Art. 198 do CTN e a LGPD. As notas fiscais contêm dados pessoais do tomador (CPF, endereço, e-mail) e dados estratégicos (preços, volume de vendas).
Medidas de Segurança Exigidas:
1. Criptografia em trânsito via protocolo TLS 1.3 e autenticação por certificado digital ICP-Brasil;
2. Registro inalterável de auditoria (logs de acesso ao ADN);
3. Anonimização ou pseudonimização em estatísticas públicas de arrecadação.`,
    parecerJuridicoComentado: `Caso haja vazamento indesejado de dados de faturamento ou clientes via falha no sistema fiscal, a empresa tomadora/prestadora possui direito a indenização e representação na ANPD.`,
    teseDefensivaOuRecuperacao: {
      tese: 'Impedimento ao Fornecimento de NFS-e a Terceiros sem Ordem Judicial',
      fundamentacao: 'Art. 198 do CTN c/c Art. 5º, X e XII da Constituição Federal',
      raciocinioDefensivo: 'Impedir que prefeituras forneçam cópias de NFS-e contendo segredos industriais ou comerciais a concorrentes.'
    },
    tags: ['Sigilo Fiscal', 'LGPD', 'Art 198 CTN', 'ADN Gov.br', 'Criptografia', 'Segurança de Dados'],
    linkConhecimentoId: 'con-soc-02'
  },
  {
    id: 'dir-nfse-06',
    title: 'Imunidades Fiscais, Isenções no Simples Nacional e Não Incidência em Exportação',
    ramo: 'nfse_reforma',
    ramoLabel: 'NFS-e & Reforma Tributária',
    subtopico: 'Desoneração do Setor de Serviços e Imunidade de Exportação (Art. 156, § 3º, II CF)',
    dispositivoLegal: 'Art. 156, § 3º, II da CF/88, Art. 2º, I da LC 116/03 e Art. 18 da LC 123/06',
    doutrinaReferencia: 'Roque Antonio Carrazza, Leandro Paulsen, Ricardo Alexandre',
    jurisprudenciaTese: {
      tribunal: 'STJ',
      numeroTemaOuSumula: 'Tema 1.055 STJ e REsp 1.838.837/SP',
      enunciado: 'A exportação de serviços para o exterior é imune ao ISS e ao IBS/CBS quando o resultado da prestação se verificar no exterior, ainda que a execução física ocorra no território nacional.',
      impactoEmpresarial: 'Desoneração fiscal completa na NFS-e de empresas brasileiras que prestam serviços de software, engenharia e consultoria para clientes no exterior.'
    },
    analiseCriticaDoutrinaria: `A NFS-e emitida para tomador estrangeiro deve ser enquadrada no regime de Não Incidência por Exportação.
Requisitos para Fruição do Benefício:
1. Tomador domiciliado fora do país;
2. Pagamento em moeda estrangeira ou ingresso de divisas no Brasil;
3. Resultado (fruição útil) verificado fora do território nacional.
Para Optantes do Simples Nacional, os valores de exportação são segregados no PGDAS-D, reduzindo a alíquota efetiva do DAS.`,
    parecerJuridicoComentado: `Na emissão da NFS-e de exportação no Portal Gov.br, é obrigatório selecionar o indicativo de "Prestação de Serviço para o Exterior", o que zera automaticamente o cálculo do ISS/IBS/CBS.`,
    teseDefensivaOuRecuperacao: {
      tese: 'Restituição de ISS/IBS Indevidamente Pago em Exportação de Serviços de TI',
      fundamentacao: 'Art. 156, § 3º, II da CF/88 c/c Art. 2º, I da LC 116/2003',
      raciocinioDefensivo: 'Apresentar os contratos internacionais traduzidos e os comprovantes de ingresso de divisas emitidos pelo banco para recuperar os impostos pagos indevidamente nos últimos 5 anos.'
    },
    tags: ['Exportação de Serviços', 'Imunidade Tributária', 'LC 116/03', 'Simples Nacional', 'Ingresso de Divisas'],
    linkConhecimentoId: 'con-fisc-05'
  },
  {
    id: 'dir-nfse-07',
    title: 'Responsabilidade Tributária do Tomador por Retenção na Fonte (Art. 6º da LC 116/03)',
    ramo: 'nfse_reforma',
    ramoLabel: 'NFS-e & Reforma Tributária',
    subtopico: 'Substituição Tributária e Retenção Obrigatória de Impostos no Pagamento',
    dispositivoLegal: 'Art. 6º da Lei Complementar nº 116/2003 e Instrução Normativa RFB nº 1.234/2012',
    doutrinaReferencia: 'Hugo de Brito Machado, Gabriel Lacerda Troianelli',
    jurisprudenciaTese: {
      tribunal: 'STJ',
      numeroTemaOuSumula: 'Súmula 430 STJ e Tema 582 STJ',
      enunciado: 'O tomador de serviço nomeado substituto tributário por lei municipal/nacional é o responsável exclusivo pelo recolhimento do imposto retido na fonte, elidindo a responsabilidade do prestador caso comprove o desconto efetuado na NFS-e.',
      impactoEmpresarial: 'Protege a empresa prestadora contra cobrança duplicada de imposto quando a nota fiscal já foi emitida com a indicação de retenção pelo tomador.'
    },
    analiseCriticaDoutrinaria: `A substituição tributária no ISS/IBS impõe ao tomador do serviço o dever de reter o imposto no momento do pagamento da NFS-e e recolhê-lo aos cofres públicos.
Casos Clássicos de Retenção Obrigatória no Local da Prestação (Art. 3º da LC 116/03):
- Serviços de construção civil, limpeza, vigilância, transporte municipal e fornecimento de mão de obra temporária.`,
    parecerJuridicoComentado: `Ao emitir a NFS-e no Gov.br, o prestador deve atentar para a marcação correta do campo "Imposto Retido na Fonte pelo Tomador" para evitar ser autuado por falta de pagamento.`,
    teseDefensivaOuRecuperacao: {
      tese: 'Ilegitimidade de Cobrança do Prestador em Caso de Imposto Retido pelo Tomador',
      fundamentacao: 'Art. 6º, § 1º da LC 116/2003 c/c Art. 128 do CTN',
      raciocinioDefensivo: 'Anexar a NFS-e com o comprovante bancário com o valor líquido pago pelo tomador, demonstrando a efetiva retenção na fonte do tributo.'
    },
    tags: ['Retenção na Fonte', 'Substituição Tributária', 'Art 6 LC 116', 'Tomador Responsável', 'NFS-e'],
    linkConhecimentoId: 'con-trib-fed-02'
  },
  {
    id: 'dir-nfse-08',
    title: 'Cancelamento, Substituição de NFS-e e Penalidades por Não Emissão (Resolução CGNFS-e)',
    ramo: 'nfse_reforma',
    ramoLabel: 'NFS-e & Reforma Tributária',
    subtopico: 'Regras de Retificação, Anulação de Documentos Fiscais e Multas Acessórias',
    dispositivoLegal: 'Art. 113, § 3º do CTN e Resolução CGSN nº 169/2022 (Anexo II - Regras da NFS-e)',
    doutrinaReferencia: 'Comitê Gestor da NFS-e Nacional, Marco Aurélio Greco',
    jurisprudenciaTese: {
      tribunal: 'STJ',
      numeroTemaOuSumula: 'REsp 1.230.957/RS',
      enunciado: 'A emissão de nota fiscal substitutiva antes de qualquer procedimento fiscalizatório descaracteriza a infração acessória e enseja a denúncia espontânea (Art. 138 do CTN), sendo descabida a aplicação de multa de ofício.',
      impactoEmpresarial: 'Garantia de que correções de erros de digitação, valores ou tomadores efetuadas via substituição de NFS-e no Portal Gov.br não gerem multas administrativas.'
    },
    analiseCriticaDoutrinaria: `Eventos Oficiais da NFS-e no ADN Gov.br:
1. Cancelamento por Solicitação do Prestador: Cabível quando o serviço não foi prestado ou houve duplicidade na emissão (exige justificativa fundamentada e aceite do tomador se ultrapassado o prazo padrão);
2. Substituição de NFS-e (substNFSe_v1.01.xsd): Cancela a nota anterior e vincula a nova nota com a devida correção de dados, preservando a data do fato gerador;
3. Penalidades Fiscais: A não emissão de NFS-e sujeita a empresa a multas de até 100% do valor do imposto omitido, além de caracterizar crime contra a ordem tributária (Lei 8.137/90).`,
    parecerJuridicoComentado: `A funcionalidade de substituição síncrona no Emissor Nacional é o caminho seguro para sanar incorreções de valores sem expor a empresa a penalidades da fiscalização.`,
    teseDefensivaOuRecuperacao: {
      tese: 'Reconhecimento de Denúncia Espontânea na Substituição Extemporânea de NFS-e',
      fundamentacao: 'Art. 138 do Código Tributário Nacional (CTN)',
      raciocinioDefensivo: 'Apresentar o comprovante da nota substitutiva vinculada e o recolhimento da diferença tributária antes do recebimento de qualquer termo de início de fiscalização.'
    },
    tags: ['Cancelamento NFS-e', 'Substituição de Nota', 'Denúncia Espontânea', 'Art 138 CTN', 'Multa Acessória'],
    linkConhecimentoId: 'con-fisc-03'
  }
];
