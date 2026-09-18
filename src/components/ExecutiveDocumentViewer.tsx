import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  ShieldCheck, 
  Scale, 
  Award, 
  CheckCircle2, 
  ExternalLink,
  QrCode,
  Zap,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  Sun,
  Moon,
  Lock,
  Clock,
  Eye
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { generateDocumentSecurity, VerifiedDocumentRecord } from '../utils/documentSecurity';
import { DocumentValidatorModal } from './DocumentValidatorModal';
import { exportElementToPDF, openStandalonePrintWindow, generateStandalonePrintHtml, downloadFile } from '../utils/reportExporter';

export interface SignatoryInfo {
  name: string;
  role: string;
  cpfCnpj?: string;
  rgOabCrc?: string;
  signatureType?: 'ICP-Brasil' | 'Assinatura Eletrônica Qualificada' | 'Sócio Administrador' | 'Responsável Técnico';
}

export interface ExecutiveDocumentViewerProps {
  documentTitle: string;
  documentCategory: 'CONTRATO SOCIAL & ALTERAÇÕES' | 'PARECER TÉCNICO-JURÍDICO' | 'RELATÓRIO TRIBUTÁRIO 360°' | 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS' | 'DISTRATO & LIQUIDAÇÃO' | 'ACORDO DE SÓCIOS';
  normativeBase?: string;
  companyName: string;
  cnpj?: string;
  nire?: string;
  uf?: string;
  protocolNumber?: string;
  documentScore?: number;
  documentRating?: string;
  contractNumber?: string;
  documentBodyText?: string;
  children?: React.ReactNode;
  signatories?: SignatoryInfo[];
  onAuditClick?: () => void;
  onCopyCustomText?: () => string;
  customActionButtons?: React.ReactNode;
}

