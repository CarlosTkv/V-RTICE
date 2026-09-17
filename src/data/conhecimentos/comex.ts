import { ConhecimentoItem } from '../conhecimentosData';

export const CONHECIMENTOS_COMEX: ConhecimentoItem[] = [
  {
    id: 'con-comex-01',
    title: 'Desembaraço Aduaneiro e Parametrização no Portal Único Siscomex (DUIMP e Catálogo de Produtos)',
    assunto: 'comex',
    assuntoLabel: 'Comércio Exterior & Siscomex',
    subdivisao: 'federal',
    subdivisaoLabel: 'Federal (RFB / PGFN / IPI / PGDAS)',
    normaOficial: 'Portaria Conjunta RFB/SECEX nº 34/2020 e Instrução Normativa RFB nº 680/2006',
    orgaoEmissor: 'Secretaria de Comércio Exterior (SECEX) / Secretaria Especial da Receita Federal do Brasil',
    resumoTecnico: 'Fluxo operacional de registro da DUIMP (Declaração Única de Importação) no Portal Único de Comércio Exterior (Pucomex), vinculação ao Catálogo de Produtos e processamento dos canais de conferência aduaneira.',
    conteudoDetalhador: `O Novo Processo de Importação (NPI) substituiu a tradicional DI pela DUIMP:

1. Estrutura do Novo Processo de Importação (NPI):
- Catálogo de Produtos (Módulo Obrigatório): Mapeamento prévio dos atributos de cada mercadoria importada (NCM, descrição técnica, fabricante estrangeiro e licenças aplicáveis);
- LPCO (Licenças, Permissões, Certificados e Outros Documentos): Módulo único integrado para órgãos anuentes (ANVISA, MAPA, INMETRO, IBAMA, Exército) com emissão de licenças reaproveitáveis para múltiplas operações;
- DUIMP (Declaração Única de Importação): Registro eletrônico centralizado antes mesmo da atracação do navio (modalidade antecipada para importadores OEA - Operador Econômico Autorizado).

2. Canais de Conferência e Parametrização Aduaneira (Art. 21 da IN RFB 680/06):
- Canal Verde: Desembaraço aduaneiro automático sem exame documental nem verificação física da mercadoria;
- Canal Amarelo: Exame documental detalhado dos comprovantes e fatura comercial (Commercial Invoice / Packing List / B/L);
- Canal Vermelho: Exame documental e verificação física presencial das mercadorias no recinto alfandegado;
- Canal Cinza: Exame documental, verificação física e instauração de Procedimento Especial de Controle Aduaneiro por suspeita de fraude no valor declarado (subfaturamento).

3. Entrega da Mercadoria e Emissão da Nota Fiscal de Entrada:
Após o desembaraço no Siscomex e o pagamento do ICMS na SEFAZ (via PCCE), emite-se a NF-e de Entrada (CFOP 3.101/3.102) para retirada no porto/aeroporto.`,
    fundamentacaoLegal: [
      'Decreto nº 6.759/2009 (Regulamento Aduaneiro - Arts. 542 a 587)',
      'Instrução Normativa RFB nº 680/2006 e alterações',
      'Portaria SECEX nº 249/2023 (Normas Administrativas de Comércio Exterior)'
    ],
    exemploPratico: {
      cenario: 'Empresa certificada como OEA-Conformidade registra DUIMP de componentes eletrônicos no Porto de Santos.',
      aplicacao: 'Registro da DUIMP antecipada com parametrização em Canal Verde instantâneo e liberação física das cargas no momento do desembarque do navio.',
      conclusao: 'Redução do tempo de despacho de 7 dias para apenas 6 horas e economia de 70% nos custos de armazenagem portuária.'
    },
    tags: ['Comércio Exterior', 'DUIMP', 'Siscomex', 'Portal Único', 'Canal Verde', 'Desembaraço Aduaneiro', 'OEA'],
    linkDireitoId: 'dir-adm-01'
  },
  {
    id: 'con-comex-02',
    title: 'Cascata Tributária na Importação: II, IPI, PIS/COFINS-Importação e Cálculo do ICMS "Por Dentro"',
    assunto: 'comex',
    assuntoLabel: 'Comércio Exterior & Siscomex',
    subdivisao: 'federal',
    subdivisaoLabel: 'Federal (RFB / PGFN / IPI / PGDAS)',
    normaOficial: 'Art. 13 da LC nº 87/1996, Lei nº 10.865/2004 e Decreto nº 6.759/2009',
    orgaoEmissor: 'Receita Federal do Brasil e Secretarias de Fazenda Estaduais (SEFAZ)',
    resumoTecnico: 'Metodologia matemática e tributária de apuração dos 5 tributos incidentes no desembaraço de mercadorias importadas, com a fórmula circular do ICMS integrado à sua própria base de cálculo.',
    conteudoDetalhador: `A tributação na importação segue uma sequência rígida de cálculo acumulativo:

1. Valor Aduaneiro (V.A.):
V.A. = (Valor FOB da Mercadoria + Frete Internacional + Seguro Internacional) convertido pela taxa PTAX do dia do registro da DUIMP.

2. Apuração dos Tributos Federais:
- Imposto de Importação (II): V.A. × Alíquota do II (TEC);
- IPI-Importação: (V.A. + II) × Alíquota do IPI;
- PIS-Importação (Lei 10.865/04): 2,10% × V.A.;
- COFINS-Importação (Lei 10.865/04): 9,65% (ou 10,65%) × V.A. (Não integram mais o ICMS na sua base após o STF RE 559.937);
- Taxa de Utilização do Siscomex e Adicional ao Frete para Renovação da Marinha Mercante (AFRMM - 8% sobre o frete).

3. A Complexa Fórmula do ICMS-Importação "Por Dentro" (Art. 13, V da LC 87/96):
Base ICMS = (V.A. + II + IPI + PIS + COFINS + Taxa Siscomex + Despesas Aduaneiras no Porto) / (1 - Alíquota ICMS Destino)
ICMS a Pagar = Base ICMS × Alíquota ICMS Destino.
- O ICMS integra a sua própria base de cálculo e a de todas as despesas ocorridas até o desembaraço.`,
    fundamentacaoLegal: [
      'Art. 13, V e § 1º, I da Lei Complementar nº 87/1996 (Lei Kandir)',
      'Lei nº 10.865/2004 (PIS e COFINS na Importação)',
      'Tema 1 do Supremo Tribunal Federal (RE 559.937 - Inconstitucionalidade de ICMS na base de PIS/COFINS-Importação)'
    ],
    exemploPratico: {
      cenario: 'Importação de maquinário com Valor Aduaneiro de R$ 100.000,00, II de 10%, IPI de 10%, PIS/COFINS de 11,75% e ICMS interno de 18%.',
      aplicacao: 'II = R$ 10.000,00; IPI = R$ 11.000,00; PIS/COFINS = R$ 11.750,00. Soma preliminar = R$ 132.750,00. Divisão por 0,82 (gross up do ICMS) resulta em Base ICMS de R$ 161.890,24 e ICMS devido de R$ 29.140,24.',
      conclusao: 'Custo tributário total de R$ 61.890,24 sobre a mercadoria de R$ 100.000,00.'
    },
    tags: ['Importação', 'Valor Aduaneiro', 'Cálculo por Dentro', 'ICMS-Importação', 'PIS/COFINS-Importação', 'AFRMM'],
    linkDireitoId: 'dir-trib-02'
  },
  {
    id: 'con-comex-03',
    title: 'Regime Aduaneiro Especial de Drawback: Suspensão, Isenção e Restituição para Exportadores',
    assunto: 'comex',
    assuntoLabel: 'Comércio Exterior & Siscomex',
    subdivisao: 'federal',
    subdivisaoLabel: 'Federal (RFB / PGFN / IPI / PGDAS)',
    normaOficial: 'Portaria SECEX nº 44/2020 e Arts. 383 a 426 do Decreto nº 6.759/2009',
    orgaoEmissor: 'Secretaria de Comércio Exterior (SECEX) / SUEXT',
    resumoTecnico: 'Regime de incentivo à exportação que desonera de II, IPI, PIS, COFINS, AFRMM e ICMS a importação ou compra nacional de insumos, matérias-primas e embalagens empregados na industrialização de produtos exportados.',
    conteudoDetalhador: `O Drawback é o principal mecanismo de competitividade da indústria brasileira no exterior:

1. Modalidades Operacionais:
- Drawback Suspensão: Os tributos federais e o ICMS (Convênio ICMS 27/90) incidentes na aquisição de insumos (importados ou nacionais) são SUSPENSOS mediante compromisso de exportação no prazo de até 1 ano (prorrogável por mais 1 ano); ao comprovar a exportação, a suspensão converte-se em ISENÇÃO DEFINITIVA;
- Drawback Isenção: A empresa que já realizou exportações de produtos industrializados sem drawback adquire insumos (importados ou nacionais) com isenção de tributos em quantidade e qualidade equivalentes aos consumidos no passado (para reposição de estoque);
- Drawback Intermediário: Quando um fabricante importa insumos com suspensão e vende o produto intermediário para outro fabricante que realizará a exportação final;
- Drawback Restituição: Modalidade residual que prevê a restituição dos tributos pagos na importação quando não foi solicitada a suspensão/isenção.

2. Inadimplemento e Descumprimento do Compromisso de Exportar:
Caso a mercadoria não seja exportada no prazo legal, o importador deve recolher todos os tributos suspensos acrescidos de juros de mora e multa de ofício ou recolher para consumo interno pagando os acréscimos legais.`,
    fundamentacaoLegal: [
      'Arts. 383 a 426 do Decreto nº 6.759/2009 (Regulamento Aduaneiro)',
      'Portaria SECEX nº 44/2020 (Manual do Sistema Drawback Web)',
      'Convênio CONFAZ ICMS nº 27/1990 (Isenção de ICMS no Drawback)'
    ],
    exemploPratico: {
      cenario: 'Fábrica de calçados importa R$ 1.000.000,00 em couro sintético e solados com compromisso de exportar 50.000 pares de tênis para os EUA em 12 meses.',
      aplicacao: 'Abertura de Ato Concessório no módulo Drawback Suspensão do Siscomex com desembaraço aduaneiro sem desembolso de II, IPI, PIS/COFINS e ICMS.',
      conclusao: 'Economia financeira de R$ 420.000,00 em tributos, garantindo preço competitivo no mercado internacional.'
    },
    tags: ['Drawback', 'Suspensão', 'Isenção', 'Ato Concessório', 'Incentivo à Exportação', 'Siscomex Drawback Web'],
    linkDireitoId: 'dir-trib-01'
  },
  {
    id: 'con-comex-04',
    title: 'Imunidade Constitucional das Exportações, Desoneração e Manutenção de Créditos Acumulados',
    assunto: 'comex',
    assuntoLabel: 'Comércio Exterior & Siscomex',
    subdivisao: 'federal',
    subdivisaoLabel: 'Federal (RFB / PGFN / IPI / PGDAS)',
    normaOficial: 'Art. 155, § 2º, X, "a" e Art. 149, § 2º, I da CF/88 e LC nº 87/1996 (Lei Kandir)',
    orgaoEmissor: 'Supremo Tribunal Federal / CONFAZ / Receita Federal do Brasil',
    resumoTecnico: 'Princípio da desoneração completa das vendas internacionais de mercadorias e serviços, assegurando alíquota zero ou imunidade e o direito indisponível de manutenção e ressarcimento dos créditos acumulados na cadeia produtiva.',
    conteudoDetalhador: `A Constituição Federal consagra a regra universal de "não exportar tributos":

1. Abrangência da Imunidade / Desoneração nas Exportações:
- ICMS (Art. 155, § 2º, X, "a" da CF/88 e Art. 3º, II da LC 87/96): Não incidência sobre operações que destinem mercadorias para o exterior, nem sobre serviços prestados a destinatários no exterior;
- IPI (Art. 153, § 3º, III da CF/88): Imunidade de produtos industrializados destinados ao exterior;
- PIS e COFINS (Art. 149, § 2º, I da CF/88 e Lei 10.833/03): Não incidência de contribuições sociais sobre as receitas decorrentes de exportação.

2. Direito Constitucional à Manutenção e Transferência de Créditos:
- O Art. 155, § 2º, XII, "c" da CF/88 e o Art. 21 da LC 87/96 asseguram expressamente a MANUTENÇÃO INTEGRAL dos créditos de ICMS das entradas de matérias-primas e insumos (sem necessidade de estorno);
- Sistemática de Ressarcimento de Crédito Acumulado:
  a) Créditos de PIS/COFINS: Pedido de Ressarcimento em dinheiro ou Declaração de Compensação com outros tributos federais via Per/Dcomp;
  b) Créditos Acumulados de ICMS: Transferência a fornecedores de matérias-primas ou liquidação de débitos próprios conforme a sistemática e-CredAc (SP) ou regulamentos estaduais.`,
    fundamentacaoLegal: [
      'Art. 155, § 2º, X, "a" da Constituição Federal de 1988',
      'Art. 149, § 2º, I da Constituição Federal de 1988',
      'Art. 21, § 2º da Lei Complementar nº 87/1996 (Manutenção de Créditos de Exportação)'
    ],
    exemploPratico: {
      cenario: 'Exportadora de café torrado e embalado exporta 100% da sua produção para a Europa e acumula R$ 500.000,00 de créditos de ICMS e R$ 200.000,00 de créditos de PIS/COFINS na compra de embalagens e energia.',
      aplicacao: 'Transmissão de Per/Dcomp Web para compensação do PIS/COFINS com débitos de folha (DCTFWeb) e homologação de e-CredAc na SEFAZ para pagar fornecedores de café em grão.',
      conclusao: 'Recuperação integral da liquidez financeira gerada pelo direito constitucional de manutenção de créditos.'
    },
    tags: ['Exportação', 'Imunidade Tributária', 'Crédito Acumulado', 'Lei Kandir', 'Per/Dcomp', 'e-CredAc', 'CF/88'],
    linkDireitoId: 'dir-trib-01'
  },
  {
    id: 'con-comex-05',
    title: 'Valoração Aduaneira e o Novo Marco de Preços de Transferência (Transfer Pricing - Lei nº 14.596/23)',
    assunto: 'comex',
    assuntoLabel: 'Comércio Exterior & Siscomex',
    subdivisao: 'federal',
    subdivisaoLabel: 'Federal (RFB / PGFN / IPI / PGDAS)',
    normaOficial: 'Lei nº 14.596/2023, IN RFB nº 2.161/2023 e Acordo de Valoração Aduaneira da OMC (GATT 1994)',
    orgaoEmissor: 'Receita Federal do Brasil / Organização para a Cooperação e Desenvolvimento Econômico (OCDE)',
    resumoTecnico: 'Convergência das regras brasileiras de preços de transferência aos padrões internacionais da OCDE baseados no Princípio Arm’s Length (Plena Concorrência), alinhadas aos métodos de Valoração Aduaneira da OMC.',
    conteudoDetalhador: `A Lei nº 14.596/2023 revogou a antiga Lei 9.430/96 e implantou o modelo OCDE no Brasil:

1. O Princípio Arm’s Length (Plena Concorrência - Art. 2º da Lei 14.596/23):
- As transações comerciais e financeiras entre partes relacionadas no exterior (controladoras, coligadas, filiais ou paraísos fiscais) devem ser pactuadas nos mesmos termos e preços que seriam acordados entre empresas independentes em transações comparáveis.

2. Métodos de Determinação de Preços de Transferência:
- PIC (Preço Independente Comparável - equivalente ao CUP da OCDE);
- PRL (Preço de Revenda menos Lucro - Resale Price Method);
- MCL (Custo Mais Lucro - Cost Plus Method);
- MLT (Margem Líquida da Transação - TNMM);
- DIF (Divisão de Lucros - Profit Split Method);
- Outros métodos econômicos confiáveis (para valuation de ativos intangíveis, royalties e hard-to-value intangibles).

3. Documentação Obrigatória (IN RFB nº 2.161/2023):
- Arquivo Global (Master File): Estrutura organizacional e estratégia global do grupo multinacional;
- Arquivo Local (Local File): Análise funcional e de riscos da filial brasileira, identificação das transações controladas e escolha do método mais apropriado;
- Relatório País-a-País (Country-by-Country Report - CbCR): Alocação global de receitas, lucros e impostos recolhidos no mundo.`,
    fundamentacaoLegal: [
      'Lei nº 14.596/2023 (Novo Marco de Preços de Transferência)',
      'Instrução Normativa RFB nº 2.161/2023 (Regulamentação Geral de TP)',
      'Diretrizes da OCDE sobre Preços de Transferência para Empresas Multinacionais e Administrações Tributárias'
    ],
    exemploPratico: {
      cenario: 'Multinacional com subsidiária no Brasil importa matérias-primas farmacêuticas de sua matriz na Suíça por US$ 500/kg, enquanto o preço de mercado independente é de US$ 300/kg.',
      aplicacao: 'Aplicação do método PIC/CUP demonstrando o superfaturamento da importação, com ajuste fiscal de adição do excesso de custo de US$ 200/kg na base de cálculo do IRPJ e da CSLL da subsidiária brasileira na ECF.',
      conclusao: 'Evita a autuação fiscal com pesadas multas por erosão de base tributária e transferência artificial de lucros ao exterior.'
    },
    tags: ['Preços de Transferência', 'Transfer Pricing', 'Lei 14596/23', 'OCDE', 'Princípio Arm’s Length', 'Valoração Aduaneira', 'Master File'],
    linkDireitoId: 'dir-trib-01'
  }
];
