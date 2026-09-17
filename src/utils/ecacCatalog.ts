import { SimplesAnexo, TransportType } from '../types';

export interface EcacActivityOption {
  code: string;
  group: string;
  label: string;
  anexo: SimplesAnexo;
  subjectToFatorR: boolean; // Se true, testa Fator R (>=28% Anexo III, <28% Anexo V). Se false, NUNCA vai pro Anexo V!
  isExport: boolean;
  taxJurisdiction: 'estadual_icms' | 'municipal_iss' | 'misto_icms_iss' | 'federal_apenas';
  hasST: boolean;
  hasIssRetido: boolean;
  hasIssFixo?: boolean;
  isTransport?: boolean;
  transportType?: TransportType;
  hasIPI?: boolean;
  legalBasis: string;
  description: string;
}

/**
 * Catálogo Oficial de Atividades Econômicas da Declaração PGDAS-D / e-CAC
 * Mapeamento exato da árvore de preenchimento da Receita Federal do Brasil (LC 123/2006)
 */
export const ECAC_ACTIVITY_CATALOG: EcacActivityOption[] = [
  // 1. REVENDA DE MERCADORIAS (COMÉRCIO) - EXCETO EXTERIOR
  {
    code: 'revenda_mercadorias_sem_st',
    group: 'Revenda de mercadorias, exceto para o exterior',
    label: 'Sem substituição tributária/tributação monofásica/antecipação com encerramento de tributação (o substituto tributário do ICMS deve utilizar essa opção)',
    anexo: 'I',
    subjectToFatorR: false,
    isExport: false,
    taxJurisdiction: 'estadual_icms',
    hasST: false,
    hasIssRetido: false,
    legalBasis: 'LC 123/2006 Art. 18 § 4º, I',
    description: 'Comércio varejista ou atacadista com ICMS integral no DAS (sem ST e sem monofásico).',
  },
  {
    code: 'revenda_mercadorias_com_st',
    group: 'Revenda de mercadorias, exceto para o exterior',
    label: 'Com substituição tributária/tributação monofásica/antecipação com encerramento de tributação (o substituído tributário do ICMS deve utilizar essa opção)',
    anexo: 'I',
    subjectToFatorR: false,
    isExport: false,
    taxJurisdiction: 'estadual_icms',
    hasST: true,
    hasIssRetido: false,
    legalBasis: 'LC 123/2006 Art. 18 § 4º-A, I',
    description: 'Comércio de produtos com ICMS retido anteriormente por ST ou tributação monofásica. Parcela de ICMS/PIS/COFINS deduzida no DAS.',
  },

  // 2. REVENDA DE MERCADORIAS PARA O EXTERIOR
  {
    code: 'revenda_mercadorias_exterior',
    group: 'Revenda de mercadorias para o exterior',
    label: 'Revenda de mercadorias para o exterior',
    anexo: 'I',
    subjectToFatorR: false,
    isExport: true,
    taxJurisdiction: 'federal_apenas',
    hasST: false,
    hasIssRetido: false,
    legalBasis: 'LC 123/2006 Art. 18 § 4º-A; CF/88 Art. 155 § 2º X',
    description: 'Exportação com desoneração total de ICMS, PIS e COFINS. Recolhe no DAS apenas IRPJ, CSLL e CPP com duplo limite anual de R$ 4,8M.',
  },

  // 3. VENDA DE MERCADORIAS INDUSTRIALIZADAS (INDÚSTRIA) - EXCETO EXTERIOR
  {
    code: 'industria_sem_st',
    group: 'Venda de mercadorias industrializadas pelo contribuinte, exceto para o exterior',
    label: 'Sem substituição tributária/tributação monofásica/antecipação com encerramento de tributação (o substituto tributário do ICMS deve utilizar essa opção)',
    anexo: 'II',
    subjectToFatorR: false,
    isExport: false,
    taxJurisdiction: 'estadual_icms',
    hasST: false,
    hasIssRetido: false,
    hasIPI: true,
    legalBasis: 'LC 123/2006 Art. 18 § 4º, II',
    description: 'Fabricação própria e venda com tributação integral de ICMS e IPI no DAS.',
  },
  {
    code: 'industria_com_st',
    group: 'Venda de mercadorias industrializadas pelo contribuinte, exceto para o exterior',
    label: 'Com substituição tributária/tributação monofásica/antecipação com encerramento de tributação (o substituído tributário do ICMS deve utilizar essa opção)',
    anexo: 'II',
    subjectToFatorR: false,
    isExport: false,
    taxJurisdiction: 'estadual_icms',
    hasST: true,
    hasIssRetido: false,
    hasIPI: true,
    legalBasis: 'LC 123/2006 Art. 18 § 4º-A, I',
    description: 'Fabricação com ICMS retido por ST ou antecipação. Parcela de ICMS deduzida no DAS.',
  },

  // 4. VENDA DE MERCADORIAS INDUSTRIALIZADAS PARA O EXTERIOR
  {
    code: 'industria_exterior',
    group: 'Venda de mercadorias industrializadas pelo contribuinte para o exterior',
    label: 'Venda de mercadorias industrializadas pelo contribuinte para o exterior',
    anexo: 'II',
    subjectToFatorR: false,
    isExport: true,
    taxJurisdiction: 'federal_apenas',
    hasST: false,
    hasIssRetido: false,
    hasIPI: true,
    legalBasis: 'CF/88 Art. 153 § 3º III e Art. 155 § 2º X; LC 123/2006',
    description: 'Exportação industrial com imunidade de IPI, ICMS, PIS e COFINS. Recolhe apenas IRPJ, CSLL e CPP.',
  },

  // 5. LOCAÇÃO DE BENS MÓVEIS
  {
    code: 'locacao_bens_moveis_exceto_exterior',
    group: 'Locação de bens móveis, exceto para o exterior',
    label: 'Locação de bens móveis, exceto para o exterior',
    anexo: 'III',
    subjectToFatorR: false, // Locação de bens móveis NÃO se submete a Fator R e NÃO tem ISS!
    isExport: false,
    taxJurisdiction: 'federal_apenas',
    hasST: false,
    hasIssRetido: false,
    legalBasis: 'Súmula Vinculante 31 STF; LC 123/2006 Art. 18 § 5º-A',
    description: 'Locação de bens móveis no mercado interno. Não há incidência de ISS nem ICMS (Súmula Vinculante 31 STF). Tributa Anexo III sem ISS.',
  },
  {
    code: 'locacao_bens_moveis_exterior',
    group: 'Locação de bens móveis para o exterior',
    label: 'Locação de bens móveis para o exterior',
    anexo: 'III',
    subjectToFatorR: false,
    isExport: true,
    taxJurisdiction: 'federal_apenas',
    hasST: false,
    hasIssRetido: false,
    legalBasis: 'LC 123/2006 Art. 18 § 5º-A; CF/88',
    description: 'Locação de bens móveis para o exterior com desoneração tributária.',
  },

  // 6. PRESTAÇÃO DE SERVIÇOS, EXCETO PARA O EXTERIOR
  {
    code: 'servicos_contabeis_iss_fixo',
    group: 'Prestação de Serviços, exceto para o exterior',
    label: 'Escritórios de serviços contábeis autorizados pela legislação municipal a pagar o ISS em valor fixo em guia do Município',
    anexo: 'III',
    subjectToFatorR: false,
    isExport: false,
    taxJurisdiction: 'municipal_iss',
    hasST: false,
    hasIssRetido: false,
    hasIssFixo: true,
    legalBasis: 'LC 123/2006 Art. 18 § 22-B e § 22-C',
    description: 'Escritórios de contabilidade com recolhimento fixo municipal do ISS. Parcela de ISS é deduzida do DAS.',
  },
  {
    code: 'servicos_sujeitos_fator_r_sem_ret_outro',
    group: 'Prestação de Serviços, exceto para o exterior',
    label: 'Sujeitos ao fator “r”, sem retenção/substituição tributária de ISS, com ISS devido a outro(s) Município(s)',
    anexo: 'III', // Dinâmico: III se >=28%, V se <28%
    subjectToFatorR: true,
    isExport: false,
    taxJurisdiction: 'municipal_iss',
    hasST: false,
    hasIssRetido: false,
    legalBasis: 'LC 123/2006 Art. 18 § 5º-J e § 5º-M',
    description: 'Serviços intelectuais/tecnologia com teste de Fator R (Folha/Receita >= 28% vai Anexo III; < 28% vai Anexo V). ISS devido a outro município.',
  },
  {
    code: 'servicos_sujeitos_fator_r_sem_ret_proprio',
    group: 'Prestação de Serviços, exceto para o exterior',
    label: 'Sujeitos ao fator “r”, sem retenção/substituição tributária de ISS, com ISS devido ao próprio Município do estabelecimento',
    anexo: 'III', // Dinâmico: III se >=28%, V se <28%
    subjectToFatorR: true,
    isExport: false,
    taxJurisdiction: 'municipal_iss',
    hasST: false,
    hasIssRetido: false,
    legalBasis: 'LC 123/2006 Art. 18 § 5º-J e § 5º-M',
    description: 'Serviços intelectuais/tecnologia com teste de Fator R (Folha/Receita >= 28% vai Anexo III; < 28% vai Anexo V). ISS devido ao próprio município.',
  },
  {
    code: 'servicos_sujeitos_fator_r_com_ret',
    group: 'Prestação de Serviços, exceto para o exterior',
    label: 'Sujeitos ao fator “r”, com retenção/substituição tributária de ISS',
    anexo: 'III', // Dinâmico: III se >=28%, V se <28%
    subjectToFatorR: true,
    isExport: false,
    taxJurisdiction: 'municipal_iss',
    hasST: false,
    hasIssRetido: true,
    legalBasis: 'LC 123/2006 Art. 18 § 5º-J e Art. 21 § 4º',
    description: 'Serviços sujeitos ao Fator R com ISS retido na fonte pelo tomador. Parcela de ISS deduzida do DAS.',
  },
  {
    code: 'servicos_nao_sujeitos_fator_r_anexo3_sem_ret_outro',
    group: 'Prestação de Serviços, exceto para o exterior',
    label: 'Não sujeitos ao fator “r” e tributados pelo Anexo III, sem retenção/substituição tributária de ISS, com ISS devido a outro(s) Município(s)',
    anexo: 'III',
    subjectToFatorR: false, // NUNCA VAI PRO ANEXO V! SEMPRE ANEXO III
    isExport: false,
    taxJurisdiction: 'municipal_iss',
    hasST: false,
    hasIssRetido: false,
    legalBasis: 'LC 123/2006 Art. 18 § 5º-B',
    description: 'Serviços em geral (manutenção, consertos, instalação, academias, escolas) SEMPRE tributados no Anexo III (alíquota inicial 6,00%), sem Fator R.',
  },
  {
    code: 'servicos_nao_sujeitos_fator_r_anexo3_sem_ret_proprio',
    group: 'Prestação de Serviços, exceto para o exterior',
    label: 'Não sujeitos ao fator “r” e tributados pelo Anexo III, sem retenção/substituição tributária de ISS, com ISS devido ao próprio Município do estabelecimento',
    anexo: 'III',
    subjectToFatorR: false, // NUNCA VAI PRO ANEXO V! SEMPRE ANEXO III
    isExport: false,
    taxJurisdiction: 'municipal_iss',
    hasST: false,
    hasIssRetido: false,
    legalBasis: 'LC 123/2006 Art. 18 § 5º-B',
    description: 'Serviços em geral SEMPRE tributados no Anexo III (alíquota inicial 6,00%), sem Fator R. ISS devido ao município do estabelecimento.',
  },
  {
    code: 'servicos_nao_sujeitos_fator_r_anexo3_com_ret',
    group: 'Prestação de Serviços, exceto para o exterior',
    label: 'Não sujeitos ao fator “r” e tributados pelo Anexo III, com retenção/substituição tributária de ISS',
    anexo: 'III',
    subjectToFatorR: false, // NUNCA VAI PRO ANEXO V! SEMPRE ANEXO III
    isExport: false,
    taxJurisdiction: 'municipal_iss',
    hasST: false,
    hasIssRetido: true,
    legalBasis: 'LC 123/2006 Art. 18 § 5º-B e Art. 21 § 4º',
    description: 'Serviços do Anexo III puro com ISS retido pelo tomador. Parcela de ISS deduzida no DAS.',
  },
  {
    code: 'servicos_anexo4_sem_ret_outro',
    group: 'Prestação de Serviços, exceto para o exterior',
    label: 'Sujeitos ao Anexo IV, sem retenção/substituição tributária de ISS, com ISS devido a outro(s) Município(s)',
    anexo: 'IV',
    subjectToFatorR: false,
    isExport: false,
    taxJurisdiction: 'municipal_iss',
    hasST: false,
    hasIssRetido: false,
    legalBasis: 'LC 123/2006 Art. 18 § 5º-C',
    description: 'Advocacia, vigilância, limpeza e obras. Não inclui CPP patronal no DAS (recolhida à parte na DCTFWeb). Alíquota inicial 4,50%.',
  },
  {
    code: 'servicos_anexo4_sem_ret_proprio',
    group: 'Prestação de Serviços, exceto para o exterior',
    label: 'Sujeitos ao Anexo IV, sem retenção/substituição tributária de ISS, com ISS devido ao próprio Município do estabelecimento',
    anexo: 'IV',
    subjectToFatorR: false,
    isExport: false,
    taxJurisdiction: 'municipal_iss',
    hasST: false,
    hasIssRetido: false,
    legalBasis: 'LC 123/2006 Art. 18 § 5º-C',
    description: 'Advocacia, vigilância, limpeza e obras no próprio município. CPP recolhida à parte.',
  },
  {
    code: 'servicos_anexo4_com_ret',
    group: 'Prestação de Serviços, exceto para o exterior',
    label: 'Sujeitos ao Anexo IV, com retenção/substituição tributária de ISS',
    anexo: 'IV',
    subjectToFatorR: false,
    isExport: false,
    taxJurisdiction: 'municipal_iss',
    hasST: false,
    hasIssRetido: true,
    legalBasis: 'LC 123/2006 Art. 18 § 5º-C e Art. 21 § 4º',
    description: 'Serviços do Anexo IV com retenção de ISS pelo tomador. ISS deduzido no DAS e CPP recolhida fora.',
  },

  // 7. SUBITENS 7.02, 7.05 E 16.1 DA LC 116/2003 (CONSTRUÇÃO CIVIL E TRANSPORTE MUNICIPAL)
  {
    code: 'servicos_construcao_anexo3_sem_ret_outro',
    group: 'Prestação de Serviços relacionados nos subitens 7.02, 7.05 e 16.1 da lista anexa à LC 116/2003, exceto para o exterior',
    label: 'Serviços da área da construção civil relacionados nos subitens 7.02 e 7.05 da lista anexa à LC 116/2003 e tributados pelo Anexo III, sem retenção/substituição tributária de ISS, com ISS devido a outro(s) Município(s)',
    anexo: 'III',
    subjectToFatorR: false,
    isExport: false,
    taxJurisdiction: 'municipal_iss',
    hasST: false,
    hasIssRetido: false,
    legalBasis: 'LC 116/2003 subitens 7.02 e 7.05; LC 123/2006',
    description: 'Construção civil no Anexo III (com dedução de materiais permitida). ISS devido ao local da obra.',
  },
  {
    code: 'servicos_construcao_anexo3_sem_ret_proprio',
    group: 'Prestação de Serviços relacionados nos subitens 7.02, 7.05 e 16.1 da lista anexa à LC 116/2003, exceto para o exterior',
    label: 'Serviços da área da construção civil relacionados nos subitens 7.02 e 7.05 da lista anexa à LC 116/2003 e tributados pelo Anexo III, sem retenção/substituição tributária de ISS, com ISS devido ao próprio Município do estabelecimento',
    anexo: 'III',
    subjectToFatorR: false,
    isExport: false,
    taxJurisdiction: 'municipal_iss',
    hasST: false,
    hasIssRetido: false,
    legalBasis: 'LC 116/2003 subitens 7.02 e 7.05; LC 123/2006',
    description: 'Construção civil no Anexo III realizada no próprio município da sede.',
  },
  {
    code: 'servicos_construcao_anexo3_com_ret',
    group: 'Prestação de Serviços relacionados nos subitens 7.02, 7.05 e 16.1 da lista anexa à LC 116/2003, exceto para o exterior',
    label: 'Serviços da área da construção civil relacionados nos subitens 7.02 e 7.05 da lista anexa à LC 116/2003 e tributados pelo Anexo III, com retenção/substituição tributária de ISS',
    anexo: 'III',
    subjectToFatorR: false,
    isExport: false,
    taxJurisdiction: 'municipal_iss',
    hasST: false,
    hasIssRetido: true,
    legalBasis: 'LC 116/2003 subitens 7.02 e 7.05; LC 123/2006',
    description: 'Construção civil no Anexo III com ISS retido pelo contratante da obra.',
  },
  {
    code: 'servicos_construcao_anexo4_sem_ret_outro',
    group: 'Prestação de Serviços relacionados nos subitens 7.02, 7.05 e 16.1 da lista anexa à LC 116/2003, exceto para o exterior',
    label: 'Serviços da área da construção civil relacionados nos subitens 7.02 e 7.05 da lista anexa à LC 116/2003 e tributados pelo Anexo IV, sem retenção/substituição tributária de ISS, com ISS devido a outro(s) Município(s)',
    anexo: 'IV',
    subjectToFatorR: false,
    isExport: false,
    taxJurisdiction: 'municipal_iss',
    hasST: false,
    hasIssRetido: false,
    legalBasis: 'LC 123/2006 Art. 18 § 5º-C; LC 116/2003',
    description: 'Obras de engenharia civil no Anexo IV (CPP recolhida sobre a folha). ISS devido ao local da obra.',
  },
  {
    code: 'servicos_construcao_anexo4_sem_ret_proprio',
    group: 'Prestação de Serviços relacionados nos subitens 7.02, 7.05 e 16.1 da lista anexa à LC 116/2003, exceto para o exterior',
    label: 'Serviços da área da construção civil relacionados nos subitens 7.02 e 7.05 da lista anexa à LC 116/2003 e tributados pelo Anexo IV, sem retenção/substituição tributária de ISS, com ISS devido ao próprio Município do estabelecimento',
    anexo: 'IV',
    subjectToFatorR: false,
    isExport: false,
    taxJurisdiction: 'municipal_iss',
    hasST: false,
    hasIssRetido: false,
    legalBasis: 'LC 123/2006 Art. 18 § 5º-C; LC 116/2003',
    description: 'Construção civil no Anexo IV no próprio município do estabelecimento.',
  },
  {
    code: 'servicos_construcao_anexo4_com_ret',
    group: 'Prestação de Serviços relacionados nos subitens 7.02, 7.05 e 16.1 da lista anexa à LC 116/2003, exceto para o exterior',
    label: 'Serviços da área da construção civil relacionados nos subitens 7.02 e 7.05 da lista anexa à LC 116/2003 e tributados pelo Anexo IV, com retenção/substituição tributária de ISS',
    anexo: 'IV',
    subjectToFatorR: false,
    isExport: false,
    taxJurisdiction: 'municipal_iss',
    hasST: false,
    hasIssRetido: true,
    legalBasis: 'LC 123/2006 Art. 18 § 5º-C; LC 116/2003',
    description: 'Construção civil no Anexo IV com ISS retido na fonte pelo tomador.',
  },
  {
    code: 'transporte_coletivo_municipal_sem_ret_outro',
    group: 'Prestação de Serviços relacionados nos subitens 7.02, 7.05 e 16.1 da lista anexa à LC 116/2003, exceto para o exterior',
    label: 'Serviços de transporte coletivo municipal rodoviário, metroviário, ferroviário e aquaviário de passageiros, sem retenção/substituição tributária de ISS, com ISS devido a outro(s) Município(s)',
    anexo: 'III',
    subjectToFatorR: false,
    isExport: false,
    taxJurisdiction: 'municipal_iss',
    hasST: false,
    hasIssRetido: false,
    isTransport: true,
    transportType: 'municipal',
    legalBasis: 'LC 116/2003 Subitem 16.01; LC 123/2006',
    description: 'Transporte coletivo municipal tributado com ISS no Anexo III sem Fator R.',
  },
  {
    code: 'transporte_coletivo_municipal_sem_ret_proprio',
    group: 'Prestação de Serviços relacionados nos subitens 7.02, 7.05 e 16.1 da lista anexa à LC 116/2003, exceto para o exterior',
    label: 'Serviços de transporte coletivo municipal rodoviário, metroviário, ferroviário e aquaviário de passageiros, sem retenção/substituição tributária de ISS, com ISS devido ao próprio Município do estabelecimento',
    anexo: 'III',
    subjectToFatorR: false,
    isExport: false,
    taxJurisdiction: 'municipal_iss',
    hasST: false,
    hasIssRetido: false,
    isTransport: true,
    transportType: 'municipal',
    legalBasis: 'LC 116/2003 Subitem 16.01; LC 123/2006',
    description: 'Transporte coletivo municipal no município sede no Anexo III.',
  },
  {
    code: 'transporte_coletivo_municipal_com_ret',
    group: 'Prestação de Serviços relacionados nos subitens 7.02, 7.05 e 16.1 da lista anexa à LC 116/2003, exceto para o exterior',
    label: 'Serviços de transporte coletivo municipal rodoviário, metroviário, ferroviário e aquaviário de passageiros, com retenção/substituição tributária de ISS',
    anexo: 'III',
    subjectToFatorR: false,
    isExport: false,
    taxJurisdiction: 'municipal_iss',
    hasST: false,
    hasIssRetido: true,
    isTransport: true,
    transportType: 'municipal',
    legalBasis: 'LC 116/2003 Subitem 16.01; LC 123/2006',
    description: 'Transporte coletivo municipal com ISS retido pelo contratante.',
  },

  // 8. PRESTAÇÃO DE SERVIÇOS PARA O EXTERIOR
  {
    code: 'servicos_exterior_contabeis',
    group: 'Prestação de Serviços para o exterior',
    label: 'Escritórios de serviços contábeis autorizados pela legislação municipal a pagar o ISS em valor fixo em guia do Município',
    anexo: 'III',
    subjectToFatorR: false,
    isExport: true,
    taxJurisdiction: 'federal_apenas',
    hasST: false,
    hasIssRetido: false,
    legalBasis: 'LC 123/2006 Art. 18 § 22-B',
    description: 'Serviços contábeis para clientes no exterior com isenção de ISS.',
  },
  {
    code: 'servicos_exterior_sujeitos_fator_r',
    group: 'Prestação de Serviços para o exterior',
    label: 'Sujeitos ao fator “r”',
    anexo: 'III', // Dinâmico III / V
    subjectToFatorR: true,
    isExport: true,
    taxJurisdiction: 'federal_apenas',
    hasST: false,
    hasIssRetido: false,
    legalBasis: 'LC 123/2006 Art. 18 § 5º-J; LC 116/2003 Art. 2º I',
    description: 'Serviços de tecnologia/intelectuais para o exterior. Isenção de ISS e PIS/COFINS (tributa apenas IRPJ, CSLL e CPP).',
  },
  {
    code: 'servicos_exterior_nao_sujeitos_fator_r_anexo3',
    group: 'Prestação de Serviços para o exterior',
    label: 'Não sujeitos ao fator “r” e tributados pelo Anexo III',
    anexo: 'III',
    subjectToFatorR: false, // NUNCA VAI PRO ANEXO V
    isExport: true,
    taxJurisdiction: 'federal_apenas',
    hasST: false,
    hasIssRetido: false,
    legalBasis: 'LC 123/2006 Art. 18 § 5º-B; LC 116/2003 Art. 2º I',
    description: 'Serviços do Anexo III prestados para o exterior (resultado fora do país) com isenção de ISS e PIS/COFINS.',
  },
  {
    code: 'servicos_exterior_anexo4',
    group: 'Prestação de Serviços para o exterior',
    label: 'Sujeitos ao Anexo IV',
    anexo: 'IV',
    subjectToFatorR: false,
    isExport: true,
    taxJurisdiction: 'federal_apenas',
    hasST: false,
    hasIssRetido: false,
    legalBasis: 'LC 123/2006 Art. 18 § 5º-C; LC 116/2003 Art. 2º I',
    description: 'Serviços do Anexo IV prestados para o exterior.',
  },
  {
    code: 'servicos_exterior_construcao_anexo3',
    group: 'Prestação de Serviços relacionados nos subitens 7.02 e 7.05 da lista anexa à LC 116/2003, para o exterior',
    label: 'Serviços da área da construção civil relacionados nos subitens 7.02 e 7.05 da lista anexa à LC 116/2003 e tributados pelo Anexo III',
    anexo: 'III',
    subjectToFatorR: false,
    isExport: true,
    taxJurisdiction: 'federal_apenas',
    hasST: false,
    hasIssRetido: false,
    legalBasis: 'LC 116/2003; LC 123/2006',
    description: 'Construção civil no Anexo III prestada para o exterior.',
  },
  {
    code: 'servicos_exterior_construcao_anexo4',
    group: 'Prestação de Serviços relacionados nos subitens 7.02 e 7.05 da lista anexa à LC 116/2003, para o exterior',
    label: 'Serviços da área da construção civil relacionados nos subitens 7.02 e 7.05 da lista anexa à LC 116/2003 e tributados pelo Anexo IV',
    anexo: 'IV',
    subjectToFatorR: false,
    isExport: true,
    taxJurisdiction: 'federal_apenas',
    hasST: false,
    hasIssRetido: false,
    legalBasis: 'LC 116/2003; LC 123/2006',
    description: 'Construção civil no Anexo IV prestada para o exterior.',
  },

  // 9. TRANSPORTE INTERMUNICIPAL/INTERESTADUAL E COMUNICAÇÃO (EXCETO EXTERIOR)
  {
    code: 'transporte_inter_sem_st',
    group: 'Serviços de comunicação; de transporte intermunicipal e interestadual de carga; e de transporte intermunicipal e interestadual de passageiros autorizados no inciso VI do art. 17 da LC 123, exceto para o exterior',
    label: 'Transporte sem substituição tributária de ICMS (o substituto tributário deve utilizar essa opção)',
    anexo: 'III',
    subjectToFatorR: false, // TRANSPORTE É ANEXO III COM ICMS, NÃO FATOR R!
    isExport: false,
    taxJurisdiction: 'estadual_icms',
    hasST: false,
    hasIssRetido: false,
    isTransport: true,
    transportType: 'intermunicipal_cargas',
    legalBasis: 'LC 123/2006 Art. 18 § 5º-E',
    description: 'Transporte rodoviário intermunicipal/interestadual com ICMS integral no DAS no Anexo III. Sem Fator R.',
  },
  {
    code: 'transporte_inter_com_st',
    group: 'Serviços de comunicação; de transporte intermunicipal e interestadual de carga; e de transporte intermunicipal e interestadual de passageiros autorizados no inciso VI do art. 17 da LC 123, exceto para o exterior',
    label: 'Transporte com substituição tributária de ICMS (o substituído tributário deve utilizar essa opção)',
    anexo: 'III',
    subjectToFatorR: false,
    isExport: false,
    taxJurisdiction: 'estadual_icms',
    hasST: true,
    hasIssRetido: false,
    isTransport: true,
    transportType: 'intermunicipal_cargas',
    legalBasis: 'LC 123/2006 Art. 18 § 4º-A; Convênio ICMS 25/90',
    description: 'Transporte subcontratado ou com ICMS-ST recolhido pelo tomador. Parcela de ICMS deduzida 100% no DAS.',
  },
  {
    code: 'comunicacao_sem_st',
    group: 'Serviços de comunicação; de transporte intermunicipal e interestadual de carga; e de transporte intermunicipal e interestadual de passageiros autorizados no inciso VI do art. 17 da LC 123, exceto para o exterior',
    label: 'Comunicação sem substituição tributária de ICMS (o substituto tributário deve utilizar essa opção)',
    anexo: 'III',
    subjectToFatorR: false,
    isExport: false,
    taxJurisdiction: 'estadual_icms',
    hasST: false,
    hasIssRetido: false,
    legalBasis: 'LC 123/2006 Art. 18 § 5º-E',
    description: 'Serviços de telecomunicações e comunicação com ICMS no Anexo III.',
  },
  {
    code: 'comunicacao_com_st',
    group: 'Serviços de comunicação; de transporte intermunicipal e interestadual de carga; e de transporte intermunicipal e interestadual de passageiros autorizados no inciso VI do art. 17 da LC 123, exceto para o exterior',
    label: 'Comunicação com substituição tributária de ICMS (o substituído tributário deve utilizar essa opção)',
    anexo: 'III',
    subjectToFatorR: false,
    isExport: false,
    taxJurisdiction: 'estadual_icms',
    hasST: true,
    hasIssRetido: false,
    legalBasis: 'LC 123/2006 Art. 18 § 4º-A',
    description: 'Serviços de comunicação com ICMS-ST recolhido.',
  },

  // 10. TRANSPORTE E COMUNICAÇÃO PARA O EXTERIOR
  {
    code: 'transporte_inter_exterior',
    group: 'Serviços de comunicação; de transporte intermunicipal e interestadual de carga; e de transporte intermunicipal e interestadual de passageiros autorizados no inciso VI do art. 17 da LC 123, para o exterior',
    label: 'Transporte',
    anexo: 'III',
    subjectToFatorR: false,
    isExport: true,
    taxJurisdiction: 'federal_apenas',
    hasST: false,
    hasIssRetido: false,
    isTransport: true,
    transportType: 'intermunicipal_cargas',
    legalBasis: 'CF/88 Art. 155 § 2º X; LC 123/2006',
    description: 'Transporte internacional ou com destino à exportação com imunidade de ICMS.',
  },
  {
    code: 'comunicacao_exterior',
    group: 'Serviços de comunicação; de transporte intermunicipal e interestadual de carga; e de transporte intermunicipal e interestadual de passageiros autorizados no inciso VI do art. 17 da LC 123, para o exterior',
    label: 'Comunicação',
    anexo: 'III',
    subjectToFatorR: false,
    isExport: true,
    taxJurisdiction: 'federal_apenas',
    hasST: false,
    hasIssRetido: false,
    legalBasis: 'CF/88; LC 123/2006',
    description: 'Comunicação para o exterior.',
  },

  // 11. ATIVIDADES COM INCIDÊNCIA SIMULTÂNEA DE IPI E ISS (EXCETO EXTERIOR)
  {
    code: 'ipi_iss_sem_ret_outro',
    group: 'Atividades com incidência simultânea de IPI e de ISS, exceto para o exterior',
    label: 'Sem retenção/substituição tributária de ISS, com ISS devido a outro(s) Município(s)',
    anexo: 'II', // Base mista II (IPI) + ISS
    subjectToFatorR: false,
    isExport: false,
    taxJurisdiction: 'misto_icms_iss',
    hasST: false,
    hasIssRetido: false,
    hasIPI: true,
    legalBasis: 'LC 123/2006 Art. 18 § 4º, VI',
    description: 'Operações mistas com incidência simultânea de IPI e ISS (ex: confecção sob encomenda). ISS devido a outro município.',
  },
  {
    code: 'ipi_iss_sem_ret_proprio',
    group: 'Atividades com incidência simultânea de IPI e de ISS, exceto para o exterior',
    label: 'Sem retenção/substituição tributária de ISS, com ISS devido ao próprio Município do estabelecimento',
    anexo: 'II',
    subjectToFatorR: false,
    isExport: false,
    taxJurisdiction: 'misto_icms_iss',
    hasST: false,
    hasIssRetido: false,
    hasIPI: true,
    legalBasis: 'LC 123/2006 Art. 18 § 4º, VI',
    description: 'Operações mistas de IPI + ISS no próprio município.',
  },
  {
    code: 'ipi_iss_com_ret',
    group: 'Atividades com incidência simultânea de IPI e de ISS, exceto para o exterior',
    label: 'Com retenção/substituição tributária de ISS',
    anexo: 'II',
    subjectToFatorR: false,
    isExport: false,
    taxJurisdiction: 'misto_icms_iss',
    hasST: false,
    hasIssRetido: true,
    hasIPI: true,
    legalBasis: 'LC 123/2006 Art. 18 § 4º, VI e Art. 21 § 4º',
    description: 'Operações mistas de IPI + ISS com retenção do ISS na fonte.',
  },

  // 12. ATIVIDADES COM INCIDÊNCIA SIMULTÂNEA DE IPI E ISS PARA O EXTERIOR
  {
    code: 'ipi_iss_exterior',
    group: 'Atividades com incidência simultânea de IPI e de ISS para o exterior',
    label: 'Atividades com incidência simultânea de IPI e de ISS para o exterior',
    anexo: 'II',
    subjectToFatorR: false,
    isExport: true,
    taxJurisdiction: 'federal_apenas',
    hasST: false,
    hasIssRetido: false,
    hasIPI: true,
    legalBasis: 'CF/88; LC 123/2006',
    description: 'Operações mistas para o exterior com imunidade tributária de IPI e ISS.',
  },
];

