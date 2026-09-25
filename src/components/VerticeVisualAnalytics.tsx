import React, { useMemo, useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  CheckCircle2, 
  Layers, 
  ArrowUpRight, 
  ArrowDownLeft, 
  AlertTriangle, 
  DollarSign, 
  FileSpreadsheet, 
  Download, 
  PieChart, 
  Sparkles, 
  Filter, 
  Calendar,
  Building2,
  FileCode,
  Check,
  Percent,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { DocFiscal } from '../data/fiscalDocumentsDatabase';
import { 
  verificarDivergenciaCFOP, 
  identificarSubstituicaoTributaria, 
  identificarMonofasico 
} from '../services/complianceEngine';

interface VerticeVisualAnalyticsProps {
  documents: DocFiscal[];
  onSelectFilter?: (filter: string) => void;
  onOpenBatchUpload?: () => void;
  onExportSped?: () => void;
  onExportCsv?: () => void;
  onSelectDoc?: (docId: string) => void;
}

export const VerticeVisualAnalytics: React.FC<VerticeVisualAnalyticsProps> = ({
  documents,
  onSelectFilter,
  onOpenBatchUpload,
  onExportSped,
  onExportCsv,
  onSelectDoc
}) => {
  const [timeRange, setTimeRange] = useState<'all' | '7d' | '30d' | '90d'>('all');
  const [selectedComplianceType, setSelectedComplianceType] = useState<'all' | 'divergencia_cfop' | 'st' | 'monofasico' | 'canceladas'>('all');

  // Cálculos consolidados de alta performance
  const stats = useMemo(() => {
    let totalEntradas = 0;
    let valorEntradas = 0;
    let totalSaidas = 0;
    let valorSaidas = 0;
    let totalIcms = 0;
    let totalIss = 0;
    let canceladas = 0;
    let comSt = 0;
    let comMonofasico = 0;
    let divergenciasCfop = 0;
    let semManifesto = 0;

    const fornecedoresMap: Record<string, { nome: string; cnpj: string; total: number; count: number }> = {};
    const clientesMap: Record<string, { nome: string; cnpj: string; total: number; count: number }> = {};
    const modelosMap: Record<string, number> = { 'NF-e': 0, 'NFS-e': 0, 'CT-e': 0, 'NFC-e': 0 };
    const timelineMap: Record<string, { data: string; entradas: number; saidas: number; valEntradas: number; valSaidas: number }> = {};

    const docsWithCompliance = documents.map(doc => {
      const isEntrada = doc.direcao === 'entrada';
      const valor = doc.valorTotal || 0;
      const icms = doc.valorIcms || 0;
      const iss = doc.valorIss || 0;

      if (isEntrada) {
        totalEntradas++;
        valorEntradas += valor;
        const cnpjForn = doc.emitenteCnpj || doc.emitente;
        if (!fornecedoresMap[cnpjForn]) {
          fornecedoresMap[cnpjForn] = { nome: doc.emitente, cnpj: cnpjForn, total: 0, count: 0 };
        }
        fornecedoresMap[cnpjForn].total += valor;
        fornecedoresMap[cnpjForn].count++;
      } else {
        totalSaidas++;
        valorSaidas += valor;
        const cnpjCli = doc.destinatarioCnpj || doc.destinatario;
        if (!clientesMap[cnpjCli]) {
          clientesMap[cnpjCli] = { nome: doc.destinatario, cnpj: cnpjCli, total: 0, count: 0 };
        }
        clientesMap[cnpjCli].total += valor;
        clientesMap[cnpjCli].count++;
      }

      totalIcms += icms;
      totalIss += iss;

      if (doc.status === 'Cancelada') canceladas++;
      if (doc.manifestacao === 'Pendente' || doc.manifestacao === 'Sem Manifesto' || !doc.manifestacao) {
        semManifesto++;
      }

      // Regras do compliance engine
      const temSt = identificarSubstituicaoTributaria(doc.cfop || '', doc.itens?.[0]?.cst);
      if (temSt || doc.temSt) comSt++;

      const temMono = identificarMonofasico(doc.ncm || doc.itens?.[0]?.ncm || '');
      if (temMono || doc.temMonofasico) comMonofasico++;

      const divCfop = verificarDivergenciaCFOP({
        ufEmitente: doc.emitenteUf || (doc.chave && doc.chave.startsWith('35') ? 'SP' : 'RJ'),
        ufDestinatario: doc.destinatarioUf || 'SP',
        cfopPrincipal: doc.cfop || '5102'
      });
      if (divCfop.temDivergencia) divergenciasCfop++;

      // Modelo
      const tipo = doc.tipo || 'NF-e';
      modelosMap[tipo] = (modelosMap[tipo] || 0) + 1;

      // Timeline por dia
      const dia = doc.dataEmissao || '2026-09-01';
      if (!timelineMap[dia]) {
        timelineMap[dia] = { data: dia, entradas: 0, saidas: 0, valEntradas: 0, valSaidas: 0 };
      }
      if (isEntrada) {
        timelineMap[dia].entradas++;
        timelineMap[dia].valEntradas += valor;
      } else {
        timelineMap[dia].saidas++;
        timelineMap[dia].valSaidas += valor;
      }

      return {
        ...doc,
        compliance: {
          temSt,
          temMono,
          divCfop
        }
      };
    });

    const topFornecedores = Object.values(fornecedoresMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const topClientes = Object.values(clientesMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const timeline = Object.values(timelineMap).sort((a, b) => a.data.localeCompare(b.data));

    return {
      totalDocs: documents.length,
      totalEntradas,
      valorEntradas,
      totalSaidas,
      valorSaidas,
      saldoOperacional: valorSaidas - valorEntradas,
      totalIcms,
      totalIss,
      canceladas,
      comSt,
      comMonofasico,
      divergenciasCfop,
      semManifesto,
      topFornecedores,
      topClientes,
      modelosMap,
      timeline,
      docsWithCompliance
    };
  }, [documents]);

  // Lista de documentos filtrados pelo compliance
  const filteredComplianceDocs = useMemo(() => {
    if (selectedComplianceType === 'all') return stats.docsWithCompliance.slice(0, 10);
    return stats.docsWithCompliance.filter(d => {
      if (selectedComplianceType === 'divergencia_cfop') return d.compliance.divCfop.temDivergencia;
      if (selectedComplianceType === 'st') return d.compliance.temSt;
      if (selectedComplianceType === 'monofasico') return d.compliance.temMono;
      if (selectedComplianceType === 'canceladas') return d.status === 'Cancelada';
      return true;
    }).slice(0, 15);
  }, [stats.docsWithCompliance, selectedComplianceType]);

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Summary & Actions */}
      <div className="p-6 bg-[#0F172A] border border-slate-800 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Painel Analítico de Conformidade Fiscal
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
              Volume em Tempo Real
            </span>
          </div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            Visão Executiva & Auditoria Fiscal
          </h2>
          <p className="text-xs text-slate-400">
            Análise consolidada de faturamento, compras de fornecedores, tributos destacados e regras automáticas de compliance fiscal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onExportSped && (
            <button
              onClick={onExportSped}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-md"
              title="Gerar arquivo de escrituração do SPED Fiscal Bloco C"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Exportar SPED C100</span>
            </button>
          )}

          {onExportCsv && (
            <button
              onClick={onExportCsv}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-md"
              title="Exportar dados analíticos em planilha CSV"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span>Planilha CSV</span>
            </button>
          )}

          {onOpenBatchUpload && (
            <button
              onClick={onOpenBatchUpload}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-900/30 transition flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 rotate-180 text-emerald-200" />
              <span>Ingestão ERP (.ZIP / Stream)</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Highlights (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Faturamento Saídas */}
        <div className="p-5 bg-[#0B0F19] border border-blue-500/20 rounded-2xl relative overflow-hidden shadow-lg group hover:border-blue-500/40 transition">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ArrowUpRight className="w-4 h-4 text-blue-400" />
              Faturamento (Saídas)
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 font-bold text-[10px]">
              {stats.totalSaidas} notas
            </span>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            {formatBRL(stats.valorSaidas)}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Ticket Médio Saída:</span>
            <span className="font-bold text-slate-200">
              {stats.totalSaidas > 0 ? formatBRL(stats.valorSaidas / stats.totalSaidas) : 'R$ 0,00'}
            </span>
          </div>
        </div>

        {/* Card 2: Volume Compras Entradas */}
        <div className="p-5 bg-[#0B0F19] border border-emerald-500/20 rounded-2xl relative overflow-hidden shadow-lg group hover:border-emerald-500/40 transition">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
              Compras (Entradas)
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-bold text-[10px]">
              {stats.totalEntradas} notas
            </span>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            {formatBRL(stats.valorEntradas)}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Ticket Médio Entrada:</span>
            <span className="font-bold text-slate-200">
              {stats.totalEntradas > 0 ? formatBRL(stats.valorEntradas / stats.totalEntradas) : 'R$ 0,00'}
            </span>
          </div>
        </div>

        {/* Card 3: Saldo Operacional & Tributos */}
        <div className="p-5 bg-[#0B0F19] border border-slate-800 rounded-2xl relative overflow-hidden shadow-lg group hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              Saldo Operacional
            </span>
            <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${stats.saldoOperacional >= 0 ? 'bg-purple-500/10 text-purple-300' : 'bg-rose-500/10 text-rose-300'}`}>
              {stats.saldoOperacional >= 0 ? 'Superávit' : 'Déficit'}
            </span>
          </div>
          <div className={`text-2xl font-black tracking-tight ${stats.saldoOperacional >= 0 ? 'text-purple-300' : 'text-rose-400'}`}>
            {formatBRL(stats.saldoOperacional)}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>ICMS Destacado Total:</span>
            <span className="font-bold text-amber-300">{formatBRL(stats.totalIcms)}</span>
          </div>
        </div>

        {/* Card 4: Alertas do Compliance Engine */}
        <div className="p-5 bg-[#0B0F19] border border-amber-500/20 rounded-2xl relative overflow-hidden shadow-lg group hover:border-amber-500/40 transition">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Auditoria de Compliance
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold text-[10px]">
              {stats.divergenciasCfop + stats.comSt + stats.comMonofasico} apontamentos
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <div className="text-xl font-black text-amber-400">{stats.divergenciasCfop}</div>
              <div className="text-[10px] text-slate-400">CFOP Divergente</div>
            </div>
            <div className="h-7 w-px bg-slate-800" />
            <div>
              <div className="text-xl font-black text-emerald-400">{stats.comSt}</div>
              <div className="text-[10px] text-slate-400">Com ICMS-ST</div>
            </div>
            <div className="h-7 w-px bg-slate-800" />
            <div>
              <div className="text-xl font-black text-indigo-400">{stats.comMonofasico}</div>
              <div className="text-[10px] text-slate-400">Monofásicos</div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Sem Manifestação:</span>
            <span className="font-bold text-rose-300">{stats.semManifesto} pendentes</span>
          </div>
        </div>

      </div>

      {/* Visual Charts Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Chart 1: Timeline de Emissões & Movimentação Diária */}
        <div className="p-6 bg-[#0B0F19] border border-slate-800 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                Linha do Tempo de Movimentação Diária
              </h3>
              <p className="text-[11px] text-slate-400">Volume de documentos e faturamento por data de emissão</p>
            </div>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1.5 text-blue-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Saídas
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Entradas
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {stats.timeline.slice(-8).map((point, idx) => {
              const maxVal = Math.max(...stats.timeline.map(t => t.valEntradas + t.valSaidas), 1);
              const pctSaida = Math.min(100, Math.round((point.valSaidas / maxVal) * 100));
              const pctEntrada = Math.min(100, Math.round((point.valEntradas / maxVal) * 100));

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-300 font-semibold">{point.data}</span>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="text-blue-400 font-bold">{point.saidas} saídas ({formatBRL(point.valSaidas)})</span>
                      <span className="text-emerald-400 font-bold">{point.entradas} entradas ({formatBRL(point.valEntradas)})</span>
                    </div>
                  </div>
                  <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-slate-800">
                    <div 
                      className="h-full bg-blue-500 rounded-l-full transition-all duration-500" 
                      style={{ width: `${pctSaida}%` }}
                      title={`Saídas: ${formatBRL(point.valSaidas)}`}
                    />
                    <div 
                      className="h-full bg-emerald-500 rounded-r-full transition-all duration-500" 
                      style={{ width: `${pctEntrada}%` }}
                      title={`Entradas: ${formatBRL(point.valEntradas)}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Modelos de Documentos & Radar de Compliance */}
        <div className="p-6 bg-[#0B0F19] border border-slate-800 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-purple-400" />
                Composição por Modelo Fiscal & Classificação
              </h3>
              <p className="text-[11px] text-slate-400">Distribuição entre modelos e itens com segregação especial</p>
            </div>
            <span className="text-[10px] font-bold text-slate-400">
              Total: {stats.totalDocs} docs
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            {Object.entries(stats.modelosMap).map(([modelo, count]) => {
              const pct = stats.totalDocs > 0 ? Math.round((count / stats.totalDocs) * 100) : 0;
              return (
                <div key={modelo} className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">{modelo}</div>
                  <div className="text-xl font-black text-white">{count}</div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-[9px] text-slate-500 text-right">{pct}% do total</div>
                </div>
              );
            })}
          </div>

          {/* Oportunidades Fiscais (ST e Monofásico) */}
          <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5" />
                Segregação Tributária Identificada
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">
                {stats.comSt + stats.comMonofasico} notas elegíveis
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Itens com <strong className="text-slate-200">ICMS-ST</strong> e <strong className="text-slate-200">PIS/COFINS Monofásico</strong> detectados pelo motor de compliance permitem dedução direta na apuração do Simples Nacional (PGDAS) e exclusão da base de cálculo no Lucro Presumido/Real.
            </p>
          </div>
        </div>

      </div>

      {/* Top Clientes e Fornecedores Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top 5 Fornecedores */}
        <div className="p-6 bg-[#0B0F19] border border-slate-800 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              Principais Fornecedores (Entradas)
            </h3>
            <span className="text-[10px] font-bold text-slate-400">Por Volume Financeiro</span>
          </div>

          <div className="space-y-2.5">
            {stats.topFornecedores.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">Nenhum fornecedor registrado.</div>
            ) : (
              stats.topFornecedores.map((forn, idx) => (
                <div key={idx} className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-center justify-between gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <div className="text-xs font-bold text-slate-200 truncate">{forn.nome}</div>
                    <div className="text-[10px] text-slate-500 font-mono">CNPJ: {forn.cnpj} • {forn.count} notas</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-black text-emerald-400">{formatBRL(forn.total)}</div>
                    <div className="text-[9px] text-slate-500">
                      {stats.valorEntradas > 0 ? `${Math.round((forn.total / stats.valorEntradas) * 100)}% das compras` : ''}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top 5 Clientes */}
        <div className="p-6 bg-[#0B0F19] border border-slate-800 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              Principais Clientes (Saídas)
            </h3>
            <span className="text-[10px] font-bold text-slate-400">Por Faturamento</span>
          </div>

          <div className="space-y-2.5">
            {stats.topClientes.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">Nenhum cliente registrado.</div>
            ) : (
              stats.topClientes.map((cli, idx) => (
                <div key={idx} className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-center justify-between gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <div className="text-xs font-bold text-slate-200 truncate">{cli.nome}</div>
                    <div className="text-[10px] text-slate-500 font-mono">CNPJ: {cli.cnpj} • {cli.count} notas</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-black text-blue-400">{formatBRL(cli.total)}</div>
                    <div className="text-[9px] text-slate-500">
                      {stats.valorSaidas > 0 ? `${Math.round((cli.total / stats.valorSaidas) * 100)}% das vendas` : ''}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Compliance Engine Active Audit Table */}
      <div className="p-6 bg-[#0B0F19] border border-slate-800 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Auditoria de Compliance em Tempo Real
            </h3>
            <p className="text-[11px] text-slate-400">
              Notas fiscais auditadas automaticamente pelas regras de CFOP, ICMS-ST, Monofásico e Cancelamentos
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedComplianceType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedComplianceType === 'all' 
                  ? 'bg-slate-700 text-white shadow' 
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              Todas ({stats.docsWithCompliance.length})
            </button>
            <button
              onClick={() => setSelectedComplianceType('divergencia_cfop')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                selectedComplianceType === 'divergencia_cfop' 
                  ? 'bg-amber-600 text-white shadow' 
                  : 'bg-slate-900 text-amber-400 hover:bg-slate-800'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              CFOP Divergente ({stats.divergenciasCfop})
            </button>
            <button
              onClick={() => setSelectedComplianceType('st')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                selectedComplianceType === 'st' 
                  ? 'bg-emerald-600 text-white shadow' 
                  : 'bg-slate-900 text-emerald-400 hover:bg-slate-800'
              }`}
            >
              <Percent className="w-3.5 h-3.5" />
              ICMS-ST ({stats.comSt})
            </button>
            <button
              onClick={() => setSelectedComplianceType('monofasico')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                selectedComplianceType === 'monofasico' 
                  ? 'bg-indigo-600 text-white shadow' 
                  : 'bg-slate-900 text-indigo-400 hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Monofásico ({stats.comMonofasico})
            </button>
          </div>
        </div>

        {/* Mini Table of Audit Results */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3">Doc / Chave</th>
                <th className="p-3">Tipo & Direção</th>
                <th className="p-3">Emitente / Destinatário</th>
                <th className="p-3">CFOP / NCM</th>
                <th className="p-3">Valor Total</th>
                <th className="p-3">Apontamento de Compliance</th>
                <th className="p-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredComplianceDocs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-500">
                    Nenhum documento com o apontamento selecionado.
                  </td>
                </tr>
              ) : (
                filteredComplianceDocs.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-900/50 transition">
                    <td className="p-3">
                      <div className="font-bold text-white">Nº {doc.numero}</div>
                      <div className="font-mono text-[9px] text-slate-500 truncate max-w-[150px]">
                        {doc.chave || doc.id}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        doc.direcao === 'entrada' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {doc.direcao === 'entrada' ? 'Entrada' : 'Saída'} ({doc.tipo})
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-200 truncate max-w-[200px]">
                        {doc.direcao === 'entrada' ? doc.emitente : doc.destinatario}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {doc.direcao === 'entrada' ? doc.emitenteCnpj : doc.destinatarioCnpj}
                      </div>
                    </td>
                    <td className="p-3 font-mono text-[11px]">
                      <span className="text-amber-300 font-bold">{doc.cfop || '---'}</span>
                      {doc.ncm && <span className="text-slate-500 ml-1.5">/ {doc.ncm}</span>}
                    </td>
                    <td className="p-3 font-bold text-slate-200">
                      {formatBRL(doc.valorTotal)}
                    </td>
                    <td className="p-3">
                      {doc.compliance.divCfop.temDivergencia ? (
                        <span className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          CFOP Divergente
                        </span>
                      ) : doc.compliance.temSt ? (
                        <span className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                          <Percent className="w-3 h-3" />
                          ICMS-ST Retido
                        </span>
                      ) : doc.compliance.temMono ? (
                        <span className="px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          PIS/COFINS Monofásico
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          Conforme
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {onSelectDoc && (
                        <button
                          onClick={() => onSelectDoc(doc.id)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-bold transition cursor-pointer"
                        >
                          Ver DANFE
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
