import { ConhecimentoItem } from '../conhecimentosData';

export const CONHECIMENTOS_CONTABIL: ConhecimentoItem[] = [
  {
    id: 'con-cont-01',
    title: 'Estruturação das Demonstrações Financeiras Obrigatórias: Balanço, DRE, DFC, DMPL e Notas Explicativas',
    assunto: 'contabil',
    assuntoLabel: 'Contábil & NBC',
    subdivisao: 'federal',
    subdivisaoLabel: 'Federal (RFB / PGFN / IPI / PGDAS)',
    normaOficial: 'NBC TG 26 (R5) / CPC 26 e Lei nº 6.404/1976 (Arts. 175 a 188)',
    orgaoEmissor: 'Conselho Federal de Contabilidade (CFC) / Comitê de Pronunciamentos Contábeis (CPC)',
    resumoTecnico: 'Conjunto completo de relatórios contábeis de encerramento de exercício social para evidenciação fidedigna da posição patrimonial, fluxo de caixa, mutações do patrimônio líquido e desempenho financeiro da entidade.',
    conteudoDetalhador: `A padronização internacional (IFRS) recepcionada pelas NBCs exige a elaboração integrada das seguintes peças:

1. Balanço Patrimonial (BP):
- Ativo Circulante e Não Circulante (Realizável a Longo Prazo, Investimentos, Imobilizado e Intangível);
- Passivo Circulante, Passivo Não Circulante e Patrimônio Líquido (Capital Social, Reservas de Capital, Reservas de Lucros e Ajustes de Avaliação Patrimonial).

2. Demonstração do Resultado do Exercício (DRE):
- Apresentação em cascata da Receita Líquida, Custo das Mercadorias/Serviços Vendidos (CPV/CMV), Lucro Bruto, Despesas Operacionais (vendas, gerais, administrativas), Resultado Financeiro Líquido, Lucro Antes dos Tributos (LAIR) e Lucro Líquido do Exercício (LLE).

3. Demonstração dos Fluxos de Caixa (DFC - NBC TG 03 / CPC 03):
- Método Direto: evidencia as saídas e entradas brutas de caixa operacionais;
- Método Indireto: parte do Lucro Líquido e o ajusta por depreciação, amortização, variações em capital de giro (contas a receber, estoques, fornecedores);
- Segregação obrigatória em 3 fluxos: Operacional, Investimento e Financiamento.

4. Demonstração das Mutações do Patrimônio Líquido (DMPL):
- Movimentação de cada conta do PL (lucros retidos, dividendos propostos, aumentos de capital, absorção de prejuízos).

5. Notas Explicativas (NBC TG 26):
- Políticas contábeis adotadas, contingências, garantias prestadas e eventos subsequentes ao encerramento.`,
    fundamentacaoLegal: [
      'NBC TG 26 (R5) - Apresentação das Demonstrações Contábeis',
      'NBC TG 03 (R3) - Demonstração dos Fluxos de Caixa',
      'Arts. 175 a 188 da Lei nº 6.404/1976 e Lei nº 11.638/2007'
    ],
    exemploPratico: {
      cenario: 'Sociedade Limitada de grande porte prepara seu fechamento anual para prestação de contas aos bancos credores e sócios.',
      aplicacao: 'Apresentação do balanço patrimonial acompanhado da DFC pelo método indireto e DMPL detalhando a distribuição de dividendos do exercício.',
      conclusao: 'Plena conformidade contábil para auditoria externa e renovação de limites de crédito institucional sem ressalvas.'
    },
    tags: ['NBC TG 26', 'CPC 26', 'Balanço Patrimonial', 'DRE', 'DFC', 'DMPL', 'Notas Explicativas'],
    linkDireitoId: 'dir-civ-01'
  },
  {
    id: 'con-cont-02',
    title: 'Valoração e Mensuração de Estoques: Menor Valor entre Custo e VRL, Métodos PEPS e Média (CPC 16)',
    assunto: 'contabil',
    assuntoLabel: 'Contábil & NBC',
    subdivisao: 'federal',
    subdivisaoLabel: 'Federal (RFB / PGFN / IPI / PGDAS)',
    normaOficial: 'NBC TG 16 (R2) / CPC 16 e Art. 290 do RIR/2018',
    orgaoEmissor: 'Conselho Federal de Contabilidade (CFC) / Receita Federal do Brasil',
    resumoTecnico: 'Critérios técnicos de avaliação de estoques na entrada, apuração do custo na baixa (CMV/CPV) e ajuste a valor realizável líquido (VRL) com vedação expressa do método UEPS para fins fiscais e contábeis.',
    conteudoDetalhador: `Os estoques devem ser mensurados pelo menor valor entre o Custo Histórico de Aquisição/Produção e o Valor Realizável Líquido (VRL):

1. Composição do Custo de Entrada:
- Inclui: preço de compra, frete, seguro, impostos NÃO recuperáveis (ex: IPI e ICMS em empresas do Simples ou consumidor final), manuseio e custos de transformação;
- Exclui: impostos recuperáveis (ICMS, IPI, PIS/COFINS em empresas do Lucro Real) e despesas de comercialização.

2. Métodos de Custo e Baixa de Estoques:
- Média Ponderada Móvel (MPM): Custo unitário recalculado a cada nova entrada de mercadorias. Método mais utilizado e aceito universalmente pela RFB;
- PEPS (Primeiro a Entrar, Primeiro a Sair / FIFO): O custo das saídas corresponde às mercadorias mais antigas em estoque. Permitido pelas normas contábeis e pelo RIR/18;
- UEPS (Último a Entrar, Primeiro a Sair / LIFO): ESTRITAMENTE VEDADO pelas NBCs/IFRS e pelo Art. 290 do RIR/18, pois distorce o valor patrimonial e reduz artificialmente o imposto.

3. Ajuste ao Valor Realizável Líquido (Provisão para Perdas em Estoque):
- Valor Realizável Líquido = Preço de venda estimado - custos de conclusão - despesas para concretizar a venda;
- Se o VRL for inferior ao custo contábil, deve-se reconhecer uma perda por desvalorização de estoques no resultado do exercício.`,
    fundamentacaoLegal: [
      'NBC TG 16 (R2) - Estoques (CPC 16)',
      'Arts. 289 a 304 do Decreto nº 9.580/2018 (RIR/2018)',
      'Parecer Normativo CST nº 6/1979 da Receita Federal'
    ],
    exemploPratico: {
      cenario: 'Distribuidora possui 1.000 unidades de produtos eletrônicos adquiridos a R$ 200,00 cada. Lançamento de nova tecnologia reduziu o preço de venda para R$ 170,00 e os custos de venda são de R$ 10,00.',
      aplicacao: 'O VRL é R$ 160,00 (170 - 10). O estoque que estava em R$ 200.000,00 é ajustado para R$ 160.000,00 com lançamento de despesa de provisão para desvalorização de R$ 40.000,00 no resultado.',
      conclusao: 'Evita a superavaliação dos ativos e reflete o real patrimônio líquido da companhia conforme o princípio da prudência.'
    },
    tags: ['CPC 16', 'Estoques', 'Valor Realizável Líquido', 'PEPS', 'Média Móvel', 'Vedação UEPS'],
    linkDireitoId: 'dir-civ-01'
  },
  {
    id: 'con-cont-03',
    title: 'Ativo Imobilizado, Depreciação por Vida Útil Econômica e Teste de Recuperabilidade (CPC 27 e CPC 01)',
    assunto: 'contabil',
    assuntoLabel: 'Contábil & NBC',
    subdivisao: 'federal',
    subdivisaoLabel: 'Federal (RFB / PGFN / IPI / PGDAS)',
    normaOficial: 'NBC TG 27 (R4) / CPC 27 e NBC TG 01 (R4) / CPC 01',
    orgaoEmissor: 'Conselho Federal de Contabilidade (CFC) / Comitê de Pronunciamentos Contábeis (CPC)',
    resumoTecnico: 'Reconhecimento contábil de bens corpóreos destinados à manutenção das atividades, sua depreciação baseada em laudos de vida útil econômica real e obrigatoriedade do teste anual de impairment.',
    conteudoDetalhador: `A contabilização e controle do ativo imobilizado envolve:

1. Reconhecimento e Critério de Capitalização:
- Um item é reconhecido no imobilizado quando é provável que futuros benefícios econômicos associados fluirão para a entidade e o custo puder ser mensurado confiavelmente (vida útil superior a 1 ano e relevância econômica);
- Gastos de manutenção periódica são despesas operacionais do período; melhorias que aumentam a vida útil ou capacidade produtiva são agregadas ao valor contábil do bem.

2. Depreciação Contábil vs. Fiscal:
- Depreciação Contábil (CPC 27): Baseada na Vida Útil Econômica real estimada pela empresa e no Valor Residual do bem;
- Depreciação Fiscal (IN RFB 1.700/17): Taxas lineares pré-fixadas (ex: máquinas 10% a.a., veículos 20% a.a., edifícios 4% a.a.);
- A diferença entre a depreciação societária e a fiscal deve ser ajustada no e-LALUR/e-LACS (adição/exclusão temporária) gerando tributo diferido (CPC 32).

3. Teste de Recuperabilidade (Impairment Test - CPC 01):
- Objetivo: Garantir que os ativos não estejam registrados por valor superior ao seu Valor Recuperável;
- Valor Recuperável = Maior valor entre:
  a) Valor Justo Líquido de Despesas de Venda; e
  b) Valor em Uso (valor presente dos fluxos de caixa futuros descontados);
- Se o Valor Contábil Líquido > Valor Recuperável, deve-se reconhecer a perda por impairment imediatamente no resultado.`,
    fundamentacaoLegal: [
      'NBC TG 27 (R4) - Ativo Imobilizado (CPC 27)',
      'NBC TG 01 (R4) - Redução ao Valor Recuperável de Ativos (CPC 01)',
      'Art. 317 do RIR/2018 (Decreto nº 9.580/2018)'
    ],
    exemploPratico: {
      cenario: 'Fábrica de tecelagem possui parque industrial com valor contábil de R$ 5.000.000,00. Avaliação de mercado aponta valor justo líquido de R$ 3.800.000,00 e o fluxo de caixa descontado em uso projeta R$ 4.200.000,00.',
      aplicacao: 'O valor recuperável é R$ 4.200.000,00 (maior entre valor justo e valor em uso). Há perda por desvalorização de R$ 800.000,00 a ser registrada como Perda por Impairment no Ativo.',
      conclusao: 'Adequação dos demonstrativos contábeis aos padrões internacionais e prevenção de distorções em auditorias.'
    },
    tags: ['CPC 27', 'CPC 01', 'Imobilizado', 'Impairment', 'Vida Útil Econômica', 'Depreciação'],
    linkDireitoId: 'dir-civ-01'
  },
  {
    id: 'con-cont-04',
    title: 'Provisões, Passivos Contingentes e Ativos Contingentes (Classificação e Contabilização CPC 25)',
    assunto: 'contabil',
    assuntoLabel: 'Contábil & NBC',
    subdivisao: 'federal',
    subdivisaoLabel: 'Federal (RFB / PGFN / IPI / PGDAS)',
    normaOficial: 'NBC TG 25 (R2) / CPC 25',
    orgaoEmissor: 'Conselho Federal de Contabilidade (CFC) / Comitê de Pronunciamentos Contábeis (CPC)',
    resumoTecnico: 'Tratamento contábil e divulgação de passivos de prazo ou valor incertos decorrentes de processos judiciais trabalhistas, cíveis, tributários ou garantias contratuais concedidas a clientes.',
    conteudoDetalhador: `A NBC TG 25 estabelece a régua técnica de probabilidade para registro e divulgação:

1. Critérios de Classificação de Contingências Passivas:
- Probabilidade PROVÁVEL (> 50% de chance de perda):
  -> DEVE SER RECONHECIDA NO BALANÇO: Lançamento a débito de Despesa de Provisão no Resultado e a crédito de Passivo Circulante/Não Circulante, acompanhada de Nota Explicativa;
- Probabilidade POSSÍVEL (entre 20% e 50% de chance de perda):
  -> NÃO SE CONTABILIZA NO BALANÇO: Exige apenas divulgação detalhada em Notas Explicativas (natureza do processo, estimativa financeira e riscos envolvidos);
- Probabilidade REMOTA (< 20% de chance de perda):
  -> NÃO SE CONTABILIZA E NÃO SE DIVULGA: Não há exigência de registro no balanço nem de menção em notas explicativas.

2. Ativos Contingentes:
- Não são reconhecidos em balanço em hipótese alguma para evitar o registro de receitas não realizadas;
- Divulgam-se em notas explicativas apenas quando o ingresso de benefícios econômicos for provável; quando se tornar praticamente certo (ex: trânsito em julgado incontestável), passa a ser reconhecido como Ativo Real.`,
    fundamentacaoLegal: [
      'NBC TG 25 (R2) - Provisões, Passivos Contingentes e Ativos Contingentes',
      'Art. 344 do RIR/2018 (Indedutibilidade fiscal de provisões não tributárias até o efetivo pagamento)',
      'Orientações do CPC / CVM Deliberação nº 594/2009'
    ],
    exemploPratico: {
      cenario: 'Empresa enfrenta ação trabalhista de R$ 150.000,00 com parecer do departamento jurídico indicando perda Provável de R$ 100.000,00 e Possível de R$ 50.000,00.',
      aplicacao: 'A contabilidade lança a Provisão para Riscos Trabalhistas de R$ 100.000,00 no Passivo e evidencia os R$ 50.000,00 remanescentes em Notas Explicativas.',
      conclusao: 'Transparência nas demonstrações contábeis e correto provisionamento dos riscos para investidores e auditores.'
    },
    tags: ['CPC 25', 'Provisões', 'Passivo Contingente', 'Nota Explicativa', 'Perda Provável', 'Ativo Contingente'],
    linkDireitoId: 'dir-civ-01'
  },
  {
    id: 'con-cont-05',
    title: 'Contabilidade Gerencial e Custos: Custeio por Absorção vs. Custeio Variável, Ponto de Equilíbrio e e-LALUR',
    assunto: 'contabil',
    assuntoLabel: 'Contábil & NBC',
    subdivisao: 'federal',
    subdivisaoLabel: 'Federal (RFB / PGFN / IPI / PGDAS)',
    normaOficial: 'NBC TG 16 (R2) e Arts. 305 a 313 do RIR/2018',
    orgaoEmissor: 'Conselho Federal de Contabilidade (CFC) / Receita Federal do Brasil',
    resumoTecnico: 'Metodologias de alocação de custos diretos e indiretos de produção, determinação da margem de contribuição e reconciliação dos métodos gerenciais com as exigências fiscais do Custeio por Absorção.',
    conteudoDetalhador: `A gestão de custos divide-se entre a ótica fiscal-societária e a tomada de decisão gerencial:

1. Custeio por Absorção (Método Legal Obrigatório - CPC 16 e RIR/18):
- Apropria todos os custos de produção (diretos como matéria-prima e mão de obra direta, e indiretos como aluguel da fábrica, energia fabril e depreciação das máquinas) ao custo dos produtos fabricados;
- Os estoques finais carregam uma parcela dos custos fixos fabris até a efetiva venda da mercadoria;
- É o único método aceito pela legislação do IRPJ (Art. 305 do RIR/18) e pelas normas contábeis internacionais.

2. Custeio Variável ou Direto (Método Gerencial):
- Apropria aos produtos apenas os custos que variam diretamente com o volume produzido;
- Todos os custos fixos são lançados diretamente como despesas do período na apuração gerencial;
- Permite calcular com precisão:
  a) Margem de Contribuição (MC) = Preço de Venda - Custos/Despesas Variáveis;
  b) Ponto de Equilíbrio Contábil (PEC) = Custos e Despesas Fixas Totais / Índice da Margem de Contribuição;
  c) Ponto de Equilíbrio Financeiro (PEF) = (Custos Fixos - Depreciação) / Índice da Margem de Contribuição.

3. Reconciliação com o e-LALUR/e-LACS:
- Caso a empresa utilize métodos de custeio gerenciais em seus relatórios internos, deve obrigatoriamente fazer o ajuste no e-LALUR para assegurar o Custeio por Absorção fiscal.`,
    fundamentacaoLegal: [
      'Arts. 305 a 313 do Decreto nº 9.580/2018 (RIR/2018)',
      'NBC TG 16 (R2) - Custos de Transformação',
      'Parecer Normativo CST nº 35/1979 da Receita Federal'
    ],
    exemploPratico: {
      cenario: 'Indústria fabrica 10.000 unidades com custo variável de R$ 50,00/unid e custos fixos totais de R$ 200.000,00/mês. Vendeu 8.000 unidades a R$ 100,00 cada.',
      aplicacao: 'Pelo Custeio por Absorção, o custo unitário total é R$ 70,00 (50 + 20). O CMV das 8.000 unidades é R$ 560.000,00 e o estoque final fica avaliado em R$ 140.000,00 (2.000 × R$ 70,00).',
      conclusao: 'Cumprimento estrito da legislação fiscal do IRPJ sem risco de arbitramento de custos pela Receita Federal.'
    },
    tags: ['Custeio por Absorção', 'Custeio Variável', 'Margem de Contribuição', 'Ponto de Equilíbrio', 'e-LALUR', 'RIR 305'],
    linkDireitoId: 'dir-trib-03'
  }
];
