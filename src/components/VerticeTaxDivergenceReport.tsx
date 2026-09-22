import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  TrendingDown, 
  TrendingUp, 
  FileSpreadsheet, 
  Download, 
  Filter, 
  Search, 
  ArrowRight, 
  Layers, 
  Scale, 
  FileCode, 
  ShieldAlert, 
  ShieldCheck, 
  HelpCircle, 
  ExternalLink, 
  Sparkles, 
  Zap, 
  ChevronRight, 
  FileText,
  Copy,
  Info,
  Building2,
  RefreshCw
} from 'lucide-react';
import { CompanyData } from '../types';
import { calculateDocTaxDetails, NCM_TAX_CATALOG, getInterstateRate } from '../utils/verticeTaxEngine';
import { BRAZILIAN_STATES_ICMS } from '../utils/taxRules';

export interface DivergenceItem {
  docId: string;
  docNumero: string;
  docSerie: string;
  docTipo: string;
  chave: string;
  dataEmissao: string;
  emitente: string;
  emitenteCnpj: string;
  destinatario: string;
  ufOrigem: string;
  ufDestino: string;
  ncm: string;
  cfop: string;
  valorTotal: number;
  
  // Tax Type
  taxCategory: 'DIFAL Entrada' | 'DIFAL Saída' | 'ICMS-ST' | 'PIS/COFINS Monofásico' | 'Alíquota Interna / FCP';
  
  // Values comparison
  valorDeclaradoXml: number;
  valorApuradoVertice: number;
  deltaValor: number; // calculated - declared
  deltaPercentual: number;
  
  // Nature of Divergence
  natureza: 'Risco de Autuação (Imposto a Menor)' | 'Pagamento Indevido (Crédito a Recuperar)' | 'Classificação Fiscal Divergente' | 'Conforme';
  severidade: 'critico' | 'alto' | 'medio' | 'baixo' | 'conforme';
  
  // Detailed Explanation
  motivoDivergencia: string;
  fundamentacaoLegal: string;
  acaoRecomendada: string;
}

interface VerticeTaxDivergenceReportProps {
  documents: any[];
  currentCompany: CompanyData;
  onSelectDoc?: (docId: string) => void;
  onNavigateToCalculator?: (docId: string) => void;
  onApplyTaxToXml?: (
    opType: 'difal_entrada' | 'difal_saida' | 'st',
    calculatedTaxValue: number,
    baseCalculo: number,
    taxRate: number,
    extraParams?: any
  ) => void;
  showToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

export const VerticeTaxDivergenceReport: React.FC<VerticeTaxDivergenceReportProps> = ({
  documents,
  currentCompany,
  onSelectDoc,
  onNavigateToCalculator,
  onApplyTaxToXml,
  showToast
}) => {
  const [filterTaxType, setFilterTaxType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterNatureza, setFilterNatureza] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDivergence, setSelectedDivergence] = useState<DivergenceItem | null>(null);

