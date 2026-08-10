import React from 'react';
import { StudioTheme } from '../types';

export type DividerStyle =
  | 'gradient-bar'
  | 'diamond-crest'
  | 'dotted-lead'
  | 'boxed-accent'
  | 'double-rule'
  | 'architect-grid'
  | 'minimal-bar'
  | 'none';

interface VisualSeparatorProps {
  style?: DividerStyle;
  theme: StudioTheme;
  customPrimaryColor?: string;
  label?: string;
  className?: string;
}

export const VisualSeparator: React.FC<VisualSeparatorProps> = ({
  style = 'gradient-bar',
  theme,
  customPrimaryColor,
  label,
  className = 'my-5'
}) => {
  if (style === 'none') return null;

  const primary = customPrimaryColor || theme.colors.primary || '#A855F7';
  const border = theme.colors.border || '#3B0764';
  const cardBg = theme.colors.cardBg || '#1E1B4B';
  const textSecondary = theme.colors.textSecondary || '#CBD5E1';

  switch (style) {
    case 'gradient-bar':
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          <div
            className="w-full h-[1.5px] opacity-80"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${primary} 35%, ${primary} 65%, transparent 100%)`
            }}
          />
          <div
            className="absolute px-2.5 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-widest font-bold shadow-sm flex items-center space-x-1"
            style={{
              backgroundColor: cardBg,
              borderColor: border,
              borderWidth: '1px',
              color: primary
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primary }} />
            {label ? (
              <span>{label}</span>
            ) : (
              <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2L2 12l10 10 10-10L12 2z" />
              </svg>
            )}
          </div>
        </div>
      );

    case 'diamond-crest':
      return (
        <div className={`flex items-center justify-center space-x-3 ${className}`}>
          <div className="flex-1 h-[1px] opacity-40" style={{ backgroundColor: border }} />
          <div className="flex items-center space-x-1.5" style={{ color: primary }}>
            <span className="text-[8px] opacity-50">◆</span>
            <span className="text-xs font-bold">◆</span>
            <span className="text-[8px] opacity-50">◆</span>
          </div>
          <div className="flex-1 h-[1px] opacity-40" style={{ backgroundColor: border }} />
        </div>
      );

    case 'dotted-lead':
      return (
        <div className={`flex items-center justify-between opacity-60 ${className}`}>
          <div className="flex space-x-1">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-1 h-1 rounded-full" style={{ backgroundColor: primary }} />
            ))}
          </div>
          {label && (
            <span className="text-[9px] font-mono tracking-widest uppercase font-bold px-2" style={{ color: textSecondary }}>
              {label}
            </span>
          )}
          <div className="flex-1 border-b border-dashed mx-2" style={{ borderColor: border }} />
          <div className="flex space-x-1">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-1 h-1 rounded-full" style={{ backgroundColor: primary }} />
            ))}
          </div>
        </div>
      );

    case 'boxed-accent':
      return (
        <div className={`flex items-center space-x-3 ${className}`}>
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: primary }} />
          <div
            className="flex-1 h-[2px]"
            style={{
              background: `linear-gradient(90deg, ${primary} 0%, ${border} 100%)`
            }}
          />
          {label && (
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono" style={{ color: primary }}>
              {label}
            </span>
          )}
        </div>
      );

    case 'double-rule':
      return (
        <div className={`space-y-1 ${className}`}>
          <div className="h-[2px] w-full" style={{ backgroundColor: primary }} />
          <div className="h-[0.5px] w-full opacity-60" style={{ backgroundColor: border }} />
        </div>
      );

    case 'architect-grid':
      return (
        <div className={`relative flex items-center ${className}`}>
          <span className="text-xs font-mono font-bold" style={{ color: primary }}>
            +
          </span>
          <div className="flex-1 border-b border-dashed mx-1" style={{ borderColor: border }} />
          {label && (
            <span className="text-[9px] font-mono uppercase px-2 font-bold" style={{ color: textSecondary }}>
              SECTION // {label}
            </span>
          )}
          <div className="flex-1 border-b border-dashed mx-1" style={{ borderColor: border }} />
          <span className="text-xs font-mono font-bold" style={{ color: primary }}>
            +
          </span>
        </div>
      );

    case 'minimal-bar':
    default:
      return (
        <div className={`flex items-center space-x-2 ${className}`}>
          <div className="w-8 h-[3px] rounded-full" style={{ backgroundColor: primary }} />
          <div className="flex-1 h-[1px]" style={{ backgroundColor: border, opacity: 0.5 }} />
        </div>
      );
  }
};
