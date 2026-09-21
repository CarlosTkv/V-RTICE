import { AppActiveTab } from '../types';

export interface ManualFieldDetail {
  fieldName: string;
  fieldCode?: string;
  inputType: 'Texto' | 'Moeda (R$)' | 'Percentual (%)' | 'Seleção Única' | 'Múltipla Seleção' | 'Checkbox (Booleano)' | 'Arquivo / Certificado' | 'Data';
  acceptedValues?: string;
  technicalPurpose: string;
  legalBase?: string;
  systemImpact: string;
  reflectsIn: string[];
  operationalTip?: string;
}

export interface ManualSubmodule {
  id: string;
  submoduleCode: string;
  title: string;
  description: string;
  primaryWorkflow: string;
  fields: ManualFieldDetail[];
}

export interface ManualModule {
  id: string;
  moduleCode: string;
  number: string;
  title: string;
  subtitle: string;
  iconName: string;
  targetTab: AppActiveTab;
  buttonLabel: string;
  isMasterOnly?: boolean;
  overview: string;
  submodules: ManualSubmodule[];
}

export const SYSTEM_TRAINING_MANUAL_DATA: ManualModule[] = [
  // =========================================================================
  // MÓDULO 01: AUDITORIA DIGITAL & FATOR R 360°
  // =========================================================================
  {
    id: 'modulo_fator_r',
    number: '01',
    moduleCode: 'MÓDULO 01',
    title: 'VÉRTICE Auditoria Digital & Fator R 360°',
    subtitle: 'Cockpit 360°, Auditoria do Fator R (≥ 28%), Pró-Labore Estratégico, QSA e e-CAC / PGDAS-D',
    iconName: 'Percent',
    targetTab: 'dashboard',
    buttonLabel: 'Acessar Auditoria Digital & Fator R',
    overview: 'Módulo central de análise do Simples Nacional focado na apuração e otimização da relação entre Folha de Pagamento e Receita Bruta Acumulada (Fator R), prevenindo autuações da Receita Federal e reduzindo a carga tributária legal de 15,50%+ para a partir de 6,00%.',
    submodules: [
      {
        id: 'sub_cockpit_rbt12',
        submoduleCode: 'SUB 1.1',
        title: 'Cockpit 360° & Receita Bruta Acumulada (RBT12)',
        description: 'Parâmetros cadastrais e consolidação das receitas brutas dos 12 meses anteriores para enquadramento na faixa do Simples Nacional.',
        primaryWorkflow: 'O usuário insere ou importa a RBT12 e a receita do mês atual. O motor calcula a alíquota nominal, deduz a parcela da faixa e extrai a alíquota efetiva real.',
        fields: [
          {
            fieldName: 'Receita Bruta Acumulada (RBT12)',
            fieldCode: 'rbt12',
            inputType: 'Moeda (R$)',
            acceptedValues: 'R$ 0,00 a R$ 4.800.000,00',
            technicalPurpose: 'Define a faixa de enquadramento nos Anexos I a V do Simples Nacional e serve de denominador para o cálculo da alíquota efetiva.',
            legalBase: 'Art. 18, § 1º da Lei Complementar nº 123/2006 e Resolução CGSN nº 140/2018.',
            systemImpact: 'Calcula a Alíquota Efetiva: (RBT12 × Alíquota Nominal - Parcela a Deduzir) / RBT12. Ativa alertas quando ultrapassa R$ 3,6M (sublimite estadual de ICMS/ISS) e R$ 4,8M (exclusão do Simples).',
            reflectsIn: ['Cockpit 360°', 'Alíquota Efetiva do DAS', 'Comparador de Regimes', 'DRE Fiscal', 'Parecer Técnico Pericial'],
            operationalTip: 'Se a empresa estiver em início de atividade (menos de 12 meses), o sistema utiliza a proporcionalização aritmética oficial do CGSN.'
          },
          {
            fieldName: 'Faturamento do Mês Vigente',
            fieldCode: 'monthlyRevenue',
            inputType: 'Moeda (R$)',
            acceptedValues: 'Valores positivos em Reais',
            technicalPurpose: 'Base de aplicação da alíquota efetiva calculada para determinar o valor devido da guia DAS no mês.',
            legalBase: 'Art. 18, § 3º da LC 123/2006.',
            systemImpact: 'Multiplica a alíquota efetiva apurada pela receita mensal para gerar o valor em R$ do DAS e alimentar as receitas brutas na DRE.',
            reflectsIn: ['Guia DAS Estimada', 'Painel Financeiro', 'Comparador 4 em 1', 'DFC']
          },
          {
            fieldName: 'Sublimite Estadual de ICMS / ISS',
            fieldCode: 'sublimiteUF',
            inputType: 'Seleção Única',
            acceptedValues: 'R$ 3.600.000,00 (Padrão Nacional) ou R$ 4.320.000,00 (com margem de 20%)',
            technicalPurpose: 'Controla a trava a partir da qual o ICMS e o ISS deixam de ser recolhidos dentro do DAS e passam a ser recolhidos em guias normais estaduais/municipais.',
            legalBase: 'Art. 19 e 20 da LC 123/2006.',
            systemImpact: 'Ao ultrapassar o sublimite, expurga a fração de ICMS/ISS da alíquota do DAS e soma o imposto por fora no Comparador de Regimes.',
            reflectsIn: ['Alerta de Sublimite', 'Segregação de ICMS/ISS no DAS', 'Comparador de Regimes']
          },
          {
            fieldName: 'Alternador de Horizonte Temporal (Visão Anual vs Mensal / DAS)',
            fieldCode: 'timeHorizonToggle',
            inputType: 'Seleção Única',
            acceptedValues: 'Visão Anual | Visão Mensal',
            technicalPurpose: 'Permite ao gestor e ao cliente alternar instantaneamente as projeções gráficas de carga tributária e benchmark entre a despesa anual consolidada e a guia DAS mensal estimada.',
            legalBase: 'Resolução CGSN nº 140/2018 (Periodicidade Mensal do Simples Nacional).',
            systemImpact: 'Recalcula dinamicamente a escala dos gráficos de Benchmark Tributário e Projeção de Economia em tempo real, dividindo os montantes anuais por 12 sem alterar a base fiscal de apuração.',
            reflectsIn: ['Cockpit Executivo', 'Gráfico de Carga Tributária', 'Gráfico de Projeção de Economia', 'Apresentação Consultiva']
          },
          {
            fieldName: 'Termômetro de Saúde Fiscal 360° (Score 0-100%)',
            fieldCode: 'healthScore360',
            inputType: 'Texto',
            acceptedValues: 'Calculado em tempo real (0 a 100%)',
            technicalPurpose: 'Avalia holisticamente a segurança fiscal da empresa contra riscos de desenquadramento da LC 123/06, exclusão de ofício e irregularidades societárias.',
            legalBase: 'LC 123/2006, Art. 3º e Art. 29.',
            systemImpact: 'Aplica pontuação dedutiva: penaliza em 45 pontos excesso de teto federal (R$ 4,8M), 25 pontos excesso de sublimite (R$ 3,6M), 15 pontos se o Fator R for inferior a 28% no Anexo V, e 20 pontos para irregularidades no QSA.',
            reflectsIn: ['Cockpit de Conformidade', 'Velocímetro de Saúde Fiscal', 'Parecer Pericial 360°']
          }
        ]
      },
      {
        id: 'sub_fator_r_calculo',
        submoduleCode: 'SUB 1.2',
        title: 'Auditoria Matemática do Fator R (≥ 28,00%)',
        description: 'Diagnóstico exato da relação Folha/Receita para enquadramento no Anexo III (6,00%) ou Anexo V (15,50%).',
        primaryWorkflow: 'O usuário ajusta o valor da folha de salários e pró-labore. O sistema indica instantaneamente o percentual, o anexo de destino e a economia líquida.',
        fields: [
          {
            fieldName: 'Folha de Salários + Pró-Labore 12 Meses (FS12)',
            fieldCode: 'payroll12Months',
            inputType: 'Moeda (R$)',
            acceptedValues: 'Valores em Reais',
            technicalPurpose: 'Composição do numerador da fórmula do Fator R: FS12 / RBT12.',
            legalBase: 'Art. 18, § 5º-J e § 5º-M da LC 123/2006.',
            systemImpact: 'Se FS12 / RBT12 ≥ 0,28 (28%), as atividades intelectuais e de saúde migram do Anexo V para o Anexo III. Se < 28%, são tributadas no Anexo V.',
            reflectsIn: ['Auditoria Fator R', 'Análise Anexo III vs V', 'Economia Tributária Líquida', 'Parecer Pericial']
          },
          {
            fieldName: 'Pró-Labore Mensal do Titular / Sócios',
            fieldCode: 'monthlyProLabore',
            inputType: 'Moeda (R$)',
            acceptedValues: 'A partir do Salário Mínimo até o Teto do INSS ou superior',
            technicalPurpose: 'Simula o aumento estratégico de pró-labore para atingir exatamente os 28,00% sem desperdício de encargos.',
            legalBase: 'Instrução Normativa RFB nº 2.110/2022.',
            systemImpact: 'Calcula o INSS individual (11% retido até o teto) e o IRPF do sócio, confrontando com a economia de até 9,50% no DAS do Simples para encontrar o Ponto de Equilíbrio Matemático.',
            reflectsIn: ['Calculadora Fator R', 'Painel de Sócios', 'Custo Total da Folha', 'DRE Fiscal']
          },
          {
            fieldName: 'Encargos de FGTS e CPP da Folha',
            fieldCode: 'chargesFolha',
            inputType: 'Moeda (R$)',
            acceptedValues: 'Valores em Reais',
            technicalPurpose: 'Soma dos encargos trabalhistas efetivamente recolhidos no período que integram legalmente a massa salarial.',
            legalBase: 'Resolução CGSN nº 140/2018, Art. 26.',
            systemImpact: 'Aumenta o numerador da FS12, facilitando o alcance dos 28% sem necessidade de inflar excessivamente o pró-labore puro.',
            reflectsIn: ['Cálculo Fator R', 'Deduções Trabalhistas']
          },
          {
            fieldName: 'Simulador Dinâmico com Presets Rápidos (28%, 29% e 30%)',
            fieldCode: 'fatorRPresets',
            inputType: 'Seleção Única',
            acceptedValues: 'Exatos 28,0% | Margem de Segurança 29,0% | Margem Confortável 30,0%',
            technicalPurpose: 'Permite projetar em um clique o pró-labore complementar necessário com margens de segurança para flutuações de receita no fechamento do mês.',
            legalBase: 'LC 123/2006, Art. 18, § 5º-J.',
            systemImpact: 'Calcula o acréscimo mensal exato na folha para atingir cada patamar de segurança e recalcula o ganho patrimonial líquido após retenção de INSS/IRPF.',
            reflectsIn: ['Simulador Fator R', 'Gráficos Analíticos', 'Gravação de Folha Real']
          }
        ]
      },
      {
        id: 'sub_socios_qsa',
        submoduleCode: 'SUB 1.3',
        title: 'Gestão de Sócios, QSA & Cruzamento de Outras Empresas',
        description: 'Mapeamento do quadro societário, participação de capital e regras anti-exclusão por soma de faturamento.',
        primaryWorkflow: 'Cadastro de cada sócio, percentual de cotas, condição de administrador e cadastro de outras empresas em que o sócio participa.',
        fields: [
          {
            fieldName: 'Nome Completo do Sócio & CPF',
            fieldCode: 'partnerNameCpf',
            inputType: 'Texto',
            technicalPurpose: 'Identificação civil do cotista e cruzamento no banco de dados da Receita Federal (QSA).',
            legalBase: 'Instrução Normativa DREI nº 81/2020.',
            systemImpact: 'Alimenta os instrumentos societários gerados, assinaturas do contrato e emissão de laudos técnicos.',
            reflectsIn: ['Módulo Societário', 'Contrato Social', 'Parecer Técnico', 'Signatários ICP-Brasil']
          },
          {
            fieldName: 'Percentual de Participação no Capital',
            fieldCode: 'participationPercent',
            inputType: 'Percentual (%)',
            acceptedValues: '0,01% a 100,00%',
            technicalPurpose: 'Define o peso político e a distribuição de cotas da sociedade.',
            legalBase: 'Art. 1.055 do Código Civil.',
            systemImpact: 'Calcula o quórum de deliberação nas assembleias, distribuição de lucros isentos e gatilho de soma de faturamento.',
            reflectsIn: ['Contrato Social', 'DRE Gerencial', 'Auditoria de Quóruns', 'Radar de Blindagem']
          },
          {
            fieldName: 'Sócio Administrador (Sim / Não)',
            fieldCode: 'isManager',
            inputType: 'Checkbox (Booleano)',
            technicalPurpose: 'Indica se o sócio exerce a gestão executiva com poder de representação e assinatura.',
            legalBase: 'Art. 1.060 a 1.064 do Código Civil e Art. 3º, § 4º da LC 123/2006.',
            systemImpact: 'Se o sócio for administrador em outra empresa optante ou não pelo Simples, a receita global de ambas é somada para o teto de R$ 4,8M.',
            reflectsIn: ['Alerta de Risco de Desenquadramento', 'Contrato Social', 'QSA Redesim']
          },
          {
            fieldName: 'Outras Empresas do Sócio (Faturamento 12M e %)',
            fieldCode: 'partnerOtherCompanies',
            inputType: 'Moeda (R$)',
            technicalPurpose: 'Auditoria de risco de desenquadramento societário cruzado.',
            legalBase: 'Art. 3º, § 4º, incisos III, IV e V da LC 123/2006.',
            systemImpact: 'Se o sócio possuir mais de 10% em outra empresa não-optante ou for administrador em outra empresa, a soma das receitas que exceder R$ 4,8M causa a exclusão automática do Simples Nacional.',
            reflectsIn: ['Termômetro de Risco Societário', 'Cockpit de Risco', 'Parecer Pericial']
          },
          {
            fieldName: 'Exportação do QSA em Planilha CSV Auditável',
            fieldCode: 'qsaCsvExport',
            inputType: 'Arquivo / Certificado',
            acceptedValues: 'Download instantâneo de arquivo CSV formatado em UTF-8 com BOM',
            technicalPurpose: 'Permite aos auditores e controllers exportar a relação societária completa com percentuais, funções e soma de empresas vinculadas para auditoria externa e cruzamentos contábeis.',
            legalBase: 'IN DREI nº 81/2020 e LC 123/2006 Art. 3º.',
            systemImpact: 'Gera e baixa diretamente no navegador a tabela consolidada do Quadro de Sócios com todas as empresas correlatas para conciliação fiscal e documental.',
            reflectsIn: ['Quadro de Sócios', 'Auditoria Externa', 'Dossiê do Cliente']
          }
        ]
      }
    ]
  },

  // =========================================================================
  // MÓDULO 02: COMPARADOR DE REGIMES TRIBUTÁRIOS 4 EM 1
  // =========================================================================
  {
    id: 'modulo_comparador_regimes',
    number: '02',
    moduleCode: 'MÓDULO 02',
    title: 'VÉRTICE Planejamento Tributário & Comparador 4 em 1',
    subtitle: 'Simulador Comparativo Lado a Lado: Simples Nacional, Lucro Presumido, Lucro Real e MEI',
    iconName: 'Scale',
    targetTab: 'regimes',
    buttonLabel: 'Acessar Comparador de Regimes 4 em 1',
    overview: 'Mecanismo de inteligência tributária que processa os dados operacionais da empresa contra as quatro legislações fiscais brasileiras, revelando a carga tributária anual, DRE comparativa e a melhor recomendação para o próximo exercício financeiro.',
    submodules: [
      {
        id: 'sub_comparador_geral',
        submoduleCode: 'SUB 2.1',
        title: 'Simulador 4 em 1 & DRE Comparativa',
        description: 'Confronto direto das alíquotas efetivas, impostos mensais e anuais, deduções e lucro líquido final.',
        primaryWorkflow: 'O usuário confere os parâmetros de faturamento, compras (CPV) e despesas. O sistema gera a matriz comparativa com score de recomendação de 0 a 100.',
        fields: [
          {
            fieldName: 'Custo das Mercadorias / Serviços (CPV / CSP)',
            fieldCode: 'costOfGoodsServices',
            inputType: 'Moeda (R$)',
            acceptedValues: 'Valores em Reais',
            technicalPurpose: 'Representa os custos diretos de aquisição de insumos, mercadorias revendidas ou custos de prestação.',
            legalBase: 'RIR/2018 (Decreto nº 9.580/2018), Art. 289.',
            systemImpact: 'No Lucro Real, reduz diretamente a base de cálculo de IRPJ/CSLL e gera crédito de PIS/COFINS (9,25%). No Lucro Presumido e Simples, não reduz impostos mas afeta o Lucro Líquido na DRE.',
            reflectsIn: ['DRE Comparativa', 'Apuração Lucro Real', 'Créditos PIS/COFINS', 'Margem Líquida']
          },
          {
            fieldName: 'Despesas Operacionais e Administrativas',
            fieldCode: 'operationalExpenses',
            inputType: 'Moeda (R$)',
            acceptedValues: 'Valores em Reais',
            technicalPurpose: 'Aluguel, energia, contabilidade, software, publicidade e despesas gerais.',
            legalBase: 'Art. 311 do RIR/2018 (Despesas Necessárias, Habituais e Usuais).',
            systemImpact: 'No Lucro Real, deduz o IRPJ e a CSLL no LALUR. Aluguéis e energia geram créditos adicionais de PIS e COFINS não-cumulativos.',
            reflectsIn: ['Lucro Real LALUR', 'DRE Comparativa', 'Margem Operacional']
          },
          {
            fieldName: 'Percentual de Vendas para Empresas (B2B)',
            fieldCode: 'b2bSalesPercent',
            inputType: 'Percentual (%)',
            acceptedValues: '0% a 100%',
            technicalPurpose: 'Mede a sensibilidade de repasse de créditos tributários aos clientes compradores.',
            legalBase: 'Art. 23 da LC 123/2006 (Transferência de Créditos no Simples).',
            systemImpact: 'No Simples, o cliente PJ aproveita pouco ou nenhum crédito de PIS/COFINS e apenas fração de ICMS. No Lucro Presumido/Real, o cliente B2B toma 100% de crédito, tornando a empresa mais competitiva.',
            reflectsIn: ['Índice de Competitividade B2B', 'Recomendação do Regime', 'Parecer Técnico']
          }
        ]
      },
      {
        id: 'sub_presumido_real_parametros',
        submoduleCode: 'SUB 2.2',
        title: 'Parâmetros Específicos: Lucro Presumido & Lucro Real',
        description: 'Bases de presunção, adicionais de imposto de renda e alíquotas de encargos previdenciários.',
        primaryWorkflow: 'Ajuste fino das alíquotas de presunção comercial (8%) ou serviços (32%), cálculo do Adicional de IRPJ (10% sobre o excedente de R$ 20k/mês) e CPP patronal (20% + RAT + Terceiros).',
        fields: [
          {
            fieldName: 'Percentual de Presunção do IRPJ',
            fieldCode: 'irpjPresumptionRate',
            inputType: 'Seleção Única',
            acceptedValues: '8% (Comércio/Indústria), 16% (Transporte) ou 32% (Serviços em Geral)',
            technicalPurpose: 'Aplica a presunção legal sobre a receita bruta para definir a base de cálculo presumida do IRPJ.',
            legalBase: 'Art. 15 da Lei nº 9.249/1995.',
            systemImpact: 'Multiplica a receita pela presunção e sobre o resultado aplica 15% de IRPJ padrão + 10% de adicional sobre a parcela que ultrapassar R$ 60.000,00 no trimestre.',
            reflectsIn: ['Imposto IRPJ Lucro Presumido', 'DRE Presumido', 'Comparador 4 em 1']
          },
          {
            fieldName: 'Percentual de Presunção da CSLL',
            fieldCode: 'csllPresumptionRate',
            inputType: 'Seleção Única',
            acceptedValues: '12% (Comércio/Indústria) ou 32% (Serviços em Geral)',
            technicalPurpose: 'Base de cálculo presumida da Contribuição Social sobre o Lucro Líquido.',
            legalBase: 'Art. 20 da Lei nº 9.249/1995.',
            systemImpact: 'Multiplica a receita pela presunção e aplica a alíquota fixa de 9% de CSLL.',
            reflectsIn: ['Imposto CSLL Lucro Presumido', 'Comparador 4 em 1']
          },
          {
            fieldName: 'Encargos Previdenciários Patronais (CPP + RAT + Terceiros)',
            fieldCode: 'cppPatronalRate',
            inputType: 'Percentual (%)',
            acceptedValues: '20,00% a 28,80% (Padrão: 28,80% para Lucro Presumido/Real)',
            technicalPurpose: 'Custo previdenciário obrigatório sobre a folha de salários e pró-labore fora do Simples.',
            legalBase: 'Lei nº 8.212/1991, Art. 22.',
            systemImpact: 'No Lucro Presumido e Real, soma 28,8% sobre toda a massa de salários e pró-labore. No Simples Nacional (Anexos I, II, III e V), a CPP já está inclusa no DAS sem custo patronal adicional.',
            reflectsIn: ['Custo Efetivo da Folha', 'Diferencial de Carga Simples vs Presumido']
          }
        ]
      }
    ]
  },

  // =========================================================================
  // MÓDULO 03: REFORMA TRIBUTÁRIA & TRANSIÇÃO DO IVA DUAL
  // =========================================================================
  {
    id: 'modulo_reforma_tributaria',
    number: '03',
    moduleCode: 'MÓDULO 03',
    title: 'VÉRTICE Reforma Tributária & IVA Dual (EC 132/2023)',
    subtitle: 'Simulação da Transição 2026-2033: IBS, CBS, Imposto Seletivo e Mecanismo de Split Payment',
    iconName: 'TrendingUp',
    targetTab: 'reforma',
    buttonLabel: 'Acessar Reforma Tributária & IVA Dual',
    overview: 'Modelagem do impacto da Emenda Constitucional nº 132/2023 e Leis Complementares regulamentadoras, prevendo a substituição do PIS, COFINS, IPI, ICMS e ISS pelo modelo IVA Dual (CBS Federal e IBS Estadual/Municipal) com retenção instantânea via Split Payment.',
    submodules: [
      {
        id: 'sub_reforma_aliquotas',
        submoduleCode: 'SUB 3.1',
        title: 'Cálculo do IVA Dual & Cronograma de Transição',
        description: 'Simulação das alíquotas de teste (2026), vigência da CBS (2027), redução do ICMS/ISS (2029-2032) e transição plena em 2033.',
        primaryWorkflow: 'O usuário seleciona o ano projetado da simulação e visualiza a extinção gradual dos tributos antigos e o aumento progressivo do IVA Dual.',
        fields: [
          {
            fieldName: 'Ano de Projeção da Reforma',
            fieldCode: 'reformaTargetYear',
            inputType: 'Seleção Única',
            acceptedValues: '2026 (Teste), 2027 (CBS Plena), 2029-2032 (Transição ICMS/ISS), 2033 (Vigência Total)',
            technicalPurpose: 'Define as alíquotas vigentes conforme o calendário constitucional oficial.',
            legalBase: 'Art. 124 a 133 do ADCT (acrescentados pela EC 132/2023).',
            systemImpact: 'Em 2026: aplica 0,9% de CBS e 0,1% de IBS como teste compensável. Em 2027: extingue PIS e COFINS e inicia a CBS integral (~8,8%). De 2029 a 2032: reduz ICMS/ISS à razão de 1/10 ao ano e eleva o IBS.',
            reflectsIn: ['Quadro de Transição', 'DRE Projetada', 'Comparativo de Carga Futura']
          },
          {
            fieldName: 'Alíquota Padrão de Referência do IVA Dual',
            fieldCode: 'standardIvaDualRate',
            inputType: 'Percentual (%)',
            acceptedValues: '26,50% a 28,00% (Padrão Oficial Estimado: 26,50%)',
            technicalPurpose: 'Alíquota neutra combinada estimada pelo Ministério da Fazenda para CBS (~8,8%) e IBS (~17,7%).',
            legalBase: 'PLP 68/2024 (Regulamentação da Reforma Tributária).',
            systemImpact: 'Calcula o impacto tributário sobre operações sem regime diferenciado, demonstrando o efeito nos preços de venda.',
            reflectsIn: ['Simulador IVA Dual', 'Impacto na Precificação']
          },
          {
            fieldName: 'Regime Diferenciado / Redução Constitucional',
            fieldCode: 'specialRegimeDiscount',
            inputType: 'Seleção Única',
            acceptedValues: 'Padrão (0% redução), Saúde/Educação (60% redução = alíquota ~10,6%), Alimentos Cesta Básica (100% isenção)',
            technicalPurpose: 'Aplica os redutores previstos no Art. 9º da EC 132/2023 para setores específicos.',
            legalBase: 'Art. 156-A, § 5º da CF/88.',
            systemImpact: 'Reduz a alíquota do IVA Dual para 40% da padrão (desconto de 60%) ou zera totalmente no caso de produtos da Cesta Básica Nacional.',
            reflectsIn: ['Cálculo de Imposto Futuro', 'Recomendação Setorial']
          },
          {
            fieldName: 'Ativação do Imposto Seletivo (IS)',
            fieldCode: 'isSelectiveTaxActive',
            inputType: 'Checkbox (Booleano)',
            technicalPurpose: 'Identifica se a empresa comercializa produtos ou serviços prejudiciais à saúde ou ao meio ambiente.',
            legalBase: 'Art. 153, VIII da CF/88.',
            systemImpact: 'Incide como imposto monofásico não-cumulativo sobre bebidas açucaradas, alcoólicas, cigarros, veículos poluentes e extração de minérios/petróleo.',
            reflectsIn: ['Adicional de Imposto Seletivo', 'Custo Final do Produto']
          }
        ]
      },
      {
        id: 'sub_reforma_split_payment',
        submoduleCode: 'SUB 3.2',
        title: 'Mecanismo Split Payment & Opção do Simples Nacional',
        description: 'Retenção imediata no momento da liquidação financeira (PIX/Cartão) e opção de recolher o IVA por dentro ou por fora do Simples.',
        primaryWorkflow: 'Demonstração de como o recolhimento automático afeta o fluxo de caixa diário e cálculo da perda de competitividade caso a empresa não repasse créditos a clientes B2B.',
        fields: [
          {
            fieldName: 'Opção do Simples: Recolher IVA Dual no DAS ou Por Fora',
            fieldCode: 'simplesIvaOption',
            inputType: 'Seleção Única',
            acceptedValues: 'Recolher Tudo no DAS (Padrão Simples) vs Recolher IBS/CBS por Fora (Regime Normal)',
            technicalPurpose: 'Permite à empresa do Simples escolher se recolhe o IBS e a CBS pelo regime normal de débitos e créditos.',
            legalBase: 'Art. 146-A da CF/88 (inserido pela EC 132/2023).',
            systemImpact: 'Se recolher no DAS, a carga é menor, mas clientes PJ não tomam crédito integral. Se recolher por fora, paga a alíquota plena do IVA Dual com direito a crédito de insumos e repassa crédito integral a clientes B2B.',
            reflectsIn: ['Simulação de Competitividade B2B', 'Planejamento de Transição']
          },
          {
            fieldName: 'Impacto do Split Payment no Capital de Giro',
            fieldCode: 'splitPaymentImpact',
            inputType: 'Moeda (R$)',
            acceptedValues: 'Calculado automaticamente',
            technicalPurpose: 'Mede o valor que deixa de entrar na conta bancária da empresa no momento da venda, retido diretamente pelas instituições financeiras para a RFB e Comitê Gestor do IBS.',
            legalBase: 'Art. 156-A, § 5º, V da CF/88.',
            systemImpact: 'Demonstra a redução do float financeiro: o imposto é pago no dia da venda (D+0/D+1) em vez do dia 20 do mês subsequente.',
            reflectsIn: ['DFC BPO Financeiro', 'Alerta de Fluxo de Caixa']
          }
        ]
      }
    ]
  },

  // =========================================================================
  // MÓDULO 04: BLINDAGEM SOCIETÁRIA, HOLDINGS & REDESIM 27 JUNTAS
  // =========================================================================
  {
    id: 'modulo_blindagem_societaria',
    number: '04',
    moduleCode: 'MÓDULO 04',
    title: 'VÉRTICE Blindagem Societária, Holdings & REDESIM 27 Juntas',
    subtitle: 'Estruturação de Holdings, 11 Cláusulas Forenses, 40 Modelos DREI, Auditoria IA e Robô RPA na Junta Comercial',
    iconName: 'Building2',
    targetTab: 'societario',
    buttonLabel: 'Acessar Blindagem Societária & REDESIM',
    overview: 'Módulo de altíssima engenharia jurídica societária e sucessória. Permite estruturar holdings patrimoniais e operacionais, emitir contratos sociais blindados contra execuções (Art. 50 CC), submeter minutas à auditoria pericial IA cláusula a cláusula e acionar o robô RPA para abertura/alteração no Coletor Nacional DBE e Junta Comercial.',
    submodules: [
      {
        id: 'sub_atos_societarios_base',
        submoduleCode: 'SUB 4.1',
        title: 'Gerador de Atos Societários Dinâmico & Dados Cadastrais',
        description: 'Configuração da natureza do ato mercantil, razão social, capital e qualificação de sócios.',
        primaryWorkflow: 'O usuário escolhe o tipo de ato (Constituição, Alteração, Transformação, Distrato, etc.) e preenche os dados da sociedade.',
        fields: [
          {
            fieldName: 'Tipo de Ato Societário (Modo do Contrato)',
            fieldCode: 'contractMode',
            inputType: 'Seleção Única',
            acceptedValues: 'abertura (Constituição) | alteracao (Consolidação) | transformacao (SLU para LTDA ou vice-versa) | distrato (Baixa) | acordo_socios | mutuo_conversivel',
            technicalPurpose: 'Define o preâmbulo institucional, estrutura de cláusulas essenciais e o fluxo de eventos na REDESIM.',
            legalBase: 'Instrução Normativa DREI nº 81/2020 e Código Civil Brasileiro.',
            systemImpact: 'Muda dinamicamente todo o esqueleto do contrato, os eventos automáticos do DBE (ex: 101 para Abertura, 220 para Denominação, 247 para Capital, 211 para Endereço) e a operação acionada pelo Robô RPA.',
            reflectsIn: ['Minuta do Contrato', 'Eventos Redesim', 'Operação do Robô RPA', 'Visualizador Executivo']
          },
          {
            fieldName: 'Razão Social / Denominação Empresarial',
            fieldCode: 'nomeEmpresarial',
            inputType: 'Texto',
            technicalPurpose: 'Nome de registro da sociedade mercantil com sufixo de tipo societário (LTDA, S/A, etc.).',
            legalBase: 'Art. 1.155 a 1.168 do Código Civil e Art. 62 da IN DREI 81/2020.',
            systemImpact: 'Substitui as variáveis {{RAZAO_SOCIAL}} e {{HOLDING_DENOMINACAO}} no documento e define o objeto da pesquisa de viabilidade na Junta.',
            reflectsIn: ['Minuta Oficial', 'Cabeçalho Executivo', 'Busca Prévia de Nome']
          },
          {
            fieldName: 'Capital Social Subscrito e Integralizado',
            fieldCode: 'capitalSocial',
            inputType: 'Moeda (R$)',
            acceptedValues: 'Valores positivos em Reais',
            technicalPurpose: 'Montante total de recursos e patrimônio aportado pelos sócios na sociedade.',
            legalBase: 'Art. 1.055 do Código Civil.',
            systemImpact: 'Calcula a quantidade e valor nominal das quotas (R$ 1,00 cada), gera a cláusula de integralização com forma de pagamento (moeda corrente, bens móveis ou imóveis) e escreve o valor por extenso.',
            reflectsIn: ['Cláusula do Capital Social', 'Quadro de Quotas dos Sócios', 'DBE Evento 247']
          },
          {
            fieldName: 'Endereço Completo da Sede (Logradouro, Número, Bairro, CEP, Cidade, UF)',
            fieldCode: 'companyAddressFull',
            inputType: 'Texto',
            technicalPurpose: 'Localização jurídica e domicílio fiscal da empresa para fins de foro e jurisdição.',
            legalBase: 'Art. 997, II do Código Civil.',
            systemImpact: 'Define a Junta Comercial competente (UF) para protocolo do robô RPA, a cláusula de sede e foro e a consulta prévia de viabilidade municipal.',
            reflectsIn: ['Junta Comercial Selecionada', 'Robô RPA Empresa Fácil', 'Cláusula de Sede e Foro']
          }
        ]
      },
      {
        id: 'sub_clausulas_forenses_especiais',
        submoduleCode: 'SUB 4.2',
        title: 'As 11 Cláusulas Forenses Especiais & Salvaguardas DREI',
        description: 'Travas jurídicas avançadas para blindagem do patrimônio familiar, resolução de conflitos e segurança sucessória.',
        primaryWorkflow: 'O usuário seleciona os checkboxes das cláusulas forenses no modal de configuração. Cada cláusula ativada é redigida e inserida no contrato social com fundamentação jurídica explícita.',
        fields: [
          {
            fieldName: '1. Quóruns Qualificados de Deliberação (Lei 14.451/2022)',
            fieldCode: 'includeQuorunsDrei',
            inputType: 'Checkbox (Booleano)',
            technicalPurpose: 'Ajusta a regra de aprovação de matérias societárias à nova Lei nº 14.451/2022 ou mantém quórum qualificado reforçado.',
            legalBase: 'Lei nº 14.451/2022 (alterou os arts. 1.061 e 1.076 do Código Civil).',
            systemImpact: 'Garante que alterações contratuais e destituição de administradores exijam maioria qualificada especificada, blindando sócios minoritários ou garantindo o controle do fundador.',
            reflectsIn: ['Cláusula das Deliberações Sociais', 'Score de Higidez Pericial (+10%)']
          },
          {
            fieldName: '2. Direito de Preferência & Mecanismo Tag Along',
            fieldCode: 'includeDireitoPreferenciaTagAlong',
            inputType: 'Checkbox (Booleano)',
            technicalPurpose: 'Obriga o sócio vendedor a ofertar suas quotas primeiro aos demais sócios e garante venda conjunta em proposta de terceiros.',
            legalBase: 'Art. 1.057 do Código Civil e prática de governança corporativa.',
            systemImpact: 'Impede a entrada de terceiros estranhos à sociedade sem a anuência prévia dos sócios existentes e assegura o mesmo preço para minoritários no Tag Along.',
            reflectsIn: ['Cláusula de Cessão e Transferência de Quotas', 'Auditoria Forense (+10%)']
          },
          {
            fieldName: '3. Exclusão Extrajudicial de Sócio por Justa Causa',
            fieldCode: 'includeExclusaoExtrajudicial',
            inputType: 'Checkbox (Booleano)',
            technicalPurpose: 'Permite a exclusão de sócio que esteja colocando em risco a continuidade da empresa sem necessidade de ação judicial demorada.',
            legalBase: 'Art. 1.085 do Código Civil.',
            systemImpact: 'Insere a previsão expressa de exclusão por justa causa mediante convocação de assembleia específica, prévia e com direito de defesa.',
            reflectsIn: ['Cláusula de Exclusão de Sócios', 'Auditoria de Conformidade DREI']
          },
          {
            fieldName: '4. Apuração de Haveres pelo Balanço de Determinação (Tema 1.056 STJ)',
            fieldCode: 'includeApuracaoHaveresSTJ',
            inputType: 'Checkbox (Booleano)',
            technicalPurpose: 'Fixa o critério obrigatório de avaliação patrimonial das quotas em caso de saída ou falecimento de sócio.',
            legalBase: 'Art. 1.031 do Código Civil e Jurisprudência Vinculante do STJ (Tema Repetitivo 1.056 / REsp 1.877.331).',
            systemImpact: 'Substitui o simples patrimônio líquido contábil histórico pelo Valor Patrimonial Real a preço de saída, parcelando o pagamento em até 60 parcelas para não asfixiar o caixa da sociedade.',
            reflectsIn: ['Cláusula de Dissolução Parcial e Haveres', 'Score Pericial (+15%)']
          },
          {
            fieldName: '5. Autonomia Patrimonial Estrita & Blindagem contra Desconsideração (Art. 50 CC)',
            fieldCode: 'includeAutonomiaPatrimonialArt50',
            inputType: 'Checkbox (Booleano)',
            technicalPurpose: 'Estabelece a barreira legal intransponível entre os bens particulares dos sócios e os compromissos da empresa.',
            legalBase: 'Art. 49-A e Art. 50 do Código Civil (com redação da Lei da Liberdade Econômica nº 13.874/2019).',
            systemImpact: 'Proíbe expressamente a confusão patrimonial (pagamento de contas pessoais pela empresa e vice-versa) e descaracteriza grupo econômico por mera identidade de sócios, protegendo contra penhoras judiciais.',
            reflectsIn: ['Cláusula de Autonomia Patrimonial', 'Score Pericial (+20%)', 'Radar de Blindagem']
          },
          {
            fieldName: '6. Distribuição Desproporcional de Lucros e Dividendos',
            fieldCode: 'includeDistribuicaoDesproporcional',
            inputType: 'Checkbox (Booleano)',
            technicalPurpose: 'Permite aos sócios remunerar resultados sem obedecer rigidamente à proporção do capital social.',
            legalBase: 'Art. 1.007 do Código Civil e Solução de Consulta COSIT RFB nº 139/2017.',
            systemImpact: 'Autoriza a deliberação soberana dos sócios para destinar dividendos 100% isentos de IRPF em percentuais diferentes das quotas detidas, otimizando o fluxo financeiro e fiscal familiar.',
            reflectsIn: ['Cláusula dos Lucros e Perdas', 'Planejamento Tributário da DRE']
          },
          {
            fieldName: '7. Cláusula de Não Concorrência, Restrição de Atividade & Sigilo (Non-Compete)',
            fieldCode: 'includeNaoConcorrencia',
            inputType: 'Checkbox (Booleano)',
            technicalPurpose: 'Impede o sócio que se retira ou é excluído de abrir negócio concorrente imediato no mesmo raio geográfico.',
            legalBase: 'Art. 1.147 do Código Civil.',
            systemImpact: 'Estipula prazo (geralmente 5 anos), abrangência territorial e multa penal rescisória em caso de desvio de clientela, dados sensíveis ou segredos de negócio.',
            reflectsIn: ['Cláusula de Não Restabelecimento', 'Score Pericial']
          },
          {
            fieldName: '8. Impasse Irreconciliável / Texas Shoot-Out (Shotgun / Buy or Sell)',
            fieldCode: 'includeDeadlockShotgun',
            inputType: 'Checkbox (Booleano)',
            technicalPurpose: 'Mecanismo rápido e cirúrgico para resolver empates societários (deadlocks 50/50).',
            legalBase: 'Art. 421 do Código Civil (Liberdade Contratual).',
            systemImpact: 'Um sócio notifica o outro com o valor que avalia as quotas. O sócio notificado é obrigado ou a vender suas quotas ou a comprar as quotas do notificante pelo mesmo valor unitário, destravando a empresa sem litígio judicial.',
            reflectsIn: ['Cláusula de Solução de Impasses', 'Acordo de Sócios']
          },
          {
            fieldName: '9. Inalienabilidade, Incomunicabilidade e Impenhorabilidade de Quotas',
            fieldCode: 'includeGravamesSucessivos',
            inputType: 'Checkbox (Booleano)',
            technicalPurpose: 'Gravames sucessórios que blindam as quotas doadas aos herdeiros contra credores e divórcios.',
            legalBase: 'Art. 1.911 do Código Civil e Súmula 49 do STF.',
            systemImpact: 'Assegura que o cônjuge do herdeiro não terá qualquer direito sobre a empresa em caso de separação e impede penhora por dívidas pessoais dos herdeiros.',
            reflectsIn: ['Minuta de Holding Patrimonial', 'Contrato de Doação com Reserva de Usufruto']
          },
          {
            fieldName: '10. Assinatura Eletrônica Qualificada ICP-Brasil e Validade Jurídica',
            fieldCode: 'includeAssinaturaDigitalICP',
            inputType: 'Checkbox (Booleano)',
            technicalPurpose: 'Pactua a validade probatória irrestrita de assinaturas digitais e certificados digitais nas deliberações.',
            legalBase: 'Art. 10, § 2º da MP 2.200-2/2001 e Lei nº 14.063/2020.',
            systemImpact: 'Dispensa reconhecimento de firma presencial em cartório, permitindo o protocolo 100% digital e seguro em qualquer Junta Comercial do país.',
            reflectsIn: ['Cláusula de Disposições Finais', 'Assinatura dos Signatários']
          },
          {
            fieldName: '11. Conselho Consultivo ou de Administração Familiar',
            fieldCode: 'includeConselhoConsultivo',
            inputType: 'Checkbox (Booleano)',
            technicalPurpose: 'Cria um órgão colegiado de governança familiar para orientar os administradores executivos.',
            legalBase: 'Art. 1.053, parágrafo único do Código Civil (aplicação supletiva da Lei das S/A 6.404/76).',
            systemImpact: 'Garante voz aos patriarcas ou conselheiros independentes, estabelecendo regras de transição geracional e protocolo familiar.',
            reflectsIn: ['Estrutura de Governança', 'Minutas de Acordo de Quotistas']
          }
        ]
      },
      {
        id: 'sub_matriz_holdings_modelos',
        submoduleCode: 'SUB 4.3',
        title: 'Matriz Estruturante de Blindagem: 8 Categorias & 40 Modelos',
        description: 'Tipologias especializadas de estruturação societária, holding pura, imobiliária, mista, SPE e reorganização.',
        primaryWorkflow: 'O usuário seleciona o modelo de estruturação na Biblioteca Especializada (ex: HOLD-001 Holding Pura, HOLD-002 Holding Imobiliária, HOLD-007 Doação com Usufruto) e o sistema gera o instrumento pronto.',
        fields: [
          {
            fieldName: 'Tipo de Holding / Modelo Estruturante',
            fieldCode: 'shieldingType',
            inputType: 'Seleção Única',
            acceptedValues: 'HOLD-001 a HOLD-008 (Holdings e Proteção), GOV-010 a GOV-015 (Governança), REORG-020 a REORG-025 (Reorganização Cisão/Fusão/Incorporação), BLIND-030 a BLIND-035 (Proteção Extrema)',
            technicalPurpose: 'Determina a finalidade tributária e patrimonial da empresa (participação em outras sociedades vs locação de imóveis próprios).',
            legalBase: 'Art. 2º, § 3º da Lei nº 6.404/76 e Art. 50 do Código Civil.',
            systemImpact: 'Gera as cláusulas de objeto social específico (ex: CNAE 6462-0/00 para Holding Pura; 6810-2/02 para Aluguel de Imóveis Próprios com tributação no Presumido de 11,33% a 14,53% vs 27,5% na PF).',
            reflectsIn: ['Minuta de Blindagem', 'Economia Tributária de ITBI e Ganho de Capital']
          },
          {
            fieldName: 'Nome do Sócio Patriarca / Fundador (PF)',
            fieldCode: 'holdingSocioPF',
            inputType: 'Texto',
            technicalPurpose: 'Identifica o titular do patrimônio que fará a integralização ou doação.',
            legalBase: 'Art. 538 do Código Civil (Doação).',
            systemImpact: 'Alimenta as variáveis do doador/administrador permanente na minuta e no pacto sucessório.',
            reflectsIn: ['Instrumento de Constituição de Holding', 'Contrato de Doação']
          },
          {
            fieldName: 'Herdeiros e Sucessores Beneficiários',
            fieldCode: 'holdingHeireiros',
            inputType: 'Texto',
            technicalPurpose: 'Qualificação dos filhos e beneficiários donatários das quotas.',
            legalBase: 'Art. 1.784 a 1.856 do Código Civil (Direito das Sucessões).',
            systemImpact: 'Define os percentuais das quotas gravadas recebidas por cada sucessor, evitando a necessidade de abertura de inventário judicial futuro.',
            reflectsIn: ['Quadro de Donatários', 'Cláusula de Transmissão por Herança']
          },
          {
            fieldName: 'Reserva de Usufruto Vitalício com Direito de Voto Retido',
            fieldCode: 'usufrutoVitalicioVoto',
            inputType: 'Checkbox (Booleano)',
            technicalPurpose: 'O patriarca transfere a nua-propriedade aos filhos mas mantém 100% da administração e dos lucros até o falecimento.',
            legalBase: 'Art. 1.390 a 1.411 do Código Civil e Art. 114 da Lei 6.404/76.',
            systemImpact: 'Insere a cláusula de usufruto com direito a voto político incondicional e direito a perceber 100% dos dividendos distribuídos.',
            reflectsIn: ['Cláusula de Usufruto', 'Auditoria Forense (+20%)']
          },
          {
            fieldName: 'Cláusula de Reversão Patrimonial (Art. 547 CC)',
            fieldCode: 'clausulaReversao',
            inputType: 'Checkbox (Booleano)',
            technicalPurpose: 'Determina que se o herdeiro falecer antes do patriarca, as quotas voltam automaticamente para o patriarca.',
            legalBase: 'Art. 547 do Código Civil.',
            systemImpact: 'Impede expressamente que as quotas passem para o genro, nora ou herdeiros do filho pré-morto.',
            reflectsIn: ['Minuta de Blindagem', 'Radar de Risco Sucessório']
          }
        ]
      },
      {
        id: 'sub_auditoria_ia_radar',
        submoduleCode: 'SUB 4.4',
        title: 'Motor de Auditoria Forense Cláusula a Cláusula & Radar de Higidez',
        description: 'Verificação em tempo real de conformidade com DREI, Código Civil, Lei 14.451/22 e precedentes STJ/STF.',
        primaryWorkflow: 'O sistema analisa o texto da minuta gerada ou colada pelo usuário, apontando inconformidades, riscos de exigência na Junta Comercial e calculando a pontuação de 0% a 100%.',
        fields: [
          {
            fieldName: 'Texto da Minuta para Auditoria',
            fieldCode: 'auditorDraftText',
            inputType: 'Texto',
            technicalPurpose: 'Corpo textual do instrumento submetido à varredura das regras legais e periciais.',
            legalBase: 'Instruções Normativas DREI nº 81/2020 e 112/2022.',
            systemImpact: 'O motor percorre o texto buscando termos obrigatórios e termos vulneráveis. Aponta cada falha com severidade (Crítico, Alto, Moderado, Preventivo) e gera a solução recomendada.',
            reflectsIn: ['Radar de Compliance', 'Diagnóstico Forense', 'Parecer Jurídico Oficial']
          },
          {
            fieldName: 'Score de Higidez e Segurança Jurídica',
            fieldCode: 'contractScore',
            inputType: 'Percentual (%)',
            acceptedValues: '0% a 100% (Mínimo de 80% exigido para o Robô RPA)',
            technicalPurpose: 'Índice quantitativo pericial de conformidade do documento societário.',
            legalBase: 'Padrões de Exigência das Juntas Comerciais do Brasil.',
            systemImpact: 'Se o score for ≥ 80%, o sistema libera o botão de disparo imediato do Robô RPA para a Junta Comercial. Se < 80%, exige aplicação de salvaguardas para prevenir exigência ou indeferimento pelos vogais.',
            reflectsIn: ['Liberação do Robô RPA', 'Selo de Higidez no Visualizador Executivo']
          }
        ]
      },
      {
        id: 'sub_robo_rpa_junta_redesim',
        submoduleCode: 'SUB 4.5',
        title: 'Robô de Automação RPA (Junta Comercial & REDESIM / DBE)',
        description: 'Execução automatizada da viabilidade, preenchimento do DBE no Coletor Nacional e protocolo no integrador estadual da Junta Comercial.',
        primaryWorkflow: 'Ao aprovar a minuta com score ≥ 80%, o robô RPA executa a sequência operacional oficial do Estado correspondente.',
        fields: [
          {
            fieldName: 'Estado / Junta Comercial Competente (UF)',
            fieldCode: 'ufEmpresa',
            inputType: 'Seleção Única',
            acceptedValues: 'Todas as 27 UFs do Brasil (PR - Empresa Fácil / JUCEPAR, SP - VRE / JUCESP, RJ - JUCERJA, MG - JUCEMG, etc.)',
            technicalPurpose: 'Direciona o endpoint e a rota do integrador estadual da REDESIM correto.',
            legalBase: 'Lei nº 11.598/2007 (Lei da REDESIM) e DREI.',
            systemImpact: 'Carrega os fluxos específicos do portal estadual, cálculo das taxas da DARE/DARF da Junta e regras de zoneamento municipal.',
            reflectsIn: ['Tela do Robô RPA', 'Protocolo da Junta Comercial', 'Instruções Passo a Passo']
          },
          {
            fieldName: 'Eventos REDESIM Selecionados para o DBE',
            fieldCode: 'selectedRedesimEvents',
            inputType: 'Múltipla Seleção',
            acceptedValues: '210 (Alteração de Endereço), 211 (Alteração de Endereço mesmo município), 220 (Alteração de Nome Empresarial), 244 (Alteração de Atividades Econômicas), 247 (Alteração de Capital Social), 248/249 (Alteração de Quadro Societário QSA)',
            technicalPurpose: 'Códigos numéricos oficiais da Receita Federal que compõem o Documento Básico de Entrada (DBE).',
            legalBase: 'Instrução Normativa RFB nº 2.119/2022 (Cadastro Nacional da Pessoa Jurídica).',
            systemImpact: 'O robô preenche cada campo no Coletor Nacional da Redesim de acordo com os eventos selecionados, gerando o número de recibo e identificação para transmissão.',
            reflectsIn: ['Geração do DBE', 'Ficha Cadastral da PJ (FCPJ)', 'Transmissão Redesim']
          }
        ]
      }
    ]
  },

  // =========================================================================
  // MÓDULO 05: CLASSIFICAÇÃO FISCAL, CFOP & PIS/COFINS MONOFÁSICO
  // =========================================================================
  {
    id: 'modulo_classificacao_monofasico',
    number: '05',
    moduleCode: 'MÓDULO 05',
    title: 'VÉRTICE Classificação Fiscal, CFOP & Monofásico',
    subtitle: 'Auditoria de NCM, Produtos Monofásicos PIS/COFINS, Segregação CFOP e ICMS-ST',
    iconName: 'Tags',
    targetTab: 'consultoria_fiscal',
    buttonLabel: 'Acessar Classificação Fiscal & Monofásico',
    overview: 'Módulo dedicado à auditoria das vendas de mercadorias e prestação de serviços, identificando produtos com alíquota zero ou tributação concentrada (monofásico) para exclusão do PIS/COFINS e ICMS-ST no cálculo da guia DAS do Simples Nacional.',
    submodules: [
      {
        id: 'sub_ncm_monofasico',
        submoduleCode: 'SUB 5.1',
        title: 'Consulta NCM & Regime Monofásico PIS/COFINS',
        description: 'Base de dados oficial de Nomenclatura Comum do Mercosul com regras de tributação monofásica.',
        primaryWorkflow: 'Busca por código NCM ou descrição do produto para verificar se a mercadoria é monofásica.',
        fields: [
          {
            fieldName: 'Código NCM (8 Dígitos)',
            fieldCode: 'ncmCode',
            inputType: 'Texto',
            acceptedValues: 'Ex: 8708.29.99 (Autopeças), 3004.90.99 (Medicamentos), 2202.10.00 (Bebidas Frias), 3304.99.90 (Cosméticos)',
            technicalPurpose: 'Identificação aduaneira e fiscal exata da mercadoria.',
            legalBase: 'Leis nº 10.147/2000, 10.485/2002 e Art. 18, § 4º-A da LC 123/2006.',
            systemImpact: 'Ao identificar que o NCM é monofásico, o sistema instrui a segregar a receita desse produto no PGDAS-D, reduzindo em até 30% o valor total da guia DAS por desoneração legal.',
            reflectsIn: ['Auditoria de NCM', 'Segregação de Receitas', 'Economia na Guia DAS']
          },
          {
            fieldName: 'Tratamento de ICMS Substituição Tributária (ST)',
            fieldCode: 'icmsTreatment',
            inputType: 'Seleção Única',
            acceptedValues: 'tributado_integral | st_substituicao | isencao_total | reducao_base',
            technicalPurpose: 'Indica se o ICMS já foi recolhido antecipadamente pelo fabricante ou distribuidor.',
            legalBase: 'Art. 150, § 7º da CF/88 e Convênio ICMS 142/2018.',
            systemImpact: 'Quando marcado como "st_substituicao", expurga o percentual de ICMS da alíquota do Simples Nacional referente a essa parcela de faturamento.',
            reflectsIn: ['Segregação CFOP', 'Cálculo do DAS', 'Comparador de Regimes']
          }
        ]
      }
    ]
  },

  // =========================================================================
  // MÓDULO 06: EMISSOR FISCAL NFS-e & PADRÃO NACIONAL GOV.BR
  // =========================================================================
  {
    id: 'modulo_emissor_nfse',
    number: '06',
    moduleCode: 'MÓDULO 06',
    title: 'VÉRTICE Emissor Fiscal NFS-e & Padrão Nacional',
    subtitle: 'Emissão de Notas Fiscais de Serviços Eletrônicas padrão Gov.br, Certificado A1 e Retenções',
    iconName: 'Receipt',
    targetTab: 'emissao_nfse',
    buttonLabel: 'Acessar Emissor Fiscal NFS-e',
    overview: 'Módulo emissor de notas fiscais de serviço integrado com a plataforma nacional de NFS-e da Receita Federal (Portal de Gestão NFS-e Nacional / Gov.br), com validação automática de tomador, cálculo de ISS e retenções federais.',
    submodules: [
      {
        id: 'sub_nfse_dados_gerais',
        submoduleCode: 'SUB 6.1',
        title: 'Dados da Nota Fiscal, Tomador & Serviços',
        description: 'Preenchimento dos dados do cliente tomador, serviço prestado e valores.',
        primaryWorkflow: 'O usuário informa o CPF/CNPJ do tomador, seleciona o Código de Tributação Nacional e preenche o valor do serviço.',
        fields: [
          {
            fieldName: 'CPF / CNPJ do Tomador do Serviço',
            fieldCode: 'tomadorDoc',
            inputType: 'Texto',
            technicalPurpose: 'Identificação fiscal do contratante para emissão e cruzamento na malha fiscal da RFB.',
            legalBase: 'Convênio NFS-e Nacional e Resolução CGSN nº 169/2022.',
            systemImpact: 'Consulta automática via API para preencher Razão Social e endereço do tomador e define se há obrigatoriedade de retenção de tributos federais.',
            reflectsIn: ['Corpo da NFS-e', 'DANFSE', 'XML de Transmissão']
          },
          {
            fieldName: 'Código de Tributação Nacional da NFS-e',
            fieldCode: 'codigoTributacaoNacional',
            inputType: 'Seleção Única',
            acceptedValues: 'Tabela Padrão Nacional (ex: 01.07.01 - Suporte Técnico em Informática)',
            technicalPurpose: 'Padronização do serviço em âmbito nacional perante o Portal Gov.br.',
            legalBase: 'Lista Anexa à Lei Complementar nº 116/2003.',
            systemImpact: 'Determina a alíquota de ISS do município do prestador ou do tomador e se o imposto é devido no local do estabelecimento ou no local da execução.',
            reflectsIn: ['XML de Lote', 'DANFSE', 'Guia de ISS']
          },
          {
            fieldName: 'Valor Bruto do Serviço Prestado',
            fieldCode: 'valorServico',
            inputType: 'Moeda (R$)',
            acceptedValues: 'Valores em Reais',
            technicalPurpose: 'Base de cálculo para os tributos municipais e federais.',
            legalBase: 'Art. 7º da LC 116/2003.',
            systemImpact: 'Calcula o valor líquido a receber deduzindo as retenções aplicáveis e alimenta automaticamente o módulo de Faturamento e BPO Financeiro.',
            reflectsIn: ['Total da NFS-e', 'BPO Financeiro (Contas a Receber)', 'RBT12']
          },
          {
            fieldName: 'Retenções Federais (PIS, COFINS, CSLL, IRPJ, INSS)',
            fieldCode: 'retencoesFederais',
            inputType: 'Moeda (R$)',
            technicalPurpose: 'Dedução de tributos antecipados na fonte quando o tomador é pessoa jurídica.',
            legalBase: 'Art. 30 da Lei nº 10.833/2003 (PIS/COFINS/CSLL 4,65%) e Art. 714 do RIR/2018.',
            systemImpact: 'Se a empresa for do Simples Nacional, não há retenção de PIS/COFINS/CSLL na fonte (Art. 1º da IN RFB 765/2007), mas se for do Presumido ou Real, desconta o valor retido.',
            reflectsIn: ['Valor Líquido da Nota', 'Compensação Tributária na DRE']
          }
        ]
      }
    ]
  },

  // =========================================================================
  // MÓDULO 07: GESTÃO FINANCEIRA, BPO & DEMONSTRATIVOS CONTÁBEIS
  // =========================================================================
  {
    id: 'modulo_gestao_financeira_bpo',
    number: '07',
    moduleCode: 'MÓDULO 07',
    title: 'VÉRTICE Gestão Financeira, BPO & Demonstrativos',
    subtitle: 'DRE Fiscal e Gerencial, Balancete, Fluxo de Caixa (DFC) e Tesouraria BPO',
    iconName: 'Wallet',
    targetTab: 'financeiro_gerencial',
    buttonLabel: 'Acessar Gestão Financeira & BPO',
    overview: 'Módulo de controladoria e finanças que traduz o desempenho tributário em resultados financeiros reais, oferecendo DRE contábil nos padrões do CFC, fluxo de caixa diário e gestão de contas a pagar e receber para BPO.',
    submodules: [
      {
        id: 'sub_dre_balancete',
        submoduleCode: 'SUB 7.1',
        title: 'DRE Contábil & Demonstrações Financeiras',
        description: 'Demonstração do Resultado do Exercício e Balancete patrimonial.',
        primaryWorkflow: 'Consolidação de Receitas, Custos Operacionais, Deduções de Impostos, Despesas e Lucro Líquido final dos sócios.',
        fields: [
          {
            fieldName: 'Receita Operacional Bruta',
            fieldCode: 'grossRevenue',
            inputType: 'Moeda (R$)',
            technicalPurpose: 'Ponto de partida da DRE contábil.',
            legalBase: 'Art. 187 da Lei nº 6.404/76 e NBC TG 26 (R5) do CFC.',
            systemImpact: 'Base para cálculo das margens bruta, operacional e líquida.',
            reflectsIn: ['DRE', 'Balancete', 'Relatório Técnico']
          },
          {
            fieldName: 'Distribuição de Lucros Isentos aos Sócios',
            fieldCode: 'lucroIsentoDistribuido',
            inputType: 'Moeda (R$)',
            technicalPurpose: 'Apuração do montante que pode ser sacado pelos sócios com 100% de isenção de Imposto de Renda.',
            legalBase: 'Art. 14 da LC 123/2006 e Art. 10 da Lei nº 9.249/1995.',
            systemImpact: 'Com escrituração contábil regular, todo o lucro líquido após impostos pode ser distribuído isento, superando os limites da presunção simples.',
            reflectsIn: ['DRE Final', 'Comprovante de Rendimentos dos Sócios']
          }
        ]
      }
    ]
  },

  // =========================================================================
  // MÓDULO 08: PARECER TÉCNICO & LAUDO PERICIAL CPC (ART. 473)
  // =========================================================================
  {
    id: 'modulo_parecer_pericial_cpc',
    number: '08',
    moduleCode: 'MÓDULO 08',
    title: 'VÉRTICE Pareceres & Laudos Periciais CPC',
    subtitle: 'Laudos Oficiais Fundamentados no Art. 473 do CPC, Assinatura CRC e Validador QR Code',
    iconName: 'FileText',
    targetTab: 'parecer',
    buttonLabel: 'Acessar Parecer Técnico & Laudo Pericial',
    overview: 'Geração de instrumentos periciais formais com fé pública nos termos do Código de Processo Civil, prontos para apresentação a bancos, juizados, conselhos fiscais e auditorias externas.',
    submodules: [
      {
        id: 'sub_laudo_estrutura',
        submoduleCode: 'SUB 8.1',
        title: 'Estruturação do Laudo Pericial & Metodologia',
        description: 'Metodologia científica, quesitos respondidos e conclusão técnica fundamentada.',
        primaryWorkflow: 'O perito/contador revisa os dados da auditoria fiscal e o sistema monta a peça técnica timbrada.',
        fields: [
          {
            fieldName: 'Identificação do Perito / Responsável Técnico (Nome e CRC)',
            fieldCode: 'peritoCrc',
            inputType: 'Texto',
            technicalPurpose: 'Qualificação profissional do contador emissor do laudo pericial.',
            legalBase: 'Art. 465 e 473 do Código de Processo Civil (CPC/2015).',
            systemImpact: 'Imprime a chancela do profissional, assinatura digital e número de registro no Conselho Regional de Contabilidade.',
            reflectsIn: ['Laudo Pericial PDF', 'Visualizador Executivo', 'Selo de Autenticidade']
          },
          {
            fieldName: 'Hash Criptográfico de Segurança & QR Code',
            fieldCode: 'documentSecurityHash',
            inputType: 'Texto',
            technicalPurpose: 'Garantia de inviolabilidade e autenticidade contra falsificações de laudos.',
            legalBase: 'MP 2.200-2/2001 e normas de perícia do CFC (NBC TP 01).',
            systemImpact: 'Gera um código SHA-256 e QR Code único apontando para o validador oficial público do sistema.',
            reflectsIn: ['Rodapé de Segurança', 'Validador Público de Laudos']
          }
        ]
      }
    ]
  },

  // =========================================================================
  // MÓDULO 09: ACERVO NORMATIVO & JURISPRUDÊNCIA VINCULANTE STF/STJ
  // =========================================================================
  {
    id: 'modulo_acervo_jurisprudencia',
    number: '09',
    moduleCode: 'MÓDULO 09',
    title: 'VÉRTICE Acervo Normativo & Doutrina STF/STJ',
    subtitle: 'Teses Tributárias Judiciais, Temas de Repercussão Geral e Manuais Oficiais da RFB',
    iconName: 'BookOpen',
    targetTab: 'conhecimentos',
    buttonLabel: 'Acessar Acervo Normativo & Jurisprudência',
    overview: 'Biblioteca viva de inteligência legal tributária, com teses pacificadas nos tribunais superiores (STF, STJ, CARF) e acervo de manuais oficiais da Receita Federal e CFC.',
    submodules: [
      {
        id: 'sub_teses_stf_stj',
        submoduleCode: 'SUB 9.1',
        title: 'Teses Judiciais de Repercussão Geral & Recuperação',
        description: 'Compêndio de teses para aplicação em planejamento tributário e defesas fiscais.',
        primaryWorkflow: 'Consulta indexada de precedentes jurisprudenciais com fundamentação pronta para cópia em peças e pareceres.',
        fields: [
          {
            fieldName: 'Tema 69 STF (Exclusão do ICMS da Base do PIS/COFINS)',
            fieldCode: 'tema69Stf',
            inputType: 'Texto',
            technicalPurpose: 'Aplicação da Tese do Século no cálculo de PIS/COFINS de empresas no Lucro Presumido e Real.',
            legalBase: 'RE 574.706/PR (Tema 69 da Repercussão Geral do STF).',
            systemImpact: 'Permite deduzir o ICMS destacado em nota da receita de PIS/COFINS, gerando economia contínua e apuração de crédito retroativo dos últimos 5 anos.',
            reflectsIn: ['Base de Cálculo do PIS/COFINS', 'Recuperação Tributária']
          }
        ]
      }
    ]
  },

  // =========================================================================
  // MÓDULO 10: REDE DE PARCEIROS & EXPANSÃO COMERCIAL
  // =========================================================================
  {
    id: 'modulo_rede_parceiros',
    number: '10',
    moduleCode: 'MÓDULO 10',
    title: 'VÉRTICE Rede de Parceiros & Expansão Comercial',
    subtitle: 'Credenciamento de Escritórios Parceiros, Cupons de Desconto e Comissões Recorrentes via PIX',
    iconName: 'Award',
    targetTab: 'portal_parceiro',
    buttonLabel: 'Acessar Rede de Parceiros',
    overview: 'Programa de parcerias estratégicas para expansão da plataforma, onde contadores e consultores credenciados recebem comissões recorrentes mensais (20% a 35%) sobre clientes indicados.',
    submodules: [
      {
        id: 'sub_parceiro_comissoes',
        submoduleCode: 'SUB 10.1',
        title: 'Gestão de Indicações & Extrato de Repasses PIX',
        description: 'Acompanhamento em tempo real de clientes cadastrados, comissões acumuladas e solicitação de saque.',
        primaryWorkflow: 'O parceiro compartilha seu cupom ou link exclusivo. Cada assinatura convertida gera comissão recorrente enquanto o cliente mantiver a licença ativa.',
        fields: [
          {
            fieldName: 'Código do Cupom do Parceiro (Ex: VERTICEPARCEIRO10)',
            fieldCode: 'partnerCouponCode',
            inputType: 'Texto',
            technicalPurpose: 'Garante o rastreio inequívoco da autoria da indicação.',
            legalBase: 'Termo de Credenciamento de Parceria VÉRTICE.',
            systemImpact: 'Concede desconto na fatura do novo cliente e vincula o ID do parceiro à conta pagadora.',
            reflectsIn: ['Extrato do Parceiro', 'Faturamento Master']
          },
          {
            fieldName: 'Chave PIX Cadastrada para Recebimento de Comissões',
            fieldCode: 'partnerPixKey',
            inputType: 'Texto',
            technicalPurpose: 'Destino dos pagamentos das comissões mensais apuradas.',
            legalBase: 'Regulamento do Sistema de Pagamentos Instantâneos (BACEN).',
            systemImpact: 'Alimenta a fila de pagamentos do Usuário Master para liquidação no dia 10 de cada mês.',
            reflectsIn: ['Gestão Master de Repasses', 'Notificações de Pagamento']
          }
        ]
      }
    ]
  },

  // =========================================================================
  // MÓDULO 11: GESTÃO MASTER DA PLATAFORMA (ACESSO EXCLUSIVO MASTER)
  // =========================================================================
  {
    id: 'modulo_gestao_master',
    number: '11',
    moduleCode: 'MÓDULO 11',
    title: 'VÉRTICE Gestão Master & Governança da Plataforma',
    subtitle: 'Acesso Restrito ao Proprietário: Planos & Precificação, Gestão de Contratos, Webmail Umbler e Controle de Licenças',
    iconName: 'Crown',
    targetTab: 'gestao_planos',
    buttonLabel: 'Acessar Painel de Gestão Master',
    isMasterOnly: true,
    overview: 'Módulo de comando supremo da plataforma VÉRTICE, acessível com exclusividade pelo usuário Master (carlosmiguelvieira1@gmail.com / contato@verticeanalises.com.br). Permite configurar preços de assinaturas, ativar/desativar módulos em cada plano, auditar contratos de clientes, controlar repasses a parceiros e operar o webmail corporativo.',
    submodules: [
      {
        id: 'sub_master_planos_precificacao',
        submoduleCode: 'SUB 11.1',
        title: 'Planos de Assinatura, Precificação & Matriz de Permissões',
        description: 'Tabela de preços dos planos (Start, Pro, Corporate, Master) e liberação modular de recursos.',
        primaryWorkflow: 'O Master edita o valor mensal e anual de cada plano e marca quais abas e módulos cada perfil de assinante tem direito de acessar.',
        fields: [
          {
            fieldName: 'Valor Mensal do Plano (R$)',
            fieldCode: 'planPriceMonthly',
            inputType: 'Moeda (R$)',
            acceptedValues: 'Valores em Reais (Ex: R$ 297,00 / R$ 597,00 / R$ 1.197,00)',
            technicalPurpose: 'Define o preço de cobrança recorrente debitado dos escritórios e empresas.',
            legalBase: 'Contrato de Licenciamento de Software SaaS (Lei nº 9.609/1998).',
            systemImpact: 'Altera o valor cobrado nos gateways de pagamento (Boleto/PIX/Cartão) e recalcula as comissões dos parceiros.',
            reflectsIn: ['Tela Pública de Preços', 'Emissão de Cobrança', 'Base de Comissão dos Parceiros']
          },
          {
            fieldName: 'Limite de Empresas / CNPJs Cadastrados por Conta',
            fieldCode: 'planCompanyLimit',
            inputType: 'Seleção Única',
            acceptedValues: '1 Empresa (Start), 5 Empresas (Pro), Ilimitado (Corporate/Master)',
            technicalPurpose: 'Controle de volumetria de clientes que o assinante pode gerenciar simultaneamente.',
            legalBase: 'Termos de Uso da Plataforma.',
            systemImpact: 'O sistema trava a inclusão de novas empresas no Modal de Gerenciamento de Empresas quando o limite da licença é atingido, sugerindo upgrade.',
            reflectsIn: ['Gerenciador de Empresas', 'Trava de Licença']
          },
          {
            fieldName: 'Matriz de Módulos Permitidos (PlanAllowedModules)',
            fieldCode: 'planAllowedModulesMatrix',
            inputType: 'Múltipla Seleção',
            acceptedValues: 'Fator R, Planejamento 4 em 1, Blindagem Societária, Emissor NFS-e, BPO Financeiro, Agenda Fiscal, etc.',
            technicalPurpose: 'Libera ou oculta dinamicamente abas do sistema conforme o plano contratado.',
            legalBase: 'Configuração de RBAC (Role-Based Access Control).',
            systemImpact: 'Caso o usuário tente acessar uma aba fora do seu plano, o sistema bloqueia e exibe modal de contratação ou upgrade de plano.',
            reflectsIn: ['Menu do Navbar', 'Bloqueio de Abas no App.tsx', 'canUserAccessTab']
          }
        ]
      },
      {
        id: 'sub_master_contratos_clientes',
        submoduleCode: 'SUB 11.2',
        title: 'Gestão de Contratos de Prestação de Serviços (Honorários)',
        description: 'Emissão e guarda de contratos de honorários contábeis e consultoria tributária com clientes.',
        primaryWorkflow: 'O Master ou escritório seleciona o cliente, define o valor dos honorários mensais, índice de reajuste anual e emite o contrato timbrado para assinatura.',
        fields: [
          {
            fieldName: 'Valor Mensal dos Honorários Contábeis / Consultoria',
            fieldCode: 'contractFeeAmount',
            inputType: 'Moeda (R$)',
            technicalPurpose: 'Remuneração mensal pactuada pelos serviços profissionais contábeis.',
            legalBase: 'Resolução CFC nº 1.590/2020 (Contrato de Prestação de Serviços Contábeis).',
            systemImpact: 'Insere o valor na cláusula de preço, fixa a data de vencimento e gera faturas no módulo financeiro.',
            reflectsIn: ['Minuta de Contrato de Serviços', 'Financeiro BPO']
          },
          {
            fieldName: 'Índice de Reajuste Anual de Preço',
            fieldCode: 'contractPriceIndex',
            inputType: 'Seleção Única',
            acceptedValues: 'IPCA (IBGE) | IGPM (FGV) | INPC (IBGE)',
            technicalPurpose: 'Preservação do poder de compra dos honorários contra a inflação.',
            legalBase: 'Art. 2º da Lei nº 10.192/2001.',
            systemImpact: 'Insere cláusula obrigatória de reajuste automático a cada 12 meses na data de aniversário do contrato.',
            reflectsIn: ['Cláusula de Reajuste do Contrato']
          },
          {
            fieldName: 'Escopo dos Serviços Contratados (Fiscal, Contábil, Folha, Societário, BPO)',
            fieldCode: 'contractScope',
            inputType: 'Múltipla Seleção',
            technicalPurpose: 'Delimitação estrita das responsabilidades técnicas para mitigar riscos cíveis do contador.',
            legalBase: 'Código Civil (Art. 1.177 a 1.178) e Código de Ética Profissional do Contador.',
            systemImpact: 'Gera as cláusulas de obrigações do contratado e exclui expressamente responsabilidade por atos estranhos ao escopo.',
            reflectsIn: ['Cláusula do Objeto Contratual']
          }
        ]
      },
      {
        id: 'sub_master_webmail_umbler',
        submoduleCode: 'SUB 11.3',
        title: 'Webmail Corporativo Umbler (contato@verticeanalises.com.br)',
        description: 'Operação da caixa postal oficial de suporte e comunicação institucional.',
        primaryWorkflow: 'O Master envia e responde mensagens institucionais, laudos periciais e comunicados fiscais diretamente pelo e-mail corporativo autenticado.',
        fields: [
          {
            fieldName: 'E-mail do Remetente Institucional',
            fieldCode: 'masterWebmailAddress',
            inputType: 'Texto',
            acceptedValues: 'contato@verticeanalises.com.br',
            technicalPurpose: 'Endereço autenticado no servidor de e-mails da Umbler com protocolos SPF, DKIM e DMARC.',
            legalBase: 'Segurança da Informação e LGPD (Lei nº 13.709/2018).',
            systemImpact: 'Garante que os laudos e notificações cheguem na caixa de entrada dos clientes sem cair em pasta de spam.',
            reflectsIn: ['Disparador de E-mails', 'Webmail Umbler']
          }
        ]
      },
      {
        id: 'sub_master_alternador_visoes',
        submoduleCode: 'SUB 11.4',
        title: 'Alternador de Visualização em Tempo Real (Master / Escritório / Empresa)',
        description: 'Recurso exclusivo do Master para inspecionar exatamente como a tela é renderizada para cada tipo de cliente.',
        primaryWorkflow: 'No topo da barra de ações, o Master clica nos botões "Master", "Escritório" ou "Empresa" para alternar o modo de visualização instantaneamente.',
        fields: [
          {
            fieldName: 'Modo de Visualização (viewMode)',
            fieldCode: 'appViewModeSelect',
            inputType: 'Seleção Única',
            acceptedValues: 'master (Acesso Total) | escritorio (Visão de Contador com clientes) | empresa (Visão Simplificada do Empresário)',
            technicalPurpose: 'Auditoria de usabilidade e suporte aos usuários.',
            legalBase: 'Controle de Acesso em Nível de Interface.',
            systemImpact: 'Oculta controles sensíveis e simplifica a navegação quando em modo Empresa, permitindo ao Master testar a experiência do cliente antes da entrega.',
            reflectsIn: ['Navbar', 'DashboardView', 'Permissões Globais']
          }
        ]
      }
    ]
  }
];
