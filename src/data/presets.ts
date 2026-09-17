import { CompanyData } from '../types';

export const INITIAL_EMPTY_COMPANY: CompanyData = {
  name: 'Empresa Modelo (Exemplo Completo)',
  cnpj: '12.345.678/0001-99',
  cnae: '6201-5/01',
  cnaeDescription: 'Desenvolvimento de programas de computador sob encomenda',
  uf: 'SP',
  anexo: 'V', // Pode cair pro III no Fator R
  rbt12: 1200000,
  rba: 900000,
  monthlyRevenue: 100000,
  payroll12m: 350000, // Dá Fator R > 28%
  monthlyPayroll: 29166.67,
  b2bSalesPercent: 100, // 100% B2B para Reforma Tributária
  projectionGrowthPercent: 15,
  estimatedNetProfitMargin: 35,
  targetIvaRate: 26.5,
  partners: [
    {
      id: 'socio-1',
      name: 'João Carlos da Silva',
      cpf: '111.222.333-44',
      participationPercent: 60,
      isManager: true,
      otherCompanies: [
        {
          id: 'empresa-outra-1',
          name: 'Silva Empreendimentos LTDA',
          cnpj: '99.888.777/0001-66',
          regime: 'simples',
          revenue12m: 2500000,
          participationPercent: 50,
          isManager: true
        }
      ]
    },
    {
      id: 'socio-2',
      name: 'Maria Eduarda Fernandes',
      cpf: '555.666.777-88',
      participationPercent: 40,
      isManager: false,
      otherCompanies: []
    }
  ],
  cfopItems: [
    {
      id: 'cfop-1',
      code: '5101',
      description: 'Venda de produção do estabelecimento',
      percentage: 40,
      amount: 40000,
      anexo: 'I',
      icmsTreatment: 'tributado_integral',
      issTreatment: 'nao_aplicavel',
      pisCofinsTreatment: 'tributado_integral'
    },
    {
      id: 'cfop-2',
      code: '5933',
      description: 'Prestação de serviço tributado pelo ISSQN',
      percentage: 60,
      amount: 60000,
      anexo: 'III',
      icmsTreatment: 'nao_aplicavel',
      issTreatment: 'tributado_integral',
      pisCofinsTreatment: 'tributado_integral'
    }
  ]
};

export const PRESET_COMPANIES: CompanyData[] = [INITIAL_EMPTY_COMPANY];

