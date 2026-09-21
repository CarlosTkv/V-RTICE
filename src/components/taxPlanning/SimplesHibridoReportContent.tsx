import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  Scale, 
  Award, 
  DollarSign, 
  Briefcase, 
  TrendingUp, 
  AlertTriangle, 
  Layers, 
  ShoppingBag, 
  Users, 
  CheckCircle2, 
  Building2, 
  Calendar, 
  Sparkles,
  Percent,
  TrendingDown,
  Calculator,
  ArrowRight,
  ShieldAlert,
  Clock,
  Check,
  Columns
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid,
  Cell 
} from 'recharts';
import { CompanyData, CalculationResult, AuthUser } from '../../types';
import { SimplesHibridoResult } from '../../utils/simplesHibridoEngine';
import { formatCurrencyBRL, formatPercentBR } from '../../utils/taxRules';
import { BrandLogo } from '../BrandLogo';
import { generateDocumentSecurity, VerifiedDocumentRecord } from '../../utils/documentSecurity';
import { SimplesHibridoReportMode } from './SimplesHibridoReportModal';
import { getReportSignatoryInfo } from '../../utils/reportSignatoryUtils';
import { AuthService } from '../../utils/authService';

interface SimplesHibridoReportContentProps {
  company: CompanyData;
  calculation: CalculationResult;
  comparisonResult: SimplesHibridoResult;
  viewLayout?: 'vertical' | 'horizontal';
  reportMode?: SimplesHibridoReportMode;
  currentUser?: AuthUser | null;
}

