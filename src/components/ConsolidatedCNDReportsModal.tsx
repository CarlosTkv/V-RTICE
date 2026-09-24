import React from 'react';
import { X, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CompanyData } from '../types';
import { ConsolidatedCNDReportsPanel } from './ConsolidatedCNDReportsPanel';

interface ConsolidatedCNDReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCompany: CompanyData;
  showToast?: (text: string, type?: 'success' | 'info' | 'error') => void;
  onNavigateToTab?: (tab: any) => void;
}

export const ConsolidatedCNDReportsModal: React.FC<ConsolidatedCNDReportsModalProps> = ({
  isOpen,
  onClose,
  currentCompany,
  showToast,
  onNavigateToTab
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-7xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden relative"
        >
          {/* Top Bar with Close */}
          <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">
                  Dossiê & Caderno Consolidado de Certidões Negativas
                </h2>
                <p className="text-xs text-slate-400">
                  Exportação executiva unificada das 5 esferas (Federal, Estadual, Municipal, Trabalhista e FGTS)
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar">
            <ConsolidatedCNDReportsPanel
              currentCompany={currentCompany}
              showToast={showToast}
              onNavigateToTab={onNavigateToTab}
              isModalMode={true}
              onClose={onClose}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
