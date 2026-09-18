// =====================================================================================
// MOTOR ESPECIALISTA DE CONTRATOS SOCIETÁRIOS & EVENTOS REDESIM / DREI / JUCE 360°
// Padronizado com: IN DREI 81/2020 e Anexos, Código Civil (Lei 10.406/02),
// Lei das S/A (Lei 6.404/76), Lei da Liberdade Econômica (Lei 13.874/19),
// Lei 14.451/2022 (Quóruns), CPC/2015 (Art. 784, § 4º) e Tabela Oficial de Eventos REDESIM/RFB.
// =====================================================================================

export interface RedesimEventDefinition {
  code: string;
  category: 'abertura' | 'cadastral' | 'quadro_societario' | 'capital' | 'transformacao' | 'reorganizacao' | 'encerramento';
  name: string;
  description: string;
  applicableTypes: Array<'SLU' | 'LTDA' | 'SA' | 'EI' | 'SOCIEDADE_SIMPLES' | 'SCP'>;
  requiresViabilidade: boolean;
  requiresDBE: boolean;
  dreiArticle: string;
  defaultClauseSnippet: string;
}

export const REDESIM_EVENTS_CATALOG: RedesimEventDefinition[] = [
  // ABERTURA / INSCRIÇÃO
  {
    code: '101',
    category: 'abertura',
    name: 'Inscrição de Primeiro Estabelecimento (Matriz)',
    description: 'Ato constitutivo originário de abertura de matriz perante a Junta Comercial, Receita Federal, SEFAZ e Prefeitura.',
    applicableTypes: ['SLU', 'LTDA', 'SA', 'EI', 'SOCIEDADE_SIMPLES', 'SCP'],
    requiresViabilidade: true,
    requiresDBE: true,
    dreiArticle: 'IN DREI 81/2020, Anexo II e IV',
    defaultClauseSnippet: 'Constituição originária de sociedade com subscrição e integralização integral de capital social.'
  },
  {
    code: '102',
    category: 'abertura',
    name: 'Inscrição dos Demais Estabelecimentos (Abertura de Filial)',
    description: 'Criação de filial no mesmo Estado ou em outra Unidade da Federação, fixando capital destacado e endereço.',
    applicableTypes: ['SLU', 'LTDA', 'SA'],
    requiresViabilidade: true,
    requiresDBE: true,
    dreiArticle: 'Art. 1.000 do Código Civil e IN DREI 81/2020',
    defaultClauseSnippet: 'A sociedade delibera a abertura de filial no endereço [ENDERECO_FILIAL], com capital destacado de R$ [VALOR].'
  },

  // ALTERAÇÕES CADASTRAIS
  {
    code: '210',
    category: 'cadastral',
    name: 'Alteração do Nome Empresarial (Firma ou Denominação Social)',
    description: 'Modificação da razão social ou denominação com observância do princípio da novidade e veracidade.',
    applicableTypes: ['SLU', 'LTDA', 'SA', 'EI', 'SOCIEDADE_SIMPLES'],
    requiresViabilidade: true,
    requiresDBE: true,
    dreiArticle: 'Art. 1.155 a 1.168 CC e Art. 34 IN DREI 81/2020',
    defaultClauseSnippet: 'O Nome Empresarial da sociedade é alterado de [NOME_ANTIGO] para [NOVO_NOME].'
  },
  {
    code: '220',
    category: 'cadastral',
    name: 'Alteração do Nome de Fantasia (Título do Estabelecimento)',
    description: 'Inclusão, alteração ou exclusão de marca comercial ou título do estabelecimento perante o CNPJ.',
    applicableTypes: ['SLU', 'LTDA', 'SA', 'EI', 'SOCIEDADE_SIMPLES'],
    requiresViabilidade: false,
    requiresDBE: true,
    dreiArticle: 'IN RFB 2.119/2022',
    defaultClauseSnippet: 'A sociedade adota a título de estabelecimento o Nome Fantasia [NOME_FANTASIA].'
  },
  {
    code: '211',
    category: 'cadastral',
    name: 'Alteração de Endereço no Mesmo Município',
    description: 'Mudança de sede social dentro da mesma jurisdição municipal.',
    applicableTypes: ['SLU', 'LTDA', 'SA', 'EI', 'SOCIEDADE_SIMPLES'],
    requiresViabilidade: true,
    requiresDBE: true,
    dreiArticle: 'Art. 997, II do Código Civil',
    defaultClauseSnippet: 'A sociedade transfere sua sede social para [NOVO_ENDERECO_COMPLETO].'
  },
  {
    code: '209',
    category: 'cadastral',
    name: 'Alteração de Endereço Entre Estados / Municípios Distintos',
    description: 'Transferência de sede interestadual ou intermunicipal, exigindo registro na Junta de origem e destino.',
    applicableTypes: ['SLU', 'LTDA', 'SA', 'EI'],
    requiresViabilidade: true,
    requiresDBE: true,
    dreiArticle: 'Art. 53 da IN DREI 81/2020',
    defaultClauseSnippet: 'A sociedade transfere sua sede do Estado de [UF_ORIGEM] para o Estado de [UF_DESTINO], fixando foro em [CIDADE_DESTINO].'
  },
  {
    code: '244',
    category: 'cadastral',
    name: 'Alteração de Atividade Econômica (CNAE Principal e Secundários)',
    description: 'Ampliação, substituição ou restrição do objeto social e códigos CNAE da empresa.',
    applicableTypes: ['SLU', 'LTDA', 'SA', 'EI', 'SOCIEDADE_SIMPLES'],
    requiresViabilidade: true,
    requiresDBE: true,
    dreiArticle: 'Art. 997, II do CC e Anexo IV IN DREI 81/2020',
    defaultClauseSnippet: 'O Objeto Social da sociedade passa a ser a exploração das seguintes atividades: [DESCRICAO_ATIVIDADES_CNAES].'
  },
  {
    code: '214',
    category: 'cadastral',
    name: 'Alteração de E-mail / Telefone / Contato Cadastral',
    description: 'Atualização dos dados de contato perante o CNPJ e Domicílio Tributário Eletrônico (DTE).',
    applicableTypes: ['SLU', 'LTDA', 'SA', 'EI', 'SOCIEDADE_SIMPLES'],
    requiresViabilidade: false,
    requiresDBE: true,
    dreiArticle: 'IN RFB 2.119/2022',
    defaultClauseSnippet: 'Ficam atualizados os dados de contato da sociedade: E-mail [EMAIL] e Telefone [TELEFONE].'
  },
  {
    code: '218',
    category: 'cadastral',
    name: 'Alteração da Forma de Atuação',
    description: 'Definição das formas de estabelecimento (sede física, internet, televendas, porta a porta, quiosque).',
    applicableTypes: ['SLU', 'LTDA', 'SA', 'EI'],
    requiresViabilidade: true,
    requiresDBE: true,
    dreiArticle: 'Tabela de Formas de Atuação REDESIM/RFB',
    defaultClauseSnippet: 'A sociedade exercerá suas atividades prioritariamente através de [FORMA_ATUACAO].'
  },
  {
    code: '222',
    category: 'cadastral',
    name: 'Enquadramento / Reenquadramento / Desenquadramento de ME ou EPP',
    description: 'Declaração formal de enquadramento ou desenquadramento nos termos da Lei Complementar nº 123/2006.',
    applicableTypes: ['SLU', 'LTDA', 'EI', 'SOCIEDADE_SIMPLES'],
    requiresViabilidade: false,
    requiresDBE: true,
    dreiArticle: 'Lei Complementar 123/2006 e IN DREI 81/2020',
    defaultClauseSnippet: 'Os sócios declaram que a sociedade se enquadra na condição de [PORTE: ME / EPP], não incorrendo em quaisquer das vedações do Art. 3º, § 4º da LC 123/2006.'
  },

  // CAPITAL SOCIAL
  {
    code: '247',
    category: 'capital',
    name: 'Alteração de Capital Social (Aumento ou Redução)',
    description: 'Subscrição e integralização de novo capital (em dinheiro, imóveis ou lucros) ou redução por excesso/perdas.',
    applicableTypes: ['SLU', 'LTDA', 'SA', 'EI', 'SOCIEDADE_SIMPLES'],
    requiresViabilidade: false,
    requiresDBE: true,
    dreiArticle: 'Arts. 1.081 a 1.084 CC e Art. 64 Lei 8.934/94',
    defaultClauseSnippet: 'O capital social é aumentado de R$ [CAPITAL_ANTERIOR] para R$ [NOVO_CAPITAL], mediante [FORMA_INTEGRALIZACAO].'
  },

  // QUADRO SOCIETÁRIO E ADMINISTRAÇÃO
  {
    code: '248',
    category: 'quadro_societario',
    name: 'Alteração do Quadro de Sócios (QSA - Entrada, Saída, Cessão de Quotas)',
    description: 'Admissão de novos sócios, retirada de sócio, exclusão, cessão gratuita ou onerosa de quotas sociais.',
    applicableTypes: ['LTDA', 'SLU', 'SOCIEDADE_SIMPLES'],
    requiresViabilidade: false,
    requiresDBE: true,
    dreiArticle: 'Arts. 1.003, 1.057 e 1.085 do Código Civil',
    defaultClauseSnippet: 'O sócio cedente transfere a totalidade de suas quotas ao cessionário pelo valor de R$ [VALOR], dando plena e irrevogável quitação.'
  },
  {
    code: '249',
    category: 'quadro_societario',
    name: 'Alteração de Administrador / Diretor / Representante Legal',
    description: 'Nomeação, destituição, renúncia ou prorrogação de mandato de administrador sócio ou não-sócio.',
    applicableTypes: ['SLU', 'LTDA', 'SA', 'SOCIEDADE_SIMPLES'],
    requiresViabilidade: false,
    requiresDBE: true,
    dreiArticle: 'Arts. 1.011, 1.018 e 1.060 a 1.063 do Código Civil',
    defaultClauseSnippet: 'A administração da sociedade passa a ser exercida com exclusividade pelo administrador [NOME_ADMINISTRADOR], que declara sob as penas da lei o desimpedimento para o cargo.'
  },
  {
    code: '202',
    category: 'quadro_societario',
    name: 'Alteração da Pessoa Física Responsável perante o CNPJ',
    description: 'Mudança do responsável legal perante a base cadastral da Secretaria Especial da Receita Federal do Brasil.',
    applicableTypes: ['SLU', 'LTDA', 'SA', 'EI', 'SOCIEDADE_SIMPLES'],
    requiresViabilidade: false,
    requiresDBE: true,
    dreiArticle: 'IN RFB 2.119/2022',
    defaultClauseSnippet: 'Fica designado como responsável pela sociedade perante a Receita Federal do Brasil o sócio/administrador [NOME_RESPONSAVEL], CPF [CPF].'
  },

  // TRANSFORMAÇÃO DE TIPO JURÍDICO
  {
    code: '225',
    category: 'transformacao',
    name: 'Alteração da Natureza Jurídica (Transformação Societária)',
    description: 'Transformação de Sociedade Limitada (LTDA) em Sociedade Anônima (S/A), SLU em LTDA, Empresário Individual em LTDA ou vice-versa, sem dissolução.',
    applicableTypes: ['SLU', 'LTDA', 'SA', 'EI', 'SOCIEDADE_SIMPLES'],
    requiresViabilidade: true,
    requiresDBE: true,
    dreiArticle: 'Arts. 1.113 a 1.115 do Código Civil e Art. 66 IN DREI 81/2020',
    defaultClauseSnippet: 'A sociedade delibera a sua TRANSFORMAÇÃO do tipo societário [TIPO_ORIGEM] para [TIPO_DESTINO], sem solução de continuidade dos negócios sociais.'
  },

  // REORGANIZAÇÃO SOCIETÁRIA (M&A)
  {
    code: '311',
    category: 'reorganizacao',
    name: 'Incorporação de Sociedade',
    description: 'Operação pela qual uma ou mais sociedades são absorvidas por outra, que lhes sucede em todos os direitos e obrigações.',
    applicableTypes: ['LTDA', 'SA'],
    requiresViabilidade: false,
    requiresDBE: true,
    dreiArticle: 'Arts. 1.116 a 1.118 CC e Lei 6.404/76',
    defaultClauseSnippet: 'Aprovação do Laudo Pericial de Avaliação Patrimonial e do Protocolo e Justificação de Incorporação da sociedade [EMPRESA_INCORPORADA].'
  },
  {
    code: '313',
    category: 'reorganizacao',
    name: 'Cisão Parcial de Sociedade',
    description: 'Transferência de parcela do patrimônio social para uma ou mais sociedades constituídas para esse fim ou já existentes.',
    applicableTypes: ['LTDA', 'SA'],
    requiresViabilidade: false,
    requiresDBE: true,
    dreiArticle: 'Arts. 1.116 a 1.122 CC e Art. 229 da Lei 6.404/76',
    defaultClauseSnippet: 'Deliberação de Cisão Parcial da sociedade com versão da parcela patrimonial correspondente a [DESCRICAO_ATIVO] para a sociedade receptora.'
  },

  // ENCERRAMENTO / BAIXA / DISTRATO
  {
    code: '401',
    category: 'encerramento',
    name: 'Baixa / Encerramento de Filial',
    description: 'Encerramento de atividades de filial registrada, mantendo ativa a matriz.',
    applicableTypes: ['SLU', 'LTDA', 'SA'],
    requiresViabilidade: false,
    requiresDBE: true,
    dreiArticle: 'IN DREI 81/2020',
    defaultClauseSnippet: 'Os sócios deliberam o encerramento definitivo das atividades da filial situada em [ENDERECO_FILIAL].'
  },
  {
    code: '517',
    category: 'encerramento',
    name: 'Extinção por Encerramento de Liquidação Voluntária (Distrato Social)',
    description: 'Dissolução total, liquidação de ativos e passivos, partilha de haveres e extinção formal da pessoa jurídica.',
    applicableTypes: ['SLU', 'LTDA', 'EI', 'SOCIEDADE_SIMPLES', 'SCP'],
    requiresViabilidade: false,
    requiresDBE: true,
    dreiArticle: 'Arts. 1.033 a 1.035 e 1.102 a 1.112 CC e LC 147/2014',
    defaultClauseSnippet: 'DISTRATO SOCIAL: Os sócios dão por dissolvida e extinta a sociedade, com quitação geral, irrevogável e mútua de todas as obrigações sociais.'
  }
];