/**
 * Encontra a opção do e-CAC mais adequada a partir de texto extraído do PGDAS-D ou busca
 */
export function findEcacOptionByText(text: string): EcacActivityOption | undefined {
  if (!text) return undefined;
  const normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos para busca robusta
    .replace(/\s+/g, ' ')
    .trim();

  // 1. Match exato por código
  const byCode = ECAC_ACTIVITY_CATALOG.find(o => o.code === text || o.code === normalized);
  if (byCode) return byCode;

  // 2. Match direto com labels do catálogo oficial
  for (const opt of ECAC_ACTIVITY_CATALOG) {
    const optLabelNorm = opt.label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    const optGroupNorm = opt.group.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    const combinedNorm = `${optGroupNorm} - ${optLabelNorm}`;
    
    // Se o texto extraído contém um trecho significativo do label oficial
    if (normalized === optLabelNorm || normalized === combinedNorm) {
      return opt;
    }
  }

  // Verificação de exportação: "para o exterior" MAS NÃO "exceto para o exterior"
  const isExport = (normalized.includes('para o exterior') || normalized.includes('exportacao')) &&
                   !normalized.includes('exceto para o exterior');

  // Verificação precisa de Substituição Tributária / Monofásico / Retenção
  const hasSemST = normalized.includes('sem substituicao') || 
                   normalized.includes('sem st') || 
                   normalized.includes('substituto tributario');
  const hasComST = !hasSemST && (
                   normalized.includes('com substituicao') || 
                   normalized.includes('substituido tributario') ||
                   normalized.includes('substituicao tributaria de: icms') ||
                   normalized.includes('com st'));

  const hasSemRetencao = normalized.includes('sem retencao');
  const hasComRetencao = !hasSemRetencao && normalized.includes('com retencao');

  // 3. REVENDA DE MERCADORIAS (COMÉRCIO - ANEXO I)
  if (normalized.includes('revenda') || (normalized.includes('mercadoria') && !normalized.includes('industrializad'))) {
    if (isExport) {
      return ECAC_ACTIVITY_CATALOG.find(o => o.code === 'revenda_mercadorias_exterior');
    }
    if (hasComST) {
      return ECAC_ACTIVITY_CATALOG.find(o => o.code === 'revenda_mercadorias_com_st');
    }
    return ECAC_ACTIVITY_CATALOG.find(o => o.code === 'revenda_mercadorias_sem_st');
  }

  // 4. INDÚSTRIA (PRODUTOS INDUSTRIALIZADOS - ANEXO II)
  if (normalized.includes('industrial') || normalized.includes('fabrica') || normalized.includes('anexo ii') || normalized.includes('anexo 2')) {
    if (isExport) {
      return ECAC_ACTIVITY_CATALOG.find(o => o.code === 'industria_exterior');
    }
    if (hasComST) {
      return ECAC_ACTIVITY_CATALOG.find(o => o.code === 'industria_com_st');
    }
    return ECAC_ACTIVITY_CATALOG.find(o => o.code === 'industria_sem_st');
  }

  // 5. TRANSPORTE INTERMUNICIPAL / INTERESTADUAL
  if (normalized.includes('transporte') && (normalized.includes('intermunicipal') || normalized.includes('interestadual') || normalized.includes('carga'))) {
    if (isExport) {
      return ECAC_ACTIVITY_CATALOG.find(o => o.code === 'transporte_inter_exterior');
    }
    if (hasComST || normalized.includes('subcontrat')) {
      return ECAC_ACTIVITY_CATALOG.find(o => o.code === 'transporte_inter_com_st');
    }
    return ECAC_ACTIVITY_CATALOG.find(o => o.code === 'transporte_inter_sem_st');
  }

  // 6. TRANSPORTE MUNICIPAL / COLETIVO
  if (normalized.includes('transporte coletivo') || normalized.includes('transporte municipal')) {
    if (hasComRetencao) {
      return ECAC_ACTIVITY_CATALOG.find(o => o.code === 'transporte_coletivo_municipal_com_ret');
    }
    return ECAC_ACTIVITY_CATALOG.find(o => o.code === 'transporte_coletivo_municipal_sem_ret_proprio');
  }

  // 7. CONSTRUÇÃO CIVIL
  if (normalized.includes('construcao') || normalized.includes('7.02') || normalized.includes('7.05') || normalized.includes('obras')) {
    if (normalized.includes('anexo iv') || normalized.includes('anexo 4')) {
      return ECAC_ACTIVITY_CATALOG.find(o => o.code === 'servicos_construcao_anexo4_sem_ret_proprio');
    }
    return ECAC_ACTIVITY_CATALOG.find(o => o.code === 'servicos_construcao_anexo3_sem_ret_proprio');
  }

  // 8. LOCAÇÃO DE BENS MÓVEIS
  if (normalized.includes('locacao') && (normalized.includes('bens') || normalized.includes('moveis'))) {
    if (isExport) {
      return ECAC_ACTIVITY_CATALOG.find(o => o.code === 'locacao_bens_moveis_exterior');
    }
    return ECAC_ACTIVITY_CATALOG.find(o => o.code === 'locacao_bens_moveis_exceto_exterior');
  }

  // 9. SERVIÇOS CONTÁBEIS
  if (normalized.includes('contab') && normalized.includes('fixo')) {
    return ECAC_ACTIVITY_CATALOG.find(o => o.code === 'servicos_contabeis_iss_fixo');
  }

  // 10. ANEXO IV (ADVOCACIA, VIGILÂNCIA, LIMPEZA, OBRAS)
  if (normalized.includes('anexo iv') || normalized.includes('anexo 4') || normalized.includes('advocacia') || normalized.includes('vigilancia') || normalized.includes('limpeza')) {
    if (isExport) {
      return ECAC_ACTIVITY_CATALOG.find(o => o.code === 'servicos_exterior_anexo4');
    }
    if (hasComRetencao) {
      return ECAC_ACTIVITY_CATALOG.find(o => o.code === 'servicos_anexo4_com_ret');
    }
    if (normalized.includes('outro')) {
      return ECAC_ACTIVITY_CATALOG.find(o => o.code === 'servicos_anexo4_sem_ret_outro');
    }
    return ECAC_ACTIVITY_CATALOG.find(o => o.code === 'servicos_anexo4_sem_ret_proprio');
  }

  // 11. PRESTAÇÃO DE SERVIÇOS NÃO SUJEITOS AO FATOR "R" (ANEXO III PURO)
  // IMPORTANTE: checar NÃO sujeitos ANTES de sujeitos ao Fator R!
  const isExplicitlyNaoFatorR = normalized.includes('nao sujeit') || 
                                normalized.includes('nao sujeito') ||
                                (normalized.includes('anexo iii') && !normalized.includes('sujeit ao fator'));

  if (isExplicitlyNaoFatorR) {
    if (isExport) {
      return ECAC_ACTIVITY_CATALOG.find(o => o.code === 'servicos_exterior_nao_sujeitos_fator_r_anexo3');
    }
    if (hasComRetencao) {
      return ECAC_ACTIVITY_CATALOG.find(o => o.code === 'servicos_nao_sujeitos_fator_r_anexo3_com_ret');
    }
    if (normalized.includes('outro')) {
      return ECAC_ACTIVITY_CATALOG.find(o => o.code === 'servicos_nao_sujeitos_fator_r_anexo3_sem_ret_outro');
    }
    return ECAC_ACTIVITY_CATALOG.find(o => o.code === 'servicos_nao_sujeitos_fator_r_anexo3_sem_ret_proprio');
  }

  // 12. PRESTAÇÃO DE SERVIÇOS SUJEITOS AO FATOR "R" (ANEXO III / V)
  if (normalized.includes('sujeit') && normalized.includes('fator') && normalized.includes('r')) {
    if (isExport) {
      return ECAC_ACTIVITY_CATALOG.find(o => o.code === 'servicos_exterior_sujeitos_fator_r');
    }
    if (hasComRetencao) {
      return ECAC_ACTIVITY_CATALOG.find(o => o.code === 'servicos_sujeitos_fator_r_com_ret');
    }
    if (normalized.includes('outro')) {
      return ECAC_ACTIVITY_CATALOG.find(o => o.code === 'servicos_sujeitos_fator_r_sem_ret_outro');
    }
    return ECAC_ACTIVITY_CATALOG.find(o => o.code === 'servicos_sujeitos_fator_r_sem_ret_proprio');
  }

  // 13. PRESTAÇÃO DE SERVIÇOS EM GERAL (DEFAULT ANEXO III)
  if (normalized.includes('prestacao de servicos') || normalized.includes('servico') || normalized.includes('anexo iii')) {
    if (isExport) {
      return ECAC_ACTIVITY_CATALOG.find(o => o.code === 'servicos_exterior_nao_sujeitos_fator_r_anexo3');
    }
    if (hasComRetencao) {
      return ECAC_ACTIVITY_CATALOG.find(o => o.code === 'servicos_nao_sujeitos_fator_r_anexo3_com_ret');
    }
    return ECAC_ACTIVITY_CATALOG.find(o => o.code === 'servicos_nao_sujeitos_fator_r_anexo3_sem_ret_proprio');
  }

  return undefined;
}

/**
 * Alias para compatibilidade com o parser de PDF
 */
export const matchEcacOptionFromText = findEcacOptionByText;
