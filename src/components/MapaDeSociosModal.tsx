import React from 'react';
import { X, Network } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CompanyData, Partner } from '../types';
import { MapaDeSociosInterativo } from './MapaDeSociosInterativo';

interface MapaDeSociosModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCompany: CompanyData;
  onUpdateCompanyPartners?: (updatedPartners: Partner[]) => void;
  showToast?: (text: string, type?: 'success' | 'info' | 'error') => void;
  onNavigateToTab?: (tab: any) => void;
}

export const MapaDeSociosModal: React.FC<MapaDeSociosModalProps> = ({
  isOpen,
  onClose,
  currentCompany,
  onUpdateCompanyPartners,
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
                <Network className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">
                  Mapa de Sócios & Teia Societária (LC 123/06)
                </h2>
                <p className="text-xs text-slate-400">
                  Visualização de vínculos societários, múltiplos CNPJs, apuração de sublimites (R$ 3,6M) e teto federal (R$ 4,8M)
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
            <MapaDeSociosInterativo
              currentCompany={currentCompany}
              onUpdateCompanyPartners={onUpdateCompanyPartners}
              showToast={showToast}
              onNavigateToTab={onNavigateToTab}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
