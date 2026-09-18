import React, { useState } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  FileText, 
  Users, 
  Scale, 
  Tag, 
  X, 
  ArrowRight, 
  TrendingUp, 
  Briefcase, 
  Crown, 
  Award, 
  Layers, 
  PieChart, 
  Building2, 
  Gavel, 
  Search, 
  DollarSign, 
  Compass, 
  ShieldCheck,
  Check
} from 'lucide-react';
import { AppActiveTab } from '../types';

interface SystemStepByStepManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: AppActiveTab) => void;
}

export const SystemStepByStepManualModal: React.FC<SystemStepByStepManualModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab
}) => {
  const [activeChapter, setActiveChapter] = useState<number>(0);

  if (!isOpen) return null;

  const chapters = [
    {
      id: 'modulo1',
      number: '01',
      moduleCode: 'MÓDULO 01',
      title: 'VÉRTICE Auditoria & Fator R 360º',
      subtitle: 'Cockpit 360º, Auditoria do Fator R (≥ 28%), Pró-Labore e Análise Anexo III vs V',
      icon: PieChart,
      targetTab: 'dashboard' as AppActiveTab,
      buttonLabel: 'Acessar VÉRTICE Auditoria & Fator R 360º',
      sublevels: [
        { name: '📊 Visão Geral & Cockpit', desc: 'Consolidação de RBT12, Risco Geral, Sublimites Estaduais e Dashboard executivo.' },
        { name: '⚡ Auditoria Fator R (28%)', desc: 'Simulação matemática de pró-labore estratégico para migração do Anexo V para o Anexo III.' },
        { name: '👥 Pró-Labore & Sócios', desc: 'Estruturação da remuneração dos sócios, cruzamento QSA e apuração da contribuição previdenciária.' },
        { name: '⚖️ Anexo III vs V', desc: 'Comparativo direto de alíquotas efetivas com e sem enquadramento no Fator R.' }
      ],
      details: [
        'A RBT12 é a base de cálculo determinante para alíquotas efetivas no Simples Nacional (LC 123/2006, Art. 18).',
        'Quando a relação Folha/RBT12 atinge ou supera 28,00%, as atividades intelectuais e de serviços tributadas no Anexo V (15,5%+) passam a recolher no Anexo III (a partir de 6,00%).',
        'O cockpit audita automaticamente encargos patronais (28,8% no Lucro Presumido/Real vs. isenção/inclusão no DAS do Simples).'
      ]
    },
    {
      id: 'modulo2',
      number: '02',
      moduleCode: 'MÓDULO 02',
      title: 'VÉRTICE Comparador de Regimes 4 em 1',
      subtitle: 'Comparador dos 4 Regimes, Segregação de CFOPs ICMS/ISS, DRE e BPO Financeiro',
      icon: Scale,
      targetTab: 'comparador' as AppActiveTab,
      buttonLabel: 'Acessar VÉRTICE Comparador de Regimes 4 em 1',
      sublevels: [
        { name: '⚖️ Comparador dos 4 Regimes', desc: 'Simples Nacional, Lucro Presumido, Lucro Real e MEI lado a lado com DRE Comparativa.' },
        { name: '🏷️ CFOPs & Segregação ICMS/ISS', desc: 'Segregação de Substituição Tributária (ST), Isenções e parcelas monofásicas no DAS.' },
        { name: '💸 Painel Financeiro & DRE', desc: 'Demonstrativo do Resultado do Exercício com margens bruta, operacional e líquida tributária.' },
        { name: '💳 BPO Financeiro & Tesouraria', desc: 'Controle de Contas a Pagar/Receber, DFC (Fluxo de Caixa) e conciliação financeira.' },
        { name: '🔍 Consulta NCM & CFOPs', desc: 'Auditoria tributária por NCM para identificação de produtos com PIS/COFINS Monofásico e ICMS-ST.' },
        { name: '🏛️ Serviços LC 116 & ISS', desc: 'Tabela oficial de itens da LC 116/2003, regras de retenção na fonte e emissão de NFS-e.' }
      ],
      details: [
        'Cálculo de alíquotas efetivas do Simples com dedução de parcela a deduzir por faixa de faturamento.',
        'No Lucro Presumido, cálculo com presunções oficiais de 8%, 16% ou 32%, adicionais de IRPJ (10%), CSLL (9%), PIS (0,65%) e COFINS (3,00%).',
        'No Lucro Real, apuração contábil no LALUR/LACS com aproveitamento de créditos de PIS/COFINS não-cumulativos (9,25%).'
      ]
    },
    {
      id: 'modulo3',
      number: '03',
      moduleCode: 'MÓDULO 03',
      title: 'VÉRTICE Reforma Tributária & IVA Dual',
      subtitle: 'Cenários de Faturamento, Reforma Tributária 2026-2033 (IBS/CBS/IS) e Antecipação',
      icon: TrendingUp,
      targetTab: 'reforma' as AppActiveTab,
      buttonLabel: 'Acessar VÉRTICE Reforma Tributária & IVA Dual',
      sublevels: [
        { name: '📈 Cenários & Faturamento', desc: 'Projeção de crescimento de faturamento, variações de margem e impacto nos limites fiscais.' },
        { name: '🏛️ Reforma Tributária (IBS/CBS/IS)', desc: 'Cronograma de transição 2026 a 2033 da EC 132/2023 com cálculo do IVA Dual e split payment.' },
        { name: '🛡️ Antecipação Estratégica', desc: 'Diagnóstico de vendas B2B (crédito financeiro pleno vs restrito do Simples) e plano de migração.' }
      ],
      details: [
        'Simulação da trava de créditos para clientes pessoas jurídicas (B2B): no Simples o tomador só aproveita o percentual de IBS/CBS do DAS.',
        'Apresentação do calendário oficial de extinção gradual do PIS/COFINS (2027), ICMS/ISS (2029-2032) e vigência plena do IVA (2033).',
        'Planejamento de precificação com o novo Imposto Seletivo (IS) e Regime Diferenciado.'
      ]
    },
    {
      id: 'modulo4',
      number: '04',
      moduleCode: 'MÓDULO 04',
      title: 'VÉRTICE Pareceres & Laudos Periciais CPC',
      subtitle: 'Parecer Técnico Pericial (Art. 473 CPC), Assinatura CRC e Histórico de Auditorias',
      icon: FileText,
      targetTab: 'relatorio' as AppActiveTab,
      buttonLabel: 'Acessar VÉRTICE Pareceres & Laudos Periciais CPC',
      sublevels: [
        { name: '📄 Parecer Técnico & Laudo Pericial', desc: 'Documento oficial formal fundamentado na LC 123/06, RIR/18 e CPC com gráficos de alta resolução.' },
        { name: '🗄️ Histórico de Simulações', desc: 'Registro permanente de laudos gerados, revisões fiscais e comparativos anteriores salvos.' }
      ],
      details: [
        'Laudo pericial estruturado nos termos do Art. 473 do Código de Processo Civil, com método científico e fundamentação legal expressa.',
        'Exportação em PDF pronta para entrega a clientes, bancos e conselhos de administração com QR Code de autenticidade.',
        'Assinatura digital do Perito/Contador com número de registro no CRC.'
      ]
    },
    {
      id: 'modulo5',
      number: '05',
      moduleCode: 'MÓDULO 05',
      title: 'VÉRTICE Societário & REDESIM 27 Juntas',
      subtitle: '27 Juntas Comerciais (DREI 81/20), Viabilidade Locacional e REDESIM Integrador',
      icon: Building2,
      targetTab: 'societario' as AppActiveTab,
      buttonLabel: 'Acessar VÉRTICE Societário & REDESIM 27 Juntas',
      sublevels: [
        { name: '⚖️ 27 Juntas Comerciais & Modelos', desc: 'Manuais das 27 Juntas Comerciais e modelos contratuais oficiais padronizados pela IN DREI nº 81/2020.' },
        { name: '📍 Consulta Prévia & Viabilidade', desc: 'Checklist de viabilidade locacional, zoneamento municipal e regras de uso do solo para abertura/alteração.' },
        { name: '🌐 REDESIM & Coletor Nacional', desc: 'Fluxo integrado de DBE (Documento Básico de Entrada), FCPJ, QSA e registro mercantil.' }
      ],
      details: [
        'Modelos de Contrato Social para LTDA, SLU (Sociedade Limitada Unipessoal), S/A, Cooperativas e Sociedades Simples.',
        'Cláusulas fundamentais de sucessão, retirada de sócios, apuração de haveres e administração da sociedade.',
        'Integração de regras com os órgãos estaduais e municipais de registro.'
      ]
    },
    {
      id: 'modulo6',
      number: '06',
      moduleCode: 'MÓDULO 06',
      title: 'VÉRTICE Enciclopédia de Conhecimentos Técnicos',
      subtitle: 'Manuais Oficiais RFB, Guias PGDAS-D, SPEDs e Base Oficial do Simples',
      icon: BookOpen,
      targetTab: 'conhecimentos' as AppActiveTab,
      buttonLabel: 'Acessar VÉRTICE Enciclopédia de Conhecimentos',
      sublevels: [
        { name: '📚 Manuais & Perguntas da RFB', desc: 'Biblioteca com manual do PGDAS-D, DEFIS, ECF, ECD, EFD-Reinf, e-Social e Perguntão CGSN.' }
      ],
      details: [
        'Orientações operacionais oficiais para preenchimento de declarações e apuração do Simples Nacional.',
        'Regras para retificação de PGDAS-D, segregação de receitas e restituição de tributos recolhidos a maior.',
        'Pesquisa indexada de normas tributárias federais e resoluções do Comitê Gestor do Simples Nacional.'
      ]
    },
    {
      id: 'modulo7',
      number: '07',
      moduleCode: 'MÓDULO 07',
      title: 'VÉRTICE Doutrina & Jurisprudência STF/STJ',
      subtitle: 'Teses Tributárias STF/STJ, Temas de Repercussão Geral e Jurisprudência CARF',
      icon: Gavel,
      targetTab: 'direito_tributario' as AppActiveTab,
      buttonLabel: 'Acessar VÉRTICE Doutrina & Jurisprudência STF/STJ',
      sublevels: [
        { name: '🏛️ Teses Judiciais & Doutrina', desc: 'Compêndio de teses tributárias consagradas (Tese do Século - Exclusão do ICMS da base do PIS/COFINS, etc.).' },
        { name: '📜 Temas STF & STJ', desc: 'Mapeamento de Repercussão Geral (STF) e Recursos Repetitivos (STJ) com aplicação prática.' },
        { name: '⚖️ Jurisprudência CARF & Pareceres', desc: 'Súmulas e acórdãos do Conselho Administrativo de Recursos Fiscais para defesas administrativas.' }
      ],
      details: [
        'Fundamentação doutrinária robusta para elaboração de defesas tributárias, impugnações e planejamento fiscal lícito (elisão fiscal).',
        'Análise de teses para recuperação de créditos tributários nos regimes do Simples, Lucro Presumido e Lucro Real.',
        'Jurisprudência consolidada sobre trava de 30% no prejuízo fiscal, não incidência de IRPJ/CSLL sobre Selic de repetição de indébito e outros temas.'
      ]
    },
    {
      id: 'modulo8',
      number: '08',
      moduleCode: 'MÓDULO 08',
      title: 'VÉRTICE Portal de Parceiros & Expansão',
      subtitle: 'Credenciamento Oficial, Cupons de Desconto e Comissões Recorrentes via PIX',
      icon: Award,
      targetTab: 'portal_parceiro' as AppActiveTab,
      buttonLabel: 'Acessar VÉRTICE Portal de Parceiros & Expansão',
      sublevels: [
        { name: '🏅 Credenciamento & Cupons', desc: 'Criação e gestão de cupons de desconto exclusivos para indicar novos escritórios e clientes.' },
        { name: '💸 Repasses & Comissões PIX', desc: 'Acompanhamento de indicações ativas, extrato de comissões recorrentes (20% a 35%) e solicitação de PIX.' }
      ],
      details: [
        'O parceiro oficial conta com acesso isento (R$ 0,00 de mensalidade) mediante credenciamento e validação pelo Usuário Master.',
        'Comissões recorrentes pagas mensalmente sobre todas as assinaturas ativas captadas através do cupom.',
        'Painel transparente com métricas de conversão, clientes indicados e relatório de repasses.'
      ]
    }
  ];

  const current = chapters[activeChapter];
  const IconComponent = current.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto font-sans">
      <div className="bg-[#0F172A] border border-slate-800 rounded-3xl w-full max-w-4xl text-slate-100 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0B0F19] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Manual Completo do Sistema // Guia Oficial dos 8 Módulos
              </h2>
              <p className="text-xs text-slate-400">
                Detalhamento dos 8 módulos de inteligência fiscal, suas ferramentas e subníveis operacionais
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

        {/* Chapters Navigation Tabs */}
        <div className="flex flex-wrap border-b border-slate-800 bg-[#0B0F19]/90 px-4 sm:px-6 pt-2.5 gap-1.5 shrink-0">
          {chapters.map((ch, idx) => {
            const ChIcon = ch.icon;
            const isActive = idx === activeChapter;
            return (
              <button
                key={ch.id}
                onClick={() => setActiveChapter(idx)}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? 'border-blue-500 text-blue-400 bg-blue-500/5 rounded-t-lg'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <ChIcon className="w-3.5 h-3.5" />
                <span>{ch.moduleCode}</span>
              </button>
            );
          })}
        </div>

        {/* Chapter Body Content */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm">
          
          {/* Chapter Title & Hero */}
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#0B0F19] border border-slate-800">
            <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shrink-0">
              <IconComponent className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                  {current.moduleCode}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Capítulo {current.number} de {chapters.length.toString().padStart(2, '0')}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">{current.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{current.subtitle}</p>
            </div>
          </div>

          {/* Sublevels Section */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Ferramentas & Subníveis Integrados deste Módulo:</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {current.sublevels.map((sub, sIdx) => (
                <div key={sIdx} className="p-3 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-1 hover:border-slate-700 transition">
                  <span className="font-bold text-slate-200 text-xs block">{sub.name}</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{sub.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Key Methodological Details */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Fundamentação Jurídico-Tributária & Aplicação Prática:</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              {current.details.map((detail, dIdx) => (
                <li key={dIdx} className="flex items-start gap-2 leading-relaxed">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-[#0B0F19] flex items-center justify-between shrink-0">
          <button
            type="button"
            disabled={activeChapter === 0}
            onClick={() => setActiveChapter(prev => Math.max(0, prev - 1))}
            className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Módulo Anterior</span>
          </button>

          {onNavigateToTab && (
            <button
              type="button"
              onClick={() => {
                onNavigateToTab(current.targetTab);
                onClose();
              }}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <span>{current.buttonLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            disabled={activeChapter === chapters.length - 1}
            onClick={() => setActiveChapter(prev => Math.min(chapters.length - 1, prev + 1))}
            className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>Próximo Módulo</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
