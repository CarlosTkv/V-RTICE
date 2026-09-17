import React, { useState } from 'react';
import { 
  X, 
  History, 
  FileText, 
  Trash2, 
  RotateCcw, 
  Printer, 
  CheckCircle2, 
  Calendar, 
  ArrowRight, 
  ShieldCheck, 
  DollarSign, 
  Percent, 
  Sparkles,
  Search,
  Download
} from 'lucide-react';
import { CompanyData, SavedSimulation } from '../types';
import { formatCurrencyBRL, formatPercentBR } from '../utils/taxRules';

interface SimulationHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyData;
  onRestoreSimulation: (sim: SavedSimulation) => void;
  onDeleteSimulation: (id: string) => void;
}

export const SimulationHistoryModal: React.FC<SimulationHistoryModalProps> = ({
  isOpen,
  onClose,
  company,
  onRestoreSimulation,
  onDeleteSimulation,
}) => {
  const [selectedSim, setSelectedSim] = useState<SavedSimulation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const history = company.simulationHistory || [];
  const filteredHistory = history.filter(sim => 
    sim.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sim.scenarioNotes && sim.scenarioNotes.toLowerCase().includes(searchTerm.toLowerCase())) ||
    sim.timestamp.includes(searchTerm)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn font-sans">
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative text-slate-100 my-auto">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#0B0F19]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider px-2 py-0.5 bg-blue-950/60 rounded border border-blue-800/60">
                  Pareceres Arquivados
                </span>
                <span className="text-xs text-slate-400 font-mono">{history.length} simulações salvas</span>
              </div>
              <h2 className="text-lg font-bold text-slate-100 tracking-tight">
                Histórico de Simulações & Pareceres Técnicos
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0B0F19]">
          
          {/* Search bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por título, notas ou data..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* If viewing a selected simulation details */}
          {selectedSim ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-900/90 border border-slate-800 gap-3">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setSelectedSim(null)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded-xl border border-slate-700 transition cursor-pointer font-semibold shadow-xs"
                  >
                    ← Voltar à Lista
                  </button>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">{selectedSim.title}</h3>
                    <p className="text-xs text-slate-400 font-mono">Arquivado em: {selectedSim.timestamp}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl flex items-center space-x-1.5 border border-slate-700 transition cursor-pointer shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5 text-blue-400" />
                    <span>Imprimir Parecer</span>
                  </button>

                  <button
                    onClick={() => {
                      onRestoreSimulation(selectedSim);
                      onClose();
                    }}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white rounded-xl flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restaurar Esta Simulação</span>
                  </button>
                </div>
              </div>

              {/* Printable Parecer Document */}
              <div className="bg-slate-900/90 text-slate-100 p-8 rounded-2xl shadow-xs border border-slate-800 print:bg-white print:text-slate-900 print:p-0 print:border-none print:shadow-none space-y-6">
                <div className="border-b-2 border-slate-700 print:border-slate-900 pb-4 flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 print:text-slate-500">
                      PARECER TÉCNICO DE ENQUADRAMENTO TRIBUTÁRIO ARQUIVADO
                    </p>
                    <h1 className="text-xl font-bold text-slate-100 print:text-slate-900 mt-1">
                      {selectedSim.title}
                    </h1>
                    <p className="text-xs text-slate-400 print:text-slate-600 mt-0.5">
                      Empresa: <strong>{company.name}</strong> | CNPJ: {company.cnpj}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 bg-emerald-950/60 text-emerald-300 font-bold text-xs rounded border border-emerald-800/60 print:bg-emerald-100 print:text-emerald-800">
                      Regime Vencedor: {selectedSim.bestRegime.toUpperCase()}
                    </span>
                    <p className="text-[10px] text-slate-400 print:text-slate-500 mt-1 font-mono">Data: {selectedSim.timestamp}</p>
                  </div>
                </div>

                {/* Scenario Notes */}
                {selectedSim.scenarioNotes && (
                  <div className="p-3 bg-amber-950/40 rounded-xl border border-amber-800/40 text-xs text-amber-300 print:bg-amber-50 print:text-amber-900 print:border-amber-200">
                    <strong>Notas do Cenário:</strong> {selectedSim.scenarioNotes}
                  </div>
                )}

                {/* Key Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-950/80 print:bg-slate-50 rounded-xl border border-slate-800 print:border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 print:text-slate-500 block font-bold text-[11px]">RBT12 Registrado:</span>
                    <strong className="font-mono text-sm text-slate-100 print:text-slate-900">{formatCurrencyBRL(selectedSim.rbt12)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 print:text-slate-500 block font-bold text-[11px]">Faturamento do Mês:</span>
                    <strong className="font-mono text-sm text-slate-100 print:text-slate-900">{formatCurrencyBRL(selectedSim.monthlyRevenue)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 print:text-slate-500 block font-bold text-[11px]">Fator R / Anexo:</span>
                    <strong className="font-mono text-sm text-blue-400 print:text-blue-700">{selectedSim.fatorRPercent.toFixed(1)}% (Anexo {selectedSim.effectiveAnexo})</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 print:text-slate-500 block font-bold text-[11px]">Economia Anual Apurada:</span>
                    <strong className="font-mono text-sm text-emerald-400 print:text-emerald-700">{formatCurrencyBRL(selectedSim.annualSavings)}</strong>
                  </div>
                </div>

                {/* Comparison Table */}
                <table className="w-full text-left text-xs border-collapse border border-slate-800 print:border-slate-300">
                  <thead>
                    <tr className="bg-slate-950 print:bg-slate-100 text-slate-200 print:text-slate-800 font-bold border-b border-slate-800 print:border-slate-300">
                      <th className="py-2.5 px-3 border border-slate-800 print:border-slate-300">Regime Tributário</th>
                      <th className="py-2.5 px-3 text-right border border-slate-800 print:border-slate-300">Custo Mensal</th>
                      <th className="py-2.5 px-3 text-right border border-slate-800 print:border-slate-300">Custo Anual</th>
                      <th className="py-2.5 px-3 text-center border border-slate-800 print:border-slate-300">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 print:divide-slate-200 font-mono">
                    <tr className={selectedSim.bestRegime === 'simples' ? 'bg-emerald-950/20 print:bg-emerald-50/70 font-bold' : ''}>
                      <td className="py-2.5 px-3 border border-slate-800 print:border-slate-300 font-sans text-slate-200 print:text-slate-900">Simples Nacional (DAS)</td>
                      <td className="py-2.5 px-3 text-right border border-slate-800 print:border-slate-300 text-slate-100 print:text-slate-900">{formatCurrencyBRL(selectedSim.simplesTaxMonthly)}</td>
                      <td className="py-2.5 px-3 text-right border border-slate-800 print:border-slate-300 text-slate-100 print:text-slate-900">{formatCurrencyBRL(selectedSim.simplesTaxAnnual)}</td>
                      <td className="py-2.5 px-3 text-center border border-slate-800 print:border-slate-300 font-sans">
                        {selectedSim.bestRegime === 'simples' && <span className="text-emerald-400 print:text-emerald-700 font-bold">RECOMENDADO</span>}
                      </td>
                    </tr>
                    <tr className={selectedSim.bestRegime === 'presumido' ? 'bg-emerald-950/20 print:bg-emerald-50/70 font-bold' : ''}>
                      <td className="py-2.5 px-3 border border-slate-800 print:border-slate-300 font-sans text-slate-200 print:text-slate-900">Lucro Presumido</td>
                      <td className="py-2.5 px-3 text-right border border-slate-800 print:border-slate-300 text-slate-100 print:text-slate-900">{formatCurrencyBRL(selectedSim.presumedTaxMonthly)}</td>
                      <td className="py-2.5 px-3 text-right border border-slate-800 print:border-slate-300 text-slate-100 print:text-slate-900">{formatCurrencyBRL(selectedSim.presumedTaxAnnual)}</td>
                      <td className="py-2.5 px-3 text-center border border-slate-800 print:border-slate-300 font-sans">
                        {selectedSim.bestRegime === 'presumido' && <span className="text-emerald-400 print:text-emerald-700 font-bold">RECOMENDADO</span>}
                      </td>
                    </tr>
                    <tr className={selectedSim.bestRegime === 'real' ? 'bg-emerald-950/20 print:bg-emerald-50/70 font-bold' : ''}>
                      <td className="py-2.5 px-3 border border-slate-800 print:border-slate-300 font-sans text-slate-200 print:text-slate-900">Lucro Real</td>
                      <td className="py-2.5 px-3 text-right border border-slate-800 print:border-slate-300 text-slate-100 print:text-slate-900">{formatCurrencyBRL(selectedSim.realTaxMonthly)}</td>
                      <td className="py-2.5 px-3 text-right border border-slate-800 print:border-slate-300 text-slate-100 print:text-slate-900">{formatCurrencyBRL(selectedSim.realTaxAnnual)}</td>
                      <td className="py-2.5 px-3 text-center border border-slate-800 print:border-slate-300 font-sans">
                        {selectedSim.bestRegime === 'real' && <span className="text-emerald-400 print:text-emerald-700 font-bold">RECOMENDADO</span>}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Signatures */}
                <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs text-slate-400 print:text-slate-700">
                  <div className="border-t border-slate-700 print:border-slate-300 pt-3">
                    <p className="font-bold text-slate-100 print:text-slate-900">{company.name}</p>
                    <p className="text-slate-400 print:text-slate-500">Representante Legal</p>
                  </div>
                  <div className="border-t border-slate-700 print:border-slate-300 pt-3">
                    <p className="font-bold text-slate-100 print:text-slate-900">Carlos Miguel Vieira</p>
                    <p className="text-slate-400 print:text-slate-500">Auditor Fiscal & Consultor Tributário Master</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Simulation Cards List */
            <div className="space-y-3">
              {filteredHistory.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl bg-slate-900/60 p-6">
                  <History className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-300">Nenhum parecer arquivado encontrado</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    Ao realizar simulações no painel de tributação, marque a opção <strong>[x] Manter em Histórico</strong> para arquivar os pareceres fiscais de cada cenário.
                  </p>
                </div>
              ) : (
                filteredHistory.map((sim) => (
                  <div
                    key={sim.id}
                    className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-950/60 text-blue-300 border border-blue-800/60 rounded">
                          Anexo {sim.effectiveAnexo}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 rounded">
                          Vencedor: {sim.bestRegime.toUpperCase()}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">{sim.timestamp}</span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-100 mt-1.5">{sim.title}</h4>
                      {sim.scenarioNotes && (
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{sim.scenarioNotes}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs font-mono text-slate-400">
                        <span>RBT12: <strong className="text-slate-200">{formatCurrencyBRL(sim.rbt12)}</strong></span>
                        <span>Faturamento: <strong className="text-slate-200">{formatCurrencyBRL(sim.monthlyRevenue)}</strong></span>
                        <span>Alíquota: <strong className="text-slate-200">{sim.effectiveRatePercent.toFixed(2)}%</strong></span>
                        <span>Economia Anual: <strong className="text-emerald-400">{formatCurrencyBRL(sim.annualSavings)}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-end sm:self-center">
                      <button
                        onClick={() => setSelectedSim(sim)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl flex items-center space-x-1.5 border border-slate-700 transition cursor-pointer shadow-xs"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-400" />
                        <span>Ver Parecer</span>
                      </button>

                      <button
                        onClick={() => {
                          onRestoreSimulation(sim);
                          onClose();
                        }}
                        title="Restaurar esta simulação"
                        className="p-2 bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 border border-blue-800/60 rounded-xl transition cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeleteSimulation(sim.id)}
                        title="Excluir do histórico"
                        className="p-2 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 rounded-xl transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-[#0B0F19]">
          <p className="text-xs text-slate-400">
            Os pareceres são mantidos arquivados sob demanda para auditoria e prestação de contas.
          </p>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
