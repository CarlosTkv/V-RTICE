import React from 'react';
import { X, Award } from 'lucide-react';
import { PartnerPortalView } from './PartnerPortalView';
import { AuthUser, AppActiveTab } from '../types';

interface PartnerPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  onUpdateCurrentUser?: (updated: Partial<AuthUser>) => void;
  onNavigateToTab?: (tab: AppActiveTab) => void;
}

export const PartnerPortalModal: React.FC<PartnerPortalModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateCurrentUser,
  onNavigateToTab
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-[#0B0F19] border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Portal do Parceiro de Negócios
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  ISENÇÃO 100%
                </span>
              </h2>
              <p className="text-xs text-slate-400">Credenciamento, links de comissão e repasses automáticos via PIX</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <PartnerPortalView
            currentUser={currentUser}
            onUpdateCurrentUser={onUpdateCurrentUser}
            onNavigateToTab={(tab) => {
              if (onNavigateToTab) {
                onNavigateToTab(tab);
                onClose();
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};
