import React, { useState } from 'react';
import { 
  Archive, 
  RotateCcw, 
  Trash2, 
  Calendar, 
  CheckCircle2, 
  Building2, 
  TrendingUp, 
  Printer, 
  Scale, 
  AlertCircle,
  FileText,
  Clock,
  ArrowRight,
  Sparkles,
  CheckSquare,
  Square,
  Eye,
  Download,
  Plus,
  BarChart3
} from 'lucide-react';
import { CompanyData, SavedSimulation, CalculationResult } from '../types';
import { formatCurrencyBRL, formatPercentBR } from '../utils/taxRules';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

interface SimulationHistoryViewProps {
  company: CompanyData;
  companies: CompanyData[];
  calculation: CalculationResult;
  onChangeCompany: (updated: CompanyData) => void;
  onNavigateToTab?: (tab: 'dashboard' | 'financeiro' | 'gestao_planos' | 'regimes' | 'projecao' | 'historico' | 'cfop' | 'socios' | 'fator_r' | 'reforma' | 'parecer') => void;
}

export const SimulationHistoryView: React.FC<SimulationHistoryViewProps> = ({
  company,
  companies,
  calculation,
  onChangeCompany,
  onNavigateToTab,
}) => {
  const historyList = company.simulationHistory || [];
  const [selectedSimId, setSelectedSimId] = useState<string | null>(
    historyList.length > 0 ? historyList[0].id : null
  );
  const [newTitle, setNewTitle] = useState('');
  const [filterCompany, setFilterCompany] = useState<string>(company.name);

  const selectedSim = historyList.find(s => s.id === selectedSimId) || historyList[0] || null;

  // Toggle "Manter em Histórico"
  const handleToggleAutoSave = () => {
    const updated = {
      ...company,
      keepSimulationHistory: !company.keepSimulationHistory
    };
    onChangeCompany(updated);
  };

  // Arquivar Snapshot Atual
  const handleArchiveCurrent = () => {
    const now = new Date();
    const title = newTitle.trim() || `Parecer Fiscal - ${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    const bestRegimeKey: 'simples' | 'presumido' | 'real' = 
      calculation.bestRegime.regime === 'lucro_presumido' ? 'presumido' :
      calculation.bestRegime.regime === 'lucro_real' ? 'real' : 'simples';

    const secondBestTax = [...calculation.regimesComparison]
      .sort((a, b) => a.annualTaxTotal - b.annualTaxTotal)[1]?.annualTaxTotal || calculation.bestRegime.annualTaxTotal;
    const annualSavings = Math.max(0, secondBestTax - calculation.bestRegime.annualTaxTotal);

    const newSimulation: SavedSimulation = {
      id: `sim-${Date.now()}`,
      title,
      date: now.toLocaleDateString('pt-BR'),
      timestamp: now.toISOString(),
      rbt12: company.rbt12 || 0,
      monthlyRevenue: company.monthlyRevenue || (company.rbt12 / 12),
      payroll12m: company.payroll12m || 0,
      monthlyPayroll: company.monthlyPayroll || (company.payroll12m / 12),
      fatorRPercent: calculation.fatorR || 0,
      fatorRStatus: calculation.fatorRStatus,
      effectiveAnexo: (calculation.anexoCalculations?.[0]?.anexo || company.anexo || 'III') as any,
      effectiveRatePercent: calculation.effectiveRate,
      simplesTaxMonthly: calculation.effectiveTaxMonthly,
      simplesTaxAnnual: calculation.effectiveTaxAnnual,
      presumedTaxMonthly: calculation.regimesComparison?.find(r => r.regime === 'lucro_presumido')?.monthlyTaxTotal || 0,
      presumedTaxAnnual: calculation.regimesComparison?.find(r => r.regime === 'lucro_presumido')?.annualTaxTotal || 0,
      realTaxMonthly: calculation.regimesComparison?.find(r => r.regime === 'lucro_real')?.monthlyTaxTotal || 0,
      realTaxAnnual: calculation.regimesComparison?.find(r => r.regime === 'lucro_real')?.annualTaxTotal || 0,
      bestRegime: bestRegimeKey,
      annualSavings,
      scenarioNotes: `Cenário com RBT12 de ${formatCurrencyBRL(company.rbt12)} e Fator R de ${(calculation.fatorR || 0).toFixed(2)}%.`,
      anexoRevenuesSnapshot: company.anexoRevenues || []
    };

    const updatedHistory = [newSimulation, ...historyList];
    onChangeCompany({
      ...company,
      simulationHistory: updatedHistory,
    });
    setSelectedSimId(newSimulation.id);
    setNewTitle('');
  };

  // Restaurar Snapshot para a Empresa Ativa
  const handleRestore = (sim: SavedSimulation) => {
    if (window.confirm(`Deseja restaurar as premissas deste parecer (${sim.title}) na empresa ativa? Os dados de faturamento e folha serão atualizados.`)) {
      onChangeCompany({
        ...company,
        rbt12: sim.rbt12,
        monthlyRevenue: sim.monthlyRevenue,
        payroll12m: sim.payroll12m,
        monthlyPayroll: sim.monthlyPayroll,
        anexo: sim.effectiveAnexo as any,
      });
      if (onNavigateToTab) {
        onNavigateToTab('dashboard');
      }
    }
  };

  // Excluir Parecer do Histórico
  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza de que deseja remover este parecer arquivado?')) {
      const updated = historyList.filter(s => s.id !== id);
      onChangeCompany({
        ...company,
        simulationHistory: updated,
      });
      if (selectedSimId === id) {
        setSelectedSimId(updated.length > 0 ? updated[0].id : null);
      }
    }
  };

  return (
    <div className="space-y-6 text-slate-200 animate-fadeIn">

      {/* Top Banner do Histórico (Clean & Profissional Dark) */}
      <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0 mt-0.5">
              <Archive className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-sans uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-blue-500/15 text-blue-300 font-bold border border-blue-500/30">
                  Gestão de Pareceres Fiscais
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {historyList.length} Pareceres Arquivados
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1 flex items-center space-x-2">
                <span>Histórico de Simulações & Pareceres</span>
                <span className="text-slate-400 font-normal text-sm">({company.name})</span>
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Mantenha um repositório auditável dos pareceres tributários e cenários simulados. Compare a evolução do planejamento tributário ou restaure snapshots com um clique.
              </p>
            </div>
          </div>

          {/* Toggle Manter em Histórico & Ação */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleToggleAutoSave}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                company.keepSimulationHistory
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-xs'
                  : 'bg-[#0B0F19] text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {company.keepSimulationHistory ? (
                <CheckSquare className="w-4 h-4 text-emerald-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-500" />
              )}
              <span>[ ] Manter em Histórico</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-[#0B0F19] hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold flex items-center space-x-2 border border-slate-800 transition cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4 text-blue-400" />
              <span>Imprimir Parecer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Caixa de Novo Arquivamento Imediato */}
      <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <input
            type="text"
            placeholder="Título descritivo do novo parecer (ex: Simulação Q3 com Fator R 29% e ST)..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>
        <button
          onClick={handleArchiveCurrent}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-blue-600/20 transition shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Arquivar Parecer Atual (Snapshot)</span>
        </button>
      </div>

      {/* Layout de 2 Colunas: Lista à Esquerda e Detalhes/Comparativo à Direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Coluna 1: Lista de Pareceres Arquivados */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>Pareceres Salvos ({historyList.length})</span>
            </h3>
            {company.keepSimulationHistory && (
              <span className="text-[10px] text-emerald-400 font-sans font-bold flex items-center space-x-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Auto-save ativo</span>
              </span>
            )}
          </div>

          {historyList.length === 0 ? (
            <div className="p-8 rounded-xl bg-[#0F172A] border border-slate-800 text-center space-y-3 shadow-xl">
              <Archive className="w-10 h-10 text-slate-500 mx-auto" />
              <p className="text-xs text-slate-300">
                Nenhum parecer arquivado ainda para esta empresa.
              </p>
              <p className="text-[11px] text-slate-400">
                Marque <strong>[x] Manter em Histórico</strong> acima ou clique no botão para salvar o primeiro parecer da análise atual.
              </p>
              <button
                onClick={handleArchiveCurrent}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold inline-flex items-center space-x-1 shadow-md shadow-blue-600/20 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Salvar Agora</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {historyList.map((sim) => {
                const isSelected = sim.id === selectedSimId;

                return (
                  <div
                    key={sim.id}
                    onClick={() => setSelectedSimId(sim.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition relative group ${
                      isSelected
                        ? 'bg-blue-500/10 border-blue-500/50 shadow-md ring-1 ring-blue-500/40'
                        : 'bg-[#0F172A] border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] text-slate-400 font-mono">
                            {sim.date}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#0B0F19] text-slate-300 font-bold border border-slate-800 uppercase">
                            Anexo {sim.effectiveAnexo}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white truncate mt-1">
                          {sim.title}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1.5 text-[11px] font-mono">
                          <span className="text-slate-400">RBT12: {formatCurrencyBRL(sim.rbt12)}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-emerald-400 font-bold">{formatPercentBR(sim.effectiveRatePercent * 100)}</span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleDelete(sim.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                        title="Excluir Parecer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Coluna 2: Detalhes do Parecer Selecionado & Comparativo com o Atual */}
        <div className="lg:col-span-8 space-y-4">
          {selectedSim ? (
            <div className="space-y-4">

              {/* Header do Parecer Selecionado */}
              <div className="p-5 rounded-xl bg-[#0F172A] border border-slate-800 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-sans text-blue-400 uppercase tracking-wider font-bold block">
                      Parecer Arquivado em {selectedSim.date}
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5">
                      {selectedSim.title}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleRestore(selectedSim)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-blue-600/20 transition cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restaurar Cenário</span>
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="p-2 bg-[#0B0F19] hover:bg-slate-800 text-slate-300 rounded-xl transition cursor-pointer border border-slate-800"
                      title="Imprimir"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Métricas Principais do Parecer Arquivado */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                  <div className="p-3 rounded-xl bg-[#0B0F19] border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-sans font-bold block">RBT12 Registrado</span>
                    <strong className="text-sm font-mono text-white mt-1 block">
                      {formatCurrencyBRL(selectedSim.rbt12)}
                    </strong>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0B0F19] border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-sans font-bold block">Fator R na Época</span>
                    <strong className="text-sm font-mono text-blue-400 mt-1 block">
                      {selectedSim.fatorRPercent.toFixed(2)}%
                    </strong>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0B0F19] border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-sans font-bold block">Alíq. Simples</span>
                    <strong className="text-sm font-mono text-emerald-400 mt-1 block">
                      {formatPercentBR(selectedSim.effectiveRatePercent * 100)}
                    </strong>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0B0F19] border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-sans font-bold block">Economia Anual</span>
                    <strong className="text-sm font-mono text-amber-400 mt-1 block">
                      {formatCurrencyBRL(selectedSim.annualSavings)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Comparativo Lado a Lado: Parecer Arquivado vs Cenário Atual Ativo */}
              <div className="p-5 rounded-xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-3">
                <div className="flex items-center space-x-2">
                  <Scale className="w-4 h-4 text-blue-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    Comparativo Direto: Parecer Arquivado vs Cenário Atual
                  </h4>
                </div>

                <div className="">
                  <table className="w-full text-left text-xs border-collapse font-sans">
                    <thead>
                      <tr className="border-b border-slate-800 bg-[#0B0F19] text-slate-400 text-[11px]">
                        <th className="py-2.5 px-3 font-bold">Parâmetro</th>
                        <th className="py-2.5 px-3 font-bold text-blue-400">Parecer Arquivado ({selectedSim.date})</th>
                        <th className="py-2.5 px-3 font-bold text-white">Cenário Atual Ativo</th>
                        <th className="py-2.5 px-3 font-bold text-right">Variação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-mono text-xs">
                      <tr>
                        <td className="py-2.5 px-3 font-sans text-slate-300 font-medium">RBT12 (12 meses)</td>
                        <td className="py-2.5 px-3 text-slate-200">{formatCurrencyBRL(selectedSim.rbt12)}</td>
                        <td className="py-2.5 px-3 text-white font-bold">{formatCurrencyBRL(company.rbt12)}</td>
                        <td className="py-2.5 px-3 text-right text-slate-400">
                          {formatCurrencyBRL(company.rbt12 - selectedSim.rbt12)}
                        </td>
                      </tr>

                      <tr>
                        <td className="py-2.5 px-3 font-sans text-slate-300 font-medium">Faturamento Mensal</td>
                        <td className="py-2.5 px-3 text-slate-200">{formatCurrencyBRL(selectedSim.monthlyRevenue)}</td>
                        <td className="py-2.5 px-3 text-white font-bold">{formatCurrencyBRL(company.monthlyRevenue)}</td>
                        <td className="py-2.5 px-3 text-right text-slate-400">
                          {formatCurrencyBRL(company.monthlyRevenue - selectedSim.monthlyRevenue)}
                        </td>
                      </tr>

                      <tr>
                        <td className="py-2.5 px-3 font-sans text-slate-300 font-medium">Fator R (%)</td>
                        <td className="py-2.5 px-3 text-blue-400">{selectedSim.fatorRPercent.toFixed(2)}%</td>
                        <td className="py-2.5 px-3 text-blue-400 font-bold">{(calculation.fatorR || 0).toFixed(2)}%</td>
                        <td className="py-2.5 px-3 text-right text-slate-400">
                          {((calculation.fatorR || 0) - selectedSim.fatorRPercent).toFixed(2)}%
                        </td>
                      </tr>

                      <tr>
                        <td className="py-2.5 px-3 font-sans text-slate-300 font-medium">DAS Simples Mensal</td>
                        <td className="py-2.5 px-3 text-emerald-400 font-bold">{formatCurrencyBRL(selectedSim.simplesTaxMonthly)}</td>
                        <td className="py-2.5 px-3 text-emerald-400 font-bold">{formatCurrencyBRL(calculation.effectiveTaxMonthly)}</td>
                        <td className="py-2.5 px-3 text-right text-slate-400">
                          {formatCurrencyBRL(calculation.effectiveTaxMonthly - selectedSim.simplesTaxMonthly)}
                        </td>
                      </tr>

                      <tr>
                        <td className="py-2.5 px-3 font-sans text-slate-300 font-medium">Lucro Presumido Anual</td>
                        <td className="py-2.5 px-3 text-slate-200">{formatCurrencyBRL(selectedSim.presumedTaxAnnual)}</td>
                        <td className="py-2.5 px-3 text-white font-bold">
                          {formatCurrencyBRL(calculation.regimesComparison?.find(r => r.regime === 'lucro_presumido')?.annualTaxTotal || 0)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-500">-</td>
                      </tr>

                      <tr className="bg-[#0B0F19] font-bold">
                        <td className="py-2.5 px-3 font-sans text-white">Regime Vencedor</td>
                        <td className="py-2.5 px-3 text-blue-400 uppercase">{selectedSim.bestRegime}</td>
                        <td className="py-2.5 px-3 text-emerald-400 uppercase">{calculation.bestRegime.regime.includes('simples') ? 'SIMPLES' : 'PRESUMIDO'}</td>
                        <td className="py-2.5 px-3 text-right text-slate-500 font-sans">-</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Gráfico Comparativo Visual de Barras: Arquivado vs Atual */}
              {selectedSim && (
                <div className="p-5 rounded-xl bg-[#0F172A]/85 backdrop-blur-xl border border-slate-800 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                        Confronto Visual de Carga Tributária Anual
                      </h4>
                    </div>
                    <span className="text-[10px] text-slate-400">Valores em R$ (Menor é melhor)</span>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          {
                            name: 'Simples Nacional',
                            'Arquivado': Math.round(selectedSim.simplesTaxAnnual),
                            'Atual': Math.round(calculation.effectiveTaxAnnual),
                          },
                          {
                            name: 'Lucro Presumido',
                            'Arquivado': Math.round(selectedSim.presumedTaxAnnual),
                            'Atual': Math.round(calculation.regimesComparison?.find(r => r.regime === 'lucro_presumido')?.annualTaxTotal || 0),
                          },
                          {
                            name: 'Lucro Real',
                            'Arquivado': Math.round(selectedSim.realTaxAnnual),
                            'Atual': Math.round(calculation.regimesComparison?.find(r => r.regime === 'lucro_real')?.annualTaxTotal || 0),
                          }
                        ]}
                        margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} tickFormatter={(v) => `R$ ${Math.round(v / 1000)}k`} />
                        <RechartsTooltip
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                          labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                          formatter={(value: any) => [formatCurrencyBRL(Number(value)), '']}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                        <Bar dataKey="Arquivado" fill="#3b82f6" name={`Arquivado (${selectedSim.date})`} radius={[4, 4, 0, 0]} maxBarSize={50} />
                        <Bar dataKey="Atual" fill="#10b981" name="Cenário Atual" radius={[4, 4, 0, 0]} maxBarSize={50} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Fundamentação & Conclusão Técnica do Parecer */}
              <div className="p-5 rounded-xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span>Conclusão do Parecer Técnico Arquivado</span>
                </h4>
                <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
                  <p>
                    O parecer arquivado para <strong>{company.name}</strong> concluiu que com o faturamento anualizado de <strong>{formatCurrencyBRL(selectedSim.rbt12)}</strong> e alíquota efetiva apurada de <strong>{formatPercentBR(selectedSim.effectiveRatePercent * 100)}</strong>, o melhor enquadramento fiscal recomendado é o <strong>{selectedSim.bestRegime.toUpperCase()}</strong>.
                  </p>
                  <p>
                    Economia anual estimada frente aos regimes comparados: <strong className="text-emerald-400">{formatCurrencyBRL(selectedSim.annualSavings)}</strong>.
                  </p>
                </div>
              </div>

            </div>
          ) : (
            <div className="p-12 rounded-xl bg-[#0F172A] border border-slate-800 text-center text-slate-400 shadow-xl">
              Selecione um parecer no painel à esquerda para visualizar seus detalhes e o comparativo técnico.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
