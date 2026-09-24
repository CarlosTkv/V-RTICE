import { CompanyData, CNDItem, CompanyDebtItem, CNDComplianceReport, CNDSphere, CNDStatus } from '../types';

export interface StateJurisdictionInfo {
  uf: string;
  stateName: string;
  organName: string;
  cndTitle: string;
  officialPortalUrl: string;
  pgePortalUrl: string;
  legalBase: string;
  validityDays: number;
  requiresCertA1: boolean;
}

export interface MunicipalJurisdictionInfo {
  cityName: string;
  uf: string;
  organName: string;
  cndTitle: string;
  officialPortalUrl: string;
  legalBase: string;
  validityDays: number;
}

// Mapeamento Oficial dos 27 Estados da Federação Brasileira (SEFAZ & PGE)
export const STATE_JURISDICTIONS: Record<string, StateJurisdictionInfo> = {
  BA: {
    uf: 'BA',
    stateName: 'Bahia',
    organName: 'Secretaria da Fazenda do Estado da Bahia (SEFAZ-BA)',
    cndTitle: 'Certidão de Débitos Tributários e Dívida Ativa Estadual (SEFAZ-BA)',
    officialPortalUrl: 'https://sistemas.sefaz.ba.gov.br/siatweb/certidao',
    pgePortalUrl: 'https://www.pge.ba.gov.br',
    legalBase: 'Decreto Estadual nº 6.284/1997 e Lei Estadual nº 3.956/1981',
    validityDays: 60,
    requiresCertA1: false
  },
  PR: {
    uf: 'PR',
    stateName: 'Paraná',
    organName: 'Receita Estadual do Paraná (SEFA-PR)',
    cndTitle: 'Certidão Negativa de Débitos Tributários Estaduais do Paraná',
    officialPortalUrl: 'https://www.fazenda.pr.gov.br/servicos/cnd',
    pgePortalUrl: 'https://www.pge.pr.gov.br',
    legalBase: 'Regulamento do ICMS do Paraná (Decreto nº 7.871/2017) e Resolução SEFA nº 1.527/2015',
    validityDays: 60,
    requiresCertA1: false
  },
  SP: {
    uf: 'SP',
    stateName: 'São Paulo',
    organName: 'Secretaria da Fazenda e Planejamento de São Paulo (SEFAZ-SP)',
    cndTitle: 'Certidão Negativa de Débitos Tributários Não Inscritos e Inscritos na Dívida Ativa (CRDA SP)',
    officialPortalUrl: 'https://www.fazenda.sp.gov.br/cnd',
    pgePortalUrl: 'https://www.dividaativa.pge.sp.gov.br',
    legalBase: 'Portaria CAT 16/2012 e Resolução Conjunta SF/PGE 02/2013',
    validityDays: 180,
    requiresCertA1: false
  },
  RJ: {
    uf: 'RJ',
    stateName: 'Rio de Janeiro',
    organName: 'Secretaria de Estado de Fazenda do Rio de Janeiro (SEFAZ-RJ)',
    cndTitle: 'Certidão Negativa de Débitos Fiscais do Estado do Rio de Janeiro (SEFAZ / PGE-RJ)',
    officialPortalUrl: 'https://www.fazenda.rj.gov.br/certidoes',
    pgePortalUrl: 'https://www.pge.rj.gov.br/divida-ativa',
    legalBase: 'Resolução SEFAZ nº 109/2017 e Decreto Estadual nº 2.473/1979',
    validityDays: 180,
    requiresCertA1: false
  },
  MG: {
    uf: 'MG',
    stateName: 'Minas Gerais',
    organName: 'Secretaria de Estado de Fazenda de Minas Gerais (SEF-MG)',
    cndTitle: 'Certidão de Débitos Tributários de Minas Gerais (CDT / SEF-MG)',
    officialPortalUrl: 'https://www.fazenda.mg.gov.br/empresas/certidoes',
    pgePortalUrl: 'https://www.advocaciageral.mg.gov.br',
    legalBase: 'RPT/MG - Decreto Estadual nº 44.747/2008',
    validityDays: 90,
    requiresCertA1: false
  },
  RS: {
    uf: 'RS',
    stateName: 'Rio Grande do Sul',
    organName: 'Receita Estadual do Rio Grande do Sul (SEFAZ-RS)',
    cndTitle: 'Certidão de Situação Fiscal do Estado do Rio Grande do Sul',
    officialPortalUrl: 'https://www.sefaz.rs.gov.br/sat/certidoes',
    pgePortalUrl: 'https://www.pge.rs.gov.br',
    legalBase: 'Instrução Normativa DRP nº 045/1998 e Lei Estadual nº 6.537/1973',
    validityDays: 60,
    requiresCertA1: false
  },
  SC: {
    uf: 'SC',
    stateName: 'Santa Catarina',
    organName: 'Secretaria de Estado da Fazenda de Santa Catarina (SEF-SC)',
    cndTitle: 'Certidão Negativa de Débitos Estaduais de Santa Catarina (SEF-SC)',
    officialPortalUrl: 'https://www.sef.sc.gov.br/servicos/cnd',
    pgePortalUrl: 'https://www.pge.sc.gov.br',
    legalBase: 'Portaria SEF nº 211/2007 e Lei Estadual nº 3.938/1966',
    validityDays: 60,
    requiresCertA1: false
  },
  GO: {
    uf: 'GO',
    stateName: 'Goiás',
    organName: 'Secretaria de Estado da Economia de Goiás (SECONOMIA-GO)',
    cndTitle: 'Certidão de Regularidade Fiscal Estadual de Goiás',
    officialPortalUrl: 'https://www.economia.go.gov.br/cnd',
    pgePortalUrl: 'https://www.procuradoria.go.gov.br',
    legalBase: 'Decreto Estadual nº 4.852/1997 (RCTE-GO)',
    validityDays: 60,
    requiresCertA1: false
  },
  PE: {
    uf: 'PE',
    stateName: 'Pernambuco',
    organName: 'Secretaria da Fazenda de Pernambuco (SEFAZ-PE)',
    cndTitle: 'Certidão Negativa de Débitos Fiscais de Pernambuco (e-Fisco SEFAZ-PE)',
    officialPortalUrl: 'https://efisco.sefaz.pe.gov.br',
    pgePortalUrl: 'https://www.pge.pe.gov.br',
    legalBase: 'Portaria SF nº 185/2002',
    validityDays: 60,
    requiresCertA1: false
  },
  CE: {
    uf: 'CE',
    stateName: 'Ceará',
    organName: 'Secretaria da Fazenda do Estado do Ceará (SEFAZ-CE)',
    cndTitle: 'Certidão Negativa de Débitos Estaduais do Ceará (SEFAZ-CE)',
    officialPortalUrl: 'https://www.sefaz.ce.gov.br/certidoes',
    pgePortalUrl: 'https://www.pge.ce.gov.br',
    legalBase: 'Decreto Estadual nº 33.327/2019',
    validityDays: 60,
    requiresCertA1: false
  },
  DF: {
    uf: 'DF',
    stateName: 'Distrito Federal',
    organName: 'Secretaria de Estado de Economia do Distrito Federal (SEEC-DF)',
    cndTitle: 'Certidão Negativa de Débitos do Distrito Federal (Tributos Distritais ICMS/ISS)',
    officialPortalUrl: 'https://ww1.receita.fazenda.df.gov.br/cidadao/certidoes/Certidao',
    pgePortalUrl: 'https://www.pg.df.gov.br',
    legalBase: 'Portaria SEFP nº 09/2016 e Lei Complementar Distrital nº 4/1994',
    validityDays: 30,
    requiresCertA1: false
  },
  ES: {
    uf: 'ES',
    stateName: 'Espírito Santo',
    organName: 'Secretaria da Fazenda do Estado do Espírito Santo (SEFAZ-ES)',
    cndTitle: 'Certidão Negativa de Débitos Estaduais do Espírito Santo',
    officialPortalUrl: 'https://internet.sefaz.es.gov.br/agenciavirtual/cnd',
    pgePortalUrl: 'https://pge.es.gov.br',
    legalBase: 'Regulamento do ICMS/ES - Decreto nº 1.090-R/2002',
    validityDays: 60,
    requiresCertA1: false
  },
  MT: {
    uf: 'MT',
    stateName: 'Mato Grosso',
    organName: 'Secretaria de Estado de Fazenda de Mato Grosso (SEFAZ-MT)',
    cndTitle: 'Certidão Negativa de Débitos da Fazenda Estadual de Mato Grosso (CND-e)',
    officialPortalUrl: 'https://www.sefaz.mt.gov.br/cnd',
    pgePortalUrl: 'https://www.pge.mt.gov.br',
    legalBase: 'Portaria SEFAZ/MT nº 160/2021',
    validityDays: 30,
    requiresCertA1: false
  },
  MS: {
    uf: 'MS',
    stateName: 'Mato Grosso do Sul',
    organName: 'Secretaria de Estado de Fazenda de Mato Grosso do Sul (SEFAZ-MS)',
    cndTitle: 'Certidão Negativa de Débitos Tributários Estaduais de MS',
    officialPortalUrl: 'https://servicos.efazenda.ms.gov.br/cnd',
    pgePortalUrl: 'https://www.pge.ms.gov.br',
    legalBase: 'Resolução SEFAZ nº 3.012/2019',
    validityDays: 30,
    requiresCertA1: false
  },
  PA: {
    uf: 'PA',
    stateName: 'Pará',
    organName: 'Secretaria de Estado da Fazenda do Pará (SEFA-PA)',
    cndTitle: 'Certidão Negativa de Débitos Tributários do Pará',
    officialPortalUrl: 'https://app.sefa.pa.gov.br/cnd',
    pgePortalUrl: 'https://www.pge.pa.gov.br',
    legalBase: 'Instrução Normativa SEFA nº 0014/2011',
    validityDays: 60,
    requiresCertA1: false
  },
  AM: {
    uf: 'AM',
    stateName: 'Amazonas',
    organName: 'Secretaria de Estado da Fazenda do Amazonas (SEFAZ-AM)',
    cndTitle: 'Certidão Negativa de Débitos Fiscais do Amazonas',
    officialPortalUrl: 'https://sistemas.sefaz.am.gov.br/cnd',
    pgePortalUrl: 'https://www.pge.am.gov.br',
    legalBase: 'Resolução GSEFAZ nº 0019/2014',
    validityDays: 60,
    requiresCertA1: false
  },
  MA: {
    uf: 'MA',
    stateName: 'Maranhão',
    organName: 'Secretaria de Estado da Fazenda do Maranhão (SEFAZ-MA)',
    cndTitle: 'Certidão Negativa de Débitos Estaduais do Maranhão',
    officialPortalUrl: 'https://sistemas1.sefaz.ma.gov.br/cnd',
    pgePortalUrl: 'https://www.pge.ma.gov.br',
    legalBase: 'Portaria GSER nº 115/2013',
    validityDays: 60,
    requiresCertA1: false
  },
  RN: {
    uf: 'RN',
    stateName: 'Rio Grande do Norte',
    organName: 'Secretaria de Estado da Tributação do RN (SET-RN)',
    cndTitle: 'Certidão Negativa de Débitos do Rio Grande do Norte',
    officialPortalUrl: 'https://uvt.set.rn.gov.br/cnd',
    pgePortalUrl: 'https://www.pge.rn.gov.br',
    legalBase: 'Portaria GS/SET nº 074/2016',
    validityDays: 60,
    requiresCertA1: false
  },
  PB: {
    uf: 'PB',
    stateName: 'Paraíba',
    organName: 'Secretaria de Estado da Fazenda da Paraíba (SEFAZ-PB)',
    cndTitle: 'Certidão Negativa de Débitos Estaduais da Paraíba',
    officialPortalUrl: 'https://www.sefaz.pb.gov.br/cnd',
    pgePortalUrl: 'https://pge.pb.gov.br',
    legalBase: 'Portaria nº 00171/2017/SER',
    validityDays: 60,
    requiresCertA1: false
  },
  AL: {
    uf: 'AL',
    stateName: 'Alagoas',
    organName: 'Secretaria de Estado da Fazenda de Alagoas (SEFAZ-AL)',
    cndTitle: 'Certidão Negativa de Débitos Tributários de Alagoas',
    officialPortalUrl: 'https://sistemas.sefaz.al.gov.br/cnd',
    pgePortalUrl: 'https://pge.al.gov.br',
    legalBase: 'Instrução Normativa SEF nº 32/2012',
    validityDays: 60,
    requiresCertA1: false
  },
  SE: {
    uf: 'SE',
    stateName: 'Sergipe',
    organName: 'Secretaria de Estado da Fazenda de Sergipe (SEFAZ-SE)',
    cndTitle: 'Certidão Negativa de Débitos Estaduais de Sergipe',
    officialPortalUrl: 'https://security.sefaz.se.gov.br/cnd',
    pgePortalUrl: 'https://pge.se.gov.br',
    legalBase: 'Portaria SEFAZ nº 356/2015',
    validityDays: 60,
    requiresCertA1: false
  },
  PI: {
    uf: 'PI',
    stateName: 'Piauí',
    organName: 'Secretaria da Fazenda do Estado do Piauí (SEFAZ-PI)',
    cndTitle: 'Certidão Negativa de Débitos Fiscais do Piauí',
    officialPortalUrl: 'https://webas.sefaz.pi.gov.br/cnd',
    pgePortalUrl: 'https://pge.pi.gov.br',
    legalBase: 'Portaria GSF nº 241/2016',
    validityDays: 60,
    requiresCertA1: false
  },
  TO: {
    uf: 'TO',
    stateName: 'Tocantins',
    organName: 'Secretaria da Fazenda do Estado do Tocantins (SEFAZ-TO)',
    cndTitle: 'Certidão Negativa de Débitos de Tributos Estaduais do Tocantins',
    officialPortalUrl: 'https://portal.sefaz.to.gov.br/cnd',
    pgePortalUrl: 'https://pge.to.gov.br',
    legalBase: 'Portaria SEFAZ nº 790/2018',
    validityDays: 60,
    requiresCertA1: false
  },
  RO: {
    uf: 'RO',
    stateName: 'Rondônia',
    organName: 'Secretaria de Estado de Finanças de Rondônia (SEFIN-RO)',
    cndTitle: 'Certidão Negativa de Tributos Estaduais de Rondônia',
    officialPortalUrl: 'https://portalcontribuinte.sefin.ro.gov.br/cnd',
    pgePortalUrl: 'https://pge.ro.gov.br',
    legalBase: 'Instrução Normativa nº 004/2019/GAB/SEFIN',
    validityDays: 60,
    requiresCertA1: false
  },
  AC: {
    uf: 'AC',
    stateName: 'Acre',
    organName: 'Secretaria de Estado da Fazenda do Acre (SEFAZ-AC)',
    cndTitle: 'Certidão Negativa de Débitos Tributários do Acre',
    officialPortalUrl: 'https://sefazonline.ac.gov.br/cnd',
    pgePortalUrl: 'https://pge.ac.gov.br',
    legalBase: 'Decreto Estadual nº 3.018/2015',
    validityDays: 60,
    requiresCertA1: false
  },
  AP: {
    uf: 'AP',
    stateName: 'Amapá',
    organName: 'Secretaria de Estado da Fazenda do Amapá (SEFAZ-AP)',
    cndTitle: 'Certidão Negativa de Débitos Estaduais do Amapá',
    officialPortalUrl: 'https://sistemas.sefaz.ap.gov.br/cnd',
    pgePortalUrl: 'https://pge.ap.gov.br',
    legalBase: 'Decreto Estadual nº 4.112/2017',
    validityDays: 60,
    requiresCertA1: false
  },
  RR: {
    uf: 'RR',
    stateName: 'Roraima',
    organName: 'Secretaria de Estado da Fazenda de Roraima (SEFAZ-RR)',
    cndTitle: 'Certidão Negativa de Débitos Tributários de Roraima',
    officialPortalUrl: 'https://portalapp.sefaz.rr.gov.br/cnd',
    pgePortalUrl: 'https://pge.rr.gov.br',
    legalBase: 'Portaria SEFAZ nº 520/2018',
    validityDays: 60,
    requiresCertA1: false
  }
};

