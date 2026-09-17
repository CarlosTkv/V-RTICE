import { SimplesAnexo } from './src/types';

function parseBRLNumber(valStr: string): number | undefined {
  if (!valStr) return undefined;
  const cleaned = valStr.trim().replace(/[^\d.,]/g, '');
  if (!cleaned) return undefined;

  if (cleaned.includes(',') && cleaned.includes('.')) {
    const num = parseFloat(cleaned.replace(/\./g, '').replace(',', '.'));
    return isNaN(num) ? undefined : num;
  }
  if (cleaned.includes(',')) {
    const num = parseFloat(cleaned.replace(',', '.'));
    return isNaN(num) ? undefined : num;
  }
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

function extractLocalizedCurrency(lines: string[], patterns: RegExp[]): { value: number; raw: string } | undefined {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const pat of patterns) {
      if (pat.test(line)) {
        // Look in current line
        const matches = [...line.matchAll(/(?:R\$\s*)?([0-9]{1,3}(?:\.[0-9]{3})*,[0-9]{2}|[0-9]+,[0-9]{2})\b/g)];
        if (matches.length > 0) {
          const lastMatch = matches[matches.length - 1];
          const val = parseBRLNumber(lastMatch[1]);
          if (val !== undefined && val >= 0) {
            return { value: val, raw: lastMatch[1] };
          }
        }
        // If current line didn't have currency, check next line
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1];
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
  return undefined;
}

export function testParse(rawText: string) {
  const rawLines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const cleanSingleLine = rawLines.join(' ');

  // 1. CNPJ
  let cnpj: string | undefined;
  for (const line of rawLines) {
    const m = line.match(/(?:CNPJ\s*Matriz|CNPJ\s*B[aá]sico|CNPJ)[:\s]*(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})/i) ||
              line.match(/\b(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})\b/);
    if (m) {
      cnpj = m[1];
      break;
    }
  }

  // 2. Company Name
  let companyName: string | undefined;
  for (const line of rawLines) {
    const nameMatch = line.match(/(?:Nome\s*Empresarial|Raz[aã]o\s*Social|Nome\/Raz[aã]o\s*Social)[:\s]+(.+)/i);
    if (nameMatch && nameMatch[1]) {
      let candidate = nameMatch[1].trim();
      candidate = candidate.replace(/(?:CNPJ|Nome\s*Fantasia|Per[ií]odo|PA:|Endere[cç]o|CNAE).*/i, '').trim();
      candidate = candidate.replace(/^[\s:\-–]+|[\s:\-–]+$/g, '').trim();
      if (candidate.length >= 3 && !candidate.toLowerCase().startsWith('simples nacional')) {
        companyName = candidate;
        break;
      }
    }
  }

  // 3. Period (PA) - Precision logic
  let period: string | undefined;
  
  // Priority 1: Explicit PA label
  for (const line of rawLines) {
    const periodMatch = line.match(/(?:Per[ií]odo\s*de\s*Apura[cç][aã]o(?:\s*\(PA\))?|PA)[:\s]*((?:0[1-9]|1[0-2])\s*\/\s*(?:202\d|203\d))\b/i);
    if (periodMatch) {
      period = periodMatch[1].replace(/\s+/g, '');
      break;
    }
  }

  // Priority 2: Declaration Number (e.g. Nº da Declaração: 23277116202607001 -> 2026 07 -> 07/2026)
  if (!period) {
    for (const line of rawLines) {
      const declMatch = line.match(/(?:N[ºo\.]?\s*da\s*Declara[cç][aã]o|N[úu]mero\s*da\s*Declara[cç][aã]o)[:\s]*\d{8}(\d{4})(\d{2})\d{3}/i);
      if (declMatch) {
        period = `${declMatch[2]}/${declMatch[1]}`;
        break;
      }
    }
  }

  // Priority 3: Receipt Number (e.g. Número do Recibo: 01.07.26215... -> MM=07, YY=26 -> 07/2026)
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

  // Priority 4: From historical months list (the month directly following the last prior month)
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

  // 4. RBT12
  let rbt12: number | undefined;
  const rbt12Patterns = [
    /(?:RBT12\b|12\s*meses\s*anteriores\s*ao\s*PA|Receita\s*Bruta\s*Acumulada\s*nos\s*12\s*meses)/i,
    /RBT12\s*\(R\$\)/i,
    /\(RBT12\)/i
  ];
  const rbt12Res = extractLocalizedCurrency(rawLines, rbt12Patterns);
  if (rbt12Res && rbt12Res.value >= 0) {
    rbt12 = rbt12Res.value;
  }

  // 5. RBA
  let rba: number | undefined;
  const rbaPatterns = [
    /(?:RBA\b|ano-calend[aá]rio\s*corrente\s*\(RBA\)|Receita\s*Bruta\s*Acumulada\s*no\s*ano-calend[aá]rio\s*corrente)/i,
    /RBA\s*\(R\$\)/i,
    /\(RBA\)/i
  ];
  const rbaRes = extractLocalizedCurrency(rawLines, rbaPatterns);
  if (rbaRes && rbaRes.value >= 0) {
    rba = rbaRes.value;
  }

  // 6. RBAA
  let rbaa: number | undefined;
  const rbaaPatterns = [
    /(?:RBAA\b|ano-calend[aá]rio\s*anterior\s*\(RBAA\)|Receita\s*Bruta\s*Acumulada\s*no\s*ano-calend[aá]rio\s*anterior)/i,
    /RBAA\s*\(R\$\)/i,
    /\(RBAA\)/i
  ];
  const rbaaRes = extractLocalizedCurrency(rawLines, rbaaPatterns);
  if (rbaaRes && rbaaRes.value >= 0) {
    rbaa = rbaaRes.value;
  }

  // 7. Monthly Revenue (RPA)
  let monthlyRevenue: number | undefined;
  const paRevenuePatterns = [
    /Receita\s*Bruta\s*do\s*PA\s*\(RPA\)/i,
    /Receita\s*(?:Bruta\s*)?(?:Total\s*)?(?:(?:da\s*Empresa|do\s*Estabelecimento)\s*)?(?:(?:no|do|para\s*o)\s*)?(?:Per[ií]odo\s*de\s*Apura[cç][aã]o|PA)/i,
    /Receita\s*do\s*Per[ií]odo\s*de\s*Apura[cç][aã]o/i,
    /Receita\s*do\s*PA\b/i,
    /Receita\s*Bruta\s*do\s*PA\b/i,
  ];
  const paRes = extractLocalizedCurrency(rawLines, paRevenuePatterns);
  if (paRes && paRes.value >= 0) {
    monthlyRevenue = paRes.value;
  }

  // 8. Folha de Salários 12 meses
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
    // Check if line says "Nenhuma" or "Nenhum" or "0,00"
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

  // 9. Fator R
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

  // 10. Anexo
  let anexo: SimplesAnexo | undefined;
  if (/Anexo\s*III\b/i.test(cleanSingleLine)) anexo = 'III';
  else if (/Anexo\s*IV\b/i.test(cleanSingleLine)) anexo = 'IV';
  else if (/Anexo\s*V\b/i.test(cleanSingleLine)) anexo = 'V';
  else if (/Anexo\s*I\b/i.test(cleanSingleLine)) anexo = 'I';
  else if (/Anexo\s*II\b/i.test(cleanSingleLine)) anexo = 'II';

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

  // 11. UF and City
  let uf: string | undefined;
  let city: string | undefined;

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
      const ufMatch = line.match(/(?:UF|Estado)[:\s]+([A-Z]{2})\b/i);
      if (ufMatch) {
        uf = ufMatch[1].toUpperCase();
        break;
      }
    }
  }

  // 12. Historical monthly revenues (2.2.1)
  const monthlyHistory: Array<{ month: string; value: number }> = [];
  const monthRegex = /\b(0[1-9]|1[0-2])\/(202\d|203\d)\s+([0-9]{1,3}(?:\.[0-9]{3})*,[0-9]{2}|[0-9]+,[0-9]{2})\b/g;
  let mMatch;
  while ((mMatch = monthRegex.exec(cleanSingleLine)) !== null) {
    const month = `${mMatch[1]}/${mMatch[2]}`;
    const value = parseBRLNumber(mMatch[3]) || 0;
    monthlyHistory.push({ month, value });
  }

  return {
    cnpj,
    companyName,
    period,
    rbt12,
    rba,
    rbaa,
    monthlyRevenue,
    payroll12m,
    subjectToFatorR,
    fatorRCalculated,
    anexo: anexo || 'III',
    city,
    uf,
    monthlyHistory
  };
}

