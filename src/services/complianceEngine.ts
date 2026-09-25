/**
 * Motor de Regras e Auditoria Fiscal Contínua - Vértice Documentos
 */

export interface NotaParaAnalise {
  municipioEmitente?: string;
  municipioDestinatario?: string;
  ufEmitente?: string;
  ufDestinatario?: string;
  cfopPrincipal: string;
  ncm?: string;
  cstIcms?: string;
  valorTotal?: number;
}

/**
 * 1. Verifica divergência de CFOP interno vs interestadual
 */
export function verificarDivergenciaCFOP(nota: { 
  municipioEmitente?: string; 
  municipioDestinatario?: string; 
  ufEmitente?: string;
  ufDestinatario?: string;
  cfopPrincipal: string 
}) {
  const ufEmit = (nota.ufEmitente || (nota.municipioEmitente ? nota.municipioEmitente.substring(0, 2) : '')).toUpperCase();
  const ufDest = (nota.ufDestinatario || (nota.municipioDestinatario ? nota.municipioDestinatario.substring(0, 2) : '')).toUpperCase();
  const primeiroDigitoCFOP = nota.cfopPrincipal.charAt(0);

  if (ufEmit && ufDest && ufEmit === ufDest && (primeiroDigitoCFOP === '6' || primeiroDigitoCFOP === '2')) {
    return { 
      temDivergencia: true, 
      tipo: 'CFOP_INTERESTADUAL_EM_OPERACAO_INTERNA',
      alerta: 'CFOP interestadual (iniciado com 2 ou 6) utilizado em operação interna entre municípios da mesma UF.' 
    };
  }

  if (ufEmit && ufDest && ufEmit !== ufDest && (primeiroDigitoCFOP === '5' || primeiroDigitoCFOP === '1')) {
    return { 
      temDivergencia: true, 
      tipo: 'CFOP_INTERNO_EM_OPERACAO_INTERESTADUAL',
      alerta: 'CFOP interno (iniciado com 1 ou 5) utilizado em operação entre UFs distintas.' 
    };
  }

  return { temDivergencia: false };
}

/**
 * 2. Avalia evento de cancelamento posterior da SEFAZ
 */
export function avaliarStatusCancelamento(statusAtual: string, codigoEvento: string) {
  if (codigoEvento === '110111') {
    return { 
      novoStatus: 'CANCELADA' as const, 
      dispararAlertaCritico: true,
      mensagem: 'Cancelamento homologado pela SEFAZ. Estorno de créditos e débitos requerido.'
    };
  }
  return { 
    novoStatus: statusAtual, 
    dispararAlertaCritico: false 
  };
}

/**
 * 3. Identifica se o item possui Substituição Tributária (ST)
 */
export function identificarSubstituicaoTributaria(cfop: string, cstIcms?: string): boolean {
  const cfopsSt = ['1403', '2403', '5403', '5405', '6403', '6404', '1401', '2401'];
  const cstsSt = ['10', '30', '60', '70', '201', '202', '203', '500'];
  
  if (cfopsSt.includes(cfop)) return true;
  if (cstIcms && cstsSt.includes(cstIcms)) return true;
  return false;
}

/**
 * 4. Identifica produtos Monofásicos de PIS/COFINS (Combustíveis, Fármacos, Cosméticos, Autopeças, Bebidas)
 */
export function identificarMonofasico(ncm: string): boolean {
  const cleanNcm = ncm.replace(/\D/g, '');
  const prefixosMonofasicos = [
    '3003', '3004', // Medicamentos
    '3303', '3304', '3305', '3307', // Cosméticos e Perfumaria
    '8708', '4011', '4013', // Autopeças e Pneus
    '2710', '2711', // Combustíveis e Lubrificantes
    '2201', '2202', '2203' // Bebidas frias
  ];
  return prefixosMonofasicos.some(prefix => cleanNcm.startsWith(prefix));
}
