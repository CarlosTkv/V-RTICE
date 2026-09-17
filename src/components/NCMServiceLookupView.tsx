import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  Book, 
  FileText, 
  Info, 
  ShieldCheck, 
  Building2, 
  Truck, 
  Globe, 
  Tag, 
  Hash,
  AlertTriangle,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { CompanyData, CalculationResult, NCMTaxData, ServiceCodeTaxData } from '../types';

interface NCMServiceLookupViewProps {
  currentCompany: CompanyData;
  calculation: CalculationResult;
}

// Mock Data for demonstration - In a real app this would come from an API or large JSON
const MOCK_NCM_DATA: NCMTaxData[] = [
  {
    ncm: '2202.10.00',
    description: 'Águas, incluídas as águas minerais e as águas gaseificadas, adicionadas de açúcar ou de outros edulcorantes ou aromatizadas',
    segment: 'Bebidas Frias',
    capitulo: 'Capítulo 22',
    icmsST: true,
    pisCofinsNature: 'monofasico',
    icmsInternalRate: 18,
    ipiRate: 5,
    cstPisCofinsEntrada: '70',
    cstPisCofinsSaida: '04',
    pisRatePresumed: 0,
    cofinsRatePresumed: 0,
    pisRateReal: 0,
    cofinsRateReal: 0,
    pisCofinsLegalBase: 'Lei 10.147/6000',
    simplesSegregation: {
      segregateIcmsST: true,
      segregatePisCofinsMonofasico: true,
      anexo: 'I',
      savingsExplanation: 'Como este produto é Monofásico e tem ST, você deduz PIS, COFINS e ICMS do seu DAS.'
    },
    cfopMatrix: {
      vendaInternaRevenda: '5.405',
      vendaInterestadualRevenda: '6.404',
      vendaInternaIndustria: '5.401',
      vendaInterestadualIndustria: '6.401',
      compraRevendaInterna: '1.403',
      compraRevendaInterestadual: '2.403',
      devolucaoVendaInterna: '1.411',
      devolucaoVendaInterestadual: '2.411',
      transferenciaInterna: '5.409',
      transferenciaInterestadual: '6.409'
    },
    reformaTributaria: {
      cbsIbsRegime: 'imposto_seletivo',
      estimatedRateCBS: 8.8,
      estimatedRateIBS: 17.7,
      hasImpostoSeletivo: true,
      impostoSeletivoRate: 1.5,
      notes: 'Sujeito ao Imposto Seletivo (Imposto do Pecado) por conter açúcar.'
    },
    practicalAdvice: 'Sempre utilize o CFOP 5.405 para vendas internas para evitar bi-tributação de ICMS.'
  },
  {
    ncm: '8517.13.00',
    description: 'Telefones inteligentes (smartphones)',
    segment: 'Eletrônicos',
    capitulo: 'Capítulo 85',
    icmsST: false,
    pisCofinsNature: 'tributado_integral',
    icmsInternalRate: 18,
    ipiRate: 15,
    cstPisCofinsEntrada: '50',
    cstPisCofinsSaida: '01',
    pisRatePresumed: 0.65,
    cofinsRatePresumed: 3.0,
    pisRateReal: 1.65,
    cofinsRateReal: 7.6,
    pisCofinsLegalBase: 'Lei 10.637/6002',
    simplesSegregation: {
      segregateIcmsST: false,
      segregatePisCofinsMonofasico: false,
      anexo: 'I',
      savingsExplanation: 'Tributação normal pelo Anexo I do Simples Nacional.'
    },
    cfopMatrix: {
      vendaInternaRevenda: '5.102',
      vendaInterestadualRevenda: '6.102',
      vendaInternaIndustria: '5.101',
      vendaInterestadualIndustria: '6.101',
      compraRevendaInterna: '1.102',
      compraRevendaInterestadual: '2.102',
      devolucaoVendaInterna: '1.202',
      devolucaoVendaInterestadual: '2.202',
      transferenciaInterna: '5.152',
      transferenciaInterestadual: '6.152'
    },
    reformaTributaria: {
      cbsIbsRegime: 'padrao',
      estimatedRateCBS: 8.8,
      estimatedRateIBS: 17.7,
      hasImpostoSeletivo: false,
      notes: 'Alíquota padrão CBS/IBS estimada em 26.5%.'
    },
    practicalAdvice: 'Verifique benefícios de ICMS para informática em sua UF (ex: alíquotas reduzidas).'
  }
];

