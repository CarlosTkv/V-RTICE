import React from 'react';
import { Shield, Lock, Eye, Trash2, FileCheck, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PrivacyLGPDModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyLGPDModal: React.FC<PrivacyLGPDModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="bg-[#0B0F19] border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl text-slate-100 z-10 relative"
          >
            
            {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Privacidade, Segurança & LGPD</h2>
              <p className="text-xs text-slate-400">Conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed">
          
          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-emerald-300 text-xs mb-1">Compromisso com a Transparência e Segurança</h4>
              <p className="text-slate-300">
                O <strong className="text-slate-200">Vértice Auditor Fiscal</strong> adota rigorosos padrões de segurança da informação e privacidade em conformidade com a LGPD. Garantimos total sigilo fiscal, contábil e financeiro para escritórios de contabilidade e empresas clientes.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-slate-100 font-bold">
                <Lock className="w-4 h-4 text-blue-400" />
                <span>1. Armazenamento Local e Criptografia em Trânsito</span>
              </div>
              <p>
                Os dados cadastrais de empresas, simulações tributárias e extratos financeiros são processados localmente e armazenados de forma estruturada no navegador (<code className="text-blue-300 font-mono">localStorage</code>) ou sincronizados com instâncias seguras em nuvem sob criptografia avançada (HTTPS / TLS 1.3). Nenhuma chave de API ou credencial sensível é exposta ao navegador.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-slate-100 font-bold">
                <Eye className="w-4 h-4 text-purple-400" />
                <span>2. Tratamento de Dados Fiscais e Visão Compartilhada</span>
              </div>
              <p>
                O sistema opera sob uma arquitetura de controle hierárquico:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li><strong className="text-slate-300">Escritório Contábil:</strong> Possui acesso à carteira completa de empresas, auditorias e simulações do Fator R e Reforma Tributária.</li>
                <li><strong className="text-slate-300">Cliente Final:</strong> Visualiza exclusivamente os relatórios e pareceres habilitados pelo escritório, sem acesso cruzado a outras empresas ou dados administrativos.</li>
              </ul>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-slate-100 font-bold">
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>3. Direito ao Esquecimento e Exclusão de Dados</span>
              </div>
              <p>
                Conforme o Art. 18 da LGPD, o titular dos dados ou o representante legal da empresa pode solicitar a qualquer momento a exclusão permanente (<strong className="text-rose-300">Hard Delete</strong>) de todos os registros, históricos de auditoria e cache vinculados ao seu CNPJ/CPF diretamente através das ferramentas de gestão de empresas do sistema.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-slate-100 font-bold">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>4. Licenciamento Comercial, Contato e Encarregado (DPO)</span>
              </div>
              <p>
                O software Vértice Auditor Fiscal é um produto registrado e protegido por leis de direitos autorais e propriedade intelectual. Para requisições de titulares de dados (LGPD), dúvidas sobre privacidade ou suporte institucional, entre em contato através do e-mail oficial: <strong className="text-emerald-400 font-mono">contato@verticeanalises.com.br</strong> (Portal: <a href="https://verticeanalises.com.br" target="_blank" rel="noreferrer" className="text-blue-400 underline">verticeanalises.com.br</a>).
              </p>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-900/40">
          <span className="text-[11px] text-slate-400">© 2026 Vértice Auditor Fiscal • Todos os direitos reservados.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/20 transition cursor-pointer"
          >
            Entendido e Concordo
          </button>
        </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
