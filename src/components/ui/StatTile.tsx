import React from 'react';
import type { LucideIcon } from 'lucide-react';

export type StatTileTrend = 'positive' | 'danger' | 'neutral';

interface StatTileProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  /** Short supporting text — e.g. "since last export". Never fabricate a number here. */
  hint?: string;
  /** Optional delta readout (e.g. "+3 today"). Only render when a real value exists. */
  delta?: { text: string; trend: StatTileTrend };
  /** Optional lightweight sparkline — an array of relative values, no axis/legend needed at this scale. */
  sparkline?: number[];
}

const TREND_CLASS: Record<StatTileTrend, string> = {
  positive: 'text-status-positive',
  danger: 'text-status-danger',
  neutral: 'text-ink-muted',
};

// A single current value (+ maybe a trend) is a stat tile, never a chart —
// per dataviz guidance. Status colors (positive/danger) are reserved for
// genuine state, not decorative variety; a bare `neutral` value never
// borrows brass/accent color for the number itself, only the icon plate does.
export const StatTile: React.FC<StatTileProps> = ({ icon: Icon, label, value, hint, delta, sparkline }) => {
  const max = sparkline && sparkline.length > 0 ? Math.max(...sparkline, 1) : 1;

  return (
    <div className="bg-surface-2 border border-hairline rounded-2xl p-5 shadow-[var(--shadow-panel-brass)] flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="h-9 w-9 rounded-xl bg-accent-brass-500/10 border border-accent-brass-500/25 flex items-center justify-center">
          <Icon className="h-4 w-4 text-accent-brass-400" />
        </div>
        {delta && (
          <span className={`text-[11px] font-mono font-bold ${TREND_CLASS[delta.trend]}`}>{delta.text}</span>
        )}
      </div>

      <div>
        <p className="text-2xl font-display font-semibold text-ink-primary tracking-[-0.02em]">{value}</p>
        <p className="text-xs text-ink-muted mt-0.5">{label}</p>
      </div>

      {sparkline && sparkline.length > 1 && (
        <svg viewBox={`0 0 ${sparkline.length * 8} 24`} className="w-full h-6" preserveAspectRatio="none" aria-hidden="true">
          <polyline
            points={sparkline.map((v, i) => `${i * 8},${24 - (v / max) * 22}`).join(' ')}
            fill="none"
            stroke="var(--color-accent-brass-400)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}

      {hint && <p className="text-[11px] text-ink-muted/80">{hint}</p>}
    </div>
  );
};

export default StatTile;
