import React, { useState, useMemo, useEffect } from 'react';
import { 
  Bell, 
  ShieldAlert, 
  AlertTriangle, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  ArrowRight, 
  Calculator, 
  RotateCcw, 
  Eye, 
  Check, 
  Filter, 
  FileText, 
  TrendingUp, 
  Info,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Mail,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CompanyData, CalculationResult } from '../../types';
import { 
  generateProactiveAlerts, 
  ProactiveAlert, 
  AlertCategory, 
  AlertSeverity 
} from '../../utils/proactiveAlertsEngine';
import { formatCurrencyBRL } from '../../utils/taxRules';
import { sendCNDPredictiveAlertEmail } from '../../utils/emailService';
import { ProactiveAlertDetailsModal } from './ProactiveAlertDetailsModal';

interface DashboardProactiveAlertsProps {
  company: CompanyData;
  onChangeCompany: (company: CompanyData) => void;
  calculation: CalculationResult;
  onNavigateToTab: (tab: any) => void;
  onOpenCndRadar?: () => void;
  onOpenCndScheduler?: () => void;
  showToast?: (msg: string) => void;
  isCompact?: boolean;
}

export const DashboardProactiveAlerts: React.FC<DashboardProactiveAlertsProps> = ({
  company,
  onChangeCompany,
  calculation,
  onNavigateToTab,
  onOpenCndRadar,
  onOpenCndScheduler,
  showToast,
  isCompact = false
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'tax_deadline' | 'fator_r' | 'sublimit' | 'cnd_compliance'>('all');
  const [selectedAlertForModal, setSelectedAlertForModal] = useState<ProactiveAlert | null>(null);
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const [sentEmailIds, setSentEmailIds] = useState<string[]>([]);

  // Local storage synchronized obligation status
  const [localObligationStatus, setLocalObligationStatus] = useState<Record<string, 'Pendente' | 'Entregue' | 'Atrasado'>>(() => {
    try {
      const saved = localStorage.getItem('vertice_agenda_status_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed[company.cnpj || 'geral'] || {};
      }
    } catch {
      // ignore
    }
    return {};
  });

  // Re-read storage if company changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vertice_agenda_status_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        setLocalObligationStatus(parsed[company.cnpj || 'geral'] || {});
      }
    } catch {
      // ignore
    }
  }, [company.cnpj]);

  // Compute alerts through proactive engine
  const alertSummary = useMemo(() => {
    return generateProactiveAlerts(company, calculation, localObligationStatus);
  }, [company, calculation, localObligationStatus]);

  // Filter out dismissed alerts
  const visibleAlerts = useMemo(() => {
    return alertSummary.alerts.filter(alert => {
      if (dismissedAlertIds.includes(alert.id)) return false;
      if (activeFilter === 'all') return true;
      if (activeFilter === 'critical') return alert.severity === 'critical';
      if (activeFilter === 'tax_deadline') return alert.category === 'tax_deadline';
      if (activeFilter === 'fator_r') return alert.category === 'fator_r';
      if (activeFilter === 'sublimit') return alert.category === 'sublimit';
      if (activeFilter === 'cnd_compliance') return alert.category === 'cnd_compliance';
      return true;
    });
  }, [alertSummary.alerts, activeFilter, dismissedAlertIds]);

  const handleMarkDelivered = (obligationId: string) => {
    const nextStatus: Record<string, 'Pendente' | 'Entregue' | 'Atrasado'> = {
      ...localObligationStatus,
      [obligationId]: 'Entregue'
    };
    setLocalObligationStatus(nextStatus);

    try {
      const saved = localStorage.getItem('vertice_agenda_status_v2');
      const allCompanies = saved ? JSON.parse(saved) : {};
      allCompanies[company.cnpj || 'geral'] = nextStatus;
      localStorage.setItem('vertice_agenda_status_v2', JSON.stringify(allCompanies));
    } catch (e) {
      console.warn('Erro ao salvar status de obrigação:', e);
    }

    if (showToast) {
      showToast('Obrigação confirmada como entregue com sucesso!');
    }
  };

  const handleApplyPayrollAdjustment = (additionalMonthly: number) => {
    const currentPayroll = company.payroll12m || 0;
    const newPayroll12m = currentPayroll + (additionalMonthly * 12);
    const newMonthlyPayroll = (company.monthlyPayroll || 0) + additionalMonthly;

    onChangeCompany({
      ...company,
      payroll12m: newPayroll12m,
      monthlyPayroll: newMonthlyPayroll,
      proLaboreMonthly: (company.proLaboreMonthly || 0) + additionalMonthly,
      hasProLabore: true,
      anexo: 'III' // Qualifica para Anexo III
    });

    if (showToast) {
      showToast(`Pró-labore ampliado em +${formatCurrencyBRL(additionalMonthly)}/mês. Fator R recalibrado!`);
    }
  };

  const handleDispatchCndEmailAlert = async (alert: ProactiveAlert, e: React.MouseEvent) => {
    e.stopPropagation();
    setSendingEmailId(alert.id);
    try {
      const clientEmail = alert.clientEmail || company.responsibleEmail || company.email || 'fiscal@empresa.com.br';
      const isStatusChange = alert.cndPreviousStatus && alert.cndCurrentStatus && alert.cndPreviousStatus !== alert.cndCurrentStatus;
      
      const res = await sendCNDPredictiveAlertEmail({
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
          organ: alert.cndOrgan || 'Órgão Fazendário',
          previousStatus: (alert.cndPreviousStatus as any) || 'NEGATIVA',
          currentStatus: (alert.cndCurrentStatus as any) || 'POSITIVA',
          isImminentExpiry: (alert.daysRemaining !== undefined && alert.daysRemaining <= 7),
          daysRemaining: alert.daysRemaining ?? 0,
          expiryDate: alert.dueDate || 'Imediato',
          riskType: isStatusChange ? 'status_degradation' : 'imminent_expiry',
          riskSeverity: alert.severity === 'critical' ? 'CRITICAL' : 'HIGH',
          summary: alert.description,
          technicalDetails: `Varredura preditiva sentinela Vértice detectou apontamento fiscal no cadastro de ${company.name} em ${new Date().toLocaleDateString('pt-BR')}.`,
          preventiveRecommendation: 'Regularização tempestiva para resguardar o enquadramento no Simples Nacional e certidões ativas.',
          legalImpact: alert.legalBasis,
          detectedAt: new Date().toLocaleString('pt-BR')
        }
      });

      setSentEmailIds(prev => [...prev, alert.id]);
      showToast?.(`Alerta de CND enviado com sucesso para ${clientEmail}!`);
    } catch (err) {
      console.error(err);
      showToast?.('Erro ao enviar e-mail de alerta.');
    } finally {
      setSendingEmailId(null);
    }
  };

  const handleDismissAlert = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedAlertIds(prev => [...prev, id]);
    if (showToast) showToast('Alerta arquivado.');
  };

  const getSeverityBadge = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/30 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            Crítico
          </span>
        );
      case 'warning':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Atenção
          </span>
        );
      case 'opportunity':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30 uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            Oportunidade
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/30 uppercase tracking-wider">
            <Info className="w-3 h-3 text-blue-400" />
            Informativo
          </span>
        );
    }
  };

  if (alertSummary.totalAlerts === 0) {
    return (
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Todas as Obrigações e Fator R em Conformidade</h4>
            <p className="text-xs text-slate-400">Nenhum vencimento crítico pendente ou inconsistência no histórico detectada.</p>
          </div>
        </div>
        <button
          onClick={() => onNavigateToTab('regimes' as any)}
          className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
        >
          <span>Ver Agenda</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden space-y-5">
      {/* Glow background accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                Central de Alertas Proativos & Compliance
              </h3>
              {alertSummary.criticalCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-mono font-bold animate-pulse">
                  {alertSummary.criticalCount} {alertSummary.criticalCount === 1 ? 'crítico' : 'críticos'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Monitoramento automatizado de prazos tributários e consistência do Fator R com dados importados
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            title={isExpanded ? 'Recolher Painel de Alertas' : 'Expandir Painel de Alertas'}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                <span className="hidden sm:inline">Recolher</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                <span className="hidden sm:inline">Expandir ({visibleAlerts.length})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Body (Expandable) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 relative z-10"
          >
            {/* Interactive Filter Bar */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#0B0F19] rounded-2xl border border-slate-800/80">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                  activeFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Todos</span>
                <span className="px-1.5 py-0.2 rounded-md bg-black/30 text-[10px] font-mono">
                  {alertSummary.totalAlerts}
                </span>
              </button>

              {alertSummary.criticalCount > 0 && (
                <button
                  onClick={() => setActiveFilter('critical')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                    activeFilter === 'critical'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-rose-400 hover:text-rose-300'
                  }`}
                >
                  <span>Críticos</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-black/30 text-[10px] font-mono">
                    {alertSummary.criticalCount}
                  </span>
                </button>
              )}

              <button
                onClick={() => setActiveFilter('tax_deadline')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                  activeFilter === 'tax_deadline'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-amber-400 hover:text-amber-300'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Obrigações Tributárias</span>
                <span className="px-1.5 py-0.2 rounded-md bg-black/30 text-[10px] font-mono">
                  {alertSummary.obligationsPendingCount}
                </span>
              </button>

              <button
                onClick={() => setActiveFilter('fator_r')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                  activeFilter === 'fator_r'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-indigo-400 hover:text-indigo-300'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Auditoria Fator R</span>
                <span className="px-1.5 py-0.2 rounded-md bg-black/30 text-[10px] font-mono">
                  {alertSummary.fatorRAlertsCount}
                </span>
              </button>

              {alertSummary.cndAlertsCount > 0 && (
                <button
                  onClick={() => setActiveFilter('cnd_compliance')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                    activeFilter === 'cnd_compliance'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-purple-400 hover:text-purple-300'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>CNDs & Débitos ({alertSummary.cndAlertsCount})</span>
                </button>
              )}
            </div>

            {/* Alerts List */}
            <div className="grid grid-cols-1 gap-3">
              {visibleAlerts.map(alert => {
                const isCritical = alert.severity === 'critical';
                const isOpportunity = alert.severity === 'opportunity';
                const isWarning = alert.severity === 'warning';
                const isCnd = alert.category === 'cnd_compliance';

                return (
                  <motion.div
                    key={alert.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`p-4 rounded-2xl border transition-all relative overflow-hidden group ${
                      isCritical
                        ? 'bg-rose-950/20 border-rose-800/60 hover:border-rose-600'
                        : isOpportunity
                        ? 'bg-emerald-950/20 border-emerald-800/60 hover:border-emerald-600'
                        : isCnd
                        ? 'bg-purple-950/20 border-purple-800/60 hover:border-purple-600'
                        : isWarning
                        ? 'bg-amber-950/20 border-amber-800/60 hover:border-amber-600'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left info column */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {getSeverityBadge(alert.severity)}
                          
                          {alert.impactBadge && (
                            <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                              {alert.impactBadge}
                            </span>
                          )}

                          {alert.dueDate && (
                            <span className="text-[11px] text-slate-400 font-mono">
                              · Limite: {alert.dueDate}
                            </span>
                          )}

                          {alert.cndOrgan && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300">
                              {alert.cndOrgan}
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-bold text-white tracking-tight leading-snug">
                          {alert.title}
                        </h4>

                        <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
                          {alert.description}
                        </p>

                        <div className="text-[10px] text-slate-400 pt-0.5 font-mono flex flex-wrap items-center gap-3">
                          <span>Base Legal: {alert.legalBasis}</span>
                          {alert.clientEmail && (
                            <span className="text-slate-500">
                              · Destinatário de Alertas: <strong className="text-slate-400">{alert.clientEmail}</strong>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0">
                        {/* CND Specific Actions */}
                        {isCnd && (
                          <>
                            <button
                              onClick={() => {
                                if (onOpenCndScheduler) onOpenCndScheduler();
                                else if (onOpenCndRadar) onOpenCndRadar();
                                else onNavigateToTab('agenda_fiscal' as any);
                              }}
                              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-md cursor-pointer"
                            >
                              <ShieldCheck className="w-4 h-4" />
                              <span>{alert.actionLabel || 'Auditar no CND Radar'}</span>
                            </button>

                            <button
                              onClick={(e) => handleDispatchCndEmailAlert(alert, e)}
                              disabled={sendingEmailId === alert.id || sentEmailIds.includes(alert.id)}
                              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-md cursor-pointer ${
                                sentEmailIds.includes(alert.id)
                                  ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 cursor-default'
                                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
                              }`}
                              title="Disparar alerta preditivo oficial no e-mail do cliente"
                            >
                              {sendingEmailId === alert.id ? (
                                <Clock className="w-3.5 h-3.5 animate-spin" />
                              ) : sentEmailIds.includes(alert.id) ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Mail className="w-3.5 h-3.5" />
                              )}
                              <span>{sentEmailIds.includes(alert.id) ? 'E-mail Enviado' : 'Disparar E-mail ao Cliente'}</span>
                            </button>
                          </>
                        )}

                        {/* Primary Action Button */}
                        {alert.actionType === 'mark_delivered' && alert.obligationId && (
                          <button
                            onClick={() => handleMarkDelivered(alert.obligationId!)}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-md cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{alert.actionLabel}</span>
                          </button>
                        )}

                        {alert.actionType === 'adjust_payroll' && alert.suggestedMonthlyAdjustment && (
                          <button
                            onClick={() => handleApplyPayrollAdjustment(alert.suggestedMonthlyAdjustment!)}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-md cursor-pointer"
                          >
                            <Sparkles className="w-4 h-4" />
                            <span>{alert.actionLabel} (+{formatCurrencyBRL(alert.suggestedMonthlyAdjustment)}/m)</span>
                          </button>
                        )}

                        {alert.actionType === 'navigate_fator_r' && (
                          <button
                            onClick={() => onNavigateToTab('fator_r' as any)}
                            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-md cursor-pointer"
                          >
                            <Calculator className="w-4 h-4" />
                            <span>{alert.actionLabel}</span>
                          </button>
                        )}

                        {alert.actionType === 'navigate_parecer' && (
                          <button
                            onClick={() => onNavigateToTab('parecer' as any)}
                            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-md cursor-pointer"
                          >
                            <FileText className="w-4 h-4" />
                            <span>{alert.actionLabel}</span>
                          </button>
                        )}

                        {/* Secondary Details Trigger */}
                        <button
                          onClick={() => setSelectedAlertForModal(alert)}
                          className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                          title="Abrir diagnóstico detalhado e simulação preventiva"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-400" />
                          <span>Diagnóstico</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Details & Simulation Modal */}
      <ProactiveAlertDetailsModal
        isOpen={!!selectedAlertForModal}
        onClose={() => setSelectedAlertForModal(null)}
        alert={selectedAlertForModal}
        company={company}
        calculation={calculation}
        onApplyPayrollAdjustment={handleApplyPayrollAdjustment}
        onMarkObligationDelivered={handleMarkDelivered}
        onNavigateToTab={onNavigateToTab}
        showToast={showToast}
      />
    </div>
  );
};
