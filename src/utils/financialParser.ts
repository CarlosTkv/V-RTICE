import { FinancialStatement, FinancialAccountEntry } from '../types';

/**
 * Função para analisar strings de Balancete/DRE e extrair entries.
 * Esta é uma versão simplificada que seria substituída por um parser real de PDF/Excel.
 */
export const parseFinancialContent = (content: string, type: 'balancete' | 'dre'): FinancialAccountEntry[] => {
  // Mock de lógica de parser
  const lines = content.split('\n').filter(l => l.trim().length > 0);
  const entries: FinancialAccountEntry[] = [];

  lines.forEach(line => {
    // Regex simples para capturar Código Nome Valor (ex: 1.1.01 Caixa 1.500,00)
    const match = line.match(/([\d\.]+)\s+([\w\s\/]+)\s+([\d\.,]+)/);
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

  return entries;
};

export const calculateStatementTotals = (entries: FinancialAccountEntry[]) => {
  const totalRevenue = entries
    .filter(e => e.code.startsWith('3')) // Mock rule for revenue
    .reduce((acc, curr) => acc + curr.balanceFinal, 0);
    
  const totalExpenses = entries
    .filter(e => e.code.startsWith('4') || e.code.startsWith('3.1.1')) // Mock rule for expenses
    .reduce((acc, curr) => acc + curr.balanceFinal, 0);

  return {
    totalRevenue,
    totalExpenses,
    netProfit: totalRevenue - totalExpenses
  };
};