// Interface para Geração do Instrumento Customizado
export interface GenerateContractParams {
  mode: 'abertura' | 'alteracao' | 'transformacao' | 'acordo_socios' | 'distrato' | 'mutuo_conversivel' | 'holding_imoveis' | 'scp';
  naturezaJuridica: 'SLU' | 'LTDA' | 'SA' | 'EI' | 'SOCIEDADE_SIMPLES' | 'SCP';
  nomeEmpresarial: string;
  nomeFantasia?: string;
  nire?: string;
  cnpj?: string;
  cidade: string;
  uf: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cep: string;
  telefone?: string;
  email?: string;
  cnaePrincipal: string;
  cnaePrincipalDesc: string;
  cnaesSecundarios?: Array<{ code: string; desc: string }>;
  capitalSocial: number;
  capitalSocialAnterior?: number;
  valorNominalCota: number;
  formaIntegralizacao?: string;
  partners: Array<{
    id: string;
    name: string;
    nationality: string;
    maritalStatus: string;
    propertyRegime?: string;
    spouseName?: string;
    profession: string;
    rg: string;
    rgIssuer: string;
    cpf: string;
    address: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    uf: string;
    cep: string;
    quotasCount: number;
    quotasValue: number;
    isAdministrator: boolean;
    isAdmitted?: boolean;
    isRetiring?: boolean;
  }>;
  selectedRedesimEvents: string[]; // Ex: ['210', '211', '244', '247', '248', '249']
  
