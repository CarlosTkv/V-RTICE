import React, { useRef, useState } from 'react';
import { Upload, FileCheck, X } from 'lucide-react';

interface CertificateUploadFieldProps {
  label: string;
  onFileSelect: (file: File, password: string) => void;
  className?: string;
}

export const CertificateUploadField: React.FC<CertificateUploadFieldProps> = ({ label, onFileSelect, className = "" }) => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
    }
  };

  const handleUpload = () => {
    if (file) {
      onFileSelect(file, password);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPassword('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</label>
      
      {!file ? (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-700 hover:border-blue-500 rounded-xl text-xs font-bold text-slate-300 transition w-full"
        >
          <Upload className="w-4 h-4 text-blue-400" />
          Selecionar Certificado (.pfx / .p12)
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-xs font-bold text-emerald-300">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            {file.name}
            <button onClick={handleClear} className="ml-auto hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <input
            type="password"
            placeholder="Senha do certificado"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleUpload}
            className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold text-white transition"
          >
            Confirmar e Enviar
          </button>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pfx,.p12"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};
