import React, { useState, useMemo } from 'react';
import {
  Users,
  Building2,
  Network,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Sliders,
  Sparkles,
  Layers,
  ArrowRight,
  TrendingUp,
  Scale,
  FileText,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Info,
  Maximize2,
  RotateCcw,
  Zap,
  Eye,
  ChevronDown,
  ChevronRight,
  Printer,
  FileSpreadsheet,
  HelpCircle,
  Briefcase,
  UserCheck,
  Percent,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CompanyData, Partner, PartnerOtherCompany, TaxRegime } from '../types';
import { FEDERAL_LIMIT, STATE_SUBLIMIT } from '../utils/taxRules';

interface MapaDeSociosInterativoProps {
  currentCompany: CompanyData;
  onUpdateCompanyPartners?: (updatedPartners: Partner[]) => void;
  showToast?: (text: string, type?: 'success' | 'info' | 'error') => void;
  onNavigateToTab?: (tab: any) => void;
}

// Modelagem estendida para simulação e diagnóstico do mapa societário
export interface PartnerRiskAssessment {
  partnerId: string;
  partnerName: string;
  partnerCpf?: string;
  currentCompanyShare: number;
  isManagerInCurrent: boolean;
  totalLinkedCompanies: number;
  aggregatedOtherRevenue: number;
  triggersAccumulation: boolean;
  brokenRules: {
    ruleCode: 'ART_3_INC_III' | 'ART_3_INC_IV' | 'ART_3_INC_V' | 'ART_3_INC_I' | 'ART_3_INC_II';
    ruleTitle: string;
    description: string;
    linkedCompany: string;
    linkedCnpj?: string;
    linkedRevenue: number;
    linkedShare: number;
    linkedIsManager: boolean;
    linkedRegime: TaxRegime;
    severity: 'critical' | 'high' | 'medium' | 'info';
  }[];
}

