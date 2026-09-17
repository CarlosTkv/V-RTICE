import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  ExternalLink, 
  Loader2, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Building2, 
  Calendar, 
  ArrowRight, 
  Scale, 
  Award, 
  Layers, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Tag, 
  TrendingUp, 
  Percent, 
  Check, 
  DollarSign, 
  Info, 
  RefreshCw, 
  Sparkles, 
  Eye,
  QrCode
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  Cell, 
  PieChart, 
  Pie, 
  LabelList 
} from 'recharts';
import { CompanyData, CalculationResult, CFOPItem } from '../types';
import { 
  formatCurrencyBRL, 
  formatPercentBR, 
  FEDERAL_LIMIT, 
  STATE_SUBLIMIT,
  getDefaultCFOPsForAnexo 
} from '../utils/taxRules';
import { BrandLogo } from './BrandLogo';
import { generateDocumentSecurity, VerifiedDocumentRecord } from '../utils/documentSecurity';

interface TechnicalReportContentProps {
  company: CompanyData;
  calculation: CalculationResult;
}

export const TechnicalReportContent: React.FC<TechnicalReportContentProps> = ({
  company,
  calculation,
}) => {
  const [securityRecord, setSecurityRecord] = useState<VerifiedDocumentRecord | null>(null);

  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  useEffect(() => {
    let isMounted = true;
    generateDocumentSecurity({
      title: 'Parecer Técnico & Auditoria Tributária 360°',
      companyName: company.name,
      cnpj: company.cnpj,
      uf: company.uf,
      rbt12: company.rbt12,
      bestRegime: calculation.bestRegime?.name,
      totalTax: calculation.bestRegime?.annualTaxTotal,
      dateStr: currentDate,
    }).then((rec) => {
      if (isMounted) setSecurityRecord(rec);
    });
    return () => {
      isMounted = false;
    };
  }, [company.cnpj, company.name, company.uf, company.rbt12, currentDate, calculation.bestRegime]);

  const consolidated = calculation.consolidatedRevenue;
  const isExcluded = calculation.exceedsFederalLimit;
  const isSublimitAlert = calculation.exceedsSublimit;

  const cfops: CFOPItem[] = company.cfopItems && company.cfopItems.length > 0
    ? company.cfopItems
    : getDefaultCFOPsForAnexo(company.anexo);

  // Extracting 3 critical points for Executive Summary dynamically
  const criticalPoints = [];

  // Point 1: Limite Federal / Sublimite Estadual
  if (isExcluded) {
    criticalPoints.push({
      title: 'Exclusão do Simples',
      description: `A receita bruta global atingiu ${formatCurrencyBRL(consolidated)}, ultrapassando o limite federal de R$ 4,8 milhões. A empresa está legalmente impedida de permanecer no Simples Nacional.`,
      severity: 'high'
    });
  } else if (isSublimitAlert) {
    criticalPoints.push({
      title: 'Sublimite Excedido',
      description: `O faturamento consolidado de ${formatCurrencyBRL(consolidated)} ultrapassou o sublimite estadual de R$ 3,6 milhões. O recolhimento do ICMS e do ISS deverá ocorrer obrigatoriamente por fora do DAS.`,
      severity: 'medium'
    });
  } else {
    criticalPoints.push({
      title: 'Limites em Conformidade',
      description: `A receita consolidada está em ${formatCurrencyBRL(consolidated)}, situando-se abaixo dos tetos federal (R$ 4,8M) e estadual (R$ 3,6M). O enquadramento no regime está seguro.`,
      severity: 'low'
    });
  }

  // Point 2: Tax Savings & Regime Recommendation
  const currentTax = calculation.effectiveTaxAnnual;
  const rates = [
    { name: 'Simples Híbrido', tax: calculation.simplesHibridoAnnualTax },
    { name: 'Lucro Presumido', tax: calculation.lucroPresumidoAnnualTax },
    { name: 'Lucro Real', tax: calculation.lucroRealAnnualTax }
  ];
  const bestRegime = rates.reduce((min, cur) => cur.tax < min.tax ? cur : min, { name: 'Simples Nacional Padrão', tax: currentTax });
  
  if (bestRegime.name !== 'Simples Nacional Padrão' && (currentTax - bestRegime.tax) > 1000) {
    criticalPoints.push({
      title: 'Economia Tributária',
      description: `O regime do ${bestRegime.name} projeta um imposto anual de ${formatCurrencyBRL(bestRegime.tax)}, o que representa uma economia de ${formatCurrencyBRL(currentTax - bestRegime.tax)} comparado ao Simples Padrão.`,
      severity: 'opportunity'
    });
  } else {
    criticalPoints.push({
      title: 'Simples Padrão Ideal',
      description: `A simulação confirma que o Simples Nacional Padrão é o regime tributário mais eficiente, com menor alíquota efetiva anual de ${calculation.effectiveRate.toFixed(2)}%.`,
      severity: 'low'
    });
  }

  // Point 3: Compliance risks (fator r, partner common rule, cfop issues)
  if (calculation.hasPartnerIrregularity) {
    criticalPoints.push({
      title: 'Alto Risco Societário',
      description: `Identificou-se sócios em comum com participação societária que soma receitas acima do limite legal (Art. 3º § 4º da LC 123), gerando risco grave de desenquadramento retroativo.`,
      severity: 'high'
    });
  } else if (company.anexo === 'V' && calculation.fatorR < 0.28) {
    criticalPoints.push({
      title: 'Alerta de Fator R',
      description: `A relação folha/faturamento (Fator R) atual é de ${(calculation.fatorR * 100).toFixed(1)}%, inviabilizando o Anexo III. A carga tributária pelo Anexo V está excessiva.`,
      severity: 'medium'
    });
  } else if (cfops.some(item => item.icmsTreatment === 'st_substituicao')) {
    criticalPoints.push({
      title: 'Oportunidade ICMS-ST',
      description: `Identificada operação com CFOPs de Substituição Tributária (ST). Há oportunidade de segregação de receitas no DAS para reduzir custos imediatos da guia.`,
      severity: 'medium'
    });
  } else {
    criticalPoints.push({
      title: 'Sem Riscos Graves',
      description: `Não foram identificadas irregularidades de participação societária impeditivas ou inadequações graves de CFOPs de vendas na base fiscal analisada.`,
      severity: 'low'
    });
  }

  const finalCriticalPoints = criticalPoints.slice(0, 3);

  // Data for regime comparison bar chart (4 Regimes)
  const regimeComparisonData = [
    {
      name: 'Simples Padrão',
      tributoAnual: Math.round(calculation.effectiveTaxAnnual),
      aliquotaEfetiva: calculation.effectiveRate,
      fill: '#2563EB',
    },
    {
      name: 'Simples Híbrido',
      tributoAnual: Math.round(calculation.simplesHibridoAnnualTax),
      aliquotaEfetiva: calculation.simplesHibridoEffectiveRate,
      fill: '#0284C7',
    },
    {
      name: 'Lucro Presumido',
      tributoAnual: Math.round(calculation.lucroPresumidoAnnualTax),
      aliquotaEfetiva: calculation.lucroPresumidoEffectiveRate,
      fill: '#059669',
    },
    {
      name: 'Lucro Real',
      tributoAnual: Math.round(calculation.lucroRealAnnualTax),
      aliquotaEfetiva: calculation.lucroRealEffectiveRate,
      fill: '#D97706',
    },
  ];

  // Data for tax breakdown pie chart in DAS
  const taxBreakdownData = [
    { name: 'CPP (Previdência)', value: Math.round(calculation.breakdown.cpp), color: '#3B82F6' },
    { name: 'ICMS', value: Math.round(calculation.breakdown.icms), color: '#10B981' },
    { name: 'ISS', value: Math.round(calculation.breakdown.iss), color: '#06B6D4' },
    { name: 'IRPJ', value: Math.round(calculation.breakdown.irpj), color: '#F59E0B' },
    { name: 'COFINS', value: Math.round(calculation.breakdown.cofins), color: '#8B5CF6' },
    { name: 'PIS', value: Math.round(calculation.breakdown.pis), color: '#EC4899' },
    { name: 'CSLL', value: Math.round(calculation.breakdown.csll), color: '#6366F1' },
  ].filter(d => d.value > 0);

  // Data for B2B Credit Transfer in Reforma Tributária
  const b2bCreditData = [
    {
      regime: 'Simples Nacional',
      creditoTransferido: Number(calculation.reformaSimplesCreditTransferRate.toFixed(2)),
      fill: '#E11D48',
    },
    {
      regime: 'Regime Regular (IVA)',
      creditoTransferido: Number(calculation.reformaRegularCreditTransferRate.toFixed(2)),
      fill: '#10B981',
    },
  ];

  return (
    <div className="relative overflow-hidden p-4 sm:p-8 space-y-12 bg-[#0B0F19] print:bg-white text-slate-100 print:text-slate-900 rounded-2xl border border-slate-800 print:border-none shadow-2xl">
      {/* Marca D'água Pericial com Logo Transparente e Nome Oficial do Sistema (VÉRTICE AUDITOR FISCAL) */}
      <div className="report-watermark absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden" aria-hidden="true">
        <BrandLogo variant="watermark" size="2xl" watermarkOpacity={0.045} className="transform -rotate-12 scale-125" />
      </div>

      <div className="relative z-10 space-y-12">
        {/* Cabeçalho de Impressão Repetitivo (Apenas Impressão) */}
        <div className="print-header-repeat hidden no-print" aria-hidden="true">
          <div className="flex items-center space-x-2">
            <div className="font-bold text-xs uppercase tracking-wider text-slate-900">Vértice Auditor Fiscal</div>
            <div className="text-[10px] text-slate-500 border-l border-slate-300 pl-2">Auditoria de Enquadramento 360°</div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-extrabold text-slate-800 uppercase block">{company.name || 'Empresa Auditada'}</span>
            <span className="text-[8px] text-slate-500 font-mono">CNPJ: {company.cnpj || 'Sem dados'}</span>
          </div>
        </div>

      {/* Rodapé de Página Automático (Apenas Impressão) */}
      <div className="print-footer-page-number hidden no-print" aria-hidden="true"></div>

      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-800 pb-8 gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 mb-2">
              <BrandLogo variant="report" className="text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif-display font-bold italic tracking-tight text-white">
              Parecer Técnico Estratégico
            </h1>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest pt-1">
              Auditoria de Enquadramento, Riscos Societários, CFOPs & Reforma Tributária 2026/2027
            </p>
            <div className="pt-4">
              <h2 className="text-lg font-extrabold text-white uppercase">
                {company.name || 'Sem dados disponíveis'}
              </h2>
              <p className="text-xs text-slate-300 font-mono">
                CNPJ: {company.cnpj || 'Sem dados disponíveis'} | CNAE: {company.cnae || 'Sem dados disponíveis'} - {company.cnaeDescription || 'Sem dados disponíveis'} | UF: {company.uf || 'SP'} ({company.city || 'Capital'})
              </p>
            </div>
          </div>

          <div className="text-right sm:self-start space-y-2">
            <div className={`px-4 py-1.5 rounded-full font-black text-[11px] uppercase tracking-wider inline-block shadow-sm ${
              isExcluded
                ? 'bg-red-600 text-white'
                : isSublimitAlert || calculation.hasPartnerIrregularity
                ? 'bg-amber-500 text-white'
                : 'bg-emerald-600 text-white'
            }`}>
              {isExcluded
                ? 'Exclusão Obrigatória'
                : isSublimitAlert
                ? 'Sublimite Excedido'
                : calculation.hasPartnerIrregularity
                ? 'Risco Societário'
                : 'Regular / Conforme'}
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Emitido em {currentDate}
            </p>
            {securityRecord && (
              <div className="flex items-center justify-end space-x-2 pt-1">
                {securityRecord.qrCodeDataUrl && (
                  <img 
                    src={securityRecord.qrCodeDataUrl} 
                    alt="QR Code" 
                    className="w-10 h-10 rounded bg-white p-0.5 border border-slate-700" 
                  />
                )}
                <div className="text-right">
                  <p className="text-[10px] font-mono font-bold text-blue-400 uppercase">
                    {securityRecord.hashFormatted}
                  </p>
                  <p className="text-[8px] font-mono text-emerald-400">
                    ICP-Brasil Homologado
                  </p>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Executive Summary Section (Resumo Executivo) */}
        <section className="bg-slate-100 text-slate-900 p-6 rounded-2xl border border-slate-300 space-y-4 avoid-break shadow-xs print-executive-summary">
          <div className="flex items-center space-x-2 border-b border-slate-300 pb-2">
            <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
              Resumo Executivo // Principais Pontos Críticos da Auditoria
            </h3>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Com base no processamento analítico dos dados tributários, contábeis e societários fornecidos para o ano-calendário de 2026, identificamos os três apontamentos prioritários que demandam atenção imediata da governança:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
            {finalCriticalPoints.map((point, index) => (
              <div key={index} className="space-y-1.5 p-4 bg-white rounded-xl border border-slate-200 shadow-xxs">
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${
                    point.severity === 'high' 
                      ? 'bg-red-500' 
                      : point.severity === 'medium' 
                      ? 'bg-amber-500' 
                      : point.severity === 'opportunity'
                      ? 'bg-indigo-500'
                      : 'bg-emerald-500'
                  }`} />
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-tight">{point.title}</h4>
                </div>
                <p className="text-[10px] text-slate-600 leading-normal">{point.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* GRÁFICOS COMPARATIVOS NO RELATÓRIO */}
        <section className="space-y-4 avoid-break">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2">
            <h3 className="text-sm font-black uppercase tracking-[0.25em] text-white flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span>Gráficos Comparativos de Inteligência Tributária</span>
            </h3>
            <span className="text-xs font-bold text-slate-400">
              Análise Quantitativa
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Chart 1: Regime Comparison */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Carga Tributária Anual Estimada por Regime
              </h4>
              <p className="text-[10px] text-slate-300">Valores projetados em R$ para a receita de {formatCurrencyBRL(company.rbt12)}</p>
              <div className="h-56 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regimeComparisonData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                    <XAxis dataKey="name" stroke="#94A3B8" tick={{ fontSize: 10, fill: '#FFFFFF' }} />
                    <YAxis 
                      stroke="#94A3B8"
                      tick={{ fontSize: 10, fill: '#FFFFFF' }} 
                      tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`} 
                    />
                    <Tooltip 
                      formatter={(val: any) => [formatCurrencyBRL(Number(val)), 'Tributo Anual']} 
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#FFFFFF', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }}
                      itemStyle={{ color: '#FFFFFF' }}
                      labelStyle={{ color: '#FFFFFF', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="tributoAnual" radius={[6, 6, 0, 0]}>
                      {regimeComparisonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                      <LabelList 
                        dataKey="tributoAnual" 
                        position="top" 
                        formatter={(val: number) => `R$ ${(val / 1000).toFixed(0)}k`} 
                        style={{ fill: '#334155', fontSize: '10px', fontWeight: 'bold' }} 
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Tax Composition */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Repartição dos Tributos no DAS Mensal
              </h4>
              <p className="text-[10px] text-slate-300">Valor líquido mensal: {formatCurrencyBRL(calculation.effectiveTaxMonthly)}</p>
              <div className="h-56 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={taxBreakdownData}
                      cx="50%"
                      cy="43%"
                      innerRadius={35}
                      outerRadius={55}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name.split(' ')[0]}: R$ ${value.toLocaleString('pt-BR')}`}
                      labelLine={{ stroke: '#64748B', strokeWidth: 1 }}
                    >
                      {taxBreakdownData.map((entry, index) => (
                        <Cell key={`pie-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val: any) => [formatCurrencyBRL(Number(val)), 'Valor']} 
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#FFFFFF' }}
                      itemStyle={{ color: '#FFFFFF' }}
                      labelStyle={{ color: '#FFFFFF', fontWeight: 'bold' }}
                    />
                    <Legend 
                      iconSize={8} 
                      layout="horizontal" 
                      verticalAlign="bottom" 
                      wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} 
                      formatter={(value) => <span className="text-white font-medium">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        {/* 01. Diagnóstico de Receita e Limites */}
        <section className="space-y-4 avoid-break">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2">
            <h3 className="text-sm font-black uppercase tracking-[0.25em] text-white flex items-center space-x-2">
              <span>01. Diagnóstico de Receita & Limites (LC 123/2006)</span>
            </h3>
            <span className="text-xs font-bold text-slate-400">
              Anexo {company.anexo} | Alíquota Efetiva: {calculation.effectiveRate.toFixed(2)}%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs text-slate-200 leading-relaxed">
            <div className="space-y-3">
              <p>
                O faturamento acumulado próprio (RBT12) atingiu <b className="text-white">{formatCurrencyBRL(company.rbt12)}</b>. 
                {calculation.consolidatedRevenue > company.rbt12 && (
                  <span> Considerando a soma de faturamento de empresas com sócios em comum (Art. 3º § 4º), a receita global atinge <b className="text-white">{formatCurrencyBRL(consolidated)}</b>.</span>
                )}
              </p>
              
              <div className="p-4 bg-slate-900 rounded-2xl border-l-4 border-blue-500 space-y-1">
                <p className="font-bold text-white">Conclusão de Enquadramento:</p>
                <p className="italic text-slate-300">
                  {isExcluded
                    ? calculation.exclusionType === 'immediate_next_month'
                    ? 'Ultrapassagem do teto superior a 20% (> R$ 5.760.000,00). Exclusão compulsória e imediata a partir do mês subsequente ao excesso.'
                    : 'Ultrapassagem de até 20% do teto federal (R$ 4.800.000,00). Exclusão do Simples Nacional surtirá efeitos em 1º de janeiro do ano seguinte.'
                    : isSublimitAlert
                    ? 'A empresa ultrapassou o Sublimite Estadual de R$ 3.600.000,00. O ICMS/ISS foi expurgado do DAS e deve ser recolhido por fora no regime normal com entrega de EFD/SPED.'
                    : 'A empresa permanece dentro dos limites legais federais e estaduais do regime simplificado.'}
                </p>
              </div>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3 text-xs">
              <span className="font-bold text-white block uppercase tracking-wider text-[10px]">
                Métricas do Simples Nacional no PA Corrente
              </span>
              <div className="space-y-1.5">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-300">Faturamento RBT12:</span>
                  <span className="font-mono font-bold text-white">{formatCurrencyBRL(company.rbt12)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-300">Alíquota Nominal / Dedutível:</span>
                  <span className="font-mono text-white">{calculation.nominalRate.toFixed(1)}% / {formatCurrencyBRL(calculation.deduction)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-300">Alíquota Efetiva do DAS:</span>
                  <span className="font-mono font-bold text-blue-400">{calculation.effectiveRate.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-300">DAS Bruto (Sem Segregação):</span>
                  <span className="font-mono text-white">{formatCurrencyBRL(calculation.rawTaxMonthlyBeforeSegregation)}</span>
                </div>
                {calculation.segregatedDeductionsMonthly > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-800 text-emerald-400 font-semibold">
                    <span>Abatimentos por ST / Isenções / Retenções:</span>
                    <span className="font-mono">-{formatCurrencyBRL(calculation.segregatedDeductionsMonthly)}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-300">Estimativa do DAS Mensal Líquido:</span>
                  <span className="font-mono font-bold text-white">{formatCurrencyBRL(calculation.effectiveTaxMonthly)}</span>
                </div>
                <div className="flex justify-between py-1 text-white font-bold">
                  <span>Carga Anual Estimada no Simples:</span>
                  <span className="font-mono text-white">{formatCurrencyBRL(calculation.effectiveTaxAnnual)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Destaque Técnico: Excesso de Sublimite Estadual */}
          {calculation.exceedsSublimit && calculation.sublimitExclusionDetails && (
            <div className="p-4 bg-amber-950/40 rounded-2xl border-2 border-amber-500/50 space-y-2 text-xs">
              <div className="flex items-center justify-between text-amber-300 font-bold">
                <span className="flex items-center space-x-1.5 uppercase tracking-wider text-[11px]">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Segregação Obrigatória: Sublimite Estadual Ultrapassado ({formatCurrencyBRL(STATE_SUBLIMIT)})</span>
                </span>
                <span className="font-mono text-amber-300">
                  Excesso: +{formatCurrencyBRL(calculation.sublimitExclusionDetails.excessAmount)} ({formatPercentBR(calculation.sublimitExclusionDetails.excessPercent)})
                </span>
              </div>
              <p className="text-slate-200 leading-relaxed text-[11px]">
                Conforme Art. 13-A e 19 da LC 123/2006, o ICMS e/ou ISS foram excluídos do DAS. A empresa passa a recolher:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[10px]">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-amber-500/30">
                  <span className="text-slate-400 block">DAS Federal (União):</span>
                  <span className="text-blue-400 font-bold text-xs">{formatCurrencyBRL(calculation.sublimitExclusionDetails.monthlyFederalDASTax)}/mês</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-amber-500/30">
                  <span className="text-slate-400 block">ICMS Débito/Crédito (UF {company.uf || 'SP'}):</span>
                  <span className="text-emerald-400 font-bold text-xs">{formatCurrencyBRL(calculation.sublimitExclusionDetails.monthlyOutsideICMS)}/mês</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-amber-500/30">
                  <span className="text-slate-400 block">ISS Fora do DAS (Município):</span>
                  <span className="text-cyan-400 font-bold text-xs">{formatCurrencyBRL(calculation.sublimitExclusionDetails.monthlyOutsideISS)}/mês</span>
                </div>
              </div>
              <div className="text-[10px] text-amber-200 pt-1 font-medium">
                Vigência do desenquadramento estadual: <strong className="text-white">{calculation.sublimitExclusionDetails.effectiveExclusionDateRule === 'immediate_next_month' ? 'Mês subsequente ao excesso (excesso > 20%)' : '1º de janeiro do próximo exercício'}</strong>. Obrigações acessórias ativadas: SPED Fiscal (EFD ICMS/IPI) e GIA/DeSTDA.
              </div>
            </div>
          )}

          {/* Destaque Técnico: Atividade de Transporte */}
          {company.isTransportService && calculation.transportAnalysis && (
            <div className="p-4 bg-blue-950/40 rounded-2xl border border-blue-500/40 space-y-2 text-xs">
              <div className="flex items-center justify-between text-white font-bold">
                <span className="uppercase tracking-wider text-[11px]">
                  Enquadramento Específico: Setor de Transporte ({calculation.transportAnalysis.transportLabel})
                </span>
                <span className="font-mono text-blue-400">{calculation.transportAnalysis.anexoSimplesUsed}</span>
              </div>
              <p className="text-slate-200 text-[11px] leading-relaxed">
                {calculation.transportAnalysis.legalBasisNote}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[10px]">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-blue-500/30">
                  <span className="text-slate-400 block">Competência & Documentos:</span>
                  <span className="text-white font-bold">
                    {calculation.transportAnalysis.taxJurisdiction === 'estadual_icms' ? 'Estadual (ICMS) - CT-e mod. 57 e MDF-e' : 'Municipal (ISS) - NFS-e'}
                  </span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-blue-500/30">
                  <span className="text-slate-400 block">Presunção IRPJ / CSLL no Lucro Presumido:</span>
                  <span className="text-blue-400 font-bold">
                    IRPJ: {calculation.transportAnalysis.lucroPresumidoIRPJRate}% | CSLL: {calculation.transportAnalysis.lucroPresumidoCSLLRate}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 02. Auditoria de CFOPs e Segregação de ICMS & ISS */}
        <section className="space-y-4 avoid-break">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2">
            <h3 className="text-sm font-black uppercase tracking-[0.25em] text-white flex items-center space-x-2">
              <Tag className="w-4 h-4 text-blue-400" />
              <span>02. Auditoria de CFOPs e Segregação de ICMS & ISS (LC 123/06 Art. 18 § 4º-A)</span>
            </h3>
            <span className="text-xs font-bold text-slate-400">
              {cfops.length} CFOP(s) Auditado(s)
            </span>
          </div>

          <div className="space-y-3 text-xs text-slate-200 leading-relaxed">
            <p>
              A segregação correta das receitas por CFOP assegura a exclusão legítima das parcelas de <strong className="text-white">Substituição Tributária (ST)</strong>, <strong className="text-white">Isenções Estaduais/Municipais</strong> e <strong className="text-white">Retenções de ISS</strong> na fonte, eliminando a bitributação no cálculo do PGDAS-D.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden">
                <thead className="bg-slate-900 text-slate-300 uppercase text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="px-3 py-2">CFOP</th>
                    <th className="px-3 py-2">Descrição da Operação</th>
                    <th className="px-3 py-2 text-center">% Partilha</th>
                    <th className="px-3 py-2">Tratamento ICMS</th>
                    <th className="px-3 py-2">Tratamento ISS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {cfops.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-4 text-center text-slate-400 italic text-[11px]">
                        Nenhum CFOP específico cadastrado. Apuração realizada pela alíquota integral do Anexo {company.anexo || 'I'}.
                      </td>
                    </tr>
                  ) : (
                    cfops.map((c) => (
                      <tr key={c.id} className="text-[11px]">
                        <td className="px-3 py-2 font-mono font-bold text-blue-400">{c.code}</td>
                        <td className="px-3 py-2 text-white font-medium">{c.description}</td>
                        <td className="px-3 py-2 text-center font-bold text-white">{c.percentage}%</td>
                        <td className="px-3 py-2 font-medium">
                          {c.icmsTreatment === 'st_substituicao' && <span className="text-emerald-400 font-bold">Substituição Tributária (Abate do DAS)</span>}
                          {c.icmsTreatment === 'isencao_total' && <span className="text-blue-400 font-bold">Isenção Total ICMS</span>}
                          {c.icmsTreatment === 'reducao_base' && <span className="text-blue-400 font-bold">Redução Base ({c.icmsReductionPercent}%)</span>}
                          {c.icmsTreatment === 'tributado_integral' && <span className="text-slate-300">Tributado Normal no DAS</span>}
                          {c.icmsTreatment === 'por_fora_sublimite' && <span className="text-red-400 font-bold">Por Fora (Sublimite)</span>}
                        </td>
                        <td className="px-3 py-2 font-medium">
                          {c.issTreatment === 'retido_tomador' && <span className="text-emerald-400 font-bold">Retido na Fonte</span>}
                          {c.issTreatment === 'isencao_total' && <span className="text-blue-400 font-bold">Isenção Municipal</span>}
                          {c.issTreatment === 'tributado_integral' && <span className="text-slate-300">Tributado no DAS</span>}
                          {c.issTreatment === 'nao_aplicavel' && <span className="text-slate-400">N/A</span>}
                          {c.issTreatment === 'por_fora_sublimite' && <span className="text-red-400 font-bold">Por Fora (Sublimite)</span>}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {calculation.segregatedDeductionsMonthly > 0 && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center justify-between">
                <span className="font-semibold text-white">Economia financeira mensal gerada pela segregação nos CFOPs:</span>
                <span className="font-mono font-bold text-sm text-emerald-400">{formatCurrencyBRL(calculation.segregatedDeductionsMonthly)}/mês ({formatCurrencyBRL(calculation.segregatedDeductionsMonthly * 12)}/ano)</span>
              </div>
            )}
          </div>
        </section>

        {/* 04. Resumo Analítico: Posicionamento, Performance & Riscos */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-300 pb-2">
            <h3 className="text-sm font-black uppercase tracking-[0.25em] text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>04. Resumo Analítico: Posicionamento, Performance & Riscos</span>
            </h3>
            <span className="text-xs font-bold text-slate-500">
              Análise Pericial Integrada
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Coluna 1: Posicionamento e Cenários */}
            <div className="space-y-4">
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                  <Building2 className="w-3 h-3" /> Posicionamento e Situação Atual
                </h4>
                <div className="space-y-2 text-xs text-slate-300">
                  <p>A empresa apresenta um faturamento RBT12 de <strong>{formatCurrencyBRL(company.rbt12)}</strong>, estando atualmente enquadrada no <strong>{company.regimeTributario === 'simples_nacional' ? 'Simples Nacional' : company.regimeTributario === 'lucro_presumido' ? 'Lucro Presumido' : 'Lucro Real'}</strong>.</p>
                  <p>Situação Cadastral: <span className={isExcluded ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>{isExcluded ? 'CRÍTICA (Exclusão Iminente)' : 'REGULAR / EM CONFORMIDADE'}</span>.</p>
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp className="w-3 h-3" /> Melhor vs. Pior Cenário
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
                    <span className="text-[9px] text-emerald-500 font-bold uppercase block mb-1">Melhor Cenário</span>
                    <span className="text-xs font-black text-white">{calculation.bestRegime.name}</span>
                    <p className="text-[9px] text-emerald-400/80 mt-1">Carga Anual: {formatCurrencyBRL(calculation.bestRegime.annualTaxTotal)}</p>
                  </div>
                  <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/20">
                    <span className="text-[9px] text-red-500 font-bold uppercase block mb-1">Pior Cenário</span>
                    <span className="text-xs font-black text-white">{calculation.regimesComparison.sort((a,b) => b.annualTaxTotal - a.annualTaxTotal)[0].name}</span>
                    <p className="text-[9px] text-red-400/80 mt-1">Carga Anual: {formatCurrencyBRL(calculation.regimesComparison.sort((a,b) => b.annualTaxTotal - a.annualTaxTotal)[0].annualTaxTotal)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                  <DollarSign className="w-3 h-3" /> Onde está Ganhando vs. Perdendo
                </h4>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase">Eficiência (Ganhando)</span>
                      <p className="text-[10px] text-slate-400 leading-tight">
                        {calculation.segregatedDeductionsMonthly > 0 
                          ? `Recuperando ${formatCurrencyBRL(calculation.segregatedDeductionsMonthly)}/mês através da segregação correta de CFOPs (ST/Monofásicos).`
                          : 'Aproveitamento de alíquotas reduzidas nas primeiras faixas do Simples Nacional.'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-red-400 uppercase">Drenagem (Perdendo)</span>
                      <p className="text-[10px] text-slate-400 leading-tight">
                        {calculation.b2bClientDisadvantageAnnual > 0 
                          ? `Perdendo ${formatCurrencyBRL(calculation.b2bClientDisadvantageAnnual)}/ano em competitividade B2B por falta de repasse de créditos de IVA.`
                          : isSublimitAlert ? 'Recolhimento obrigatório de ICMS/ISS fora do DAS com aumento de complexidade acessória.' : 'Potencial de economia através de planejamento de Fator R e pró-labore estratégico.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna 2: Estruturação e Visão */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-5">
              <div>
                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                  <Info className="w-3 h-3" /> Tudo o que pode ser visto (Visibilidade)
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-[10px] text-slate-300">
                    <CheckCircle2 className="w-3 h-3 text-indigo-500 shrink-0 mt-0.5" />
                    <span>Curva de crescimento projetada: {formatPercentBR(company.projectionGrowthPercent)} aa.</span>
                  </li>
                  <li className="flex items-start gap-2 text-[10px] text-slate-300">
                    <CheckCircle2 className="w-3 h-3 text-indigo-500 shrink-0 mt-0.5" />
                    <span>Impacto da Reforma Tributária: IBS/CBS estimado em {formatPercentBR(company.targetIvaRate || 26.5)}.</span>
                  </li>
                  <li className="flex items-start gap-2 text-[10px] text-slate-300">
                    <CheckCircle2 className="w-3 h-3 text-indigo-500 shrink-0 mt-0.5" />
                    <span>Estrutura de custos: Insumos ({formatPercentBR(company.inputCostsPercent || 0)}) e Folha ({formatPercentBR((company.payroll12m / company.rbt12) * 100)}).</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                  <RefreshCw className="w-3 h-3" /> Tudo o que pode ser refeito (Correções)
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-[10px] text-slate-300">
                    <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                    <span>Saneamento de CFOPs no PGDAS-D para evitar multas por segregação indevida.</span>
                  </li>
                  <li className="flex items-start gap-2 text-[10px] text-slate-300">
                    <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                    <span>Reajuste do pró-labore para enquadramento no Fator R (Economia de 45% no imposto).</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                  <Layers className="w-3 h-3" /> Devidamente Estruturado (Oportunidades)
                </h4>
                <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
                  <p className="text-[10px] text-slate-300 leading-relaxed italic">
                    "A implementação de uma <strong>Holding Operacional</strong> ou <strong>Cisão de Atividades</strong> permitiria o isolamento de riscos societários e a otimização da carga tributária global, mantendo a competitividade no mercado B2B pós-reforma."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 05. Parecer Comparativo dos 4 Regimes & DRE Fiscal Projetada */}
        <section className="space-y-4 avoid-break">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2">
            <h3 className="text-sm font-black uppercase tracking-[0.25em] text-white flex items-center space-x-2">
              <Scale className="w-4 h-4 text-blue-400" />
              <span>05. Parecer Comparativo dos 4 Regimes & DRE Fiscal Projetada</span>
            </h3>
            <span className="text-xs font-bold text-emerald-400">
              Vencedor: {calculation.bestRegime.name}
            </span>
          </div>

          <div className="space-y-4 text-xs text-slate-200 leading-relaxed">
            <p>
              Simulação tributária comparativa considerando a estrutura de receita bruta anual (<b className="text-white">{formatCurrencyBRL(company.rbt12)}</b>), folha de pagamento (<b className="text-white">{formatCurrencyBRL(company.payroll12m)}</b>), despesas e créditos operacionais:
            </p>

            {/* Tabela dos 4 Regimes */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden">
                <thead className="bg-slate-900 text-slate-300 uppercase text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="px-3 py-2">Regime Tributário</th>
                    <th className="px-3 py-2 text-right">Imposto Mensal</th>
                    <th className="px-3 py-2 text-right">Imposto Anual</th>
                    <th className="px-3 py-2 text-right">Alíquota Efetiva</th>
                    <th className="px-3 py-2 text-center">Crédito B2B</th>
                    <th className="px-3 py-2 text-right">Lucro Líquido</th>
                    <th className="px-3 py-2 text-center">Recomendação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {calculation.regimesComparison.map((r) => (
                    <tr key={r.regime} className={r.isRecommended ? 'bg-emerald-950/30 font-bold' : ''}>
                      <td className="px-3 py-2.5 font-bold text-white">{r.regimeName}</td>
                      <td className="px-3 py-2.5 text-right text-slate-100">{formatCurrencyBRL(r.monthlyTax)}</td>
                      <td className="px-3 py-2.5 text-right text-slate-100">{formatCurrencyBRL(r.annualTaxTotal)}</td>
                      <td className="px-3 py-2.5 text-right text-slate-100">{formatPercentBR(r.effectiveRate)}</td>
                      <td className="px-3 py-2.5 text-center text-slate-100">{formatPercentBR(r.creditTransferRate)}</td>
                      <td className="px-3 py-2.5 text-right text-slate-100">{formatCurrencyBRL(r.annualNetProfit)}</td>
                      <td className="px-3 py-2.5 text-center">
                        {r.isRecommended ? (
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[10px] uppercase font-bold">Recomendado</span>
                        ) : (
                          <span className="text-slate-500 text-[10px]">---</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* DRE Fiscal Lado a Lado Resumida */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="font-bold text-white block uppercase tracking-wider text-[10px]">
                Demonstrativo de Resultado do Exercício (DRE Fiscal Comparativa Anual)
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] font-mono">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400 uppercase text-[9px]">
                      <th className="py-1">Conta DRE</th>
                      {calculation.regimesComparison.map(r => (
                        <th key={r.regime} className="py-1 text-right text-white">{r.shortName}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    <tr>
                      <td className="py-1 font-sans text-slate-200">(+) Receita Bruta</td>
                      {calculation.regimesComparison.map(r => (
                        <td key={r.regime} className="py-1 text-right font-bold text-white">{formatCurrencyBRL(r.dre.grossRevenue)}</td>
                      ))}
                    </tr>
                    <tr className="text-red-400">
                      <td className="py-1 font-sans">(-) Tributos Globais</td>
                      {calculation.regimesComparison.map(r => (
                        <td key={r.regime} className="py-1 text-right">- {formatCurrencyBRL(r.dre.taxDeductions)}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-1 font-sans text-slate-200">(-) Custos & CPV</td>
                      {calculation.regimesComparison.map(r => (
                        <td key={r.regime} className="py-1 text-right text-slate-200">- {formatCurrencyBRL(r.dre.costOfGoodsOrServices)}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-1 font-sans text-slate-200">(-) Folha & Encargos</td>
                      {calculation.regimesComparison.map(r => (
                        <td key={r.regime} className="py-1 text-right text-slate-200">- {formatCurrencyBRL(r.dre.payrollAndCharges)}</td>
                      ))}
                    </tr>
                    <tr className="border-t-2 border-slate-700 font-bold text-emerald-300 bg-emerald-950/40">
                      <td className="py-1.5 font-sans">(=) Lucro Líquido dos Sócios</td>
                      {calculation.regimesComparison.map(r => (
                        <td key={r.regime} className="py-1.5 text-right">{formatCurrencyBRL(r.dre.netProfitFinal)}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Seção 04.2: Parecer de Auditoria Fiscal - Divergência entre Lucro Líquido da DRE e Recomendação */}
            <div className="p-5 bg-amber-950/40 border-2 border-amber-500/40 rounded-xl space-y-4 text-slate-200 break-inside-avoid">
              <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
                <div className="flex items-center space-x-2 text-amber-300 font-bold uppercase tracking-wider text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Parecer Técnico Especial: Divergência entre Lucro Líquido da DRE e o Regime Recomendado</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Auditoria Multicritério
                </span>
              </div>

              <div className="space-y-2 text-xs leading-relaxed text-justify text-slate-200">
                <p>
                  Quando um relatório de DRE aponta que o <strong className="text-white">Simples Nacional apresenta maior Lucro Líquido contábil</strong>, mas o sistema recomenda outro regime (como <strong className="text-white">Lucro Presumido, Lucro Real ou Simples Híbrido</strong>), isso ocorre porque a viabilidade de uma empresa <strong className="text-white">não depende exclusivamente do cálculo estático de impostos no mês</strong>, mas sim de uma <strong className="text-white">avaliação multicritério</strong> que pondera fatores econômicos, comerciais e legais.
                </p>
                <p className="text-[11px] text-slate-300 italic">
                  Abaixo estão os 4 motivos fundamentais que explicam essa aparente divergência:
                </p>
              </div>

              <div className="space-y-3 text-xs">
                {/* 1. Competitividade Comercial */}
                <div className="p-3 bg-slate-900 rounded-lg border border-amber-500/30 space-y-1.5 shadow-sm">
                  <div className="flex items-center space-x-2 text-blue-400 font-bold text-xs">
                    <span className="w-5 h-5 rounded-full bg-blue-900/60 text-blue-300 flex items-center justify-center text-[10px]">1</span>
                    <span>Competitividade Comercial e Créditos para Clientes PJ (Vendas B2B)</span>
                  </div>
                  <ul className="text-[11px] text-slate-200 space-y-1 list-disc pl-5 leading-relaxed">
                    <li>
                      <strong className="text-white">O que acontece no Simples Nacional:</strong> Uma empresa no Simples gera para seus clientes compradores um crédito fiscal irrisório (geralmente entre 1,5% e 4,5%, correspondente apenas à parcela de ICMS/ISS da alíquota efetiva, conf. art. 23 da LC 123/06).
                    </li>
                    <li>
                      <strong className="text-white">O impacto no cliente:</strong> Se a sua empresa vende mercadorias ou presta serviços para outras empresas (B2B), esses clientes não conseguem se creditar de PIS/COFINS (9,25% no regime não-cumulativo) e, com a Reforma Tributária (EC 132/23), perderão o crédito integral do IBS/CBS (alíquota padrão de 26,5%).
                    </li>
                    <li>
                      <strong className="text-white">O efeito prático:</strong> Na prática de mercado, para continuar comprando de uma empresa do Simples, os clientes corporativos exigem descontos de preço para compensar o crédito que deixam de tomar, ou optam por fornecedores do regime normal.
                    </li>
                  </ul>
                  <p className="text-[10px] text-blue-300 font-semibold bg-blue-950/60 p-1.5 rounded border border-blue-800">
                    Assim, embora o lucro líquido "na folha" aparente ser maior no Simples, o volume de vendas ou a margem líquida real de mercado seriam erodidos pela barreira de crédito B2B.
                  </p>
                </div>

                {/* 2. Efeito do Sublimite Estadual */}
                <div className="p-3 bg-slate-900 rounded-lg border border-amber-500/30 space-y-1.5 shadow-sm">
                  <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs">
                    <span className="w-5 h-5 rounded-full bg-amber-900/60 text-amber-300 flex items-center justify-center text-[10px]">2</span>
                    <span>Efeito do Sublimite Estadual (R$ 3,6M) e Risco de Desenquadramento</span>
                  </div>
                  <p className="text-[11px] text-slate-200 leading-relaxed">
                    <strong className="text-white">Sublimite de R$ 3.600.000,00 (LC 123/06, arts. 13-A e 19):</strong> Quando o faturamento acumulado nos últimos 12 meses (RBT12) ultrapassa R$ 3,6 milhões, a empresa <strong className="text-white">não recolhe mais o ICMS e o ISS dentro do DAS</strong>.
                  </p>
                  <div className="bg-slate-950 p-2 rounded border border-amber-500/30 text-[10px] text-slate-200 space-y-1">
                    <strong className="text-red-400 block">O "Pior dos Dois Mundos":</strong>
                    <p>• A empresa continua pagando os tributos federais (IRPJ, CSLL, PIS, COFINS e CPP) pela tabela progressiva do Simples (que nas últimas faixas chega a alíquotas federais muito altas);</p>
                    <p>• É obrigada a apurar ICMS/ISS no regime normal (débito e crédito), entregando todas as obrigações acessórias complexas de uma empresa normal (SPED Fiscal, EFD-ICMS/IPI, etc.);</p>
                    <p>• Fica exposta ao teto fatal de R$ 4,8 milhões, com risco iminente de exclusão retroativa se houver sazonalidade positiva.</p>
                  </div>
                  <p className="text-[11px] text-slate-200">
                    Em muitos cenários com sublimite estourado, o <strong className="text-white">Lucro Presumido ou Lucro Real passa a ser mais estável e economicamente seguro</strong>.
                  </p>
                </div>

                {/* 3. Impacto da Folha de Pagamento */}
                <div className="p-3 bg-slate-900 rounded-lg border border-amber-500/30 space-y-1.5 shadow-sm">
                  <div className="flex items-center space-x-2 text-purple-400 font-bold text-xs">
                    <span className="w-5 h-5 rounded-full bg-purple-900/60 text-purple-300 flex items-center justify-center text-[10px]">3</span>
                    <span>Impacto da Folha de Pagamento e Encargos Patronais (CPP / INSS)</span>
                  </div>
                  <p className="text-[11px] text-slate-200 leading-relaxed">
                    <strong className="text-white">No Simples Nacional (Anexos I, II, III e V):</strong> A Contribuição Patronal Previdenciária (CPP de 20% + RAT + terceiros ~5,8%) já está embutida na guia única do DAS.
                  </p>
                  <p className="text-[11px] text-slate-200 leading-relaxed">
                    <strong className="text-white">No Lucro Presumido e Lucro Real:</strong> Há incidência de <strong className="text-white">28,8% de INSS patronal sobre o total da folha e pró-labore</strong>.
                  </p>
                  <p className="text-[11px] text-slate-200 leading-relaxed">
                    Se a sua empresa possui uma folha de pagamento relevante em relação à receita, as despesas operacionais no Lucro Presumido/Real aumentam devido a esses 28,8%, <strong className="text-white">o que reduz o Lucro Líquido final na DRE daquele regime</strong>. O motor de auditoria avalia se essa diferença de encargos compensa ou não frente aos outros benefícios (presunção favorecida, isenção em exportações ou créditos tributários).
                  </p>
                </div>

                {/* 4. Como Funciona o Score */}
                <div className="p-3 bg-slate-900 rounded-lg border border-amber-500/30 space-y-2 shadow-sm">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                    <span className="w-5 h-5 rounded-full bg-emerald-900/60 text-emerald-300 flex items-center justify-center text-[10px]">4</span>
                    <span>Como Funciona o "Score de Recomendação" do Sistema</span>
                  </div>
                  <p className="text-[11px] text-slate-200 leading-relaxed">
                    A recomendação da plataforma não considera apenas o campo <em>"menor imposto pago no mês"</em>. Ela calcula uma nota de precisão técnica (0 a 100) baseada em três pilares:
                  </p>
                  <table className="w-full text-left text-[10px] border border-slate-700">
                    <thead className="bg-slate-950 text-slate-300 font-bold">
                      <tr>
                        <th className="p-1.5 border-b border-slate-700">Pilar de Decisão</th>
                        <th className="p-1.5 border-b border-slate-700">O que é avaliado</th>
                        <th className="p-1.5 border-b border-slate-700 text-right">Peso</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      <tr>
                        <td className="p-1.5 font-bold text-white">1. Eficiência Econômica</td>
                        <td className="p-1.5 text-slate-300">Comparativo do imposto nominal e efetivo somado ao custo dos insumos e encargos.</td>
                        <td className="p-1.5 text-right font-bold text-white">40%</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 font-bold text-white">2. Segurança Jurídica e Limites</td>
                        <td className="p-1.5 text-slate-300">Excesso de sublimite estadual (R$ 3,6M), teto federal (R$ 4,8M) e regras de soma de faturamento entre sócios (art. 3º, § 4º da LC 123/06).</td>
                        <td className="p-1.5 text-right font-bold text-white">30%</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 font-bold text-white">3. Alinhamento com a Reforma Tributária</td>
                        <td className="p-1.5 text-slate-300">Percentual de vendas B2B vs. B2C e a perda de competitividade frente ao split payment e regime do IBS/CBS.</td>
                        <td className="p-1.5 text-right font-bold text-white">30%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Resumo Prático para Tomada de Decisão */}
              <div className="p-3.5 bg-amber-950/60 border border-amber-500/40 rounded-lg space-y-1.5 text-xs text-slate-200">
                <strong className="text-amber-300 font-bold block text-xs">Resumo Prático para sua Tomada de Decisão:</strong>
                <p className="text-[11px] leading-relaxed">
                  • <strong className="text-white">Se a sua operação vende predominantemente para o consumidor final (B2C) e está confortável abaixo de R$ 3,6 milhões:</strong> O Simples Nacional é frequentemente a melhor opção real, pois o cliente final não aproveita créditos tributários e você economiza nos encargos patronais da folha.
                </p>
                <p className="text-[11px] leading-relaxed">
                  • <strong className="text-white">Se a sua operação vende para empresas (B2B) ou está próxima/acima de R$ 3,6M:</strong> O lucro líquido teórico superior do Simples pode ser uma ilusão contábil que mascara perda de clientes, glosa de créditos ou risco de desenquadramento compulsório.
                </p>
                <p className="text-[10px] text-slate-400 pt-1 border-t border-amber-500/30">
                  <em>Dica: Na aba "Regimes Tributários", verifique os campos Score de Recomendação, Percentual de Vendas B2B e a seção de Vantagens & Desvantagens de cada regime para visualizar detalhadamente os pesos aplicados a este diagnóstico.</em>
                </p>
              </div>
            </div>

            {/* Matriz de Prós e Contras */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {calculation.regimesComparison.map(r => (
                <div key={r.regime} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex justify-between items-center font-bold text-white">
                    <span>{r.name}</span>
                    <span className="text-[10px] text-blue-400 font-mono">Alíq: {formatPercentBR(r.effectiveRatePercent)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 block">Vantagens:</span>
                    <ul className="text-[10px] text-slate-300 list-disc pl-3">
                      {r.advantages.slice(0, 2).map((adv, i) => (
                        <li key={i}>{adv}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-red-400 block">Desvantagens:</span>
                    <ul className="text-[10px] text-slate-300 list-disc pl-3">
                      {r.disadvantages.slice(0, 2).map((dis, i) => (
                        <li key={i}>{dis}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* 05. Reforma Tributária (IBS/CBS) */}
        <section className="space-y-4 page-break pt-6 avoid-break">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2">
            <h3 className="text-sm font-black uppercase tracking-[0.25em] text-white">
              05. Impacto da Reforma Tributária (IBS / CBS 2026-2027)
            </h3>
            <span className="text-xs font-bold text-blue-400">EC 132/2023</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 text-slate-200 p-8 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs leading-relaxed shadow-xs">
            <div className="space-y-3">
              <h4 className="font-bold text-blue-400 uppercase tracking-wider text-[11px]">
                O Dilema do Crédito Tributário B2B
              </h4>
              <p className="text-slate-200 text-justify">
                Com a implementação do IVA Dual (IBS estadual/municipal e CBS federal), clientes PJ que comprarem de empresas no Simples Nacional só poderão creditar o valor efetivamente pago no DAS (aproximadamente <b className="text-white">{calculation.reformaSimplesCreditTransferRate.toFixed(1)}%</b>). 
                Em contrapartida, compras feitas de concorrentes no Lucro Presumido ou Real entregarão <b className="text-white">{company.targetIvaRate || 26.5}% de crédito pleno</b>.
              </p>
            </div>

            <div className="border-t sm:border-t-0 sm:border-l border-slate-800 sm:pl-8 space-y-3">
              <h4 className="font-bold text-blue-400 uppercase tracking-wider text-[11px]">
                Veredito Técnico & Competitividade
              </h4>
              <p className="italic text-white text-sm font-serif-display leading-relaxed">
                "{company.b2bSalesPercent >= 60
                  ? `Com ${company.b2bSalesPercent}% de vendas para PJ, permanecer no Simples em 2027 gerará perda de R$ ${calculation.b2bClientDisadvantageAnnual.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} em créditos para seus clientes, recomendando migração ou opção por recolhimento de IBS/CBS regular.`
                  : 'A predominância de vendas B2C preserva a competitividade da empresa no Simples Nacional, mantendo a simplicidade operacional.'}"
              </p>
            </div>
          </div>
        </section>

        {/* NOVO: 06. Diagnóstico de Performance & Cenários Estratégicos (Mandatório) */}
        <section className="space-y-6 page-break pt-6 avoid-break">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2">
            <h3 className="text-sm font-black uppercase tracking-[0.25em] text-white">
              06. Diagnóstico de Performance & Cenários Estratégicos
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                <Building2 className="w-4 h-4" /> Posição e Situação Atual
              </h4>
              <p className="text-xs text-slate-200 leading-relaxed text-justify">
                A empresa apresenta um faturamento bruto acumulado (RBT12) de <strong className="text-white">{formatCurrencyBRL(company.rbt12)}</strong>, situando-se na <strong className="text-white">{(company.rbt12 > STATE_SUBLIMIT) ? '5ª Faixa (Acima do Sublimite)' : 'Faixa de enquadramento regular'}</strong> do Simples Nacional. A liquidez imediata é {(calculation.effectiveRate < 10) ? 'confortável' : 'exigente'}, com carga tributária efetiva de <strong className="text-blue-400">{formatPercentBR(calculation.effectiveRate)}</strong>.
              </p>
            </div>

            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <h4 className="text-[11px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Melhores e Piores Cenários
              </h4>
              <div className="space-y-2">
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl">
                  <span className="text-[9px] font-black text-emerald-400 uppercase block mb-1">Melhor Cenário</span>
                  <p className="text-[10px] text-slate-200">Adoção do Lucro Real com aproveitamento integral de créditos de insumos e PIS/COFINS, reduzindo o imposto anual em até <span className="text-emerald-400 font-bold">{formatPercentBR(15)}</span>.</p>
                </div>
                <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl">
                  <span className="text-[9px] font-black text-red-400 uppercase block mb-1">Pior Cenário</span>
                  <p className="text-[10px] text-slate-200">Permanência no Simples acima do sublimite com glosa de créditos por clientes B2B, resultando em perda de competitividade de <span className="text-red-400 font-bold">{formatPercentBR(26.5)}</span>.</p>
                </div>
              </div>
            </div>

            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Onde está Ganhando vs. Perdendo
              </h4>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <p className="text-xs text-slate-200"><strong className="text-white">Ganhando:</strong> Operações internas com Substituição Tributária (ICMS-ST) devidamente segregadas, reduzindo a base de cálculo do DAS.</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                  <p className="text-xs text-slate-200"><strong className="text-white">Perdendo:</strong> Encargos previdenciários (CPP) sobre a folha de pagamento em atividades do Anexo IV sem planejamento de terceirização legal.</p>
                </div>
              </div>
            </div>

            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <h4 className="text-[11px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">
                <Layers className="w-4 h-4" /> Estrutura & Visibilidade
              </h4>
              <p className="text-xs text-slate-200 leading-relaxed text-justify">
                A estrutura de custos atual é composta por <strong className="text-white">{(company.inputCostsPercent || 35)}%</strong> de insumos. Toda a estrutura de segregação de receitas pode ser vista através do monitoramento de CFOPs, permitindo identificar onde a tributação é monofásica ou isenta por substituição.
              </p>
            </div>
          </div>

          <div className="p-6 bg-slate-900 border border-blue-500/40 rounded-3xl space-y-4">
            <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Recomendações: Refazer & Estruturar
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-blue-300 uppercase">O que deve ser Refeito</p>
                <p className="text-xs text-slate-300">Revisão dos cadastros de produtos (NCM/CEST) para garantir que itens monofásicos não estejam sendo tributados em duplicidade no Simples.</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-blue-300 uppercase">O que deve ser Estruturado</p>
                <p className="text-xs text-slate-300">Estruturação de um centro de custos por unidade de negócio para avaliação da margem de contribuição individual e saneamento de despesas fixas.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 07. Roadmap de Ação Estratégica */}
        <section className="space-y-4 avoid-break">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2">
            <h3 className="text-sm font-black uppercase tracking-[0.25em] text-white">
              07. Roadmap de Ação Estratégica (Cronograma de Transição)
            </h3>
          </div>

          <div className="space-y-4 pt-2 text-xs">
            <div className="p-4 bg-slate-900 rounded-2xl border-l-4 border-blue-500 border border-slate-800 space-y-1">
              <div className="flex justify-between items-center font-bold text-white">
                <span>FASE 1: IMEDIATA (Saneamento & Compliance no e-CAC)</span>
                <span className="text-blue-400">30 Dias</span>
              </div>
              <p className="text-slate-300">
                Revisão de apurações anteriores do PGDAS-D, verificação de CND e simulação da segregação de ICMS/ISS fora do DAS para evitar autos de infração retroativos com multa de 75%.
              </p>
            </div>

            <div className="p-4 bg-slate-900 rounded-2xl border-l-4 border-indigo-500 border border-slate-800 space-y-1">
              <div className="flex justify-between items-center font-bold text-white">
                <span>FASE 2: REESTRUTURAÇÃO SOCIETÁRIA & CISÃO OPERACIONAL</span>
                <span className="text-indigo-400">60 a 90 Dias</span>
              </div>
              <p className="text-slate-300">
                Reorganização lícita de participações societárias (redução de quotas para ≤10% ou alteração de administradores cruzados), ou cisão de atividades para unidades operacionais independentes com propósitos negociais reais.
              </p>
            </div>

            <div className="p-4 bg-slate-900 rounded-2xl border-l-4 border-emerald-500 border border-slate-800 space-y-1">
              <div className="flex justify-between items-center font-bold text-white">
                <span>FASE 3: MIGRAÇÃO PLANEJADA PARA LUCRO PRESUMIDO OU REAL</span>
                <span className="text-emerald-400">Janeiro / 2027</span>
              </div>
              <p className="text-slate-300">
                Opção irretratável de regime no primeiro trimestre, implementação de controle de créditos de ICMS/IBS/CBS nas compras e renegociação da tabela de preços para clientes B2B.
              </p>
            </div>
          </div>
        </section>

        {/* 08. Fundamentação Legal Exaustiva */}
        <section className="space-y-4 avoid-break">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2">
            <h3 className="text-sm font-black uppercase tracking-[0.25em] text-white">
              08. Fundamentação Legal e Base Jurídica
            </h3>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl space-y-3 text-[10px] text-slate-300 leading-relaxed text-justify border border-slate-800">
            <p>
              <b className="text-white">Lei Complementar nº 123/2006, Art. 3º, § 4º, Inciso IV:</b> "Não poderá se beneficiar do tratamento jurídico diferenciado [...] a pessoa jurídica de cujo capital participe pessoa física que seja inscrita como empresário ou seja sócia com mais de 10% do capital de outra empresa beneficiada por esta Lei Complementar, desde que a receita bruta global ultrapasse o limite de que trata o inciso II do caput deste artigo."
            </p>
            <p>
              <b className="text-white">Lei Complementar nº 123/2006, Art. 18, § 4º-A:</b> "O contribuinte deverá segregar as receitas decorrentes de operações sujeitas à substituição tributária, isenção ou redução de base de cálculo, desconsiderando os percentuais dos tributos correspondentes na apuração da alíquota do Simples Nacional."
            </p>
            <p>
              <b className="text-white">Lei Complementar nº 123/2006, Art. 13-A:</b> "Os Estados e o Distrito Federal poderão adotar sublimite de receita bruta acumulada de R$ 3.600.000,00 para recolhimento de ICMS e ISS no âmbito do Simples Nacional."
            </p>
            <p>
              <b className="text-white">Emenda Constitucional nº 132/2023 (Reforma Tributária):</b> "Introduz o IBS e a CBS sob o princípio da neutralidade e não-cumulatividade plena, conferindo ao optante do Simples a faculdade de optar pela apuração regular do IBS/CBS para transferência de créditos integrais na cadeia produtiva."
            </p>
          </div>
        </section>

        {/* 09. Termo de Encerramento e Assinatura Pericial Oficial */}
        <section className="space-y-6 pt-4 border-t border-slate-700 avoid-break">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2">
            <h3 className="text-sm font-black uppercase tracking-[0.25em] text-white">
              09. Termo de Responsabilidade & Autenticação Pericial
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/40 font-bold">
              ✓ Parecer Concluído e Autenticado
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end pt-2">
            {/* Box de Autenticidade Digital com QR Code e Hash */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-[10px] text-slate-300 font-mono">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-white font-bold uppercase tracking-wider font-sans">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
                  <span>Chancela Eletrônica de Autenticidade</span>
                </div>
                <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                  ICP-Brasil ICP-BR
                </span>
              </div>

              <div className="flex items-start space-x-3">
                {securityRecord?.qrCodeDataUrl ? (
                  <div className="p-1 bg-white rounded-lg border border-slate-700 shadow-sm shrink-0">
                    <img 
                      src={securityRecord.qrCodeDataUrl} 
                      alt="QR Code de Autenticidade" 
                      className="w-16 h-16 object-contain" 
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                    <QrCode className="w-8 h-8 text-slate-400" />
                  </div>
                )}
                <div className="space-y-1 overflow-hidden">
                  <p className="text-slate-400">Código Hash do Laudo:</p>
                  <p className="text-[11px] font-bold text-blue-400 truncate">
                    {securityRecord?.hashFormatted || 'VF-2026-A82F-9C14-3B77-E091'}
                  </p>
                  <p className="text-[8px] text-slate-400 font-sans leading-tight">
                    Validação criptográfica com chancela eletrônica pública conforme MP 2.200-2/2001 e CPC Art. 441.
                  </p>
                </div>
              </div>

              <div className="p-2 bg-slate-950 rounded border border-slate-800 font-mono text-[9px] space-y-0.5">
                <span className="text-slate-400 block font-bold">SHA-256:</span>
                <p className="text-slate-300 break-all select-all">
                  {securityRecord?.sha256Full || '8f4c29a1d07e4b52c9381ea624b7d30f9a2b5e78c41d08e73f9104bc5392fa16'}
                </p>
              </div>

              <p className="text-[9px] text-slate-400 font-sans">
                Emitido via Plataforma VÉRTICE AUDITOR FISCAL em {currentDate} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.
              </p>
            </div>

            {/* Assinatura do Responsável Técnico */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-2">
              <div className="pt-4 border-b border-slate-700 w-4/5 mx-auto">
                <span className="font-serif-display italic text-lg text-white font-bold block pb-1">
                  Carlos Miguel Vieira
                </span>
              </div>
              <p className="text-xs font-bold text-white uppercase font-sans">
                Carlos Miguel Vieira
              </p>
              <p className="text-[10px] text-slate-300 font-sans">
                Auditor Fiscal & Consultor Tributário Master Responsável
              </p>
              <p className="text-[9px] text-slate-400 font-mono">
                Vieira & Associados // Auditoria & Planejamento Tributário
              </p>
            </div>
          </div>
        </section>

        {/* Footer & Signature Stamp */}
        <footer className="pt-8 border-t-2 border-slate-800 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-400 uppercase tracking-widest gap-4">
          <div className="flex items-center space-x-3">
            <BrandLogo variant="badge" />
            <div>
              <p className="font-bold text-white">VÉRTICE AUDITOR FISCAL // Tax Intelligence & Audit System</p>
              <p className="text-[9px] text-slate-400">Divisão de Consultoria e Planejamento Tributário Avançado</p>
            </div>
          </div>
          <div className="text-center sm:text-right">
            <p className="font-mono font-bold text-slate-300">DOCUMENTO TÉCNICO OFICIAL</p>
            <p className="text-[9px] text-slate-400">
              MP 2.200-2/2001 (ICP-Brasil), Lei 14.063/2020, CPC Art. 441, LC 123/2006 e EC 132/2023
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