const sample = `1. Identificação do Contribuinte
CNPJ Matriz: 23.277.116/0001-78
Nome empresarial: C.L. ODONTOLOGIA S/S LTDA
Data de abertura no CNPJ: 25/08/2015
Optante pelo Simples Nacional: Sim
Regime de Apuração: Competência
Nº da Declaração: 23277116202607001
1.1 CNPJ das filiais presentes nesta declaração:
Nenhuma
.
2.Apuração do Simples Nacional
2.1 Discriminativo de Receitas
Total de Receitas Brutas (R$) Mercado Interno Mercado Externo Total
Receita Bruta do PA (RPA) - Competência 0,00 0,00 0,00
Receita bruta acumulada nos doze meses anteriores
ao PA (RBT12) 1.450,00 0,00 1.450,00
Receita bruta acumulada nos doze meses anteriores
ao PA proporcionalizada (RBT12p)
Receita bruta acumulada no ano-calendário corrente
(RBA) 1.450,00 0,00 1.450,00
Receita bruta acumulada no ano-calendário anterior
(RBAA) 9.010,00 0,00 9.010,00
Limite de receita bruta proporcionalizado 4.800.000,00 4.800.000,00
2.2) Receitas Brutas Anteriores (R$)
2.2.1) Mercado Interno
01/2025 0,00 02/2025 3.710,00 03/2025 800,00 04/2025 2.700,00
05/2025 1.800,00 06/2025 0,00 07/2025 0,00 08/2025 0,00
09/2025 0,00 10/2025 0,00 11/2025 0,00 12/2025 0,00
01/2026 0,00 02/2026 0,00 03/2026 0,00 04/2026 0,00
05/2026 0,00 06/2026 1.450,00
2.2.2) Mercado Externo
01/2025 0,00 02/2025 0,00 03/2025 0,00 04/2025 0,00
05/2025 0,00 06/2025 0,00 07/2025 0,00 08/2025 0,00
09/2025 0,00 10/2025 0,00 11/2025 0,00 12/2025 0,00
01/2026 0,00 02/2026 0,00 03/2026 0,00 04/2026 0,00
05/2026 0,00 06/2026 0,00
2.3) Folha de Salários Anteriores (R$)
Nenhuma
2.4) Fator r
Fator r = Não se aplica
2.5) Valores Fixos
Não se aplica
Número da Declaração: 23277116202607001 Número do Recibo: 01.07.26215.0279398-4
Autenticação: 23264.27699.71129.16113 Página 1
2.6) Resumo da Declaração
Receita Bruta Auferida (regime competência) Valor Total do Débito Declarado (R$)
0,00 0,00
2.7) Informações da Declaração por Estabelecimento
CNPJ Estabelecimento: 23.277.116/0001-78
Município: COLOMBO UF: PR
Sublimite de Receita Anual (R$): 3.600.000,00 Impedido de recolher ICMS/ISS no DAS: Não
Nenhuma atividade selecionada
2.8) Total Geral da Empresa
Total do Débito Declarado (exigível + suspenso) (R$)
IRPJ CSLL COFINS PIS/Pasep INSS/CPP ICMS IPI ISS Total
0,00 0,00 0,00 0,00 0,00 0,00 0,00 0,00 0,00
Total do Débito com Exigibilidade Suspensa (R$)
IRPJ CSLL COFINS PIS/Pasep INSS/CPP ICMS IPI ISS Total
0,00 0,00 0,00 0,00 0,00 0,00 0,00 0,00 0,00
Total do Débito Exigível (R$)
IRPJ CSLL COFINS PIS/Pasep INSS/CPP ICMS IPI ISS Total
0,00 0,00 0,00 0,00 0,00 0,00 0,00 0,00 0,00
.
3. Informações da Recepção da Declaração
Data e horário da transmissão da Declaração: 03/08/2026 15:58:24
Número do Recibo: 01.07.26215.0279398-4
Autenticação: 23264.27699.71129.16113`;

console.log(JSON.stringify(testParse(sample), null, 2));
