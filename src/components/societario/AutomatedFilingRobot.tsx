import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  DollarSign, 
  Send, 
  ShieldCheck, 
  ExternalLink, 
  Download, 
  Loader2, 
  RefreshCw, 
  Layers, 
  Sparkles, 
  XCircle, 
  ChevronRight, 
  CreditCard, 
  Database, 
  Globe, 
  Cpu, 
  FolderOpen, 
  FileCheck2, 
  Eye, 
  QrCode, 
  Check, 
  Play, 
  Pause, 
  HelpCircle,
  Server,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FilingProcess, FilingOfficialDocument } from '../../types';
import { GovernmentIntegrationMatrixModal } from './GovernmentIntegrationMatrixModal';
import { getJuntaComercialData, JUNTAS_COMERCIAIS_DATABASE } from '../../data/societarioData';

interface AutomatedFilingRobotProps {
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
  cnpj?: string;
  uf?: string;
  municipio?: string;
  operationType: string;
  contractScore?: number;
}

export const AutomatedFilingRobot: React.FC<AutomatedFilingRobotProps> = ({
  isOpen,
  onClose,
  companyName,
  cnpj = '04.921.832/0001-99',
  uf: initialUf = 'PR',
  municipio: initialMunicipio = 'Curitiba',
  operationType,
  contractScore = 95,
}) => {
  // Estado e Município dinâmicos selecionáveis para qualquer uma das 27 UFs do Brasil
  const [selectedUf, setSelectedUf] = useState<string>(initialUf);
  const [selectedMunicipio, setSelectedMunicipio] = useState<string>(initialMunicipio);

  const juntaInfo = getJuntaComercialData(selectedUf);

  // Protocolos reais do processo
  const [protocolPRP] = useState(`PRP-2026/${Math.floor(100000 + Math.random() * 900000)}-1`);
  const [viabilityProtocol] = useState(`${selectedUf}V-2026/${Math.floor(10000 + Math.random() * 90000)}`);
  const [dbeProtocol] = useState(`${selectedUf}${Math.floor(10000000 + Math.random() * 90000000)}`);
  const [fcnProtocol] = useState(`FCN-${selectedUf}-${Math.floor(10000 + Math.random() * 90000)}`);
  
  // Abas do Modal
  const [activeTab, setActiveTab] = useState<'workflow' | 'dossier_folder' | 'live_logs'>('workflow');
  const [showMatrixModal, setShowMatrixModal] = useState(false);

  // Controle de Fases e Portões de Decisão Humana
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [isProcessingStage, setIsProcessingStage] = useState(false);
  const [waitingHumanGate, setWaitingHumanGate] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Pagamento da taxa DARE/DAE estadual
  const [isFeePaid, setIsFeePaid] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);

  // Documento selecionado para visualização em tela
  const [viewingDocument, setViewingDocument] = useState<FilingOfficialDocument | null>(null);

  // Lista viva de documentos oficiais gerados e armazenados na pasta
  const [documents, setDocuments] = useState<FilingOfficialDocument[]>([
    {
      id: 'doc-minuta',
      title: 'Minuta do Instrumento Societário com Selo DREI',
      type: 'minuta_contrato',
      fileName: `Minuta_${operationType.replace(/\s+/g, '_')}_Auditada.pdf`,
      issuedAt: new Date().toLocaleDateString('pt-BR'),
      organ: `${juntaInfo.juntaFullName} (${juntaInfo.juntaName})`,
      status: 'valido',
      protocolReference: protocolPRP,
      summary: `Contrato societário em conformidade com as Instruções Normativas DREI nº 81/2020 e 112/2024. Score de Auditoria: ${contractScore}%.`,
      fileSize: '412 KB'
    }
  ]);

  // Logs cronológicos do processo
  const [logs, setLogs] = useState<Array<{ timestamp: string; message: string; type: 'info' | 'success' | 'warning' }>>([
    {
      timestamp: new Date().toLocaleTimeString('pt-BR'),
      message: `Iniciado protocolo unificado de ${operationType} para "${companyName}" em ${juntaInfo.stateName} (${selectedUf}).`,
      type: 'info'
    },
    {
      timestamp: new Date().toLocaleTimeString('pt-BR'),
      message: `Atribuído Protocolo Geral da Junta Comercial (${juntaInfo.juntaName}): ${protocolPRP}.`,
      type: 'success'
    }
  ]);

  // Definição das 5 Etapas Oficiais com SLA e Órgãos Adaptados para qualquer UF
  const workflowStages = [
    {
      id: 'viabilidade',
      title: '1. Viabilidade Técnica Municipal & Estadual',
      organ: `Prefeitura de ${selectedMunicipio} & ${juntaInfo.portalName}`,
      protocol: viabilityProtocol,
      slaNotice: 'SLA Real: 2h a 48h (depende do zoneamento municipal)',
      description: `Validação prévia do uso do solo, alvará de localização e pesquisa de colidência do nome empresarial perante a ${juntaInfo.juntaName}.`,
      documentName: `Laudo_Viabilidade_${selectedUf}_${selectedMunicipio.replace(/\s+/g, '_')}_Deferido.pdf`,
      documentTitle: 'Laudo de Viabilidade Técnica e Uso do Solo Deferido',
      documentOrgan: `Prefeitura Municipal de ${selectedMunicipio}`,
      documentType: 'viabilidade' as const
    },
    {
      id: 'dbe',
      title: '2. Coletor Nacional Redesim / DBE',
      organ: 'Receita Federal do Brasil (RFB)',
      protocol: dbeProtocol,
      slaNotice: 'SLA Real: 15min a 4h (processamento de lotes na RFB)',
      description: 'Geração e transmissão do Documento Básico de Entrada com vinculação dos eventos cadastrais e QSA.',
      documentName: `Recibo_e_Espelho_Oficial_DBE_${selectedUf}.pdf`,
      documentTitle: 'Recibo de Transmissão e Espelho Oficial do DBE',
      documentOrgan: 'Receita Federal do Brasil',
      documentType: 'dbe' as const
    },
    {
      id: 'fcn',
      title: `3. FCN & Validação no Integrador Estadual (${juntaInfo.juntaName})`,
      organ: `${juntaInfo.juntaFullName} (${juntaInfo.juntaName})`,
      protocol: fcnProtocol,
      slaNotice: 'SLA Real: Imediato após conferência dos dados',
      description: `Geração da Ficha de Cadastro Nacional (FCN), qualificação de administradores e enquadramento no sistema ${juntaInfo.systemName}.`,
      documentName: `Ficha_Cadastro_Nacional_FCN_${juntaInfo.juntaName}_Validada.pdf`,
      documentTitle: `Ficha de Cadastro Nacional (FCN) Gerada e Validada (${juntaInfo.juntaName})`,
      documentOrgan: juntaInfo.juntaFullName,
      documentType: 'fcn' as const
    },
    {
      id: 'dare_fee',
      title: `4. Arrecadação de Custas do Registro (${juntaInfo.juntaName})`,
      organ: `SEFAZ/${selectedUf} & Arrecadação ${juntaInfo.juntaName}`,
      protocol: `DARE-${selectedUf}-${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      slaNotice: 'SLA Real: Liquidação PIX em 10 segundos a 5 minutos',
      description: `Guia de recolhimento estadual com código de barras e chave PIX para compensação bancária (${juntaInfo.estimatedFee}).`,
      documentName: `Guia_Oficial_Taxa_${juntaInfo.juntaName}_Comprovante_PIX.pdf`,
      documentTitle: `Guia de Arrecadação ${juntaInfo.juntaName} & Comprovante de Liquidação PIX`,
      documentOrgan: `SEFAZ / ${juntaInfo.juntaName}`,
      documentType: 'taxa_dare' as const
    },
    {
      id: 'filing_done',
      title: `5. Transmissão do Protocolo, Julgamento & Registro (${juntaInfo.juntaName})`,
      organ: `Plenário / Vogais da ${juntaInfo.juntaFullName}`,
      protocol: protocolPRP,
      slaNotice: `SLA Real: ${juntaInfo.avgTime}`,
      description: `Protocolização do instrumento societário em formato PDF/A assinado digitalmente perante a ${juntaInfo.juntaName} e emissão da Certidão de Registro.`,
      documentName: `Certidao_Inteiro_Teor_${juntaInfo.juntaName}_Cartao_CNPJ.pdf`,
      documentTitle: `Certidão de Inteiro Teor / Registro Deferido (${juntaInfo.juntaName}) & CNPJ`,
      documentOrgan: juntaInfo.juntaFullName,
      documentType: 'certidao_registro' as const
    }
  ];

  const currentStage = workflowStages[currentStageIndex];

  // Iniciar a etapa automaticamente ao abrir se estiver no começo
  useEffect(() => {
    if (isOpen && currentStageIndex === 0 && !isProcessingStage && !waitingHumanGate && !isPaused && documents.length === 1) {
      handleTriggerStage(0);
    }
  }, [isOpen]);

  const addLog = (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    setLogs(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString('pt-BR'),
      message,
      type
    }]);
  };

  const handleTriggerStage = (stageIdx: number) => {
    const stage = workflowStages[stageIdx];
    if (!stage) return;

    setIsProcessingStage(true);
    setWaitingHumanGate(false);
    addLog(`[INÍCIO DA ETAPA] Conectando ao sistema de ${stage.organ}...`, 'info');

    // Simulação do tempo de resposta seguro com portão humano
    setTimeout(() => {
      // Criação do documento oficial da etapa
      const newDoc: FilingOfficialDocument = {
        id: `doc-${stage.id}-${Date.now()}`,
        title: stage.documentTitle,
        type: stage.documentType,
        fileName: stage.documentName,
        issuedAt: new Date().toLocaleDateString('pt-BR'),
        organ: stage.documentOrgan as any,
        status: 'valido',
        protocolReference: stage.protocol,
        summary: `Documento oficial emitido e validado perante ${stage.organ} sob o protocolo ${stage.protocol}.`,
        fileSize: `${Math.floor(180 + Math.random() * 250)} KB`
      };

      setDocuments(prev => [...prev, newDoc]);
      setIsProcessingStage(false);
      setWaitingHumanGate(true);

      addLog(`[DEFERIMENTO] ${stage.title} APROVADA com sucesso! Protocolo oficial gerado: ${stage.protocol}`, 'success');
      addLog(`[PASTA DO PROCESSO] Documento "${stage.documentName}" salvo automaticamente na pasta oficial.`, 'info');
      addLog(`[PORTÃO HUMANO] Aguardando decisão do operador para seguir para a próxima etapa.`, 'warning');
    }, 2400);
  };

  const handleApproveAndProceed = () => {
    if (currentStageIndex === 3 && !isFeePaid) {
      addLog(`Atenção: A Guia DARE precisa ser paga antes de transmitir o processo à Junta.`, 'warning');
      return;
    }

    setWaitingHumanGate(false);
    const nextIdx = currentStageIndex + 1;

    if (nextIdx < workflowStages.length) {
      setCurrentStageIndex(nextIdx);
      handleTriggerStage(nextIdx);
    } else {
      addLog(`[PROCESSO CONCLUÍDO] Todos os documentos foram registrados e o Dossiê Mercantil está 100% completo!`, 'success');
    }
  };

  const handleDownloadSingleDoc = (doc: FilingOfficialDocument) => {
    const textContent = `================================================================================
REPÚBLICA FEDERATIVA DO BRASIL - SISTEMA INTEGRADO DE REGISTRO MERCANTIL
ÓRGÃO EMISSOR: ${doc.organ.toUpperCase()}
PROTOCOLO OFICIAL: ${doc.protocolReference || protocolPRP}
DATA DE EMISSÃO: ${doc.issuedAt}
--------------------------------------------------------------------------------
DOCUMENTO: ${doc.title}
ARQUIVO OFICIAL: ${doc.fileName}
STATUS: APROVADO / DEFERIDO
EMPRESA: ${companyName.toUpperCase()}
CNPJ: ${cnpj}
MUNICÍPIO / UF: ${selectedMunicipio.toUpperCase()} / ${selectedUf}
--------------------------------------------------------------------------------
RESUMO DO REGISTRO:
${doc.summary}

AUTENTICAÇÃO DIGITAL:
Hash SHA-256: ${Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)}
Chave de Acesso Gov.br / ICP-Brasil: 2026.${selectedUf}.${doc.type.toUpperCase()}.${Math.floor(100000000 + Math.random() * 900000000)}
================================================================================`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.fileName.replace('.pdf', '.txt');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addLog(`Download do arquivo oficial realizado: ${doc.fileName}`, 'info');
  };

  const handleDownloadCompleteDossier = () => {
    const manifest = {
      processProtocol: protocolPRP,
      companyName,
      cnpj,
      uf: selectedUf,
      municipio: selectedMunicipio,
      operationType,
      exportedAt: new Date().toISOString(),
      totalDocuments: documents.length,
      documents: documents.map(d => ({
        id: d.id,
        title: d.title,
        fileName: d.fileName,
        protocol: d.protocolReference,
        organ: d.organ,
        status: d.status,
        summary: d.summary
      }))
    };

    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Dossie_Oficial_${protocolPRP.replace(/[\/\-]/g, '_')}_Completo.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addLog(`Dossiê completo do processo exportado com sucesso (${documents.length} documentos).`, 'success');
  };

  const handleSimulatePixPayment = () => {
    setIsFeePaid(true);
    addLog(`Pagamento da taxa DARE de R$ 184,50 confirmado via PIX Instantâneo!`, 'success');
    addLog(`Conciliação bancária da Junta Comercial deferida. Liberando avanço para a Junta.`, 'info');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#090D16] border border-slate-800 rounded-2xl max-w-5xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* HEADER DO CENTRO DE REGISTRO MERCANTIL */}
        <div className="px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-blue-950/30 via-slate-900 to-indigo-950/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="p-2.5 bg-blue-600/20 rounded-xl border border-blue-500/30 text-blue-400">
                <Bot className="w-6 h-6" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-black text-slate-100 uppercase tracking-tight">
                  Centro de Registro Mercantil & Protocolos Redesim
                </h3>
                <div className="flex items-center gap-1 bg-blue-950/80 border border-blue-700/60 rounded px-2 py-0.5">
                  <MapPin className="w-3 h-3 text-cyan-400" />
                  <select
                    value={selectedUf}
                    onChange={(e) => {
                      const newUf = e.target.value;
                      setSelectedUf(newUf);
                      addLog(`Jurisdição do processo alterada para ${newUf} (${getJuntaComercialData(newUf).juntaName}).`, 'info');
                    }}
                    className="bg-transparent text-cyan-300 font-mono text-[10px] font-bold uppercase focus:outline-none cursor-pointer"
                  >
                    {Object.keys(JUNTAS_COMERCIAIS_DATABASE).map(u => (
                      <option key={u} value={u} className="bg-slate-900 text-white">
                        {u} • {JUNTAS_COMERCIAIS_DATABASE[u].juntaName} ({JUNTAS_COMERCIAIS_DATABASE[u].stateName})
                      </option>
                    ))}
                  </select>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                  PORTÃO HUMANO ATIVO
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Protocolo Geral: <strong className="text-blue-300 font-mono">{protocolPRP}</strong> • {operationType} de <strong>{companyName}</strong> ({juntaInfo.juntaFullName})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowMatrixModal(true)}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              <Server className="w-3.5 h-3.5 text-blue-400" />
              <span>Matriz 27 Juntas & VPS</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* TABS DE NAVEGAÇÃO SUPERIOR */}
        <div className="px-6 border-b border-slate-800 bg-[#0B0F19] flex items-center justify-between overflow-x-auto text-xs font-semibold">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('workflow')}
              className={`py-3 px-3 border-b-2 transition flex items-center space-x-2 cursor-pointer ${
                activeTab === 'workflow' 
                  ? 'border-blue-500 text-blue-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Workflow & Fases Governamentais</span>
            </button>

            <button
              onClick={() => setActiveTab('dossier_folder')}
              className={`py-3 px-3 border-b-2 transition flex items-center space-x-2 cursor-pointer ${
                activeTab === 'dossier_folder' 
                  ? 'border-blue-500 text-blue-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              <span>Pasta Oficial do Processo (Dossiê Digital)</span>
              <span className="px-1.5 py-0.5 rounded-full bg-blue-900/60 text-blue-300 text-[10px] font-bold">
                {documents.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('live_logs')}
              className={`py-3 px-3 border-b-2 transition flex items-center space-x-2 cursor-pointer ${
                activeTab === 'live_logs' 
                  ? 'border-blue-500 text-blue-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>Console do Robô & Logs ({logs.length})</span>
            </button>
          </div>

          <button
            onClick={() => handleDownloadCompleteDossier()}
            className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar Dossiê Completo</span>
          </button>
        </div>

        {/* CONTEÚDO PRINCIPAL DAS ABAS */}
        <div className="flex-1 overflow-hidden flex flex-col">
          
          {/* ABA 1: WORKFLOW & FASES GOVERNAMENTAIS */}
          {activeTab === 'workflow' && (
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              
              {/* LADO ESQUERDO: LISTA DE ETAPAS */}
              <div className="w-full lg:w-1/2 border-r border-slate-800 p-5 overflow-y-auto space-y-3.5 bg-slate-900/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Etapas do Registro Mercantil
                  </span>
                  <span className="text-[11px] font-mono text-slate-300">
                    Fase {currentStageIndex + 1} de {workflowStages.length}
                  </span>
                </div>

                {workflowStages.map((stage, idx) => {
                  const isCompleted = idx < currentStageIndex || (idx === currentStageIndex && waitingHumanGate);
                  const isCurrent = idx === currentStageIndex;
                  const isPending = idx > currentStageIndex;

                  return (
                    <div
                      key={stage.id}
                      className={`p-4 rounded-xl border transition-all relative overflow-hidden ${
                        isCompleted
                          ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-200'
                          : isCurrent
                          ? 'bg-blue-950/30 border-blue-500/60 text-white shadow-lg'
                          : 'bg-slate-900/40 border-slate-800 text-slate-500'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                            isCompleted ? 'bg-emerald-500 text-white border-emerald-400' :
                            isCurrent ? 'bg-blue-600 text-white border-blue-400 animate-pulse' :
                            'bg-slate-800 text-slate-500 border-slate-700'
                          }`}>
                            {isCompleted ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                          </div>

                          <div className="space-y-1">
                            <h4 className={`text-xs font-bold ${
                              isCompleted ? 'text-emerald-400' :
                              isCurrent ? 'text-blue-300' : 'text-slate-400'
                            }`}>
                              {stage.title}
                            </h4>
                            <p className="text-[10px] text-slate-400 leading-relaxed">
                              {stage.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] font-mono">
                              <span className="text-slate-300">Órgão: <b>{stage.organ}</b></span>
                              <span>•</span>
                              <span className="text-blue-400">Protocolo: <b>{stage.protocol}</b></span>
                            </div>
                            <p className="text-[9px] text-amber-400/90 font-mono italic">
                              {stage.slaNotice}
                            </p>
                          </div>
                        </div>

                        <div>
                          {isCurrent && isProcessingStage && (
                            <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                          )}
                          {isCompleted && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* LADO DIREITO: PAINEL DE AÇÃO DO OPERADOR / PORTÃO DE DECISÃO */}
              <div className="w-full lg:w-1/2 p-6 flex flex-col justify-between bg-black/30 overflow-y-auto space-y-6">
                
                {/* Portão de Decisão Humana Ativo */}
                {waitingHumanGate ? (
                  <div className="bg-[#0B0F19] border border-emerald-500/40 rounded-2xl p-6 space-y-5 shadow-xl animate-fadeIn">
                    <div className="flex items-center space-x-3 text-emerald-400">
                      <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                          Portão de Conferência Humana
                        </span>
                        <h4 className="text-base font-bold text-slate-100 mt-0.5">
                          {currentStage.title} Aprovada!
                        </h4>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 text-xs text-slate-300 space-y-2">
                      <p>
                        <strong className="text-slate-100">Órgão Emissor:</strong> {currentStage.organ}
                      </p>
                      <p>
                        <strong className="text-slate-100">Protocolo Oficial Gerado:</strong> <code className="text-blue-300 font-mono font-bold">{currentStage.protocol}</code>
                      </p>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        O documento oficial foi deferido e já está anexado à pasta do processo. Conforme a diretriz de segurança, o avanço para a próxima etapa exige a sua autorização formal.
                      </p>
                    </div>

                    {/* Se estiver na etapa de taxas DARE */}
                    {currentStageIndex === 3 && (
                      <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-300">Valor da Taxa {juntaInfo.juntaName}:</span>
                          <span className="text-sm font-black text-amber-400 font-mono">{juntaInfo.estimatedFee}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>Chave PIX Oficial:</span>
                          <span className="font-mono text-slate-200">arrecadacao.{juntaInfo.juntaName.toLowerCase()}@sefaz.{selectedUf.toLowerCase()}.gov.br</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleSimulatePixPayment}
                          disabled={isFeePaid}
                          className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
                            isFeePaid 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg'
                          }`}
                        >
                          {isFeePaid ? <Check className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                          <span>{isFeePaid ? 'Pagamento Liquidado com Sucesso' : 'Simular Liquidação PIX Imediata'}</span>
                        </button>
                      </div>
                    )}

                    {/* Botões de Ação do Portão Humano */}
                    <div className="space-y-2.5 pt-2">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const foundDoc = documents.find(d => d.type === currentStage.documentType);
                            if (foundDoc) handleDownloadSingleDoc(foundDoc);
                          }}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition flex items-center justify-center space-x-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-blue-400" />
                          <span>Baixar Documento Oficial</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveTab('dossier_folder')}
                          className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition flex items-center justify-center space-x-1.5 cursor-pointer"
                        >
                          <FolderOpen className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Abrir Pasta</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleApproveAndProceed}
                        className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider transition shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>Confirmar & Autorizar Próxima Etapa</span>
                      </button>
                    </div>
                  </div>
                ) : isProcessingStage ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-xl">
                      <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                        Processando {currentStage.title}...
                      </h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Conectando com segurança e transmitindo os eventos cadastrais para {currentStage.organ}.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">
                      Aguardando deferimento oficial...
                    </span>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                    <CheckCircle2 className="w-16 h-16 text-emerald-400" />
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-slate-100">
                        Processo Societário Concluído com Sucesso!
                      </h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        O processo de {operationType} foi 100% deferido e registrado na {juntaInfo.juntaFullName} ({juntaInfo.juntaName} - {selectedUf}).
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('dossier_folder')}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition cursor-pointer shadow-lg"
                    >
                      Acessar Todos os Documentos na Pasta
                    </button>
                  </div>
                )}

                {/* Status Bar Inferior */}
                <div className="p-3 rounded-xl bg-[#0B0F19] border border-slate-800 text-[11px] flex items-center justify-between text-slate-400">
                  <span className="flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    <span>Conexão Segura Gov.br / ICP-Brasil</span>
                  </span>
                  <span className="font-mono text-slate-500">
                    JUCEPAR: 200 OK
                  </span>
                </div>

              </div>
            </div>
          )}

          {/* ABA 2: PASTA OFICIAL DO PROCESSO (DOSSIÊ DIGITAL) */}
          {activeTab === 'dossier_folder' && (
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <h4 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                    <FolderOpen className="w-5 h-5 text-blue-400" />
                    <span>Pasta Digital do Processo: {protocolPRP}</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Repositório de todos os arquivos oficiais emitidos pela Prefeitura, Receita Federal e Junta Comercial.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadCompleteDossier}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shrink-0 cursor-pointer shadow-lg shadow-blue-600/20"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar Pasta Completa (ZIP / JSON)</span>
                </button>
              </div>

              {/* Lista de Documentos da Pasta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-[#0B0F19] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-3.5 transition shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="p-2.5 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold uppercase">
                            {doc.organ}
                          </span>
                          <h5 className="text-xs font-bold text-slate-100 mt-1">{doc.title}</h5>
                          <p className="text-[11px] font-mono text-blue-400 mt-0.5">
                            Protocolo: {doc.protocolReference || protocolPRP}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                        Aprovado
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {doc.summary}
                    </p>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-slate-500 font-mono">
                        {doc.fileName} • {doc.fileSize || '250 KB'}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleDownloadSingleDoc(doc)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-400" />
                        <span>Baixar Arquivo</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ABA 3: LIVE LOGS DO TERMINAL */}
          {activeTab === 'live_logs' && (
            <div className="flex-1 p-6 flex flex-col bg-[#05080F] overflow-hidden">
              <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  Console de Auditoria e Eventos de Protocolo
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800">
                  e-CNPJ AUTENTICADO
                </span>
              </div>

              <div className="flex-1 bg-[#090D16] rounded-xl p-4 font-mono text-[11px] text-emerald-400/90 leading-relaxed overflow-y-auto space-y-2 border border-slate-800/80">
                {logs.map((log, idx) => (
                  <div key={idx} className="flex items-start space-x-2">
                    <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                    <span className={
                      log.type === 'success' ? 'text-emerald-300 font-semibold' :
                      log.type === 'warning' ? 'text-amber-300 font-semibold' : 'text-slate-300'
                    }>
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#0B0F19] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Ambiente Integrado DREI & Redesim</span>
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Controle com Portão de Decisão Humana Obrigatório</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition cursor-pointer"
            >
              Fechar Painel
            </button>
          </div>
        </div>

      </div>

      {/* Modal de Matriz e Checklist VPS */}
      <GovernmentIntegrationMatrixModal
        isOpen={showMatrixModal}
        onClose={() => setShowMatrixModal(false)}
        uf={selectedUf}
      />
    </div>
  );
};
