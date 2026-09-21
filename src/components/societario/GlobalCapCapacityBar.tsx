import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Building2, TrendingUp, Info } from 'lucide-react';
import { CompanyData, CalculationResult } from '../../types';
import { formatCurrencyBRL, FEDERAL_LIMIT, STATE_SUBLIMIT } from '../../utils/taxRules';

interface GlobalCapCapacityBarProps {
  company: CompanyData;
  calculation: CalculationResult;
}

export const GlobalCapCapacityBar: React.FC<GlobalCapCapacityBarProps> = ({
  company,
  calculation,
}) => {
  const currentRbt12 = company.rbt12 || (company.monthlyRevenue ? company.monthlyRevenue * 12 : 0);

  // Calculate aggregation breakdown per partner
  const partnerBreakdown: {
    partnerId: string;
    partnerName: string;
    coligadasCount: number;
    summedRevenue: number;
    companies: { name: string; revenue: number; reason: string }[];
  }[] = [];

  let totalColigadasRevenue = 0;

  (company.partners || []).forEach(partner => {
    let partnerSum = 0;
    const qualifyingCompanies: { name: string; revenue: number; reason: string }[] = [];

    (partner.otherCompanies || []).forEach(other => {
      let shouldSum = false;
      let reason = '';

      if (partner.participationPercent > 10 && (other.participationPercent || 0) > 10 && other.regime === 'simples') {
        shouldSum = true;
        reason = 'Inciso IV: >10% em ambas (Simples Nacional)';
      } else if (partner.isManager && (other.participationPercent || 0) > 10) {
        shouldSum = true;
        reason = 'Inciso III: Administrador nesta e >10% na coligada';
      } else if (partner.isManager && other.isManager) {
        shouldSum = true;
        reason = 'Inciso V: Administrador em ambas as empresas';
      } else if (partner.participationPercent > 10 && (other.participationPercent || 0) > 10 && other.regime !== 'simples') {
        shouldSum = true;
        reason = 'Inciso IV: >10% no Simples e >10% em Lucro Presumido/Real';
      }

      if (shouldSum) {
        partnerSum += other.revenue12m || 0;
        qualifyingCompanies.push({
          name: other.name || 'Empresa Coligada',
          revenue: other.revenue12m || 0,
          reason
        });
      }
    });

    if (partnerSum > 0) {
      totalColigadasRevenue += partnerSum;
      partnerBreakdown.push({
        partnerId: partner.id,
        partnerName: partner.name || 'Sócio',
        coligadasCount: qualifyingCompanies.length,
        summedRevenue: partnerSum,
        companies: qualifyingCompanies
      });
    }
  });

  const grandTotal = currentRbt12 + totalColigadasRevenue;
  const isOverLimit = grandTotal > FEDERAL_LIMIT;
  const excessAmount = Math.max(0, grandTotal - FEDERAL_LIMIT);
  const remainingHeadroom = Math.max(0, FEDERAL_LIMIT - grandTotal);
  const percentageConsumed = Math.min(100, (grandTotal / FEDERAL_LIMIT) * 100);

  // Bar segments
  const empresaPct = Math.min(100, (currentRbt12 / FEDERAL_LIMIT) * 100);
  const partnerColors = [
    { bg: 'bg-indigo-500', text: 'text-indigo-400', border: 'border-indigo-500/40' },
    { bg: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-500/40' },
    { bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/40' },
    { bg: 'bg-cyan-500', text: 'text-cyan-400', border: 'border-cyan-500/40' },
  ];

  return (
    <div className="bg-[#0F172A] p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-5 shadow-xl">
      {/* HEADER WITH TITLE & STATUS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-xl border ${
            isOverLimit 
              ? 'bg-red-500/10 text-red-400 border-red-500/30' 
              : grandTotal > STATE_SUBLIMIT 
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
          }`}>
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block">
              Auditoria de Vínculo Societário (Art. 3º § 4º LC 123/06)
            </span>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Barra Cumulativa do Teto Global (R$ 4,8 Milhões)</span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOverLimit ? (
            <span className="px-3 py-1 rounded-full bg-red-950/70 border border-red-500/50 text-red-300 font-bold text-xs flex items-center gap-1.5 animate-pulse">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              <span>Teto Ultrapassado: Risco de Desenquadramento!</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dentro do Teto Global Permitido</span>
            </span>
          )}
        </div>
      </div>

      {/* DETAILED FORMULA BOX AS REQUESTED:
          [Faturamento Desta Empresa] + [Faturamento Coligadas Sócio A] + ... = Total Consumido */}
      <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800 text-xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
          Fórmula de Composição do Faturamento Global Auditado:
        </span>
        <div className="flex flex-wrap items-center gap-2 font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-blue-950/70 border border-blue-500/30 text-blue-300">
            [Desta Empresa: <b>{formatCurrencyBRL(currentRbt12)}</b>]
          </span>

          {partnerBreakdown.length === 0 ? (
            <span className="text-slate-500 text-[11px]">+ [Nenhuma coligada somada: R$ 0,00]</span>
          ) : (
            partnerBreakdown.map((p, idx) => {
              const color = partnerColors[idx % partnerColors.length];
              return (
                <React.Fragment key={p.partnerId}>
                  <span className="text-slate-400 font-bold">+</span>
                  <span className={`px-2.5 py-1 rounded-lg bg-slate-900 border ${color.border} ${color.text}`}>
                    [Coligadas de {p.partnerName.split(' ')[0]}: <b>{formatCurrencyBRL(p.summedRevenue)}</b>]
                  </span>
                </React.Fragment>
              );
            })
          )}

          <span className="text-slate-400 font-bold">=</span>

          <span className={`px-3 py-1 rounded-lg font-bold border ${
            isOverLimit 
              ? 'bg-red-950/80 border-red-500 text-red-300' 
              : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
          }`}>
            Total Consumido: {formatCurrencyBRL(grandTotal)} / {formatCurrencyBRL(FEDERAL_LIMIT)}
          </span>
        </div>
      </div>

      {/* CAPACITY PROGRESS BAR */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-slate-400 font-semibold">
            Capacidade Consumida: <b className="text-white">{percentageConsumed.toFixed(1)}%</b> do Teto Federal
          </span>
          {isOverLimit ? (
            <span className="text-red-400 font-bold">
              Excesso Crítico: +{formatCurrencyBRL(excessAmount)}
            </span>
          ) : (
            <span className="text-emerald-400 font-bold">
              Folga Restante: {formatCurrencyBRL(remainingHeadroom)}
            </span>
          )}
        </div>

        {/* Stacked Bar */}
        <div className="h-4 w-full bg-[#0B0F19] rounded-full overflow-hidden border border-slate-800 flex relative">
          {/* Sublimit 3.6M Marker */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
            style={{ left: `${(STATE_SUBLIMIT / FEDERAL_LIMIT) * 100}%` }}
            title="Sublimite Estadual ICMS/ISS: R$ 3.600.000,00"
          />

          {/* Current Company Segment */}
          <div 
            className="h-full bg-blue-600 transition-all duration-500"
            style={{ width: `${empresaPct}%` }}
            title={`Desta Empresa: ${formatCurrencyBRL(currentRbt12)}`}
          />

          {/* Partner Segments */}
          {partnerBreakdown.map((p, idx) => {
            const pct = Math.min(100 - empresaPct, (p.summedRevenue / FEDERAL_LIMIT) * 100);
            const color = partnerColors[idx % partnerColors.length];
            return (
              <div
                key={p.partnerId}
                className={`h-full ${color.bg} transition-all duration-500`}
                style={{ width: `${pct}%` }}
                title={`Coligadas de ${p.partnerName}: ${formatCurrencyBRL(p.summedRevenue)}`}
              />
            );
          })}

          {/* If over limit, show red striped indicator */}
          {isOverLimit && (
            <div 
              className="h-full bg-red-600 animate-pulse"
              style={{ width: '100%' }}
              title={`Excesso: ${formatCurrencyBRL(excessAmount)}`}
            />
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] pt-1">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
              <span className="text-slate-300">Desta Empresa ({formatCurrencyBRL(currentRbt12)})</span>
            </div>

            {partnerBreakdown.map((p, idx) => {
              const color = partnerColors[idx % partnerColors.length];
              return (
                <div key={p.partnerId} className="flex items-center space-x-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${color.bg} inline-block`} />
                  <span className="text-slate-300">Coligadas {p.partnerName.split(' ')[0]} ({formatCurrencyBRL(p.summedRevenue)})</span>
                </div>
              );
            })}

            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
              <span className="text-amber-400 font-mono">Linha Sublimite: R$ 3,6M</span>
            </div>
          </div>

          <div className="text-slate-400 font-mono text-[10px]">
            Teto Legal: R$ 4.800.000,00
          </div>
        </div>
      </div>

      {/* 4 SUMMARY STAT TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
        <div className="bg-[#0B0F19] p-3.5 rounded-xl border border-slate-800">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
            Faturamento Desta PJ
          </span>
          <span className="text-sm font-bold font-mono text-white mt-1 block">
            {formatCurrencyBRL(currentRbt12)}
          </span>
          <span className="text-[10px] text-slate-500">
            {((currentRbt12 / FEDERAL_LIMIT) * 100).toFixed(1)}% do teto
          </span>
        </div>

        <div className="bg-[#0B0F19] p-3.5 rounded-xl border border-slate-800">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
            Soma das Coligadas
          </span>
          <span className="text-sm font-bold font-mono text-indigo-400 mt-1 block">
            +{formatCurrencyBRL(totalColigadasRevenue)}
          </span>
          <span className="text-[10px] text-slate-500">
            {partnerBreakdown.reduce((s, p) => s + p.coligadasCount, 0)} empresa(s) somadas
          </span>
        </div>

        <div className="bg-[#0B0F19] p-3.5 rounded-xl border border-slate-800">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
            Total Consolidado
          </span>
          <span className={`text-sm font-bold font-mono mt-1 block ${
            isOverLimit ? 'text-red-400' : 'text-emerald-400'
          }`}>
            {formatCurrencyBRL(grandTotal)}
          </span>
          <span className="text-[10px] text-slate-500">
            {percentageConsumed.toFixed(1)}% consumido
          </span>
        </div>

        <div className={`p-3.5 rounded-xl border ${
          isOverLimit 
            ? 'bg-red-950/40 border-red-500/40 text-red-300' 
            : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
        }`}>
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-80">
            {isOverLimit ? 'Excesso de Faturamento' : 'Folga Restante Segura'}
          </span>
          <span className="text-sm font-bold font-mono mt-1 block">
            {isOverLimit ? formatCurrencyBRL(excessAmount) : formatCurrencyBRL(remainingHeadroom)}
          </span>
          <span className="text-[10px] opacity-80">
            {isOverLimit ? 'Gera desenquadramento retroativo' : 'Margem livre de expansão'}
          </span>
        </div>
      </div>
    </div>
  );
};