const MOCK_SERVICE_DATA: ServiceCodeTaxData[] = [
  {
    itemLC116: '1.01',
    description: 'Análise e desenvolvimento de sistemas',
    groupName: 'Informática',
    cnaeCorrelates: ['6201-5/00', '6202-3/00'],
    issIncidenceRule: 'prestador',
    issRuleExplanation: 'O ISS é devido no local do estabelecimento prestador (regra geral).',
    issMinRate: 2,
    issMaxRate: 5,
    issStandardRate: 2,
    issWithholdingRule: 'Geralmente não retido, a menos que o tomador seja órgão público ou regime especial.',
    simplesNacional: {
      defaultAnexo: 'III',
      subjectToFatorR: true,
      anexoWithFatorR: 'III',
      anexoWithoutFatorR: 'V',
      issDeductionInDAS: true,
      cppInsideDAS: true,
      guidance: 'Se o Fator R for >= 28%, tributa pelo Anexo III (6%). Caso contrário, Anexo V (15.5%).'
    },
    federalWithholdings: {
      irrfRate: 1.5,
      irrfLegalBase: 'Art. 714 RIR/6018',
      irrfDispensaSimples: true,
      csrfRate: 4.65,
      csrfLegalBase: 'Art. 30 Lei 10.833/03',
      csrfDispensaSimples: true,
      inssWithholdingRate: 0,
      inssLegalBase: '-',
      inssAppliesToSimples: false
    },
    lucroPresumido: {
      irpjPresumptionRate: 32,
      csllPresumptionRate: 32,
      pisRate: 0.65,
      cofinsRate: 3,
      totalEffectiveTaxApprox: 13.33,
      notes: 'Tributação sobre 32% da receita bruta para IRPJ e CSLL.'
    },
    reformaTributaria: {
      treatment: 'padrao_26.5',
      cbsIbsRate: 26.5,
      notes: 'Pode ser elegível a crédito total para o tomador PJ.'
    },
    practicalAdvice: 'Mantenha o Fator R sob controle para economizar mais de 50% de impostos no Simples.'
  }
];

