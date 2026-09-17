import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, X } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface ModuleTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleName: string;
  description: string;
}

export const ModuleTutorialModal: React.FC<ModuleTutorialModalProps> = ({
  isOpen,
  onClose,
  moduleName,
  description
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-[#0F172A] border border-slate-700 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0B0F19]">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span className="font-bold text-white text-sm">Vértice Auditor Fiscal • Como Funciona</span>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer flex items-center gap-1"
            >
              <X className="w-4 h-4" /> Fechar
            </button>
          </div>
          <div className="p-8 text-center space-y-6 aspect-video flex flex-col items-center justify-center bg-slate-950 relative overflow-hidden">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="absolute inset-0 w-full h-full object-cover opacity-30"
              src="https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-financial-data-42998-large.video.mp4"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/80 pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center mx-auto animate-pulse">
                <Play className="w-8 h-8 fill-current ml-1" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">{moduleName}</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  {description}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
