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

    return Array.from({ length: 90 }, (_, i) => ({
      id: i,
      x: (Math.sin(i * 773 + 17) * 0.5 + 0.5) * 100,
      y: (Math.cos(i * 439 + 31) * 0.5 + 0.5) * 100,
      size: i % 5 === 0 ? 3.0 : i % 2 === 0 ? 2.0 : 1.2,
      opacity: 0.35 + (i % 6) * 0.12,
      duration: 1.8 + (i % 5) * 0.8,
      delay: (i % 8) * 0.35,
      color: starColors[i % starColors.length],
    }));
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 select-none">
      {/* 1. Deep Cosmic Radial Backdrop (Exact match with Pre-Screen) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#0a122c_0%,_#050816_55%,_#020308_100%)]" />

      {/* 2. Base Corporate Tech Office Ambient Overlay with Blending */}
      <img
        src={bgImage}
        alt="Corporate Tech Office Texture"
        className="absolute inset-0 w-full h-full object-cover opacity-[0.22] filter brightness-[0.9] saturate-150 mix-blend-luminosity scale-100 transition-all duration-1000"
      />

      {/* 3. Deep Vignette Gradients for Text Contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#060A14]/80 via-transparent to-[#020308]/90" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(15,23,42,0.6)_0%,_transparent_70%)]" />

      {/* 4. Living Cosmic Nebulas with Smooth Scaling & Breathing Pulses */}
      <motion.div
        animate={{
          opacity: [0.35, 0.65, 0.35],
          scale: [0.95, 1.12, 0.95],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-600/20 rounded-full blur-[150px] mix-blend-screen"
      />

      <motion.div
        animate={{
          opacity: [0.3, 0.58, 0.3],
          scale: [1.08, 0.95, 1.08],
          x: [0, -25, 0],
          y: [0, 25, 0],
        }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[700px] h-[700px] bg-amber-500/18 rounded-full blur-[160px] mix-blend-screen"
      />

      <motion.div
        animate={{
          opacity: [0.25, 0.5, 0.25],
          scale: [0.98, 1.15, 0.98],
        }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-emerald-500/15 rounded-full blur-[140px] mix-blend-screen"
      />

      <motion.div
        animate={{
          opacity: [0.2, 0.45, 0.2],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        className="absolute top-3/4 left-1/3 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[150px] mix-blend-screen"
      />

      {/* 5. Dynamic Starfield / Twinkling Stellar Particles */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          animate={{
            opacity: [star.opacity * 0.2, star.opacity * 1.2, star.opacity * 0.2],
            scale: [0.75, 1.35, 0.75],
          }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: star.color,
            boxShadow: star.size > 2 ? `0 0 10px ${star.color}` : `0 0 4px ${star.color}`,
          }}
        />
      ))}

      {/* 6. Cosmic Shooting Stars (Meteor / Comet Refractions) */}
      <motion.div
        animate={{
          x: ['-20vw', '120vw'],
          y: ['15vh', '75vh'],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 2.3,
          repeat: Infinity,
          repeatDelay: 6.5,
          ease: 'easeOut',
        }}
        className="absolute w-36 h-[1.8px] bg-gradient-to-r from-transparent via-cyan-300 to-white -rotate-45 blur-[0.5px]"
      />

      <motion.div
        animate={{
          x: ['110vw', '-10vw'],
          y: ['25vh', '85vh'],
          opacity: [0, 0.9, 0],
        }}
        transition={{
          duration: 2.0,
          repeat: Infinity,
          repeatDelay: 9.5,
          ease: 'easeOut',
          delay: 3,
        }}
        className="absolute w-32 h-[1.5px] bg-gradient-to-l from-transparent via-amber-300 to-white rotate-[35deg] blur-[0.5px]"
      />

      <motion.div
        animate={{
          x: ['-10vw', '110vw'],
          y: ['60vh', '20vh'],
          opacity: [0, 0.85, 0],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          repeatDelay: 12,
          ease: 'easeOut',
          delay: 7,
        }}
        className="absolute w-28 h-[1.4px] bg-gradient-to-r from-transparent via-emerald-300 to-white rotate-[-25deg] blur-[0.5px]"
      />

      {/* 7. Subtle Holographic Grid Tech Matrix */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b16_1px,transparent_1px),linear-gradient(to_bottom,#1e293b16_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-45" />

      {/* 8. Vignette Fade around borders for pristine contrast */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_#020308_100%)] opacity-70" />
    </div>
  );
};
