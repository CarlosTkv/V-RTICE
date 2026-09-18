import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import bgImage from '../assets/images/corporate_tech_office_bg_1789415696102.jpg';

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

export const CosmicPrismaBackground: React.FC = () => {
  // Deterministic starfield generation for steady, smooth 60fps performance
  const stars: StarParticle[] = useMemo(() => {
    const starColors = [
      '#ffffff',
      '#93c5fd', // Soft blue
      '#fef08a', // Amber/gold
      '#c084fc', // Purple
      '#6ee7b7', // Emerald
      '#38bdf8', // Cyan
      '#f43f5e', // Rose
      '#2dd4bf', // Teal
    ];

    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: (Math.sin(i * 773 + 17) * 0.5 + 0.5) * 100,
      y: (Math.cos(i * 439 + 31) * 0.5 + 0.5) * 100,
      size: i % 5 === 0 ? 2.2 : i % 2 === 0 ? 1.4 : 0.8,
      opacity: 0.2 + (i % 6) * 0.08,
      duration: 3 + (i % 5) * 1.5,
      delay: (i % 8) * 0.4,
      color: starColors[i % starColors.length],
    }));
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 select-none bg-[#020308]">
      {/* 1. Deep Cosmic Radial Backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#0a122c_0%,_#050816_55%,_#020308_100%)]" />

      {/* 2. Base Corporate Tech Office Ambient Overlay (Optimized) */}
      <img
        src={bgImage}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-[0.18] filter brightness-[0.8] mix-blend-luminosity will-change-transform"
      />

      {/* 3. Deep Vignette Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#060A14]/70 via-transparent to-[#020308]/80" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(15,23,42,0.4)_0%,_transparent_70%)]" />

      {/* 4. Living Cosmic Nebulas (Reduced count and optimized blur) */}
      <div
        className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/12 rounded-full blur-[80px] mix-blend-screen animate-nebula-pulse will-change-transform"
      />

      <div
        className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[90px] mix-blend-screen animate-nebula-pulse-delayed will-change-transform"
      />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/8 rounded-full blur-[80px] mix-blend-screen pointer-events-none" />

      {/* 5. Dynamic Starfield (Simplified) */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          animate={{
            opacity: [star.opacity * 0.4, star.opacity, star.opacity * 0.4],
          }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute rounded-full will-change-opacity"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: star.color,
            boxShadow: star.size > 2 ? `0 0 6px ${star.color}` : 'none',
          }}
        />
      ))}

      {/* 6. Cosmic Shooting Stars (CSS Optimized) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-36 h-[1.8px] bg-gradient-to-r from-transparent via-cyan-300 to-white -rotate-45 blur-[0.5px] animate-shooting-star-1" />
        <div className="absolute w-32 h-[1.5px] bg-gradient-to-l from-transparent via-amber-300 to-white rotate-[35deg] blur-[0.5px] animate-shooting-star-2" />
        <div className="absolute w-28 h-[1.4px] bg-gradient-to-r from-transparent via-emerald-300 to-white rotate-[-25deg] blur-[0.5px] animate-shooting-star-3" />
      </div>

      {/* 7. Subtle Holographic Grid Tech Matrix */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b16_1px,transparent_1px),linear-gradient(to_bottom,#1e293b16_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-45" />

      {/* 8. Vignette Fade around borders for pristine contrast */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_#020308_100%)] opacity-70" />
    </div>
  );
};
