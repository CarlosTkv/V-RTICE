import React from 'react';
import { LucideIcon } from 'lucide-react';

export type ModuleIconPattern = 'blue' | 'emerald' | 'amber' | 'indigo' | 'cyan' | 'purple' | 'teal' | 'rose' | 'slate' | 'default';

interface ModuleIconProps {
  icon: LucideIcon;
  pattern?: ModuleIconPattern;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export const ModuleIcon: React.FC<ModuleIconProps> = ({
  icon: Icon,
  pattern = 'default',
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: 24,
    md: 32,
    lg: 40,
    xl: 56,
    '2xl': 72
  };
  
  const outerSize = sizeMap[size];
  const innerSize = size === 'sm' ? 12 : size === 'md' ? 16 : size === 'lg' ? 20 : size === 'xl' ? 28 : 36;

  // Generate dynamic gradients based on the pattern
  const getColors = () => {
    switch (pattern) {
      case 'emerald': return { primary: '#34D399', primaryDark: '#059669', accent: '#A7F3D0', accentDark: '#047857' };
      case 'amber': return { primary: '#FBBF24', primaryDark: '#D97706', accent: '#FDE68A', accentDark: '#B45309' };
      case 'purple': return { primary: '#C084FC', primaryDark: '#7E22CE', accent: '#E9D5FF', accentDark: '#6B21A8' };
      case 'rose': return { primary: '#FB7185', primaryDark: '#BE123C', accent: '#FECDD3', accentDark: '#9F1239' };
      case 'cyan': return { primary: '#22D3EE', primaryDark: '#0891B2', accent: '#CFFAFE', accentDark: '#0E7490' };
      case 'teal': return { primary: '#2DD4BF', primaryDark: '#0F766E', accent: '#CCFBF1', accentDark: '#115E59' };
      case 'indigo': return { primary: '#818CF8', primaryDark: '#4338CA', accent: '#E0E7FF', accentDark: '#3730A3' };
      case 'slate': return { primary: '#94A3B8', primaryDark: '#334155', accent: '#E2E8F0', accentDark: '#1E293B' };
      case 'blue':
      case 'default':
      default: return { primary: '#38BDF8', primaryDark: '#1D4ED8', accent: '#BAE6FD', accentDark: '#1E3A8A' };
    }
  };

  const colors = getColors();
  const gradId = `mi-grad-${pattern}-${Math.random().toString(36).substr(2, 5)}`;

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`} style={{ width: outerSize, height: outerSize }}>
      {/* Hexagonal Geometric Prism Base (Inspired by Official Logo) */}
      <svg
        width={outerSize}
        height={outerSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 drop-shadow-md transition-all duration-300 group-hover:scale-105"
      >
        <defs>
          <linearGradient id={`${gradId}-primary`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.primary} />
            <stop offset="100%" stopColor={colors.primaryDark} />
          </linearGradient>
          <linearGradient id={`${gradId}-accent`} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colors.accent} />
            <stop offset="100%" stopColor={colors.accentDark} />
          </linearGradient>
          <linearGradient id={`${gradId}-dark`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
        </defs>

        {/* Outer faceted vertex boundary */}
        <polygon
          points="24,3 43,14 43,36 24,47 5,36 5,14"
          fill={`url(#${gradId}-dark)`}
          stroke="#334155"
          strokeWidth="1.5"
        />

        {/* Top Right Facet */}
        <polygon
          points="24,3 43,14 24,25"
          fill={`url(#${gradId}-primary)`}
          opacity="0.95"
        />

        {/* Right Lower Facet */}
        <polygon
          points="43,14 43,36 24,25"
          fill={`url(#${gradId}-accent)`}
          opacity="0.9"
        />

        {/* Left Lower Facet */}
        <polygon
          points="5,36 24,47 24,25"
          fill={colors.primaryDark}
          opacity="0.95"
        />

        {/* Left Upper Facet */}
        <polygon
          points="5,14 24,3 24,25"
          fill={colors.primary}
          opacity="0.8"
        />
        
        {/* Bottom Facet */}
        <polygon
          points="24,47 43,36 24,25"
          fill="#0F172A"
          opacity="0.85"
        />
      </svg>
      
      {/* Centered Lucide Icon overlaying the prism */}
      <Icon size={innerSize} className="relative z-10 text-white drop-shadow-md" strokeWidth={2.5} />
    </div>
  );
};
