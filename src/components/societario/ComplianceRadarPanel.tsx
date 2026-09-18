import React, { useMemo } from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Scale, 
  FileCheck2, 
  TrendingUp, 
  Lock, 
  Zap, 
  Info,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';

export interface ComplianceMetricsProps {
  score: number;
  dreiCompliance: number;
  societarySecurity: number;
  assetProtection: number;
  taxRiskMitigation: number;
  conflictResolution: number;
  executiveEnforceability: number;
  clausesActiveCount: number;
  activeClausesTitles: string[];
  contractTypeTitle: string;
  onApplyQuickFix?: (fixId: string) => void;
}

export const ComplianceRadarPanel: React.FC<ComplianceMetricsProps> = ({
  score,
  dreiCompliance,
  societarySecurity,
  assetProtection,
  taxRiskMitigation,
  conflictResolution,
  executiveEnforceability,
  clausesActiveCount,
  activeClausesTitles,
  contractTypeTitle,
  onApplyQuickFix
}) => {
  const chartData = useMemo(() => [
    { subject: 'DREI / IN 81', value: dreiCompliance, fullMark: 100 },
    { subject: 'Segurança Societária', value: societarySecurity, fullMark: 100 },
    { subject: 'Blindagem Art. 50', value: assetProtection, fullMark: 100 },
    { subject: 'Risco Tributário', value: taxRiskMitigation, fullMark: 100 },
    { subject: 'Prevenção Litígios', value: conflictResolution, fullMark: 100 },
    { subject: 'Eficácia Executiva', value: executiveEnforceability, fullMark: 100 },
  ], [dreiCompliance, societarySecurity, assetProtection, taxRiskMitigation, conflictResolution, executiveEnforceability]);

  const scoreBadge = useMemo(() => {
    if (score >= 90) return { label: 'Blindagem Máxima Forense', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
    if (score >= 75) return { label: 'Conformidade Avançada', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' };
    if (score >= 60) return { label: 'Segurança Moderada', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
    return { label: 'Vulnerabilidade Elevada', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' };
  }, [score]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
      {/* Header do Painel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">
              Painel de Conformidade, Risco & Blindagem 360°
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Diagnóstico vetorial do documento: <span className="text-slate-300 font-medium">{contractTypeTitle}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${scoreBadge.bg} ${scoreBadge.border}`}>
            <span className="text-xs font-semibold text-slate-300">Índice Geral:</span>
            <span className={`text-lg font-black ${scoreBadge.color}`}>{score}/100</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-950/80 ${scoreBadge.color}`}>
              {scoreBadge.label}
            </span>
          </div>
        </div>
      </div>

      {/* Grid Principal: Gráfico Radar + Métricas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4 items-center">
        {/* Gráfico Radar */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 relative">
          <div className="w-full h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                <PolarGrid stroke="#334155" strokeDasharray="3 3" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} 
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  stroke="#475569" 
                  tick={{ fill: '#64748b', fontSize: 9 }} 
                />
                <Radar 
                  name="Índice de Blindagem" 
                  dataKey="value" 
                  stroke="#6366f1" 
                  fill="#6366f1" 
                  fillOpacity={0.35} 
                  strokeWidth={2}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs">
                          <p className="font-bold text-slate-200">{data.subject}</p>
                          <p className="text-indigo-400 font-semibold mt-1">Conformidade: {data.value}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute top-2 right-2 text-[10px] text-slate-500 flex items-center gap-1">
            <Info className="w-3 h-3" />
            <span>Parâmetro DREI / STJ</span>
          </div>
        </div>

        {/* 6 Eixos Detalhados */}
        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Eixo 1: DREI */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <FileCheck2 className="w-3.5 h-3.5 text-blue-400" />
                DREI / IN 81/2020
              </span>
              <span className="font-bold text-blue-400">{dreiCompliance}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${dreiCompliance}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">
              {dreiCompliance >= 90 ? 'Consolidação e cláusulas obrigatórias atendidas.' : 'Ajustar numeração e preâmbulo registral.'}
            </p>
          </div>

          {/* Eixo 2: Segurança Societária */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-indigo-400" />
                Segurança Societária
              </span>
              <span className="font-bold text-indigo-400">{societarySecurity}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${societarySecurity}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">
              {societarySecurity >= 85 ? 'Quóruns Lei 14.451/22 e cessão protegidos.' : 'Revisar quóruns de deliberação societária.'}
            </p>
          </div>

          {/* Eixo 3: Blindagem Art 50 */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-purple-400" />
                Blindagem Art. 50 CC
              </span>
              <span className="font-bold text-purple-400">{assetProtection}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className="bg-purple-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${assetProtection}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">
              {assetProtection >= 85 ? 'Barreira de autonomia da Lei 13.874/19 ativa.' : 'Inserir cláusula expressa da Lei da Liberdade Econômica.'}
            </p>
          </div>

          {/* Eixo 4: Risco Tributário */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                Risco Tributário (ITBI/IR)
              </span>
              <span className="font-bold text-amber-400">{taxRiskMitigation}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${taxRiskMitigation}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">
              {taxRiskMitigation >= 85 ? 'Tema 796 STF e distribuição desproporcional.' : 'Prever salvaguardas fiscais de integralização.'}
            </p>
          </div>

          {/* Eixo 5: Litígios & Haveres */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-rose-400" />
                Prevenção de Litígios
              </span>
              <span className="font-bold text-rose-400">{conflictResolution}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className="bg-rose-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${conflictResolution}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">
              {conflictResolution >= 85 ? 'STJ Tema 1.056 e mecanismo de desempate ativo.' : 'Risco de litígio na entrada de herdeiros/haveres.'}
            </p>
          </div>

          {/* Eixo 6: Eficácia Executiva */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Eficácia Executiva
              </span>
              <span className="font-bold text-emerald-400">{executiveEnforceability}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${executiveEnforceability}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">
              {executiveEnforceability >= 90 ? 'Art. 784, § 4º CPC (Assinatura Digital / ICP).' : 'Habilitar cláusula de título executivo extrajudicial.'}
            </p>
          </div>
        </div>
      </div>

      {/* Barra de Status das Cláusulas Blindadas Ativas */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Cláusulas Especiais Ativadas:</span>
          <span className="px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 font-bold border border-indigo-800">
            {clausesActiveCount} de 10 Selecionadas
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {activeClausesTitles.slice(0, 4).map((title, i) => (
            <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 truncate max-w-[180px]">
              {title}
            </span>
          ))}
          {activeClausesTitles.length > 4 && (
            <span className="text-[10px] text-slate-500">+{activeClausesTitles.length - 4} adicionais</span>
          )}
        </div>
      </div>
    </div>
  );
};
