import React from 'react';
import { FileText, Flame, Zap, Package, Bot, Handshake, Crown, BookOpen, Bookmark, LayoutGrid } from 'lucide-react';
import type { AppMode } from '../App';
import type { DocumentData } from '../types';
import { MotionPanel3D } from './MotionPanel3D';
import { Panel } from './ui/Panel';
import { StatTile } from './ui/StatTile';
import { Badge } from './ui/Badge';

interface DashboardHomeProps {
  displayName: string;
  document: DocumentData;
  isOwner: boolean;
  onNavigate: (mode: AppMode) => void;
}

interface ToolCard {
  id: Exclude<AppMode, 'home'>;
  icon: typeof FileText;
  label: string;
  description: string;
  badge?: string;
  ownerOnly?: boolean;
}

const TOOL_CARDS: ToolCard[] = [
  {
    id: 'pdf-studio',
    icon: FileText,
    label: 'PDF & Mockup Studio',
    description: 'Design, theme, and export polished PDF documents plus 3D product mockups.',
  },
  {
    id: 'viral-os',
    icon: Flame,
    label: 'Viral OS Engine',
    description: '12 AI tools for campaigns, hooks, trends, and content scheduling.',
    badge: '12 AI Tools',
  },
  {
    id: 'gig-scale',
    icon: Zap,
    label: 'GigScale Engine',
    description: 'Price, pitch, and scale freelance and agency service offers.',
    badge: 'Agency OS',
  },
  {
    id: 'digital-kit',
    icon: Package,
    label: 'Digital Kit Studio',
    description: 'Build and export branded digital product and resume kits.',
    badge: 'Kit Builder',
  },
  {
    id: 'agent-ops',
    icon: Bot,
    label: 'AI Agent Ops',
    description: 'Self-healing runtime monitoring and agent operations.',
    badge: 'Self-Healing',
  },
  {
    id: 'deal-closer',
    icon: Handshake,
    label: 'Deal Closer',
    description: '8 AI tools for real-estate underwriting, offers, and closing.',
    badge: '8 RE Tools',
  },
  {
    id: 'owner-admin',
    icon: Crown,
    label: 'Master Admin',
    description: 'Executive command center — users, metrics, platform health.',
    ownerOnly: true,
  },
];

/** Reads a JSON array's length from localStorage without throwing on missing/malformed data. */
function readSavedCount(key: string): number {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({ displayName, document, isOwner, onNavigate }) => {
  const savedHooks = readSavedCount('viralos_saved_hooks');
  const favoriteTemplates = readSavedCount('viralos_favorite_templates');

  const visibleTools = TOOL_CARDS.filter((tool) => !tool.ownerOnly || isOwner);

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome band — the app's one live use of .marble-panel, per its own
          intended purpose (a header band / callout, not a full-page bg).
          Pushes the identity further with a large brass-outlined monogram
          (a hotel crest) bleeding off the panel's corner, bigger display
          type, and a brass hairline under the eyebrow label. */}
      <MotionPanel3D delay={0.05} tiltX={6} hoverTilt={false} frosted={false}>
        <div className="relative overflow-hidden marble-panel rounded-3xl border border-marble-vein/40 shadow-[var(--shadow-panel-brass)] px-6 py-8 sm:px-10 sm:py-12">
          <span
            aria-hidden="true"
            className="pointer-events-none select-none absolute -bottom-8 -right-4 font-display text-[9rem] sm:text-[12rem] font-semibold leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(58,50,38,0.16)]"
          >
            LF
          </span>
          <div className="relative">
            <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-marble-shadow/70 font-bold">
              Studio OS Dashboard
            </p>
            <hr className="mt-3 h-px w-16 border-0 bg-accent-brass-700/40" />
            <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-[-0.02em] text-marble-shadow mt-4">
              Welcome back, {displayName}
            </h1>
            <p className="text-sm text-marble-shadow/80 mt-3 max-w-xl leading-[1.7]">
              Everything you need to design, publish, and market your content lives in one workspace. Pick up where
              you left off or jump into a tool below.
            </p>
          </div>
        </div>
      </MotionPanel3D>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile icon={BookOpen} label="Active Document" value={document.title || 'Untitled'} hint={`${document.sections.length} sections`} />
        <StatTile icon={Bookmark} label="Saved Hooks" value={savedHooks} hint="Psychological Hook Studio" />
        <StatTile icon={LayoutGrid} label="Favorite Templates" value={favoriteTemplates} hint="Template Vault" />
        <StatTile icon={Flame} label="Studio Tools" value={visibleTools.length} hint="Ready to launch" />
      </div>

      {/* Quick-launch grid — small independent hoverable tiles, not a full
          tool workspace, so hoverTilt stays true here (the one deliberate
          exception to the "hoverTilt={false} on full-body wraps" rule —
          see MotionPanel3D.tsx's own doc comment). Do not copy this pattern
          onto a full tool-body wrapper elsewhere. */}
      <div>
        <h2 className="font-display text-lg font-semibold text-ink-primary tracking-[-0.01em] mb-4">Your Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {visibleTools.map((tool, i) => (
            <MotionPanel3D key={tool.id} delay={0.05 * i} tiltX={6} hoverTilt frosted={false}>
              <button onClick={() => onNavigate(tool.id)} className="w-full text-left cursor-pointer">
                <Panel className="relative hover:border-accent-brass-500/40 transition-colors h-full">
                  {/* Wing-plaque number — a small hotel-directory-style room
                      marker, the "Grand Hotel" identity's own answer to the
                      landing page's index-numeral device (same instinct —
                      give every entry in a list its own confident numbered
                      marker — expressed through this system's own brass/
                      plaque vocabulary instead of copied outline type). */}
                  <span className="absolute right-4 top-4 font-mono text-[10px] font-bold tracking-widest text-accent-brass-400/60 border border-accent-brass-500/25 rounded px-1.5 py-0.5">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="h-10 w-10 rounded-xl bg-accent-brass-500/10 border border-accent-brass-500/25 flex items-center justify-center shrink-0">
                    <tool.icon className="h-5 w-5 text-accent-brass-400" />
                  </div>
                  {tool.badge && <Badge tone="brass" className="mt-3 inline-flex w-fit">{tool.badge}</Badge>}
                  <h3 className="font-display text-base font-semibold text-ink-primary mt-4">{tool.label}</h3>
                  <p className="text-xs text-ink-secondary mt-1.5 leading-[1.6]">{tool.description}</p>
                </Panel>
              </button>
            </MotionPanel3D>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
