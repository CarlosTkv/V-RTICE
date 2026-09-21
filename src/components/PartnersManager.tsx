import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  ShieldCheck, 
  ShieldAlert, 
  Building, 
  Info,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Search,
  RefreshCw,
  Sparkles,
  Layers,
  FileSpreadsheet,
  FileText,
  Share2,
  Sliders
} from 'lucide-react';
import { CompanyData, Partner, PartnerOtherCompany, CalculationResult } from '../types';
import { formatCurrencyBRL, FEDERAL_LIMIT } from '../utils/taxRules';
import { PartnerCompanySearchModal } from './PartnerCompanySearchModal';
import { ReportViewerModal } from './ReportViewerModal';
import { fetchCNPJData, convertQSAToPartners, formatCNPJ } from '../utils/cnpjService';
import { BrandLogo } from './BrandLogo';
import { GlobalCapCapacityBar } from './societario/GlobalCapCapacityBar';
import { CorporateNetworkVisualMap } from './societario/CorporateNetworkVisualMap';
import { CorporatePlanningSimulator } from './societario/CorporatePlanningSimulator';

interface PartnersManagerProps {
  company: CompanyData;
  onChangeCompany: (updated: CompanyData) => void;
  calculation: CalculationResult;
}

export const PartnersManager: React.FC<PartnersManagerProps> = ({
  company,
  onChangeCompany,
  calculation,
}) => {
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(
    company.partners[0]?.id || null
  );
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSyncingQSA, setIsSyncingQSA] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [activeSocietarioTab, setActiveSocietarioTab] = useState<'cadastro' | 'mapa' | 'simulador'>('cadastro');

  const selectedPartner = company.partners.find(p => p.id === selectedPartnerId);

  const handleClearAllPartners = () => {
    if (window.confirm('Deseja limpar todos os sócios cadastrados nesta empresa? O quadro ficará zerado até você adicionar ou sincronizar novamente.')) {
      onChangeCompany({ ...company, partners: [] });
      setSelectedPartnerId(null);
    }
  };

  const handleAddPartner = () => {
    const newId = `socio-${Date.now()}`;
    const newPartner: Partner = {
      id: newId,
      name: '',
      cpf: '',
      participationPercent: 0,
      isManager: false,
      otherCompanies: [],
    };
    onChangeCompany({
      ...company,
      partners: [...company.partners, newPartner],
    });
    setSelectedPartnerId(newId);
  };

  const handleSyncCompanyQSA = async () => {
    if (!company.cnpj || company.cnpj === 'Sem dados disponíveis') {
      setSyncMessage('Informe o CNPJ válido da empresa principal primeiro.');
      return;
    }

    setIsSyncingQSA(true);
    setSyncMessage(null);

    try {
      const data = await fetchCNPJData(company.cnpj);
      if (data.qsa && data.qsa.length > 0) {
        const importedPartners = convertQSAToPartners(data.qsa);
        onChangeCompany({
          ...company,
          partners: importedPartners,
        });
        setSelectedPartnerId(importedPartners[0]?.id || null);
        setSyncMessage(`Sucesso: ${importedPartners.length} sócio(s) importados do QSA da Receita Federal.`);
      } else {
        setSyncMessage('Nenhum sócio listado no QSA público para este CNPJ.');
      }
    } catch (err: any) {
      setSyncMessage('Erro ao consultar QSA da Receita Federal: ' + (err.message || ''));
    } finally {
      setIsSyncingQSA(false);
      setTimeout(() => setSyncMessage(null), 6000);
    }
  };

  const handleRemovePartner = (id: string) => {
    const updated = company.partners.filter(p => p.id !== id);
    onChangeCompany({ ...company, partners: updated });
    if (selectedPartnerId === id) {
      setSelectedPartnerId(updated[0]?.id || null);
    }
  };

  const handleUpdatePartner = (id: string, partial: Partial<Partner>) => {
    const updated = company.partners.map(p => {
      if (p.id === id) {
        return { ...p, ...partial };
      }
      return p;
    });
    onChangeCompany({ ...company, partners: updated });
  };

  const handleAddOtherCompany = (partnerId: string) => {
    const newOther: PartnerOtherCompany = {
      id: `outra-${Date.now()}`,
      name: '',
      revenue12m: 0,
      participationPercent: 0,
      isManager: false,
      regime: 'simples',
      source: 'manual',
    };
    const updated = company.partners.map(p => {
      if (p.id === partnerId) {
        return {
          ...p,
          otherCompanies: [...p.otherCompanies, newOther],
        };
      }
      return p;
    });
    onChangeCompany({ ...company, partners: updated });
  };

  const handleAddCompanyFromSearch = (newCompany: PartnerOtherCompany) => {
    if (!selectedPartnerId) return;

    const updated = company.partners.map(p => {
      if (p.id === selectedPartnerId) {
        // Check if company already exists
        const exists = p.otherCompanies.some(o => o.cnpj && o.cnpj === newCompany.cnpj);
        if (exists) {
          return {
            ...p,
            otherCompanies: p.otherCompanies.map(o => o.cnpj === newCompany.cnpj ? newCompany : o),
          };
        }
        return {
          ...p,
          otherCompanies: [...p.otherCompanies, newCompany],
        };
      }
      return p;
    });
    onChangeCompany({ ...company, partners: updated });
  };

  const handleRemoveOtherCompany = (partnerId: string, otherId: string) => {
    const updated = company.partners.map(p => {
      if (p.id === partnerId) {
        return {
          ...p,
          otherCompanies: p.otherCompanies.filter(o => o.id !== otherId),
        };
      }
      return p;
    });
    onChangeCompany({ ...company, partners: updated });
  };

  const handleUpdateOtherCompany = (
    partnerId: string, 
    otherId: string, 
    partial: Partial<PartnerOtherCompany>
  ) => {
    const updated = company.partners.map(p => {
      if (p.id === partnerId) {
        return {
          ...p,
          otherCompanies: p.otherCompanies.map(o => {
            if (o.id === otherId) {
              return { ...o, ...partial };
            }
            return o;
          }),
        };
      }
      return p;
    });
    onChangeCompany({ ...company, partners: updated });
  };

  const totalParticipation = company.partners.reduce((sum, p) => sum + (p.participationPercent || 0), 0);

  // Export QSA Report in CSV format
  const handleExportCSV = () => {
    if (company.partners.length === 0) return;
    const headers = ['Sócio', 'CPF', 'Participação (%)', 'Função', 'Outras Empresas (Qtd)', 'Receita das Vinculadas (R$)'];
    const rows = company.partners.map(p => [
      `"${p.name || 'Sem nome'}"`,
      `"${p.cpf || ''}"`,
      `${p.participationPercent || 0}%`,
      p.isManager ? 'Administrador' : 'Cotista',
      p.otherCompanies.length,
      p.otherCompanies.reduce((s, o) => s + (o.revenue12m || 0), 0).toFixed(2)
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `QSA_${company.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="bg-[#0F172A] p-6 sm:p-7 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <BrandLogo variant="badge" />
              <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/30 text-blue-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Compliance Societário & QSA</p>
                <h2 className="text-xl font-bold text-slate-100 tracking-tight">
                  Auditoria Societária & Regras de Vínculo (LC 123/06 Art. 3º § 4º)
                </h2>
              </div>
            </div>
            <p className="text-slate-300 text-xs max-w-3xl leading-relaxed">
              O artigo 3º, § 4º da Lei Complementar nº 123/2006 estabelece que o faturamento de outras empresas onde os sócios participem com mais de 10% ou exerçam administração deve ser somado ao faturamento global para fins de enquadramento no Simples Nacional.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm shadow-blue-600/20 cursor-pointer"
              title="Gerar e Visualizar Relatório Oficial de Diagnóstico Societário (Art. 3º § 4º)"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Relatório Societário</span>
            </button>

            {company.partners.length > 0 && (
              <button
                onClick={handleExportCSV}
                className="flex items-center space-x-1.5 px-3 py-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                title="Exportar Quadro Societário em Planilha CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Exportar CSV</span>
              </button>
            )}

            {company.partners.length > 0 && (
              <button
                onClick={handleClearAllPartners}
                className="flex items-center space-x-1.5 px-3 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-950/60 text-red-300 border border-red-500/30 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                title="Limpar todos os sócios e começar do zero"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar Quadro</span>
              </button>
            )}

            <button
              onClick={handleSyncCompanyQSA}
              disabled={isSyncingQSA}
              className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
              title="Buscar sócios na base pública da Receita Federal pelo CNPJ"
            >
              <RefreshCw className={`w-4 h-4 text-blue-400 ${isSyncingQSA ? 'animate-spin' : ''}`} />
              <span>Sincronizar QSA da Receita</span>
            </button>

            <button
              onClick={handleAddPartner}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Sócio</span>
            </button>
          </div>
        </div>

        {/* Sync message alert */}
        {syncMessage && (
          <div className="mt-4 p-3 bg-blue-950/40 border border-blue-500/30 rounded-xl text-xs text-blue-300 flex items-center space-x-2 animate-fadeIn">
            <Info className="w-4 h-4 text-blue-400 shrink-0" />
            <span>{syncMessage}</span>
          </div>
        )}

        {/* Global Summary Badge */}
        <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Sócios Cadastrados:</span>
            <span className="text-base font-bold font-mono text-slate-100">{company.partners.length} sócio(s)</span>
          </div>

          <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Soma do Capital Social:</span>
            <span className={`text-base font-bold font-mono ${totalParticipation === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {totalParticipation.toFixed(1)}% {totalParticipation !== 100 && '(Ajustar para 100%)'}
            </span>
          </div>

          <div className={`p-4 rounded-xl border ${
            calculation.hasPartnerIrregularity
              ? 'bg-red-950/40 border-red-500/40 text-red-300'
              : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
          }`}>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Conformidade Societária:</span>
            <div className="flex items-center space-x-2 font-bold text-xs">
              {calculation.hasPartnerIrregularity ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-red-400">Risco de Desenquadramento</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Quadro Societário Conforme</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Irregularity Alert Callout if present */}
      {calculation.hasPartnerIrregularity && (
        <div className="bg-[#0F172A] border border-red-500/40 border-l-4 border-l-red-500 rounded-2xl p-5 shadow-xl animate-shake">
          <div className="flex items-start space-x-4">
            <div className="p-2.5 bg-red-950/60 rounded-xl border border-red-500/30 text-red-400 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-bold text-red-400 uppercase tracking-[0.2em] mb-0.5">Risco de Exclusão por Vínculo Societário</p>
                <h3 className="text-base font-bold text-slate-100">
                  Ultrapassagem do Teto Global por Vínculos Societários
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                A Receita Federal do Brasil cruza dados de quadro societário (QSA) via e-CAC e SPED. A soma do faturamento desta empresa com as empresas vinculadas excede o teto de R$ 4,8 milhões (ou gera vedação legal), gerando passivo de exclusão com autuação retroativa e cobrança pelo Lucro Presumido com multa de até 75%.
              </p>
              <div className="space-y-2 mt-3">
                {calculation.partnerRiskDetails.map((risk, idx) => (
                  <div key={idx} className="bg-red-950/40 p-3.5 rounded-xl border border-red-500/30 text-xs text-red-300 space-y-1">
                    <p className="font-semibold text-slate-100">{risk.ruleBroken}</p>
                    <div className="flex items-center justify-between pt-1 text-slate-300">
                      <span>Faturamento Total Agregado: <b className="font-mono text-white">{formatCurrencyBRL(risk.summedRevenue)}</b></span>
                      <span className="font-mono bg-red-900/60 px-2 py-0.5 rounded text-red-300 font-bold text-[11px] border border-red-500/40">
                        Excesso: {formatCurrencyBRL(risk.excessAmount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BARRA CUMULATIVA DO TETO GLOBAL (R$ 4,8 MILHÕES) */}
      <GlobalCapCapacityBar company={company} calculation={calculation} />

      {/* SELETOR DE SUB-MÓDULOS SOCIETÁRIOS */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#0B0F19] rounded-2xl border border-slate-800 shadow-md">
        <button
          type="button"
          onClick={() => setActiveSocietarioTab('cadastro')}
          className={`flex-1 min-w-[200px] py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
            activeSocietarioTab === 'cadastro' 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Quadro de Sócios & Cadastro</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSocietarioTab('mapa')}
          className={`flex-1 min-w-[200px] py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
            activeSocietarioTab === 'mapa' 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Mapa Visual da Rede (Teia de Coligadas)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSocietarioTab('simulador')}
          className={`flex-1 min-w-[200px] py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
            activeSocietarioTab === 'simulador' 
              ? 'bg-purple-600 text-white shadow-md' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Simulador Societário ("E se alterarmos o contrato?")</span>
        </button>
      </div>

      {activeSocietarioTab === 'mapa' && (
        <CorporateNetworkVisualMap 
          company={company} 
          onSelectPartner={(id) => {
            setSelectedPartnerId(id);
            setActiveSocietarioTab('cadastro');
          }} 
        />
      )}

      {activeSocietarioTab === 'simulador' && (
        <CorporatePlanningSimulator 
          company={company} 
          onApplyContractChanges={(updated) => onChangeCompany(updated)} 
        />
      )}

      {activeSocietarioTab === 'cadastro' && (
        /* Partners List & Detail View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Partners Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Lista de Sócios ({company.partners.length})
            </p>
          </div>

          {company.partners.length === 0 ? (
            <div className="p-6 rounded-xl border border-dashed border-slate-700 bg-[#0F172A] text-center space-y-3 shadow-xl">
              <Users className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-xs font-bold text-slate-200">Nenhum sócio cadastrado</p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Utilize <b className="text-blue-400">"Sincronizar QSA da Receita"</b> para buscar os dados oficiais pelo CNPJ ou adicione manualmente.
              </p>
            </div>
          ) : (
            company.partners.map((partner) => {
              const hasOtherCompanies = partner.otherCompanies.length > 0;
              const otherSum = partner.otherCompanies.reduce((s, o) => s + (o.revenue12m || 0), 0);
              const isSelected = selectedPartnerId === partner.id;

              return (
                <div
                  key={partner.id}
                  onClick={() => setSelectedPartnerId(partner.id)}
                  className={`p-4 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-blue-950/40 border-blue-500 shadow-sm ring-1 ring-blue-500/30'
                      : 'bg-[#0F172A] border-slate-800 hover:border-slate-700 hover:bg-[#0B0F19]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm">{partner.name || 'Sem dados disponíveis'}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                        CPF: {partner.cpf || 'Sem dados disponíveis'}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemovePartner(partner.id);
                      }}
                      className="p-1 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-950/40 transition cursor-pointer"
                      title="Excluir sócio"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cotas:</span>
                      <span className="font-bold font-mono text-blue-400 text-xs">
                        {partner.participationPercent}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Função:</span>
                      <span className={`font-semibold text-[10px] px-2 py-0.5 rounded-full inline-block mt-0.5 font-mono ${
                        partner.isManager 
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {partner.isManager ? 'Administrador' : 'Cotista'}
                      </span>
                    </div>
                  </div>

                  {hasOtherCompanies && (
                    <div className="mt-2.5 p-2 rounded-lg bg-[#0B0F19] border border-slate-800 text-[10px] text-slate-300 flex items-center justify-between">
                      <span className="flex items-center space-x-1">
                        <Building className="w-3 h-3 text-blue-400" />
                        <span>{partner.otherCompanies.length} outra(s) empresa(s)</span>
                      </span>
                      <span className="font-mono text-amber-400 font-bold">+{formatCurrencyBRL(otherSum)}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Selected Partner Deep Dive */}
        <div className="lg:col-span-2 space-y-6">
          {selectedPartner ? (
            <div className="bg-[#0F172A] p-6 sm:p-7 rounded-2xl border border-slate-800 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                    Configuração do Sócio
                  </span>
                  <h3 className="text-lg font-bold text-slate-100 mt-0.5">{selectedPartner.name || 'Sem dados disponíveis'}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status:</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 font-semibold border border-emerald-500/30">
                    Ativo
                  </span>
                </div>
              </div>

              {/* Partner Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Nome Completo do Sócio:
                  </label>
                  <input
                    type="text"
                    value={selectedPartner.name}
                    onChange={(e) => handleUpdatePartner(selectedPartner.id, { name: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    % de Quotas no Capital:
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={selectedPartner.participationPercent}
                      onChange={(e) => handleUpdatePartner(selectedPartner.id, { participationPercent: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 font-mono font-bold focus:border-blue-500 focus:outline-none"
                    />
                    <span className="absolute right-3.5 top-2 text-slate-500 text-xs font-semibold font-mono">%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Exerce Administração?
                  </label>
                  <select
                    value={selectedPartner.isManager ? '1' : '0'}
                    onChange={(e) => handleUpdatePartner(selectedPartner.id, { isManager: e.target.value === '1' })}
                    className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:border-blue-500 focus:outline-none cursor-pointer"
                  >
                    <option value="1" className="bg-[#0B0F19] text-slate-100">Sim (Sócio Administrador)</option>
                    <option value="0" className="bg-[#0B0F19] text-slate-100">Não (Apenas Cotista)</option>
                  </select>
                </div>
              </div>

              {/* Linked Companies Section */}
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                      <Building className="w-4 h-4 text-blue-400" />
                      <span>Outras Empresas com Participação de {selectedPartner.name.split(' ')[0]}</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Traga informações de outros CNPJs para testar as regras de enquadramento do Art. 3º § 4º da LC 123/06.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => setIsSearchModalOpen(true)}
                      className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-sm shadow-blue-600/20 cursor-pointer"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Buscar na Receita / CNPJ</span>
                    </button>

                    <button
                      onClick={() => handleAddOtherCompany(selectedPartner.id)}
                      className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
                      title="Adicionar vínculo manualmente"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Manual</span>
                    </button>
                  </div>
                </div>

                {selectedPartner.otherCompanies.length === 0 ? (
                  <div className="bg-[#0B0F19] border border-dashed border-slate-700 rounded-xl p-8 text-center text-slate-400 text-xs space-y-3">
                    <ShieldCheck className="w-8 h-8 text-slate-500 mx-auto" />
                    <div>
                      <p className="font-semibold text-slate-200">Nenhuma outra empresa vinculada a este sócio.</p>
                      <p className="text-[11px] text-slate-400 mt-1 max-w-md mx-auto">
                        Clique em <b className="text-blue-400">"Buscar na Receita / CNPJ"</b> para localizar automaticamente as empresas onde {selectedPartner.name} figura como sócio ou administrador.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedPartner.otherCompanies.map((other) => {
                      // Determine precise legal badge for Art. 3º, § 4º LC 123/06
                      const isSimples = other.regime === 'simples';
                      const isPresumidoOrReal = other.regime === 'lucro_presumido' || other.regime === 'lucro_real';

                      let badgeInfo = {
                        code: 'Isenta',
                        label: 'Participação ≤ 10% sem poderes de administração (não soma)',
                        color: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
                        dot: 'bg-emerald-400',
                        triggersSum: false
                      };

                      if (selectedPartner.isManager && other.isManager) {
                        badgeInfo = {
                          code: 'Inciso V',
                          label: 'Sócio Administrador em mais de uma PJ (Soma Obrigatória)',
                          color: 'bg-red-950/80 text-red-300 border-red-500/50',
                          dot: 'bg-red-400',
                          triggersSum: true
                        };
                      } else if (selectedPartner.isManager && (other.participationPercent || 0) > 10) {
                        badgeInfo = {
                          code: 'Inciso III',
                          label: 'Administrador nesta PJ e > 10% na coligada (Soma Obrigatória)',
                          color: 'bg-amber-950/80 text-amber-300 border-amber-500/50',
                          dot: 'bg-amber-400',
                          triggersSum: true
                        };
                      } else if (selectedPartner.participationPercent > 10 && (other.participationPercent || 0) > 10 && isSimples) {
                        badgeInfo = {
                          code: 'Inciso III',
                          label: 'Participação > 10% em outra empresa do Simples Nacional (Soma Obrigatória)',
                          color: 'bg-indigo-950/80 text-indigo-300 border-indigo-500/50',
                          dot: 'bg-indigo-400',
                          triggersSum: true
                        };
                      } else if (selectedPartner.participationPercent > 10 && (other.participationPercent || 0) > 10 && isPresumidoOrReal) {
                        badgeInfo = {
                          code: 'Inciso IV',
                          label: 'Participação > 10% em empresa do Lucro Presumido/Real (Soma Obrigatória)',
                          color: 'bg-purple-950/80 text-purple-300 border-purple-500/50',
                          dot: 'bg-purple-400',
                          triggersSum: true
                        };
                      }

                      return (
                        <div
                          key={other.id}
                          className={`bg-[#0B0F19] p-4 rounded-xl border space-y-3.5 ${
                            badgeInfo.triggersSum ? 'border-amber-500/50 bg-amber-950/20' : 'border-slate-800'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 mr-4 space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                {other.cnpj && (
                                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30">
                                    {formatCNPJ(other.cnpj)}
                                  </span>
                                )}
                                {other.uf && (
                                  <span className="text-[9px] text-slate-400 font-mono">
                                    {other.city ? `${other.city} / ` : ''}{other.uf}
                                  </span>
                                )}
                                <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-md border flex items-center space-x-1.5 ${badgeInfo.color}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${badgeInfo.dot}`} />
                                  <span><b>{badgeInfo.code}:</b> {badgeInfo.label}</span>
                                </span>
                              </div>

                              <input
                                type="text"
                                value={other.name}
                                onChange={(e) => handleUpdateOtherCompany(selectedPartner.id, other.id, { name: e.target.value })}
                                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-bold focus:border-blue-500 focus:outline-none mt-1"
                                placeholder="Razão Social da Empresa"
                              />

                              {other.cnaeDescription && (
                                <p className="text-[10px] text-slate-400">
                                  {other.cnae ? `${other.cnae} — ` : ''}{other.cnaeDescription}
                                </p>
                              )}
                            </div>

                            <button
                              onClick={() => handleRemoveOtherCompany(selectedPartner.id, other.id)}
                              className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-950/40 transition cursor-pointer"
                              title="Remover vínculo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs pt-1 border-t border-slate-800">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Faturamento RBT12:
                              </label>
                              <input
                                type="number"
                                value={other.revenue12m}
                                onChange={(e) => handleUpdateOtherCompany(selectedPartner.id, other.id, { revenue12m: parseFloat(e.target.value) || 0 })}
                                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-blue-400 font-mono font-bold focus:border-blue-500 focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                % Quotas do Sócio:
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={other.participationPercent}
                                onChange={(e) => handleUpdateOtherCompany(selectedPartner.id, other.id, { participationPercent: parseFloat(e.target.value) || 0 })}
                                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono font-bold focus:border-blue-500 focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                É Administrador?
                              </label>
                              <select
                                value={other.isManager ? '1' : '0'}
                                onChange={(e) => handleUpdateOtherCompany(selectedPartner.id, other.id, { isManager: e.target.value === '1' })}
                                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none cursor-pointer"
                              >
                                <option value="1" className="bg-[#0F172A] text-slate-100">Sim (Administrador)</option>
                                <option value="0" className="bg-[#0F172A] text-slate-100">Não (Cotista)</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Regime Tributário:
                              </label>
                              <select
                                value={other.regime}
                                onChange={(e) => handleUpdateOtherCompany(selectedPartner.id, other.id, { regime: e.target.value as any })}
                                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none cursor-pointer"
                              >
                                <option value="simples" className="bg-[#0F172A] text-slate-100">Simples Nacional</option>
                                <option value="lucro_presumido" className="bg-[#0F172A] text-slate-100">Lucro Presumido</option>
                                <option value="lucro_real" className="bg-[#0F172A] text-slate-100">Lucro Real</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#0F172A] p-10 rounded-2xl border border-slate-800 text-center text-slate-400 text-xs shadow-xl">
              Selecione ou adicione um sócio ao lado para gerenciar as regras de enquadramento.
            </div>
          )}
        </div>
      </div>
      )}

      {/* Partner Company Search Modal */}
      {selectedPartner && (
        <PartnerCompanySearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          partner={selectedPartner}
          onAddCompany={handleAddCompanyFromSearch}
        />
      )}

      {/* Relatório Societário Modal */}
      <ReportViewerModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reportType="socios"
        company={company}
        calculation={calculation}
      />

    </div>
  );
};

