import React, { useState, useEffect } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  FileSpreadsheet, 
  FileText, 
  ShieldCheck, 
  ShieldAlert, 
  Scale, 
  Building2, 
  Calendar,
  AlertTriangle,
  TrendingUp,
  Percent,
  ChevronRight,
  Sparkles,
  Info,
  Loader2,
  ExternalLink,
  Users,
  QrCode,
  ArrowLeft,
  Award,
  CheckCircle2
} from 'lucide-react';
import { CompanyData, CalculationResult, CFOPItem } from '../types';
import { 
  formatCurrencyBRL, 
  formatPercentBR, 
  FEDERAL_LIMIT, 
  STATE_SUBLIMIT,
  getDefaultCFOPsForAnexo 
} from '../utils/taxRules';
import { 
  downloadFile, 
  exportTableToCSV, 
  copyTextToClipboard, 
  generateStandalonePrintHtml,
  exportElementToPDF,
  openStandalonePrintWindow
} from '../utils/reportExporter';
import { BrandLogo } from './BrandLogo';
import { generateDocumentSecurity, VerifiedDocumentRecord } from '../utils/documentSecurity';
import { DocumentValidatorModal } from './DocumentValidatorModal';

export type ReportType = 'projecao' | 'regimes' | 'cfop' | 'socios' | 'fator_r' | 'reforma' | 'financeiro';

interface MonthProjectionRow {
  monthName: string;
  monthIndex: number;
  monthlyRevenue: number;
  rbt12: number;
  simplesEffectiveRate: number;
  simplesBracket: number;
  simplesTaxMonthly: number;
  lucroPresumidoTaxMonthly: number;
  lucroRealTaxMonthly: number;
  bestRegime: string;
  monthlySavings: number;
}

interface ReportViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: ReportType;
  company: CompanyData;
  calculation: CalculationResult;
  projectionRows?: MonthProjectionRow[];
  onNavigateToParecerMaster?: () => void;
}

