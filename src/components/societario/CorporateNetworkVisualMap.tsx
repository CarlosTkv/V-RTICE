import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Share2, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle, 
  ChevronRight, 
  Crown, 
  UserCheck, 
  Info,
  Maximize2
} from 'lucide-react';
import { CompanyData, Partner, PartnerOtherCompany } from '../../types';
import { formatCurrencyBRL } from '../../utils/taxRules';
import { formatCNPJ } from '../../utils/cnpjService';

interface CorporateNetworkVisualMapProps {
  company: CompanyData;
  onSelectPartner?: (partnerId: string) => void;
}

export const CorporateNetworkVisualMap: React.FC<CorporateNetworkVisualMapProps> = ({
  company,
  onSelectPartner,
}) => {
  const [activePartnerFilter, setActivePartnerFilter] = useState<string | null>(null);

  const partners = company.partners || [];
  const currentRbt12 = company.rbt12 || (company.monthlyRevenue ? company.monthlyRevenue * 12 : 0);

  // Helper to determine legal badge for linked company
  const getRuleBadge = (partner: Partner, other: PartnerOtherCompany) => {
    const isSimples = other.regime === 'simples';
    const isPresumidoOrReal = other.regime === 'lucro_presumido' || other.regime === 'lucro_real';

    if (partner.isManager && other.isManager) {
      return {
        code: 'Inciso V',
        label: 'Sócio Administrador em mais de uma PJ',
        status: 'soma',
        color: 'bg-red-950/80 border-red-500/50 text-red-300',
        dot: 'bg-red-400'
      };
    }

    if (partner.isManager && (other.participationPercent || 0) > 10) {
      return {
        code: 'Inciso III',
        label: 'Administrador nesta e >10% na coligada',
        status: 'soma',
        color: 'bg-amber-950/80 border-amber-500/50 text-amber-300',
        dot: 'bg-amber-400'
      };
    }

    if (partner.participationPercent > 10 && (other.participationPercent || 0) > 10 && isSimples) {
      return {
        code: 'Inciso III',
        label: 'Participação > 10% em outra empresa do Simples Nacional',
        status: 'soma',
        color: 'bg-indigo-950/80 border-indigo-500/50 text-indigo-300',
        dot: 'bg-indigo-400'
      };
    }

    if (partner.participationPercent > 10 && (other.participationPercent || 0) > 10 && isPresumidoOrReal) {
      return {
        code: 'Inciso IV',
        label: 'Participação > 10% em empresa do Lucro Presumido/Real',
        status: 'soma',
        color: 'bg-purple-950/80 border-purple-500/50 text-purple-300',
        dot: 'bg-purple-400'
      };
    }

    return {
      code: 'Isenta',
      label: 'Participação ≤ 10% sem poderes de administração (não soma)',
      status: 'isenta',
      color: 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300',
      dot: 'bg-emerald-400'
    };
  };

  const displayedPartners = activePartnerFilter 
    ? partners.filter(p => p.id === activePartnerFilter) 
    : partners;

  return (
    <div className="bg-[#0F172A] p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-6 shadow-xl relative overflow-hidden">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block">
              Topologia de Coligações & Vínculos Jurídicos
            </span>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Mapa Visual da Rede Societária (Teia de Coligadas)</span>
            </h3>
          </div>
        </div>

        {/* Filter / Selector */}
        {partners.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Filtrar Sócio:</span>
            <select
              value={activePartnerFilter || 'all'}
              onChange={(e) => setActivePartnerFilter(e.target.value === 'all' ? null : e.target.value)}
              className="bg-[#0B0F19] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-hidden focus:border-blue-500 cursor-pointer"
            >
              <option value="all">Exibir Todos ({partners.length})</option>
              {partners.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.participationPercent}%)</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {partners.length === 0 ? (
        <div className="p-8 text-center bg-[#0B0F19] rounded-xl border border-dashed border-slate-800 text-slate-400 space-y-2">
          <Users className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-xs font-bold text-slate-300">Nenhum sócio cadastrado para desenhar a rede.</p>
          <p className="text-[11px] text-slate-500">Adicione sócios manualmente ou sincronize pelo CNPJ da Receita Federal.</p>
        </div>
      ) : (
        /* VISUAL NETWORK DIAGRAM CONTAINER */
        <div className="space-y-6">
          
          {/* LEVEL 1: CENTRAL COMPANY NODE */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-xl bg-gradient-to-b from-blue-950/60 to-slate-900 border-2 border-blue-500/50 rounded-2xl p-4 sm:p-5 shadow-2xl relative text-center space-y-2">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-blue-600 text-white font-bold text-[10px] uppercase tracking-wider shadow-md">
                Empresa Principal Auditada
              </div>

              <div className="flex items-center justify-center space-x-2 pt-1">
                <Building2 className="w-5 h-5 text-blue-400" />
                <h4 className="text-base font-bold text-white tracking-wide">{company.name}</h4>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-slate-300">
                {company.cnpj && (
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-950/80 border border-blue-800/60 text-blue-300">
                    CNPJ: {formatCNPJ(company.cnpj)}
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
                  RBT12: {formatCurrencyBRL(currentRbt12)}
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-800/60 text-emerald-300">
                  Simples Nacional
                </span>
              </div>
            </div>

            {/* Connecting Vertical Stem */}
            <div className="w-0.5 h-8 bg-blue-500/40 relative">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-blue-400" />
            </div>
          </div>

          {/* LEVEL 2 & 3: PARTNERS AND THEIR LINKED COMPANIES */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {displayedPartners.map((partner) => {
              const otherCompanies = partner.otherCompanies || [];
              const totalColigadasRevenue = otherCompanies.reduce((s, o) => s + (o.revenue12m || 0), 0);

              return (
                <div 
                  key={partner.id}
                  onClick={() => onSelectPartner?.(partner.id)}
                  className="bg-[#0B0F19] rounded-2xl border border-slate-800 p-4 sm:p-5 space-y-4 shadow-lg hover:border-slate-700 transition cursor-pointer flex flex-col justify-between"
                >
                  {/* PARTNER HEADER NODE */}
                  <div className="space-y-3 pb-3 border-b border-slate-800/80">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <div className={`p-2 rounded-xl border ${
                          partner.isManager 
                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' 
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="font-bold text-sm text-white flex items-center gap-1.5">
                            <span>{partner.name || 'Sem nome'}</span>
                            {partner.isManager && (
                              <span title="Sócio Administrador">
                                <Crown className="w-3.5 h-3.5 text-amber-400" />
                              </span>
                            )}
                          </h5>
                          <p className="text-[10px] font-mono text-slate-400">
                            CPF: {partner.cpf || 'Não informado'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold font-mono text-blue-400">
                          {partner.participationPercent}%
                        </span>
                        <span className="text-[10px] text-slate-500 block">no capital</span>
                      </div>
                    </div>

                    {/* Role Tag */}
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
                        partner.isManager 
                          ? 'bg-blue-950/70 border-blue-500/40 text-blue-300' 
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}>
                        {partner.isManager ? '✓ Sócio Administrador' : 'Apenas Cotista (Sem Gestão)'}
                      </span>

                      <span className="text-[10px] font-mono text-slate-400">
                        {otherCompanies.length} PJ(s) vinculada(s)
                      </span>
                    </div>
                  </div>

                  {/* LINKED COMPANIES BRANCHES */}
                  <div className="space-y-2.5 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Ramificações & Outras PJs Vinculadas:
                    </span>

                    {otherCompanies.length === 0 ? (
                      <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 text-center text-[11px] text-slate-500 space-y-1">
                        <CheckCircle className="w-4 h-4 text-emerald-500/70 mx-auto" />
                        <p>Nenhuma outra empresa vinculada a este sócio.</p>
                      </div>
                    ) : (
                      otherCompanies.map((other) => {
                        const badge = getRuleBadge(partner, other);

                        return (
                          <div
                            key={other.id}
                            className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h6 className="font-bold text-xs text-slate-200">
                                  {other.name || 'Empresa Vinculada'}
                                </h6>
                                <p className="text-[10px] font-mono text-slate-400">
                                  {other.cnpj ? formatCNPJ(other.cnpj) : 'CNPJ não informado'}
                                </p>
                              </div>
                              <span className="text-[10px] font-mono font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                                {other.regime === 'simples' ? 'Simples' : other.regime === 'lucro_presumido' ? 'Lucro Pres.' : 'Lucro Real'}
                              </span>
                            </div>

                            {/* Details row */}
                            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
                              <span>Participação: <b className="text-white">{other.participationPercent || 0}%</b></span>
                              <span>Faturamento: <b className="text-indigo-300">{formatCurrencyBRL(other.revenue12m || 0)}</b></span>
                            </div>

                            {/* EXPLICATIVE ARTICLE 3 § 4 BADGE */}
                            <div className={`p-2 rounded-lg border text-[10px] font-mono flex items-start gap-1.5 ${badge.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot} shrink-0 mt-1`} />
                              <div>
                                <b className="font-bold">{badge.code}:</b> {badge.label}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* FOOTER TOTAL FOR THIS PARTNER */}
                  {otherCompanies.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400">Receita Somada do Sócio:</span>
                      <span className="font-bold text-indigo-400">+{formatCurrencyBRL(totalColigadasRevenue)}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
};