export const NCMServiceLookupView: React.FC<NCMServiceLookupViewProps> = ({ currentCompany, calculation }) => {
  const [activeSearchTab, setActiveSearchTab] = useState<'ncm' | 'servico'>('ncm');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResult, setSelectedResult] = useState<NCMTaxData | ServiceCodeTaxData | null>(null);

  const filteredNCMs = useMemo(() => {
    if (!searchQuery) return [];
    return MOCK_NCM_DATA.filter(item => 
      item.ncm.includes(searchQuery) || 
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const filteredServices = useMemo(() => {
    if (!searchQuery) return [];
    return MOCK_SERVICE_DATA.filter(item => 
      item.itemLC116.includes(searchQuery) || 
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-blue-500/10 border border-blue-500/60 text-blue-400 rounded-xl">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-100 uppercase tracking-tight">Consultas Fiscais Inteligentes</h1>
            <p className="text-xs text-slate-400">NCM, Itens da LC 116 e Classificação para Emissão de Notas</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden">
            <div className="flex border-b border-slate-800">
              <button
                onClick={() => { setActiveSearchTab('ncm'); setSelectedResult(null); }}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition ${
                  activeSearchTab === 'ncm' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                Comércio / NCM
              </button>
              <button
                onClick={() => { setActiveSearchTab('servico'); setSelectedResult(null); }}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition ${
                  activeSearchTab === 'servico' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                Serviços / LC 116
              </button>
            </div>
            
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder={activeSearchTab === 'ncm' ? "Busque por NCM ou descrição..." : "Busque por item ou descrição..."}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="mt-4 space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {activeSearchTab === 'ncm' ? (
                  filteredNCMs.length > 0 ? (
                    filteredNCMs.map(item => (
                      <button
                        key={item.ncm}
                        onClick={() => setSelectedResult(item)}
                        className={`w-full text-left p-3 rounded-xl border transition ${
                          selectedResult === item ? 'bg-blue-500/10 border-blue-500/50' : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-xs font-mono font-bold text-blue-400">{item.ncm}</div>
                        <div className="text-xs text-slate-200 font-medium mt-1 line-clamp-2">{item.description}</div>
                      </button>
                    ))
                  ) : searchQuery ? (
                    <div className="text-center py-8 text-slate-500 text-xs">Nenhum NCM encontrado.</div>
                  ) : (
                    <div className="text-center py-8 text-slate-500 text-xs">Digite para iniciar a busca.</div>
                  )
                ) : (
                  filteredServices.length > 0 ? (
                    filteredServices.map(item => (
                      <button
                        key={item.itemLC116}
                        onClick={() => setSelectedResult(item)}
                        className={`w-full text-left p-3 rounded-xl border transition ${
                          selectedResult === item ? 'bg-blue-500/10 border-blue-500/50' : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-xs font-mono font-bold text-blue-400">Item {item.itemLC116}</div>
                        <div className="text-xs text-slate-200 font-medium mt-1 line-clamp-2">{item.description}</div>
                      </button>
                    ))
                  ) : searchQuery ? (
                    <div className="text-center py-8 text-slate-500 text-xs">Nenhum código de serviço encontrado.</div>
                  ) : (
                    <div className="text-center py-8 text-slate-500 text-xs">Digite para iniciar a busca.</div>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="bg-amber-500/5 border border-amber-500/60 p-4 rounded-2xl">
            <div className="flex items-center space-x-2 text-amber-400 mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Atenção Fiscal</span>
            </div>
            <p className="text-[10px] text-amber-200/70 leading-relaxed">
              As informações exibidas são baseadas na legislação federal vigente. Verifique sempre o Regulamento do ICMS de sua UF e o Código Tributário Municipal de sua cidade para particularidades locais.
            </p>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          {selectedResult ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Main Info Card */}
              <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-6 shadow-xl">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <Tag className="w-4 h-4 text-blue-400" />
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Classificação Fiscal Oficial</span>
                    </div>
                    <h2 className="text-2xl font-black text-white">
                      {'ncm' in selectedResult ? selectedResult.ncm : `Item ${selectedResult.itemLC116}`}
                    </h2>
                    <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                      {selectedResult.description}
                    </p>
                  </div>
                  <div className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                    {'ncm' in selectedResult ? 'NCM' : 'SERVIÇO'}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {'ncm' in selectedResult ? (
                    <>
                      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
                        <div className="text-[10px] text-slate-500 font-bold uppercase mb-2">Segmento / Capítulo</div>
                        <div className="text-xs text-slate-200 font-semibold">{selectedResult.segment}</div>
                        <div className="text-[10px] text-slate-400 mt-1">{selectedResult.capitulo}</div>
                      </div>
                      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
                        <div className="text-[10px] text-slate-500 font-bold uppercase mb-2">Incidência de IPI</div>
                        <div className="text-xl font-black text-slate-100">{selectedResult.ipiRate}%</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
                        <div className="text-[10px] text-slate-500 font-bold uppercase mb-2">Grupo de Serviço</div>
                        <div className="text-xs text-slate-200 font-semibold">{selectedResult.groupName}</div>
                      </div>
                      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
                        <div className="text-[10px] text-slate-500 font-bold uppercase mb-2">Local de Incidência (ISS)</div>
                        <div className="text-xs text-slate-200 font-semibold uppercase">{selectedResult.issIncidenceRule === 'prestador' ? 'Estabelecimento Prestador' : 'Local da Prestação'}</div>
                        <div className="text-[10px] text-slate-400 mt-1">{selectedResult.issRuleExplanation}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Taxation Tabs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Simples Nacional */}
                <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Building2 className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">No Simples Nacional</h3>
                  </div>
                  
                  {'ncm' in selectedResult ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                        <span className="text-xs text-slate-400">Segregar ICMS ST?</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${selectedResult.simplesSegregation.segregateIcmsST ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                          {selectedResult.simplesSegregation.segregateIcmsST ? 'SIM' : 'NÃO'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                        <span className="text-xs text-slate-400">Segregar PIS/COF Monofásico?</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${selectedResult.simplesSegregation.segregatePisCofinsMonofasico ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                          {selectedResult.simplesSegregation.segregatePisCofinsMonofasico ? 'SIM' : 'NÃO'}
                        </span>
                      </div>
                      <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl">
                        <div className="text-[10px] text-emerald-400 font-bold uppercase mb-1">Dica de Economia</div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">{selectedResult.simplesSegregation.savingsExplanation}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                        <span className="text-xs text-slate-400">Anexo Principal</span>
                        <span className="text-xs font-bold text-white">Anexo {selectedResult.simplesNacional.defaultAnexo}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                        <span className="text-xs text-slate-400">Sujeito ao Fator R?</span>
                        <span className="text-xs font-bold text-amber-400">{selectedResult.simplesNacional.subjectToFatorR ? 'SIM' : 'NÃO'}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{selectedResult.simplesNacional.guidance}</p>
                    </div>
                  )}
                </div>

                {/* Right: Lucro Presumido/Real */}
                <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Globe className="w-5 h-5 text-purple-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Regime Normal (Presumido/Real)</h3>
                  </div>
                  
                  {'ncm' in selectedResult ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                        <span className="text-xs text-slate-400">Natureza PIS/COFINS</span>
                        <span className="text-xs font-bold text-white capitalize">{selectedResult.pisCofinsNature.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                        <span className="text-xs text-slate-400">Alíquota Interna ICMS</span>
                        <span className="text-xs font-bold text-white">{selectedResult.icmsInternalRate}%</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                        <span className="text-xs text-slate-400">Sujeito a ST?</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${selectedResult.icmsST ? 'bg-purple-500/10 text-purple-400' : 'bg-slate-800 text-slate-500'}`}>
                          {selectedResult.icmsST ? 'SIM' : 'NÃO'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                        <span className="text-xs text-slate-400">Alíquota ISS Sugerida</span>
                        <span className="text-xs font-bold text-white">{selectedResult.issStandardRate}%</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                        <span className="text-xs text-slate-400">IRRF (Retenção)</span>
                        <span className="text-xs font-bold text-white">{selectedResult.federalWithholdings.irrfRate}%</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                        <span className="text-xs text-slate-400">CSRF (Retenção 4.65%)</span>
                        <span className="text-xs font-bold text-white">{selectedResult.federalWithholdings.csrfRate}%</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* CFOP Matrix & Guidelines */}
              <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <ClipboardList className="w-5 h-5 text-blue-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Matriz de CFOP & Emissão de Documentos</h3>
                </div>

                {'ncm' in selectedResult ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
                      <div className="text-[9px] text-slate-500 font-bold uppercase mb-1">Venda Interna (Revenda)</div>
                      <div className="text-lg font-mono font-black text-blue-400">{selectedResult.cfopMatrix.vendaInternaRevenda}</div>
                    </div>
                    <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
                      <div className="text-[9px] text-slate-500 font-bold uppercase mb-1">Venda Interestadual</div>
                      <div className="text-lg font-mono font-black text-blue-400">{selectedResult.cfopMatrix.vendaInterestadualRevenda}</div>
                    </div>
                    <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
                      <div className="text-[9px] text-slate-500 font-bold uppercase mb-1">Compra Interna</div>
                      <div className="text-lg font-mono font-black text-blue-400">{selectedResult.cfopMatrix.compraRevendaInterna}</div>
                    </div>
                    <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
                      <div className="text-[9px] text-slate-500 font-bold uppercase mb-1">Compra Interestadual</div>
                      <div className="text-lg font-mono font-black text-blue-400">{selectedResult.cfopMatrix.compraRevendaInterestadual}</div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
                    <div className="text-[10px] text-slate-500 font-bold uppercase mb-2">CNAEs Relacionados</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedResult.cnaeCorrelates.map(cnae => (
                        <span key={cnae} className="bg-blue-500/10 border border-blue-500/60 text-blue-400 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                          {cnae}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 p-4 bg-slate-950/50 border border-slate-800/80 rounded-2xl">
                  <div className="flex items-start space-x-3">
                    <Info className="w-4 h-4 text-blue-400 mt-0.5" />
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Dica de Emissão</div>
                      <p className="text-xs text-slate-300 leading-relaxed italic">
                        "{selectedResult.practicalAdvice}"
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reforma Tributária Preview */}
              <div className="bg-gradient-to-r from-blue-950/60 to-slate-900/90 border border-blue-500/60 p-6 rounded-3xl">
                <div className="flex items-center space-x-2 mb-4">
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Reforma Tributária (IBS/CBS)</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Regime Estimado</div>
                    <div className="text-xs text-blue-300 font-bold uppercase tracking-tight">
                      {'cbsIbsRegime' in selectedResult.reformaTributaria 
                        ? (selectedResult.reformaTributaria as any).cbsIbsRegime.replace('_', ' ') 
                        : (selectedResult.reformaTributaria as any).treatment.replace('_', ' ')}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Alíquota IBS/CBS Sugerida</div>
                    <div className="text-xl font-black text-white">
                      {'cbsIbsRate' in selectedResult.reformaTributaria 
                        ? selectedResult.reformaTributaria.cbsIbsRate 
                        : (selectedResult.reformaTributaria.estimatedRateCBS + selectedResult.reformaTributaria.estimatedRateIBS).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Observações</div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">{selectedResult.reformaTributaria.notes}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-[#0F172A]/90 border border-slate-800 border-dashed rounded-3xl h-[600px] flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center text-slate-600 mb-4">
                <ClipboardList className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-400">Nenhum item selecionado</h3>
              <p className="text-sm text-slate-600 max-w-xs mt-2">
                Utilize o painel lateral para buscar por um NCM ou Código de Serviço e visualizar as regras tributárias completas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
