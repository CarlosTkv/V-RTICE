import React, { useState, useEffect } from 'react';
import {
  Scale,
  Building2,
  Printer,
  FileText,
  Lock,
  Unlock,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Key,
  Download,
  Share2
} from 'lucide-react';
import { CompanyData, CalculationResult, AuthUser } from '../../types';
import { SimplesHibridoModule } from './SimplesHibridoModule';
import { BrandLogo } from '../BrandLogo';

interface SimplesHibridoClientPortalProps {
  company: CompanyData;
  onChangeCompany?: (updated: CompanyData) => void;
  calculation?: CalculationResult;
  onExitClientMode?: () => void;
  isReadOnly?: boolean;
  requiredPin?: string | null;
  authUser?: AuthUser | null;
}

export const SimplesHibridoClientPortal: React.FC<SimplesHibridoClientPortalProps> = ({
  company,
  onChangeCompany,
  calculation,
  onExitClientMode,
  isReadOnly = false,
  requiredPin = null,
  authUser,
}) => {
  const [pinEntered, setPinEntered] = useState<string>('');
  const [isUnlocked, setIsUnlocked] = useState<boolean>(!requiredPin);
  const [pinError, setPinError] = useState<boolean>(false);

  const handleUnlockWithPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requiredPin || pinEntered.trim() === requiredPin.trim()) {
      setIsUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  if (!isUnlocked && requiredPin) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#0F172A] border border-indigo-500/40 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 mx-auto flex items-center justify-center shadow-lg">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Acesso Protegido</h2>
            <p className="text-xs text-slate-300">
              O simulador pericial para <strong className="text-white">{company.name}</strong> requer autenticação por código PIN de segurança.
            </p>
          </div>

          <form onSubmit={handleUnlockWithPin} className="space-y-4">
            <div>
              <input
                type="password"
                maxLength={6}
                autoFocus
                value={pinEntered}
                onChange={(e) => {
                  setPinEntered(e.target.value);
                  setPinError(false);
                }}
                placeholder="Digite o PIN de 4 dígitos"
                className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-center text-lg font-mono tracking-widest text-white outline-none"
              />
              {pinError && (
                <p className="text-xs text-rose-400 mt-2 font-medium">
                  Código PIN incorreto. Verifique com seu consultor contábil.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition cursor-pointer shadow-lg shadow-indigo-600/30"
            >
              Acessar Simulador do Simples Híbrido
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-center gap-2 text-[11px] text-slate-500 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ambiente Seguro • Vértice Auditor Fiscal</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Top Banner Exclusivo do Portal do Cliente */}
      <div className="bg-[#0B0F19]/90 border border-indigo-800/40 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/25">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>Portal do Cliente</span>
                <span className="text-slate-500">•</span>
                <span className="text-indigo-300 font-normal">Diagnóstico Simples Tradicional vs. Híbrido</span>
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Acesso Exclusivo
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
              <span className="flex items-center gap-1 text-slate-300 font-medium">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                {company.name}
              </span>
              <span>•</span>
              <span className="font-mono">CNPJ: {company.cnpj || 'Não Informado'}</span>
              <span>•</span>
              <span>UF: {company.uf || 'SP'}</span>
              <span>•</span>
              <span>Anexo Base: {company.anexo || 'I'}</span>
            </div>
          </div>
        </div>

        {/* Action Controls for Client Portal */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
          {onExitClientMode && (
            <button
              type="button"
              onClick={onExitClientMode}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Voltar ao Painel Geral de Contabilidade"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
              <span>Painel Completo</span>
            </button>
          )}
        </div>
      </div>

      {/* Render Main Module */}
      <SimplesHibridoModule
        company={company}
        onChangeCompany={isReadOnly ? undefined : onChangeCompany}
        calculation={calculation}
      />
    </div>
  );
};
