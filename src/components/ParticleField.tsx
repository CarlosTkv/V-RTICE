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
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const generated: Particle[] = Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1.5,
      duration: Math.random() * 12 + 8,
      delay: Math.random() * 5,
      color: i % 3 === 0 ? 'bg-blue-400' : i % 3 === 1 ? 'bg-cyan-400' : 'bg-emerald-400',
    }));
    setParticles(generated);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="absolute inset-0 overflow-hidden pointer-events-auto z-1"
    >
      {particles.map((p) => {
        // Calculate distance from mouse for interactive repulsion/attraction
        const distanceX = p.x - mousePos.x;
        const distanceY = p.y - mousePos.y;
        const dist = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
        const isClose = dist < 25;

        return (
          <motion.div
            key={p.id}
            initial={{
              x: `${p.x}vw`,
              y: `${p.y}vh`,
              opacity: 0.2,
              scale: 1,
            }}
            animate={{
              y: [`${p.y}vh`, `${(p.y - 15 + Math.random() * 30) % 100}vh`, `${p.y}vh`],
              x: [`${p.x}vw`, `${(p.x - 15 + Math.random() * 30) % 100}vw`, `${p.x}vw`],
              opacity: [0.2, 0.7, 0.2],
              scale: isClose ? 1.8 : 1,
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
            className={`rounded-full ${p.color} blur-[0.5px] shadow-[0_0_10px_currentColor] pointer-events-none`}
          />
        );
      })}
    </div>
  );
};
