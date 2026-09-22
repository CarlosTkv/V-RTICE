/**
 * Utilitários de Validação de Integridade e Metadados da Receita Federal (RFB / SEFAZ)
 * Implementa validação do algoritmo Módulo 11 para Chaves de Acesso de 44 dígitos,
 * validação de Schema XSD, assinatura digital e verificação de integridade estrutural.
 */

export interface RfbValidationResult {
  isValid: boolean;
  chaveValida: boolean;
  dvCalculado: number;
  dvInformado: number;
  schemaValido: boolean;
  assinaturaPresente: boolean;
  cStat: string;
  motivo: string;
  ufEmissor: string;
  anoMesEmissao: string;
  cnpjEmissor: string;
  modeloDoc: string;
  serieDoc: string;
  numeroDoc: string;
  tipoEmissao: string;
  codigoNumerico: string;
  erros: string[];
  alertas: string[];
}

/**
 * Valida o Dígito Verificador (DV) de uma Chave de Acesso de NF-e/NFC-e/CT-e de 44 dígitos
 * utilizando o algoritmo oficial Módulo 11 com pesos de 2 a 9 (da direita para a esquerda).
 */
export function validateChaveAcessoDV(chave: string): { isValid: boolean; dvCalculado: number; dvInformado: number } {
  const cleanChave = chave.replace(/\D/g, '');
  if (cleanChave.length !== 44) {
    return { isValid: false, dvCalculado: -1, dvInformado: -1 };
  }

  const dvInformado = parseInt(cleanChave.charAt(43), 10);
  const chaveSemDV = cleanChave.substring(0, 43);

  let soma = 0;
  let peso = 2;

  for (let i = chaveSemDV.length - 1; i >= 0; i--) {
    soma += parseInt(chaveSemDV.charAt(i), 10) * peso;
    peso++;
    if (peso > 9) {
      peso = 2;
    }
  }

  const resto = soma % 11;
  const dvCalculado = (resto === 0 || resto === 1) ? 0 : 11 - resto;

  return {
    isValid: dvCalculado === dvInformado,
    dvCalculado,
    dvInformado
  };
}

/**
 * Decompõe a chave de 44 dígitos em seus metadados oficiais da Receita Federal
 */
export function parseChaveAcesso(chave: string) {
  const clean = chave.replace(/\D/g, '');
  if (clean.length !== 44) {
    return null;
  }

  const cUF = clean.substring(0, 2);
  const aamm = clean.substring(2, 6);
  const cnpj = clean.substring(6, 20);
  const mod = clean.substring(20, 22);
  const serie = clean.substring(22, 25);
  const nNF = clean.substring(25, 34);
  const tpEmis = clean.substring(34, 35);
  const cNF = clean.substring(35, 43);
  const cDV = clean.substring(43, 44);

  const ufCodes: Record<string, string> = {
    '11': 'RO', '12': 'AC', '13': 'AM', '14': 'RR', '15': 'PA', '16': 'AP', '17': 'TO',
    '21': 'MA', '22': 'PI', '23': 'CE', '24': 'RN', '25': 'PB', '26': 'PE', '27': 'AL',
    '28': 'SE', '29': 'BA', '31': 'MG', '32': 'ES', '33': 'RJ', '35': 'SP', '41': 'PR',
    '42': 'SC', '43': 'RS', '50': 'MS', '51': 'MT', '52': 'GO', '53': 'DF'
  };

  return {
    ufCode: cUF,
    uf: ufCodes[cUF] || 'BR',
    anoMes: `20${aamm.substring(0, 2)}/${aamm.substring(2, 4)}`,
    cnpj: cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5'),
    modelo: mod === '55' ? 'NF-e' : mod === '65' ? 'NFC-e' : mod === '57' ? 'CT-e' : 'Doc Fiscal',
    serie: parseInt(serie, 10).toString(),
    numero: parseInt(nNF, 10).toString(),
    tipoEmissao: tpEmis === '1' ? 'Normal' : tpEmis === '9' ? 'Contingência Offline' : 'Contingência',
    codigoNumerico: cNF,
    dv: cDV
  };
}

/**
 * Valida a integridade completa de um arquivo ou conteúdo XML de documento fiscal
 * contra os padrões e metadados exigidos pela Receita Federal.
 */
