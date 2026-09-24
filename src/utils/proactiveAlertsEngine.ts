import { CompanyData, CalculationResult, ObrigacaoFiscal } from '../types';
import { OBRIGACOES_DATABASE } from '../components/AgendaFiscalView';
import { formatCurrencyBRL, STATE_SUBLIMIT, FEDERAL_LIMIT } from './taxRules';

export type AlertCategory = 'tax_deadline' | 'fator_r' | 'sublimit' | 'cadastral';
export type AlertSeverity = 'critical' | 'warning' | 'opportunity' | 'info';

export interface ProactiveAlert {
  id: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  subtitle: string;
  description: string;
  impactBadge?: string;
  legalBasis: string;
  dueDate?: string;
  daysRemaining?: number;
  isOverdue?: boolean;
  obligationId?: string;
  obligationStatus?: 'Pendente' | 'Entregue' | 'Atrasado';
  fatorRCurrent?: number;
  fatorRTarget?: number;
  suggestedMonthlyAdjustment?: number;
  estimatedAnnualBenefit?: number;
  actionType: 'mark_delivered' | 'adjust_payroll' | 'navigate_fator_r' | 'navigate_agenda' | 'navigate_parecer' | 'open_details';
  actionLabel: string;
  secondaryActionLabel?: string;
  secondaryActionType?: 'dismiss' | 'details' | 'navigate';
  createdAt?: string;
}

export interface ProactiveAlertSummary {
  totalAlerts: number;
  criticalCount: number;
  warningCount: number;
  opportunityCount: number;
  obligationsPendingCount: number;
  fatorRAlertsCount: number;
  alerts: ProactiveAlert[];
}

/**
 * Calcula os dias restantes ou atraso para uma obrigação no mês corrente
 */
