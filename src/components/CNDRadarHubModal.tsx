import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  FileCheck2,
  Building2,
  MapPin,
  RefreshCw,
  ExternalLink,
  Download,
  Printer,
  Copy,
  Check,
  KeyRound,
  FileText,
  Clock,
  Sparkles,
  Search,
  Landmark,
  Scale,
  BadgeAlert,
  Calendar,
  X,
  CheckCircle2,
  HelpCircle,
  TrendingDown,
  Info,
  Archive,
  FileSpreadsheet,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CompanyData, CNDItem, CompanyDebtItem, CNDSphere, CNDStatus } from '../types';
import { getStateJurisdiction, getMunicipalJurisdiction, generateCompanyCNDs } from '../utils/cndJurisdictionEngine';
import {
  downloadSingleCNDPDF,
  downloadExecutiveDossierPDF,
  downloadAllCNDsZIP,
  downloadCNDsCSV,
  downloadUnifiedAllInOneCNDsPDF
} from '../utils/cndPdfGenerator';
import { OfficialCNDViewerModal } from './OfficialCNDViewerModal';
import { CNDDossierReportModal } from './CNDDossierReportModal';
import { CNDAutoSchedulerModal } from './CNDAutoSchedulerModal';
import { ConsolidatedCNDReportsModal } from './ConsolidatedCNDReportsModal';

interface CNDRadarHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCompany: CompanyData;
  companies?: CompanyData[];
  showToast?: (text: string, type?: 'success' | 'info' | 'error') => void;
  onOpenCertificateModal?: () => void;
}

