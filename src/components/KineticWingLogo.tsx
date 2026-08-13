import React from 'react';

interface KineticWingLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const KineticWingLogo: React.FC<KineticWingLogoProps> = ({
  className = '',
  size = 32,
  showText = true
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 cursor-pointer group ${className}`}>
      {/* Vector Kinetic Wing / Quantum Node Emblem */}
      <div 
        className="relative flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105"
        style={{ width: size, height: size }}
      >
        <svg 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_2px_8px_rgba(124,58,237,0.3)]"
        >
          {/* Central Quantum Node Core */}
          <circle cx="50" cy="50" r="10" fill="#7C3AED" />
          
          {/* Feather 1: Hermes Logistics Pink (#E11D48) */}
          <path 
            d="M 22 78 L 38 52 L 48 50 L 32 82 Z" 
            fill="#E11D48" 
            className="transition-transform duration-300 group-hover:-translate-y-0.5"
          />
          
          {/* Feather 2: ProgressoPro Violet (#7C3AED) */}
          <path 
            d="M 32 30 L 48 48 L 52 48 L 38 24 Z" 
            fill="#7C3AED" 
            className="transition-transform duration-300 group-hover:-translate-x-0.5"
          />
          
          {/* Feather 3: Business Academy Amber (#F59E0B) */}
          <path 
            d="M 68 22 L 52 48 L 50 52 L 62 18 Z" 
            fill="#F59E0B" 
            className="transition-transform duration-300 group-hover:translate-y-0.5"
          />
          
          {/* Feather 4: IT / AI Sky Blue (#3B82F6) */}
          <path 
            d="M 78 70 L 52 52 L 50 50 L 68 76 Z" 
            fill="#3B82F6" 
            className="transition-transform duration-300 group-hover:translate-x-0.5"
          />

          {/* Converging H-Bar Connector */}
          <path d="M 38 50 L 62 50" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity="0.9" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className="font-extrabold tracking-tight text-sm text-current font-heading flex items-center gap-1">
            HERMES <span className="text-xs px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-mono font-semibold border border-indigo-500/30">CONNECT</span>
          </span>
          <span className="text-[9px] uppercase tracking-widest text-slate-400 font-medium mt-0.5">
            AI Operating System
          </span>
        </div>
      )}
    </div>
  );
};
