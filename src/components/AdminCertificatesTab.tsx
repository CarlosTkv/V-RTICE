import React from 'react';
import { CertificateUploadField } from './CertificateUploadField';
import { Key } from 'lucide-react';

export const AdminCertificatesTab: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="bg-[#0F172A] border border-blue-500/40 rounded-2xl p-6 shadow-xs">
        <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
          <Key className="w-5 h-5 text-blue-400" />
          Certificados Digitais Corporativos
        </h3>
        <p className="text-xs text-slate-300 max-w-2xl mb-6">
          Gestão centralizada de certificados digitais (.pfx) para autorização de emissão de notas fiscais via API oficial.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <CertificateUploadField 
             label="Certificado Master (Administração)"
             onFileSelect={(file, password) => console.log('Certificado Master selecionado:', file, 'com senha:', password)}
           />
           <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
             <p className="font-bold text-slate-300 mb-1">Status do Ambiente Nacional:</p>
             <p>Certificado atual: <span className="text-emerald-400">Válido até 10/2026</span></p>
           </div>
        </div>
      </div>
    </div>
  );
};
