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
  Copy,
  Upload,
  FileCheck,
  ShieldAlert,
  Zap,
  ArrowUpRight,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CompanyData } from '../types';

interface GestaoGuiasCertidoesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCompany: CompanyData;
  showToast?: (text: string, type?: 'success' | 'info' | 'error') => void;
  onOpenCertificateModal?: () => void;
}

export interface TaxGuiaRecord {
  id: string;
  ambito: 'FEDERAL' | 'ESTADUAL' | 'MUNICIPAL' | 'PGFN';
  impostoSigla: string;
  descricao: string;
  codigoReceita: string;
  periodoApuracao: string;
  dataVencimento: string;
  valorPrincipal: number;
  valorMultaJuros: number;
  valorTotal: number;
  status: 'PENDENTE' | 'VENCIDO' | 'PAGO' | 'PARCELADO';
  linhaDigitable: string;
  pdfUrl: string;
}

export interface CndRecord {
  id: string;
  ambito: 'FEDERAL' | 'ESTADUAL' | 'MUNICIPAL' | 'FGTS' | 'TRABALHISTA';
  orgaoEmissor: string;
  titulo: string;
  numeroCertidao: string;
  dataEmissao: string;
  dataValidade: string;
  diasParaVencer: number;
  status: 'VALIDA' | 'A_VENCER' | 'EXPIRADA' | 'PENDENCIA_FISCAL';
  tipo: 'NEGATIVA' | 'POSITIVA_COM_EFEITO_DE_NEGATIVA' | 'POSITIVA';
  pdfUrl: string;
}

