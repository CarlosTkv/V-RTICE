export interface SimplesBracket {
  limit: number;
  rate: number;
  deduction: number;
}

export const SIMPLES_TABLES: Record<'I' | 'II' | 'III' | 'IV' | 'V', SimplesBracket[]> = {
  I: [
    { limit: 180000, rate: 0.040, deduction: 0 },
    { limit: 360000, rate: 0.073, deduction: 5940 },
    { limit: 720000, rate: 0.095, deduction: 13860 },
    { limit: 1800000, rate: 0.107, deduction: 22500 },
    { limit: 3600000, rate: 0.143, deduction: 87300 },
    { limit: 4800000, rate: 0.190, deduction: 378000 }
  ],
  II: [
    { limit: 180000, rate: 0.045, deduction: 0 },
    { limit: 360000, rate: 0.078, deduction: 5940 },
    { limit: 720000, rate: 0.100, deduction: 13860 },
    { limit: 1800000, rate: 0.112, deduction: 22500 },
    { limit: 3600000, rate: 0.147, deduction: 85500 },
    { limit: 4800000, rate: 0.300, deduction: 720000 }
  ],
  III: [
    { limit: 180000, rate: 0.060, deduction: 0 },
    { limit: 360000, rate: 0.112, deduction: 9360 },
    { limit: 720000, rate: 0.135, deduction: 17640 },
    { limit: 1800000, rate: 0.160, deduction: 35640 },
    { limit: 3600000, rate: 0.210, deduction: 125640 },
    { limit: 4800000, rate: 0.330, deduction: 648000 }
  ],
  IV: [
    { limit: 180000, rate: 0.045, deduction: 0 },
    { limit: 360000, rate: 0.090, deduction: 8100 },
    { limit: 720000, rate: 0.102, deduction: 12420 },
    { limit: 1800000, rate: 0.140, deduction: 39780 },
    { limit: 3600000, rate: 0.220, deduction: 183780 },
    { limit: 4800000, rate: 0.330, deduction: 828000 }
  ],
  V: [
    { limit: 180000, rate: 0.155, deduction: 0 },
    { limit: 360000, rate: 0.180, deduction: 4500 },
    { limit: 720000, rate: 0.195, deduction: 9900 },
    { limit: 1800000, rate: 0.205, deduction: 17100 },
    { limit: 3600000, rate: 0.230, deduction: 62100 },
    { limit: 4800000, rate: 0.305, deduction: 540000 }
  ]
};
