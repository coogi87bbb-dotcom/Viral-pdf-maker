import React from 'react';
import type { LucideIcon } from 'lucide-react';

export type ModeTabBadgeVariant = 'neutral' | 'positive';

interface ModeTabProps {
  icon: LucideIcon;
  label: string;
  badge?: string;
  badgeVariant?: ModeTabBadgeVariant;
  active: boolean;
  onClick: () => void;
  /**
   * Inactive-state emphasis for a tab that should still read as "special"
   * even when not selected (the owner-only Master Admin entry). Normal tabs
   * leave this false.
   */
  emphasized?: boolean;
}

/**
 * A single entry in the global app-mode switcher. Extracted from what were
 * six near-identical ~15-line hand-rolled button blocks in App.tsx — same
 * markup, same handlers, only the icon/label/badge/mode changed. Pure
 * styling refactor: no behavior change.
 */
export const ModeTab: React.FC<ModeTabProps> = ({
  icon: Icon,
  label,
  badge,
  badgeVariant = 'neutral',
  active,
  onClick,
  emphasized = false,
}) => {
  const badgeClass = active
    ? 'bg-slate-950 text-accent-rosegold-300'
    : badgeVariant === 'positive'
      ? 'bg-status-positive-dim text-status-positive border border-status-positive/30'
      : 'bg-surface-1 text-ink-muted border border-hairline';

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-rosegold-400 ${
        active
          ? 'bg-accent-rosegold-400 text-slate-950 shadow-[var(--shadow-glow-rosegold)]'
          : emphasized
            ? 'bg-surface-1 text-accent-rosegold-300 border border-accent-rosegold-500/30 hover:bg-surface-2'
            : 'text-ink-muted hover:text-ink-primary hover:bg-surface-2'
      }`}
    >
      <Icon className={`h-3.5 w-3.5 ${active ? 'text-slate-950' : 'text-accent-rosegold-400'}`} />
      <span>{label}</span>
      {badge && (
        <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold hidden sm:inline ${badgeClass}`}>
          {badge}
        </span>
      )}
    </button>
  );
};

export default ModeTab;