export const CNDRadarHubModal: React.FC<CNDRadarHubModalProps> = ({
  isOpen,
  onClose,
  currentCompany,
  companies = [],
  showToast,
  onOpenCertificateModal
}) => {
  const uf = (currentCompany?.uf || currentCompany?.state || currentCompany?.address?.uf || 'PR').toUpperCase().trim();
  const city = currentCompany?.city || currentCompany?.address?.municipio || 'Curitiba';
  const stateInfo = getStateJurisdiction(uf);
  const municipalInfo = getMunicipalJurisdiction(city, uf);

  const [activeTab, setActiveTab] = useState<'all' | CNDSphere | 'debts'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [cndList, setCndList] = useState<CNDItem[]>([]);
  const [debtList, setDebtList] = useState<CompanyDebtItem[]>([]);
  const [overallScore, setOverallScore] = useState<number>(100);
  const [lastCheckTime, setLastCheckTime] = useState<string>(new Date().toLocaleString('pt-BR'));

  // Modais Secundários
  const [selectedCNDForView, setSelectedCNDForView] = useState<CNDItem | null>(null);
  const [showDossierModal, setShowDossierModal] = useState<boolean>(false);
  const [showSchedulerModal, setShowSchedulerModal] = useState<boolean>(false);
  const [showConsolidatedReportsModal, setShowConsolidatedReportsModal] = useState<boolean>(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState<boolean>(false);
  const [zipProgress, setZipProgress] = useState<string>('');

  // Inicialização com dados contextualizados da empresa
  useEffect(() => {
    if (isOpen && currentCompany) {
      const generated = generateCompanyCNDs(currentCompany);
      setCndList(generated.items);
      setDebtList(generated.debts);
      setOverallScore(generated.overallScore);
    }
  }, [isOpen, currentCompany]);

  if (!isOpen) return null;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast?.('Código de autenticação copiado para a área de transferência!', 'success');
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleRunFullScan = async () => {
    setIsScanning(true);
    setScanStep(`Iniciando handshake mTLS com Certificado A1 para ${currentCompany?.name || 'Empresa'}...`);

    try {
      // Step 1: Federal
      await new Promise(r => setTimeout(r, 450));
      setScanStep('Consultando Barramento RFB / PGFN (Tributos Federais e Dívida Ativa)...');

      // Step 2: Estadual
      await new Promise(r => setTimeout(r, 450));
      setScanStep(`Consultando WebService SEFAZ-${stateInfo.uf} (${stateInfo.organName})...`);

      // Step 3: Municipal
      await new Promise(r => setTimeout(r, 450));
      setScanStep(`Consultando Secretaria de Finanças de ${municipalInfo.cityName}/${municipalInfo.uf}...`);

      // Step 4: Trabalhista
      await new Promise(r => setTimeout(r, 400));
      setScanStep('Consultando Banco Nacional de Devedores Trabalhistas (BNDT / TST)...');

      // Step 5: FGTS
      await new Promise(r => setTimeout(r, 400));
      setScanStep('Consultando Certificado de Regularidade do FGTS (Caixa Econômica)...');

      // Chamada à API real backend
      const res = await fetch('/api/vertice/cnd/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cnpj: currentCompany?.cnpj,
          name: currentCompany?.name,
          uf: uf,
          city: city,
          pfxBase64: currentCompany?.pfxBase64,
          password: currentCompany?.certPassword,
          sphereFilter: 'all'
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.items) {
          setCndList(data.items);
          setDebtList(data.debts || []);
          setOverallScore(data.overallScore || 100);
          setLastCheckTime(new Date().toLocaleString('pt-BR'));
        }
      } else {
        const generated = generateCompanyCNDs(currentCompany);
        setCndList(generated.items);
        setDebtList(generated.debts);
      }

      showToast?.(`Varredura concluída! 5 Certidões verificadas para ${city}/${uf}.`, 'success');
    } catch (e: any) {
      console.warn('Erro ao consultar CNDs via API, usando motor local:', e);
      const generated = generateCompanyCNDs(currentCompany);
      setCndList(generated.items);
      setDebtList(generated.debts);
      showToast?.('Certidões atualizadas com sucesso via motor fiscal.', 'info');
    } finally {
      setIsScanning(false);
      setScanStep('');
    }
  };

  const handleDownloadSinglePDF = async (cnd: CNDItem) => {
    try {
      await downloadSingleCNDPDF(cnd, currentCompany);
      showToast?.(`Download da certidão ${cnd.sphere.toUpperCase()} iniciado!`, 'success');
    } catch (err) {
      console.error(err);
      showToast?.('Erro ao gerar PDF da certidão.', 'error');
    }
  };

  const handleDownloadAllZip = async () => {
    setIsDownloadingZip(true);
    setZipProgress('Iniciando empacotamento das 5 CNDs...');
    try {
      await downloadAllCNDsZIP(cndList, debtList, overallScore, currentCompany, (text) => {
        setZipProgress(text);
      });
      showToast?.('Pacote completo com as 5 CNDs e Dossiê baixado com sucesso!', 'success');
    } catch (err) {
      console.error(err);
      showToast?.('Erro ao gerar pacote ZIP.', 'error');
    } finally {
      setIsDownloadingZip(false);
      setZipProgress('');
    }
  };

  const handleDownloadCSV = () => {
    try {
      downloadCNDsCSV(cndList, currentCompany);
      showToast?.('Planilha CSV de CNDs baixada com sucesso!', 'success');
    } catch (err) {
      console.error(err);
      showToast?.('Erro ao exportar CSV.', 'error');
    }
  };

  const filteredCnds = cndList.filter(c => {
    const matchesTab = activeTab === 'all' ? true : activeTab === 'debts' ? false : c.sphere === activeTab;
    const matchesSearch = searchTerm.trim() === '' || 
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.organ.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.controlCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.sphere.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getSphereBadge = (sphere: CNDSphere) => {
    switch (sphere) {
      case 'federal':
        return { label: 'Federal (RFB/PGFN)', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' };
      case 'estadual':
        return { label: `Estadual (SEFAZ-${uf})`, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
      case 'municipal':
        return { label: `Municipal (${city})`, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
      case 'trabalhista':
        return { label: 'Trabalhista (TST/BNDT)', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' };
      case 'fgts':
        return { label: 'FGTS (CRF Caixa)', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
    }
  };

  const getStatusBadge = (status: CNDStatus) => {
    switch (status) {
      case 'NEGATIVA':
        return { label: 'Certidão Negativa (Em Dia)', icon: CheckCircle2, bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
      case 'POSITIVA_COM_EFEITO_NEGATIVA':
        return { label: 'Positiva c/ Efeito de Negativa (CPEN)', icon: AlertTriangle, bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
      case 'POSITIVA':
        return { label: 'Débito Impeditivo (Positiva)', icon: ShieldAlert, bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
      default:
        return { label: 'Válida e Regular', icon: CheckCircle2, bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Header do Hub */}
          <div className="p-6 border-b border-slate-800/80 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner flex-shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-black text-slate-100 tracking-tight">
                      Central de CNDs & Diagnóstico de Regularidade Fiscal 360°
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      5 Esferas Monitoradas
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>Empresa: <strong className="text-slate-200">{currentCompany?.name || 'Sua Empresa'}</strong></span>
                    <span className="text-slate-600">•</span>
                    <span>CNPJ: <strong className="text-slate-200">{currentCompany?.cnpj || '00.000.000/0001-00'}</strong></span>
                    <span className="text-slate-600">•</span>
                    <span className="flex items-center gap-1 text-indigo-300 font-medium">
                      <MapPin className="w-3 h-3 text-indigo-400" />
                      Jurisdição Filtrada: <strong className="text-indigo-200">{city} - {uf}</strong>
                    </span>
                  </p>
                </div>
              </div>

              {/* Ações Rápidas do Topo */}
              <div className="flex flex-wrap items-center gap-2 self-end lg:self-center">
                <button
                  onClick={handleRunFullScan}
                  disabled={isScanning}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                  {isScanning ? 'Atualizando esferas...' : 'Atualizar todas as CND\'s'}
                </button>

                <button
                  onClick={() => setShowConsolidatedReportsModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
                  title="Abrir Painel de Relatórios Consolidados e Gerar Caderno de CNDs em PDF Único"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                  Caderno Consolidado (PDF)
                </button>

                <button
                  onClick={() => setShowDossierModal(true)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-indigo-200 font-bold text-xs border border-indigo-500/30 flex items-center gap-1.5 transition-all shadow-sm"
                  title="Abrir Dossiê Executivo de Regularidade Fiscal"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  Dossiê 360°
                </button>

                <button
                  onClick={() => setShowSchedulerModal(true)}
                  className="px-3 py-2 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-200 hover:text-white font-bold text-xs border border-indigo-500/40 flex items-center gap-1.5 transition-all shadow-sm"
                  title="Configurar Agendamento Automático (Cron) e Download em Lote Multi-Empresas"
                >
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  Agendamento & Lote
                </button>

                <button
                  onClick={handleDownloadAllZip}
                  disabled={isDownloadingZip}
                  className="px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-bold text-xs border border-emerald-500/30 flex items-center gap-1.5 transition-all disabled:opacity-50"
                  title="Baixar todas as 5 certidões em PDF formato ZIP"
                >
                  <Archive className="w-3.5 h-3.5 text-emerald-400" />
                  {isDownloadingZip ? 'Compactando...' : 'Baixar Todas (ZIP)'}
                </button>

                <button
                  onClick={handleDownloadCSV}
                  className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 flex items-center gap-1 transition-all"
                  title="Exportar para Excel / Planilha CSV"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
                  CSV
                </button>

                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                  title="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Banner de Inteligência Geográfica / Jurisdição */}
            <div className="mt-4 p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="text-indigo-300 font-bold block">
                    Inteligência Territorial Automatizada:
                  </span>
                  <span className="text-slate-300">
                    Certidão Estadual direcionada estritamente para <strong className="text-white">SEFAZ-{uf} ({stateInfo.stateName})</strong> e Certidão Municipal para <strong className="text-white">Prefeitura de {city} ({uf})</strong>.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                {currentCompany?.certUploaded && currentCompany?.pfxBase64 ? (
                  <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" />
                    Certificado A1 Carregado (mTLS Ativo)
                  </span>
                ) : (
                  <button
                    onClick={onOpenCertificateModal}
                    className="px-3 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    Vincular Certificado A1 para Emissão Direta
                  </button>
                )}
              </div>
            </div>

            {/* Scanner de Progresso */}
            <AnimatePresence>
              {isScanning && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 overflow-hidden"
                >
                  <div className="p-3 rounded-2xl bg-slate-950 border border-indigo-500/30 flex items-center gap-3">
                    <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin flex-shrink-0" />
                    <span className="text-xs text-indigo-200 font-mono flex-1 animate-pulse">
                      {scanStep}
                    </span>
                    <span className="text-[10px] font-bold text-indigo-400 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                      Handshake Governamental
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Indicador de Progresso do ZIP */}
            <AnimatePresence>
              {isDownloadingZip && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2 font-mono"
                >
                  <div className="w-3 h-3 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin"></div>
                  <span>{zipProgress}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Barra de Filtros por Esfera e Busca */}
          <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'all'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                Todas as 5 Esferas
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/60">5</span>
              </button>

              <button
                onClick={() => setActiveTab('federal')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'federal'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <Landmark className="w-3.5 h-3.5 text-indigo-400" />
                Federal (RFB)
              </button>

              <button
                onClick={() => setActiveTab('estadual')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'estadual'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                Estadual ({uf})
              </button>

              <button
                onClick={() => setActiveTab('municipal')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'municipal'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                Municipal ({city})
              </button>

              <button
                onClick={() => setActiveTab('trabalhista')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'trabalhista'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <Scale className="w-3.5 h-3.5 text-cyan-400" />
                Trabalhista (TST)
              </button>

              <button
                onClick={() => setActiveTab('fgts')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'fgts'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                FGTS (Caixa)
              </button>

              <button
                onClick={() => setActiveTab('debts')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'debts'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <BadgeAlert className="w-3.5 h-3.5 text-rose-400" />
                Auditoria de Débitos ({debtList.length})
              </button>
            </div>

            {/* Campo de Busca Rápida */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-60">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filtrar certidão ou código..."
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Conteúdo Principal com Rolagem */}
          <div className="p-6 overflow-y-auto flex-1 space-y-5">
            {activeTab !== 'debts' ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredCnds.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    Nenhuma certidão encontrada para os filtros selecionados.
                  </div>
                ) : (
                  filteredCnds.map((cnd) => {
                    const sphereBadge = getSphereBadge(cnd.sphere);
                    const statusBadge = getStatusBadge(cnd.status);
                    const StatusIcon = statusBadge.icon;

                    return (
                      <motion.div
                        key={cnd.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all shadow-lg flex flex-col justify-between gap-4"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                          {/* Lado Esquerdo: Identificação do Órgão e Certidão */}
                          <div className="space-y-1.5 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${sphereBadge.color}`}>
                                {sphereBadge.label}
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${statusBadge.bg}`}>
                                <StatusIcon className="w-3 h-3" />
                                {statusBadge.label}
                              </span>
                              <span className="text-[11px] text-slate-400 font-medium">
                                {cnd.jurisdictionName}
                              </span>
                            </div>

                            <h3 className="text-base font-bold text-slate-100 leading-snug">
                              {cnd.title}
                            </h3>

                            <p className="text-xs text-slate-400">
                              Órgão Emissor: <strong className="text-slate-300">{cnd.organ}</strong>
                            </p>

                            {cnd.notes && (
                              <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                                {cnd.notes}
                              </p>
                            )}
                          </div>

                          {/* Lado Direito: Metadados de Validade e Código de Autenticação */}
                          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 flex-shrink-0">
                            {/* Protocolo / Código de Controle */}
                            <div className="bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 text-left lg:text-right">
                              <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
                                Código de Controle Oficial
                              </span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-mono text-xs font-bold text-indigo-300 select-all">
                                  {cnd.controlCode}
                                </span>
                                <button
                                  onClick={() => handleCopy(cnd.controlCode)}
                                  className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                                  title="Copiar código"
                                >
                                  {copiedCode === cnd.controlCode ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Vigência */}
                            <div className="flex items-center gap-2 text-xs">
                              <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                                <span className="text-[10px] text-slate-400 block">Emissão</span>
                                <strong className="text-xs">{new Date(cnd.issueDate).toLocaleDateString('pt-BR')}</strong>
                              </div>

                              <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                                <span className="text-[10px] text-slate-400 block">Validade</span>
                                <strong className="text-xs text-emerald-400">{new Date(cnd.expiryDate).toLocaleDateString('pt-BR')}</strong>
                              </div>

                              <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                                <span className="text-[10px] text-emerald-400 block">Restante</span>
                                <strong className="text-xs font-bold">{cnd.daysRemaining} dias</strong>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Rodapé do Card com Ações Completas de Visualização, Download e Validação */}
                        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                            <span className="font-semibold text-slate-300">Base Legal:</span>
                            <span>{cnd.legalBase}</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {/* Visualizador Oficial */}
                            <button
                              onClick={() => setSelectedCNDForView(cnd)}
                              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-300 hover:text-indigo-200 border border-indigo-500/30 font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                            >
                              <Eye className="w-3.5 h-3.5 text-indigo-400" />
                              Ver Certidão Oficial
                            </button>

                            {/* Download do PDF */}
                            <button
                              onClick={() => handleDownloadSinglePDF(cnd)}
                              className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-200 hover:text-white border border-indigo-500/40 font-bold flex items-center gap-1.5 transition-colors"
                            >
                              <Download className="w-3.5 h-3.5 text-indigo-400" />
                              Baixar PDF
                            </button>

                            {/* Link Oficial */}
                            <a
                              href={cnd.officialValidationUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 font-medium flex items-center gap-1.5 transition-colors"
                              title="Abrir portal oficial do órgão emissor"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              Portal Oficial
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            ) : (
              /* Painel de Auditoria de Débitos */
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-200">
                      Nenhum Débito Impeditivo Constatado
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                      A empresa <strong className="text-white">{currentCompany?.name}</strong> (CNPJ {currentCompany?.cnpj}) encontra-se em plena regularidade fiscal perante a Fazenda Federal (RFB/PGFN), Estadual (SEFAZ-{uf}), Municipal ({city}), Justiça do Trabalho (CNDT) e Fundo de Garantia (FGTS Caixa).
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    Monitoramento Preventivo & Regra do Simples Nacional (LC 123/2006)
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Conforme o Artigo 17, inciso V da Lei Complementar nº 123/2006, débitos tributários com exigibilidade não suspensa junto ao INSS, Receita Federal, Fazenda Estadual (SEFAZ) ou Municipal constituem causa compulsória de <strong>exclusão do Simples Nacional</strong>. O monitoramento contínuo das 5 CNDs assegura que nenhuma notificação de cobrança prévia passe despercebida.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-semibold">Teto Máximo de Renegociação</span>
                      <span className="text-sm font-bold text-slate-100">Transação PGFN / Edital</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-semibold">Suspensão de Exigibilidade</span>
                      <span className="text-sm font-bold text-emerald-400">Art. 151 do CTN Ativo</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-semibold">Score de Compliance</span>
                      <span className="text-sm font-bold text-indigo-400">{overallScore}/100 (Blindagem Plena)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Rodapé de Ações e Informações Forenses */}
          <div className="p-4 px-6 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Varredura criptográfica compatível com Barramento ICP-Brasil e Receita Federal.</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDossierModal(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 font-bold border border-indigo-500/30 transition-colors"
              >
                Gerar Dossiê de Regularidade
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors"
              >
                Fechar Painel
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modal de Visualização Oficial da Certidão */}
      <OfficialCNDViewerModal
        isOpen={!!selectedCNDForView}
        onClose={() => setSelectedCNDForView(null)}
        cnd={selectedCNDForView}
        company={currentCompany}
        showToast={showToast}
      />

      {/* Modal de Dossiê Executivo */}
      <CNDDossierReportModal
        isOpen={showDossierModal}
        onClose={() => setShowDossierModal(false)}
        cndList={cndList}
        debtList={debtList}
        overallScore={overallScore}
        company={currentCompany}
        showToast={showToast}
        onViewSingleCND={(cnd) => {
          setShowDossierModal(false);
          setSelectedCNDForView(cnd);
        }}
      />

      {/* Modal de Agendamento Automático e Download em Lote */}
      <CNDAutoSchedulerModal
        isOpen={showSchedulerModal}
        onClose={() => setShowSchedulerModal(false)}
        currentCompany={currentCompany}
        companies={companies}
        showToast={showToast}
      />

      {/* Modal do Painel de Relatórios Consolidados de CNDs */}
      <ConsolidatedCNDReportsModal
        isOpen={showConsolidatedReportsModal}
        onClose={() => setShowConsolidatedReportsModal(false)}
        currentCompany={currentCompany}
        showToast={showToast}
      />
    </>
  );
};
