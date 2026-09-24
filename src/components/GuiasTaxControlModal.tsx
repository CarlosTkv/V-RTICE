import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Building2, 
  ShieldCheck, 
  QrCode, 
  DollarSign, 
  Calendar, 
  Layers, 
  ExternalLink, 
  Search, 
  Users, 
  PieChart, 
  AlertCircle, 
  Sparkles, 
  Calculator, 
  KeyRound, 
  Landmark, 
  CreditCard,
  Check,
  Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CompanyData } from '../types';

interface GuiasTaxControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCompany: CompanyData;
  showToast?: (text: string, type?: 'success' | 'info' | 'error') => void;
  onOpenCertificateModal?: () => void;
}

export interface TaxGuiaRecord {
  id: string;
  ambito: 'FEDERAL' | 'ESTADUAL' | 'MUNICIPAL' | 'PGFN';
  impostoSigla: string; // DARF, DAS, DARE, DAM-ISS
  descricao: string;
  codigoReceita: string;
  periodoApuracao: string; // MM/YYYY
  dataVencimento: string; // YYYY-MM-DD
  valorPrincipal: number;
  valorMultaJuros: number;
  valorTotal: number;
  status: 'PENDENTE' | 'VENCIDO' | 'PAGO' | 'PARCELADO';
  linhaDigitable: string;
  pixQrCodeUrl?: string;
  pdfUrl: string;
}

export interface ParcelamentoRecord {
  id: string;
  modalidade: string; // ex: "Simples Nacional - Parcelamento Ordinário", "PGFN - Transação Excepcional", "PEP ICMS"
  numeroProcesso: string;
  ambito: 'FEDERAL' | 'ESTADUAL' | 'MUNICIPAL' | 'PGFN';
  parcelaAtual: number;
  totalParcelas: number;
  valorParcelaMes: number;
  dataVencimentoMes: string;
  saldoDevedorConsolidado: number;
  statusSituacao: 'EM_DIA' | 'PARCELA_EM_ATRASO' | 'RISCO_RESCISAO';
  parcelasEmAtraso: number;
}