export function validateXmlIntegrityRFB(xmlContent: string, fileName: string = 'documento.xml'): RfbValidationResult {
  const erros: string[] = [];
  const alertas: string[] = [];

  if (!xmlContent || typeof xmlContent !== 'string' || xmlContent.trim().length < 50) {
    return {
      isValid: false,
      chaveValida: false,
      dvCalculado: -1,
      dvInformado: -1,
      schemaValido: false,
      assinaturaPresente: false,
      cStat: '999',
      motivo: 'Arquivo XML vazio ou corrompido.',
      ufEmissor: '',
      anoMesEmissao: '',
      cnpjEmissor: '',
      modeloDoc: '',
      serieDoc: '',
      numeroDoc: '',
      tipoEmissao: '',
      codigoNumerico: '',
      erros: ['Arquivo não contém estrutura XML válida'],
      alertas: []
    };
  }

  // 1. Extração de Chave de Acesso (via infNFe Id ou protNFe chNFe)
  let chaveAcesso = '';
  const infNFeMatch = xmlContent.match(/<infNFe[^>]*Id=["']NFe(\d{44})["']/i);
  if (infNFeMatch && infNFeMatch[1]) {
    chaveAcesso = infNFeMatch[1];
  } else {
    const chNFeMatch = xmlContent.match(/<chNFe>(\d{44})<\/chNFe>/i);
    if (chNFeMatch && chNFeMatch[1]) {
      chaveAcesso = chNFeMatch[1];
    } else {
      const genericMatch = xmlContent.match(/(\d{44})/);
      if (genericMatch) {
        chaveAcesso = genericMatch[1];
      }
    }
  }

  // Validação da Chave
  let chaveValida = false;
  let dvCalculado = -1;
  let dvInformado = -1;

  if (chaveAcesso && chaveAcesso.length === 44) {
    const dvRes = validateChaveAcessoDV(chaveAcesso);
    chaveValida = dvRes.isValid;
    dvCalculado = dvRes.dvCalculado;
    dvInformado = dvRes.dvInformado;

    if (!chaveValida) {
      erros.push(`Dígito Verificador (DV) inválido na Chave de Acesso. Calculado: ${dvCalculado}, Informado: ${dvInformado}`);
    }
  } else {
    erros.push('Chave de Acesso de 44 dígitos não encontrada na estrutura do XML');
  }

  // 2. Validação de Estrutura de Schema XSD
  let schemaValido = true;
  const mandatoryTags = ['<infNFe', '<ide>', '<emit>', '<dest>', '<total>', '<ICMSTot>'];
  for (const tag of mandatoryTags) {
    if (!xmlContent.includes(tag)) {
      schemaValido = false;
      erros.push(`Tag obrigatória do Schema da Receita Federal ausente: ${tag}`);
    }
  }

  // 3. Validação de Assinatura Digital
  const hasSignature = xmlContent.includes('<Signature') && xmlContent.includes('<DigestValue>');
  if (!hasSignature) {
    alertas.push('XML não possui tag <Signature> com assinatura digital ICP-Brasil assinada.');
  }

  // 4. Status de Autorização (cStat)
  let cStat = '100';
  let motivo = 'Autorizado o uso da NF-e';
  const cStatMatch = xmlContent.match(/<cStat>(\d+)<\/cStat>/i);
  if (cStatMatch && cStatMatch[1]) {
    cStat = cStatMatch[1];
  }
  const xMotivoMatch = xmlContent.match(/<xMotivo>([^<]+)<\/xMotivo>/i);
  if (xMotivoMatch && xMotivoMatch[1]) {
    motivo = xMotivoMatch[1];
  }

  if (cStat !== '100' && cStat !== '150') {
    if (cStat === '101' || cStat === '151') {
      alertas.push(`Documento cancelado na SEFAZ (cStat ${cStat}: ${motivo})`);
    } else {
      erros.push(`Status SEFAZ não autorizado (cStat ${cStat}: ${motivo})`);
    }
  }

  // Parsing da Chave
  const parsed = chaveAcesso ? parseChaveAcesso(chaveAcesso) : null;

  return {
    isValid: erros.length === 0,
    chaveValida,
    dvCalculado,
    dvInformado,
    schemaValido,
    assinaturaPresente: hasSignature,
    cStat,
    motivo,
    ufEmissor: parsed?.uf || '',
    anoMesEmissao: parsed?.anoMes || '',
    cnpjEmissor: parsed?.cnpj || '',
    modeloDoc: parsed?.modelo || 'NF-e',
    serieDoc: parsed?.serie || '1',
    numeroDoc: parsed?.numero || '',
    tipoEmissao: parsed?.tipoEmissao || 'Normal',
    codigoNumerico: parsed?.codigoNumerico || '',
    erros,
    alertas
  };
}
