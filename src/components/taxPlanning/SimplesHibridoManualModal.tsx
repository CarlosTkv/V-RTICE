import React, { useState } from 'react';
import { 
  BookOpen, 
  Scale, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  FileText, 
  Layers, 
  Calculator, 
  Percent, 
  TrendingUp, 
  Users, 
  Building2, 
  X, 
  Printer, 
  ExternalLink,
  Lock,
  Share2,
  HelpCircle,
  Zap,
  Info
} from 'lucide-react';
import { CompanyData } from '../../types';

interface SimplesHibridoManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  company?: CompanyData;
}

export const SimplesHibridoManualModal: React.FC<SimplesHibridoManualModalProps> = ({
  isOpen,
  onClose,
  company
}) => {
  const [activeSection, setActiveSection] = useState<'fundamentacao' | 'travas' | 'cenarios' | 'campos' | 'passo_a_passo' | 'faq'>('fundamentacao');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl bg-[#0F172A] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0B0F19]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Manual Operacional & Doutrinário: Simples Híbrido</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono border border-indigo-500/30">
                  EC 132/2023 • PLP 68/2024
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Guia pericial completo sobre premissas, travas de viabilidade, cálculo de créditos e operação do módulo
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition border border-slate-800 cursor-pointer no-print"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Manual</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-6 py-2.5 bg-slate-900/60 border-b border-slate-800 overflow-x-auto gap-2 no-scrollbar">
          <button
            onClick={() => setActiveSection('fundamentacao')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'fundamentacao'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>1. Fundamentação Constitucional</span>
          </button>

          <button
            onClick={() => setActiveSection('travas')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'travas'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>2. As 3 Travas Críticas</span>
          </button>

          <button
            onClick={() => setActiveSection('cenarios')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'cenarios'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>3. Matriz Decisória (Cenários A e B)</span>
          </button>

          <button
            onClick={() => setActiveSection('campos')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'campos'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>4. Dicionário de Campos & Cadastro</span>
          </button>

          <button
            onClick={() => setActiveSection('passo_a_passo')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'passo_a_passo'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>5. Passo a Passo de Emissão & Compartilhamento</span>
          </button>

          <button
            onClick={() => setActiveSection('faq')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'faq'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>6. Perguntas Frequentes (FAQ)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-300 text-xs sm:text-sm leading-relaxed">
          
          {/* SEÇÃO 1: FUNDAMENTAÇÃO CONSTITUCIONAL */}
          {activeSection === 'fundamentacao' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 space-y-3">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">O Marco da Reforma Tributária</span>
                </div>
                <h3 className="text-base font-bold text-white">
                  O que é o Regime Simples Híbrido (EC 132/2023)?
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  A Emenda Constitucional nº 132/2023 alterou o <strong>Art. 146, § 1º, IV da Constituição Federal</strong>, permitindo que as microempresas (ME) e empresas de pequeno porte (EPP) optantes pelo Simples Nacional escolham apurar o <strong>IBS (Imposto sobre Bens e Serviços)</strong> e a <strong>CBS (Contribuição sobre Bens e Serviços)</strong> fora da sistemática unificada do DAS, pelo regime não-cumulativo geral, enquanto mantêm os demais tributos (IRPJ, CSLL, PIS/COFINS federais residuais e Contribuição Previdenciária Patronal - CPP) recolhidos no DAS com alíquota reduzida.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#0B0F19] border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Como Funciona a Cisão do DAS</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span><strong>Expurgo das Frações:</strong> Do valor total da alíquota efetiva do DAS, são expurgadas as frações relativas ao ICMS e/ou ISS de acordo com a tabela oficial da LC 123/2006.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span><strong>DAS Residual Reduzido:</strong> O contribuinte recolhe uma guia DAS muito menor, contendo apenas IRPJ, CSLL, CPP (se Anexo I, II, III ou V).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span><strong>Guia Própria IBS/CBS:</strong> Apura o débito de IBS/CBS sobre suas saídas (26,50% padrão) e desconta os créditos de suas entradas de mercadorias e serviços.</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-[#0B0F19] border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase">
                    <Users className="w-4 h-4" />
                    <span>O Poder Competitivo no Mercado B2B</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    No <strong>Simples Tradicional</strong>, a empresa transfere para seus clientes adquirentes apenas uma fração minúscula de crédito (ex: 1,8% a 4,2%). No <strong>Simples Híbrido</strong>, a empresa transfere o <strong>crédito integral de 26,50% de IBS/CBS</strong> na nota fiscal.
                  </p>
                  <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-800/40 text-[11px] text-blue-300">
                    💡 <em>Isso elimina a barreira comercial que fazia grandes empresas rejeitarem compras de fornecedores do Simples Nacional.</em>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SEÇÃO 2: AS 3 TRAVAS CRÍTICAS */}
          {activeSection === 'travas' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200">
                <p className="font-semibold">
                  O Vértice Auditor Fiscal processa 3 travas matemáticas e regulatórias simultâneas para garantir que a recomendação ao cliente seja 100% segura e juridicamente blindada:
                </p>
              </div>

              <div className="space-y-4">
                {/* Trava 1 */}
                <div className="p-4 rounded-2xl bg-[#0B0F19] border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 uppercase font-mono">Trava 01</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">Sublimite Estadual</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">Sublimite de R$ 3.600.000,00 (LC 123/06 Art. 19/20)</h4>
                  <p className="text-xs text-slate-300">
                    Se o faturamento acumulado (RBT12) da empresa ultrapassar R$ 3,6 milhões, ela é <strong>obrigatoriamente excluída</strong> do recolhimento de ICMS e ISS no DAS, sendo compelida a recolher tais tributos no regime normal. O módulo detecta essa transição antecipadamente e demonstra que a opção pelo Simples Híbrido já regulariza a apuração sem traumas operacionais.
                  </p>
                </div>

                {/* Trava 2 */}
                <div className="p-4 rounded-2xl bg-[#0B0F19] border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400 uppercase font-mono">Trava 02</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">Fator R & Enquadramento</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">Impacto do Fator R (Folha de Pagamento ≥ 28%)</h4>
                  <p className="text-xs text-slate-300">
                    Empresas de serviços intelectuais e técnicos sujeitas ao Fator R que mantêm folha/pró-labore acima de 28% tributam pelo <strong>Anexo III (alíquota a partir de 6%)</strong>, onde a fração de ISS expurgada é de até 33,5%. Se caírem no <strong>Anexo V (15,50%+)</strong>, a perda financeira é drástica. O módulo recalcula instantaneamente as alíquotas residuais considerando a massa salarial exata cadastrada.
                  </p>
                </div>

                {/* Trava 3 */}
                <div className="p-4 rounded-2xl bg-[#0B0F19] border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-400 uppercase font-mono">Trava 03</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">Cadeia de Fornecedores</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">Crédito de Entrada vs. Fornecedores Optantes do Simples</h4>
                  <p className="text-xs text-slate-300">
                    O motor calcula que insumos comprados de fornecedores do Regime Geral geram <strong>crédito cheio de 26,50%</strong> de IBS/CBS. Já compras efetuadas de outras empresas do Simples Nacional geram crédito restrito à alíquota de IBS/CBS recolhida na guia DAS daquele fornecedor (~3,5% a 6,5%). O sistema pondera o percentual informado de compras do Simples para apurar o crédito líquido exato.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SEÇÃO 3: MATRIZ DECISÓRIA */}
          {activeSection === 'cenarios' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-800/40 text-xs text-indigo-300">
                O módulo apresenta uma <strong>Matriz Dual de Decisão</strong> para que o consultor e o empresário compreendam o impacto sob duas óticas complementares:
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#0B0F19] border border-emerald-900/40 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
                    <Calculator className="w-4 h-4" />
                    <span>Cenário A: Perspectiva Financeira</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">Carga Tributária Própria no Caixa</h4>
                  <p className="text-xs text-slate-300">
                    Analisa o desembolso líquido direto efetuado pela empresa:
                  </p>
                  <div className="p-3 rounded-xl bg-slate-950 font-mono text-[11px] text-emerald-300 space-y-1">
                    <div>Total Pago = DAS Residual + (IBS/CBS Saídas - Créditos Entradas)</div>
                  </div>
                  <p className="text-xs text-slate-400">
                    Indicado para empresas que vendem diretamente para o consumidor final (B2C), onde o crédito repassado na nota não gera valor adicional para o comprador.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#0B0F19] border border-blue-900/40 space-y-3">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase">
                    <TrendingUp className="w-4 h-4" />
                    <span>Cenário B: Perspectiva Comercial B2B</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">Vantagem Competitiva e Crédito ao Cliente</h4>
                  <p className="text-xs text-slate-300">
                    Analisa o custo real da sua nota fiscal para o cliente empresarial (PJ):
                  </p>
                  <div className="p-3 rounded-xl bg-slate-950 font-mono text-[11px] text-blue-300 space-y-1">
                    <div>Custo Efetivo p/ Cliente = Preço Nota Fiscal - Crédito IBS/CBS (26,50%)</div>
                  </div>
                  <p className="text-xs text-slate-400">
                    Fundamental para indústrias, distribuidores e prestadores B2B, permitindo fechar contratos maiores e evitar que clientes exijam desconto no preço por falta de crédito.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SEÇÃO 4: DICIONÁRIO DE CAMPOS & CADASTRO */}
          {activeSection === 'campos' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-[#0B0F19] border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                  <Building2 className="w-4 h-4" />
                  <span>Integração 100% com o Cadastro Permanente da Empresa</span>
                </div>
                <p className="text-xs text-slate-300">
                  Todos os dados fundamentais (Razão Social, CNPJ, CNAE, Anexo, RBT12, Receita Mensal, Folha de Pagamento e Pró-Labore) são lidos automaticamente do cadastro ativo da empresa selecionada no cabeçalho do sistema.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-800 rounded-2xl overflow-hidden">
                  <thead className="bg-[#0B0F19] text-slate-300 font-mono uppercase text-[11px]">
                    <tr>
                      <th className="p-3 border-b border-slate-800">Parâmetro</th>
                      <th className="p-3 border-b border-slate-800">Origem Cadastral</th>
                      <th className="p-3 border-b border-slate-800">Impacto no Cálculo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-[#0F172A]">
                    <tr>
                      <td className="p-3 font-semibold text-white">Anexo do Simples (I a V)</td>
                      <td className="p-3 text-indigo-300 font-mono">company.anexo</td>
                      <td className="p-3 text-slate-300">Determina a tabela de alíquotas oficiais e o percentual de partilha do ICMS/ISS a ser expurgado no DAS.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">Receita RBT12 & Mensal</td>
                      <td className="p-3 text-indigo-300 font-mono">company.rbt12 / monthlyRevenue</td>
                      <td className="p-3 text-slate-300">Fixa a faixa de enquadramento da LC 123/06 e calcula a alíquota nominal e efetiva do DAS.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">Folha 12m & Pró-Labore</td>
                      <td className="p-3 text-indigo-300 font-mono">company.payroll12m / monthlyPayroll</td>
                      <td className="p-3 text-slate-300">Calcula o Fator R (≥ 28%) para alternância automática entre Anexos III e V.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">% Compras & Insumos Tributados</td>
                      <td className="p-3 text-indigo-300 font-mono">company.inputCostsPercent</td>
                      <td className="p-3 text-slate-300">Define o volume financeiro de aquisições geradoras de crédito na não-cumulatividade de IBS/CBS.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">% Vendas para Clientes PJ (B2B)</td>
                      <td className="p-3 text-indigo-300 font-mono">company.b2bSalesPercent</td>
                      <td className="p-3 text-slate-300">Controla o peso do benefício de crédito transferido no Cenário B e nos gráficos de Breakeven.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">Alíquota Alvo IVA (IBS+CBS)</td>
                      <td className="p-3 text-indigo-300 font-mono">company.targetIvaRate (26,5%)</td>
                      <td className="p-3 text-slate-300">Alíquota de referência padrão projetada pela EC 132/23 para débito nas saídas e crédito nas entradas.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SEÇÃO 5: PASSO A PASSO DE EMISSÃO & COMPARTILHAMENTO */}
          {activeSection === 'passo_a_passo' && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#0B0F19] border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">1</div>
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-white">Selecione ou Cadastre a Empresa no Topo</h5>
                    <p className="text-xs text-slate-400">
                      O módulo herda imediatamente todos os números contábeis, faturamento e folha da empresa selecionada.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#0B0F19] border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">2</div>
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-white">Ajuste a % de Compras e % de Vendas B2B nos Sliders</h5>
                    <p className="text-xs text-slate-400">
                      Veja em tempo real o gráfico de sensibilidade e o parecer técnico mudarem de cor (Verde = Híbrido Vencedor | Âmbar = Simples Tradicional Recomendado).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#0B0F19] border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">3</div>
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-white">Emita o Laudo Técnico Pericial em PDF</h5>
                    <p className="text-xs text-slate-400">
                      Clique em <strong>"Laudo Oficial PDF"</strong> para abrir o documento formal pericial formatado para impressão ou exportação em PDF com carimbo de homologação tributária.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#0B0F19] border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">4</div>
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-white">Liberar Acesso Exclusivo para o Cliente (1-Clique)</h5>
                    <p className="text-xs text-slate-400">
                      Clique em <strong>"Liberar para Cliente"</strong>. Escolha se deseja Modo Interativo ou Somente Leitura, defina um PIN opcional de 4 dígitos e envie o link por WhatsApp ou E-mail. O cliente verá somente o simulador e laudo da sua própria empresa!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SEÇÃO 6: PERGUNTAS FREQUENTES (FAQ) */}
          {activeSection === 'faq' && (
            <div className="space-y-3 animate-fade-in">
              <div className="p-4 rounded-2xl bg-[#0B0F19] border border-slate-800 space-y-2">
                <h5 className="text-xs font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-400" />
                  <span>A opção pelo Simples Híbrido é anual e irretratável?</span>
                </h5>
                <p className="text-xs text-slate-400">
                  Sim. De acordo com a regulamentação do PLP 68/2024, a opção pelo regime de IBS/CBS fora do Simples deve ser formalizada em janeiro de cada ano-calendário, produzindo efeitos para todo o exercício.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0B0F19] border border-slate-800 space-y-2">
                <h5 className="text-xs font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-400" />
                  <span>Empresas do Anexo IV têm vantagem no Simples Híbrido?</span>
                </h5>
                <p className="text-xs text-slate-400">
                  Sim, em especial empresas de construção civil e vigilância com alto volume de subcontratações e compras com notas de Regime Geral, além de transferirem crédito integral aos contratantes.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0B0F19] border border-slate-800 space-y-2">
                <h5 className="text-xs font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-400" />
                  <span>O que acontece se a empresa alterar o faturamento no meio do ano?</span>
                </h5>
                <p className="text-xs text-slate-400">
                  O módulo permite simular faixas progressivas no gráfico de Sensibilidade e Ponto de Equilíbrio, identificando exatamente em qual volume de receita a opção permanece economicamente favorável.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#0B0F19] border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Documentação Técnica Homologada • Vértice Auditor Fiscal</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition cursor-pointer shadow-md"
          >
            Entendido / Fechar Manual
          </button>
        </div>

      </div>
    </div>
  );
};