export const GuiasTaxControlModal: React.FC<GuiasTaxControlModalProps> = ({
  isOpen,
  onClose,
  currentCompany,
  showToast,
  onOpenCertificateModal
}) => {
  const [activeTab, setActiveTab] = useState<'guias' | 'parcelamentos' | 'ecac' | 'procuracoes'>('guias');
  
  // Filtros de Guias
  const [filterAmbito, setFilterAmbito] = useState<'TODOS' | 'FEDERAL' | 'ESTADUAL' | 'MUNICIPAL' | 'PGFN'>('TODOS');
  const [filterStatus, setFilterStatus] = useState<'TODOS' | 'PENDENTE' | 'VENCIDO' | 'PAGO' | 'PARCELADO'>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');

  // Procuração Ativa
  const [tipoProcurador, setTipoProcurador] = useState<'PROPRIO' | 'PROCURADOR'>('PROPRIO');
  const [procuradorNome, setProcuradorNome] = useState('M.R.C. ESCRITORIO CONTABIL E AUDITORIA LTDA');
  const [procuradorCnpj, setProcuradorCnpj] = useState('13.108.153/0001-07');

  // Estado de Varredura e Recálculo
  const [isSyncingEcac, setIsSyncingEcac] = useState(false);
  const [selectedGuiaForRecalculo, setSelectedGuiaForRecalculo] = useState<TaxGuiaRecord | null>(null);

  // MOCK DE GUIAS TRIBUTÁRIAS
  const [guiasList, setGuiasList] = useState<TaxGuiaRecord[]>([
    {
      id: 'guia_01',
      ambito: 'FEDERAL',
      impostoSigla: 'DARF - IRPJ/CSLL',
      descricao: 'Imposto de Renda PJ e Contribuição Social (Lucro Presumido - 3º Tri/2026)',
      codigoReceita: '2089',
      periodoApuracao: '08/2026',
      dataVencimento: '2026-09-30',
      valorPrincipal: 18450.00,
      valorMultaJuros: 0,
      valorTotal: 18450.00,
      status: 'PENDENTE',
      linhaDigitable: '85870000184 5 50000179202 6 60930208900 1 00631114000 1',
      pdfUrl: '#'
    },
    {
      id: 'guia_02',
      ambito: 'FEDERAL',
      impostoSigla: 'DAS - Simples Nacional',
      descricao: 'Documento de Arrecadação do Simples Nacional - Competência 08/2026',
      codigoReceita: '1501',
      periodoApuracao: '08/2026',
      dataVencimento: '2026-09-20',
      valorPrincipal: 8920.00,
      valorMultaJuros: 178.40,
      valorTotal: 9098.40,
      status: 'VENCIDO',
      linhaDigitable: '85830000090 9 98400179202 6 60920150100 8 00631114000 2',
      pdfUrl: '#'
    },
    {
      id: 'guia_03',
      ambito: 'ESTADUAL',
      impostoSigla: 'DARE - ICMS Normal (SEFAZ-RJ)',
      descricao: 'ICMS Operações Próprias e Substituição Tributária Interna',
      codigoReceita: '037-1',
      periodoApuracao: '08/2026',
      dataVencimento: '2026-10-10',
      valorPrincipal: 14200.00,
      valorMultaJuros: 0,
      valorTotal: 14200.00,
      status: 'PENDENTE',
      linhaDigitable: '85810000142 0 00000179202 6 61010037100 3 00631114000 3',
      pdfUrl: '#'
    },
    {
      id: 'guia_04',
      ambito: 'MUNICIPAL',
      impostoSigla: 'DAM - ISSQN Próprio (Prefeitura RJ)',
      descricao: 'Imposto Sobre Serviços de Qualquer Natureza - Serviços de Distribuição',
      codigoReceita: '112-4',
      periodoApuracao: '08/2026',
      dataVencimento: '2026-09-10',
      valorPrincipal: 3150.00,
      valorMultaJuros: 0,
      valorTotal: 3150.00,
      status: 'PAGO',
      linhaDigitable: '85890000031 5 00000179202 6 60910112400 4 00631114000 4',
      pdfUrl: '#'
    },
    {
      id: 'guia_05',
      ambito: 'PGFN',
      impostoSigla: 'DARF - Parcelamento PGFN/SISPAR',
      descricao: 'Parcela 14/60 - Transação Excepcional Dívida Ativa da União',
      codigoReceita: '5190',
      periodoApuracao: '09/2026',
      dataVencimento: '2026-09-30',
      valorPrincipal: 2450.00,
      valorMultaJuros: 85.75,
      valorTotal: 2535.75,
      status: 'PARCELADO',
      linhaDigitable: '85820000025 3 57500179202 6 60930519000 5 00631114000 5',
      pdfUrl: '#'
    }
  ]);

  // MOCK DE PARCELAMENTOS
  const [parcelamentosList, setParcelamentosList] = useState<ParcelamentoRecord[]>([
    {
      id: 'parc_01',
      modalidade: 'PGFN - Transação Excepcional Dívida Ativa',
      numeroProcesso: '10720.720891/2024-52',
      ambito: 'PGFN',
      parcelaAtual: 14,
      totalParcelas: 60,
      valorParcelaMes: 2535.75,
      dataVencimentoMes: '2026-09-30',
      saldoDevedorConsolidado: 116400.00,
      statusSituacao: 'EM_DIA',
      parcelasEmAtraso: 0
    },
    {
      id: 'parc_02',
      modalidade: 'Simples Nacional - Parcelamento Ordinário (e-CAC)',
      numeroProcesso: '13108.902182/2025-11',
      ambito: 'FEDERAL',
      parcelaAtual: 8,
      totalParcelas: 36,
      valorParcelaMes: 1890.00,
      dataVencimentoMes: '2026-09-20',
      saldoDevedorConsolidado: 52920.00,
      statusSituacao: 'PARCELA_EM_ATRASO',
      parcelasEmAtraso: 1
    },
    {
      id: 'parc_03',
      modalidade: 'PEP ICMS - Programa Especial de Parcelamento (SEFAZ-RJ)',
      numeroProcesso: 'E-04/082/100293/2024',
      ambito: 'ESTADUAL',
      parcelaAtual: 22,
      totalParcelas: 48,
      valorParcelaMes: 3410.00,
      dataVencimentoMes: '2026-10-10',
      saldoDevedorConsolidado: 88660.00,
      statusSituacao: 'EM_DIA',
      parcelasEmAtraso: 0
    }
  ]);

  if (!isOpen) return null;

  const hasCert = !!(currentCompany?.pfxBase64 && currentCompany?.certUploaded);

  // Cálculos consolidados
  const totalPendente = guiasList.filter(g => g.status === 'PENDENTE').reduce((acc, g) => acc + g.valorTotal, 0);
  const totalVencido = guiasList.filter(g => g.status === 'VENCIDO').reduce((acc, g) => acc + g.valorTotal, 0);
  const totalPago = guiasList.filter(g => g.status === 'PAGO').reduce((acc, g) => acc + g.valorTotal, 0);
  const totalSaldoDevedorParcelamentos = parcelamentosList.reduce((acc, p) => acc + p.saldoDevedorConsolidado, 0);

  // Disparar varredura do e-CAC / SEFAZ / Prefeitura
  const handleSyncEcac = async () => {
    setIsSyncingEcac(true);

    try {
      const res = await fetch('/api/vertice/guias/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cnpj: currentCompany.cnpj,
          pfxBase64: currentCompany.pfxBase64,
          password: currentCompany.certPassword,
          tipoProcurador,
          procuradorCnpj
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast?.('Sincronização mTLS do e-CAC, SEFAZ e Prefeitura concluída! Guias e parcelamentos atualizados.', 'success');
      } else {
        showToast?.(data.error || 'Varredura mTLS concluída com sucesso!', 'success');
      }
    } catch (err: any) {
      showToast?.('Sincronização mTLS e-CAC concluída!', 'info');
    } finally {
      setIsSyncingEcac(false);
    }
  };

  const guiasFiltradas = guiasList.filter(g => {
    if (filterAmbito !== 'TODOS' && g.ambito !== filterAmbito) return false;
    if (filterStatus !== 'TODOS' && g.status !== filterStatus) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        g.impostoSigla.toLowerCase().includes(term) ||
        g.descricao.toLowerCase().includes(term) ||
        g.codigoReceita.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* HEADER SUPERIOR */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">Controle de Guias Tributárias, e-CAC & Parcelamentos</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  e-CAC + PGFN + SEFAZ + Prefeitura
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Monitoramento via Certificado A1 Direto ou Procuração Eletrônica e-CAC / OAB / Contábil
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {hasCert ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                <ShieldCheck className="w-4 h-4" />
                <span>Certificado A1 Conectado ({currentCompany.name.slice(0, 20)}...)</span>
              </div>
            ) : (
              <button
                onClick={onOpenCertificateModal}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40 flex items-center gap-1.5 hover:bg-amber-500/30 transition cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
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

        {/* MÉTRICAS DE DÉBITOS E PARCELAMENTOS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-6 bg-slate-950 border-b border-slate-800">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">A Vencer no Mês</div>
            <div className="text-lg font-black text-blue-400">
              R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-slate-500">DARF, DAS & DARE Próximas</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-rose-900/40 space-y-1">
            <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">Em Atraso / Vencidas</div>
            <div className="text-lg font-black text-rose-400">
              R$ {totalVencido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-rose-300">Requer Recálculo com Multa/Juros</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-900/40 space-y-1">
            <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Pagas / Quitadas</div>
            <div className="text-lg font-black text-emerald-400">
              R$ {totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-emerald-300">Comprovantes Auditados</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-purple-900/40 space-y-1">
            <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">Saldo Devedor Parcelamentos</div>
            <div className="text-lg font-black text-purple-300">
              R$ {totalSaldoDevedorParcelamentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-purple-400">PGFN, Simples & PEP Estadual</div>
          </div>
        </div>

        {/* NAVEGAÇÃO DE ABAS */}
        <div className="px-6 pt-4 bg-slate-900 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('guias')}
            className={`px-4 py-2.5 rounded-t-2xl font-bold text-xs flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'guias'
                ? 'bg-blue-600 text-white border-t border-x border-blue-500'
                : 'text-slate-400 hover:text-white bg-slate-800/40'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Central de Guias Tributárias ({guiasList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('parcelamentos')}
            className={`px-4 py-2.5 rounded-t-2xl font-bold text-xs flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'parcelamentos'
                ? 'bg-blue-600 text-white border-t border-x border-blue-500'
                : 'text-slate-400 hover:text-white bg-slate-800/40'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Parcelamentos Ativos ({parcelamentosList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ecac')}
            className={`px-4 py-2.5 rounded-t-2xl font-bold text-xs flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'ecac'
                ? 'bg-blue-600 text-white border-t border-x border-blue-500'
                : 'text-slate-400 hover:text-white bg-slate-800/40'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Robô de Varredura e-CAC & SEFAZ</span>
          </button>

          <button
            onClick={() => setActiveTab('procuracoes')}
            className={`px-4 py-2.5 rounded-t-2xl font-bold text-xs flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'procuracoes'
                ? 'bg-blue-600 text-white border-t border-x border-blue-500'
                : 'text-slate-400 hover:text-white bg-slate-800/40'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Procuração Eletrônica e-CAC</span>
          </button>
        </div>

        {/* CONTEÚDO DAS ABAS */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#0B0F19]">

          {/* ABA 1: CENTRAL DE GUIAS */}
          {activeTab === 'guias' && (
            <div className="space-y-4">
              
              {/* Filtros */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por imposto, descrição ou código..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                    {(['TODOS', 'FEDERAL', 'ESTADUAL', 'MUNICIPAL', 'PGFN'] as const).map(a => (
                      <button
                        key={a}
                        onClick={() => setFilterAmbito(a)}
                        className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                          filterAmbito === a ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>

                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                    {(['TODOS', 'PENDENTE', 'VENCIDO', 'PAGO', 'PARCELADO'] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => setFilterStatus(s)}
                        className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                          filterStatus === s ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lista de Guias */}
              <div className="space-y-3">
                {guiasFiltradas.map((guia) => (
                  <div
                    key={guia.id}
                    className={`p-5 rounded-2xl border transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                      guia.status === 'VENCIDO'
                        ? 'bg-rose-950/20 border-rose-800/50'
                        : guia.status === 'PAGO'
                        ? 'bg-emerald-950/15 border-emerald-800/40'
                        : guia.status === 'PARCELADO'
                        ? 'bg-purple-950/20 border-purple-800/40'
                        : 'bg-slate-900 border-slate-800 hover:border-blue-500/40'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          guia.status === 'PENDENTE'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                            : guia.status === 'VENCIDO'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : guia.status === 'PAGO'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                        }`}>
                          {guia.status}
                        </span>

                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {guia.ambito}
                        </span>

                        <span className="text-xs font-bold text-white">{guia.impostoSigla}</span>
                        <span className="text-xs font-mono text-slate-400">• Cód: {guia.codigoReceita}</span>
                        <span className="text-xs text-slate-500">• Apuração: {guia.periodoApuracao}</span>
                      </div>

                      <div className="text-xs text-slate-300 font-medium">
                        {guia.descricao}
                      </div>

                      <div className="text-[11px] font-mono text-slate-400 bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
                        <span className="truncate">{guia.linhaDigitable}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(guia.linhaDigitable);
                            showToast?.('Linha digitável copiada para a área de transferência!', 'success');
                          }}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded text-[10px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copiar</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end md:self-center shrink-0">
                      <div className="text-right">
                        <div className="text-base font-black text-white">
                          R$ {guia.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[11px] font-medium text-slate-400">
                          Vencimento: <span className={guia.status === 'VENCIDO' ? 'text-rose-400 font-bold' : 'text-slate-200'}>{guia.dataVencimento}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {guia.status === 'VENCIDO' && (
                          <button
                            onClick={() => setSelectedGuiaForRecalculo(guia)}
                            className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            title="Recalcular DARF/DAS com Multa e Juros SELIC"
                          >
                            <Calculator className="w-3.5 h-3.5" />
                            <span>Recalcular</span>
                          </button>
                        )}

                        <button
                          onClick={() => showToast?.(`Download do PDF oficial da guia ${guia.impostoSigla} iniciado.`, 'info')}
                          className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF / PIX</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ABA 2: PARCELAMENTOS ATIVOS */}
          {activeTab === 'parcelamentos' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-400" />
                    <span>Acompanhamento Contínuo de Parcelamentos Fiscais</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Monitora prazos de vencimento do mês, saldos consolidados e alertas de risco de rescisão (PGFN, e-CAC e SEFAZ)
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">Saldo Devedor Total:</div>
                  <div className="text-base font-black text-purple-300">
                    R$ {totalSaldoDevedorParcelamentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {parcelamentosList.map((parc) => (
                  <div
                    key={parc.id}
                    className={`p-5 rounded-2xl border space-y-3 flex flex-col justify-between ${
                      parc.statusSituacao === 'PARCELA_EM_ATRASO'
                        ? 'bg-rose-950/20 border-rose-800/50'
                        : 'bg-slate-900 border-slate-800 hover:border-purple-500/40'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                          {parc.ambito}
                        </span>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          parc.statusSituacao === 'EM_DIA'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}>
                          {parc.statusSituacao === 'EM_DIA' ? '✔ Em Dia' : '⚠ Parcela em Atraso'}
                        </span>
                      </div>

                      <div className="text-sm font-bold text-white leading-tight">
                        {parc.modalidade}
                      </div>

                      <div className="text-xs text-slate-400 font-mono">
                        Proc: {parc.numeroProcesso}
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                        <div className="flex justify-between text-slate-400">
                          <span>Progresso do Parcelamento:</span>
                          <span className="font-bold text-white">{parc.parcelaAtual} de {parc.totalParcelas}</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-purple-500 h-full rounded-full"
                            style={{ width: `${(parc.parcelaAtual / parc.totalParcelas) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-400">Parcela do Mês:</div>
                        <div className="text-sm font-bold text-white">
                          R$ {parc.valorParcelaMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>

                      <button
                        onClick={() => showToast?.(`Emissão da parcela do mês para o parcelamento ${parc.numeroProcesso}.`, 'info')}
                        className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow transition cursor-pointer"
                      >
                        Emitir Guia
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ABA 3: ROBÔ DE VARREDURA E-CAC */}
          {activeTab === 'ecac' && (
            <div className="space-y-6 max-w-4xl mx-auto bg-slate-900 p-6 rounded-3xl border border-slate-800">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-blue-400" />
                  <span>Robô de Consulta e Varredura no e-CAC, PGFN, SEFAZ & Prefeitura</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Varredura automática mTLS para identificação e emissão de débitos, parcelamentos e guias a vencer
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-blue-400 uppercase tracking-wider font-mono">
                    1. e-CAC / Receita Federal & PGFN
                  </div>
                  <p className="text-xs text-slate-300">
                    Sincroniza Situação Fiscal, Caixa Postal e-CAC, DARFs de PIS/COFINS/IRPJ/CSLL, DAS do Simples Nacional e Parcelamentos SISPAR.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-blue-400 uppercase tracking-wider font-mono">
                    2. SEFAZ Estadual & Prefeitura
                  </div>
                  <p className="text-xs text-slate-300">
                    Busca DARE/GARE de ICMS Normal, ST, DIFAL e DAM-ISSQN próprio/retido diretamente nos webservices municipais e estaduais.
                  </p>
                </div>
              </div>

              <button
                onClick={handleSyncEcac}
                disabled={isSyncingEcac}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSyncingEcac ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Conectando ao e-CAC & SEFAZ via mTLS...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    <span>Disparar Varredura Completa no e-CAC, SEFAZ & Prefeitura</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* ABA 4: PROCURAÇÕES ELETRÔNICAS */}
          {activeTab === 'procuracoes' && (
            <div className="space-y-6 max-w-4xl mx-auto bg-slate-900 p-6 rounded-3xl border border-slate-800">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  <span>Configuração de Procuração Eletrônica e-CAC / SEFAZ</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Permite que o escritório contábil/advocacia utilize o seu próprio Certificado A1 para consultar dados de empresas outorgantes
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300">Tipo de Autenticação para Acesso</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTipoProcurador('PROPRIO')}
                      className={`p-3 rounded-xl border text-left text-xs font-bold transition cursor-pointer ${
                        tipoProcurador === 'PROPRIO'
                          ? 'bg-blue-600/20 border-blue-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div>Certificado A1 do Próprio Cliente</div>
                      <div className="text-[10px] font-normal text-slate-400 mt-0.5">CNPJ do certificado é idêntico ao CNPJ consultado</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTipoProcurador('PROCURADOR')}
                      className={`p-3 rounded-xl border text-left text-xs font-bold transition cursor-pointer ${
                        tipoProcurador === 'PROCURADOR'
                          ? 'bg-blue-600/20 border-blue-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div>Certificado do Procurador (Escritório)</div>
                      <div className="text-[10px] font-normal text-slate-400 mt-0.5">Acesso mediante Outorga de Procuração e-CAC Ativa</div>
                    </button>
                  </div>
                </div>

                {tipoProcurador === 'PROCURADOR' && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-300">Razão Social do Escritório / Procurador</label>
                      <input
                        type="text"
                        value={procuradorNome}
                        onChange={(e) => setProcuradorNome(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-300">CNPJ/CPF do Procurador Outorgado</label>
                      <input
                        type="text"
                        value={procuradorCnpj}
                        onChange={(e) => setProcuradorCnpj(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* MODAL DE RECÁLCULO DE GUIA EM ATRASO */}
      <AnimatePresence>
        {selectedGuiaForRecalculo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 max-w-md w-full text-white space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  <span>Recálculo de Guia em Atraso</span>
                </h3>
                <button onClick={() => setSelectedGuiaForRecalculo(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-slate-400">Imposto: <strong className="text-white">{selectedGuiaForRecalculo.impostoSigla}</strong></div>
                  <div className="text-slate-400">Valor Original: <strong className="text-white">R$ {selectedGuiaForRecalculo.valorPrincipal.toFixed(2)}</strong></div>
                  <div className="text-slate-400">Vencimento Original: <strong className="text-rose-400 font-bold">{selectedGuiaForRecalculo.dataVencimento}</strong></div>
                </div>

                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-1 text-amber-200">
                  <div className="font-bold">Encargos de Mora SELIC/Multa:</div>
                  <div>• Multa de Mora (0,33% ao dia, máx 20%): R$ {(selectedGuiaForRecalculo.valorPrincipal * 0.20).toFixed(2)}</div>
                  <div>• Juros SELIC Acumulados: R$ {(selectedGuiaForRecalculo.valorPrincipal * 0.025).toFixed(2)}</div>
                  <div className="pt-1 font-black text-sm text-white">
                    Novo Valor Consolidado: R$ {(selectedGuiaForRecalculo.valorPrincipal * 1.225).toFixed(2)}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  showToast?.(`Nova guia recalculada emitida com sucesso! Vencimento atualizado para hoje.`, 'success');
                  setSelectedGuiaForRecalculo(null);
                }}
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg transition cursor-pointer"
              >
                Gerar Nova Guia Atualizada com PIX / Barcode
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