export const SimplesHibridoReportContent: React.FC<SimplesHibridoReportContentProps> = ({
  company,
  calculation,
  comparisonResult,
  viewLayout = 'vertical',
  reportMode = 'parecer_unificado',
  currentUser
}) => {
  const [securityRecord, setSecurityRecord] = useState<VerifiedDocumentRecord | null>(null);

  const activeUser = currentUser || AuthService.getStoredSession();
  const signatoryInfo = getReportSignatoryInfo(activeUser, securityRecord);

  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const {
    rbt12 = company.rbt12 || 1200000,
    monthlyRevenue = company.monthlyRevenue || 100000,
    nominalRate = 0,
    deduction = 0,
    effectiveAnexo,
    standardEffectiveRate = 0,
    reducedDasRate = 0,
    reducedDasMonthly = 0,
    reducedDasAnnual = 0,
    partition,
    cenarioA_Financeiro,
    cenarioB_Comercial,
    sensitivityAndBreakEven,
    technicalOpinion,
    trava01Sublimite,
    trava02FatorR,
    trava03CreditoEntrada,
  } = comparisonResult || {};

  const targetIvaRate = cenarioB_Comercial?.hibridoB2bCreditRate || 26.5;

  useEffect(() => {
    let isMounted = true;
    generateDocumentSecurity({
      title: 'Parecer Pericial de Viabilidade • Simples Híbrido & Reforma Tributária',
      companyName: company.name,
      cnpj: company.cnpj,
      uf: company.uf,
      rbt12: company.rbt12,
      bestRegime: technicalOpinion.section3_RecommendationVerdict.verdictShort,
      totalTax: cenarioA_Financeiro.hibridoTotalAnnualTax,
      dateStr: currentDate,
    }).then((rec) => {
      if (isMounted) setSecurityRecord(rec);
    });
    return () => {
      isMounted = false;
    };
  }, [company.cnpj, company.name, company.uf, company.rbt12, currentDate, technicalOpinion, cenarioA_Financeiro.hibridoTotalAnnualTax]);

  // Gráfico Comparativo Anual de Tributos (Tradicional vs Híbrido vs Lucro Presumido vs Lucro Real)
  const regimesAnnualData = [
    {
      name: 'Simples Trad.',
      tributoAnual: Math.round(cenarioA_Financeiro.tradicionalAnnualTax),
      aliquotaEfetiva: Number(cenarioA_Financeiro.tradicionalEffectiveRate.toFixed(2)),
      fill: '#10B981', // Verde esmeralda
    },
    {
      name: 'Simples Híbrido',
      tributoAnual: Math.round(cenarioA_Financeiro.hibridoTotalAnnualTax),
      aliquotaEfetiva: Number(cenarioA_Financeiro.hibridoEffectiveRate.toFixed(2)),
      fill: '#6366F1', // Indigo
    },
    {
      name: 'Lucro Presumido',
      tributoAnual: Math.round(calculation.lucroPresumidoAnnualTax),
      aliquotaEfetiva: Number(calculation.lucroPresumidoEffectiveRate.toFixed(2)),
      fill: '#0284C7', // Azul ciano
    },
    {
      name: 'Lucro Real',
      tributoAnual: Math.round(calculation.lucroRealAnnualTax),
      aliquotaEfetiva: Number(calculation.lucroRealEffectiveRate.toFixed(2)),
      fill: '#D97706', // Âmbar
    },
  ];

  // Gráfico de Crédito B2B Transferido vs Custo Líquido Comprador (Base R$ 1.000)
  const b2bCommercialChartData = [
    {
      name: 'Simples Tradicional',
      creditoGerado: Number((cenarioB_Comercial.tradicionalB2bCreditRate * 10).toFixed(1)),
      custoLiquidoComprador: Number(((100 - cenarioB_Comercial.tradicionalB2bCreditRate) * 10).toFixed(1)),
    },
    {
      name: 'Simples Híbrido',
      creditoGerado: Number((cenarioB_Comercial.hibridoB2bCreditRate * 10).toFixed(1)),
      custoLiquidoComprador: Number(((100 - cenarioB_Comercial.hibridoB2bCreditRate) * 10).toFixed(1)),
    },
  ];

  const isHorizontalView = viewLayout === 'horizontal';

  // =========================================================================
  // MODO 1: RELATÓRIO ESPECÍFICO DE COCKPIT, PARÂMETROS E TRAVAS FISCAIS
  // =========================================================================
  if (reportMode === 'relatorio_cockpit') {
    return (
      <div className="space-y-6 print:space-y-0 text-slate-100 print:text-slate-900">
        <div data-report-page="1" className="report-page p-6 sm:p-7 bg-[#0B0F19] print:bg-white rounded-2xl border border-slate-800 print:border-none shadow-2xl space-y-5" style={{ minHeight: '1020px' }}>
          <header className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-800 print:border-slate-300 pb-3 gap-3">
            <div>
              <BrandLogo variant="report" className="text-white print:text-slate-900 mb-1" />
              <h1 className="text-xl font-serif-display font-bold italic text-white print:text-slate-900">
                Relatório Pericial de Cockpit, Parâmetros e Travas Fiscais
              </h1>
              <p className="text-[10px] font-bold text-indigo-400 print:text-indigo-800 uppercase tracking-widest">
                Módulo Simples Híbrido • Auditoria de Entradas em R$ e Travas
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-white print:text-slate-900 uppercase block">{company.name || 'Empresa'}</span>
              <span className="text-[10px] text-slate-400 print:text-slate-600 font-mono block">CNPJ: {company.cnpj || 'Sem dados'} | Anexo {effectiveAnexo}</span>
              <span className="text-[9px] text-indigo-400 print:text-indigo-800 font-mono block">Emitido em: {currentDate}</span>
            </div>
          </header>

          {/* PARÂMETROS DE ENTRADA EM VALORES REAIS (R$) */}
          <section className="space-y-2">
            <h3 className="text-xs font-bold text-slate-300 print:text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-indigo-400" />
              1. Parâmetros do Cliente em Valores Reais (R$) e Percentuais
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-800 print:border-slate-300">
              <table className="w-full text-[11px] text-left text-slate-300 print:text-slate-800">
                <thead className="bg-slate-800/90 print:bg-slate-100 text-slate-200 print:text-slate-700 uppercase font-bold text-[9.5px]">
                  <tr>
                    <th className="py-2 px-3">Variável Operacional</th>
                    <th className="py-2 px-3">Valor Informado / Calculado</th>
                    <th className="py-2 px-3">Percentual / Enquadramento</th>
                    <th className="py-2 px-3">Impacto Direto na Apuração</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-slate-200">
                  <tr>
                    <td className="py-2 px-3 font-semibold text-white print:text-slate-900">Faturamento Mensal</td>
                    <td className="py-2 px-3 font-mono text-emerald-400 print:text-emerald-700 font-bold">{formatCurrencyBRL(company.monthlyRevenue || monthlyRevenue)}</td>
                    <td className="py-2 px-3 font-mono">100,00% da Receita</td>
                    <td className="py-2 px-3 text-slate-400">Base mensal de incidência do DAS e IBS/CBS</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-white print:text-slate-900">RBT12 Acumulado (12 Meses)</td>
                    <td className="py-2 px-3 font-mono font-bold text-indigo-400 print:text-indigo-700">{formatCurrencyBRL(rbt12)}</td>
                    <td className="py-2 px-3 font-mono">Anexo {effectiveAnexo} • {nominalRate.toFixed(2)}% nom.</td>
                    <td className="py-2 px-3 text-slate-400">Determina a faixa do Simples e alíquota nominal</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-white print:text-slate-900">Alíquota Efetiva Padrão DAS</td>
                    <td className="py-2 px-3 font-mono font-bold text-amber-400 print:text-amber-700">{standardEffectiveRate.toFixed(2)}%</td>
                    <td className="py-2 px-3 font-mono">Parcela a Deducir: {formatCurrencyBRL(deduction)}</td>
                    <td className="py-2 px-3 text-slate-400 font-mono">[(RBT12 × Nominal) - Deducao] / RBT12</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-white print:text-slate-900">Folha de Pagamento + Pró-Labore (12m)</td>
                    <td className="py-2 px-3 font-mono">{formatCurrencyBRL(company.payroll12m || (company.monthlyPayroll ? company.monthlyPayroll * 12 : 0))}</td>
                    <td className="py-2 px-3 font-mono text-indigo-400">Fator R: {trava02FatorR.fatorR.toFixed(1)}%</td>
                    <td className="py-2 px-3 text-slate-400">{trava02FatorR.fatorRActive ? 'Enquadrado no Anexo III (Economia Fator R)' : 'Enquadrado no Anexo V'}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-white print:text-slate-900">Compras de Insumos / Custos</td>
                    <td className="py-2 px-3 font-mono font-bold text-blue-400 print:text-blue-700">{formatCurrencyBRL(trava03CreditoEntrada.totalInputPurchases)}/mês</td>
                    <td className="py-2 px-3 font-mono">{(company.inputCostsPercent ?? sensitivityAndBreakEven.currentInputPercent).toFixed(1)}% da Receita</td>
                    <td className="py-2 px-3 text-slate-400">Gera crédito mensal de IBS/CBS de {formatCurrencyBRL(trava03CreditoEntrada.totalIbsCbsInputCreditMonthly)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-white print:text-slate-900">Fornecedores do Simples Nacional</td>
                    <td className="py-2 px-3 font-mono">{formatCurrencyBRL(trava03CreditoEntrada.simplesSupplierPurchases)}/mês</td>
                    <td className="py-2 px-3 font-mono">{(company.simplesSupplierPercent ?? 40).toFixed(0)}% das Compras</td>
                    <td className="py-2 px-3 text-amber-400 print:text-amber-700">Crédito reduzido de apenas {trava03CreditoEntrada.simplesSupplierCreditRate.toFixed(1)}%</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-white print:text-slate-900">Fornecedores do Regime Geral</td>
                    <td className="py-2 px-3 font-mono">{formatCurrencyBRL(trava03CreditoEntrada.generalSupplierPurchases)}/mês</td>
                    <td className="py-2 px-3 font-mono">{(100 - (company.simplesSupplierPercent ?? 40)).toFixed(0)}% das Compras</td>
                    <td className="py-2 px-3 text-emerald-400 print:text-emerald-700 font-bold">Crédito integral de 26,50%</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-white print:text-slate-900">Vendas B2B Corporativas (PJ)</td>
                    <td className="py-2 px-3 font-mono font-bold text-purple-400 print:text-purple-700">{formatCurrencyBRL(cenarioB_Comercial.b2bRevenueMonthly)}/mês</td>
                    <td className="py-2 px-3 font-mono">{(company.b2bSalesPercent ?? 60).toFixed(0)}% da Receita Total</td>
                    <td className="py-2 px-3 text-slate-400">Transfere +{formatCurrencyBRL(cenarioB_Comercial.hibridoB2bCreditMonthly)}/mês de créditos ao comprador PJ</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* AUDITORIA DAS 3 TRAVAS FISCAIS */}
          <section className="space-y-2">
            <h3 className="text-xs font-bold text-slate-300 print:text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              2. Diagnóstico Pericial das 3 Travas Fiscais Decisórias
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl border bg-slate-900/90 print:bg-slate-50 border-slate-800 print:border-slate-300 space-y-1">
                <div className="flex justify-between items-center font-bold text-white print:text-slate-900">
                  <span>Trava 01: Sublimite R$ 3,6M</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] ${trava01Sublimite.isExceeded ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                    {trava01Sublimite.isExceeded ? 'EXCEDIDO' : 'REGULAR'}
                  </span>
                </div>
                <p className="text-slate-300 print:text-slate-700 text-[11px] leading-snug">
                  {trava01Sublimite.isExceeded 
                    ? `Com RBT12 de ${formatCurrencyBRL(rbt12)}, a empresa excedeu o sublimite estadual. O ICMS/ISS deve ser recolhido por fora compulsoriamente.`
                    : `Com RBT12 de ${formatCurrencyBRL(rbt12)}, a empresa está enquadrada perfeitamente no limite de R$ 3,6 milhões.`}
                </p>
              </div>

              <div className="p-3 rounded-xl border bg-slate-900/90 print:bg-slate-50 border-slate-800 print:border-slate-300 space-y-1">
                <div className="flex justify-between items-center font-bold text-white print:text-slate-900">
                  <span>Trava 02: Fator R (28%)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300">
                    {trava02FatorR.fatorR.toFixed(1)}%
                  </span>
                </div>
                <p className="text-slate-300 print:text-slate-700 text-[11px] leading-snug">
                  {trava02FatorR.isApplicable
                    ? (trava02FatorR.fatorRActive 
                        ? `Fator R ≥ 28%: Atividade tributada no Anexo III (${standardEffectiveRate.toFixed(2)}%), gerando economia sobre o Anexo V.`
                        : `Fator R < 28%: Tributada no Anexo V. Folha necessária para migrar ao Anexo III: ${formatCurrencyBRL(trava02FatorR.payrollNeededForAnexoIII)}/mês.`)
                    : `Atividade com enquadramento fixo no Anexo ${effectiveAnexo}.`}
                </p>
              </div>

              <div className="p-3 rounded-xl border bg-slate-900/90 print:bg-slate-50 border-slate-800 print:border-slate-300 space-y-1">
                <div className="flex justify-between items-center font-bold text-white print:text-slate-900">
                  <span>Trava 03: Crédito de Entradas</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300">
                    {trava03CreditoEntrada.effectiveInputCreditRatePercent.toFixed(1)}% Média
                  </span>
                </div>
                <p className="text-slate-300 print:text-slate-700 text-[11px] leading-snug">
                  Entradas geram crédito mensal de {formatCurrencyBRL(trava03CreditoEntrada.totalIbsCbsInputCreditMonthly)}. Compras de fornecedores do Simples ({trava03CreditoEntrada.simplesSupplierPurchases > 0 ? `${(company.simplesSupplierPercent ?? 40)}%` : '0%'}) geram apenas {trava03CreditoEntrada.simplesSupplierCreditRate.toFixed(1)}% de crédito.
                </p>
              </div>
            </div>
          </section>

          {/* EXPLICAÇÃO DO MOTIVO DO RESULTADO */}
          <section className="p-4 rounded-xl border bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border-indigo-500/40 text-xs text-slate-200 space-y-2">
            <h4 className="font-bold text-indigo-300 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              💡 Análise & Explicação do Motivo do Resultado no Cockpit
            </h4>
            <p className="leading-relaxed">
              <strong>Motivo do Resultado no Caixa Interno:</strong> O resultado do confronto direto aponta um desembolso no Simples Tradicional de <strong>{formatCurrencyBRL(cenarioA_Financeiro.tradicionalMonthlyTax)}/mês</strong> ({cenarioA_Financeiro.tradicionalEffectiveRate.toFixed(2)}%) contra <strong>{formatCurrencyBRL(cenarioA_Financeiro.hibridoTotalMonthlyTax)}/mês</strong> ({cenarioA_Financeiro.hibridoEffectiveRate.toFixed(2)}%) no Simples Híbrido, gerando um delta de <strong>{formatCurrencyBRL(cenarioA_Financeiro.monthlyDelta)}/mês</strong>.
            </p>
            <p className="leading-relaxed">
              <strong>Por que ocorre essa variação?</strong> A variação é motivada principalmente pelo volume de insumos geradores de crédito ({formatCurrencyBRL(trava03CreditoEntrada.totalInputPurchases)}/mês) e pelo percentual de fornecedores no Regime Geral ({100 - (company.simplesSupplierPercent ?? 40)}%). Quanto maior o volume de insumos comprados com alíquota cheia de 26,50%, menor torna-se o imposto líquido a pagar no IBS/CBS do Simples Híbrido.
            </p>
          </section>

          <footer className="pt-3 border-t border-slate-800 print:border-slate-300 flex justify-between text-[10px] text-slate-500 font-mono">
            <span>Sistema Vértice Auditor Fiscal v3.8 • Dossiê Pericial de Viabilidade</span>
            <span>Relatório do Cockpit & Travas • Página 1 de 1</span>
          </footer>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MODO 2: RELATÓRIO ESPECÍFICO DE ANÁLISES GRÁFICAS & BREAK-EVEN
  // =========================================================================
  if (reportMode === 'relatorio_graficos') {
    return (
      <div className="space-y-6 print:space-y-0 text-slate-100 print:text-slate-900">
        <div data-report-page="1" className="report-page p-6 sm:p-7 bg-[#0B0F19] print:bg-white rounded-2xl border border-slate-800 print:border-none shadow-2xl space-y-5" style={{ minHeight: '1020px' }}>
          <header className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-800 print:border-slate-300 pb-3 gap-3">
            <div>
              <BrandLogo variant="report" className="text-white print:text-slate-900 mb-1" />
              <h1 className="text-xl font-serif-display font-bold italic text-white print:text-slate-900">
                Relatório de Análise Gráfica, Break-Even & Repasse B2B
              </h1>
              <p className="text-[10px] font-bold text-indigo-400 print:text-indigo-800 uppercase tracking-widest">
                Módulo Simples Híbrido • Análise Visual e Curvas de Sensibilidade
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-white print:text-slate-900 uppercase block">{company.name || 'Empresa'}</span>
              <span className="text-[10px] text-slate-400 print:text-slate-600 font-mono block">CNPJ: {company.cnpj || 'Sem dados'} | Anexo {effectiveAnexo}</span>
              <span className="text-[9px] text-indigo-400 print:text-indigo-800 font-mono block">Emitido em: {currentDate}</span>
            </div>
          </header>

          {/* GRÁFICOS LADO A LADO */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gráfico 1: 4 Regimes */}
            <div className="p-3 rounded-xl border bg-slate-900/90 print:bg-slate-50 border-slate-800 print:border-slate-300 space-y-2">
              <h4 className="text-xs font-bold text-white print:text-slate-900 uppercase">1. Carga Anual nos 4 Regimes Tributários</h4>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regimesAnnualData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.35} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={9} tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }} formatter={(val: number) => [formatCurrencyBRL(val), 'Tributo Anual']} />
                    <Bar dataKey="tributoAnual" radius={[4, 4, 0, 0]}>
                      {regimesAnnualData.map((entry, index) => (
                        <Cell key={`c1-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-4 gap-1 text-[9px] text-center border-t border-slate-800 pt-1">
                {regimesAnnualData.map((r, i) => (
                  <div key={i}>
                    <div className="text-slate-400 truncate">{r.name}</div>
                    <div className="font-bold text-white font-mono">{r.aliquotaEfetiva}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gráfico 2: Repasse de Crédito B2B */}
            <div className="p-3 rounded-xl border bg-slate-900/90 print:bg-slate-50 border-slate-800 print:border-slate-300 space-y-2">
              <h4 className="text-xs font-bold text-white print:text-slate-900 uppercase">2. Crédito B2B Gerado por R$ 1.000 Vendidos</h4>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={b2bCommercialChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.35} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={9} tickFormatter={(v) => `R$${v}`} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }} formatter={(val: number) => [formatCurrencyBRL(val), 'Valor']} />
                    <Bar dataKey="creditoGerado" name="Crédito ao Comprador" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="custoLiquidoComprador" name="Custo Líquido Comprador" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-slate-400 text-center border-t border-slate-800 pt-1">
                No Híbrido, cada R$ 1.000 vendidos a clientes PJ geram R$ {b2bCommercialChartData[1].creditoGerado.toFixed(0)} de crédito fiscal integral.
              </p>
            </div>
          </section>

          {/* DADOS NUMÉRICOS DO BREAK-EVEN */}
          <section className="p-4 rounded-xl border bg-slate-900/90 print:bg-slate-50 border-slate-800 print:border-slate-300 space-y-2">
            <h4 className="text-xs font-bold text-white print:text-slate-900 uppercase flex items-center justify-between">
              <span>Ponto de Equilíbrio (Break-Even) de Compras de Insumos</span>
              <span className="text-emerald-400 font-mono text-sm">Break-Even: {sensitivityAndBreakEven.inputBreakEvenPercent.toFixed(1)}% ({formatCurrencyBRL((company.monthlyRevenue || monthlyRevenue) * (sensitivityAndBreakEven.inputBreakEvenPercent / 100))}/mês)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950/60 print:bg-white border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Insumos Atuais do Cliente</span>
                <span className="font-bold text-white font-mono text-sm">{sensitivityAndBreakEven.currentInputPercent.toFixed(1)}% ({formatCurrencyBRL(trava03CreditoEntrada.totalInputPurchases)}/mês)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 print:bg-white border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Cenário sem Insumos (0% Compras)</span>
                <span className="font-bold text-rose-400 font-mono text-sm">{sensitivityAndBreakEven.noInputPurchasesEffectiveRate.toFixed(1)}% (+{formatCurrencyBRL(sensitivityAndBreakEven.noInputPurchasesTaxDifferenceMonthly)}/mês)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 print:bg-white border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Posição Atual vs Break-Even</span>
                <span className={`font-bold font-mono text-sm ${sensitivityAndBreakEven.isInputBelowBreakEven ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {sensitivityAndBreakEven.isInputBelowBreakEven ? 'Abaixo do Equilíbrio' : 'Acima do Equilíbrio (Vantajoso)'}
                </span>
              </div>
            </div>
          </section>

          {/* EXPLICAÇÃO DO MOTIVO DOS GRÁFICOS */}
          <section className="p-4 rounded-xl border bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border-indigo-500/40 text-xs text-slate-200 space-y-2">
            <h4 className="font-bold text-indigo-300 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              💡 Análise e Explicação Técnica dos Comportamentos Gráficos
            </h4>
            <p className="leading-relaxed">
              <strong>Motivo da Inclinação da Curva de Break-Even:</strong> No Simples Tradicional, o imposto é fixo em alíquota única de {cenarioA_Financeiro.tradicionalEffectiveRate.toFixed(2)}%, independentemente do volume de compras. No Simples Híbrido, o imposto varia inversamente em relação ao volume de insumos adquiridos no Regime Geral.
            </p>
            <p className="leading-relaxed">
              <strong>Por que o ponto neutro está em {sensitivityAndBreakEven.inputBreakEvenPercent.toFixed(1)}%?</strong> Quando as compras de insumos atingem {formatCurrencyBRL((company.monthlyRevenue || monthlyRevenue) * (sensitivityAndBreakEven.inputBreakEvenPercent / 100))}/mês, o crédito gerado no IBS/CBS diminui o débito de 26,50% até que a soma do DAS Reduzido com o IBS/CBS líquido seja rigorosamente igual ao DAS Tradicional. Acima desse valor em R$, cada R$ 1.000 adicionais comprados geram economia líquida de caixa.
            </p>
          </section>

          <footer className="pt-3 border-t border-slate-800 print:border-slate-300 flex justify-between text-[10px] text-slate-500 font-mono">
            <span>Sistema Vértice Auditor Fiscal v3.8 • Dossiê Pericial de Viabilidade</span>
            <span>Relatório de Análise Gráfica • Página 1 de 1</span>
          </footer>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MODO 3: RELATÓRIO ESPECÍFICO DE MATRIZ DE CENÁRIOS (CAIXA VS B2B)
  // =========================================================================
  if (reportMode === 'relatorio_cenarios') {
    const scenarioMixList = [
      { b2bPct: 0, label: '100% B2C (Consumidor Final)' },
      { b2bPct: 25, label: '25% B2B / 75% B2C' },
      { b2bPct: 50, label: '50% B2B / 50% B2C' },
      { b2bPct: 75, label: '75% B2B / 25% B2C' },
      { b2bPct: 100, label: '100% B2B (Corporativo Pleno)' },
    ];

    return (
      <div className="space-y-6 print:space-y-0 text-slate-100 print:text-slate-900">
        <div data-report-page="1" className="report-page p-6 sm:p-7 bg-[#0B0F19] print:bg-white rounded-2xl border border-slate-800 print:border-none shadow-2xl space-y-5" style={{ minHeight: '1020px' }}>
          <header className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-800 print:border-slate-300 pb-3 gap-3">
            <div>
              <BrandLogo variant="report" className="text-white print:text-slate-900 mb-1" />
              <h1 className="text-xl font-serif-display font-bold italic text-white print:text-slate-900">
                Relatório de Matriz de Cenários (Caixa vs B2B)
              </h1>
              <p className="text-[10px] font-bold text-indigo-400 print:text-indigo-800 uppercase tracking-widest">
                Módulo Simples Híbrido • Simulação de Sensibilidade por Carteira PJ
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-white print:text-slate-900 uppercase block">{company.name || 'Empresa'}</span>
              <span className="text-[10px] text-slate-400 print:text-slate-600 font-mono block">CNPJ: {company.cnpj || 'Sem dados'} | Anexo {effectiveAnexo}</span>
              <span className="text-[9px] text-indigo-400 print:text-indigo-800 font-mono block">Emitido em: {currentDate}</span>
            </div>
          </header>

          {/* MATRIZ DE CENÁRIOS POR MIX B2B / B2C */}
          <section className="space-y-2">
            <h3 className="text-xs font-bold text-slate-300 print:text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Columns className="w-4 h-4 text-indigo-400" />
              1. Matriz de Sensibilidade por Proporção de Clientes Corporativos (PJ)
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-800 print:border-slate-300">
              <table className="w-full text-[11px] text-left text-slate-300 print:text-slate-800">
                <thead className="bg-slate-800/90 print:bg-slate-100 text-slate-200 print:text-slate-700 uppercase font-bold text-[9px]">
                  <tr>
                    <th className="py-2 px-3">Mix de Vendas</th>
                    <th className="py-2 px-3">Faturamento B2B (R$)</th>
                    <th className="py-2 px-3">Crédito Gerado ao Cliente PJ</th>
                    <th className="py-2 px-3">Carga Mensal Híbrido (R$)</th>
                    <th className="py-2 px-3">Atratividade Comercial B2B</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-slate-200">
                  {scenarioMixList.map((sc, idx) => {
                    const rev = company.monthlyRevenue || monthlyRevenue;
                    const b2bRev = rev * (sc.b2bPct / 100);
                    const b2bCredit = b2bRev * (targetIvaRate / 100);
                    const isCurrent = Math.abs((company.b2bSalesPercent ?? 60) - sc.b2bPct) < 13;
                    return (
                      <tr key={idx} className={isCurrent ? 'bg-indigo-950/40 print:bg-indigo-50 font-bold' : ''}>
                        <td className="py-2.5 px-3">
                          {sc.label}
                          {isCurrent && <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded bg-indigo-500 text-white font-mono">ATUAL</span>}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-purple-400 print:text-purple-700">{formatCurrencyBRL(b2bRev)}/mês</td>
                        <td className="py-2.5 px-3 font-mono text-emerald-400 print:text-emerald-700 font-bold">+{formatCurrencyBRL(b2bCredit)}/mês</td>
                        <td className="py-2.5 px-3 font-mono">{formatCurrencyBRL(cenarioA_Financeiro.hibridoTotalMonthlyTax)}</td>
                        <td className="py-2.5 px-3 text-slate-300">
                          {sc.b2bPct === 0 ? 'Sem repasse de crédito' : `Clientes PJ economizam ${formatCurrencyBRL(b2bCredit)}/mês`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* TRADE-OFF ESTRATÉGICO */}
          <section className="p-4 rounded-xl border bg-slate-900/90 print:bg-slate-50 border-slate-800 print:border-slate-300 space-y-2">
            <h4 className="text-xs font-bold text-white print:text-slate-900 uppercase">2. Análise de Trade-Off: Caixa Interno vs Ganho Comercial B2B</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/60 print:bg-white border border-slate-800 space-y-1">
                <span className="font-bold text-slate-200 print:text-slate-800 block">Perspectiva A: Caixa Direto do Negócio</span>
                <p className="text-slate-300 print:text-slate-600 text-[11px] leading-snug">
                  {cenarioA_Financeiro.cheaperRegime === 'tradicional'
                    ? `O Simples Tradicional retém uma vantagem de ${formatCurrencyBRL(cenarioA_Financeiro.monthlyDelta)}/mês no caixa da empresa.`
                    : `O Simples Híbrido gera economia direta de ${formatCurrencyBRL(cenarioA_Financeiro.monthlyDelta)}/mês no fluxo de caixa.`}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 print:bg-white border border-slate-800 space-y-1">
                <span className="font-bold text-indigo-300 print:text-indigo-800 block">Perspectiva B: Competitividade no Mercado B2B</span>
                <p className="text-slate-300 print:text-slate-600 text-[11px] leading-snug">
                  Clientes corporativos ganham <strong>+{formatCurrencyBRL(cenarioB_Comercial.buyerSavingsMonthlyInHibrido)}/mês</strong> em créditos de IBS/CBS. Essa economia para o cliente reduz seu custo de aquisição em 26,50%.
                </p>
              </div>
            </div>
          </section>

          {/* EXPLICAÇÃO DO MOTIVO DOS CENÁRIOS */}
          <section className="p-4 rounded-xl border bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border-indigo-500/40 text-xs text-slate-200 space-y-2">
            <h4 className="font-bold text-indigo-300 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              💡 Análise e Explicação da Matriz de Cenários (Caixa vs B2B)
            </h4>
            <p className="leading-relaxed">
              <strong>Motivo da Decisão por Cenário:</strong> Se mais de 50% do faturamento da empresa é destinado a empresas do Lucro Presumido ou Lucro Real, o benefício comercial de transferir 26,50% em crédito de IBS/CBS ao comprador ({formatCurrencyBRL(cenarioB_Comercial.hibridoB2bCreditMonthly)}/mês) supera qualquer eventual acréscimo no caixa direto.
            </p>
            <p className="leading-relaxed">
              <strong>Por que o Simples Híbrido é recomendado para vendas B2B?</strong> No Simples Tradicional, o comprador PJ toma um crédito extremamente reduzido de apenas {cenarioB_Comercial.tradicionalB2bCreditRate.toFixed(2)}%, o que encarece o produto da empresa perante a concorrência do Regime Geral. Ao optar pelo Híbrido, o produto torna-se 26,50% mais barato para o comprador PJ, alavancando contratos e volume de vendas.
            </p>
          </section>

          <footer className="pt-3 border-t border-slate-800 print:border-slate-300 flex justify-between text-[10px] text-slate-500 font-mono">
            <span>Sistema Vértice Auditor Fiscal v3.8 • Dossiê Pericial de Viabilidade</span>
            <span>Relatório de Matriz de Cenários • Página 1 de 1</span>
          </footer>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MODO 4: RELATÓRIO ESPECÍFICO DE DECOMPOSIÇÃO E PARTILHA DO DAS (LC 123/2006)
  // =========================================================================
  if (reportMode === 'relatorio_partilha') {
    const rev = company.monthlyRevenue || monthlyRevenue;
    const dasTot = rev * (standardEffectiveRate / 100);

    return (
      <div className="space-y-6 print:space-y-0 text-slate-100 print:text-slate-900">
        <div data-report-page="1" className="report-page p-6 sm:p-7 bg-[#0B0F19] print:bg-white rounded-2xl border border-slate-800 print:border-none shadow-2xl space-y-5" style={{ minHeight: '1020px' }}>
          <header className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-800 print:border-slate-300 pb-3 gap-3">
            <div>
              <BrandLogo variant="report" className="text-white print:text-slate-900 mb-1" />
              <h1 className="text-xl font-serif-display font-bold italic text-white print:text-slate-900">
                Relatório Doutrinário de Decomposição e Partilha do DAS
              </h1>
              <p className="text-[10px] font-bold text-indigo-400 print:text-indigo-800 uppercase tracking-widest">
                Art. 18-A da LC 123/2006 • Emenda Constitucional nº 132/2023 • Anexo {effectiveAnexo}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-white print:text-slate-900 uppercase block">{company.name || 'Empresa'}</span>
              <span className="text-[10px] text-slate-400 print:text-slate-600 font-mono block">CNPJ: {company.cnpj || 'Sem dados'} | RBT12: {formatCurrencyBRL(rbt12)}</span>
              <span className="text-[9px] text-indigo-400 print:text-indigo-800 font-mono block">Emitido em: {currentDate}</span>
            </div>
          </header>

          {/* TABELA DE DECOMPOSIÇÃO DO DAS */}
          <section className="space-y-2">
            <h3 className="text-xs font-bold text-slate-300 print:text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-400" />
              1. Tabela Legal de Partilha Tributária — Anexo {effectiveAnexo} (LC 123/2006)
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-800 print:border-slate-300">
              <table className="w-full text-[11px] text-left text-slate-300 print:text-slate-800">
                <thead className="bg-slate-800/90 print:bg-slate-100 text-slate-200 print:text-slate-700 uppercase font-bold text-[9px]">
                  <tr>
                    <th className="py-2 px-3">Tributo Integrante</th>
                    <th className="py-2 px-3">Competência / Ente</th>
                    <th className="py-2 px-3">Partilha (%)</th>
                    <th className="py-2 px-3">Alíquota Efetiva (%)</th>
                    <th className="py-2 px-3">Valor Mensal (R$)</th>
                    <th className="py-2 px-3">Destino no Simples Híbrido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-slate-200">
                  <tr>
                    <td className="py-2 px-3 font-semibold text-white print:text-slate-900">IRPJ</td>
                    <td className="py-2 px-3 text-slate-400">União Federal</td>
                    <td className="py-2 px-3 font-mono">{(partition.irpj * 100).toFixed(2)}%</td>
                    <td className="py-2 px-3 font-mono text-emerald-400">{(standardEffectiveRate * partition.irpj).toFixed(3)}%</td>
                    <td className="py-2 px-3 font-mono">{formatCurrencyBRL(dasTot * partition.irpj)}</td>
                    <td className="py-2 px-3 text-emerald-400 font-bold">Retido na Guia DAS Reduzida</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-white print:text-slate-900">CSLL</td>
                    <td className="py-2 px-3 text-slate-400">União Federal</td>
                    <td className="py-2 px-3 font-mono">{(partition.csll * 100).toFixed(2)}%</td>
                    <td className="py-2 px-3 font-mono text-emerald-400">{(standardEffectiveRate * partition.csll).toFixed(3)}%</td>
                    <td className="py-2 px-3 font-mono">{formatCurrencyBRL(dasTot * partition.csll)}</td>
                    <td className="py-2 px-3 text-emerald-400 font-bold">Retido na Guia DAS Reduzida</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-white print:text-slate-900">CPP (Previdência Patronal)</td>
                    <td className="py-2 px-3 text-slate-400">INSS / União</td>
                    <td className="py-2 px-3 font-mono">{(partition.cpp * 100).toFixed(2)}%</td>
                    <td className="py-2 px-3 font-mono text-emerald-400">{(standardEffectiveRate * partition.cpp).toFixed(3)}%</td>
                    <td className="py-2 px-3 font-mono">{formatCurrencyBRL(dasTot * partition.cpp)}</td>
                    <td className="py-2 px-3 text-emerald-400 font-bold">{effectiveAnexo === 'IV' ? 'Fora na DCTFWeb' : 'Retido na Guia DAS Reduzida'}</td>
                  </tr>
                  <tr className="bg-rose-950/20 print:bg-rose-50 font-semibold">
                    <td className="py-2 px-3 text-rose-300 print:text-rose-800">PIS + COFINS</td>
                    <td className="py-2 px-3 text-slate-400">Substituído pela CBS</td>
                    <td className="py-2 px-3 font-mono text-rose-300">{((partition.pis + partition.cofins) * 100).toFixed(2)}%</td>
                    <td className="py-2 px-3 font-mono text-rose-300">{(standardEffectiveRate * (partition.pis + partition.cofins)).toFixed(3)}%</td>
                    <td className="py-2 px-3 font-mono text-rose-300">{formatCurrencyBRL(dasTot * (partition.pis + partition.cofins))}</td>
                    <td className="py-2 px-3 text-rose-400 font-bold">EXPURGADO DO DAS (Apurado CBS)</td>
                  </tr>
                  <tr className="bg-rose-950/20 print:bg-rose-50 font-semibold">
                    <td className="py-2 px-3 text-rose-300 print:text-rose-800">{effectiveAnexo === 'I' || effectiveAnexo === 'II' ? 'ICMS' : 'ISS'}</td>
                    <td className="py-2 px-3 text-slate-400">Substituído pelo IBS</td>
                    <td className="py-2 px-3 font-mono text-rose-300">{((partition.icms || partition.iss) * 100).toFixed(2)}%</td>
                    <td className="py-2 px-3 font-mono text-rose-300">{(standardEffectiveRate * (partition.icms || partition.iss)).toFixed(3)}%</td>
                    <td className="py-2 px-3 font-mono text-rose-300">{formatCurrencyBRL(dasTot * (partition.icms || partition.iss))}</td>
                    <td className="py-2 px-3 text-rose-400 font-bold">EXPURGADO DO DAS (Apurado IBS)</td>
                  </tr>
                </tbody>
                <tfoot className="bg-slate-800 print:bg-slate-100 font-bold text-white print:text-slate-900 text-[10.5px]">
                  <tr>
                    <td className="py-2 px-3">TOTAL DAS TRADICIONAL</td>
                    <td className="py-2 px-3">Guia Única DAS</td>
                    <td className="py-2 px-3 font-mono">100,00%</td>
                    <td className="py-2 px-3 font-mono text-emerald-400">{standardEffectiveRate.toFixed(2)}%</td>
                    <td className="py-2 px-3 font-mono">{formatCurrencyBRL(dasTot)}/mês</td>
                    <td className="py-2 px-3 font-mono text-indigo-300 font-bold">DAS Reduzido: {reducedDasRate.toFixed(2)}% ({formatCurrencyBRL(reducedDasMonthly)}/mês)</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          {/* MEMÓRIA DE CÁLCULO DA SUBTRAÇÃO */}
          <section className="p-4 rounded-xl border bg-slate-900/90 print:bg-slate-50 border-slate-800 print:border-slate-300 space-y-2 text-xs">
            <h4 className="font-bold text-white print:text-slate-900 uppercase">2. Demonstração Numérica da Redução da Guia DAS</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono">
              <div className="p-2.5 rounded bg-slate-950/60 print:bg-white border border-slate-800">
                <span className="text-slate-400 text-[10px] block font-sans">Guia DAS Tradicional Completa:</span>
                <span className="text-white font-bold">{standardEffectiveRate.toFixed(2)}% = {formatCurrencyBRL(dasTot)}/mês</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950/60 print:bg-white border border-slate-800">
                <span className="text-slate-400 text-[10px] block font-sans">Guia DAS Reduzida no Simples Híbrido:</span>
                <span className="text-emerald-400 font-bold">{reducedDasRate.toFixed(2)}% = {formatCurrencyBRL(reducedDasMonthly)}/mês</span>
              </div>
            </div>
          </section>

          {/* EXPLICAÇÃO DO MOTIVO DA DECOMPOSIÇÃO */}
          <section className="p-4 rounded-xl border bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border-indigo-500/40 text-xs text-slate-200 space-y-2">
            <h4 className="font-bold text-indigo-300 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              💡 Análise e Explicação da Decomposição do DAS
            </h4>
            <p className="leading-relaxed">
              <strong>Mecanismo Legal do Expurgo:</strong> A Emenda Constitucional nº 132/2023 garante ao optante do Simples Nacional a faculdade de recolher o IBS (substitutivo do ICMS/ISS) e a CBS (substitutiva do PIS/COFINS) fora do DAS, no regime regular não-cumulativo.
            </p>
            <p className="leading-relaxed">
              <strong>Por que a alíquota do DAS cai para {reducedDasRate.toFixed(2)}%?</strong> Ao migrar para o Simples Híbrido, a Secretaria da Receita Federal expurga as parcelas relativas ao PIS/COFINS ({((partition.pis + partition.cofins)*100).toFixed(2)}% da partilha) e ao ICMS/ISS ({((partition.icms || partition.iss)*100).toFixed(2)}% da partilha). O contribuinte paga na guia DAS apenas os tributos sobre a renda e folha (IRPJ, CSLL e CPP), garantindo a retenção direta de {formatCurrencyBRL(reducedDasMonthly)}/mês.
            </p>
          </section>

          <footer className="pt-3 border-t border-slate-800 print:border-slate-300 flex justify-between text-[10px] text-slate-500 font-mono">
            <span>Sistema Vértice Auditor Fiscal v3.8 • Dossiê Pericial de Viabilidade</span>
            <span>Relatório de Decomposição do DAS • Página 1 de 1</span>
          </footer>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MODO MASTER: PARECER PERICIAL UNIFICADO COMPLETO (3 PÁGINAS A4)
  // =========================================================================

  return (
    <div className={isHorizontalView ? 'grid grid-cols-1 xl:grid-cols-3 gap-6 print:block print:space-y-0' : 'space-y-8 print:space-y-0'}>
      {/* =========================================================================
          PÁGINA 1: DIAGNÓSTICO EXECUTIVO, TRAVAS FISCAIS & CONFRONTO VISUAL
          ========================================================================= */}
      <div 
        data-report-page="1" 
        className="report-page report-page-1 relative overflow-hidden p-6 sm:p-7 bg-[#0B0F19] print:bg-white text-slate-100 print:text-slate-900 rounded-2xl border border-slate-800 print:border-none shadow-2xl flex flex-col justify-between"
        style={{ minHeight: '1020px' }}
      >
        {/* Marca D'água Pericial */}
        <div className="report-watermark absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden" aria-hidden="true">
          <BrandLogo variant="watermark" size="2xl" watermarkOpacity={0.035} className="transform -rotate-12 scale-110" />
        </div>

        <div className="relative z-10 space-y-4">
          {/* HEADER EXECUTIVO COM TIMBRE E IDENTIFICAÇÃO PERICIAL */}
          <header className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-800 print:border-slate-300 pb-3 gap-3">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 mb-1">
                <BrandLogo variant="report" className="text-white print:text-slate-900" />
              </div>
              <h1 className="text-xl sm:text-2xl font-serif-display font-bold italic tracking-tight text-white print:text-slate-900 leading-none">
                Parecer Técnico Pericial de Viabilidade
              </h1>
              <p className="text-[10px] font-bold text-indigo-400 print:text-indigo-800 uppercase tracking-widest pt-0.5">
                Simples Nacional Híbrido vs. Tradicional • Reforma Tributária (EC 132/23 & LC 214/25)
              </p>
              <div className="pt-1">
                <h2 className="text-sm sm:text-base font-extrabold text-white print:text-slate-900 uppercase">
                  {company.name || 'EMPRESA EM AUDITORIA FISCAL'}
                </h2>
                <p className="text-[10px] text-slate-300 print:text-slate-600 font-mono">
                  CNPJ: {company.cnpj || 'Não informado'} | UF: {company.uf || 'SP'} ({company.city || 'Capital'}) | RBT12: {formatCurrencyBRL(company.rbt12 || 1200000)} | Anexo: {effectiveAnexo}
                </p>
              </div>
            </div>

            <div className="text-right sm:self-start space-y-1 shrink-0">
              <div className={`px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-wider inline-block shadow-sm ${
                technicalOpinion.section3_RecommendationVerdict.verdictShort.includes('TRADICIONAL')
                  ? 'bg-emerald-600 text-white'
                  : technicalOpinion.section3_RecommendationVerdict.verdictShort.includes('HÍBRIDO')
                  ? 'bg-indigo-600 text-white'
                  : 'bg-amber-600 text-white'
              }`}>
                {technicalOpinion.section3_RecommendationVerdict.verdictShort}
              </div>
              <p className="text-[9px] font-bold text-slate-400 print:text-slate-600 uppercase tracking-wider block">
                Emitido em {currentDate}
              </p>
              {securityRecord && (
                <div className="flex items-center justify-end space-x-1.5 pt-0.5">
                  {securityRecord.qrCodeDataUrl && (
                    <img 
                      src={securityRecord.qrCodeDataUrl} 
                      alt="QR Code" 
                      className="w-7 h-7 rounded bg-white p-0.5 border border-slate-700 print:border-slate-300" 
                    />
                  )}
                  <div className="text-right">
                    <span className="text-[8px] font-mono text-slate-400 print:text-slate-600 block">Autenticidade</span>
                    <span className="text-[9px] font-mono font-bold text-indigo-400 print:text-indigo-800 block">{securityRecord.hashFormatted}</span>
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* 1. SUMÁRIO EXECUTIVO & DIAGNÓSTICO TRIANGULAR */}
          <section className="avoid-break space-y-2">
            <h3 className="text-[11px] font-bold text-slate-300 print:text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              1. Sumário Executivo & Diagnóstico Triangular de Decisão
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {/* Card 1: Caixa Interno */}
              <div className="p-2.5 rounded-xl border bg-slate-900/90 print:bg-slate-50 border-slate-800 print:border-slate-300 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-300 print:text-slate-800 uppercase">Cenário A: Caixa</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 print:bg-emerald-100 text-emerald-300 print:text-emerald-800">
                    {cenarioA_Financeiro.cheaperRegime === 'tradicional' ? 'Vantagem Tradicional' : 'Vantagem Híbrido'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 print:text-slate-700 leading-snug">
                  {cenarioA_Financeiro.cheaperRegime === 'tradicional'
                    ? `O Simples Tradicional economiza ${formatCurrencyBRL(cenarioA_Financeiro.monthlyDelta)}/mês no caixa (${cenarioA_Financeiro.tradicionalEffectiveRate.toFixed(2)}% vs ${cenarioA_Financeiro.hibridoEffectiveRate.toFixed(2)}%).`
                    : `O Simples Híbrido é mais econômico internamente com alíquota efetiva de ${cenarioA_Financeiro.hibridoEffectiveRate.toFixed(2)}%.`}
                </p>
              </div>

              {/* Card 2: Competitividade B2B */}
              <div className="p-2.5 rounded-xl border bg-slate-900/90 print:bg-slate-50 border-slate-800 print:border-slate-300 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-300 print:text-slate-800 uppercase">Cenário B: Mercado B2B</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 print:bg-indigo-100 text-indigo-300 print:text-indigo-800">
                    Crédito Cheio 26,5%
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 print:text-slate-700 leading-snug">
                  Clientes PJ ganham <strong>{formatCurrencyBRL(cenarioB_Comercial.buyerSavingsMonthlyInHibrido)}/mês</strong> em créditos fiscais, reduzindo o custo de aquisição do cliente para {cenarioB_Comercial.hibridoB2bEffectiveNetCostPercent.toFixed(1)}% do preço.
                </p>
              </div>

              {/* Card 3: Break-Even & Insumos */}
              <div className={`p-2.5 rounded-xl border space-y-1 ${
                sensitivityAndBreakEven.isInputBelowBreakEven
                  ? 'bg-rose-950/20 print:bg-rose-50 border-rose-500/30 print:border-rose-300'
                  : 'bg-emerald-950/20 print:bg-emerald-50 border-emerald-500/30 print:border-emerald-300'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-300 print:text-slate-800 uppercase">Equilíbrio de Insumos</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    sensitivityAndBreakEven.isInputBelowBreakEven
                      ? 'bg-rose-500/20 print:bg-rose-100 text-rose-300 print:text-rose-800'
                      : 'bg-emerald-500/20 print:bg-emerald-100 text-emerald-300 print:text-emerald-800'
                  }`}>
                    Break-Even: {sensitivityAndBreakEven.inputBreakEvenPercent.toFixed(1)}%
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 print:text-slate-700 leading-snug">
                  Compras atuais: <strong>{sensitivityAndBreakEven.currentInputPercent.toFixed(1)}%</strong>. Sem insumos, o imposto no Híbrido sobe para <strong>{sensitivityAndBreakEven.noInputPurchasesEffectiveRate.toFixed(1)}%</strong> (+{formatCurrencyBRL(sensitivityAndBreakEven.noInputPurchasesTaxDifferenceMonthly)}/mês).
                </p>
              </div>
            </div>
          </section>

          {/* 2. ANÁLISE DAS 3 TRAVAS FISCAIS ESTRATÉGICAS */}
          <section className="avoid-break space-y-2">
            <h3 className="text-[11px] font-bold text-slate-300 print:text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              2. Análise Técnica das 3 Travas Fiscais Decisórias (LC 123/06 & EC 132/23)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[10px]">
              {/* Trava 1: Sublimite Estadual */}
              <div className="p-2.5 rounded-xl border bg-slate-900/90 print:bg-slate-50 border-slate-800 print:border-slate-300 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 print:text-slate-800">Trava 01: Sublimite R$ 3,6M</span>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                    trava01Sublimite.isExceeded ? 'bg-rose-500/20 text-rose-300 print:text-rose-800' : 'bg-emerald-500/20 text-emerald-300 print:text-emerald-800'
                  }`}>
                    {trava01Sublimite.isExceeded ? 'EXCEDIDO' : 'REGULAR'}
                  </span>
                </div>
                <p className="text-slate-300 print:text-slate-600 leading-tight">
                  {trava01Sublimite.isExceeded 
                    ? `RBT12 de ${formatCurrencyBRL(company.rbt12 || 0)} ultrapassa o sublimite de R$ 3.600.000,00. O ICMS/ISS é compulsoriamente recolhido por fora no regime geral.`
                    : `RBT12 de ${formatCurrencyBRL(company.rbt12 || 0)} enquadrado dentro do sublimite estadual de R$ 3.600.000,00.`}
                </p>
              </div>

              {/* Trava 2: Fator R */}
              <div className="p-2.5 rounded-xl border bg-slate-900/90 print:bg-slate-50 border-slate-800 print:border-slate-300 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 print:text-slate-800">Trava 02: Fator R (28%)</span>
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-indigo-500/20 text-indigo-300 print:text-indigo-800">
                    {trava02FatorR.fatorR.toFixed(1)}%
                  </span>
                </div>
                <p className="text-slate-300 print:text-slate-600 leading-tight">
                  {trava02FatorR.isApplicable
                    ? (trava02FatorR.fatorRActive 
                        ? `Fator R ≥ 28%: Atividade tributada no Anexo III (${standardEffectiveRate.toFixed(2)}%), gerando economia em relação ao Anexo V.`
                        : `Fator R < 28%: Tributada no Anexo V. Folha necessária para Anexo III: ${formatCurrencyBRL(trava02FatorR.payrollNeededForAnexoIII)}/mês.`)
                    : `Atividade com enquadramento fixo no Anexo ${effectiveAnexo} (não sujeita à regra do Fator R).`}
                </p>
              </div>

              {/* Trava 3: Crédito de Fornecedores */}
              <div className="p-2.5 rounded-xl border bg-slate-900/90 print:bg-slate-50 border-slate-800 print:border-slate-300 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 print:text-slate-800">Trava 03: Crédito de Entradas</span>
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-500/20 text-amber-300 print:text-amber-800">
                    Média {trava03CreditoEntrada.effectiveInputCreditRatePercent.toFixed(1)}%
                  </span>
                </div>
                <p className="text-slate-300 print:text-slate-600 leading-tight">
                  Compras de fornecedores do Simples ({trava03CreditoEntrada.simplesSupplierPurchases > 0 ? `${(company.simplesSupplierPercent ?? 40)}%` : '0%'}) geram crédito reduzido de apenas {trava03CreditoEntrada.simplesSupplierCreditRate.toFixed(1)}%, gerando perda creditícia.
                </p>
              </div>
            </div>
          </section>

          {/* 3. GRÁFICOS PERICIAIS COMPARATIVOS */}
          <section className="avoid-break space-y-2">
            <h3 className="text-[11px] font-bold text-slate-300 print:text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-indigo-400" />
              3. Confronto Visual e Estrutural de Cenários Tributários
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Gráfico 1: Carga Anual nos 4 Regimes */}
              <div className="p-2.5 rounded-xl border bg-slate-900/90 print:bg-slate-50 border-slate-800 print:border-slate-300">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-white print:text-slate-900">Comparativo de Carga Anual (R$)</span>
                  <span className="text-[9px] text-slate-400 print:text-slate-600 font-mono">12 Meses Projetados</span>
                </div>
                <div className="h-32 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={regimesAnnualData} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.35} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={8} tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '10px' }}
                        formatter={(val: number) => [formatCurrencyBRL(val), 'Tributo Anual']}
                      />
                      <Bar dataKey="tributoAnual" radius={[4, 4, 0, 0]}>
                        {regimesAnnualData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-4 gap-1 pt-1 text-[9px] text-center border-t border-slate-800 print:border-slate-300 mt-1">
                  {regimesAnnualData.map((item, idx) => (
                    <div key={idx}>
                      <div className="text-slate-400 print:text-slate-600 truncate">{item.name.replace('Simples ', '')}</div>
                      <div className="font-bold text-white print:text-slate-900 font-mono">{item.aliquotaEfetiva}%</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gráfico 2: Crédito Transferido B2B */}
              <div className="p-2.5 rounded-xl border bg-slate-900/90 print:bg-slate-50 border-slate-800 print:border-slate-300">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-white print:text-slate-900">Atratividade Comercial B2B (Base R$ 1.000)</span>
                  <span className="text-[9px] text-slate-400 print:text-slate-600 font-mono">Crédito Gerado ao Comprador</span>
                </div>
                <div className="h-32 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={b2bCommercialChartData} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.35} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={8} tickFormatter={(v) => `R$${v}`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '10px' }}
                        formatter={(val: number) => [formatCurrencyBRL(val), 'Valor']}
                      />
                      <Legend wrapperStyle={{ fontSize: '8px' }} />
                      <Bar dataKey="creditoGerado" name="Crédito ao Comprador" fill="#10B981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="custoLiquidoComprador" name="Custo Líquido Comprador" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-[9px] text-slate-400 print:text-slate-600 text-center pt-1 border-t border-slate-800 print:border-slate-300 mt-1">
                  No Híbrido, o cliente corporativo deduz R$ {b2bCommercialChartData[1].creditoGerado.toFixed(0)} de cada R$ 1.000 faturado.
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* RODAPÉ DA PÁGINA 1 */}
        <footer className="pt-2.5 border-t border-slate-800 print:border-slate-300 flex justify-between items-center text-[9px] text-slate-500 print:text-slate-600 font-mono mt-2">
          <span>Sistema Vértice Auditor Fiscal v3.8 • Dossiê Pericial de Viabilidade</span>
          <span className="font-bold uppercase tracking-wider text-indigo-400 print:text-indigo-800">Página 1 de 3</span>
        </footer>
      </div>

      {/* =========================================================================
          PÁGINA 2: DEMONSTRATIVO NUMÉRICO, MEMÓRIA DE CÁLCULO & PARTILHA DO DAS
          ========================================================================= */}
      <div 
        data-report-page="2" 
        className="report-page report-page-2 relative overflow-hidden p-6 sm:p-7 bg-[#0B0F19] print:bg-white text-slate-100 print:text-slate-900 rounded-2xl border border-slate-800 print:border-none shadow-2xl flex flex-col justify-between"
        style={{ minHeight: '1020px' }}
      >
        {/* Marca D'água Pericial */}
        <div className="report-watermark absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden" aria-hidden="true">
          <BrandLogo variant="watermark" size="2xl" watermarkOpacity={0.035} className="transform -rotate-12 scale-110" />
        </div>

        <div className="relative z-10 space-y-4">
          {/* CABEÇALHO DE CONTINUAÇÃO OFICIAL */}
          <header className="flex justify-between items-center border-b-2 border-slate-800 print:border-slate-300 pb-2.5">
            <div className="flex items-center space-x-2">
              <BrandLogo variant="report" className="text-white print:text-slate-900" />
              <div className="border-l border-slate-700 print:border-slate-300 pl-2">
                <span className="text-[10px] font-bold text-indigo-400 print:text-indigo-800 uppercase tracking-widest block">
                  Parecer Técnico Pericial de Viabilidade • Continuação
                </span>
                <span className="text-xs font-bold text-white print:text-slate-900">
                  {company.name || 'Empresa Auditada'} — CNPJ: {company.cnpj || 'Sem dados'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-mono text-slate-400 print:text-slate-600 block">Protocolo de Segurança</span>
              <span className="text-[10px] font-mono font-bold text-indigo-400 print:text-indigo-800">{securityRecord?.hashFormatted || 'VF-2026-SIMPLES-HIBRIDO'}</span>
            </div>
          </header>

          {/* 4. DEMONSTRATIVO NUMÉRICO COMPARATIVO MENSAL E ANUAL */}
          <section className="avoid-break space-y-2">
            <h3 className="text-[11px] font-bold text-slate-300 print:text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              4. Demonstrativo Numérico Comparativo Mensal e Anual
            </h3>

            <div className="overflow-x-auto rounded-xl border border-slate-800 print:border-slate-300">
              <table className="w-full text-[10px] text-left text-slate-300 print:text-slate-800">
                <thead className="bg-slate-800/90 print:bg-slate-100 text-slate-300 print:text-slate-700 uppercase font-semibold text-[9px]">
                  <tr>
                    <th className="py-1.5 px-2.5">Rubrica / Métrica de Análise</th>
                    <th className="py-1.5 px-2.5">Simples Tradicional</th>
                    <th className="py-1.5 px-2.5">Simples Híbrido</th>
                    <th className="py-1.5 px-2.5">Variação / Impacto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-slate-200">
                  <tr>
                    <td className="py-1.5 px-2.5 font-semibold text-white print:text-slate-900">Alíquota Efetiva de Tributação</td>
                    <td className="py-1.5 px-2.5 font-mono text-emerald-400 print:text-emerald-700">{cenarioA_Financeiro.tradicionalEffectiveRate.toFixed(2)}%</td>
                    <td className="py-1.5 px-2.5 font-mono text-indigo-400 print:text-indigo-700">{cenarioA_Financeiro.hibridoEffectiveRate.toFixed(2)}%</td>
                    <td className="py-1.5 px-2.5 font-mono">
                      {cenarioA_Financeiro.hibridoEffectiveRate > cenarioA_Financeiro.tradicionalEffectiveRate
                        ? `+${(cenarioA_Financeiro.hibridoEffectiveRate - cenarioA_Financeiro.tradicionalEffectiveRate).toFixed(2)}% (Híbrido maior)`
                        : `${(cenarioA_Financeiro.hibridoEffectiveRate - cenarioA_Financeiro.tradicionalEffectiveRate).toFixed(2)}% (Híbrido menor)`}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2.5 font-semibold text-white print:text-slate-900">Guia DAS (Tributos Diretos Retidos)</td>
                    <td className="py-1.5 px-2.5 font-mono">{formatCurrencyBRL(cenarioA_Financeiro.tradicionalDasAmount)}</td>
                    <td className="py-1.5 px-2.5 font-mono">{formatCurrencyBRL(reducedDasMonthly)} <span className="text-[9px] text-slate-400">({reducedDasRate.toFixed(2)}%)</span></td>
                    <td className="py-1.5 px-2.5 font-mono text-emerald-400 print:text-emerald-700">Expurgo de PIS/COFINS e ICMS/ISS</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2.5 font-semibold text-white print:text-slate-900">IBS + CBS Líquido (Regime Regular)</td>
                    <td className="py-1.5 px-2.5 font-mono text-slate-400">Incluso no DAS</td>
                    <td className="py-1.5 px-2.5 font-mono">{formatCurrencyBRL(cenarioA_Financeiro.hibridoNetIbsCbsPayableMonthly)}</td>
                    <td className="py-1.5 px-2.5 font-mono">Débito: {formatCurrencyBRL(cenarioA_Financeiro.hibridoGrossIbsCbsDebitoMonthly)} / Crédito: -{formatCurrencyBRL(cenarioA_Financeiro.hibridoIbsCbsCreditoMonthly)}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2.5 font-semibold text-white print:text-slate-900">Desembolso Mensal Total</td>
                    <td className="py-1.5 px-2.5 font-mono font-bold text-emerald-400 print:text-emerald-700">{formatCurrencyBRL(cenarioA_Financeiro.tradicionalMonthlyTax)}</td>
                    <td className="py-1.5 px-2.5 font-mono font-bold text-indigo-400 print:text-indigo-700">{formatCurrencyBRL(cenarioA_Financeiro.hibridoTotalMonthlyTax)}</td>
                    <td className="py-1.5 px-2.5 font-mono font-bold">
                      {cenarioA_Financeiro.cheaperRegime === 'tradicional'
                        ? `Tradicional poupa ${formatCurrencyBRL(cenarioA_Financeiro.monthlyDelta)}/mês`
                        : `Híbrido poupa ${formatCurrencyBRL(cenarioA_Financeiro.monthlyDelta)}/mês`}
                    </td>
                  </tr>
                  <tr className="bg-slate-900/60 print:bg-slate-50">
                    <td className="py-1.5 px-2.5 font-semibold text-white print:text-slate-900">Desembolso Anual Consolidado</td>
                    <td className="py-1.5 px-2.5 font-mono font-bold">{formatCurrencyBRL(cenarioA_Financeiro.tradicionalAnnualTax)}</td>
                    <td className="py-1.5 px-2.5 font-mono font-bold">{formatCurrencyBRL(cenarioA_Financeiro.hibridoTotalAnnualTax)}</td>
                    <td className="py-1.5 px-2.5 font-mono font-bold">
                      {cenarioA_Financeiro.cheaperRegime === 'tradicional'
                        ? `Diferença Anual: ${formatCurrencyBRL(cenarioA_Financeiro.annualDelta)}`
                        : `Economia Anual Híbrido: ${formatCurrencyBRL(cenarioA_Financeiro.annualDelta)}`}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2.5 font-semibold text-white print:text-slate-900">Crédito Gerado para Clientes B2B</td>
                    <td className="py-1.5 px-2.5 font-mono text-amber-400 print:text-amber-700">{cenarioB_Comercial.tradicionalB2bCreditRate.toFixed(2)}% ({formatCurrencyBRL(cenarioB_Comercial.tradicionalB2bCreditMonthly)}/mês)</td>
                    <td className="py-1.5 px-2.5 font-mono text-emerald-400 print:text-emerald-700">{cenarioB_Comercial.hibridoB2bCreditRate.toFixed(2)}% ({formatCurrencyBRL(cenarioB_Comercial.hibridoB2bCreditMonthly)}/mês)</td>
                    <td className="py-1.5 px-2.5 font-mono font-bold text-emerald-400 print:text-emerald-700">
                      Ganho Comprador: +{formatCurrencyBRL(cenarioB_Comercial.buyerSavingsMonthlyInHibrido)}/mês
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 5. MEMÓRIA DE CÁLCULO PASSO A PASSO EXPLICADA */}
          <section className="avoid-break space-y-2">
            <h3 className="text-[11px] font-bold text-slate-300 print:text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-indigo-400" />
              5. Memória de Cálculo Auditável & Decomposição das Fórmulas Legais
            </h3>

            <div className="p-3 rounded-xl border bg-slate-900/90 print:bg-slate-50 border-slate-800 print:border-slate-300 space-y-2 text-[10px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-slate-950/60 print:bg-white border border-slate-800 print:border-slate-200">
                  <span className="font-bold text-indigo-400 print:text-indigo-800 block">Passo 1: Alíquota Efetiva do Simples</span>
                  <p className="font-mono text-slate-300 print:text-slate-700 mt-0.5">
                    [(RBT12 × AliqNominal) - Parcela] / RBT12 = <strong>{standardEffectiveRate.toFixed(3)}%</strong>
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/60 print:bg-white border border-slate-800 print:border-slate-200">
                  <span className="font-bold text-indigo-400 print:text-indigo-800 block">Passo 2: DAS Reduzido no Híbrido</span>
                  <p className="font-mono text-slate-300 print:text-slate-700 mt-0.5">
                    {standardEffectiveRate.toFixed(2)}% × (IRPJ {((partition.irpj)*100).toFixed(1)}% + CSLL {((partition.csll)*100).toFixed(1)}% + CPP {((partition.cpp)*100).toFixed(1)}%) = <strong>{reducedDasRate.toFixed(3)}%</strong> ({formatCurrencyBRL(reducedDasMonthly)}/mês)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-slate-950/60 print:bg-white border border-slate-800 print:border-slate-200">
                  <span className="font-bold text-indigo-400 print:text-indigo-800 block">Passo 3: Débito e Crédito de IBS/CBS</span>
                  <p className="font-mono text-slate-300 print:text-slate-700 mt-0.5">
                    Débito (26,5%): {formatCurrencyBRL(cenarioA_Financeiro.hibridoGrossIbsCbsDebitoMonthly)} <br />
                    Crédito Compras: -{formatCurrencyBRL(cenarioA_Financeiro.hibridoIbsCbsCreditoMonthly)} <br />
                    <strong>Saldo IBS/CBS a Pagar: {formatCurrencyBRL(cenarioA_Financeiro.hibridoNetIbsCbsPayableMonthly)}/mês</strong>
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/60 print:bg-white border border-slate-800 print:border-slate-200">
                  <span className="font-bold text-indigo-400 print:text-indigo-800 block">Passo 4: Carga Total Consolidada</span>
                  <p className="font-mono text-slate-300 print:text-slate-700 mt-0.5">
                    DAS Reduzido ({formatCurrencyBRL(reducedDasMonthly)}) + Saldo IBS/CBS ({formatCurrencyBRL(cenarioA_Financeiro.hibridoNetIbsCbsPayableMonthly)}) = <strong>{formatCurrencyBRL(cenarioA_Financeiro.hibridoTotalMonthlyTax)}/mês</strong> ({cenarioA_Financeiro.hibridoEffectiveRate.toFixed(2)}%)
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 6. TABELA DE EXPURGOS DO DAS REDUZIDO */}
          <section className="avoid-break space-y-2">
            <h3 className="text-[11px] font-bold text-slate-300 print:text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              6. Tabela de Partilha e Expurgos do DAS Reduzido • {effectiveAnexo} (LC 123/2006)
            </h3>

            <div className="overflow-x-auto rounded-xl border border-slate-800 print:border-slate-300">
              <table className="w-full text-[10px] text-left text-slate-300 print:text-slate-800">
                <thead className="bg-slate-800/90 print:bg-slate-100 text-slate-300 print:text-slate-700 uppercase font-semibold text-[8px]">
                  <tr>
                    <th className="py-1 px-2">Tributo</th>
                    <th className="py-1 px-2">Destino Legal</th>
                    <th className="py-1 px-2">Partilha (%)</th>
                    <th className="py-1 px-2">Alíquota Efetiva</th>
                    <th className="py-1 px-2">Valor Mensal (R$)</th>
                    <th className="py-1 px-2">Status no Híbrido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-slate-200">
                  <tr>
                    <td className="py-1 px-2 font-semibold text-white print:text-slate-900">IRPJ</td>
                    <td className="py-1 px-2 text-slate-400 print:text-slate-600">Federal Direto</td>
                    <td className="py-1 px-2 font-mono">{(partition.irpj * 100).toFixed(2)}%</td>
                    <td className="py-1 px-2 font-mono text-emerald-400 print:text-emerald-700">{((standardEffectiveRate * partition.irpj)).toFixed(3)}%</td>
                    <td className="py-1 px-2 font-mono">{formatCurrencyBRL((company.monthlyRevenue || 100000) * ((standardEffectiveRate * partition.irpj) / 100))}</td>
                    <td className="py-1 px-2 text-emerald-400 print:text-emerald-700 font-semibold">Retido no DAS</td>
                  </tr>
                  <tr>
                    <td className="py-1 px-2 font-semibold text-white print:text-slate-900">CSLL</td>
                    <td className="py-1 px-2 text-slate-400 print:text-slate-600">Federal Direto</td>
                    <td className="py-1 px-2 font-mono">{(partition.csll * 100).toFixed(2)}%</td>
                    <td className="py-1 px-2 font-mono text-emerald-400 print:text-emerald-700">{((standardEffectiveRate * partition.csll)).toFixed(3)}%</td>
                    <td className="py-1 px-2 font-mono">{formatCurrencyBRL((company.monthlyRevenue || 100000) * ((standardEffectiveRate * partition.csll) / 100))}</td>
                    <td className="py-1 px-2 text-emerald-400 print:text-emerald-700 font-semibold">Retido no DAS</td>
                  </tr>
                  <tr>
                    <td className="py-1 px-2 font-semibold text-white print:text-slate-900">CPP (Previdência)</td>
                    <td className="py-1 px-2 text-slate-400 print:text-slate-600">INSS Patronal</td>
                    <td className="py-1 px-2 font-mono">{(partition.cpp * 100).toFixed(2)}%</td>
                    <td className="py-1 px-2 font-mono text-emerald-400 print:text-emerald-700">{((standardEffectiveRate * partition.cpp)).toFixed(3)}%</td>
                    <td className="py-1 px-2 font-mono">{formatCurrencyBRL((company.monthlyRevenue || 100000) * ((standardEffectiveRate * partition.cpp) / 100))}</td>
                    <td className="py-1 px-2 text-emerald-400 print:text-emerald-700 font-semibold">{effectiveAnexo === 'IV' ? 'Fora na DCTFWeb' : 'Retido no DAS'}</td>
                  </tr>
                  <tr className="bg-rose-950/10 print:bg-rose-50">
                    <td className="py-1 px-2 font-semibold text-rose-300 print:text-rose-700">PIS + COFINS</td>
                    <td className="py-1 px-2 text-slate-400 print:text-slate-600">Substituído pela CBS</td>
                    <td className="py-1 px-2 font-mono text-rose-300 print:text-rose-700">{((partition.pis + partition.cofins) * 100).toFixed(2)}%</td>
                    <td className="py-1 px-2 font-mono text-rose-300 print:text-rose-700">{((standardEffectiveRate * (partition.pis + partition.cofins))).toFixed(3)}%</td>
                    <td className="py-1 px-2 font-mono text-rose-300 print:text-rose-700">{formatCurrencyBRL((company.monthlyRevenue || 100000) * ((standardEffectiveRate * (partition.pis + partition.cofins)) / 100))}</td>
                    <td className="py-1 px-2 text-rose-400 print:text-rose-700 font-semibold">Expurgado (CBS 8,8%)</td>
                  </tr>
                  <tr className="bg-rose-950/10 print:bg-rose-50">
                    <td className="py-1 px-2 font-semibold text-rose-300 print:text-rose-700">{effectiveAnexo === 'I' || effectiveAnexo === 'II' ? 'ICMS' : 'ISS'}</td>
                    <td className="py-1 px-2 text-slate-400 print:text-slate-600">Substituído pelo IBS</td>
                    <td className="py-1 px-2 font-mono text-rose-300 print:text-rose-700">{((partition.icms || partition.iss) * 100).toFixed(2)}%</td>
                    <td className="py-1 px-2 font-mono text-rose-300 print:text-rose-700">{((standardEffectiveRate * (partition.icms || partition.iss))).toFixed(3)}%</td>
                    <td className="py-1 px-2 font-mono text-rose-300 print:text-rose-700">{formatCurrencyBRL((company.monthlyRevenue || 100000) * ((standardEffectiveRate * (partition.icms || partition.iss)) / 100))}</td>
                    <td className="py-1 px-2 text-rose-400 print:text-rose-700 font-semibold">Expurgado (IBS 17,7%)</td>
                  </tr>
                </tbody>
                <tfoot className="bg-slate-800 print:bg-slate-100 font-bold text-white print:text-slate-900 text-[10px]">
                  <tr>
                    <td className="py-1 px-2">TOTAL DAS</td>
                    <td className="py-1 px-2">DAS Reduzido no Híbrido</td>
                    <td className="py-1 px-2 font-mono">100,00%</td>
                    <td className="py-1 px-2 font-mono text-emerald-400 print:text-emerald-700">{standardEffectiveRate.toFixed(3)}%</td>
                    <td className="py-1 px-2 font-mono">{formatCurrencyBRL((company.monthlyRevenue || 100000) * (standardEffectiveRate / 100))}</td>
                    <td className="py-1 px-2 text-indigo-400 print:text-indigo-800 font-mono">
                      DAS Reduzido: {reducedDasRate.toFixed(3)}% ({formatCurrencyBRL(reducedDasMonthly)})
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>
        </div>

        {/* RODAPÉ DA PÁGINA 2 */}
        <footer className="pt-2.5 border-t border-slate-800 print:border-slate-300 flex justify-between items-center text-[9px] text-slate-500 print:text-slate-600 font-mono mt-2">
          <span>Sistema Vértice Auditor Fiscal v3.8 • Dossiê Pericial de Viabilidade</span>
          <span className="font-bold uppercase tracking-wider text-indigo-400 print:text-indigo-800">Página 2 de 3</span>
        </footer>
      </div>

      {/* =========================================================================
          PÁGINA 3: TRANSIÇÃO, PARECER CONCLUSIVO, DIRETRIZES & CHANCELA DIGITAL
          ========================================================================= */}
      <div 
        data-report-page="3" 
        className="report-page report-page-3 relative overflow-hidden p-6 sm:p-7 bg-[#0B0F19] print:bg-white text-slate-100 print:text-slate-900 rounded-2xl border border-slate-800 print:border-none shadow-2xl flex flex-col justify-between"
        style={{ minHeight: '1020px' }}
      >
        {/* Marca D'água Pericial */}
        <div className="report-watermark absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden" aria-hidden="true">
          <BrandLogo variant="watermark" size="2xl" watermarkOpacity={0.035} className="transform -rotate-12 scale-110" />
        </div>

        <div className="relative z-10 space-y-4">
          {/* CABEÇALHO DE CONTINUAÇÃO OFICIAL */}
          <header className="flex justify-between items-center border-b-2 border-slate-800 print:border-slate-300 pb-2.5">
            <div className="flex items-center space-x-2">
              <BrandLogo variant="report" className="text-white print:text-slate-900" />
              <div className="border-l border-slate-700 print:border-slate-300 pl-2">
                <span className="text-[10px] font-bold text-indigo-400 print:text-indigo-800 uppercase tracking-widest block">
                  Parecer Técnico Pericial de Viabilidade • Conclusão
                </span>
                <span className="text-xs font-bold text-white print:text-slate-900">
                  {company.name || 'Empresa Auditada'} — CNPJ: {company.cnpj || 'Sem dados'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-mono text-slate-400 print:text-slate-600 block">Protocolo de Segurança</span>
              <span className="text-[10px] font-mono font-bold text-indigo-400 print:text-indigo-800">{securityRecord?.hashFormatted || 'VF-2026-SIMPLES-HIBRIDO'}</span>
            </div>
          </header>

          {/* 7. CRONOGRAMA OFICIAL DE TRANSIÇÃO 2026-2033 */}
          <section className="avoid-break space-y-2">
            <h3 className="text-[11px] font-bold text-slate-300 print:text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              7. Cronograma Oficial de Transição da Reforma Tributária (EC 132/23 & LC 214/25)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-[9px]">
              <div className="p-2 rounded-lg bg-slate-900/90 print:bg-slate-50 border border-slate-800 print:border-slate-200">
                <span className="font-bold text-indigo-400 print:text-indigo-800 block">2026: Ano Teste</span>
                <p className="text-slate-300 print:text-slate-600 mt-0.5">Alíquota teste de 0,9% CBS + 0,1% IBS compensável com PIS/COFINS.</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/90 print:bg-slate-50 border border-slate-800 print:border-slate-200">
                <span className="font-bold text-indigo-400 print:text-indigo-800 block">2027: CBS Plena</span>
                <p className="text-slate-300 print:text-slate-600 mt-0.5">Extinção de PIS/COFINS. CBS federal entra em vigor plena (8,8%).</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/90 print:bg-slate-50 border border-slate-800 print:border-slate-200">
                <span className="font-bold text-indigo-400 print:text-indigo-800 block">2029-32: Transição IBS</span>
                <p className="text-slate-300 print:text-slate-600 mt-0.5">ICMS e ISS são reduzidos anualmente e substituídos pelo IBS.</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/90 print:bg-slate-50 border border-slate-800 print:border-slate-200">
                <span className="font-bold text-emerald-400 print:text-emerald-800 block">2033: Vigência Total</span>
                <p className="text-slate-300 print:text-slate-600 mt-0.5">Novo modelo IVA Dual plenamente implantado em todo o território nacional.</p>
              </div>
            </div>
          </section>

          {/* 8. PARECER PERICIAL E VEREDITO ESTRATÉGICO */}
          <section className="avoid-break space-y-2">
            <h3 className="text-[11px] font-bold text-slate-300 print:text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              8. Parecer Pericial de Viabilidade & Veredito Final
            </h3>

            <div className="p-3 rounded-xl border bg-slate-900/90 print:bg-slate-50 border-indigo-500/30 print:border-slate-300 space-y-2">
              <div>
                <h4 className="text-xs font-bold text-white print:text-slate-900">
                  {technicalOpinion.title}
                </h4>
                <p className="text-[9px] text-slate-400 print:text-slate-600 font-mono">{technicalOpinion.legalBasis}</p>
              </div>

              {/* Diagnóstico Financeiro */}
              <div className="space-y-0.5 text-[10px] text-slate-300 print:text-slate-700 leading-snug border-t border-slate-800 print:border-slate-200 pt-1.5">
                <strong className="text-white print:text-slate-900 block font-semibold text-[10px]">1. Diagnóstico do Cenário Financeiro (Fluxo de Caixa):</strong>
                <p className="whitespace-pre-line">{technicalOpinion.section1_FinancialDiagnostic.text}</p>
              </div>

              {/* Diagnóstico B2B vs B2C */}
              <div className="space-y-0.5 text-[10px] text-slate-300 print:text-slate-700 leading-snug border-t border-slate-800 print:border-slate-200 pt-1.5">
                <strong className="text-white print:text-slate-900 block font-semibold text-[10px]">2. Diagnóstico de Posicionamento de Mercado B2B ({technicalOpinion.section2_MarketDiagnostic.b2bPercentFormatted}):</strong>
                <p><strong>Impacto no Simples Tradicional:</strong> {technicalOpinion.section2_MarketDiagnostic.textTradicional}</p>
                <p className="mt-0.5"><strong>Impacto no Simples Híbrido:</strong> {technicalOpinion.section2_MarketDiagnostic.textHibrido}</p>
              </div>

              {/* Veredito */}
              <div className="p-2.5 rounded-lg bg-indigo-950/40 print:bg-indigo-50 border border-indigo-500/30 print:border-indigo-200 text-[10px] text-slate-200 print:text-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-indigo-300 print:text-indigo-900 font-bold">3. Recomendação e Decisão Estratégica:</strong>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 print:text-indigo-800 border border-indigo-500/30">
                    {technicalOpinion.section3_RecommendationVerdict.verdictShort}
                  </span>
                </div>
                <p><strong>Justificativa Comercial:</strong> {technicalOpinion.section3_RecommendationVerdict.commercialJustification}</p>
                <p className="text-slate-400 print:text-slate-600"><strong>Nota de Risco Operacional:</strong> {technicalOpinion.section3_RecommendationVerdict.riskNote}</p>
              </div>
            </div>
          </section>

          {/* 9. DIRETRIZES TÁTICAS RECOMENDADAS */}
          <section className="avoid-break space-y-1.5">
            <h3 className="text-[11px] font-bold text-slate-300 print:text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
              9. Plano de Ação Tático para a Gestão da Empresa
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[9px]">
              <div className="p-2 rounded-lg bg-slate-900/90 print:bg-slate-50 border border-slate-800 print:border-slate-200">
                <strong className="text-indigo-300 print:text-indigo-900 block font-semibold mb-0.5">1. Gestão de Compras</strong>
                <p className="text-slate-300 print:text-slate-600">Priorizar fornecedores do regime geral para garantir crédito integral de 26,5% no IBS/CBS.</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/90 print:bg-slate-50 border border-slate-800 print:border-slate-200">
                <strong className="text-indigo-300 print:text-indigo-900 block font-semibold mb-0.5">2. Política Comercial B2B</strong>
                <p className="text-slate-300 print:text-slate-600">Destacar nas propostas comerciais o valor do crédito de 26,5% que o cliente PJ irá recuperar.</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/90 print:bg-slate-50 border border-slate-800 print:border-slate-200">
                <strong className="text-indigo-300 print:text-indigo-900 block font-semibold mb-0.5">3. Monitoramento Anual</strong>
                <p className="text-slate-300 print:text-slate-600">Revisar a opção em janeiro de cada ano-calendário conforme o volume de faturamento e insumos.</p>
              </div>
            </div>
          </section>

          {/* 10. BLOCO OFICIAL DE ASSINATURA E CHANCELA DIGITAL */}
          <section className="avoid-break pt-2 border-t-2 border-slate-800 print:border-slate-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
              <div className="space-y-1 text-[8.5px] text-slate-400 print:text-slate-600 leading-tight">
                <div className="flex items-center space-x-1 text-indigo-400 print:text-indigo-800 font-bold uppercase tracking-wider text-[9px]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Chancela Digital de Validade Jurídica</span>
                </div>
                <p>
                  Este parecer técnico foi emitido em conformidade com as diretrizes da Emenda Constitucional nº 132/2023, Lei Complementar nº 123/2006 e Lei Complementar nº 214/2025. Os créditos de IBS/CBS observam a não-cumulatividade plena sobre aquisições idôneas.
                </p>
                <p className="font-mono text-[8px] text-slate-500">
                  Protocolo: {securityRecord?.hashFormatted || 'VF-2026-SIMPLES-HIBRIDO'} • Sistema Vértice Auditor Fiscal v3.8
                </p>
              </div>

              <div className="text-center md:text-right">
                <div className="inline-block text-center border-t border-slate-700 print:border-slate-400 pt-1 px-6 min-w-[220px]">
                  <div className="font-bold text-[10px] text-white print:text-slate-900">
                    {signatoryInfo.signatoryName}
                  </div>
                  <div className="text-[8.5px] text-slate-400 print:text-slate-600 font-medium">
                    {signatoryInfo.signatoryRoleTitle}
                  </div>
                  <div className="text-[8px] font-mono text-indigo-400 print:text-indigo-800 mt-0.5 font-semibold">
                    {signatoryInfo.signatoryDocumentLine}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* RODAPÉ DA PÁGINA 3 */}
        <footer className="pt-2.5 border-t border-slate-800 print:border-slate-300 flex justify-between items-center text-[9px] text-slate-500 print:text-slate-600 font-mono mt-2">
          <span>Sistema Vértice Auditor Fiscal v3.8 • Dossiê Pericial de Viabilidade</span>
          <span className="font-bold uppercase tracking-wider text-indigo-400 print:text-indigo-800">Página 3 de 3 • Conclusão</span>
        </footer>
      </div>
    </div>
  );
};