  // Compute all tax divergences across imported documents
  const divergenceList: DivergenceItem[] = useMemo(() => {
    const list: DivergenceItem[] = [];

    documents.forEach((doc) => {
      const taxDetails = calculateDocTaxDetails(doc, currentCompany.state || 'RJ');
      const isEntrada = doc.cfop?.startsWith('1') || doc.cfop?.startsWith('2') || doc.direcao === 'entrada';
      const isSaida = doc.cfop?.startsWith('5') || doc.cfop?.startsWith('6') || doc.direcao === 'saida';
      const isInterestadual = doc.cfop?.startsWith('2') || doc.cfop?.startsWith('6');
      
      const compState = currentCompany.state || 'RJ';
      const origemUf = isEntrada ? (compState === 'SP' ? 'RJ' : 'SP') : compState;
      const destinoUf = isEntrada ? compState : (compState === 'RJ' ? 'SP' : 'RJ');

      // 1. ANÁLISE DE DIFAL ENTRADA
      if (isEntrada && isInterestadual) {
        // XML original declared vs calculated
        const declaredDifal = doc.xmlContent?.match(/<vICMSUFDest>([\d.]+)<\/vICMSUFDest>/i)?.[1]
          ? parseFloat(doc.xmlContent.match(/<vICMSUFDest>([\d.]+)<\/vICMSUFDest>/i)[1])
          : 0;
        
        const apuradoDifal = taxDetails.difalEntradaTotal;
        const delta = apuradoDifal - declaredDifal;

        if (Math.abs(delta) > 0.05) {
          list.push({
            docId: doc.id,
            docNumero: doc.numero,
            docSerie: doc.serie || '1',
            docTipo: doc.tipo,
            chave: doc.chave,
            dataEmissao: doc.dataEmissao,
            emitente: doc.emitente,
            emitenteCnpj: doc.emitenteCnpj,
            destinatario: doc.destinatario,
            ufOrigem: origemUf,
            ufDestino: destinoUf,
            ncm: doc.ncm || '2202.10.00',
            cfop: doc.cfop || '2102',
            valorTotal: doc.valorTotal,
            taxCategory: 'DIFAL Entrada',
            valorDeclaradoXml: declaredDifal,
            valorApuradoVertice: apuradoDifal,
            deltaValor: delta,
            deltaPercentual: declaredDifal > 0 ? +((delta / declaredDifal) * 100).toFixed(1) : 100,
            natureza: delta > 0 ? 'Risco de Autuação (Imposto a Menor)' : 'Pagamento Indevido (Crédito a Recuperar)',
            severidade: delta > 100 ? 'critico' : delta > 0 ? 'alto' : 'medio',
            motivoDivergencia: declaredDifal === 0 
              ? `Nota interestadual com CFOP ${doc.cfop} sem destaque de DIFAL para consumo/ativo no estado de destino (${destinoUf}).`
              : `Diferença de base de cálculo: o XML utilizou Base Simples em vez da metodologia Base Dupla com exclusão do imposto de origem exigida pelo estado ${destinoUf}.`,
            fundamentacaoLegal: `Convênio ICMS 142/2018 e Legislação Interna SEFAZ/${destinoUf} (Cálculo por Dentro).`,
            acaoRecomendada: `Emitir Guia DARE/GNRE complementar no valor de R$ ${delta.toFixed(2)} para evitar apreensão de carga ou glosa de escrituração no SPED.`
          });
        }
      }

      // 2. ANÁLISE DE ICMS-ST
      const isStCandidate = doc.cfop?.startsWith('5.4') || doc.cfop?.startsWith('6.4') || doc.cfop === '5405' || 
                            doc.ncm === '2202.10.00' || doc.ncm === '2203.00.00' || doc.ncm === '8708.29.99' || doc.ncm === '3004.90.99';

      if (isStCandidate) {
        const declaredST = doc.xmlContent?.match(/<vICMSST>([\d.]+)<\/vICMSST>/i)?.[1]
          ? parseFloat(doc.xmlContent.match(/<vICMSST>([\d.]+)<\/vICMSST>/i)[1])
          : (doc.cfop === '5405' ? doc.valorTotal * 0.18 : 0);
        
        const apuradoST = taxDetails.icmsStDevido;
        const deltaST = apuradoST - declaredST;

        if (Math.abs(deltaST) > 0.05 && doc.cfop === '5102') {
          list.push({
            docId: doc.id,
            docNumero: doc.numero,
            docSerie: doc.serie || '1',
            docTipo: doc.tipo,
            chave: doc.chave,
            dataEmissao: doc.dataEmissao,
            emitente: doc.emitente,
            emitenteCnpj: doc.emitenteCnpj,
            destinatario: doc.destinatario,
            ufOrigem: origemUf,
            ufDestino: destinoUf,
            ncm: doc.ncm || '2202.10.00',
            cfop: doc.cfop,
            valorTotal: doc.valorTotal,
            taxCategory: 'ICMS-ST',
            valorDeclaradoXml: declaredST,
            valorApuradoVertice: apuradoST,
            deltaValor: deltaST,
            deltaPercentual: declaredST > 0 ? +((deltaST / declaredST) * 100).toFixed(1) : 100,
            natureza: 'Classificação Fiscal Divergente',
            severidade: 'critico',
            motivoDivergencia: `Item sob regime de Substituição Tributária (NCM ${doc.ncm}) faturado incorretamente com CFOP de tributação normal (${doc.cfop}) sem retenção do imposto no destino.`,
            fundamentacaoLegal: `Convênio ICMS 142/2018 (MVA Ajustada calculada: ${taxDetails.mvaAjustada}%).`,
            acaoRecomendada: `Solicitar Carta de Correção Eletrônica (CC-e) para retificação do CFOP para 5405 / 6403 e recolhimento antecipado do ICMS-ST.`
          });
        }
      }

      // 3. ANÁLISE DE PIS/COFINS MONOFÁSICO (Oportunidade de Recuperação)
      if (taxDetails.monofasicoEconomia > 0 && doc.cfop === '5102') {
        const pisCofinsRecuperavel = taxDetails.monofasicoEconomia;
        list.push({
          docId: doc.id,
          docNumero: doc.numero,
          docSerie: doc.serie || '1',
          docTipo: doc.tipo,
          chave: doc.chave,
          dataEmissao: doc.dataEmissao,
          emitente: doc.emitente,
          emitenteCnpj: doc.emitenteCnpj,
          destinatario: doc.destinatario,
          ufOrigem: origemUf,
          ufDestino: destinoUf,
          ncm: doc.ncm || '2202.10.00',
          cfop: doc.cfop,
          valorTotal: doc.valorTotal,
          taxCategory: 'PIS/COFINS Monofásico',
          valorDeclaradoXml: +(doc.valorTotal * 0.0385).toFixed(2), // Declarado tributado integralmente
          valorApuradoVertice: 0.00, // Deveria ser alíquota ZERO para o varejista/atacadista
          deltaValor: -pisCofinsRecuperavel,
          deltaPercentual: -100,
          natureza: 'Pagamento Indevido (Crédito a Recuperar)',
          severidade: 'medio',
          motivoDivergencia: `Mercadoria sujeita à tributação concentrada/monofásica na indústria (NCM ${doc.ncm}). Tributação indevida de PIS/COFINS nas etapas subsequentes.`,
          fundamentacaoLegal: `Lei Federal nº 10.147/2000 e Lei nº 10.833/2003 (Alíquota Zero no PGDAS-D).`,
          acaoRecomendada: `Segregar a receita do produto no PGDAS-D ou EFD-Contribuições com CST 04 para abater o imposto devido no mês.`
        });
      }

      // 4. ANÁLISE DE DIFAL SAÍDA (EC 87/2015)
      if (isSaida && isInterestadual) {
        const declaredDifalSaida = doc.xmlContent?.match(/<vICMSUFDest>([\d.]+)<\/vICMSUFDest>/i)?.[1]
          ? parseFloat(doc.xmlContent.match(/<vICMSUFDest>([\d.]+)<\/vICMSUFDest>/i)[1])
          : 0;
        
        const apuradoDifalSaida = taxDetails.difalSaida;
        const deltaSaida = apuradoDifalSaida - declaredDifalSaida;

        if (Math.abs(deltaSaida) > 0.05) {
          list.push({
            docId: doc.id,
            docNumero: doc.numero,
            docSerie: doc.serie || '1',
            docTipo: doc.tipo,
            chave: doc.chave,
            dataEmissao: doc.dataEmissao,
            emitente: doc.emitente,
            emitenteCnpj: doc.emitenteCnpj,
            destinatario: doc.destinatario,
            ufOrigem: origemUf,
            ufDestino: destinoUf,
            ncm: doc.ncm || '8471.30.12',
            cfop: doc.cfop || '6108',
            valorTotal: doc.valorTotal,
            taxCategory: 'DIFAL Saída',
            valorDeclaradoXml: declaredDifalSaida,
            valorApuradoVertice: apuradoDifalSaida,
            deltaValor: deltaSaida,
            deltaPercentual: declaredDifalSaida > 0 ? +((deltaSaida / declaredDifalSaida) * 100).toFixed(1) : 100,
            natureza: deltaSaida > 0 ? 'Risco de Autuação (Imposto a Menor)' : 'Pagamento Indevido (Crédito a Recuperar)',
            severidade: deltaSaida > 150 ? 'critico' : 'alto',
            motivoDivergencia: `Venda interestadual para consumidor final não contribuinte (CFOP ${doc.cfop}) sem apuração correta do DIFAL de partilha para o estado de destino (${destinoUf}).`,
            fundamentacaoLegal: `Emenda Constitucional 87/2015 e Convênio ICMS 236/2021.`,
            acaoRecomendada: `Gerar Guia GNRE Código 10010-2 (DIFAL Consumidor Final) com código da UF de destino para liberação da mercadoria.`
          });
        }
      }
    });

    return list;
  }, [documents, currentCompany]);