function calculateObligationSchedule(ob: ObrigacaoFiscal, status: 'Pendente' | 'Entregue' | 'Atrasado') {
  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth(); // 0-indexed
  const currentYear = now.getFullYear();

  let targetDay = 20;
  if (ob.id.includes('dctfweb') || ob.id.includes('reinf') || ob.id.includes('esocial')) {
    targetDay = 15;
  } else if (ob.id.includes('iss')) {
    targetDay = 10;
  } else if (ob.id.includes('defis')) {
    // DEFIS é 31 de março
    const defisDate = new Date(currentYear, 2, 31);
    const diffTime = defisDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return {
      dueDateString: `31/03/${currentYear}`,
      daysRemaining: diffDays,
      isOverdue: diffDays < 0 && status !== 'Entregue',
      targetDay: 31
    };
  }

  // Extrair dia da string se possível
  const dayMatch = ob.diaEntregaSugerido.match(/dia\s+(\d{1,2})/i);
  if (dayMatch) {
    targetDay = parseInt(dayMatch[1], 10);
  }

  const thisMonthDueDate = new Date(currentYear, currentMonth, targetDay);
  const diffTimeThisMonth = thisMonthDueDate.getTime() - now.getTime();
  const diffDaysThisMonth = Math.ceil(diffTimeThisMonth / (1000 * 60 * 60 * 24));

  const dueDateFormatted = `${String(targetDay).padStart(2, '0')}/${String(currentMonth + 1).padStart(2, '0')}/${currentYear}`;

  if (diffDaysThisMonth < 0) {
    // Já passou da data no mês atual
    if (status === 'Entregue') {
      // Já entregue neste mês, próximo vencimento é mês que vem
      const nextMonthDueDate = new Date(currentYear, currentMonth + 1, targetDay);
      const diffNext = Math.ceil((nextMonthDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        dueDateString: `${String(targetDay).padStart(2, '0')}/${String(currentMonth + 2).padStart(2, '0')}/${currentYear}`,
        daysRemaining: diffNext,
        isOverdue: false,
        targetDay
      };
    } else {
      // Não entregue e data passou -> Atrasado!
      return {
        dueDateString: dueDateFormatted,
        daysRemaining: diffDaysThisMonth,
        isOverdue: true,
        targetDay
      };
    }
  }

  return {
    dueDateString: dueDateFormatted,
    daysRemaining: diffDaysThisMonth,
    isOverdue: false,
    targetDay
  };
}

/**
 * Engine principal de análise proativa de alertas tributários e Fator R
 */
export function generateProactiveAlerts(
  company: CompanyData,
  calculation: CalculationResult,
  customSavedStatus?: Record<string, 'Pendente' | 'Entregue' | 'Atrasado'>
): ProactiveAlertSummary {
  const alerts: ProactiveAlert[] = [];

  // Obter status salvo das obrigações
  let companyObligationStatus: Record<string, 'Pendente' | 'Entregue' | 'Atrasado'> = {};
  if (customSavedStatus) {
    companyObligationStatus = customSavedStatus;
  } else {
    try {
      const saved = localStorage.getItem('vertice_agenda_status_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        companyObligationStatus = parsed[company.cnpj || 'geral'] || {};
      }
    } catch {
      companyObligationStatus = {};
    }
  }

  // ==========================================
  // 1. ALERTAS DE OBRIGAÇÕES TRIBUTÁRIAS
  // ==========================================
  const regimeEmpresa = company.regimeTributario || 'simples_nacional';

  const relevantObligations = OBRIGACOES_DATABASE.filter(ob => {
    const idLower = ob.id.toLowerCase();
    if (regimeEmpresa === 'simples_nacional' && (idLower.includes('ecd') || idLower.includes('ecf'))) return false;
    if ((regimeEmpresa === 'lucro_presumido' || regimeEmpresa === 'lucro_real') && (idLower.includes('pgdas') || idLower.includes('defis'))) return false;
    return true;
  });

  relevantObligations.forEach(ob => {
    const status = companyObligationStatus[ob.id] || 'Pendente';
    const schedule = calculateObligationSchedule(ob, status);

    if (status === 'Entregue') {
      // Já entregue - não emite alerta crítico, apenas informativo se nos próximos 30 dias
      return;
    }

    if (schedule.isOverdue) {
      alerts.push({
        id: `alert-ob-overdue-${ob.id}`,
        category: 'tax_deadline',
        severity: 'critical',
        title: `Vencimento Vencido: ${ob.sigla} (${ob.nome})`,
        subtitle: `Prazo limite: ${schedule.dueDateString} (${Math.abs(schedule.daysRemaining)} dias em atraso)`,
        description: `A declaração/guia ${ob.sigla} não foi confirmada como entregue. ${ob.penalidade}`,
        impactBadge: '🚨 Risco Imediato de Multa',
        legalBasis: ob.legislacaoBase,
        dueDate: schedule.dueDateString,
        daysRemaining: schedule.daysRemaining,
        isOverdue: true,
        obligationId: ob.id,
        obligationStatus: status,
        actionType: 'mark_delivered',
        actionLabel: 'Confirmar Entrega',
        secondaryActionType: 'navigate',
        secondaryActionLabel: 'Ver Agenda Fiscal'
      });
    } else if (schedule.daysRemaining <= 3) {
      alerts.push({
        id: `alert-ob-urgent-${ob.id}`,
        category: 'tax_deadline',
        severity: 'critical',
        title: `Vencimento Crítico Iminente: ${ob.sigla}`,
        subtitle: schedule.daysRemaining === 0 ? 'Vence HOJE!' : `Vence em ${schedule.daysRemaining} dia(s) (${schedule.dueDateString})`,
        description: `O prazo de entrega de ${ob.sigla} está no limite. Evite penalidades e bloqueio de certidão: ${ob.penalidade}`,
        impactBadge: `⏰ Vence ${schedule.daysRemaining === 0 ? 'HOJE' : `em ${schedule.daysRemaining}d`}`,
        legalBasis: ob.legislacaoBase,
        dueDate: schedule.dueDateString,
        daysRemaining: schedule.daysRemaining,
        isOverdue: false,
        obligationId: ob.id,
        obligationStatus: status,
        actionType: 'mark_delivered',
        actionLabel: 'Marcar como Entregue',
        secondaryActionType: 'navigate',
        secondaryActionLabel: 'Abrir Agenda Fiscal'
      });
    } else if (schedule.daysRemaining <= 7) {
      alerts.push({
        id: `alert-ob-warning-${ob.id}`,
        category: 'tax_deadline',
        severity: 'warning',
        title: `Atenção ao Prazo: ${ob.sigla}`,
        subtitle: `Vencimento em ${schedule.daysRemaining} dias (${schedule.dueDateString})`,
        description: `Prepare a documentação fiscal e apuração para envio do ${ob.sigla} perante a Receita Federal / Fisco Estadual / Municipal.`,
        impactBadge: `📅 Prazo: ${schedule.dueDateString}`,
        legalBasis: ob.legislacaoBase,
        dueDate: schedule.dueDateString,
        daysRemaining: schedule.daysRemaining,
        isOverdue: false,
        obligationId: ob.id,
        obligationStatus: status,
        actionType: 'mark_delivered',
        actionLabel: 'Marcar Entregue',
        secondaryActionType: 'navigate',
        secondaryActionLabel: 'Agenda Fiscal'
      });
    }
  });

  // ==========================================
  // 2. ALERTAS E INCONSISTÊNCIAS NO FATOR R
  // ==========================================
  const rbt12 = Math.max(1, company.rbt12 || 0);
  const payroll12m = company.payroll12m || 0;
  const monthlyPayroll = company.monthlyPayroll || 0;
  const currentFatorR = (payroll12m / rbt12) * 100;
  const isAnexoVDeclared = company.anexo === 'V';
  const isAnexoIIIDeclared = company.anexo === 'III' || !company.anexo;

  // 2.1. ZONA DE RISCO IMINENTE (20% <= Fator R < 28%)
  if (currentFatorR >= 20.0 && currentFatorR < 28.0) {
    const requiredPayroll12m = rbt12 * 0.2805; // Margem segura
    const deficitPayroll = Math.max(0, requiredPayroll12m - payroll12m);
    const neededMonthlyProLabore = Math.ceil(deficitPayroll / 12);
    
    // Economia de alíquota (~15.5% Anexo V vs ~6.0% a 10.5% Anexo III)
    const annualSimplesTaxV = rbt12 * 0.180;
    const annualSimplesTaxIII = rbt12 * 0.105;
    const grossSavings = Math.max(0, annualSimplesTaxV - annualSimplesTaxIII);
    const inssRetentionCost = (neededMonthlyProLabore * 12) * 0.18;
    const netAnnualBenefit = Math.max(0, grossSavings - inssRetentionCost);

    alerts.push({
      id: 'alert-fator-r-threshold-opportunity',
      category: 'fator_r',
      severity: 'opportunity',
      title: `Oportunidade de Migração: Fator R em ${currentFatorR.toFixed(1)}% (Próximo dos 28%)`,
      subtitle: `Ajuste de Pró-labore de ${formatCurrencyBRL(neededMonthlyProLabore)}/mês migra do Anexo V para Anexo III`,
      description: `Sua empresa está a apenas ${(28 - currentFatorR).toFixed(1)}% de usufruir da tributação reduzida do Anexo III. Com o complemento de folha/pró-labore indicado, você economiza aproximadamente ${formatCurrencyBRL(netAnnualBenefit > 0 ? netAnnualBenefit : grossSavings)}/ano em tributos unificados do DAS.`,
      impactBadge: `💰 Economia de até ${formatCurrencyBRL(netAnnualBenefit > 0 ? netAnnualBenefit : grossSavings)}/ano`,
      legalBasis: 'Art. 18 § 5º-J da Lei Complementar nº 123/2006 (Fator R ≥ 28%)',
      fatorRCurrent: currentFatorR,
      fatorRTarget: 28.1,
      suggestedMonthlyAdjustment: neededMonthlyProLabore,
      estimatedAnnualBenefit: netAnnualBenefit > 0 ? netAnnualBenefit : grossSavings,
      actionType: 'adjust_payroll',
      actionLabel: 'Aplicar Ajuste de Pró-Labore',
      secondaryActionType: 'navigate',
      secondaryActionLabel: 'Simular no Fator R'
    });
  }

  // 2.2. DIVERGÊNCIA CRÍTICA / INCOMPATIBILIDADE CADASTRO VS HISTÓRICO (< 20% com Anexo III declarado)
  if (currentFatorR < 20.0 && isAnexoIIIDeclared && company.atividadeEmpresa === 'servicos') {
    alerts.push({
      id: 'alert-fator-r-critical-inconsistency',
      category: 'fator_r',
      severity: 'critical',
      title: `Inconsistência Grave de Fator R: ${currentFatorR.toFixed(1)}% com Anexo III Ativo`,
      subtitle: 'Risco de Reclassificação Retroativa para o Anexo V pela Receita Federal',
      description: `O faturamento RBT12 é de ${formatCurrencyBRL(rbt12)}, mas a folha acumulada é de apenas ${formatCurrencyBRL(payroll12m)} (${currentFatorR.toFixed(1)}%). O PGDAS-D exige comprovação de no mínimo 28% em folha/pró-labore para manter o Anexo III nas atividades sujeitas ao Fator R.`,
      impactBadge: '⚠️ Risco de Glosa e Autuação',
      legalBasis: 'Art. 18 §§ 5º-I e 5º-M da LC 123/06 e Resolução CGSN nº 140/2018',
      fatorRCurrent: currentFatorR,
      fatorRTarget: 28.0,
      actionType: 'navigate_fator_r',
      actionLabel: 'Auditar Folha & Regularizar',
      secondaryActionType: 'navigate',
      secondaryActionLabel: 'Ver Detalhes do Risco'
    });
  }

  // 2.3. INEFICIÊNCIA TRIBUTÁRIA / FATOR R EXCESSIVO (> 38%)
  if (currentFatorR > 38.0 && rbt12 > 150000) {
    const idealPayroll = rbt12 * 0.285;
    const excessPayroll = payroll12m - idealPayroll;
    const monthlyExcess = Math.max(0, excessPayroll / 12);

    if (monthlyExcess > 500) {
      alerts.push({
        id: 'alert-fator-r-excess-optimization',
        category: 'fator_r',
        severity: 'opportunity',
        title: `Fator R Superdimensionado: ${currentFatorR.toFixed(1)}% (Custo de Encargos Elevado)`,
        subtitle: `Você pode desonerar até ${formatCurrencyBRL(monthlyExcess)}/mês em Pró-labore sem perder o Anexo III`,
        description: `O Fator R está muito acima do piso de 28% exigido pela legislação. A redução calibrada do Pró-labore diminui retenções de INSS pessoa física e IRRF, mantendo a empresa 100% segura no Anexo III.`,
        impactBadge: `📉 Desoneração Sugerida: ${formatCurrencyBRL(monthlyExcess)}/mês`,
        legalBasis: 'LC 123/06 Art. 18 e Planejamento Tributário Previdenciário',
        fatorRCurrent: currentFatorR,
        fatorRTarget: 28.5,
        suggestedMonthlyAdjustment: -monthlyExcess,
        actionType: 'navigate_fator_r',
        actionLabel: 'Calibrar Fator R',
        secondaryActionType: 'navigate',
        secondaryActionLabel: 'Simulador 360°'
      });
    }
  }

  // 2.4. DIVERGÊNCIA ENTRE FOLHA MENSAL DECLARADA E FOLHA ACUMULADA 12M
  if (monthlyPayroll > 0 && payroll12m > 0) {
    const annualizedMonthlyPayroll = monthlyPayroll * 12;
    const diffPercent = Math.abs((annualizedMonthlyPayroll - payroll12m) / payroll12m) * 100;

    if (diffPercent > 35 && rbt12 > 100000) {
      const isDropping = annualizedMonthlyPayroll < payroll12m;
      alerts.push({
        id: 'alert-fator-r-payroll-drift',
        category: 'fator_r',
        severity: 'warning',
        title: `Flutuação Recente na Folha: Divergência de ${diffPercent.toFixed(0)}%`,
        subtitle: isDropping 
          ? 'Folha mensal atual reduzida: Risco de queda futura do Fator R acumulado'
          : 'Folha mensal recente expandida: Tendência de alta progressiva do Fator R',
        description: `A folha declarada do mês (${formatCurrencyBRL(monthlyPayroll)} x 12 = ${formatCurrencyBRL(annualizedMonthlyPayroll)}) diverge do histórico acumulado de 12 meses (${formatCurrencyBRL(payroll12m)}). ${
          isDropping 
            ? 'Se o valor atual for mantido, a média do Fator R cairá nos próximos meses, podendo desenquadrar a empresa do Anexo III.' 
            : 'O novo patamar de folha aumentará a média acumulada nos próximos fechamentos do PGDAS-D.'
        }`,
        impactBadge: isDropping ? '⚠️ Alerta de Tendência de Queda' : '📈 Tendência de Alta',
        legalBasis: 'Cálculo Móvel de 12 Meses (Art. 18 § 5º-J da LC 123/06)',
        actionType: 'navigate_fator_r',
        actionLabel: 'Projetar Fator R em 12 Meses',
        secondaryActionType: 'navigate',
        secondaryActionLabel: 'Ver Simulação'
      });
    }
  }

  // 2.5. EMPRESA SEM HISTÓRICO DE FOLHA DECLARADA EM ATIVIDADE DE SERVIÇOS
  if (payroll12m === 0 && monthlyPayroll === 0 && company.atividadeEmpresa === 'servicos' && rbt12 > 50000) {
    alerts.push({
      id: 'alert-fator-r-zero-payroll',
      category: 'fator_r',
      severity: 'warning',
      title: 'Ausência de Folha Salarial ou Pró-Labore Registrado',
      subtitle: 'Empresa sem folha tributa compulsoriamente no Anexo V (Alíquota inicial de 15,50%)',
      description: 'Sem registro de folha salarial ou pró-labore de sócios, a empresa não atinge a regra dos 28% do Fator R e recolhe tributos com alíquotas até 150% maiores no Simples Nacional.',
      impactBadge: '💡 Oportunidade de Economia',
      legalBasis: 'Art. 18 § 5º-M da LC 123/06',
      actionType: 'navigate_fator_r',
      actionLabel: 'Configurar Pró-Labore',
      secondaryActionType: 'navigate',
      secondaryActionLabel: 'Simular Economia'
    });
  }

  // ==========================================
  // 3. ALERTAS DE SUBLIMITES E TETOS (LC 123/06)
  // ==========================================
  if (rbt12 >= 3200000 && rbt12 <= STATE_SUBLIMIT) {
    const margin = STATE_SUBLIMIT - rbt12;
    alerts.push({
      id: 'alert-sublimit-warning-zone',
      category: 'sublimit',
      severity: 'warning',
      title: `Proximidade do Sublimite Estadual (R$ 3,6M): Margem de ${formatCurrencyBRL(margin)}`,
      subtitle: 'Risco iminente de recolhimento de ICMS/ISS fora da Guia DAS',
      description: `O faturamento acumulado de ${formatCurrencyBRL(rbt12)} está a menos de R$ 400k do sublimite de ICMS/ISS. Ao ultrapassar R$ 3,6M, o imposto estadual/municipal não é mais unificado no Simples Nacional e exige escrituração no SPED Fiscal / EFD.`,
      impactBadge: `⚡ Margem Restante: ${formatCurrencyBRL(margin)}`,
      legalBasis: 'Art. 19 e 20 da Lei Complementar nº 123/2006',
      actionType: 'navigate_parecer',
      actionLabel: 'Ver Impacto Tributário',
      secondaryActionType: 'navigate',
      secondaryActionLabel: 'Laudo Pericial'
    });
  }

  // Ordenar alertas: Críticos primeiro, depois Avisos, Oportunidades e Informativos
  const severityOrder: Record<AlertSeverity, number> = {
    critical: 0,
    warning: 1,
    opportunity: 2,
    info: 3
  };

  alerts.sort((a, b) => {
    const diff = severityOrder[a.severity] - severityOrder[b.severity];
    if (diff !== 0) return diff;
    if (a.daysRemaining !== undefined && b.daysRemaining !== undefined) {
      return a.daysRemaining - b.daysRemaining;
    }
    return 0;
  });

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const warningCount = alerts.filter(a => a.severity === 'warning').length;
  const opportunityCount = alerts.filter(a => a.severity === 'opportunity').length;
  const obligationsPendingCount = alerts.filter(a => a.category === 'tax_deadline').length;
  const fatorRAlertsCount = alerts.filter(a => a.category === 'fator_r').length;

  return {
    totalAlerts: alerts.length,
    criticalCount,
    warningCount,
    opportunityCount,
    obligationsPendingCount,
    fatorRAlertsCount,
    alerts
  };
}
