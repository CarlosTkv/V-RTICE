import { FinancialStatement, FinancialAccountEntry } from '../types';

/**
 * Analisador de arquivos OFX (Extratos bancários padrões Itaú, Bradesco, BB, Santander, Nubank, Sicoob, etc.)
 */
export const parseOFXContent = (ofxString: string): FinancialAccountEntry[] => {
  const entries: FinancialAccountEntry[] = [];
  
  // Extrair blocos <STMTTRN> ... </STMTTRN>
  const trnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
  let match: RegExpExecArray | null;
  
  let revenueIndex = 1;
  let expenseIndex = 1;

  while ((match = trnRegex.exec(ofxString)) !== null) {
    const block = match[1];
    
    // Captura tipo (CREDIT/DEBIT), valor (<TRNAMT>) e histórico/memo (<MEMO> ou <NAME>)
    const trnTypeMatch = block.match(/<TRNTYPE>(.*?)(\r|\n|<)/i);
    const trnAmtMatch = block.match(/<TRNAMT>(.*?)(\r|\n|<)/i);
    const memoMatch = block.match(/<(MEMO|NAME)>(.*?)(\r|\n|<)/i);

    const type = trnTypeMatch ? trnTypeMatch[1].trim() : '';
    const rawAmt = trnAmtMatch ? trnAmtMatch[1].trim().replace(',', '.') : '0';
    const amount = parseFloat(rawAmt) || 0;
    const memo = memoMatch ? memoMatch[2].trim() : 'Transação Bancária';

    if (amount > 0 || type.toUpperCase() === 'CREDIT') {
      const code = `3.1.01.${String(revenueIndex++).padStart(3, '0')}`;
      entries.push({
        code,
        name: `Receita: ${memo}`,
        balanceInitial: 0,
        debit: 0,
        credit: Math.abs(amount),
        balanceFinal: Math.abs(amount),
        type: 'credit',
        category: 'Revenue'
      });
    } else if (amount < 0 || type.toUpperCase() === 'DEBIT') {
      const code = `4.1.01.${String(expenseIndex++).padStart(3, '0')}`;
      entries.push({
        code,
        name: `Despesa: ${memo}`,
        balanceInitial: 0,
        debit: Math.abs(amount),
        credit: 0,
        balanceFinal: Math.abs(amount),
        type: 'debit',
        category: 'Expense'
      });
    }
  }

  return entries;
};

/**
 * Analisador de arquivos CSV bancários (Data;Descrição;Valor)
 */
export const parseCSVFinancialContent = (csvString: string): FinancialAccountEntry[] => {
  const lines = csvString.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const entries: FinancialAccountEntry[] = [];

  let revenueIndex = 1;
  let expenseIndex = 1;

  lines.forEach(line => {
    if (line.toLowerCase().includes('data') && line.toLowerCase().includes('descri')) return; // header

    const cols = line.split(/;|,|\t/);
    if (cols.length >= 2) {
      const memo = cols[1] ? cols[1].replace(/"/g, '').trim() : 'Lançamento CSV';
      const rawVal = (cols[2] || cols[1] || '0').replace(/"/g, '').replace(/\./g, '').replace(',', '.');
      const val = parseFloat(rawVal) || 0;

      if (val > 0) {
        entries.push({
          code: `3.1.01.${String(revenueIndex++).padStart(3, '0')}`,
          name: `Receita: ${memo}`,
          balanceInitial: 0,
          debit: 0,
          credit: Math.abs(val),
          balanceFinal: Math.abs(val),
          type: 'credit',
          category: 'Revenue'
        });
      } else if (val < 0) {
        entries.push({
          code: `4.1.01.${String(expenseIndex++).padStart(3, '0')}`,
          name: `Despesa: ${memo}`,
          balanceInitial: 0,
          debit: Math.abs(val),
          credit: 0,
          balanceFinal: Math.abs(val),
          type: 'debit',
          category: 'Expense'
        });
      }
    }
  });

  return entries;
};

/**
 * Função principal para analisar strings de Balancete, DRE, OFX ou CSV.
 */
export const parseFinancialContent = (content: string, type: 'balancete' | 'dre'): FinancialAccountEntry[] => {
  if (content.includes('<OFX>') || content.includes('<STMTTRN>')) {
    return parseOFXContent(content);
  }

  const lines = content.split('\n').filter(l => l.trim().length > 0);
  const entries: FinancialAccountEntry[] = [];

  lines.forEach(line => {
    // Captura padrão Código Nome Valor (ex: 1.1.01 Caixa 1.500,00)
    const match = line.match(/([\d\.]+)\s+([\w\s\/\-\_]+)\s+([\d\.,]+)/);
    if (match) {
      const code = match[1];
      const name = match[2].trim();
      const balance = parseFloat(match[3].replace(/\./g, '').replace(',', '.'));
      
      entries.push({
        code,
        name,
        balanceInitial: 0,
        debit: 0,
        credit: 0,
        balanceFinal: balance,
        type: code.startsWith('1') || code.startsWith('3') ? 'debit' : 'credit',
        category: code.startsWith('1') ? 'Asset' : 
                  code.startsWith('2') ? 'Liability' : 
                  code.startsWith('3') ? 'Revenue' : 'Expense'
      });
    }
  });

  if (entries.length === 0) {
    return parseCSVFinancialContent(content);
  }

  return entries;
};

export const calculateStatementTotals = (entries: FinancialAccountEntry[]) => {
  const totalRevenue = entries
    .filter(e => e.category === 'Revenue' || e.code.startsWith('3'))
    .reduce((acc, curr) => acc + curr.balanceFinal, 0);
    
  const totalExpenses = entries
    .filter(e => e.category === 'Expense' || e.code.startsWith('4') || e.code.startsWith('3.1.1'))
    .reduce((acc, curr) => acc + curr.balanceFinal, 0);

  return {
    totalRevenue,
    totalExpenses,
    netProfit: totalRevenue - totalExpenses
  };
};

