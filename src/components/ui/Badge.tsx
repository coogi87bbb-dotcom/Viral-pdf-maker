import React from 'react';

export type BadgeTone = 'brass' | 'positive' | 'warning' | 'danger' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}

// Consolidates the small pill/badge markup that used to be hand-rolled
// per-file across ~15+ tool surfaces (status chips, "N AI Tools" counts,
// feature tags) — each with its own one-off raw-Tailwind color. Tone maps
// onto this app's own tokens, never a default-palette color.
const TONES: Record<BadgeTone, string> = {
  brass: 'bg-accent-brass-500/10 text-accent-brass-300 border border-accent-brass-500/25',
  positive: 'bg-status-positive-dim text-status-positive border border-status-positive/30',
  warning: 'bg-accent-amber-500/10 text-accent-amber-400 border border-accent-amber-500/25',
  danger: 'bg-status-danger-dim text-status-danger border border-status-danger/30',
  neutral: 'bg-surface-1 text-ink-muted border border-hairline',
};

export const Badge: React.FC<BadgeProps> = ({ children, tone = 'neutral', className = '' }) => (
  <span
    className={`inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${TONES[tone]} ${className}`}
  >
    {children}
  </span>
);

export default Badge;