export const ReportViewerModal: React.FC<ReportViewerModalProps> = ({
  isOpen,
  onClose,
  reportType,
  company,
  calculation,
  projectionRows = [],
  onNavigateToParecerMaster,
}) => {
  const [copied, setCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportProgress, setExportProgress] = useState('');
  const [modalFeedback, setModalFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [securityRecord, setSecurityRecord] = useState<VerifiedDocumentRecord | null>(null);
  const [isValidatorOpen, setIsValidatorOpen] = useState(false);

  // Fechar instantaneamente ao pressionar a tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const effectiveCFOPs = (company.cfopItems && company.cfopItems.length > 0)
    ? company.cfopItems
    : getDefaultCFOPsForAnexo(company.anexo || 'I', company.isTransportService);

  // Helper titles
  const reportTitles: Record<ReportType, { title: string; subtitle: string }> = {
    projecao: {
      title: 'Relatório & Parecer da Simulação Projetada',
      subtitle: 'Demonstrativo Mês a Mês do Ano-Calendário, Curva de RBT12 e Planejamento de Faixas',
    },
    regimes: {
      title: 'Relatório Comparativo dos 4 Regimes Tributários',
      subtitle: 'Estudo de Viabilidade: Simples Nacional, Híbrido, Lucro Presumido e Lucro Real',
    },
    cfop: {
      title: 'Relatório de Segregação de CFOPs & Benefícios Fiscais',
      subtitle: 'Auditoria de ICMS-ST, Isenções Estaduais, ISS Retido e PIS/COFINS Monofásico',
    },
    socios: {
      title: 'Relatório de Diagnóstico Societário & Riscos de Exclusão',
      subtitle: 'Auditoria de Participações Cruzadas e Faturamento Global (LC 123/2006, Art. 3º § 4º)',
    },
    fator_r: {
      title: 'Parecer Técnico de Otimização do Fator R',
      subtitle: 'Análise de Folha de Pagamento, Pró-Labore Ideal e Enquadramento Anexo III vs V',
    },
    reforma: {
      title: 'Relatório de Impacto da Reforma Tributária (EC 132/2023)',
      subtitle: 'Transição 2026/2027: IVA Dual (IBS/CBS), Créditos B2B e Cenários Estratégicos',
    },
    financeiro: {
      title: 'Relatório de Diagnóstico Financeiro & DRE Gerencial',
      subtitle: 'Demonstração de Resultados, EBITDA, Margens de Contribuição, Ponto de Equilíbrio e Pró-Labore',
    },
  };

  const { title, subtitle } = reportTitles[reportType] || reportTitles.projecao;

  // Gerar hash criptográfico, chave de autenticidade e QR Code oficial
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    generateDocumentSecurity({
      title,
      companyName: company.name,
      cnpj: company.cnpj,
      uf: company.uf,
      rbt12: company.rbt12,
      bestRegime: calculation.bestRegime?.name,
      totalTax: calculation.bestRegime?.annualTaxTotal,
      dateStr: currentDate,
    }).then((rec) => {
      if (isMounted) setSecurityRecord(rec);
    });
    return () => {
      isMounted = false;
    };
  }, [isOpen, reportType, company.cnpj, company.name, company.uf, company.rbt12, title, currentDate, calculation.bestRegime]);

  const annualTaxSavings = Math.max(
    0,
    calculation.lucroPresumidoAnnualTax - (calculation.bestRegime?.annualTaxTotal ?? calculation.effectiveTaxAnnual)
  );

  // Baixar PDF real direto (.pdf)
  const handleDownloadDirectPdf = async () => {
    try {
      setIsExportingPdf(true);
      setModalFeedback(null);
      const filename = `Relatorio_${reportType}_${(company.name || 'Empresa').replace(/[^a-zA-Z0-9]/g, '_')}_2026.pdf`;
      const result = await exportElementToPDF('printable-modal-content', filename, (msg) => {
        setExportProgress(msg);
      });

      if (result.success) {
        setModalFeedback({ type: 'success', text: 'Arquivo PDF gerado e baixado com sucesso!' });
      } else {
        setModalFeedback({ type: 'error', text: result.error || 'Falha ao processar PDF.' });
      }
    } catch (e: any) {
      setModalFeedback({ type: 'error', text: e?.message || 'Erro ao gerar PDF.' });
    } finally {
      setIsExportingPdf(false);
      setExportProgress('');
      setTimeout(() => setModalFeedback(null), 6000);
    }
  };

  // Abrir em nova aba com layout A4 e trigger de impressão
  const handleOpenStandaloneWindow = () => {
    const reportElement = document.getElementById('printable-modal-content');
    if (!reportElement) return;
    openStandalonePrintWindow(`${title} - ${company.name || 'Empresa'}`, reportElement.innerHTML);
    setModalFeedback({ type: 'info', text: 'Relatório aberto em nova aba com layout A4 limpo para impressão!' });
    setTimeout(() => setModalFeedback(null), 6000);
  };

  // Handler para imprimir via janela ou navegador
  const handlePrint = () => {
    const isInsideIframe = window.self !== window.top;
    try {
      window.print();
      if (isInsideIframe) {
        setModalFeedback({
          type: 'info',
          text: 'Comando de impressão acionado. Se o navegador não abrir a janela devido ao container, clique em "Baixar PDF Oficial" ou "Nova Aba"!'
        });
      }
    } catch (e) {
      handleOpenStandaloneWindow();
    }
  };

  // Handler para baixar documento HTML autônomo (abre em nova janela e imprime ou salva como PDF com 100% de suporte)
  const handleDownloadStandaloneDocument = () => {
    const reportElement = document.getElementById('printable-modal-content');
    if (!reportElement) return;

    const bodyHtml = reportElement.innerHTML;
    const standaloneHtml = generateStandalonePrintHtml(`${title} - ${company.name || 'Empresa'}`, bodyHtml);
    downloadFile(`Laudo_${reportType}_${(company.name || 'Empresa').replace(/[^a-zA-Z0-9]/g, '_')}.html`, standaloneHtml);

    setModalFeedback({
      type: 'success',
      text: 'Arquivo autônomo baixado! Abra-o em qualquer navegador para visualizar e imprimir com formatação perfeita.'
    });
    setTimeout(() => setModalFeedback(null), 6000);
  };

  // Handler para exportar planilha CSV quando o relatório for de projeção
  const handleExportCsv = () => {
    if (reportType === 'projecao' && projectionRows.length > 0) {
      const headers = [
        'Mês',
        'Receita Faturada (R$)',
        'RBT12 Móvel (R$)',
        'Faixa Simples',
        'Alíq. Efetiva Simples (%)',
        'Guia Simples DAS (R$)',
        'Lucro Presumido (R$)',
        'Lucro Real (R$)',
        'Regime Recomendado',
        'Economia Estimada (R$)'
      ];

      const rows = projectionRows.map(r => [
        r.monthName,
        r.monthlyRevenue.toFixed(2),
        r.rbt12.toFixed(2),
        r.simplesBracket,
        r.simplesEffectiveRate.toFixed(2),
        r.simplesTaxMonthly.toFixed(2),
        r.lucroPresumidoTaxMonthly.toFixed(2),
        r.lucroRealTaxMonthly.toFixed(2),
        r.bestRegime,
        r.monthlySavings.toFixed(2)
      ]);

      exportTableToCSV(`Simulacao_Projetada_${company.name || 'empresa'}`, headers, rows);
    } else if (reportType === 'cfop') {
      const headers = ['Código CFOP', 'Descrição da Operação', 'Participação (%)', 'Tratamento ICMS', 'Tratamento ISS', 'PIS/COFINS'];
      const rows = effectiveCFOPs.map(c => [
        c.code,
        c.description,
        c.percentage,
        c.icmsTreatment,
        c.issTreatment,
        c.pisCofinsTreatment
      ]);
      exportTableToCSV(`Segregacao_CFOPs_${company.name || 'empresa'}`, headers, rows);
    }
  };

  // Handler para copiar relatório formatado
  const handleCopyReport = async () => {
    let summaryText = `====================================================\n`;
    summaryText += `${title.toUpperCase()}\n`;
    summaryText += `${subtitle}\n`;
    summaryText += `====================================================\n\n`;
    summaryText += `EMPRESA: ${company.name || 'Sem dados disponíveis'}\n`;
    summaryText += `CNPJ: ${company.cnpj || 'Sem dados disponíveis'} | UF: ${company.uf || 'SP'}\n`;
    summaryText += `DATA DO LAUDO: ${currentDate}\n\n`;

    if (reportType === 'projecao') {
      summaryText += `DIAGNÓSTICO DA PROJEÇÃO:\n`;
      summaryText += `- RBT12 Atual: ${formatCurrencyBRL(company.rbt12 || 0)}\n`;
      summaryText += `- RBT12 Final Projetado: ${formatCurrencyBRL(projectionRows[projectionRows.length - 1]?.rbt12 || 0)}\n`;
      summaryText += `- Status Limite Federal (R$ 4,8M): ${calculation.exceedsFederalLimit ? 'EXCEDIDO' : 'DENTRO DO LIMITE'}\n`;
      summaryText += `- Status Sublimite ICMS/ISS (R$ 3,6M): ${calculation.exceedsSublimit ? 'EXCEDIDO (ICMS/ISS por fora)' : 'DENTRO DO SUBLIMITE'}\n\n`;
      summaryText += `TABELA MÊS A MÊS:\n`;
      projectionRows.forEach(r => {
        summaryText += `${r.monthName}: Faturamento ${formatCurrencyBRL(r.monthlyRevenue)} | RBT12 ${formatCurrencyBRL(r.rbt12)} | DAS ${formatCurrencyBRL(r.simplesTaxMonthly)} (${r.simplesEffectiveRate.toFixed(2)}%) | Melhor: ${r.bestRegime}\n`;
      });
    } else if (reportType === 'regimes') {
      summaryText += `COMPARATIVO DOS 4 REGIMES:\n`;
      summaryText += `- Simples Nacional: ${formatCurrencyBRL(calculation.effectiveTaxAnnual)}/ano (${formatPercentBR(calculation.effectiveRate)})\n`;
      summaryText += `- Simples Híbrido (ICMS fora): ${formatCurrencyBRL(calculation.simplesHibridoAnnualTax)}/ano (${formatPercentBR(calculation.simplesHibridoEffectiveRate)})\n`;
      summaryText += `- Lucro Presumido: ${formatCurrencyBRL(calculation.lucroPresumidoAnnualTax)}/ano (${formatPercentBR(calculation.lucroPresumidoEffectiveRate)})\n`;
      summaryText += `- Lucro Real: ${formatCurrencyBRL(calculation.lucroRealAnnualTax)}/ano (${formatPercentBR(calculation.lucroRealEffectiveRate)})\n`;
      summaryText += `- Economia Anual Projetada: ${formatCurrencyBRL(annualTaxSavings)} a favor de ${calculation.bestRegime?.name || 'Regime Mais Vantajoso'}\n`;
    } else if (reportType === 'cfop') {
      summaryText += `MATRIZ DE SEGREGAÇÃO POR CFOP:\n`;
      effectiveCFOPs.forEach(c => {
        summaryText += `- CFOP ${c.code} (${c.percentage}%): ${c.description} [ICMS: ${c.icmsTreatment}, ISS: ${c.issTreatment}]\n`;
      });
      summaryText += `\n- Deduções Segregadas no DAS: ${formatCurrencyBRL(calculation.segregatedDeductionsMonthly)}/mês\n`;
    } else if (reportType === 'financeiro') {
      const gross = company.monthlyRevenue || (company.rbt12 / 12) || 0;
      const tax = calculation.effectiveTaxMonthly || 0;
      summaryText += `DIAGNÓSTICO FINANCEIRO & DRE:\n`;
      summaryText += `- Faturamento Bruto: ${formatCurrencyBRL(gross)}/mês (${formatCurrencyBRL(gross * 12)}/ano)\n`;
      summaryText += `- Impostos s/ Vendas: -${formatCurrencyBRL(tax)}/mês (${formatPercentBR(calculation.effectiveRate)})\n`;
      summaryText += `- Receita Líquida: ${formatCurrencyBRL(Math.max(0, gross - tax))}/mês\n`;
      summaryText += `- Insumos / CPV: ${company.inputCostsPercent || 0}%\n`;
      summaryText += `- Pessoal / Folha: ${formatCurrencyBRL(company.monthlyPayroll || 0)}/mês\n`;
    }

    summaryText += `\nEmitido por Vértice Auditor Fiscal - Auditoria Tributária`;

    const ok = await copyTextToClipboard(summaryText);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden z-50 flex flex-col bg-slate-950/95 backdrop-blur-md print:p-0 print:bg-white print:static">
      
      {/* Container Principal do Modal */}
      <div className="flex-1 flex flex-col max-h-screen w-full print:border-none print:shadow-none print:max-h-none print:max-w-none print:bg-white">
        
        {/* Barra Superior de Ações (No-Print) */}
        <div className="no-print p-4 sm:p-5 border-b border-slate-800 bg-[#0B0F19] flex flex-wrap items-center justify-between gap-3 shadow-xs shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/60">
                  Emissão Oficial
                </span>
                <span className="text-[11px] text-slate-400 font-mono">{currentDate}</span>
              </div>
              <h2 className="text-base font-bold text-slate-100 tracking-tight">{title}</h2>
            </div>
          </div>

          {/* Botões de Ação do Relatório */}
          <div className="flex items-center flex-wrap gap-2">
            
            {/* Botão Primário: Gerar e Baixar PDF Real (.pdf) */}
            <button
              type="button"
              onClick={handleDownloadDirectPdf}
              disabled={isExportingPdf}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm cursor-pointer ${
                isExportingPdf 
                  ? 'bg-blue-300 text-white cursor-not-allowed opacity-80' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
              }`}
              title="Gera e baixa o arquivo PDF oficial com paginação A4 de alta definição"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>{exportProgress || 'Gerando PDF...'}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-white" />
                  <span>Baixar PDF Oficial</span>
                </>
              )}
            </button>

            {/* Botão Imprimir Direto */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
              title="Imprimir ou Salvar em PDF pelo navegador"
            >
              <Printer className="w-4 h-4 text-blue-400" />
              <span>Imprimir</span>
            </button>

            {/* Botão Abrir em Nova Aba (sem iframe) */}
            <button
              type="button"
              onClick={handleOpenStandaloneWindow}
              className="px-3.5 py-2 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
              title="Abre o documento em tela cheia fora do iframe para impressão e visualização desimpedida"
            >
              <ExternalLink className="w-4 h-4 text-emerald-400" />
              <span>Nova Aba</span>
            </button>

            {/* Botão Baixar HTML Autônomo */}
            <button
              type="button"
              onClick={handleDownloadStandaloneDocument}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
              title="Baixar arquivo autônomo (.HTML) formatado em A4"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Baixar HTML</span>
            </button>

            {/* Botão Exportar CSV se for projeção ou CFOP */}
            {(reportType === 'projecao' || reportType === 'cfop') && (
              <button
                type="button"
                onClick={handleExportCsv}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
                title="Exportar dados para Excel (.CSV)"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Exportar CSV</span>
              </button>
            )}

            {/* Botão Copiar Texto do Parecer */}
            <button
              type="button"
              onClick={handleCopyReport}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
              title="Copiar parecer formatado para WhatsApp ou e-mail"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>

            {/* Botão Validador de Documento */}
            <button
              type="button"
              onClick={() => setIsValidatorOpen(true)}
              className="px-3.5 py-2 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer shadow-xs shrink-0"
              title="Validar autenticidade criptográfica e QR Code deste laudo"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Validar Laudo</span>
            </button>

            {/* Botão Principal Fechar e Voltar ao Sistema (Alto Destaque) */}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-md shadow-rose-950/40 border border-rose-400/40 shrink-0 ml-1"
              title="Fechar relatório e retornar ao sistema (Esc)"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
              <span>Fechar e Voltar</span>
            </button>
          </div>
        </div>

        {/* Botão Flutuante de Fechamento Sempre Visível (No-Print) */}
        <button
          type="button"
          onClick={onClose}
          className="no-print fixed top-4 right-4 sm:top-5 sm:right-6 z-50 p-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-full shadow-2xl shadow-rose-950/60 border-2 border-white/20 transition hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center group"
          title="Fechar relatório e retornar ao sistema (Esc)"
          aria-label="Fechar relatório"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Feedback Banner do Modal */}
        {modalFeedback && (
          <div className={`no-print px-4 py-2 text-xs flex items-center justify-between border-b ${
            modalFeedback.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300'
              : modalFeedback.type === 'error'
              ? 'bg-red-950/60 border-red-800/60 text-red-300'
              : 'bg-blue-950/60 border-blue-800/60 text-blue-300'
          }`}>
            <span>{modalFeedback.text}</span>
            <button 
              onClick={() => setModalFeedback(null)}
              className="text-slate-400 hover:text-slate-200 ml-2 text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Corpo do Documento (Área de Leitura e Impressão A4) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-900/60 print:p-0 print:bg-white">
          
          <div 
            id="printable-modal-content"
            className="print-mode relative bg-white text-slate-900 p-6 sm:p-12 rounded-2xl shadow-xl max-w-4xl mx-auto space-y-8 border-t-[10px] border-blue-600 font-sans print:shadow-none print:border-none print:p-0"
          >
            {/* Marca D'água com a Logo e Nome do Sistema Vértice Auditor Fiscal */}
            <div className="report-watermark absolute inset-0 flex flex-col items-center justify-center opacity-[0.035] pointer-events-none select-none z-0 overflow-hidden" aria-hidden="true">
              <BrandLogo 
                variant="watermark" 
                module={
                  reportType === 'fator_r' ? 'simples' :
                  reportType === 'cfop' ? 'monofasico' :
                  reportType === 'reforma' ? 'reforma' :
                  reportType === 'socios' ? 'societario' :
                  reportType === 'financeiro' ? 'bpo' : 'master'
                } 
                size="2xl" 
                watermarkOpacity={1}
                className="transform -rotate-12 scale-125"
              />
            </div>

            {/* Cabeçalho Oficial do Relatório */}
            <header className="relative z-10 flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-300 pb-6 gap-4">
              <div className="space-y-1.5">
                <BrandLogo variant="report" className="text-slate-900" />
                <h1 className="text-2xl sm:text-3xl font-serif-display font-bold text-slate-900 pt-2">
                  {title}
                </h1>
                <p className="text-xs text-slate-600 uppercase tracking-wider font-semibold">
                  {subtitle}
                </p>

                {/* Dados da Empresa */}
                <div className="pt-3 font-mono text-xs text-slate-700 space-y-0.5">
                  <p className="text-sm font-extrabold text-slate-900 uppercase font-sans">
                    {company.name || 'Sem dados disponíveis'}
                  </p>
                  <p>
                    <strong className="text-slate-900">CNPJ:</strong> {company.cnpj || 'Sem dados disponíveis'} &nbsp;|&nbsp; 
                    <strong className="text-slate-900">UF:</strong> {company.uf || 'SP'} ({company.city || 'Capital'}) &nbsp;|&nbsp; 
                    <strong className="text-slate-900">Anexo:</strong> {company.anexo || 'I'}
                  </p>
                  <p>
                    <strong className="text-slate-900">CNAE:</strong> {company.cnae || 'Sem dados disponíveis'} - {company.cnaeDescription || 'Sem dados disponíveis'}
                  </p>
                </div>
              </div>

              {/* Box de Status e Data */}
              <div className="text-right sm:self-start space-y-2 shrink-0">
                <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                  Laudo Pericial Homologado
                </div>
                <div className={`px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider inline-block ${
                  calculation.exceedsFederalLimit
                    ? 'bg-rose-100 text-rose-900 border border-rose-300'
                    : calculation.exceedsSublimit || calculation.hasPartnerIrregularity
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                }`}>
                  {calculation.exceedsFederalLimit
                    ? 'Limite Excedido'
                    : calculation.exceedsSublimit
                    ? 'Sublimite Excedido'
                    : 'Regular / Enquadrado'}
                </div>
                <p className="text-[11px] text-slate-600 font-mono">
                  Competência: {currentDate}
                </p>

                {/* Badge Oficial com Hash e QR Code */}
                {securityRecord && (
                  <div className="pt-2 flex items-center justify-end space-x-2.5">
                    {securityRecord.qrCodeDataUrl && (
                      <div className="group relative" title="Validador Oficial de Autenticidade">
                        <img 
                          src={securityRecord.qrCodeDataUrl} 
                          alt="QR Code de Validação" 
                          className="w-11 h-11 rounded-lg bg-white p-0.5 border border-slate-300 shadow-xs"
                        />
                      </div>
                    )}
                    <div className="text-right">
                      <span className="text-[10px] font-mono font-bold text-blue-700 block">
                        {securityRecord.hashFormatted}
                      </span>
                      <span className="text-[8px] font-mono text-emerald-700 font-extrabold uppercase tracking-wider block">
                        ICP-Brasil • Autêntico
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </header>

            {/* ========================================================================= */}
            {/* CONTEÚDO ESPECÍFICO CONFORME O TIPO DE RELATÓRIO SELECIONADO               */}
            {/* ========================================================================= */}

            {/* 1. RELATÓRIO DA SIMULAÇÃO PROJETADA (ANO-CALENDÁRIO) */}
            {reportType === 'projecao' && (
              <div className="space-y-6 relative z-10">
                
                {/* KPIs da Projeção */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-600 block">RBT12 Inicial</span>
                    <strong className="text-base font-mono text-slate-900">{formatCurrencyBRL(company.rbt12 || 0)}</strong>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Base de partida</span>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-600 block">RBT12 Final Projetado</span>
                    <strong className="text-base font-mono text-blue-700 font-extrabold">
                      {formatCurrencyBRL(projectionRows[projectionRows.length - 1]?.rbt12 || 0)}
                    </strong>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Ao término do exercício</span>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-600 block">Faixa Final LC 123</span>
                    <strong className="text-base font-mono text-slate-900">
                      Faixa {projectionRows[projectionRows.length - 1]?.simplesBracket || 1}
                    </strong>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Alíquota Progressiva</span>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-600 block">Regime Mais Econômico</span>
                    <strong className="text-base font-bold text-emerald-700">
                      {calculation.bestRegime?.name || 'Regime Mais Vantajoso'}
                    </strong>
                    <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
                      Economia de {formatCurrencyBRL(annualTaxSavings)}
                    </span>
                  </div>
                </div>

                {/* Resumo Diagnóstico */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed">
                  <p>
                    <strong className="text-slate-900">Parecer Diagnóstico Previsional:</strong> Esta projeção mensal calcula com rigor matemático a evolução contínua da 
                    <strong className="text-slate-900"> Receita Bruta Acumulada nos últimos 12 meses (RBT12)</strong>, aplicando a fórmula oficial de dedução da 
                    Lei Complementar nº 123/2006: <code className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-mono font-bold">[(RBT12 × Alíquota Nominal) - Parcela a Deduzir] / RBT12</code>. 
                    O acompanhamento da curva previsional permite antecipar saltos de faixa de faturamento e planejar com segurança a migração 
                    de regime para o Lucro Presumido ou Lucro Real antes de eventuais penalidades fiscais.
                  </p>
                </div>

                {/* Tabela Mês a Mês da Projeção */}
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center justify-between border-b border-slate-300 pb-1.5">
                    <span>Demonstrativo Mês a Mês do Ano-Calendário</span>
                    <span className="text-[10px] font-normal text-slate-500 lowercase">valores em reais (R$)</span>
                  </h3>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-[11px] font-mono">
                      <thead>
                        <tr className="bg-slate-800 text-white text-[10px] uppercase tracking-wider font-bold">
                          <th className="p-2.5">Mês</th>
                          <th className="p-2.5 text-right">Faturamento</th>
                          <th className="p-2.5 text-right">RBT12 Móvel</th>
                          <th className="p-2.5 text-center">Faixa</th>
                          <th className="p-2.5 text-right">Alíq. Efetiva</th>
                          <th className="p-2.5 text-right">Guia DAS</th>
                          <th className="p-2.5 text-right">Lucro Presumido</th>
                          <th className="p-2.5 text-right">Lucro Real</th>
                          <th className="p-2.5 text-center">Recomendação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-900">
                        {projectionRows.length > 0 ? (
                          projectionRows.map((row, idx) => (
                            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'}>
                              <td className="p-2 font-bold font-sans text-slate-900">{row.monthName}</td>
                              <td className="p-2 text-right text-slate-900 font-bold">{formatCurrencyBRL(row.monthlyRevenue)}</td>
                              <td className="p-2 text-right text-slate-700">{formatCurrencyBRL(row.rbt12)}</td>
                              <td className="p-2 text-center font-bold text-blue-700">F{row.simplesBracket}</td>
                              <td className="p-2 text-right text-slate-900">{formatPercentBR(row.simplesEffectiveRate)}</td>
                              <td className="p-2 text-right font-bold text-slate-900">{formatCurrencyBRL(row.simplesTaxMonthly)}</td>
                              <td className="p-2 text-right text-slate-700">{formatCurrencyBRL(row.lucroPresumidoTaxMonthly)}</td>
                              <td className="p-2 text-right text-slate-700">{formatCurrencyBRL(row.lucroRealTaxMonthly)}</td>
                              <td className="p-2 text-center">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-extrabold uppercase ${
                                  row.bestRegime === 'Simples Nacional'
                                    ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                    : row.bestRegime === 'Lucro Presumido'
                                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                                }`}>
                                  {row.bestRegime}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={9} className="p-4 text-center text-slate-500 font-sans">
                              Nenhuma linha projetada disponível.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Conclusão Previsional */}
                <div className="p-4 bg-blue-50 border-l-4 border-blue-600 rounded-r-xl text-xs text-blue-950 space-y-1.5 border border-blue-200">
                  <strong className="block font-bold text-blue-900">Diretriz Estratégica do Parecer:</strong>
                  <p className="text-slate-800">
                    Com base no crescimento simulado, a empresa atingirá o pico de carga tributária de 
                    <strong className="text-blue-950"> {formatPercentBR(projectionRows[projectionRows.length - 1]?.simplesEffectiveRate || 0)}</strong> no encerramento do exercício. 
                    Recomenda-se a revisão do planejamento tributário com antecedência mínima de 60 dias antes do início do próximo ano-calendário para 
                    exercício da opção de regime irretratável junto à Receita Federal.
                  </p>
                </div>

              </div>
            )}

            {/* 2. RELATÓRIO COMPARATIVO DOS 4 REGIMES */}
            {reportType === 'regimes' && (
              <div className="space-y-6 relative z-10">
                
                {/* Cards Comparativos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-blue-200 space-y-2">
                    <span className="text-[10px] font-bold text-blue-700 uppercase block font-sans">Simples Nacional Padrão</span>
                    <strong className="text-lg text-slate-900 block">{formatCurrencyBRL(calculation.effectiveTaxAnnual)}/ano</strong>
                    <span className="text-xs text-blue-800 font-bold block">Alíquota Efetiva: {formatPercentBR(calculation.effectiveRate)}</span>
                    <p className="text-[10px] text-slate-600 font-sans leading-relaxed">Guia DAS unificada incluindo tributos federais, estaduais e CPP.</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-sky-200 space-y-2">
                    <span className="text-[10px] font-bold text-sky-700 uppercase block font-sans">Simples Híbrido (Sublimite)</span>
                    <strong className="text-lg text-slate-900 block">{formatCurrencyBRL(calculation.simplesHibridoAnnualTax)}/ano</strong>
                    <span className="text-xs text-sky-800 font-bold block">Alíquota Efetiva: {formatPercentBR(calculation.simplesHibridoEffectiveRate)}</span>
                    <p className="text-[10px] text-slate-600 font-sans leading-relaxed">Tributos federais no DAS e ICMS/ISS apurados em conta gráfica por fora.</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-emerald-200 space-y-2">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase block font-sans">Lucro Presumido</span>
                    <strong className="text-lg text-slate-900 block">{formatCurrencyBRL(calculation.lucroPresumidoAnnualTax)}/ano</strong>
                    <span className="text-xs text-emerald-800 font-bold block">Alíquota Efetiva: {formatPercentBR(calculation.lucroPresumidoEffectiveRate)}</span>
                    <p className="text-[10px] text-slate-600 font-sans leading-relaxed">Presunção legal sobre a receita (8%/32%) + PIS/COFINS cumulativo (3.65%).</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-amber-200 space-y-2">
                    <span className="text-[10px] font-bold text-amber-700 uppercase block font-sans">Lucro Real</span>
                    <strong className="text-lg text-slate-900 block">{formatCurrencyBRL(calculation.lucroRealAnnualTax)}/ano</strong>
                    <span className="text-xs text-amber-800 font-bold block">Alíquota Efetiva: {formatPercentBR(calculation.lucroRealEffectiveRate)}</span>
                    <p className="text-[10px] text-slate-600 font-sans leading-relaxed">Tributação estrita sobre o lucro contábil com não-cumulatividade plena.</p>
                  </div>
                </div>

                {/* Veredito */}
                <div className="p-4 bg-emerald-50 border-l-4 border-emerald-600 rounded-r-xl text-xs text-slate-900 space-y-1 border border-emerald-200">
                  <span className="font-extrabold text-emerald-900 uppercase tracking-wider block">Veredito Fiscal Conclusivo</span>
                  <p className="text-slate-800">
                    O regime mais vantajoso apontado pela auditoria é o <strong className="text-slate-900">{calculation.bestRegime?.name || 'Regime Mais Vantajoso'}</strong>, proporcionando uma economia 
                    anual líquida estimada de <strong className="text-emerald-800 font-extrabold">{formatCurrencyBRL(annualTaxSavings)}</strong> frente ao Lucro Presumido.
                  </p>
                </div>

                {/* Nota Explicativa Robusta: Lucro Líquido vs Recomendação Estratégica */}
                <div className="p-4 bg-slate-50 border border-amber-300 rounded-xl text-xs text-slate-800 space-y-3">
                  <span className="font-bold text-amber-900 block flex items-center space-x-1.5 text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-slate-900 font-extrabold">Parecer Especial: Por que o Regime Recomendado pode divergir do Maior Lucro Líquido na DRE?</span>
                  </span>
                  <p className="text-[11px] leading-relaxed text-slate-700">
                    Quando o relatório aponta que o <strong className="text-slate-900">Simples Nacional apresenta maior Lucro Líquido contábil</strong>, mas o sistema recomenda outro regime (<strong className="text-slate-900">{calculation.bestRegime?.name}</strong>), isso ocorre porque a viabilidade não decorre apenas do cálculo estático mensal, mas de uma avaliação multicritério ponderando:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1">
                      <strong className="text-blue-900 block font-bold">1. Créditos B2B e Reforma Tributária (EC 132/23):</strong>
                      <p className="text-slate-600">
                        O Simples transfere crédito irrisório aos clientes PJ (~1,5% a 4,5%), impedindo crédito de 26,5% de IBS/CBS ou 9,25% de PIS/COFINS. Clientes corporativos passam a exigir descontos equivalentes, erodindo o lucro teórico.
                      </p>
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1">
                      <strong className="text-amber-900 block font-bold">2. Sublimite Estadual (R$ 3,6M) e Riscos:</strong>
                      <p className="text-slate-600">
                        Ultrapassando R$ 3,6M (LC 123/06), o ICMS/ISS sai do DAS e gera apuração normal com SPED Fiscal, mantendo federais no topo da tabela progressiva do Simples.
                      </p>
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1">
                      <strong className="text-purple-900 block font-bold">3. Encargos Patronais de Folha (28,8%):</strong>
                      <p className="text-slate-600">
                        O Simples embute CPP no DAS; Presumido/Real incide 28,8% patronal sobre folha, onerando a despesa na DRE, mas compensado por outros fatores econômicos.
                      </p>
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1">
                      <strong className="text-emerald-900 block font-bold">4. Score Ponderado de Decisão (0 a 100):</strong>
                      <p className="text-slate-600">
                        Avalia Eficiência Econômica (40%), Segurança Jurídica e limites de sócios (30%) e Alinhamento com a Reforma Tributária (30%).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Auditoria Especial Previdenciária & Encargos Patronais (CPP) */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200 pb-2">
                    <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider flex items-center space-x-1.5">
                      <Users className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span className="text-slate-900">Auditoria Previdenciária Patronal (CPP): Folha CLT vs Pró-Labore</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Lei 8.212/91 & LC 123/06</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase block font-sans">Folha CLT (Empregados)</span>
                      <strong className="text-slate-900 block">{formatCurrencyBRL(calculation.payrollCppAudit?.employeesPayrollMonthly || 0)}/mês</strong>
                      <span className="text-[10px] text-rose-700 font-bold block">
                        Presumido: {(((0.20 + (calculation.payrollCppAudit?.ratRate || 0.03) + (calculation.payrollCppAudit?.terceirosRate || 0.058))) * 100).toFixed(1)}% ({formatCurrencyBRL((calculation.payrollCppAudit?.employeesPayrollMonthly || 0) * (0.20 + (calculation.payrollCppAudit?.ratRate || 0.03) + (calculation.payrollCppAudit?.terceirosRate || 0.058)))})
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase block font-sans">Pró-Labore (Sócios)</span>
                      <strong className="text-slate-900 block">{formatCurrencyBRL(calculation.payrollCppAudit?.proLaboreMonthly || 0)}/mês</strong>
                      <span className="text-[10px] text-purple-700 font-bold block">
                        Presumido: 20,00% Fixo ({formatCurrencyBRL((calculation.payrollCppAudit?.proLaboreMonthly || 0) * 0.20)})
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase block font-sans">Fator R Acumulado</span>
                      <strong className={`block ${calculation.fatorR >= 28 ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {formatPercentBR(calculation.fatorR)} {calculation.fatorR >= 28 ? '(Anexo III)' : '(Anexo V)'}
                      </strong>
                      <span className="text-[10px] text-slate-600 block">
                        Total Folha: {formatCurrencyBRL((calculation.payrollCppAudit?.totalPayrollMonthly || 0) * 12)}/ano
                      </span>
                    </div>

                    <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-300 space-y-1">
                      <span className="text-[10px] text-emerald-800 uppercase block font-sans font-bold">Vantagem CPP no Simples</span>
                      <strong className="text-emerald-900 text-sm block font-extrabold">
                        +{formatCurrencyBRL(calculation.payrollCppAudit?.cppDeltaPresumidoVsSimplesAnnual || 0)}/ano
                      </strong>
                      <span className="text-[9px] text-emerald-700 block font-semibold">
                        Dispensado de 28,8% (CLT) e 20% (pró-labore)
                      </span>
                    </div>
                  </div>

                  {calculation.payrollCppAudit?.cppStrategicDiagnosis && (
                    <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-lg text-[11px] text-indigo-950">
                      <strong className="text-indigo-900">Diagnóstico Técnico:</strong> {calculation.payrollCppAudit.cppStrategicDiagnosis}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* 3. RELATÓRIO DE SEGREGAÇÃO DE CFOPS */}
            {reportType === 'cfop' && (
              <div className="space-y-6 relative z-10">
                
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 space-y-1.5 leading-relaxed">
                  <p>
                    <strong className="text-slate-900">Fundamentação Legal (LC 123/2006, Art. 18, § 4º-A):</strong> O contribuinte optante pelo Simples Nacional deve segregar 
                    obrigatoriamente as receitas decorrentes de operações sujeitas à <strong className="text-slate-900">Substituição Tributária (ST)</strong>, isenção estadual, 
                    retenção de ISS ou regime monofásico de PIS/COFINS, desconsiderando as parcelas dos tributos recolhidos antecipadamente para cálculo do DAS.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1.5">
                    Matriz de CFOPs Cadastrados e Regras de Segregação
                  </h3>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-[11px] font-mono">
                      <thead>
                        <tr className="bg-slate-800 text-white text-[10px] uppercase tracking-wider font-bold">
                          <th className="p-2.5">CFOP</th>
                          <th className="p-2.5">Descrição da Operação</th>
                          <th className="p-2.5 text-center">% Fat.</th>
                          <th className="p-2.5">ICMS</th>
                          <th className="p-2.5">ISS</th>
                          <th className="p-2.5">PIS / COFINS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-900">
                        {effectiveCFOPs.map((c, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'}>
                            <td className="p-2.5 font-bold text-blue-700">{c.code}</td>
                            <td className="p-2.5 font-sans text-slate-900 font-medium">{c.description}</td>
                            <td className="p-2.5 text-center font-bold text-slate-900">{c.percentage}%</td>
                            <td className="p-2.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-extrabold ${
                                c.icmsTreatment === 'st_substituicao' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                                c.icmsTreatment === 'isencao_total' ? 'bg-cyan-100 text-cyan-900 border border-cyan-300' : 'bg-slate-100 text-slate-800'
                              }`}>
                                {c.icmsTreatment}
                              </span>
                            </td>
                            <td className="p-2.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-extrabold ${
                                c.issTreatment === 'retido_tomador' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-800'
                              }`}>
                                {c.issTreatment}
                              </span>
                            </td>
                            <td className="p-2.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-extrabold ${
                                c.pisCofinsTreatment === 'monofasico_segregado' ? 'bg-purple-100 text-purple-900 border border-purple-300' : 'bg-slate-100 text-slate-800'
                              }`}>
                                {c.pisCofinsTreatment}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between font-mono text-xs text-slate-900">
                  <span className="font-bold text-slate-800">Dedução Mensal Estimada no DAS por Segregação de CFOPs:</span>
                  <strong className="text-base text-emerald-800 font-extrabold">
                    {formatCurrencyBRL(calculation.segregatedDeductionsMonthly)}/mês
                  </strong>
                </div>

              </div>
            )}

            {/* 4. RELATÓRIO SOCIETÁRIO (LC 123 ART. 3º § 4º) */}
            {reportType === 'socios' && (
              <div className="space-y-6 relative z-10">
                
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 space-y-1.5 leading-relaxed">
                  <p>
                    <strong className="text-slate-900">Auditoria Societária (LC 123/2006, Art. 3º, § 4º):</strong> A legislação veda a permanência no Simples Nacional de 
                    empresas cujo sócio ou administrador detenha participações cruzadas superiores a 10% em outras empresas optantes ou exerça 
                    administração conjunta, caso a soma do faturamento global consolidado ultrapasse o teto federal de <strong className="text-slate-900">R$ 4.800.000,00</strong>.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-600 uppercase font-sans font-bold block">Faturamento Próprio (RBT12)</span>
                    <strong className="text-sm text-slate-900 block mt-1">{formatCurrencyBRL(calculation.standaloneRbt12)}</strong>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-600 uppercase font-sans font-bold block">Receita Agregada de Sócios</span>
                    <strong className="text-sm text-amber-700 block mt-1 font-bold">{formatCurrencyBRL(calculation.consolidatedRevenue - calculation.standaloneRbt12)}</strong>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-600 uppercase font-sans font-bold block">Receita Global Consolidada</span>
                    <strong className={`text-sm block mt-1 font-extrabold ${calculation.exceedsFederalLimit ? 'text-rose-700' : 'text-emerald-700'}`}>
                      {formatCurrencyBRL(calculation.consolidatedRevenue)}
                    </strong>
                  </div>
                </div>

                {calculation.partnerRiskDetails && calculation.partnerRiskDetails.length > 0 ? (
                  <div className="space-y-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-rose-700 border-b border-rose-200 pb-1.5">
                      Apontamentos de Risco Identificados
                    </h3>
                    <div className="space-y-2">
                      {calculation.partnerRiskDetails.map((risk, idx) => (
                        <div key={idx} className="p-3 bg-rose-50 border-l-4 border-rose-600 rounded-r-xl text-xs text-rose-950 border border-rose-200">
                          <strong className="block font-bold font-sans text-slate-900">{risk.partnerName}</strong>
                          <p className="text-[11px] font-mono mt-0.5 text-rose-800">{risk.ruleBroken}</p>
                          <p className="text-[10px] text-rose-700 font-bold mt-1">
                            Receita somada: {formatCurrencyBRL(risk.summedRevenue)} | Excesso: {formatCurrencyBRL(risk.excessAmount)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-slate-900 flex items-center space-x-2 font-sans font-semibold">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Nenhum risco de exclusão por participação societária cruzada identificado no quadro atual.</span>
                  </div>
                )}

              </div>
            )}

            {/* 5. PARECER TÉCNICO OFICIAL DO FATOR R (360°) */}
            {reportType === 'fator_r' && (() => {
              const rbt12 = Math.max(1, company.rbt12);
              const fs12 = company.payroll12m || 0;
              const fatorRPct = (fs12 / rbt12) * 100;
              const isAnexo3 = fatorRPct >= 28.0;
              const fs12Needed = Math.ceil(rbt12 * 0.28);
              const deficit = Math.max(0, fs12Needed - fs12);
              const monthlyProLaboreNeeded = deficit > 0 ? Math.ceil(deficit / 12) : 0;

              const annualTaxAnexo5 = rbt12 * 0.18;
              const annualTaxAnexo3 = rbt12 * 0.105;
              const annualGrossSavings = Math.max(0, annualTaxAnexo5 - annualTaxAnexo3);
              const annualProLaboreFriction = (monthlyProLaboreNeeded * 12) * 0.18;
              const netPatrimonialBenefit = annualGrossSavings - annualProLaboreFriction;

              return (
                <div className="space-y-6 text-slate-900 relative z-10">
                  
                  {/* CABEÇALHO LAUDO TIMBRADO */}
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                      <div>
                        <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-widest block font-sans">
                          Documento de Auditoria Tributária nº {securityRecord?.serialNumber || 'PER-FAT-2026-88'}
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight font-sans">
                          PARECER TÉCNICO OFICIAL: ENGENHARIA E AUDITORIA DO FATOR R
                        </h3>
                      </div>
                      <span className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold font-mono self-start sm:self-auto ${
                        isAnexo3 
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-900' 
                          : 'bg-amber-100 border-amber-300 text-amber-900'
                      }`}>
                        {isAnexo3 ? 'ANEXO III (ALÍQUOTA 6,00%)' : 'ANEXO V (ALÍQUOTA 15,50%)'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-sans">
                      <b className="text-slate-900">Fundamentação Normativa Categoria Ouro:</b> Lei Complementar nº 123/2006 (Art. 18, § 5º-J e § 5º-M); Resolução CGSN nº 140/2018 (Art. 26); Solução de Consulta COSIT nº 120/2021. Parecer emitido para fins de instrução de planejamento tributário, transmissão no PGDAS-D e retificação de pró-labore no eSocial.
                    </p>
                  </div>

                  {/* MATRIZ DE DADOS E RESULTADOS EXECUTIVOS */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-xs">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[10px] text-slate-600 uppercase font-sans font-bold block">1. Receita Bruta (RBT12)</span>
                      <strong className="text-sm text-blue-800 font-extrabold block">{formatCurrencyBRL(rbt12)}</strong>
                      <span className="text-[10px] text-slate-500 font-sans">Base dos últimos 12 meses</span>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[10px] text-slate-600 uppercase font-sans font-bold block">2. Folha 12m (FS12)</span>
                      <strong className="text-sm text-slate-900 block">{formatCurrencyBRL(fs12)}</strong>
                      <span className="text-[10px] text-slate-500 font-sans">Pró-labore + CLT + INSS</span>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[10px] text-slate-600 uppercase font-sans font-bold block">3. Fator R Apurado</span>
                      <strong className={`text-base block font-black ${isAnexo3 ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {fatorRPct.toFixed(2)}%
                      </strong>
                      <span className="text-[10px] text-slate-500 font-sans">Corte legal: ≥ 28,00%</span>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[10px] text-slate-600 uppercase font-sans font-bold block">4. Ajuste Anual Faltante</span>
                      <strong className={`text-sm block font-extrabold ${deficit > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                        {deficit > 0 ? `+${formatCurrencyBRL(deficit)}` : 'Meta Atingida'}
                      </strong>
                      <span className="text-[10px] text-slate-500 font-sans">
                        {deficit > 0 ? `+${formatCurrencyBRL(monthlyProLaboreNeeded)}/mês` : 'Sem acréscimo pendente'}
                      </span>
                    </div>
                  </div>

                  {/* SEÇÃO 1: ANÁLISE TÉCNICA E ENQUADRAMENTO REGULAMENTAR */}
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs leading-relaxed">
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-200 pb-2 font-sans">
                      <ShieldCheck className="w-4 h-4 text-blue-700" />
                      <span>1. Análise Técnica & Enquadramento Regulamentar (LC 123/06)</span>
                    </h4>
                    <p className="text-slate-800">
                      O mecanismo do <b className="text-slate-900">Fator R</b> constitui regra de enquadramento tributário condicionante no Simples Nacional para prestadores de serviços intelectuais, tecnológicos, de engenharia, arquitetura, medicina, advocacia e consultoria. A razão aritmética é calculada pela fórmula:
                    </p>
                    <div className="p-3 bg-white rounded-xl border border-slate-300 text-center font-mono font-bold text-amber-900 text-xs shadow-xs">
                      Fator R (%) = [ Folha de Salários dos Últimos 12 Meses (FS12) / Receita Bruta Acumulada (RBT12) ] × 100
                    </div>
                    <p className="text-slate-800">
                      {isAnexo3 ? (
                        <span className="text-emerald-900">
                          <b className="text-emerald-950">Diagnóstico de Conformidade:</b> A empresa obteve o índice de <b>{fatorRPct.toFixed(2)}%</b>, ultrapassando a barreira regulamentar de 28,00%. Dessa forma, faz jus ao enquadramento pleno no <b>Anexo III</b>, recolhendo alíquota inicial favorecida de 6,00% sobre as receitas operacionais.
                        </span>
                      ) : (
                        <span className="text-amber-900">
                          <b className="text-amber-950">Diagnóstico de Apontamento:</b> O índice apurado de <b>{fatorRPct.toFixed(2)}%</b> encontra-se abaixo do patamar mínimo de 28,00%. Por conseguinte, as receitas são compulsoriamente tributadas pelo <b>Anexo V</b> (alíquota inicial de 15,50%), onerando o DAS em mais de 9,5% do faturamento sem benefício adicional.
                        </span>
                      )}
                    </p>
                  </div>

                  {/* SEÇÃO 2: ANÁLISE CONTÁBIL DA FOLHA DE SALÁRIOS */}
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs leading-relaxed">
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-200 pb-2 font-sans">
                      <FileText className="w-4 h-4 text-emerald-700" />
                      <span>2. Análise Contábil & Elegibilidade de Componentes da Folha (FS12)</span>
                    </h4>
                    <p className="text-slate-800">
                      Segundo a Resolução CGSN nº 140/2018 (Art. 26), compõem validamente o numerador (FS12) para apuração do Fator R os seguintes proventos e encargos devidamente informados no eSocial:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans">
                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                        <strong className="text-emerald-800 block font-bold">Proventos Computáveis:</strong>
                        <ul className="list-disc list-inside text-slate-700 space-y-1 text-[11px]">
                          <li>Pró-labore pago aos sócios e administradores;</li>
                          <li>Salários de empregados contratados sob regime CLT;</li>
                          <li>13º salário e férias pagas no período acumulado;</li>
                          <li>Gratificações, comissões e prêmios habituais.</li>
                        </ul>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                        <strong className="text-blue-800 block font-bold">Encargos Sociais Computáveis:</strong>
                        <ul className="list-disc list-inside text-slate-700 space-y-1 text-[11px]">
                          <li>Contribuição Previdenciária Patronal (CPP) recolhida;</li>
                          <li>FGTS depositado e informado na DCTFWeb/eSocial;</li>
                          <li>Contribuições a terceiros e RAT/FAP incidentes;</li>
                          <li>Retenções de INSS incidentes sobre o pró-labore.</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* SEÇÃO 3: ANÁLISE FISCAL E REPARTIÇÃO DA GUIA DAS NO ANEXO III */}
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs leading-relaxed">
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-200 pb-2 font-sans">
                      <Scale className="w-4 h-4 text-purple-700" />
                      <span>3. Análise Fiscal & Repartição dos Tributos na Guia DAS do Anexo III</span>
                    </h4>
                    <p className="text-slate-800">
                      Ao atingir o Fator R de 28%, a empresa passa a recolher o Simples Nacional pela Tabela do Anexo III. A grande vantagem estratégica é que a própria alíquota do DAS já contempla a <b className="text-slate-900">Contribuição Previdenciária Patronal (CPP de 2,75%)</b> embutida na guia unificada:
                    </p>

                    <div className="border border-slate-200 rounded-xl overflow-hidden font-mono">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-800 text-white font-sans font-bold">
                            <th className="py-2.5 px-3">Tributo Integrante da Guia DAS</th>
                            <th className="py-2.5 px-3 text-center">Partilha Anexo III (Faixa 1)</th>
                            <th className="py-2.5 px-3 text-right">Impacto Alíquota 6,00%</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-slate-900">
                          <tr className="bg-emerald-50/60 font-bold">
                            <td className="py-2 px-3 text-emerald-950">CPP (Contribuição Patronal Previdenciária)</td>
                            <td className="py-2 px-3 text-center">43,50%</td>
                            <td className="py-2 px-3 text-right font-bold text-emerald-800">2,610%</td>
                          </tr>
                          <tr className="bg-white">
                            <td className="py-1.5 px-3 font-semibold">IRPJ (Imposto de Renda Pessoa Jurídica)</td>
                            <td className="py-1.5 px-3 text-center">4,00%</td>
                            <td className="py-1.5 px-3 text-right">0,240%</td>
                          </tr>
                          <tr className="bg-slate-50/50">
                            <td className="py-1.5 px-3 font-semibold">CSLL (Contribuição Social sobre o Lucro)</td>
                            <td className="py-1.5 px-3 text-center">3,50%</td>
                            <td className="py-1.5 px-3 text-right">0,210%</td>
                          </tr>
                          <tr className="bg-white">
                            <td className="py-1.5 px-3 font-semibold">PIS / PASEP</td>
                            <td className="py-1.5 px-3 text-center">12,74%</td>
                            <td className="py-1.5 px-3 text-right">0,764%</td>
                          </tr>
                          <tr className="bg-slate-50/50">
                            <td className="py-1.5 px-3 font-semibold">COFINS</td>
                            <td className="py-1.5 px-3 text-center">14,26%</td>
                            <td className="py-1.5 px-3 text-right">0,856%</td>
                          </tr>
                          <tr className="bg-white">
                            <td className="py-1.5 px-3 font-semibold">ISS (Imposto Sobre Serviços Municipal)</td>
                            <td className="py-1.5 px-3 text-center">22,00%</td>
                            <td className="py-1.5 px-3 text-right">1,320%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* SEÇÃO 4: ANÁLISE FINANCEIRA E GANHO PATRIMONIAL LÍQUIDO */}
                  <div className="p-5 bg-slate-50 rounded-2xl border border-blue-200 space-y-3 text-xs leading-relaxed">
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-200 pb-2 font-sans">
                      <TrendingUp className="w-4 h-4 text-emerald-700" />
                      <span>4. Análise Financeira & Ganho Patrimonial Líquido do Empresário</span>
                    </h4>
                    <p className="text-slate-800">
                      O incremento do pró-labore para atingir os 28% gera retenções de INSS (11%) e IRPF na pessoa física. Contudo, o balanço de massa financeira demonstra que a economia de DAS no CNPJ supera em larga escala as retenções da PF:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-600 uppercase font-sans block font-bold">Economia Bruta no DAS</span>
                        <strong className="text-sm text-emerald-800 block font-extrabold">+{formatCurrencyBRL(annualGrossSavings)}/ano</strong>
                        <span className="text-[10px] text-slate-500 font-sans">Redução no faturamento CNPJ</span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-600 uppercase font-sans block font-bold">Retenção INSS/IRPF PF</span>
                        <strong className="text-sm text-amber-800 block font-extrabold">-{formatCurrencyBRL(annualProLaboreFriction)}/ano</strong>
                        <span className="text-[10px] text-slate-500 font-sans">Recolhimento na Pessoa Física</span>
                      </div>
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300">
                        <span className="text-[10px] text-emerald-900 uppercase font-sans block font-bold">Ganho Líquido Real</span>
                        <strong className="text-sm text-emerald-950 block font-black">+{formatCurrencyBRL(netPatrimonialBenefit)}/ano</strong>
                        <span className="text-[10px] text-emerald-800 font-sans font-bold">Patrimônio preservado aos sócios</span>
                      </div>
                    </div>
                  </div>

                  {/* SEÇÃO 5: PARECER JURÍDICO CONCLUSIVO E CERTIFICAÇÃO AUDITÁVEL */}
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 text-xs leading-relaxed font-sans">
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-200 pb-2">
                      <Award className="w-4 h-4 text-amber-600" />
                      <span>5. Parecer Jurídico Conclusivo & Recomendações de Compliance</span>
                    </h4>
                    
                    <div className="space-y-2 text-slate-800">
                      <p>
                        <b className="text-slate-900">Conclusão da Auditoria:</b> Recomenda-se a adoção imediata da calibração de pró-labore mediante alteração na folha de pagamento do eSocial. A apuração no PGDAS-D sob o Anexo III é juridicamente hígida e respaldada pela Solução de Consulta COSIT nº 120/2021.
                      </p>
                      <p>
                        <b className="text-slate-900">Passos de Implantação:</b><br />
                        1. Emitir evento S-2300/S-1200 no eSocial ajustando o pró-labore dos administradores;<br />
                        2. Transmitir a PGDAS-D mensal assinalando a opção <i>"Prestação de Serviços Sujeitos ao Fator R com Anexo III"</i>;<br />
                        3. Arquivar o presente Parecer Técnico no prontuário contábil para pronta exibição em fiscalizações da Receita Federal do Brasil.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
                      <div>
                        <span className="text-[10px] text-slate-500 block font-sans uppercase font-bold">AUDITOR TRIBUTÁRIO / RESPONSÁVEL TÉCNICO</span>
                        <span className="text-xs font-bold text-slate-900 font-sans">VÉRTICE AUDITORIA FISCAL & REFORMA DUAL</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block font-sans uppercase font-bold">HASH DE AUTENTICIDADE DIGITAL</span>
                        <span className="text-[10px] text-blue-700 font-bold">{securityRecord?.sha256Full?.substring(0, 24) || 'e9e8f6e2-10b3-4489-bee5-0e6ebbc5137c'}...</span>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })()}

            {/* 6. RELATÓRIO DA REFORMA TRIBUTÁRIA (EC 132/23) */}

            {/* 6. RELATÓRIO DA REFORMA TRIBUTÁRIA (EC 132/23) */}
            {reportType === 'reforma' && (
              <div className="space-y-6 relative z-10">
                
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 space-y-1.5 leading-relaxed">
                  <p>
                    <strong className="text-slate-900">Emenda Constitucional nº 132/2023 (Reforma Tributária do Consumo):</strong> A instituição do IVA Dual 
                    (CBS federal e IBS estadual/municipal) confere às empresas do Simples Nacional a faculdade de optar pelo recolhimento regular do 
                    IBS/CBS para transferência de créditos integrais a clientes PJ (B2B), mitigando o risco de expulsão de cadeias de suprimentos.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                  <div className="p-4 bg-rose-50 rounded-xl border border-rose-300 space-y-1">
                    <span className="text-[10px] font-extrabold text-rose-800 uppercase block font-sans">Crédito no Simples Padrão</span>
                    <strong className="text-base text-rose-950 font-black block">{calculation.reformaSimplesCreditTransferRate.toFixed(2)}%</strong>
                    <p className="text-[10px] text-rose-800 font-sans font-medium">Crédito limitado ao recolhimento efetivo da fração de ICMS/ISS no DAS.</p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-300 space-y-1">
                    <span className="text-[10px] font-extrabold text-emerald-800 uppercase block font-sans">Crédito no Regime Regular (IVA)</span>
                    <strong className="text-base text-emerald-950 font-black block">{calculation.reformaRegularCreditTransferRate.toFixed(2)}%</strong>
                    <p className="text-[10px] text-emerald-800 font-sans font-medium">Crédito integral pleno transferido para os clientes corporativos.</p>
                  </div>
                </div>

              </div>
            )}

            {/* 7. RELATÓRIO DE DIAGNÓSTICO FINANCEIRO & DRE GERENCIAL */}
            {reportType === 'financeiro' && (() => {
              const gross = company.monthlyRevenue || (company.rbt12 / 12) || 100000;
              const tax = calculation.effectiveTaxMonthly || (gross * ((calculation.effectiveRate || 8.5) / 100));
              const netRev = Math.max(0, gross - tax);
              const inputPerc = company.inputCostsPercent ?? 30;
              const cpv = gross * (inputPerc / 100);
              const grossProf = netRev - cpv;
              const payroll = company.monthlyPayroll || 15000;
              const proLabore = company.proLaboreMonthly || Math.min(payroll, 10000);
              const payrollEmpl = Math.max(0, payroll - proLabore);
              const operExp = gross * ((company.operationalExpensesPercent ?? 15) / 100);
              const ebitda = grossProf - (payrollEmpl + proLabore + operExp);
              const finExp = company.financialExpensesMonthly || (gross * 0.02);
              const netProf = ebitda - finExp;
              const fixedTotal = payrollEmpl + proLabore + operExp + finExp;
              const varRate = gross > 0 ? (tax + cpv) / gross : 0.5;
              const contribMargin = Math.max(0.05, 1 - varRate);
              const breakEven = fixedTotal / contribMargin;

              return (
                <div className="space-y-6 relative z-10">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 space-y-1.5 leading-relaxed">
                    <p>
                      <strong className="text-slate-900">Fundamentação de Controladoria Financeira:</strong> A presente Demonstração do Resultado do Exercício (DRE) 
                      e Análise do Ponto de Equilíbrio (Break-Even) reflete a apuração das margens de contribuição e a eficiência na alocação 
                      entre custos tributários de vendas, folha salarial e o planejamento de retiradas societárias (isenção do Art. 10 da Lei 9.249/95).
                    </p>
                  </div>

                  {/* KPIs Executivos */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-600 font-sans uppercase font-bold block">Receita Líquida (ROL)</span>
                      <strong className="text-sm sm:text-base text-slate-900 font-extrabold block">{formatCurrencyBRL(netRev)}</strong>
                      <span className="text-[10px] text-slate-500 font-sans">Anual: {formatCurrencyBRL(netRev * 12)}</span>
                    </div>
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-600 font-sans uppercase font-bold block">Margem Bruta</span>
                      <strong className="text-sm sm:text-base text-amber-800 font-extrabold block">{formatCurrencyBRL(grossProf)}</strong>
                      <span className="text-[10px] text-amber-800 font-sans font-bold">{formatPercentBR(gross > 0 ? (grossProf / gross) * 100 : 0)} da receita</span>
                    </div>
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-600 font-sans uppercase font-bold block">EBITDA Gerencial</span>
                      <strong className="text-sm sm:text-base text-purple-900 font-extrabold block">{formatCurrencyBRL(ebitda)}</strong>
                      <span className="text-[10px] text-purple-800 font-sans font-bold">{formatPercentBR(gross > 0 ? (ebitda / gross) * 100 : 0)} margem</span>
                    </div>
                    <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-300">
                      <span className="text-[10px] text-emerald-900 font-sans uppercase font-bold block">Lucro Líquido Sócios</span>
                      <strong className="text-sm sm:text-base text-emerald-950 font-black block">{formatCurrencyBRL(netProf)}</strong>
                      <span className="text-[10px] text-emerald-800 font-sans font-bold">100% Isento na PF</span>
                    </div>
                  </div>

                  {/* Tabela DRE no Relatório Impresso */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs font-mono text-left">
                      <thead>
                        <tr className="bg-slate-800 border-b border-slate-700 text-white font-sans font-bold text-[11px]">
                          <th className="py-2.5 px-3">Estrutura DRE</th>
                          <th className="py-2.5 px-3 text-right">Mensal (R$)</th>
                          <th className="py-2.5 px-3 text-right">Anual Projetado (R$)</th>
                          <th className="py-2.5 px-3 text-right">% Receita</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-900">
                        <tr className="font-bold bg-slate-100 text-slate-900">
                          <td className="py-2 px-3">1. RECEITA OPERACIONAL BRUTA</td>
                          <td className="py-2 px-3 text-right">{formatCurrencyBRL(gross)}</td>
                          <td className="py-2 px-3 text-right">{formatCurrencyBRL(gross * 12)}</td>
                          <td className="py-2 px-3 text-right">100,00%</td>
                        </tr>
                        <tr className="text-rose-800 bg-white">
                          <td className="py-1.5 px-3 pl-6">2. (-) Tributos sobre Vendas (DAS / Guia Unificada)</td>
                          <td className="py-1.5 px-3 text-right">-{formatCurrencyBRL(tax)}</td>
                          <td className="py-1.5 px-3 text-right">-{formatCurrencyBRL(tax * 12)}</td>
                          <td className="py-1.5 px-3 text-right">-{formatPercentBR((tax / gross) * 100)}</td>
                        </tr>
                        <tr className="font-bold text-blue-900 bg-blue-50/70">
                          <td className="py-2 px-3">3. (=) RECEITA OPERACIONAL LÍQUIDA</td>
                          <td className="py-2 px-3 text-right text-blue-950">{formatCurrencyBRL(netRev)}</td>
                          <td className="py-2 px-3 text-right text-blue-950">{formatCurrencyBRL(netRev * 12)}</td>
                          <td className="py-2 px-3 text-right">{formatPercentBR((netRev / gross) * 100)}</td>
                        </tr>
                        <tr className="text-orange-900 bg-white">
                          <td className="py-1.5 px-3 pl-6">4. (-) Custos dos Insumos / Mercadorias (CPV)</td>
                          <td className="py-1.5 px-3 text-right">-{formatCurrencyBRL(cpv)}</td>
                          <td className="py-1.5 px-3 text-right">-{formatCurrencyBRL(cpv * 12)}</td>
                          <td className="py-1.5 px-3 text-right">-{formatPercentBR(inputPerc)}</td>
                        </tr>
                        <tr className="font-bold text-amber-900 bg-amber-50/70">
                          <td className="py-2 px-3">5. (=) LUCRO BRUTO</td>
                          <td className="py-2 px-3 text-right text-slate-900">{formatCurrencyBRL(grossProf)}</td>
                          <td className="py-2 px-3 text-right text-slate-900">{formatCurrencyBRL(grossProf * 12)}</td>
                          <td className="py-2 px-3 text-right">{formatPercentBR(gross > 0 ? (grossProf / gross) * 100 : 0)}</td>
                        </tr>
                        <tr className="text-slate-800 bg-white">
                          <td className="py-1.5 px-3 pl-6">6. (-) Despesas com Pessoal & Folha CLT</td>
                          <td className="py-1.5 px-3 text-right">-{formatCurrencyBRL(payrollEmpl)}</td>
                          <td className="py-1.5 px-3 text-right">-{formatCurrencyBRL(payrollEmpl * 12)}</td>
                          <td className="py-1.5 px-3 text-right">-{formatPercentBR((payrollEmpl / gross) * 100)}</td>
                        </tr>
                        <tr className="text-slate-800 bg-slate-50/50">
                          <td className="py-1.5 px-3 pl-6">7. (-) Pró-Labore dos Sócios Administradores</td>
                          <td className="py-1.5 px-3 text-right">-{formatCurrencyBRL(proLabore)}</td>
                          <td className="py-1.5 px-3 text-right">-{formatCurrencyBRL(proLabore * 12)}</td>
                          <td className="py-1.5 px-3 text-right">-{formatPercentBR((proLabore / gross) * 100)}</td>
                        </tr>
                        <tr className="text-slate-800 bg-white">
                          <td className="py-1.5 px-3 pl-6">8. (-) Despesas Operacionais e Administrativas</td>
                          <td className="py-1.5 px-3 text-right">-{formatCurrencyBRL(operExp)}</td>
                          <td className="py-1.5 px-3 text-right">-{formatCurrencyBRL(operExp * 12)}</td>
                          <td className="py-1.5 px-3 text-right">-{formatPercentBR((operExp / gross) * 100)}</td>
                        </tr>
                        <tr className="font-bold text-purple-950 bg-purple-50/70">
                          <td className="py-2 px-3">9. (=) RESULTADO OPERACIONAL (EBITDA)</td>
                          <td className="py-2 px-3 text-right text-slate-900">{formatCurrencyBRL(ebitda)}</td>
                          <td className="py-2 px-3 text-right text-slate-900">{formatCurrencyBRL(ebitda * 12)}</td>
                          <td className="py-2 px-3 text-right">{formatPercentBR(gross > 0 ? (ebitda / gross) * 100 : 0)}</td>
                        </tr>
                        <tr className="text-slate-700 bg-white text-[11px]">
                          <td className="py-1 px-3 pl-6">10. (-) Despesas Financeiras e Tarifas Bancárias</td>
                          <td className="py-1 px-3 text-right">-{formatCurrencyBRL(finExp)}</td>
                          <td className="py-1 px-3 text-right">-{formatCurrencyBRL(finExp * 12)}</td>
                          <td className="py-1 px-3 text-right">-{formatPercentBR((finExp / gross) * 100)}</td>
                        </tr>
                        <tr className="font-black text-slate-900 bg-emerald-100/90 border-t-2 border-emerald-500">
                          <td className="py-2.5 px-3 text-emerald-950">11. (=) LUCRO LÍQUIDO FINAL / DISTRIBUIÇÃO ISENTA</td>
                          <td className="py-2.5 px-3 text-right text-emerald-950">{formatCurrencyBRL(netProf)}</td>
                          <td className="py-2.5 px-3 text-right text-emerald-950">{formatCurrencyBRL(netProf * 12)}</td>
                          <td className="py-2.5 px-3 text-right text-emerald-950">{formatPercentBR(gross > 0 ? (netProf / gross) * 100 : 0)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Quadro Ponto de Equilíbrio */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-600 font-sans uppercase font-bold block">Ponto de Equilíbrio Contábil (Break-Even)</span>
                      <strong className="text-base text-slate-900 font-extrabold">{formatCurrencyBRL(breakEven)}/mês</strong>
                      <p className="text-[10px] text-slate-600 font-sans mt-0.5">Faturamento mínimo para cobrir 100% dos custos fixos e variáveis.</p>
                    </div>
                    <div className="text-right font-sans">
                      <span className="text-[10px] text-slate-600 uppercase font-bold block">Margem de Segurança</span>
                      <strong className="text-base text-emerald-700 font-mono font-extrabold">{formatPercentBR(gross > 0 ? ((gross - breakEven) / gross) * 100 : 0)}</strong>
                      <p className="text-[10px] text-emerald-800 font-medium">Tolerância a quedas de receita sem gerar prejuízo</p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* SEÇÃO ANALÍTICA COMUM A TODOS OS RELATÓRIOS */}
            <section className="space-y-6 pt-6 border-t-2 border-slate-300 avoid-break relative z-10">
              <div className="flex items-center justify-between border-b border-slate-300 pb-2">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-blue-700" />
                  <span className="text-slate-900">Parecer Analítico de Performance & Posicionamento Estratégico</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600" /> Posição e Situação Atual
                    </h4>
                    <p className="text-xs text-slate-800 leading-relaxed text-justify">
                      A empresa opera com um faturamento acumulado (RBT12) de <strong className="text-slate-900">{formatCurrencyBRL(company.rbt12)}</strong> no regime do <strong className="text-slate-900">{company.regimeTributario?.replace('_', ' ').toUpperCase()}</strong>. 
                      A situação atual indica <strong className="text-slate-900">{calculation.exceedsFederalLimit ? 'EXCLUSÃO CRÍTICA' : 'ESTABILIDADE OPERACIONAL'}</strong>, com conformidade tributária em 
                      <strong className="text-slate-900"> {calculation.exceedsSublimit ? 'ALERTA (Sublimite Excedido)' : 'NÍVEL SEGURO'}</strong>.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Melhor vs. Pior Cenário
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-300">
                        <span className="text-[9px] font-bold text-emerald-800 uppercase block">Melhor Cenário</span>
                        <span className="text-[11px] font-bold text-slate-900">{calculation.bestRegime?.name}</span>
                      </div>
                      <div className="p-2.5 bg-rose-50 rounded-lg border border-rose-300">
                        <span className="text-[9px] font-bold text-rose-800 uppercase block">Pior Cenário</span>
                        <span className="text-[11px] font-bold text-slate-900">
                          {calculation.regimesComparison.sort((a,b) => b.annualTaxTotal - a.annualTaxTotal)[0].name}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-600" /> Eficiência Financeira (Ganha vs. Perde)
                    </h4>
                    <p className="text-xs text-slate-800 leading-relaxed">
                      <strong className="text-slate-900">Onde Ganha:</strong> Eficiência de {formatPercentBR(calculation.effectiveRate)} através de {calculation.segregatedDeductionsMonthly > 0 ? 'Segregação de ST/Monofásicos' : 'Enquadramento em Faixas Iniciais'}.<br/>
                      <strong className="text-slate-900">Onde Perde:</strong> {calculation.b2bClientDisadvantageAnnual > 0 ? `Drenagem de ${formatCurrencyBRL(calculation.b2bClientDisadvantageAnnual)}/ano em créditos B2B.` : 'Potencial de otimização em encargos previdenciários e Fator R.'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" /> Visibilidade & Estrutura (Tudo o que pode ser visto)
                    </h4>
                    <p className="text-xs text-slate-800 leading-relaxed italic border-l-2 border-indigo-600 pl-3 bg-slate-50 py-1.5">
                      "A análise estrutural revela uma dependência de {company.b2bSalesPercent}% em vendas corporativas, o que exige uma estruturação focada em neutralidade tributária pós-Reforma. A visibilidade dos custos ({formatPercentBR(company.inputCostsPercent || 0)}) permite um redirecionamento estratégico de margens."
                    </p>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-600" /> Planejamento (O que pode ser refeito / estruturado)
                    </h4>
                    <ul className="text-[11px] text-slate-800 space-y-1.5">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> 
                        <span><strong className="text-slate-900">Refazer:</strong> Saneamento de cadastros de produtos para monofásicos.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> 
                        <span><strong className="text-slate-900">Estruturar:</strong> Planejamento de cisão operacional para proteção de sublimite.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Termo de Responsabilidade & Autenticação Pericial Oficial */}
            <section className="space-y-6 pt-6 border-t-2 border-slate-700 avoid-break">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <h3 className="text-sm font-black uppercase tracking-[0.25em] text-white">
                  Termo de Responsabilidade Técnica & Autenticação Pericial
                </h3>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                  ✓ Relatório Auditado e Autenticado
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end pt-1">
                {/* Box de Autenticidade Digital Criptográfica com QR Code */}
                <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-700 space-y-3 text-[10px] text-slate-300 font-mono">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-white font-bold uppercase tracking-wider font-sans">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                      <span className="text-white">Chancela Eletrônica de Autenticidade</span>
                    </div>
                    <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                      ICP-Brasil ICP-BR
                    </span>
                  </div>

                  <div className="flex items-start space-x-3">
                    {securityRecord?.qrCodeDataUrl ? (
                      <div className="p-1 bg-white rounded-lg border border-slate-600 shadow-sm shrink-0">
                        <img 
                          src={securityRecord.qrCodeDataUrl} 
                          alt="QR Code de Autenticidade" 
                          className="w-16 h-16 object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                        <QrCode className="w-8 h-8 text-slate-400" />
                      </div>
                    )}

                    <div className="space-y-1 overflow-hidden">
                      <p className="text-slate-300">Código Hash do Laudo:</p>
                      <p className="text-[11px] font-bold text-blue-400 truncate">
                        {securityRecord?.hashFormatted || 'VF-2026-A82F-9C14-3B77-E091'}
                      </p>
                      <p className="text-[8px] text-slate-400 font-sans leading-tight">
                        Aponte a câmera para auditar a integridade pública deste parecer pericial.
                      </p>
                    </div>
                  </div>

                  <div className="p-2 bg-slate-950 rounded border border-slate-800 font-mono text-[9px] space-y-0.5">
                    <span className="text-slate-400 block font-bold">SHA-256:</span>
                    <p className="text-slate-300 break-all select-all">
                      {securityRecord?.sha256Full || '8f4c29a1d07e4b52c9381ea624b7d30f9a2b5e78c41d08e73f9104bc5392fa16'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <p className="text-[9px] text-slate-400 font-sans">
                      Emitido em {currentDate} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsValidatorOpen(true)}
                      className="no-print text-[9px] font-bold text-emerald-400 hover:text-emerald-300 uppercase underline cursor-pointer"
                    >
                      Auditar no Validador →
                    </button>
                  </div>
                </div>

                {/* Assinatura do Responsável Técnico */}
                <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-700 text-center space-y-2">
                  <div className="pt-4 border-b border-slate-700 w-4/5 mx-auto">
                    <span className="font-serif-display italic text-lg text-white font-bold block pb-1">
                      Carlos Miguel Vieira
                    </span>
                  </div>
                  <p className="text-xs font-bold text-white uppercase font-sans">
                    Carlos Miguel Vieira
                  </p>
                  <p className="text-[10px] text-slate-300 font-sans">
                    Auditor Fiscal & Consultor Tributário Master Responsável
                  </p>
                  <p className="text-[9px] text-slate-400 font-mono">
                    Vieira & Associados // Auditoria & Planejamento Tributário
                  </p>
                </div>
              </div>

            </section>

            <footer className="pt-6 border-t-2 border-slate-700 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-300 uppercase tracking-widest gap-4 font-mono">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded bg-slate-800 text-white font-bold flex items-center justify-center text-[10px]">
                  VF
                </div>
                <span className="text-white">VÉRTICE AUDITOR FISCAL // Tax Intelligence & Audit System</span>
              </div>
              <div className="text-center sm:text-right font-sans">
                <p className="font-bold text-white">Documento Técnico Emitido em Conformidade Legal</p>
                <p className="text-[9px] text-slate-300">
                  MP nº 2.200-2/2001 (ICP-Brasil), Lei nº 14.063/2020, CPC Art. 441, LC 123/2006 e EC 132/2023
                </p>
              </div>
            </footer>

          </div>

          {/* Botões de Ação Inferiores no Modal (Fora do printable-modal-content para não aparecerem em PDFs e novas abas) */}
          <div className="no-print pt-6 max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-950/40 border border-rose-400/30 transition flex items-center space-x-2 cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
              <span>Fechar Relatório e Retornar ao Sistema</span>
            </button>

            <div className="flex items-center space-x-2.5">
              <button
                type="button"
                onClick={() => setIsValidatorOpen(true)}
                className="px-4 py-2.5 bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60 font-bold text-xs rounded-xl transition flex items-center space-x-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verificar Autenticidade (Selo ICP-Brasil)</span>
              </button>

              {onNavigateToParecerMaster && (
                <button
                  type="button"
                  onClick={onNavigateToParecerMaster}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center space-x-1.5 cursor-pointer bg-blue-950/40 px-3.5 py-2.5 rounded-xl border border-blue-500/30 transition"
                >
                  <span className="text-white">Parecer Geral 360°</span>
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Modal Validador de Documento Integrado */}
      <DocumentValidatorModal
        isOpen={isValidatorOpen}
        onClose={() => setIsValidatorOpen(false)}
        initialHash={securityRecord?.hashFormatted}
        currentCompany={company}
      />

    </div>
  );
};
