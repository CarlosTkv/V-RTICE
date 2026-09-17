import React, { useState } from 'react';
import { 
  BookOpen, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Sparkles, 
  FileText, 
  Users, 
  Scale, 
  TrendingUp, 
  Layers, 
  PieChart, 
  Building2, 
  Gavel, 
  Award, 
  X,
  ArrowRight
} from 'lucide-react';

interface SystemTourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemTourModal: React.FC<SystemTourModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const tourSteps = [
    {
      moduleCode: 'MÓDULO 01',
      icon: PieChart,
      title: 'VÉRTICE Auditoria & Fator R 360º',
      badge: 'Cockpit & Fator R',
      description:
        'Auditoria e inteligência fiscal de entrada: consolidação do faturamento RBT12, enquadramento do Fator R (28%), pró-labore e comparativo Anexo III vs V.',
      sublevels: [
        '📊 Visão Geral & Cockpit Fiscal: métricas de faturamento, termômetro de risco e sublimites.',
        '⚡ Auditoria Fator R (28%): cálculo do pró-labore ideal para migrar do Anexo V (15,5%+) para o Anexo III (6,0%+).',
        '👥 Pró-Labore & Sócios: cruzamento do QSA da Receita, limites de sócios administradores e encargos.',
        '⚖️ Anexo III vs V: comparativo direto da economia real obtida por segregação de folha.'
      ],
      tip: 'O sistema calcula automaticamente quantos reais de folha ou pró-labore faltam para atingir os 28% do Fator R.'
    },
    {
      moduleCode: 'MÓDULO 02',
      icon: Scale,
      title: 'VÉRTICE Comparador de Regimes 4 em 1',
      subtitle: 'Comparador dos 4 Regimes, CFOPs ST, DRE e BPO Financeiro',
      badge: 'Comparativo & Tributos',
      description:
        'Cálculo e confrontação analítica dos 4 regimes tributários brasileiros com apuração de CPP patronal, segregação de ICMS/ISS e gestão financeira.',
      sublevels: [
        '⚖️ Comparador dos 4 Regimes: Simples Nacional vs Lucro Presumido vs Lucro Real vs MEI com DRE lado a lado.',
        '🏷️ CFOPs & Segregação ICMS/ISS: abatimento de ICMS ST e isenções direto da alíquota do DAS.',
        '💸 Painel Financeiro & DRE: demonstração do resultado do exercício com margem operacional e líquida.',
        '💳 BPO Financeiro & Tesouraria: controle de fluxo de caixa (DFC), contas a pagar/receber e conciliação.',
        '🔍 Consulta NCM & CFOPs: auditoria de produtos para identificar benefícios de PIS/COFINS Monofásico.',
        '🏛️ Serviços LC 116 & ISS: classificação de serviços municipais, alíquotas locais e retenção na fonte.'
      ],
      tip: 'No Lucro Presumido e Real, a auditoria calcula automaticamente a CPP patronal integral de 28,8% sobre a folha CLT.'
    },
    {
      moduleCode: 'MÓDULO 03',
      icon: TrendingUp,
      title: 'VÉRTICE Reforma Tributária & IVA Dual',
      badge: 'Reforma Tributária & Cenários',
      description:
        'Planejamento tributário estratégico para os próximos anos, incluindo a transição da Reforma Tributária (EC 132/2023) de 2026 a 2033.',
      sublevels: [
        '📈 Cenários & Faturamento: simulações de expansão de receita, contratações e novos estabelecimentos.',
        '🏛️ Reforma Tributária (IBS/CBS/IS): cálculo do IVA Dual, alíquotas de transição e split payment.',
        '🛡️ Antecipação Estratégica: diagnóstico de impacto em vendas B2B (PJ para PJ) e momento ideal de migração.'
      ],
      tip: 'Empresas no Simples que vendem para outras empresas (B2B) podem sofrer perda de competitividade devido à restrição de créditos no IVA.'
    },
    {
      moduleCode: 'MÓDULO 04',
      icon: FileText,
      title: 'VÉRTICE Pareceres & Laudos Periciais CPC',
      badge: 'Laudo Pericial Art. 473 CPC',
      description:
        'Geração de parecer técnico formal e fundamentado, emitido com rigor pericial, método científico, fundamentação legal expressa e assinatura CRC.',
      sublevels: [
        '📄 Parecer Técnico & Laudo Pericial: relatório executivo pronto para impressão e exportação em PDF de alta resolução.',
        '🗄️ Histórico de Simulações: arquivo permanente de todas as auditorias e pareceres emitidos para o CNPJ.'
      ],
      tip: 'O laudo pericial é gerado em conformidade com o Art. 473 do CPC, servindo como parecer oficial para conselhos e auditorias.'
    },
    {
      moduleCode: 'MÓDULO 05',
      icon: Building2,
      title: 'VÉRTICE Societário & REDESIM 27 Juntas',
      badge: '27 Juntas & REDESIM',
      description:
        'Acervo completo com os manuais de procedimentos das 27 Juntas Comerciais do Brasil e modelos de contratos padronizados pela DREI.',
      sublevels: [
        '⚖️ 27 Juntas Comerciais: manuais de atos societários (JUCESP, JUCERJA, JUCEMG, etc.) e modelos contratuais (IN DREI 81/2020).',
        '📍 Consulta Prévia & Viabilidade: diretrizes de zoneamento municipal e uso do solo para viabilidade locacional.',
        '🌐 REDESIM & Coletor Nacional: fluxo passo a passo de DBE, FCPJ e registro mercantil.'
      ],
      tip: 'Modelos atualizados de Contrato Social para LTDA, Sociedade Unipessoal (SLU) e alterações de capital e sócios.'
    },
    {
      moduleCode: 'MÓDULO 06',
      icon: BookOpen,
      title: 'VÉRTICE Enciclopédia de Conhecimentos Técnicos',
      badge: 'Manuais Oficiais RFB',
      description:
        'Biblioteca técnica com os manuais operacionais oficiais da Receita Federal do Brasil, comitê CGSN e sistemas públicos SPED.',
      sublevels: [
        '📚 Manuais Oficiais & Perguntão: manuais completos do PGDAS-D, DEFIS, ECF, ECD, EFD-Reinf e e-Social.',
        '📑 Perguntas & Respostas CGSN: soluções de dúvidas fundamentadas pelas resoluções do Comitê Gestor.'
      ],
      tip: 'Consulte orientações oficiais sobre retificação de apurações, segregação de receitas e restituição de tributos do Simples.'
    },
    {
      moduleCode: 'MÓDULO 07',
      icon: Gavel,
      title: 'VÉRTICE Doutrina & Jurisprudência STF/STJ',
      badge: 'Teses STF / STJ / CARF',
      description:
        'Compêndio doutrinário e jurisprudencial de teses tributárias consagradas para fundamentação de defesas e elisão fiscal.',
      sublevels: [
        '🏛️ Teses Judiciais STF & STJ: Tese do Século (exclusão do ICMS), exclusão do ISS da base do PIS/COFINS, etc.',
        '📜 Temas de Repercussão Geral: decisões vinculantes dos tribunais superiores.',
        '⚖️ Jurisprudência CARF: acórdãos do Conselho de Recursos Fiscais para defesas administrativas.'
      ],
      tip: 'Utilize a fundamentação jurídica de teses para embasar pareceres e planejamentos fiscais preventivos.'
    },
    {
      moduleCode: 'MÓDULO 08',
      icon: Award,
      title: 'VÉRTICE Portal de Parceiros & Expansão',
      badge: 'Comissões & Credenciamento',
      description:
        'Programa oficial de parcerias de negócios: credenciamento de escritórios parceiros, cupons de desconto e repasses recorrentes via PIX.',
      sublevels: [
        '🏅 Credenciamento Oficial: parceiros homologados possuem isenção de 100% na anuidade/mensalidade da plataforma.',
        '💸 Cupons & Repasses PIX: comissões recorrentes de 20% a 35% sobre assinaturas indicadas com saque transparente.'
      ],
      tip: 'Os parceiros credenciados geram receita recorrente para seu escritório através de cupons personalizados.'
    }
  ];

  const current = tourSteps[currentStep];
  const IconComponent = current.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto font-sans">
      <div className="bg-[#0F172A] border border-slate-800 rounded-3xl w-full max-w-2xl text-slate-100 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0B0F19]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                Apresentação Executiva // Tour pelos 8 Módulos
              </h3>
              <p className="text-xs text-slate-400">
                Módulo {currentStep + 1} de {tourSteps.length}: {current.badge}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1">
          <div 
            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
          />
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shrink-0">
              <IconComponent className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {current.moduleCode}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {current.badge}
                </span>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-white pt-0.5">{current.title}</h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{current.description}</p>
            </div>
          </div>

          {/* Sublevels List */}
          <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-2.5">
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Ferramentas & Subníveis Integrados:</span>
            </h5>
            <ul className="space-y-2">
              {current.sublevels.map((sub, idx) => (
                <li key={idx} className="text-xs text-slate-200 flex items-start gap-2 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{sub}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tip Banner */}
          <div className="p-3 bg-blue-950/40 border border-blue-800/40 rounded-xl text-xs text-blue-300 flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
            <span>{current.tip}</span>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#0B0F19] flex items-center justify-between">
          <div className="flex gap-1.5">
            {tourSteps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                  idx === currentStep ? 'bg-blue-500 w-6' : 'bg-slate-700 hover:bg-slate-500'
                }`}
                title={`Ir para o Módulo ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button
              disabled={currentStep === 0}
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            {currentStep < tourSteps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <span>Próximo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Concluir Tour</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
