import React, { useState } from 'react';
import { 
  Building2, 
  Trash2, 
  Plus, 
  Check, 
  AlertTriangle, 
  Download, 
  X, 
  Sparkles,
  Building,
  Upload
} from 'lucide-react';
import { CompanyData } from '../types';
import { formatCurrencyBRL } from '../utils/taxRules';
import { CertificateUploadField } from './CertificateUploadField';

interface CompanyManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: CompanyData[];
  activeCompanyIndex: number;
  onSelectCompany: (index: number) => void;
  onCreateCompany: (company: CompanyData) => void;
  onDeleteCompany: (index: number) => void;
  onOpenPDFUpload?: () => void;
  onClearCompanyData?: () => void;
}

export const CompanyManagerModal: React.FC<CompanyManagerModalProps> = ({
  isOpen,
  onClose,
  companies,
  activeCompanyIndex,
  onSelectCompany,
  onCreateCompany,
  onDeleteCompany,
  onOpenPDFUpload,
  onClearCompanyData,
}) => {
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // New Company form state
  const [newName, setNewName] = useState('');
  const [newCnpj, setNewCnpj] = useState('');
  const [newCnae, setNewCnae] = useState('');
  const [newCnaeDesc, setNewCnaeDesc] = useState('');
  const [newUf, setNewUf] = useState('SP');
  const [newAnexo, setNewAnexo] = useState<'I' | 'II' | 'III' | 'IV' | 'V'>('I');
  const [newRbt12, setNewRbt12] = useState('0');
  const [newPayroll12m, setNewPayroll12m] = useState('0');
  const [newRegimeTributario, setNewRegimeTributario] = useState<'simples_nacional' | 'lucro_presumido' | 'lucro_real' | 'mei'>('simples_nacional');
  const [newAtividadeEmpresa, setNewAtividadeEmpresa] = useState<'servicos' | 'comercio' | 'industria' | 'misto'>('servicos');
  const [isSearchingCnpj, setIsSearchingCnpj] = useState(false);
  const [cnpjFeedback, setCnpjFeedback] = useState<string | null>(null);
  const [cnaeSearchQuery, setCnaeSearchQuery] = useState('');
  const [showCnaeDropdown, setShowCnaeDropdown] = useState(false);
  const [companyFilterQuery, setCompanyFilterQuery] = useState('');

  const COMMON_CNAES = [
    { code: '62.01-5-01', desc: 'Desenvolvimento de programas de computador sob encomenda', anexo: 'III' as const },
    { code: '62.04-0-00', desc: 'Consultoria em tecnologia da informação', anexo: 'III' as const },
    { code: '69.20-6-01', desc: 'Atividades de contabilidade', anexo: 'III' as const },
    { code: '70.20-4-00', desc: 'Atividades de consultoria em gestão empresarial', anexo: 'III' as const },
    { code: '49.30-2-02', desc: 'Transporte rodoviário de carga, exceto produtos perigosos', anexo: 'III' as const },
    { code: '47.12-1-00', desc: 'Comércio varejista de mercadorias em geral', anexo: 'I' as const },
    { code: '86.30-5-03', desc: 'Atividade médica ambulatorial restrita a consultas', anexo: 'III' as const },
    { code: '71.12-0-00', desc: 'Serviços de engenharia', anexo: 'III' as const },
    { code: '73.19-0-04', desc: 'Consultoria em publicidade', anexo: 'V' as const },
    { code: '56.11-2-01', desc: 'Restaurantes e similares', anexo: 'I' as const },
  ];

  const filteredCnaes = COMMON_CNAES.filter(c => 
    c.code.toLowerCase().includes(cnaeSearchQuery.toLowerCase()) || 
    c.desc.toLowerCase().includes(cnaeSearchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  const handleLookupCnpj = async () => {
    const clean = newCnpj.replace(/\D/g, '');
    if (clean.length !== 14) {
      setCnpjFeedback('Digite um CNPJ válido com 14 dígitos.');
      return;
    }
    setIsSearchingCnpj(true);
    setCnpjFeedback(null);
    try {
      const res = await fetch(`https://publica.cnpj.ws/cnpj/${clean}`);
      if (!res.ok) throw new Error('Não encontrado na base pública.');
      const data = await res.json();
      if (data && data.razao_social) {
        setNewName(data.razao_social);
        if (data.estabelecimento?.estado?.sigla) {
          setNewUf(data.estabelecimento.estado.sigla);
        }
        if (data.estabelecimento?.atividade_principal?.id) {
          setNewCnae(String(data.estabelecimento.atividade_principal.id));
          setNewCnaeDesc(data.estabelecimento.atividade_principal.descricao || '');
        }
        setCnpjFeedback('✅ Empresa encontrada e dados preenchidos com sucesso!');
      } else {
        throw new Error('Dados insuficientes.');
      }
    } catch (err) {
      try {
        const res2 = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${clean}`);
        if (!res2.ok) throw new Error('CNPJ não localizado na API BrasilAPI.');
        const data2 = await res2.json();
        if (data2 && data2.razao_social) {
          setNewName(data2.razao_social);
          if (data2.uf) setNewUf(data2.uf);
          if (data2.cnae_fiscal) {
            setNewCnae(String(data2.cnae_fiscal));
            setNewCnaeDesc(data2.cnae_fiscal_descricao || '');
          }
          setCnpjFeedback('✅ Empresa encontrada via BrasilAPI!');
        } else {
          setCnpjFeedback('⚠️ CNPJ não localizado. Preencha manualmente.');
        }
      } catch (e2) {
        setCnpjFeedback('⚠️ Consulta falhou ou CNPJ inválido. Preencha manualmente.');
      }
    } finally {
      setIsSearchingCnpj(false);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const rbt12Val = parseFloat(newRbt12) || 0;
    const payrollVal = parseFloat(newPayroll12m) || 0;

    const newCompany: CompanyData = {
      id: 'comp_' + Date.now(),
      name: newName.trim().toUpperCase(),
      cnpj: newCnpj.trim() || 'Sem dados disponíveis',
      cnae: newCnae.trim() || 'Sem dados disponíveis',
      cnaeDescription: newCnaeDesc.trim() || 'Sem dados disponíveis',
      uf: newUf || 'SP',
      regimeTributario: newRegimeTributario,
      atividadeEmpresa: newAtividadeEmpresa,
      anexo: newAnexo || 'I',
      rbt12: rbt12Val,
      rba: rbt12Val,
      monthlyRevenue: rbt12Val > 0 ? rbt12Val / 12 : 0,
      payroll12m: payrollVal,
      monthlyPayroll: payrollVal > 0 ? payrollVal / 12 : 0,
      b2bSalesPercent: 0,
      projectionGrowthPercent: 0,
      estimatedNetProfitMargin: 0,
      targetIvaRate: 26.5,
      partners: [],
      cfopItems: [],
      createdAt: new Date().toISOString(),
    };

    onCreateCompany(newCompany);
    setIsCreatingNew(false);
    setNewName('');
    setNewCnpj('');
  };

  const handleConfirmDelete = (index: number) => {
    if (companies.length <= 1) {
      alert('É necessário manter ao menos 1 empresa na base de dados.');
      setDeleteConfirmIndex(null);
      return;
    }
    onDeleteCompany(index);
    setDeleteConfirmIndex(null);
  };

  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(companies, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `backup_empresas_vertice_fiscal_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl w-full max-w-2xl text-slate-100 shadow-2xl overflow-hidden animate-in fade-in duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0B0F19]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                Gerenciador de Empresas
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                  {companies.length} empresas
                </span>
              </h3>
              <p className="text-xs text-slate-400">Alterne, adicione, exporte ou exclua empresas cadastradas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsCreatingNew(!isCreatingNew)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                {isCreatingNew ? 'Cancelar Cadastro' : 'Cadastrar Nova Empresa'}
              </button>

              {onOpenPDFUpload && (
                <button
                  type="button"
                  onClick={onOpenPDFUpload}
                  className="px-3.5 py-2 text-xs font-bold text-blue-300 hover:text-white bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                  title="Importar dados de extrato da declaração PGDAS-D em PDF ou e-CAC"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-400" />
                  <span>Importar via PGDAS-D</span>
                </button>
              )}

              {onClearCompanyData && (
                <button
                  type="button"
                  onClick={() => {
                    onClearCompanyData();
                    onClose();
                  }}
                  className="px-3.5 py-2 text-xs font-bold text-rose-300 hover:text-white bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/70 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                  title="Zerar e limpar os dados da empresa atual para iniciar nova importação do zero"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Limpar Dados da Empresa</span>
                </button>
              )}
            </div>

            <button
              onClick={handleExportBackup}
              className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              title="Exportar backup em JSON de todas as empresas"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar Backup JSON
            </button>
          </div>

          {/* Form for Creating New Company */}
          {isCreatingNew && (
            <form onSubmit={handleCreateSubmit} className="p-4 rounded-xl bg-[#0B0F19] border border-blue-500/30 space-y-4 animate-in fade-in">
              <div className="font-bold text-xs text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Nova Empresa para a Base
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <CertificateUploadField 
                    label="Certificado Digital (A1/A3)" 
                    onFileSelect={(file, password) => console.log('Certificado selecionado:', file, 'com senha:', password)}
                  />
                </div>
                <div className="sm:col-span-2 relative">
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                    <span>CNAE Principal & Descrição</span>
                    <span className="text-[11px] text-slate-400">🔍 Digite para buscar sugestões de CNAE</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCnae}
                      onChange={(e) => setNewCnae(e.target.value)}
                      placeholder="Ex: 62.01-5-01"
                      className="w-36 bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                    />
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={newCnaeDesc || cnaeSearchQuery}
                        onChange={(e) => {
                          setCnaeSearchQuery(e.target.value);
                          setNewCnaeDesc(e.target.value);
                          setShowCnaeDropdown(true);
                        }}
                        onFocus={() => setShowCnaeDropdown(true)}
                        placeholder="Pesquisar por palavra-chave ou atividade..."
                        className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                      />
                      {showCnaeDropdown && filteredCnaes.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-[#0F172A] border border-slate-700 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                          {filteredCnaes.map((item, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setNewCnae(item.code);
                                setNewCnaeDesc(item.desc);
                                setNewAnexo(item.anexo);
                                setShowCnaeDropdown(false);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-slate-800 text-xs border-b border-slate-800/60 transition flex flex-col cursor-pointer"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-bold text-blue-400">{item.code}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">Anexo {item.anexo}</span>
                              </div>
                              <span className="text-slate-300 truncate">{item.desc}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                    <span>CNPJ</span>
                    <button
                      type="button"
                      onClick={handleLookupCnpj}
                      disabled={isSearchingCnpj}
                      className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {isSearchingCnpj ? 'Consultando...' : '🔍 Consultar Receita'}
                    </button>
                  </label>
                  <input
                    type="text"
                    value={newCnpj}
                    onChange={(e) => setNewCnpj(e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                  {cnpjFeedback && (
                    <p className="text-[11px] mt-1 text-slate-300">{cnpjFeedback}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">UF (Estado)</label>
                  <select
                    value={newUf}
                    onChange={(e) => setNewUf(e.target.value)}
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    {['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'PE', 'CE', 'GO', 'DF', 'ES', 'AM', 'MT', 'MS', 'PA'].map((uf) => (
                      <option key={uf} value={uf} className="bg-[#0F172A] text-slate-100">{uf}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Anexo do Simples</label>
                  <select
                    value={newAnexo}
                    onChange={(e) => setNewAnexo(e.target.value as any)}
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="I" className="bg-[#0F172A] text-slate-100">Anexo I - Comércio</option>
                    <option value="II" className="bg-[#0F172A] text-slate-100">Anexo II - Indústria</option>
                    <option value="III" className="bg-[#0F172A] text-slate-100">Anexo III - Serviços (Geral / Fator R)</option>
                    <option value="IV" className="bg-[#0F172A] text-slate-100">Anexo IV - Serviços (CPP Fora)</option>
                    <option value="V" className="bg-[#0F172A] text-slate-100">Anexo V - Serviços Intelectuais</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Regime Tributário</label>
                  <select
                    value={newRegimeTributario}
                    onChange={(e) => setNewRegimeTributario(e.target.value as any)}
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="simples_nacional" className="bg-[#0F172A] text-slate-100">Simples Nacional</option>
                    <option value="lucro_presumido" className="bg-[#0F172A] text-slate-100">Lucro Presumido</option>
                    <option value="lucro_real" className="bg-[#0F172A] text-slate-100">Lucro Real</option>
                    <option value="mei" className="bg-[#0F172A] text-slate-100">MEI (Microempreendedor Individual)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Atividade Principal (Setor)</label>
                  <select
                    value={newAtividadeEmpresa}
                    onChange={(e) => setNewAtividadeEmpresa(e.target.value as any)}
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="servicos" className="bg-[#0F172A] text-slate-100">Prestação de Serviços</option>
                    <option value="comercio" className="bg-[#0F172A] text-slate-100">Comércio Varejista/Atacadista</option>
                    <option value="industria" className="bg-[#0F172A] text-slate-100">Indústria / Fabricação</option>
                    <option value="misto" className="bg-[#0F172A] text-slate-100">Misto (Comércio e Serviços)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition"
                >
                  Salvar Empresa na Base
                </button>
              </div>
            </form>
          )}

          {/* Companies List */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Empresas Cadastradas ({companies.length}):
              </div>
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={companyFilterQuery}
                  onChange={(e) => setCompanyFilterQuery(e.target.value)}
                  placeholder="🔍 Filtrar por nome ou CNPJ..."
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {companies
              .map((comp, originalIdx) => ({ comp, originalIdx }))
              .filter(({ comp }) => 
                comp.name.toLowerCase().includes(companyFilterQuery.toLowerCase()) || 
                comp.cnpj.toLowerCase().includes(companyFilterQuery.toLowerCase()) ||
                comp.cnae.toLowerCase().includes(companyFilterQuery.toLowerCase())
              )
              .map(({ comp, originalIdx }) => {
                const idx = originalIdx;
                const isActive = idx === activeCompanyIndex;

              return (
                <div
                  key={comp.cnpj || idx}
                  className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isActive
                      ? 'bg-blue-950/40 border-blue-500/50 ring-1 ring-blue-500/30'
                      : 'bg-[#0B0F19] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-100">{comp.name}</span>
                      {isActive && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/40">
                          EMPRESA ATIVA
                        </span>
                      )}
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
                        Anexo {comp.anexo}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 flex items-center gap-3 flex-wrap font-mono">
                      <span>CNPJ: {comp.cnpj}</span>
                      <span>•</span>
                      <span>RBT12: {formatCurrencyBRL(comp.rbt12)}</span>
                      <span>•</span>
                      <span>UF: {comp.uf}</span>
                      <span>•</span>
                      <span>{comp.partners?.length || 0} Sócios</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!isActive ? (
                      <button
                        onClick={() => {
                          onSelectCompany(idx);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition border border-slate-700 cursor-pointer"
                      >
                        Selecionar
                      </button>
                    ) : (
                      <div className="px-3 py-1.5 bg-emerald-950/60 text-emerald-300 text-xs font-bold rounded-lg border border-emerald-500/30 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Em Uso
                      </div>
                    )}

                    {/* Delete Company Button */}
                    <button
                      onClick={() => setDeleteConfirmIndex(idx)}
                      disabled={companies.length <= 1}
                      className={`p-2 rounded-lg transition ${
                        companies.length <= 1
                          ? 'text-slate-600 cursor-not-allowed'
                          : 'text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 cursor-pointer'
                      }`}
                      title={companies.length <= 1 ? 'Mínimo de 1 empresa obrigatória' : 'Excluir esta empresa'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Delete Confirmation Dialog */}
          {deleteConfirmIndex !== null && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
              <div className="bg-[#0F172A] border border-rose-500/40 rounded-2xl w-full max-w-md p-6 text-slate-100 shadow-2xl space-y-4 animate-in fade-in">
                <div className="flex items-center gap-3 text-rose-400">
                  <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-400">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-slate-100">Excluir Empresa?</h4>
                    <p className="text-xs text-rose-400">Esta ação não pode ser desfeita.</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Você está prestes a remover definitivamente a empresa <strong className="text-white">"{companies[deleteConfirmIndex]?.name}"</strong> da base de dados local.
                </p>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setDeleteConfirmIndex(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer border border-slate-700"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleConfirmDelete(deleteConfirmIndex)}
                    className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    Confirmar Exclusão
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
