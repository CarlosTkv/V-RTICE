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
  RefreshCw,
  Edit2,
  Check,
  Save,
  X,
  Calendar,
  ArrowDownLeft,
  ArrowUpRight,
  BookOpen,
  Printer
} from 'lucide-react';
import { CompanyData } from '../types';
import { calculateDocTaxDetails, NCM_TAX_CATALOG, getInterstateRate } from '../utils/verticeTaxEngine';
import { BRAZILIAN_STATES_ICMS } from '../utils/taxRules';

export interface DivergenceItem {
  docId: string;
  docNumero: string;
  docSerie: string;
  docTipo: 'NF-e' | 'NFS-e' | 'NFC-e' | 'CT-e';
  chave: string;
  dataEmissao: string;
  competencia: string; // e.g. "2024/03"
  direcao: 'entrada' | 'saida';
  emitente: string;
  emitenteCnpj: string;
  destinatario: string;
  destinatarioCnpj: string;
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
  parecerCompleto: string;

  // Editable fields for Quick Fix
  customRate?: number;
  customBase?: number;
  customMva?: number;
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
  onUpdateDocumentTax?: (docId: string, updatedFields: { valorTotal?: number; cfop?: number | string; ncm?: string; icmsValue?: number; customNote?: string }) => void;
  showToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

export const VerticeTaxDivergenceReport: React.FC<VerticeTaxDivergenceReportProps> = ({
  documents,
  currentCompany,
  onSelectDoc,
  onNavigateToCalculator,
  onApplyTaxToXml,
  onUpdateDocumentTax,
  showToast
}) => {
  // Navigation & Filtering
  const [filterTipoDoc, setFilterTipoDoc] = useState<string>('all'); // 'all' | 'NF-e' | 'NFS-e' | 'NFC-e' | 'CT-e'
  const [filterCompetencia, setFilterCompetencia] = useState<string>('all'); // 'all' | '2024/03' ...
  const [filterDirecao, setFilterDirecao] = useState<string>('all'); // 'all' | 'entrada' | 'saida'
  const [filterTaxType, setFilterTaxType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modals & Quick Edit
  const [selectedDivergence, setSelectedDivergence] = useState<DivergenceItem | null>(null);
  const [editingItem, setEditingItem] = useState<DivergenceItem | null>(null);
  const [editValorBase, setEditValorBase] = useState<number>(0);
  const [editAliq, setEditAliq] = useState<number>(0);
  const [editMva, setEditMva] = useState<number>(0);
  const [editCfop, setEditCfop] = useState<string>('');
  const [editNcm, setEditNcm] = useState<string>('');

  // Active View Tab: 'tabela' | 'pareceres'
  const [activeSubTab, setActiveSubTab] = useState<'tabela' | 'pareceres'>('tabela');

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
      
      // Competência
      const data = doc.dataEmissao || '2024-03-15';
      const competencia = data.substring(0, 7).replace('-', '/');
      const docTipo = (doc.tipo || 'NF-e') as 'NF-e' | 'NFS-e' | 'NFC-e' | 'CT-e';
      const direcao = isEntrada ? 'entrada' : 'saida';

      // 1. ANÁLISE DE DIFAL ENTRADA
      if (isEntrada && isInterestadual) {
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
            docTipo,
            chave: doc.chave,
            dataEmissao: doc.dataEmissao,
            competencia,
            direcao,
            emitente: doc.emitente,
            emitenteCnpj: doc.emitenteCnpj,
            destinatario: doc.destinatario,
            destinatarioCnpj: doc.destinatarioCnpj || currentCompany.cnpj,
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
              : `Divergência de Base de Cálculo: XML declarou Base Simples (R$ ${doc.valorTotal.toFixed(2)}) enquanto o estado ${destinoUf} exige Base Dupla com exclusão da origem e embutimento da alíquota interna por dentro (Base Dupla: R$ ${taxDetails.difalEntradaDupla.toFixed(2)}).`,
            fundamentacaoLegal: `Convênio ICMS 142/2018 Cláusula Nona e Legislação SEFAZ/${destinoUf} (Cálculo por Dentro).`,
            acaoRecomendada: `Emitir Guia DARE/GNRE complementar no valor de R$ ${delta.toFixed(2)} e retificar o registro C100/C190 no SPED Fiscal.`,
            parecerCompleto: `PARECER FISCAL - DIFAL ENTRADA:\nTrata-se de aquisição interestadual (${origemUf} ➔ ${destinoUf}) destinada a uso, consumo ou ativo imobilizado sob CFOP ${doc.cfop}. Identificamos que o documento fiscal nº ${doc.numero} não contemplou o diferencial de alíquotas pelo método da Base Dupla exigido no RICMS/${destinoUf}. O imposto devido apurado é de R$ ${apuradoDifal.toFixed(2)}, gerando uma defasagem tributária de R$ ${delta.toFixed(2)}. Risco iminente de lavratura de Auto de Infração no posto fiscal de fronteira.`
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
            docTipo,
            chave: doc.chave,
            dataEmissao: doc.dataEmissao,
            competencia,
            direcao,
            emitente: doc.emitente,
            emitenteCnpj: doc.emitenteCnpj,
            destinatario: doc.destinatario,
            destinatarioCnpj: doc.destinatarioCnpj || currentCompany.cnpj,
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
            motivoDivergencia: `Item sob regime de Substituição Tributária (NCM ${doc.ncm}) faturado incorretamente com CFOP de tributação normal (${doc.cfop}) sem retenção do imposto no destino. MVA Ajustada regulamentar: ${taxDetails.mvaAjustada}%.`,
            fundamentacaoLegal: `Convênio ICMS 142/2018 e Protocolo Interestadual CONFAZ.`,
            acaoRecomendada: `Solicitar Carta de Correção Eletrônica (CC-e) imediata para alteração do CFOP para 5405 / 6403 e retenção da ST.`,
            parecerCompleto: `PARECER FISCAL - SUBSTITUIÇÃO TRIBUTÁRIA:\nO produto classificado no NCM ${doc.ncm} possui previsão expressa de retenção antecipada do ICMS por Substituição Tributária. A emissão sob CFOP ${doc.cfop} sem a aplicação da MVA de ${taxDetails.mvaAjustada}% expõe a empresa compradora à responsabilidade solidária pelo recolhimento do ICMS-ST no montante de R$ ${apuradoST.toFixed(2)} acrescido de multa moratória.`
          });
        }
      }

      // 3. ANÁLISE DE PIS/COFINS MONOFÁSICO
      if (taxDetails.monofasicoEconomia > 0 && doc.cfop === '5102') {
        const pisCofinsRecuperavel = taxDetails.monofasicoEconomia;
        list.push({
          docId: doc.id,
          docNumero: doc.numero,
          docSerie: doc.serie || '1',
          docTipo,
          chave: doc.chave,
          dataEmissao: doc.dataEmissao,
          competencia,
          direcao,
          emitente: doc.emitente,
          emitenteCnpj: doc.emitenteCnpj,
          destinatario: doc.destinatario,
          destinatarioCnpj: doc.destinatarioCnpj || currentCompany.cnpj,
          ufOrigem: origemUf,
          ufDestino: destinoUf,
          ncm: doc.ncm || '2202.10.00',
          cfop: doc.cfop,
          valorTotal: doc.valorTotal,
          taxCategory: 'PIS/COFINS Monofásico',
          valorDeclaradoXml: +(doc.valorTotal * 0.0385).toFixed(2),
          valorApuradoVertice: 0.00,
          deltaValor: -pisCofinsRecuperavel,
          deltaPercentual: -100,
          natureza: 'Pagamento Indevido (Crédito a Recuperar)',
          severidade: 'medio',
          motivoDivergencia: `Mercadoria com incidência monofásica de PIS/COFINS (NCM ${doc.ncm}). Houve tributação indevida de PIS/COFINS nas saídas subsequentes no Simples Nacional / Lucro Presumido.`,
          fundamentacaoLegal: `Lei Federal nº 10.147/2000, Lei nº 10.833/2003 e Solução de Consulta COSIT nº 225/2014.`,
          acaoRecomendada: `Segregar as receitas de produtos monofásicos no PGDAS-D com CST 04 (Alíquota Zero) para recuperar R$ ${pisCofinsRecuperavel.toFixed(2)}.`,
          parecerCompleto: `PARECER FISCAL - PIS/COFINS MONOFÁSICO:\nIdentificamos oportunidade expressiva de recuperação de indébito tributário. Os produtos vinculados ao NCM ${doc.ncm} já sofreram tributação concentrada pelo fabricante/importador. A empresa está tributando integralmente essas receitas, gerando bitributação indevida. Direito líquido de abatimento imediato no DAS.`
        });
      }

      // 4. ANÁLISE DE DIFAL SAÍDA (EC 87/2015)
      if (isSaida && isInterestadual) {
        const declaredDifalSaida = doc.xmlContent?.match(/<vICMSUFDest>([\d.]+)<\/vICMSUFDest>/i)?.[1]
          ? parseFloat(doc.xmlContent.match(/<vICMSUFDest>([\d.]+)<\/vICMSUFDest>/i)[1])
          : 0;
        
        const apuradoDifalSaida = taxDetails.difalSaidaTotal;
        const deltaSaida = apuradoDifalSaida - declaredDifalSaida;

        if (Math.abs(deltaSaida) > 0.05) {
          list.push({
            docId: doc.id,
            docNumero: doc.numero,
            docSerie: doc.serie || '1',
            docTipo,
            chave: doc.chave,
            dataEmissao: doc.dataEmissao,
            competencia,
            direcao,
            emitente: doc.emitente,
            emitenteCnpj: doc.emitenteCnpj,
            destinatario: doc.destinatario,
            destinatarioCnpj: doc.destinatarioCnpj || 'Consumidor Final',
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
            motivoDivergencia: `Venda interestadual para consumidor final não contribuinte (CFOP ${doc.cfop}) sem apuração correta do DIFAL de partilha e FCP para o estado ${destinoUf}.`,
            fundamentacaoLegal: `Emenda Constitucional 87/2015 e Lei Complementar 190/2022.`,
            acaoRecomendada: `Gerar Guia GNRE Código 10010-2 com favorecido UF ${destinoUf} no valor de R$ ${deltaSaida.toFixed(2)}.`,
            parecerCompleto: `PARECER FISCAL - DIFAL SAÍDA (EC 87/15):\nNa operação interestadual para consumidor não contribuinte, cabe ao remetente recolher o diferencial de alíquota para o estado de destino. Constatamos ausência de recolhimento ou destaque incorreto do grupo ICMSUFDest no XML da NF-e nº ${doc.numero}. Risco de bloqueio do veículo transportador pela fiscalização de barreira.`
          });
        }
      }
    });

    return list;
  }, [documents, currentCompany]);

  // Unique Competências for Filter
  const uniqueCompetencias = useMemo(() => {
    return Array.from(new Set(divergenceList.map(d => d.competencia))).sort().reverse();
  }, [divergenceList]);

  // Filtered List
  const filteredList = useMemo(() => {
    return divergenceList.filter(item => {
      // Tipo Doc
      if (filterTipoDoc !== 'all' && item.docTipo !== filterTipoDoc) return false;
      // Competência
      if (filterCompetencia !== 'all' && item.competencia !== filterCompetencia) return false;
      // Direção
      if (filterDirecao !== 'all' && item.direcao !== filterDirecao) return false;
      // Tax Type
      if (filterTaxType !== 'all' && item.taxCategory !== filterTaxType) return false;
      // Severity
      if (filterSeverity !== 'all' && item.severidade !== filterSeverity) return false;

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
  }, [divergenceList, filterTipoDoc, filterCompetencia, filterDirecao, filterTaxType, filterSeverity, searchQuery]);

  // Grouped Pareceres by Tipo de Nota, Competência and Direção
  const groupedPareceres = useMemo(() => {
    const map = new Map<string, {
      tipo: string;
      competencia: string;
      direcao: string;
      items: DivergenceItem[];
      totalRisco: number;
      totalCredito: number;
      totalNotas: number;
    }>();

    filteredList.forEach(item => {
      const key = `${item.docTipo}__${item.competencia}__${item.direcao}`;
      if (!map.has(key)) {
        map.set(key, {
          tipo: item.docTipo,
          competencia: item.competencia,
          direcao: item.direcao,
          items: [],
          totalRisco: 0,
          totalCredito: 0,
          totalNotas: 0
        });
      }

      const group = map.get(key)!;
      group.items.push(item);
      group.totalNotas++;
      if (item.deltaValor > 0) group.totalRisco += item.deltaValor;
      if (item.deltaValor < 0) group.totalCredito += Math.abs(item.deltaValor);
    });

    return Array.from(map.values());
  }, [filteredList]);

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

    return {
      totalDocs,
      totalDivergentes,
      taxaConformidade,
      riscoAutuacaoTotal,
      creditoRecuperavelTotal,
      criticosCount
    };
  }, [documents, divergenceList]);

  // Handle Quick Edit Open
  const handleOpenQuickEdit = (item: DivergenceItem) => {
    setEditingItem(item);
    setEditValorBase(item.valorTotal);
    setEditAliq(item.taxCategory === 'ICMS-ST' ? 20 : 18);
    setEditMva(item.taxCategory === 'ICMS-ST' ? 44.3 : 0);
    setEditCfop(item.cfop);
    setEditNcm(item.ncm);
  };

  // Handle Quick Edit Save
  const handleSaveQuickEdit = () => {
    if (!editingItem) return;

    // Recalculate based on updated fields
    let newCalculatedTax = 0;
    if (editingItem.taxCategory === 'ICMS-ST') {
      const baseSt = editValorBase * (1 + editMva / 100);
      const icmsProprio = editValorBase * 0.12;
      const icmsStBruto = baseSt * (editAliq / 100);
      newCalculatedTax = Math.max(0, icmsStBruto - icmsProprio);
      
      if (onApplyTaxToXml) {
        onApplyTaxToXml('st', newCalculatedTax, baseSt, editAliq, { mva: editMva, icmsProprio });
      }
    } else if (editingItem.taxCategory === 'DIFAL Entrada') {
      const icmsOrigem = editValorBase * 0.12;
      const baseDupla = (editValorBase - icmsOrigem) / (1 - editAliq / 100);
      newCalculatedTax = Math.max(0, (baseDupla * (editAliq / 100)) - icmsOrigem);
      
      if (onApplyTaxToXml) {
        onApplyTaxToXml('difal_entrada', newCalculatedTax, baseDupla, editAliq);
      }
    } else {
      newCalculatedTax = editValorBase * 0.06;
      if (onApplyTaxToXml) {
        onApplyTaxToXml('difal_saida', newCalculatedTax, editValorBase, editAliq);
      }
    }

    if (onUpdateDocumentTax) {
      onUpdateDocumentTax(editingItem.docId, {
        valorTotal: editValorBase,
        cfop: editCfop,
        ncm: editNcm,
        icmsValue: newCalculatedTax
      });
    }

    showToast(`Nota nº ${editingItem.docNumero} retificada com sucesso! Imposto recalculado: R$ ${newCalculatedTax.toFixed(2)}`, 'success');
    setEditingItem(null);
  };

  // Export CSV
  const handleExportCsv = () => {
    if (divergenceList.length === 0) {
      showToast('Nenhuma divergência para exportar.', 'info');
      return;
    }

    const headers = [
      'Documento', 'Competência', 'Direção', 'Número', 'Série', 'Chave', 'Emitente', 'CNPJ Emitente',
      'UF Origem', 'UF Destino', 'NCM', 'CFOP', 'Valor Total R$', 'Tributo', 'Valor XML R$',
      'Valor Vértice R$', 'Divergência Delta R$', 'Severidade', 'Natureza', 'Diagnóstico Fiscal', 'Fundamentação Legal'
    ];

    const rows = divergenceList.map(d => [
      `"${d.docTipo}"`, `"${d.competencia}"`, `"${d.direcao}"`, `"${d.docNumero}"`, `"${d.docSerie}"`, `"${d.chave}"`,
      `"${d.emitente.replace(/"/g, '""')}"`, `"${d.emitenteCnpj}"`, `"${d.ufOrigem}"`, `"${d.ufDestino}"`,
      `"${d.ncm}"`, `"${d.cfop}"`, d.valorTotal.toFixed(2), `"${d.taxCategory}"`, d.valorDeclaradoXml.toFixed(2),
      d.valorApuradoVertice.toFixed(2), d.deltaValor.toFixed(2), `"${d.severidade}"`, `"${d.natureza}"`,
      `"${d.motivoDivergencia.replace(/"/g, '""')}"`, `"${d.fundamentacaoLegal.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_divergencia_fiscal_${currentCompany.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Relatório exportado em CSV com sucesso!', 'success');
  };

  return (
    <div className="space-y-6 w-full">
      
      {/* Top Banner with Red Divergence Indicator */}
      <div className="p-6 bg-gradient-to-r from-[#0F172A] via-[#1A0E18] to-[#0F172A] border-2 border-rose-600/40 rounded-3xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-600/20 border border-rose-500/50 text-rose-400 shrink-0 shadow-lg animate-pulse">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white uppercase tracking-wider">
                Relatório de Divergência Fiscal & Alertas de Tributação Incorreta
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black border border-rose-400 shadow-md">
                {divergenceList.length} DIVERGÊNCIAS
              </span>
            </div>
            <p className="text-xs text-rose-200/80 mt-0.5">
              Identificação visual dinâmica em vermelho para notas com erros de DIFAL, Substituição Tributária e PIS/COFINS com edição rápida inline.
            </p>
          </div>
        </div>

        {/* Action Controls & Sub-tabs */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex bg-[#0B0F19] p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveSubTab('tabela')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'tabela' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Tabela Dinâmica</span>
            </button>
            <button
              onClick={() => setActiveSubTab('pareceres')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'pareceres' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Pareceres por Competência ({groupedPareceres.length})</span>
            </button>
          </div>

          <button
            onClick={handleExportCsv}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Total Auditado */}
        <div className="p-4 bg-[#0F172A] border border-slate-800 rounded-2xl flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total de Documentos</span>
            <FileText className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">{metrics.totalDocs}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">{metrics.totalDivergentes} notas com inconformidade</div>
          </div>
        </div>

        {/* Card 2: Alertas Críticos (Red Flag) */}
        <div className="p-4 bg-rose-950/30 border-2 border-rose-500/50 rounded-2xl flex flex-col justify-between space-y-2 shadow-lg shadow-rose-950/40">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-rose-400 uppercase tracking-wider flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              Alertas Vermelhos
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-rose-400 font-mono">{metrics.criticosCount} notas</div>
            <div className="text-[10px] text-rose-300/80 mt-0.5 font-bold">Risco de autuação na SEFAZ</div>
          </div>
        </div>

        {/* Card 3: Risco Tributário */}
        <div className="p-4 bg-[#0F172A] border border-rose-500/30 rounded-2xl flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Imposto a Menor (Risco)</span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            <div className="text-2xl font-black text-rose-400 font-mono">
              R$ {metrics.riscoAutuacaoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">DIFAL/ST pendente de recolhimento</div>
          </div>
        </div>

        {/* Card 4: Crédito a Recuperar */}
        <div className="p-4 bg-[#0F172A] border border-emerald-500/30 rounded-2xl flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Crédito a Recuperar</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              R$ {metrics.creditoRecuperavelTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Monofásicos pagos indevidamente</div>
          </div>
        </div>

        {/* Card 5: Taxa de Conformidade */}
        <div className="p-4 bg-[#0F172A] border border-slate-800 rounded-2xl flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Taxa de Conformidade</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-400 font-mono">{metrics.taxaConformidade}%</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Assertividade de destaque</div>
          </div>
        </div>

      </div>

      {/* Filter and Matrix Bar: Tipo de Nota | Competência | Entrada/Saída */}
      <div className="p-4 bg-[#0F172A] border border-slate-800 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-md">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar Nota, Emitente, CNPJ, Chave..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 font-mono placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Filter Tipo de Nota */}
          <select
            value={filterTipoDoc}
            onChange={(e) => setFilterTipoDoc(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-rose-500"
          >
            <option value="all">Tipo: Todos (NF-e, NFS-e, NFC-e, CT-e)</option>
            <option value="NF-e">NF-e (Mercadorias)</option>
            <option value="NFS-e">NFS-e (Serviços)</option>
            <option value="NFC-e">NFC-e (Consumidor)</option>
            <option value="CT-e">CT-e (Transporte)</option>
          </select>

          {/* Filter Competência */}
          <select
            value={filterCompetencia}
            onChange={(e) => setFilterCompetencia(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-rose-500"
          >
            <option value="all">Competência: Todas</option>
            {uniqueCompetencias.map(comp => (
              <option key={comp} value={comp}>{comp}</option>
            ))}
          </select>

          {/* Filter Direção */}
          <select
            value={filterDirecao}
            onChange={(e) => setFilterDirecao(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-rose-500"
          >
            <option value="all">Direção: Todas (Entrada & Saída)</option>
            <option value="entrada">Entrada (Compras)</option>
            <option value="saida">Saída (Vendas)</option>
          </select>

          {/* Filter Tributo */}
          <select
            value={filterTaxType}
            onChange={(e) => setFilterTaxType(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-rose-500"
          >
            <option value="all">Tributo: Todos</option>
            <option value="DIFAL Entrada">DIFAL Entrada</option>
            <option value="DIFAL Saída">DIFAL Saída</option>
            <option value="ICMS-ST">ICMS-ST</option>
            <option value="PIS/COFINS Monofásico">PIS/COFINS Monofásico</option>
          </select>
        </div>

        <div className="text-[11px] text-slate-400 font-mono self-end md:self-center">
          Exibindo <strong className="text-white">{filteredList.length}</strong> de {divergenceList.length} notas
        </div>
      </div>

      {/* VIEW 1: TABELA DINÂMICA COM ALERTA EM VERMELHO E EDIÇÃO RÁPIDA */}
      {activeSubTab === 'tabela' && (
        <div className="bg-[#0F172A] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/90 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Documento / Comp.</th>
                  <th className="py-3 px-4">Direção & Emitente</th>
                  <th className="py-3 px-4">NCM / CFOP</th>
                  <th className="py-3 px-4">Tributo</th>
                  <th className="py-3 px-4 text-right">Valor XML</th>
                  <th className="py-3 px-4 text-right">Valor Calculado</th>
                  <th className="py-3 px-4 text-right">Diferença (Delta)</th>
                  <th className="py-3 px-4">Alerta de Inconformidade</th>
                  <th className="py-3 px-4 text-center">Edição Rápida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500">
                      <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                      <p className="text-sm font-bold text-slate-300">Nenhuma divergência encontrada nos filtros selecionados.</p>
                      <p className="text-xs text-slate-500 mt-0.5">Todas as notas auditadas estão em conformidade com as regras fiscais.</p>
                    </td>
                  </tr>
                ) : (
                  filteredList.map((item, idx) => {
                    const isNegative = item.deltaValor < 0;
                    const isCritical = item.severidade === 'critico';

                    return (
                      <tr 
                        key={`${item.docId}-${item.taxCategory}-${idx}`}
                        className={`transition group cursor-pointer ${
                          isCritical 
                            ? 'bg-rose-950/20 hover:bg-rose-950/40 border-l-4 border-l-rose-500' 
                            : 'hover:bg-slate-800/40 border-l-4 border-l-amber-500/60'
                        }`}
                        onClick={() => setSelectedDivergence(item)}
                      >
                        {/* Documento & Competência */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                              item.docTipo === 'NF-e' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {item.docTipo}
                            </span>
                            <span className="font-bold text-white">nº {item.docNumero}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1 font-sans">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            <span>Comp: <strong className="text-slate-200">{item.competencia}</strong></span>
                          </div>
                        </td>

                        {/* Direção & Emitente */}
                        <td className="py-3.5 px-4 font-sans">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase flex items-center gap-1 ${
                              item.direcao === 'entrada' ? 'bg-amber-500/20 text-amber-300' : 'bg-cyan-500/20 text-cyan-300'
                            }`}>
                              {item.direcao === 'entrada' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                              {item.direcao.toUpperCase()}
                            </span>
                            <span className="font-bold text-slate-200 truncate max-w-[150px]">{item.emitente}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {item.ufOrigem} ➔ {item.ufDestino} | Total: R$ {item.valorTotal.toFixed(2)}
                          </div>
                        </td>

                        {/* NCM / CFOP */}
                        <td className="py-3.5 px-4">
                          <div className="text-slate-200 font-bold">{item.ncm}</div>
                          <div className="text-[10px] text-slate-400">CFOP: <strong className="text-amber-400">{item.cfop}</strong></div>
                        </td>

                        {/* Tributo */}
                        <td className="py-3.5 px-4 font-sans">
                          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-white text-[11px] font-bold block w-fit">
                            {item.taxCategory}
                          </span>
                        </td>

                        {/* Valor Declarado XML */}
                        <td className="py-3.5 px-4 text-right">
                          <span className="text-slate-400 font-bold">
                            R$ {item.valorDeclaradoXml.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </td>

                        {/* Valor Apurado Vértice */}
                        <td className="py-3.5 px-4 text-right">
                          <span className="text-white font-black">
                            R$ {item.valorApuradoVertice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </td>

                        {/* Delta (Diferença) */}
                        <td className="py-3.5 px-4 text-right">
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

                        {/* Alerta em Vermelho / Status */}
                        <td className="py-3.5 px-4 font-sans">
                          <div className={`p-1.5 rounded-lg border text-[10px] font-black uppercase tracking-wide flex items-center gap-1.5 w-fit ${
                            item.severidade === 'critico'
                              ? 'bg-rose-950/60 border-rose-500 text-rose-300 shadow-md shadow-rose-950/50 animate-pulse'
                              : item.severidade === 'alto'
                              ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                              : 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                          }`}>
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                            <span>{item.natureza.split(' ')[0]} {item.natureza.split(' ')[1]}</span>
                          </div>
                        </td>

                        {/* Botão de Edição Rápida */}
                        <td className="py-3.5 px-4 text-center font-sans">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenQuickEdit(item);
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-[10px] font-black uppercase transition flex items-center gap-1 mx-auto shadow-md cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Ajustar</span>
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
      )}

      {/* VIEW 2: PARECERES ESTRUTURADOS POR TIPO DE NOTA, COMPETÊNCIA E ENTRADA/SAÍDA */}
      {activeSubTab === 'pareceres' && (
        <div className="space-y-6">
          {groupedPareceres.length === 0 ? (
            <div className="p-12 text-center bg-[#0F172A] border border-slate-800 rounded-3xl text-slate-400">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <p className="text-sm font-bold text-white">Nenhum parecer pendente para os filtros selecionados.</p>
            </div>
          ) : (
            groupedPareceres.map((group, gIdx) => (
              <div 
                key={gIdx}
                className="p-6 bg-[#0F172A] border-2 border-slate-800 rounded-3xl space-y-4 shadow-xl"
              >
                {/* Group Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded bg-rose-600/20 border border-rose-500/40 text-rose-400 font-black text-xs uppercase">
                        {group.tipo}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold text-xs uppercase">
                        Competência: {group.competencia}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-black uppercase ${
                        group.direcao === 'entrada' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}>
                        Operações de {group.direcao.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Consolidado fiscal para {group.totalNotas} nota(s) fiscal(is) auditada(s).
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {group.totalRisco > 0 && (
                      <div className="text-right">
                        <span className="text-[9px] font-bold text-rose-400 uppercase block">Risco Fiscal Total</span>
                        <span className="text-base font-black text-rose-400 font-mono">
                          R$ {group.totalRisco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                    {group.totalCredito > 0 && (
                      <div className="text-right">
                        <span className="text-[9px] font-bold text-emerald-400 uppercase block">Crédito Recuperável</span>
                        <span className="text-base font-black text-emerald-400 font-mono">
                          R$ {group.totalCredito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Parecer Synthesis Box */}
                <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-white uppercase flex items-center gap-1.5 text-xs">
                      <BookOpen className="w-4 h-4 text-rose-500" />
                      Parecer Tributário Consolidado • {group.tipo} ({group.competencia})
                    </span>
                    <button
                      onClick={() => {
                        const parecerText = group.items.map(it => it.parecerCompleto).join('\n\n---\n\n');
                        navigator.clipboard.writeText(parecerText);
                        showToast('Pareceres do bloco copiados!', 'success');
                      }}
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Pareceres</span>
                    </button>
                  </div>

                  <div className="space-y-3 pt-1">
                    {group.items.map((item, itIdx) => (
                      <div key={itIdx} className="p-3.5 bg-slate-900 rounded-xl border border-slate-800/80 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-white">{item.docTipo} nº {item.docNumero} • {item.emitente}</span>
                          <span className="font-mono text-rose-400 font-black">
                            Divergência: R$ {item.deltaValor.toFixed(2)} ({item.taxCategory})
                          </span>
                        </div>
                        <p className="text-slate-300 text-[11px] font-mono whitespace-pre-line leading-relaxed">
                          {item.parecerCompleto}
                        </p>
                        <div className="pt-2 border-t border-slate-800/60 flex justify-between items-center text-[10px] text-slate-400">
                          <span><strong>Base Legal:</strong> {item.fundamentacaoLegal}</span>
                          <button
                            onClick={() => handleOpenQuickEdit(item)}
                            className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Retificar Agora</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL: EDIÇÃO RÁPIDA DE VALORES PARA CORREÇÃO */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0F172A] border-2 border-rose-500/40 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-black uppercase">
                    EDIÇÃO RÁPIDA FISCAL
                  </span>
                  <h3 className="text-sm font-black text-white uppercase">
                    Retificar {editingItem.docTipo} nº {editingItem.docNumero}
                  </h3>
                </div>
                <p className="text-xs text-slate-400">
                  Ajuste os parâmetros da nota para recalcular o imposto e regravar o XML imediatamente.
                </p>
              </div>

              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Editable Fields */}
            <div className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Valor Base da Operação (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editValorBase}
                    onChange={(e) => setEditValorBase(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 text-emerald-400 text-sm font-black rounded-xl p-2.5 font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Alíquota Interna Destino (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editAliq}
                    onChange={(e) => setEditAliq(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 text-white text-sm font-black rounded-xl p-2.5 font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {editingItem.taxCategory === 'ICMS-ST' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-rose-400 uppercase">MVA - Margem de Valor Agregado Ajustada (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editMva}
                    onChange={(e) => setEditMva(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 text-rose-400 text-sm font-black rounded-xl p-2.5 font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">CFOP da Operação</label>
                  <input
                    type="text"
                    value={editCfop}
                    onChange={(e) => setEditCfop(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white text-xs font-mono font-bold rounded-xl p-2.5 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">NCM do Produto</label>
                  <input
                    type="text"
                    value={editNcm}
                    onChange={(e) => setEditNcm(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white text-xs font-mono font-bold rounded-xl p-2.5 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Dynamic Recalculated Preview */}
              <div className="p-3 bg-rose-950/30 border border-rose-500/30 rounded-2xl flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-rose-400 uppercase block">Novo Imposto Recalculado</span>
                  <span className="text-[9px] text-slate-400">Aplicação automática nas memórias do XML</span>
                </div>
                <span className="text-xl font-black text-rose-400 font-mono">
                  R$ {(editingItem.taxCategory === 'ICMS-ST' 
                    ? Math.max(0, (editValorBase * (1 + editMva / 100) * (editAliq / 100)) - (editValorBase * 0.12))
                    : (editValorBase * 0.06)).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveQuickEdit}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black transition flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Salvar e Gravar no XML</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: DETALHES COMPLETOS DA DIVERGÊNCIA */}
      {selectedDivergence && !editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0F172A] border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    selectedDivergence.severidade === 'critico' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {selectedDivergence.severidade.toUpperCase()}
                  </span>
                  <h3 className="text-sm font-black text-white uppercase">
                    Auditoria • {selectedDivergence.docTipo} nº {selectedDivergence.docNumero}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 font-mono">Chave: {selectedDivergence.chave}</p>
              </div>

              <button
                onClick={() => setSelectedDivergence(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 font-mono">
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-sans">1. Declarado no XML</span>
                <div className="text-2xl font-black text-slate-300">
                  R$ {selectedDivergence.valorDeclaradoXml.toFixed(2)}
                </div>
              </div>

              <div className="p-4 bg-slate-900 rounded-2xl border border-rose-500/30 space-y-1">
                <span className="text-[10px] font-bold text-rose-400 uppercase font-sans">2. Apurado pelo Sistema</span>
                <div className="text-2xl font-black text-rose-400">
                  R$ {selectedDivergence.valorApuradoVertice.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="space-y-3 p-4 bg-slate-900/40 rounded-2xl border border-slate-800">
              <div>
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">Diagnóstico</span>
                <p className="text-xs text-slate-200 mt-0.5">{selectedDivergence.motivoDivergencia}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Base Legal</span>
                <p className="text-xs text-slate-300 font-mono mt-0.5">{selectedDivergence.fundamentacaoLegal}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block">Ação Recomendada</span>
                <p className="text-xs text-emerald-300 mt-0.5">{selectedDivergence.acaoRecomendada}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                onClick={() => handleOpenQuickEdit(selectedDivergence)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-black transition flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <Edit2 className="w-4 h-4" />
                <span>Abrir Edição Rápida da Nota</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
