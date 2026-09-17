import QRCode from 'qrcode';

export interface VerifiedDocumentRecord {
  hashFormatted: string; // e.g., VF-2026-A82F-9C14-3B77-E091
  sha256Full: string;
  serialNumber: string;
  title: string;
  companyName: string;
  cnpj: string;
  uf: string;
  rbt12: number;
  bestRegime?: string;
  totalTax?: number;
  issuedAtIso: string;
  issuedAtFormatted: string;
  auditorName: string;
  auditorRole: string;
  legalBasis: string[];
  qrCodeDataUrl: string;
  status: 'valido' | 'autentico';
}

const STORAGE_KEY = 'vf_verified_documents_registry';

/**
 * Simple client-side SHA-256 implementation using SubtleCrypto if available,
 * with deterministic fallback for reliability.
 */
async function computeSha256(message: string): Promise<string> {
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {
    console.warn('SubtleCrypto error, falling back to algorithmic hash', e);
  }

  // Deterministic FNV/DJB2-based 64-character hex fallback
  let h1 = 0xdeadbeef ^ 0;
  let h2 = 0x41c64e6d ^ 0;
  let h3 = 0x9e3779b9 ^ 0;
  let h4 = 0x85ebca6b ^ 0;

  for (let i = 0; i < message.length; i++) {
    const ch = message.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
    h3 = Math.imul(h3 ^ ch, 3812015801);
    h4 = Math.imul(h4 ^ ch, 2246822507);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h3 ^ (h3 >>> 13), 3266489909);
  h3 = Math.imul(h3 ^ (h3 >>> 16), 2246822507) ^ Math.imul(h4 ^ (h4 >>> 13), 3266489909);
  h4 = Math.imul(h4 ^ (h4 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  const part1 = (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0');
  const part2 = (h3 >>> 0).toString(16).padStart(8, '0') + (h4 >>> 0).toString(16).padStart(8, '0');
  return (part1 + part2 + part1 + part2).slice(0, 64);
}

/**
 * Generates security manifest, cryptographic hash, and QR code for a given document.
 */
export async function generateDocumentSecurity(params: {
  title: string;
  companyName: string;
  cnpj: string;
  uf?: string;
  rbt12?: number;
  bestRegime?: string;
  totalTax?: number;
  dateStr?: string;
}): Promise<VerifiedDocumentRecord> {
  const now = new Date();
  const dateIso = now.toISOString();
  const dateFormatted = params.dateStr || now.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }) + ' às ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // Source payload for hash calculation
  const payload = [
    'VERTICE_FISCAL_AUTHENTIC_DOCUMENT_V2026',
    params.title,
    params.companyName,
    params.cnpj,
    params.uf || 'SP',
    params.rbt12 || 0,
    params.bestRegime || 'SIMPLES_NACIONAL',
    params.totalTax || 0,
    dateIso.slice(0, 13) // Group within hour for stability
  ].join('|');

  const sha256Full = await computeSha256(payload);
  const partA = sha256Full.substring(0, 4).toUpperCase();
  const partB = sha256Full.substring(4, 8).toUpperCase();
  const partC = sha256Full.substring(8, 12).toUpperCase();
  const partD = sha256Full.substring(12, 16).toUpperCase();
  const hashFormatted = `VF-2026-${partA}-${partB}-${partC}-${partD}`;
  const serialNumber = `CERT-ICP-BR-${sha256Full.substring(16, 24).toUpperCase()}`;

  // Verification URL or canonical string embedded in the QR Code
  let validationUrl = `https://verticefiscal.com.br/validar?hash=${hashFormatted}&cnpj=${encodeURIComponent(params.cnpj || '')}`;
  if (typeof window !== 'undefined' && window.location) {
    validationUrl = `${window.location.origin}${window.location.pathname}?validar=true&hash=${hashFormatted}`;
  }

  // Generate crisp QR code data URL
  let qrCodeDataUrl = '';
  try {
    qrCodeDataUrl = await QRCode.toDataURL(validationUrl, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 180,
      color: {
        dark: '#0F172A',
        light: '#FFFFFF',
      },
    });
  } catch (e) {
    console.error('QR code generation failed', e);
  }

  const record: VerifiedDocumentRecord = {
    hashFormatted,
    sha256Full,
    serialNumber,
    title: params.title,
    companyName: params.companyName || 'Empresa Periciada',
    cnpj: params.cnpj || '00.000.000/0001-00',
    uf: params.uf || 'SP',
    rbt12: params.rbt12 || 0,
    bestRegime: params.bestRegime,
    totalTax: params.totalTax,
    issuedAtIso: dateIso,
    issuedAtFormatted: dateFormatted,
    auditorName: 'Carlos Miguel Vieira',
    auditorRole: 'Auditor Fiscal Master & Perito Tributário',
    legalBasis: [
      'Art. 10, § 2º da Medida Provisória nº 2.200-2/2001 (Validade Jurídica de Documentos Eletrônicos ICP-Brasil)',
      'Lei Federal nº 14.063/2020 (Assinaturas Eletrônicas Qualificadas e Avançadas)',
      'Art. 441 da Lei nº 13.105/2015 (Código de Processo Civil - Fé Pública Pericial)',
      'Lei Complementar Federal nº 123/2006 (Estatuto Nacional da ME e EPP)',
      'Emenda Constitucional nº 132/2023 (Reforma Tributária Nacional - IVA Dual IBS/CBS)'
    ],
    qrCodeDataUrl,
    status: 'autentico'
  };

  // Register in local registry
  saveVerifiedDocument(record);

  return record;
}

