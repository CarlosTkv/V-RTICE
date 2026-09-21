import { SimplesAnexo, CompanyAddress } from '../types';
import { findEcacOptionByText } from './ecacCatalog';

export interface ExtractedActivity {
  description: string;
  anexo: SimplesAnexo;
  revenue: number;
  isExport?: boolean;
  isTransport?: boolean;
  transportType?: 'intermunicipal_cargas' | 'intermunicipal_passageiros' | 'municipal';
  ecacClassification?: string;
  ecacOptionCode?: string;
  subjectToFatorR?: boolean;
  hasST?: boolean;
  hasIssRetido?: boolean;
  hasStateBenefit?: boolean;
  stateBenefitName?: string;
  icmsReductionPercent?: number;
  issRetidoPercent?: number;
  state?: string;
}

export interface ExtractedPGDASData {
  rbt12?: number;
  rba?: number;
  rbaa?: number;
  monthlyRevenue?: number;
  companyName?: string;
  cnpj?: string;
  cnae?: string;
  cnaeDescription?: string;
  uf?: string;
  city?: string;
  address?: CompanyAddress;
  payroll12m?: number;
  period?: string;
  anexo?: SimplesAnexo;
  fatorRCalculated?: number;
  fatorRValue?: number;
  subjectToFatorR?: boolean;
  dasTaxDue?: number;
  stateIcmsReductionPercent?: number;
  activities?: ExtractedActivity[];
  monthlyHistory?: Array<{ month: string; value: number }>;
  rawText: string;
}

/**
 * Extracts numeric value formatted in Brazilian currency (e.g., "1.234.567,89" -> 1234567.89)
 */
export function parseBRLNumber(valStr: string): number | undefined {
  if (!valStr) return undefined;
  const cleaned = valStr.trim().replace(/[^\d.,]/g, '');
  if (!cleaned) return undefined;

  // Standard Brazilian format: 1.234.567,89
  if (cleaned.includes(',') && cleaned.includes('.')) {
    const num = parseFloat(cleaned.replace(/\./g, '').replace(',', '.'));
    return isNaN(num) ? undefined : num;
  }
  // Format with comma only: 12345,67
  if (cleaned.includes(',')) {
    const num = parseFloat(cleaned.replace(',', '.'));
    return isNaN(num) ? undefined : num;
  }
  // Format with dot only
  if (cleaned.includes('.')) {
    const parts = cleaned.split('.');
    if (parts.length === 2 && parts[1].length === 2) {
      const num = parseFloat(cleaned);
      return isNaN(num) ? undefined : num;
    }
    const num = parseFloat(cleaned.replace(/\./g, ''));
    return isNaN(num) ? undefined : num;
  }

  const num = parseFloat(cleaned);
  return isNaN(num) ? undefined : num;
}

/**
 * Searches for a BRL currency value immediately following, on the same line,
 * or across subsequent table lines (up to 5 lines ahead) for a specific regex pattern.
 * In PGDAS-D tables (Mercado Interno | Mercado Externo | Total), always prefers the Total column (last value).
 * Avoids jumping hundreds of characters into unrelated sections.
 */
function extractLocalizedCurrency(
  lines: string[], 
  patterns: RegExp[],
  cleanSingleLine?: string,
  globalFallbackRegexes?: RegExp[]
): { value: number; raw: string } | undefined {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const pat of patterns) {
      if (pat.test(line)) {
        // Look for currency in the same line after or alongside the pattern
        const matches = [...line.matchAll(/(?:R\$\s*)?([0-9]{1,3}(?:\.[0-9]{3})*,[0-9]{2}|[0-9]+,[0-9]{2})\b/g)];
        if (matches.length > 0) {
          const lastMatch = matches[matches.length - 1];
          const val = parseBRLNumber(lastMatch[1]);
          if (val !== undefined && val >= 0) {
            return { value: val, raw: lastMatch[1] };
          }
        }

        // If current line didn't have currency, look ahead in up to 5 subsequent lines (table cells or column headers)
        for (let offset = 1; offset <= 5 && (i + offset) < lines.length; offset++) {
          const nextLine = lines[i + offset];
          // Stop if we encounter a new major section
          if (/^(?:[2-9]\.\d+|[3-9]\.|Atividades\s*Econ[oô]micas|Informa[cç][oõ]es\s*Complementares)/i.test(nextLine)) {
            break;
          }
          const nextMatches = [...nextLine.matchAll(/(?:R\$\s*)?([0-9]{1,3}(?:\.[0-9]{3})*,[0-9]{2}|[0-9]+,[0-9]{2})\b/g)];
          if (nextMatches.length > 0) {
            const lastMatch = nextMatches[nextMatches.length - 1];
            const val = parseBRLNumber(lastMatch[1]);
            if (val !== undefined && val >= 0) {
              return { value: val, raw: lastMatch[1] };
            }
          }
        }
      }
    }
  }

  // Global fallback if lines didn't capture and cleanSingleLine is provided
  if (cleanSingleLine && globalFallbackRegexes && globalFallbackRegexes.length > 0) {
    for (const gRegex of globalFallbackRegexes) {
      const match = cleanSingleLine.match(gRegex);
      if (match) {
        const captured = match[0];
        const gMatches = [...captured.matchAll(/(?:R\$\s*)?([0-9]{1,3}(?:\.[0-9]{3})*,[0-9]{2}|[0-9]+,[0-9]{2})\b/g)];
        if (gMatches.length > 0) {
          const lastMatch = gMatches[gMatches.length - 1];
          const val = parseBRLNumber(lastMatch[1]);
          if (val !== undefined && val >= 0) {
            return { value: val, raw: lastMatch[1] };
          }
        }
      }
    }
  }

  return undefined;
}

