import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  ShieldCheck, 
  AlertTriangle, 
  Scale, 
  Award, 
  CheckCircle2, 
  ExternalLink,
  QrCode,
  Zap,
  ArrowRight
} from 'lucide-react';
import { AuditResultData, AuditIssue } from '../../utils/juridicoAuditorEngine';
import { ExecutiveDocumentViewer } from '../ExecutiveDocumentViewer';

interface FormalLegalOpinionReportProps {
  auditData: AuditResultData;
  companyName: string;
  cnpj?: string;
  onApplyQuickFix?: (issue: AuditIssue) => void;
  onAuditClick?: () => void;
}

export const FormalLegalOpinionReport: React.FC<FormalLegalOpinionReportProps> = ({
  auditData,
  companyName,
  cnpj = '00.000.000/0001-00',
  onApplyQuickFix,
  onAuditClick
}) => {
  const signatories = [
    {
      name: companyName,
      role: 'Sociedade Auditada / Administrador',
      cpfCnpj: cnpj,
      signatureType: 'Assinatura Eletrônica Qualificada' as const
    },
    {
      name: 'Vértice Legal Lab & Auditoria Forense',
      role: 'Auditor Forense Especialista & Consultoria Societária',
      cpfCnpj: '00.000.000/0001-99',
      rgOabCrc: 'OAB/SP • CRC/SP • Auditoria 360°',
      signatureType: 'ICP-Brasil' as const
    }
  ];

  return (
    <ExecutiveDocumentViewer
      documentTitle={`PARECER TÉCNICO-JURÍDICO & AUDITORIA FORENSE SOCIETÁRIA`}
      documentCategory="PARECER TÉCNICO-JURÍDICO"
      normativeBase="Auditoria de higidez e blindagem do instrumento societário perante o Código Civil (Lei 10.406/02), Instruções Normativas do DREI (IN 81/2020), Lei da Liberdade Econômica (Lei 13.874/19), Lei nº 14.451/22 e Jurisprudência Vinculante do STF (Tema 796) e STJ (Tema 1.056)."
      companyName={companyName}
      cnpj={cnpj}
      documentScore={auditData.score}
      documentRating={auditData.rating.toUpperCase()}
      signatories={signatories}
      onAuditClick={onAuditClick}
    >
      <div className="space-y-8 font-sans">
        {/* Metadados da Auditoria */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div>
            <span className="text-slate-500 block uppercase font-bold text-[10px]">Sociedade Auditada:</span>
            <span className="font-bold text-slate-200">{companyName}</span>
          </div>
          <div>
            <span className="text-slate-500 block uppercase font-bold text-[10px]">Instrumento / Modelo:</span>
            <span className="font-bold text-slate-200">{auditData.modelTitle}</span>
          </div>
          <div>
            <span className="text-slate-500 block uppercase font-bold text-[10px]">Classificação de Segurança:</span>
            <span className={`font-black ${
              auditData.score >= 80 ? 'text-emerald-400' : auditData.score >= 60 ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {auditData.score}/100 • {auditData.rating.toUpperCase()}
            </span>
          </div>
        </div>

        {/* 1. Diagnóstico dos 8 Eixos de Higidez Forense */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide border-b border-slate-800 pb-2 flex items-center justify-between">
            <span>1. Diagnóstico dos 8 Eixos de Higidez Forense</span>
            <span className="text-xs text-amber-400 font-mono font-normal">Conformidade DREI/STJ</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {auditData.pillars.map((pillar) => (
              <div key={pillar.id} className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{pillar.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    pillar.status === 'conforme' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    pillar.status === 'ajuste_necessario' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                    'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}>
                    {pillar.score}/{pillar.maxScore} pts
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">{pillar.diagnostic}</p>
                <div className="text-[10px] text-slate-500 font-mono">
                  Ref: {pillar.legalRef}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Apontamentos Críticos & Correções Recomendadas */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">
              2. Apontamentos Críticos & Correções Recomendadas ({auditData.issues.length})
            </h3>
            <span className="text-xs text-indigo-400 font-mono font-bold">Jurisprudência Vinculante</span>
          </div>

          {auditData.issues.length > 0 ? (
            <div className="space-y-3">
              {auditData.issues.map((issue, idx) => (
                <div key={issue.id} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100">{idx + 1}. {issue.title}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          issue.severity === 'Crítico' ? 'bg-rose-950 text-rose-400' :
                          issue.severity === 'Alto' ? 'bg-amber-950 text-amber-400' :
                          'bg-blue-950 text-blue-400'
                        }`}>
                          {issue.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        <span className="text-slate-300 font-semibold">Risco Prático:</span> {issue.practicalRisk}
                      </p>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Base Legal: {issue.legalBase}
                      </div>
                    </div>

                    {onApplyQuickFix && (
                      <button
                        type="button"
                        onClick={() => onApplyQuickFix(issue)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center gap-1 transition shrink-0 cursor-pointer shadow-md"
                      >
                        <Zap className="w-3 h-3" />
                        <span>Aplicar Correção</span>
                      </button>
                    )}
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300">
                    <span className="text-slate-400 block mb-1">Cláusula Sugerida: <strong>{issue.clauseFixTitle}</strong></span>
                    {issue.clauseFix.substring(0, 220)}...
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs text-center font-bold">
              ✓ Nenhuma vulnerabilidade jurídica detectada. Documento com 100% de blindagem forense.
            </div>
          )}
        </div>

        {/* 3. Conclusão Final do Auditor */}
        <div className="space-y-2 text-xs text-slate-300 leading-relaxed border-t border-slate-800 pt-4">
          <h4 className="font-bold text-slate-100 uppercase text-xs">3. Conclusão Final do Auditor:</h4>
          <p>
            Em face das análises técnicas e dos confrontos normativos retroexpostos, o presente instrumento contratual atinge nota de segurança de <strong>{auditData.score}/100</strong>. Com a inserção das salvaguardas recomendadas, o documento confere plena segurança jurídica contra execuções patrimoniais indevidas, previne litígios sucessórios e atende a 100% das exigências da Junta Comercial (DREI).
          </p>
        </div>
      </div>
    </ExecutiveDocumentViewer>
  );
};