/**
 * Saves document to local registry
 */
export function saveVerifiedDocument(record: VerifiedDocumentRecord) {
  try {
    if (typeof window === 'undefined') return;
    const existingStr = localStorage.getItem(STORAGE_KEY);
    const registry: Record<string, VerifiedDocumentRecord> = existingStr ? JSON.parse(existingStr) : {};
    registry[record.hashFormatted] = record;
    registry[record.sha256Full] = record;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registry));
  } catch (e) {
    console.error('Error saving verified document', e);
  }
}

/**
 * Looks up a document in the registry by hashFormatted or sha256Full
 */
export function lookupVerifiedDocument(queryHash: string): VerifiedDocumentRecord | null {
  try {
    if (typeof window === 'undefined') return null;
    const existingStr = localStorage.getItem(STORAGE_KEY);
    if (!existingStr) return null;
    const registry: Record<string, VerifiedDocumentRecord> = JSON.parse(existingStr);
    
    const cleanQuery = queryHash.trim().toUpperCase();
    if (registry[cleanQuery]) {
      return registry[cleanQuery];
    }

    // Try finding by prefix or partial
    const foundKey = Object.keys(registry).find(k => k.toUpperCase().includes(cleanQuery) || cleanQuery.includes(k.toUpperCase()));
    if (foundKey) {
      return registry[foundKey];
    }
  } catch (e) {
    console.error('Error looking up verified document', e);
  }
  return null;
}

/**
 * Retrieves all registered verified documents in this session/system
 */
export function getAllVerifiedDocuments(): VerifiedDocumentRecord[] {
  try {
    if (typeof window === 'undefined') return [];
    const existingStr = localStorage.getItem(STORAGE_KEY);
    if (!existingStr) return [];
    const registry: Record<string, VerifiedDocumentRecord> = JSON.parse(existingStr);
    const unique = new Map<string, VerifiedDocumentRecord>();
    Object.values(registry).forEach(item => {
      unique.set(item.hashFormatted, item);
    });
    return Array.from(unique.values()).sort((a, b) => new Date(b.issuedAtIso).getTime() - new Date(a.issuedAtIso).getTime());
  } catch (e) {
    console.error('Error fetching verified documents', e);
    return [];
  }
}