  // Parâmetros Específicos para Alterações / Eventos
  alteracaoDetails?: {
    numeroAlteracao?: number;
    novoNomeEmpresarial?: string;
    novoEndereco?: { logradouro: string; numero: string; complemento?: string; bairro: string; cidade: string; uf: string; cep: string };
    novasAtividades?: string;
    formaAumentoCapital?: 'moeda' | 'lucros' | 'imoveis' | 'credito';
    detalhesImoveisIntegralizacao?: string;
    cessaoQuotasInfo?: Array<{ cedente: string; cessionario: string; quantidade: number; valor: number }>;
    socioLiquidante?: string;
    guardaLivrosSocio?: string;
    tipoOrigemTransformacao?: string;
    tipoDestinoTransformacao?: string;
  };

  // Cláusulas Estratégicas de Blindagem Forense
  clauses: {
    consolidacaoDrei: boolean;
    apuracaoHaveresSTJ: boolean; // Balanço de determinação conforme REsp 1.877.331
    autonomiaPatrimonialArt50: boolean;
    direitoPreferenciaTagAlong: boolean;
    deadlockShotgun: boolean;
    distribuicaoDesproporcional: boolean;
    arbitragemCamara: boolean;
    naoConcorrencia: boolean;
    imunidadeITBIImoveis: boolean; // Tema 796 STF
    assinaturaDigitalICP: boolean; // Art. 784, § 4º CPC
    gravamesSucessivos: boolean; // Art. 1.911 CC
    conselhoConsultivo: boolean;
  };

  customClauses?: string;
}

// Formatador Numérico por Extenso Simples para Capital Social
function numberToWordsPtBr(num: number): string {
  if (num <= 0) return 'zero reais';
  const units = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const teens = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const tens = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const hundreds = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

  // Para montantes habituais de contratos
  if (num === 1000) return 'um mil reais';
  if (num === 10000) return 'dez mil reais';
  if (num === 50000) return 'cinquenta mil reais';
  if (num === 100000) return 'cem mil reais';
  if (num === 500000) return 'quinhentos mil reais';
  if (num === 1000000) return 'um milhão de reais';
  if (num === 2000000) return 'dois milhões de reais';
  if (num === 5000000) return 'cinco milhões de reais';
  if (num === 10000000) return 'dez milhões de reais';

  return `R$ ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} reais`;
}

// =====================================================================================
// GERADOR CENTRAL DE INSTRUMENTOS SOCIETÁRIOS COMPLETOS (PADRÃO OURO DREI / JUCE)
// =====================================================================================

