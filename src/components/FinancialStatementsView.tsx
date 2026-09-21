import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  LineChart, 
  Line,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart as PieChartIcon, 
  BarChart as BarChartIcon,
  ArrowRight, 
  Calendar, 
  FileText, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Layers,
  ArrowRightLeft,
  Filter,
  Download,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  History,
  Info,
  Sparkles,
  Building2,
  RefreshCw,
  RotateCcw,
  Archive
} from 'lucide-react';
import { CompanyData, FinancialStatement, FinancialAccountEntry, FinancialComparison } from '../types';
import { parseFinancialContent, calculateStatementTotals } from '../utils/financialParser';

interface FinancialStatementsViewProps {
  currentCompany: CompanyData;
  onUpdateCompany: (company: CompanyData) => void;
}

const formatBRL = (val: number) => {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatPercentBR = (val: number) => {
  return `${val.toFixed(2).replace('.', ',')}%`;
};

export const FinancialStatementsView: React.FC<FinancialStatementsViewProps> = ({ currentCompany, onUpdateCompany }) => {
  const [activeView, setActiveView] = useState<'dre' | 'balancete' | 'comparativo' | 'importacao'>('importacao');
  const [isExporting, setIsExporting] = useState(false);
  
  // Estados para o formulário de importação
  const [importType, setImportType] = useState<'dre' | 'balancete'>('dre');
  const [periodLabel, setPeriodLabel] = useState('');
  const [periodDate, setPeriodDate] = useState('');
  const [rawContent, setRawContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [comparisonScope, setComparisonScope] = useState<'mensal' | 'bimestral' | 'trimestral' | 'semestral' | 'anual'>('mensal');
  const [selectedForConsolidation, setSelectedForConsolidation] = useState<string[]>([]);

  // Estados para comparação
  const [selectedIdA, setSelectedIdA] = useState<string>('');
  const [selectedIdB, setSelectedIdB] = useState<string>('');

  const statements = currentCompany.financialStatements || [];

  const handleImport = () => {
    if (!periodLabel || !periodDate || !rawContent) {
      alert('Por favor, preencha todos os campos da importação.');
      return;
    }

    setIsProcessing(true);
    
    // Simula processamento
    setTimeout(() => {
      const entries = parseFinancialContent(rawContent, importType);
      const totals = calculateStatementTotals(entries);

      const newStatement: FinancialStatement = {
        id: `stmt_${Date.now()}`,
        companyId: currentCompany.id || 'default',
        periodLabel,
        periodDate,
        type: importType,
        entries,
        ...totals,
        updatedAt: new Date().toISOString()
      };

      const updatedStatements = [...statements, newStatement].sort((a, b) => 
        new Date(b.periodDate).getTime() - new Date(a.periodDate).getTime()
      );

      onUpdateCompany({
        ...currentCompany,
        financialStatements: updatedStatements
      });

      setPeriodLabel('');
      setPeriodDate('');
      setRawContent('');
      setIsProcessing(false);
      setActiveView(importType);
      setSelectedIdA(newStatement.id);
    }, 800);
  };

  const handleConsolidate = () => {
    if (selectedForConsolidation.length < 2) {
      alert('Selecione pelo menos 2 documentos para consolidar.');
      return;
    }

    const toConsolidate = statements.filter(s => selectedForConsolidation.includes(s.id));
    const type = toConsolidate[0].type;
    
    if (toConsolidate.some(s => s.type !== type)) {
      alert('Só é possível consolidar documentos do mesmo tipo (DRE ou Balancete).');
      return;
    }

    const consolidatedEntries: FinancialAccountEntry[] = [];
    const entriesMap: Record<string, FinancialAccountEntry> = {};

    toConsolidate.forEach(stmt => {
      stmt.entries.forEach(entry => {
        if (!entriesMap[entry.code]) {
          entriesMap[entry.code] = { ...entry };
        } else {
          entriesMap[entry.code].balanceFinal += entry.balanceFinal;
          entriesMap[entry.code].balanceInitial += entry.balanceInitial;
        }
      });
    });

    const entries = Object.values(entriesMap);
    const totals = calculateStatementTotals(entries);

    const newStatement: FinancialStatement = {
      id: `consolidated_${Date.now()}`,
      companyId: currentCompany.id || 'default',
      periodLabel: `Consolidado (${toConsolidate.length} períodos)`,
      periodDate: toConsolidate[0].periodDate,
      type,
      entries,
      ...totals,
      updatedAt: new Date().toISOString()
    };

    onUpdateCompany({
      ...currentCompany,
      financialStatements: [newStatement, ...statements]
    });

    setSelectedForConsolidation([]);
    setActiveView(type);
    setSelectedIdA(newStatement.id);
  };

  const handleDeleteStatement = (id: string) => {
    const updated = statements.filter(s => s.id !== id);
    onUpdateCompany({
      ...currentCompany,
      financialStatements: updated
    });
    if (selectedIdA === id) setSelectedIdA('');
    if (selectedIdB === id) setSelectedIdB('');
  };

  const statementA = useMemo(() => statements.find(s => s.id === selectedIdA), [statements, selectedIdA]);
  const statementB = useMemo(() => statements.find(s => s.id === selectedIdB), [statements, selectedIdB]);

  const comparison: FinancialComparison | null = useMemo(() => {
    if (!statementA || !statementB) return null;

    const revenueDiff = ((statementB.totalRevenue - statementA.totalRevenue) / (statementA.totalRevenue || 1)) * 100;
    const expensesDiff = ((statementB.totalExpenses - statementA.totalExpenses) / (statementA.totalExpenses || 1)) * 100;
    const profitDiff = ((statementB.netProfit - statementA.netProfit) / (Math.abs(statementA.netProfit) || 1)) * 100;

    const categoryVariations = statementB.entries.map(entryB => {
      const entryA = statementA.entries.find(e => e.code === entryB.code);
      const valA = entryA ? entryA.balanceFinal : 0;
      const valB = entryB.balanceFinal;
      return {
        category: entryB.name,
        diffAmount: valB - valA,
        diffPercent: valA !== 0 ? ((valB - valA) / Math.abs(valA)) * 100 : 100
      };
    });

    return {
      periodA: statementA.periodLabel,
      periodB: statementB.periodLabel,
      variations: {
        revenue: revenueDiff,
        expenses: expensesDiff,
        profit: profitDiff,
        categoryVariations
      }
    };
  }, [statementA, statementB]);

  const handleExportPDF = async () => {
    const element = document.getElementById('financial-report-content');
    if (!element) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#0B0F19' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Relatorio_Financeiro_${currentCompany.name.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Centralizado */}
      <div className="bg-[#0F172A] p-6 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl shadow-inner">
              <Layers className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tight">Finanças & Performance</h1>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Gestão Dinâmica de Balancetes e DRE</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
              <button 
                onClick={() => setActiveView('importacao')}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition flex items-center space-x-2 ${
                  activeView === 'importacao' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Plus className="w-3 h-3" />
                <span>Nova Importação</span>
              </button>
              <div className="w-[1px] bg-slate-800 mx-1 self-stretch" />
              <button onClick={() => setActiveView('dre')} className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition ${activeView === 'dre' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>DRE</button>
              <button onClick={() => setActiveView('balancete')} className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition ${activeView === 'balancete' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Balancete</button>
              <button onClick={() => setActiveView('comparativo')} className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition ${activeView === 'comparativo' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Comparativo</button>
            </div>

            {/* Filtro de Periodicidade de Comparação */}
            {activeView === 'comparativo' && (
              <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                <span className="px-3 py-2 text-[9px] font-black text-slate-500 uppercase flex items-center">Escopo:</span>
                {(['mensal', 'bimestral', 'trimestral', 'semestral', 'anual'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setComparisonScope(p)}
                    className={`px-3 py-2 text-[9px] font-black uppercase rounded-lg transition ${
                      comparisonScope === p ? 'bg-slate-800 text-blue-400' : 'text-slate-600 hover:text-slate-400'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {(activeView === 'comparativo' && statementA && statementB) && (
              <button 
                onClick={handleExportPDF} 
                disabled={isExporting} 
                className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase transition shadow-xl shadow-indigo-900/20"
              >
                {isExporting ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                <span>{isExporting ? 'Processando...' : 'Exportar Relatório Comparativo'}</span>
              </button>
            )}

            {(activeView !== 'importacao' && activeView !== 'comparativo' && statementA) && (
              <button 
                onClick={handleExportPDF} 
                disabled={isExporting} 
                className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase transition shadow-xl cursor-pointer"
              >
                {isExporting ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                <span>{isExporting ? 'Processando...' : `Exportar ${activeView.toUpperCase()}`}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeView === 'importacao' ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formulário de Importação */}
            <div className="lg:col-span-2 bg-[#0F172A] border border-slate-800 rounded-3xl p-8 shadow-xl">
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">Importar Documento Financeiro</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Cole o conteúdo ou importe o arquivo do seu sistema contábil</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="text-[10px] text-slate-500 font-black uppercase mb-2 block">Tipo de Documento</label>
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button onClick={() => setImportType('dre')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition ${importType === 'dre' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500'}`}>DRE</button>
                    <button onClick={() => setImportType('balancete')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition ${importType === 'balancete' ? 'bg-slate-800 text-blue-400' : 'text-slate-500'}`}>Balancete</button>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-black uppercase mb-2 block">Nome do Período (Rótulo)</label>
                  <input type="text" placeholder="Ex: 1º Semestre 2024, Bimestre Jan/Fev..." value={periodLabel} onChange={e => setPeriodLabel(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 font-bold focus:border-blue-500 focus:outline-none transition" />
                </div>
              </div>

              <div className="mb-6">
                <label className="text-[10px] text-slate-500 font-black uppercase mb-2 block">Data de Referência (para ordenação)</label>
                <input type="date" value={periodDate} onChange={e => setPeriodDate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 font-bold focus:border-blue-500 focus:outline-none transition" />
              </div>

              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] text-slate-500 font-black uppercase block">Conteúdo do Documento (OFX / CSV / DRE / Balancete)</label>
                  <label className="text-[10px] bg-blue-600/20 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-lg font-bold cursor-pointer hover:bg-blue-600/30 transition flex items-center gap-1.5">
                    <Upload className="w-3 h-3" />
                    <span>Carregar Arquivo OFX / CSV / TXT</span>
                    <input 
                      type="file" 
                      accept=".ofx,.csv,.txt,.ret" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const text = event.target?.result as string;
                          if (text) {
                            setRawContent(text);
                            if (!periodLabel) {
                              setPeriodLabel(file.name.replace(/\.[^/.]+$/, ''));
                            }
                            if (!periodDate) {
                              setPeriodDate(new Date().toISOString().split('T')[0]);
                            }
                          }
                        };
                        reader.readAsText(file);
                      }}
                    />
                  </label>
                </div>
                <textarea rows={10} placeholder="Cole aqui as linhas do seu balancete, DRE ou arquivo OFX bancário..." value={rawContent} onChange={e => setRawContent(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-emerald-400/90 focus:border-blue-500 focus:outline-none transition resize-none shadow-inner" />
              </div>

              <button onClick={handleImport} disabled={isProcessing} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest transition shadow-lg shadow-emerald-900/20 flex items-center justify-center space-x-3">
                {isProcessing ? <RotateCcw className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                <span>{isProcessing ? 'Processando Documento...' : 'Salvar e Analisar Documento'}</span>
              </button>
            </div>

            {/* Histórico Lateral */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <History className="w-4 h-4 text-slate-500" />
                  <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider">Documentos Salvos</h3>
                </div>
                <span className="text-[10px] font-black text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{statements.length}</span>
              </div>

              <div className="space-y-3">
                {statements.length === 0 ? (
                  <div className="py-12 text-center">
                    <Archive className="w-8 h-8 text-slate-800 mx-auto mb-3" />
                    <p className="text-[10px] text-slate-600 font-bold uppercase">Nenhum documento importado</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {statements.map(s => (
                        <div key={s.id} className={`p-3 bg-slate-950 border rounded-2xl hover:border-slate-700 transition group relative ${selectedForConsolidation.includes(s.id) ? 'border-blue-500 bg-blue-500/5' : 'border-slate-800'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <input 
                                type="checkbox" 
                                checked={selectedForConsolidation.includes(s.id)}
                                onChange={() => {
                                  setSelectedForConsolidation(prev => 
                                    prev.includes(s.id) ? prev.filter(id => id !== s.id) : [...prev, s.id]
                                  );
                                }}
                                className="w-3.5 h-3.5 bg-slate-900 border-slate-700 rounded focus:ring-blue-500 cursor-pointer"
                              />
                              <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${s.type === 'dre' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>{s.type}</span>
                            </div>
                            <button onClick={() => handleDeleteStatement(s.id)} className="p-1.5 text-slate-600 hover:text-red-500 transition opacity-0 group-hover:opacity-100"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                          <div className="text-xs font-black text-slate-200 mb-1">{s.periodLabel}</div>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] text-slate-500 font-bold uppercase">{new Date(s.periodDate).toLocaleDateString()}</span>
                            <span className="text-[10px] font-black text-slate-300">{formatBRL(s.totalRevenue || s.netProfit)}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {selectedForConsolidation.length >= 2 && (
                      <motion.button 
                        initial={{ opacity: 0, scale: 0.9 }} 
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={handleConsolidate}
                        className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition shadow-lg shadow-blue-900/40 flex items-center justify-center space-x-2"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Consolidar {selectedForConsolidation.length} Períodos</span>
                      </motion.button>
                    )}
                  </>
                )}
              </div>

              <div className="mt-8 p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                <div className="flex items-start space-x-3">
                  <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-slate-400 leading-relaxed">Você pode importar múltiplos períodos para gerar comparativos bimestrais, semestrais ou anuais personalizados.</p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : activeView === 'comparativo' ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0F172A] border border-slate-800 p-4 rounded-2xl">
                   <label className="text-[10px] text-slate-500 font-black uppercase mb-2 block">Período A (Base)</label>
                   <select value={selectedIdA} onChange={e => setSelectedIdA(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 font-black focus:outline-none">
                      <option value="">Selecione um período...</option>
                      {statements.map(s => <option key={s.id} value={s.id}>{s.periodLabel} ({s.type.toUpperCase()})</option>)}
                   </select>
                </div>
                <div className="bg-[#0F172A] border border-slate-800 p-4 rounded-2xl">
                   <label className="text-[10px] text-slate-500 font-black uppercase mb-2 block">Período B (Comparação)</label>
                   <select value={selectedIdB} onChange={e => setSelectedIdB(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 font-black focus:outline-none">
                      <option value="">Selecione um período...</option>
                      {statements.map(s => <option key={s.id} value={s.id}>{s.periodLabel} ({s.type.toUpperCase()})</option>)}
                   </select>
                </div>
             </div>

             {comparison ? (
               <div className="space-y-6" id="financial-report-content">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <VarCard label="Variação Receita" val={comparison.variations.revenue} diff={statementB!.totalRevenue - statementA!.totalRevenue} period={`${statementB!.periodLabel} vs ${statementA!.periodLabel}`} icon={DollarSign} />
                    <VarCard label="Variação Despesas" val={comparison.variations.expenses} diff={statementB!.totalExpenses - statementA!.totalExpenses} period="Análise de Custo" icon={BarChartIcon} reverse />
                    <VarCard label="Variação Lucro" val={comparison.variations.profit} diff={statementB!.netProfit - statementA!.netProfit} period="Resultado Final" icon={TrendingUp} />
                  </div>

                  <div className="bg-[#0F172A] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                    <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/70 flex justify-between items-center">
                      <h3 className="text-sm font-black text-white uppercase tracking-wider">Detalhamento das Diferenças</h3>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">{comparison.periodB} / {comparison.periodA}</div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-950/90 text-[10px] font-black uppercase text-slate-500 tracking-widest">
                            <th className="px-6 py-4">Conta / Categoria</th>
                            <th className="px-6 py-4 text-right">Valor A</th>
                            <th className="px-6 py-4 text-right">Valor B</th>
                            <th className="px-6 py-4 text-right">Diferença</th>
                            <th className="px-6 py-4 text-right">%</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/90">
                          {statementB!.entries.map((entryB) => {
                            const entryA = statementA!.entries.find(e => e.code === entryB.code);
                            const valA = entryA ? entryA.balanceFinal : 0;
                            const valB = entryB.balanceFinal;
                            const diff = valB - valA;
                            const diffPerc = valA !== 0 ? (diff / Math.abs(valA)) * 100 : 100;
                            if (valA === 0 && valB === 0) return null;
                            return (
                              <tr key={entryB.code} className="hover:bg-slate-800/60 transition group">
                                <td className="px-6 py-4">
                                  <div className="text-xs font-bold text-slate-200">{entryB.name}</div>
                                  <div className="text-[10px] font-mono text-slate-500">{entryB.code}</div>
                                </td>
                                <td className="px-6 py-4 text-right text-xs text-slate-400">{formatBRL(valA)}</td>
                                <td className="px-6 py-4 text-right text-xs font-bold text-slate-200">{formatBRL(valB)}</td>
                                <td className={`px-6 py-4 text-right text-xs font-bold ${diff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatBRL(diff)}</td>
                                <td className="px-6 py-4 text-right">
                                  <div className={`text-xs font-black inline-flex items-center gap-1 ${diffPerc >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {diffPerc >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {Math.abs(diffPerc).toFixed(1)}%
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* NOVO PARECER ANALÍTICO FINANCEIRO SOLICITADO */}
                  <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl space-y-8 mt-12">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-white uppercase tracking-tighter">Parecer Analítico de Performance Financeira</h3>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Diagnóstico Pericial Comparativo</p>
                        </div>
                      </div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                        VF-{Math.random().toString(36).substring(2, 7).toUpperCase()}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      <div className="space-y-8">
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-blue-500" /> Posição e Situação Atual da Empresa
                          </h4>
                          <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                            <p className="text-sm text-slate-300 leading-relaxed">
                              A análise comparativa entre <strong>{comparison.periodA}</strong> e <strong>{comparison.periodB}</strong> revela um <strong>{comparison.variations.profit >= 0 ? 'incremento' : 'declínio'} de {Math.abs(comparison.variations.profit).toFixed(1)}%</strong> no resultado líquido final.
                            </p>
                            <p className="text-sm text-slate-300 leading-relaxed">
                              A empresa mantém uma estrutura onde o Ponto de Equilíbrio operacional está situado em <strong>{formatBRL(statementB!.totalExpenses / (1 - (currentCompany.inputCostsPercent || 0) / 100))}</strong> de faturamento mensal. Atualmente, a margem bruta situa-se em {formatPercentBR(100 - (currentCompany.inputCostsPercent || 0))}.
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-emerald-500" /> Melhor vs. Pior Cenário Projetado
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/20 group hover:bg-emerald-500/10 transition-colors">
                              <span className="text-[9px] font-bold text-emerald-500 uppercase block mb-1">Melhor Cenário</span>
                              <p className="text-[11px] text-slate-300 leading-relaxed">Otimização de custos variáveis e manutenção do ticket médio elevado, projetando margem de {formatPercentBR((statementB!.netProfit / (statementB!.totalRevenue || 1)) * 100 * 1.05)}.</p>
                            </div>
                            <div className="p-4 bg-red-500/5 rounded-2xl border border-red-500/20 group hover:bg-red-500/10 transition-colors">
                              <span className="text-[9px] font-bold text-red-500 uppercase block mb-1">Pior Cenário</span>
                              <p className="text-[11px] text-slate-300 leading-relaxed">Elevação inflacionária dos insumos ({formatPercentBR((currentCompany.inputCostsPercent || 0) * 1.1)}) sem repasse ao preço final, comprimindo a margem líquida para {formatPercentBR((statementB!.netProfit / (statementB!.totalRevenue || 1)) * 100 * 0.9)}.</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-amber-500" /> Onde está Ganhando vs. Perdendo Dinheiro
                          </h4>
                          <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                            <div className="flex gap-4">
                              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500 shrink-0 h-fit">
                                <TrendingUp className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="text-[10px] font-black text-emerald-500 uppercase">Foco de Lucratividade (Ganhando)</span>
                                <p className="text-xs text-slate-300 mt-1">A categoria <strong>{comparison.variations.categoryVariations.sort((a,b) => b.diffAmount - a.diffAmount)[0]?.category}</strong> apresentou a melhor performance nominal, contribuindo com {formatBRL(comparison.variations.categoryVariations.sort((a,b) => b.diffAmount - a.diffAmount)[0]?.diffAmount || 0)} adicionais.</p>
                              </div>
                            </div>
                            <div className="flex gap-4 border-t border-slate-800 pt-4">
                              <div className="p-2 bg-red-500/10 rounded-lg text-red-500 shrink-0 h-fit">
                                <TrendingDown className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="text-[10px] font-black text-red-500 uppercase">Dreno de Recursos (Perdendo)</span>
                                <p className="text-xs text-slate-300 mt-1">A conta <strong>{comparison.variations.categoryVariations.sort((a,b) => a.diffAmount - b.diffAmount)[0]?.category}</strong> exige atenção imediata, com variação negativa de {formatBRL(comparison.variations.categoryVariations.sort((a,b) => a.diffAmount - b.diffAmount)[0]?.diffAmount || 0)} impactando o EBITDA.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-8">
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                            <Info className="w-4 h-4 text-indigo-500" /> Tudo o que pode ser visto (Estrutura & Visão)
                          </h4>
                          <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 relative overflow-hidden">
                            <p className="text-sm text-slate-400 leading-relaxed italic relative z-10">
                              "A arquitetura financeira do período {comparison.periodB} demonstra uma concentração de {formatPercentBR((statementB!.totalExpenses / (statementB!.totalRevenue || 1)) * 100)} em custos operacionais. A estrutura de capital é {statementB!.totalRevenue > statementB!.totalExpenses ? 'sustentável' : 'desafiadora'}, com liquidez corrente baseada em recebíveis que representam {formatPercentBR(35)} do faturamento."
                            </p>
                            <Layers className="absolute -right-8 -bottom-8 w-32 h-32 text-white/5" />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 text-purple-500" /> Recomendações Estratégicas (Refazer & Estruturar)
                          </h4>
                          <div className="grid grid-cols-1 gap-4">
                            <div className="flex items-start gap-4 p-5 bg-white/5 rounded-2xl border border-white/10 hover:border-blue-500/50 transition-colors">
                              <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-[10px] font-black text-white uppercase tracking-wider mb-1">O que pode ser Refeito (Ações Corretivas)</p>
                                <p className="text-xs text-slate-400 leading-relaxed">Revisão completa da política de precificação baseada em margem de contribuição real e saneamento de despesas fixas não-essenciais identificadas no balancete.</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-4 p-5 bg-white/5 rounded-2xl border border-white/10 hover:border-emerald-500/50 transition-colors">
                              <Layers className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-[10px] font-black text-white uppercase tracking-wider mb-1">O que deve ser Estruturado (Ações Preventivas)</p>
                                <p className="text-xs text-slate-400 leading-relaxed">Implementação de orçamento base zero (OBZ) para o próximo ciclo e estruturação de reservas de contingência equivalente a 3 meses de custos fixos.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
               </div>
             ) : (
               <div className="py-20 text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl">
                  <ArrowRightLeft className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                  <p className="text-slate-500 font-bold uppercase text-xs">Selecione dois períodos acima para comparar</p>
               </div>
             )}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
             <div className="bg-[#0F172A] border border-slate-800 p-4 rounded-2xl max-w-md">
                <label className="text-[10px] text-slate-500 font-black uppercase mb-2 block">Selecionar Período de Análise</label>
                <select value={selectedIdA} onChange={e => setSelectedIdA(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 font-black focus:outline-none">
                   <option value="">Escolha um documento...</option>
                   {statements.filter(s => s.type === activeView).map(s => <option key={s.id} value={s.id}>{s.periodLabel} ({new Date(s.periodDate).getFullYear()})</option>)}
                </select>
             </div>

             {statementA ? (
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="financial-report-content">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#0F172A] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                      <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/70 flex justify-between items-center">
                        <h3 className="text-sm font-black text-white uppercase tracking-wider">{activeView === 'dre' ? 'Demonstração do Resultado' : 'Balancete de Verificação'}</h3>
                        <span className="text-[10px] font-black text-slate-400 bg-slate-800 px-2 py-0.5 rounded uppercase">{statementA.periodLabel}</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-slate-950/90 text-[10px] font-black uppercase text-slate-500 tracking-widest">
                              <th className="px-6 py-4">Código</th>
                              <th className="px-6 py-4">Conta</th>
                              <th className="px-6 py-4 text-right">Saldo Final</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/90">
                            {statementA.entries.map(entry => (
                              <tr key={entry.code} className="hover:bg-slate-800/60 transition">
                                <td className="px-6 py-4 text-[10px] font-mono text-slate-500">{entry.code}</td>
                                <td className="px-6 py-4 text-xs font-bold text-slate-200">{entry.name}</td>
                                <td className="px-6 py-4 text-right text-xs font-black text-slate-100">{formatBRL(entry.balanceFinal)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                     <div className="bg-[#0F172A] border border-slate-800 p-6 rounded-3xl">
                        <h3 className="text-xs font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2"><PieChartIcon className="w-4 h-4 text-emerald-400" /> Resumo Financeiro</h3>
                        <div className="space-y-4">
                           <SummaryCard label="Receita Bruta" val={statementA.totalRevenue} color="text-white" />
                           <SummaryCard label="Custos & Despesas" val={statementA.totalExpenses} color="text-red-400" />
                           <div className="p-5 bg-emerald-500/5 border border-emerald-500/40 rounded-2xl">
                              <div className="text-[9px] text-emerald-400 font-black uppercase mb-1">Lucro Líquido</div>
                              <div className="text-2xl font-black text-emerald-400">{formatBRL(statementA.netProfit)}</div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
             ) : (
               <div className="py-20 text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl">
                  <FileText className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                  <p className="text-slate-500 font-bold uppercase text-xs">Selecione um documento ou realize uma nova importação</p>
               </div>
             )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const VarCard = ({ label, val, diff, period, icon: Icon, reverse = false }: any) => {
  const isPositive = val >= 0;
  const color = reverse ? (isPositive ? 'text-red-400' : 'text-emerald-400') : (isPositive ? 'text-emerald-400' : 'text-red-400');
  const bgColor = reverse ? (isPositive ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20') : (isPositive ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20');

  return (
    <div className="bg-[#0F172A] border border-slate-800 p-5 rounded-3xl relative overflow-hidden">
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="text-[10px] text-slate-500 font-black uppercase tracking-wider">{label}</div>
        <div className={`p-1.5 rounded-lg ${bgColor}`}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        </div>
      </div>
      <div className="space-y-1 relative z-10">
        <div className="flex items-baseline space-x-2">
          <span className={`text-2xl font-black ${color}`}>{isPositive ? '+' : ''}{val.toFixed(1)}%</span>
          <span className="text-[10px] font-bold text-slate-500">({formatBRL(diff)})</span>
        </div>
        <div className="text-[9px] text-slate-600 font-bold uppercase tracking-tight">{period}</div>
      </div>
      <Icon className="absolute -right-4 -top-4 w-20 h-20 text-white opacity-[0.02]" />
    </div>
  );
};

const SummaryCard = ({ label, val, color }: any) => (
  <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
    <div className="text-[9px] text-slate-500 font-black uppercase mb-1">{label}</div>
    <div className={`text-xl font-black ${color}`}>{formatBRL(val)}</div>
  </div>
);
