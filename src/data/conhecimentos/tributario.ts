import { ConhecimentoItem } from '../conhecimentosData';

export const CONHECIMENTOS_TRIBUTARIO: ConhecimentoItem[] = [
  {
    id: 'con-trib-fed-01',
    title: 'Apuração e Segregação de Receitas no PGDAS-D (Simples Nacional)',
    assunto: 'tributario',
    assuntoLabel: 'Tributário & Regimes',
    subdivisao: 'federal',
    subdivisaoLabel: 'Federal (RFB / PGFN / IPI / PGDAS)',
    normaOficial: 'Lei Complementar nº 123/2006 e Resolução CGSN nº 140/2018',
    orgaoEmissor: 'Comitê Gestor do Simples Nacional (CGSN) / Receita Federal do Brasil',
    resumoTecnico: 'Mecanismo de apuração unificada de 8 tributos federais, estaduais e municipais via PGDAS-D, aplicando o cálculo da Alíquota Efetiva com base na RBT12 (Receita Bruta Acumulada dos últimos 12 meses), com segregação de receitas imunes, monofásicas e com substituição tributária.',
    conteudoDetalhador: `A apuração no Simples Nacional baseia-se na fórmula da Alíquota Efetiva:
Alíquota Efetiva = [(RBT12 × Alíquota Nominal) - Parcela a Deduzir] / RBT12

1. Segregação de Receitas Obrigatória:
- Receitas com Substituição Tributária de ICMS e Monofásicos de PIS/COFINS (combustíveis, bebidas, autopeças, cosméticos, fármacos): devem ser segregadas para não pagar ICMS/PIS/COFINS em duplicidade;
- Fator R (Art. 18, §§ 5º-J e 5º-M da LC 123/06): Se a folha de salários dos últimos 12 meses (incluindo encargos e pró-labore) for ≥ 28% da RBT12, a atividade de serviços do Anexo V é tributada pelas alíquotas mais brandas do Anexo III;
- Sublimite Estadual (R$ 3,6 milhões): Ultrapassado o faturamento anual acumulado de R$ 3,6 milhões, o ICMS e o ISS saem da guia única do DAS e passam a ser apurados em guias próprias da SEFAZ/Prefeitura com obrigações normais (SPED Fiscal/EFD ICMS).`,
    fundamentacaoLegal: [
      'Art. 18 da Lei Complementar nº 123/2006',
      'Resolução CGSN nº 140/2018 (Arts. 16 a 25)',
      'Art. 146, III, "d" e parágrafo único da Constituição Federal de 1988'
    ],
    exemploPratico: {
      cenario: 'Indústria farmacêutica e revendedora de cosméticos no Simples com RBT12 de R$ 1.200.000,00 e faturamento no mês de R$ 100.000,00 em produtos monofásicos.',
      aplicacao: 'A segregação dos produtos monofásicos no PGDAS-D abate as alíquotas de PIS e COFINS da alíquota efetiva do Anexo I, reduzindo a carga fiscal em aproximadamente 2,5% sobre o faturamento do mês.',
      conclusao: 'Economia direta e 100% legal de R$ 2.500,00/mês sem risco de autuação fiscal por duplicidade de recolhimento.'
    },
    tags: ['Simples Nacional', 'PGDAS-D', 'Fator R', 'Monofásico', 'Sublimite', 'RBT12'],
    linkDireitoId: 'dir-trib-01'
  },
  {
    id: 'con-trib-fed-02',
    title: 'Lucro Presumido: Bases de Presunção, Adicional de IRPJ, CSLL e Opção Caixa vs. Competência',
    assunto: 'tributario',
    assuntoLabel: 'Tributário & Regimes',
    subdivisao: 'federal',
    subdivisaoLabel: 'Federal (RFB / PGFN / IPI / PGDAS)',
    normaOficial: 'Arts. 515 a 528 do RIR/2018 (Decreto nº 9.580/2018) e Lei nº 9.718/1998',
    orgaoEmissor: 'Secretaria Especial da Receita Federal do Brasil',
    resumoTecnico: 'Regime simplificado de tributação corporativa para empresas com faturamento anual de até R$ 78 milhões, no qual a base de cálculo de IRPJ e CSLL é estimada por percentuais fixos sobre a receita bruta trimestral.',
    conteudoDetalhador: `No Lucro Presumido, a apuração é trimestral definitiva (31/mar, 30/jun, 30/set, 31/dez):

1. Coeficientes de Presunção da Base de Cálculo:
- Comércio, Indústria, Transporte de Cargas e Atividades Imobiliárias: 8% para IRPJ e 12% para CSLL;
- Serviços em Geral e Locação de Bens Móveis: 32% para IRPJ e 32% para CSLL;
- Serviços Hospitalares e Médicos Regulamentados: 8% para IRPJ e 12% para CSLL (desde que atendidos os requisitos da Lei 9.249/95 e RDC Anvisa);
- Combustíveis e Gás Natural: 1,6% para IRPJ e 12% para CSLL.

2. Alíquotas e Adicional do IRPJ:
- IRPJ: 15% sobre a base presumida + Adicional de 10% sobre a parcela da base presumida trimestral que exceder R$ 60.000,00 (R$ 20.000,00/mês);
- CSLL: 9% sobre a base presumida (sem adicional);
- PIS e COFINS: Regime Cumulativo (0,65% e 3,00% sobre o faturamento bruto, sem direito a créditos sobre insumos ou compras).

3. Regime de Caixa vs. Competência (IN RFB nº 1.700/2017):
A empresa pode optar pelo regime de caixa para IRPJ/CSLL/PIS/COFINS se mantiver Livro Caixa escriturado e controle de recebimentos na ECF/EFD-Contribuições.`,
    fundamentacaoLegal: [
      'Arts. 15 e 20 da Lei nº 9.249/1995',
      'Lei nº 9.718/1998 (Arts. 2º a 4º)',
      'Instrução Normativa RFB nº 1.700/2017 (Arts. 214 a 223)'
    ],
    exemploPratico: {
      cenario: 'Empresa de consultoria e engenharia faturou R$ 300.000,00 no 1º trimestre.',
      aplicacao: 'Base Presumida IRPJ (32%) = R$ 96.000,00. IRPJ Básico (15%) = R$ 14.400,00. Parcela excedente a R$ 60k = R$ 36.000,00 × 10% = R$ 3.600,00. Total IRPJ = R$ 18.000,00. CSLL (9% sobre R$ 96k) = R$ 8.640,00. PIS/COFINS (3,65% sobre R$ 300k) = R$ 10.950,00.',
      conclusao: 'Carga tributária federal direta de R$ 37.590,00 (12,53% efetivo federal), retendo na fonte os tributos já descontados pelos tomadores.'
    },
    tags: ['Lucro Presumido', 'IRPJ', 'CSLL', 'PIS/COFINS Cumulativo', 'Adicional IRPJ', 'Regime de Caixa'],
    linkDireitoId: 'dir-trib-02'
  },
  {
    id: 'con-trib-fed-03',
    title: 'Lucro Real: Confronto Trimestral vs. Anual por Estimativa, Balancetes de Suspensão e Trava dos 30%',
    assunto: 'tributario',
    assuntoLabel: 'Tributário & Regimes',
    subdivisao: 'federal',
    subdivisaoLabel: 'Federal (RFB / PGFN / IPI / PGDAS)',
    normaOficial: 'Decreto nº 9.580/2018 (RIR/2018) e Lei nº 9.430/1996',
    orgaoEmissor: 'Secretaria Especial da Receita Federal do Brasil',
    resumoTecnico: 'Regime tributário baseado no resultado contábil líquido ajustado no e-LALUR e e-LACS por adições, exclusões e compensações, obrigatório para instituições financeiras, faturamento acima de R$ 78M ou lucros auferidos no exterior.',
    conteudoDetalhador: `No Lucro Real existem duas modalidades operacionais de apuração:

1. Lucro Real Trimestral (Definitivo):
- Quatro apurações definitivas e isoladas por ano (março, junho, setembro e dezembro);
- Desvantagem: Prejuízo fiscal apurado em um trimestre só pode ser compensado nos trimestres subsequentes respeitando a trava legal de 30% do lucro real de cada período futuro.

2. Lucro Real Anual com Estimativas e Balancetes de Suspensão/Redução (Art. 2º da Lei 9.430/96):
- A empresa recolhe mensalmente com base em estimativa (receita bruta × presunção) OU levanta Balancete de Suspensão/Redução;
- Se o lucro real acumulado até o mês resultar em imposto devido menor ou igual ao já pago no ano, o recolhimento do mês é suspenso ou reduzido a zero;
- O ajuste anual definitivo ocorre em 31 de dezembro.

3. Compensação de Prejuízos Fiscais e Base Negativa da CSLL:
- Não há prazo decadencial para aproveitamento (prejuízos não prescrevem);
- Trava dos 30% (Art. 15 da Lei 9.065/95): O prejuízo acumulado de anos anteriores só pode abater até o limite de 30% do Lucro Real antes da compensação (o STF confirmou a constitucionalidade da trava no Tema 1.048).`,
    fundamentacaoLegal: [
      'Arts. 246 a 250 do RIR/2018 (Decreto 9.580/18)',
      'Arts. 2º e 3º da Lei nº 9.430/1996',
      'Tema 1.048 do Supremo Tribunal Federal (RE 591.340)'
    ],
    exemploPratico: {
      cenario: 'Indústria metalúrgica no Lucro Real Anual teve prejuízo no 1º bimestre e lucro em março de R$ 500.000,00 acumulado.',
      aplicacao: 'Elabora balancete de redução em 31/03 apurando o lucro contábil ajustado, compensa prejuízos até 30% e abate os pagamentos mensais já efetuados, evitando desembolso indevido via estimativa de faturamento.',
      conclusao: 'Preservação de liquidez no caixa corporativo através da gestão de balancetes intermediários.'
    },
    tags: ['Lucro Real', 'Balancete de Suspensão', 'e-LALUR', 'Trava dos 30%', 'Compensação de Prejuízos'],
    linkDireitoId: 'dir-trib-03'
  },
  {
    id: 'con-trib-fed-04',
    title: 'Manual de Retenções Tributárias na Fonte: IRRF, CSRF (PIS/COFINS/CSLL 4,65%), INSS 11% e ISSQN',
    assunto: 'tributario',
    assuntoLabel: 'Tributário & Regimes',
    subdivisao: 'federal',
    subdivisaoLabel: 'Federal (RFB / PGFN / IPI / PGDAS)',
    normaOficial: 'IN RFB nº 2.145/2023, Lei nº 10.833/2003 (Art. 30), Lei nº 8.212/1991 (Art. 31) e LC nº 116/2003',
    orgaoEmissor: 'Receita Federal do Brasil / Previdência Social / Municípios',
    resumoTecnico: 'Mecanismo de antecipação e substituição tributária onde a fonte pagadora (tomadora do serviço) tem a obrigação legal de reter e recolher os tributos devidos pelo prestador do serviço sob pena de responsabilidade solidária.',
    conteudoDetalhador: `As retenções dividem-se em 4 grandes grupos normativos:

1. IRRF sobre Serviços Profissionais Regulamentados (Arts. 714 a 719 do RIR/18):
- Alíquota de 1,5% (advocacia, contabilidade, auditoria, consultoria, engenharia, medicina, informática, publicidade);
- Dispensa de retenção se o valor for igual ou inferior a R$ 10,00;
- Serviços de limpeza, conservação, segurança e locação de mão de obra: 1,0%.

2. CSRF - Contribuições Sociais Retidas na Fonte (Art. 30 da Lei 10.833/03):
- Alíquota agregada de 4,65% (PIS 0,65% + COFINS 3,00% + CSLL 1,00%);
- Aplicável em pagamentos entre pessoas jurídicas privadas de serviços profissionais, limpeza, vigilância e locação de mão de obra;
- Fim do teto de R$ 5.000,00 pela Lei 13.137/15: a retenção incide sobre qualquer valor de nota fiscal, dispensada apenas se a guia DARF for inferior a R$ 10,00.

3. Retenção Previdenciária de 11% (Art. 31 da Lei 8.212/91 e IN RFB 2.110/22):
- Incide sobre cessão de mão de obra e empreitada (construção civil, limpeza, portaria, vigilância);
- Alíquota de 11% (ou 3,5% para empresas na CPRB/Desoneração) sobre a base da folha/nota fiscal;
- Informada na EFD-Reinf (evento R-2010 e R-2020) e abatida na DCTFWeb.

4. Retenção de ISSQN pelo Tomador (Art. 6º da LC 116/2003):
- Hipótese de responsabilidade tributária em serviços prestados com cessão de mão de obra, construção civil, ou quando o prestador de outro município não comprova cadastro no CPOM/D-FE local.`,
    fundamentacaoLegal: [
      'Art. 30 da Lei nº 10.833/2003 (CSRF 4,65%)',
      'Art. 714 do Decreto nº 9.580/2018 (IRRF 1,5%)',
      'Art. 31 da Lei nº 8.212/1991 e IN RFB nº 2.110/2022 (INSS 11%)'
    ],
    exemploPratico: {
      cenario: 'Emissão de Nota Fiscal de R$ 20.000,00 de serviços de consultoria contábil por empresa do Lucro Presumido para tomador PJ privada.',
      aplicacao: 'O tomador retém: IRRF 1,5% (R$ 300,00) + CSRF 4,65% (R$ 930,00). Valor líquido a pagar ao prestador: R$ 18.770,00.',
      conclusao: 'O tomador recolhe as retenções via DCTFWeb/DARF e o prestador compensa R$ 1.230,00 nos seus tributos trimestrais de IRPJ, CSLL, PIS e COFINS.'
    },
    tags: ['Retenções na Fonte', 'IRRF', 'CSRF 4,65%', 'INSS 11%', 'ISSQN Retido', 'EFD-Reinf'],
    linkDireitoId: 'dir-trib-04'
  },
  {
    id: 'con-trib-est-01',
    title: 'ICMS nas 27 UFs: Substituição Tributária (ICMS-ST), MVA Ajustada, DIFAL (EC 87/15 & LC 190/22) e Estornos',
    assunto: 'tributario',
    assuntoLabel: 'Tributário & Regimes',
    subdivisao: 'estadual',
    subdivisaoLabel: 'Estadual (SEFAZ 27 UFs / ICMS / ST / DIFAL)',
    normaOficial: 'Convênio CONFAZ ICMS nº 142/2018, LC nº 87/1996 (Lei Kandir) e LC nº 190/2022',
    orgaoEmissor: 'Conselho Nacional de Política Fazendária (CONFAZ) e Secretarias Estaduais de Fazenda',
    resumoTecnico: 'Sistemática estadual de recolhimento concentrado no remetente (substituto) de todo o ICMS da cadeia de comercialização futura até o consumidor final, calculada mediante Margem de Valor Agregado (MVA/IVA).',
    conteudoDetalhador: `A apuração do ICMS e de suas obrigações interestaduais compreende:

1. Cálculo do ICMS-ST com MVA Ajustada:
MVA Ajustada = { [(1 + MVA-ST original) × (1 - ALIQ interestadual)] / (1 - ALIQ interna destino) } - 1
- Base de Cálculo ST = (Valor dos Produtos + IPI + Frete + Seguro + Outras Despesas) × (1 + MVA Ajustada);
- ICMS-ST a Recolher = (Base ST × Alíquota Interna Destino) - ICMS Próprio do Remetente.

2. DIFAL - Diferencial de Alíquotas para Consumidor Final Não Contribuinte (EC 87/15 e LC 190/22):
- Incide nas vendas interestaduais de e-commerce e B2C;
- O remetente recolhe 100% da diferença entre a alíquota interna do estado de destino e a alíquota interestadual (4%, 7% ou 12%) em favor do estado consumidor (via GNRE).

3. Princípio da Não Cumulatividade e Estorno de Crédito (Art. 21 da LC 87/96):
- Crédito de ICMS é admitido na entrada de matérias-primas, insumos industriais e mercadorias para revenda;
- Exige estorno proporcional se a saída subsequente for isenta, não tributada ou objeto de perda/perecimento.`,
    fundamentacaoLegal: [
      'Convênio CONFAZ ICMS nº 142/2018',
      'Lei Complementar nº 190/2022 (DIFAL Não Contribuinte)',
      'Arts. 13 a 21 da Lei Complementar nº 87/1996 (Lei Kandir)'
    ],
    exemploPratico: {
      cenario: 'Indústria em SP vende mercadoria ST (autopeças) no valor de R$ 10.000,00 para revendedora no RJ. Alíquota interestadual 12%, interna RJ 20% (com FCP), MVA original 40%.',
      aplicacao: 'Calcula-se a MVA ajustada para a operação SP->RJ, aplica-se sobre a base acrescida de IPI/frete e deduz-se o ICMS próprio de R$ 1.200,00, gerando a GNRE de ST para o Estado do Rio de Janeiro.',
      conclusao: 'Garante trânsito livre de fiscalização de barreira interestadual e liberação do documento fiscal eletrônico.'
    },
    tags: ['ICMS-ST', 'MVA Ajustada', 'DIFAL', 'LC 190/22', 'EC 87/15', 'CONFAZ', 'GNRE'],
    linkDireitoId: 'dir-trib-02'
  }
];
