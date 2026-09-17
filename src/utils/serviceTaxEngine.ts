import { ServiceCodeTaxData } from '../types';
import { SERVICE_CODE_DATABASE } from '../data/serviceCodeDatabase';

export interface ServiceSimulationParams {
  grossAmount: number;
  operationType: 'interno' | 'exportacao'; // Serviço Interno x Exportação de Serviços
  
  // Prestador
  prestadorUf: string;
  prestadorCity: string;
  prestadorRegime: 'simples' | 'lucro_presumido' | 'lucro_real' | 'mei';
  
  // Tomador
  tomadorUf: string;
  tomadorCity: string;
  tomadorRegime: 'pj_privada' | 'orgao_publico_federal' | 'orgao_publico_estadual_municipal' | 'pf' | 'exterior';
  
  // Local da Prestação
  localExecucaoType: 'estabelecimento_prestador' | 'local_tomador_execucao';
  localUf: string;
  localCity: string;
  
  // Custom
  customIssRate?: number;
  hasCessaoMaoObra?: boolean;
}

export interface ServiceCalculationResult {
  grossAmount: number;
  operationType: 'interno' | 'exportacao';
  
  // ISSQN Municipal
  iss: {
    incidenceLocation: string;
    isIssDueAtLocalExecucao: boolean;
    rate: number;
    amount: number;
    isWithheld: boolean;
    collectorName: string;
    reason: string;
    cpomRiskNotice?: string;
    legalBasis: string;
  };
  
  // IRRF
  irrf: {
    isWithheld: boolean;
    rate: number;
    amount: number;
    darfCode: string;
    darfDescription: string;
    reason: string;
    legalBasis: string;
  };
  
  // CSRF (PIS 0.65% + COFINS 3% + CSLL 1% = 4.65%)
  csrf: {
    isWithheld: boolean;
    rate: number;
    amount: number;
    pisAmount: number;
    cofinsAmount: number;
    csllAmount: number;
    darfCode: string;
    darfDescription: string;
    reason: string;
    legalBasis: string;
  };
  
  // INSS Retenção
  inss: {
    isWithheld: boolean;
    rate: number;
    amount: number;
    recolhimentoCode: string;
    reason: string;
    legalBasis: string;
  };

  // Retenção Órgãos Públicos (IN RFB 1.234/2012)
  orgaosPublicos?: {
    isApplicable: boolean;
    totalRate: number;
    totalAmount: number;
    darfCode: string;
    reason: string;
    legalBasis: string;
  };

  // Resumo
  totalWithheld: number;
  netAmountReceived: number;
  effectiveWithholdingRate: number;
}

/**
 * MOTOR TRIBUTÁRIO DE SERVIÇOS, RETENÇÕES NA FONTE E CÓDIGOS DARF
 */
