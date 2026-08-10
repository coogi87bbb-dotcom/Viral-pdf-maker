import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Flame, 
  Sparkles, 
  Zap, 
  Target, 
  BarChart3, 
  FileCode2, 
  Image as ImageIcon, 
  Calendar, 
  DollarSign,
  Trophy,
  Video,
  Briefcase,
  Radio,
  ShieldCheck,
  LogOut,
  User,
  Bookmark,
  Twitter,
  Instagram,
  Facebook,
  AtSign,
  Pin,
  Linkedin,
  Download,
  FileDown
} from 'lucide-react';

export type ActiveTab = 
  | 'campaign' 
  | 'pulse'
  | 'hooks' 
  | 'templates'
  | 'analyzer' 
  | 'teleprompter'
  | 'visuals' 
  | 'blueprint' 
  | 'calendar' 
  | 'gigscale'
  | 'agency'
  | 'matrix'
  | 'roi'
  | 'admin';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onQuickStart: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onQuickStart }) => {
  const { user, userProfile, isOwner, logout } = useAuth();

  const baseTabs = [
    { id: 'campaign' as ActiveTab, label: 'Omni-Campaign Factory', icon: Sparkles, badge: '7 Networks' },
    { id: 'gigscale' as ActiveTab, label: 'GigScale Freelance Engine', icon: Zap, badge: 'High-Ticket Gigs' },
    { id: 'pulse' as ActiveTab, label: 'Trending Topics Pulse', icon: Radio, badge: 'Google Search Live' },
    { id: 'templates' as ActiveTab, label: 'Template Vault', icon: Bookmark, badge: 'Save & Reuse' },
    { id: 'hooks' as ActiveTab, label: 'Psychological Hook Studio', icon: Target, badge: '10+ Frameworks' },
    { id: 'analyzer' as ActiveTab, label: 'Virality Auditor', icon: BarChart3, badge: 'AI Rewriter' },
    { id: 'teleprompter' as ActiveTab, label: 'Video Teleprompter', icon: Video, badge: 'Reels / TikTok' },
    { id: 'visuals' as ActiveTab, label: 'Visual Graphic Studio', icon: ImageIcon, badge: 'Gemini Image AI' },
    { id: 'blueprint' as ActiveTab, label: 'System Instruction Blueprint', icon: FileCode2, badge: 'Meta-Architect' },
    { id: 'calendar' as ActiveTab, label: 'Content Calendar', icon: Calendar, badge: 'Auto-Planner' },
    { id: 'agency' as ActiveTab, label: 'White-Label Agency Pitch', icon: Briefcase, badge: '$5k/mo Leads' },
    { id: 'matrix' as ActiveTab, label: 'Competitor Parity Matrix', icon: Trophy, badge: 'Crush Competitors' },
    { id: 'roi' as ActiveTab, label: 'ROI & Savings', icon: DollarSign, badge: 'Calculator' },
  ];

  // Only show Admin tab to verified Owner
  const tabs = isOwner
    ? [
        { id: 'admin' as ActiveTab, label: 'Owner Control Center', icon: ShieldCheck, badge: 'Master Admin' },
        ...baseTabs,
      ]
    : baseTabs;

  return (
    <header className="sticky top-0 z-50 bg-[#08090e]/85 backdrop-blur-[20px] backdrop-saturate-150 border-b border-slate-800/80 text-slate-100 shadow-2xl">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-amber-500/20 px-4 py-1.5 text-xs font-medium text-amber-200 text-center flex items-center justify-between">
        <div className="flex items-center gap-2 mx-auto sm:mx-0">
          <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-mono text-amber-300">ViralOS v10.0 Active — 3D Liquid Gold Engine</span>
          <span className="hidden sm:inline-block text-amber-500/50">•</span>
          <span className="hidden sm:inline-block text-slate-300 font-mono text-[11px]">X • Instagram • TikTok • Facebook • Threads • Pinterest • LinkedIn</span>
        </div>

        {user && (
          <div className="hidden sm:flex items-center gap-3 text-[11px]">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isOwner) {
                  setActiveTab('admin');
                }
              }}
              className="text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer group p-1 rounded-md hover:bg-slate-900/60"
              title={isOwner ? "Click to open Owner Control Center" : "VIP Account"}
            >
              <User className="h-3 w-3 text-rose-400 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-white group-hover:text-rose-300 transition-colors">
                {userProfile?.displayName || user.email}
              </span>
              {isOwner && (
                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono text-[9px] border border-amber-500/30">
                  OWNER
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (window.confirm("Are you sure you want to sign out of your VIP session?")) {
                  logout();
                }
              }}
              className="px-2 py-0.5 rounded bg-slate-900 hover:bg-red-600 text-slate-300 hover:text-white transition-all flex items-center gap-1 border border-slate-700"
            >
              <LogOut className="h-3 w-3" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-600 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center border border-amber-400/30">
                <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Flame className="h-5 w-5 text-amber-400 animate-pulse" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-amber-200 bg-clip-text text-transparent">
                    ViralOS
                  </h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    ENTERPRISE
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Omni-Social Content & Digital Marketing OS
                </p>
              </div>
            </div>

            {/* Platform Badges */}
            <div className="hidden xl:flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
              <span title="X / Twitter" className="p-1.5 rounded bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition-colors"><Twitter className="h-3.5 w-3.5" /></span>
              <span title="Instagram" className="p-1.5 rounded bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"><Instagram className="h-3.5 w-3.5" /></span>
              <span title="TikTok" className="p-1.5 rounded bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors"><Video className="h-3.5 w-3.5" /></span>
              <span title="Facebook" className="p-1.5 rounded bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 transition-colors"><Facebook className="h-3.5 w-3.5" /></span>
              <span title="Threads" className="p-1.5 rounded bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"><AtSign className="h-3.5 w-3.5" /></span>
              <span title="Pinterest" className="p-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"><Pin className="h-3.5 w-3.5" /></span>
              <span title="LinkedIn" className="p-1.5 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"><Linkedin className="h-3.5 w-3.5" /></span>
            </div>
          </div>

          {/* Quick Action & User Mobile Logout */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {user && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (window.confirm("Are you sure you want to exit your session?")) {
                    logout();
                  }
                }}
                className="sm:hidden px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5 text-rose-400" />
                <span>Exit</span>
              </button>
            )}

            <button
              onClick={onQuickStart}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Zap className="h-4 w-4 text-slate-950 fill-slate-950" />
              <span>Generate Viral Campaign</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="mt-4 flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-t border-slate-800/80 pt-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isAdminTab = tab.id === 'admin';
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? isAdminTab
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 font-bold'
                      : 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                    : isAdminTab
                    ? 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? (isAdminTab ? 'text-white' : 'text-slate-950') : isAdminTab ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-slate-950/20 text-slate-950 font-bold'
                      : isAdminTab
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export const ViralHeader = Header;
