import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Download,
  ExternalLink,
  Loader2,
  AlertTriangle,
  Check,
  Eye,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';
import { CompanyData, CalculationResult } from '../types';
import { TechnicalReportContent } from './TechnicalReportContent';
import { 
  exportElementToPDF, 
  generateStandalonePrintHtml, 
  downloadFile, 
  openStandalonePrintWindow 
} from '../utils/reportExporter';
import { BrandLogo } from './BrandLogo';
import { DocumentValidatorModal } from './DocumentValidatorModal';

interface TechnicalReportProps {
  company: CompanyData;
  calculation: CalculationResult;
  onPrint: () => void;
  onBack?: () => void;
}

export const TechnicalReport: React.FC<TechnicalReportProps> = ({
  company,
  calculation,
  onPrint,
  onBack,
}) => {
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportProgress, setExportProgress] = useState('');
  const [exportMessage, setExportMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [isValidatorOpen, setIsValidatorOpen] = useState(false);

  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // Baixar PDF real (.pdf de alta definição gerado no cliente)
  const handleDownloadPdf = async () => {
    try {
      setIsExportingPdf(true);
      setExportMessage(null);
      const filename = `Parecer_Tecnico_${(company.name || 'Empresa').replace(/[^a-zA-Z0-9]/g, '_')}_2026.pdf`;
      const targetId = 'technical-report-page';
      const result = await exportElementToPDF(targetId, filename, (msg) => {
        setExportProgress(msg);
      });

      if (result.success) {
        setExportMessage({ type: 'success', text: 'PDF gerado e baixado com sucesso!' });
      } else {
        setExportMessage({ type: 'error', text: result.error || 'Falha na geração do PDF.' });
      }
    } catch (err: any) {
      setExportMessage({ type: 'error', text: err?.message || 'Erro ao gerar o arquivo PDF.' });
    } finally {
      setIsExportingPdf(false);
      setExportProgress('');
      setTimeout(() => setExportMessage(null), 6000);
    }
  };

  // Abrir o relatório em nova aba autônoma para impressão livre de iframe
  const handleOpenStandaloneTab = () => {
    const reportElement = document.getElementById('technical-report-page');
    if (!reportElement) return;
    openStandalonePrintWindow(`Parecer Técnico - ${company.name || 'Empresa'}`, reportElement.innerHTML);
    setExportMessage({ 
      type: 'info', 
      text: 'O relatório foi aberto em nova janela com visualização A4 e comando de impressão pronto!' 
    });
    setTimeout(() => setExportMessage(null), 6000);
  };

  // Baixar documento HTML A4 portátil
  const handleDownloadHtmlFile = () => {
    const reportElement = document.getElementById('technical-report-page');
    if (!reportElement) return;
    const standaloneHtml = generateStandalonePrintHtml(`Parecer Técnico - ${company.name || 'Empresa'}`, reportElement.innerHTML);
    downloadFile(`Parecer_Tecnico_${(company.name || 'empresa').replace(/\s+/g, '_')}.html`, standaloneHtml);
    setExportMessage({ 
      type: 'success', 
      text: 'Arquivo autônomo A4 baixado! Abra-o em qualquer navegador para visualizar e imprimir.' 
    });
    setTimeout(() => setExportMessage(null), 6000);
  };

  // Impressão nativa com verificação de iframe
  const handlePrintAction = () => {
    const isInsideIframe = window.self !== window.top;
    try {
      window.print();
      if (isInsideIframe) {
        setExportMessage({
          type: 'info',
          text: 'Comando de impressão enviado. Caso seu navegador restrinja a janela em iframes, use o botão "Baixar PDF Oficial" ou "Abrir em Nova Aba"!'
        });
      }
    } catch (e) {
      // Fallback automático se bloqueado
      handleOpenStandaloneTab();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar (No-Print) */}
      <div className="no-print p-4 bg-[#0F172A] rounded-2xl border border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/60 uppercase tracking-widest">
                  Documento Oficial
                </span>
                <span className="text-xs text-slate-400 font-mono">{currentDate}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider mt-0.5">
                Parecer Técnico & Auditoria Tributária 360°
              </h3>
              <p className="text-xs text-slate-400">
                Documento estruturado com gráficos comparativos para emissão oficial em PDF e apresentação a sócios e diretoria.
              </p>
            </div>
          </div>

          {/* Botões de Ação Multifuncionais */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Botão Retornar ao Sistema se fornecido */}
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs uppercase tracking-wider border border-slate-700 transition cursor-pointer shadow-xs"
                title="Retornar à tela principal do simulador"
              >
                <ArrowLeft className="w-4 h-4 text-blue-400" />
                <span>Voltar ao Sistema</span>
              </button>
            )}

            {/* Botão Primário: Gerar e Baixar PDF Real (.pdf) */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-xs ${
                isExportingPdf 
                  ? 'bg-blue-300 text-white cursor-not-allowed opacity-80' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
              }`}
              title="Gera e faz o download direto do arquivo .PDF oficial formatado em A4"
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

            {/* Botão Validador Oficial */}
            <button
              type="button"
              onClick={() => setIsValidatorOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 font-bold text-xs border border-emerald-800/60 transition cursor-pointer shadow-xs"
              title="Validar autenticidade jurídica deste laudo (Selo ICP-Brasil e Hash)"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Validar Laudo</span>
            </button>

            {/* Botão Pré-visualizar Parecer */}
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition cursor-pointer shadow-xs"
              title="Pré-visualizar o parecer em formato A4 real antes de imprimir"
            >
              <Eye className="w-4 h-4 text-sky-400" />
              <span>Pré-visualizar</span>
            </button>

            {/* Botão Imprimir Nativo */}
            <button
              type="button"
              onClick={handlePrintAction}
              className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition cursor-pointer shadow-xs"
              title="Abre a janela de impressão do seu navegador (Ctrl+P / Salvar como PDF)"
            >
              <Printer className="w-4 h-4 text-blue-400" />
              <span>Imprimir</span>
            </button>

            {/* Botão Abrir em Nova Aba (bypassa qualquer bloqueio de iframe) */}
            <button
              type="button"
              onClick={handleOpenStandaloneTab}
              className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 font-bold text-xs border border-emerald-800/60 transition cursor-pointer shadow-xs"
              title="Abre o parecer em tela cheia fora do iframe do sistema para impressão livre"
            >
              <ExternalLink className="w-4 h-4 text-emerald-400" />
              <span>Nova Aba</span>
            </button>

            {/* Botão Baixar HTML Autônomo */}
            <button
              type="button"
              onClick={handleDownloadHtmlFile}
              className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition cursor-pointer shadow-xs"
              title="Baixar arquivo portátil (.HTML) com layout A4 completo para abrir offline"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Baixar HTML</span>
            </button>
          </div>
        </div>

        {/* Mensagem de Feedback de Exportação */}
        {exportMessage && (
          <div className={`p-3 rounded-xl text-xs flex items-center justify-between border transition-all ${
            exportMessage.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300'
              : exportMessage.type === 'error'
              ? 'bg-red-950/60 border-red-800/60 text-red-300'
              : 'bg-blue-950/60 border-blue-800/60 text-blue-300'
          }`}>
            <div className="flex items-center space-x-2">
              {exportMessage.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : exportMessage.type === 'error' ? (
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              ) : (
                <FileText className="w-4 h-4 text-blue-400 shrink-0" />
              )}
              <span>{exportMessage.text}</span>
            </div>
            <button 
              onClick={() => setExportMessage(null)}
              className="text-slate-400 hover:text-slate-200 text-xs px-2 py-0.5 rounded ml-2"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* The Printable A4 Report Card */}
      <div 
        id="technical-report-page"
        className="print-mode bg-white text-slate-900 p-8 sm:p-14 rounded-3xl shadow-xl border-t-[10px] border-slate-900 max-w-4xl mx-auto space-y-12"
      >
        <TechnicalReportContent company={company} calculation={calculation} />
      </div>

      {/* A4 High-Fidelity Print Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 h-screen w-screen overflow-hidden z-50 flex flex-col bg-slate-950/95 backdrop-blur-md animate-fade-in font-sans">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900 shadow-md">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-sky-500/10 rounded-lg text-sky-400 border border-sky-500/20">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                  Pré-visualização do Parecer Técnico (A4)
                </h3>
                <p className="text-xs text-slate-400">
                  Verifique a legibilidade, margens e cores dos gráficos em alta definição antes de enviar para impressão.
                </p>
              </div>
            </div>

            {/* Top Toolbar Actions */}
            <div className="flex items-center space-x-4">
              {/* Zoom Controls */}
              <div className="flex items-center bg-slate-800/80 border border-slate-700/60 rounded-lg px-2.5 py-1 text-xs">
                <span className="text-slate-400 mr-2 font-semibold">Zoom:</span>
                <button 
                  type="button"
                  onClick={() => setZoom(prev => Math.max(50, prev - 10))}
                  className="px-2 py-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded font-bold cursor-pointer"
                  title="Diminuir Zoom"
                >
                  -
                </button>
                <span className="px-2 font-mono text-slate-100 font-bold w-12 text-center">{zoom}%</span>
                <button 
                  type="button"
                  onClick={() => setZoom(prev => Math.min(150, prev + 10))}
                  className="px-2 py-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded font-bold cursor-pointer"
                  title="Aumentar Zoom"
                >
                  +
                </button>
              </div>

              {/* Action Buttons */}
              <button
                type="button"
                onClick={handlePrintAction}
                className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition cursor-pointer"
              >
                <Printer className="w-4 h-4 text-white" />
                <span>Imprimir Agora</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isExportingPdf}
                className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition cursor-pointer animate-none"
              >
                {isExportingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>{exportProgress || 'Gerando...'}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-white" />
                    <span>Baixar PDF</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-lg border border-slate-700 transition cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>

          {/* Paper View Container */}
          <div className="flex-1 overflow-y-auto p-8 bg-[#0B0F19] flex justify-center items-start">
            <div 
              id="technical-report-preview-sheet"
              className="print-mode bg-white text-slate-900 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] max-w-[210mm] w-full min-h-[297mm] rounded-xs border border-slate-200 transition-all duration-300 origin-top"
              style={{ 
                transform: `scale(${zoom / 100})`,
                marginBottom: `${(zoom - 100) * 2}px`
              }}
            >
              {/* Simulate Real Printable Padding and Layout */}
              <div className="p-8 sm:p-14 space-y-12 leading-relaxed">
                <TechnicalReportContent company={company} calculation={calculation} />
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal Validador de Documentos */}
      <DocumentValidatorModal
        isOpen={isValidatorOpen}
        onClose={() => setIsValidatorOpen(false)}
        currentCompany={company}
      />
    </div>
  );
};