export function generateComprehensiveCorporateContract(params: GenerateContractParams): string {
  const {
    mode,
    naturezaJuridica,
    nomeEmpresarial,
    nomeFantasia,
    nire = '00.0.0000000-0',
    cnpj = '00.000.000/0001-00',
    cidade,
    uf,
    logradouro,
    numero,
    complemento,
    bairro,
    cep,
    cnaePrincipal,
    cnaePrincipalDesc,
    cnaesSecundarios = [],
    capitalSocial,
    capitalSocialAnterior = capitalSocial,
    valorNominalCota = 1,
    formaIntegralizacao = 'em moeda corrente nacional',
    partners,
    selectedRedesimEvents,
    alteracaoDetails = {},
    clauses,
    customClauses
  } = params;

  const effName = (nomeEmpresarial.trim() || 'EMPRESA EM CONSTITUIÇÃO').toUpperCase();
  const effCity = cidade.trim() || 'São Paulo';
  const effUf = uf.trim() || 'SP';
  const effAddr = `${logradouro}, nº ${numero}${complemento ? `, ${complemento}` : ''}, Bairro ${bairro}, CEP ${cep}, em ${effCity}/${effUf}`;
  const totalQuotas = partners.reduce((sum, p) => sum + (Number(p.quotasCount) || 0), 0) || 10000;
  const numAlteracao = alteracaoDetails.numeroAlteracao || 1;
  const dateFormatted = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

  let text = '';

  // -----------------------------------------------------------------------------------
  // 1. TÍTULO DO INSTRUMENTO
  // -----------------------------------------------------------------------------------
  if (mode === 'abertura') {
    if (naturezaJuridica === 'SLU' || partners.length === 1) {
      text += `INSTRUMENTO PARTICULAR DE CONSTITUIÇÃO DE SOCIEDADE LIMITADA UNIPESSOAL\n`;
      text += `DENOMINAÇÃO SOCIAL: ${effName} LTDA\n\n`;
    } else if (naturezaJuridica === 'SCP') {
      text += `INSTRUMENTO PARTICULAR DE CONSTITUIÇÃO DE SOCIEDADE EM CONTA DE PARTICIPAÇÃO (SCP)\n`;
      text += `SÓCIO OSTENSIVO: ${effName}\n\n`;
    } else {
      text += `CONTRATO SOCIAL DE CONSTITUIÇÃO DE SOCIEDADE LIMITADA\n`;
      text += `DENOMINAÇÃO SOCIAL: ${effName} LTDA\n\n`;
    }
  } else if (mode === 'alteracao') {
    const eventosLabel = selectedRedesimEvents.length > 0 
      ? `(EVENTOS REDESIM/DREI: ${selectedRedesimEvents.map(e => `EV.${e}`).join(', ')})` 
      : '';
    text += `${numAlteracao}ª ALTERAÇÃO DO CONTRATO SOCIAL E CONSOLIDAÇÃO DOS ESTATUTOS ${eventosLabel}\n`;
    text += `DA SOCIEDADE: ${effName}\n`;
    text += `NIRE: ${nire} | CNPJ/MF: ${cnpj}\n\n`;
  } else if (mode === 'transformacao') {
    text += `INSTRUMENTO PARTICULAR DE TRANSFORMAÇÃO DE TIPO SOCIETÁRIO E CONSOLIDAÇÃO CONTRATUAL\n`;
    text += `DE [${alteracaoDetails.tipoOrigemTransformacao || 'EMPRESÁRIO INDIVIDUAL'}] PARA [${alteracaoDetails.tipoDestinoTransformacao || 'SOCIEDADE LIMITADA'}]\n`;
    text += `DA SOCIEDADE: ${effName}\n`;
    text += `NIRE: ${nire} | CNPJ/MF: ${cnpj}\n\n`;
  } else if (mode === 'acordo_socios') {
    text += `ACORDO DE SÓCIOS / QUOTISTAS E PROTOCOLO DE GOVERNANÇA CORPORATIVA VINCULANTE\n`;
    text += `(FIRMADO COM BASE NO ARTIGO 1.053 DO CÓDIGO CIVIL E ARTIGO 118 DA LEI Nº 6.404/76)\n`;
    text += `DA SOCIEDADE: ${effName}\n\n`;
  } else if (mode === 'mutuo_conversivel') {
    text += `INSTRUMENTO PARTICULAR DE MÚTUO CONVERSÍVEL EM PARTICIPAÇÃO SOCIETÁRIA (EQUITY)\n`;
    text += `DA SOCIEDADE EMISSORA: ${effName}\n\n`;
  } else if (mode === 'distrato') {
    text += `DISTRATO SOCIAL - INSTRUMENTO PARTICULAR DE DISSOLUÇÃO TOTAL E EXTINÇÃO DE SOCIEDADE\n`;
    text += `(COM FULCRO NOS ARTIGOS 1.033 A 1.035 DO CÓDIGO CIVIL E LEI COMPLEMENTAR Nº 147/2014)\n`;
    text += `DA SOCIEDADE: ${effName}\n`;
    text += `NIRE: ${nire} | CNPJ/MF: ${cnpj}\n\n`;
  }

  // -----------------------------------------------------------------------------------
  // 2. PREÂMBULO - QUALIFICAÇÃO MINUCIOSA DOS INTEGRANTES
  // -----------------------------------------------------------------------------------
  text += `PREÂMBULO - QUALIFICAÇÃO INTEGRAL DOS SÓCIOS / ACIONISTAS:\n\n`;

  partners.forEach((p, idx) => {
    const pName = (p.name || `Sócio ${idx + 1}`).toUpperCase();
    const pNat = p.nationality || 'brasileiro(a)';
    const pMarital = p.maritalStatus || 'solteiro(a)';
    const pRegime = p.propertyRegime ? ` sob o regime de ${p.propertyRegime}` : '';
    const pSpouse = p.spouseName ? `, com anuência expressa de seu cônjuge ${p.spouseName}` : '';
    const pProf = p.profession || 'Empresário(a)';
    const pRg = p.rg || '00.000.000-0';
    const pIssuer = p.rgIssuer || 'SSP/SP';
    const pCpf = p.cpf || '000.000.000-00';
    const pAddr = `${p.address}, nº ${p.number}${p.complement ? `, ${p.complement}` : ''}, Bairro ${p.neighborhood}, CEP ${p.cep}, na cidade de ${p.city}/${p.uf}`;

    const statusExtra = p.isRetiring ? ' (SÓCIO RETIRANTE)' : p.isAdmitted ? ' (NOVO SÓCIO ADMITIDO)' : '';

    text += `${idx + 1}. ${pName}${statusExtra}, ${pNat}, ${pMarital}${pRegime}${pSpouse}, ${pProf}, portador(a) da Cédula de Identidade RG nº ${pRg} expedida por ${pIssuer}, inscrito(a) no CPF/MF sob o nº ${pCpf}, domiciliado(a) e residente na ${pAddr};\n\n`;
  });

  // -----------------------------------------------------------------------------------
  // 3. CORPO PRINCIPAL CONFORME A MODALIDADE
  // -----------------------------------------------------------------------------------
  if (mode === 'abertura') {
    text += `Os qualificados acima têm entre si justo e avençado constituir uma Sociedade Empresária Limitada, que se regerá pelas disposições do Código Civil Brasileiro (Lei Federal nº 10.406/2002), pelas Instruções Normativas do Departamento Nacional de Registro Empresarial e Integração - DREI (IN nº 81/2020) e supletivamente pelas normas da Lei das Sociedades por Ações (Lei nº 6.404/1976), mediante as seguintes cláusulas:\n\n`;

    text += `CAPÍTULO I - DA DENOMINAÇÃO, SEDE, FORO E PRAZO DE DURAÇÃO\n\n`;
    text += `CLÁUSULA PRIMEIRA (Denominação e Nome Fantasia): A sociedade girará sob a denominação social de "${effName} LTDA"${nomeFantasia ? `, adotando o nome a título de estabelecimento (Nome Fantasia) "${nomeFantasia.toUpperCase()}"` : ''}.\n\n`;
    text += `CLÁUSULA SEGUNDA (Sede e Filiais): A sociedade tem sua sede e domicílio estabelecidos na ${effAddr}. Por deliberação da administração, observadas as disposições legais, a sociedade poderá abrir, transferir ou encerrar filiais, agências, depósitos ou escritórios em qualquer ponto do território nacional ou no exterior (Art. 1.000 do Código Civil).\n\n`;
    text += `CLÁUSULA TERCEIRA (Prazo de Duração): O prazo de duração da sociedade é indeterminado, tendo iniciado suas atividades na data do arquivamento deste ato perante a Junta Comercial competente.\n\n`;

    text += `CAPÍTULO II - DO OBJETO SOCIAL E ATIVIDADES ECONÔMICAS\n\n`;
    text += `CLÁUSULA QUARTA (Objeto Social): A sociedade tem por objeto social e atividade preponderante:\n`;
    text += `a) Atividade Principal (CNAE ${cnaePrincipal}): ${cnaePrincipalDesc};\n`;
    if (cnaesSecundarios.length > 0) {
      cnaesSecundarios.forEach((sec, sIdx) => {
        text += `b.${sIdx + 1}) Atividade Secundária (CNAE ${sec.code}): ${sec.desc};\n`;
      });
    }
    text += `\n`;

    text += `CAPÍTULO III - DO CAPITAL SOCIAL, DAS QUOTAS E DA SUBSCRIÇÃO\n\n`;
    text += `CLÁUSULA QUINTA (Capital Social): O capital social, totalmente subscrito pelos sócios, é de R$ ${capitalSocial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${numberToWordsPtBr(capitalSocial)}), dividido em ${totalQuotas.toLocaleString('pt-BR')} quotas de valor nominal de R$ ${(valorNominalCota || 1).toFixed(2)} cada uma, distribuídas entre os sócios na seguinte proporção:\n\n`;

    partners.forEach((p) => {
      const pQuotas = Number(p.quotasCount) || 0;
      const pVal = pQuotas * (valorNominalCota || 1);
      const pct = totalQuotas > 0 ? ((pQuotas / totalQuotas) * 100).toFixed(2) : '0';
      text += `- Sócio(a) ${(p.name || 'Sócio').toUpperCase()}: ${pQuotas.toLocaleString('pt-BR')} quotas, no valor total de R$ ${pVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}, correspondente a ${pct}% do capital social;\n`;
    });

    text += `\nCLÁUSULA SEXTA (Forma de Integralização): O capital social ora subscrito é integralizado ${formaIntegralizacao}.\n`;
    text += `Parágrafo Primeiro: A responsabilidade de cada sócio é restrita ao valor de suas quotas, mas todos respondem solidariamente pela integralização do capital social, com fulcro no Artigo 1.052 do Código Civil Brasileiro.\n\n`;

    text += `CAPÍTULO IV - DA ADMINISTRAÇÃO E REPRESENTAÇÃO SOCIAL\n\n`;
    const admins = partners.filter(p => p.isAdministrator);
    if (admins.length > 0) {
      text += `CLÁUSULA SÉTIMA (Nomeação de Administradores): A administração e gerência da sociedade, bem como o uso da denominação social, caberá ao(s) administrador(es) ${admins.map(a => (a.name || 'Sócio').toUpperCase()).join(', ')}, com poderes gerais e especiais de gestão, representação ativa e passiva em juízo ou fora dele perante repartições públicas, instituições financeiras e terceiros.\n`;
    } else {
      text += `CLÁUSULA SÉTIMA (Administração Conjunta): A administração da sociedade será exercida por todos os sócios em conjunto.\n`;
    }
    text += `Parágrafo Primeiro: É expressamente vedado aos administradores o uso do nome empresarial em negócios estranhos ao objeto social, tais como fianças, avais, endossos de favor ou quaisquer garantias em benefício de terceiros, sob pena de nulidade do ato e responsabilização pessoal do infrator perante a sociedade e demais sócios (Art. 1.015 do Código Civil).\n`;
    text += `Parágrafo Segundo (Desimpedimento Legal): O(s) administrador(es) declara(m), sob as penas da lei, que não está(ão) incurso(s) em nenhum dos crimes previstos em lei que o(s) impeça(m) de exercer a atividade mercantil ou mercantil-financeira, em especial no Artigo 1.011, § 1º do Código Civil Brasileiro.\n\n`;

  } else if (mode === 'alteracao') {
    text += `Únicos sócios e componentes da sociedade empresária limitada acima identificada, deliberam e ajustam formalizar a presente ${numAlteracao}ª Alteração Contratual mediante as seguintes deliberações e cláusulas resolutivas motivadas pelos eventos REDESIM selecionados:\n\n`;

    text += `PARTE I - DAS DELIBERAÇÕES ESPECÍFICAS (EVENTOS REGISTRAIS REDESIM):\n\n`;

    // GERAÇÃO ESPECÍFICA PARA CADA EVENTO REDESIM
    selectedRedesimEvents.forEach((evCode) => {
      const evDef = REDESIM_EVENTS_CATALOG.find(e => e.code === evCode);
      const evTitle = evDef ? evDef.name : `Evento ${evCode}`;

      text += `---------------------------------------------------------------------------------\n`;
      text += `DELIBERAÇÃO REFERENTE AO EVENTO ${evCode} - ${evTitle.toUpperCase()}:\n`;
      text += `---------------------------------------------------------------------------------\n`;

      if (evCode === '210') {
        const novoNome = alteracaoDetails.novoNomeEmpresarial || effName;
        text += `1. Os sócios deliberam por unanimidade a alteração do Nome Empresarial da sociedade, que deixa de ser "${effName}" e passa a denominar-se expressamente "${novoNome.toUpperCase()} LTDA".\n\n`;
      } else if (evCode === '220') {
        text += `2. A sociedade passa a adotar a título de estabelecimento (Nome Fantasia) a expressão "${(nomeFantasia || 'VÉRTICE DIGITAL').toUpperCase()}".\n\n`;
      } else if (evCode === '211' || evCode === '209') {
        const novoEnd = alteracaoDetails.novoEndereco 
          ? `${alteracaoDetails.novoEndereco.logradouro}, nº ${alteracaoDetails.novoEndereco.numero}${alteracaoDetails.novoEndereco.complemento ? `, ${alteracaoDetails.novoEndereco.complemento}` : ''}, Bairro ${alteracaoDetails.novoEndereco.bairro}, CEP ${alteracaoDetails.novoEndereco.cep}, em ${alteracaoDetails.novoEndereco.cidade}/${alteracaoDetails.novoEndereco.uf}`
          : effAddr;
        text += `3. Fica aprovada a transferência da sede social da empresa para o seguinte endereço: ${novoEnd}, fixando-se neste novo local o foro de eleição e domicílio contratual para todos os fins de direito.\n\n`;
      } else if (evCode === '244') {
        text += `4. Fica alterado e ampliado o objeto social da sociedade para a exploração das seguintes atividades econômicas:\n`;
        text += `   - CNAE Principal (${cnaePrincipal}): ${cnaePrincipalDesc};\n`;
        if (cnaesSecundarios.length > 0) {
          cnaesSecundarios.forEach((sec, idx) => {
            text += `   - CNAE Secundário ${idx + 1} (${sec.code}): ${sec.desc};\n`;
          });
        }
        text += `\n`;
      } else if (evCode === '247') {
        const capAnt = capitalSocialAnterior || capitalSocial;
        text += `5. Os sócios deliberam aumentar o capital social de R$ ${capAnt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para R$ ${capitalSocial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${numberToWordsPtBr(capitalSocial)}), dividido em ${totalQuotas.toLocaleString('pt-BR')} quotas no valor nominal de R$ ${(valorNominalCota || 1).toFixed(2)} cada uma.\n`;
        text += `   Forma e Origem da Integralização: ${alteracaoDetails.formaAumentoCapital === 'imoveis' ? `Mediante conferência e integralização de bens imóveis (Art. 64 Lei 8.934/94 e Tema 796 STF), conforme discriminado a seguir: ${alteracaoDetails.detalhesImoveisIntegralizacao || 'Matrícula nº 123.456 do Cartório de Registro de Imóveis competente'}` : formaIntegralizacao}.\n\n`;
      } else if (evCode === '248') {
        text += `6. CESSÃO, TRANSFERÊNCIA DE QUOTAS E REESTRUTURAÇÃO DO QUADRO SOCIETÁRIO (QSA):\n`;
        const retirantes = partners.filter(p => p.isRetiring);
        const admitidos = partners.filter(p => p.isAdmitted);

        if (retirantes.length > 0) {
          retirantes.forEach(ret => {
            text += `   a) O(a) sócio(a) ${(ret.name).toUpperCase()} retira-se voluntariamente do quadro societário da empresa, cedendo e transferindo a totalidade de suas ${ret.quotasCount} quotas aos sócios remanescentes/admitidos, recebendo neste ato o valor correspondente a seus haveres, dando plena, geral, rasa e irrevogável quitação de quaisquer direitos ou créditos presentes ou futuros em face da sociedade (Art. 1.003 e 1.057 CC);\n`;
          });
        }
        if (admitidos.length > 0) {
          admitidos.forEach(adm => {
            text += `   b) É admitido(a) na sociedade o(a) sócio(a) ${(adm.name).toUpperCase()}, aceitando expressamente todos os termos, direitos e obrigações previstos no contrato social e em suas alterações.\n`;
          });
        }
        text += `\n`;
      } else if (evCode === '249' || evCode === '202') {
        const admins = partners.filter(p => p.isAdministrator);
        text += `7. A administração da sociedade é redefinida e passa a ser exercida com exclusividade por: ${admins.map(a => (a.name).toUpperCase()).join(', ')}, com plenos poderes de representação legal e assinatura individual isolada, sendo designado como representante responsável perante a Receita Federal do Brasil (CNPJ) o(a) administrador(a) ${(admins[0]?.name || partners[0]?.name || 'Sócio').toUpperCase()}.\n\n`;
      } else if (evCode === '222') {
        text += `8. ENQUADRAMENTO / DESENQUADRAMENTO DE PORTE: Os sócios declaram expressamente que a receita bruta anual da sociedade atende aos parâmetros fixados pela Lei Complementar nº 123/2006, solicitando a manutenção/enquadramento do porte empresarial perante os órgãos de registro.\n\n`;
      }
    });

    if (clauses.consolidacaoDrei) {
      text += `\n=================================================================================\n`;
      text += `PARTE II - CONSOLIDAÇÃO INTEGRAL DO CONTRATO SOCIAL (IN DREI 81/2020)\n`;
      text += `=================================================================================\n\n`;
      text += `Em decorrência das alterações deliberadas, os sócios consolidam o Contrato Social em vigor, que passa a vigorar com a seguinte redação definitiva:\n\n`;
      
      text += `CLÁUSULA CONSOLIDADA PRIMEIRA (Denominação, Sede e Foro): A sociedade gira sob a denominação social de "${effName} LTDA", com sede e domicílio na ${effAddr}, fixando o foro da Comarca de ${effCity}/${effUf} para dirimir quaisquer dúvidas oriundas deste contrato social.\n\n`;
      text += `CLÁUSULA CONSOLIDADA SEGUNDA (Objeto Social): A sociedade tem por objeto social a exploração das seguintes atividades econômicas:\n`;
      text += `a) Atividade Principal (CNAE ${cnaePrincipal}): ${cnaePrincipalDesc};\n`;
      if (cnaesSecundarios.length > 0) {
        cnaesSecundarios.forEach((sec, sIdx) => {
          text += `b.${sIdx + 1}) Atividade Secundária (CNAE ${sec.code}): ${sec.desc};\n`;
        });
      }
      text += `\n`;
      text += `CLÁUSULA CONSOLIDADA TERCEIRA (Capital Social e Quotas): O capital social consolidado é de R$ ${capitalSocial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${numberToWordsPtBr(capitalSocial)}), dividido em ${totalQuotas.toLocaleString('pt-BR')} quotas de R$ ${(valorNominalCota || 1).toFixed(2)} cada, integralizadas em moeda corrente nacional e distribuídas entre os sócios ativos:\n`;
      
      partners.filter(p => !p.isRetiring).forEach(p => {
        const qCount = Number(p.quotasCount) || 0;
        const qVal = qCount * (valorNominalCota || 1);
        const pPct = totalQuotas > 0 ? ((qCount / totalQuotas) * 100).toFixed(2) : '0';
        text += `- Sócio(a) ${(p.name).toUpperCase()}: ${qCount.toLocaleString('pt-BR')} quotas (R$ ${qVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}) - ${pPct}%;\n`;
      });
      text += `\n`;

      const activeAdmins = partners.filter(p => !p.isRetiring && p.isAdministrator);
      text += `CLÁUSULA CONSOLIDADA QUARTA (Administração): A administração da sociedade compete ao(s) administrador(es) ${activeAdmins.map(a => (a.name).toUpperCase()).join(', ')}, individualmente, vedado o uso da firma em operações alheias aos interesses sociais.\n\n`;
    }

  } else if (mode === 'distrato') {
    text += `Os sócios acima qualificados, únicos sócios da sociedade ${effName}, inscrita no CNPJ sob o nº ${cnpj} e com NIRE nº ${nire}, resolvem, por mútuo acordo e na melhor forma de direito, com fulcro nos Artigos 1.033 a 1.035 e 1.102 a 1.112 do Código Civil Brasileiro e Lei Complementar nº 147/2014, DISSOLVER E EXTINQUIR a sociedade mediante as seguintes cláusulas:\n\n`;

    text += `CLÁUSULA PRIMEIRA (Dissolucão e Liquidação): A sociedade encerra definitivamente todas as suas atividades operacionais nesta data, tendo procedido à liquidação integral de seu ativo e passivo, não restando nenhum saldo devedor perante terceiros, fornecedores ou instituições financeiras.\n\n`;
    text += `CLÁUSULA SEGUNDA (Inexistência de Passivo e Quitação): Os sócios declaram sob as penas da lei que a sociedade não possui débito pendente de natureza cível, trabalhista, previdenciária ou tributária. Nos termos do Art. 9º da Lei Complementar nº 123/2006 e LC 147/2014, os sócios assumem solidariamente e de forma ilimitada a responsabilidade por eventual passivo fiscal superveniente perante as Fazendas Públicas Federal, Estadual e Municipal.\n\n`;
    text += `CLÁUSULA TERCEIRA (Partilha do Acervo Remanescente): O capital social no valor de R$ ${capitalSocial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}, bem como o acervo patrimonial líquido remanescente, é partilhado e devolvido aos sócios na exata proporção de suas quotas, conferindo entre si mútua, plena, geral e irrevogável quitação.\n\n`;
    text += `CLÁUSULA QUARTA (Guarda dos Livros e Documentos Fiscais): Fica nomeado(a) como responsável pela guarda e custódia de todos os livros contábeis, documentos fiscais e arquivos digitais pelo prazo legal de 5 (cinco) anos o(a) sócio(a) ${(alteracaoDetails.guardaLivrosSocio || partners[0]?.name || 'Sócio Responsável').toUpperCase()}, CPF nº ${partners[0]?.cpf || '000.000.000-00'}, residente na ${partners[0]?.address || effAddr}.\n\n`;
  }

  // -----------------------------------------------------------------------------------
  // 4. CLÁUSULAS ESTRATÉGICAS DE BLINDAGEM FORENSE (INJEÇÃO TÉCNICA)
  // -----------------------------------------------------------------------------------
  text += `CLÁUSULAS ESPECIAIS DE GOVERNANÇA, SEGURANÇA JURÍDICA E PROTEÇÃO PATRIMONIAL:\n\n`;

  if (clauses.apuracaoHaveresSTJ) {
    text += `CLÁUSULA DE APURAÇÃO DE HAVERES POR BALANÇO DE DETERMINAÇÃO (STJ REsp 1.877.331/SP):\n`;
    text += `Em caso de falecimento, retirada voluntária, exclusão ou dissolução parcial da sociedade em relação a qualquer sócio, a apuração dos haveres será efetuada obrigatoriamente através de BALANÇO DE DETERMINAÇÃO elaborado na data-base da ocorrência do fato gerador, avaliando-se os ativos corpóreos e incorpóreos (intangíveis, fundo de comércio e goodwill) a valor de saída/mercado (fair market value). O pagamento do valor apurado aos herdeiros ou ao sócio retirante será realizado em 12 (doze) parcelas mensais e sucessivas, corrigidas pelo IPCA, vencendo-se a primeira 90 (noventa) dias após a homologação do balanço pericial, preservando a liquidez e a continuidade operacional da empresa.\n\n`;
  }

  if (clauses.autonomiaPatrimonialArt50) {
    text += `CLÁUSULA DE AUTONOMIA PATRIMONIAL E REQUISITOS DO ART. 50 DO CÓDIGO CIVIL (LEI 13.874/19):\n`;
    text += `Os bens e direitos da sociedade não se confundem, em qualquer hipótese, com os patrimônios particulares dos sócios ou administradores (Art. 49-A do CC). A eventual desconsideração da personalidade jurídica somente poderá ser decretada judicialmente mediante comprovação robusta e inequívoca de desvio de finalidade ou confusão patrimonial qualificada, nos termos expressos do Artigo 50 do Código Civil, sendo expressamente vedada a presunção de fraude ou responsabilização objetiva sem lastro fático.\n\n`;
  }

  if (clauses.gravamesSucessivos) {
    text += `CLÁUSULA DE INCOMUNICABILIDADE EXTENSIVA E GRAVAMES REAIS (ART. 1.911 E 1.660 CC):\n`;
    text += `As quotas sociais, bem como os direitos patrimoniais, lucros retidos, bonificações e dividendos futuros delas decorrentes, são gravados com a cláusula de INCOMUNICABILIDADE e IMPENHORABILIDADE, não se comunicando em nenhuma hipótese aos cônjuges ou companheiros dos sócios, qualquer que seja o regime matrimonial de bens adotado, inclusive no caso de união estável.\n\n`;
  }

  if (clauses.direitoPreferenciaTagAlong) {
    text += `CLÁUSULA DE DIREITO DE PREFERÊNCIA, TAG-ALONG E DRAG-ALONG (ART. 1.057 DO CÓDIGO CIVIL):\n`;
    text += `Nenhum sócio poderá alienar ou ceder suas quotas a terceiros sem prévio oferecimento aos demais sócios, que terão prazo improrrogável de 30 (trinta) dias para exercer o direito de preferência em igualdade de preço e condições. Em caso de alienação de controle societário a terceiro, fica assegurado aos sócios minoritários o direito de venda conjunta (Tag-Along) por 100% do preço ofertado por quota.\n\n`;
  }

  if (clauses.deadlockShotgun) {
    text += `CLÁUSULA DE SOLUÇÃO DE IMPASSE SOCIETÁRIO (DEADLOCK / BUY OR SELL - SHOTGUN):\n`;
    text += `Ocorrendo impasse insuperável em deliberação estratégica que paralise as atividades sociais por mais de 30 (trinta) dias, qualquer sócio poderá notificar o outro ofertando a compra da totalidade de suas quotas por determinado preço à vista. O sócio notificado terá o direito potestativo de: (i) vender suas quotas pelo preço ofertado, ou (ii) comprar a participação do sócio ofertante exatamente pelo mesmo valor por quota oferecido.\n\n`;
  }

  if (clauses.distribuicaoDesproporcional) {
    text += `CLÁUSULA DE DISTRIBUIÇÃO DESPROPORCIONAL DE LUCROS (ART. 1.007 DO CÓDIGO CIVIL):\n`;
    text += `Fica expressamente autorizada a deliberação e distribuição desproporcional de lucros, dividendos e juros sobre capital próprio entre os sócios, independentemente da proporção de suas quotas no capital social, desde que aprovada pela maioria dos votos em reunião de sócios e fundamentada em demonstrativo contábil idôneo.\n\n`;
  }

  if (clauses.imunidadeITBIImoveis) {
    text += `CLÁUSULA DE CONFERÊNCIA DE BENS IMÓVEIS E IMUNIDADE DE ITBI (TEMA 796 STF & ART. 64 LEI 8.934/94):\n`;
    text += `A integralização do capital social mediante a conferência de bens imóveis é realizada sob a égide do Art. 156, § 2º, I da Constituição Federal e Art. 36 do CTN, conferindo o presente contrato social eficácia de escritura pública e título hábil para averbação e transferência imobiliária direta perante o Cartório de Registro de Imóveis competente, com imunidade de ITBI sobre o valor integralizado, em observância ao precedente vinculante fixado pelo STF no Tema 796 (RE 796.376/SC).\n\n`;
  }

  if (clauses.naoConcorrencia) {
    text += `CLÁUSULA DE NÃO CONCORRÊNCIA E SIGILO (ART. 1.147 DO CÓDIGO CIVIL):\n`;
    text += `Os sócios e administradores obrigam-se a manter absoluto sigilo sobre dados operacionais e estratégicos da empresa e comprometem-se a não exercer, direta ou indiretamente (por si, familiares ou empresas interpostas), atividade concorrente com o objeto social pelo período de vigência da sociedade e por 2 (dois) anos após seu desligamento, sob pena de multa não compensatória correspondente a 10 (dez) vezes o valor de sua última remuneração anual.\n\n`;
  }

  if (clauses.arbitragemCamara) {
    text += `CLÁUSULA COMPROMISSÓRIA DE ARBITRAGEM (LEI Nº 9.307/1996 E LEI Nº 13.129/2015):\n`;
    text += `Quaisquer litígios, controvérsias ou dúvidas decorrentes deste contrato social ou com ele relacionados serão definitivamente resolvidos por Arbitragem, administrada pela Câmara de Mediação e Arbitragem de ${effCity}/${effUf}, consoante seu regulamento em vigor, renunciando as partes expressamente à jurisdição estatal comum, ressalvadas as medidas cautelares de urgência preparatórias.\n\n`;
  } else {
    text += `CLÁUSULA DE FORO DE ELEIÇÃO:\n`;
    text += `Fica eleito o Foro da Comarca de ${effCity}/${effUf} para dirimir quaisquer litígios oriundos do presente instrumento, com renúncia expressa a qualquer outro, por mais privilegiado que seja.\n\n`;
  }

  if (clauses.assinaturaDigitalICP) {
    text += `CLÁUSULA DE VALIDADE DE ASSINATURA ELETRÔNICA (ART. 784, § 4º CPC E MP 2.200-2/2001):\n`;
    text += `As partes declaram a plena validade, higidez jurídica, eficácia executiva e autenticidade da assinatura deste instrumento por meio eletrônico, mediante certificação digital no padrão ICP-Brasil ou através da plataforma Gov.br (níveis Prata/Ouro), nos termos da Medida Provisória nº 2.200-2/2001, Lei nº 14.063/2020 e Artigo 784, § 4º do Código de Processo Civil.\n\n`;
  }

  if (customClauses && customClauses.trim()) {
    text += `CLÁUSULAS ADICIONAIS CONVENCIONADAS PELAS PARTES:\n`;
    text += `${customClauses.trim()}\n\n`;
  }

  // -----------------------------------------------------------------------------------
  // 5. FECHAMENTO, DATAS E CAMPOS DE ASSINATURA
  // -----------------------------------------------------------------------------------
  text += `E, por estarem assim justos e contratados, lavram, aprovam e assinam o presente instrumento em vias de igual teor e forma para que produza seus regulares efeitos de direito perante a Junta Comercial competente e terceiros.\n\n`;
  text += `${effCity}/${effUf}, ${dateFormatted}.\n\n\n`;

  text += `ASSINATURAS DOS SÓCIOS / ADMINISTRADORES (Certificação Digital ICP-Brasil / Gov.br):\n\n`;
  partners.filter(p => !p.isRetiring).forEach((p) => {
    text += `_____________________________________________________________________\n`;
    text += `${(p.name).toUpperCase()}\n`;
    text += `CPF: ${p.cpf} | RG: ${p.rg} ${p.rgIssuer}\n`;
    if (p.isAdministrator) text += `(Administrador(a) Nomeado(a))\n`;
    text += `\n`;
  });

  const retiringPartners = partners.filter(p => p.isRetiring);
  if (retiringPartners.length > 0) {
    text += `ASSINATURA DOS SÓCIOS RETIRANTES / CEDENTES:\n\n`;
    retiringPartners.forEach((p) => {
      text += `_____________________________________________________________________\n`;
      text += `${(p.name).toUpperCase()} (SÓCIO RETIRANTE/CEDENTE)\n`;
      text += `CPF: ${p.cpf}\n\n`;
    });
  }

  text += `\nTESTEMUNHAS INSTRUMENTÁRIAS (ART. 784, III DO CPC):\n\n`;
  text += `1. _________________________________________    2. _________________________________________\n`;
  text += `   Nome:                                           Nome:\n`;
  text += `   CPF:                                            CPF:\n`;
  text += `   RG:                                             RG:\n`;

  return text;
}