export function calculateServiceRetentionsAndTaxes(
  service: ServiceCodeTaxData,
  params: ServiceSimulationParams
): ServiceCalculationResult {
  const {
    grossAmount,
    operationType,
    prestadorUf,
    prestadorCity,
    prestadorRegime,
    tomadorUf,
    tomadorCity,
    tomadorRegime,
    localExecucaoType,
    localUf,
    localCity,
    customIssRate,
    hasCessaoMaoObra = false
  } = params;

  const isExport = operationType === 'exportacao' || tomadorRegime === 'exterior' || tomadorUf === 'EX';
  const isSimples = prestadorRegime === 'simples' || prestadorRegime === 'mei';
  const isPjTomador = tomadorRegime === 'pj_privada' || tomadorRegime === 'orgao_publico_federal' || tomadorRegime === 'orgao_publico_estadual_municipal';
  const isOrgaoPublicoFederal = tomadorRegime === 'orgao_publico_federal';

  // 1. CÁLCULO E REGRAS DO ISSQN MUNICIPAL
  let isIssDueAtLocalExecucao = false;
  let issIncidenceLocation = `Estabelecimento Prestador (${prestadorCity}/${prestadorUf})`;
  let issWithheld = false;
  let issCollector = 'Prestador (Recolhimento Próprio)';
  let issRate = customIssRate !== undefined ? customIssRate : service.issStandardRate;
  let issReason = '';
  let issLegalBasis = 'Art. 3º, caput da Lei Complementar nº 116/2003 (Regra Geral)';
  let cpomRiskNotice: string | undefined = undefined;

  if (isExport) {
    issRate = 0;
    issWithheld = false;
    issCollector = 'Isento (Exportação de Serviços)';
    issReason = 'Exportação de serviços para o exterior com resultado no exterior possui ISENÇÃO / IMUNIDADE DE ISS conforme Art. 2º, I da LC 116/2003 e Art. 156, § 3º, II da CF/88.';
    issLegalBasis = 'Art. 2º, inciso I da Lei Complementar nº 116/2003';
  } else {
    // Exceções do Art. 3º da LC 116/2003 (Incisos I a XXV)
    const localExcecoesLC116 = ['7.02', '7.04', '7.05', '7.09', '7.10', '7.11', '7.12', '7.16', '7.17', '7.18', '7.19', '11.01', '11.02', '11.04', '12.01', '16.01', '17.05', '17.10'];
    if (service.issIncidenceRule === 'local_prestacao' || localExcecoesLC116.includes(service.itemLC116) || localExecucaoType === 'local_tomador_execucao') {
      isIssDueAtLocalExecucao = true;
      issIncidenceLocation = `Local da Execução / Obra (${localCity}/${localUf})`;
      issLegalBasis = `Art. 3º, incisos da Lei Complementar nº 116/2003 (Exceção de local da prestação para o item ${service.itemLC116})`;

      if (isPjTomador && (prestadorCity.toLowerCase() !== localCity.toLowerCase() || prestadorUf !== localUf)) {
        issWithheld = true;
        issCollector = 'Tomador (Retenção na Fonte por ST Municipal)';
        issReason = `ISS retido na fonte pelo Tomador PJ no município de execução (${localCity}/${localUf}) conforme Art. 6º da LC 116/2003 e Código Tributário Municipal.`;
      } else {
        issReason = `ISS devido no local da prestação (${localCity}/${localUf}), devendo ser recolhido pelo prestador via guia DARE/DAM municipal.`;
      }
    } else {
      // Regra Geral (Caput do Art. 3º)
      if (prestadorCity.toLowerCase() !== tomadorCity.toLowerCase() && isPjTomador) {
        // Risco CPOM em capitais como SP, RJ, BH, Curitiba, Porto Alegre, Recife, Fortaleza
        const cpomCities = ['são paulo', 'rio de janeiro', 'belo horizonte', 'curitiba', 'porto alegre', 'recife', 'fortaleza', 'brasília'];
        if (cpomCities.includes(tomadorCity.toLowerCase())) {
          cpomRiskNotice = `Alerta CPOM/CEPOM: O município do Tomador (${tomadorCity}/${tomadorUf}) exige cadastro de prestadores de outros municípios. Se o Prestador (${prestadorCity}/${prestadorUf}) não estiver cadastrado no CPOM de ${tomadorCity}, haverá RETENÇÃO COMPULSÓRIA DE ISS pelo Tomador por falta de cadastro!`;
        }
      }
      issReason = `ISS devido na sede do prestador (${prestadorCity}/${prestadorUf}) conforme regra geral do Art. 3º caput da LC 116/2003.`;
    }
  }

  const issAmount = grossAmount * (issRate / 100);

  // 2. CÁLCULO E REGRAS DO IRRF (Art. 714 RIR/2018 / DARF 1708 / 8045 / 3208)
  let irrfWithheld = false;
  let irrfRate = service.federalWithholdings.irrfRate;
  let irrfDarfCode = service.darfCodes?.irrf || '1708';
  let irrfDarfDesc = 'IRRF - Serviços Profissionais Prestados por Pessoas Jurídicas (Art. 714 RIR/2018)';
  let irrfReason = '';
  let irrfLegalBasis = service.federalWithholdings.irrfLegalBase || 'Art. 714 do RIR/2018 (Decreto nº 9.580/2018)';

  if (isExport) {
    irrfRate = 0;
    irrfWithheld = false;
    irrfReason = 'Imunidade / Isenção de retenção de IRRF em exportação de serviços para tomador não residente no Brasil.';
  } else if (isSimples) {
    irrfRate = 0;
    irrfWithheld = false;
    irrfReason = 'DISPENSADO DE RETENÇÃO DE IRRF: Prestador optante pelo Simples Nacional (Art. 1º da Instrução Normativa RFB nº 765/2007).';
  } else if (!isPjTomador) {
    irrfRate = 0;
    irrfWithheld = false;
    irrfReason = 'Dispensado de retenção por se tratar de tomador Pessoa Física.';
  } else if (irrfRate > 0) {
    const calcIrrf = grossAmount * (irrfRate / 100);
    // Art. 724 RIR/2018: Dispensa de retenção <= R$ 10,00
    if (calcIrrf < 10.0) {
      irrfWithheld = false;
      irrfReason = `DISPENSADO DE RETENÇÃO: Valor apurado do IRRF (R$ ${calcIrrf.toFixed(2)}) é inferior ao limite mínimo de R$ 10,00 (Art. 724 do RIR/2018).`;
    } else {
      irrfWithheld = true;
      irrfReason = `RETENÇÃO OBRIGATÓRIA DE IRRF: Alíquota de ${irrfRate}% sobre o valor bruto da Nota Fiscal (DARF Código ${irrfDarfCode}).`;
    }
  } else {
    irrfReason = 'Atividade sem previsão legal de retenção de IRRF na fonte entre PJs.';
  }

  const irrfAmount = irrfWithheld ? grossAmount * (irrfRate / 100) : 0;

  // 3. CÁLCULO E REGRAS DA CSRF / PCC (PIS/COFINS/CSLL 4.65% - Lei 10.833/03 / DARF 5952)
  let csrfWithheld = false;
  let csrfRate = service.federalWithholdings.csrfRate;
  let csrfDarfCode = service.darfCodes?.csrf || '5952';
  let csrfDarfDesc = 'CSRF - Retenção de Contribuições (PIS 0,65% + COFINS 3,0% + CSLL 1,0% = 4,65% - Art. 30 Lei 10.833/2003)';
  let csrfReason = '';
  let csrfLegalBasis = service.federalWithholdings.csrfLegalBase || 'Art. 30 da Lei nº 10.833/2003 e IN RFB nº 1.524/2014';

  if (isExport) {
    csrfRate = 0;
    csrfWithheld = false;
    csrfReason = 'ISENÇÃO DE PIS/COFINS EM EXPORTAÇÃO: Art. 149, § 2º, I da CF/88 e Lei nº 10.833/2003 (Receita decorrente de exportação para o exterior).';
  } else if (isSimples) {
    csrfRate = 0;
    csrfWithheld = false;
    csrfReason = 'DISPENSADO DE RETENÇÃO DE CSRF: Prestador optante pelo Simples Nacional (Art. 1º da Instrução Normativa RFB nº 765/2007).';
  } else if (!isPjTomador) {
    csrfRate = 0;
    csrfWithheld = false;
    csrfReason = 'Dispensado de retenção de CSRF por se tratar de tomador Pessoa Física.';
  } else if (csrfRate > 0) {
    const calcCsrf = grossAmount * (csrfRate / 100);
    if (calcCsrf < 10.0) {
      csrfWithheld = false;
      csrfReason = `DISPENSADO DE RETENÇÃO: Valor acumulado da CSRF (R$ ${calcCsrf.toFixed(2)}) é inferior ao limite mínimo legal de R$ 10,00.`;
    } else {
      csrfWithheld = true;
      csrfReason = `RETENÇÃO OBRIGATÓRIA DE CSRF 4,65%: O Tomador PJ deve reter e recolher PIS/COFINS/CSLL via DARF ${csrfDarfCode}.`;
    }
  } else {
    csrfReason = 'Atividade sem previsão legal de retenção de CSRF na fonte.';
  }

  const csrfAmount = csrfWithheld ? grossAmount * (csrfRate / 100) : 0;
  const pisAmount = csrfWithheld ? grossAmount * 0.0065 : 0;
  const cofinsAmount = csrfWithheld ? grossAmount * 0.03 : 0;
  const csllAmount = csrfWithheld ? grossAmount * 0.01 : 0;

  // 4. CÁLCULO E REGRAS DE RETENÇÃO DE INSS (11% ou 3,5% - Lei 8.212/91 Art. 31 / DCTFWeb)
  let inssWithheld = false;
  let inssRate = service.federalWithholdings.inssWithholdingRate;
  let inssCode = service.darfCodes?.inssGps || '6190';
  let inssReason = '';
  let inssLegalBasis = service.federalWithholdings.inssLegalBase || 'Art. 31 da Lei nº 8.212/1991 e IN RFB nº 2.110/2022';

  const isAnexoIV = service.simplesNacional.defaultAnexo === 'IV';
  const requiresInss = isAnexoIV || !isSimples || hasCessaoMaoObra;

  if (isExport) {
    inssRate = 0;
    inssWithheld = false;
    inssReason = 'Sem retenção previdenciária em serviços prestados para o exterior sem cessão de mão de obra local.';
  } else if (!isPjTomador) {
    inssWithheld = false;
    inssReason = 'Dispensado de retenção de INSS por se tratar de tomador Pessoa Física.';
  } else if (inssRate > 0 && requiresInss) {
    inssWithheld = true;
    if (isAnexoIV) {
      inssReason = 'RETENÇÃO OBRIGATÓRIA DE INSS 11%: Atividade enquadrada no Anexo IV do Simples Nacional ou com cessão de mão de obra (Art. 31 Lei 8.212/91). O valor retido deve ser informado no eSocial/DCTFWeb.';
    } else {
      inssReason = 'RETENÇÃO OBRIGATÓRIA DE INSS 11%: Prestação mediante cessão de mão de obra exclusiva ou empreitada (Código de recolhimento 6190 / DCTFWeb).';
    }
  } else if (isSimples && !isAnexoIV) {
    inssRate = 0;
    inssWithheld = false;
    inssReason = 'DISPENSADO DE RETENÇÃO DE INSS: Empresa optante pelo Simples Nacional enquadrada nos Anexos III ou V sem cessão de mão de obra.';
  } else {
    inssReason = 'Não há retenção de INSS na fonte para esta tipologia de serviço.';
  }

  const inssAmount = inssWithheld ? grossAmount * (inssRate / 100) : 0;

  // 5. CÁLCULO PARA ÓRGÃOS PÚBLICOS FEDERAIS (IN RFB 1.234/2012)
  let orgaosPublicosInfo: ServiceCalculationResult['orgaosPublicos'] = undefined;
  if (isOrgaoPublicoFederal) {
    const totalPubRate = isSimples ? 0 : 5.85; // 1.2% IRPJ + 1% CSLL + 0.65% PIS + 3% COFINS
    const totalPubAmount = grossAmount * (totalPubRate / 100);
    orgaosPublicosInfo = {
      isApplicable: !isSimples,
      totalRate: totalPubRate,
      totalAmount: totalPubAmount,
      darfCode: service.darfCodes?.orgaosPublicos || '6147',
      reason: isSimples
        ? 'Isento de retenção ampla de Órgãos Públicos por ser optante do Simples Nacional (deve apresentar declaração do Anexo IV da IN 1234/12).'
        : 'RETENÇÃO UNIFICADA DE ÓRGÃOS PÚBLICOS FEDERAIS (IN RFB nº 1.234/2012): Retenção de IRPJ, CSLL, PIS e COFINS via DARF 6147.',
      legalBasis: 'Instrução Normativa RFB nº 1.234/2012 e Lei nº 9.430/1996'
    };
  }

  // 6. TOTALIZAÇÃO E VALOR LÍQUIDO DA NOTA FISCAL
  const totalWithheld = (issWithheld ? issAmount : 0) + irrfAmount + csrfAmount + inssAmount + (orgaosPublicosInfo?.isApplicable ? orgaosPublicosInfo.totalAmount : 0);
  const netAmountReceived = grossAmount - totalWithheld;
  const effectiveWithholdingRate = grossAmount > 0 ? (totalWithheld / grossAmount) * 100 : 0;

  return {
    grossAmount,
    operationType,
    iss: {
      incidenceLocation: issIncidenceLocation,
      isIssDueAtLocalExecucao,
      rate: issRate,
      amount: issAmount,
      isWithheld: issWithheld,
      collectorName: issCollector,
      reason: issReason,
      cpomRiskNotice,
      legalBasis: issLegalBasis
    },
    irrf: {
      isWithheld: irrfWithheld,
      rate: irrfRate,
      amount: irrfAmount,
      darfCode: irrfDarfCode,
      darfDescription: irrfDarfDesc,
      reason: irrfReason,
      legalBasis: irrfLegalBasis
    },
    csrf: {
      isWithheld: csrfWithheld,
      rate: csrfRate,
      amount: csrfAmount,
      pisAmount,
      cofinsAmount,
      csllAmount,
      darfCode: csrfDarfCode,
      darfDescription: csrfDarfDesc,
      reason: csrfReason,
      legalBasis: csrfLegalBasis
    },
    inss: {
      isWithheld: inssWithheld,
      rate: inssRate,
      amount: inssAmount,
      recolhimentoCode: inssCode,
      reason: inssReason,
      legalBasis: inssLegalBasis
    },
    orgaosPublicos: orgaosPublicosInfo,
    totalWithheld,
    netAmountReceived,
    effectiveWithholdingRate
  };
}

