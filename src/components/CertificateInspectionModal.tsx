import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Key, 
  Upload, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  FileCheck, 
  Sparkles, 
  RefreshCw, 
  X, 
  Eye, 
  EyeOff, 
  ExternalLink 
} from 'lucide-react';
import { CompanyData } from '../types';

interface CertificateInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCompany: CompanyData;
  onUpdateCompany: (updated: CompanyData) => void;
  showToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

export interface CertInspectionResult {
  valid: boolean;
  commonName: string;
  issuer: string;
  extractedCnpj?: string;
  extractedCpf?: string;
  serialNumber?: string;
  validFrom: string;
  validTo: string;
  daysRemaining: number;
  isExpired: boolean;
  mTLSCapable: boolean;
  algorithm: string;
  status: 'VALIDO_ATIVO' | 'VENCENDO_EM_BREVE' | 'EXPIRADO';
}

export const CertificateInspectionModal: React.FC<CertificateInspectionModalProps> = ({
  isOpen,
  onClose,
  currentCompany,
  onUpdateCompany,
  showToast
}) => {
  const [pfxFile, setPfxFile] = useState<File | null>(null);
  const [pfxBase64, setPfxBase64] = useState<string>(currentCompany?.pfxBase64 || '');
  const [pfxFileName, setPfxFileName] = useState<string>(currentCompany?.pfxFileName || '');
  const [password, setPassword] = useState<string>(currentCompany?.certPassword || '');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isInspecting, setIsInspecting] = useState<boolean>(false);
  const [inspectionResult, setInspectionResult] = useState<CertInspectionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPfxFile(file);
    setPfxFileName(file.name);
    setErrorMsg(null);
    setInspectionResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      setPfxBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRunInspection = async () => {
    if (!pfxBase64) {
      setErrorMsg('Selecione ou arraste o arquivo do Certificado Digital A1 (.pfx ou .p12).');
      return;
    }

    setIsInspecting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/vertice/cert/inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pfxBase64,
          password
        })
      });

      const data = await res.json();

      if (data.success && data.valid) {
        const result: CertInspectionResult = {
          valid: true,
          commonName: data.commonName,
          issuer: data.issuer,
          extractedCnpj: data.extractedCnpj,
          extractedCpf: data.extractedCpf,
          serialNumber: data.serialNumber,
          validFrom: data.validFrom,
          validTo: data.validTo,
          daysRemaining: data.daysRemaining,
          isExpired: data.isExpired,
          mTLSCapable: data.mTLSCapable,
          algorithm: data.algorithm,
          status: data.status
        };

        setInspectionResult(result);
        showToast('Certificado digital validado com absoluto sucesso!', 'success');
      } else {
        setErrorMsg(data.error || 'Falha ao validar o certificado digital.');
      }
    } catch (err: any) {
      setErrorMsg(`Erro de conexão com o analisador criptográfico: ${err.message}`);
    } finally {
      setIsInspecting(false);
    }
  };

  const handleSaveToCompany = () => {
    if (!pfxBase64) {
      showToast('Nenhum certificado carregado.', 'error');
      return;
    }

    const updated: CompanyData = {
      ...currentCompany,
      certUploaded: true,
      pfxBase64,
      pfxFileName: pfxFileName || 'certificado_a1.pfx',
      certPassword: password,
      certExpiryDate: inspectionResult?.validTo?.split('T')[0] || currentCompany.certExpiryDate
    };

    if (inspectionResult?.extractedCnpj) {
      updated.cnpj = inspectionResult.extractedCnpj;
    }
    if (inspectionResult?.commonName) {
      const cleanName = inspectionResult.commonName.split(':')[0].trim();
      if (cleanName && cleanName.length > 3) {
        updated.name = cleanName;
      }
    }

    onUpdateCompany(updated);
    showToast(`Certificado A1 vinculado à empresa ${updated.name} (CNPJ: ${updated.cnpj}) com sucesso!`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#0B0F19] border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-[#0F172A]/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Inspeção de Certificado Digital A1</h2>
              <p className="text-xs text-slate-400">Padrão ICP-Brasil • Criptografia mTLS para SEFAZ e Portal Nacional ADN</p>
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
          
          {/* Target Company Alert */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-blue-400" />
              <div>
                <span className="text-xs text-slate-400 font-mono">Empresa Ativa:</span>
                <div className="text-sm font-bold text-white">{currentCompany.name}</div>
              </div>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
              {currentCompany.cnpj}
            </span>
          </div>

          {/* Upload Area */}
          <div className="space-y-4">
            <label className="block text-xs font-semibold text-slate-300">
              1. Arquivo do Certificado Digital (.pfx ou .p12)
            </label>

            <div className="relative border-2 border-dashed border-slate-700 hover:border-emerald-500/60 transition rounded-2xl p-6 text-center bg-slate-900/40">
              <input
                type="file"
                accept=".pfx,.p12"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="p-3 rounded-2xl bg-slate-800 text-emerald-400 border border-slate-700">
                  <Upload className="w-6 h-6" />
                </div>
                {pfxFileName ? (
                  <div>
                    <span className="text-sm font-bold text-emerald-400 font-mono">{pfxFileName}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">Clique ou arraste outro arquivo para substituir</p>
                  </div>
                ) : (
                  <div>
                    <span className="text-sm font-semibold text-slate-200">Arraste o arquivo .pfx ou clique para selecionar</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">Certificados A1 de qualquer Autoridade Certificadora ICP-Brasil</p>
                  </div>
                )}
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                2. Senha do Certificado Digital
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite a senha cadastrada na emissão do certificado..."
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 pr-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Validate Button */}
            <button
              onClick={handleRunInspection}
              disabled={isInspecting || !pfxBase64}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/20 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isInspecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validando Chave Criptográfica ICP-Brasil...</span>
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  <span>Testar & Inspecionar Certificado</span>
                </>
              )}
            </button>
          </div>

          {/* Error message */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Inconsistência Criptográfica:</strong>
                {errorMsg}
              </div>
            </div>
          )}

          {/* Result Hologram Card */}
          {inspectionResult && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0a192f] to-[#0d2137] border border-emerald-500/40 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Certificado Válido & Pronto para Produção
                  </span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {inspectionResult.daysRemaining} dias restantes
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">Titular / Razão Social</span>
                  <strong className="text-white font-semibold">{inspectionResult.commonName}</strong>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">Autoridade Certificadora (AC)</span>
                  <strong className="text-slate-200">{inspectionResult.issuer}</strong>
                </div>

                {inspectionResult.extractedCnpj && (
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">CNPJ Extraído</span>
                    <strong className="text-emerald-400 font-mono">{inspectionResult.extractedCnpj}</strong>
                  </div>
                )}

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">Vigência Oficial</span>
                  <strong className="text-slate-200 font-mono">
                    {new Date(inspectionResult.validFrom).toLocaleDateString('pt-BR')} até {new Date(inspectionResult.validTo).toLocaleDateString('pt-BR')}
                  </strong>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">Algoritmo / Padrão</span>
                  <strong className="text-slate-300">{inspectionResult.algorithm}</strong>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">Conexão mTLS SEFAZ / ADN</span>
                  <strong className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Apto para busca em tempo real
                  </strong>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800 bg-[#0F172A]/80">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold transition cursor-pointer"
          >
            Cancelar
          </button>

          <button
            onClick={handleSaveToCompany}
            disabled={!pfxBase64}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-900/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Vincular à Empresa & Salvar</span>
          </button>
        </div>

      </div>
    </div>
  );
};
