import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  AlertTriangle, 
  FileSpreadsheet, 
  Coins, 
  Scale, 
  Percent, 
  Info,
  Tag,
  CheckCircle2,
  RefreshCw,
  FileText
} from 'lucide-react';
import { 
  CompanyData, 
  CalculationResult, 
  CFOPItem, 
  ICMSTreatment, 
  ISSTreatment, 
  PisCofinsTreatment,
  SimplesAnexo
} from '../types';
import { 
  formatCurrencyBRL, 
  formatPercentBR, 
  COMMON_CFOPS_CATALOG,
  getDefaultCFOPsForAnexo,
  calculateTaxAudit
} from '../utils/taxRules';
import { HelpTooltip } from './HelpTooltip';
import { ReportViewerModal } from './ReportViewerModal';
import { BrandLogo } from './BrandLogo';

interface CFOPTaxSegregationViewProps {
  company: CompanyData;
  calculation?: CalculationResult;
  result?: CalculationResult;
  onChangeCompany?: (company: CompanyData) => void;
  onUpdateCompany?: (updated: Partial<CompanyData>) => void;
}

export const CFOPTaxSegregationView: React.FC<CFOPTaxSegregationViewProps> = ({
  company,
  calculation: propCalculation,
  result: propResult,
  onChangeCompany,
  onUpdateCompany,
}) => {
  // Use provided calculation or compute safely
  const result: CalculationResult = propResult || propCalculation || calculateTaxAudit(company || {
    name: 'Empresa',
    cnpj: '',
    cnae: '',
    cnaeDescription: '',
    uf: 'SP',
    anexo: 'I',
    rbt12: 0,
    rba: 0,
    monthlyRevenue: 0,
    payroll12m: 0,
    monthlyPayroll: 0,
    b2bSalesPercent: 0,
    partners: [],
    cfopItems: [],
    projectionGrowthPercent: 0,
    estimatedNetProfitMargin: 0,
    targetIvaRate: 26.5
  });

  const isAutoDefault = !company?.cfopItems || company.cfopItems.length === 0;
  const currentCFOPs: CFOPItem[] = !isAutoDefault
    ? (company.cfopItems || [])
    : getDefaultCFOPsForAnexo(company?.anexo || 'I', company?.isTransportService);

  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    if (!company?.cfopItems || company.cfopItems.length === 0) {
      const defaults = getDefaultCFOPsForAnexo(company?.anexo || 'I', company?.isTransportService);
      handleUpdate({ cfopItems: defaults });
    }
  }, [company?.anexo, company?.isTransportService]);

  const handleUpdate = (updatedFields: Partial<CompanyData>) => {
    if (onUpdateCompany) {
      onUpdateCompany(updatedFields);
    } else if (onChangeCompany && company) {
      onChangeCompany({
        ...company,
        ...updatedFields,
      });
    }
  };

  const handleAddCFOP = (catalogItem?: typeof COMMON_CFOPS_CATALOG[0]) => {
    const defaultPercentage = currentCFOPs.length === 0 ? 100 : 10;
    const newItem: CFOPItem = {
      id: 'cfop_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      code: catalogItem?.code || '5.102',
      description: catalogItem?.description || 'Venda de mercadoria adquirida de terceiros',
      percentage: defaultPercentage,
      anexo: (catalogItem?.anexo as SimplesAnexo) || company?.anexo || 'I',
      icmsTreatment: (catalogItem?.defaultIcms as ICMSTreatment) || 'tributado_integral',
      issTreatment: (catalogItem?.defaultIss as ISSTreatment) || (company?.anexo === 'III' || company?.anexo === 'IV' || company?.anexo === 'V' ? 'tributado_integral' : 'nao_aplicavel'),
      pisCofinsTreatment: 'tributado_integral',
    };

    const updated = [...currentCFOPs, newItem];
    handleUpdate({ cfopItems: updated });
    setShowCatalogModal(false);
  };

  const handleUpdateCFOP = (id: string, updates: Partial<CFOPItem>) => {
    const updated = currentCFOPs.map(item => item.id === id ? { ...item, ...updates } : item);
    handleUpdate({ cfopItems: updated });
  };

  const handleDeleteCFOP = (id: string) => {
    const updated = currentCFOPs.filter(item => item.id !== id);
    handleUpdate({ cfopItems: updated });
  };

  const handleLoadDefaults = () => {
    const defaults = getDefaultCFOPsForAnexo(company?.anexo || 'I');
    handleUpdate({ cfopItems: defaults });
  };

  const handleClearAll = () => {
    handleUpdate({ cfopItems: [] });
  };

  const totalPercentage = currentCFOPs.reduce((acc, curr) => acc + (curr.percentage || 0), 0);
  const monthlyRev = (company?.monthlyRevenue && company.monthlyRevenue > 0)
    ? company.monthlyRevenue 
    : ((company?.rbt12 && company.rbt12 > 0) ? company.rbt12 / 12 : 0);

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Summary */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <BrandLogo variant="badge" module="monofasico" />
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Percent className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-white">Matriz de CFOPs e Segregação de ICMS / ISS</h3>
                <HelpTooltip
                  title="Segregação de Receitas (Art. 18 § 4º-A da LC 123/2006)"
                  content="Permite abater do cálculo do DAS as parcelas relativas a ICMS Substituição Tributária (ST) e Isenções, bem como ISS retido pelo tomador de serviços. A empresa informa a receita bruta total, mas desmarca os tributos já recolhidos na cadeia anterior para evitar bitributação."
                />
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#0B0F19] text-slate-300 border border-slate-800">
                  LC 123/2006 Art. 18 § 4º-A
                </span>
                {isAutoDefault && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Padrão Automático Anexo {company.anexo || 'I'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Configure a proporção de faturamento por CFOP para abater parcelas de Substituição Tributária (ST), Isenções e Retenções do DAS.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              className="px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center gap-1.5 transition shadow-md shadow-blue-600/20 cursor-pointer"
              title="Gerar e Visualizar Relatório Oficial de Segregação por CFOPs"
            >
              <FileText className="w-3.5 h-3.5" />
              Relatório de CFOPs
            </button>
            {currentCFOPs.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-400 bg-[#0B0F19] hover:bg-slate-800 border border-slate-800 rounded-xl transition cursor-pointer"
              >
                Limpar CFOPs
              </button>
            )}
            <button
              type="button"
              onClick={handleLoadDefaults}
              className="px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-[#0B0F19] hover:bg-slate-800 border border-slate-800 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              Carregar Padrão Anexo {company.anexo || 'I'}
            </button>
            <button
              type="button"
              onClick={() => setShowCatalogModal(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-400 rounded-xl flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Adicionar CFOP
            </button>
          </div>
        </div>

        {/* Warning if total percent != 100 and items exist */}
        {currentCFOPs.length > 0 && Math.abs(totalPercentage - 100) > 0.1 && (
          <div className="mt-4 p-3 rounded-xl bg-amber-950/30 border border-amber-800/80 text-amber-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                A soma das porcentagens dos CFOPs está em <strong>{totalPercentage.toFixed(1)}%</strong> (o ideal é 100%). Os cálculos são proporcionalizados automaticamente.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                if (totalPercentage > 0) {
                  const factor = 100 / totalPercentage;
                  const normalized = currentCFOPs.map(c => ({
                    ...c,
                    percentage: Number(((c.percentage || 0) * factor).toFixed(1))
                  }));
                  handleUpdate({ cfopItems: normalized });
                }
              }}
              className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold rounded-lg transition cursor-pointer border border-amber-500/30"
            >
              Equalizar para 100%
            </button>
          </div>
        )}

        {/* Sublimit Notification Alert */}
        {result.exceedsSublimit && (
          <div className="mt-4 p-4 rounded-xl bg-rose-950/30 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-rose-300 text-sm">Alerta de Sublimite Estadual (R$ 3.600.000,00 Ultrapassado)</span>
              <p className="mt-1 text-slate-300 leading-relaxed">
                Como o faturamento acumulado consolidado atingiu {formatCurrencyBRL(result.consolidatedRevenue || 0)}, o ICMS e o ISS deixam de ser recolhidos dentro do DAS e passam a ser exigidos <strong>POR FORA do Simples</strong>, sob a legislação estadual e municipal com entrega de EFD/SPED Fiscal.
              </p>
              <div className="mt-2 font-semibold text-rose-400">
                Valor estimado de ICMS/ISS recolhido fora do DAS no mês: {formatCurrencyBRL(result.icmsIssOutsideSimplesTotal || 0)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards for Segregation Impact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>DAS Bruto (Sem Segregação)</span>
            <HelpTooltip
              title="DAS Integral"
              content="Cálculo do DAS aplicando a alíquota cheia do Anexo sem qualquer dedução de Substituição Tributária ou Isenção."
            />
          </div>
          <div className="text-xl font-bold text-white">{formatCurrencyBRL(result.rawTaxMonthlyBeforeSegregation || 0)}</div>
          <div className="text-xs text-slate-400 mt-1">Alíquota cheia: {(result.effectiveRate || 0).toFixed(2)}%</div>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold mb-1">
            <span>Economia por ST / Isenção</span>
            <HelpTooltip
              title="Economia Real por Segregação"
              content="Soma de todos os abatimentos de ICMS e ISS garantidos pela legislação que são retirados do cálculo do PGDAS-D."
            />
          </div>
          <div className="text-xl font-bold text-emerald-400">-{formatCurrencyBRL(result.segregatedDeductionsMonthly || 0)}</div>
          <div className="text-xs text-emerald-400 mt-1">Abatimento mensal legítimo no DAS</div>
        </div>

        <div className="bg-[#0F172A] border border-amber-500/30 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-xs text-amber-400 font-semibold mb-1">
            <span>DAS Efetivo a Pagar (Mês)</span>
            <HelpTooltip
              title="DAS Líquido Devido"
              content="Valor financeiro real da guia do DAS a ser recolhida até o dia 20 do mês subsequente."
            />
          </div>
          <div className="text-2xl font-black text-amber-400">{formatCurrencyBRL(result.effectiveTaxMonthly || 0)}</div>
          <div className="text-xs text-amber-300/80 mt-1">Economia anual de {formatCurrencyBRL((result.segregatedDeductionsMonthly || 0) * 12)}</div>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Recolhimento ICMS/ISS Fora</span>
            <HelpTooltip
              title="Recolhimento Fora do DAS"
              content="Quando a empresa ultrapassa o sublimite estadual de R$ 3,6M, o ICMS e/ou ISS são excluídos do DAS e recolhidos em guias separadas (GARE/DARE/DAM)."
            />
          </div>
          <div className="text-xl font-bold text-indigo-400">{formatCurrencyBRL(result.icmsIssOutsideSimplesTotal || 0)}</div>
          <div className="text-xs text-slate-400 mt-1">Sublimite ou Regime Especial</div>
        </div>
      </div>

      {/* CFOPs Table */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-[#0B0F19] border-b border-slate-800 flex items-center justify-between">
          <h4 className="font-bold text-white text-sm flex items-center gap-2">
            <Tag className="w-4 h-4 text-amber-400" />
            CFOPs Informados no Mês ({currentCFOPs.length})
          </h4>
          <span className="text-xs text-slate-400">
            Faturamento Base Mês: <strong className="text-white">{formatCurrencyBRL(monthlyRev)}</strong>
          </span>
        </div>

        {currentCFOPs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Tag className="w-10 h-10 text-slate-500 mx-auto" />
            <div className="text-white font-semibold text-sm">Nenhum CFOP configurado para esta empresa</div>
            <p className="text-slate-400 text-xs max-w-md mx-auto">
              Adicione os CFOPs utilizados pela empresa ou carregue os códigos padrão do Anexo {company.anexo || 'I'} para apurar substituição tributária e isenções.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                type="button"
                onClick={handleLoadDefaults}
                className="px-4 py-2 bg-[#0B0F19] hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Carregar Padrão do Anexo {company.anexo || 'I'}
              </button>
              <button
                type="button"
                onClick={() => setShowCatalogModal(true)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer"
              >
                Adicionar CFOP
              </button>
            </div>
          </div>
        ) : (
          <div className="">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0B0F19] text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">CFOP & Descrição</th>
                  <th className="px-3 py-3 w-28 text-center">% Partilha</th>
                  <th className="px-3 py-3 w-32 text-right">Receita (R$)</th>
                  <th className="px-3 py-3">Tratamento ICMS</th>
                  <th className="px-3 py-3">Tratamento ISS</th>
                  <th className="px-3 py-3">PIS / COFINS</th>
                  <th className="px-3 py-3 w-16 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                  {currentCFOPs.map((cfop) => {
                  const cfopAmount = totalPercentage > 0
                    ? (monthlyRev * (cfop.percentage || 0)) / totalPercentage
                    : 0;

                  return (
                    <tr key={cfop.id} className="hover:bg-slate-800/30 transition">
                      
                      {/* CFOP Code & Description */}
                      <td className="px-4 py-4 space-y-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={cfop.code || ''}
                            onChange={(e) => handleUpdateCFOP(cfop.id, { code: e.target.value })}
                            className="w-20 bg-[#0B0F19] border border-transparent hover:border-slate-700 focus:border-amber-500 rounded-lg px-2 py-1 text-xs font-mono font-bold text-amber-400 focus:outline-none transition"
                            placeholder="5.102"
                          />
                          <input
                            type="text"
                            value={cfop.description || ''}
                            onChange={(e) => handleUpdateCFOP(cfop.id, { description: e.target.value })}
                            className="flex-1 bg-[#0B0F19] border border-transparent hover:border-slate-700 focus:border-blue-500 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none transition"
                            placeholder="Descrição da operação fiscal..."
                          />
                        </div>
                      </td>

                      {/* Percentage */}
                      <td className="px-3 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            value={cfop.percentage ?? 0}
                            onChange={(e) => handleUpdateCFOP(cfop.id, { percentage: Math.max(0, parseFloat(e.target.value) || 0) })}
                            className="w-16 text-right bg-[#0B0F19] border border-transparent hover:border-slate-700 focus:border-amber-500 rounded-lg py-1 text-xs font-mono font-bold text-white focus:outline-none transition"
                          />
                          <span className="text-slate-500 font-semibold">%</span>
                        </div>
                      </td>

                      {/* Calculated Revenue */}
                      <td className="px-3 py-4 text-right font-mono font-bold text-slate-100">
                        {formatCurrencyBRL(cfopAmount)}
                      </td>

                      {/* ICMS Treatment */}
                      <td className="px-3 py-4">
                        <select
                          value={cfop.icmsTreatment || 'tributado_integral'}
                          onChange={(e) => handleUpdateCFOP(cfop.id, { icmsTreatment: e.target.value as ICMSTreatment })}
                          className={`w-full bg-[#0B0F19] border border-transparent hover:border-slate-700 rounded-lg px-2 py-1 text-xs font-medium focus:outline-none transition ${
                            cfop.icmsTreatment === 'st_substituicao'
                              ? 'text-emerald-400'
                              : cfop.icmsTreatment === 'isencao_total' || cfop.icmsTreatment === 'reducao_base'
                              ? 'text-blue-400'
                              : cfop.icmsTreatment === 'por_fora_sublimite'
                              ? 'text-rose-400'
                              : 'text-slate-300'
                          }`}
                        >
                          <option value="tributado_integral">Tributado no DAS (Normal)</option>
                          <option value="st_substituicao">Substituição Tributária (ST)</option>
                          <option value="isencao_total">Isenção Total ICMS</option>
                          <option value="reducao_base">Redução de Base (%)</option>
                          <option value="por_fora_sublimite">Por Fora (Sublimite)</option>
                        </select>

                        {cfop.icmsTreatment === 'reducao_base' && (
                          <div className="mt-1 flex items-center gap-1">
                            <span className="text-[10px] text-slate-400">Redução:</span>
                            <input
                              type="number"
                              min="1"
                              max="99"
                              value={cfop.icmsReductionPercent || 33.33}
                              onChange={(e) => handleUpdateCFOP(cfop.id, { icmsReductionPercent: parseFloat(e.target.value) || 0 })}
                              className="w-14 bg-[#0B0F19] border border-slate-700 rounded px-1 text-[10px] text-slate-200"
                            />
                            <span className="text-[10px] text-slate-400">%</span>
                          </div>
                        )}
                      </td>

                      {/* ISS Treatment */}
                      <td className="px-3 py-3">
                        <select
                          value={cfop.issTreatment || 'nao_aplicavel'}
                          onChange={(e) => handleUpdateCFOP(cfop.id, { issTreatment: e.target.value as ISSTreatment })}
                          className={`w-full bg-[#0B0F19] border rounded-lg px-2 py-1 text-xs font-medium focus:outline-none ${
                            cfop.issTreatment === 'retido_tomador'
                              ? 'border-emerald-500/40 text-emerald-300'
                              : cfop.issTreatment === 'isencao_total' || cfop.issTreatment === 'reducao_base'
                              ? 'border-blue-500/40 text-blue-300'
                              : cfop.issTreatment === 'por_fora_sublimite'
                              ? 'border-rose-500/40 text-rose-300'
                              : 'border-slate-700 text-slate-300'
                          }`}
                        >
                          <option value="nao_aplicavel">Não Aplicável (Comércio/Indústria)</option>
                          <option value="tributado_integral">Tributado no DAS (Normal)</option>
                          <option value="retido_tomador">Retido na Fonte (Tomador)</option>
                          <option value="isencao_total">Isenção Municipal de ISS</option>
                          <option value="reducao_base">Redução de Base de ISS (%)</option>
                          <option value="por_fora_sublimite">Por Fora (Sublimite Municipal)</option>
                        </select>
                      </td>

                      {/* PIS / COFINS */}
                      <td className="px-3 py-3">
                        <select
                          value={cfop.pisCofinsTreatment || 'tributado_integral'}
                          onChange={(e) => handleUpdateCFOP(cfop.id, { pisCofinsTreatment: e.target.value as PisCofinsTreatment })}
                          className={`w-full bg-[#0B0F19] border rounded-lg px-2 py-1 text-xs font-medium focus:outline-none ${
                            cfop.pisCofinsTreatment === 'monofasico_segregado'
                              ? 'border-emerald-500/40 text-emerald-300'
                              : 'border-slate-700 text-slate-300'
                          }`}
                        >
                          <option value="tributado_integral">Tributação Normal</option>
                          <option value="monofasico_segregado">Monofásico (Abate PIS/COFINS)</option>
                          <option value="aliquota_zero">Alíquota Zero</option>
                        </select>
                      </td>

                      {/* Delete button */}
                      <td className="px-3 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteCFOP(cfop.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                          title="Excluir este CFOP"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Catalog Modal */}
      {showCatalogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#0F172A] border border-slate-800 rounded-3xl w-full max-w-xl p-6 text-white shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-base text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-amber-400" />
                Catálogo de CFOPs Frequentes do Simples Nacional
              </h4>
              <button
                type="button"
                onClick={() => setShowCatalogModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Selecione uma das naturezas de operação padronizadas abaixo para inclusão automática com as regras tributárias configuradas:
            </p>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {COMMON_CFOPS_CATALOG.map((cat) => (
                <div
                  key={cat.code + cat.description}
                  onClick={() => handleAddCFOP(cat)}
                  className="p-3 rounded-xl bg-[#0B0F19] border border-slate-800 hover:border-amber-500/40 hover:bg-slate-850 cursor-pointer transition flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-400 text-sm">{cat.code}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        Anexo {cat.anexo}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{cat.description}</p>
                  </div>
                  <button 
                    type="button"
                    className="px-3 py-1.5 bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-white font-bold text-xs rounded-lg transition border border-amber-500/30"
                  >
                    Adicionar
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => handleAddCFOP()}
                className="px-4 py-2 bg-[#0B0F19] hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 rounded-xl transition cursor-pointer"
              >
                Criar CFOP Personalizado em Branco
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legal Reference Note */}
      <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 text-xs text-slate-400 space-y-1 leading-relaxed shadow-xl">
        <div className="font-bold text-white flex items-center gap-1.5">
          <Info className="w-4 h-4 text-amber-400" />
          Fundamentação Legal da Segregação de Receitas:
        </div>
        <p>
          Conforme o <strong>Art. 18, § 4º-A da LC 123/2006</strong> e a <strong>Resolução CGSN nº 140/2018</strong>, o contribuinte optante pelo Simples Nacional que auferir receitas decorrentes de mercadorias sujeitas à substituição tributária (ST), tributação monofásica ou isenção estadual/municipal deve desconsiderar, no cálculo do valor devido, os percentuais dos tributos correspondentes para evitar bitributação.
        </p>
      </div>

      {/* Modal de Relatório de Segregação por CFOPs */}
      <ReportViewerModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reportType="cfop"
        company={company}
        calculation={result}
      />
    </div>
  );
};
