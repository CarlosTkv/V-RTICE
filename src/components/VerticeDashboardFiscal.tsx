import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Coins,
  Scale,
  ShieldCheck,
  TrendingUp,
  FileText,
  AlertTriangle,
  Building,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  Calculator,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
  Layers,
  Sparkles,
  Info,
  Copy,
  Check,
  Receipt,
  FileSpreadsheet,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import { CompanyData } from '../types';
import {
  calculateDocFiscalTaxes,
  compileBatchFiscalDashboard,
  DocTaxCalculationResult,
  BatchFiscalDashboardData
} from '../utils/difalStCalculator';
import { BRAZILIAN_STATES_ICMS } from '../utils/taxRules';

interface VerticeDashboardFiscalProps {
  documents: Array<{
    id: string;
    tipo: 'NF-e' | 'NFS-e' | 'NFC-e' | 'CT-e';
    numero: string;
    serie: string;
    chave: string;
    dataEmissao: string;
    emitente: string;
    emitenteCnpj: string;
    destinatario: string;
    destinatarioCnpj: string;
    valorTotal: number;
    valorIcms: number;
    valorIss: number;
    cfop: string;
    ncm: string;
    status: 'Autorizada' | 'Cancelada' | 'Denegada';
    direcao?: 'entrada' | 'saida';
    manifestacao?: string;
  }>;
  currentCompany: CompanyData;
  showToast: (text: string, type?: 'success' | 'info' | 'error') => void;
  onOpenDocModal?: (docId: string) => void;
}

