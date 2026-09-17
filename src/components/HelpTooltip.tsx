import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, Info, BookOpen } from 'lucide-react';

interface HelpTooltipProps {
  title?: string;
  content: string | React.ReactNode;
  law?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md';
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  title,
  content,
  law,
  className = '',
  size = 'sm',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
  };

  return (
    <div 
      ref={tooltipRef} 
      className={`relative inline-flex items-center no-print ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(prev => !prev);
        }}
        className="text-slate-400 hover:text-amber-400 focus:outline-none transition-colors p-0.5 rounded-full hover:bg-slate-800/60 cursor-help"
        aria-label="Ajuda e Instruções"
      >
        <HelpCircle className={iconSizes[size]} />
      </button>

      {isOpen && (
        <div 
          className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 sm:w-80 p-3.5 rounded-xl bg-[#0F172A] border border-slate-700 shadow-2xl text-white text-xs animate-in fade-in zoom-in-95 duration-150 pointer-events-auto"
        >
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-[#0F172A]" />

          {title && (
            <div className="flex items-center space-x-1.5 font-bold text-amber-400 pb-1.5 mb-1.5 border-b border-slate-800 text-[11px] uppercase tracking-wider">
              <Info className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span className="text-white">{title}</span>
            </div>
          )}

          <div className="text-[11px] text-white leading-relaxed space-y-1">
            {content}
          </div>

          {law && (
            <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center space-x-1 text-[10px] text-slate-300 font-mono">
              <BookOpen className="w-3 h-3 text-slate-300 flex-shrink-0" />
              <span className="truncate text-white">{law}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