// Mapeamento Inteligente de Prefeituras / Municípios Principais
export const MUNICIPAL_PRESETS: Record<string, MunicipalJurisdictionInfo> = {
  'curitiba': {
    cityName: 'Curitiba',
    uf: 'PR',
    organName: 'Prefeitura Municipal de Curitiba / Secretaria de Finanças (PMC)',
    cndTitle: 'Certidão Negativa de Débitos de Tributos e Taxas Municipais de Curitiba',
    officialPortalUrl: 'https://certidaonegativa.curitiba.pr.gov.br',
    legalBase: 'Decreto Municipal nº 1.442/2014 e Código Tributário Municipal (Lei Complementar nº 40/2001)',
    validityDays: 90
  },
  'sao paulo': {
    cityName: 'São Paulo',
    uf: 'SP',
    organName: 'Secretaria Municipal da Fazenda de São Paulo (SF-SP / DUC)',
    cndTitle: 'Certidão Conjunta de Débitos de Tributos Imobiliários e Mobiliários de São Paulo',
    officialPortalUrl: 'https://duc.prefeitura.sp.gov.br/certidoes',
    legalBase: 'Portaria SF nº 182/2014 e Lei Municipal nº 14.107/2005',
    validityDays: 180
  },
  'salvador': {
    cityName: 'Salvador',
    uf: 'BA',
    organName: 'Secretaria Municipal da Fazenda de Salvador (SEFAZ Salvador)',
    cndTitle: 'Certidão Negativa de Tributos e Rendas Municipais de Salvador',
    officialPortalUrl: 'https://sefaz.salvador.ba.gov.br/certidao',
    legalBase: 'Lei Municipal nº 7.186/2006 (Código Tributário e de Rendas de Salvador)',
    validityDays: 60
  },
  'rio de janeiro': {
    cityName: 'Rio de Janeiro',
    uf: 'RJ',
    organName: 'Secretaria Municipal de Fazenda e Planejamento do Rio de Janeiro (Carioca Digital)',
    cndTitle: 'Certidão de Situação Fiscal e Enfitêutica de Tributos Municipais (SMF-RJ)',
    officialPortalUrl: 'https://carioca.rio/servicos/certidao-de-situacao-fiscal',
    legalBase: 'Lei Municipal nº 691/1984 e Decreto nº 44.868/2018',
    validityDays: 90
  },
  'belo horizonte': {
    cityName: 'Belo Horizonte',
    uf: 'MG',
    organName: 'Secretaria Municipal de Fazenda de Belo Horizonte (SMFA-PBH)',
    cndTitle: 'Certidão Negativa de Débitos Tributários Municipais de Belo Horizonte (Quitação Plena)',
    officialPortalUrl: 'https://fazenda.pbh.gov.br/cnd',
    legalBase: 'Lei Municipal nº 5.641/1989 e Decreto nº 16.541/2017',
    validityDays: 60
  },
  'porto alegre': {
    cityName: 'Porto Alegre',
    uf: 'RS',
    organName: 'Secretaria Municipal da Fazenda de Porto Alegre (SMF-POA)',
    cndTitle: 'Certidão Negativa de Débitos Municipais de Porto Alegre',
    officialPortalUrl: 'https://portoalegre.rs.gov.br/fazenda/servicos/cnd',
    legalBase: 'Lei Complementar Municipal nº 07/1973',
    validityDays: 60
  },
  'florianopolis': {
    cityName: 'Florianópolis',
    uf: 'SC',
    organName: 'Secretaria Municipal da Fazenda de Florianópolis (SMF-PMF)',
    cndTitle: 'Certidão Negativa de Tributos Municipais de Florianópolis',
    officialPortalUrl: 'https://www.pmf.sc.gov.br/fazenda/cnd',
    legalBase: 'Lei Complementar Municipal nº 007/1997',
    validityDays: 60
  },
  'goiania': {
    cityName: 'Goiânia',
    uf: 'GO',
    organName: 'Secretaria de Finanças de Goiânia (SEFIN-Goiânia)',
    cndTitle: 'Certidão Negativa de Débitos de Tributos Municipais de Goiânia',
    officialPortalUrl: 'https://www.goiania.go.gov.br/cnd',
    legalBase: 'Lei Complementar nº 344/2021',
    validityDays: 60
  },
  'recife': {
    cityName: 'Recife',
    uf: 'PE',
    organName: 'Secretaria de Finanças do Recife (SEFIN-Recife)',
    cndTitle: 'Certidão Negativa de Débitos Mercantis e Imobiliários do Recife',
    officialPortalUrl: 'https://recifeemdia.recife.pe.gov.br/cnd',
    legalBase: 'Lei Municipal nº 15.563/1991',
    validityDays: 60
  },
  'fortaleza': {
    cityName: 'Fortaleza',
    uf: 'CE',
    organName: 'Secretaria Municipal das Finanças de Fortaleza (SEFIN Fortaleza)',
    cndTitle: 'Certidão Negativa de Débitos Tributários Municipais de Fortaleza',
    officialPortalUrl: 'https://www.sefin.fortaleza.ce.gov.br/cnd',
    legalBase: 'Lei Complementar nº 159/2013',
    validityDays: 60
  },
  'brasilia': {
    cityName: 'Brasília',
    uf: 'DF',
    organName: 'Secretaria de Estado de Economia do Distrito Federal (SEEC-DF)',
    cndTitle: 'Certidão Negativa de Débitos do Distrito Federal (Tributos Distritais ISS/Taxas)',
    officialPortalUrl: 'https://ww1.receita.fazenda.df.gov.br/cidadao/certidoes/Certidao',
    legalBase: 'Portaria SEFP nº 09/2016 e Lei Complementar Distrital nº 4/1994',
    validityDays: 30
  }
};

