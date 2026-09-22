import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Area, 
  BarChart, 
  Bar, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  Coins, 
  Scale, 
  ShieldCheck, 
  TrendingUp, 
  Activity, 
  FileText, 
  Download, 
  Filter, 
  Layers, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Sparkles, 
  Calculator, 
  CheckCircle, 
  ExternalLink,
  Copy,
  Info
} from 'lucide-react';
import { CompanyData } from '../types';
import { 
  calculateDocTaxDetails, 
  generateMonthlyTaxTimeSeries, 
  DocTaxDetails 
} from '../utils/verticeTaxEngine';

interface VerticeFiscalDashboardProps {
  documents: any[];
  currentCompany: CompanyData;
  onNavigateToCalculator: (docId?: string) => void;
  showToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

export const VerticeFiscalDashboard: React.FC<VerticeFiscalDashboardProps> = ({
  documents,
  currentCompany,
  onNavigateToCalculator,
  showToast
}) => {
  const [timeRange, setTimeRange] = useState<'ano' | '1sem' | '2sem' | 'mes'>('ano');
  const [calcMethodology, setCalcMethodology] = useState<'base_dupla' | 'base_simples'>('base_dupla');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('todos');
  const [activeChartMetric, setActiveChartMetric] = useState<'todos' | 'difal' | 'st' | 'fcp'>('todos');

  // Compute live tax data for all documents
  const calculatedDocs: DocTaxDetails[] = useMemo(() => {
    return documents.map(d => calculateDocTaxDetails(d, currentCompany.state || 'RJ', calcMethodology));
  }, [documents, currentCompany.state, calcMethodology]);

  // Aggregate totals
  const totalFaturamento = useMemo(() => {
    return calculatedDocs.reduce((acc, d) => acc + d.valorTotal, 0);
  }, [calculatedDocs]);

  const totalDifalEntrada = useMemo(() => {
    return calculatedDocs.reduce((acc, d) => acc + d.difalEntradaTotal, 0);
  }, [calculatedDocs]);

  const totalDifalSaida = useMemo(() => {
    return calculatedDocs.reduce((acc, d) => acc + d.difalSaidaTotal, 0);
  }, [calculatedDocs]);

  const totalIcmsSt = useMemo(() => {
    return calculatedDocs.reduce((acc, d) => acc + d.icmsStDevido, 0);
  }, [calculatedDocs]);

  const totalFcp = useMemo(() => {
    return calculatedDocs.reduce((acc, d) => acc + (d.difalEntradaFcp + d.difalSaidaFcp + d.fcpSt), 0);
  }, [calculatedDocs]);

  const totalEconomiaMonofasico = useMemo(() => {
    return calculatedDocs.reduce((acc, d) => acc + d.monofasicoEconomia, 0);
  }, [calculatedDocs]);

  // Generate monthly time series
  const { monthlyData, stateMatrix, categoryDistribution } = useMemo(() => {
    return generateMonthlyTaxTimeSeries(documents, currentCompany.state || 'RJ');
  }, [documents, currentCompany.state]);

  // Filtered monthly data based on timeRange
  const displayMonthlyData = useMemo(() => {
    if (timeRange === '1sem') return monthlyData.slice(0, 6);
    if (timeRange === '2sem') return monthlyData.slice(6, 12);
    if (timeRange === 'mes') return monthlyData.slice(monthlyData.length - 3);
    return monthlyData;
  }, [monthlyData, timeRange]);

  // Filtered documents table
  const filteredDocs = useMemo(() => {
    if (selectedCategoryFilter === 'todos') return calculatedDocs;
    if (selectedCategoryFilter === 'difal_entrada') return calculatedDocs.filter(d => d.difalEntradaTotal > 0);
    if (selectedCategoryFilter === 'difal_saida') return calculatedDocs.filter(d => d.difalSaidaTotal > 0);
    if (selectedCategoryFilter === 'st') return calculatedDocs.filter(d => d.isStApplicable);
    if (selectedCategoryFilter === 'monofasico') return calculatedDocs.filter(d => d.monofasicoEconomia > 0);
    return calculatedDocs;
  }, [calculatedDocs, selectedCategoryFilter]);

  // Export CSV analytical report
  const handleExportDashboardCsv = () => {
    const headers = [
      'Documento', 'Tipo', 'Emissao', 'UF Origem', 'UF Destino', 'CFOP', 'NCM', 'Descricao', 
      'Valor Operacao (R$)', 'Aliq Interestadual (%)', 'Aliq Destino + FCP (%)', 'MVA Ajustada (%)', 
      'DIFAL Entrada (R$)', 'DIFAL Saida EC 87/15 (R$)', 'ICMS-ST Devido (R$)', 'FCP Total (R$)', 
      'Economia PIS/COFINS (R$)', 'Codigo GNRE', 'Fundamentacao Legal'
    ];

    const rows = calculatedDocs.map(d => [
      `"${d.docNumero}"`,
      `"${d.docTipo}"`,
      `"${new Date().toLocaleDateString('pt-BR')}"`,
      `"${d.ufOrigem}"`,
      `"${d.ufDestino}"`,
      `"${d.cfop}"`,
      `"${d.ncm}"`,
      `"${d.ncmDescricao}"`,
      d.valorTotal.toFixed(2),
      d.aliqInterstate.toFixed(2),
      d.effectiveDestRate.toFixed(2),
      d.mvaAjustada.toFixed(2),
      d.difalEntradaTotal.toFixed(2),
      d.difalSaidaTotal.toFixed(2),
      d.icmsStDevido.toFixed(2),
      (d.difalEntradaFcp + d.difalSaidaFcp + d.fcpSt).toFixed(2),
      d.monofasicoEconomia.toFixed(2),
      `"${d.gnreCode}"`,
      `"${d.legalBasis}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_analitico_difal_st_${currentCompany.cnpj.replace(/\D/g, '')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Relatório analítico exportado com sucesso (${calculatedDocs.length} registros)!`, 'success');
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copiado para a área de transferência!`, 'info');
  };

  return (
    <div className="space-y-6 w-full">
      
      {/* Horizontal Filter & Controls Toolbar */}
      <div className="p-4 bg-[#0F172A] border border-slate-800 rounded-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-lg">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs font-bold text-slate-300">
            <Filter className="w-3.5 h-3.5 text-rose-400" />
            <span>Período:</span>
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 ml-1">
              <button 
                onClick={() => setTimeRange('ano')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${timeRange === 'ano' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Ano 2026
              </button>
              <button 
                onClick={() => setTimeRange('1sem')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${timeRange === '1sem' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                1º Sem
              </button>
              <button 
                onClick={() => setTimeRange('2sem')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${timeRange === '2sem' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                2º Sem
              </button>
              <button 
                onClick={() => setTimeRange('mes')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${timeRange === 'mes' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Últimos 3 Meses
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs font-bold text-slate-300">
            <Calculator className="w-3.5 h-3.5 text-amber-400" />
            <span>Metodologia DIFAL:</span>
            <select
              value={calcMethodology}
              onChange={(e) => setCalcMethodology(e.target.value as any)}
              aria-label="Metodologia de cálculo DIFAL"
              className="bg-slate-800 border border-slate-700 text-amber-300 text-xs rounded-lg px-2 py-1 font-mono focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="base_dupla">Base Dupla (Cálculo por Dentro - Padrão)</option>
              <option value="base_simples">Base Simples (Base Única)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
          <button
            onClick={() => onNavigateToCalculator()}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-2 border border-slate-700 cursor-pointer"
          >
            <Scale className="w-4 h-4 text-rose-400" />
            <span>Simulador Interativo</span>
          </button>

          <button
            onClick={handleExportDashboardCsv}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-md cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Relatório Fiscal (.CSV)</span>
          </button>
        </div>
      </div>

      {/* Horizontal 6-Card Fiscal KPI Cockpit */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* Card 1: Volume Total */}
        <div className="p-4 bg-[#0F172A] border border-slate-800 rounded-2xl space-y-2 relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Volume Faturado</span>
            <Coins className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="text-lg font-black text-white font-mono">
              R$ {totalFaturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[9px] text-slate-400 mt-0.5">
              {documents.length} XMLs auditados
            </div>
          </div>
          <div className="h-1 w-full bg-blue-500/20 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-full" />
          </div>
        </div>

        {/* Card 2: DIFAL Entrada */}
        <div className="p-4 bg-[#0F172A] border border-slate-800 rounded-2xl space-y-2 relative overflow-hidden group hover:border-amber-500/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">DIFAL Entrada (Uso)</span>
            <ArrowDownLeft className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-lg font-black text-amber-400 font-mono">
              R$ {totalDifalEntrada.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[9px] text-slate-400 mt-0.5">
              {calcMethodology === 'base_dupla' ? 'Base Dupla (Por Dentro)' : 'Base Simples'}
            </div>
          </div>
          <div className="h-1 w-full bg-amber-500/20 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 w-3/4" />
          </div>
        </div>

        {/* Card 3: DIFAL Saída */}
        <div className="p-4 bg-[#0F172A] border border-slate-800 rounded-2xl space-y-2 relative overflow-hidden group hover:border-cyan-500/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">DIFAL Saída (EC 87/15)</span>
            <ArrowUpRight className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-lg font-black text-cyan-400 font-mono">
              R$ {totalDifalSaida.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[9px] text-slate-400 mt-0.5">
              Vendas não contribuinte
            </div>
          </div>
          <div className="h-1 w-full bg-cyan-500/20 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500 w-2/3" />
          </div>
        </div>

        {/* Card 4: ICMS-ST Devido */}
        <div className="p-4 bg-[#0F172A] border border-slate-800 rounded-2xl space-y-2 relative overflow-hidden group hover:border-rose-500/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">ICMS-ST Retido</span>
            <Scale className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <div className="text-lg font-black text-rose-400 font-mono">
              R$ {totalIcmsSt.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[9px] text-slate-400 mt-0.5">
              MVA Ajustada Conv. 142
            </div>
          </div>
          <div className="h-1 w-full bg-rose-500/20 rounded-full overflow-hidden">
            <div className="h-full bg-rose-500 w-4/5" />
          </div>
        </div>

        {/* Card 5: FCP Consolidado */}
        <div className="p-4 bg-[#0F172A] border border-slate-800 rounded-2xl space-y-2 relative overflow-hidden group hover:border-purple-500/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">FCP Total Destino</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <div className="text-lg font-black text-purple-400 font-mono">
              R$ {totalFcp.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[9px] text-slate-400 mt-0.5">
              Fundo Combate à Pobreza
            </div>
          </div>
          <div className="h-1 w-full bg-purple-500/20 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 w-1/2" />
          </div>
        </div>

        {/* Card 6: Economia Monofásico */}
        <div className="p-4 bg-[#0F172A] border border-slate-800 rounded-2xl space-y-2 relative overflow-hidden group hover:border-emerald-500/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Economia Tributária</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-lg font-black text-emerald-400 font-mono">
              R$ {totalEconomiaMonofasico.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[9px] text-emerald-400/80 mt-0.5">
              Monofásicos Simples
            </div>
          </div>
          <div className="h-1 w-full bg-emerald-500/20 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-full" />
          </div>
        </div>

      </div>

      {/* Primary Chart 1: Evolução Mensal de Tributos (DIFAL / ST / FCP / ICMS) */}
      <div className="p-6 bg-[#0F172A] border border-slate-800 rounded-3xl space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="space-y-0.5">
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-rose-500" />
              Evolução Temporal de Tributos Estaduais (DIFAL & Substituição Tributária)
            </h2>
            <p className="text-xs text-slate-400">
              Acompanhamento mês a mês das obrigações principais apuradas através do repositório DFe
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
            <button
              onClick={() => setActiveChartMetric('todos')}
              className={`px-3 py-1.5 rounded-lg transition ${activeChartMetric === 'todos' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Todos os Tributos
            </button>
            <button
              onClick={() => setActiveChartMetric('difal')}
              className={`px-3 py-1.5 rounded-lg transition ${activeChartMetric === 'difal' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Apenas DIFAL
            </button>
            <button
              onClick={() => setActiveChartMetric('st')}
              className={`px-3 py-1.5 rounded-lg transition ${activeChartMetric === 'st' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Apenas ICMS-ST
            </button>
          </div>
        </div>

        <div className="h-[320px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={displayMonthlyData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDifalEntrada" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorDifalSaida" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorIcmsSt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis 
                dataKey="mes" 
                stroke="#64748B" 
                fontSize={12} 
                tickLine={false} 
                axisLine={{ stroke: '#334155' }} 
              />
              <YAxis 
                stroke="#64748B" 
                fontSize={11} 
                tickLine={false} 
                axisLine={{ stroke: '#334155' }}
                tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0F172A', 
                  borderColor: '#334155', 
                  borderRadius: '16px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                  fontSize: '12px'
                }}
                formatter={(value: any, name: any) => [
                  `R$ ${Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                  name === 'difalEntrada' ? 'DIFAL Entrada (Uso/Consumo)' :
                  name === 'difalSaida' ? 'DIFAL Saída (EC 87/15)' :
                  name === 'icmsSt' ? 'ICMS Substituição Tributária' :
                  name === 'fcp' ? 'FCP Destino' :
                  name === 'icmsNormal' ? 'ICMS Próprio Normal' : name
                ]}
                labelStyle={{ color: '#F8FAFC', fontWeight: 'bold' }}
              />
              <Legend 
                verticalAlign="top" 
                height={36} 
                formatter={(val) => {
                  if (val === 'difalEntrada') return 'DIFAL Entrada';
                  if (val === 'difalSaida') return 'DIFAL Saída (EC 87)';
                  if (val === 'icmsSt') return 'ICMS-ST Retido';
                  if (val === 'fcp') return 'FCP Destino';
                  if (val === 'icmsNormal') return 'ICMS Normal';
                  return val;
                }}
              />

              {(activeChartMetric === 'todos' || activeChartMetric === 'difal') && (
                <Area 
                  type="monotone" 
                  dataKey="difalEntrada" 
                  stroke="#F59E0B" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#colorDifalEntrada)" 
                />
              )}

              {(activeChartMetric === 'todos' || activeChartMetric === 'difal') && (
                <Area 
                  type="monotone" 
                  dataKey="difalSaida" 
                  stroke="#06B6D4" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#colorDifalSaida)" 
                />
              )}

              {(activeChartMetric === 'todos' || activeChartMetric === 'st') && (
                <Area 
                  type="monotone" 
                  dataKey="icmsSt" 
                  stroke="#F43F5E" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#colorIcmsSt)" 
                />
              )}

              {activeChartMetric === 'todos' && (
                <Line 
                  type="monotone" 
                  dataKey="fcp" 
                  stroke="#A855F7" 
                  strokeWidth={2} 
                  dot={{ r: 3, fill: '#A855F7' }} 
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secondary Chart Row (2 Columns: Volume Processado vs Segmentação NCM) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sub-Chart 1: Volume Mensal de Documentos Processados (Stacked BarChart) */}
        <div className="p-6 bg-[#0F172A] border border-slate-800 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="space-y-0.5">
              <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                Volume Mensal de Documentos Fiscais Processados
              </h2>
              <p className="text-[11px] text-slate-400">
                Evolução do fluxo de XMLs segregados por modelo fiscal (NF-e, NFS-e, NFC-e, CT-e)
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono font-bold">
              {displayMonthlyData.reduce((acc, m) => acc + m.totalDocs, 0)} Total
            </span>
          </div>

          <div className="h-[260px] w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayMonthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="mes" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0F172A', 
                    borderColor: '#334155', 
                    borderRadius: '12px',
                    fontSize: '11px'
                  }}
                  formatter={(val: any, name: any) => [`${val} documentos`, name.toUpperCase()]}
                />
                <Legend 
                  verticalAlign="top" 
                  height={30} 
                  formatter={(val) => val.toUpperCase()} 
                />
                <Bar dataKey="nfe" stackId="a" fill="#3B82F6" name="NF-e" radius={[0, 0, 0, 0]} />
                <Bar dataKey="nfse" stackId="a" fill="#10B981" name="NFS-e" radius={[0, 0, 0, 0]} />
                <Bar dataKey="nfce" stackId="a" fill="#F59E0B" name="NFC-e" radius={[0, 0, 0, 0]} />
                <Bar dataKey="cte" stackId="a" fill="#8B5CF6" name="CT-e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sub-Chart 2: Segmentação por NCM & Carga Tributária (Donut / PieChart) */}
        <div className="p-6 bg-[#0F172A] border border-slate-800 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="space-y-0.5">
              <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                Composição por NCM & Enquadramento ST
              </h2>
              <p className="text-[11px] text-slate-400">
                Proporção do faturamento e tributos por famílias NCM e regimes fiscais
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
              6 Categorias
            </span>
          </div>

          <div className="h-[260px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0F172A" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0F172A', 
                    borderColor: '#334155', 
                    borderRadius: '12px',
                    fontSize: '11px'
                  }}
                  formatter={(value: any) => [`${value}% da Carga Tributária`, 'Incidência']}
                />
                <Legend 
                  layout="vertical" 
                  align="right" 
                  verticalAlign="middle" 
                  wrapperStyle={{ fontSize: '11px', color: '#CBD5E1', paddingLeft: '10px' }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Tertiary Chart Row: Matriz Interestadual por UF de Destino (Horizontal BarChart) */}
      <div className="p-6 bg-[#0F172A] border border-slate-800 rounded-3xl space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div className="space-y-0.5">
            <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Matriz Interestadual por UF de Destino (Arrecadação DIFAL & ICMS-ST)
            </h2>
            <p className="text-[11px] text-slate-400">
              Volume financeiro e tributos devidos por estado de destino para geração de guias GNRE / DARE
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Top 10 Estados com Maior Fluxo
          </span>
        </div>

        <div className="h-[280px] w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              layout="vertical" 
              data={stateMatrix} 
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
              <XAxis 
                type="number" 
                stroke="#64748B" 
                fontSize={11} 
                tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`} 
              />
              <YAxis 
                type="category" 
                dataKey="uf" 
                stroke="#94A3B8" 
                fontSize={12} 
                fontWeight="bold" 
                tickLine={false} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0F172A', 
                  borderColor: '#334155', 
                  borderRadius: '12px',
                  fontSize: '11px'
                }}
                formatter={(val: any, name: any) => [
                  `R$ ${Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                  name === 'difal' ? 'DIFAL Destino' : name === 'icmsSt' ? 'ICMS-ST Retido' : name
                ]}
              />
              <Legend verticalAlign="top" height={30} />
              <Bar dataKey="difal" fill="#06B6D4" name="DIFAL Destino" radius={[0, 4, 4, 0]} />
              <Bar dataKey="icmsSt" fill="#F43F5E" name="ICMS-ST Retido" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comprehensive Analytical Ledger Table: Document-by-Document Tax Breakdown */}
      <div className="p-6 bg-[#0F172A] border border-slate-800 rounded-3xl space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="space-y-0.5">
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-400" />
              Extrato Analítico de Apuração DIFAL & ST por Documento Fiscal
            </h2>
            <p className="text-xs text-slate-400">
              Auditoria automatizada da incidência tributária com base no NCM, CFOP e UF Origem/Destino
            </p>
          </div>

          {/* Table Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedCategoryFilter('todos')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${selectedCategoryFilter === 'todos' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              Todos ({calculatedDocs.length})
            </button>
            <button
              onClick={() => setSelectedCategoryFilter('difal_entrada')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${selectedCategoryFilter === 'difal_entrada' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              DIFAL Entrada
            </button>
            <button
              onClick={() => setSelectedCategoryFilter('difal_saida')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${selectedCategoryFilter === 'difal_saida' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              DIFAL Saída EC 87
            </button>
            <button
              onClick={() => setSelectedCategoryFilter('st')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${selectedCategoryFilter === 'st' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              Com ST
            </button>
            <button
              onClick={() => setSelectedCategoryFilter('monofasico')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${selectedCategoryFilter === 'monofasico' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              Monofásicos
            </button>
          </div>
        </div>

        {/* Wide Horizontal Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0B0F19] text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Documento</th>
                <th className="py-3 px-3">Fluxo (UF)</th>
                <th className="py-3 px-3">NCM & Classificação</th>
                <th className="py-3 px-3">CFOP</th>
                <th className="py-3 px-3 text-right">Valor Operação</th>
                <th className="py-3 px-3 text-center">Alíquotas (Inter / Dest)</th>
                <th className="py-3 px-3 text-center">MVA Ajustada</th>
                <th className="py-3 px-3 text-right">DIFAL Entrada</th>
                <th className="py-3 px-3 text-right">DIFAL Saída</th>
                <th className="py-3 px-3 text-right">ICMS-ST Devido</th>
                <th className="py-3 px-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredDocs.map((doc) => (
                <tr key={doc.docId} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                        {doc.docTipo}
                      </span>
                      <span>nº {doc.docNumero}</span>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1 text-[11px] font-bold">
                      <span className="text-amber-400">{doc.ufOrigem}</span>
                      <span className="text-slate-500">→</span>
                      <span className="text-emerald-400">{doc.ufDestino}</span>
                      {doc.isInterestadual ? (
                        <span className="ml-1 px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 text-[9px]">Interestadual</span>
                      ) : (
                        <span className="ml-1 px-1 py-0.2 rounded bg-slate-800 text-slate-400 text-[9px]">Interna</span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-3 font-sans">
                    <div className="font-mono text-white text-[11px] font-bold">{doc.ncm}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[160px]" title={doc.ncmDescricao}>
                      {doc.ncmDescricao}
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-bold">
                      {doc.cfop}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right font-bold text-white">
                    R$ {doc.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>

                  <td className="py-3 px-3 text-center text-[11px]">
                    <span className="text-amber-400">{doc.aliqInterstate}%</span>
                    <span className="text-slate-500"> / </span>
                    <span className="text-emerald-400">{doc.effectiveDestRate}%</span>
                    {doc.aliqFcpDest > 0 && (
                      <span className="text-[9px] text-purple-400 block">+{doc.aliqFcpDest}% FCP</span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-center text-[11px]">
                    {doc.isStApplicable ? (
                      <div>
                        <span className="font-bold text-rose-400">{doc.mvaAjustada}%</span>
                        <span className="text-[9px] text-slate-500 block">Orig: {doc.mvaOriginal}%</span>
                      </div>
                    ) : (
                      <span className="text-slate-600">-</span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-right">
                    {doc.difalEntradaTotal > 0 ? (
                      <span className="font-bold text-amber-400">
                        R$ {doc.difalEntradaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    ) : (
                      <span className="text-slate-600">R$ 0,00</span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-right">
                    {doc.difalSaidaTotal > 0 ? (
                      <span className="font-bold text-cyan-400">
                        R$ {doc.difalSaidaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    ) : (
                      <span className="text-slate-600">R$ 0,00</span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-right">
                    {doc.icmsStDevido > 0 ? (
                      <span className="font-bold text-rose-400">
                        R$ {doc.icmsStDevido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    ) : (
                      <span className="text-slate-600">R$ 0,00</span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onNavigateToCalculator(doc.docId)}
                        title="Abrir no Simulador de Cálculo DIFAL & ST"
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded-lg transition cursor-pointer"
                      >
                        <Scale className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => copyToClipboard(doc.gnreBarcode, 'Código de Barras GNRE')}
                        title="Copiar Código de Barras GNRE"
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
