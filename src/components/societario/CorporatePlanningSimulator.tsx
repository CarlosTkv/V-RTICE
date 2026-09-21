import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  ShieldAlert, 
  ArrowRight, 
  RotateCcw, 
  Save, 
  FileText,
  Info
} from 'lucide-react';
import { CompanyData, Partner, PartnerOtherCompany } from '../../types';
import { formatCurrencyBRL, FEDERAL_LIMIT } from '../../utils/taxRules';

interface CorporatePlanningSimulatorProps {
  company: CompanyData;
  onApplyContractChanges?: (updatedCompany: CompanyData) => void;
}

export const CorporatePlanningSimulator: React.FC<CorporatePlanningSimulatorProps> = ({
  company,
  onApplyContractChanges,
}) => {
  const currentRbt12 = company.rbt12 || (company.monthlyRevenue ? company.monthlyRevenue * 12 : 0);

  // Find partners with other companies
  const partnersWithOthers = useMemo(() => {
    return (company.partners || []).filter(p => (p.otherCompanies || []).length > 0);
  }, [company.partners]);

  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(
    partnersWithOthers[0]?.id || company.partners[0]?.id || ''
  );

  const selectedPartner = useMemo(() => {
    return (company.partners || []).find(p => p.id === selectedPartnerId) || partnersWithOthers[0] || null;
  }, [company.partners, selectedPartnerId, partnersWithOthers]);

  const otherCompanies = selectedPartner?.otherCompanies || [];

  const [selectedOtherId, setSelectedOtherId] = useState<string>(
    otherCompanies[0]?.id || ''
  );

  const selectedOther = useMemo(() => {
    return otherCompanies.find(o => o.id === selectedOtherId) || otherCompanies[0] || null;
  }, [otherCompanies, selectedOtherId]);

  // Simulation state for the selected other company
  const [simulatedParticipation, setSimulatedParticipation] = useState<number>(
    selectedOther ? selectedOther.participationPercent : 9
  );
  const [simulatedIsManagerOther, setSimulatedIsManagerOther] = useState<boolean>(
    selectedOther ? selectedOther.isManager : false
  );
  const [simulatedIsManagerMain, setSimulatedIsManagerMain] = useState<boolean>(
    selectedPartner ? selectedPartner.isManager : true
  );

  // Sync state when selection changes
  const handleSelectPartner = (partnerId: string) => {
    setSelectedPartnerId(partnerId);
    const p = (company.partners || []).find(part => part.id === partnerId);
    if (p && p.otherCompanies.length > 0) {
      setSelectedOtherId(p.otherCompanies[0].id);
      setSimulatedParticipation(p.otherCompanies[0].participationPercent);
      setSimulatedIsManagerOther(p.otherCompanies[0].isManager);
      setSimulatedIsManagerMain(p.isManager);
    }
  };

  const handleSelectOther = (otherId: string) => {
    setSelectedOtherId(otherId);
    const o = otherCompanies.find(comp => comp.id === otherId);
    if (o) {
      setSimulatedParticipation(o.participationPercent);
      setSimulatedIsManagerOther(o.isManager);
    }
  };

  // Original state evaluation
  const originalTriggersSum = useMemo(() => {
    if (!selectedPartner || !selectedOther) return false;
    const isSimples = selectedOther.regime === 'simples';
    const isDualManager = selectedPartner.isManager && selectedOther.isManager;
    const isManagerWith10 = selectedPartner.isManager && (selectedOther.participationPercent || 0) > 10;
    const isSimplesWith10 = selectedPartner.participationPercent > 10 && (selectedOther.participationPercent || 0) > 10 && isSimples;
    const isPresumidoWith10 = selectedPartner.participationPercent > 10 && (selectedOther.participationPercent || 0) > 10 && !isSimples;

    return isDualManager || isManagerWith10 || isSimplesWith10 || isPresumidoWith10;
  }, [selectedPartner, selectedOther]);

  // Simulated state evaluation
  const simulatedTriggersSum = useMemo(() => {
    if (!selectedPartner || !selectedOther) return false;
    const isSimples = selectedOther.regime === 'simples';
    const isDualManager = simulatedIsManagerMain && simulatedIsManagerOther;
    const isManagerWith10 = simulatedIsManagerMain && simulatedParticipation > 10;
    const isSimplesWith10 = selectedPartner.participationPercent > 10 && simulatedParticipation > 10 && isSimples;
    const isPresumidoWith10 = selectedPartner.participationPercent > 10 && simulatedParticipation > 10 && !isSimples;

    return isDualManager || isManagerWith10 || isSimplesWith10 || isPresumidoWith10;
  }, [selectedPartner, selectedOther, simulatedParticipation, simulatedIsManagerOther, simulatedIsManagerMain]);

  const isRiskEliminated = originalTriggersSum && !simulatedTriggersSum;

  // Calculate global totals before vs after
  const otherRevenue = selectedOther?.revenue12m || 0;

  const originalGlobalTotal = currentRbt12 + (originalTriggersSum ? otherRevenue : 0);
  const simulatedGlobalTotal = currentRbt12 + (simulatedTriggersSum ? otherRevenue : 0);

  // Apply simulated changes to actual company
  const handleApplySimulation = () => {
    if (!selectedPartner || !selectedOther || !onApplyContractChanges) return;

    const updatedPartners = company.partners.map(p => {
      if (p.id === selectedPartner.id) {
        const updatedOthers = p.otherCompanies.map(o => {
          if (o.id === selectedOther.id) {
            return {
              ...o,
              participationPercent: simulatedParticipation,
              isManager: simulatedIsManagerOther,
            };
          }
          return o;
        });
        return {
          ...p,
          isManager: simulatedIsManagerMain,
          otherCompanies: updatedOthers,
        };
      }
      return p;
    });

    onApplyContractChanges({
      ...company,
      partners: updatedPartners,
    });
  };

  const handleReset = () => {
    if (selectedOther && selectedPartner) {
      setSimulatedParticipation(selectedOther.participationPercent);
      setSimulatedIsManagerOther(selectedOther.isManager);
      setSimulatedIsManagerMain(selectedPartner.isManager);
    }
  };

  return (
    <div className="bg-[#0F172A] p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-6 shadow-xl relative overflow-hidden">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block">
              Engenharia Societária Preventiva
            </span>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Simulador de Planejamento Societário ("E se alterarmos o contrato?")</span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Original</span>
          </button>
        </div>
      </div>

      {(!selectedPartner || otherCompanies.length === 0) ? (
        <div className="p-6 text-center bg-[#0B0F19] rounded-xl border border-dashed border-slate-800 text-slate-400 space-y-2">
          <Info className="w-6 h-6 text-blue-400 mx-auto" />
          <p className="text-xs font-bold text-slate-200">
            Cadastre ao menos uma empresa coligada para utilizar o simulador de reestruturação.
          </p>
          <p className="text-[11px] text-slate-500">
            Adicione participações societárias dos sócios em outros CNPJs para testar hipóteses de alteração contratual.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* SELECTORS ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#0B0F19] p-4 rounded-xl border border-slate-800">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                1. Selecione o Sócio em Análise:
              </label>
              <select
                value={selectedPartnerId}
                onChange={(e) => handleSelectPartner(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-blue-500"
              >
                {partnersWithOthers.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.participationPercent}% na empresa principal)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                2. Selecione a Empresa Coligada:
              </label>
              <select
                value={selectedOtherId}
                onChange={(e) => handleSelectOther(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-blue-500"
              >
                {otherCompanies.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.name} ({formatCurrencyBRL(o.revenue12m || 0)} - {o.regime})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* INTERACTIVE CONTROLS SECTION */}
          <div className="bg-[#0B0F19] p-5 rounded-xl border border-slate-800 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              <span>Parâmetros de Alteração Contratual Hipotética:</span>
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Slider Participation */}
              <div className="space-y-2 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[11px] font-bold text-slate-300">
                    % de Participação na Coligada:
                  </span>
                  <span className={`font-mono font-bold text-sm ${
                    simulatedParticipation <= 10 ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {simulatedParticipation.toFixed(1)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.5"
                  value={simulatedParticipation}
                  onChange={(e) => setSimulatedParticipation(parseFloat(e.target.value) || 0)}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>0%</span>
                  <span className="text-emerald-400 font-bold">Limite Legal: 10,0%</span>
                  <span>100%</span>
                </div>
                {simulatedParticipation <= 10 && (
                  <span className="text-[10px] text-emerald-400 block font-semibold">
                    ✓ Participação ≤ 10% (Não aciona Inciso III nem IV isoladamente)
                  </span>
                )}
              </div>

              {/* Toggle Admin Coligada */}
              <div className="space-y-2 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[11px] font-bold text-slate-300 block">
                  Exerce Administração na Coligada?
                </span>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSimulatedIsManagerOther(false)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition ${
                      !simulatedIsManagerOther 
                        ? 'bg-emerald-600 text-white shadow-md' 
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Não (Apenas Cotista)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulatedIsManagerOther(true)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition ${
                      simulatedIsManagerOther 
                        ? 'bg-amber-600 text-white shadow-md' 
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Sim (Administrador)
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 pt-1">
                  Renunciar à administração da coligada descaracteriza o Inciso V.
                </p>
              </div>

              {/* Toggle Admin Main Company */}
              <div className="space-y-2 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[11px] font-bold text-slate-300 block">
                  Administrador na Empresa Principal?
                </span>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSimulatedIsManagerMain(true)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition ${
                      simulatedIsManagerMain 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Sim (Gestor)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulatedIsManagerMain(false)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition ${
                      !simulatedIsManagerMain 
                        ? 'bg-slate-700 text-white shadow-md' 
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Não (Cotista)
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 pt-1">
                  Afeta a cumulatividade com participações superiores a 10%.
                </p>
              </div>
            </div>
          </div>

          {/* REAL-TIME VERDICT BANNER (EXACTLY AS REQUESTED BY THE USER) */}
          {isRiskEliminated ? (
            <div className="bg-emerald-950/70 border-2 border-emerald-500 rounded-2xl p-4 sm:p-5 shadow-xl animate-fadeIn space-y-2">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-emerald-300">
                    Risco Eliminado! A coligada deixa de somar ao faturamento global conforme Art. 3º § 4º, III da LC 123/06.
                  </h4>
                  <p className="text-xs text-emerald-200/90 mt-0.5">
                    Ao ajustar a participação para ≤ 10% e afastar poderes de administração, a receita de <b>{formatCurrencyBRL(otherRevenue)}</b> da coligada não se comunica mais com a empresa principal.
                  </p>
                </div>
              </div>
            </div>
          ) : simulatedTriggersSum ? (
            <div className="bg-amber-950/60 border border-amber-500/60 rounded-2xl p-4 sm:p-5 shadow-xl space-y-2">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-amber-300">
                    Vínculo Societário Continua Ativo na Simulação
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    A coligada continua somando porque a participação simulada ainda é superior a 10% ({simulatedParticipation}%) ou o sócio ainda figura como administrador em ambas. Reduza para 9% ou menos e remova a administração.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-4 space-y-1">
              <h4 className="text-xs font-bold text-slate-300">
                Esta coligada já estava isenta de soma no cenário original.
              </h4>
              <p className="text-[11px] text-slate-400">
                As configurações atuais já respeitavam os parâmetros legais de não-cumulatividade.
              </p>
            </div>
          )}

          {/* COMPARISON TILES: CENÁRIO ATUAL VS CENÁRIO SIMULADO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Cenário Atual (Contrato Vigente):
              </span>
              <div className="flex justify-between items-center text-slate-200">
                <span>Faturamento Agregado:</span>
                <span className="font-bold">{formatCurrencyBRL(originalGlobalTotal)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-200">
                <span>Status de Soma da Coligada:</span>
                <span className={`font-bold ${originalTriggersSum ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {originalTriggersSum ? 'Soma ao Teto de R$ 4,8M' : 'Não Soma (Isenta)'}
                </span>
              </div>
            </div>

            <div className="bg-[#0B0F19] p-4 rounded-xl border border-purple-500/30 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 block">
                Cenário Simulado (Com Alteração Contratual):
              </span>
              <div className="flex justify-between items-center text-slate-200">
                <span>Faturamento Agregado Projetado:</span>
                <span className={`font-bold ${simulatedGlobalTotal > FEDERAL_LIMIT ? 'text-red-400' : 'text-emerald-400'}`}>
                  {formatCurrencyBRL(simulatedGlobalTotal)}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-200">
                <span>Resultado Prático:</span>
                <span className={`font-bold ${isRiskEliminated ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {isRiskEliminated ? 'Economia de R$ 4,8M (Risco Zero)' : simulatedTriggersSum ? 'Permanece Vinculada' : 'Isenta'}
                </span>
              </div>
            </div>
          </div>

          {/* ACTION BUTTON TO APPLY SIMULATION TO REAL CADASTRO */}
          {onApplyContractChanges && isRiskEliminated && (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleApplySimulation}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition shadow-lg flex items-center space-x-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Efetivar Alteração Contratual no Cadastro Real</span>
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