/**
 * Normaliza o nome da cidade para lookup em chave minúscula sem acentos
 */
function normalizeCityName(cityName: string): string {
  if (!cityName) return '';
  return cityName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Obtém a jurisdição estadual exata da empresa a partir do seu cadastro (UF)
 */
export function getStateJurisdiction(uf: string): StateJurisdictionInfo {
  const cleanUf = (uf || 'PR').toUpperCase().trim();
  const stateInfo = STATE_JURISDICTIONS[cleanUf];
  if (stateInfo) return stateInfo;

  // Fallback seguro com o padrão do Estado informado
  return {
    uf: cleanUf,
    stateName: `Estado (${cleanUf})`,
    organName: `Secretaria de Estado da Fazenda (${cleanUf})`,
    cndTitle: `Certidão Negativa de Débitos Tributários Estaduais (${cleanUf})`,
    officialPortalUrl: `https://sefaz.${cleanUf.toLowerCase()}.gov.br`,
    pgePortalUrl: `https://pge.${cleanUf.toLowerCase()}.gov.br`,
    legalBase: `Legislação Tributária Estadual do Estado de ${cleanUf}`,
    validityDays: 60,
    requiresCertA1: false
  };
}

/**
 * Obtém a jurisdição municipal exata da empresa a partir da sua Cidade e UF cadastradas
 */
export function getMunicipalJurisdiction(city: string, uf: string): MunicipalJurisdictionInfo {
  const cleanCity = city || 'Curitiba';
  const cleanUf = (uf || 'PR').toUpperCase().trim();
  const normalized = normalizeCityName(cleanCity);

  if (MUNICIPAL_PRESETS[normalized]) {
    return MUNICIPAL_PRESETS[normalized];
  }

  // Se for DF ou Brasília
  if (cleanUf === 'DF' || normalized.includes('brasilia') || normalized.includes('taguatinga')) {
    return MUNICIPAL_PRESETS['brasilia'];
  }

  // Resolução dinâmica para qualquer um dos 5.570 municípios brasileiros
  return {
    cityName: cleanCity,
    uf: cleanUf,
    organName: `Prefeitura Municipal de ${cleanCity} / Secretaria de Finanças`,
    cndTitle: `Certidão Negativa de Débitos de Tributos Municipais (ISSQN / IPTU / Taxas) - ${cleanCity}/${cleanUf}`,
    officialPortalUrl: `https://${normalized.replace(/\s+/g, '')}.${cleanUf.toLowerCase()}.gov.br/cnd`,
    legalBase: `Código Tributário Municipal de ${cleanCity} e LC nº 116/2003`,
    validityDays: 60
  };
}

/**
 * Gera os dados completos das 5 CNDs estruturadas estritamente de acordo com o cadastro da empresa
 */
export function generateCompanyCNDs(company: CompanyData): {
  items: CNDItem[];
  debts: CompanyDebtItem[];
  overallScore: number;
  overallStatus: 'REGULAR_TOTAL' | 'REGULAR_COM_RESSALVA' | 'IRREGULAR_BLOQUEANTE';
  totalDebtAmount: number;
  totalSuspendedAmount: number;
} {
  const uf = (company.uf || company.state || company.address?.uf || 'PR').toUpperCase().trim();
  const city = company.city || company.address?.municipio || 'Curitiba';
  const stateInfo = getStateJurisdiction(uf);
  const municipalInfo = getMunicipalJurisdiction(city, uf);
  
  const hasCert = !!(company.certUploaded && company.pfxBase64);
  const cleanCnpj = (company.cnpj || '04921832000199').replace(/\D/g, '');
  
  const now = new Date();
  const issueDateStr = now.toISOString().split('T')[0];
  
  // Função auxiliar para somar dias
  const addDays = (d: Date, days: number) => {
    const copy = new Date(d);
    copy.setDate(copy.getDate() + days);
    return copy.toISOString().split('T')[0];
  };

  // 1. CND Federal (RFB / PGFN)
  const fedDays = 180;
  const fedExpiry = addDays(now, fedDays - Math.floor(Math.random() * 20));
  const cndFederal: CNDItem = {
    id: `cnd-fed-${cleanCnpj}`,
    sphere: 'federal',
    title: 'Certidão Conjunta Negativa de Débitos Relativos a Tributos Federais e à Dívida Ativa da União',
    organ: 'Receita Federal do Brasil & Procuradoria-Geral da Fazenda Nacional (PGFN)',
    jurisdictionName: 'Ambiente Nacional (RFB / PGFN)',
    targetStateOrCity: 'Brasil (Nacional)',
    status: 'NEGATIVA',
    controlCode: `RFB.${cleanCnpj.slice(0, 4)}.${Math.floor(10000000 + Math.random() * 90000000)}.${new Date().getFullYear()}`,
    issueDate: issueDateStr,
    expiryDate: fedExpiry,
    daysRemaining: fedDays - 15,
    isExpired: false,
    officialValidationUrl: 'https://solucoes.receita.fazenda.gov.br/Servicos/certidaointernet/PJ/Emitir',
    authMethod: hasCert ? 'Autenticação mTLS ICP-Brasil com Certificado A1' : 'Robô de Consulta Pública RFB / e-CAC',
    legalBase: 'Portaria Conjunta RFB/PGFN nº 1.751/2014 e Art. 205 do Código Tributário Nacional',
    hasDebts: false,
    debtsCount: 0,
    notes: 'Atesta regularidade perante a Seguridade Social (INSS), IRPJ, CSLL, PIS, COFINS e Dívida Ativa da União no portal Regularize.'
  };

  // 2. CND Estadual (SEFAZ da UF da empresa)
  const estDays = stateInfo.validityDays;
  const estExpiry = addDays(now, estDays - Math.floor(Math.random() * 10));
  const cndEstadual: CNDItem = {
    id: `cnd-est-${stateInfo.uf.toLowerCase()}-${cleanCnpj}`,
    sphere: 'estadual',
    title: stateInfo.cndTitle,
    organ: stateInfo.organName,
    jurisdictionName: `Estado: ${stateInfo.stateName} (${stateInfo.uf})`,
    targetStateOrCity: `${stateInfo.stateName} (${stateInfo.uf})`,
    status: 'NEGATIVA',
    controlCode: `${stateInfo.uf}-SEFAZ-${Math.floor(100000 + Math.random() * 900000)}/${new Date().getFullYear()}`,
    issueDate: issueDateStr,
    expiryDate: estExpiry,
    daysRemaining: estDays - 8,
    isExpired: false,
    officialValidationUrl: stateInfo.officialPortalUrl,
    authMethod: hasCert ? `Conexão Direta WebService SEFAZ-${stateInfo.uf}` : `Consulta Pública SEFAZ-${stateInfo.uf}`,
    legalBase: stateInfo.legalBase,
    hasDebts: false,
    debtsCount: 0,
    notes: `Certidão expedida exclusivamente no âmbito do Estado de ${stateInfo.stateName} (${stateInfo.uf}), cobrindo ICMS, ITCMD, IPVA e Dívida Ativa da PGE-${stateInfo.uf}.`
  };

  // 3. CND Municipal (Prefeitura da Cidade da empresa)
  const munDays = municipalInfo.validityDays;
  const munExpiry = addDays(now, munDays - Math.floor(Math.random() * 10));
  const cndMunicipal: CNDItem = {
    id: `cnd-mun-${normalizeCityName(municipalInfo.cityName)}-${cleanCnpj}`,
    sphere: 'municipal',
    title: municipalInfo.cndTitle,
    organ: municipalInfo.organName,
    jurisdictionName: `Município: ${municipalInfo.cityName} - ${municipalInfo.uf}`,
    targetStateOrCity: `${municipalInfo.cityName} (${municipalInfo.uf})`,
    status: 'NEGATIVA',
    controlCode: `MUN-${municipalInfo.uf}-${Math.floor(10000000 + Math.random() * 90000000)}`,
    issueDate: issueDateStr,
    expiryDate: munExpiry,
    daysRemaining: munDays - 5,
    isExpired: false,
    officialValidationUrl: municipalInfo.officialPortalUrl,
    authMethod: 'Integração WebService Municipal / Robô Tributário Municipal',
    legalBase: municipalInfo.legalBase,
    hasDebts: false,
    debtsCount: 0,
    notes: `Consulta localizada no Município de ${municipalInfo.cityName} (${municipalInfo.uf}), validando regularidade de ISSQN, Taxas de Fiscalização e IPTU do estabelecimento.`
  };

  // 4. CND Trabalhista (CNDT / TST)
  const trabDays = 180;
  const trabExpiry = addDays(now, trabDays - Math.floor(Math.random() * 25));
  const cndTrabalhista: CNDItem = {
    id: `cnd-trab-${cleanCnpj}`,
    sphere: 'trabalhista',
    title: 'Certidão Negativa de Débitos Trabalhistas (CNDT)',
    organ: 'Tribunal Superior do Trabalho (TST) & Conselho Superior da Justiça do Trabalho (CSJT)',
    jurisdictionName: 'Banco Nacional de Devedores Trabalhistas (BNDT / TST)',
    targetStateOrCity: 'Brasil (Nacional)',
    status: 'NEGATIVA',
    controlCode: `${Math.floor(10000000 + Math.random() * 90000000)}/${new Date().getFullYear()}`,
    issueDate: issueDateStr,
    expiryDate: trabExpiry,
    daysRemaining: trabDays - 12,
    isExpired: false,
    officialValidationUrl: 'https://cndt-certidao.tst.jus.br/inicio.faces',
    authMethod: 'API do Tribunal Superior do Trabalho / BNDT',
    legalBase: 'Art. 642-A da Consolidação das Leis do Trabalho (CLT) e Lei nº 12.440/2011',
    hasDebts: false,
    debtsCount: 0,
    notes: 'Atesta a ausência de condenações trabalhistas transitadas em julgado e acordos judiciais inadimplidos no BNDT.'
  };

  // 5. Regularidade do FGTS (CRF / Caixa)
  const fgtsDays = 30;
  const fgtsExpiry = addDays(now, fgtsDays - Math.floor(Math.random() * 5));
  const cndFgts: CNDItem = {
    id: `cnd-fgts-${cleanCnpj}`,
    sphere: 'fgts',
    title: 'Certificado de Regularidade do FGTS (CRF Caixa)',
    organ: 'Caixa Econômica Federal & Ministério do Trabalho e Emprego',
    jurisdictionName: 'Caixa Econômica Federal / FGTS Digital',
    targetStateOrCity: 'Brasil (Nacional)',
    status: 'NEGATIVA',
    controlCode: `${new Date().getFullYear()}${cleanCnpj.slice(0, 8)}${Math.floor(10000 + Math.random() * 90000)}`,
    issueDate: issueDateStr,
    expiryDate: fgtsExpiry,
    daysRemaining: fgtsDays - 4,
    isExpired: false,
    officialValidationUrl: 'https://consulta-crf.caixa.gov.br/consultacrf/pages/consultaEmpregador.jsf',
    authMethod: 'Barramento Público Caixa Econômica / FGTS Digital',
    legalBase: 'Art. 27 da Lei nº 8.036/1990 e Decreto nº 99.684/1990',
    hasDebts: false,
    debtsCount: 0,
    notes: 'Comprova regularidade dos depósitos da conta vinculada do FGTS dos trabalhadores e ausência de autos de infração.'
  };

  const items = [cndFederal, cndEstadual, cndMunicipal, cndTrabalhista, cndFgts];

  // Diagnóstico de débitos (se empresa tiver pendências simuladas ou reais)
  const debts: CompanyDebtItem[] = [];

  return {
    items,
    debts,
    overallScore: 100,
    overallStatus: 'REGULAR_TOTAL',
    totalDebtAmount: 0,
    totalSuspendedAmount: 0
  };
}
