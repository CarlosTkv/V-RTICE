import React, { useMemo } from 'react';
import bgImage from '../assets/images/corporate_tech_office_bg_1789415696102.jpg';

export const CosmicPrismaBackground: React.FC = () => {
  // Deterministic lightweight starfield positions for pure CSS rendering
  const stars = useMemo(() => {
    const starColors = [
      '#ffffff',
      '#93c5fd', // Soft blue
      '#fef08a', // Amber/gold
      '#c084fc', // Purple
      '#6ee7b7', // Emerald
      '#38bdf8', // Cyan
    ];

    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: (Math.sin(i * 773 + 17) * 0.5 + 0.5) * 100,
      y: (Math.cos(i * 439 + 31) * 0.5 + 0.5) * 100,
      size: i % 4 === 0 ? 2 : 1.2,
      opacity: 0.2 + (i % 5) * 0.1,
      color: starColors[i % starColors.length],
    }));
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 select-none bg-[#020308] transform-gpu">
      {/* 1. Deep Cosmic Radial Backdrop (Native Hardware Accelerated Gradients) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#0a122c_0%,_#050816_55%,_#020308_100%)]" />

      {/* 2. Base Corporate Tech Office Ambient Overlay */}
      <img
        src={bgImage}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover opacity-[0.14] filter brightness-75 pointer-events-none"
      />

      {/* 3. High Performance Smooth Nebula Glows via Pure Radial Gradients (Zero blur filter CPU/GPU lag) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,_rgba(37,99,235,0.12)_0%,_transparent_50%),radial-gradient(circle_at_75%_75%,_rgba(245,158,11,0.08)_0%,_transparent_45%),radial-gradient(circle_at_50%_50%,_rgba(16,185,129,0.06)_0%,_transparent_40%)]" />

      {/* 4. Deep Vignette Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#060A14]/70 via-transparent to-[#020308]/80" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(15,23,42,0.4)_0%,_transparent_70%)]" />

      {/* 5. Pure CSS Lightweight Starfield (Zero JS RAF loops) */}
      <div className="absolute inset-0">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              backgroundColor: star.color,
              opacity: star.opacity,
            }}
          />
        ))}
      </div>

      {/* 6. Subtle Holographic Grid Tech Matrix */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-35" />

      {/* 7. Vignette Fade around borders for pristine contrast */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_#020308_100%)] opacity-70" />
    </div>
  );
};