/**
 * Parses raw text from PGDAS-D declarations strictly from document contents.
 * No hardcoded values, no assumed transport activities, and no invented state tax benefits.
 */
export function parsePGDASText(rawText: string): ExtractedPGDASData {
  if (!rawText || !rawText.trim()) {
    return { rawText: '' };
  }

  // Normalize lines preserving vertical layout
  const rawLines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const cleanSingleLine = rawLines.join(' ');

  // 1. Extract CNPJ
  let cnpj: string | undefined;
  for (const line of rawLines) {
    const m = line.match(/(?:CNPJ\s*Matriz|CNPJ\s*B[aá]sico|CNPJ)[:\s]*(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})/i) ||
              line.match(/\b(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})\b/);
    if (m) {
      cnpj = m[1];
      break;
    }
  }

  // 2. Extract Company Name (Razão Social / Nome Empresarial)
  let companyName: string | undefined;
  for (const line of rawLines) {
    const nameMatch = line.match(/(?:Nome\s*Empresarial|Raz[aã]o\s*Social|Nome\/Raz[aã]o\s*Social)[:\s]+(.+)/i);
    if (nameMatch && nameMatch[1]) {
      let candidate = nameMatch[1].trim();
      // Remove trailing delimiters if present
      candidate = candidate.replace(/(?:CNPJ|Nome\s*Fantasia|Per[ií]odo|PA:|Endere[cç]o|CNAE).*/i, '').trim();
      candidate = candidate.replace(/^[\s:\-–]+|[\s:\-–]+$/g, '').trim();
      if (candidate.length >= 3 && !candidate.toLowerCase().startsWith('simples nacional')) {
        companyName = candidate;
        break;
      }
    }
  }

  // Fallback for company name if on next line after label
  if (!companyName) {
    for (let i = 0; i < rawLines.length - 1; i++) {
      if (/(?:Nome\s*Empresarial|Raz[aã]o\s*Social)[:\s]*$/i.test(rawLines[i])) {
        const next = rawLines[i + 1].trim();
        if (next && next.length >= 3 && !next.includes(':') && !next.toLowerCase().startsWith('simples')) {
          companyName = next;
          break;
        }
      }
    }
  }

  // 3. Extract Period of Calculation (Período de Apuração / PA) - MM/YYYY
  let period: string | undefined;
  
  // Strategy 1: Explicit PA label
  for (const line of rawLines) {
    const periodMatch = line.match(/(?:Per[ií]odo\s*de\s*Apura[cç][aã]o(?:\s*\(PA\))?|PA)[:\s]*((?:0[1-9]|1[0-2])\s*\/\s*(?:202\d|203\d))\b/i);
    if (periodMatch) {
      period = periodMatch[1].replace(/\s+/g, '');
      break;
    }
  }

  // Strategy 2: Declaration Number (e.g. Nº da Declaração: 23277116202607001 -> 2026 07 -> 07/2026)
  if (!period) {
    for (const line of rawLines) {
      const declMatch = line.match(/(?:N[ºo\.]?\s*da\s*Declara[cç][aã]o|N[úu]mero\s*da\s*Declara[cç][aã]o)[:\s]*\d{8}(\d{4})(\d{2})\d{3}/i);
      if (declMatch) {
        period = `${declMatch[2]}/${declMatch[1]}`;
        break;
      }
    }
  }

  // Strategy 3: Receipt Number (e.g. Número do Recibo: 01.07.26215... -> MM=07, YY=26 -> 07/2026)
  if (!period) {
    for (const line of rawLines) {
      const receiptMatch = line.match(/(?:N[úu]mero\s*do\s*Recibo|Recibo)[:\s]*\d{2}\.(\d{2})\.(\d{2})\d+/i);
      if (receiptMatch) {
        const mm = receiptMatch[1];
        const yy = `20${receiptMatch[2]}`;
        period = `${mm}/${yy}`;
        break;
      }
    }
  }

  // Strategy 4: From historical months list (the month directly following the last prior month in 2.2.1)
  if (!period) {
    const historyMonths = [...cleanSingleLine.matchAll(/\b((?:0[1-9]|1[0-2]))\/(202\d|203\d)\b/g)];
    if (historyMonths.length > 0) {
      const last = historyMonths[historyMonths.length - 1];
      let m = parseInt(last[1], 10) + 1;
      let y = parseInt(last[2], 10);
      if (m > 12) {
        m = 1;
        y += 1;
      }
      period = `${String(m).padStart(2, '0')}/${y}`;
    }
  }

  // Strategy 5: From transmission timestamp
  if (!period) {
    for (const line of rawLines) {
      const transMatch = line.match(/(?:transmiss[aã]o\s*da\s*Declara[cç][aã]o|transmitida\s*em)[:\s]*\d{2}\/((?:0[1-9]|1[0-2]))\/(202\d|203\d)/i);
      if (transMatch) {
        let m = parseInt(transMatch[1], 10) - 1;
        let y = parseInt(transMatch[2], 10);
        if (m === 0) {
          m = 12;
          y -= 1;
        }
        period = `${String(m).padStart(2, '0')}/${y}`;
        break;
      }
    }
  }

  // 4. Extract RBT12 (Receita Bruta Acumulada nos 12 meses anteriores ao PA)
  let rbt12: number | undefined;
  const rbt12Patterns = [
    // PGDAS-D Section 2.1: "Receita bruta acumulada nos doze meses anteriores ao PA (RBT12)"
    /(?:receita\s*bruta\s*acumulada\s*nos\s*(?:doze|12|\(12\)|\(doze\))\s*meses\s*(?:anteriores)?(?:\s*ao\s*PA)?)/i,
    /(?:(?:doze|12)\s*meses\s*anteriores\s*ao\s*PA)/i,
    /(?:(?:doze|12)\s*meses\s*anteriores(?:\s*\(RBT12\))?)/i,
    /\b(?:RBT\s*12|RBT12|RBT-12)\b/i,
    /\(RBT12\)/i,
    /\(RBT\s*12\)/i,
    /RBT12\s*\(R\$\)/i,
    /Total\s*(?:da\s*)?RBT12/i,
    /RBT12\s*(?:proporcional(?:izada)?|acumulada)/i,
    /Receita\s*Bruta\s*Acumulada\s*(?:nos|[uú]ltimos)\s*(?:12|doze)\s*meses/i
  ];
  const rbt12GlobalRegexes = [
    /(?:RBT\s*12\b|RBT12\b|\(RBT12\)|\(RBT\s*12\)|receita\s*bruta\s*acumulada\s*nos\s*(?:doze|12)\s*meses(?:\s*anteriores)?(?:\s*ao\s*PA)?|(?:doze|12)\s*meses\s*anteriores\s*ao\s*PA)[^\d\n\r]{0,120}?([0-9]{1,3}(?:\.[0-9]{3})*,[0-9]{2}|[0-9]+,[0-9]{2})(?:[^\d\n\r]{1,40}?([0-9]{1,3}(?:\.[0-9]{3})*,[0-9]{2}|[0-9]+,[0-9]{2}))?(?:[^\d\n\r]{1,40}?([0-9]{1,3}(?:\.[0-9]{3})*,[0-9]{2}|[0-9]+,[0-9]{2}))?/i,
    /RBT\s*12[^\d\n\r]{0,50}?([0-9]{1,3}(?:\.[0-9]{3})*,[0-9]{2}|[0-9]+,[0-9]{2})/i
  ];
  const rbt12Res = extractLocalizedCurrency(rawLines, rbt12Patterns, cleanSingleLine, rbt12GlobalRegexes);
  if (rbt12Res && rbt12Res.value >= 0) {
    rbt12 = rbt12Res.value;
  }

  // 5. Extract RBA (Receita Bruta Acumulada no ano-calendário corrente)
  let rba: number | undefined;
  const rbaPatterns = [
    /(?:receita\s*bruta\s*acumulada\s*no\s*ano-calend[aá]rio\s*corrente(?:\s*\(RBA\))?)/i,
    /(?:ano-calend[aá]rio\s*corrente\s*\(RBA\))/i,
    /\b(?:RBA\b|RBA\s*\(R\$\)|\(RBA\))/i,
    /Total\s*(?:da\s*)?RBA/i,
    /RBA\s*corrente/i
  ];
  const rbaGlobalRegexes = [
    /(?:RBA\b|\(RBA\)|receita\s*bruta\s*acumulada\s*no\s*ano-calend[aá]rio\s*corrente)[^\d\n\r]{0,120}?([0-9]{1,3}(?:\.[0-9]{3})*,[0-9]{2}|[0-9]+,[0-9]{2})(?:[^\d\n\r]{1,40}?([0-9]{1,3}(?:\.[0-9]{3})*,[0-9]{2}|[0-9]+,[0-9]{2}))?(?:[^\d\n\r]{1,40}?([0-9]{1,3}(?:\.[0-9]{3})*,[0-9]{2}|[0-9]+,[0-9]{2}))?/i,
    /RBA[^\d\n\r]{0,50}?([0-9]{1,3}(?:\.[0-9]{3})*,[0-9]{2}|[0-9]+,[0-9]{2})/i
  ];
  const rbaRes = extractLocalizedCurrency(rawLines, rbaPatterns, cleanSingleLine, rbaGlobalRegexes);
  if (rbaRes && rbaRes.value >= 0) {
    rba = rbaRes.value;
  }

  // 6. Extract RBAA (Receita Bruta Acumulada no ano-calendário anterior)
  let rbaa: number | undefined;
  const rbaaPatterns = [
    /(?:receita\s*bruta\s*acumulada\s*no\s*ano-calend[aá]rio\s*anterior(?:\s*\(RBAA\))?)/i,
    /(?:ano-calend[aá]rio\s*anterior\s*\(RBAA\))/i,
    /\b(?:RBAA\b|RBAA\s*\(R\$\)|\(RBAA\)|RBT12a\b)/i,
    /Total\s*(?:da\s*)?RBAA/i
  ];
  const rbaaGlobalRegexes = [
    /(?:RBAA\b|\(RBAA\)|RBT12a\b|receita\s*bruta\s*acumulada\s*no\s*ano-calend[aá]rio\s*anterior)[^\d\n\r]{0,120}?([0-9]{1,3}(?:\.[0-9]{3})*,[0-9]{2}|[0-9]+,[0-9]{2})(?:[^\d\n\r]{1,40}?([0-9]{1,3}(?:\.[0-9]{3})*,[0-9]{2}|[0-9]+,[0-9]{2}))?(?:[^\d\n\r]{1,40}?([0-9]{1,3}(?:\.[0-9]{3})*,[0-9]{2}|[0-9]+,[0-9]{2}))?/i
  ];
  const rbaaRes = extractLocalizedCurrency(rawLines, rbaaPatterns, cleanSingleLine, rbaaGlobalRegexes);
  if (rbaaRes && rbaaRes.value >= 0) {
    rbaa = rbaaRes.value;
  }

  // 7. Extract Monthly Revenue (Receita do Período de Apuração / PA)
  let monthlyRevenue: number | undefined;
  const paRevenuePatterns = [
    /Receita\s*Bruta\s*do\s*PA\s*\(RPA\)/i,
    /Receita\s*(?:Bruta\s*)?(?:Total\s*)?(?:(?:da\s*Empresa|do\s*Estabelecimento)\s*)?(?:(?:no|do|para\s*o)\s*)?(?:Per[ií]odo\s*de\s*Apura[cç][aã]o|PA)/i,
    /Receita\s*do\s*Per[ií]odo\s*de\s*Apura[cç][aã]o/i,
    /Receita\s*do\s*PA\b/i,
    /Receita\s*Bruta\s*do\s*PA\b/i,
    /Total\s*de\s*receitas\s*(?:brutas\s*)?(?:apuradas|auferidas|informadas)\s*(?:no|para\s*o)\s*PA/i,
    /Receita\s*Bruta\s*Total\s*da\s*Empresa\s*no\s*PA/i,
    /Receita\s*Bruta\s*Auferida\b/i,
    /Receita\s*Bruta\s*Informada\s*no\s*PA/i
  ];
  const paRes = extractLocalizedCurrency(rawLines, paRevenuePatterns);
  if (paRes && paRes.value >= 0) {
    monthlyRevenue = paRes.value;
  }

  // 8. Extract Folha de Salários / Encargos nos 12 meses anteriores (FS12)
  let payroll12m: number | undefined;
  const folhaPatterns = [
    /Folha\s*de\s*Sal[aá]rios(?:\s*[\/\-]\s*Encargos)?(?:\s*(?:nos|dos|[uú]ltimos)?\s*12\s*meses(?:\s*anteriores)?)?(?:\s*\(FS12\))?/i,
    /FS12\b/i,
    /Folha\s*de\s*Sal[aá]rios\s*\(FS12\)/i,
    /Folha\s*de\s*Sal[aá]rios\s*Anteriores/i,
    /Encargos\s*12\s*meses/i
  ];
  const folhaRes = extractLocalizedCurrency(rawLines, folhaPatterns);
  if (folhaRes && folhaRes.value >= 0) {
    payroll12m = folhaRes.value;
  } else {
    // Check if line says "Nenhuma", "Nenhum", "0,00" or "Zero"
    for (let i = 0; i < rawLines.length; i++) {
      if (/Folha\s*de\s*Sal[aá]rios/i.test(rawLines[i])) {
        const curr = rawLines[i];
        const next = rawLines[i + 1] || '';
        if (/Nenhuma|Nenhum|Zero|0,00/i.test(curr) || /Nenhuma|Nenhum|Zero|0,00/i.test(next)) {
          payroll12m = 0;
          break;
        }
      }
    }
  }

  // 9. Extract Fator R (se expressamente indicado no texto ou "Não se aplica")
  let fatorRCalculated: number | undefined;
  let subjectToFatorR = false;

  for (const line of rawLines) {
    if (/Fator\s*["'\x27]?r["'\x27]?\s*=\s*N[aã]o\s*se\s*aplica/i.test(line) ||
        /Fator\s*["'\x27]?r["'\x27]?[:\s]+N[aã]o\s*se\s*aplica/i.test(line)) {
      fatorRCalculated = 0;
      subjectToFatorR = false;
      break;
    }
    const fatorRMatch = line.match(/Fator\s*["'\x27]?r["'\x27]?(?:\s*(?:apurado|calculado))?[:\s]+([\d\.,]+)%?/i);
    if (fatorRMatch && fatorRMatch[1]) {
      const rawVal = parseBRLNumber(fatorRMatch[1]);
      if (rawVal !== undefined) {
        fatorRCalculated = rawVal <= 1 && !line.includes('%') && rawVal > 0 ? rawVal * 100 : rawVal;
        subjectToFatorR = true;
        break;
      }
    }
  }

  // Compute from FS12 / RBT12 if not explicitly stated and not explicitly disabled
  if (fatorRCalculated === undefined && payroll12m !== undefined && rbt12 && rbt12 > 0) {
    fatorRCalculated = (payroll12m / rbt12) * 100;
  } else if (fatorRCalculated === undefined && payroll12m === 0 && rbt12 && rbt12 > 0) {
    fatorRCalculated = 0;
  }

  let fatorRValue: number | undefined;
  if (fatorRCalculated !== undefined && monthlyRevenue !== undefined && monthlyRevenue >= 0) {
    fatorRValue = Math.round(monthlyRevenue * (fatorRCalculated / 100) * 100) / 100;
  }

  // 10. Extract Anexo strictly based on document text
  let anexo: SimplesAnexo | undefined;
  if (/Anexo\s*III\b/i.test(cleanSingleLine)) {
    anexo = 'III';
  } else if (/Anexo\s*IV\b/i.test(cleanSingleLine)) {
    anexo = 'IV';
  } else if (/Anexo\s*V\b/i.test(cleanSingleLine)) {
    anexo = 'V';
  } else if (/Anexo\s*I\b/i.test(cleanSingleLine)) {
    anexo = 'I';
  } else if (/Anexo\s*II\b/i.test(cleanSingleLine)) {
    anexo = 'II';
  }

  // If no anexo mentioned, infer from company name / core keywords
  if (!anexo && companyName) {
    const nameLower = companyName.toLowerCase();
    if (nameLower.includes('odontologia') || nameLower.includes('odonto') || nameLower.includes('dent') ||
        nameLower.includes('medica') || nameLower.includes('médic') || nameLower.includes('clinica') ||
        nameLower.includes('consultorio') || nameLower.includes('saude') || nameLower.includes('fisioterapia')) {
      anexo = 'III';
    } else if (nameLower.includes('transport') || nameLower.includes('logistica') || nameLower.includes('cargas')) {
      anexo = 'III';
    } else if (nameLower.includes('comercio') || nameLower.includes('comercial') || nameLower.includes('varejo') || nameLower.includes('mercado')) {
      anexo = 'I';
    } else if (nameLower.includes('industria') || nameLower.includes('fabrica')) {
      anexo = 'II';
    }
  }

  // 11. Extract CNAE
  let cnae: string | undefined;
  let cnaeDescription: string | undefined;
  for (const line of rawLines) {
    const cnaeMatch = line.match(/CNAE(?:[\s\w]*?)[:\s]+(\d{2}\.?\d{2}-?\d(?:-\d{2}|\/\d{2})?)(?:\s*[-–]\s*(.+))?/i) ||
                      line.match(/\b(\d{4}-\d\/\d{2})\b(?:\s*[-–]\s*(.+))?/);
    if (cnaeMatch) {
      cnae = cnaeMatch[1];
      if (cnaeMatch[2]) {
        cnaeDescription = cnaeMatch[2].trim();
      }
      break;
    }
  }

  // 12. Extract Valor Devido / DAS
  let dasTaxDue: number | undefined;
  const dasPatterns = [
    /Valor\s*devido\s*do\s*Simples\s*Nacional/i,
    /Total\s*a\s*recolher(?:\s*do\s*Simples\s*Nacional)?/i,
    /Valor\s*Total\s*do\s*D[eé]bito\s*Declarado/i,
    /Total\s*do\s*D[eé]bito\s*Exig[ií]vel/i,
    /Valor\s*do\s*Principal/i
  ];
  const dasRes = extractLocalizedCurrency(rawLines, dasPatterns);
  if (dasRes) {
    dasTaxDue = dasRes.value;
  }

  // 13. Extract UF and Address
  let uf: string | undefined;
  let city: string | undefined;
  let address: CompanyAddress | undefined;
  
  for (const line of rawLines) {
    const munMatch = line.match(/Munic[ií]pio[:\s]+([A-Za-zÀ-ÖØ-öø-ÿ\s]+?)(?:\s+UF[:\s]+([A-Z]{2})|[\/\-\s]+([A-Z]{2})|\s*CEP|$)/i);
    if (munMatch) {
      city = munMatch[1].trim();
      if (munMatch[2]) uf = munMatch[2].toUpperCase();
      else if (munMatch[3]) uf = munMatch[3].toUpperCase();
      break;
    }
  }

  if (!uf) {
    for (const line of rawLines) {
      const ufMatch = line.match(/(?:UF|Estado)[:\s]+([A-Z]{2})\b/i) ||
                      line.match(/\/\s*([A-Z]{2})\b/) ||
                      line.match(/\b([A-Z]{2})\s*-\s*CEP\b/i);
      if (ufMatch) {
        const candidateUf = ufMatch[1].toUpperCase();
        const validUFs = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];
        if (validUFs.includes(candidateUf)) {
          uf = candidateUf;
          break;
        }
      }
    }
  }

  for (const line of rawLines) {
    if (/Endere[cç]o|Logradouro|Munic[ií]pio|CEP/i.test(line)) {
      const cepMatch = line.match(/\b(\d{5}-?\d{3})\b/);
      const logradouroMatch = line.match(/(?:Endere[cç]o|Logradouro)[:\s]+([^,;\n]+?)(?:,\s*N[ºo\.]?\s*(\d+|S\/N))?/i);
      const municipioMatch = line.match(/(?:Munic[ií]pio|Cidade)[:\s]+([A-Za-zÀ-ÖØ-öø-ÿ\s]+?)(?:[\/\-\s]+([A-Z]{2}))?(?:\s*CEP|$)/i);

      if (logradouroMatch || cepMatch || municipioMatch) {
        address = {
          logradouro: logradouroMatch ? logradouroMatch[1].trim() : undefined,
          numero: logradouroMatch && logradouroMatch[2] ? logradouroMatch[2].trim() : undefined,
          municipio: city || (municipioMatch ? municipioMatch[1].trim() : undefined),
          uf: uf || ((municipioMatch && municipioMatch[2]) ? municipioMatch[2].toUpperCase() : undefined),
          cep: cepMatch ? cepMatch[1] : undefined,
          formatted: line
        };
        break;
      }
    }
  }

  // 14. Extract State ICMS Reduction Percent ONLY if explicitly stated in text
  let stateIcmsReductionPercent: number | undefined;
  for (const line of rawLines) {
    const redMatch = line.match(/(?:redu[cç][aã]o|benef[ií]cio)\s*(?:do|de)?\s*ICMS[^\d\n]*?([\d\.,]+)%?/i) ||
                     line.match(/Percentual\s*de\s*redu[cç][aã]o\s*do\s*ICMS[^\d\n]*?([\d\.,]+)%?/i);
    if (redMatch && redMatch[1]) {
      stateIcmsReductionPercent = parseBRLNumber(redMatch[1]);
      break;
    }
  }

  // 15. Extract Document Activities STRICTLY from document blocks
  const activities: ExtractedActivity[] = [];

  // Look for activity blocks in PGDAS-D:
  // e.g., "1. Prestação de Serviços..." followed by "Receita Bruta Informada: R$ ..."
  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    
    // Check if line starts an activity description
    const isActivityHeader = /^(?:\d+\.\s*)?(?:Revenda\s*de\s*mercadorias|Venda\s*de\s*mercadorias|Prestação\s*de\s*serviços|Serviços\s*de\s*transporte|Locação\s*de\s*bens|Atividade)/i.test(line) ||
                             /(?:tributados\s*pelo\s*Anexo|sujeitos\s*ao\s*Anexo)/i.test(line);

    if (isActivityHeader) {
      // Gather description from current and subsequent lines
      let desc = line;
      let actRevenue = 0;
      let actAnexo: SimplesAnexo = anexo || 'I';
      let additionalNotes = '';

      // Look ahead up to 10 lines for revenue and details
      for (let j = i + 1; j < Math.min(rawLines.length, i + 12); j++) {
        const nextLine = rawLines[j];
        
        // If next line is another numbered activity header, stop
        if (/^\d+\.\s*(?:Revenda|Venda|Prestação|Serviços|Locação)/i.test(nextLine) && j > i + 1) {
          break;
        }

        // Anexo detection within activity
        if (/Anexo\s*I\b/i.test(nextLine) || /Anexo\s*I\b/i.test(desc)) actAnexo = 'I';
        else if (/Anexo\s*II\b/i.test(nextLine) || /Anexo\s*II\b/i.test(desc)) actAnexo = 'II';
        else if (/Anexo\s*III\b/i.test(nextLine) || /Anexo\s*III\b/i.test(desc)) actAnexo = 'III';
        else if (/Anexo\s*IV\b/i.test(nextLine) || /Anexo\s*IV\b/i.test(desc)) actAnexo = 'IV';
        else if (/Anexo\s*V\b/i.test(nextLine) || /Anexo\s*V\b/i.test(desc)) actAnexo = 'V';

        // Check for revenue line
        const revMatch = nextLine.match(/(?:Receita\s*Bruta\s*Informada|Receita\s*da\s*Atividade|Receita\s*Informada|Valor\s*Informado)[:\s]*(?:R\$\s*)?([0-9]{1,3}(?:\.[0-9]{3})*,[0-9]{2}|[0-9]+,[0-9]{2})\b/i);
        if (revMatch && revMatch[1]) {
          const val = parseBRLNumber(revMatch[1]);
          if (val !== undefined && val > 0) {
            actRevenue = val;
          }
        }
        
        // Check for specific tax situation lines that appear right under the revenue
        // e.g.: "Substituição tributária de: ICMS.", "Retenção de: ISS."
        if (/Substitui[cç][aã]o\s*tribut[aá]ria\s*de:/i.test(nextLine) || /Reten[cç][aã]o\s*de:/i.test(nextLine)) {
          additionalNotes += ` - ${nextLine.trim()}`;
        } else if (!/(?:Receita|Total|Valor|CNAE|CNPJ)/i.test(nextLine) && nextLine.length > 3) {
          desc += ` - ${nextLine.trim()}`;
        }
      }

      if (actRevenue > 0) {
        const fullActText = `${desc} ${additionalNotes}`.trim();
        const fullActTextLower = fullActText.toLowerCase();

        // 1. Catálogo oficial e-CAC
        const ecacOption = findEcacOptionByText(fullActText);

        if (ecacOption) {
          actAnexo = ecacOption.anexo;
        } else {
          // Fallback para Anexo baseado no texto da atividade
          if (fullActTextLower.includes('revenda') || (fullActTextLower.includes('mercadoria') && !fullActTextLower.includes('industrializad'))) {
            actAnexo = 'I';
          } else if (fullActTextLower.includes('industrial') || fullActTextLower.includes('fabrica')) {
            actAnexo = 'II';
          } else if (fullActTextLower.includes('anexo iv') || fullActTextLower.includes('anexo 4')) {
            actAnexo = 'IV';
          } else if (fullActTextLower.includes('anexo v') || fullActTextLower.includes('anexo 5')) {
            actAnexo = 'V';
          } else if (fullActTextLower.includes('prestação de serviços') || fullActTextLower.includes('anexo iii')) {
            actAnexo = 'III';
          }
        }

        // Exportação segura: 'para o exterior' MAS NÃO 'exceto para o exterior'
        const isExport = ecacOption?.isExport ?? (
          (fullActTextLower.includes('para o exterior') || fullActTextLower.includes('exportação')) &&
          !fullActTextLower.includes('exceto para o exterior')
        );

        // Substituição Tributária (ICMS ST)
        const hasSemST = fullActTextLower.includes('sem substituição') || 
                         fullActTextLower.includes('sem substituicao') || 
                         fullActTextLower.includes('substituto tributário') ||
                         fullActTextLower.includes('substituto tributario');
        
        const hasComST = !hasSemST && (
          (ecacOption?.code.includes('_com_st') ?? false) ||
          fullActTextLower.includes('com substituição') || 
          fullActTextLower.includes('com substituicao') || 
          fullActTextLower.includes('substituído tributário') ||
          fullActTextLower.includes('substituido tributario') ||
          fullActTextLower.includes('substituição tributária de: icms') ||
          fullActTextLower.includes('substituicao tributaria de: icms')
        );

        // ISS Retido
        const hasSemRetencao = fullActTextLower.includes('sem retenção') || fullActTextLower.includes('sem retencao');
        const hasIssRetido = !hasSemRetencao && (
          (ecacOption?.code.includes('_com_ret') ?? false) ||
          fullActTextLower.includes('com retenção') ||
          fullActTextLower.includes('com retencao') ||
          fullActTextLower.includes('retenção de: iss') ||
          fullActTextLower.includes('retencao de: iss')
        );

        // Fator R
        const isExplicitlyNaoFatorR = fullActTextLower.includes('não sujeitos ao fator') || 
                                      fullActTextLower.includes('nao sujeitos ao fator') ||
                                      fullActTextLower.includes('não sujeito ao fator') ||
                                      fullActTextLower.includes('nao sujeito ao fator');

        const isFatorRAct = !isExplicitlyNaoFatorR && (
          (ecacOption?.subjectToFatorR ?? false) ||
          (fullActTextLower.includes('sujeitos ao fator') && !isExplicitlyNaoFatorR) ||
          actAnexo === 'V'
        );

        const isTransport = ecacOption?.isTransport ?? (
          fullActTextLower.includes('transporte intermunicipal') || 
          fullActTextLower.includes('transporte interestadual') || 
          fullActTextLower.includes('transporte de carga')
        );

        const hasStateBenefit = fullActTextLower.includes('redução de icms') || 
                                fullActTextLower.includes('benefício de icms') || 
                                (uf === 'PR' && (actAnexo === 'I' || actAnexo === 'II'));

        activities.push({
          description: fullActText,
          anexo: actAnexo,
          revenue: actRevenue,
          isExport,
          hasST: hasComST,
          hasIssRetido,
          isTransport,
          transportType: isTransport ? 'intermunicipal_cargas' : undefined,
          subjectToFatorR: isFatorRAct,
          ecacOptionCode: ecacOption?.code,
          ecacClassification: hasComST ? 'icms_st' : hasIssRetido ? 'iss_retido' : 'normal',
          hasStateBenefit,
          icmsReductionPercent: hasStateBenefit ? (stateIcmsReductionPercent || undefined) : undefined,
          state: uf
        });
      }
    }
  }

  // If no structured activity blocks were found, but monthlyRevenue is defined (even 0)
  if (activities.length === 0 && monthlyRevenue !== undefined) {
    const detectedAnexo = anexo || 'III';
    let defaultTitle = detectedAnexo === 'I'
      ? 'Revenda de Mercadorias (Comércio - Anexo I)'
      : detectedAnexo === 'II'
        ? 'Venda de Produtos Industrializados (Indústria - Anexo II)'
        : detectedAnexo === 'IV'
          ? 'Prestação de Serviços em Geral - Anexo IV'
          : detectedAnexo === 'V'
            ? 'Serviços Intelectuais / Técnicos - Anexo V'
            : 'Prestação de Serviços - Anexo III';

    if (companyName && (companyName.toLowerCase().includes('odontologia') || companyName.toLowerCase().includes('odonto'))) {
      defaultTitle = 'Serviços Odontológicos / Consultório Odontológico - Anexo III';
    }

    activities.push({
      description: defaultTitle,
      anexo: detectedAnexo,
      revenue: monthlyRevenue,
      isExport: false,
      hasST: false,
      hasIssRetido: false,
      isTransport: false,
      subjectToFatorR: subjectToFatorR !== undefined ? subjectToFatorR : (detectedAnexo === 'V'),
      hasStateBenefit: false,
      state: uf
    });
  } else if (activities.length > 0 && (!monthlyRevenue || monthlyRevenue === 0)) {
    // If activities exist, monthlyRevenue is their sum
    monthlyRevenue = activities.reduce((acc, a) => acc + a.revenue, 0);
  }

  // 16. Extract Historical monthly revenues (section 2.2.1 Mercado Interno)
  const monthlyHistory: Array<{ month: string; value: number }> = [];
  const monthRegex = /\b(0[1-9]|1[0-2])\/(202\d|203\d)\s+([0-9]{1,3}(?:\.[0-9]{3})*,[0-9]{2}|[0-9]+,[0-9]{2})\b/g;
  let mMatch;
  while ((mMatch = monthRegex.exec(cleanSingleLine)) !== null) {
    const month = `${mMatch[1]}/${mMatch[2]}`;
    const value = parseBRLNumber(mMatch[3]) || 0;
    // Prevent duplicate entries for same month
    if (!monthlyHistory.some(h => h.month === month)) {
      monthlyHistory.push({ month, value });
    }
  }

  const historySum = monthlyHistory.reduce((sum, h) => sum + h.value, 0);

  // Regra Fundamental do Simples Nacional (LC 123/2006 & CGSN 140/2018):
  // "Toda empresa que possui RBA possui RBT12"
  // Toda apuração de alíquota efetiva no Simples Nacional exige obrigatoriamente um RBT12.
  // Se o RBT12 não foi capturado diretamente pela regex de linha ou se resultou em 0:
  if (rbt12 === undefined || rbt12 === 0) {
    if (historySum > 0) {
      // 1ª Prioridade: Soma dos meses anteriores declarados na tabela 2.2.1 do PGDAS-D
      rbt12 = Math.round(historySum * 100) / 100;
    } else if (rba !== undefined && rba > 0) {
      // 2ª Prioridade: Se possui RBA, possui RBT12 (ano de início ou espelhamento de receita acumulada)
      rbt12 = rba;
    } else if (monthlyRevenue !== undefined && monthlyRevenue > 0) {
      // 3ª Prioridade: Anualização da receita do período de apuração (1º mês de atividade LC 123/06 art. 18 § 2º)
      rbt12 = Math.round(monthlyRevenue * 12 * 100) / 100;
    }
  }

  // Se o RBT12 foi recuperado e a folha FS12 existe, calcula/atualiza o Fator R
  if (fatorRCalculated === undefined && payroll12m !== undefined && rbt12 && rbt12 > 0) {
    fatorRCalculated = (payroll12m / rbt12) * 100;
  }
  if (fatorRValue === undefined && fatorRCalculated !== undefined && monthlyRevenue !== undefined && monthlyRevenue >= 0) {
    fatorRValue = Math.round(monthlyRevenue * (fatorRCalculated / 100) * 100) / 100;
  }

  return {
    rbt12,
    rba,
    rbaa,
    monthlyRevenue,
    companyName,
    cnpj,
    cnae,
    cnaeDescription,
    uf,
    city,
    address,
    payroll12m,
    period,
    anexo: anexo || (activities.length > 0 ? activities[0].anexo : 'III'),
    fatorRCalculated,
    fatorRValue,
    subjectToFatorR,
    dasTaxDue,
    stateIcmsReductionPercent,
    activities: activities.length > 0 ? activities : undefined,
    monthlyHistory: monthlyHistory.length > 0 ? monthlyHistory : undefined,
    rawText: rawLines.join('\n'),
  };
}

/**
 * Extracts text from PDF pages maintaining spatial vertical and horizontal layout.
 * Groups items by line so that columns and blocks do not mix.
 */
function extractTextFromPage(textContent: any): string {
  const items = (textContent?.items || []) as Array<{
    str?: string;
    transform?: number[];
    width?: number;
    height?: number;
    hasEOL?: boolean;
  }>;

  if (!items || items.length === 0) return '';

  const lineTolerance = 4; // Tolerance in PDF points for items on the same line
  const lines: Array<{ y: number; items: Array<{ x: number; text: string }> }> = [];

  for (const item of items) {
    const text = item.str || '';
    if (!text && !item.hasEOL) continue;

    const x = item.transform ? item.transform[4] : 0;
    const y = item.transform ? item.transform[5] : 0;

    let targetLine = lines.find(l => Math.abs(l.y - y) <= lineTolerance);
    if (!targetLine) {
      targetLine = { y, items: [] };
      lines.push(targetLine);
    }
    targetLine.items.push({ x, text });
  }

  // Sort lines from top to bottom (higher Y to lower Y)
  lines.sort((a, b) => b.y - a.y);

  // For each line, sort items from left to right (lower X to higher X)
  const sortedLines = lines.map(line => {
    line.items.sort((a, b) => a.x - b.x);
    return line.items.map(it => it.text).join(' ').trim();
  }).filter(lineStr => lineStr.length > 0);

  return sortedLines.join('\n');
}

/**
 * Primary PDF Extraction function using spatial text grouping
 */
export async function extractPGDASFromPDF(file: File): Promise<ExtractedPGDASData> {
  const arrayBuffer = await file.arrayBuffer();
  let fullText = '';

  try {
    const pdfjsLib = await import('pdfjs-dist');
    
    // Configure worker using local Vite asset safely
    if (typeof window !== 'undefined') {
      try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url
        ).toString();
      } catch (err) {
        console.warn('Falha ao definir workerSrc do PDF.js:', err);
      }
    }

    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useWorkerFetch: false,
      useSystemFonts: true
    });
    const pdf = await loadingTask.promise;
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = extractTextFromPage(textContent);
      fullText += `\n${pageText}`;
    }
  } catch (pdfjsError) {
    console.warn('PDF.js spatial parse failed, attempting stream decode fallback:', pdfjsError);
    
    // Fallback: Read raw bytes and extract text streams
    try {
      const decoder = new TextDecoder('latin1');
      const rawBinary = decoder.decode(arrayBuffer);
      
      const textBlockRegex = /\(([^)]+)\)\s*(?:Tj|'|")/g;
      let match;
      const extractedChunks: string[] = [];
      
      while ((match = textBlockRegex.exec(rawBinary)) !== null) {
        if (match[1] && match[1].length > 1) {
          extractedChunks.push(match[1]);
        }
      }
      
      fullText = extractedChunks.join('\n');
    } catch (fallbackError) {
      console.error('Fallback raw decode also failed:', fallbackError);
    }
  }

  const parsed = parsePGDASText(fullText);

  // Verify that at least some key structured fields were extracted
  const hasRecognizedField = Boolean(
    parsed.cnpj ||
    parsed.companyName ||
    parsed.rbt12 !== undefined ||
    parsed.monthlyRevenue !== undefined ||
    parsed.period ||
    parsed.rba !== undefined
  );

  if (!fullText.trim() || !hasRecognizedField) {
    throw new Error('Não foi possível identificar campos fiscais estruturados no arquivo. O PDF pode ser uma imagem escaneada sem camada de texto (OCR) ou estar protegido.');
  }

  return parsed;
}