  // Filtered List
  const filteredList = useMemo(() => {
    return divergenceList.filter(item => {
      // Tax Type filter
      if (filterTaxType !== 'all' && item.taxCategory !== filterTaxType) return false;
      
      // Severity filter
      if (filterSeverity !== 'all' && item.severidade !== filterSeverity) return false;

      // Natureza filter
      if (filterNatureza !== 'all' && item.natureza !== filterNatureza) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNum = item.docNumero.toLowerCase().includes(q);
        const matchEmit = item.emitente.toLowerCase().includes(q);
        const matchCnpj = item.emitenteCnpj.includes(q);
        const matchChave = item.chave.includes(q);
        const matchNcm = item.ncm.includes(q);
        const matchCfop = item.cfop.includes(q);
        if (!matchNum && !matchEmit && !matchCnpj && !matchChave && !matchNcm && !matchCfop) {
          return false;
        }
      }

      return true;
    });
  }, [divergenceList, filterTaxType, filterSeverity, filterNatureza, searchQuery]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalDocs = documents.length;
    const totalDivergentes = new Set(divergenceList.map(d => d.docId)).size;
    const taxaConformidade = totalDocs > 0 ? (((totalDocs - totalDivergentes) / totalDocs) * 100).toFixed(1) : '100';

    const riscoAutuacaoTotal = divergenceList
      .filter(d => d.deltaValor > 0)
      .reduce((acc, d) => acc + d.deltaValor, 0);