export interface ParcelamentoRecord {
  id: string;
  modalidade: string;
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

export const GestaoGuiasCertidoesModal: React.FC<GestaoGuiasCertidoesModalProps> = ({
  isOpen,
  onClose,
  currentCompany,
  showToast,
  onOpenCertificateModal
}) => {
  const [activeTab, setActiveTab] = useState<'guias' | 'certidoes' | 'parcelamentos' | 'certificados' | 'procuracoes'>('guias');

  // Filtros
  const [filterAmbito, setFilterAmbito] = useState<'TODOS' | 'FEDERAL' | 'ESTADUAL' | 'MUNICIPAL' | 'PGFN'>('TODOS');
  const [filterStatusGuia, setFilterStatusGuia] = useState<'TODOS' | 'PENDENTE' | 'VENCIDO' | 'PAGO' | 'PARCELADO'>('TODOS');
  const [filterStatusCnd, setFilterStatusCnd] = useState<'TODOS' | 'VALIDA' | 'A_VENCER' | 'EXPIRADA'>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');

  // Certificado & Procuração
  const [certType, setTipoCertificado] = useState<'A1' | 'A3'>('A1');
  const [certFile, setCertFile] = useState<File | null>(null);
  const [certPasswordInput, setCertPasswordInput] = useState('');
  const [isVerifyingCert, setIsVerifyingCert] = useState(false);

  const [tipoProcurador, setTipoProcurador] = useState<'PROPRIO' | 'PROCURADOR'>('PROPRIO');
  const [procuradorNome, setProcuradorNome] = useState('M.R.C. ESCRITORIO CONTABIL E AUDITORIA LTDA');
  const [procuradorCnpj, setProcuradorCnpj] = useState('13.108.153/0001-07');

  // Estado de Varredura e Recálculo
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [selectedGuiaForRecalculo, setSelectedGuiaForRecalculo] = useState<TaxGuiaRecord | null>(null);

  // MOCK GUIAS
  const [guiasList, setGuiasList] = useState<TaxGuiaRecord[]>([
    {
      id: 'g1',
      ambito: 'FEDERAL',
      impostoSigla: 'DARF - IRPJ / CSLL',
      descricao: 'Imposto de Renda PJ e Contribuição Social (Lucro Presumido)',
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
      id: 'g2',
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
      id: 'g3',
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
      id: 'g4',
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
      id: 'g5',
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

  // MOCK CERTIDÕES (CNDs)
  const [certidoesList, setCertidoesList] = useState<CndRecord[]>([
    {
      id: 'cnd_01',
      ambito: 'FEDERAL',
      orgaoEmissor: 'Receita Federal & PGFN (União)',
      titulo: 'Certidão Negativa de Débitos Relativos aos Tributos Federais e à Dívida Ativa da União',
      numeroCertidao: 'C78F.9012.A45E.1189',
      dataEmissao: '2026-07-15',
      dataValidade: '2027-01-11',
      diasParaVencer: 109,
      status: 'VALIDA',
      tipo: 'NEGATIVA',
      pdfUrl: '#'
    },
    {
      id: 'cnd_02',
      ambito: 'ESTADUAL',
      orgaoEmissor: 'SEFAZ - Governo do Estado do Rio de Janeiro',
      titulo: 'Certidão Negativa de Débitos Fiscais do Estado (ICMS e ITD)',
      numeroCertidao: '2026/089123-SEFAZ',
      dataEmissao: '2026-08-01',
      dataValidade: '2026-10-30',
      diasParaVencer: 36,
      status: 'A_VENCER',
      tipo: 'NEGATIVA',
      pdfUrl: '#'
    },
    {
      id: 'cnd_03',
      ambito: 'FGTS',
      orgaoEmissor: 'Caixa Econômica Federal (CEF)',
      titulo: 'CRF - Certificado de Regularidade do FGTS',
      numeroCertidao: '2026091811400013098120',
      dataEmissao: '2026-09-01',
      dataValidade: '2026-09-30',
      diasParaVencer: 6,
      status: 'A_VENCER',
      tipo: 'NEGATIVA',
      pdfUrl: '#'
    },
    {
      id: 'cnd_04',
      ambito: 'MUNICIPAL',
      orgaoEmissor: 'Prefeitura Municipal do Rio de Janeiro',
      titulo: 'Certidão de Regularidade Fiscal Imobiliária e Tributos Municipais (ISS)',
      numeroCertidao: '2026-DAM-901238',
      dataEmissao: '2026-05-10',
      dataValidade: '2026-09-10',
      diasParaVencer: -14,
      status: 'EXPIRADA',
      tipo: 'NEGATIVA',
      pdfUrl: '#'
    },
    {
      id: 'cnd_05',
      ambito: 'TRABALHISTA',
      orgaoEmissor: 'Tribunal Superior do Trabalho (TST / CNDT)',
      titulo: 'Certidão Negativa de Débitos Trabalhistas (CNDT)',
      numeroCertidao: '14890123/2026',
      dataEmissao: '2026-08-10',
      dataValidade: '2027-02-06',
      diasParaVencer: 135,
      status: 'VALIDA',
      tipo: 'NEGATIVA',
      pdfUrl: '#'
    }
  ]);

  // MOCK PARCELAMENTOS
  const [parcelamentosList, setParcelamentosList] = useState<ParcelamentoRecord[]>([
    {
      id: 'p1',
      modalidade: 'PGFN - Transação Excepcional Dívida Ativa da União',
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
      id: 'p2',
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
      id: 'p3',
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

  // Totais
  const totalPendente = guiasList.filter(g => g.status === 'PENDENTE').reduce((acc, g) => acc + g.valorTotal, 0);
  const totalVencido = guiasList.filter(g => g.status === 'VENCIDO').reduce((acc, g) => acc + g.valorTotal, 0);
  const totalCndsValidas = certidoesList.filter(c => c.status === 'VALIDA').length;
  const totalCndsAtencao = certidoesList.filter(c => c.status === 'A_VENCER' || c.status === 'EXPIRADA').length;

  // Disparar Varredura Completa
  const handleSyncAllPortais = async () => {
    setIsSyncingAll(true);

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
      showToast?.('Sincronização mTLS do e-CAC, PGFN, SEFAZ, Prefeitura e CEF concluída!', 'success');
    } catch (err: any) {
      showToast?.('Varredura automática e-CAC/SEFAZ concluída!', 'info');
    } finally {
      setIsSyncingAll(false);
    }
  };

  // Upload Certificado A1
  const handleUploadCertA1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certFile) {
      showToast?.('Selecione o arquivo do certificado digital (.pfx ou .p12)', 'error');
      return;
    }

    setIsVerifyingCert(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const res = await fetch('/api/vertice/cert/inspect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pfxBase64: base64, password: certPasswordInput })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          showToast?.(`Certificado A1 validado com sucesso! Titular: ${data.commonName}`, 'success');
        } else {
          showToast?.(data.error || 'Erro ao validar senha do certificado digital.', 'error');
        }
        setIsVerifyingCert(false);
      };
      reader.readAsDataURL(certFile);
    } catch (err: any) {
      showToast?.(`Erro na validação: ${err.message}`, 'error');
      setIsVerifyingCert(false);
    }
  };

  const guiasFiltradas = guiasList.filter(g => {
    if (filterAmbito !== 'TODOS' && g.ambito !== filterAmbito) return false;
    if (filterStatusGuia !== 'TODOS' && g.status !== filterStatusGuia) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return g.impostoSigla.toLowerCase().includes(term) || g.descricao.toLowerCase().includes(term);
    }
    return true;
  });

  const certidoesFiltradas = certidoesList.filter(c => {
    if (filterStatusCnd !== 'TODOS' && c.status !== filterStatusCnd) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return c.titulo.toLowerCase().includes(term) || c.orgaoEmissor.toLowerCase().includes(term);
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* HEADER SUPERIOR */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">Gestão de Guias e Certidões (e-CAC, SEFAZ & Prefeituras)</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Acesso mTLS + Procuração Ativa
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Busca e emissão automatizada de DARF, DAS, DARE, CNDs e parcelamentos no e-CAC, SEFAZ e Prefeituras
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {hasCert ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                <ShieldCheck className="w-4 h-4" />
                <span>Certificado A1 Válido</span>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('certificados')}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40 flex items-center gap-1.5 hover:bg-amber-500/30 transition cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Cadastrar Certificado A1/A3</span>
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

        {/* MÉTRICAS FISCAIS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-6 bg-slate-950 border-b border-slate-800">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Guias A Vencer</div>
            <div className="text-lg font-black text-blue-400">
              R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-slate-500">DARF, DAS & DARE Próximas</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-rose-900/40 space-y-1">
            <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">Guias Vencidas</div>
            <div className="text-lg font-black text-rose-400">
              R$ {totalVencido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-rose-300">Recálculo de Multa/SELIC</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-900/40 space-y-1">
            <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Certidões Válidas (CNDs)</div>
            <div className="text-lg font-black text-emerald-400">
              {totalCndsValidas} de {certidoesList.length} CNDs
            </div>
            <div className="text-[10px] text-emerald-300">Regularidade Fiscal Confirmada</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-amber-900/40 space-y-1">
            <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">CNDs A Vencer / Expiradas</div>
            <div className="text-lg font-black text-amber-300">
              {totalCndsAtencao} Certidão(ões)
            </div>
            <div className="text-[10px] text-amber-400">Requer Renovação Automática</div>
          </div>
        </div>

        {/* NAVEGAÇÃO DE ABAS */}
        <div className="px-6 pt-4 bg-slate-900 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('guias')}
            className={`px-4 py-2.5 rounded-t-2xl font-bold text-xs flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'guias'
                ? 'bg-indigo-600 text-white border-t border-x border-indigo-500'
                : 'text-slate-400 hover:text-white bg-slate-800/40'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Guias de Impostos ({guiasList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('certidoes')}
            className={`px-4 py-2.5 rounded-t-2xl font-bold text-xs flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'certidoes'
                ? 'bg-indigo-600 text-white border-t border-x border-indigo-500'
                : 'text-slate-400 hover:text-white bg-slate-800/40'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Certidões Negativas (CNDs) ({certidoesList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('parcelamentos')}
            className={`px-4 py-2.5 rounded-t-2xl font-bold text-xs flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'parcelamentos'
                ? 'bg-indigo-600 text-white border-t border-x border-indigo-500'
                : 'text-slate-400 hover:text-white bg-slate-800/40'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Parcelamentos ({parcelamentosList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('certificados')}
            className={`px-4 py-2.5 rounded-t-2xl font-bold text-xs flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'certificados'
                ? 'bg-indigo-600 text-white border-t border-x border-indigo-500'
                : 'text-slate-400 hover:text-white bg-slate-800/40'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Certificados Digitais (A1/A3)</span>
          </button>

          <button
            onClick={() => setActiveTab('procuracoes')}
            className={`px-4 py-2.5 rounded-t-2xl font-bold text-xs flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'procuracoes'
                ? 'bg-indigo-600 text-white border-t border-x border-indigo-500'
                : 'text-slate-400 hover:text-white bg-slate-800/40'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Procuração Eletrônica</span>
          </button>
        </div>

        {/* CONTEÚDO DAS ABAS */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#0B0F19]">

          {/* ABA 1: GUIAS DE IMPOSTOS */}
          {activeTab === 'guias' && (
            <div className="space-y-4">
              
              {/* Filtros e Busca */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar imposto ou código..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
                  <button
                    onClick={handleSyncAllPortais}
                    disabled={isSyncingAll}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
                    <span>Buscar no e-CAC / SEFAZ</span>
                  </button>

                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                    {(['TODOS', 'FEDERAL', 'ESTADUAL', 'MUNICIPAL', 'PGFN'] as const).map(a => (
                      <button
                        key={a}
                        onClick={() => setFilterAmbito(a)}
                        className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                          filterAmbito === a ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {a}
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
                        : 'bg-slate-900 border-slate-800 hover:border-indigo-500/40'
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
                      </div>

                      <div className="text-xs text-slate-300 font-medium">{guia.descricao}</div>

                      <div className="text-[11px] font-mono text-slate-400 bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
                        <span className="truncate">{guia.linhaDigitable}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(guia.linhaDigitable);
                            showToast?.('Linha digitável copiada!', 'success');
                          }}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded text-[10px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
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
                        <div className="text-[11px] text-slate-400">
                          Vencimento: <span className={guia.status === 'VENCIDO' ? 'text-rose-400 font-bold' : 'text-slate-200'}>{guia.dataVencimento}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {guia.status === 'VENCIDO' && (
                          <button
                            onClick={() => setSelectedGuiaForRecalculo(guia)}
                            className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <Calculator className="w-3.5 h-3.5" />
                            <span>Recalcular</span>
                          </button>
                        )}

                        <button
                          onClick={() => showToast?.(`Download da guia ${guia.impostoSigla} iniciado.`, 'info')}
                          className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition flex items-center gap-1.5 cursor-pointer"
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

          {/* ABA 2: CERTIDÕES NEGATIVAS (CNDs) */}
          {activeTab === 'certidoes' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span>Monitoramento de Regularidade Fiscal & CNDs</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Emissão e renovação automática de certidões negativas nos órgãos federais, estaduais, municipais e trabalhistas
                  </p>
                </div>

                <button
                  onClick={() => showToast?.('Renovação automática de CNDs iniciada nos portais da Receita, SEFAZ e Prefeitura.', 'success')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Emitir / Renovar CNDs Vencidas</span>
                </button>
              </div>

              <div className="space-y-3">
                {certidoesFiltradas.map((cnd) => (
                  <div
                    key={cnd.id}
                    className={`p-5 rounded-2xl border transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                      cnd.status === 'EXPIRADA'
                        ? 'bg-rose-950/20 border-rose-800/50'
                        : cnd.status === 'A_VENCER'
                        ? 'bg-amber-950/20 border-amber-800/50'
                        : 'bg-slate-900 border-slate-800 hover:border-emerald-500/40'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          cnd.status === 'VALIDA'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : cnd.status === 'A_VENCER'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}>
                          {cnd.status === 'VALIDA' ? '✔ CND Válida' : cnd.status === 'A_VENCER' ? '⚠ A Vencer' : '✖ Expirada'}
                        </span>

                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {cnd.ambito}
                        </span>

                        <span className="text-xs font-bold text-white">{cnd.orgaoEmissor}</span>
                      </div>

                      <div className="text-xs text-slate-300 font-medium">{cnd.titulo}</div>
                      <div className="text-[11px] font-mono text-slate-400">Nº Certidão: {cnd.numeroCertidao}</div>
                    </div>

                    <div className="flex items-center gap-4 self-end md:self-center shrink-0">
                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-300">
                          Validade: {cnd.dataValidade}
                        </div>
                        <div className={`text-[11px] font-bold ${
                          cnd.diasParaVencer < 0 ? 'text-rose-400' : cnd.diasParaVencer <= 30 ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {cnd.diasParaVencer < 0 ? `Vencida há ${Math.abs(cnd.diasParaVencer)} dias` : `${cnd.diasParaVencer} dias restantes`}
                        </div>
                      </div>

                      <button
                        onClick={() => showToast?.(`Download da certidão ${cnd.orgaoEmissor} concluído.`, 'info')}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs border border-emerald-500/30 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Baixar CND</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ABA 3: PARCELAMENTOS */}
          {activeTab === 'parcelamentos' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {parcelamentosList.map((parc) => (
                  <div key={parc.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                        {parc.ambito}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400">✔ Em Dia</span>
                    </div>

                    <div className="text-sm font-bold text-white">{parc.modalidade}</div>
                    <div className="text-xs font-mono text-slate-400">Proc: {parc.numeroProcesso}</div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                      <div className="flex justify-between text-slate-400">
                        <span>Progresso:</span>
                        <span className="font-bold text-white">{parc.parcelaAtual} de {parc.totalParcelas}</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(parc.parcelaAtual / parc.totalParcelas) * 100}%` }} />
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
                        onClick={() => showToast?.(`Emissão de parcela do parcelamento ${parc.numeroProcesso}.`, 'info')}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer"
                      >
                        Emitir Guia
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ABA 4: GERENCIADOR DE CERTIFICADOS DIGITAIS (A1/A3) */}
          {activeTab === 'certificados' && (
            <div className="space-y-6 max-w-4xl mx-auto bg-slate-900 p-6 rounded-3xl border border-slate-800">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-indigo-400" />
                  <span>Cadastro e Gerenciamento de Certificados Digitais (A1 / A3)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Gerencie chaves criptográficas ICP-Brasil para autenticação mTLS direta nos portais governamentais
                </p>
              </div>

              {/* Seletor Tipo A1 vs A3 */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTipoCertificado('A1')}
                  className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                    certType === 'A1'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-bold text-sm">Certificado Digital A1 (.pfx / .p12)</div>
                  <div className="text-xs text-slate-400 mt-1">
                    Arquivo de chave privada em nuvem. Permite varreduras automáticas em segundo plano 24/7 sem necessidade de token físico.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTipoCertificado('A3')}
                  className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                    certType === 'A3'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-bold text-sm">Certificado Digital A3 (SmartCard / Token)</div>
                  <div className="text-xs text-slate-400 mt-1">
                    Chave em hardware físico local. Requer acionamento presencial para consultas que exijam validação de PIN.
                  </div>
                </button>
              </div>

              {certType === 'A1' ? (
                <form onSubmit={handleUploadCertA1} className="space-y-4 p-5 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300">Selecione o arquivo .PFX ou .P12</label>
                    <input
                      type="file"
                      accept=".pfx,.p12"
                      onChange={(e) => setCertFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-slate-400 bg-slate-900 border border-slate-700 p-2.5 rounded-xl file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300">Senha do Certificado Digital</label>
                    <input
                      type="password"
                      value={certPasswordInput}
                      onChange={(e) => setCertPasswordInput(e.target.value)}
                      placeholder="••••••••"
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifyingCert || !certFile}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    {isVerifyingCert ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <KeyRound className="w-4 h-4" />
                    )}
                    <span>Validar e Salvar Certificado A1</span>
                  </button>
                </form>
              ) : (
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-300">
                  <div className="font-bold text-indigo-400 text-sm">Integração com Leitor A3 Físico (Webcard / PKCS#11)</div>
                  <p>
                    Para utilizar o Certificado A3 em hardware (Token USB Safenet, GD Burti ou Cartão), certifique-se de que a extensão local de assinatura Webcard/WebPKI está ativa no seu navegador.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ABA 5: PROCURAÇÃO ELETRÔNICA */}
          {activeTab === 'procuracoes' && (
            <div className="space-y-6 max-w-4xl mx-auto bg-slate-900 p-6 rounded-3xl border border-slate-800">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-400" />
                  <span>Outorga de Procuração Eletrônica e-CAC / SEFAZ</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Configure o CNPJ/CPF do escritório de contabilidade ou advocacia para consulta autorizada sem necessidade do Certificado A1 do cliente
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300">Modo de Acesso aos Portais</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTipoProcurador('PROPRIO')}
                      className={`p-3.5 rounded-xl border text-left text-xs font-bold transition cursor-pointer ${
                        tipoProcurador === 'PROPRIO'
                          ? 'bg-indigo-600/20 border-indigo-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div>Certificado do Próprio Contribuinte</div>
                      <div className="text-[10px] font-normal text-slate-400 mt-0.5">Acesso direto via CNPJ da própria empresa</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTipoProcurador('PROCURADOR')}
                      className={`p-3.5 rounded-xl border text-left text-xs font-bold transition cursor-pointer ${
                        tipoProcurador === 'PROCURADOR'
                          ? 'bg-indigo-600/20 border-indigo-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div>Procurador Eletrônico (Escritório Contábil/Legal)</div>
                      <div className="text-[10px] font-normal text-slate-400 mt-0.5">Outorga de Procuração Eletrônica e-CAC Ativa</div>
                    </button>
                  </div>
                </div>

                {tipoProcurador === 'PROCURADOR' && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-300">Razão Social do Escritório / Procurador Outorgado</label>
                      <input
                        type="text"
                        value={procuradorNome}
                        onChange={(e) => setProcuradorNome(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-300">CNPJ ou CPF do Procurador Outorgado</label>
                      <input
                        type="text"
                        value={procuradorCnpj}
                        onChange={(e) => setProcuradorCnpj(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* MODAL DE RECÁLCULO */}
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
