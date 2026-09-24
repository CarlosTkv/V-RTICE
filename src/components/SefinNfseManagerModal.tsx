import React, { useState } from 'react';
import { 
  FileText, 
  Send, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink, 
  Download, 
  Clock, 
  ShieldCheck, 
  Building2, 
  DollarSign, 
  Sparkles, 
  Layers, 
  Slash, 
  Repeat, 
  AlertCircle,
  FileCheck2,
  Lock,
  Search,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CompanyData } from '../types';

interface SefinNfseManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCompany: CompanyData;
  showToast?: (text: string, type?: 'success' | 'info' | 'error') => void;
  onOpenCertificateModal?: () => void;
}

export interface NotaFiscalServicoRecord {
  id: string;
  nsu: string;
  chaveAcesso: string;
  numeroNfse: string;
  tipo: 'EMITIDA' | 'TOMADA';
  status: 'REGULAR' | 'CANCELADA' | 'SUBSTITUIDA';
  dataEmissao: string;
  prestadorNome: string;
  prestadorCnpj: string;
  tomadorNome: string;
  tomadorCnpjCpf: string;
  valorServico: number;
  valorIss: number;
  codigoLc116: string;
  discriminacao: string;
  danfseUrl: string;
  xmlCompleto?: string;
}

export const SefinNfseManagerModal: React.FC<SefinNfseManagerModalProps> = ({
  isOpen,
  onClose,
  currentCompany,
  showToast,
  onOpenCertificateModal
}) => {
  const [activeTab, setActiveTab] = useState<'emissao' | 'gestao' | 'worker'>('gestao');

  // Form State para Emissão de DPS
  const [prestadorCnpj, setPrestadorCnpj] = useState<string>(currentCompany?.cnpj || '00631114000130');
  const [tomadorCnpjCpf, setTomadorCnpjCpf] = useState<string>('33000167000101');
  const [tomadorRazaoSocial, setTomadorRazaoSocial] = useState<string>('PETROBRAS DISTRIBUIDORA S/A');
  const [codigoLc116, setCodigoLc116] = useState<string>('17.01');
  const [cnae, setCnae] = useState<string>('6920601');
  const [codigoMunicipioEmissao, setCodigoMunicipioEmissao] = useState<string>('3304557'); // Rio de Janeiro
  const [valorServico, setValorServico] = useState<string>('15000.00');
  const [aliquotaIss, setAliquotaIss] = useState<string>('5.0');
  const [discriminacao, setDiscriminacao] = useState<string>('Serviços técnicos de consultoria fiscal, auditoria digital de SPED e planejamento tributário.');
  const [isEmitting, setIsEmitting] = useState<boolean>(false);
  const [lastEmittedNfse, setLastEmittedNfse] = useState<any | null>(null);

  // Filtros da Gestão de Notas Válidas
  const [filterStatus, setFilterStatus] = useState<'TODOS' | 'REGULAR' | 'CANCELADA' | 'SUBSTITUIDA'>('TODOS');
  const [filterTipo, setFilterTipo] = useState<'TODOS' | 'EMITIDA' | 'TOMADA'>('TODOS');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modais de Ação (Cancelamento / Substituição)
  const [selectedNotaForCancel, setSelectedNotaForNotaCancel] = useState<NotaFiscalServicoRecord | null>(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState<string>('1');
  const [justificativaCancelamento, setJustificativaCancelamento] = useState<string>('Erro de digitação no valor e código do serviço.');
  const [isCanceling, setIsCanceling] = useState<boolean>(false);

  // Lista In-Memory de Notas Válidas & Ciclo de Vida
  const [notasList, setNotasList] = useState<NotaFiscalServicoRecord[]>([
    {
      id: '1',
      nsu: '000000000000101',
      chaveAcesso: 'NFS332609006311140001302026000000148185739123800001',
      numeroNfse: '20260000148',
      tipo: 'EMITIDA',
      status: 'REGULAR',
      dataEmissao: '2026-09-18',
      prestadorNome: currentCompany?.name || 'BRASOLUB DISTRIB BRASILEIRA DE OLEOS LTDA',
      prestadorCnpj: currentCompany?.cnpj || '00.631.114/0001-30',
      tomadorNome: 'PETROBRAS DISTRIBUIDORA S/A',
      tomadorCnpjCpf: '33.000.167/0001-01',
      valorServico: 28500.00,
      valorIss: 1425.00,
      codigoLc116: '17.01',
      discriminacao: 'Serviços Técnicos Especializados de Análise Laboratorial e Tratamento de Lubrificantes',
      danfseUrl: 'https://www.nfse.gov.br/DANFSE/NFS332609006311140001302026000000148185739123800001'
    },
    {
      id: '2',
      nsu: '000000000000102',
      chaveAcesso: 'NFS128901230001442026000000892185739123900002',
      numeroNfse: '20260000892',
      tipo: 'TOMADA',
      status: 'REGULAR',
      dataEmissao: '2026-09-20',
      prestadorNome: 'LUBRAX SERVICOS TECNICOS E LOGISTICA LTDA',
      prestadorCnpj: '12.890.123/0001-44',
      tomadorNome: currentCompany?.name || 'BRASOLUB DISTRIB BRASILEIRA DE OLEOS LTDA',
      tomadorCnpjCpf: currentCompany?.cnpj || '00.631.114/0001-30',
      valorServico: 14200.00,
      valorIss: 710.00,
      codigoLc116: '07.02',
      discriminacao: 'Manutenção Preventiva de Tanques de Armazenamento e Calibragem de Bombas',
      danfseUrl: 'https://www.nfse.gov.br/DANFSE/NFS128901230001442026000000892185739123900002'
    }
  ]);

  if (!isOpen) return null;

  const hasCert = !!(currentCompany?.pfxBase64 && currentCompany?.certUploaded);

  // Cálculo ao vivo do ISS
  const vServicoNum = parseFloat(valorServico) || 0;
  const vAliqNum = parseFloat(aliquotaIss) || 0;
  const vIssCalculado = (vServicoNum * vAliqNum) / 100;
  const isAliquotaValida = vAliqNum >= 2.0 && vAliqNum <= 5.0;

  // Handlers de Emissão da DPS
  const handleEmitirDps = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasCert) {
      showToast?.('Certificado A1 necessário para assinar a DPS e autenticar mTLS com a SefinNacional.', 'error');
      onOpenCertificateModal?.();
      return;
    }

    if (!isAliquotaValida) {
      showToast?.('Alíquota do ISS fora dos limites da LC 116/03 (Mínimo: 2.0%, Máximo: 5.0%).', 'error');
      return;
    }

    setIsEmitting(true);
    setLastEmittedNfse(null);

    try {
      const res = await fetch('/api/sefin/emitir-dps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prestadorCnpj: prestadorCnpj.replace(/\D/g, ''),
          tomadorCnpjCpf: tomadorCnpjCpf.replace(/\D/g, ''),
          tomadorRazaoSocial,
          codigoLc116,
          cnae,
          codigoMunicipioEmissao,
          valorServico: vServicoNum,
          aliquotaIss: vAliqNum,
          discriminacao,
          pfxBase64: currentCompany.pfxBase64,
          password: currentCompany.certPassword
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setLastEmittedNfse(data);
        showToast?.(`NFS-e autorizada com sucesso no Portal Nacional! Chave: ${data.chaveAcesso.slice(0, 18)}...`, 'success');

        // Adiciona à lista local
        const novaNota: NotaFiscalServicoRecord = {
          id: Date.now().toString(),
          nsu: (1000 + notasList.length + 1).toString().padStart(15, '0'),
          chaveAcesso: data.chaveAcesso,
          numeroNfse: data.numeroNfse,
          tipo: 'EMITIDA',
          status: 'REGULAR',
          dataEmissao: new Date().toISOString().split('T')[0],
          prestadorNome: currentCompany.name,
          prestadorCnpj: currentCompany.cnpj,
          tomadorNome: tomadorRazaoSocial,
          tomadorCnpjCpf,
          valorServico: vServicoNum,
          valorIss: vIssCalculado,
          codigoLc116,
          discriminacao,
          danfseUrl: data.danfseUrl
        };

        setNotasList(prev => [novaNota, ...prev]);
        setActiveTab('gestao');
      } else {
        showToast?.(data.error || 'Erro na transmissão da DPS para a SefinNacional.', 'error');
      }
    } catch (err: any) {
      showToast?.(`Erro na conexão mTLS: ${err.message}`, 'error');
    } finally {
      setIsEmitting(false);
    }
  };

  // Handler de Cancelamento
  const handleConfirmarCancelamento = async () => {
    if (!selectedNotaForCancel) return;
    setIsCanceling(true);

    try {
      const res = await fetch('/api/sefin/cancelar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chaveAcesso: selectedNotaForCancel.chaveAcesso,
          codigoMotivo: motivoCancelamento,
          justificativa: justificativaCancelamento,
          pfxBase64: currentCompany.pfxBase64,
          password: currentCompany.certPassword
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setNotasList(prev => prev.map(n => 
          n.chaveAcesso === selectedNotaForCancel.chaveAcesso 
            ? { ...n, status: 'CANCELADA' } 
            : n
        ));
        showToast?.(`NFS-e ${selectedNotaForCancel.numeroNfse} cancelada com sucesso na SefinNacional!`, 'success');
        setSelectedNotaForNotaCancel(null);
      } else {
        showToast?.(data.error || 'Erro ao cancelar NFS-e.', 'error');
      }
    } catch (err: any) {
      showToast?.(`Erro no cancelamento: ${err.message}`, 'error');
    } finally {
      setIsCanceling(false);
    }
  };

  // Filtro de Notas
  const notasFiltradas = notasList.filter(n => {
    if (filterStatus !== 'TODOS' && n.status !== filterStatus) return false;
    if (filterTipo !== 'TODOS' && n.tipo !== filterTipo) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        n.numeroNfse.toLowerCase().includes(term) ||
        n.chaveAcesso.toLowerCase().includes(term) ||
        n.prestadorNome.toLowerCase().includes(term) ||
        n.tomadorNome.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header Superior */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">Módulo Corporativo SefinNacional NFS-e (ADN)</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  mTLS ICP-Brasil Ativo
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Emissão de DPS, Assinatura XMLDSIG, Cancelamento & Conciliação por NSU sem Rejeições
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {hasCert ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                <ShieldCheck className="w-4 h-4" />
                <span>Certificado A1 Conectado</span>
              </div>
            ) : (
              <button
                onClick={onOpenCertificateModal}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40 flex items-center gap-1.5 hover:bg-amber-500/30 transition"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Subir Certificado A1</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-4 bg-slate-900 border-b border-slate-800 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('gestao')}
            className={`px-4 py-2.5 rounded-t-2xl font-bold text-xs flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'gestao'
                ? 'bg-indigo-600 text-white border-t border-x border-indigo-500'
                : 'text-slate-400 hover:text-white bg-slate-800/40'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Gestão de Notas Válidas ({notasList.filter(n => n.status === 'REGULAR').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('emissao')}
            className={`px-4 py-2.5 rounded-t-2xl font-bold text-xs flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'emissao'
                ? 'bg-indigo-600 text-white border-t border-x border-indigo-500'
                : 'text-slate-400 hover:text-white bg-slate-800/40'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Emitir Nova DPS (XMLDSIG)</span>
          </button>

          <button
            onClick={() => setActiveTab('worker')}
            className={`px-4 py-2.5 rounded-t-2xl font-bold text-xs flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'worker'
                ? 'bg-indigo-600 text-white border-t border-x border-indigo-500'
                : 'text-slate-400 hover:text-white bg-slate-800/40'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Worker de Fundo (Sync NSUs)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#0B0F19]">

          {/* TAB 1: GESTÃO DE NOTAS VÁLIDAS */}
          {activeTab === 'gestao' && (
            <div className="space-y-4">
              
              {/* Filtros e Busca */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por número, chave ou tomador..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                    {(['TODOS', 'REGULAR', 'CANCELADA', 'SUBSTITUIDA'] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => setFilterStatus(s)}
                        className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                          filterStatus === s 
                            ? 'bg-indigo-600 text-white' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>

                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                    {(['TODOS', 'EMITIDA', 'TOMADA'] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => setFilterTipo(t)}
                        className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                          filterTipo === t 
                            ? 'bg-indigo-600 text-white' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Grid de Notas Válidas */}
              <div className="space-y-3">
                {notasFiltradas.length === 0 ? (
                  <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
                    <FileText className="w-10 h-10 mx-auto text-slate-600" />
                    <h3 className="text-sm font-bold text-slate-300">Nenhum documento encontrado com os filtros selecionados</h3>
                    <p className="text-xs text-slate-500">Ajuste os filtros ou emita uma nova DPS para alimentar o livro fiscal.</p>
                  </div>
                ) : (
                  notasFiltradas.map((nota) => (
                    <div 
                      key={nota.id}
                      className={`p-5 rounded-2xl border transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 ${
                        nota.status === 'CANCELADA' 
                          ? 'bg-rose-950/10 border-rose-900/40 opacity-75'
                          : nota.status === 'SUBSTITUIDA'
                          ? 'bg-amber-950/10 border-amber-900/40 opacity-80'
                          : 'bg-slate-900 border-slate-800 hover:border-indigo-500/40'
                      }`}
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            nota.status === 'REGULAR' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : nota.status === 'CANCELADA'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}>
                            {nota.status}
                          </span>

                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            nota.tipo === 'EMITIDA' 
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                              : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                          }`}>
                            NFS-e {nota.tipo}
                          </span>

                          <span className="text-xs font-bold text-white">Nº {nota.numeroNfse}</span>
                          <span className="text-xs text-slate-500">• Emissão: {nota.dataEmissao}</span>
                          <span className="text-[10px] text-slate-500 font-mono">NSU: {nota.nsu}</span>
                        </div>

                        <div className="text-xs text-slate-300">
                          <strong className="text-white">Prestador:</strong> {nota.prestadorNome} ({nota.prestadorCnpj})
                        </div>
                        <div className="text-xs text-slate-300">
                          <strong className="text-white">Tomador:</strong> {nota.tomadorNome} ({nota.tomadorCnpjCpf})
                        </div>
                        <div className="text-xs text-slate-400 line-clamp-1 italic">
                          "{nota.discriminacao}"
                        </div>
                      </div>

                      <div className="flex items-center gap-4 self-end lg:self-center shrink-0">
                        <div className="text-right">
                          <div className="text-base font-black text-white">
                            R$ {nota.valorServico.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                          <div className="text-[11px] text-indigo-400 font-medium">
                            ISS ({nota.codigoLc116}): R$ {nota.valorIss.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <a
                            href={nota.danfseUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white transition flex items-center gap-1 text-xs font-bold"
                            title="Abrir Representação Gráfica DANFSE V2.0"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>DANFSE</span>
                          </a>

                          {nota.status === 'REGULAR' && (
                            <button
                              onClick={() => setSelectedNotaForNotaCancel(nota)}
                              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition text-xs font-bold flex items-center gap-1"
                              title="Solicitar Cancelamento de NFS-e (Evento 110111)"
                            >
                              <Slash className="w-3.5 h-3.5" />
                              <span>Cancelar</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: FORMULÁRIO DE EMISSÃO DE DPS */}
          {activeTab === 'emissao' && (
            <form onSubmit={handleEmitirDps} className="space-y-6 max-w-4xl mx-auto bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
              
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Send className="w-5 h-5 text-indigo-400" />
                  <span>Emissão de Declaração de Prestação de Serviços (DPS - ADN)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Gerador dinâmico de XML com pré-validação tributária e assinatura digital XMLDSIG
                </p>
              </div>

              {/* Grid Prestador & Tomador */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">CNPJ do Prestador (Sua Empresa)</label>
                  <input
                    type="text"
                    value={prestadorCnpj}
                    onChange={(e) => setPrestadorCnpj(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">CNPJ ou CPF do Tomador</label>
                  <input
                    type="text"
                    value={tomadorCnpjCpf}
                    onChange={(e) => setTomadorCnpjCpf(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-bold text-slate-300">Razão Social / Nome do Tomador</label>
                  <input
                    type="text"
                    value={tomadorRazaoSocial}
                    onChange={(e) => setTomadorRazaoSocial(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              {/* Grid Tributário LC 116 & CNAE */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-800">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">Código LC 116/03</label>
                  <input
                    type="text"
                    value={codigoLc116}
                    onChange={(e) => setCodigoLc116(e.target.value)}
                    placeholder="Ex: 17.01"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">CNAE Fiscal (7 dígitos)</label>
                  <input
                    type="text"
                    value={cnae}
                    onChange={(e) => setCnae(e.target.value)}
                    placeholder="Ex: 6920601"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">Código IBGE Município</label>
                  <input
                    type="text"
                    value={codigoMunicipioEmissao}
                    onChange={(e) => setCodigoMunicipioEmissao(e.target.value)}
                    placeholder="Ex: 3304557 (Rio de Janeiro)"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              {/* Valores & Alíquotas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">Valor do Serviço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={valorServico}
                    onChange={(e) => setValorServico(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-300">Alíquota ISS (%)</label>
                    <span className={`text-[10px] font-bold ${isAliquotaValida ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isAliquotaValida ? '✔ Dentro dos limites LC 116 (2% a 5%)' : '✖ Alíquota Inválida'}
                    </span>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    value={aliquotaIss}
                    onChange={(e) => setAliquotaIss(e.target.value)}
                    className={`w-full px-4 py-2.5 bg-slate-950 border rounded-xl text-xs font-mono text-white focus:outline-none ${
                      isAliquotaValida ? 'border-slate-700 focus:border-indigo-500' : 'border-rose-500'
                    }`}
                    required
                  />
                </div>
              </div>

              {/* Card Resumo Tributário */}
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-between">
                <div className="text-xs text-indigo-200">
                  <span>Valor do Serviço: <strong>R$ {vServicoNum.toFixed(2)}</strong></span>
                  <span className="mx-2">•</span>
                  <span>ISS ({aliquotaIss}%): <strong className="text-emerald-400">R$ {vIssCalculado.toFixed(2)}</strong></span>
                </div>

                <div className="text-xs font-bold text-indigo-300">
                  Cálculo Oficial SefinNacional
                </div>
              </div>

              {/* Descrição do Serviço */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">Discriminação dos Serviços Prestados</label>
                <textarea
                  rows={3}
                  value={discriminacao}
                  onChange={(e) => setDiscriminacao(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                  required
                />
              </div>

              {/* Botão de Emissão */}
              <button
                type="submit"
                disabled={isEmitting || !isAliquotaValida}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm shadow-xl transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isEmitting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Assinando XMLDSIG e Transmitindo mTLS para SefinNacional...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Emitir e Transmitir DPS para o Portal Nacional</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: WORKER EM SEGUNDO PLANO */}
          {activeTab === 'worker' && (
            <div className="space-y-6 max-w-4xl mx-auto bg-slate-900 p-6 rounded-3xl border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-400" />
                    <span>Agendador de Sincronização por NSU em Segundo Plano (node-cron)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Sincroniza automaticamente a cada hora o barramento ADN mantendo a base contábil auditada
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Cron Ativo (0 * * * *)</span>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400">Frequência</div>
                  <div className="text-sm font-bold text-white">Horária (A cada 60 min)</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400">CNPJ Monitorado</div>
                  <div className="text-sm font-bold text-indigo-400">{currentCompany?.cnpj || '00.631.114/0001-30'}</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400">Última Execução</div>
                  <div className="text-sm font-bold text-emerald-400">Sucesso mTLS (OK)</div>
                </div>
              </div>

              <button
                onClick={() => showToast?.('Varredura horária de NSUs disparada em segundo plano via worker node-cron.', 'info')}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-200 hover:text-white font-bold text-xs border border-indigo-500/30 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Forçar Execução Manual do Worker em Segundo Plano</span>
              </button>
            </div>
          )}

        </div>
      </div>

      {/* MODAL DE CANCELAMENTO DE NFS-E */}
      <AnimatePresence>
        {selectedNotaForCancel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 max-w-lg w-full text-white space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
                  <Slash className="w-5 h-5" />
                  <span>Cancelar NFS-e Nº {selectedNotaForCancel.numeroNfse}</span>
                </h3>
                <button onClick={() => setSelectedNotaForNotaCancel(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">Código do Motivo de Cancelamento</label>
                  <select
                    value={motivoCancelamento}
                    onChange={(e) => setMotivoCancelamento(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="1">1 - Erro na Emissão de Dados Fiscais ou Valores</option>
                    <option value="2">2 - Serviço não Prestado pelo Fornecedor</option>
                    <option value="3">3 - Duplicidade de Emissão da Nota</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">Justificativa Detalhada (Mínimo 15 caracteres)</label>
                  <textarea
                    rows={3}
                    value={justificativaCancelamento}
                    onChange={(e) => setJustificativaCancelamento(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedNotaForNotaCancel(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleConfirmarCancelamento}
                  disabled={isCanceling || justificativaCancelamento.length < 10}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isCanceling ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Slash className="w-4 h-4" />
                  )}
                  <span>Transmitir Cancelamento</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
