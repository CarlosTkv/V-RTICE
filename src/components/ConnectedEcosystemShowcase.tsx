import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrandLogo, BrandModuleKey, BRAND_MODULE_CONFIGS } from './BrandLogo';

export const ConnectedEcosystemShowcase: React.FC = () => {
  const [hoveredKey, setHoveredKey] = useState<BrandModuleKey | null>(null);
  const [selectedKey, setSelectedKey] = useState<BrandModuleKey | null>(null);

  // 14 Módulos distribuídos em 3 Órbitas Concéntricas do Sistema Solar
  // Órbita 1 (Interior - 4 módulos nucleares)
  const orbit1: { key: BrandModuleKey; angleDeg: number }[] = [
    { key: 'simples', angleDeg: 0 },
    { key: 'tax', angleDeg: 90 },
    { key: 'monofasico', angleDeg: 180 },
    { key: 'reforma', angleDeg: 270 },
  ];

  // Órbita 2 (Intermediária - 5 módulos operacionais)
  const orbit2: { key: BrandModuleKey; angleDeg: number }[] = [
    { key: 'nfse', angleDeg: 36 },
    { key: 'bpo', angleDeg: 108 },
    { key: 'societario', angleDeg: 180 },
    { key: 'agenda', angleDeg: 252 },
    { key: 'auditoria', angleDeg: 324 },
  ];

  // Órbita 3 (Exterior - 5 módulos estratégicos e periciais)
  const orbit3: { key: BrandModuleKey; angleDeg: number }[] = [
    { key: 'parecer', angleDeg: 15 },
    { key: 'teses', angleDeg: 87 },
    { key: 'legalizacao', angleDeg: 159 },
    { key: 'conhecimentos', angleDeg: 231 },
    { key: 'parceiros', angleDeg: 303 },
  ];

  const allOrbits = [
    { radius: 135, items: orbit1, name: 'Órbita Essencial' },
    { radius: 235, items: orbit2, name: 'Órbita Operacional' },
    { radius: 335, items: orbit3, name: 'Órbita Estratégica' },
  ];

  const activeKey = hoveredKey || selectedKey;
  const activeConfig = activeKey ? BRAND_MODULE_CONFIGS[activeKey] : null;

  // Centro do SVG do Sistema Solar (800x800)
  const cx = 400;
  const cy = 400;

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-8 relative select-none flex flex-col items-center">
      
      {/* Luzes Nebulosas de Fundo (Sem container ou tabela fechada) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-600/10 via-blue-500/10 to-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* ========================================================================= */}
      {/* DESKTOP SOLAR SYSTEM VIEW (Órbitas circulares com conectores e Sol central) */}
      {/* ========================================================================= */}
      <div className="hidden md:flex relative w-[750px] h-[750px] lg:w-[800px] lg:h-[800px] items-center justify-center">
        
        {/* SVG dos Conectores Radiais, Anéis Orbitais e Linhas de Energia */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none" 
          viewBox="0 0 800 800"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Halo de Brilho do Sol Central */}
            <radialGradient id="solarCorona" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
              <stop offset="35%" stopColor="#0284c7" stopOpacity="0.15" />
              <stop offset="70%" stopColor="#0ea5e9" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="orbitLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#34d399" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.3" />
            </linearGradient>

            <filter id="glowLaser" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Halo Corona do Sol Central */}
          <circle cx={cx} cy={cy} r="110" fill="url(#solarCorona)" />

          {/* Anéis Orbitais do Sistema Solar */}
          {allOrbits.map((orb, i) => (
            <g key={`orbit-ring-${i}`}>
              {/* Trilha Orbital Principal */}
              <circle
                cx={cx}
                cy={cy}
                r={orb.radius}
                stroke="url(#orbitLineGrad)"
                strokeWidth="1"
                strokeDasharray={i === 0 ? "3 5" : i === 1 ? "4 8" : "2 6"}
                className="opacity-40"
              />
              {/* Anel sutil de profundidade */}
              <circle
                cx={cx}
                cy={cy}
                r={orb.radius + 1.5}
                stroke="#1e293b"
                strokeWidth="0.5"
                className="opacity-30"
              />
            </g>
          ))}

          {/* Conectores Radiais: Linhas de Feixe do Sol Central para cada Planeta/Módulo */}
          {allOrbits.flatMap((orb) => orb.items).map((item) => {
            const rad = (item.angleDeg * Math.PI) / 180;
            const r = allOrbits.find((o) => o.items.some((i) => i.key === item.key))?.radius || 200;
            const x = cx + r * Math.cos(rad);
            const y = cy + r * Math.sin(rad);
            const isHovered = activeKey === item.key;
            const cfg = BRAND_MODULE_CONFIGS[item.key] || BRAND_MODULE_CONFIGS.master;

            return (
              <g key={`connector-${item.key}`}>
                {/* Linha de Conexão Laser / Raio */}
                <line
                  x1={cx}
                  y1={cy}
                  x2={x}
                  y2={y}
                  stroke={isHovered ? cfg.topGradient[0] : '#334155'}
                  strokeWidth={isHovered ? 2.5 : 1}
                  strokeDasharray={isHovered ? 'none' : '3 6'}
                  filter={isHovered ? 'url(#glowLaser)' : undefined}
                  className="transition-all duration-300"
                  opacity={isHovered ? 1 : 0.28}
                />

                {/* Pulso de Energia Radiante no Conector Ativo */}
                {isHovered && (
                  <>
                    <circle
                      cx={cx + (r * 0.45) * Math.cos(rad)}
                      cy={cy + (r * 0.45) * Math.sin(rad)}
                      r="3.5"
                      fill={cfg.topGradient[0]}
                      className="animate-ping"
                    />
                    <circle
                      cx={cx + (r * 0.8) * Math.cos(rad)}
                      cy={cy + (r * 0.8) * Math.sin(rad)}
                      r="4"
                      fill={cfg.topGradient[1]}
                      filter="url(#glowLaser)"
                    />
                  </>
                )}
              </g>
            );
          })}
        </svg>

        {/* ===================================================================== */}
        {/* NÚCLEO DO SISTEMA SOLAR: APENAS O LOGO PRINCIPAL (Sem Nome da Empresa) */}
        {/* ===================================================================== */}
        <div className="absolute z-30 flex flex-col items-center justify-center pointer-events-auto">
          <div className="relative group cursor-pointer flex items-center justify-center">
            {/* Halo Solar Vibrante */}
            <div className="absolute -inset-6 rounded-full bg-gradient-to-r from-cyan-500/25 via-blue-500/25 to-emerald-400/25 blur-2xl opacity-90 group-hover:opacity-100 group-hover:scale-115 transition-all duration-700 pointer-events-none" />
            
            {/* Anel de Radiação Solar Sutil */}
            <div className="absolute -inset-3 rounded-full border border-cyan-400/40 opacity-60 animate-pulse pointer-events-none" />
            
            {/* APENAS O LOGO PRINCIPAL EM TAMANHO DESTAQUE (SUN ICON) */}
            <div className="relative z-10 p-2 transform group-hover:scale-108 transition-transform duration-500">
              <BrandLogo 
                variant="icon" 
                module="master" 
                size="2xl" 
                showModuleIcon={false}
              />
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* PLANETAS / MÓDULOS EM ÓRBITA CONCÊNTRICA                              */}
        {/* ===================================================================== */}
        {allOrbits.flatMap((orb) => orb.items.map((item) => ({ ...item, radius: orb.radius }))).map((item) => {
          const rad = (item.angleDeg * Math.PI) / 180;
          const xPercent = ((cx + item.radius * Math.cos(rad)) / 800) * 100;
          const yPercent = ((cy + item.radius * Math.sin(rad)) / 800) * 100;
          const cfg = BRAND_MODULE_CONFIGS[item.key] || BRAND_MODULE_CONFIGS.master;
          const isHovered = activeKey === item.key;

          return (
            <div
              key={item.key}
              style={{
                left: `${xPercent}%`,
                top: `${yPercent}%`,
              }}
              onMouseEnter={() => setHoveredKey(item.key)}
              onMouseLeave={() => setHoveredKey(null)}
              onClick={() => setSelectedKey(selectedKey === item.key ? null : item.key)}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-40 cursor-pointer group pointer-events-auto"
            >
              {/* Esfera / Nó Planetário */}
              <div 
                className={`relative p-2 rounded-full transition-all duration-300 flex items-center justify-center ${
                  isHovered 
                    ? 'scale-130 bg-[#0B101D]' 
                    : 'hover:scale-115 bg-[#080D18]/90'
                }`}
                style={{
                  boxShadow: isHovered 
                    ? `0 0 30px ${cfg.glowColor}, 0 0 12px ${cfg.topGradient[0]}` 
                    : `0 0 14px rgba(0,0,0,0.7), 0 0 6px ${cfg.glowColor}40`,
                  border: isHovered 
                    ? `2px solid ${cfg.topGradient[0]}` 
                    : `1px solid rgba(255,255,255,0.12)`,
                }}
              >
                {/* Aura de Cor do Módulo */}
                <div 
                  className="absolute inset-0 rounded-full opacity-30 group-hover:opacity-75 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle, ${cfg.topGradient[0]} 0%, transparent 70%)`
                  }}
                />

                {/* Ícone Prisma do Módulo */}
                <div className="relative z-10 flex items-center justify-center">
                  <BrandLogo 
                    variant="icon" 
                    module={item.key} 
                    size="md" 
                    showModuleIcon={true}
                  />
                </div>

                {/* Tooltip Orgânico Flutuante no Hover */}
                {isHovered && (
                  <div 
                    className={`absolute whitespace-nowrap pointer-events-none z-50 px-3 py-1 rounded-full bg-slate-950/95 border text-xs font-bold text-white shadow-2xl backdrop-blur-md animate-fadeIn ${
                      yPercent > 50 ? '-top-9' : '-bottom-9'
                    }`}
                    style={{ borderColor: `${cfg.topGradient[0]}90` }}
                  >
                    <span style={{ color: cfg.topGradient[0] }}>{cfg.name}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pílula HUD de Identificação Interativa (Aparece apenas quando um módulo é destacado) */}
      <div className="h-6 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {activeConfig && (
            <motion.div
              key={activeConfig.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="px-4 py-1 rounded-full bg-slate-900/90 border backdrop-blur-md shadow-xl flex items-center space-x-2.5"
              style={{ borderColor: `${activeConfig.topGradient[0]}70` }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: activeConfig.topGradient[0] }} />
              <span className="text-xs font-bold text-white">{activeConfig.name}</span>
              <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-widest hidden sm:inline">
                {activeConfig.badgeLabel}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE SOLAR SYSTEM VIEW (Conectores circulares e nós planetários fluidos) */}
      {/* ========================================================================= */}
      <div className="md:hidden flex flex-col items-center justify-center w-full space-y-6 pt-4">
        
        {/* Sol Central no Mobile (Apenas o logo) */}
        <div className="relative p-2 flex items-center justify-center">
          <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-emerald-500/20 blur-xl pointer-events-none" />
          <BrandLogo 
            variant="icon" 
            module="master" 
            size="xl" 
            showModuleIcon={false}
          />
        </div>

        {/* Nós Planetários em Órbita Fluida */}
        <div className="flex flex-wrap items-center justify-center gap-3 max-w-sm mx-auto">
          {allOrbits.flatMap((orb) => orb.items).map((item) => {
            const cfg = BRAND_MODULE_CONFIGS[item.key] || BRAND_MODULE_CONFIGS.master;
            const isHovered = activeKey === item.key;

            return (
              <button
                key={item.key}
                onClick={() => setSelectedKey(selectedKey === item.key ? null : item.key)}
                className={`p-2 rounded-full transition-all duration-300 flex items-center justify-center cursor-pointer relative ${
                  isHovered ? 'scale-115 bg-slate-900' : 'bg-slate-900/70 hover:bg-slate-800'
                }`}
                style={{
                  boxShadow: isHovered ? `0 0 16px ${cfg.glowColor}` : '0 2px 6px rgba(0,0,0,0.5)',
                  border: isHovered ? `1.5px solid ${cfg.topGradient[0]}` : '1px solid rgba(255,255,255,0.1)',
                }}
                title={cfg.name}
              >
                <BrandLogo 
                  variant="icon" 
                  module={item.key} 
                  size="sm" 
                  showModuleIcon={true}
                />
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
