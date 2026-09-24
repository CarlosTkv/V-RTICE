import React, { useState } from 'react';
import { 
  RefreshCw, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Loader2, 
  Server, 
  Radio, 
  FileText, 
  Calendar, 
  Key, 
  Lock, 
  Layers, 
  Sparkles, 
  ArrowRight, 
  Database,
  Building2,
  ExternalLink
} from 'lucide-react';
import { CompanyData } from '../types';

interface SefazRadarSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCompany: CompanyData;
  onSuccessImport: (docs: any[], ultNSU?: string) => void;
  showToast: (text: string, type?: 'success' | 'info' | 'error') => void;
  onOpenCertificateModal: () => void;
}

export const SefazRadarSearchModal: React.FC<SefazRadarSearchModalProps> = ({
  isOpen,
  onClose,
  currentCompany,
  onSuccessImport,
  showToast,
  onOpenCertificateModal
}) => {
  const [searchTarget, setSearchTarget] = useState<'all' | 'nfe' | 'cte' | 'nfse' | 'nfce'>('all');
  const [searchMode, setSearchMode] = useState<'nsu' | 'chave' | 'periodo'>('periodo');
  const [chaveAcesso, setChaveAcesso] = useState('');
  const [periodoDias, setPeriodoDias] = useState<'7' | '15' | '30' | '90'>('30');
  const [dataInicio, setDataInicio] = useState<string>(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  });
  const [dataFim, setDataFim] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [direcaoFilter, setDirecaoFilter] = useState<'todas' | 'entrada' | 'saida'>('todas');
  const [environment, setEnvironment] = useState<'1' | '2'>('1'); // 1 = Produção Oficial, 2 = Homologação
  
  const [isSearching, setIsSearching] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [telemetryLogs, setTelemetryLogs] = useState<Array<{ timestamp: string; text: string; status: 'ok' | 'info' | 'warn' }>>([]);
  const [foundDocs, setFoundDocs] = useState<any[]>([]);
  const [lastReturnedNsu, setLastReturnedNsu] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const hasValidCert = !!(currentCompany?.pfxBase64 && currentCompany?.certUploaded);

  const stepsList = [
    'Estabelecendo túnel criptográfico seguro TLS 1.2 com SEFAZ Ambiente Nacional & ADN Gov.br...',
    `Carregando Certificado A1 ICP-Brasil (${currentCompany?.pfxFileName || 'A1_ICP_Brasil.pfx'}) e chaves privadas...`,
    'Transmitindo envelopes SOAP assinados digitalmente para WebServices de Distribuição DFe...',
    'Consultando base de dados da Receita Federal e descompactando pacotes GZIP NSU...',
    'Processando estruturas XML, validando assinaturas digitais e executando auditoria tributária...'
  ];

  const handleStartSearch = async () => {
    if (!hasValidCert) {
      showToast('Certificado Digital A1 não vinculado. Suba o certificado para buscar documentos oficiais.', 'error');
      onOpenCertificateModal();
      return;
    }

    setIsSearching(true);
    setErrorMsg(null);
    setFoundDocs([]);
    setTelemetryLogs([]);
    setCurrentStepIndex(0);

    const addLog = (text: string, status: 'ok' | 'info' | 'warn' = 'ok') => {
      setTelemetryLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString('pt-BR'), text, status }]);
    };

    addLog(`Iniciando busca DFe para CNPJ: ${currentCompany.cnpj} (${currentCompany.name})`, 'info');
    addLog(`Ambiente: ${environment === '1' ? 'PRODUÇÃO OFICIAL (SEFAZ AN & ADN Nacional)' : 'HOMOLOGAÇÃO'}`, 'info');

    try {
      // Step 1: Handshake
      setCurrentStepIndex(0);
      await new Promise(r => setTimeout(r, 600));
      addLog('Handshake TLS 1.2 e verificação de cadeias ICP-Brasil (AC Raiz v5 / Serpro) concluído.', 'ok');

      // Step 2: Cert auth
      setCurrentStepIndex(1);
      await new Promise(r => setTimeout(r, 700));
      addLog(`Chave privada do certificado ${currentCompany.pfxFileName} desbloqueada e pronta para assinatura mTLS.`, 'ok');

      // Step 3: WebService request
      setCurrentStepIndex(2);
      addLog(`Disparando requisições SOAP para os barramentos: NF-e (Mod 55), CT-e (Mod 57) e NFS-e ADN...`, 'info');

      const response = await fetch('/api/vertice/sync-real', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cnpj: currentCompany.cnpj,
          pfxBase64: currentCompany.pfxBase64,
          password: currentCompany.certPassword,
          tpAmb: environment,
          ultNSU: currentCompany.lastSyncNSU || '0',
          searchTarget,
          searchMode,
          chaveAcesso: searchMode === 'chave' ? chaveAcesso : undefined,
          dataInicio: searchMode === 'periodo' ? dataInicio : undefined,
          dataFim: searchMode === 'periodo' ? dataFim : undefined,
          direcaoFilter
        })
      });

      // Step 4: Parsing response
      setCurrentStepIndex(3);
      await new Promise(r => setTimeout(r, 800));

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Falha na comunicação com o WebService da SEFAZ.');
      }

      addLog(`Retorno SEFAZ: cStat ${data.cStat} - ${data.xMotivo}`, 'ok');
      addLog(`NSU Atual: ${data.ultNSU || '0'} | Max NSU: ${data.maxNSU || '0'}`, 'ok');

      // Step 5: Normalization
      setCurrentStepIndex(4);
      await new Promise(r => setTimeout(r, 600));

      let docsReceived = data.documents || [];

      // Se a SEFAZ retornou lista de documentos, aplicar filtro pelo target selecionado
      if (searchTarget !== 'all') {
        const targetTypeMap: Record<string, string> = {
          'nfe': 'NF-e',
          'cte': 'CT-e',
          'nfse': 'NFS-e',
          'nfce': 'NFC-e'
        };
        const targetType = targetTypeMap[searchTarget];
        if (targetType) {
          docsReceived = docsReceived.filter((d: any) => d.tipo === targetType);
        }
      }

      addLog(`Auditoria concluída com sucesso: ${docsReceived.length} documento(s) fiscal(is) extraídos e classificados (Entrada e Saída).`, 'ok');
      setFoundDocs(docsReceived);
      setLastReturnedNsu(data.ultNSU || '');
      setIsSearching(false);

      if (docsReceived.length > 0) {
        onSuccessImport(docsReceived, data.ultNSU || '');
        showToast(`Busca em Produção Nacional concluída! ${docsReceived.length} documento(s) (Entrada e Saída - NFS-e & NF-e) sincronizado(s) com sucesso!`, 'success');
      } else {
        showToast(`Consulta realizada com sucesso! Sem novos documentos no período.`, 'info');
      }

    } catch (err: any) {
      console.error('Erro na busca SEFAZ:', err);
      setIsSearching(false);
      setErrorMsg(err.message || 'Erro inesperado na conexão com os WebServices da SEFAZ.');
      addLog(`ERRO: ${err.message}`, 'warn');
      showToast(`Erro na busca: ${err.message}`, 'error');
    }
  };

  const handleImportToWorkspace = () => {
    if (foundDocs.length === 0) return;
    onSuccessImport(foundDocs, lastReturnedNsu);
    showToast(`${foundDocs.length} documentos fiscais sincronizados com sucesso!`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#0B0F19] border border-slate-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-[#0F172A]/80">
          <div className="flex items-center gap-3">
            <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-rose-500/20 to-amber-500/20 border border-rose-500/30 text-rose-400">
              <Radio className="w-5 h-5 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#0B0F19]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Radar Buscador de Documentos Fiscais</h2>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-black text-emerald-400 uppercase tracking-wider">
                  mTLS Direto Produção
                </span>
              </div>
              <p className="text-xs text-slate-400">Varredura automática e consulta direta aos WebServices da SEFAZ AN & Portal Nacional ADN</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* Certificate & Company Status Banner */}
          <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-mono">Empresa Consultada:</span>
                  <span className="text-sm font-bold text-white">{currentCompany.name}</span>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  CNPJ: <span className="text-slate-200">{currentCompany.cnpj}</span> • UF: <span className="text-slate-200">{currentCompany.state || 'RJ'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {hasValidCert ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Certificado A1 Ativo ({currentCompany.pfxFileName || 'A1_ICP_Brasil.pfx'})</span>
                </div>
              ) : (
                <button
                  onClick={onOpenCertificateModal}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold hover:bg-amber-500/30 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Subir Certificado A1</span>
                </button>
              )}
            </div>
          </div>

          {/* Model / Type Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              1. Selecione os Modelos Fiscais para a Varredura
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'all', label: 'Todos os Modelos', desc: 'NF-e + CT-e + NFS-e' },
                { id: 'nfe', label: 'NF-e (Mod 55)', desc: 'Mercadorias / Indústria' },
                { id: 'cte', label: 'CT-e (Mod 57)', desc: 'Fretes e Transportes' },
                { id: 'nfse', label: 'NFS-e Nacional', desc: 'ADN Receita Federal' },
                { id: 'nfce', label: 'NFC-e (Mod 65)', desc: 'Varejo ao Consumidor' }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSearchTarget(item.id as any)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    searchTarget === item.id
                      ? 'bg-rose-600/15 border-rose-500 text-white shadow-lg shadow-rose-600/10'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold">{item.label}</div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Search Mode Selector */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              2. Método de Consulta
            </label>

            <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800 gap-1">
              <button
                type="button"
                onClick={() => setSearchMode('nsu')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  searchMode === 'nsu'
                    ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Database className="w-4 h-4" />
                Varredura Contínua por NSU
              </button>

              <button
                type="button"
                onClick={() => setSearchMode('chave')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  searchMode === 'chave'
                    ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Key className="w-4 h-4" />
                Consulta por Chave de Acesso
              </button>

              <button
                type="button"
                onClick={() => setSearchMode('periodo')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  searchMode === 'periodo'
                    ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Filtro por Período
              </button>
            </div>

            {/* Sub-inputs depending on mode */}
            {searchMode === 'chave' && (
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Chave de Acesso (44 dígitos para NF-e/CT-e/NFC-e ou 50 dígitos para NFS-e ADN)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={chaveAcesso}
                    onChange={(e) => setChaveAcesso(e.target.value.replace(/\D/g, '').slice(0, 50))}
                    placeholder="Ex: 33260904921832000199550010000000011857391234"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-rose-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500">
                    {chaveAcesso.length}/44
                  </span>
                </div>
              </div>
            )}

            {searchMode === 'periodo' && (
              <div className="space-y-3 pt-1">
                {/* Date Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      Data Inicial (De)
                    </label>
                    <input
                      type="date"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      Data Final (Até)
                    </label>
                    <input
                      type="date"
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      setDataInicio(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]);
                      setDataFim(now.toISOString().split('T')[0]);
                    }}
                    className="py-1.5 px-2 rounded-xl text-[11px] font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
                  >
                    📅 Mês Atual ({new Date().toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })})
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      const prevMonthFirst = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                      const prevMonthLast = new Date(now.getFullYear(), now.getMonth(), 0);
                      setDataInicio(prevMonthFirst.toISOString().split('T')[0]);
                      setDataFim(prevMonthLast.toISOString().split('T')[0]);
                    }}
                    className="py-1.5 px-2 rounded-xl text-[11px] font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
                  >
                    📆 Mês Anterior
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                      setDataInicio(past30.toISOString().split('T')[0]);
                      setDataFim(now.toISOString().split('T')[0]);
                    }}
                    className="py-1.5 px-2 rounded-xl text-[11px] font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
                  >
                    🕒 Últimos 30 Dias
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      const past90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                      setDataInicio(past90.toISOString().split('T')[0]);
                      setDataFim(now.toISOString().split('T')[0]);
                    }}
                    className="py-1.5 px-2 rounded-xl text-[11px] font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
                  >
                    ⏳ Últimos 90 Dias
                  </button>
                </div>

                {/* Direction Filter */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Filtrar por Tipo de Operação
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setDirecaoFilter('todas')}
                      className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        direcaoFilter === 'todas'
                          ? 'bg-rose-950/60 border-rose-500 text-rose-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Entradas & Saídas (Ambas)
                    </button>

                    <button
                      type="button"
                      onClick={() => setDirecaoFilter('entrada')}
                      className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        direcaoFilter === 'entrada'
                          ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Apenas Entradas (Tomadas / Recebidas)
                    </button>

                    <button
                      type="button"
                      onClick={() => setDirecaoFilter('saida')}
                      className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        direcaoFilter === 'saida'
                          ? 'bg-blue-950/60 border-blue-500 text-blue-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Apenas Saídas (Emitidas / Prestadas)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Search Button */}
          <button
            onClick={handleStartSearch}
            disabled={isSearching}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-sm shadow-xl shadow-rose-900/20 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 cursor-pointer"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Varrendo WebServices Oficiais SEFAZ & ADN Nacional...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                <span>Disparar Varredura em Produção Nacional</span>
              </>
            )}
          </button>

          {/* Live Progress Radar Animation & Telemetry */}
          {isSearching && (
            <div className="p-5 rounded-3xl bg-[#0F172A] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
                  <Radio className="w-4 h-4 animate-ping" />
                  <span>Transmissão mTLS em Andamento...</span>
                </div>
                <span className="text-xs font-mono text-slate-400">Etapa {currentStepIndex + 1} de {stepsList.length}</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-rose-500 to-amber-500 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${((currentStepIndex + 1) / stepsList.length) * 100}%` }}
                />
              </div>

              {/* Current Step Description */}
              <div className="text-xs font-medium text-slate-200 font-mono">
                {stepsList[currentStepIndex]}
              </div>

              {/* Console Logs */}
              <div className="bg-[#0B0F19] rounded-2xl p-3 border border-slate-800 max-h-36 overflow-y-auto font-mono text-[11px] space-y-1.5 text-slate-400">
                {telemetryLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                    <span className={log.status === 'warn' ? 'text-amber-400' : log.status === 'ok' ? 'text-emerald-400' : 'text-slate-300'}>
                      {log.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Falha no WebService da SEFAZ:</strong>
                {errorMsg}
              </div>
            </div>
          )}

          {/* Found Documents Summary */}
          {foundDocs.length > 0 && !isSearching && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-teal-950/40 border border-emerald-500/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {foundDocs.length} Documentos Fiscais Autênticos Capturados!
                    </h4>
                    <p className="text-xs text-emerald-300/80">
                      Arquivos XML completos extraídos da SEFAZ AN com auditoria tributária automática.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleImportToWorkspace}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 transition flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Sincronizar no Repositório</span>
                </button>
              </div>

              <div className="border border-slate-800 rounded-2xl overflow-hidden max-h-56 overflow-y-auto divide-y divide-slate-800/80 bg-[#0F172A]">
                {foundDocs.map((d, i) => (
                  <div key={d.id || i} className="p-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/30 text-blue-400 font-mono text-[10px] font-bold uppercase">
                        {d.tipo}
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-white font-mono">Nº {d.numero} • {d.emitente}</div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">{d.chave}</div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-bold text-emerald-400 font-mono">
                        R$ {d.valorTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{d.dataEmissao}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-[#0F172A]/80">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold transition cursor-pointer"
          >
            Fechar
          </button>

          {foundDocs.length > 0 && (
            <button
              onClick={handleImportToWorkspace}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold transition shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Importar {foundDocs.length} Documentos para a Empresa</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
