import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Play, ArrowRight, Zap, CheckCircle2, RotateCw } from 'lucide-react';
import { BrandLogo, BRAND_MODULE_CONFIGS, BrandModuleKey } from './BrandLogo';

interface ModuleLogoConstellationProps {
  onSelectModule?: (moduleId: BrandModuleKey) => void;
  className?: string;
}

export const ModuleLogoConstellation: React.FC<ModuleLogoConstellationProps> = ({
  onSelectModule,
  className = ''
}) => {
  const [activeHoverModule, setActiveHoverModule] = useState<BrandModuleKey | null>('reforma');
  const [isConverging, setIsConverging] = useState<boolean>(false);
  const [hasConverged, setHasConverged] = useState<boolean>(false);
  const [rotationAngle, setRotationAngle] = useState<number>(0);

  // List of all specialized brand modules
  const moduleKeys: BrandModuleKey[] = [
    'simples',
    'monofasico',
    'reforma',
    'consultas',
    'bpo',
    'nfse',
    'societario',
    'agenda',
    'conhecimentos',
    'parceiros',
    'parecer'
  ];

  // Auto-rotation effect for orbit nodes
  useEffect(() => {
    if (isConverging) return;
    const interval = setInterval(() => {
      setRotationAngle((prev) => (prev + 0.5) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, [isConverging]);

  // Trigger Convergence Animation Sequence
  const handleTriggerConvergence = () => {
    setIsConverging(true);
    setHasConverged(false);

    setTimeout(() => {
      setHasConverged(true);
      setIsConverging(false);
    }, 1800);
  };

  return (
    <div className={`relative flex flex-col items-center justify-center p-6 sm:p-12 bg-gradient-to-b from-[#0B0F19]/90 via-[#0F172A]/95 to-[#060913]/90 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden ${className}`}>
      
      {/* Background Glows & Rays */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/10 via-emerald-600/5 to-transparent pointer-events-none" />
      <div className="absolute w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />

      {/* Header Info */}
      <div className="text-center max-w-2xl mx-auto space-y-3 z-10 mb-8 sm:mb-12">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-mono font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>SISTEMA MODULAR VÉRTICE AUDITOR FISCAL</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          A Convergência dos Módulos Fiscais
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
          Cada vertente da tributação possui sua identidade própria. Clique em qualquer módulo para explorar ou acione a convergência para fundi-los na plataforma Master.
        </p>

        <button
          onClick={handleTriggerConvergence}
          disabled={isConverging}
          className="mt-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:opacity-90 text-white font-extrabold text-xs transition shadow-lg flex items-center gap-2 mx-auto cursor-pointer border border-emerald-400/30 active:scale-95"
        >
          <RotateCw className={`w-4 h-4 ${isConverging ? 'animate-spin' : ''}`} />
          <span>{isConverging ? 'Convergindo Módulos...' : 'Acionar Animação de Convergência'}</span>
        </button>
      </div>

      {/* Interactive Orbital Stage */}
      <div className="relative w-[340px] h-[340px] sm:w-[520px] sm:h-[520px] flex items-center justify-center my-4 z-10 select-none">
        
        {/* Orbit Ring Guidelines */}
        <div className="absolute w-[280px] h-[280px] sm:w-[420px] sm:h-[420px] rounded-full border border-slate-700/60 border-dashed animate-spin-slow pointer-events-none" />
        <div className="absolute w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] rounded-full border border-blue-500/20 pointer-events-none" />

        {/* Central Master Logo Node */}
        <motion.div
          animate={
            hasConverged 
              ? { scale: [1, 1.3, 1.1], rotate: [0, 360, 0] } 
              : isConverging 
              ? { scale: [1, 0.9, 1.25] } 
              : { scale: 1 }
          }
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          className="relative z-20 flex flex-col items-center justify-center p-6 rounded-full bg-[#0F172A]/90 border-2 border-amber-400/80 shadow-[0_0_50px_rgba(245,158,11,0.4)] backdrop-blur-xl group cursor-pointer"
          onClick={() => onSelectModule && onSelectModule('master')}
        >
          <BrandLogo variant="icon" module="master" size="2xl" showModuleIcon={false} animate={isConverging} />
          
          <div className="mt-2 text-center">
            <span className="font-black text-xs sm:text-sm text-white tracking-wider font-sans block">
              VÉRTICE
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
              AUDITOR FISCAL
            </span>
          </div>

          {hasConverged && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute -top-3 px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-lg flex items-center gap-1"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>SISTEMA INTEGRADO!</span>
            </motion.div>
          )}
        </motion.div>

        {/* Orbiting Modular Nodes */}
        {moduleKeys.map((modKey, idx) => {
          const modConfig = BRAND_MODULE_CONFIGS[modKey];
          const total = moduleKeys.length;
          const radius = window.innerWidth < 640 ? 135 : 210; // orbit radius in pixels

          // Calculate angle for ring distribution
          const baseAngle = (idx * (360 / total) + rotationAngle) % 360;
          const rad = (baseAngle * Math.PI) / 180;

          // Target position when converging is center (x=0, y=0)
          const currentX = isConverging ? 0 : Math.cos(rad) * radius;
          const currentY = isConverging ? 0 : Math.sin(rad) * radius;

          const isHovered = activeHoverModule === modKey;

          return (
            <React.Fragment key={modKey}>
              {/* Energy Beam Line to Center */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
                <line
                  x1="50%"
                  y1="50%"
                  x2={`calc(50% + ${currentX}px)`}
                  y2={`calc(50% + ${currentY}px)`}
                  stroke={isHovered ? modConfig.topGradient[0] : '#334155'}
                  strokeWidth={isHovered ? '2' : '1'}
                  strokeDasharray={isHovered ? 'none' : '4 4'}
                  strokeOpacity={isHovered ? '0.8' : '0.3'}
                />
              </svg>

              {/* Module Logo Node */}
              <motion.div
                animate={{
                  x: currentX,
                  y: currentY,
                  scale: isConverging ? [1, 0.4, 0] : isHovered ? 1.25 : 1,
                  opacity: isConverging ? [1, 0.5, 0] : 1
                }}
                transition={{ duration: isConverging ? 1.5 : 0.3, ease: 'easeOut' }}
                onMouseEnter={() => setActiveHoverModule(modKey)}
                onClick={() => onSelectModule && onSelectModule(modKey)}
                className={`absolute z-30 cursor-pointer p-2.5 rounded-2xl bg-slate-900/90 border ${modConfig.borderAccent} shadow-xl backdrop-blur-md flex flex-col items-center justify-center transition-all duration-300 group`}
                style={{
                  boxShadow: isHovered ? `0 0 25px ${modConfig.glowColor}` : 'none'
                }}
              >
                <BrandLogo 
                  variant="icon" 
                  module={modKey} 
                  size={isHovered ? 'md' : 'sm'} 
                  showModuleIcon={true} 
                />

                <span className="text-[9px] font-extrabold text-slate-200 tracking-tight mt-1 font-sans hidden sm:block">
                  {modConfig.name.replace('VÉRTICE ', '')}
                </span>
              </motion.div>
            </React.Fragment>
          );
        })}

      </div>

      {/* Active Module Feature Detail Card */}
      <AnimatePresence mode="wait">
        {activeHoverModule && (
          <motion.div
            key={activeHoverModule}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-xl mx-auto mt-6 p-5 sm:p-6 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl relative z-20 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <BrandLogo variant="icon" module={activeHoverModule} size="lg" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                    {BRAND_MODULE_CONFIGS[activeHoverModule].badgeLabel}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {BRAND_MODULE_CONFIGS[activeHoverModule].code}
                  </span>
                </div>
                <h3 className="text-lg font-black text-white">
                  {BRAND_MODULE_CONFIGS[activeHoverModule].name}
                </h3>
                <p className="text-xs text-slate-300 font-medium">
                  {BRAND_MODULE_CONFIGS[activeHoverModule].subtitle}
                </p>
              </div>
            </div>

            <button
              onClick={() => onSelectModule && onSelectModule(activeHoverModule)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer border border-slate-600"
            >
              <span>Acessar Módulo</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