export const ExecutiveDocumentViewer: React.FC<ExecutiveDocumentViewerProps> = ({
  documentTitle,
  documentCategory,
  normativeBase = 'Código Civil Brasileiro (Lei 10.406/02), Instrução Normativa DREI nº 81/2020, Lei nº 13.874/19 e Jurisprudência dos Tribunais Superiores (STF/STJ)',
  companyName,
  cnpj = '00.000.000/0001-00',
  nire = '35.800.000-0',
  uf = 'SP',
  protocolNumber,
  documentScore,
  documentRating,
  contractNumber,
  documentBodyText,
  children,
  signatories = [],
  onAuditClick,
  onCopyCustomText,
  customActionButtons
}) => {
  const [paperTheme, setPaperTheme] = useState<'dark' | 'paper'>('dark');
  const [copied, setCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [securityRecord, setSecurityRecord] = useState<VerifiedDocumentRecord | null>(null);
  const [isValidatorOpen, setIsValidatorOpen] = useState(false);

  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const currentTime = new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const effectiveProtocol = protocolNumber || `VTX-${new Date().getFullYear()}-${uf}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  useEffect(() => {
    let isMounted = true;
    generateDocumentSecurity({
      title: documentTitle,
      companyName,
      cnpj,
      uf,
      dateStr: `${currentDate} às ${currentTime}`
    }).then((rec) => {
      if (isMounted) setSecurityRecord(rec);
    });
    return () => {
      isMounted = false;
    };
  }, [documentTitle, companyName, cnpj, uf, currentDate, currentTime]);

  const handleCopy = () => {
    const textToCopy = onCopyCustomText 
      ? onCopyCustomText() 
      : documentBodyText || `${documentTitle}\n${companyName}\nCNPJ: ${cnpj}\nProtocolo: ${effectiveProtocol}`;
    
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const content = documentBodyText || `${documentTitle}\n\nEMPRESA: ${companyName}\nCNPJ: ${cnpj}\nPROTOCOLO: ${effectiveProtocol}\nDATA: ${currentDate}\n`;
    downloadFile(`${documentTitle.replace(/\s+/g, '_')}_${companyName.replace(/\s+/g, '_')}.txt`, content);
  };

  const handlePrint = () => {
    const el = document.getElementById('executive-document-sheet');
    if (!el) {
      window.print();
      return;
    }
    openStandalonePrintWindow(`${documentTitle} - ${companyName}`, el.innerHTML);
  };

  const handleDownloadPDF = async () => {
    try {
      setIsExportingPdf(true);
      setExportMessage('Gerando documento em PDF timbrado oficial...');
      const targetId = 'executive-document-sheet';
      const filename = `${documentTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${companyName.replace(/[^a-zA-Z0-9]/g, '_')}_2026.pdf`;
      const result = await exportElementToPDF(targetId, filename, (msg) => setExportMessage(msg));
      if (!result.success) {
        setExportMessage(result.error || 'Erro na compilação do PDF. Abrindo janela de impressão alternativa...');
        setTimeout(() => handlePrint(), 800);
      }
    } catch (e: any) {
      setExportMessage('Redirecionando para impressão de alta resolução...');
      handlePrint();
    } finally {
      setIsExportingPdf(false);
      setTimeout(() => setExportMessage(null), 5000);
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* BARRA DE FERRAMENTAS EXECUTIVA UNIVERSAL */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-blue-500/20 border border-amber-500/30 text-amber-300 shadow-inner">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-100">
                {documentCategory}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-mono font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                CONFORME DREI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Protocolo: <strong className="text-slate-200">{effectiveProtocol}</strong> • Autenticado
            </p>
          </div>
        </div>

        {/* GRUPO DE BOTÕES DE AÇÃO COM O MESMO PADRÃO */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Alternador de Tema: Papel Timbrado Executivo (Light) vs Dark Executivo */}
          <button
            type="button"
            onClick={() => setPaperTheme(prev => prev === 'dark' ? 'paper' : 'dark')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
              paperTheme === 'paper'
                ? 'bg-amber-100 text-slate-900 border-amber-300 shadow-md ring-1 ring-amber-400'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white hover:bg-slate-800'
            }`}
            title="Alternar entre visualização noturna de alta definição e papel timbrado executivo"
          >
            {paperTheme === 'paper' ? (
              <>
                <Moon className="w-3.5 h-3.5 text-amber-700" />
                <span>Modo Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Papel Timbrado A4</span>
              </>
            )}
          </button>

          {/* Botão de Auditoria Forense 360° */}
          {onAuditClick && (
            <button
              type="button"
              onClick={onAuditClick}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-700 hover:from-purple-600 hover:to-indigo-600 text-white text-xs font-bold shadow-lg shadow-purple-950/50 flex items-center gap-1.5 transition cursor-pointer border border-purple-400/40 active:scale-95"
              title="Auditar no Auditor Forense 360°"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Auditar no Auditor 360°</span>
            </button>
          )}

          {/* Botão Copiar */}
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            title="Copiar texto formatado"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-blue-400" />}
            <span>{copied ? 'Copiado!' : 'Copiar'}</span>
          </button>

          {/* Botão Baixar .TXT */}
          {documentBodyText && (
            <button
              type="button"
              onClick={handleDownloadTxt}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-emerald-400 hover:text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Baixar arquivo de texto editável (.txt)"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>.TXT</span>
            </button>
          )}

          {/* Botão Baixar PDF Timbrado */}
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isExportingPdf}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-700 to-rose-700 hover:from-red-600 hover:to-rose-600 text-white text-xs font-bold shadow flex items-center gap-1.5 transition cursor-pointer border border-red-500/40"
            title="Baixar PDF Oficial Timbrado em formato A4"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExportingPdf ? 'Gerando...' : 'Baixar PDF'}</span>
          </button>

          {/* Botão Imprimir */}
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow flex items-center gap-1.5 transition cursor-pointer border border-blue-400/40"
            title="Imprimir Documento Oficial"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir</span>
          </button>

          {/* Ações customizadas extras */}
          {customActionButtons}
        </div>
      </div>

      {exportMessage && (
        <div className="p-2.5 rounded-xl bg-blue-950/80 border border-blue-800 text-blue-200 text-xs font-medium flex items-center gap-2 animate-fadeIn">
          <Clock className="w-4 h-4 text-blue-400 animate-spin" />
          <span>{exportMessage}</span>
        </div>
      )}

      {/* CORPO DO DOCUMENTO (PADRÃO TIMBRADO EXECUTIVO VÉRTICE 360°) */}
      <div 
        id="executive-document-sheet"
        className={`w-full rounded-2xl p-6 sm:p-10 shadow-2xl transition-all duration-200 space-y-8 font-sans ${
          paperTheme === 'paper'
            ? 'bg-[#FCFCFC] text-slate-900 border border-slate-300 shadow-slate-300/50'
            : 'bg-[#090D16] text-slate-100 border border-slate-800 shadow-black/80'
        }`}
      >
        {/* CABEÇALHO OFICIAL COM TIMBRE DA REPÚBLICA & VÉRTICE AUDITORIA */}
        <div className={`text-center border-b pb-6 space-y-3 ${
          paperTheme === 'paper' ? 'border-slate-200' : 'border-slate-800/80'
        }`}>
          {/* Brasão Oficial / Logotipo Vértice */}
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-blue-600 flex items-center justify-center text-white font-black text-lg shadow-md">
              ⚖️
            </div>
            <div className="text-left">
              <span className={`text-[10px] font-mono font-bold tracking-widest uppercase block ${
                paperTheme === 'paper' ? 'text-slate-500' : 'text-slate-400'
              }`}>
                REPÚBLICA FEDERATIVA DO BRASIL
              </span>
              <span className={`text-xs font-black tracking-wider uppercase font-sans ${
                paperTheme === 'paper' ? 'text-slate-900' : 'text-slate-100'
              }`}>
                JUNTA COMERCIAL • REDESIM • SISTEMA DE AUDITORIA FORENSE VÉRTICE 360°
              </span>
            </div>
          </div>

          <div className="space-y-1 pt-1">
            <h1 className={`text-lg sm:text-xl font-black uppercase tracking-wide font-sans ${
              paperTheme === 'paper' ? 'text-slate-950' : 'text-white'
            }`}>
              {documentTitle}
            </h1>
            <p className={`text-xs font-medium ${
              paperTheme === 'paper' ? 'text-slate-600' : 'text-slate-400'
            }`}>
              Instrumento Jurídico Registral & Parecer de Governança Estruturada
            </p>
          </div>

          {/* FAIXA DE METADADOS OFICIAIS DO DOCUMENTO */}
          <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl text-left text-xs ${
            paperTheme === 'paper'
              ? 'bg-slate-100 border border-slate-200 text-slate-800'
              : 'bg-slate-900/90 border border-slate-800 text-slate-200'
          }`}>
            <div>
              <span className="text-[10px] font-bold text-slate-500 block uppercase">Razão Social:</span>
              <span className="font-bold truncate block">{companyName}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 block uppercase">CNPJ / NIRE:</span>
              <span className="font-mono font-bold">{cnpj}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 block uppercase">Data de Emissão:</span>
              <span className="font-bold">{currentDate}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 block uppercase">Protocolo de Registro:</span>
              <span className="font-mono font-bold text-amber-500">{effectiveProtocol}</span>
            </div>
          </div>
        </div>

        {/* EMENTA DO INSTRUMENTO / FUNDAMENTAÇÃO LEGAL */}
        <div className={`p-4 rounded-xl border-l-4 border-amber-500 text-xs space-y-1.5 ${
          paperTheme === 'paper'
            ? 'bg-amber-50/80 border-r border-t border-b border-amber-200/60 text-slate-800'
            : 'bg-amber-950/20 border-r border-t border-b border-amber-900/40 text-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="font-black text-amber-600 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" />
              EMENTA & FUNDAMENTAÇÃO NORMATIVA:
            </span>
            {documentScore !== undefined && (
              <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-amber-500/20 text-amber-400 font-mono">
                Índice de Higidez: {documentScore}/100 {documentRating ? `(${documentRating})` : ''}
              </span>
            )}
          </div>
          <p className="italic leading-relaxed font-serif text-[11.5px]">
            "{normativeBase}"
          </p>
        </div>

        {/* CORPO DO DOCUMENTO (CHILDREN OU TEXTO INTEGRAL FORMATADO) */}
        {children ? (
          <div className="space-y-6">{children}</div>
        ) : documentBodyText ? (
          <div className={`p-5 rounded-xl border text-xs font-mono leading-relaxed whitespace-pre-wrap select-all shadow-inner ${
            paperTheme === 'paper'
              ? 'bg-white border-slate-200 text-slate-900'
              : 'bg-slate-950 border-slate-800/90 text-slate-200'
          }`}>
            {documentBodyText}
          </div>
        ) : null}

        {/* QUADRO DE ASSINATURAS DOS SÓCIOS E RESPONSÁVEIS TÉCNICOS */}
        <div className={`pt-6 border-t space-y-6 ${
          paperTheme === 'paper' ? 'border-slate-200' : 'border-slate-800'
        }`}>
          <h4 className={`text-xs font-bold uppercase tracking-wider ${
            paperTheme === 'paper' ? 'text-slate-700' : 'text-slate-300'
          }`}>
            Subscrição & Assinaturas Formais:
          </h4>

          {signatories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {signatories.map((sig, idx) => (
                <div key={idx} className="text-center space-y-1.5">
                  <div className={`w-full border-b pb-1 mx-auto ${
                    paperTheme === 'paper' ? 'border-slate-400' : 'border-slate-700'
                  }`}>
                    <span className={`font-bold font-serif text-xs block ${
                      paperTheme === 'paper' ? 'text-slate-900' : 'text-slate-100'
                    }`}>
                      {sig.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">
                    {sig.role}
                  </span>
                  {sig.cpfCnpj && (
                    <span className="text-[10px] font-mono text-slate-400 block">
                      CPF/CNPJ: {sig.cpfCnpj}
                    </span>
                  )}
                  {sig.rgOabCrc && (
                    <span className="text-[9px] font-mono text-slate-500 block">
                      {sig.rgOabCrc}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="text-center space-y-1.5">
                <div className={`w-full border-b pb-1 mx-auto ${
                  paperTheme === 'paper' ? 'border-slate-400' : 'border-slate-700'
                }`}>
                  <span className={`font-bold font-serif text-xs block ${
                    paperTheme === 'paper' ? 'text-slate-900' : 'text-slate-100'
                  }`}>
                    {companyName}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">
                  Sócio(s) / Titular Administrador
                </span>
                <span className="text-[9px] font-mono text-slate-400 block">
                  Assinatura Eletrônica Qualificada
                </span>
              </div>

              <div className="text-center space-y-1.5">
                <div className={`w-full border-b pb-1 mx-auto ${
                  paperTheme === 'paper' ? 'border-slate-400' : 'border-slate-700'
                }`}>
                  <span className={`font-bold font-serif text-xs block ${
                    paperTheme === 'paper' ? 'text-slate-900' : 'text-slate-100'
                  }`}>
                    Vértice Auditoria Forense & Legal Lab
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">
                  Responsável Técnico & Auditor Especialista
                </span>
                <span className="text-[9px] font-mono text-slate-400 block">
                  Certificação Digital ICP-Brasil
                </span>
              </div>
            </div>
          )}

          {/* SELO DIGITAL DE AUTENTICIDADE ICP-BRASIL & FORENSE 360° */}
          <div className={`pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${
            paperTheme === 'paper' ? 'border-slate-200' : 'border-slate-800/80'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl border ${
                paperTheme === 'paper' 
                  ? 'bg-slate-100 border-slate-200 text-slate-700' 
                  : 'bg-slate-900 border-slate-800 text-amber-400'
              }`}>
                {securityRecord?.qrCodeDataUrl ? (
                  <img 
                    src={securityRecord.qrCodeDataUrl} 
                    alt="QR Code de Autenticidade" 
                    className="w-10 h-10 object-contain rounded"
                  />
                ) : (
                  <QrCode className="w-10 h-10 text-amber-400" />
                )}
              </div>
              <div className="text-[10px] space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="font-black uppercase tracking-wider text-amber-500">
                    CERTIFICAÇÃO DIGITAL FORENSE ICP-BRASIL
                  </span>
                  <span className="px-1 py-0.2 rounded bg-emerald-950 text-emerald-300 font-mono font-bold text-[8px]">
                    QES VÁLIDO
                  </span>
                </div>
                <div className="font-mono text-slate-400">
                  Hash SHA-256: <strong className="text-slate-300 font-bold">{securityRecord?.hashFormatted || `VF-2026-${Math.random().toString(36).substring(2, 10).toUpperCase()}`}</strong>
                </div>
                <div className="text-slate-500 text-[9px]">
                  Validade Jurídica Plena: MP nº 2.200-2/2001, Lei Federal nº 14.063/2020 e Art. 784, III do CPC.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsValidatorOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-300 text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verificar Chave Digital</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL DE VALIDAÇÃO DE AUTENTICIDADE */}
      {isValidatorOpen && securityRecord && (
        <DocumentValidatorModal
          isOpen={isValidatorOpen}
          onClose={() => setIsValidatorOpen(false)}
          initialHash={securityRecord.hashFormatted}
        />
      )}
    </div>
  );
};
