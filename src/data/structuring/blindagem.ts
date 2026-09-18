import { StructuringModelItem } from './types';

export const BLINDAGEM_MODELS: StructuringModelItem[] = [
  {
    id: 'blindagem_desconsideracao_art50',
    title: 'Estrutura Antidesconsideração (Art. 50 CC / Lei 13.874/19)',
    category: 'blindagem',
    categoryName: 'Blindagem Patrimonial & Riscos',
    badge: 'LEI LIBERDADE ECONÔMICA',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    description: 'Blindagem contratual preventiva contra a desconsideração da personalidade jurídica: cláusulas que bloqueiam alegações de confusão patrimonial, definem regras estritas para contas bancárias e separam categoricamente o patrimônio dos sócios e da empresa.',
    legalFramework: 'Art. 50 do Código Civil (redação da Lei nº 13.874/2019 - Lei da Liberdade Econômica); Enunciados 281 a 285 da IV Jornada de Direito Civil.',
    jurisprudence: 'STJ REsp 1.860.334/SP (a mera insolvência da sociedade ou existência de grupo econômico sem desvio de finalidade doloso não autoriza a desconsideração).',
    keyFeatures: ['Vedação Expressa de Pagamento de Contas Pessoais pela PJ', 'Segregação Rígida de Fluxos Financeiros e Contábeis', 'Exigência de Dolo Específico para Qualquer Desconsideração', 'Blindagem do Patrimônio Pessoal dos Quotistas Não Administradores'],
    riskLevel: 'Máxima Blindagem',
    targetProfile: 'Empresários de setores de risco (indústria, transporte, construção, comércio) que desejam proteger seus bens particulares.',
    defaultClauses: {
      autonomiaPatrimonial: true,
      valuationMethod: 'balanco_determinacao',
    },
    generateFullDraft: ({ socioPF, herdeiros, nomeEmpresarial, cidade, ufEmpresa, dateFormatted }) => {
      let d = `CLÁUSULAS ESPECIAIS DE AUTONOMIA PATRIMONIAL E BLINDAGEM REVERSA (ART. 50 DO CÓDIGO CIVIL)\n`;
      d += `SOCIEDADE: ${(nomeEmpresarial || 'EMPRESA INDUSTRIAL').toUpperCase()} LTDA\n`;
      d += `SÓCIO GESTOR: ${socioPF.toUpperCase()}\n`;
      d += `DEMAIS SÓCIOS: ${herdeiros.toUpperCase()}\n\n`;
      d += `CLÁUSULA PRIMEIRA - DA AUTONOMIA PATRIMONIAL ESTATUTÁRIA (LEI Nº 13.874/2019):\n`;
      d += `A sociedade constitui pessoa jurídica autônoma, distinta da pessoa física de seus sócios e administradores. Em observância estrita ao caput do Artigo 50 do Código Civil, a personalidade jurídica somente poderá ser desconsiderada mediante a demonstração inequívoca e cabal de desvio de finalidade doloso ou confusão patrimonial reiterada, não servindo para tal fim a mera insolvência civil ou inadimplemento contratual.\n\n`;
      d += `CLÁUSULA SEGUNDA - DA VEDAÇÃO ABSOLUTA DE CONFUSÃO DE FLUXOS:\n`;
      d += `Fica terminantemente proibido à administração realizar transferências bancárias, pagamentos de despesas pessoais, custeio de viagens particulares ou aquisição de bens para uso privativo dos sócios com recursos da Sociedade, devendo todos os fluxos entre sócio e empresa ocorrerem mediante distribuição formal e periódica de dividendos ou pró-labore devidamente contabilizados.\n\n`;
      d += `CLÁUSULA TERCEIRA - DA IRRESPONSABILIDADE DOS SÓCIOS QUOTISTAS SEM PODERES DE GESTÃO:\n`;
      d += `Os sócios que não exercem funções diretivas ou atos de gestão não responderão por obrigações fiscais, trabalhistas ou cíveis contraídas pela administração, cabendo eventual responsabilização exclusivamente ao administrador que houver agido com excesso de poder ou infração à lei (Art. 1.016 do Código Civil).\n\n`;
      d += `Comarca de ${cidade}/${ufEmpresa}, ${dateFormatted}.\n`;
      return d;
    }
  },

  {
    id: 'segregacao_riscos_operacional_cofre',
    title: 'Arquitetura Operação x Cofre (Segregação de Riscos)',
    category: 'blindagem',
    categoryName: 'Blindagem Patrimonial & Riscos',
    badge: 'ESTRUTURA EM 2 CAMADAS',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    description: 'Engenharia jurídica que divide o negócio em duas pessoas jurídicas distintas: a "PJ Operacional", que assume os empregados, fornecedores e riscos do dia a dia, e a "PJ Cofre / Patrimonial", que detém a propriedade das máquinas, imóveis e marcas, alugando-os para a operacional.',
    legalFramework: 'Arts. 49-A e 50 do Código Civil; Lei nº 13.874/2019; Lei nº 9.279/1996.',
    jurisprudence: 'STJ REsp 1.775.341/SP (A existência de grupo societário com empresas patrimoniais e operacionais distintas é lícita e não gera responsabilidade automática de uma pela outra).',
    keyFeatures: ['Isolamento dos Bens Imóveis e Maquinários em PJ Cofre', 'PJ Operacional não Possui Patrimônio Imobilizado Penhorável', 'Locação e Licenciamento Oneroso Intercompany', 'Redução do Risco de Penhoras em Execuções Trabalhistas'],
    riskLevel: 'Máxima Blindagem',
    targetProfile: 'Médias e grandes empresas com parque fabril, frotas de caminhões ou imóveis operacionais valiosos.',
    defaultClauses: {
      autonomiaPatrimonial: true,
      imunidadeITBI: true,
      valuationMethod: 'balanco_determinacao',
    },
    generateFullDraft: ({ socioPF, herdeiros, ativos, nomeEmpresarial, cidade, ufEmpresa, dateFormatted }) => {
      let d = `MEMORANDO DE ARQUITETURA CORPORATIVA: SEGREGAÇÃO DE ATIVOS E RISCOS (OPERACIONAL X COFRE)\n\n`;
      d += `GRUPO ECONÔMICO: ${(nomeEmpresarial || 'GRUPO EMPRESARIAL').toUpperCase()}\n`;
      d += `INSTITUIDOR PATRIARCAL: ${socioPF.toUpperCase()}\n`;
      d += `SÓCIOS PARTICIPANTES: ${herdeiros.toUpperCase()}\n`;
      d += `ATIVOS ESTRATÉGICOS BLINDADOS: ${ativos.toUpperCase()}\n\n`;
      d += `1. DA ESTRUTURA EM DUAS CAMADAS AUTÔNOMAS:\n`;
      d += `A operação do negócio é formalmente segregada em dois pilares corporativos estanques:\n`;
      d += `a) EMPRESA COFRE PATRIMONIAL: Titular absoluta e proprietária dos imóveis, galpões, marcas e maquinários pesados. Inexiste contratação de funcionários ou faturamento comercial de varejo nesta PJ, eliminando passivos trabalhistas e de consumo.\n`;
      d += `b) EMPRESA OPERACIONAL: Responsável exclusiva pela contratação de equipe, compras de matéria-prima, vendas e execução comercial, locando as instalações e máquinas da PJ Cofre a valores de mercado.\n\n`;
      d += `2. DA DEFESA CONTRA EXTENSÃO DE PENHORAS:\n`;
      d += `Cada sociedade mantém administração formal e contabilidade rigorosamente separadas, cumprindo o Artigo 49-A do Código Civil, de modo que eventual crise ou processo judicial contra a Operacional não atinge a propriedade dos ativos da PJ Cofre.\n\n`;
      d += `Comarca de ${cidade}/${ufEmpresa}, ${dateFormatted}.\n`;
      return d;
    }
  },

  {
    id: 'cost_sharing_intercompany',
    title: 'Contrato de Compartilhamento de Custos (Cost Sharing Agreement)',
    category: 'blindagem',
    categoryName: 'Blindagem Patrimonial & Riscos',
    badge: 'RATEIO INTERCOMPANY',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    description: 'Contrato intercompany de rateio de despesas de suporte administrativo, TI, jurídico, contabilidade e RH centralizados, em conformidade com as Soluções de Consulta da Receita Federal (COSIT 23/2013 e 276/2019), sem incidência de PIS/COFINS e ISS.',
    legalFramework: 'Arts. 421 e 422 do Código Civil; Solução de Divergência COSIT nº 23/2013; Solução de Consulta COSIT nº 276/2019.',
    jurisprudence: 'CARF Acórdão 1402-005.109 (licitude do reembolso de custos compartilhados sem margem de lucro, não configurando prestação onerosa de serviços tributável pelo ISS ou PIS/COFINS).',
    keyFeatures: ['Critérios Objetivos de Rateio (Faturamento, Headcount ou Horas)', 'Ausência Total de Margem de Lucro (At Cost)', 'Não Incidência de ISS, PIS e COFINS sobre os Reembolsos', 'Dedutibilidade Fiscal no Lucro Real das Participantes'],
    riskLevel: 'Estratégico',
    targetProfile: 'Grupos econômicos com múltiplas empresas ou filiais que centralizam compras, controladoria ou TI em uma holding.',
    defaultClauses: {
      autonomiaPatrimonial: true,
      valuationMethod: 'balanco_determinacao',
    },
    generateFullDraft: ({ socioPF, herdeiros, nomeEmpresarial, cidade, ufEmpresa, dateFormatted }) => {
      let d = `CONTRATO INTERCOMPANY DE COMPARTILHAMENTO DE CUSTOS E DESPESAS ADMINISTRATIVAS (COST SHARING)\n`;
      d += `EM CONFORMIDADE COM A SOLUÇÃO DE CONSULTA COSIT Nº 23/2013 DA RECEITA FEDERAL DO BRASIL\n\n`;
      d += `CENTRALIZADORA DOS SERVIÇOS: ${(nomeEmpresarial || 'HOLDING GESTORA').toUpperCase()} LTDA (Rep: ${socioPF.toUpperCase()})\n`;
      d += `EMPRESAS OPERACIONAIS PARTICIPANTES: ${herdeiros.toUpperCase()}\n\n`;
      d += `1. DO OBJETO DO RATEIO:\n`;
      d += `O presente instrumento tem por objeto estabelecer as bases para o rateio transparente dos custos e despesas operacionais comuns relativos a departamentos administrativos de suporte (Tecnologia da Informação, Jurídico, Recursos Humanos, Controladoria e Auditoria), centralizados na Centralizadora.\n\n`;
      d += `2. DA NATUREZA DE MERO REEMBOLSO SEM MARGEM DE LUCRO:\n`;
      d += `As partes declaram que os valores reembolsados correspondem ao rateio contábil exato dos custos incorridos com terceiros, inexistindo qualquer taxa de intermediação, mark-up ou margem de lucro, não se caracterizando prestação onerosa de serviços, restando imune ao ISS e sem base de cálculo para PIS e COFINS.\n\n`;
      d += `Comarca de ${cidade}/${ufEmpresa}, ${dateFormatted}.\n`;
      return d;
    }
  },

  {
    id: 'licenciamento_marcas_intercompany',
    title: 'Contrato de Licenciamento Intercompany de Marcas & Royalties',
    category: 'blindagem',
    categoryName: 'Blindagem Patrimonial & Riscos',
    badge: 'ROYALTIES DEDUTÍVEIS',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    description: 'Contrato de concessão de uso da marca empresarial depositada no INPI pela empresa titular (holding ou cofre) em favor das empresas operacionais que fabricam ou comercializam, estipulando percentual de royalties e dedutibilidade fiscal no IRPJ.',
    legalFramework: 'Lei nº 9.279/1996 (LPI); Art. 13 da Lei nº 9.249/1995; Portaria MF nº 436/1958; Arts. 50 do Código Civil.',
    jurisprudence: 'CARF Acórdão 1302-004.892 (validade da dedução de royalties pagos à empresa do mesmo grupo mediante registro prévio no INPI).',
    keyFeatures: ['Remuneração de 1% a 5% sobre a Receita Líquida Operacional', 'Dedutibilidade no Lucro Real da PJ Pagadora', 'Propriedade da Marca 100% Protegida na Holding', 'Prevenção de Perda de Marca por Execuções de Terceiros'],
    riskLevel: 'Tributário',
    targetProfile: 'Empresas com marcas consolidadas no mercado que faturam no Lucro Real e desejam planejar o fluxo de caixa com royalties.',
    defaultClauses: {
      autonomiaPatrimonial: true,
      nonCompete: true,
      valuationMethod: 'balanco_determinacao',
    },
    generateFullDraft: ({ socioPF, herdeiros, ativos, nomeEmpresarial, cidade, ufEmpresa, dateFormatted }) => {
      let d = `CONTRATO DE LICENCIAMENTO ONEROSO DE USO DE MARCA E KNOW-HOW INTERCOMPANY\n`;
      d += `LICENCIANTE TITULAR DA MARCA: ${(nomeEmpresarial || 'HOLDING MARCAS E PATENTES').toUpperCase()} LTDA (Rep: ${socioPF.toUpperCase()})\n`;
      d += `LICENCIADA OPERACIONAL: EMPRESA COMÉRCIO E INDÚSTRIA LTDA (Rep: ${herdeiros.toUpperCase()})\n`;
      d += `MARCA REGISTRADA NO INPI: ${ativos.toUpperCase()}\n\n`;
      d += `1. DA CONCESSÃO DA LICENÇA DE USO:\n`;
      d += `A Licenciante concede à Licenciada o direito de uso não exclusivo da marca mista registrada perante o Instituto Nacional da Propriedade Industrial (INPI), para fins exclusivos de aposição em seus produtos, publicidade e faturamento comercial.\n\n`;
      d += `2. DA REMUNERAÇÃO (ROYALTIES) E DEDUTIBILIDADE:\n`;
      d += `A Licenciada pagará à Licenciante, a título de royalties pelo uso da marca, o montante correspondente a 3,5% (três e meio por cento) sobre a receita líquida mensal faturada, em consonância com a legislação fiscal do Imposto de Renda e diretrizes do Ministério da Fazenda.\n\n`;
      d += `Comarca de ${cidade}/${ufEmpresa}, ${dateFormatted}.\n`;
      return d;
    }
  },

  {
    id: 'nda_segredo_societario',
    title: 'Acordo de Confidencialidade (NDA), Segredo & Não Competição',
    category: 'blindagem',
    categoryName: 'Blindagem Patrimonial & Riscos',
    badge: 'SEGREDO INDUSTRIAL & NDA',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    description: 'Pacto parassocial de sigilo e não concorrência para transações societárias, rodadas de investimento ou desligamento de executivos: proteção de listas de clientes, margens comerciais, fórmulas, algoritmos e penalidade pesada por quebra de confidencialidade.',
    legalFramework: 'Arts. 195 e 209 da Lei nº 9.279/1996 (Crimes de Concorrência Desleal); Arts. 421 e 422 do Código Civil.',
    jurisprudence: 'STJ REsp 1.203.109/MG (validade e plena executividade de cláusulas de confidencialidade e não concorrência com delimitação espacial e temporal).',
    keyFeatures: ['Definição Rigorosa de Segredos Comerciais Protegidos', 'Multa Cominatória Não Compensatória por Violação', 'Vedação de Aliciamento de Empregados e Fornecedores', 'Validade Extensiva por 5 Anos Pós-Contrato'],
    riskLevel: 'Estratégico',
    targetProfile: 'Sócios, diretores, investidores e consultores que têm acesso aos números estratégicos e segredos industriais da empresa.',
    defaultClauses: {
      nonCompete: true,
      valuationMethod: 'balanco_determinacao',
    },
    generateFullDraft: ({ socioPF, herdeiros, nomeEmpresarial, cidade, ufEmpresa, dateFormatted }) => {
      let d = `ACORDO BILATERAL DE CONFIDENCIALIDADE, PROTEÇÃO DE SEGREDO EMPRESARIAL E NÃO CONCORRÊNCIA (NDA)\n`;
      d += `PARTE REVELADORA: ${(nomeEmpresarial || 'EMPRESA INOVADORA').toUpperCase()} LTDA (Rep: ${socioPF.toUpperCase()})\n`;
      d += `PARTE RECEPTORA / DESTINATÁRIA: ${herdeiros.toUpperCase()}\n\n`;
      d += `1. DO ESCOPO DA INFORMAÇÃO CONFIDENCIAL:\n`;
      d += `Constitui Informação Confidencial todo e qualquer dado técnico, financeiro, contábil, lista de clientes, segredo industrial, código-fonte, método de precificação ou plano de expansão revelado direta ou indiretamente pela Reveladora.\n\n`;
      d += `2. DA OBRIGAÇÃO DE SIGILO E NÃO CONCORRÊNCIA (ART. 195 DA LEI 9.279/1996):\n`;
      d += `A Receptora obriga-se a guardar absoluto segredo e a não utilizar as informações confidenciais para proveito próprio ou de terceiros concorrentes, bem como a não aliciar qualquer colaborador da Reveladora pelo período mínimo de 5 (cinco) anos.\n\n`;
      d += `3. DA MULTA PENAL INDENIZATÓRIA:\n`;
      d += `A quebra comprovada de qualquer das obrigações sujeitará o infrator ao pagamento imediato de multa penal de caráter não compensatório no valor de R$ 500.000,00, sem prejuízo da apuração de perdas e danos suplementares.\n\n`;
      d += `Comarca de ${cidade}/${ufEmpresa}, ${dateFormatted}.\n`;
      return d;
    }
  }
];
