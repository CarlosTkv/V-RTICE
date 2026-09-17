import React, { useState } from 'react';
import {
  X,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  Building2,
  Users,
  Scale,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileText,
  BadgeAlert,
  Percent,
  ChevronDown,
  ChevronUp,
  Info,
  ShieldAlert,
  Calculator,
  Briefcase,
  BookOpen
} from 'lucide-react';
import { CompanyData, CalculationResult } from '../types';
import { formatCurrencyBRL, formatPercentBR } from '../utils/taxRules';

interface RegimeDecisionExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyData;
  calculation: CalculationResult;
  onNavigateToTab?: (tab: any) => void;
}

export const RegimeDecisionExplanationModal: React.FC<RegimeDecisionExplanationModalProps> = ({
  isOpen,
  onClose,
  company,
  calculation,
  onNavigateToTab,
}) => {
  const [activeTab, setActiveTab] = useState<'fundamentacao' | 'pilares' | 'simulacao_b2b' | 'regras_ouro'>('fundamentacao');

  if (!isOpen) return null;

  const bestRegime = calculation.bestRegime;
  const simplesRegime = calculation.regimesComparison.find(r => r.regime === 'simples_padrao');
  const isSimplesRecommended = bestRegime.regime === 'simples_padrao';

  const simplesNetProfit = simplesRegime?.dre.netProfitFinal ?? 0;
  const recommendedNetProfit = bestRegime.dre.netProfitFinal ?? 0;
  const profitDifference = simplesNetProfit - recommendedNetProfit;
  const hasSimplesHigherProfit = !isSimplesRecommended && profitDifference > 0;

  // Parâmetros para simulação concreta de perda comercial B2B
  const b2bPercent = (company.b2bSalesPercent || 50) / 100;
  const annualRevenue = company.monthlyRevenue * 12;
  const annualB2bRevenue = annualRevenue * b2bPercent;
  const creditLossRate = Math.max(0, 0.265 - (simplesRegime?.b2bCreditRatePercent ? simplesRegime.b2bCreditRatePercent / 100 : 0.035));
  const estimatedB2bMarketDisadvantage = annualB2bRevenue * creditLossRate;
  const simplesProfitAdjustedForB2b = Math.max(0, simplesNetProfit - (annualB2bRevenue * 0.08)); // Se o cliente exigir 8% de desconto médio

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto font-sans animate-fadeIn">
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden my-auto text-slate-100">
        
        {/* Header Superior */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-[#0B0F19]">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-xs">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-sans uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-blue-950/60 text-blue-300 font-bold border border-blue-800/60">
                  Dossiê Técnico de Auditoria Fiscal
                </span>
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                  Decisão Multicritério Estratégica
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 mt-1 leading-snug">
                Por que o Regime Recomendado pode divergir do Maior Lucro Líquido contábil da DRE?
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Navegação Interna */}
        <div className="px-6 py-2.5 bg-[#0B0F19] border-b border-slate-800 flex items-center space-x-2  text-xs font-semibold scrollbar-none">
          <button
            onClick={() => setActiveTab('fundamentacao')}
            className={`px-3.5 py-1.5 rounded-xl transition  cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'fundamentacao'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Fundamentação & Conceito</span>
          </button>

          <button
            onClick={() => setActiveTab('pilares')}
            className={`px-3.5 py-1.5 rounded-xl transition  cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'pilares'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Os 4 Motivos Fundamentais</span>
          </button>

          <button
            onClick={() => setActiveTab('simulacao_b2b')}
            className={`px-3.5 py-1.5 rounded-xl transition  cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'simulacao_b2b'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Simulação Real: Efeito no Lucro</span>
          </button>

          <button
            onClick={() => setActiveTab('regras_ouro')}
            className={`px-3.5 py-1.5 rounded-xl transition  cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'regras_ouro'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Guia Prático de Decisão</span>
          </button>
        </div>

        {/* Conteúdo Principal Scrollável */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed bg-[#0B0F19]">

          {/* Banner de Diagnóstico Específico da Empresa Atual */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-sans uppercase tracking-wider px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 font-bold border border-blue-800/60">
                    Diagnóstico Vigente
                  </span>
                  <span className="text-slate-100 font-bold text-sm">
                    {company.name} (CNPJ: {company.cnpj || '00.000.000/0001-00'})
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {hasSimplesHigherProfit ? (
                    <>
                      Na DRE contábil estática, o <strong className="text-emerald-400">Simples Nacional</strong> projeta Lucro Líquido de <strong>{formatCurrencyBRL(simplesNetProfit)}</strong> (aparentando ser {formatCurrencyBRL(profitDifference)} superior ao regime recomendado). Porém, o sistema recomenda oficialmente o <strong className="text-blue-400 font-bold">{bestRegime.name}</strong> (Score {bestRegime.recommendationScore}/100).
                    </>
                  ) : (
                    <>
                      O regime recomendado para a empresa é o <strong className="text-emerald-400 font-bold">{bestRegime.name}</strong>, com carga consolidada de <strong>{formatCurrencyBRL(bestRegime.annualTaxTotal)}/ano</strong> e Score de precisão <strong>{bestRegime.recommendationScore}/100</strong>.
                    </>
                  )}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 shrink-0 font-mono text-[11px]">
                <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-right shadow-xs">
                  <span className="text-[9px] text-slate-500 block uppercase font-bold font-sans">RBT12 Vigente</span>
                  <span className="text-slate-100 font-bold">{formatCurrencyBRL(company.rbt12)}</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-right shadow-xs">
                  <span className="text-[9px] text-slate-500 block uppercase font-bold font-sans">Vendas B2B</span>
                  <span className="text-blue-400 font-bold">{company.b2bSalesPercent || 50}%</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-right shadow-xs">
                  <span className="text-[9px] text-slate-500 block uppercase font-bold font-sans">Folha Mensal</span>
                  <span className="text-slate-100 font-bold">{formatCurrencyBRL(company.monthlyPayroll)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ABA 1: FUNDAMENTAÇÃO & CONCEITO */}
          {activeTab === 'fundamentacao' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xs">
                <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                  <Info className="w-5 h-5 text-blue-400" />
                  <span>Entendendo o Princípio da Auditoria Multicritério</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 text-justify leading-relaxed">
                  Quando um relatório de DRE aponta que o <strong>Simples Nacional apresenta maior Lucro Líquido contábil</strong>, mas o sistema recomenda outro regime (como <strong>Lucro Presumido, Lucro Real ou Simples Híbrido</strong>), isso ocorre porque a viabilidade de uma empresa <strong>não depende exclusivamente do cálculo estático de impostos no mês</strong>, mas sim de uma <strong>avaliação multicritério</strong> que pondera fatores econômicos, comerciais e legais.
                </p>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 shadow-xs">
                  <strong className="text-blue-400">A premissa oculta da DRE estática:</strong> O demonstrativo de resultado contábil assume que seus clientes continuarão comprando rigorosamente o mesmo volume pelo mesmo preço de venda, independente de você emitir nota no Simples ou no Regime Normal. No mundo corporativo, essa premissa é falsa: empresas compradoras exigem crédito fiscal ou desconto equivalente.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold font-mono">
                    A
                  </div>
                  <h4 className="font-bold text-slate-100 text-sm">Cálculo Estático (DRE)</h4>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    Compara faturamento bruto deduzindo tributos, custo de mercadoria e folha. Ignora se o cliente exigirá desconto ou se recusará a comprar pela falta de crédito do PIS/COFINS ou IBS/CBS.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold font-mono">
                    B
                  </div>
                  <h4 className="font-bold text-slate-100 text-sm">Realidade Comercial B2B</h4>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    Clientes pessoas jurídicas que operam no Lucro Real ou no novo regime de IVA (IBS/CBS de 26,5%) comparam o <em>custo líquido</em> da aquisição. Sem crédito, a sua proposta fica mais cara na mesa de compras.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold font-mono">
                    C
                  </div>
                  <h4 className="font-bold text-slate-100 text-sm">Segurança Regulatória</h4>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    Riscos de desenquadramento compulsório ao se aproximar de R$ 3,6M ou R$ 4,8M (ou por faturamento de outras empresas dos mesmos sócios conforme LC 123/06 art. 3º, § 4º).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ABA 2: OS 4 MOTIVOS FUNDAMENTAIS */}
          {activeTab === 'pilares' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3 bg-blue-950/60 border border-blue-800/60 rounded-xl text-xs text-blue-300 font-medium">
                Abaixo estão detalhados os <strong>4 motivos fundamentais</strong> que explicam por que o melhor regime estratégico diverge do lucro nominal da DRE:
              </div>

              {/* Motivo 1 */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xs">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-500/20">
                    1
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-sans uppercase tracking-wider text-blue-400 font-bold block">
                      Pilar Comercial e Reforma Tributária
                    </span>
                    <h4 className="text-sm font-bold text-slate-100">
                      Competitividade Comercial e Créditos para Clientes PJ (Vendas B2B)
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Quando sua empresa vende para outras empresas (B2B), o comprador quer abater créditos fiscais. Na vigência da Reforma Tributária (IBS/CBS), notas emitidas no Simples transferem crédito de apenas 3% a 5%, enquanto concorrentes no Lucro Presumido ou Real entregam 26,5% de crédito pleno.
                    </p>
                  </div>
                </div>
              </div>

              {/* Motivo 2 */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xs">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-sm shrink-0 border border-amber-500/20">
                    2
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-sans uppercase tracking-wider text-amber-400 font-bold block">
                      Pilar de Limites e Obrigações
                    </span>
                    <h4 className="text-sm font-bold text-slate-100">
                      Sublimite Estadual de ICMS/ISS (R$ 3,6 Milhões) e Efeito Bumerangue
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Ao atingir R$ 3,6M de RBT12, a empresa continua no Simples apenas para tributos federais, sendo obrigada a recolher ICMS/ISS por fora no regime normal, entregando SPED Fiscal, EFD-Contribuições e perdendo a simplicidade burocrática.
                    </p>
                  </div>
                </div>
              </div>

              {/* Motivo 3 */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xs">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-500/20">
                    3
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-sans uppercase tracking-wider text-emerald-400 font-bold block">
                      Pilar Operacional e Margem
                    </span>
                    <h4 className="text-sm font-bold text-slate-100">
                      Presunção Legal Favorável e Baixa Carga Efetiva no Presumido/Real
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Em atividades com margem de lucro baixa ou presunção legal reduzida (como transporte de cargas com 8% no Presumido, ou comércio atacadista), o imposto no regime normal pode ser inferior à alíquota marginal da 5ª ou 6ª faixa do Simples Nacional.
                    </p>
                  </div>
                </div>
              </div>

              {/* Motivo 4 */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xs">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold text-sm shrink-0 border border-rose-500/20">
                    4
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-sans uppercase tracking-wider text-rose-400 font-bold block">
                      Pilar Societário e Conformidade
                    </span>
                    <h4 className="text-sm font-bold text-slate-100">
                      Regra de Sócios em Múltiplas Empresas (Art. 3º § 4º da LC 123/06)
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Se os sócios possuem participação em outros negócios que, somados, ultrapassam R$ 4,8M globais, o enquadramento no Simples Nacional é nulo perante a Receita Federal, gerando autuações retroativas severas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ABA 3: SIMULAÇÃO REAL: EFEITO NO LUCRO */}
          {activeTab === 'simulacao_b2b' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 shadow-xs">
                <h4 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                  <Calculator className="w-4 h-4 text-blue-400" />
                  <span>Simulação Prática de Desconto Comercial B2B</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Veja o que acontece com o lucro real se os clientes PJ exigirem um desconto médio de 8% para compensar a ausência de crédito tributário pleno de IBS/CBS e PIS/COFINS:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xs">
                  <span className="text-xs font-bold text-slate-200 block border-b border-slate-800 pb-2">
                    Cenário Teórico da DRE Estática
                  </span>
                  <div className="space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Receita Bruta Anual:</span>
                      <span className="text-slate-100 font-bold">{formatCurrencyBRL(annualRevenue)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Impostos + Custos + Folha:</span>
                      <span className="text-rose-400">-{formatCurrencyBRL((simplesRegime?.annualTaxTotal || 0) + (company.inputCostsMonthly * 12) + (company.monthlyPayroll * 12) + (company.operationalExpensesMonthly * 12))}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-emerald-400 text-sm">
                      <span>Lucro Líquido Contábil:</span>
                      <span>{formatCurrencyBRL(simplesNetProfit)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 space-y-3 shadow-xs">
                  <span className="text-xs font-bold text-amber-300 block border-b border-amber-800/40 pb-2">
                    Cenário Real com Pressão de Compras B2B
                  </span>
                  <div className="space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Receita Efetiva Realizada:</span>
                      <span className="text-slate-100 font-bold">{formatCurrencyBRL(annualRevenue - (annualB2bRevenue * 0.08))}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Impostos + Custos + Folha:</span>
                      <span className="text-rose-400">-{formatCurrencyBRL((simplesRegime?.annualTaxTotal || 0) + (company.inputCostsMonthly * 12) + (company.monthlyPayroll * 12) + (company.operationalExpensesMonthly * 12))}</span>
                    </div>
                    <div className="pt-2 border-t border-amber-800/40 flex justify-between font-bold text-amber-300 text-sm">
                      <span>Lucro Líquido Real Ajustado:</span>
                      <span>{formatCurrencyBRL(simplesProfitAdjustedForB2b)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/40 text-xs text-blue-200 space-y-1">
                <span className="font-bold block text-blue-300">Conclusão Matemática da Simulação:</span>
                <p className="text-slate-300">
                  Quando o cliente B2B compra de uma empresa no <strong>{bestRegime.name}</strong>, ele toma o crédito tributário integral. Portanto, você <strong>não precisa conceder descontos defensivos</strong> nem correr risco de perder a conta para concorrentes do regime geral.
                </p>
              </div>
            </div>
          )}

          {/* ABA 4: GUIA PRÁTICO DE DECISÃO */}
          {activeTab === 'regras_ouro' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 shadow-xs">
                <h4 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Resumo Prático para sua Tomada de Decisão</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Use estas diretrizes objetivas para respaldar o parecer tributário perante sócios, investidores e diretoria:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Quando escolher o Simples */}
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-3 shadow-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <h5 className="font-bold text-emerald-300 text-sm">Quando o SIMPLES NACIONAL é a melhor opção:</h5>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300 list-disc pl-4 leading-relaxed">
                    <li>
                      <strong>Foco no Consumidor Final (B2C):</strong> Seus clientes são pessoas físicas que não tomam crédito tributário.
                    </li>
                    <li>
                      <strong>Faturamento seguro abaixo de R$ 3,6M:</strong> Sem risco imediato de estourar o sublimite e sem empresas coligadas dos mesmos sócios.
                    </li>
                    <li>
                      <strong>Folha de pagamento alta:</strong> A isenção dos 28,8% de encargos patronais (INSS/CPP) representa economia brutal no caixa mensal.
                    </li>
                  </ul>
                </div>

                {/* Quando migrar para o Recomendado */}
                <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-800/40 space-y-3 shadow-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    <h5 className="font-bold text-blue-300 text-sm">Quando migrar para o REGIME RECOMENDADO:</h5>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300 list-disc pl-4 leading-relaxed">
                    <li>
                      <strong>Vendas B2B relevantes (&gt; 50%):</strong> Clientes corporativos demandam crédito de IBS/CBS (26,5%) e PIS/COFINS (9,25%).
                    </li>
                    <li>
                      <strong>RBT12 acima ou próximo de R$ 3,6M:</strong> Para evitar o transtorno operacional de recolher ICMS/ISS por fora e entregar SPED.
                    </li>
                    <li>
                      <strong>Margem real ou presunção favorável:</strong> Como a presunção de 8% em transportes de cargas (Lei 9.249/95) ou no comércio.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 flex items-center space-x-3 shadow-xs">
                <Briefcase className="w-5 h-5 text-amber-400 shrink-0" />
                <span>
                  <strong>Dica de Auditoria:</strong> Na aba <strong>"Regimes Tributários"</strong>, verifique os campos <strong>Score de Recomendação</strong>, <strong>Percentual de Vendas B2B</strong> e a seção de <strong>Vantagens & Desvantagens</strong> de cada regime para visualizar detalhadamente os pesos aplicados a este diagnóstico.
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Rodapé do Modal */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#0B0F19] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-slate-400">
            Esta fundamentação consta integralmente no Parecer Técnico emitido pelo sistema.
          </span>
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            {onNavigateToTab && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToTab('regimes');
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition cursor-pointer shadow-xs"
              >
                Ver Comparativo dos 4 Regimes
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              Compreendi o Critério
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
