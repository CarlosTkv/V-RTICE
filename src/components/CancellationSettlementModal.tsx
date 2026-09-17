import React, { useState, useMemo } from 'react';
import {
  X,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  FileText,
  DollarSign,
  Scale,
  Calendar,
  Clock,
  ArrowRight,
  Info
} from 'lucide-react';
import { SoldSubscription } from '../types';
import { calculateCancellationSettlement, CancellationSettlementResult } from '../utils/customPlanCalculator';

interface CancellationSettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: SoldSubscription | null;
  onConfirmCancellation: (settlement: CancellationSettlementResult) => void;
}

export const CancellationSettlementModal: React.FC<CancellationSettlementModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onConfirmCancellation,
}) => {
  const [cancellationReason, setCancellationReason] = useState('Encerramento a pedido do contratante');
  const [isAgreedWithTerms, setIsAgreedWithTerms] = useState(false);

  const settlement: CancellationSettlementResult | null = useMemo(() => {
    if (!subscription) return null;
    return calculateCancellationSettlement(subscription);
  }, [subscription]);

  if (!isOpen || !subscription || !settlement) return null;

  const handleExecute = () => {
    if (!isAgreedWithTerms) return;
    onConfirmCancellation(settlement);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto font-sans">
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl w-full max-w-2xl text-slate-100 shadow-2xl overflow-hidden animate-in fade-in duration-150 flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0B0F19] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Rescisão & Cancelamento de Contrato
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                  Regra Pro-rata & CDC
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Demonstrativo de liquidação financeira proporcional e apuração de encargos rescisórios
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* Dados do Contrato e Assinante */}
          <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-slate-400 block text-[11px]">Contratante / Empresa</span>
              <span className="font-bold text-white text-xs block">{subscription.customerName}</span>
              <span className="text-[11px] text-slate-400 font-mono">{subscription.companyName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Plano & Periodicidade</span>
              <span className="font-bold text-blue-300 text-xs block">
                {subscription.planName} ({subscription.periodicity.toUpperCase()})
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Início: {subscription.startDate.split('-').reverse().join('/')} • Valor: R$ {subscription.pricePaid.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Situação Legal CDC Art. 49 */}
          {settlement.isWithinCdc7Days ? (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
                <span>Direito de Arrependimento Aplicável (Art. 49 do CDC)</span>
              </div>
              <p className="text-xs text-emerald-300/90 leading-relaxed">
                O cancelamento está sendo solicitado dentro do prazo legal incondicional de 7 (sete) dias. 
                O contratante tem direito ao estorno integral de <strong>100% do valor pago (R$ {subscription.pricePaid.toFixed(2)})</strong>, 
                sem cobrança de qualquer taxa, multa rescisória ou retenção de pro-rata.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/50 text-amber-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-400">
                <Scale className="w-4 h-4" />
                <span>Rescisão Contratual após Prazo de Arrependimento</span>
              </div>
              <p className="text-[11px] text-amber-200/90 leading-relaxed">
                Contrato vigente há mais de 7 dias. Aplica-se a regra de <strong>apuração proporcional (pro-rata) dos dias usufruídos</strong> e a 
                <strong>multa compensatória de {settlement.penaltyFinePercent}%</strong> sobre o saldo das parcelas vincendas (Artigos 408 a 416 do Código Civil e Cláusula 7ª).
              </p>
            </div>
          )}

          {/* Demonstrativo Financeiro de Rescisão */}
          <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-3">
            <h3 className="font-bold text-slate-200 text-xs flex items-center justify-between border-b border-slate-800 pb-2">
              <span>Demonstrativo Financeiro de Liquidação (Pro-rata & Multa)</span>
              <span className="text-[10px] text-slate-400 font-mono">Código Civil & CDC Art. 52</span>
            </h3>

            <div className="space-y-2 font-mono text-[11px]">
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Valor Integral Pago no Ciclo Vigente:</span>
                <span className="text-slate-200">R$ {settlement.cyclePricePaid.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">
                  (-) Pro-rata de Dias Usufruídos ({settlement.daysUsedInCurrentCycle} dias):
                </span>
                <span className="text-rose-400 font-bold">- R$ {settlement.amountUsedProRata.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Crédito Proporcional Não Usufruído:</span>
                <span className="text-emerald-400">R$ {settlement.amountUnusedRefundable.toFixed(2)}</span>
              </div>

              {settlement.hasActiveFidelity && (
                <>
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">
                      Saldo de Parcelas Vincendas ({settlement.fidelityMonthsRemaining} meses restantes):
                    </span>
                    <span className="text-slate-300">R$ {settlement.remainingContractValue.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">
                      (+) Multa Compensatória de Rescisão ({settlement.penaltyFinePercent}%):
                    </span>
                    <span className="text-rose-400 font-bold">+ R$ {settlement.penaltyFineAmount.toFixed(2)}</span>
                  </div>
                </>
              )}

              {/* Resultado Final */}
              <div className="flex items-center justify-between pt-2 text-xs font-sans font-bold">
                <span className="text-white text-sm">
                  {settlement.finalBalanceToPayOrRefund > 0 
                    ? 'Saldo Residual a Liquidar pelo Contratante:'
                    : settlement.finalBalanceToPayOrRefund < 0
                    ? 'Crédito a Restituir ao Contratante:'
                    : 'Saldo Final de Liquidação:'}
                </span>
                <span className={`text-base font-mono font-bold ${
                  settlement.finalBalanceToPayOrRefund > 0 
                    ? 'text-rose-400' 
                    : settlement.finalBalanceToPayOrRefund < 0 
                    ? 'text-emerald-400' 
                    : 'text-slate-300'
                }`}>
                  R$ {Math.abs(settlement.finalBalanceToPayOrRefund).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Motivo do Cancelamento */}
          <div>
            <label className="text-slate-300 font-bold block mb-1">Motivo do Cancelamento / Observações</label>
            <textarea
              value={cancellationReason}
              onChange={e => setCancellationReason(e.target.value)}
              rows={2}
              className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none focus:ring-1 focus:ring-rose-500 resize-none"
              placeholder="Descreva o motivo da rescisão contratual..."
            />
          </div>

          {/* Aceite dos Termos */}
          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#0B0F19] border border-slate-800 cursor-pointer text-[11px] text-slate-300">
            <input
              type="checkbox"
              checked={isAgreedWithTerms}
              onChange={e => setIsAgreedWithTerms(e.target.checked)}
              className="mt-0.5 rounded accent-rose-500 cursor-pointer"
            />
            <div>
              <span className="font-bold text-white block">Declaro ciência dos cálculos de rescisão e proporcionalidade</span>
              <p className="text-slate-400 mt-0.5">
                Confirmo que as condições de rescisão, apuração do período proporcional e eventuais encargos contratuais foram devidamente demonstrados e acordados.
              </p>
            </div>
          </label>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#0B0F19] flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
          >
            Manter Assinatura Ativa
          </button>

          <button
            type="button"
            onClick={handleExecute}
            disabled={!isAgreedWithTerms}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition shadow-md flex items-center gap-2 cursor-pointer ${
              isAgreedWithTerms
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Confirmar Rescisão & Distrato</span>
          </button>
        </div>

      </div>
    </div>
  );
};
