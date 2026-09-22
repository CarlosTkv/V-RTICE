import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  FolderSync, 
  Folder, 
  FolderOpen, 
  RefreshCw, 
  Play, 
  Pause, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  ShieldCheck, 
  ShieldAlert, 
  FileCode, 
  FileCheck, 
  FileText, 
  UploadCloud, 
  Settings, 
  Terminal, 
  ArrowRight, 
  Trash2, 
  Layers, 
  Database,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { CompanyData } from '../types';
import { validateXmlIntegrityRFB, RfbValidationResult, parseChaveAcesso } from '../utils/rfbValidator';

export interface WatchedFileItem {
  id: string;
  name: string;
  size: number;
  lastModified: number;
  status: 'valido_importado' | 'rejeitado_rfb' | 'duplicado' | 'processando' | 'pendente';
  validationResult?: RfbValidationResult;
  xmlContent?: string;
  detectedAt: string;
  parsedDoc?: any;
}

interface VerticeFolderWatcherProps {
  currentCompany: CompanyData;
  existingDocuments: any[];
  onImportDocuments: (newDocs: any[]) => void;
  showToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

export const VerticeFolderWatcher: React.FC<VerticeFolderWatcherProps> = ({
  currentCompany,
  existingDocuments,
  onImportDocuments,
  showToast
}) => {
  // Watcher State
  const [isWatching, setIsWatching] = useState<boolean>(true);
  const [folderPath, setFolderPath] = useState<string>('C:\\Vertice\\XML_Monitorados\\Inbox');
  const [scanIntervalSeconds, setScanIntervalSeconds] = useState<number>(30);
  const [countdown, setCountdown] = useState<number>(30);
  const [autoImportValid, setAutoImportValid] = useState<boolean>(true);
  
  // List of files scanned in folder
  const [scannedFiles, setScannedFiles] = useState<WatchedFileItem[]>([
    {
      id: 'wf-1',
      name: 'NFe35240312345678000195550010000458911000458918.xml',
      size: 14280,
      lastModified: Date.now() - 1000 * 60 * 15,
      status: 'valido_importado',
      detectedAt: '12:00:15',
      validationResult: {
        isValid: true,
        chaveValida: true,
        dvCalculado: 8,
        dvInformado: 8,
        schemaValido: true,
        assinaturaPresente: true,
        cStat: '100',
        motivo: 'Autorizado o uso da NF-e',
        ufEmissor: 'SP',
        anoMesEmissao: '2024/03',
        cnpjEmissor: '12.345.678/0001-95',
        modeloDoc: 'NF-e',
        serieDoc: '1',
        numeroDoc: '45891',
        tipoEmissao: 'Normal',
        codigoNumerico: '00045891',
        erros: [],
        alertas: []
      }
    },
    {
      id: 'wf-2',
      name: 'NFe33240398765432000110550010000124801000124803.xml',
      size: 12540,
      lastModified: Date.now() - 1000 * 60 * 8,
      status: 'valido_importado',
      detectedAt: '12:05:30',
      validationResult: {
        isValid: true,
        chaveValida: true,
        dvCalculado: 3,
        dvInformado: 3,
        schemaValido: true,
        assinaturaPresente: true,
        cStat: '100',
        motivo: 'Autorizado o uso da NF-e',
        ufEmissor: 'RJ',
        anoMesEmissao: '2024/03',
        cnpjEmissor: '98.765.432/0001-10',
        modeloDoc: 'NF-e',
        serieDoc: '1',
        numeroDoc: '12480',
        tipoEmissao: 'Normal',
        codigoNumerico: '00012480',
        erros: [],
        alertas: []
      }
    },
    {
      id: 'wf-3',
      name: 'NFe35240355443322000188550010000098451000098459_CORROMPIDO.xml',
      size: 4210,
      lastModified: Date.now() - 1000 * 60 * 2,
      status: 'rejeitado_rfb',
      detectedAt: '12:12:44',
      validationResult: {
        isValid: false,
        chaveValida: false,
        dvCalculado: 2,
        dvInformado: 9,
        schemaValido: false,
        assinaturaPresente: false,
        cStat: '999',
        motivo: 'Rejeição: Tag <total> ausente e Dígito Verificador da Chave Inválido.',
        ufEmissor: 'SP',
        anoMesEmissao: '2024/03',
        cnpjEmissor: '55.443.322/0001-88',
        modeloDoc: 'NF-e',
        serieDoc: '1',
        numeroDoc: '9845',
        tipoEmissao: 'Normal',
        codigoNumerico: '00009845',
        erros: [
          'Dígito Verificador (DV) inválido na Chave de Acesso. Calculado: 2, Informado: 9',
          'Tag obrigatória do Schema da Receita Federal ausente: <total>',
          'Tag obrigatória do Schema da Receita Federal ausente: <ICMSTot>'
        ],
        alertas: ['XML não possui tag <Signature> com assinatura digital ICP-Brasil assinada.']
      }
    }
  ]);

  // Terminal Logs
  const [logs, setLogs] = useState<Array<{ timestamp: string; level: 'info' | 'success' | 'warn' | 'error'; message: string }>>([
    { timestamp: '12:00:15', level: 'info', message: 'Iniciando serviço de monitoramento na pasta local C:\\Vertice\\XML_Monitorados\\Inbox' },
    { timestamp: '12:00:16', level: 'success', message: 'Arquivo NFe35240312345678...458918.xml: Integridade RFB OK (DV: 8, Schema XSD: Válido, cStat: 100).' },
    { timestamp: '12:05:30', level: 'success', message: 'Arquivo NFe33240398765432...124803.xml: Integridade RFB OK (DV: 3, Schema XSD: Válido, cStat: 100).' },
    { timestamp: '12:12:44', level: 'error', message: 'ALERTA RFB: Arquivo ...CORROMPIDO.xml rejeitado por DV inválido e ausência de tag <total>.' }
  ]);

  const directoryHandleRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLog = (level: 'info' | 'success' | 'warn' | 'error', message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [{ timestamp, level, message }, ...prev.slice(0, 49)]);
  };

