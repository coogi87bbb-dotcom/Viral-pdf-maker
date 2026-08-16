import React, { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Sparkles, LogOut, Menu, X } from 'lucide-react';
import { Badge, BadgeTone } from './Badge';

export interface SidebarItem<T extends string = string> {
  id: T;
  icon: LucideIcon;
  label: string;
  badge?: string;
  badgeTone?: BadgeTone;
  /** Inactive-state emphasis for an item that should still read as "special" (Master Admin). */
  emphasized?: boolean;
}

interface SidebarProps<T extends string = string> {
  items: SidebarItem<T>[];
  activeId: T;
  onSelect: (id: T) => void;
  userLabel: string;
  onLogout: () => void;
}

/**
 * Persistent left navigation for the signed-in Studio OS shell. Replaces
 * the old flat horizontal `ModeTab` pill row. Three responsive tiers:
 *  - `<sm` (phones): a slim top bar (brand + hamburger) + a bottom sheet
 *    that opens on tap — the one tier where an overlay pattern is justified,
 *    since the tool surfaces beneath it are already dense on small screens.
 *  - `sm`–`lg`: a persistent icon-only rail (labels via title tooltip).
 *  - `≥lg`: the full icon+label sidebar.
 * Brass-toned throughout — this is signed-in app chrome, not a pre-login
 * surface, so it deliberately does not reach for the rosegold ramp.
 */
export function Sidebar<T extends string = string>({
  items,
  activeId,
  onSelect,
  userLabel,
  onLogout,
}: SidebarProps<T>) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSelect = (id: T) => {
    onSelect(id);
    setMobileOpen(false);
  };

  const brand = (
    <div className="flex items-center gap-3">
      <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-accent-brass-400 via-accent-brass-500 to-accent-brass-600 p-0.5 shadow-[var(--shadow-glow-brass)] border border-accent-brass-400/30">
        <div className="h-full w-full bg-surface-0 rounded-[10px] flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-accent-brass-400" />
        </div>
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-display font-semibold text-base tracking-[-0.01em] text-white truncate">
            LogFlow<span className="text-accent-brass-400"> AI</span>
          </span>
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-accent-brass-500/10 text-accent-brass-300 font-bold border border-accent-brass-500/20 inline-block mt-0.5">
          STUDIO
        </span>
      </div>
    </div>
  );

  const sessionBlock = (
    <div className="flex items-center gap-3 px-3 py-3 border-t border-hairline">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-ink-secondary truncate">{userLabel}</p>
        <p className="text-[10px] text-accent-brass-400/90 font-mono flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-status-positive animate-pulse" />
          Connected
        </p>
      </div>
      <button
        onClick={onLogout}
        title="Sign Out"
        className="p-2 rounded-lg bg-surface-1/80 hover:bg-surface-2 border border-hairline text-ink-muted hover:text-white transition-colors active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brass-400"
      >
        <LogOut className="h-3.5 w-3.5" />
      </button>
    </div>
  );

  const NavButton: React.FC<{ item: SidebarItem<T>; showLabel: boolean }> = ({ item, showLabel }) => {
    const active = item.id === activeId;
    return (
      <button
        onClick={() => handleSelect(item.id)}
        title={item.label}
        aria-current={active ? 'page' : undefined}
        className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-colors active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brass-400 ${
          active
            ? 'bg-accent-brass-400 text-slate-950 shadow-[var(--shadow-glow-brass)]'
            : item.emphasized
              ? 'bg-surface-1 text-accent-brass-300 border border-accent-brass-500/30 hover:bg-surface-2'
              : 'text-ink-muted hover:text-ink-primary hover:bg-surface-2'
        } ${showLabel ? 'justify-start' : 'justify-center'}`}
      >
        <item.icon className={`h-4 w-4 shrink-0 ${active ? 'text-slate-950' : 'text-accent-brass-400'}`} />
        {showLabel && (
          <>
            <span className="truncate flex-1 text-left">{item.label}</span>
            {item.badge && (
              <Badge tone={active ? 'neutral' : item.badgeTone ?? 'neutral'} className={active ? '!bg-slate-950 !text-accent-brass-300 !border-0' : ''}>
                {item.badge}
              </Badge>
            )}
          </>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Mobile top bar (<sm) */}
      <div className="sm:hidden fixed top-0 inset-x-0 z-50 h-14 bg-surface-1/95 backdrop-blur-xl border-b border-hairline flex items-center justify-between px-4">
        {brand}
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
          className="p-2 rounded-lg bg-surface-2 border border-hairline text-ink-secondary hover:text-white transition-colors active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brass-400"
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>

      {/* Mobile bottom sheet */}
      {mobileOpen && (
        <div className="sm:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <button
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-surface-0/80 backdrop-blur-sm cursor-pointer"
          />
          <div className="relative bg-surface-1 border-t border-hairline rounded-t-3xl shadow-[var(--shadow-panel-brass)] max-h-[75vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-hairline">
              {brand}
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
                className="p-2 rounded-lg bg-surface-2 border border-hairline text-ink-secondary hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brass-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="p-3 flex flex-col gap-1">
              {items.map((item) => (
                <NavButton key={item.id} item={item} showLabel />
              ))}
            </nav>
            {sessionBlock}
          </div>
        </div>
      )}

      {/* Tablet icon-rail (sm–lg) */}
      <aside className="hidden sm:flex lg:hidden fixed left-0 top-0 bottom-0 z-40 w-16 bg-surface-1/95 backdrop-blur-xl border-r border-hairline flex-col items-center py-4 gap-1">
        <div className="mb-3 h-9 w-9 rounded-xl bg-gradient-to-br from-accent-brass-400 via-accent-brass-500 to-accent-brass-600 p-0.5 shadow-[var(--shadow-glow-brass)] border border-accent-brass-400/30">
          <div className="h-full w-full bg-surface-0 rounded-[10px] flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-accent-brass-400" />
          </div>
        </div>
        <nav className="flex-1 w-full px-2 flex flex-col gap-1 overflow-y-auto">
          {items.map((item) => (
            <NavButton key={item.id} item={item} showLabel={false} />
          ))}
        </nav>
        <button
          onClick={onLogout}
          title="Sign Out"
          className="p-2 rounded-lg bg-surface-2 border border-hairline text-ink-muted hover:text-white transition-colors active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brass-400"
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </aside>

      {/* Desktop full sidebar (≥lg) */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 z-40 w-60 bg-surface-1/95 backdrop-blur-xl border-r border-hairline flex-col">
        <div className="px-4 py-4 border-b border-hairline">{brand}</div>
        <nav className="flex-1 px-3 py-3 flex flex-col gap-1 overflow-y-auto">
          {items.map((item) => (
            <NavButton key={item.id} item={item} showLabel />
          ))}
        </nav>
        {sessionBlock}
      </aside>
    </>
  );
}

export default Sidebar;
