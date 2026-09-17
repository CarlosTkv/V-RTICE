// Test parser logic directly
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
  for (const line of lines) {
    for (const pat of patterns) {
      if (pat.test(line)) {
        const matches = [...line.matchAll(/(?:R\$\s*)?([0-9]{1,3}(?:\.[0-9]{3})*,[0-9]{2}|[0-9]+,[0-9]{2})\b/g)];
        if (matches.length > 0) {
          const lastMatch = matches[matches.length - 1];
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

const rawLines = sample.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
const cleanSingleLine = rawLines.join(' ');

let cnpj;
for (const line of rawLines) {
  const m = line.match(/(?:CNPJ\s*Matriz|CNPJ\s*B[aá]sico|CNPJ)[:\s]*(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})/i) ||
            line.match(/\b(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})\b/);
  if (m) {
    cnpj = m[1];
    break;
  }
}
console.log("CNPJ:", cnpj);

let companyName;
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
console.log("Company Name:", companyName);

let period;
for (const line of rawLines) {
  const periodMatch = line.match(/(?:Per[ií]odo\s*de\s*Apura[cç][aã]o(?:\s*\(PA\))?|PA)[:\s]*((?:0[1-9]|1[0-2])\s*\/\s*(?:202\d|203\d))\b/i);
  if (periodMatch) {
    period = periodMatch[1].replace(/\s+/g, '');
    break;
  }
}
console.log("Period with existing regex:", period);

// Check if we can extract period from declaration number:
// Nº da Declaração: 23277116202607001
for (const line of rawLines) {
  const declMatch = line.match(/(?:N[ºo\.]?\s*da\s*Declara[cç][aã]o|N[úu]mero\s*da\s*Declara[cç][aã]o)[:\s]*\d{8}(\d{4})(\d{2})\d{3}/i);
  if (declMatch) {
    console.log("Found period from Declaração:", `${declMatch[2]}/${declMatch[1]}`);
  }
}

// Check UF and Municipio
let uf;
for (const line of rawLines) {
  const ufMatch = line.match(/(?:UF|Estado)[:\s]+([A-Z]{2})\b/i) ||
                  line.match(/\/\s*([A-Z]{2})\b/) ||
                  line.match(/\b([A-Z]{2})\s*-\s*CEP\b/i);
  if (ufMatch) {
    uf = ufMatch[1].toUpperCase();
    break;
  }
}
console.log("UF:", uf);

for (const line of rawLines) {
  const munMatch = line.match(/Munic[ií]pio[:\s]+([A-Za-zÀ-ÖØ-öø-ÿ\s]+?)(?:\s+UF[:\s]+([A-Z]{2})|\/|\s*-\s*CEP|$)/i);
  if (munMatch) {
    console.log("Municipio match:", munMatch[1].trim(), "UF:", munMatch[2]);
  }
}

// Check Folha
let payroll12m;
const folhaPatterns = [
  /Folha\s*de\s*Sal[aá]rios(?:\s*[\/\-]\s*Encargos)?(?:\s*(?:nos|dos|[uú]ltimos)?\s*12\s*meses(?:\s*anteriores)?)?(?:\s*\(FS12\))?/i,
  /FS12\b/i,
  /Folha\s*de\s*Sal[aá]rios\s*\(FS12\)/i,
  /Encargos\s*12\s*meses/i
];
const folhaRes = extractLocalizedCurrency(rawLines, folhaPatterns);
console.log("folhaRes with currency:", folhaRes);

// Notice in sample:
// 2.3) Folha de Salários Anteriores (R$)
// Nenhuma
for (let i = 0; i < rawLines.length; i++) {
  if (/Folha\s*de\s*Sal[aá]rios/i.test(rawLines[i])) {
    const next = rawLines[i+1] || "";
    console.log("Folha line:", rawLines[i], "Next line:", next);
    if (/Nenhuma/i.test(next) || /Nenhum/i.test(next) || /0,00/.test(next)) {
      payroll12m = 0;
    }
  }
}
console.log("payroll12m parsed:", payroll12m);

// Check Fator R
let fatorRCalculated;
for (const line of rawLines) {
  if (/Fator\s*r\s*=\s*N[aã]o\s*se\s*aplica/i.test(line)) {
    console.log("Fator R = Não se aplica detected!");
  }
}

// Check RBAA
const rbaaRes = extractLocalizedCurrency(rawLines, [
  /(?:RBAA\b|ano-calend[aá]rio\s*anterior\s*\(RBAA\)|Receita\s*Bruta\s*Acumulada\s*no\s*ano-calend[aá]rio\s*anterior)/i,
  /RBAA\s*\(R\$\)/i,
  /\(RBAA\)/i
]);
console.log("rbaaRes:", rbaaRes);