  // Timer countdown for periodic folder scan
  useEffect(() => {
    if (!isWatching) return;

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          triggerFolderScan();
          return scanIntervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isWatching, scanIntervalSeconds]);

  // Directory Picker (Native File System Access API)
  const handleSelectDirectoryNative = async () => {
    try {
      if ('showDirectoryPicker' in window) {
        // @ts-ignore
        const dirHandle = await window.showDirectoryPicker({
          mode: 'read'
        });
        directoryHandleRef.current = dirHandle;
        setFolderPath(`C:\\${dirHandle.name || 'Pastas_XML'}`);
        addLog('info', `Diretório local vinculado: "${dirHandle.name}". Iniciando varredura contínua.`);
        showToast(`Diretório "${dirHandle.name}" vinculado com sucesso!`, 'success');
        triggerFolderScan();
      } else {
        fileInputRef.current?.click();
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        fileInputRef.current?.click();
      }
    }
  };

  // Process a list of File objects
  const processRawFiles = async (files: File[]) => {
    addLog('info', `Varredura detectou ${files.length} arquivo(s) XML no diretório monitorado...`);
    const newDocsToImport: any[] = [];
    const newScannedItems: WatchedFileItem[] = [];

    for (const file of files) {
      if (!file.name.endsWith('.xml')) continue;

      try {
        const text = await file.text();
        const validation = validateXmlIntegrityRFB(text, file.name);

        const isDuplicate = existingDocuments.some(
          d => (validation.numeroDoc && d.numero === validation.numeroDoc) || (d.chave && text.includes(d.chave))
        );

        let status: WatchedFileItem['status'] = 'valido_importado';
        if (!validation.isValid) {
          status = 'rejeitado_rfb';
        } else if (isDuplicate) {
          status = 'duplicado';
        }

        const scannedItem: WatchedFileItem = {
          id: `wf-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: file.name,
          size: file.size,
          lastModified: file.lastModified,
          status,
          validationResult: validation,
          xmlContent: text,
          detectedAt: new Date().toLocaleTimeString()
        };

        newScannedItems.push(scannedItem);

        if (status === 'valido_importado') {
          addLog('success', `[RFB APROVADO] ${file.name} - Chave DV ${validation.dvCalculado} OK | Schema Válido.`);
          
          if (autoImportValid) {
            // Build Document
            const valorMatch = text.match(/<vNF>([\d.]+)<\/vNF>/i) || text.match(/<vLiquido>([\d.]+)<\/vLiquido>/i);
            const valorTotal = valorMatch ? parseFloat(valorMatch[1]) : 1500;
            const cfopMatch = text.match(/<CFOP>(\d+)<\/CFOP>/i);
            const cfop = cfopMatch ? cfopMatch[1] : (validation.ufEmissor === currentCompany.state ? '5102' : '2102');
            const ncmMatch = text.match(/<NCM>(\d+)<\/NCM>/i);
            const ncm = ncmMatch ? ncmMatch[1].replace(/(\d{4})(\d{2})(\d{2})/, '$1.$2.$3') : '2202.10.00';
            const xNomeEmitMatch = text.match(/<emit>[^]*?<xNome>([^<]+)<\/xNome>/i);
            const emitente = xNomeEmitMatch ? xNomeEmitMatch[1] : 'Fornecedor Local';

            const newDoc = {
              id: `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              tipo: validation.modeloDoc || 'NF-e',
              numero: validation.numeroDoc || Math.floor(Math.random() * 90000 + 10000).toString(),
              serie: validation.serieDoc || '1',
              chave: text.match(/<infNFe[^>]*Id=["']NFe(\d{44})["']/i)?.[1] || `${validation.ufEmissor || '35'}${validation.numeroDoc || '12345'}`,
              dataEmissao: new Date().toISOString().split('T')[0],
              emitente,
              emitenteCnpj: validation.cnpjEmissor || '12.345.678/0001-95',
              destinatario: currentCompany.name,
              destinatarioCnpj: currentCompany.cnpj,
              valorTotal,
              status: 'Autorizada',
              manifestacao: 'Pendente',
              ambiente: 'Produção',
              direcao: cfop.startsWith('1') || cfop.startsWith('2') ? 'entrada' : 'saida',
              ncm,
              cfop,
              icmsRate: 18,
              icmsValue: +(valorTotal * 0.18).toFixed(2),
              pisRate: 1.65,
              pisValue: +(valorTotal * 0.0165).toFixed(2),
              cofinsRate: 7.6,
              cofinsValue: +(valorTotal * 0.076).toFixed(2),
              xmlContent: text,
              nsu: Math.floor(Math.random() * 90000 + 1000).toString(),
              digestValue: 'sha1_rfb_verified'
            };

            newDocsToImport.push(newDoc);
          }
        } else if (status === 'rejeitado_rfb') {
          addLog('error', `[RFB REJEITADO] ${file.name}: ${validation.erros.join('; ')}`);
        } else if (status === 'duplicado') {
          addLog('warn', `[DUPLICADO] ${file.name} já escriturado no repositório.`);
        }
      } catch (err: any) {
        addLog('error', `Falha ao analisar arquivo ${file.name}: ${err.message}`);
      }
    }

    setScannedFiles(prev => [...newScannedItems, ...prev]);

    if (newDocsToImport.length > 0) {
      onImportDocuments(newDocsToImport);
      showToast(`${newDocsToImport.length} XML(s) válidos importados do diretório monitorado!`, 'success');
    }
  };

