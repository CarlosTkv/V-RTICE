import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Scale, 
  Calculator, 
  Layers, 
  Zap, 
  FileText, 
  Check, 
  ExternalLink,
  Percent,
  TrendingDown,
  ArrowUpRight,
  Copy
} from 'lucide-react';
import { TaxNewsItem, copyTaxNewsToClipboard } from '../utils/taxCrawlerEngine';
import { dynamicTaxRulesEngine } from '../utils/dynamicTaxRulesEngine';

interface TaxImpactRuleModalProps {
  item: TaxNewsItem | null;
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string) => void;
  onApplySuccess?: () => void;
}

export const TaxImpactRuleModal: React.FC<TaxImpactRuleModalProps> = ({
  item,
  isOpen,
  onClose,
  showToast,
  onApplySuccess,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !item) return null;

  const vs = item.visualSummary;

  const handleCopy = async () => {
    const success = await copyTaxNewsToClipboard(item);
    if (success) {
      setCopied(true);
      showToast('Notícia e parecer copiados! O link oficial já está incluso no assunto.');
      setTimeout(() => setCopied(false), 3000);
    } else {
      showToast('Erro ao copiar para a área de transferência.');
    }
  };

  const handleApplyToPlatform = () => {
    if (vs?.ruleCode) {
      const targetRule = dynamicTaxRulesEngine.getRule(vs.ruleCode);
      if (targetRule) {
        const result = dynamicTaxRulesEngine.applyRule(targetRule.id);
        showToast(result.message);
      } else {
        const globalRes = dynamicTaxRulesEngine.applyAllRulesToEntirePlatform();
        showToast(globalRes.message);
      }
    } else {
      const globalRes = dynamicTaxRulesEngine.applyAllRulesToEntirePlatform();
      showToast(globalRes.message);
    }
    if (onApplySuccess) onApplySuccess();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-4xl bg-[#0B101D] border border-blue-900/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-800 bg-[#080C16]">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                item.impactLevel === 'Crítico' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                item.impactLevel === 'Médio' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                'bg-slate-800 text-slate-300'
              }`}>
                Impacto {item.impactLevel}
              </span>
              <span className="text-xs font-mono text-slate-400">{item.date}</span>
              {item.officialDocNumber && (
                <span className="text-xs font-mono text-cyan-400 font-semibold bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/50">
                  {item.officialDocNumber}
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
              {item.title}
            </h2>
            <p className="text-xs text-slate-400">
              Fonte Oficial: <strong className="text-slate-200">{item.source}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                  : 'bg-indigo-950/70 hover:bg-indigo-600 text-indigo-200 hover:text-white border-indigo-700/60'
              }`}
              title="Copiar Parecer e Notícia com Link Oficial no Assunto"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Copiado com Link!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Copiar com Link</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Corpo com o Resumo Visual de Impacto */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200 text-xs">
          
          {/* Card de Síntese Executiva */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 via-[#0E1629] to-indigo-950/40 border border-blue-900/60 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Síntese Executiva da Atualização</span>
            </div>
            <p className="text-sm text-white font-medium leading-relaxed">
              {vs?.whatChanged || item.summary}
            </p>
            {vs?.impactOnCalculations && (
              <p className="text-xs text-slate-300 pt-1 border-t border-blue-900/40">
                <strong className="text-cyan-300">Reflexo nos Cálculos: </strong>
                {vs.impactOnCalculations}
              </p>
            )}
          </div>

          {/* Quadro Comparativo Antes vs Depois (Fórmulas e Entendimento) */}
          {vs?.beforeVsAfter && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <Scale className="w-4 h-4 text-amber-400" />
                <span>Quadro Comparativo: Entendimento & Fórmulas</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Antes */}
                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-2">
                  <div className="flex items-center justify-between text-rose-400 font-bold text-xs">
                    <span>Regra / Entendimento Anterior</span>
                    <span className="text-[10px] px-2 py-0.5 bg-rose-950 rounded border border-rose-800">Revogada / Superada</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {vs.beforeVsAfter.beforeText}
                  </p>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-rose-950/60 font-mono text-[11px] text-rose-300">
                    <div className="text-[9px] text-slate-500 font-sans uppercase mb-1">Fórmula Anterior:</div>
                    <code>{vs.beforeVsAfter.formulaBefore}</code>
                  </div>
                </div>

                {/* Depois */}
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40 space-y-2">
                  <div className="flex items-center justify-between text-emerald-400 font-bold text-xs">
                    <span>Nova Regra / Nova Fórmula Aplicada</span>
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-950 rounded border border-emerald-800 text-emerald-300 font-bold">Vigente no Vértice</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    {vs.beforeVsAfter.afterText}
                  </p>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-emerald-950/60 font-mono text-[11px] text-emerald-300">
                    <div className="text-[9px] text-slate-500 font-sans uppercase mb-1">Nova Fórmula Recalibrada:</div>
                    <code>{vs.beforeVsAfter.formulaAfter}</code>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tabela de Alíquotas e Parâmetros Alterados */}
          {vs?.rateChanges && vs.rateChanges.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <Percent className="w-4 h-4 text-cyan-400" />
                <span>Alíquotas e Parâmetros Numéricos Atualizados</span>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#080C16] border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="px-4 py-2.5">Parâmetro Fiscal</th>
                      <th className="px-4 py-2.5">Valor Anterior</th>
                      <th className="px-4 py-2.5">Novo Valor Aplicado</th>
                      <th className="px-4 py-2.5">Variação / Impacto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {vs.rateChanges.map((rate, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/50">
                        <td className="px-4 py-2.5 font-semibold text-white">{rate.parameter}</td>
                        <td className="px-4 py-2.5 text-slate-400 font-mono line-through">{rate.oldRate}</td>
                        <td className="px-4 py-2.5 text-emerald-400 font-mono font-bold">{rate.newRate}</td>
                        <td className="px-4 py-2.5 text-cyan-300 font-mono">{rate.variation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Módulos do Sistema Atualizados */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Módulos Recalibrados no Sistema Vértice</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {item.applicableModules.map((mod, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-lg bg-blue-950/50 border border-blue-800/60 text-blue-300 text-xs font-semibold flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{mod}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Ação Sistêmica */}
          {vs?.systemActionTaken && (
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-slate-300">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span><strong className="text-white">Ação Sistêmica: </strong>{vs.systemActionTaken}</span>
              </div>
            </div>
          )}

        </div>

        {/* Footer com Botões de Ação */}
        <div className="px-6 py-3.5 bg-[#080C16] border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {item.sourceUrl && (
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition flex items-center gap-1.5 border border-slate-800"
              >
                <span>Consultar no Portal Oficial</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
              </a>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                  : 'bg-indigo-950/70 hover:bg-indigo-600 text-indigo-200 hover:text-white border-indigo-700/60'
              }`}
              title="Copiar Parecer e Notícia com Link Oficial no Assunto"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Copiado com Link!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Copiar Notícia (c/ Link)</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
            >
              Fechar
            </button>

            <button
              onClick={handleApplyToPlatform}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg hover:scale-105"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Aplicar Atualização a Toda a Plataforma</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
