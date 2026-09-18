import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
}

export const ParticleField: React.FC = () => {
  const particles: Particle[] = React.useMemo(() => {
    return Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: 15 + Math.random() * 20,
      delay: Math.random() * 10,
      color: i % 3 === 0 ? 'bg-blue-400' : i % 3 === 1 ? 'bg-cyan-400' : 'bg-emerald-400',
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-1">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: 0.1,
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, 20, 0],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: p.delay,
          }}
          style={{
            position: 'absolute',
            width: `${p.size}px`,
            height: `${p.size}px`,
          }}
          className={`rounded-full ${p.color} blur-[1px] will-change-transform`}
        />
      ))}
    </div>
  );
};
