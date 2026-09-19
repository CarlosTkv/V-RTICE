import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, CheckCircle2, ChevronRight, ShieldCheck, Sun, Play } from 'lucide-react';
import { BrandLogo, BRAND_MODULE_CONFIGS, BrandModuleKey } from './BrandLogo';

interface BrandConvergenceSplashProps {
  mode?: 'intro' | 'login';
  onComplete: () => void;
  title?: string;
  subtitle?: string;
}

interface StarParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  color: string;
}

export const BrandConvergenceSplash: React.FC<BrandConvergenceSplashProps> = ({
  mode = 'intro',
  onComplete,
  title = mode === 'login' ? 'AUTENTICAÇÃO & INICIALIZAÇÃO' : 'VÉRTICE AUDITOR FISCAL',
  subtitle = mode === 'login' ? 'Sincronizando Módulos Fiscais e Carregando Cockpit Master...' : 'Convergência dos Módulos de Inteligência Tributária B2B'
}) => {
  const [stage, setStage] = useState<'orbit' | 'converging' | 'consolidated' | 'done'>('orbit');
  const [progressCount, setProgressCount] = useState(0);
  const isTransitioningRef = useRef(false);

  const moduleKeys: BrandModuleKey[] = useMemo(() => [
    'simples',
    'monofasico',
    'reforma',
    'consultas',
    'bpo',
    'nfse',
    'societario',
    'agenda',
    'conhecimentos',
    'teses',
    'legalizacao',
    'auditoria',
    'tax',
    'contratos',
    'parceiros',
    'parecer'
  ], []);

  const total = moduleKeys.length;

  // Geração determinística de partículas de estrelas dinâmicas
  const stars: StarParticle[] = useMemo(() => {
    const starColors = ['#ffffff', '#93c5fd', '#fef08a', '#c084fc', '#6ee7b7', '#fde047'];
    return Array.from({ length: 85 }, (_, i) => ({
      id: i,
      x: (Math.sin(i * 773) * 0.5 + 0.5) * 100,
      y: (Math.cos(i * 439) * 0.5 + 0.5) * 100,
      size: (i % 4 === 0 ? 2.8 : i % 2 === 0 ? 1.8 : 1.2),
      opacity: 0.25 + (i % 6) * 0.12,
      duration: 1.8 + (i % 5) * 0.8,
      delay: (i % 8) * 0.35,
      color: starColors[i % starColors.length]
    }));
  }, []);

  // Sequência de convergência dos módulos em direção ao Sol Central
  const startConvergenceSequence = () => {
    if (isTransitioningRef.current || stage !== 'orbit') return;
    isTransitioningRef.current = true;
    setStage('converging');

    // Contador de sincronismo dos módulos
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      if (current <= total) {
        setProgressCount(current);
      } else {
        clearInterval(interval);
      }
    }, 70);

    // Tempo de convergência fluida sem rotação dos módulos
    setTimeout(() => {
      setStage('consolidated');
      setProgressCount(total);
    }, 1100);

    // Conclusão e liberação da tela
    setTimeout(() => {
      setStage('done');
      onComplete();
    }, 2350);
  };

  // Modo Login: Executa automaticamente após breve introdução orbital
  // Modo Intro: Aguarda exclusivamente o clique do usuário na pré-tela
  useEffect(() => {
    if (mode === 'login') {
      const timer = setTimeout(() => {
        startConvergenceSequence();
      }, 850);
      return () => clearTimeout(timer);
    }
    // No modo 'intro', a animação NÃO avança automaticamente sem interação do usuário
  }, [mode]);

  if (stage === 'done') return null;

  const isConverging = stage === 'converging';
  const isConsolidated = stage === 'consolidated';
  const isConvergedOrConsolidated = isConverging || isConsolidated;

  // Dimensões responsivas do raio do Sistema Solar
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const radius = isMobile ? 140 : 225;
  const centerSize = isMobile ? 360 : 570;
  const halfCenter = centerSize / 2;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ 
        opacity: 0, 
        scale: 1.05, 
        filter: 'blur(10px)', 
        transition: { duration: 0.5, ease: 'circOut' } 
      }}
      onClick={() => {
        if (stage === 'orbit') {
          startConvergenceSequence();
        }
      }}
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-between bg-transparent text-white overflow-hidden select-none font-sans cursor-pointer p-4 sm:p-6"
    >
      {/* Background is handled by CosmicPrismaBackground behind this component */}
      <div className="absolute inset-0 bg-[#030611]/60 pointer-events-none backdrop-blur-[2px]" />

      {/* Subtle Central Glow for the Sun */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid Tech Subtil com Efeito Holográfico */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b10_1px,transparent_1px),linear-gradient(to_bottom,#1e293b10_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none opacity-40" />

      {/* ========================================================
          BARRA SUPERIOR (NAV / SKIP)
         ======================================================== */}
      <div className="w-full max-w-5xl flex justify-between items-center z-30 pt-2 px-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-amber-500/30 text-slate-200 text-[11px] font-mono font-bold tracking-wider backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '16s' }} />
          <span>{mode === 'login' ? 'INICIALIZAÇÃO DO SISTEMA' : 'ECOSSISTEMA ORBITAL VÉRTICE'}</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onComplete();
          }}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-slate-200 text-xs font-semibold transition-all hover:scale-105 shadow-lg backdrop-blur-md"
        >
          <span>Pular</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ========================================================
          TÍTULO DA TELA
         ======================================================== */}
      <div className="z-30 text-center max-w-2xl mx-auto px-4 space-y-2 mt-1 pointer-events-none">
        <h1 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-blue-200 tracking-tight drop-shadow-md">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 font-mono tracking-wide">
          {subtitle}
        </p>
      </div>

      {/* ========================================================
          SISTEMA SOLAR CENTRAL: SOL + PLANETAS EM ÓRBITA COM CSS KEYFRAMES
         ======================================================== */}
      <div 
        className="relative flex items-center justify-center z-30 my-auto pointer-events-none"
        style={{
          width: centerSize,
          height: centerSize,
        }}
      >
        {/* Anéis de Órbita Gravitacionais */}
        <div 
          className={`absolute rounded-full border border-slate-700/40 pointer-events-none transition-all duration-700 ${
            isConsolidated ? 'opacity-0 scale-50' : isConverging ? 'opacity-20 scale-75' : 'opacity-80'
          }`}
          style={{
            width: radius * 2,
            height: radius * 2,
            boxShadow: '0 0 35px rgba(59,130,246,0.1) inset, 0 0 35px rgba(59,130,246,0.1)'
          }}
        />

        <div 
          className={`absolute rounded-full border border-amber-500/25 border-dashed pointer-events-none transition-all duration-700 ${
            isConsolidated ? 'opacity-0 scale-50' : isConverging ? 'opacity-15 scale-75' : 'opacity-70'
          }`}
          style={{
            width: radius * 1.5,
            height: radius * 1.5,
          }}
        />

        {/* Efeito Supernova / Onda de Choque de Energia ao Consolidar */}
        {isConsolidated && (
          <>
            <motion.div
              initial={{ scale: 0.2, opacity: 1 }}
              animate={{ scale: 2.8, opacity: 0 }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
              className="absolute w-[280px] h-[280px] rounded-full bg-gradient-to-r from-amber-400 via-blue-500 to-emerald-400 blur-2xl pointer-events-none"
            />
            <motion.div
              initial={{ scale: 0.4, opacity: 0.9 }}
              animate={{ scale: 3.5, opacity: 0 }}
              transition={{ duration: 1.3, ease: 'easeOut', delay: 0.1 }}
              className="absolute w-[200px] h-[200px] rounded-full border-2 border-amber-300 blur-sm pointer-events-none"
            />
          </>
        )}

        {/* ========================================================
            O SOL (NÓ CENTRAL MASTER - LOGO VÉRTICE) COM BRILHO DIFUSO (GLOW)
           ======================================================== */}
        <div className="relative z-30 flex items-center justify-center">
          
          {/* Coroa Solar Radiante e Brilho Difuso (Glow) via Motion */}
          <motion.div
            animate={{
              rotate: 360,
              scale: isConsolidated ? [1, 1.35, 1.25] : [1, 1.08, 1],
              opacity: isConsolidated ? 1 : [0.6, 0.9, 0.6]
            }}
            transition={{
              rotate: { duration: 40, repeat: Infinity, ease: 'linear' },
              scale: { duration: 3.5, repeat: isConsolidated ? 0 : Infinity, ease: 'easeInOut' },
              opacity: { duration: 3.5, repeat: isConsolidated ? 0 : Infinity, ease: 'easeInOut' }
            }}
            className="absolute w-[240px] h-[240px] sm:w-[280px] sm:h-[280px] rounded-full bg-[radial-gradient(circle,_rgba(245,158,11,0.3)_0%,_rgba(59,130,246,0.15)_50%,_transparent_75%)] blur-2xl pointer-events-none will-change-transform"
          />

          {/* Disco do Sol / Master Vértice Auditor Fiscal */}
          <motion.div
            animate={
              isConsolidated
                ? { scale: [1, 1.25, 1.15] }
                : isConverging
                ? { scale: [1, 0.96, 1.08] }
                : { scale: 1 }
            }
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-30 flex flex-col items-center justify-center p-6 sm:p-8 rounded-full bg-[#080d1a] border-2 border-amber-400 shadow-[0_0_50px_rgba(245,158,11,0.4),0_0_100px_rgba(59,130,246,0.2)] backdrop-blur-2xl will-change-transform"
          >
            {/* Logo Oficial Master Vértice */}
            <BrandLogo 
              variant="icon" 
              module="master" 
              size={isMobile ? 'xl' : '2xl'} 
              showModuleIcon={false} 
              animate={isConverging || isConsolidated} 
            />

            {/* Texto Oficial Vértice Auditor Fiscal */}
            <div className="mt-2.5 text-center pointer-events-none">
              <span className="font-black text-xs sm:text-sm text-white tracking-wider font-sans block">
                VÉRTICE
              </span>
              <span className="text-[9px] sm:text-[10px] font-extrabold text-amber-400 uppercase tracking-[0.2em] block">
                AUDITOR FISCAL
              </span>
            </div>

            {/* Selo de Ecossistema Integrado */}
            <AnimatePresence>
              {isConsolidated && (
                <motion.div 
                  initial={{ scale: 0, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 260 }}
                  className="absolute -bottom-5 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-[0_0_25px_rgba(16,185,129,0.8)] flex items-center gap-1.5 whitespace-nowrap border border-emerald-300"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ECOSSISTEMA INTEGRADO</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* ========================================================
            SISTEMA SOLAR: CONTAINER ORBITAL (CSS KEYFRAMES + COUNTER-ROTATION)
            - Rotação suave contínua usando CSS para performance máxima.
            - Os planetas contra-rotacionam para manter ícones verticais.
            - Ao convergir, os planetas deslizam linearmente para (0,0).
           ======================================================== */}
        <div 
          className={`absolute inset-0 flex items-center justify-center pointer-events-none ${!isConvergedOrConsolidated ? 'animate-orbital-rotation' : ''}`}
        >
          {moduleKeys.map((modKey, idx) => {
            const modConfig = BRAND_MODULE_CONFIGS[modKey] || BRAND_MODULE_CONFIGS.master;
            const baseAngle = (idx * (360 / total));
            const rad = (baseAngle * Math.PI) / 180;

            const orbitX = Math.cos(rad) * radius;
            const orbitY = Math.sin(rad) * radius;

            return (
              <motion.div
                key={modKey}
                animate={{
                  x: isConvergedOrConsolidated ? 0 : orbitX,
                  y: isConvergedOrConsolidated ? 0 : orbitY,
                  scale: isConvergedOrConsolidated ? 0 : 1,
                  opacity: isConvergedOrConsolidated ? 0 : 1,
                }}
                transition={{ 
                  duration: isConvergedOrConsolidated ? 1.05 : 0.05, 
                  ease: [0.16, 1, 0.3, 1] 
                }}
                className="absolute z-20 flex items-center justify-center will-change-transform"
              >
                {/* Contra-Rotação via CSS para performance 60fps constante */}
                <div
                  className={`flex items-center justify-center p-2 rounded-2xl bg-slate-900/98 border transition-shadow relative will-change-transform ${!isConvergedOrConsolidated ? 'animate-orbital-counter-rotation' : ''}`}
                  style={{
                    borderColor: modConfig.topGradient[0] + '60',
                    boxShadow: `0 0 15px ${modConfig.glowColor}`,
                  }}
                >
                  {/* Brilho Difuso (Glow) da Atmosfera do Planeta (Otimizado) */}
                  <div 
                    className="absolute inset-0 rounded-2xl opacity-15 pointer-events-none"
                    style={{ background: `radial-gradient(circle, ${modConfig.topGradient[0]} 0%, transparent 80%)` }}
                  />

                  <div className="flex flex-col items-center justify-center relative z-10">
                    <BrandLogo 
                      variant="icon" 
                      module={modKey} 
                      size="sm" 
                      showModuleIcon={true} 
                    />
                    <span className="text-[8px] font-extrabold text-slate-200 tracking-tight mt-0.5 font-sans hidden sm:block whitespace-nowrap">
                      {modConfig.name.replace('VÉRTICE ', '')}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>

      {/* ========================================================
          RODAPÉ / PROGRESSO & BOTÃO DE INICIALIZAÇÃO
         ======================================================== */}
      <div className="z-30 text-center space-y-2.5 pb-2 max-w-md mx-auto w-full px-4">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 font-semibold">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Sincronismo de Inteligência Fiscal
          </span>
          <span className="text-amber-400 font-bold">
            {isConsolidated ? '100%' : `${Math.round((progressCount / total) * 100)}%`}
          </span>
        </div>

        {/* Barra de Progresso Estelar */}
        <div className="w-full h-2 bg-slate-800/90 rounded-full overflow-hidden border border-slate-700/60 p-[1px]">
          <motion.div 
            className="h-full bg-gradient-to-r from-blue-500 via-amber-400 to-emerald-400 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.6)]"
            initial={{ width: '0%' }}
            animate={{ 
              width: isConsolidated ? '100%' : `${(progressCount / total) * 100}%` 
            }}
            transition={{ duration: 0.2 }}
          />
        </div>

        {/* Call to Action */}
        <div>
          {stage === 'orbit' ? (
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={(e) => {
                e.stopPropagation();
                startConvergenceSequence();
              }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 hover:from-blue-500 hover:to-amber-400 text-white font-bold text-xs shadow-[0_0_25px_rgba(59,130,246,0.4)] cursor-pointer border border-white/20 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Clique aqui para Inicializar o Ecossistema</span>
            </motion.div>
          ) : isConsolidated ? (
            <span className="text-emerald-400 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 drop-shadow">
              <ShieldCheck className="w-4 h-4" /> Cockpit Master Pronto! Acessando...
            </span>
          ) : (
            <span className="text-amber-300 font-medium text-xs flex items-center justify-center gap-1.5 animate-pulse">
              <Sparkles className="w-3.5 h-3.5" /> Convergindo módulos fiscais ao centro...
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