/**
 * MOTOR DE PESQUISA INTELIGENTE DE CÓDIGOS DE SERVIÇO (CTN, CNAE, LC 116, NBS, DESCRIÇÃO)
 */
export function searchIntelligentServices(params: {
  searchTerm: string;
  selectedGroup?: string;
  serviceFilter?: string;
  favoriteServices?: string[];
}): ServiceCodeTaxData[] {
  const { searchTerm = '', selectedGroup = 'todos', serviceFilter = 'todos', favoriteServices = [] } = params;

  const rawTerm = searchTerm.trim().toLowerCase();
  const cleanDigits = rawTerm.replace(/[^0-9]/g, '');

  return SERVICE_CODE_DATABASE.filter(item => {
    // Normalização dos campos do item
    const cleanItemLC = item.itemLC116.replace(/[^0-9.]/g, '');
    const cleanItemCTN = item.ctnCode ? item.ctnCode.replace(/[^0-9.]/g, '') : '';
    const normDesc = item.description.toLowerCase();
    const normGroup = item.groupName.toLowerCase();
    const normNbs = item.nbsCode ? item.nbsCode.toLowerCase() : '';
    const normCnaes = item.cnaeCorrelates.map(c => c.toLowerCase());

    // Combinações de pesquisa
    let matchesSearch = true;
    if (rawTerm.length > 0) {
      matchesSearch =
        normDesc.includes(rawTerm) ||
        normGroup.includes(rawTerm) ||
        cleanItemLC.includes(rawTerm) ||
        cleanItemCTN.includes(rawTerm) ||
        normNbs.includes(rawTerm) ||
        normCnaes.some(cnae => cnae.includes(rawTerm) || cnae.replace(/[^0-9]/g, '').includes(cleanDigits));
    }

    const matchesGroup = selectedGroup === 'todos' || item.groupName === selectedGroup;

    let matchesFilter = true;
    if (serviceFilter === 'fator_r') {
      matchesFilter = item.simplesNacional.subjectToFatorR === true;
    } else if (serviceFilter === 'anexo_iv') {
      matchesFilter = item.simplesNacional.defaultAnexo === 'IV';
    } else if (serviceFilter === 'retencao_fonte') {
      matchesFilter = item.federalWithholdings.irrfRate > 0 || item.federalWithholdings.csrfRate > 0 || item.federalWithholdings.inssWithholdingRate > 0;
    } else if (serviceFilter === 'local_prestacao') {
      matchesFilter = item.issIncidenceRule === 'local_prestacao';
    } else if (serviceFilter === 'reducao_reforma') {
      matchesFilter = item.reformaTributaria.treatment !== 'padrao_26.5';
    } else if (serviceFilter === 'favoritos') {
      matchesFilter = favoriteServices.includes(item.itemLC116);
    }

    return matchesSearch && matchesGroup && matchesFilter;
  });
}