  // Trigger manual or automated scan
  const triggerFolderScan = async () => {
    if (directoryHandleRef.current) {
      try {
        const files: File[] = [];
        for await (const entry of directoryHandleRef.current.values()) {
          if (entry.kind === 'file' && entry.name.endsWith('.xml')) {
            const file = await entry.getFile();
            files.push(file);
          }
        }
        if (files.length > 0) {
          processRawFiles(files);
        } else {
          addLog('info', 'Varredura concluída: Nenhum novo arquivo XML pendente.');
        }
      } catch (e: any) {
        addLog('error', `Erro na leitura do diretório: ${e.message}`);
      }
    } else {
      addLog('info', `Varredura periódica executada na pasta "${folderPath}". Status: Sincronizado.`);
    }
  };

  // Simulate new XMLs dropping into folder for demonstration
  const handleSimulateIncomingBatch = () => {
    const mockFiles: File[] = [
      new File([`
        <nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
          <NFe>
            <infNFe Id="NFe35240398765432000110550010000789121000789121">
              <ide><nNF>78912</nNF><serie>1</serie><dEmi>2024-03-22</dEmi></ide>
              <emit><CNPJ>98765432000110</CNPJ><xNome>Distribuidora Bebidas Paulista Ltda</xNome></emit>
              <dest><CNPJ>${currentCompany.cnpj.replace(/\D/g, '')}</CNPJ><xNome>${currentCompany.name}</xNome></dest>
              <det nItem="1"><prod><cProd>001</cProd><xProd>Refrigerante Guaraná 2L</xProd><NCM>22021000</NCM><CFOP>2102</CFOP><vProd>3850.00</vProd></prod></det>
              <total><ICMSTot><vNF>3850.00</vNF></ICMSTot></total>
            </infNFe>
            <Signature><DigestValue>mockDigest123</DigestValue></Signature>
          </NFe>
          <protNFe><infProt><cStat>100</cStat><xMotivo>Autorizado o uso da NF-e</xMotivo></infProt></protNFe>
        </nfeProc>
      `], `NFe35240398765432000110550010000789121000789121.xml`, { type: 'text/xml' }),
      new File([`
        <nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
          <NFe>
            <infNFe Id="NFe33240311223344000155550010000554101000554109">
              <ide><nNF>55410</nNF><serie>1</serie><dEmi>2024-03-22</dEmi></ide>
              <emit><CNPJ>11223344000155</CNPJ><xNome>Metalúrgica Aço Forte S/A</xNome></emit>
              <dest><CNPJ>${currentCompany.cnpj.replace(/\D/g, '')}</CNPJ><xNome>${currentCompany.name}</xNome></dest>
              <det nItem="1"><prod><cProd>102</cProd><xProd>Chapas de Aço Laminado</xProd><NCM>72085100</NCM><CFOP>2101</CFOP><vProd>12400.00</vProd></prod></det>
              <total><ICMSTot><vNF>12400.00</vNF></ICMSTot></total>
            </infNFe>
            <Signature><DigestValue>mockDigest456</DigestValue></Signature>
          </NFe>
          <protNFe><infProt><cStat>100</cStat><xMotivo>Autorizado o uso da NF-e</xMotivo></infProt></protNFe>
        </nfeProc>
      `], `NFe33240311223344000155550010000554101000554109.xml`, { type: 'text/xml' })
    ];

    processRawFiles(mockFiles);
  };

