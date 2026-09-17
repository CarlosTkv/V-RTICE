import { ConhecimentoItem } from '../conhecimentosData';

export const CONHECIMENTOS_FISCAL: ConhecimentoItem[] = [
  {
    id: 'con-fisc-01',
    title: 'EFD ICMS/IPI (SPED Fiscal) e Livro Registro de Controle da Produção e do Estoque (Bloco K)',
    assunto: 'fiscal',
    assuntoLabel: 'Fiscal & SPED',
    subdivisao: 'estadual',
    subdivisaoLabel: 'Estadual (SEFAZ 27 UFs / ICMS / ST / DIFAL)',
    normaOficial: 'Ajuste SINIEF nº 02/2009, Guia Prático da EFD ICMS/IPI e Ajuste SINIEF nº 25/2022',
    orgaoEmissor: 'CONFAZ / Receita Federal do Brasil / SEFAZ Estaduais',
    resumoTecnico: 'Escrituração digital dos livros fiscais de Entradas, Saídas, Apuração de ICMS/IPI e do Bloco K (versão simplificada ou completa), detalhando fichas técnicas de produtos (K200 e K280), insumos consumidos e perdas do processo fabril.',
    conteudoDetalhador: `A EFD ICMS/IPI é o arquivo digital estruturado em blocos para controle fiscal estadual e federal:

1. Estrutura dos Blocos Principais:
- Bloco 0: Abertura, Identificação da Entidade, Tabela de Cadastros de Participantes e Itens (0200);
- Bloco C: Documentos Fiscais I - Mercadorias (NF-e mod. 55, NFC-e mod. 65, cupom fiscal);
- Bloco D: Documentos Fiscais II - Serviços de Transporte (CT-e) e Comunicação;
- Bloco E: Apuração do ICMS Próprio, ICMS-ST e IPI;
- Bloco G: Controle do Crédito de ICMS do Ativo Permanente (CIAP - 1/48 avos);
- Bloco H: Inventário Físico Anual (obrigatório em fevereiro com dados de 31/dezembro);
- Bloco 1: Outras informações (controle de créditos acumulados, exportações e operações interestaduais).

2. O Desafio do Bloco K (Controle de Produção e Estoque):
- Registro 0200: Tabela de Itens com NCM e Unidade de Medida Padronizada;
- Registro 0210: Consumo Padronizado (Ficha Técnica / Lista Técnica de Engenharia do Produto);
- Registro K200: Posição do Estoque Escriturado por Tipo de Item (matéria-prima, produto em elaboração, produto acabado);
- Registro K280: Correção de Apontamento de Estoque de Períodos Anteriores;
- Registro K230 / K235: Itens Produzidos e Insumos Efetivamente Consumidos na Ordem de Produção (OP).

3. Fiscalização e Cruzamentos:
O Fisco cruza o estoque inicial (Bloco H anterior) + Entradas (Bloco C) - Consumo Fabril (Bloco K) - Vendas (Bloco C) = Estoque Final. Divergências geram presunção de omissão de receitas ou saída sem nota fiscal.`,
    fundamentacaoLegal: [
      'Ajuste SINIEF nº 02/2009 e alterações posteriores',
      'Ajuste SINIEF nº 25/2022 (Cronograma de obrigatoriedade do Bloco K)',
      'Art. 251 do Regulamento do IPI (Decreto nº 7.212/2010)'
    ],
    exemploPratico: {
      cenario: 'Indústria metalmecânica apurou no mês entradas de 10 toneladas de aço e declarou vendas de 8 toneladas de peças prontas.',
      aplicacao: 'Apresentação do Bloco K com o apontamento das perdas normais do processo industrial de 200 kg (sucata) e o saldo de estoque remanescente de 1,8 tonelada de matéria-prima no Registro K200.',
      conclusao: 'Evita a autuação por presunção de venda de mercadoria sem emissão de documento fiscal (omissão de saída).'
    },
    tags: ['SPED Fiscal', 'EFD ICMS/IPI', 'Bloco K', 'CIAP', 'Bloco H', 'Ficha Técnica 0210'],
    linkDireitoId: 'dir-adm-01'
  },
  {
    id: 'con-fisc-02',
    title: 'EFD-Contribuições: Apuração de PIS/COFINS Não Cumulativo, Regras de Insumos e Parecer Cosit nº 5/2018',
    assunto: 'fiscal',
    assuntoLabel: 'Fiscal & SPED',
    subdivisao: 'federal',
    subdivisaoLabel: 'Federal (RFB / PGFN / IPI / PGDAS)',
    normaOficial: 'Instrução Normativa RFB nº 2.152/2023 e Parecer Normativo Cosit nº 5/2018',
    orgaoEmissor: 'Secretaria Especial da Receita Federal do Brasil',
    resumoTecnico: 'Escrituração digital mensal das contribuições de PIS/Pasep e COFINS nos regimes cumulativo e não cumulativo, aplicando os critérios do STJ (Tema 779) para apropriação de créditos de insumos essenciais ou relevantes.',
    conteudoDetalhador: `A EFD-Contribuições disciplina a sistemática de apuração e creditamento:

1. Regime Não Cumulativo (Leis 10.637/02 e 10.833/03):
- Alíquotas Básicas: 1,65% (PIS) e 7,60% (COFINS) = 9,25% sobre o faturamento bruto;
- Hipóteses Legais de Crédito (Art. 3º):
  I - Bens adquiridos para revenda;
  II - Bens e serviços utilizados como INSUMO na prestação de serviços ou na produção/fabricação;
  III - Energia elétrica e térmica consumida nos estabelecimentos;
  IV - Aluguéis de prédios pagos a pessoa jurídica;
  V - Arrendamento mercantil (leasing);
  VI - Depreciação de máquinas e equipamentos utilizados na produção;
  VII - Frete na operação de venda e na aquisição de insumos.

2. O Conceito de Insumos (Tema 779 do STJ e Parecer Normativo Cosit nº 5/2018):
- Critério da Essencialidade: o elemento de que depende o processo produtivo, sem o qual não há o produto ou o serviço com o mesmo nível de qualidade;
- Critério da Relevância: o elemento que integra o processo produtivo por imposição legal (ex: EPIs, tratamento de efluentes, laudos técnicos obrigatórios);
- Não geram crédito: despesas comerciais, publicidade, honorários advocatícios em geral e frete entre estabelecimentos da mesma empresa para mercadorias em revenda.

3. Blocos da EFD-Contribuições:
- Bloco A: Documentos Fiscais - Serviços (ISSQN);
- Bloco C: Documentos Fiscais - Mercadorias (PIS/COFINS sobre NF-e);
- Bloco F: Demais Documentos e Operações (Créditos de Aluguel, Depreciação, Energia e Arrendamento);
- Bloco M: Apuração do PIS/Pasep (M200/M210) e da COFINS (M600/M610).`,
    fundamentacaoLegal: [
      'Leis nº 10.637/2002 e 10.833/2003 (Arts. 2º e 3º)',
      'Tema 779 do Superior Tribunal de Justiça (REsp 1.221.170/PR)',
      'Instrução Normativa RFB nº 2.152/2023 (Consolidação de PIS/COFINS)'
    ],
    exemploPratico: {
      cenario: 'Indústria alimentícia contrata serviços de controle de pragas obrigatórios por norma sanitária da ANVISA e compra EPIs para os operadores.',
      aplicacao: 'Apropriação de crédito de 9,25% de PIS/COFINS sobre as notas fiscais de serviços e compras de EPIs no Bloco C e F da EFD-Contribuições com base no critério da relevância por imposição legal.',
      conclusao: 'Redução legítima do PIS e da COFINS devidos no mês sem risco de glosa fiscal pela Receita Federal.'
    },
    tags: ['EFD-Contribuições', 'PIS/COFINS', 'Tema 779 STJ', 'Crédito de Insumos', 'Essencialidade e Relevância'],
    linkDireitoId: 'dir-trib-02'
  },
  {
    id: 'con-fisc-03',
    title: 'ECF (Escrituração Contábil Fiscal): Conciliação Societária vs. Fiscal, Blocos M e N e Cruzamento com a ECD',
    assunto: 'fiscal',
    assuntoLabel: 'Fiscal & SPED',
    subdivisao: 'federal',
    subdivisaoLabel: 'Federal (RFB / PGFN / IPI / PGDAS)',
    normaOficial: 'Instrução Normativa RFB nº 2.004/2021 e Manual de Orientação do Leiaute da ECF',
    orgaoEmissor: 'Secretaria Especial da Receita Federal do Brasil',
    resumoTecnico: 'Obrigação acessória anual que substituiu a antiga DIPJ, interligando a escrituração societária (ECD) aos ajustes fiscais do e-LALUR e e-LACS para a apuração da base do IRPJ e da CSLL.',
    conteudoDetalhador: `A ECF é o coração da apuração tributária das pessoas jurídicas tributadas pelo Lucro Real, Presumido ou Imunes/Isentas:

1. Mecanismo de Recuperação de Dados da ECD (Bloco J e K):
- A ECF recupera o plano de contas contábil e os saldos finais da ECD (Escrituração Contábil Digital);
- Mapeamento Obrigatório para o Plano de Contas Referencial da Receita Federal.

2. Ajustes Fiscais no Bloco M (e-LALUR e e-LACS):
- Parte A do e-LALUR:
  a) Adições Obrigatórias: Despesas indedutíveis (brindes, multas punitivas, provisões não pagas, excesso de depreciação societária);
  b) Exclusões Autorizadas: Depreciação acelerada incentivada, juros sobre capital próprio (JCP), receitas de equivalência patrimonial (MEP);
  c) Compensações: Abatimento de prejuízos fiscais até a trava legal de 30%;
- Parte B do e-LALUR: Controle de valores que influenciarão apurações futuras (prejuízos a compensar, despesas diferidas, depreciação acumulada diferenciada).

3. Bloco N (Cálculo do IRPJ e da CSLL):
- Apuração do IRPJ Básico (15%) + Adicional (10%) e CSLL (9%);
- Dedução de incentivos fiscais (PAT, Rouanet, Audiovisual) e retenções na fonte (IRRF).

4. Validações e Malhas Fiscais:
Qualquer divergência entre os números declarados na ECF e os dados transmitidos na ECD, DCTF ou EFD-Contribuições gera travamento no PVA ou inclusão imediata na Malha Fina da PJ.`,
    fundamentacaoLegal: [
      'Instrução Normativa RFB nº 2.004/2021 e alterações posteriores',
      'Art. 257 do Regulamento do Imposto de Renda (Decreto nº 9.580/2018)',
      'Lei nº 12.973/2014 (Adequação aos padrões internacionais de contabilidade)'
    ],
    exemploPratico: {
      cenario: 'Empresa do Lucro Real registrou despesa contábil de R$ 50.000,00 com multas de trânsito e provisão de perdas cíveis.',
      aplicacao: 'A contabilidade adiciona os R$ 50.000,00 no Bloco M (e-LALUR/e-LACS) como adição definitiva na Parte A, recalculando o IRPJ e a CSLL sem abater essas despesas vedadas pela lei fiscal.',
      conclusao: 'Transmissão da ECF sem inconsistências no validador da Receita Federal e conformidade fiscal absoluta.'
    },
    tags: ['ECF', 'ECD', 'e-LALUR', 'e-LACS', 'Bloco M', 'Adições e Exclusões', 'Malha Fiscal PJ'],
    linkDireitoId: 'dir-trib-03'
  },
  {
    id: 'con-fisc-04',
    title: 'DCTFWeb e Fechamento Integrado da EFD-Reinf (Série R-4000 e R-2000) e eSocial',
    assunto: 'fiscal',
    assuntoLabel: 'Fiscal & SPED',
    subdivisao: 'federal',
    subdivisaoLabel: 'Federal (RFB / PGFN / IPI / PGDAS)',
    normaOficial: 'Instrução Normativa RFB nº 2.005/2021 e IN RFB nº 2.043/2021',
    orgaoEmissor: 'Secretaria Especial da Receita Federal do Brasil',
    resumoTecnico: 'Declaração eletrônica mensal que confessa débitos de contribuições previdenciárias (eSocial/Reinf) e retenções de IRPJ, CSLL, PIS e COFINS (Reinf Série R-4000), gerando a guia única DARF Numerado.',
    conteudoDetalhador: `A DCTFWeb é o ponto de convergência de todas as obrigações tributárias e trabalhistas federais:

1. Fluxo de Alimentação e Transmissão:
- O eSocial envia o evento S-1299 (Fechamento) com as contribuições previdenciárias de empregados, pró-labore e avulsos;
- A EFD-Reinf envia o evento R-2099 (Fechamento Previdenciário) e o evento R-4099 (Fechamento de Retenções na Fonte);
- A DCTFWeb consolida automaticamente as informações na base de dados da Receita Federal;
- O contribuinte acessa o portal e-CAC, realiza eventuais vinculações de créditos (suspensões judiciais, compensações de salário-família ou retenções sofridas) e transmite a declaração.

2. A Nova EFD-Reinf Série R-4000 (Substituta definitiva da antiga DIRF):
- Evento R-4010: Pagamentos/créditos a pessoa física (honorários, aluguéis, serviços sem vínculo empregatício);
- Evento R-4020: Pagamentos/créditos a pessoa jurídica (serviços sujeitos a IRRF 1,5% e CSRF 4,65%);
- Evento R-4040: Pagamentos a beneficiários não identificados;
- Evento R-4080: Retenção no recebimento (auto-retenção por agências de propaganda, cartões, etc.).

3. Emissão do DARF Numerado e Vinculação ao Per/Dcomp Web:
- A DCTFWeb gera a guia unificada com código de barras e QR Code Pix;
- Saldos credores de retenção sofrida (R-2020) ou pagamentos indevidos podem ser compensados diretamente via Per/Dcomp Web interligado à DCTFWeb.`,
    fundamentacaoLegal: [
      'Instrução Normativa RFB nº 2.005/2021 (DCTFWeb)',
      'Instrução Normativa RFB nº 2.043/2021 (EFD-Reinf)',
      'Art. 83 da Lei nº 9.430/1996 e Decreto nº 8.373/2014'
    ],
    exemploPratico: {
      cenario: 'Empresa contratou serviços de segurança privada com retenção de R$ 5.000,00 de INSS e tomou consultoria com R$ 1.500,00 de IRRF e R$ 4.650,00 de CSRF.',
      aplicacao: 'Escrituração no R-2010 (INSS) e R-4020 (IRRF/CSRF) da EFD-Reinf. Fechamento R-4099 transmite os débitos à DCTFWeb gerando o DARF único para recolhimento no dia 20.',
      conclusao: 'Conformidade com a extinção da DIRF e controle centralizado de passivos na Receita Federal.'
    },
    tags: ['DCTFWeb', 'EFD-Reinf', 'Série R-4000', 'eSocial', 'DARF Numerado', 'Fim da DIRF'],
    linkDireitoId: 'dir-trib-04'
  },
  {
    id: 'con-fisc-05',
    title: 'Auditoria Fiscal Digital: Cruzamento de E-Financeira Bancária/Pix, Cartões (Convênio 134/16) e NF-e',
    assunto: 'fiscal',
    assuntoLabel: 'Fiscal & SPED',
    subdivisao: 'federal',
    subdivisaoLabel: 'Federal (RFB / PGFN / IPI / PGDAS)',
    normaOficial: 'IN RFB nº 1.571/2015 (E-Financeira), Art. 42 da Lei nº 9.430/1996 e Convênio ICMS nº 134/2016',
    orgaoEmissor: 'Receita Federal do Brasil / SEFAZ Estaduais / COAF',
    resumoTecnico: 'Algoritmos e malhas fiscais das Fazendas Federal e Estaduais que cruzam em tempo real faturamento fiscal emitido (NF-e/NFC-e) com movimentações financeiras bancárias, Pix, cartões de crédito/débito e extratos de adquirentes.',
    conteudoDetalhador: `A fiscalização tributária brasileira opera no mais alto nível de automação tecnológica do mundo:

1. A Malha da E-Financeira (IN RFB nº 1.571/2015):
- Os bancos, cooperativas de crédito e fintechs são obrigados a reportar semestralmente à RFB toda movimentação financeira quando o montante global movimentado no mês ultrapassar:
  a) R$ 2.000,00 para Pessoas Físicas;
  b) R$ 6.000,00 para Pessoas Jurídicas;
- Inclui: saldos de contas correntes, poupança, investimentos, remessas ao exterior e transações Pix.

2. A Malha de Cartões e Meios Eletrônicos (DIMP e Convênio ICMS 134/2016):
- As credenciadoras de cartão (adquirentes/subadquirentes) e intermediadores de pagamento (marketplaces) enviam mensalmente às Secretarias Estaduais de Fazenda a Declaração de Informações de Meios de Pagamentos (DIMP);
- A SEFAZ confronta o total de vendas por cartão/Pix informado pela credenciadora com o total de NF-e/NFC-e emitidas pelo estabelecimento comercial.

3. Presunção Legal de Omissão de Receita (Art. 42 da Lei nº 9.430/1996):
- Identificada movimentação bancária ou recebimentos em cartão superiores aos rendimentos declarados, a lei presume a ocorrência de omissão de receitas tributáveis;
- Cabe ao contribuinte o ônus probatório de justificar documentalmente a origem dos recursos (empréstimos mútuos, transferências entre contas próprias ou aportes de capital).`,
    fundamentacaoLegal: [
      'Art. 42 da Lei nº 9.430/1996 (Presunção de Omissão de Receitas)',
      'Instrução Normativa RFB nº 1.571/2015 (E-Financeira)',
      'Convênio ICMS CONFAZ nº 134/2016 e alterações posteriores (DIMP)'
    ],
    exemploPratico: {
      cenario: 'Comércio varejista faturou no mês R$ 150.000,00 em vendas por cartão de crédito/Pix mas emitiu apenas R$ 50.000,00 em NFC-e.',
      aplicacao: 'A SEFAZ estadual emite notificação eletrônica automática de divergência no DIMP com prazo de autorregularização antes de lavrar Auto de Infração com multa punitiva de 100%.',
      conclusao: 'Necessidade imperativa de conciliação diária de PDV e emissão fiscal de 100% dos meios de pagamento eletrônicos.'
    },
    tags: ['Auditoria Digital', 'E-Financeira', 'DIMP', 'Convênio 134/16', 'Cruzamento Pix', 'Art 42 Lei 9430'],
    linkDireitoId: 'dir-pen-01'
  }
];
