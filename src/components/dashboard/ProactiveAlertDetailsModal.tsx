import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  AlertTriangle, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  BookOpen, 
  Calculator, 
  DollarSign, 
  ArrowRight, 
  FileCheck2,
  TrendingUp,
  Percent,
  Layers,
  Scale,
  ShieldCheck,
  Mail,
  Send,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CompanyData, CalculationResult } from '../../types';
import { ProactiveAlert } from '../../utils/proactiveAlertsEngine';
import { formatCurrencyBRL } from '../../utils/taxRules';
import { sendCNDPredictiveAlertEmail } from '../../utils/emailService';

interface ProactiveAlertDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: ProactiveAlert | null;
  company: CompanyData;
  calculation: CalculationResult;
  onApplyPayrollAdjustment?: (additionalMonthly: number) => void;
  onMarkObligationDelivered?: (obligationId: string) => void;
  onNavigateToTab?: (tab: any) => void;
  onOpenCndRadar?: () => void;
  onOpenCndScheduler?: () => void;
  showToast?: (msg: string) => void;
}

export const ProactiveAlertDetailsModal: React.FC<ProactiveAlertDetailsModalProps> = ({
  isOpen,
  onClose,
  alert,
  company,
  calculation,
  onApplyPayrollAdjustment,
  onMarkObligationDelivered,
  onNavigateToTab,
  onOpenCndRadar,
  onOpenCndScheduler,
  showToast
}) => {
  // Simulator state for Fator R adjustment
  const initialSimAdd = alert?.suggestedMonthlyAdjustment || (alert?.fatorRTarget && alert.fatorRCurrent ? Math.ceil((company.rbt12 * 0.2805 - company.payroll12m) / 12) : 0);
  const [simMonthlyAdd, setSimMonthlyAdd] = useState<number>(Math.max(0, initialSimAdd));
  const [activeSubTab, setActiveSubTab] = useState<'diagnosis' | 'simulation' | 'legal'>('diagnosis');
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [isEmailSent, setIsEmailSent] = useState<boolean>(false);

  if (!isOpen || !alert) return null;

  const handleSendEmailNow = async () => {
    if (!alert) return;
    setIsSendingEmail(true);
    try {
      const clientEmail = alert.clientEmail || company.responsibleEmail || company.email || 'fiscal@empresa.com.br';
      const isStatusChange = alert.cndPreviousStatus && alert.cndCurrentStatus && alert.cndPreviousStatus !== alert.cndCurrentStatus;
      
      await sendCNDPredictiveAlertEmail({
        recipientEmail: clientEmail,
        recipientName: company.responsibleName || company.name,
        companyName: company.name,
        companyCnpj: company.cnpj,
        finding: {
          id: alert.id,
          companyId: company.id || company.cnpj,
          companyName: company.name,
          companyCnpj: company.cnpj,
          clientEmail,
          sphere: (alert.cndSphere as any) || 'estadual',
          cndTitle: alert.title,
          organ: alert.cndOrgan || 'Fazenda Pública',
          previousStatus: (alert.cndPreviousStatus as any) || 'NEGATIVA',
          currentStatus: (alert.cndCurrentStatus as any) || 'POSITIVA',
          isImminentExpiry: (alert.daysRemaining !== undefined && alert.daysRemaining <= 7),
          daysRemaining: alert.daysRemaining ?? 0,
          expiryDate: alert.dueDate || 'Imediato',
          riskType: isStatusChange ? 'status_degradation' : 'imminent_expiry',
          riskSeverity: alert.severity === 'critical' ? 'CRITICAL' : 'HIGH',
          summary: alert.description,
          technicalDetails: `Varredura preditiva sentinela Vértice detectou evento crítico em ${new Date().toLocaleDateString('pt-BR')}.`,
          preventiveRecommendation: 'Regularização tempestiva para evitar exclusão do Simples Nacional.',
          legalImpact: alert.legalBasis,
          detectedAt: new Date().toLocaleString('pt-BR')
        }
      });

      setIsEmailSent(true);
      if (showToast) showToast(`Alerta preditivo disparado por e-mail para ${clientEmail}!`);
    } catch (e) {
      console.error(e);
      if (showToast) showToast('Erro ao disparar e-mail.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const rbt12 = Math.max(1, company.rbt12);
  const currentPayroll = company.payroll12m || 0;
  const simulatedPayroll12m = currentPayroll + (simMonthlyAdd * 12);
  const simulatedFatorR = (simulatedPayroll12m / rbt12) * 100;
  const isSimAnexo3 = simulatedFatorR >= 28.0;

  // Carga tributária Anexo V (~18%) vs Anexo III (~10.5%)
  const simTaxAnexo5 = rbt12 * 0.180;
  const simTaxAnexo3 = rbt12 * 0.105;
  const simGrossSavings = Math.max(0, simTaxAnexo5 - simTaxAnexo3);
  const simInssCost = (simMonthlyAdd * 12) * 0.18;
  const simNetSavings = isSimAnexo3 ? Math.max(0, simGrossSavings - simInssCost) : 0;

  const handleApplyAdjustment = () => {
    if (onApplyPayrollAdjustment) {
      onApplyPayrollAdjustment(simMonthlyAdd);
      if (showToast) showToast(`Pró-labore ajustado em +${formatCurrencyBRL(simMonthlyAdd)}/mês com sucesso!`);
      onClose();
    }
  };

  const handleMarkDelivered = () => {
    if (alert.obligationId && onMarkObligationDelivered) {
      onMarkObligationDelivered(alert.obligationId);
      if (showToast) showToast(`Obrigação ${alert.title.split(':')[1] || alert.title} marcada como entregue!`);
      onClose();
    }
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          badge: 'bg-rose-500/10 text-rose-400 border border-rose-500/30',
          border: 'border-rose-500/40',
          icon: <ShieldAlert className="w-5 h-5 text-rose-400" />,
          titleColor: 'text-rose-300'
        };
      case 'warning':
        return {
          badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
          border: 'border-amber-500/40',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
          titleColor: 'text-amber-300'
        };
      case 'opportunity':
        return {
          badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
          border: 'border-emerald-500/40',
          icon: <Sparkles className="w-5 h-5 text-emerald-400" />,
          titleColor: 'text-emerald-300'
        };
      default:
        return {
          badge: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
          border: 'border-blue-500/40',
          icon: <Clock className="w-5 h-5 text-blue-400" />,
          titleColor: 'text-blue-300'
        };
    }
  };

  const style = getSeverityStyle(alert.severity);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#0B0F19] border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col my-auto"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#0F172A] border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className={`p-2.5 rounded-2xl ${style.badge} shrink-0 mt-0.5`}>
              {style.icon}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider ${style.badge}`}>
                  {alert.severity === 'critical' ? 'Alerta Crítico' : alert.severity === 'warning' ? 'Atenção Requerida' : alert.severity === 'opportunity' ? 'Oportunidade Fiscal' : 'Informativo'}
                </span>
                {alert.impactBadge && (
                  <span className="text-[10px] font-medium text-slate-300">
                    {alert.impactBadge}
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-black text-white leading-snug">
                {alert.title}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {alert.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-slate-800 bg-[#0F172A]/50 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('diagnosis')}
            className={`py-3 px-3 border-b-2 transition flex items-center gap-1.5 ${
              activeSubTab === 'diagnosis' 
                ? 'border-blue-500 text-blue-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Diagnóstico & Impacto</span>
          </button>

          {alert.category === 'fator_r' && (
            <button
              onClick={() => setActiveSubTab('simulation')}
              className={`py-3 px-3 border-b-2 transition flex items-center gap-1.5 ${
                activeSubTab === 'simulation' 
                  ? 'border-blue-500 text-blue-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Simulador Preventivo 360°</span>
            </button>
          )}

          <button
            onClick={() => setActiveSubTab('legal')}
            className={`py-3 px-3 border-b-2 transition flex items-center gap-1.5 ${
              activeSubTab === 'legal' 
                ? 'border-blue-500 text-blue-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Fundamentação Legal</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[60vh] text-slate-300 text-xs leading-relaxed">
          {activeSubTab === 'diagnosis' && (
            <div className="space-y-4">
              {/* Context Description */}
              <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Análise Técnica do Fisco
                </div>
                <p className="text-slate-200 text-xs sm:text-sm">
                  {alert.description}
                </p>
              </div>

              {/* Data Grid for Company Context */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#0F172A] p-3 rounded-xl border border-slate-800/80">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">RBT12 Acumulada</div>
                  <div className="text-xs sm:text-sm font-black text-white mt-0.5">
                    {formatCurrencyBRL(rbt12)}
                  </div>
                </div>

                <div className="bg-[#0F172A] p-3 rounded-xl border border-slate-800/80">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Folha 12m Declarada</div>
                  <div className="text-xs sm:text-sm font-black text-blue-400 mt-0.5">
                    {formatCurrencyBRL(company.payroll12m || 0)}
                  </div>
                </div>

                <div className="bg-[#0F172A] p-3 rounded-xl border border-slate-800/80">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Fator R Atual</div>
                  <div className={`text-xs sm:text-sm font-black mt-0.5 ${((company.payroll12m || 0) / rbt12 * 100) >= 28 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {((company.payroll12m || 0) / rbt12 * 100).toFixed(2)}%
                  </div>
                </div>

                <div className="bg-[#0F172A] p-3 rounded-xl border border-slate-800/80">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Enquadramento</div>
                  <div className="text-xs sm:text-sm font-black text-white mt-0.5">
                    Anexo {company.anexo || 'III'}
                  </div>
                </div>
              </div>

              {/* Obligation Specific or Fator R Specific Highlight */}
              {alert.category === 'tax_deadline' && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-xs">Vencimento em Calendário Fiscal:</span>
                    <span className="text-xs text-amber-300">
                      Data limite de entrega: <strong>{alert.dueDate}</strong>. Após esta data, incidem multas automáticas pela Receita Federal e perda do prazo legal de parcelamento simplificado.
                    </span>
                  </div>
                </div>
              )}

              {alert.category === 'fator_r' && alert.suggestedMonthlyAdjustment && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-xs">Ajuste Recomendado de Pró-labore:</span>
                    <span className="text-xs text-emerald-300">
                      Recomenda-se adicionar <strong>{formatCurrencyBRL(Math.abs(alert.suggestedMonthlyAdjustment))}/mês</strong> em folha/pró-labore para garantir com folga a alíquota inicial reduzida de 6% do Anexo III.
                    </span>
                  </div>
                </div>
              )}

              {/* CND Compliance Specific Highlight */}
              {alert.category === 'cnd_compliance' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 text-purple-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-purple-400" />
                        <span className="font-bold text-xs uppercase tracking-wider text-purple-200">
                          Monitoramento Sentinela de CND ({alert.cndOrgan || 'Órgão Fazendário'})
                        </span>
                      </div>
                      {alert.cndPreviousStatus && alert.cndCurrentStatus && (
                        <div className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/30 text-purple-300">
                          <span>{alert.cndPreviousStatus}</span>
                          <span>➔</span>
                          <span className="text-rose-400">{alert.cndCurrentStatus}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      A camada preditiva identificou que a certidão da empresa necessita de intervenção urgente. 
                      A constatação de débitos impeditivos ou perda de validade expõe a empresa à <strong>exclusão de ofício do Simples Nacional</strong> (LC 123/06, art. 17, V) e impede a contratação com o poder público.
                    </p>

                    {/* Email Dispatch Action Inside Modal */}
                    <div className="pt-3 border-t border-purple-800/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                        <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Destinatário: <strong className="text-white">{alert.clientEmail || company.responsibleEmail || company.email || 'fiscal@empresa.com.br'}</strong></span>
                      </div>

                      <button
                        onClick={handleSendEmailNow}
                        disabled={isSendingEmail || isEmailSent}
                        className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer ${
                          isEmailSent
                            ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 cursor-default'
                            : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
                        }`}
                      >
                        {isSendingEmail ? (
                          <Clock className="w-3.5 h-3.5 animate-spin" />
                        ) : isEmailSent ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        <span>{isEmailSent ? 'E-mail Enviado com Sucesso!' : 'Disparar E-mail ao Cliente'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'simulation' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white uppercase tracking-wider">Acréscimo de Pró-Labore / Folha Mensal:</span>
                  <span className="text-emerald-400 font-mono font-bold text-sm">+{formatCurrencyBRL(simMonthlyAdd)}/mês</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.max(10000, Math.ceil(rbt12 * 0.05))}
                  step="250"
                  value={simMonthlyAdd}
                  onChange={(e) => setSimMonthlyAdd(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>R$ 0</span>
                  <span>R$ {formatCurrencyBRL(Math.max(10000, Math.ceil(rbt12 * 0.05)))}</span>
                </div>
              </div>

              {/* Results Comparison Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#0F172A] p-3.5 rounded-2xl border border-slate-800 text-center">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Fator R Projetado</div>
                  <div className={`text-xl font-black mt-1 ${isSimAnexo3 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {simulatedFatorR.toFixed(2)}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {isSimAnexo3 ? '✅ Anexo III (6,0%)' : '❌ Anexo V (15,5%)'}
                  </div>
                </div>

                <div className="bg-[#0F172A] p-3.5 rounded-2xl border border-slate-800 text-center">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Economia Bruta DAS</div>
                  <div className="text-xl font-black text-blue-400 mt-1">
                    {formatCurrencyBRL(simGrossSavings)}/ano
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Redução de DAS
                  </div>
                </div>

                <div className="bg-[#0F172A] p-3.5 rounded-2xl border border-slate-800 text-center">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Ganho Líquido Real</div>
                  <div className="text-xl font-black text-emerald-400 mt-1">
                    {formatCurrencyBRL(simNetSavings)}/ano
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Descontado INSS PF
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'legal' && (
            <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-3 text-xs leading-relaxed">
              <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase text-[11px]">
                <Scale className="w-4 h-4" />
                <span>Base Legal & Normativa Vigente</span>
              </div>
              <p className="text-slate-300">
                {alert.legalBasis}
              </p>
              <div className="pt-2 border-t border-slate-800 text-slate-400 text-[11px] space-y-2">
                <p>
                  • <strong>Lei Complementar nº 123/2006 (Estatuto Nacional da ME e EPP)</strong>: Estabelece a apuração do Fator R sobre a folha dos últimos 12 meses anteriores ao período de apuração.
                </p>
                <p>
                  • <strong>Resolução CGSN nº 140/2018</strong>: Disciplina a segregação de receitas e multas por atraso ou omissão de declarações no PGDAS-D.
                </p>
                <p>
                  • <strong>Instrução Normativa RFB nº 2005/2021</strong>: Regulamenta a DCTFWeb, eSocial e EFD-Reinf com penalidades de confissão de dívida.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-5 sm:p-6 bg-[#0F172A] border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
          >
            Fechar
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {alert.category === 'tax_deadline' && alert.obligationId && onMarkObligationDelivered && (
              <button
                onClick={handleMarkDelivered}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Marcar como Entregue</span>
              </button>
            )}

            {alert.category === 'cnd_compliance' && (
              <>
                <button
                  onClick={handleSendEmailNow}
                  disabled={isSendingEmail || isEmailSent}
                  className={`px-4 py-2.5 rounded-xl text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md cursor-pointer ${
                    isEmailSent
                      ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500'
                  }`}
                >
                  {isSendingEmail ? (
                    <Clock className="w-4 h-4 animate-spin" />
                  ) : isEmailSent ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Mail className="w-4 h-4" />
                  )}
                  <span>{isEmailSent ? 'Alerta por E-mail Despachado' : 'Disparar E-mail ao Cliente'}</span>
                </button>

                <button
                  onClick={() => {
                    if (onOpenCndScheduler) onOpenCndScheduler();
                    else if (onOpenCndRadar) onOpenCndRadar();
                    else if (onNavigateToTab) onNavigateToTab('agenda_fiscal' as any);
                    onClose();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Auditar CND no Radar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {alert.category === 'fator_r' && onApplyPayrollAdjustment && (
              <button
                onClick={handleApplyAdjustment}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Aplicar Ajuste (+{formatCurrencyBRL(simMonthlyAdd)}/mês)</span>
              </button>
            )}

            {onNavigateToTab && alert.category === 'fator_r' && (
              <button
                onClick={() => {
                  onNavigateToTab('fator_r' as any);
                  onClose();
                }}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <span>Abrir Módulo Fator R</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {onNavigateToTab && alert.category === 'tax_deadline' && (
              <button
                onClick={() => {
                  onNavigateToTab('regimes' as any);
                  onClose();
                }}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <span>Agenda Fiscal Completa</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
