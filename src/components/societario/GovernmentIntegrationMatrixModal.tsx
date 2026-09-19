import React, { useState } from 'react';
import { 
  Server, 
  ShieldCheck, 
  Globe, 
  Cpu, 
  FileCheck2, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Terminal, 
  Download, 
  ChevronRight, 
  ExternalLink,
  Lock,
  Layers,
  FileCode2,
  XCircle,
  Sparkles,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { getJuntaComercialData } from '../../data/societarioData';

interface GovernmentIntegrationMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  uf?: string;
}

export const GovernmentIntegrationMatrixModal: React.FC<GovernmentIntegrationMatrixModalProps> = ({
  isOpen,
  onClose,
  uf = 'PR',
}) => {
  const juntaInfo = getJuntaComercialData(uf);
  const [activeTab, setActiveTab] = useState<'checklist' | 'vps_architecture' | 'workflow_sla' | 'setup_commands'>('checklist');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 3000);
  };

  const integrations = [
    {
      id: 'viabilidade',
      organ: `Prefeituras Municipais & ${juntaInfo.portalName} (${juntaInfo.juntaName})`,
      purpose: `Consulta Prévia de Viabilidade Técnica de Endereço, Zoneamento e Nome Empresarial em ${juntaInfo.stateName}`,
      protocolFormat: `${uf}V-AAAA/NNNNNN ou VRE-SP-NNNNNN`,
      authMethod: 'Login Gov.br (Nível Prata/Ouro) ou Certificado Digital e-CPF / e-CNPJ (mTLS)',
      slaAverage: '2 horas a 48 horas (depende do deferimento municipal do uso do solo)',
      requiresHumanGate: true,
      readyInSystem: true,
      vpsWorkerNeeded: true,
      details: 'Gera o protocolo de viabilidade e laudo de zoneamento municipal. Uma vez aprovado, gera o laudo oficial em PDF que é salvo na pasta do processo.'
    },
    {
      id: 'dbe',
      organ: 'Receita Federal do Brasil (Redesim / Coletor Nacional)',
      purpose: 'Geração e Transmissão do Documento Básico de Entrada (DBE) com eventos societários',
      protocolFormat: `${uf}NNNNNNNN (10 dígitos)`,
      authMethod: 'Certificado Digital A1 ICP-Brasil ou Gov.br via Coletor Web',
      slaAverage: '15 minutos a 4 horas para processamento do lote na Receita',
      requiresHumanGate: true,
      readyInSystem: true,
      vpsWorkerNeeded: true,
      details: 'Valida os CPFs de sócios e administrador, vínculos de CNAE e endereço com o protocolo de viabilidade aprovado. Gera o Recibo de Transmissão e o Espelho do DBE.'
    },
    {
      id: 'fcn',
      organ: `${juntaInfo.juntaFullName} (${juntaInfo.juntaName} - ${juntaInfo.stateName})`,
      purpose: `Ficha de Cadastro Nacional (FCN) e Enquadramento no sistema ${juntaInfo.systemName}`,
      protocolFormat: `FCN-${uf}-NNNNNN e Protocolo de Entrada PRP-AAAA/NNNNNN-N`,
      authMethod: 'Certificado Digital mTLS ICP-Brasil ou Assinatura Avançada Gov.br',
      slaAverage: `Imediato (Preenchimento) / ${juntaInfo.avgTime} (Julgamento pelo Vogal)`,
      requiresHumanGate: true,
      readyInSystem: true,
      vpsWorkerNeeded: true,
      details: 'Mescla a minuta contratual auditada, os dados do DBE e da Viabilidade para constituir o processo de registro na Junta Comercial.'
    },
    {
      id: 'dare_fees',
      organ: `SEFAZ/${uf} & Junta Comercial (${juntaInfo.juntaName} Arrecadação)`,
      purpose: `Geração de Guia DARE / DAE / Taxas (${juntaInfo.estimatedFee}) com Código de Barras e Chave PIX`,
      protocolFormat: 'Guia DARE / DUC com chave de arrecadação de 44 dígitos',
      authMethod: 'API Bancária de Arrecadação Estadual / Geração Web sem autenticação prévia',
      slaAverage: 'Imediato (Geração) / Liquidação PIX em tempo real (10s a 5min)',
      requiresHumanGate: true,
      readyInSystem: true,
      vpsWorkerNeeded: false,
      details: 'Permite ao operador pagar por PIX com conciliação automática. A Junta Comercial só abre a fase de protocolo de documentos após a compensação bancária da taxa.'
    },
    {
      id: 'dossier_folder',
      organ: 'Repositório Oficial do Processo (Dossiê Digital)',
      purpose: 'Pasta estruturada com todos os documentos oficiais gerados em cada fase',
      protocolFormat: 'Pasta de Arquivos vinculada ao Protocolo Geral da Junta',
      authMethod: 'Armazenamento interno seguro com controle de versão e assinatura digital',
      slaAverage: 'Download em tempo real com exportação unificada em ZIP',
      requiresHumanGate: false,
      readyInSystem: true,
      vpsWorkerNeeded: false,
      details: 'Centraliza o laudo de viabilidade, recibo do DBE, espelho FCN, comprovante de taxa, contrato assinado e certidão de registro.'
    }
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#090D16] border border-slate-800 rounded-2xl max-w-5xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-black text-slate-100 uppercase tracking-tight">
                  Matriz Técnica de Integrações Governamentais (27 UFs)
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700 font-bold">
                  {juntaInfo.juntaName} • {uf}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Mapeamento das conexões reais da Redesim, {juntaInfo.juntaFullName} ({juntaInfo.juntaName}) e Requisitos da VPS Oracle
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-slate-800 bg-[#0B0F19] flex space-x-4 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('checklist')}
            className={`py-3 px-3 border-b-2 transition flex items-center space-x-2 cursor-pointer ${
              activeTab === 'checklist' 
                ? 'border-blue-500 text-blue-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Checklist de Integrações</span>
          </button>

          <button
            onClick={() => setActiveTab('vps_architecture')}
            className={`py-3 px-3 border-b-2 transition flex items-center space-x-2 cursor-pointer ${
              activeTab === 'vps_architecture' 
                ? 'border-blue-500 text-blue-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Arquitetura da VPS Oracle</span>
          </button>

          <button
            onClick={() => setActiveTab('workflow_sla')}
            className={`py-3 px-3 border-b-2 transition flex items-center space-x-2 cursor-pointer ${
              activeTab === 'workflow_sla' 
                ? 'border-blue-500 text-blue-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Tempos de Resposta & Portões Humanos</span>
          </button>

          <button
            onClick={() => setActiveTab('setup_commands')}
            className={`py-3 px-3 border-b-2 transition flex items-center space-x-2 cursor-pointer ${
              activeTab === 'setup_commands' 
                ? 'border-blue-500 text-blue-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Comandos de Instalação na VPS</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          
          {activeTab === 'checklist' && (
            <div className="space-y-6">
              <div className="bg-blue-950/30 border border-blue-500/30 rounded-2xl p-4 flex items-start space-x-3 text-xs text-blue-200">
                <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-slate-100">Princípio Inegociável: Sem Automação Cega ("Human-in-the-Loop")</p>
                  <p className="text-slate-300 leading-relaxed">
                    Processos societários perante a Receita Federal, Junta Comercial e Prefeituras envolvem responsabilidade civil e tributária dos sócios.
                    Cada etapa gera protocolos públicos individuais, exige conferência do operador, download dos laudos oficiais para a pasta digital e confirmação explícita para avançar.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {integrations.map((item, idx) => (
                  <div key={item.id} className="bg-[#0B0F19] border border-slate-800 rounded-2xl p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                      <div className="flex items-center space-x-3">
                        <span className="w-7 h-7 rounded-xl bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center text-xs border border-blue-500/30">
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-slate-100">{item.organ}</h4>
                          <p className="text-xs text-blue-400 font-medium">{item.purpose}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {item.requiresHumanGate && (
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-950/60 text-amber-300 border border-amber-500/40">
                            Portão Humano Obrigatório
                          </span>
                        )}
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/40">
                          Mapeado no Sistema
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="bg-[#0F172A] p-3 rounded-xl border border-slate-800/80 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Padrão de Protocolo:</span>
                        <p className="font-mono text-slate-200 font-semibold">{item.protocolFormat}</p>
                      </div>

                      <div className="bg-[#0F172A] p-3 rounded-xl border border-slate-800/80 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Método de Acesso:</span>
                        <p className="text-slate-200">{item.authMethod}</p>
                      </div>

                      <div className="bg-[#0F172A] p-3 rounded-xl border border-slate-800/80 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Tempo Médio Governamental:</span>
                        <p className="font-mono text-amber-300 font-semibold">{item.slaAverage}</p>
                      </div>
                    </div>

                    <div className="text-xs text-slate-400 pt-1">
                      <strong className="text-slate-200">Como funciona:</strong> {item.details}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'vps_architecture' && (
            <div className="space-y-6">
              <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Server className="w-6 h-6 text-blue-400" />
                    <div>
                      <h4 className="text-base font-bold text-slate-100">Arquitetura Híbrida: Sistema Web + VPS Oracle</h4>
                      <p className="text-xs text-slate-400">Distribuição de responsabilidades para manter os certificados e dados 100% seguros</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                    Oracle Cloud Infrastructure
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3">
                  
                  {/* Card Web App */}
                  <div className="bg-[#0F172A] p-5 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex items-center space-x-2 text-blue-400 pb-2 border-b border-slate-800">
                      <Cpu className="w-5 h-5" />
                      <h5 className="font-bold text-sm text-slate-100">1. Aplicação Vértice (Nuvem / Frontend)</h5>
                    </div>
                    <ul className="space-y-2.5 text-xs text-slate-300">
                      <li className="flex items-start space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>Auditoria jurídica de cláusulas e salvaguardas DREI (+25%).</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>Busca e validação instantânea de CNPJ e QSA da Receita Federal.</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>Rastreamento automático de outras empresas dos sócios (LC 123/06).</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>Dossiê Digital: Pasta oficial com download de todos os documentos gerados.</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>Portões de Decisão Humana para liberação de cada protocolo.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Card VPS Oracle */}
                  <div className="bg-[#0F172A] p-5 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex items-center space-x-2 text-emerald-400 pb-2 border-b border-slate-800">
                      <Lock className="w-5 h-5" />
                      <h5 className="font-bold text-sm text-slate-100">2. VPS Oracle (Worker Seguro e mTLS)</h5>
                    </div>
                    <ul className="space-y-2.5 text-xs text-slate-300">
                      <li className="flex items-start space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>Guarda do Certificado Digital A1 (.pfx) com mTLS corporativo.</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>Worker Headless (Puppeteer/Playwright) para preenchimento de formulários governamentais com sessão persistente.</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>Polling de background para monitorar o status do deferimento na Junta e Prefeitura.</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>Download autônomo dos PDFs timbrados (Laudo, DBE, DARE, Certidão) e envio para a pasta do processo.</span>
                      </li>
                    </ul>
                  </div>

                </div>
              </div>
            </div>
          )}

          {activeTab === 'workflow_sla' && (
            <div className="space-y-6">
              <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl p-6 space-y-6">
                <h4 className="text-base font-bold text-slate-100">Linha do Tempo Real de Registro Mercantil</h4>
                
                <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-800">
                  
                  <div className="relative flex items-start space-x-4">
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 ring-4 ring-[#090D16]">
                      1
                    </div>
                    <div className="bg-[#0F172A] p-4 rounded-xl border border-slate-800 flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-slate-100 text-sm">Viabilidade Técnica (Prefeitura + Junta)</h5>
                        <span className="font-mono text-xs text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                          SLA: 2h a 48h
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        O robô gera o protocolo (ex: <code className="text-blue-300">PRV-2026/048192</code>) no Empresa Fácil.
                        O fiscal da Prefeitura analisa zoneamento e alvará prévio.
                      </p>
                      <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300">
                        <strong>Portão do Sistema:</strong> Assim que deferido, salva o Laudo na Pasta e pede confirmação para gerar o DBE.
                      </div>
                    </div>
                  </div>

                  <div className="relative flex items-start space-x-4">
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 ring-4 ring-[#090D16]">
                      2
                    </div>
                    <div className="bg-[#0F172A] p-4 rounded-xl border border-slate-800 flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-slate-100 text-sm">Coletor Nacional Redesim / DBE (Receita Federal)</h5>
                        <span className="font-mono text-xs text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                          SLA: 15min a 4h
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        Preenchimento dos eventos societários e sócios. O protocolo é transmitido para a RFB.
                      </p>
                      <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300">
                        <strong>Portão do Sistema:</strong> Deferido o DBE, baixa o espelho assinado e pergunta se avança para a FCN na Junta.
                      </div>
                    </div>
                  </div>

                  <div className="relative flex items-start space-x-4">
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 ring-4 ring-[#090D16]">
                      3
                    </div>
                    <div className="bg-[#0F172A] p-4 rounded-xl border border-slate-800 flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-slate-100 text-sm">FCN & Guia de Custas DARE (Junta Comercial)</h5>
                        <span className="font-mono text-xs text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                          SLA: Imediato
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        O sistema gera a FCN no Integrador Estadual e emite a guia de arrecadação com Chave PIX e Código de Barras.
                      </p>
                      <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300">
                        <strong>Portão do Sistema:</strong> Operador confirma o pagamento PIX para liberar o envio da minuta à Junta.
                      </div>
                    </div>
                  </div>

                  <div className="relative flex items-start space-x-4">
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 ring-4 ring-[#090D16]">
                      4
                    </div>
                    <div className="bg-[#0F172A] p-4 rounded-xl border border-slate-800 flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-slate-100 text-sm">Protocolo Final & Registro Oficial</h5>
                        <span className="font-mono text-xs text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                          SLA: 24h a 72h
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        Geração do código definitivo do processo (ex: <code className="text-blue-300">PRP-2026/084912-1</code>).
                        Após julgamento pelo Vogal da Junta Comercial, a Certidão de Inteiro Teor e o Cartão CNPJ são emitidos.
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {activeTab === 'setup_commands' && (
            <div className="space-y-6">
              <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-bold text-slate-100">Scripts Prontos para a VPS Oracle</h4>
                    <p className="text-xs text-slate-400">Instalação dos serviços de mTLS, Chromium Headless e receptor de webhooks</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span>1. Instalação de Dependências e Headless RPA:</span>
                    <button
                      onClick={() => handleCopy(`sudo apt update && sudo apt install -y curl nodejs npm chromium-browser libnss3-tools
npm install -g pm2
git clone https://github.com/vertice-fiscal/vps-worker.git
cd vps-worker && npm install`, 'cmd1')}
                      className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 cursor-pointer"
                    >
                      {copiedText === 'cmd1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedText === 'cmd1' ? 'Copiado!' : 'Copiar Comandos'}</span>
                    </button>
                  </div>

                  <pre className="p-4 rounded-xl bg-[#05080F] border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto">
{`sudo apt update && sudo apt install -y curl nodejs npm chromium-browser libnss3-tools
npm install -g pm2
# Configuração do Worker de Automação mTLS ICP-Brasil
mkdir -p /opt/vertice-vps && cd /opt/vertice-vps
npm init -y && npm install puppeteer-core express dotenv`}
                  </pre>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span>2. Variáveis de Ambiente da VPS (.env):</span>
                    <button
                      onClick={() => handleCopy(`PORT=8443
MTLS_CLIENT_CERT_PATH=/etc/certs/certificado-a1.pfx
MTLS_PASSPHRASE=sua_senha_do_certificado
EMPRESA_FACIL_URL=https://www.empresafacil.pr.gov.br
REDESIM_COLETOR_URL=https://coletor.redesim.gov.br`, 'cmd2')}
                      className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 cursor-pointer"
                    >
                      {copiedText === 'cmd2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedText === 'cmd2' ? 'Copiado!' : 'Copiar Variáveis'}</span>
                    </button>
                  </div>

                  <pre className="p-4 rounded-xl bg-[#05080F] border border-slate-800 text-xs font-mono text-blue-300 overflow-x-auto">
{`PORT=8443
MTLS_CLIENT_CERT_PATH=/etc/certs/certificado-a1.pfx
MTLS_PASSPHRASE=sua_senha_do_certificado
EMPRESA_FACIL_URL=https://www.empresafacil.pr.gov.br
REDESIM_COLETOR_URL=https://coletor.redesim.gov.br`}
                  </pre>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#0B0F19] flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Conformidade com os Manuais do DREI (Instruções Normativas nº 81/2020 e nº 112/2024)</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition cursor-pointer"
          >
            Entendido, Voltar ao Sistema
          </button>
        </div>

      </div>
    </div>
  );
};
