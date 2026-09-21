import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  ExternalLink, 
  Loader2, 
  Check, 
  X, 
  Copy, 
  Sparkles, 
  ZoomIn, 
  ZoomOut,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Columns,
  Rows
} from 'lucide-react';
import { CompanyData, CalculationResult } from '../../types';
import { SimplesHibridoResult } from '../../utils/simplesHibridoEngine';
import { SimplesHibridoReportContent } from './SimplesHibridoReportContent';
import { 
  exportElementToPDF, 
  generateStandalonePrintHtml, 
  downloadFile, 
  openStandalonePrintWindow 
} from '../../utils/reportExporter';

export type SimplesHibridoReportMode = 
  | 'parecer_unificado' 
  | 'relatorio_cockpit' 
  | 'relatorio_graficos' 
  | 'relatorio_cenarios' 
  | 'relatorio_partilha';

interface SimplesHibridoReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyData;
  calculation: CalculationResult;
  comparisonResult: SimplesHibridoResult;
  initialReportMode?: SimplesHibridoReportMode;
}

export const SimplesHibridoReportModal: React.FC<SimplesHibridoReportModalProps> = ({
  isOpen,
  onClose,
  company,
  calculation,
  comparisonResult,
  initialReportMode = 'parecer_unificado',
}) => {
  const [reportMode, setReportMode] = useState<SimplesHibridoReportMode>(initialReportMode);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportProgress, setExportProgress] = useState('');
  const [exportMessage, setExportMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [zoom, setZoom] = useState(100);
  const [copiedToast, setCopiedToast] = useState(false);
  const [viewLayout, setViewLayout] = useState<'vertical' | 'horizontal'>('vertical');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sincronizar modo de relatório quando prop muda ao abrir
  React.useEffect(() => {
    if (initialReportMode) {
      setReportMode(initialReportMode);
    }
  }, [initialReportMode, isOpen]);

  if (!isOpen) return null;

  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // Baixar PDF Oficial (.pdf em alta definição A4)
  const handleDownloadPdf = async () => {
    try {
      setIsExportingPdf(true);
      setExportMessage(null);
      const safeCompanyName = (company.name || 'Empresa').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `Parecer_Tecnico_Simples_Hibrido_${safeCompanyName}_2026.pdf`;
      const targetId = 'simples-hibrido-report-page';
      
      const result = await exportElementToPDF(targetId, filename, (msg) => {
        setExportProgress(msg);
      });

      if (result.success) {
        setExportMessage({ type: 'success', text: 'PDF oficial do Parecer Técnico gerado e baixado com sucesso!' });
      } else {
        setExportMessage({ type: 'error', text: result.error || 'Falha ao processar o arquivo PDF.' });
      }
    } catch (err: any) {
      setExportMessage({ type: 'error', text: err?.message || 'Erro inesperado na geração do PDF.' });
    } finally {
      setIsExportingPdf(false);
      setExportProgress('');
      setTimeout(() => setExportMessage(null), 6000);
    }
  };

  // Abrir em nova aba autônoma para impressão sem restrição de iframe
  const handleOpenStandaloneTab = () => {
    const reportElement = document.getElementById('simples-hibrido-report-page');
    if (!reportElement) return;
    openStandalonePrintWindow(`Parecer Técnico Simples Híbrido - ${company.name || 'Empresa'}`, reportElement.innerHTML);
    setExportMessage({ 
      type: 'info', 
      text: 'O Parecer Técnico foi aberto em nova janela com visualização A4 e comando de impressão pronto!' 
    });
    setTimeout(() => setExportMessage(null), 6000);
  };

  // Baixar documento HTML A4 portátil
  const handleDownloadHtmlFile = () => {
    const reportElement = document.getElementById('simples-hibrido-report-page');
    if (!reportElement) return;
    const standaloneHtml = generateStandalonePrintHtml(
      `Parecer Técnico Simples Híbrido - ${company.name || 'Empresa'}`, 
      reportElement.innerHTML
    );
    const safeCompanyName = (company.name || 'Empresa').replace(/\s+/g, '_');
    downloadFile(`Parecer_Simples_Hibrido_${safeCompanyName}.html`, standaloneHtml);
    setExportMessage({ 
      type: 'success', 
      text: 'Arquivo autônomo A4 baixado! Pode ser aberto e impresso em qualquer navegador offline.' 
    });
    setTimeout(() => setExportMessage(null), 6000);
  };

  // Impressão nativa
  const handlePrintAction = () => {
    const isInsideIframe = window.self !== window.top;
    try {
      window.print();
      if (isInsideIframe) {
        setExportMessage({
          type: 'info',
          text: 'Comando de impressão enviado. Caso seu navegador restrinja a janela em iframes, use "Baixar PDF Oficial" ou "Abrir em Nova Aba"!'
        });
      }
    } catch (e) {
      handleOpenStandaloneTab();
    }
  };

  // Copiar Parecer Formatado
  const handleCopyOpinion = () => {
    const text = comparisonResult.technicalOpinion.rawFormattedMarkdown;
    navigator.clipboard.writeText(text);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 3000);
  };

  return (
    <div className={`fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-1 sm:p-3 overflow-y-auto ${isFullscreen ? 'p-0' : ''}`}>
      <div className={`bg-[#0B0F19] border border-slate-700 rounded-2xl w-full flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${
        isFullscreen ? 'h-screen max-w-none rounded-none' : 'max-w-[98vw] 2xl:max-w-7xl max-h-[96vh]'
      }`}>
        
        {/* BARRA SUPERIOR DE AÇÕES (NO-PRINT) */}
        <div className="no-print p-3.5 bg-[#0F172A] border-b border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Dossiê Pericial de Viabilidade • Simples Híbrido
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Pronto para Emissão
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {company.name || 'Empresa'} • CNPJ: {company.cnpj || 'Não informado'} • EC 132/23 & LC 214/25
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Seletor de Layout: Vertical vs Horizontal Panorâmico */}
            <div className="hidden md:flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700">
              <button
                onClick={() => setViewLayout('vertical')}
                className={`px-2.5 py-1 text-xs font-semibold rounded flex items-center gap-1.5 transition-all ${
                  viewLayout === 'vertical' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Modo Vertical (Página por Página A4)"
              >
                <Rows className="w-3.5 h-3.5" />
                <span>Página A4</span>
              </button>
              <button
                onClick={() => setViewLayout('horizontal')}
                className={`px-2.5 py-1 text-xs font-semibold rounded flex items-center gap-1.5 transition-all ${
                  viewLayout === 'horizontal' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Modo Horizontal Panorâmico (Widescreen Tela Toda)"
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Panorâmico Horizontal</span>
              </button>
            </div>

            {/* Controle de Zoom */}
            <div className="hidden sm:flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700 text-slate-300">
              <button 
                onClick={() => setZoom(Math.max(60, zoom - 10))}
                className="p-1 hover:text-white hover:bg-slate-700 rounded transition-colors"
                title="Diminuir Zoom"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono px-1.5 min-w-[40px] text-center">{zoom}%</span>
              <button 
                onClick={() => setZoom(Math.min(150, zoom + 10))}
                className="p-1 hover:text-white hover:bg-slate-700 rounded transition-colors"
                title="Aumentar Zoom"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Alternador de Tela Cheia */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-colors"
              title={isFullscreen ? 'Sair da Tela Cheia' : 'Modo Tela Cheia'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Copiar Parecer */}
            <button
              onClick={handleCopyOpinion}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
              title="Copiar Parecer Técnico em Texto Markdown"
            >
              {copiedToast ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedToast ? 'Copiado!' : 'Copiar Texto'}</span>
            </button>

            {/* Baixar HTML Autônomo */}
            <button
              onClick={handleDownloadHtmlFile}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
              title="Baixar Arquivo HTML Autônomo A4"
            >
              <Download className="w-3.5 h-3.5 text-slate-300" />
              <span>HTML A4</span>
            </button>

            {/* Abrir Nova Aba / Imprimir */}
            <button
              onClick={handlePrintAction}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-400" />
              <span>Imprimir</span>
            </button>

            {/* BOTÃO PRINCIPAL: BAIXAR PDF OFICIAL A4 */}
            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold rounded-lg shadow-lg shadow-emerald-950/40 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Gerando PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar PDF Oficial</span>
                </>
              )}
            </button>

            {/* Fechar */}
            <button
              onClick={onClose}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg border border-slate-700 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* BARRA DE SELEÇÃO DO TIPO DE RELATÓRIO (NO-PRINT) */}
        <div className="no-print bg-[#0B0F19] border-b border-slate-800 px-3.5 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            Relatório de Saída:
          </span>
          <button
            type="button"
            onClick={() => setReportMode('parecer_unificado')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              reportMode === 'parecer_unificado'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>Parecer Pericial Unificado (Master)</span>
          </button>

          <button
            type="button"
            onClick={() => setReportMode('relatorio_cockpit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              reportMode === 'relatorio_cockpit'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" />
            <span>1. Cockpit & Travas Fiscais</span>
          </button>

          <button
            type="button"
            onClick={() => setReportMode('relatorio_graficos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              reportMode === 'relatorio_graficos'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-indigo-300" />
            <span>2. Gráficos & Break-Even</span>
          </button>

          <button
            type="button"
            onClick={() => setReportMode('relatorio_cenarios')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              reportMode === 'relatorio_cenarios'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Columns className="w-3.5 h-3.5 text-indigo-300" />
            <span>3. Matriz de Cenários (Caixa vs B2B)</span>
          </button>

          <button
            type="button"
            onClick={() => setReportMode('relatorio_partilha')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              reportMode === 'relatorio_partilha'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Rows className="w-3.5 h-3.5 text-indigo-300" />
            <span>4. Decomposição do DAS (LC 123/06)</span>
          </button>
        </div>

        {/* FEEDBACK TOAST / PROGRESS BAR (NO-PRINT) */}
        {exportProgress && (
          <div className="no-print bg-indigo-950/90 border-b border-indigo-500/30 px-4 py-2 text-xs text-indigo-200 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-400 shrink-0" />
            <span>{exportProgress}</span>
          </div>
        )}

        {exportMessage && (
          <div className={`no-print px-4 py-2.5 text-xs flex items-center justify-between border-b ${
            exportMessage.type === 'success' 
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/30' 
              : exportMessage.type === 'error'
              ? 'bg-rose-950/90 text-rose-200 border-rose-500/30'
              : 'bg-blue-950/90 text-blue-200 border-blue-500/30'
          }`}>
            <span>{exportMessage.text}</span>
            <button onClick={() => setExportMessage(null)} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ÁREA DE VISUALIZAÇÃO E RENDERIZAÇÃO DO RELATÓRIO */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-[#030712] flex justify-center">
          <div 
            id="simples-hibrido-report-page" 
            className="w-full transition-all duration-200 origin-top"
            style={{ 
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              maxWidth: viewLayout === 'horizontal' ? '100%' : '980px',
            }}
          >
            <SimplesHibridoReportContent 
              company={company}
              calculation={calculation}
              comparisonResult={comparisonResult}
              viewLayout={viewLayout}
              reportMode={reportMode}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
