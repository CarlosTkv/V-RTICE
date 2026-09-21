import { AuthUser } from '../types';

export interface ReportSignatoryInfo {
  signatoryName: string;
  signatoryRoleTitle: string;
  signatoryDocumentLine: string;
  companyName: string;
  crcFormatted?: string;
  oabFormatted?: string;
  cnpjFormatted?: string;
  userTypeCategory: 'escritorio' | 'auditor' | 'analista' | 'contador' | 'geral';
}

export interface SecurityRecordOverride {
  auditorName?: string;
  auditorRole?: string;
  auditorDocumentLine?: string;
  crcNumber?: string;
  oabNumber?: string;
}

/**
 * Retorna as informações formatadas de chancela e assinatura do responsável técnico
 * vinculadas ao perfil e aos documentos cadastrados do usuário (Escritório, Auditor, Analista, Contador).
 */
export function getReportSignatoryInfo(
  user?: AuthUser | null,
  overrideRecord?: SecurityRecordOverride | null
): ReportSignatoryInfo {
  const name = user?.name || overrideRecord?.auditorName || 'Dr. Carlos Miguel Vieira';
  const role = (user?.role || '').toLowerCase();
  const viewMode = (user?.viewMode || '').toLowerCase();
  const companyName = user?.companyName || 'Vértice Intelligence';

  // Extração dos documentos (com fallbacks para perfis master/desenvolvedor)
  const isMasterOrDev = role === 'auditor' || role === 'desenvolvedor' || user?.isDeveloper || user?.email?.toLowerCase().includes('carlosmiguel') || user?.email?.toLowerCase().includes('vertice');

  const rawCrc = user?.crcNumber || overrideRecord?.crcNumber || (isMasterOrDev ? '1SP298341/O-8' : '');
  const rawOab = user?.oabNumber || overrideRecord?.oabNumber || (isMasterOrDev ? '412.390/SP' : '');
  const rawCnpj = user?.cnpj || user?.cpf || '';

  // Determinar a Categoria
  let category: 'escritorio' | 'auditor' | 'analista' | 'contador' | 'geral' = 'geral';

  if (role === 'escritorio' || role === 'parceiro_negocios' || viewMode === 'escritorio' || (user?.companyName && user.companyName.toLowerCase().includes('consultoria'))) {
    category = 'escritorio';
  } else if (role === 'auditor' || role === 'desenvolvedor' || role === 'master' || role === 'perito' || user?.isDeveloper || user?.isMaster) {
    category = 'auditor';
  } else if (role === 'analista' || role === 'assistente_fiscal' || role === 'operador' || viewMode === 'analista') {
    category = 'analista';
  } else if (role === 'contador_senior' || role === 'contador' || role === 'socio_empresa' || viewMode === 'contador') {
    category = 'contador';
  }

  let signatoryName = name;
  let signatoryRoleTitle = user?.technicalRoleTitle || overrideRecord?.auditorRole || '';
  let documentParts: string[] = [];

  switch (category) {
    case 'escritorio':
      signatoryName = user?.companyName || name || 'Decision Making Consultoria';
      signatoryRoleTitle = user?.technicalRoleTitle || 'Escritório Contábil Credenciado & Responsável Técnico';
      if (rawCnpj) documentParts.push(`CNPJ: ${rawCnpj}`);
      if (rawCrc) documentParts.push(`CRC PJ: ${rawCrc}`);
      if (name && name !== signatoryName) documentParts.push(`Resp.: ${name}`);
      break;

    case 'auditor':
      signatoryName = name;
      signatoryRoleTitle = user?.technicalRoleTitle || 'Auditor Fiscal Master & Perito Tributário';
      if (rawCrc) documentParts.push(`CRC: ${rawCrc}`);
      if (rawOab) documentParts.push(`OAB: ${rawOab}`);
      if (companyName) documentParts.push(companyName);
      break;

    case 'analista':
      signatoryName = name;
      signatoryRoleTitle = user?.technicalRoleTitle || 'Analista Fiscal & Consultor Tributário';
      if (rawCrc) documentParts.push(`CRC: ${rawCrc}`);
      documentParts.push(`Analista Responsável • ${companyName}`);
      break;

    case 'contador':
      signatoryName = name;
      signatoryRoleTitle = user?.technicalRoleTitle || 'Contador Responsável Técnico';
      if (rawCrc) documentParts.push(`CRC: ${rawCrc}`);
      if (companyName) documentParts.push(companyName);
      break;

    default:
      signatoryName = name;
      signatoryRoleTitle = user?.technicalRoleTitle || 'Responsável Técnico';
      if (rawCrc) documentParts.push(`CRC: ${rawCrc}`);
      if (rawOab) documentParts.push(`OAB: ${rawOab}`);
      if (companyName) documentParts.push(companyName);
      break;
  }

  let signatoryDocumentLine = documentParts.join(' • ');
  if (!signatoryDocumentLine) {
    signatoryDocumentLine = `${companyName} • Validade Jurídica Garantida`;
  }

  // Se houver override direto enviado no registro de segurança
  if (overrideRecord?.auditorDocumentLine) {
    signatoryDocumentLine = overrideRecord.auditorDocumentLine;
  }

  return {
    signatoryName,
    signatoryRoleTitle,
    signatoryDocumentLine,
    companyName,
    crcFormatted: rawCrc,
    oabFormatted: rawOab,
    cnpjFormatted: rawCnpj,
    userTypeCategory: category
  };
}