    const creditoRecuperavelTotal = divergenceList
      .filter(d => d.deltaValor < 0)
      .reduce((acc, d) => acc + Math.abs(d.deltaValor), 0);

    const criticosCount = divergenceList.filter(d => d.severidade === 'critico').length;
    const altosCount = divergenceList.filter(d => d.severidade === 'alto').length;

    return {
      totalDocs,
      totalDivergentes,
      taxaConformidade,
      riscoAutuacaoTotal,
      creditoRecuperavelTotal,
      criticosCount,
      altosCount
    };
  }, [documents, divergenceList]);

  // Export to CSV
  const handleExportCsv = () => {
    if (divergenceList.length === 0) {
      showToast('Nenhuma divergência para exportar.', 'info');
      return;
    }

    const headers = [
      'Documento',
      'Número',
      'Série',
      'Chave de Acesso',
      'Data Emissão',
      'Emitente',
      'CNPJ Emitente',
      'UF Origem',
      'UF Destino',
      'NCM',
      'CFOP',
      'Valor Total R$',
      'Tributo Analisado',
      'Valor Declarado XML R$',
      'Valor Apurado Vértice R$',
      'Divergência Delta R$',
      'Severidade',
      'Natureza',
      'Motivo da Inconsistência',
      'Fundamentação Legal',
      'Ação Recomendada'
    ];

    const rows = divergenceList.map(d => [
      `"${d.docTipo}"`,
      `"${d.docNumero}"`,
      `"${d.docSerie}"`,
      `"${d.chave}"`,
      `"${d.dataEmissao}"`,
      `"${d.emitente.replace(/"/g, '""')}"`,
      `"${d.emitenteCnpj}"`,
      `"${d.ufOrigem}"`,
      `"${d.ufDestino}"`,
      `"${d.ncm}"`,
      `"${d.cfop}"`,
      d.valorTotal.toFixed(2),
      `"${d.taxCategory}"`,
      d.valorDeclaradoXml.toFixed(2),
      d.valorApuradoVertice.toFixed(2),
      d.deltaValor.toFixed(2),
      `"${d.severidade}"`,
      `"${d.natureza}"`,
      `"${d.motivoDivergencia.replace(/"/g, '""')}"`,
      `"${d.fundamentacaoLegal.replace(/"/g, '""')}"`,
      `"${d.acaoRecomendada.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_divergencia_fiscal_${currentCompany.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Relatório de divergências fiscais exportado com sucesso!', 'success');
  };

  return (
    <div className="space-y-6 w-full">
      
      {/* Top Banner & Header */}
      <div className="p-6 bg-[#0F172A] border border-slate-800 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white uppercase tracking-wider">
                Relatório de Divergência Fiscal & Auditoria Tributária
              </h2>
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] font-black border border-rose-500/30">
                {divergenceList.length} DIVERGÊNCIAS DETECTADAS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparativo automatizado entre tributos destacados nos XMLs (DIFAL/ST/PIS) e o cálculo oficial apurado pelo motor SEFAZ.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleExportCsv}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Exportar Relatório (CSV/Excel)</span>
          </button>
        </div>
      </div>

      {/* Horizontal KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Total Auditado */}
        <div className="p-4 bg-[#0F172A] border border-slate-800 rounded-2xl flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Auditado</span>
            <FileText className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">{metrics.totalDocs}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">{metrics.totalDivergentes} notas com inconformidade</div>
          </div>
        </div>

        {/* Card 2: Taxa de Conformidade */}
        <div className="p-4 bg-[#0F172A] border border-slate-800 rounded-2xl flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Conformidade Fiscal</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-400 font-mono">{metrics.taxaConformidade}%</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Assertividade de destaque fiscal</div>
          </div>
        </div>

        {/* Card 3: Risco de Autuação (Imposto a Menor) */}
        <div className="p-4 bg-[#0F172A] border border-rose-500/20 bg-rose-950/10 rounded-2xl flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Risco Tributário (A Menor)</span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            <div className="text-2xl font-black text-rose-400 font-mono">
              R$ {metrics.riscoAutuacaoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-rose-300/70 mt-0.5">DIFAL/ST não recolhido no XML</div>
          </div>
        </div>

        {/* Card 4: Crédito a Recuperar (Pago a Maior) */}
        <div className="p-4 bg-[#0F172A] border border-emerald-500/20 bg-emerald-950/10 rounded-2xl flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Crédito a Recuperar</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              R$ {metrics.creditoRecuperavelTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-emerald-300/70 mt-0.5">Monofásicos e bitributações</div>
          </div>
        </div>

        {/* Card 5: Alertas Críticos */}
        <div className="p-4 bg-[#0F172A] border border-amber-500/20 bg-amber-950/10 rounded-2xl flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Alertas Críticos</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-amber-400 font-mono">{metrics.criticosCount} notas</div>
            <div className="text-[10px] text-amber-300/70 mt-0.5">Exigem ação imediata de regularização</div>
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-[#0F172A] border border-slate-800 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-md">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por Nota, Emitente, CNPJ, Chave, NCM..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 font-mono placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Filter Tributo */}
          <select
            value={filterTaxType}
            onChange={(e) => setFilterTaxType(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-rose-500"
          >
            <option value="all">Todos os Tributos</option>
            <option value="DIFAL Entrada">DIFAL Entrada</option>
            <option value="DIFAL Saída">DIFAL Saída</option>
            <option value="ICMS-ST">ICMS-ST</option>
            <option value="PIS/COFINS Monofásico">PIS/COFINS Monofásico</option>
          </select>

          {/* Filter Severidade */}
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-rose-500"
          >
            <option value="all">Todas as Severidades</option>
            <option value="critico">Crítico (Auto de Infração)</option>
            <option value="alto">Alto</option>
            <option value="medio">Médio (Oportunidade)</option>
          </select>

          {/* Filter Natureza */}
          <select
            value={filterNatureza}
            onChange={(e) => setFilterNatureza(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-rose-500"
          >
            <option value="all">Todas as Naturezas</option>
            <option value="Risco de Autuação (Imposto a Menor)">Risco (Imposto a Menor)</option>
            <option value="Pagamento Indevido (Crédito a Recuperar)">Crédito (Pago a Maior)</option>
            <option value="Classificação Fiscal Divergente">Classificação Divergente</option>
          </select>
        </div>

        <div className="text-[11px] text-slate-400 font-mono self-end md:self-center">
          Exibindo <strong className="text-white">{filteredList.length}</strong> de {divergenceList.length} divergências
        </div>
      </div>

      {/* Main Wide Horizontal Comparison Table */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Documento / Emissão</th>
                <th className="py-3 px-4">Emitente & Origem ➔ Destino</th>
                <th className="py-3 px-4">NCM / CFOP</th>
                <th className="py-3 px-4">Tributo em Análise</th>
                <th className="py-3 px-4 text-right">Valor XML</th>
                <th className="py-3 px-4 text-right">Valor Vértice</th>
                <th className="py-3 px-4 text-right">Delta (Divergência)</th>
                <th className="py-3 px-4">Status & Alerta</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                    <p className="text-sm font-bold text-slate-300">Nenhuma divergência encontrada para os filtros selecionados.</p>
                    <p className="text-xs text-slate-500 mt-0.5">Todos os documentos auditados estão com destaque tributário em conformidade.</p>
                  </td>
                </tr>
              ) : (
                filteredList.map((item, idx) => {
                  const isNegative = item.deltaValor < 0;
                  const isCritical = item.severidade === 'critico';

                  return (
                    <tr 
                      key={`${item.docId}-${item.taxCategory}-${idx}`}
                      className="hover:bg-slate-800/40 transition group cursor-pointer"
                      onClick={() => setSelectedDivergence(item)}
                    >
                      {/* Documento */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                            item.docTipo === 'NF-e' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {item.docTipo}
                          </span>
                          <span className="font-bold text-white">nº {item.docNumero}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-0.5 font-sans">{item.dataEmissao}</span>
                      </td>

                      {/* Emitente & UFs */}
                      <td className="py-3 px-4 font-sans">
                        <div className="font-bold text-slate-200 truncate max-w-[180px]">{item.emitente}</div>
                        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                          <span className="px-1 bg-slate-800 rounded font-bold">{item.ufOrigem}</span>
                          <ArrowRight className="w-3 h-3 text-slate-500" />
                          <span className="px-1 bg-slate-800 text-rose-400 rounded font-bold">{item.ufDestino}</span>
                          <span className="text-slate-500">| Total: R$ {item.valorTotal.toFixed(2)}</span>
                        </div>
                      </td>

                      {/* NCM / CFOP */}
                      <td className="py-3 px-4">
                        <div className="text-slate-200 font-bold">{item.ncm}</div>
                        <div className="text-[10px] text-slate-500">CFOP: <strong className="text-amber-400">{item.cfop}</strong></div>
                      </td>

                      {/* Tributo */}
                      <td className="py-3 px-4 font-sans">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-white text-[11px] font-bold block w-fit">
                          {item.taxCategory}
                        </span>
                      </td>

                      {/* Valor Declarado XML */}
                      <td className="py-3 px-4 text-right">
                        <span className="text-slate-400 font-bold">
                          R$ {item.valorDeclaradoXml.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </td>

                      {/* Valor Apurado Vértice */}
                      <td className="py-3 px-4 text-right">
                        <span className="text-white font-black">
                          R$ {item.valorApuradoVertice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </td>

                      {/* Delta */}
                      <td className="py-3 px-4 text-right">
                        <div className={`font-black flex items-center justify-end gap-1 ${
                          isNegative ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {isNegative ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          <span>{isNegative ? '-' : '+'}R$ {Math.abs(item.deltaValor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <span className="text-[9px] text-slate-500 block">
                          {item.deltaPercentual > 0 ? `+${item.deltaPercentual}%` : `${item.deltaPercentual}%`}
                        </span>
                      </td>

                      {/* Status / Alerta */}
                      <td className="py-3 px-4 font-sans">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wide border flex items-center gap-1 ${
                            item.severidade === 'critico'
                              ? 'bg-rose-950/40 border-rose-500/50 text-rose-400'
                              : item.severidade === 'alto'
                              ? 'bg-amber-950/40 border-amber-500/50 text-amber-400'
                              : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400'
                          }`}>
                            {isCritical && <AlertTriangle className="w-3 h-3" />}
                            {item.natureza.split(' ')[0]} {item.natureza.split(' ')[1]}
                          </span>
                        </div>
                      </td>

                      {/* Ações */}
                      <td className="py-3 px-4 text-center font-sans">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDivergence(item);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-bold transition flex items-center gap-1 mx-auto cursor-pointer"
                        >
                          <span>Auditar</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Modal / Audit Drawer */}
      {selectedDivergence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0F172A] border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    selectedDivergence.severidade === 'critico' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {selectedDivergence.severidade.toUpperCase()}
                  </span>
                  <h3 className="text-sm font-black text-white uppercase">
                    Parecer de Divergência Fiscal • {selectedDivergence.docTipo} nº {selectedDivergence.docNumero}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  Chave: {selectedDivergence.chave}
                </p>
              </div>

              <button
                onClick={() => setSelectedDivergence(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            {/* Side-by-side Comparative Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">1. Valor Declarado no XML Original</span>
                <div className="text-2xl font-black text-slate-300 font-mono">
                  R$ {selectedDivergence.valorDeclaradoXml.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <span className="text-[9px] text-slate-500 font-sans block">Destacado no arquivo eletrônico</span>
              </div>

              <div className="p-4 bg-slate-900/60 rounded-2xl border border-rose-500/30 space-y-1">
                <span className="text-[10px] font-bold text-rose-400 uppercase">2. Valor Apurado pelo Motor Fiscal</span>
                <div className="text-2xl font-black text-rose-400 font-mono">
                  R$ {selectedDivergence.valorApuradoVertice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <span className="text-[9px] text-slate-400 font-sans block">Conforme regras SEFAZ / Convênios</span>
              </div>
            </div>

            {/* Technical Diagnosis */}
            <div className="space-y-3 p-4 bg-slate-900/40 rounded-2xl border border-slate-800">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">Diagnóstico Técnico da Inconsistência</span>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">{selectedDivergence.motivoDivergencia}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Fundamentação Legal & Tributária</span>
                <p className="text-xs text-slate-300 font-mono">{selectedDivergence.fundamentacaoLegal}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 space-y-1">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block">Ação Corretiva Recomendada</span>
                <p className="text-xs text-emerald-300 font-sans">{selectedDivergence.acaoRecomendada}</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `PARECER FISCAL - NOTA FISCAL ${selectedDivergence.docTipo} ${selectedDivergence.docNumero}\n` +
                    `Emitente: ${selectedDivergence.emitente} (${selectedDivergence.emitenteCnpj})\n` +
                    `Chave de Acesso: ${selectedDivergence.chave}\n` +
                    `Tributo: ${selectedDivergence.taxCategory}\n` +
                    `Valor Declarado: R$ ${selectedDivergence.valorDeclaradoXml.toFixed(2)}\n` +
                    `Valor Apurado: R$ ${selectedDivergence.valorApuradoVertice.toFixed(2)}\n` +
                    `Divergência: R$ ${selectedDivergence.deltaValor.toFixed(2)}\n` +
                    `Diagnóstico: ${selectedDivergence.motivoDivergencia}\n` +
                    `Fundamentação: ${selectedDivergence.fundamentacaoLegal}\n` +
                    `Ação Recomendada: ${selectedDivergence.acaoRecomendada}`
                  );
                  showToast('Parecer técnico copiado para a área de transferência!', 'success');
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>Copiar Parecer Técnico</span>
              </button>

              {onNavigateToCalculator && (
                <button
                  onClick={() => {
                    onNavigateToCalculator(selectedDivergence.docId);
                    setSelectedDivergence(null);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-black transition flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <Scale className="w-4 h-4" />
                  <span>Abrir no Simulador de Cálculo</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