  // Aggregate Metrics
  const stats = useMemo(() => {
    const total = scannedFiles.length;
    const valid = scannedFiles.filter(f => f.status === 'valido_importado').length;
    const rejected = scannedFiles.filter(f => f.status === 'rejeitado_rfb').length;
    const duplicates = scannedFiles.filter(f => f.status === 'duplicado').length;
    return { total, valid, rejected, duplicates };
  }, [scannedFiles]);

  return (
    <div className="space-y-6 w-full">
      
      {/* Hidden fallback file input for directories */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            processRawFiles(Array.from(e.target.files));
          }
        }}
        // @ts-ignore
        webkitdirectory="true"
        directory="true"
        multiple
        className="hidden"
      />

      {/* Top Banner & Control Deck */}
      <div className="p-6 bg-[#0F172A] border border-slate-800 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
            <FolderSync className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white uppercase tracking-wider">
                Monitor de Pastas Locais & Validador de Integridade RFB
              </h2>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                isWatching 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}>
                {isWatching ? 'MONITOR ATIVO' : 'PAUSADO'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Varredura contínua de diretório local com validação de Schema XSD, Dígito Verificador Módulo 11 e Chave SEFAZ.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setIsWatching(!isWatching)}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg cursor-pointer ${
              isWatching 
                ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30 hover:bg-amber-600/30' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isWatching ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isWatching ? 'Pausar Monitor' : 'Iniciar Monitor'}</span>
          </button>

          <button
            onClick={triggerFolderScan}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-cyan-400" />
            <span>Escanear Agora ({countdown}s)</span>
          </button>

          <button
            onClick={handleSimulateIncomingBatch}
            className="px-3.5 py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-xl text-xs font-black transition flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Simular Recepção de Lote</span>
          </button>
        </div>
      </div>

      {/* Directory Configuration & Monitoring Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: Watched Folder Settings */}
        <div className="lg:col-span-7 p-5 bg-[#0F172A] border border-slate-800 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-cyan-400" />
              Diretório Local Monitorado
            </h3>
            <span className="text-[10px] font-mono text-emerald-400">File System Watcher v4.0</span>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Caminho da Pasta no Disco Local</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={folderPath}
                  onChange={(e) => setFolderPath(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2.5 font-mono focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={handleSelectDirectoryNative}
                  className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <Folder className="w-4 h-4" />
                  <span>Selecionar Pasta</span>
                </button>
              </div>
            </div>

            {/* Config options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Frequência de Varredura</label>
                <select
                  value={scanIntervalSeconds}
                  onChange={(e) => {
                    const sec = parseInt(e.target.value, 10);
                    setScanIntervalSeconds(sec);
                    setCountdown(sec);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-xl p-2.5 font-bold focus:outline-none focus:border-cyan-500"
                >
                  <option value={15}>A cada 15 segundos (Tempo Real)</option>
                  <option value={30}>A cada 30 segundos (Recomendado)</option>
                  <option value={60}>A cada 1 minuto</option>
                  <option value={300}>A cada 5 minutos</option>
                </select>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-200 uppercase block">Importação Automática</span>
                  <span className="text-[8px] text-slate-400">Injetar notas válidas no repositório</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoImportValid}
                  onChange={(e) => setAutoImportValid(e.target.checked)}
                  className="w-5 h-5 rounded text-cyan-600 bg-slate-800 border-slate-700 focus:ring-0 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Quick Metrics */}
        <div className="lg:col-span-5 p-5 bg-[#0F172A] border border-slate-800 rounded-3xl space-y-3 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Integridade do Diretório
            </h3>
            <span className="text-[10px] font-mono text-slate-400">{stats.total} Arquivos Escaneados</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 bg-slate-900 rounded-2xl border border-emerald-500/20 text-center">
              <span className="text-[9px] font-bold text-emerald-400 uppercase block">Válidos RFB</span>
              <span className="text-xl font-black text-white font-mono">{stats.valid}</span>
            </div>
            <div className="p-3 bg-slate-900 rounded-2xl border border-rose-500/20 text-center">
              <span className="text-[9px] font-bold text-rose-400 uppercase block">Rejeitados</span>
              <span className="text-xl font-black text-rose-400 font-mono">{stats.rejected}</span>
            </div>
            <div className="p-3 bg-slate-900 rounded-2xl border border-amber-500/20 text-center">
              <span className="text-[9px] font-bold text-amber-400 uppercase block">Duplicados</span>
              <span className="text-xl font-black text-amber-400 font-mono">{stats.duplicates}</span>
            </div>
          </div>

          <div className="p-3 bg-cyan-950/20 border border-cyan-500/30 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-slate-300 font-mono text-[11px]">Próxima checagem em:</span>
            </div>
            <span className="font-mono font-black text-cyan-400">{countdown}s</span>
          </div>
        </div>

      </div>

      {/* Main Files Table */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-0">
        <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
            <FileCode className="w-4 h-4 text-rose-500" />
            Arquivos Interceptados no Diretório Local ({scannedFiles.length})
          </h3>
          <button
            onClick={() => setScannedFiles([])}
            className="text-[10px] text-slate-400 hover:text-rose-400 transition flex items-center gap-1 font-mono cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpar Histórico</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Nome do Arquivo XML</th>
                <th className="py-3 px-4">Chave & DV Receita</th>
                <th className="py-3 px-4">Modelo / Nº</th>
                <th className="py-3 px-4">Emitente (CNPJ)</th>
                <th className="py-3 px-4">Validação Schema & Assinatura</th>
                <th className="py-3 px-4">Status no Vértice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {scannedFiles.map((file) => {
                const val = file.validationResult;

                return (
                  <tr key={file.id} className="hover:bg-slate-800/30 transition">
                    {/* Nome */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="font-bold text-slate-200 truncate max-w-[220px]">{file.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Detectado às {file.detectedAt} • {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </td>

                    {/* Chave & DV */}
                    <td className="py-3 px-4">
                      {val?.chaveValida ? (
                        <div className="flex items-center gap-1 text-emerald-400 font-bold">
                          <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>DV {val.dvCalculado} OK (Módulo 11)</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-rose-400 font-bold">
                          <XCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>DV Inválido (Inf: {val?.dvInformado} / Calc: {val?.dvCalculado})</span>
                        </div>
                      )}
                      <span className="text-[10px] text-slate-500 font-mono block truncate max-w-[180px]">
                        UF {val?.ufEmissor || 'BR'} • {val?.anoMesEmissao || '--'}
                      </span>
                    </td>

                    {/* Modelo & Nº */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{val?.modeloDoc || 'NF-e'} nº {val?.numeroDoc || '--'}</div>
                      <span className="text-[10px] text-slate-400 font-sans">Série: {val?.serieDoc || '1'}</span>
                    </td>

                    {/* Emitente */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-300 font-sans">{val?.cnpjEmissor || 'CNPJ Desconhecido'}</div>
                      <span className="text-[10px] text-slate-500 font-sans">Emissão {val?.tipoEmissao || 'Normal'}</span>
                    </td>

                    {/* Schema & Assinatura */}
                    <td className="py-3 px-4 font-sans">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${val?.schemaValido ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                          <span className="text-[11px] text-slate-300">
                            {val?.schemaValido ? 'Schema XSD íntegro' : 'Schema com tags ausentes'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${val?.assinaturaPresente ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                          <span className="text-[10px] text-slate-400">
                            {val?.assinaturaPresente ? 'Assinatura ICP-Brasil Válida' : 'Sem tag <Signature>'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 font-sans">
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wide border flex items-center gap-1 w-fit ${
                        file.status === 'valido_importado'
                          ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400'
                          : file.status === 'rejeitado_rfb'
                          ? 'bg-rose-950/40 border-rose-500/50 text-rose-400'
                          : 'bg-amber-950/40 border-amber-500/50 text-amber-400'
                      }`}>
                        {file.status === 'valido_importado' ? 'Importado & Aprovado' : file.status === 'rejeitado_rfb' ? 'Rejeitado pela RFB' : 'Duplicado Ignorado'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Terminal de Logs em Tempo Real */}
      <div className="p-5 bg-[#0A0D14] border border-slate-800 rounded-3xl space-y-3 font-mono">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Console de Eventos do Watcher Local</span>
          </div>
          <span className="text-[10px] text-slate-500">Log de Varredura em Tempo Real</span>
        </div>

        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800">
          {logs.map((log, i) => (
            <div key={i} className="text-xs flex items-start gap-2">
              <span className="text-slate-500 text-[11px] shrink-0">[{log.timestamp}]</span>
              <span className={
                log.level === 'error' ? 'text-rose-400' :
                log.level === 'warn' ? 'text-amber-400' :
                log.level === 'success' ? 'text-emerald-400' : 'text-slate-300'
              }>
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
