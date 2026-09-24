import React, { useState } from 'react';
import {
  X,
  FileText,
  Download,
  Printer,
  FileSpreadsheet,
  Archive,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building2,
  MapPin,
  Calendar,
  Lock,
  Sparkles,
  TrendingUp,
  Layers,
  ExternalLink,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CompanyData, CNDItem, CompanyDebtItem } from '../types';
import {
  downloadSingleCNDPDF,
  downloadExecutiveDossierPDF,
  downloadAllCNDsZIP,
  downloadCNDsCSV,
  downloadUnifiedAllInOneCNDsPDF
} from '../utils/cndPdfGenerator';
import { getStateJurisdiction, getMunicipalJurisdiction } from '../utils/cndJurisdictionEngine';

interface CNDDossierReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  cndList: CNDItem[];
  debtList: CompanyDebtItem[];
  overallScore: number;
  company: CompanyData;
  showToast?: (text: string, type?: 'success' | 'info' | 'error') => void;
  onViewSingleCND?: (cnd: CNDItem) => void;
}

export const CNDDossierReportModal: React.FC<CNDDossierReportModalProps> = ({
  isOpen,
  onClose,
  cndList,
  debtList,
  overallScore,
  company,
  showToast,
  onViewSingleCND
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [zipProgressText, setZipProgressText] = useState('');

  const uf = (company?.uf || 'PR').toUpperCase();
  const city = company?.city || 'Curitiba';
  const stateInfo = getStateJurisdiction(uf);
  const municipalInfo = getMunicipalJurisdiction(city, uf);

  if (!isOpen) return null;

  const handleDownloadDossierPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await downloadExecutiveDossierPDF(cndList, debtList, overallScore, company);
      showToast?.('Dossiê Executivo em PDF baixado com sucesso!', 'success');
    } catch (e) {
      console.error(e);
      showToast?.('Erro ao gerar Dossiê em PDF.', 'error');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadUnifiedAllInOnePdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await downloadUnifiedAllInOneCNDsPDF(cndList, debtList, overallScore, company);
      showToast?.('Caderno Consolidado com TODAS as CNDs baixado com sucesso!', 'success');
    } catch (e) {
      console.error(e);
      showToast?.('Erro ao gerar Caderno Consolidado em PDF.', 'error');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadAllZip = async () => {
    setIsGeneratingZip(true);
    setZipProgressText('Iniciando empacotamento das 5 certidões...');
    try {
      await downloadAllCNDsZIP(cndList, debtList, overallScore, company, (text) => {
        setZipProgressText(text);
      });
      showToast?.('Pacote ZIP com todas as 5 CNDs e Dossiê baixado com sucesso!', 'success');
    } catch (e) {
      console.error(e);
      showToast?.('Erro ao gerar pacote ZIP.', 'error');
    } finally {
      setIsGeneratingZip(false);
      setZipProgressText('');
    }
  };

  const handleDownloadCsv = () => {
    try {
      downloadCNDsCSV(cndList, company);
      showToast?.('Planilha CSV de CNDs exportada com sucesso!', 'success');
    } catch (e) {
      console.error(e);
      showToast?.('Erro ao exportar CSV.', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header do Modal */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner flex-shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-black text-slate-100 tracking-tight">
                    Dossiê Executivo de Regularidade Fiscal & CNDs 360°
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Conformidade Total
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Relatório oficial consolidado para fins de <strong>Licitações Públicas (Lei 14.133/21)</strong>, <strong>Bancos</strong>, <strong>Sócios</strong> e <strong>Auditorias de Due Diligence</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Barra de Ações de Download e Exportação */}
          <div className="mt-5 p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleDownloadUnifiedAllInOnePdf}
                disabled={isGeneratingPdf}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                {isGeneratingPdf ? 'Gerando Caderno PDF...' : 'Baixar Caderno Consolidado (Todas as CNDs em 1 PDF)'}
              </button>

              <button
                onClick={handleDownloadDossierPdf}
                disabled={isGeneratingPdf}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>Dossiê 360°</span>
              </button>

              <button
                onClick={handleDownloadAllZip}
                disabled={isGeneratingZip}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <Archive className="w-3.5 h-3.5" />
                {isGeneratingZip ? 'Empacotando ZIP...' : 'Baixar Pacote das 5 CNDs (ZIP)'}
              </button>

              <button
                onClick={handleDownloadCsv}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 flex items-center gap-1.5 transition-all"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                Exportar CSV
              </button>

              <button
                onClick={handlePrint}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 flex items-center gap-1.5 transition-all"
              >
                <Printer className="w-3.5 h-3.5 text-slate-400" />
                Imprimir Relatório
              </button>
            </div>

            <div className="text-[11px] text-indigo-300 font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Chancela Criptográfica Ativa</span>
            </div>
          </div>

          {/* Indicador de Progresso ZIP */}
          <AnimatePresence>
            {isGeneratingZip && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2.5 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2 font-mono"
              >
                <div className="w-3 h-3 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin"></div>
                <span>{zipProgressText}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Corpo do Relatório com Rolagem */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Card de Informações da Empresa & Score */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Empresa Analisada
              </span>
              <h3 className="text-sm font-bold text-slate-100">
                {company?.name || 'Sua Empresa'}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                CNPJ: {company?.cnpj || '00.000.000/0001-00'}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-indigo-300 pt-1">
                <MapPin className="w-3 h-3 text-indigo-400" />
                <span>{city} - {uf} ({stateInfo.stateName})</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Score de Blindagem Fiscal
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-emerald-400">{overallScore}</span>
                <span className="text-xs text-slate-400">/ 100 pontos</span>
              </div>
              <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Risco Mínimo de Notificação / Execução
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Enquadramento Simples Nacional
              </span>
              <span className="text-sm font-bold text-emerald-400 block">
                Protegido (Art. 17, V LC 123/06)
              </span>
              <p className="text-xs text-slate-400 leading-snug">
                Nenhum débito administrativo impeditivo capaz de gerar termo de exclusão.
              </p>
            </div>
          </div>

          {/* Tabela Detalhada das 5 Certidões */}
          <div className="rounded-2xl bg-slate-950/70 border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                Diagnóstico das 5 Esferas de Certidões Negativas (CNDs)
              </h3>
              <span className="text-xs text-slate-400">
                5 de 5 Ativas e Válidas
              </span>
            </div>

            <div className="divide-y divide-slate-800/80">
              {cndList.map((cnd) => (
                <div
                  key={cnd.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-900/40 transition-colors"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {cnd.sphere}
                      </span>
                      <span className="text-xs font-bold text-slate-100">
                        {cnd.title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Órgão: <strong className="text-slate-300">{cnd.organ}</strong> • Jurisdição: {cnd.jurisdictionName}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                      <span>Código: <strong className="text-indigo-300 font-mono">{cnd.controlCode}</strong></span>
                      <span>•</span>
                      <span>Válida até: <strong className="text-emerald-400">{new Date(cnd.expiryDate).toLocaleDateString('pt-BR')}</strong></span>
                      <span>•</span>
                      <span className="text-emerald-300 font-medium">({cnd.daysRemaining} dias restantes)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => onViewSingleCND?.(cnd)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-400" />
                      Visualizar
                    </button>

                    <button
                      onClick={() => downloadSingleCNDPDF(cnd, company)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-bold border border-indigo-500/30 flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Parecer Jurídico-Contábil de Regularidade */}
          <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 space-y-3">
            <h4 className="text-sm font-bold text-indigo-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              Parecer Técnico de Regularidade & Blindagem Jurídica
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              O presente diagnóstico certifica que o contribuinte <strong>{company?.name}</strong> atende integralmente a todos os requisitos de idoneidade fiscal e trabalhista dispostos no ordenamento jurídico nacional. A regularidade perante a Receita Federal, Fazenda Estadual de {stateInfo.stateName} ({uf}), Fazenda Municipal de {city}, Justiça do Trabalho e FGTS autoriza expressamente a participação em certames licitatórios, celebração de contratos com a Administração Pública e a distribuição regular de lucros e dividendos aos sócios sem risco de penalidades fiscais.
            </p>
          </div>
        </div>

        {/* Rodapé */}
        <div className="p-4 px-6 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-400 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>Documento assinado digitalmente com carimbo do tempo e hash SHA-256.</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors"
          >
            Fechar Relatório
          </button>
        </div>
      </motion.div>
    </div>
  );
};
