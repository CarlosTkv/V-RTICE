import React, { useState } from 'react';
import { 
  Building, 
  Search, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Plus, 
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  FileText
} from 'lucide-react';
import { Partner, PartnerOtherCompany, TaxRegime } from '../types';
import { 
  fetchCNPJData, 
  searchPartnerOtherCompanies, 
  formatCNPJ, 
  CNPJApiResponse 
} from '../utils/cnpjService';
import { formatCurrencyBRL } from '../utils/taxRules';

interface PartnerCompanySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  partner: Partner;
  onAddCompany: (newCompany: PartnerOtherCompany) => void;
}

export const PartnerCompanySearchModal: React.FC<PartnerCompanySearchModalProps> = ({
  isOpen,
  onClose,
  partner,
  onAddCompany,
}) => {
  const [activeTab, setActiveTab] = useState<'auto_search' | 'cnpj'>('auto_search');
  const [cnpjInput, setCnpjInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchedCompany, setFetchedCompany] = useState<CNPJApiResponse | null>(null);

  // Auto-search discovered companies
  const [discoveredCompanies, setDiscoveredCompanies] = useState<PartnerOtherCompany[]>([]);
  const [hasSearchedAuto, setHasSearchedAuto] = useState(false);

  // Form custom fields for adding
  const [customRevenue, setCustomRevenue] = useState('0');
  const [customParticipation, setCustomParticipation] = useState('0');
  const [customIsManager, setCustomIsManager] = useState(false);
  const [customRegime, setCustomRegime] = useState<TaxRegime>('simples');

  React.useEffect(() => {
    if (isOpen && activeTab === 'auto_search' && !hasSearchedAuto && partner.name && partner.name.length > 2) {
      handleAutoSearchByPartner();
    }
  }, [isOpen, activeTab, partner.name]);

  if (!isOpen) return null;

  const handleSearchCNPJ = async () => {
    if (!cnpjInput.trim()) {
      setError('Informe o CNPJ da empresa.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setFetchedCompany(null);

    try {
      const data = await fetchCNPJData(cnpjInput);
      setFetchedCompany(data);

      // Check if this partner is in the QSA as manager
      const partnerInQSA = data.qsa.find(s => 
        s.nome_socio.toUpperCase().includes(partner.name.toUpperCase()) ||
        partner.name.toUpperCase().includes(s.nome_socio.toUpperCase())
      );

      if (partnerInQSA) {
        const isAdm = (partnerInQSA.qualificacao_socio || '').toLowerCase().includes('administrador') ||
                      (partnerInQSA.qualificacao_socio || '').toLowerCase().includes('gerente') ||
                      (partnerInQSA.qualificacao_socio || '').includes('49');
        setCustomIsManager(isAdm);
        if (partnerInQSA.percentual_capital_social) {
          setCustomParticipation(partnerInQSA.percentual_capital_social.toString());
        }
      }

      // Pre-set tax regime
      setCustomRegime(data.opcao_pelo_simples ? 'simples' : 'lucro_presumido');
      setCustomRevenue('0');
    } catch (err: any) {
      setError(err.message || 'Erro ao consultar CNPJ na base pública.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoSearchByPartner = async () => {
    setIsLoading(true);
    setError(null);
    setHasSearchedAuto(true);

    try {
      const results = await searchPartnerOtherCompanies(partner.name, partner.cpf);
      setDiscoveredCompanies(results);
    } catch (err: any) {
      setError('Erro ao realizar busca automatizada de vínculos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAddFetched = () => {
    if (!fetchedCompany) return;

    const newComp: PartnerOtherCompany = {
      id: `outra-${Date.now()}`,
      name: fetchedCompany.razao_social || 'Sem dados disponíveis',
      cnpj: fetchedCompany.cnpj || 'Sem dados disponíveis',
      revenue12m: parseFloat(customRevenue) || 0,
      participationPercent: parseFloat(customParticipation) || 0,
      isManager: customIsManager,
      regime: customRegime,
      cnae: fetchedCompany.cnae_fiscal || 'Sem dados disponíveis',
      cnaeDescription: fetchedCompany.cnae_fiscal_descricao || 'Sem dados disponíveis',
      uf: fetchedCompany.uf || 'SP',
      city: fetchedCompany.municipio || 'Sem dados disponíveis',
      status: fetchedCompany.situacao_cadastral || 'Sem dados disponíveis',
      capitalSocial: fetchedCompany.capital_social || 0,
      simplesOptant: fetchedCompany.opcao_pelo_simples ?? (customRegime === 'simples'),
      meiOptant: fetchedCompany.opcao_pelo_mei ?? false,
      source: 'api',
    };

    onAddCompany(newComp);
    onClose();
  };

  const handleAddDiscovered = (comp: PartnerOtherCompany) => {
    onAddCompany(comp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#0B0F19]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/30 text-blue-400">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Pesquisa de Vínculos Societários</p>
              <h3 className="text-base font-bold text-slate-100 tracking-tight">
                Vincular Outras Empresas de {partner.name}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 p-1 rounded-lg transition hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap border-b border-slate-800 bg-[#0B0F19] px-5 py-2 gap-2 text-xs font-semibold">
          <button
            onClick={() => { setActiveTab('cnpj'); setError(null); }}
            className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-2 text-xs font-bold uppercase tracking-wider cursor-pointer ${
              activeTab === 'cnpj'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Consultar por CNPJ</span>
          </button>

          <button
            onClick={() => { 
              setActiveTab('auto_search'); 
              setError(null); 
              if (!hasSearchedAuto) handleAutoSearchByPartner();
            }}
            className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-2 text-xs font-bold uppercase tracking-wider cursor-pointer ${
              activeTab === 'auto_search'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Buscar Empresas do Sócio</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs text-slate-300">
          
          {activeTab === 'cnpj' ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Informe o CNPJ da outra empresa do sócio:
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={cnpjInput}
                      onChange={(e) => setCnpjInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchCNPJ()}
                      placeholder="00.000.000/0000-00"
                      className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 font-mono focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSearchCNPJ}
                    disabled={isLoading || !cnpjInput.trim()}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition flex items-center space-x-2 shrink-0 shadow-sm shadow-blue-600/20 cursor-pointer"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    <span>Consultar CNPJ</span>
                  </button>
                </div>
                <div className="flex items-center space-x-2 text-[11px] text-slate-400 pt-0.5">
                  <span>Digite apenas números ou com a pontuação padrão do CNPJ (14 dígitos).</span>
                </div>
              </div>

              {/* Error Callout */}
              {error && (
                <div className="p-3 bg-red-950/60 border border-red-500/30 rounded-xl flex items-center space-x-2 text-xs text-red-300">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Fetched Company Details Card */}
              {fetchedCompany && (
                <div className="p-4 bg-[#0B0F19] rounded-xl border border-slate-800 space-y-4 animate-fadeIn">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30 uppercase font-semibold">
                        CNPJ: {fetchedCompany.cnpj} • {fetchedCompany.situacao_cadastral}
                      </span>
                      <h4 className="text-sm font-bold text-slate-100 mt-1.5">{fetchedCompany.razao_social}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {fetchedCompany.cnae_fiscal} — {fetchedCompany.cnae_fiscal_descricao}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {fetchedCompany.municipio} / {fetchedCompany.uf} • Capital Social: {formatCurrencyBRL(fetchedCompany.capital_social || 0)}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        fetchedCompany.opcao_pelo_simples
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-950/60 text-amber-300 border-amber-500/30'
                      }`}>
                        {fetchedCompany.opcao_pelo_simples ? 'Optante Simples' : 'Não Optante'}
                      </span>
                    </div>
                  </div>

                  {/* QSA Found on the Company */}
                  {fetchedCompany.qsa.length > 0 && (
                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Sócios Cadastrados no QSA desta Empresa:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {fetchedCompany.qsa.map((s, idx) => (
                          <div key={idx} className="p-2 bg-[#0F172A] rounded-lg border border-slate-800 text-[11px]">
                            <div className="font-semibold text-slate-200">{s.nome_socio}</div>
                            <div className="text-[10px] text-slate-400 flex items-center justify-between mt-0.5">
                              <span>{s.qualificacao_socio}</span>
                              {s.percentual_capital_social ? (
                                <span className="font-mono text-blue-400 font-bold">{s.percentual_capital_social}%</span>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Parameters for Tax Calculation */}
                  <div className="pt-3 border-t border-slate-800 space-y-3">
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                      Parâmetros Tributários para Soma (Art. 3º § 4º LC 123/06):
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Faturamento RBT12 (Últimos 12 Meses):
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-slate-500 font-mono">R$</span>
                          <input
                            type="number"
                            step="any"
                            value={customRevenue}
                            onChange={(e) => setCustomRevenue(e.target.value)}
                            className="w-full bg-[#0F172A] border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-blue-400 font-mono font-bold focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          % Quotas de {partner.name.split(' ')[0]}:
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={customParticipation}
                            onChange={(e) => setCustomParticipation(e.target.value)}
                            className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono font-bold focus:border-blue-500 focus:outline-none"
                          />
                          <span className="absolute right-3 top-1.5 text-slate-500 font-mono">%</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          {partner.name.split(' ')[0]} é Administrador aqui?
                        </label>
                        <select
                          value={customIsManager ? '1' : '0'}
                          onChange={(e) => setCustomIsManager(e.target.value === '1')}
                          className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none cursor-pointer"
                        >
                          <option value="1" className="bg-[#0F172A] text-slate-100">Sim (Sócio-Administrador)</option>
                          <option value="0" className="bg-[#0F172A] text-slate-100">Não (Apenas Cotista)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Regime Tributário desta Empresa:
                        </label>
                        <select
                          value={customRegime}
                          onChange={(e) => setCustomRegime(e.target.value as any)}
                          className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none cursor-pointer"
                        >
                          <option value="simples" className="bg-[#0F172A] text-slate-100">Simples Nacional</option>
                          <option value="lucro_presumido" className="bg-[#0F172A] text-slate-100">Lucro Presumido</option>
                          <option value="lucro_real" className="bg-[#0F172A] text-slate-100">Lucro Real</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleConfirmAddFetched}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center space-x-2 shadow-sm shadow-emerald-600/20 mt-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Vincular Empresa ao Sócio & Auditar Risco</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3.5 bg-[#0B0F19] rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Buscando empresas com participação de:
                  </span>
                  <span className="text-sm font-bold text-slate-100">{partner.name}</span>
                </div>
                <button
                  type="button"
                  onClick={handleAutoSearchByPartner}
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
                >
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  <span>Atualizar Busca</span>
                </button>
              </div>

              {isLoading ? (
                <div className="py-8 text-center space-y-2">
                  <Loader2 className="w-6 h-6 text-blue-500 animate-spin mx-auto" />
                  <p className="text-xs text-slate-400">Consultando bases corporativas e quadros de sócios...</p>
                </div>
              ) : discoveredCompanies.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                      {discoveredCompanies.length} Empresa(s) encontrada(s) vinculada(s) ao sócio:
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        discoveredCompanies.forEach(c => onAddCompany(c));
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold transition flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-emerald-400" />
                      <span>Vincular Todas ({discoveredCompanies.length})</span>
                    </button>
                  </div>
                  {discoveredCompanies.map((comp) => (
                    <div
                      key={comp.id}
                      className="p-4 bg-[#0B0F19] rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30 font-bold">
                            {comp.cnpj}
                          </span>
                          <span className="text-[10px] text-slate-400">{comp.uf}</span>
                        </div>
                        <h4 className="font-bold text-slate-100 text-xs">{comp.name}</h4>
                        <p className="text-[11px] text-slate-400">
                          {comp.cnaeDescription || 'Atividade empresarial'}
                        </p>
                        <div className="flex items-center space-x-3 text-[10px] text-slate-400 pt-1">
                          <span>Quotas: <b className="text-blue-400">{comp.participationPercent}%</b></span>
                          <span>•</span>
                          <span>Função: <b className="text-slate-200">{comp.isManager ? 'Administrador' : 'Sócio'}</b></span>
                          <span>•</span>
                          <span>Faturamento Est.: <b className="text-amber-400">{formatCurrencyBRL(comp.revenue12m)}</b></span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddDiscovered(comp)}
                        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition flex items-center space-x-1.5 shrink-0 cursor-pointer shadow-sm shadow-blue-600/20"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Vincular</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : hasSearchedAuto ? (
                <div className="py-8 text-center bg-[#0B0F19] rounded-xl border border-dashed border-slate-700 space-y-2 p-6">
                  <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-200">Nenhum outro CNPJ coligado localizado automaticamente.</p>
                  <p className="text-[11px] text-slate-400 max-w-md mx-auto leading-relaxed">
                    Você pode usar a aba <b className="text-blue-400">"Consultar por CNPJ"</b> para digitar diretamente o CNPJ de qualquer outra empresa que o sócio possua.
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-slate-800 bg-[#0B0F19] flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
