import React, { useState, useEffect } from 'react';
import { Key, ShieldCheck, Building2, CheckCircle2, AlertTriangle, ExternalLink, Lock, FileKey } from 'lucide-react';
import { CompanyData } from '../types';

export const AdminCertificatesTab: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyData[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sna_companies_data');
      if (saved) {
        setCompanies(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Erro ao carregar empresas:', e);
    }
  }, []);

  const totalComps = companies.length;
  const withCert = companies.filter(c => c.certUploaded).length;
  const withoutCert = totalComps - withCert;

  const handleOpenCentral = () => {
    window.dispatchEvent(new CustomEvent('vertice:open-company-manager'));
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="bg-[#0F172A] border border-blue-500/40 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-400" />
              Certificados Digitais Corporativos (mTLS SEFAZ & ADN)
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl mt-1">
              Todos os certificados digitais A1 (.pfx/.p12) são gerenciados centralizadamente na <strong>Central de Gestão e Cadastro de Empresas</strong>. Os módulos fiscais do Vértice apenas identificam e autenticam a chave para emissão e busca.
            </p>
          </div>

          <button
            onClick={handleOpenCentral}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg cursor-pointer shrink-0"
          >
            <Building2 className="w-4 h-4" />
            Abrir Central de Empresas (Gestão de Certificados)
          </button>
        </div>

        {/* Status Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total de Empresas</span>
              <span className="text-2xl font-black text-white font-mono">{totalComps}</span>
            </div>
            <Building2 className="w-6 h-6 text-slate-600" />
          </div>

          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">Com Certificado A1 Ativo</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">{withCert}</span>
            </div>
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>

          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400 block">Pendente de Certificado</span>
              <span className="text-2xl font-black text-amber-400 font-mono">{withoutCert}</span>
            </div>
            <AlertTriangle className="w-6 h-6 text-amber-400" />
          </div>
        </div>

        {/* Empresas Cadastradas e Identificação dos Certificados */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <FileKey className="w-4 h-4 text-emerald-400" />
            Inventário de Certificados Identificados no Sistema ({companies.length})
          </h4>

          {companies.length === 0 ? (
            <div className="p-8 text-center text-slate-500 rounded-xl bg-slate-900 border border-slate-800">
              Nenhuma empresa cadastrada na Central. Cadastre empresas para sincronizar certificados digitais.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {companies.map(comp => (
                <div 
                  key={comp.id}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex items-start justify-between gap-3"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white truncate max-w-[240px]">
                        {comp.name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">
                      CNPJ: {comp.cnpj || 'Não informado'}
                    </p>

                    <div className="pt-1 flex items-center gap-2">
                      {comp.certUploaded ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-bold text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Certificado Identificado: <strong>{comp.pfxFileName || 'A1.pfx'}</strong></span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-[11px] font-bold text-amber-400">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Sem Certificado A1 Vinculado</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleOpenCentral}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition shrink-0"
                    title="Gerenciar na Central de Gestão e Cadastro de Empresas"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