export const VerticeDashboardFiscal: React.FC<VerticeDashboardFiscalProps> = ({
  documents,
  currentCompany,
  showToast,
  onOpenDocModal
}) => {
  // Filtros
  const [selectedPeriod, setSelectedPeriod] = useState<'6m' | '12m' | 'mes_atual'>('6m');
  const [directionFilter, setDirectionFilter] = useState<'all' | 'entrada' | 'saida'>('all');
  const [selectedUfFilter, setSelectedUfFilter] = useState<string>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Modal de Memória de Cálculo Auditável
  const [selectedCalcForModal, setSelectedCalcForModal] = useState<DocTaxCalculationResult | null>(null);

  // Filtra documentos conforme seleção
  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      if (directionFilter !== 'all' && doc.direcao !== directionFilter) return false;
      return true;
    });
  }, [documents, directionFilter]);

  // Executa o cálculo e compilação em lote
  const { summary, calculatedMap } = useMemo(() => {
    return compileBatchFiscalDashboard(filteredDocs, currentCompany.uf || 'SP');
  }, [filteredDocs, currentCompany.uf]);

  // Lista de UFs presentes para o filtro
  const availableUfs = useMemo(() => {
    const ufs = new Set<string>();
    Object.values(calculatedMap).forEach(calc => {
      if (calc.ufOrigem) ufs.add(calc.ufOrigem);
      if (calc.ufDestino) ufs.add(calc.ufDestino);
    });
    return Array.from(ufs).sort();
  }, [calculatedMap]);

  // Copia texto helper
  const handleCopy = (text: string, label: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedKey(label);
      showToast(`${label} copiado para a área de transferência!`, 'info');
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  // Exporta apuração consolidada em CSV
  const handleExportCsv = () => {
    const headers = [
      'Documento ID',
      'Tipo',
      'Número',
      'Data Emissão',
      'UF Origem',
      'UF Destino',
      'Operação',
      'CFOP',
      'NCM',
      'Valor Total (R$)',
      'ICMS Próprio (R$)',
      'Alíquota Inter (%)',
      'Alíquota Destino (%)',
      'DIFAL Entrada (R$)',
      'DIFAL Saída (R$)',
      'MVA Original (%)',
      'MVA Ajustada (%)',
      'ICMS-ST (R$)',
      'Total Tributos Estaduais (R$)'
    ];

    const rows = filteredDocs.map(doc => {
      const calc = calculatedMap[doc.id];
      return [
        doc.id,
        doc.tipo,
        doc.numero,
        doc.dataEmissao,
        calc?.ufOrigem || '-',
        calc?.ufDestino || '-',
        calc?.tipoOperacao || '-',
        doc.cfop,
        doc.ncm,
        doc.valorTotal.toFixed(2),
        (calc?.icmsProprioDestacado || 0).toFixed(2),
        (calc?.aliquotaInterestadual || 0).toFixed(2),
        (calc?.aliquotaInternaDestino || 0).toFixed(2),
        (calc?.difalEntradaTotal || 0).toFixed(2),
        (calc?.difalSaidaTotal || 0).toFixed(2),
        (calc?.mvaOriginal || 0).toFixed(2),
        (calc?.mvaAjustada || 0).toFixed(2),
        (calc?.icmsStValor || 0).toFixed(2),
        (calc?.cargaTributariaTotalEstadual || 0).toFixed(2)
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Apuracao_Fiscal_DIFAL_ST_${currentCompany.name.replace(/\s+/g, '_')}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Relatório Analítico de DIFAL e ST exportado com sucesso!', 'success');
  };

  // Coleta todas as guias fiscais apuradas
  const allGuias = useMemo(() => {
    const list: Array<DocTaxCalculationResult['guiasSugeridas'][0] & { docNumero: string; chave: string; docId: string }> = [];
    filteredDocs.forEach(d => {
      const calc = calculatedMap[d.id];
      if (calc && calc.guiasSugeridas.length > 0) {
        calc.guiasSugeridas.forEach(g => {
          list.push({
            ...g,
            docNumero: d.numero,
            chave: d.chave,
            docId: d.id
          });
        });
      }
    });
    return list;
  }, [filteredDocs, calculatedMap]);

  return (
    <div className="w-full space-y-6">
      
      {/* ========================================================================= */}
      {/* 1. TOP HORIZONTAL EXECUTIVE HEADER                                        */}
      {/* ========================================================================= */}
      <div className="w-full bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Identificação e Título */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 border border-amber-500/30 text-amber-400">
                <Scale className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-white tracking-tight">
                    Cockpit Fiscal Panorâmico &bull; DIFAL & Substituição Tributária
                  </h2>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    Convênio ICMS 142/18 &bull; LC 190/22
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Motor de apuração e parametrização automática com base no NCM e cruzamento interestadual de UFs (Origem &rarr; Destino)
                </p>
              </div>
            </div>
          </div>

          {/* Filtros e Ações Rápidas Horizontais */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Filtro Direção */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
              <button
                onClick={() => setDirectionFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  directionFilter === 'all'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Todas ({documents.length})
              </button>
              <button
                onClick={() => setDirectionFilter('entrada')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  directionFilter === 'entrada'
                    ? 'bg-blue-600 text-white shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Entradas (DIFAL Compra)
              </button>
              <button
                onClick={() => setDirectionFilter('saida')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  directionFilter === 'saida'
                    ? 'bg-emerald-600 text-white shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Saídas (EC 87/15)
              </button>
            </div>

            {/* Período */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
              <button
                onClick={() => setSelectedPeriod('6m')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  selectedPeriod === '6m' ? 'bg-slate-800 text-white font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                6 Meses
              </button>
              <button
                onClick={() => setSelectedPeriod('12m')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  selectedPeriod === '12m' ? 'bg-slate-800 text-white font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                12 Meses
              </button>
            </div>

            {/* Botão Exportar CSV */}
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all shadow-sm"
              title="Exportar planilha analítica de apuração do DIFAL e ST"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exportar Apuração (.CSV)</span>
            </button>

          </div>

        </div>

        {/* Linha de Contexto da Empresa Ativa */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 font-bold text-slate-300">
              <Building className="w-3.5 h-3.5 text-blue-400" />
              {currentCompany.name} ({currentCompany.cnpj})
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-700">
              UF Sede: <strong className="text-amber-400">{currentCompany.uf || 'SP'}</strong> (Alíquota Interna Modal: {BRAZILIAN_STATES_ICMS[currentCompany.uf || 'SP']?.standardIcmsRate || 18}%)
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-700">
              Regime: <strong className="text-emerald-400">{currentCompany.taxRegime || 'Simples Nacional'}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] text-emerald-400 font-mono font-bold">
              Base Legal Sincronizada (TIPI 2026 / CONFAZ 142)
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FAIXA PANORÂMICA HORIZONTAL: 5 CARDS EXECUTIVOS                        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Volume Fiscal & ICMS Próprio */}
        <div className="p-4 bg-[#0F172A] border border-slate-800 rounded-2xl flex flex-col justify-between space-y-3 relative overflow-hidden group hover:border-slate-700 transition-all shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              Volume Transacionado
            </span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xl font-black text-white font-mono tracking-tight">
              R$ {summary.volumeTotalFinanceiro.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>ICMS Próprio:</span>
              <span className="font-mono font-bold text-slate-300">
                R$ {summary.totalIcmsProprio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[9px] text-slate-500 font-mono">
            <span>{summary.totalDocumentos} documentos auditados</span>
            <span className="text-blue-400 font-bold">100% Processados</span>
          </div>
        </div>

        {/* Card 2: DIFAL de Entrada (Aquisições Interestaduais) */}
        <div className="p-4 bg-[#0F172A] border border-amber-900/40 rounded-2xl flex flex-col justify-between space-y-3 relative overflow-hidden group hover:border-amber-700/60 transition-all shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <ArrowDownRight className="w-3.5 h-3.5 text-amber-400" />
              DIFAL Entrada (Compras)
            </span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xl font-black text-amber-400 font-mono tracking-tight">
              R$ {summary.totalDifalEntrada.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Regra de Base:</span>
              <span className="font-mono text-amber-300 font-bold">Base Dupla (LC 190)</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[9px] text-slate-500 font-mono">
            <span>Uso, Consumo & Ativo</span>
            <span className="text-amber-400 font-bold">Antecipação Tributária</span>
          </div>
        </div>

        {/* Card 3: DIFAL de Saída (EC 87/2015 & LC 190) */}
        <div className="p-4 bg-[#0F172A] border border-sky-900/40 rounded-2xl flex flex-col justify-between space-y-3 relative overflow-hidden group hover:border-sky-700/60 transition-all shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <ArrowUpRight className="w-3.5 h-3.5 text-sky-400" />
              DIFAL Saída (EC 87/15)
            </span>
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xl font-black text-sky-400 font-mono tracking-tight">
              R$ {summary.totalDifalSaida.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Destino:</span>
              <span className="font-mono text-sky-300 font-bold">100% UF Favorecida</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[9px] text-slate-500 font-mono">
            <span>Consumidor Final Outras UFs</span>
            <span className="text-sky-400 font-bold">GNRE 10010-2</span>
          </div>
        </div>

        {/* Card 4: Substituição Tributária (ICMS-ST com MVA) */}
        <div className="p-4 bg-[#0F172A] border border-rose-900/40 rounded-2xl flex flex-col justify-between space-y-3 relative overflow-hidden group hover:border-rose-700/60 transition-all shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-rose-400 uppercase tracking-wider">
              ICMS Substituição (ST)
            </span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xl font-black text-rose-400 font-mono tracking-tight">
              R$ {summary.totalIcmsSt.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>MVA Aplicada:</span>
              <span className="font-mono text-rose-300 font-bold">Ajustada CONFAZ</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[9px] text-slate-500 font-mono">
            <span>Convênio ICMS 142/18</span>
            <span className="text-rose-400 font-bold">Retenção Antecipada</span>
          </div>
        </div>

        {/* Card 5: Carga Tributária Estadual & Guias */}
        <div className="p-4 bg-[#0F172A] border border-emerald-900/40 rounded-2xl flex flex-col justify-between space-y-3 relative overflow-hidden group hover:border-emerald-700/60 transition-all shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">
              Carga Estadual Total
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xl font-black text-emerald-400 font-mono tracking-tight">
              R$ {summary.totalCargaEstadual.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Guias Mapeadas:</span>
              <span className="font-mono text-emerald-300 font-bold">{allGuias.length} Guias GNRE/DARE</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[9px] text-slate-500 font-mono">
            <span>Conformidade Fiscal</span>
            <span className="text-emerald-400 font-bold">99.4% Validado</span>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. FAIXA HORIZONTAL DE GRÁFICOS RECHARTS (FULL WIDTH 1:1)                  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        
        {/* Gráfico 1: Evolução Temporal de Tributos (DIFAL / ST / ICMS) */}
        <div className="p-5 bg-[#0F172A] border border-slate-800 rounded-3xl space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <TrendingUp className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">
                    Evolução Mensal de Tributos &bull; DIFAL & ICMS-ST
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    Histórico consolidado de apurações (R$) por competência fiscal
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-500 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                Recharts Engine
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary.evolucaoMensalTributos} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradDifalEntrada" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="gradDifalSaida" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="gradIcmsSt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="mesNome" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={{ stroke: '#334155' }} 
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={{ stroke: '#334155' }}
                  tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#0B0F19] border border-slate-700/80 rounded-xl p-3.5 shadow-2xl space-y-2 text-xs">
                          <div className="font-bold text-white border-b border-slate-800 pb-1 flex justify-between gap-4">
                            <span>Competência: {label}</span>
                            <span className="text-amber-400 font-mono">DFe SPED</span>
                          </div>
                          {payload.map((entry: any, index: number) => (
                            <div key={`item-${index}`} className="flex justify-between items-center gap-4 text-[11px]">
                              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                {entry.name}:
                              </span>
                              <span className="font-mono font-bold text-white">
                                R$ {Number(entry.value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="difalEntrada" 
                  name="DIFAL Entrada (Compras)" 
                  stroke="#f59e0b" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#gradDifalEntrada)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="difalSaida" 
                  name="DIFAL Saída (EC 87/15)" 
                  stroke="#0ea5e9" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#gradDifalSaida)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="icmsSt" 
                  name="ICMS-ST (Substituição)" 
                  stroke="#f43f5e" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#gradIcmsSt)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-mono">
            <span>DIFAL Total Acumulado: <strong className="text-amber-400 font-bold">R$ {(summary.totalDifalEntrada + summary.totalDifalSaida).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
            <span>ST Total: <strong className="text-rose-400 font-bold">R$ {summary.totalIcmsSt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
          </div>
        </div>

        {/* Gráfico 2: Volume Mensal de Documentos Processados por Modelo */}
        <div className="p-5 bg-[#0F172A] border border-slate-800 rounded-3xl space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <BarChart3 className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">
                    Volume Mensal de Documentos &bull; SEFAZ & Prefeituras
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    Contagem volumétrica de XMLs capturados (NF-e, NFS-e, NFC-e e CT-e)
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-500 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                DFe Bar Distribution
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.volumeMensalDocs} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="mesNome" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={{ stroke: '#334155' }} 
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={{ stroke: '#334155' }} 
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const totalDocs = payload.reduce((acc, curr: any) => acc + (Number(curr.value) || 0), 0);
                      return (
                        <div className="bg-[#0B0F19] border border-slate-700/80 rounded-xl p-3.5 shadow-2xl space-y-2 text-xs">
                          <div className="font-bold text-white border-b border-slate-800 pb-1 flex justify-between gap-4">
                            <span>Período: {label}</span>
                            <span className="text-blue-400 font-mono font-bold">Total: {totalDocs} docs</span>
                          </div>
                          {payload.map((entry: any, index: number) => (
                            <div key={`item-${index}`} className="flex justify-between items-center gap-4 text-[11px]">
                              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                                <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: entry.color }} />
                                {entry.name}:
                              </span>
                              <span className="font-mono font-bold text-white">
                                {entry.value} XMLs ({totalDocs > 0 ? ((Number(entry.value) / totalDocs) * 100).toFixed(0) : 0}%)
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  iconType="square"
                  wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
                />
                <Bar dataKey="nfe" name="NF-e (Mod. 55)" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="nfse" name="NFS-e (Serviços)" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="nfce" name="NFC-e (Mod. 65)" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                <Bar dataKey="cte" name="CT-e (Mod. 57)" stackId="a" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-mono">
            <span>Integração WebService: <strong className="text-emerald-400 font-bold">Síncrono SEFAZ DFe</strong></span>
            <span>Taxa de Recepção: <strong className="text-blue-400 font-bold">100% OK</strong></span>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. FAIXA HORIZONTAL DE INTELIGÊNCIA GEOGRÁFICA (UF) & NCM ST               */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        
        {/* Painel A: Matriz Interestadual por UF Parceira (5 Colunas) */}
        <div className="lg:col-span-5 p-5 bg-[#0F172A] border border-slate-800 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <PieChartIcon className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  Matriz Interestadual &bull; UFs Parceiras
                </h3>
                <span className="text-[10px] text-slate-400">
                  Cruzamento tributário com origem/destino dos documentos
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {summary.distribuicaoUfs.length} UFs
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[9px] font-black uppercase tracking-wider text-slate-400">
                  <th className="py-2 px-2">UF</th>
                  <th className="py-2 px-2">Alíquota Modal</th>
                  <th className="py-2 px-2 text-right">Volume (R$)</th>
                  <th className="py-2 px-2 text-right">DIFAL (R$)</th>
                  <th className="py-2 px-2 text-right">ST (R$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
                {summary.distribuicaoUfs.map((item, idx) => {
                  const stateDef = BRAZILIAN_STATES_ICMS[item.uf];
                  const aliqInterna = stateDef?.standardIcmsRate || 18;
                  const fcp = stateDef?.fcpRate || 0;
                  return (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-6 h-5 rounded bg-slate-900 border border-slate-700 font-bold text-[10px] text-white flex items-center justify-center">
                            {item.uf}
                          </span>
                          <span className="text-[11px] text-slate-300 font-sans font-medium truncate max-w-[90px]" title={item.nomeUf}>
                            {item.nomeUf}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-slate-400 text-[10px]">
                        {aliqInterna}% {fcp > 0 ? `+${fcp}% FCP` : ''}
                      </td>
                      <td className="py-2.5 px-2 text-right font-bold text-white text-[11px]">
                        R$ {item.volumeFinanceiro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-2 text-right font-bold text-amber-400 text-[11px]">
                        R$ {item.difalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-2 text-right font-bold text-rose-400 text-[11px]">
                        R$ {item.icmsSt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-900 border border-slate-800/80 rounded-xl text-[10px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Info className="w-3.5 h-3.5" />
              <span>Regra de Partilha Nacional:</span>
            </div>
            <p>
              Nas saídas a consumidores finais não contribuintes de outros estados (EC 87/15), 100% do diferencial pertence ao estado de destino, recolhido pela GNRE 10010-2.
            </p>
          </div>
        </div>

        {/* Painel B: Top NCMs Impactados por ST & DIFAL (7 Colunas) */}
        <div className="lg:col-span-7 p-5 bg-[#0F172A] border border-slate-800 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Layers className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  Top Classificações Fiscais (NCM) &bull; Incidência de ST & DIFAL
                </h3>
                <span className="text-[10px] text-slate-400">
                  Parametrização automática com MVA Original vs MVA Ajustada do CONFAZ
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {summary.topNcmsStDifal.length} NCMs mapeados
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[9px] font-black uppercase tracking-wider text-slate-400">
                  <th className="py-2 px-2">NCM & Segmento</th>
                  <th className="py-2 px-2">Regime ST</th>
                  <th className="py-2 px-2">MVA Ajustada</th>
                  <th className="py-2 px-2 text-right">Volume (R$)</th>
                  <th className="py-2 px-2 text-right">ICMS-ST (R$)</th>
                  <th className="py-2 px-2 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
                {summary.topNcmsStDifal.slice(0, 6).map((item, idx) => {
                  return (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-2">
                        <div className="space-y-0.5">
                          <span className="font-bold text-white text-xs block">
                            {item.ncm}
                          </span>
                          <span className="text-[10px] text-slate-400 font-sans truncate max-w-[200px] block" title={item.descricao}>
                            {item.descricao}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2">
                        {item.isSt ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] font-black uppercase font-sans">
                            Substituição (ST)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[9px] font-sans">
                            Tributado Comum
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-slate-300 text-[11px]">
                        {item.mvaMedia > 0 ? (
                          <span className="font-bold text-amber-400">{item.mvaMedia.toFixed(2)}%</span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-right font-bold text-white text-[11px]">
                        R$ {item.volume.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-2 text-right font-bold text-rose-400 text-[11px]">
                        R$ {item.icmsSt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-2 text-right">
                        {/* Acha um doc correspondente a este NCM para abrir o simulador */}
                        {(() => {
                          const docWithNcm = filteredDocs.find(d => d.ncm === item.ncm || d.ncm.replace(/\D/g, '') === item.ncm.replace(/\D/g, ''));
                          const calc = docWithNcm ? calculatedMap[docWithNcm.id] : null;
                          if (!calc) return null;
                          return (
                            <button
                              onClick={() => setSelectedCalcForModal(calc)}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[10px] font-sans font-bold transition-all"
                            >
                              Ver Memória
                            </button>
                          );
                        })()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-900 border border-slate-800/80 rounded-xl flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1.5 text-rose-400 font-bold font-mono">
              <Calculator className="w-3.5 h-3.5" />
              Fórmula Oficial MVA Ajustada: [ ((1 + MVA Orig) * (1 - Aliq Inter)) / (1 - Aliq Destino) ] - 1
            </span>
            <span className="text-slate-500 font-mono">Convênio ICMS 142/2018</span>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 5. CENTRAL DE GUIAS GNRE & DARE A RECOLHER (LAYOUT HORIZONTAL EXPANDIDO)  */}
      {/* ========================================================================= */}
      <div className="w-full bg-[#0F172A] border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Receipt className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Quadro de Guias Fiscais Sugeridas &bull; GNRE & DARE ({allGuias.length})
              </h3>
              <p className="text-xs text-slate-400">
                Guias prontas para emissão e recolhimento tempestivo de DIFAL e Substituição Tributária
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-300">
              Total a Recolher:
            </span>
            <span className="text-base font-black text-amber-400 font-mono">
              R$ {allGuias.reduce((acc, g) => acc + g.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {allGuias.length === 0 ? (
          <div className="p-8 text-center text-slate-500 space-y-2">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500/40" />
            <p className="text-xs font-mono">Nenhuma guia de DIFAL ou ST pendente de recolhimento no lote filtrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[9px] font-black uppercase tracking-wider text-slate-400">
                  <th className="py-2.5 px-3">Tipo de Guia</th>
                  <th className="py-2.5 px-3">Código Receita</th>
                  <th className="py-2.5 px-3">UF Favorecida</th>
                  <th className="py-2.5 px-3">Descrição da Obrigação</th>
                  <th className="py-2.5 px-3">Vencimento</th>
                  <th className="py-2.5 px-3 text-right">Valor do Tributo</th>
                  <th className="py-2.5 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
                {allGuias.map((guia, idx) => {
                  return (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-sans ${
                          guia.tipo === 'GNRE_DIFAL'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}>
                          {guia.tipo.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-300 font-bold">
                        {guia.codigoGuia}
                      </td>
                      <td className="py-3 px-3">
                        <span className="w-7 h-5 rounded bg-slate-900 border border-slate-700 font-bold text-[11px] text-white inline-flex items-center justify-center">
                          {guia.ufFavorecida}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-300 font-sans text-xs">
                        {guia.descricao}
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-xs">
                        {guia.dataVencimentoSugerida}
                      </td>
                      <td className="py-3 px-3 text-right font-black text-amber-400 text-sm">
                        R$ {guia.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleCopy(guia.chave, `Chave NF-e ${guia.docNumero}`)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs"
                            title="Copiar Chave de Acesso da NF-e vinculada"
                          >
                            {copiedKey === `Chave NF-e ${guia.docNumero}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          {onOpenDocModal && (
                            <button
                              onClick={() => onOpenDocModal(guia.docId)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-sans font-bold transition-all border border-slate-700"
                            >
                              Ver NF-e
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 6. MODAL EXPANSÍVEL: MEMÓRIA DE CÁLCULO AUDITÁVEL (FÓRMULA PASSO A PASSO)  */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedCalcForModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl bg-[#0F172A] border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Calculator className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-black text-white">
                      Memória de Cálculo Auditável &bull; DIFAL & Substituição Tributária
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Documento ID: {selectedCalcForModal.docId} | NCM: {selectedCalcForModal.ncmClean}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCalcForModal(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Informações Gerais da Operação */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-500 block uppercase">Origem</span>
                  <span className="font-bold text-white text-sm">{selectedCalcForModal.ufOrigem} ({selectedCalcForModal.aliquotaInternaOrigem}%)</span>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-500 block uppercase">Destino</span>
                  <span className="font-bold text-amber-400 text-sm">{selectedCalcForModal.ufDestino} ({selectedCalcForModal.aliquotaInternaDestino}% + {selectedCalcForModal.fcpDestino}% FCP)</span>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-500 block uppercase">Alíquota Interestadual</span>
                  <span className="font-bold text-blue-400 text-sm">{selectedCalcForModal.aliquotaInterestadual}%</span>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-500 block uppercase">Tipo Operação</span>
                  <span className="font-bold text-slate-200 text-xs capitalize">{selectedCalcForModal.tipoOperacao.replace('_', ' ')}</span>
                </div>
              </div>

              {/* Passo a Passo Auditável */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Passos da Dedução Tributária
                </h4>
                
                <div className="space-y-3">
                  {selectedCalcForModal.memoriaCalculo.map((item, idx) => (
                    <div key={idx} className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-white flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-mono text-[10px] font-black flex items-center justify-center">
                            {idx + 1}
                          </span>
                          {item.step}
                        </span>
                        <span className="font-mono font-black text-amber-400 text-sm">
                          R$ {typeof item.value === 'number' ? item.value.toFixed(2) : item.value}
                        </span>
                      </div>
                      <div className="p-2.5 bg-[#0B0F19] rounded-xl border border-slate-800/80 font-mono text-[11px] text-slate-300">
                        <code>{item.formula}</code>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans">
                        {item.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resumo Final do Documento */}
              <div className="p-4 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-transparent border border-amber-500/20 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">Carga Tributária Estadual Apurada</span>
                  <span className="text-lg font-black text-white">
                    R$ {selectedCalcForModal.cargaTributariaTotalEstadual.toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedCalcForModal(null)}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-all font-sans"
                >
                  Concluir Inspeção
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