export const MapaDeSociosInterativo: React.FC<MapaDeSociosInterativoProps> = ({
  currentCompany,
  onUpdateCompanyPartners,
  showToast,
  onNavigateToTab
}) => {
  // Estado de parceiros/sócios (inicializado com os da empresa ativa ou amostra padrão)
  const initialPartnersList: Partner[] = useMemo(() => {
    if (currentCompany?.partners && currentCompany.partners.length > 0) {
      return currentCompany.partners;
    }
    return [
      {
        id: 'socio-1',
        name: 'Carlos Eduardo Silveira',
        cpf: '123.456.789-00',
        participationPercent: 60,
        isManager: true,
        roleInCurrentCompany: 'Sócio-Administrador',
        otherCompanies: [
          {
            id: 'other-1',
            name: 'Silveira Distribuidora e Logística LTDA',
            cnpj: '11.222.333/0001-44',
            revenue12m: 2600000,
            participationPercent: 50,
            isManager: true,
            regime: 'simples',
            cnae: '4639-7/01',
            cnaeDescription: 'Comércio atacadista de produtos alimentícios em geral',
            uf: 'PR',
            city: 'Curitiba'
          },
          {
            id: 'other-2',
            name: 'Silveira Consultoria Empresarial EIRELI',
            cnpj: '22.333.444/0001-55',
            revenue12m: 480000,
            participationPercent: 100,
            isManager: true,
            regime: 'lucro_presumido',
            cnae: '7020-4/00',
            cnaeDescription: 'Atividades de consultoria em gestão empresarial',
            uf: 'SP',
            city: 'São Paulo'
          }
        ]
      },
      {
        id: 'socio-2',
        name: 'Mariana Guimarães Fonseca',
        cpf: '987.654.321-99',
        participationPercent: 40,
        isManager: false,
        roleInCurrentCompany: 'Sócia-Cotista',
        otherCompanies: [
          {
            id: 'other-3',
            name: 'Fonseca & Associados Serviços Médicos LTDA',
            cnpj: '33.444.555/0001-66',
            revenue12m: 950000,
            participationPercent: 8,
            isManager: false,
            regime: 'simples',
            cnae: '8630-5/03',
            cnaeDescription: 'Atividade médica ambulatorial restrita a consultas',
            uf: 'PR',
            city: 'Curitiba'
          }
        ]
      }
    ];
  }, [currentCompany]);

  const [partners, setPartners] = useState<Partner[]>(initialPartnersList);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(initialPartnersList[0]?.id || 'socio-1');
  const [viewMode, setViewMode] = useState<'grafo_visual' | 'arvore_hierarquica' | 'matriz_calculo' | 'blindagem_diagnostico'>('grafo_visual');
  const [isEditingPartner, setIsEditingPartner] = useState<boolean>(false);
  const [selectedNodeDetails, setSelectedNodeDetails] = useState<{
    type: 'current_company' | 'partner' | 'other_company';
    id: string;
    data: any;
  }>({
    type: 'current_company',
    id: 'current',
    data: currentCompany
  });

  // Modal para adicionar nova empresa coligada a um sócio
  const [showAddOtherCompanyModal, setShowAddOtherCompanyModal] = useState<boolean>(false);
  const [targetPartnerForNewCompany, setTargetPartnerForNewCompany] = useState<string>('');
  const [newCompanyForm, setNewCompanyForm] = useState<{
    name: string;
    cnpj: string;
    revenue12m: number;
    participationPercent: number;
    isManager: boolean;
    regime: TaxRegime;
    uf: string;
    city: string;
  }>({
    name: '',
    cnpj: '',
    revenue12m: 1200000,
    participationPercent: 20,
    isManager: false,
    regime: 'simples',
    uf: 'PR',
    city: 'Curitiba'
  });

  // Modal para adicionar novo sócio
  const [showAddPartnerModal, setShowAddPartnerModal] = useState<boolean>(false);
  const [newPartnerForm, setNewPartnerForm] = useState<{
    name: string;
    cpf: string;
    participationPercent: number;
    isManager: boolean;
    roleInCurrentCompany: string;
  }>({
    name: '',
    cpf: '',
    participationPercent: 10,
    isManager: false,
    roleInCurrentCompany: 'Sócio-Cotista'
  });

  // RBT12 da Empresa Ativa
  const currentCompanyRbt12 = currentCompany?.rbt12 || 1200000;
  const currentCompanyName = currentCompany?.name || 'EMPRESA CONTRIBUINTE LTDA';
  const currentCompanyCnpj = currentCompany?.cnpj || '12.345.678/0001-99';
  const currentCompanyUf = (currentCompany?.uf || 'PR').toUpperCase();

  // === MOTOR DE CÁLCULO E ANÁLISE DE RISCO SOCIETÁRIO (ART. 3º DA LC 123/2006) ===
  const analysisResult = useMemo(() => {
    let totalAggregatedRevenue = currentCompanyRbt12;
    let partnerAddedRevenue = 0;
    const partnerAssessments: PartnerRiskAssessment[] = [];
    const allLinkedCompanies: {
      partnerId: string;
      partnerName: string;
      company: PartnerOtherCompany;
      triggersSum: boolean;
      reasons: string[];
    }[] = [];

    partners.forEach((partner) => {
      let partnerAggregatedOtherRev = 0;
      let partnerTriggers = false;
      const brokenRules: PartnerRiskAssessment['brokenRules'] = [];

      (partner.otherCompanies || []).forEach((other) => {
        let shouldSum = false;
        const reasons: string[] = [];

        // Regra IV: Sócio com >10% em ambas, sendo ambas no Simples Nacional
        if (
          partner.participationPercent > 10 &&
          (other.participationPercent || 0) > 10 &&
          other.regime === 'simples'
        ) {
          shouldSum = true;
          partnerTriggers = true;
          const desc = `Sócio "${partner.name}" detém ${partner.participationPercent}% nesta empresa e ${(other.participationPercent || 0)}% em "${other.name}" (ambas optantes pelo Simples). Art. 3º, § 4º, IV da LC 123/06 determina a soma compulsória das receitas brutas globais.`;
          reasons.push(desc);
          brokenRules.push({
            ruleCode: 'ART_3_INC_IV',
            ruleTitle: 'Art. 3º § 4º, Inciso IV (Participação Cruzada > 10% no Simples)',
            description: desc,
            linkedCompany: other.name,
            linkedCnpj: other.cnpj,
            linkedRevenue: other.revenue12m || 0,
            linkedShare: other.participationPercent || 0,
            linkedIsManager: other.isManager,
            linkedRegime: other.regime,
            severity: 'critical'
          });
        }

        // Regra III: Sócio Administrador nesta empresa e com >10% em outra empresa (mesmo de outro regime)
        if (partner.isManager && (other.participationPercent || 0) > 10) {
          shouldSum = true;
          partnerTriggers = true;
          const desc = `Sócio "${partner.name}" exerce administração nesta empresa e detém ${(other.participationPercent || 0)}% no capital de "${other.name}". Art. 3º, § 4º, III da LC 123/06 exige a soma integral do faturamento das duas sociedades.`;
          reasons.push(desc);
          brokenRules.push({
            ruleCode: 'ART_3_INC_III',
            ruleTitle: 'Art. 3º § 4º, Inciso III (Sócio-Administrador com >10% em Outra Sociedade)',
            description: desc,
            linkedCompany: other.name,
            linkedCnpj: other.cnpj,
            linkedRevenue: other.revenue12m || 0,
            linkedShare: other.participationPercent || 0,
            linkedIsManager: other.isManager,
            linkedRegime: other.regime,
            severity: 'critical'
          });
        }

        // Regra V: Sócio Administrador em ambas as empresas
        if (partner.isManager && other.isManager) {
          shouldSum = true;
          partnerTriggers = true;
          const desc = `Sócio "${partner.name}" é Administrador simultaneamente nesta empresa e em "${other.name}". Art. 3º, § 4º, V da LC 123/06 obriga a consolidação da receita global para averiguação de teto e sublimites.`;
          reasons.push(desc);
          brokenRules.push({
            ruleCode: 'ART_3_INC_V',
            ruleTitle: 'Art. 3º § 4º, Inciso V (Administração Simultânea em Múltiplos CNPJs)',
            description: desc,
            linkedCompany: other.name,
            linkedCnpj: other.cnpj,
            linkedRevenue: other.revenue12m || 0,
            linkedShare: other.participationPercent || 0,
            linkedIsManager: other.isManager,
            linkedRegime: other.regime,
            severity: 'critical'
          });
        }

        if (shouldSum) {
          partnerAggregatedOtherRev += (other.revenue12m || 0);
          partnerAddedRevenue += (other.revenue12m || 0);
        }

        allLinkedCompanies.push({
          partnerId: partner.id,
          partnerName: partner.name,
          company: other,
          triggersSum: shouldSum,
          reasons
        });
      });

      partnerAssessments.push({
        partnerId: partner.id,
        partnerName: partner.name,
        partnerCpf: partner.cpf,
        currentCompanyShare: partner.participationPercent,
        isManagerInCurrent: partner.isManager,
        totalLinkedCompanies: (partner.otherCompanies || []).length,
        aggregatedOtherRevenue: partnerAggregatedOtherRev,
        triggersAccumulation: partnerTriggers,
        brokenRules
      });
    });

    totalAggregatedRevenue = currentCompanyRbt12 + partnerAddedRevenue;

    // Diagnóstico do Sublimite Estadual (R$ 3.600.000,00)
    const exceedsSublimit = totalAggregatedRevenue > STATE_SUBLIMIT;
    const sublimitExcessAmount = Math.max(0, totalAggregatedRevenue - STATE_SUBLIMIT);
    const sublimitExcessPercent = exceedsSublimit ? (sublimitExcessAmount / STATE_SUBLIMIT) * 100 : 0;
    const sublimitExceeds20Percent = sublimitExcessPercent > 20;

    // Diagnóstico do Teto Federal do Simples Nacional (R$ 4.800.000,00)
    const exceedsFederalLimit = totalAggregatedRevenue > FEDERAL_LIMIT;
    const federalExcessAmount = Math.max(0, totalAggregatedRevenue - FEDERAL_LIMIT);
    const federalExcessPercent = exceedsFederalLimit ? (federalExcessAmount / FEDERAL_LIMIT) * 100 : 0;
    const federalExceeds20Percent = federalExcessPercent > 20;

    // Classificação de Risco Geral
    let overallRiskLevel: 'baixo' | 'moderado' | 'alto' | 'critico' = 'baixo';
    let riskSummaryText = 'Estrutura societária 100% blindada. Não há acúmulo de receita impeditivo conforme a LC 123/2006.';

    if (exceedsFederalLimit) {
      overallRiskLevel = 'critico';
      riskSummaryText = `RISCO CRÍTICO DE EXCLUSÃO DO SIMPLES: O faturamento consolidado do grupo societário (R$ ${(totalAggregatedRevenue / 1000000).toFixed(2)}M) ultrapassou o teto federal de R$ 4,8 milhões (${federalExcessPercent.toFixed(1)}% acima). ${
        federalExceeds20Percent
          ? 'Efeito imediato no mês subsequente (excesso > 20%).'
          : 'Efeito a partir de 1º de janeiro do ano seguinte.'
      }`;
    } else if (exceedsSublimit) {
      overallRiskLevel = 'alto';
      riskSummaryText = `SUBLIMITE ESTADUAL DE R$ 3,6M ULTRAPASSADO: A soma das receitas das empresas interligadas atinge R$ ${(totalAggregatedRevenue / 1000000).toFixed(2)}M (${sublimitExcessPercent.toFixed(1)}% acima do sublimite). O ICMS e ISS não podem ser recolhidos no DAS, devendo ser recolhidos por fora no regime normal com entrega de EFD/SPED.`;
    } else if (partnerAddedRevenue > 0) {
      overallRiskLevel = 'moderado';
      riskSummaryText = `ALERTA DE ACÚMULO MONITORADO: As receitas de outras empresas são somadas (R$ ${(partnerAddedRevenue / 1000000).toFixed(2)}M somados), totalizando R$ ${(totalAggregatedRevenue / 1000000).toFixed(2)}M. A margem até o sublimite estadual é de R$ ${( (STATE_SUBLIMIT - totalAggregatedRevenue) / 1000 ).toFixed(0)}k.`;
    }

    return {
      currentCompanyRbt12,
      partnerAddedRevenue,
      totalAggregatedRevenue,
      exceedsSublimit,
      sublimitExcessAmount,
      sublimitExcessPercent,
      sublimitExceeds20Percent,
      exceedsFederalLimit,
      federalExcessAmount,
      federalExcessPercent,
      federalExceeds20Percent,
      overallRiskLevel,
      riskSummaryText,
      partnerAssessments,
      allLinkedCompanies
    };
  }, [partners, currentCompanyRbt12]);

  // Funções de manipulação de sócios
  const handleUpdatePartnerShare = (partnerId: string, newShare: number) => {
    const updated = partners.map(p => p.id === partnerId ? { ...p, participationPercent: newShare } : p);
    setPartners(updated);
    onUpdateCompanyPartners?.(updated);
    showToast?.(`Participação do sócio ajustada para ${newShare}%.`, 'info');
  };

  const handleTogglePartnerManager = (partnerId: string) => {
    const updated = partners.map(p => p.id === partnerId ? { ...p, isManager: !p.isManager } : p);
    setPartners(updated);
    onUpdateCompanyPartners?.(updated);
    showToast?.('Poder de administração do sócio atualizado.', 'info');
  };

  const handleUpdateOtherCompanyShare = (partnerId: string, companyId: string, newShare: number) => {
    const updated = partners.map(p => {
      if (p.id !== partnerId) return p;
      return {
        ...p,
        otherCompanies: (p.otherCompanies || []).map(o => o.id === companyId ? { ...o, participationPercent: newShare } : o)
      };
    });
    setPartners(updated);
    onUpdateCompanyPartners?.(updated);
  };

  const handleToggleOtherCompanyManager = (partnerId: string, companyId: string) => {
    const updated = partners.map(p => {
      if (p.id !== partnerId) return p;
      return {
        ...p,
        otherCompanies: (p.otherCompanies || []).map(o => o.id === companyId ? { ...o, isManager: !o.isManager } : o)
      };
    });
    setPartners(updated);
    onUpdateCompanyPartners?.(updated);
  };

  const handleDeleteOtherCompany = (partnerId: string, companyId: string) => {
    const updated = partners.map(p => {
      if (p.id !== partnerId) return p;
      return {
        ...p,
        otherCompanies: (p.otherCompanies || []).filter(o => o.id !== companyId)
      };
    });
    setPartners(updated);
    onUpdateCompanyPartners?.(updated);
    showToast?.('Empresa coligada removida do mapa.', 'info');
  };

  const handleAddOtherCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPartnerForNewCompany || !newCompanyForm.name) {
      showToast?.('Preencha os campos obrigatórios da empresa.', 'error');
      return;
    }

    const newCompanyItem: PartnerOtherCompany = {
      id: `other-${Date.now()}`,
      name: newCompanyForm.name,
      cnpj: newCompanyForm.cnpj || '00.000.000/0001-00',
      revenue12m: Number(newCompanyForm.revenue12m) || 0,
      participationPercent: Number(newCompanyForm.participationPercent) || 0,
      isManager: newCompanyForm.isManager,
      regime: newCompanyForm.regime,
      uf: newCompanyForm.uf || 'PR',
      city: newCompanyForm.city || 'Curitiba'
    };

    const updated = partners.map(p => {
      if (p.id !== targetPartnerForNewCompany) return p;
      return {
        ...p,
        otherCompanies: [...(p.otherCompanies || []), newCompanyItem]
      };
    });

    setPartners(updated);
    onUpdateCompanyPartners?.(updated);
    setShowAddOtherCompanyModal(false);
    showToast?.(`Empresa "${newCompanyForm.name}" vinculada com sucesso!`, 'success');
    setNewCompanyForm({
      name: '',
      cnpj: '',
      revenue12m: 1200000,
      participationPercent: 20,
      isManager: false,
      regime: 'simples',
      uf: 'PR',
      city: 'Curitiba'
    });
  };

  const handleAddPartnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartnerForm.name) {
      showToast?.('Informe o nome do sócio.', 'error');
      return;
    }

    const newP: Partner = {
      id: `socio-${Date.now()}`,
      name: newPartnerForm.name,
      cpf: newPartnerForm.cpf || '000.000.000-00',
      participationPercent: Number(newPartnerForm.participationPercent) || 10,
      isManager: newPartnerForm.isManager,
      roleInCurrentCompany: newPartnerForm.roleInCurrentCompany,
      otherCompanies: []
    };

    const updated = [...partners, newP];
    setPartners(updated);
    onUpdateCompanyPartners?.(updated);
    setShowAddPartnerModal(false);
    showToast?.(`Sócio "${newP.name}" adicionado ao quadro!`, 'success');
  };

  // Carregar Presets didáticos
  const handleLoadPresetScenario = (scenarioKey: 'critico' | 'sublimite' | 'blindado') => {
    if (scenarioKey === 'critico') {
      const preset: Partner[] = [
        {
          id: 'p-1',
          name: 'Roberto Mendonça (Administrador Geral)',
          cpf: '111.222.333-44',
          participationPercent: 70,
          isManager: true,
          roleInCurrentCompany: 'Sócio-Administrador',
          otherCompanies: [
            {
              id: 'c-1',
              name: 'Mendonça Comércio Varejista LTDA (Simples)',
              cnpj: '44.555.666/0001-77',
              revenue12m: 3200000,
              participationPercent: 60,
              isManager: true,
              regime: 'simples',
              uf: 'PR',
              city: 'Curitiba'
            },
            {
              id: 'c-2',
              name: 'Mendonça Logística & Transportes EIRELI',
              cnpj: '55.666.777/0001-88',
              revenue12m: 1400000,
              participationPercent: 100,
              isManager: true,
              regime: 'simples',
              uf: 'PR',
              city: 'São José dos Pinhais'
            }
          ]
        },
        {
          id: 'p-2',
          name: 'Luciana Mendonça',
          cpf: '222.333.444-55',
          participationPercent: 30,
          isManager: false,
          roleInCurrentCompany: 'Sócia-Cotista',
          otherCompanies: []
        }
      ];
      setPartners(preset);
      showToast?.('Cenário carregado: Risco Crítico de Exclusão (> R$ 4,8M).', 'info');
    } else if (scenarioKey === 'sublimite') {
      const preset: Partner[] = [
        {
          id: 'p-1',
          name: 'Ana Paula Zanin',
          cpf: '333.444.555-66',
          participationPercent: 50,
          isManager: true,
          roleInCurrentCompany: 'Sócia-Administradora',
          otherCompanies: [
            {
              id: 'c-1',
              name: 'Zanin Indústria Metalúrgica LTDA',
              cnpj: '77.888.999/0001-00',
              revenue12m: 2650000,
              participationPercent: 45,
              isManager: true,
              regime: 'simples',
              uf: 'PR',
              city: 'Londrina'
            }
          ]
        },
        {
          id: 'p-2',
          name: 'Guilherme Zanin',
          cpf: '444.555.666-77',
          participationPercent: 50,
          isManager: false,
          roleInCurrentCompany: 'Sócio-Cotista',
          otherCompanies: []
        }
      ];
      setPartners(preset);
      showToast?.('Cenário carregado: Sublimite Estadual Ultrapassado (> R$ 3,6M).', 'info');
    } else {
      const preset: Partner[] = [
        {
          id: 'p-1',
          name: 'Dr. Fernando Albuquerque',
          cpf: '555.666.777-88',
          participationPercent: 80,
          isManager: true,
          roleInCurrentCompany: 'Sócio-Administrador',
          otherCompanies: [
            {
              id: 'c-1',
              name: 'Holding Familiar Albuquerque S.A. (Imóveis)',
              cnpj: '88.999.000/0001-11',
              revenue12m: 3500000,
              participationPercent: 9.5, // Menor que 10%! Não soma!
              isManager: false, // Não é administrador!
              regime: 'lucro_presumido',
              uf: 'PR',
              city: 'Curitiba'
            }
          ]
        },
        {
          id: 'p-2',
          name: 'Dra. Camila Albuquerque',
          cpf: '666.777.888-99',
          participationPercent: 20,
          isManager: false,
          roleInCurrentCompany: 'Sócia-Cotista',
          otherCompanies: []
        }
      ];
      setPartners(preset);
      showToast?.('Cenário carregado: Estrutura 100% Blindada (<10% e Sem Administração).', 'success');
    }
  };

  const selectedPartner = useMemo(() => {
    return partners.find(p => p.id === selectedPartnerId) || partners[0];
  }, [partners, selectedPartnerId]);

  return (
    <div className="w-full space-y-6">
      {/* HEADER EXECUTIVO DO MAPA DE SÓCIOS */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/70 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <Network className="w-3.5 h-3.5 text-indigo-400" />
                <span>Teia Societária & Múltiplos CNPJs</span>
              </div>
              <div className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 shadow-sm ${
                analysisResult.overallRiskLevel === 'critico'
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  : analysisResult.overallRiskLevel === 'alto'
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : analysisResult.overallRiskLevel === 'moderado'
                  ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                  : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              }`}>
                {analysisResult.overallRiskLevel === 'critico' ? (
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                ) : analysisResult.overallRiskLevel === 'alto' ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>
                  {analysisResult.overallRiskLevel === 'critico' && 'Risco Crítico: Teto LC 123 Excedido'}
                  {analysisResult.overallRiskLevel === 'alto' && 'Alerta: Sublimite Estadual Ultrapassado'}
                  {analysisResult.overallRiskLevel === 'moderado' && 'Atenção: Acúmulo de Receitas Ativo'}
                  {analysisResult.overallRiskLevel === 'baixo' && 'Conformidade Plena • Blindagem 100%'}
                </span>
              </div>
              <div className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-slate-300 text-xs font-semibold flex items-center gap-1.5">
                <Scale className="w-3 h-3 text-slate-400" />
                <span>Art. 3º § 4º LC 123/2006</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
              Mapa de Sócios, Hierarquia & Teia Societária
            </h1>

            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Visualize de forma interativa os vínculos societários cruzados, participações societárias em múltiplos CNPJs e o impacto imediato no <strong>Sublimite Estadual de ICMS/ISS (R$ 3,6M)</strong> e no <strong>Teto Federal do Simples Nacional (R$ 4,8M)</strong> conforme as travas do Art. 3º da Lei Complementar nº 123/2006.
            </p>

            {/* Ficha Rápida da Empresa */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs text-slate-400 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-slate-300 font-bold">{currentCompanyName}</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono">
                <span className="text-slate-500">CNPJ:</span>
                <span className="text-indigo-300 font-semibold">{currentCompanyCnpj}</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono">
                <span className="text-slate-500">RBT12 Próprio:</span>
                <span className="text-emerald-400 font-bold">R$ {currentCompanyRbt12.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono">
                <span className="text-slate-500">Receita Consolidada Grupo:</span>
                <span className={`font-black ${analysisResult.exceedsFederalLimit ? 'text-rose-400' : analysisResult.exceedsSublimit ? 'text-amber-400' : 'text-indigo-300'}`}>
                  R$ {analysisResult.totalAggregatedRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Botões de Ação Rápida e Presets */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 flex-shrink-0">
            <button
              onClick={() => setShowAddPartnerModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Sócio / Quota</span>
            </button>

            {/* Presets Didáticos */}
            <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">Simular Cenários:</span>
              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => handleLoadPresetScenario('critico')}
                  className="px-2 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-[10px] font-bold transition text-center"
                  title="Cenário com faturamento > R$ 4,8M (Risco de Exclusão)"
                >
                  Teto Excedido
                </button>
                <button
                  onClick={() => handleLoadPresetScenario('sublimite')}
                  className="px-2 py-1 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/60 text-amber-300 text-[10px] font-bold transition text-center"
                  title="Cenário com faturamento > R$ 3,6M (Sublimite Estadual)"
                >
                  Sublimite
                </button>
                <button
                  onClick={() => handleLoadPresetScenario('blindado')}
                  className="px-2 py-1 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/60 text-emerald-300 text-[10px] font-bold transition text-center"
                  title="Cenário estruturado para não somar receitas (<10%)"
                >
                  Blindado
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DASHBOARD DE INDICADORES DE LIMITE E SUBLIMITE LC 123/06 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: RBT12 Próprio vs Receita Consolidada */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Consolidação de Receitas</span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-100 font-mono">
              R$ {analysisResult.totalAggregatedRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Própria: <strong className="text-slate-200">R$ {currentCompanyRbt12.toLocaleString('pt-BR')}</strong> + Vínculo Societário: <strong className="text-indigo-300">R$ {analysisResult.partnerAddedRevenue.toLocaleString('pt-BR')}</strong>
            </p>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-500 ${
                analysisResult.exceedsFederalLimit
                  ? 'bg-rose-500'
                  : analysisResult.exceedsSublimit
                  ? 'bg-amber-500'
                  : 'bg-indigo-500'
              }`}
              style={{
                width: `${Math.min(100, (analysisResult.totalAggregatedRevenue / FEDERAL_LIMIT) * 100)}%`
              }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>{((analysisResult.totalAggregatedRevenue / FEDERAL_LIMIT) * 100).toFixed(1)}% do Teto Federal</span>
            <span>Teto: R$ 4,8M</span>
          </div>
        </div>

        {/* Card 2: Sublimite Estadual de ICMS/ISS (R$ 3.600.000,00) */}
        <div className={`border rounded-3xl p-5 shadow-xl space-y-3 ${
          analysisResult.exceedsSublimit
            ? 'bg-amber-950/20 border-amber-500/40'
            : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Sublimite Estadual (ICMS/ISS)</span>
            <div className={`p-1.5 rounded-lg border ${
              analysisResult.exceedsSublimit
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-slate-100">R$ 3,60M</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                analysisResult.exceedsSublimit
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {analysisResult.exceedsSublimit ? `+${analysisResult.sublimitExcessPercent.toFixed(1)}% Excesso` : 'Dentro do Limite'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {analysisResult.exceedsSublimit
                ? `Excesso de R$ ${analysisResult.sublimitExcessAmount.toLocaleString('pt-BR')}. ICMS/ISS recolhidos POR FORA na SEFAZ-${currentCompanyUf}.`
                : `Margem de segurança de R$ ${(STATE_SUBLIMIT - analysisResult.totalAggregatedRevenue).toLocaleString('pt-BR')} até o sublimite.`}
            </p>
          </div>
          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800 flex items-center justify-between">
            <span>Regra: Art. 19 e 20 da LC 123/06</span>
            <span className={analysisResult.exceedsSublimit ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
              {analysisResult.exceedsSublimit ? 'ICMS/ISS no Regime Normal' : 'ICMS/ISS incluso no DAS'}
            </span>
          </div>
        </div>

        {/* Card 3: Teto Federal do Simples Nacional (R$ 4.800.000,00) */}
        <div className={`border rounded-3xl p-5 shadow-xl space-y-3 ${
          analysisResult.exceedsFederalLimit
            ? 'bg-rose-950/20 border-rose-500/40'
            : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Teto Geral Federal (LC 123)</span>
            <div className={`p-1.5 rounded-lg border ${
              analysisResult.exceedsFederalLimit
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}>
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-slate-100">R$ 4,80M</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                analysisResult.exceedsFederalLimit
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {analysisResult.exceedsFederalLimit ? `+${analysisResult.federalExcessPercent.toFixed(1)}% Excedido` : 'Enquadramento Válido'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {analysisResult.exceedsFederalLimit
                ? `Excesso de R$ ${analysisResult.federalExcessAmount.toLocaleString('pt-BR')}. Desenquadramento obrigatório do Simples Nacional.`
                : `Margem federal restante: R$ ${(FEDERAL_LIMIT - analysisResult.totalAggregatedRevenue).toLocaleString('pt-BR')}.`}
            </p>
          </div>
          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800 flex items-center justify-between">
            <span>Regra: Art. 3º, II c/c § 4º LC 123/06</span>
            <span className={analysisResult.exceedsFederalLimit ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
              {analysisResult.exceedsFederalLimit ? 'Exclusão Tributária Ativada' : 'Permanece no Simples'}
            </span>
          </div>
        </div>
      </div>

      {/* SELETOR DE MODOS DE VISUALIZAÇÃO */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewMode('grafo_visual')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              viewMode === 'grafo_visual'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Network className="w-4 h-4" />
            <span>1. Teia Relacional & Grafo</span>
          </button>

          <button
            onClick={() => setViewMode('arvore_hierarquica')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              viewMode === 'arvore_hierarquica'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>2. Árvore Societária</span>
          </button>

          <button
            onClick={() => setViewMode('matriz_calculo')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              viewMode === 'matriz_calculo'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>3. Matriz de Acúmulo LC 123/06</span>
          </button>

          <button
            onClick={() => setViewMode('blindagem_diagnostico')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              viewMode === 'blindagem_diagnostico'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>4. Diagnóstico de Blindagem & Parecer</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
            title="Imprimir Mapa de Sócios"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Imprimir Relatório</span>
          </button>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL CONFORME MODO SELECIONADO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUNA ESQUERDA / PAINEL VISUAL (7 ou 8 Colunas) */}
        <div className="lg:col-span-8 space-y-6">
          {/* MODO 1: TEIA RELACIONAL & GRAFO VISUAL INTERATIVO */}
          {viewMode === 'grafo_visual' && (
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden min-h-[520px]">
              {/* Grid Background Effect */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

              {/* Status Header no Canvas */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-slate-300">Mapa Topológico de Relacionamento Societário</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" /> Empresa Ativa
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-400" /> Sócios / PF
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-purple-500" /> Outros CNPJs
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500" /> Soma Compulsória
                  </span>
                </div>
              </div>

              {/* CANVAS DO GRAFO: NÓ CENTRAL -> SÓCIOS -> OUTRAS EMPRESAS */}
              <div className="relative z-10 space-y-8">
                {/* NÍVEL 1: EMPRESA CENTRAL (MATRIZ / ATIVA) */}
                <div className="flex justify-center">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedNodeDetails({
                      type: 'current_company',
                      id: 'current',
                      data: currentCompany
                    })}
                    className={`cursor-pointer w-full max-w-md p-5 rounded-3xl border transition-all shadow-2xl relative ${
                      selectedNodeDetails.type === 'current_company'
                        ? 'bg-gradient-to-br from-indigo-950/80 via-slate-900 to-indigo-950/80 border-indigo-500 ring-2 ring-indigo-500/50'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
                          <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              EMPRESA ATIVA
                            </span>
                            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              SIMPLES NACIONAL
                            </span>
                          </div>
                          <h3 className="text-sm font-black text-slate-100 mt-1 truncate max-w-[240px]">
                            {currentCompanyName}
                          </h3>
                          <p className="text-[11px] font-mono text-slate-400">CNPJ: {currentCompanyCnpj}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-semibold">RBT12 Próprio</span>
                        <span className="text-xs font-black text-emerald-400 font-mono">
                          R$ {(currentCompanyRbt12 / 1000).toFixed(0)}k
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* CONECTORES VISUAIS DESCENDENTES */}
                <div className="flex justify-center -my-3">
                  <div className="w-0.5 h-6 bg-gradient-to-b from-indigo-500 to-blue-500" />
                </div>

                {/* NÍVEL 2: CLUSTER DE SÓCIOS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {partners.map((partner, pIdx) => {
                    const isSelected = selectedNodeDetails.type === 'partner' && selectedNodeDetails.id === partner.id;
                    const assessment = analysisResult.partnerAssessments.find(a => a.partnerId === partner.id);
                    const triggersSum = assessment?.triggersAccumulation;

                    return (
                      <div key={partner.id} className="space-y-4">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          onClick={() => {
                            setSelectedPartnerId(partner.id);
                            setSelectedNodeDetails({
                              type: 'partner',
                              id: partner.id,
                              data: partner
                            });
                          }}
                          className={`cursor-pointer p-4 rounded-2xl border transition-all shadow-xl relative ${
                            isSelected
                              ? 'bg-gradient-to-br from-blue-950/80 via-slate-900 to-blue-950/80 border-blue-500 ring-2 ring-blue-500/50'
                              : triggersSum
                              ? 'bg-slate-900/90 border-amber-500/40 hover:border-amber-500'
                              : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0 font-black text-sm">
                                {partner.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-slate-100 truncate">{partner.name}</span>
                                </div>
                                <p className="text-[11px] font-mono text-slate-400">CPF: {partner.cpf || '000.000.000-00'}</p>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-xs font-black text-indigo-300 block font-mono">
                                {partner.participationPercent}%
                              </span>
                              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                                partner.isManager
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                  : 'bg-slate-800 text-slate-400'
                              }`}>
                                {partner.isManager ? 'Administrador' : 'Cotista'}
                              </span>
                            </div>
                          </div>

                          {/* Vínculos com outros CNPJs */}
                          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">
                              Outros CNPJs Vinculados: <strong className="text-slate-200">{(partner.otherCompanies || []).length}</strong>
                            </span>
                            {triggersSum ? (
                              <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Soma Receitas (LC 123)
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Isento de Somação
                              </span>
                            )}
                          </div>
                        </motion.div>

                        {/* NÍVEL 3: OUTRAS EMPRESAS COLIGADAS DO SÓCIO */}
                        {(partner.otherCompanies && partner.otherCompanies.length > 0) ? (
                          <div className="space-y-2.5 pl-3 border-l-2 border-dashed border-indigo-500/30">
                            {partner.otherCompanies.map((other) => {
                              const isOtherSelected = selectedNodeDetails.type === 'other_company' && selectedNodeDetails.id === other.id;
                              const linkedRule = analysisResult.allLinkedCompanies.find(
                                c => c.partnerId === partner.id && c.company.id === other.id
                              );
                              const triggersThisCompany = linkedRule?.triggersSum;

                              return (
                                <motion.div
                                  key={other.id}
                                  whileHover={{ scale: 1.01 }}
                                  onClick={() => setSelectedNodeDetails({
                                    type: 'other_company',
                                    id: other.id,
                                    data: { ...other, partnerName: partner.name, partnerId: partner.id }
                                  })}
                                  className={`cursor-pointer p-3 rounded-xl border transition-all text-xs ${
                                    isOtherSelected
                                      ? 'bg-purple-950/80 border-purple-500 ring-2 ring-purple-500/50'
                                      : triggersThisCompany
                                      ? 'bg-slate-900/90 border-rose-500/40 hover:border-rose-500'
                                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="font-bold text-slate-200 truncate">{other.name}</span>
                                        <span className={`px-1 py-0.2 rounded text-[8.5px] font-extrabold uppercase ${
                                          other.regime === 'simples'
                                            ? 'bg-emerald-500/20 text-emerald-300'
                                            : 'bg-blue-500/20 text-blue-300'
                                        }`}>
                                          {other.regime.toUpperCase().replace('_', ' ')}
                                        </span>
                                      </div>
                                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">CNPJ: {other.cnpj}</p>
                                    </div>

                                    <div className="text-right shrink-0">
                                      <span className="font-mono font-black text-slate-200 block text-[11px]">
                                        R$ {((other.revenue12m || 0) / 1000).toFixed(0)}k
                                      </span>
                                      <span className="text-[9px] text-indigo-300 font-semibold">
                                        {other.participationPercent}% Quota
                                      </span>
                                    </div>
                                  </div>

                                  {/* Gatilho LC 123 */}
                                  <div className="mt-2 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[9.5px]">
                                    <span className={other.isManager ? 'text-purple-300 font-semibold' : 'text-slate-400'}>
                                      {other.isManager ? '• Sócio-Administrador' : '• Sócio-Cotista'}
                                    </span>
                                    {triggersThisCompany ? (
                                      <span className="text-rose-400 font-bold">
                                        SOMA AO TETO (+R$ {((other.revenue12m || 0) / 1000).toFixed(0)}k)
                                      </span>
                                    ) : (
                                      <span className="text-emerald-400 font-semibold">
                                        Não Soma (&lt;10%)
                                      </span>
                                    )}
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-xl bg-slate-900/30 border border-dashed border-slate-800 text-[11px] text-slate-500 text-center">
                            Nenhum outro CNPJ vinculado a este sócio
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* MODO 2: ÁRVORE SOCIETÁRIA HIERÁRQUICA */}
          {viewMode === 'arvore_hierarquica' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">Estrutura Hierárquica do Quadro Societário</h3>
                    <p className="text-[11px] text-slate-400">Distribuição de quotas, poderes de gestão e ramificações corporativas</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowAddPartnerModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Novo Sócio</span>
                </button>
              </div>

              {/* Lista Expansível de Sócios */}
              <div className="space-y-4">
                {partners.map((partner) => {
                  const assessment = analysisResult.partnerAssessments.find(a => a.partnerId === partner.id);
                  return (
                    <div key={partner.id} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-black">
                            {partner.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-100">{partner.name}</h4>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                                partner.isManager ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-slate-800 text-slate-400'
                              }`}>
                                {partner.isManager ? 'Administrador' : 'Cotista'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400">CPF: {partner.cpf} • Quota na Matriz: <strong className="text-indigo-300">{partner.participationPercent}%</strong></p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setTargetPartnerForNewCompany(partner.id);
                              setShowAddOtherCompanyModal(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                          >
                            <Plus className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Vincular CNPJ</span>
                          </button>
                        </div>
                      </div>

                      {/* Sub-empresas deste sócio */}
                      {(partner.otherCompanies || []).length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            Empresas Coligadas / Múltiplos CNPJs ({(partner.otherCompanies || []).length}):
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {partner.otherCompanies.map((other) => (
                              <div key={other.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
                                <div>
                                  <div className="font-bold text-slate-200 truncate">{other.name}</div>
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    {other.cnpj} • {other.participationPercent}% • R$ {(other.revenue12m / 1000).toFixed(0)}k/ano
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleDeleteOtherCompany(partner.id, other.id)}
                                  className="p-1 rounded-lg text-slate-500 hover:text-rose-400 transition"
                                  title="Remover vínculo"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MODO 3: MATRIZ DE ACÚMULO DE RECEITAS LC 123/06 */}
          {viewMode === 'matriz_calculo' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Matriz Forense de Apuração de Receita Global</h3>
                  <p className="text-[11px] text-slate-400">Demonstrativo de somatório de RBT12 conforme Art. 3º § 4º da LC nº 123/2006</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-3">Empresa / Sócio</th>
                      <th className="p-3">Regime</th>
                      <th className="p-3">% Quota</th>
                      <th className="p-3">Gestão</th>
                      <th className="p-3">RBT12 (12m)</th>
                      <th className="p-3">Regra LC 123</th>
                      <th className="p-3 text-right">Impacto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {/* Linha da Empresa Ativa */}
                    <tr className="bg-indigo-950/20 font-semibold">
                      <td className="p-3 text-indigo-300">
                        <strong>{currentCompanyName}</strong> (Empresa Base)
                      </td>
                      <td className="p-3 text-emerald-400">Simples Nacional</td>
                      <td className="p-3">100%</td>
                      <td className="p-3">-</td>
                      <td className="p-3 font-mono font-bold text-slate-100">
                        R$ {currentCompanyRbt12.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-slate-400">Receita Base Própria</td>
                      <td className="p-3 text-right font-bold text-indigo-400">Base Central</td>
                    </tr>

                    {/* Linhas das Empresas Coligadas */}
                    {analysisResult.allLinkedCompanies.map((item, idx) => (
                      <tr key={idx} className={item.triggersSum ? 'bg-rose-950/10' : 'bg-slate-950/30'}>
                        <td className="p-3">
                          <div className="font-bold text-slate-200">{item.company.name}</div>
                          <div className="text-[10px] text-slate-500">Via Sócio: {item.partnerName}</div>
                        </td>
                        <td className="p-3 uppercase text-[11px]">{item.company.regime}</td>
                        <td className="p-3 font-mono font-bold">{item.company.participationPercent}%</td>
                        <td className="p-3">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            item.company.isManager ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {item.company.isManager ? 'Administrador' : 'Cotista'}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-200">
                          R$ {(item.company.revenue12m || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-[11px] text-slate-400">
                          {item.triggersSum ? (
                            <span className="text-amber-400 font-semibold">Art. 3º § 4º (Soma Compulsória)</span>
                          ) : (
                            <span className="text-emerald-400 font-semibold">Isento (Participação &le; 10%)</span>
                          )}
                        </td>
                        <td className="p-3 text-right font-bold font-mono">
                          {item.triggersSum ? (
                            <span className="text-rose-400">+ R$ {(item.company.revenue12m || 0).toLocaleString('pt-BR')}</span>
                          ) : (
                            <span className="text-slate-500">R$ 0,00</span>
                          )}
                        </td>
                      </tr>
                    ))}

                    {/* Linha Totalizadora */}
                    <tr className="bg-slate-950 font-black border-t-2 border-slate-700 text-sm">
                      <td colSpan={4} className="p-3 text-slate-200 uppercase">
                        RECEITA GLOBAL TOTAL CONSOLIDADA:
                      </td>
                      <td colSpan={3} className="p-3 text-right text-base font-mono text-indigo-300">
                        R$ {analysisResult.totalAggregatedRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MODO 4: DIAGNÓSTICO DE BLINDAGEM & PARECER FORENSE */}
          {viewMode === 'blindagem_diagnostico' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Parecer de Blindagem Fiscal & Societária (LC 123/06)</h3>
                  <p className="text-[11px] text-slate-400">Recomendações técnicas para reorganização de quotas e governança</p>
                </div>
              </div>

              {/* Status Box */}
              <div className={`p-4 rounded-2xl border leading-relaxed text-xs space-y-2 ${
                analysisResult.overallRiskLevel === 'critico'
                  ? 'bg-rose-950/30 border-rose-500/50 text-rose-200'
                  : analysisResult.overallRiskLevel === 'alto'
                  ? 'bg-amber-950/30 border-amber-500/50 text-amber-200'
                  : 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
              }`}>
                <div className="flex items-center gap-2 font-bold text-sm">
                  {analysisResult.overallRiskLevel === 'critico' ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                  <span>{analysisResult.riskSummaryText}</span>
                </div>
                <p>
                  A legislação do Simples Nacional (LC 123/2006) foi concebida para proteger micro e pequenas empresas, vedando que grupos econômicos pulverizem faturamento entre múltiplos CNPJs para burlar os limites constitucionais.
                </p>
              </div>

              {/* Soluções Práticas de Reestruturação */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Recomendações de Engenharia Societária para Regularização:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-xs text-indigo-300">
                      <Percent className="w-4 h-4 text-indigo-400" />
                      <span>1. Ajuste de Quotas para até 10% (Trava Legal)</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Se a participação societária do sócio em outras empresas for reduzida para <strong>9,99% ou menos</strong> e ele <strong>não exercer poderes de administração</strong>, afasta-se integralmente a soma das receitas pelo Art. 3º, § 4º, IV.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-xs text-purple-300">
                      <Briefcase className="w-4 h-4 text-purple-400" />
                      <span>2. Renúncia à Cláusula de Administração</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Alterar o Contrato Social para destituir o sócio do cargo de administrador em uma das sociedades (passando a figurar exclusivamente como sócio-cotista investidor), desarmando o inciso III e V da LC 123/06.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-xs text-blue-300">
                      <Building2 className="w-4 h-4 text-blue-400" />
                      <span>3. Segregação Patrimonial via Holding Pura</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Constituição de sociedade de participação não operacional com governança autônoma e contratos de prestação de serviços com precificação de mercado (Arm's Length).
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-xs text-emerald-300">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <span>4. Planejamento de CRT 2 (Sublimite)</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Caso o faturamento do grupo ultrapasse R$ 3,6M mas permaneça abaixo de R$ 4,8M, ajustar o sistema de emissão de NF-e para Código de Regime Tributário CRT 2 (Simples com excesso de sublimite de receita bruta).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* COLUNA DIREITA / ESTÚDIO DE CONTROLE & SIMULAÇÃO EM TEMPO REAL (4 Colunas) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Card: Painel de Inspeção do Nó Selecionado */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Sliders className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Inspetor de Entidade Societária
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {selectedNodeDetails.type === 'current_company' ? 'Empresa Base' : selectedNodeDetails.type === 'partner' ? 'Sócio PF' : 'Empresa Coligada'}
              </span>
            </div>

            {/* Inspeção: EMPRESA BASE */}
            {selectedNodeDetails.type === 'current_company' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[11px] text-slate-400">Razão Social:</label>
                  <p className="font-bold text-slate-100">{currentCompanyName}</p>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400">CNPJ:</label>
                  <p className="font-mono text-indigo-300">{currentCompanyCnpj}</p>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400">RBT12 Standalone:</label>
                  <p className="font-mono font-bold text-emerald-400">
                    R$ {currentCompanyRbt12.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  Selecione um sócio ou empresa coligada para alterar percentuais e simular em tempo real.
                </div>
              </div>
            )}

            {/* Inspeção: SÓCIO PF (Com Controles Interativos) */}
            {selectedNodeDetails.type === 'partner' && selectedPartner && (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Sócio Selecionado:</span>
                  <h4 className="text-sm font-bold text-slate-100">{selectedPartner.name}</h4>
                  <p className="text-[11px] font-mono text-slate-400">CPF: {selectedPartner.cpf}</p>
                </div>

                {/* Slider de Participação na Empresa Base */}
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-300">Participação na Matriz:</label>
                    <span className="font-mono font-black text-indigo-300">{selectedPartner.participationPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={selectedPartner.participationPercent}
                    onChange={(e) => handleUpdatePartnerShare(selectedPartner.id, Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500">
                    <span>1%</span>
                    <span>10% (Trava LC 123)</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Toggle de Administração */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div>
                    <span className="text-[11px] font-bold text-slate-200 block">Sócio-Administrador</span>
                    <span className="text-[10px] text-slate-400">Exerce gestão na empresa base</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTogglePartnerManager(selectedPartner.id)}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      selectedPartner.isManager ? 'bg-indigo-600' : 'bg-slate-800'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      selectedPartner.isManager ? 'left-7' : 'left-1'
                    }`} />
                  </button>
                </div>

                {/* Botão para vincular nova empresa */}
                <button
                  onClick={() => {
                    setTargetPartnerForNewCompany(selectedPartner.id);
                    setShowAddOtherCompanyModal(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Vincular Outro CNPJ a Este Sócio</span>
                </button>
              </div>
            )}

            {/* Inspeção: OUTRA EMPRESA COLIGADA */}
            {selectedNodeDetails.type === 'other_company' && selectedNodeDetails.data && (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Empresa Coligada:</span>
                  <h4 className="text-sm font-bold text-slate-100">{selectedNodeDetails.data.name}</h4>
                  <p className="text-[11px] font-mono text-slate-400">CNPJ: {selectedNodeDetails.data.cnpj}</p>
                </div>

                {/* Slider de Participação nesta Empresa */}
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-300">Quota do Sócio:</label>
                    <span className="font-mono font-black text-purple-300">{selectedNodeDetails.data.participationPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={selectedNodeDetails.data.participationPercent}
                    onChange={(e) => {
                      handleUpdateOtherCompanyShare(
                        selectedNodeDetails.data.partnerId,
                        selectedNodeDetails.data.id,
                        Number(e.target.value)
                      );
                      setSelectedNodeDetails({
                        ...selectedNodeDetails,
                        data: { ...selectedNodeDetails.data, participationPercent: Number(e.target.value) }
                      });
                    }}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500">
                    <span>1%</span>
                    <span className="text-amber-400 font-bold">&gt;10% Trava de Soma</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Toggle de Administração nesta Empresa */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div>
                    <span className="text-[11px] font-bold text-slate-200 block">Administrador nesta Empresa</span>
                    <span className="text-[10px] text-slate-400">Gatilho do Art. 3º § 4º, III</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleToggleOtherCompanyManager(
                        selectedNodeDetails.data.partnerId,
                        selectedNodeDetails.data.id
                      );
                      setSelectedNodeDetails({
                        ...selectedNodeDetails,
                        data: { ...selectedNodeDetails.data, isManager: !selectedNodeDetails.data.isManager }
                      });
                    }}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      selectedNodeDetails.data.isManager ? 'bg-purple-600' : 'bg-slate-800'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      selectedNodeDetails.data.isManager ? 'left-7' : 'left-1'
                    }`} />
                  </button>
                </div>

                {/* Excluir vínculo */}
                <button
                  onClick={() => {
                    handleDeleteOtherCompany(selectedNodeDetails.data.partnerId, selectedNodeDetails.data.id);
                    setSelectedNodeDetails({
                      type: 'current_company',
                      id: 'current',
                      data: currentCompany
                    });
                  }}
                  className="w-full py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir Vínculo Desta Empresa</span>
                </button>
              </div>
            )}
          </div>

          {/* Card: Resumo das Travas Legais da LC 123/2006 */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Guia Rápido: Travas do Art. 3º da LC 123/06
            </h4>

            <div className="space-y-2 text-[11px] text-slate-300">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <strong className="text-indigo-300 block">Inciso III: Sócio Administrador</strong>
                <span>Se o administrador detiver mais de 10% do capital de outra empresa, soma-se o faturamento global de ambas.</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <strong className="text-purple-300 block">Inciso IV: &gt;10% em Ambas no Simples</strong>
                <span>Se o sócio detém mais de 10% nesta e em outra empresa do Simples, somam-se as receitas para verificação do teto de R$ 4,8M.</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <strong className="text-blue-300 block">Inciso V: Gestão Simultânea</strong>
                <span>Se o sócio for administrador em ambas as empresas, a soma das receitas brutas é obrigatória por lei.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: ADICIONAR VÍNCULO DE OUTRA EMPRESA (COLIGADA) */}
      <AnimatePresence>
        {showAddOtherCompanyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">Vincular Outro CNPJ ao Sócio</h3>
                    <p className="text-xs text-slate-400">Adicione uma empresa em que o sócio possua participação</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddOtherCompanyModal(false)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddOtherCompanySubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Razão Social / Nome da Empresa:</label>
                  <input
                    type="text"
                    required
                    value={newCompanyForm.name}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, name: e.target.value })}
                    placeholder="Ex: Comercial Souza & Silva LTDA"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">CNPJ:</label>
                    <input
                      type="text"
                      value={newCompanyForm.cnpj}
                      onChange={(e) => setNewCompanyForm({ ...newCompanyForm, cnpj: e.target.value })}
                      placeholder="00.000.000/0001-00"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:border-indigo-500 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Regime Tributário:</label>
                    <select
                      value={newCompanyForm.regime}
                      onChange={(e) => setNewCompanyForm({ ...newCompanyForm, regime: e.target.value as TaxRegime })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="simples">Simples Nacional</option>
                      <option value="lucro_presumido">Lucro Presumido</option>
                      <option value="lucro_real">Lucro Real</option>
                      <option value="mei">MEI</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">RBT12 (Receita Bruta 12m):</label>
                    <input
                      type="number"
                      value={newCompanyForm.revenue12m}
                      onChange={(e) => setNewCompanyForm({ ...newCompanyForm, revenue12m: Number(e.target.value) })}
                      placeholder="1200000"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:border-indigo-500 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">% de Participação do Sócio:</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={newCompanyForm.participationPercent}
                      onChange={(e) => setNewCompanyForm({ ...newCompanyForm, participationPercent: Number(e.target.value) })}
                      placeholder="20"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:border-indigo-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <span className="font-bold text-slate-200 block">Sócio-Administrador nesta Empresa?</span>
                    <span className="text-[11px] text-slate-400">Se sim, ativa a trava do Art. 3º § 4º, III</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={newCompanyForm.isManager}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, isManager: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-0 cursor-pointer"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddOtherCompanyModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30"
                  >
                    Salvar Empresa Coligada
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ADICIONAR NOVO SÓCIO */}
      <AnimatePresence>
        {showAddPartnerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">Adicionar Sócio ao Quadro</h3>
                    <p className="text-xs text-slate-400">Cadastre novo titular ou cotista na sociedade</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddPartnerModal(false)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddPartnerSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Nome Completo do Sócio:</label>
                  <input
                    type="text"
                    required
                    value={newPartnerForm.name}
                    onChange={(e) => setNewPartnerForm({ ...newPartnerForm, name: e.target.value })}
                    placeholder="Ex: Dra. Juliana Silveira"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">CPF:</label>
                    <input
                      type="text"
                      value={newPartnerForm.cpf}
                      onChange={(e) => setNewPartnerForm({ ...newPartnerForm, cpf: e.target.value })}
                      placeholder="000.000.000-00"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:border-indigo-500 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">% de Participação:</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={newPartnerForm.participationPercent}
                      onChange={(e) => setNewPartnerForm({ ...newPartnerForm, participationPercent: Number(e.target.value) })}
                      placeholder="10"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:border-indigo-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <span className="font-bold text-slate-200 block">Sócio-Administrador?</span>
                    <span className="text-[11px] text-slate-400">Possui poderes de gestão e assinatura</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={newPartnerForm.isManager}
                    onChange={(e) => setNewPartnerForm({ ...newPartnerForm, isManager: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-0 cursor-pointer"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddPartnerModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30"
                  >
                    Adicionar Sócio
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
